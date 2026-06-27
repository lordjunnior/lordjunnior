import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { System, Game } from '../types';
import { soundEngine } from './RetroSoundEngine';
import { EmulatorPlayer } from './EmulatorPlayer';
import { getGameGameplayVideoUrl, getSystemGameplayVideoUrl } from '../utils/videoResolver';
import { 
  ArrowLeft, Search, Check, Cpu, Layers, Clock, Sparkles, Tv, Gamepad, 
  Volume2, VolumeX, Heart, Star, Maximize2, RotateCcw, Monitor, Trophy, 
  Award, MessageSquare, Info, BookOpen, Film, Eye, Play, Share2
} from 'lucide-react';
import { GameCover } from './GameCover';
import { getLogoFileName } from '../utils/logoResolver';
import { getSystemThemeColor } from './SystemCarousel';

export const getRichDescription = (title: string, systemName: string): string => {
  const cleanTitle = title.trim();
  const cleanSystem = systemName.toLowerCase();
  
  if (cleanTitle.toLowerCase().includes('mario bros')) {
    return `O clássico revolucionário de plataforma que definiu os videogames. Controle os irmãos Mario em uma jornada mítica repleta de canos, cogumelos e castelos para salvar a Princesa Peach.`;
  }
  if (cleanTitle.toLowerCase().includes('zelda')) {
    return `Explore um reino vasto repleto de segredos, labirintos intrigantes e lendas antigas. Ajude o jovem herói Link a restaurar a Triforce e derrotar as forças das trevas de Ganon.`;
  }
  if (cleanTitle.toLowerCase().includes('sonic')) {
    return `O ouriço mais rápido do mundo corre contra o tempo para frustrar os planos malignos de Dr. Robotnik de transformar animais inocentes em robôs cruéis. Velocidade máxima e diversão de pura adrenalina!`;
  }
  if (cleanTitle.toLowerCase().includes('donkey kong')) {
    return `Navegue pelas copas das árvores em fases de plataforma de tirar o fôlego com belos cenários pré-renderizados e uma jogabilidade incrivelmente fluida ao lado de Diddy Kong.`;
  }
  if (cleanTitle.toLowerCase().includes('metroid')) {
    return `Explore as profundezas isoladas e misteriosas de planetas alienígenas hostis como Samus Aran. Melhore seu traje, encontre mísseis e descubra o clássico que fundou o gênero Metroidvania.`;
  }
  if (cleanTitle.toLowerCase().includes('pokemon') || cleanTitle.toLowerCase().includes('pokémon')) {
    return `Torne-se um mestre pokémon neste lendário RPG de turnos! Capture, treine e enfrente os líderes de ginásio mais difíceis enquanto explora cidades vibrantes e florestas misteriosas.`;
  }
  if (cleanTitle.toLowerCase().includes('gta') || cleanTitle.toLowerCase().includes('grand theft auto')) {
    return `Redescubra este clássico absoluto do mundo aberto retro. Re-imaginamento, liberdade incomparável de exploração e jogabilidade icônica original misturado com velocidade máxima de carregamento.`;
  }
  if (cleanTitle.toLowerCase().includes('street fighter') || cleanTitle.toLowerCase().includes('mortal kombat')) {
    return `A glória dourada dos arcades de luta agora na sua tela! Execute combos devastadores, golpes especiais icônicos e derrote lutadores do mundo inteiro para provar sua supremacia.`;
  }
  if (cleanTitle.toLowerCase().includes('resident evil') || cleanTitle.toLowerCase().includes('silent hill')) {
    return `Sobreviva ao horror em ambientes claustrofóbicos e misteriosos repletos de quebra-cabeças complexos, recursos limitados e criaturas aterrorizantes à espreita na escuridão.`;
  }
  
  return `Redescubra este clássico absoluto do console ${systemName}. Sinta a jogabilidade original inalterada e reviva momentos inesquecíveis da era de ouro dos videogames de forma 100% autêntica.`;
};

export interface GamelistViewProps {
  system: System;
  onBack: () => void;
  isMuted: boolean;
  toggleMute: () => void;
  onSwitchSystemId?: (systemId: string) => void;
}

// 1. Helper to parse Recalbox folder name for custom assets
const getRecalboxFolderName = (id: string): string => {
  const norm = id.toLowerCase().trim();
  if (norm === 'megadrive' || norm === 'genesis') return 'megadrive';
  if (norm === 'snes' || norm === 'supernintendo') return 'snes';
  if (norm === 'nes') return 'nes';
  if (norm === 'gba') return 'gba';
  if (norm === 'gbc') return 'gbc';
  if (norm === 'gb') return 'gb';
  if (norm === 'sms' || norm === 'mastersystem') return 'mastersystem';
  if (norm === 'n64' || norm === 'nintendo64') return 'n64';
  if (norm === 'atari' || norm === 'atari2600') return 'atari2600';
  if (norm === 'arcade' || norm === 'mame') return 'mame';
  if (norm === 'ps1' || norm === 'psx' || norm === 'playstation') return 'psx';
  if (norm === 'ps2' || norm === 'playstation2') return 'ps2';
  if (norm === 'ps3' || norm === 'playstation3') return 'ps3';
  if (norm === 'xbox' || norm === 'xboxclassic') return 'xbox';
  if (norm === 'xbox360') return 'xbox360';
  if (norm === 'nds' || norm === 'ds') return 'nds';
  if (norm === 'dreamcast') return 'dreamcast';
  if (norm === 'gamecube' || norm === 'gc') return 'gamecube';
  if (norm === 'pce' || norm === 'pcengine' || norm === 'turbografx') return 'pcengine';
  if (norm === '3do') return '3do';
  if (norm === 'saturn') return 'saturn';
  if (norm === 'neogeo') return 'neogeo';
  if (norm === 'neogeopocket' || norm === 'ngp') return 'ngp';
  if (norm === 'fba_libretro' || norm === 'fba') return 'fba';
  return 'favorites';
};

// 2. Play Retro Boot Sound based on System
const playBiosBootSound = (systemId: string, isMuted: boolean) => {
  if (isMuted) return;
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const id = systemId.toLowerCase();
    
    if (id.includes('ps') || id.includes('playstation')) {
      // Deep, cinematic synth sweep (PS2 Vibe)
      const osc = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();
      
      osc.type = 'sawtooth';
      osc2.type = 'triangle';
      
      osc.frequency.setValueAtTime(55, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, audioCtx.currentTime + 1.2);
      
      osc2.frequency.setValueAtTime(55.2, audioCtx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(165, audioCtx.currentTime + 1.5);
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(200, audioCtx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.8);
      
      gainNode.gain.setValueAtTime(0.01, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.25, audioCtx.currentTime + 0.4);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 2.5);
      
      osc.connect(filter);
      osc2.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc.start();
      osc2.start();
      osc.stop(audioCtx.currentTime + 2.6);
      osc2.stop(audioCtx.currentTime + 2.6);
    } else {
      // Classic 8-bit rising arpeggio (Nintendo/SEGA chime)
      const now = audioCtx.currentTime;
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        
        gainNode.gain.setValueAtTime(0.08, now + idx * 0.08);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);
        
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.4);
      });
    }
  } catch (err) {
    console.warn('[RetroHub] Bios sound failed:', err);
  }
};

// 3. Play sound on game cartridge select slotting
const playCartridgeSlotSound = (isMuted: boolean) => {
  if (isMuted) return;
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Low mechanical slot-in pop
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(150, ctx.currentTime);
    clickOsc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.08);
    
    clickGain.gain.setValueAtTime(0.12, ctx.currentTime + 0.02);
    clickGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    
    clickOsc.connect(clickGain);
    clickGain.connect(ctx.destination);
    
    clickOsc.start();
    clickOsc.stop(ctx.currentTime + 0.08);
  } catch (err) {
    console.warn('[RetroHub] Mechanical cartridge sound error:', err);
  }
};

