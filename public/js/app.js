/* ============================================================
   app.js
   -------------------------------------------------------------
   Titik masuk aplikasi.
============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Didaftarkan lebih dulu, terpisah dari proses ambil data,
  // supaya layar intro tetap hilang walau loadData() gagal/error.
  window.addEventListener('load', () => {
    setTimeout(() => {
      document.getElementById('intro').classList.add('hide');
    }, 1200);
  });

  initApp();
});

async function initApp() {
  await initAuthHeader(); // cukup update tampilan tombol, tidak memaksa redirect

  try {
    await loadData();
  } catch (err) {
    console.error('Gagal mengambil data dari server:', err);
    document.getElementById('countNum').textContent = '0';
    return;
  }

  function fitMapFrame() {
  const center = document.querySelector('.map-center');
  const frame = document.getElementById('mapFrame');
  if (!center || !frame) return;

  const ratio = 2190 / 1240;
  const availW = center.clientWidth;
  const availH = center.clientHeight;

  let w = availW;
  let h = w / ratio;

  if (h < availH) {
    // Pertahankan rasio asli peta sambil menutup seluruh stage.
    h = availH;
    w = h * ratio;
  }

  frame.style.width = Math.round(w) + 'px';
  frame.style.height = Math.round(h) + 'px';
}

window.addEventListener('resize', fitMapFrame);

  buildNodes();
  fitMapFrame();
  initMapZoom();
  initPanel();
  initFilters();
  applyFilters();

  document.getElementById('rhodesBtn').addEventListener('click', () => {
    if (RHODES_ISLAND) openPanel(RHODES_ISLAND.id);
  });
}
