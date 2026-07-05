/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Cpu, Info, ShieldCheck, Search, Cloud, Sliders, LogIn, LogOut, User } from 'lucide-react';

interface HeaderProps {
  isMuted: boolean;
  toggleMute: () => void;
  title?: string;
  onGoBack?: () => void;
  onSearchClick: () => void;
  onSettingsClick: () => void;
  glowColor?: string;
  user: any;
  onLogin: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isMuted,
  toggleMute,
  title,
  onGoBack,
  onSearchClick,
  onSettingsClick,
  glowColor,
  user,
  onLogin,
  onLogout
}) => {
  const [time, setTime] = useState<string>('12:00:00');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

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
    <header className="relative z-[105] w-full h-20 px-6 sm:px-10 flex items-center justify-between border-b border-white/10 bg-black/65 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
      {/* Brand Launcher Logo */}
      <div className="flex items-center gap-6">
        <button
          onClick={onGoBack}
          className="flex items-center gap-3.5 cursor-pointer group select-none transition-all duration-300"
        >
          <div className="relative">
            <div 
              className="w-3.5 h-3.5 rounded-full border transition-all duration-300 pulse-led"
              style={{
                backgroundColor: glowColor || '#E60012',
                borderColor: glowColor || '#ff4d4d',
                boxShadow: `0 0 10px ${glowColor || 'rgba(230,0,18,0.6)'}`
              }}
            />
            <div 
              className="absolute inset-0 rounded-full filter blur-sm opacity-55 animate-pulse transition-all duration-300"
              style={{ backgroundColor: glowColor || '#ff4d4d' }}
            />
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
      </div>

      {/* Retro Utility Toolbar Controls */}
      <div className="flex items-center gap-2 sm:gap-5">
        {/* Global Search Button */}
        <button
          onClick={onSearchClick}
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.8 rounded-xl border text-[10px] font-mono font-black tracking-widest transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] cursor-pointer bg-zinc-900/60 hover:bg-zinc-800/80 border-white/10 hover:border-white/20 text-zinc-350 hover:text-white shadow-md uppercase"
          title="Pesquisa Global de Consoles e Jogos (Atalho: S / F)"
          id="btn-header-search"
        >
          <Search className="w-3.5 h-3.5 text-zinc-400" />
          <span className="hidden xs:inline">BUSCA</span>
        </button>

        {/* Audio / Mute feedback */}
        <button
          onClick={toggleMute}
          className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.8 rounded-xl border text-[10px] font-mono font-black tracking-widest transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] cursor-pointer shadow-md ${
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

        {/* Cloud Sync / Login Button */}
        <div className="relative">
          <button
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
            }}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.8 rounded-xl border text-[10px] font-mono font-black tracking-widest transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] cursor-pointer shadow-md ${
              user
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-zinc-900/40 hover:bg-zinc-800/80 border-white/10 hover:border-white/20 text-zinc-350'
            }`}
            title={user ? `Sincronizado: ${user.email}` : 'Salvar Favoritos na Nuvem (Login)'}
            id="btn-header-cloud"
          >
            {user && user.photoURL ? (
              <img src={user.photoURL} alt="User avatar" className="w-4 h-4 rounded-full border border-emerald-500/50" referrerPolicy="no-referrer" />
            ) : (
              <Cloud className="w-3.5 h-3.5" />
            )}
            <span className="hidden xs:inline">{user ? 'SALVO' : 'NUVEM'}</span>
            <span className={`w-1.5 h-1.5 rounded-full ${user ? 'bg-emerald-450 animate-pulse' : 'bg-zinc-500'}`} />
          </button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2.5 w-64 bg-zinc-950/95 backdrop-blur-md border-2 border-white/10 rounded-2xl p-4 shadow-[0_10px_40px_rgba(0,0,0,0.8)] text-left select-none">
              {user ? (
                <div className="space-y-3.5">
                  <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="Avatar" className="w-9 h-9 rounded-full border border-emerald-500" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 font-bold uppercase">
                        {user.email?.charAt(0) || 'U'}
                      </div>
                    )}
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-white truncate">{user.displayName || 'Gamer'}</span>
                      <span className="text-[10px] text-zinc-400 font-mono truncate">{user.email}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="text-[9px] font-mono font-bold text-emerald-450 flex items-center gap-1.5 bg-emerald-500/5 px-2.5 py-1.5 rounded-lg border border-emerald-500/10">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      SINC. NUVEM ATIVA
                    </div>
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        onLogout();
                      }}
                      className="w-full text-center py-2 bg-red-600/10 hover:bg-red-650/20 text-red-400 hover:text-white text-[10px] font-mono font-bold tracking-wider rounded-xl border border-red-500/10 hover:border-red-500/30 transition-all duration-200 cursor-pointer uppercase"
                    >
                      Sair da Conta
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-center">
                  <div className="flex flex-col items-center py-2 select-none">
                    <Cloud className="w-10 h-10 text-zinc-500 mb-2 animate-bounce" />
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">Sincronização em Nuvem</h4>
                    <p className="text-[10px] text-zinc-400 text-center mt-1">
                      Salve seus jogos favoritos automaticamente para acessar de qualquer dispositivo.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      onLogin();
                    }}
                    className="w-full text-center py-2.5 bg-red-600 hover:bg-red-500 text-white text-[10px] font-mono font-black tracking-widest rounded-xl shadow-md shadow-red-600/10 hover:shadow-red-600/20 transition-all duration-200 cursor-pointer uppercase"
                  >
                    Entrar com Google
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Settings button */}
        <button
          onClick={onSettingsClick}
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.8 rounded-xl border text-[10px] font-mono font-black tracking-widest transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] cursor-pointer bg-zinc-900/40 hover:bg-zinc-800/80 border-white/10 hover:border-white/20 text-zinc-350 hover:text-white shadow-md uppercase"
          title="Ajustes do Painel e Preferências Retro"
          id="btn-header-settings"
        >
          <Sliders className="w-3.5 h-3.5 text-zinc-400" />
          <span className="hidden xs:inline">PAINEL</span>
        </button>

        {/* Digital Realtime LCD Clock */}
        <div className="hidden md:flex bg-black/90 border border-white/10 px-4 py-2 rounded-xl shadow-inner items-center justify-center">
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
