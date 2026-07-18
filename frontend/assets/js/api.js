// Custom Styled Alert Implementation
window.alert = function(message) {
  // Remove any existing active alerts
  const activeAlert = document.getElementById('custom-alert-overlay');
  if (activeAlert) {
    activeAlert.remove();
  }

  // Create overlay container
  const overlay = document.createElement('div');
  overlay.id = 'custom-alert-overlay';
  overlay.className = 'custom-alert-overlay';

  // Create alert card dialog
  const dialog = document.createElement('div');
  dialog.className = 'custom-alert-dialog';

  // Choose style and icon based on message content
  let type = 'info';
  let iconSvg = `
    <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  `;

  const msgLower = message.toLowerCase();
  if (msgLower.includes('success') || msgLower.includes('save') || msgLower.includes('update') || msgLower.includes('post') || msgLower.includes('download')) {
    type = 'success';
    iconSvg = `
      <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    `;
  } else if (msgLower.includes('error') || msgLower.includes('failed') || msgLower.includes('invalid') || msgLower.includes('not found') || msgLower.includes('no student')) {
    type = 'error';
    iconSvg = `
      <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    `;
  }

  // Populate dialog content
  dialog.innerHTML = `
    <div class="custom-alert-icon-container ${type}">
      ${iconSvg}
    </div>
    <div class="custom-alert-message">${message.replace(/\n/g, '<br>')}</div>
    <div class="custom-alert-actions">
      <button class="custom-alert-button" id="custom-alert-ok-btn">OK</button>
    </div>
  `;

  overlay.appendChild(dialog);
  document.body.appendChild(overlay);

  // Trigger animations
  setTimeout(() => {
    overlay.classList.add('active');
    dialog.classList.add('active');
  }, 10);

  const okBtn = dialog.querySelector('#custom-alert-ok-btn');
  okBtn.focus();

  const closeAlert = () => {
    overlay.classList.remove('active');
    dialog.classList.remove('active');
    setTimeout(() => {
      overlay.remove();
    }, 250);
  };

  okBtn.onclick = closeAlert;

  // Handle Enter / Escape keys to dismiss
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      e.preventDefault();
      closeAlert();
      window.removeEventListener('keydown', handleKeyDown);
    }
  };
  window.addEventListener('keydown', handleKeyDown);
};

// Custom Styled Confirm Implementation
window.confirm = function(message) {
  return new Promise((resolve) => {
    // Remove any existing active confirms/alerts
    const activeConfirm = document.getElementById('custom-confirm-overlay');
    if (activeConfirm) {
      activeConfirm.remove();
    }

    // Create overlay container
    const overlay = document.createElement('div');
    overlay.id = 'custom-confirm-overlay';
    overlay.className = 'custom-alert-overlay';

    // Create confirm card dialog
    const dialog = document.createElement('div');
    dialog.className = 'custom-alert-dialog';

    // Warning icon
    const iconSvg = `
      <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    `;

    // Populate dialog content with secondary cancel button and primary action button
    dialog.innerHTML = `
      <div class="custom-alert-icon-container error" style="background-color: rgba(245, 158, 11, 0.1); color: #f59e0b;">
        ${iconSvg}
      </div>
      <div class="custom-alert-message">${message.replace(/\n/g, '<br>')}</div>
      <div class="custom-alert-actions" style="display: flex; gap: 12px; justify-content: center; width: 100%;">
        <button class="custom-alert-button" id="custom-confirm-cancel-btn" style="background: var(--border-color); color: var(--text-main); box-shadow: none;">Cancel</button>
        <button class="custom-alert-button" id="custom-confirm-ok-btn">OK</button>
      </div>
    `;

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    // Trigger animations
    setTimeout(() => {
      overlay.classList.add('active');
      dialog.classList.add('active');
    }, 10);

    const okBtn = dialog.querySelector('#custom-confirm-ok-btn');
    const cancelBtn = dialog.querySelector('#custom-confirm-cancel-btn');
    okBtn.focus();

    const closeConfirm = (result) => {
      overlay.classList.remove('active');
      dialog.classList.remove('active');
      setTimeout(() => {
        overlay.remove();
      }, 250);
      resolve(result);
    };

    okBtn.onclick = () => closeConfirm(true);
    cancelBtn.onclick = () => closeConfirm(false);

    // Handle Enter / Escape keys to dismiss/resolve
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        closeConfirm(true);
        window.removeEventListener('keydown', handleKeyDown);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeConfirm(false);
        window.removeEventListener('keydown', handleKeyDown);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
  });
};

// Mock Database Initialization & API Client
const getLocalStorageJson = (key, defaultVal) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultVal;
};


const setLocalStorageJson = (key, val) => {
  localStorage.setItem(key, JSON.stringify(val));
};

