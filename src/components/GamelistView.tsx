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
  Gamepad2, 
  Play, 
  Calendar, 
  Layers,
  Cpu,
  Star,
  Volume2,
  VolumeX
} from 'lucide-react';

interface GamelistViewProps {
  system: System;
  onBack: () => void;
  isMuted: boolean;
  toggleMute: () => void;
}

// Biblioteca de Sinopses e Curiosidades Históricas dos Grandes Clássicos
export const gameDescriptions: Record<string, string> = {
  "super mario bros.": "O clássico de plataforma lendário pioneiro que salvou a indústria dos videogames em 1985, estabeleceu as mecânicas de rolagem lateral e definiu o encanador mais famoso do planeta.",
  "super mario bros. 2": "A viciante e inovadora aventura que permitia ao jogador escolher entre Mario, Luigi, Toad ou Princesa Peach, cada um com habilidades exclusivas de salto e velocidade em cenários verticais dinâmicos.",
  "super mario bros. 3": "Aclamado como uma das maiores obras-primas da era 8-bits. Introduziu o emblemático mapa-múndi de seleção de fases, inventários de itens e transformações icônicas como a Super Leaf (Mário Guaxinim) e a Tanooki Suit.",
  "the legend of zelda": "A obra-prima pioneira de Shigeru Miyamoto que apresentou o reino de Hyrule de forma não-linear. Definiu todo o gênero de Aventura e RPG com seu sistema inovador de exploração livre e salvamento de progresso.",
  "metroid": "O nascimento do gênero Metroidvania. Apresentou um ambiente alienígena sombrio, isolado e labiríntico na fortaleza de Zebes, culminando na revelação histórica de que a caçadora de recompensas Samus Aran era uma mulher.",
  "castlevania": "A influente jornada gótica de Simon Belmont empunhando o chicote lendário Vampire Killer na fortaleza do Conde Drácula. Trilha sonora inesquecível e atmosfera medieval de terror magnífica.",
  "mega man": "O icônico robô azul da Capcom estreia revolucionando a ação em plataformas com seu sistema de escolha livre de fases e a mecânica inovadora de absorver os poderes dos chefes derrotados (Robot Masters).",
  "mega man 2": "A aclamada sequência do robô azul, trazendo uma trilha sonora memorável e chefes clássicos extraordinários. É considerado por muitos fãs o melhor título da série clássica de 8-bits.",
  "contra": "Ação cooperativa run-and-gun de ritmo frenético com hordas de inimigos alienígenas e uma trilha marcante. Entrou para a cultura pop com o lendário Código Konami para habilitar 30 vidas adicionais.",
  "ninja gaiden": "A lendária estreia de Ryu Hayabusa no NES, famosa por seu ritmo super veloz, dificuldade extremamente elevada e as inovadoras e belas sequências cinematográficas que contavam uma história profunda.",
  "double dragon": "O clássico beat 'em up revolucionário que definiu as brigas de rua nos videogames. Controle os irmãos Billy e Jimmy Lee em sua cruzada épica para resgatar Marian de uma gangue violenta.",
  "kirbys adventure": "A fantástica estreia em cores do simpático Kirby sugando e absorvendo os poderes dos seus inimigos. Um verdadeiro milagre de programação que extraiu o máximo de poder gráfico e técnico do NES.",
  "punch out": "Guie o determinado jovem Little Mac rumo ao cinturão de ouro dos pesos pesados enfrentando boxeadores caricatos, bizarros e emblemáticos da história dos esportes com auxílio do seu técnico Doc Louis.",
  "duck hunt": "O clássico jogo de tiro que utilizava a famosa pistola de luz NES Zapper. Requer precisão rápida para abater os patos selvagens e divertia gerações enquanto tentávamos impedir o riso sarcástico do audacioso cão retriever.",
  "sonic the hedgehog": "A resposta veloz e rebelde da Sega que redefiniu os jogos de plataforma nos anos 90. Com loops em alta velocidade, design de fases verticalizado e uma trilha sonora memorável, estabeleceu o ouriço como ícone mundial.",
  "donkey kong country": "Um marco tecnológico revolucionário que utilizou gráficos pré-renderizados em estações Advanced Computer Modeling (ACM). Transformou o Super Nintendo com física soberba, trilha sonora imersiva e jogabilidade impecável em dupla.",
  "chrono trigger": "Considerado por muitos o maior RPG de todos os tempos. Desenvolvido pelo 'Dream Team' (Hironobu Sakaguchi, Yuji Horii e Akira Toriyama), revolucionou o gênero com viagens no tempo, múltiplos finais e combate dinâmico sem transição de tela.",
  "super metroid": "A obra de arte mais emblemática da ficção espacial 16-bits. Atmosfera sufocante, progresso orgânico primoroso no planeta Zebes e uma narrativa silenciosa que dita o padrão do gênero de exploração."
};

