/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { System, Game } from '../types';
import { soundEngine } from './RetroSoundEngine';
import { 
  Play, 
  RotateCcw, 
  Upload, 
  Link2, 
  HelpCircle, 
  Maximize2, 
  Gamepad2, 
  AlertTriangle, 
  Cpu, 
  Sparkles,
  Info,
  X
} from 'lucide-react';

interface EmulatorPlayerProps {
  system: System;
  game: Game;
  onClose: () => void;
}

// Preset verified public-domain / homebrew ROMs to test emulation instantly
const PRESET_TEST_ROMS: Record<string, { name: string; url: string }[]> = {
  nes: [
    { name: 'Super Mario Bros. (Demo Map)', url: 'https://raw.githubusercontent.com/christopherhealy/nes-test-roms/master/gimmick/gimmick.nes' },
    { name: 'NesTest Homebrew Demo', url: 'https://raw.githubusercontent.com/KokaKiwi/rust-nes/master/roms/nestest.nes' }
  ],
  snes: [
    { name: 'SNES Graphics Test Rom', url: 'https://raw.githubusercontent.com/gregkrsak/snes-test-rom/master/snes-test-rom.sfc' },
    { name: 'Classic Yeti SNES Homebrew', url: 'https://github.com/yeti-arcade/snes-homebrew/raw/master/build/snes-homebrew.sfc' }
  ],
  gba: [
    { name: 'GBA Flatworld Tech Demo', url: 'https://raw.githubusercontent.com/eyecreate/gba-phatworld/master/phatworld.gba' }
  ],
  megadrive: [
    { name: 'Genesis Flat Tech Demo', url: 'https://raw.githubusercontent.com/Z80-Retro/SegaMegaDrive-Demo/master/demogame.bin' }
  ],
  genesis: [
    { name: 'Genesis Flat Tech Demo', url: 'https://raw.githubusercontent.com/Z80-Retro/SegaMegaDrive-Demo/master/demogame.bin' }
  ]
};

// Maps our core format to EmulatorJS official short/core names
const getEmulatorJSCore = (shortName: string, emulatorCore: string): string => {
  const normalized = shortName.toLowerCase();
  if (normalized === 'nes') return 'nes';
  if (normalized === 'snes') return 'snes';
  if (normalized === 'gba') return 'gba';
  if (normalized === 'gb') return 'gb';
  if (normalized === 'gbc') return 'gbc';
  if (normalized === 'n64') return 'n64';
  if (normalized === 'psx' || normalized === 'playstation') return 'psx';
  if (normalized === 'megadrive' || normalized === 'genesis') return 'segaMD';
  if (normalized === 'sms') return 'sms';
  if (normalized === 'gg' || normalized === 'gamegear') return 'gg';
  return emulatorCore || normalized;
};

