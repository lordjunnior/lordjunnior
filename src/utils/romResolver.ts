/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import completeRomMapping from '../data/complete_rom_mapping.json';

// Mapping of classic system IDs to their corresponding folder names on Archive.org ni-romsets collection
const CONSOLE_FOLDERS: Record<string, string> = {
  nes: 'Nintendo - Nintendo Entertainment System',
  snes: 'Nintendo - Super Nintendo Entertainment System',
  gba: 'Nintendo - Game Boy Advance',
  gbc: 'Nintendo - Game Boy Color',
  gb: 'Nintendo - Game Boy',
  genesis: 'Sega - Mega Drive - Genesis',
  megadrive: 'Sega - Mega Drive - Genesis',
  sms: 'Sega - Master System - Mark III',
  gamegear: 'Sega - Game Gear',
  n64: 'Nintendo - Nintendo 64',
  atari2600: 'Atari - 2600',
  atari: 'Atari - 2600',
  psx: 'Sony - PlayStation',
  playstation: 'Sony - PlayStation',
  nds: 'Nintendo - Nintendo DS',
  ds: 'Nintendo - Nintendo DS',
  pcengine: 'NEC - PC Engine - TurboGrafx-16',
};

// Helper to normalize strings for comparison
const normalizeString = (str: string): string => {
  // Strip common retro emulator file extensions before normalizing
  const cleanStr = str.replace(/\.(zip|nes|sfc|smc|bin|gba|gbc|gb|n64|z64|v64|sms)$/i, '');
  return cleanStr
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9]/g, '') // remove non-alphanumeric characters
    .trim();
};

/**
 * Tries to find a matching ROM file in the user's Google Drive list.
 * Supports fuzzy matching on title or exact ROM file names.
 */
export const getGoogleDriveRomUrl = (systemId: string, titleOrFilename: string): string | null => {
  const normSystem = systemId.toLowerCase();
  
  // Map system aliases to completeRomMapping keys if necessary
  let mappingKey = normSystem;
  if (normSystem === 'atari2600') mappingKey = 'atari';
  if (normSystem === 'megadrive') mappingKey = 'genesis';
  if (normSystem === 'gamegear' || normSystem === 'gg') mappingKey = 'sms';
  
  const systemFiles = (completeRomMapping as Record<string, Array<{ id: string; name: string }>>)[mappingKey];
  if (!systemFiles || systemFiles.length === 0) {
    return null;
  }
  
  // 1. Try to find if there is an exact filename mapping first from EXACT_ROM_MAPPINGS
  let targetFilename = titleOrFilename;
  if (EXACT_ROM_MAPPINGS[normSystem] && EXACT_ROM_MAPPINGS[normSystem][titleOrFilename]) {
    targetFilename = EXACT_ROM_MAPPINGS[normSystem][titleOrFilename];
  }
  
  const normTarget = normalizeString(targetFilename);
  const normTitle = normalizeString(titleOrFilename);
  
  // 2. Perform intelligent matching
  // First pass: Exact or near-exact match on normalized filename
  let match = systemFiles.find(f => {
    const fn = normalizeString(f.name);
    return fn === normTarget || fn === normTitle;
  });
  
  // Second pass: Check if the Google Drive file name contains the game title or vice-versa
  if (!match) {
    match = systemFiles.find(f => {
      const fn = normalizeString(f.name);
      return fn.includes(normTitle) || normTitle.includes(fn) || fn.includes(normTarget) || normTarget.includes(fn);
    });
  }
  
  // Third pass: Try split search (if all words of the title are found in the drive file name)
  if (!match) {
    const titleWords = titleOrFilename.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2);
    if (titleWords.length > 0) {
      match = systemFiles.find(f => {
        const fn = f.name.toLowerCase();
        return titleWords.every(word => fn.includes(word));
      });
    }
  }
  
  if (match) {
    console.log(`Matched "${titleOrFilename}" with Google Drive ROM: "${match.name}" (ID: ${match.id})`);
    return `https://docs.google.com/uc?export=download&id=${match.id}`;
  }
  
  return null;
};


