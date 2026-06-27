/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Game } from '../types';
import { EXACT_ROM_MAPPINGS } from '../utils/romResolver';
import { getLibretroSystemFolderName } from '../utils/logoResolver';

const getLibretroCandidates = (title: string, systemId: string, originalTitle?: string): string[] => {
  const folder = getLibretroSystemFolderName(systemId);
  if (!folder) return [];

  const candidates: string[] = [];
  
  // Helper to strip accents and convert to ASCII
  const deaccent = (str: string): string => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/Pokémon/g, 'Pokemon')
      .replace(/pokémon/g, 'pokemon');
  };

  const cleanBase = (t: string, customClean: boolean): string => {
    let s = t;
    if (customClean) s = s.replace(/:/g, ' -');
    s = s.replace(/\s\x27N\s/g, " 'n ").replace(/\s\x27n\s/g, " 'n ").replace(/[/*?"<>|]/g, '');
    return s;
  };

  const baseTitle = title.trim();

  // Add the high-precision mapped No-Intro filename as candidates if present
  const exactFile = EXACT_ROM_MAPPINGS[systemId.toLowerCase()]?.[baseTitle] || 
                    (originalTitle ? EXACT_ROM_MAPPINGS[systemId.toLowerCase()]?.[originalTitle.trim()] : undefined);
  if (exactFile) {
    const cleanFileName = exactFile.replace(/\.(zip|7z|bin|sfc|nes|gba|gb|gbc)$/i, '');
    candidates.push(cleanFileName);
    candidates.push(cleanBase(cleanFileName, true));
    candidates.push(deaccent(cleanFileName));
    candidates.push(deaccent(cleanBase(cleanFileName, true)));
    // Strip revision or master brackets if any
    const strippedRevision = cleanFileName.replace(/\s*\(Co-Master\)/i, '').replace(/\s*\(Rev\s*[A-Z0-9]+\)/gi, '').trim();
    if (strippedRevision !== cleanFileName) {
      candidates.push(strippedRevision);
      candidates.push(cleanBase(strippedRevision, true));
      candidates.push(deaccent(strippedRevision));
      candidates.push(deaccent(cleanBase(strippedRevision, true)));
    }
  }

  // 1. Core Titles and deaccented titles
  const rawTitles = [baseTitle];
  if (originalTitle) rawTitles.push(originalTitle.trim());
  
  // Clean translation brackets
  const cleanTranslation = (t: string) => {
    return t.replace(/\(PT-BR\)/gi, '')
            .replace(/\[PT-BR\]/gi, '')
            .replace(/\(Traduzido\)/gi, '')
            .replace(/\[Traduzido\]/gi, '')
            .trim();
  };

  // Build variants
  const variants: string[] = [];
  for (const rt of rawTitles) {
    const ct = cleanTranslation(rt);
    variants.push(ct);
    variants.push(deaccent(ct));
    
    // Replace GTA -> Grand Theft Auto
    if (ct.toLowerCase().includes('gta')) {
      const gtaReplaced = ct.replace(/gta/gi, 'Grand Theft Auto');
      variants.push(gtaReplaced);
      variants.push(deaccent(gtaReplaced));
    }
  }

  // Ensure we add colon variants e.g. "A: B" -> "A - B"
  const colonVariants: string[] = [];
  for (const v of variants) {
    colonVariants.push(v);
    if (v.includes(':')) {
      const replaced = v.replace(/:/g, ' -');
      colonVariants.push(replaced);
      
      // Also split on first colon and try to make smart "Left, The - Right"
      const parts = v.split(':');
      if (parts.length >= 2) {
        const left = parts[0].trim();
        const right = parts.slice(1).join(':').trim();
        
        // e.g. Left = "The Legend of Zelda", Right = "A Link to the Past"
        if (left.toLowerCase().startsWith('the ')) {
          const coreLeft = left.substring(4).trim();
          colonVariants.push(`${coreLeft}, The - ${right}`);
          colonVariants.push(`${left} - ${right}`);
        } else if (left.toLowerCase().endsWith(', the')) {
          const coreLeft = left.substring(0, left.length - 5).trim();
          colonVariants.push(`The ${coreLeft} - ${right}`);
          colonVariants.push(`${left} - ${right}`);
        } else {
          colonVariants.push(`${left} - ${right}`);
        }
      }
    }
    if (v.includes(' - ')) {
      const parts = v.split(' - ');
      if (parts.length >= 2) {
        const left = parts[0].trim();
        const right = parts.slice(1).join(' - ').trim();
        if (left.toLowerCase().startsWith('the ')) {
          const coreLeft = left.substring(4).trim();
          colonVariants.push(`${coreLeft}, The - ${right}`);
          colonVariants.push(`${left} - ${right}`);
        } else if (left.toLowerCase().endsWith(', the')) {
          const coreLeft = left.substring(0, left.length - 5).trim();
          colonVariants.push(`The ${coreLeft} - ${right}`);
          colonVariants.push(`${left} - ${right}`);
        }
      }
    }
  }

  // Apply standard 'The' suffix-prefix transformations to all generated colon variants
  const theVariants: string[] = [];
  for (const cv of colonVariants) {
    theVariants.push(cv);
    if (cv.toLowerCase().startsWith('the ')) {
      const rest = cv.substring(4).trim();
      theVariants.push(`${rest}, The`);
    } else if (cv.toLowerCase().endsWith(', the')) {
      const rest = cv.substring(0, cv.length - 5).trim();
      theVariants.push(`The ${rest}`);
    }
  }

  // De-accent and push everything to final candidates list
  const processedVariants = Array.from(new Set(theVariants)).flatMap(v => {
    return [v, deaccent(v)];
  });

  // Unique list of raw titles to append suffixes to
  const uniqueBases = Array.from(new Set(processedVariants));

  // Fallback candidate overrides for highly picky top titles
  const lowerBase = (originalTitle || baseTitle).toLowerCase();
  
  // Pokemon custom candidates
  if (lowerBase.includes('pokemon') || lowerBase.includes('pokémon')) {
    if (lowerBase.includes('emerald')) {
      candidates.push('Pokemon - Emerald Version (USA, Europe)');
      candidates.push('Pokemon - Emerald Version');
    } else if (lowerBase.includes('firered')) {
      candidates.push('Pokemon - FireRed Version (USA, Europe)');
      candidates.push('Pokemon - FireRed Version');
    } else if (lowerBase.includes('leafgreen')) {
      candidates.push('Pokemon - LeafGreen Version (USA, Europe)');
      candidates.push('Pokemon - LeafGreen Version');
    } else if (lowerBase.includes('ruby')) {
      candidates.push('Pokemon - Ruby Version (USA, Europe)');
    } else if (lowerBase.includes('sapphire')) {
      candidates.push('Pokemon - Sapphire Version (USA, Europe)');
    } else if (lowerBase.includes('crystal')) {
      candidates.push('Pokemon - Crystal Version (USA, Europe)');
      candidates.push('Pokemon - Crystal Version');
    } else if (lowerBase.includes('gold')) {
      candidates.push('Pokemon - Gold Version (USA, Europe)');
      candidates.push('Pokemon - Gold Version');
    } else if (lowerBase.includes('silver')) {
      candidates.push('Pokemon - Silver Version (USA, Europe)');
      candidates.push('Pokemon - Silver Version');
    } else if (lowerBase.includes('yellow')) {
      candidates.push('Pokemon - Yellow Version - Special Pikachu Edition (USA, Europe)');
      candidates.push('Pokemon - Yellow Version');
    } else if (lowerBase.includes('red')) {
      candidates.push('Pokemon - Red Version (USA, Europe)');
    } else if (lowerBase.includes('blue')) {
      candidates.push('Pokemon - Blue Version (USA, Europe)');
    } else if (lowerBase.includes('heartgold')) {
      candidates.push('Pokemon - HeartGold Version (USA)');
      candidates.push('Pokemon - HeartGold Version');
    }
  }

  if (lowerBase.includes('ocarina of time')) {
    candidates.push('Legend of Zelda, The - Ocarina of Time (USA)');
    candidates.push('Legend of Zelda, The - Ocarina of Time');
  }
  if (lowerBase.includes("majora's mask") || lowerBase.includes('majoras mask')) {
    candidates.push("Legend of Zelda, The - Majora's Mask (USA)");
    candidates.push("Legend of Zelda, The - Majora's Mask (USA) (Co-Master)");
    candidates.push("Legend of Zelda, The - Majora's Mask");
  }
  if (lowerBase.includes('goldeneye') || lowerBase.includes('007')) {
    candidates.push('GoldenEye 007 (USA)');
    candidates.push('GoldenEye 007');
  }
  if (lowerBase.includes('fifa 99')) {
    candidates.push('FIFA 99 (Europe) (En,Fr,De,Es,It,Nl,Pt,Sv)');
    candidates.push('FIFA 99 (Europe)');
    candidates.push('FIFA 99 (USA) (En,Fr,De,Es,It,Nl,Pt,Sv)');
    candidates.push('FIFA 99');
  }
  if (lowerBase.includes('rondo of blood')) {
    candidates.push('Castlevania - Rondo of Blood (Japan)');
    candidates.push('Castlevania - Rondo of Blood');
  }
  if (lowerBase.includes('simpsons game') || lowerBase.includes('the simpsons')) {
    candidates.push('Simpsons, The (USA)');
    candidates.push('Simpsons Arcade, The');
    candidates.push('Simpsons Game, The (USA)');
  }
  if (lowerBase.includes('cadillacs and dinosaurs')) {
    candidates.push('Cadillacs and Dinosaurs (World)');
    candidates.push('Cadillacs and Dinosaurs');
  }
  if (lowerBase.includes('ms. pac-man') || lowerBase.includes('ms pacman')) {
    candidates.push('Ms. Pac-Man (USA)');
    candidates.push('Ms. Pac-Man');
  }
  if (lowerBase.includes('chinatown wars')) {
    candidates.push('Grand Theft Auto - Chinatown Wars (USA)');
    candidates.push('Grand Theft Auto - Chinatown Wars');
  }
  if (lowerBase.includes('san andreas')) {
    candidates.push('Grand Theft Auto - San Andreas (USA)');
    candidates.push('Grand Theft Auto - San Andreas');
  }
  if (lowerBase.includes('last of us')) {
    candidates.push('Last of Us, The (USA)');
    candidates.push('Last of Us, The');
  }
  if (lowerBase.includes('king of fighters 98') || lowerBase.includes("fighters '98")) {
    candidates.push("King of Fighters '98, The - The Slugfest (Japan)");
    candidates.push("King of Fighters '98, The - The Slugfest");
    candidates.push("King of Fighters '98, The");
  }
  if (lowerBase.includes('yu-gi-oh') || lowerBase.includes('yugioh')) {
    candidates.push('Yu-Gi-Oh! - Dark Duel Stories (USA)');
    candidates.push('Yu-Gi-Oh! - Dark Duel Stories');
  }
  if (lowerBase.includes('resident evil code') || lowerBase.includes('code: veronica') || lowerBase.includes('code veronica')) {
    candidates.push('Resident Evil - Code - Veronica (USA)');
    candidates.push('Resident Evil - Code - Veronica');
  }
  if (lowerBase.includes('symphony of the night')) {
    candidates.push('Castlevania - Symphony of the Night (USA)');
    candidates.push('Castlevania - Symphony of the Night');
  }

  // Base Suffixes list
  const suffixes = ['', ' (USA)', ' (USA, Europe)', ' (Europe)', ' (World)', ' (Japan)'];

  // Multiply bases with suffixes
  for (const b of uniqueBases) {
    for (const sfx of suffixes) {
      candidates.push(cleanBase(b + sfx, false));
      candidates.push(cleanBase(b + sfx, true));
    }
  }

  // De-duplicate final candidate array
  const finalCandidates = Array.from(new Set(candidates)).filter(Boolean);

  // Return formatted raw GitHub content URLs (handling both master and main branches for fallback resilience)
  return finalCandidates.flatMap(c => [
    `https://raw.githubusercontent.com/libretro-thumbnails/${folder}/master/Named_Boxarts/${encodeURIComponent(c)}.png`,
    `https://raw.githubusercontent.com/libretro-thumbnails/${folder}/main/Named_Boxarts/${encodeURIComponent(c)}.png`
  ]);
};

interface GameCoverProps {
  game: Game;
  systemId: string;
  className?: string;
  isThumbnail?: boolean;
}

interface SystemStyle {
  bgPlastic: string;
  labelBg: string;
  ribbonBg: string;
  ribbonText: string;
  accentColor: string;
  hardwareLabel: string;
  caseType: 'cartridge' | 'cd-case' | 'dvd-box' | 'nds-card';
  screws?: boolean;
  plasticTexture?: string;
  moldedText?: string;
}

const getSystemStyle = (systemId: string): SystemStyle => {
  const sId = (systemId || '').toLowerCase().trim();
  
  if (sId === 'snes' || sId === 'supernintendo') {
    return {
      bgPlastic: 'bg-zinc-400',
      labelBg: 'from-zinc-900 to-zinc-950',
      ribbonBg: 'from-purple-600 to-indigo-600',
      ribbonText: 'SUPER NINTENDO',
      accentColor: 'text-purple-400',
      hardwareLabel: 'SNS-006 / 16-BIT',
      caseType: 'cartridge',
      screws: true,
      plasticTexture: 'border-t-zinc-300 border-l-zinc-300 border-r-zinc-500 border-b-zinc-600 shadow-md',
      moldedText: 'NINTENDO'
    };
  }
  
  if (sId === 'nes' || sId === 'nintendo') {
    return {
      bgPlastic: 'bg-zinc-500',
      labelBg: 'from-zinc-950 to-zinc-900',
      ribbonBg: 'from-red-600 to-red-700',
      ribbonText: 'NES CLASSIC',
      accentColor: 'text-red-400',
      hardwareLabel: 'NES-GP-USA / MONO',
      caseType: 'cartridge',
      plasticTexture: 'border-t-zinc-400 border-l-zinc-400 border-r-zinc-600 border-b-zinc-700',
      moldedText: 'ENTERTAINMENT SYSTEM'
    };
  }

  if (sId === 'n64' || sId === 'nintendo64') {
    return {
      bgPlastic: 'bg-zinc-400',
      labelBg: 'from-zinc-900 to-zinc-950',
      ribbonBg: 'from-red-600 to-orange-500',
      ribbonText: 'NINTENDO 64',
      accentColor: 'text-red-500',
      hardwareLabel: 'NUS-006 (USA) / 64-BIT',
      caseType: 'cartridge',
      screws: false,
      plasticTexture: 'border-t-zinc-300 border-l-zinc-300 border-r-zinc-500 border-b-zinc-600',
      moldedText: 'N64 ENGINE'
    };
  }

  if (sId === 'genesis' || sId === 'megadrive') {
    return {
      bgPlastic: 'bg-zinc-900',
      labelBg: 'from-zinc-950 to-zinc-900',
      ribbonBg: 'from-blue-600 to-indigo-700',
      ribbonText: 'SEGA GENESIS',
      accentColor: 'text-blue-400',
      hardwareLabel: '16-BIT CARTRIDGE / STEREO',
      caseType: 'cartridge',
      screws: false,
      plasticTexture: 'border-t-zinc-800 border-l-zinc-800 border-r-black border-b-black',
      moldedText: 'SEGA'
    };
  }

  if (sId === 'gba' || sId === 'gameboyadvance') {
    return {
      bgPlastic: 'bg-[#1a2f4c]',
      labelBg: 'from-[#0e1624] to-[#050b12]',
      ribbonBg: 'from-red-600 to-red-700',
      ribbonText: 'GAME BOY ADVANCE',
      accentColor: 'text-red-400',
      hardwareLabel: 'AGB-002 / GBA MOTOR',
      caseType: 'cartridge',
      screws: false,
      plasticTexture: 'border-t-zinc-800 border-l-zinc-800 border-r-black border-b-black opacity-95',
      moldedText: 'GAME BOY ADVANCE'
    };
  }

  if (sId === 'gb' || sId === 'gbc' || sId === 'gameboy' || sId === 'gameboycolor') {
    return {
      bgPlastic: 'bg-zinc-300',
      labelBg: 'from-zinc-950 to-zinc-900',
      ribbonBg: 'from-teal-600 to-cyan-600',
      ribbonText: 'GAME BOY COLOR',
      accentColor: 'text-teal-400',
      hardwareLabel: 'DMG-01 / 8-BIT STEREO',
      caseType: 'cartridge',
      screws: false,
      plasticTexture: 'border-t-white border-l-white border-r-zinc-400 border-b-zinc-500',
      moldedText: 'GAME BOY'
    };
  }

  if (sId === 'nds' || sId === 'nintendods') {
    return {
      bgPlastic: 'bg-zinc-200',
      labelBg: 'from-zinc-900 to-zinc-950',
      ribbonBg: 'from-orange-500 to-amber-600',
      ribbonText: 'NINTENDO DS',
      accentColor: 'text-orange-400',
      hardwareLabel: 'NTR-005 / TWL-001',
      caseType: 'nds-card',
      screws: false,
      plasticTexture: 'border-zinc-300',
      moldedText: 'NINTENDO'
    };
  }

  if (sId === 'ps1' || sId === 'psx' || sId === 'playstation') {
    return {
      bgPlastic: 'bg-zinc-800',
      labelBg: 'from-indigo-950 to-black',
      ribbonBg: 'from-zinc-700 to-zinc-900',
      ribbonText: 'PLAYSTATION CD',
      accentColor: 'text-indigo-400',
      hardwareLabel: 'SCPH-1001 / CD-ROM',
      caseType: 'cd-case',
      screws: false,
      plasticTexture: 'border-zinc-800',
      moldedText: 'COMPACT DISC'
    };
  }

  if (sId === 'ps2' || sId === 'playstation2') {
    return {
      bgPlastic: 'bg-[#0a0a0c]',
      labelBg: 'from-[#0b132b] to-black',
      ribbonBg: 'from-blue-600 to-cyan-500',
      ribbonText: 'PLAYSTATION 2',
      accentColor: 'text-blue-400',
      hardwareLabel: 'SCPH-39001 / DVD-ROM',
      caseType: 'dvd-box',
      screws: false,
      plasticTexture: 'border-blue-950/20',
      moldedText: 'PS2 SYSTEM'
    };
  }

  if (sId === 'ps3' || sId === 'playstation3') {
    return {
      bgPlastic: 'bg-[#0f0f12]',
      labelBg: 'from-[#111827] to-black',
      ribbonBg: 'from-zinc-800 to-zinc-900',
      ribbonText: 'PLAYSTATION 3',
      accentColor: 'text-zinc-300',
      hardwareLabel: 'BLU-RAY DISC / 1080P',
      caseType: 'dvd-box',
      screws: false,
      plasticTexture: 'border-zinc-800',
      moldedText: 'PS3 SYSTEM'
    };
  }

  if (sId.includes('xbox')) {
    return {
      bgPlastic: 'bg-[#064e3b]',
      labelBg: 'from-zinc-950 to-zinc-900',
      ribbonBg: 'from-emerald-500 to-emerald-600',
      ribbonText: 'XBOX SYSTEM',
      accentColor: 'text-emerald-400',
      hardwareLabel: 'DVD-ROM / X-CPU 733',
      caseType: 'dvd-box',
      screws: false,
      plasticTexture: 'border-emerald-600/25',
      moldedText: 'XBOX'
    };
  }

  if (sId === 'saturn' || sId === 'segasaturn' || sId === 'dreamcast') {
    return {
      bgPlastic: 'bg-zinc-800',
      labelBg: 'from-zinc-950 to-zinc-900',
      ribbonBg: sId === 'dreamcast' ? 'from-orange-500 to-red-500' : 'from-zinc-600 to-zinc-800',
      ribbonText: sId === 'dreamcast' ? 'DREAMCAST GD-ROM' : 'SEGA SATURN',
      accentColor: sId === 'dreamcast' ? 'text-orange-400' : 'text-zinc-300',
      hardwareLabel: sId === 'dreamcast' ? 'MIL-CD / SH-4 200' : 'MK-80000 / DUAL-SH2',
      caseType: 'cd-case',
      screws: false,
      plasticTexture: 'border-zinc-800',
      moldedText: 'SEGA ENGINE'
    };
  }

  return {
    bgPlastic: 'bg-zinc-800',
    labelBg: 'from-zinc-950 to-zinc-900',
    ribbonBg: 'from-amber-500 to-amber-600',
    ribbonText: 'RETRO COLLECTION',
    accentColor: 'text-amber-400',
    hardwareLabel: 'CART-USA v1.2',
    caseType: 'cartridge',
    screws: true,
    plasticTexture: 'border-t-zinc-700 border-l-zinc-700 border-r-zinc-900 border-b-black',
    moldedText: 'CLASSIC RETRO'
  };
};

export const GameCover: React.FC<GameCoverProps> = ({ game, systemId, className, isThumbnail }) => {
  const actualSystemId = useMemo(() => {
    if (game.id && game.id.includes('-')) {
      const part = game.id.split('-')[0];
      if (part && part.length < 15) {
        return part;
      }
    }
    return systemId;
  }, [game.id, systemId]);

  const candidates = useMemo(() => {
    let cleanTitle = game.title.replace(/\(PT-BR\)/gi, '').replace(/\[PT-BR\]/gi, '').replace(/\(Traduzido\)/gi, '').replace(/\[Traduzido\]/gi, '').trim();
    const originalCleanTitle = cleanTitle;
    if (cleanTitle.toLowerCase().startsWith('the ')) {
      const coreName = cleanTitle.substring(4).trim();
      cleanTitle = `${coreName}, The`;
    }
    return getLibretroCandidates(cleanTitle, actualSystemId, originalCleanTitle);
  }, [game.title, actualSystemId]);

  const [src, setSrc] = useState<string>('');
  const [attempt, setAttempt] = useState<number>(0);
  const [loaded, setLoaded] = useState(false);
  const [isFatalError, setIsFatalError] = useState(false);

  useEffect(() => {
    setIsFatalError(false);
    setLoaded(false);
    if (candidates.length > 0) {
      setSrc(candidates[0]);
      setAttempt(1);
    } else if (game.image) {
      setSrc(game.image);
      setAttempt(0);
    } else {
      setSrc('');
      setIsFatalError(true);
    }
  }, [game.image, candidates]);

  const handleError = () => {
    if (attempt > 0 && attempt < candidates.length) {
      setSrc(candidates[attempt]);
      setAttempt(prev => prev + 1);
    } else if (attempt > 0 && game.image && src !== game.image) {
      setSrc(game.image);
      setAttempt(0);
    } else {
      setIsFatalError(true);
      setLoaded(true);
    }
  };

  if (isFatalError || !src) {
    const sStyle = getSystemStyle(actualSystemId);

    if (isThumbnail) {
      const firstLetter = game.title.trim().charAt(0).toUpperCase();
      return (
        <div className={`absolute inset-0 ${sStyle.bgPlastic} flex flex-col justify-between p-1 select-none border border-white/10 shadow overflow-hidden rounded-md`}>
          {/* Top miniature stripe representing the platform */}
          <div className="w-full h-1.5 rounded-sm bg-zinc-900/40 flex items-center justify-center overflow-hidden">
            <div className={`w-full h-0.5 bg-gradient-to-r ${sStyle.ribbonBg}`} />
          </div>

          {/* Central giant high-contrast retro letter */}
          <div className="flex-1 flex items-center justify-center">
            <span className="font-sans font-black text-xs text-white tracking-tighter drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]">
              {firstLetter}
            </span>
          </div>

          {/* Miniature quality badge or style */}
          <div className="w-full flex justify-between items-center px-0.5 text-[4px] font-mono opacity-50">
            <span className="text-[3.5px] scale-90 origin-left truncate max-w-[15px] text-white/80">{sStyle.moldedText || 'CART'}</span>
            <div className="w-1 h-1 rounded-full bg-amber-400 scale-75" />
          </div>
        </div>
      );
    }

    // Dynamic 3D cases for different media formats on the main pedestal view
    if (sStyle.caseType === 'cartridge') {
      return (
        <div className={`absolute inset-0 ${sStyle.bgPlastic} flex flex-col justify-between p-3 select-none border-2 ${sStyle.plasticTexture} shadow-3xl overflow-hidden rounded-2xl`}>
          {/* Cartridge top grip grooves and physical ridges */}
          <div className="absolute top-0 inset-x-0 h-5 bg-black/25 border-b border-black/30 flex justify-center items-center gap-2 z-10">
            <div className="w-2 h-2 rounded-full bg-black/40 shadow-inner" />
            <div className="w-16 h-1 rounded-full bg-black/30" />
            <div className="w-16 h-1 rounded-full bg-black/30" />
            <div className="w-2 h-2 rounded-full bg-black/40 shadow-inner" />
          </div>

          {/* Molded plastic brand text engraved on physical plastic casing */}
          <div className="mt-5 w-full text-center flex justify-center opacity-20">
            <span className="font-sans font-black text-[13px] text-black tracking-[0.3em] select-none leading-none">
              ★ {sStyle.moldedText} SYSTEM ★
            </span>
          </div>

          {/* Main sticker label */}
          <div className={`flex-1 mt-2.5 bg-gradient-to-br ${sStyle.labelBg} rounded-xl border border-black/50 p-3.5 flex flex-col justify-between relative overflow-hidden group`}>
            {/* Glossy light reflection sweep */}
            <div className="absolute top-0 left-0 right-0 h-2/3 bg-gradient-to-b from-white/5 to-transparent pointer-events-none z-10" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent opacity-40 pointer-events-none" />

            {/* Platform accent top ribbon */}
            <div className="w-full flex flex-col items-center">
              <span className={`font-sans text-[8.5px] font-black tracking-widest uppercase bg-gradient-to-r ${sStyle.ribbonBg} text-transparent bg-clip-text`}>
                ★ {sStyle.ribbonText} ★
              </span>
              <div className={`h-[2px] w-full bg-gradient-to-r ${sStyle.ribbonBg} opacity-80 mt-1.5`} />
            </div>

            {/* Center Game Title Area with nice glowing drop shadow */}
            <div className="my-auto px-1 flex flex-col items-center justify-center gap-1.5 z-10 text-center">
              <span className="font-sans font-black text-sm md:text-base text-white uppercase tracking-wide text-center leading-tight line-clamp-3 drop-shadow-[0_2.5px_5px_rgba(0,0,0,0.95)]">
                {game.title}
              </span>
              <span className={`font-mono text-[7px] ${sStyle.accentColor} font-black uppercase tracking-[0.2em] mt-0.5`}>
                {game.genre || 'CLASSIC'}
              </span>
            </div>

            {/* Quality seal + Year details */}
            <div className="flex items-center justify-between px-1 z-10 border-t border-white/5 pt-2">
              <div className="flex flex-col text-left">
                <span className="font-mono text-[5.5px] text-zinc-500 uppercase tracking-widest leading-none">
                  {sStyle.hardwareLabel}
                </span>
                <span className="font-sans text-[6.5px] text-zinc-400 uppercase font-extrabold mt-1 tracking-wider leading-none">
                  RELEASE: {game.year || 'RETRO ERA'}
                </span>
              </div>

              {/* Classic Gold Seal of Quality */}
              <div className="relative w-8 h-8 flex flex-col items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 via-amber-500 to-amber-700 shadow-md border border-yellow-400/40 p-0.5 animate-pulse">
                <div className="absolute inset-0.5 rounded-full border border-dashed border-amber-900/35" />
                <span className="text-[5px] font-sans font-black text-amber-950 uppercase tracking-tighter leading-none z-10">
                  SELO DE
                </span>
                <span className="text-[5.5px] font-mono font-black text-amber-950 tracking-tighter leading-none z-10">
                  OURO
                </span>
              </div>
            </div>
          </div>

          {/* Bottom hardware detail (phillips brass screws) */}
          {sStyle.screws && (
            <div className="mt-2 w-full flex justify-between px-6 items-center opacity-70">
              <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-zinc-700 via-amber-700 to-zinc-900 border border-black/40 flex items-center justify-center shadow-inner relative">
                <div className="w-2.5 h-0.5 bg-black/60 transform rotate-45" />
                <div className="w-2.5 h-0.5 bg-black/60 absolute transform -rotate-45" />
              </div>

              <span className="font-mono text-[7px] text-zinc-600 tracking-widest uppercase">
                MADE IN RETROLAND
              </span>

              <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-zinc-700 via-amber-700 to-zinc-900 border border-black/40 flex items-center justify-center shadow-inner relative">
                <div className="w-2.5 h-0.5 bg-black/60 transform rotate-12" />
                <div className="w-2.5 h-0.5 bg-black/60 absolute transform -rotate-78" />
              </div>
            </div>
          )}
        </div>
      );
    }

    if (sStyle.caseType === 'cd-case') {
      return (
        <div className="absolute inset-0 bg-[#0f0f11] flex select-none border-4 border-zinc-700/60 shadow-3xl overflow-hidden rounded-2xl p-0.5">
          {/* Glass reflection streak on case front */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 pointer-events-none z-20" />
          
          {/* CD Spine / Side grip on Left side of jewel case */}
          <div className="w-[34px] bg-[#1c1c1f] border-r border-black/50 flex flex-col justify-between py-6 px-1.5 items-center relative shadow-inner">
            <div className="flex flex-col gap-1.5 opacity-50">
              <div className="w-1.5 h-4 bg-black/50 rounded-sm" />
              <div className="w-1.5 h-4 bg-black/50 rounded-sm" />
              <div className="w-1.5 h-4 bg-black/50 rounded-sm" />
            </div>
            <div className="transform -rotate-90 origin-center text-[6px] font-mono font-black text-zinc-600 uppercase tracking-widest whitespace-nowrap">
              COMPACT DISC
            </div>
            <div className="flex flex-col gap-1.5 opacity-50">
              <div className="w-1.5 h-4 bg-black/50 rounded-sm" />
              <div className="w-1.5 h-4 bg-black/50 rounded-sm" />
              <div className="w-1.5 h-4 bg-black/50 rounded-sm" />
            </div>
          </div>

          {/* CD Booklet Insert Label */}
          <div className={`flex-1 bg-gradient-to-br ${sStyle.labelBg} p-4 flex flex-col justify-between relative`}>
            <div className={`absolute right-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${sStyle.ribbonBg}`} />

            {/* Booklet Header */}
            <div className="w-full">
              <span className="font-sans text-[9px] font-black tracking-widest uppercase text-white/90">
                ★ {sStyle.ribbonText} ★
              </span>
              <div className="h-[1px] w-full bg-white/10 mt-1.5" />
            </div>

            {/* Game title in Booklet center */}
            <div className="my-auto text-left pr-2">
              <h1 className="font-sans font-black text-sm md:text-base text-white uppercase tracking-wide leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                {game.title}
              </h1>
              <div className="w-8 h-0.5 bg-gradient-to-r from-indigo-500 to-transparent mt-2" />
              <span className={`font-mono text-[7px] ${sStyle.accentColor} font-black uppercase tracking-[0.15em] mt-1 block`}>
                {game.genre || 'CLASSIC'}
              </span>
            </div>

            {/* Booklet Footer details */}
            <div className="flex items-end justify-between pr-3 border-t border-white/5 pt-2">
              <div className="flex flex-col text-left">
                <span className="font-mono text-[5.5px] text-zinc-500 uppercase tracking-widest leading-none">
                  {sStyle.hardwareLabel}
                </span>
                <span className="font-sans text-[6px] text-zinc-400 uppercase font-extrabold mt-1 tracking-wider leading-none">
                  RELEASE: {game.year || 'RETRO ERA'}
                </span>
              </div>

              {/* Compact Disc logo */}
              <div className="w-6 h-6 rounded-full border border-zinc-700/60 flex items-center justify-center opacity-40 text-white font-sans font-black text-[6px]">
                CD
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (sStyle.caseType === 'dvd-box') {
      return (
        <div className={`absolute inset-0 ${sStyle.bgPlastic} flex select-none border-2 border-white/5 shadow-3xl overflow-hidden rounded-2xl p-1`}>
          {/* Transparent plastic wrapping gloss sheen */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/15 pointer-events-none z-20" />

          {/* Left edge spine mimicking DVD wrap hinge */}
          <div className="w-1.5 bg-black/60 mr-1 rounded-sm shadow-inner" />

          {/* DVD cover print insert */}
          <div className={`flex-1 bg-gradient-to-br ${sStyle.labelBg} p-4 flex flex-col justify-between relative rounded-lg border border-black/40`}>
            {/* High-end header banner */}
            <div className="w-full">
              <div className={`w-full py-1 bg-gradient-to-r ${sStyle.ribbonBg} flex items-center justify-center rounded px-2`}>
                <span className="font-sans text-[7.5px] font-black tracking-[0.2em] text-white uppercase">
                  {sStyle.ribbonText}
                </span>
              </div>
            </div>

            {/* Tall game box cover layout */}
            <div className="my-auto text-center py-4">
              <h1 className="font-sans font-black text-sm md:text-base text-white uppercase tracking-wide leading-tight drop-shadow-[0_3px_6px_rgba(0,0,0,0.95)]">
                {game.title}
              </h1>
              <span className={`font-mono text-[7px] ${sStyle.accentColor} font-black uppercase tracking-[0.2em] mt-2 block`}>
                {game.genre || 'CLASSIC'}
              </span>
            </div>

            {/* Bottom details / barcode / classification */}
            <div className="flex items-end justify-between border-t border-white/5 pt-2">
              <div className="flex flex-col text-left">
                <span className="font-mono text-[5.5px] text-zinc-500 uppercase tracking-widest leading-none">
                  {sStyle.hardwareLabel}
                </span>
                <span className="font-sans text-[6px] text-zinc-400 uppercase font-extrabold mt-1 tracking-wider leading-none">
                  RELEASE: {game.year || 'RETRO ERA'}
                </span>
              </div>

              {/* Vintage ESRB-style rating fallback logo */}
              <div className="w-6 h-7 bg-white/95 border border-black flex flex-col items-center justify-between p-0.5 rounded shadow scale-90">
                <span className="text-[6.5px] font-sans font-black text-black leading-none mt-0.5">E</span>
                <span className="text-[3.5px] font-sans font-extrabold text-black uppercase scale-75 origin-bottom">EVERYONE</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (sStyle.caseType === 'nds-card') {
      return (
        <div className={`absolute inset-0 ${sStyle.bgPlastic} flex flex-col justify-between p-2 select-none border-2 border-zinc-400 shadow-3xl overflow-hidden rounded-xl`}>
          {/* NDS game card top grip ridge and triangular directional notch */}
          <div className="absolute top-0 inset-x-0 h-3 bg-black/10 border-b border-black/20 flex justify-end px-3 items-center z-10">
            <div className="w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-t-[5px] border-t-zinc-500" />
          </div>

          {/* Main sticker label */}
          <div className={`flex-1 mt-2.5 bg-gradient-to-br ${sStyle.labelBg} p-2 flex flex-col justify-between relative rounded-md border border-black/30`}>
            {/* Ribbon banner */}
            <div className="w-full">
              <span className="font-sans text-[7px] font-black tracking-widest uppercase text-white">
                {sStyle.ribbonText}
              </span>
              <div className={`h-[1px] w-full bg-gradient-to-r ${sStyle.ribbonBg} mt-1`} />
            </div>

            {/* Tiny title print */}
            <div className="my-auto text-center px-0.5">
              <h1 className="font-sans font-black text-[9px] text-white uppercase tracking-normal leading-tight line-clamp-2 drop-shadow">
                {game.title}
              </h1>
            </div>

            {/* Bottom details */}
            <div className="flex items-center justify-between text-[4.5px] text-zinc-500 font-mono">
              <span>{sStyle.hardwareLabel}</span>
              <div className="w-2.5 h-2.5 rounded bg-orange-600 flex items-center justify-center text-white font-sans text-[4px] font-bold scale-90">
                DS
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="relative w-full h-full overflow-hidden rounded-md flex items-center justify-center bg-zinc-950">
      {/* Elegantly styled loading shimmer shown during background fetching of the thumbnail candidates */}
      {!loaded && !isFatalError && (
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 to-zinc-950 flex flex-col justify-between p-3 select-none border border-white/5 shadow-2xl rounded-md animate-pulse z-10">
          <div className="w-full flex flex-col items-center gap-1">
            <div className="h-1 w-2/3 bg-zinc-800 rounded" />
            <div className="h-0.5 w-full bg-zinc-850 rounded opacity-60 mt-0.5" />
          </div>
          <div className="my-auto flex flex-col items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
            </div>
            <span className="font-mono text-[5.5px] text-zinc-500 uppercase tracking-widest animate-pulse mt-1">
              BUSCANDO CAPA...
            </span>
          </div>
          <div className="h-2 w-1/3 bg-zinc-800 mx-auto rounded" />
        </div>
      )}
      <img
        src={src}
        alt=""
        onError={handleError}
        onLoad={() => setLoaded(true)}
        className={`${className} transition-all duration-300 ${loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        loading="lazy"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};

export default GameCover;
