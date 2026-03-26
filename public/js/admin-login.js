// =====================================================
// ADMIN LOGIN SCRIPT
// =====================================================

document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('adminLoginForm');
  const loginError = document.getElementById('loginError');

  // Check if already logged in
  checkAuthentication();

  loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    // Clear previous errors
    loginError.style.display = 'none';

    // Validate input
    if (!username || !password) {
      showLoginError('Username and password are required');
      return;
    }

    // Show loading state
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline-block';

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Redirect to dashboard
        window.location.href = '/admin-dashboard';
      } else {
        showLoginError(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Error:', error);
      showLoginError('Network error. Please try again.');
    } finally {
      // Reset button state
      submitBtn.disabled = false;
      btnText.style.display = 'inline-block';
      btnLoader.style.display = 'none';
    }
  });

  function showLoginError(message) {
    document.getElementById('errorText').textContent = message;
    loginError.style.display = 'block';
  }

  async function checkAuthentication() {
    try {
      const response = await fetch('/api/admin/check-auth');
      const data = await response.json();

      if (data.authenticated) {
        window.location.href = '/admin-dashboard';
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
    }
  }
});
