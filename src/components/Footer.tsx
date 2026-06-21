/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HardDrive, Heart, Coffee, Copy, Check, QrCode, X } from 'lucide-react';

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
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Endereço Lightning da Wallet of Satoshi
  const lnAddress = "lordjunnior@walletofsatoshi.com"; 

  const handleCopy = () => {
    navigator.clipboard.writeText(lnAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
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

        {/* Right Stats & PNL Value-For-Value Channel */}
        <div className="flex items-center gap-6 ml-0 md:ml-auto text-xs font-mono select-none">
          {/* Botão Invisível de Alta CTR - Fortalecer o Acervo */}
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#1e2e3d]/80 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-lg border border-white/5 hover:border-red-500/40 transition-all duration-300 cursor-pointer text-[10px] font-bold uppercase tracking-wider group shadow-md"
          >
            <Coffee className="w-3.5 h-3.5 text-red-500 group-hover:animate-bounce" />
            Fortalecer Acervo
          </button>

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

      {/* MODAL DE CONTRIBUIÇÃO SOBERANA (VALUE-FOR-VALUE) */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-sm bg-[#151f2c] border border-white/10 rounded-2xl p-6 shadow-2xl text-center font-sans">
            
            {/* Fechar */}
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Ícone Redondo */}
            <div className="flex justify-center mb-3">
              <div className="p-3 bg-red-600/10 rounded-full border border-red-500/20">
                <Heart className="w-6 h-6 text-red-500 fill-red-500/20" />
              </div>
            </div>
            
            {/* Copy em PNL / Reciprocidade */}
            <h3 className="text-lg font-black text-white uppercase tracking-tight">Valor por Valor</h3>
            <p className="text-xs text-zinc-400 mt-1 px-2 leading-relaxed">
              O LordTecaRetro é um projeto independente, livre de anúncios ou travas. Se o acervo gerou valor e nostalgia para você hoje, sinta-se convidado a equilibrar essa balança fortalecendo a infraestrutura com alguns satoshis via Lightning Network.
            </p>

            {/* Bloco do QR Code */}
            <div className="my-5 p-4 bg-white rounded-xl inline-block shadow-inner relative group">
              <img 
                src="/wos-qr.jpeg"
                alt="Lightning Network QR Code"
                className="w-44 h-44 object-contain rounded-lg"
              />
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center pointer-events-none">
                <QrCode className="w-8 h-8 text-black/40" />
              </div>
            </div>

            {/* Input de Cópia Rápida */}
            <div className="bg-black/40 border border-white/5 rounded-xl p-3 flex items-center justify-between gap-2 font-mono text-xs">
              <span className="text-zinc-400 truncate select-all">{lnAddress}</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-all duration-200 cursor-pointer text-[10px] uppercase shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3" /> Copiado
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" /> Copiar LNURL
                  </>
                )}
              </button>
            </div>

            {/* Rodapé SEO / Autenticidade */}
            <div className="mt-4 text-[10px] font-mono text-zinc-500 tracking-wide uppercase">
              ⚡ Powered by Bitcoin Lightning Network
            </div>

          </div>
        </div>
      )}
    </>
  );
};