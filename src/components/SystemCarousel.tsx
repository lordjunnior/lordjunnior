/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { System } from '../types';
import { soundEngine } from './RetroSoundEngine';
import { Gamepad2, Cpu, Calendar, Archive, Search, ChevronLeft, ChevronRight, Play, Heart, Clock, Trophy, Star } from 'lucide-react';
import { GameCover } from './GameCover';
import { getLogoFileName } from '../utils/logoResolver';
import { getGameSlug } from '../utils/routeUtils';

interface SystemCarouselProps {
  systems: System[];
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  onSelectSystem: (system: System) => void;
}

export interface SystemTechSpecs {
  manufacturer: string;
  generation: string;
  cpu: string;
  ram: string;
  media: string;
  releaseYear: string;
  accentColor: string;
  glowColor: string;
  hardwareSummary: string;
  consolePhotoUrl?: string;
  backdropUrl?: string;
}

export const getConsoleSEOHeader = (systemId: string, systemName: string): string => {
  const id = (systemId || '').toLowerCase().trim();
  if (id.includes('dreamcast')) {
    return "Lendas de 128-Bits: O Legado e Segredos do Dreamcast";
  }
  if (id.includes('snes') || id.includes('supernintendo')) {
    return "O Rei dos 16-Bits: A Era de Ouro do Super Nintendo";
  }
  if (id.includes('nes') || (id.includes('nintendo') && !id.includes('64') && !id.includes('ds') && !id.includes('gameboy') && !id.includes('cube'))) {
    return "8-Bits Imortais: A Revolução que Salvou a Indústria de Videogames";
  }
  if (id.includes('genesis') || id.includes('megadrive')) {
    return "Velocidade Blast Processing: O Legado Desafiador do Mega Drive";
  }
  if (id.includes('ps2') || id.includes('playstation2')) {
    return "O Titã Insuperável: A Dinastia Lendária do PlayStation 2";
  }
  if (id.includes('n64') || id.includes('nintendo64')) {
    return "Pioneirismo em 3D: A Revolução Tridimensional do Nintendo 64";
  }
  return `Máquina do Tempo: O Legado e Segredos do ${systemName}`;
};

