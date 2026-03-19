# MACE AUF DER LINZER STRASSE — Spieldokumentation für Claude

Dieses File ist das Langzeitgedächtnis für zukünftige Claude-Sessions.
Hier sind alle Features, Mechaniken und Ideen des Spiels dokumentiert.

---

## SPIELÜBERSICHT

Komödiantisches Text-Adventure. Protagonist Mace (18 Jahre) läuft die Linzer Straße (Wien) auf der Suche nach einer Prostituierten entlang. 8 Echtminuten = 3 fiktive Stunden (02:00–05:00 Uhr). Endet entweder durch Timer oder durch eine der 8 Endings.

---

## DATEIEN

| Datei | Inhalt |
|-------|--------|
| `game.js` | Hauptgame-Loop, State-Machine, Input, Dialog-System, Mini-Games |
| `characters.js` | NPCs, Dialoge, `PlayerStats`, Buff-System |
| `events.js` | Zufallsereignisse (7 Events) |
| `renderer.js` | Canvas-Rendering, Sprites, Kamera, Effekte |
| `index.html` | DOM-Struktur, Screens, UI |
| `style.css` | Styling, Touch-Controls, Animationen |

---

## SPIELER-STATS

```
PlayerStats = {
    money: 150,          // Startwert
    charm: 3,            // 0–10
    desperation: 0,      // 0–10
    embarrassment: 0,    // 0–10
    selfRespect: 10,     // 0–10
    inventory: ['Axe Body Spray', 'Kaugummi (abgelaufen)'],
    konamiActive: false,
    donerEaten: false,
    inesAgreed: false,
    chosenNPC: null,
    buffs: {
        slotMachineLuck: false,    // Pajo-Zigaretten-Buff
        speedBoost: false,         // Nach Polizei-QTE
        speedBoostEndTime: 0       // Timestamp
    }
}
```

**Alle Werte werden von `modify()` auf 0–10 geclampt.**

---

## BUFF-SYSTEM

| Buff | Aktivierung | Effekt | Dauer |
|------|-------------|--------|-------|
| `slotMachineLuck` | Pajo-Dialog: ganze Zigarettenschachtel schnorren | 👑-Gewicht im Slot: 3→9 | Permanent |
| `speedBoost` | Polizei-QTE erfolgreich bestanden | Laufgeschwindigkeit 3→6 | 15 Sekunden |

**Buff-HUD**: Zeigt aktive Buffs unten links (`🚬 Pajo's Glück`, `⚡ Speed (Xs)`).

**Buff-Aktivierung**: Buff-Logik immer in der `text()`-Funktion des Dialog-Nodes setzen (NICHT in `callback`), da callbacks auf iOS Safari unzuverlässig sind.

---

## SPIELMECHANIKEN

### Timer
- `totalGameTime = 480` Sekunden (8 Minuten Real-Zeit)
- Fiktive Zeit: 02:00 → 05:00 Uhr (proportional)
- Bei Ablauf: `triggerEnding('morning_shame')`

### Bewegung
- Geschwindigkeit: 3 (normal), 6 (Speed-Buff)
- Sprung: Power 12, Gravity 0.6
- Weltbreite: 5000 Units
- Spieler startet bei X=300

### Kamera
- Smooth-Lerp (Faktor 0.08) zur Spieler-Position
- Clamp auf Weltgrenzen

### Interaktion
- Taste E / Interact-Button
- Range: `Math.abs(playerX - npc.x) < 60`

---

## NPCS

| NPC | X | Preis | Besonderheit |
|-----|---|-------|--------------|
| Svetlana | 600 | 120€ | Philosophin, Nietzsche, Haggle → end_gentleman |
| Vedro | 900 | – | Unsichtbarer Hund "Rex", kein Service |
| **Slot-Automat** | 1500 | 5€/Spin | Book of Ra Mini-Game |
| Big Brenda | 1200 | 80€ | Reime, Haggle → end_adventurer |
| Klaus/Klaudia | 1800 | 40€ | Trans-NPC, Döner-Route → end_true_love |
| Zwillinge | 2400 | 150€ | Synchron, Mathe-Trick, Haggle → end_adventurer |
| Lehel Bimre | 2700 | 100€ | Ungar. Banker, Euphemismen, Haggle → end_adventurer |
| Oma Gertrude | 3000 | – | Lebensweisheit, Werther's Original → end_enlightened |
| Pajo der Sultan | 3300 | – | Kettenraucher, VHS, Zigaretten-Buff |
| Ines | 3600 | 9.99€ | Influencerin, Kamera → end_influencer |
| Die Erscheinung | 4200 | 0€ | Polizei-Falle! → end_arrested |