// TRADUTOR DO EMULATIONSTATION ($system): Mapeia o ID do db.json para os seus arquivos reais locais
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

export const getRichDescription = (title: string, systemName: string, originalDesc?: string): string => {
  const cleanTitle = title.replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '').trim();
  const cleanKey = cleanTitle.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim().replace(/\s+/g, ' ');

  for (const [key, desc] of Object.entries(gameDescriptions)) {
    const cleanDictKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanTitleKey = cleanKey.replace(/[^a-z0-9]/g, '');
    if (cleanKey === key.toLowerCase() || cleanTitleKey === cleanDictKey) {
      return desc;
    }
  }

  const genericIndicators = ['clássico indispensável', 'classico indispensavel', 'versão pt-br excelente', 'versao pt-br excelente', 'não perca este clássico', 'nao perca este classico'];
  if (originalDesc) {
    const lowerDesc = originalDesc.toLowerCase();
    const isGeneric = genericIndicators.some(indicator => lowerDesc.includes(indicator));
    if (!isGeneric) return originalDesc;
  }

  return `Clássico incomparável de aventura e perfeição técnica do ${systemName}. Re-viva os melhores momentos da história dos videogames emulando a versão traduzida perfeitamente sintonizada no LordTecaRetro.`;
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
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 to-black border border-white/5 rounded-xl flex flex-col items-center justify-center p-4 text-center select-none shadow-inner">
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

  const [favoritesMap, setFavoritesMap] = useState<Record<string, boolean>>(() => {
    try {
      const cached = localStorage.getItem(`retro_favs_${system.id}`);
      return cached ? JSON.parse(cached) : {};
    } catch (e) {
      return {};
    }
  });

  const listContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const localizedGames = useMemo(() => {
    return system.games.map(game => ({
      ...game,
      favorite: favoritesMap[game.title] !== undefined ? favoritesMap[game.title] : game.favorite
    }));
  }, [system.games, favoritesMap]);

  const filteredGames = useMemo(() => {
    return localizedGames.filter(game => {
      const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            game.genre.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFavorite = filterFavorites ? game.favorite : true;
      return matchesSearch && matchesFavorite;
    });
  }, [localizedGames, searchTerm, filterFavorites]);

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

  const toggleFavorite = (game: Game, e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    soundEngine.playToggle();
    const nextVal = !game.favorite;
    const updated = { ...favoritesMap, [game.title]: nextVal };
    setFavoritesMap(updated);
    localStorage.setItem(`retro_favs_${system.id}`, JSON.stringify(updated));
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
  }, [toggleMute, favoritesMap]);

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
      className="fixed inset-0 w-full h-screen font-sans text-white overflow-hidden bg-[#040406] flex flex-col justify-between select-none"
    >
      
      {/* CAMADA 1: PLAYER DE VÍDEO (EMBAIXO DA MÁSCARA TRANSPARENTE DA TV) */}
      <div className="absolute top-[17.5%] left-[6.8%] w-[33.6vw] aspect-[4/3] bg-black z-10 overflow-hidden rounded-[10px]">
        {selectedGame && !videoError && (
          <video
            key={`crt-video-${selectedGame.title}`}
            src={getGameGameplayVideoUrl(system.id, selectedGame.title)}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            className={`w-full h-full object-cover filter contrast-[1.15] saturate-[1.10] brightness-[1.02] transition-opacity duration-300 ${videoLoaded ? 'opacity-90' : 'opacity-0'}`}
            onPlay={() => setVideoLoaded(true)}
            onLoadedData={() => setVideoLoaded(true)}
            onError={() => {
              setVideoError(true);
              setVideoLoaded(false);
            }}
          />
        )}
        
        {/* Fallback de segurança para renderização contida */}
        {(!videoLoaded || videoError) && selectedGame && (
          <div className="absolute inset-0 flex items-center justify-center p-4 bg-zinc-950">
            <GameCover game={selectedGame} systemId={system.id} className="max-h-full max-w-full object-contain rounded" />
          </div>
        )}

        <div 
          className="absolute inset-0 pointer-events-none opacity-15 mix-blend-overlay z-20"
          style={{ backgroundImage: 'linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.4) 50%)', backgroundSize: '100% 4px' }}
        />
      </div>

      {/* CAMADA 2: OVERLAY DE MÁSCARA DO CONSOLE COLETADO COM CANAL ALFA CORRIGIDO */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center z-20 pointer-events-none"
        style={{ backgroundImage: `url(/logos/backgrounds/${consoleId}.png)` }}
      />

      {/* PAINEL DE CONTROLE DE INTERFACE SUPERIOR */}
      <div className="absolute top-4 left-6 right-6 z-40 flex justify-between items-center pointer-events-auto">
        <button 
          onClick={handleBack}
          className="flex items-center gap-1.5 text-[10px] font-retro text-white/60 hover:text-white bg-black/40 border border-white/5 rounded-md px-3 py-1.5 backdrop-blur cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Menu Principal
        </button>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-black/50 border border-white/5 rounded-md px-3 py-1 backdrop-blur">
            <Search className="w-3 h-3 text-white/40 mr-1.5" />
            <input 
              ref={searchInputRef}
              type="text"
              placeholder="Buscar jogo..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setSelectedGameIndex(0); }}
              className="bg-transparent border-none text-[10px] text-white focus:outline-none w-32 placeholder-white/20 py-0"
            />
          </div>
          <button onClick={toggleMute} className="p-1.5 bg-black/40 border border-white/5 rounded-md text-white/60 hover:text-white backdrop-blur cursor-pointer">
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* CAMADA 3: ESPIRAL DE JOGOS NO ESPAÇO DIREITO DA TELA VAZADA */}
      <div className="absolute top-0 right-0 w-[45%] h-full z-30 flex items-center justify-end pr-[6vw]" style={{ perspective: 1000 }}>
        <div ref={listContainerRef} className="relative w-full h-[460px] flex items-center justify-end">
          {filteredGames.map((game, idx) => {
            const offset = idx - selectedGameIndex;
            const isSelected = idx === selectedGameIndex;

            if (Math.abs(offset) > 3) return null;

            const rotateX = offset * -15;
            const translateY = offset * 85;
            const translateX = Math.abs(offset) * 22;
            const scale = isSelected ? 1.25 : 0.85 - Math.abs(offset) * 0.05;

            return (
              <motion.div
                key={game.id}
                onClick={() => handleGameSelect(idx, game)}
                animate={{
                  y: translateY,
                  x: translateX,
                  scale: scale,
                  rotateX: rotateX,
                  opacity: isSelected ? 1 : 0.35 - Math.abs(offset) * 0.08,
                }}
                transition={{ type: 'spring', stiffness: 180, damping: 18 }}
                className="absolute right-0 w-80 h-14 flex items-center justify-end cursor-pointer select-none text-right font-retro group"
                style={{ transformOrigin: 'right center' }}
              >
                <span 
                  className={`text-sm sm:text-base md:text-lg uppercase transition-all truncate block max-w-full ${
                    isSelected 
                      ? 'text-white font-black drop-shadow-[0_0_12px_rgba(255,255,255,0.5)] tracking-wider' 
                      : 'text-zinc-600 font-bold group-hover:text-zinc-400'
                  }`}
                >
                  {game.title.replace(/\(PT\-BR\)/gi, '').replace(/\[.*?\]/g, '').trim()}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* RODAPÉ EMULATIONSTATION COMPATÍVEL */}
      <footer className="absolute bottom-0 inset-x-0 h-10 bg-black/40 border-t border-white/5 backdrop-blur z-40 flex items-center justify-between px-10 font-sans text-[10px] font-bold text-zinc-500 tracking-wider">
        <div>▲▼ NAVEGAR • ENTER CONFIRMAR</div>
        <div className="font-mono text-[9px]">{filteredGames.length} JOGOS NO CATÁLOGOTEC</div>
      </footer>

      {/* PLAYER EMULADOR */}
      <AnimatePresence>
        {emulatingGame && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ zIndex: 99999 }}
            className="fixed inset-0 bg-black flex flex-col justify-between"
          >
            <div style={{ position: 'fixed', top: '20px', left: '20px', zIndex: 100000 }}>
              <button
                onClick={handleCloseEmulator}
                className="flex items-center gap-1.5 text-[9px] font-retro text-white bg-[#E60012] border border-red-600 rounded-full px-4 py-2 cursor-pointer font-black shadow-lg"
              >
                ➔ FECHAR EMULADOR
              </button>
            </div>
            <EmulatorPlayer system={system} game={emulatingGame} onClose={handleCloseEmulator} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
