/* ============================================================
   filters.js
   -------------------------------------------------------------
   Menangani filter kategori (chip) dan pencarian teks.
============================================================ */

function applyFilters() {
  const countNum = document.getElementById('countNum');
  const q = TerraApp.searchQuery.trim().toLowerCase();
  let visible = 0;

  DATA.forEach(item => {
    const matchesCat = TerraApp.activeFilter === 'All' || item.category === TerraApp.activeFilter;
    const matchesQuery = !q ||
      item.name.toLowerCase().includes(q) ||
      (item.region || '').toLowerCase().includes(q);

    const show = matchesCat && matchesQuery;
    TerraApp.nodeEls[item.id].classList.toggle('hidden-node', !show);
    if (show) visible++;
  });

  countNum.textContent = visible;
}

function initFilters() {
  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      TerraApp.activeFilter = chip.dataset.filter;
      applyFilters();
    });
  });

  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', () => {
    TerraApp.searchQuery = searchInput.value;
    applyFilters();
  });
}
