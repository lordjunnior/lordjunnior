/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Gamepad2, Sparkles, Command, HelpCircle, Monitor, ArrowRight, ArrowBigUpDash } from 'lucide-react';
import { System, Game } from '../types';
import { soundEngine } from './RetroSoundEngine';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  systems: System[];
  onSelectGame: (system: System, game: Game) => void;
  onSelectSystem?: (system: System) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  systems,
  onSelectGame,
  onSelectSystem
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [recentlyPlayed, setRecentlyPlayed] = useState<any[]>([]);

  useEffect(() => {
    const loadHistory = () => {
      try {
        const raw = localStorage.getItem('retro_recently_played');
        if (raw) {
          setRecentlyPlayed(JSON.parse(raw));
        } else {
          setRecentlyPlayed([]);
        }
      } catch (e) {
        console.error('[RetroHub] Erro ao carregar histórico:', e);
      }
    };
    
    if (isOpen) {
      loadHistory();
    }
    
    window.addEventListener('retro_recently_played_updated', loadHistory);
    return () => window.removeEventListener('retro_recently_played_updated', loadHistory);
  }, [isOpen]);

  const handleSelectRecent = (recentItem: any) => {
    const system = systems.find(s => s.id === recentItem.systemId);
    if (system) {
      const game = system.games.find(g => g.title === recentItem.title);
      if (game) {
        onSelectGame(system, game);
        handleClose();
      }
    }
  };

  // Play close sound on unmount/close
  const handleClose = () => {
    soundEngine.playBack();
    onClose();
  };

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      soundEngine.playToggle();
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Combine matching systems and games search
  const { matchingSystems, matchingGames } = useMemo(() => {
    if (!query.trim()) {
      return { matchingSystems: [], matchingGames: [] };
    }

    const cleanQuery = query.toLowerCase().trim();

    // Find systems whose name or manufacturer matches
    const filteredSystems = systems.filter(sys => 
      sys.name.toLowerCase().includes(cleanQuery) || 
      sys.manufacturer.toLowerCase().includes(cleanQuery) ||
      sys.logo.toLowerCase().includes(cleanQuery)
    );

    // Find all games that match
    const filteredGames: { system: System; game: Game }[] = [];
    systems.forEach(sys => {
      sys.games.forEach(game => {
        const matchesTitle = game.title.toLowerCase().includes(cleanQuery);
        const matchesGenre = game.genre.toLowerCase().includes(cleanQuery);
        const matchesDev = game.developer.toLowerCase().includes(cleanQuery);
        const matchesDesc = game.description.toLowerCase().includes(cleanQuery);

        if (matchesTitle || matchesGenre || matchesDev || matchesDesc) {
          filteredGames.push({ system: sys, game });
        }
      });
    });

    return {
      matchingSystems: filteredSystems,
      matchingGames: filteredGames.slice(0, 30) // cap to 30 items for supreme speed
    };
  }, [query, systems]);

  const totalResults = matchingSystems.length + matchingGames.length;

  // Handle keyboard navigation inside search list
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent): void => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (totalResults > 0) {
          soundEngine.playMove();
          setSelectedIndex(prev => (prev + 1) % totalResults);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (totalResults > 0) {
          soundEngine.playMove();
          setSelectedIndex(prev => (prev - 1 + totalResults) % totalResults);
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (totalResults > 0 && selectedIndex < totalResults) {
          soundEngine.playSelect();
          // Decide if system or game is selected
          if (selectedIndex < matchingSystems.length) {
            const system = matchingSystems[selectedIndex];
            onSelectSystem?.(system);
            onClose();
          } else {
            const gameIndex = selectedIndex - matchingSystems.length;
            const match = matchingGames[gameIndex];
            onSelectGame(match.system, match.game);
            onClose();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, matchingSystems, matchingGames, selectedIndex, totalResults]);

  // Adjust scroll position of selected item container
  useEffect(() => {
    const selectedEl = listRef.current?.querySelector('[data-selected="true"]');
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[3000] flex items-start justify-center p-4 sm:p-6 md:p-10">
          {/* Backdrop Blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-zinc-950/85 backdrop-blur-lg"
          />

          {/* Search Cabinet Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 15 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative w-full max-w-4xl bg-gradient-to-b from-[#18181c] to-[#09090b] border border-white/10 rounded-2xl md:rounded-3xl shadow-[0_0_80px_rgba(230,0,18,0.15)] overflow-hidden flex flex-col max-h-[85vh] mt-6 md:mt-12"
          >
            {/* Ambient Red glow line at top */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-600 via-amber-500 to-red-600 shadow-lg" />

            {/* Input Header Box */}
            <div className="p-5 md:p-6 border-b border-white/5 flex items-center justify-between gap-4 bg-zinc-950/40">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500 animate-pulse" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Qual clássico marcou sua infância? Busque aqui..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedIndex(0);
                    soundEngine.playMove();
                  }}
                  className="w-full bg-zinc-950/90 border border-white/10 focus:border-red-500 rounded-2xl pl-12 pr-12 py-3.5 text-base md:text-lg text-white font-sans placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-red-500/30 transition-all font-medium"
                />
                {query && (
                  <button
                    onClick={() => {
                      setQuery('');
                      setSelectedIndex(0);
                      soundEngine.playToggle();
                      inputRef.current?.focus();
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={handleClose}
                className="p-3 bg-white/5 border border-white/5 hover:bg-red-600 border-red-500/20 text-zinc-400 hover:text-white rounded-xl transition duration-200 cursor-pointer flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Results Body */}
            <div 
              ref={listRef}
              className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 no-scrollbar"
            >
              {!query.trim() ? (
                /* Empty state / instructions & Recently Played history */
                <div className="space-y-6">
                  {recentlyPlayed.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 px-2 text-zinc-400 font-retro text-[10px] tracking-widest uppercase">
                        <Gamepad2 className="w-4 h-4 text-red-500 animate-pulse" />
                        <span>JOGADOS RECENTEMENTE (ÚLTIMOS JOGADOS)</span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {recentlyPlayed.slice(0, 4).map((item) => {
                          const realSystem = systems.find(s => s.id === item.systemId);
                          return (
                            <div
                              key={`${item.systemId}::${item.title}`}
                              onClick={() => handleSelectRecent(item)}
                              className="p-3 bg-zinc-950/60 hover:bg-zinc-900/90 hover:border-red-500/40 border border-white/5 rounded-xl cursor-pointer transition-all duration-200 group flex items-center justify-between"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-white/5 flex-shrink-0 overflow-hidden relative">
                                  <img 
                                    src={item.image} 
                                    alt={item.title} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="absolute inset-0 bg-black/15" />
                                </div>
                                <div className="min-w-0">
                                  <h4 className="text-xs font-black text-white font-display uppercase truncate group-hover:text-red-400 transition-colors">
                                    {item.title}
                                  </h4>
                                  <p className="text-[9px] text-zinc-500 font-mono mt-0.5 uppercase truncate">
                                    {item.systemName} • {item.genre}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0 ml-2 font-semibold">
                                {realSystem && (
                                  <span className={`font-retro text-[7px] px-1.5 py-0.5 rounded border ${realSystem.badgeColor} scale-90`}>
                                    {realSystem.logo}
                                  </span>
                                )}
                                <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-red-500 group-hover:translate-x-0.5 transition-all" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="text-center py-10 px-6 flex flex-col justify-center items-center bg-zinc-950/30 border border-white/5 rounded-2xl">
                    <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(230,0,18,0.1)]">
                      <Command className="w-7 h-7 text-red-400" />
                    </div>
                    <h3 className="font-display font-black text-md text-white">Central de Busca LordTecaRetro</h3>
                    <p className="text-[11px] text-zinc-400 max-w-sm mt-2 leading-relaxed">
                      Comece a digitar o nome de um jogo, gênero (ex: <em className="text-emerald-400 not-italic font-mono">RPG</em>), desenvolvedor ou o nome do console para pesquisar em toda a estação.
                    </p>

                    {/* Hotkeys Quick Legend */}
                    <div className="flex flex-wrap gap-4 mt-6 bg-zinc-950/60 p-3.5 border border-white/5 rounded-xl text-[9px] font-mono text-zinc-500 max-w-md w-full justify-center">
                      <span className="flex items-center gap-1"><kbd className="bg-zinc-800 text-zinc-300 px-1 py-0.5 rounded text-[8px] border border-white/5">↑↓</kbd> Navegar</span>
                      <span className="flex items-center gap-1"><kbd className="bg-zinc-800 text-zinc-300 px-1 py-0.5 rounded text-[8px] border border-white/5">ENTER</kbd> Abrir</span>
                      <span className="flex items-center gap-1"><kbd className="bg-zinc-800 text-zinc-300 px-1 py-0.5 rounded text-[8px] border border-white/5">ESC</kbd> Sair</span>
                    </div>
                  </div>
                </div>
              ) : totalResults === 0 ? (
                /* No results state */
                <div className="text-center py-12 px-6 flex flex-col justify-center items-center">
                  <div className="w-12 h-12 rounded-full bg-zinc-800/50 border border-white/5 flex items-center justify-center mb-4">
                    <Gamepad2 className="w-6 h-6 text-zinc-500" />
                  </div>
                  <h3 className="font-display font-black text-md text-white">Nenhum resultado encontrado</h3>
                  <p className="text-xs text-zinc-500 mt-1 max-w-xs">
                    Não encontramos consoles ou jogos correspondentes a &ldquo;{query}&rdquo;.
                  </p>
                </div>
              ) : (
                /* Search Results display list */
                <div className="space-y-4">
                  {/* Categorized systems */}
                  {matchingSystems.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-retro text-zinc-500 tracking-widest block uppercase px-2">Consoles Encontrados ({matchingSystems.length})</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {matchingSystems.map((sys, idx) => {
                          const isSelected = selectedIndex === idx;
                          return (
                            <div
                              key={sys.id}
                              data-selected={isSelected}
                              onMouseEnter={() => {
                                setSelectedIndex(idx);
                                soundEngine.playMove();
                              }}
                              onClick={() => {
                                soundEngine.playSelect();
                                onSelectSystem?.(sys);
                                onClose();
                              }}
                              className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all duration-200 ${
                                isSelected
                                  ? 'bg-red-500/10 border-red-500 text-red-400 shadow-md scale-[1.01]'
                                  : 'bg-zinc-950/60 hover:bg-zinc-900 border-white/5 text-zinc-200'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className={`font-retro text-[9px] px-2 py-1 rounded border shadow-sm ${sys.badgeColor}`}>
                                  {sys.logo}
                                </span>
                                <div>
                                  <h4 className="text-xs font-black font-display text-white">{sys.name}</h4>
                                  <p className="text-[9px] text-zinc-500 font-mono mt-0.5">
                                    {sys.manufacturer.toUpperCase()} • {sys.releaseYear} • {sys.gameCount} JOGOS
                                  </p>
                                </div>
                              </div>
                              <ArrowRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-red-500 translate-x-1' : 'text-zinc-600'}`} />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Games selection */}
                  {matchingGames.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-retro text-zinc-500 tracking-widest block uppercase px-2">Jogos Encontrados ({matchingGames.length})</span>
                      <div className="flex flex-col gap-1.5">
                        {matchingGames.map(({ systemId, ...item }, idx) => {
                          // Correct real system reference and calculate item rank in index
                          const realSystem = item.system;
                          const game = item.game;
                          const globalIdx = matchingSystems.length + idx;
                          const isSelected = selectedIndex === globalIdx;

                          return (
                            <div
                              key={game.id}
                              data-selected={isSelected}
                              onMouseEnter={() => {
                                setSelectedIndex(globalIdx);
                                soundEngine.playMove();
                              }}
                              onClick={() => {
                                soundEngine.playSelect();
                                onSelectGame(realSystem, game);
                                onClose();
                              }}
                              className={`p-3 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer transition-all duration-200 ${
                                isSelected
                                  ? 'bg-red-500/10 border-red-500 text-red-400 shadow-md translate-x-1 ring-1 ring-red-500/10'
                                  : 'bg-zinc-950/50 hover:bg-zinc-900 border-white/5 text-zinc-200'
                              }`}
                            >
                              <div className="flex items-start gap-3.5">
                                {/* Small visual helper image */}
                                <div className="w-10 h-10 rounded-lg bg-zinc-900 overflow-hidden relative border border-white/10 flex-shrink-0">
                                  <img 
                                    src={game.image || undefined} 
                                    alt={game.title} 
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="absolute inset-0 bg-black/20" />
                                </div>

                                <div className="space-y-0.5">
                                  <div className="flex flex-wrap items-center gap-1.5 leading-none">
                                    <h4 className="text-sm font-black text-white font-display uppercase tracking-tight">{game.title}</h4>
                                    <span className="text-[8px] font-mono font-bold bg-zinc-800 text-zinc-400 px-1 py-0.5 rounded uppercase">{game.genre}</span>
                                    {game.favorite && <Sparkles className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                                  </div>
                                  <p className="text-xs text-zinc-400 line-clamp-1 leading-normal max-w-[500px]">
                                    {game.description}
                                  </p>
                                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
                                    <span>DESENVOLVEDORA: <strong className="text-zinc-400 font-bold">{game.developer}</strong></span>
                                    <span>•</span>
                                    <span>LANÇAMENTO: <strong className="text-zinc-400 font-bold">{game.year}</strong></span>
                                  </div>
                                </div>
                              </div>

                              {/* Console Label Badge right tag */}
                              <div className="flex items-center gap-2 justify-between md:justify-end border-t md:border-t-0 border-white/5 pt-2 md:pt-0">
                                <span className={`font-retro text-[8px] px-2 py-0.5 rounded border ${realSystem.badgeColor}`}>
                                  {realSystem.logo}
                                </span>
                                <div className={`px-2 py-1 bg-white/5 rounded-lg text-[10px] font-black tracking-widest text-zinc-400 group-hover:text-white transition uppercase flex items-center gap-1 ${isSelected ? 'text-red-400 bg-red-500/10 border border-red-500/20' : ''}`}>
                                  <span>JOGAR</span>
                                  <ArrowRight className="w-3 h-3" />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Keyboard Commands Bar / Footer detail helper */}
            <div className="p-3 bg-zinc-950 border-t border-white/5 text-right font-mono text-[9px] text-zinc-500 flex justify-between items-center px-6">
              <span className="flex items-center gap-1">
                <HelpCircle className="w-3 h-3 text-red-500" />
                <span>Consoles recomendados para emulação rápida com áudio imersivo de onda senoidal</span>
              </span>
              <span className="hidden sm:inline">Use as setas para navegar, ENTER para confirmar o play</span>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
