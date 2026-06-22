/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { System } from '../types';
import { Gamepad2 } from 'lucide-react';

interface SystemCardProps {
  system: System;
  isActive: boolean;
  onClick: () => void;
}

const getLogoFileName = (id: string): string => {
  const map: Record<string, string> = {
    nes: 'nes',
    snes: 'snes',
    n64: 'n64',
    gb: 'gameboy',
    gbc: 'gameboycolor',
    gameboycolor: 'gameboycolor',
    gba: 'gba',
    sms: 'mastersystem',
    genesis: 'megadrive',
    saturn: 'saturn',
    ps1: 'psx',
    atari: 'atari2600',
    arcade: 'arcade',
    neogeo: 'neogeo',
    nds: 'nintendods',
    pce: 'pcengine',
    '3do': '3do',
    dreamcast: 'dreamcast',
    gamecube: 'gamecube'
  };
  return map[id] || id;
};

export const SystemCard: React.FC<SystemCardProps> = ({
  system,
  isActive,
  onClick
}) => {
  const [imageError, setImageError] = useState(false);
  return (
    <motion.div
      onClick={onClick}
      initial={{ opacity: 0.5, scale: 0.95 }}
      animate={{
        opacity: isActive ? 1 : 0.45,
        scale: isActive ? 1.25 : 0.9,
        y: isActive ? 0 : 8,
      }}
      transition={{ type: 'spring', stiffness: 220, damping: 22 }}
      className={`relative flex flex-col items-center justify-center cursor-pointer p-5 px-6 rounded-2xl select-none min-w-[210px] sm:min-w-[240px] border transition-all duration-300 ${
        isActive
          ? 'bg-[#0f0f12]/92 border-white/20 shadow-[0_20px_45px_rgba(255,255,255,0.06)]'
          : 'bg-[#18181b]/40 hover:bg-[#18181b]/70 border-white/5 hover:border-white/10'
      }`}
    >
      {/* Active Glowing Aurora Aura */}
      {isActive && (
        <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 via-emerald-600 to-blue-600 rounded-2xl opacity-15 blur-lg pointer-events-none" />
      )}

      {/* Retro styled system badge */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* Dynamic decorative colors resembling legendary Nintendo or SEGA emblems */}
        {isActive && (
          <div className="flex gap-1 mb-2 animate-bounce">
            <div className="w-1.5 h-1.5 rounded-full bg-[#E60012]" />
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </div>
        )}

        {/* Short Name Logo */}
        <div className="h-14 flex items-center justify-center mb-2">
          {!imageError && (
            <img 
              src={`https://raw.githubusercontent.com/lordjunnior/recalbox-theme/main/assets/logos/${getLogoFileName(system.id)}.png`} 
              alt={system.name} 
              referrerPolicy="no-referrer"
              className={`h-11 w-auto max-w-[140px] object-contain transition-all duration-300 ${
                isActive 
                  ? 'brightness-100 drop-shadow-[0_0_12px_rgba(255,255,255,0.4)] scale-110' 
                  : 'brightness-50 grayscale opacity-45'
              }`}
              onError={() => {
                setImageError(true);
              }}
            />
          )}
        </div>

        {/* fallback text underneath system identifier if inactive or image has error */}
        <span 
          className={`font-retro text-[9px] sm:text-xs font-black tracking-tighter text-center uppercase ${
            isActive ? 'text-zinc-100 glow-active' : 'text-zinc-500'
          }`}
        >
          {system.logo}
        </span>

        {/* Separator style */}
        <div className={`h-[1px] w-12 bg-gradient-to-r from-transparent via-zinc-600/50 to-transparent my-1.5 transition-all ${
          isActive ? 'scale-125 bg-red-500' : ''
        }`} />

        {/* Count indicators */}
        <div className="flex flex-col items-center gap-0.5 mt-1">
          <span className={`text-[10px] font-mono tracking-wider font-bold ${isActive ? 'text-amber-400' : 'text-zinc-500'}`}>
            {system.gameCount} JOGOS
          </span>
          <span className="text-[9px] font-mono text-zinc-600 uppercase font-medium">
            {system.manufacturer}
          </span>
        </div>
      </div>

      {/* Decorative Quick Specs in absolute tags */}
      {isActive && (
        <div className="absolute bottom-2 left-3 right-3 flex justify-between items-center text-[8px] font-mono text-zinc-500 tracking-tight uppercase opacity-50 px-1">
          <span>{system.releaseYear}</span>
          <span>16-BIT</span>
        </div>
      )}
    </motion.div>
  );
};