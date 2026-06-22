const fs = require('fs');
const path = require('path');

// Ensure directories
const systemsDir = path.join(__dirname, 'public', 'systems');
const coversDir = path.join(__dirname, 'public', 'covers');

if (!fs.existsSync(systemsDir)) {
  fs.mkdirSync(systemsDir, { recursive: true });
}
if (!fs.existsSync(coversDir)) {
  fs.mkdirSync(coversDir, { recursive: true });
}

// 1. Helper to generate clean game slug
const getGameSlug = (systemId, title) => {
  const cleanTitle = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return `${systemId}-${cleanTitle}`;
};

// 2. Load systems data to generate individual items
const dbPath = path.join(__dirname, 'public', 'db.json');
const database = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Console Specifications & Colors
const consoleSpecs = {
  nes: { color: '#E60012', desc: '8-BIT CONTROL DECK', cpu: 'RP2A03 1.79MHz', chip: 'NINTENDO RICOH' },
  snes: { color: '#4F46E5', desc: '16-BIT SUPER CONSOLE', cpu: '5A22 3.58MHz', chip: 'S-PPU1 / S-PPU2' },
  n64: { color: '#3b82f6', desc: '64-BIT ULTRA GRAPHICS', cpu: 'VR4300 93.75MHz', chip: 'REALITY COPROCESSOR' },
  gb: { color: '#059669', desc: 'MONOCHROME RETRO DIRECT', cpu: 'LR35902 4.19MHz', chip: 'DOT MATRIX DISPLAY' },
  gba: { color: '#a855f7', desc: '32-BIT VERTICAL POCKET', cpu: 'ARM7TDMI 16.78MHz', chip: 'REFLECTIVE LCD' },
  sms: { color: '#06b6d4', desc: '8-BIT MASTER SYSTEM', cpu: 'Z80A 3.58MHz', chip: 'SEGA CUSTOM VDP' },
  genesis: { color: '#2563eb', desc: '16-BIT BLAST PROCESSING', cpu: 'MC68000 7.67MHz', chip: 'YAMAHA YM2612' },
  saturn: { color: '#64748b', desc: 'DOUBLE SH-2 CORE ENGINE', cpu: '2x SH-2 28.6MHz', chip: 'VDP1 & VDP2 ENGINE' },
  ps1: { color: '#f97316', desc: '32-BIT PLAYSTATION DECK', cpu: 'MIPS R3000A 33.8MHz', chip: 'SONY GTE H/W' },
  atari: { color: '#d97706', desc: 'VCS WOOD PANEL RETRO', cpu: 'MOS 6507 1.19MHz', chip: 'STELLA INIA CONTROLLER' },
  arcade: { color: '#ec4899', desc: 'CABINET COIN-OP SYSTEM', cpu: 'CUSTOM ARCHITECTURE', chip: 'RGB CRT RASTER MONITOR' },
  neogeo: { color: '#f59e0b', desc: '16-BIT MULTI VIDEO DECK', cpu: 'MC68000 + Z80A', chip: 'SNK MAX 330 MEGA' },
  nds: { color: '#0ea5e9', desc: 'DUAL SCREEN GRAPHICS', cpu: 'ARM9 67MHz + ARM7', chip: 'TOUCH / DISPLAY S/W' },
  pce: { color: '#f43f5e', desc: 'TURBOGRAFX-16 TURBO', cpu: 'HuC6280 7.16Mhz', chip: 'NEC DUAL AUDIO/GFX' },
  '3do': { color: '#8b5cf6', desc: '32-BIT INTERACTIVE DEC', cpu: 'ARM60 12.5MHz RISC', chip: 'CUSTOM CLIO / ANVIL' },
  gamecube: { color: '#4F3F84', desc: '128-BIT COMPACT CUBE', cpu: 'IBM Broadway 485MHz', chip: 'ATI Flipper 162MHz' },
  dreamcast: { color: '#e55026', desc: '128-BIT SWIRL ADVENTURE', cpu: 'Hitachi SH-4 200MHz', chip: 'NEC PowerVR2 CLX2' },
  playstation2: { color: '#003087', desc: '128-BIT EMOTION ENGINE', cpu: 'EE @ 294MHz', chip: 'Graphics Synthesizer' },
  playstation3: { color: '#1f1f1f', desc: 'CELL BROADBAND MACHINE', cpu: 'Cell @ 3.2GHz', chip: 'NVIDIA RSX @ 550MHz' }
};

