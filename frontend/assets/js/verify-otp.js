document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('otp-form');
  const otpInputs = document.querySelectorAll('.otp-box');
  const errorMessage = document.getElementById('error-message');
  const displayEmail = document.getElementById('display-email');
  const timerDisplay = document.getElementById('timer-display');
  const resendBtn = document.getElementById('resend-btn');
  const submitBtn = document.getElementById('submit-btn');

  // Load email from previous step
  const savedEmail = localStorage.getItem('resetEmail');
  if (savedEmail) {
    displayEmail.textContent = savedEmail;
  } else {
    // If no email, redirect back
    window.location.href = 'forgot-password.html';
  }

  // 1. OTP Input Logic (Auto-focus, Backspace, Paste)
  otpInputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
      // Allow only numbers
      input.value = input.value.replace(/[^0-9]/g, '');
      
      // Auto focus next
      if (input.value !== '' && index < otpInputs.length - 1) {
        otpInputs[index + 1].focus();
      }
    });

    input.addEventListener('keydown', (e) => {
      // Backspace moves to previous
      if (e.key === 'Backspace' && input.value === '' && index > 0) {
        otpInputs[index - 1].focus();
      }
    });

    // Paste support
    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
      
      if (pastedData) {
        for (let i = 0; i < pastedData.length; i++) {
          if (i < otpInputs.length) {
            otpInputs[i].value = pastedData[i];
          }
        }
        // Focus the next empty input or the last one
        const nextInputIndex = Math.min(pastedData.length, 5);
        if(nextInputIndex < otpInputs.length) {
          otpInputs[nextInputIndex].focus();
        } else {
          otpInputs[5].focus();
        }
      }
    });
  });

  // Focus first input on load
  otpInputs[0].focus();

  // 2. Timers
  let expirationTime = 5 * 60; // 5 minutes
  let cooldownTime = 30; // 30 seconds
  let expireInterval, cooldownInterval;

  const startTimers = () => {
    clearInterval(expireInterval);
    clearInterval(cooldownInterval);
    
    expirationTime = 5 * 60;
    cooldownTime = 30;
    
    resendBtn.classList.add('disabled');
    resendBtn.style.pointerEvents = 'none';

    expireInterval = setInterval(() => {
      if (expirationTime <= 0) {
        clearInterval(expireInterval);
        timerDisplay.textContent = '00:00';
        timerDisplay.style.color = '#ef4444';
        errorMessage.textContent = 'OTP has expired. Please request a new one.';
        errorMessage.style.display = 'block';
        submitBtn.disabled = true;
      } else {
        expirationTime--;
        const mins = Math.floor(expirationTime / 60);
        const secs = expirationTime % 60;
        timerDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      }
    }, 1000);

    cooldownInterval = setInterval(() => {
      if (cooldownTime <= 0) {
        clearInterval(cooldownInterval);
        resendBtn.classList.remove('disabled');
        resendBtn.style.pointerEvents = 'auto';
        resendBtn.textContent = 'Resend OTP';
      } else {
        cooldownTime--;
        resendBtn.textContent = `Resend OTP (${cooldownTime}s)`;
      }
    }, 1000);
  };

  startTimers();

  resendBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (!resendBtn.classList.contains('disabled')) {
      errorMessage.style.display = 'none';
      submitBtn.disabled = false;
      timerDisplay.style.color = 'var(--text-main)';
      
      // Clear inputs
      otpInputs.forEach(input => input.value = '');
      otpInputs[0].focus();
      
      startTimers();
    }
  });

  // 3. Validation Logic
  let failedAttempts = 0;
  const maxAttempts = 3;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const otp = Array.from(otpInputs).map(i => i.value).join('');
    
    if (otp.length < 6) {
      errorMessage.textContent = 'Please enter all 6 digits.';
      errorMessage.style.display = 'block';
      return;
    }

    if (expirationTime <= 0) {
      return;
    }

    // Simulate OTP verification (demo accepts '123456')
    if (otp === '123456') {
      submitBtn.innerHTML = 'Verifying... <i class="fa-solid fa-spinner fa-spin"></i>';
      setTimeout(() => {
        window.location.href = 'reset-password.html';
      }, 1000);
    } else {
      failedAttempts++;
      form.classList.add('shake');
      setTimeout(() => form.classList.remove('shake'), 400);
      
      // Clear inputs
      otpInputs.forEach(input => input.value = '');
      otpInputs[0].focus();

      if (failedAttempts >= maxAttempts) {
        errorMessage.textContent = 'Too many failed attempts. Please request a new OTP.';
        errorMessage.style.display = 'block';
        submitBtn.disabled = true;
        clearInterval(expireInterval);
        timerDisplay.textContent = '00:00';
        timerDisplay.style.color = '#ef4444';
      } else {
        errorMessage.textContent = `Invalid OTP. Attempts remaining: ${maxAttempts - failedAttempts}`;
        errorMessage.style.display = 'block';
      }
    }
  });
});
