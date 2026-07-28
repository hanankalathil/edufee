document.addEventListener('DOMContentLoaded', () => {
  const currentPath = window.location.pathname;

  if (currentPath.endsWith('students.html')) {
    initStudentsList();
  }

  if (currentPath.endsWith('add-student.html')) {
    initAddStudentPage();
  }

  if (currentPath.endsWith('student-profile.html')) {
    initStudentProfilePage();
  }

  if (currentPath.endsWith('batches.html')) {
    initBatchesPage();
  }
});

/* ==========================================
   1. STUDENTS DIRECTORY LIST
   ========================================== */
async function initStudentsList() {
  const searchInput = document.getElementById('search-input');
  const classFilter = document.getElementById('filter-class');
  const batchFilter = document.getElementById('filter-batch');

  // Load dynamic batches for the filter dropdown
  try {
    const batches = await api.getBatches();
    batchFilter.innerHTML = '<option value="">All Batches</option>' + 
      batches.map(b => `<option value="${b.name}">${b.name}</option>`).join('');
    
    // Check if there is a URL param for batch to filter initially
    const urlParams = new URLSearchParams(window.location.search);
    const initialBatch = urlParams.get('batch');
    if (initialBatch) {
      batchFilter.value = initialBatch;
    }
    
    if (window.initializeCustomSelects) {
      window.initializeCustomSelects();
    }
  } catch (error) {
    console.error('Failed to populate batch filters:', error);
  }

  // Load and render
  const render = async () => {
    const students = await api.getStudents({
      search: searchInput.value,
      className: classFilter.value,
      batch: batchFilter.value
    });
    renderStudentCards(students);
  };

  searchInput.addEventListener('input', render);
  classFilter.addEventListener('change', render);
  batchFilter.addEventListener('change', render);

  // Initial load
  render();
}

