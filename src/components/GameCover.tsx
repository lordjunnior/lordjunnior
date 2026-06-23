/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Game } from '../types';
import { EXACT_ROM_MAPPINGS } from '../utils/romResolver';

const getLibretroSystemFolderName = (systemId: string): string => {
  const cleanId = (systemId || '').toLowerCase();
  const map: Record<string, string> = {
    nes: 'Nintendo_-_Nintendo_Entertainment_System',
    snes: 'Nintendo_-_Super_Nintendo_Entertainment_System',
    n64: 'Nintendo_-_Nintendo_64',
    gb: 'Nintendo_-_Game_Boy',
    gbc: 'Nintendo_-_Game_Boy_Color',
    gba: 'Nintendo_-_Game_Boy_Advance',
    sms: 'Sega_-_Master_System',
    mastersystem: 'Sega_-_Master_System',
    genesis: 'Sega_-_Mega_Drive_-_Genesis',
    megadrive: 'Sega_-_Mega_Drive_-_Genesis',
    gamegear: 'Sega_-_Game_Gear',
    ps1: 'Sony_-_PlayStation',
    psx: 'Sony_-_PlayStation',
    atari: 'Atari_-_2600',
    atari2600: 'Atari_-_2600',
    nds: 'Nintendo_-_Nintendo_DS',
    pce: 'NEC_-_PC_Engine_-_TurboGrafx-16',
    pcengine: 'NEC_-_PC_Engine_-_TurboGrafx-16',
    '3do': 'The_3DO_Company_-_3DO',
  };
  return map[cleanId] || '';
};

const getLibretroCandidates = (title: string, systemId: string): string[] => {
  const folder = getLibretroSystemFolderName(systemId);
  if (!folder) return [];

  const candidates: string[] = [];
  const baseTitle = title.trim();

  const cleanBase = (t: string, customClean: boolean): string => {
    let s = t;
    if (customClean) s = s.replace(/:/g, ' -');
    s = s.replace(/\s\x27N\s/g, " 'n ").replace(/\s\x27n\s/g, " 'n ").replace(/[/*?"<>|]/g, '');
    return s;
  };

  // Add the high-precision mapped No-Intro filename as candidates if present
  const exactFile = EXACT_ROM_MAPPINGS[systemId.toLowerCase()]?.[baseTitle];
  if (exactFile) {
    const cleanFileName = exactFile.replace(/\.(zip|7z|bin|sfc|nes|gba|gb|gbc)$/i, '');
    candidates.push(cleanFileName);
    candidates.push(cleanBase(cleanFileName, true));
  }

  const suffixes = ['', ' (USA)', ' (USA, Europe)', ' (Europe)', ' (Japan)', ' (World)'];

  for (const sfx of suffixes) candidates.push(cleanBase(baseTitle + sfx, false));
  for (const sfx of suffixes) candidates.push(cleanBase(baseTitle + sfx, true));

  return Array.from(new Set(candidates)).map(c => 
    `https://raw.githubusercontent.com/libretro-thumbnails/${folder}/master/Named_Boxarts/${encodeURIComponent(c)}.png`
  );
};

interface GameCoverProps {
  game: Game;
  systemId: string;
  className?: string;
}

export const GameCover: React.FC<GameCoverProps> = ({ game, systemId, className }) => {
  const candidates = useMemo(() => {
    let cleanTitle = game.title.replace(/\(PT-BR\)/gi, '').replace(/\[PT-BR\]/gi, '').replace(/\(Traduzido\)/gi, '').replace(/\[Traduzido\]/gi, '').trim();
    if (cleanTitle.toLowerCase().startsWith('the ')) {
      const coreName = cleanTitle.substring(4).trim();
      cleanTitle = `${coreName}, The`;
    }
    return getLibretroCandidates(cleanTitle, systemId);
  }, [game.title, systemId]);

  const [src, setSrc] = useState<string>('');
  const [attempt, setAttempt] = useState<number>(0);
  const [loaded, setLoaded] = useState(false);
  const [isFatalError, setIsFatalError] = useState(false);

  useEffect(() => {
    setIsFatalError(false);
    setLoaded(false);
    if (game.image) {
      setSrc(game.image);
      setAttempt(0);
    } else if (candidates.length > 0) {
      setSrc(candidates[0]);
      setAttempt(1);
    } else {
      setSrc('');
      setIsFatalError(true);
    }
  }, [game, candidates]);

  const handleError = () => {
    if (attempt === 0) {
      if (candidates.length > 0) {
        setSrc(candidates[0]);
        setAttempt(1);
      } else {
        setIsFatalError(true);
        setLoaded(true);
      }
    } else if (attempt > 0 && attempt < candidates.length) {
      setSrc(candidates[attempt]);
      setAttempt(prev => prev + 1);
    } else {
      setIsFatalError(true);
      setLoaded(true);
    }
  };

  if (isFatalError || !src) {
    return (
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-zinc-850 to-zinc-950 flex flex-col justify-between p-3.5 text-center select-none border border-white/5 shadow-2xl overflow-hidden rounded-md">
        {/* Top retro striped ribbon */}
        <div className="w-full flex flex-col items-center gap-1">
          <div className="h-1 w-full bg-gradient-to-r from-red-500 via-amber-400 via-emerald-400 to-indigo-500 rounded-full opacity-80" />
          <span className="font-mono text-[6px] text-zinc-500 uppercase tracking-widest">
            ★ ORIGINAL SYSTEM CART ★
          </span>
        </div>

        {/* Center Game Title Area */}
        <div className="my-auto px-1 flex flex-col items-center justify-center gap-1.5">
          <span className="font-sans font-bold text-[10px] md:text-[11px] text-zinc-100 uppercase tracking-normal leading-tight line-clamp-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {game.title}
          </span>
          <div className="w-8 h-[1px] bg-white/10" />
          <span className="font-mono text-[7px] text-zinc-450 font-medium">
            {game.genre || 'CLASSIC ROM'}
          </span>
        </div>

        {/* Brand new Classic Quality / Warranty Seal mimicking vintage badges */}
        <div className="flex flex-col items-center">
          <div className="relative w-12 h-12 flex flex-col items-center justify-center rounded-full bg-gradient-to-br from-amber-600 via-yellow-400 via-amber-500 to-amber-700 shadow-lg border border-yellow-300/30 p-0.5 animate-[pulse_3s_infinite]">
            {/* Dashed outer alignment ring */}
            <div className="absolute inset-0.5 rounded-full border border-dashed border-amber-900/40" />
            
            <div className="flex flex-col items-center justify-center z-10 text-amber-950">
              <span className="text-[5px] font-sans font-extrabold uppercase tracking-tight leading-none scale-90">
                OFFICIAL
              </span>
              <div className="flex items-center justify-center my-0.5">
                <span className="text-[5px] text-amber-950 leading-none">★</span>
                <span className="text-[6px] font-mono font-bold leading-none mx-0.5">TECA</span>
                <span className="text-[5px] text-amber-950 leading-none">★</span>
              </div>
              <span className="text-[4px] font-sans font-bold uppercase tracking-tight leading-none scale-75 opacity-90">
                SEAL OF QUALITY
              </span>
            </div>
          </div>
          
          <span className="font-mono text-[5.5px] text-zinc-500 uppercase tracking-widest mt-1.5 leading-none">
            GARANTIA INTERNACIONAL
          </span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt=""
      onError={handleError}
      onLoad={() => setLoaded(true)}
      className={`${className} transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      loading="lazy"
      referrerPolicy="no-referrer"
    />
  );
};

export default GameCover;
