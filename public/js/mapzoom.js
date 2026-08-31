/* ============================================================
   mapzoom.js
   -------------------------------------------------------------
   Mengaktifkan zoom (scroll mouse / pinch) dan pan (drag)
   pada peta, memakai library Panzoom (di-load via CDN).
============================================================ */

function initMapZoom() {
  const elem = document.getElementById('mapFrame');
  const stage = document.getElementById('mapStage');
  const parent = elem.parentElement;
  const isMobile = window.matchMedia('(max-width: 780px)').matches;

  // Frame menggunakan mode cover sehingga pada viewport yang rasio-nya
  // berbeda, sebagian peta melampaui viewport. Mulai dari tengah agar area
  // yang tersisa dapat dijelajahi ke kiri maupun kanan.
  const startX = Math.min(0, (parent.clientWidth - elem.offsetWidth) / 2);
  const startY = Math.min(0, (parent.clientHeight - elem.offsetHeight) / 2);

  const panzoom = Panzoom(elem, {
    // Mulai dari ukuran peta yang sudah dipaskan oleh fitMapFrame().
    // minScale 4 pada layar kecil membuat peta langsung terpotong 4x.
    maxScale: 6,
    minScale: 1,
    startX,
    startY,
    // Tangkap gesture pada seluruh viewport peta, bukan hanya pada frame.
    // Ini membuat drag horizontal konsisten pada layar sentuh.
    canvas: true,
    // Desktop memakai drag bawaan. Pada mobile, drag ditangani di bawah
    // agar pergerakan sentuh tetap lancar namun tidak dapat melewati batas.
    disablePan: isMobile,
    contain: 'outside',
    step: 0.3,
    excludeClass: 'zoom-controls'
  });

  stage.addEventListener('wheel', panzoom.zoomWithWheel);

  document.getElementById('zoomIn').addEventListener('click', (e) => {
    e.stopPropagation();
    panzoom.zoomIn();
  });
  document.getElementById('zoomOut').addEventListener('click', (e) => {
    e.stopPropagation();
    panzoom.zoomOut();
  });
  document.getElementById('zoomReset').addEventListener('click', (e) => {
    e.stopPropagation();
    panzoom.reset();
  });

  if (isMobile) {
    let drag = null;

    parent.addEventListener('pointerdown', (event) => {
      drag = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        pan: panzoom.getPan()
      };
      parent.setPointerCapture(event.pointerId);
    });

    parent.addEventListener('pointermove', (event) => {
      if (!drag || event.pointerId !== drag.id) return;
      const scale = panzoom.getScale();
      panzoom.pan(
        drag.pan.x + (event.clientX - drag.x) / scale,
        drag.pan.y + (event.clientY - drag.y) / scale,
        { animate: false, force: true }
      );
    });

    const endDrag = (event) => {
      if (drag && event.pointerId === drag.id) drag = null;
    };
    parent.addEventListener('pointerup', endDrag);
    parent.addEventListener('pointercancel', endDrag);
  }
}
