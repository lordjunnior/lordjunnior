/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { System, Game } from '../types';
import { soundEngine } from './RetroSoundEngine';
import { getGameGameplayVideoUrl } from '../utils/videoResolver';
import { getGameLogoUrl } from '../utils/logoResolver';
import { EmulatorPlayer } from './EmulatorPlayer';
import { 
  ArrowLeft, 
  Search, 
  Star, 
  Calendar, 
  Users, 
  Tag, 
  Heart, 
  Play, 
  Gamepad2
} from 'lucide-react';

interface GamelistViewProps {
  system: System;
  onBack: () => void;
  isMuted: boolean;
  toggleMute: () => void;
}

const GameLogo: React.FC<{ title: string; imagePath?: string }> = ({ title, imagePath }) => {
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    setHasError(false);
  }, [title, imagePath]);

  const wikiLogo = getGameLogoUrl(title);

  if (imagePath && !hasError) {
    return (
      <motion.img
        key={`local-logo-${title}`}
        initial={{ opacity: 0, scale: 0.85, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.85, y: -10 }}
        transition={{ duration: 0.3 }}
        src={imagePath}
        alt={`${title} Logo`}
        className="max-h-[65%] max-w-[85%] object-contain filter drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]"
        onError={() => setHasError(true)}
      />
    );
  }

  if (wikiLogo) {
    return (
      <motion.img
        key={`wiki-logo-${title}`}
        initial={{ opacity: 0, scale: 0.85, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.85, y: -10 }}
        transition={{ duration: 0.3 }}
        src={wikiLogo}
        alt={`${title} Logo`}
        className="max-h-[65%] max-w-[85%] object-contain filter drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]"
      />
    );
  }

  return (
    <motion.div
      key={`typographical-${title}`}
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -10 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center p-6 bg-black/45 backdrop-blur-sm border border-white/5 rounded-2xl max-w-[85%]"
    >
      <h2 className="text-lg sm:text-2xl font-display font-black uppercase tracking-tighter text-white drop-shadow-[0_3px_8px_rgba(0,0,0,0.95)] bg-gradient-to-r from-amber-400 via-rose-500 to-red-500 bg-clip-text text-transparent filter saturate-125 text-center px-4 leading-tight">
        {title}
      </h2>
    </motion.div>
  );
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
    s = s.replace(/\s\x27N\s/g, " 'n ");
    s = s.replace(/\s\x27n\s/g, " 'n ");
    s = s.replace(/[/*?"<>|]/g, '');
    return s;
  };

  const suffixes = ['', ' (USA)', ' (USA, Europe)', ' (Europe)', ' (Japan)', ' (World)'];

  if (baseTitle.toLowerCase() === "the need for speed") {
    candidates.push("Road _ Track Presents - The Need for Speed (USA)");
    candidates.push("Need For Speed, The (USA)");
  }

  for (const sfx of suffixes) candidates.push(cleanBase(baseTitle + sfx, false));
  for (const sfx of suffixes) candidates.push(cleanBase(baseTitle + sfx, true));

  return Array.from(new Set(candidates)).map(c => 
    `https://raw.githubusercontent.com/libretro-thumbnails/${folder}/master/Named_Boxarts/${encodeURIComponent(c)}.png`
  );
};

// Componente de Capa atualizado com a Higienização de Strings PT-BR por Regex para matar o erro 404
const GameCover: React.FC<{ game: Game; systemId: string; className?: string }> = ({ game, systemId, className }) => {
  const candidates = useMemo(() => {
    // Sanitização em tempo real das marcas do acervo do Drive antes da busca externa
    const cleanTitle = game.title
      .replace(/\(PT-BR\)/gi, '')
      .replace(/\[PT-BR\]/gi, '')
      .replace(/\(Traduzido\)/gi, '')
      .replace(/\[Traduzido\]/gi, '')
      .trim();
      
    return getLibretroCandidates(cleanTitle, systemId);
  }, [game.title, systemId]);

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
    } else {
      setSrc(game.image || '');
      setAttempt(0);
    }
  }, [game, candidates]);

  const handleError = () => {
    if (attempt > 0 && attempt < candidates.length) {
      setSrc(candidates[attempt]);
      setAttempt(prev => prev + 1);
    } else if (src !== game.image && game.image) {
      setSrc(game.image);
      setAttempt(0);
    } else {
      // Trava estritamente o estado para bloquear requisições infinitas em loop de falha
      setIsFatalError(true);
      setLoaded(true);
    }
  };

  if (isFatalError || !src) {
    return (
      <div className="absolute inset-0 bg-zinc-900 border border-white/5 rounded-xl flex flex-col items-center justify-center p-4 text-center select-none">
        <Gamepad2 className="w-8 h-8 text-zinc-700 stroke-1 mb-1" />
        <span className="font-mono text-[9px] text-zinc-500 uppercase font-bold tracking-wider line-clamp-2 px-2">
          {game.title}
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden flex items-center justify-center bg-zinc-950">
      <img
        src={src}
        alt=""
        onError={handleError}
        onLoad={() => setLoaded(true)}
        className={`${className} transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        loading="lazy"
        referrerPolicy="no-referrer"
      />
      {!loaded && (
        <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center">
          <Gamepad2 className="w-5 h-5 text-zinc-600 animate-pulse" />
        </div>
      )}
    </div>
  );
};

export const GamelistView: React.FC<GamelistViewProps> = ({
  system,
  onBack,
  isMuted,
  toggleMute,
}) => {
  const [selectedGameIndex, setSelectedGameIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [emulatingGame, setEmulatingGame] = useState<Game | null>(null);
  
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const listContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredGames = useMemo(() => {
    return system.games.filter(game => {
      const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            game.genre.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFavorite = filterFavorites ? game.favorite : true;
      return matchesSearch && matchesFavorite;
    });
  }, [system.games, searchTerm, filterFavorites]);

  const selectedGame = filteredGames[selectedGameIndex] || null;

  // Refs de sincronização contra escopos desatualizados (Stale Closures)
  const filteredGamesRef = useRef(filteredGames);
  const selectedGameIndexRef = useRef(selectedGameIndex);
  const emulatingGameRef = useRef(emulatingGame);

  useEffect(() => { filteredGamesRef.current = filteredGames; }, [filteredGames]);
  useEffect(() => { selectedGameIndexRef.current = selectedGameIndex; }, [selectedGameIndex]);
  useEffect(() => { emulatingGameRef.current = emulatingGame; }, [emulatingGame]);

  useEffect(() => {
    setVideoLoaded(false);
    setVideoError(false);
  }, [selectedGame]);

  const handleBack = () => {
    soundEngine.playBack();
    onBack();
  };

  const handleGameClick = (index: number, game: Game) => {
    if (index === selectedGameIndexRef.current) {
      soundEngine.playSelect();
      setEmulatingGame(game);
    } else if (index >= 0 && index < filteredGamesRef.current.length) {
      setSelectedGameIndex(index);
      soundEngine.playMove();
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }
  };

  const selectGame = (index: number) => {
    if (index !== selectedGameIndexRef.current && index >= 0 && index < filteredGamesRef.current.length) {
      setSelectedGameIndex(index);
      soundEngine.playMove();
    }
  };

  const handleLaunchGame = (game: Game) => {
    soundEngine.playSelect();
    setEmulatingGame(game);
  };

  const handleCloseEmulator = () => {
    soundEngine.playBack();
    setEmulatingGame(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement === searchInputRef.current) {
        if (e.key === 'Enter') searchInputRef.current?.blur();
        return;
      }

      if (emulatingGameRef.current) {
        if (e.key === 'Escape') handleCloseEmulator();
        return;
      }

      const currentGames = filteredGamesRef.current;
      const currentIndex = selectedGameIndexRef.current;

      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        if (currentGames.length > 0) {
          const nextIndex = (currentIndex - 1 + currentGames.length) % currentGames.length;
          selectGame(nextIndex);
        }
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        if (currentGames.length > 0) {
          const nextIndex = (currentIndex + 1) % currentGames.length;
          selectGame(nextIndex);
        }
      } else if (e.key === 'Escape' || e.key === 'Backspace') {
        e.preventDefault();
        handleBack();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const currentGame = currentGames[currentIndex];
        if (currentGame) {
          handleLaunchGame(currentGame);
        }
      } else if (e.key.toLowerCase() === 'f') {
        soundEngine.playToggle();
        setFilterFavorites(prev => !prev);
        setSelectedGameIndex(0);
      } else if (e.key.toLowerCase() === 'm') {
        toggleMute();
        soundEngine.playToggle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleMute]);

  useEffect(() => {
    if (listContainerRef.current) {
      const activeEl = listContainerRef.current.children[selectedGameIndex] as HTMLElement;
      if (activeEl) {
        const offsetLeft = activeEl.offsetLeft;
        const width = activeEl.clientWidth;
        const containerWidth = listContainerRef.current.clientWidth;
        listContainerRef.current.scrollTo({
          left: offsetLeft - containerWidth / 2 + width / 2,
          behavior: 'smooth'
        });
      }
    }
  }, [selectedGameIndex]);

  return (
    <motion.div 
      id="gamelist-container" 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="relative w-full h-screen font-sans text-white overflow-hidden bg-gradient-to-b from-[#0e0e11] to-[#040405] flex flex-col justify-between"
    >
      {/* Background decoration - Tratamento com pointer-events-none para liberar cliques */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center opacity-[0.04] blur-2xl scale-105 pointer-events-none"
          style={{ backgroundImage: `url(${system.backgroundImage})` }}
        />
        <div className="absolute inset-0 bg-zinc-950/90 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(230,0,18,0.15),transparent_65%)] pointer-events-none" />
      </div>

      {/* Top Console Command Header */}
      <header className="relative z-30 h-16 flex items-center justify-between px-6 md:px-10 border-b border-white/5 bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button
            id="gamelist-back-btn"
            onClick={handleBack}
            className="group flex items-center gap-2 text-[10px] sm:text-xs font-retro tracking-widest text-white bg-[#E60012] hover:bg-red-500 border border-red-500 hover:border-red-400 rounded-full px-4 py-2 transition-all cursor-pointer font-black shadow-[0_4px_14px_rgba(230,0,18,0.3)] hover:shadow-[0_6px_20px_rgba(230,0,18,0.4)]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>VOLTAR</span>
          </button>
          
          <div className="h-4 w-px bg-white/10" />
          
          <div className="flex items-center gap-3">
            <span className="font-retro text-sm text-[11px] text-red-500 font-extrabold px-2 py-0.5 rounded border border-red-500/35 uppercase tracking-widest bg-red-500/5">
              {system.logo}
            </span>
            <span className="text-[10px] font-mono text-zinc-500 hidden md:inline uppercase tracking-widest">
              {filteredGames.length} / {system.gameCount} Jogos Mapeados
            </span>
          </div>
        </div>

        {/* Global Toolbar */}
        <div className="flex items-center gap-4">
          <div className="relative flex items-center bg-zinc-900/50 border border-white/5 rounded-full px-4 py-1.5 w-44 sm:w-64 transition-all focus-within:border-red-500/50">
            <Search className="w-3.5 h-3.5 text-zinc-500 mr-2 shrink-0" />
            <input
              ref={searchInputRef}
              id="game-search-input"
              type="text"
              placeholder="Buscar jogo de retro-escala..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSelectedGameIndex(0);
              }}
              className="bg-transparent border-none text-xs text-white focus:outline-none w-full placeholder-zinc-500 focus:ring-0"
            />
          </div>

          <button
            id="btn-favorites"
            onClick={() => {
              soundEngine.playToggle();
              setFilterFavorites(!filterFavorites);
              setSelectedGameIndex(0);
            }}
            className={`p-2 rounded-full border transition cursor-pointer flex items-center gap-1.5 text-[10px] font-retro tracking-widest ${
              filterFavorites 
                ? 'bg-red-500 border-red-400 text-white shadow-lg shadow-red-500/35' 
                : 'bg-zinc-900/50 border-white/5 text-zinc-400 hover:text-white hover:border-white/15'
            }`}
            title="Filtrar Favoritos"
          >
            <Heart className={`w-3.5 h-3.5 ${filterFavorites ? 'fill-white text-white' : ''}`} />
            <span className="hidden sm:inline">FAVORITOS</span>
          </button>
        </div>
      </header>

      {/* Main Showcase Layout Grid */}
      <main className="relative z-20 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 md:p-8 overflow-hidden max-w-[1700px] w-full mx-auto items-center">
        
        {/* Left Side: Cover Flow Gallery & Metadata */}
        <div className="lg:col-span-8 flex flex-col justify-center h-full overflow-hidden py-4">
          
          <div className="mb-4 flex justify-between items-center px-4">
            <h3 className="font-retro text-[10px] tracking-[0.25em] text-[#E60012] uppercase font-black">
              EXPLORAR CATÁLOGO DE ROMS
            </h3>
            <div className="flex gap-2 text-[10px] font-mono text-zinc-500 tracking-wider">
              <span>Use</span>
              <span className="text-zinc-300 font-bold bg-zinc-900 border border-white/5 px-1.5 py-0.5 rounded">◀ ▶</span>
              <span>ou cliques e arrastes</span>
            </div>
          </div>

          {/* Interactive Cover-Flow Container Track Grid */}
          <div 
            ref={listContainerRef}
            className="flex items-center overflow-x-auto gap-8 py-10 no-scrollbar scroll-smooth snap-x w-full relative z-30"
            style={{ paddingLeft: '40%', paddingRight: '40%', minHeight: '360px' }}
          >
            {filteredGames.length === 0 ? (
              <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-8 text-zinc-500">
                <Gamepad2 className="w-12 h-12 mb-3 opacity-30 stroke-1 text-red-500 animate-bounce" />
                <p className="font-retro text-[10px] tracking-widest text-zinc-400">NENHUM JOGO COM ESTE FILTRO</p>
                <p className="text-xs text-zinc-600 mt-1">Experimente remover filtros ou a pesquisa ativa acima.</p>
              </div>
            ) : (
              filteredGames.map((game, idx) => {
                const isSelected = idx === selectedGameIndex;
                const distance = Math.abs(idx - selectedGameIndex);
                
                return (
                  <motion.button
                    key={game.id}
                    id={`game-item-${game.id}`}
                    onClick={() => handleGameClick(idx, game)}
                    className="shrink-0 relative focus:outline-none cursor-pointer outline-none flex flex-col items-center select-none group focus-visible:ring-0 z-30"
                    style={{ zIndex: 100 - distance }}
                    animate={{
                      scale: isSelected ? 1.05 : 0.82 - Math.min(distance * 0.05, 0.2),
                      opacity: isSelected ? 1 : 0.35 - Math.min(distance * 0.05, 0.2),
                      x: isSelected ? 0 : (idx < selectedGameIndex ? 25 : -25) * Math.min(distance, 3),
                    }}
                    transition={{ type: 'spring', stiffness: 180, damping: 18 }}
                  >
                    <div 
                      className={`relative w-44 h-60 md:w-48 md:h-64 rounded-xl overflow-hidden transition-all duration-300 ${
                        isSelected 
                          ? 'border-[3px] border-emerald-500 shadow-[0_0_35px_rgba(16,185,129,0.3)] ring-2 ring-emerald-400/20' 
                          : 'border border-white/5 hover:border-white/15'
                      }`}
                    >
                      <div className="absolute inset-x-0 top-0 h-[40%] bg-gradient-to-b from-white/10 to-transparent z-10 pointer-events-none" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/10 z-10 pointer-events-none" />
                      <div className="absolute left-0 inset-y-0 w-2.5 bg-gradient-to-b from-red-600 to-amber-500 z-20 pointer-events-none shadow-[2px_0_4px_rgba(0,0,0,0.5)] opacity-85" />
                      
                      <GameCover 
                        game={game} 
                        systemId={system.id} 
                        className="w-full h-full object-cover select-none pointer-events-none" 
                      />

                      <div className="absolute inset-0 pointer-events-none opacity-5 mix-blend-overlay z-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,_rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px]" />
                    </div>

                    <span className={`text-[10px] font-mono mt-3 uppercase tracking-widest ${isSelected ? 'text-emerald-400 font-bold' : 'text-zinc-600'}`}>
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                  </motion.button>
                );
              })
            )}
          </div>

          {/* Active Game Textual Metadata display block */}
          <div className="mt-4 h-40 flex flex-col justify-start z-30">
            <AnimatePresence mode="wait">
              {selectedGame && (
                <motion.div
                  key={`meta-text-${selectedGame.id}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="px-6"
                >
                  <div className="flex items-center gap-3 mb-2.5">
                    <span className="bg-red-500/10 text-red-500 text-[9px] font-retro px-2.5 py-0.5 rounded border border-red-500/20 uppercase tracking-wider block">
                      {selectedGame.genre}
                    </span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">{selectedGame.developer}</span>
                  </div>

                  <h1 className="text-2xl md:text-3.5xl font-display font-black tracking-tight text-white uppercase leading-none mb-3">
                    {selectedGame.title}
                  </h1>

                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-sans font-medium line-clamp-3 max-w-2xl">
                    {selectedGame.description || `Não perca este clássico absoluto do console ${system.name}. Re-experimente a jogabilidade intocada original emulando roms clássicas no LordTecaRetro com velocidade máxima de carregamento.`}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Side: Curved Retro CRT TV Cabinet Monitor */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-4 bg-zinc-900/10 border border-white/5 rounded-2xl backdrop-blur-sm shadow-inner relative overflow-hidden h-full z-30">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.010] to-transparent pointer-events-none" />

          {selectedGame ? (
            <div className="w-full flex flex-col h-full justify-between gap-6 py-2">
              
              <div className="relative w-full aspect-[4/3] bg-[#1a1a23] border-[6px] border-[#292938] rounded-3xl p-4 shadow-2xl flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 z-30 pointer-events-none rounded-2xl" />
                <div className="absolute inset-[1px] border border-black/80 z-20 pointer-events-none rounded-2xl" />
                <div className="absolute inset-2 border border-zinc-950 z-20 pointer-events-none rounded-xl" />

                <div className="absolute inset-3 rounded-lg overflow-hidden bg-zinc-950 z-10 flex items-center justify-center">
                  {!videoError && (
                    <video
                      key={`crt-preview-video-${selectedGame.title}`}
                      src={getGameGameplayVideoUrl(system.id, selectedGame.title)}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className={`w-full h-full object-cover absolute inset-0 select-none z-10 filter contrast-125 saturate-110 brightness-105 transition-opacity duration-500 ${
                        videoLoaded ? 'opacity-90' : 'opacity-0'
                      }`}
                      onPlay={() => setVideoLoaded(true)}
                      onLoadedData={() => setVideoLoaded(true)}
                      onError={() => {
                        setVideoError(true);
                        setVideoLoaded(false);
                      }}
                    />
                  )}

                  <div className={`absolute inset-0 z-0 flex items-center justify-center bg-zinc-950 transition-all duration-500 p-2 ${videoLoaded ? 'opacity-25 blur-sm scale-105' : 'opacity-100 scale-100'}`}>
                    <GameCover 
                      game={selectedGame} 
                      systemId={system.id} 
                      className="max-h-[90%] max-w-[90%] object-contain rounded-md shadow-2xl filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)]" 
                    />
                  </div>

                  <div 
                    className="absolute inset-0 pointer-events-none opacity-45 mix-blend-overlay z-20"
                    style={{
                      backgroundImage: 'linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.3) 50%)',
                      backgroundSize: '100% 6px'
                    }}
                  />
                  <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(0,185,129,0.05),transparent)] mix-blend-color-dodge z-20" />

                  <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded border border-white/10 flex items-center gap-1 shadow-lg z-25">
                    <Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" />
                    <span className="text-[9px] font-bold font-mono text-zinc-300">{selectedGame.rating}.0</span>
                  </div>

                  <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/55 text-zinc-500 font-retro text-[8px] rounded uppercase tracking-widest border border-white/5 z-25">
                    {videoLoaded ? 'VIDEO FEED' : 'PREVIEW FEED'}
                  </div>
                </div>

                <div className="absolute inset-3 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.65))] pointer-events-none z-15" />
              </div>

              {/* Bento Specs grid table layout */}
              <div className="grid grid-cols-2 gap-2 w-full font-mono text-xs text-zinc-400">
                <div className="bg-zinc-900/60 border border-white/5 rounded-xl p-3">
                  <span className="text-[8px] text-zinc-500 block uppercase tracking-wider mb-0.5">Desenvolvedor</span>
                  <span className="text-[11px] font-semibold text-zinc-300 block truncate">{selectedGame.developer}</span>
                </div>
                <div className="bg-zinc-900/60 border border-white/5 rounded-xl p-3">
                  <span className="text-[8px] text-zinc-500 block uppercase tracking-wider mb-0.5">Ano Lançamento</span>
                  <span className="text-[11px] font-semibold text-zinc-300 block flex items-center gap-1 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    {selectedGame.year}
                  </span>
                </div>
                <div className="bg-zinc-900/60 border border-white/5 rounded-xl p-3">
                  <span className="text-[8px] text-zinc-500 block uppercase tracking-wider mb-0.5">Controles</span>
                  <span className="text-[11px] font-semibold text-zinc-300 block flex items-center gap-1 truncate">
                    <Users className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    {selectedGame.players}
                  </span>
                </div>
                <div className="bg-zinc-900/60 border border-white/5 rounded-xl p-3">
                  <span className="text-[8px] text-zinc-500 block uppercase tracking-wider mb-0.5">Núcleo RetroArch</span>
                  <span className="text-[11px] font-semibold text-emerald-400 block flex items-center gap-1 truncate uppercase">
                    <Tag className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    {system.emulatorCore}
                  </span>
                </div>
              </div>

              {/* Play Button */}
              <div className="w-full flex items-center justify-center mt-2.5">
                <button
                  id="launch-game-btn"
                  onClick={() => handleLaunchGame(selectedGame)}
                  className="w-full py-4.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-zinc-950 font-retro text-xs rounded-full shadow-[0_8px_30px_rgba(16,185,129,0.35)] border-t border-white/25 active:scale-[0.98] transition-all font-black tracking-widest flex items-center justify-center gap-3 cursor-pointer select-none animate-[pulse_2s_infinite]"
                >
                  <Play className="w-4 h-4 fill-zinc-950 text-zinc-950 animate-bounce" />
                  <span>PLAY CLASSIC</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col justify-center items-center text-center p-8">
              <Gamepad2 className="w-12 h-12 text-zinc-600 stroke-1 mb-2 animate-pulse" />
              <p className="text-zinc-500 text-sm font-medium">Selecione um game na lista para ver detalhes.</p>
            </div>
          )}
        </div>

      </main>

      {/* Retro controller guides footer bar */}
      <footer className="relative z-30 w-full bg-zinc-950 border-t border-white/5 py-4 px-6 md:px-10 flex flex-col sm:flex-row justify-between items-center gap-4 text-zinc-400 text-[11px] font-mono tracking-wider">
        <div className="text-zinc-500 text-center sm:text-left font-sans font-medium">
          Navegue pelo catálogo usando o teclado ou mouse. Pronto para <span className="text-white font-semibold">Retro-Emulação</span>.
        </div>
        <div className="flex items-center gap-4 text-[10px] text-zinc-500 font-retro">
          <span className="flex items-center gap-1"><span className="bg-zinc-900 border border-white/5 text-zinc-200 px-1.5 py-0.5 rounded text-[8px]">◀▶</span> Selecionar</span>
          <span className="flex items-center gap-1"><span className="bg-zinc-900 border border-white/5 text-zinc-200 px-1.5 py-0.5 rounded text-[8px]">ENTER</span> Iniciar</span>
          <span className="flex items-center gap-1"><span className="bg-zinc-900 border border-white/5 text-zinc-200 px-1.5 py-0.5 rounded text-[8px]">ESC</span> Voltar</span>
        </div>
      </footer>

      {/* Real-time Retro Emulator Interface overlay - Elevado o Z-Index para isolamento absoluto */}
      <AnimatePresence>
        {emulatingGame && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="fixed inset-0 bg-zinc-950/98 z-[9999] flex flex-col justify-between p-2 md:p-6 shadow-2xl"
          >
            <EmulatorPlayer
              system={system}
              game={emulatingGame}
              onClose={handleCloseEmulator}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};