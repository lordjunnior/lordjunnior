/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { System, Game } from '../types';
import { soundEngine } from './RetroSoundEngine';
import { 
  ArrowLeft, 
  Search, 
  Star, 
  Calendar, 
  Users, 
  Tag, 
  Cpu, 
  Heart, 
  Play, 
  VolumeX, 
  Volume2, 
  Tv, 
  Maximize2,
  Gamepad2
} from 'lucide-react';

interface GamelistViewProps {
  system: System;
  onBack: () => void;
  isMuted: boolean;
  toggleMute: () => void;
  isCrtOn: boolean;
  toggleCrt: () => void;
}

export const GamelistView: React.FC<GamelistViewProps> = ({
  system,
  onBack,
  isMuted,
  toggleMute,
  isCrtOn,
  toggleCrt,
}) => {
  const [selectedGameIndex, setSelectedGameIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [emulatingGame, setEmulatingGame] = useState<Game | null>(null);
  const [emulatorLoading, setEmulatorLoading] = useState(false);
  const [emulatorActive, setEmulatorActive] = useState(false);

  const filteredGames = useMemo(() => {
    return system.games.filter(game => {
      const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            game.genre.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFavorite = filterFavorites ? game.favorite : true;
      return matchesSearch && matchesFavorite;
    });
  }, [system.games, searchTerm, filterFavorites]);

  const selectedGame = filteredGames[selectedGameIndex] || null;

  const handleBack = () => {
    soundEngine.playBack();
    onBack();
  };

  const selectGame = (index: number) => {
    if (index !== selectedGameIndex) {
      setSelectedGameIndex(index);
      soundEngine.playMove();
    }
  };

  const handleLaunchGame = (game: Game) => {
    soundEngine.playSelect();
    setEmulatingGame(game);
    setEmulatorLoading(true);
    setEmulatorActive(false);

    // Simulate retro boot sequence
    setTimeout(() => {
      setEmulatorLoading(false);
      setEmulatorActive(true);
    }, 2200);
  };

  const handleCloseEmulator = () => {
    soundEngine.playBack();
    setEmulatingGame(null);
    setEmulatorActive(false);
    setEmulatorLoading(false);
  };

  // Keyboard navigation for gamelist
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (emulatingGame) {
        if (e.key === 'Escape') {
          handleCloseEmulator();
        }
        return; // Disable normal nav when emulating
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (filteredGames.length > 0) {
          const nextIndex = (selectedGameIndex - 1 + filteredGames.length) % filteredGames.length;
          selectGame(nextIndex);
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (filteredGames.length > 0) {
          const nextIndex = (selectedGameIndex + 1) % filteredGames.length;
          selectGame(nextIndex);
        }
      } else if (e.key === 'Escape' || e.key === 'Backspace') {
        handleBack();
      } else if (e.key === 'Enter') {
        if (selectedGame) {
          handleLaunchGame(selectedGame);
        }
      } else if (e.key.toLowerCase() === 'f') {
        soundEngine.playToggle();
        setFilterFavorites(prev => !prev);
        setSelectedGameIndex(0);
      } else if (e.key.toLowerCase() === 'm') {
        toggleMute();
        soundEngine.playToggle();
      } else if (e.key.toLowerCase() === 'c') {
        toggleCrt();
        soundEngine.playToggle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedGameIndex, filteredGames, emulatingGame, selectedGame, isMuted, isCrtOn]);

  return (
    <div id="gamelist-container" className="relative w-full h-screen font-sans text-white overflow-hidden bg-zinc-950 flex flex-col justify-between">
      {/* Background Visual Screen Shadow */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center opacity-15 blur-md scale-105"
          style={{ backgroundImage: `url(${system.backgroundImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-zinc-950" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(59,130,246,0.1),transparent)] pointer-events-none" />
      </div>

      {/* Top Header Panel */}
      <header className="relative z-10 h-18 flex items-center justify-between px-4 sm:px-8 border-b border-white/5 bg-black/30 backdrop-blur-md">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            id="gamelist-back-btn"
            onClick={handleBack}
            className="group flex items-center gap-2 text-[10px] sm:text-xs font-retro tracking-widest text-white bg-[#E60012] hover:bg-red-500 border border-red-400 hover:border-red-300 rounded-lg px-2.5 py-1.5 sm:px-4 sm:py-2 shadow-[0_4px_0_0_#91000B] hover:shadow-[0_2px_0_0_#91000B] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer font-black"
          >
            <div className="w-4 h-4 rounded-full bg-zinc-950 text-red-500 flex items-center justify-center text-[10px] font-retro border border-white/25 group-hover:scale-110 transition-transform">
              B
            </div>
            <span>VOLTAR</span>
          </button>
          
          <div className="h-4 w-px bg-white/10 hidden sm:block" />
          
          {/* Active System indicator info */}
          <div className="flex items-center gap-3">
            <span className="font-retro text-[12px] text-emerald-400 font-extrabold pr-2 bg-gradient-to-r from-emerald-500/10 to-transparent py-1 px-2.5 rounded-l border-l border-emerald-500">
              {system.logo}
            </span>
            <span className="text-xs font-mono text-zinc-500 hidden md:inline">
              {filteredGames.length} de {system.gameCount} títulos
            </span>
          </div>
        </div>

        {/* Global Controls Info bar */}
        <div className="flex items-center gap-4">
          {/* Quick Search */}
          <div className="relative flex items-center bg-zinc-900/60 border border-white/10 rounded-lg px-2.5 py-1 w-40 sm:w-56">
            <Search className="w-3.5 h-3.5 text-zinc-500 mr-2 shrink-0" />
            <input
              id="game-search-input"
              type="text"
              placeholder="Buscar jogo..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSelectedGameIndex(0);
              }}
              className="bg-transparent border-none text-xs text-white focus:outline-none w-full placeholder-zinc-500"
            />
          </div>

          {/* Toggle Favorites Button */}
          <button
            id="btn-favorites"
            onClick={() => {
              soundEngine.playToggle();
              setFilterFavorites(!filterFavorites);
              setSelectedGameIndex(0);
            }}
            className={`p-1.5 rounded border transition cursor-pointer flex items-center gap-1.5 text-xs ${
              filterFavorites 
                ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                : 'bg-zinc-900/60 border-white/10 text-zinc-400 hover:text-white'
            }`}
            title="Filtrar Favoritos"
          >
            <Heart className={`w-3.5 h-3.5 ${filterFavorites ? 'fill-red-500 text-red-500' : ''}`} />
            <span className="hidden sm:inline">FAVORTOS</span>
          </button>
        </div>
      </header>

      {/* Main Container: Split-view or Catalog grid layout as specified */}
      <main className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 overflow-hidden max-w-[1600px] w-full mx-auto">
        
        {/* Left Column (Lists) - takes 5 cols */}
        <div className="lg:col-span-5 flex flex-col bg-zinc-950/60 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm h-full">
          <div className="bg-zinc-900/50 px-4 py-3 border-b border-white/5 flex justify-between items-center">
            <span className="font-retro text-[9px] tracking-wider text-zinc-400">Relação de Jogos</span>
            <span className="font-mono text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded">
              Controles: ↑ ↓ ou Clique
            </span>
          </div>

          {/* List Component inside scroll overflow */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1 no-scrollbar">
            {filteredGames.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-center p-8 text-zinc-500">
                <Gamepad2 className="w-10 h-10 mb-2 opacity-30 stroke-1" />
                <p className="text-sm">Nenhum game encontrado</p>
                <p className="text-xs text-zinc-600 mt-1">Experimente remover seus filtros ou busca.</p>
              </div>
            ) : (
              filteredGames.map((game, idx) => {
                const isSelected = idx === selectedGameIndex;
                return (
                  <div
                    key={game.id}
                    id={`game-item-${game.id}`}
                    onClick={() => selectGame(idx)}
                    className={`group w-full flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer text-left transition duration-150 border select-none ${
                      isSelected 
                        ? 'bg-gradient-to-r from-emerald-500/10 to-green-600/5 border-emerald-500/40 text-white shadow-[0_2px_12px_rgba(16,185,129,0.05)]' 
                        : 'bg-transparent border-transparent text-zinc-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      {/* Favorite mini heart badge */}
                      {game.favorite && (
                        <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 shrink-0" />
                      )}
                      
                      {/* Index display indicator */}
                      <span className={`font-mono text-xs text-center w-5 shrink-0 font-bold ${isSelected ? 'text-emerald-400' : 'text-zinc-600'}`}>
                        {String(idx + 1).padStart(2, '0')}
                      </span>

                      {/* Game Title */}
                      <span className={`truncate text-sm tracking-tight font-medium ${isSelected ? 'font-semibold' : ''}`}>
                        {game.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                        isSelected 
                          ? 'bg-emerald-500/20 text-emerald-300' 
                          : 'bg-zinc-800 text-zinc-500 group-hover:bg-zinc-700'
                      }`}>
                        {game.genre}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column (Focus Detail Bento Grid) - takes 7 cols */}
        <div className="lg:col-span-7 flex flex-col h-full overflow-hidden">
          {selectedGame ? (
            <div className="flex-1 flex flex-col bg-gradient-to-b from-zinc-900/60 to-zinc-950/80 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl p-6 relative">
              
              {/* Dynamic decorative backdrop subtle gradient glowing card as in Vibrant Palette */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none -z-10 translate-x-20 -translate-y-20" />

              {/* Boxart / Preview Image Layout Section */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                
                {/* Visual Thumbnail */}
                <div className="md:col-span-5 relative group border border-white/10 rounded-xl overflow-hidden shadow-2xl aspect-[4/3] md:aspect-square bg-zinc-900 flex items-center justify-center">
                  <img
                    id="game-image-preview"
                    src={selectedGame.image}
                    alt={selectedGame.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                  
                  {/* Rating Badge Overlay */}
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded border border-white/10 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-bold font-mono">{selectedGame.rating}.0</span>
                  </div>
                </div>

                {/* Meta info block next to thumbnail */}
                <div className="md:col-span-7 flex flex-col justify-between h-full space-y-4">
                  <div>
                    <span className="px-2.5 py-1 text-[10px] rounded-full font-retro uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 tracking-wider">
                      {system.name}
                    </span>
                    <h3 id="game-detail-title" className="text-2xl sm:text-3xl font-display font-black tracking-tight text-white mt-2 leading-tight">
                      {selectedGame.title}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pb-2">
                    <div className="bg-zinc-950/40 border border-white/5 rounded-lg p-2.5">
                      <span className="text-[10px] text-zinc-500 font-mono tracking-wider block uppercase">Desenvolvedora</span>
                      <span className="text-xs font-semibold text-zinc-200 mt-0.5 block truncate">{selectedGame.developer}</span>
                    </div>
                    <div className="bg-zinc-950/40 border border-white/5 rounded-lg p-2.5">
                      <span className="text-[10px] text-zinc-500 font-mono tracking-wider block uppercase">Ano Lançamento</span>
                      <span className="text-xs font-semibold text-zinc-200 mt-0.5 block truncate flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                        {selectedGame.year}
                      </span>
                    </div>
                    <div className="bg-zinc-950/40 border border-white/5 rounded-lg p-2.5">
                      <span className="text-[10px] text-zinc-500 font-mono tracking-wider block uppercase">Jogadores</span>
                      <span className="text-xs font-semibold text-zinc-200 mt-0.5 block truncate flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-zinc-500" />
                        {selectedGame.players}
                      </span>
                    </div>
                    <div className="bg-zinc-950/40 border border-white/5 rounded-lg p-2.5">
                      <span className="text-[10px] text-zinc-500 font-mono tracking-wider block uppercase">Gênero</span>
                      <span className="text-xs font-semibold text-emerald-400 mt-0.5 block truncate flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-zinc-500" />
                        {selectedGame.genre}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Game description paragraph */}
              <div className="mt-6 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-[10px] font-retro text-zinc-500 tracking-widest uppercase mb-1.5">Descrição</h4>
                  <p id="game-detail-desc" className="text-sm text-zinc-400 leading-relaxed max-w-2xl bg-zinc-950/20 p-4 border border-white/5 rounded-xl">
                    {selectedGame.description}
                  </p>
                </div>

                {/* Play Button - Emulation Action Trigger */}
                <div className="mt-6 pt-4 border-t border-white/5 flex flex-col sm:flex-row gap-3 items-center justify-between">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${
                          i < selectedGame.rating 
                            ? 'text-yellow-400 fill-yellow-400' 
                            : 'text-zinc-700'
                        }`} 
                      />
                    ))}
                  </div>

                  <button
                    id="launch-game-btn"
                    onClick={() => handleLaunchGame(selectedGame)}
                    className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-zinc-950 font-retro text-xs rounded-full shadow-[0_4px_20px_rgba(16,185,129,0.25)] border-t border-white/25 hover:scale-[1.03] active:scale-[0.98] transition-all font-bold tracking-wider flex items-center justify-center gap-3 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-zinc-950 text-zinc-950" />
                    INICIAR JOGO
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center items-center text-center p-8 bg-zinc-900/40 border border-white/5 rounded-2xl">
              <Gamepad2 className="w-12 h-12 text-zinc-600 stroke-1 mb-2 animate-bounce" />
              <p className="text-zinc-500 text-sm">Selecione um game na lista para ver detalhes.</p>
            </div>
          )}
        </div>

      </main>

      {/* Styled controller helper status bar on footer */}
      <footer className="relative z-10 w-full bg-zinc-900/80 backdrop-blur-md border-t border-white/5 py-4 px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-zinc-400 text-[11px] font-mono tracking-wider">
        <div className="text-zinc-500">
          Navegue pelo catálogo com o teclado ou mouse. Pronto para <span className="text-white font-semibold">Retro-Emulação</span>.
        </div>
        <div className="flex items-center gap-4 text-[10px] text-zinc-500 font-retro">
          <span className="flex items-center gap-1"><span className="bg-zinc-800 text-zinc-200 px-1 py-0.5 rounded text-[8px]">↑↓</span> Selecionar</span>
          <span className="flex items-center gap-1"><span className="bg-zinc-800 text-zinc-200 px-1 py-0.5 rounded text-[8px]">ENTER</span> Iniciar</span>
          <span className="flex items-center gap-1"><span className="bg-zinc-800 text-zinc-200 px-1 py-0.5 rounded text-[8px]">ESC</span> Voltar</span>
        </div>
      </footer>

      {/* Retro Game Simulation Pop-over modal - Setup for full customizable EmulatorJS Integration */}
      <AnimatePresence>
        {emulatingGame && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-[2000] flex flex-col justify-between"
          >
            {/* Emulator Header */}
            <header className="bg-zinc-950/80 border-b border-white/5 p-4 flex justify-between items-center relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping mr-1" />
                <span className="font-retro text-[10px] text-zinc-300">EMULANDO VIA EMULATORJS</span>
                <span className="text-zinc-500">|</span>
                <span className="text-xs text-white font-bold">{emulatingGame.title} ({system.name})</span>
              </div>
              
              <button
                id="close-emulator-btn"
                onClick={handleCloseEmulator}
                className="px-4 py-1.5 rounded bg-red-600/10 border border-red-500/20 hover:bg-red-600 text-red-400 hover:text-white font-retro text-[9px] transition-colors cursor-pointer"
              >
                SAIR DA EMULAÇÃO (ESC)
              </button>
            </header>

            {/* Simulated Game Loop Screen */}
            <div className="flex-1 flex flex-col justify-center items-center relative bg-zinc-950 overflow-hidden">
              
              {/* Dynamic decorative scanlines overlay in emulator screen */}
              {isCrtOn && (
                <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden">
                  <div className="absolute inset-0 w-full h-[4px] bg-white/5 opacity-40 scanline-moving" />
                  <div 
                    className="absolute inset-0 opacity-[0.25]"
                    style={{
                      backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.45) 50%)',
                      backgroundSize: '100% 4px',
                    }}
                  />
                  <div className="absolute inset-0 bg-radial pointer-events-none" style={{ boxShadow: 'inset 0 0 120px rgba(0, 0, 0, 0.95)' }} />
                </div>
              )}

              {emulatorLoading && (
                <div id="emulator-boot-sequence" className="flex flex-col items-center justify-center space-y-6 max-w-md px-6 text-center">
                  <div className="w-16 h-16 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
                  <div>
                    <h5 className="font-retro text-xs text-emerald-400 mb-2">INICIALIZANDO MOTOR</h5>
                    <p className="text-xs text-zinc-400 font-mono tracking-widest uppercase">Carregando Core: {system.emulatorCore}.so</p>
                    <p className="text-[10px] text-zinc-600 mt-2 font-mono truncate max-w-xs">{emulatingGame.romUrl}</p>
                  </div>
                  <div className="bg-zinc-900 border border-white/5 p-4 rounded-xl text-left w-full text-[11px] font-mono text-zinc-400 space-y-1">
                    <p className="text-emerald-500">✔ EmulatorJS API loaded.</p>
                    <p className="text-emerald-500">✔ Rom size calculated (OK)</p>
                    <p className="text-zinc-500">✔ Mapping digital keyboard triggers...</p>
                  </div>
                </div>
              )}

              {emulatorActive && (
                <div id="emulator-game-canvas-screen" className="relative w-full h-full max-w-[1200px] aspect-[4/3] flex flex-col justify-center items-center bg-black border border-white/10 rounded-lg shadow-inner z-10 overflow-hidden">
                  
                  {/* Real visual placeholder showcasing retro aesthetic */}
                  <img
                    id="active-emulator-view"
                    src={emulatingGame.image}
                    alt={emulatingGame.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-70 filter saturate-[1.12]"
                  />

                  {/* Dark overlay for ambient menu */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/75 flex flex-col justify-between p-8" />

                  {/* Top Game UI HUD representation */}
                  <div className="relative w-full flex justify-between items-center text-xs font-mono px-4">
                    <div className="bg-black/60 px-3 py-1.5 rounded-md border border-white/10 text-emerald-400 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>FPS: 60.0</span>
                    </div>
                    <div className="bg-black/60 px-3 py-1.5 rounded-md border border-white/10 text-yellow-400 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5" />
                      <span>CORE: {system.emulatorCore.toUpperCase()}</span>
                    </div>
                  </div>

                  {/* Center UI Interactive controls info during emulation */}
                  <div className="relative text-center max-w-lg bg-zinc-950/85 backdrop-blur-md p-6 border border-white/10 rounded-2xl shadow-2xl mx-6">
                    <h6 className="font-retro text-sm text-emerald-400 mb-2">{emulatingGame.title}</h6>
                    <p className="text-xs text-zinc-300 leading-relaxed font-mono mt-2 mb-4">
                      Para emulação ao vivo, faça upload da ROM real do jogo ou configure arquivos no diretório correspondente. A estrutura já possui suporte a mapeamento retro-virtual.
                    </p>

                    <p className="font-retro text-[9px] text-zinc-500 tracking-wider mb-3">CONTRÓLES DO TECLADO SIMULADO</p>
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-left max-w-sm mx-auto">
                      <div className="flex items-center justify-between bg-white/5 py-1 px-2.5 rounded">
                        <span className="text-zinc-500">DIRECIONAIS:</span>
                        <span className="text-zinc-200">A, S, D, W</span>
                      </div>
                      <div className="flex items-center justify-between bg-white/5 py-1 px-2.5 rounded">
                        <span className="text-zinc-500">BOTÃO A:</span>
                        <span className="text-zinc-200">K</span>
                      </div>
                      <div className="flex items-center justify-between bg-white/5 py-1 px-2.5 rounded">
                        <span className="text-zinc-500">BOTÃO B:</span>
                        <span className="text-zinc-200">L</span>
                      </div>
                      <div className="flex items-center justify-between bg-white/5 py-1 px-2.5 rounded">
                        <span className="text-zinc-500">SELECT:</span>
                        <span className="text-zinc-200">SPACE</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom UI Bar */}
                  <div className="relative w-full flex items-center justify-center p-4">
                    <button
                      id="close-simulation"
                      onClick={handleCloseEmulator}
                      className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-lg font-mono text-xs transition active:scale-95 duration-100 font-bold tracking-wider cursor-pointer shadow-lg"
                    >
                      Pausar & Sair
                    </button>
                  </div>

                </div>
              )}

            </div>

            {/* Emulator Footer HUD */}
            <footer className="bg-zinc-950/80 border-t border-white/5 px-8 py-3 flex flex-col sm:flex-row justify-between items-center text-xs font-mono text-zinc-500">
              <div>
                ROM carregada: <span className="text-zinc-300">{emulatingGame.title}.gba</span>
              </div>
              <div className="flex items-center gap-4 text-[10px] text-zinc-500 font-retro">
                <span className="flex items-center gap-1"><span className="bg-zinc-900 text-zinc-200 px-1 py-0.5 rounded text-[8px]">ESC</span> Fechar Player</span>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
