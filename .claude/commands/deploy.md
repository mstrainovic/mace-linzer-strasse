# Deploy to GitHub Pages

Deploy das Spiel auf GitHub Pages mit automatischem Cache-Busting.

## Schritte

1. **Cache-Busting**: Füge einen Versions-Query-Parameter (`?v=TIMESTAMP`) zu allen JS/CSS-Imports in `index.html` hinzu, damit iOS Safari immer die neueste Version lädt.

2. **Build-Check**: Prüfe ob alle referenzierten Dateien existieren:
   - `game.js`, `characters.js`, `events.js`, `renderer.js`, `style.css`
   - Melde fehlende Dateien als Fehler und stoppe.

3. **Git-Status prüfen**: Zeige welche Dateien geändert wurden (`git status`).

4. **Commit**: Stage alle geänderten Dateien und erstelle einen Commit mit der Message:
   `deploy: v{TIMESTAMP} – Cache-Busting Update`

5. **Push zu gh-pages**:
   - Prüfe ob ein `gh-pages` Branch existiert (lokal oder remote).
   - Wenn nicht: erstelle ihn mit `git subtree push --prefix . origin gh-pages` ODER nutze den aktuellen Branch falls GitHub Pages darauf konfiguriert ist.
   - Push mit `git push origin gh-pages` (oder den konfigurierten Branch).

6. **Erfolgsmeldung**: Zeige die GitHub Pages URL des Projekts an.

## Hinweise
- Wenn `$ARGUMENTS` angegeben sind, nutze sie als Commit-Message-Suffix.
- Falls kein GitHub Remote konfiguriert ist, informiere den User und stoppe.
- Revert den Cache-Busting-Timestamp nach dem Push NICHT – der Timestamp soll im Code bleiben.
