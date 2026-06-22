/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sliders, Volume2, VolumeX, Zap, Sparkles, FolderHeart, Info, Check, Tv } from 'lucide-react';
import { soundEngine } from './RetroSoundEngine';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isMuted: boolean;
  toggleMute: () => void;
  isCrtEnabled: boolean;
  toggleCrt: () => void;
  onOpenDonateModal: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  isMuted,
  toggleMute,
  isCrtEnabled,
  toggleCrt,
  onOpenDonateModal
}) => {
  const [showTestConfirm, setShowTestConfirm] = useState(false);

  const handleToggleSound = () => {
    toggleMute();
    // Use a timeout to play sound AFTER toggle state applies
    setTimeout(() => {
      soundEngine.playSelect();
    }, 50);
  };

  const handleToggleCrt = () => {
    toggleCrt();
    setTimeout(() => {
      soundEngine.playSelect();
    }, 50);
  };

  const handleTestSound = () => {
    soundEngine.playSelect();
    setShowTestConfirm(true);
    setTimeout(() => setShowTestConfirm(false), 800);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="relative w-full max-w-md bg-gradient-to-b from-[#182535] to-[#0e1620] border-2 border-red-650/50 rounded-3xl p-6 sm:p-8 shadow-[0_20px_55px_rgba(0,0,0,0.9),0_0_40px_rgba(230,0,18,0.15)] text-left font-sans overflow-hidden"
          >
            {/* Efeitos visuais cibernéticos decorativos */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-red-600" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-red-600" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-red-600" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-red-600" />

            {/* Fechar */}
            <button
              onClick={() => {
                soundEngine.playBack();
                onClose();
              }}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white hover:rotate-90 transition-all duration-300 cursor-pointer p-1.5 rounded-full hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Cabeçalho */}
            <div className="flex items-center gap-3 mb-6 select-none">
              <Sliders className="w-5 h-5 text-red-500 animate-pulse" />
              <h2 className="text-lg font-black text-white uppercase tracking-wider">
                Ajustes e Preferências
              </h2>
            </div>

            {/* Seções de Ajustes */}
            <div className="space-y-6">
              {/* Opção 1: Controle de Som das Teclas */}
              <div className="bg-[#0b1118]/80 border border-white/5 rounded-2xl p-4 transition-all duration-300 hover:border-red-500/10">
                <div className="flex items-center justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2.5">
                    {isMuted ? (
                      <VolumeX className="w-4.5 h-4.5 text-zinc-400 shrink-0" />
                    ) : (
                      <Volume2 className="w-4.5 h-4.5 text-emerald-400 shrink-0 animate-bounce" />
                    )}
                    <div>
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                        Efeitos Sonoros 8-Bit
                      </h3>
                      <p className="text-[10px] text-zinc-400 font-medium">
                        Bipes nostálgicos ao navegar pelo console
                      </p>
                    </div>
                  </div>

                  {/* Toggle Retro */}
                  <button
                    onClick={handleToggleSound}
                    className={`relative w-12 h-6 rounded-full transition-all duration-300 p-0.5 cursor-pointer ${
                      !isMuted 
                        ? 'bg-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.35)]' 
                        : 'bg-zinc-800'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-all duration-300 ${
                        !isMuted ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Botão de Teste Rápido (Só aparece se o som estiver ativo) */}
                {!isMuted && (
                  <div className="mt-3 pt-3 border-t border-white/5 flex justify-end">
                    <button
                      onClick={handleTestSound}
                      className="px-3 py-1.5 bg-[#121c25] hover:bg-[#1e2e3d] text-[9px] font-mono font-bold text-zinc-300 hover:text-white rounded-lg border border-white/5 transition-all duration-250 cursor-pointer flex items-center gap-1.5"
                    >
                      {showTestConfirm ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>REPRODUZINDO...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 text-yellow-400" />
                          <span>TESTAR SOM RETRO</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Opção Nova: Filtro de Tela CRT (Tubo) */}
              <div className="bg-[#0b1118]/80 border border-white/5 rounded-2xl p-4 transition-all duration-300 hover:border-red-500/10">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <Tv className={`w-4.5 h-4.5 shrink-0 ${isCrtEnabled ? 'text-cyan-400 animate-pulse' : 'text-zinc-400'}`} />
                    <div>
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                        Filtro Retro CRT (Tubo)
                      </h3>
                      <p className="text-[10px] text-zinc-400 font-medium">
                        Simula as clássicas linhas de varredura e brilho de TV de tubo
                      </p>
                    </div>
                  </div>

                  {/* Toggle Retro CRT */}
                  <button
                    onClick={handleToggleCrt}
                    className={`relative w-12 h-6 rounded-full transition-all duration-300 p-0.5 cursor-pointer ${
                      isCrtEnabled 
                        ? 'bg-cyan-600 shadow-[0_0_8px_rgba(34,211,238,0.35)]' 
                        : 'bg-zinc-800'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-all duration-300 ${
                        isCrtEnabled ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Opção 2: Preservação Livre e Soberana */}
              <div className="bg-[#0b1118]/80 border border-white/5 rounded-2xl p-4 transition-all duration-300 hover:border-red-500/10">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-red-650/10 rounded-xl border border-red-500/20 text-red-500 shrink-0">
                    <FolderHeart className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1">
                      Financie a Preservação
                    </h3>
                    <p className="text-[10px] text-zinc-400 leading-relaxed">
                      Participe diretamente do armazenamento e manutenção do acervo supremo. Uma verdadeira máquina do tempo totalmente descentralizada.
                    </p>
                    <button
                      onClick={() => {
                        soundEngine.playSelect();
                        onClose();
                        onOpenDonateModal();
                      }}
                      className="mt-3.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white text-[10px] font-retro uppercase rounded-lg transition-all duration-300 cursor-pointer shadow-lg hover:shadow-red-500/25"
                    >
                      <Zap className="w-3 h-3 fill-white" />
                      <span>Fortalecer Acervo (⚡ Lightning)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Nota de Desempenho */}
              <div className="flex items-center gap-2 px-1 text-[9px] font-mono text-zinc-500 leading-relaxed uppercase">
                <Info className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                <span>O LordTecaRetro salva todas as preferências localmente.</span>
              </div>
            </div>

            {/* Rodapé Interno */}
            <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-[9px] font-mono text-zinc-600 select-none">
              <span>SISTEMA: V1.5.0</span>
              <span>ESTADO DO CORE: PRONTO</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
