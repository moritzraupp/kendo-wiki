(function () {
  const NAV_ITEMS = [
    { id: 'home', href: 'index.html', i18n: 'nav.overview', label: 'Übersicht' },
    { id: 'waza', href: 'waza-hierarchy.html', i18n: 'nav.wazaHierarchy', label: 'Waza Stammbaum' }
  ];

  const activePage = document.body.dataset.page || 'home';

  const navEl = document.getElementById('site-nav');
  if (navEl) {
    const linksHtml = NAV_ITEMS.map((item) => {
      const activeClass = item.id === activePage ? ' class="active"' : '';
      return `<a href="${item.href}"${activeClass} data-i18n="${item.i18n}">${item.label}</a>`;
    }).join('');

    navEl.innerHTML = `
      <a href="index.html" class="brand">Kendō Lookup <span>剣道事典</span></a>
      <div class="nav-right">
        <div class="links">${linksHtml}</div>
        <div class="lang-switcher" role="group" data-i18n-aria="nav.langAria" aria-label="Sprachauswahl">
          <button type="button" class="lang-btn" data-lang="de" aria-pressed="true">DE</button>
          <button type="button" class="lang-btn" data-lang="en" aria-pressed="false">EN</button>
        </div>
      </div>
    `;
  }

  const footerEl = document.getElementById('site-footer');
  if (footerEl) {
    const backLink = activePage !== 'home'
      ? ` • <a href="index.html" data-i18n="footer.backToOverview">Zur Übersicht</a>`
      : '';
    footerEl.innerHTML = `
      <span data-i18n="footer.tagline">Kendō Lookup • Nachschlagewerk für Techniken & Grundlagen</span>${backLink}
    `;
  }
})();
