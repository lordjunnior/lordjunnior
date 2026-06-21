/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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

// Mapeamento preciso de caminhos locais para as logos que você baixou na pasta public/logos/
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

// Vincula o ID do console a uma Fanart de alta resolução que vai dominar o lado esquerdo
const getSystemFanart = (id: string): string => {
  const cleanId = id.toLowerCase().trim();
  // Se você tiver as imagens locais guardadas em public/backgrounds/, mude o caminho aqui
  const map: Record<string, string> = {
    nes: 'https://images.alphacoders.com/605/605655.jpg',
    snes: 'https://images.alphacoders.com/134/1344445.png',
    n64: 'https://images.alphacoders.com/902/902047.jpg',
    megadrive: 'https://images.alphacoders.com/110/1105948.jpg',
    genesis: 'https://images.alphacoders.com/110/1105948.jpg',
    ps1: 'https://images.alphacoders.com/131/1317676.png',
    arcade: 'https://images.alphacoders.com/277/277651.jpg'
  };
  return map[cleanId] || 'https://images.alphacoders.com/134/1344445.png';
};

export const SystemCarousel: React.FC<SystemCarouselProps> = ({
  systems,
  activeIndex,
  setActiveIndex,
  onSelectSystem
}) => {
  const total = systems.length;

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

  return (
    <div className="fixed inset-0 w-full h-screen bg-[#040406] overflow-hidden flex items-center select-none font-sans">
      
      {/* LADO ESQUERDO: SPLASH ART EM TELA CHEIA (INSPIRADO NA IMAGEM 2) */}
      <div className="absolute inset-y-0 left-0 w-[65%] h-full overflow-hidden z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={`fanart-${activeSystem.id}`}
            initial={{ opacity: 0, scale: 1.08, x: -20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95, x: 10 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="w-full h-full bg-cover bg-center relative"
            style={{ backgroundImage: `url(${getSystemFanart(activeSystem.id)})` }}
          >
            {/* Gradiente agressivo para fundir a imagem com a roleta escura da direita */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/30 to-[#040406] z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 z-10" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* LADO DIREITO: A ROLETA ELÍPTICA DE CONSOLES (WHEEL LAYER - 45% DA TELA) */}
      <div 
        className="absolute inset-y-0 right-0 w-[45%] h-full bg-gradient-to-l from-black/90 via-[#050508]/98 to-transparent z-20 flex items-center justify-end overflow-hidden"
        style={{ perspective: 1200 }}
      >
        {/* Arco de fundo escuro imitando a carcaça da roleta das fotos */}
        <div className="absolute -right-[20vw] top-1/2 -translate-y-1/2 w-[55vw] h-[120vh] bg-black/60 rounded-full border border-white/5 backdrop-blur-sm pointer-events-none shadow-[inset_0_0_80px_rgba(0,0,0,0.9)]" />

        {/* Container dos itens da Roleta */}
        <div className="relative w-full h-[500px] flex items-center justify-end pr-[5vw] z-30">
          {systems.map((sys, idx) => {
            // Cálculo trigonométrico de deslocamento vertical e horizontal para criar o arco da roda
            const offset = idx - activeIndex;
            const isSelected = idx === activeIndex;
            
            // Limitador de renderização para exibir apenas os vizinhos mais próximos e não poluir a tela
            if (Math.abs(offset) > 3) return null;

            // Fórmulas matemáticas para desenhar a elipse perfeita baseada na distância do item ativo
            const rotateX = offset * -18; // Inclinação orbital
            const translateY = offset * 110; // Espaçamento vertical entre as logos
            const translateX = Math.abs(offset) * 35; // Curvatura para a direita (efeito de roda côncava)
            const scale = isSelected ? 1.22 : 0.82 - Math.abs(offset) * 0.08;

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
                  opacity: isSelected ? 1 : 0.45 - Math.abs(offset) * 0.1,
                }}
                transition={{ type: 'spring', stiffness: 190, damping: 19 }}
                className="absolute right-0 w-64 h-24 flex items-center justify-center cursor-pointer outline-none select-none group"
                style={{ transformOrigin: 'right center' }}
              >
                {/* Logo Vetorizada Local */}
                <div className="w-full h-full p-4 flex items-center justify-center relative transition-all duration-300">
                  {isSelected && (
                    <motion.div 
                      layoutId="wheel-glow"
                      className="absolute inset-0 bg-white/[0.03] border-y border-white/10 rounded-xl shadow-[0_0_40px_rgba(255,255,255,0.02)]"
                      transition={{ type: 'spring', stiffness: 190, damping: 19 }}
                    />
                  )}
                  <img
                    src={`/logos/${getLogoFileName(sys.id)}.png`}
                    alt={sys.name}
                    className={`max-w-full max-h-full object-contain filter transition-all duration-350 ${
                      isSelected 
                        ? 'drop-shadow-[0_0_20px_rgba(255,255,255,0.35)] brightness-110' 
                        : 'drop-shadow-[0_4px_8px_rgba(0,0,0,0.7)] group-hover:opacity-100 brightness-90 grayscale contrast-125'
                    }`}
                    onError={(e) => {
                      // Fallback em texto cru caso falte alguma logo
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* PAINEL INFERIOR DE COMANDOS (RODAPÉ ES OFICIAL - COPIADO DA IMAGEM 2) */}
      <footer className="absolute bottom-0 inset-x-0 h-14 bg-black border-t border-white/5 z-40 flex items-center justify-between px-10 font-sans select-none text-[11px] font-bold tracking-wider text-zinc-400">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="bg-zinc-800 text-white font-mono px-1.5 py-0.5 rounded shadow border border-white/5 uppercase">▲▼</span>
            <span>NAVEGAR</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-zinc-800 text-white font-mono px-1.5 py-0.5 rounded shadow border border-white/5 uppercase">ENTER</span>
            <span>SELECIONAR</span>
          </div>
        </div>

        {/* Contador oficial de jogos idêntico ao rodapé das fotos */}
        <div className="font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>{activeSystem.gameCount} JOGOS DISPONÍVEIS</span>
        </div>
      </footer>

    </div>
  );
};
