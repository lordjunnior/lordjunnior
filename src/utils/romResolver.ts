/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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
    'Mario Kart 64': 'Mario Kart 64 (USA).zip',
    'Super Smash Bros.': 'Super Smash Bros. (USA).zip',
    'GoldenEye 007': 'GoldenEye 007 (USA).zip',
    'Banjo-Kazooie': 'Banjo-Kazooie (USA).zip',
    'Star Fox 64': 'Star Fox 64 (USA).zip',
    'The Legend of Zelda: Majora\'s Mask': 'Legend of Zelda, The - Majora\'s Mask (USA) (Co-Master).zip',
    'Paper Mario': 'Paper Mario (USA).zip',
    'F-Zero X': 'F-Zero X (USA).zip',
  }
};

/**
 * Resolves a game title to an active, Direct Download ROM zip URL on Archive.org.
 * Utilizes standard, clean, reliable No-Intro archives of retro consoles.
 */
export const resolveGameRomUrl = (systemId: string, title: string): string => {
  const normSystem = systemId.toLowerCase();
  const folderName = CONSOLE_FOLDERS[normSystem];

  // If we don't support the console or have no folder name, return a default preset helper
  if (!folderName) {
    return `https://raw.githubusercontent.com/christopherhealy/nes-test-roms/master/gimmick/gimmick.nes`;
  }

  // 1. Direct custom curated exact mappings
  const systemMappings = EXACT_ROM_MAPPINGS[normSystem];
  if (systemMappings) {
    const matchedFile = systemMappings[title];
    if (matchedFile) {
      return `https://archive.org/download/ni-romsets/${encodeURIComponent(folderName)}/${encodeURIComponent(matchedFile)}`;
    }
  }

  // 2. Intelligent general normalizer for files not mapped in the exact dict
  // This automatically handles standard cases (e.g., adding " (USA).zip")
  let cleanTitle = title.trim();
  
  // Remove trailing dots or signs
  if (cleanTitle.endsWith('.')) {
    cleanTitle = cleanTitle.slice(0, -1);
  }

  // Standard format on Archive.org ni-romsets is: "<Game Name> (USA).zip" or "<Game Name> (World).zip"
  // Let's fallback to typical filenames
  const fallbackFile = `${cleanTitle} (USA).zip`;
  return `https://archive.org/download/ni-romsets/${encodeURIComponent(folderName)}/${encodeURIComponent(fallbackFile)}`;
};
