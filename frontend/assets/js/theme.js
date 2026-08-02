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
        <style>
          @keyframes popFloat {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-15px) rotate(5deg); }
          }
          @keyframes popPulse {
            0%, 100% { opacity: 0.15; transform: scale(1); }
            50% { opacity: 0.3; transform: scale(1.2); }
          }
          @keyframes popShine {
            0% { left: -100%; }
            100% { left: 200%; }
          }
          .pop-floating-el { animation: popFloat 4s ease-in-out infinite; }
          .pop-pulse-el { animation: popPulse 4s ease-in-out infinite; }
          .pop-logo-container { position: relative; overflow: hidden; }
          .pop-logo-container::after {
            content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
            transform: skewX(-20deg); animation: popShine 3s infinite;
          }
        </style>
        <div style="background: var(--bg-secondary); padding: 48px; border-radius: 32px; text-align: center; max-width: 480px; width: 90%; box-shadow: 0 24px 80px rgba(0,0,0,0.3), 0 0 40px rgba(37,99,235,0.05) inset; border: 1px solid rgba(255,255,255,0.05); transform: scale(0.9); transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); position: relative; overflow: hidden;">
          
          <!-- Animated Background Glows -->
          <div class="pop-pulse-el" style="position: absolute; top: -50px; left: -50px; width: 200px; height: 200px; background: var(--color-primary); filter: blur(100px); border-radius: 50%; pointer-events: none;"></div>
          <div class="pop-pulse-el" style="position: absolute; bottom: -50px; right: -50px; width: 200px; height: 200px; background: var(--color-accent); filter: blur(100px); border-radius: 50%; pointer-events: none; animation-delay: 2s;"></div>
          
          <!-- Floating Decorative Elements -->
          <div class="pop-floating-el" style="position: absolute; top: 15%; left: 10%; width: 24px; height: 24px; border-radius: 50%; background: linear-gradient(135deg, var(--color-primary), transparent); opacity: 0.4;"></div>
          <div class="pop-floating-el" style="position: absolute; bottom: 20%; right: 10%; width: 32px; height: 32px; border-radius: 8px; background: linear-gradient(135deg, var(--color-accent), transparent); opacity: 0.3; transform: rotate(45deg); animation-delay: 1s;"></div>
          <div class="pop-floating-el" style="position: absolute; top: 30%; right: 15%; width: 12px; height: 12px; border-radius: 50%; background: var(--color-primary); opacity: 0.5; animation-delay: 2.5s;"></div>
          <div class="pop-floating-el" style="position: absolute; bottom: 35%; left: 12%; width: 18px; height: 18px; background: var(--color-accent); opacity: 0.4; border-radius: 4px; transform: rotate(15deg); animation-delay: 1.5s;"></div>
          
          <div style="position: relative; z-index: 1;">
            <div class="pop-logo-container pop-floating-el" style="display: inline-block; padding: 12px; background: linear-gradient(135deg, rgba(37,99,235,0.05), rgba(124,58,237,0.05)); border-radius: 28px; margin-bottom: 24px; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.05), 0 12px 32px rgba(37,99,235,0.15); animation-duration: 6s;">
              <img src="../assets/images/logo.jpg" style="width: 88px; height: 88px; border-radius: 20px; object-fit: cover;">
            </div>
            
            <h2 style="font-family: var(--font-heading); font-size: 2.5rem; font-weight: 800; margin-bottom: 16px; color: var(--text-main); letter-spacing: -0.02em;">Techora <span style="background: linear-gradient(135deg, var(--color-primary), var(--color-accent)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">EduFee</span></h2>
            
            <p style="color: var(--text-muted); font-size: 1.1rem; line-height: 1.6; margin-bottom: 36px; font-weight: 400; max-width: 90%; margin-left: auto; margin-right: auto;">
              The most powerful, secure, and intuitive fee management platform built specifically for modern educational institutions.
            </p>
            
            <div style="margin-bottom: 36px;">
              <span style="font-size: 0.85rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; padding: 8px 16px; background: linear-gradient(135deg, rgba(37,99,235,0.1), rgba(124,58,237,0.1)); color: var(--color-primary); border-radius: 20px; border: 1px solid rgba(37,99,235,0.1); box-shadow: 0 4px 12px rgba(0,0,0,0.05);">Version 1.0.0 (Pro)</span>
            </div>

            <button id="close-software-info-auth" style="background: linear-gradient(135deg, var(--color-primary), var(--color-accent)); color: #fff; border: none; padding: 16px 48px; border-radius: 16px; font-weight: 600; font-size: 1.05rem; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 8px 24px rgba(37,99,235,0.3), inset 0 1px 0 rgba(255,255,255,0.2);" onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 12px 32px rgba(37,99,235,0.4), inset 0 1px 0 rgba(255,255,255,0.2)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 24px rgba(37,99,235,0.3), inset 0 1px 0 rgba(255,255,255,0.2)';">Awesome!</button>
          </div>
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
