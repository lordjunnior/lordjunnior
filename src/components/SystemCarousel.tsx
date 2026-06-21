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

// O DICIONÁRIO COMPLETO DE ESPECIFICAÇÕES TÉCNICAS E HISTÓRICAS - 100% PREENCHIDO
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
  gameboy: {
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
  segaMD: {
    manufacturer: "Sega",
    generation: "16-Bits (4ª Geração)",
    cpu: "Motorola 68000 @ 7.67 MHz",
    ram: "64 KB RAM principal",
    media: "Mega Cartuchos",
    releaseYear: "1988 (Japão) / 1990 (Brasil)",
    accentColor: "from-red-600 via-zinc-900 to-indigo-950",
    glowColor: "rgba(239, 68, 68, 0.4)",
    hardwareSummary: "Sucesso titânico em solo brasileiro sob os cuidados da Tectoy. Lar de jogos de alta velocidade do Sonic e trilhas em modulação FM excelentes."
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
    hardwareSummary: "Sucesso titânico em solo brasileiro sob os cuidados da Tectoy. Lar de jogos de alta velocidade do Sonic e trilhas em modulação FM excelentes."
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
  playstation: {
    manufacturer: "Sony",
    generation: "32-Bits (5ª Geração)",
    cpu: "MIPS R3000A 32-bit @ 33.86 MHz",
    ram: "2 MB RAM + 1 MB VRAM",
    media: "CD-ROM de alta fidelidade",
    releaseYear: "1994",
    accentColor: "from-zinc-400 via-teal-750 to-zinc-950",
    glowColor: "rgba(180, 186, 196, 0.4)",
    hardwareSummary: "O console que destronou os antigos gigantes dos cartuchos, inaugurando com louvor a era moderna do 3D acelerado e sons em CD."
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
  arcade: {
    manufacturer: "Múltiplos (Capcom/SNK/SEGA)",
    generation: "Era dos Fliperamas",
    cpu: "Motorola 68000 + Zilog Z80 Dual-Core",
    ram: "Variável (Hardware dedicado)",
    media: "Placa Eletrônica PCB Jamma",
    releaseYear: "Anos 80 / 90",
    accentColor: "from-orange-500 via-amber-650 to-red-950",
    glowColor: "rgba(245, 158, 11, 0.4)",
    hardwareSummary: "O suprassumo das lanchonetes e shoppings antigos. Entregava poder gráfico insuperável focado em sprites massivos e ação cooperativa estéreo."
  },
  '3do': {
    manufacturer: "Panasonic / GoldStar",
    generation: "32-Bits (5ª Geração)",
    cpu: "ARM60 32-bit RISC @ 12.5 MHz",
    ram: "2 MB RAM + 1 MB VRAM",
    media: "CD-ROM 2X",
    releaseYear: "1993",
    accentColor: "from-zinc-600 via-red-700 to-black",
    glowColor: "rgba(239, 68, 68, 0.4)",
    hardwareSummary: "Hardware premium multimédia de alto custo focado em gráficos poligonais avançados e vídeos interativos full-motion (FMV)."
  }
};

// TRADUTOR DO EMULATIONSTATION ($system): Garante leitura 100% .png local
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
      <span className="font-retro text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
        {system.shortName || system.name}
      </span>
    );
  }

  return (
    <img
      src={`/logos/${getLogoFileName(system.id)}.png`}
      alt={system.name}
      className={`max-w-full max-h-full object-contain filter transition-all duration-200 ${
        isCompact 
          ? 'opacity-40 grayscale contrast-125' 
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
  const listRef = useRef<HTMLDivElement>(null);

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
    if (listRef.current) {
      const activeEl = listRef.current.children[activeIndex] as HTMLElement;
      if (activeEl) {
        const parentWidth = listRef.current.offsetWidth;
        const itemWidth = activeEl.offsetWidth;
        const leftPos = activeEl.offsetLeft;
        listRef.current.scrollTo({
          left: leftPos - parentWidth / 2 + itemWidth / 2,
          behavior: 'smooth'
        });
      }
    }
  }, [activeIndex]);

  const activeSystem = systems[activeIndex];
  const consoleId = getLogoFileName(activeSystem.id);
  
  // Resgata os metadados do dicionário robusto
  const specs = systemSpecsMap[consoleId] || systemSpecsMap[activeSystem.id.toLowerCase()] || {
    manufacturer: "Retro Hardware",
    generation: "Vintage Consola",
    cpu: "Processador Retro Emulado",
    ram: "Otimização Nativa Core",
    media: "Virtualização Digital ROM",
    releaseYear: "Era de Ouro",
    accentColor: "from-zinc-700 via-zinc-800 to-zinc-950",
    glowColor: "rgba(255, 255, 255, 0.2)",
    hardwareSummary: "Explore o catálogo completo de títulos clássicos preservados perfeitamente na sua biblioteca retro."
  };

  // Coleta as capas dos principais jogos do sistema ativo
  const topGames = activeSystem.games ? activeSystem.games.slice(0, 4) : [];

  return (
    <div className="fixed inset-0 w-full h-screen bg-[#040406] overflow-hidden flex flex-col justify-between select-none font-sans">
      
      {/* GLOW DE FUNDO PERSONALIZADO DO CONSOLE */}
      <div 
        className="absolute inset-0 z-0 transition-all duration-700 opacity-25 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 35%, ${specs.glowColor} 0%, transparent 65%)`
        }}
      />

      {/* IMAGEM DE CONSOLE NO BACKGROUND DE FALLBACK */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center z-10 opacity-10 mix-blend-overlay pointer-events-none transition-all duration-700"
        style={{ backgroundImage: `url(/logos/backgrounds/${consoleId}.png)` }}
      />
      
      <div className="absolute inset-0 bg-[#040406]/20 pointer-events-none z-10" />

      {/* PAINEL SUPERIOR: INFOS RESUMIDAS & LOGO PRINCIPAL ATIVO CONCENTRADO NO CENTRO */}
      <div className="relative z-20 w-full flex-1 flex flex-col items-center justify-center pt-20 px-6 max-h-[50vh]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSystem.id}
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center max-w-2xl px-4"
          >
            <div className="h-28 w-auto max-w-[280px] flex items-center justify-center mb-6">
              <SafeConsoleLogo system={activeSystem} isCompact={false} />
            </div>
            
            <p className="text-zinc-500 text-[9px] tracking-widest font-mono uppercase bg-white/5 border border-white/5 px-3 py-1 rounded-full backdrop-blur-md mb-2">
              {specs.manufacturer} • {specs.generation}
            </p>
            
            <h1 className="text-xl font-black tracking-tight text-white uppercase drop-shadow">
              {activeSystem.name}
            </h1>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* CARROSSEL DE SELEÇÃO HORIZONTAL (ESTILO EMULATIONSTATION DE PRECISÃO) */}
      <div className="relative z-30 w-full bg-black/60 border-y border-white/5 backdrop-blur-md py-4 flex flex-col items-center justify-center">
        {/* Marcadores de centro guia */}
        <div className="absolute top-0 bottom-0 left-[50%] w-0 bg-transparent pointer-events-none flex flex-col justify-between items-center z-40">
          <div className="w-4 h-2 bg-white rounded-b-md shadow-white shadow-sm -mt-[1px] opacity-70" />
          <div className="w-4 h-2 bg-white rounded-t-md shadow-white shadow-sm -mb-[1px] opacity-70" />
        </div>

        <div 
          ref={listRef} 
          className="w-full flex items-center overflow-x-auto gap-10 py-3 no-scrollbar scroll-smooth snap-x pointer-events-auto"
          style={{ paddingLeft: 'calc(50vw - 96px)', paddingRight: 'calc(50vw - 96px)' }}
        >
          {systems.map((sys, idx) => {
            const isSelected = idx === activeIndex;
            const consoleKey = getLogoFileName(sys.id);
            const activeSpecs = systemSpecsMap[consoleKey] || { glowColor: 'rgba(255,255,255,0.2)' };

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
                className="shrink-0 w-48 h-14 flex items-center justify-center cursor-pointer relative"
                animate={{
                  scale: isSelected ? 1.15 : 0.8,
                  opacity: isSelected ? 1 : 0.4,
                }}
                transition={{ type: 'spring', stiffness: 220, damping: 20 }}
              >
                {isSelected && (
                  <motion.div 
                    layoutId="active-glow"
                    className="absolute inset-0 -m-1 rounded-xl filter blur-md opacity-25"
                    style={{ backgroundColor: activeSpecs.glowColor }}
                  />
                )}
                <div className={`w-full h-full p-2 flex items-center justify-center rounded-lg transition-all border ${
                  isSelected ? 'border-white/10 bg-white/5' : 'border-transparent'
                }`}>
                  <SafeConsoleLogo system={sys} isCompact={!isSelected} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* GRID DE INFORMAÇÕES DE HARDWARE E JOGOS EM DESTAQUE (INFERIOR) */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-10 pb-14 grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch pt-2">
        
        {/* ESQUERDA: INFOS HISTÓRICAS E ESPECIFICAÇÕES DO CONSOLE */}
        <div className="md:col-span-7 bg-black/40 border border-white/5 backdrop-blur-md rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
          <div>
            <div className={`h-1 w-16 mb-4 rounded bg-gradient-to-r ${specs.accentColor}`} />
            <h3 className="text-zinc-500 font-mono text-[9px] tracking-widest uppercase mb-2">
              ESPECIFICAÇÕES TÉCNICAS E HISTÓRIA
            </h3>
            <p className="text-zinc-300 text-xs leading-relaxed font-sans font-medium mb-6">
              {specs.hardwareSummary}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-4 border-t border-white/5 pt-4 font-mono text-[10px] text-zinc-400">
            <div className="flex gap-2.5 items-center">
              <Cpu className="w-4 h-4 text-zinc-500 shrink-0" />
              <div className="truncate">
                <span className="text-zinc-600 block text-[7px] uppercase tracking-wider font-bold">PROCESSADOR CPU</span>
                <span className="font-bold text-zinc-350 truncate block">{specs.cpu}</span>
              </div>
            </div>
            <div className="flex gap-2.5 items-center">
              <Gamepad2 className="w-4 h-4 text-zinc-500 shrink-0" />
              <div>
                <span className="text-zinc-600 block text-[7px] uppercase tracking-wider font-bold">MEMÓRIA RAM</span>
                <span className="font-bold text-zinc-350 block truncate">{specs.ram}</span>
              </div>
            </div>
            <div className="flex gap-2.5 items-center">
              <Archive className="w-4 h-4 text-zinc-500 shrink-0" />
              <div className="truncate">
                <span className="text-zinc-600 block text-[7px] uppercase tracking-wider font-bold">MÍDIA ORIGINAL</span>
                <span className="font-bold text-zinc-350 truncate block">{specs.media}</span>
              </div>
            </div>
            <div className="flex gap-2.5 items-center">
              <Calendar className="w-4 h-4 text-zinc-500 shrink-0" />
              <div>
                <span className="text-zinc-650 block text-[7px] uppercase tracking-wider font-bold">LANÇAMENTO</span>
                <span className="font-bold text-zinc-350 block">{specs.releaseYear}</span>
              </div>
            </div>
          </div>
        </div>

        {/* DIREITA: GALERIA DE JOGOS DISPONÍVEIS NA BIBLIOTECA (SUBSTITUINDO VÍDEO FANTASMA) */}
        <div className="md:col-span-5 bg-black/40 border border-white/5 backdrop-blur-md rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-zinc-500 font-mono text-[9px] tracking-widest uppercase mb-4">
              BIBLIOTECA COM CORRESPONDÊNCIA DE CAPAS
            </h3>
            
            {topGames.length > 0 ? (
              <div className="grid grid-cols-4 gap-3">
                {topGames.map((game) => (
                  <div key={game.id} className="group relative aspect-[3/4] rounded-lg overflow-hidden border border-white/5 bg-zinc-950 transition-all hover:border-white/20 shadow-lg">
                    {game.image ? (
                      <img 
                        src={game.image} 
                        alt={game.title} 
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                        loading="lazy" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center p-1 text-center bg-zinc-900">
                        <span className="text-[8px] uppercase font-mono text-zinc-500 font-bold line-clamp-3">{game.title}</span>
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/50 to-transparent p-1.5 pt-4">
                      <p className="text-[7.5px] text-white font-mono uppercase font-black truncate leading-none">
                        {game.title.replace(/\(.*?\)/g, "").trim()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-24 flex items-center justify-center border border-dashed border-white/5 rounded-xl bg-white/5">
                <p className="text-zinc-500 text-xs font-mono">Nenhum título cadastrado</p>
              </div>
            )}
          </div>

          <div className="mt-5 border-t border-white/5 pt-4 flex items-center justify-between">
            <div className="text-left">
              <span className="text-[7px] text-zinc-650 font-mono block">CATÁLOGO DE ROMS</span>
              <span className="text-xs font-mono font-bold text-zinc-300">
                {activeSystem.gameCount} JOGOS DISPONÍVEIS
              </span>
            </div>
            <button 
              onClick={handleSelect}
              className="px-6 py-2.5 bg-white text-black font-retro text-[9px] font-black uppercase tracking-widest rounded-lg flex items-center justify-center cursor-pointer transition-all hover:bg-zinc-200 active:scale-95 shadow-md"
            >
              ➔ SELECIONAR
            </button>
          </div>
        </div>

      </div>

      {/* RODAPÉ DO CONSOLE */}
      <footer className="absolute bottom-0 inset-x-0 h-10 bg-black/40 border-t border-white/5 backdrop-blur z-40 flex items-center justify-between px-10 font-sans text-[10px] font-semibold text-zinc-500 tracking-wider">
        <div>◀ ▶ SELECIONAR SISTEMA • ENTER CONFIRMAR</div>
        <div className="font-mono text-[9px] tracking-widest uppercase text-zinc-600">
          LordTecaRetro • Preservação Digital Retro
        </div>
      </footer>

    </div>
  );
};