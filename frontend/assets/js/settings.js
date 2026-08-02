document.addEventListener('DOMContentLoaded', () => {
  const currentPath = window.location.pathname;

  if (currentPath.endsWith('settings.html')) {
    initSettingsPage();
  }
});

async function initSettingsPage() {
  const form = document.getElementById('settings-general-form');
  const logoInput = document.getElementById('logo-file-input');
  const logoPreview = document.getElementById('logo-preview');

  // Load existing settings
  try {
    const s = await api.getSettings();
    document.getElementById('tuitionName').value = s.tuitionName || '';
    document.getElementById('academicYear').value = s.academicYear || '2026-27';
    document.getElementById('phone').value = s.phone || '';
    document.getElementById('email').value = s.email || '';
    document.getElementById('address').value = s.address || '';
    
    if (s.logo) {
      logoPreview.src = s.logo;
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }

  // Load WhatsApp Group configuration per batch
  let timetableSettings = {};
  let batchesList = [];
  try {
    timetableSettings = await api.getTimetableSettings();
    timetableSettings.batches = timetableSettings.batches || {};
    
    batchesList = await api.getBatches();
    const batchSelect = document.getElementById('wa-batch-select');
    const fieldsDiv = document.getElementById('wa-batch-settings-fields');
    const noBatchesDiv = document.getElementById('wa-batch-no-batches');

    if (batchSelect) {
      if (batchesList.length === 0) {
        batchSelect.innerHTML = '<option value="">No batches available</option>';
        if (fieldsDiv) fieldsDiv.style.display = 'none';
        if (noBatchesDiv) noBatchesDiv.style.display = 'block';
      } else {
        batchSelect.innerHTML = batchesList.map(b => `<option value="${b._id}">${b.name} (${b.class || 'No Class'})</option>`).join('');
        if (fieldsDiv) fieldsDiv.style.display = 'flex';
        if (noBatchesDiv) noBatchesDiv.style.display = 'none';
        
        // Define batch change handler
        window.onWABatchChanged = () => {
          const batchId = batchSelect.value;
          const bSettings = timetableSettings.batches[batchId] || {};
          const waAutoBroadcast = document.getElementById('wa-auto-broadcast');
          if (waAutoBroadcast) waAutoBroadcast.checked = !!bSettings.autoBroadcast;
          const selectedBatch = batchesList.find(b => b._id === batchId);
          const waGroupName = document.getElementById('wa-group-name');
          if (waGroupName) waGroupName.value = bSettings.groupName || (selectedBatch ? selectedBatch.name + " Group" : '');
          const waGroupLink = document.getElementById('wa-group-link');
          if (waGroupLink) waGroupLink.value = bSettings.groupLink || '';
        };
        
        window.onWABatchChanged(); // Trigger initial load
      }
    }

    // Attendance Batch Template settings
    const attBatchSelect = document.getElementById('att-batch-select');
    const attFieldsDiv = document.getElementById('att-batch-settings-fields');
    const attNoBatchesDiv = document.getElementById('att-batch-no-batches');
    
    if (batchesList.length === 0) {
      if (attBatchSelect) attBatchSelect.innerHTML = '<option value="">No batches available</option>';
      if (attFieldsDiv) attFieldsDiv.style.display = 'none';
      if (attNoBatchesDiv) attNoBatchesDiv.style.display = 'block';
    } else {
      if (attBatchSelect) attBatchSelect.innerHTML = batchesList.map(b => `<option value="${b._id}">${b.name} (${b.class || 'No Class'})</option>`).join('');
      if (attFieldsDiv) attFieldsDiv.style.display = 'flex';
      if (attNoBatchesDiv) attNoBatchesDiv.style.display = 'none';
      
      window.onAttBatchChanged = () => {
        const batchId = attBatchSelect.value;
        const bSettings = timetableSettings.batches[batchId] || {};
        const defaultTemplate = `*Attendance Report*\nDate: {{date}}\nClass: {{class}}\nBatch: {{batch}}\n---------------------\nTotal Students: {{total}}\nPresent: {{present}} ({{presentPercent}}%)\nAbsent: {{absent}}\n\n*Absentees:* {{absentsList}}`;
        document.getElementById('att-template-text').value = bSettings.attendanceTemplate || defaultTemplate;
      };
      
      if (attBatchSelect) window.onAttBatchChanged();
    }
    
    // Re-initialize custom selects for dynamically added options
    if (attBatchSelect && attBatchSelect.nextElementSibling && attBatchSelect.nextElementSibling.classList.contains('custom-select-container')) {
      attBatchSelect.nextElementSibling.remove();
      attBatchSelect.style.display = '';
    }
    const batchSelectWA = document.getElementById('wa-batch-select');
    if (batchSelectWA && batchSelectWA.nextElementSibling && batchSelectWA.nextElementSibling.classList.contains('custom-select-container')) {
      batchSelectWA.nextElementSibling.remove();
      batchSelectWA.style.display = '';
    }
    
    if (window.initializeCustomSelects) {
      window.initializeCustomSelects();
    }
  } catch (error) {
    console.error('Error loading WhatsApp Group settings:', error);
    alert('Error loading WhatsApp Group settings: ' + error.message);
  }

  // Handle logo upload preview (base64 in mock mode)
  logoInput.addEventListener('change', () => {
    const file = logoInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        logoPreview.src = e.target.result;
        // Save to mock storage immediately or on submit
        const profile = JSON.parse(localStorage.getItem('profileSettings') || '{}');
        profile.logo = e.target.result;
        localStorage.setItem('profileSettings', JSON.stringify(profile));
      };
      reader.readAsDataURL(file);
    }
  });

  // Handle General Form Submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);

    try {
      await api.updateSettings(formData);
      alert('General configurations updated successfully.');
      window.location.reload();
    } catch (error) {
      alert('Error updating settings: ' + error.message);
    }
  });

  // Set active state to theme button
  const currentTheme = localStorage.getItem('theme') || 'dark';
  updateThemeUI(currentTheme);

  // Switch to the tab requested via URL param (e.g. ?tab=whatsapp)
  const urlParams = new URLSearchParams(window.location.search);
  const tab = urlParams.get('tab') || 'general';
  switchSettingsSection(tab);
}

