# Balance Check

Analysiere alle Stat-Modifikatoren, Preise und Endings auf Balance-Probleme.

## Schritte

1. **Daten einlesen**: Lies `characters.js`, `events.js` und `game.js` vollständig.

2. **Geld-Analyse**:
   - Startgeld: 150€
   - Liste alle Ausgaben (NPC-Preise, Slot-Einsätze, Döner, Musiker etc.)
   - Liste alle Einnahmen (Slot-Gewinne, aufgesammeltes Geld etc.)
   - Prüfe: Kann man realistisch bankrott gehen (`end_bankrupt`)? Wie viele Ausgaben braucht es?
   - Prüfe: Ist das Startgeld zu viel/wenig für die teuersten NPCs (Zwillinge 200€)?

3. **Stat-Analyse** (charm, desperation, embarrassment, selfRespect je 0–10):
   - Summiere alle positiven und negativen Modifikatoren pro Stat über alle Dialoge und Events
   - Markiere Stats die nie auf 10 kommen können (zu wenig positive Quellen)
   - Markiere Stats die nie auf 0 sinken können
   - Prüfe ob `embarrassment >= 5` (Pigeon Facepalm) realistisch erreichbar ist

4. **Ending-Erreichbarkeit**:
   - `end_gentleman`: Svetlana (X=600) + Haggle-Erfolg – früh im Spiel, leicht erreichbar?
   - `end_true_love`: Klaus + `donerEaten` – liegt Döner-Event (Zufall) auf dem Weg?
   - `end_bankrupt`: money <= 0 – wie viele Fehler braucht es?
   - `end_arrested`: Erscheinung X=4200 – muss man fast die ganze Strecke laufen
   - `end_enlightened`: Oma Gertrude X=3000 – weit hinten, realistisch im Timer?
   - `morning_shame`: Timer 480s – wie weit kommt man in 8 Minuten bei Speed 3?
   - Berechne: bei Speed 3 und Weltbreite 5000, wie viel Strecke schafft man in 480s?

5. **Buff-Balance**:
   - `slotMachineLuck`: Pharao-Gewicht 3→9, wie stark ist das? Erwartungswert pro Spin vorher/nachher?
   - `speedBoost`: 30s bei Speed 6 statt 3 – wie viele Extra-Units?

6. **Bericht ausgeben**:
   Strukturierter Bericht mit:
   - ✅ Was gut balanced ist
   - ⚠️ Potenzielle Probleme
   - 🔴 Kritische Imbalancen mit konkreten Zahlenwerten
   - Empfehlungen für Anpassungen

Keine Code-Änderungen vornehmen – nur Analyse und Bericht.
