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

  const featuredGames = activeSystem.games ? activeSystem.games.slice(0, 4).map(g => g.title) : [];

  return (
    <div className="fixed inset-0 w-full h-screen bg-[#040406] overflow-hidden flex items-center justify-between select-none font-sans">
      
      {/* CAMADA 1: PLAYER DE VÍDEO (RODANDO ATRÁS DO BURACO DA TV ARCADIA NA ESQUERDA) */}
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

      {/* CAMADA 2: OVERLAY MÁSCARA DO CONSOLE DE BACKGROUNDS */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center z-20 pointer-events-none"
        style={{ backgroundImage: `url(/logos/backgrounds/${consoleId}.png)` }}
      />

      {/* PAINEL FLUTUANTE ESQUERDO: INFOS E ESPECIFICAÇÕES (SPECS BOARD) */}
      <div className="absolute bottom-[14%] left-10 z-30 w-[350px] bg-black/70 border border-white/5 backdrop-blur-md rounded-xl p-5 shadow-2xl flex flex-col pointer-events-none">
        <div className={`h-1 w-16 rounded bg-gradient-to-r ${specs.accentColor} mb-3`} />
        
        <span className="text-[8px] font-mono tracking-widest text-zinc-500 uppercase leading-none">{specs.manufacturer} • {specs.generation}</span>
        <h2 className="text-lg font-display font-black tracking-tight text-white uppercase mt-1 mb-2 leading-none">{activeSystem.name}</h2>
        
        <p className="text-[10px] text-zinc-400 font-sans leading-relaxed mb-4 border-l border-zinc-700 pl-2">
          {specs.hardwareSummary}
        </p>

        <div className="space-y-2 border-t border-white/5 pt-3 font-mono text-[9px] text-zinc-400">
          <div className="flex justify-between"><span className="text-zinc-600">CPU:</span> <span className="font-bold text-zinc-300 truncate max-w-[220px]">{specs.cpu}</span></div>
          <div className="flex justify-between"><span className="text-zinc-600">RAM:</span> <span className="font-bold text-zinc-300">{specs.ram}</span></div>
          <div className="flex justify-between"><span className="text-zinc-600">MÍDIA:</span> <span className="font-bold text-zinc-300">{specs.media}</span></div>
          <div className="flex justify-between"><span className="text-zinc-600">LANÇAMENTO:</span> <span className="font-bold text-zinc-300">{specs.releaseYear}</span></div>
        </div>

        {featuredGames.length > 0 && (
          <div className="mt-3 border-t border-white/5 pt-2.5">
            <div className="flex flex-wrap gap-1">
              {featuredGames.map((game, i) => (
                <span key={i} className="text-[8px] font-mono px-1.5 py-0.5 bg-white/5 rounded text-zinc-400 truncate max-w-[150px]">
                  {game.replace(/\(.*?\)/g, "").trim()}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CAMADA 3: ROLETA VERTICAL EM ESPIRAL (DIREITA VAZADA) */}
      <div className="absolute top-0 right-0 w-[45vw] h-full z-30 flex items-center justify-center overflow-hidden" style={{ perspective: 1000 }}>
        <div ref={scrollContainerRef} className="relative w-full h-[460px] flex items-center justify-center">
          {systems.map((sys, idx) => {
            const offset = idx - activeIndex;
            const isSelected = idx === activeIndex;

            if (Math.abs(offset) > 3) return null;

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

      {/* RODAPÉ DO CONSOLE */}
      <footer className="absolute bottom-0 inset-x-0 h-10 bg-black/40 border-t border-white/5 backdrop-blur z-40 flex items-center justify-between px-10 font-sans text-[10px] font-bold text-zinc-500 tracking-wider">
        <div>▲▼ MUDAR SISTEMA • ENTER CONFIRMAR</div>
        <div className="font-mono text-[9px] tracking-widest uppercase text-zinc-600">
          {activeSystem.gameCount} JOGOS DISPONÍVEIS
        </div>
      </footer>

    </div>
  );
};
