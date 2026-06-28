// Constants & Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const TILE_SIZE = 40;
const COLS = 30;
const ROWS = 20;

// Prevent touch actions like scrolling on canvas
canvas.addEventListener('touchstart', e => {
    if(e.target.tagName !== 'BUTTON') e.preventDefault();
}, {passive: false});

// Game State
let gameState = 'START'; // START, TUTORIAL, PLAYING, GAMEOVER, VICTORY, SHOP, AK47_TUTORIAL, AK47_VICTORY
let stage = 1;
let score = 0;
let shopPoints = 0;
let combo = 0;
let comboTimer = 0;
let timeRemaining = 90;
let suspicion = 0; // 0 to 100
let totalCollected = 0;
let backpackCollected = 0;
let requiredPanties = 5;
let distractionsLeft = 0;

// Upgrades Data
const shopData = {
    mochila: [
        { level: 1, name: 'Mochila de Pano', cost: 50, effect: 'Carrega até 2 itens', val: 2 },
        { level: 2, name: 'Mochila de Couro', cost: 100, effect: 'Carrega até 3 itens', val: 3 },
        { level: 3, name: 'Bolsa Tática', cost: 200, effect: 'Carrega até 4 itens', val: 4 },
        { level: 4, name: 'Mochila Militar', cost: 400, effect: 'Carrega até 5 itens', val: 5 },
        { level: 5, name: 'Bolso Dimensional', cost: 800, effect: 'Carrega até 6 itens', val: 6 }
    ],
    tenis: [
        { level: 1, name: 'Chinelo de Dedo', cost: 50, effect: 'Reduz barulho em 10%', val: 0.9 },
        { level: 2, name: 'Tênis de Lona', cost: 100, effect: 'Reduz barulho em 20%', val: 0.8 },
        { level: 3, name: 'Tênis Silencioso', cost: 200, effect: 'Reduz barulho em 35%', val: 0.65 },
        { level: 4, name: 'Pantufa Ninja', cost: 400, effect: 'Reduz barulho em 50%', val: 0.5 },
        { level: 5, name: 'Pés de Algodão', cost: 800, effect: 'Reduz barulho em 70%', val: 0.3 }
    ],
    luva: [
        { level: 1, name: 'Dedos Grudentos', cost: 75, effect: 'Coleta a 1 tile de distância', val: 40 },
        { level: 2, name: 'Luva de Sucção', cost: 150, effect: 'Coleta a 2 tiles de distância', val: 80 },
        { level: 3, name: 'Ímã de Calcinha', cost: 300, effect: 'Coleta a 3 tiles de distância', val: 120 },
        { level: 4, name: 'Telecinese Íntima', cost: 600, effect: 'Coleta a 4 tiles de distância', val: 160 },
        { level: 5, name: 'Buraco Negro de Renda', cost: 1200, effect: 'Coleta a 5 tiles de distância', val: 200 }
    ],
    distracao: [
        { level: 1, name: 'Moeda no Chão', cost: 60, effect: '+1 distração por fase', val: 1 },
        { level: 2, name: 'Gato Falso', cost: 120, effect: '+2 distrações por fase', val: 2 },
        { level: 3, name: 'Bombinha Fedorenta', cost: 240, effect: '+3 distrações por fase', val: 3 },
        { level: 4, name: 'Rádio com Pagode', cost: 480, effect: '+4 distrações por fase', val: 4 },
        { level: 5, name: 'Clone de Fumaça', cost: 960, effect: '+5 distrações por fase', val: 5 }
    ],
    disfarce: [
        { level: 1, name: 'Óculos de Sol', cost: 80, effect: 'Banhistas demoram 1s a mais para te ver', val: 1 },
        { level: 2, name: 'Peruca Loiro', cost: 160, effect: 'Banhistas demoram 2s a mais para te ver', val: 2 },
        { level: 3, name: 'Roupão Felpudo', cost: 320, effect: 'Banhistas demoram 3s a mais para te ver', val: 3 },
        { level: 4, name: 'Pele de Banhista', cost: 640, effect: 'Banhistas demoram 4s a mais para te ver', val: 4 },
        { level: 5, name: 'Manto da Invisibilidade Parcial', cost: 1280, effect: 'Banhistas demoram 5s a mais para te ver', val: 5 }
    ],
    velocidade: [
        { level: 1, name: 'Sandália Velha', cost: 70, effect: '+5% velocidade', val: 1.05 },
        { level: 2, name: 'Crocs Esportivo', cost: 140, effect: '+10% velocidade', val: 1.10 },
        { level: 3, name: 'Tênis de Corrida', cost: 280, effect: '+18% velocidade', val: 1.18 },
        { level: 4, name: 'Pés de Beija-Flor', cost: 560, effect: '+28% velocidade', val: 1.28 },
        { level: 5, name: 'Teletransporte Curto', cost: 1120, effect: '+40% velocidade', val: 1.40 }
    ],
    resistencia: [
        { level: 1, name: 'Cara de Pau', cost: 90, effect: 'Suspeita enche 10% mais devagar', val: 0.9 },
        { level: 2, name: 'Histórico Limpo', cost: 180, effect: 'Suspeita enche 20% mais devagar', val: 0.8 },
        { level: 3, name: 'Álibi Falso', cost: 360, effect: 'Suspeita enche 30% mais devagar', val: 0.7 },
        { level: 4, name: 'Dupla Personalidade', cost: 720, effect: 'Suspeita enche 40% mais devagar', val: 0.6 },
        { level: 5, name: 'Inocente até Provar', cost: 1440, effect: 'Suspeita enche 50% mais devagar', val: 0.5 }
    ]
};

let upgrades = {
    mochila: 0,
    tenis: 0,
    luva: 0,
    distracao: 0,
    disfarce: 0,
    velocidade: 0,
    resistencia: 0
};
let hasAK47 = false;
let ak47TutorialShown = false;

function getUpgradeVal(category, defaultVal) {
    if(upgrades[category] === 0) return defaultVal;
    return shopData[category][upgrades[category]-1].val;
}

// Input
const keys = { w: false, a: false, s: false, d: false, Shift: false, ' ': false, e: false };
let spacePressed = false;
let ePressed = false;
let mousePressed = false;

