document.addEventListener('DOMContentLoaded', async () => {
  // Set default date in date picker to today
  document.getElementById('att-date').value = new Date().toISOString().substring(0, 10);
  
  // Parse URL query params
  const urlParams = new URLSearchParams(window.location.search);
  const classParam = urlParams.get('class');
  const batchParam = urlParams.get('batch');
  const dateParam = urlParams.get('date');

  if (dateParam) {
    document.getElementById('att-date').value = dateParam;
  }
  // Load batches dynamically based on selected class
  const batchSelect = document.getElementById('att-batch');
  const classSelect = document.getElementById('att-class');

  // Load dynamic classes
  async function loadClasses() {
    if (!classSelect) return;
    try {
      const classes = await api.getClasses();
      classSelect.innerHTML = '<option value="">Select Class...</option>' + 
        classes.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
      if (classParam) {
        classSelect.value = classParam;
      }
    } catch (e) {
      console.error('Error loading classes:', e);
    }
  }

  async function updateBatches() {
    if (!batchSelect || !classSelect) return;
    try {
      const selectedClass = classSelect.value;
      const batches = await api.getBatches();
      
      // Filter batches associated with the selected class
      const filtered = batches.filter(b => {
        if (!b.class) return true;
        if (b.class === 'All Classes') return true;
        return b.class.split(',').map(c => c.trim()).includes(selectedClass);
      });
      
      let options = '';
      if (filtered.length > 1) {
        options += `<option value="All Batches">All Batches (Combined)</option>`;
      }
      options += filtered.map(b => `<option value="${b.name}">${b.name}</option>`).join('');
      batchSelect.innerHTML = options || `<option value="">No batches for this class</option>`;
      
      if (batchParam && (batchParam === 'All Batches' || filtered.some(b => b.name === batchParam))) {
        batchSelect.value = batchParam;
      } else if (filtered.length > 1 && !batchParam) {
        batchSelect.value = "All Batches";
      } else if (filtered.length > 0) {
        batchSelect.value = filtered[0].name;
      }

      if (window.initializeCustomSelects) {
        window.initializeCustomSelects();
      }
    } catch (error) {
      console.error('Error loading batches in attendance page:', error);
    }
  }

  if (classSelect) {
    classSelect.addEventListener('change', async () => {
      await updateBatches();
      loadAttendanceSheet();
    });
  }

  const dateInput = document.getElementById('att-date');
  if (dateInput) {
    dateInput.addEventListener('change', () => {
      loadAttendanceSheet();
    });
  }

  if (batchSelect) {
    batchSelect.addEventListener('change', () => {
      loadAttendanceSheet();
    });
  }

  // Delegate attendance change event to update stats instantly
  const tbody = document.getElementById('attendance-list-body');
  if (tbody) {
    tbody.addEventListener('change', (e) => {
      if (e.target && e.target.classList.contains('attendance-switch-input')) {
        window.calculateSummaryStats();
      }
    });
  }

  // Load initially
  await loadClasses();
  await updateBatches();
  loadAttendanceSheet();
});

