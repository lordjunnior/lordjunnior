/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { System } from '../types';
import { soundEngine } from './RetroSoundEngine';

interface SystemCarouselProps {
  systems: System[];
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  onSelectSystem: (system: System) => void;
}

// MAPA DE LOGOS: Casado de forma milimétrica com as imagens da sua pasta public/logos/
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
    ps1: 'playstation',
    psx: 'playstation',
    playstation: 'playstation',
    n64: 'n64',          
    nintendo64: 'n64',
    atari: 'atari',
    atari2600: 'atari',
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

const SafeConsoleLogo: React.FC<{ system: System; isCompact?: boolean }> = ({ system, isCompact }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [system.id]);

  if (hasError) {
    return (
      <span className="font-retro text-[10px] text-zinc-400 uppercase tracking-widest font-black text-right block w-full pr-4">
        {system.shortName || system.name}
      </span>
    );
  }

  // Traz de volta o brilho e remove o preto e branco agressivo das logos ativas
  return (
    <img
      src={`/logos/${getLogoFileName(system.id)}.png`}
      alt={system.name}
      className={`max-w-[90%] max-h-full object-contain filter transition-all duration-200 ${
        isCompact 
          ? 'drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)] opacity-45 grayscale contrast-110 group-hover:opacity-75' 
          : 'drop-shadow-[0_0_25px_rgba(255,255,255,0.5)] brightness-110 saturate-[1.15]'
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
  const listContainerRef = useRef<HTMLDivElement>(null);

  if (!systems || total === 0) return null;

  const handleNext = () => {
    const nextIndex = (activeIndex + 1) % total;
    setActiveIndex(nextIndex);
    soundEngine.playMove();
  };

  const handlePrev = () => {
    const nextIndex = (activeIndex - 1 + total) % total;
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
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowDown') {
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

  const activeSystem = systems[activeIndex];
  const consoleId = getLogoFileName(activeSystem.id);

  return (
    <div className="fixed inset-0 w-full h-screen bg-[#040406] overflow-hidden flex items-center select-none font-sans">
      
      {/* CAMADA 1: VIDEO PREVIEW (ATRÁS DA MÁSCARA) */}
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

      {/* CAMADA 2: OVERLAY DE BACKGROUND DINÂMICO DE ACORDO COM O CONSOLE SELECIONADO */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center z-20 pointer-events-none"
        style={{ backgroundImage: `url(/logos/backgrounds/${consoleId}.png)` }}
      />

      {/* CAMADA 3: ROLETA VERTICAL DOS EMULADORES CALIBRADA PARA DENTRO DA TELA */}
      <div className="absolute top-0 right-0 w-[45%] h-full z-30 flex items-center justify-end pr-[8vw]" style={{ perspective: 1000 }}>
        <div ref={listContainerRef} className="relative w-full h-[480px] flex items-center justify-end">
          {systems.map((sys, idx) => {
            const offset = idx - activeIndex;
            const isSelected = idx === activeIndex;

            if (Math.abs(offset) > 3) return null;

            // Recalibrado para trazer os itens de volta ao campo de visão real
            const rotateX = offset * -15;
            const translateY = offset * 90;
            const translateX = Math.abs(offset) * 24;
            const scale = isSelected ? 1.30 : 0.85 - Math.abs(offset) * 0.05;

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
                  opacity: isSelected ? 1 : 0.45 - Math.abs(offset) * 0.08,
                }}
                transition={{ type: 'spring', stiffness: 170, damping: 18 }}
                className="absolute right-0 w-80 h-16 flex items-center justify-end cursor-pointer select-none group"
                style={{ transformOrigin: 'right center' }}
              >
                <div className="w-full h-full p-2 flex items-center justify-end relative">
                  <SafeConsoleLogo system={sys} isCompact={!isSelected} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
