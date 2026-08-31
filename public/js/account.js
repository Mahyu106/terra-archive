/* ============================================================
   account.js
============================================================ */

function showStatus(message, isError) {
  const el = document.getElementById('statusMsg');
  el.textContent = message;
  el.className = 'status-msg show' + (isError ? ' error' : '');
}

initAuthHeader().then(session => {
  if (!session || !session.loggedIn) {
    window.location.href = 'login.html';
  }
});

document.getElementById('accountForm').addEventListener('submit', async (e) => {
  e.preventDefault();

const newUsername = document.getElementById('newUsername').value.trim();
const newPassword = document.getElementById('newPassword').value;
const newPasswordConfirm = document.getElementById('newPasswordConfirm').value;

if (!newUsername && !newPassword) {
  showStatus('Isi username atau password baru terlebih dahulu.', true);
  return;
}

if (newPassword && newPassword !== newPasswordConfirm) {
  showStatus('Password baru dan ulangi password tidak sama.', true);
  return;
}

const payload = {};
if (newUsername) payload.newUsername = newUsername;
if (newPassword) payload.newPassword = newPassword;

  try {
    const res = await fetch('/api/account', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (!res.ok) {
      showStatus(data.error || 'Gagal menyimpan perubahan.', true);
      return;
    }

    showStatus('Berhasil disimpan. Memuat ulang...', false);
    document.getElementById('newUsername').value = ''; 
    document.getElementById('newPassword').value = '';
    document.getElementById('newPasswordConfirm').value = '';
    setTimeout(() => window.location.reload(), 1200);
  } catch (err) {
    showStatus('Tidak bisa terhubung ke server.', true);
  }
});