function renderStudentCards(students) {
  const container = document.getElementById('students-grid-container');
  if (!container) return;

  if (students.length === 0) {
    container.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #6b7280; padding: 40px; font-size: 0.875rem;">No students matching current filters.</td></tr>`;
    const paginationInfo = document.getElementById('table-pagination-info');
    if (paginationInfo) paginationInfo.textContent = 'Showing 0 entries';
    return;
  }

  container.innerHTML = students.map(s => {
    let admDate = s.admissionDate ? new Date(s.admissionDate).toLocaleDateString() : 'N/A';
    const img = s.photo || '../assets/images/default-avatar.svg';
    
    return `
      <tr style="border-bottom: 1px solid #e5e7eb; background: white; transition: background 0.15s;" onmouseover="this.style.background='#f9fafb'" onmouseout="this.style.background='white'">
        <td style="padding: 16px 20px; font-size: 0.875rem; font-weight: 700; color: #111827;">${s.studentId}</td>
        <td style="padding: 16px 20px; font-size: 0.875rem; color: #374151; font-weight: 500;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <img src="${img}" alt="${s.name}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;">
            <span>${s.name}</span>
          </div>
        </td>
        <td style="padding: 16px 20px; font-size: 0.875rem; color: #374151;">
          <div style="font-weight: 500;">${s.class}</div>
          <div style="font-size: 0.75rem; color: #6b7280; margin-top: 4px;">${s.batch}</div>
        </td>
        <td style="padding: 16px 20px; font-size: 0.875rem; color: #374151;">
          <div style="font-weight: 500;">${s.parentName || 'N/A'}</div>
          <div style="font-size: 0.75rem; color: #2563eb; font-weight: 500; margin-top: 4px;">${s.whatsappNumber || 'N/A'}</div>
        </td>
        <td style="padding: 16px 20px; font-size: 0.875rem; color: #374151;">${admDate}</td>
        <td style="padding: 16px 20px; text-align: right;">
          <div style="display: flex; gap: 8px; justify-content: flex-end;">
            <button title="View Details" style="width: 32px; height: 32px; border: 1px solid #e5e7eb; border-radius: 6px; background: white; color: #6b7280; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.borderColor='#9ca3af'; this.style.color='#374151';" onmouseout="this.style.borderColor='#e5e7eb'; this.style.color='#6b7280';" onclick="window.location.href='student-profile.html?id=${s._id}'">
              <i class="fa-regular fa-eye" style="font-size: 0.875rem;"></i>
            </button>
            <button title="Edit Student" style="width: 32px; height: 32px; border: 1px solid #d1fae5; border-radius: 6px; background: white; color: #10b981; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.borderColor='#10b981'" onmouseout="this.style.borderColor='#d1fae5'" onclick="window.location.href='add-student.html?id=${s._id}'">
              <i class="fa-solid fa-pencil" style="font-size: 0.875rem;"></i>
            </button>
            <button title="Delete Student" style="width: 32px; height: 32px; border: 1px solid #fee2e2; border-radius: 6px; background: white; color: #ef4444; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.borderColor='#ef4444'" onmouseout="this.style.borderColor='#fee2e2'" onclick="deleteStudent('${s._id}')">
              <i class="fa-regular fa-trash-can" style="font-size: 0.875rem;"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  const paginationInfo = document.getElementById('table-pagination-info');
  if (paginationInfo) {
    paginationInfo.textContent = `Showing 1 to ${students.length} of ${students.length} entries`;
  }
}

window.deleteStudent = async (id) => {
  if (await confirm('Are you sure you want to permanently delete this student record?')) {
    try {
      await api.deleteStudent(id);
      alert('Student deleted successfully.');
      initStudentsList();
    } catch (e) {
      alert(e.message);
    }
  }
};

/* ==========================================
   2. ADD / EDIT STUDENT
   ========================================== */
function initAddStudentPage() {
  const form = document.getElementById('student-form');
  const photoInput = document.getElementById('photo');
  const uploadPreview = document.getElementById('upload-preview');
  const urlParams = new URLSearchParams(window.location.search);
  const studentId = urlParams.get('id');

  const classSelect = document.getElementById('class');
  const streamGroup = document.getElementById('student-stream-group');
  const streamSelect = document.getElementById('student-stream');

  const handleClassChange = () => {
    const val = classSelect.value;
    if (val === 'Plus One' || val === 'Plus Two') {
      streamGroup.style.display = 'flex';
      streamSelect.required = true;
    } else {
      streamGroup.style.display = 'none';
      streamSelect.required = false;
      streamSelect.value = '';
    }
    if (window.initializeCustomSelects) {
      window.initializeCustomSelects();
    }
  };

  classSelect.addEventListener('change', handleClassChange);

  // Handle interactive subjects checkboxes styling
  document.querySelectorAll('.subject-pill').forEach(pill => {
    const cb = pill.querySelector('.subject-checkbox');
    cb.addEventListener('change', () => {
      if (cb.checked) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });
  });

  // Handle image preview
  photoInput.addEventListener('change', () => {
    const file = photoInput.files[0];
    if (file) {
      const btnText = document.getElementById('upload-btn-text');
      if (btnText) btnText.textContent = file.name;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        uploadPreview.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  // Populate batches select dynamically and handle Edit check once populated
  let allBatches = [];
  
  window.updateSubjectsForBatch = (batchName, overrideSubjects = null) => {
    const subjectsContainer = document.querySelector('.subjects-pill-group');
    if (!subjectsContainer) return;
    
    const selectedBatch = allBatches.find(b => b.name === batchName);
    if (selectedBatch && selectedBatch.subjects && selectedBatch.subjects.length > 0) {
      subjectsContainer.innerHTML = selectedBatch.subjects.map(subject => {
        const isSelected = overrideSubjects ? overrideSubjects.includes(subject) : true;
        return `
        <label class="subject-pill ${isSelected ? 'active' : ''}">
          <input type="checkbox" value="${subject}" class="subject-checkbox" ${isSelected ? 'checked' : ''}>
          <span>${subject}</span>
        </label>
      `}).join('');
    } else {
      subjectsContainer.innerHTML = '<span style="color: var(--text-muted); font-size: 0.85rem;">No subjects configured for this batch.</span>';
    }

    // Re-bind interactive subject checkboxes styling
    subjectsContainer.querySelectorAll('.subject-pill').forEach(pill => {
      const cb = pill.querySelector('.subject-checkbox');
      cb.addEventListener('change', () => {
        if (cb.checked) {
          pill.classList.add('active');
        } else {
          pill.classList.remove('active');
        }
      });
    });
  };

  const batchSelectEl = document.getElementById('batch');
  if (batchSelectEl) {
    batchSelectEl.addEventListener('change', (e) => {
      const selectedBatchName = e.target.value;
      window.updateSubjectsForBatch(selectedBatchName);
      
      if (classSelect) {
        if (selectedBatchName) {
          const selectedBatch = allBatches.find(b => b.name === selectedBatchName);
          if (selectedBatch && selectedBatch.class) {
            classSelect.innerHTML = `<option value="${selectedBatch.class}">${selectedBatch.class}</option>`;
            classSelect.value = selectedBatch.class;
            classSelect.disabled = false;
            classSelect.dispatchEvent(new Event('change'));
          }
        } else {
          classSelect.innerHTML = '<option value="">Select Batch First...</option>';
          classSelect.disabled = true;
          classSelect.dispatchEvent(new Event('change'));
        }
      }
    });
  }

  const populateBatches = async () => {
    const batchSelect = document.getElementById('batch');
    if (!batchSelect) return;
    try {
      allBatches = await api.getBatches();
      batchSelect.innerHTML = '<option value="">Select Batch...</option>' + allBatches.map(b => `<option value="${b.name}">${b.name}</option>`).join('');
      
      if (studentId) {
        document.getElementById('form-title').textContent = 'Modify Student Record';
        await loadStudentDataForEdit(studentId);
      } else {
        // Set default admission date to today
        document.getElementById('admissionDate').value = new Date().toISOString().substring(0, 10);
      }

      if (window.initializeCustomSelects) {
        window.initializeCustomSelects();
      }
    } catch (e) {
      console.error('Error populating batch dropdown:', e);
    }
  };

  populateBatches();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);

    // Class is populated automatically from the selected batch
    let finalClass = classSelect.value;
    formData.set('class', finalClass);

    // Extract subjects from checkbox inputs and combine into a comma-separated string
    const checkedSubjects = Array.from(document.querySelectorAll('.subject-checkbox:checked'))
      .map(cb => cb.value)
      .join(', ');
    formData.set('subjects', checkedSubjects);

    // If there's an image in preview, mock appending it as base64
    if (uploadPreview.src && uploadPreview.src.startsWith('data:')) {
      formData.set('photo', uploadPreview.src);
    }

    try {
      if (studentId) {
        await api.updateStudent(studentId, formData);
        alert('Student record updated successfully.');
      } else {
        await api.createStudent(formData);
        alert('Student registered successfully.');
      }
      window.location.href = 'students.html';
    } catch (error) {
      alert('Error saving record: ' + error.message);
    }
  });
}

async function loadStudentDataForEdit(id) {
  try {
    const { student } = await api.getStudent(id);
    document.getElementById('studentId').value = student.studentId;
    document.getElementById('studentId').disabled = true; // Cannot edit roll id
    document.getElementById('name').value = student.name;
    document.getElementById('parentName').value = student.parentName;
    document.getElementById('whatsappNumber').value = student.whatsappNumber;
    document.getElementById('school').value = student.school;
    
    const classSelect = document.getElementById('class');
    const streamGroup = document.getElementById('student-stream-group');
    const streamSelect = document.getElementById('student-stream');
    
    // Hide stream group as we no longer need it with automatic class population
    if (streamGroup) streamGroup.style.display = 'none';
    if (streamSelect) {
      streamSelect.required = false;
      streamSelect.value = '';
    }

    const batchEl = document.getElementById('batch');
    if (batchEl) {
      batchEl.value = student.batch;
      batchEl.dispatchEvent(new Event('change'));
    }
    // Set checkboxes based on student.subjects
    if (window.updateSubjectsForBatch) {
      window.updateSubjectsForBatch(student.batch, student.subjects || []);
    } else {
      const subjects = student.subjects || [];
      document.querySelectorAll('.subject-checkbox').forEach(cb => {
        cb.checked = subjects.includes(cb.value);
        const pill = cb.closest('.subject-pill');
        if (pill) {
          if (cb.checked) {
            pill.classList.add('active');
          } else {
            pill.classList.remove('active');
          }
        }
      });
    }
    document.getElementById('admissionDate').value = new Date(student.admissionDate).toISOString().substring(0, 10);
    document.getElementById('address').value = student.address;
    
    if (student.photo) {
      document.getElementById('upload-preview').src = student.photo;
    }
  } catch (error) {
    alert('Error loading student record: ' + error.message);
  }
}

/* ==========================================
   3. STUDENT PROFILE
   ========================================== */
let activeProfileTab = 'fees';

async function initStudentProfilePage() {
  const urlParams = new URLSearchParams(window.location.search);
  const studentId = urlParams.get('id');
  if (!studentId) {
    alert('No student ID supplied.');
    window.location.href = 'students.html';
    return;
  }

  // Bind Edit button
  document.getElementById('edit-profile-btn').onclick = () => {
    window.location.href = `add-student.html?id=${studentId}`;
  };

  try {
    const data = await api.getStudent(studentId);
    const s = data.student;

    // Fill Sidebar
    document.getElementById('profile-name').textContent = s.name;
    document.getElementById('profile-id').textContent = `ID: ${s.studentId}`;
    document.getElementById('profile-class').textContent = s.class;
    document.getElementById('profile-batch').textContent = s.batch;
    document.getElementById('profile-whatsapp').textContent = s.whatsappNumber;
    document.getElementById('profile-parent').textContent = s.parentName;
    document.getElementById('profile-school').textContent = s.school || 'N/A';
    let subjectText = 'N/A';
    if (s.subjects && s.subjects.length > 3) {
      subjectText = s.subjects.slice(0, 3).join(', ') + `, +${s.subjects.length - 3} more`;
    } else if (s.subjects && s.subjects.length > 0) {
      subjectText = s.subjects.join(', ');
    }
    document.getElementById('profile-subjects').textContent = subjectText;
    document.getElementById('profile-admission').textContent = new Date(s.admissionDate).toLocaleDateString();
    document.getElementById('profile-address').textContent = s.address || 'N/A';

    const waLink = document.getElementById('profile-whatsapp-link');
    if (waLink) {
      const cleanPhone = s.whatsappNumber.replace(/\D/g, '');
      waLink.href = `https://wa.me/${cleanPhone}`;
    }

    if (s.photo) {
      document.getElementById('profile-avatar').src = s.photo;
    } else {
      document.getElementById('profile-avatar').src = '../assets/images/default-avatar.svg';
    }

    // KPIs
    document.getElementById('kpi-outstanding').textContent = `₹${data.feeSummary.totalDues.toLocaleString('en-IN')}`;
    document.getElementById('kpi-attendance').textContent = `${data.attendanceSummary.attendancePercentage}%`;

    // Render Fees table
    renderProfileFeesTable(data.feeSummary.records);

    // Render Attendance table
    renderProfileAttendanceTable(studentId);

    // Render Academic records
    renderProfileAcademicTable(studentId);

  } catch (error) {
    console.error(error);
  }
}

