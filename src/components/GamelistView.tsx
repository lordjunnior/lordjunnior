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
import { 
  ArrowLeft, 
  Search, 
  Heart, 
  Play, 
  Gamepad2,
  Calendar,
  Layers,
  Cpu,
  User,
  Star
} from 'lucide-react';

interface GamelistViewProps {
  system: System;
  onBack: () => void;
  isMuted: boolean;
  toggleMute: () => void;
}

// Biblioteca de Sinopses Históricas em PT-BR para Grandes Clássicos
const gameDescriptions: Record<string, string> = {
  "super mario bros.": "O clássico de plataforma lendário pioneiro que salvou a indústria dos videogames em 1985, estabeleceu as mecânicas de rolagem lateral e definiu o encanador mais famoso do planeta.",
  "super mario bros. 3": "Aclamado como uma das maiores obras-primas da era 8-bits. Introduziu o emblemático mapa-múndi de seleção de fases, inventários de itens e transformações icônicas como a Super Leaf (Mário Guaxinim) e a Tanooki Suit.",
  "the legend of zelda": "A obra-prima pioneira de Shigeru Miyamoto que apresentou o reino de Hyrule de forma não-linear. Definiu todo o gênero de Aventura e RPG com seu system inovador de exploração livre e salvamento de progresso.",
  "metroid": "O nascimento do gênero Metroidvania. Apresentou um ambiente alienígena sombrio, isolado e labiríntico na fortaleza de Zebes, culminando na revelação histórica de que a caçadora de recompensas Samus Aran era uma mulher.",
  "castlevania": "A influente jornada gótica de Simon Belmont empunhando o chicote lendário Vampire Killer na fortaleza do Conde Drácula. Trilha sonora inesquecível and atmosfera medieval de terror magnífica.",
  "mega man": "O icônico robô azul da Capcom estreia revolucionando a ação em plataformas com seu sistema de escolha livre de fases e a mecânica inovadora de absorver os poderes dos chefes derrotados (Robot Masters).",
  "sonic the hedgehog": "A resposta veloz e rebelde da Sega que redefiniu os jogos de plataforma nos anos 90. Com loops em alta velocidade, design de fases verticalizado e uma trilha sonora memorável, estabeleceu o ouriço como ícone mundial.",
  "donkey kong country": "Um marco tecnológico revolucionário que utilizou gráficos pré-renderizados em estações Advanced Computer Modeling (ACM). Transformou o Super Nintendo com física soberba, trilha sonora imersiva e jogabilidade impecável em dupla.",
  "chrono trigger": "Considerado por muitos o maior RPG de todos os tempos. Desenvolvido pelo 'Dream Team' (Hironobu Sakaguchi, Yuji Horii e Akira Toriyama), revolucionou o gênero com viagens no tempo, múltiplos finais e combate dinâmico sem transição de tela.",
  "super metroid": "A perfeição absoluta do design de níveis bidimensional. Atmosfera sufocante no planeta Zebes, narrativa puramente visual, trilha sonora fantástica e um mapa perfeitamente interconectado que se tornou o pilar dourado dos Metroidvanias."
};

// TRADUTOR CASE-SENSITIVE: Mapeamento cirúrgico para a sua pasta local public/logos/
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

// Retorna a cor sólida temática do sistema ativo para iluminar o tema dinamicamente
const getSystemThemeColor = (id: string): string => {
  const cleanId = id.toLowerCase().trim().replace(/[\s\-_]/g, '');
  const map: Record<string, string> = {
    nes: '#E60012',
    snes: '#8B5CF6',
    n64: '#10B881',
    megadrive: '#3B82F6',
    genesis: '#3B82F6',
    ps1: '#94A3B8',
    psx: '#94A3B8',
    arcade: '#F59E0B',
    '3do': '#EF4444'
  };
  return map[cleanId] || '#E60012';
};

