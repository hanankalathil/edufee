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
    container.innerHTML = `<p style="text-align: center; grid-column: 1 / -1; color: var(--text-muted); padding: 40px;">No students matching current filters.</p>`;
    return;
  }

  container.innerHTML = students.map(s => {
    const img = s.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';
    return `
      <div class="glass-card student-card">
        <img src="${img}" alt="${s.name}" class="student-card-avatar">
        <div>
          <h4 class="student-card-name">${s.name}</h4>
          <p class="student-card-meta">${s.studentId} | ${s.class}</p>
          <p class="student-card-meta" style="font-weight: 600; color: var(--color-primary); margin-top: 4px;">${s.batch}</p>
        </div>
        <div class="student-card-actions">
          <button class="btn btn-secondary" onclick="window.location.href='student-profile.html?id=${s._id}'" style="font-size: 0.8rem; padding: 8px;">View Detail</button>
          <button class="btn btn-danger" onclick="deleteStudent('${s._id}')" style="padding: 8px; font-size: 0.8rem; max-width: 38px;"><i class="fa-regular fa-trash-can"></i></button>
        </div>
      </div>
    `;
  }).join('');
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
  const populateBatches = async () => {
    const batchSelect = document.getElementById('batch');
    if (!batchSelect) return;
    try {
      const batches = await api.getBatches();
      batchSelect.innerHTML = batches.map(b => `<option value="${b.name}">${b.name}</option>`).join('');
      
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

    // Combine Class and Stream if Plus One or Plus Two is selected
    let finalClass = classSelect.value;
    if (finalClass === 'Plus One' || finalClass === 'Plus Two') {
      finalClass = `${finalClass} ${streamSelect.value}`;
    }
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
    
    // Parse Class and Stream
    const studentClass = student.class || '';
    const classSelect = document.getElementById('class');
    const streamGroup = document.getElementById('student-stream-group');
    const streamSelect = document.getElementById('student-stream');

    let selectedClass = studentClass;
    let selectedStream = '';
    if (studentClass.startsWith('Plus One') || studentClass.startsWith('Plus Two')) {
      const parts = studentClass.split(' ');
      selectedClass = parts[0] + ' ' + parts[1];
      selectedStream = parts.slice(2).join(' ');
    }

    classSelect.value = selectedClass;
    if (selectedClass === 'Plus One' || selectedClass === 'Plus Two') {
      streamGroup.style.display = 'flex';
      streamSelect.required = true;
      streamSelect.value = selectedStream;
    } else {
      streamGroup.style.display = 'none';
      streamSelect.required = false;
      streamSelect.value = '';
    }

    document.getElementById('batch').value = student.batch;
    // Set checkboxes based on student.subjects
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
    document.getElementById('profile-subjects').textContent = s.subjects.join(', ');
    document.getElementById('profile-admission').textContent = new Date(s.admissionDate).toLocaleDateString();
    document.getElementById('profile-address').textContent = s.address || 'N/A';

    if (s.photo) {
      document.getElementById('profile-avatar').src = s.photo;
    } else {
      document.getElementById('profile-avatar').src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';
    }

    // KPIs
    document.getElementById('kpi-outstanding').textContent = `₹${data.feeSummary.totalDues.toLocaleString('en-IN')}`;
    document.getElementById('kpi-attendance').textContent = `${data.attendanceSummary.attendancePercentage}%`;

    // Render Fees table
    renderProfileFeesTable(data.feeSummary.records);

    // Render Attendance table
    renderProfileAttendanceTable(studentId);

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

window.switchProfileTab = (tabName) => {
  activeProfileTab = tabName;
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(btn => btn.classList.remove('active'));

  document.getElementById('tab-content-fees').style.display = 'none';
  document.getElementById('tab-content-attendance').style.display = 'none';

  if (tabName === 'fees') {
    tabs[0].classList.add('active');
    document.getElementById('tab-content-fees').style.display = 'block';
  } else {
    tabs[1].classList.add('active');
    document.getElementById('tab-content-attendance').style.display = 'block';
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
  const batchStreamGroup = document.getElementById('batch-stream-group');
  const batchStreamSelect = document.getElementById('batch-stream');

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

  const handleBatchClassChange = () => {
    const val = batchClassSelect.value;
    if (val === 'Plus One' || val === 'Plus Two') {
      batchStreamGroup.style.display = 'block';
      batchStreamSelect.required = true;
    } else {
      batchStreamGroup.style.display = 'none';
      batchStreamSelect.required = false;
      batchStreamSelect.value = '';
    }
    if (window.initializeCustomSelects) {
      window.initializeCustomSelects();
    }
  };

  batchClassSelect.addEventListener('change', handleBatchClassChange);

  // Form submission handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('batch-id').value;
    const name = document.getElementById('batch-name').value.trim();
    
    const baseClass = batchClassSelect.value;
    if (!baseClass) {
      alert('Please select a Class standard.');
      return;
    }

    let className = baseClass;
    if (baseClass === 'Plus One' || baseClass === 'Plus Two') {
      if (!batchStreamSelect.value) {
        alert('Please select a Stream.');
        return;
      }
      className = `${baseClass} ${batchStreamSelect.value}`;
    }

    const startTime = document.getElementById('batch-start-time').value;
    const endTime = document.getElementById('batch-end-time').value;
    if (!startTime || !endTime) {
      alert('Please fill out both Start Time and End Time.');
      return;
    }
    const timing = `${convert24to12(startTime)} - ${convert24to12(endTime)}`;
    const whatsappGroup = document.getElementById('batch-whatsapp-group').value.trim();

    try {
      if (id) {
        await api.updateBatch(id, { name, class: className, timing, whatsappGroup });
        alert('Batch updated successfully.');
      } else {
        await api.createBatch({ name, class: className, timing, whatsappGroup });
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
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 40px;">No batches configured. Click "Add New Batch" to create one.</td></tr>`;
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
          `<span style="color: var(--text-muted); font-size: 0.8rem; font-style: italic;">Using Global Link</span>`;

        return `
          <tr>
            <td style="font-weight: 600;">${batch.name}</td>
            <td>${batch.class}</td>
            <td><span class="badge" style="${badgeStyle}">${batch.timing}</span></td>
            <td>${groupDisplay}</td>
            <td><span style="font-weight: 700;">${studentCount}</span> Students</td>
            <td style="text-align: center;">
              <div style="display: flex; gap: 8px; justify-content: center;">
                <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.8rem; height: auto;" onclick="filterByBatch('${batch.name}')">
                  <i class="fa-solid fa-users"></i> View Students
                </button>
                <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.8rem; height: auto;" onclick="openEditBatchModal('${batch._id}')">
                  <i class="fa-solid fa-pencil"></i> Edit
                </button>
                <button class="btn btn-danger" style="padding: 6px 12px; font-size: 0.8rem; height: auto;" onclick="deleteBatch('${batch._id}')">
                  <i class="fa-solid fa-trash"></i> Delete
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');

    } catch (error) {
      console.error(error);
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #ef4444; padding: 20px;">Error loading batches.</td></tr>`;
    }
  };

  window.openAddBatchModal = () => {
    document.getElementById('modal-title').textContent = 'Add New Batch';
    document.getElementById('batch-id').value = '';
    document.getElementById('batch-form').reset();
    
    batchClassSelect.value = '';
    batchStreamSelect.value = '';
    batchStreamGroup.style.display = 'none';
    batchStreamSelect.required = false;

    document.getElementById('batch-start-time').value = '';
    document.getElementById('batch-end-time').value = '';
    document.getElementById('batch-whatsapp-group').value = '';

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
      document.getElementById('batch-whatsapp-group').value = batch.whatsappGroup || '';
      
      let batchClass = batch.class || '';
      let selectedClass = batchClass;
      let selectedStream = '';

      if (batchClass.startsWith('Plus One') || batchClass.startsWith('Plus Two')) {
        const parts = batchClass.split(' ');
        selectedClass = parts[0] + ' ' + parts[1];
        selectedStream = parts.slice(2).join(' ');
      }

      batchClassSelect.value = selectedClass;
      if (selectedClass === 'Plus One' || selectedClass === 'Plus Two') {
        batchStreamGroup.style.display = 'block';
        batchStreamSelect.required = true;
        batchStreamSelect.value = selectedStream;
      } else {
        batchStreamGroup.style.display = 'none';
        batchStreamSelect.required = false;
        batchStreamSelect.value = '';
      }

      const parts = (batch.timing || '').split('-');
      if (parts.length === 2) {
        document.getElementById('batch-start-time').value = convert12to24(parts[0].trim());
        document.getElementById('batch-end-time').value = convert12to24(parts[1].trim());
      } else {
        document.getElementById('batch-start-time').value = '';
        document.getElementById('batch-end-time').value = '';
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

  // Initial render
  renderBatchesTable();
}

window.filterByBatch = (batchName) => {
  window.location.href = `students.html?batch=${encodeURIComponent(batchName)}`;
};
