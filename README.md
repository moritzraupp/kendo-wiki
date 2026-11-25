# Kendō Lookup (剣道事典)

Ein strukturiertes, statisches Nachschlagewerk für Kendō-Techniken, Terminologie und Grundlagen – gehostet über GitHub Pages.

## Projektstruktur

- `index.html` – Startseite und Übersicht über alle Themenbereiche
- `waza-hierarchy.html` – Hierarchischer Stammbaum der Shikake- und Ōji-Waza inklusive Kanji-Schreibweisen
- `additional-info.html` – Übersicht über ergänzende Praxis-Infos und Extras (mit Unterseiten wie `warmup-chant.html`)
- `css/` – Gemeinsames Basis-Styling (`base.css`) sowie seitenspezifische Styles (`home.css`, `waza.css`, `additional.css`)
- `js/` – Modulare Logik für Navigation/Footer (`layout.js`), Lokalisierung (`i18n.js`), Waza-Baum (`waza.js`) und Aufwärmruf (`warmup-chant.js`)
- `data/` – JSON-Daten für Techniken (`waza.json`), Aufwärmruf (`warmup-chant.json`) und DE/EN-Übersetzungen (`translations.json`); japanische Begriffe bleiben stets sichtbar

## Lokale Vorschau

Da die JSON-Dateien über `fetch()` geladen werden, sollte die Seite lokal über einen kleinen Webserver geöffnet werden:

```bash
python3 -m http.server 8000
```

Anschließend im Browser `http://localhost:8000` aufrufen.

## GitHub Pages Deployment

1. Repository auf GitHub erstellen (z. B. `kendo-lookup`) und auf **Public** stellen.
2. Alle Dateien aus diesem Verzeichnis in das Root-Verzeichnis des Repositories pushen oder hochladen.
3. Unter **Settings → Pages** den Branch `main` und den Ordner `/ (root)` auswählen und speichern.
