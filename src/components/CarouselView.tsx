/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { System } from '../types';
import { soundEngine } from './RetroSoundEngine';
import { ChevronLeft, ChevronRight, Volume2, VolumeX, Tv, HardDrive } from 'lucide-react';

interface CarouselViewProps {
  systems: System[];
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  onSelectSystem: (system: System) => void;
  isMuted: boolean;
  toggleMute: () => void;
  isCrtOn: boolean;
  toggleCrt: () => void;
}

export const CarouselView: React.FC<CarouselViewProps> = ({
  systems,
  activeIndex,
  setActiveIndex,
  onSelectSystem,
  isMuted,
  toggleMute,
  isCrtOn,
  toggleCrt,
}) => {
  const [time, setTime] = useState('');

  // Keeps time in tabular sync
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      const h = String(d.getHours()).padStart(2, '0');
      const m = String(d.getMinutes()).padStart(2, '0');
      setTime(`${h}:${m}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const activeSystem = systems[activeIndex];

  // Calculated next and prev indices for preview layout
  const prevIndex = (activeIndex - 1 + systems.length) % systems.length;
  const nextIndex = (activeIndex + 1) % systems.length;

  const handlePrev = () => {
    setActiveIndex(prevIndex);
    soundEngine.playMove();
  };

  const handleNext = () => {
    setActiveIndex(nextIndex);
    soundEngine.playMove();
  };

  const handleSelect = () => {
    soundEngine.playSelect();
    onSelectSystem(activeSystem);
  };

  // Keyboard navigation for Carousel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'Enter') {
        handleSelect();
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
  }, [activeIndex, systems, isMuted, isCrtOn]);

  return (
    <div id="carousel-container" className="relative w-full h-screen font-sans text-white overflow-hidden bg-zinc-950 flex flex-col justify-between select-none">
      
      {/* Decorative top lighting glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(59,130,246,0.15),transparent)] pointer-events-none" />

      {/* Dynamic Background Image Layer with Zoom and Cross-Fade */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence>
          <motion.div
            key={activeSystem.id}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 0.32, scale: 1.05 }}
            exit={{ opacity: 0, scale: 1.0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 w-full h-full bg-cover bg-center mix-blend-overlay"
            style={{ backgroundImage: `url(${activeSystem.backgroundImage})` }}
          />
        </AnimatePresence>
        {/* Ambient Dark Gradient Layer for rich contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-zinc-950" />
      </div>

      {/* Top Status Bar (Based exactly on Vibrant Palette theme) */}
      <header className="relative z-10 h-16 flex items-center justify-between px-10 border-b border-white/5 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse pulse-led"></div>
            <span className="text-xs font-bold tracking-widest text-zinc-400 uppercase font-mono">RETRO ONLINE</span>
          </div>
          <span className="text-xs font-medium text-zinc-500 font-mono">v2.10.8-RECAL</span>
        </div>

        {/* Dynamic Digital Clock from Vibrant Palette */}
        <div className="flex items-center gap-8">
          <div className="flex gap-4">
            {/* Custom controls directly accessible in top-bar */}
            <button 
              id="btn-nav-mute"
              onClick={() => { toggleMute(); soundEngine.playToggle(); }}
              className="text-zinc-400 hover:text-white transition duration-150 p-1 rounded hover:bg-white/5"
              title={isMuted ? "Desmutar" : "Mutar"}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
            <button 
              id="btn-nav-crt"
              onClick={() => { toggleCrt(); soundEngine.playToggle(); }}
              className="text-zinc-400 hover:text-white transition duration-150 p-1 rounded hover:bg-white/5"
              title={isCrtOn ? "Ativar CRT" : "Desativar CRT"}
            >
              <Tv className={`w-4 h-4 ${isCrtOn ? 'text-emerald-400' : ''}`} />
            </button>
          </div>
          <span className="text-2xl font-black text-white/90 tabular-nums font-mono tracking-tight">
            {time || '12:00'}
          </span>
        </div>
      </header>

      {/* Main Wheel Carousel layout */}
      <main className="relative z-10 flex-1 flex flex-col justify-center overflow-hidden w-full px-4 sm:px-12">
        <div className="relative flex items-center justify-center gap-12 py-12">
          
          {/* Prevent circular layout overflow helper arrows absolute */}
          <button
            id="nav-left"
            onClick={handlePrev}
            className="absolute left-4 xl:left-12 z-30 w-12 h-12 bg-black/50 hover:bg-white/10 text-white rounded-full flex justify-center items-center border border-white/10 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Left Neighbor Console representation as defined in Vibrant Palette (grayscale partial preview) */}
          <div 
            onClick={() => { setActiveIndex(prevIndex); soundEngine.playMove(); }} 
            className="hidden md:flex w-48 h-64 bg-white/5 border border-white/10 rounded-2xl flex-col items-center justify-center grayscale opacity-40 blur-[0.5px] cursor-pointer hover:opacity-60 transition duration-300"
          >
            <div className="w-32 h-16 bg-zinc-800/60 rounded-xl flex items-center justify-center mb-4 border border-white/5 p-2">
              <span className="font-retro text-[10px] text-zinc-400 text-center tracking-tighter uppercase truncate w-full">{systems[prevIndex].logo}</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-tighter">
              {systems[prevIndex].gameCount} JOGOS
            </span>
          </div>

          {/* ACTIVE SYSTEM (Centerpiece) - Elaborated carefully inside card with glowing effect according to instructions */}
          <div 
            onClick={handleSelect}
            className="w-full max-w-[520px] h-[360px] bg-gradient-to-br from-white/10 to-transparent border-2 border-white/20 rounded-[40px] shadow-[0_0_80px_rgba(255,255,255,0.05)] flex flex-col items-center justify-center relative select-none hover:border-white/30 transition duration-300 cursor-pointer"
          >
            {/* The Vibrant Palette glow behind active system */}
            <div className="absolute -inset-1.5 bg-gradient-to-r from-red-600 via-blue-600 to-green-600 rounded-[42px] opacity-25 blur-xl group-hover:opacity-35 transition duration-300 pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center p-6 text-center w-full">
              
              {/* Colored pill visual decoration directly mirroring Super Nintendo template */}
              <div className="mb-6 flex flex-col items-center">
                <div className="flex gap-1.5 mb-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>

                <span className="font-retro text-md sm:text-xl font-bold tracking-tight text-white drop-shadow-md glow-active">
                  {activeSystem.logo}
                </span>
                
                <div className="h-0.5 w-32 bg-gradient-to-r from-transparent via-white/40 to-transparent mt-2"></div>
              </div>

              {/* Game count badge display */}
              <div className="flex flex-col items-center gap-1">
                <span className="text-5xl sm:text-6xl font-black text-white tracking-tighter tabular-nums drop-shadow-sm">
                  {activeSystem.gameCount}
                </span>
                <span className="text-[10px] font-retro text-zinc-400 uppercase tracking-widest">
                  Jogos Disponíveis
                </span>
              </div>
            </div>

            {/* Quick Info Stickers overlay at card bottom */}
            <div className="absolute bottom-6 left-8 flex gap-3 text-zinc-300 font-mono">
              <div className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold">
                {activeSystem.releaseYear}
              </div>
              <div className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                {activeSystem.manufacturer.split(' ')[0]}
              </div>
            </div>
          </div>

          {/* Right Neighbor Console representation as defined in Vibrant Palette (grayscale partial preview) */}
          <div 
            onClick={() => { setActiveIndex(nextIndex); soundEngine.playMove(); }} 
            className="hidden md:flex w-48 h-64 bg-white/5 border border-white/10 rounded-2xl flex-col items-center justify-center grayscale opacity-40 blur-[0.5px] cursor-pointer hover:opacity-60 transition duration-300"
          >
            <div className="w-32 h-16 bg-zinc-800/60 rounded-xl flex items-center justify-center mb-4 border border-white/5 p-2">
              <span className="font-retro text-[10px] text-zinc-400 text-center tracking-tighter uppercase truncate w-full">{systems[nextIndex].logo}</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-tighter">
              {systems[nextIndex].gameCount} JOGOS
            </span>
          </div>

          <button
            id="nav-right"
            onClick={handleNext}
            className="absolute right-4 xl:right-12 z-30 w-12 h-12 bg-black/50 hover:bg-white/10 text-white rounded-full flex justify-center items-center border border-white/10 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

        </div>

        {/* Console info description on bottom overview */}
        <div className="mt-4 mb-2 max-w-lg mx-auto text-center z-10 px-6">
          <h3 className="text-lg font-bold text-white/90 font-display">{activeSystem.name}</h3>
          <p className="text-xs text-zinc-400 leading-relaxed mt-1">
            Plataforma clássica desenvolvida por {activeSystem.manufacturer}. Acesse o catálogo para reviver títulos históricos emulados.
          </p>
        </div>

      </main>

      {/* Controller bar footer layout exactly matching original "Vibrant Palette" details */}
      <footer className="h-[84px] bg-white text-zinc-900 flex items-center justify-between px-10 gap-6 relative z-10 font-sans shadow-2xl">
        <div className="flex flex-wrap items-center gap-6 sm:gap-10">
          
          <div onClick={handleSelect} className="flex items-center gap-3 cursor-pointer group">
            <div className="w-6 h-6 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-retro font-bold p-1 border border-zinc-950 group-hover:scale-110 active:scale-90 transition">A</div>
            <span className="text-[11px] font-black uppercase tracking-widest text-zinc-800">Launch</span>
          </div>

          <div onClick={handleNext} className="flex items-center gap-3 cursor-pointer group">
            <div className="w-6 h-6 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-retro font-bold p-1 border border-zinc-950 group-hover:scale-110 active:scale-90 transition">▶</div>
            <span className="text-[11px] font-black uppercase tracking-widest text-zinc-800">Próximo</span>
          </div>

          <div onClick={() => { toggleCrt(); soundEngine.playToggle(); }} className="flex items-center gap-3 cursor-pointer group">
            <div className="w-6 h-6 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-retro font-bold p-1 border border-zinc-950 group-hover:scale-110 active:scale-90 transition">C</div>
            <span className="text-[11px] font-black uppercase tracking-widest text-zinc-800">CRT</span>
          </div>

          <div onClick={() => { toggleMute(); soundEngine.playToggle(); }} className="flex items-center gap-3 cursor-pointer group">
            <div className="w-6 h-6 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-retro font-bold p-1 border border-zinc-950 group-hover:scale-110 active:scale-90 transition">M</div>
            <span className="text-[11px] font-black uppercase tracking-widest text-zinc-800">Mute</span>
          </div>

        </div>

        {/* Right side Storage specs indicator */}
        <div className="hidden sm:flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-black uppercase text-zinc-400 leading-none tracking-wider">Armazenamento</span>
            <span className="text-xs font-black text-zinc-800">64.2 GB / 128 GB</span>
          </div>
          <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center text-zinc-700 hover:text-black hover:bg-zinc-200 transition">
            <HardDrive className="w-5 h-5" />
          </div>
        </div>
      </footer>

    </div>
  );
};
