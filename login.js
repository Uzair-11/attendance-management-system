// login.js

// Hardcoded single admin user
const adminUser = {
  username: 'admin',
  password: 'admin@123',
  role: 'admin'
};

// Attach submit event to the form instead of click on button
document.getElementById('loginForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  if (!username || !password) {
    alert('Please fill in all fields.');
    return;
  }

  if (username === adminUser.username && password === adminUser.password) {
    // Save logged in user to localStorage
    localStorage.setItem('loggedInUser', JSON.stringify(adminUser));
    alert('Login successful!');

    // Redirect to admin dashboard
    window.location.href = 'lecture-setup.html'; // Or your admin landing page
  } else {
    alert('Invalid username or password.');
  }
});