// Initialize Mock Data if it doesn't exist
const initializeMockDB = () => {
  if (!localStorage.getItem('students')) {
    const defaultStudents = [
      {
        _id: "student1",
        studentId: "STU101",
        name: "Aarav Mehta",
        photo: "",
        parentName: "Sanjay Mehta",
        whatsappNumber: "919876543210",
        address: "102, Blue Heights, MG Road, Mumbai",
        school: "St. Xavier High School",
        class: "Class 10",
        batch: "Morning A",
        subjects: ["Physics", "Chemistry", "Mathematics"],
        admissionDate: "2026-06-01T00:00:00.000Z"
      },
      {
        _id: "student2",
        studentId: "STU102",
        name: "Isha Sharma",
        photo: "",
        parentName: "Vikram Sharma",
        whatsappNumber: "919876543211",
        address: "405, Valley Towers, Pune",
        school: "Delhi Public School",
        class: "Plus Two Science",
        batch: "Evening B",
        subjects: ["Mathematics", "Computer Science"],
        admissionDate: "2026-06-05T00:00:00.000Z"
      },
      {
        _id: "student3",
        studentId: "STU103",
        name: "Rohan Das",
        photo: "",
        parentName: "Alok Das",
        whatsappNumber: "919876543212",
        address: "12, Green Park Lane, Kolkata",
        school: "Don Bosco School",
        class: "Class 9",
        batch: "Morning A",
        subjects: ["Science", "English"],
        admissionDate: "2026-06-10T00:00:00.000Z"
      },
      {
        _id: "student4",
        studentId: "STU104",
        name: "Ananya Iyer",
        photo: "",
        parentName: "Ramesh Iyer",
        whatsappNumber: "919876543213",
        address: "7B, Lotus Residency, Chennai",
        school: "National Public School",
        class: "Plus One Science",
        batch: "Evening B",
        subjects: ["Physics", "Mathematics"],
        admissionDate: "2026-06-15T00:00:00.000Z"
      },
      {
        _id: "student5",
        studentId: "STU105",
        name: "Kabir Singh",
        photo: "",
        parentName: "Harpreet Singh",
        whatsappNumber: "919876543214",
        address: "Sector 15, HUDA, Gurugram",
        school: "Ryan International",
        class: "Class 10",
        batch: "Weekend Special",
        subjects: ["Mathematics", "Science"],
        admissionDate: "2026-06-20T00:00:00.000Z"
      }
    ];
    setLocalStorageJson('students', defaultStudents);
  }

  if (!localStorage.getItem('fees')) {
    const defaultFees = [
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
        dueDate: "2026-07-10T00:00:00.000Z",
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
      },
      {
        _id: "fee2",
        studentId: "student2",
        feeType: "Monthly Tuition",
        billingPeriod: "July 2026",
        totalAmount: 4000,
        discount: 0,
        fine: 100,
        netAmount: 4100,
        paidAmount: 2000,
        dueAmount: 2100,
        status: "Partial",
        dueDate: "2026-07-10T00:00:00.000Z",
        paymentHistory: [
          {
            _id: "pay2_1",
            amountPaid: 2000,
            paymentDate: "2026-07-12T14:30:00.000Z",
            paymentMethod: "Cash",
            transactionId: "CSH-98721",
            remarks: "Half payment"
          }
        ]
      },
      {
        _id: "fee3",
        studentId: "student3",
        feeType: "Monthly Tuition",
        billingPeriod: "July 2026",
        totalAmount: 2500,
        discount: 0,
        fine: 150,
        netAmount: 2650,
        paidAmount: 0,
        dueAmount: 2650,
        status: "Overdue",
        dueDate: "2026-07-05T00:00:00.000Z",
        paymentHistory: []
      },
      {
        _id: "fee4",
        studentId: "student4",
        feeType: "Admission Fee",
        billingPeriod: "June 2026",
        totalAmount: 5000,
        discount: 500,
        fine: 0,
        netAmount: 4500,
        paidAmount: 4500,
        dueAmount: 0,
        status: "Paid",
        dueDate: "2026-06-20T00:00:00.000Z",
        paymentHistory: [
          {
            _id: "pay4_1",
            amountPaid: 4500,
            paymentDate: "2026-06-18T11:15:00.000Z",
            paymentMethod: "Bank Transfer",
            transactionId: "IMPS89234723",
            remarks: "Admission + Registration"
          }
        ]
      },
      {
        _id: "fee5",
        studentId: "student5",
        feeType: "Monthly Tuition",
        billingPeriod: "July 2026",
        totalAmount: 3000,
        discount: 0,
        fine: 0,
        netAmount: 3000,
        paidAmount: 0,
        dueAmount: 3000,
        status: "Pending",
        dueDate: "2026-07-25T00:00:00.000Z",
        paymentHistory: []
      }
    ];
    setLocalStorageJson('fees', defaultFees);
  }

  if (!localStorage.getItem('whatsappSettings')) {
    setLocalStorageJson('whatsappSettings', {
      manualEnabled: true,
      autoEnabled: false,
      delayMinutes: 1,
      reminderDays: 2,
      language: "English",
      template: "Hello {{parentName}},\n\nThis is a reminder from {{tuitionCenter}}.\n\nStudent: {{studentName}}\nClass: {{class}}\nPending fee: ₹{{amount}}\nDue date: {{dueDate}}\n\nPlease complete the payment.\n\nThank you.",
      groupShareEnabled: true,
      groupLinkOrPhone: "https://chat.whatsapp.com/K3t8yS2dK9o8Jp3s8Fm1bC",
      attendanceTemplate: "*Attendance Report*\nDate: {{date}}\nClass: {{class}}\nBatch: {{batch}}\n---------------------------\nTotal Students: {{total}}\nPresent: {{present}} ({{presentPercent}}%)\nAbsent: {{absent}}\n\n*Absentees:* {{absentsList}}"
    });
  }

  if (!localStorage.getItem('notifications')) {
    setLocalStorageJson('notifications', [
      { id: "notif1", type: "fee", title: "Fee Overdue", text: "Rohan Das's fee is overdue by 13 days.", read: false, time: "2 hours ago" },
      { id: "notif2", type: "admission", title: "New Admission", text: "Kabir Singh has registered for Weekend Special.", read: false, time: "1 day ago" },
      { id: "notif3", type: "alert", title: "Low Attendance Alert", text: "Isha Sharma attended less than 75% classes this month.", read: true, time: "2 days ago" },
      { id: "notif4", type: "birthday", title: "Birthday", text: "Happy birthday to Aarav Mehta!", read: true, time: "3 days ago" }
    ]);
  }

  if (!localStorage.getItem('attendance')) {
    setLocalStorageJson('attendance', [
      {
        _id: "att1",
        date: "2026-07-17",
        class: "Class 10",
        batch: "Morning A",
        records: [
          { studentId: "student1", status: "Present" },
          { studentId: "student3", status: "Absent" }
        ]
      },
      {
        _id: "att2",
        date: "2026-07-16",
        class: "Class 10",
        batch: "Morning A",
        records: [
          { studentId: "student1", status: "Present" },
          { studentId: "student3", status: "Present" }
        ]
      }
    ]);
  }

  if (!localStorage.getItem('queue') || JSON.parse(localStorage.getItem('queue') || '[]').length < 3) {
    setLocalStorageJson('queue', [
      { id: "q1", studentName: "Rohan Das", parentNumber: "919876543212", amount: 2650, dueDate: "2026-07-05", status: "Pending", time: "Scheduled" },
      { id: "q2", studentName: "Isha Sharma", parentNumber: "919876543211", amount: 2100, dueDate: "2026-07-10", status: "Pending", time: "Scheduled" },
      { id: "q3", studentName: "Kabir Singh", parentNumber: "919876543214", amount: 3000, dueDate: "2026-07-25", status: "Pending", time: "Scheduled" }
    ]);
  }

  if (!localStorage.getItem('profileSettings')) {
    setLocalStorageJson('profileSettings', {
      tuitionName: "Techora Academy",
      logo: "",
      phone: "+91 99999 88888",
      email: "info@techora.in",
      address: "101, Education Hub, Bangalore, India",
      academicYear: "2026-27"
    });
  }

  if (!localStorage.getItem('batches')) {
    setLocalStorageJson('batches', [
      {
        _id: "batch1",
        name: "Morning A",
        class: "Class 8, Class 9, Class 10",
        timing: "08:00 AM - 10:00 AM"
      },
      {
        _id: "batch2",
        name: "Evening B",
        class: "Plus One Science, Plus Two Science",
        timing: "04:00 PM - 06:00 PM"
      },
      {
        _id: "batch3",
        name: "Weekend Special",
        class: "All Classes",
        timing: "09:00 AM - 01:00 PM"
      }
    ]);
  }

  if (!localStorage.getItem('timetable')) {
    setLocalStorageJson('timetable', [
      {
        _id: "t1",
        subject: "Mathematics",
        batchId: "batch1",
        batchName: "Morning A",
        teacher: "Prof. Verma",
        day: "Monday",
        startTime: "08:00",
        endTime: "09:30",
        room: "Room 101"
      },
      {
        _id: "t2",
        subject: "Physics",
        batchId: "batch1",
        batchName: "Morning A",
        teacher: "Dr. Sharma",
        day: "Wednesday",
        startTime: "08:00",
        endTime: "09:30",
        room: "Room 101"
      },
      {
        _id: "t3",
        subject: "Chemistry",
        batchId: "batch2",
        batchName: "Evening B",
        teacher: "Ms. Iyer",
        day: "Tuesday",
        startTime: "16:00",
        endTime: "17:30",
        room: "Lab B"
      }
    ]);
  }

  if (!localStorage.getItem('timetableSettings')) {
    setLocalStorageJson('timetableSettings', {
      autoBroadcast: false,
      groupName: "Techora Tuitions Group",
      groupLink: "https://chat.whatsapp.com/ExampleInviteLink"
    });
  }

  // Migrate old Class 11 and Class 12 to Plus One Science and Plus Two Science
  const storedStudents = getLocalStorageJson('students', []);
  let studentsUpdated = false;
  storedStudents.forEach(s => {
    if (s.class === 'Class 11') { s.class = 'Plus One Science'; studentsUpdated = true; }
    if (s.class === 'Class 12') { s.class = 'Plus Two Science'; studentsUpdated = true; }
  });
  if (studentsUpdated) setLocalStorageJson('students', storedStudents);

  const storedBatches = getLocalStorageJson('batches', []);
  let batchesUpdated = false;
  storedBatches.forEach(b => {
    if (b.class && b.class.includes('Class 11')) {
      b.class = b.class.replace(/Class 11/g, 'Plus One Science');
      batchesUpdated = true;
    }
    if (b.class && b.class.includes('Class 12')) {
      b.class = b.class.replace(/Class 12/g, 'Plus Two Science');
      batchesUpdated = true;
    }
  });
  if (batchesUpdated) setLocalStorageJson('batches', storedBatches);
};

