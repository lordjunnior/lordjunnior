/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Gamepad2 } from 'lucide-react';
import { System } from '../types';
import { soundEngine } from './RetroSoundEngine';
import { motion, AnimatePresence } from 'motion/react';

interface SystemCarouselProps {
  systems: System[];
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  onSelectSystem: (system: System) => void;
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
    '3do': '3do',
    neogeopocket: 'ngp',
    turbografx: 'pcengine',
    fba_libretro: 'fba'
  };
  return map[id] || id;
};

export const SystemCarousel: React.FC<SystemCarouselProps> = ({
  systems,
  activeIndex,
  setActiveIndex,
  onSelectSystem
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [listImageErrors, setListImageErrors] = useState<Record<string, boolean>>({});

  const activeSystem = systems[activeIndex];

  const handlePrev = () => {
    setActiveIndex((activeIndex - 1 + systems.length) % systems.length);
    soundEngine.playMove();
  };

  const handleNext = () => {
    setActiveIndex((activeIndex + 1) % systems.length);
    soundEngine.playMove();
  };

  const handleSelect = () => {
    soundEngine.playSelect();
    onSelectSystem(activeSystem);
  };

  // Setup keyboard event listeners for quick navigation (Supports Up/Down and Left/Right keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleSelect();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, systems]);

  // Center the active element within the scroll volume viewport
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const activeElement = container.children[activeIndex] as HTMLElement;
      if (activeElement) {
        const offsetTop = activeElement.offsetTop;
        const offsetHeight = activeElement.offsetHeight;
        const containerHeight = container.offsetHeight;
        container.scrollTo({
          top: offsetTop - containerHeight / 2 + offsetHeight / 2,
          behavior: 'smooth'
        });
      }
    }
  }, [activeIndex]);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none select-none">
      {/* 1. LOGO DO CONSOLE - Canto superior esquerdo (flutuando livre sobre o background) */}
      <div className="absolute top-8 left-8 sm:left-10 z-20 pointer-events-none">
        {imageErrors[activeSystem.id] ? (
          <span className="font-retro text-4xl font-black uppercase text-zinc-100 glow-active select-none tracking-widest pl-2">
            {activeSystem.logo}
          </span>
        ) : (
          <motion.img
            key={`logo-${activeSystem.id}`}
            initial={{ opacity: 0, x: -30, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -30, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 120, damping: 18 }}
            src={`https://raw.githubusercontent.com/lordjunnior/recalbox-theme/main/assets/logos/${getLogoFileName(activeSystem.id)}.png`}
            alt={activeSystem.name}
            referrerPolicy="no-referrer"
            className="h-32 w-auto max-w-xs object-contain drop-shadow-[0_0_40px_rgba(255,255,255,0.7)]"
            onError={() => {
              setImageErrors((prev) => ({ ...prev, [activeSystem.id]: true }));
            }}
          />
        )}
      </div>

      {/* 2. INFO DO CONSOLE - Canto inferior esquerdo */}
      <div className="absolute bottom-6 left-8 sm:left-10 z-20 flex flex-col pointer-events-auto max-w-xs sm:max-w-md lg:max-w-lg">
        <motion.span 
          key={`sub-${activeSystem.id}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-retro text-[10px] text-[#E60012] tracking-[0.3em] uppercase block mb-1 font-bold"
        >
          {activeSystem.manufacturer}
        </motion.span>
        
        <motion.h2 
          key={`name-${activeSystem.id}`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight text-white uppercase leading-none mb-2"
        >
          {activeSystem.name}
        </motion.h2>

        <motion.div 
          key={`detail-${activeSystem.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3 text-xs font-mono text-zinc-300 font-bold tracking-wider mb-2"
        >
          <span className="bg-[#E60012] text-white px-2 py-0.5 rounded text-[10px] font-retro">
            {activeSystem.releaseYear}
          </span>
          <span>•</span>
          <span>{activeSystem.gameCount} JOGOS DISPONÍVEIS</span>
        </motion.div>

        <motion.p 
          key={`description-${activeSystem.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="hidden md:block text-zinc-400 text-xs leading-relaxed font-sans font-medium"
        >
          Desenvolvido pela lendária equipe da {activeSystem.manufacturer}.
          Lançamentos históricos que marcaram para sempre a história dos videogames estão reunidos aqui.
        </motion.p>
      </div>

      {/* 3. LISTA DE CONSOLES - Lateral direita (Fundo escuro translúcido com blur para destacar artwork) */}
      <div className="absolute right-0 top-0 h-full w-72 sm:w-80 z-20 flex flex-col bg-black/40 backdrop-blur-sm border-l border-white/5 pointer-events-auto">
        <div className="px-6 py-5 border-b border-white/5">
          <span className="font-retro text-[10px] text-zinc-400 tracking-widest block font-bold">
            CONSOLES DISPONÍVEIS
          </span>
          <span className="text-[10px] font-mono text-zinc-500 uppercase mt-0.5 block font-bold">
            {systems.length} sistemas carregados
          </span>
        </div>

        {/* Scrollable vertical list */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto py-4 pl-3 pr-4 space-y-2.5 no-scrollbar scroll-smooth"
        >
          {systems.map((system, idx) => {
            const isActive = idx === activeIndex;
            const sysLogoName = getLogoFileName(system.id);
            const hasLogoError = listImageErrors[system.id];

            return (
              <button
                key={system.id}
                onClick={() => {
                  if (isActive) {
                    handleSelect();
                  } else {
                    setActiveIndex(idx);
                    soundEngine.playMove();
                  }
                }}
                className={`w-full text-left flex items-center justify-between p-3.5 rounded-r-lg transition-all duration-300 group cursor-pointer ${
                  isActive
                    ? 'bg-red-600/30 border-l-4 border-red-500 shadow-[0_0_15px_rgba(230,0,18,0.15)] pl-4'
                    : 'bg-white/5 border-l-4 border-transparent hover:bg-white/10 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div className="flex flex-col gap-1.5 min-w-0">
                  {/* Console Logo (small h-6) */}
                  <div className="h-6 flex items-center">
                    {hasLogoError ? (
                      <span className={`font-retro text-[10px] font-black leading-none uppercase select-none tracking-wider ${
                        isActive ? 'text-white' : 'text-zinc-500'
                      }`}>
                        {system.logo}
                      </span>
                    ) : (
                      <img
                        src={`https://raw.githubusercontent.com/lordjunnior/recalbox-theme/main/assets/logos/${sysLogoName}.png`}
                        alt={`${system.name} Logo`}
                        className="h-6 w-auto object-contain filter brightness-105"
                        referrerPolicy="no-referrer"
                        onError={() => {
                          setListImageErrors((prev) => ({ ...prev, [system.id]: true }));
                        }}
                      />
                    )}
                  </div>

                  {/* Nome do console em texto menor abaixo */}
                  <div className="flex flex-col">
                    <span className={`text-[11px] uppercase tracking-wide truncate ${
                      isActive ? 'text-white font-black' : 'text-zinc-400 font-bold'
                    }`}>
                      {system.name}
                    </span>
                    <span className="text-[8px] font-mono text-zinc-500 uppercase leading-none mt-0.5">
                      {system.manufacturer}
                    </span>
                  </div>
                </div>

                {/* Quantidade de jogos alinhada à direita */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded transition-colors ${
                    isActive 
                      ? 'bg-red-500/20 text-red-150 font-bold' 
                      : 'bg-white/5 text-zinc-500 group-hover:text-zinc-400'
                  }`}>
                    {system.gameCount} G
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. BOTÃO ACESSAR - Centro inferior */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 lg:left-[calc(50%-140px)] z-20 flex flex-col items-center gap-2 pointer-events-auto">
        <motion.button
          onClick={handleSelect}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-3.5 bg-gradient-to-r from-[#E60012] to-red-600 hover:from-red-500 hover:to-red-600 text-white font-retro text-[10px] rounded-full border-t border-white/20 shadow-[0_5px_22px_rgba(230,0,18,0.35)] transition-all flex items-center gap-2.5 font-black uppercase cursor-pointer pointer-events-auto"
        >
          <Gamepad2 className="w-4 h-4 fill-white" />
          Acessar Catálogo
        </motion.button>
      </div>
    </div>
  );
};