// O DICIONÁRIO COMPLETO DE ESPECIFICAÇÕES TÉCNICAS E HISTÓRICAS
export const systemSpecsMap: Record<string, SystemTechSpecs> = {
  nes: {
    manufacturer: "Nintendo",
    generation: "8-Bits (3ª Geração)",
    cpu: "Ricoh 2A03 8-bit @ 1.79 MHz",
    ram: "2 KB RAM principal",
    media: "Cartuchos (NES-Cart)",
    releaseYear: "1983 (Japão) / 1985 (EUA)",
    accentColor: "from-red-600 via-rose-700 to-zinc-900",
    glowColor: "rgba(239, 68, 68, 0.5)",
    hardwareSummary: "O lendário console 8-bits da Nintendo que recuperou a indústria de games em 1985 e imortalizou Mario, Zelda e Metroid.",
    consolePhotoUrl: "/logos/consolenes.png",
    backdropUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200"
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
    hardwareSummary: "Clássico supremo do design 16-bits. Consolidou lendários RPGs tridimensionais, efeitos de rotação Mode 7 e som estéreo de altíssima qualidade.",
    consolePhotoUrl: "/logos/consolesnes.png",
    backdropUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200"
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
    hardwareSummary: "Pioneiro absoluto na navegação e câmeras 3D fluidas, analógico preciso por rotação física e disputas cooperativas de 4 jogadores.",
    consolePhotoUrl: "/logos/consolen64.png",
    backdropUrl: "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?q=80&w=1200"
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
    hardwareSummary: "O portátil cinza eterno de Gunpei Yokoi. Popularizou o clássico cult Tetris e a franquia multibilionária de monstros colecionáveis Pokémon.",
    consolePhotoUrl: "/logos/consolegameboy.png",
    backdropUrl: "https://images.unsplash.com/photo-1531525645387-7f14be1bdbbd?q=80&w=1200"
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
    hardwareSummary: "O portátil cinza eterno de Gunpei Yokoi. Popularizou o clássico cult Tetris e a franquia multibilionária de monstros colecionáveis Pokémon.",
    consolePhotoUrl: "/logos/consolegameboy.png",
    backdropUrl: "https://images.unsplash.com/photo-1531525645387-7f14be1bdbbd?q=80&w=1200"
  },
  gbc: {
    manufacturer: "Nintendo",
    generation: "8-Bits Portátil Colorido",
    cpu: "Sharp LR35902 8-bit @ 8.388 MHz",
    ram: "32 KB RAM principal + 16 KB VRAM",
    media: "Cartucho Game Boy Color",
    releaseYear: "1998",
    accentColor: "from-pink-600 via-fuchsia-700 to-zinc-950",
    glowColor: "rgba(219, 39, 119, 0.4)",
    hardwareSummary: "O sucessor vibrante em cores do console de bolso eterno. Equipado com processador de velocidade dobrada, infravermelho e tela LCD colorida.",
    consolePhotoUrl: "/logos/consolegbc.png",
    backdropUrl: "https://images.unsplash.com/photo-1531525645387-7f14be1bdbbd?q=80&w=1200"
  },
  gameboycolor: {
    manufacturer: "Nintendo",
    generation: "8-Bits Portátil Colorido",
    cpu: "Sharp LR35902 8-bit @ 8.388 MHz",
    ram: "32 KB RAM principal + 16 KB VRAM",
    media: "Cartucho Game Boy Color",
    releaseYear: "1998",
    accentColor: "from-pink-600 via-fuchsia-700 to-zinc-950",
    glowColor: "rgba(219, 39, 119, 0.4)",
    hardwareSummary: "O sucessor vibrante em cores do console de bolso eterno. Equipado com processador de velocidade dobrada, infravermelho e tela LCD colorida.",
    consolePhotoUrl: "/logos/consolegbc.png",
    backdropUrl: "https://images.unsplash.com/photo-1531525645387-7f14be1bdbbd?q=80&w=1200"
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
    hardwareSummary: "Poderoso hardware 32-bits que funciona como um SNES ultra-portátil aperfeiçoado. Apresentou ports divinos e visuais pixel art impecáveis.",
    consolePhotoUrl: "/logos/consolegba.png",
    backdropUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200"
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
    hardwareSummary: "Inovadora máquina portátil que redefiniu a interatividade através de sua tela de toque (Stylus), displays duplos e comandos por voz.",
    consolePhotoUrl: "/logos/consoleds.png",
    backdropUrl: "https://images.unsplash.com/photo-1551103782-8ab07afd45c1?q=80&w=1200"
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
    hardwareSummary: "Adotou a postura rebelde da SEGA para desafiar o monopólio mercantil da Nintendo, munido de processamento ultra veloz 'Blast Processing'.",
    consolePhotoUrl: "/logos/consolemega.png",
    backdropUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200"
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
    hardwareSummary: "Sucesso titânico em solo brasileiro sob os cuidados da Tectoy. Lar de jogos de alta velocidade do Sonic e trilhas em modulação FM excelentes.",
    consolePhotoUrl: "/logos/consolemega.png",
    backdropUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200"
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
    hardwareSummary: "Sucesso titânico em solo brasileiro sob os cuidados da Tectoy. Lar de jogos de alta velocidade do Sonic e trilhas em modulação FM excelentes.",
    consolePhotoUrl: "/logos/consolemega.png",
    backdropUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200"
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
    hardwareSummary: "O carismático competidor de 8-bits da SEGA, detentor de hardware robusto capaz de rendering colorido e vibrante muito elogiado.",
    consolePhotoUrl: "/logos/consolemaster.png",
    backdropUrl: "https://images.unsplash.com/photo-1627856013091-fed6e4e30025?q=80&w=1200"
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
    hardwareSummary: "Console que consagrou clássicos absolutos como Alex Kidd de forma brilhante, tornando-se sinônimo de videogame nostálgico.",
    consolePhotoUrl: "/logos/consolemaster.png",
    backdropUrl: "https://images.unsplash.com/photo-1627856013091-fed6e4e30025?q=80&w=1200"
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
    hardwareSummary: "O console que destronou os antigos gigantes dos cartuchos, inaugurando com louvor a era moderna do 3D acelerado e sons em CD.",
    consolePhotoUrl: "/logos/consoleplaystation.png",
    backdropUrl: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=1200"
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
    hardwareSummary: "Estreia fenomenal da Sony consagrando as franquias Crash Bandicoot, Gran Turismo, Final Fantasy VII e Resident Evil.",
    consolePhotoUrl: "/logos/consoleplaystation.png",
    backdropUrl: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=1200"
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
    hardwareSummary: "O pioneiro incontestável que instalou a febre dos videogames nos lares mundiais por intermédio das clássicas alavancas pretas.",
    consolePhotoUrl: "/logos/consoleatari.png",
    backdropUrl: "https://images.unsplash.com/photo-1595708684082-a173bb3a06c5?q=80&w=1200"
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
    hardwareSummary: "O suprassumo das lanchonetes e shoppings antigos. Entregava poder gráfico insuperável focado em sprites massivos e ação cooperativa estéreo.",
    consolePhotoUrl: "/logos/consolearcade.png",
    backdropUrl: "https://images.unsplash.com/photo-1566241477600-ac026ad43874?q=80&w=1200"
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
    hardwareSummary: "Hardware premium multimédia de alto custo focado em gráficos poligonais avançados e vídeos interativos full-motion (FMV).",
    consolePhotoUrl: "/logos/console3do.png",
    backdropUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200"
  },
  dreamcast: {
    manufacturer: "Sega",
    generation: "128-Bits (6ª Geração)",
    cpu: "Hitachi SH-4 RISC @ 200 MHz",
    ram: "16 MB RAM + 8 MB VRAM + 2 MB Sound RAM",
    media: "GD-ROM de 1.2 GB",
    releaseYear: "1998",
    accentColor: "from-orange-500 via-rose-600 to-zinc-950",
    glowColor: "rgba(249, 115, 22, 0.5)",
    hardwareSummary: "O canto do cisne revolucionário da SEGA. Trouxe gráficos 3D espetaculares à frente do seu tempo, acesso pioneiro à internet integrado via modem e o icônico VMU com tela nos controles.",
    consolePhotoUrl: "/logos/consoledreamcast.png",
    backdropUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200"
  },
  gamecube: {
    manufacturer: "Nintendo",
    generation: "128-Bits (6ª Geração)",
    cpu: "IBM PowerPC 'Gekko' @ 485 MHz",
    ram: "24 MB RAM principal + 16 MB A-RAM",
    media: "MiniDVD de 8cm (1.5 GB)",
    releaseYear: "2001",
    accentColor: "from-indigo-600 via-purple-700 to-zinc-950",
    glowColor: "rgba(124, 58, 237, 0.5)",
    hardwareSummary: "O lendário console em formato de cubo da Nintendo. Conhecido por seus controles ergonômicos memoráveis, hardware compacto super poderoso e mídias mini-disco exclusivas.",
    consolePhotoUrl: "/logos/consolegc.png",
    backdropUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200"
  },
  gc: {
    manufacturer: "Nintendo",
    generation: "128-Bits (6ª Geração)",
    cpu: "IBM PowerPC 'Gekko' @ 485 MHz",
    ram: "24 MB RAM principal + 16 MB A-RAM",
    media: "MiniDVD de 8cm (1.5 GB)",
    releaseYear: "2001",
    accentColor: "from-indigo-600 via-purple-700 to-zinc-950",
    glowColor: "rgba(124, 58, 237, 0.5)",
    hardwareSummary: "O lendário console em formato de cubo da Nintendo. Conhecido por seus controles ergonômicos memoráveis, hardware compacto super poderoso e mídias mini-disco exclusivas.",
    consolePhotoUrl: "/logos/consolegc.png",
    backdropUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200"
  },
  neogeo: {
    manufacturer: "SNK",
    generation: "16-Bits Premium (4ª Geração)",
    cpu: "Motorola 68000 @ 12 MHz + Zilog Z80 @ 4 MHz",
    ram: "64 KB Principal + 68 KB VRAM + 2 KB Sound RAM",
    media: "MVS Cartridges (Max 330 Mb / Giga Power)",
    releaseYear: "1990",
    accentColor: "from-yellow-450 via-amber-600 to-zinc-950",
    glowColor: "rgba(217, 119, 6, 0.45)",
    hardwareSummary: "A lendária potência original dos arcades e locadoras nos lares da SNK. Com poder bidimensional supremo e um sistema inovador de multi-cartuchos lendários.",
    consolePhotoUrl: "/logos/neogeomvs.png",
    backdropUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200"
  },
  pce: {
    manufacturer: "NEC",
    generation: "8/16-Bits (4ª Geração)",
    cpu: "Hudson Soft HuC6280 8-bit @ 7.16 MHz",
    ram: "8 KB Principal + 64 KB VRAM",
    media: "HuCard / CD-ROM² (De Alta Densidade)",
    releaseYear: "1987",
    accentColor: "from-orange-600 via-red-750 to-zinc-950",
    glowColor: "rgba(224, 78, 0, 0.45)",
    hardwareSummary: "O extraordinário concorrente japonês da NEC de tamanho compacto ultra-refinado. Primeiro console do mundo a receber acessório de CD-ROM com áudio digital estéreo de altíssima fidelidade.",
    consolePhotoUrl: "/logos/consoleturbografx16.png",
    backdropUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200"
  },
  pcengine: {
    manufacturer: "NEC",
    generation: "8/16-Bits (4ª Geração)",
    cpu: "Hudson Soft HuC6280 8-bit @ 7.16 MHz",
    ram: "8 KB Principal + 64 KB VRAM",
    media: "HuCard / CD-ROM² (De Alta Densidade)",
    releaseYear: "1987",
    accentColor: "from-orange-600 via-red-750 to-zinc-950",
    glowColor: "rgba(224, 78, 0, 0.45)",
    hardwareSummary: "O extraordinário concorrente japonês da NEC de tamanho compacto ultra-refinado. Primeiro console do mundo a receber acessório de CD-ROM com áudio digital estéreo de altíssima fidelidade.",
    consolePhotoUrl: "/logos/consoleturbografx16.png",
    backdropUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200"
  },
  playstation2: {
    manufacturer: "Sony",
    generation: "128-Bits (6ª Geração)",
    cpu: "Emotion Engine @ 294.9 MHz",
    ram: "32 MB RDRAM principal + 4 MB VRAM",
    media: "CD-ROM / DVD-ROM",
    releaseYear: "2000",
    accentColor: "from-blue-700 via-[#003087] to-zinc-950",
    glowColor: "rgba(0, 48, 135, 0.5)",
    hardwareSummary: "O console de mesa mais vendido de todos os tempos. Revolucionou as mídias com o leitor de DVD e consagrou clássicos imponentes que definiram a história dos videogames.",
    consolePhotoUrl: "/logos/consoleplaystation2.png",
    backdropUrl: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=1200"
  },
  ps2: {
    manufacturer: "Sony",
    generation: "128-Bits (6ª Geração)",
    cpu: "Emotion Engine @ 294.9 MHz",
    ram: "32 MB RDRAM principal + 4 MB VRAM",
    media: "CD-ROM / DVD-ROM",
    releaseYear: "2000",
    accentColor: "from-blue-700 via-[#003087] to-zinc-950",
    glowColor: "rgba(0, 48, 135, 0.5)",
    hardwareSummary: "O console de mesa mais vendido de todos os tempos. Revolucionou as mídias com o leitor de DVD e consagrou clássicos imponentes que definiram a história dos videogames.",
    consolePhotoUrl: "/logos/consoleplaystation2.png",
    backdropUrl: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=1200"
  },
  playstation3: {
    manufacturer: "Sony",
    generation: "7ª Geração",
    cpu: "Cell Broadband Engine @ 3.2 GHz",
    ram: "256 MB XDR principal + 256 MB GDDR3 VRAM",
    media: "Blu-ray Disc / DVD",
    releaseYear: "2006",
    accentColor: "from-zinc-700 via-[#1f1f1f] to-zinc-950",
    glowColor: "rgba(30, 30, 30, 0.5)",
    hardwareSummary: "Potente inovadora arquitetura Cell de processamento de alto nível paralelo. Trouxe a incrível era HD, suporte a mídias Blu-ray de alta densidade e modo online pela PSN.",
    consolePhotoUrl: "/logos/consolePS3.png",
    backdropUrl: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=1200"
  },
  ps3: {
    manufacturer: "Sony",
    generation: "7ª Geração",
    cpu: "Cell Broadband Engine @ 3.2 GHz",
    ram: "256 MB XDR principal + 256 MB GDDR3 VRAM",
    media: "Blu-ray Disc / DVD",
    releaseYear: "2006",
    accentColor: "from-zinc-700 via-[#1f1f1f] to-zinc-950",
    glowColor: "rgba(30, 30, 30, 0.5)",
    hardwareSummary: "Potente inovadora arquitetura Cell de processamento de alto nível paralelo. Trouxe a incrível era HD, suporte a mídias Blu-ray de alta densidade e modo online pela PSN.",
    consolePhotoUrl: "/logos/consolePS3.png",
    backdropUrl: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=1200"
  },
  xbox: {
    manufacturer: "Microsoft",
    generation: "128-Bits (6ª Geração)",
    cpu: "Intel Pentium III Coppermine @ 733 MHz",
    ram: "64 MB DDR SDRAM @ 200 MHz",
    media: "DVD-ROM / Disco Rígido 8GB",
    releaseYear: "2001",
    accentColor: "from-green-800 via-[#107C10] to-zinc-950",
    glowColor: "rgba(16, 124, 16, 0.4)",
    hardwareSummary: "A entrada triunfante da Microsoft nos videogames. Inovou ao incluir um disco rígido interno de fábrica, placa de rede Ethernet nativa e a lendária rede Xbox Live que revolucionou o modo online.",
    consolePhotoUrl: "/logos/consolexbox.png",
    backdropUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200"
  },
  xboxclassic: {
    manufacturer: "Microsoft",
    generation: "128-Bits (6ª Geração)",
    cpu: "Intel Pentium III Coppermine @ 733 MHz",
    ram: "64 MB DDR SDRAM @ 200 MHz",
    media: "DVD-ROM / Disco Rígido 8GB",
    releaseYear: "2001",
    accentColor: "from-green-800 via-[#107C10] to-zinc-950",
    glowColor: "rgba(16, 124, 16, 0.4)",
    hardwareSummary: "A entrada triunfante da Microsoft nos videogames. Inovou ao incluir um disco rígido interno de fábrica, placa de rede Ethernet nativa e a lendária rede Xbox Live que revolucionou o modo online.",
    consolePhotoUrl: "/logos/consolexbox.png",
    backdropUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200"
  },
  xbox360: {
    manufacturer: "Microsoft",
    generation: "7ª Geração",
    cpu: "IBM Xenon Tri-Core @ 3.2 GHz",
    ram: "512 MB GDDR3 compartilhada",
    media: "DVD-DL / Disco Rígido",
    releaseYear: "2005",
    accentColor: "from-emerald-650 via-[#107C10] to-zinc-950",
    glowColor: "rgba(16, 124, 16, 0.45)",
    hardwareSummary: "Um marco histórico da sétima geração que consolidou o multiplayer competitivo, o sistema de Conquistas (Achievements), o Xbox Live Arcade e introduziu o revolucionário sensor de movimentos Kinect.",
    consolePhotoUrl: "/logos/consolexbox360.png",
    backdropUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200"
  },
  saturn: {
    manufacturer: "Sega",
    generation: "32-Bits (5ª Geração)",
    cpu: "2x Hitachi SH-2 32-bit RISC @ 28.6 MHz",
    ram: "2 MB RAM principal + 1.56 MB VRAM",
    media: "CD-ROM",
    releaseYear: "1994 (Japão) / 1995 (EUA)",
    accentColor: "from-sky-600 via-indigo-700 to-zinc-950",
    glowColor: "rgba(56, 189, 248, 0.45)",
    hardwareSummary: "O poderoso console de processadores duplos da SEGA. Lar de lendários ports de arcade em 2D perfeitos e joias clássicas 3D cultuadas até hoje.",
    consolePhotoUrl: "/logos/consolesaturn.png",
    backdropUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200"
  }
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
    xbox: 'xbox',
    xbox360: 'xbox360',
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
    pcengine: '/logos/consoleturbografx16.png',
    collections: '/logos/Collections.png',
    playlist: '/logos/Collections.png',
  };
  return map[cleanId] || `/logos/${getLogoFileName(cleanId)}.png`;
};

