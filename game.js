// ===== GAME.JS - Game Loop, State Machine, Input =====

const Game = {
    // State machine
    state: 'title', // title, intro, playing, dialog, minigame, ending
    paused: false,
    canvas: null,

    // Player
    player: {
        x: 300,
        y: 0,
        speed: 3,
        facing: 1,
        isWalking: false,
        walkFrame: 0,
        idleTime: 0
    },

    // Timer
    gameTime: 0,
    totalGameTime: 180, // 3 minutes in seconds
    gameStartTime: Date.now(),
    fictionalHour: 2,
    fictionalMinute: 0,

    // Input
    keys: {},
    konamiBuffer: [],
    konamiCode: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'],

    // Dialog
    currentDialog: null,
    currentNPCKey: null,
    typewriterInterval: null,
    typewriterText: '',
    typewriterIndex: 0,

    // Minigame
    haggleData: null,
    qteData: null,
    moneyData: null,

    // Pigeon
    pigeonActivated: false,

    // Floating text
    floatingTexts: [],

    // Title screen loading
    loadingPhase: 0,
    loadingMessages: [
        'Lade Würde herunter...',
        'Fehler: Datei "Würde" nicht gefunden.',
        'Lade Selbstrespekt...',
        'Warnung: Niedrige Werte erkannt.',
        'Initialisiere Peinlichkeit...',
        'Bereit. Gott steh dir bei.'
    ],

    // ===== INIT =====
    init() {
        this.canvas = document.getElementById('game-canvas');
        Renderer.init(this.canvas);
        this.bindInput();
        this.startTitleScreen();
        this.gameLoop();
    },

    // ===== INPUT =====
    bindInput() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            this.handleKeyPress(e.key, e);
        });
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });

        // Screen tap handlers — always active (keyboard + touch + mouse)
        const titleScreenFn = (e) => {
            if (this.state === 'title') {
                e.preventDefault();
                // Skip remaining loading if still in progress
                this.loadingPhase = this.loadingMessages.length;
                this.startIntro();
            }
        };
        document.addEventListener('touchstart', titleScreenFn, { passive: false });
        document.addEventListener('click', titleScreenFn);

        const introScreenFn = (e) => {
            if (this.state === 'intro') {
                e.preventDefault();
                this.startGame();
            }
        };
        document.addEventListener('touchstart', introScreenFn, { passive: false });
        document.addEventListener('click', introScreenFn);

        this._bindTouchControls();
    },

    // ===== TOUCH HELPERS =====
    _isTouchDevice() {
        return ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    },

    _showMovementControls(visible) {
        if (!this._isTouchDevice()) return;
        const tc = document.getElementById('touch-controls');
        if (tc) tc.style.display = visible ? 'flex' : 'none';
        // Shift inventory bar up when controls are visible
        const inv = document.getElementById('hud-inventory');
        if (inv) inv.classList.toggle('touch-shifted', visible);
    },

    _showHaggleTouchBtn(visible) {
        if (!this._isTouchDevice()) return;
        const btn = document.getElementById('touch-haggle-btn');
        if (btn) btn.style.display = visible ? 'block' : 'none';
    },

    _bindTouchControls() {
        if (!this._isTouchDevice()) return;

        const leftBtn = document.getElementById('touch-left');
        const rightBtn = document.getElementById('touch-right');
        const interactBtn = document.getElementById('touch-interact');
        const haggleBtn = document.getElementById('touch-haggle-btn');

        // Directional buttons: simulate held keys
        const addHoldBtn = (btn, key) => {
            const start = (e) => { e.preventDefault(); this.keys[key] = true; btn.classList.add('pressed'); };
            const end = (e) => { e.preventDefault(); this.keys[key] = false; btn.classList.remove('pressed'); };
            btn.addEventListener('touchstart', start, { passive: false });
            btn.addEventListener('touchend', end, { passive: false });
            btn.addEventListener('touchcancel', end, { passive: false });
            btn.addEventListener('mousedown', start);
            btn.addEventListener('mouseup', end);
            btn.addEventListener('mouseleave', end);
        };
        addHoldBtn(leftBtn, 'ArrowLeft');
        addHoldBtn(rightBtn, 'ArrowRight');

        // Interact button: tap to interact
        const interactFn = (e) => { e.preventDefault(); this.tryInteract(); };
        interactBtn.addEventListener('touchstart', interactFn, { passive: false });
        interactBtn.addEventListener('click', interactFn);

        // Haggle tap button
        const haggleFn = (e) => { e.preventDefault(); this.hagglePress(); };
        haggleBtn.addEventListener('touchstart', haggleFn, { passive: false });
        haggleBtn.addEventListener('click', haggleFn);

        // Update hint texts for touch
        const startPrompt = document.getElementById('start-prompt');
        if (startPrompt) startPrompt.textContent = 'Tippe zum Starten';
        const introSkip = document.querySelector('.intro-skip');
        if (introSkip) introSkip.textContent = 'Tippe zum Überspringen';
        const endRestart = document.querySelector('.end-restart');
        if (endRestart) endRestart.textContent = 'Tippe für Neustart';
    },

    handleKeyPress(key, e) {
        // Ignore key repeats for state transitions
        if (e && e.repeat) return;

        // Konami code check
        this.konamiBuffer.push(key);
        if (this.konamiBuffer.length > 10) this.konamiBuffer.shift();
        if (this.konamiBuffer.join(',') === this.konamiCode.join(',')) {
            this.activateKonami();
        }

        switch (this.state) {
            case 'title':
                if (key === 'Enter') {
                    this.loadingPhase = this.loadingMessages.length;
                    this.startIntro();
                }
                break;
            case 'intro':
                if (key === 'Enter') {
                    this.startGame();
                }
                break;
            case 'playing':
                if (key === 'e' || key === 'E') {
                    this.tryInteract();
                }
                break;
            case 'minigame':
                if (key === ' ') {
                    e.preventDefault();
                    this.hagglePress();
                }
                break;
        }
    },

    // ===== KONAMI =====
    activateKonami() {
        if (PlayerStats.konamiActive) return;
        PlayerStats.konamiActive = true;
        document.body.classList.add('konami-active');
        this.showAchievement('Gentleman Mode Activated! 🎩');
        PlayerStats.modify('charm', 3);
        this.updateHUD();
    },

    // ===== TITLE SCREEN =====
    startTitleScreen() {
        this.state = 'title';
        document.getElementById('title-screen').classList.add('active');
        this.loadingPhase = 0;
        this.advanceLoading();
    },

    advanceLoading() {
        if (this.loadingPhase >= this.loadingMessages.length) {
            const prompt = document.getElementById('start-prompt');
            prompt.textContent = 'Tippe oder ENTER zum Starten';
            prompt.style.display = 'block';
            document.getElementById('fake-loading').style.display = 'none';
            return;
        }

        const fill = document.getElementById('loading-fill');
        const text = document.getElementById('loading-text');
        const progress = ((this.loadingPhase + 1) / this.loadingMessages.length) * 100;

        text.textContent = this.loadingMessages[this.loadingPhase];
        fill.style.width = progress + '%';

        this.loadingPhase++;
        setTimeout(() => this.advanceLoading(), 800 + Math.random() * 400);
    },

    // ===== INTRO =====
    startIntro() {
        this.state = 'intro';
        document.getElementById('title-screen').classList.remove('active');
        document.getElementById('intro-screen').classList.add('active');

        const introLines = [
            'Wien, 02:00 Uhr nachts.',
            '',
            'Mace, 18 Jahre alt, steht am Anfang der Linzer Straße.',
            'In seiner Tasche: 150 Euro, ein abgelaufener Kaugummi',
            'und eine Dose Axe Body Spray.',
            '',
            'Sein Plan: Die beste Prostituierte finden.',
            'Die Realität: Er hat keine Ahnung, was er tut.',
            '',
            'Die Uhr tickt. Um 5 Uhr wird es hell.',
            'Und dann sieht ihn jeder.',
            '',
            '...viel Glück, Mace. Du wirst es brauchen.'
        ];

        const textEl = document.getElementById('intro-text');
        textEl.textContent = '';
        let lineIndex = 0;

        const typeIntro = () => {
            if (this.state !== 'intro') return;
            if (lineIndex < introLines.length) {
                textEl.textContent += introLines[lineIndex] + '\n';
                lineIndex++;
                setTimeout(typeIntro, 400);
            }
        };
        typeIntro();
    },

    // ===== START GAME =====
    startGame() {
        this.state = 'playing';
        document.getElementById('intro-screen').classList.remove('active');
        document.getElementById('hud').classList.add('active');
        this.canvas.style.display = 'block';

        // Ensure canvas is properly sized
        Renderer.resize();

        PlayerStats.reset();
        this.player.x = 300;
        this.player.facing = 1;
        this.player.idleTime = 0;
        this.gameStartTime = Date.now();
        this.gameTime = 0;
        this.pigeonActivated = false;
        Renderer.pigeon.active = false;

        // Reset NPCs
        Object.values(NPCs).forEach(npc => {
            npc.interacted = false;
            npc.haggleSuccess = false;
        });

        RandomEvents.init();
        this.updateHUD();
        this._showMovementControls(true);
    },

    // ===== GAME LOOP =====
    gameLoop() {
        requestAnimationFrame(() => this.gameLoop());

        if (this.state === 'playing' && !this.paused) {
            try {
                this.updatePlayer();
                this.updateTimer();
                this.updatePigeon();
                RandomEvents.update(this);

                Renderer.updateCamera(this.player.x);
                Renderer.render({
                    player: this.player,
                    npcs: NPCs,
                    gameTime: this.gameTime,
                    totalGameTime: this.totalGameTime
                });

                this.renderFloatingTexts();
            } catch (e) {
                const ctx = Renderer.ctx;
                ctx.fillStyle = '#200020';
                ctx.fillRect(0, 0, Renderer.width, Renderer.height);
                ctx.fillStyle = '#ff3366';
                ctx.font = 'bold 24px Courier New';
                ctx.fillText('GAME ERROR', 20, Renderer.height / 2 - 60);
                ctx.font = '16px Courier New';
                ctx.fillStyle = '#ffcc00';
                ctx.fillText('Message: ' + e.message, 20, Renderer.height / 2 - 20);
                ctx.fillStyle = '#aaa';
                const stackLines = (e.stack || '').split('\n');
                for (let i = 0; i < Math.min(5, stackLines.length); i++) {
                    ctx.fillText(stackLines[i].trim(), 20, Renderer.height / 2 + 10 + i * 22);
                }
                console.error('Game loop error:', e);
            }
        } else if (this.state === 'dialog' || this.state === 'minigame') {
            try {
                Renderer.render({
                    player: this.player,
                    npcs: NPCs,
                    gameTime: this.gameTime,
                    totalGameTime: this.totalGameTime
                });
            } catch (e) {
                console.error('Render error:', e);
            }
        }
    },

    // ===== PLAYER UPDATE =====
    updatePlayer() {
        let moving = false;

        if (this.keys['ArrowLeft'] || this.keys['a']) {
            this.player.x -= this.player.speed;
            this.player.facing = -1;
            moving = true;
        }
        if (this.keys['ArrowRight'] || this.keys['d']) {
            this.player.x += this.player.speed;
            this.player.facing = 1;
            moving = true;
        }

        // Bounds
        this.player.x = Math.max(50, Math.min(Renderer.worldWidth - 50, this.player.x));

        this.player.isWalking = moving;
        if (moving) {
            this.player.walkFrame++;
            this.player.idleTime = 0;
        } else {
            this.player.idleTime += 1 / 60;
        }
    },

    // ===== TIMER =====
    updateTimer() {
        this.gameTime = (Date.now() - this.gameStartTime) / 1000;

        // Calculate fictional time (2:00 to 5:00 over 3 real minutes)
        const progress = Math.min(1, this.gameTime / this.totalGameTime);
        const totalFictionalMinutes = 180; // 3 hours = 180 minutes
        const currentMinutes = Math.floor(progress * totalFictionalMinutes);
        this.fictionalHour = 2 + Math.floor(currentMinutes / 60);
        this.fictionalMinute = currentMinutes % 60;

        const timeStr = `${String(this.fictionalHour).padStart(2, '0')}:${String(this.fictionalMinute).padStart(2, '0')}`;
        document.getElementById('hud-time').textContent = timeStr;

        // Time's up
        if (this.gameTime >= this.totalGameTime && this.state === 'playing') {
            this.triggerEnding('morning_shame');
        }
    },

    // ===== PIGEON =====
    updatePigeon() {
        if (!this.pigeonActivated && this.gameTime > this.totalGameTime / 2) {
            this.pigeonActivated = true;
            Renderer.pigeon.active = true;
            Renderer.pigeon.x = this.player.x - 100;
            this.showAchievement('Tauben-Begleiter erhalten!');
        }
    },

    // ===== HUD =====
    updateHUD() {
        document.getElementById('hud-money').textContent = PlayerStats.money + '€';
        document.getElementById('hud-charm').textContent = PlayerStats.charm + '/10';
        document.getElementById('hud-desperation').textContent = PlayerStats.desperation + '/10';
        document.getElementById('hud-embarrassment').textContent = PlayerStats.embarrassment + '/10';
        document.getElementById('hud-selfrespect').textContent = PlayerStats.selfRespect + '/10';
        document.getElementById('inv-items').textContent = PlayerStats.inventory.join(', ');

        // Color coding
        const charmEl = document.getElementById('hud-charm');
        charmEl.style.color = PlayerStats.charm >= 7 ? '#0f0' : PlayerStats.charm <= 3 ? '#f66' : '#ffcc00';

        const despEl = document.getElementById('hud-desperation');
        despEl.style.color = PlayerStats.desperation >= 7 ? '#f00' : '#ffcc00';

        const embEl = document.getElementById('hud-embarrassment');
        embEl.style.color = PlayerStats.embarrassment >= 7 ? '#f00' : '#ffcc00';
    },

    // ===== INTERACTION =====
    tryInteract() {
        for (const [key, npc] of Object.entries(NPCs)) {
            if (isNearNPC(this.player.x, npc)) {
                this.startNPCDialog(key);
                return;
            }
        }
    },

    // ===== DIALOG SYSTEM =====
    startNPCDialog(npcKey) {
        const npc = NPCs[npcKey];
        this.currentNPCKey = npcKey;
        npc.interacted = true;
        this.navigateDialog(npc, 'greeting');
    },

    navigateDialog(npc, dialogKey) {
        if (!dialogKey) {
            this.closeDialog();
            return;
        }

        const dialogNode = npc.dialog[dialogKey];
        if (!dialogNode) {
            this.closeDialog();
            return;
        }

        const text = typeof dialogNode.text === 'function' ? dialogNode.text() : dialogNode.text;
        const name = npc.name;

        this.showDialogUI(name, text, dialogNode.choices, npc);
    },

    showDialogUI(name, text, choices, npc) {
        this.state = 'dialog';
        this._showMovementControls(false);
        const dialogBox = document.getElementById('dialog-box');
        const dialogName = document.getElementById('dialog-name');
        const dialogText = document.getElementById('dialog-text');
        const dialogChoices = document.getElementById('dialog-choices');

        dialogBox.classList.add('active');
        dialogName.textContent = name;
        dialogChoices.innerHTML = '';

        // Typewriter effect
        this.typewriterText = text;
        this.typewriterIndex = 0;
        dialogText.textContent = '';
        this._npcChoicesShown = false;

        // Remove any old skip handlers
        if (this._skipHandler) {
            dialogBox.removeEventListener('click', this._skipHandler);
            dialogBox.removeEventListener('touchstart', this._skipHandler);
        }

        clearInterval(this.typewriterInterval);
        this.typewriterInterval = setInterval(() => {
            if (this.typewriterIndex < this.typewriterText.length) {
                dialogText.textContent += this.typewriterText[this.typewriterIndex];
                this.typewriterIndex++;
            } else {
                clearInterval(this.typewriterInterval);
                if (choices && !this._npcChoicesShown) {
                    this._npcChoicesShown = true;
                    this.showChoices(choices, npc);
                }
            }
        }, 30);

        this._skipHandler = (e) => {
            if (e && e.type === 'touchstart') e.preventDefault();
            if (this.typewriterIndex < this.typewriterText.length) {
                clearInterval(this.typewriterInterval);
                dialogText.textContent = this.typewriterText;
                this.typewriterIndex = this.typewriterText.length;
                if (choices && !this._npcChoicesShown) {
                    this._npcChoicesShown = true;
                    this.showChoices(choices, npc);
                }
            }
            dialogBox.removeEventListener('click', this._skipHandler);
            dialogBox.removeEventListener('touchstart', this._skipHandler);
        };
        dialogBox.addEventListener('click', this._skipHandler);
        dialogBox.addEventListener('touchstart', this._skipHandler, { passive: false });
    },

    showChoices(choices, npc) {
        const dialogChoices = document.getElementById('dialog-choices');
        dialogChoices.innerHTML = '';

        choices.forEach((choice, i) => {
            // Check requirements
            if (choice.requiresItem && !PlayerStats.inventory.includes(choice.requiresItem)) return;
            if (choice.requiresMoney && PlayerStats.money < choice.requiresMoney) {
                const btn = document.createElement('div');
                btn.className = 'dialog-choice';
                btn.style.opacity = '0.4';
                btn.style.pointerEvents = 'none';
                btn.innerHTML = `${choice.text} <span class="choice-effect">(Nicht genug Geld)</span>`;
                dialogChoices.appendChild(btn);
                return;
            }

            const btn = document.createElement('div');
            btn.className = 'dialog-choice';

            let effectText = '';
            if (choice.effect) {
                const effects = Object.entries(choice.effect)
                    .filter(([k, v]) => v !== 0)
                    .map(([k, v]) => {
                        const names = { charm: 'Charm', desperation: 'Verzweiflung', embarrassment: 'Peinlichkeit', selfRespect: 'Selbstrespekt' };
                        return `${v > 0 ? '+' : ''}${v} ${names[k] || k}`;
                    }).join(', ');
                if (effects) effectText = ` <span class="choice-effect">[${effects}]</span>`;
            }

            btn.innerHTML = choice.text + effectText;
            const choiceHandler = () => {
                // Apply effects
                if (choice.effect) {
                    Object.entries(choice.effect).forEach(([stat, val]) => {
                        PlayerStats.modify(stat, val);
                    });
                }
                this.updateHUD();

                // Screen shake on high embarrassment
                if (PlayerStats.embarrassment >= 7) {
                    Renderer.shake();
                }

                // Handle action
                if (choice.action) {
                    this.handleAction(choice.action, npc);
                    return;
                }

                // Handle callback
                if (choice.callback) {
                    choice.callback();
                    return;
                }

                // Navigate to next dialog
                if (choice.next) {
                    this.navigateDialog(npc, choice.next);
                } else {
                    this.closeDialog();
                }
            };
            btn.addEventListener('click', choiceHandler);
            btn.addEventListener('touchstart', (e) => { e.preventDefault(); choiceHandler(); }, { passive: false });

            dialogChoices.appendChild(btn);
        });
    },

    handleAction(action, npc) {
        switch (action) {
            case 'haggle':
                this.closeDialog(false);
                this.startHaggle(npc);
                break;
            case 'end_gentleman':
                PlayerStats.chosenNPC = 'svetlana';
                this.triggerEnding('gentleman');
                break;
            case 'end_adventurer':
                PlayerStats.chosenNPC = this.currentNPCKey;
                this.triggerEnding('adventurer');
                break;
            case 'end_true_love':
                PlayerStats.chosenNPC = 'klaus';
                PlayerStats.donerEaten = true;
                this.triggerEnding('true_love');
                break;
            case 'end_true_love_no_doner':
                PlayerStats.chosenNPC = 'klaus';
                if (PlayerStats.donerEaten) {
                    this.triggerEnding('true_love');
                } else {
                    this.triggerEnding('adventurer');
                }
                break;
            case 'end_arrested':
                PlayerStats.chosenNPC = 'erscheinung';
                this.triggerEnding('arrested');
                break;
            case 'end_influencer':
                PlayerStats.chosenNPC = 'ines';
                PlayerStats.inesAgreed = true;
                this.triggerEnding('influencer');
                break;
            case 'end_enlightened':
                PlayerStats.chosenNPC = 'oma';
                this.triggerEnding('enlightened');
                break;
        }
    },

    closeDialog(showMovementControls = true) {
        clearInterval(this.typewriterInterval);
        const dialogBox = document.getElementById('dialog-box');
        if (this._skipHandler) {
            dialogBox.removeEventListener('click', this._skipHandler);
            dialogBox.removeEventListener('touchstart', this._skipHandler);
            this._skipHandler = null;
        }
        dialogBox.classList.remove('active');
        this.state = 'playing';
        this.currentNPCKey = null;
        if (showMovementControls) this._showMovementControls(true);
    },

    // Generic dialog for events
    showDialog(name, text, choices) {
        const processedChoices = choices.map(c => ({
            ...c,
            next: null,
            action: null
        }));

        this.state = 'dialog';
        this._showMovementControls(false);
        const dialogBox = document.getElementById('dialog-box');
        const dialogName = document.getElementById('dialog-name');
        const dialogText = document.getElementById('dialog-text');
        const dialogChoices = document.getElementById('dialog-choices');

        dialogBox.classList.add('active');
        dialogName.textContent = name;
        dialogChoices.innerHTML = '';

        this.typewriterText = text;
        this.typewriterIndex = 0;
        dialogText.textContent = '';
        this._eventChoicesShown = false;

        // Remove any old skip handlers
        if (this._skipHandler) {
            dialogBox.removeEventListener('click', this._skipHandler);
            dialogBox.removeEventListener('touchstart', this._skipHandler);
        }

        clearInterval(this.typewriterInterval);
        this.typewriterInterval = setInterval(() => {
            if (this.typewriterIndex < this.typewriterText.length) {
                dialogText.textContent += this.typewriterText[this.typewriterIndex];
                this.typewriterIndex++;
            } else {
                clearInterval(this.typewriterInterval);
                if (!this._eventChoicesShown) {
                    this._eventChoicesShown = true;
                    this.showEventChoices(processedChoices);
                }
            }
        }, 25);

        this._skipHandler = (e) => {
            if (e && e.type === 'touchstart') e.preventDefault();
            if (this.typewriterIndex < this.typewriterText.length) {
                clearInterval(this.typewriterInterval);
                dialogText.textContent = this.typewriterText;
                this.typewriterIndex = this.typewriterText.length;
                if (!this._eventChoicesShown) {
                    this._eventChoicesShown = true;
                    this.showEventChoices(processedChoices);
                }
            }
            dialogBox.removeEventListener('click', this._skipHandler);
            dialogBox.removeEventListener('touchstart', this._skipHandler);
        };
        dialogBox.addEventListener('click', this._skipHandler);
        dialogBox.addEventListener('touchstart', this._skipHandler, { passive: false });
    },

    showEventChoices(choices) {
        const dialogChoices = document.getElementById('dialog-choices');
        dialogChoices.innerHTML = '';

        choices.forEach(choice => {
            if (choice.requiresMoney && PlayerStats.money < choice.requiresMoney) {
                const btn = document.createElement('div');
                btn.className = 'dialog-choice';
                btn.style.opacity = '0.4';
                btn.style.pointerEvents = 'none';
                btn.textContent = choice.text + ' (Nicht genug Geld)';
                dialogChoices.appendChild(btn);
                return;
            }

            const btn = document.createElement('div');
            btn.className = 'dialog-choice';
            btn.textContent = choice.text;
            const eventChoiceHandler = () => {
                if (choice.effect) {
                    Object.entries(choice.effect).forEach(([stat, val]) => {
                        PlayerStats.modify(stat, val);
                    });
                    this.updateHUD();
                }
                // Close dialog FIRST, then run callback
                // Callback may open a new dialog, so close must happen before
                const cb = choice.callback;
                this.closeDialog();
                if (cb) cb();
            };
            btn.addEventListener('click', eventChoiceHandler);
            btn.addEventListener('touchstart', (e) => { e.preventDefault(); eventChoiceHandler(); }, { passive: false });
            dialogChoices.appendChild(btn);
        });
    },

    // ===== HAGGLE MINI-GAME =====
    startHaggle(npc) {
        this.state = 'minigame';
        this._showMovementControls(false);
        this._showHaggleTouchBtn(true);
        const overlay = document.getElementById('minigame-haggle');
        overlay.classList.add('active');

        const zoneWidth = Math.max(15, 30 - PlayerStats.desperation * 2); // % of bar
        const zoneStart = 30 + Math.random() * (50 - zoneWidth);

        document.getElementById('haggle-zone').style.left = zoneStart + '%';
        document.getElementById('haggle-zone').style.width = zoneWidth + '%';
        document.getElementById('haggle-price').textContent = `Preis: ${npc.price}€`;

        this.haggleData = {
            npc,
            position: 0,
            direction: 1,
            speed: 2 + PlayerStats.desperation * 0.3,
            zoneStart,
            zoneEnd: zoneStart + zoneWidth,
            active: true,
            attempts: 0,
            maxAttempts: 3
        };

        this.haggleLoop();
    },

    haggleLoop() {
        if (!this.haggleData || !this.haggleData.active) return;

        const d = this.haggleData;
        d.position += d.direction * d.speed;
        if (d.position >= 100 || d.position <= 0) d.direction *= -1;
        d.position = Math.max(0, Math.min(100, d.position));

        document.getElementById('haggle-slider').style.left = d.position + '%';

        requestAnimationFrame(() => this.haggleLoop());
    },

    hagglePress() {
        if (!this.haggleData || !this.haggleData.active) return;
        const d = this.haggleData;

        if (d.position >= d.zoneStart && d.position <= d.zoneEnd) {
            // Success!
            d.active = false;
            this._showHaggleTouchBtn(false);
            const npc = d.npc;
            const discount = Math.floor(npc.price * 0.2);
            const finalPrice = npc.price - discount;

            document.getElementById('minigame-haggle').classList.remove('active');

            if (PlayerStats.money >= finalPrice) {
                PlayerStats.addMoney(-finalPrice);
                npc.haggleSuccess = true;
                this.updateHUD();
                this.showAchievement(`Gespart: ${discount}€!`);
                this.navigateDialog(npc, 'accept');
            } else {
                this.showDialog('System', `Du hast nur ${PlayerStats.money}€, brauchst aber ${finalPrice}€!`, [
                    { text: 'Verdammt!', effect: { desperation: 2 }, callback: () => {
                        this.triggerEnding('bankrupt');
                    }}
                ]);
            }
        } else {
            // Miss
            d.attempts++;
            Renderer.shake();

            if (d.attempts >= d.maxAttempts) {
                d.active = false;
                this._showHaggleTouchBtn(false);
                document.getElementById('minigame-haggle').classList.remove('active');

                // Price goes up 10%
                const npc = d.npc;
                npc.price = Math.ceil(npc.price * 1.1);
                this.navigateDialog(npc, 'reject');
            } else {
                // Speed up
                d.speed += 0.5;
                this.showFloatingText(`Daneben! Noch ${d.maxAttempts - d.attempts} Versuch(e)`);
            }
        }
    },

    // ===== QTE MINI-GAME =====
    startQTE(title, instruction, keys, timeLimit, callback) {
        this.state = 'minigame';
        this._showMovementControls(false);
        const overlay = document.getElementById('qte-overlay');
        overlay.classList.add('active');

        document.getElementById('qte-title').textContent = title;
        document.getElementById('qte-instruction').textContent =
            this._isTouchDevice() ? 'Tippe die Tasten in der richtigen Reihenfolge!' : instruction;

        const keysContainer = document.getElementById('qte-keys');
        keysContainer.innerHTML = '';

        this.qteData = {
            keys: [...keys],
            currentIndex: 0,
            startTime: Date.now(),
            timeLimit,
            callback,
            active: true
        };

        // Shared press logic (used by keyboard and touch)
        const pressKey = (keyStr) => {
            if (!this.qteData || !this.qteData.active) return;
            const expected = this.qteData.keys[this.qteData.currentIndex];

            if (keyStr.toLowerCase() === expected.toLowerCase()) {
                document.getElementById('qte-key-' + expected).classList.remove('active');
                document.getElementById('qte-key-' + expected).classList.add('success');
                this.qteData.currentIndex++;

                if (this.qteData.currentIndex >= this.qteData.keys.length) {
                    this.qteData.active = false;
                    document.removeEventListener('keydown', qteHandler);
                    setTimeout(() => {
                        overlay.classList.remove('active');
                        this.state = 'playing';
                        this._showMovementControls(true);
                        callback(true);
                    }, 500);
                } else {
                    document.getElementById('qte-key-' + this.qteData.keys[this.qteData.currentIndex]).classList.add('active');
                }
            } else {
                const currentKey = this.qteData.keys[this.qteData.currentIndex];
                const el = document.getElementById('qte-key-' + currentKey);
                el.classList.add('fail');
                setTimeout(() => el.classList.remove('fail'), 200);
            }
        };

        keys.forEach(k => {
            const keyEl = document.createElement('div');
            keyEl.className = 'qte-key';
            keyEl.textContent = k;
            keyEl.id = 'qte-key-' + k;
            // Touch/click support: tapping the correct key counts as pressing it
            const tapFn = (e) => { e.preventDefault(); pressKey(k); };
            keyEl.addEventListener('touchstart', tapFn, { passive: false });
            keyEl.addEventListener('click', tapFn);
            keysContainer.appendChild(keyEl);
        });

        // Highlight first key
        document.getElementById('qte-key-' + keys[0]).classList.add('active');

        // Keyboard handler
        const qteHandler = (e) => pressKey(e.key);
        document.addEventListener('keydown', qteHandler);

        // Timer
        const timerFill = document.getElementById('qte-timer-fill');
        const timerLoop = () => {
            if (!this.qteData || !this.qteData.active) return;
            const elapsed = Date.now() - this.qteData.startTime;
            const remaining = 1 - elapsed / this.qteData.timeLimit;
            timerFill.style.width = (remaining * 100) + '%';

            if (elapsed >= this.qteData.timeLimit) {
                this.qteData.active = false;
                document.removeEventListener('keydown', qteHandler);
                overlay.classList.remove('active');
                this.state = 'playing';
                this._showMovementControls(true);
                callback(false);
                return;
            }
            requestAnimationFrame(timerLoop);
        };
        timerLoop();
    },

    // ===== MONEY PICKUP MINI-GAME =====
    startMoneyPickup(totalAmount, callback) {
        this.state = 'minigame';
        const overlay = document.getElementById('minigame-money');
        overlay.classList.add('active');

        const field = document.getElementById('money-field');
        field.innerHTML = '';

        const numBills = Math.min(12, Math.max(5, Math.floor(totalAmount / 5)));
        const billValue = Math.ceil(totalAmount / numBills);
        let recovered = 0;
        let billsLeft = numBills;

        for (let i = 0; i < numBills; i++) {
            const bill = document.createElement('div');
            bill.className = 'money-bill';
            bill.textContent = billValue + '€';
            bill.style.left = (10 + Math.random() * 330) + 'px';
            bill.style.top = (10 + Math.random() * 210) + 'px';
            bill.style.transform = `rotate(${Math.random() * 40 - 20}deg)`;

            // Make bills drift
            const driftX = (Math.random() - 0.5) * 2;
            const driftY = Math.random() * 1.5;
            let bx = parseFloat(bill.style.left);
            let by = parseFloat(bill.style.top);

            const driftInterval = setInterval(() => {
                bx += driftX;
                by += driftY;
                if (bx < -50 || bx > 400 || by > 260) {
                    clearInterval(driftInterval);
                    if (!bill.classList.contains('grabbed')) {
                        bill.remove();
                        billsLeft--;
                        if (billsLeft <= 0) endPickup();
                    }
                } else {
                    bill.style.left = bx + 'px';
                    bill.style.top = by + 'px';
                }
            }, 50);

            const collectBill = () => {
                if (bill.classList.contains('grabbed')) return;
                bill.classList.add('grabbed');
                recovered += billValue;
                billsLeft--;
                clearInterval(driftInterval);
                if (billsLeft <= 0) endPickup();
            };
            bill.addEventListener('click', collectBill);
            bill.addEventListener('touchstart', (e) => { e.preventDefault(); collectBill(); }, { passive: false });

            field.appendChild(bill);
        }

        const timeLimit = 5000;
        const startTime = Date.now();
        const timerFill = document.getElementById('money-timer-fill');

        const timerLoop = () => {
            const elapsed = Date.now() - startTime;
            const remaining = 1 - elapsed / timeLimit;
            timerFill.style.width = (remaining * 100) + '%';

            if (elapsed >= timeLimit) {
                endPickup();
                return;
            }
            if (this.state === 'minigame') requestAnimationFrame(timerLoop);
        };
        timerLoop();

        const endPickup = () => {
            if (this.state !== 'minigame') return;
            overlay.classList.remove('active');
            this.state = 'playing';
            this.showFloatingText(`${recovered}€ aufgesammelt!`);
            callback(Math.min(recovered, totalAmount));
        };
    },

    // ===== FLOATING TEXT =====
    showFloatingText(text) {
        this.floatingTexts.push({
            text,
            x: this.width / 2,
            y: Renderer.height / 2,
            alpha: 1,
            time: Date.now()
        });
    },

    renderFloatingTexts() {
        const ctx = Renderer.ctx;
        this.floatingTexts = this.floatingTexts.filter(ft => {
            const age = (Date.now() - ft.time) / 1000;
            if (age > 2) return false;

            const alpha = 1 - age / 2;
            const y = Renderer.height / 2 - age * 50;

            ctx.save();
            ctx.fillStyle = `rgba(255, 204, 0, ${alpha})`;
            ctx.font = 'bold 18px Courier New';
            ctx.textAlign = 'center';
            ctx.fillText(ft.text, Renderer.width / 2, y);
            ctx.textAlign = 'left';
            ctx.restore();

            return true;
        });
    },

    // ===== ACHIEVEMENT =====
    showAchievement(text) {
        const popup = document.getElementById('achievement-popup');
        document.getElementById('achievement-desc').textContent = text;
        popup.classList.add('show');
        setTimeout(() => popup.classList.remove('show'), 3000);
    },

    // ===== ENDINGS =====
    triggerEnding(endingType) {
        if (this.state === 'ending') return; // Prevent double-trigger
        this.state = 'ending';
        this.closeDialog(false);
        this._showMovementControls(false);
        document.getElementById('hud').classList.remove('active');
        document.getElementById('minigame-haggle').classList.remove('active');
        document.getElementById('qte-overlay').classList.remove('active');
        document.getElementById('phone-overlay').classList.remove('active');

        const endings = {
            gentleman: {
                title: 'Der Gentleman',
                grade: 'A+',
                headline: '18-JÄHRIGER DISKUTIERT NIETZSCHE MIT PROSTITUIERTER - "ER HAT POTENZIAL", SAGT SIE',
                body: 'Ein junger Mann, nur als "Mace" bekannt, wurde in den frühen Morgenstunden auf der Linzer Straße gesehen, wo er eine intensive philosophische Diskussion mit einer Dame des horizontalen Gewerbes führte. "Normalerweise reden die Kunden nicht über den Übermenschen", sagte die Frau, die sich als Svetlana vorstellte. "Dieser hier war... anders. Immer noch peinlich, aber anders." Der junge Mann wurde zuletzt gesehen, wie er "Also sprach Zarathustra" auf Amazon bestellte.',
                condition: 'Svetlana gewählt mit hohem Charm'
            },
            adventurer: {
                title: 'Der Abenteurer',
                grade: 'B',
                headline: 'TEENAGER MACHT "ERFAHRUNG FÜRS LEBEN" - WIRD SICH NOCH JAHRELANG SCHÄMEN',
                body: 'Die Polizei berichtet von einem "verstörend enthusiastischen" jungen Mann auf der Linzer Straße. Zeugen beschreiben die Szene als "wie ein Autounfall - man will nicht hinsehen, aber man kann nicht wegsehen." Der junge Mann, der eine gefälschte Goldkette und zu viel Haargel trug, soll den Abend als "total worth it" bezeichnet haben. Seine Mutter war nicht erreichbar für Kommentare.',
                condition: 'Big Brenda oder andere gewählt'
            },
            true_love: {
                title: 'Die wahre Liebe',
                grade: 'S-Tier (Secret Best!)',
                headline: 'UNGEWÖHNLICHE ROMANZE: TEENAGER UND MANN IM KLEID FINDEN LIEBE BEIM DÖNER',
                body: 'In einer Geschichte, die selbst Hollywood nicht schreiben könnte, fanden ein 18-jähriger Gel-Enthusiast und ein Mann in einer schiefen Perücke die wahre Liebe - über einen Döner mit extra Soße. "Er hat mich nicht ausgelacht", sagte Klaus (47), der auch als "Klaudia" bekannt ist, mit Tränen in den Augen. "Er hat einfach einen Döner bestellt und gesagt \'mit extra extra Soße\'. In dem Moment wusste ich: Das ist der Richtige." Das Paar plant einen zweiten Döner-Abend.',
                condition: 'Klaus/Klaudia + Döner'
            },
            bankrupt: {
                title: 'Der Bankrotte',
                grade: 'D',
                headline: 'TEENAGER OHNE GELD AUF LINZER STRASSE GESTRANDET - "ICH HÄTTE EINEN DÖNER KAUFEN SOLLEN"',
                body: 'Ein junger Mann wurde in den frühen Morgenstunden weinend an einer Bushaltestelle gefunden, nachdem er sein gesamtes Geld auf der Linzer Straße "verloren" hatte. "Ich hab 150 Euro mitgenommen und hab jetzt nicht mal genug für die Straßenbahn", klagte der Teenager. Eine ältere Dame an der Bushaltestelle bot ihm ein Werther\'s Original an, was ihn noch mehr zum Weinen brachte.',
                condition: 'Kein Geld mehr'
            },
            arrested: {
                title: 'Der Verhaftete',
                grade: 'F',
                headline: '18-JÄHRIGER FÄLLT AUF POLIZEI-LOCKVOGEL REIN - "ES WAR ZU SCHÖN UM WAHR ZU SEIN"',
                body: 'Die Wiener Polizei meldet einen erfolgreichen Einsatz auf der Linzer Straße. Ein Teenager fiel auf einen Undercover-Lockvogel herein und wurde festgenommen. "Er hat wirklich geglaubt, dass eine übernatürlich attraktive Person ihm ihre Dienste gratis anbietet", sagte der ermittelnde Beamte kopfschüttelnd. "Um 3 Uhr morgens. Auf der Linzer Straße. Er ist 18." Die Mutter des jungen Mannes wurde informiert und soll "die Augen so fest zugemacht haben, dass sie einen Migräne-Anfall bekam."',
                condition: 'Die Erscheinung gewählt'
            },
            influencer: {
                title: 'Der Influencer',
                grade: 'C-',
                headline: 'VIRALES VIDEO: TEENAGER BEZEICHNET SICH ALS "LINZER STRASSEN-PRINZ"',
                body: 'Ein peinliches Video macht die Runde in den sozialen Medien: Ein 18-Jähriger, der sich vor laufender Kamera als "Linzer Straßen-Prinz" vorstellt. Das Video, gepostet von der Kleinstinfluencerin "Ines" (347 Follower, davon 200 Bots), hat überraschend 2 Millionen Views erreicht. Der junge Mann soll sich seitdem nicht mehr im Freien aufgehalten haben. Kommentar seiner Mutter: "Ich hab kein Kind."',
                condition: 'Ines zugestimmt'
            },
            morning_shame: {
                title: 'Die Morgenscham',
                grade: 'D+',
                headline: 'TEENAGER ÜBERLEBT NACHT AUF LINZER STRASSE - "ICH HAB NICHTS ERREICHT AUSSER SCHAM"',
                body: 'Als die Sonne über Wien aufging, wurde ein desorientierter junger Mann auf der Linzer Straße gefunden, der "einfach nur hin und her gegangen ist." Zeugen berichten, dass er mit verschiedenen Personen gesprochen, sich jedoch nie auf etwas eingelassen hatte. "Er hat 3 Stunden gebraucht, um zu merken, dass er eigentlich gar nicht weiß, was er will", sagte ein Beobachter. Der junge Mann ging schließlich mit leerer Tasche und einem Werther\'s Original nach Hause.',
                condition: 'Timer läuft ab'
            },
            enlightened: {
                title: 'Der Erleuchtete',
                grade: 'A',
                headline: '18-JÄHRIGER FINDET LEBENSWEISHEIT BEI OMA AN BUSHALTESTELLE',
                body: 'In einer überraschenden Wendung der Ereignisse fand ein junger Mann die Erleuchtung nicht bei einer Dame der Nacht, sondern bei einer 73-jährigen Oma, die auf den Bus wartete. "Sie hat mir von ihrem Herbert erzählt", sagte der sichtlich gerührte Teenager. "Und dann hat sie mir ein Werther\'s Original gegeben. Das war der beste Moment meines Lebens." Die Frau, Gertrude M., kommentierte: "Der Burschi hat endlich Verstand bewiesen. Wird Zeit." Der junge Mann plant, morgen in ein Kaffeehaus zu gehen.',
                condition: 'Oma Gertrude + Epiphanie'
            }
        };

        const ending = endings[endingType];
        if (!ending) return;

        // Check for bankrupt mid-game
        if (PlayerStats.money <= 0 && endingType !== 'bankrupt' && endingType !== 'arrested' && endingType !== 'influencer' && endingType !== 'enlightened') {
            this.triggerEnding('bankrupt');
            return;
        }

        setTimeout(() => {
            const endScreen = document.getElementById('end-screen');
            endScreen.classList.add('active');

            document.getElementById('end-headline').textContent = ending.headline;
            document.getElementById('end-body').textContent = ending.body;
            document.getElementById('end-grade').textContent = 'Note: ' + ending.grade;
            document.getElementById('end-ending').textContent = ending.title;
            document.getElementById('end-final-stats').innerHTML =
                `Geld übrig: ${PlayerStats.money}€ | Charm: ${PlayerStats.charm}/10 | ` +
                `Verzweiflung: ${PlayerStats.desperation}/10 | Peinlichkeit: ${PlayerStats.embarrassment}/10 | ` +
                `Selbstrespekt: ${PlayerStats.selfRespect}/10`;

            // Restart handler (keyboard + touch)
            const doRestart = () => {
                document.removeEventListener('keydown', restartHandler);
                endScreen.removeEventListener('click', tapRestart);
                endScreen.removeEventListener('touchstart', tapTouchRestart);
                endScreen.classList.remove('active');
                this.canvas.style.display = 'none';
                this.startTitleScreen();
            };
            const restartHandler = (e) => { if (e.key === 'Enter') doRestart(); };
            const tapRestart = () => doRestart();
            const tapTouchRestart = (e) => { e.preventDefault(); doRestart(); };
            document.addEventListener('keydown', restartHandler);
            endScreen.addEventListener('click', tapRestart);
            endScreen.addEventListener('touchstart', tapTouchRestart, { passive: false });
        }, 1000);
    }
};

// ===== START =====
window.addEventListener('load', () => {
    Game.init();
});
