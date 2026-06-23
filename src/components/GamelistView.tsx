/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { System, Game } from '../types';
import { soundEngine } from './RetroSoundEngine';
import { EmulatorPlayer } from './EmulatorPlayer';
import { getGameGameplayVideoUrl } from '../utils/videoResolver';
import { ArrowLeft, Search } from 'lucide-react';
import { GameCover } from './GameCover';

interface GamelistViewProps {
  system: System;
  onBack: () => void;
  isMuted: boolean;
  toggleMute: () => void;
}

const gameDescriptions: Record<string, string> = {
  "super mario bros.": "O clássico de plataforma lendário pioneiro que salvou a indústria dos videogames em 1985, estabeleceu as mecânicas de rolagem lateral e definiu o encanador mais famoso do planeta.",
  "super mario bros. 3": "Aclamado como uma das maiores obras-primas da era 8-bits. Introduziu o emblemático mapa-múndi de seleção de fases, inventários de itens e transformações icônicas como a Super Leaf (Mário Guaxinim) e a Tanooki Suit.",
  "the legend of zelda": "A obra-prima pioneira de Shigeru Miyamoto que apresentou o reino de Hyrule de forma não-linear. Definiu todo o gênero de Aventura e RPG com seu system inovador de exploração livre e salvamento de progresso.",
  "metroid": "O nascimento do gênero Metroidvania. Apresentou um ambiente alienígena sombrio, isolado e labiríntico na fortaleza de Zebes, culminando na revelação histórica de que a caçadora de recompensas Samus Aran era uma mulher.",
  "castlevania": "A influente jornada gótica de Simon Belmont empunhando o chicote lendário Vampire Killer na fortaleza do Conde Drácula. Trilha sonora inesquecível e atmosfera medieval de terror magnífica.",
  "mega man": "O icônico robô azul da Capcom estreia revolucionando a ação em plataformas com seu sistema de escolha livre de fases e a mecânica inovadora de absorver os poderes dos chefes derrotados (Robot Masters).",
  "sonic the hedgehog": "A resposta veloz e rebelde da Sega que redefiniu os jogos de plataforma nos anos 90. Com loops em alta velocidade, design de fases verticalizado e uma trilha sonora memorável, estabeleceu o ouriço como ícone mundial.",
  "donkey kong country": "Um marco tecnológico revolucionário que utilizou gráficos pré-renderizados em estações Advanced Computer Modeling (ACM). Transformou o Super Nintendo com física soberba, trilha sonora imersiva e jogabilidade impecável em dupla.",
  "chrono trigger": "Considerado por muitos o maior RPG de todos os tempos. Desenvolvido pelo 'Dream Team' (Hironobu Sakaguchi, Yuji Horii e Akira Toriyama), revolucionou o gênero com viagens no tempo, múltiplos finais e combate dinâmico sem transição de tela.",
  "super metroid": "A obra de arte mais emblemática da ficção espacial 16-bits. Atmosfera sufocante, progresso orgânico primoroso no planeta Zebes e uma narrativa silenciosa que dita o padrão do gênero de exploração."
};

const getLogoFileName = (id: string): string => {
  const cleanId = id.toLowerCase().trim().replace(/[\s\-_]/g, '');
  const map: Record<string, string> = {
    snes: 'snes',
    supernintendo: 'snes',
    msu1: 'snes',
    nes: 'nes',
    nintendo: 'nes',
    gb: 'gameboy',
    gameboy: 'gameboy',
    gbc: 'gameboycolor',
    gameboycolor: 'gameboycolor',
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
    nds: 'nintendods',
    pce: 'pcecd',        
    pcengine: 'pcecd',
    neogeo: 'neogeo',
    '3do': '3do',        
    saturn: 'saturn',
    segasaturn: 'saturn',
    dreamcast: 'dreamcast',
    gamecube: 'gamecube',
    gc: 'gamecube',
    collections: 'Collections', 
    playlist: 'Collections'
  };
  return map[cleanId] || cleanId;
};