// --- A. GENERATE CONSOLE WALLPAPERS ---
console.log('[RetroHub Assets] Gerando papéis de parede dos consoles...');
database.forEach(system => {
  const spec = consoleSpecs[system.id] || { color: '#EF4444', desc: 'RETRO EMULATOR CABINET', cpu: 'MOCK CORE', chip: 'EMULATION' };
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="100%" height="100%">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#111116" />
      <stop offset="100%" stop-color="#050507" />
    </radialGradient>
    <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${spec.color}" stop-opacity="0.32" />
      <stop offset="50%" stop-color="#111115" stop-opacity="0" />
      <stop offset="100%" stop-color="${spec.color}" stop-opacity="0.08" />
    </linearGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.015)" stroke-width="1"/>
    </pattern>
  </defs>

  <!-- Dark Cosmic Canvas -->
  <rect width="1200" height="800" fill="url(#bgGrad)" />
  <rect width="1200" height="800" fill="url(#glowGrad)" />
  <rect width="1200" height="800" fill="url(#grid)" />

  <!-- Accent glow spots -->
  <circle cx="600" cy="400" r="320" fill="${spec.color}" opacity="0.04" filter="blur(60px)" />

  <!-- Diagonal Aesthetic lines -->
  <path d="M-100 200 L1300 600" stroke="${spec.color}" stroke-opacity="0.1" stroke-width="1.5" />
  <path d="M-100 240 L1300 640" stroke="${spec.color}" stroke-opacity="0.04" stroke-width="1" />
  
  <!-- Cyber-Grid concentric decoration -->
  <circle cx="600" cy="400" r="180" fill="none" stroke="${spec.color}" stroke-opacity="0.12" stroke-width="2" stroke-dasharray="16, 24" />
  <circle cx="600" cy="400" r="280" fill="none" stroke="${spec.color}" stroke-opacity="0.06" stroke-width="1" />
  <circle cx="600" cy="400" r="380" fill="none" stroke="${spec.color}" stroke-opacity="0.03" stroke-width="1" stroke-dasharray="4, 12" />

  <!-- Console tech info overlay center-left -->
  <g transform="translate(150, 240)">
    <!-- Console ID Badge -->
    <rect width="110" height="24" rx="4" fill="${spec.color}" fill-opacity="0.12" stroke="${spec.color}" stroke-opacity="0.4" stroke-width="1" />
    <text x="55" y="16" fill="${spec.color}" font-family="monospace" font-size="10" font-weight="900" letter-spacing="2" text-anchor="middle">${system.logo.toUpperCase()}</text>

    <!-- Main Title text -->
    <text x="0" y="70" fill="#ffffff" font-family="'Space Grotesk', system-ui, sans-serif" font-size="44" font-weight="900" opacity="0.9" letter-spacing="-1">${system.name.toUpperCase()}</text>
    
    <!-- Subtitle descriptor -->
    <text x="0" y="105" fill="#a1a1aa" font-family="'Space Grotesk', system-ui, sans-serif" font-size="14" font-weight="700" letter-spacing="4">${spec.desc}</text>
    
    <!-- Horizontal timeline divider -->
    <path d="M 0 130 L 400 130" stroke="rgba(255,255,255,0.08)" stroke-width="1" />
    
    <!-- Vertical Specification statistics -->
    <g transform="translate(0, 160)">
      <text x="0" y="0" fill="${spec.color}" font-family="monospace" font-size="10" font-weight="900" letter-spacing="1">FABRICANTE :</text>
      <text x="130" y="0" fill="#ffffff" font-family="monospace" font-size="11" font-weight="bold" opacity="0.8">${system.manufacturer.toUpperCase()}</text>

      <text x="0" y="25" fill="${spec.color}" font-family="monospace" font-size="10" font-weight="900" letter-spacing="1">CPU RETRO :</text>
      <text x="130" y="25" fill="#ffffff" font-family="monospace" font-size="11" font-weight="bold" opacity="0.8">${spec.cpu}</text>

      <text x="0" y="50" fill="${spec.color}" font-family="monospace" font-size="10" font-weight="900" letter-spacing="1">CHIP GRAFICO :</text>
      <text x="130" y="50" fill="#ffffff" font-family="monospace" font-size="11" font-weight="bold" opacity="0.8">${spec.chip}</text>

      <text x="0" y="75" fill="${spec.color}" font-family="monospace" font-size="10" font-weight="900" letter-spacing="1">LANCAMENTO :</text>
      <text x="130" y="75" fill="#ffffff" font-family="monospace" font-size="11" font-weight="bold" opacity="0.8">${system.releaseYear} AC</text>
    </g>
  </g>

  <!-- Technical border corners -->
  <g stroke="${spec.color}" stroke-opacity="0.3" stroke-width="1.5" fill="none">
    <path d="M 30 50 L 30 30 L 50 30" />
    <path d="M 1170 50 L 1170 30 L 1150 30" />
    <path d="M 30 750 L 30 770 L 50 770" />
    <path d="M 1170 750 L 1170 770 L 1150 770" />
  </g>

  <!-- Watermark details right-bottom -->
  <text x="1150" y="755" fill="#a1a1aa" font-family="monospace" font-size="9" font-weight="bold" letter-spacing="1.5" text-anchor="end" opacity="0.25">RECALBOX HUB SPECIFICATION SYSTEM - v6.2</text>
  <text x="1150" y="770" fill="#a1a1aa" font-family="monospace" font-size="8" text-anchor="end" opacity="0.15">SECURE OFFLINE SYSTEM ROM CARTRIDGES MOUNTED</text>
</svg>`;

  fs.writeFileSync(path.join(systemsDir, `${system.id}.svg`), svg);
  
  // Rewire background to local cover format
  system.backgroundImage = `/systems/${system.id}.svg`;
});


// --- B. GENERATE SPECIFIC GAME COVERS ---
console.log('[RetroHub Assets] Gerando capas altamente estilizadas dos jogos...');
let coverCount = 0;

database.forEach(system => {
  system.gameDefs.forEach(gd => {
    const slug = getGameSlug(system.id, gd.title);
    const spec = consoleSpecs[system.id] || { color: '#EF4444' };
    
    // Choose cover background highlights based on genre
    let genreColorStart = '#18181b';
    let genreColorEnd = '#09090b';
    let labelColorLabel = '#ffffff';

    if (gd.genre.includes('Plataforma')) {
      genreColorStart = '#1d4ed8'; // blue
      genreColorEnd = '#1e3a8a';
      labelColorLabel = '#38bdf8';
    } else if (gd.genre.includes('RPG')) {
      genreColorStart = '#047857'; // emerald
      genreColorEnd = '#064e3b';
      labelColorLabel = '#34d399';
    } else if (gd.genre.includes('Zelda') || gd.genre.includes('Aventura')) {
      genreColorStart = '#b45309'; // amber gold
      genreColorEnd = '#78350f';
      labelColorLabel = '#fbbf24';
    } else if (gd.genre.includes('Ação') || gd.genre.includes('Metroidvania')) {
      genreColorStart = '#be123c'; // red/pink
      genreColorEnd = '#881337';
      labelColorLabel = '#fda4af';
    } else if (gd.genre.includes('Corrida')) {
      genreColorStart = '#0369a1'; // light blue
      genreColorEnd = '#0c4a6e';
      labelColorLabel = '#7dd3fc';
    } else if (gd.genre.includes('Luta') || gd.genre.includes('Beat')) {
      genreColorStart = '#6d28d9'; // purple
      genreColorEnd = '#4c1d95';
      labelColorLabel = '#c084fc';
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 400" width="100%" height="100%">
  <defs>
    <linearGradient id="coverGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${genreColorStart}" />
      <stop offset="65%" stop-color="${genreColorEnd}" />
      <stop offset="100%" stop-color="#000000" />
    </linearGradient>
    <radialGradient id="highlightGlow" cx="50%" cy="30%" r="60%">
      <stop offset="0%" stop-color="${spec.color}" stop-opacity="0.32" />
      <stop offset="100%" stop-color="${spec.color}" stop-opacity="0" />
    </radialGradient>
  </defs>

  <!-- Outer frame -->
  <rect width="320" height="400" fill="#09090b" rx="14" stroke="rgba(255,255,255,0.09)" stroke-width="3" />
  
  <!-- Interactive artwork area -->
  <rect x="12" y="12" width="296" height="376" rx="8" fill="url(#coverGrad)" />
  <rect x="12" y="12" width="296" height="376" rx="8" fill="url(#highlightGlow)" />

  <!-- Retro console banner tag -->
  <path d="M 12 12 L 308 12 L 308 55 L 12 55 Z" fill="#000000" fill-opacity="0.8" />
  
  <text x="24" y="38" fill="${spec.color}" font-family="monospace" font-weight="900" font-size="12" letter-spacing="1.5">${system.logo.toUpperCase()}</text>
  <text x="296" y="38" fill="#a1a1aa" font-family="'Space Grotesk', system-ui, sans-serif" font-weight="bold" font-size="10" text-anchor="end" letter-spacing="1">EDICAO CLASSICA</text>

  <!-- Horizontal divider line from console border color -->
  <line x1="12" y1="55" x2="308" y2="55" stroke="${spec.color}" stroke-width="2" />

  <!-- Grid decoration pattern overlay -->
  <g opacity="0.08">
    <line x1="12" y1="120" x2="308" y2="120" stroke="#ffffff" stroke-width="1" />
    <line x1="12" y1="180" x2="308" y2="180" stroke="#ffffff" stroke-width="1" />
    <line x1="12" y1="240" x2="308" y2="240" stroke="#ffffff" stroke-width="1" />
    <line x1="12" y1="300" x2="308" y2="300" stroke="#ffffff" stroke-width="1" />
    <line x1="60" y1="55" x2="60" y2="388" stroke="#ffffff" stroke-width="1" stroke-dasharray="2, 6" />
    <line x1="160" y1="55" x2="160" y2="388" stroke="#ffffff" stroke-width="1" />
    <line x1="260" y1="55" x2="260" y2="388" stroke="#ffffff" stroke-width="1" stroke-dasharray="2, 6" />
  </g>

  <!-- Central Vector cartridge art / Gamepad outline -->
  <g transform="translate(160, 185)" stroke="rgba(255,255,255,0.08)" stroke-width="2" fill="none">
    <rect x="-40" y="-30" width="80" height="60" rx="8" />
    <circle cx="-15" cy="0" r="12" />
    <circle cx="15" cy="0" r="12" />
    <path d="M-40 0 L-27 0 M27 0 L40 0 M0 -30 L0 -18 M0 18 L0 30" stroke-opacity="0.12" />
  </g>

  <!-- Game title layout -->
  <g transform="translate(160, 290)">
    <!-- Main Big Title -->
    <text x="0" y="0" fill="#ffffff" font-family="'Space Grotesk', system-ui, sans-serif" font-weight="900" font-size="18" text-anchor="middle" letter-spacing="-0.5" opacity="0.95">${gd.title.toUpperCase()}</text>
    
    <!-- Subtitle metadata -->
    <text x="0" y="24" fill="${labelColorLabel}" font-family="monospace" font-weight="bold" font-size="10" text-anchor="middle" letter-spacing="2">${gd.genre.toUpperCase()}</text>
  </g>

  <!-- Footer box metadata -->
  <g transform="translate(24, 365)">
    <!-- Developer brand text -->
    <text x="0" y="0" fill="#a1a1aa" font-family="monospace" font-weight="bold" font-size="9" opacity="0.8">${gd.dev.toUpperCase()}</text>
    <text x="0" y="12" fill="#71717a" font-family="monospace" font-size="8">${gd.pub.toUpperCase()} &bull; ${gd.year}</text>
    
    <!-- Player Capacity Seal right -->
    <rect x="180" y="-12" width="90" height="20" rx="4" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1" />
    <text x="225" y="1" fill="#a1a1aa" font-family="monospace" font-weight="bold" font-size="8" text-anchor="middle" letter-spacing="0.5">1-2 JOGADORES</text>
  </g>
</svg>`;

    fs.writeFileSync(path.join(coversDir, `${slug}.svg`), svg);
    coverCount++;
  });
});


