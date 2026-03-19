// ===== RENDERER.JS - Canvas-Zeichnung =====

const Renderer = {
    canvas: null,
    ctx: null,
    width: 0,
    height: 0,
    cameraX: 0,
    worldWidth: 5000,
    groundY: 0,
    time: 0, // 0 to 1 (night to dawn)

    // Parallax layers
    stars: [],
    buildings: [],
    graffiti: [
        { x: 500, text: 'PHENO WAS HERE', color: '#00ff6688' },
        { x: 800, text: 'Mace war hier', color: '#ff336688' },
        { x: 1600, text: 'Pheno was here ★', color: '#ff990088' },
        { x: 2000, text: 'YOLO', color: '#ffcc0088' },
        { x: 2900, text: 'PHENO WAS HERE', color: '#66ccff88' },
        { x: 3200, text: '♥ Wien ♥', color: '#ff69b488' },
        { x: 4000, text: 'pheno was here', color: '#ff66ff88' },
        { x: 1400, text: 'Vermisst: Maces Würde', color: '#ff000088' },
        { x: 3800, text: 'Hilfe', color: '#ffffff44' }
    ],

    // Pigeon companion
    pigeon: {
        active: false,
        x: 0,
        y: 0,
        frame: 0,
        facepalm: false,
        bobOffset: 0
    },

    init(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.resize();
        this.generateStars();
        this.generateBuildings();
        this.graffiti.forEach(g => { g.rotation = -0.05 + (Math.random() - 0.5) * 0.1; });
        window.addEventListener('resize', () => this.resize());
    },

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.groundY = this.height * 0.75;
        if (this.stars.length > 0) this.generateStars();
    },

    generateStars() {
        this.stars = [];
        for (let i = 0; i < 100; i++) {
            this.stars.push({
                x: Math.random() * this.worldWidth * 2,
                y: Math.random() * this.height * 0.4,
                size: Math.random() * 2 + 0.5,
                twinkle: Math.random() * Math.PI * 2
            });
        }
    },

    generateBuildings() {
        this.buildings = [];
        let x = -100;
        while (x < this.worldWidth + 200) {
            const w = 80 + Math.random() * 120;
            const h = 100 + Math.random() * 200;
            const floors = Math.floor(h / 40);
            const windows = [];
            for (let fy = 0; fy < floors; fy++) {
                const numWin = Math.floor(w / 30);
                for (let wx = 0; wx < numWin; wx++) {
                    windows.push({
                        rx: 10 + wx * (w / numWin),
                        ry: 15 + fy * 40,
                        lit: Math.random() > 0.6,
                        flicker: Math.random() * Math.PI * 2,
                        warmth: Math.random() > 0.5 ? '255, 220, 100' : '200, 180, 255'
                    });
                }
            }
            this.buildings.push({ x, w, h, windows, color: `hsl(${220 + Math.random() * 20}, 15%, ${15 + Math.random() * 12}%)` });
            x += w + 5 + Math.random() * 20;
        }
    },

    updateCamera(playerX) {
        const targetX = playerX - this.width / 2;
        this.cameraX += (targetX - this.cameraX) * 0.08;
        this.cameraX = Math.max(0, Math.min(this.worldWidth - this.width, this.cameraX));
    },

    render(gameState) {
        const { ctx } = this;
        const { player, npcs, gameTime, totalGameTime } = gameState;

        // Time progression (0=night, 1=dawn)
        this.time = Math.min(1, gameTime / totalGameTime);

        // Clear
        ctx.clearRect(0, 0, this.width, this.height);

        const steps = [
            ['drawSky', () => this.drawSky()],
            ['drawStars', () => this.drawStars()],
            ['drawBuildings', () => this.drawBuildings()],
            ['drawGraffiti', () => this.drawGraffiti()],
            ['drawStreet', () => this.drawStreet()],
            ['drawLampposts', () => this.drawLampposts()],
            ['drawSlotMachine', () => this.drawSlotMachine()],
            ['drawNPCs', () => this.drawNPCs(npcs)],
            ['drawPlayer', () => this.drawPlayer(player)],
            ['drawPigeon', () => this.drawPigeon(player)],
            ['drawNightOverlay', () => this.drawNightOverlay()],
            ['drawInteractionPrompt', () => this.drawInteractionPrompt(player, npcs)]
        ];

        for (const [name, fn] of steps) {
            try {
                fn();
            } catch (e) {
                throw new Error(`${name}: ${e.message}`);
            }
        }
    },

    drawSky() {
        const { ctx, width, height, time } = this;
        const nightColor = [20, 5, 50];
        const dawnColor = [120, 60, 100];
        const r = nightColor[0] + (dawnColor[0] - nightColor[0]) * time;
        const g = nightColor[1] + (dawnColor[1] - nightColor[1]) * time;
        const b = nightColor[2] + (dawnColor[2] - nightColor[2]) * time;

        const grad = ctx.createLinearGradient(0, 0, 0, this.groundY);
        grad.addColorStop(0, `rgb(${r},${g},${b})`);
        grad.addColorStop(1, `rgb(${r + 20},${g + 15},${b + 30})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, this.groundY);
    },

    drawStars() {
        const { ctx, time } = this;
        const alpha = Math.max(0, 1 - time * 2);
        if (alpha <= 0) return;

        this.stars.forEach(star => {
            const sx = star.x * 0.1 - this.cameraX * 0.05;
            if (sx < -5 || sx > this.width + 5) return;
            const twinkle = Math.sin(Date.now() * 0.003 + star.twinkle) * 0.3 + 0.7;
            ctx.fillStyle = `rgba(255, 255, 220, ${alpha * twinkle})`;
            ctx.beginPath();
            ctx.arc(sx, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });
    },

    drawBuildings() {
        const { ctx } = this;
        this.buildings.forEach(b => {
            const bx = b.x * 0.5 - this.cameraX * 0.5;
            if (bx + b.w < -10 || bx > this.width + 10) return;
            const by = this.groundY - b.h;

            // Building body
            ctx.fillStyle = b.color;
            ctx.fillRect(bx, by, b.w, b.h);

            // Roof
            ctx.fillStyle = `hsl(220, 15%, 8%)`;
            ctx.fillRect(bx - 2, by - 5, b.w + 4, 8);

            // Windows
            b.windows.forEach(w => {
                const wx = bx + w.rx;
                const wy = by + w.ry;
                if (w.lit) {
                    const flicker = Math.sin(Date.now() * 0.002 + w.flicker) * 0.1 + 0.9;
                    const warmth = w.warmth;
                    ctx.fillStyle = `rgba(${warmth}, ${0.6 * flicker * (1 - this.time * 0.5)})`;
                    ctx.shadowColor = `rgba(${warmth}, 0.3)`;
                    ctx.shadowBlur = 8;
                } else {
                    ctx.fillStyle = 'rgba(30, 30, 50, 0.8)';
                    ctx.shadowBlur = 0;
                }
                ctx.fillRect(wx, wy, 15, 20);
                ctx.shadowBlur = 0;
            });
        });
    },

    drawGraffiti() {
        const { ctx } = this;
        this.graffiti.forEach(g => {
            const gx = g.x - this.cameraX;
            if (gx < -200 || gx > this.width + 200) return;
            ctx.save();
            ctx.font = '14px Courier New';
            ctx.fillStyle = g.color;
            ctx.translate(gx, this.groundY - 30);
            ctx.rotate(g.rotation);
            ctx.fillText(g.text, 0, 0);
            ctx.restore();
        });
    },

    drawStreet() {
        const { ctx, width, height, groundY } = this;

        // Sidewalk
        ctx.fillStyle = '#3d3d3d';
        ctx.fillRect(0, groundY, width, height - groundY);

        // Road
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(0, groundY + 20, width, height - groundY - 20);

        // Road markings
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 2;
        ctx.setLineDash([30, 20]);
        const roadCenterY = groundY + (height - groundY) / 2 + 10;
        ctx.beginPath();
        const dashOffset = -this.cameraX % 50;
        for (let x = dashOffset; x < width + 50; x += 50) {
            ctx.moveTo(x, roadCenterY);
            ctx.lineTo(x + 30, roadCenterY);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // Curb
        ctx.fillStyle = '#666';
        ctx.fillRect(0, groundY + 17, width, 6);
    },

    drawLampposts() {
        const { ctx } = this;
        const lampSpacing = 400;
        const startX = 200;

        for (let lx = startX; lx < this.worldWidth; lx += lampSpacing) {
            const sx = lx - this.cameraX;
            if (sx < -50 || sx > this.width + 50) continue;

            // Pole
            ctx.fillStyle = '#666';
            ctx.fillRect(sx - 3, this.groundY - 120, 6, 120);

            // Lamp head
            ctx.fillStyle = '#777';
            ctx.fillRect(sx - 15, this.groundY - 125, 30, 10);

            // Light glow
            const intensity = 1 - this.time * 0.8;
            if (intensity > 0) {
                const grad = ctx.createRadialGradient(sx, this.groundY - 115, 5, sx, this.groundY - 30, 180);
                grad.addColorStop(0, `rgba(255, 220, 100, ${0.35 * intensity})`);
                grad.addColorStop(0.4, `rgba(255, 200, 80, ${0.15 * intensity})`);
                grad.addColorStop(1, 'rgba(255, 200, 80, 0)');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(sx, this.groundY - 30, 180, 0, Math.PI * 2);
                ctx.fill();

                // Lamp bulb
                ctx.fillStyle = `rgba(255, 240, 150, ${0.8 * intensity})`;
                ctx.beginPath();
                ctx.arc(sx, this.groundY - 118, 5, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    },

    slotMachineX: NPC_POSITIONS.vedro_slot,

    drawSlotMachine() {
        const { ctx } = this;
        const sx = this.slotMachineX - this.cameraX;
        if (sx < -100 || sx > this.width + 100) return;

        const gy = this.groundY;

        // Machine body
        ctx.fillStyle = '#4a0e0e';
        ctx.fillRect(sx - 25, gy - 90, 50, 90);

        // Gold trim
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.strokeRect(sx - 25, gy - 90, 50, 90);

        // Screen area (dark)
        ctx.fillStyle = '#0a0a2a';
        ctx.fillRect(sx - 20, gy - 80, 40, 35);

        // Screen border gold
        ctx.strokeStyle = '#b8860b';
        ctx.lineWidth = 1;
        ctx.strokeRect(sx - 20, gy - 80, 40, 35);

        // Mini reels display (3 slots)
        const symbols = ['📖', '👑', '🪲'];
        const reelTime = Date.now() * 0.003;
        ctx.font = '10px serif';
        ctx.textAlign = 'center';
        for (let i = 0; i < 3; i++) {
            const symIdx = Math.floor(reelTime + i * 1.7) % symbols.length;
            ctx.fillStyle = '#ffd700';
            ctx.fillText(symbols[symIdx], sx - 10 + i * 10, gy - 58);
        }

        // "BOOK OF RA" title
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 6px Courier New';
        ctx.fillText('BOOK OF RA', sx, gy - 83);

        // Coin slot
        ctx.fillStyle = '#333';
        ctx.fillRect(sx - 5, gy - 38, 10, 3);

        // Lever
        ctx.fillStyle = '#888';
        ctx.fillRect(sx + 25, gy - 65, 4, 25);
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(sx + 27, gy - 67, 5, 0, Math.PI * 2);
        ctx.fill();

        // Flashing lights
        const flashTime = Date.now() * 0.005;
        for (let i = 0; i < 5; i++) {
            const on = Math.sin(flashTime + i * 1.2) > 0;
            ctx.fillStyle = on ? '#ff0' : '#660';
            ctx.beginPath();
            ctx.arc(sx - 18 + i * 9, gy - 87, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        // Glow effect
        const intensity = 1 - this.time * 0.8;
        if (intensity > 0) {
            ctx.shadowColor = '#ffd700';
            ctx.shadowBlur = 8 * intensity;
            ctx.fillStyle = `rgba(255, 215, 0, ${0.05 * intensity})`;
            ctx.fillRect(sx - 30, gy - 95, 60, 100);
            ctx.shadowBlur = 0;
        }

        ctx.textAlign = 'left';
    },

    drawPlayer(player) {
        const { ctx } = this;
        const px = player.x - this.cameraX;
        const jumpHeight = player.y || 0;
        const py = this.groundY - jumpHeight;
        const facing = player.facing;
        const walkFrame = player.walkFrame;
        const isWalking = player.isWalking;
        const isIdle = player.idleTime > 3;
        const konami = PlayerStats.konamiActive;

        // Shadow stays on ground, shrinks when airborne
        const shadowScale = Math.max(0.3, 1 - jumpHeight / 150);
        ctx.fillStyle = `rgba(0,0,0,${0.3 * shadowScale})`;
        ctx.beginPath();
        ctx.ellipse(px, this.groundY - 2, 18 * shadowScale, 5 * shadowScale, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.save();
        ctx.translate(px, py);
        if (facing === -1) {
            ctx.scale(-1, 1);
        }

        // Swagger bob
        const bob = isWalking ? Math.sin(walkFrame * 0.3) * 3 : 0;
        const swagger = isWalking ? Math.sin(walkFrame * 0.15) * 2 : 0;

        // Legs
        const legSpread = isWalking ? Math.sin(walkFrame * 0.3) * 8 : 0;
        ctx.fillStyle = '#1a1a3a';
        ctx.fillRect(-8 + legSpread / 2, -25 + bob, 7, 25); // left leg
        ctx.fillRect(1 - legSpread / 2, -25 + bob, 7, 25); // right leg

        // Shoes
        ctx.fillStyle = '#fff';
        ctx.fillRect(-9 + legSpread / 2, -3 + bob, 10, 4);
        ctx.fillRect(0 - legSpread / 2, -3 + bob, 10, 4);

        // Body (too-tight shirt)
        ctx.fillStyle = '#222';
        ctx.fillRect(-12, -52 + bob + swagger, 24, 30);

        // Gold chain
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-5, -48 + bob + swagger);
        ctx.quadraticCurveTo(0, -42 + bob + swagger, 5, -48 + bob + swagger);
        ctx.stroke();

        // Arms
        const armSwing = isWalking ? Math.sin(walkFrame * 0.3) * 15 : 0;
        ctx.fillStyle = '#daa06d';
        // Left arm
        ctx.save();
        ctx.translate(-12, -48 + bob + swagger);
        ctx.rotate((-20 + armSwing) * Math.PI / 180);
        ctx.fillRect(-4, 0, 6, 22);
        ctx.restore();
        // Right arm
        ctx.save();
        ctx.translate(12, -48 + bob + swagger);
        ctx.rotate((20 - armSwing) * Math.PI / 180);
        ctx.fillRect(-2, 0, 6, 22);
        ctx.restore();

        // Head (oversized)
        const headY = -70 + bob + swagger;
        ctx.fillStyle = '#daa06d';
        ctx.beginPath();
        ctx.arc(0, headY, 16, 0, Math.PI * 2);
        ctx.fill();

        // Gel hair
        ctx.fillStyle = '#1a0a00';
        ctx.beginPath();
        ctx.arc(0, headY - 4, 16, Math.PI, 0);
        ctx.fill();
        // Spiky top
        for (let i = -3; i <= 3; i++) {
            ctx.beginPath();
            ctx.moveTo(i * 4, headY - 18);
            ctx.lineTo(i * 4 - 2, headY - 12);
            ctx.lineTo(i * 4 + 2, headY - 12);
            ctx.fill();
        }

        // Konami: Top hat + monocle
        if (konami) {
            ctx.fillStyle = '#111';
            ctx.fillRect(-14, headY - 38, 28, 5);
            ctx.fillRect(-10, headY - 60, 20, 25);
            // Monocle
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(8, headY - 2, 6, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(14, headY - 2);
            ctx.lineTo(18, headY + 10);
            ctx.stroke();
        }

        // Eyes
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.ellipse(-5, headY - 2, 4, 3, 0, 0, Math.PI * 2);
        ctx.ellipse(5, headY - 2, 4, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.arc(-4, headY - 1, 2, 0, Math.PI * 2);
        ctx.arc(6, headY - 1, 2, 0, Math.PI * 2);
        ctx.fill();

        // Idle animation
        if (isIdle) {
            const idleCycle = Math.floor(Date.now() / 2000) % 3;
            if (idleCycle === 0) {
                // Look around nervously
                const lookDir = Math.sin(Date.now() * 0.005) * 3;
                ctx.fillStyle = '#222';
                ctx.beginPath();
                ctx.arc(-4 + lookDir, headY - 1, 2, 0, Math.PI * 2);
                ctx.arc(6 + lookDir, headY - 1, 2, 0, Math.PI * 2);
                ctx.fill();
            } else if (idleCycle === 1) {
                // Check phone
                ctx.fillStyle = '#333';
                ctx.fillRect(14, -38, 8, 14);
                ctx.fillStyle = '#4488ff';
                ctx.fillRect(15, -37, 6, 10);
            }
            // Draw thought bubble
            if (idleCycle === 2) {
                ctx.fillStyle = 'rgba(255,255,255,0.9)';
                ctx.beginPath();
                ctx.arc(25, headY - 35, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(32, headY - 45, 5, 0, Math.PI * 2);
                ctx.fill();

                // Thought bubble
                ctx.beginPath();
                ctx.ellipse(45, headY - 60, 55, 18, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#333';
                ctx.font = '10px Courier New';
                ctx.fillText('Was mach ich hier', 5, headY - 57);
                ctx.fillText('eigentlich?', 15, headY - 47);
            }
        }

        // Mouth
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        if (PlayerStats.desperation > 5) {
            // Grimace
            ctx.moveTo(-4, headY + 6);
            ctx.quadraticCurveTo(0, headY + 3, 4, headY + 6);
        } else {
            // Slight smile
            ctx.moveTo(-4, headY + 5);
            ctx.quadraticCurveTo(0, headY + 8, 4, headY + 5);
        }
        ctx.stroke();

        ctx.restore();
    },

    drawNPCs(npcs) {
        const { ctx } = this;

        Object.entries(npcs).forEach(([key, npc]) => {
            const nx = npc.x - this.cameraX;
            if (nx < -80 || nx > this.width + 80) return;
            const ny = this.groundY;

            ctx.save();
            ctx.translate(nx, ny);

            // Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.beginPath();
            ctx.ellipse(0, -2, npc.width * 0.6, 5, 0, 0, Math.PI * 2);
            ctx.fill();

            // Idle bob
            const bob = Math.sin(Date.now() * 0.002 + npc.x) * 2;

            this['drawNPC_' + key]?.(ctx, bob, npc);

            // Name label
            if (!npc.interacted || key === 'oma' || key === 'vedro' || key === 'pajo') {
                ctx.fillStyle = 'rgba(0,0,0,0.6)';
                ctx.font = '11px Courier New';
                const measuredWidth = ctx.measureText(npc.name).width;
                ctx.fillRect(-measuredWidth / 2 - 5, -npc.height - 30 + bob, measuredWidth + 10, 18);
                ctx.fillStyle = npc.color;
                ctx.textAlign = 'center';
                ctx.fillText(npc.name, 0, -npc.height - 16 + bob);
                ctx.textAlign = 'left';
            }

            ctx.restore();
        });
    },

    drawNPC_svetlana(ctx, bob) {
        // Tall, elegant, holding a book
        ctx.fillStyle = '#9b59b6';
        ctx.fillRect(-10, -55 + bob, 20, 35); // dress
        ctx.fillStyle = '#daa06d';
        ctx.beginPath();
        ctx.arc(0, -65 + bob, 12, 0, Math.PI * 2); // head
        ctx.fill();
        // Long dark hair
        ctx.fillStyle = '#2c0033';
        ctx.fillRect(-14, -75 + bob, 28, 20);
        ctx.fillRect(-14, -60 + bob, 5, 20);
        ctx.fillRect(9, -60 + bob, 5, 20);
        // Book
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(12, -45 + bob, 10, 14);
        ctx.fillStyle = '#fff';
        ctx.fillRect(13, -44 + bob, 8, 12);
        // Legs
        ctx.fillStyle = '#daa06d';
        ctx.fillRect(-6, -20 + bob, 5, 20);
        ctx.fillRect(1, -20 + bob, 5, 20);
        // Eyes (intellectual gaze)
        ctx.fillStyle = '#fff';
        ctx.fillRect(-6, -67 + bob, 5, 3);
        ctx.fillRect(1, -67 + bob, 5, 3);
        ctx.fillStyle = '#333';
        ctx.fillRect(-4, -67 + bob, 2, 3);
        ctx.fillRect(3, -67 + bob, 2, 3);
        // Glasses
        ctx.strokeStyle = '#ccc';
        ctx.lineWidth = 1;
        ctx.strokeRect(-7, -68 + bob, 7, 5);
        ctx.strokeRect(0, -68 + bob, 7, 5);
    },

    drawNPC_brenda(ctx, bob) {
        // Very wide, imposing
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(-25, -50 + bob, 50, 35); // body
        ctx.fillStyle = '#daa06d';
        ctx.beginPath();
        ctx.arc(0, -58 + bob, 13, 0, Math.PI * 2); // head
        ctx.fill();
        // Big hair
        ctx.fillStyle = '#c0392b';
        ctx.beginPath();
        ctx.arc(0, -62 + bob, 18, Math.PI, 0);
        ctx.fill();
        // Arms (thick)
        ctx.fillStyle = '#daa06d';
        ctx.fillRect(-32, -48 + bob, 10, 25);
        ctx.fillRect(22, -48 + bob, 10, 25);
        // Legs
        ctx.fillRect(-15, -15 + bob, 12, 15);
        ctx.fillRect(3, -15 + bob, 12, 15);
        // Eyes
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(-5, -59 + bob, 3, 0, Math.PI * 2);
        ctx.arc(5, -59 + bob, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.arc(-5, -59 + bob, 1.5, 0, Math.PI * 2);
        ctx.arc(5, -59 + bob, 1.5, 0, Math.PI * 2);
        ctx.fill();
        // Big smile
        ctx.strokeStyle = '#c0392b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, -55 + bob, 7, 0, Math.PI);
        ctx.stroke();
    },

    drawNPC_klaus(ctx, bob) {
        // Man in drag, crooked wig
        ctx.fillStyle = '#3498db';
        ctx.fillRect(-12, -55 + bob, 24, 35); // dress
        ctx.fillStyle = '#daa06d';
        ctx.beginPath();
        ctx.arc(0, -65 + bob, 12, 0, Math.PI * 2); // head
        ctx.fill();
        // Crooked wig
        ctx.save();
        ctx.translate(3, -2);
        ctx.rotate(0.15);
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.arc(0, -66 + bob, 16, Math.PI, 0.2);
        ctx.fill();
        ctx.fillRect(-16, -66 + bob, 8, 25);
        ctx.fillRect(10, -66 + bob, 8, 25);
        ctx.restore();
        // Lipstick (messy)
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.ellipse(0, -58 + bob, 5, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        // 5 o'clock shadow
        ctx.fillStyle = 'rgba(100,100,100,0.3)';
        ctx.beginPath();
        ctx.arc(0, -57 + bob, 8, 0, Math.PI);
        ctx.fill();
        // Legs (hairy)
        ctx.fillStyle = '#daa06d';
        ctx.fillRect(-7, -20 + bob, 6, 20);
        ctx.fillRect(1, -20 + bob, 6, 20);
        // Eyes (friendly)
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(-4, -66 + bob, 3, 0, Math.PI * 2);
        ctx.arc(4, -66 + bob, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#2980b9';
        ctx.beginPath();
        ctx.arc(-4, -66 + bob, 1.5, 0, Math.PI * 2);
        ctx.arc(4, -66 + bob, 1.5, 0, Math.PI * 2);
        ctx.fill();
    },

    drawNPC_twins(ctx, bob) {
        // Two identical figures side by side
        for (let i = -1; i <= 1; i += 2) {
            const tx = i * 14;
            ctx.fillStyle = '#e91e63';
            ctx.fillRect(tx - 10, -52 + bob, 18, 32);
            ctx.fillStyle = '#daa06d';
            ctx.beginPath();
            ctx.arc(tx, -60 + bob, 10, 0, Math.PI * 2);
            ctx.fill();
            // Hair
            ctx.fillStyle = '#1a0a00';
            ctx.beginPath();
            ctx.arc(tx, -64 + bob, 12, Math.PI, 0);
            ctx.fill();
            ctx.fillRect(tx - 12, -60 + bob, 4, 15);
            ctx.fillRect(tx + 8, -60 + bob, 4, 15);
            // Eyes
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(tx - 3, -61 + bob, 2.5, 0, Math.PI * 2);
            ctx.arc(tx + 3, -61 + bob, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#222';
            ctx.beginPath();
            ctx.arc(tx - 3, -61 + bob, 1, 0, Math.PI * 2);
            ctx.arc(tx + 3, -61 + bob, 1, 0, Math.PI * 2);
            ctx.fill();
            // Legs
            ctx.fillStyle = '#daa06d';
            ctx.fillRect(tx - 5, -20 + bob, 4, 20);
            ctx.fillRect(tx + 1, -20 + bob, 4, 20);
        }
        // Sync indicator (small connection line)
        ctx.strokeStyle = 'rgba(233, 30, 99, 0.3)';
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(-4, -45 + bob);
        ctx.lineTo(4, -45 + bob);
        ctx.stroke();
        ctx.setLineDash([]);
    },

    drawNPC_oma(ctx, bob) {
        // Old lady at bus stop
        // Bus stop sign
        ctx.fillStyle = '#666';
        ctx.fillRect(20, -100, 4, 100);
        ctx.fillStyle = '#2196F3';
        ctx.fillRect(12, -100, 20, 15);
        ctx.fillStyle = '#fff';
        ctx.font = '8px Courier New';
        ctx.fillText('BUS', 15, -90);

        // Oma body
        ctx.fillStyle = '#95a5a6';
        ctx.fillRect(-10, -42 + bob, 20, 28); // coat
        ctx.fillStyle = '#daa06d';
        ctx.beginPath();
        ctx.arc(0, -50 + bob, 10, 0, Math.PI * 2); // head
        ctx.fill();
        // Hair bun
        ctx.fillStyle = '#ccc';
        ctx.beginPath();
        ctx.arc(0, -56 + bob, 8, Math.PI, 0);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, -62 + bob, 5, 0, Math.PI * 2);
        ctx.fill();
        // Glasses
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(-4, -50 + bob, 4, 0, Math.PI * 2);
        ctx.arc(4, -50 + bob, 4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, -50 + bob);
        ctx.lineTo(0, -50 + bob);
        ctx.stroke();
        // Shopping bag
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(-18, -30 + bob, 10, 15);
        // Legs
        ctx.fillStyle = '#daa06d';
        ctx.fillRect(-6, -14 + bob, 5, 14);
        ctx.fillRect(1, -14 + bob, 5, 14);
        // Smile
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, -47 + bob, 4, 0, Math.PI);
        ctx.stroke();
    },

    drawNPC_ines(ctx, bob) {
        // Influencer with selfie stick and ring light
        ctx.fillStyle = '#ff69b4';
        ctx.fillRect(-9, -55 + bob, 18, 35);
        ctx.fillStyle = '#daa06d';
        ctx.beginPath();
        ctx.arc(0, -63 + bob, 10, 0, Math.PI * 2);
        ctx.fill();
        // Hair (styled)
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(0, -67 + bob, 12, Math.PI, 0);
        ctx.fill();
        ctx.fillRect(-12, -63 + bob, 4, 20);
        ctx.fillRect(8, -63 + bob, 4, 20);
        // Selfie stick
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(15, -40 + bob);
        ctx.lineTo(30, -75 + bob);
        ctx.stroke();
        // Phone on stick
        ctx.fillStyle = '#333';
        ctx.fillRect(27, -82 + bob, 8, 12);
        ctx.fillStyle = '#66aaff';
        ctx.fillRect(28, -81 + bob, 6, 9);
        // Ring light
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 + Math.sin(Date.now() * 0.005) * 0.3})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(31, -76 + bob, 10, 0, Math.PI * 2);
        ctx.stroke();
        // Eyes (big, instagram-worthy)
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(-3, -64 + bob, 3, 0, Math.PI * 2);
        ctx.arc(3, -64 + bob, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.arc(-3, -64 + bob, 1.5, 0, Math.PI * 2);
        ctx.arc(3, -64 + bob, 1.5, 0, Math.PI * 2);
        ctx.fill();
        // Legs
        ctx.fillStyle = '#daa06d';
        ctx.fillRect(-5, -20 + bob, 4, 20);
        ctx.fillRect(1, -20 + bob, 4, 20);
        // Duck lips
        ctx.fillStyle = '#ff1493';
        ctx.beginPath();
        ctx.ellipse(0, -57 + bob, 3, 2, 0, 0, Math.PI * 2);
        ctx.fill();
    },

    drawNPC_lehel(ctx, bob) {
        // Hungarian banker in dark suit, smartphone in hand
        // Suit jacket (dark navy)
        ctx.fillStyle = '#1a2a4a';
        ctx.fillRect(-9, -55 + bob, 18, 35);
        // White shirt front
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(-4, -54 + bob, 8, 12);
        // Red tie (Hungarian colors)
        ctx.fillStyle = '#c0392b';
        ctx.fillRect(-1, -53 + bob, 2, 16);
        // Lapels
        ctx.fillStyle = '#1a2a4a';
        ctx.fillRect(-9, -55 + bob, 5, 14);
        ctx.fillRect(4, -55 + bob, 5, 14);
        // Head
        ctx.fillStyle = '#c8a87a';
        ctx.beginPath();
        ctx.arc(0, -65 + bob, 11, 0, Math.PI * 2);
        ctx.fill();
        // Slicked-back dark hair
        ctx.fillStyle = '#111';
        ctx.fillRect(-11, -77 + bob, 22, 13);
        ctx.fillRect(-11, -70 + bob, 3, 7);
        ctx.fillRect(8, -70 + bob, 3, 7);
        // Glasses (banker style)
        ctx.strokeStyle = '#8B7355';
        ctx.lineWidth = 1;
        ctx.strokeRect(-8, -68 + bob, 7, 4);
        ctx.strokeRect(-1, -68 + bob, 7, 4);
        ctx.beginPath(); ctx.moveTo(-1, -66 + bob); ctx.lineTo(0, -66 + bob); ctx.stroke();
        // Eyes
        ctx.fillStyle = '#333';
        ctx.fillRect(-6, -68 + bob, 3, 3);
        ctx.fillRect(1, -68 + bob, 3, 3);
        // Smartphone (right hand, held up)
        ctx.fillStyle = '#111';
        ctx.fillRect(10, -40 + bob, 7, 11);
        ctx.fillStyle = '#4a9eff';
        ctx.fillRect(11, -39 + bob, 5, 9);
        // Briefcase (left hand)
        ctx.fillStyle = '#6B3410';
        ctx.fillRect(-21, -26 + bob, 13, 9);
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(-18, -29 + bob, 7, 4);
        ctx.strokeStyle = '#5a2a00';
        ctx.lineWidth = 1;
        ctx.strokeRect(-21, -26 + bob, 13, 9);
        // Legs (suit trousers)
        ctx.fillStyle = '#1a2a4a';
        ctx.fillRect(-7, -20 + bob, 5, 20);
        ctx.fillRect(2, -20 + bob, 5, 20);
        // Shiny black shoes
        ctx.fillStyle = '#050505';
        ctx.fillRect(-8, -2 + bob, 7, 4);
        ctx.fillRect(1, -2 + bob, 7, 4);
    },

    drawNPC_erscheinung(ctx, bob) {
        // Suspiciously perfect, glowing
        const glow = Math.sin(Date.now() * 0.003) * 0.2 + 0.8;

        // Glow aura
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 20 * glow;

        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(-9, -58 + bob, 18, 38);
        ctx.fillStyle = '#daa06d';
        ctx.beginPath();
        ctx.arc(0, -66 + bob, 11, 0, Math.PI * 2);
        ctx.fill();
        // Perfect hair
        ctx.fillStyle = '#c0392b';
        ctx.beginPath();
        ctx.arc(0, -70 + bob, 13, Math.PI, 0.1);
        ctx.fill();
        // Perfect smile
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(0, -60 + bob, 5, 0, Math.PI);
        ctx.fill();
        // Eyes (too perfect)
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(-4, -67 + bob, 3, 0, Math.PI * 2);
        ctx.arc(4, -67 + bob, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#2ecc71';
        ctx.beginPath();
        ctx.arc(-4, -67 + bob, 1.5, 0, Math.PI * 2);
        ctx.arc(4, -67 + bob, 1.5, 0, Math.PI * 2);
        ctx.fill();
        // Legs
        ctx.fillStyle = '#daa06d';
        ctx.fillRect(-5, -20 + bob, 4, 20);
        ctx.fillRect(1, -20 + bob, 4, 20);
        // Sparkles
        ctx.shadowBlur = 0;
        const sparkTime = Date.now() * 0.005;
        for (let i = 0; i < 4; i++) {
            const angle = sparkTime + i * Math.PI / 2;
            const sx = Math.cos(angle) * 25;
            const sy = Math.sin(angle) * 20 - 40;
            ctx.fillStyle = `rgba(255, 215, 0, ${0.5 + Math.sin(sparkTime + i) * 0.5})`;
            ctx.font = '12px serif';
            ctx.fillText('✦', sx - 4, sy + bob);
        }
        // Hidden earpiece
        ctx.fillStyle = 'rgba(50,50,50,0.4)';
        ctx.beginPath();
        ctx.arc(12, -65 + bob, 2, 0, Math.PI * 2);
        ctx.fill();
    },

    drawNPC_vedro(ctx, bob) {
        // Fat guy with empty leash, tracksuit
        // Big round body - tracksuit (dark blue Adidas-style)
        ctx.fillStyle = '#1a237e';
        ctx.beginPath();
        ctx.ellipse(0, -35 + bob, 18, 22, 0, 0, Math.PI * 2);
        ctx.fill();

        // White stripes on tracksuit
        ctx.strokeStyle = 'rgba(255,255,255,0.6)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-14, -50 + bob);
        ctx.lineTo(-10, -15 + bob);
        ctx.moveTo(14, -50 + bob);
        ctx.lineTo(10, -15 + bob);
        ctx.stroke();

        // Head
        ctx.fillStyle = '#daa06d';
        ctx.beginPath();
        ctx.arc(0, -62 + bob, 13, 0, Math.PI * 2);
        ctx.fill();

        // Short buzz cut
        ctx.fillStyle = '#3e2723';
        ctx.beginPath();
        ctx.arc(0, -66 + bob, 13, Math.PI, 0.05);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(-4, -62 + bob, 2, 0, Math.PI * 2);
        ctx.arc(4, -62 + bob, 2, 0, Math.PI * 2);
        ctx.fill();

        // Friendly grin
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, -58 + bob, 6, 0.2, Math.PI - 0.2);
        ctx.stroke();

        // Double chin
        ctx.fillStyle = '#c9956b';
        ctx.beginPath();
        ctx.ellipse(0, -50 + bob, 8, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Legs (thick)
        ctx.fillStyle = '#1a237e';
        ctx.fillRect(-9, -14 + bob, 8, 14);
        ctx.fillRect(1, -14 + bob, 8, 14);

        // Sneakers
        ctx.fillStyle = '#fff';
        ctx.fillRect(-10, -2 + bob, 10, 4);
        ctx.fillRect(0, -2 + bob, 10, 4);

        // Right arm holding leash
        ctx.fillStyle = '#daa06d';
        ctx.fillRect(16, -45 + bob, 6, 16);

        // Leash (dangling from hand into nothing)
        const leashSwing = Math.sin(Date.now() * 0.003) * 3;
        ctx.strokeStyle = '#8d6e63';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(19, -30 + bob);
        ctx.quadraticCurveTo(25 + leashSwing, -15 + bob, 35 + leashSwing, -5 + bob);
        ctx.stroke();

        // Small loop at end of leash (empty collar)
        ctx.beginPath();
        ctx.arc(35 + leashSwing, -5 + bob, 4, 0, Math.PI * 2);
        ctx.stroke();
    },

    drawNPC_pajo(ctx, bob) {
        // Slim guy, gold chain, cigarette, VHS tapes
        // Body - leather jacket
        ctx.fillStyle = '#2c2c2c';
        ctx.fillRect(-9, -52 + bob, 18, 32);

        // Head
        ctx.fillStyle = '#c68642';
        ctx.beginPath();
        ctx.arc(0, -62 + bob, 11, 0, Math.PI * 2);
        ctx.fill();

        // Slicked back hair
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.arc(0, -66 + bob, 12, Math.PI + 0.3, -0.3);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(-4, -63 + bob, 1.5, 0, Math.PI * 2);
        ctx.arc(4, -63 + bob, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Confident smirk
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(2, -58 + bob, 4, 0.1, Math.PI - 0.4);
        ctx.stroke();

        // Gold chain
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, -48 + bob, 8, 0.3, Math.PI - 0.3);
        ctx.stroke();

        // Cigarette in mouth (with glow)
        ctx.fillStyle = '#f5f5dc';
        ctx.fillRect(6, -59 + bob, 14, 2);
        // Cigarette filter
        ctx.fillStyle = '#d4a056';
        ctx.fillRect(6, -59 + bob, 4, 2);
        // Glowing tip
        const glowPulse = Math.sin(Date.now() * 0.004) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(255, 100, 0, ${glowPulse})`;
        ctx.beginPath();
        ctx.arc(20, -58 + bob, 2, 0, Math.PI * 2);
        ctx.fill();

        // Smoke particles
        const smokeTime = Date.now() * 0.002;
        for (let i = 0; i < 3; i++) {
            const sx = 20 + Math.sin(smokeTime + i * 2) * 4;
            const sy = -65 - i * 8 + Math.sin(smokeTime * 0.5 + i) * 2 + bob;
            const salpha = Math.max(0, 0.4 - i * 0.12);
            ctx.fillStyle = `rgba(200, 200, 200, ${salpha})`;
            ctx.beginPath();
            ctx.arc(sx, sy, 3 + i, 0, Math.PI * 2);
            ctx.fill();
        }

        // VHS tapes under left arm
        ctx.fillStyle = '#111';
        ctx.fillRect(-20, -42 + bob, 10, 16);
        ctx.fillStyle = '#222';
        ctx.fillRect(-19, -39 + bob, 8, 3);
        ctx.fillRect(-19, -34 + bob, 8, 3);
        // VHS label
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(-18, -40 + bob, 6, 1.5);
        ctx.fillStyle = '#3498db';
        ctx.fillRect(-18, -35 + bob, 6, 1.5);

        // Legs (slim)
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(-6, -20 + bob, 5, 20);
        ctx.fillRect(1, -20 + bob, 5, 20);

        // Pointy shoes
        ctx.fillStyle = '#333';
        ctx.fillRect(-8, -2 + bob, 9, 3);
        ctx.fillRect(0, -2 + bob, 9, 3);

        // Marlboro Light box peeking from jacket pocket
        ctx.fillStyle = '#c0c0c0';
        ctx.fillRect(5, -50 + bob, 6, 8);
        ctx.fillStyle = '#c0392b';
        ctx.fillRect(5, -50 + bob, 6, 3);
    },

    drawPigeon(player) {
        if (!this.pigeon.active) return;
        const { ctx } = this;
        const p = this.pigeon;

        // Follow player at distance
        const targetX = player.x - 60 * player.facing;
        p.x += (targetX - p.x) * 0.03;
        p.y = this.groundY;
        p.bobOffset += 0.1;

        const px = p.x - this.cameraX;
        const bob = Math.sin(p.bobOffset) * 2;

        ctx.save();
        ctx.translate(px, p.y + bob);

        // Body
        ctx.fillStyle = '#888';
        ctx.beginPath();
        ctx.ellipse(0, -10, 8, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.fillStyle = '#777';
        ctx.beginPath();
        ctx.arc(6, -16, 5, 0, Math.PI * 2);
        ctx.fill();

        // Eye
        ctx.fillStyle = '#ff6600';
        ctx.beginPath();
        ctx.arc(8, -17, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Beak
        ctx.fillStyle = '#ffcc00';
        ctx.beginPath();
        ctx.moveTo(11, -16);
        ctx.lineTo(15, -15);
        ctx.lineTo(11, -14);
        ctx.fill();

        // Legs
        ctx.strokeStyle = '#cc6600';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-2, -4);
        ctx.lineTo(-3, 0);
        ctx.moveTo(2, -4);
        ctx.lineTo(3, 0);
        ctx.stroke();

        // Facepalm when embarrassment is high
        if (PlayerStats.embarrassment >= 5) {
            // Wing over face
            ctx.fillStyle = '#999';
            ctx.beginPath();
            ctx.ellipse(7, -16, 5, 4, -0.3, 0, Math.PI * 2);
            ctx.fill();
            // Thought bubble
            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            ctx.beginPath();
            ctx.arc(18, -28, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(25, -35, 15, 8, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#333';
            ctx.font = '8px Courier New';
            ctx.fillText('Oida...', 14, -33);
        }

        ctx.restore();
    },

    drawNightOverlay() {
        const { ctx, width, height, time } = this;
        const alpha = Math.max(0, 0.15 - time * 0.15);
        if (alpha > 0) {
            ctx.fillStyle = `rgba(0, 0, 30, ${alpha})`;
            ctx.fillRect(0, 0, width, height);
        }
    },

    drawInteractionPrompt(player, npcs) {
        const { ctx } = this;
        const pulseAlpha = Math.sin(Date.now() * 0.005) * 0.3 + 0.7;

        // Slot machine prompt
        if (Math.abs(player.x - this.slotMachineX) < 60) {
            const smx = this.slotMachineX - this.cameraX;
            ctx.save();
            ctx.fillStyle = 'rgba(255, 215, 0, 0.9)';
            ctx.font = 'bold 14px Courier New';
            ctx.textAlign = 'center';
            ctx.globalAlpha = pulseAlpha;
            ctx.fillText('[E] Book of Ra', smx, this.groundY - 100);
            ctx.globalAlpha = 1;
            ctx.textAlign = 'left';
            ctx.restore();
        }

        Object.entries(npcs).forEach(([key, npc]) => {
            if (isNearNPC(player.x, npc)) {
                const nx = npc.x - this.cameraX;
                const promptY = this.groundY - npc.height - 45;

                ctx.save();
                ctx.fillStyle = 'rgba(255, 204, 0, 0.9)';
                ctx.font = 'bold 14px Courier New';
                ctx.textAlign = 'center';

                ctx.globalAlpha = pulseAlpha;
                ctx.fillText('[E] Ansprechen', nx, promptY);
                ctx.globalAlpha = 1;
                ctx.textAlign = 'left';
                ctx.restore();
            }
        });
    },

    // Screen shake effect
    shake() {
        document.body.classList.add('shaking');
        setTimeout(() => document.body.classList.remove('shaking'), 400);
    }
};
