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
  const currentTheme = localStorage.getItem('theme') || 'light';
  updateThemeUI(currentTheme);
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
  } else {
    links[2].classList.add('active');
    document.getElementById('panel-notifications').style.display = 'block';
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