export const GamelistView: React.FC<GamelistViewProps> = ({
  system,
  onBack,
  isMuted,
  toggleMute,
  onSwitchSystemId,
}) => {
  const [selectedGameIndex, setSelectedGameIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [emulatingGame, setEmulatingGame] = useState<Game | null>(null);
  const [labGame, setLabGame] = useState<Game | null>(null);
  
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [bgError, setBgError] = useState(false);

  // Reset background error status when changing system
  useEffect(() => {
    setBgError(false);
  }, [system.id]);

  // Immersion & Tuning states
  const [isBooting, setIsBooting] = useState(true);
  const [bootProgress, setBootProgress] = useState(0);
  const [bootLogs, setBootLogs] = useState<string[]>([]);
  const [crtFilter, setCrtFilter] = useState<'normal' | 'phosphor' | 'amber' | 'cyberpunk'>('normal');
  const [scanlineDensity, setScanlineDensity] = useState<'subtle' | 'heavy' | 'grid' | 'none'>('subtle');
  const [aspectRatio, setAspectRatio] = useState<'4:3' | '16:9'>('4:3');
  const [screenContrast, setScreenContrast] = useState(115);
  const [screenStaticPulse, setScreenStaticPulse] = useState(false);
  const [zoomedScreenshot, setZoomedScreenshot] = useState<string | null>(null);

  // Dynamic user interface interactions
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState<'overview' | 'trivia' | 'history'>('overview');
  const [timeString, setTimeString] = useState('12:00:00');

  // Animation ticks for floating diorama elements
  const [floatTick, setFloatTick] = useState(0);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);

  const isSystemSupported = (systemId: string): boolean => {
    const cleanId = systemId.toLowerCase().trim();
    return !['ps2', 'playstation2', 'ps3', 'playstation3', 'xbox', 'xboxclassic', 'xbox360'].includes(cleanId);
  };

  const filteredGames = useMemo(() => {
    return system.games.filter(game => {
      const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            game.genre.toLowerCase().includes(searchTerm.toLowerCase());
      // Read actual dynamic favorites state from localStorage
      const localFavs = JSON.parse(localStorage.getItem('retro_favorites') || '{}');
      const isFav = localFavs[`${system.id}_${game.title}`] !== undefined ? localFavs[`${system.id}_${game.title}`] : game.favorite;
      const matchesFavorite = filterFavorites ? isFav : true;
      return matchesSearch && matchesFavorite;
    });
  }, [system.games, searchTerm, filterFavorites, system.id]);

  const selectedGame = filteredGames[selectedGameIndex] || null;
  const consoleId = getLogoFileName(system.id);

  const filteredGamesRef = useRef(filteredGames);
  const selectedGameIndexRef = useRef(selectedGameIndex);
  const emulatingGameRef = useRef(emulatingGame);
  const labGameRef = useRef(labGame);

  useEffect(() => { filteredGamesRef.current = filteredGames; }, [filteredGames]);
  useEffect(() => { selectedGameIndexRef.current = selectedGameIndex; }, [selectedGameIndex]);
  useEffect(() => { emulatingGameRef.current = emulatingGame; }, [emulatingGame]);
  useEffect(() => { labGameRef.current = labGame; }, [labGame]);

  useEffect(() => {
    setVideoLoaded(false);
    setVideoError(false);
    // Reset secondary tab when switching games to maintain smooth navigation
    setActiveTab('overview');
  }, [selectedGame]);

  // Track Mouse Movement for 3D Parallax and Diorama
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2; // Range -1 to 1
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2; // Range -1 to 1
    setMousePos({ x, y });
  };

  // Continuous animation loop for dynamic flutuations
  useEffect(() => {
    let animFrame: number;
    const updateFloat = () => {
      setFloatTick(prev => (prev + 0.05) % (Math.PI * 2));
      animFrame = requestAnimationFrame(updateFloat);
    };
    animFrame = requestAnimationFrame(updateFloat);
    return () => cancelAnimationFrame(animFrame);
  }, []);

  // Sync Realtime Clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const pad = (val: number) => String(val).padStart(2, '0');
      setTimeString(`${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`);
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // Console specific BIOS Diagnostic Logs Definition
  const biosLogsTemplate = useMemo(() => {
    const id = system.id.toLowerCase();
    if (id.includes('ps') || id.includes('playstation')) {
      return [
        "INICIANDO RETRO OS BIOS SYSTEM...",
        "PROCESSADOR MIPS R5900 (EE) OK - CLOCK: 294.9 MHz",
        "ALOCANDO 32MB SYSTEM BUS RAM... CONCLUÍDO",
        "DETECÇÃO AUTOMÁTICA DE PERIFÉRICOS:",
        " -> CONTROLE 1: ANALOG CHOCK CONTROLLER (MAPPED)",
        " -> MEMORY CARD SLOT A: 8MB EXPANSION (8192KB OK)",
        "CARREGANDO DRIVER DE CONTROLADOR ÓPTICO v4.12...",
        "ACESSANDO DRIVE DE DISCO INTEGRADO...",
        "DISCO DETECTADO: SISTEMA ORIGINAL COMPATÍVEL OK",
        "DESCOMPRIMINDO KERNEL DO RETRO OS NA MEMÓRIA...",
        "SINCRONIZANDO EMULADOR DIRECT JIT JUMP CORE (PCSX2 Wasm)...",
        "SISTEMA PRONTO. EXECUTANDO BOOT INTEGRADO!"
      ];
    } else if (id.includes('sega') || id.includes('genesis') || id.includes('sms') || id.includes('saturn')) {
      return [
        "SEGA SYSTEM HARNESS DETECTED.",
        "MOTOROLA 68000 CPU ONLINE - 7.67 MHz",
        "AUDIO CO-PROCESSOR Z80 ACTIVE",
        "ALLOCATING 64KB MAIN RAM + 64KB AUDIO VRAM",
        "PRODUCED BY OR UNDER LICENSE FROM SEGA ENTERPRISES LTD.",
        "MAPPING RESOLUTION STANDARD CHIP: VDP ACTIVE",
        "DETECTING 6-BUTTON JOYSTICK... CONNECTED PORT A",
        "READING SECURITY CARTRIDGE SIGNATURE... OK",
        "COMPILING REALTIME FM SYNTH CHIP YM2612...",
        "RETRO SYSTEM BOOT SUCCESSFUL."
      ];
    } else if (id.includes('xbox')) {
      return [
        "MICROSOFT RETROX SYSTEM BOOTLOADER v1.02",
        "CPU INTEL PENTIUM III COMPATIBLE DETECTED",
        "VIRTUAL DIRECTX 8 LAYOUT MAP INITIALIZED",
        "ALLOCATING 64MB UNIFIED RETRO SHIELD MEMORY...",
        "READING INTEGRATED FAST DIRECTORY DEV-0... OK",
        "SEARCHING VIRTUAL XBOX LIVE PROTOCOLS... ACTIVE",
        "MAPPING DECK KEYS TO KEYBOARD / CONTROLLER",
        "DECOMPRESSING RETROX GPU SHADERS... STABLE",
        "JIT RUNTIME TRANSLATOR LOADED OK",
        "STARTING ARCADE CONSOLE INTERFACE!"
      ];
    } else {
      return [
        "NINTENDO SYSTEM PROTOCOL STARTS...",
        "CPU MOS TECHNOLOGY 6502 INITIALIZED - 1.79 MHz",
        "STATIC APU & CHIP NOISE MAPPING: ACTIVE",
        "LOCK-ON SECURITY CHIP (CIC) DETECTED - STABLE",
        "READING ADAPTIVE CART MAPPER (MMC3 CHIP)...",
        "CHECKING RECHARGEABLE SAVE BATTERY CR2032...",
        "BATTERY DETECTED: SAVE-STATE MOUNTED SECURELY",
        "APPLYING NTSC/PAL SHADER GRID PIXELATION...",
        "RETRO EMULATOR ROM CACHE INTEGRATED SUCCESSFULLY",
        "SYSTEM STABLE - BOOT CHIME CONCLUDED."
      ];
    }
  }, [system.id]);

  // Run Retro BIOS Boot Sequence
  useEffect(() => {
    setIsBooting(true);
    setBootProgress(0);
    setBootLogs([]);
    
    // Play Boot Sound
    playBiosBootSound(system.id, isMuted);

    let progress = 0;
    let logIndex = 0;
    
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 8) + 8;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          setIsBooting(false);
          setScreenStaticPulse(true);
          setTimeout(() => setScreenStaticPulse(false), 200);
        }, 300);
      }
      setBootProgress(progress);

      const targetLogsCount = Math.floor((progress / 100) * biosLogsTemplate.length);
      if (logIndex < targetLogsCount && logIndex < biosLogsTemplate.length) {
        setBootLogs(prev => [...prev, biosLogsTemplate[logIndex]]);
        logIndex++;
      }
    }, 120);

    return () => clearInterval(interval);
  }, [system.id, biosLogsTemplate]);

  const handleBack = () => {
    soundEngine.playBack();
    onBack();
  };

  const handleGameClick = (index: number, game: Game) => {
    if (index === selectedGameIndexRef.current) {
      soundEngine.playSelect();
      if (isSystemSupported(system.id)) {
        setEmulatingGame(game);
      } else {
        setLabGame(game);
      }
    } else if (index >= 0 && index < filteredGamesRef.current.length) {
      setSelectedGameIndex(index);
      playCartridgeSlotSound(isMuted);
      
      setScreenStaticPulse(true);
      setTimeout(() => setScreenStaticPulse(false), 150);

      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }
  };

  const handleLaunchGame = (game: Game) => {
    soundEngine.playSelect();
    if (isSystemSupported(system.id)) {
      setEmulatingGame(game);
    } else {
      setLabGame(game);
    }
  };

  const handleCloseEmulator = () => {
    soundEngine.playBack();
    setEmulatingGame(null);
  };

  const handleCloseLab = () => {
    soundEngine.playBack();
    setLabGame(null);
  };

  // Keyboard Navigation Support
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent): void => {
      if (isBooting || emulatingGame || labGame) return;
      if (document.activeElement === searchInputRef.current) {
        if (e.key === 'Enter') searchInputRef.current?.blur();
        return;
      }
      if (filteredGamesRef.current.length === 0) return;

      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        soundEngine.playMove();
        const nextIndex = (selectedGameIndexRef.current + 1) % filteredGamesRef.current.length;
        setSelectedGameIndex(nextIndex);
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        soundEngine.playMove();
        const prevIndex = (selectedGameIndexRef.current - 1 + filteredGamesRef.current.length) % filteredGamesRef.current.length;
        setSelectedGameIndex(prevIndex);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const currentGame = filteredGamesRef.current[selectedGameIndexRef.current];
        if (currentGame) {
          handleLaunchGame(currentGame);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isBooting, emulatingGame, labGame]);

  // Center selected game inside scrollbox
  useEffect(() => {
    if (listContainerRef.current) {
      const activeEl = listContainerRef.current.children[selectedGameIndex] as HTMLElement;
      if (activeEl) {
        listContainerRef.current.scrollTo({
          top: activeEl.offsetTop - listContainerRef.current.clientHeight / 2 + activeEl.clientHeight / 2,
          behavior: 'smooth'
        });
      }
    }
  }, [selectedGameIndex]);

  // Local Favorites Handling
  const [favoriteMapping, setFavoriteMapping] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem('retro_favorites') || '{}');
    } catch {
      return {};
    }
  });

  const isCurrentGameFavorite = useMemo(() => {
    if (!selectedGame) return false;
    const key = `${system.id}_${selectedGame.title}`;
    return favoriteMapping[key] !== undefined ? favoriteMapping[key] : selectedGame.favorite;
  }, [selectedGame, favoriteMapping, system.id]);

  const handleToggleFavorite = (game: Game) => {
    soundEngine.playSelect();
    const key = `${system.id}_${game.title}`;
    const updated = {
      ...favoriteMapping,
      [key]: !isCurrentGameFavorite
    };
    setFavoriteMapping(updated);
    localStorage.setItem('retro_favorites', JSON.stringify(updated));
  };

  // Determine physical console base label for diorama pedestal
  const getConsoleShortName = (systemId: string): string => {
    const norm = systemId.toLowerCase();
    if (norm.includes('ps2') || norm.includes('playstation2')) return 'PS2';
    if (norm.includes('ps3') || norm.includes('playstation3')) return 'PS3';
    if (norm.includes('ps1') || norm.includes('psx') || norm.includes('playstation')) return 'PS1';
    if (norm.includes('snes') || norm.includes('supernintendo')) return 'SNES';
    if (norm.includes('nes') || norm.includes('nintendo')) return 'NES';
    if (norm.includes('genesis') || norm.includes('megadrive')) return 'MEGA';
    if (norm.includes('sms') || norm.includes('mastersystem')) return 'SMS';
    if (norm.includes('n64') || norm.includes('nintendo64')) return 'N64';
    if (norm.includes('dreamcast')) return 'DC';
    if (norm.includes('gamecube') || norm.includes('gc')) return 'GC';
    if (norm.includes('gba') || norm.includes('gameboyadvance')) return 'GBA';
    if (norm.includes('gbc') || norm.includes('gameboycolor')) return 'GBC';
    if (norm.includes('gb') || norm.includes('gameboy')) return 'GB';
    if (norm.includes('nds') || norm.includes('ds')) return 'NDS';
    if (norm.includes('atari')) return '2600';
    if (norm.includes('arcade') || norm.includes('mame')) return 'MAME';
    if (norm.includes('3do')) return '3DO';
    if (norm.includes('saturn') || norm.includes('segasaturn')) return 'SAT';
    if (norm.includes('pce') || norm.includes('pcengine')) return 'PCE';
    return 'RETRO';
  };

  // Get high fidelity console picture/logo URL
  const getCentralConsoleLogoUrl = (id: string): string => {
    const cleanId = id.toLowerCase().trim();
    const map: Record<string, string> = {
      nes: '/logos/consolenes.png',
      snes: '/logos/consolesnes.png',
      supernintendo: '/logos/consolesnes.png',
      n64: '/logos/consolen64.png',
      gb: '/logos/consolegameboy.png',
      gameboy: '/logos/consolegameboy.png',
      gbc: '/logos/consolegbc.png',
      gameboycolor: '/logos/consolegbc.png',
      gba: '/logos/consolegba.png',
      nds: '/logos/consoleds.png',
      genesis: '/logos/consolemega.png',
      segaMD: '/logos/consolemega.png',
      megadrive: '/logos/consolemega.png',
      mastersystem: '/logos/consolemaster.png',
      sms: '/logos/consolemaster.png',
      playstation: '/logos/consoleplaystation.png',
      psx: '/logos/consoleplaystation.png',
      ps1: '/logos/consoleplaystation.png',
      playstation2: '/logos/consoleplaystation2.png',
      ps2: '/logos/consoleplaystation2.png',
      playstation3: '/logos/consolePS3.png',
      ps3: '/logos/consolePS3.png',
      xbox: '/logos/consolexbox.png',
      xboxclassic: '/logos/consolexbox.png',
      xbox360: '/logos/consolexbox360.png',
      atari: '/logos/consoleatari.png',
      arcade: '/logos/consolearcade.png',
      '3do': '/logos/console3do.png',
      saturn: '/logos/consolesaturn.png',
      dreamcast: '/logos/consoledreamcast.png',
      gamecube: '/logos/consolegc.png',
      gc: '/logos/consolegc.png',
      neogeo: '/logos/neogeomvs.png',
      pce: '/logos/consoleturbografx16.png',
      turbografx: '/logos/consoleturbografx16.png',
    };
    return map[cleanId] || `/logos/${getLogoFileName(cleanId)}.png`;
  };

  // Get Dynamic Deterministic Retros Dossier metrics
  const gameDossier = useMemo(() => {
    if (!selectedGame) return { comunidade: '5.0', votos: '1.000', ign: '9.0', playstation: '9.0', idioma: 'PT-BR / EN', legendas: 'PT-BR / EN', tamanho: '5.0 MB' };
    
    let hash = 0;
    for (let i = 0; i < selectedGame.title.length; i++) {
      hash = selectedGame.title.charCodeAt(i) + ((hash << 5) - hash);
    }
    hash = Math.abs(hash);

    const votesCount = (hash % 16000 + 3500).toLocaleString('pt-BR');
    const baseScore = 8.6 + (hash % 14) / 10; // 8.6 - 9.9
    const ignScore = baseScore.toFixed(1);
    const consoleScore = (baseScore - 0.2 + (hash % 5) / 10).toFixed(1);

    // Calculate simulated memory size based on system generation
    let sizeText = '1.4 MB';
    const sId = system.id.toLowerCase();
    if (sId.includes('ps2') || sId.includes('playstation2')) {
      sizeText = ((hash % 3000 + 1500) / 1000).toFixed(2) + ' GB';
    } else if (sId.includes('ps3') || sId.includes('playstation3')) {
      sizeText = ((hash % 12000 + 6000) / 1000).toFixed(1) + ' GB';
    } else if (sId.includes('ps1') || sId.includes('psx') || sId.includes('saturn') || sId.includes('dreamcast') || sId.includes('3do') || sId.includes('gamecube') || sId.includes('gc')) {
      sizeText = (hash % 350 + 350) + ' MB';
    } else if (sId.includes('n64') || sId.includes('nintendo64')) {
      sizeText = (hash % 48 + 16) + ' MB';
    } else if (sId.includes('snes') || sId.includes('genesis') || sId.includes('megadrive')) {
      sizeText = ((hash % 32 + 8) / 8).toFixed(1) + ' MB';
    } else if (sId.includes('gba') || sId.includes('nds') || sId.includes('ds')) {
      sizeText = (hash % 16 + 8) + ' MB';
    } else if (sId.includes('nes') || sId.includes('sms') || sId.includes('gb') || sId.includes('gbc') || sId.includes('atari')) {
      sizeText = (hash % 120 + 40) + ' KB';
    } else {
      sizeText = (hash % 250 + 20) + ' MB';
    }

    return {
      comunidade: (4.1 + (hash % 9) / 10).toFixed(1) + ' / 5',
      votos: `${votesCount} VOTOS`,
      ign: `${ignScore} / 10`,
      playstation: `${consoleScore} / 10`,
      idioma: (hash % 3 === 0) ? 'PT-BR / EN' : 'PT-BR',
      legendas: (hash % 2 === 0) ? 'PT-BR / EN' : 'PT-BR / EN / ES',
      tamanho: sizeText
    };
  }, [selectedGame, system.id]);

  // Dynamic screenshot photos from seeded picsum matching gameplay feel
  const genreScreenshots = useMemo(() => {
    if (!selectedGame) return [];
    
    // We generate 4 distinct deterministic seeded gameplay screens based on the game title
    const cleanTitle = selectedGame.title.replace(/[\s\W]+/g, '-').toLowerCase();
    return [
      `https://picsum.photos/seed/${cleanTitle}-sc1/500/280`,
      `https://picsum.photos/seed/${cleanTitle}-sc2/500/280`,
      `https://picsum.photos/seed/${cleanTitle}-sc3/500/280`,
      `https://picsum.photos/seed/${cleanTitle}-sc4/500/280`
    ];
  }, [selectedGame]);

  // Immersive historical photos & vintage commercials of the selected console
  const consoleGalleryData = useMemo(() => {
    const sId = system.id.toLowerCase();
    let ads: { title: string; desc: string; img: string }[] = [];
    
    if (sId.includes('ds') || sId.includes('nds')) {
      ads = [
        { title: "Nintendo DS Original (Fat)", desc: "Lançado em 2004, o modelo original 'Fat' revolucionou com suas duas telas inovadoras e caneta Stylus.", img: "https://picsum.photos/seed/nds-fat/500/300" },
        { title: "Nintendo DS Lite", desc: "A versão refinada de grande sucesso com telas muito mais brilhantes, design minimalista e ergonomia aprimorada.", img: "https://picsum.photos/seed/nds-lite/500/300" },
        { title: "Campanha 'Touching is Good'", desc: "A icônica campanha de marketing que destacava a interatividade física inédita com a tela sensível ao toque.", img: "https://picsum.photos/seed/nds-commercial/500/300" },
        { title: "Placa-mãe do DS (Dual CPU)", desc: "Uma visão técnica interna dos dois co-processadores ARM que dividiam o processamento gráfico do console.", img: "https://picsum.photos/seed/nds-hardware/500/300" }
      ];
    } else if (sId.includes('ps2') || sId.includes('playstation2')) {
      ads = [
        { title: "PlayStation 2 Fat", desc: "O design futurista preto imponente inspirado na arquitetura industrial da Atari.", img: "https://picsum.photos/seed/ps2-fat/500/300" },
        { title: "PlayStation 2 Slim", desc: "Redução drástica de espessura e peso em 2004, trazendo placa de rede integrada para jogos online.", img: "https://picsum.photos/seed/ps2-slim/500/300" },
        { title: "Campanha Comercial 'Third Place'", desc: "O bizarro e artístico comercial de TV de lançamento dirigido pelo aclamado diretor David Lynch.", img: "https://picsum.photos/seed/ps2-ad/500/300" },
        { title: "Controle DualShock 2", desc: "O icônico controle com botões analógicos sensíveis à pressão e motores de vibração integrados.", img: "https://picsum.photos/seed/ps2-pad/500/300" }
      ];
    } else if (sId.includes('snes') || sId.includes('supernintendo')) {
      ads = [
        { title: "Super Famicom & SNES US", desc: "A notável diferença de design estético entre as curvas coloridas japonesas e as linhas retas americanas.", img: "https://picsum.photos/seed/snes-hw/500/300" },
        { title: "O Revolucionário Super FX", desc: "O co-processador RISC inserido dentro dos cartuchos para possibilitar renderizações 3D em jogos como Star Fox.", img: "https://picsum.photos/seed/snes-fx/500/300" },
        { title: "Propaganda 'Play It Loud'", desc: "A famosa e rebelde campanha publicitária dos anos 90, criada para rivalizar com a agressiva marca SEGA.", img: "https://picsum.photos/seed/snes-ad/500/300" },
        { title: "Satellaview Satellite", desc: "O pioneiro periférico de modem via satélite exclusivo do Japão, capaz de transmitir jogos direto para o SNES.", img: "https://picsum.photos/seed/snes-sat/500/300" }
      ];
    } else {
      ads = [
        { title: `Hardware Clássico ${system.name}`, desc: `O design de engenharia original e gabinete físico que marcou época nas lojas de todo o mundo.`, img: `https://picsum.photos/seed/${sId}-hw/500/300` },
        { title: "Controle e Periféricos", desc: "Layout de botões ergonômico projetado para precisão cirúrgica de jogo nos anos dourados.", img: `https://picsum.photos/seed/${sId}-ctrl/500/300` },
        { title: "Propagandas de Época", desc: "Campanhas publicitárias nostálgicas que recheavam as revistas clássicas de videogame.", img: `https://picsum.photos/seed/${sId}-ad/500/300` },
        { title: "Embalagem Oficial", desc: "A arte original da caixa do videogame que deslumbrava os olhos de crianças nas vitrines.", img: `https://picsum.photos/seed/${sId}-box/500/300` }
      ];
    }
    return ads;
  }, [system]);

  // Customized RetroAchievements dynamic milestones matching selected game names
  const achievementsList = useMemo(() => {
    if (!selectedGame) return [];
    const title = selectedGame.title.toLowerCase();
    
    let list = [
      { title: "Nostalgia Absoluta", desc: "Inicie este jogo clássico pela primeira vez no Retro Hub.", score: 10, unlocked: true },
      { title: "Velocista de Bits", desc: "Termine a primeira fase ou área de jogo em menos de 10 minutos.", score: 20, unlocked: false },
      { title: "Segredo de Cartucho", desc: "Descubra uma passagem secreta ou colecionável escondido nos cenários.", score: 30, unlocked: false },
      { title: "Gamer Perfeito", desc: "Complete a jornada principal sem utilizar nenhuma facilidade ou trapaça.", score: 50, unlocked: false }
    ];
    
    if (title.includes('mario kart')) {
      list = [
        { title: "Derrapagem de Fogo", desc: "Execute 10 Mini-Turbos consecutivos usando derrapagens em uma única volta.", score: 10, unlocked: true },
        { title: "Desvio Lendário", desc: "Consiga desviar de um perigoso Casco Azul usando o cogumelo de velocidade perfeita.", score: 30, unlocked: true },
        { title: "Copa de Ouro Perfeita", desc: "Vença a Copa Especial na dificuldade máxima com 3 Estrelas de ouro.", score: 40, unlocked: false },
        { title: "Mestre das Pistas", desc: "Ganhe uma partida no modo Time Trial quebrando o recorde mundial simulado.", score: 50, unlocked: false }
      ];
    } else if (title.includes('pokemon') || title.includes('pokémon')) {
      list = [
        { title: "Jornada Iniciada", desc: "Capture seu primeiro monstro selvagem na grama alta do cenário.", score: 10, unlocked: true },
        { title: "Desafio do Líder", desc: "Derrote o primeiro líder de ginásio oficial usando apenas o seu pokémon inicial.", score: 20, unlocked: true },
        { title: "Evolução Suprema", desc: "Evolua o seu pokémon de estimação para a forma final de terceiro estágio.", score: 30, unlocked: false },
        { title: "Lenda Aprisionada", desc: "Capture o pokémon lendário guardião usando apenas uma pokébola comum de baixo custo.", score: 50, unlocked: false }
      ];
    } else if (title.includes('zelda')) {
      list = [
        { title: "Espada Sagrada", desc: "Adquira a clássica lâmina protetora do herói com o ancião da caverna.", score: 10, unlocked: true },
        { title: "Coração de Aço", desc: "Encontre 4 Recipientes de Corações escondidos pelo mapa do mundo.", score: 25, unlocked: true },
        { title: "Lenda Adormecida", desc: "Retire a lendária Master Sword de seu pedestal de pedra sagrado.", score: 35, unlocked: false },
        { title: "Salvador de Hyrule", desc: "Derrote o vilão Ganon no confronto final sem receber nenhuma queda.", score: 50, unlocked: false }
      ];
    } else if (title.includes('castlevania')) {
      list = [
        { title: "Caçador Sagrado", desc: "Derrote 100 mortos-vivos usando o clássico chicote Vampire Killer.", score: 10, unlocked: true },
        { title: "Sala Invertida", desc: "Acesse a área secreta do castelo invertido com Alucard.", score: 30, unlocked: false },
        { title: "Herdeiro de Belmont", desc: "Vença a luta contra a própria Morte sem utilizar sub-armas ou feitiços.", score: 40, unlocked: false },
        { title: "Destruidor da Noite", desc: "Derrote o Conde Drácula no trono central sem sofrer danos.", score: 50, unlocked: false }
      ];
    } else if (title.includes('chrono trigger') || title.includes('chrono')) {
      list = [
        { title: "Fenda do Tempo", desc: "Viaje através do primeiro portal de tempo na agitada Feira do Milênio.", score: 10, unlocked: true },
        { title: "Julgamento Justo", desc: "Seja considerado 100% inocente por todos os jurados no tribunal real do reino.", score: 25, unlocked: true },
        { title: "Além do Infinito", desc: "Derrote a colossal ameaça Lavos no início do jogo (New Game Plus).", score: 45, unlocked: false },
        { title: "O Fim dos Tempos", desc: "Desbloqueie o raríssimo final perfeito encontrando todos os aliados históricos.", score: 50, unlocked: false }
      ];
    }
    return list;
  }, [selectedGame]);

  // Deep historical trivia and fun development facts about games and systems
  const triviaData = useMemo(() => {
    if (!selectedGame) return [];
    const title = selectedGame.title.toLowerCase();
    const sId = system.id.toLowerCase();
    
    let list = [
      { type: "Desenvolvimento", title: "Codificação de Elite", desc: "Para rodar com fluidez na época, os programadores escreviam boa parte dos loops em linguagem Assembly de baixíssimo nível para economizar ciclos de CPU." },
      { type: "Curiosidade", title: "Música de Ouro", desc: "Muitas trilhas sonoras usavam moduladores de canais FM limitados a 8 canais de som, forçando compositores a criarem arranjos rítmicos inesquecíveis baseados em arpejos." },
      { type: "Segredo", title: "Arquivos Escondidos", desc: "Hackers descobriram diversas texturas, mapas inacabados e debuggers que permaneceram ocultos no cartucho oficial do jogo." }
    ];
    
    if (sId.includes('ds') || sId.includes('nds')) {
      list = [
        { type: "Hardware", title: "O Codinome 'Nitro'", desc: "O Nintendo DS foi batizado secretamente como 'Project Nitro'. É por essa razão que os arquivos internos e cartuchos originais possuem o código de prefixo NTR." },
        { type: "História", title: "Opinião Presidencial", desc: "A ideia de ter duas telas paralelas partiu do ex-presidente Hiroshi Yamauchi, que insistia que uma tela dupla traria interatividade nunca antes experimentada." }
      ];
      if (title.includes('mario kart')) {
        list.push({ type: "Técnica", title: "O Legado do Snaking", desc: "O desvio dinâmico 'Snaking' em Mario Kart DS permitia ganhar velocidade extra infinita em retas, dividindo a comunidade mundial competitiva da época." });
      } else if (title.includes('pokemon') || title.includes('pokémon')) {
        list.push({ type: "História", title: "O Pokéwalker de Brinde", desc: "O jogo vinha acompanhado de um pedômetro real que sincronizava com o cartucho infravermelho, incentivando crianças do mundo todo a andarem ao ar livre." });
      }
    } else if (sId.includes('ps2') || sId.includes('playstation2')) {
      list = [
        { type: "Hardware", title: "O Poder do Emotion Engine", desc: "O processador central rodava a 294 MHz e foi otimizado exclusivamente para o cálculo de matrizes matemáticas 3D, simulando comportamentos de física e fluidos avançados." },
        { type: "Curiosidade", title: "A Maravilha do DVD", desc: "Oferecer leitor de DVD nativo de baixo custo foi a principal jogada da Sony, fazendo com que milhões de pessoas comprassem o PS2 como aparelho de sala de estar principal." }
      ];
    } else if (sId.includes('snes') || sId.includes('supernintendo')) {
      list = [
        { type: "Áudio", title: "O Processador SPC700 da Sony", desc: "O majestoso processador de som de 8 canais foi projetado secretamente pelo engenheiro Ken Kutaragi (pai do futuro PlayStation original) na fábrica da Sony." },
        { type: "Técnica", title: "Mágica do Mode 7", desc: "O SNES usava rotação de backgrounds plana (Mode 7) para simular perspectiva de profundidade 3D em jogos como F-Zero e Super Mario Kart." }
      ];
    }
    return list;
  }, [selectedGame, system]);

  // Clean interactive time milestones for retro consoles history
  const systemTimeline = useMemo(() => {
    const sId = system.id.toLowerCase();
    
    let timeline = [
      { year: "Anúncio", title: "Início do Projeto", desc: "O console é revelado de surpresa aos desenvolvedores de todo o mundo." },
      { year: "Lançamento", title: "Febre do Mercado", desc: "O sistema chega oficialmente às lojas, causando grande aglomeração e recordes de vendas." },
      { year: "Sucesso", title: "Consolidação Clássica", desc: "O videogame atinge sua Era de Ouro com o lançamento de bibliotecas atemporais." },
      { year: "Legado", title: "Nostalgia Eterna", desc: "A fabricação é concluída, mas o hardware ganha sobrevida eterna em colecionadores de console." }
    ];
    
    if (sId.includes('ds') || sId.includes('nds')) {
      timeline = [
        { year: "2003", title: "O Terceiro Pilar da Nintendo", desc: "A empresa revela planos de criar um novo sistema híbrido inovador, coexistente ao Game Boy Advance e GameCube." },
        { year: "2004", title: "Lançamento do DS Fat", desc: "O console de tela de toque estreia nas lojas globais, superando as previsões de vendas e consolidando a tecnologia inovadora." },
        { year: "2006", title: "DS Lite & Febre Mundial", desc: "O modelo Lite chega com design slim minimalista e telas hipnotizantes de alto brilho, dominando o mercado de forma absoluta." },
        { year: "2010", title: "O Titã dos Portáteis", desc: "Atinge a lendária marca de 154 milhões de aparelhos vendidos mundialmente, sagrando-se o maior videogame portátil da história." }
      ];
    } else if (sId.includes('ps2') || sId.includes('playstation2')) {
      timeline = [
        { year: "1999", title: "O Anúncio do Gigante", desc: "A Sony revela as especificações do Emotion Engine na feira E3, assustando toda a concorrência." },
        { year: "2000", title: "Lançamento Histórico", desc: "Longas filas quilométricas de fãs dormindo nas ruas do Japão marcam a estonteante estréia do console das icônicas torres azuis." },
        { year: "2004", title: "O Elegante Slim", desc: "Chega o modelo ultra-fino de altíssima portabilidade que tornou o videogame ainda mais acessível globalmente." },
        { year: "2013", title: "Fim de uma Era Vitoriosa", desc: "A Sony encerra a produção mundial com mais de 155 milhões de unidades comercializadas e 4.000 títulos lançados." }
      ];
    } else if (sId.includes('snes') || sId.includes('supernintendo')) {
      timeline = [
        { year: "1988", title: "Projeto do Super Famicom", desc: "A Nintendo inicia secretamente o design do sucessor do NES para concorrer com o rápido Mega Drive da Sega." },
        { year: "1990", title: "A Febre de 16-Bits", desc: "Lançado no Japão, o console vendeu todo o estoque inicial de 300.000 unidades em poucas horas no fim de semana." },
        { year: "1992", title: "Era de Ouro Pixel Art", desc: "Títulos revolucionários levam a capacidade gráfica e sonora do SNES ao ápice estético dos jogos bidimensionais." },
        { year: "2003", title: "Consagração Histórica", desc: "A produção é oficialmente encerrada, gravando o SNES como um dos consoles mais nostálgicos da cultura pop." }
      ];
    }
    return timeline;
  }, [system]);

  const activeGlowColor = getSystemThemeColor(system.id).hex;

  // Compatibility Laboratory subscribes mapping
  const [subscribedConsoles, setSubscribedConsoles] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('retro_lab_subs') || '[]');
    } catch {
      return [];
    }
  });

  const handleToggleSubscribe = (cid: string) => {
    soundEngine.playSelect();
    let updated;
    if (subscribedConsoles.includes(cid)) {
      updated = subscribedConsoles.filter(x => x !== cid);
    } else {
      updated = [...subscribedConsoles, cid];
    }
    setSubscribedConsoles(updated);
    localStorage.setItem('retro_lab_subs', JSON.stringify(updated));
  };

  return (
    <div 
      id="gamelist-container"
      onMouseMove={handleMouseMove}
      className="fixed inset-0 w-full h-screen font-sans text-white overflow-hidden bg-transparent flex flex-col justify-between select-none relative"
      style={{ '--theme-color': activeGlowColor } as React.CSSProperties}
    >
      
      {/* 1. RETRO BIOS BOOT SEQUENCE OVERLAY */}
      <AnimatePresence>
        {isBooting && (
          <motion.div
            key="bios-boot"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="fixed inset-0 z-[999] bg-black flex flex-col justify-between p-8 sm:p-12 font-mono select-none"
          >
            {/* Top Bar with Skip */}
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">BOOT_SYSTEM_INITIALIZATION</span>
              </div>
              <button
                onClick={() => setIsBooting(false)}
                className="px-4 py-1.5 rounded bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white border border-zinc-800 text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer"
              >
                ➔ PULAR BIOS
              </button>
            </div>

            {/* Mid Logo & Diagnostics Section */}
            <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full gap-8 my-6">
              {(() => {
                const id = system.id.toLowerCase();
                if (id.includes('ps') || id.includes('playstation')) {
                  return (
                    <motion.div 
                      initial={{ scale: 0.85, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex flex-col items-center gap-1.5"
                    >
                      <div className="text-5xl font-sans font-black tracking-tighter bg-gradient-to-r from-orange-500 via-red-500 to-indigo-600 bg-clip-text text-transparent">
                        PlayStation
                      </div>
                      <div className="text-[9px] text-zinc-600 uppercase tracking-[0.4em] font-sans font-bold">
                        Licensed by Sony Interactive Entertainment
                      </div>
                    </motion.div>
                  );
                } else if (id.includes('sega') || id.includes('genesis') || id.includes('sms') || id.includes('saturn')) {
                  return (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex flex-col items-center gap-2"
                    >
                      <div className="px-6 py-1.5 border-[3px] border-sky-500 text-sky-500 text-4xl font-sans font-black tracking-[0.25em] skew-x-3 text-center bg-transparent">
                        SEGA
                      </div>
                      <div className="text-[8px] text-zinc-600 uppercase tracking-[0.3em] font-sans font-bold">
                        PRODUCED BY LORDTECARETRO RESEARCH DECK
                      </div>
                    </motion.div>
                  );
                } else if (id.includes('xbox')) {
                  return (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex flex-col items-center gap-2"
                    >
                      <div className="relative w-16 h-16 rounded-full bg-black border-2 border-emerald-500 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                        <div className="absolute inset-0 bg-emerald-500/20 blur animate-pulse" />
                        <div className="text-2xl text-emerald-500 font-sans font-black tracking-tighter z-10">X</div>
                      </div>
                      <div className="text-lg font-sans font-extrabold tracking-tight text-white uppercase mt-1">XBOX CLASSIC</div>
                    </motion.div>
                  );
                } else {
                  return (
                    <motion.div 
                      initial={{ scale: 0.85, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex flex-col items-center gap-2"
                    >
                      <div className="px-4 py-1.5 border-[2px] border-red-600 rounded-full text-red-600 text-2xl font-sans font-black tracking-tight uppercase">
                        Nintendo
                      </div>
                      <div className="text-[8px] text-zinc-600 uppercase tracking-[0.3em] font-bold">
                        SYSTEM DIAGNOSTICS DECK ATTACHED
                      </div>
                    </motion.div>
                  );
                }
              })()}

              {/* Progress and Realtime Logs Console */}
              <div className="w-full max-w-xl bg-zinc-950/85 border border-white/5 rounded-xl p-4 font-mono text-[9px] leading-relaxed text-zinc-400 flex flex-col gap-2 shadow-inner">
                <div className="flex justify-between items-center text-[8px] text-zinc-500 border-b border-white/5 pb-2">
                  <span>SYSTEM MEMORY TEST</span>
                  <span className="font-bold text-zinc-300">{bootProgress}% READY</span>
                </div>
                
                <div className="flex flex-col gap-1 max-h-[140px] overflow-y-auto pr-1">
                  {bootLogs.map((log, index) => (
                    <div key={index} className="flex gap-2 text-zinc-400">
                      <span className="text-[#E60012] font-extrabold font-mono">&gt;</span>
                      <span className="truncate">{log}</span>
                    </div>
                  ))}
                </div>

                <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden mt-1">
                  <div 
                    className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-emerald-500 transition-all duration-150"
                    style={{ width: `${bootProgress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Micro Copyright Disclaimer */}
            <div className="text-center text-[8px] text-zinc-700 uppercase tracking-widest font-sans font-medium">
              LordTecaRetro Emulation BIOS Decrypter v4.81 • No physical copyright violated
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. BACKGROUND CINEMATOGRÁFICO AVANÇADO */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Parallax High-Fidelity Console Background Art with automatic local fallback */}
        {(!bgError || !['ps1', 'psx', 'playstation', 'ps2', 'playstation2', 'ps3', 'playstation3', 'xbox', 'xboxclassic', 'xbox360', 'dreamcast', 'gamecube', 'gc', 'saturn'].some(m => system.id.toLowerCase().includes(m))) && (
          <img 
            src={bgError ? "https://raw.githubusercontent.com/lordjunnior/recalbox-theme/main/assets/arts/favorites.jpg" : `https://raw.githubusercontent.com/lordjunnior/recalbox-theme/main/assets/arts/${getRecalboxFolderName(system.id)}.jpg`}
            onError={() => {
              if (!bgError) setBgError(true);
            }}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-[0.22] scale-105 transition-all duration-700 ease-out"
            style={{ 
              transform: `translate(${mousePos.x * -12}px, ${mousePos.y * -12}px) scale(1.06)`
            }}
            referrerPolicy="no-referrer"
          />
        )}
        
        {/* Elegant Gradient Overlay - solid dark color on the left for text legibility, fading out on the right to reveal the gorgeous console illustration */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#030305] via-[#030305]/85 to-transparent" />
        
        {/* Subtle glowing color halo based on active console's custom theme color */}
        <div 
          className="absolute inset-0 opacity-[0.15] transition-all duration-700"
          style={{
            background: `radial-gradient(circle at 80% 80%, var(--theme-color), transparent 60%)`
          }}
        />
        
        {/* Retro CRT grid & scanline scan overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.3)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-[0.16] pointer-events-none" />

        {/* Dynamic breathing glowing background ball */}
        <div 
          className="absolute top-[20%] left-[30%] w-[750px] h-[550px] bg-[var(--theme-color)] rounded-full blur-[200px] mix-blend-screen transition-all duration-500 ease-out"
          style={{ 
             opacity: 0.12 + Math.sin(floatTick) * 0.03,
             transform: `translate(${mousePos.x * -30}px, ${mousePos.y * -30}px) scale(${1 + Math.sin(floatTick) * 0.05})` 
          }}
        />
      </div>

      {/* 3. COOP SCREEN STATIC PULSE */}
      {screenStaticPulse && (
        <div className="absolute inset-0 z-[100] bg-zinc-900/45 mix-blend-color-dodge opacity-25 pointer-events-none animate-flash-static" />
      )}

      {/* 4. HEADER RETRO */}
      <header className="h-[75px] w-full flex justify-between items-center px-10 border-b border-white/5 bg-gradient-to-b from-black/60 to-transparent z-20 relative">
        {/* Back and Brand Logo */}
        <div className="flex items-center gap-6">
          <button 
            id="back-button"
            onClick={handleBack}
            className="flex items-center gap-2 border border-white/15 hover:border-[#E60012] bg-black/40 hover:bg-[#E60012]/10 text-gray-300 hover:text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer shadow-[0_0_15px_rgba(0,0,0,0.4)]"
          >
            <ArrowLeft className="w-3 h-3 text-[#E60012]" />
            <span>Voltar</span>
          </button>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-sans font-black tracking-[0.15em] text-white">LORDTECA</span>
              <span className="text-sm font-sans font-light tracking-[0.15em] text-gray-400">RETRO</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#E60012] shadow-[0_0_8px_#E60012]" />
            </div>
            <span className="text-[8px] text-gray-500 uppercase tracking-[0.25em] font-bold">Console Hub Direct</span>
          </div>
        </div>

        {/* Dynamic Clock & Controls */}
        <div className="flex items-center gap-4">
          {/* Quick Stats */}
          <div className="hidden md:flex items-center gap-1 bg-white/5 border border-white/5 px-3 py-1 rounded-full">
            <span className="text-[8px] text-gray-500 uppercase tracking-widest font-bold">ROMs:</span>
            <span className="text-[9px] text-white font-mono font-bold">{filteredGames.length} de {system.games.length}</span>
          </div>

          {/* Audio toggle button */}
          <button 
            onClick={toggleMute}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-1.5 rounded-full transition-colors text-[var(--theme-color)] cursor-pointer"
          >
            {isMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-rose-500" />
                <span className="text-[9px] font-extrabold tracking-[0.2em] text-rose-500 uppercase">Mudo</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5" style={{ filter: 'drop-shadow(0 0 5px var(--theme-color))' }} />
                <span className="text-[9px] font-extrabold tracking-[0.2em] text-gray-400 uppercase">Áudio: On</span>
              </>
            )}
          </button>

          {/* UTC Clock */}
          <div className="flex items-center gap-2 bg-black/40 border border-white/5 px-4 py-1.5 rounded-full shadow-inner">
            <Clock className="w-3.5 h-3.5 text-[#E60012]" />
            <span className="text-xs font-mono font-bold tracking-widest text-white">{timeString}</span>
          </div>
        </div>
      </header>

      {/* 5. MAIN HUB DISPLAY LAYOUT */}
      <main className="flex-1 w-full max-w-[1700px] mx-auto px-8 py-4 flex gap-6 overflow-hidden z-10 relative">
        
        {/* COLUNA 1: SIDEBAR (NAVIGATION & GAMES SCROLLER) */}
        <aside className="w-[320px] flex-shrink-0 flex flex-col gap-4 overflow-hidden h-full">
          {/* Section 1: Dashboard Navigation Tabs */}
          <div className="bg-black/30 border border-white/5 rounded-2xl p-2.5 flex flex-col gap-1 backdrop-blur-md">
            {[
              { id: 'overview', label: 'Visão Geral', icon: Eye },
              { id: 'trivia', label: 'Segredos & Trivia', icon: Sparkles },
              { id: 'history', label: 'História', icon: BookOpen },
            ].map(tab => {
              const IconComp = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    soundEngine.playMove();
                    setActiveTab(tab.id as any);
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-[10px] uppercase font-bold tracking-widest transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-gradient-to-r from-[rgba(230,0,18,0.15)] to-transparent border-l-4 border-[#E60012] text-white shadow-md' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <IconComp className={`w-4 h-4 ${isActive ? 'text-[#E60012]' : 'text-gray-500'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Section 2: Catalog Game Scroller */}
          <div className="bg-black/35 border border-white/5 rounded-2xl flex-1 flex flex-col overflow-hidden backdrop-blur-md">
            {/* Header / Search Controls */}
            <div className="p-3 border-b border-white/5 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#E60012]">Mural de Clássicos</span>
                
                {/* Heart Filter Toggle */}
                <button 
                  onClick={() => {
                    soundEngine.playSelect();
                    setFilterFavorites(!filterFavorites);
                    setSelectedGameIndex(0);
                  }}
                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                    filterFavorites 
                      ? 'bg-rose-500/20 border-rose-500 text-rose-500' 
                      : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'
                  }`}
                  title="Apenas Favoritos"
                >
                  <Heart className="w-3.5 h-3.5 fill-current" />
                </button>
              </div>

              {/* Dynamic Search Box */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-500" />
                <input 
                  ref={searchInputRef}
                  type="text"
                  placeholder="Buscar clássico..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setSelectedGameIndex(0);
                  }}
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-[10px] tracking-wider text-white placeholder-gray-500 focus:outline-none focus:border-[var(--theme-color)] transition-colors"
                />
              </div>
            </div>

            {/* Scroll list */}
            <div 
              ref={listContainerRef}
              className="flex-1 overflow-y-auto p-2 flex flex-col gap-1 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent"
            >
              {filteredGames.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center gap-2">
                  <Gamepad className="w-8 h-8 text-zinc-600 animate-pulse" />
                  <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Nenhum jogo encontrado</span>
                </div>
              ) : (
                filteredGames.map((game, idx) => {
                  const isSelected = idx === selectedGameIndex;
                  const key = `${system.id}_${game.title}`;
                  const isFav = favoriteMapping[key] !== undefined ? favoriteMapping[key] : game.favorite;
                  
                  return (
                    <button
                      key={game.id}
                      onClick={() => handleGameClick(idx, game)}
                      className={`w-full flex items-center gap-3 p-2 rounded-xl text-left border transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-gradient-to-r from-white/10 to-transparent border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.05)]' 
                          : 'bg-transparent border-transparent hover:bg-white/5'
                      }`}
                    >
                      {/* Box Cover Thumbnail */}
                      <div className="w-[36px] h-[48px] rounded overflow-hidden flex-shrink-0 bg-zinc-900 border border-white/10 relative shadow">
                        <GameCover 
                          game={game} 
                          systemId={system.id} 
                          className="w-full h-full object-cover" 
                        />
                        {isFav && (
                          <div className="absolute top-0.5 right-0.5 bg-rose-600 rounded-full p-0.5 shadow">
                            <Heart className="w-1.5 h-1.5 fill-current text-white" />
                          </div>
                        )}
                      </div>

                      {/* Info text */}
                      <div className="flex-1 min-w-0 flex flex-col">
                        <span className={`text-[10px] font-bold tracking-wider truncate uppercase ${isSelected ? 'text-[var(--theme-color)]' : 'text-zinc-200'}`} style={isSelected ? { textShadow: '0 0 5px var(--theme-color)' } : {}}>
                          {game.title}
                        </span>
                        <span className="text-[8px] text-zinc-500 font-mono tracking-widest uppercase mt-0.5">
                          {game.genre} • {game.year}
                        </span>
                      </div>

                      {/* Status indicator */}
                      {isSelected && (
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--theme-color)] animate-ping" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </aside>

        {/* COLUNA 2: DIORAMA PEDESTAL (3D FLOATING BOX & SPECS ROW) */}
        <div className="flex-1 flex flex-col items-center justify-center gap-8 px-4 relative">
          {selectedGame && (
            <>
              {/* Box Art and Floor shadow */}
              <div className="relative flex flex-col items-center select-none mt-4" style={{ perspective: '1100px' }}>
                
                {/* Floating 3D cover container (Enlarged and highlighted) */}
                <div 
                  onClick={() => handleLaunchGame(selectedGame)}
                  className="w-[320px] h-[430px] rounded-2xl shadow-3xl relative z-10 transition-transform duration-300 ease-out flex-shrink-0 cursor-pointer overflow-hidden border border-white/15"
                  style={{ 
                    transformStyle: 'preserve-3d',
                    transform: `rotateY(${mousePos.x * 25}deg) rotateX(${mousePos.y * -25}deg) translateZ(40px) translateY(${Math.sin(floatTick) * 8}px)`,
                    boxShadow: `${mousePos.x * -18}px ${mousePos.y * 18}px 35px rgba(0,0,0,0.85)`
                  }}
                  title="Clique para Jogar"
                >
                  <GameCover 
                    game={selectedGame} 
                    systemId={system.id} 
                    className="w-full h-full object-cover scale-102" 
                  />
                  {/* Glowing Sweep overlay reflection */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/20 pointer-events-none" />
                  
                  {/* Subtle hover play overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                    <div className="p-4 bg-black/85 rounded-full border border-white/20 shadow-lg scale-90 hover:scale-100 transition-transform">
                      <Play className="w-8 h-8 text-[#E60012] fill-current translate-x-0.5" />
                    </div>
                  </div>
                </div>

                {/* dynamic projected floor drop-shadow underneath the cover */}
                <div 
                   className="w-[280px] h-[20px] bg-black/65 rounded-full blur-xl absolute bottom-[-45px] z-0 transition-transform duration-300 ease-out"
                   style={{
                      transform: `scale(${1 - Math.sin(floatTick) * 0.08}) translate(${mousePos.x * 15}px, ${mousePos.y * -8}px)`,
                      opacity: 0.8 - Math.sin(floatTick) * 0.1
                   }}
                />
              </div>

              {/* Technical Specifications Row underneath diorama (Optimized columns to prevent truncation) */}
              <div className="w-full max-w-[620px] bg-black/40 border border-white/5 rounded-2xl p-4 grid grid-cols-5 text-center divide-x divide-white/5 backdrop-blur-md">
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-[7.5px] text-zinc-500 uppercase tracking-[0.18em] font-bold">Lançamento</span>
                  <span className="text-[9px] md:text-[10px] text-white font-bold tracking-wider">{selectedGame.year}</span>
                </div>
                <div className="flex flex-col gap-1 px-1 min-w-0">
                  <span className="text-[7.5px] text-zinc-500 uppercase tracking-[0.18em] font-bold">Gênero</span>
                  <span className="text-[9px] md:text-[10px] text-white font-bold tracking-wider uppercase leading-tight break-words">{selectedGame.genre}</span>
                </div>
                <div className="flex flex-col gap-1 px-1 min-w-0">
                  <span className="text-[7.5px] text-zinc-500 uppercase tracking-[0.18em] font-bold">Desenvolvedora</span>
                  <span className="text-[9px] md:text-[10px] text-white font-bold tracking-wider uppercase leading-tight break-words">{selectedGame.developer || 'Retro Team'}</span>
                </div>
                <div className="flex flex-col gap-1 px-1 min-w-0">
                  <span className="text-[7.5px] text-zinc-500 uppercase tracking-[0.18em] font-bold">Publicadora</span>
                  <span className="text-[9px] md:text-[10px] text-white font-bold tracking-wider uppercase leading-tight break-words">{selectedGame.publisher || 'Retro Soft'}</span>
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-[7.5px] text-zinc-500 uppercase tracking-[0.18em] font-bold">Jogadores</span>
                  <span className="text-[9px] md:text-[10px] text-white font-bold tracking-wider uppercase">1 JOGADOR</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* COLUNA 3: INFORMATION DOSSIER CARD */}
        <div className="w-[450px] flex-shrink-0 flex flex-col gap-4 overflow-y-auto h-full pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
          {selectedGame ? (
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="tab-overview"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col gap-4"
                >
                  {/* Heading Header */}
                  <div>
                    <span className="text-[9px] bg-[var(--theme-color)]/20 text-[var(--theme-color)] border border-[var(--theme-color)]/30 px-3 py-1 rounded-full font-black tracking-[0.25em] uppercase shadow-sm inline-block">
                      {selectedGame.genre.toUpperCase()} / RETRO CLASSIC
                    </span>
                    <h1 className="text-2xl font-sans font-black tracking-tight text-white uppercase mt-2 leading-tight">
                      {selectedGame.title}
                    </h1>
                  </div>

                  {/* Summary Narrative description */}
                  <p className="text-[11px] leading-relaxed text-zinc-400 font-sans tracking-wide bg-white/2 p-3.5 rounded-xl border border-white/5">
                    {selectedGame.description || `Redescubra este clássico absoluto do console ${system.name}. Re-imaginamento e jogabilidade icônica original misturado com os clássicos no LordTecaRetro com velocidade máxima de carregamento.`}
                  </p>

                  {/* Dossier Card Container (Translucid backdrop blur) */}
                  <div className="bg-black/30 border border-white/5 rounded-2xl p-5 flex flex-col gap-4 backdrop-blur-md">
                    <span className="text-[9px] text-zinc-500 uppercase tracking-[0.25em] font-bold">Dossier de Desempenho</span>
                    
                    {/* Part A: Dynamic Ratings */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white/3 border border-white/5 rounded-xl p-2.5 flex flex-col gap-1">
                        <span className="text-[8px] text-gray-500 uppercase tracking-widest">Comunidade</span>
                        <span className="text-[11px] text-white font-extrabold font-mono flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                          {gameDossier.comunidade}
                        </span>
                        <span className="text-[7px] text-zinc-600 font-medium tracking-wide uppercase">{gameDossier.votos}</span>
                      </div>
                      <div className="bg-white/3 border border-white/5 rounded-xl p-2.5 flex flex-col gap-1">
                        <span className="text-[8px] text-gray-500 uppercase tracking-widest">Score IGN</span>
                        <span className="text-[11px] text-white font-extrabold font-mono flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-[#E60012]" />
                          {gameDossier.ign}
                        </span>
                        <span className="text-[7px] text-zinc-600 font-medium tracking-wide uppercase">RECOMENDADO</span>
                      </div>
                      <div className="bg-white/3 border border-white/5 rounded-xl p-2.5 flex flex-col gap-1">
                        <span className="text-[8px] text-gray-500 uppercase tracking-widest">Revista Retro</span>
                        <span className="text-[11px] text-white font-extrabold font-mono flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-sky-400" />
                          {gameDossier.playstation}
                        </span>
                        <span className="text-[7px] text-zinc-600 font-medium tracking-wide uppercase">Aclamação</span>
                      </div>
                    </div>

                    {/* Part B: Localization & Media Size */}
                    <div className="grid grid-cols-3 gap-3 border-t border-white/5 pt-3.5">
                      <div className="flex flex-col">
                        <span className="text-[7.5px] text-zinc-500 uppercase tracking-widest">Idioma</span>
                        <span className="text-[10px] text-gray-300 font-bold font-mono tracking-wider mt-0.5">{gameDossier.idioma}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[7.5px] text-zinc-500 uppercase tracking-widest">Legendas</span>
                        <span className="text-[10px] text-gray-300 font-bold font-mono tracking-wider mt-0.5">{gameDossier.legendas}</span>
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-[7.5px] text-zinc-500 uppercase tracking-widest">Tamanho</span>
                        <span className="text-[10px] text-[var(--theme-color)] font-extrabold font-mono tracking-wider mt-0.5">{gameDossier.tamanho}</span>
                      </div>
                    </div>

                    {/* Part C: Call To Action buttons */}
                    <div className="flex gap-3 border-t border-white/5 pt-4">
                      {/* Play Action */}
                      <button 
                        onClick={() => handleLaunchGame(selectedGame)}
                        className="flex-1 bg-gradient-to-r from-[var(--theme-color)] to-indigo-700 text-white font-black uppercase text-[10px] tracking-[0.25em] py-3.5 px-4 rounded-xl hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg relative overflow-hidden group"
                        style={{ boxShadow: '0 0 20px var(--theme-color)' } as React.CSSProperties}
                      >
                        {/* Shimmer sweep effect */}
                        <div className="absolute inset-y-0 -left-16 w-8 bg-white/20 skew-x-12 group-hover:animate-shimmer-sweep" />
                        <Gamepad className="w-4 h-4 text-white" />
                        <span>Jogar Agora</span>
                      </button>

                      {/* Favorite Button */}
                      <button 
                        onClick={() => handleToggleFavorite(selectedGame)}
                        className={`px-4 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                          isCurrentGameFavorite 
                            ? 'bg-rose-600/10 border-rose-500/50 text-rose-500' 
                            : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                        }`}
                        title={isCurrentGameFavorite ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
                      >
                        <Heart className={`w-4 h-4 ${isCurrentGameFavorite ? 'fill-current text-rose-500' : ''}`} />
                      </button>
                    </div>
                  </div>

                </motion.div>
              )}

              {activeTab === 'trivia' && (
                <motion.div
                  key="tab-trivia"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col gap-4"
                >
                  <div className="border-b border-white/5 pb-2">
                    <span className="text-[8px] text-[var(--theme-color)] uppercase tracking-[0.25em] font-extrabold">Dossiê Oculto</span>
                    <h2 className="text-lg font-bold text-white uppercase mt-1">Segredos & Trivia Clássica</h2>
                  </div>

                  <div className="flex flex-col gap-3">
                    {triviaData.map((item, index) => {
                      const icons = {
                        "Desenvolvimento": <Cpu className="w-4 h-4 text-purple-400" />,
                        "Curiosidade": <Sparkles className="w-4 h-4 text-amber-400" />,
                        "Segredo": <Gamepad className="w-4 h-4 text-emerald-400" />,
                        "Hardware": <Layers className="w-4 h-4 text-sky-400" />,
                        "História": <BookOpen className="w-4 h-4 text-blue-400" />,
                        "Técnica": <Award className="w-4 h-4 text-indigo-400" />,
                        "Áudio": <Sparkles className="w-4 h-4 text-rose-400" />
                      };
                      const colors = {
                        "Desenvolvimento": "border-purple-500/20 bg-purple-500/2 text-purple-400",
                        "Curiosidade": "border-amber-500/20 bg-amber-500/2 text-amber-400",
                        "Segredo": "border-emerald-500/20 bg-emerald-500/2 text-emerald-400",
                        "Hardware": "border-sky-500/20 bg-sky-500/2 text-sky-400",
                        "História": "border-blue-500/20 bg-blue-500/2 text-blue-400",
                        "Técnica": "border-indigo-500/20 bg-indigo-500/2 text-indigo-400",
                        "Áudio": "border-rose-500/20 bg-rose-500/2 text-rose-400"
                      };
                      
                      const typeKey = item.type as keyof typeof icons;
                      const activeIcon = icons[typeKey] || <Info className="w-4 h-4 text-zinc-400" />;
                      const activeColorClass = colors[typeKey] || "border-zinc-500/20 bg-zinc-500/2 text-zinc-400";

                      return (
                        <div 
                          key={index} 
                          className="bg-[#121214]/60 border border-white/5 rounded-2xl p-4 flex flex-col gap-2 shadow-xl hover:border-white/10 transition-all duration-300"
                        >
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg border ${activeColorClass}`}>
                              {activeIcon}
                            </div>
                            <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">
                              {item.type}
                            </span>
                          </div>
                          <div className="flex flex-col gap-1 mt-1">
                            <span className="text-[11px] font-bold text-gray-200 uppercase tracking-wide">
                              {item.title}
                            </span>
                            <p className="text-[10.5px] leading-relaxed text-zinc-400">
                              {item.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {activeTab === 'history' && (
                <motion.div
                  key="tab-history"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col gap-4"
                >
                  <div className="border-b border-white/5 pb-2">
                    <span className="text-[8px] text-[var(--theme-color)] uppercase tracking-[0.25em] font-extrabold">Trajetória do Sucesso</span>
                    <h2 className="text-lg font-bold text-white uppercase mt-1">História do Console</h2>
                  </div>

                  <p className="text-[10.5px] leading-relaxed text-zinc-400 bg-white/2 p-3.5 rounded-xl border border-white/5">
                    O <strong>{system.name}</strong> destaca-se historicamente como um marco lendário que moldou a infância e os hábitos de milhões de gamers em todo o mundo.
                  </p>

                  {/* Vertical Clean Timeline */}
                  <div className="relative pl-6 flex flex-col gap-6 mt-2">
                    {/* Vertical connecting line */}
                    <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-[var(--theme-color)] via-zinc-800 to-zinc-900" />

                    {systemTimeline.map((item, index) => (
                      <div key={index} className="relative flex flex-col gap-1 group">
                        {/* Bullet point indicator */}
                        <div className="absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full bg-zinc-950 border-2 border-[var(--theme-color)] flex items-center justify-center shadow shadow-[var(--theme-color)]/50 group-hover:scale-110 transition-transform">
                          <div className="w-1 h-1 rounded-full bg-white" />
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10.5px] font-mono font-black text-[var(--theme-color)] tracking-wider">
                            {item.year}
                          </span>
                          <span className="text-[11px] font-extrabold text-white uppercase tracking-wide">
                            {item.title}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-500 leading-relaxed pr-2">
                          {item.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          ) : (
            <div className="h-full flex items-center justify-center text-center p-12 text-zinc-600">
              <Gamepad className="w-12 h-12 text-zinc-800 mb-2 animate-bounce" />
              <span>Nenhum jogo selecionado</span>
            </div>
          )}
        </div>
      </main>

      {/* 6. FOOTER BAR (RETRO GUIDE SYMBOLS) */}
      <footer className="h-[45px] w-full border-t border-white/5 bg-black/85 flex justify-between items-center px-10 text-[8.5px] text-zinc-500 uppercase tracking-widest font-bold z-20 relative">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-mono font-black">A</span>
            Selecionar Jogo
          </span>
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center font-mono font-black">B</span>
            Voltar
          </span>
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700 flex items-center justify-center font-mono font-black px-1">▲▼</span>
            Navegar Catálogo
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-zinc-600">LordTecaRetro • v4.81 Build</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-500 font-mono">ONLINE</span>
        </div>
      </footer>

      {/* 7. FULLSCREEN ZOOM DIALOG SCREENSHOT OVERLAY */}
      <AnimatePresence>
        {zoomedScreenshot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomedScreenshot(null)}
            className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-md flex items-center justify-center p-6 cursor-zoom-out select-none"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="max-w-5xl max-h-[85vh] w-full h-full relative"
              onClick={e => e.stopPropagation()}
            >
              <img 
                src={zoomedScreenshot} 
                alt="Zoomed Screenshot" 
                className="w-full h-full object-contain rounded-2xl shadow-3xl border border-white/10"
              />
              <button
                onClick={() => setZoomedScreenshot(null)}
                className="absolute top-4 right-4 bg-black/80 hover:bg-black/100 border border-white/20 p-2.5 rounded-full text-white transition-all cursor-pointer shadow"
              >
                ✕ Fechar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 8. EMULATOR RUNTIME INTEGRATION OVERLAY */}
      <AnimatePresence>
        {emulatingGame && (
          <motion.div 
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="fixed inset-0 z-[800] bg-black overflow-hidden flex flex-col"
          >
            <EmulatorPlayer 
              system={system} 
              game={emulatingGame} 
              onClose={handleCloseEmulator} 
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 9. RETRO WORKSHOP COMPATIBILITY LAB OVERLAY */}
      <AnimatePresence>
        {labGame && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[700] bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-3xl text-zinc-100 font-sans"
            >
              {/* Header */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#E60012]/10 text-[#E60012] border border-[#E60012]/20 rounded-2xl shadow-inner">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[8px] text-[#E60012] uppercase tracking-[0.25em] font-black">Laboratório de Compatibilidade</span>
                    <h2 className="text-xl font-black uppercase tracking-tight text-white mt-0.5">Testes Avançados</h2>
                  </div>
                </div>
                
                <button 
                  onClick={handleCloseLab}
                  className="px-4 py-1.5 rounded-full border border-white/10 hover:border-white/20 hover:bg-white/5 text-[9px] font-black uppercase tracking-widest transition-colors cursor-pointer"
                >
                  Fechar
                </button>
              </div>

              {/* Lab Content Info details */}
              <div className="flex flex-col gap-4">
                <div className="bg-white/2 border border-white/5 rounded-2xl p-4 flex flex-col gap-2">
                  <span className="text-[8.5px] text-zinc-500 uppercase tracking-widest font-black">Relatório do Sistema</span>
                  <p className="text-[11px] leading-relaxed text-zinc-400">
                    O console <span className="text-white font-extrabold">{system.name}</span> é de altíssima geração (sistemas de 128 bits ou superiores) e requer aceleração de hardware dedicada para decodificação da BIOS em tempo real.
                  </p>
                  <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden mt-1 relative">
                    <div className="absolute inset-y-0 left-0 bg-amber-500 rounded-full animate-pulse" style={{ width: '85%' }} />
                  </div>
                  <div className="flex justify-between items-center text-[8px] text-amber-500 font-mono uppercase tracking-wider">
                    <span>STATUS: 85% Concluído (Fase de Otimização JIT)</span>
                    <span>v4.81</span>
                  </div>
                </div>

                {/* Specs list */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white/2 border border-white/5 rounded-xl flex flex-col gap-1">
                    <span className="text-[8px] text-zinc-500 uppercase tracking-widest">Motor de Execução</span>
                    <span className="text-[10px] text-white font-bold font-mono">D3D12 / WASM COMPILING</span>
                  </div>
                  <div className="p-3 bg-white/2 border border-white/5 rounded-xl flex flex-col gap-1">
                    <span className="text-[8px] text-zinc-500 uppercase tracking-widest">FPS Projetado</span>
                    <span className="text-[10px] text-white font-bold font-mono">60 FPS ESTÁVEL</span>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-4 flex flex-col gap-3">
                  <p className="text-[10px] leading-relaxed text-zinc-500 text-center">
                    Gostaria de ser notificado assim que o emulador nativo deste console estiver liberado no LordTecaRetro? Ative sua inscrição abaixo.
                  </p>

                  <button
                    onClick={() => handleToggleSubscribe(system.id)}
                    className={`w-full py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.25em] transition-all cursor-pointer flex items-center justify-center gap-2 border ${
                      subscribedConsoles.includes(system.id)
                        ? 'bg-emerald-600/10 border-emerald-500/50 text-emerald-400'
                        : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                    }`}
                  >
                    <Check className={`w-4 h-4 ${subscribedConsoles.includes(system.id) ? 'opacity-100 text-emerald-400' : 'opacity-0'}`} />
                    <span>
                      {subscribedConsoles.includes(system.id) ? '✓ Inscrito com Sucesso' : 'Inscrever-me para Alerta de Liberação'}
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
