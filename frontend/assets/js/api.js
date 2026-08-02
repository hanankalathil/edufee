
// Custom Styled Alert Implementation
window.alert = function(message) {
  return new Promise((resolve) => {
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

    const handleKeyDown = (e) => {
      if (e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault();
        closeAlert();
      }
    };

    const closeAlert = () => {
      overlay.classList.remove('active');
      dialog.classList.remove('active');
      setTimeout(() => {
        overlay.remove();
      }, 250);
      window.removeEventListener('keydown', handleKeyDown);
      resolve();
    };

    okBtn.onclick = closeAlert;
    window.addEventListener('keydown', handleKeyDown);
  });
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
      <div class="custom-alert-icon-container error" style="background-color: rgba(239, 68, 68, 0.1); color: #ef4444;">
        ${iconSvg}
      </div>
      <div class="custom-alert-message">${message.replace(/\n/g, '<br>')}</div>
      <div class="custom-alert-actions" style="display: flex; gap: 12px; justify-content: center; width: 100%;">
        <button class="custom-alert-button" id="custom-confirm-cancel-btn" style="background: var(--border-color); color: var(--text-main); box-shadow: none;">Cancel</button>
        <button class="custom-alert-button" id="custom-confirm-ok-btn" style="background: #ef4444; color: white; box-shadow: 0 4px 14px rgba(239, 68, 68, 0.35);">OK</button>
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

    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        closeConfirm(true);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeConfirm(false);
      }
    };

    const closeConfirm = (result) => {
      overlay.classList.remove('active');
      dialog.classList.remove('active');
      setTimeout(() => {
        overlay.remove();
      }, 250);
      window.removeEventListener('keydown', handleKeyDown);
      resolve(result);
    };

    okBtn.onclick = () => closeConfirm(true);
    cancelBtn.onclick = () => closeConfirm(false);
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
  const CURRENT_MOCK_VERSION = "v6";
  if (localStorage.getItem('mock_version') !== CURRENT_MOCK_VERSION) {
    localStorage.removeItem('students');
    localStorage.removeItem('fees');
    localStorage.removeItem('attendance');
    localStorage.removeItem('queue');
    localStorage.removeItem('batches');
    localStorage.removeItem('timetable');
    localStorage.removeItem('tests');
    localStorage.removeItem('classes');
    localStorage.setItem('mock_version', CURRENT_MOCK_VERSION);
  }

  if (!localStorage.getItem('classes')) {
    const defaultClasses = [
      { _id: "class_1", name: "Class 1", subjects: ["Mathematics", "English", "EVS"] },
      { _id: "class_2", name: "Class 2", subjects: ["Mathematics", "English", "EVS"] },
      { _id: "class_3", name: "Class 3", subjects: ["Mathematics", "English", "Science"] },
      { _id: "class_4", name: "Class 4", subjects: ["Mathematics", "English", "Science"] },
      { _id: "class_5", name: "Class 5", subjects: ["Mathematics", "English", "Science"] },
      { _id: "class_6", name: "Class 6", subjects: ["Mathematics", "English", "Science", "Social Science"] },
      { _id: "class_7", name: "Class 7", subjects: ["Mathematics", "English", "Science", "Social Science"] },
      { _id: "class_8", name: "Class 8", subjects: ["Mathematics", "Science", "Social Science", "English"] },
      { _id: "class_9", name: "Class 9", subjects: ["Mathematics", "Science", "Social Science", "English"] },
      { _id: "class_10", name: "Class 10", subjects: ["Mathematics", "Science", "History", "Geography"] },
      { _id: "class_11_sci", name: "Plus One Science", subjects: ["Physics", "Chemistry", "Mathematics", "Biology"] },
      { _id: "class_11_com", name: "Plus One Commerce", subjects: ["Accountancy", "Business Studies", "Economics", "Mathematics"] },
      { _id: "class_11_hum", name: "Plus One Humanities", subjects: ["History", "Political Science", "Geography", "English"] },
      { _id: "class_12_sci", name: "Plus Two Science", subjects: ["Physics", "Chemistry", "Mathematics", "Biology"] },
      { _id: "class_12_com", name: "Plus Two Commerce", subjects: ["Accountancy", "Business Studies", "Economics", "Mathematics"] },
      { _id: "class_12_hum", name: "Plus Two Humanities", subjects: ["History", "Political Science", "Geography", "English"] }
    ];
    setLocalStorageJson('classes', defaultClasses);
  }

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
      },
      {
        _id: "student6",
        studentId: "STU106",
        name: "Meera Nair",
        photo: "",
        parentName: "Gopal Nair",
        whatsappNumber: "919876543215",
        address: "302, Palm Grove, Kochi",
        school: "Choice School",
        class: "Plus Two Commerce",
        batch: "Evening B",
        subjects: ["Accountancy", "Business Studies", "Economics"],
        admissionDate: "2026-06-22T00:00:00.000Z"
      },
      {
        _id: "student7",
        studentId: "STU107",
        name: "Aditya Patel",
        photo: "",
        parentName: "Dinesh Patel",
        whatsappNumber: "919876543216",
        address: "A-44, Shanti Nagar, Ahmedabad",
        school: "St. Kabir School",
        class: "Plus One Commerce",
        batch: "Evening B",
        subjects: ["Accountancy", "Mathematics"],
        admissionDate: "2026-06-25T00:00:00.000Z"
      },
      {
        _id: "student8",
        studentId: "STU108",
        name: "Zara Fatima",
        photo: "",
        parentName: "Imran Fatima",
        whatsappNumber: "919876543217",
        address: "Flat 12B, Royal Meadows, Hyderabad",
        school: "Gitanjali Devshala",
        class: "Class 8",
        batch: "Morning A",
        subjects: ["Mathematics", "English", "Social Science"],
        admissionDate: "2026-06-28T00:00:00.000Z"
      },
      {
        _id: "student9",
        studentId: "STU109",
        name: "Devendra Joshi",
        photo: "",
        parentName: "Mukesh Joshi",
        whatsappNumber: "919876543218",
        address: "15/3, Rajpur Road, Dehradun",
        school: "The Doon School",
        class: "Plus Two Humanities",
        batch: "Weekend Special",
        subjects: ["History", "Political Science", "Geography"],
        admissionDate: "2026-07-01T00:00:00.000Z"
      },
      {
        _id: "student10",
        studentId: "STU110",
        name: "Diya Sen",
        photo: "",
        parentName: "Siddharth Sen",
        whatsappNumber: "919876543219",
        address: "56A, Salt Lake Sector 2, Kolkata",
        school: "La Martiniere for Girls",
        class: "Class 10",
        batch: "Morning A",
        subjects: ["Mathematics", "Science", "History"],
        admissionDate: "2026-07-02T00:00:00.000Z"
      },
      {
        _id: "student11",
        studentId: "STU111",
        name: "Arjun Reddy",
        photo: "",
        parentName: "K. R. Reddy",
        whatsappNumber: "919876543220",
        address: "Plot 24, Jubilee Hills, Hyderabad",
        school: "Chirec International School",
        class: "Plus One Science",
        batch: "Evening B",
        subjects: ["Physics", "Chemistry", "Mathematics", "Biology"],
        admissionDate: "2026-07-03T00:00:00.000Z"
      },
      {
        _id: "student12",
        studentId: "STU112",
        name: "Riya Kapoor",
        photo: "",
        parentName: "Anil Kapoor",
        whatsappNumber: "919876543221",
        address: "88, Lokhandwala Complex, Mumbai",
        school: "Podar International",
        class: "Plus Two Science",
        batch: "Evening B",
        subjects: ["Physics", "Mathematics", "Computer Science"],
        admissionDate: "2026-07-04T00:00:00.000Z"
      },
      {
        _id: "student13",
        studentId: "STU113",
        name: "Varun Dhawan",
        photo: "",
        parentName: "David Dhawan",
        whatsappNumber: "919876543222",
        address: "10B, Juhu Beach Road, Mumbai",
        school: "Jamnabai Narsee School",
        class: "Class 9",
        batch: "Morning A",
        subjects: ["Mathematics", "Science", "Geography"],
        admissionDate: "2026-07-05T00:00:00.000Z"
      },
      {
        _id: "student14",
        studentId: "STU114",
        name: "Kiara Advani",
        photo: "",
        parentName: "Jagdeep Advani",
        whatsappNumber: "919876543223",
        address: "Park Street Residency, Kolkata",
        school: "Loreto House",
        class: "Plus Two Commerce",
        batch: "Weekend Special",
        subjects: ["Accountancy", "Economics", "Mathematics"],
        admissionDate: "2026-07-06T00:00:00.000Z"
      },
      {
        _id: "student15",
        studentId: "STU115",
        name: "Siddharth Malhotra",
        photo: "",
        parentName: "Sunil Malhotra",
        whatsappNumber: "919876543224",
        address: "B-12, Defence Colony, New Delhi",
        school: "Delhi Public School, RK Puram",
        class: "Plus One Humanities",
        batch: "Weekend Special",
        subjects: ["History", "Political Science", "English"],
        admissionDate: "2026-07-07T00:00:00.000Z"
      },
      {
        _id: "student16",
        studentId: "STU116",
        name: "Pranav Kurup",
        photo: "",
        parentName: "Hari Kurup",
        whatsappNumber: "919876543225",
        address: "Vikas Nagar, Trivandrum",
        school: "Loyola School",
        class: "Class 8",
        batch: "Morning A",
        subjects: ["Mathematics", "Science"],
        admissionDate: "2026-07-08T00:00:00.000Z"
      },
      {
        _id: "student17",
        studentId: "STU117",
        name: "Anjali Menon",
        photo: "",
        parentName: "Jayadev Menon",
        whatsappNumber: "919876543226",
        address: "Kaloor, Kochi",
        school: "Toc H Public School",
        class: "Plus Two Science",
        batch: "Evening B",
        subjects: ["Physics", "Chemistry", "Mathematics"],
        admissionDate: "2026-07-09T00:00:00.000Z"
      },
      {
        _id: "student18",
        studentId: "STU118",
        name: "Gautham Krishna",
        photo: "",
        parentName: "Radhakrishnan",
        whatsappNumber: "919876543227",
        address: "Perungudi, Chennai",
        school: "DAV Public School",
        class: "Plus One Science",
        batch: "Evening B",
        subjects: ["Physics", "Mathematics", "Chemistry"],
        admissionDate: "2026-07-10T00:00:00.000Z"
      },
      {
        _id: "student19",
        studentId: "STU119",
        name: "Sneha Paul",
        photo: "",
        parentName: "Saji Paul",
        whatsappNumber: "919876543228",
        address: "Vyttila, Kochi",
        school: "Bhavans Vidya Mandir",
        class: "Class 10",
        batch: "Weekend Special",
        subjects: ["Mathematics", "Science"],
        admissionDate: "2026-07-11T00:00:00.000Z"
      },
      {
        _id: "student20",
        studentId: "STU120",
        name: "Vikram Rathore",
        photo: "",
        parentName: "Rajendra Rathore",
        whatsappNumber: "919876543229",
        address: "Malviya Nagar, Jaipur",
        school: "Step by Step School",
        class: "Plus Two Commerce",
        batch: "Evening B",
        subjects: ["Accountancy", "Business Studies", "Economics"],
        admissionDate: "2026-07-12T00:00:00.000Z"
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
        dueDate: "2026-08-02T00:00:00.000Z",
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
        dueDate: "2026-08-03T00:00:00.000Z",
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
        dueDate: "2026-08-02T00:00:00.000Z",
        paymentHistory: []
      },
      {
        _id: "fee6",
        studentId: "student6",
        feeType: "Monthly Tuition",
        billingPeriod: "July 2026",
        totalAmount: 2500,
        discount: 0,
        fine: 0,
        netAmount: 2500,
        paidAmount: 2500,
        dueAmount: 0,
        status: "Paid",
        dueDate: "2026-07-10T00:00:00.000Z",
        paymentHistory: [
          {
            _id: "pay6_1",
            amountPaid: 2500,
            paymentDate: "2026-07-09T16:20:00.000Z",
            paymentMethod: "UPI",
            transactionId: "TXN776251241",
            remarks: "UPI Payment"
          }
        ]
      },
      {
        _id: "fee7",
        studentId: "student7",
        feeType: "Monthly Tuition",
        billingPeriod: "July 2026",
        totalAmount: 2500,
        discount: 100,
        fine: 0,
        netAmount: 2400,
        paidAmount: 1200,
        dueAmount: 1200,
        status: "Partial",
        dueDate: "2026-07-10T00:00:00.000Z",
        paymentHistory: [
          {
            _id: "pay7_1",
            amountPaid: 1200,
            paymentDate: "2026-07-11T12:00:00.000Z",
            paymentMethod: "Cash",
            transactionId: "CSH-33214",
            remarks: "Part payment"
          }
        ]
      },
      {
        _id: "fee8",
        studentId: "student8",
        feeType: "Monthly Tuition",
        billingPeriod: "July 2026",
        totalAmount: 1500,
        discount: 0,
        fine: 50,
        netAmount: 1550,
        paidAmount: 0,
        dueAmount: 1550,
        status: "Overdue",
        dueDate: "2026-07-05T00:00:00.000Z",
        paymentHistory: []
      },
      {
        _id: "fee9",
        studentId: "student9",
        feeType: "Monthly Tuition",
        billingPeriod: "July 2026",
        totalAmount: 3000,
        discount: 0,
        fine: 0,
        netAmount: 3000,
        paidAmount: 3000,
        dueAmount: 0,
        status: "Paid",
        dueDate: "2026-07-10T00:00:00.000Z",
        paymentHistory: [
          {
            _id: "pay9_1",
            amountPaid: 3000,
            paymentDate: "2026-07-06T10:45:00.000Z",
            paymentMethod: "UPI",
            transactionId: "TXN99882211",
            remarks: "Paid online"
          }
        ]
      },
      {
        _id: "fee10",
        studentId: "student10",
        feeType: "Monthly Tuition",
        billingPeriod: "July 2026",
        totalAmount: 1500,
        discount: 0,
        fine: 0,
        netAmount: 1500,
        paidAmount: 1500,
        dueAmount: 0,
        status: "Paid",
        dueDate: "2026-07-10T00:00:00.000Z",
        paymentHistory: [
          {
            _id: "pay10_1",
            amountPaid: 1500,
            paymentDate: "2026-07-07T09:15:00.000Z",
            paymentMethod: "Cash",
            transactionId: "CSH-55421",
            remarks: "Paid by cash"
          }
        ]
      },
      {
        _id: "fee11",
        studentId: "student11",
        feeType: "Monthly Tuition",
        billingPeriod: "July 2026",
        totalAmount: 2500,
        discount: 250,
        fine: 0,
        netAmount: 2250,
        paidAmount: 2250,
        dueAmount: 0,
        status: "Paid",
        dueDate: "2026-07-10T00:00:00.000Z",
        paymentHistory: [
          {
            _id: "pay11_1",
            amountPaid: 2250,
            paymentDate: "2026-07-08T18:00:00.000Z",
            paymentMethod: "UPI",
            transactionId: "TXN65412398",
            remarks: "Sibling discount applied"
          }
        ]
      },
      {
        _id: "fee12",
        studentId: "student12",
        feeType: "Monthly Tuition",
        billingPeriod: "July 2026",
        totalAmount: 4000,
        discount: 0,
        fine: 200,
        netAmount: 4200,
        paidAmount: 0,
        dueAmount: 4200,
        status: "Overdue",
        dueDate: "2026-08-03T00:00:00.000Z",
        paymentHistory: []
      },
      {
        _id: "fee13",
        studentId: "student13",
        feeType: "Monthly Tuition",
        billingPeriod: "July 2026",
        totalAmount: 1500,
        discount: 0,
        fine: 0,
        netAmount: 1500,
        paidAmount: 0,
        dueAmount: 1500,
        status: "Pending",
        dueDate: "2026-07-25T00:00:00.000Z",
        paymentHistory: []
      },
      {
        _id: "fee14",
        studentId: "student14",
        feeType: "Monthly Tuition",
        billingPeriod: "July 2026",
        totalAmount: 3000,
        discount: 0,
        fine: 0,
        netAmount: 3000,
        paidAmount: 3000,
        dueAmount: 0,
        status: "Paid",
        dueDate: "2026-07-10T00:00:00.000Z",
        paymentHistory: [
          {
            _id: "pay14_1",
            amountPaid: 3000,
            paymentDate: "2026-07-09T14:40:00.000Z",
            paymentMethod: "Bank Transfer",
            transactionId: "TXN11223344",
            remarks: "Online transfer"
          }
        ]
      },
      {
        _id: "fee15",
        studentId: "student15",
        feeType: "Monthly Tuition",
        billingPeriod: "July 2026",
        totalAmount: 3000,
        discount: 300,
        fine: 0,
        netAmount: 2700,
        paidAmount: 1000,
        dueAmount: 1700,
        status: "Partial",
        dueDate: "2026-07-10T00:00:00.000Z",
        paymentHistory: [
          {
            _id: "pay15_1",
            amountPaid: 1000,
            paymentDate: "2026-07-10T11:00:00.000Z",
            paymentMethod: "UPI",
            transactionId: "TXN88776655",
            remarks: "Part 1"
          }
        ]
      },
      {
        _id: "fee16",
        studentId: "student16",
        feeType: "Monthly Tuition",
        billingPeriod: "July 2026",
        totalAmount: 1500,
        discount: 0,
        fine: 0,
        netAmount: 1500,
        paidAmount: 1500,
        dueAmount: 0,
        status: "Paid",
        dueDate: "2026-07-10T00:00:00.000Z",
        paymentHistory: [
          {
            _id: "pay16_1",
            amountPaid: 1500,
            paymentDate: "2026-07-05T12:00:00.000Z",
            paymentMethod: "Cash",
            transactionId: "CSH-11992",
            remarks: "Early payment"
          }
        ]
      },
      {
        _id: "fee17",
        studentId: "student17",
        feeType: "Monthly Tuition",
        billingPeriod: "July 2026",
        totalAmount: 4000,
        discount: 0,
        fine: 0,
        netAmount: 4000,
        paidAmount: 0,
        dueAmount: 4000,
        status: "Pending",
        dueDate: "2026-07-25T00:00:00.000Z",
        paymentHistory: []
      },
      {
        _id: "fee18",
        studentId: "student18",
        feeType: "Monthly Tuition",
        billingPeriod: "July 2026",
        totalAmount: 2500,
        discount: 0,
        fine: 0,
        netAmount: 2500,
        paidAmount: 2500,
        dueAmount: 0,
        status: "Paid",
        dueDate: "2026-07-10T00:00:00.000Z",
        paymentHistory: [
          {
            _id: "pay18_1",
            amountPaid: 2500,
            paymentDate: "2026-07-09T08:30:00.000Z",
            paymentMethod: "UPI",
            transactionId: "TXN55443322",
            remarks: "Full fee"
          }
        ]
      },
      {
        _id: "fee19",
        studentId: "student19",
        feeType: "Monthly Tuition",
        billingPeriod: "July 2026",
        totalAmount: 3000,
        discount: 0,
        fine: 150,
        netAmount: 3150,
        paidAmount: 0,
        dueAmount: 3150,
        status: "Overdue",
        dueDate: "2026-07-05T00:00:00.000Z",
        paymentHistory: []
      },
      {
        _id: "fee20",
        studentId: "student20",
        feeType: "Monthly Tuition",
        billingPeriod: "July 2026",
        totalAmount: 2500,
        discount: 0,
        fine: 0,
        netAmount: 2500,
        paidAmount: 2500,
        dueAmount: 0,
        status: "Paid",
        dueDate: "2026-07-10T00:00:00.000Z",
        paymentHistory: [
          {
            _id: "pay20_1",
            amountPaid: 2500,
            paymentDate: "2026-07-10T17:00:00.000Z",
            paymentMethod: "UPI",
            transactionId: "TXN77665544",
            remarks: "On due date"
          }
        ]
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
      { id: "notif1", type: "fee", title: "Fee Overdue", text: "Rohan Das's fee is overdue by 14 days.", read: false, time: "2 hours ago" },
      { id: "notif2", type: "admission", title: "New Admission", text: "Vikram Rathore has registered for Evening B.", read: false, time: "5 hours ago" },
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
          { studentId: "student10", status: "Present" },
          { studentId: "student5", status: "Absent" }
        ]
      },
      {
        _id: "att2",
        date: "2026-07-16",
        class: "Class 10",
        batch: "Morning A",
        records: [
          { studentId: "student1", status: "Present" },
          { studentId: "student10", status: "Present" },
          { studentId: "student5", status: "Present" }
        ]
      }
    ]);
  }

  if (!localStorage.getItem('queue') || JSON.parse(localStorage.getItem('queue') || '[]').length < 3) {
    setLocalStorageJson('queue', [
      { id: "q1", studentName: "Rohan Das", parentNumber: "919876543212", amount: 2650, dueDate: "2026-07-05", status: "Pending", time: "Scheduled" },
      { id: "q2", studentName: "Isha Sharma", parentNumber: "919876543211", amount: 2100, dueDate: "2026-07-10", status: "Pending", time: "Scheduled" },
      { id: "q3", studentName: "Zara Fatima", parentNumber: "919876543217", amount: 1550, dueDate: "2026-07-05", status: "Pending", time: "Scheduled" }
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
        class: "Class 8",
        timing: "08:00 AM - 10:00 AM",
        price: 1500,
        subjects: ["Mathematics", "Physics", "Chemistry", "Biology", "English"]
      },
      {
        _id: "batch2",
        name: "Evening B",
        class: "Plus One Science",
        timing: "04:00 PM - 06:00 PM",
        price: 2500,
        subjects: ["Mathematics", "Physics", "Chemistry", "Biology", "Computer Science", "Accountancy", "Business Studies", "Economics"]
      },
      {
        _id: "batch3",
        name: "Weekend Special",
        class: "Class 10",
        timing: "09:00 AM - 01:00 PM",
        price: 3000,
        subjects: ["Science", "Mathematics", "English"]
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
    if (b.class && b.class.includes(',')) {
      b.class = b.class.split(',')[0].trim();
      batchesUpdated = true;
    }
    if (b.class === 'All Classes') {
      b.class = 'Class 10';
      batchesUpdated = true;
    }
    if (b.price === undefined) {
      if (b.name === 'Morning A') b.price = 1500;
      else if (b.name === 'Evening B') b.price = 2500;
      else if (b.name === 'Weekend Special') b.price = 3000;
      else b.price = 1500;
      batchesUpdated = true;
    }
  });
  if (batchesUpdated) setLocalStorageJson('batches', storedBatches);

  if (!localStorage.getItem('tests')) {
    setLocalStorageJson('tests', [
      {
        _id: "test1",
        name: "First Term Algebra Test",
        subject: "Mathematics",
        date: "2026-07-05",
        class: "Class 10",
        batch: "Morning A",
        maxMarks: 50,
        records: [
          { studentId: "student1", marks: 45, remarks: "Excellent performance, keep it up!" },
          { studentId: "student5", marks: 38, remarks: "Good effort, clear understanding of concepts." },
          { studentId: "student8", marks: 29, remarks: "Needs more practice in solving linear equations." }
        ]
      },
      {
        _id: "test2",
        name: "Mechanics Weekly Test",
        subject: "Physics",
        date: "2026-07-12",
        class: "Plus Two Science",
        batch: "Evening B",
        maxMarks: 100,
        records: [
          { studentId: "student2", marks: 88, remarks: "Great conceptual understanding of Newton's Laws." },
          { studentId: "student6", marks: 74, remarks: "Steady progress, check unit conversions next time." }
        ]
      }
    ]);
  }
};

