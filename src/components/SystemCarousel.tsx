import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { System } from '../types';
import { soundEngine } from './RetroSoundEngine';

interface SystemCarouselProps {
  systems: System[];
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  onSelectSystem: (system: System) => void;
}

// Mapeamento exato e tratado para o repositório do Recalbox
const getLogoFileName = (id: string): string => {
  const cleanId = id.toLowerCase().trim().replace(/[\s\-_]/g, '');
  const map: Record<string, string> = {
    snes: 'snes',
    supernintendo: 'snes',
    nes: 'nes',
    nintendo: 'nes',
    megadrive: 'megadrive',
    genesis: 'megadrive',
    sms: 'mastersystem',
    mastersystem: 'mastersystem',
    sega: 'megadrive',
    gamegear: 'gamegear',
    ps1: 'psx',
    psx: 'psx',
    playstation: 'psx',
    n64: 'n64',
    nintendo64: 'n64',
    atari: 'atari2600',
    atari2600: 'atari2600',
    arcade: 'mame',
    mame: 'mame',
    nds: 'nds',
    pce: 'pcengine',
    pcengine: 'pcengine',
    neogeo: 'neogeo',
    '3do': '3do',
    saturn: 'saturn',
    segasaturn: 'saturn'
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
      <div className="flex items-center justify-center p-3 bg-zinc-900/90 border border-white/10 rounded-xl max-w-[200px] shadow-lg select-none">
        <span className={`font-mono text-amber-400 tracking-widest font-black uppercase text-center ${isCompact ? 'text-[9px]' : 'text-xs'}`}>
          {system.shortName || system.name}
        </span>
      </div>
    );
  }

  return (
    <img
      src={`https://raw.githubusercontent.com/lordjunnior/recalbox-theme/main/assets/logos/${getLogoFileName(system.id)}.png`}
      alt={system.name}
      className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
      referrerPolicy="no-referrer"
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

  if (!systems || total === 0) return null;

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const nextIndex = (activeIndex - 1 + total) % total;
    setActiveIndex(nextIndex);
    soundEngine.playMove();
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const nextIndex = (activeIndex + 1) % total;
    setActiveIndex(nextIndex);
    soundEngine.playMove();
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (systems[activeIndex]) {
      // Substituído o playConfirm() fantasma pelo método select real do motor
      soundEngine.playSelect();
      onSelectSystem(systems[activeIndex]);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const nextIndex = (activeIndex - 1 + total) % total;
        setActiveIndex(nextIndex);
        soundEngine.playMove();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = (activeIndex + 1) % total;
        setActiveIndex(nextIndex);
        soundEngine.playMove();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (systems[activeIndex]) {
          // Corrigido também no evento global de escuta do teclado
          soundEngine.playSelect();
          onSelectSystem(systems[activeIndex]);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, systems, total]);

  const prevSystem = systems[(activeIndex - 1 + total) % total];
  const activeSystem = systems[activeIndex];
  const nextSystem = systems[(activeIndex + 1) % total];

  return (
    <div 
      style={{ position: 'fixed', zIndex: 99999, top: '50%', transform: 'translateY(-50%)' }}
      className="right-16 flex flex-col items-center gap-6 select-none pointer-events-auto bg-transparent"
    >
      {/* Seta Superior ▲ */}
      <button 
        onClick={handlePrev} 
        className="text-white/50 hover:text-white hover:scale-125 transition-all text-2xl cursor-pointer focus:outline-none p-2 relative z-[100000]"
      >
        ▲
      </button>

      {/* Pilha Vertical de Consoles */}
      <div className="flex flex-col items-center justify-center h-[360px] gap-2 relative z-[100000] pointer-events-auto">
        
        {/* CONSOLE ANTERIOR */}
        <div 
          onClick={handlePrev}
          className="h-16 w-36 opacity-20 scale-75 transition-all duration-300 flex items-center justify-center cursor-pointer hover:opacity-50"
        >
          <SafeConsoleLogo system={prevSystem} isCompact={true} />
        </div>

        {/* CONSOLE ATIVO */}
        <div 
          onClick={handleSelect}
          className="h-32 w-56 flex items-center justify-center cursor-pointer group relative my-4 bg-transparent pointer-events-auto z-[100001]"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSystem.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="w-full h-full flex items-center justify-center filter drop-shadow-[0_0_30px_rgba(255,255,255,0.4)] group-hover:scale-105 transition-transform duration-200"
            >
              <SafeConsoleLogo system={activeSystem} isCompact={false} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* CONSOLE PRÓXIMO */}
        <div 
          onClick={handleNext}
          className="h-16 w-36 opacity-20 scale-75 transition-all duration-300 flex items-center justify-center cursor-pointer hover:opacity-50"
        >
          <SafeConsoleLogo system={nextSystem} isCompact={true} />
        </div>

      </div>

      {/* TEXTO DE METADADOS */}
      <div className="text-center flex flex-col items-center gap-1 relative z-[100000]">
        <p className="text-white/80 text-[11px] font-retro tracking-widest uppercase">
          {activeSystem.name}
        </p>
        <p className="text-white/40 text-[9px] font-mono tracking-wider uppercase">
          {activeSystem.gameCount} jogos • {activeIndex + 1} / {total}
        </p>
      </div>

      {/* Seta Inferior ▼ */}
      <button 
        onClick={handleNext} 
        className="text-white/50 hover:text-white hover:scale-125 transition-all text-2xl cursor-pointer focus:outline-none p-2 relative z-[100000]"
      >
        ▼
      </button>

    </div>
  );
};