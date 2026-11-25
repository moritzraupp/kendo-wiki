(function () {
  const STORAGE_KEY = 'kendo-lookup-lang';
  const SUPPORTED_LANGS = ['de', 'en'];
  const DEFAULT_LANG = 'de';

  let dictionary = null;
  let currentLang = detectInitialLanguage();

  function detectInitialLanguage() {
    const paramLang = new URLSearchParams(window.location.search).get('lang');
    if (SUPPORTED_LANGS.includes(paramLang)) return paramLang;

    const saved = localStorage.getItem(STORAGE_KEY);
    if (SUPPORTED_LANGS.includes(saved)) return saved;

    const browser = (navigator.language || navigator.userLanguage || '').toLowerCase();
    if (browser.startsWith('en')) return 'en';
    return DEFAULT_LANG;
  }

  function resolveKey(obj, path) {
    if (!obj || !path) return undefined;
    return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
  }

  function t(key, fallback = '') {
    const value = dictionary && resolveKey(dictionary[currentLang], key);
    return typeof value === 'string' ? value : fallback;
  }

  function apply(root = document) {
    if (!dictionary || !dictionary[currentLang]) return;
    const dict = dictionary[currentLang];

    if (root === document) {
      document.documentElement.lang = currentLang;
      document.querySelectorAll('.lang-btn[data-lang]').forEach((btn) => {
        const active = btn.getAttribute('data-lang') === currentLang;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-pressed', String(active));
      });
    }

    root.querySelectorAll('[data-i18n]').forEach((el) => {
      const value = resolveKey(dict, el.getAttribute('data-i18n'));
      if (typeof value === 'string') {
        if (el.tagName === 'TITLE') document.title = value;
        else el.textContent = value;
      }
    });

    root.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const value = resolveKey(dict, el.getAttribute('data-i18n-placeholder'));
      if (typeof value === 'string') el.setAttribute('placeholder', value);
    });

    root.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      const value = resolveKey(dict, el.getAttribute('data-i18n-aria'));
      if (typeof value === 'string') el.setAttribute('aria-label', value);
    });
  }

  function setLang(lang) {
    if (!SUPPORTED_LANGS.includes(lang)) return;
    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
    apply(document);
    window.dispatchEvent(new CustomEvent('i18n:change', { detail: { lang } }));
  }

  document.querySelectorAll('.lang-btn[data-lang]').forEach((btn) => {
    btn.addEventListener('click', () => setLang(btn.getAttribute('data-lang')));
  });

  const ready = fetch('data/translations.json', { cache: 'no-cache' })
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then((json) => {
      dictionary = json;
      apply(document);
    })
    .catch((err) => {
      console.warn('Could not load data/translations.json (serve via HTTP/GitHub Pages for localization):', err);
    });

  window.i18n = {
    getLang: () => currentLang,
    setLang,
    t,
    apply,
    ready
  };
})();
