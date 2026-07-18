let studentsData = [];
let classParam = '';
let batchParam = '';
let dateParam = '';

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  classParam = urlParams.get('class');
  batchParam = urlParams.get('batch');
  dateParam = urlParams.get('date');

  if (!classParam || !batchParam || !dateParam) {
    alert('Invalid class, batch or date parameters. Redirecting back...');
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

    return `
      <div class="student-card ${isPresent ? 'marked-present' : 'marked-absent'}" id="card-${student._id}" data-student-id="${student._id}" data-name="${student.name.toLowerCase()}">
        <div class="student-info">
          <div class="avatar">${initials}</div>
          <div class="student-details">
            <h4 class="student-name">${student.name}</h4>
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

function updateRosterStats() {
  const total = studentsData.length;
  const present = studentsData.filter(r => r.status === 'Present').length;
  const absent = total - present;
  const percent = total > 0 ? Math.round((present / total) * 100) : 100;

  document.getElementById('stats-summary-text').innerHTML = `
    Present: <strong style="color: #10b981;">${present}</strong> | Absent: <strong style="color: #ef4444;">${absent}</strong> (${percent}%)
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
      const total = records.length;
      const present = records.filter(r => r.status === 'Present').length;
      const absent = total - present;
      const presentPercent = total > 0 ? Math.round((present / total) * 100) : 100;

      // Extract absentee names from studentsData array
      const absents = studentsData.filter(r => r.status === 'Absent').map(r => r.student.name);
      const absentsList = absents.length > 0 ? absents.join(', ') : 'None';

      const template = settings.attendanceTemplate || "*Attendance Report*\nDate: {{date}}\nClass: {{class}}\nBatch: {{batch}}\n---------------------------\nTotal: {{total}} | Present: {{present}} | Absent: {{absent}}\n\n*Absentees:* {{absentsList}}";
      
      const message = template
        .replace(/{{date}}/g, new Date(dateParam).toLocaleDateString())
        .replace(/{{class}}/g, classParam)
        .replace(/{{batch}}/g, batchParam)
        .replace(/{{total}}/g, total)
        .replace(/{{present}}/g, present)
        .replace(/{{presentPercent}}/g, presentPercent)
        .replace(/{{absent}}/g, absent)
        .replace(/{{absentsList}}/g, absentsList);

      const batches = await api.getBatches();
      const currentBatch = batches.find(b => b.name === batchParam);
      const groupLink = (currentBatch && currentBatch.whatsappGroup) || settings.groupLinkOrPhone || '';

      // Add to simulated queue
      const queue = JSON.parse(localStorage.getItem('queue') || '[]');
      queue.push({
        id: 'q_' + Date.now(),
        studentName: `Attendance Group - ${classParam} (${batchParam})`,
        parentNumber: groupLink || 'Group Share',
        amount: 'N/A',
        dueDate: new Date(dateParam).toLocaleDateString(),
        status: 'Pending',
        time: new Date().toLocaleTimeString()
      });
      localStorage.setItem('queue', JSON.stringify(queue));

      let whatsappUrl = '';
      if (groupLink.startsWith('http')) {
        whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
      } else if (groupLink) {
        whatsappUrl = `https://api.whatsapp.com/send?phone=${encodeURIComponent(groupLink)}&text=${encodeURIComponent(message)}`;
      } else {
        whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
      }

      if (await confirm('Attendance submitted successfully!\n\nWould you like to share this report to the WhatsApp Group now?')) {
        window.open(whatsappUrl, '_blank');
      }
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
