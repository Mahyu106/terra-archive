/* ============================================================
   auth.js
   -------------------------------------------------------------
   Tidak memaksa login. Kalau belum login, tampilkan tombol
   LOGIN & DAFTAR di header. Kalau sudah login, tampilkan nama
   user + role + link AKUN SAYA + tombol LOGOUT, dan sembunyikan
   link admin dari yang bukan admin.
============================================================ */

async function initAuthHeader() {
  const controls = document.querySelector('.controls');

  try {
    const res = await fetch('/api/session');
    const data = await res.json();

    if (!controls) return data;

    if (data.loggedIn) {
      const userBox = document.createElement('div');
      userBox.className = 'user-box';
      userBox.innerHTML = `
        <span class="user-box-name">${data.username} <b>(${data.role === 'admin' ? 'ADMIN' : 'VIEWER'})</b></span>
        <a href="account.html" class="secondary-btn">AKUN SAYA</a>
        <button id="logoutBtn" class="secondary-btn">LOGOUT</button>
      `;
      controls.appendChild(userBox);

      document.getElementById('logoutBtn').addEventListener('click', async () => {
        await fetch('/api/logout', { method: 'POST' });
        window.location.reload();
      });

      if (data.role !== 'admin') {
        document.querySelectorAll('a[href="admin.html"], #goAdminBtn').forEach(el => el.remove());
      }
    } else {
      document.querySelectorAll('a[href="admin.html"], #goAdminBtn').forEach(el => el.remove());

      const authBox = document.createElement('div');
      authBox.className = 'user-box';
      authBox.innerHTML = `
        <a href="login.html" class="secondary-btn">LOGIN</a>
        <a href="register.html" class="rhodes-btn">DAFTAR</a>
      `;
      controls.appendChild(authBox);
    }

    return data;
  } catch (err) {
    console.error('Gagal cek sesi login:', err);
    return { loggedIn: false };
  }
}
