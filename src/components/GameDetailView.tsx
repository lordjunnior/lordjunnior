/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { System, Game } from '../types';
import { getGameScreenshots } from '../utils/routeUtils';
import { soundEngine } from './RetroSoundEngine';
import { useGameData } from '../hooks/useGameData';
import { 
  ArrowLeft, 
  Star, 
  Calendar, 
  Users, 
  Tag, 
  Cpu, 
  Heart, 
  Play, 
  Maximize2, 
  X, 
  Info,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Gamepad
} from 'lucide-react';
import { EmulatorPlayer } from './EmulatorPlayer';
import { getGameGameplayVideoUrl } from '../utils/videoResolver';
import { getRichDescription } from './GamelistView';

interface GameDetailViewProps {
  system: System;
  game: Game;
  onBack: () => void;
  onNavigateToPath: (path: string) => void;
  isMuted: boolean;
  toggleMute: () => void;
}

const getLogoFileName = (id: string): string => {
  const map: Record<string, string> = {
    nes: 'nes',
    snes: 'snes',
    n64: 'n64',
    gb: 'gb',
    gba: 'gba',
    sms: 'mastersystem',
    genesis: 'megadrive',
    saturn: 'saturn',
    ps1: 'psx',
    atari: 'atari2600',
    arcade: 'arcade',
    neogeo: 'neogeo',
    nds: 'nds',
    pce: 'pcengine',
    '3do': '3do'
  };
  return map[id] || id;
};

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