const getCentralCharacterGroupUrl = (id: string): string => {
  const cleanId = id.toLowerCase().trim();
  const map: Record<string, string> = {
    nes: '/logos/nes-nintendinho-console.png',
    snes: '/logos/snes-console-retro.png',
    supernintendo: '/logos/snes-console-retro.png',
    n64: '/logos/n64-nintendo-64-console (2).png',
    gb: '/logos/gameboy-console.png.png',
    gameboy: '/logos/gameboy-console.png.png',
    gbc: '/logos/gameboy-collor-console.png',
    gameboycolor: '/logos/gameboy-collor-console.png',
    gba: '/logos/gameboy-advanced-console.png',
    nds: '/logos/nintendo-ds-console.png',
    genesis: '/logos/genesis-mega-drive-console.png',
    segaMD: '/logos/genesis-mega-drive-console.png',
    megadrive: '/logos/genesis-mega-drive-console.png',
    mastersystem: '/logos/master-system-sms-console.png',
    sms: '/logos/master-system-sms-console.png',
    playstation: '/logos/playstation-1-ps1-console.png',
    psx: '/logos/playstation-1-ps1-console.png',
    ps1: '/logos/playstation-1-ps1-console.png',
    playstation2: '/logos/playstation-2-ps2-console.png',
    ps2: '/logos/playstation-2-ps2-console.png',
    playstation3: '/logos/playstation-3-ps3-console.png',
    ps3: '/logos/playstation-3-ps3-console.png',
    xbox: '/logos/xbox-classico-console.png',
    xboxclassic: '/logos/xbox-classico-console.png',
    xbox360: '/logos/xbox-360-console.png',
    atari: '/logos/atari-console-retro.png',
    arcade: '/logos/arcade-jogos-classicos.png',
    '3do': '/logos/3do-console-retro.png',
    saturn: '/logos/sega-saturn-console.png',
    dreamcast: '/logos/dreamcast-console-retro.png',
    gamecube: '/logos/gamecube-console-retro.png',
    gc: '/logos/gamecube-console-retro.png',
    neogeo: '/logos/neogeo-mvs-arcade-retro.png',
    pce: '/logos/pc-engine-turbografx-console.png',
    turbografx: '/logos/pc-engine-turbografx-console.png',
    pcengine: '/logos/pc-engine-turbografx-console.png',
  };
  return map[cleanId] || `/logos/${getLogoFileName(cleanId)}.png`;
};

const CentralConsoleLogo: React.FC<{ system: System }> = ({ system }) => {
  const [src, setSrc] = useState<string>('');
  const [attempt, setAttempt] = useState<number>(0);

  useEffect(() => {
    setSrc(getCentralCharacterGroupUrl(system.id));
    setAttempt(0);
  }, [system.id]);

  const handleError = () => {
    if (attempt === 0) {
      // First fallback: classic system brand logo (e.g. snes.png, playstation3.png)
      const officialLogo = `/logos/${getLogoFileName(system.id)}.png`;
      setSrc(officialLogo);
      setAttempt(1);
    } else if (attempt === 1) {
      // Second fallback: direct lowercase naming
      const rawLogo = `/logos/${system.id.toLowerCase()}.png`;
      setSrc(rawLogo);
      setAttempt(2);
    } else {
      // Last resort: stop loading images and let text render beautifully
      setSrc('');
      setAttempt(3);
    }
  };

  if (attempt >= 3 || !src) {
    return (
      <div className="flex flex-col items-center justify-center p-6 border border-zinc-700 rounded-2xl bg-black/60 backdrop-blur-md">
        <span className="text-xl font-mono tracking-[0.3em] font-black text-zinc-300 uppercase">
          {system.shortName || system.name}
        </span>
      </div>
    );
  }

  return (
    <motion.img
      key={`central-logo-${system.id}-${src}`}
      src={src}
      alt={system.name}
      animate={{ 
        y: [0, -8, 0], 
      }}
      transition={{
        repeat: Infinity,
        duration: 5,
        ease: "easeInOut"
      }}
      style={{
        filter: "drop-shadow(0 15px 20px rgba(0,0,0,0.85)) drop-shadow(0 0 25px rgba(255,255,255,0.15))"
      }}
      className="max-h-full w-auto max-w-[340px] md:max-w-[500px] lg:max-w-[650px] xl:max-w-[750px] object-contain transition-all duration-300"
      onError={handleError}
      referrerPolicy="no-referrer"
    />
  );
};

const CardConsoleLogo: React.FC<{ system: System; isSelected: boolean }> = ({ system, isSelected }) => {
  const [src, setSrc] = useState<string>('');
  const [attempt, setAttempt] = useState<number>(0);

  useEffect(() => {
    // Primary: Physical console illustration
    setSrc(getCentralConsoleLogoUrl(system.id));
    setAttempt(0);
  }, [system.id]);

  const handleError = () => {
    if (attempt === 0) {
      // Fallback: Official text/brand logo (e.g. playstation3.png)
      setSrc(`/logos/${getLogoFileName(system.id)}.png`);
      setAttempt(1);
    } else {
      // Final fallback: hide and render text
      setSrc('');
      setAttempt(2);
    }
  };

  if (!src) {
    return (
      <span className={`text-[10px] md:text-xs font-black uppercase tracking-wider text-zinc-500 font-retro transition-opacity duration-300 ${
        isSelected ? 'opacity-80' : 'opacity-30'
      }`}>
        {system.shortName || system.name}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={system.name}
      className={`h-[40px] md:h-[65px] w-auto max-w-[100px] md:max-w-[155px] object-contain transition-all duration-500 filter ${
        isSelected
          ? 'brightness-110 drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)] scale-110'
          : 'brightness-65 opacity-65 drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)] group-hover:brightness-90 group-hover:opacity-90'
      }`}
      onError={handleError}
      referrerPolicy="no-referrer"
    />
  );
};

const SafeConsoleLogo: React.FC<{ system: System; isCompact?: boolean }> = ({ system, isCompact }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [system.id]);

  if (hasError) {
    return (
      <span className="font-retro text-[10px] text-zinc-400 uppercase tracking-widest font-bold drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">
        {system.shortName || system.name}
      </span>
    );
  }

  return (
    <img
      src={`/logos/${getLogoFileName(system.id)}.png`}
      alt={system.name}
      className={`h-7 max-w-[130px] object-contain filter transition-all duration-300 ${
        isCompact 
          ? 'opacity-40 brightness-125 saturate-50 drop-shadow-[0_0_8px_rgba(255,255,255,0.25)] hover:opacity-75' 
          : 'opacity-100 drop-shadow-[0_0_18px_rgba(255,255,255,0.65)] brightness-115 scale-105'
      }`}
      onError={() => setHasError(true)}
    />
  );
};

