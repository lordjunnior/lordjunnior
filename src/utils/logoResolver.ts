/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Mapping of classic game titles to high-quality transparent logo PNG/SVG URLs
const GAME_LOGO_MAPPINGS: Record<string, string> = {
  // NES
  'Super Mario Bros.': 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Super_Mario_Bros._Logo.svg',
  'Super Mario Bros. 3': 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Super_Mario_Bros_3_logo.svg',
  'Super Mario Bros. 2': 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Super-mario-bros-2-logo.png',
  'The Legend of Zelda': 'https://upload.wikimedia.org/wikipedia/commons/c/c2/The_Legend_of_Zelda_logo.svg',
  'Zelda II: The Adventure of Link': 'https://upload.wikimedia.org/wikipedia/commons/d/da/Zelda_II_Logo_transparent.png',
  'Metroid': 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Metroid_logo_PNG.png',
  'Castlevania': 'https://upload.wikimedia.org/wikipedia/commons/c/ce/Castlevania_Logo.svg',
  'Mega Man 2': 'https://upload.wikimedia.org/wikipedia/commons/b/b2/Megaman_logo.svg',
  'Contra': 'https://upload.wikimedia.org/wikipedia/commons/8/87/Contra_Logo.png',
  'Duck Hunt': 'https://upload.wikimedia.org/wikipedia/commons/8/86/Duck_Hunt_Logo.png',
  'Punch-Out!!': 'https://upload.wikimedia.org/wikipedia/commons/b/be/Punch-Out%21%21_Logo.png',
  "Kirby's Adventure": 'https://upload.wikimedia.org/wikipedia/commons/c/c3/Kirbys_Adventure_logo.png',
  'Double Dragon II': 'https://upload.wikimedia.org/wikipedia/commons/9/91/Double_Dragon_Logo.png',
  'Ninja Gaiden': 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Ninja_Gaiden_logo_retro.png',

  // SNES
  'Super Mario World': 'https://upload.wikimedia.org/wikipedia/commons/0/07/Super_Mario_World_logo.svg',
  'Chrono Trigger': 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Chrono_Trigger_logo.svg',
  'The Legend of Zelda: A Link to the Past': 'https://upload.wikimedia.org/wikipedia/commons/9/90/The_Legend_of_Zelda_A_Link_to_the_Past_logo.svg',
  'Super Metroid': 'https://upload.wikimedia.org/wikipedia/commons/6/60/Super_Metroid_logo.svg',
  'Donkey Kong Country': 'https://upload.wikimedia.org/wikipedia/commons/8/8c/Donkey_Kong_Country_logo_flat.svg',
  'Donkey Kong Country 2': 'https://upload.wikimedia.org/wikipedia/commons/a/ac/Donkey_Kong_Country_2_logo.png',
  'Mega Man X': 'https://upload.wikimedia.org/wikipedia/commons/9/92/Mega_Man_X_logo.png',
  'Super Mario Kart': 'https://upload.wikimedia.org/wikipedia/commons/9/98/Super_Mario_Kart_logo.png',
  'Street Fighter II Turbo': 'https://upload.wikimedia.org/wikipedia/commons/1/1d/Street_Fighter_II_logo.svg',
  'Mortal Kombat II': 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Mortal_Kombat_2_logo_trans.png',
  'Ultimate Mortal Kombat 3': 'https://upload.wikimedia.org/wikipedia/commons/5/52/Mortal_Kombat_3_logo.svg',
  'F-Zero': 'https://upload.wikimedia.org/wikipedia/commons/9/9f/F-Zero_logo.svg',

  // N64
  'Super Mario 64': 'https://upload.wikimedia.org/wikipedia/commons/9/96/Super_Mario_64_logo.svg',
  'The Legend of Zelda: Ocarina of Time': 'https://upload.wikimedia.org/wikipedia/commons/5/52/The_Legend_of_Zelda_Ocarina_of_Time_logo.svg',
  'Mario Kart 64': 'https://upload.wikimedia.org/wikipedia/commons/d/df/Mario_Kart_64_logo.svg',
  'Super Smash Bros.': 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Super_Smash_Bros._logo.svg',
  'GoldenEye 007': 'https://upload.wikimedia.org/wikipedia/commons/b/b2/GoldenEye_007_logo.png',
  'Banjo-Kazooie': 'https://upload.wikimedia.org/wikipedia/commons/0/05/Banjo-Kazooie_logo.svg',
  'Star Fox 64': 'https://upload.wikimedia.org/wikipedia/commons/2/23/Star_Fox_64_logo.svg',

  // GBA
  'Pokémon Emerald': 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Logo_de_Pok%C3%A9mon_%C3%89meraude.png',
  'Pokémon FireRed': 'https://upload.wikimedia.org/wikipedia/commons/9/94/Logo_de_Pok%C3%A9mon_Rouge_Feu.png',
  'Pokémon LeafGreen': 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Logo_de_Pok%C3%A9mon_Vert_Feuille.png',
  'Pokémon Ruby': 'https://upload.wikimedia.org/wikipedia/commons/5/5b/Logo_de_Pok%C3%A9mon_Rubis.png',
  'Pokémon Sapphire': 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Logo_de_Pok%C3%A9mon_Saphir.png',
  'The Legend of Zelda: The Minish Cap': 'https://upload.wikimedia.org/wikipedia/commons/9/95/The_Legend-of-Zelda_The_Minish_Cap_logo_transparent.png',
  'Mario Kart: Super Circuit': 'https://upload.wikimedia.org/wikipedia/commons/c/cc/Mario_Kart_Super_Circuit_logo.png',
  'Metroid Fusion': 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Metroid_Fusion_logo_trans.png',
  'Metroid: Zero Mission': 'https://upload.wikimedia.org/wikipedia/commons/2/29/Metroid_Zero_Mission_logo.png',

  // Sega Genesis & Master System
  'Sonic the Hedgehog': 'https://upload.wikimedia.org/wikipedia/commons/6/62/Sonic_the_Hedgehog_%28logo%29.svg',
  'Sonic the Hedgehog 2': 'https://upload.wikimedia.org/wikipedia/commons/d/df/Sonic_the_Hedgehog_2_logo_2020.svg',
  'Sonic the Hedgehog 3': 'https://upload.wikimedia.org/wikipedia/commons/7/77/Sonic_the_Hedgehog_3_Logo.png',
  'Streets of Rage 2': 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Streets_of_Rage_logo.svg',
  'Aladdin': 'https://upload.wikimedia.org/wikipedia/commons/0/02/Aladdin_Sega_logo.png',
  'Mortal Kombat 3': 'https://upload.wikimedia.org/wikipedia/commons/5/52/Mortal_Kombat_3_logo.svg',
  'Alex Kidd in Miracle World': 'https://upload.wikimedia.org/wikipedia/commons/d/da/Alex_Kidd_Miracle_World_logo.png',

  // Arcade / NeoGeo / PS1 / GB / Atari / Others
  'Pac-Man': 'https://upload.wikimedia.org/wikipedia/commons/0/06/Pac-Man_Logo.svg',
  'Metal Slug': 'https://upload.wikimedia.org/wikipedia/commons/1/10/Metal_Slug_logo.svg',
  'Street Fighter II': 'https://upload.wikimedia.org/wikipedia/commons/1/1d/Street_Fighter_II_logo.svg',
  'Tekken 3': 'https://upload.wikimedia.org/wikipedia/commons/7/77/Tekken_3_Logo.png',
  'Castlevania: Symphony of the Night': 'https://upload.wikimedia.org/wikipedia/commons/d/db/Castlevania_Symphony_of_the_Night_Logo.png',
  'Syphon Filter': 'https://upload.wikimedia.org/wikipedia/commons/1/13/Syphon_Filter_logo.png',
  'Silent Hill': 'https://upload.wikimedia.org/wikipedia/commons/b/b8/Silent_Hill_logo.svg',
  'Tetris': 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Tetris_official_logo_transparent.png',
  'Space Invaders': 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Space_Invaders_logo.svg',
  'Asteroids': 'https://upload.wikimedia.org/wikipedia/commons/c/c9/Asteroids_atari_logo_trans.png',
  'Pitfall!': 'https://upload.wikimedia.org/wikipedia/commons/8/87/Pitfall_Logo_retro.png',
};

/**
 * Resolves a transparent background game logotype URL for high-end cinematic display.
 * Returns null if no custom mapping is available (so fallback text rendering can be applied instead).
 */
export function getGameLogoUrl(title: string): string | null {
  if (!title) return null;
  const normalizedTitle = title.trim();
  
  // Try exact lookup first
  if (GAME_LOGO_MAPPINGS[normalizedTitle]) {
    return GAME_LOGO_MAPPINGS[normalizedTitle];
  }

  // Double check case-insensitive matching
  const keys = Object.keys(GAME_LOGO_MAPPINGS);
  const matchedKey = keys.find(k => k.toLowerCase() === normalizedTitle.toLowerCase());
  if (matchedKey) {
    return GAME_LOGO_MAPPINGS[matchedKey];
  }

  return null;
}
