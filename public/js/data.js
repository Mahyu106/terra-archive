/* ============================================================
   data.js
   -------------------------------------------------------------
   Mengambil data lore dari API (/api/entities), yang di
   belakangnya membaca dari database MySQL lewat server.js.
============================================================ */

const CATEGORY_LABEL = {
  Nation: "NEGARA",
  Organization: "ORGANISASI"
};

let DATA = [];
let RHODES_ISLAND = null;

async function loadData() {
  const res = await fetch('/api/entities');
  const all = await res.json();

  // Rhodes Island tidak punya koordinat (pos_x/pos_y kosong di DB) -> dipisah
  RHODES_ISLAND = all.find(item => item.id === 'rhodes-island') || null;
  DATA = all.filter(item => item.id !== 'rhodes-island');
}
