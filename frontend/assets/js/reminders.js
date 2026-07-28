document.addEventListener('DOMContentLoaded', () => {
  const currentPath = window.location.pathname;

  if (currentPath.endsWith('reminders.html')) {
    initRemindersCenter();
  }

  if (currentPath.endsWith('whatsapp-settings.html') || currentPath.endsWith('settings.html')) {
    initWhatsappSettings();
  }
});

/* ==========================================
   1. REMINDERS CENTER
   ========================================== */
let activeTab = 'today';

function initRemindersCenter() {
  switchReminderTab('today');
}

async function loadReminders() {
  const tbody = document.getElementById('reminders-table-body');
  if (!tbody) return;

  tbody.innerHTML = `
    <tr>
      <td colspan="6" style="text-align: center; color: var(--text-muted);">Fetching reminders list...</td>
    </tr>
  `;

  try {
    const fees = await api.getFees();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const afterTomorrow = new Date(tomorrow);
    afterTomorrow.setDate(tomorrow.getDate() + 1);

    let filteredFees = [];

    if (activeTab === 'today') {
      filteredFees = fees.filter(f => f.dueAmount > 0 && new Date(f.dueDate) >= today && new Date(f.dueDate) < tomorrow);
    } else if (activeTab === 'tomorrow') {
      filteredFees = fees.filter(f => f.dueAmount > 0 && new Date(f.dueDate) >= tomorrow && new Date(f.dueDate) < afterTomorrow);
    } else if (activeTab === 'overdue') {
      filteredFees = fees.filter(f => f.dueAmount > 0 && new Date(f.dueDate) < today);
    } else if (activeTab === 'sent') {
      const q = await api.getQueue();
      const sentItems = q.queue.filter(item => item.status === 'Sent');
      
      if (sentItems.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No reminders sent yet.</td></tr>`;
        return;
      }

      tbody.innerHTML = sentItems.map(item => `
        <tr>
          <td style="font-weight: 600;">${item.studentName}</td>
          <td>${item.parentNumber}</td>
          <td style="font-weight: 600;">₹${item.amount}</td>
          <td>${item.dueDate}</td>
          <td><span class="badge badge-paid">Sent</span></td>
          <td><span style="font-size: 0.8rem; color: var(--text-muted);">${item.time}</span></td>
        </tr>
      `).join('');
      return;
    }

    if (filteredFees.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No records found for this category.</td></tr>`;
      return;
    }

    tbody.innerHTML = filteredFees.map(f => {
      if (!f.student) return '';
      
      let statusClass = 'badge-unpaid';
      if (activeTab === 'overdue') statusClass = 'badge-overdue';
      if (activeTab === 'tomorrow') statusClass = 'badge-partial';

      return `
        <tr>
          <td style="font-weight: 600;">${f.student.name}</td>
          <td>${f.student.whatsappNumber}</td>
          <td style="font-weight: 600; color: #ef4444;">₹${f.dueAmount}</td>
          <td>${new Date(f.dueDate).toLocaleDateString()}</td>
          <td><span class="badge ${statusClass}">${f.status}</span></td>
          <td>
            <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.8rem; color: #10b981; border-color: rgba(16, 185, 129, 0.3);" onclick="triggerManualReminder('${f.student._id}', '${f._id}')">
              <i class="fa-brands fa-whatsapp"></i> Send
            </button>
          </td>
        </tr>
      `;
    }).join('');

  } catch (error) {
    console.error('Error loading reminders:', error);
  }
}

window.switchReminderTab = (tabName) => {
  activeTab = tabName;
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(btn => btn.classList.remove('active'));

  // Highlight selected tab
  if (tabName === 'today') tabs[0].classList.add('active');
  if (tabName === 'tomorrow') tabs[1].classList.add('active');
  if (tabName === 'overdue') tabs[2].classList.add('active');
  if (tabName === 'sent') tabs[3].classList.add('active');

  loadReminders();
};

/* ==========================================
   2. WHATSAPP SETTINGS
   ========================================== */
async function initWhatsappSettings() {
  const toggleManual = document.getElementById('toggle-manual');
  const toggleAuto = document.getElementById('toggle-auto');
  const delaySelect = document.getElementById('queue-delay');
  const templateArea = document.getElementById('template-text');
  const variables = document.querySelectorAll('.variable-badge:not(.group-var)');

  const toggleGroupShare = document.getElementById('toggle-group-share');
  const attGroupTarget = document.getElementById('att-group-target');
  const attTemplateArea = document.getElementById('att-template-text');
  const groupVariables = document.querySelectorAll('.group-var');

  // Load existing configuration
  try {
    const settings = await api.getWhatsappSettings();
    toggleManual.checked = settings.manualEnabled;
    toggleAuto.checked = settings.autoEnabled;
    delaySelect.value = settings.delayMinutes;
    templateArea.value = settings.template;

    if (toggleGroupShare) toggleGroupShare.checked = !!settings.groupShareEnabled;
    if (attGroupTarget) attGroupTarget.value = settings.groupLinkOrPhone || '';
    if (attTemplateArea) attTemplateArea.value = settings.attendanceTemplate || '';
  } catch (error) {
    console.error('Error loading WhatsApp settings:', error);
  }

  // Insert variable tag on click (Reminders)
  variables.forEach(badge => {
    badge.addEventListener('click', () => {
      const start = templateArea.selectionStart;
      const end = templateArea.selectionEnd;
      const text = templateArea.value;
      const placeholder = badge.getAttribute('data-var');
      
      templateArea.value = text.substring(0, start) + placeholder + text.substring(end);
      templateArea.focus();
      templateArea.setSelectionRange(start + placeholder.length, start + placeholder.length);
    });
  });

  // Insert variable tag on click (Attendance Group)
  groupVariables.forEach(badge => {
    badge.addEventListener('click', () => {
      if (!attTemplateArea) return;
      const start = attTemplateArea.selectionStart;
      const end = attTemplateArea.selectionEnd;
      const text = attTemplateArea.value;
      const placeholder = badge.getAttribute('data-var');
      
      attTemplateArea.value = text.substring(0, start) + placeholder + text.substring(end);
      attTemplateArea.focus();
      attTemplateArea.setSelectionRange(start + placeholder.length, start + placeholder.length);
    });
  });

  // Load Connection State
  checkConnectionStatus();

  // Load real-time queue
  loadQueueMonitor();

  // Start Background Queue Processor
  if (!window.autoQueueInterval) {
    window.autoQueueInterval = setInterval(processNextQueueItemSimulated, 5000);
  }

  // Poll connection status every 4 seconds to detect QR scan automatically
  if (!window.connStatusInterval) {
    window.connStatusInterval = setInterval(checkConnectionStatus, 4000);
  }
}

async function checkConnectionStatus() {
  try {
    const res = await api.getWhatsappStatus();
    const isConnected = res.status === 'CONNECTED';
    renderConnStatus(isConnected, res.status);
  } catch (e) {
    renderConnStatus(false, 'DISCONNECTED');
  }
}

// WhatsApp QR / Connection Methods
window.generateQRCode = async () => {
  const qrImg = document.getElementById('qr-code-img');
  const qrLoader = document.getElementById('qr-loader');
  
  if (!qrImg || !qrLoader) return;
  
  qrImg.style.display = 'none';
  qrLoader.style.display = 'flex';
  
  try {
    const res = await api.getWhatsappQR();
    if (res && res.qr) {
      qrImg.src = res.qr;
      qrImg.onload = () => {
        qrLoader.style.display = 'none';
        qrImg.style.display = 'block';
      };
    } else {
      setTimeout(generateQRCode, 3000);
    }
  } catch (err) {
    console.error('Error fetching QR code:', err);
    setTimeout(generateQRCode, 4000);
  }
};

window.renderConnStatus = (isConnected, statusString = 'Disconnected') => {
  const statusBadge = document.getElementById('conn-status');
  const disconnectedUI = document.getElementById('conn-disconnected-ui');
  const connectedUI = document.getElementById('conn-connected-ui');
  
  if (!statusBadge) return;
  
  if (isConnected) {
    statusBadge.textContent = 'Connected';
    statusBadge.className = 'badge badge-paid';
    if (disconnectedUI) disconnectedUI.style.display = 'none';
    if (connectedUI) connectedUI.style.display = 'block';
  } else {
    statusBadge.textContent = statusString === 'CONNECTING' ? 'Connecting...' : 'Disconnected';
    statusBadge.className = statusString === 'CONNECTING' ? 'badge badge-partial' : 'badge badge-unpaid';
    if (disconnectedUI) disconnectedUI.style.display = 'block';
    if (connectedUI) connectedUI.style.display = 'none';
    
    // Only generate QR code if it is not currently loaded or if it is fully disconnected
    const qrImg = document.getElementById('qr-code-img');
    if (qrImg && !qrImg.src && statusString !== 'CONNECTING') {
      generateQRCode();
    }
  }
};

window.simulateConnection = () => {
  const statusBadge = document.getElementById('conn-status');
  if (statusBadge) {
    statusBadge.textContent = 'Connecting (Simulation)...';
    statusBadge.className = 'badge badge-partial';
  }
  
  setTimeout(() => {
    localStorage.setItem('whatsappConnected', 'true');
    renderConnStatus(true);
    showToastNotification('Simulated connection success!');
  }, 1200);
};

window.disconnectDevice = async () => {
  if (await confirm('Are you sure you want to disconnect this WhatsApp session? Auto-reminders will stop.')) {
    await api.disconnectWhatsapp();
    renderConnStatus(false);
    showToastNotification('WhatsApp account disconnected.');
  }
};

// Simulate Automatic Queue Sender
async function processNextQueueItemSimulated() {
  const statusRes = await api.getWhatsappStatus();
  const isConnected = statusRes.status === 'CONNECTED';
  const settings = await api.getWhatsappSettings();
  const isPaused = localStorage.getItem('queuePaused') === 'true';
  
  if (!settings.autoEnabled || isPaused) return;
  
  const queue = JSON.parse(localStorage.getItem('queue') || '[]');
  const pendingItemIndex = queue.findIndex(item => item.status === 'Pending');
  
  if (pendingItemIndex === -1) return;
  
  const item = queue[pendingItemIndex];
  
  if (isConnected) {
    try {
      const res = await api.sendWhatsappMessage(item.parentNumber, `Reminder: ${item.studentName} due amount is ₹${item.amount}. Due date: ${item.dueDate}. Please clear at the earliest.`);
      if (res.success) {
        item.status = 'Sent';
        item.time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        showToastNotification(`Auto-Sent WhatsApp reminder to ${item.studentName}`);
      } else {
        item.status = 'Failed';
        showToastNotification(`Failed sending reminder to ${item.studentName}: ${res.error}`);
      }
    } catch (e) {
      item.status = 'Failed';
      showToastNotification(`Error sending reminder to ${item.studentName}`);
    }
  } else {
    // If not connected, we wait. Or if manual mode is enabled:
    if (settings.manualEnabled) {
      // Manual reminders do not auto-send from backend, they wait for staff trigger.
    }
  }
  
  localStorage.setItem('queue', JSON.stringify(queue));
  loadQueueMonitor();
}

// Trigger Manual Reminder implementation
window.triggerManualReminder = async (studentId, feeId) => {
  try {
    const statusRes = await api.getWhatsappStatus();
    const settings = await api.getWhatsappSettings();
    const isConnected = statusRes.status === 'CONNECTED';

    const students = await api.getStudents();
    const fees = await api.getFees();
    const student = students.find(s => s._id === studentId);
    const fee = fees.find(f => f._id === feeId);

    const template = settings.template || "Dear {{parentName}}, reminder that tuition fee of ₹{{amount}} for {{studentName}} is due on {{dueDate}}.";
    const message = template
      .replace('{{parentName}}', student.parentName)
      .replace('{{tuitionCenter}}', 'Techora Academy')
      .replace('{{studentName}}', student.name)
      .replace('{{class}}', student.class)
      .replace('{{amount}}', fee.dueAmount)
      .replace('{{dueDate}}', new Date(fee.dueDate).toLocaleDateString())
      .replace('{{batch}}', student.batch);

    if (isConnected) {
      showToastNotification(`Sending message via WhatsApp API...`);
      const sendRes = await api.sendWhatsappMessage(student.whatsappNumber, message);
      if (sendRes.success) {
        showToastNotification(`Successfully sent reminder to ${student.name}`);
        
        // Log in queue
        const queue = JSON.parse(localStorage.getItem('queue') || '[]');
        queue.push({
          id: 'q_' + Date.now(),
          studentName: student.name,
          parentNumber: student.whatsappNumber,
          amount: fee.dueAmount,
          dueDate: new Date(fee.dueDate).toLocaleDateString(),
          status: 'Sent',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        localStorage.setItem('queue', JSON.stringify(queue));
        loadReminders();
      } else {
        alert('Failed to send WhatsApp message via API: ' + sendRes.error);
      }
    } else {
      // Fallback to manual WhatsApp Web link
      const whatsappLink = `https://api.whatsapp.com/send?phone=${encodeURIComponent(student.whatsappNumber)}&text=${encodeURIComponent(message)}`;
      window.open(whatsappLink, '_blank');
      showToastNotification('WhatsApp Web manual link opened.');
      
      // Log in queue
      const queue = JSON.parse(localStorage.getItem('queue') || '[]');
      queue.push({
        id: 'q_' + Date.now(),
        studentName: student.name,
        parentNumber: student.whatsappNumber,
        amount: fee.dueAmount,
        dueDate: new Date(fee.dueDate).toLocaleDateString(),
        status: 'Sent',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      localStorage.setItem('queue', JSON.stringify(queue));
      loadReminders();
    }
  } catch (error) {
    console.error('Error triggering manual reminder:', error);
    alert('Error sending reminder: ' + error.message);
  }
};

// Toast notification system helper
window.showToastNotification = (message) => {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = 'position: fixed; bottom: 24px; right: 24px; z-index: 9999; display: flex; flex-direction: column; gap: 8px;';
    document.body.appendChild(container);
  }
  
  const toast = document.createElement('div');
  toast.style.cssText = 'background: var(--bg-secondary); color: var(--text-main); border-left: 4px solid #10b981; box-shadow: var(--shadow-lg); padding: 12px 20px; border-radius: 8px; font-size: 0.85rem; font-weight: 500; display: flex; align-items: center; gap: 10px; min-width: 250px; transform: translateY(50px); opacity: 0; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); border: 1px solid var(--border-color);';
  toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color: #10b981; font-size: 1.1rem;"></i> <span>${message}</span>`;
  
  container.appendChild(toast);
  
  // Trigger animation
  setTimeout(() => {
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';
  }, 10);
  
  // Remove toast
  setTimeout(() => {
    toast.style.transform = 'translateY(-20px)';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
};


async function loadQueueMonitor() {
  const queueContainer = document.getElementById('queue-list-container');
  if (!queueContainer) return;

  try {
    const { queue, stats } = await api.getQueue();

    document.getElementById('q-stat-pending').textContent = stats.pendingCount;
    document.getElementById('q-stat-sent').textContent = stats.sentCount;
    document.getElementById('q-stat-failed').textContent = stats.failedCount;

    const badge = document.getElementById('queue-status-badge');
    const pauseBtn = document.getElementById('queue-pause-btn');

    if (stats.isPaused) {
      badge.textContent = 'Paused';
      badge.className = 'badge badge-unpaid';
      pauseBtn.innerHTML = `<i class="fa-solid fa-play"></i> Resume Queue`;
    } else {
      badge.textContent = 'Running';
      badge.className = 'badge badge-paid';
      pauseBtn.innerHTML = `<i class="fa-solid fa-pause"></i> Pause Queue`;
    }

    if (queue.length === 0) {
      queueContainer.innerHTML = `<p style="text-align: center; color: var(--text-muted); font-size: 0.8rem; padding: 20px;">Queue is empty.</p>`;
      return;
    }

    queueContainer.innerHTML = queue.map(item => {
      let iconColor = '#2563EB';
      if (item.status === 'Sent') iconColor = '#10B981';
      if (item.status === 'Failed') iconColor = '#EF4444';
      if (item.status === 'Cancelled') iconColor = '#64748B';

      return `
        <div style="background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 12px; padding: 12px; display: flex; align-items: center; justify-content: space-between; gap: 8px;">
          <div>
            <h5 style="font-size: 0.85rem; font-weight: 600;">${item.studentName}</h5>
            <p style="font-size: 0.75rem; color: var(--text-muted);">${item.parentNumber} | Due: ₹${item.amount}</p>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 0.75rem; font-weight: 700; color: ${iconColor};">${item.status}</span>
            ${item.status === 'Pending' ? `
              <button onclick="cancelQueueItem('${item.id}')" class="btn btn-secondary" style="padding: 4px 8px; font-size: 0.7rem; color: #ef4444; border-color: rgba(239, 68, 68, 0.2);">Cancel</button>
            ` : ''}
            ${item.status === 'Failed' || item.status === 'Cancelled' ? `
              <button onclick="retryQueueItem('${item.id}')" class="btn btn-secondary" style="padding: 4px 8px; font-size: 0.7rem; color: var(--color-primary);">Retry</button>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

  } catch (error) {
    console.error('Error loading queue:', error);
  }
}

window.toggleQueueState = async () => {
  const isPaused = document.getElementById('queue-status-badge').textContent === 'Paused';
  const action = isPaused ? 'resume' : 'pause';
  await api.postQueueAction(action);
  loadQueueMonitor();
};

window.clearQueue = async () => {
  if (await confirm('Are you sure you want to cancel all pending queue messages?')) {
    localStorage.setItem('queue', JSON.stringify([]));
    loadQueueMonitor();
  }
};

window.cancelQueueItem = async (id) => {
  await api.postReminderAction(id, 'cancel');
  loadQueueMonitor();
};

window.retryQueueItem = async (id) => {
  await api.postReminderAction(id, 'retry');
  loadQueueMonitor();
};

window.saveSettings = async () => {
  const manualEnabled = document.getElementById('toggle-manual').checked;
  const autoEnabled = document.getElementById('toggle-auto').checked;
  const delayMinutes = document.getElementById('queue-delay').value;
  const template = document.getElementById('template-text').value;

  const groupShareEnabled = document.getElementById('toggle-group-share').checked;
  const groupLinkOrPhone = document.getElementById('att-group-target').value;
  const attendanceTemplate = document.getElementById('att-template-text').value;

  try {
    await api.updateWhatsappSettings({
      manualEnabled,
      autoEnabled,
      delayMinutes,
      template,
      reminderDays: 2,
      language: "English",
      groupShareEnabled,
      groupLinkOrPhone,
      attendanceTemplate
    });
    alert('WhatsApp notification settings updated successfully.');
  } catch (error) {
    alert('Error saving settings: ' + error.message);
  }
};