window.switchSettingsSection = (sectionName) => {
  const links = document.querySelectorAll('.settings-link');
  const panels = document.querySelectorAll('.settings-panel');

  links.forEach(l => l.classList.remove('active'));
  panels.forEach(p => p.style.display = 'none');

  if (sectionName === 'general') {
    links[0].classList.add('active');
    document.getElementById('panel-general').style.display = 'block';
  } else if (sectionName === 'branding') {
    links[1].classList.add('active');
    document.getElementById('panel-branding').style.display = 'block';
  } else if (sectionName === 'notifications') {
    links[2].classList.add('active');
    document.getElementById('panel-notifications').style.display = 'block';
  } else if (sectionName === 'whatsapp') {
    links[3].classList.add('active');
    document.getElementById('panel-whatsapp').style.display = 'block';
  } else if (sectionName === 'security') {
    links[4].classList.add('active');
    document.getElementById('panel-security').style.display = 'block';
  }
};

window.saveAttTemplateSettings = async () => {
  const batchSelect = document.getElementById('att-batch-select');
  if (!batchSelect || !batchSelect.value) {
    alert("No batch selected.");
    return;
  }
  const batchId = batchSelect.value;
  const template = document.getElementById('att-template-text').value;

  try {
    const currentSettings = await api.getTimetableSettings();
    currentSettings.batches = currentSettings.batches || {};
    currentSettings.batches[batchId] = currentSettings.batches[batchId] || {};
    currentSettings.batches[batchId].attendanceTemplate = template;

    await api.saveTimetableSettings(currentSettings);
    alert("Attendance template for this batch saved successfully!");
  } catch (error) {
    alert("Failed to save template: " + error.message);
  }
};

window.saveTimetableGroupSettings = async () => {
  const batchSelect = document.getElementById('wa-batch-select');
  if (!batchSelect || !batchSelect.value) {
    alert("No batch selected.");
    return;
  }
  const batchId = batchSelect.value;
  const autoBroadcast = document.getElementById('wa-auto-broadcast').checked;
  const groupName = document.getElementById('wa-group-name').value;
  const groupLink = document.getElementById('wa-group-link').value;

  try {
    const currentSettings = await api.getTimetableSettings();
    currentSettings.batches = currentSettings.batches || {};
    currentSettings.batches[batchId] = { autoBroadcast, groupName, groupLink };
    
    // Also update global ones for backwards compatibility / fallback
    currentSettings.autoBroadcast = autoBroadcast;
    currentSettings.groupName = groupName;
    currentSettings.groupLink = groupLink;

    await api.saveTimetableSettings(currentSettings);
    alert("WhatsApp Group configuration for this batch saved successfully!");
  } catch (error) {
    alert("Failed to save settings: " + error.message);
  }
};

window.updateThemeUI = (theme) => {
  const lightBtn = document.getElementById('theme-light-btn');
  const darkBtn = document.getElementById('theme-dark-btn');
  if (lightBtn && darkBtn) {
    if (theme === 'light') {
      lightBtn.style.background = 'var(--color-primary)';
      lightBtn.style.color = '#fff';
      darkBtn.style.background = 'transparent';
      darkBtn.style.color = 'var(--text-main)';
    } else {
      darkBtn.style.background = 'var(--color-primary)';
      darkBtn.style.color = '#fff';
      lightBtn.style.background = 'transparent';
      lightBtn.style.color = 'var(--text-main)';
    }
  }

  const lightCard = document.getElementById('theme-light-card');
  const darkCard = document.getElementById('theme-dark-card');
  if (lightCard && darkCard) {
    if (theme === 'light') {
      lightCard.classList.add('active');
      darkCard.classList.remove('active');
    } else {
      darkCard.classList.add('active');
      lightCard.classList.remove('active');
    }
  }
};