const getRichDescription = (title: string, systemName: string): string => {
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

const getLibretroSystemFolderName = (systemId: string): string => {
  const cleanId = (systemId || '').toLowerCase();
  const map: Record<string, string> = {
    nes: 'Nintendo_-_Nintendo_Entertainment_System',
    snes: 'Nintendo_-_Super_Nintendo_Entertainment_System',
    n64: 'Nintendo_-_Nintendo_64',
    gb: 'Nintendo_-_Game_Boy',
    gbc: 'Nintendo_-_Game_Boy_Color',
    gba: 'Nintendo_-_Game_Boy_Advance',
    sms: 'Sega_-_Master_System',
    mastersystem: 'Sega_-_Master_System',
    genesis: 'Sega_-_Mega_Drive_-_Genesis',
    megadrive: 'Sega_-_Mega_Drive_-_Genesis',
    gamegear: 'Sega_-_Game_Gear',
    ps1: 'Sony_-_PlayStation',
    psx: 'Sony_-_PlayStation',
    atari: 'Atari_-_2600',
    atari2600: 'Atari_-_2600',
    nds: 'Nintendo_-_Nintendo_DS',
    pce: 'NEC_-_PC_Engine_-_TurboGrafx-16',
    pcengine: 'NEC_-_PC_Engine_-_TurboGrafx-16',
    '3do': 'The_3DO_Company_-_3DO',
  };
  return map[cleanId] || '';
};

const getLibretroCandidates = (title: string, systemId: string): string[] => {
  const folder = getLibretroSystemFolderName(systemId);
  if (!folder) return [];

  const candidates: string[] = [];
  const baseTitle = title.trim();

  const cleanBase = (t: string, customClean: boolean): string => {
    let s = t;
    if (customClean) s = s.replace(/:/g, ' -');
    s = s.replace(/\s\x27N\s/g, " 'n ").replace(/\s\x27n\s/g, " 'n ").replace(/[/*?"<>|]/g, '');
    return s;
  };

  const suffixes = ['', ' (USA)', ' (USA, Europe)', ' (Europe)', ' (Japan)', ' (World)'];

  for (const sfx of suffixes) candidates.push(cleanBase(baseTitle + sfx, false));
  for (const sfx of suffixes) candidates.push(cleanBase(baseTitle + sfx, true));

  return Array.from(new Set(candidates)).map(c => 
    `https://raw.githubusercontent.com/libretro-thumbnails/${folder}/master/Named_Boxarts/${encodeURIComponent(c)}.png`
  );
};

const GameCover: React.FC<{ game: Game; systemId: string; className?: string }> = ({ game, systemId, className }) => {
  const candidates = useMemo(() => {
    let cleanTitle = game.title.replace(/\(PT-BR\)/gi, '').replace(/\[PT-BR\]/gi, '').replace(/\(Traduzido\)/gi, '').replace(/\[Traduzido\]/gi, '').trim();
    if (cleanTitle.toLowerCase().startsWith('the ')) {
      const coreName = cleanTitle.substring(4).trim();
      cleanTitle = `${coreName}, The`;
    }
    return getLibretroCandidates(cleanTitle, systemId);
  }, [game.title, systemId]);

  const [src, setSrc] = useState<string>('');
  const [attempt, setAttempt] = useState<number>(0);
  const [loaded, setLoaded] = useState(false);
  const [isFatalError, setIsFatalError] = useState(false);

  useEffect(() => {
    setIsFatalError(false);
    setLoaded(false);
    if (candidates.length > 0) {
      setSrc(candidates[0]);
      setAttempt(1);
    } else {
      setSrc(game.image || '');
      setAttempt(0);
    }
  }, [game, candidates]);

  const handleError = () => {
    if (attempt > 0 && attempt < candidates.length) {
      setSrc(candidates[attempt]);
      setAttempt(prev => prev + 1);
    } else if (src !== game.image && game.image) {
      setSrc(game.image);
      setAttempt(0);
    } else {
      setIsFatalError(true);
      setLoaded(true);
    }
  };

  if (isFatalError || !src) {
    return (
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 to-black border border-white/5 rounded-xl flex flex-col items-center justify-center p-4 text-center select-none shadow-inner">
        <Gamepad2 className="w-8 h-8 text-zinc-800 stroke-1 mb-2 animate-pulse" />
        <span className="font-retro text-[9px] text-zinc-500 uppercase tracking-widest leading-tight line-clamp-3 px-1">
          {game.title}
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden flex items-center justify-center bg-transparent">
      <img
        src={src}
        alt=""
        onError={handleError}
        onLoad={() => setLoaded(true)}
        className={`${className} transition-opacity duration-350 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        loading="lazy"
        referrerPolicy="no-referrer"
      />
      {!loaded && (
        <div className="absolute inset-0 bg-zinc-950/40 flex items-center justify-center">
          <Gamepad2 className="w-5 h-5 text-zinc-700 animate-pulse" />
        </div>
      )}
    </div>
  );
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
  const themeColor = getSystemThemeColor(system.id);

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

  return (
    <motion.div 
      id="gamelist-container" 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="relative w-full h-screen font-sans text-white overflow-hidden bg-gradient-to-b from-[#060608] to-[#020203] flex flex-col justify-between select-none"
    >
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center opacity-[0.04] blur-2xl scale-105 pointer-events-none"
          style={{ backgroundImage: `url(${system.backgroundImage})` }}
        />
        <div className="absolute inset-0 bg-[#040406]/95 pointer-events-none" />
        <div 
          className="absolute inset-0 pointer-events-none transition-all duration-500"
          style={{ backgroundImage: `radial-gradient(circle at 50% 0%, ${themeColor}18, transparent 70%)` }}
        />
      </div>

      <header className="relative z-30 h-16 flex items-center justify-between px-6 md:px-10 border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="group flex items-center gap-2 text-[10px] font-retro tracking-widest text-white bg-zinc-900/80 border border-white/5 hover:border-white/15 rounded-full px-4 py-2 transition-all cursor-pointer shadow-md active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
            <span>VOLTAR</span>
          </button>
          
          <div className="h-4 w-px bg-white/10" />
          
          <div className="flex items-center gap-4">
            <img 
              src={`/logos/${getLogoFileName(system.id)}.png`} 
              alt={system.name} 
              className="h-8 w-auto object-contain filter drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallbackSpan = document.getElementById('header-text-fallback');
                if (fallbackSpan) fallbackSpan.style.display = 'block';
              }}
            />
            <span id="header-text-fallback" style={{ display: 'none' }} className="font-retro text-[10px] font-black px-2 py-0.5 rounded border border-white/10 uppercase tracking-widest bg-white/5">
              {system.name}
            </span>
            <span className="text-[9px] font-mono text-zinc-500 hidden md:inline uppercase tracking-widest bg-zinc-900/40 px-2 py-0.5 rounded border border-white/5">
              {filteredGames.length} / {system.gameCount} ROMs Mapeadas
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex items-center bg-zinc-950/60 border border-white/5 rounded-full px-4 py-1.5 w-44 sm:w-64 transition-all focus-within:border-white/15 focus-within:bg-black/80">
            <Search className="w-3.5 h-3.5 text-zinc-500 mr-2 shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Pesquisar título..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSelectedGameIndex(0);
              }}
              className="bg-transparent border-none text-xs text-white focus:outline-none w-full placeholder-zinc-600 focus:ring-0 py-0"
            />
          </div>

          <button
            onClick={() => {
              soundEngine.playToggle();
              setFilterFavorites(!filterFavorites);
              setSelectedGameIndex(0);
            }}
            className={`p-2 px-3 rounded-full border transition cursor-pointer flex items-center gap-1.5 text-[9px] font-retro tracking-widest ${
              filterFavorites 
                ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-600/40' 
                : 'bg-zinc-900/40 border-white/5 text-zinc-400 hover:text-white'
            }`}
          >
            <Heart className={`w-3 h-3 ${filterFavorites ? 'fill-white text-white' : ''}`} />
            <span className="hidden sm:inline">FAVORITOS</span>
          </button>
        </div>
      </header>

      <main className="relative z-20 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 md:p-8 overflow-hidden max-w-[1750px] w-full mx-auto items-center">
        
        <div className="lg:col-span-8 flex flex-col justify-center h-full overflow-hidden py-4 relative">
          <div className="mb-2 flex justify-between items-center px-4">
            <h3 className="font-retro text-[9px] tracking-[0.2em] text-zinc-500 uppercase font-black">
              SELEÇÃO DE CARTUCHOS • ESFERA 3D
            </h3>
          </div>

          <div 
            ref={listContainerRef}
            className="flex items-center overflow-x-auto gap-8 py-10 no-scrollbar scroll-smooth snap-x w-full relative z-30"
            style={{ paddingLeft: '38%', paddingRight: '38%', minHeight: '340px' }}
          >
            {filteredGames.length === 0 ? (
              <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-8 text-zinc-600">
                <Gamepad2 className="w-12 h-12 mb-3 opacity-10 text-white animate-pulse" />
                <p className="font-retro text-[9px] tracking-widest uppercase">Nenhum título encontrado</p>
              </div>
            ) : (
              filteredGames.map((game, idx) => {
                const isSelected = idx === selectedGameIndex;
                const distance = Math.abs(idx - selectedGameIndex);
                
                return (
                  <motion.button
                    key={game.id}
                    onClick={() => handleGameClick(idx, game)}
                    className="shrink-0 relative focus:outline-none cursor-pointer outline-none flex flex-col items-center select-none group z-30"
                    style={{ zIndex: 100 - distance }}
                    animate={{
                      scale: isSelected ? 1.05 : 0.82 - Math.min(distance * 0.05, 0.2),
                      opacity: isSelected ? 1 : 0.35 - Math.min(distance * 0.05, 0.2),
                      rotateY: isSelected ? 0 : (idx < selectedGameIndex ? 28 : -28), 
                      x: isSelected ? 0 : (idx < selectedGameIndex ? 20 : -20) * Math.min(distance, 3),
                    }}
                    transition={{ type: 'spring', stiffness: 160, damping: 18 }}
                  >
                    <div 
                      className={`relative w-44 h-60 md:w-48 md:h-64 rounded-xl overflow-hidden transition-all duration-300 ${
                        isSelected 
                          ? 'border-[3px] shadow-[0_20px_45px_rgba(0,0,0,0.85)] ring-2 ring-white/10' 
                          : 'border border-white/5 hover:border-white/15 shadow-md'
                      }`}
                      style={isSelected ? { borderColor: themeColor, boxShadow: `0px 10px 40px ${themeColor}25` } : {}}
                    >
                      <div className="absolute inset-x-0 top-0 h-[40%] bg-gradient-to-b from-white/10 to-transparent z-10 pointer-events-none" />
                      <div className="absolute left-0 inset-y-0 w-2.5 bg-gradient-to-b from-zinc-800 to-zinc-950 z-20 pointer-events-none shadow-md opacity-80" />
                      
                      <GameCover 
                        game={game} 
                        systemId={system.id} 
                        className="w-full h-full object-cover select-none pointer-events-none" 
                      />
                    </div>
                    <span 
                      className="text-[9px] font-mono mt-3 uppercase tracking-widest font-bold transition-opacity"
                      style={isSelected ? { color: themeColor, opacity: 1 } : { opacity: 0.15 }}
                    >
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                  </motion.button>
                );
              })
            )}
          </div>

          <div className="mt-4 h-36 flex flex-col justify-start z-30 px-4">
            <AnimatePresence mode="wait">
              {selectedGame && (
                <motion.div
                  key={`meta-text-${selectedGame.id}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  className="max-w-2xl text-left"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span 
                      className="text-[8.5px] font-retro px-2.5 py-0.5 rounded border uppercase tracking-wider block"
                      style={{ backgroundColor: `${themeColor}15`, borderColor: `${themeColor}25`, color: themeColor }}
                    >
                      {selectedGame.genre}
                    </span>
                    <span className="text-[9px] font-mono text-zinc-600">BY {selectedGame.developer.toUpperCase()}</span>
                  </div>
                  <h1 className="text-xl md:text-2xl font-display font-black tracking-tight text-white uppercase leading-none mb-2">
                    {selectedGame.title}
                  </h1>
                  <p className="text-xs text-zinc-400 leading-relaxed font-sans font-medium line-clamp-3">
                    {getRichDescription(selectedGame.title, system.name)}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col items-center justify-center p-5 bg-zinc-950/40 border border-white/5 rounded-2xl backdrop-blur-sm relative overflow-hidden h-full z-30 gap-6">
          {selectedGame ? (
            <div className="w-full flex flex-col h-full justify-between gap-5 py-1">
              
              <div className="relative w-full aspect-[4/3] bg-[#121216] border-[6px] border-[#22222b] rounded-3xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.95)] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-3 rounded-xl overflow-hidden bg-black z-10 flex items-center justify-center">
                  
                  {!videoError && (
                    <video
                      key={`crt-preview-video-${selectedGame.title}`}
                      src={getGameGameplayVideoUrl(system.id, selectedGame.title)}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className={`w-full h-full object-cover absolute inset-0 select-none z-10 filter contrast-125 saturate-110 brightness-105 transition-opacity duration-500 ${
                        videoLoaded ? 'opacity-[0.85]' : 'opacity-0'
                      }`}
                      onPlay={() => setVideoLoaded(true)}
                      onLoadedData={() => setVideoLoaded(true)}
                      onError={() => {
                        setVideoError(true);
                        setVideoLoaded(false);
                      }}
                    />
                  )}

                  <div className={`absolute inset-0 z-0 bg-zinc-950 transition-all duration-500 ${videoLoaded ? 'opacity-20 blur-sm scale-105' : 'opacity-100 scale-100'}`}>
                    <div className="absolute inset-0 opacity-35 blur-md scale-110 pointer-events-none overflow-hidden">
                      <GameCover game={selectedGame} systemId={system.id} className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center p-4 z-10 pointer-events-none">
                      <GameCover game={selectedGame} systemId={system.id} className="max-h-full max-w-full object-contain rounded-md filter brightness-105 contrast-110 drop-shadow-[0_0_25px_rgba(0,0,0,0.95)]" />
                    </div>
                  </div>

                  <div 
                    className="absolute inset-0 pointer-events-none opacity-25 mix-blend-overlay z-20"
                    style={{ backgroundImage: 'linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.4) 50%)', backgroundSize: '100% 6px' }}
                  />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(0,0,0,0.78))] pointer-events-none z-22" />
                  
                  <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 bg-black/70 backdrop-blur px-1.5 py-0.5 rounded border border-white/5 z-25 font-mono text-[7.5px] tracking-wider text-zinc-400 leading-none">
                    <span className={`h-1 w-1 rounded-full ${videoLoaded ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
                    <span>{videoLoaded ? 'VIDEO FEED' : 'PREVIEW FEED'}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 w-full font-mono text-[9px] text-zinc-500">
                <div className="bg-zinc-950/60 border border-white/5 rounded-xl p-2.5">
                  <span className="text-[7.5px] text-zinc-600 block uppercase tracking-wider mb-0.5">Ano Lançamento</span>
                  <span className="text-[10px] font-semibold text-zinc-300 block flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-zinc-500" /> {selectedGame.year}
                  </span>
                </div>
                <div className="bg-zinc-950/60 border border-white/5 rounded-xl p-2.5">
                  <span className="text-[7.5px] text-zinc-600 block uppercase tracking-wider mb-0.5">RetroArch Core</span>
                  <span className="text-[10px] font-semibold text-emerald-400 block truncate uppercase">
                    <Cpu className="w-3 h-3 text-zinc-500" /> {system.emulatorCore}
                  </span>
                </div>
              </div>

              <div className="w-full flex items-center justify-center mt-1">
                <button
                  onClick={() => handleLaunchGame(selectedGame)}
                  className="w-full py-4.5 bg-gradient-to-r hover:brightness-110 text-white font-retro text-[10px] rounded-full border-t border-white/10 transition-all duration-300 font-black tracking-widest flex items-center justify-center gap-3 cursor-pointer shadow-[0_8px_25px_rgba(0,0,0,0.4)] active:scale-[0.99]"
                  style={{ backgroundColor: themeColor }}
                >
                  <Play className="w-3.5 h-3.5 fill-white text-white animate-bounce" />
                  <span>INICIAR JOGO</span>
                </button>
              </div>

            </div>
          ) : null}
        </div>

      </main>

      <AnimatePresence>
        {emulatingGame && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            style={{ zIndex: 99999 }}
            className="fixed inset-0 bg-black flex flex-col justify-between"
          >
            <div style={{ position: 'fixed', top: '24px', left: '24px', zIndex: 100000 }} className="pointer-events-auto">
              <button
                onClick={handleCloseEmulator}
                className="flex items-center gap-2 text-[10px] font-retro tracking-widest text-white bg-[#E60012] hover:bg-red-500 border border-red-600 rounded-full px-5 py-3 transition-all cursor-pointer font-black shadow-[0_6px_20px_rgba(230,0,18,0.5)] active:scale-95"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>FECHAR EMULADOR / VOLTAR</span>
              </button>
            </div>

            <EmulatorPlayer
              system={system}
              game={emulatingGame}
              onClose={handleCloseEmulator}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