// Execute DB initialization
initializeMockDB();

// Mock API Methods
const api = {
  getToken: () => localStorage.getItem('token') || sessionStorage.getItem('token'),
  setToken: (token, remember = true) => {
    // Save to both to persist authentication across Live Server tabs/sessions
    localStorage.setItem('token', token);
    sessionStorage.setItem('token', token);
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

    // Auto-generate invoices for the registered month and the next month
    try {
      const batches = getLocalStorageJson('batches', []);
      const batch = batches.find(b => b.name === newStudent.batch);
      const price = batch ? parseFloat(batch.price || 0) : 2500;

      const admissionDate = new Date(newStudent.admissionDate);
      const fees = getLocalStorageJson('fees', []);

      // 1. Current Month's Invoice (due on Admission/Registration Date)
      const firstPeriod = admissionDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      const firstDueDate = admissionDate.toISOString();
      const fee1 = {
        _id: 'fee_' + Date.now() + '_1',
        studentId: newStudent._id,
        feeType: 'Monthly Tuition',
        billingPeriod: firstPeriod,
        totalAmount: price,
        discount: 0,
        fine: 0,
        netAmount: price,
        paidAmount: 0,
        dueAmount: price,
        status: 'Unpaid',
        dueDate: firstDueDate,
        paymentHistory: []
      };

      // 2. Next Month's Invoice (due within 7 days of the next month start, i.e., on the 7th)
      const nextMonthDate = new Date(admissionDate.getFullYear(), admissionDate.getMonth() + 1, 1);
      const nextPeriod = nextMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      const nextDueDate = new Date(nextMonthDate.getFullYear(), nextMonthDate.getMonth(), 7).toISOString();
      const fee2 = {
        _id: 'fee_' + Date.now() + '_2',
        studentId: newStudent._id,
        feeType: 'Monthly Tuition',
        billingPeriod: nextPeriod,
        totalAmount: price,
        discount: 0,
        fine: 0,
        netAmount: price,
        paidAmount: 0,
        dueAmount: price,
        status: 'Unpaid',
        dueDate: nextDueDate,
        paymentHistory: []
      };

      fees.push(fee1, fee2);
      setLocalStorageJson('fees', fees);
    } catch (err) {
      console.error('Error generating automatic invoices for new student:', err);
    }

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
    const list = getLocalStorageJson('batches', []);
    let updated = false;
    list.forEach(b => {
      if (!b.subjects) {
        b.subjects = ["Mathematics", "Physics", "Chemistry", "Biology", "Science", "English"];
        updated = true;
      }
    });
    if (updated) {
      setLocalStorageJson('batches', list);
    }
    return list;
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
      whatsappGroup: batchData.whatsappGroup || '',
      price: parseFloat(batchData.price || 0),
      subjects: batchData.subjects || []
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
      whatsappGroup: batchData.whatsappGroup || '',
      price: parseFloat(batchData.price || 0),
      subjects: batchData.subjects || []
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

  // Classes
  getClasses: async () => {
    return getLocalStorageJson('classes', []);
  },
  createClass: async (classData) => {
    const list = getLocalStorageJson('classes', []);
    if (list.some(c => c.name.toLowerCase() === classData.name.toLowerCase())) {
      throw new Error('Class already exists');
    }
    const newClass = {
      _id: 'class_' + Date.now(),
      name: classData.name,
      subjects: classData.subjects || []
    };
    list.push(newClass);
    setLocalStorageJson('classes', list);
    return newClass;
  },
  updateClass: async (id, classData) => {
    const list = getLocalStorageJson('classes', []);
    const idx = list.findIndex(c => c._id === id);
    if (idx === -1) throw new Error('Class not found');
    list[idx] = { ...list[idx], ...classData };
    setLocalStorageJson('classes', list);
    return list[idx];
  },
  deleteClass: async (id) => {
    let list = getLocalStorageJson('classes', []);
    const clazz = list.find(c => c._id === id);
    if (!clazz) throw new Error('Class not found');

    const batches = getLocalStorageJson('batches', []);
    if (batches.some(b => b.class === clazz.name)) {
      throw new Error(`Cannot delete class "${clazz.name}" as there are batches using it.`);
    }

    const filtered = list.filter(c => c._id !== id);
    setLocalStorageJson('classes', filtered);
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

  issueBulkFees: async (filters, feeData) => {
    const students = getLocalStorageJson('students', []);
    let targetStudents = students;
    
    if (filters.batch && filters.batch !== 'All Batches') {
      targetStudents = students.filter(s => s.batch === filters.batch);
    }
    
    if (targetStudents.length === 0) {
      throw new Error('No students found for the selected batch.');
    }

    const fees = getLocalStorageJson('fees', []);
    const newFees = [];
    
    const baseId = Date.now();
    
    targetStudents.forEach((student, index) => {
      const net = parseFloat(feeData.totalAmount) - parseFloat(feeData.discount || 0) + parseFloat(feeData.fine || 0);
      const newFee = {
        _id: 'fee_' + (baseId + index),
        studentId: student._id,
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
      newFees.push(newFee);
    });

    setLocalStorageJson('fees', fees);
    return newFees;
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
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(4px); z-index: 999999; display: flex; align-items: center; justify-content: center; padding: 20px; opacity: 0; transition: opacity 0.3s;';
    
    const modal = document.createElement('div');
    modal.style.cssText = 'background: #fff; border-radius: 16px; width: 100%; max-width: 750px; position: relative; transform: scale(0.95) translateY(20px); transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); display: flex; flex-direction: column; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); height: 85vh; max-height: 800px;';
    
    // Header
    const header = document.createElement('div');
    header.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 16px 24px; border-bottom: 1px solid #e2e8f0; background: #f8fafc; border-radius: 16px 16px 0 0; flex-shrink: 0;';
    header.innerHTML = `
      <h3 style="margin: 0; font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 1.1rem; color: #0f172a;">Receipt Preview</h3>
      <div style="display: flex; gap: 8px;">
        <button id="modal-print-btn" style="background: #2563eb; color: #fff; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 0.85rem; transition: background 0.2s;" onmouseover="this.style.background='#1d4ed8'" onmouseout="this.style.background='#2563eb'"><i class="fa-solid fa-print"></i> Print</button>
        <button id="modal-close-btn" style="background: transparent; color: #64748b; border: none; padding: 8px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; transition: color 0.2s;" onmouseover="this.style.color='#0f172a'" onmouseout="this.style.color='#64748b'"><i class="fa-solid fa-xmark"></i></button>
      </div>
    `;
    
    // Iframe container
    const iframeContainer = document.createElement('div');
    iframeContainer.style.cssText = 'flex: 1; padding: 0; border-radius: 0 0 16px 16px; overflow: hidden; position: relative; background: #f1f5f9;';
    
    // We adjust the path. If we are in /pages/, we don't need 'pages/'. 
    // api.js is loaded from various places, so we use absolute path from root or relative to window.location
    const basePath = window.location.pathname.includes('/pages/') ? '' : 'pages/';
    
    iframeContainer.innerHTML = `
      <iframe id="receipt-iframe" src="${basePath}receipt-preview.html?feeId=${feeId}&paymentId=${paymentId}&modal=true" style="width: 100%; height: 100%; border: none; background: transparent;"></iframe>
    `;
    
    modal.appendChild(header);
    modal.appendChild(iframeContainer);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Animate in
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      modal.style.transform = 'scale(1) translateY(0)';
    });
    
    const closeBtn = header.querySelector('#modal-close-btn');
    const printBtn = header.querySelector('#modal-print-btn');
    const iframe = iframeContainer.querySelector('#receipt-iframe');
    
    const closeModal = () => {
      overlay.style.opacity = '0';
      modal.style.transform = 'scale(0.95) translateY(20px)';
      setTimeout(() => overlay.remove(), 300);
    };
    
    closeBtn.onclick = closeModal;
    overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
    
    printBtn.onclick = () => {
      if (iframe.contentWindow) {
        iframe.contentWindow.print();
      }
    };
  },

  // Attendance
  getAttendance: async (date, className, batch) => {
    const list = getLocalStorageJson('attendance', []);
    const students = getLocalStorageJson('students', []);

    let filteredStudents = [];
    if (batch === 'All Batches') {
      filteredStudents = students.filter(s => s.class === className);
    } else {
      filteredStudents = students.filter(s => s.class === className && s.batch === batch);
    }

    let records = [];
    if (batch === 'All Batches') {
      records = filteredStudents.map(s => {
        // Find if this student has attendance recorded in their specific batch sheet
        const studentSheet = list.find(sheet => sheet.date === date && sheet.class === className && sheet.batch === s.batch);
        const record = studentSheet ? studentSheet.records.find(r => r.studentId === s._id) : null;
        return {
          studentId: s._id,
          status: record ? record.status : 'Present'
        };
      });
    } else {
      let sheet = list.find(s => s.date === date && s.class === className && s.batch === batch);
      if (sheet) {
        records = sheet.records;
      } else {
        records = filteredStudents.map(s => ({
          studentId: s._id,
          status: 'Present'
        }));
      }
    }

    const sheet = { date, class: className, batch, records };

    // Populate student object and historical statistics for UI
    const populatedRecords = sheet.records.map(r => {
      const student = students.find(s => s._id === r.studentId);
      
      // Calculate attempts
      let totalAttempts = 0;
      let presentCount = 0;
      list.forEach(attRecord => {
        // If query is All Batches, aggregate attempts across all sheets of this class
        const matchesBatch = batch === 'All Batches' || attRecord.batch === batch;
        if (attRecord.class === className && matchesBatch) {
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
    const students = getLocalStorageJson('students', []);

    if (attendanceData.batch === 'All Batches') {
      // Group incoming records by student's batch
      const recordsByBatch = {};
      attendanceData.records.forEach(r => {
        const student = students.find(s => s._id === r.student);
        const bName = student ? (student.batch || 'Unassigned') : 'Unassigned';
        if (!recordsByBatch[bName]) {
          recordsByBatch[bName] = [];
        }
        recordsByBatch[bName].push({
          studentId: r.student,
          status: r.status
        });
      });

      // Update/insert sheets for each batch
      for (const [bName, records] of Object.entries(recordsByBatch)) {
        const index = list.findIndex(s => 
          s.date === attendanceData.date && 
          s.class === attendanceData.class && 
          s.batch === bName
        );

        const sheet = {
          _id: index !== -1 ? list[index]._id : 'att_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
          date: attendanceData.date,
          class: attendanceData.class,
          batch: bName,
          records: records
        };

        if (index !== -1) {
          // Merge records to keep any existing students in the batch
          const mergedRecords = [...list[index].records];
          records.forEach(newRec => {
            const existingIdx = mergedRecords.findIndex(mr => mr.studentId === newRec.studentId);
            if (existingIdx !== -1) {
              mergedRecords[existingIdx].status = newRec.status;
            } else {
              mergedRecords.push(newRec);
            }
          });
          sheet.records = mergedRecords;
          list[index] = sheet;
        } else {
          list.push(sheet);
        }
      }
      setLocalStorageJson('attendance', list);
      return { success: true };
    } else {
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
    }
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
  },

  // Tests & Academic Performance CRUD
  getTests: async (filters = {}) => {
    let list = getLocalStorageJson('tests', []);
    if (filters.className) {
      list = list.filter(t => t.class === filters.className);
    }
    if (filters.batch) {
      list = list.filter(t => t.batch === filters.batch);
    }
    return list;
  },
  getTest: async (id) => {
    const list = getLocalStorageJson('tests', []);
    const test = list.find(t => t._id === id);
    if (!test) throw new Error('Test not found');
    return test;
  },
  saveTest: async (testData) => {
    const list = getLocalStorageJson('tests', []);
    if (testData._id) {
      const idx = list.findIndex(t => t._id === testData._id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...testData };
      } else {
        throw new Error('Test not found');
      }
    } else {
      testData._id = 'test_' + Date.now();
      list.push(testData);
    }
    setLocalStorageJson('tests', list);
    return testData;
  },
  deleteTest: async (id) => {
    let list = getLocalStorageJson('tests', []);
    list = list.filter(t => t._id !== id);
    setLocalStorageJson('tests', list);
    return { success: true };
  },
  getStudentPerformance: async (studentId) => {
    const list = getLocalStorageJson('tests', []);
    const studentTests = [];
    let totalMarksObtained = 0;
    let totalMaxMarks = 0;
    let highestPercentage = 0;
    let testsTaken = 0;

    list.forEach(t => {
      const record = t.records.find(r => r.studentId === studentId);
      if (record) {
        testsTaken++;
        
        let marksObtained = 0;
        let maxMarks = 0;
        let breakdown = [];
        let pct = 0;

        if (t.subjects && Array.isArray(t.subjects)) {
          t.subjects.forEach(sub => {
            const subMark = record.marks && record.marks[sub.name] !== undefined ? Number(record.marks[sub.name]) : 0;
            marksObtained += subMark;
            maxMarks += Number(sub.maxMarks);
            breakdown.push(`${sub.name}: ${subMark}/${sub.maxMarks}`);
          });
          pct = maxMarks > 0 ? (marksObtained / maxMarks) * 100 : 0;
        } else {
          marksObtained = Number(record.marks);
          maxMarks = Number(t.maxMarks);
          pct = maxMarks > 0 ? (marksObtained / maxMarks) * 100 : 0;
        }

        if (pct > highestPercentage) {
          highestPercentage = pct;
        }
        totalMarksObtained += marksObtained;
        totalMaxMarks += maxMarks;

        // Calculate class average
        let classAvg = 0;
        if (t.records.length > 0) {
          if (t.subjects && Array.isArray(t.subjects)) {
            let recordSum = 0;
            let recordMax = 0;
            t.records.forEach(rec => {
              t.subjects.forEach(sub => {
                recordSum += rec.marks && rec.marks[sub.name] !== undefined ? Number(rec.marks[sub.name]) : 0;
                recordMax += Number(sub.maxMarks);
              });
            });
            classAvg = recordMax > 0 ? (recordSum / recordMax) * 100 : 0;
          } else {
            const sum = t.records.reduce((sum, r) => sum + Number(r.marks), 0);
            classAvg = (sum / (t.records.length * t.maxMarks)) * 100;
          }
        } else {
          classAvg = 0;
        }

        studentTests.push({
          _id: t._id,
          name: t.name,
          subject: t.subjects && Array.isArray(t.subjects) ? t.subjects.map(s => s.name).join(', ') : t.subject,
          date: t.date,
          maxMarks: maxMarks,
          marks: t.subjects && Array.isArray(t.subjects) ? `${marksObtained} (${breakdown.join(', ')})` : record.marks,
          remarks: record.remarks || '',
          percentage: pct.toFixed(1),
          classAverage: classAvg.toFixed(1)
        });
      }
    });

    const averagePercentage = totalMaxMarks > 0 ? ((totalMarksObtained / totalMaxMarks) * 100).toFixed(1) : "0.0";

    return {
      averagePercentage,
      testsTaken,
      highestPercentage: highestPercentage.toFixed(1),
      records: studentTests
    };
  }
};

// Automate layout rendering on window load (Sidebar, Header, Theme, Logout)
if (!window.location.pathname.endsWith('login.html') && !window.location.pathname.endsWith('receipt-preview.html') && !window.location.pathname.endsWith('mark-attendance.html') && !window.location.pathname.endsWith('mark-attendance-list.html')) {
  // if (!api.getToken()) {
  //   window.location.href = 'login.html';
  // } else {
    document.addEventListener('DOMContentLoaded', () => {
      renderLayout();
      if (window.initializeCustomSelects) window.initializeCustomSelects();
    });
  // }
} else {
  // Run on login page or public page if any selects exist
  document.addEventListener('DOMContentLoaded', () => {
    if (window.initializeCustomSelects) window.initializeCustomSelects();
  });
}

window.initializeCustomSelects = () => {
  const selects = document.querySelectorAll('select.form-control:not([multiple])');
  selects.forEach(select => {
    const isSearchable = select.getAttribute('data-search') === 'true' || select.id === 'fee-student-select';

    // Avoid double wrapping
    if (select.nextElementSibling && select.nextElementSibling.classList.contains('custom-select-container')) {
      const container = select.nextElementSibling;
      if (select.disabled) {
        container.classList.add('disabled');
      } else {
        container.classList.remove('disabled');
      }
      if (select.style.width) {
        container.style.width = select.style.width;
      }
      if (select.style.minWidth) {
        container.style.minWidth = select.style.minWidth;
      }
      const optionsContainer = container.querySelector('.custom-select-options');
      const triggerInput = container.querySelector('.custom-select-trigger input.custom-select-search');
      const triggerSpan = container.querySelector('.custom-select-trigger span');
      
      const selectOptions = select.querySelectorAll('option');
      optionsContainer.innerHTML = Array.from(selectOptions).map(opt => `
        <div class="custom-option ${opt.selected ? 'selected' : ''}" data-value="${opt.value}">
          ${opt.textContent}
        </div>
      `).join('');
      
      const activeOpt = select.querySelector('option:checked') || selectOptions[0];
      if (activeOpt) {
        if (triggerInput) {
          triggerInput.value = activeOpt.textContent;
          triggerInput.placeholder = activeOpt.textContent || "Search...";
        } else if (triggerSpan) {
          triggerSpan.textContent = activeOpt.textContent;
        }
      }
      
      // Reset filter state
      optionsContainer.querySelectorAll('.custom-option').forEach(optDiv => {
        optDiv.style.display = isSearchable ? 'none' : '';
      });
      if (isSearchable) {
        optionsContainer.style.display = 'none';
      } else {
        optionsContainer.style.display = '';
      }

      // Rebind click events
      optionsContainer.querySelectorAll('.custom-option').forEach(optDiv => {
        optDiv.addEventListener('click', (e) => {
          e.stopPropagation();
          select.value = optDiv.getAttribute('data-value');
          select.dispatchEvent(new Event('change'));
          if (triggerInput) {
            triggerInput.value = optDiv.textContent;
            triggerInput.placeholder = optDiv.textContent || "Search...";
            triggerInput.readOnly = true;
            triggerInput.blur();
            optionsContainer.style.display = 'none';
          } else if (triggerSpan) {
            triggerSpan.textContent = optDiv.textContent;
          }
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
    if (select.disabled) {
      container.classList.add('disabled');
    }
    if (select.style.width) {
      container.style.width = select.style.width;
    }
    if (select.style.minWidth) {
      container.style.minWidth = select.style.minWidth;
    }

    const trigger = document.createElement('div');
    trigger.className = 'custom-select-trigger';
    
    const defaultOpt = select.querySelector('option:checked') || select.firstElementChild;
    const defaultText = defaultOpt ? defaultOpt.textContent : 'Select option...';

    let triggerInput = null;
    let triggerText = null;

    if (isSearchable) {
      triggerInput = document.createElement('input');
      triggerInput.type = 'text';
      triggerInput.className = 'custom-select-search';
      triggerInput.value = defaultText;
      triggerInput.placeholder = defaultText;
      triggerInput.readOnly = true;
      triggerInput.style.border = 'none';
      triggerInput.style.background = 'transparent';
      triggerInput.style.outline = 'none';
      triggerInput.style.width = '100%';
      triggerInput.style.color = 'inherit';
      triggerInput.style.font = 'inherit';
      triggerInput.style.padding = '0';
      triggerInput.style.margin = '0';
      trigger.appendChild(triggerInput);
    } else {
      triggerText = document.createElement('span');
      triggerText.textContent = defaultText;
      trigger.appendChild(triggerText);
    }
    
    const chevron = document.createElement('i');
    chevron.className = 'fa-solid fa-chevron-down';
    if (isSearchable) {
      chevron.style.display = 'none';
    }
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
      if (select.disabled) return;
      const isOpen = container.classList.contains('open');
      
      document.querySelectorAll('.custom-select-container').forEach(c => {
        if (c !== container) {
          c.classList.remove('open');
          const otherInput = c.querySelector('.custom-select-search');
          const otherSelect = c.previousElementSibling;
          if (otherInput) {
            otherInput.readOnly = true;
            if (otherSelect && otherSelect.tagName === 'SELECT') {
              const activeOpt = otherSelect.querySelector('option:checked') || otherSelect.firstElementChild;
              if (activeOpt) otherInput.value = activeOpt.textContent;
            }
          }
          const otherOptionsContainer = c.querySelector('.custom-select-options');
          if (otherOptionsContainer && otherSelect && (otherSelect.getAttribute('data-search') === 'true' || otherSelect.id === 'fee-student-select')) {
            otherOptionsContainer.style.display = 'none';
          }
        }
      });

      if (!isOpen) {
        container.classList.add('open');
        if (isSearchable && triggerInput) {
          triggerInput.readOnly = false;
          triggerInput.value = ''; // clear input for fresh search typing
          triggerInput.focus();
          optionsContainer.querySelectorAll('.custom-option').forEach(optDiv => {
            optDiv.style.display = 'none';
          });
          optionsContainer.style.display = 'none';
        }
      } else {
        container.classList.remove('open');
        if (isSearchable && triggerInput) {
          triggerInput.readOnly = true;
          const activeOpt = select.querySelector('option:checked') || select.firstElementChild;
          if (activeOpt) triggerInput.value = activeOpt.textContent;
          optionsContainer.style.display = 'none';
        }
      }
    });

    if (isSearchable && triggerInput) {
      triggerInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (query === '') {
          optionsContainer.querySelectorAll('.custom-option').forEach(optDiv => {
            optDiv.style.display = 'none';
          });
          optionsContainer.style.display = 'none';
          return;
        }

        let hasMatches = false;
        optionsContainer.querySelectorAll('.custom-option').forEach(optDiv => {
          const text = optDiv.textContent.toLowerCase();
          const isPlaceholder = optDiv.getAttribute('data-value') === '';
          if (!isPlaceholder && text.includes(query)) {
            optDiv.style.display = '';
            hasMatches = true;
          } else {
            optDiv.style.display = 'none';
          }
        });

        if (hasMatches) {
          optionsContainer.style.display = 'block';
        } else {
          optionsContainer.style.display = 'none';
        }
      });

      triggerInput.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = container.classList.contains('open');
        if (!isOpen) {
          document.querySelectorAll('.custom-select-container').forEach(c => {
            if (c !== container) {
              c.classList.remove('open');
              const otherInput = c.querySelector('.custom-select-search');
              const otherSelect = c.previousElementSibling;
              if (otherInput) {
                otherInput.readOnly = true;
                if (otherSelect && otherSelect.tagName === 'SELECT') {
                  const activeOpt = otherSelect.querySelector('option:checked') || otherSelect.firstElementChild;
                  if (activeOpt) otherInput.value = activeOpt.textContent;
                }
              }
              const otherOptionsContainer = c.querySelector('.custom-select-options');
              if (otherOptionsContainer && otherSelect && (otherSelect.getAttribute('data-search') === 'true' || otherSelect.id === 'fee-student-select')) {
                otherOptionsContainer.style.display = 'none';
              }
            }
          });

          container.classList.add('open');
          triggerInput.readOnly = false;
          triggerInput.value = '';
          triggerInput.focus();
          optionsContainer.querySelectorAll('.custom-option').forEach(optDiv => {
            optDiv.style.display = 'none';
          });
          optionsContainer.style.display = 'none';
        }
      });
    }

    // Option click
    optionsContainer.querySelectorAll('.custom-option').forEach(optDiv => {
      optDiv.addEventListener('click', (e) => {
        e.stopPropagation();
        select.value = optDiv.getAttribute('data-value');
        select.dispatchEvent(new Event('change'));
        if (isSearchable && triggerInput) {
          triggerInput.value = optDiv.textContent;
          triggerInput.placeholder = optDiv.textContent || "Search...";
          triggerInput.readOnly = true;
          triggerInput.blur();
          optionsContainer.style.display = 'none';
        } else if (triggerText) {
          triggerText.textContent = optDiv.textContent;
        }
        optionsContainer.querySelectorAll('.custom-option').forEach(d => d.classList.remove('selected'));
        optDiv.classList.add('selected');
        container.classList.remove('open');
      });
    });
  });
};

document.addEventListener('click', () => {
  document.querySelectorAll('.custom-select-container').forEach(c => {
    c.classList.remove('open');
    const input = c.querySelector('.custom-select-search');
    if (input) {
      input.readOnly = true;
      const select = c.previousElementSibling;
      if (select && select.tagName === 'SELECT') {
        const activeOpt = select.querySelector('option:checked') || select.firstElementChild;
        if (activeOpt) input.value = activeOpt.textContent;
      }
      const optionsContainer = c.querySelector('.custom-select-options');
      if (optionsContainer) {
        optionsContainer.style.display = 'none';
      }
    }
  });
});

function renderLayout() {
  const user = api.getUser() || { name: 'Techora Admin', email: 'admin@techora.in', tuitionName: 'Techora Academy' };
  const currentPath = window.location.pathname;

  const sidebarContainer = document.getElementById('sidebar-container');
  if (sidebarContainer) {
    sidebarContainer.innerHTML = `
      <div class="sidebar">
        <div class="brand-section" id="software-info-btn" style="cursor: pointer; transition: transform 0.2s ease;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
          <img src="../assets/images/logo.jpg" alt="EduFee Logo" style="width: 36px; height: 36px; border-radius: 10px; object-fit: cover; box-shadow: 0 4px 12px rgba(37,99,235,0.2);">
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
          <li class="nav-item ${currentPath.includes('reminders.html') ? 'active' : ''}">
            <a href="reminders.html"><i class="fa-solid fa-paper-plane"></i> <span>Reminders</span></a>
          </li>
          <li class="nav-item ${currentPath.includes('reports.html') ? 'active' : ''}">
            <a href="reports.html"><i class="fa-solid fa-chart-line"></i> <span>Reports</span></a>
          </li>
          <li class="nav-item ${currentPath.includes('settings.html') ? 'active' : ''}">
            <a href="settings.html"><i class="fa-solid fa-sliders"></i> <span>Settings</span></a>
          </li>
          <li class="nav-item">
            <a href="#" onclick="window.toggleV2Submenu(event)">
              <i class="fa-solid fa-flask"></i> <span>V2 Features</span>
              <i class="fa-solid fa-chevron-down v2-chevron" id="v2-submenu-icon" style="transition: transform 0.3s; font-size: 0.8rem; margin-left: auto;"></i>
            </a>
          </li>
          <div id="v2-submenu" style="display: none; padding-left: 15px; margin-top: 4px;">
            <li class="nav-item ${currentPath.includes('educational-details.html') ? 'active' : ''}">
              <a href="#" onclick="showV2Popup(event)"><i class="fa-solid fa-book-open"></i> <span>Edu Details</span></a>
            </li>
            <li class="nav-item ${currentPath.includes('timetable.html') ? 'active' : ''}">
              <a href="#" onclick="showV2Popup(event)"><i class="fa-solid fa-calendar-days"></i> <span>Timetable</span></a>
            </li>
            <li class="nav-item ${currentPath.includes('analytics.html') ? 'active' : ''}">
              <a href="#" onclick="showV2Popup(event)"><i class="fa-solid fa-chart-column"></i> <span>Analytics</span></a>
            </li>
          </div>
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

  const softwareInfoBtn = document.getElementById('software-info-btn');
  if (softwareInfoBtn) {
    softwareInfoBtn.addEventListener('click', () => {
      const popup = document.createElement('div');
      popup.className = 'modal-overlay active';
      popup.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 99999; backdrop-filter: blur(8px); opacity: 0; transition: opacity 0.3s ease;';
      
      popup.innerHTML = `
        <div style="background: var(--bg-secondary); padding: 48px; border-radius: 32px; text-align: center; max-width: 480px; width: 90%; box-shadow: 0 24px 80px rgba(0,0,0,0.3); border: 1px solid var(--border-color); transform: scale(0.9); transition: transform 0.3s ease; position: relative;">
          <img src="../assets/images/logo.jpg" style="width: 96px; height: 96px; border-radius: 24px; margin-bottom: 24px; box-shadow: 0 12px 32px rgba(37,99,235,0.3);">
          <h2 style="font-family: var(--font-heading); color: var(--text-main); font-size: 2.2rem; font-weight: 800; margin-bottom: 12px;">Techora <span style="color: var(--color-primary);">EduFee</span></h2>
          <p style="color: var(--text-muted); font-size: 1.05rem; line-height: 1.6; margin-bottom: 32px;">
            The most powerful, secure, and intuitive fee management platform built specifically for modern educational institutions.
            <br><br><span style="font-size: 0.9rem; font-weight: 600; padding: 6px 12px; background: rgba(37,99,235,0.1); color: var(--color-primary); border-radius: 8px;">Version 1.0.0 (Pro)</span>
          </p>
          <button id="close-software-info" style="background: linear-gradient(135deg, var(--color-primary), var(--color-accent)); color: #fff; border: none; padding: 14px 40px; border-radius: 12px; font-weight: 600; font-size: 1rem; cursor: pointer; transition: transform 0.2s ease, box-shadow 0.2s ease; box-shadow: 0 8px 24px rgba(37,99,235,0.3);" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 12px 28px rgba(37,99,235,0.4)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 24px rgba(37,99,235,0.3)';">Awesome!</button>
        </div>
      `;
      
      document.body.appendChild(popup);
      
      // Trigger animation
      setTimeout(() => {
        popup.style.opacity = '1';
        popup.firstElementChild.style.transform = 'scale(1)';
      }, 10);
      
      const closePopup = () => {
        popup.style.opacity = '0';
        popup.firstElementChild.style.transform = 'scale(0.9)';
        setTimeout(() => popup.remove(), 300);
      };
      
      document.getElementById('close-software-info').addEventListener('click', closePopup);
      popup.addEventListener('click', (e) => {
        if (e.target === popup) closePopup();
      });
    });
  }


  // Set Theme Class
  const currentTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);
}

window.toggleTheme = () => {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
};

window.logout = () => {
  const popup = document.createElement('div');
  popup.className = 'modal-overlay active';
  popup.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; z-index: 999999; backdrop-filter: blur(8px); opacity: 0; transition: opacity 0.3s ease;';
  
  popup.innerHTML = `
    <div style="background: var(--bg-secondary); padding: 40px; border-radius: 24px; text-align: center; max-width: 400px; width: 90%; box-shadow: 0 24px 60px rgba(0,0,0,0.3); border: 1px solid var(--border-color); transform: scale(0.9); transition: transform 0.3s ease;">
      <div style="width: 80px; height: 80px; border-radius: 50%; background: rgba(239, 68, 68, 0.1); color: #ef4444; display: flex; align-items: center; justify-content: center; font-size: 32px; margin: 0 auto 24px auto;">
        <i class="fa-solid fa-arrow-right-from-bracket"></i>
      </div>
      <h3 style="font-family: var(--font-heading); color: var(--text-main); font-size: 1.5rem; margin-bottom: 12px;">Confirm Logout</h3>
      <p style="color: var(--text-muted); font-size: 1rem; line-height: 1.5; margin-bottom: 32px;">Are you sure you want to log out of Techora EduFee?</p>
      
      <div style="display: flex; gap: 16px; justify-content: center;">
        <button id="cancel-logout" style="flex: 1; padding: 12px; border-radius: 12px; background: transparent; border: 1px solid var(--border-color); color: var(--text-main); font-weight: 600; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='var(--bg-tertiary)'" onmouseout="this.style.background='transparent'">Cancel</button>
        <button id="confirm-logout" style="flex: 1; padding: 12px; border-radius: 12px; background: #ef4444; border: none; color: white; font-weight: 600; cursor: pointer; transition: transform 0.2s; box-shadow: 0 8px 16px rgba(239,68,68,0.3);" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">Logout</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(popup);
  
  // Animation
  setTimeout(() => {
    popup.style.opacity = '1';
    popup.firstElementChild.style.transform = 'scale(1)';
  }, 10);
  
  const closePopup = () => {
    popup.style.opacity = '0';
    popup.firstElementChild.style.transform = 'scale(0.9)';
    setTimeout(() => popup.remove(), 300);
  };
  
  document.getElementById('cancel-logout').addEventListener('click', closePopup);
  document.getElementById('confirm-logout').addEventListener('click', () => {
    api.clearToken();
    window.location.href = 'login.html';
  });
  
  popup.addEventListener('click', (e) => {
    if (e.target === popup) closePopup();
  });
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

window.toggleV2Submenu = function(e) {
  e.preventDefault();
  const submenu = document.getElementById('v2-submenu');
  const icon = document.getElementById('v2-submenu-icon');
  if (submenu.style.display === 'none') {
    submenu.style.display = 'block';
    if(icon) icon.style.transform = 'rotate(180deg)';
  } else {
    submenu.style.display = 'none';
    if(icon) icon.style.transform = 'rotate(0deg)';
  }
};

window.showV2Popup = function(e) {
  if (e) e.preventDefault();
  
  const overlay = document.createElement('div');
  overlay.id = 'v2-popup-modal';
  overlay.style.cssText = 'display: flex; align-items: center; justify-content: center; z-index: 99999; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(4px); position: fixed; top: 0; left: 0; right: 0; bottom: 0; animation: v2fadeIn 0.3s ease-out;';
  
  const content = document.createElement('div');
  content.style.cssText = 'background: var(--bg-secondary); padding: 40px; border-radius: 20px; max-width: 450px; width: 90%; text-align: center; box-shadow: var(--shadow-lg); border: 1px solid var(--border-color); position: relative; animation: v2slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); color: var(--text-main);';

  document.body.style.overflow = 'hidden';
  
  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
  closeBtn.style.cssText = 'position: absolute; top: 15px; right: 15px; background: transparent; border: none; font-size: 1.25rem; color: var(--text-muted); cursor: pointer; transition: color 0.2s;';
  closeBtn.onmouseover = () => closeBtn.style.color = 'var(--text-main)';
  closeBtn.onmouseout = () => closeBtn.style.color = 'var(--text-muted)';
  
  const closePopup = () => {
    overlay.style.animation = 'v2fadeOut 0.3s ease-out forwards';
    content.style.animation = 'v2slideDown 0.3s ease-in forwards';
    setTimeout(() => {
      overlay.remove();
      document.body.style.overflow = '';
    }, 300);
  };
  
  closeBtn.onclick = closePopup;
  overlay.onclick = (event) => {
    if (event.target === overlay) closePopup();
  };
  
  content.innerHTML = `
    <div style="width: 80px; height: 80px; background: rgba(59, 130, 246, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
      <i class="fa-solid fa-rocket" style="font-size: 2.5rem; color: var(--color-primary);"></i>
    </div>
    <h3 style="margin-bottom: 15px; font-size: 1.5rem; font-weight: 700; color: var(--text-main);">Coming Soon!</h3>
    <p style="margin-bottom: 30px; font-size: 1.05rem; line-height: 1.6; color: var(--text-muted);">This section is not available in this version.</p>
    <button class="btn btn-primary" style="width: 100%; padding: 12px; border-radius: 12px; font-size: 1.1rem; font-weight: 600; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); border: none; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; background: var(--color-primary); color: white;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(59, 130, 246, 0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(59, 130, 246, 0.3)'">Got it, thanks!</button>
  `;
  
  if (!document.getElementById('v2-popup-styles')) {
    const style = document.createElement('style');
    style.id = 'v2-popup-styles';
    style.innerHTML = `
      @keyframes v2fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes v2fadeOut { from { opacity: 1; } to { opacity: 0; } }
      @keyframes v2slideUp { from { opacity: 0; transform: translateY(30px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
      @keyframes v2slideDown { from { opacity: 1; transform: translateY(0) scale(1); } to { opacity: 0; transform: translateY(20px) scale(0.95); } }
    `;
    document.head.appendChild(style);
  }
  
  content.appendChild(closeBtn);
  content.querySelector('.btn-primary').onclick = closePopup;
  overlay.appendChild(content);
  document.body.appendChild(overlay);
};
