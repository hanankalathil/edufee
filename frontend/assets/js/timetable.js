// Timetable Controller
document.addEventListener('DOMContentLoaded', () => {
  renderLayout(); // Sidebar & Layout
  initTimetable();
});

let allSlots = [];
let allBatches = [];
let timetableSettings = {
  autoBroadcast: false,
  groupName: "Techora Tuitions Group",
  groupLink: ""
};
let currentViewMode = 'weekly';
let activeDailyDay = 'Monday';

async function initTimetable() {
  try {
    // Load batches for filtering & dropdowns
    allBatches = await api.getBatches();
    populateBatchSelects();

    // Load WhatsApp Settings
    timetableSettings = await api.getTimetableSettings();
    updateWhatsAppBar();

    // Load and render slots
    await refreshData();
  } catch (error) {
    console.error("Failed to initialize timetable:", error);
  }
}

function populateBatchSelects() {
  const filterSelect = document.getElementById('batch-filter');
  const modalSelect = document.getElementById('slot-batch');
  
  if (filterSelect) {
    filterSelect.innerHTML = '<option value="all">All Batches</option>';
    allBatches.forEach(b => {
      filterSelect.innerHTML += `<option value="${b._id}">${b.name}</option>`;
    });
  }

  if (modalSelect) {
    modalSelect.innerHTML = '<option value="" disabled selected>Select Batch...</option>';
    allBatches.forEach(b => {
      modalSelect.innerHTML += `<option value="${b._id}">${b.name}</option>`;
    });
  }

  if (window.initializeCustomSelects) {
    window.initializeCustomSelects();
  }
}

function updateWhatsAppBar() {
  const statusTitle = document.getElementById('wa-status-title');
  const statusDesc = document.getElementById('wa-status-desc');
  
  if (!statusTitle || !statusDesc) return;

  if (timetableSettings.autoBroadcast) {
    statusTitle.textContent = `WhatsApp Group Auto-Broadcast: Enabled`;
    statusDesc.textContent = `Syncing changes directly to group: "${timetableSettings.groupName}"`;
  } else {
    statusTitle.textContent = `WhatsApp Group Auto-Broadcast: Disabled`;
    statusDesc.textContent = `Updates will not be shared automatically. Click settings to configure group broadcasts.`;
  }
}

async function refreshData() {
  allSlots = await api.getTimetable();
  loadTimetableGrid();
}

function getBatchColorClass(batchName) {
  if (!batchName) return 'accent-blue';
  const colors = ['accent-blue', 'accent-violet', 'accent-emerald', 'accent-amber', 'accent-rose', 'accent-indigo', 'accent-pink', 'accent-cyan'];
  let hash = 0;
  for (let i = 0; i < batchName.length; i++) {
    hash = batchName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

function setViewMode(mode) {
  currentViewMode = mode;
  document.getElementById('view-weekly-btn').classList.toggle('active', mode === 'weekly');
  document.getElementById('view-daily-btn').classList.toggle('active', mode === 'daily');

  const daySelector = document.getElementById('daily-day-selector');
  const gridContainer = document.getElementById('timetable-grid-container');
  const timelineContainer = document.getElementById('daily-timeline-container');

  if (mode === 'weekly') {
    daySelector.classList.remove('active');
    gridContainer.style.display = 'grid';
    timelineContainer.style.display = 'none';
  } else {
    daySelector.classList.add('active');
    gridContainer.style.display = 'none';
    timelineContainer.style.display = 'block';
  }
  loadTimetableGrid();
}

function setDailyDay(day) {
  activeDailyDay = day;
  document.querySelectorAll('.selector-day-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-day') === day);
  });
  loadTimetableGrid();
}

