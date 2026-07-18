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
  if (classParam) {
    document.getElementById('att-class').value = classParam;
  }

  // Load batches dynamically
  const batchSelect = document.getElementById('att-batch');
  if (batchSelect) {
    try {
      const batches = await api.getBatches();
      batchSelect.innerHTML = batches.map(b => `<option value="${b.name}">${b.name}</option>`).join('');
      
      if (batchParam) {
        batchSelect.value = batchParam;
      }

      if (window.initializeCustomSelects) {
        window.initializeCustomSelects();
      }
    } catch (error) {
      console.error('Error loading batches in attendance page:', error);
    }
  }

  // Load initially
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

    tbody.innerHTML = sheet.records.map(record => {
      const student = record.student;
      const isPresent = record.status === 'Present';
      const stats = record.stats || { total: 0, present: 0, percent: 100 };
      
      return `
        <tr data-student-id="${student._id}">
          <td style="font-family: monospace; font-size: 0.85rem;">${student.studentId}</td>
          <td style="font-weight: 600;">${student.name}</td>
          <td style="text-align: center;">
            <div style="font-weight: 600; font-size: 0.9rem; color: var(--text-main); margin-bottom: 2px;">
              ${stats.present} / ${stats.total} times
            </div>
            <span style="font-size: 0.75rem; color: ${stats.percent >= 75 ? '#10b981' : '#ef4444'}; font-weight: 700;">
              ${stats.percent}% attendance rate
            </span>
          </td>
          <td>
            <div style="display: flex; justify-content: center; gap: 24px;">
              <label style="cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: 600; color: #10b981;">
                <input type="radio" name="status-${student._id}" value="Present" ${isPresent ? 'checked' : ''} style="accent-color: #10b981; transform: scale(1.15);">
                Present
              </label>
              <label style="cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: 600; color: #ef4444;">
                <input type="radio" name="status-${student._id}" value="Absent" ${!isPresent ? 'checked' : ''} style="accent-color: #ef4444; transform: scale(1.15);">
                Absent
              </label>
            </div>
          </td>
        </tr>
      `;
    }).join('');

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

window.markAllStatus = (status) => {
  const radios = document.querySelectorAll(`input[type="radio"][value="${status}"]`);
  radios.forEach(radio => {
    radio.checked = true;
  });
};

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
    alert('No attendance records to save.');
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
      const total = records.length;
      const present = records.filter(r => r.status === 'Present').length;
      const absent = total - present;
      const presentPercent = total > 0 ? Math.round((present / total) * 100) : 100;

      // Extract absentee names from UI rows
      const absents = [];
      rows.forEach(row => {
        const name = row.cells[1].innerText;
        const studentId = row.getAttribute('data-student-id');
        const checkedRadio = row.querySelector(`input[name="status-${studentId}"]:checked`);
        if (checkedRadio && checkedRadio.value === 'Absent') {
          absents.push(name);
        }
      });
      const absentsList = absents.length > 0 ? absents.join(', ') : 'None';

      const template = settings.attendanceTemplate || "*Attendance Report*\nDate: {{date}}\nClass: {{class}}\nBatch: {{batch}}\n---------------------------\nTotal: {{total}} | Present: {{present}} | Absent: {{absent}}\n\n*Absentees:* {{absentsList}}";
      
      const message = template
        .replace(/{{date}}/g, new Date(date).toLocaleDateString())
        .replace(/{{class}}/g, className)
        .replace(/{{batch}}/g, batch)
        .replace(/{{total}}/g, total)
        .replace(/{{present}}/g, present)
        .replace(/{{presentPercent}}/g, presentPercent)
        .replace(/{{absent}}/g, absent)
        .replace(/{{absentsList}}/g, absentsList);

      // Enqueue to the simulated WhatsApp sender
      const queue = JSON.parse(localStorage.getItem('queue') || '[]');
      queue.push({
        id: 'q_' + Date.now(),
        studentName: `Attendance Group - ${className} (${batch})`,
        parentNumber: settings.groupLinkOrPhone || 'Group Share',
        amount: 'N/A',
        dueDate: new Date(date).toLocaleDateString(),
        status: 'Pending',
        time: new Date().toLocaleTimeString()
      });
      localStorage.setItem('queue', JSON.stringify(queue));

      // Build sharing link
      const groupLink = settings.groupLinkOrPhone || '';
      let whatsappUrl = '';
      if (groupLink.startsWith('http')) {
        // Direct invite link share or message share helper
        whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
      } else if (groupLink) {
        // Specific contact number
        whatsappUrl = `https://api.whatsapp.com/send?phone=${encodeURIComponent(groupLink)}&text=${encodeURIComponent(message)}`;
      } else {
        whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
      }

      // Show alert and redirect option
      if (await confirm('Attendance saved successfully!\n\nWould you like to share this report to the configured WhatsApp Group now?')) {
        window.open(whatsappUrl, '_blank');
      }
    } else {
      alert('Attendance sheet saved successfully!');
    }

    // Refresh statistics in sheet
    loadAttendanceSheet();
  } catch (error) {
    alert('Failed to save attendance: ' + error.message);
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
    alert('Please select a class and batch first.');
    return;
  }

  // Construct URL to point to mark-attendance-list.html
  const pathname = window.location.pathname.replace('attendance.html', 'mark-attendance-list.html');
  const url = `${window.location.origin}${pathname}?class=${encodeURIComponent(className)}&batch=${encodeURIComponent(batch)}&date=${encodeURIComponent(date)}`;
  
  navigator.clipboard.writeText(url).then(() => {
    alert('Quick link copied to clipboard!\n' + url);
  }).catch(err => {
    console.error('Failed to copy link: ', err);
    alert('Could not copy link. Here is the URL:\n' + url);
  });
};
