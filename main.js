// Constants & Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const TILE_SIZE = 40;
const COLS = 30;
const ROWS = 20;

// Prevent touch actions like scrolling on canvas
canvas.addEventListener('touchstart', e => e.preventDefault(), {passive: false});

// Game State
let gameState = 'START'; // START, TUTORIAL, PLAYING, GAMEOVER, VICTORY, SHOP
let stage = 1;
let score = 0;
let shopPoints = 0;
let combo = 0;
let comboTimer = 0;
let timeRemaining = 90;
let suspicion = 0; // 0 to 100
let collectedPanties = 0;
let requiredPanties = 5;

// Upgrades
const upgrades = {
    mochila: false,
    tenis: false,
    luva: false
};

// Input
const keys = { w: false, a: false, s: false, d: false, Shift: false, ' ': false };
let spacePressed = false; // to trigger action once per press

// Mobile Input mapping
function bindMobileButton(id, key) {
    const btn = document.getElementById(id);
    if(!btn) return;
    const start = (e) => { e.preventDefault(); keys[key] = true; if(key === ' ') spacePressed = true; };
    const end = (e) => { e.preventDefault(); keys[key] = false; };
    btn.addEventListener('touchstart', start);
    btn.addEventListener('touchend', end);
    btn.addEventListener('mousedown', start);
    btn.addEventListener('mouseup', end);
}
bindMobileButton('btn-up', 'w');
bindMobileButton('btn-down', 's');
bindMobileButton('btn-left', 'a');
bindMobileButton('btn-right', 'd');
bindMobileButton('btn-shift', 'Shift');
bindMobileButton('btn-space', ' ');

window.addEventListener('keydown', e => {
    if(keys.hasOwnProperty(e.key)) keys[e.key] = true;
    if(keys.hasOwnProperty(e.key.toLowerCase())) keys[e.key.toLowerCase()] = true;
    if(e.key === ' ') spacePressed = true;
});
window.addEventListener('keyup', e => {
    if(keys.hasOwnProperty(e.key)) keys[e.key] = false;
    if(keys.hasOwnProperty(e.key.toLowerCase())) keys[e.key.toLowerCase()] = false;
});

// Map Layout (30x20)
// W = Wall/Border, . = Floor, B = Bathroom Stall, C = Clothesline, R = Rug (Safe/Silent), P = Plant (Safe)
// L = Locker, E = Enemy Spawn/Exit
const mapLayout = [
    "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW",
    "W............................W",
    "W.B...B...B...B...B...B...B..W",
    "W.B...B...B...B...B...B...B..W",
    "W........L..........L........W",
    "W..PPPP..L..........L..PPPP..W",
    "W..PPPP..L.RRRRRR...L..PPPP..W",
    "W..........RRRRRR............W",
    "W...L....................L...W",
    "W...L...PPPP..W...PPPP...L...W",
    "W.......PPPP..W...PPPP.......W",
    "W.............W..........CCC.W",
    "W.......RRRRRRW..........CCC.W",
    "W.......RRRRRR...........CCC.W",
    "W...L................L.......W",
    "W...L........PPPP....L.......W",
    "W...L........PPPP....L.......W",
    "W............................W",
    "WE...........................W",
    "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"
];

// Entities
let player = {
    x: 100, y: 100, size: 28, speed: 120, // 3 tiles per sec = 120px
    isHiding: false, facing: 'down',
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath();
        ctx.ellipse(this.size/2, this.size - 2, this.size/2 + 2, 6, 0, 0, Math.PI*2);
        ctx.fill();

        // Draw smaller if hiding (crouching)
        let drawSize = this.isHiding ? this.size * 0.8 : this.size;
        let offsetY = this.isHiding ? this.size * 0.2 : (this.isMoving ? -Math.abs(Math.sin(Date.now()/100)) * 4 : 0);
        
        ctx.translate(this.size/2, this.size/2 + offsetY);
        
        // Body (Striped shirt)
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(0, drawSize*0.3, drawSize*0.4, Math.PI, 0); // shoulders
        ctx.fill();
        ctx.fillStyle = '#000'; // Stripes
        ctx.fillRect(-drawSize*0.4, drawSize*0.05, drawSize*0.8, drawSize*0.1);
        ctx.fillRect(-drawSize*0.4, drawSize*0.2, drawSize*0.8, drawSize*0.1);

        // Head
        ctx.fillStyle = '#ffcc99'; // Skin
        ctx.beginPath();
        ctx.arc(0, -drawSize*0.2, drawSize*0.4, 0, Math.PI*2);
        ctx.fill();

        // Mask
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.ellipse(0, -drawSize*0.2, drawSize*0.45, drawSize*0.15, 0, 0, Math.PI*2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(-drawSize*0.15, -drawSize*0.2, drawSize*0.06, 0, Math.PI*2);
        ctx.arc(drawSize*0.15, -drawSize*0.2, drawSize*0.06, 0, Math.PI*2);
        ctx.fill();

        // Beanie/Hat
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.arc(0, -drawSize*0.4, drawSize*0.35, Math.PI, 0);
        ctx.fill();

        ctx.restore();
    }
};

