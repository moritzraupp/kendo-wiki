# AGENTS.md – Kendō Lookup (剣道事典)

Guidance for AI coding agents working in this repository. Keep the codebase lightweight, static (GitHub Pages compatible, no build step), modular, and consistent across all pages.

---

## 1. Project Overview & Architecture

```
kendo-wiki/
├── index.html              # Landing page / topic overview (data-page="home")
├── waza-hierarchy.html     # Vertical Waza hierarchy tree (data-page="waza")
├── css/
│   ├── base.css            # Shared theme tokens, reset, navbar, lang switcher, footer, print base
│   ├── home.css            # Home page hero & card grid styles
│   └── waza.css            # Vertical tree, branch color tokens, search & print styles
├── js/
│   ├── layout.js           # Injects shared #site-nav and #site-footer across pages
│   ├── i18n.js             # Loads data/translations.json, applies DE/EN translations, emits i18n:change
│   └── waza.js             # Renders Waza tree from data/waza.json, layout toggle, search filter
├── data/
│   ├── translations.json   # Single source of truth for DE and EN UI/content strings
│   └── waza.json           # Waza taxonomy (branches, categories, [romaji, kanji] pairs)
└── README.md
```

- **Zero build step / pure static assets**: Plain HTML, CSS, ES6+ browser JS, and JSON.
- **Local testing**: Because `data/*.json` files are loaded via `fetch()`, preview locally with a static HTTP server (not `file://`):
  ```bash
  python3 -m http.server 8000
  ```

---

## 2. Core Rules (Non-Negotiable)

### A. Localization (`de` & `en`)
- **Supported UI languages**: German (`de`, default) and English (`en`), configured in `js/i18n.js` (`SUPPORTED_LANGS = ['de', 'en']`).
- **No hardcoded prose in HTML/JS**: Every visible UI string (page titles, nav links, headings, descriptions, button labels, placeholders, aria-labels, empty states, footer text) must have a key in `data/translations.json` under both `"de"` and `"en"`.
- **Key parity**: `"de"` and `"en"` in `data/translations.json` must always contain identical key structures.
- **Binding attributes**:
  - `data-i18n="dot.key"` for element `textContent` and `<title>`
  - `data-i18n-placeholder="dot.key"` for input placeholders
  - `data-i18n-aria="dot.key"` for `aria-label` attributes
- **Dynamic content**: When JS renders DOM dynamically (like `js/waza.js`), await `window.i18n.ready`, attach `data-i18n` attributes, call `window.i18n.apply(container)`, and listen to `i18n:change` if computed strings (e.g., counts/plurals) need updating.
- **Fallback text in HTML**: Keep German fallback text inside static HTML elements so pages remain meaningful before JS executes.

### B. Japanese Terminology Always Visible
- **Japanese names, romaji, and kanji must ALWAYS remain visible** alongside whichever language (`de` or `en`) is selected.
- Never replace Japanese terms or kanji with translations; keep them in addition to the localized German/English labels.
- **Pattern for mixed text**: Keep permanent Japanese/romaji text outside the `data-i18n` span so `i18n.js` only swaps the German/English portion:
  ```html
  <span class="card-tag"><span data-i18n="index.cards.waza.tag">Techniken</span> • 技</span>
  <h2>Ashi-sabaki (<span data-i18n="index.cards.ashisabaki.sub">Fußarbeit</span>)</h2>
  ```
- Keep Japanese annotations (e.g., `剣道事典`, `仕掛け技`, `応じ技`, `(表・裏)`, `飛び込み面`) permanently in HTML or `data/*.json`, not duplicated inside `data/translations.json`.

### C. Visual Style & Layout Consistency
- **Match the existing dark slate & teal theme** defined in `css/base.css`:
  - Background `--bg`: `#0f172a`
  - Surfaces `--card-bg`: `#1e293b`, `--card-hover`: `#273549`
  - Borders `--border`: `#334155`, connector lines `--line-color`: `#475569`
  - Accent `--accent`: `#14b8a6` (`--accent-hover`: `#0d9488`)
  - Text `--text-main`: `#f8fafc`, `--text-muted`: `#94a3b8`
- **Branch color tokens** (in `css/waza.css`):
  - Root: teal (`#0f766e` / `#14b8a6`)
  - Shikake-Waza: blue (`#1d4ed8` / `#60a5fa`)
  - Ōji-Waza: red (`#b91c1c` / `#f87171`)
- **Responsive & Vertical-First**: Layouts must work cleanly on desktop and mobile (`@media (max-width: 640px)`) without horizontal page overflow. Hierarchy trees must flow vertically rather than expanding across wide horizontal rows.
- **Print friendly**: Maintain `@media print` rules with light backgrounds, dark text, and `page-break-inside: avoid` on cards.

---

## 3. Code Organization & File Length Guidelines

- **Keep files concise and modular**: Avoid monolithic HTML files with inline `<style>` or `<script>` blocks.
- **Reuse shared layout**: Every HTML page should use:
  - `<link rel="stylesheet" href="css/base.css">` + a small page-specific stylesheet if needed.
  - `<nav id="site-nav"></nav>` and `<footer id="site-footer"></footer>` populated by `js/layout.js`.
  - `<body data-page="<page-id>">` matching the page's ID in `NAV_ITEMS` (`js/layout.js`).
  - Script load order at the end of `<body>`: `js/layout.js` → `js/i18n.js` → page-specific JS.
- **Avoid CSS duplication**: Use CSS custom properties (like `--branch-bg`, `--branch-accent`, `--branch-glow` in `css/waza.css`) for themed variants instead of repeating selectors.
- **Data-driven content**: Store structured reference data in `data/*.json` rather than repeating large HTML card blocks.

---

## 4. Expanding the Wiki

### Adding a New Page (e.g., `ashi-sabaki.html` or `reiho.html`)
1. Create the HTML file linking `css/base.css` (and `css/<page>.css` if needed) with `<body data-page="<id>">`, `<nav id="site-nav"></nav>`, `<footer id="site-footer"></footer>`, and `js/layout.js` + `js/i18n.js`.
2. Register the page in `NAV_ITEMS` inside `js/layout.js` and add its nav label under `nav` in `data/translations.json` (`de` and `en`).
3. Enable or add its card in `index.html` and add all page translation keys to `data/translations.json`.
4. Ensure all Japanese terminology and kanji remain visible alongside both `de` and `en`.

### Adding Techniques or Categories to the Waza Hierarchy
1. Add entries to `data/waza.json` under the appropriate branch using `["Romaji-Name", "漢字表記"]`.
2. Add the category description key under `hierarchy.sub` in both `"de"` and `"en"` in `data/translations.json`.
3. Counts in pills and branch badges are calculated automatically by `js/waza.js`.

---

## 5. Verification Before Finishing Changes

- Validate all JSON files (`data/translations.json`, `data/waza.json`) parse cleanly and `"de"`/`"en"` have identical keys.
- Verify every `data-i18n`, `data-i18n-placeholder`, and `data-i18n-aria` key used in HTML/JS/JSON exists in both `"de"` and `"en"`.
- Verify all HTML pages parse cleanly and all referenced `css/` and `js/` files exist.
- Confirm Japanese text/kanji remain visible in both German and English modes.
