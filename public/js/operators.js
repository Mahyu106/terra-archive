/* ============================================================
   operators.js
   -------------------------------------------------------------
   Mengelola daftar operator: tambah, edit, hapus.
   Ada 2 field gambar terpisah: thumbnail (panel lore) dan
   detail (modal), supaya bisa beda sumber/ukuran gambar.
============================================================ */

let operators = [];
let entitiesList = [];
let editingId = null;

async function loadEntitiesForDropdown() {
  const res = await fetch('/api/entities');
  entitiesList = await res.json();

  const select = document.getElementById('fEntity');
  select.innerHTML = entitiesList
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(e => `<option value="${e.id}">${e.name}</option>`)
    .join('');
}

async function loadOperators() {
  try {
    const res = await fetch('/api/operators');
    operators = await res.json();
    renderList();
  } catch (err) {
    document.getElementById('operatorList').innerHTML =
      `<p class="hint" style="color:var(--danger);">Gagal memuat data: ${err.message}</p>`;
  }
}

function entityName(entityId) {
  const e = entitiesList.find(x => x.id === entityId);
  return e ? e.name : entityId;
}

function renderList() {
  const list = document.getElementById('operatorList');
  if (operators.length === 0) {
    list.innerHTML = '<p class="hint">Belum ada operator yang ditambahkan.</p>';
    return;
  }
  list.innerHTML = '';
  operators.forEach(op => {
    const row = document.createElement('div');
    row.className = 'admin-row';
    row.innerHTML = `
      <span class="admin-row-name">${op.name}</span>
      <span class="admin-row-cat">${entityName(op.entity_id)}</span>
      <button type="button" class="secondary-btn" data-id="${op.id}">EDIT</button>
    `;
    row.querySelector('button').addEventListener('click', () => openForm(op.id));
    list.appendChild(row);
  });
}

function openForm(id) {
  editingId = id;
  document.getElementById('formWrap').style.display = 'block';

  if (id) {
    const op = operators.find(o => o.id === id);
    document.getElementById('formTitle').textContent = 'Edit: ' + op.name;
    document.getElementById('fEntity').value = op.entity_id;
    document.getElementById('fName').value = op.name;
    document.getElementById('fImageUrl').value = op.image_url || '';
    document.getElementById('fDetailImageUrl').value = op.detail_image_url || '';
    document.getElementById('fDescription').value = op.description || '';
    document.getElementById('fConnectionType').value = op.connection_type || '';
    document.getElementById('fConnectionDescription').value = op.connection_description || '';
    document.getElementById('deleteBtn').style.display = 'inline-block';
  } else {
    document.getElementById('formTitle').textContent = 'Tambah Operator Baru';
    document.getElementById('fName').value = '';
    document.getElementById('fImageUrl').value = '';
    document.getElementById('fDetailImageUrl').value = '';
    document.getElementById('fDescription').value = '';
    document.getElementById('fConnectionType').value = '';
    document.getElementById('fConnectionDescription').value = '';
    document.getElementById('deleteBtn').style.display = 'none';
  }

  document.getElementById('formWrap').scrollIntoView({ behavior: 'smooth' });
}

function showStatus(message, isError) {
  const el = document.getElementById('statusMsg');
  el.textContent = message;
  el.className = 'status-msg show' + (isError ? ' error' : '');
  setTimeout(() => { el.className = 'status-msg'; }, 3000);
}

document.getElementById('addNewBtn').addEventListener('click', () => openForm(null));
document.getElementById('cancelBtn').addEventListener('click', () => {
  document.getElementById('formWrap').style.display = 'none';
});

document.getElementById('operatorForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = {
    entity_id: document.getElementById('fEntity').value,
    name: document.getElementById('fName').value.trim(),
    image_url: document.getElementById('fImageUrl').value.trim(),
    detail_image_url: document.getElementById('fDetailImageUrl').value.trim(),
    description: document.getElementById('fDescription').value.trim(),
    connection_type: document.getElementById('fConnectionType').value.trim(),
    connection_description: document.getElementById('fConnectionDescription').value.trim()
  };

  try {
    let res;
    if (editingId) {
      res = await fetch(`/api/operators/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      res = await fetch('/api/operators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal menyimpan');

    document.getElementById('formWrap').style.display = 'none';
    showStatus('Berhasil disimpan.', false);
    await loadOperators();
  } catch (err) {
    showStatus('Gagal: ' + err.message, true);
  }
});

document.getElementById('deleteBtn').addEventListener('click', async () => {
  if (!editingId) return;
  if (!confirm('Yakin hapus operator ini? Tidak bisa dibatalkan.')) return;

  try {
    const res = await fetch(`/api/operators/${editingId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Gagal menghapus');
    document.getElementById('formWrap').style.display = 'none';
    showStatus('Berhasil dihapus.', false);
    await loadOperators();
  } catch (err) {
    showStatus('Gagal: ' + err.message, true);
  }
});

initAuthHeader().then(async session => {
  if (!session || !session.loggedIn) {
    window.location.href = 'login.html';
    return;
  }
  if (session.role !== 'admin') {
    window.location.href = 'index.html';
    return;
  }
  await loadEntitiesForDropdown();
  await loadOperators();
});
