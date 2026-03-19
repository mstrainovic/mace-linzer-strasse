// ===== CHARACTERS.JS - NPCs, Dialoge, Spieler-Stats =====

const PlayerStats = {
    money: 150,
    charm: 3,
    desperation: 0,
    embarrassment: 0,
    selfRespect: 10,
    inventory: ['Axe Body Spray', 'Kaugummi (abgelaufen)'],
    konamiActive: false,
    donerEaten: false,
    inesAgreed: false,
    chosenNPC: null,

    reset() {
        this.money = 150;
        this.charm = 3;
        this.desperation = 0;
        this.embarrassment = 0;
        this.selfRespect = 10;
        this.inventory = ['Axe Body Spray', 'Kaugummi (abgelaufen)'];
        this.konamiActive = false;
        this.donerEaten = false;
        this.inesAgreed = false;
        this.chosenNPC = null;
    },

    modify(stat, amount) {
        this[stat] = Math.max(0, Math.min(10, this[stat] + amount));
    },

    addMoney(amount) {
        this.money = Math.max(0, this.money + amount);
    }
};

// NPC positions along the street (world X coordinates)
const NPC_POSITIONS = {
    svetlana: 600,
    vedro: 900,
    brenda: 1200,
    vedro_slot: 1500,
    klaus: 1800,
    twins: 2400,
    lehel: 2700,
    oma: 3000,
    pajo: 3300,
    ines: 3600,
    erscheinung: 4200
};

