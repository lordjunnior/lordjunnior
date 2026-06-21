/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { System } from '../types';
import { soundEngine } from './RetroSoundEngine';
import { Gamepad2, Cpu, Calendar, Archive } from 'lucide-react';

interface SystemCarouselProps {
  systems: System[];
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  onSelectSystem: (system: System) => void;
}

interface SystemTechSpecs {
  manufacturer: string;
  generation: string;
  cpu: string;
  ram: string;
  media: string;
  releaseYear: string;
  accentColor: string;
  glowColor: string;
  hardwareSummary: string;
}

const systemSpecsMap: Record<string, SystemTechSpecs> = {
  nes: {
    manufacturer: "Nintendo",
    generation: "8-Bits (3ª Geração)",
    cpu: "Ricoh 2A03 8-bit @ 1.79 MHz",
    ram: "2 KB RAM principal",
    media: "Cartuchos (NES-Cart)",
    releaseYear: "1983 (Japão) / 1985 (EUA)",
    accentColor: "from-red-600 via-rose-700 to-zinc-900",
    glowColor: "rgba(239, 68, 68, 0.5)",
    hardwareSummary: "O lendário console 8-bits da Nintendo que recuperou a indústria de games em 1985 e imortalizou Mario, Zelda e Metroid."
  },
  snes: {
    manufacturer: "Nintendo",
    generation: "16-Bits (4ª Geração)",
    cpu: "Ricoh 5A22 16-bit @ 3.58 MHz",
    ram: "128 KB RAM dedicada",
    media: "Cartuchos Super FX / DSP",
    releaseYear: "1990 (Japão) / 1991 (EUA)",
    accentColor: "from-purple-600 via-indigo-700 to-zinc-900",
    glowColor: "rgba(139, 92, 246, 0.5)",
    hardwareSummary: "Clássico supremo do design 16-bits. Consolidou lendários RPGs tridimensionais, efeitos de rotação Mode 7 e som estéreo de altíssima qualidade."
  },
  n64: {
    manufacturer: "Nintendo",
    generation: "64-Bits (5ª Geração)",
    cpu: "NEC VR4300 64-bit @ 93.75 MHz",
    ram: "4 MB RDRAM (Garante 8MB c/ Exp. Pak)",
    media: "Cartuchos ultra-velozes",
    releaseYear: "1996",
    accentColor: "from-green-600 via-emerald-700 to-zinc-900",
    glowColor: "rgba(16, 185, 129, 0.5)",
    hardwareSummary: "Pioneiro absoluto na navegação e câmeras 3D fluidas, analógico preciso por rotação física e disputas cooperativas de 4 jogadores."
  },
  gb: {
    manufacturer: "Nintendo",
    generation: "8-Bits Portátil",
    cpu: "Sharp LR35902 @ 4.19 MHz",
    ram: "8 KB RAM principal",
    media: "Cartucho Game Boy",
    releaseYear: "1989",
    accentColor: "from-emerald-700 via-teal-800 to-zinc-950",
    glowColor: "rgba(16, 185, 129, 0.4)",
    hardwareSummary: "O portátil cinza eterno de Gunpei Yokoi. Popularizou o clássico cult Tetris e a franquia multibilionária de monstros colecionáveis Pokémon."
  },
  gba: {
    manufacturer: "Nintendo",
    generation: "32-Bits Portátil",
    cpu: "ARM7TDMI 32-bit @ 16.78 MHz",
    ram: "256 KB EWRAM + 32 KB IWRAM",
    media: "Cartucho GBA micro",
    releaseYear: "2001",
    accentColor: "from-indigo-650 via-violet-750 to-zinc-950",
    glowColor: "rgba(99, 102, 241, 0.5)",
    hardwareSummary: "Poderoso hardware 32-bits que funciona como um SNES ultra-portátil aperfeiçoado. Apresentou ports divinos e visuais pixel art impecáveis."
  },
  nds: {
    manufacturer: "Nintendo",
    generation: "Portátil de Tela Dupla",
    cpu: "ARM9 @ 67 MHz + ARM7 @ 33 MHz",
    ram: "4 MB RAM móvel integrada",
    media: "DS Card magnético",
    releaseYear: "2004",
    accentColor: "from-sky-700 via-blue-850 to-zinc-950",
    glowColor: "rgba(14, 165, 233, 0.4)",
    hardwareSummary: "Inovadora máquina portátil que redefiniu a interatividade através de sua tela de toque (Stylus), displays duplos e comandos por voz."
  },
  genesis: {
    manufacturer: "Sega",
    generation: "16-Bits (4ª Geração)",
    cpu: "Motorola 68000 @ 7.67 MHz",
    ram: "64 KB Principal + 64 KB VRAM",
    media: "Cartuchos de alto barramento",
    releaseYear: "1988 (Japão) / 1989 (EUA)",
    accentColor: "from-blue-600 via-red-650 to-zinc-950",
    glowColor: "rgba(59, 130, 246, 0.4)",
    hardwareSummary: "Adotou a postura rebelde da SEGA para desafiar o monopólio mercantil da Nintendo, munido de processamento ultra veloz 'Blast Processing'."
  },
  megadrive: {
    manufacturer: "Sega",
    generation: "16-Bits (4ª Geração)",
    cpu: "Motorola 68000 @ 7.67 MHz",
    ram: "64 KB RAM principal",
    media: "Mega Cartuchos",
    releaseYear: "1988 (Japão) / 1990 (Brasil)",
    accentColor: "from-red-600 via-zinc-900 to-indigo-950",
    glowColor: "rgba(239, 68, 68, 0.4)",
    hardwareSummary: "Sucesso titânico em solo brasileiro sob os cuidados da Tectoy. Lar de jogos de alta velocidade do Sonic e trilhas em moduladores FM excelentes."
  },
  mastersystem: {
    manufacturer: "Sega",
    generation: "8-Bits (3ª Geração)",
    cpu: "Zilog Z80A @ 3.58 MHz",
    ram: "8 KB RAM principal",
    media: "Cartucho + Sega Card",
    releaseYear: "1985 (Japão) / 1986 (EUA)",
    accentColor: "from-cyan-600 via-blue-700 to-zinc-950",
    glowColor: "rgba(6, 182, 212, 0.4)",
    hardwareSummary: "O carismático competidor de 8-bits da SEGA, detentor de hardware robusto capaz de rendering colorido e vibrante muito elogiado."
  },
  sms: {
    manufacturer: "Sega",
    generation: "8-Bits (3ª Geração)",
    cpu: "Zilog Z80A @ 3.58 MHz",
    ram: "8 KB RAM principal",
    media: "Cartucho e Cards",
    releaseYear: "1985",
    accentColor: "from-blue-700 via-indigo-800 to-zinc-950",
    glowColor: "rgba(37, 99, 235, 0.4)",
    hardwareSummary: "Console que consagrou clássicos absolutos como Alex Kidd de forma brilhante, tornando-se sinônimo de videogame nostálgico."
  },
  psx: {
    manufacturer: "Sony",
    generation: "32-Bits (5ª Geração)",
    cpu: "MIPS R3000A 32-bit @ 33.86 MHz",
    ram: "2 MB RAM + 1 MB VRAM",
    media: "CD-ROM de alta fidelidade",
    releaseYear: "1994",
    accentColor: "from-zinc-400 via-teal-750 to-zinc-950",
    glowColor: "rgba(180, 186, 196, 0.4)",
    hardwareSummary: "O console que destronou os antigos giants dos cartuchos, inaugurando com louvor a era moderna do 3D acelerado e sons em CD."
  },
  ps1: {
    manufacturer: "Sony",
    generation: "32-Bits (5ª Geração)",
    cpu: "MIPS R3000A 32-bit @ 33.86 MHz",
    ram: "2 MB RAM + 1 MB VRAM",
    media: "CD-ROM compacto",
    releaseYear: "1994",
    accentColor: "from-slate-400 via-sky-800 to-zinc-950",
    glowColor: "rgba(14, 165, 233, 0.4)",
    hardwareSummary: "Estreia fenomenal da Sony consagrando as franquias Crash Bandicoot, Gran Turismo, Final Fantasy VII e Resident Evil."
  },
  atari: {
    manufacturer: "Atari",
    generation: "8-Bits (2ª Geração)",
    cpu: "MOS Technology 6507 @ 1.19 MHz",
    ram: "128 Bytes RAM total",
    media: "Cartucho magnético",
    releaseYear: "1977",
    accentColor: "from-amber-700 via-orange-800 to-zinc-950",
    glowColor: "rgba(245, 158, 11, 0.4)",
    hardwareSummary: "O pioneiro incontestável que instalou a febre dos videogames nos lares mundiais por intermédio das clássicas alavancas pretas."
  },
  atari2600: {
    manufacturer: "Atari",
    generation: "8-Bits (2ª Geração)",
    cpu: "MOS Technology 6507 @ 1.19 MHz",
    ram: "128 Bytes RAM",
    media: "Cartuchos de circuito integrado",
    releaseYear: "1977",
    accentColor: "from-amber-800 via-orange-900 to-zinc-950",
    glowColor: "rgba(217, 119, 6, 0.4)",
    hardwareSummary: "Símbolo imutável da nostalgia dos anos 80, lar de clássicos icônicos da cultura pop como River Raid, Pac-Man, Space Invaders e Enduro."
  },
  arcade: {
    manufacturer: "Múltiplos (Capcom/SNK/SEGA)",
    generation: "Era dos Fliperamas",
    cpu: "Motorola 68000 + Zilog Z80 Dual-Core",
    ram: "Variável (Hardware dedicado)",
    media: "Placa Eletrônica PCB Jamma",
    releaseYear: "Anos 80 / 90",
    accentColor: "from-orange-550 via-amber-600 to-red-950",
    glowColor: "rgba(245, 158, 11, 0.4)",
    hardwareSummary: "O suprassumo das lanchonetes e shoppings antigos. Entregava poder gráfico insuperável focado em sprites massivos e ação run-and-gun estéreo."
  },
  mame: {
    manufacturer: "Capcom / SEGA / Midway",
    generation: "Gabinetes Arcade",
    cpu: "Sistemas Múltiplos Unidos",
    ram: "Dedicada de resposta imediata",
    media: "Placas ROM binárias originais",
    releaseYear: "Era de Ouro (1980 - 2000)",
    accentColor: "from-yellow-500 via-orange-700 to-zinc-950",
    glowColor: "rgba(234, 179, 8, 0.5)",
    hardwareSummary: "União dos clássicos de ficha originais que moldaram a jogabilidade competitiva mundial, com emulação rigorosa pixel-perfect de lutas."
  },
  neogeo: {
    manufacturer: "SNK",
    generation: "16-Bits Custom (MVS)",
    cpu: "Motorola 68000 @ 12 MHz + Z80 @ 4 MHz",
    ram: "64 KB RAM + 68 KB VRAM + 2 KB Audio",
    media: "Cartuchos Gigantes (Max 330 Mb)",
    releaseYear: "1990",
    accentColor: "from-red-650 via-yellow-600 to-zinc-950",
    glowColor: "rgba(239, 68, 68, 0.4)",
    hardwareSummary: "Considerado a Ferrari dos consoles nos anos 90. Oferecia a mesmíssima engenharia presente nos fliperamas comerciais do mundo."
  }
};

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
    atari: 'atari2600',
    atari2600: 'atari2600',
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

