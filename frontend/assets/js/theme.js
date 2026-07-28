document.addEventListener('DOMContentLoaded', () => {
  const themeToggleBtn = document.getElementById('theme-toggle');
  
  // 1. Determine Initial Theme
  // Check local storage first, then fallback to system preference
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  const currentTheme = savedTheme ? savedTheme : 'dark';
  
  // Apply the theme to the document
  if (currentTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    if(themeToggleBtn) {
      themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
    }
  } else {
    document.documentElement.removeAttribute('data-theme');
    if(themeToggleBtn) {
      themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
    }
  }

  // 2. Handle Theme Toggle Button Click
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const isDarkMode = document.documentElement.hasAttribute('data-theme');
      
      if (isDarkMode) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
      }
    });
  }

  // 3. Listen for system theme changes if no local storage preference is set
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      if (e.matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
        if(themeToggleBtn) themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
      } else {
        document.documentElement.removeAttribute('data-theme');
        if(themeToggleBtn) themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
      }
    }
  });

  // 4. Handle "About Software" popup for auth pages
  const authBrandSection = document.querySelector('.login-card .brand-section');
  if (authBrandSection) {
    authBrandSection.style.cursor = 'pointer';
    authBrandSection.addEventListener('click', () => {
      const popup = document.createElement('div');
      popup.className = 'modal-overlay active';
      popup.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 99999; backdrop-filter: blur(8px); opacity: 0; transition: opacity 0.3s ease;';
      
      popup.innerHTML = `
        <div style="background: var(--bg-secondary); padding: 48px; border-radius: 32px; text-align: center; max-width: 480px; width: 90%; box-shadow: 0 24px 80px rgba(0,0,0,0.3); border: 1px solid var(--border-color); transform: scale(0.9); transition: transform 0.3s ease; position: relative;">
          <img src="../assets/images/logo.jpg" style="width: 96px; height: 96px; border-radius: 24px; margin-bottom: 24px; box-shadow: 0 12px 32px rgba(37,99,235,0.3);">
          <h2 style="font-family: var(--font-heading); color: var(--text-main); font-size: 2.2rem; font-weight: 800; margin-bottom: 12px;">Techora <span style="color: var(--color-primary);">EduFee</span></h2>
          <p style="color: var(--text-muted); font-size: 1.05rem; line-height: 1.6; margin-bottom: 32px;">
            The most powerful, secure, and intuitive fee management platform built specifically for modern educational institutions.
            <br><br><span style="font-size: 0.9rem; font-weight: 600; padding: 6px 12px; background: rgba(37,99,235,0.1); color: var(--color-primary); border-radius: 8px;">Version 1.0.0 (Pro)</span>
          </p>
          <button id="close-software-info-auth" style="background: linear-gradient(135deg, var(--color-primary), var(--color-accent)); color: #fff; border: none; padding: 14px 40px; border-radius: 12px; font-weight: 600; font-size: 1rem; cursor: pointer; transition: transform 0.2s ease, box-shadow 0.2s ease; box-shadow: 0 8px 24px rgba(37,99,235,0.3);" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 12px 28px rgba(37,99,235,0.4)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 24px rgba(37,99,235,0.3)';">Awesome!</button>
        </div>
      `;
      
      document.body.appendChild(popup);
      
      setTimeout(() => {
        popup.style.opacity = '1';
        popup.firstElementChild.style.transform = 'scale(1)';
      }, 10);
      
      const closePopup = () => {
        popup.style.opacity = '0';
        popup.firstElementChild.style.transform = 'scale(0.9)';
        setTimeout(() => popup.remove(), 300);
      };
      
      document.getElementById('close-software-info-auth').addEventListener('click', closePopup);
      popup.addEventListener('click', (e) => {
        if (e.target === popup) closePopup();
      });
    });
  }
});
