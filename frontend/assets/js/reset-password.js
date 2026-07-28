document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('reset-password-form');
  const newPassword = document.getElementById('new-password');
  const confirmPassword = document.getElementById('confirm-password');
  const toggleNew = document.getElementById('toggle-new-password');
  const toggleConfirm = document.getElementById('toggle-confirm-password');
  const errorMessage = document.getElementById('error-message');
  const successMessage = document.getElementById('success-message');
  const submitBtn = document.getElementById('submit-btn');

  // Elements for strength meter
  const strengthFill = document.getElementById('strength-fill');
  const strengthText = document.getElementById('strength-text');
  
  // Checklist elements
  const reqLength = document.getElementById('req-length');
  const reqUpper = document.getElementById('req-upper');
  const reqLower = document.getElementById('req-lower');
  const reqNumber = document.getElementById('req-number');
  const reqSpecial = document.getElementById('req-special');

  // Toggle Password Visibility
  const toggleVisibility = (toggleBtn, inputEl) => {
    toggleBtn.addEventListener('click', () => {
      const type = inputEl.getAttribute('type') === 'password' ? 'text' : 'password';
      inputEl.setAttribute('type', type);
      if (type === 'text') {
        toggleBtn.classList.replace('fa-eye', 'fa-eye-slash');
      } else {
        toggleBtn.classList.replace('fa-eye-slash', 'fa-eye');
      }
    });
  };

  toggleVisibility(toggleNew, newPassword);
  toggleVisibility(toggleConfirm, confirmPassword);

  // Validate Password Logic
  const checkPasswordStrength = (password) => {
    let score = 0;
    
    // Checklist validations
    const hasLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    const updateReq = (el, isValid) => {
      if (isValid) {
        el.classList.remove('invalid');
        el.classList.add('valid');
        el.querySelector('i').classList.replace('fa-circle-xmark', 'fa-circle-check');
      } else {
        el.classList.remove('valid');
        el.classList.add('invalid');
        el.querySelector('i').classList.replace('fa-circle-check', 'fa-circle-xmark');
      }
    };

    updateReq(reqLength, hasLength);
    updateReq(reqUpper, hasUpper);
    updateReq(reqLower, hasLower);
    updateReq(reqNumber, hasNumber);
    updateReq(reqSpecial, hasSpecial);

    if (hasLength) score++;
    if (hasUpper) score++;
    if (hasLower) score++;
    if (hasNumber) score++;
    if (hasSpecial) score++;

    // Update meter
    if (password === '') {
      strengthFill.style.width = '0%';
      strengthFill.style.backgroundColor = 'transparent';
      strengthText.textContent = 'Password Strength';
      strengthText.style.color = 'var(--text-muted)';
    } else if (score <= 2) {
      strengthFill.style.width = '25%';
      strengthFill.style.backgroundColor = '#ef4444'; // Red
      strengthText.textContent = 'Weak';
      strengthText.style.color = '#ef4444';
    } else if (score <= 4) {
      strengthFill.style.width = '60%';
      strengthFill.style.backgroundColor = '#f59e0b'; // Yellow
      strengthText.textContent = 'Medium';
      strengthText.style.color = '#f59e0b';
    } else if (score === 5) {
      strengthFill.style.width = '100%';
      strengthFill.style.backgroundColor = '#10b981'; // Green
      strengthText.textContent = 'Strong';
      strengthText.style.color = '#10b981';
    }

    return score === 5;
  };

  newPassword.addEventListener('input', () => {
    checkPasswordStrength(newPassword.value);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    errorMessage.style.display = 'none';

    const p1 = newPassword.value;
    const p2 = confirmPassword.value;

    if (!checkPasswordStrength(p1)) {
      errorMessage.textContent = 'Please meet all password requirements.';
      errorMessage.style.display = 'block';
      form.classList.add('shake');
      setTimeout(() => form.classList.remove('shake'), 400);
      return;
    }

    if (p1 !== p2) {
      errorMessage.textContent = 'Passwords do not match.';
      errorMessage.style.display = 'block';
      form.classList.add('shake');
      setTimeout(() => form.classList.remove('shake'), 400);
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Resetting... <i class="fa-solid fa-spinner fa-spin"></i>';

    setTimeout(() => {
      // Simulate successful reset
      localStorage.removeItem('resetEmail'); // clear data
      successMessage.textContent = 'Password reset successfully! Redirecting to login...';
      successMessage.style.display = 'block';
      
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);
    }, 1500);
  });
});
