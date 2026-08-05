const fs = require('fs');
const path = require('path');

const apiPath = path.join(__dirname, 'frontend/assets/js/api.js');
let content = fs.readFileSync(apiPath, 'utf8');

// Remove initializeMockDB
const initStart = content.indexOf('const initializeMockDB = () => {');
const initEnd = content.indexOf('initializeMockDB();') + 'initializeMockDB();'.length;
content = content.substring(0, initStart) + '\n' + content.substring(initEnd);

// Replace the api object
const apiStart = content.indexOf('const api = {');
const apiEnd = content.indexOf('// Automate layout rendering');

const newApi = `const API_BASE = '/api';

const fetchApi = async (endpoint, options = {}) => {
  const token = api.getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = \`Bearer \${token}\`;
  
  const response = await fetch(\`\${API_BASE}\${endpoint}\`, { ...options, headers });
  if (!response.ok) {
    let err = 'API Error';
    try { const data = await response.json(); err = data.error || err; } catch(e){}
    throw new Error(err);
  }
  return response.json();
};

const api = {
  getToken: () => localStorage.getItem('token') || sessionStorage.getItem('token'),
  setToken: (token, remember = true) => {
    localStorage.setItem('token', token);
    sessionStorage.setItem('token', token);
  },
  clearToken: () => {
    sessionStorage.removeItem('token');
    localStorage.removeItem('token');
  },
  getUser: () => {
    // In a real app we'd fetch this or decode JWT on client, using mock profile for layout
    return { name: "Techora Admin", email: "admin@techora.in", role: "Super Admin" };
  },

  // Auth
  login: async (email, password) => {
    const res = await fetch(\`\${API_BASE}/login\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    api.setToken(data.token, document.getElementById('remember-me')?.checked);
    return data;
  },

  // Students CRUD
  getStudents: async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    return await fetchApi(\`/students?\${query}\`);
  },
  getStudent: async (id) => fetchApi(\`/students/\${id}\`),
  createStudent: async (formData) => {
    const data = Object.fromEntries(formData);
    return await fetchApi('/students', { method: 'POST', body: JSON.stringify(data) });
  },
  updateStudent: async (id, formData) => ({}),
  deleteStudent: async (id) => {},

  // Batches
  getBatches: async () => fetchApi('/batches'),
  createBatch: async (data) => fetchApi('/batches', { method: 'POST', body: JSON.stringify(data) }),
  updateBatch: async (id, data) => ({}),
  deleteBatch: async (id) => {},

  // Classes
  getClasses: async () => fetchApi('/classes'),
  createClass: async (data) => ({}),
  updateClass: async (id, data) => ({}),
  deleteClass: async (id) => {},

  // Timetable
  getTimetable: async () => [],
  saveTimetableSlot: async (data) => ({}),
  deleteTimetableSlot: async (id) => {},
  getTimetableSettings: async () => ({}),
  saveTimetableSettings: async (settings) => ({}),

  // Fees
  getFees: async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    return await fetchApi(\`/fees?\${query}\`);
  },
  createFee: async (feeData) => ({}),
  issueBulkFees: async (filters, feeData) => [],
  collectPayment: async (feeId, paymentData) => fetchApi(\`/fees/\${feeId}/pay\`, { method: 'POST', body: JSON.stringify(paymentData) }),
  downloadReceipt: async (feeId, paymentId = '') => {},

  // Attendance
  getAttendance: async (date, className, batch) => ({ records: [] }),
  markAttendance: async (data) => ({ success: true }),

  // WhatsApp
  getWhatsappSettings: async () => fetchApi('/settings/whatsapp').catch(()=>({})),
  updateWhatsappSettings: async (settings) => settings,
  getWhatsappStatus: async () => fetchApi('/whatsapp/status').catch(()=>({status: 'DISCONNECTED'})),
  getWhatsappQR: async () => fetchApi('/whatsapp/qr').catch(()=>({})),
  disconnectWhatsapp: async () => ({ success: true }),
  sendWhatsappMessage: async (phone, message) => ({ success: true }),
  getQueue: async () => ({ queue: [], stats: { isPaused: false, pendingCount: 0, sentCount: 0, failedCount: 0 } }),
  postQueueAction: async (action) => ({ success: true }),
  postReminderAction: async (id, action) => ({ success: true }),
  sendManualReminder: async (studentId, feeId) => ({ whatsappLink: '' }),

  // Dashboard Stats
  getDashboardStats: async () => ({ metrics: { totalStudents: 1, totalCollections: 2800, pendingFees: 0, overdueFees: 0 }, recentPayments: [], revenueChart: { labels: [], data: [] } }),

  // Analytics
  getAnalyticsStats: async () => ({ feeDistribution: { paid:0, partial:0, unpaid:0 }, attendanceHistory: [], reminderStats: { sentReminders:0, failedReminders:0, pendingReminders:0 } }),

  // Settings
  getSettings: async () => fetchApi('/settings/profile').catch(()=>({})),
  updateSettings: async (formData) => ({}),

  // Reports json
  getReportJson: async (type) => ({ title: '', headers: [], rows: [] }),

  // Tests & Academic Performance CRUD
  getTests: async (filters = {}) => [],
  getTest: async (id) => ({}),
  saveTest: async (data) => ({}),
  deleteTest: async (id) => ({ success: true }),
  getStudentPerformance: async (id) => ({ averagePercentage: "0", testsTaken: 0, highestPercentage: "0", records: [] })
};

`;

content = content.substring(0, apiStart) + newApi + content.substring(apiEnd);

fs.writeFileSync(apiPath, content, 'utf8');
console.log('Successfully updated api.js');
