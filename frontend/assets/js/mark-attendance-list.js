let studentsData = [];
let originalStudentsData = [];
let classParam = '';
let batchParam = '';
let dateParam = '';

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  classParam = urlParams.get('class');
  batchParam = urlParams.get('batch');
  dateParam = urlParams.get('date');

  if (!classParam || !batchParam || !dateParam) {
    await alert('Invalid class, batch or date parameters. Redirecting back...');
    window.location.href = 'mark-attendance.html';
    return;
  }

  // Set page headers
  document.getElementById('batch-title').textContent = `${classParam}`;
  document.getElementById('batch-meta').textContent = `${batchParam} | ${new Date(dateParam).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}`;

  await loadRosterData();
});

async function loadRosterData() {
  const rosterContainer = document.getElementById('students-roster-list');

  try {
    const sheet = await api.getAttendance(dateParam, classParam, batchParam);
    studentsData = sheet.records || [];
    originalStudentsData = JSON.parse(JSON.stringify(studentsData));

    if (studentsData.length === 0) {
      rosterContainer.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; color: #94a3b8;">
          <i class="fa-regular fa-folder-open" style="font-size: 2.5rem; margin-bottom: 12px; opacity: 0.5;"></i>
          <p>No registered students found in this batch.</p>
        </div>
      `;
      return;
    }

    renderRosterList();
    updateRosterStats();

  } catch (error) {
    console.error('Error loading roster data:', error);
    rosterContainer.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; color: #ef4444;">
        <i class="fa-solid fa-triangle-exclamation" style="font-size: 2.5rem; margin-bottom: 12px;"></i>
        <p>Failed to load class roster. Please check connection.</p>
      </div>
    `;
  }
}

function renderRosterList() {
  const rosterContainer = document.getElementById('students-roster-list');
  
  rosterContainer.innerHTML = studentsData.map(record => {
    const student = record.student;
    const isPresent = record.status === 'Present';
    const initials = student.name ? student.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'ST';
    const stats = record.stats || { total: 0, present: 0, percent: 100 };
    const displayName = batchParam === 'All Batches' ? `${student.name} <span style="font-size: 0.75rem; color: #64748b; font-weight: normal; margin-left: 6px;">(${student.batch})</span>` : student.name;

    return `
      <div class="student-card ${isPresent ? 'marked-present' : 'marked-absent'}" id="card-${student._id}" data-student-id="${student._id}" data-name="${student.name.toLowerCase()}">
        <div class="student-info">
          <div class="avatar">${initials}</div>
          <div class="student-details">
            <h4 class="student-name">${displayName}</h4>
            <div class="student-meta">
              <span>ID: ${student.studentId}</span>
              <span class="attempts-badge" style="color: ${stats.percent >= 75 ? '#10b981' : '#f43f5e'}">
                ${stats.present}/${stats.total} (${stats.percent}%)
              </span>
            </div>
          </div>
        </div>

        <div class="status-toggle">
          <div class="toggle-opt present ${isPresent ? 'active-present' : ''}" 
               onclick="toggleStudentStatus('${student._id}', 'Present')" id="toggle-p-${student._id}">
            P
          </div>
          <div class="toggle-opt absent ${!isPresent ? 'active-absent' : ''}" 
               onclick="toggleStudentStatus('${student._id}', 'Absent')" id="toggle-a-${student._id}">
            A
          </div>
        </div>
      </div>
    `;
  }).join('');
}

window.toggleStudentStatus = (studentId, status) => {
  const card = document.getElementById(`card-${studentId}`);
  const toggleP = document.getElementById(`toggle-p-${studentId}`);
  const toggleA = document.getElementById(`toggle-a-${studentId}`);

  // Find record index
  const recordIndex = studentsData.findIndex(r => r.student._id === studentId);
  if (recordIndex !== -1) {
    studentsData[recordIndex].status = status;
  }

  if (status === 'Present') {
    card.className = 'student-card marked-present';
    toggleP.className = 'toggle-opt present active-present';
    toggleA.className = 'toggle-opt absent';
  } else {
    card.className = 'student-card marked-absent';
    toggleP.className = 'toggle-opt present';
    toggleA.className = 'toggle-opt absent active-absent';
  }

  updateRosterStats();
};

window.filterRoster = () => {
  const query = document.getElementById('search-input').value.toLowerCase();
  const cards = document.querySelectorAll('.student-card');

  cards.forEach(card => {
    const name = card.getAttribute('data-name');
    if (name.includes(query)) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
};

window.markAllRoster = (status) => {
  studentsData.forEach(record => {
    record.status = status;
  });
  renderRosterList();
  updateRosterStats();
};

window.resetRoster = () => {
  if (originalStudentsData.length > 0) {
    studentsData = JSON.parse(JSON.stringify(originalStudentsData));
    renderRosterList();
    updateRosterStats();
  }
};

function updateRosterStats() {
  const total = studentsData.length;
  const present = studentsData.filter(r => r.status === 'Present').length;
  const absent = total - present;
  const percent = total > 0 ? Math.round((present / total) * 100) : 100;

  document.getElementById('stats-summary-text').innerHTML = `
    <div style="display: flex; gap: 4px; font-weight: 600; flex-wrap: nowrap; overflow-x: auto; padding-bottom: 2px;">
      <span style="color: #16a34a; background: #f0fdf4; padding: 4px 6px; border-radius: 6px; font-size: 0.7rem; border: 1px solid #bbf7d0; white-space: nowrap;">P: ${present}</span>
      <span style="color: #dc2626; background: #fef2f2; padding: 4px 6px; border-radius: 6px; font-size: 0.7rem; border: 1px solid #fecaca; white-space: nowrap;">A: ${absent}</span>
      <span style="color: #475569; background: #f1f5f9; padding: 4px 6px; border-radius: 6px; font-size: 0.7rem; border: 1px solid #e2e8f0; white-space: nowrap;">${percent}%</span>
    </div>
  `;
}

async function submitRoster() {
  const submitBtn = document.getElementById('submit-roster-btn');
  submitBtn.disabled = true;
  submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Submitting...`;

  const records = studentsData.map(r => ({
    student: r.student._id,
    status: r.status
  }));

  try {
    await api.markAttendance({
      date: dateParam,
      class: classParam,
      batch: batchParam,
      records
    });

    // WhatsApp Group Sharing logic
    const settings = await api.getWhatsappSettings();
    if (settings && settings.groupShareEnabled) {
      const batches = await api.getBatches();
      const batchesToShare = [];

      if (batchParam === 'All Batches') {
        // Group students by their assigned batch
        const uniqueBatches = [...new Set(studentsData.map(r => r.student.batch || 'Unassigned'))];
        uniqueBatches.forEach(bName => {
          const batchRecords = studentsData.filter(r => (r.student.batch || 'Unassigned') === bName);
          batchesToShare.push({ batchName: bName, records: batchRecords });
        });
      } else {
        batchesToShare.push({ batchName: batchParam, records: studentsData });
      }

      const queue = JSON.parse(localStorage.getItem('queue') || '[]');

      for (const group of batchesToShare) {
        const total = group.records.length;
        const present = group.records.filter(r => r.status === 'Present').length;
        const absent = total - present;
        const presentPercent = total > 0 ? Math.round((present / total) * 100) : 100;
        const absentsList = group.records.filter(r => r.status === 'Absent').map(r => r.student.name).join(', ') || 'None';

        const template = settings.attendanceTemplate || "*Attendance Report*\nDate: {{date}}\nClass: {{class}}\nBatch: {{batch}}\n---------------------------\nTotal: {{total}} | Present: {{present}} | Absent: {{absent}}\n\n*Absentees:* {{absentsList}}";
        
        const message = template
          .replace(/{{date}}/g, new Date(dateParam).toLocaleDateString())
          .replace(/{{class}}/g, classParam)
          .replace(/{{batch}}/g, group.batchName)
          .replace(/{{total}}/g, total)
          .replace(/{{present}}/g, present)
          .replace(/{{presentPercent}}/g, presentPercent)
          .replace(/{{absent}}/g, absent)
          .replace(/{{absentsList}}/g, absentsList);

        const currentBatch = batches.find(b => b.name === group.batchName);
        const groupLink = (currentBatch && currentBatch.whatsappGroup) || settings.groupLinkOrPhone || '';

        // Add to simulated queue
        queue.push({
          id: 'q_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
          studentName: `Attendance Group - ${classParam} (${group.batchName})`,
          parentNumber: groupLink || 'Group Share',
          amount: 'N/A',
          dueDate: new Date(dateParam).toLocaleDateString(),
          status: 'Pending',
          time: new Date().toLocaleTimeString()
        });

        let whatsappUrl = '';
        if (groupLink.startsWith('http')) {
          whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
        } else if (groupLink) {
          whatsappUrl = `https://api.whatsapp.com/send?phone=${encodeURIComponent(groupLink)}&text=${encodeURIComponent(message)}`;
        } else {
          whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
        }

        if (await confirm(`Attendance submitted successfully!\n\nWould you like to share the report for batch "${group.batchName}" to its WhatsApp Group now?`)) {
          window.open(whatsappUrl, '_blank');
        }
      }
      localStorage.setItem('queue', JSON.stringify(queue));
    } else {
      alert('Attendance sheet submitted successfully!');
    }

    // Reload layout to get fresh attempts rate
    await loadRosterData();

  } catch (error) {
    alert('Failed to submit attendance roster: ' + error.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = `<i class="fa-solid fa-circle-check"></i> Submit Sheet`;
  }
}