const NPCs = {
    svetlana: {
        name: 'Svetlana die Philosophin',
        price: 120,
        x: NPC_POSITIONS.svetlana,
        color: '#9b59b6',
        width: 30,
        height: 60,
        interacted: false,
        haggleSuccess: false,
        description: 'Liest Nietzsche unter einer Laterne',
        sprite: 'svetlana',
        dialog: {
            greeting: {
                text: function() { return PlayerStats.konamiActive
                    ? '"Ah, ein Mann von Distinktion. Sagen Sie, kennen Sie die Schriften des Herrn Nietzsche?"'
                    : '"Was willst du, Kind? Ich lese gerade \'Also sprach Zarathustra\'."'; },
                choices: [
                    {
                        text: 'A) "Aehm... Zarathustra? Ist das ein DJ?"',
                        effect: { charm: -1, embarrassment: 1 },
                        next: 'response_dumb'
                    },
                    {
                        text: 'B) "Nietzsche? Gott ist tot und so?"',
                        effect: { charm: 1 },
                        next: 'response_smart'
                    },
                    {
                        text: 'C) *Sprueh Axe Body Spray* "Und, riechst du das?"',
                        effect: { charm: -2, embarrassment: 2, selfRespect: -1 },
                        next: 'response_spray',
                        requiresItem: 'Axe Body Spray'
                    }
                ]
            },
            response_dumb: {
                text: function() { return '"Der Uebermensch wuerde weinen. Du bist das Gegenteil davon. Ein... Untermensch des Geistes."'; },
                choices: [
                    { text: 'A) "Ich bin mehr so der... Mittelmensch?"', effect: { desperation: 1 }, next: 'offer' },
                    { text: 'B) Weggehen', effect: {}, next: null }
                ]
            },
            response_smart: {
                text: function() { return '"Hmm, rudimentaer, aber nicht gaenzlich falsch. Vielleicht steckt in dir doch ein Funken... nein, wahrscheinlich nicht."'; },
                choices: [
                    { text: 'A) "Gib mir eine Chance, ich kann klug sein!"', effect: { desperation: 1 }, next: 'offer' },
                    { text: 'B) "Was kostet denn... die philosophische Erfahrung?"', effect: { charm: 1 }, next: 'offer' }
                ]
            },
            response_spray: {
                text: function() { return '"*hustet* Das ist... *hustet* ...das ist ein olfaktorisches Verbrechen gegen die Menschheit."'; },
                choices: [
                    { text: 'A) "Mehr wo das herkam!" *sprueht nochmal*', effect: { embarrassment: 2, selfRespect: -2 }, next: null },
                    { text: 'B) "Sorry... also, was kostet\'s?"', effect: { desperation: 1 }, next: 'offer' }
                ]
            },
            offer: {
                text: function() { return '"120 Euro. Und du bekommst eine existenzielle Erfahrung, die dein kleines Weltbild fuer immer veraendern wird."'; },
                choices: [
                    { text: 'A) "Deal!" (120 EUR)', effect: {}, next: 'haggle', action: 'haggle' },
                    { text: 'B) "Kann man da feilschen?"', effect: { desperation: 1 }, next: 'haggle', action: 'haggle' },
                    { text: 'C) Weggehen', effect: {}, next: null }
                ]
            },
            accept: {
                text: function() { return '"Dann komm, junger Nihilist. Heute Nacht wirst du erfahren, dass das Nichts nicht nichts ist."'; },
                choices: [
                    { text: '...', effect: {}, next: null, action: 'end_gentleman' }
                ]
            },
            reject: {
                text: function() { return '"Du konntest mich nicht mal beim Feilschen beeindrucken. Wie enttaeuschend."'; },
                choices: [
                    { text: 'Weggehen', effect: { embarrassment: 1 }, next: null }
                ]
            }
        }
    },

    brenda: {
        name: 'Big Brenda',
        price: 80,
        x: NPC_POSITIONS.brenda,
        color: '#e74c3c',
        width: 50,
        height: 55,
        interacted: false,
        haggleSuccess: false,
        description: '3x so breit wie alle anderen',
        sprite: 'brenda',
        dialog: {
            greeting: {
                text: function() { return PlayerStats.konamiActive
                    ? '"Oh ho! Ein feiner Herr bei Nacht, sucht meiner Liebe suesse Pracht!"'
                    : '"Hey Kleiner, komm mal her, ich fress dich nicht... oder doch, haha! Das ist kein Scherz, ich reim\' aus vollem Herz!"'; },
                choices: [
                    { text: 'A) "Du bist... gross."', effect: { embarrassment: 1 }, next: 'response_big' },
                    { text: 'B) "Reimst du immer?"', effect: { charm: 1 }, next: 'response_rhyme' },
                    { text: 'C) Langsam rueckwaerts gehen', effect: { selfRespect: 1 }, next: null }
                ]
            },
            response_big: {
                text: function() { return '"Gross und stark, das ist mein Markenzeichen, Kleiner! Und du bist... niedlich. Wie ein Fingerzeig, nur kleiner!"'; },
                choices: [
                    { text: 'A) "Danke...?"', effect: { desperation: 1 }, next: 'offer' },
                    { text: 'B) Flucht ergreifen', effect: {}, next: null }
                ]
            },
            response_rhyme: {
                text: function() { return '"Immer und fuer alle Zeit, Reime sind mein Festtagskleid! Willst du rein in Brendas Welt? Kostet dich ein bisschen Geld!"'; },
                choices: [
                    { text: 'A) "Okay, was kostet der... Reim-Service?"', effect: {}, next: 'offer' },
                    { text: 'B) "Orange."', effect: { charm: 2, embarrassment: 1 }, next: 'response_orange' }
                ]
            },
            response_orange: {
                text: function() { return '"...Orange? Du... du Ungeheuer! Das reimt sich auf NICHTS! *wird rot* Du hast mich besiegt, und das ist kein Witz!"'; },
                choices: [
                    { text: 'A) *Triumphierend grinsen*', effect: { charm: 2 }, next: 'offer' }
                ]
            },
            offer: {
                text: function() { return '"80 Euro, nimm oder stirb! Nicht wirklich sterben, das ist ein Reim-Betrieb!"'; },
                choices: [
                    { text: 'A) "Deal!" (80 EUR)', effect: {}, next: 'haggle', action: 'haggle' },
                    { text: 'B) Feilschen', effect: {}, next: 'haggle', action: 'haggle' },
                    { text: 'C) Nein danke', effect: {}, next: null }
                ]
            },
            accept: {
                text: function() { return '"Komm mit, mein Held! Heute reimt sich alles auf... Zelt! Ich hab ein Zelt. In der Gasse."'; },
                choices: [
                    { text: '...oh Gott', effect: {}, next: null, action: 'end_adventurer' }
                ]
            },
            reject: {
                text: function() { return '"Du hast versagt, bist abgestuerzt, jetzt wird dein Ego eingekuerzt!"'; },
                choices: [
                    { text: 'Weggehen', effect: { embarrassment: 1 }, next: null }
                ]
            }
        }
    },

    klaus: {
        name: 'Klaus/Klaudia',
        price: 40,
        x: NPC_POSITIONS.klaus,
        color: '#3498db',
        width: 35,
        height: 65,
        interacted: false,
        haggleSuccess: false,
        description: 'Mann mit schiefer Peruecke und Lippenstift',
        sprite: 'klaus',
        dialog: {
            greeting: {
                text: function() { return PlayerStats.konamiActive
                    ? '*raeuspert sich mit tiefer Bassstimme* "Guten Abend, werter Herr. Ich bin... Klaudia."'
                    : '*tiefe Bassstimme* "Hallo Suesser, ich bin Klaudia." *Peruecke rutscht* "Aehm... der Wind."'; },
                choices: [
                    { text: 'A) "Bro, du bist ein Typ."', effect: { selfRespect: -1 }, next: 'response_caught' },
                    { text: 'B) "Hallo Klaudia, schoener Abend."', effect: { charm: 2 }, next: 'response_nice' },
                    { text: 'C) "...die Peruecke sitzt schief."', effect: {}, next: 'response_wig' }
                ]
            },
            response_caught: {
                text: function() { return '"Ja gut, erwischt. Ich bin Klaus. Aber hey, ich bin ehrlich! Und... 40 Euro ist 40 Euro, oder? Willst einen Kaffee? Ich bin eigentlich ziemlich nett."'; },
                choices: [
                    { text: 'A) "Weisst du was, Klaus? Du bist mir sympathisch."', effect: { charm: 2, selfRespect: 1 }, next: 'offer' },
                    { text: 'B) Weggehen', effect: {}, next: null }
                ]
            },
            response_nice: {
                text: function() { return '"Oh! Du bist nett! Die meisten schreien oder lachen. Ich bin... also, offiziell Klaudia, aber... *seufzt* ...ich bin Klaus. Die Miete in Wien ist unbezahlbar."'; },
                choices: [
                    { text: 'A) "Kenn ich. Wien ist brutal."', effect: { charm: 2 }, next: 'response_kind' },
                    { text: 'B) Weggehen', effect: {}, next: null }
                ]
            },
            response_wig: {
                text: function() { return '*richtet Peruecke* "Besser? ...Nein? Hoer zu, ich weiss, ich bin nicht ueberzeugend. Aber ich geb mir Muehe!"'; },
                choices: [
                    { text: 'A) "Die Muehe sieht man!" *luegt*', effect: { charm: 1 }, next: 'offer' },
                    { text: 'B) "Ehrlich gesagt, nein."', effect: { selfRespect: 1 }, next: 'response_honest' }
                ]
            },
            response_kind: {
                text: function() { return '"Du bist der Erste, der normal mit mir redet heute Nacht. Willst du... 40 Euro? Oder wir koennen einfach reden."'; },
                choices: [
                    { text: 'A) "Lass uns einen Doener essen gehen."', effect: { charm: 3, selfRespect: 2 }, next: 'doner', requiresMoney: 5 },
                    { text: 'B) "40 EUR klingt fair."', effect: {}, next: 'offer' }
                ]
            },
            response_honest: {
                text: function() { return '"*seufzt* Ich weiss. Meine Ex hat gesagt, ich seh aus wie eine traurige Wurst in Frauenkleidung. Aber 40 EUR sind 40 EUR!"'; },
                choices: [
                    { text: 'A) "Wir gehen Doener essen. Meine Einladung."', effect: { charm: 3, selfRespect: 2 }, next: 'doner', requiresMoney: 5 },
                    { text: 'B) Weggehen', effect: {}, next: null }
                ]
            },
            offer: {
                text: function() { return '"Also, 40 Euro. Guenstigster Preis auf der ganzen Strasse! Und ich leg noch ein Kompliment gratis drauf."'; },
                choices: [
                    { text: 'A) "Deal!" (40 EUR)', effect: {}, next: 'haggle', action: 'haggle' },
                    { text: 'B) "Lass uns lieber Doener essen."', effect: { charm: 2, selfRespect: 2 }, next: 'doner', requiresMoney: 5 },
                    { text: 'C) Nein danke', effect: {}, next: null }
                ]
            },
            doner: {
                text: function() { return '"Doener? Echt jetzt? *Augen werden feucht* Das hat noch nie jemand... ja. Ja, lass uns Doener essen. Mit extra Sosse?"'; },
                choices: [
                    { text: 'A) "Mit EXTRA extra Sosse."', effect: {}, next: null, action: 'end_true_love' }
                ]
            },
            accept: {
                text: function() { return '"Okay, komm mit. Und keine Sorge, ich bin eigentlich sehr kuschelig. ...War das weird? Das war weird."'; },
                choices: [
                    { text: '...', effect: {}, next: null, action: 'end_true_love_no_doner' }
                ]
            },
            reject: {
                text: function() { return '"Schon okay. Ich bin\'s gewohnt. *richtet Peruecke* Die Nacht ist noch jung... wie du."'; },
                choices: [
                    { text: 'Weggehen', effect: {}, next: null }
                ]
            }
        }
    },

    twins: {
        name: 'Die Zwillinge (Jasmin & Yasmin)',
        price: 200,
        x: NPC_POSITIONS.twins,
        color: '#e91e63',
        width: 55,
        height: 58,
        interacted: false,
        haggleSuccess: false,
        description: 'Zwei identische Gestalten, synchrone Bewegungen',
        sprite: 'twins',
        dialog: {
            greeting: {
                text: function() { return PlayerStats.konamiActive
                    ? '*synchron* "Guten Abend, junger Herr. Wir sind zu Diensten."'
                    : '*synchron, exakt gleiche Stimme* "Hallo." "Hallo." "Willkommen." "Willkommen."'; },
                choices: [
                    { text: 'A) "Okay, das ist gruselig."', effect: { embarrassment: 1 }, next: 'response_creepy' },
                    { text: 'B) "Doppelt haelt besser, was?"', effect: { charm: -1, selfRespect: -1 }, next: 'response_double' },
                    { text: 'C) Langsam weggehen', effect: {}, next: null }
                ]
            },
            response_creepy: {
                text: function() { return '*synchron* "Gruselig?" "Wir sind nicht gruselig." "Du bist gruselig." "18 Jahre alt auf der Linzer Strasse." "DAS ist gruselig."'; },
                choices: [
                    { text: 'A) "...touche."', effect: { selfRespect: -1, desperation: 1 }, next: 'offer' },
                    { text: 'B) Dem kann ich nichts entgegensetzen. *gehe*', effect: {}, next: null }
                ]
            },
            response_double: {
                text: function() { return '*synchron* "Doppelt kostet auch doppelt." "2-fuer-1 Deal!" "Nur 200 Euro!" "Das ist ein Schnaeppchen!" "Pro Person waeren das 100!" "Also sparst du!"'; },
                choices: [
                    { text: 'A) "Moment... 2x100 ist immer noch 200..."', effect: { charm: 1 }, next: 'response_math' },
                    { text: 'B) "Was fuer ein Deal!" (200 EUR)', effect: { selfRespect: -2 }, next: 'offer' }
                ]
            },
            response_math: {
                text: function() { return '*synchron* "..." "..." *fluestern miteinander* "Er kann rechnen." "Unerwartet." "Trotzdem 200." "Nicht verhandelbar."'; },
                choices: [
                    { text: 'A) "Ich hab sowieso nicht genug..."', effect: { desperation: 1 }, next: null },
                    { text: 'B) "200 EUR, alles klar."', effect: {}, next: 'offer' }
                ]
            },
            offer: {
                text: function() { return '"200 Euro." "Zwei zum Preis von..." "...zwei." "Aber synchron!"'; },
                choices: [
                    { text: 'A) "Deal!" (200 EUR)', effect: {}, next: 'haggle', action: 'haggle' },
                    { text: 'B) Feilschen?', effect: { desperation: 1 }, next: 'haggle', action: 'haggle' },
                    { text: 'C) Nope', effect: {}, next: null }
                ]
            },
            accept: {
                text: function() { return '*synchron* "Sehr gut." "Komm mit." "Wir gehen..." "...nach links." "RECHTS!" "Rechts, ja." *streiten fluesternd*'; },
                choices: [
                    { text: '...was habe ich getan', effect: { selfRespect: -3 }, next: null, action: 'end_adventurer' }
                ]
            },
            reject: {
                text: function() { return '*synchron* "Schade." "Sehr schade." "Wir waren so nah." "So nah." *identisches Seufzen*'; },
                choices: [
                    { text: 'Weggehen... schnell', effect: {}, next: null }
                ]
            }
        }
    },

    lehel: {
        name: 'Lehel Bimre (LGT)',
        price: 100,
        x: NPC_POSITIONS.lehel,
        color: '#5dade2',
        width: 28,
        height: 63,
        interacted: false,
        haggleSuccess: false,
        description: 'Ungar im Brioni-Anzug, tippt nervös auf Smartphone',
        sprite: 'lehel',
        dialog: {
            greeting: {
                text: function() { return PlayerStats.konamiActive
                    ? '"Ah! Guten Abend, werter Herr! Lehel Bimre, LGT Private Banking. Ein Mann mit Stil – sprechen wir über Portfolio-Optimierung."'
                    : '"*tippt auf Smartphone* ...Kati, ich hab dir gesagt— *sieht Mace* Oh! Guten Abend! Lehel Bimre, Senior Relationship Manager, LGT Bank. Kann ich Ihnen behilflich sein?"'; },
                choices: [
                    {
                        text: 'A) "Was macht ein Banker um 2 Uhr nachts auf der Linzer Straße?"',
                        effect: { charm: 1 },
                        next: 'response_why'
                    },
                    {
                        text: 'B) "LGT? Die Liechtensteinische Globalbank?"',
                        effect: { charm: 2 },
                        next: 'response_bank'
                    },
                    {
                        text: 'C) "Kein Interesse."',
                        effect: {},
                        next: null
                    }
                ]
            },
            response_why: {
                text: function() { return '"Netzwerkpflege, mein Freund! Private Banking schläft nie. Meine... Portfoliounternehmen sind vorwiegend nachtaktiv. Ich betreue sie persönlich. Full-Service-Banking."'; },
                choices: [
                    { text: 'A) "Portfoliounternehmen? Nachts? Auf der Linzer Straße?"', effect: { charm: 1 }, next: 'response_portfolio' },
                    { text: 'B) "*versteht plötzlich* Oh. OHHH."', effect: { desperation: 1 }, next: 'response_dawns' }
                ]
            },
            response_bank: {
                text: function() { return '"Genau! LGT – seit 1920 der Liechtensteinischen Fürstenfamilie verpflichtet. Wir bieten diskrete Lösungen für... diversifizierte Portfolios. *räuspert sich* Sehr diversifiziert."'; },
                choices: [
                    { text: 'A) "Was meinen Sie mit \'diversifiziert\'?"', effect: {}, next: 'response_portfolio' },
                    { text: 'B) "Sie sehen nicht aus wie ein typischer Banker."', effect: { charm: 1 }, next: 'response_looks' }
                ]
            },
            response_looks: {
                text: function() { return '"Ha! Das sagen alle. Aber ich trage einen Brioni-Anzug, mein Freund! Mein Vater hat gesagt: \'Lehel, in Debrecen war man arm. In Wien trägt man Brioni.\' Er hatte Recht."'; },
                choices: [
                    { text: 'A) "Debrecen? Ungarn?"', effect: { charm: 1 }, next: 'response_hungary' },
                    { text: 'B) "Was machen Sie hier wirklich?"', effect: { selfRespect: 1 }, next: 'response_portfolio' }
                ]
            },
            response_hungary: {
                text: function() { return '"Ja! Schöne Stadt. Ich kam 2008 nach Wien – genau zur Finanzkrise. Perfektes Timing, oder? *lacht nervös* Seitdem... diversifiziere ich. Wie man es muss, wenn man die Miete zahlen will."'; },
                choices: [
                    { text: 'A) "Diversifizieren als Euphemismus für...?"', effect: { charm: 1 }, next: 'response_dawns' }
                ]
            },
            response_portfolio: {
                text: function() { return '"Human Capital Portfolio Management. Hochrentable Assets, alle mit ausgezeichneten Fundamentaldaten. Beziehungsoptimierung, Liquiditätslösungen, und persönliche Dienstleistungen. Alles GDPR-konform. Meistens."'; },
                choices: [
                    { text: 'A) "Das sind Prostituierte, oder?"', effect: { selfRespect: 1 }, next: 'response_busted' },
                    { text: 'B) "Ich bin interessiert."', effect: { desperation: 1 }, next: 'offer' }
                ]
            },
            response_dawns: {
                text: function() { return '"Ich sehe, Sie sind ein junger Mann von Welt. Ja. Meine Portfolio-Unternehmen bieten... Dienstleistungen an. Ich bin der Relationship Manager. Auf Provisionsbasis. Das ist vollkommen legal. In manchen Kantonen."'; },
                choices: [
                    { text: 'A) "\'In manchen Kantonen\'?!"', effect: { desperation: 1 }, next: 'response_legal' },
                    { text: 'B) "Okay, was kostet das?"', effect: { desperation: 2 }, next: 'offer' }
                ]
            },
            response_legal: {
                text: function() { return '"Steuerrechtlich ist das eine Grauzone. Ethisch... ein mittleres Grau. Hören Sie, in Ungarn sagt man: \'Basszameg, Lehel, hör auf zu reden!\' Das sagt meine Mutter. Sie hat Recht."'; },
                choices: [
                    { text: 'A) "Ich mag Ihre Ehrlichkeit."', effect: { charm: 2 }, next: 'offer' },
                    { text: 'B) Weggehen', effect: {}, next: null }
                ]
            },
            response_busted: {
                text: function() { return '"*Handy klingelt* Entschuldigung— *flüstert* Kati! Nicht anrufen wenn ich im Business Development bin! *auflegen* Wo waren wir... \'Prostituierte\' ist ein sehr vulgärer Begriff für mein Portfolio."'; },
                choices: [
                    { text: 'A) "Welchen Begriff bevorzugen Sie?"', effect: { charm: 2 }, next: 'response_term' },
                    { text: 'B) "Was kostet eine... Asset-Akquisition?"', effect: { desperation: 2 }, next: 'offer' }
                ]
            },
            response_term: {
                text: function() { return '"\'Freiberufliche Dienstleisterinnen im Nachtgewerbe mit provisionsbasiertem Vertriebsmanagement\'. Das habe ich meinem Steuerberater erklärt. Er hat geweint und dann die Kanzlei gewechselt."'; },
                choices: [
                    { text: 'A) "Wie viel?"', effect: { desperation: 1 }, next: 'offer' }
                ]
            },
            offer: {
                text: function() { return '"100 Euro. Premium-Portfolio. Starke Fundamentaldaten, ausgezeichnete Track-Record, und – ich zitiere mein eigenes Reporting – \'übertrifft alle KPIs\'."'; },
                choices: [
                    { text: 'A) "Deal!" (100 EUR)', effect: {}, next: 'haggle', action: 'haggle' },
                    { text: 'B) "Kann man feilschen?"', effect: { desperation: 1 }, next: 'haggle', action: 'haggle' },
                    { text: 'C) Nein danke', effect: {}, next: null }
                ]
            },
            accept: {
                text: function() { return '"Ausgezeichnet! Willkommen als neuer Client. *schüttelt Hand sehr fest* In Ungarn schütteln wir fest. Wort ist Wort. Meine Compliance-Abteilung... existiert nicht. Aber mein Wort schon."'; },
                choices: [
                    { text: '...was mache ich hier eigentlich', effect: {}, next: null, action: 'end_adventurer' }
                ]
            },
            reject: {
                text: function() { return '"Sehr bedauerlich. Meine Performance-Zahlen konnten Ihre Due-Diligence nicht überzeugen? *gibt Visitenkarte* Lehel Bimre, LGT. Rufen Sie an wenn Sie liquide sind. Oder einsam. Beides ist okay."'; },
                choices: [
                    { text: 'Weggehen (mit Visitenkarte)', effect: { desperation: 1 }, next: null }
                ]
            }
        }
    },

    oma: {
        name: 'Oma Gertrude',
        price: null,
        x: NPC_POSITIONS.oma,
        color: '#95a5a6',
        width: 30,
        height: 50,
        interacted: false,
        description: 'Aeltere Dame an der Bushaltestelle',
        sprite: 'oma',
        dialog: {
            greeting: {
                text: function() { return PlayerStats.konamiActive
                    ? '"Guten Abend, junger Mann. Sie sehen aus wie ein Gentleman. Aber warum sind Sie hier?"'
                    : '"Oh, Burschi! Was machst du denn um die Uhrzeit hier draussen? Warte, sag nichts. Ich weiss es."'; },
                choices: [
                    { text: 'A) "Ich... warte auf den Bus?"', effect: { embarrassment: 1 }, next: 'response_lie' },
                    { text: 'B) "Oma, bitte nicht urteilen..."', effect: { selfRespect: -1 }, next: 'response_honest' },
                    { text: 'C) "Werther\'s Original?"', effect: { charm: 1 }, next: 'response_candy' }
                ]
            },
            response_lie: {
                text: function() { return '"Burschi, der Bus kommt erst um 5:30. Ich weiss das, weil ICH auf den Bus warte. Du wartest auf was anderes."'; },
                choices: [
                    { text: 'A) "Woher wollen Sie das wissen?"', effect: {}, next: 'wisdom1' },
                    { text: 'B) Weggehen', effect: {}, next: null }
                ]
            },
            response_honest: {
                text: function() { return '"Urteilen? Ich? Burschi, ich hab 73 Jahre gelebt. Ich hab ALLES gesehen. Setz dich her, nimm ein Werther\'s."'; },
                choices: [
                    { text: 'A) *Setzt sich* *Nimmt Werther\'s*', effect: { charm: 1, desperation: -2 }, next: 'wisdom1' }
                ]
            },
            response_candy: {
                text: function() { return '"HA! Wenigstens hast du Prioritaeten! Hier, nimm zwei." *gibt Werther\'s Original*'; },
                choices: [
                    { text: 'A) "Danke, Oma." *setzt sich dazu*', effect: { charm: 1, desperation: -1 }, next: 'wisdom1' }
                ]
            },
            wisdom1: {
                text: function() { return '"Weisst du, mein Herbert - Gott hab ihn selig - der hat mich 1974 im Beisl kennengelernt. Nicht auf der Strasse. Im BEISL. Bei einem Spritzer."'; },
                choices: [
                    { text: 'A) "Was ist ein Beisl?"', effect: {}, next: 'wisdom2' },
                    { text: 'B) "Erzaehl mir mehr von Herbert."', effect: { charm: 1 }, next: 'wisdom2' }
                ]
            },
            wisdom2: {
                text: function() { return '"Herbert hat mir Blumen gebracht. Jeden Freitag. 40 Jahre lang. Nicht einmal hat er... also, was DU hier machst. Weil er Respekt hatte."'; },
                choices: [
                    { text: 'A) *Schluckt schwer* "Das ist... schoen."', effect: { selfRespect: 2, desperation: -3 }, next: 'wisdom3' },
                    { text: 'B) "Aber ich hab keinen Spritzer und kein Beisl..."', effect: { desperation: 1 }, next: 'wisdom3' }
                ]
            },
            wisdom3: {
                text: function() { return '"Burschi, du bist 18. Du hast dein ganzes Leben vor dir. Geh heim, schlaf dich aus, und morgen gehst du in ein Kaffeehaus und redest mit einem echten Maedl."'; },
                choices: [
                    { text: 'A) *Epiphanie* "...Sie haben recht, Oma."', effect: { selfRespect: 4, desperation: -5, embarrassment: -3 }, next: 'ending', action: 'end_enlightened' },
                    { text: 'B) "Aber Oma, YOLO!"', effect: { selfRespect: -3, embarrassment: 2 }, next: 'response_yolo' }
                ]
            },
            response_yolo: {
                text: function() { return '"YOLO? In MEINER Zeit hat man gesagt \'Leck mich am Arsch\' und das hat auch gereicht. Geh schon, du Depp. Aber denk dran was ich gesagt hab!"'; },
                choices: [
                    { text: 'Weggehen (aber innerlich geruehrt)', effect: { selfRespect: 1 }, next: null }
                ]
            },
            ending: {
                text: function() { return '"So ist\'s brav. Hier, noch ein Werther\'s fuer den Heimweg. Und ruf deine Mama an."'; },
                choices: [
                    { text: '*Umarmt Oma Gertrude*', effect: {}, next: null }
                ]
            }
        }
    },

    ines: {
        name: 'Influencer-Ines',
        price: 9.99,
        x: NPC_POSITIONS.ines,
        color: '#ff69b4',
        width: 28,
        height: 62,
        interacted: false,
        description: 'Selfie-Stick in der Hand, Ring-Light dabei',
        sprite: 'ines',
        dialog: {
            greeting: {
                text: function() { return PlayerStats.konamiActive
                    ? '"OMG ein GENTLEMAN-Aesthetic! Das ist SO Content-worthy!"'
                    : '"OMG HIII! *zueckt Handy* Warte, dreh dich ins Licht! Du waerst PERFEKT fuer meinen Content!"'; },
                choices: [
                    { text: 'A) "Content? Was fuer Content?"', effect: {}, next: 'response_content' },
                    { text: 'B) "Ich bin hier nicht fuer Content..."', effect: { embarrassment: 1 }, next: 'response_notcontent' },
                    { text: 'C) Weggehen (sie folgt)', effect: {}, next: 'response_follow' }
                ]
            },
            response_content: {
                text: function() { return '"Also ICH hab einen OnlyFans und einen TikTok und einen Instagram und einen Podcast ueber \'Nachts in Wien\' und du koenntest ein FEATURE sein! Die VIEWS!"'; },
                choices: [
                    { text: 'A) "Auf keinen Fall!"', effect: { selfRespect: 1 }, next: 'response_refuse' },
                    { text: 'B) "Werde ich beruehmt?"', effect: { selfRespect: -2 }, next: 'response_famous' }
                ]
            },
            response_notcontent: {
                text: function() { return '"ALLES ist Content, Schatz! Dein peinlicher Gesichtsausdruck gerade? Content! Dein zu enges Shirt? Content! Deine Goldkette? ...okay, die ist eher Cringe-Content!"'; },
                choices: [
                    { text: 'A) "Meine Kette ist ECHT!" (ist sie nicht)', effect: { embarrassment: 1, selfRespect: -1 }, next: 'offer' },
                    { text: 'B) Weggehen', effect: {}, next: null }
                ]
            },
            response_follow: {
                text: function() { return '*folgt mit Kamera* "WARTE! Das ist so eine Raw-Doku-Vibe! Die Subscriber werden WEINEN! Bitte, mach weiter so verloren!"'; },
                choices: [
                    { text: 'A) "STOPP! Okay, was willst du?"', effect: { desperation: 1 }, next: 'offer' },
                    { text: 'B) *Rennt weg*', effect: { embarrassment: 1 }, next: null }
                ]
            },
            response_refuse: {
                text: function() { return '"Aber WARUM?! Ich hab 347 Follower! Das ist FAST viral! 9,99 EUR pro Monat Abo und du bist DABEI!"'; },
                choices: [
                    { text: 'A) "ICH soll DICH bezahlen?!"', effect: {}, next: 'response_pay' },
                    { text: 'B) "347 Follower ist... nicht viel."', effect: { charm: -1 }, next: 'response_followers' }
                ]
            },
            response_famous: {
                text: function() { return '"BERUEHMT! Ja! Also, bei meinen 347 Followern. Davon sind 200 Bots, aber die anderen 147 sind ECHTE MENSCHEN!"'; },
                choices: [
                    { text: 'A) "Okay... ich mach mit."', effect: { selfRespect: -3 }, next: 'agree' },
                    { text: 'B) "Ich glaube, ich passe."', effect: { selfRespect: 1 }, next: null }
                ]
            },
            response_pay: {
                text: function() { return '"Das ist das BUSINESS MODEL, Schatz! Du zahlst, ich mach Content, du wirst beruehmt, und dann zahlst du mehr! Win-win!"'; },
                choices: [
                    { text: 'A) "Das ergibt keinen Sinn, aber okay." (9,99 EUR)', effect: { selfRespect: -3 }, next: 'agree', requiresMoney: 10 },
                    { text: 'B) "Nein."', effect: { selfRespect: 2 }, next: null }
                ]
            },
            response_followers: {
                text: function() { return '"NICHT VIEL?! *Augen zucken* Das ist eine COMMUNITY! Kevin_2003 kommentiert JEDEN Post! Das ist LOYALITAET!"'; },
                choices: [
                    { text: 'A) "...ist Kevin_2003 dein anderer Account?"', effect: { charm: 2 }, next: 'offer' },
                    { text: 'B) Weggehen', effect: {}, next: null }
                ]
            },
            offer: {
                text: function() { return '"Also, Deal: 9,99 EUR pro Monat und du bist fester Teil meines Contents. Ich filme dich, du stehst da und siehst verloren aus. Easy!"'; },
                choices: [
                    { text: 'A) "Fine, ich mach mit." (9,99 EUR)', effect: { selfRespect: -3 }, next: 'agree', requiresMoney: 10 },
                    { text: 'B) "Nein danke, Ines."', effect: { selfRespect: 1 }, next: null }
                ]
            },
            agree: {
                text: function() { return '"YAAAS! Okay, erste Aufgabe: Steh dort hin und sag \'Ich bin der Linzer Strassen-Prinz\' in die Kamera. Und MEIN das so!"'; },
                choices: [
                    { text: 'A) *Sagt es in die Kamera*', effect: { embarrassment: 3, selfRespect: -2 }, next: null, action: 'end_influencer' }
                ]
            }
        }
    },

    erscheinung: {
        name: 'Die Erscheinung',
        price: 0,
        x: NPC_POSITIONS.erscheinung,
        color: '#f1c40f',
        width: 28,
        height: 64,
        interacted: false,
        description: 'Unnatuerlich perfekt, zu gut um wahr zu sein',
        sprite: 'erscheinung',
        dialog: {
            greeting: {
                text: function() { return PlayerStats.konamiActive
                    ? '"Guten Abend! Sie sehen aus wie ein Mann von exquisitem Geschmack! Und das ist... gratis."'
                    : '"Hey Suesser~ Du siehst aus, als haettest du einen langen Abend hinter dir. Ich kann dir helfen... und es kostet dich NICHTS."'; },
                choices: [
                    { text: 'A) "Gratis? Was ist der Haken?"', effect: { selfRespect: 1 }, next: 'response_suspicious' },
                    { text: 'B) "GRATIS?! JA BITTE!"', effect: { selfRespect: -3, desperation: 3 }, next: 'response_eager' },
                    { text: 'C) "Das ist eindeutig eine Falle."', effect: { selfRespect: 2 }, next: 'response_smart' }
                ]
            },
            response_suspicious: {
                text: function() { return '"Kein Haken! Ich finde dich einfach... suess. Deine Goldkette, dein Gel... alles perfekt. Komm, wir gehen da rueber in die Gasse~"'; },
                choices: [
                    { text: 'A) "Na gut..." *folgt*', effect: { selfRespect: -3 }, next: 'trap' },
                    { text: 'B) "Das klingt nach einer Falle. Tschuess."', effect: { selfRespect: 2 }, next: null }
                ]
            },
            response_eager: {
                text: function() { return '"So enthusiastisch! Ich mag das. Komm, hier entlang~" *geht Richtung dunkle Gasse*'; },
                choices: [
                    { text: 'A) *Folgt wie ein Lamm zur Schlachtbank*', effect: {}, next: 'trap' }
                ]
            },
            response_smart: {
                text: function() { return '"Eine Falle? Ich? Nein! Ich bin einfach... philanthropisch!" *Ohrknopf faellt raus* "Das war... ein Ohring!"'; },
                choices: [
                    { text: 'A) "War das ein Funkgeraet?!"', effect: { selfRespect: 3 }, next: 'busted' },
                    { text: 'B) "Okay, ist mir egal. Ich komme mit."', effect: { selfRespect: -5 }, next: 'trap' }
                ]
            },
            trap: {
                text: function() { return '*Pfeife ertoent* "POLIZEI! STEHEN BLEIBEN!" *6 Polizisten springen aus den Bueschen* "Du bist so unglaublich dumm, Junge."'; },
                choices: [
                    { text: 'A) "...Mama wird mich umbringen."', effect: {}, next: null, action: 'end_arrested' }
                ]
            },
            busted: {
                text: function() { return '*spricht in Aermel* "Einsatz abbrechen, der Verdaechtige ist... zu schlau." *geht genervt weg*'; },
                choices: [
                    { text: '*Fuehlt sich wie ein Genie*', effect: { charm: 2, selfRespect: 3 }, next: null }
                ]
            }
        }
    },

    vedro: {
        name: 'Vedro',
        price: null,
        x: NPC_POSITIONS.vedro,
        color: '#e67e22',
        width: 36,
        height: 60,
        interacted: false,
        haggleSuccess: false,
        description: 'Dicker Typ mit Leine aber ohne Hund',
        sprite: 'vedro',
        dialog: {
            greeting: {
                text: function() { return PlayerStats.konamiActive
                    ? '"Mace! Bruder! Rex hat gerade einen Backflip gemacht! Hast du es gesehen?! ...nein? Egal."'
                    : '"Yo Mace! Komm nicht zu nah, Rex ist heute aggressiv! *zerrt an leerer Leine* RUHIG, REX! Siehst du wie er knurrt?"'; },
                choices: [
                    {
                        text: 'A) "Vedro... wo ist der Hund?"',
                        effect: { charm: 1 },
                        next: 'response_where'
                    },
                    {
                        text: 'B) "Ja, ja, ich sehe ihn! Großer Hund!"',
                        effect: { desperation: 1 },
                        next: 'response_play_along'
                    },
                    {
                        text: 'C) "Du hältst eine leere Leine."',
                        effect: { selfRespect: 1 },
                        next: 'response_empty'
                    }
                ]
            },
            response_where: {
                text: function() { return '"Was meinst du \'wo\'? Er steht direkt— *schaut hin* *lange Pause* ...okay. Mein Tata ist vorhin mit ihm Gassi gegangen. Aber ich hab die Leine noch! Das zählt!"'; },
                choices: [
                    { text: 'A) "Dein Vater geht um 2 Uhr nachts Gassi?"', effect: { charm: 1 }, next: 'response_tata' },
                    { text: 'B) "Warum hast du dann noch die Leine?"', effect: {}, next: 'response_leine' }
                ]
            },
            response_play_along: {
                text: function() { return '"SIEHST DU?! Endlich jemand mit Augen! *streichelt Luft* Braver Rex! Wer ist ein guter Junge? *Stille* Er... er ist heute schüchtern."'; },
                choices: [
                    { text: 'A) "Er ist wirklich... beeindruckend."', effect: { desperation: 1, charm: 1 }, next: 'response_impressive' },
                    { text: 'B) "Vedro. Da ist kein Hund."', effect: { selfRespect: 1 }, next: 'response_empty' }
                ]
            },
            response_empty: {
                text: function() { return '"*schaut auf leere Leine* *schaut auf Mace* *schaut wieder auf Leine* ...Brate, mein Tata hat ihn genommen. Rex IST real. Er wiegt 40 Kilo! Ich habe Fotos! *zeigt Foto von 2019*"'; },
                choices: [
                    { text: 'A) "Das Foto ist 7 Jahre alt."', effect: { charm: 1 }, next: 'response_foto' },
                    { text: 'B) "Schon gut, ich glaube dir."', effect: {}, next: 'response_believe' }
                ]
            },
            response_tata: {
                text: function() { return '"Mein Tata schläft nie, Bruder. Der Mann ist Maschine. Steht auf, nimmt Rex, geht drei Stunden durch Ottakring. Jeden Tag. Seit 2018. Ich... ich schlafe lieber."'; },
                choices: [
                    { text: 'A) "Also gehst du nie selbst Gassi?"', effect: { charm: 1 }, next: 'response_never' },
                    { text: 'B) "Respekt an deinen Tata."', effect: { charm: 1 }, next: 'response_respect' }
                ]
            },
            response_leine: {
                text: function() { return '"Die Leine gibt mir... Autorität. Wenn ich mit Leine gehe, denken die Leute: \'Der hat einen Hund!\' Und dann respektieren sie mich. Außerdem war sie teuer. 35 Euro bei Fressnapf."'; },
                choices: [
                    { text: 'A) "Das ist... traurig und genial gleichzeitig."', effect: { charm: 2 }, next: 'response_genius' },
                    { text: 'B) "Du brauchst dringend ein Hobby."', effect: {}, next: null }
                ]
            },
            response_impressive: {
                text: function() { return '"Er kann auch Tricks! Rex – SITZ! *Stille* ...siehst du? Perfekt. Er ist so gut trainiert, man sieht es nicht mal. Das ist Elite-Level, Bruder."'; },
                choices: [
                    { text: 'A) "Elite-Level unsichtbarer Hund."', effect: { charm: 1 }, next: 'response_genius' }
                ]
            },
            response_foto: {
                text: function() { return '"Er sieht GENAU gleich aus! Hunde altern nicht so wie Menschen, Brate. Das ist wissenschaftlich. Glaube ich. *wischt durch leeres Handy-Album*"'; },
                choices: [
                    { text: 'A) "Vedro... alles okay bei dir?"', effect: { charm: 2 }, next: 'response_okay' }
                ]
            },
            response_believe: {
                text: function() { return '"Danke, Bruder! *umarmt Mace* Rex mag dich auch. Er wedelt gerade mit dem Schwanz! ...vertrau mir."'; },
                choices: [
                    { text: '*wird umarmt und fühlt sich komisch*', effect: { charm: 1, embarrassment: 1 }, next: null }
                ]
            },
            response_never: {
                text: function() { return '"Einmal. 2019. Rex hat einen Chihuahua gejagt und ich bin in einen Mistkübel gefallen. Seitdem ist Tata zuständig. Arbeitsteilung, Bruder."'; },
                choices: [
                    { text: 'A) "Classic Vedro."', effect: { charm: 1 }, next: null }
                ]
            },
            response_respect: {
                text: function() { return '"Ich sags ihm! Er wird sich freuen. Er sagt immer: \'Vedro, du bist nutzlos.\' Aber er meint es liebevoll. Glaube ich."'; },
                choices: [
                    { text: '*klopft Vedro auf die Schulter*', effect: { charm: 1 }, next: null }
                ]
            },
            response_genius: {
                text: function() { return '"GENAU! Endlich versteht mich jemand! Mace, du bist ein wahrer Freund. Nicht wie diese Hater die sagen \'Vedro, wo ist dein Hund\'. DU verstehst den Vibe."'; },
                choices: [
                    { text: '"Immer, Bruder."', effect: { charm: 2 }, next: null }
                ]
            },
            response_okay: {
                text: function() { return '"*seufzt* Weißt du... manchmal vermisse ich Rex wenn Tata mit ihm geht. Dann nehme ich die Leine und... naja. *zuckt Schultern* Ist das weird?"'; },
                choices: [
                    { text: 'A) "Nein. Das ist... auf seine Art süß."', effect: { charm: 2, selfRespect: -1 }, next: null },
                    { text: 'B) "Ja. Sehr."', effect: { selfRespect: 1 }, next: null }
                ]
            }
        }
    },

    pajo: {
        name: 'Pajo der Sultan',
        price: null,
        x: NPC_POSITIONS.pajo,
        color: '#f39c12',
        width: 26,
        height: 62,
        interacted: false,
        haggleSuccess: false,
        description: 'Rauchender Typ mit VHS-Kassetten und goldenem Schmuck',
        sprite: 'pajo',
        dialog: {
            greeting: {
                text: function() { return PlayerStats.konamiActive
                    ? '"*wirft Zigarette weg, zündet sofort neue an* Mace! Der Sultan empfängt dich in seinem Palast! *zeigt auf Bushaltestelle*"'
                    : '"*zieht an Marlboro Light* Mace, Bruder! Der Sultan grüßt! *hustet* Hast du zufällig 3 Euro für die Videothek-Mahngebühr?"'; },
                choices: [
                    {
                        text: 'A) "Sultan? Du bist Pajo aus dem 15. Bezirk."',
                        effect: { charm: 1 },
                        next: 'response_sultan'
                    },
                    {
                        text: 'B) "Welche Filme hast du diesmal nicht zurückgegeben?"',
                        effect: {},
                        next: 'response_filme'
                    },
                    {
                        text: 'C) "Hier, 3 Euro." (3€)',
                        effect: { charm: 2 },
                        next: 'response_pay',
                        requiresMoney: 3
                    },
                    {
                        text: 'D) "Kein Interesse, \'Sultan\'."',
                        effect: {},
                        next: null
                    }
                ]
            },
            response_sultan: {
                text: function() { return '"*bläst Rauch aus* Ignoranz! Meine Oma hat gesagt, wir sind von königlichem Blut! Aus einem Dorf mit 200 Einwohnern in Bosnien. Aber KÖNIGLICH, verstehst du? Der Sultan von Sanski Most!"'; },
                choices: [
                    { text: 'A) "Sanski Most hat keinen Sultan."', effect: { charm: 1 }, next: 'response_sanski' },
                    { text: 'B) "Okay, Eure Majestät..."', effect: { desperation: 1 }, next: 'response_majestaet' }
                ]
            },
            response_filme: {
                text: function() { return '"*zählt VHS-Kassetten* Also: Rocky IV, Rambo III, Terminator 2, und... *flüstert* ...Dirty Dancing. DAS IST FÜR MEINE SCHWESTER! *zündet nervös neue Marlboro an*"'; },
                choices: [
                    { text: 'A) "Dirty Dancing, ja?"', effect: { charm: 2 }, next: 'response_dirty' },
                    { text: 'B) "Die Videothek gibt es seit 2015 nicht mehr."', effect: { selfRespect: 1 }, next: 'response_videothek' }
                ]
            },
            response_pay: {
                text: function() {
                    PlayerStats.addMoney(-3);
                    return '"*Augen leuchten* BRUDER! Der Sultan vergisst das nicht! Du bist ab jetzt Ehrenbürger von... *überlegt* ...meinem Wohnzimmer. Komm mal vorbei, wir schauen Rocky!"';
                },
                choices: [
                    { text: 'A) "Gerne, Pajo."', effect: { charm: 1 }, next: 'response_rocky' },
                    { text: 'B) "Gibst du die Filme jetzt zurück?"', effect: {}, next: 'response_return' }
                ]
            },
            response_sanski: {
                text: function() { return '"NOCH nicht! Aber wenn ich erstmal mein Imperium aufgebaut habe... *zieht an Zigarette* ...eine Videothek-Kette. \'Sultan Video\'. Nur Actionfilme. Und Dirty Dancing. Für meine Schwester."'; },
                choices: [
                    { text: 'A) "Eine Videothek-Kette. Im Jahr 2026."', effect: { charm: 1 }, next: 'response_business' },
                    { text: 'B) "Ich wünsche dir viel Erfolg."', effect: { charm: 1 }, next: null }
                ]
            },
            response_majestaet: {
                text: function() { return '"HA! Endlich Respekt! *richtet imaginäre Krone* Als Sultan verfüge ich: Mahngebühren sind ab sofort ABGESCHAFFT. *Marlboro fällt runter* Scheiße. Das war meine vorletzte."'; },
                choices: [
                    { text: '"Majestätisch."', effect: { charm: 1 }, next: null }
                ]
            },
            response_dirty: {
                text: function() { return '"*wird rot* ICH HAB GESAGT FÜR MEINE SCHWESTER! *Pause* ...okay. Der Film ist gut. Patrick Swayze war ein Ehrenmann. Wie ich. Nur dass ich nicht tanzen kann. Und rauche."'; },
                choices: [
                    { text: 'A) "Nobody puts Pajo in a corner."', effect: { charm: 2 }, next: 'response_nobody' },
                    { text: 'B) "Dein Geheimnis ist sicher."', effect: { charm: 1 }, next: null }
                ]
            },
            response_videothek: {
                text: function() { return '"*lange Stille* *zieht an Zigarette* ...was? *schaut auf VHS-Kassetten* NEIN. Die macht nur Pause! Der Besitzer – Herr Kovac – hat gesagt \'vorübergehend geschlossen\'! Seit 11 Jahren! Das ist vorübergehend!"'; },
                choices: [
                    { text: 'A) "Pajo, die ist weg. Für immer."', effect: { selfRespect: 1 }, next: 'response_gone' },
                    { text: 'B) "Klar, vorübergehend..."', effect: {}, next: null }
                ]
            },
            response_nobody: {
                text: function() { return '"*Träne im Auge* Das... das ist das Schönste was je jemand zu mir gesagt hat. Bruder. *umarmt Mace mit Zigarette in der Hand* Vorsicht, Glut! GLUT!"'; },
                choices: [
                    { text: '*Hemd hat jetzt ein Brandloch*', effect: { charm: 1, embarrassment: 1 }, next: null }
                ]
            },
            response_business: {
                text: function() { return '"Streaming ist nur ein Trend, Brate! Die Leute wollen ANFASSEN! VHS hat Seele! *küsst Rambo-Kassette* Außerdem habe ich 340 VHS zuhause. Das ist Startkapital!"'; },
                choices: [
                    { text: '"Visionär."', effect: { charm: 1 }, next: null }
                ]
            },
            response_gone: {
                text: function() { return '"*Zigarette fällt aus dem Mund* ...aber... meine Mitgliedskarte... *zieht zerknitterte Karte aus der Tasche* GOLD-MITGLIED seit 2012! Das muss doch was wert sein?!"'; },
                choices: [
                    { text: 'A) "Ich bin sicher, es ist sehr wertvoll."', effect: { charm: 2, desperation: 1 }, next: null },
                    { text: 'B) "Es tut mir leid, Pajo."', effect: { charm: 1 }, next: null }
                ]
            },
            response_rocky: {
                text: function() { return '"Echt?! Ich mache Popcorn! Also... Mikrowellen-Popcorn. Und es ist von 2023. Aber das Ablaufdatum ist nur ein Vorschlag! *zündet neue Marlboro an*"'; },
                choices: [
                    { text: '"Klingt perfekt."', effect: { charm: 1 }, next: null }
                ]
            },
            response_return: {
                text: function() { return '"*nervöses Lachen* Zurückgeben? Ja! Natürlich! Morgen! Oder übermorgen. Oder... *zählt an Fingern* ...bald. Der Sultan hat viel zu tun. Regierungsgeschäfte."'; },
                choices: [
                    { text: '"Natürlich."', effect: {}, next: null }
                ]
            }
        }
    }
};

// Helper to get all NPCs as array
function getNPCArray() {
    return Object.entries(NPCs).map(function(entry) { return { key: entry[0], ...entry[1] }; });
}

// Check if NPC is within interaction range
function isNearNPC(playerX, npc) {
    return Math.abs(playerX - npc.x) < 60;
}
