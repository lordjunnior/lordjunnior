/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Cpu, Info, ShieldCheck, Search, Cloud, Sliders } from 'lucide-react';

interface HeaderProps {
  isMuted: boolean;
  toggleMute: () => void;
  title?: string;
  onGoBack?: () => void;
  onSearchClick: () => void;
  onSettingsClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isMuted,
  toggleMute,
  title,
  onGoBack,
  onSearchClick,
  onSettingsClick
}) => {
  const [time, setTime] = useState<string>('12:00:00');

  // Real-time clock update loop
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('pt-BR', { hour12: false }));
    };

    updateTime();
    const timerId = setInterval(updateTime, 1000);
    return () => clearInterval(timerId);
  }, []);

  return (
    <header className="relative z-50 w-full h-20 px-6 sm:px-10 flex items-center justify-between border-b border-white/10 bg-black/65 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
      {/* Brand Launcher Logo */}
      <div className="flex items-center gap-6">
        <button
          onClick={onGoBack}
          className="flex items-center gap-3.5 cursor-pointer group select-none transition-all duration-300"
        >
          <div className="relative">
            <div className="w-3.5 h-3.5 rounded-full bg-red-600 border border-red-500 pulse-led" />
            <div className="absolute inset-0 rounded-full bg-red-500 filter blur-sm opacity-55 animate-pulse" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-retro text-[10px] tracking-widest text-[#E60012] group-hover:text-red-400 transition-colors drop-shadow-[0_2px_4px_rgba(230,0,18,0.3)]">
              LORDTECARetro
            </span>
            <span className="text-[9px] font-mono text-zinc-400 font-bold tracking-widest uppercase mt-0.5">
              {title ? `MOD / ${title}` : 'CONSOLE HUB DIRECT'}
            </span>
          </div>
        </button>

        {/* Diagnostic indicator */}
        <div className="hidden md:flex items-center gap-2.5 bg-emerald-500/5 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-[9px] font-mono tracking-widest">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-bold">STATUS: HYPER-ENGAGED</span>
        </div>
      </div>

      {/* Retro Utility Toolbar Controls */}
      <div className="flex items-center gap-3 sm:gap-5">
        {/* Global Search Button */}
        <button
          onClick={onSearchClick}
          className="flex items-center gap-2 px-3.5 py-1.8 rounded-xl border text-[10px] font-mono font-black tracking-widest transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] cursor-pointer bg-zinc-900/60 hover:bg-zinc-800/80 border-white/10 hover:border-white/20 text-zinc-350 hover:text-white shadow-md uppercase"
          title="Pesquisa Global de Consoles e Jogos (Atalho: S / F)"
          id="btn-header-search"
        >
          <Search className="w-3.5 h-3.5 text-zinc-400" />
          <span>BUSCA</span>
        </button>

        {/* Audio / Mute feedback */}
        <button
          onClick={toggleMute}
          className={`flex items-center gap-2 px-3.5 py-1.8 rounded-xl border text-[10px] font-mono font-black tracking-widest transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] cursor-pointer shadow-md ${
            !isMuted
              ? 'bg-red-500/10 border-red-500/20 text-red-400'
              : 'bg-zinc-900/50 hover:bg-[#27272a]/60 border-white/10 text-zinc-500'
          }`}
          title="Alternar áudio da retro engine (Atalho: M)"
          id="btn-header-audio"
        >
          {isMuted ? (
            <VolumeX className="w-3.5 h-3.5" />
          ) : (
            <Volume2 className="w-3.5 h-3.5 text-red-400" />
          )}
          <span className="hidden sm:inline">{isMuted ? 'MUTADO' : 'ÁUDIO: LIGADO'}</span>
        </button>

        {/* Settings button */}
        <button
          onClick={onSettingsClick}
          className="flex items-center gap-2 px-3.5 py-1.8 rounded-xl border text-[10px] font-mono font-black tracking-widest transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] cursor-pointer bg-zinc-900/40 hover:bg-zinc-800/80 border-white/10 hover:border-white/20 text-zinc-350 hover:text-white shadow-md uppercase"
          title="Ajustes do Painel e Preferências Retro"
          id="btn-header-settings"
        >
          <Sliders className="w-3.5 h-3.5 text-zinc-400" />
          <span>PAINEL</span>
        </button>

        {/* Digital Realtime LCD Clock */}
        <div className="bg-black/90 border border-white/10 px-4 py-2 rounded-xl shadow-inner flex items-center justify-center">
          <span 
            className="text-amber-500 hover:text-amber-400 transition-all text-xs font-mono tracking-widest font-bold cursor-default select-none tracking-[2.5px]"
            title="Relógio do Servidor de Jogos"
          >
            {time}
          </span>
        </div>
      </div>
    </header>
  );
};