function loadTimetableGrid() {
  const batchFilter = document.getElementById('batch-filter').value;
  const searchQuery = (document.getElementById('slot-search')?.value || '').toLowerCase().trim();
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Helper to format time for slot cards
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hrs, mins] = timeStr.split(':').map(Number);
    const ampm = hrs >= 12 ? 'PM' : 'AM';
    const hour = hrs % 12 || 12;
    return `${hour.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${ampm}`;
  };

  days.forEach(day => {
    // 1. Filter slots for this day, batch & search query
    let daySlots = allSlots.filter(s => s.day === day);
    if (batchFilter !== 'all') {
      daySlots = daySlots.filter(s => s.batchId === batchFilter);
    }
    if (searchQuery) {
      daySlots = daySlots.filter(s => 
        (s.subject || '').toLowerCase().includes(searchQuery) ||
        (s.teacher || '').toLowerCase().includes(searchQuery) ||
        (s.room || '').toLowerCase().includes(searchQuery) ||
        (s.batchName || '').toLowerCase().includes(searchQuery)
      );
    }

    // Sort by start time
    daySlots.sort((a, b) => a.startTime.localeCompare(b.startTime));

    // Update counts for daily selector buttons
    const countSpan = document.getElementById(`count-${day}`);
    if (countSpan) {
      countSpan.textContent = daySlots.length;
    }

    // Render Weekly Grid Columns
    const container = document.getElementById(`day-${day}`);
    if (container) {
      container.innerHTML = '';
      if (daySlots.length === 0) {
        container.innerHTML = `<div class="empty-day-state">No classes scheduled</div>`;
      } else {
        daySlots.forEach(slot => {
          container.appendChild(createSlotCard(slot));
        });
      }
    }
  });

  // Render Daily Timeline
  if (currentViewMode === 'daily') {
    const timelineContainer = document.getElementById('timeline-slots-container');
    if (!timelineContainer) return;
    timelineContainer.innerHTML = '';

    // Get slots for the active daily day
    let dailySlots = allSlots.filter(s => s.day === activeDailyDay);
    if (batchFilter !== 'all') {
      dailySlots = dailySlots.filter(s => s.batchId === batchFilter);
    }
    if (searchQuery) {
      dailySlots = dailySlots.filter(s => 
        (s.subject || '').toLowerCase().includes(searchQuery) ||
        (s.teacher || '').toLowerCase().includes(searchQuery) ||
        (s.room || '').toLowerCase().includes(searchQuery) ||
        (s.batchName || '').toLowerCase().includes(searchQuery)
      );
    }
    dailySlots.sort((a, b) => a.startTime.localeCompare(b.startTime));

    const getDurationStr = (start, end) => {
      if (!start || !end) return '';
      const [sh, sm] = start.split(':').map(Number);
      const [eh, em] = end.split(':').map(Number);
      const diff = (eh * 60 + em) - (sh * 60 + sm);
      if (diff <= 0) return '';
      const h = Math.floor(diff / 60);
      const m = diff % 60;
      return h > 0 ? `${h}h ${m > 0 ? `${m}m` : ''}` : `${m}m`;
    };

    if (dailySlots.length === 0) {
      timelineContainer.innerHTML = `
        <div style="text-align: center; color: var(--text-muted); padding: 40px 20px; font-style: italic;">
          <i class="fa-regular fa-calendar-xmark" style="font-size: 2.5rem; margin-bottom: 12px; display: block; opacity: 0.5;"></i>
          No classes scheduled for ${activeDailyDay}
        </div>
      `;
    } else {
      dailySlots.forEach(slot => {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        
        const dur = getDurationStr(slot.startTime, slot.endTime);
        
        item.innerHTML = `
          <div class="timeline-time">
            <div class="time-start">${formatTime(slot.startTime)}</div>
            <div class="time-end">${formatTime(slot.endTime)}</div>
            ${dur ? `<div class="time-duration">${dur}</div>` : ''}
          </div>
          <div class="timeline-badge"></div>
          <div class="timeline-card-wrapper"></div>
        `;
        
        item.querySelector('.timeline-card-wrapper').appendChild(createDailyTimelineCard(slot));
        timelineContainer.appendChild(item);
      });
    }
  }
}