function renderProfileFeesTable(records) {
  const tbody = document.getElementById('profile-fees-table');
  if (!tbody) return;

  if (records.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No invoice records.</td></tr>`;
    return;
  }

  tbody.innerHTML = records.map(f => {
    let badgeClass = 'badge-unpaid';
    if (f.status === 'Paid') badgeClass = 'badge-paid';
    if (f.status === 'Partial') badgeClass = 'badge-partial';

    return `
      <tr>
        <td style="font-weight: 600;">${f.billingPeriod}</td>
        <td>${f.feeType}</td>
        <td>₹${f.netAmount}</td>
        <td style="color: #10b981; font-weight: 600;">₹${f.paidAmount}</td>
        <td style="color: #ef4444; font-weight: 600;">₹${f.dueAmount}</td>
        <td><span class="badge ${badgeClass}">${f.status}</span></td>
        <td>
          <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.8rem;" onclick="api.downloadReceipt('${f._id}')">
            <i class="fa-solid fa-download"></i> Receipt
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

async function renderProfileAttendanceTable(studentId) {
  const tbody = document.getElementById('profile-attendance-table');
  if (!tbody) return;

  try {
    const list = JSON.parse(localStorage.getItem('attendance') || '[]');
    const studentRecords = [];

    list.forEach(sheet => {
      const record = sheet.records.find(r => r.studentId === studentId);
      if (record) {
        studentRecords.push({
          date: sheet.date,
          class: sheet.class,
          batch: sheet.batch,
          status: record.status
        });
      }
    });

    if (studentRecords.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">No attendance entries recorded.</td></tr>`;
      return;
    }

    tbody.innerHTML = studentRecords.map(r => `
      <tr>
        <td>${new Date(r.date).toLocaleDateString()}</td>
        <td>${r.class}</td>
        <td>${r.batch}</td>
        <td>
          <span class="badge ${r.status === 'Present' ? 'badge-paid' : 'badge-unpaid'}">${r.status}</span>
        </td>
      </tr>
    `).join('');

  } catch (error) {
    console.error(error);
  }
}

async function renderProfileAcademicTable(studentId) {
  const tbody = document.getElementById('profile-academic-table');
  const avgKpi = document.getElementById('kpi-avg-score');
  const countKpi = document.getElementById('kpi-tests-taken');
  if (!tbody) return;

  try {
    const performance = await api.getStudentPerformance(studentId);
    if (avgKpi) avgKpi.textContent = `${performance.averagePercentage}%`;
    if (countKpi) countKpi.textContent = performance.testsTaken;

    if (performance.records.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No academic records found for this student.</td></tr>`;
      return;
    }

    tbody.innerHTML = performance.records.map(r => {
      let scoreColor = 'color: #ef4444;';
      if (r.percentage >= 75) {
        scoreColor = 'color: #10b981;';
      } else if (r.percentage >= 50) {
        scoreColor = 'color: #f59e0b;';
      }

      return `
        <tr>
          <td class="wrap-cell" style="font-weight: 600;">${r.name}</td>
          <td>${r.subject}</td>
          <td>${new Date(r.date).toLocaleDateString()}</td>
          <td><span style="${scoreColor} font-weight: 700;">${r.marks}</span> / ${r.maxMarks}</td>
          <td>${r.classAverage}%</td>
          <td>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="flex: 1; height: 6px; background: var(--border-color); border-radius: 3px; overflow: hidden; width: 60px;">
                <div style="height: 100%; width: ${r.percentage}%; background: ${r.percentage >= 75 ? '#10b981' : (r.percentage >= 50 ? '#f59e0b' : '#ef4444')};"></div>
              </div>
              <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">${r.percentage}%</span>
            </div>
          </td>
          <td class="wrap-cell" style="font-style: italic; color: var(--text-muted); font-size: 0.85rem;">${r.remarks || 'None'}</td>
        </tr>
      `;
    }).join('');

  } catch (error) {
    console.error('Error rendering profile academic table:', error);
  }
}

window.switchProfileTab = (tabName) => {
  activeProfileTab = tabName;
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(btn => btn.classList.remove('active'));

  document.getElementById('tab-content-fees').style.display = 'none';
  document.getElementById('tab-content-attendance').style.display = 'none';
  document.getElementById('tab-content-academic').style.display = 'none';

  if (tabName === 'fees') {
    tabs[0].classList.add('active');
    document.getElementById('tab-content-fees').style.display = 'block';
  } else if (tabName === 'attendance') {
    tabs[1].classList.add('active');
    document.getElementById('tab-content-attendance').style.display = 'block';
  } else if (tabName === 'academic') {
    tabs[2].classList.add('active');
    document.getElementById('tab-content-academic').style.display = 'block';
  }
};

/* ==========================================
   4. BATCHES OVERVIEW
   ========================================== */
async function initBatchesPage() {
  const tbody = document.getElementById('batches-summary-table');
  const form = document.getElementById('batch-form');
  if (!tbody || !form) return;

  const batchClassSelect = document.getElementById('batch-class');

  const convert12to24 = (time12h) => {
    if (!time12h) return '';
    const parts = time12h.trim().split(' ');
    if (parts.length < 2) return '';
    const time = parts[0];
    const modifier = parts[1];
    let [hours, minutes] = time.split(':');
    if (hours === '12') {
      hours = '00';
    }
    if (modifier === 'PM') {
      hours = parseInt(hours, 10) + 12;
    }
    return `${String(hours).padStart(2, '0')}:${minutes}`;
  };

  const convert24to12 = (time24h) => {
    if (!time24h) return '';
    const [hoursStr, minutes] = time24h.split(':');
    let hours = parseInt(hoursStr, 10);
    const modifier = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${String(hours).padStart(2, '0')}:${minutes} ${modifier}`;
  };

  let allConfiguredClasses = [];
  
  const loadClassesForDropdown = async () => {
    try {
      allConfiguredClasses = await api.getClasses();
      if (batchClassSelect) {
        batchClassSelect.innerHTML = '<option value="">Select Class...</option>' + 
          allConfiguredClasses.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
      }
      if (window.initializeCustomSelects) {
        window.initializeCustomSelects();
      }
    } catch (e) {
      console.error(e);
    }
  };

  window.handleBatchClassSelection = (className) => {
    const id = document.getElementById('batch-id').value;
    if (!id && className) {
      const cls = allConfiguredClasses.find(c => c.name === className);
      const subjectsContainer = document.getElementById('batch-subjects-container');
      if (subjectsContainer && cls && cls.subjects) {
        subjectsContainer.innerHTML = '';
        cls.subjects.forEach(sub => window.addSubjectInputField(sub));
        window.updateSubjectCountBadge();
      }
    }
  };

  window.updateSubjectCountBadge = () => {
    const badge = document.getElementById('subject-count-badge');
    const count = document.querySelectorAll('.batch-subject-item').length;
    if (badge) {
      badge.textContent = `${count} Subject${count !== 1 ? 's' : ''}`;
    }
  };

  window.addSubjectInputField = (value = "") => {
    const container = document.getElementById('batch-subjects-container');
    if (!container) return;
    const index = container.querySelectorAll('.subject-input-row').length + 1;
    const div = document.createElement('div');
    div.className = 'subject-input-row';
    div.style.cssText = 'display: flex; gap: 10px; align-items: center; padding: 8px 12px; border-radius: 10px; background: var(--bg-main); border: 1px solid var(--border-color); transition: all 0.25s ease; opacity: 0; transform: translateY(-6px);';
    div.innerHTML = `
      <span class="subject-index-badge" style="min-width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: linear-gradient(135deg, var(--color-primary), #6366f1); color: #fff; font-size: 0.7rem; font-weight: 700;">${index}</span>
      <input type="text" class="form-control batch-subject-item" placeholder="e.g. Mathematics" value="${value}" style="flex: 1; padding: 7px 12px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-secondary); color: var(--text-main); font-size: 0.88rem;" required readonly>
    `;
    container.appendChild(div);
    // Animate in
    requestAnimationFrame(() => {
      div.style.opacity = '1';
      div.style.transform = 'translateY(0)';
    });
    // Auto-scroll to bottom
    container.scrollTop = container.scrollHeight;
    window.updateSubjectCountBadge();
  };

  window.reindexSubjects = () => {
    const rows = document.querySelectorAll('.subject-input-row');
    rows.forEach((row, i) => {
      const badge = row.querySelector('.subject-index-badge');
      if (badge) badge.textContent = i + 1;
    });
  };

  // Form submission handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('batch-id').value;
    const name = document.getElementById('batch-name').value.trim();
    
    const className = batchClassSelect.value;
    if (!className) {
      alert('Please select a Class.');
      return;
    }

    const cb = document.getElementById('batch-not-constant-cb');
    let timing = '';
    
    if (cb && cb.checked) {
      timing = 'Not Constant';
    } else {
      const startTime = document.getElementById('batch-start-time').value;
      const endTime = document.getElementById('batch-end-time').value;
      if (!startTime || !endTime) {
        alert('Please fill out both Start Time and End Time.');
        return;
      }
      timing = `${convert24to12(startTime)} - ${convert24to12(endTime)}`;
    }
    const price = parseFloat(document.getElementById('batch-price').value || 0);
    const whatsappGroup = document.getElementById('batch-whatsapp-group').value.trim();

    // Get subjects
    const subjectInputs = document.querySelectorAll('.batch-subject-item');
    const subjects = [];
    subjectInputs.forEach(input => {
      const val = input.value.trim();
      if (val && !subjects.includes(val)) {
        subjects.push(val);
      }
    });

    try {
      if (id) {
        await api.updateBatch(id, { name, class: className, timing, price, whatsappGroup, subjects });
        alert('Batch updated successfully.');
      } else {
        await api.createBatch({ name, class: className, timing, price, whatsappGroup, subjects });
        alert('Batch created successfully.');
      }
      closeBatchModal();
      renderBatchesTable();
    } catch (err) {
      alert(err.message);
    }
  });

  // Render function
  const renderBatchesTable = async () => {
    try {
      const batches = await api.getBatches();
      const students = await api.getStudents();

      if (batches.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 40px;">No batches configured. Click "Add New Batch" to create one.</td></tr>`;
        return;
      }

      tbody.innerHTML = batches.map(batch => {
        const studentCount = students.filter(s => s.batch === batch.name).length;
        
        let badgeStyle = "background: rgba(37, 99, 235, 0.08); color: var(--color-primary);";
        const nameLower = batch.name.toLowerCase();
        if (nameLower.includes('evening') || nameLower.includes('b')) {
          badgeStyle = "background: rgba(6, 182, 212, 0.08); color: var(--color-accent);";
        } else if (nameLower.includes('weekend') || nameLower.includes('special')) {
          badgeStyle = "background: rgba(245, 158, 11, 0.08); color: #f59e0b;";
        }

        const groupDisplay = batch.whatsappGroup ? 
          `<a href="${batch.whatsappGroup.startsWith('http') ? batch.whatsappGroup : 'https://chat.whatsapp.com/' + batch.whatsappGroup}" target="_blank" style="color: #25D366; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 6px;">
            <i class="fa-brands fa-whatsapp" style="font-size: 1.1rem;"></i> View Group
           </a>` : 
          `<span style="color: var(--text-muted); font-size: 0.8rem; font-style: italic;">Global Link</span>`;

        return `
          <tr>
            <td style="font-weight: 600;">${batch.name}</td>
            <td>${batch.class}</td>
            <td style="font-weight: 600;">₹${(batch.price || 0).toLocaleString('en-IN')}</td>
            <td><span class="badge" style="${badgeStyle}">${batch.timing}</span></td>
            <td>${groupDisplay}</td>
            <td>
              <div style="display: flex; flex-direction: column; gap: 4px; align-items: flex-start;">
                <span style="white-space: nowrap; font-size: 0.85rem;"><span style="font-weight: 700;">${studentCount}</span> Students</span>
                <button class="btn btn-secondary" style="padding: 3px 6px; font-size: 0.75rem; height: auto; white-space: nowrap;" onclick="filterByBatch('${batch.name}')">
                  <i class="fa-solid fa-users"></i> View
                </button>
              </div>
            </td>
            <td style="text-align: center;">
              <div style="display: flex; gap: 6px; justify-content: center;">
                <button class="btn btn-secondary" style="padding: 4px 8px; font-size: 0.75rem; height: auto; white-space: nowrap;" onclick="openEditBatchModal('${batch._id}')">
                  <i class="fa-solid fa-pencil"></i> Edit
                </button>
                <button class="btn btn-danger" style="padding: 4px 8px; font-size: 0.75rem; height: auto; white-space: nowrap;" onclick="deleteBatch('${batch._id}')">
                  <i class="fa-solid fa-trash"></i> Delete
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');

    } catch (error) {
      console.error(error);
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #ef4444; padding: 20px;">Error loading batches.</td></tr>`;
    }
  };

  window.openAddBatchModal = () => {
    document.getElementById('modal-title').textContent = 'Add New Batch';
    document.getElementById('batch-id').value = '';
    document.getElementById('batch-form').reset();
    
    batchClassSelect.value = '';

    document.getElementById('batch-start-time').value = '';
    document.getElementById('batch-end-time').value = '';
    const cb = document.getElementById('batch-not-constant-cb');
    if (cb) {
      cb.checked = false;
      if (typeof toggleNotConstant === 'function') toggleNotConstant();
    }

    document.getElementById('batch-price').value = '';
    document.getElementById('batch-whatsapp-group').value = '';

    // Clear and set default subjects
    const subjectsContainer = document.getElementById('batch-subjects-container');
    if (subjectsContainer) {
      subjectsContainer.innerHTML = '';
      window.addSubjectInputField("Mathematics");
      window.addSubjectInputField("Physics");
      window.addSubjectInputField("Chemistry");
    }

    document.getElementById('batch-modal').classList.add('active');

    if (window.initializeCustomSelects) {
      window.initializeCustomSelects();
    }
  };

  window.openEditBatchModal = async (id) => {
    try {
      const batches = await api.getBatches();
      const batch = batches.find(b => b._id === id);
      if (!batch) return;

      document.getElementById('modal-title').textContent = 'Modify Batch Details';
      document.getElementById('batch-id').value = batch._id;
      document.getElementById('batch-name').value = batch.name;
      document.getElementById('batch-price').value = batch.price || '';
      document.getElementById('batch-whatsapp-group').value = batch.whatsappGroup || '';
      
      let batchClass = batch.class || '';
      batchClassSelect.value = batchClass;

      const parts = (batch.timing || '').split('-');
      const cb = document.getElementById('batch-not-constant-cb');
      
      if (batch.timing === 'Not Constant') {
        if (cb) { cb.checked = true; if (typeof toggleNotConstant === 'function') toggleNotConstant(); }
        document.getElementById('batch-start-time').value = '';
        document.getElementById('batch-end-time').value = '';
      } else if (parts.length === 2 && (batch.timing.includes('AM') || batch.timing.includes('PM'))) {
        if (cb) { cb.checked = false; if (typeof toggleNotConstant === 'function') toggleNotConstant(); }
        document.getElementById('batch-start-time').value = convert12to24(parts[0].trim());
        document.getElementById('batch-end-time').value = convert12to24(parts[1].trim());
      } else {
        if (cb) { cb.checked = true; if (typeof toggleNotConstant === 'function') toggleNotConstant(); }
        document.getElementById('batch-start-time').value = '';
        document.getElementById('batch-end-time').value = '';
      }

      // Populate subjects
      const subjectsContainer = document.getElementById('batch-subjects-container');
      if (subjectsContainer) {
        subjectsContainer.innerHTML = '';
        if (batch.subjects && Array.isArray(batch.subjects)) {
          batch.subjects.forEach(sub => {
            window.addSubjectInputField(sub);
          });
        }
      }

      document.getElementById('batch-modal').classList.add('active');

      if (window.initializeCustomSelects) {
        window.initializeCustomSelects();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  window.closeBatchModal = () => {
    document.getElementById('batch-modal').classList.remove('active');
  };

  window.deleteBatch = async (id) => {
    if (await confirm('Are you sure you want to permanently delete this batch configuration?')) {
      try {
        await api.deleteBatch(id);
        alert('Batch deleted successfully.');
        renderBatchesTable();
      } catch (e) {
        alert(e.message);
      }
    }
  };

  // --- Manage Classes Logic ---

  window.openManageClassesModal = () => {
    document.getElementById('manage-classes-modal').classList.add('active');
    renderManageClassesList();
    resetManageClassForm();
  };

  window.closeManageClassesModal = () => {
    document.getElementById('manage-classes-modal').classList.remove('active');
    // Reload classes for dropdown in case they changed
    loadClassesForDropdown();
  };

  const renderManageClassesList = () => {
    const container = document.getElementById('manage-classes-list');
    if (!container) return;

    if (allConfiguredClasses.length === 0) {
      container.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 20px;">No classes configured.</p>`;
      return;
    }

    container.innerHTML = allConfiguredClasses.map(c => `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid var(--border-color);">
        <div>
          <h5 style="margin: 0; font-size: 0.95rem;">${c.name}</h5>
          <p style="margin: 4px 0 0; font-size: 0.75rem; color: var(--text-muted);">${c.subjects.length} Default Subjects</p>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-secondary" style="padding: 4px 8px; font-size: 0.75rem;" onclick="editManageClass('${c._id}')">
            <i class="fa-solid fa-pencil"></i>
          </button>
          <button class="btn btn-danger" style="padding: 4px 8px; font-size: 0.75rem;" onclick="deleteManageClass('${c._id}')">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    `).join('');
  };

  window.resetManageClassForm = () => {
    document.getElementById('manage-class-form-title').textContent = 'Add New Class';
    document.getElementById('manage-class-id').value = '';
    document.getElementById('manage-class-name').value = '';
    const container = document.getElementById('manage-class-subjects-container');
    if (container) container.innerHTML = '';
  };

  window.addManageClassSubjectField = (value = "") => {
    const container = document.getElementById('manage-class-subjects-container');
    if (!container) return;
    const index = container.querySelectorAll('.manage-class-subject-item').length + 1;
    const div = document.createElement('div');
    div.style.cssText = 'display: flex; gap: 10px; align-items: center; padding: 6px; border-radius: 8px; background: var(--bg-main); border: 1px solid var(--border-color);';
    div.innerHTML = `
      <input type="text" class="form-control manage-class-subject-item" placeholder="e.g. Mathematics" value="${value}" style="flex: 1; padding: 6px 10px; font-size: 0.85rem;" required>
      <button type="button" style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px;" onclick="this.parentElement.remove()" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='var(--text-muted)'">
        <i class="fa-solid fa-xmark"></i>
      </button>
    `;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  };

  window.editManageClass = (id) => {
    const cls = allConfiguredClasses.find(c => c._id === id);
    if (!cls) return;
    
    document.getElementById('manage-class-form-title').textContent = 'Edit Class Details';
    document.getElementById('manage-class-id').value = cls._id;
    document.getElementById('manage-class-name').value = cls.name;
    
    const container = document.getElementById('manage-class-subjects-container');
    if (container) {
      container.innerHTML = '';
      (cls.subjects || []).forEach(sub => window.addManageClassSubjectField(sub));
    }
  };

  window.deleteManageClass = async (id) => {
    if (await confirm('Are you sure you want to delete this class? It will not affect existing batches using it, but it will be removed from the options.')) {
      try {
        await api.deleteClass(id);
        allConfiguredClasses = await api.getClasses();
        renderManageClassesList();
      } catch (e) {
        alert(e.message);
      }
    }
  };

  const manageClassForm = document.getElementById('manage-class-form');
  if (manageClassForm) {
    manageClassForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!await confirm('Are you sure you want to save this class?')) return;
      const id = document.getElementById('manage-class-id').value;
      const name = document.getElementById('manage-class-name').value.trim();
      
      const subjectInputs = document.querySelectorAll('.manage-class-subject-item');
      const subjects = [];
      subjectInputs.forEach(input => {
        const val = input.value.trim();
        if (val && !subjects.includes(val)) {
          subjects.push(val);
        }
      });

      try {
        if (id) {
          await api.updateClass(id, { name, subjects });
        } else {
          await api.createClass({ name, subjects });
        }
        allConfiguredClasses = await api.getClasses();
        renderManageClassesList();
        resetManageClassForm();
      } catch (err) {
        alert(err.message);
      }
    });
  }

  // Initial render
  loadClassesForDropdown().then(() => {
    renderBatchesTable();
  });
}

window.filterByBatch = (batchName) => {
  window.location.href = `students.html?batch=${encodeURIComponent(batchName)}`;
};