// Hand-curated exact filename mapping for popular games to prevent any "404 Not Found"
// Files are zipped inside the Archive.org ni-romsets collection.
export const EXACT_ROM_MAPPINGS: Record<string, Record<string, string>> = {
  nes: {
    'Super Mario Bros.': 'Super Mario Bros. (World).zip',
    'Super Mario Bros. 3': 'Super Mario Bros. 3 (USA).zip',
    'Super Mario Bros. 2': 'Super Mario Bros. 2 (USA).zip',
    'The Legend of Zelda': 'The Legend of Zelda (USA).zip',
    'Zelda II: The Adventure of Link': 'Zelda II - The Adventure of Link (USA).zip',
    'Metroid': 'Metroid (USA).zip',
    'Castlevania': 'Castlevania (USA).zip',
    'Castlevania II: Simon\'s Quest': 'Castlevania II - Simon\'s Quest (USA).zip',
    'Castlevania III: Dracula\'s Curse': 'Castlevania III - Dracula\'s Curse (USA).zip',
    'Mega Man 2': 'Mega Man 2 (USA).zip',
    'Mega Man 3': 'Mega Man 3 (USA).zip',
    'Contra': 'Contra (USA).zip',
    'Super C': 'Super C (USA).zip',
    'Duck Hunt': 'Duck Hunt (World).zip',
    'Punch-Out!!': 'Punch-Out!! Featuring Mr. Dream (USA).zip',
    'Kirby\'s Adventure': 'Kirby\'s Adventure (USA).zip',
    'Double Dragon II': 'Double Dragon II - The Revenge (USA).zip',
    'Double Dragon': 'Double Dragon (USA).zip',
    'Ninja Gaiden': 'Ninja Gaiden (USA).zip',
    'Ninja Gaiden II': 'Ninja Gaiden II - The Dark Sword of Chaos (USA).zip',
    'Pac-Man': 'Pac-Man (USA).zip',
    'Tetris': 'Tetris (USA).zip',
    'Excitebike': 'Excitebike (USA, Europe).zip',
    'Bubble Bobble': 'Bubble Bobble (USA).zip',
    'Gradius': 'Gradius (USA).zip',
    'Bomberman': 'Bomberman (USA).zip',
    'Adventure Island': 'Hudson\'s Adventure Island (USA).zip',
    'Ghosts \'n Goblins': 'Ghosts \'n Goblins (USA).zip',
    'Paperboy': 'Paperboy (USA).zip',
  },
  snes: {
    'Super Mario World': 'Super Mario World (USA).zip',
    'Donkey Kong Country': 'Donkey Kong Country (USA).zip',
    'Donkey Kong Country 2': 'Donkey Kong Country 2 - Diddy\'s Kong Quest (USA).zip',
    'Donkey Kong Country 3': 'Donkey Kong Country 3 - Dixie Kong\'s Double Trouble! (USA).zip',
    'The Legend of Zelda: A Link to the Past': 'The Legend of Zelda - A Link to the Past (USA).zip',
    'Super Metroid': 'Super Metroid (Japan, USA).zip',
    'Chrono Trigger': 'Chrono Trigger (USA).zip',
    'Mega Man X': 'Mega Man X (USA).zip',
    'Mega Man X2': 'Mega Man X2 (USA).zip',
    'Mega Man X3': 'Mega Man X3 (USA).zip',
    'Super Mario Kart': 'Super Mario Kart (USA).zip',
    'Street Fighter II Turbo': 'Street Fighter II Turbo - Hyper Fighting (USA).zip',
    'Street Fighter II: The World Warrior': 'Street Fighter II - The World Warrior (USA).zip',
    'Super Street Fighter II': 'Super Street Fighter II - The New Challengers (USA).zip',
    'Mortal Kombat II': 'Mortal Kombat II (USA).zip',
    'Ultimate Mortal Kombat 3': 'Ultimate Mortal Kombat 3 (USA).zip',
    'F-Zero': 'F-Zero (USA, Europe).zip',
    'Super Mario World 2: Yoshi\'s Island': 'Super Mario World 2 - Yoshi\'s Island (USA).zip',
    'Super Mario RPG': 'Super Mario RPG - Legend of the Seven Stars (USA).zip',
    'Secret of Mana': 'Secret of Mana (USA).zip',
    'Star Fox': 'Star Fox (USA).zip',
    'Aladdin': 'Disney\'s Aladdin (USA).zip',
    'The Lion King': 'The Lion King (USA).zip',
    'Castlevania IV': 'Super Castlevania IV (USA).zip',
    'Earthbound': 'EarthBound (USA).zip',
    'Super Punch-Out!!': 'Super Punch-Out!! (USA).zip',
    'Killer Instinct': 'Killer Instinct (USA).zip',
  },
  gba: {
    'Pokémon Emerald': 'Pokemon - Emerald Version (USA, Europe).zip',
    'Pokémon FireRed': 'Pokemon - FireRed Version (USA).zip',
    'Pokémon LeafGreen': 'Pokemon - LeafGreen Version (USA).zip',
    'Pokémon Ruby': 'Pokemon - Ruby Version (USA, Europe).zip',
    'Pokémon Sapphire': 'Pokemon - Sapphire Version (USA, Europe).zip',
    'The Legend of Zelda: The Minish Cap': 'Legend of Zelda, The - The Minish Cap (USA).zip',
    'The Legend of Zelda: A Link to the Past': 'Legend of Zelda, The - A Link to the Past & Four Swords (USA).zip',
    'Mario Kart: Super Circuit': 'Mario Kart - Super Circuit (USA).zip',
    'Metroid Fusion': 'Metroid Fusion (USA, Australia).zip',
    'Metroid: Zero Mission': 'Metroid - Zero Mission (USA).zip',
    'Castlevania: Aria of Sorrow': 'Castlevania - Aria of Sorrow (USA).zip',
    'Castlevania: Circle of the Moon': 'Castlevania - Circle of the Moon (USA).zip',
    'Super Mario Advance 4': 'Super Mario Advance 4 - Super Mario Bros. 3 (USA).zip',
    'Super Mario Advance 2': 'Super Mario World - Super Mario Advance 2 (USA).zip',
    'Super Mario Advance': 'Super Mario Advance (USA, Europe).zip',
    'Yoshi\'s Island: Super Mario Advance 3': 'Yoshi\'s Island - Super Mario Advance 3 (USA).zip',
    'Golden Sun': 'Golden Sun (USA).zip',
    'Golden Sun: The Lost Age': 'Golden Sun - The Lost Age (USA).zip',
    'Fire Emblem': 'Fire Emblem (USA).zip',
    'Mario & Luigi: Superstar Saga': 'Mario & Luigi - Superstar Saga (USA, Australia).zip',
    'Grand Theft Auto': 'Grand Theft Auto Advance (USA).zip',
    'Kirby & The Amazing Mirror': 'Kirby & The Amazing Mirror (USA).zip',
    'Kingdom Hearts: Chain of Memories': 'Kingdom Hearts - Chain of Memories (USA).zip',
    'Sonic Advance': 'Sonic Advance (USA).zip',
    'Megaman Battle Network': 'Mega Man Battle Network (USA).zip',
  },
  gb: {
    'Tetris': 'Tetris (World).zip',
    'Pokémon Red': 'Pokemon - Red Version (USA, Europe).zip',
    'Pokémon Blue': 'Pokemon - Blue Version (USA, Europe).zip',
    'Pokémon Yellow': 'Pokemon - Yellow Version - Special Pikachu Edition (USA, Europe).zip',
    'Super Mario Land': 'Super Mario Land (World).zip',
    'Super Mario Land 2': 'Super Mario Land 2 - 6 Golden Coins (USA, Europe).zip',
    'The Legend of Zelda: Link\'s Awakening': 'Legend of Zelda, The - Link\'s Awakening (USA, Europe).zip',
    'Kirby\'s Dream Land': 'Kirby\'s Dream Land (World).zip',
    'Kirby\'s Dream Land 2': 'Kirby\'s Dream Land 2 (USA, Europe).zip',
    'Metroid II: Return of Samus': 'Metroid II - Return of Samus (USA, Europe).zip',
    'Donkey Kong Land': 'Donkey Kong Land (USA, Europe).zip',
    'Dr. Mario': 'Dr. Mario (World).zip',
    'Mega Man: Dr. Wily\'s Revenge': 'Mega Man - Dr. Wily\'s Revenge (USA).zip',
  },
  gbc: {
    'Pokémon Gold': 'Pokemon - Gold Version (USA, Europe).zip',
    'Pokémon Silver': 'Pokemon - Silver Version (USA, Europe).zip',
    'Pokémon Crystal': 'Pokemon - Crystal Version (USA, Europe).zip',
    'The Legend of Zelda: Oracle of Ages': 'Legend of Zelda, The - Oracle of Ages (USA, Europe).zip',
    'The Legend of Zelda: Oracle of Seasons': 'Legend of Zelda, The - Oracle of Seasons (USA, Europe).zip',
    'The Legend of Zelda: Link\'s Awakening DX': 'Legend of Zelda, The - Link\'s Awakening DX (USA, Europe).zip',
    'Super Mario Bros. Deluxe': 'Super Mario Bros. Deluxe (USA, Europe).zip',
    'Wario Land 3': 'Wario Land 3 (USA, Europe).zip',
    'Metal Gear Solid': 'Metal Gear Solid (USA).zip',
    'Dragon Warrior Monsters': 'Dragon Warrior Monsters (USA).zip',
  },
  genesis: {
    'Sonic the Hedgehog': 'Sonic the Hedgehog (USA, Europe).zip',
    'Sonic the Hedgehog 2': 'Sonic the Hedgehog 2 (World).zip',
    'Sonic the Hedgehog 3': 'Sonic the Hedgehog 3 (Europe).zip',
    'Streets of Rage 2': 'Streets of Rage 2 (USA).zip',
    'Streets of Rage 3': 'Streets of Rage 3 (USA).zip',
    'Aladdin': 'Aladdin (USA).zip',
    'Mortal Kombat 3': 'Mortal Kombat 3 (USA).zip',
    'Sonic & Knuckles': 'Sonic & Knuckles (World).zip',
    'Golden Axe': 'Golden Axe (World).zip',
    'Golden Axe II': 'Golden Axe II (World).zip',
    'Earthworm Jim': 'Earthworm Jim (USA).zip',
    'Comix Zone': 'Comix Zone (USA).zip',
    'Beyond Oasis': 'Beyond Oasis (USA).zip',
    'Phantasy Star IV': 'Phantasy Star IV (USA).zip',
    'Gunstar Heroes': 'Gunstar Heroes (USA).zip',
    'Shinobi III: Return of the Ninja Master': 'Shinobi III - Return of the Ninja Master (USA).zip',
    'Castlevania: Bloodlines': 'Castlevania - Bloodlines (USA).zip',
    'Contra: Hard Corps': 'Contra - Hard Corps (USA).zip',
  },
  megadrive: {
    // Mirror of genesis for fallback compatibility
    'Sonic the Hedgehog': 'Sonic the Hedgehog (USA, Europe).zip',
    'Sonic the Hedgehog 2': 'Sonic the Hedgehog 2 (World).zip',
    'Sonic the Hedgehog 3': 'Sonic the Hedgehog 3 (Europe).zip',
    'Streets of Rage 2': 'Streets of Rage 2 (USA).zip',
    'Streets of Rage 3': 'Streets of Rage 3 (USA).zip',
    'Aladdin': 'Aladdin (USA).zip',
    'Mortal Kombat 3': 'Mortal Kombat 3 (USA).zip',
    'Sonic & Knuckles': 'Sonic & Knuckles (World).zip',
    'Golden Axe': 'Golden Axe (World).zip',
    'Golden Axe II': 'Golden Axe II (World).zip',
    'Earthworm Jim': 'Earthworm Jim (USA).zip',
    'Comix Zone': 'Comix Zone (USA).zip',
    'Beyond Oasis': 'Beyond Oasis (USA).zip',
    'Phantasy Star IV': 'Phantasy Star IV (USA).zip',
    'Gunstar Heroes': 'Gunstar Heroes (USA).zip',
    'Shinobi III: Return of the Ninja Master': 'Shinobi III - Return of the Ninja Master (USA).zip',
    'Castlevania: Bloodlines': 'Castlevania - Bloodlines (USA).zip',
    'Contra: Hard Corps': 'Contra - Hard Corps (USA).zip',
  },
  sms: {
    'Alex Kidd in Miracle World': 'Alex Kidd in Miracle World (USA, Europe).zip',
    'Sonic the Hedgehog': 'Sonic the Hedgehog (USA, Europe).zip',
    'Sonic the Hedgehog 2': 'Sonic the Hedgehog 2 (Europe).zip',
    'Castle of Illusion': 'Castle of Illusion Starring Mickey Mouse (USA, Europe).zip',
    'Castle of Illusion Starring Mickey Mouse': 'Castle of Illusion Starring Mickey Mouse (USA, Europe).zip',
    'Shinobi': 'Shinobi (USA, Europe).zip',
    'Phantasy Star': 'Phantasy Star (USA, Europe) (v1.3).zip',
    'Wonder Boy III': 'Wonder Boy III - The Dragon\'s Trap (USA, Europe).zip',
  },
  gamegear: {
    'Sonic the Hedgehog': 'Sonic the Hedgehog (World).zip',
    'Sonic the Hedgehog 2': 'Sonic the Hedgehog 2 (World).zip',
    'Defenders of Oasis': 'Defenders of Oasis (USA).zip',
    'Shinobi': 'Shinobi (USA, Europe).zip',
  },
  atari2600: {
    'Pitfall!': 'Pitfall! - Pitfall Harry\'s Jungle Adventure (USA).zip',
    'River Raid': 'River Raid (USA).zip',
    'Pac-Man': 'Pac-Man (USA).zip',
    'Space Invaders': 'Space Invaders (USA).zip',
    'Enduro': 'Enduro (USA).zip',
    'Keystone Kapers': 'Keystone Kapers (USA).zip',
    'Frogger': 'Frogger (USA).zip',
    'Adventure': 'Adventure (USA).zip',
    'Yars\' Revenge': 'Yars\' Revenge (USA).zip',
    'Boxing': 'Boxing (USA).zip',
    'H.E.R.O.': 'H.E.R.O. (USA).zip',
  },
  atari: {
    'Pitfall!': 'Pitfall! - Pitfall Harry\'s Jungle Adventure (USA).zip',
    'River Raid': 'River Raid (USA).zip',
    'Pac-Man': 'Pac-Man (USA).zip',
    'Space Invaders': 'Space Invaders (USA).zip',
    'Enduro': 'Enduro (USA).zip',
    'Keystone Kapers': 'Keystone Kapers (USA).zip',
    'Frogger': 'Frogger (USA).zip',
    'Adventure': 'Adventure (USA).zip',
    'Yars\' Revenge': 'Yars\' Revenge (USA).zip',
    'Boxing': 'Boxing (USA).zip',
    'H.E.R.O.': 'H.E.R.O. (USA).zip',
  },
  n64: {
    'Super Mario 64': 'Super Mario 64 (USA).zip',
    'The Legend of Zelda: Ocarina of Time': 'Legend of Zelda, The - Ocarina of Time (USA).zip',
    'The Legend of Zelda - Ocarina of Time': 'Legend of Zelda, The - Ocarina of Time (USA).zip',
    'Mario Kart 64': 'Mario Kart 64 (USA).zip',
    'Super Smash Bros.': 'Super Smash Bros. (USA).zip',
    'GoldenEye 007': 'GoldenEye 007 (USA).zip',
    '007 GoldenEye': 'GoldenEye 007 (USA).zip',
    'Banjo-Kazooie': 'Banjo-Kazooie (USA).zip',
    'Star Fox 64': 'Star Fox 64 (USA).zip',
    'The Legend of Zelda: Majora\'s Mask': 'Legend of Zelda, The - Majora\'s Mask (USA) (Co-Master).zip',
    'The Legend of Zelda - Majora\'s Mask': 'Legend of Zelda, The - Majora\'s Mask (USA) (Co-Master).zip',
    'Paper Mario': 'Paper Mario (USA).zip',
    'F-Zero X': 'F-Zero X (USA).zip',
    'FIFA 99': 'FIFA 99 (Europe) (En,Fr,De,Es,It,Nl,Pt,Sv).zip',
  }
};