export interface SystemThemeColor {
  hex: string;
  glow: string;
  textClass: string;
  btnClass: string;
  borderClass: string;
}

export const systemThemeColors: Record<string, SystemThemeColor> = {
  nes: { hex: '#ff0055', glow: 'rgba(255, 0, 85, 0.45)', textClass: 'text-rose-450', btnClass: 'from-rose-600 to-rose-800', borderClass: 'border-rose-500/30' },
  snes: { hex: '#7c59e0', glow: 'rgba(124, 89, 224, 0.45)', textClass: 'text-indigo-400', btnClass: 'from-indigo-600 to-indigo-800', borderClass: 'border-indigo-500/30' },
  n64: { hex: '#3b82f6', glow: 'rgba(59, 130, 246, 0.45)', textClass: 'text-blue-400', btnClass: 'from-blue-600 to-blue-800', borderClass: 'border-blue-500/30' },
  gb: { hex: '#8b956d', glow: 'rgba(139, 149, 109, 0.45)', textClass: 'text-lime-500', btnClass: 'from-lime-600 to-lime-800', borderClass: 'border-lime-500/30' },
  gameboy: { hex: '#8b956d', glow: 'rgba(139, 149, 109, 0.45)', textClass: 'text-lime-500', btnClass: 'from-lime-600 to-lime-800', borderClass: 'border-lime-500/30' },
  gbc: { hex: '#ec4899', glow: 'rgba(236, 72, 153, 0.45)', textClass: 'text-pink-400', btnClass: 'from-pink-600 to-pink-800', borderClass: 'border-pink-500/30' },
  gba: { hex: '#a855f7', glow: 'rgba(168, 85, 247, 0.45)', textClass: 'text-purple-400', btnClass: 'from-purple-600 to-purple-800', borderClass: 'border-purple-500/30' },
  sms: { hex: '#3b82f6', glow: 'rgba(59, 130, 246, 0.45)', textClass: 'text-blue-400', btnClass: 'from-blue-600 to-blue-800', borderClass: 'border-blue-500/30' },
  genesis: { hex: '#ef4444', glow: 'rgba(239, 44, 68, 0.45)', textClass: 'text-red-450', btnClass: 'from-red-600 to-red-800', borderClass: 'border-red-500/30' },
  megadrive: { hex: '#ef4444', glow: 'rgba(239, 44, 68, 0.45)', textClass: 'text-red-450', btnClass: 'from-red-600 to-red-800', borderClass: 'border-red-500/30' },
  saturn: { hex: '#3b82f6', glow: 'rgba(59, 130, 246, 0.45)', textClass: 'text-sky-400', btnClass: 'from-sky-600 to-sky-800', borderClass: 'border-sky-500/30' },
  ps1: { hex: '#8ba2c9', glow: 'rgba(139, 162, 201, 0.45)', textClass: 'text-slate-300', btnClass: 'from-slate-600 to-slate-800', borderClass: 'border-slate-500/30' },
  playstation: { hex: '#8ba2c9', glow: 'rgba(139, 162, 201, 0.45)', textClass: 'text-slate-300', btnClass: 'from-slate-600 to-slate-800', borderClass: 'border-slate-500/30' },
  psx: { hex: '#8ba2c9', glow: 'rgba(139, 162, 201, 0.45)', textClass: 'text-slate-300', btnClass: 'from-slate-600 to-slate-800', borderClass: 'border-slate-500/30' },
  ps2: { hex: '#00A4FF', glow: 'rgba(0, 164, 255, 0.45)', textClass: 'text-blue-400', btnClass: 'from-blue-600 to-blue-800', borderClass: 'border-blue-500/30' },
  playstation2: { hex: '#00A4FF', glow: 'rgba(0, 164, 255, 0.45)', textClass: 'text-blue-400', btnClass: 'from-blue-600 to-blue-800', borderClass: 'border-blue-500/30' },
  ps3: { hex: '#e60012', glow: 'rgba(230, 0, 18, 0.45)', textClass: 'text-red-500', btnClass: 'from-red-600 to-red-800', borderClass: 'border-red-500/30' },
  playstation3: { hex: '#e60012', glow: 'rgba(230, 0, 18, 0.45)', textClass: 'text-red-500', btnClass: 'from-red-600 to-red-800', borderClass: 'border-red-500/30' },
  xbox: { hex: '#107c10', glow: 'rgba(16, 124, 16, 0.45)', textClass: 'text-green-500', btnClass: 'from-green-600 to-green-800', borderClass: 'border-green-500/30' },
  xboxclassic: { hex: '#107c10', glow: 'rgba(16, 124, 16, 0.45)', textClass: 'text-green-500', btnClass: 'from-green-600 to-green-800', borderClass: 'border-green-500/30' },
  xbox360: { hex: '#5a9e1e', glow: 'rgba(90, 158, 30, 0.45)', textClass: 'text-emerald-400', btnClass: 'from-emerald-600 to-emerald-800', borderClass: 'border-emerald-500/30' },
  atari: { hex: '#ff5500', glow: 'rgba(255, 85, 0, 0.45)', textClass: 'text-orange-500', btnClass: 'from-orange-600 to-orange-800', borderClass: 'border-orange-500/30' },
  arcade: { hex: '#00ffcc', glow: 'rgba(0, 255, 204, 0.45)', textClass: 'text-teal-400', btnClass: 'from-teal-600 to-teal-800', borderClass: 'border-teal-500/30' },
  neogeo: { hex: '#ffaa00', glow: 'rgba(255, 170, 0, 0.45)', textClass: 'text-amber-500', btnClass: 'from-amber-600 to-amber-800', borderClass: 'border-amber-500/30' },
  nds: { hex: '#e11d48', glow: 'rgba(225, 29, 72, 0.45)', textClass: 'text-rose-500', btnClass: 'from-rose-600 to-rose-800', borderClass: 'border-rose-500/30' },
  pce: { hex: '#ea580c', glow: 'rgba(234, 88, 12, 0.45)', textClass: 'text-orange-550', btnClass: 'from-orange-600 to-orange-800', borderClass: 'border-orange-500/30' },
  pcengine: { hex: '#ea580c', glow: 'rgba(234, 88, 12, 0.45)', textClass: 'text-orange-550', btnClass: 'from-orange-600 to-orange-800', borderClass: 'border-orange-500/30' },
  '3do': { hex: '#2563eb', glow: 'rgba(37, 99, 235, 0.45)', textClass: 'text-blue-500', btnClass: 'from-blue-600 to-blue-800', borderClass: 'border-blue-500/30' },
  dreamcast: { hex: '#ff6a00', glow: 'rgba(255, 106, 0, 0.45)', textClass: 'text-orange-400', btnClass: 'from-orange-600 to-orange-800', borderClass: 'border-orange-500/30' },
  gamecube: { hex: '#6f52ed', glow: 'rgba(111, 82, 237, 0.45)', textClass: 'text-indigo-400', btnClass: 'from-indigo-600 to-indigo-800', borderClass: 'border-indigo-500/30' },
  gc: { hex: '#6f52ed', glow: 'rgba(111, 82, 237, 0.45)', textClass: 'text-indigo-400', btnClass: 'from-indigo-600 to-indigo-800', borderClass: 'border-indigo-500/30' },
};

export const getSystemThemeColor = (id: string): SystemThemeColor => {
  const normalizedId = id.toLowerCase();
  return systemThemeColors[normalizedId] || {
    hex: '#3b82f6',
    glow: 'rgba(59, 130, 246, 0.45)',
    textClass: 'text-blue-400',
    btnClass: 'from-blue-600 to-blue-800',
    borderClass: 'border-blue-500/30'
  };
};

