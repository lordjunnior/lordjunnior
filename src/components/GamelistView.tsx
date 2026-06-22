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
import { ArrowLeft, Search, Volume2, VolumeX } from 'lucide-react';
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

  return (
    <motion.div 
      id="gamelist-container" 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="fixed inset-0 w-full h-screen font-sans text-white overflow-hidden bg-[#040406] flex flex-col justify-between select-none"
    >
      
      {/* CAMADA 0: BACKGROUND FANART FLUIDO DO JOGO SELECIONADO (PREENCHEDOR DO ESPAÇO GIGANTE COM ALTA CREDIBILIDADE PREMIUM CORES) */}
      <div className="absolute inset-0 z-0 pointer-events-none transition-all duration-700">
        {selectedGame && selectedGame.image && (
          <>
            <img 
              src={selectedGame.image || ''} 
              alt="" 
              className="absolute inset-0 w-full h-full object-cover opacity-[0.14] filter blur-md scale-105" 
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#040406] via-[#040406]/90 to-transparent" />
          </>
        )}
      </div>
      
      {/* CAMADA 1: TELA CRT DA TV (EXIBINDO A ARTE DE CAPA DO JOGO COM SCANLINES E REFLEXO RETRO) */}
      <div className="absolute top-[17.5%] left-[6.8%] w-[33.6vw] aspect-[4/3] bg-black/90 z-10 overflow-hidden rounded-[10px] flex items-center justify-center p-6 relative">
        {selectedGame && (
          <>
            <div className="absolute inset-0 bg-zinc-950/80" />
            <div className="relative w-full h-full flex items-center justify-center z-15">
              <GameCover 
                game={selectedGame} 
                systemId={system.id} 
                className="max-h-full max-w-full object-contain rounded shadow-[0_0_20px_rgba(255,255,255,0.1)] transform scale-[0.88]" 
              />
            </div>
          </>
        )}
        
        {/* Camada Scanlines daltônicas de CRT antigas */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay z-20"
          style={{ backgroundImage: 'linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.5) 50%)', backgroundSize: '100% 4px' }}
        />
        {/* Reflexo radial de tubo de imagem (CRT glass glare) */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.08)_0%,transparent_60%)] z-20" />
      </div>

      {/* CAMADA 2: A SUA MÁSCARA PNG TRANSPARENTE DA PASTA BACKGROUNDS */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center z-20 pointer-events-none"
        style={{ backgroundImage: `url(/logos/backgrounds/${consoleId}.png)` }}
      />

      {/* PAINEL DE CONTROLE DA INTERFACE SUPERIOR */}
      <div className="absolute top-4 left-6 right-6 z-40 flex justify-between items-center pointer-events-auto">
        <div className="flex items-center gap-3">
          <button 
            onClick={handleBack}
            className="flex items-center gap-1.5 text-[10px] font-retro text-white/60 hover:text-white bg-black/40 border border-white/5 rounded-md px-3 py-1.5 backdrop-blur cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Voltar
          </button>
          <img src={`/logos/${consoleId}.png`} alt="" className="h-6 w-auto object-contain ml-2 filter drop-shadow" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-black/50 border border-white/5 rounded-md px-3 py-1 backdrop-blur">
            <Search className="w-3 h-3 text-white/40 mr-1.5" />
            <input ref={searchInputRef} type="text" placeholder="Buscar jogo..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setSelectedGameIndex(0); }} className="bg-transparent border-none text-[10px] text-white focus:outline-none w-32 placeholder-white/20 py-0" />
          </div>
        </div>
      </div>

      {/* PAINEL DE METADADOS ULTRA PREMIUM DO JOGO (PREENCHE DIRETAMENTE O ESPAÇO GIGANTE ACIMA DO CARROSSEL) */}
      <div className="absolute top-[17.5%] right-[6.8%] w-[48vw] h-[25.2vw] z-30 flex flex-col justify-between pointer-events-auto bg-black/50 border border-white/10 backdrop-blur-md rounded-[10px] p-5 md:p-6 shadow-2xl">
        <AnimatePresence mode="wait">
          {selectedGame && (
            <motion.div 
              key={`meta-panel-${selectedGame.id}`} 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -20 }} 
              transition={{ duration: 0.3 }}
              className="w-full h-full flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-2.5 text-[10px] font-mono tracking-wider">
                  <span className="uppercase font-black px-2.5 py-1 rounded bg-white/10 text-white border border-white/10">
                    {selectedGame.genre || "RETRO CLASSIC"}
                  </span>
                  <span className="text-zinc-500">•</span>
                  <span className="text-zinc-400 font-bold uppercase">{selectedGame.developer || "Retro Studio"}</span>
                </div>
                
                <h2 className="text-xl md:text-2xl lg:text-3xl font-black tracking-tight text-white uppercase mb-2 md:mb-3 drop-shadow-md leading-tight">
                  {selectedGame.title}
                </h2>
                
                <p className="text-xs md:text-sm text-zinc-300 font-sans font-normal leading-relaxed overflow-y-auto max-h-[10.5vh] pr-2 scrollbar-thin scrollbar-thumb-white/10">
                  {getRichDescription(selectedGame.title, system.name)}
                </p>
              </div>

              <div className="grid grid-cols-12 gap-3 border-t border-white/10 pt-4 mt-2">
                <div className="col-span-4 bg-white/5 border border-white/5 rounded-lg p-2.5 flex flex-col justify-center">
                  <span className="text-[8px] text-zinc-500 uppercase tracking-widest font-mono font-black">LANÇAMENTO</span>
                  <span className="font-bold text-white text-[11px] md:text-xs font-mono mt-0.5">{selectedGame.year || "Classic"}</span>
                </div>
                <div className="col-span-4 bg-white/5 border border-white/5 rounded-lg p-2.5 flex flex-col justify-center">
                  <span className="text-[8px] text-zinc-500 uppercase tracking-widest font-mono font-black">EMULADOR CORE</span>
                  <span className="font-bold text-white text-[11px] md:text-xs font-mono mt-0.5 uppercase truncate">{system.emulatorCore || "RetroArch"}</span>
                </div>
                <button 
                  onClick={() => selectedGame && handleLaunchGame(selectedGame)} 
                  className="col-span-4 bg-emerald-500 hover:bg-emerald-400 text-black font-retro text-[9px] font-black uppercase tracking-widest rounded-lg flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95 text-center px-1 py-1 shadow-black/80"
                >
                  ➔ JOGAR NOW
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CAMADA 3: CARROSSEL DE CARTUCHOS PLANO (CENTRALIZADO EMBAIXO) */}
      <div className="absolute bottom-[20%] left-0 right-0 h-[280px] z-30 flex flex-col justify-end pointer-events-none">
        <div ref={listContainerRef} className="flex items-center overflow-x-auto gap-8 py-4 no-scrollbar scroll-smooth snap-x w-full pointer-events-auto" style={{ paddingLeft: 'calc(50vw - 72px)', paddingRight: 'calc(50vw - 72px)' }}>
          {filteredGames.map((game, idx) => {
            const offset = idx - selectedGameIndex;
            const isSelected = idx === selectedGameIndex;
            const distance = Math.abs(offset);
            const isFar = distance > 4;

            return (
              <motion.button
                key={game.id}
                onClick={() => handleGameClick(idx, game)}
                animate={{
                  scale: isSelected ? 1.10 : 0.82 - Math.min(distance * 0.05, 0.15),
                  opacity: isSelected ? 1 : isFar ? 0 : 0.40 - Math.min(distance * 0.08, 0.3),
                  x: isSelected ? 0 : (idx < selectedGameIndex ? 16 : -16) * Math.min(distance, 2.5),
                }}
                transition={{ type: 'spring', stiffness: 220, damping: 20 }}
                className={`shrink-0 relative focus:outline-none cursor-pointer flex flex-col items-center select-none ${isFar ? 'pointer-events-none' : 'pointer-events-auto'}`}
                style={{ width: '144px', visibility: isFar ? 'hidden' : 'visible' }}
              >
                <div className="relative w-36 h-48 rounded-xl overflow-hidden border transition-all duration-300 shadow-2xl" style={isSelected ? { borderColor: 'white', boxShadow: `0px 10px 30px rgba(255,255,255,0.22)` } : { borderColor: 'rgba(255,255,255,0.05)' }}>
                  <GameCover game={game} systemId={system.id} className="w-full h-full object-cover" />
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* RODAPÉ */}
      <footer className="absolute bottom-0 inset-x-0 h-8 bg-black/40 border-t border-white/5 backdrop-blur z-40 flex items-center justify-between px-10 font-sans text-[9px] font-bold text-zinc-650 tracking-wider">
        <div>◀▶ SELECIONAR CARTUCHO • ENTER CONFIRMAR</div>
        <div className="font-mono">{filteredGames.length} ROMS DETECTADAS</div>
      </footer>

      {/* INTERFACE DE EMULAÇÃO */}
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
                ➔ VOLTAR
              </button>
            </div>
            <EmulatorPlayer system={system} game={emulatingGame} onClose={handleCloseEmulator} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};