let enemy = {
    active: false,
    x: 0, y: 0, size: 30, speed: 100,
    state: 'patrol', // patrol, chase, leave
    targetX: 0, targetY: 0,
    loseTimer: 0,
    pathTimer: 0,
    nextTarget: null,
    draw(ctx) {
        if(!this.active) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath();
        ctx.ellipse(this.size/2, this.size - 2, this.size/2 + 4, 8, 0, 0, Math.PI*2);
        ctx.fill();

        let bob = (this.state === 'chase') ? Math.abs(Math.sin(Date.now()/100)) * 6 : Math.abs(Math.sin(Date.now()/150)) * 3;
        ctx.translate(this.size/2, this.size/2 - bob);

        // Club (Porrete)
        ctx.save();
        if(this.state === 'chase') {
            ctx.rotate(Math.sin(Date.now()/100) * 0.5 + 0.5); // Swinging animation
        } else {
            ctx.rotate(0.2); // Resting on shoulder
        }
        ctx.fillStyle = '#8b4513';
        ctx.beginPath();
        ctx.moveTo(10, 0); ctx.lineTo(25, -20); ctx.lineTo(32, -18); ctx.lineTo(15, 5);
        ctx.fill();
        ctx.fillStyle = '#654321'; // Wood line
        ctx.beginPath(); ctx.moveTo(25, -15); ctx.lineTo(30, -12); ctx.stroke();
        ctx.restore();

        // Body (Dress)
        ctx.fillStyle = '#800020';
        ctx.beginPath();
        ctx.moveTo(0, -this.size*0.1);
        ctx.lineTo(-this.size*0.6, this.size*0.5);
        ctx.lineTo(this.size*0.6, this.size*0.5);
        ctx.fill();

        // Head
        ctx.fillStyle = '#f5cba7'; // Skin
        ctx.beginPath();
        ctx.arc(0, -this.size*0.3, this.size*0.35, 0, Math.PI*2);
        ctx.fill();

        // Hair (Bun)
        ctx.fillStyle = '#4a2311'; // Brown
        ctx.beginPath(); ctx.arc(0, -this.size*0.6, this.size*0.2, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(0, -this.size*0.4, this.size*0.36, Math.PI, 0); ctx.fill();

        // Angry Face
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        // Eyebrows
        ctx.beginPath();
        ctx.moveTo(-this.size*0.2, -this.size*0.4); ctx.lineTo(-this.size*0.05, -this.size*0.25);
        ctx.moveTo(this.size*0.2, -this.size*0.4); ctx.lineTo(this.size*0.05, -this.size*0.25);
        ctx.stroke();
        // Eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(-this.size*0.1, -this.size*0.25, 3, 0, Math.PI*2);
        ctx.arc(this.size*0.1, -this.size*0.25, 3, 0, Math.PI*2);
        ctx.fill();

        // Alert indicator
        if(this.state === 'chase') {
            ctx.fillStyle = 'red';
            ctx.font = 'bold 24px Fredoka One';
            ctx.fillText('!', 0, -this.size);
        } else if(this.state === 'search') {
            ctx.fillStyle = '#ffcf40';
            ctx.font = 'bold 20px Fredoka One';
            ctx.fillText('?', 0, -this.size);
        }

        ctx.restore();
    }
};

let panties = [];
let particles = [];
let lastPantySpawn = 0;

const pantyTypes = [
    { type: 'Bolinhas', pts: 10, icon: '🩲', color: '#ffb3ba' },
    { type: 'Listrada', pts: 15, icon: '🩲', color: '#baffc9' },
    { type: 'Renda', pts: 25, icon: '👙', color: '#000', noise: true },
    { type: 'Neon', pts: 50, icon: '👙', color: '#ffffba', rare: true },
    { type: 'Armadilha', pts: -20, icon: '🩲', color: 'red', trap: true }
];

// Utility: Check Collision (AABB)
function checkCollision(rect1, rect2) {
    let r1w = rect1.width || rect1.size;
    let r1h = rect1.height || rect1.size;
    let r2w = rect2.width || rect2.size;
    let r2h = rect2.height || rect2.size;
    return rect1.x < rect2.x + r2w &&
           rect1.x + r1w > rect2.x &&
           rect1.y < rect2.y + r2h &&
           rect1.y + r1h > rect2.y;
}

// Check Map Collision
function checkMapCollision(x, y, size) {
    // Check the 4 corners of the entity
    const corners = [
        { cx: x, cy: y },
        { cx: x + size, cy: y },
        { cx: x, cy: y + size },
        { cx: x + size, cy: y + size }
    ];

    for(let c of corners) {
        let col = Math.floor(c.cx / TILE_SIZE);
        let row = Math.floor(c.cy / TILE_SIZE);
        if(row >= 0 && row < ROWS && col >= 0 && col < COLS) {
            let tile = mapLayout[row][col];
            // Walls, Stalls(B), Lockers(L) are solid
            if(['W', 'B', 'L'].includes(tile)) return true;
        } else {
            return true; // Outside bounds
        }
    }
    return false;
}

function getTileAt(x, y, size) {
    let centerX = x + size/2;
    let centerY = y + size/2;
    let col = Math.floor(centerX / TILE_SIZE);
    let row = Math.floor(centerY / TILE_SIZE);
    if(row >= 0 && row < ROWS && col >= 0 && col < COLS) {
        return mapLayout[row][col];
    }
    return null;
}

function getNextStep(startR, startC, targetR, targetC) {
    if(startR === targetR && startC === targetC) return null;
    let queue = [{r: startR, c: startC, path: []}];
    let visited = new Set();
    visited.add(`${startR},${startC}`);
    let dirs = [[-1,0],[1,0],[0,-1],[0,1]];

    let iterations = 0;
    while(queue.length > 0 && iterations < 1500) {
        iterations++;
        let curr = queue.shift();
        if(curr.r === targetR && curr.c === targetC) return curr.path[0];
        
        for(let d of dirs) {
            let nr = curr.r + d[0];
            let nc = curr.c + d[1];
            if(nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
                if(!visited.has(`${nr},${nc}`)) {
                    let tile = mapLayout[nr][nc];
                    if(!['W', 'B', 'L'].includes(tile)) {
                        visited.add(`${nr},${nc}`);
                        queue.push({r: nr, c: nc, path: [...curr.path, {r: nr, c: nc}]});
                    }
                }
            }
        }
    }
    return null;
}

function checkLoS(x1, y1, x2, y2) {
    let dx = x2 - x1;
    let dy = y2 - y1;
    let steps = 20;
    let targetCol = Math.floor(x2 / TILE_SIZE);
    let targetRow = Math.floor(y2 / TILE_SIZE);
    let startCol = Math.floor(x1 / TILE_SIZE);
    let startRow = Math.floor(y1 / TILE_SIZE);

    for(let i=1; i<=steps; i++) {
        let cx = x1 + dx * (i/steps);
        let cy = y1 + dy * (i/steps);
        let col = Math.floor(cx / TILE_SIZE);
        let row = Math.floor(cy / TILE_SIZE);
        
        if(col === targetCol && row === targetRow) continue;
        if(col === startCol && row === startRow) continue;

        if(row >= 0 && row < ROWS && col >= 0 && col < COLS) {
            let tile = mapLayout[row][col];
            if(tile === 'W' || tile === 'L' || tile === 'B') {
                return false;
            }
        }
    }
    return true;
}

// Spawn Panty
function spawnPanty() {
    let spawned = false;
    let attempts = 0;
    while(!spawned && attempts < 50) {
        let col = Math.floor(Math.random() * COLS);
        let row = Math.floor(Math.random() * ROWS);
        let tile = mapLayout[row][col];
        
        // Spawn on Floor(.) or Clothesline(C) or Rug(R)
        if(['.', 'C', 'R'].includes(tile)) {
            // Determine type
            let rand = Math.random();
            let pType = pantyTypes[0]; // Bolinhas
            if(rand > 0.95) pType = pantyTypes[3]; // Neon
            else if(rand > 0.85) pType = pantyTypes[4]; // Trap
            else if(rand > 0.6) pType = pantyTypes[2]; // Renda
            else if(rand > 0.3) pType = pantyTypes[1]; // Listrada

            panties.push({
                x: col * TILE_SIZE + 5,
                y: row * TILE_SIZE + 5,
                width: 30, height: 30,
                type: pType,
                pulse: 0
            });
            spawned = true;
        }
        attempts++;
    }
}

function showToast(msg) {
    const toast = document.getElementById('message-toast');
    toast.textContent = msg;
    toast.classList.remove('hidden');
    toast.style.animation = 'none';
    toast.offsetHeight; /* trigger reflow */
    toast.style.animation = null; 
    setTimeout(() => toast.classList.add('hidden'), 2000);
}

function spawnParticle(x, y, text, color) {
    particles.push({
        x: x, y: y, text: text, color: color,
        life: 1, maxLife: 1, vy: -50
    });
}

function spawnNoiseRing(x, y) {
    particles.push({
        type: 'ring',
        x: x + player.size/2, y: y + player.size/2,
        radius: 10, maxRadius: 60,
        life: 0.5, maxLife: 0.5
    });
}

// UI Updates
function updateHUD() {
    document.getElementById('stage-name').textContent = `Fase ${stage}`;
    let mins = Math.floor(timeRemaining / 60).toString().padStart(2, '0');
    let secs = Math.floor(timeRemaining % 60).toString().padStart(2, '0');
    document.getElementById('timer').textContent = `⏱️ ${mins}:${secs}`;
    document.getElementById('score').textContent = `Score: ${score}`;
    
    let comboEl = document.getElementById('combo');
    if(combo > 1) {
        comboEl.textContent = `Combo x${combo}!`;
        comboEl.classList.remove('hidden');
    } else {
        comboEl.classList.add('hidden');
    }

    document.getElementById('panty-counter').textContent = `🩲 ${collectedPanties}/${requiredPanties}`;
    
    const sBar = document.getElementById('suspicion-bar');
    sBar.style.width = `${Math.min(100, suspicion)}%`;
    if(suspicion < 50) sBar.style.background = 'linear-gradient(90deg, #4facfe, #00f2fe)';
    else if(suspicion < 80) sBar.style.background = 'linear-gradient(90deg, #f6d365, #fda085)';
    else sBar.style.background = 'linear-gradient(90deg, #ff0844, #ffb199)';
}

let women = [];

// Start Level
function startLevel() {
    timeRemaining = 90;
    suspicion = 0;
    collectedPanties = 0;
    requiredPanties = 3 + stage * 2;
    panties = [];
    particles = [];
    women = [];
    enemy.active = false;
    
    // Spawn player at Door (E)
    for(let r=0; r<ROWS; r++) {
        for(let c=0; c<COLS; c++) {
            if(mapLayout[r][c] === 'E') {
                player.x = c * TILE_SIZE;
                player.y = r * TILE_SIZE;
            }
        }
    }

    // Initial panties spawn
    for(let i=0; i<4; i++) spawnPanty();

    // Spawn women in stalls
    for(let r=0; r<ROWS; r++) {
        for(let c=0; c<COLS; c++) {
            if(mapLayout[r][c] === 'B' && Math.random() < 0.6) {
                women.push({
                    x: c * TILE_SIZE,
                    y: r * TILE_SIZE,
                    size: TILE_SIZE,
                    alerted: false
                });
            }
        }
    }

    gameState = 'PLAYING';
    document.getElementById('hud').classList.remove('hidden');
    
    // Check mobile
    if(window.innerWidth <= 1250) {
        document.getElementById('mobile-controls').classList.remove('hidden');
    }
}

// Update Logic
function update(dt) {
    if(timeRemaining > 0) {
        timeRemaining -= dt;
        if(timeRemaining <= 0) {
            // Time up logic, maybe game over or check if enough collected
            if(collectedPanties >= requiredPanties) {
                gameState = 'VICTORY';
                document.getElementById('hud').classList.add('hidden');
                document.getElementById('victory-screen').classList.remove('hidden');
                document.getElementById('victory-stats').textContent = `Score: ${score}`;
                shopPoints += score;
            } else {
                gameOver();
            }
        }
    }

    // Combo timer
    if(comboTimer > 0) {
        comboTimer -= dt;
        if(comboTimer <= 0) combo = 0;
    }

    // Suspicion decay
    if(suspicion > 0 && !enemy.active) {
        suspicion -= 2 * dt; 
        if(suspicion < 0) suspicion = 0;
    }

    // Player Movement
    let dx = 0; let dy = 0;
    let speed = player.speed;
    let isRunning = false;

    if(keys.Shift || keys.shift) {
        speed *= 1.8;
        isRunning = true;
    }

    if(keys.w || keys.W) dy = -speed;
    if(keys.s || keys.S) dy = speed;
    if(keys.a || keys.A) dx = -speed;
    if(keys.d || keys.D) dx = speed;

    // Normalize diagonal
    if(dx !== 0 && dy !== 0) {
        let length = Math.sqrt(dx*dx + dy*dy);
        dx = (dx/length) * speed;
        dy = (dy/length) * speed;
    }

    let isMoving = dx !== 0 || dy !== 0;

    // Move X
    if(!checkMapCollision(player.x + dx * dt, player.y, player.size)) {
        player.x += dx * dt;
    }
    // Move Y
    if(!checkMapCollision(player.x, player.y + dy * dt, player.size)) {
        player.y += dy * dt;
    }

    player.isMoving = isMoving;

    // Tile checks
    let currentTile = getTileAt(player.x, player.y, player.size);
    player.isHiding = (currentTile === 'P' || currentTile === 'R') && !isMoving;
    
    // Noise and Suspicion
    let noiseFactor = 1.0;
    if(currentTile === 'R' || upgrades.tenis) noiseFactor = 0.5;

    if(isMoving && isRunning) {
        suspicion += 20 * dt * noiseFactor; // increased noise
        if(Math.random() < 0.2) spawnNoiseRing(player.x, player.y);
    }

    // Women logic (Shower LoS)
    women.forEach(w => {
        if(w.alerted) return;
        let dx = (player.x + player.size/2) - (w.x + w.size/2);
        let dy = (player.y + player.size/2) - (w.y + w.size/2);
        let dist = Math.sqrt(dx*dx + dy*dy);
        
        // Women face right (door is on the right of the stall).
        // Field of view: dx > -20 (player is to the right or very close), and vertical distance is small.
        if(dist < 350 && !player.isHiding && dx > -20 && Math.abs(dy) < 120) {
            let hasLoS = checkLoS(w.x + w.size/2, w.y + w.size/2, player.x + player.size/2, player.y + player.size/2);
            if(hasLoS) {
                w.alerted = true;
                showToast("😱 AHHH! UM INVASOR!");
                suspicion = 100;
                spawnParticle(w.x + w.size/2, w.y, "😱", "#fff");
                spawnNoiseRing(w.x, w.y);
                spawnNoiseRing(w.x, w.y);
            }
        }
    });

    // Action (Pick up)
    if(spacePressed) {
        spacePressed = false;
        let pickRange = upgrades.luva ? 20 : 0;
        let pRect = {x: player.x - pickRange, y: player.y - pickRange, width: player.size + pickRange*2, height: player.size + pickRange*2};

        for(let i = panties.length - 1; i >= 0; i--) {
            let p = panties[i];
            if(checkCollision(pRect, p)) {
                // Picked up
                if(p.type.trap) {
                    score = Math.max(0, score - 20);
                    suspicion += 30;
                    showToast("🚨 ARMADILHA!");
                    spawnNoiseRing(player.x, player.y);
                    spawnNoiseRing(player.x, player.y); // double ring
                    combo = 0;
                } else {
                    combo++;
                    comboTimer = 2.5; // seconds to keep combo
                    let multiplier = 1;
                    if(combo >= 5) multiplier = 3;
                    else if(combo >= 3) multiplier = 2;

                    let gained = p.type.pts * multiplier;
                    score += gained;
                    collectedPanties++;
                    
                    if(p.type.noise) {
                        suspicion += 10;
                        spawnNoiseRing(player.x, player.y);
                    }
                    
                    // Too fast collecting adds suspicion
                    if(combo > 2) suspicion += 5;

                    spawnParticle(p.x, p.y, `+${gained}`, '#ffcf40');
                    if(collectedPanties === requiredPanties) showToast("VÁ PARA A JANELA!");
                }
                panties.splice(i, 1);
                break; // pick one at a time
            }
        }
    }

    // Spawn panties over time
    lastPantySpawn += dt;
    if(lastPantySpawn > 5 && panties.length < 6) {
        spawnPanty();
        lastPantySpawn = 0;
    }

    // Check Enemy Spawn
    if(suspicion >= 100 && !enemy.active) {
        enemy.active = true;
        // Spawn at 'E'
        for(let r=0; r<ROWS; r++) {
            for(let c=0; c<COLS; c++) {
                if(mapLayout[r][c] === 'E') {
                    enemy.x = c * TILE_SIZE;
                    enemy.y = r * TILE_SIZE;
                }
            }
        }
        showToast("⚠️ DONA DO BANHEIRO APARECEU!");
    }

    // Enemy AI
    if(enemy.active) {
        let hasLoS = checkLoS(enemy.x + enemy.size/2, enemy.y + enemy.size/2, player.x + player.size/2, player.y + player.size/2);
        let distToPlayer = Math.sqrt(Math.pow(enemy.x - player.x, 2) + Math.pow(enemy.y - player.y, 2));
        
        let playerVisible = false;
        if (!player.isHiding) {
            // Track if high suspicion or direct vision
            if (suspicion >= 100 || (hasLoS && distToPlayer < 400)) {
                playerVisible = true;
            }
        } else {
            // Keep tracking if saw them hide
            if (enemy.state === 'chase' && hasLoS) {
                playerVisible = true;
            }
        }

        if(playerVisible) {
            enemy.state = 'chase';
            enemy.targetX = player.x;
            enemy.targetY = player.y;
            enemy.speed = 145; // Slower than run, faster than walk
            suspicion = 100; // Keep high while chasing
        } else if(enemy.state === 'chase' || enemy.state === 'search') {
            enemy.state = 'search';
            enemy.speed = 110;
            
            let edx = enemy.targetX - enemy.x;
            let edy = enemy.targetY - enemy.y;
            let distToTarget = Math.sqrt(edx*edx + edy*edy);
            
            if(distToTarget < 20 || Math.random() < 0.02) {
                let r = Math.floor(enemy.y/TILE_SIZE) + Math.floor((Math.random() - 0.5) * 12);
                let c = Math.floor(enemy.x/TILE_SIZE) + Math.floor((Math.random() - 0.5) * 12);
                if(r>=0 && r<ROWS && c>=0 && c<COLS && !['W', 'B', 'L'].includes(mapLayout[r][c])) {
                    enemy.targetX = c * TILE_SIZE;
                    enemy.targetY = r * TILE_SIZE;
                }
            }

            suspicion -= 10 * dt; // Decay suspicion over 10s
            if(suspicion <= 0) {
                enemy.state = 'leave';
                enemy.speed = 100;
                showToast("Ufa... Ela desistiu!");
                suspicion = 0;
            }
        }

        if(enemy.state === 'patrol') {
            // Simple wander
            enemy.speed = 100;
            if(Math.random() < 0.02) {
                let r = Math.floor(Math.random() * ROWS);
                let c = Math.floor(Math.random() * COLS);
                if(!['W', 'B', 'L'].includes(mapLayout[r][c])) {
                    enemy.targetX = c * TILE_SIZE;
                    enemy.targetY = r * TILE_SIZE;
                }
            }
        }

        if(enemy.state === 'leave') {
            // Go to exit
            for(let r=0; r<ROWS; r++) {
                for(let c=0; c<COLS; c++) {
                    if(mapLayout[r][c] === 'E') {
                        enemy.targetX = c * TILE_SIZE;
                        enemy.targetY = r * TILE_SIZE;
                    }
                }
            }
            if(getTileAt(enemy.x, enemy.y, enemy.size) === 'E') {
                enemy.active = false;
            }
        }

        if(enemy.active) {
            // Smart Pathfinding Movement
            let eCol = Math.floor((enemy.x + enemy.size/2) / TILE_SIZE);
            let eRow = Math.floor((enemy.y + enemy.size/2) / TILE_SIZE);
            let targetCenter = (enemy.state === 'chase') ? player.size/2 : 0;
            let tCol = Math.floor((enemy.targetX + targetCenter) / TILE_SIZE);
            let tRow = Math.floor((enemy.targetY + targetCenter) / TILE_SIZE);
            
            enemy.pathTimer = (enemy.pathTimer || 0) - dt;
            if(enemy.pathTimer <= 0 || !enemy.nextTarget) {
                enemy.pathTimer = 0.2;
                let step = getNextStep(eRow, eCol, tRow, tCol);
                if(step) {
                    enemy.nextTarget = {
                        x: step.c * TILE_SIZE + TILE_SIZE/2 - enemy.size/2,
                        y: step.r * TILE_SIZE + TILE_SIZE/2 - enemy.size/2
                    };
                } else {
                    enemy.nextTarget = null;
                }
            }

            let moveTargetX = enemy.nextTarget ? enemy.nextTarget.x : enemy.targetX;
            let moveTargetY = enemy.nextTarget ? enemy.nextTarget.y : enemy.targetY;
            
            let edx = moveTargetX - enemy.x;
            let edy = moveTargetY - enemy.y;
            let dist = Math.sqrt(edx*edx + edy*edy);
            
            if(dist > 2) {
                let eMoveX = (edx/dist) * enemy.speed * dt;
                let eMoveY = (edy/dist) * enemy.speed * dt;
                
                // Try X and Y separately to slide on walls
                let movedX = false; let movedY = false;
                if(!checkMapCollision(enemy.x + eMoveX, enemy.y, enemy.size)) {
                    enemy.x += eMoveX; movedX = true;
                }
                if(!checkMapCollision(enemy.x, enemy.y + eMoveY, enemy.size)) {
                    enemy.y += eMoveY; movedY = true;
                }
                
                // Check if reached next node
                let nDist = Math.sqrt((moveTargetX - enemy.x)**2 + (moveTargetY - enemy.y)**2);
                if(nDist < 5) enemy.nextTarget = null;
            }

            // Check catch
            if(checkCollision(player, enemy)) {
                if (player.isHiding) {
                    player.isHiding = false;
                    showToast("Te achei!");
                    suspicion = 100;
                } else {
                    gameOver();
                }
            }
        }
    }

    // Win condition check (Reached Exit with enough items)
    if(collectedPanties >= requiredPanties && currentTile === 'E') {
        gameState = 'VICTORY';
        document.getElementById('hud').classList.add('hidden');
        document.getElementById('mobile-controls').classList.add('hidden');
        document.getElementById('victory-screen').classList.remove('hidden');
        document.getElementById('victory-stats').textContent = `Score: ${score}`;
        shopPoints += score;
    }

    // Update particles
    for(let i=particles.length-1; i>=0; i--) {
        let p = particles[i];
        p.life -= dt;
        if(p.type === 'ring') {
            p.radius += (p.maxRadius - p.radius) * 5 * dt;
        } else {
            p.y += p.vy * dt;
        }
        if(p.life <= 0) particles.splice(i, 1);
    }
    
    // Panty pulse animation
    panties.forEach(p => p.pulse = (p.pulse + dt * 3) % (Math.PI * 2));

    updateHUD();
}

let gameOverAnimTimer = 0;

function gameOver() {
    gameState = 'GAMEOVER';
    gameOverAnimTimer = 0;
    document.getElementById('hud').classList.add('hidden');
    document.getElementById('mobile-controls').classList.add('hidden');
    document.getElementById('game-over-screen').classList.remove('hidden');
    document.getElementById('game-over-screen').style.background = 'rgba(0,0,0,0.8)';
    document.getElementById('game-over-stats').textContent = `Pontuação Final: ${score}`;
}

// Drawing Logic
function draw() {
    // Clear
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Map
    for(let r=0; r<ROWS; r++) {
        for(let c=0; c<COLS; c++) {
            let tile = mapLayout[r][c];
            let x = c * TILE_SIZE;
            let y = r * TILE_SIZE;

            // Base Floor
            if((r+c)%2 === 0) ctx.fillStyle = '#f0f0f0';
            else ctx.fillStyle = '#e0e0e0';
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            
            // Grid lines
            ctx.strokeStyle = '#d0d0d0';
            ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);

            if(tile === 'W') {
                ctx.fillStyle = '#a2d2ff';
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                // 3D effect
                ctx.fillStyle = '#81a4c7';
                ctx.fillRect(x, y + TILE_SIZE - 5, TILE_SIZE, 5);
            }
            else if(tile === 'B') {
                ctx.fillStyle = '#ffcf40'; // yellow stall
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                // Door line
                ctx.strokeStyle = '#c49a1f';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(x + TILE_SIZE - 5, y);
                ctx.lineTo(x + TILE_SIZE - 5, y + TILE_SIZE);
                ctx.stroke();
                ctx.lineWidth = 1;
            }
            else if(tile === 'R') {
                ctx.fillStyle = 'rgba(255, 105, 180, 0.5)'; // Rug
                ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
            }
            else if(tile === 'L') {
                ctx.fillStyle = '#8b5a2b'; // Locker
                ctx.fillRect(x + 5, y + 5, TILE_SIZE - 10, TILE_SIZE - 10);
            }
            else if(tile === 'C') {
                // Clothesline
                ctx.strokeStyle = '#555';
                ctx.beginPath();
                ctx.moveTo(x, y + TILE_SIZE/2);
                ctx.lineTo(x + TILE_SIZE, y + TILE_SIZE/2);
                ctx.stroke();
            }
            else if(tile === 'E') {
                // Exit/Window
                ctx.fillStyle = '#87CEEB';
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                ctx.font = '20px Arial';
                ctx.fillText('🚪', x + TILE_SIZE/2, y + TILE_SIZE/2);
            }
            else if(tile === 'P') {
                // Plant base
                ctx.fillStyle = '#3d2b1f';
                ctx.beginPath();
                ctx.arc(x + TILE_SIZE/2, y + TILE_SIZE/2, 10, 0, Math.PI*2);
                ctx.fill();
            }
        }
    }

    // Draw Women in Showers
    women.forEach(w => {
        let cx = w.x + w.size/2;
        let cy = w.y + w.size/2;
        
        // Shower head
        ctx.fillStyle = '#aaa';
        ctx.fillRect(w.x + 5, w.y + 5, 15, 5);
        ctx.fillStyle = '#888';
        ctx.beginPath();
        ctx.arc(w.x + 20, w.y + 7, 6, Math.PI, 0);
        ctx.fill();

        // Water streams (animated)
        ctx.strokeStyle = 'rgba(0, 150, 255, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        let dropY = (Date.now() / 20) % 15;
        ctx.moveTo(w.x + 15, w.y + 15 + dropY); ctx.lineTo(w.x + 15, w.y + 25 + dropY);
        ctx.moveTo(w.x + 20, w.y + 10 + dropY); ctx.lineTo(w.x + 20, w.y + 20 + dropY);
        ctx.moveTo(w.x + 25, w.y + 15 + dropY); ctx.lineTo(w.x + 25, w.y + 25 + dropY);
        ctx.stroke();

        // Woman Body
        ctx.fillStyle = '#f1c27d'; // Skin
        ctx.beginPath();
        ctx.arc(cx, cy + 10, 12, Math.PI, 0); // Shoulders
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx, cy, 10, 0, Math.PI*2); // Head
        ctx.fill();

        // Towel Turban
        ctx.fillStyle = '#ff69b4';
        ctx.beginPath(); ctx.arc(cx, cy - 4, 11, Math.PI, 0); ctx.fill();
        ctx.beginPath(); ctx.arc(cx, cy - 12, 6, 0, Math.PI*2); ctx.fill();

        if(w.alerted) {
            // Scream face
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(cx - 3, cy, 2, 0, Math.PI*2);
            ctx.arc(cx + 3, cy, 2, 0, Math.PI*2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(cx, cy + 4, 3, 5, 0, 0, Math.PI*2);
            ctx.fill();

            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('😱', cx, w.y - 10);
        } else {
            // Relaxed face
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(cx - 5, cy); ctx.quadraticCurveTo(cx - 3, cy + 2, cx - 1, cy);
            ctx.moveTo(cx + 1, cy); ctx.quadraticCurveTo(cx + 3, cy + 2, cx + 5, cy);
            ctx.stroke();
        }
    });

    // Draw Panties
    panties.forEach(p => {
        let scale = 1 + Math.sin(p.pulse) * 0.1;
        ctx.save();
        ctx.translate(p.x + p.width/2, p.y + p.height/2);
        
        // Shadow/glow for rare
        if(p.type.rare) {
            ctx.shadowColor = p.type.color;
            ctx.shadowBlur = 10;
        }

        ctx.scale(scale, scale);
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.type.icon, 0, 0);
        ctx.restore();
    });

    // Draw Player
    player.draw(ctx);

    // Draw Enemy
    enemy.draw(ctx);

    // Draw Top Layer of Map (Plants cover player)
    for(let r=0; r<ROWS; r++) {
        for(let c=0; c<COLS; c++) {
            let tile = mapLayout[r][c];
            if(tile === 'P') {
                let x = c * TILE_SIZE;
                let y = r * TILE_SIZE;
                ctx.font = '30px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('🪴', x + TILE_SIZE/2, y + TILE_SIZE/2);
            }
        }
    }

    // Draw Particles
    particles.forEach(p => {
        if(p.type === 'ring') {
            ctx.strokeStyle = `rgba(255, 255, 255, ${p.life / p.maxLife})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI*2);
            ctx.stroke();
        } else {
            ctx.fillStyle = p.color || '#fff';
            ctx.globalAlpha = p.life / p.maxLife;
            ctx.font = 'bold 20px Fredoka One';
            ctx.textAlign = 'center';
            ctx.fillText(p.text, p.x, p.y);
            ctx.globalAlpha = 1.0;
        }
    });

    // Draw Exit Highlight if requirements met
    if(collectedPanties >= requiredPanties) {
        ctx.fillStyle = `rgba(0, 255, 0, ${Math.abs(Math.sin(Date.now()/200)) * 0.3})`;
        for(let r=0; r<ROWS; r++) {
            for(let c=0; c<COLS; c++) {
                if(mapLayout[r][c] === 'E') {
                    ctx.fillRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                }
            }
        }
    }
}

function drawGameOverAnimation(dt) {
    gameOverAnimTimer += dt;
    
    // Clear background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Center coords
    let cx = canvas.width / 2;
    let cy = canvas.height / 2;

    // Swing cycle
    let swing = Math.sin(gameOverAnimTimer * 10);
    
    // ---------------- Draw Player ----------------
    ctx.save();
    ctx.translate(cx - 80, cy + 50);
    ctx.scale(3, 3);
    
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath(); ctx.ellipse(0, 15, 20, 5, 0, 0, Math.PI*2); ctx.fill();
    
    // Body
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(0, 5, 12, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#000'; 
    ctx.fillRect(-12, -2, 24, 3); ctx.fillRect(-12, 2, 24, 3);

    // Head
    let headSquish = swing < -0.5 ? 0.6 : 1.0;
    let headY = swing < -0.5 ? -4 : -8;
    ctx.fillStyle = '#ffcc99'; 
    ctx.beginPath(); ctx.ellipse(0, headY, 12, 12 * headSquish, 0, 0, Math.PI*2); ctx.fill();

    // Mask
    ctx.fillStyle = '#111';
    ctx.beginPath(); ctx.ellipse(0, headY, 14, 5 * headSquish, 0, 0, Math.PI*2); ctx.fill();
    
    // Dead Eyes "X"
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5;
    ctx.beginPath(); 
    ctx.moveTo(-6, headY-2); ctx.lineTo(-2, headY+2); ctx.moveTo(-2, headY-2); ctx.lineTo(-6, headY+2);
    ctx.moveTo(2, headY-2); ctx.lineTo(6, headY+2); ctx.moveTo(6, headY-2); ctx.lineTo(2, headY+2);
    ctx.stroke();

    ctx.restore();

    // ---------------- Draw Dona ----------------
    ctx.save();
    ctx.translate(cx + 80, cy);
    ctx.scale(4, 4);
    
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath(); ctx.ellipse(0, 18, 18, 5, 0, 0, Math.PI*2); ctx.fill();

    // Arm + Club
    ctx.save();
    ctx.translate(-5, 5);
    // Club rotation
    let clubRot = -0.5 + swing * 1.5; 
    ctx.rotate(clubRot);
    ctx.fillStyle = '#8b4513'; // Club
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(-20, -30); ctx.lineTo(-25, -27); ctx.lineTo(-5, 5); ctx.fill();
    ctx.fillStyle = '#f5cba7'; // Hand
    ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI*2); ctx.fill();
    ctx.restore();

    // Body
    ctx.fillStyle = '#800020';
    ctx.beginPath();
    ctx.moveTo(0, -2); ctx.lineTo(-12, 18); ctx.lineTo(12, 18); ctx.fill();

    // Head
    ctx.fillStyle = '#f5cba7'; 
    ctx.beginPath(); ctx.arc(0, -10, 10, 0, Math.PI*2); ctx.fill();

    // Hair
    ctx.fillStyle = '#4a2311'; 
    ctx.beginPath(); ctx.arc(0, -18, 6, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(0, -12, 11, Math.PI, 0); ctx.fill();

    // Angry face
    ctx.strokeStyle = '#000'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-6, -13); ctx.lineTo(-2, -10); ctx.moveTo(6, -13); ctx.lineTo(2, -10); ctx.stroke();
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(-3, -9, 1.5, 0, Math.PI*2); ctx.arc(3, -9, 1.5, 0, Math.PI*2); ctx.fill();
    // Yell
    ctx.beginPath(); ctx.arc(0, -6, 3, 0, Math.PI*2); ctx.fill();

    // ---------------- Impact Flash ----------------
    if(swing < -0.8) {
        ctx.fillStyle = '#ffcf40'; 
        ctx.beginPath();
        ctx.arc(-25, 10, 15 + Math.random()*15, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = '#ff0000';
        ctx.font = 'bold 8px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('BAM!', -25, 10);
    }

    ctx.restore();
}

// Game Loop
let lastTime = 0;
function loop(timestamp) {
    let dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;
    if (dt > 0.1) dt = 0.1; // Cap dt

    if (gameState === 'PLAYING') {
        update(dt);
        draw();
    } else if (gameState === 'GAMEOVER') {
        drawGameOverAnimation(dt);
    }
    requestAnimationFrame(loop);
}

// Initialization & Event Listeners
document.getElementById('btn-play').addEventListener('click', () => {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('tutorial-screen').classList.remove('hidden');
    // Try play audio
    const bgm = document.getElementById('bgm');
    bgm.volume = 0.2;
    bgm.play().catch(e => console.log("Audio play prevented by browser"));
});

// Tutorial logic
const slides = document.querySelectorAll('.tut-slide');
let curSlide = 0;
document.getElementById('btn-tut-next').addEventListener('click', () => {
    slides[curSlide].classList.add('hidden');
    curSlide++;
    if(curSlide >= slides.length - 1) {
        document.getElementById('btn-tut-next').classList.add('hidden');
        document.getElementById('btn-tut-start').classList.remove('hidden');
    }
    slides[curSlide].classList.remove('hidden');
});

document.getElementById('btn-tut-start').addEventListener('click', () => {
    document.getElementById('tutorial-screen').classList.add('hidden');
    startLevel();
});

document.getElementById('btn-restart').addEventListener('click', () => {
    document.getElementById('game-over-screen').classList.add('hidden');
    score = 0;
    stage = 1;
    startLevel();
});

document.getElementById('btn-shop').addEventListener('click', () => {
    document.getElementById('victory-screen').classList.add('hidden');
    document.getElementById('shop-screen').classList.remove('hidden');
    document.getElementById('shop-points').textContent = shopPoints;
});

// Shop Logic
document.querySelectorAll('.btn-buy').forEach(btn => {
    btn.addEventListener('click', (e) => {
        let item = e.target.dataset.item;
        let cost = parseInt(e.target.dataset.cost);
        if(shopPoints >= cost && !upgrades[item]) {
            shopPoints -= cost;
            upgrades[item] = true;
            e.target.textContent = 'Comprado';
            e.target.disabled = true;
            document.getElementById('shop-points').textContent = shopPoints;
        }
    });
});

document.getElementById('btn-next-stage').addEventListener('click', () => {
    document.getElementById('shop-screen').classList.add('hidden');
    stage++;
    startLevel();
});

// Start loop
requestAnimationFrame(loop);