// --- C. GENERATE PORTABLE Retro screenshots ---
console.log('[RetroHub Assets] Gerando capturas retro procedurais...');
const genres = [
  'Plataforma', 'Plataforma 3D', 'RPG', 'RPG Tático', 'Aventura', 'Aventura 3D',
  'Ação', 'Metroidvania', 'Corrida', 'FPS', 'Luta', 'Luta 3D', 'Beat \'em Up',
  'Run and Gun', 'Shoot \'em Up', 'Survival Horror', 'Puzzle', 'Esporte', 'default'
];

genres.forEach(genre => {
  // We'll generate 3 different screenshots per genre index
  for (let i = 1; i <= 3; i++) {
    const slug = `screenshot-${genre.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${i}`;
    let strokeCol = '#10b981'; // green
    if (i === 1) strokeCol = '#ef4444'; // red
    if (i === 2) strokeCol = '#3b82f6'; // blue

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="100%" height="100%">
  <!-- Screen boundary representing Arcade cabinet vector layout -->
  <rect width="640" height="480" fill="#020205" />
  
  <!-- Subtle CRT Scanlines -->
  <g opacity="0.06">
    <line x1="0" y1="10" x2="640" y2="10" stroke="#ffffff" stroke-width="2" />
    <line x1="0" y1="20" x2="640" y2="20" stroke="#ffffff" stroke-width="2" />
    <line x1="0" y1="30" x2="640" y2="30" stroke="#ffffff" stroke-width="2" />
    <line x1="0" y1="40" x2="640" y2="40" stroke="#ffffff" stroke-width="2" />
    <line x1="0" y1="50" x2="640" y2="50" stroke="#ffffff" stroke-width="2" />
    <line x1="0" y1="60" x2="640" y2="60" stroke="#ffffff" stroke-width="2" />
    <line x1="0" y1="70" x2="640" y2="70" stroke="#ffffff" stroke-width="2" />
    <line x1="0" y1="80" x2="640" y2="80" stroke="#ffffff" stroke-width="2" />
    <line x1="0" y1="90" x2="640" y2="90" stroke="#ffffff" stroke-width="2" />
    <line x1="0" y1="100" x2="640" y2="100" stroke="#ffffff" stroke-width="2" />
    <line x1="0" y1="110" x2="640" y2="110" stroke="#ffffff" stroke-width="2" />
    <line x1="0" y1="120" x2="640" y2="120" stroke="#ffffff" stroke-width="2" />
    <line x1="0" y1="130" x2="640" y2="130" stroke="#ffffff" stroke-width="2" />
    <line x1="0" y1="140" x2="640" y2="140" stroke="#ffffff" stroke-width="2" />
    <line x1="0" y1="150" x2="640" y2="150" stroke="#ffffff" stroke-width="2" />
    <line x1="0" y1="160" x2="640" y2="160" stroke="#ffffff" stroke-width="2" />
    <line x1="0" y1="170" x2="640" y2="170" stroke="#ffffff" stroke-width="2" />
    <line x1="0" y1="180" x2="640" y2="180" stroke="#ffffff" stroke-width="2" />
    <line x1="0" y1="190" x2="640" y2="190" stroke="#ffffff" stroke-width="2" />
    <line x1="0" y1="200" x2="640" y2="200" stroke="#ffffff" stroke-width="2" />
    <line x1="0" y1="210" x2="640" y2="210" stroke="#ffffff" stroke-width="2" />
    <line x1="0" y1="220" x2="640" y2="220" stroke="#ffffff" stroke-width="2" />
    <line x1="0" y1="230" x2="640" y2="230" stroke="#ffffff" stroke-width="2" />
    <line x1="0" y1="240" x2="640" y2="240" stroke="#ffffff" stroke-width="2" />
    <line x1="0" y1="250" x2="640" y2="250" stroke="#ffffff" stroke-width="2" />
    <line x1="0" y1="260" x2="640" y2="260" stroke="#ffffff" stroke-width="2" />
    <line x1="0" y1="270" x2="640" y2="270" stroke="#ffffff" stroke-width="2" />
    <line x1="0" y1="280" x2="640" y2="280" stroke="#ffffff" stroke-width="2" />
    <line x1="0" y1="290" x2="640" y2="290" stroke="#ffffff" stroke-width="2" />
    <line x1="0" y1="300" x2="640" y2="300" stroke="#ffffff" stroke-width="2" />
    <line x1="0" y1="310" x2="640" y2="310" stroke="#ffffff" stroke-width="2" />
    <line x1="0" y1="320" x2="640" y2="320" stroke="#ffffff" stroke-width="2" />
    <line x1="0" y1="330" x2="640" y2="330" stroke="#ffffff" stroke-width="2" />
    <line x1="0" y1="340" x2="640" y2="340" stroke="#ffffff" stroke-width="2" />
    <line x1="0" y1="350" x2="640" y2="350" stroke="#ffffff" stroke-width="2" />
    <line x1="0" y1="360" x2="640" y2="360" stroke="#ffffff" stroke-width="2" />
    <line x1="0" y1="370" x2="640" y2="370" stroke="#ffffff" stroke-width="2" />
    <line x1="0" y1="380" x2="640" y2="380" stroke="#ffffff" stroke-width="2" />
    <line x1="0" y1="390" x2="640" y2="390" stroke="#ffffff" stroke-width="2" />
    <line x1="0" y1="400" x2="640" y2="400" stroke="#ffffff" stroke-width="2" />
    <line x1="0" y1="410" x2="640" y2="410" stroke="#ffffff" stroke-width="2" />
    <line x1="0" y1="420" x2="640" y2="420" stroke="#ffffff" stroke-width="2" />
    <line x1="0" y1="430" x2="640" y2="430" stroke="#ffffff" stroke-width="2" />
    <line x1="0" y1="440" x2="640" y2="440" stroke="#ffffff" stroke-width="2" />
    <line x1="0" y1="450" x2="640" y2="450" stroke="#ffffff" stroke-width="2" />
    <line x1="0" y1="460" x2="640" y2="460" stroke="#ffffff" stroke-width="2" />
    <line x1="0" y1="470" x2="640" y2="470" stroke="#ffffff" stroke-width="2" />
  </g>

  <!-- Interactive Mock Elements representing Game UI based on genre -->
  <!-- Top HUD Bar -->
  <rect x="20" y="15" width="600" height="40" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1.5" />
  <text x="35" y="40" fill="#ffffff" font-family="monospace" font-size="14" font-weight="900" letter-spacing="1">SCORE: 046200</text>
  <text x="320" y="40" fill="${strokeCol}" font-family="monospace" font-size="14" font-weight="900" letter-spacing="2" text-anchor="middle">STATION ${genre.toUpperCase()}</text>
  <text x="605" y="40" fill="#ffffff" font-family="monospace" font-size="14" font-weight="900" letter-spacing="1" text-anchor="end">STAGE 0${i}-1</text>

  <!-- Level Grid decoration inside SVG mockup -->
  <g opacity="0.1">
    <ellipse cx="320" cy="240" rx="200" ry="120" fill="none" stroke="#ffffff" stroke-width="2" />
    <ellipse cx="320" cy="240" rx="140" ry="84" fill="none" stroke="#ffffff" stroke-width="1" />
    <line x1="120" y1="240" x2="520" y2="240" stroke="#ffffff" stroke-width="1" />
    <line x1="320" y1="120" x2="320" y2="360" stroke="#ffffff" stroke-width="1" />
  </g>

  <!-- Central Gameplay Scene Outline elements -->
  <circle cx="320" cy="220" r="45" fill="none" stroke="${strokeCol}" stroke-dasharray="8,4" stroke-width="2.5" />
  <line x1="160" y1="220" x2="480" y2="220" stroke="${strokeCol}" stroke-dasharray="4,8" stroke-opacity="0.3" stroke-width="1.5" />

  <!-- Bottom platform details -->
  <line x1="20" y1="400" x2="620" y2="400" stroke="#ffffff" stroke-opacity="0.15" stroke-width="2" />
  <rect x="40" y="400" width="120" height="60" fill="none" stroke="#ffffff" stroke-opacity="0.08" stroke-width="1" />
  <rect x="480" y="400" width="120" height="60" fill="none" stroke="#ffffff" stroke-opacity="0.08" stroke-width="1" />

  <text x="320" y="420" fill="#a1a1aa" font-family="monospace" font-size="10" text-anchor="middle" letter-spacing="0.5" opacity="0.3">EMULACAO INTEGRADA DE ALTA FIELIDADE DE CORES</text>
  <text x="320" y="435" fill="#a1a1aa" font-family="monospace" font-size="9" text-anchor="middle" opacity="0.2">AUDIO ONDA SENOIDAL SINTETIZADO INTERACTIVO EM TEMPO REAL</text>
</svg>`;

    fs.writeFileSync(path.join(coversDir, `${slug}.svg`), svg);
  }
});

// Update original database fields & write back
fs.writeFileSync(dbPath, JSON.stringify(database, null, 2), 'utf8');

console.log(`[RetroHub Assets] Sucesso! Geradas ${database.length} telas de carregamento de consoles, ${coverCount} capas de jogos e capturas retro procedurais.`);
