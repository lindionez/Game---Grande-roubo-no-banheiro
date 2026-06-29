// Constants & Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const TILE_SIZE = 40;
const COLS = 30;
const ROWS = 20;

// Prevent touch actions like scrolling on canvas
canvas.addEventListener('touchstart', e => {
    if (e.target.tagName !== 'BUTTON') e.preventDefault();
}, { passive: false });

// Game State
let gameState = 'START'; // START, TUTORIAL, PLAYING, GAMEOVER, VICTORY, SHOP, AK47_TUTORIAL, AK47_VICTORY, PAUSED
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

// Cheat System Variables
let cheatWCount = 0;
let cheatLastW = 0;
let cheatHoldingSpace = false;
let cheatTimer = 0;

let lastInvasionToast = 0;

// Upgrades Data
const shopData = {
    mochila: [
        { level: 1, name: 'Mochila de Pano', cost: 150, effect: 'Carrega até 4 itens', val: 4 },
        { level: 2, name: 'Mochila de Couro', cost: 400, effect: 'Carrega até 6 itens', val: 6 },
        { level: 3, name: 'Bolsa Tática', cost: 500, effect: 'Carrega até 10 itens', val: 10 },
        { level: 4, name: 'Mochila Militar', cost: 700, effect: 'Carrega até 15 itens', val: 15 },
        { level: 5, name: 'Vestindo o Estoque', cost: 1300, effect: 'Carrega até 25 itens', val: 25 }
    ],
    tenis: [
        { level: 1, name: 'Chinelo de Dedo', cost: 100, effect: 'Reduz barulho em 10%', val: 0.9 },
        { level: 2, name: 'Tênis de Lona', cost: 200, effect: 'Reduz barulho em 20%', val: 0.8 },
        { level: 3, name: 'Tênis Silencioso', cost: 600, effect: 'Reduz barulho em 35%', val: 0.65 },
        { level: 4, name: 'Pantufa Ninja', cost: 900, effect: 'Reduz barulho em 50%', val: 0.5 },
        { level: 5, name: 'Pés de Algodão', cost: 1800, effect: 'Reduz barulho em 70%', val: 0.3 }
    ],
    luva: [
        { level: 1, name: 'Dedos Grudentos', cost: 125, effect: 'Coleta a 1 bloco de distância', val: 40 },
        { level: 2, name: 'Luva de Sucção', cost: 530, effect: 'Coleta a 2 blocos de distância', val: 80 },
        { level: 3, name: 'Ímã de Calcinha', cost: 700, effect: 'Coleta a 3 blocos de distância', val: 120 },
        { level: 4, name: 'Telecinese Íntima', cost: 1800, effect: 'Coleta a 4 blocos de distância', val: 160 },
        { level: 5, name: 'Buraco Negro de Renda', cost: 3000, effect: 'Coleta a 5 blocos de distância', val: 200 }
    ],
    distracao: [
        { level: 1, name: 'Moeda no Chão', cost: 60, effect: '+1 distração por fase', val: 1 },
        { level: 2, name: 'Gato Falso', cost: 250, effect: '+2 distrações por fase', val: 2 },
        { level: 3, name: 'Bombinha Fedorenta', cost: 440, effect: '+3 distrações por fase', val: 3 },
        { level: 4, name: 'Rádio com Pagode', cost: 1280, effect: '+4 distrações por fase', val: 4 },
        { level: 5, name: 'Clone de Fumaça', cost: 1960, effect: '+5 distrações por fase', val: 5 }
    ],
    velocidade: [
        { level: 1, name: 'Sandália Velha', cost: 70, effect: '+5% velocidade', val: 1.05 },
        { level: 2, name: 'Crocs Esportivo', cost: 240, effect: '+10% velocidade', val: 1.10 },
        { level: 3, name: 'Tênis de Corrida', cost: 380, effect: '+18% velocidade', val: 1.18 },
        { level: 4, name: 'Pés de Beija-Flor', cost: 660, effect: '+25% velocidade', val: 1.25 },
        { level: 5, name: 'Teletransporte Curto', cost: 1520, effect: '+40% velocidade', val: 1.40 }
    ],
    resistencia: [
        { level: 1, name: 'Cara de Pau', cost: 90, effect: 'Suspeita enche 10% mais devagar', val: 0.9 },
        { level: 2, name: 'Histórico Limpo', cost: 280, effect: 'Suspeita enche 20% mais devagar', val: 0.8 },
        { level: 3, name: 'Álibi Falso', cost: 450, effect: 'Suspeita enche 30% mais devagar', val: 0.7 },
        { level: 4, name: 'Dupla Personalidade', cost: 920, effect: 'Suspeita enche 40% mais devagar', val: 0.6 },
        { level: 5, name: 'Inocente até Provar o mel', cost: 2027, effect: 'Suspeita enche 50% mais devagar', val: 0.5 }
    ],
    spawn: [
        { level: 1, name: 'Atração Básica', cost: 200, effect: 'Calcinhas spawnam 10% mais rápido', val: 0.9 },
        { level: 2, name: 'Cheiro Suave', cost: 400, effect: 'Calcinhas spawnam 20% mais rápido', val: 0.8 },
        { level: 3, name: 'Ímã Natural', cost: 600, effect: 'Calcinhas spawnam 35% mais rápido', val: 0.65 },
        { level: 4, name: 'Chuva de Renda', cost: 1200, effect: 'Calcinhas spawnam 50% mais rápido', val: 0.5 },
        { level: 5, name: 'Tempestade Íntima', cost: 2222, effect: 'Calcinhas spawnam 70% mais rápido', val: 0.3 }
    ],
    visao: [
        { level: 1, name: 'Miopia Leve', cost: 150, effect: 'Banhistas enxergam 5% menos longe', val: 0.95 },
        { level: 2, name: 'Astigmatismo', cost: 300, effect: 'Banhistas enxergam 10% menos longe', val: 0.9 },
        { level: 3, name: 'Vista Cansada', cost: 600, effect: 'Banhistas enxergam 15% menos longe', val: 0.85 },
        { level: 4, name: 'Catarata Precoce', cost: 1100, effect: 'Banhistas enxergam 20% menos longe', val: 0.8 },
        { level: 5, name: 'Quase Cegas de paixão', cost: 2000, effect: 'Banhistas enxergam 30% menos longe', val: 0.7 }
    ],
    alerta: [
        { level: 1, name: 'Esquecimento', cost: 120, effect: 'Alerta desce 10% mais rápido', val: 1.1 },
        { level: 2, name: 'Mente Ocupada', cost: 200, effect: 'Alerta desce 25% mais rápido', val: 1.25 },
        { level: 3, name: 'Desatenção', cost: 600, effect: 'Alerta desce 40% mais rápido', val: 1.4 },
        { level: 4, name: 'Amnésia', cost: 1900, effect: 'Alerta desce 60% mais rápido', val: 1.6 },
        { level: 5, name: 'Paz Interna', cost: 2500, effect: 'Alerta desce 100% mais rápido', val: 2.0 }
    ]
};

let upgrades = {
    mochila: 0, tenis: 0, luva: 0, distracao: 0, velocidade: 0, resistencia: 0,
    spawn: 0, visao: 0, alerta: 0
};
let hasAK47 = false;
let ak47SecretUnlocked = false;
let ak47TutorialShown = false;
let ak47VictoryShown = false;
let agarradeiraTutorialShown = false;

function getUpgradeVal(category, defaultVal) {
    if (upgrades[category] === 0) return defaultVal;
    return shopData[category][upgrades[category] - 1].val;
}

// Input
const keys = { w: false, a: false, s: false, d: false, Shift: false, ' ': false, e: false };
let spacePressed = false;
let ePressed = false;
let mousePressed = false;

function handleUpPress() {
    if (keys[' '] || spacePressed) { cheatWCount = 0; return; }
    let now = Date.now();
    if (now - cheatLastW < 400) cheatWCount++;
    else cheatWCount = 1;
    cheatLastW = now;
}

function handleSpacePress() {
    if (cheatWCount >= 2 && (Date.now() - cheatLastW) < 1000) {
        cheatHoldingSpace = true;
        cheatTimer = 0;
    }
}

function handleSpaceRelease() {
    cheatHoldingSpace = false;
    cheatTimer = 0;
    cheatWCount = 0;
}

function openCheatMenu() {
    unlockConquista('c31');
    cheatLastGameState = gameState;
    if (gameState === 'PLAYING') {
        gameState = 'PAUSED';
        document.getElementById('pause-screen').classList.remove('hidden');
    }
    document.getElementById('cheat-stage').value = stage;
    document.getElementById('cheat-points').value = 10000;
    document.getElementById('cheat-screen').classList.remove('hidden');
}

