const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { getDb, saveDb } = require('./db');

const router = express.Router();
const JWT_SECRET = 'super-secret-key-for-edufees-12345'; // In production, use env variable

// Middleware to verify JWT
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
};

// --- AUTH ROUTES ---
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const db = await getDb();
  const user = db.users.find(u => u.email === email);
  if (!user) return res.status(401).json({ success: false, error: 'Invalid email or password' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ success: false, error: 'Invalid email or password' });

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ success: true, token, user: { name: user.name, email: user.email, role: user.role } });
});

router.get('/me', authMiddleware, async (req, res) => {
  const db = await getDb();
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ success: false, error: 'User not found' });
  res.json({ success: true, user: { name: user.name, email: user.email, role: user.role, tuitionName: user.tuitionName } });
});

// --- STUDENTS API ---
router.get('/students', authMiddleware, async (req, res) => {
  const db = await getDb();
  let list = db.students;
  if (req.query.search) {
    const s = req.query.search.toLowerCase();
    list = list.filter(item => item.name.toLowerCase().includes(s) || item.studentId.toLowerCase().includes(s) || item.whatsappNumber.includes(s));
  }
  if (req.query.className) list = list.filter(item => item.class === req.query.className);
  if (req.query.batch) list = list.filter(item => item.batch === req.query.batch);
  res.json(list);
});

router.get('/students/:id', authMiddleware, async (req, res) => {
  const db = await getDb();
  const student = db.students.find(s => s._id === req.params.id);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  
  const studentFees = db.fees.filter(f => f.studentId === req.params.id);
  const totalDues = studentFees.reduce((sum, f) => sum + f.dueAmount, 0);

  let attended = 0, total = 0;
  db.attendance.forEach(sheet => {
    const record = sheet.records.find(r => r.studentId === req.params.id);
    if (record) {
      total++;
      if (record.status === 'Present') attended++;
    }
  });
  const attendancePercentage = total > 0 ? Math.round((attended / total) * 100) : 100;

  res.json({ student, feeSummary: { totalDues, records: studentFees }, attendanceSummary: { attendancePercentage, totalClasses: total, presentClasses: attended } });
});

router.post('/students', authMiddleware, async (req, res) => {
  const db = await getDb();
  const data = req.body;
  if (db.students.some(s => s.studentId === data.studentId)) return res.status(400).json({ error: 'Student ID already exists' });
  
  data._id = 'student_' + Date.now();
  if (typeof data.subjects === 'string') data.subjects = data.subjects.split(',').map(s => s.trim());
  db.students.push(data);

  // Auto invoice logic simplified
  const batch = db.batches.find(b => b.name === data.batch);
  const price = batch ? parseFloat(batch.price || 0) : 1500;
  const admissionDate = new Date(data.admissionDate || new Date());
  
  db.fees.push({
    _id: 'fee_' + Date.now() + '_1',
    studentId: data._id,
    feeType: 'Admission Fee',
    billingPeriod: admissionDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    totalAmount: price,
    discount: 0,
    fine: 0,
    netAmount: price,
    paidAmount: 0,
    dueAmount: price,
    status: 'Unpaid',
    dueDate: admissionDate.toISOString(),
    paymentHistory: []
  });

  await saveDb();
  res.json(data);
});

