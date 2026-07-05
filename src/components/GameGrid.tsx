/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Game, System } from '../types';
import { GameCard } from './GameCard';
import { soundEngine } from './RetroSoundEngine';
import { EmulatorPlayer } from './EmulatorPlayer';
import { 
  ArrowLeft, Search, SlidersHorizontal, Heart, 
  Gamepad2, Sparkles, Filter, X, Zap, RotateCcw, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GameGridProps {
  system: System;
  onGoBack: () => void;
  isSearchActive: boolean;
  setSearchActive: (active: boolean) => void;
  onViewDetails: (game: Game) => void;
}

export const GameGrid: React.FC<GameGridProps> = ({
  system,
  onGoBack,
  isSearchActive,
  setSearchActive,
  onViewDetails
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('Todos');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  
  // Game Emulator simulation states
  const [activeSimulation, setActiveSimulation] = useState<Game | null>(null);

  // Dynamic genres lists
  const availableGenres = useMemo(() => {
    const genres = new Set<string>();
    system.games.forEach(g => genres.add(g.genre));
    return ['Todos', ...Array.from(genres)];
  }, [system]);

  // Combined games search/filter engine
  const filteredGames = useMemo(() => {
    return system.games.filter(game => {
      const matchSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          game.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchGenre = selectedGenre === 'Todos' || game.genre === selectedGenre;
      const matchFavorite = !onlyFavorites || game.favorite;
      return matchSearch && matchGenre && matchFavorite;
    });
  }, [system, searchQuery, selectedGenre, onlyFavorites]);

  const handleLaunchGame = (game: Game) => {
    soundEngine.playSelect();
    setActiveSimulation(game);
  };

  const closeSimulation = () => {
    soundEngine.playBack();
    setActiveSimulation(null);
  };

  return (
    <div className="w-full flex-1 flex flex-col z-10 text-white font-sans overflow-y-auto no-scrollbar pb-16">
      
      {/* Visual Console Giant Header Banner */}
      <div className="relative w-full py-12 md:py-20 px-6 sm:px-12 flex flex-col justify-end bg-gradient-to-b from-[#18181b]/35 to-[#09090b]">
        {/* Dynamic decorative backdrop blur shadow */}
        <div className="absolute inset-0 z-0 bg-cover bg-center opacity-25 filter blur-md" style={{ backgroundImage: `url(${system.backgroundImage})` }} />
        <div className="absolute inset-0 bg-[#09090b]/80 z-0" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-end md:justify-between gap-6">
          <div className="flex flex-col gap-2">
            <button
              onClick={() => { soundEngine.playBack(); onGoBack(); }}
              className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-400 hover:text-red-500 transition-colors cursor-pointer group"
              id="back-btn-details"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>VOLTAR PARA HOME</span>
            </button>

            <div className="flex items-center gap-3.5 mt-3">
              <span className="font-retro text-[14px] bg-[#E60012] px-3.5 py-1.5 rounded-lg border border-red-500/40 text-white shadow-lg glow-active">
                {system.logo}
              </span>
              <div className="flex flex-col">
                <h2 className="text-2xl sm:text-4xl font-display font-black tracking-tight uppercase leading-none">
                  {system.name}
                </h2>
                <span className="text-[10px] font-mono text-zinc-500 tracking-wider">
                  MANUFATURADO POR: {system.manufacturer.toUpperCase()} • {system.releaseYear}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-[#1c1c24]/90 border border-white/5 py-1.5 px-3.5 rounded-lg flex flex-col justify-center">
              <span className="text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Jogos Disponíveis</span>
              <span className="text-xl font-retro text-[#E60012] select-none text-[12px] tabular-nums mt-0.5">{system.gameCount}</span>
            </div>
            <div className="bg-[#1c1c24]/90 border border-white/5 py-1.5 px-3.5 rounded-lg flex flex-col justify-center">
              <span className="text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Emulator Core</span>
              <span className="text-[11px] font-mono text-emerald-400 font-bold tracking-wider mt-1">{system.emulatorCore}.so</span>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced dynamic search / filters panel toolbar */}
      <div className="px-6 sm:px-12 py-5 border-y border-white/5 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-30 flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Dynamic Search Box Input */}
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Pesquisar por título, desenvolvedora ou descrição..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#121216] hover:bg-[#16161b] focus:bg-[#16161b] focus:outline-none border border-white/5 focus:border-red-500/40 rounded-xl text-sm transition-all text-white placeholder-zinc-500 font-medium"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filters Select Dropdowns & favorites buttons */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto mt-2 lg:mt-0">
          
          {/* Genre selections dropdown */}
          <div className="flex items-center gap-2 bg-[#121216] px-3.5 py-2.5 rounded-xl border border-white/5">
            <Filter className="w-3.5 h-3.5 text-zinc-500" />
            <span className="text-xs text-zinc-400 font-semibold font-mono uppercase">GÊNERO:</span>
            <select
              value={selectedGenre}
              onChange={(e) => { setSelectedGenre(e.target.value); soundEngine.playToggle(); }}
              className="bg-transparent focus:outline-none text-xs text-zinc-200 font-bold font-sans pr-2 cursor-pointer"
            >
              {availableGenres.map(g => (
                <option key={g} value={g} className="bg-zinc-950 text-white font-sans">{g}</option>
              ))}
            </select>
          </div>

          {/* Toggle only favorites option */}
          <button
            onClick={() => { setOnlyFavorites(!onlyFavorites); soundEngine.playToggle(); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-mono font-bold uppercase transition-all duration-200 cursor-pointer ${
              onlyFavorites
                ? 'bg-red-500/10 border-red-500 text-red-500'
                : 'bg-[#121216] border-white/5 hover:border-white/10 text-zinc-400'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-red-500 text-red-500' : 'text-zinc-500'}`} />
            <span>Favoritos</span>
          </button>

          {/* Reset Filters options */}
          {(searchQuery || selectedGenre !== 'Todos' || onlyFavorites) && (
            <button
              onClick={() => {
                soundEngine.playToggle();
                setSearchQuery('');
                setSelectedGenre('Todos');
                setOnlyFavorites(false);
              }}
              className="flex items-center gap-1.5 px-3 py-2.5 hover:text-red-500 text-xs font-mono text-zinc-500 transition-colors uppercase font-bold cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpar Filtros</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid of titles representation */}
      <div className="px-6 sm:px-12 py-8 flex-1">
        
        {filteredGames.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onLaunch={handleLaunchGame}
                systemName={system.shortName.toUpperCase()}
                onViewDetails={onViewDetails}
                systemId={system.id}
              />
            ))}
          </div>
        ) : (
          <div className="w-full py-16 flex flex-col justify-center items-center text-center">
            <AlertTriangle className="w-14 h-14 text-zinc-700 mb-4 stroke-[1.5]" />
            <span className="font-retro text-[10px] text-zinc-500 tracking-widest block uppercase">Nenhum título encontrado</span>
            <span className="text-xs text-zinc-600 mt-2 font-medium">Tente ajustar seus termos de pesquisa ou remover os filtros ativos.</span>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedGenre('Todos');
                setOnlyFavorites(false);
                soundEngine.playToggle();
              }}
              className="mt-4 px-6 py-2 bg-zinc-900 border border-white/5 text-zinc-300 text-xs font-mono uppercase font-bold hover:text-white hover:border-white/10 rounded-lg cursor-pointer"
            >
              Mostrar todos os jogos
            </button>
          </div>
        )}
      </div>

      {/* Real Retro Emulator Screen Overlay */}
      <AnimatePresence>
        {activeSimulation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="fixed inset-0 bg-zinc-950/98 z-[2500] flex flex-col justify-between p-2 md:p-6"
          >
            <EmulatorPlayer
              system={system}
              game={activeSimulation}
              onClose={closeSimulation}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
