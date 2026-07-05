/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { System, Game } from '../types';
import { getGameScreenshots } from '../utils/routeUtils';
import { soundEngine } from './RetroSoundEngine';
import { 
  ArrowLeft, 
  Star, 
  Calendar, 
  Users, 
  Tag, 
  Cpu, 
  Heart, 
  Play, 
  Maximize2, 
  X, 
  Sparkles,
  Tv,
  Sliders,
  Gamepad,
  Volume2,
  VolumeX,
  Power,
  RotateCcw,
  Zap,
  Info,
  Layers
} from 'lucide-react';
import { EmulatorPlayer } from './EmulatorPlayer';
import { getRichDescription } from './GamelistView';
import { GameCover } from './GameCover';
import { systemSpecsMap, getSystemThemeColor } from './SystemCarousel';
import { getLogoFileName, getLibretroSystemFolderName } from '../utils/logoResolver';

interface GameDetailViewProps {
  system: System;
  game: Game;
  onBack: () => void;
  isMuted: boolean;
  toggleMute: () => void;
  onToggleFavorite?: (systemId: string, gameTitle: string) => void;
}

const getLibretroCandidates = (title: string, systemId: string): string[] => {
  const folder = getLibretroSystemFolderName(systemId);
  if (!folder) return [];

  const candidates: string[] = [];
  const baseTitle = title.trim();

  const cleanBase = (t: string, customClean: boolean): string => {
    let s = t;
    if (customClean) {
      s = s.replace(/:/g, ' -');
    }
    s = s.replace(/\s\x27N\s/g, " 'n ");
    s = s.replace(/\s\x27n\s/g, " 'n ");
    s = s.replace(/[/*?"<>|]/g, '');
    return s;
  };

  const suffixes = [
    '',
    ' (USA)',
    ' (USA, Europe)',
    ' (Europe)',
    ' (Japan)',
    ' (World)'
  ];

  if (baseTitle.toLowerCase() === "the need for speed") {
    candidates.push("Road _ Track Presents - The Need for Speed (USA)");
    candidates.push("Need For Speed, The (USA)");
  }

  for (const sfx of suffixes) {
    candidates.push(cleanBase(baseTitle + sfx, false));
  }

  for (const sfx of suffixes) {
    candidates.push(cleanBase(baseTitle + sfx, true));
  }

  const unique = Array.from(new Set(candidates));

  return unique.map(c => 
    `https://raw.githubusercontent.com/libretro-thumbnails/${folder}/master/Named_Boxarts/${encodeURIComponent(c)}.png`
  );
};

// Custom web audio synthesized sound generator for various consoles
const playBiosBootSound = (systemId: string, isMuted: boolean) => {
  if (isMuted || typeof window === 'undefined') return;
  
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) return;
  
  try {
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    const sysLower = systemId.toLowerCase();
    
    // Auto-close AudioContext after play finishes (max sound duration is ~2.8s)
    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 3200);

    // NINTENDO ERAS (NES, SNES, N64, GBA, NDS, GBC)
    if (sysLower.includes('nes') || sysLower.includes('snes') || sysLower.includes('n64') || sysLower.includes('gba') || sysLower.includes('ds') || sysLower.includes('gameboy')) {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc1.type = 'square';
      osc2.type = 'square';
      
      osc1.frequency.setValueAtTime(987.77, now); // B5
      osc1.frequency.setValueAtTime(1318.51, now + 0.08); // E6
      
      osc2.frequency.setValueAtTime(987.77 * 1.5, now);
      osc2.frequency.setValueAtTime(1318.51 * 1.5, now + 0.08);
      
      gainNode.gain.setValueAtTime(0.04, now);
      gainNode.gain.linearRampToValueAtTime(0.04, now + 0.15);
      gainNode.gain.linearRampToValueAtTime(0.0001, now + 0.45);
      
      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.5);
      osc2.stop(now + 0.5);
    }
    // SONY PLAYSTATION ERAS (PS1, PS2, PS3)
    else if (sysLower.includes('ps') || sysLower.includes('playstation')) {
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, now);
      masterGain.gain.linearRampToValueAtTime(0.04, now + 0.8);
      masterGain.gain.linearRampToValueAtTime(0.0001, now + 2.8);
      
      const freqs = [65.41, 130.81, 196.00, 261.63, 329.63, 392.00]; // C2, C3, G3, C4, E4, G4 major chord
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const oGain = ctx.createGain();
        
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(f, now);
        osc.frequency.linearRampToValueAtTime(f * 1.006, now + 2.5); // Warm analog drift
        
        oGain.gain.setValueAtTime(0.02, now);
        oGain.gain.linearRampToValueAtTime(0.0001, now + 2.5);
        
        osc.connect(oGain);
        oGain.connect(masterGain);
        
        osc.start(now);
        osc.stop(now + 2.8);
      });
      masterGain.connect(ctx.destination);
    }
    // SEGA SYSTEMS (GENESIS, SATURN, SMS, GG)
    else if (sysLower.includes('genesis') || sysLower.includes('sega') || sysLower.includes('megadrive')) {
      const chord = [294.0, 392.0, 440.0, 587.0]; // Retro FM synth chime
      const masterGain = ctx.createGain();
      
      masterGain.gain.setValueAtTime(0.05, now);
      masterGain.gain.linearRampToValueAtTime(0.001, now + 1.2);
      
      chord.forEach((f) => {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, now);
        osc.connect(masterGain);
        osc.start(now);
        osc.stop(now + 1.2);
      });
      
      masterGain.connect(ctx.destination);
    }
    // XBOX ERAS
    else if (sysLower.includes('xbox')) {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(55.0, now); // Low drone
      osc1.frequency.linearRampToValueAtTime(65.4, now + 1.5);
      
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(110.0, now);
      
      gainNode.gain.setValueAtTime(0.05, now);
      gainNode.gain.linearRampToValueAtTime(0.08, now + 0.8);
      gainNode.gain.linearRampToValueAtTime(0.0001, now + 2.2);
      
      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 2.2);
      osc2.stop(now + 2.2);
    }
    // OTHER SYSTEMS OR ARCADE
    else {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.35);
      
      gainNode.gain.setValueAtTime(0.05, now);
      gainNode.gain.linearRampToValueAtTime(0.0001, now + 0.4);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.45);
    }
  } catch (error) {
    console.error('Failed to play synthesized BIOS boot chime:', error);
  }
};

export const GameDetailView: React.FC<GameDetailViewProps> = ({
  system,
  game,
  onBack,
  isMuted,
  toggleMute,
  onToggleFavorite,
}) => {
  const candidates = useMemo(() => {
    return getLibretroCandidates(game.title, system.id || '');
  }, [game.title, system.id]);

  const [coverSrc, setCoverSrc] = useState<string>('');
  const [fallbackAttempt, setFallbackAttempt] = useState<number>(0);

  // CRT Screen configuration state
  const [crtFilter, setCrtFilter] = useState<'normal' | 'phosphor' | 'cyberpunk' | 'monochrome'>('normal');
  const [scanlineDensity, setScanlineDensity] = useState<'subtle' | 'heavy' | 'retro-grid' | 'none'>('subtle');
  const [aspectRatio, setAspectRatio] = useState<'4:3' | '16:9'>('4:3');
  const [screenContrast, setScreenContrast] = useState<number>(115);
  const [screenStaticPulse, setScreenStaticPulse] = useState(false);

  // Interactive console boot states
  const [isBooting, setIsBooting] = useState(true);
  const [bootProgress, setBootProgress] = useState(0);
  const [bootLogs, setBootLogs] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 3D Card Hover States
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [cardRotate, setCardRotate] = useState({ x: 0, y: 0 });
  const [cardSheen, setCardSheen] = useState({ x: 50, y: 50, opacity: 0 });

  useEffect(() => {
    if (candidates.length > 0) {
      setCoverSrc(candidates[0]);
      setFallbackAttempt(1);
    } else {
      setCoverSrc(game.image || '');
      setFallbackAttempt(0);
    }
  }, [game, candidates]);

  const handleCoverError = () => {
    if (fallbackAttempt > 0 && fallbackAttempt < candidates.length) {
      setCoverSrc(candidates[fallbackAttempt]);
      setFallbackAttempt(prev => prev + 1);
    } else {
      setCoverSrc(game.image || '');
    }
  };

  const screenshots = getGameScreenshots(game.genre);
  const [activeScreenshot, setActiveScreenshot] = useState(0);
  const [zoomedScreenshot, setZoomedScreenshot] = useState<string | null>(null);
  const isFavorite = game.favorite;
  const [isPlayingMock, setIsPlayingMock] = useState(false);
  const [loadingPlay, setLoadingPlay] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  // Get active system specs and configurations
  const cleanConsoleKey = system.id.toLowerCase().trim().replace(/[\s\-_]/g, '');
  const systemSpecs = useMemo(() => {
    return systemSpecsMap[cleanConsoleKey] || systemSpecsMap[system.id.toLowerCase()] || {
      manufacturer: "Retro Hardware",
      generation: "Vintage Consola",
      cpu: "Processador Retro Emulado",
      ram: "Otimização Nativa do Núcleo",
      media: "Virtualização Digital ROM",
      releaseYear: "Era de Ouro",
      accentColor: "from-zinc-700 via-zinc-800 to-zinc-950",
      glowColor: "rgba(255, 255, 255, 0.2)",
      hardwareSummary: "Explore o catálogo completo de títulos clássicos preservados perfeitamente na sua biblioteca retro."
    };
  }, [cleanConsoleKey, system.id]);

  const themeColors = useMemo(() => getSystemThemeColor(system.id), [system.id]);

  // Handle CRT video interference animation
  const triggerScreenStatic = () => {
    setScreenStaticPulse(true);
    setTimeout(() => setScreenStaticPulse(false), 220);
  };

  const isUnsupportedGeneration = [
    'playstation2', 'ps2', 
    'playstation3', 'ps3', 
    'xbox', 'xboxclassic', 
    'xbox360', 
    'saturn', 
    'ps1', 'psx', 'playstation', 
    'arcade', 'mame',
    'neogeo', 
    'nds', 'ds', 
    'pce', 'pcengine', 'turbografx',
    '3do', 
    'dreamcast', 
    'gamecube'
  ].includes(system.id.toLowerCase().trim());

  const unsupportedUiConfig = useMemo(() => {
    const configMap: Record<string, { glowColor: string; badgeBg: string; btnBg: string; text: string }> = {
      playstation2: {
        glowColor: 'text-[#005cff]',
        badgeBg: 'from-[#005cff]/10 to-transparent border-[#005cff]/20',
        btnBg: 'from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 shadow-[0_6px_25px_rgba(0,92,255,0.35)]',
        text: 'VER DIAGNÓSTICO DO LAB'
      },
      ps2: {
        glowColor: 'text-[#005cff]',
        badgeBg: 'from-[#005cff]/10 to-transparent border-[#005cff]/20',
        btnBg: 'from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 shadow-[0_6px_25px_rgba(0,92,255,0.35)]',
        text: 'VER DIAGNÓSTICO DO LAB'
      },
      playstation3: {
        glowColor: 'text-[#e60012]',
        badgeBg: 'from-[#e60012]/10 to-transparent border-[#e60012]/20',
        btnBg: 'from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 shadow-[0_6px_25px_rgba(230,0,18,0.35)]',
        text: 'VER DIAGNÓSTICO DO LAB'
      },
      ps3: {
        glowColor: 'text-[#e60012]',
        badgeBg: 'from-[#e60012]/10 to-transparent border-[#e60012]/20',
        btnBg: 'from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 shadow-[0_6px_25px_rgba(230,0,18,0.35)]',
        text: 'VER DIAGNÓSTICO DO LAB'
      },
      xbox: {
        glowColor: 'text-[#107c10]',
        badgeBg: 'from-[#107c10]/10 to-transparent border-[#107c10]/20',
        btnBg: 'from-green-700 to-green-900 hover:from-green-600 hover:to-green-800 shadow-[0_6px_25px_rgba(16,124,16,0.35)]',
        text: 'VER DIAGNÓSTICO DO LAB'
      },
      xboxclassic: {
        glowColor: 'text-[#107c10]',
        badgeBg: 'from-[#107c10]/10 to-transparent border-[#107c10]/20',
        btnBg: 'from-green-700 to-green-900 hover:from-green-600 hover:to-green-800 shadow-[0_6px_25px_rgba(16,124,16,0.35)]',
        text: 'VER DIAGNÓSTICO DO LAB'
      },
      xbox360: {
        glowColor: 'text-[#5a9e1e]',
        badgeBg: 'from-[#5a9e1e]/10 to-transparent border-[#5a9e1e]/20',
        btnBg: 'from-emerald-600 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 shadow-[0_6px_25px_rgba(90,158,30,0.35)]',
        text: 'VER DIAGNÓSTICO DO LAB'
      }
    };
    return configMap[system.id.toLowerCase()] || {
      glowColor: 'text-amber-400',
      badgeBg: 'from-amber-500/10 to-transparent border-amber-500/20',
      btnBg: 'from-amber-600 to-orange-700 hover:brightness-110 shadow-[0_6px_25px_rgba(245,158,11,0.3)]',
      text: 'VER DIAGNÓSTICO DO LAB'
    };
  }, [system.id]);

  // Simulated retro console BIOS bootstrap sequence
  useEffect(() => {
    let bootTimer: NodeJS.Timeout;
    let logIndex = 0;
    
    const logsList = [
      "RETROHUB BIOS V4.02 - DETECTING SYSTEM CORES...",
      `TARGET ARCHITECTURE: ${systemSpecs.manufacturer.toUpperCase()} PORTAL ENGINE`,
      `SYNCHRONIZING CPU CLOCK: ${systemSpecs.cpu.toUpperCase()}`,
      `ALLOCATING EMULATED HEAP: ${systemSpecs.ram.toUpperCase()} [OK]`,
      `INTEGRATION ROM BLOCK: DECOMPRESSING "${game.title.toUpperCase()}"`,
      `MAPPING INPUT CONTROLLER LAYOUT... USB-GPAD DRIVERS READY`,
      `LAUNCH SEQUENCE ARMED. BOOT INTEGRITY CHECK SECURE.`
    ];

    const printNextLog = () => {
      if (logIndex < logsList.length) {
        setBootLogs(prev => [...prev, logsList[logIndex]]);
        setBootProgress(Math.floor(((logIndex + 1) / logsList.length) * 100));
        logIndex++;
        bootTimer = setTimeout(printNextLog, 280);
      } else {
        bootTimer = setTimeout(() => {
          setIsBooting(false);
          // Play a small sound when boot completes
          soundEngine.playSwap(system.id);
        }, 350);
      }
    };

    // Trigger bios sound on startup
    playBiosBootSound(system.id, isMuted);
    printNextLog();

    return () => clearTimeout(bootTimer);
  }, [system.id, game.title, systemSpecs]);

  // Canvas background ambient fluid particle loop
  useEffect(() => {
    if (!canvasRef.current || isBooting) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle generator
    const particleCount = 28;
    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
    }> = [];

    const hexToRgb = (hexStr: string) => {
      const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
      const fullHex = hexStr.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 59, g: 130, b: 246 };
    };

    const rgbColor = hexToRgb(themeColors.hex);

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 80 + 40,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.5) * 0.4,
        opacity: Math.random() * 0.12 + 0.04
      });
    }

    const drawParticles = () => {
      ctx.clearRect(0, 0, width, height);

      // System background grid lines
      ctx.strokeStyle = `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 0.025)`;
      ctx.lineWidth = 1;
      const gridSize = 60;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;

        // Wrap particles
        if (p.x < -100) p.x = width + 100;
        if (p.x > width + 100) p.x = -100;
        if (p.y < -100) p.y = height + 100;
        if (p.y > height + 100) p.y = -100;

        // Draw glowing particle
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        gradient.addColorStop(0, `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, ${p.opacity})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(drawParticles);
    };

    drawParticles();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isBooting, themeColors.hex]);

  // 3D Card mouse move hander for physical tilt effect
  const handleMouseMove3D = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const rotateY = ((x / rect.width) - 0.5) * 24; // Range -12 to 12 deg
    const rotateX = -(((y / rect.height) - 0.5) * 24); // Range -12 to 12 deg
    
    setCardRotate({ x: rotateX, y: rotateY });
    setCardSheen({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.28
    });
  };

  const handleMouseLeave3D = () => {
    setCardRotate({ x: 0, y: 0 });
    setCardSheen(prev => ({ ...prev, opacity: 0 }));
  };

  const handleBack = () => {
    soundEngine.playBack();
    onBack();
  };

  const handleToggleFavorite = () => {
    soundEngine.playToggle();
    if (onToggleFavorite) {
      onToggleFavorite(system.id, game.title);
    }
  };

  const handlePlayMock = () => {
    soundEngine.playSelect();
    
    if (system.isDemo) {
      setIsDemoModalOpen(true);
      return;
    }

    setLoadingPlay(true);
    setTimeout(() => {
      setLoadingPlay(false);
      setIsPlayingMock(true);
    }, 1200);
  };

  const handleClosePlayMock = () => {
    soundEngine.playBack();
    setIsPlayingMock(false);
  };

  // Skip boot system diagnostic manually
  const handleSkipBoot = () => {
    // Attempt play boot sound if missed due to browser autoplay restriction
    playBiosBootSound(system.id, isMuted);
    setIsBooting(false);
  };

  // Keybindings
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent): void => {
      if (isBooting) {
        if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
          handleSkipBoot();
        }
        return;
      }
      if (isPlayingMock) {
        if (e.key === 'Escape') handleClosePlayMock();
        return;
      }
      if (zoomedScreenshot) {
        if (e.key === 'Escape') setZoomedScreenshot(null);
        return;
      }

      if (e.key === 'Backspace' || e.key === 'Escape') {
        handleBack();
      } else if (e.key === 'Enter') {
        handlePlayMock();
      } else if (e.key.toLowerCase() === 'f') {
        handleToggleFavorite();
      } else if (e.key === 'ArrowRight') {
        setActiveScreenshot(prev => (prev + 1) % screenshots.length);
        soundEngine.playMove();
        triggerScreenStatic();
      } else if (e.key === 'ArrowLeft') {
        setActiveScreenshot(prev => (prev - 1 + screenshots.length) % screenshots.length);
        soundEngine.playMove();
        triggerScreenStatic();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isBooting, isPlayingMock, zoomedScreenshot, game.favorite, screenshots]);

  return (
    <div 
      id="game-detail-parent" 
      className="relative w-full h-screen font-sans text-white overflow-hidden bg-zinc-950 flex flex-col justify-between select-none"
    >
      {/* Background canvas for high-performance visualizer */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 z-0 pointer-events-none w-full h-full"
      />

      {/* Blurred secondary environmental glow */}
      <div className="absolute inset-0 z-0 h-full w-full pointer-events-none overflow-hidden">
        <div 
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[350px] blur-[150px] opacity-20 rounded-full transition-all duration-700"
          style={{ backgroundColor: themeColors.hex }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#070709]/80 to-[#070709]" />
      </div>

      {/* BIOS Startup Animation Screen (Nostalgic Console Initializer) */}
      <AnimatePresence>
        {isBooting && (
          <motion.div 
            key="retro-bios-boot"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.03, filter: 'blur(10px)' }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center p-6 text-left"
          >
            {/* Vintage CRT overlay effect for the entire boot sequence */}
            <div className="absolute inset-0 pointer-events-none z-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,6px_100%] opacity-85" />
            
            {/* Center interactive box container */}
            <div className="max-w-xl w-full flex flex-col gap-8 relative z-20 font-mono">
              {/* Spinning coin / system emblem */}
              <div className="flex items-center gap-4 border-b border-zinc-800 pb-5">
                <div 
                  className="w-12 h-12 rounded-full border-2 border-dashed animate-spin flex items-center justify-center text-sm font-retro font-black shrink-0"
                  style={{
                    borderColor: themeColors.hex,
                    color: themeColors.hex,
                    boxShadow: `0 0 15px ${themeColors.hex}25`
                  }}
                >
                  *
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-white tracking-widest uppercase">
                    {system.name} EMULATION BIOS V3.12
                  </h2>
                  <p className="text-[10px] text-zinc-500 mt-0.5">LORDTECA RETRO DECA COMPILATION SECURE CORE</p>
                </div>
              </div>

              {/* Memory logs diagnostics */}
              <div className="bg-zinc-950/95 border border-zinc-900 rounded-xl p-5 min-h-[220px] flex flex-col gap-1.5 text-[11px] leading-relaxed text-zinc-400">
                {bootLogs.map((log, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-2"
                  >
                    <span style={{ color: themeColors.hex }}>&gt;</span>
                    <span className="truncate">{log}</span>
                  </motion.div>
                ))}
                {bootLogs.length < 7 && (
                  <span className="animate-pulse text-zinc-500 font-extrabold block mt-1">_</span>
                )}
              </div>

              {/* Diagnostic Progress indicator */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-[10px] text-zinc-500">
                  <span>LOADING EXPANSION ROM SECTORS</span>
                  <span className="font-bold text-white">{bootProgress}%</span>
                </div>
                <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-300"
                    style={{ 
                      width: `${bootProgress}%`,
                      backgroundColor: themeColors.hex,
                      boxShadow: `0 0 10px ${themeColors.hex}`
                    }}
                  />
                </div>
              </div>

              {/* Skip action button */}
              <button 
                onClick={handleSkipBoot}
                className="mx-auto mt-4 px-6 py-2 rounded-lg bg-zinc-900/80 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-[10px] text-zinc-400 hover:text-white transition cursor-pointer flex items-center gap-2 uppercase tracking-widest font-bold"
              >
                <Zap className="w-3.5 h-3.5" /> Pular Sequência de Boot (ESC)
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Premium Interactive Cockpit Header */}
      <header id="detail-header" className="relative z-10 h-20 flex items-center justify-between px-6 sm:px-10 border-b border-white/5 bg-[#09090c]/50 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <button
            id="btn-back-gamelist"
            onClick={handleBack}
            className="group flex items-center gap-2 text-[10px] sm:text-xs font-retro tracking-widest text-white bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 hover:border-white/20 rounded-xl px-4 py-2.5 shadow-md active:translate-y-[1px] transition-all cursor-pointer font-black shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-zinc-400 group-hover:-translate-x-0.5 transition-transform" />
            <span>PAINEL</span>
          </button>
          
          <div className="h-5 w-px bg-white/10 ml-1" />
          
          <img 
            id="retro-console-logo-detail"
            src={`/logos/${getLogoFileName(system.id)}.png`} 
            alt={system.name} 
            className="h-8 w-auto object-contain ml-2 filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] hover:scale-105 transition-transform" 
            onError={(e) => { e.currentTarget.style.display = 'none'; }} 
          />

          <div className="h-4 w-px bg-white/15 ml-1 hidden sm:block" />
          
          <div className="items-center gap-2 hidden sm:flex">
            <span className="text-[10px] uppercase font-bold text-zinc-500 font-mono tracking-wider">{system.name}</span>
            <span className="text-zinc-700">/</span>
            <span className="text-[10px] text-zinc-400 font-black tracking-widest uppercase truncate max-w-[200px]" style={{ color: themeColors.hex }}>
              {game.title}
            </span>
          </div>
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleMute}
            className="p-2.5 rounded-xl bg-zinc-900/80 border border-white/10 hover:bg-zinc-800 hover:text-white text-zinc-400 transition cursor-pointer flex items-center justify-center"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            id="btn-detail-fav"
            onClick={handleToggleFavorite}
            className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-center ${
              isFavorite 
                ? 'bg-red-500/15 border-red-500/30 text-red-500 hover:bg-red-500/25' 
                : 'bg-zinc-900/80 border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500' : ''}`} />
          </button>
        </div>
      </header>

      {/* Main Interactive Cockpit Grid */}
      <main className="relative z-10 flex-1 w-full max-w-[1400px] mx-auto px-6 py-6 overflow-y-auto flex flex-col justify-start gap-6">
        
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SECTION (Col-span-4): Physical Holographic Box Art & System Specs */}
          <div className="xl:col-span-4 flex flex-col gap-6 w-full">
            
            {/* Holographic 3D Interactive Cover Art Card */}
            <div 
              ref={cardRef}
              onMouseMove={handleMouseMove3D}
              onMouseLeave={handleMouseLeave3D}
              style={{
                transform: `perspective(1000px) rotateX(${cardRotate.x}deg) rotateY(${cardRotate.y}deg) scale3d(1.01, 1.01, 1.01)`,
                transition: 'transform 0.1s ease-out',
                borderColor: `${themeColors.hex}25`,
                boxShadow: `0 35px 80px -25px rgba(0,0,0,0.95), 0 0 50px ${themeColors.hex}08`
              }}
              className={`${
                ['snes', 'supernintendo', 'sfc', 'superfamicom'].includes(system.id.toLowerCase().trim())
                  ? "w-full aspect-[4/3] sm:aspect-[1.33/1]" // Horizontal (4:3)
                  : ['ps1', 'psx', 'playstation', 'saturn', 'sega-cd', 'dreamcast', '3do', 'nds', 'ds'].includes(system.id.toLowerCase().trim())
                  ? "w-full aspect-[1/1] max-w-[340px] mx-auto" // Square (1:1)
                  : "w-full aspect-[3/4] max-w-[310px] mx-auto" // Vertical (3:4)
              } bg-gradient-to-br from-zinc-900/90 to-zinc-950/95 border rounded-2xl p-3 relative overflow-hidden flex flex-col justify-between cursor-pointer group`}
            >
              {/* Dynamic Laser Light Sweep Sheen */}
              <div 
                className="absolute inset-0 pointer-events-none z-30 transition-opacity duration-300"
                style={{
                  background: `radial-gradient(circle at ${cardSheen.x}% ${cardSheen.y}%, rgba(255,255,255,${cardSheen.opacity}) 0%, transparent 60%)`
                }}
              />

              {/* Curved Retro TV glass glare mask */}
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.06)_0%,transparent_50%),radial-gradient(circle_at_center,transparent_45%,rgba(0,0,0,0.50)_100%)] z-20 rounded-xl" />

              {/* Inner Showcase Border */}
              <div className="flex-1 w-full bg-zinc-950/90 rounded-xl overflow-hidden relative flex items-center justify-center p-3.5 border border-white/5">
                <div className="relative w-full h-full flex items-center justify-center z-10 transition-transform duration-300 group-hover:scale-[1.04]">
                  <GameCover 
                    game={game} 
                    systemId={system.id} 
                    className="max-h-full max-w-full object-contain rounded shadow-[0_15px_30px_rgba(0,0,0,0.6)]" 
                  />
                </div>
              </div>
              
              {/* LED Power Node Indicator */}
              <div className="h-6 mt-2 flex items-center justify-between px-2 text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-black">
                <span>RECEPTÁCULO CARTUCHO</span>
                <div className="flex items-center gap-1.5">
                  <span>STATUS: CARREGADO</span>
                  <div 
                    className="w-1.5 h-1.5 rounded-full animate-pulse" 
                    style={{
                      backgroundColor: themeColors.hex,
                      boxShadow: `0 0 10px ${themeColors.hex}`
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Dynamic Circuit Trace Specs blueprint Decal */}
            <div className="bg-[#0b0b0e]/95 border border-white/5 rounded-2xl p-5 space-y-4 shadow-xl relative overflow-hidden">
              {/* Blueprint vector background decorations */}
              <div className="absolute top-0 right-0 w-32 h-32 border-b border-l border-dashed border-white/5 pointer-events-none flex flex-col items-end p-2 text-[8px] font-mono text-zinc-700">
                <span>Trace: WASM-X28</span>
                <span>Port: 3000</span>
              </div>

              <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                <Cpu className="w-4 h-4 text-zinc-400" style={{ color: themeColors.hex }} />
                <h3 className="text-[10px] font-retro text-zinc-400 uppercase tracking-widest">ESPECIFICAÇÕES DE HARDWARE</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-xs leading-normal">
                <div className="bg-zinc-950/50 p-3 rounded-xl border border-white/5">
                  <span className="text-[8px] text-zinc-500 font-mono uppercase tracking-widest block">Ano</span>
                  <span className="font-extrabold text-zinc-200 mt-1 block flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    {game.year}
                  </span>
                </div>
                
                <div className="bg-zinc-950/50 p-3 rounded-xl border border-white/5">
                  <span className="text-[8px] text-zinc-500 font-mono uppercase tracking-widest block">Gênero</span>
                  <span className="font-extrabold mt-1 block flex items-center gap-1.5 truncate text-zinc-200">
                    <Tag className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    <span className="truncate">{game.genre}</span>
                  </span>
                </div>

                <div className="bg-zinc-950/50 p-3 rounded-xl border border-white/5 col-span-2">
                  <span className="text-[8px] text-zinc-500 font-mono uppercase tracking-widest block">Processador Emulador</span>
                  <span className="font-bold text-zinc-300 font-mono mt-1 block text-[10px] truncate">
                    {systemSpecs.cpu}
                  </span>
                </div>

                <div className="bg-zinc-950/50 p-3 rounded-xl border border-white/5">
                  <span className="text-[8px] text-zinc-500 font-mono uppercase tracking-widest block">Alocação de RAM</span>
                  <span className="font-bold text-zinc-300 font-mono mt-1 block text-[10px] truncate">
                    {systemSpecs.ram}
                  </span>
                </div>

                <div className="bg-zinc-950/50 p-3 rounded-xl border border-white/5">
                  <span className="text-[8px] text-zinc-500 font-mono uppercase tracking-widest block">Mídia</span>
                  <span className="font-bold text-zinc-300 font-mono mt-1 block text-[10px] truncate">
                    {systemSpecs.media}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 text-[9px] text-zinc-500 font-mono flex justify-between items-center">
                <span>ESTIMATIVA FPS:</span>
                <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                  60 FPS ESTÁVEIS
                </span>
              </div>
            </div>

          </div>

          {/* RIGHT SECTION (Col-span-8): CRT Screen, Game Info & Media Cartridge Rack */}
          <div className="xl:col-span-8 flex flex-col gap-6 w-full">
            
            {/* Title Block Banner */}
            <div className="bg-gradient-to-r from-zinc-900/40 via-zinc-900/10 to-transparent p-5 rounded-2xl border-l-4" style={{ borderColor: themeColors.hex }}>
              <span className="text-[9px] font-retro uppercase tracking-widest bg-white/5 px-2.5 py-1 rounded-md text-zinc-400">
                PLATAFORMA {system.name.toUpperCase()}
              </span>
              <h1 id="detail-title" className="text-3xl sm:text-5xl font-display font-black tracking-tight text-white mt-3 leading-none uppercase">
                {game.title}
              </h1>
              <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed mt-3 max-w-2xl font-medium">
                {getRichDescription(game.title, system.name)}
              </p>
              
              <div className="flex gap-1.5 mt-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-3.5 h-3.5 ${i < game.rating ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-800'}`} 
                  />
                ))}
              </div>
            </div>

            {/* CENTRAL Retro Curved CRT Arcade Cabinet Monitor */}
            <div className="bg-[#0b0b0f] border border-zinc-800/80 rounded-3xl p-4 sm:p-5 shadow-2xl relative overflow-hidden flex flex-col gap-4">
              
              {/* Cabinet Wood/Carbon texture finish background */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] bg-[size:12px_12px]" />

              {/* Monitor bezel top indicator */}
              <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 font-black tracking-widest px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: themeColors.hex }} />
                  <span>CRT FEED: IN-GAME EMULATION</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="bg-zinc-900 px-2 py-0.5 rounded border border-white/5">FILTER: {crtFilter.toUpperCase()}</span>
                  <span className="bg-zinc-900 px-2 py-0.5 rounded border border-white/5">RATIO: {aspectRatio}</span>
                </div>
              </div>

              {/* Main TV Screen frame */}
              <div 
                className="relative bg-zinc-950 rounded-2xl border-4 border-[#121216] overflow-hidden shadow-inner flex items-center justify-center transition-all duration-300"
                style={{
                  aspectRatio: aspectRatio === '4:3' ? '4/3' : '16/9',
                  maxWidth: aspectRatio === '4:3' ? '700px' : '1000px',
                  margin: '0 auto',
                  width: '100%',
                  filter: `contrast(${screenContrast}%) brightness(105%)`,
                }}
              >
                {/* Active scanline visual representation */}
                <div 
                  className={`absolute inset-0 pointer-events-none z-30 transition-opacity duration-300 ${
                    scanlineDensity === 'none' ? 'opacity-0' : 'opacity-85'
                  } ${
                    scanlineDensity === 'retro-grid' 
                      ? 'bg-[radial-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.3)_50%),linear-gradient(90deg,rgba(255,0,0,0.05),rgba(0,255,0,0.02),rgba(0,0,255,0.05))] bg-[length:100%_4px,4px_100%]'
                      : scanlineDensity === 'heavy'
                      ? 'bg-[linear-gradient(rgba(0,0,0,0.45)_50%,rgba(255,255,255,0.05)_50%)] bg-[length:100%_4px]'
                      : 'bg-[linear-gradient(rgba(0,0,0,0.25)_50%,rgba(255,255,255,0.02)_50%)] bg-[length:100%_4px]'
                  }`} 
                />

                {/* CRT filter coloring presets overlays */}
                <div className={`absolute inset-0 pointer-events-none z-20 mix-blend-color-dodge ${
                  crtFilter === 'phosphor' 
                    ? 'bg-emerald-500/5' 
                    : crtFilter === 'cyberpunk' 
                    ? 'bg-purple-500/5' 
                    : crtFilter === 'monochrome' 
                    ? 'bg-amber-500/10 grayscale contrast-125' 
                    : 'bg-transparent'
                }`} />

                {/* Simulated television screen flickering & interference bar */}
                <div className="absolute inset-0 pointer-events-none z-25 bg-[linear-gradient(to_bottom,rgba(255,255,255,0)_0%,rgba(255,255,255,0.02)_48%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.02)_52%,rgba(255,255,255,0)_100%)] bg-[length:100%_400px] animate-[slide_12s_linear_infinite]" />

                {/* Quick Static Pulse overlay */}
                {screenStaticPulse && (
                  <div className="absolute inset-0 bg-zinc-950 z-40 opacity-75 pointer-events-none bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] bg-[size:4px_4px]" />
                )}

                {/* Active Screenshot Display */}
                <img
                  src={screenshots[activeScreenshot]}
                  alt={`${game.title} preview`}
                  className="w-full h-full object-cover select-none relative z-10 transition-transform duration-500 scale-[1.02]"
                />

                {/* Maximize expand helper button */}
                <button
                  onClick={() => {
                    soundEngine.playToggle();
                    setZoomedScreenshot(screenshots[activeScreenshot]);
                  }}
                  className="absolute right-4 bottom-4 z-40 p-2.5 rounded-xl bg-black/60 hover:bg-white/10 text-white border border-white/5 transition hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>

              {/* Interactive TV Hardware Deck Controllers Panel */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-zinc-950 border border-white/5 p-4 rounded-2xl text-[10px] font-mono text-zinc-400">
                {/* Ratio Toggler */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-zinc-600 font-extrabold uppercase">1. FORMATO CRT</span>
                  <div className="flex bg-zinc-900 border border-white/5 rounded-lg p-1">
                    <button 
                      onClick={() => { soundEngine.playMove(); setAspectRatio('4:3'); }}
                      className={`flex-1 py-1 rounded font-bold uppercase transition text-center cursor-pointer ${aspectRatio === '4:3' ? 'bg-[#15151b] text-white border border-white/5 font-extrabold' : 'text-zinc-500'}`}
                    >
                      4:3 Clássico
                    </button>
                    <button 
                      onClick={() => { soundEngine.playMove(); setAspectRatio('16:9'); }}
                      className={`flex-1 py-1 rounded font-bold uppercase transition text-center cursor-pointer ${aspectRatio === '16:9' ? 'bg-[#15151b] text-white border border-white/5 font-extrabold' : 'text-zinc-500'}`}
                    >
                      16:9 Wide
                    </button>
                  </div>
                </div>

                {/* Filter Toggler */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-zinc-600 font-extrabold uppercase">2. PALETA VÍDEO</span>
                  <select 
                    value={crtFilter}
                    onChange={(e) => { soundEngine.playMove(); setCrtFilter(e.target.value as any); }}
                    className="bg-zinc-900 border border-white/5 rounded-lg py-1 px-2.5 font-bold text-white focus:outline-none cursor-pointer h-7"
                  >
                    <option value="normal">Normal RGB</option>
                    <option value="phosphor">Fósforo Verde</option>
                    <option value="cyberpunk">Neon Cyberpunk</option>
                    <option value="monochrome">Nostalgia Ambar</option>
                  </select>
                </div>

                {/* Scanline Density */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-zinc-600 font-extrabold uppercase">3. LINHAS DE RASTREAMENTO</span>
                  <select 
                    value={scanlineDensity}
                    onChange={(e) => { soundEngine.playMove(); setScanlineDensity(e.target.value as any); }}
                    className="bg-zinc-900 border border-white/5 rounded-lg py-1 px-2.5 font-bold text-white focus:outline-none cursor-pointer h-7"
                  >
                    <option value="subtle">Sutil (60%)</option>
                    <option value="heavy">Pesado (85%)</option>
                    <option value="retro-grid">Pixel Grid CRT</option>
                    <option value="none">Desligado</option>
                  </select>
                </div>

                {/* Contrast slider */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-zinc-600 font-extrabold uppercase">
                    <span>4. BRILHO/CONTRASTE</span>
                    <span className="text-white">{screenContrast}%</span>
                  </div>
                  <input 
                    type="range"
                    min="90"
                    max="140"
                    value={screenContrast}
                    onChange={(e) => setScreenContrast(Number(e.target.value))}
                    className="w-full accent-emerald-500 bg-zinc-900 rounded-lg cursor-pointer h-7 border border-white/5 px-2"
                  />
                </div>
              </div>

              {/* TACTILE GAME CARTRIDGE / CD JEWEL CASE SHELF */}
              <div className="flex flex-col gap-3 mt-1.5">
                <span className="text-[10px] font-retro text-zinc-500 uppercase tracking-widest block font-bold px-1">
                  PRATELEIRA DE CARTUCHOS DO PREVIEW (CLIQUE PARA SLOTAR NO MONITOR)
                </span>
                
                {/* 3D Angled Shelf row */}
                <div className="grid grid-cols-3 gap-5 pt-3 pb-2 px-2 bg-gradient-to-b from-[#131317]/50 to-[#09090c]/80 border border-white/5 rounded-2xl relative shadow-inner">
                  {screenshots.map((shot, idx) => {
                    const isSonyEra = system.id.toLowerCase().includes('ps') || system.id.toLowerCase().includes('playstation');
                    const isActive = idx === activeScreenshot;
                    
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          if (!isActive) {
                            soundEngine.playSwap(system.id);
                            setActiveScreenshot(idx);
                            triggerScreenStatic();
                          }
                        }}
                        style={{
                          transform: isActive 
                            ? 'translateY(-8px) scale(1.02) perspective(400px) rotateX(10deg)' 
                            : 'perspective(400px) rotateX(15deg)',
                          transition: 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)'
                        }}
                        className={`relative aspect-[16/10] rounded-xl overflow-hidden cursor-pointer border group flex flex-col justify-end p-2.5 ${
                          isActive 
                            ? 'border-emerald-400 ring-4 ring-emerald-500/20 shadow-[0_12px_28px_rgba(16,185,129,0.3)]' 
                            : 'border-white/5 opacity-55 hover:opacity-100 hover:border-white/20 hover:-translate-y-2 hover:shadow-lg'
                        }`}
                      >
                        {/* 3D cartridge shell reflection sweep highlight */}
                        <div className="absolute inset-0 pointer-events-none z-10 bg-gradient-to-tr from-transparent via-white/5 to-white/10" />

                        {/* Screenshot image wrapped as cartridge cover labels */}
                        <img 
                          src={shot} 
                          alt="Prevew" 
                          className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-300 group-hover:scale-105" 
                        />

                        {/* Vignette background gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-1" />

                        {/* Stylized custom cartridge labels details */}
                        <div className="relative z-10 flex justify-between items-center text-[8px] font-mono font-bold uppercase tracking-wider text-zinc-300">
                          <span>FASE {idx + 1}</span>
                          {isSonyEra ? (
                            <span className="bg-zinc-950/80 px-1.5 py-0.5 rounded text-[7px] border border-white/10 font-extrabold text-[#005cff]">CD-ROM</span>
                          ) : (
                            <span className="bg-zinc-950/80 px-1.5 py-0.5 rounded text-[7px] border border-white/10 font-extrabold text-red-500">CARTUCHO</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* High-Energy Chunky Glowing Launch Action Bar */}
            <div className="flex flex-col sm:flex-row gap-5 items-center justify-between p-6 bg-gradient-to-r from-zinc-950/90 to-[#0e0e13] rounded-3xl border border-white/5 shadow-2xl">
              <div className="text-center sm:text-left">
                <span className="px-3 py-1 text-[8px] font-retro uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md tracking-wider">
                  SISTEMA DE EMULAÇÃO DE ALTA DEFINIÇÃO
                </span>
                <div className="text-[11px] text-zinc-400 font-mono mt-3">
                  {isUnsupportedGeneration ? (
                    <span>ROM identificada na fila de preservação digital.</span>
                  ) : (
                    <span>Pronto para injetar cartucho seguro ROM. Clique para dar BOOT.</span>
                  )}
                </div>
              </div>

              {/* Colossal retro power switch launch button */}
              <button
                id="btn-launch-game-detail"
                onClick={handlePlayMock}
                disabled={loadingPlay}
                style={{
                  boxShadow: `0 8px 30px ${themeColors.hex}30, inset 0 2px 4px rgba(255,255,255,0.3)`
                }}
                className={`w-full sm:w-auto px-10 py-5 bg-gradient-to-r ${themeColors.btnClass} text-white font-retro text-[11px] font-black uppercase tracking-widest rounded-2xl border-t border-white/20 active:translate-y-[2px] transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 shrink-0 select-none`}
              >
                {loadingPlay ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>EMULANDO NÚCLEO...</span>
                  </>
                ) : (
                  <>
                    <Power className="w-4 h-4 text-white fill-white animate-pulse" />
                    <span>➔ {isUnsupportedGeneration ? 'OTIMIZAR COMPATIBILIDADE' : 'DAR BOOT NO CARTUCHO'}</span>
                  </>
                )}
              </button>
            </div>

          </div>

        </div>

      </main>

      {/* Symmetrical gamer tactile footer HUD guide */}
      <footer className="relative z-10 w-full bg-[#070709] border-t border-white/5 py-4 px-10 flex flex-col sm:flex-row justify-between items-center gap-4 text-zinc-500 text-[11px] font-mono">
        <div>
          LORDTECA RETRO DIGITAL COMPILATION SYSTEM © 2026. ALL ROMS RUN AT MAX NATIVE PERFORMANCE.
        </div>
        <div className="flex items-center gap-4 text-[9px] font-retro text-zinc-600">
          <span className="flex items-center gap-1"><span className="bg-zinc-900 text-zinc-400 px-1.5 py-0.5 rounded text-[8px] border border-white/5">←→</span> SLIDE IMAGENS</span>
          <span className="flex items-center gap-1"><span className="bg-zinc-900 text-zinc-400 px-1.5 py-0.5 rounded text-[8px] border border-white/5">F</span> FAVORITAR</span>
          <span className="flex items-center gap-1"><span className="bg-zinc-900 text-zinc-400 px-1.5 py-0.5 rounded text-[8px] border border-white/5">BACKSPACE</span> VOLTAR</span>
        </div>
      </footer>

      {/* Screen Zoom Modal */}
      <AnimatePresence>
        {zoomedScreenshot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomedScreenshot(null)}
            className="fixed inset-0 bg-black/95 z-[3000] flex items-center justify-center p-4 cursor-zoom-out backdrop-blur-md"
          >
            <button
              onClick={() => setZoomedScreenshot(null)}
              className="absolute top-6 right-6 p-3 rounded-full bg-black/60 border border-white/10 text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <motion.img
              initial={{ scale: 0.94 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.94 }}
              src={zoomedScreenshot || undefined}
              alt="Zoomed Screenshot"
              className="max-h-[85vh] max-w-[90vw] object-contain rounded-2xl border border-white/10 shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Simulated Gameplay Screen Playback Loop Emulator Player */}
      <AnimatePresence>
        {isPlayingMock && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="fixed inset-0 bg-zinc-950/98 z-[2500] flex flex-col justify-between p-2 md:p-6"
          >
            <EmulatorPlayer
              system={system}
              game={game}
              onClose={handleClosePlayMock}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ilustrativo / Demo System Dialog Notice */}
      <AnimatePresence>
        {isDemoModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-md z-[3000] flex items-center justify-center p-4 select-none"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-gradient-to-b from-[#1c1c28] to-[#0d0d12] border-2 border-yellow-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.9)] text-center space-y-6"
            >
              {/* Retro Warning Icon */}
              <div className="w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 flex items-center justify-center mx-auto">
                <Gamepad className="w-8 h-8 animate-bounce" />
              </div>

              <div className="space-y-2">
                <span className="px-3 py-1 text-[8px] font-retro uppercase bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-md tracking-wider">
                  CONSOLE DE VITRINE
                </span>
                <h3 className="font-display font-black text-xl text-white tracking-tight uppercase">
                  {system.name}
                </h3>
                <p className="text-xs text-zinc-400 font-mono">
                  Console em modo de demonstração técnica
                </p>
              </div>

              <div className="p-4 bg-yellow-500/5 rounded-2xl border border-yellow-500/10 text-xs text-left space-y-3 font-sans">
                <p className="text-yellow-400 font-bold flex items-center gap-1.5 leading-none">
                  <Info className="w-3.5 h-3.5" />
                  Por que este console não abre?
                </p>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Os consoles que <strong>não possuem arquivos de ROM disponíveis para transmissão imediata</strong> foram mantidos na página como <strong>vitrine ilustrativa</strong> para preservação histórica.
                </p>
                <p className="text-zinc-400 text-[11px] leading-relaxed border-t border-white/5 pt-2.5">
                  Tendo público e recursos no futuro, novos núcleos e acervos de jogos serão adicionados diretamente ao nosso sistema de emulação em nuvem!
                </p>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() => {
                    soundEngine.playBack();
                    setIsDemoModalOpen(false);
                  }}
                  className="px-6 py-3 bg-zinc-850 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-white/5 rounded-xl text-xs font-retro uppercase font-black tracking-widest cursor-pointer transition active:translate-y-[2px]"
                >
                  ➔ Voltar ao Acervo
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
