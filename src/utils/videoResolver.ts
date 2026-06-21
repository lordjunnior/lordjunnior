/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Mapping of console IDs to Archive.org video snaps identifiers
const CONSOLE_VIDEO_COLLECTIONS: Record<string, string> = {
  nes: 'nes-video-snaps-sq',
  snes: 'snes-video-snaps-sq',
  gba: 'gba-video-snaps-sq',
  gbc: 'gbc-video-snaps-sq',
  gb: 'gb-video-snaps-sq',
  genesis: 'genesis-video-snaps-sq',
  megadrive: 'genesis-video-snaps-sq',
  sms: 'sms-video-snaps-sq',
  n64: 'n64-video-snaps-sq',
  atari2600: 'atari-2600-video-snaps-sq',
  atari: 'atari-2600-video-snaps-sq',
  arcade: 'mame-video-snaps-sq'
};

// Standard fallback/representative game for each console when loading console-level videos
const CONSOLE_REPRESENTATIVE_GAMES: Record<string, string> = {
  nes: 'Super Mario Bros. (USA).mp4',
  snes: 'Super Mario World (USA).mp4',
  gba: 'Pokemon - Emerald Version (USA, Europe).mp4',
  gbc: 'Pokemon - Gold Version (USA, Europe).mp4',
  gb: 'Tetris (USA).mp4',
  genesis: 'Sonic the Hedgehog (USA, Europe).mp4',
  megadrive: 'Sonic the Hedgehog (USA, Europe).mp4',
  sms: 'Sonic the Hedgehog (USA, Europe).mp4',
  n64: 'Super Mario 64 (USA).mp4',
  atari2600: 'Pitfall! (USA).mp4',
  atari: 'Pitfall! (USA).mp4',
  arcade: 'pacman.mp4'
};

// Hand-curated mappings for exact game names to .mp4 video files on Archive.org
const GAME_VIDEO_MAPPINGS: Record<string, Record<string, string>> = {
  nes: {
    'Super Mario Bros.': 'Super Mario Bros. (USA).mp4',
    'Super Mario Bros. 3': 'Super Mario Bros. 3 (USA).mp4',
    'Super Mario Bros. 2': 'Super Mario Bros. 2 (USA).mp4',
    'The Legend of Zelda': 'Legend of Zelda, The (USA).mp4',
    'Zelda II: The Adventure of Link': 'Zelda II - The Adventure of Link (USA).mp4',
    'Metroid': 'Metroid (USA).mp4',
    'Castlevania': 'Castlevania (USA).mp4',
    'Mega Man 2': 'Mega Man 2 (USA).mp4',
    'Contra': 'Contra (USA).mp4',
    'Pac-Man': 'Pac-Man (USA).mp4',
    'Excitebike': 'Excitebike (USA, Europe).mp4',
    'Bomberman': 'Bomberman (USA).mp4',
  },
  snes: {
    'Super Mario World': 'Super Mario World (USA).mp4',
    'Donkey Kong Country': 'Donkey Kong Country (USA).mp4',
    'Donkey Kong Country 2': 'Donkey Kong Country 2 - Diddy\'s Kong Quest (USA).mp4',
    'The Legend of Zelda: A Link to the Past': 'Legend of Zelda, The - A Link to the Past (USA).mp4',
    'Super Metroid': 'Super Metroid (Japan, USA).mp4',
    'Chrono Trigger': 'Chrono Trigger (USA).mp4',
    'Mega Man X': 'Mega Man X (USA).mp4',
    'Super Mario Kart': 'Super Mario Kart (USA).mp4',
    'Street Fighter II Turbo': 'Street Fighter II Turbo - Hyper Fighting (USA).mp4',
    'Mortal Kombat II': 'Mortal Kombat II (USA).mp4',
    'Ultimate Mortal Kombat 3': 'Ultimate Mortal Kombat 3 (USA).mp4',
    'F-Zero': 'F-Zero (USA, Europe).mp4',
    'Earthbound': 'EarthBound (USA).mp4',
  },
  gba: {
    'Pokémon Emerald': 'Pokemon - Emerald Version (USA, Europe).mp4',
    'Pokémon FireRed': 'Pokemon - FireRed Version (USA).mp4',
    'Pokémon LeafGreen': 'Pokemon - LeafGreen Version (USA).mp4',
    'Pokémon Ruby': 'Pokemon - Ruby Version (USA, Europe).mp4',
    'Pokémon Sapphire': 'Pokemon - Sapphire Version (USA, Europe).mp4',
    'The Legend of Zelda: The Minish Cap': 'Legend of Zelda, The - The Minish Cap (USA).mp4',
    'Mario Kart: Super Circuit': 'Mario Kart - Super Circuit (USA).mp4',
    'Metroid Fusion': 'Metroid Fusion (USA, Australia).mp4',
    'Metroid: Zero Mission': 'Metroid - Zero Mission (USA).mp4',
  },
  genesis: {
    'Sonic the Hedgehog': 'Sonic the Hedgehog (USA, Europe).mp4',
    'Sonic the Hedgehog 2': 'Sonic the Hedgehog 2 (World).mp4',
    'Sonic the Hedgehog 3': 'Sonic the Hedgehog 3 (Europe).mp4',
    'Streets of Rage 2': 'Streets of Rage 2 (USA).mp4',
    'Aladdin': 'Aladdin (USA).mp4',
    'Mortal Kombat 3': 'Mortal Kombat 3 (USA).mp4',
    'Earthworm Jim': 'Earthworm Jim (USA).mp4',
  },
  megadrive: {
    'Sonic the Hedgehog': 'Sonic the Hedgehog (USA, Europe).mp4',
    'Sonic the Hedgehog 2': 'Sonic the Hedgehog 2 (World).mp4',
    'Sonic the Hedgehog 3': 'Sonic the Hedgehog 3 (Europe).mp4',
    'Streets of Rage 2': 'Streets of Rage 2 (USA).mp4',
    'Aladdin': 'Aladdin (USA).mp4',
    'Mortal Kombat 3': 'Mortal Kombat 3 (USA).mp4',
    'Earthworm Jim': 'Earthworm Jim (USA).mp4',
  },
  sms: {
    'Alex Kidd in Miracle World': 'Alex Kidd in Miracle World (USA, Europe).mp4',
    'Sonic the Hedgehog': 'Sonic the Hedgehog (USA, Europe).mp4',
    'Sonic the Hedgehog 2': 'Sonic the Hedgehog 2 (Europe).mp4',
  },
  n64: {
    'Super Mario 64': 'Super Mario 64 (USA).mp4',
    'The Legend of Zelda: Ocarina of Time': 'Legend of Zelda, The - Ocarina of Time (USA).mp4',
    'Mario Kart 64': 'Mario Kart 64 (USA).mp4',
    'Super Smash Bros.': 'Super Smash Bros. (USA).mp4',
    'GoldenEye 007': 'GoldenEye 007 (USA).mp4',
    'Banjo-Kazooie': 'Banjo-Kazooie (USA).mp4',
    'Star Fox 64': 'Star Fox 64 (USA).mp4',
  }
};

