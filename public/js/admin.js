/* ============================================================
   admin.js
   -------------------------------------------------------------
   Mengelola daftar entitas lewat form biasa di browser,
   memanggil endpoint POST/PUT/DELETE di server.js.
============================================================ */

let entities = [];
let editingId = null;

async function loadEntities() {
  try {
    const res = await fetch('/api/entities');
    entities = await res.json();
    renderList();
  } catch (err) {
    document.getElementById('adminList').innerHTML =
      `<p class="hint" style="color:var(--danger);">Gagal memuat data: ${err.message}</p>`;
  }
}

function renderList() {
  const list = document.getElementById('adminList');
  if (entities.length === 0) {
    list.innerHTML = '<p class="hint">Belum ada data.</p>';
    return;
  }
  list.innerHTML = '';
  entities.forEach(item => {
    const row = document.createElement('div');
    row.className = 'admin-row';
    row.innerHTML = `
      <span class="admin-row-name">${item.name}</span>
      <span class="admin-row-cat">${item.category === 'Organization' ? 'ORGANISASI' : 'NEGARA'}</span>
      <button type="button" class="secondary-btn" data-id="${item.id}">EDIT</button>
    `;
    row.querySelector('button').addEventListener('click', () => openForm(item.id));
    list.appendChild(row);
  });
}

function openForm(id) {
  editingId = id;
  document.getElementById('formWrap').style.display = 'block';
  document.getElementById('loreList').innerHTML = '';

  if (id) {
    const item = entities.find(e => e.id === id);
    document.getElementById('formTitle').textContent = 'Edit: ' + item.name;
    document.getElementById('fId').value = item.id;
    document.getElementById('fId').disabled = true;
    document.getElementById('fName').value = item.name;
    document.getElementById('fCategory').value = item.category;
    document.getElementById('fRegion').value = item.region || '';
    document.getElementById('fPosX').value = item.pos_x ?? '';
    document.getElementById('fPosY').value = item.pos_y ?? '';
    (item.lore || []).forEach(p => addParagraphField(p));
    if ((item.lore || []).length === 0) addParagraphField('');
    document.getElementById('deleteBtn').style.display = 'inline-block';
  } else {
    document.getElementById('formTitle').textContent = 'Tambah Entitas Baru';
    document.getElementById('fId').value = '';
    document.getElementById('fId').disabled = false;
    document.getElementById('fName').value = '';
    document.getElementById('fCategory').value = 'Nation';
    document.getElementById('fRegion').value = '';
    document.getElementById('fPosX').value = '';
    document.getElementById('fPosY').value = '';
    addParagraphField('');
    document.getElementById('deleteBtn').style.display = 'none';
  }

  document.getElementById('formWrap').scrollIntoView({ behavior: 'smooth' });
}

function addParagraphField(value) {
  const loreList = document.getElementById('loreList');
  const wrap = document.createElement('div');
  wrap.className = 'paragraph-field';
  wrap.innerHTML = `
    <textarea rows="3">${(value || '').replace(/</g, '&lt;')}</textarea>
    <button type="button" class="danger-btn small">✕</button>
  `;
  wrap.querySelector('button').addEventListener('click', () => wrap.remove());
  loreList.appendChild(wrap);
}

function showStatus(message, isError) {
  const el = document.getElementById('statusMsg');
  el.textContent = message;
  el.className = 'status-msg show' + (isError ? ' error' : '');
  setTimeout(() => { el.className = 'status-msg'; }, 3000);
}

document.getElementById('addNewBtn').addEventListener('click', () => openForm(null));
document.getElementById('addParagraphBtn').addEventListener('click', () => addParagraphField(''));
document.getElementById('cancelBtn').addEventListener('click', () => {
  document.getElementById('formWrap').style.display = 'none';
});

document.getElementById('entityForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = {
    name: document.getElementById('fName').value.trim(),
    category: document.getElementById('fCategory').value,
    region: document.getElementById('fRegion').value.trim(),
    pos_x: document.getElementById('fPosX').value ? parseFloat(document.getElementById('fPosX').value) : null,
    pos_y: document.getElementById('fPosY').value ? parseFloat(document.getElementById('fPosY').value) : null,
    lore: Array.from(document.querySelectorAll('#loreList textarea'))
      .map(t => t.value.trim())
      .filter(t => t.length > 0)
  };

  try {
    let res;
    if (editingId) {
      res = await fetch(`/api/entities/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      payload.id = document.getElementById('fId').value.trim().toLowerCase().replace(/\s+/g, '-');
      res = await fetch('/api/entities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal menyimpan');

    document.getElementById('formWrap').style.display = 'none';
    showStatus('Berhasil disimpan.', false);
    await loadEntities();
  } catch (err) {
    showStatus('Gagal: ' + err.message, true);
  }
});

document.getElementById('deleteBtn').addEventListener('click', async () => {
  if (!editingId) return;
  if (!confirm('Yakin hapus entitas ini? Tindakan ini tidak bisa dibatalkan.')) return;

  try {
    const res = await fetch(`/api/entities/${editingId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Gagal menghapus');
    document.getElementById('formWrap').style.display = 'none';
    showStatus('Berhasil dihapus.', false);
    await loadEntities();
  } catch (err) {
    showStatus('Gagal: ' + err.message, true);
  }
});

initAuthHeader().then(session => {
  if (!session || !session.loggedIn) {
    window.location.href = 'login.html';
    return;
  }
  if (session.role !== 'admin') {
    window.location.href = 'index.html';
    return;
  }
  loadEntities();
});
