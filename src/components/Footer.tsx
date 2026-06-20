/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Database, HardDrive, Cpu, HelpCircle } from 'lucide-react';

interface FooterProps {
  activeScreen: 'carousel' | 'gamelist';
  onGoBack?: () => void;
  systemName?: string;
  onSearchToggle?: () => void;
  onRandomGame?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  activeScreen,
  onGoBack,
  systemName,
  onSearchToggle,
  onRandomGame
}) => {
  return (
    <footer className="relative z-50 w-full min-h-[74px] bg-[#121c25] text-zinc-100 border-t border-[#2a4055]/50 overflow-hidden flex flex-col md:flex-row items-center justify-between px-6 md:px-10 py-3 gap-4">
      {/* Dynamic Key bindings legends */}
      <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
        {/* Dynamic A key action depending on screen */}
        <div className="flex items-center gap-2.5">
          <div className="w-[24px] h-[24px] rounded-full bg-[#E60012] text-white flex items-center justify-center text-[11px] font-black shadow-[0_0_8px_rgba(230,0,18,0.45)] border border-red-500 font-retro">
            A
          </div>
          <span className="text-[11px] font-black uppercase tracking-wider text-[#dee0e8] font-sans">
            {activeScreen === 'carousel' ? 'Acessar Console' : 'Lançar Emulador'}
          </span>
        </div>

        {/* B Key - Back */}
        <div 
          onClick={activeScreen === 'gamelist' ? onGoBack : undefined}
          className={`flex items-center gap-2.5 ${activeScreen === 'gamelist' ? 'cursor-pointer hover:opacity-80 active:scale-95 transition-all' : ''}`}
        >
          <div className="w-[24px] h-[24px] rounded-full bg-[#eac428] text-zinc-950 flex items-center justify-center text-[11px] font-black shadow-[0_0_8px_rgba(234,196,40,0.35)] border border-yellow-400 font-retro">
            B
          </div>
          <span className="text-[11px] font-black uppercase tracking-wider text-[#dee0e8] font-sans">
            {activeScreen === 'carousel' ? 'Voltar' : 'Voltar à Home'}
          </span>
        </div>

        {/* Y key - Search filter */}
        {activeScreen === 'gamelist' && onSearchToggle && (
          <button 
            onClick={onSearchToggle}
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-all"
          >
            <div className="w-[24px] h-[24px] rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] font-black shadow-[0_0_8px_rgba(16,185,129,0.35)] border border-emerald-400 font-retro">
              Y
            </div>
            <span className="text-[11px] font-black uppercase tracking-wider text-[#dee0e8] font-sans">
              Filtrar / Buscar
            </span>
          </button>
        )}

        {/* X Key - Random game select */}
        {activeScreen === 'gamelist' && onRandomGame && (
          <button
            onClick={onRandomGame}
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-all font-sans"
          >
            <div className="w-[24px] h-[24px] rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-black shadow-[0_0_8px_rgba(59,130,246,0.35)] border border-blue-400 font-retro">
              X
            </div>
            <span className="text-[11px] font-black uppercase tracking-wider text-[#dee0e8]">
              Sugerir Jogo
            </span>
          </button>
        )}

        {/* SELECT / START simulation */}
        <div className="flex items-center gap-4 text-[9px] font-sans font-bold text-zinc-450 uppercase tracking-widest pl-2 border-l border-white/10 hidden xl:flex">
          <span className="flex items-center gap-1 text-zinc-400">
            <span className="bg-[#1f2e3d] text-zinc-200 px-1.5 py-0.5 rounded text-[8px] font-mono border border-white/5">←→</span> NAVEGAR
          </span>
          <span className="flex items-center gap-1 text-zinc-400">
            <span className="bg-[#1f2e3d] text-zinc-200 px-1.5 py-0.5 rounded text-[8px] font-mono border border-white/5">ENTER</span> CONFIRMAR
          </span>
        </div>
      </div>

      {/* Right Stats (Disk, SD Card, emulator integrations spec) */}
      <div className="flex items-center gap-6 ml-0 md:ml-auto text-xs font-mono select-none">
        <div className="hidden sm:flex flex-col items-end justify-center">
          <span className="text-[8px] font-bold uppercase text-zinc-450 tracking-wider">
            ESPAÇO DE ARMAZENAMENTO
          </span>
          <span className="text-[11px] font-black text-white">
            182.4 GB / 256 GB (SSD)
          </span>
        </div>
        <div className="w-10 h-10 bg-[#1e2e3d] rounded-lg border border-white/5 shadow-inner flex items-center justify-center" title="Cartão SD pronto para ROMs">
          <HardDrive className="w-5 h-5 text-emerald-400 glow-active" />
        </div>
      </div>
    </footer>
  );
};
