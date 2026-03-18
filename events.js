// ===== EVENTS.JS - Zufällige Events =====

const RandomEvents = {
    lastEventTime: 0,
    eventInterval: 30000, // 30-45 seconds
    eventActive: false,
    eventsTriggered: [],

    init() {
        this.lastEventTime = Date.now();
        this.eventInterval = 30000 + Math.random() * 15000;
        this.eventsTriggered = [];
    },

    update(gameRef) {
        if (this.eventActive) return;
        if (Date.now() - this.lastEventTime < this.eventInterval) return;

        this.triggerRandom(gameRef);
        this.lastEventTime = Date.now();
        this.eventInterval = 30000 + Math.random() * 15000;
    },

    triggerRandom(gameRef) {
        const events = [
            { id: 'mama_call', weight: 15 },
            { id: 'police', weight: 12 },
            { id: 'kevin', weight: 15 },
            { id: 'stumble', weight: 12 },
            { id: 'doner', weight: 15 },
            { id: 'musician', weight: 15 },
            { id: 'ex', weight: 8 }
        ];

        // Weight based selection, avoid repeats if possible
        const available = events.filter(e => !this.eventsTriggered.includes(e.id));
        const pool = available.length > 0 ? available : events;

        const totalWeight = pool.reduce((s, e) => s + e.weight, 0);
        let r = Math.random() * totalWeight;
        let chosen = pool[0];
        for (const e of pool) {
            r -= e.weight;
            if (r <= 0) { chosen = e; break; }
        }

        this.eventsTriggered.push(chosen.id);
        this.eventActive = true;
        this['event_' + chosen.id](gameRef);
    },

    // Event 1: Mama ruft an
    event_mama_call(gameRef) {
        const phoneOverlay = document.getElementById('phone-overlay');
        const phoneText = document.getElementById('phone-text');
        const phoneChoices = document.getElementById('phone-choices');

        phoneOverlay.classList.add('active');
        gameRef.paused = true;

        phoneText.textContent = '"Mace, Schatz? Wo bist du? Es ist 3 Uhr morgens!"';
        phoneChoices.innerHTML = '';

        const options = [
            {
                text: 'A) "Bei... bei einem Freund, Mama!"',
                effects: { embarrassment: 1 },
                response: '"Welcher Freund? Der Kevin? Der ist ein schlechter Einfluss! Komm sofort heim!"',
                achievement: null
            },
            {
                text: 'B) "In der Bibliothek! Die hat... 24h offen!"',
                effects: { embarrassment: 2, charm: -1 },
                response: '"Die Bibliothek?! Um 3 Uhr morgens?! Mace, ich bin nicht blöd! Warte... bist du auf der Linzer Straße?!"',
                achievement: 'Worst Liar Award'
            },
            {
                text: 'C) Auflegen',
                effects: { selfRespect: -1, desperation: 1 },
                response: null,
                achievement: null
            }
        ];

        options.forEach((opt, i) => {
            const btn = document.createElement('div');
            btn.className = 'dialog-choice';
            btn.textContent = opt.text;
            btn.addEventListener('click', () => {
                Object.entries(opt.effects).forEach(([stat, val]) => {
                    PlayerStats.modify(stat, val);
                });
                gameRef.updateHUD();

                if (opt.response) {
                    phoneText.textContent = opt.response;
                    phoneChoices.innerHTML = '';
                    const closeBtn = document.createElement('div');
                    closeBtn.className = 'dialog-choice';
                    closeBtn.textContent = '*Legt schnell auf*';
                    closeBtn.addEventListener('click', () => {
                        phoneOverlay.classList.remove('active');
                        gameRef.paused = false;
                        this.eventActive = false;
                        if (opt.achievement) gameRef.showAchievement(opt.achievement);
                    });
                    phoneChoices.appendChild(closeBtn);
                } else {
                    phoneOverlay.classList.remove('active');
                    gameRef.paused = false;
                    this.eventActive = false;
                }
            });
            phoneChoices.appendChild(btn);
        });
    },

    // Event 2: Polizeistreife - QTE
    event_police(gameRef) {
        gameRef.startQTE(
            'POLIZEI!',
            'Tu natürlich! Drücke die Tasten!',
            ['A', 'S', 'D', 'F'],
            4000,
            (success) => {
                this.eventActive = false;
                if (success) {
                    gameRef.showAchievement('Smooth Criminal');
                    PlayerStats.modify('charm', 1);
                } else {
                    PlayerStats.modify('embarrassment', 3);
                    PlayerStats.modify('selfRespect', -1);
                    Renderer.shake();
                    gameRef.showFloatingText('Die Polizei schaut dich komisch an...');
                }
                gameRef.updateHUD();
            }
        );
    },

    // Event 3: Betrunkener Kevin
    event_kevin(gameRef) {
        gameRef.showDialog(
            'Betrunkener Kevin',
            '"MAAACE! BRUDER! Was machst du hier?! Suchst du NUTTEN?! HAHAHA!" *brüllt so laut, dass die halbe Straße schaut*',
            [
                {
                    text: 'A) "KEVIN, HALT DIE FRESSE!"',
                    effect: { embarrassment: 3, desperation: 1 },
                    callback: () => {
                        gameRef.showDialog(
                            'Betrunkener Kevin',
                            '"HAHAHA ER SUCHT NUTTEN! MACE SUCHT NUTTEN AUF DER LINZER STRASSE!" *fällt in einen Busch*',
                            [{ text: '*Will sterben*', effect: { embarrassment: 2, selfRespect: -2 }, callback: () => {
                                this.eventActive = false;
                                Renderer.shake();
                                gameRef.showAchievement('Social Death');
                            }}]
                        );
                    }
                },
                {
                    text: 'B) "Kevin, ich spaziere nur..."',
                    effect: { embarrassment: 2 },
                    callback: () => {
                        gameRef.showDialog(
                            'Betrunkener Kevin',
                            '"SPAZIEREN! Um 3 Uhr! Auf der LINZER STRASSE! *wink wink* Sag ich keinem, Bruder! HAHAHA!"',
                            [{ text: 'Schnell weggehen', effect: { embarrassment: 1 }, callback: () => { this.eventActive = false; } }]
                        );
                    }
                },
                {
                    text: 'C) *Ignorieren und schnell weglaufen*',
                    effect: { embarrassment: 1 },
                    callback: () => {
                        this.eventActive = false;
                    }
                }
            ]
        );
    },

    // Event 4: Stolpern - Geld aufsammeln Mini-Game
    event_stumble(gameRef) {
        Renderer.shake();
        const lost = Math.min(PlayerStats.money, 20 + Math.floor(Math.random() * 20));
        PlayerStats.addMoney(-lost);
        gameRef.updateHUD();

        gameRef.showFloatingText('*STOLPER* Geld fällt raus!');

        setTimeout(() => {
            gameRef.startMoneyPickup(lost, (recovered) => {
                PlayerStats.addMoney(recovered);
                gameRef.updateHUD();
                this.eventActive = false;
                if (recovered < lost / 2) {
                    gameRef.showAchievement('Butterfingers');
                }
            });
        }, 800);
    },

    // Event 5: Döner-Stand
    event_doner(gameRef) {
        gameRef.showDialog(
            'Döner-Mann Ali',
            '"Heeey mein Freund! Döner? Bester Döner in Wien! Um die Uhrzeit, du brauchst das! 5 Euro, mit allem!"',
            [
                {
                    text: 'A) "Ja bitte, mit scharf!" (5€)',
                    effect: { desperation: -3, charm: 1 },
                    requiresMoney: 5,
                    callback: () => {
                        PlayerStats.addMoney(-5);
                        PlayerStats.donerEaten = true;
                        gameRef.updateHUD();
                        gameRef.showDialog(
                            'Döner-Mann Ali',
                            '"So ist gut! Du bist junger Mann, du musst essen! Und... *flüstert* ...die Svetlana steht auf Typen mit Döner-Atem. Nur so als Tipp."',
                            [{ text: '*Isst Döner glücklich*', effect: {}, callback: () => { this.eventActive = false; } }]
                        );
                    }
                },
                {
                    text: 'B) "Nein danke, kein Hunger."',
                    effect: {},
                    callback: () => {
                        gameRef.showDialog(
                            'Döner-Mann Ali',
                            '"Kein Hunger um 3 Uhr morgens auf der Linzer Straße? Mein Freund, du hast ANDERE Probleme als Hunger. Ich urteile nicht. Aber du solltest Döner essen."',
                            [{ text: 'Weggehen', effect: { desperation: 1 }, callback: () => { this.eventActive = false; } }]
                        );
                    }
                }
            ]
        );
    },

    // Event 6: Straßenmusiker
    event_musician(gameRef) {
        gameRef.showDialog(
            'Straßenmusiker mit Akkordeon',
            '*spielt eine melancholische Melodie* "Hey du! Junger Mann! Ein Euro für einen Song? Ich spiel dir was Schönes!"',
            [
                {
                    text: 'A) "Hier, nimm 2€." (2€)',
                    effect: { charm: 2 },
                    requiresMoney: 2,
                    callback: () => {
                        PlayerStats.addMoney(-2);
                        gameRef.updateHUD();
                        gameRef.showDialog(
                            'Straßenmusiker',
                            '*spielt "An der schönen blauen Donau"* "Für den großzügigen jungen Herrn!" *die ganze Straße hört zu, jemand klatscht*',
                            [{ text: '*Verbeugt sich leicht*', effect: { charm: 1 }, callback: () => { this.eventActive = false; } }]
                        );
                    }
                },
                {
                    text: 'B) *Ignorieren und weitergehen*',
                    effect: {},
                    callback: () => {
                        gameRef.showDialog(
                            'Straßenmusiker',
                            '*ändert Melodie* "Oooh da geht er hiiiin, der Geizhals mit dem Geeeel, er sucht die Liebe auf der Straaaaaße, weil er keine kriegt im Leeeeben!" *alle lachen*',
                            [{
                                text: '*Will im Boden versinken*',
                                effect: { embarrassment: 2, selfRespect: -1 },
                                callback: () => {
                                    this.eventActive = false;
                                    gameRef.showAchievement('Hit Single');
                                    Renderer.shake();
                                }
                            }]
                        );
                    }
                }
            ]
        );
    },

    // Event 7: Ex-Freundin
    event_ex(gameRef) {
        Renderer.shake();
        gameRef.showDialog(
            '???',
            '"MACE?! Bist du das?!"  *Eine bekannte Stimme. Oh nein. OH NEIN.*',
            [{
                text: '*Dreht sich langsam um*',
                effect: { embarrassment: 3 },
                callback: () => {
                    gameRef.showDialog(
                        'Ex-Freundin Sarah (mit neuem Freund Maximilian)',
                        '"Mace?! Was machst du um die Uhrzeit auf der Linzer Straße?!" Maximilian: *ist 1,90m groß, Medizinstudent, hat einen Porsche* "Kennen wir den?"',
                        [
                            {
                                text: 'A) "Ich... jogge?"',
                                effect: { embarrassment: 3, selfRespect: -2 },
                                callback: () => {
                                    gameRef.showDialog(
                                        'Ex-Freundin Sarah',
                                        '"In Jeans und Goldkette? Mace, du... *schaut Maximilian an* ...lass uns gehen, Schatz. *flüstert* Der Arme."',
                                        [{ text: '*Seele verlässt den Körper*', effect: { embarrassment: 2, selfRespect: -3, desperation: 3 }, callback: () => {
                                            this.eventActive = false;
                                            gameRef.showAchievement('Maximum Peinlichkeit');
                                        }}]
                                    );
                                }
                            },
                            {
                                text: 'B) "Hallo Sarah. Schönen Abend noch."',
                                effect: { selfRespect: 1, embarrassment: 2 },
                                callback: () => {
                                    gameRef.showDialog(
                                        'Ex-Freundin Sarah',
                                        '"Oh... okay. Das war... souverän? Bye, Mace." Maximilian: "Wer war das?" Sarah: "Niemand, Schatz."',
                                        [{ text: '*Stirbt innerlich, aber mit Würde*', effect: { embarrassment: 1 }, callback: () => { this.eventActive = false; } }]
                                    );
                                }
                            }
                        ]
                    );
                }
            }]
        );
    }
};
