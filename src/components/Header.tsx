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
    <header className="relative z-50 w-full h-18 px-6 sm:px-10 flex items-center justify-between border-b border-white/5 bg-[#121c25]/85 backdrop-blur-md">
      {/* Brand Launcher Logo */}
      <div className="flex items-center gap-6">
        <button
          onClick={onGoBack}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-3.5 h-3.5 rounded-full bg-red-600 border border-red-400 pulse-led" />
          <div className="flex flex-col text-left">
            <span className="font-retro text-[9px] tracking-widest text-[#E60012] group-hover:text-red-400 transition-colors">
              LordTecaRetro
            </span>
            <span className="text-[9px] font-mono text-zinc-500 font-medium tracking-wide uppercase">
              {title ? `MÓDULO / ${title}` : 'Sua infância em um clique'}
            </span>
          </div>
        </button>

        {/* Diagnostic indicator */}
        <div className="hidden md:flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded text-[10px] font-mono font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>SISTEMA: PRONTO</span>
        </div>
      </div>

      {/* Retro Utility Toolbar Controls */}
      <div className="flex items-center gap-3 sm:gap-6">
        {/* Global Search Button */}
        <button
          onClick={onSearchClick}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold tracking-wider transition-all duration-200 cursor-pointer bg-red-600/10 hover:bg-red-600/25 border-red-500/30 text-red-400 hover:text-white"
          title="Pesquisa Global de Consoles e Jogos (Atalho: S / F)"
          id="btn-header-search"
        >
          <Search className="w-3.5 h-3.5 text-red-400" />
          <span>BUSCA</span>
        </button>

        {/* Audio / Mute feedback */}
        <button
          onClick={toggleMute}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold tracking-wider transition-all duration-200 cursor-pointer ${
            !isMuted
              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
              : 'bg-[#18181b]/60 hover:bg-[#27272a] border-white/5 text-zinc-500'
          }`}
          title="Alternar áudio da retro engine (Atalho: M)"
          id="btn-header-audio"
        >
          {isMuted ? (
            <VolumeX className="w-3.5 h-3.5" />
          ) : (
            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
          )}
          <span className="hidden sm:inline">{isMuted ? 'MUTADO' : 'SOM: ON'}</span>
        </button>

        {/* Settings button */}
        <button
          onClick={onSettingsClick}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold tracking-wider transition-all duration-200 cursor-pointer bg-red-650/10 hover:bg-red-600/25 border-red-500/20 text-red-400 hover:text-white"
          title="Ajustes do Painel e Preferências Retro"
          id="btn-header-settings"
        >
          <Sliders className="w-3.5 h-3.5 text-red-500" />
          <span>AJUSTES</span>
        </button>

        {/* Digital Realtime LCD Clock */}
        <div className="bg-[#121214] border border-white/5 px-4 py-1.5 rounded-lg shadow-inner">
          <span 
            className="text-white hover:text-red-500 transition-colors text-base sm:text-lg font-black font-retro tracking-widest cursor-default select-none tabular-nums"
            style={{ fontSize: '12px' }}
          >
            {time}
          </span>
        </div>
      </div>
    </header>
  );
};