const SafeConsoleLogo: React.FC<{ system: System; isCompact?: boolean; forceGlow?: boolean; accentColor?: string }> = ({ system, isCompact, forceGlow, accentColor }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [system.id]);

  if (hasError) {
    return (
      <div className="flex items-center justify-center p-3.5 bg-zinc-900/90 border border-white/10 rounded-xl max-w-[200px] shadow-lg select-none">
        <span className={`font-mono text-amber-400 tracking-widest font-black uppercase text-center ${isCompact ? 'text-[9px]' : 'text-xs'}`}>
          {system.shortName || system.name}
        </span>
      </div>
    );
  }

  return (
    <img
      src={`/logos/${getLogoFileName(system.id)}.png`}
      alt={system.name}
      className={`w-full h-full object-contain filter transition-all duration-300 ${
        isCompact ? 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]' : 'drop-shadow-[0_8px_16px_rgba(0,0,0,0.85)]'
      }`}
      style={forceGlow ? { filter: `drop-shadow(0px 0px 20px ${accentColor || 'rgba(255,255,255,0.45)'}) saturate(1.1)` } : {}}
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
      soundEngine.playSelect();
      onSelectSystem(systems[activeIndex]);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const nextIndex = (activeIndex - 1 + total) % total;
        setActiveIndex(nextIndex);
        soundEngine.playMove();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = (activeIndex + 1) % total;
        setActiveIndex(nextIndex);
        soundEngine.playMove();
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (systems[activeIndex]) {
          soundEngine.playSelect();
          onSelectSystem(systems[activeIndex]);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, systems, total, onSelectSystem]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeEl = scrollContainerRef.current.children[activeIndex] as HTMLElement;
      if (activeEl) {
        const parentWidth = scrollContainerRef.current.offsetWidth;
        const itemWidth = activeEl.offsetWidth;
        const leftPos = activeEl.offsetLeft;
        scrollContainerRef.current.scrollTo({
          left: leftPos - parentWidth / 2 + itemWidth / 2,
          behavior: 'smooth'
        });
      }
    }
  }, [activeIndex]);

  const activeSystem = systems[activeIndex];
  const activeLogoName = getLogoFileName(activeSystem.id);
  const specs: SystemTechSpecs = systemSpecsMap[activeLogoName.toLowerCase()] || {
    manufacturer: "Retro System",
    generation: "Vintage Consola",
    cpu: "Clássico Chips Emulados",
    ram: "Otimização RetroArch Dedicada",
    media: "ROM virtualizada no nuvem",
    releaseYear: "Época de Ouro",
    accentColor: "from-emerald-600 to-zinc-950",
    glowColor: "rgba(16, 185, 129, 0.4)",
    hardwareSummary: "Rememore excelentes joias eletrônicas de fliperama e consoles tradicionais simulados em velocidade máxima sem gargalos."
  };

  const featuredGames = activeSystem.games ? activeSystem.games.slice(0, 5).map(g => g.title) : [];

  return (
    <div className="w-full flex flex-col md:flex-row gap-6 items-stretch justify-center max-w-7xl mx-auto px-4 md:px-8 select-none my-auto">
      
      <motion.div
        key={`specs-${activeSystem.id}`}
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full md:w-[410px] bg-zinc-950/80 border border-white/5 backdrop-blur-md rounded-2xl p-5 md:p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden shrink-0"
      >
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${specs.accentColor}`} />
        <div className="absolute top-2.5 right-3 px-2 py-0.5 bg-white/5 border border-white/10 rounded font-mono text-[8.5px] text-zinc-500 tracking-wider">
          {specs.generation}
        </div>

        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="p-2 bg-white/5 border border-white/10 rounded-xl text-yellow-500">
              <Gamepad2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest text-zinc-400 block uppercase leading-none">{specs.manufacturer}</span>
              <h2 className="text-xl font-display font-black tracking-tight text-white uppercase mt-0.5 leading-none">{activeSystem.name}</h2>
            </div>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed font-sans mb-5 italic border-l-2 border-zinc-700 pl-3">
            "{specs.hardwareSummary}"
          </p>

          <div className="space-y-3.5 border-t border-white/5 pt-4">
            <div className="flex items-start gap-3 text-xs">
              <Cpu className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block leading-none">Processamento CPU</span>
                <span className="font-semibold text-zinc-200 mt-0.5 block">{specs.cpu}</span>
              </div>
            </div>

            <div className="flex items-start gap-3 text-xs">
              <Gamepad2 className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block leading-none">Memória RAM</span>
                <span className="font-semibold text-zinc-200 mt-0.5 block">{specs.ram}</span>
              </div>
            </div>

            <div className="flex items-start gap-3 text-xs font-sans">
              <Archive className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block leading-none">Suporte Físico / Mídia</span>
                <span className="font-semibold text-zinc-200 mt-0.5 block">{specs.media}</span>
              </div>
            </div>

            <div className="flex items-start gap-3 text-xs font-sans">
              <Calendar className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block leading-none">Ano de Lançamento</span>
                <span className="font-semibold text-zinc-200 mt-0.5 block">{specs.releaseYear}</span>
              </div>
            </div>
          </div>
        </div>

        {featuredGames.length > 0 && (
          <div className="mt-6 border-t border-white/5 pt-4">
            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block mb-2 leading-none">Títulos Incorporados</span>
            <div className="flex flex-wrap gap-1.5 max-h-16 overflow-hidden">
              {featuredGames.map((game, i) => (
                <span key={i} className="text-[9.5px] font-mono px-2 py-0.5 bg-white/5 border border-white/5 rounded text-zinc-350 truncate max-w-[140px] leading-tight">
                  {game.replace(/\(.*?\)/g, "").trim()}
                </span>
              ))}
              {activeSystem.gameCount > 5 && (
                <span className="text-[9px] font-mono px-1.5 py-0.5 bg-[#10b881]/10 border border-[#10b881]/20 text-emerald-400 rounded">
                  +{activeSystem.gameCount - 5} games
                </span>
              )}
            </div>
          </div>
        )}
      </motion.div>

      <div className="flex-1 flex flex-col justify-between bg-zinc-950/40 border border-white/5 backdrop-blur-[2px] rounded-2xl p-5 md:p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(255,255,255,0.015),transparent)] pointer-events-none" />

        <div className="flex justify-between items-center w-full z-10 select-none">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-retro text-zinc-400 tracking-widest uppercase">LORDTECA RETRO CORES</span>
          </div>
          <div className="font-mono text-[9px] text-zinc-500 tracking-wider">
            {activeIndex + 1} / {total} CONSOLES
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center py-6 md:py-10 relative z-10 w-full min-h-[160px] md:min-h-0">
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30 select-none">
            <div className="w-[300px] h-[150px] border border-white/15 scale-y-110 flex justify-between rounded-lg relative">
              <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-white/40" />
              <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-white/40" />
              <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-white/40" />
              <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-white/40" />
            </div>
          </div>

          <div 
            onClick={handleSelect}
            className="h-32 md:h-44 w-72 md:w-96 flex items-center justify-center cursor-pointer group relative my-4 bg-transparent select-none"
          >
            <AnimatePresence mode="popLayout">
              <motion.div
                key={activeSystem.id}
                initial={{ opacity: 0, scale: 0.88, y: 15 }}
                animate={{ opacity: 1, scale: 1.05, y: 0 }}
                exit={{ opacity: 0, scale: 0.88, y: -15 }}
                transition={{ type: 'spring', stiffness: 220, damping: 20 }}
                className="w-full h-full flex items-center justify-center pointer-events-auto"
              >
                <SafeConsoleLogo 
                  system={activeSystem} 
                  isCompact={false} 
                  forceGlow={true} 
                  accentColor={specs.glowColor} 
                />
              </motion.div>
            </AnimatePresence>
          </div>
          
          <p className="text-zinc-500 font-retro text-[8px] tracking-widest animate-pulse mt-1 select-none">
            APERTE ENTER OU CLIQUE NA LOGO PARA DECOLAR
          </p>
        </div>

        <div className="relative w-full bg-black/60 border border-white/5 rounded-xl py-3 px-4 flex items-center z-10">
          <button 
            type="button"
            onClick={handlePrev} 
            className="absolute left-1.5 text-zinc-400 hover:text-white transition-colors text-xs font-bold cursor-pointer p-2 z-20 focus:outline-none bg-black/40 border border-white/5 hover:border-white/15 rounded-lg select-none"
          >
            ◀
          </button>

          <div 
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-hidden md:overflow-x-auto w-full px-8 scrollbar-hide select-none relative justify-start md:justify-center items-center h-12"
          >
            {systems.map((sys, idx) => {
              const isSelected = idx === activeIndex;
              return (
                <div
                  key={sys.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (idx !== activeIndex) {
                      setActiveIndex(idx);
                      soundEngine.playMove();
                    } else {
                      handleSelect(e);
                    }
                  }}
                  className={`relative flex items-center justify-center shrink-0 w-24 h-10 px-2 cursor-pointer transition-all duration-300 rounded-lg select-none ${
                    isSelected ? 'opacity-100 scale-110 bg-white/5 border border-white/15 shadow-inner' : 'opacity-35 scale-90 hover:opacity-60 bg-transparent border border-transparent'
                  }`}
                >
                  <SafeConsoleLogo system={sys} isCompact={true} />
                </div>
              );
            })}
          </div>

          <button 
            type="button"
            onClick={handleNext} 
            className="absolute right-1.5 text-zinc-400 hover:text-white transition-colors text-xs font-bold cursor-pointer p-2 z-20 focus:outline-none bg-black/40 border border-white/5 hover:border-white/15 rounded-lg select-none"
          >
            ▶
          </button>
        </div>

      </div>

    </div>
  );
};