### Dialog-System

Jeder Dialog-Node: `{ text: string|function, choices: [...] }`

Choice-Objekt:
```js
{
    text: 'Anzeigetext',
    effect: { charm: 1, desperation: -1 },
    next: 'dialog_key',   // null = Dialog schließen
    action: 'end_gentleman',  // Spezial-Aktion
    requiresItem: 'Axe Body Spray',
    requiresMoney: 5,
    // KEIN callback für Buff-Aktivierung – stattdessen in text()-Funktion!
}
```

**Typewriter-Effekt**: 30ms/Zeichen. Klick/Tap überspringt.

---

## PAJO-DIALOG (Zigaretten-Buff-Pfad)

**Pfad 1 (direkt):**
greeting → D) "Kannst du mir eine Zigarette geben?" → response_schnorr → A) "die ganze Schachtel wäre besser" → gift_cigarettes → gift_accepted (Buff gesetzt!)

**Pfad 2 (über Sultan-Route):**
greeting → A) Sultan-Aussage → response_sultan → B) "Eure Majestät" → response_majestaet → "Gibst du mir die ganze Schachtel?" → gift_cigarettes → gift_accepted (Buff gesetzt!)

---

## SLOT-MASCHINE (Book of Ra)

**Position**: X=1500 | **Kosten**: 5€/Spin

| Symbol | Gewicht normal | Gewicht (Pajo-Buff) |
|--------|---------------|---------------------|
| 📖 Buch | 2 | 2 |
| 👑 Pharao | 3 | **9** |
| 🪲 Skarabäus | 4 | 4 |
| A | 8 | 8 |
| K | 8 | 8 |
| Q | 8 | 8 |

**Gewinne**: 📖📖📖=100€, 👑👑👑=50€, 🪲🪲🪲=30€, 3x gleich=20€, 1x📖=30% Chance 2€

---

## MINI-GAMES

### Haggle
- Slider bewegt sich (Geschwindigkeit: `2 + desperation*0.3`)
- Grüne Zone: `Math.max(15, 30 - desperation*2)` % Breite
- Space/Tap wenn Slider in Zone → 20% Rabatt, `haggleSuccess = true`
- 3 Fehlversuche → Preis +10%, Dialog zu "reject"

### QTE (Polizei)
- Tasten: A, S, D, F in Reihenfolge
- Zeitlimit: 4000ms
- Erfolg: charm+1, Speed-Buff 30s
- Scheitern: embarrassment+3, selfRespect-1

### Geld-Aufsammeln (Stolper-Event)
- 5-12 Geldscheine driften random
- 5000ms Zeitlimit
- Klick/Tap zum Aufsammeln

---

## ZUFALLSEREIGNISSE

**Interval**: 30–45 Sekunden

| Event | Gewicht | Inhalt |
|-------|---------|--------|
| mama_call | 15 | Mama ruft an, Entschuldigungen |
| police | 12 | QTE-Event (Polizei) |
| kevin | 15 | Betrunkener Freund schreit |
| stumble | 12 | Geld verlieren → Aufsammel-Minigame |
| doner | 15 | Ali bietet Döner (5€) → `donerEaten = true` |
| musician | 15 | Akkordeon-Spieler (2€ oder Beschämung) |
| ex | 8 | Ex-Freundin Sarah mit Maximilian |

---

## ENDINGS

| ID | Name | Bedingung | Note |
|----|------|-----------|------|
| `end_gentleman` | Der Gentleman | Svetlana + Haggle Erfolg | A+ |
| `end_adventurer` | Der Abenteurer | Brenda/Zwillinge/Lehel/Klaus (ohne Döner) | B |
| `end_true_love` | Die Wahre Liebe | Klaus + `donerEaten = true` | **S-Tier** |
| `end_bankrupt` | Der Bankrotte | money <= 0 | D |
| `end_arrested` | Der Verhaftete | Erscheinung-Falle | F |
| `end_influencer` | Der Influencer | Ines + Satz auf Kamera | C- |
| `morning_shame` | Die Morgenscham | Timer läuft ab | D+ |
| `end_enlightened` | Der Erleuchtete | Oma Gertrude Weisheits-Pfad | A |

**Bankrott hat höchste Priorität** (wird vor anderen Endings gecheckt).

---

