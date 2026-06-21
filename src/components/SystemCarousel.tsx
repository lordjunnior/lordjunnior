/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { System } from '../types';
import { soundEngine } from './RetroSoundEngine';

interface SystemCarouselProps {
  systems: System[];
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  onSelectSystem: (system: System) => void;
}

// DICIONÁRIO CORRIGIDO: Casado estritamente com os arquivos reais do seu GitHub
const getLogoFileName = (id: string): string => {
  const cleanId = id.toLowerCase().trim().replace(/[\s\-_]/g, '');
  const map: Record<string, string> = {
    snes: 'snes',
    supernintendo: 'snes',
    msu1: 'msu1',
    nes: 'nes',
    nintendo: 'nes',
    megadrive: 'segaMD', 
    genesis: 'segaMD',
    sega: 'segaMD',
    msumd: 'msu-md',     
    sms: 'mastersystem',
    mastersystem: 'mastersystem',
    gamegear: 'gamegear',
    ps1: 'ps1',
    psx: 'ps1',
    playstation: 'ps1',
    n64: 'n64',          
    nintendo64: 'n64',
    arcade: 'arcade',    
    mame: 'arcade',
    nds: 'nds',
    pce: 'pcecd',        
    pcengine: 'pcecd',
    neogeo: 'neogeo',
    '3do': '3do',        
    saturn: 'saturn',
    segasaturn: 'saturn',
    collections: 'Collections', 
    playlist: 'Collections'
  };
  return map[cleanId] || cleanId;
};

// Componente de renderização segura das logos dos emuladores na roleta
const SafeConsoleLogo: React.FC<{ system: System; isCompact?: boolean }> = ({ system, isCompact }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [system.id]);

  if (hasError) {
    return (
      <span className="font-retro text-[11px] text-zinc-500 uppercase tracking-widest font-bold">
        {system.name}
      </span>
    );
  }

  return (
    <img
      src={`/logos/${getLogoFileName(system.id)}.png`}
      alt={system.name}
      className={`max-w-full max-h-full object-contain filter transition-all duration-200 ${
        isCompact 
          ? 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] opacity-40 grayscale contrast-125' 
          : 'drop-shadow-[0_0_15px_rgba(255,255,255,0.45)] brightness-110'
      }`}
      onError={() => setHasError(true)}
    />
  );
};

export const SystemCarousel: React.FC<SystemCarouselProps> = ({
  systems,
  activeIndex,
  setActiveIndex,
  onSelectSystem
}) => {
  const total = systems.length;
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  if (!systems || total === 0) return null;

  const handlePrev = () => {
    const nextIndex = (activeIndex - 1 + total) % total;
    setActiveIndex(nextIndex);
    soundEngine.playMove();
  };

  const handleNext = () => {
    const nextIndex = (activeIndex + 1) % total;
    setActiveIndex(nextIndex);
    soundEngine.playMove();
  };

  const handleSelect = () => {
    if (systems[activeIndex]) {
      soundEngine.playSelect();
      onSelectSystem(systems[activeIndex]);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleSelect();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, systems, total]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeEl = scrollContainerRef.current.children[activeIndex] as HTMLElement;
      if (activeEl) {
        const parentHeight = scrollContainerRef.current.offsetHeight;
        const itemHeight = activeEl.offsetHeight;
        const topPos = activeEl.offsetTop;
        scrollContainerRef.current.scrollTo({
          top: topPos - parentHeight / 2 + itemHeight / 2,
          behavior: 'smooth'
        });
      }
    }
  }, [activeIndex]);

  const activeSystem = systems[activeIndex];
  const consoleId = getLogoFileName(activeSystem.id);

  return (
    <div className="fixed inset-0 w-full h-screen bg-[#040406] overflow-hidden flex items-center select-none font-sans">
      
      {/* CAMADA 1: VÍDEO DE PREVIEW DO CONSOLE ATIVO (RODANDO ATRÁS DO BURACO DA TV ARCADIA) */}
      <div className="absolute top-[17.5%] left-[6.8%] w-[33.6vw] aspect-[4/3] bg-black z-10 overflow-hidden rounded-[10px]">
        <video
          key={`console-preview-${activeSystem.id}`}
          src={`/video/${activeSystem.id}.mp4`} 
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover filter contrast-[1.15] saturate-[1.10] brightness-[1.02]"
        />
        <div 
          className="absolute inset-0 pointer-events-none opacity-15 mix-blend-overlay z-20"
          style={{ backgroundImage: 'linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.4) 50%)', backgroundSize: '100% 4px' }}
        />
      </div>

      {/* CAMADA 2: OVERLAY DA MÁSCARA PNG DA PASTA BACKGROUNDS TRANSPARENTE */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center z-20 pointer-events-none"
        style={{ backgroundImage: `url(/logos/backgrounds/${consoleId}.png)` }}
      />

      {/* CAMADA 3: ESPIRAL DE LOGOS DOS EMULADORES (ROLA NO ESPAÇO DIREITO DA TELA VAZADA) */}
      <div className="absolute top-0 right-0 w-[45vw] h-full z-30 flex items-center justify-center overflow-hidden" style={{ perspective: 1000 }}>
        <div ref={scrollContainerRef} className="relative w-full h-[460px] flex items-center justify-center">
          {systems.map((sys, idx) => {
            const offset = idx - activeIndex;
            const isSelected = idx === activeIndex;

            if (Math.abs(offset) > 3) return null;

            // Curvatura elíptica calibrada perfeitamente no terço direito visível
            const rotateX = offset * -15;
            const translateY = offset * 85;
            const translateX = Math.abs(offset) * 22;
            const scale = isSelected ? 1.25 : 0.85 - Math.abs(offset) * 0.05;

            return (
              <motion.div
                key={sys.id}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isSelected) {
                    setActiveIndex(idx);
                    soundEngine.playMove();
                  } else {
                    handleSelect();
                  }
                }}
                animate={{
                  y: translateY,
                  x: translateX,
                  scale: scale,
                  rotateX: rotateX,
                  opacity: isSelected ? 1 : 0.35 - Math.abs(offset) * 0.08,
                }}
                transition={{ type: 'spring', stiffness: 180, damping: 18 }}
                className="absolute w-64 h-16 flex items-center justify-center cursor-pointer select-none"
                style={{ transformOrigin: 'center center' }}
              >
                <div className="w-full h-full p-2 flex items-center justify-center relative">
                  <SafeConsoleLogo system={sys} isCompact={!isSelected} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* RODAPÉ DO MENU PRINCIPAL */}
      <footer className="absolute bottom-0 inset-x-0 h-10 bg-black/40 border-t border-white/5 backdrop-blur z-40 flex items-center justify-between px-10 font-sans text-[10px] font-bold text-zinc-500 tracking-wider">
        <div className="flex items-center gap-4">
          <span>▲▼ MUDAR SISTEMA</span>
          <span>•</span>
          <span>ENTER CONFIRMAR</span>
        </div>
        <div className="font-mono text-[9px] tracking-widest uppercase text-zinc-600">
          SISTEMA PRONTO
        </div>
      </footer>

    </div>
  );
};