router.delete('/students/:id', authMiddleware, async (req, res) => {
  const db = await getDb();
  const index = db.students.findIndex(s => s._id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Student not found' });
  db.students.splice(index, 1);
  // Remove related fees to clean up
  db.fees = db.fees.filter(f => f.studentId !== req.params.id);
  await saveDb();
  res.json({ success: true });
});

// --- FEES API ---
router.get('/fees', authMiddleware, async (req, res) => {
  const db = await getDb();
  let enriched = db.fees.map(f => ({ ...f, student: db.students.find(s => s._id === f.studentId) }));
  if (req.query.batch && req.query.batch !== 'All Batches') enriched = enriched.filter(f => f.student?.batch === req.query.batch);
  if (req.query.className && req.query.className !== 'All Classes') enriched = enriched.filter(f => f.student?.class === req.query.className);
  res.json(enriched);
});

router.post('/fees/:id/pay', authMiddleware, async (req, res) => {
  const db = await getDb();
  const fee = db.fees.find(f => f._id === req.params.id);
  if (!fee) return res.status(404).json({ error: 'Fee not found' });
  const { amount, method, remarks } = req.body;
  const amt = parseFloat(amount);
  fee.paidAmount += amt;
  fee.dueAmount = Math.max(0, fee.netAmount - fee.paidAmount);
  fee.status = fee.dueAmount <= 0 ? 'Paid' : 'Partial';
  fee.paymentHistory.push({
    _id: 'pay_' + Date.now(),
    amountPaid: amt,
    paymentDate: new Date().toISOString(),
    paymentMethod: method,
    transactionId: 'TXN' + Math.floor(Math.random()*1000000000),
    remarks
  });
  await saveDb();
  res.json({ success: true });
});

// --- BATCHES API ---
router.get('/batches', authMiddleware, async (req, res) => {
  const db = await getDb();
  res.json(db.batches);
});
router.post('/batches', authMiddleware, async (req, res) => {
  const db = await getDb();
  const data = req.body;
  data._id = 'batch_' + Date.now();
  db.batches.push(data);
  await saveDb();
  res.json(data);
});

// --- CLASSES API ---
router.get('/classes', authMiddleware, async (req, res) => {
  const db = await getDb();
  res.json(db.classes);
});

router.post('/classes', authMiddleware, async (req, res) => {
  const db = await getDb();
  const data = req.body;
  if (!db.classes.find(c => c.name === data.name)) {
    data._id = 'class_' + Date.now();
    db.classes.push(data);
    await saveDb();
  }
  res.json(data);
});

// --- SETTINGS API ---
router.get('/settings/whatsapp', authMiddleware, async (req, res) => {
  const db = await getDb();
  res.json(db.settings.whatsapp);
});
router.get('/settings/profile', authMiddleware, async (req, res) => {
  const db = await getDb();
  res.json(db.settings.profile);
});

// --- ATTENDANCE API ---
router.get('/attendance', authMiddleware, async (req, res) => {
  const db = await getDb();
  const { date, className, batch } = req.query;
  
  let filteredStudents = db.students;
  if (batch && batch !== 'All Batches') {
    filteredStudents = db.students.filter(s => s.class === className && s.batch === batch);
  } else if (className) {
    filteredStudents = db.students.filter(s => s.class === className);
  }

  let sheet = db.attendance.find(s => s.date === date && s.class === className && s.batch === batch);
  let records = [];

  if (sheet) {
    records = sheet.records;
  } else {
    records = filteredStudents.map(s => ({ studentId: s._id, status: 'Present' }));
  }

  // Populate student info
  const populatedRecords = records.map(r => {
    const student = db.students.find(s => s._id === r.studentId);
    let totalAttempts = 0, presentCount = 0;
    db.attendance.forEach(attRecord => {
      if (attRecord.class === className && (batch === 'All Batches' || attRecord.batch === batch)) {
        const studentRec = attRecord.records.find(sr => sr.studentId === r.studentId);
        if (studentRec) {
          totalAttempts++;
          if (studentRec.status === 'Present') presentCount++;
        }
      }
    });

    return {
      ...r,
      student,
      stats: {
        total: totalAttempts,
        present: presentCount,
        percent: totalAttempts > 0 ? Math.round((presentCount / totalAttempts) * 100) : 100
      }
    };
  });

  res.json({ date, class: className, batch, records: populatedRecords });
});

router.post('/attendance', authMiddleware, async (req, res) => {
  const db = await getDb();
  const attendanceData = req.body;
  
  const index = db.attendance.findIndex(s => 
    s.date === attendanceData.date && 
    s.class === attendanceData.class && 
    s.batch === attendanceData.batch
  );

  const cleanedRecords = (attendanceData.records || []).map(r => ({
    studentId: r.student,
    status: r.status
  }));

  const sheet = {
    _id: index !== -1 ? db.attendance[index]._id : 'att_' + Date.now(),
    date: attendanceData.date,
    class: attendanceData.class,
    batch: attendanceData.batch,
    records: cleanedRecords
  };

  if (index !== -1) {
    db.attendance[index] = sheet;
  } else {
    db.attendance.push(sheet);
  }

  await saveDb();
  res.json({ success: true });
});

// Export router
module.exports = router;