// Mobile Input mapping
function bindMobileButton(id, key) {
    const btn = document.getElementById(id);
    if(!btn) return;
    const start = (e) => { e.preventDefault(); keys[key] = true; if(key === ' ') spacePressed = true; if(key === 'e') ePressed = true; };
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
bindMobileButton('btn-distraction', 'e');

const shootBtn = document.getElementById('btn-shoot');
const shootStart = (e) => { e.preventDefault(); mousePressed = true; };
shootBtn.addEventListener('touchstart', shootStart);
shootBtn.addEventListener('mousedown', shootStart);

window.addEventListener('keydown', e => {
    if(keys.hasOwnProperty(e.key)) keys[e.key] = true;
    if(keys.hasOwnProperty(e.key.toLowerCase())) keys[e.key.toLowerCase()] = true;
    if(e.key === ' ') spacePressed = true;
    if(e.key.toLowerCase() === 'e') ePressed = true;
});
window.addEventListener('keyup', e => {
    if(keys.hasOwnProperty(e.key)) keys[e.key] = false;
    if(keys.hasOwnProperty(e.key.toLowerCase())) keys[e.key.toLowerCase()] = false;
});
canvas.addEventListener('mousedown', e => {
    if(hasAK47 && gameState === 'PLAYING') mousePressed = true;
});

// Map Layout (30x20)
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
    x: 100, y: 100, size: 28, baseSpeed: 120,
    isHiding: false, facing: 'down',
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath();
        ctx.ellipse(this.size/2, this.size - 2, this.size/2 + 2, 6, 0, 0, Math.PI*2);
        ctx.fill();

        let drawSize = this.isHiding ? this.size * 0.8 : this.size;
        let offsetY = this.isHiding ? this.size * 0.2 : (this.isMoving ? -Math.abs(Math.sin(Date.now()/100)) * 4 : 0);
        
        ctx.translate(this.size/2, this.size/2 + offsetY);
        
        // Weapon on back
        if(hasAK47) {
            ctx.save();
            ctx.rotate(Math.PI/4);
            ctx.fillStyle = '#444';
            ctx.fillRect(-15, -2, 30, 4);
            ctx.fillStyle = '#8b4513';
            ctx.fillRect(-10, -2, 10, 6);
            ctx.restore();
        }

        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(0, drawSize*0.3, drawSize*0.4, Math.PI, 0); 
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.fillRect(-drawSize*0.4, drawSize*0.05, drawSize*0.8, drawSize*0.1);
        ctx.fillRect(-drawSize*0.4, drawSize*0.2, drawSize*0.8, drawSize*0.1);
        ctx.fillStyle = '#ffcc99'; 
        ctx.beginPath();
        ctx.arc(0, -drawSize*0.2, drawSize*0.4, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.ellipse(0, -drawSize*0.2, drawSize*0.45, drawSize*0.15, 0, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(-drawSize*0.15, -drawSize*0.2, drawSize*0.06, 0, Math.PI*2);
        ctx.arc(drawSize*0.15, -drawSize*0.2, drawSize*0.06, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.arc(0, -drawSize*0.4, drawSize*0.35, Math.PI, 0);
        ctx.fill();

        // AK47 shooting anim
        if(this.isShooting) {
            ctx.fillStyle = '#444';
            ctx.save();
            ctx.rotate(this.shootAngle);
            ctx.fillRect(0, -2, 30, 4);
            ctx.fillStyle = '#8b4513';
            ctx.fillRect(0, 0, 8, 8);
            ctx.fillStyle = 'gold';
            ctx.beginPath(); ctx.arc(32, 0, 6, 0, Math.PI*2); ctx.fill();
            ctx.restore();
        }

        ctx.restore();
    }
};

let enemy = {
    active: false, dead: false,
    x: 0, y: 0, size: 30, baseSpeed: 100,
    state: 'patrol',
    targetX: 0, targetY: 0,
    pathTimer: 0, nextTarget: null,
    distractionTimer: 0,
    draw(ctx) {
        if(!this.active) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        
        if(this.dead) {
            ctx.fillStyle = '#800020';
            ctx.fillRect(0, 20, 30, 10);
            ctx.fillStyle = 'red';
            ctx.beginPath(); ctx.ellipse(15, 30, 25, 10, 0, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#f5cba7';
            ctx.beginPath(); ctx.arc(30, 25, 10, 0, Math.PI*2); ctx.fill();
            ctx.restore();
            return;
        }

        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath(); ctx.ellipse(this.size/2, this.size - 2, this.size/2 + 4, 8, 0, 0, Math.PI*2); ctx.fill();

        let bob = (this.state === 'chase') ? Math.abs(Math.sin(Date.now()/100)) * 6 : Math.abs(Math.sin(Date.now()/150)) * 3;
        ctx.translate(this.size/2, this.size/2 - bob);

        ctx.save();
        if(this.state === 'chase') ctx.rotate(Math.sin(Date.now()/100) * 0.5 + 0.5); 
        else ctx.rotate(0.2); 
        ctx.fillStyle = '#8b4513';
        ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(25, -20); ctx.lineTo(32, -18); ctx.lineTo(15, 5); ctx.fill();
        ctx.fillStyle = '#654321'; 
        ctx.beginPath(); ctx.moveTo(25, -15); ctx.lineTo(30, -12); ctx.stroke();
        ctx.restore();

        ctx.fillStyle = '#800020';
        ctx.beginPath(); ctx.moveTo(0, -this.size*0.1); ctx.lineTo(-this.size*0.6, this.size*0.5); ctx.lineTo(this.size*0.6, this.size*0.5); ctx.fill();

        ctx.fillStyle = '#f5cba7'; 
        ctx.beginPath(); ctx.arc(0, -this.size*0.3, this.size*0.35, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#4a2311'; 
        ctx.beginPath(); ctx.arc(0, -this.size*0.6, this.size*0.2, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(0, -this.size*0.4, this.size*0.36, Math.PI, 0); ctx.fill();

        ctx.strokeStyle = '#000'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(-this.size*0.2, -this.size*0.4); ctx.lineTo(-this.size*0.05, -this.size*0.25);
        ctx.moveTo(this.size*0.2, -this.size*0.4); ctx.lineTo(this.size*0.05, -this.size*0.25); ctx.stroke();
        
        ctx.fillStyle = '#000';
        ctx.beginPath(); ctx.arc(-this.size*0.1, -this.size*0.25, 3, 0, Math.PI*2); ctx.arc(this.size*0.1, -this.size*0.25, 3, 0, Math.PI*2); ctx.fill();

        if(this.state === 'chase') {
            ctx.fillStyle = 'red'; ctx.font = 'bold 24px Fredoka One'; ctx.fillText('!', 0, -this.size);
        } else if(this.state === 'search') {
            ctx.fillStyle = '#ffcf40'; ctx.font = 'bold 20px Fredoka One'; ctx.fillText('?', 0, -this.size);
        } else if(this.state === 'distracted') {
            ctx.fillStyle = '#ffcf40'; ctx.font = 'bold 20px Fredoka One'; ctx.fillText('❤️', 0, -this.size);
        }
        ctx.restore();
    }
};

let panties = [];
let particles = [];
let bathers = [];
let distractions = [];
let lastPantySpawn = 0;

const pantyTypes = [
    { type: 'Bolinhas', pts: 10, icon: '🩲', color: '#ffb3ba' },
    { type: 'Listrada', pts: 15, icon: '🩲', color: '#baffc9' },
    { type: 'Renda', pts: 25, icon: '👙', color: '#000', noise: true },
    { type: 'Neon', pts: 50, icon: '👙', color: '#ffffba', rare: true },
    { type: 'Armadilha', pts: -20, icon: '🩲', color: 'red', trap: true }
];

// Utility
function checkCollision(rect1, rect2) {
    let r1w = rect1.width || rect1.size; let r1h = rect1.height || rect1.size;
    let r2w = rect2.width || rect2.size; let r2h = rect2.height || rect2.size;
    return rect1.x < rect2.x + r2w && rect1.x + r1w > rect2.x && rect1.y < rect2.y + r2h && rect1.y + r1h > rect2.y;
}

function checkMapCollision(x, y, size) {
    const corners = [ {cx: x, cy: y}, {cx: x + size, cy: y}, {cx: x, cy: y + size}, {cx: x + size, cy: y + size} ];
    for(let c of corners) {
        let col = Math.floor(c.cx / TILE_SIZE); let row = Math.floor(c.cy / TILE_SIZE);
        if(row >= 0 && row < ROWS && col >= 0 && col < COLS) {
            if(['W', 'B', 'L'].includes(mapLayout[row][col])) return true;
        } else return true;
    }
    return false;
}

function getTileAt(x, y, size) {
    let col = Math.floor((x + size/2) / TILE_SIZE); let row = Math.floor((y + size/2) / TILE_SIZE);
    if(row >= 0 && row < ROWS && col >= 0 && col < COLS) return mapLayout[row][col];
    return null;
}

function getNextStep(startR, startC, targetR, targetC) {
    if(startR === targetR && startC === targetC) return null;
    let queue = [{r: startR, c: startC, path: []}];
    let visited = new Set([`${startR},${startC}`]);
    let dirs = [[-1,0],[1,0],[0,-1],[0,1]];
    let iters = 0;
    while(queue.length > 0 && iters < 1000) {
        iters++; let curr = queue.shift();
        if(curr.r === targetR && curr.c === targetC) return curr.path[0];
        for(let d of dirs) {
            let nr = curr.r + d[0]; let nc = curr.c + d[1];
            if(nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && !visited.has(`${nr},${nc}`)) {
                if(!['W', 'B', 'L'].includes(mapLayout[nr][nc])) {
                    visited.add(`${nr},${nc}`);
                    queue.push({r: nr, c: nc, path: [...curr.path, {r: nr, c: nc}]});
                }
            }
        }
    }
    return null;
}

function checkLoS(x1, y1, x2, y2) {
    let dx = x2 - x1; let dy = y2 - y1; let steps = 20;
    let startCol = Math.floor(x1 / TILE_SIZE); let startRow = Math.floor(y1 / TILE_SIZE);
    let targetCol = Math.floor(x2 / TILE_SIZE); let targetRow = Math.floor(y2 / TILE_SIZE);
    for(let i=1; i<=steps; i++) {
        let cx = x1 + dx * (i/steps); let cy = y1 + dy * (i/steps);
        let col = Math.floor(cx / TILE_SIZE); let row = Math.floor(cy / TILE_SIZE);
        if(col === targetCol && row === targetRow) continue;
        if(col === startCol && row === startRow) continue;
        if(row >= 0 && row < ROWS && col >= 0 && col < COLS) {
            if(['W', 'L', 'B'].includes(mapLayout[row][col])) return false;
        }
    }
    return true;
}

function spawnPanty() {
    let attempts = 0;
    while(attempts < 50) {
        let col = Math.floor(Math.random() * COLS); let row = Math.floor(Math.random() * ROWS);
        if(['.', 'C', 'R'].includes(mapLayout[row][col])) {
            let rand = Math.random();
            let trapChance = stage <= 5 ? 0.1 : (stage <= 10 ? 0.2 : (stage <= 15 ? 0.3 : 0.4));
            let pType = pantyTypes[0];
            if(rand < trapChance) pType = pantyTypes[4];
            else if(rand > 0.95) pType = pantyTypes[3];
            else if(rand > 0.8) pType = pantyTypes[2];
            else if(rand > 0.4) pType = pantyTypes[1];

            panties.push({ x: col * TILE_SIZE + 5, y: row * TILE_SIZE + 5, width: 30, height: 30, type: pType, pulse: 0 });
            return;
        }
        attempts++;
    }
}

function showToast(msg) {
    const toast = document.getElementById('message-toast');
    toast.textContent = msg; toast.classList.remove('hidden');
    toast.style.animation = 'none'; toast.offsetHeight; toast.style.animation = null; 
    setTimeout(() => toast.classList.add('hidden'), 2000);
}

function spawnParticle(x, y, text, color) { particles.push({ x, y, text, color, life: 1, maxLife: 1, vy: -50, type: 'text' }); }
function spawnNoiseRing(x, y) { particles.push({ type: 'ring', x: x + player.size/2, y: y + player.size/2, radius: 10, maxRadius: 60, life: 0.5, maxLife: 0.5 }); }
function spawnBlood(x, y) { particles.push({ type: 'blood', x: x + 15, y: y + 25, radius: 10, maxRadius: 40, life: 10, maxLife: 10 }); }

function updateHUD() {
    document.getElementById('stage-name').textContent = `Fase ${stage}`;
    let m = Math.floor(timeRemaining / 60).toString().padStart(2, '0');
    let s = Math.floor(timeRemaining % 60).toString().padStart(2, '0');
    document.getElementById('timer').textContent = `⏱️ ${m}:${s}`;
    document.getElementById('score').textContent = `Score: ${score}`;
    
    if(combo > 1) { document.getElementById('combo').textContent = `Combo x${combo}!`; document.getElementById('combo').classList.remove('hidden'); }
    else document.getElementById('combo').classList.add('hidden');

    document.getElementById('panty-counter').textContent = `🩲 ${totalCollected}/${requiredPanties}`;
    
    let cap = getUpgradeVal('mochila', 1);
    let capLabel = document.getElementById('capacity-counter');
    if(backpackCollected >= cap) capLabel.classList.remove('hidden');
    else capLabel.classList.add('hidden');
    
    document.getElementById('dist-count').textContent = distractionsLeft;
    if(distractionsLeft > 0) document.getElementById('distraction-counter').classList.remove('hidden');
    
    const sBar = document.getElementById('suspicion-bar');
    sBar.style.width = `${Math.min(100, suspicion)}%`;
    if(suspicion < 50) sBar.style.background = 'linear-gradient(90deg, #4facfe, #00f2fe)';
    else if(suspicion < 80) sBar.style.background = 'linear-gradient(90deg, #f6d365, #fda085)';
    else sBar.style.background = 'linear-gradient(90deg, #ff0844, #ffb199)';
}

function setupBathers() {
    bathers = [];
    let batherCount = stage <= 2 ? 0 : (stage <= 6 ? 1 : (stage <= 10 ? 2 : 3 + Math.floor((stage-11)/3)));
    
    let speedMult = stage <= 3 ? 1.0 : (stage <= 6 ? 1.1 : (stage <= 9 ? 1.2 : (stage <= 12 ? 1.3 : 1.5)));
    let cone = stage <= 3 ? 90 : (stage <= 6 ? 100 : (stage <= 9 ? 110 : (stage <= 12 ? 120 : 130)));
    let reaction = stage <= 3 ? 0.8 : (stage <= 6 ? 0.6 : (stage <= 9 ? 0.5 : (stage <= 12 ? 0.4 : 0.3)));
    let screamSus = stage <= 3 ? 40 : (stage <= 6 ? 45 : (stage <= 9 ? 50 : (stage <= 12 ? 55 : 60)));

    for(let i=0; i<batherCount; i++) {
        let type = 'normal';
        if(stage >= 15 && Math.random() < 0.2) type = 'celular';
        else if(stage >= 12 && Math.random() < 0.3) type = 'atleta';
        else if(stage >= 8 && Math.random() < 0.3) type = 'fofoqueira';

        let r, c;
        do {
            r = Math.floor(Math.random()*ROWS); c = Math.floor(Math.random()*COLS);
        } while(['W','B','L','E'].includes(mapLayout[r][c]));

        bathers.push({
            x: c*TILE_SIZE, y: r*TILE_SIZE, size: 28, type: type,
            speed: (type === 'atleta' ? 1.5 : (type === 'fofoqueira' ? 0.6 : 1.0)) * 80 * speedMult,
            cone: type === 'fofoqueira' ? 360 : cone,
            reactTime: reaction,
            screamSus: screamSus,
            targetX: c*TILE_SIZE, targetY: r*TILE_SIZE,
            state: 'walk',
            alertTimer: 0,
            seeTimer: 0,
            angle: 0
        });
    }
}

function startLevel() {
    timeRemaining = 90 - (stage > 2 ? (stage-2)*5 : 0);
    if(timeRemaining < 60) timeRemaining = 60;
    
    suspicion = 0;
    totalCollected = 0;
    backpackCollected = 0;
    requiredPanties = 4 + stage;
    panties = []; particles = []; distractions = [];
    distractionsLeft = getUpgradeVal('distracao', 0);
    
    enemy.active = false; enemy.dead = false;
    setupBathers();

    for(let r=0; r<ROWS; r++) {
        for(let c=0; c<COLS; c++) {
            if(mapLayout[r][c] === 'E') { player.x = c*TILE_SIZE; player.y = r*TILE_SIZE; }
        }
    }
    for(let i=0; i<4; i++) spawnPanty();
    
    gameState = 'PLAYING';
    document.getElementById('hud').classList.remove('hidden');
    if(hasAK47) {
        document.getElementById('btn-shoot').classList.remove('hidden');
    }
    if(distractionsLeft > 0) {
        document.getElementById('btn-distraction').classList.remove('hidden');
    }
    if(window.innerWidth <= 1250) document.getElementById('mobile-controls').classList.remove('hidden');
}

function update(dt) {
    if(timeRemaining > 0) {
        timeRemaining -= dt;
        if(timeRemaining <= 0) {
            if(totalCollected >= requiredPanties) triggerWin();
            else gameOver();
        }
    }

    if(comboTimer > 0) { comboTimer -= dt; if(comboTimer <= 0) combo = 0; }
    
    let resMult = getUpgradeVal('resistencia', 1.0);
    if(suspicion > 0 && !enemy.active) suspicion = Math.max(0, suspicion - 2*dt);

    let dx = 0; let dy = 0;
    let speed = player.baseSpeed * getUpgradeVal('velocidade', 1.0);
    let isRunning = false;

    if(keys.Shift || keys.shift) { speed *= 1.8; isRunning = true; }
    if(keys.w || keys.W) dy = -speed;
    if(keys.s || keys.S) dy = speed;
    if(keys.a || keys.A) dx = -speed;
    if(keys.d || keys.D) dx = speed;

    if(dx !== 0 && dy !== 0) {
        let length = Math.sqrt(dx*dx + dy*dy);
        dx = (dx/length) * speed; dy = (dy/length) * speed;
    }

    let isMoving = dx !== 0 || dy !== 0;
    if(isMoving) player.facingAngle = Math.atan2(dy, dx);

    if(!checkMapCollision(player.x + dx*dt, player.y, player.size)) player.x += dx*dt;
    if(!checkMapCollision(player.x, player.y + dy*dt, player.size)) player.y += dy*dt;
    player.isMoving = isMoving;

    let currentTile = getTileAt(player.x, player.y, player.size);
    player.isHiding = (currentTile === 'P' || currentTile === 'R') && !isMoving;
    
    let noiseFactor = getUpgradeVal('tenis', 1.0);
    if(currentTile === 'R') noiseFactor *= 0.5;

    if(isMoving && isRunning) {
        suspicion += 20 * dt * noiseFactor * resMult; 
        if(Math.random() < 0.2) spawnNoiseRing(player.x, player.y);
    }

    let disfarceDelay = getUpgradeVal('disfarce', 0); // 0 to 5s
    
    // Distraction logic
    if(ePressed && distractionsLeft > 0) {
        ePressed = false; distractionsLeft--;
        distractions.push({x: player.x, y: player.y, life: 5});
        spawnParticle(player.x, player.y, "🎶", "#fff");
        spawnNoiseRing(player.x, player.y); spawnNoiseRing(player.x, player.y);
    }

    // Update distractions
    for(let i=distractions.length-1; i>=0; i--) {
        distractions[i].life -= dt;
        if(distractions[i].life <= 0) distractions.splice(i,1);
    }

    // Bathers Logic
    bathers.forEach(b => {
        if(b.state === 'scream') {
            b.alertTimer -= dt;
            if(b.alertTimer <= 0) b.state = 'walk';
            return;
        }

        // Check nearest distraction
        let distTarget = null;
        distractions.forEach(dist => {
            if(Math.hypot(dist.x - b.x, dist.y - b.y) < 300) distTarget = dist;
        });

        if(distTarget) {
            b.targetX = distTarget.x; b.targetY = distTarget.y;
            b.state = 'distracted';
        } else if (b.state === 'distracted') {
            b.state = 'walk';
        }

        if(b.state === 'walk') {
            let edx = b.targetX - b.x; let edy = b.targetY - b.y;
            let d = Math.hypot(edx, edy);
            if(d < 10 || Math.random() < 0.01) {
                let r = Math.floor(Math.random()*ROWS); let c = Math.floor(Math.random()*COLS);
                if(!['W','B','L','E'].includes(mapLayout[r][c])) {
                    b.targetX = c*TILE_SIZE; b.targetY = r*TILE_SIZE;
                }
            }
            if(d > 2) {
                b.x += (edx/d) * b.speed * dt; b.y += (edy/d) * b.speed * dt;
                b.angle = Math.atan2(edy, edx);
            }
        }

        // Vision cone check
        if(!player.isHiding) {
            let pdx = (player.x + player.size/2) - (b.x + b.size/2);
            let pdy = (player.y + player.size/2) - (b.y + b.size/2);
            let dist = Math.hypot(pdx, pdy);
            
            if(dist < 250) {
                let angleToPlayer = Math.atan2(pdy, pdx);
                let angleDiff = Math.abs(angleToPlayer - b.angle);
                if(angleDiff > Math.PI) angleDiff = 2*Math.PI - angleDiff;
                
                if(b.cone === 360 || angleDiff < (b.cone/2 * Math.PI/180)) {
                    if(checkLoS(b.x + b.size/2, b.y + b.size/2, player.x + player.size/2, player.y + player.size/2)) {
                        b.seeTimer += dt;
                        if(b.seeTimer >= (b.reactTime + disfarceDelay)) {
                            b.state = 'scream'; b.alertTimer = 3; b.seeTimer = 0;
                            suspicion += b.screamSus * resMult;
                            showToast("😱 AHHH! INVASOR!");
                            spawnParticle(b.x, b.y, "😱", "#fff");
                            spawnNoiseRing(b.x, b.y);
                        }
                    } else b.seeTimer = 0;
                } else b.seeTimer = 0;
            } else b.seeTimer = 0;
        } else b.seeTimer = 0;
    });

    // Pick up panties
    if(spacePressed) {
        spacePressed = false;
        let cap = getUpgradeVal('mochila', 1);
        if(backpackCollected < cap) {
            let pickRange = getUpgradeVal('luva', 0);
            let pRect = {x: player.x - pickRange, y: player.y - pickRange, width: player.size + pickRange*2, height: player.size + pickRange*2};
            
            for(let i = panties.length - 1; i >= 0; i--) {
                let p = panties[i];
                if(checkCollision(pRect, p)) {
                    if(p.type.trap) {
                        score = Math.max(0, score - 20); suspicion += 30 * resMult;
                        showToast("🚨 ARMADILHA!"); combo = 0;
                        spawnNoiseRing(player.x, player.y);
                    } else {
                        combo++; comboTimer = 2.5;
                        let mul = combo >= 5 ? 3 : (combo >= 3 ? 2 : 1);
                        let gained = p.type.pts * mul; score += gained;
                        backpackCollected++;
                        if(p.type.noise) { suspicion += 10 * resMult; spawnNoiseRing(player.x, player.y); }
                        if(combo > 2) suspicion += 5 * resMult;
                        spawnParticle(p.x, p.y, `+${gained}`, '#ffcf40');
                    }
                    panties.splice(i, 1);
                    break;
                }
            }
        } else {
            showToast("🎒 Mochila Cheia! Vá à porta.");
        }
    }
    
    // Deposit at exit
    if(currentTile === 'E' && backpackCollected > 0) {
        totalCollected += backpackCollected;
        backpackCollected = 0;
        showToast("Calcinhas Guardadas!");
        spawnParticle(player.x, player.y, "✔️", "#0f0");
        if(totalCollected >= requiredPanties) showToast("PODE FUGIR!");
    }

    // Panty Spawner
    let spawnRate = Math.max(5, 15 - stage*0.5);
    lastPantySpawn += dt;
    let maxOnScreen = 5;
    if(panties.length >= maxOnScreen) lastPantySpawn = 0; // Pause
    if(lastPantySpawn > spawnRate && panties.length < maxOnScreen) {
        spawnPanty(); lastPantySpawn = 0;
    }

    // Enemy Spawn & AI
    let eSpeedMult = stage <= 2 ? 1.0 : (stage <= 4 ? 1.1 : (stage <= 6 ? 1.2 : (stage <= 8 ? 1.3 : (stage <= 10 ? 1.4 : 1.5))));
    if(suspicion >= 100 && !enemy.active && !enemy.dead) {
        enemy.active = true; enemy.speed = enemy.baseSpeed * eSpeedMult;
        for(let r=0; r<ROWS; r++) {
            for(let c=0; c<COLS; c++) {
                if(mapLayout[r][c] === 'E') { enemy.x = c*TILE_SIZE; enemy.y = r*TILE_SIZE; }
            }
        }
        showToast("⚠️ DONA DO BANHEIRO APARECEU!");
    }

    if(enemy.active && !enemy.dead) {
        let hasLoS = checkLoS(enemy.x + enemy.size/2, enemy.y + enemy.size/2, player.x + player.size/2, player.y + player.size/2);
        let distToPlayer = Math.hypot(enemy.x - player.x, enemy.y - player.y);
        
        let distTarget = null;
        distractions.forEach(dist => { if(Math.hypot(dist.x - enemy.x, dist.y - enemy.y) < 400) distTarget = dist; });

        if(distTarget) {
            enemy.state = 'distracted'; enemy.targetX = distTarget.x; enemy.targetY = distTarget.y; enemy.speed = enemy.baseSpeed * eSpeedMult;
        } else if((suspicion >= 100 && !player.isHiding) || (hasLoS && distToPlayer < 400 && !player.isHiding)) {
            enemy.state = 'chase'; enemy.targetX = player.x; enemy.targetY = player.y; 
            enemy.speed = 145 * eSpeedMult; suspicion = 100;
        } else if(enemy.state === 'chase' || enemy.state === 'search') {
            enemy.state = 'search'; enemy.speed = 110 * eSpeedMult;
            if(Math.hypot(enemy.targetX - enemy.x, enemy.targetY - enemy.y) < 20 || Math.random() < 0.02) {
                let r = Math.floor(enemy.y/TILE_SIZE) + Math.floor((Math.random()-0.5)*12);
                let c = Math.floor(enemy.x/TILE_SIZE) + Math.floor((Math.random()-0.5)*12);
                if(r>=0 && r<ROWS && c>=0 && c<COLS && !['W','B','L'].includes(mapLayout[r][c])) {
                    enemy.targetX = c*TILE_SIZE; enemy.targetY = r*TILE_SIZE;
                }
            }
            suspicion -= 10*dt;
            if(suspicion <= 0) { enemy.state = 'leave'; enemy.speed = 100 * eSpeedMult; showToast("Ela desistiu!"); suspicion = 0; }
        } else if(enemy.state === 'patrol') {
            if(Math.random() < 0.02) {
                let r = Math.floor(Math.random()*ROWS); let c = Math.floor(Math.random()*COLS);
                if(!['W','B','L'].includes(mapLayout[r][c])) { enemy.targetX = c*TILE_SIZE; enemy.targetY = r*TILE_SIZE; }
            }
        } else if(enemy.state === 'leave') {
            for(let r=0; r<ROWS; r++) {
                for(let c=0; c<COLS; c++) { if(mapLayout[r][c] === 'E') { enemy.targetX = c*TILE_SIZE; enemy.targetY = r*TILE_SIZE; } }
            }
            if(getTileAt(enemy.x, enemy.y, enemy.size) === 'E') enemy.active = false;
        }

        // Smart Pathfinding Movement
        enemy.pathTimer -= dt;
        if(enemy.pathTimer <= 0 || !enemy.nextTarget) {
            enemy.pathTimer = 0.2;
            let eC = Math.floor((enemy.x + enemy.size/2)/TILE_SIZE); let eR = Math.floor((enemy.y + enemy.size/2)/TILE_SIZE);
            let tC = Math.floor((enemy.targetX)/TILE_SIZE); let tR = Math.floor((enemy.targetY)/TILE_SIZE);
            let step = getNextStep(eR, eC, tR, tC);
            if(step) enemy.nextTarget = { x: step.c*TILE_SIZE + TILE_SIZE/2 - enemy.size/2, y: step.r*TILE_SIZE + TILE_SIZE/2 - enemy.size/2 };
            else enemy.nextTarget = null;
        }

        let mTX = enemy.nextTarget ? enemy.nextTarget.x : enemy.targetX;
        let mTY = enemy.nextTarget ? enemy.nextTarget.y : enemy.targetY;
        let edx = mTX - enemy.x; let edy = mTY - enemy.y; let dist = Math.hypot(edx, edy);
        
        if(dist > 2) {
            let moveX = (edx/dist)*enemy.speed*dt; let moveY = (edy/dist)*enemy.speed*dt;
            if(!checkMapCollision(enemy.x + moveX, enemy.y, enemy.size)) enemy.x += moveX;
            if(!checkMapCollision(enemy.x, enemy.y + moveY, enemy.size)) enemy.y += moveY;
            if(Math.hypot(mTX - enemy.x, mTY - enemy.y) < 5) enemy.nextTarget = null;
        }

        if(checkCollision(player, enemy)) {
            if(player.isHiding) { player.isHiding = false; showToast("Te achei!"); suspicion = 100; }
            else gameOver();
        }
    }

    // Shoot AK47
    if(mousePressed && hasAK47 && enemy.active && !enemy.dead) {
        mousePressed = false;
        player.isShooting = true;
        let ex = enemy.x + enemy.size/2; let ey = enemy.y + enemy.size/2;
        let px = player.x + player.size/2; let py = player.y + player.size/2;
        player.shootAngle = Math.atan2(ey - py, ex - px);
        
        spawnParticle(px + Math.cos(player.shootAngle)*30, py + Math.sin(player.shootAngle)*30, "💥", "#ffcf40");
        
        enemy.dead = true;
        enemy.state = 'dead';
        suspicion = 0;
        spawnBlood(enemy.x, enemy.y);
        showToast("BANG!");
        
        setTimeout(() => { player.isShooting = false; triggerAK47Win(); }, 500);
    } else {
        mousePressed = false;
    }

    if(totalCollected >= requiredPanties && currentTile === 'E' && !enemy.dead) triggerWin();

    // Particles
    for(let i=particles.length-1; i>=0; i--) {
        let p = particles[i]; p.life -= dt;
        if(p.type === 'ring') p.radius += (p.maxRadius - p.radius)*5*dt;
        else if(p.type === 'blood') p.radius += (p.maxRadius - p.radius)*1*dt;
        else p.y += p.vy*dt;
        if(p.life <= 0) particles.splice(i, 1);
    }
    
    panties.forEach(p => p.pulse = (p.pulse + dt*3) % (Math.PI*2));
    updateHUD();
}

function triggerWin() {
    gameState = 'VICTORY';
    score += timeRemaining * 5; // Time bonus
    score += 100 + (stage * 50); // Completion bonus
    document.getElementById('hud').classList.add('hidden');
    document.getElementById('mobile-controls').classList.add('hidden');
    document.getElementById('victory-screen').classList.remove('hidden');
    document.getElementById('victory-stats').textContent = `Score da Fase: ${Math.floor(score)}`;
    shopPoints += Math.floor(score);
    score = 0;
}

function triggerAK47Win() {
    gameState = 'AK47_VICTORY';
    document.getElementById('hud').classList.add('hidden');
    document.getElementById('mobile-controls').classList.add('hidden');
    document.getElementById('ak47-victory-screen').classList.remove('hidden');
}

let gameOverAnimTimer = 0; let gameOverSnapshot = null;
function gameOver() {
    gameState = 'GAMEOVER'; gameOverAnimTimer = 0;
    gameOverSnapshot = document.createElement('canvas');
    gameOverSnapshot.width = canvas.width; gameOverSnapshot.height = canvas.height;
    let octx = gameOverSnapshot.getContext('2d'); octx.filter = 'blur(8px)';
    octx.drawImage(canvas, 0, 0); octx.fillStyle = 'rgba(0,0,0,0.6)'; octx.fillRect(0, 0, canvas.width, canvas.height);
    document.getElementById('hud').classList.add('hidden'); document.getElementById('mobile-controls').classList.add('hidden');
    document.getElementById('game-over-screen').classList.remove('hidden');
    document.getElementById('game-over-stats').textContent = `Fase Alcançada: ${stage}`;
}

function draw() {
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    for(let r=0; r<ROWS; r++) {
        for(let c=0; c<COLS; c++) {
            let tile = mapLayout[r][c]; let x = c*TILE_SIZE; let y = r*TILE_SIZE;
            ctx.fillStyle = (r+c)%2 === 0 ? '#f0f0f0' : '#e0e0e0'; ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            ctx.strokeStyle = '#d0d0d0'; ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);

            if(tile === 'W') { ctx.fillStyle = '#a2d2ff'; ctx.fillRect(x,y,TILE_SIZE,TILE_SIZE); ctx.fillStyle = '#81a4c7'; ctx.fillRect(x, y+TILE_SIZE-5, TILE_SIZE, 5); }
            else if(tile === 'B') { ctx.fillStyle = '#ffcf40'; ctx.fillRect(x,y,TILE_SIZE,TILE_SIZE); ctx.strokeStyle = '#c49a1f'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x+TILE_SIZE-5, y); ctx.lineTo(x+TILE_SIZE-5, y+TILE_SIZE); ctx.stroke(); ctx.lineWidth=1; }
            else if(tile === 'R') { ctx.fillStyle = 'rgba(255,105,180,0.5)'; ctx.fillRect(x+2,y+2,TILE_SIZE-4,TILE_SIZE-4); }
            else if(tile === 'L') { ctx.fillStyle = '#8b5a2b'; ctx.fillRect(x+5,y+5,TILE_SIZE-10,TILE_SIZE-10); }
            else if(tile === 'C') { ctx.strokeStyle = '#555'; ctx.beginPath(); ctx.moveTo(x, y+TILE_SIZE/2); ctx.lineTo(x+TILE_SIZE, y+TILE_SIZE/2); ctx.stroke(); }
            else if(tile === 'E') { ctx.fillStyle = '#87CEEB'; ctx.fillRect(x,y,TILE_SIZE,TILE_SIZE); ctx.font = '20px Arial'; ctx.fillText('🚪', x+TILE_SIZE/2, y+TILE_SIZE/2); }
            else if(tile === 'P') { ctx.fillStyle = '#3d2b1f'; ctx.beginPath(); ctx.arc(x+TILE_SIZE/2, y+TILE_SIZE/2, 10, 0, Math.PI*2); ctx.fill(); }
        }
    }

    // Bathers
    bathers.forEach(b => {
        let cx = b.x + b.size/2; let cy = b.y + b.size/2;
        ctx.fillStyle = '#f1c27d'; ctx.beginPath(); ctx.arc(cx, cy, 12, 0, Math.PI*2); ctx.fill(); // body
        ctx.fillStyle = b.type === 'fofoqueira' ? 'purple' : (b.type === 'atleta' ? 'blue' : 'green');
        ctx.beginPath(); ctx.arc(cx, cy, 12, b.angle - Math.PI/4, b.angle + Math.PI/4); ctx.fill();
        if(b.state === 'scream') { ctx.fillStyle = '#000'; ctx.font = '16px Arial'; ctx.fillText('😱', cx, b.y - 10); }
    });

    panties.forEach(p => {
        let scale = 1 + Math.sin(p.pulse)*0.1; ctx.save(); ctx.translate(p.x + p.width/2, p.y + p.height/2);
        if(p.type.rare) { ctx.shadowColor = p.type.color; ctx.shadowBlur = 10; }
        ctx.scale(scale, scale); ctx.font = '24px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(p.type.icon, 0, 0); ctx.restore();
    });

    distractions.forEach(d => {
        ctx.font = '20px Arial'; ctx.fillText('📻', d.x+player.size/2, d.y+player.size/2);
    });

    player.draw(ctx);
    enemy.draw(ctx);

    for(let r=0; r<ROWS; r++) {
        for(let c=0; c<COLS; c++) {
            if(mapLayout[r][c] === 'P') { ctx.font = '30px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('🪴', c*TILE_SIZE+TILE_SIZE/2, r*TILE_SIZE+TILE_SIZE/2); }
        }
    }

    particles.forEach(p => {
        if(p.type === 'ring') { ctx.strokeStyle = `rgba(255,255,255,${p.life/p.maxLife})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI*2); ctx.stroke(); }
        else if(p.type === 'blood') { ctx.fillStyle = `rgba(200,0,0,${p.life/p.maxLife})`; ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI*2); ctx.fill(); }
        else { ctx.fillStyle = p.color || '#fff'; ctx.globalAlpha = p.life/p.maxLife; ctx.font = 'bold 20px Fredoka One'; ctx.textAlign = 'center'; ctx.fillText(p.text, p.x, p.y); ctx.globalAlpha = 1.0; }
    });
}

function drawGameOverAnimation(dt) {
    gameOverAnimTimer += dt;
    if(gameOverSnapshot) ctx.drawImage(gameOverSnapshot, 0, 0);
    let cx = canvas.width/2; let cy = canvas.height/2; let swing = Math.sin(gameOverAnimTimer*10);
    
    ctx.save(); ctx.translate(cx-80, cy+50); ctx.scale(5, 5);
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.beginPath(); ctx.ellipse(0, 12, 16, 4, 0, 0, Math.PI*2); ctx.fill();
    ctx.scale(1, swing < -0.5 ? 0.6 : 1.0);
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 8, 11, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#ffcc99'; ctx.beginPath(); ctx.arc(0, -5, 11, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-6, -7); ctx.lineTo(-2, -3); ctx.moveTo(-2, -7); ctx.lineTo(-6, -3); ctx.moveTo(2, -7); ctx.lineTo(6, -3); ctx.moveTo(6, -7); ctx.lineTo(2, -3); ctx.stroke();
    ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(0, -11, 10, Math.PI, 0); ctx.fill();
    ctx.restore();

    ctx.save(); ctx.translate(cx+80, cy+20); ctx.scale(5, 5);
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.beginPath(); ctx.ellipse(0, 13, 19, 5, 0, 0, Math.PI*2); ctx.fill();
    ctx.save(); ctx.rotate(-1.2 + swing*1.8); ctx.fillStyle = '#8b4513'; ctx.beginPath(); ctx.moveTo(10,0); ctx.lineTo(25,-20); ctx.lineTo(32,-18); ctx.lineTo(15,5); ctx.fill(); ctx.restore();
    ctx.fillStyle = '#800020'; ctx.beginPath(); ctx.moveTo(0, -3); ctx.lineTo(-18, 15); ctx.lineTo(18, 15); ctx.fill();
    ctx.fillStyle = '#f5cba7'; ctx.beginPath(); ctx.arc(0, -9, 10, 0, Math.PI*2); ctx.fill();
    if(swing < -0.8) { ctx.fillStyle = '#ffcf40'; ctx.beginPath(); ctx.arc(-32, 6, 15+Math.random()*10, 0, Math.PI*2); ctx.fill(); ctx.fillStyle = 'red'; ctx.font = '8px Arial'; ctx.fillText('BAM!', -40, 8); }
    ctx.restore();
}

let lastTime = 0;
function loop(timestamp) {
    let dt = (timestamp - lastTime)/1000; lastTime = timestamp; if(dt > 0.1) dt = 0.1;
    if(gameState === 'PLAYING') { update(dt); draw(); }
    else if(gameState === 'GAMEOVER') drawGameOverAnimation(dt);
    requestAnimationFrame(loop);
}

// UI Buttons
document.getElementById('btn-play').addEventListener('click', () => {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('tutorial-screen').classList.remove('hidden');
});
document.getElementById('btn-tut-next').addEventListener('click', () => {
    const slides = document.querySelectorAll('.tut-slide');
    let active = [...slides].findIndex(s => !s.classList.contains('hidden'));
    slides[active].classList.add('hidden');
    if(active + 1 < slides.length) {
        slides[active+1].classList.remove('hidden');
        if(active + 1 === slides.length - 1) { document.getElementById('btn-tut-next').classList.add('hidden'); document.getElementById('btn-tut-start').classList.remove('hidden'); }
    }
});
document.getElementById('btn-tut-start').addEventListener('click', () => { document.getElementById('tutorial-screen').classList.add('hidden'); startLevel(); });
document.getElementById('btn-restart').addEventListener('click', () => { document.getElementById('game-over-screen').classList.add('hidden'); score = 0; shopPoints = 0; stage = 1; startLevel(); });
document.getElementById('btn-shop').addEventListener('click', () => { document.getElementById('victory-screen').classList.add('hidden'); document.getElementById('shop-screen').classList.remove('hidden'); renderShop(); });

document.getElementById('btn-ak47-next').addEventListener('click', () => {
    shopPoints += 500; document.getElementById('ak47-victory-screen').classList.add('hidden');
    document.getElementById('shop-screen').classList.remove('hidden'); renderShop();
});
document.getElementById('btn-ak47-continue').addEventListener('click', () => {
    document.getElementById('ak47-tutorial-screen').classList.add('hidden');
    startLevel();
});

let currentTab = 'mochila';
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active'); currentTab = btn.dataset.tab; renderShop();
    });
});
document.getElementById('btn-next-stage').addEventListener('click', () => {
    document.getElementById('shop-screen').classList.add('hidden');
    stage++;
    if(hasAK47 && !ak47TutorialShown) {
        ak47TutorialShown = true;
        document.getElementById('ak47-tutorial-screen').classList.remove('hidden');
    } else {
        startLevel();
    }
});

document.getElementById('btn-buy-ak47').addEventListener('click', (e) => {
    if(shopPoints >= 10000 && !hasAK47) {
        shopPoints -= 10000; hasAK47 = true;
        e.target.textContent = 'EQUIPADA'; e.target.disabled = true; renderShop();
    }
});

function renderShop() {
    document.getElementById('shop-points').textContent = shopPoints;
    let content = document.getElementById('shop-content'); content.innerHTML = '';
    let categoryData = shopData[currentTab];
    let currLvl = upgrades[currentTab];
    
    categoryData.forEach((item, idx) => {
        let div = document.createElement('div');
        div.className = 'shop-item';
        let isAcquired = idx < currLvl;
        let isNext = idx === currLvl;
        let isLocked = idx > currLvl;
        
        if(isAcquired) div.classList.add('acquired');
        if(isNext) div.classList.add('next');
        if(isLocked) div.classList.add('locked');

        div.innerHTML = `
            <div class="item-info">
                <h3>Lvl ${item.level}: ${item.name}</h3>
                <p>${item.effect}</p>
            </div>
            <button class="btn-buy ${isAcquired ? 'acquired-btn' : ''}" ${!isNext || shopPoints < item.cost ? 'disabled' : ''} onclick="buyUpgrade('${currentTab}', ${item.cost})">${isAcquired ? 'Adquirido' : item.cost + ' pts'}</button>
        `;
        content.appendChild(div);
    });

    let totalLvl = Object.values(upgrades).reduce((a, b) => a + b, 0);
    document.getElementById('total-level').textContent = totalLvl;

    if(totalLvl === 35) {
        document.getElementById('ak47-shop-item').classList.remove('hidden');
        if(hasAK47) {
            document.getElementById('btn-buy-ak47').textContent = 'EQUIPADA';
            document.getElementById('btn-buy-ak47').disabled = true;
        } else {
            document.getElementById('btn-buy-ak47').disabled = (shopPoints < 10000);
        }
    }
}
window.buyUpgrade = function(cat, cost) {
    if(shopPoints >= cost && upgrades[cat] < 5) {
        shopPoints -= cost; upgrades[cat]++; renderShop();
    }
};

requestAnimationFrame(loop);
