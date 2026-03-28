const GameEngine = {
    currentInterval: null,
    canvas: null,
    ctx: null,
    deaths: {
        snake: 0,
        pong: 0,
        jump: 0
    },

    init(containerId, gameId) {
        this.stop();
        const container = document.getElementById(containerId);
        container.innerHTML = '<canvas id="gameCanvas" width="800" height="450" class="w-full h-full bg-black rounded-xl"></canvas>';
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        if (this[gameId]) {
            this[gameId]();
        }
    },

    stop() {
        if (this.currentInterval) {
            clearInterval(this.currentInterval);
            this.currentInterval = null;
        }
        window.onkeydown = null;
    },

    drawDeaths(gameId) {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.font = '14px Inter';
        this.ctx.fillText('Deaths: ' + this.deaths[gameId], 10, 25);
    },

    snake() {
        let snake = [{x: 10, y: 10}];
        let food = {x: 15, y: 15};
        let dx = 1, dy = 0;
        let score = 0;

        window.onkeydown = (e) => {
            if (e.key === 'ArrowUp' && dy === 0) { dx = 0; dy = -1; }
            if (e.key === 'ArrowDown' && dy === 0) { dx = 0; dy = 1; }
            if (e.key === 'ArrowLeft' && dx === 0) { dx = -1; dy = 0; }
            if (e.key === 'ArrowRight' && dx === 0) { dx = 1; dy = 0; }
        };

        this.currentInterval = setInterval(() => {
            const head = {x: snake[0].x + dx, y: snake[0].y + dy};
            
            if (head.x < 0 || head.x >= 40 || head.y < 0 || head.y >= 22 || snake.some(s => s.x === head.x && s.y === head.y)) {
                this.deaths.snake++;
                this.stop();
                alert('Game Over! Score: ' + score + '\nTotal Deaths: ' + this.deaths.snake);
                return;
            }

            snake.unshift(head);
            if (head.x === food.x && head.y === food.y) {
                score += 10;
                food = {x: Math.floor(Math.random() * 40), y: Math.floor(Math.random() * 22)};
            } else {
                snake.pop();
            }

            this.ctx.fillStyle = 'black';
            this.ctx.fillRect(0, 0, 800, 450);
            this.ctx.fillStyle = '#3b82f6';
            snake.forEach(s => this.ctx.fillRect(s.x * 20, s.y * 20, 18, 18));
            this.ctx.fillStyle = '#ef4444';
            this.ctx.fillRect(food.x * 20, food.y * 20, 18, 18);
            this.drawDeaths('snake');
        }, 100);
    },

    pong() {
        let p1 = 175, p2 = 175, bx = 400, by = 225, bdx = 5, bdy = 5;
        let s1 = 0, s2 = 0;

        window.onkeydown = (e) => {
            if (e.key === 'w') p1 -= 20;
            if (e.key === 's') p1 += 20;
            if (e.key === 'ArrowUp') p2 -= 20;
            if (e.key === 'ArrowDown') p2 += 20;
        };

        this.currentInterval = setInterval(() => {
            bx += bdx; by += bdy;
            if (by < 0 || by > 440) bdy *= -1;
            
            if (bx < 20 && by > p1 && by < p1 + 100) bdx *= -1.1;
            if (bx > 770 && by > p2 && by < p2 + 100) bdx *= -1.1;

            if (bx < 0) { 
                this.deaths.pong++;
                s2++; 
                bx = 400; 
                bdx = 5; 
            }
            if (bx > 800) { s1++; bx = 400; bdx = -5; }

            this.ctx.fillStyle = 'black';
            this.ctx.fillRect(0, 0, 800, 450);
            this.ctx.fillStyle = 'white';
            this.ctx.fillRect(10, p1, 10, 100);
            this.ctx.fillRect(780, p2, 10, 100);
            this.ctx.beginPath();
            this.ctx.arc(bx, by, 8, 0, Math.PI*2);
            this.ctx.fill();
            this.ctx.font = '30px Inter';
            this.ctx.fillText(s1 + ' - ' + s2, 370, 50);
            this.drawDeaths('pong');
        }, 16);
    },

    breakout() {
        let x = 400, y = 400, dx = 4, dy = -4, px = 350;
        let bricks = [];
        for(let c=0; c<8; c++) for(let r=0; r<4; r++) bricks.push({x: c*100+5, y: r*30+50, s: 1});

        window.onmousemove = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            px = (e.clientX - rect.left) * (800 / rect.width) - 50;
        };

        this.currentInterval = setInterval(() => {
            x += dx; y += dy;
            if (x < 10 || x > 790) dx *= -1;
            if (y < 10) dy *= -1;
            if (y > 430 && x > px && x < px + 100) dy *= -1;
            if (y > 450) { this.stop(); alert('Game Over!'); return; }

            bricks.forEach(b => {
                if (b.s && x > b.x && x < b.x + 90 && y > b.y && y < b.y + 25) {
                    dy *= -1; b.s = 0;
                }
            });

            this.ctx.fillStyle = 'black';
            this.ctx.fillRect(0, 0, 800, 450);
            this.ctx.fillStyle = '#3b82f6';
            this.ctx.fillRect(px, 435, 100, 10);
            this.ctx.fillStyle = 'white';
            this.ctx.beginPath(); this.ctx.arc(x, y, 8, 0, Math.PI*2); this.ctx.fill();
            bricks.forEach(b => { if(b.s) this.ctx.fillRect(b.x, b.y, 90, 25); });
        }, 16);
    },

    memory() {
        const container = document.getElementById('gameCanvas').parentElement;
        const symbols = ['🎮', '🕹️', '👾', '🚀', '⭐', '🔥', '💎', '🍀'];
        let cards = [...symbols, ...symbols].sort(() => Math.random() - 0.5);
        let flipped = [], matched = [];

        container.innerHTML = `
            <div class="grid grid-cols-4 gap-4 p-8 bg-black rounded-xl h-full">
                ${cards.map((s, i) => `<div id="card-${i}" onclick="GameEngine.flipCard(${i}, '${s}')" class="aspect-square bg-white/5 rounded-xl flex items-center justify-center text-4xl cursor-pointer hover:bg-white/10 transition-all">?</div>`).join('')}
            </div>
        `;

        this.flipCard = (i, s) => {
            if (flipped.length === 2 || matched.includes(i) || flipped.some(f => f.i === i)) return;
            const el = document.getElementById(`card-${i}`);
            el.innerText = s;
            el.classList.add('bg-blue-600/20');
            flipped.push({i, s});

            if (flipped.length === 2) {
                if (flipped[0].s === flipped[1].s) {
                    matched.push(flipped[0].i, flipped[1].i);
                    flipped = [];
                    if (matched.length === cards.length) alert('You Win!');
                } else {
                    setTimeout(() => {
                        document.getElementById(`card-${flipped[0].i}`).innerText = '?';
                        document.getElementById(`card-${flipped[1].i}`).innerText = '?';
                        document.getElementById(`card-${flipped[0].i}`).classList.remove('bg-blue-600/20');
                        document.getElementById(`card-${flipped[1].i}`).classList.remove('bg-blue-600/20');
                        flipped = [];
                    }, 1000);
                }
            }
        };
    },

    whack() {
        const container = document.getElementById('gameCanvas').parentElement;
        let score = 0;
        container.innerHTML = `
            <div class="bg-black rounded-xl h-full p-8 flex flex-col items-center">
                <div class="text-2xl mb-8">Score: <span id="mole-score">0</span></div>
                <div class="grid grid-cols-3 gap-8">
                    ${[...Array(9)].map((_, i) => `<div id="hole-${i}" onclick="GameEngine.hitMole(${i})" class="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-4xl cursor-pointer overflow-hidden"></div>`).join('')}
                </div>
            </div>
        `;

        let activeHole = -1;
        this.currentInterval = setInterval(() => {
            if (activeHole !== -1) document.getElementById(`hole-${activeHole}`).innerText = '';
            activeHole = Math.floor(Math.random() * 9);
            document.getElementById(`hole-${activeHole}`).innerText = '🐹';
        }, 800);

        this.hitMole = (i) => {
            if (i === activeHole) {
                score++;
                document.getElementById('mole-score').innerText = score;
                document.getElementById(`hole-${i}`).innerText = '💥';
                activeHole = -1;
            }
        };
    },

    clicker() {
        const container = document.getElementById('gameCanvas').parentElement;
        let cookies = 0;
        container.innerHTML = `
            <div class="bg-black rounded-xl h-full flex flex-col items-center justify-center space-y-8">
                <div class="text-4xl font-bold"><span id="cookie-count">0</span> Cookies</div>
                <button onclick="GameEngine.addCookie()" class="w-48 h-48 bg-amber-900/20 rounded-full border-4 border-amber-900 flex items-center justify-center text-8xl hover:scale-110 transition-transform active:scale-95">🍪</button>
                <div class="text-white/40 italic">Click the cookie!</div>
            </div>
        `;
        this.addCookie = () => {
            cookies++;
            document.getElementById('cookie-count').innerText = cookies;
        };
    },

    jump() {
        let px = 400, py = 400, pdy = 0;
        let platforms = [];
        for(let i=0; i<6; i++) platforms.push({x: Math.random()*700, y: i*80 + 50});

        window.onkeydown = (e) => {
            if (e.key === 'ArrowLeft') px -= 30;
            if (e.key === 'ArrowRight') px += 30;
        };

        this.currentInterval = setInterval(() => {
            pdy += 0.5;
            py += pdy;

            platforms.forEach(p => {
                if (pdy > 0 && px + 30 > p.x && px < p.x + 100 && py + 40 > p.y && py + 40 < p.y + 20) {
                    pdy = -15;
                }
            });

            if (py > 450) { 
                this.deaths.jump++;
                this.stop(); 
                alert('Game Over! Total Deaths: ' + this.deaths.jump); 
                return; 
            }
            if (py < 150) {
                const diff = 150 - py;
                py = 150;
                platforms.forEach(p => {
                    p.y += diff;
                    if (p.y > 450) { p.y = 0; p.x = Math.random()*700; }
                });
            }

            this.ctx.fillStyle = 'black';
            this.ctx.fillRect(0, 0, 800, 450);
            this.ctx.fillStyle = '#3b82f6';
            this.ctx.fillRect(px, py, 30, 40);
            this.ctx.fillStyle = '#10b981';
            platforms.forEach(p => this.ctx.fillRect(p.x, p.y, 100, 10));
            this.drawDeaths('jump');
        }, 16);
    }
};

window.GameEngine = GameEngine;