/**
 * Resolves a game title or relative rom path to an active, Direct Download ROM zip URL on Archive.org.
 * Utilizes standard, clean, reliable No-Intro archives of retro consoles.
 */
export const resolveGameRomUrl = (systemId: string, titleOrFilename: string): string => {
  const normSystem = systemId.toLowerCase();

  // Try resolving with user's Google Drive mapping first!
  const driveUrl = getGoogleDriveRomUrl(systemId, titleOrFilename);
  if (driveUrl) {
    return driveUrl;
  }

  // Extract base filename if a path is provided
  let baseName = titleOrFilename.replace(/^\/+/, '').split('/').pop() || titleOrFilename;

  // Use EXACT_ROM_MAPPINGS to get the actual zip file name for Archive.org
  if (EXACT_ROM_MAPPINGS[normSystem] && EXACT_ROM_MAPPINGS[normSystem][baseName]) {
    baseName = EXACT_ROM_MAPPINGS[normSystem][baseName];
  }

  // NES (Nintendo Entertainment System) - Split by Letter Groups
  if (normSystem === 'nes') {
    // Standardize No-Intro title naming if starting with "The "
    if (baseName.toLowerCase().startsWith('the ')) {
      const rest = baseName.substring(4);
      const extIndex = rest.lastIndexOf('.');
      if (extIndex !== -1) {
        const namePart = rest.substring(0, extIndex);
        const extPart = rest.substring(extIndex);
        baseName = `${namePart}, The${extPart}`;
      } else {
        baseName = `${rest}, The`;
      }
    }

    const firstChar = baseName.trim().charAt(0).toUpperCase();
    let item = 'no-intro-nes-roms-from-myrient-s-z'; // default fallback
    if (firstChar >= 'A' && firstChar <= 'E') {
      item = 'no-intro-nes-roms-from-myrient-a-e';
    } else if (firstChar >= 'F' && firstChar <= 'L') {
      item = 'no-intro-nes-roms-from-myrient-f-l';
    } else if (firstChar >= 'M' && firstChar <= 'R') {
      item = 'no-intro-nes-roms-from-myrient-m-r';
    } else if (firstChar >= 'S' && firstChar <= 'Z') {
      item = 'no-intro-nes-roms-from-myrient-s-z';
    } else if (firstChar >= '0' && firstChar <= '9' || firstChar === '\'' || firstChar === '"') {
      item = '100-in-1-real-game-china-en-ja-pirate';
    }
    return `https://archive.org/download/${item}/${encodeURIComponent(baseName)}`;
  }

  // SNES (Super Nintendo)
  if (normSystem === 'snes') {
    return `https://archive.org/download/snes-collection-no-intro/SNES/${encodeURIComponent(baseName)}`;
  }

  // GBA (Game Boy Advance)
  if (normSystem === 'gba') {
    return `https://archive.org/download/ef_gba_no-intro_2024-02-21/${encodeURIComponent(baseName)}`;
  }

  // GBC (Game Boy Color)
  if (normSystem === 'gbc') {
    return `https://archive.org/download/ef_GBC_No-Intro/${encodeURIComponent(baseName)}`;
  }

  // GB (Game Boy)
  if (normSystem === 'gb') {
    return `https://archive.org/download/ef_Nintendo_Gameboy_No-Intro_2024-04-23/${encodeURIComponent(baseName)}`;
  }

  // Sega Genesis / Mega Drive
  if (normSystem === 'genesis' || normSystem === 'megadrive') {
    return `https://archive.org/download/ef_mega_genesis_no-intro_2024-04-21/${encodeURIComponent(baseName)}`;
  }

  // Sega Master System (SMS)
  if (normSystem === 'sms') {
    return `https://archive.org/download/ef_sms_No-Intro_2024-03-08/${encodeURIComponent(baseName)}`;
  }

  // Sega Game Gear
  if (normSystem === 'gamegear' || normSystem === 'gg') {
    return `https://archive.org/download/ef_sega_game_gear_no-intro_2024-02-21/${encodeURIComponent(baseName)}`;
  }

  // Nintendo 64 (N64)
  if (normSystem === 'n64') {
    return `https://archive.org/download/ef_nintendo_64_no-intro_2024-02-10/${encodeURIComponent(baseName)}`;
  }

  // Atari 2600
  if (normSystem === 'atari' || normSystem === 'atari2600') {
    return `https://archive.org/download/atari-2600-no-intro-romset-2026-05-29/Atari%202600/${encodeURIComponent(baseName)}`;
  }

  // Fallback preset helper
  return `https://raw.githubusercontent.com/christopherhealy/nes-test-roms/master/gimmick/gimmick.nes`;
};