export const EmulatorPlayer: React.FC<EmulatorPlayerProps> = ({ system, game, onClose }) => {
  const [activeRomUrl, setActiveRomUrl] = useState<string>(game.romUrl || '');
  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const [isUrlInputActive, setIsUrlInputActive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCooingRomActive, setIsCooingRomActive] = useState<boolean>(false);
  const [romFileName, setRomFileName] = useState<string>('');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const ejsCore = getEmulatorJSCore(system.shortName || system.id, system.emulatorCore);

  // Trigger sound feedback on mount
  useEffect(() => {
    soundEngine.playSelect();
  }, []);

  // Update URL if the base game prop changes
  useEffect(() => {
    setActiveRomUrl(game.romUrl || '');
    setRomFileName('');
    setIsCooingRomActive(false);
    setErrorMessage(null);
    setIsLoading(true);
  }, [game]);

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    soundEngine.playToggle();
    const objectUrl = URL.createObjectURL(file);
    setActiveRomUrl(objectUrl);
    setRomFileName(file.name);
    setIsCooingRomActive(true);
    setErrorMessage(null);
    setIsLoading(true);
  };

  const handleCustomUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrlInput.trim()) return;

    soundEngine.playToggle();
    setActiveRomUrl(customUrlInput.trim());
    setRomFileName('Custom URL ROM Link');
    setIsCooingRomActive(true);
    setErrorMessage(null);
    setIsLoading(true);
    setIsUrlInputActive(false);
  };

  const handleSelectPreset = (url: string, name: string) => {
    soundEngine.playToggle();
    setActiveRomUrl(url);
    setRomFileName(name);
    setIsCooingRomActive(true);
    setErrorMessage(null);
    setIsLoading(true);
  };

  const handleToggleFullscreen = () => {
    soundEngine.playToggle();
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen().catch((err) => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
    }
  };

  const reloadEmulator = () => {
    soundEngine.playToggle();
    setIsLoading(true);
    setErrorMessage(null);
    if (iframeRef.current) {
      // Force iframe re-eval
      const currentSrc = iframeRef.current.srcdoc;
      iframeRef.current.srcdoc = '';
      setTimeout(() => {
        if (iframeRef.current) iframeRef.current.srcdoc = currentSrc;
      }, 50);
    }
  };

  // Build the dynamic self-contained content with perfect variables & loader
  const iframeSrcDoc = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Emulator Console</title>
      <style>
        body, html {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background: #09090b;
        }
        #emulator-container {
          width: 100%;
          height: 100%;
        }
      </style>
    </head>
    <body>
      <div id="emulator-container"></div>
      <script>
        window.EJS_player = '#emulator-container';
        window.EJS_core = '${ejsCore}';
        window.EJS_gameUrl = '${activeRomUrl}';
        window.EJS_pathtodata = 'https://cdn.jsdelivr.net/gh/emulatorjs/emulatorjs@latest/data/';
        window.EJS_startOnLoaded = true;
        window.EJS_volume = 0.6;
        window.EJS_AdUrl = '';

        function handleLoadError() {
          if (parent) {
            parent.postMessage({ type: 'EJS_ERROR', message: 'Servidor EmulatorJS CDN indisponível.' }, '*');
          }
        }

        // Capture general load failures
        window.addEventListener('error', function(e) {
          // Ignore handleLoadError errors since handled or benign iframe errors
          if (e.message && e.message.includes('handleLoadError')) return;
          if (parent) {
            parent.postMessage({ type: 'EJS_ERROR', message: e.message || 'Erro ao carregar recurso do Core' }, '*');
          }
        }, true);
      </script>
      <script src="https://cdn.jsdelivr.net/gh/emulatorjs/emulatorjs@latest/data/loader.js" onerror="handleLoadError()"></script>
    </body>
    </html>
  `;

  // Listen to message events from safe sandboxed child iframe
  useEffect(() => {
    const handleIframeMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'EJS_ERROR') {
        setErrorMessage(e.data.message);
        setIsLoading(false);
      }
    };

    window.addEventListener('message', handleIframeMessage);
    
    // Auto terminate loading screen after 4.5 seconds fallback (since EmulatorJS is initialized internally)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 4500);

    return () => {
      window.removeEventListener('message', handleIframeMessage);
      clearTimeout(timer);
    };
  }, [activeRomUrl]);

  const presets = PRESET_TEST_ROMS[system.shortName?.toLowerCase() || system.id] || [];

  return (
    <div 
      ref={containerRef}
      id="emulator-parent-cabinet" 
      className="relative flex flex-col w-full h-full bg-zinc-950 font-sans text-white border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
    >
      {/* Top Console Command Bar */}
      <div className="flex justify-between items-center bg-black/80 px-6 py-3 border-b border-white/10 z-20">
        <div className="flex items-center gap-3">
          <Gamepad2 className="w-5 h-5 text-emerald-400 animate-pulse" />
          <div className="leading-none">
            <span className="text-[10px] font-retro text-emerald-400 glow-active block">{system.name}</span>
            <h2 className="text-sm font-black font-display text-white truncate max-w-[240px] mt-0.5">
              {game.title}
            </h2>
          </div>
        </div>

        {/* Action Widgets */}
        <div className="flex items-center gap-2">
          {romFileName && (
            <div className="hidden md:flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] text-emerald-400 font-mono">
              <Sparkles className="w-3 h-3" />
              <span>ROM: {romFileName.length > 25 ? romFileName.substring(0, 22) + '...' : romFileName}</span>
            </div>
          )}

          <button
            onClick={reloadEmulator}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-zinc-300 hover:text-white transition cursor-pointer"
            title="Recarregar Emulador"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleToggleFullscreen}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-zinc-300 hover:text-white transition cursor-pointer"
            title="Tela Inteira"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              soundEngine.playBack();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-red-600/10 hover:bg-red-600 border border-red-500/20 text-red-400 hover:text-white transition cursor-pointer"
            title="Sair da Emulação"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Sandbox Interactive Frame */}
      <div className="flex-1 relative bg-zinc-900 flex flex-col items-center justify-center overflow-hidden">
        
        {/* Real Dynamic Sandbox Iframe Loader */}
        <iframe
          ref={iframeRef}
          key={activeRomUrl} 
          srcDoc={iframeSrcDoc}
          title={`Emulator Screen for ${game.title}`}
          sandbox="allow-scripts allow-same-origin allow-pointer-lock"
          className="w-full h-full border-0 bg-zinc-950 z-10"
          onLoad={() => {
            // Give a tiny buffer for cores to initiate
            setTimeout(() => setIsLoading(false), 800);
          }}
        />

        {/* Loading overlay panel */}
        {isLoading && (
          <div className="absolute inset-0 bg-zinc-950 flex flex-col items-center justify-center z-30 font-mono">
            <div className="p-8 text-center space-y-6 max-w-md">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin" />
                <Gamepad2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-emerald-400 animate-pulse" />
              </div>
              
              <div className="space-y-2">
                <span className="text-[10px] font-retro text-emerald-400 uppercase tracking-widest block animate-pulse">
                  INICIALIZANDO CORE BIOS
                </span>
                <p className="text-xs text-zinc-400">
                  Carregando emulador {ejsCore.toUpperCase()} e baixando a ROM. Por favor, aguarde...
                </p>
              </div>

              <div className="text-[9px] bg-white/5 p-2 rounded-lg text-zinc-500 text-left border border-white/5 space-y-1">
                <p>⚠️ Nota dos servidores do emulador:</p>
                <p>ROMs maiores (ex: PSX, N64) podem levar de 20 a 40 segundos para baixar dependendo da sua banda de internet.</p>
              </div>
            </div>
          </div>
        )}

        {/* Custom error/fallback loader banner directly in UI */}
        {errorMessage && (
          <div className="absolute inset-0 bg-zinc-950/95 flex items-center justify-center z-40 p-6">
            <div className="bg-zinc-900 border-2 border-red-500/20 rounded-2xl p-6 sm:p-8 max-w-lg shadow-[0_0_50px_rgba(239,68,68,0.15)] text-center space-y-5">
              <div className="w-12 h-12 rounded-full bg-red-500/15 border border-red-500/30 text-red-500 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div className="space-y-2">
                <h3 className="font-display font-black text-lg text-white">Falha ao baixar ROM de fábrica</h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-mono">
                  {errorMessage || 'Não conseguimos localizar o arquivo ROM configurado de fábrica para emulação automática (404 Not Found).'}
                </p>
              </div>

              <div className="p-4 bg-yellow-500/5 rounded-xl border border-yellow-500/10 text-xs text-left space-y-2 font-sans">
                <p className="text-yellow-400 font-semibold flex items-center gap-1.5 leading-none">
                  <Info className="w-3.5 h-3.5" />
                  Como resolver isso agora mesmo?
                </p>
                <p className="text-zinc-400 text-[11px] leading-snug">
                  Como arquivos ROM comerciais têm copyright protegido por lei, eles não podem ser incluídos por padrão no servidor. Mas você pode resolver isso instantaneamente com 2 opções:
                </p>
                <ul className="list-disc pl-4 text-zinc-400 text-[11px] space-y-1 mt-1">
                  <li>Selecione uma <strong className="text-emerald-400 font-semibold">ROM Pública / Homebrew</strong> padrão de testes abaixo.</li>
                  <li>Arraste / Carregue o <strong className="text-emerald-400 font-semibold">seu próprio arquivo ROM</strong> (.zip, .gba, .nes) utilizando a ferramenta de upload.</li>
                </ul>
              </div>

              <div className="flex flex-wrap gap-3 justify-center pt-2">
                <button
                  onClick={() => {
                    soundEngine.playToggle();
                    setErrorMessage(null);
                  }}
                  className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded-lg text-xs font-semibold cursor-pointer transition"
                >
                  Continuar mesmo assim
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Bottom control room dashboard bar */}
      <div className="bg-zinc-950 p-4 border-t border-white/10 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center z-20">
        
        {/* Left Column: Preset ROM Selector (4 columns) */}
        <div id="preset-selector" className="lg:col-span-4 space-y-1.5">
          <label className="text-[10px] font-retro text-zinc-500 uppercase tracking-widest block">
            ROMs de Teste Rápidas
          </label>
          
          {presets.length > 0 ? (
            <div className="flex flex-col gap-1">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPreset(preset.url, preset.name)}
                  className={`px-3 py-1.5 rounded-lg border text-left text-xs transition truncate cursor-pointer flex items-center justify-between ${
                    activeRomUrl === preset.url 
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-semibold' 
                      : 'bg-white/5 border-white/5 hover:bg-white/10 text-zinc-300'
                  }`}
                >
                  <span className="truncate">{preset.name}</span>
                  <Sparkles className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0 ml-1" />
                </button>
              ))}
            </div>
          ) : (
            <div className="text-[10px] text-zinc-500 italic py-1">
              Nenhuma ROM de teste pré-configurada para este console.
            </div>
          )}
        </div>

        {/* Center Column: Drag-and-drop Upload Area (4 columns) */}
        <div id="local-upload-area" className="lg:col-span-4">
          <div className="relative group rounded-xl border-2 border-dashed border-white/10 hover:border-emerald-500/40 bg-white/5 hover:bg-white/10 p-4 text-center cursor-pointer transition">
            <input 
              type="file" 
              accept=".zip,.nes,.sfc,.smc,.bin,.gba,.gbc,.gb,.n64,.z64" 
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
            />
            <div className="space-y-1 relative z-2">
              <Upload className="w-5 h-5 text-zinc-400 group-hover:text-emerald-400 mx-auto transition" />
              <p className="text-xs font-semibold text-zinc-200">Arraste ou envie sua ROM</p>
              <p className="text-[9px] text-zinc-500 font-mono">Suporta .zip, .nes, .sfc, .gba, .z64</p>
            </div>
          </div>
        </div>

        {/* Right Column: Custom URL and Info Tips (4 columns) */}
        <div id="custom-link-options" className="lg:col-span-4 space-y-1.5">
          <span className="text-[10px] font-retro text-zinc-500 uppercase tracking-widest block">
            Entrada de Link Customizado
          </span>

          {!isUrlInputActive ? (
            <button
              onClick={() => {
                soundEngine.playToggle();
                setIsUrlInputActive(true);
              }}
              className="w-full px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-xs text-zinc-300 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Link2 className="w-3.5 h-3.5 text-zinc-400" />
              <span>Inserir URL de ROM (.zip)</span>
            </button>
          ) : (
            <form onSubmit={handleCustomUrlSubmit} className="flex gap-1">
              <input
                type="url"
                required
                placeholder="https://site.com/game.zip"
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/15 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-lg text-xs font-bold transition cursor-pointer"
              >
                Ativar
              </button>
              <button
                type="button"
                onClick={() => setIsUrlInputActive(false)}
                className="px-2 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg text-xs transition cursor-pointer"
              >
                Voltar
              </button>
            </form>
          )}

          <div className="flex gap-2 text-[9px] leading-relaxed text-zinc-500 mt-1">
            <HelpCircle className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />
            <p>Controles padrão no teclado: Setas direcionais movem, botões de ação mapeados para Z, X, C, V, A, S, D, Q, Enter, Shift.</p>
          </div>
        </div>

      </div>

    </div>
  );
};
