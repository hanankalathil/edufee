const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_FILE = path.join(__dirname, 'data.json');

let dbCache = null;

async function getDb() {
  if (dbCache) return dbCache;
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    dbCache = JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      dbCache = await initializeMockDB();
      await saveDb();
    } else {
      throw err;
    }
  }
  return dbCache;
}

async function saveDb() {
  if (!dbCache) return;
  await fs.writeFile(DATA_FILE, JSON.stringify(dbCache, null, 2), 'utf8');
}

async function initializeMockDB() {
  const defaultPassword = await bcrypt.hash('admin123', 10);
  const data = {
    users: [
      { id: 'admin1', name: 'Techora Admin', email: 'admin@techora.in', password: defaultPassword, role: 'Super Admin', tuitionName: 'Techora Academy' }
    ],
    classes: [
      { _id: "class_1", name: "Class 1", subjects: ["Mathematics", "English", "EVS"] },
      { _id: "class_10", name: "Class 10", subjects: ["Mathematics", "Science", "History", "Geography"] }
    ],
    students: [
      {
        _id: "student1",
        studentId: "STU101",
        name: "Aarav Mehta",
        parentName: "Sanjay Mehta",
        whatsappNumber: "919876543210",
        address: "102, Blue Heights, MG Road, Mumbai",
        school: "St. Xavier High School",
        class: "Class 10",
        batch: "Morning A",
        subjects: ["Physics", "Chemistry", "Mathematics"],
        admissionDate: "2026-06-01T00:00:00.000Z"
      }
    ],
    batches: [
      {
        _id: "batch1",
        name: "Morning A",
        class: "Class 10",
        timing: "08:00 AM - 10:00 AM",
        price: 1500,
        subjects: ["Mathematics", "Physics", "Chemistry", "Biology", "English"]
      }
    ],
    fees: [
      {
        _id: "fee1",
        studentId: "student1",
        feeType: "Monthly Tuition",
        billingPeriod: "July 2026",
        totalAmount: 3000,
        discount: 200,
        fine: 0,
        netAmount: 2800,
        paidAmount: 2800,
        dueAmount: 0,
        status: "Paid",
        dueDate: "2026-08-02T00:00:00.000Z",
        paymentHistory: [
          {
            _id: "pay1_1",
            amountPaid: 2800,
            paymentDate: "2026-07-08T10:00:00.000Z",
            paymentMethod: "UPI",
            transactionId: "TXN123456789",
            remarks: "Monthly fee"
          }
        ]
      }
    ],
    attendance: [
      {
        _id: "att1",
        date: "2026-07-17",
        class: "Class 10",
        batch: "Morning A",
        records: [
          { studentId: "student1", status: "Present" }
        ]
      }
    ],
    queue: [],
    timetable: [],
    tests: [],
    settings: {
      whatsapp: {
        manualEnabled: true,
        autoEnabled: false,
        delayMinutes: 1,
        reminderDays: 2,
        language: "English"
      },
      profile: {
        tuitionName: "Techora Academy",
        phone: "+91 99999 88888",
        email: "info@techora.in",
        address: "101, Education Hub, Bangalore, India",
        academicYear: "2026-27"
      }
    }
  };
  return data;
}

module.exports = {
  getDb,
  saveDb
};
