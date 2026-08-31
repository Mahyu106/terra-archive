/* ============================================================
   map.js
   -------------------------------------------------------------
   Membuat area klik transparan ("hotspot") di atas gambar peta
   datar, sesuai koordinat pos_x/pos_y (dalam persen) dari data.
============================================================ */

function buildNodes() {
  const mapFrame = document.getElementById('mapFrame');

  DATA.forEach(item => {
    const node = document.createElement('div');
    node.className = 'node';
    node.dataset.cat = item.category;
    node.dataset.id = item.id;
    node.style.left = item.pos_x + '%';
    node.style.top = item.pos_y + '%';
    node.title = item.name;

    node.addEventListener('click', () => openPanel(item.id));

    mapFrame.appendChild(node);
    TerraApp.nodeEls[item.id] = node;
  });
}
