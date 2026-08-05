
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
        <button class="custom-alert-button" id="custom-confirm-cancel-btn" style="background: var(--border-color); color: var(--text-main); box-shadow: none;">No</button>
        <button class="custom-alert-button" id="custom-confirm-ok-btn" style="background: #ef4444; color: white; box-shadow: 0 4px 14px rgba(239, 68, 68, 0.35);">Yes</button>
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



// Mock API Methods
const API_BASE = '/api';

const fetchApi = async (endpoint, options = {}) => {
  const token = api.getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
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
    const res = await fetch(`${API_BASE}/login`, {
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
    return await fetchApi(`/students?${query}`);
  },
  getStudent: async (id) => fetchApi(`/students/${id}`),
  createStudent: async (formData) => {
    const data = Object.fromEntries(formData);
    return await fetchApi('/students', { method: 'POST', body: JSON.stringify(data) });
  },
  updateStudent: async (id, formData) => ({}),
  deleteStudent: async (id) => fetchApi(`/students/${id}`, { method: 'DELETE' }),

  // Batches
  getBatches: async () => fetchApi('/batches'),
  createBatch: async (data) => fetchApi('/batches', { method: 'POST', body: JSON.stringify(data) }),
  updateBatch: async (id, data) => ({}),
  deleteBatch: async (id) => {},

  // Classes
  getClasses: async () => fetchApi('/classes'),
  createClass: async (data) => fetchApi('/classes', { method: 'POST', body: JSON.stringify(data) }),
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
    return await fetchApi(`/fees?${query}`);
  },
  createFee: async (feeData) => ({}),
  issueBulkFees: async (filters, feeData) => [],
  collectPayment: async (feeId, paymentData) => fetchApi(`/fees/${feeId}/pay`, { method: 'POST', body: JSON.stringify(paymentData) }),
  downloadReceipt: async (feeId, paymentId = '') => {},

  // Attendance
  getAttendance: async (date, className, batch) => {
    const params = new URLSearchParams({ date, className, batch: batch || '' }).toString();
    return await fetchApi(`/attendance?${params}`);
  },
  markAttendance: async (data) => fetchApi('/attendance', { method: 'POST', body: JSON.stringify(data) }),

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
        <style>
          @keyframes popFloat {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-15px) rotate(5deg); }
          }
          @keyframes popPulse {
            0%, 100% { opacity: 0.15; transform: scale(1); }
            50% { opacity: 0.3; transform: scale(1.2); }
          }
          @keyframes popShine {
            0% { left: -100%; }
            100% { left: 200%; }
          }
          .pop-floating-el { animation: popFloat 4s ease-in-out infinite; }
          .pop-pulse-el { animation: popPulse 4s ease-in-out infinite; }
          .pop-logo-container { position: relative; overflow: hidden; }
          .pop-logo-container::after {
            content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
            transform: skewX(-20deg); animation: popShine 3s infinite;
          }
        </style>
        <div style="background: var(--bg-secondary); padding: 48px; border-radius: 32px; text-align: center; max-width: 480px; width: 90%; box-shadow: 0 24px 80px rgba(0,0,0,0.3), 0 0 40px rgba(37,99,235,0.05) inset; border: 1px solid rgba(255,255,255,0.05); transform: scale(0.9); transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); position: relative; overflow: hidden;">
          
          <!-- Animated Background Glows -->
          <div class="pop-pulse-el" style="position: absolute; top: -50px; left: -50px; width: 200px; height: 200px; background: var(--color-primary); filter: blur(100px); border-radius: 50%; pointer-events: none;"></div>
          <div class="pop-pulse-el" style="position: absolute; bottom: -50px; right: -50px; width: 200px; height: 200px; background: var(--color-accent); filter: blur(100px); border-radius: 50%; pointer-events: none; animation-delay: 2s;"></div>
          
          <!-- Floating Decorative Elements -->
          <div class="pop-floating-el" style="position: absolute; top: 15%; left: 10%; width: 24px; height: 24px; border-radius: 50%; background: linear-gradient(135deg, var(--color-primary), transparent); opacity: 0.4;"></div>
          <div class="pop-floating-el" style="position: absolute; bottom: 20%; right: 10%; width: 32px; height: 32px; border-radius: 8px; background: linear-gradient(135deg, var(--color-accent), transparent); opacity: 0.3; transform: rotate(45deg); animation-delay: 1s;"></div>
          <div class="pop-floating-el" style="position: absolute; top: 30%; right: 15%; width: 12px; height: 12px; border-radius: 50%; background: var(--color-primary); opacity: 0.5; animation-delay: 2.5s;"></div>
          <div class="pop-floating-el" style="position: absolute; bottom: 35%; left: 12%; width: 18px; height: 18px; background: var(--color-accent); opacity: 0.4; border-radius: 4px; transform: rotate(15deg); animation-delay: 1.5s;"></div>
          
          <div style="position: relative; z-index: 1;">
            <div class="pop-logo-container pop-floating-el" style="display: inline-block; padding: 12px; background: linear-gradient(135deg, rgba(37,99,235,0.05), rgba(124,58,237,0.05)); border-radius: 28px; margin-bottom: 24px; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.05), 0 12px 32px rgba(37,99,235,0.15); animation-duration: 6s;">
              <img src="../assets/images/logo.jpg" style="width: 88px; height: 88px; border-radius: 20px; object-fit: cover;">
            </div>
            
            <h2 style="font-family: var(--font-heading); font-size: 2.5rem; font-weight: 800; margin-bottom: 16px; color: var(--text-main); letter-spacing: -0.02em;">Techora <span style="background: linear-gradient(135deg, var(--color-primary), var(--color-accent)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">EduFee</span></h2>
            
            <p style="color: var(--text-muted); font-size: 1.1rem; line-height: 1.6; margin-bottom: 36px; font-weight: 400; max-width: 90%; margin-left: auto; margin-right: auto;">
              The most powerful, secure, and intuitive fee management platform built specifically for modern educational institutions.
            </p>
            
            <div style="margin-bottom: 36px;">
              <span style="font-size: 0.85rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; padding: 8px 16px; background: linear-gradient(135deg, rgba(37,99,235,0.1), rgba(124,58,237,0.1)); color: var(--color-primary); border-radius: 20px; border: 1px solid rgba(37,99,235,0.1); box-shadow: 0 4px 12px rgba(0,0,0,0.05);">Version 1.0.0 (Pro)</span>
            </div>

            <button id="close-software-info" style="background: linear-gradient(135deg, var(--color-primary), var(--color-accent)); color: #fff; border: none; padding: 16px 48px; border-radius: 16px; font-weight: 600; font-size: 1.05rem; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 8px 24px rgba(37,99,235,0.3), inset 0 1px 0 rgba(255,255,255,0.2);" onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 12px 32px rgba(37,99,235,0.4), inset 0 1px 0 rgba(255,255,255,0.2)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 24px rgba(37,99,235,0.3), inset 0 1px 0 rgba(255,255,255,0.2)';">Awesome!</button>
          </div>
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