export const GameDetailView: React.FC<GameDetailViewProps> = ({
  system,
  game,
  onBack,
  onNavigateToPath,
  isMuted,
  toggleMute,
}) => {
  // RAWG integration has been disabled to prevent mismatching modern game images and descriptions
  // We strictly load 100% authentic, localized offline-compiled descriptions and vector cards
  const rawgData = null as any;
  const rawgLoading = false;

  const candidates = useMemo(() => {
    return getLibretroCandidates(game.title, system.id || '');
  }, [game.title, system.id]);

  const [coverSrc, setCoverSrc] = useState<string>('');
  const [fallbackAttempt, setFallbackAttempt] = useState<number>(0);

  useEffect(() => {
    if (candidates.length > 0) {
      setCoverSrc(candidates[0]);
      setFallbackAttempt(1);
    } else {
      setCoverSrc(game.image || '');
      setFallbackAttempt(0);
    }
  }, [game, candidates]);

  const handleCoverError = () => {
    if (fallbackAttempt > 0 && fallbackAttempt < candidates.length) {
      setCoverSrc(candidates[fallbackAttempt]);
      setFallbackAttempt(prev => prev + 1);
    } else {
      setCoverSrc(game.image || '');
    }
  };

  const screenshots = rawgData?.screenshots && rawgData.screenshots.length > 0
    ? rawgData.screenshots
    : getGameScreenshots(game.genre);

  const [activeScreenshot, setActiveScreenshot] = useState(0);
  const [zoomedScreenshot, setZoomedScreenshot] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(game.favorite);
  const [isPlayingMock, setIsPlayingMock] = useState(false);
  const [mockScore, setMockScore] = useState(0);
  const [mockLives, setMockLives] = useState(3);
  const [loadingPlay, setLoadingPlay] = useState(false);
  const [logoError, setLogoError] = useState(false);

  // Auto-reset active screenshot index on game swap
  useEffect(() => {
    setActiveScreenshot(0);
  }, [game]);

  // Auto-increment score in play mockup
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlayingMock) {
      interval = setInterval(() => {
        setMockScore(prev => prev + Math.floor(Math.random() * 50) + 10);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlayingMock]);

  const handleBack = () => {
    soundEngine.playBack();
    onBack();
  };

  const handleToggleFavorite = () => {
    soundEngine.playToggle();
    setIsFavorite(!isFavorite);
    game.favorite = !game.favorite; // Mutate local reference for the mock instance
  };

  const handlePlayMock = () => {
    soundEngine.playSelect();
    setLoadingPlay(true);
    setTimeout(() => {
      setLoadingPlay(false);
      setIsPlayingMock(true);
      setMockScore(0);
      setMockLives(3);
    }, 1500);
  };

  const handleClosePlayMock = () => {
    soundEngine.playBack();
    setIsPlayingMock(false);
  };

  // Keyboard support for details view
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPlayingMock) {
        if (e.key === 'Escape') {
          handleClosePlayMock();
        }
        return;
      }
      if (zoomedScreenshot) {
        if (e.key === 'Escape') {
          setZoomedScreenshot(null);
        }
        return;
      }

      if (e.key === 'Backspace' || e.key === 'Escape') {
        handleBack();
      } else if (e.key === 'Enter') {
        handlePlayMock();
      } else if (e.key.toLowerCase() === 'f') {
        handleToggleFavorite();
      } else if (e.key === 'ArrowRight') {
        setActiveScreenshot(prev => (prev + 1) % screenshots.length);
        soundEngine.playMove();
      } else if (e.key === 'ArrowLeft') {
        setActiveScreenshot(prev => (prev - 1 + screenshots.length) % screenshots.length);
        soundEngine.playMove();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlayingMock, zoomedScreenshot, isFavorite, screenshots]);

  return (
    <div id="game-detail-parent" className="relative w-full h-screen font-sans text-white overflow-y-auto bg-zinc-950 flex flex-col justify-between">
      
      {/* Immersive blurred background using game main image */}
      <div className="absolute inset-0 z-0 h-full w-full pointer-events-none overflow-hidden">
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center opacity-10 blur-xl scale-110"
          style={{ backgroundImage: `url(${coverSrc || game.image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/70 via-zinc-950/95 to-zinc-950" />
      </div>

      {/* Top Header Panel */}
      <header id="detail-header" className="relative z-10 h-18 flex items-center justify-between px-4 sm:px-10 border-b border-white/5 bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            id="btn-back-gamelist"
            onClick={handleBack}
            className="group flex items-center gap-2 text-[10px] sm:text-xs font-retro tracking-widest text-white bg-[#E60012] hover:bg-red-500 border border-red-400 hover:border-red-300 rounded-lg px-2.5 py-1.5 sm:px-4 sm:py-2 shadow-[0_4px_0_0_#91000B] hover:shadow-[0_2px_0_0_#91000B] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer font-black"
          >
            <div className="w-4 h-4 rounded-full bg-zinc-950 text-red-500 flex items-center justify-center text-[10px] font-retro border border-white/25 group-hover:scale-110 transition-transform">
              B
            </div>
            <span>VOLTAR</span>
          </button>
          
          <div className="h-4 w-px bg-white/15" />
          
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold text-zinc-500 font-mono tracking-wider">{system.name}</span>
            <span className="text-zinc-700">/</span>
            <span className="text-xs text-emerald-400 font-bold max-w-[200px] truncate">{game.title}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Quick Stats Indicator Badge */}
          <div className="hidden md:flex items-center gap-1.5 bg-zinc-900 border border-white/10 px-3 py-1 rounded-full text-xs text-zinc-400">
            <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
            <span>Core: {system.emulatorCore.toUpperCase()}</span>
          </div>
          
          <button
            id="btn-detail-fav"
            onClick={handleToggleFavorite}
            className={`p-2 rounded-full border transition cursor-pointer flex items-center justify-center ${
              isFavorite 
                ? 'bg-red-500/15 border-red-500/30 text-red-500 hover:bg-red-500/25' 
                : 'bg-zinc-900 border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500' : ''}`} />
          </button>
        </div>
      </header>

      {/* Main Grid Content container */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-6 py-8 flex flex-col justify-start gap-8">
        
        {/* Dynamic Entry Animation Container */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
        >
          
          {/* Left Column: Cover & System (4 columns) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Boxart Widescreen Deck Component */}
            <div id="cover-card" className="relative group border border-white/10 rounded-3xl overflow-hidden shadow-2xl bg-zinc-950 aspect-[4/3] flex items-stretch">
              
              <div className="flex-1 relative bg-black overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.95)]">
                {rawgLoading && !coverSrc ? (
                  <div className="absolute inset-0 bg-zinc-950 flex flex-col items-center justify-center gap-2 z-10">
                    <div className="w-8 h-8 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
                    <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">Buscando Capa...</span>
                  </div>
                ) : (
                  <>
                    {/* The Video Stream Gameplay Screen of the Game */}
                    <video
                      key={`game-video-${game.title}`}
                      src={getGameGameplayVideoUrl(system.id, game.title)}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover opacity-90 transition-opacity absolute inset-0 z-10"
                      onError={(e) => {
                        // Fallback completely to cover art on error
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />

                    {/* Cover poster image as default background or if video fails */}
                    <img
                      id="main-cover-image"
                      src={coverSrc || game.image || undefined}
                      alt={game.title}
                      onError={handleCoverError}
                      className="absolute inset-0 w-full h-full object-cover z-0"
                    />
                  </>
                )}

                {/* Glass Reflection Curve Overlay & vignette */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-white/[0.08] pointer-events-none z-20" />
                
                {/* Modern Inner Bezel Shadow */}
                <div className="absolute inset-0 shadow-[inset_0_0_25px_rgba(0,0,0,0.85)] pointer-events-none z-20" />
                
                {/* Elegant Phosphor Scanlines overlay */}
                <div 
                  className="absolute inset-0 pointer-events-none opacity-15 mix-blend-overlay z-20"
                  style={{
                    backgroundImage: 'linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.15) 50%)',
                    backgroundSize: '100% 4px'
                  }}
                />

                {/* Star rating overlay indicator */}
                <div className="absolute top-3 left-3 bg-zinc-950/85 backdrop-blur-sm px-2 py-1 rounded-full border border-white/10 flex items-center gap-1 shadow-lg z-30">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  <span className="text-[10px] font-black font-mono leading-none">
                    {rawgLoading ? '...' : (rawgData?.rating ? rawgData.rating.toFixed(1) : `${game.rating}.0`)}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Specs Bento Card */}
            <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-5 space-y-4 backdrop-blur-sm">
              <h3 className="text-xs font-retro text-zinc-500 uppercase tracking-wider mb-2">Especificações</h3>
              
              <div className="grid grid-cols-2 gap-3 text-xs leading-tight">
                <div className="bg-zinc-950/40 p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider block">Ano</span>
                  <span className="font-semibold text-zinc-200 mt-1 block flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                    {game.year}
                  </span>
                </div>
                
                <div className="bg-zinc-950/40 p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider block">Gênero</span>
                  {rawgLoading ? (
                    <div className="h-4 bg-zinc-800/60 rounded animate-pulse w-full mt-1" />
                  ) : (
                    <span className="font-semibold text-emerald-400 mt-1 block flex items-center gap-2 truncate" title={rawgData?.genres && rawgData.genres.length > 0 ? rawgData.genres.join(', ') : game.genre}>
                      <Tag className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span className="truncate">{rawgData?.genres && rawgData.genres.length > 0 ? rawgData.genres.join(', ') : game.genre}</span>
                    </span>
                  )}
                </div>

                <div className="bg-zinc-950/40 p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider block">Dispositivos</span>
                  <span className="font-semibold text-zinc-200 mt-1 block flex items-center gap-2 truncate">
                    <Users className="w-3.5 h-3.5 text-zinc-500" />
                    {game.players}
                  </span>
                </div>

                <div className="bg-zinc-950/40 p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider block">Desenvolvedora</span>
                  {rawgLoading ? (
                    <div className="h-4 bg-zinc-800/60 rounded animate-pulse w-5/6 mt-1" />
                  ) : (
                    <span className="font-semibold text-zinc-200 mt-1 block truncate" title={rawgData?.developers && rawgData.developers.length > 0 ? rawgData.developers.join(', ') : game.developer}>
                      {rawgData?.developers && rawgData.developers.length > 0 ? rawgData.developers.join(', ') : game.developer}
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 text-[11px] text-zinc-500 font-mono flex justify-between items-center">
                <span>Publicadora:</span>
                {rawgLoading ? (
                  <div className="h-3 bg-zinc-800/60 rounded animate-pulse w-16" />
                ) : (
                  <span className="text-zinc-300 font-semibold truncate max-w-[150px]" title={rawgData?.publishers && rawgData.publishers.length > 0 ? rawgData.publishers.join(', ') : game.publisher}>
                    {rawgData?.publishers && rawgData.publishers.length > 0 ? rawgData.publishers.join(', ') : game.publisher}
                  </span>
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Title, Description, Screenshots & Actions (8 columns) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Title & Description Panel */}
            <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 sm:p-8 backdrop-blur-sm space-y-4">
              <div>
                <span id="detail-system-ribbon" className="px-3 py-1 text-[10px] font-retro uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                  Plataforma: {system.name}
                </span>
                <h1 id="detail-title" className="text-3xl sm:text-5xl font-display font-black tracking-tight text-white mt-4 leading-none">
                  {game.title}
                </h1>
              </div>

              {rawgLoading ? (
                <div className="space-y-2 py-1">
                  <div className="h-4 bg-zinc-850 rounded animate-pulse w-full" />
                  <div className="h-4 bg-zinc-850 rounded animate-pulse w-11/12" />
                  <div className="h-4 bg-zinc-850 rounded animate-pulse w-5/6" />
                  <div className="h-4 bg-zinc-850 rounded animate-pulse w-3/4" />
                </div>
              ) : (
                <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
                  {rawgData?.description || getRichDescription(game.title, system.name, game.description)}
                </p>
              )}

              <div className="flex gap-2">
                {Array.from({ length: 5 }).map((_, i) => {
                  const currentRating = rawgLoading 
                    ? game.rating 
                    : (rawgData?.rating ? Math.round(rawgData.rating) : game.rating);
                  return (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${
                        i < currentRating 
                          ? 'text-yellow-400 fill-yellow-400' 
                          : 'text-zinc-800'
                      }`} 
                    />
                  );
                })}
              </div>
            </div>

            {/* Screenshots Gallery Section */}
            <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 backdrop-blur-sm space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-retro text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <span>Capturas de Tela</span>
                  <span className="text-[10px] font-mono lowercase text-zinc-600 font-normal">(screenshots)</span>
                </h4>
                <span className="text-xs font-mono text-zinc-500">
                  {rawgLoading ? (
                    'Carregando...'
                  ) : (
                    `Slide ${activeScreenshot + 1} de ${screenshots.length}`
                  )}
                </span>
              </div>

              {/* Large Active Screenshot View */}
              <div className="relative aspect-[16/9] border border-white/10 rounded-xl overflow-hidden shadow-lg bg-black">
                {rawgLoading && !rawgData?.screenshots ? (
                  <div className="absolute inset-0 bg-zinc-950 flex items-center justify-center animate-pulse">
                    <span className="text-zinc-600 text-xs font-mono uppercase tracking-widest">Carregando screenshots...</span>
                  </div>
                ) : (
                  <>
                    <img
                      src={screenshots[activeScreenshot] || undefined}
                      alt={`${game.title} screenshot ${activeScreenshot + 1}`}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Image Navigation overlays */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex justify-between items-center">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setActiveScreenshot(prev => (prev - 1 + screenshots.length) % screenshots.length);
                            soundEngine.playMove();
                          }}
                          className="p-1.5 rounded bg-black/60 hover:bg-white/10 text-white border border-white/5 transition hover:scale-105 active:scale-95 cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setActiveScreenshot(prev => (prev + 1) % screenshots.length);
                            soundEngine.playMove();
                          }}
                          className="p-1.5 rounded bg-black/60 hover:bg-white/10 text-white border border-white/5 transition hover:scale-105 active:scale-95 cursor-pointer"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          soundEngine.playToggle();
                          setZoomedScreenshot(screenshots[activeScreenshot]);
                        }}
                        className="flex items-center gap-1.5 bg-black/60 hover:bg-white/15 px-3 py-1.5 border border-white/15 rounded text-xs transition cursor-pointer"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>Maximizar</span>
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Tiny thumbnails selectors */}
              <div className="grid grid-cols-3 gap-3">
                {rawgLoading && !rawgData?.screenshots ? (
                  Array.from({ length: 3 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-[16/9] rounded-lg overflow-hidden border border-white/5 bg-zinc-900 animate-pulse"
                    />
                  ))
                ) : (
                  screenshots.map((shot, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setActiveScreenshot(idx);
                        soundEngine.playMove();
                      }}
                      className={`relative aspect-[16/9] rounded-lg overflow-hidden border cursor-pointer transition ${
                        idx === activeScreenshot 
                          ? 'border-emerald-500 ring-2 ring-emerald-500/20' 
                          : 'border-white/5 opacity-60 hover:opacity-100 hover:border-white/20'
                      }`}
                    >
                      <img src={shot || undefined} alt="Thumb" className="w-full h-full object-cover" />
                    </div>
                  ))
                )}
              </div>

            </div>

            {/* Large Interactive Launch Action */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 bg-gradient-to-r from-emerald-500/5 to-transparent border border-emerald-500/10 rounded-2xl">
              <div className="text-center sm:text-left">
                <p className="text-emerald-400 font-retro text-[8px] tracking-wider mb-1 uppercase">Emulação Disponível</p>
                <div className="text-xs text-zinc-400 font-mono">
                  Pronto para excitar nostalgia. Arquivo: <span className="text-zinc-200">{game.title}.zip</span>
                </div>
              </div>

              <button
                id="btn-launch-game-detail"
                onClick={handlePlayMock}
                disabled={loadingPlay}
                className="w-full sm:w-auto px-12 py-5 bg-gradient-to-r from-emerald-400 to-emerald-600 hover:from-emerald-300 hover:to-emerald-500 text-zinc-950 font-retro text-xs rounded-full shadow-[0_6px_25px_rgba(16,185,129,0.3)] border-t border-white/30 hover:scale-[1.03] active:scale-[0.98] transition-all font-bold tracking-wider flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
              >
                {loadingPlay ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-zinc-950 border-t-transparent animate-spin" />
                    <span>CARREGANDO...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-zinc-950 text-zinc-950" />
                    <span>JOGAR AGORA</span>
                  </>
                )}
              </button>
            </div>

          </div>

        </motion.div>

      </main>

      {/* Footer Navigation guide */}
      <footer className="relative z-10 w-full bg-zinc-900/60 backdrop-blur-md border-t border-white/5 py-4 px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-zinc-400 text-xs font-mono">
        <div>
          Visualizando banco de dados de retro-emulação. Todos os dados são mockados localmente sob licença MIT.
        </div>
        <div className="flex items-center gap-4 text-[10px] font-retro text-zinc-500">
          <span className="flex items-center gap-1"><span className="bg-zinc-800 text-zinc-200 px-1 py-0.5 rounded text-[8px]">←→</span> Imagens</span>
          <span className="flex items-center gap-1"><span className="bg-zinc-800 text-zinc-200 px-1 py-0.5 rounded text-[8px]">F</span> Favoritar</span>
          <span className="flex items-center gap-1"><span className="bg-zinc-800 text-zinc-200 px-1 py-0.5 rounded text-[8px]">ESC</span> Voltar</span>
        </div>
      </footer>

      {/* Screen Zoom Modal */}
      <AnimatePresence>
        {zoomedScreenshot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomedScreenshot(null)}
            className="fixed inset-0 bg-black/90 z-[3000] flex items-center justify-center p-4 cursor-zoom-out"
          >
            <button
              onClick={() => setZoomedScreenshot(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-black/60 border border-white/10 text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
            <motion.img
              initial={{ scale: 0.92 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.92 }}
              src={zoomedScreenshot || undefined}
              alt="Zoomed Screenshot"
              className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl border border-white/10 shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Simulated Gameplay Screen Playback Loop Mock */}
      <AnimatePresence>
        {isPlayingMock && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="fixed inset-0 bg-zinc-950/98 z-[2500] flex flex-col justify-between p-2 md:p-6"
          >
            <EmulatorPlayer
              system={system}
              game={game}
              onClose={handleClosePlayMock}
            />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
