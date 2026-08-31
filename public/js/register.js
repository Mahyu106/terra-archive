/* ============================================================
   register.js
============================================================ */

document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const passwordConfirm = document.getElementById('passwordConfirm').value;
  const errorBox = document.getElementById('registerError');
  const successBox = document.getElementById('registerSuccess');

  errorBox.classList.remove('show');
  successBox.classList.remove('show');

  if (password !== passwordConfirm) {
    errorBox.textContent = 'Password dan ulangi password tidak sama.';
    errorBox.classList.add('show');
    return;
  }

  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();

    if (!res.ok) {
      errorBox.textContent = data.error || 'Gagal mendaftar.';
      errorBox.classList.add('show');
      return;
    }

    successBox.textContent = 'Akun berhasil dibuat! Mengarahkan ke halaman login...';
    successBox.classList.add('show');
    setTimeout(() => { window.location.href = 'login.html'; }, 1500);
  } catch (err) {
    errorBox.textContent = 'Tidak bisa terhubung ke server.';
    errorBox.classList.add('show');
  }
});