function bindMobileButton(id, key) {
    const btn = document.getElementById(id);
    if (!btn) return;
    const start = (e) => {
        e.preventDefault();
        keys[key] = true;
        if (key === ' ') { spacePressed = true; handleSpacePress(); }
        if (key === 'e') ePressed = true;
        if (key === 'w' || key === 'ArrowUp') handleUpPress();
    };
    const end = (e) => {
        e.preventDefault();
        keys[key] = false;
        if (key === ' ') handleSpaceRelease();
    };
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

const pauseAction = (e) => {
    if (e) e.preventDefault();
    if (gameState === 'PLAYING') {
        if (window.audioMgr && window.audioMgr.ctx) window.audioMgr.ctx.suspend();
        gameState = 'PAUSED';
        let isMobile = window.innerWidth <= 1250;
        document.getElementById('pause-desc').innerHTML = isMobile ?
            "Toque no botão abaixo para voltar" :
            "Pressione ESC ou clique no botão para voltar";
        document.getElementById('pause-screen').classList.remove('hidden');
    }
};

window.addEventListener('keydown', e => {
    if (keys.hasOwnProperty(e.key)) keys[e.key] = true;
    if (keys.hasOwnProperty(e.key.toLowerCase())) keys[e.key.toLowerCase()] = true;

    if (e.key === ' ') { spacePressed = true; handleSpacePress(); }
    if (e.key.toLowerCase() === 'e') ePressed = true;
    if (e.key.toLowerCase() === 'w' || e.key === 'ArrowUp') handleUpPress();

    if (e.key === 'Escape' || e.key === 'Esc') {
        if (gameState === 'PLAYING') {
            pauseAction();
        } else if (gameState === 'PAUSED') {
            if (window.audioMgr && window.audioMgr.ctx) window.audioMgr.ctx.resume();
            gameState = 'PLAYING';
            document.getElementById('pause-screen').classList.add('hidden');
        }
    }
});
window.addEventListener('keyup', e => {
    if (keys.hasOwnProperty(e.key)) keys[e.key] = false;
    if (keys.hasOwnProperty(e.key.toLowerCase())) keys[e.key.toLowerCase()] = false;
    if (e.key === ' ') handleSpaceRelease();
});
canvas.addEventListener('mousedown', e => {
    if (hasAK47 && gameState === 'PLAYING') mousePressed = true;
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
    isHiding: false, facingAngle: Math.PI / 2,
    draw(ctx, ox, oy, scale = 1, squish = 1) {
        ctx.save();
        let dx = ox !== undefined ? ox : this.x;
        let dy = oy !== undefined ? oy : this.y;
        ctx.translate(dx, dy);
        ctx.scale(scale, scale);

        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath();
        ctx.ellipse(this.size / 2, this.size - 2, this.size / 2 + 2, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        let drawSize = (this.isHiding && ox === undefined) ? this.size * 0.8 : this.size;
        let offsetY = (this.isHiding && ox === undefined) ? this.size * 0.2 : ((this.isMoving && ox === undefined) ? -Math.abs(Math.sin(Date.now() / 100)) * 4 : 0);

        ctx.translate(this.size / 2, this.size / 2 + offsetY);
        ctx.scale(1, squish);

        // Body
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(0, drawSize * 0.3, drawSize * 0.4, Math.PI, 0); ctx.fill();
        ctx.fillStyle = '#000';
        ctx.fillRect(-drawSize * 0.4, drawSize * 0.05, drawSize * 0.8, drawSize * 0.1);
        ctx.fillRect(-drawSize * 0.4, drawSize * 0.2, drawSize * 0.8, drawSize * 0.1);
        ctx.fillStyle = '#ffcc99';
        ctx.beginPath(); ctx.arc(0, -drawSize * 0.2, drawSize * 0.4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#111';
        ctx.beginPath(); ctx.ellipse(0, -drawSize * 0.2, drawSize * 0.45, drawSize * 0.15, 0, 0, Math.PI * 2); ctx.fill();

        // Eyes
        if (ox !== undefined && squish < 0.9) {
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.beginPath();
            let eyeX = drawSize * 0.15; let eyeY = -drawSize * 0.2; let es = 2;
            ctx.moveTo(-eyeX - es, eyeY - es); ctx.lineTo(-eyeX + es, eyeY + es);
            ctx.moveTo(-eyeX + es, eyeY - es); ctx.lineTo(-eyeX - es, eyeY + es);
            ctx.moveTo(eyeX - es, eyeY - es); ctx.lineTo(eyeX + es, eyeY + es);
            ctx.moveTo(eyeX + es, eyeY - es); ctx.lineTo(eyeX - es, eyeY + es);
            ctx.stroke();
        } else {
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(-drawSize * 0.15, -drawSize * 0.2, drawSize * 0.06, 0, Math.PI * 2);
            ctx.arc(drawSize * 0.15, -drawSize * 0.2, drawSize * 0.06, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.fillStyle = '#222';
        ctx.beginPath(); ctx.arc(0, -drawSize * 0.4, drawSize * 0.35, Math.PI, 0); ctx.fill();

        // AK47 logic
        if (hasAK47 && (ox === undefined || this.isShooting)) {
            ctx.save();
            let aim = this.isShooting ? this.shootAngle : (this.facingAngle || 0);

            // Move gun to the right side of the body
            ctx.translate(16, 2);
            ctx.rotate(aim);

            ctx.fillStyle = '#444'; // Metal
            ctx.fillRect(0, -2, 28, 4); // Barrel
            ctx.fillRect(26, -4, 2, 4); // Iron Sight Front

            ctx.fillStyle = '#8b4513'; // Wood
            ctx.fillRect(6, -3, 10, 6); // Handguard
            ctx.fillRect(-10, -3, 10, 6); // Stock

            ctx.fillStyle = '#222'; // Mag
            ctx.fillRect(10, 2, 4, 8);
            ctx.fillRect(0, 2, 3, 6);  // Grip

            // Muzzle flash only shown explicitly in victory animation, NOT in gameplay
            ctx.restore();
        }

        ctx.restore();
    }
};

let enemy = {
    active: false, dead: false,
    x: 0, y: 0, size: 30, baseSpeed: 100,
    state: 'patrol', targetX: 0, targetY: 0,
    pathTimer: 0, nextTarget: null,
    draw(ctx, ox, oy, scale = 1, swing = 0) {
        if (!this.active && ox === undefined) return;
        ctx.save();
        let dx = ox !== undefined ? ox : this.x;
        let dy = oy !== undefined ? oy : this.y;
        ctx.translate(dx, dy);
        ctx.scale(scale, scale);

        if (this.dead && ox === undefined) {
            ctx.fillStyle = '#800020';
            ctx.fillRect(0, 20, 30, 10);
            ctx.fillStyle = 'red';
            ctx.beginPath(); ctx.ellipse(15, 30, 25, 10, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#f5cba7';
            ctx.beginPath(); ctx.arc(30, 25, 10, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
            return;
        }

        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath(); ctx.ellipse(this.size / 2, this.size - 2, this.size / 2 + 4, 8, 0, 0, Math.PI * 2); ctx.fill();

        let bob = (this.state === 'chase' && ox === undefined) ? Math.abs(Math.sin(Date.now() / 100)) * 6 : ((ox !== undefined) ? 0 : Math.abs(Math.sin(Date.now() / 150)) * 3);
        ctx.translate(this.size / 2, this.size / 2 - bob);

        ctx.save();
        if (ox !== undefined) { ctx.rotate(-1.2 + swing * 1.8); }
        else if (this.state === 'chase') { ctx.rotate(Math.sin(Date.now() / 100) * 0.5 + 0.5); }
        else { ctx.rotate(0.2); }
        ctx.fillStyle = '#8b4513';
        ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(25, -20); ctx.lineTo(32, -18); ctx.lineTo(15, 5); ctx.fill();
        ctx.fillStyle = '#654321';
        ctx.beginPath(); ctx.moveTo(25, -15); ctx.lineTo(30, -12); ctx.stroke();
        ctx.restore();

        ctx.fillStyle = '#800020';
        ctx.beginPath(); ctx.moveTo(0, -this.size * 0.1); ctx.lineTo(-this.size * 0.6, this.size * 0.5); ctx.lineTo(this.size * 0.6, this.size * 0.5); ctx.fill();

        ctx.fillStyle = '#f5cba7';
        ctx.beginPath(); ctx.arc(0, -this.size * 0.3, this.size * 0.35, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#4a2311';
        ctx.beginPath(); ctx.arc(0, -this.size * 0.6, this.size * 0.2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(0, -this.size * 0.4, this.size * 0.36, Math.PI, 0); ctx.fill();

        ctx.strokeStyle = '#000'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(-this.size * 0.2, -this.size * 0.4); ctx.lineTo(-this.size * 0.05, -this.size * 0.25);
        ctx.moveTo(this.size * 0.2, -this.size * 0.4); ctx.lineTo(this.size * 0.05, -this.size * 0.25); ctx.stroke();

        ctx.fillStyle = '#000';
        ctx.beginPath(); ctx.arc(-this.size * 0.1, -this.size * 0.25, 3, 0, Math.PI * 2); ctx.arc(this.size * 0.1, -this.size * 0.25, 3, 0, Math.PI * 2); ctx.fill();

        if (ox !== undefined) {
            ctx.beginPath(); ctx.arc(0, -this.size * 0.15, 4, 0, Math.PI * 2); ctx.fill();
            if (swing < -0.8) {
                ctx.fillStyle = '#ffcf40'; ctx.beginPath(); ctx.arc(-32, 6, 15 + Math.random() * 10, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = 'red'; ctx.font = '8px Arial'; ctx.fillText('BAM!', -40, 8);
            }
        } else if (this.state === 'chase') {
            ctx.fillStyle = 'red'; ctx.font = 'bold 24px Fredoka One'; ctx.fillText('!', 0, -this.size);
        } else if (this.state === 'search') {
            ctx.fillStyle = '#ffcf40'; ctx.font = 'bold 20px Fredoka One'; ctx.fillText('?', 0, -this.size);
        } else if (this.state === 'distracted') {
            ctx.fillStyle = '#ffcf40'; ctx.font = 'bold 20px Fredoka One'; ctx.fillText('❤️', 0, -this.size);
        }
        ctx.restore();
    }
};

let panties = [];
let particles = [];
let bathers = [];
let women = [];
let distractions = [];
let lastPantySpawn = 0;

const pantyTypes = [
    { type: 'Bolinhas', pts: 40, icon: '🩲', color: '#ffb3ba' },
    { type: 'Padrão', pts: 60, icon: '🩲', color: '#0400ff' },
    { type: 'Listrada', pts: 80, icon: '🩲', color: '#baffc9' },
    { type: 'Renda', pts: 110, icon: '👙', color: '#000', noise: true },
    { type: 'Neon', pts: 220, icon: '👙', color: '#ffffba', rare: true },
    { type: 'Fralda', pts: 5, icon: '🧷', color: '#ffffff', rare: true },
    { type: 'Biquíni de Praia', pts: 440, icon: '👙', color: '#00ffff', rare: true }
];

function checkCollision(rect1, rect2) {
    let r1w = rect1.width || rect1.size; let r1h = rect1.height || rect1.size;
    let r2w = rect2.width || rect2.size; let r2h = rect2.height || rect2.size;
    return rect1.x < rect2.x + r2w && rect1.x + r1w > rect2.x && rect1.y < rect2.y + r2h && rect1.y + r1h > rect2.y;
}

function checkBatherCollision(newX, newY, size, currentX, currentY) {
    let rect1 = { x: newX, y: newY, size: size };
    for (let i = 0; i < bathers.length; i++) {
        let b = bathers[i];
        let rect2 = { x: b.x, y: b.y, size: b.size };
        if (checkCollision(rect1, rect2)) {
            if (currentX !== undefined && currentY !== undefined) {
                let currentDist = Math.hypot(currentX - b.x, currentY - b.y);
                
                // Regra pedida: se estiver muito dentro (quase sobreposto), permite atravessar para destravar
                if (currentDist < 25) continue;

                let newDist = Math.hypot(newX - b.x, newY - b.y);
                // Bloquear apenas se o movimento estiver se aproximando mais da banhista
                if (newDist < currentDist) return true;
            } else {
                return true;
            }
        }
    }
    return false;
}

function checkMapCollision(x, y, size) {
    const corners = [{ cx: x, cy: y }, { cx: x + size, cy: y }, { cx: x, cy: y + size }, { cx: x + size, cy: y + size }];
    for (let c of corners) {
        let col = Math.floor(c.cx / TILE_SIZE); let row = Math.floor(c.cy / TILE_SIZE);
        if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
            if (['W', 'B', 'L'].includes(mapLayout[row][col])) return true;
        } else return true;
    }
    return false;
}

function getTileAt(x, y, size) {
    let col = Math.floor((x + size / 2) / TILE_SIZE); let row = Math.floor((y + size / 2) / TILE_SIZE);
    if (row >= 0 && row < ROWS && col >= 0 && col < COLS) return mapLayout[row][col];
    return null;
}

function getNextStep(startR, startC, targetR, targetC) {
    if (startR === targetR && startC === targetC) return null;
    let queue = [{ r: startR, c: startC, path: [] }];
    let visited = new Set([`${startR},${startC}`]);
    let dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    let iters = 0;
    while (queue.length > 0 && iters < 1000) {
        iters++; let curr = queue.shift();
        if (curr.r === targetR && curr.c === targetC) return curr.path[0];
        for (let d of dirs) {
            let nr = curr.r + d[0]; let nc = curr.c + d[1];
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && !visited.has(`${nr},${nc}`)) {
                if (!['W', 'B', 'L'].includes(mapLayout[nr][nc])) {
                    visited.add(`${nr},${nc}`);
                    queue.push({ r: nr, c: nc, path: [...curr.path, { r: nr, c: nc }] });
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
    for (let i = 1; i <= steps; i++) {
        let cx = x1 + dx * (i / steps); let cy = y1 + dy * (i / steps);
        let col = Math.floor(cx / TILE_SIZE); let row = Math.floor(cy / TILE_SIZE);
        if (col === targetCol && row === targetRow) continue;
        if (col === startCol && row === startRow) continue;
        if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
            if (['W', 'L', 'B'].includes(mapLayout[row][col])) return false;
        }
    }
    return true;
}

function spawnPanty() {
    let attempts = 0;
    while (attempts < 50) {
        let col = Math.floor(Math.random() * COLS); let row = Math.floor(Math.random() * ROWS);
        if (['.', 'C', 'R'].includes(mapLayout[row][col])) {
            let rand = Math.random();
            let trapChance = stage <= 5 ? 0.1 : (stage <= 10 ? 0.2 : (stage <= 15 ? 0.3 : 0.4));
            let pType = pantyTypes[0];
            if (rand > 0.98) pType = pantyTypes[6]; // Biquíni de Praia
            else if (rand > 0.95) pType = pantyTypes[5]; // Fralda
            else if (rand > 0.85) pType = pantyTypes[4]; // Neon
            else if (rand > 0.7) pType = pantyTypes[3]; // Renda
            else if (rand > 0.45) pType = pantyTypes[2]; // Listrada
            else if (rand > 0.2) pType = pantyTypes[1]; // Padrão
            else pType = pantyTypes[0]; // Bolinhas

            let isTrap = Math.random() < trapChance;

            panties.push({ x: col * TILE_SIZE + 5, y: row * TILE_SIZE + 5, width: 30, height: 30, type: pType, pulse: 0, isTrap: isTrap });
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
function spawnNoiseRing(x, y) { particles.push({ type: 'ring', x: x + player.size / 2, y: y + player.size / 2, radius: 10, maxRadius: 60, life: 0.5, maxLife: 0.5 }); }
function spawnBlood(x, y) { particles.push({ type: 'blood', x: x + 15, y: y + 25, radius: 10, maxRadius: 40, life: 10, maxLife: 10 }); }

function updateHUD() {
    document.getElementById('stage-name').textContent = `Fase ${stage}`;
    let m = Math.floor(timeRemaining / 60).toString().padStart(2, '0');
    let s = Math.floor(timeRemaining % 60).toString().padStart(2, '0');
    document.getElementById('timer').textContent = `⏱️ ${m}:${s}`;
    document.getElementById('score').textContent = `Pontos: ${score}`;

    if (combo > 1) { document.getElementById('combo').textContent = `Combo x${combo}!`; document.getElementById('combo').classList.remove('hidden'); }
    else document.getElementById('combo').classList.add('hidden');

    document.getElementById('panty-counter').textContent = `🩲 ${totalCollected}/${requiredPanties}`;

    let cap = getUpgradeVal('mochila', 2);
    let capLabel = document.getElementById('capacity-counter');
    document.getElementById('backpack-counter').textContent = `🎒 ${backpackCollected}/${cap}`;
    if (backpackCollected >= cap) capLabel.classList.remove('hidden');
    else capLabel.classList.add('hidden');

    document.getElementById('dist-count').textContent = distractionsLeft;
    if (distractionsLeft > 0) document.getElementById('distraction-counter').classList.remove('hidden');

    const sBar = document.getElementById('suspicion-bar');
    sBar.style.width = `${Math.min(100, suspicion)}%`;
    if (suspicion < 50) sBar.style.background = 'linear-gradient(90deg, #4facfe, #00f2fe)';
    else if (suspicion < 80) sBar.style.background = 'linear-gradient(90deg, #f6d365, #fda085)';
    else sBar.style.background = 'linear-gradient(90deg, #ff0844, #ffb199)';
}

function setupBathers() {
    bathers = [];
    let batherCount = stage <= 2 ? 0 : (stage <= 5 ? 1 : (stage <= 8 ? 2 : 3 + Math.floor((stage - 10) / 3)));

    let speedMult = stage <= 3 ? 0.5 : (stage <= 6 ? 0.7 : (stage <= 9 ? 0.9 : (stage <= 12 ? 1.1 : 1.3)));
    let cone = stage <= 3 ? 120 : (stage <= 6 ? 140 : (stage <= 9 ? 160 : (stage <= 12 ? 180 : 200)));
    let reaction = stage <= 3 ? 0.6 : (stage <= 6 ? 0.5 : (stage <= 9 ? 0.4 : (stage <= 12 ? 0.3 : 0.2)));
    let screamSus = stage <= 3 ? 50 : (stage <= 6 ? 55 : (stage <= 9 ? 60 : (stage <= 12 ? 65 : 70)));

    for (let i = 0; i < batherCount; i++) {
        let type = 'normal';
        let randType = Math.random();
        if (stage >= 15 && randType < 0.2) type = 'celular';
        else if (stage >= 12 && randType < 0.3) type = 'atleta';
        else if (stage >= 8 && randType < 0.4) type = 'fofoqueira';
        else if (stage >= 3 && randType < 0.6) type = 'agarradeira';

        let r, c;
        do {
            r = Math.floor(Math.random() * ROWS); c = Math.floor(Math.random() * COLS);
        } while (['W', 'B', 'L', 'E'].includes(mapLayout[r][c]));

        bathers.push({
            x: c * TILE_SIZE, y: r * TILE_SIZE, size: 28, type: type,
            speed: (type === 'atleta' ? 1.5 : (type === 'fofoqueira' ? 0.6 : 1.0)) * 80 * speedMult,
            cone: type === 'fofoqueira' ? 360 : cone,
            reactTime: reaction,
            screamSus: screamSus,
            targetX: c * TILE_SIZE, targetY: r * TILE_SIZE,
            state: 'walk',
            alertTimer: 0,
            seeTimer: 0,
            angle: 0,
            pathTimer: 0,
            nextTarget: null,
            stunTimer: 0
        });
    }
}

function startLevel() {
    ak47SecretUnlocked = false;
    timeRemaining = 300 + (stage * 30);
    suspicion = 0; totalCollected = 0; backpackCollected = 0;
    score = 0; // Prevent score accumulating across game overs
    faseGritos = 0; fasePerfeitaSemVisto = true; tempoSemSuspeita = 0;
    requiredPanties = 4 + stage;
    panties = []; particles = []; distractions = [];
    distractionsLeft = getUpgradeVal('distracao', 0);

    enemy.active = false; enemy.dead = false;
    player.grabbedBy = null;
    player.escapeTimer = 0;
    setupBathers();

    women = [];
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (mapLayout[r][c] === 'B' && Math.random() < 0.6) {
                women.push({ x: c * TILE_SIZE, y: r * TILE_SIZE, size: TILE_SIZE, alerted: false });
            }
        }
    }

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (mapLayout[r][c] === 'E') { player.x = c * TILE_SIZE; player.y = r * TILE_SIZE; }
        }
    }
    for (let i = 0; i < 4; i++) spawnPanty();

    gameState = 'PLAYING';
    document.getElementById('hud').classList.remove('hidden');
    if (hasAK47) document.getElementById('btn-shoot').classList.remove('hidden');
    if (distractionsLeft > 0) document.getElementById('btn-distraction').classList.remove('hidden');
    if (window.innerWidth <= 1250) document.getElementById('mobile-controls').classList.remove('hidden');
}

function update(dt) {
    let oldSec = Math.floor(tempoTotalJogo);
    tempoTotalJogo += dt;
    if (Math.floor(tempoTotalJogo) > oldSec) {
        addProgressoConquista('c29', 1);
    }
    if (suspicion <= ultimaSuspeita) {
        tempoSemSuspeita += dt;
        if (tempoSemSuspeita >= 60) unlockConquista('c15');
    } else { tempoSemSuspeita = 0; }
    ultimaSuspeita = suspicion;

    if (timeRemaining > 0) {
        timeRemaining -= dt;
        if (timeRemaining <= 0) {
            if (totalCollected >= requiredPanties) triggerWin();
            else gameOver();
        }
    }

    if (comboTimer > 0) { comboTimer -= dt; if (comboTimer <= 0) combo = 0; }

    let resMult = getUpgradeVal('resistencia', 1.0);
    let alertaMult = getUpgradeVal('alerta', 1.0);
    if (suspicion > 0 && !enemy.active) suspicion = Math.max(0, suspicion - 2 * dt * alertaMult);

    let dx = 0; let dy = 0;
    let speed = player.baseSpeed * getUpgradeVal('velocidade', 1.0);
    let isRunning = false;

    if (keys.Shift || keys.shift) { speed *= 1.8; isRunning = true; }
    if (keys.w || keys.W) dy = -speed;
    if (keys.s || keys.S) dy = speed;
    if (keys.a || keys.A) dx = -speed;
    if (keys.d || keys.D) dx = speed;

    if (dx !== 0 && dy !== 0) {
        let length = Math.sqrt(dx * dx + dy * dy);
        dx = (dx / length) * speed; dy = (dy / length) * speed;
    }

    let isMoving = dx !== 0 || dy !== 0;
    if (isMoving) player.facingAngle = Math.atan2(dy, dx);

    if (player.grabbedBy) {
        document.getElementById('grab-warning').classList.remove('hidden');
        let b = player.grabbedBy;
        player.x = b.x;
        player.y = b.y;
        if (isRunning) {
            player.escapeTimer += dt;
            if (player.escapeTimer >= 0.9) {
                player.grabbedBy = null;
                b.stunTimer = 3.0;
                b.state = 'stunned';
                showToast("Escapou!");
            }
        } else {
            player.escapeTimer = Math.max(0, player.escapeTimer - dt);
        }
        dx = 0; dy = 0;
        suspicion += 30 * dt * resMult;
        if (Math.random() < 0.1) spawnParticle(player.x, player.y, "💢", "#fff");
    } else {
        document.getElementById('grab-warning').classList.add('hidden');
        if (!checkMapCollision(player.x + dx * dt, player.y, player.size) && !checkBatherCollision(player.x + dx * dt, player.y, player.size, player.x, player.y)) player.x += dx * dt;
        if (!checkMapCollision(player.x, player.y + dy * dt, player.size) && !checkBatherCollision(player.x, player.y + dy * dt, player.size, player.x, player.y)) player.y += dy * dt;
    }
    player.isMoving = isMoving;

    let currentTile = getTileAt(player.x, player.y, player.size);
    let wantsToHide = (currentTile === 'P' || currentTile === 'R') && !isMoving;

    if (wantsToHide) {
        if (!player.isHiding) {
            let enemySawHiding = false;
            if (enemy.active && !enemy.dead) {
                let distToEnemy = Math.hypot(enemy.x - player.x, enemy.y - player.y);
                let hasLoS = checkLoS(enemy.x + enemy.size / 2, enemy.y + enemy.size / 2, player.x + player.size / 2, player.y + player.size / 2);
                if (hasLoS && (distToEnemy < 300 || suspicion >= 100)) enemySawHiding = true;
            }
            if (!enemySawHiding) player.isHiding = true;
        }
    } else {
        player.isHiding = false;
    }

    let noiseFactor = getUpgradeVal('tenis', 1.0);
    if (currentTile === 'R') noiseFactor *= 0.5;

    let stageDifficultyMult = 1.0 + (stage * 0.05);

    if (isMoving && isRunning && !player.grabbedBy) {
        suspicion += 20 * dt * noiseFactor * resMult * stageDifficultyMult;
        if (Math.random() < 0.2) spawnNoiseRing(player.x, player.y);
    }


    if (ePressed && distractionsLeft > 0) {
        ePressed = false; distractionsLeft--;
        addProgressoConquista('c27', 1);
        distractions.push({ x: player.x, y: player.y, life: 5 });
        spawnParticle(player.x, player.y, "🎶", "#fff");
        spawnNoiseRing(player.x, player.y); spawnNoiseRing(player.x, player.y);
    }

    for (let i = distractions.length - 1; i >= 0; i--) {
        distractions[i].life -= dt;
        if (distractions[i].life <= 0) distractions.splice(i, 1);
    }

    women.forEach(w => {
        if (w.alerted) return;
        let pcdx = (player.x + player.size / 2) - (w.x + w.size / 2);
        let pcdy = (player.y + player.size / 2) - (w.y + w.size / 2);
        let dist = Math.hypot(pcdx, pcdy);

        if (dist < 350 && !player.isHiding && pcdx > -20 && Math.abs(pcdy) < 120) {
            let hasLoS = checkLoS(w.x + w.size / 2, w.y + w.size / 2, player.x + player.size / 2, player.y + player.size / 2);
            if (hasLoS) {
                w.alerted = true; fasePerfeitaSemVisto = false;
                if (window.audioMgr) window.audioMgr.batherScream();
                if (Date.now() - lastInvasionToast > 2000) {
                    showToast("😱 AHHH! UM INVASOR!");
                    lastInvasionToast = Date.now();
                }
                suspicion += 50 * resMult; spawnParticle(w.x + w.size / 2, w.y, "😱", "#fff");
                spawnNoiseRing(w.x, w.y); spawnNoiseRing(w.x, w.y);
            }
        }
    });

    bathers.forEach(b => {
        if (b.dead) return;

        if (b.stunTimer > 0) {
            b.stunTimer -= dt;
            if (b.stunTimer <= 0) b.state = 'walk';
            return;
        }

        let pdx = (player.x + player.size / 2) - (b.x + b.size / 2);
        let pdy = (player.y + player.size / 2) - (b.y + b.size / 2);
        let distToPlayer = Math.hypot(pdx, pdy);
        let angleToPlayer = Math.atan2(pdy, pdx);

        let angleDiff = Math.abs(angleToPlayer - b.angle);
        if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;

        if (b.type === 'agarradeira' && !player.grabbedBy && b.state !== 'scream' && distToPlayer < 25) {
            player.grabbedBy = b;
            player.escapeTimer = 0;
            showToast("AGARRADO! Segure CORRER!");
        }

        let isSeeingPlayer = false;
        if (!player.isHiding && distToPlayer < (350 * getUpgradeVal('visao', 1.0))) {
            if (b.cone === 360 || angleDiff < (b.cone / 2 * Math.PI / 180)) {
                if (checkLoS(b.x + b.size / 2, b.y + b.size / 2, player.x + player.size / 2, player.y + player.size / 2)) {
                    isSeeingPlayer = true;
                }
            }
        }

        if (isSeeingPlayer) {
            if (b.seeTimer === 0 && window.audioMgr) window.audioMgr.batherHmm();
            b.seeTimer += dt;
            if (b.seeTimer >= b.reactTime) {
                if (window.audioMgr) window.audioMgr.batherScream();
                b.state = 'scream'; fasePerfeitaSemVisto = false; faseGritos++;
                if (faseGritos >= 3) unlockConquista('c26');
                b.alertTimer = 1.0;
                suspicion += b.screamSus * dt * 2 * resMult;
                if (Math.random() < 0.1) {
                    if (Date.now() - lastInvasionToast > 2000) {
                        showToast("😱 AHHH! INVASOR!");
                        lastInvasionToast = Date.now();
                    }
                    spawnParticle(b.x, b.y, "😱", "#fff");
                    spawnNoiseRing(b.x, b.y);
                }
            }
        } else {
            if (b.seeTimer > 0 && b.state !== 'scream') unlockConquista('c25');
            b.seeTimer = Math.max(0, b.seeTimer - dt);
            if (b.state === 'scream') {
                b.alertTimer -= dt;
                if (b.alertTimer <= 0) b.state = 'walk';
            }
        }

        if (b.state === 'scream') return;

        let distTarget = null;
        distractions.forEach(dist => {
            if (Math.hypot(dist.x - b.x, dist.y - b.y) < 300) distTarget = dist;
        });

        if (distTarget) {
            b.targetX = distTarget.x; b.targetY = distTarget.y;
            b.state = 'distracted';
        } else if (b.state === 'distracted') {
            b.state = 'walk';
        }

        if (b.state === 'walk') {
            b.pathTimer -= dt;
            if (b.pathTimer <= 0 || !b.nextTarget) {
                b.pathTimer = 0.5;
                let bc = Math.floor((b.x + b.size / 2) / TILE_SIZE); let br = Math.floor((b.y + b.size / 2) / TILE_SIZE);
                let tc = Math.floor((b.targetX) / TILE_SIZE); let tr = Math.floor((b.targetY) / TILE_SIZE);
                let step = getNextStep(br, bc, tr, tc);
                if (step) b.nextTarget = { x: step.c * TILE_SIZE + TILE_SIZE / 2 - b.size / 2, y: step.r * TILE_SIZE + TILE_SIZE / 2 - b.size / 2 };
                else {
                    b.nextTarget = null;
                    let r = Math.floor(Math.random() * ROWS); let c = Math.floor(Math.random() * COLS);
                    if (!['W', 'B', 'L', 'E'].includes(mapLayout[r][c])) { b.targetX = c * TILE_SIZE; b.targetY = r * TILE_SIZE; }
                }
            }

            let mTX = b.nextTarget ? b.nextTarget.x : b.targetX;
            let mTY = b.nextTarget ? b.nextTarget.y : b.targetY;
            let edx = mTX - b.x; let edy = mTY - b.y;
            let d = Math.hypot(edx, edy);

            if (d < 10 && !b.nextTarget && Math.random() < 0.05) {
                let r = Math.floor(Math.random() * ROWS); let c = Math.floor(Math.random() * COLS);
                if (!['W', 'B', 'L', 'E'].includes(mapLayout[r][c])) { b.targetX = c * TILE_SIZE; b.targetY = r * TILE_SIZE; }
            }

            if (d > 2) {
                let moveX = (edx / d) * b.speed * dt; let moveY = (edy / d) * b.speed * dt;
                if (!checkMapCollision(b.x + moveX, b.y, b.size)) b.x += moveX;
                if (!checkMapCollision(b.x, b.y + moveY, b.size)) b.y += moveY;
                b.angle = Math.atan2(edy, edx);
                if (Math.hypot(mTX - b.x, mTY - b.y) < 5) b.nextTarget = null;
            }
        }
    });

    if (spacePressed) {
        spacePressed = false;
        let cap = getUpgradeVal('mochila', 2);
        if (backpackCollected < cap) {
            let pickRange = getUpgradeVal('luva', 0);
            let pRect = { x: player.x - pickRange, y: player.y - pickRange, width: player.size + pickRange * 2, height: player.size + pickRange * 2 };

            for (let i = panties.length - 1; i >= 0; i--) {
                let p = panties[i];
                if (checkCollision(pRect, p)) {
                    if (p.isTrap) {
                        unlockConquista('c32');
                        if (window.audioMgr) window.audioMgr.collectTrap();
                        score = Math.max(0, score - 10); suspicion += 30 * resMult;
                        showToast("🚨 ARMADILHA!"); combo = 0;
                        spawnNoiseRing(player.x, player.y);
                    } else {
                        combo++; comboTimer = 2.5;
                        if (combo === 2) unlockConquista('c16');
                        if (combo === 5) unlockConquista('c17');
                        if (window.audioMgr) window.audioMgr.collectPanty(p.type.pts > 0);
                        let gained = p.type.pts; score += gained;
                        backpackCollected++;
                        if (p.type.noise) { suspicion += 10 * resMult; spawnNoiseRing(player.x, player.y); }
                        if (combo > 2) suspicion += 5 * resMult;
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

    if (currentTile === 'E' && backpackCollected > 0) {
        addProgressoConquista('c1', backpackCollected);
        addProgressoConquista('c2', backpackCollected);
        addProgressoConquista('c3', backpackCollected);
        addProgressoConquista('c4', backpackCollected);
        addProgressoConquista('c5', backpackCollected);
        addProgressoConquista('c6', backpackCollected);
        totalCollected += backpackCollected;
        backpackCollected = 0;
        showToast("Calcinhas Guardadas!");
        spawnParticle(player.x, player.y, "✔️", "#0f0");
        if (totalCollected >= requiredPanties) showToast("PODE FUGIR!");
    }

    let spawnRate = Math.max(5, 15 - stage * 0.5) * getUpgradeVal('spawn', 1.0);
    lastPantySpawn += dt;
    let maxOnScreen = 5;
    if (panties.length >= maxOnScreen) lastPantySpawn = 0;
    if (lastPantySpawn > spawnRate && panties.length < maxOnScreen) {
        spawnPanty(); lastPantySpawn = 0;
    }

    let eSpeedMult = 1.0 + (stage * 0.04);
    if (suspicion >= 100 && !enemy.active && !enemy.dead) {
        enemy.active = true; enemy.speed = enemy.baseSpeed * eSpeedMult;
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (mapLayout[r][c] === 'E') { enemy.x = c * TILE_SIZE; enemy.y = r * TILE_SIZE; }
            }
        }
        showToast("⚠️ DONA DO BANHEIRO APARECEU!");
    }

    if (enemy.active && !enemy.dead) {
        let hasLoS = checkLoS(enemy.x + enemy.size / 2, enemy.y + enemy.size / 2, player.x + player.size / 2, player.y + player.size / 2);
        let distToPlayer = Math.hypot(enemy.x - player.x, enemy.y - player.y);

        let distTarget = null;
        distractions.forEach(dist => { if (Math.hypot(dist.x - enemy.x, dist.y - enemy.y) < 400) distTarget = dist; });

        if (distTarget) {
            enemy.state = 'distracted'; enemy.targetX = distTarget.x; enemy.targetY = distTarget.y; enemy.speed = enemy.baseSpeed * eSpeedMult;
            suspicion = Math.max(0, suspicion - 25 * dt * alertaMult);
        } else if ((suspicion >= 100 && !player.isHiding) || (hasLoS && distToPlayer < 400 && !player.isHiding)) {
            fasePerfeitaSemVisto = false;
            if (enemy.state !== 'chase' && window.audioMgr) window.audioMgr.donaMad();
            enemy.state = 'chase'; enemy.targetX = player.x; enemy.targetY = player.y;
            enemy.speed = 145 * eSpeedMult; suspicion = 100;
        } else if (enemy.state === 'chase' || enemy.state === 'search' || enemy.state === 'distracted') {
            enemy.state = 'search'; enemy.speed = 110 * eSpeedMult;
            if (Math.hypot(enemy.targetX - enemy.x, enemy.targetY - enemy.y) < 20 || Math.random() < 0.02) {
                let r = Math.floor(enemy.y / TILE_SIZE) + Math.floor((Math.random() - 0.5) * 12);
                let c = Math.floor(enemy.x / TILE_SIZE) + Math.floor((Math.random() - 0.5) * 12);
                if (r >= 0 && r < ROWS && c >= 0 && c < COLS && !['W', 'B', 'L'].includes(mapLayout[r][c])) {
                    enemy.targetX = c * TILE_SIZE; enemy.targetY = r * TILE_SIZE;
                }
            }
            suspicion -= 10 * dt * alertaMult;
            if (suspicion <= 0) { enemy.state = 'leave'; enemy.speed = 100 * eSpeedMult; showToast("Ela desistiu!"); suspicion = 0; }
        } else if (enemy.state === 'patrol') {
            if (Math.random() < 0.02) {
                let r = Math.floor(Math.random() * ROWS); let c = Math.floor(Math.random() * COLS);
                if (!['W', 'B', 'L'].includes(mapLayout[r][c])) { enemy.targetX = c * TILE_SIZE; enemy.targetY = r * TILE_SIZE; }
            }
        } else if (enemy.state === 'leave') {
            for (let r = 0; r < ROWS; r++) {
                for (let c = 0; c < COLS; c++) { if (mapLayout[r][c] === 'E') { enemy.targetX = c * TILE_SIZE; enemy.targetY = r * TILE_SIZE; } }
            }
            if (getTileAt(enemy.x, enemy.y, enemy.size) === 'E') enemy.active = false;
        }

        let hasLoSToTarget = checkLoS(enemy.x + enemy.size / 2, enemy.y + enemy.size / 2, enemy.targetX, enemy.targetY);

        enemy.pathTimer -= dt;
        if (enemy.pathTimer <= 0 || !enemy.nextTarget) {
            enemy.pathTimer = 0.5;
            let eC = Math.floor((enemy.x + enemy.size / 2) / TILE_SIZE); let eR = Math.floor((enemy.y + enemy.size / 2) / TILE_SIZE);
            let tC = Math.floor((enemy.targetX) / TILE_SIZE); let tR = Math.floor((enemy.targetY) / TILE_SIZE);
            let step = getNextStep(eR, eC, tR, tC);
            if (step) enemy.nextTarget = { x: step.c * TILE_SIZE + TILE_SIZE / 2 - enemy.size / 2, y: step.r * TILE_SIZE + TILE_SIZE / 2 - enemy.size / 2 };
            else enemy.nextTarget = null;
        }

        if (hasLoSToTarget && enemy.state === 'chase') enemy.nextTarget = null;

        let mTX = enemy.nextTarget ? enemy.nextTarget.x : enemy.targetX;
        let mTY = enemy.nextTarget ? enemy.nextTarget.y : enemy.targetY;
        let edx = mTX - enemy.x; let edy = mTY - enemy.y; let dist = Math.hypot(edx, edy);

        if (dist > 2) {
            let moveX = (edx / dist) * enemy.speed * dt; let moveY = (edy / dist) * enemy.speed * dt;
            let movedX = false; let movedY = false;
            if (!checkMapCollision(enemy.x + moveX, enemy.y, enemy.size)) { enemy.x += moveX; movedX = true; }
            if (!checkMapCollision(enemy.x, enemy.y + moveY, enemy.size)) { enemy.y += moveY; movedY = true; }

            if (!movedX && !movedY) enemy.nextTarget = null;
            if (Math.hypot(mTX - enemy.x, mTY - enemy.y) < 5) enemy.nextTarget = null;
        } else {
            enemy.nextTarget = null;
        }

        if (checkCollision(player, enemy)) {
            if (player.isHiding) { showToast("Te achei!"); }
            gameOver();
        }

        if (window.audioMgr) {
            window.audioMgr.setChase(enemy.state === 'chase');
            window.audioMgr.updateHeartbeat(Math.hypot(enemy.x - player.x, enemy.y - player.y), dt);
        }
    } else {
        if (window.audioMgr) window.audioMgr.setChase(false);
    }

    if (mousePressed && hasAK47 && enemy.active && !enemy.dead) {
        mousePressed = false;
        player.isShooting = true;
        let ex = enemy.x + enemy.size / 2; let ey = enemy.y + enemy.size / 2;
        let px = player.x + player.size / 2; let py = player.y + player.size / 2;
        player.shootAngle = Math.atan2(ey - py, ex - px);

        if (window.audioMgr) window.audioMgr.ak47Shoot();
        spawnParticle(px + Math.cos(player.shootAngle) * 30, py + Math.sin(player.shootAngle) * 30, "💥", "#ffcf40");
        unlockConquista('c28');
        enemy.dead = true;
        enemy.state = 'dead';
        suspicion = 0;
        spawnBlood(enemy.x, enemy.y);
        showToast("BANG!");
        ak47SecretUnlocked = true;

        setTimeout(() => {
            player.isShooting = false;
            if (!ak47VictoryShown) {
                ak47VictoryShown = true;
                triggerAK47Win();
            }
        }, 500);
    } else if (mousePressed && hasAK47 && ak47SecretUnlocked) {
        let closestBather = null;
        let minBatherDist = Infinity;
        for (let i = 0; i < bathers.length; i++) {
            let b = bathers[i];
            if (b.state === 'scream' && !b.dead) {
                let pdx = (player.x + player.size / 2) - (b.x + b.size / 2);
                let pdy = (player.y + player.size / 2) - (b.y + b.size / 2);
                let dist = Math.hypot(pdx, pdy);
                if (dist < minBatherDist) {
                    minBatherDist = dist;
                    closestBather = b;
                }
            }
        }

        if (closestBather) {
            mousePressed = false;
            player.isShooting = true;
            let ex = closestBather.x + closestBather.size / 2; let ey = closestBather.y + closestBather.size / 2;
            let px = player.x + player.size / 2; let py = player.y + player.size / 2;
            player.shootAngle = Math.atan2(ey - py, ex - px);

            if (window.audioMgr) window.audioMgr.ak47Shoot();
            spawnParticle(px + Math.cos(player.shootAngle) * 30, py + Math.sin(player.shootAngle) * 30, "💥", "#ffcf40");

            closestBather.dead = true;
            closestBather.state = 'dead';
            spawnBlood(closestBather.x, closestBather.y);
            showToast("BANG!");
            unlockConquista('c33');

            setTimeout(() => {
                player.isShooting = false;
            }, 500);
        } else {
            mousePressed = false;
        }
    } else {
        mousePressed = false;
    }

    if (totalCollected >= requiredPanties && currentTile === 'E') triggerWin();

    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i]; p.life -= dt;
        if (p.type === 'ring') p.radius += (p.maxRadius - p.radius) * 5 * dt;
        else if (p.type === 'blood') p.radius += (p.maxRadius - p.radius) * 1 * dt;
        else p.y += p.vy * dt;
        if (p.life <= 0) particles.splice(i, 1);
    }

    panties.forEach(p => p.pulse = (p.pulse + dt * 3) % (Math.PI * 2));
    updateHUD();
}

function triggerWin() {
    if (window.audioMgr) { window.audioMgr.setChase(false); window.audioMgr.win(); }
    gameState = 'VICTORY';
    // Pontos ganhos agora são exatamente os mostrados durante a fase
    if (stage === 1) unlockConquista('c7');
    if (stage === 5) unlockConquista('c8');
    if (stage === 15) unlockConquista('c9');
    if (stage === 20) unlockConquista('c10');
    if (stage === 30) unlockConquista('c11');
    if (fasePerfeitaSemVisto) { unlockConquista('c12'); addProgressoConquista('c13', 1); addProgressoConquista('c14', 1); }
    if (score >= 500) unlockConquista('c18');
    if (score >= 1000) unlockConquista('c19');
    addProgressoConquista('c20', score);
    document.getElementById('hud').classList.add('hidden');
    document.getElementById('mobile-controls').classList.add('hidden');
    document.getElementById('victory-screen').classList.remove('hidden');
    document.getElementById('victory-stats').textContent = `Pontos da Fase: ${Math.floor(score)}`;
    shopPoints += Math.floor(score);
    score = 0;
}

function triggerAK47Win() {
    gameState = 'AK47_VICTORY';
    gameOverAnimTimer = 0;
    document.getElementById('hud').classList.add('hidden');
    document.getElementById('mobile-controls').classList.add('hidden');
    document.getElementById('ak47-victory-screen').classList.remove('hidden');
}

let gameOverAnimTimer = 0; let gameOverSnapshot = null;
function gameOver() {
    if (window.audioMgr) { window.audioMgr.setChase(false); window.audioMgr.gameOver(); }
    gameState = 'GAMEOVER'; gameOverAnimTimer = 0;
    gameOverSnapshot = document.createElement('canvas');
    gameOverSnapshot.width = canvas.width; gameOverSnapshot.height = canvas.height;
    let octx = gameOverSnapshot.getContext('2d'); octx.filter = 'blur(8px)';
    octx.drawImage(canvas, 0, 0); octx.fillStyle = 'rgba(0,0,0,0.6)'; octx.fillRect(0, 0, canvas.width, canvas.height);
    document.getElementById('grab-warning').classList.add('hidden');
    document.getElementById('hud').classList.add('hidden'); document.getElementById('mobile-controls').classList.add('hidden');
    document.getElementById('game-over-screen').classList.remove('hidden');
    document.getElementById('game-over-stats').textContent = `Fase Alcançada: ${stage}`;
}

function draw() {
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            let tile = mapLayout[r][c]; let x = c * TILE_SIZE; let y = r * TILE_SIZE;
            ctx.fillStyle = (r + c) % 2 === 0 ? '#f0f0f0' : '#e0e0e0'; ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            ctx.strokeStyle = '#d0d0d0'; ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);

            if (tile === 'W') { ctx.fillStyle = '#a2d2ff'; ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE); ctx.fillStyle = '#81a4c7'; ctx.fillRect(x, y + TILE_SIZE - 5, TILE_SIZE, 5); }
            else if (tile === 'B') { ctx.fillStyle = '#ffcf40'; ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE); ctx.strokeStyle = '#c49a1f'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + TILE_SIZE - 5, y); ctx.lineTo(x + TILE_SIZE - 5, y + TILE_SIZE); ctx.stroke(); ctx.lineWidth = 1; }
            else if (tile === 'R') { ctx.fillStyle = 'rgba(255,105,180,0.5)'; ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4); }
            else if (tile === 'L') { ctx.fillStyle = '#8b5a2b'; ctx.fillRect(x + 5, y + 5, TILE_SIZE - 10, TILE_SIZE - 10); }
            else if (tile === 'C') { ctx.strokeStyle = '#555'; ctx.beginPath(); ctx.moveTo(x, y + TILE_SIZE / 2); ctx.lineTo(x + TILE_SIZE, y + TILE_SIZE / 2); ctx.stroke(); }
            else if (tile === 'E') { ctx.fillStyle = '#87CEEB'; ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE); ctx.font = '20px Arial'; ctx.fillText('🚪', x + TILE_SIZE / 2, y + TILE_SIZE / 2); }
            else if (tile === 'P') { ctx.fillStyle = '#3d2b1f'; ctx.beginPath(); ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, 10, 0, Math.PI * 2); ctx.fill(); }
        }
    }

    women.forEach(w => {
        let cx = w.x + w.size / 2; let cy = w.y + w.size / 2;
        ctx.fillStyle = '#aaa'; ctx.fillRect(w.x + 5, w.y + 5, 15, 5);
        ctx.fillStyle = '#888'; ctx.beginPath(); ctx.arc(w.x + 20, w.y + 7, 6, Math.PI, 0); ctx.fill();
        ctx.strokeStyle = 'rgba(0, 150, 255, 0.6)'; ctx.lineWidth = 2; ctx.beginPath();
        let dropY = (Date.now() / 20) % 15;
        ctx.moveTo(w.x + 15, w.y + 15 + dropY); ctx.lineTo(w.x + 25, w.y + 25 + dropY);
        ctx.moveTo(w.x + 20, w.y + 10 + dropY); ctx.lineTo(w.x + 20, w.y + 20 + dropY);
        ctx.moveTo(w.x + 25, w.y + 15 + dropY); ctx.lineTo(w.x + 15, w.y + 25 + dropY); ctx.stroke();

        ctx.fillStyle = '#f1c27d'; ctx.beginPath(); ctx.arc(cx, cy + 10, 12, Math.PI, 0); ctx.fill();
        ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = '#ff69b4'; ctx.beginPath(); ctx.arc(cx, cy - 4, 11, Math.PI, 0); ctx.fill();
        ctx.beginPath(); ctx.arc(cx, cy - 12, 6, 0, Math.PI * 2); ctx.fill();

        if (w.alerted) {
            ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(cx - 3, cy, 2, 0, Math.PI * 2); ctx.arc(cx + 3, cy, 2, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.ellipse(cx, cy + 4, 3, 5, 0, 0, Math.PI * 2); ctx.fill();
            ctx.font = '24px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('😱', cx, w.y - 10);
        } else {
            ctx.strokeStyle = '#000'; ctx.lineWidth = 1; ctx.beginPath();
            ctx.moveTo(cx - 5, cy); ctx.quadraticCurveTo(cx - 3, cy + 2, cx - 1, cy);
            ctx.moveTo(cx + 1, cy); ctx.quadraticCurveTo(cx + 3, cy + 2, cx + 5, cy); ctx.stroke();
        }
    });

    bathers.forEach(b => {
        if (b.dead) {
            ctx.save();
            ctx.translate(b.x, b.y);
            ctx.fillStyle = '#800020';
            ctx.fillRect(0, 16, 24, 8);
            ctx.fillStyle = 'red';
            ctx.beginPath(); ctx.ellipse(12, 24, 20, 8, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#f5cba7';
            ctx.beginPath(); ctx.arc(24, 20, 8, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
            return;
        }
        let cx = b.x + b.size / 2; let cy = b.y + b.size / 2;
        ctx.fillStyle = '#f1c27d'; ctx.beginPath(); ctx.arc(cx, cy, 12, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = b.type === 'fofoqueira' ? 'purple' : (b.type === 'atleta' ? 'blue' : (b.type === 'agarradeira' ? '#9932CC' : 'green'));
        ctx.beginPath(); ctx.arc(cx, cy, 12, b.angle - Math.PI / 4, b.angle + Math.PI / 4); ctx.fill();

        if (b.type === 'agarradeira') {
            ctx.fillStyle = '#4b0082'; // purple eyes
            ctx.beginPath();
            ctx.arc(cx + Math.cos(b.angle - 0.5) * 8, cy + Math.sin(b.angle - 0.5) * 8, 2.5, 0, Math.PI * 2);
            ctx.arc(cx + Math.cos(b.angle + 0.5) * 8, cy + Math.sin(b.angle + 0.5) * 8, 2.5, 0, Math.PI * 2);
            ctx.fill();
        }

        if (b.state === 'scream') { ctx.fillStyle = '#000'; ctx.font = '16px Arial'; ctx.fillText('😱', cx, b.y - 10); }
        if (b.state === 'stunned') { ctx.fillStyle = '#000'; ctx.font = '16px Arial'; ctx.fillText('💫', cx, b.y - 10); }
    });

    panties.forEach(p => {
        let scale = 1 + Math.sin(p.pulse) * 0.1; ctx.save(); ctx.translate(p.x + p.width / 2, p.y + p.height / 2);
        if (p.type.rare) { ctx.shadowColor = p.type.color; ctx.shadowBlur = 10; }
        ctx.scale(scale, scale);
        
        let t = p.type.type;
        let c = p.type.color;

        ctx.fillStyle = c;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1.5;

        if (t === 'Fralda') {
            ctx.beginPath();
            ctx.moveTo(-15, -6); ctx.lineTo(15, -6);
            ctx.quadraticCurveTo(20, 10, 10, 14);
            ctx.quadraticCurveTo(0, 18, -10, 14);
            ctx.quadraticCurveTo(-20, 10, -15, -6);
            ctx.closePath();
            ctx.fill(); ctx.stroke();
            
            ctx.strokeStyle = '#ddd'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(-10, -6); ctx.quadraticCurveTo(-8, 8, -5, 12); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(10, -6); ctx.quadraticCurveTo(8, 8, 5, 12); ctx.stroke();
            
            ctx.strokeStyle = '#888'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(-12, -2); ctx.lineTo(-6, -2); ctx.stroke();
            ctx.fillStyle = '#add8e6'; ctx.beginPath(); ctx.arc(-12, -2, 2.5, 0, Math.PI*2); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(12, -2); ctx.lineTo(6, -2); ctx.stroke();
            ctx.fillStyle = '#ffb6c1'; ctx.beginPath(); ctx.arc(12, -2, 2.5, 0, Math.PI*2); ctx.fill(); ctx.stroke();
        } else if (p.type.icon === '👙') {
            ctx.beginPath(); 
            ctx.moveTo(-12, -2); ctx.quadraticCurveTo(-6, -12, 0, -2);
            ctx.moveTo(12, -2); ctx.quadraticCurveTo(6, -12, 0, -2);
            ctx.fill(); ctx.stroke();
            
            ctx.beginPath(); ctx.moveTo(-6, -9); ctx.lineTo(-9, -15); ctx.moveTo(6, -9); ctx.lineTo(9, -15); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(-12, -2); ctx.lineTo(-16, -4); ctx.moveTo(12, -2); ctx.lineTo(16, -4); ctx.stroke();
            
            ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, -2, 2, 0, Math.PI*2); ctx.fill(); ctx.stroke();

            ctx.fillStyle = c;
            ctx.beginPath();
            ctx.moveTo(-10, 6); ctx.quadraticCurveTo(0, 8, 10, 6);
            ctx.quadraticCurveTo(5, 16, 0, 18); ctx.quadraticCurveTo(-5, 16, -10, 6);
            ctx.closePath();
            ctx.fill(); ctx.stroke();
            
            ctx.beginPath(); ctx.moveTo(-10, 6); ctx.lineTo(-14, 4); ctx.moveTo(10, 6); ctx.lineTo(14, 4); ctx.stroke();

            if (t === 'Biquíni de Praia') {
                ctx.fillStyle = '#ff00ff'; ctx.beginPath(); ctx.arc(-6, -5, 2, 0, Math.PI*2); ctx.arc(6, -5, 2, 0, Math.PI*2); ctx.fill();
                ctx.fillStyle = '#ffff00'; ctx.beginPath(); ctx.arc(0, 11, 2, 0, Math.PI*2); ctx.fill();
            } else if (t === 'Renda') {
                ctx.strokeStyle = '#444'; ctx.lineWidth = 1; ctx.setLineDash([2, 1]);
                ctx.beginPath(); ctx.moveTo(-10, -4); ctx.lineTo(0, -3); ctx.lineTo(10, -4); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(-8, 8); ctx.lineTo(0, 9); ctx.lineTo(8, 8); ctx.stroke();
                ctx.setLineDash([]);
            } else if (t === 'Neon') {
                ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.moveTo(-8, -4); ctx.lineTo(-2, -4); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(-5, 8); ctx.lineTo(-1, 8); ctx.stroke();
            }
        } else {
            ctx.beginPath();
            ctx.moveTo(-14, -8);
            ctx.quadraticCurveTo(0, -6, 14, -8);
            ctx.quadraticCurveTo(16, 2, 8, 12);
            ctx.quadraticCurveTo(0, 16, -8, 12);
            ctx.quadraticCurveTo(-16, 2, -14, -8);
            ctx.closePath();
            ctx.fill(); ctx.stroke();
            
            ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(-13, -7); ctx.quadraticCurveTo(0, -5, 13, -7); ctx.stroke();
            
            ctx.fillStyle = '#ff69b4'; ctx.strokeStyle = '#000'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(-3, -8); ctx.lineTo(0, -6); ctx.lineTo(3, -8); ctx.lineTo(3, -5); ctx.lineTo(0, -6); ctx.lineTo(-3, -5); ctx.closePath(); ctx.fill(); ctx.stroke();

            if (t === 'Bolinhas') {
                ctx.fillStyle = '#fff';
                const dots = [[-8,-3], [8,-3], [0,-4], [-5,2], [5,2], [0,7], [-10,-6], [10,-6]];
                dots.forEach(pos => { ctx.beginPath(); ctx.arc(pos[0], pos[1], 1.5, 0, Math.PI*2); ctx.fill(); });
            } else if (t === 'Listrada') {
                ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(-13, -4); ctx.lineTo(13, -4);
                ctx.moveTo(-14, 0); ctx.lineTo(14, 0);
                ctx.moveTo(-12, 4); ctx.lineTo(12, 4);
                ctx.moveTo(-8, 8); ctx.lineTo(8, 8);
                ctx.stroke();
            }
        }
        ctx.restore();
    });

    distractions.forEach(d => {
        ctx.font = '20px Arial'; ctx.fillText('📻', d.x + player.size / 2, d.y + player.size / 2);
    });

    player.draw(ctx);
    enemy.draw(ctx);

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (mapLayout[r][c] === 'P') { ctx.font = '30px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('🪴', c * TILE_SIZE + TILE_SIZE / 2, r * TILE_SIZE + TILE_SIZE / 2); }
        }
    }

    particles.forEach(p => {
        if (p.type === 'ring') { ctx.strokeStyle = `rgba(255,255,255,${p.life / p.maxLife})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.stroke(); }
        else if (p.type === 'blood') { ctx.fillStyle = `rgba(200,0,0,${p.life / p.maxLife})`; ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill(); }
        else { ctx.fillStyle = p.color || '#fff'; ctx.globalAlpha = p.life / p.maxLife; ctx.font = 'bold 20px Fredoka One'; ctx.textAlign = 'center'; ctx.fillText(p.text, p.x, p.y); ctx.globalAlpha = 1.0; }
    });
}

function drawGameOverAnimation(dt) {
    gameOverAnimTimer += dt;
    if (gameOverSnapshot) ctx.drawImage(gameOverSnapshot, 0, 0);
    let cx = canvas.width / 2; let cy = canvas.height / 2; let swing = Math.sin(gameOverAnimTimer * 10);

    let squish = swing < -0.5 ? 0.6 : 1.0;
    if (squish === 0.6 && !window.lastHitSquish) {
        if (window.audioMgr) window.audioMgr.enemyHit();
        window.lastHitSquish = true;
    } else if (squish === 1.0) {
        window.lastHitSquish = false;
    }
    player.draw(ctx, cx - 140, cy + 20, 5, squish);

    let clubSwing = (swing + 1) / 2;
    enemy.draw(ctx, cx + 80, cy, 5, swing);
}

// Floating emoji particles for victory screen
let victoryEmojis = [];
let victoryBullets = [];
let bloodDrips = [];

function drawAK47VictoryAnimation(dt) {
    gameOverAnimTimer += dt;

    // Draw the game board behind (visible blurred by the CSS overlay on the div)
    draw();

    // Semi-transparent dark overlay so the board is visible but dimmed
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let cx = canvas.width / 2 - 30;
    let cy = canvas.height / 2 + 50;

    player.isShooting = true;
    player.shootAngle = -Math.PI / 2;

    // AK recoil shake
    let shakeX = Math.round((Math.random() - 0.5) * 4);
    let shakeY = Math.round((Math.random() - 0.5) * 3);

    player.draw(ctx, Math.round(cx) + shakeX, Math.round(cy) + shakeY, 6, 1);

    let tipX = Math.round(cx) + shakeX + 176; // shifted a bit more right
    let tipY = Math.round(cy) + shakeY - 180;

    // Muzzle flash at barrel tip
    if (Math.random() < 0.6) {
        ctx.fillStyle = '#ffdd00';
        ctx.beginPath();
        ctx.arc(tipX, tipY, 8 + Math.random() * 5, 0, Math.PI * 2);
        ctx.fill();
    }

    // Spawn bullets from barrel tip
    if (Math.random() < 0.5) {
        if (window.audioMgr) window.audioMgr.ak47VictoryShoot();
        // Spawn right at tipY (moved down slightly closer to barrel)
        victoryBullets.push({ x: tipX, y: tipY, vy: -1400, life: 0.8, maxLife: 0.8 });
    }

    // Spawn floating emojis randomly
    if (Math.random() < 0.15) {
        let emojis = ['💥', '🔥', '💀', '😈', '🩸', '⚡', '👿', '😤', '💪']; // removed gun emoji
        victoryEmojis.push({
            x: Math.random() * canvas.width,
            y: canvas.height + 20,
            emoji: emojis[Math.floor(Math.random() * emojis.length)],
            vy: -(80 + Math.random() * 120),
            vx: (Math.random() - 0.5) * 60,
            rot: (Math.random() - 0.5) * 4,
            angle: 0,
            size: 28 + Math.random() * 24,
            life: 1.0
        });
    }

    // Spawn melting drips from the text (starts after 3s)
    if (gameOverAnimTimer > 3.0 && Math.random() < 0.8) {
        bloodDrips.push({
            x: (Math.random() - 0.5) * 650, // Spread across text width
            y: 5 + Math.random() * 15, // Start near the bottom edge of the text
            vy: 30 + Math.random() * 60, // Grow down
            size: 1.5 + Math.random() * 2.5, // Drip thickness
            length: 0
        });
    }

    // Draw bullets going UP
    for (let i = victoryBullets.length - 1; i >= 0; i--) {
        let p = victoryBullets[i];
        p.y += p.vy * dt;
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(Math.round(p.x) - 2, Math.round(p.y), 4, 14);
        p.life -= dt;
        if (p.life <= 0) victoryBullets.splice(i, 1);
    }

    // (Blood drips are now drawn inside the text transform below)

    // Draw + update floating emojis
    for (let i = victoryEmojis.length - 1; i >= 0; i--) {
        let e = victoryEmojis[i];
        e.x += e.vx * dt;
        e.y += e.vy * dt;
        e.angle += e.rot * dt;
        e.life -= dt * 0.4;
        ctx.save();
        ctx.globalAlpha = Math.min(1, e.life);
        ctx.translate(Math.round(e.x), Math.round(e.y));
        ctx.rotate(e.angle);
        ctx.font = `${e.size}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(e.emoji, 0, 0);
        ctx.restore();
        if (e.life <= 0) victoryEmojis.splice(i, 1);
    }

    // Pulsing scale for the victory text — macabre style
    let pulse = 1 + 0.07 * Math.sin(gameOverAnimTimer * 5);
    // Color flicker between dark red and blood red
    let flicker = Math.sin(gameOverAnimTimer * 18);
    let r = Math.floor(180 + flicker * 40);
    let textColor = `rgb(${r}, 0, 0)`;
    let textY = 40; // Moved higher

    ctx.save();
    ctx.translate(Math.round(canvas.width / 2), textY);
    ctx.scale(pulse, pulse);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 44px "Fredoka One", cursive';

    // Drip shadow effect: draw shifted copies below in dark red
    ctx.fillStyle = 'rgba(80,0,0,0.6)';
    ctx.fillText('☠ AGORA NADA VAI ME PARAR! ☠', 2, 5);
    ctx.fillText('☠ AGORA NADA VAI ME PARAR! ☠', 1, 8);

    // Black stroke outline
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#000';
    ctx.strokeText('☠ AGORA NADA VAI ME PARAR! ☠', 0, 0);

    // Main fill with flicker color
    ctx.fillStyle = textColor;
    ctx.fillText('☠ AGORA NADA VAI ME PARAR! ☠', 0, 0);

    // Draw melting blood drips attached to the text
    for (let i = bloodDrips.length - 1; i >= 0; i--) {
        let d = bloodDrips[i];
        d.length += d.vy * dt;

        ctx.fillStyle = textColor;
        ctx.beginPath();
        // The drip body (rectangle)
        ctx.fillRect(d.x - d.size, d.y, d.size * 2, d.length);
        // The rounded tip of the drip
        ctx.arc(d.x, d.y + d.length, d.size, 0, Math.PI);
        ctx.fill();

        // Remove if it gets too long (melts off screen)
        if (d.length > 800) bloodDrips.splice(i, 1);
    }

    ctx.restore();
}

let lastTime = 0;
function loop(timestamp) {
    let dt = (timestamp - lastTime) / 1000; lastTime = timestamp; if (dt > 0.1) dt = 0.1;

    if (cheatHoldingSpace) {
        cheatTimer += dt;
        if (cheatTimer >= 3.0) {
            cheatHoldingSpace = false;
            cheatTimer = 0;
            cheatWCount = 0;
            openCheatMenu();
        }
    }

    if (gameState === 'PLAYING') { update(dt); draw(); }
    else if (gameState === 'PAUSED') { draw(); }
    else if (gameState === 'GAMEOVER') drawGameOverAnimation(dt);
    else if (gameState === 'AK47_VICTORY') drawAK47VictoryAnimation(dt);

    requestAnimationFrame(loop);
}

// UI Buttons
document.getElementById('btn-play').addEventListener('click', () => {
    document.getElementById('start-screen').classList.add('hidden');
    let isMobile = window.innerWidth <= 1250;

    document.getElementById('tut-text-move').innerHTML = isMobile ?
        `Use os <strong>botões de SETAS</strong> na tela para andar.<br>Pressione o botão <strong>AÇÃO</strong> para pegar as calcinhas!` :
        `Use <strong>WASD</strong> para andar.<br>Pressione <strong>ESPAÇO</strong> para pegar as calcinhas!`;

    document.getElementById('tut-text-run').innerHTML = isMobile ?
        `Segure o botão <strong>CORRER</strong> para correr, mas cuidado!<br>Correr faz barulho e aumenta a <strong>Suspeita</strong>.` :
        `Segure <strong>SHIFT</strong> para correr, mas cuidado!<br>Correr faz barulho e aumenta a <strong>Suspeita</strong>.`;

    document.getElementById('tut-text-distraction').innerHTML = isMobile ?
        `Ao comprar o upgrade de Distração, você inicia a fase com cargas.<br>Use o botão 💨 para jogar um rádio e distrair as banhistas!` :
        `Ao comprar o upgrade de Distração, você inicia a fase com cargas.<br>Aperte a tecla <strong>E</strong> para jogar um rádio e distrair as banhistas!`;

    document.getElementById('tutorial-screen').classList.remove('hidden');
});
document.getElementById('btn-tut-next').addEventListener('click', () => {
    const slides = document.querySelectorAll('#tutorial-screen .tut-slide');
    let active = [...slides].findIndex(s => !s.classList.contains('hidden'));
    slides[active].classList.add('hidden');
    if (active + 1 < slides.length) {
        slides[active + 1].classList.remove('hidden');
        if (active + 1 === slides.length - 1) { document.getElementById('btn-tut-next').classList.add('hidden'); document.getElementById('btn-tut-start').classList.remove('hidden'); }
    }
});
document.getElementById('btn-tut-start').addEventListener('click', () => { document.getElementById('tutorial-screen').classList.add('hidden'); startLevel(); });

document.getElementById('btn-pause-mobile').addEventListener('touchstart', pauseAction);
document.getElementById('btn-pause-mobile').addEventListener('mousedown', pauseAction);

document.getElementById('btn-resume').addEventListener('click', () => {
    if (gameState === 'PAUSED') {
        if (window.audioMgr && window.audioMgr.ctx) window.audioMgr.ctx.resume();
        gameState = 'PLAYING';
        document.getElementById('pause-screen').classList.add('hidden');
    }
});
document.getElementById('btn-resume').addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (gameState === 'PAUSED') {
        if (window.audioMgr && window.audioMgr.ctx) window.audioMgr.ctx.resume();
        gameState = 'PLAYING';
        document.getElementById('pause-screen').classList.add('hidden');
    }
});

document.getElementById('btn-mute').addEventListener('click', (e) => {
    if (window.audioMgr) {
        let isMuted = window.audioMgr.toggleMute();
        e.target.innerHTML = isMuted ? "🔇 SOM: DESLIGADO" : "🔊 SOM: LIGADO";
        e.target.style.background = isMuted ? "#882222" : "#555";
    }
});

document.getElementById('btn-restart').addEventListener('click', () => {
    document.getElementById('game-over-screen').classList.add('hidden');
    startLevel();
});

document.getElementById('btn-shop').addEventListener('click', () => {
    document.getElementById('btn-next-stage').classList.remove('hidden');
    document.getElementById('btn-shop-close-cheat').classList.add('hidden');
    document.getElementById('victory-screen').classList.add('hidden');
    document.getElementById('shop-screen').classList.remove('hidden');
    renderShop();
});

document.getElementById('btn-ak47-next').addEventListener('click', () => {
    document.getElementById('ak47-victory-screen').classList.add('hidden');

    gameState = 'PLAYING';
    document.getElementById('hud').classList.remove('hidden');
    if (window.innerWidth <= 1250) document.getElementById('mobile-controls').classList.remove('hidden');
});
document.getElementById('btn-ak47-continue').addEventListener('click', () => {
    document.getElementById('ak47-tutorial-screen').classList.add('hidden');
    startLevel();
});
document.getElementById('btn-agarradeira-continue').addEventListener('click', () => {
    document.getElementById('agarradeira-tutorial-screen').classList.add('hidden');
    startLevel();
});

let cheatLastGameState = 'START';

// Cheat buttons
document.getElementById('btn-cheat-apply').addEventListener('click', () => {
    let s = parseInt(document.getElementById('cheat-stage').value);
    let pts = parseInt(document.getElementById('cheat-points').value);

    let changedStage = (s !== stage);
    if (!isNaN(s) && s >= 1 && s <= 35) stage = s;
    if (!isNaN(pts) && pts > 0) shopPoints += pts;

    showToast("✔️ Cheat Aplicado!");

    if (!document.getElementById('shop-screen').classList.contains('hidden')) {
        renderShop();
    } else if (changedStage && (gameState === 'PLAYING' || gameState === 'PAUSED')) {
        startLevel();
        gameState = 'PAUSED';
        document.getElementById('pause-screen').classList.remove('hidden');
    } else if (gameState === 'PLAYING' || gameState === 'PAUSED') {
        updateHUD();
    }
});

document.getElementById('btn-cheat-close').addEventListener('click', () => {
    document.getElementById('cheat-screen').classList.add('hidden');
    document.getElementById('pause-screen').classList.add('hidden');

    // Always resume game if it was playing, regardless of previous state
    if (cheatLastGameState === 'PLAYING' || gameState === 'PAUSED') {
        gameState = 'PLAYING';
    } else {
        gameState = cheatLastGameState;
    }
});

document.getElementById('btn-cheat-shop').addEventListener('click', () => {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('pause-screen').classList.add('hidden');
    document.getElementById('tutorial-screen').classList.add('hidden');
    document.getElementById('game-over-screen').classList.add('hidden');
    document.getElementById('victory-screen').classList.add('hidden');
    document.getElementById('ak47-victory-screen').classList.add('hidden');
    document.getElementById('cheat-screen').classList.add('hidden');

    cheatLastGameState = gameState;
    gameState = 'SHOP';

    document.getElementById('btn-next-stage').classList.add('hidden');
    document.getElementById('btn-shop-close-cheat').classList.remove('hidden');

    document.getElementById('shop-screen').classList.remove('hidden');
    renderShop();
});

document.getElementById('btn-shop-close-cheat').addEventListener('click', () => {
    document.getElementById('shop-screen').classList.add('hidden');
    document.getElementById('cheat-screen').classList.remove('hidden');

    document.getElementById('btn-next-stage').classList.remove('hidden');
    document.getElementById('btn-shop-close-cheat').classList.add('hidden');

    gameState = 'PAUSED';
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
    if (stage < 35) stage++;

    if (hasAK47 && !ak47TutorialShown) {
        ak47TutorialShown = true;
        let isMobile = window.innerWidth <= 1250;
        document.getElementById('ak47-tut-text').innerHTML = isMobile ?
            `Acabou a furtividade. Agora é bala!<br><br>📱 <strong>Use o botão de ATIRAR</strong> no canto da tela para neutralizar a Dona do Banheiro.` :
            `Acabou a furtividade. Agora é bala!<br><br>🖥️ <strong>Clique com o botão ESQUERDO do mouse</strong> para neutralizar a Dona do Banheiro.`;
        document.getElementById('ak47-tutorial-screen').classList.remove('hidden');
    } else if (stage >= 3 && !agarradeiraTutorialShown) {
        agarradeiraTutorialShown = true;
        document.getElementById('agarradeira-tutorial-screen').classList.remove('hidden');
    } else {
        startLevel();
    }
});

document.getElementById('btn-buy-ak47').addEventListener('click', (e) => {
    if (shopPoints >= 10000 && !hasAK47) {
        if (window.audioMgr) window.audioMgr.buyUpgrade();
        shopPoints -= 10000; hasAK47 = true; unlockConquista('c24');
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

        if (isAcquired) div.classList.add('acquired');
        if (isNext) div.classList.add('next');
        if (isLocked) div.classList.add('locked');

        div.innerHTML = `
            <div class="item-info">
                <h3>Nível ${item.level}: ${item.name}</h3>
                <p>${item.effect}</p>
            </div>
            <button class="btn-buy ${isAcquired ? 'acquired-btn' : ''}" ${!isNext || shopPoints < item.cost ? 'disabled' : ''} onclick="buyUpgrade('${currentTab}', ${item.cost})">${isAcquired ? 'Adquirido' : item.cost + ' pts'}</button>
        `;
        content.appendChild(div);
    });

    let totalLvl = Object.values(upgrades).reduce((a, b) => a + b, 0);
    document.getElementById('total-level').textContent = totalLvl;

    if (totalLvl === 45) {
        document.getElementById('ak47-shop-item').classList.remove('hidden');
        drawAK47ShopCanvas();
        if (hasAK47) {
            document.getElementById('btn-buy-ak47').textContent = 'EQUIPADA';
            document.getElementById('btn-buy-ak47').disabled = true;
        } else {
            document.getElementById('btn-buy-ak47').disabled = (shopPoints < 10000);
        }
    }
}

function drawAK47ShopCanvas() {
    const sc = document.getElementById('ak47-shop-canvas');
    if (!sc) return;
    const sx = sc.getContext('2d');
    sx.clearRect(0, 0, sc.width, sc.height);

    // Draw AK-47 centered, scale=3, pointing right
    sx.save();
    sx.translate(20, 30); // Start from left center

    const s = 3; // scale

    // Stock (back)
    sx.fillStyle = '#8b4513';
    sx.fillRect(-10 * s, -3 * s, 10 * s, 6 * s);

    // Handguard (mid)
    sx.fillStyle = '#8b4513';
    sx.fillRect(6 * s, -3 * s, 10 * s, 6 * s);

    // Barrel (metal, long)
    sx.fillStyle = '#444';
    sx.fillRect(0, -2 * s, 28 * s, 4 * s);

    // Iron sight
    sx.fillStyle = '#333';
    sx.fillRect(26 * s, -5 * s, 2 * s, 4 * s);

    // Magazine
    sx.fillStyle = '#222';
    sx.fillRect(10 * s, 2 * s, 4 * s, 8 * s);

    // Grip
    sx.fillStyle = '#222';
    sx.fillRect(0, 2 * s, 3 * s, 6 * s);

    // Muzzle flash glow
    sx.fillStyle = '#ffdd00';
    sx.beginPath();
    sx.arc(28 * s + 6, 0, 7, 0, Math.PI * 2);
    sx.fill();
    sx.fillStyle = '#fff';
    sx.beginPath();
    sx.arc(28 * s + 6, 0, 3, 0, Math.PI * 2);
    sx.fill();

    sx.restore();
}
// --- SISTEMA DE CONQUISTAS ---
const conquistasData = [
    { id: 'c1', cat: 1, nome: 'Primeira Calcinha', desc: 'Roube sua primeira calcinha', tipo: 'acumulo', max: 1 },
    { id: 'c2', cat: 1, nome: 'Colecionador Iniciante', desc: 'Roube 10 calcinhas no total', tipo: 'acumulo', max: 10 },
    { id: 'c3', cat: 1, nome: 'Colecionador Dedicado', desc: 'Roube 50 calcinhas no total', tipo: 'acumulo', max: 50 },
    { id: 'c4', cat: 1, nome: 'Colecionador Profissional', desc: 'Roube 100 calcinhas no total', tipo: 'acumulo', max: 100 },
    { id: 'c5', cat: 1, nome: 'Mestre das Calcinhas', desc: 'Roube 500 calcinhas no total', tipo: 'acumulo', max: 500 },
    { id: 'c6', cat: 1, nome: 'Rei das Calcinhas', desc: 'Roube 1000 calcinhas no total', tipo: 'acumulo', max: 1000 },
    { id: 'c7', cat: 2, nome: 'Primeiro Dia', desc: 'Complete a fase 1', tipo: 'unico' },
    { id: 'c8', cat: 2, nome: 'Uma Semana de Trabalho', desc: 'Complete 5 fases', tipo: 'unico' },
    { id: 'c9', cat: 2, nome: 'Mês de Experiência', desc: 'Complete 15 fases', tipo: 'unico' },
    { id: 'c10', cat: 2, nome: 'Profissional do Ano', desc: 'Complete 20 fases', tipo: 'unico' },
    { id: 'c11', cat: 2, nome: 'Imparável', desc: 'Complete 30 fases', tipo: 'unico' },
    { id: 'c12', cat: 3, nome: 'Ninja Silencioso', desc: 'Complete uma fase sem ser visto', tipo: 'unico' },
    { id: 'c13', cat: 3, nome: 'Fantasma', desc: 'Complete 5 fases sem ser visto', tipo: 'acumulo', max: 5 },
    { id: 'c14', cat: 3, nome: 'Sombra', desc: 'Complete 10 fases sem ser visto', tipo: 'acumulo', max: 10 },
    { id: 'c15', cat: 3, nome: 'Invisível', desc: 'Fique 60 segundos sem aumentar a barra de suspeita', tipo: 'unico' },
    { id: 'c16', cat: 4, nome: 'Primeiro Combo', desc: 'Faça um combo x2', tipo: 'unico' },
    { id: 'c17', cat: 4, nome: 'Combo Emocionante', desc: 'Faça um combo x5', tipo: 'unico' },
    { id: 'c18', cat: 4, nome: 'Pontuador', desc: 'Alcance 500 pontos em uma fase', tipo: 'unico' },
    { id: 'c19', cat: 4, nome: 'Pontuador de Elite', desc: 'Alcance 1000 pontos em uma fase', tipo: 'unico' },
    { id: 'c20', cat: 4, nome: 'Milionário', desc: 'Acumule 50.000 pontos totais', tipo: 'acumulo', max: 50000 },
    { id: 'c21', cat: 5, nome: 'Primeira Melhoria', desc: 'Compre seu primeiro upgrade', tipo: 'unico' },
    { id: 'c22', cat: 5, nome: 'Viciado em Compras', desc: 'Compre 10 upgrades', tipo: 'acumulo', max: 10 },
    { id: 'c23', cat: 5, nome: 'Colecionador de Melhorias', desc: 'Compre 20 upgrades', tipo: 'acumulo', max: 20 },
    { id: 'c24', cat: 5, nome: 'Armeiro', desc: 'Desbloqueie a AK-47', tipo: 'unico', secreta: true },
    { id: 'c25', cat: 6, nome: 'Espertinho', desc: 'Escape de uma banhista antes dela gritar', tipo: 'unico' },
    { id: 'c26', cat: 6, nome: 'Sobrevivente', desc: 'Sobreviva a 3 gritos em uma fase', tipo: 'unico' },
    { id: 'c27', cat: 6, nome: 'Distraidor', desc: 'Use 10 itens de distração', tipo: 'acumulo', max: 10 },
    { id: 'c28', cat: 6, nome: 'Vingador', desc: 'Mate a Dona do Banheiro com AK-47', tipo: 'unico', secreta: true },
    { id: 'c29', cat: 7, nome: 'Paciência', desc: 'Jogue por 2 horas no total', tipo: 'acumulo', max: 7200 },
    { id: 'c30', cat: 7, nome: 'Lenda', desc: 'Desbloqueie TODAS as conquistas', tipo: 'unico' },
    { id: 'c31', cat: 7, nome: 'Hacker de Calcinhas', desc: 'Você abriu o menu secreto!', tipo: 'unico', secreta: true },
    { id: 'c32', cat: 7, nome: 'Cuidado com o Vermelho', desc: 'Caiu em uma armadilha...', tipo: 'unico', secreta: true },
    { id: 'c33', cat: 7, nome: 'Caos no Banheiro', desc: 'Derrote uma banhista com a AK-47', tipo: 'unico', secreta: true }
];

let conquistasSalvas = {};
conquistasData.forEach(c => {
    conquistasSalvas[c.id] = { desbloqueada: false, progresso: 0 };
});

function salvarConquistas() {
    verificarLenda();
}

let filaConquistas = [];
let exibindoConquista = false;

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playDing() {
    if (gameState === 'PAUSED' || gameState === 'SHOP') return;
    if (window.audioMgr && window.audioMgr.isMuted) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    let osc = audioCtx.createOscillator();
    let gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.1);

    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.5);
}

function exibirProximaConquista() {
    if (exibindoConquista || filaConquistas.length === 0) return;
    exibindoConquista = true;
    let conquistaId = filaConquistas.shift();
    let data = conquistasData.find(c => c.id === conquistaId);
    if (!data) { exibindoConquista = false; return; }

    document.getElementById('conquista-name-popup').textContent = data.nome;
    let popup = document.getElementById('conquista-popup');

    popup.classList.add('show');
    let icon = popup.querySelector('.conquista-icon');

    playDing();

    setTimeout(() => {
        icon.classList.add('glow');
        setTimeout(() => icon.classList.remove('glow'), 300);
    }, 500);

    setTimeout(() => {
        popup.classList.remove('show');
        setTimeout(() => {
            exibindoConquista = false;
            exibirProximaConquista();
        }, 500);
    }, 4500);
}

function unlockConquista(id) {
    if (conquistasSalvas[id].desbloqueada) return;
    conquistasSalvas[id].desbloqueada = true;
    conquistasSalvas[id].data = new Date().toISOString().split('T')[0];
    salvarConquistas();
    filaConquistas.push(id);
    exibirProximaConquista();
}

function addProgressoConquista(id, val) {
    if (conquistasSalvas[id].desbloqueada) return;
    conquistasSalvas[id].progresso += val;
    let c = conquistasData.find(x => x.id === id);
    if (c && c.tipo === 'acumulo' && conquistasSalvas[id].progresso >= c.max) {
        unlockConquista(id);
    } else {
        salvarConquistas();
    }
}

function verificarLenda() {
    if (conquistasSalvas['c30'] && conquistasSalvas['c30'].desbloqueada) return;
    let total = Object.values(conquistasSalvas).filter(c => c.desbloqueada).length;
    if (total >= 32) unlockConquista('c30');
}

let tempoTotalJogo = 0;
let faseGritos = 0;
let fasePerfeitaSemVisto = true;
let ultimaSuspeita = 0;
let tempoSemSuspeita = 0;

function renderTelaConquistas(filtro = 'all') {
    let list = document.getElementById('conquistas-list');
    list.innerHTML = '';

    let totalUnlocks = Object.values(conquistasSalvas).filter(c => c.desbloqueada).length;
    document.getElementById('conquistas-count').textContent = totalUnlocks;

    let missingSecrets = 0;

    conquistasData.forEach(c => {
        let save = conquistasSalvas[c.id];

        if (filtro === 'secret') {
            if (!c.secreta) return;
            if (!save.desbloqueada) {
                missingSecrets++;
                return;
            }
        } else {
            if (c.secreta && !save.desbloqueada) return;
            if (filtro === 'unlocked' && !save.desbloqueada) return;
            if (filtro === 'locked' && save.desbloqueada) return;
        }

        let div = document.createElement('div');
        div.className = 'conquista-item ' + (save.desbloqueada ? 'unlocked' : '');

        let icon = save.desbloqueada ? '🏆' : '🔒';
        let statusStr = save.desbloqueada ? '✅ OK' : '❌';

        let prog = '';
        if (!save.desbloqueada && c.tipo === 'acumulo') {
            let pct = Math.min(100, (save.progresso / c.max) * 100);
            prog = `
                <div style="font-size:0.8rem; margin-top:5px;">Progresso: ${save.progresso}/${c.max} (${Math.floor(pct)}%)</div>
                <div class="c-progress-bar"><div class="c-progress-fill" style="width: ${pct}%"></div></div>
            `;
        }

        div.innerHTML = `
            <div class="c-item-icon">${icon}</div>
            <div class="c-item-info">
                <h4>${c.nome}</h4>
                <p>${c.desc}</p>
                ${prog}
            </div>
            <div class="c-status">${statusStr}</div>
        `;
        list.appendChild(div);
    });

    if (filtro === 'secret' && missingSecrets > 0) {
        let div = document.createElement('div');
        div.className = 'conquista-item';
        div.innerHTML = `
            <div class="c-item-icon">🔒</div>
            <div class="c-item-info">
                <h4>Mistério...</h4>
                <p>Faltam ${missingSecrets} conquista(s) secreta(s) para descobrir.</p>
            </div>
            <div class="c-status">❌</div>
        `;
        list.appendChild(div);
    }
}

document.getElementById('btn-conquistas-pause').addEventListener('click', () => {
    document.getElementById('pause-screen').classList.add('hidden');
    document.getElementById('conquistas-screen').classList.remove('hidden');
    renderTelaConquistas();
});

document.getElementById('btn-conquistas-close').addEventListener('click', () => {
    document.getElementById('conquistas-screen').classList.add('hidden');
    document.getElementById('pause-screen').classList.remove('hidden');
});

document.querySelectorAll('.c-filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.c-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderTelaConquistas(btn.dataset.filter);
    });
});

window.buyUpgrade = function (cat, cost) {
    if (shopPoints >= cost && upgrades[cat] < 5) {
        if (window.audioMgr) window.audioMgr.buyUpgrade();
        shopPoints -= cost; upgrades[cat]++;
        addProgressoConquista('c21', 1);
        addProgressoConquista('c22', 1);
        addProgressoConquista('c23', 1);
        renderShop();
    }
};

requestAnimationFrame(loop);

document.addEventListener('click', () => {
    if (window.audioMgr && !window.audioMgr.initialized) {
        window.audioMgr.init();
    }
}, { once: true });

