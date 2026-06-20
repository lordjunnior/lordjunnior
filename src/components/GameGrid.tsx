/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Game, System } from '../types';
import { GameCard } from './GameCard';
import { soundEngine } from './RetroSoundEngine';
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
  const [simLoadingPercent, setSimLoadingPercent] = useState(0);

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
    setSimLoadingPercent(0);

    // Simulated ROM Loading sequence ticker
    let percent = 0;
    const interval = setInterval(() => {
      percent += Math.floor(Math.random() * 8) + 4;
      if (percent >= 100) {
        percent = 100;
        setSimLoadingPercent(percent);
        clearInterval(interval);
      } else {
        setSimLoadingPercent(percent);
      }
    }, 120);
  };

  const closeSimulation = () => {
    soundEngine.playBack();
    setActiveSimulation(null);
    setSimLoadingPercent(0);
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
            <div className="bg-zinc-[#1c1c24]/90 border border-white/5 py-1.5 px-3.5 rounded-lg flex flex-col justify-center">
              <span className="text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Jogos Disponíveis</span>
              <span className="text-xl font-retro text-[#E60012] select-none text-[12px] tabular-nums mt-0.5">{system.gameCount}</span>
            </div>
            <div className="bg-zinc-[#1c1c24]/90 border border-white/5 py-1.5 px-3.5 rounded-lg flex flex-col justify-center">
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
            <span className="text-xs text-zinc-600 mt-2 font-medium">Tente ajustar seus termos de pesquisa ou remover os fitros ativos.</span>
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

      {/* Retro Emulator Simulation Popup overlay mockup */}
      <AnimatePresence>
        {activeSimulation && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[999] flex flex-col items-center justify-center p-6 text-center select-none"
          >
            {/* Horizontal scanline simulation */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_25%,rgba(0,0,0,0.8)_85%)] pointer-events-none" />
            
            <div className="relative z-10 max-w-lg w-full flex flex-col items-center">
              
              {/* Spinner loader layout */}
              <div className="relative w-28 h-28 flex items-center justify-center border-4 border-zinc-800 rounded-full bg-zinc-950 p-2 overflow-hidden mb-8 shadow-2xl">
                {/* Rotating accent color ring */}
                <div 
                  className="absolute inset-0 rounded-full border-4 border-red-500 border-t-transparent animate-spin" 
                  style={{ animationDuration: '1s' }}
                />
                
                {/* Simulated game logo or favicon */}
                <Gamepad2 className="w-10 h-10 text-white fill-white animate-bounce" />
              </div>

              {/* Title specs */}
              <h1 className="font-retro text-sm text-red-500 tracking-widest uppercase mb-1">
                LANÇANDO EMULADOR
              </h1>
              
              <h2 className="text-2xl sm:text-3xl font-display font-black text-white px-2 mt-4">
                {activeSimulation.title}
              </h2>

              <p className="text-[10px] font-mono text-zinc-500 tracking-wider uppercase mt-1">
                SISTEMA: {system.name} • PORT: EMULATOR_JS_MOCK
              </p>

              {/* Loader Slider Bar progress */}
              <div className="w-full max-w-xs mt-8">
                <div className="h-1.5 w-full bg-zinc-900 border border-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-red-600 to-emerald-500 transition-all duration-100 rounded-full" 
                    style={{ width: `${simLoadingPercent}%` }}
                  />
                </div>
                
                <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400 mt-2 px-1 tracking-wider">
                  <span>LOADING ROM...</span>
                  <span className="font-bold text-emerald-400 tabular-nums">{simLoadingPercent}%</span>
                </div>
              </div>

              {/* Simulator info checklist */}
              <div className="mt-10 p-5 bg-[#121216]/75 border border-white/5 rounded-xl text-left w-full">
                <h3 className="text-xs font-retro text-zinc-400 tracking-widest uppercase pb-2.5 border-b border-white/5 flex items-center gap-1.5 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  Arquitetura Pronta
                </h3>
                
                <p className="text-zinc-600 text-[11px] mt-3 leading-relaxed font-sans first-letter:uppercase">
                  Esta aplicação foi arquitetada para integração nativa com o <b className="text-zinc-300">EmulatorJS</b>. No futuro, ao acionar <span className="text-zinc-300">Lançar</span>, o container instanciará a ROM <code className="text-emerald-400">{activeSimulation.romUrl}</code> diretamente no renderizador webAssembly da core <code className="text-[#E60012]">{system.emulatorCore}</code>.
                </p>

                <div className="flex items-center justify-between mt-5 pt-3.5 border-t border-white/5 text-[9px] font-mono text-zinc-500 tracking-wider uppercase font-medium">
                  <span>DATABASE: COMPLIANT</span>
                  <span>OAUTH: IN_PLACE</span>
                </div>
              </div>

              {/* Action back */}
              {simLoadingPercent === 100 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-3 w-full mt-6"
                >
                  <button
                    onClick={closeSimulation}
                    className="w-full sm:w-auto px-10 py-3.5 bg-gradient-to-r from-red-600 to-emerald-500 hover:from-red-500 hover:to-emerald-400 text-white font-retro text-[9px] rounded-full border-t border-white/20 shadow-[0_4px_15px_rgba(230,0,18,0.25)] transition-all cursor-pointer font-extrabold uppercase tracking-widest"
                  >
                    Encerrar Emulação
                  </button>
                  <span className="text-[8px] font-mono text-zinc-600">APOIE O DEDO EM B OU ESC PARA SAIR</span>
                </motion.div>
              ) : (
                <button
                  onClick={closeSimulation}
                  className="mt-6 px-6 py-2 border border-white/10 hover:border-red-500 hover:text-red-500 text-zinc-500 text-xs font-mono uppercase font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