export const getRichDescription = (title: string, systemName: string): string => {
  const cleanKey = title
    .toLowerCase()
    .replace(/\(pt\-br\)/gi, '')
    .replace(/\[pt\-br\]/gi, '')
    .replace(/\(traduzido\)/gi, '')
    .replace(/\[traduzido\]/gi, '')
    .replace(/[^a-z0-9 ]/g, '')
    .trim();

  return gameDescriptions[cleanKey] || `Redescubra este clássico absoluto do console ${systemName}. Re-experimente a jogabilidade intocada original emulando roms clássicas no LordTecaRetro com velocidade máxima de carregamento.`;
};

const getRecalboxFolderName = (id: string): string => {
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
    ps2: 'ps2',
    ps3: 'ps3',
    atari: 'atari2600',
    arcade: 'mame',
    neogeo: 'neogeo',
    nds: 'nds',
    pce: 'pcengine',
    '3do': '3do',
    neogeopocket: 'ngp',
    turbografx: 'pcengine',
    fba_libretro: 'fba'
  };
  return map[id.toLowerCase()] || id.toLowerCase();
};

export const GamelistView: React.FC<GamelistViewProps> = ({
  system,
  onBack,
  isMuted,
  toggleMute,
}) => {
  const [selectedGameIndex, setSelectedGameIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [emulatingGame, setEmulatingGame] = useState<Game | null>(null);
  
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const listContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredGames = useMemo(() => {
    return system.games.filter(game => {
      const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            game.genre.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFavorite = filterFavorites ? game.favorite : true;
      return matchesSearch && matchesFavorite;
    });
  }, [system.games, searchTerm, filterFavorites]);

  const selectedGame = filteredGames[selectedGameIndex] || null;
  const consoleId = getLogoFileName(system.id);

  const filteredGamesRef = useRef(filteredGames);
  const selectedGameIndexRef = useRef(selectedGameIndex);
  const emulatingGameRef = useRef(emulatingGame);

  useEffect(() => { filteredGamesRef.current = filteredGames; }, [filteredGames]);
  useEffect(() => { selectedGameIndexRef.current = selectedGameIndex; }, [selectedGameIndex]);
  useEffect(() => { emulatingGameRef.current = emulatingGame; }, [emulatingGame]);

  useEffect(() => {
    setVideoLoaded(false);
    setVideoError(false);
  }, [selectedGame]);

  const handleBack = () => {
    soundEngine.playBack();
    onBack();
  };

  const handleGameClick = (index: number, game: Game) => {
    if (index === selectedGameIndexRef.current) {
      soundEngine.playSelect();
      setEmulatingGame(game);
    } else if (index >= 0 && index < filteredGamesRef.current.length) {
      setSelectedGameIndex(index);
      soundEngine.playMove();
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }
  };

  const selectGame = (index: number) => {
    if (index !== selectedGameIndexRef.current && index >= 0 && index < filteredGamesRef.current.length) {
      setSelectedGameIndex(index);
      soundEngine.playMove();
    }
  };

  const handleLaunchGame = (game: Game) => {
    soundEngine.playSelect();
    setEmulatingGame(game);
  };

  const handleCloseEmulator = () => {
    soundEngine.playBack();
    setEmulatingGame(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement === searchInputRef.current) {
        if (e.key === 'Enter') searchInputRef.current?.blur();
        return;
      }
      if (emulatingGameRef.current) {
        if (e.key === 'Escape') handleCloseEmulator();
        return;
      }

      const currentGames = filteredGamesRef.current;
      const currentIndex = selectedGameIndexRef.current;

      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (currentGames.length > 0) {
          const nextIndex = (currentIndex - 1 + currentGames.length) % currentGames.length;
          selectGame(nextIndex);
        }
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (currentGames.length > 0) {
          const nextIndex = (currentIndex + 1) % currentGames.length;
          selectGame(nextIndex);
        }
      } else if (e.key === 'Escape' || e.key === 'Backspace') {
        e.preventDefault();
        handleBack();
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const currentGame = currentGames[currentIndex];
        if (currentGame) handleLaunchGame(currentGame);
      } else if (e.key.toLowerCase() === 'm') {
        toggleMute();
        soundEngine.playToggle();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleMute]);

  useEffect(() => {
    if (listContainerRef.current) {
      const activeEl = listContainerRef.current.children[selectedGameIndex] as HTMLElement;
      if (activeEl) {
        const offsetLeft = activeEl.offsetLeft;
        const width = activeEl.clientWidth;
        const containerWidth = listContainerRef.current.clientWidth;
        listContainerRef.current.scrollTo({
          left: offsetLeft - containerWidth / 2 + width / 2,
          behavior: 'smooth'
        });
      }
    }
  }, [selectedGameIndex]);

  // custom background decoration based on consoleId
  const themeBackgroundDecoration = useMemo(() => {
    switch (system.id) {
      case 'nes':
        return (
          <>
            {/* NES stripes and grid background */}
            <div className="absolute inset-x-0 top-1/4 h-2 bg-red-600/20 border-y border-red-500/10 pointer-events-none z-0" />
            <div className="absolute inset-x-0 top-[26%] h-0.5 bg-red-600/10 pointer-events-none z-0" />
            <div className="absolute inset-0 opacity-[0.04] pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          </>
        );
      case 'snes':
        return (
          <>
            {/* SNES four colored buttons and grid dots */}
            <div className="absolute top-16 right-24 flex gap-2.5 opacity-[0.06] pointer-events-none z-0">
              <div className="w-8 h-8 rounded-full bg-[#4F46E5] blur-sm animate-pulse" />
              <div className="w-8 h-8 rounded-full bg-[#E54F4F] blur-sm" />
              <div className="w-8 h-8 rounded-full bg-[#E5C34F] blur-sm" />
              <div className="w-8 h-8 rounded-full bg-[#4FE568] blur-sm animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none z-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '36px 36px' }} />
          </>
        );
      case 'n64':
        return (
          <>
            {/* Polygonal 3D shapes representing dawn of 3D polygon generation */}
            <div className="absolute top-1/4 left-10 w-24 h-24 border border-blue-500/5 rotate-45 pointer-events-none z-0" />
            <div className="absolute top-1/3 right-10 w-32 h-32 border border-blue-500/5 rotate-12 pointer-events-none z-0 animate-spin" style={{ animationDuration: '40s' }} />
            <div className="absolute bottom-[28%] left-1/4 w-12 h-12 border border-blue-400/5 -rotate-12 pointer-events-none z-0" />
          </>
        );
      case 'genesis':
      case 'megadrive':
        return (
          <>
            {/* Sega blue grid matrix design */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none z-0" style={{ backgroundImage: 'linear-gradient(rgba(0,186,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,186,255,0.1) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            <div className="absolute inset-x-0 bottom-1/4 h-px bg-[#4338CA]/20 pointer-events-none z-0" />
          </>
        );
      case 'sms':
      case 'mastersystem':
        return (
          <>
            {/* Master System white graph paper grid backdrop */}
            <div className="absolute inset-0 opacity-[0.06] pointer-events-none z-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
          </>
        );
      case 'atari2600':
      case 'atari':
        return (
          <>
            {/* Atari Wood panel stripes and grill overlays */}
            <div className="absolute inset-x-0 top-[38%] h-4 bg-amber-950/20 border-y border-amber-500/10 pointer-events-none z-0" />
            <div className="absolute top-0 bottom-0 left-[10%] w-0.5 bg-amber-700/5 pointer-events-none z-0" />
            <div className="absolute top-0 bottom-0 right-[10%] w-0.5 bg-amber-700/5 pointer-events-none z-0" />
          </>
        );
      case 'ps1':
      case 'psx':
      case 'playstation':
        return (
          <>
            {/* Classic geometric symbols crossing in deep luxury gray */}
            <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            <div className="absolute top-[20%] left-[12%] opacity-[0.03] text-7xl font-sans pointer-events-none z-0 rotate-12">▲</div>
            <div className="absolute bottom-[22%] right-[12%] opacity-[0.03] text-7xl font-sans pointer-events-none z-0 -rotate-12">●</div>
          </>
        );
      case 'gb':
      case 'gbc':
      case 'gba':
      case 'gameboy':
      case 'gameboycolor':
        return (
          <>
            {/* Dot matrix handheld pattern */}
            <div className="absolute inset-0 opacity-[0.04] pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(ellipse, #10b981 1.5px, transparent 1.5px)', backgroundSize: '14px 14px' }} />
          </>
        );
      case 'arcade':
      case 'mame':
        return (
          <>
            {/* Retro Synthwave Horizon Vector line */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#D97706]/5 via-[#f43f5e]/5 to-transparent pointer-events-none z-0" />
            <div className="absolute inset-x-0 bottom-[30%] h-px bg-[#f43f5e]/15 pointer-events-none z-0" />
            <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(244,63,94,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(244,63,94,0.15) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          </>
        );
      case 'neogeo':
        return (
          <>
            {/* Double golden yellow stripe borders */}
            <div className="absolute top-0 inset-x-0 h-1 bg-yellow-600/10 pointer-events-none z-0" />
            <div className="absolute bottom-0 inset-x-0 h-1 bg-yellow-600/10 pointer-events-none z-0" />
          </>
        );
      default:
        return null;
    }
  }, [system.id]);

  // helper to get stylized physical cartridge shell parameters
  const getCartridgeStyle = (systemId: string, isSelected: boolean) => {
    switch (systemId) {
      case 'snes':
        return {
          bg: 'bg-zinc-300',
          border: isSelected ? 'border-[#4F46E5] ring-2 ring-[#4F46E5]/20' : 'border-zinc-400',
          innerShadow: 'shadow-[inset_0_4px_10px_rgba(255,255,255,0.55),_0_8px_20px_rgba(0,0,0,0.5)]',
          labelPadding: 'p-2 pt-5 pb-2',
          cartridgeType: 'snes'
        };
      case 'genesis':
      case 'megadrive':
        return {
          bg: 'bg-zinc-900',
          border: isSelected ? 'border-[#4338CA] ring-2 ring-[#4338CA]/20' : 'border-zinc-800',
          innerShadow: 'shadow-[inset_0_3px_6px_rgba(255,255,255,0.15),_0_8px_20px_rgba(0,0,0,0.55)]',
          labelPadding: 'p-2 pt-4 pb-2',
          cartridgeType: 'genesis'
        };
      case 'n64':
        return {
          bg: 'bg-[#cfcfd4]',
          border: isSelected ? 'border-[#3B82F6] ring-2 ring-[#3B82F6]/20' : 'border-zinc-400',
          innerShadow: 'shadow-[inset_0_4px_8px_rgba(255,255,255,0.45),_0_8px_20px_rgba(0,0,0,0.4)]',
          labelPadding: 'p-2 pt-6 pb-2',
          cartridgeType: 'n64'
        };
      case 'nes':
        return {
          bg: 'bg-zinc-600',
          border: isSelected ? 'border-[#E60012] ring-2 ring-[#E60012]/30' : 'border-zinc-700',
          innerShadow: 'shadow-[inset_0_4px_8px_rgba(255,255,255,0.25),_0_8px_20px_rgba(0,0,0,0.5)]',
          labelPadding: 'p-2 pt-4 pb-2',
          cartridgeType: 'nes'
        };
      case 'gb':
      case 'gbc':
      case 'gba':
      case 'gameboy':
      case 'gameboycolor':
        return {
          bg: 'bg-[#9ca3af]',
          border: isSelected ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-zinc-400',
          innerShadow: 'shadow-[inset_0_4px_8px_rgba(255,255,255,0.35),_0_8px_16px_rgba(0,0,0,0.45)]',
          labelPadding: 'p-2 pt-4 pb-2',
          cartridgeType: 'gameboy'
        };
      default:
        return {
          bg: 'bg-zinc-950/80',
          border: isSelected ? 'border-white/90 ring-2 ring-white/10' : 'border-white/10',
          innerShadow: 'shadow-[0_8px_16px_rgba(0,0,0,0.5)]',
          labelPadding: 'p-0',
          cartridgeType: 'optical'
        };
    }
  };

  return (
    <motion.div 
      id="gamelist-container" 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="fixed inset-0 w-full h-screen font-sans text-white overflow-hidden bg-[#050508] flex flex-col justify-between select-none"
    >
      
      {/* CAMADA 0: BACKGROUND DINÂMICO ESPECÍFICO DO CONSOLE ATIVO */}
      <div className="absolute inset-0 z-0 pointer-events-none transition-all duration-700">
        <img 
          src={`https://raw.githubusercontent.com/lordjunnior/recalbox-theme/main/assets/arts/${getRecalboxFolderName(system.id)}.jpg`}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-[0.16] select-none scale-105 transition-opacity duration-700 filter blur-[1px]"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://raw.githubusercontent.com/lordjunnior/recalbox-theme/main/assets/arts/favorites.jpg`;
          }}
          referrerPolicy="no-referrer"
        />
        {selectedGame && selectedGame.image && (
          <img 
            src={selectedGame.image || ''} 
            alt="" 
            className="absolute inset-0 w-full h-full object-cover opacity-[0.09] filter blur-xl scale-110 transition-opacity duration-700" 
            referrerPolicy="no-referrer"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-[#050508]/94 to-[#050508]" />
      </div>

      {/* CAMADA 1: DECORAÇÃO DE FUNDO VETORIAL ESPECÍFICA DO CONSOLE */}
      {themeBackgroundDecoration}

      {/* PAINEL DE CONTROLE DA INTERFACE SUPERIOR COM HEADER ROBUSTO */}
      <div className="w-full relative z-50 h-18 border-b border-white/5 bg-black/40 backdrop-blur-md flex items-center justify-between px-6 sm:px-10">
        <div id="retro-header-left" className="flex items-center gap-3">
          <button 
            id="retro-back-btn"
            onClick={handleBack}
            className="group flex items-center gap-2 text-[10px] sm:text-xs font-retro tracking-widest text-white bg-[#E60012] hover:bg-red-500 border border-red-400 hover:border-red-300 rounded-lg px-2.5 py-1.5 sm:px-4 sm:py-2 shadow-[0_4px_0_0_#91000B] hover:shadow-[0_2px_0_0_#91000B] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer font-black shrink-0"
          >
            <div className="w-4 h-4 rounded-full bg-zinc-950 text-red-500 flex items-center justify-center text-[10px] font-retro border border-white/20 group-hover:scale-110 transition-transform">
              B
            </div>
            <span>VOLTAR</span>
          </button>
          
          <div className="h-5 w-px bg-white/10 ml-2" />
          
          <img 
            id="retro-console-logo"
            src={`/logos/${consoleId}.png`} 
            alt={system.name} 
            className="h-7 w-auto object-contain ml-3 filter drop-shadow hover:scale-105 transition-transform" 
            onError={(e) => { e.currentTarget.style.display = 'none'; }} 
          />
        </div>

        <div id="retro-header-right" className="flex items-center gap-3">
          <div className="flex items-center bg-black/50 border border-white/10 rounded-xl px-3 py-1.5 backdrop-blur-md">
            <Search className="w-3.5 h-3.5 text-white/30 mr-2" />
            <input 
              id="retro-search-input"
              ref={searchInputRef} 
              type="text" 
              placeholder="Buscar clássico..." 
              value={searchTerm} 
              onChange={(e) => { setSearchTerm(e.target.value); setSelectedGameIndex(0); }} 
              className="bg-transparent border-none text-xs text-white focus:outline-none w-36 sm:w-48 placeholder-white/20 py-0" 
            />
          </div>
        </div>
      </div>

      {/* SEÇÃO PRINCIPAL CENTRALIZADA (Layout dividido perfeitamente simétrico de alta densidade) */}
      <main className="w-full max-w-6xl mx-auto flex-1 flex flex-col justify-center items-center px-4 md:px-8 py-4 gap-6 relative z-30">
        
        {/* Row 1: Symmetrical Grid de Visualização */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch justify-items-center">
          
          {/* PAINEL DA ESQUERDA: TELA CRT DE RETRO TV DA MÁQUINA */}
          <section className="w-full max-w-[430px] aspect-[4/3] bg-[#1d1d1f] border-[10px] border-[#2f2f32] rounded-3xl p-3 md:p-3.5 shadow-[0_22px_50px_rgba(0,0,0,0.85)] relative overflow-hidden flex flex-col justify-between">
            {/* TV Bezel design grooves */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-16 h-1 bg-[#131315] rounded-full opacity-50" />
            
            {/* Inner tube container */}
            <div className="flex-1 w-full bg-black rounded-xl overflow-hidden relative shadow-[inset_0_0_25px_rgba(0,0,0,1)] flex items-center justify-center p-2">
              {selectedGame ? (
                <>
                  <div className="absolute inset-0 bg-zinc-950/92 z-0 animate-pulse" />
                  
                  {/* Real-time Gameplay Video Preview inside Retro TV Screen */}
                  <video
                    key={`preview-video-${selectedGame.id}`}
                    src={getGameGameplayVideoUrl(system.id, selectedGame.title)}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className={`absolute inset-0 w-full h-full object-cover z-10 transition-opacity duration-500 ${videoLoaded && !videoError ? 'opacity-85' : 'opacity-0'}`}
                    onLoadedData={() => setVideoLoaded(true)}
                    onError={() => {
                      setVideoError(true);
                      setVideoLoaded(false);
                    }}
                  />

                  {/* High quality cover display inside TV as default / backup */}
                  <div className={`relative w-full h-full flex items-center justify-center z-5 transition-opacity duration-300 ${videoLoaded && !videoError ? 'opacity-20' : 'opacity-100'}`}>
                    <GameCover 
                      game={selectedGame} 
                      systemId={system.id} 
                      className="max-h-full max-w-full object-contain rounded shadow-[0_0_20px_rgba(255,255,255,0.12)]" 
                    />
                  </div>
                </>
              ) : (
                <div className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">Nenhum jogo encontrado</div>
              )}
              
              {/* Scanlines layer for deep retro CRT monitor feeling */}
              <div 
                className="absolute inset-0 pointer-events-none opacity-15 mix-blend-overlay z-20"
                style={{ backgroundImage: 'linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.45) 50%)', backgroundSize: '100% 4px' }}
              />
              {/* Curved screen reflection overlay */}
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.05)_0%,transparent_55%),radial-gradient(circle_at_center,transparent_45%,rgba(0,0,0,0.50)_100%)] z-20" />
            </div>
            
            {/* TV base bar details containing glowing Power LED */}
            <div className="h-5 mt-1 flex items-center justify-between px-1.5 text-[8px] font-mono text-zinc-500">
              <span className="tracking-widest">LORDTECA CRT-430</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[7px] text-zinc-600">ENERGIA</span>
                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                  system.id === 'snes' ? 'bg-purple-500 shadow-[0_0_6px_#c084fc]' :
                  system.id === 'nes' ? 'bg-red-500 shadow-[0_0_6px_#ef4444]' :
                  system.id === 'n64' ? 'bg-blue-500 shadow-[0_0_6px_#3b82f6]' :
                  'bg-emerald-500 shadow-[0_0_6px_#34d399]'
                }`} />
              </div>
            </div>
          </section>
          
          {/* PAINEL DA DIREITA: DETALHES DE METADADOS (Symmetric copy of Left panel dimensions for balanced style) */}
          <aside className="w-full max-w-[430px] aspect-[4/3] bg-zinc-900/75 border border-white/10 backdrop-blur-md rounded-3xl p-5 md:p-6 flex flex-col justify-between shadow-[0_22px_50px_rgba(0,0,0,0.65)] relative overflow-hidden">
            <AnimatePresence mode="wait">
              {selectedGame ? (
                <motion.div 
                  key={`meta-${selectedGame.id}`} 
                  initial={{ opacity: 0, scale: 0.96 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  exit={{ opacity: 0, scale: 0.96 }} 
                  transition={{ duration: 0.22 }}
                  className="w-full h-full flex flex-col justify-between"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-[9px] font-mono tracking-wider">
                      <span className="uppercase font-extrabold px-2 py-0.5 rounded bg-white/10 text-emerald-400 border border-white/5">
                        {selectedGame.genre || "RETRO CLASSIC"}
                      </span>
                      <span className="text-zinc-500">•</span>
                      <span className="text-zinc-400 font-bold uppercase truncate max-w-[150px]">{selectedGame.developer || "Retro Studio"}</span>
                    </div>
                    
                    <h2 className="text-lg md:text-2xl font-black tracking-tight text-white uppercase drop-shadow-md leading-tight line-clamp-2 mt-1">
                      {selectedGame.title}
                    </h2>
                    
                    <p className="text-[11px] md:text-[12px] text-zinc-300 font-sans font-normal leading-relaxed overflow-y-auto max-h-[14vh] pr-2 scrollbar-thin scrollbar-thumb-white/10 mt-1">
                      {getRichDescription(selectedGame.title, system.name)}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 mt-2 border-t border-white/5 pt-3 shrink-0">
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div className="bg-white/5 border border-white/5 rounded-lg p-2 flex flex-col justify-center">
                        <span className="text-[7px] text-zinc-500 uppercase tracking-widest font-mono font-black">LANÇAMENTO</span>
                        <span className="font-bold text-zinc-200 mt-0.5 font-mono">{selectedGame.year || "Classic"}</span>
                      </div>
                      <div className="bg-white/5 border border-white/5 rounded-lg p-2 flex flex-col justify-center">
                        <span className="text-[7px] text-zinc-500 uppercase tracking-widest font-mono font-black">NÚCLEO EMULADOR</span>
                        <span className="font-bold text-zinc-200 mt-0.5 font-mono uppercase truncate">{system.emulatorCore || "RetroArch"}</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleLaunchGame(selectedGame)} 
                      className="w-full py-2.5 md:py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-retro text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-[0_4px_12px_rgba(16,185,129,0.3)] active:translate-y-[1px] active:shadow-md text-center"
                    >
                      ➔ JOGAR AGORA
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <span className="text-xs text-zinc-500 uppercase tracking-widest">Sem Resultados</span>
                </div>
              )}
            </AnimatePresence>
          </aside>
          
        </div>

        {/* Row 2: Symmetrical Game Cartridge Carousel (Fades safely at borders using CSS masking) */}
        <section className="w-full max-w-5xl flex flex-col justify-center relative mt-3 pt-1">
          
          <div 
            className="w-full overflow-hidden relative"
            style={{
              maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
              WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)'
            }}
          >
            <div 
              ref={listContainerRef} 
              className="flex items-center overflow-x-auto gap-5 py-4 no-scrollbar scroll-smooth snap-x w-full pointer-events-auto" 
              style={{ paddingLeft: 'calc(50% - 62px)', paddingRight: 'calc(50% - 62px)' }}
            >
              {filteredGames.map((game, idx) => {
                const offset = idx - selectedGameIndex;
                const isSelected = idx === selectedGameIndex;
                const distance = Math.abs(offset);
                const isFar = distance > 5;
                const cartStyle = getCartridgeStyle(system.id, isSelected);

                return (
                  <motion.button
                    key={game.id}
                    onClick={() => handleGameClick(idx, game)}
                    animate={{
                      scale: isSelected ? 1.05 : 0.85 - Math.min(distance * 0.04, 0.12),
                      opacity: isSelected ? 1 : isFar ? 0 : 0.45 - Math.min(distance * 0.07, 0.25),
                      x: isSelected ? 0 : (idx < selectedGameIndex ? 10 : -10) * Math.min(distance, 3),
                    }}
                    transition={{ type: 'spring', stiffness: 240, damping: 22 }}
                    className={`shrink-0 relative focus:outline-none cursor-pointer flex flex-col items-center select-none ${isFar ? 'pointer-events-none' : 'pointer-events-auto'}`}
                    style={{ width: '124px', visibility: isFar ? 'hidden' : 'visible' }}
                  >
                    {/* Symmetrical Tactile physical cartridge frame */}
                    <div className={`w-[115px] rounded-t-xl overflow-hidden ${cartStyle.bg} border border-b-0 ${cartStyle.border} ${cartStyle.innerShadow} transition-all duration-300 relative`}>
                      
                      {/* Cartridges details (ridges) and custom industrial designs */}
                      {cartStyle.cartridgeType === 'snes' && (
                        <div className="h-4 bg-[#b5b5bc]/80 flex justify-center gap-1.5 items-end pb-1 border-b border-zinc-400">
                          <div className="w-1.5 h-2 bg-zinc-400 rounded-t-sm" />
                          <div className="w-1.5 h-2 bg-zinc-400 rounded-t-sm" />
                          <div className="w-1.5 h-2 bg-zinc-400 rounded-t-sm" />
                        </div>
                      )}
                      
                      {cartStyle.cartridgeType === 'genesis' && (
                        <div className="h-3 bg-[#111113] flex flex-col justify-around py-0.5 border-b border-zinc-950">
                          <div className="h-0.5 w-full bg-zinc-800" />
                          <div className="h-0.5 w-full bg-zinc-800" />
                        </div>
                      )}

                      {cartStyle.cartridgeType === 'n64' && (
                        <div className="h-5 bg-[#c2c2c8] flex justify-center items-end pb-1 border-b border-zinc-400 gap-2">
                          <div className="w-10 h-1 bg-zinc-400 rounded-sm" />
                        </div>
                      )}
                      
                      {cartStyle.cartridgeType === 'nes' && (
                        <div className="absolute top-0 bottom-0 left-1 w-2 bg-zinc-700/80 flex flex-col gap-1 py-4 justify-around">
                          <div className="h-0.5 w-full bg-zinc-800" />
                          <div className="h-0.5 w-full bg-zinc-800" />
                          <div className="h-0.5 w-full bg-zinc-800" />
                        </div>
                      )}

                      {cartStyle.cartridgeType === 'gameboy' && (
                        <div className="h-4 bg-[#8e95a0] flex items-center justify-between px-2.5 border-b border-zinc-400">
                          <span className="text-[5px] text-zinc-500 font-extrabold tracking-widest font-sans">GAME BOY</span>
                          <div className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                        </div>
                      )}

                      {/* Cover sticker label */}
                      <div className={`${cartStyle.labelPadding}`}>
                        <div className="relative aspect-[3/4] rounded-md overflow-hidden bg-zinc-950 shadow-[inset_0_0_10px_rgba(0,0,0,0.85)] border border-white/5">
                          <GameCover game={game} systemId={system.id} className="w-full h-full object-cover" />
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
          
        </section>

      </main>

      {/* RODAPÉ STANDARD SUTIL */}
      <footer className="w-full h-8 bg-black/40 border-t border-white/5 backdrop-blur-md z-45 flex items-center justify-between px-6 sm:px-10 font-sans text-[9px] font-bold text-zinc-500 tracking-wider">
        <div>◀▶ SELECIONAR CARTUCHO • ENTER CONFIRMAR</div>
        <div className="font-mono">{filteredGames.length} ROMS DETECTADAS</div>
      </footer>

      {/* INTERFACE DE EMULAÇÃO OVERLAY */}
      <AnimatePresence>
        {emulatingGame && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ zIndex: 99999 }}
            className="fixed inset-0 bg-black flex flex-col justify-between"
          >
            <EmulatorPlayer system={system} game={emulatingGame} onClose={handleCloseEmulator} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
