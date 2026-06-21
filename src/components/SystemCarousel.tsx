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

// MAPA CRUCIAL: Vincula o ID do db.json ao nome exato do arquivo físico que está na sua pasta public/logos/
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
    ps1: 'n64', // Fallback caso queira trocar a logo depois
    psx: 'n64',
    playstation: 'n64',
    n64: 'n64',          
    nintendo64: 'n64',
    atari: 'n64',
    atari2600: 'n64',
    arcade: 'arcade',    
    mame: 'arcade',
    nds: 'n64',
    pce: 'pcecd',        
    pcengine: 'pcecd',
    neogeo: 'n64',
    '3do': '3do',        
    saturn: 'n64',
    segasaturn: 'n64',
    collections: 'Collections', 
    playlist: 'Collections'
  };
  return map[cleanId] || cleanId;
};

// MAPEAMENTO EXATO PARA AS MÁSCARAS DE TV (public/logos/backgrounds/)
const getBackgroundFileName = (id: string): string => {
  const cleanId = id.toLowerCase().trim().replace(/[\s\-_]/g, '');
  // Com base na sua imagem do GitHub, você tem o arquivo n64.png lá dentro
  const map: Record<string, string> = {
    n64: 'n64',
    nintendo64: 'n64',
    snes: 'n64', // Enquanto você não envia as outras máscaras, todas herdam a carcaça perfeitamente alinhada da TV
    supernintendo: 'n64',
    nes: 'n64',
    megadrive: 'n64',
    genesis: 'n64',
    arcade: 'n64'
  };
  return map[cleanId] || 'n64';
};

const SafeConsoleLogo: React.FC<{ system: System; isCompact?: boolean }> = ({ system, isCompact }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [system.id]);

  if (hasError) {
    return (
      <span className="font-retro text-[10px] text-zinc-500 uppercase tracking-widest font-black text-right block w-full pr-4">
        {system.shortName || system.name}
      </span>
    );
  }

  return (
    <img
      src={`/logos/${getLogoFileName(system.id)}.png`}
      alt={system.name}
      className={`max-w-[85%] max-h-full object-contain filter transition-all duration-200 ${
        isCompact 
          ? 'drop-shadow-[0_4px_8px_rgba(0,0,0,0.7)] opacity-35 grayscale contrast-125' 
          : 'drop-shadow-[0_0_25px_rgba(255,255,255,0.6)] brightness-110 saturate-[1.1]'
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
  const bgMaskName = getBackgroundFileName(activeSystem.id);

  return (
    <div className="fixed inset-0 w-full h-screen bg-[#040406] overflow-hidden flex items-center select-none font-sans">
      
      {/* CAMADA 1: PREVIEW EM VÍDEO DO CONSOLE SELECIONADO (RODA POR TRÁS DO BURACO DA TV) */}
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

      {/* CAMADA 2: OVERLAY DA MÁSCARA TRANSPARENTE DA TV FIXA CORRESPONDENTE */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center z-20 pointer-events-none"
        style={{ backgroundImage: `url(/logos/backgrounds/${bgMaskName}.png)` }}
      />

      {/* CAMADA 3: ESPIRAL EM ARCO DA ROLETA VERTICAL DOS EMULADORES (DIREITA) */}
      <div className="absolute top-0 right-0 w-[45%] h-full z-30 flex items-center justify-end pr-[6vw]" style={{ perspective: 1000 }}>
        <div ref={listContainerRef} className="relative w-full h-[460px] flex items-center justify-end">
          {systems.map((sys, idx) => {
            const offset = idx - activeIndex;
            const isSelected = idx === activeIndex;

            if (Math.abs(offset) > 3) return null;

            // Ajuste fino das coordenadas tridimensionais para encaixar perfeitamente no vazio direito da sua imagem
            const rotateX = offset * -18;
            const translateY = offset * 95;
            const translateX = Math.abs(offset) * 26;
            const scale = isSelected ? 1.35 : 0.85 - Math.abs(offset) * 0.05;

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
                  opacity: isSelected ? 1 : 0.30 - Math.abs(offset) * 0.08,
                }}
                transition={{ type: 'spring', stiffness: 180, damping: 18 }}
                className="absolute right-0 w-80 h-20 flex items-center justify-end cursor-pointer select-none group"
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