// Execute DB initialization
initializeMockDB();

// Mock API Methods
const api = {
  getToken: () => sessionStorage.getItem('token') || localStorage.getItem('token'),
  setToken: (token, remember = false) => {
    if (remember) {
      localStorage.setItem('token', token);
    } else {
      sessionStorage.setItem('token', token);
    }
  },
  clearToken: () => {
    sessionStorage.removeItem('token');
    localStorage.removeItem('token');
  },
  getUser: () => {
    return { name: "Admin User", email: "admin@techora.in", role: "Super Admin" };
  },

  // Auth
  login: async (email, password) => {
    if (email === 'admin@techora.in' && password === 'admin123') {
      const token = "mock_jwt_token_header_payload_signature";
      api.setToken(token, document.getElementById('remember-me')?.checked);
      return { success: true };
    }
    throw new Error('Invalid email or password');
  },

  // Students CRUD
  getStudents: async (filters = {}) => {
    let list = getLocalStorageJson('students', []);
    if (filters.search) {
      const s = filters.search.toLowerCase();
      list = list.filter(item => 
        item.name.toLowerCase().includes(s) || 
        item.studentId.toLowerCase().includes(s) || 
        item.whatsappNumber.includes(s)
      );
    }
    if (filters.className) {
      list = list.filter(item => item.class === filters.className);
    }
    if (filters.batch) {
      list = list.filter(item => item.batch === filters.batch);
    }
    return list;
  },

  getStudent: async (id) => {
    const list = getLocalStorageJson('students', []);
    const student = list.find(s => s._id === id);
    if (!student) throw new Error('Student not found');
    
    // Compute related fees & attendance
    const feesList = getLocalStorageJson('fees', []);
    const studentFees = feesList.filter(f => f.studentId === id);
    const totalDues = studentFees.reduce((sum, f) => sum + f.dueAmount, 0);

    const attList = getLocalStorageJson('attendance', []);
    let attended = 0;
    let total = 0;
    attList.forEach(sheet => {
      const record = sheet.records.find(r => r.studentId === id);
      if (record) {
        total++;
        if (record.status === 'Present') attended++;
      }
    });

    const attendancePercentage = total > 0 ? Math.round((attended / total) * 100) : 100;

    return {
      student,
      feeSummary: {
        totalDues,
        records: studentFees
      },
      attendanceSummary: {
        attendancePercentage,
        totalClasses: total,
        presentClasses: attended
      }
    };
  },

  createStudent: async (formData) => {
    const list = getLocalStorageJson('students', []);
    
    // Convert formData to object
    const studentData = {};
    formData.forEach((value, key) => {
      studentData[key] = value;
    });

    // Check unique ID
    if (list.some(s => s.studentId === studentData.studentId)) {
      throw new Error('Student ID already exists');
    }

    const newStudent = {
      _id: 'student_' + Date.now(),
      studentId: studentData.studentId,
      name: studentData.name,
      parentName: studentData.parentName,
      whatsappNumber: studentData.whatsappNumber,
      address: studentData.address,
      school: studentData.school,
      class: studentData.class,
      batch: studentData.batch,
      subjects: studentData.subjects ? studentData.subjects.split(',').map(s => s.trim()) : [],
      photo: '', // In mock we will leave empty or fill with default placeholder
      admissionDate: studentData.admissionDate || new Date().toISOString()
    };

    list.push(newStudent);
    setLocalStorageJson('students', list);
    return newStudent;
  },

  updateStudent: async (id, formData) => {
    const list = getLocalStorageJson('students', []);
    const index = list.findIndex(s => s._id === id);
    if (index === -1) throw new Error('Student not found');

    const studentData = {};
    formData.forEach((value, key) => {
      studentData[key] = value;
    });

    list[index] = {
      ...list[index],
      name: studentData.name || list[index].name,
      parentName: studentData.parentName || list[index].parentName,
      whatsappNumber: studentData.whatsappNumber || list[index].whatsappNumber,
      address: studentData.address || list[index].address,
      school: studentData.school || list[index].school,
      class: studentData.class || list[index].class,
      batch: studentData.batch || list[index].batch,
      subjects: studentData.subjects ? studentData.subjects.split(',').map(s => s.trim()) : list[index].subjects
    };

    setLocalStorageJson('students', list);
    return list[index];
  },

  deleteStudent: async (id) => {
    let list = getLocalStorageJson('students', []);
    list = list.filter(s => s._id !== id);
    setLocalStorageJson('students', list);

    // Delete student fees
    let fees = getLocalStorageJson('fees', []);
    fees = fees.filter(f => f.studentId !== id);
    setLocalStorageJson('fees', fees);
  },

  // Batches
  getBatches: async () => {
    return getLocalStorageJson('batches', []);
  },

  createBatch: async (batchData) => {
    const list = getLocalStorageJson('batches', []);
    if (list.some(b => b.name.toLowerCase() === batchData.name.toLowerCase())) {
      throw new Error('Batch name already exists');
    }
    const newBatch = {
      _id: 'batch_' + Date.now(),
      name: batchData.name,
      class: batchData.class,
      timing: batchData.timing,
      whatsappGroup: batchData.whatsappGroup || ''
    };
    list.push(newBatch);
    setLocalStorageJson('batches', list);
    return newBatch;
  },

  updateBatch: async (id, batchData) => {
    const list = getLocalStorageJson('batches', []);
    const index = list.findIndex(b => b._id === id);
    if (index === -1) throw new Error('Batch not found');
    
    // Check uniqueness if name changed
    if (list.some(b => b._id !== id && b.name.toLowerCase() === batchData.name.toLowerCase())) {
      throw new Error('Batch name already exists');
    }

    list[index] = {
      ...list[index],
      name: batchData.name,
      class: batchData.class,
      timing: batchData.timing,
      whatsappGroup: batchData.whatsappGroup || ''
    };
    setLocalStorageJson('batches', list);
    return list[index];
  },

  deleteBatch: async (id) => {
    const list = getLocalStorageJson('batches', []);
    const batch = list.find(b => b._id === id);
    if (!batch) throw new Error('Batch not found');

    // Prevent deletion if students are assigned to this batch
    const students = getLocalStorageJson('students', []);
    const hasStudents = students.some(s => s.batch === batch.name);
    if (hasStudents) {
      throw new Error(`Cannot delete batch "${batch.name}" as there are active students enrolled in it.`);
    }

    const filtered = list.filter(b => b._id !== id);
    setLocalStorageJson('batches', filtered);
  },

  // Timetable
  getTimetable: async () => {
    return getLocalStorageJson('timetable', []);
  },

  saveTimetableSlot: async (slotData) => {
    const list = getLocalStorageJson('timetable', []);
    const batches = getLocalStorageJson('batches', []);
    const batch = batches.find(b => b._id === slotData.batchId);
    const batchName = batch ? batch.name : 'Unknown';

    if (slotData._id) {
      const idx = list.findIndex(s => s._id === slotData._id);
      if (idx !== -1) {
        list[idx] = {
          ...list[idx],
          subject: slotData.subject,
          batchId: slotData.batchId,
          batchName: batchName,
          teacher: slotData.teacher,
          day: slotData.day,
          startTime: slotData.startTime,
          endTime: slotData.endTime,
          room: slotData.room
        };
        setLocalStorageJson('timetable', list);
        return list[idx];
      }
    }

    const newSlot = {
      _id: 'slot_' + Date.now(),
      subject: slotData.subject,
      batchId: slotData.batchId,
      batchName: batchName,
      teacher: slotData.teacher,
      day: slotData.day,
      startTime: slotData.startTime,
      endTime: slotData.endTime,
      room: slotData.room
    };
    list.push(newSlot);
    setLocalStorageJson('timetable', list);
    return newSlot;
  },

  deleteTimetableSlot: async (id) => {
    const list = getLocalStorageJson('timetable', []);
    const filtered = list.filter(s => s._id !== id);
    setLocalStorageJson('timetable', filtered);
  },

  getTimetableSettings: async () => {
    return getLocalStorageJson('timetableSettings', {
      autoBroadcast: false,
      groupName: "Techora Tuitions Group",
      groupLink: "https://chat.whatsapp.com/ExampleInviteLink"
    });
  },

  saveTimetableSettings: async (settings) => {
    setLocalStorageJson('timetableSettings', settings);
    return settings;
  },

  // Fees
  getFees: async (filters = {}) => {
    const fees = getLocalStorageJson('fees', []);
    const students = getLocalStorageJson('students', []);

    // Merge student info
    const enriched = fees.map(f => {
      const student = students.find(s => s._id === f.studentId);
      return { ...f, student };
    });

    if (filters.search) {
      const s = filters.search.toLowerCase();
      return enriched.filter(f => 
        (f.student && f.student.name.toLowerCase().includes(s)) ||
        (f.student && f.student.studentId && f.student.studentId.toLowerCase().includes(s)) ||
        (f.student && f.student.parentName && f.student.parentName.toLowerCase().includes(s)) ||
        (f._id && f._id.toLowerCase().includes(s)) ||
        f.billingPeriod.toLowerCase().includes(s) ||
        f.feeType.toLowerCase().includes(s)
      );
    }

    return enriched;
  },

  createFee: async (feeData) => {
    const fees = getLocalStorageJson('fees', []);
    const net = parseFloat(feeData.totalAmount) - parseFloat(feeData.discount || 0) + parseFloat(feeData.fine || 0);
    const newFee = {
      _id: 'fee_' + Date.now(),
      studentId: feeData.studentId,
      feeType: feeData.feeType,
      billingPeriod: feeData.billingPeriod,
      totalAmount: parseFloat(feeData.totalAmount),
      discount: parseFloat(feeData.discount || 0),
      fine: parseFloat(feeData.fine || 0),
      netAmount: net,
      paidAmount: 0,
      dueAmount: net,
      status: 'Unpaid',
      dueDate: new Date(feeData.dueDate).toISOString(),
      paymentHistory: []
    };
    fees.push(newFee);
    setLocalStorageJson('fees', fees);
    return newFee;
  },

  collectPayment: async (feeId, paymentData) => {
    const fees = getLocalStorageJson('fees', []);
    const index = fees.findIndex(f => f._id === feeId);
    if (index === -1) throw new Error('Fee record not found');

    const fee = fees[index];
    const amount = parseFloat(paymentData.amountPaid);
    
    const newPayment = {
      _id: 'pay_' + Date.now(),
      amountPaid: amount,
      paymentDate: new Date().toISOString(),
      paymentMethod: paymentData.paymentMethod,
      transactionId: paymentData.transactionId || 'TXN-' + Math.floor(Math.random() * 100000),
      remarks: paymentData.remarks
    };

    fee.paymentHistory.push(newPayment);
    fee.paidAmount += amount;
    fee.dueAmount = fee.netAmount - fee.paidAmount;
    fee.status = fee.dueAmount <= 0 ? 'Paid' : 'Partial';

    fees[index] = fee;
    setLocalStorageJson('fees', fees);
    return { fee, payment: newPayment };
  },

  downloadReceipt: async (feeId, paymentId = '') => {
    window.open(`receipt-preview.html?feeId=${feeId}&paymentId=${paymentId}`, '_blank');
  },

  // Attendance
  getAttendance: async (date, className, batch) => {
    const list = getLocalStorageJson('attendance', []);
    let sheet = list.find(s => s.date === date && s.class === className && s.batch === batch);

    const students = getLocalStorageJson('students', []);
    const filteredStudents = students.filter(s => s.class === className && s.batch === batch);

    if (!sheet) {
      const records = filteredStudents.map(s => ({
        studentId: s._id,
        status: 'Present'
      }));
      sheet = { date, class: className, batch, records };
    }

    // Populate student object and historical statistics for UI
    const populatedRecords = sheet.records.map(r => {
      const student = students.find(s => s._id === r.studentId);
      
      // Calculate attempts
      let totalAttempts = 0;
      let presentCount = 0;
      list.forEach(attRecord => {
        if (attRecord.class === className && attRecord.batch === batch) {
          const studentRec = attRecord.records.find(sr => sr.studentId === r.studentId);
          if (studentRec) {
            totalAttempts++;
            if (studentRec.status === 'Present') {
              presentCount++;
            }
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

    return { ...sheet, records: populatedRecords };
  },

  markAttendance: async (attendanceData) => {
    const list = getLocalStorageJson('attendance', []);
    const index = list.findIndex(s => 
      s.date === attendanceData.date && 
      s.class === attendanceData.class && 
      s.batch === attendanceData.batch
    );

    const cleanedRecords = attendanceData.records.map(r => ({
      studentId: r.student,
      status: r.status
    }));

    const sheet = {
      _id: index !== -1 ? list[index]._id : 'att_' + Date.now(),
      date: attendanceData.date,
      class: attendanceData.class,
      batch: attendanceData.batch,
      records: cleanedRecords
    };

    if (index !== -1) {
      list[index] = sheet;
    } else {
      list.push(sheet);
    }

    setLocalStorageJson('attendance', list);
    return sheet;
  },

  // WhatsApp
  getWhatsappSettings: async () => getLocalStorageJson('whatsappSettings', {}),
  updateWhatsappSettings: async (settings) => {
    setLocalStorageJson('whatsappSettings', settings);
    return settings;
  },
  getWhatsappStatus: async () => {
    try {
      const res = await fetch('http://localhost:5000/api/whatsapp/status');
      return await res.json();
    } catch (e) {
      return { status: 'DISCONNECTED' };
    }
  },
  getWhatsappQR: async () => {
    try {
      const res = await fetch('http://localhost:5000/api/whatsapp/qr');
      return await res.json();
    } catch (e) {
      return { error: 'Backend offline' };
    }
  },
  disconnectWhatsapp: async () => {
    try {
      const res = await fetch('http://localhost:5000/api/whatsapp/disconnect', { method: 'POST' });
      return await res.json();
    } catch (e) {
      return { error: 'Backend offline' };
    }
  },
  sendWhatsappMessage: async (phone, message) => {
    try {
      const res = await fetch('http://localhost:5000/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, message })
      });
      return await res.json();
    } catch (e) {
      return { success: false, error: e.message };
    }
  },
  getQueue: async () => {
    const queue = getLocalStorageJson('queue', []);
    return {
      queue,
      stats: {
        isPaused: localStorage.getItem('queuePaused') === 'true',
        pendingCount: queue.filter(q => q.status === 'Pending').length,
        sentCount: queue.filter(q => q.status === 'Sent').length,
        failedCount: queue.filter(q => q.status === 'Failed').length
      }
    };
  },
  postQueueAction: async (action) => {
    if (action === 'pause') {
      localStorage.setItem('queuePaused', 'true');
    } else if (action === 'resume') {
      localStorage.setItem('queuePaused', 'false');
    }
    return { success: true };
  },
  postReminderAction: async (id, action) => {
    const queue = getLocalStorageJson('queue', []);
    const idx = queue.findIndex(q => q.id === id);
    if (idx !== -1) {
      if (action === 'cancel') queue[idx].status = 'Cancelled';
      if (action === 'retry') queue[idx].status = 'Pending';
      setLocalStorageJson('queue', queue);
    }
    return { success: true };
  },
  sendManualReminder: async (studentId, feeId) => {
    const students = getLocalStorageJson('students', []);
    const fees = getLocalStorageJson('fees', []);
    const student = students.find(s => s._id === studentId);
    const fee = fees.find(f => f._id === feeId);

    const settings = getLocalStorageJson('whatsappSettings', {});
    const template = settings.template;

    const message = template
      .replace('{{parentName}}', student.parentName)
      .replace('{{tuitionCenter}}', 'Techora Academy')
      .replace('{{studentName}}', student.name)
      .replace('{{class}}', student.class)
      .replace('{{amount}}', fee.dueAmount)
      .replace('{{dueDate}}', new Date(fee.dueDate).toLocaleDateString())
      .replace('{{batch}}', student.batch);

    // Save history logs
    const queue = getLocalStorageJson('queue', []);
    queue.push({
      id: 'q_' + Date.now(),
      studentName: student.name,
      parentNumber: student.whatsappNumber,
      amount: fee.dueAmount,
      dueDate: new Date(fee.dueDate).toLocaleDateString(),
      status: 'Sent',
      time: new Date().toLocaleTimeString()
    });
    setLocalStorageJson('queue', queue);

    const whatsappLink = `https://api.whatsapp.com/send?phone=${encodeURIComponent(student.whatsappNumber)}&text=${encodeURIComponent(message)}`;
    return { whatsappLink };
  },

  // Dashboard Stats
  getDashboardStats: async () => {
    const students = getLocalStorageJson('students', []);
    const fees = getLocalStorageJson('fees', []);

    let totalCollections = 0;
    let pendingFees = 0;
    let overdueFees = 0;
    const today = new Date();

    fees.forEach(f => {
      totalCollections += f.paidAmount;
      pendingFees += f.dueAmount;
      if (f.dueAmount > 0 && new Date(f.dueDate) < today) {
        overdueFees += f.dueAmount;
      }
    });

    const recentPayments = [];
    fees.forEach(f => {
      const student = students.find(s => s._id === f.studentId);
      f.paymentHistory.forEach(p => {
        recentPayments.push({
          _id: p._id,
          feeId: f._id,
          studentName: student ? student.name : 'Unknown Student',
          amountPaid: p.amountPaid,
          paymentDate: p.paymentDate,
          paymentMethod: p.paymentMethod,
          billingPeriod: f.billingPeriod
        });
      });
    });

    recentPayments.sort((a,b) => new Date(b.paymentDate) - new Date(a.paymentDate));

    return {
      metrics: {
        totalStudents: students.length,
        totalCollections,
        pendingFees,
        overdueFees
      },
      recentPayments: recentPayments.slice(0, 5),
      revenueChart: {
        labels: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        data: [15000, 24000, 18000, 31000, 45000, totalCollections]
      }
    };
  },

  // Analytics
  getAnalyticsStats: async () => {
    const fees = getLocalStorageJson('fees', []);
    let paid = 0, partial = 0, unpaid = 0;
    fees.forEach(f => {
      if (f.status === 'Paid') paid++;
      else if (f.status === 'Partial') partial++;
      else unpaid++;
    });

    return {
      feeDistribution: { paid, partial, unpaid },
      attendanceHistory: [
        { date: '07/10', rate: 85 },
        { date: '07/12', rate: 90 },
        { date: '07/14', rate: 95 },
        { date: '07/16', rate: 80 },
        { date: '07/17', rate: 88 }
      ],
      reminderStats: {
        sentReminders: 45,
        failedReminders: 2,
        pendingReminders: 3
      }
    };
  },

  // Settings
  getSettings: async () => getLocalStorageJson('profileSettings', {}),
  updateSettings: async (formData) => {
    const settings = {};
    formData.forEach((value, key) => {
      settings[key] = value;
    });
    setLocalStorageJson('profileSettings', settings);
    return settings;
  },

  // Reports json
  getReportJson: async (type) => {
    const students = getLocalStorageJson('students', []);
    const fees = getLocalStorageJson('fees', []);
    
    if (type === 'daily' || type === 'weekly' || type === 'monthly') {
      const rows = [];
      fees.forEach(f => {
        const student = students.find(s => s._id === f.studentId);
        f.paymentHistory.forEach(p => {
          rows.push([
            new Date(p.paymentDate).toLocaleDateString(),
            student ? student.name : 'N/A',
            f.billingPeriod,
            p.amountPaid,
            p.paymentMethod
          ]);
        });
      });
      return {
        title: `${type.toUpperCase()} Revenue Statement`,
        headers: ['Date', 'Student Name', 'Billing Period', 'Amount Paid', 'Method'],
        rows
      };
    } else if (type === 'student') {
      const rows = students.map(s => {
        const studentFees = fees.filter(f => f.studentId === s._id);
        const total = studentFees.reduce((sum, f) => sum + f.netAmount, 0);
        const paid = studentFees.reduce((sum, f) => sum + f.paidAmount, 0);
        const due = studentFees.reduce((sum, f) => sum + f.dueAmount, 0);
        return [s.studentId, s.name, s.class, s.batch, total, paid, due];
      });
      return {
        title: 'Student Accounts Ledger',
        headers: ['Student ID', 'Name', 'Class', 'Batch', 'Billed Amount', 'Paid Amount', 'Due Balance'],
        rows
      };
    } else if (type === 'reminder') {
      const queue = getLocalStorageJson('queue', []);
      const rows = queue.map(q => [q.time || 'N/A', q.studentName, q.parentNumber, q.amount, q.dueDate, q.status]);
      return {
        title: 'WhatsApp Reminder Status Logs',
        headers: ['Time/Date', 'Student Name', 'Parent WhatsApp', 'Due Amount', 'Due Date', 'Status'],
        rows
      };
    }
  }
};

// Automate layout rendering on window load (Sidebar, Header, Theme, Logout)
if (!window.location.pathname.endsWith('login.html') && !window.location.pathname.endsWith('receipt-preview.html') && !window.location.pathname.endsWith('mark-attendance.html') && !window.location.pathname.endsWith('mark-attendance-list.html')) {
  if (!api.getToken()) {
    window.location.href = 'login.html';
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      renderLayout();
      if (window.initializeCustomSelects) window.initializeCustomSelects();
    });
  }
} else {
  // Run on login page or public page if any selects exist
  document.addEventListener('DOMContentLoaded', () => {
    if (window.initializeCustomSelects) window.initializeCustomSelects();
  });
}

window.initializeCustomSelects = () => {
  const selects = document.querySelectorAll('select.form-control');
  selects.forEach(select => {
    // Avoid double wrapping
    if (select.nextElementSibling && select.nextElementSibling.classList.contains('custom-select-container')) {
      const container = select.nextElementSibling;
      if (select.style.width) {
        container.style.width = select.style.width;
      }
      if (select.style.minWidth) {
        container.style.minWidth = select.style.minWidth;
      }
      const optionsContainer = container.querySelector('.custom-select-options');
      const triggerSpan = container.querySelector('.custom-select-trigger span');
      
      const selectOptions = select.querySelectorAll('option');
      optionsContainer.innerHTML = Array.from(selectOptions).map(opt => `
        <div class="custom-option ${opt.selected ? 'selected' : ''}" data-value="${opt.value}">
          ${opt.textContent}
        </div>
      `).join('');
      
      const activeOpt = select.querySelector('option:checked') || selectOptions[0];
      if (activeOpt) triggerSpan.textContent = activeOpt.textContent;
      
      // Rebind click events
      optionsContainer.querySelectorAll('.custom-option').forEach(optDiv => {
        optDiv.addEventListener('click', (e) => {
          e.stopPropagation();
          select.value = optDiv.getAttribute('data-value');
          select.dispatchEvent(new Event('change'));
          triggerSpan.textContent = optDiv.textContent;
          optionsContainer.querySelectorAll('.custom-option').forEach(d => d.classList.remove('selected'));
          optDiv.classList.add('selected');
          container.classList.remove('open');
        });
      });
      return;
    }

    select.style.display = 'none';

    const container = document.createElement('div');
    container.className = 'custom-select-container';
    if (select.style.width) {
      container.style.width = select.style.width;
    }
    if (select.style.minWidth) {
      container.style.minWidth = select.style.minWidth;
    }

    const trigger = document.createElement('div');
    trigger.className = 'custom-select-trigger';
    
    const triggerText = document.createElement('span');
    const defaultOpt = select.querySelector('option:checked') || select.firstElementChild;
    triggerText.textContent = defaultOpt ? defaultOpt.textContent : 'Select option...';
    trigger.appendChild(triggerText);
    
    const chevron = document.createElement('i');
    chevron.className = 'fa-solid fa-chevron-down';
    trigger.appendChild(chevron);
    
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'custom-select-options';

    const selectOptions = select.querySelectorAll('option');
    optionsContainer.innerHTML = Array.from(selectOptions).map(opt => `
      <div class="custom-option ${opt.selected ? 'selected' : ''}" data-value="${opt.value}">
        ${opt.textContent}
      </div>
    `).join('');

    container.appendChild(trigger);
    container.appendChild(optionsContainer);
    select.parentNode.insertBefore(container, select.nextSibling);

    // Toggle dropdown
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelectorAll('.custom-select-container').forEach(c => {
        if (c !== container) c.classList.remove('open');
      });
      container.classList.toggle('open');
    });

    // Option click
    optionsContainer.querySelectorAll('.custom-option').forEach(optDiv => {
      optDiv.addEventListener('click', (e) => {
        e.stopPropagation();
        select.value = optDiv.getAttribute('data-value');
        select.dispatchEvent(new Event('change'));
        triggerText.textContent = optDiv.textContent;
        optionsContainer.querySelectorAll('.custom-option').forEach(d => d.classList.remove('selected'));
        optDiv.classList.add('selected');
        container.classList.remove('open');
      });
    });
  });
};

document.addEventListener('click', () => {
  document.querySelectorAll('.custom-select-container').forEach(c => c.classList.remove('open'));
});

function renderLayout() {
  const user = api.getUser() || { name: 'Techora Admin', email: 'admin@techora.in', tuitionName: 'Techora Academy' };
  const currentPath = window.location.pathname;

  const sidebarContainer = document.getElementById('sidebar-container');
  if (sidebarContainer) {
    sidebarContainer.innerHTML = `
      <div class="sidebar">
        <div class="brand-section">
          <div class="brand-logo">T</div>
          <div class="brand-name">Techora <span style="color: var(--color-primary)">EduFee</span></div>
        </div>

        <ul class="nav-menu">
          <li class="nav-item ${currentPath.includes('dashboard.html') ? 'active' : ''}">
            <a href="dashboard.html"><i class="fa-solid fa-chart-pie"></i> <span>Dashboard</span></a>
          </li>
          <li class="nav-item ${currentPath.includes('students.html') || currentPath.includes('add-student.html') || currentPath.includes('student-profile.html') ? 'active' : ''}">
            <a href="students.html"><i class="fa-solid fa-graduation-cap"></i> <span>Students</span></a>
          </li>
          <li class="nav-item ${currentPath.includes('batches.html') ? 'active' : ''}">
            <a href="batches.html"><i class="fa-solid fa-layer-group"></i> <span>Batches</span></a>
          </li>
          <li class="nav-item ${currentPath.includes('fees.html') || currentPath.includes('fee-history.html') ? 'active' : ''}">
            <a href="fees.html"><i class="fa-solid fa-file-invoice-dollar"></i> <span>Fees</span></a>
          </li>
          <li class="nav-item ${currentPath.includes('attendance.html') ? 'active' : ''}">
            <a href="attendance.html"><i class="fa-solid fa-calendar-check"></i> <span>Attendance</span></a>
          </li>
          <li class="nav-item ${currentPath.includes('timetable.html') ? 'active' : ''}">
            <a href="timetable.html"><i class="fa-solid fa-calendar-days"></i> <span>Timetable</span></a>
          </li>
          <li class="nav-item ${currentPath.includes('reminders.html') || currentPath.includes('whatsapp-settings.html') ? 'active' : ''}">
            <a href="reminders.html"><i class="fa-solid fa-paper-plane"></i> <span>Reminders</span></a>
          </li>
          <li class="nav-item ${currentPath.includes('reports.html') ? 'active' : ''}">
            <a href="reports.html"><i class="fa-solid fa-chart-line"></i> <span>Reports</span></a>
          </li>
          <li class="nav-item ${currentPath.includes('analytics.html') ? 'active' : ''}">
            <a href="analytics.html"><i class="fa-solid fa-chart-column"></i> <span>Analytics</span></a>
          </li>
          <li class="nav-item ${currentPath.includes('settings.html') ? 'active' : ''}">
            <a href="settings.html"><i class="fa-solid fa-sliders"></i> <span>Settings</span></a>
          </li>
        </ul>

        <div class="sidebar-footer">
          <button class="theme-toggle-btn" onclick="toggleTheme()">
            <i class="fa-regular fa-moon"></i> <span>Toggle Mode</span>
          </button>
          
          <div class="user-profile-badge" style="cursor: pointer;" onclick="window.location.href='profile.html'">
            <div class="user-avatar">${user.name.charAt(0)}</div>
            <div class="user-info">
              <span class="user-name">${user.name}</span>
              <span class="user-role">Administrator</span>
            </div>
          </div>
          <button class="btn btn-danger" style="padding: 8px 12px; font-size: 0.8rem; width: 100%; border-radius: 12px;" onclick="logout()">
            <i class="fa-solid fa-arrow-right-from-bracket"></i> Logout
          </button>
        </div>
      </div>
    `;
  }

  // Set Theme Class
  const currentTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', currentTheme);
}

window.toggleTheme = () => {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
};

window.logout = () => {
  api.clearToken();
  window.location.href = 'login.html';
};

// Block/unblock background scrolling when modals or alert overlays are shown
const setupModalObserver = () => {
  const checkModals = () => {
    const activeModals = [
      ...document.querySelectorAll('.modal-overlay.active'),
      ...document.querySelectorAll('.modal.open'),
      ...document.querySelectorAll('.custom-alert-overlay.active')
    ];
    
    // Check for payment-modal (fees page uses inline display block/flex)
    const paymentModal = document.getElementById('payment-modal');
    if (paymentModal && paymentModal.style.display !== 'none' && paymentModal.style.display !== '') {
      activeModals.push(paymentModal);
    }

    if (activeModals.length > 0) {
      if (!document.body.classList.contains('modal-open')) {
        document.body.classList.add('modal-open');
      }
    } else {
      if (document.body.classList.contains('modal-open')) {
        document.body.classList.remove('modal-open');
      }
    }
  };

  checkModals();

  const observer = new MutationObserver((mutations) => {
    let checkNeeded = false;
    for (const mutation of mutations) {
      if (mutation.type === 'attributes') {
        if (mutation.attributeName === 'class' || mutation.attributeName === 'style') {
          checkNeeded = true;
          break;
        }
      } else if (mutation.type === 'childList') {
        checkNeeded = true;
        break;
      }
    }
    if (checkNeeded) {
      checkModals();
    }
  });

  observer.observe(document.body, {
    attributes: true,
    childList: true,
    subtree: true,
    attributeFilter: ['class', 'style']
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupModalObserver);
} else {
  setupModalObserver();
}

