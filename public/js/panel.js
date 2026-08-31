/* ============================================================
   panel.js
   -------------------------------------------------------------
   Panel dossier utama (lore negara/organisasi). Operator
   ditampilkan sebagai grid foto (thumbnail) berukuran seragam.
   Klik foto -> modal detail terpisah, memakai gambar detail
   sendiri (detail_image_url), fallback ke thumbnail kalau
   gambar detail belum diisi.
============================================================ */

let currentOperators = []; // operator milik entitas yang sedang dibuka di panel

function renderOperators(operators) {
  currentOperators = operators || [];
  if (currentOperators.length === 0) return '';

  return `
    <div class="operators-section">
      <div class="operators-title">OPERATOR TERKAIT</div>
      <div class="operators-grid">
        ${currentOperators.map((op, i) => `
          <button type="button" class="operator-thumb" data-op-index="${i}" title="${op.name}">
            ${op.image_url
              ? `<img src="${op.image_url}" alt="${op.name}">`
              : `<div class="operator-thumb-placeholder"></div>`}
            <span class="operator-thumb-name">${op.name}</span>
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

function openPanel(id) {
  const item = (RHODES_ISLAND && id === RHODES_ISLAND.id)
    ? RHODES_ISLAND
    : DATA.find(d => d.id === id);
  if (!item) return;

  Object.values(TerraApp.nodeEls).forEach(n => n.classList.remove('active'));
  if (TerraApp.nodeEls[id]) TerraApp.nodeEls[id].classList.add('active');

  const panelTagWrap = document.getElementById('panelTagWrap');
  const panelTitle   = document.getElementById('panelTitle');
  const panelRegion  = document.getElementById('panelRegion');
  const panelBody    = document.getElementById('panelBody');
  const panel        = document.getElementById('panel');

  panelTagWrap.innerHTML = `<span class="panel-tag">${CATEGORY_LABEL[item.category]}</span>`;
  panelTitle.textContent = item.name;
  panelRegion.textContent = item.region || '';
  panelBody.innerHTML = `
    <div class="file-line">
      <span>FILE ID: ${item.id.toUpperCase()}</span>
      <span>STATUS: TERBUKA</span>
    </div>
    <div class="lore-text">
      ${item.lore.map(p => `<p>${p}</p>`).join('')}
    </div>
    ${renderOperators(item.operators)}
  `;

  panel.classList.add('open');
}

function closePanel() {
  const panel = document.getElementById('panel');
  panel.classList.remove('open');
  Object.values(TerraApp.nodeEls).forEach(n => n.classList.remove('active'));
}

// ---------- Modal detail operator ----------

function openOperatorModal(op) {
  document.getElementById('operatorModalTitle').textContent = op.name;
  document.getElementById('operatorModalConnType').textContent = op.connection_type || '';
  document.getElementById('operatorModalConnType').style.display = op.connection_type ? 'block' : 'none';

  const imgWrap = document.getElementById('operatorModalImageWrap');
  const detailImg = op.detail_image_url || op.image_url; // fallback kalau gambar detail belum diisi
  imgWrap.innerHTML = detailImg
    ? `<img src="${detailImg}" alt="${op.name}">`
    : `<div class="operator-modal-placeholder"></div>`;

  document.getElementById('operatorModalDesc').innerHTML = op.description
    ? `<p>${op.description}</p>` : '';
  document.getElementById('operatorModalConnDesc').innerHTML = op.connection_description
    ? `<p>${op.connection_description}</p>` : '';

  document.getElementById('operatorModal').classList.add('open');
}

function closeOperatorModal() {
  document.getElementById('operatorModal').classList.remove('open');
}

function initPanel() {
  document.getElementById('panelClose').addEventListener('click', closePanel);

  // Event delegation: thumbnail operator dibuat dinamis, jadi listener-nya
  // dipasang di elemen induk yang selalu ada (panelBody), bukan per-thumbnail.
  document.getElementById('panelBody').addEventListener('click', (e) => {
    const btn = e.target.closest('.operator-thumb');
    if (!btn) return;
    const index = parseInt(btn.dataset.opIndex, 10);
    const op = currentOperators[index];
    if (op) openOperatorModal(op);
  });

  document.getElementById('operatorModalClose').addEventListener('click', closeOperatorModal);
  document.getElementById('operatorModal').addEventListener('click', (e) => {
    if (e.target.id === 'operatorModal') closeOperatorModal();
  });
}