function createDailyTimelineCard(slot) {
  const card = document.createElement('div');
  const accentClass = getBatchColorClass(slot.batchName);
  card.className = `timeline-card ${accentClass}`;

  const getDurationStr = (start, end) => {
    if (!start || !end) return '';
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const diff = (eh * 60 + em) - (sh * 60 + sm);
    if (diff <= 0) return '';
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return h > 0 ? `${h}h ${m > 0 ? `${m}m` : ''}` : `${m} mins`;
  };

  card.innerHTML = `
    <div class="timeline-card-header">
      <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
        <h4 class="timeline-card-subject">${slot.subject}</h4>
        <span class="timeline-card-batch">${slot.batchName}</span>
      </div>
      <div class="timeline-card-actions">
        <button class="card-action-btn" onclick="editSlot('${slot._id}')" title="Edit Slot">
          <i class="fa-solid fa-pen"></i>
        </button>
        <button class="card-action-btn delete" onclick="deleteSlot('${slot._id}')" title="Delete Slot">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    </div>
    <div class="timeline-card-body">
      <div class="timeline-card-info">
        <div class="info-item">
          <i class="fa-solid fa-user-tie"></i>
          <div>
            <span class="info-label">Instructor</span>
            <span class="info-value">${slot.teacher || 'Not assigned'}</span>
          </div>
        </div>
        <div class="info-item">
          <i class="fa-solid fa-location-dot"></i>
          <div>
            <span class="info-label">Location / Room</span>
            <span class="info-value">${slot.room || 'TBA'}</span>
          </div>
        </div>
        <div class="info-item">
          <i class="fa-solid fa-hourglass-half"></i>
          <div>
            <span class="info-label">Duration</span>
            <span class="info-value">${getDurationStr(slot.startTime, slot.endTime) || 'TBA'}</span>
          </div>
        </div>
      </div>
    </div>
  `;

  return card;
}

function createSlotCard(slot) {
  const card = document.createElement('div');
  const accentClass = getBatchColorClass(slot.batchName);
  card.className = `timetable-card ${accentClass}`;

  // Format time (HH:MM to 12 hour AM/PM format)
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hrs, mins] = timeStr.split(':').map(Number);
    const ampm = hrs >= 12 ? 'PM' : 'AM';
    const hour = hrs % 12 || 12;
    return `${hour.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${ampm}`;
  };

  card.innerHTML = `
    <div class="card-actions">
      <button class="card-action-btn" onclick="editSlot('${slot._id}')" title="Edit Slot">
        <i class="fa-solid fa-pen"></i>
      </button>
      <button class="card-action-btn delete" onclick="deleteSlot('${slot._id}')" title="Delete Slot">
        <i class="fa-solid fa-trash"></i>
      </button>
    </div>
    <div class="card-subject">${slot.subject}</div>
    <div class="card-batch">${slot.batchName}</div>
    <div class="card-detail">
      <i class="fa-solid fa-clock"></i>
      <span>${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}</span>
    </div>
    ${slot.teacher ? `
      <div class="card-detail">
        <i class="fa-solid fa-user-tie"></i>
        <span>${slot.teacher}</span>
      </div>
    ` : ''}
    ${slot.room ? `
      <div class="card-detail">
        <i class="fa-solid fa-location-dot"></i>
        <span>${slot.room}</span>
      </div>
    ` : ''}
  `;

  return card;
}

// Modal Handlers
function openAddSlotModal() {
  document.getElementById('modal-title').textContent = 'Add Timetable Slot';
  document.getElementById('slot-id').value = '';
  document.getElementById('slot-form').reset();
  
  if (window.initializeCustomSelects) {
    window.initializeCustomSelects();
  }

  const modal = document.getElementById('slot-modal');
  modal.classList.add('open');
}

function openSettingsModal() {
  document.getElementById('wa-auto-broadcast').checked = timetableSettings.autoBroadcast;
  document.getElementById('wa-group-name').value = timetableSettings.groupName || '';
  document.getElementById('wa-group-link').value = timetableSettings.groupLink || '';

  const modal = document.getElementById('settings-modal');
  modal.classList.add('open');
}

function closeSlotModal() {
  document.getElementById('slot-modal').classList.remove('open');
}

function closeSettingsModal() {
  document.getElementById('settings-modal').classList.remove('open');
}

function editSlot(id) {
  const slot = allSlots.find(s => s._id === id);
  if (!slot) return;

  document.getElementById('modal-title').textContent = 'Edit Timetable Slot';
  document.getElementById('slot-id').value = slot._id;
  document.getElementById('slot-subject').value = slot.subject;
  document.getElementById('slot-batch').value = slot.batchId;
  document.getElementById('slot-teacher').value = slot.teacher || '';
  document.getElementById('slot-day').value = slot.day;
  document.getElementById('slot-room').value = slot.room || '';
  document.getElementById('slot-start').value = slot.startTime;
  document.getElementById('slot-end').value = slot.endTime;

  if (window.initializeCustomSelects) {
    window.initializeCustomSelects();
  }

  document.getElementById('slot-modal').classList.add('open');
}