async function loadAttendanceSheet() {
  const date = document.getElementById('att-date').value;
  const className = document.getElementById('att-class').value;
  const batch = document.getElementById('att-batch').value;

  const tbody = document.getElementById('attendance-list-body');
  const card = document.getElementById('sheet-card');

  if (!date || !className || !batch) return;

  tbody.innerHTML = `
    <tr>
      <td colspan="4" style="text-align: center; color: var(--text-muted);">
        <i class="fa-solid fa-spinner fa-spin" style="font-size: 1.5rem; margin-bottom: 8px;"></i>
        <p>Loading class roster...</p>
      </td>
    </tr>
  `;
  card.style.display = 'block';

  try {
    const sheet = await api.getAttendance(date, className, batch);

    if (!sheet.records || sheet.records.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align: center; color: var(--text-muted);">
            No students registered in ${className} - ${batch}.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = sheet.records.filter(r => r.student).map(record => {
      const student = record.student;
      const isPresent = record.status === 'Present';
      const stats = record.stats || { total: 0, present: 0, percent: 100 };
      const displayName = batch === 'All Batches' ? `${student.name} <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: normal; margin-left: 6px;">(${student.batch})</span>` : student.name;
      
      return `
        <tr data-student-id="${student._id}" data-batch="${student.batch || ''}">
          <td style="font-family: monospace; font-size: 0.85rem;">${student.studentId}</td>
          <td style="font-weight: 600;">${displayName}</td>
          <td style="text-align: center;">
            <div style="font-weight: 600; font-size: 0.9rem; color: var(--text-main); margin-bottom: 2px;">
              ${stats.present} / ${stats.total} times
            </div>
            <span style="font-size: 0.75rem; color: ${stats.percent >= 75 ? '#10b981' : '#ef4444'}; font-weight: 700;">
              ${stats.percent}% attendance rate
            </span>
          </td>
          <td>
            <div class="attendance-switch-container">
              <div class="attendance-switch">
                <input type="radio" id="present-${student._id}" name="status-${student._id}" value="Present" ${isPresent ? 'checked' : ''} class="attendance-switch-input present-input">
                <label for="present-${student._id}" class="attendance-switch-label present-label">Present</label>
                
                <input type="radio" id="absent-${student._id}" name="status-${student._id}" value="Absent" ${!isPresent ? 'checked' : ''} class="attendance-switch-input absent-input">
                <label for="absent-${student._id}" class="attendance-switch-label absent-label">Absent</label>
              </div>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Clear previous search and calculate initial stats
    const searchInput = document.getElementById('student-search');
    if (searchInput) {
      searchInput.value = '';
    }
    window.calculateSummaryStats();

  } catch (error) {
    console.error('Error fetching attendance roster:', error);
    tbody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align: center; color: #ef4444;">
          Error loading class roster. Please check connections.
        </td>
      </tr>
    `;
  }
}

window.calculateSummaryStats = () => {
  const rows = document.querySelectorAll('#attendance-list-body tr[data-student-id]');
  if (rows.length === 0) return;
  
  let total = 0;
  let present = 0;
  let absent = 0;
  let sumRates = 0;
  
  rows.forEach(row => {
    total++;
    const studentId = row.getAttribute('data-student-id');
    const checkedRadio = row.querySelector(`input[name="status-${studentId}"]:checked`);
    if (checkedRadio && checkedRadio.value === 'Present') {
      present++;
    } else {
      absent++;
    }
    
    // Extracted cumulative attendance rate percentage from the 3rd column
    const rateTextEl = row.querySelector('td:nth-child(3) span');
    if (rateTextEl) {
      const rateVal = parseFloat(rateTextEl.innerText);
      if (!isNaN(rateVal)) {
        sumRates += rateVal;
      }
    }
  });
  
  const presentPct = total > 0 ? Math.round((present / total) * 100) : 0;
  const absentPct = total > 0 ? Math.round((absent / total) * 100) : 0;
  const avgRate = total > 0 ? Math.round(sumRates / total) : 0;
  
  document.getElementById('stat-total').innerText = total;
  document.getElementById('stat-present').innerText = present;
  document.getElementById('stat-present-pct').innerText = `(${presentPct}%)`;
  document.getElementById('stat-absent').innerText = absent;
  document.getElementById('stat-absent-pct').innerText = `(${absentPct}%)`;
  document.getElementById('stat-avg-rate').innerText = `${avgRate}%`;
};

window.filterStudents = () => {
  const query = document.getElementById('student-search').value.toLowerCase().trim();
  const rows = document.querySelectorAll('#attendance-list-body tr[data-student-id]');
  
  rows.forEach(row => {
    const studentId = row.querySelector('td:nth-child(1)').innerText.toLowerCase();
    const studentName = row.querySelector('td:nth-child(2)').innerText.toLowerCase();
    
    if (studentId.includes(query) || studentName.includes(query)) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
};

window.markAllStatus = (status) => {
  const radios = document.querySelectorAll(`input[type="radio"][value="${status}"]`);
  radios.forEach(radio => {
    radio.checked = true;
  });
  window.calculateSummaryStats();
};

async function getSharingInfoForRoster(date, className, batch, rows) {
  const settings = await api.getWhatsappSettings();
  const batches = await api.getBatches();
  
  const records = [];
  rows.forEach(row => {
    const studentId = row.getAttribute('data-student-id');
    const studentName = row.cells[1].innerText.split('(')[0].trim();
    const studentBatch = row.getAttribute('data-batch') || 'Unassigned';
    const checkedRadio = row.querySelector(`input[name="status-${studentId}"]:checked`);
    const status = checkedRadio ? checkedRadio.value : 'Absent';
    records.push({ studentId, studentName, studentBatch, status });
  });

  const batchesToShare = [];
  if (batch === 'All Batches') {
    // Find all unique batches in the records
    const uniqueBatches = [...new Set(records.map(r => r.studentBatch))];
    uniqueBatches.forEach(bName => {
      const batchRecords = records.filter(r => r.studentBatch === bName);
      batchesToShare.push({ batchName: bName, records: batchRecords });
    });
  } else {
    batchesToShare.push({ batchName: batch, records: records });
  }

  const reports = [];
  for (const group of batchesToShare) {
    const total = group.records.length;
    const present = group.records.filter(r => r.status === 'Present').length;
    const absent = total - present;
    const presentPercent = total > 0 ? Math.round((present / total) * 100) : 100;
    const absentsList = group.records.filter(r => r.status === 'Absent').map(r => r.studentName).join(', ') || 'None';

    const template = settings.attendanceTemplate || "*Attendance Report*\nDate: {{date}}\nClass: {{class}}\nBatch: {{batch}}\n---------------------------\nTotal: {{total}} | Present: {{present}} | Absent: {{absent}}\n\n*Absentees:* {{absentsList}}";
    
    const message = template
      .replace(/{{date}}/g, new Date(date).toLocaleDateString())
      .replace(/{{class}}/g, className)
      .replace(/{{batch}}/g, group.batchName)
      .replace(/{{total}}/g, total)
      .replace(/{{present}}/g, present)
      .replace(/{{presentPercent}}/g, presentPercent)
      .replace(/{{absent}}/g, absent)
      .replace(/{{absentsList}}/g, absentsList);

    const currentBatch = batches.find(b => b.name === group.batchName);
    const groupLink = (currentBatch && currentBatch.whatsappGroup) || settings.groupLinkOrPhone || '';

    let whatsappUrl = '';
    if (groupLink.startsWith('http')) {
      whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    } else if (groupLink) {
      whatsappUrl = `https://api.whatsapp.com/send?phone=${encodeURIComponent(groupLink)}&text=${encodeURIComponent(message)}`;
    } else {
      whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    }

    reports.push({
      batchName: group.batchName,
      message,
      groupLink,
      whatsappUrl,
      total,
      present,
      absent
    });
  }
  return { reports, settings };
}

async function saveAttendance() {
  const date = document.getElementById('att-date').value;
  const className = document.getElementById('att-class').value;
  const batch = document.getElementById('att-batch').value;
  
  const rows = document.querySelectorAll('#attendance-list-body tr[data-student-id]');
  const records = [];

  rows.forEach(row => {
    const studentId = row.getAttribute('data-student-id');
    const checkedRadio = row.querySelector(`input[name="status-${studentId}"]:checked`);
    if (checkedRadio) {
      records.push({
        student: studentId,
        status: checkedRadio.value
      });
    }
  });

  if (records.length === 0) {
    showToast('No attendance records to save.', 'error');
    return;
  }

  const saveBtn = document.getElementById('save-attendance-btn');
  saveBtn.disabled = true;
  saveBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Saving...`;

  try {
    await api.markAttendance({
      date,
      class: className,
      batch,
      records
    });

    // Handle WhatsApp Group Sharing
    const settings = await api.getWhatsappSettings();
    if (settings && settings.groupShareEnabled) {
      const { reports } = await getSharingInfoForRoster(date, className, batch, rows);

      // Enqueue to the simulated WhatsApp sender
      const queue = JSON.parse(localStorage.getItem('queue') || '[]');
      for (const report of reports) {
        queue.push({
          id: 'q_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
          studentName: `Attendance Group - ${className} (${report.batchName})`,
          parentNumber: report.groupLink || 'Group Share',
          amount: 'N/A',
          dueDate: new Date(date).toLocaleDateString(),
          status: 'Pending',
          time: new Date().toLocaleTimeString()
        });
      }
      localStorage.setItem('queue', JSON.stringify(queue));

      // Show alert and redirect option for each batch
      for (const report of reports) {
        if (await confirm(`Attendance saved successfully!\n\nWould you like to share the report for batch "${report.batchName}" to its WhatsApp Group now?`)) {
          window.open(report.whatsappUrl, '_blank');
        }
      }
    } else {
      showToast('Attendance sheet saved successfully!', 'success');
    }

    // Refresh statistics in sheet
    loadAttendanceSheet();
  } catch (error) {
    showToast('Failed to save attendance: ' + error.message, 'error');
  } finally {
    saveBtn.disabled = false;
    saveBtn.innerHTML = `<i class="fa-regular fa-floppy-disk"></i> Save Attendance Sheet`;
  }
}

window.copyShareableLink = () => {
  const className = document.getElementById('att-class').value;
  const batch = document.getElementById('att-batch').value;
  const date = document.getElementById('att-date').value;

  if (!className || !batch) {
    showToast('Please select a class and batch first.', 'error');
    return;
  }

  // Construct URL to point to mark-attendance-list.html
  const pathname = window.location.pathname.replace('attendance.html', 'mark-attendance-list.html');
  const url = `${window.location.origin}${pathname}?class=${encodeURIComponent(className)}&batch=${encodeURIComponent(batch)}&date=${encodeURIComponent(date)}`;
  
  navigator.clipboard.writeText(url).then(() => {
    showToast('Quick link copied to clipboard!', 'success');
  }).catch(err => {
    console.error('Failed to copy link: ', err);
    showToast('Could not copy link to clipboard.', 'error');
  });
};

window.shareAttendanceWhatsapp = async () => {
  const date = document.getElementById('att-date').value;
  const className = document.getElementById('att-class').value;
  const batch = document.getElementById('att-batch').value;
  
  const rows = document.querySelectorAll('#attendance-list-body tr[data-student-id]');
  if (rows.length === 0) {
    showToast('No attendance checklist is loaded.', 'error');
    return;
  }

  const { reports } = await getSharingInfoForRoster(date, className, batch, rows);
  for (const report of reports) {
    if (reports.length === 1 || await confirm(`Would you like to share the report for batch "${report.batchName}" to its WhatsApp Group?`)) {
      window.open(report.whatsappUrl, '_blank');
    }
  }
};

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast-notification toast-${type}`;
  
  let icon = 'fa-circle-info';
  if (type === 'success') icon = 'fa-circle-check';
  if (type === 'error') icon = 'fa-circle-xmark';
  
  toast.innerHTML = `
    <i class="fa-solid ${icon}"></i>
    <span class="toast-msg">${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()"><i class="fa-solid fa-xmark"></i></button>
  `;
  
  container.appendChild(toast);
  
  // Trigger animation reflow
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);
  
  // Auto dismiss after 4 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 4000);
}

