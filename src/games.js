export const GameEngine = {
    intervals: [],
    timeouts: [],
    animations: [],
    running: false,
    canvas: null,
    ctx: null,
    activeGame: null,
    containerId: null,
    currentGameData: {
        score: 0,
        state: {}
    },
    deaths: {
        snake: 0,
        pong: 0,
        jump: 0
    },
    highScores: JSON.parse(localStorage.getItem('highScores') || '{}'),

    saveHighScore(gameId, score) {
        if (!this.highScores[gameId] || score > this.highScores[gameId]) {
            this.highScores[gameId] = score;
            localStorage.setItem('highScores', JSON.stringify(this.highScores));
            return true;
        }
        return false;
    },

    getCurrentData() {
        return {
            gameId: this.activeGame,
            score: this.currentGameData.score,
            state: this.currentGameData.state
        };
    },

    loadData(gameId, data) {
        if (!data) return;
        if (gameId === 'clicker') {
            // Special handling for clicker state
            this.clickerState = data.state;
        }
        // For other games, we mostly just care about high scores which are already handled
    },

    drawUI(gameId, score) {
        this.ctx.save();
        this.ctx.shadowBlur = 0;
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 18px Inter';
        this.ctx.textAlign = 'right';
        this.ctx.fillText('SCORE: ' + score, 780, 35);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        this.ctx.font = '12px Inter';
        this.ctx.fillText('BEST: ' + (this.highScores[gameId] || 0), 780, 55);
        this.drawDeaths(gameId);
        this.ctx.restore();
    },
    init(containerId, gameId) {
        this.stop();
        this.running = true;
        this.activeGame = gameId;
        this.containerId = containerId;
        this.currentGameData = { score: 0, state: {} };
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '<canvas id="gameCanvas" width="800" height="450" class="w-full h-full bg-black rounded-xl"></canvas>';
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');

        if (this[gameId]) {
            this[gameId]();
        }
    },

    stop() {
        this.running = false;
        this.intervals.forEach(id => clearInterval(id));
        this.timeouts.forEach(id => clearTimeout(id));
        this.animations.forEach(id => cancelAnimationFrame(id));
        this.intervals = [];
        this.timeouts = [];
        this.animations = [];

        window.onkeydown = null;
        window.onkeyup = null;
        window.onmousemove = null;
        window.onclick = null;

        const overlay = document.getElementById('game-over-overlay');
        if (overlay) overlay.remove();
        
        if (this.containerId) {
            const container = document.getElementById(this.containerId);
            if (container) container.innerHTML = '';
        }
        
        this.activeGame = null;
        this.containerId = null;
    },

    drawDeaths(gameId) {
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.font = '12px Inter';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('DEATHS: ' + (this.deaths[gameId] || 0), 20, 30);
        this.ctx.restore();
    },

    showGameOver(gameId, score, isNewBest) {
        this.stop();
        const container = document.getElementById('player-container');
        if (!container) return;

        const existing = document.getElementById('game-over-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'game-over-overlay';
        overlay.className = 'absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center z-50 transition-all duration-500 opacity-0';
        overlay.innerHTML = `
            <div class="text-center space-y-8 transform scale-90 transition-all duration-500" id="game-over-content">
                <div class="space-y-2">
                    <h2 class="text-7xl font-display font-black tracking-tighter text-white uppercase italic leading-none">GAME OVER</h2>
                    <p class="text-blue-500 font-bold tracking-[0.3em] text-xs uppercase">Better luck next time</p>
                </div>
                
                <div class="flex gap-12 justify-center items-center">
                    <div class="text-center">
                        <p class="text-white/20 uppercase tracking-widest text-[10px] font-bold mb-1">Score</p>
                        <p class="text-5xl font-display font-bold text-white">${score}</p>
                    </div>
                    <div class="w-px h-12 bg-white/10"></div>
                    <div class="text-center">
                        <p class="text-white/20 uppercase tracking-widest text-[10px] font-bold mb-1">Best</p>
                        <p class="text-5xl font-display font-bold text-white/40">${this.highScores[gameId] || 0}</p>
                    </div>
                </div>

                ${isNewBest ? `
                    <div class="bg-green-500/20 border border-green-500/50 rounded-full px-6 py-2 inline-block animate-bounce">
                        <span class="text-green-400 text-xs font-bold uppercase tracking-widest">New High Score!</span>
                    </div>
                ` : ''}

                <div class="pt-4">
                    <button onclick="GameEngine.init('player-container', '${gameId}')" 
                            class="group relative px-12 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full transition-all hover:scale-110 active:scale-95 neon-glow uppercase tracking-widest text-sm overflow-hidden">
                        <span class="relative z-10 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                            Respawn
                        </span>
                        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    </button>
                </div>
            </div>
        `;
        
        container.appendChild(overlay);
        
        setTimeout(() => {
            overlay.classList.remove('opacity-0');
            const content = document.getElementById('game-over-content');
            if (content) content.classList.remove('scale-90');
        }, 10);
    },

    drawApple(x, y, size) {
        this.ctx.save();
        this.ctx.translate(x + size/2, y + size/2);
        // Body
        this.drawGlow('#ef4444', 15);
        this.ctx.fillStyle = '#ef4444';
        this.ctx.beginPath();
        this.ctx.arc(0, 2, size/2.5, 0, Math.PI * 2);
        this.ctx.fill();
        // Highlight
        this.ctx.fillStyle = 'rgba(255,255,255,0.4)';
        this.ctx.beginPath();
        this.ctx.arc(-size/6, -size/6 + 2, size/10, 0, Math.PI * 2);
        this.ctx.fill();
        // Stem
        this.ctx.shadowBlur = 0;
        this.ctx.strokeStyle = '#78350f';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(0, -size/2.5 + 2);
        this.ctx.quadraticCurveTo(2, -size/2 - 5, 5, -size/2 - 3);
        this.ctx.stroke();
        // Leaf
        this.ctx.fillStyle = '#22c55e';
        this.ctx.beginPath();
        this.ctx.ellipse(3, -size/2, size/6, size/10, Math.PI/4, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
    },

    drawMole(x, y, size, type) {
        this.ctx.save();
        this.ctx.translate(x, y);
        
        // Dirt mound
        this.ctx.fillStyle = '#451a03';
        this.ctx.beginPath();
        this.ctx.ellipse(0, size * 0.8, size * 1.2, size * 0.4, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Body
        const color = type === 'gold' ? '#fbbf24' : (type === 'bomb' ? '#1f2937' : '#78350f');
        this.drawGlow(color, 10);
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, size, Math.PI, 0);
        this.ctx.lineTo(size, size);
        this.ctx.lineTo(-size, size);
        this.ctx.fill();

        if (type === 'bomb') {
            this.ctx.fillStyle = '#ef4444';
            this.ctx.beginPath();
            this.ctx.arc(0, -size * 0.5, size * 0.3, 0, Math.PI * 2);
            this.ctx.fill();
            // Fuse
            this.ctx.strokeStyle = 'white';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(0, -size * 0.8);
            this.ctx.lineTo(5, -size * 1.2);
            this.ctx.stroke();
        } else {
            // Eyes
            this.ctx.fillStyle = 'black';
            this.ctx.beginPath();
            this.ctx.arc(-size * 0.3, -size * 0.4, 2, 0, Math.PI * 2);
            this.ctx.arc(size * 0.3, -size * 0.4, 2, 0, Math.PI * 2);
            this.ctx.fill();
            // Nose
            this.ctx.fillStyle = '#f472b6';
            this.ctx.beginPath();
            this.ctx.arc(0, -size * 0.1, 4, 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.restore();
    },

    drawCookie(x, y, size, scale = 1) {
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.scale(scale, scale);
        
        // Cookie base
        this.drawGlow('#92400e', 20);
        this.ctx.fillStyle = '#d97706';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, size, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Chips
        this.ctx.shadowBlur = 0;
        this.ctx.fillStyle = '#451a03';
        const chips = [[-15, -10], [10, -15], [0, 5], [-10, 20], [20, 10], [15, -5]];
        chips.forEach(c => {
            this.ctx.beginPath();
            this.ctx.arc(c[0], c[1], 4, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.restore();
    },

    drawGlow(color, blur = 15) {
        this.ctx.shadowBlur = blur;
        this.ctx.shadowColor = color;
    },

    // --- NEON SNAKE ---
    snake() {
        let snake = [{x: 10, y: 10}, {x: 9, y: 10}, {x: 8, y: 10}];
        let food = {x: 20, y: 10};
        let dx = 1, dy = 0;
        let score = 0;
        let speed = 100;
        let lastUpdate = 0;

        window.onkeydown = (e) => {
            if ((e.key === 'ArrowUp' || e.key === 'w') && dy === 0) { dx = 0; dy = -1; }
            if ((e.key === 'ArrowDown' || e.key === 's') && dy === 0) { dx = 0; dy = 1; }
            if ((e.key === 'ArrowLeft' || e.key === 'a') && dx === 0) { dx = -1; dy = 0; }
            if ((e.key === 'ArrowRight' || e.key === 'd') && dx === 0) { dx = 1; dy = 0; }
        };

        const loop = (time) => {
            if (!this.running) return;
            if (time - lastUpdate > speed) {
                lastUpdate = time;
                const head = {x: snake[0].x + dx, y: snake[0].y + dy};
                
                if (head.x < 0 || head.x >= 40 || head.y < 0 || head.y >= 22.5 || snake.some(s => s.x === head.x && s.y === head.y)) {
                    this.deaths.snake++;
                    const isNewBest = this.saveHighScore('snake', score);
                    this.showGameOver('snake', score, isNewBest);
                    return;
                }

                snake.unshift(head);
                if (head.x === food.x && head.y === Math.floor(food.y)) {
                    score += 10;
                    this.currentGameData.score = score;
                    speed = Math.max(50, 100 - Math.floor(score / 50) * 5);
                    food = {x: Math.floor(Math.random() * 40), y: Math.floor(Math.random() * 22)};
                } else {
                    snake.pop();
                }
            }

            this.ctx.fillStyle = '#050505';
            this.ctx.fillRect(0, 0, 800, 450);

            // Draw Grid
            this.ctx.strokeStyle = '#111';
            this.ctx.lineWidth = 1;
            for(let i=0; i<800; i+=20) { this.ctx.beginPath(); this.ctx.moveTo(i,0); this.ctx.lineTo(i,450); this.ctx.stroke(); }
            for(let i=0; i<450; i+=20) { this.ctx.beginPath(); this.ctx.moveTo(0,i); this.ctx.lineTo(800,i); this.ctx.stroke(); }

            // Draw Snake
            this.drawGlow('#3b82f6', 20);
            this.ctx.fillStyle = '#3b82f6';
            snake.forEach((s, i) => {
                const alpha = 1 - (i / snake.length) * 0.6;
                this.ctx.globalAlpha = alpha;
                const size = i === 0 ? 18 : 16;
                const offset = (20 - size) / 2;
                this.ctx.fillRect(s.x * 20 + offset, s.y * 20 + offset, size, size);
                
                // Eyes for head
                if (i === 0) {
                    this.ctx.globalAlpha = 1;
                    this.ctx.fillStyle = 'white';
                    if (dx === 1) {
                        this.ctx.fillRect(s.x * 20 + 12, s.y * 20 + 4, 3, 3);
                        this.ctx.fillRect(s.x * 20 + 12, s.y * 20 + 12, 3, 3);
                    } else if (dx === -1) {
                        this.ctx.fillRect(s.x * 20 + 4, s.y * 20 + 4, 3, 3);
                        this.ctx.fillRect(s.x * 20 + 4, s.y * 20 + 12, 3, 3);
                    } else if (dy === 1) {
                        this.ctx.fillRect(s.x * 20 + 4, s.y * 20 + 12, 3, 3);
                        this.ctx.fillRect(s.x * 20 + 12, s.y * 20 + 12, 3, 3);
                    } else {
                        this.ctx.fillRect(s.x * 20 + 4, s.y * 20 + 4, 3, 3);
                        this.ctx.fillRect(s.x * 20 + 12, s.y * 20 + 4, 3, 3);
                    }
                }
            });
            this.ctx.globalAlpha = 1;

            // Draw Food (Apple)
            this.drawApple(food.x * 20 + 10, food.y * 20 + 10, 8);

            this.drawUI('snake', score);

            this.animations.push(requestAnimationFrame(loop));
        };
        this.animations.push(requestAnimationFrame(loop));
    },

    // --- CYBER PONG ---
    pong() {
        let p1 = 175, p2 = 175, bx = 400, by = 225, bdx = 5, bdy = 5;
        let s1 = 0, s2 = 0;
        let shake = 0;
        const keys = {};

        window.onkeydown = (e) => keys[e.key] = true;
        window.onkeyup = (e) => keys[e.key] = false;

        const loop = () => {
            if (!this.running) return;

            // Smooth movement for P1
            if (keys['w'] || keys['ArrowUp']) p1 = Math.max(0, p1 - 7);
            if (keys['s'] || keys['ArrowDown']) p1 = Math.min(350, p1 + 7);

            // Simple AI for P2
            const target = by - 50;
            if (p2 < target) p2 += 4;
            else if (p2 > target) p2 -= 4;
            p2 = Math.max(0, Math.min(350, p2));

            bx += bdx; by += bdy;
            if (by < 10 || by > 440) { bdy *= -1; shake = 5; }
            
            if (bx < 30 && by > p1 && by < p1 + 100) { 
                bdx = Math.abs(bdx) * 1.05; 
                bdy += (by - (p1 + 50)) * 0.1;
                shake = 10;
            }
            if (bx > 770 && by > p2 && by < p2 + 100) { 
                bdx = -Math.abs(bdx) * 1.05; 
                bdy += (by - (p2 + 50)) * 0.1;
                shake = 10;
            }

            if (bx < 0) { this.deaths.pong++; s2++; bx = 400; bdx = 5; bdy = 5; }
            if (bx > 800) { s1++; this.currentGameData.score = s1; bx = 400; bdx = -5; bdy = 5; }

            if (s1 >= 5 || s2 >= 5) {
                const isNewBest = this.saveHighScore('pong', s1);
                this.showGameOver('pong', s1, isNewBest);
                return;
            }

            this.ctx.save();
            if (shake > 0) {
                this.ctx.translate(Math.random()*shake - shake/2, Math.random()*shake - shake/2);
                shake--;
            }

            this.ctx.fillStyle = '#050505';
            this.ctx.fillRect(0, 0, 800, 450);

            this.ctx.strokeStyle = 'rgba(255,255,255,0.05)';
            this.ctx.setLineDash([10, 10]);
            this.ctx.beginPath(); this.ctx.moveTo(400, 0); this.ctx.lineTo(400, 450); this.ctx.stroke();
            this.ctx.setLineDash([]);

            this.drawGlow('#3b82f6', 20);
            this.ctx.fillStyle = '#3b82f6';
            this.ctx.beginPath();
            this.ctx.roundRect(15, p1, 10, 100, 5);
            this.ctx.fill();
            this.ctx.fillStyle = 'rgba(255,255,255,0.2)';
            this.ctx.fillRect(18, p1 + 10, 4, 80);
            
            this.drawGlow('#ef4444', 20);
            this.ctx.fillStyle = '#ef4444';
            this.ctx.beginPath();
            this.ctx.roundRect(775, p2, 10, 100, 5);
            this.ctx.fill();
            this.ctx.fillStyle = 'rgba(255,255,255,0.2)';
            this.ctx.fillRect(778, p2 + 10, 4, 80);

            // Ball with trail
            this.drawGlow('white', 15);
            this.ctx.fillStyle = 'white';
            this.ctx.beginPath(); this.ctx.arc(bx, by, 8, 0, Math.PI*2); this.ctx.fill();
            this.ctx.globalAlpha = 0.3;
            this.ctx.beginPath(); this.ctx.arc(bx - bdx*2, by - bdy*2, 6, 0, Math.PI*2); this.ctx.fill();
            this.ctx.globalAlpha = 1;

            this.ctx.shadowBlur = 0;
            this.ctx.font = 'bold 60px Outfit';
            this.ctx.textAlign = 'center';
            this.ctx.fillStyle = 'rgba(255,255,255,0.1)';
            this.ctx.fillText(s1, 300, 240);
            this.ctx.fillText(s2, 500, 240);
            
            this.drawUI('pong', s1);
            this.ctx.restore();

            this.animations.push(requestAnimationFrame(loop));
        };
        this.animations.push(requestAnimationFrame(loop));
    },

    // --- BRICK BREAKER ---
    breakout() {
        let x = 400, y = 400, dx = 5, dy = -5, px = 350;
        let bricks = [];
        const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6'];
        for(let r=0; r<5; r++) {
            for(let c=0; c<10; c++) {
                bricks.push({x: c*78 + 15, y: r*25 + 60, s: 1, c: colors[r % colors.length]});
            }
        }

        window.onmousemove = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            px = (e.clientX - rect.left) * (800 / rect.width) - 50;
            px = Math.max(0, Math.min(700, px));
        };

        const loop = () => {
            if (!this.running) return;
            x += dx; y += dy;
            if (x < 10 || x > 790) dx *= -1;
            if (y < 10) dy *= -1;
            if (y > 425 && x > px && x < px + 100) {
                dy = -Math.abs(dy);
                dx = (x - (px + 50)) * 0.2;
            }
            if (y > 460) { 
                const score = bricks.filter(b => !b.s).length * 10;
                const isNewBest = this.saveHighScore('breakout', score);
                this.showGameOver('breakout', score, isNewBest);
                return; 
            }

            bricks.forEach(b => {
                if (b.s && x > b.x && x < b.x + 70 && y > b.y && y < b.y + 20) {
                    dy *= -1; b.s = 0;
                    this.currentGameData.score = bricks.filter(br => !br.s).length * 10;
                }
            });

            this.ctx.fillStyle = '#050505';
            this.ctx.fillRect(0, 0, 800, 450);

            this.drawGlow('#3b82f6', 20);
            this.ctx.fillStyle = '#3b82f6';
            this.ctx.beginPath();
            this.ctx.roundRect(px, 435, 100, 10, 5);
            this.ctx.fill();
            this.ctx.fillStyle = 'rgba(255,255,255,0.3)';
            this.ctx.fillRect(px + 10, 437, 80, 2);

            this.drawGlow('white', 15);
            this.ctx.fillStyle = 'white';
            this.ctx.beginPath(); this.ctx.arc(x, y, 8, 0, Math.PI*2); this.ctx.fill();
            this.ctx.fillStyle = 'rgba(255,255,255,0.5)';
            this.ctx.beginPath(); this.ctx.arc(x - 2, y - 2, 3, 0, Math.PI*2); this.ctx.fill();

            bricks.forEach(b => {
                if(b.s) {
                    this.drawGlow(b.c, 10);
                    this.ctx.fillStyle = b.c;
                    this.ctx.beginPath();
                    this.ctx.roundRect(b.x, b.y, 70, 20, 4);
                    this.ctx.fill();
                    // Shine
                    this.ctx.fillStyle = 'rgba(255,255,255,0.2)';
                    this.ctx.fillRect(b.x + 5, b.y + 5, 60, 2);
                }
            });

            this.drawUI('breakout', bricks.filter(b => !b.s).length * 10);

            if (bricks.every(b => !b.s)) { 
                const score = bricks.length * 10;
                const isNewBest = this.saveHighScore('breakout', score);
                this.showGameOver('breakout', score, isNewBest);
                return; 
            }

            this.animations.push(requestAnimationFrame(loop));
        };
        this.animations.push(requestAnimationFrame(loop));
    },

    // --- MEMORY MATCH ---
    memory() {
        const canvas = document.getElementById('gameCanvas');
        if (!canvas || !canvas.parentElement) return;
        const container = canvas.parentElement;
        const symbols = ['🍎', '🍕', '🚗', '🎸', '⚽', '🔑', '💎', '💡', '📱', '⌚', '📷', '🎁'];
        let cards = [...symbols, ...symbols].sort(() => Math.random() - 0.5);
        let flipped = [], matched = [], moves = 0;

        container.innerHTML = `
            <div class="bg-black rounded-xl h-full p-6 flex flex-col">
                <div class="flex justify-between mb-4 text-sm font-bold tracking-widest text-white/40">
                    <span>MOVES: <span id="moves-count">0</span></span>
                    <span>MATCHED: <span id="match-count">0</span>/12</span>
                </div>
                <div class="grid grid-cols-6 gap-3 flex-1">
                    ${cards.map((s, i) => `
                        <div id="card-${i}" onclick="GameEngine.flipCard(${i}, '${s}')" 
                             class="bg-white/5 rounded-xl flex items-center justify-center text-3xl cursor-pointer hover:bg-white/10 transition-all duration-300 transform preserve-3d border border-white/5 shadow-inner">
                            <div class="card-front text-white/20 font-black">?</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        this.flipCard = (i, s) => {
            if (flipped.length === 2 || matched.includes(i) || flipped.some(f => f.i === i)) return;
            
            const el = document.getElementById(`card-${i}`);
            el.innerHTML = s;
            el.classList.add('bg-blue-600/20', 'scale-105', 'rotate-y-180');
            flipped.push({i, s});

            if (flipped.length === 2) {
                moves++;
                document.getElementById('moves-count').innerText = moves;
                if (flipped[0].s === flipped[1].s) {
                    matched.push(flipped[0].i, flipped[1].i);
                    document.getElementById('match-count').innerText = matched.length / 2;
                    const score = Math.max(0, 1000 - moves * 10);
                    this.currentGameData.score = score;
                    const f1 = document.getElementById(`card-${flipped[0].i}`);
                    const f2 = document.getElementById(`card-${flipped[1].i}`);
                    f1.classList.replace('bg-blue-600/20', 'bg-green-600/20');
                    f2.classList.replace('bg-blue-600/20', 'bg-green-600/20');
                    flipped = [];
                    const isNewBest = this.saveHighScore('memory', score);
                    if (matched.length === cards.length) {
                        this.timeouts.push(setTimeout(() => this.showGameOver('memory', score, isNewBest), 500));
                    }
                } else {
                    this.timeouts.push(setTimeout(() => {
                        const f1 = document.getElementById(`card-${flipped[0].i}`);
                        const f2 = document.getElementById(`card-${flipped[1].i}`);
                        if (f1 && f2) {
                            f1.innerHTML = '?' ; f1.classList.remove('bg-blue-600/20', 'scale-105');
                            f2.innerHTML = '?' ; f2.classList.remove('bg-blue-600/20', 'scale-105');
                        }
                        flipped = [];
                    }, 800));
                }
            }
        };
    },

    // --- MOLE HUNTER ---
    whack() {
        const canvas = document.getElementById('gameCanvas');
        if (!canvas || !canvas.parentElement) return;
        const container = canvas.parentElement;
        let score = 0, timeLeft = 30;
        
        container.innerHTML = `
            <div class="bg-black rounded-xl h-full p-8 flex flex-col items-center justify-center relative overflow-hidden">
                <div class="absolute top-6 left-8 text-sm font-bold text-white/40">TIME: <span id="mole-time">30</span>s</div>
                <div class="absolute top-6 right-8 text-sm font-bold text-white/40">SCORE: <span id="mole-score">0</span></div>
                <div class="grid grid-cols-3 gap-6">
                    ${[...Array(9)].map((_, i) => `
                        <div id="hole-${i}" onclick="GameEngine.hitMole(${i})" 
                             class="w-24 h-24 flex items-center justify-center cursor-pointer relative">
                             <canvas id="mole-canvas-${i}" width="96" height="96" class="w-full h-full"></canvas>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        const renderMoles = () => {
            for(let i=0; i<9; i++) {
                const c = document.getElementById(`mole-canvas-${i}`);
                if (!c) continue;
                const ctx = c.getContext('2d');
                ctx.clearRect(0, 0, 96, 96);
                if (i === activeHole) {
                    const oldCtx = this.ctx;
                    this.ctx = ctx;
                    this.drawMole(48, 48, 30, moleType);
                    this.ctx = oldCtx;
                } else {
                    // Just dirt
                    ctx.fillStyle = '#451a03';
                    ctx.beginPath();
                    ctx.ellipse(48, 70, 35, 12, 0, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        };

        let activeHole = -1, moleType = 'normal';
        this.intervals.push(setInterval(() => {
            if (!this.running) return;
            timeLeft--;
            const timeEl = document.getElementById('mole-time');
            if (timeEl) timeEl.innerText = timeLeft;
            if (timeLeft <= 0) {
                const isNewBest = this.saveHighScore('whack', score);
                this.showGameOver('whack', score, isNewBest);
            }
        }, 1000));

        const spawn = () => {
            if (!this.running) return;
            activeHole = Math.floor(Math.random() * 9);
            const rand = Math.random();
            moleType = rand > 0.9 ? 'gold' : (rand > 0.7 ? 'bomb' : 'normal');
            renderMoles();
        };

        this.intervals.push(setInterval(spawn, 800));
        renderMoles();

        this.hitMole = (i) => {
            if (i === activeHole) {
                if (moleType === 'gold') score += 50;
                else if (moleType === 'bomb') score = Math.max(0, score - 30);
                else score += 10;
                
                this.currentGameData.score = score;
                const scoreEl = document.getElementById('mole-score');
                if (scoreEl) scoreEl.innerText = score;
                
                const hole = document.getElementById(`hole-${i}`);
                if (hole) hole.innerHTML = `<div class="text-2xl">${moleType === 'bomb' ? '💥' : '✨'}</div>`;
                activeHole = -1;
            }
        };
    },

    // --- COOKIE CLICKER ---
    clicker() {
        const canvas = document.getElementById('gameCanvas');
        if (!canvas || !canvas.parentElement) return;
        const container = canvas.parentElement;
        
        let cookies = 0, autoRate = 0, multiplier = 1;
        
        // Load state if available
        if (this.clickerState) {
            cookies = this.clickerState.cookies || 0;
            autoRate = this.clickerState.autoRate || 0;
            multiplier = this.clickerState.multiplier || 1;
            this.clickerState = null; // Clear after use
        }

        container.innerHTML = `
            <div class="bg-black rounded-xl h-full flex p-8 gap-8">
                <div class="flex-1 flex flex-col items-center justify-center space-y-6">
                    <div class="text-center">
                        <div class="text-4xl font-black font-display tracking-tighter"><span id="cookie-count">0</span></div>
                        <div class="text-xs text-white/40 uppercase tracking-widest">Cookies Collected</div>
                    </div>
                    <div class="relative">
                        <canvas id="cookie-canvas" width="240" height="240" onclick="GameEngine.addCookie()" 
                                class="cursor-pointer hover:scale-110 transition-all active:scale-95"></canvas>
                        <div id="floating-texts" class="absolute inset-0 pointer-events-none"></div>
                    </div>
                    <div class="text-sm text-white/40 italic" id="rate-display">0 cookies/sec</div>
                </div>
                <div class="w-64 glass rounded-2xl p-4 flex flex-col gap-3">
                    <h4 class="text-xs font-bold text-white/40 uppercase mb-2">Upgrades</h4>
                    <button onclick="GameEngine.buyUpgrade('auto')" class="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-left transition-all border border-white/5">
                        <div class="font-bold text-sm">Auto-Clicker</div>
                        <div class="text-[10px] text-white/40">Cost: <span id="cost-auto">50</span> | +1/s</div>
                    </button>
                    <button onclick="GameEngine.buyUpgrade('mult')" class="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-left transition-all border border-white/5">
                        <div class="font-bold text-sm">Multiplier</div>
                        <div class="text-[10px] text-white/40">Cost: <span id="cost-mult">100</span> | x2 Click</div>
                    </button>
                </div>
            </div>
        `;

        const cCanvas = document.getElementById('cookie-canvas');
        const cCtx = cCanvas.getContext('2d');
        const renderCookie = (scale = 1) => {
            cCtx.clearRect(0, 0, 240, 240);
            const oldCtx = this.ctx;
            this.ctx = cCtx;
            this.drawCookie(120, 120, 80, scale);
            this.ctx = oldCtx;
        };

        this.addCookie = () => {
            cookies += multiplier;
            renderCookie(0.9);
            setTimeout(() => renderCookie(1), 100);
            
            // Floating text
            const ft = document.createElement('div');
            ft.className = 'absolute text-white font-bold pointer-events-none animate-bounce';
            ft.style.left = Math.random() * 100 + 70 + 'px';
            ft.style.top = '100px';
            ft.innerText = '+' + multiplier;
            document.getElementById('floating-texts').appendChild(ft);
            setTimeout(() => ft.remove(), 1000);

            this.updateDisplay();
        };

        this.buyUpgrade = (type) => {
            if (type === 'auto' && cookies >= 50) {
                cookies -= 50; autoRate++;
            } else if (type === 'mult' && cookies >= 100) {
                cookies -= 100; multiplier *= 2;
            }
            this.updateDisplay();
        };

        this.updateDisplay = () => {
            this.saveHighScore('clicker', Math.floor(cookies));
            this.currentGameData.score = Math.floor(cookies);
            this.currentGameData.state = { cookies, autoRate, multiplier };
            
            const countEl = document.getElementById('cookie-count');
            if (countEl) countEl.innerText = Math.floor(cookies);
            const rateEl = document.getElementById('rate-display');
            if (rateEl) rateEl.innerText = `${autoRate} cookies/sec`;
        };

        renderCookie();
        this.intervals.push(setInterval(() => {
            if (!this.running) return;
            cookies += autoRate / 10;
            this.updateDisplay();
        }, 100));
    },

    // --- SKY JUMPER ---
    jump() {
        let px = 400, py = 400, pdy = 0;
        let platforms = [];
        let score = 0, cameraY = 0;
        
        for(let i=0; i<8; i++) {
            platforms.push({
                x: Math.random()*700, 
                y: i*70 + 50, 
                type: Math.random() > 0.8 ? 'spring' : (Math.random() > 0.7 ? 'moving' : 'normal'),
                dir: 1
            });
        }

        const keys = {};
        window.onkeydown = (e) => keys[e.key] = true;
        window.onkeyup = (e) => keys[e.key] = false;

        const loop = () => {
            if (!this.running) return;

            // Smooth movement
            if (keys['ArrowLeft'] || keys['a']) px = Math.max(0, px - 8);
            if (keys['ArrowRight'] || keys['d']) px = Math.min(770, px + 8);

            pdy += 0.4;
            py += pdy;

            platforms.forEach(p => {
                if (p.type === 'moving') {
                    p.x += p.dir * 2;
                    if (p.x < 0 || p.x > 700) p.dir *= -1;
                }

                if (pdy > 0 && px + 30 > p.x && px < p.x + 100 && py + 40 > p.y && py + 40 < p.y + 15) {
                    pdy = p.type === 'spring' ? -22 : -12;
                    if (p.type === 'spring') score += 50;
                    else score += 10;
                    this.currentGameData.score = score;
                }
            });

            if (py > 450) { 
                this.deaths.jump++;
                const isNewBest = this.saveHighScore('jump', score);
                this.showGameOver('jump', score, isNewBest);
                return; 
            }

            if (py < 200) {
                const diff = 200 - py;
                py = 200;
                platforms.forEach(p => {
                    p.y += diff;
                    if (p.y > 450) { 
                        p.y = 0; 
                        p.x = Math.random()*700; 
                        p.type = Math.random() > 0.8 ? 'spring' : (Math.random() > 0.7 ? 'moving' : 'normal');
                    }
                });
            }

            this.ctx.fillStyle = '#050505';
            this.ctx.fillRect(0, 0, 800, 450);

            // Draw Player (Astronaut)
            this.drawGlow('#3b82f6', 15);
            this.ctx.fillStyle = '#f8fafc';
            // Body
            this.ctx.beginPath(); this.ctx.roundRect(px, py, 30, 40, 8); this.ctx.fill();
            // Visor
            this.ctx.fillStyle = '#1e293b';
            this.ctx.beginPath(); this.ctx.roundRect(px + 5, py + 5, 20, 15, 4); this.ctx.fill();
            // Backpack
            this.ctx.fillStyle = '#cbd5e1';
            this.ctx.beginPath(); this.ctx.roundRect(px - 5, py + 10, 5, 20, 2); this.ctx.fill();

            // Draw Platforms (Space Rocks)
            platforms.forEach(p => {
                const color = p.type === 'spring' ? '#f59e0b' : (p.type === 'moving' ? '#ef4444' : '#10b981');
                this.drawGlow(color, 15);
                this.ctx.fillStyle = color;
                this.ctx.beginPath();
                this.ctx.roundRect(p.x, p.y, 100, 15, 5);
                this.ctx.fill();
                
                // Rock texture
                this.ctx.fillStyle = 'rgba(0,0,0,0.2)';
                this.ctx.beginPath(); this.ctx.arc(p.x + 10, p.y + 7, 3, 0, Math.PI*2); this.ctx.fill();
                this.ctx.beginPath(); this.ctx.arc(p.x + 85, p.y + 5, 4, 0, Math.PI*2); this.ctx.fill();

                if (p.type === 'spring') {
                    this.ctx.fillStyle = 'white';
                    this.ctx.beginPath();
                    this.ctx.roundRect(p.x + 40, p.y - 5, 20, 5, 2);
                    this.ctx.fill();
                }
            });

            this.drawUI('jump', score);

            this.animations.push(requestAnimationFrame(loop));
        };
        this.animations.push(requestAnimationFrame(loop));
    }
};

window.GameEngine = GameEngine;