// High-quality YouTube or static gameplay fallbacks in case Archive download fails or for non-mapped games
const DEFAULT_RETRO_LOOP_URL = 'https://assets.mixkit.co/videos/preview/mixkit-retro-arcade-machine-in-a-dark-room-42359-large.mp4';

/**
 * Returns a high-quality gameplay video loop URL for a selected console system.
 */
export const getSystemGameplayVideoUrl = (systemId: string): string => {
  const normSys = systemId.toLowerCase();
  const collectionName = CONSOLE_VIDEO_COLLECTIONS[normSys];
  const repFileName = CONSOLE_REPRESENTATIVE_GAMES[normSys];

  if (!collectionName || !repFileName) {
    return DEFAULT_RETRO_LOOP_URL;
  }

  return `https://archive.org/download/${collectionName}/${encodeURIComponent(repFileName)}`;
};

/**
 * Returns a high-quality gameplay video loop URL for a specific game title and system.
 */
export const getGameGameplayVideoUrl = (systemId: string, title: string): string => {
  const normSys = systemId.toLowerCase();
  const collectionName = CONSOLE_VIDEO_COLLECTIONS[normSys];
  
  if (!collectionName) {
    return DEFAULT_RETRO_LOOP_URL;
  }

  // Check exact mapping
  const systemMappings = GAME_VIDEO_MAPPINGS[normSys];
  if (systemMappings) {
    const matchedFile = systemMappings[title];
    if (matchedFile) {
      return `https://archive.org/download/${collectionName}/${encodeURIComponent(matchedFile)}`;
    }
  }

  // Intelligent normalizer as fallback
  const normalizedFile = `${title.trim()} (USA).mp4`;
  return `https://archive.org/download/${collectionName}/${encodeURIComponent(normalizedFile)}`;
};