## EASTER EGGS & EXTRAS

### Konami Code
- Sequenz: ↑↑↓↓←→←→BA
- Effekt: Frack + Monokel für Mace, charm+3, Achievement "Gentleman Mode Activated! 🎩"
- Verändert alle NPC-Begrüßungen zu gesetzteren Varianten

### Pigeon (Tauben-Begleiter)
- Aktiviert sich nach 4 Minuten Spielzeit (50% der Gesamtzeit)
- Folgt Mace, macht Facepalm wenn embarrassment >= 5
- Achievement: "Tauben-Begleiter erhalten!"

### Graffiti auf der Straße
"PHENO WAS HERE", "Mace war hier", "YOLO", "♥ Wien ♥", "Vermisst: Maces Würde", "Hilfe"

---

## HUD-LAYOUT

**Oben links**: Stats-Boxen (💶 Geld, 😏 Charm, 😰 Verzweiflung, 😳 Peinlichkeit, 🎩 Selbstrespekt)
**Oben rechts**: Fiktive Uhrzeit (rot, glühend)
**Unten links**: Inventar-Leiste
**Unten links (über Inventar)**: Buff-Anzeige (nur wenn Buff aktiv)
**Oben rechts (toast)**: Achievement-Popover (3s, 🏆-Icon)

---

## RENDERER-DETAILS

- Himmel: Nacht→Dämmerung Gradient (RGB 20,5,50 → 120,60,100)
- 100 Sterne mit Parallax (0.1x) und Twinkling
- Gebäude prozedural generiert mit flackernden Fenstern
- Laternen alle 400 Units, goldenes Licht das bei Dämmerung schwächer wird
- Kamera-Lerp 0.08, Screen-Shake 400ms

---

## BEKANNTE TECHNISCHE DETAILS

- `callback` in Dialog-Choices ist auf iOS Safari unzuverlässig → **Buff-Logik immer in `text()`-Funktion** des Ziel-Nodes setzen
- `next: null` in einem Choice schließt den Dialog korrekt via `closeDialog()`
- Slot-Maschine: Gewichte-Array Index 1 = 👑 (Pharao/Krone)
- `PlayerStats.modify()` clampt automatisch auf 0–10
- Speed-Reset nach Buff-Ablauf passiert in `updatePlayer()` jeden Frame

---

## IDEEN FÜR ZUKÜNFTIGE ERWEITERUNGEN

### Weitere Buffs & Items
- **Döner-Buff**: Döner solo kaufen → kurzzeitig +2 Charm ("Du riechst nach Knoblauch – authentisch Wienerisch")
- **Axe-Aura**: Alle 3 Axe-Sprühstöße verbrauchen → sichtbare Charm-Aura
- **Pajo's Feuerzeug**: Als Item in Inventar → neue Dialogpfade bei anderen NPCs
- **Expired Gum Kombo**: Kaugummi + Pajo's Marlboro = improvisierter frischer Atem → neuer Dialogpfad

### Neue NPCs
- **Aldi (der Obdachlose)**: Am Müllcontainer, Wienerische Lebensweisheiten, verkauft Zigaretten
- **Der Taxler**: Für 10€ Shortcut überspringt Bereich der Straße
- **Hansl der Betrunkene**: Torkelt, lässt zufällig Geld fallen – Mini-Game
- **Kebab-Hamid**: Eigenständiger Döner-NPC mit Mini-Game (Beilagen wählen)

### Gameplay-Mechaniken
- **Ruf-System**: Bei einem NPC abblitzen → andere NPCs verlangen 10% mehr
- **Wetter-Zufallsevent**: Plötzlicher Regen → +2 Desperation, NPCs unter Vordächer
- **Pajo's VHS-Quiz**: Patrick-Swayze-Trivia Mini-Game → Bonus-Dialog + Buff bei Erfolg
- **Schwarzmarkt bei Vedro**: Geheime Items kaufen (Parfum etc.) → neue Dialogpfade
- **Handy-Mini-Game**: Mama-Anruf interaktiver gestalten, mehr Konsequenzen

### Narrative Erweiterungen
- **Geheimes Ending "Der Unternehmer"**: Alle nicht-transaktionalen NPCs (Oma, Vedro, Pajo) besucht ohne Geld auszugeben → Mace und Pajo eröffnen Sultan Video gemeinsam
- **Pigeon-Ending**: Wenn Pigeon aktiv und Mace geht nach Hause ohne Ending → Pigeon folgt ihm heim
