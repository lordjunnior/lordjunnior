/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Game } from '../types';

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
      <div className="absolute inset-0 bg-zinc-900 flex flex-col items-center justify-center p-3 text-center select-none">
        <span className="font-retro text-[8px] text-zinc-500 uppercase tracking-widest leading-tight line-clamp-3 px-1">
          {game.title}
        </span>
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
