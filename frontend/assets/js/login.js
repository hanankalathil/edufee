document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const errorMessage = document.getElementById('error-message');

  // If user already logged in, redirect to dashboard
  if (api.getToken() && api.getUser()) {
    window.location.href = 'dashboard.html';
  }

  // Set default credentials suggestion
  console.log('Demo Login: admin@techora.in / admin123');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    errorMessage.style.display = 'none';

    try {
      await api.login(email, password);
      // Success, redirect to dashboard
      window.location.href = 'dashboard.html';
    } catch (error) {
      errorMessage.textContent = error.message || 'Invalid email or password';
      errorMessage.style.display = 'block';
    }
  });
});
