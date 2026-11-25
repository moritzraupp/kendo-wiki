(function () {
  const LAYOUT_STORAGE_KEY = 'kendo-waza-layout';

  let wazaData = null;

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatBranchBadge(catCount, wazaCount) {
    const t = window.i18n ? window.i18n.t : (_, fb) => fb;
    const catUnit = catCount === 1
      ? t('hierarchy.units.categorySingular', 'Kategorie')
      : t('hierarchy.units.categoryPlural', 'Kategorien');
    const wazaUnit = t('hierarchy.units.waza', 'Waza');
    return `${catCount} ${catUnit} • ${wazaCount} ${wazaUnit}`;
  }

  function updateBadges() {
    if (!wazaData) return;
    wazaData.branches.forEach((branch) => {
      const badgeEl = document.querySelector(`#${branch.id} .branch-badge`);
      if (!badgeEl) return;
      const wazaCount = branch.categories.reduce((sum, cat) => sum + cat.waza.length, 0);
      badgeEl.textContent = formatBranchBadge(branch.categories.length, wazaCount);
    });
  }

  function renderTree(data) {
    const pillsEl = document.getElementById('nav-pills');
    const containerEl = document.getElementById('branches-container');
    if (!containerEl) return;

    if (pillsEl) {
      pillsEl.innerHTML = data.branches.map((b) => `
        <a href="#${escapeHtml(b.id)}" class="pill ${escapeHtml(b.id)}-pill">
          ${escapeHtml(b.jp)} ${escapeHtml(b.name)} (${b.categories.length})
        </a>
      `).join('');
    }

    const branchesHtml = data.branches.map((branch) => {
      const wazaCount = branch.categories.reduce((sum, cat) => sum + cat.waza.length, 0);
      const catsHtml = branch.categories.map((cat) => {
        const leavesHtml = cat.waza.map(([name, kanji]) => `
          <div class="leaf-item">
            <span class="leaf-name">${escapeHtml(name)}</span>
            <span class="leaf-kanji">${escapeHtml(kanji)}</span>
          </div>
        `).join('');

        return `
          <div class="sub-item" data-category="${escapeHtml(cat.id)}">
            <div class="sub-card">
              <div class="sub-card-header">
                <div class="sub-card-title">
                  ${escapeHtml(cat.name)}
                  <span class="jp">${escapeHtml(cat.jp)}</span>
                </div>
                <span class="sub-desc-badge" data-i18n="${escapeHtml(cat.descKey)}"></span>
              </div>
              <div class="leaves-grid">${leavesHtml}</div>
            </div>
          </div>
        `;
      }).join('');

      return `
        <section class="branch-section ${escapeHtml(branch.id)}" id="${escapeHtml(branch.id)}">
          <div class="branch-header">
            <div class="branch-title-group">
              ${escapeHtml(branch.name)}
              <span class="jp">${escapeHtml(branch.jp)} – <span data-i18n="${escapeHtml(branch.subtitleKey)}"></span></span>
            </div>
            <span class="branch-badge">${formatBranchBadge(branch.categories.length, wazaCount)}</span>
          </div>
          <div class="sub-tree">${catsHtml}</div>
        </section>
      `;
    }).join('');

    containerEl.innerHTML = `<div class="branch-split-bar"></div>${branchesHtml}`;

    if (window.i18n) {
      window.i18n.apply(containerEl);
    }
    updateBadges();
  }

  function setLayout(mode) {
    const isTwo = mode === 'two';
    document.body.classList.toggle('layout-two-col', isTwo);
    document.body.classList.toggle('layout-single-col', !isTwo);

    const btnSingle = document.getElementById('btnSingleCol');
    const btnTwo = document.getElementById('btnTwoCol');
    if (btnSingle) btnSingle.classList.toggle('active', !isTwo);
    if (btnTwo) btnTwo.classList.toggle('active', isTwo);

    localStorage.setItem(LAYOUT_STORAGE_KEY, isTwo ? 'two' : 'single');
  }

  function filterWaza(query) {
    const cleanQuery = query.trim().toLowerCase();
    const leaves = document.querySelectorAll('.leaf-item');
    const subItems = document.querySelectorAll('.sub-item');
    const emptyEl = document.getElementById('empty-search-state');

    if (!cleanQuery) {
      leaves.forEach((leaf) => leaf.classList.remove('highlighted', 'dimmed'));
      subItems.forEach((item) => item.classList.remove('dimmed'));
      if (emptyEl) emptyEl.classList.remove('visible');
      return;
    }

    let anyMatch = false;
    subItems.forEach((subItem) => {
      const subTitle = subItem.querySelector('.sub-card-title').textContent.toLowerCase();
      const subDesc = subItem.querySelector('.sub-desc-badge').textContent.toLowerCase();
      const catMatches = subTitle.includes(cleanQuery) || subDesc.includes(cleanQuery);

      let subHasMatch = false;
      subItem.querySelectorAll('.leaf-item').forEach((leaf) => {
        const matches = catMatches || leaf.textContent.toLowerCase().includes(cleanQuery);
        leaf.classList.toggle('highlighted', matches);
        leaf.classList.toggle('dimmed', !matches);
        if (matches) subHasMatch = true;
      });

      subItem.classList.toggle('dimmed', !subHasMatch);
      if (subHasMatch) anyMatch = true;
    });

    if (emptyEl) emptyEl.classList.toggle('visible', !anyMatch);
  }

  // Initialize controls
  setLayout(localStorage.getItem(LAYOUT_STORAGE_KEY) === 'two' ? 'two' : 'single');

  document.getElementById('btnSingleCol')?.addEventListener('click', () => setLayout('single'));
  document.getElementById('btnTwoCol')?.addEventListener('click', () => setLayout('two'));
  document.getElementById('wazaSearch')?.addEventListener('input', (e) => filterWaza(e.target.value));

  window.addEventListener('i18n:change', updateBadges);

  const i18nReady = window.i18n ? window.i18n.ready : Promise.resolve();
  Promise.all([
    fetch('data/waza.json', { cache: 'no-cache' }).then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    }),
    i18nReady
  ])
    .then(([data]) => {
      wazaData = data;
      renderTree(data);
    })
    .catch((err) => {
      console.error('Failed to load Waza hierarchy data:', err);
    });
})();
