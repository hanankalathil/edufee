document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const errorMessage = document.getElementById('error-message');
  const togglePassword = document.getElementById('toggle-password');
  const passwordInput = document.getElementById('password');

  // Failed attempts tracking
  let failedAttempts = parseInt(localStorage.getItem('loginFailedAttempts') || '0');
  let lockoutTime = parseInt(localStorage.getItem('loginLockoutTime') || '0');
  const maxAttempts = 3;
  const lockoutDuration = 3 * 60 * 1000; // 3 minutes

  const checkLockout = () => {
    if (lockoutTime > Date.now()) {
      const remainingTime = Math.ceil((lockoutTime - Date.now()) / 1000);
      const minutes = Math.floor(remainingTime / 60);
      const seconds = remainingTime % 60;
      
      errorMessage.textContent = `Too many failed attempts. Try again in ${minutes}:${seconds.toString().padStart(2, '0')}.`;
      errorMessage.style.display = 'block';
      
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.5';
      submitBtn.style.cursor = 'not-allowed';
      
      setTimeout(checkLockout, 1000);
      return true;
    } else {
      if (lockoutTime !== 0) {
        localStorage.removeItem('loginLockoutTime');
        localStorage.setItem('loginFailedAttempts', '0');
        failedAttempts = 0;
        lockoutTime = 0;
        errorMessage.style.display = 'none';
        
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
        submitBtn.style.cursor = 'pointer';
      }
      return false;
    }
  };

  // Run initial lockout check
  checkLockout();

  // Password visibility toggle
  if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      
      if (type === 'text') {
        togglePassword.classList.remove('fa-eye');
        togglePassword.classList.add('fa-eye-slash');
      } else {
        togglePassword.classList.remove('fa-eye-slash');
        togglePassword.classList.add('fa-eye');
      }
    });
  }

  // If user already logged in, redirect to dashboard
  if (api.getToken() && api.getUser()) {
    window.location.href = 'dashboard.html';
  }

  // Set default credentials suggestion
  console.log('Demo Login: admin@techora.in / admin123');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (checkLockout()) return;
    
    const email = document.getElementById('email').value.trim();
    const password = passwordInput.value.trim();
    errorMessage.style.display = 'none';

    try {
      await api.login(email, password);
      // Success, reset attempts and redirect to dashboard
      localStorage.setItem('loginFailedAttempts', '0');
      window.location.href = 'dashboard.html';
    } catch (error) {
      failedAttempts++;
      localStorage.setItem('loginFailedAttempts', failedAttempts.toString());
      
      if (failedAttempts >= maxAttempts) {
        lockoutTime = Date.now() + lockoutDuration;
        localStorage.setItem('loginLockoutTime', lockoutTime.toString());
        loginForm.classList.add('shake');
        setTimeout(() => loginForm.classList.remove('shake'), 400);
        checkLockout();
      } else {
        errorMessage.textContent = `${error.message || 'Invalid email or password'}. Attempts remaining: ${maxAttempts - failedAttempts}`;
        errorMessage.style.display = 'block';
        loginForm.classList.add('shake');
        setTimeout(() => loginForm.classList.remove('shake'), 400);
      }
    }
  });
});
