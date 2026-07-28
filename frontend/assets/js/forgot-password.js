document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('forgot-password-form');
  const errorMessage = document.getElementById('error-message');
  const successMessage = document.getElementById('success-message');
  const submitBtn = document.getElementById('submit-btn');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';

    if (!email) {
      errorMessage.textContent = 'Please enter your email address.';
      errorMessage.style.display = 'block';
      return;
    }

    // Simulate sending OTP
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Sending... <i class="fa-solid fa-spinner fa-spin"></i>';
    
    setTimeout(() => {
      // Store email for next step
      localStorage.setItem('resetEmail', email);
      
      successMessage.textContent = 'OTP sent successfully! Redirecting...';
      successMessage.style.display = 'block';
      
      setTimeout(() => {
        window.location.href = 'verify-otp.html';
      }, 1500);
    }, 1500);
  });
});