async function handleSlotSubmit(event) {
  event.preventDefault();

  const slotData = {
    _id: document.getElementById('slot-id').value || undefined,
    subject: document.getElementById('slot-subject').value,
    batchId: document.getElementById('slot-batch').value,
    teacher: document.getElementById('slot-teacher').value,
    day: document.getElementById('slot-day').value,
    room: document.getElementById('slot-room').value,
    startTime: document.getElementById('slot-start').value,
    endTime: document.getElementById('slot-end').value
  };

  try {
    const saved = await api.saveTimetableSlot(slotData);
    closeSlotModal();
    await refreshData();

    if (timetableSettings.autoBroadcast) {
      showToastNotification(`Auto-broadcasted schedule update for ${saved.batchName} to WhatsApp group!`);
    } else {
      showToastNotification(`Slot saved successfully!`);
    }
  } catch (error) {
    alert("Error saving slot: " + error.message);
  }
}

async function deleteSlot(id) {
  if (!await confirm("Are you sure you want to delete this class slot?")) return;

  try {
    await api.deleteTimetableSlot(id);
    await refreshData();
    showToastNotification("Slot deleted successfully!");
  } catch (error) {
    alert("Error deleting slot: " + error.message);
  }
}

async function handleSettingsSubmit(event) {
  event.preventDefault();

  timetableSettings.autoBroadcast = document.getElementById('wa-auto-broadcast').checked;
  timetableSettings.groupName = document.getElementById('wa-group-name').value;
  timetableSettings.groupLink = document.getElementById('wa-group-link').value;

  try {
    await api.saveTimetableSettings(timetableSettings);
    closeSettingsModal();
    updateWhatsAppBar();
    showToastNotification("WhatsApp group settings updated!");
  } catch (error) {
    alert("Error saving settings: " + error.message);
  }
}

function showToastNotification(message) {
  const toast = document.getElementById('toast-notif');
  const msgSpan = document.getElementById('toast-message');
  
  if (!toast || !msgSpan) return;

  msgSpan.textContent = message;
  toast.classList.add('show');

  // Push record into simulated reminders queue / logs
  const queue = JSON.parse(localStorage.getItem('queue') || '[]');
  queue.push({
    id: 'wa_' + Date.now(),
    studentName: 'WhatsApp Group: ' + (timetableSettings.groupName || 'Tutor Class'),
    parentNumber: 'Group Broadcast',
    amount: '-',
    dueDate: '-',
    status: 'Sent',
    time: new Date().toLocaleTimeString()
  });
  localStorage.setItem('queue', JSON.stringify(queue));

  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

// Generate formatted text for WhatsApp share
function generateWhatsAppTimetableText() {
  const batchFilter = document.getElementById('batch-filter').value;
  const batchObj = allBatches.find(b => b._id === batchFilter);
  const filterName = batchObj ? batchObj.name : 'All Batches';

  let text = `📅 *Techora Academy - Timetable Summary*\n`;
  text += `👥 *Batch:* ${filterName}\n`;
  text += `━━━━━━━━━━━━━━━━━━━━\n\n`;

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  let hasItems = false;

  days.forEach(day => {
    let daySlots = allSlots.filter(s => s.day === day);
    if (batchFilter !== 'all') {
      daySlots = daySlots.filter(s => s.batchId === batchFilter);
    }

    if (daySlots.length > 0) {
      hasItems = true;
      daySlots.sort((a, b) => a.startTime.localeCompare(b.startTime));
      text += `*${day.toUpperCase()}*\n`;
      daySlots.forEach(s => {
        const formatTime = (timeStr) => {
          const [hrs, mins] = timeStr.split(':').map(Number);
          const ampm = hrs >= 12 ? 'PM' : 'AM';
          const hour = hrs % 12 || 12;
          return `${hour.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${ampm}`;
        };
        text += `🔹 ${formatTime(s.startTime)} - ${formatTime(s.endTime)}: *${s.subject}*\n`;
        if (s.teacher) text += `   └ 👤 Teacher: ${s.teacher}\n`;
        if (s.room) text += `   └ 📍 Location: ${s.room}\n`;
      });
      text += `\n`;
    }
  });

  if (!hasItems) {
    text += `No classes scheduled for the selected filter.\n`;
  }

  text += `━━━━━━━━━━━━━━━━━━━━\n`;
  text += `Generated on: ${new Date().toLocaleDateString()}\n`;
  if (timetableSettings.groupLink) {
    text += `Join Group: ${timetableSettings.groupLink}`;
  }

  return text;
}

function shareTimetableWhatsApp() {
  const text = generateWhatsAppTimetableText();
  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}
