/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HardDrive, Check, Copy, X, Sparkles, Trophy, Flame, Heart, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FooterProps {
  activeScreen: 'carousel' | 'gamelist';
  onGoBack?: () => void;
  systemName?: string;
  onSearchToggle?: () => void;
  onRandomGame?: () => void;
  isDonateOpen?: boolean;
  setIsDonateOpen?: (open: boolean) => void;
}

export const Footer: React.FC<FooterProps> = ({
  activeScreen,
  onGoBack,
  systemName,
  onSearchToggle,
  onRandomGame,
  isDonateOpen = false,
  setIsDonateOpen
}) => {
  const [localIsOpen, setLocalIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const isOpen = setIsDonateOpen ? isDonateOpen : localIsOpen;
  const setIsOpen = setIsDonateOpen ? setIsDonateOpen : setLocalIsOpen;
  
  // Endereço Lightning da Wallet of Satoshi
  const lnAddress = "securecorn53@walletofsatoshi.com"; 

  const handleCopy = () => {
    navigator.clipboard.writeText(lnAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>      <footer className="relative z-50 w-full min-h-[76px] bg-black/80 text-zinc-100 border-t border-white/10 overflow-hidden flex flex-col md:flex-row items-center justify-between px-6 md:px-10 py-3.5 gap-4 shadow-[0_-4px_30px_rgba(0,0,0,0.85)]">
        {/* Dynamic Key bindings legends */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
          {/* Dynamic A key action depending on screen */}
          <div className="flex items-center gap-2.5">
            <div className="w-[24px] h-[24px] rounded-full bg-[#E60012] text-white flex items-center justify-center text-[10px] font-black shadow-[0_0_12px_rgba(230,0,18,0.6)] border border-red-400 font-retro leading-none">
              A
            </div>
            <span className="text-[10px] font-mono font-black uppercase tracking-widest text-zinc-200">
              {activeScreen === 'carousel' ? 'Acessar Console' : 'Lançar Emulador'}
            </span>
          </div>

          {/* B Key - Back */}
          <div 
            onClick={activeScreen === 'gamelist' ? onGoBack : undefined}
            className={`flex items-center gap-2.5 ${activeScreen === 'gamelist' ? 'cursor-pointer hover:opacity-80 active:scale-95 transition-all' : ''}`}
          >
            <div className="w-[24px] h-[24px] rounded-full bg-[#eac428] text-zinc-950 flex items-center justify-center text-[10px] font-black shadow-[0_0_10px_rgba(234,196,40,0.4)] border border-yellow-450 font-retro leading-none">
              B
            </div>
            <span className="text-[10px] font-mono font-black uppercase tracking-widest text-zinc-200">
              {activeScreen === 'carousel' ? 'Voltar' : 'Voltar à Home'}
            </span>
          </div>

          {/* Y key - Search filter */}
          {activeScreen === 'gamelist' && onSearchToggle && (
            <button 
              onClick={onSearchToggle}
              className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-all"
            >
              <div className="w-[24px] h-[24px] rounded-full bg-cyan-600 text-white flex items-center justify-center text-[10px] font-black shadow-[0_0_10px_rgba(6,182,212,0.4)] border border-cyan-400 font-retro leading-none">
                Y
              </div>
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-zinc-200">
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
              <div className="w-[24px] h-[24px] rounded-full bg-blue-650 text-white flex items-center justify-center text-[10px] font-black shadow-[0_0_10px_rgba(59,130,246,0.4)] border border-blue-450 font-retro leading-none">
                X
              </div>
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-zinc-200">
                Sugerir Jogo
              </span>
            </button>
          )}

          {/* SELECT / START simulation */}
          <div className="flex items-center gap-4 text-[9px] font-mono font-black text-zinc-400 uppercase tracking-widest pl-3 border-l border-white/10 hidden xl:flex">
            <span className="flex items-center gap-1">
              <span className="bg-zinc-900 text-zinc-200 px-2 py-0.5 rounded border border-white/10">←→</span> NAVEGAR
            </span>
            <span className="flex items-center gap-1">
              <span className="bg-zinc-900 text-zinc-200 px-2 py-0.5 rounded border border-white/10">ENTER</span> JOGAR
            </span>
          </div>
        </div>

        {/* Right Stats & PNL Value-For-Value Channel */}
        <div className="flex items-center gap-6 ml-0 md:ml-auto text-xs font-mono select-none">
          {/* Botão de Alta CTR - Fortalecer o Acervo */}
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-rose-600/10 text-rose-400 hover:text-white rounded-xl border border-rose-500/15 hover:border-red-500/30 transition-all duration-300 cursor-pointer text-[10px] font-black uppercase tracking-widest group hover:scale-[1.02] active:scale-[0.98] shadow-md"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-500 group-hover:text-amber-500 group-hover:fill-amber-500 transition-colors" />
            Fortalecer Acervo
          </button>
        </div>
      </footer>

      {/* MODAL DE CONTRIBUIÇÃO SOBERANA (VALUE-FOR-VALUE) */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              className="relative w-full max-w-lg bg-gradient-to-b from-[#141d27] to-[#0b1016] border border-amber-500/25 rounded-3xl p-6 sm:p-8 shadow-[0_20px_55px_rgba(0,0,0,0.9),0_0_45px_rgba(245,158,11,0.06)] text-center font-sans overflow-hidden"
            >
              {/* Efeitos visuais cibernéticos decorativos (cantos retro-sci-fi HUD) */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-amber-500/20" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-amber-500/20" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-amber-500/20" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-amber-500/20" />
              
              {/* Fechar */}
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white hover:rotate-90 transition-all duration-300 cursor-pointer p-1.5 rounded-full hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Tag Superior - Alerta de Preservação */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/15 rounded-full mb-5 select-none text-[10px] text-amber-400 font-mono font-medium">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>PRESERVAÇÃO ATIVA</span>
              </div>
              
              {/* Título Forte */}
              <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight leading-tight select-none">
                Salvar Estado: infância
              </h3>

              {/* Texto Altamente Persuasivo com o Quarteto do Poder (Reciprocidade, Prova Social, Autoridade, Escassez) */}
              <p className="text-xs sm:text-[13px] text-zinc-300 mt-4 px-1 leading-relaxed text-justify sm:text-center">
                O LordTecaRetro é o maior portal independente dedicado à preservação cultural de jogos clássicos, operando sem fins lucrativos e livre da burocracia dos grandes estúdios. Nós garantimos que suas melhores memórias continuem jogáveis instantaneamente, sem anúncios irritantes e de graça. Mas, manter a infraestrutura de altíssima velocidade para alimentar este acervo de ROMs exige servidores de alto custo e banda dedicada.
              </p>
              <p className="text-xs sm:text-[13px] text-zinc-350 mt-3 px-1 leading-relaxed text-justify sm:text-center">
                Milhares de entusiastas de retrogaming financiam essa causa de forma colaborativa através do modelo descentralizado de Valor por Valor. Se os nossos emuladores resgataram um sorriso ou geraram valor real para o seu dia hoje, retribua de forma consciente enviando alguns satoshis. Jogadores soberanos preservam sua própria infância, o futuro dos clássicos depende do engajamento direto de quem joga.
              </p>

              {/* Bloco do QR Code Estilizado no Centro (Máximo CTR) */}
              <div className="my-6 inline-flex flex-col items-center">
                <div className="p-3.5 bg-white rounded-2xl relative shadow-2xl border-4 border-[#121c25] transition-all duration-300 hover:scale-[1.03]">
                  {/* Linhas de Scannable Scanner do HUD */}
                  <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-amber-500" />
                  <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-amber-500" />
                  <div className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 border-amber-500" />
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-amber-500" />
                  
                  <img 
                    src="/wos-qr.jpeg"
                    alt="Lightning Network QR Code"
                    className="w-40 h-40 object-contain rounded-lg"
                  />
                </div>
                <span className="text-[11px] font-sans font-bold text-amber-400 tracking-wide mt-3 px-4 text-center block select-none">
                  Abra sua Wallet of Satoshi e aponte a câmera para este QR code, o envio é instantâneo e sem taxas!
                </span>
              </div>

              {/* Input de Cópia de Alta Interatividade */}
              <div className="bg-[#0b1118]/90 border border-white/5 rounded-2xl p-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs max-w-sm mx-auto shadow-inner">
                <span className="text-zinc-350 truncate select-all px-2.5 text-[11px] w-full text-center sm:text-left selection:bg-amber-500 max-w-[200px] sm:max-w-xs">
                  {lnAddress}
                </span>
                
                <button
                  onClick={handleCopy}
                  className={`w-full sm:w-auto flex items-center justify-center gap-1.5 px-4.5 py-2.5 text-[10px] font-retro uppercase rounded-xl transition-all duration-300 shrink-0 cursor-pointer ${
                    copied 
                      ? 'bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.35)]' 
                      : 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-[0_0_10px_rgba(245,158,11,0.25)] font-bold'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Copiado!
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 fill-current" /> Copiar LNURL
                    </>
                  )}
                </button>
              </div>

              {/* Rodapé do Modal com Vibe Bitcoin Soberano */}
              <div className="mt-6 pt-3.5 border-t border-white/5 flex items-center justify-center gap-1.5 text-[9px] font-mono text-zinc-500 tracking-wider uppercase select-none">
                <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                <span>Movido a Bitcoin Lightning, Preservação Direta Sem Intermediários</span>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};