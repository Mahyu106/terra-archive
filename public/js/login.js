/* ============================================================
   login.js
============================================================ */

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const errorBox = document.getElementById('loginError');

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();

    if (!res.ok) {
      errorBox.textContent = data.error || 'Login gagal.';
      errorBox.classList.add('show');
      return;
    }

    window.location.href = 'index.html';
  } catch (err) {
    errorBox.textContent = 'Tidak bisa terhubung ke server.';
    errorBox.classList.add('show');
  }
});