export const SystemCarousel: React.FC<SystemCarouselProps> = ({
  systems,
  activeIndex,
  setActiveIndex,
  onSelectSystem
}) => {
  const total = systems.length;
  if (!systems || total === 0) return null;

  // State: Console Search and Active Category Tab
  const [consoleSearch, setConsoleSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'classics' | 'golden' | 'next-gen'>('all');

  // Track window width for dynamic edge-to-edge 3D radius calculation
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Gesture drag state variables for 3D Carousel rotation
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const isSystemSupported = (systemId: string): boolean => {
    const cleanId = systemId.toLowerCase().trim();
    return !['ps2', 'playstation2', 'ps3', 'playstation3', 'xbox', 'xboxclassic', 'xbox360'].includes(cleanId);
  };

  const getSystemStatus = (systemId: string) => {
    const cleanId = systemId.toLowerCase().trim();
    if (['ps2', 'playstation2'].includes(cleanId)) {
      return { label: 'Web Beta em Pesquisa', color: '#ff9800', isPlayable: false };
    }
    if (['ps3', 'playstation3'].includes(cleanId)) {
      return { label: 'WASM em Otimização', color: '#ea580c', isPlayable: false };
    }
    if (['xbox', 'xboxclassic'].includes(cleanId)) {
      return { label: 'Kernel em Desenvolvimento', color: '#a855f7', isPlayable: false };
    }
    if (['xbox360'].includes(cleanId)) {
      return { label: 'Streaming em Pesquisa', color: '#ec4899', isPlayable: false };
    }
    return { label: 'Disponível', color: '#10b981', isPlayable: true };
  };

  // Filter systems list based on category and search
  const filteredSystems = systems.map((sys, originalIdx) => ({ sys, originalIdx })).filter(({ sys }) => {
    const matchesSearch = sys.name.toLowerCase().includes(consoleSearch.toLowerCase()) || 
                          sys.manufacturer?.toLowerCase().includes(consoleSearch.toLowerCase());
    if (!matchesSearch) return false;
    
    const id = sys.id.toLowerCase().trim();
    if (activeCategory === 'classics') {
      return ['nes', 'snes', 'sms', 'genesis', 'megadrive', 'gb', 'gbc', 'atari'].includes(id);
    }
    if (activeCategory === 'golden') {
      return ['n64', 'gba', 'ps1', 'playstation', 'saturn', 'neogeo', 'nds', 'arcade'].includes(id);
    }
    if (activeCategory === 'next-gen') {
      return ['ps2', 'playstation2', 'ps3', 'playstation3', 'xbox', 'xboxclassic', 'xbox360'].includes(id);
    }
    return true; // 'all'
  });

  const filteredActiveIndex = filteredSystems.findIndex(f => f.originalIdx === activeIndex);

  // Maintain virtual infinite index for continuous smooth rotational animation without jumps
  const [virtualActiveIndex, setVirtualActiveIndex] = useState(() => {
    return filteredActiveIndex !== -1 ? filteredActiveIndex : 0;
  });

  useEffect(() => {
    if (filteredActiveIndex === -1) return;
    const len = filteredSystems.length;
    if (len === 0) return;

    setVirtualActiveIndex(prev => {
      // Find the shortest distance in modular arithmetic using the most up-to-date prev state
      const currentMod = ((prev % len) + len) % len;
      let diff = filteredActiveIndex - currentMod;

      if (diff > len / 2) {
        diff -= len;
      } else if (diff < -len / 2) {
        diff += len;
      }
      return prev + diff;
    });
  }, [filteredActiveIndex, filteredSystems.length]);

  const handlePrev = () => {
    if (filteredSystems.length === 0) return;
    const prevFilteredIdx = (filteredActiveIndex - 1 + filteredSystems.length) % filteredSystems.length;
    const targetIdx = filteredSystems[prevFilteredIdx].originalIdx;
    setActiveIndex(targetIdx);
    soundEngine.playMove();
  };

  const handleNext = () => {
    if (filteredSystems.length === 0) return;
    const nextFilteredIdx = (filteredActiveIndex + 1) % filteredSystems.length;
    const targetIdx = filteredSystems[nextFilteredIdx].originalIdx;
    setActiveIndex(targetIdx);
    soundEngine.playMove();
  };

  const handleSelect = () => {
    if (systems[activeIndex]) {
      soundEngine.playSelect();
      onSelectSystem(systems[activeIndex]);
    }
  };

  const handleDragStart = (clientX: number) => {
    setDragStartX(clientX);
    setIsDragging(true);
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging || dragStartX === null) return;
    const deltaX = clientX - dragStartX;
    if (deltaX > 45) {
      handlePrev();
      setDragStartX(clientX); // shift anchor
    } else if (deltaX < -45) {
      handleNext();
      setDragStartX(clientX); // shift anchor
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDragStartX(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent): void => {
      // Ignore arrow key bindings when focused inside search input
      if (document.activeElement?.tagName === 'INPUT') return;

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
  }, [activeIndex, filteredActiveIndex, filteredSystems]);

  const activeSystem = systems[activeIndex];
  const activeColor = getSystemThemeColor(activeSystem.id);
  const consoleId = getLogoFileName(activeSystem.id);
  
  // Resgata os metadados do dicionário robusto
  const specs = systemSpecsMap[consoleId] || systemSpecsMap[activeSystem.id.toLowerCase()] || {
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

  // Coleta as capas dos principais jogos do sistema ativo
  const topGames = activeSystem.games ? activeSystem.games.slice(0, 4) : [];

  const getSpecFontClass = (systemId: string) => {
    const id = systemId.toLowerCase();
    if (['nes', 'snes', 'gb', 'gbc', 'sms', 'atari', 'neogeo'].includes(id)) {
      return 'font-retro text-[9px] tracking-tight text-emerald-400';
    } else if (['n64', 'gba', 'genesis', 'pce', 'nds'].includes(id)) {
      return 'font-mono text-xs text-amber-400 font-bold';
    } else {
      return 'font-display text-sm text-cyan-400 font-bold uppercase tracking-wider';
    }
  };

  // Carrega e sincroniza o histórico e favoritos dinâmicos do localStorage
  const [recentlyPlayed, setRecentlyPlayed] = useState<any[]>([]);
  const [favoritesList, setFavoritesList] = useState<any[]>([]);

  const loadHistoryAndFavorites = () => {
    try {
      let rawRecent = localStorage.getItem('retro_recently_played');
      if (!rawRecent || JSON.parse(rawRecent).length === 0) {
        const defaultRecent = [
          { systemId: 'snes', systemName: 'Super Nintendo', title: 'Super Mario World', image: '/covers/snes-super-mario-world.svg' },
          { systemId: 'genesis', systemName: 'Sega Genesis / Mega Drive', title: 'Sonic the Hedgehog 2', image: '/covers/genesis-sonic-the-hedgehog-2.svg' },
          { systemId: 'nes', systemName: 'Nintendo Entertainment System', title: 'The Legend of Zelda', image: '/covers/nes-the-legend-of-zelda.svg' }
        ];
        localStorage.setItem('retro_recently_played', JSON.stringify(defaultRecent));
        rawRecent = JSON.stringify(defaultRecent);
      }
      setRecentlyPlayed(JSON.parse(rawRecent));

      let rawFavs = localStorage.getItem('retro_favorites');
      let favoriteKeys: string[] = [];
      let isArray = false;

      if (rawFavs) {
        try {
          const parsed = JSON.parse(rawFavs);
          if (Array.isArray(parsed)) {
            favoriteKeys = parsed;
            isArray = true;
          }
        } catch {}
      }

      if (!rawFavs || !isArray || favoriteKeys.length === 0) {
        const defaultFavKeys = [
          'snes::Chrono Trigger',
          'nes::Contra',
          'nes::Super Mario Bros. 3'
        ];
        localStorage.setItem('retro_favorites', JSON.stringify(defaultFavKeys));
        favoriteKeys = defaultFavKeys;
      }

      const favs: any[] = [];
      systems.forEach(sys => {
        sys.games.forEach(g => {
          if (favoriteKeys.includes(`${sys.id}::${g.title}`)) {
            favs.push({
              systemId: sys.id,
              systemName: sys.name,
              title: g.title,
              image: g.image
            });
          }
        });
      });
      setFavoritesList(favs);
    } catch (e) {
      console.error('[RetroHub] Erro ao carregar favoritos na página inicial:', e);
    }
  };

  useEffect(() => {
    loadHistoryAndFavorites();
    const handleRecentUpdate = () => {
      loadHistoryAndFavorites();
    };
    window.addEventListener('retro_recently_played_updated', handleRecentUpdate);
    return () => {
      window.removeEventListener('retro_recently_played_updated', handleRecentUpdate);
    };
  }, [systems]);

  const handleNavigateToGame = (systemId: string, gameTitle: string) => {
    soundEngine.playSelect();
    const slug = getGameSlug(systemId, gameTitle);
    window.history.pushState({}, '', `/game/${slug}`);
    window.dispatchEvent(new Event('popstate'));
  };

  const getSystemRegion = (id: string): string => {
    const cleanId = id.toLowerCase();
    if (['nes', 'snes', 'n64', 'gba', 'gb', 'gbc', 'nds', 'gamecube', 'gc'].includes(cleanId)) {
      return "NTSC-U / NTSC-J";
    }
    if (['genesis', 'megadrive', 'sega', 'sms', 'mastersystem', 'saturn', 'dreamcast'].includes(cleanId)) {
      return "NTSC-U / PAL-M";
    }
    if (['playstation', 'psx', 'ps1', 'ps2', 'playstation2', 'ps3', 'playstation3', 'xbox', 'xbox360', 'xboxclassic'].includes(cleanId)) {
      return "América / Japão / Europa";
    }
    if (['arcade', 'neogeo'].includes(cleanId)) {
      return "Mundial (Fliperamas)";
    }
    return "NTSC / PAL / SECAM";
  };

  const getSystemPopularGame = (id: string): string => {
    const cleanId = id.toLowerCase();
    const map: Record<string, string> = {
      nes: "Super Mario Bros. 3",
      snes: "Super Mario World",
      n64: "Super Mario 64",
      gb: "Tetris",
      gameboy: "Tetris",
      gbc: "Pokémon Yellow",
      gameboycolor: "Pokémon Yellow",
      gba: "Pokémon Emerald",
      nds: "New Super Mario Bros.",
      genesis: "Sonic the Hedgehog 2",
      megadrive: "Sonic the Hedgehog 2",
      playstation: "Castlevania: Symphony of the Night",
      psx: "Castlevania: Symphony of the Night",
      ps1: "Castlevania: Symphony of the Night",
      playstation2: "GTA: San Andreas",
      ps2: "GTA: San Andreas",
      playstation3: "The Last of Us",
      ps3: "The Last of Us",
      xbox: "Halo 2",
      xboxclassic: "Halo 2",
      xbox360: "Halo 3",
      sms: "Alex Kidd in Miracle World",
      mastersystem: "Alex Kidd in Miracle World",
      saturn: "Sega Rally Championship",
      dreamcast: "Sonic Adventure 2",
      gamecube: "Super Smash Bros. Melee",
      neogeo: "Metal Slug X",
      arcade: "Street Fighter II",
      pce: "Castlevania: Rondo of Blood"
    };
    return map[cleanId] || "Clássicos da Época";
  };

  return (
    <div className="relative w-full min-h-screen lg:h-[calc(100vh-140px)] lg:min-h-[620px] bg-transparent flex flex-col justify-start lg:justify-between select-none font-sans pb-16 lg:pb-0 lg:overflow-hidden">
      
      {/* 3-COLUMN RETRO HUB COMMAND CENTER */}
      <div className="relative z-20 w-full max-w-[1600px] mx-auto px-4 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch justify-center flex-1 min-h-0 pt-16 md:pt-20 lg:pt-4">
        
        {/* COLUNA ESQUERDA (DASHBOARD DO USUÁRIO - MEU SISTEMA RETRO) */}
        <div className="col-span-1 lg:col-span-3 h-full flex flex-col justify-center transition-opacity duration-200">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="relative overflow-hidden bg-zinc-900/65 border border-white/10 backdrop-blur-md rounded-2xl p-4 xl:p-5 shadow-2xl flex flex-col justify-between hover:bg-zinc-900/75 hover:border-white/15 transition-all duration-300 h-fit"
          >
            {/* O "LED" superior */}
            <div 
              className="absolute top-0 left-0 h-[2px] w-full pulse-led"
              style={{ 
                backgroundImage: `linear-gradient(to right, transparent, ${activeColor.hex}, transparent)` 
              }}
            />

            <div>
              {/* Header */}
              <div className="flex items-center gap-1.5 mb-3.5">
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <span className="text-zinc-400 font-mono text-[9px] tracking-[0.2em] uppercase font-black">
                  MEU SISTEMA RETRO
                </span>
              </div>

              {/* Items */}
              <div className="space-y-4 font-sans">
                {/* 🕹️ Continuar Jogando */}
                <div className="group/item">
                  <span className="text-zinc-500 block text-[7.5px] font-mono font-black tracking-widest uppercase mb-1">
                    🕹️ CONTINUAR JOGANDO
                  </span>
                  {(() => {
                    const latestRecentGame = recentlyPlayed[0];
                    if (latestRecentGame) {
                      return (
                        <div 
                          onClick={() => handleNavigateToGame(latestRecentGame.systemId, latestRecentGame.title)}
                          className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-xl p-1.5 hover:bg-white/10 hover:border-white/15 transition-all cursor-pointer group"
                        >
                          <div className="w-8 h-10 bg-zinc-950 rounded overflow-hidden flex-shrink-0 border border-white/10 relative">
                            <img 
                              src={latestRecentGame.image || `/covers/${latestRecentGame.systemId}-default.png`} 
                              alt={latestRecentGame.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              onError={(e) => {
                                e.currentTarget.src = `/covers/${latestRecentGame.systemId}-default.png`;
                              }}
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Play className="w-3.5 h-3.5 text-white fill-white animate-pulse" />
                            </div>
                          </div>
                          <div className="truncate flex-1">
                            <h4 className="text-zinc-200 text-xs font-bold truncate group-hover:text-white transition-colors leading-tight">
                              {latestRecentGame.title}
                            </h4>
                            <p className="text-zinc-500 text-[8px] font-mono uppercase mt-0.5 truncate">
                              {latestRecentGame.systemName || latestRecentGame.systemId}
                            </p>
                          </div>
                        </div>
                      );
                    } else {
                      const suggestedGame = activeSystem.games[0] || { title: "Super Mario World", id: "smw" };
                      return (
                        <div 
                          onClick={() => handleNavigateToGame(activeSystem.id, suggestedGame.title)}
                          className="flex items-center gap-2 bg-white/3 border border-white/5 border-dashed rounded-xl p-1.5 hover:bg-white/5 hover:border-white/10 transition-all cursor-pointer"
                        >
                          <div className="w-8 h-10 bg-zinc-950/40 rounded flex items-center justify-center flex-shrink-0 text-zinc-600 border border-white/5">
                            <Play className="w-3.5 h-3.5" />
                          </div>
                          <div className="truncate flex-1">
                            <h4 className="text-zinc-400 text-xs truncate font-medium leading-tight">
                              {suggestedGame.title}
                            </h4>
                            <p className="text-emerald-500/80 text-[7.5px] font-mono uppercase mt-0.5 font-bold">
                              Sugestão do Dia
                            </p>
                          </div>
                        </div>
                      );
                    }
                  })()}
                </div>

                {/* ❤️ Favoritos */}
                <div>
                  <span className="text-zinc-500 block text-[7.5px] font-mono font-black tracking-widest uppercase mb-1">
                    ❤️ MEUS FAVORITOS
                  </span>
                  {favoritesList.length > 0 ? (
                    <div className="space-y-1.5">
                      {favoritesList.slice(0, 2).map((item: any, idx: number) => (
                        <div 
                          key={`fav-${idx}`}
                          onClick={() => handleNavigateToGame(item.systemId, item.title)}
                          className="flex items-center justify-between text-xs bg-white/3 hover:bg-white/8 border border-transparent hover:border-white/5 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer group"
                        >
                          <span className="text-zinc-300 group-hover:text-white font-medium truncate max-w-[140px]">
                            {item.title}
                          </span>
                          <span className="text-[7.5px] font-mono text-zinc-500 uppercase shrink-0 font-bold">
                            {item.systemId}
                          </span>
                        </div>
                      ))}
                      {favoritesList.length > 2 && (
                        <p className="text-[7.5px] text-zinc-500 font-mono text-right pr-1 mt-0.5">
                          + {favoritesList.length - 2} outros salvos
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="border border-dashed border-white/5 rounded-lg p-2.5 text-center bg-white/[0.01]">
                      <p className="text-zinc-600 text-[9px] font-sans">Sem favoritos salvos</p>
                      <p className="text-zinc-700 text-[7.5px] font-mono">Clique no ❤️ no jogo</p>
                    </div>
                  )}
                </div>

                {/* 🕓 Últimos Jogados */}
                <div>
                  <span className="text-zinc-500 block text-[7.5px] font-mono font-black tracking-widest uppercase mb-1">
                    🕓 HISTÓRICO DE JOGADAS
                  </span>
                  {recentlyPlayed.length > 1 ? (
                    <div className="space-y-1.5">
                      {recentlyPlayed.slice(1, 3).map((item: any, idx: number) => (
                        <div 
                          key={`recent-${idx}`}
                          onClick={() => handleNavigateToGame(item.systemId, item.title)}
                          className="flex items-center justify-between text-xs bg-white/3 hover:bg-white/8 border border-transparent hover:border-white/5 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer group"
                        >
                          <span className="text-zinc-300 group-hover:text-white truncate max-w-[140px]">
                            {item.title}
                          </span>
                          <span className="text-[7.5px] font-mono text-zinc-500 uppercase shrink-0 font-bold">
                            {item.systemId}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border border-dashed border-white/5 rounded-lg p-2.5 text-center bg-white/[0.01]">
                      <p className="text-zinc-600 text-[9px] font-sans">Nenhuma sessão recente</p>
                    </div>
                  )}
                </div>

                {/* 🏆 Jogos Mais Jogados */}
                <div>
                  <span className="text-zinc-500 block text-[7.5px] font-mono font-black tracking-widest uppercase mb-1">
                    🏆 DESTAQUES DA COMUNIDADE
                  </span>
                  <div className="space-y-1.5 font-sans text-xs">
                    {(() => {
                      const activePopularGames = activeSystem.games ? activeSystem.games.slice(0, 2) : [];
                      if (activePopularGames.length > 0) {
                        return activePopularGames.map((item, idx) => (
                          <div 
                            key={`pop-${idx}`}
                            onClick={() => handleNavigateToGame(activeSystem.id, item.title)}
                            className="flex items-center justify-between text-xs bg-white/3 hover:bg-white/8 border border-transparent hover:border-white/5 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer group"
                          >
                            <span className="text-zinc-300 group-hover:text-white truncate max-w-[140px]">
                              {item.title}
                            </span>
                            <span className="text-[7.5px] font-mono text-amber-500 font-bold shrink-0">
                              ★ {idx === 0 ? "9.8" : "9.5"}
                            </span>
                          </div>
                        ));
                      } else {
                        return (
                          <p className="text-zinc-600 text-[9px] italic">Sem títulos disponíveis</p>
                        );
                      }
                    })()}
                  </div>
                </div>

              </div>
            </div>

            {/* ⭐ Coleção Pessoal Stats */}
            <div className="border-t border-white/5 pt-2.5 mt-3 flex items-center justify-between font-sans text-[10px] shrink-0">
              <div>
                <span className="text-[7.5px] text-zinc-600 font-mono block leading-none">COLEÇÃO ATUAL</span>
                <span className="text-zinc-400 font-bold font-mono text-[9px] block mt-0.5">⭐ {systems.length} EMULADOS</span>
              </div>
              <div className="text-right">
                <span className="text-[7.5px] text-zinc-600 font-mono block leading-none">VIRTUAL ENGINE</span>
                <span className="text-emerald-500/80 font-mono font-bold text-[8px] block mt-0.5">● COMPATÍVEL</span>
              </div>
            </div>

          </motion.div>
        </div>

        {/* COLUNA CENTRAL (O PROTAGONISTA CENTRAL ENORME & SELETOR CAROUSEL) */}
        <div className="col-span-1 lg:col-span-6 flex flex-col items-center justify-center text-center relative min-h-0">
          
          {/* Majestic Hero Console Graphic Container (expanded layout size for huge artwork) */}
          <div className="relative z-10 w-full flex flex-col items-center justify-center max-w-3xl px-4 select-none mb-1 mt-2 lg:mt-0 flex-1 justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSystem.id}
                initial={{ opacity: 0, y: 25, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -25, scale: 0.96 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="flex flex-col items-center w-full"
              >
                <div className="h-96 md:h-[450px] lg:h-[480px] xl:h-[560px] w-auto flex items-center justify-center relative select-none pointer-events-none">
                  {/* Majestic ambient background glow behind central protagonist */}
                  <div 
                    className="absolute inset-[-50px] lg:inset-[-80px] -z-10 blur-[90px] opacity-25 transition-all duration-1000 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle, ${activeColor.hex} 0%, transparent 70%)`
                    }}
                  />
                  <CentralConsoleLogo system={activeSystem} />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Carousel Text Info Label */}
          <div className="flex flex-col items-center text-center w-full z-20 pointer-events-none mb-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={`info-${activeSystem.id}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center"
              >
                <p className="text-zinc-400 text-[10px] tracking-widest font-mono uppercase bg-white/5 border border-white/10 px-3 py-1 rounded-full backdrop-blur-md mb-2">
                  {specs.manufacturer} • {specs.generation}
                </p>
                <h1 className="text-2xl md:text-4xl xl:text-5xl font-black tracking-tight text-white uppercase drop-shadow-2xl">
                  {activeSystem.name}
                </h1>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Compact 3D Cylindrical Ring Carousel Selector */}
          <div 
            className="relative z-10 w-full min-h-[200px] lg:min-h-[220px] xl:min-h-[250px] flex flex-col items-center justify-center py-1 overflow-visible select-none shrink-0"
            onMouseDown={(e) => handleDragStart(e.clientX)}
            onMouseMove={(e) => handleDragMove(e.clientX)}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
            onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
            onTouchEnd={handleDragEnd}
          >
            {filteredSystems.length > 0 ? (
              <div 
                className="relative w-full flex items-center justify-center overflow-visible"
                style={{ perspective: '1600px' }}
              >
                
                {/* Left Navigation Arrow */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  className="absolute left-1 md:left-4 lg:-left-2 z-40 bg-zinc-950/80 hover:bg-zinc-900 border border-white/10 hover:border-white/20 p-2.5 rounded-full text-white/70 hover:text-white transition-all cursor-pointer backdrop-blur shadow-lg hover:scale-115 active:scale-90 group"
                  title="Anterior (Seta Esquerda)"
                >
                  <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                </button>

                {/* Right Navigation Arrow */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="absolute right-1 md:right-4 lg:-right-2 z-40 bg-zinc-950/80 hover:bg-zinc-900 border border-white/10 hover:border-white/20 p-2.5 rounded-full text-white/70 hover:text-white transition-all cursor-pointer backdrop-blur shadow-lg hover:scale-115 active:scale-90 group"
                  title="Próximo (Seta Direita)"
                >
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* 3D Ring Floor Reflection */}
                <div 
                  className="absolute w-[400px] h-[400px] md:w-[800px] md:h-[800px] rounded-full opacity-10 pointer-events-none -z-10 transition-all duration-700"
                  style={{
                    background: `radial-gradient(circle, ${activeColor.hex} 0%, transparent 70%)`,
                    transform: 'rotateX(82deg) translateZ(-110px)',
                    boxShadow: `0 0 60px 15px ${activeColor.hex}`
                  }}
                />

                {/* Spinning Cylinder */}
                {(() => {
                  const baseN = filteredSystems.length;
                  const isMobile = windowWidth < 768;
                  const radius = isMobile ? 120 : 440;
                  const targetWidth = isMobile ? (windowWidth - 40) : (windowWidth - 320);
                  const diameter = radius * 2;
                  const stretchX = Math.max(0.7, Math.min(1.8, targetWidth / diameter));
                  const stepAngle = isMobile ? 18 : 13;
                  const halfSlots = isMobile ? 3 : 5;
                  const displayItems = [];

                  if (baseN > 0) {
                    for (let j = -halfSlots; j <= halfSlots; j++) {
                      const displayIdx = virtualActiveIndex + j;
                      const sysIdx = ((displayIdx % baseN) + baseN) % baseN;
                      displayItems.push({
                        ...filteredSystems[sysIdx],
                        displayIdx,
                        offsetJ: j
                      });
                    }
                  }

                  return (
                    <div 
                      className="relative w-[100px] h-[72px] md:w-[155px] md:h-[105px] transition-transform duration-700"
                      style={{
                        transformStyle: 'preserve-3d',
                        transform: `scaleX(${stretchX}) rotateX(-3deg) rotateY(${-virtualActiveIndex * stepAngle}deg)`,
                      }}
                    >
                      {displayItems.map(({ sys, originalIdx, displayIdx, offsetJ }) => {
                        const isSelected = offsetJ === 0;
                        const sysColor = getSystemThemeColor(sys.id);
                        const status = getSystemStatus(sys.id);
                        const displayRelAngle = offsetJ * stepAngle;
                        const displayAngle = displayIdx * stepAngle;
                        const angleRad = (displayRelAngle * Math.PI) / 180;
                        const cosVal = Math.cos(angleRad);
                        const zIndex = Math.round((cosVal + 1) * 100);
                        const opacity = isSelected 
                          ? 1 
                          : cosVal < 0 
                            ? Math.max(0, 0.05 + (cosVal + 1) * 0.1) 
                            : Math.max(0.45, 0.45 + cosVal * 0.55);
                        const scale = isSelected ? 1.05 : Math.max(0.72, 0.72 + cosVal * 0.18);
                        const blur = isSelected ? 'none' : `blur(${Math.max(0, (1 - cosVal) * 2.5)}px)`;
                        const isBack = cosVal < 0 && !isSelected;

                        return (
                          <div
                            key={`${sys.id}-display-${displayIdx}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isSelected) {
                                setActiveIndex(originalIdx);
                                soundEngine.playMove();
                              } else {
                                handleSelect();
                              }
                            }}
                            className="absolute inset-0 cursor-pointer select-none group transition-all duration-500 ease-out"
                            style={{
                              transformStyle: isSelected ? 'flat' : 'preserve-3d',
                              transform: `rotateY(${displayAngle}deg) translateZ(${radius}px) scale(${scale})`,
                              backfaceVisibility: isSelected ? 'visible' : 'hidden',
                              opacity: opacity,
                              filter: isSelected ? 'none' : blur,
                              zIndex: zIndex,
                              pointerEvents: isBack ? 'none' : 'auto',
                              willChange: isSelected ? 'auto' : 'transform',
                            }}
                          >
                            {isSelected && (
                              <div
                                className="absolute inset-[-12px] -z-10 blur-xl opacity-30 pointer-events-none"
                                style={{
                                  background: `radial-gradient(circle, ${sysColor.hex} 0%, transparent 70%)`,
                                  transform: `scaleX(${1 / stretchX})`,
                                  transformOrigin: 'center center'
                                }}
                              />
                            )}

                            <div
                              className={`w-full h-full p-2 rounded-xl border transition-all duration-300 flex flex-col justify-between relative ${
                                isSelected
                                  ? 'bg-zinc-900/95 border-white/20'
                                  : 'border-white/5 bg-zinc-950/40 backdrop-blur-md hover:border-white/10 hover:bg-zinc-900/30'
                              }`}
                              style={{
                                transform: `scaleX(${1 / stretchX})`,
                                transformOrigin: 'center center',
                                ...(isSelected ? {
                                  borderColor: `${sysColor.hex}bb`,
                                  boxShadow: `0 0 25px ${sysColor.hex}25, inset 0 1px 1px rgba(255,255,255,0.15)`
                                } : {})
                              }}
                            >
                              <div className="flex items-center justify-end w-full relative z-10">
                                <span 
                                  className="w-1.5 h-1.5 rounded-full animate-pulse shadow-[0_0_8px_currentcolor]" 
                                  style={{ 
                                    backgroundColor: status.color,
                                    color: status.color
                                  }}
                                />
                              </div>

                              <div className="flex-1 flex items-center justify-center relative overflow-visible my-0.5 z-0">
                                <CardConsoleLogo system={sys} isSelected={isSelected} />
                              </div>

                              <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/0 via-white/5 to-white/10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <span className="text-zinc-600 font-mono text-xs uppercase tracking-widest">Nenhum console corresponde à busca</span>
                <button
                  onClick={() => {
                    setConsoleSearch('');
                    setActiveCategory('all');
                    soundEngine.playMove();
                  }}
                  className="mt-2 text-[9px] font-retro uppercase tracking-wider text-emerald-400 hover:underline cursor-pointer"
                >
                  Restaurar Filtros
                </button>
              </div>
            )}

          </div>

          {/* Indicator dots */}
          {filteredSystems.length > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-2 z-30 pb-4 shrink-0">
              {filteredSystems.map(({ sys, originalIdx }) => {
                const isSelected = originalIdx === activeIndex;
                return (
                  <button
                    key={`dot-${sys.id}`}
                    onClick={() => {
                      setActiveIndex(originalIdx);
                      soundEngine.playMove();
                    }}
                    className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
                      isSelected 
                        ? 'w-5 bg-[var(--theme-color)] shadow-[0_0_8px_var(--theme-color)]' 
                        : 'w-1 bg-zinc-700 hover:bg-zinc-500'
                    }`}
                    style={isSelected ? {
                      backgroundColor: activeColor.hex,
                      boxShadow: `0 0 10px ${activeColor.hex}`
                    } : undefined}
                    title={`Selecionar ${sys.name}`}
                  />
                );
              })}
            </div>
          )}

        </div>

        {/* COLUNA DIREITA (DADOS DO CONSOLE SELECIONADO & LIGAR CONSOLE) */}
        <div className="col-span-1 lg:col-span-3 h-full flex flex-col justify-center transition-opacity duration-200">
          <motion.div
            key={`specs-right-${activeSystem.id}`}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="relative overflow-hidden bg-zinc-900/65 border border-white/10 backdrop-blur-md rounded-2xl p-4 xl:p-5 shadow-2xl flex flex-col justify-between hover:bg-zinc-900/75 hover:border-white/15 transition-all duration-300 h-fit"
          >
            {/* O "LED" superior */}
            <div 
              className="absolute top-0 left-0 h-[2px] w-full pulse-led"
              style={{ 
                backgroundImage: `linear-gradient(to right, transparent, ${activeColor.hex}, transparent)` 
              }}
            />

            <div>
              {/* Header */}
              <div className="flex flex-col gap-1 mb-4 border-b border-white/5 pb-3">
                <div className="flex items-center gap-2 justify-between">
                  <span className="text-zinc-500 font-mono text-[8px] tracking-[0.15em] uppercase font-black">
                    MÁQUINA DO TEMPO / ARQUIVO HISTÓRICO
                  </span>
                  <span className="relative flex h-1.5 w-1.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500"></span>
                  </span>
                </div>
                <h3 className="text-xs font-sans font-black text-white uppercase tracking-tight leading-tight text-left">
                  {getConsoleSEOHeader(activeSystem.id, activeSystem.name)}
                </h3>
              </div>

              {/* Specs Rows */}
              <div className="space-y-4 font-sans text-xs">
                
                {/* 🎮 Nome completo do console */}
                <div className="flex flex-col gap-0.5">
                  <span className="text-zinc-500 text-[8px] font-mono uppercase tracking-wider font-black">🎮 NOME COMPLETO DO CONSOLE</span>
                  <span className="text-zinc-200 font-bold text-sm truncate uppercase">{activeSystem.name}</span>
                </div>

                {/* 📅 Ano de lançamento */}
                <div className="flex flex-col gap-0.5">
                  <span className="text-zinc-500 text-[8px] font-mono uppercase tracking-wider font-black">📅 ANO DE LANÇAMENTO</span>
                  <span className="text-zinc-300 font-semibold">{specs.releaseYear}</span>
                </div>

                {/* 🏢 Fabricante */}
                <div className="flex flex-col gap-0.5">
                  <span className="text-zinc-500 text-[8px] font-mono uppercase tracking-wider font-black">🏢 FABRICANTE</span>
                  <span className="text-zinc-300 font-semibold uppercase">{specs.manufacturer}</span>
                </div>

                {/* 💿 Quantidade de jogos */}
                <div className="flex flex-col gap-0.5">
                  <span className="text-zinc-500 text-[8px] font-mono uppercase tracking-wider font-black">💿 QUANTIDADE DE JOGOS</span>
                  <span className="text-emerald-400 font-bold font-mono text-[10px]">{activeSystem.gameCount} TÍTULOS DISPONÍVEIS</span>
                </div>

                {/* 🌎 Região */}
                <div className="flex flex-col gap-0.5">
                  <span className="text-zinc-500 text-[8px] font-mono uppercase tracking-wider font-black">🌎 REGIÃO DO JOGO</span>
                  <span className="text-zinc-300 font-semibold">{getSystemRegion(activeSystem.id)}</span>
                </div>

                {/* 🔥 Jogo mais popular */}
                <div className="flex flex-col gap-0.5">
                  <span className="text-zinc-500 text-[8px] font-mono uppercase tracking-wider font-black">🔥 JOGO MAIS POPULAR</span>
                  <span className="text-amber-400 font-black tracking-wide uppercase truncate">{getSystemPopularGame(activeSystem.id)}</span>
                </div>

              </div>
            </div>

            {/* Premium LIGAR CONSOLE button */}
            <div className="mt-5 border-t border-white/10 pt-4 shrink-0">
              <button 
                onClick={handleSelect}
                className="w-full relative px-4 py-3 bg-zinc-950 hover:bg-zinc-900 text-white border font-retro text-[8.5px] font-black uppercase tracking-widest rounded-xl flex items-center justify-center cursor-pointer overflow-hidden transition-all duration-300 active:scale-95 shadow-lg shadow-black/80 group/btn"
                style={{
                  borderColor: `${activeColor.hex}33`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${activeColor.hex}aa`;
                  e.currentTarget.style.boxShadow = `0 0 15px ${activeColor.hex}44`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = `${activeColor.hex}33`;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Glowing power LED with PNL colors */}
                <span 
                  className="w-2.5 h-2.5 rounded-full mr-2.5 pulse-led shadow-sm inline-block shrink-0 animate-pulse" 
                  style={{ 
                    backgroundColor: activeColor.hex,
                    boxShadow: `0 0 10px ${activeColor.hex}`
                  }}
                />
                <span className="relative z-10 font-bold tracking-widest text-zinc-100 group-hover/btn:text-white transition-colors flex items-center gap-1.5">
                  {isSystemSupported(activeSystem.id) ? (
                    <>
                      REVIVER ESTA ERA <span className="group-hover/btn:translate-x-1 transition-transform duration-300 inline-block">➔</span>
                    </>
                  ) : (
                    <>
                      DESBLOQUEAR EM BREVE <span className="group-hover/btn:translate-x-1 transition-transform duration-300 inline-block">➔</span>
                    </>
                  )}
                </span>
                
                {/* Glass sweep effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 pointer-events-none opacity-0 group-hover/btn:opacity-100 transition-opacity" />
              </button>
            </div>

          </motion.div>
        </div>

      </div>

      {/* RODAPÉ DO CONSOLE */}
      <footer className="absolute bottom-0 inset-x-0 h-10 bg-black/40 border-t border-white/5 backdrop-blur z-40 flex items-center justify-between px-10 font-sans text-[10px] font-semibold text-zinc-500 tracking-wider shrink-0">
        <div>◀ ▶ SELECIONAR SISTEMA • ENTER CONFIRMAR</div>
        <div className="font-mono text-[9px] tracking-widest uppercase text-zinc-600">
          LordTecaRetro • Preservação Digital Retro
        </div>
      </footer>

    </div>
  );
};