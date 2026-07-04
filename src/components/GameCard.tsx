/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Game } from '../types';
import { Star, Play, Sparkles, Heart, Gamepad2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useCover } from '../hooks/useCover';
import { getRichDescription } from './GamelistView';
import { getLibretroSystemFolderName } from '../utils/logoResolver';

interface GameCardProps {
  game: Game;
  onLaunch: (game: Game) => void;
  systemName: string;
  onViewDetails?: (game: Game) => void;
  systemId?: string;
}

const getCleanSlug = (title: string): string => {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

const getConsoleColorClass = (systemId: string): string => {
  const cleanId = (systemId || '').toLowerCase();
  const map: Record<string, string> = {
    nes: 'from-rose-600 to-red-800 border-rose-500/30',
    snes: 'from-violet-650 to-indigo-800 border-violet-500/30',
    n64: 'from-blue-600 to-indigo-900 border-blue-500/30',
    gb: 'from-emerald-600 to-teal-800 border-emerald-500/30',
    gbc: 'from-teal-600 to-cyan-800 border-teal-500/30',
    gba: 'from-purple-600 to-fuchsia-800 border-purple-500/30',
    sms: 'from-blue-700 to-sky-900 border-blue-600/30',
    mastersystem: 'from-blue-700 to-sky-900 border-blue-600/30',
    genesis: 'from-slate-700 to-zinc-900 border-slate-650/30',
    megadrive: 'from-slate-700 to-zinc-900 border-slate-650/30',
    saturn: 'from-neutral-600 to-stone-850 border-neutral-500/30',
    ps1: 'from-teal-600 to-cyan-800 border-teal-500/30',
    psx: 'from-teal-600 to-cyan-800 border-teal-500/30',
    atari: 'from-amber-600 to-orange-800 border-amber-500/30',
    atari2600: 'from-amber-600 to-orange-800 border-amber-500/30',
    arcade: 'from-yellow-600 to-amber-850 border-yellow-500/30',
    mame: 'from-yellow-600 to-amber-850 border-yellow-500/30',
    fba: 'from-yellow-600 to-amber-850 border-yellow-500/30',
    neogeo: 'from-rose-700 to-stone-950 border-rose-650/30',
    nds: 'from-cyan-650 to-blue-800 border-cyan-500/30',
    pce: 'from-pink-600 to-fuchsia-800 border-pink-500/30',
    pcengine: 'from-pink-600 to-fuchsia-800 border-pink-500/30',
    '3do': 'from-zinc-700 to-neutral-900 border-zinc-650/30'
  };
  return map[cleanId] || 'from-zinc-800 to-zinc-950 border-zinc-700/30';
};

const getLibretroCandidates = (title: string, systemId: string): string[] => {
  const folder = getLibretroSystemFolderName(systemId);
  if (!folder) return [];

  const candidates: string[] = [];
  const baseTitle = title.trim();

  const cleanBase = (t: string, customClean: boolean): string => {
    let s = t;
    if (customClean) {
      s = s.replace(/:/g, ' -');
    }
    // No-Intro case rules (uses lowercase 'n for 'and' like "Crash 'n Burn")
    s = s.replace(/\s\x27N\s/g, " 'n ");
    s = s.replace(/\s\x27n\s/g, " 'n ");
    s = s.replace(/[/*?"<>|]/g, '');
    return s;
  };

  const suffixes = [
    '',
    ' (USA)',
    ' (USA, Europe)',
    ' (Europe)',
    ' (Japan)',
    ' (World)'
  ];

  // Manual overrides for specific tricky titles
  if (baseTitle.toLowerCase() === "the need for speed") {
    candidates.push("Road _ Track Presents - The Need for Speed (USA)");
    candidates.push("Need For Speed, The (USA)");
  }

  // standard clean candidates
  for (const sfx of suffixes) {
    candidates.push(cleanBase(baseTitle + sfx, false));
  }

  // alt clean candidates (colons to dashes)
  for (const sfx of suffixes) {
    candidates.push(cleanBase(baseTitle + sfx, true));
  }

  // Remove duplicates
  const unique = Array.from(new Set(candidates));

  return unique.map(c => 
    `https://raw.githubusercontent.com/libretro-thumbnails/${folder}/master/Named_Boxarts/${encodeURIComponent(c)}.png`
  );
};

export const GameCard: React.FC<GameCardProps> = ({ game, onLaunch, systemName, onViewDetails, systemId }) => {
  const { coverUrl, loading } = useCover(game.title, systemId || '');

  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [imageError, setImageError] = useState<boolean>(false);
  const [fallbackAttempt, setFallbackAttempt] = useState<number>(0);

  const candidates = useMemo(() => {
    return getLibretroCandidates(game.title, systemId || '');
  }, [game.title, systemId]);

  useEffect(() => {
    if (candidates.length > 0) {
      setCurrentSrc(candidates[0]);
      setImageError(false);
      setFallbackAttempt(1);
    } else if (coverUrl) {
      setCurrentSrc(coverUrl);
      setImageError(false);
      setFallbackAttempt(0);
    } else if (game.image) {
      setCurrentSrc(game.image);
      setImageError(false);
      setFallbackAttempt(0);
    } else {
      setImageError(true);
    }
  }, [game.image, coverUrl, candidates]);

  const handleImageError = () => {
    const sysId = systemId || '';
    
    // If our optimized local pre-generated cover fails, try to fall back to RAWG or remote repositories
    if (game.image && currentSrc === game.image) {
      if (coverUrl) {
        setCurrentSrc(coverUrl);
        setFallbackAttempt(0);
      } else if (candidates.length > 0) {
        setCurrentSrc(candidates[0]);
        setFallbackAttempt(1);
      } else {
        // Fallbacks conhecidos para jogos clássicos
        const lowerTitle = game.title.toLowerCase();
        let manualFallbackUrl = '';

        if (lowerTitle.includes('zelda') && sysId === 'nes') {
          manualFallbackUrl = `https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Nintendo_Entertainment_System/master/Named_Boxarts/Legend%20of%20Zelda%2C%20The.png`;
        } else if (lowerTitle.includes('zelda') && lowerTitle.includes('link to the past') && sysId === 'snes') {
          manualFallbackUrl = `https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Super_Nintendo_Entertainment_System/master/Named_Boxarts/Legend%20of%20Zelda%2C%20The%20-%20A%20Link%20to%20the%20Past.png`;
        } else if (lowerTitle.includes('yoshi') && lowerTitle.includes('island') && sysId === 'snes') {
          manualFallbackUrl = `https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Super_Nintendo_Entertainment_System/master/Named_Boxarts/Super%20Mario%20World%202%20-%20Yoshi%27s%20Island.png`;
        } else if (lowerTitle.includes('punch-out') && sysId === 'nes') {
          manualFallbackUrl = `https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Nintendo_Entertainment_System/master/Named_Boxarts/Mike%20Tyson%27s%20Punch-Out%21%21.png`;
        } else if (lowerTitle.includes('double dragon ii') && sysId === 'nes') {
          manualFallbackUrl = `https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Nintendo_Entertainment_System/master/Named_Boxarts/Double%20Dragon%20II%20-%20The%20Revenge.png`;
        } else if (lowerTitle.includes('metroid') && sysId === 'nes') {
          manualFallbackUrl = `https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Nintendo_Entertainment_System/master/Named_Boxarts/Metroid.png`;
        } else if (lowerTitle.includes('street fighter ii turbo') && sysId === 'snes') {
          manualFallbackUrl = `https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Super_Nintendo_Entertainment_System/master/Named_Boxarts/Street%20Fighter%20II%20Turbo.png`;
        }

        if (manualFallbackUrl) {
          setCurrentSrc(manualFallbackUrl);
          setFallbackAttempt(candidates.length + 1);
        } else {
          setImageError(true);
        }
      }
    } else if (fallbackAttempt > 0 && fallbackAttempt < candidates.length) {
      // If we have remaining libretro candidates, try the next one sequentialy
      setCurrentSrc(candidates[fallbackAttempt]);
      setFallbackAttempt(prev => prev + 1);
    } else if (fallbackAttempt === 0 && candidates.length > 0) {
      // Transition to Libretro (1)
      setCurrentSrc(candidates[0]);
      setFallbackAttempt(1);
    } else {
      // Fallbacks conhecidos para jogos clássicos
      const lowerTitle = game.title.toLowerCase();
      let manualFallbackUrl = '';

      if (lowerTitle.includes('zelda') && sysId === 'nes') {
        manualFallbackUrl = `https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Nintendo_Entertainment_System/master/Named_Boxarts/Legend%20of%20Zelda%2C%20The.png`;
      } else if (lowerTitle.includes('zelda') && lowerTitle.includes('link to the past') && sysId === 'snes') {
        manualFallbackUrl = `https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Super_Nintendo_Entertainment_System/master/Named_Boxarts/Legend%20of%20Zelda%2C%20The%20-%20A%20Link%20to%20the%20Past.png`;
      } else if (lowerTitle.includes('yoshi') && lowerTitle.includes('island') && sysId === 'snes') {
        manualFallbackUrl = `https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Super_Nintendo_Entertainment_System/master/Named_Boxarts/Super%20Mario%20World%202%20-%20Yoshi%27s%20Island.png`;
      } else if (lowerTitle.includes('punch-out') && sysId === 'nes') {
        manualFallbackUrl = `https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Nintendo_Entertainment_System/master/Named_Boxarts/Mike%20Tyson%27s%20Punch-Out%21%21.png`;
      } else if (lowerTitle.includes('double dragon ii') && sysId === 'nes') {
        manualFallbackUrl = `https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Nintendo_Entertainment_System/master/Named_Boxarts/Double%20Dragon%20II%20-%20The%20Revenge.png`;
      } else if (lowerTitle.includes('metroid') && sysId === 'nes') {
        manualFallbackUrl = `https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Nintendo_Entertainment_System/master/Named_Boxarts/Metroid.png`;
      } else if (lowerTitle.includes('street fighter ii turbo') && sysId === 'snes') {
        manualFallbackUrl = `https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Super_Nintendo_Entertainment_System/master/Named_Boxarts/Street%20Fighter%20II%20Turbo.png`;
      }

      if (manualFallbackUrl && currentSrc !== manualFallbackUrl) {
        setCurrentSrc(manualFallbackUrl);
        // prevent looping infinitely
        setFallbackAttempt(candidates.length + 1);
      } else {
        setImageError(true);
      }
    }
  };

  const consoleColorClass = getConsoleColorClass(systemId || '');

  const cleanId = (systemId || '').toLowerCase().trim();
  const isSnes = ['snes', 'supernintendo', 'sfc', 'superfamicom'].includes(cleanId);
  const isSquare = ['ps1', 'psx', 'playstation', 'saturn', 'sega-cd', 'dreamcast', '3do', 'nds', 'ds'].includes(cleanId);

  const cardAspectClass = isSnes 
    ? 'aspect-[4/3]' 
    : isSquare 
    ? 'aspect-[1/1]' 
    : 'aspect-[3/4]';

  return (
    <motion.article
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      whileHover={{ y: -6, transition: { duration: 0.15 } }}
      onClick={() => onViewDetails?.(game)}
      className="group relative flex flex-col bg-[#141418]/90 border border-white/5 rounded-xl overflow-hidden hover:border-red-500/30 hover:shadow-[0_10px_30px_rgba(230,0,18,0.15)] transition-all duration-300 cursor-pointer"
    >
      {/* Visual Game Boxart with Play overlay */}
      <div className={`relative w-full ${cardAspectClass} bg-zinc-950 overflow-hidden border-b border-white/5`}>
        {!imageError && currentSrc ? (
          <img
            src={currentSrc}
            alt={game.title}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={handleImageError}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-65 group-hover:opacity-85"
          />
        ) : (
          /* Premium Fallback CSS custom retro card */
          <div className={`w-full h-full flex flex-col items-center justify-between p-3 bg-gradient-to-br ${consoleColorClass} relative overflow-hidden group`}>
            {/* Ambient shadow gradient */}
            <div className="absolute inset-0 bg-black/45 mix-blend-overlay pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-white/5 pointer-events-none" />
            
            {/* Scanlines overlay effect */}
            <div 
              className="absolute inset-0 opacity-[0.06] pointer-events-none"
              style={{
                backgroundImage: 'linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
                backgroundSize: '100% 4px'
              }}
            />

            {/* Glowing Neon Interrogation Label */}
            <span className="font-mono text-[7px] text-cyan-400/90 tracking-widest uppercase font-black z-10 animate-pulse drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">
              RELÍQUIA RETRO
            </span>

            {/* High-fidelity Neon Holographic CD/Cartridge */}
            <div className="flex-1 flex flex-col items-center justify-center w-full relative">
              {(() => {
                const sId = (systemId || '').toLowerCase();
                const isCd = ['ps1', 'playstation', 'ps2', 'playstation2', 'ps3', 'playstation3', 'dreamcast', 'saturn', 'sega-cd', 'pc-engine-cd'].some(item => sId.includes(item));
                
                if (isCd) {
                  return (
                    /* Holographic Spinning CD */
                    <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-tr from-indigo-500 via-pink-500 to-cyan-400 p-[1px] shadow-[0_0_15px_rgba(244,63,94,0.3)] animate-[spin_8s_linear_infinite] flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                      {/* CD Holographic sheens */}
                      <div className="absolute inset-0.5 rounded-full bg-zinc-950 flex items-center justify-center overflow-hidden">
                        {/* Reflective shine slices */}
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-pink-500/20 to-violet-500/20 animate-pulse" />
                        <div className="absolute -inset-10 bg-[radial-gradient(circle,rgba(255,255,255,0.07)_0%,transparent_60%)]" />
                        <div className="w-6 h-6 rounded-full border border-white/10 bg-zinc-900/90 flex items-center justify-center shadow-inner relative">
                          {/* Center hole */}
                          <div className="w-2.5 h-2.5 rounded-full bg-zinc-950 border border-white/5 flex items-center justify-center text-[8px] text-cyan-400 font-extrabold font-mono">
                            ?
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    /* Holographic Cartridge */
                    <div className="relative w-14 h-16 md:w-16 md:h-18 bg-zinc-900/95 rounded-t-lg rounded-b border border-cyan-400/30 p-1.5 shadow-[0_0_15px_rgba(6,182,212,0.15)] flex flex-col items-center justify-between group-hover:scale-105 transition-transform duration-500">
                      {/* Cartridge ridges */}
                      <div className="w-full flex justify-between gap-0.5 px-0.5 opacity-60">
                        <div className="w-1 h-2.5 bg-zinc-800 rounded-sm border-t border-white/5" />
                        <div className="w-1 h-2.5 bg-zinc-800 rounded-sm border-t border-white/5" />
                        <div className="w-1 h-2.5 bg-zinc-800 rounded-sm border-t border-white/5" />
                      </div>
                      {/* Cartridge Label Space */}
                      <div className="flex-1 w-full bg-gradient-to-tr from-cyan-500/20 via-fuchsia-500/10 to-indigo-500/20 border border-white/10 rounded my-1 flex flex-col items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 via-cyan-500/10 to-purple-500/5 animate-pulse" />
                        <span className="text-sm font-display font-black text-cyan-400/95 drop-shadow-[0_0_4px_rgba(34,211,238,0.7)] animate-bounce">
                          ?
                        </span>
                      </div>
                      {/* Cartridge lower grip */}
                      <div className="w-full h-0.5 bg-cyan-400/20 rounded-full" />
                    </div>
                  );
                }
              })()}
            </div>

            {/* Centered Game Title details */}
            <div className="w-full text-center z-10 px-1 mt-1">
              <span className="font-display font-black text-white text-[10px] md:text-xs uppercase tracking-wide line-clamp-2 leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]">
                {game.title}
              </span>
            </div>
          </div>
        )}
        
        {/* Play game hover state */}
        <div className="absolute inset-0 bg-black/45 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLaunch(game);
            }}
            className="w-12 h-12 rounded-full bg-[#E60012] text-white flex items-center justify-center hover:bg-red-500 transform scale-75 group-hover:scale-100 transition-all shadow-[0_5px_15px_rgba(230,0,18,0.4)] cursor-pointer"
            title={`Jogar ${game.title}`}
          >
            <Play className="w-5 h-5 fill-white ml-0.5" />
          </button>
        </div>

        {/* Favorite marker badge */}
        {game.favorite && (
          <div className="absolute top-2.5 right-2.5 bg-[#E60012] text-white p-1 rounded-full text-xs shadow-md z-10" title="Favorito">
            <Heart className="w-3.5 h-3.5 fill-white text-white" />
          </div>
        )}

        {/* Console brand overlay */}
        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 rounded text-[8px] font-mono font-bold text-zinc-300 tracking-wider z-10">
          {systemName}
        </div>
      </div>

      {/* Game textual Metadata */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display font-extrabold text-sm text-zinc-100 group-hover:text-white group-hover:glow-active transition-colors line-clamp-1">
              {game.title}
            </h3>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
              {game.year}
            </span>
          </div>
          
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="text-[10px] font-sans font-bold text-red-500 tracking-wide uppercase">
              {game.genre}
            </span>
            <span className="text-zinc-600 font-mono text-[9px]">•</span>
            <span className="text-[9px] font-mono text-zinc-400 font-medium line-clamp-1">
              {game.developer}
            </span>
          </div>

          <p className="text-zinc-400 text-xs mt-2 line-clamp-2 leading-relaxed">
            {getRichDescription(game.title, systemName)}
          </p>
        </div>

        {/* Rating Stars indicators */}
        <div className="flex items-center justify-between pt-2.5 border-t border-white/5 mt-auto">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, idx) => (
              <Star
                key={idx}
                className={`w-3 h-3 ${
                  idx < game.rating
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-zinc-700'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails?.(game);
              }}
              className="flex items-center gap-1 text-[9px] font-retro text-zinc-500 hover:text-emerald-400 transition-colors uppercase cursor-pointer"
            >
              Ficha
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLaunch(game);
              }}
              className="flex items-center gap-1 text-[9px] font-retro text-zinc-400 group-hover:text-red-400 tracking-wider font-bold transition-colors uppercase cursor-pointer"
            >
              <span>Jogar</span>
              <Play className="w-2.5 h-2.5 fill-current" />
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
};
