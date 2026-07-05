/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { System, Game } from '../types';
import { soundEngine } from './RetroSoundEngine';
import { UnsupportedGenerationView } from './UnsupportedGenerationView';
import { resolveGameRomUrl } from '../utils/romResolver';
import { 
  RotateCcw, 
  HelpCircle, 
  Maximize2, 
  Gamepad2, 
  AlertTriangle, 
  Cpu, 
  Sparkles,
  Info,
  X,
  Keyboard,
  Database,
  ShieldCheck
} from 'lucide-react';

interface EmulatorPlayerProps {
  system: System;
  game: Game;
  onClose: () => void;
}

// Maps our core format to EmulatorJS official short/core names
const getEmulatorJSCore = (shortName: string, emulatorCore: string): string => {
  const normalized = (shortName || '').toLowerCase();
  const coreInput = (emulatorCore || '').toLowerCase();

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
  if (normalized === 'atari' || normalized === 'atari2600' || coreInput === 'stella') return 'atari2600';
  if (normalized === 'nds' || normalized === 'ds') return 'nds';
  
  return emulatorCore || normalized;
};

const EmulatorPlayerInner: React.FC<EmulatorPlayerProps> = ({ system, game, onClose }) => {
  const [activeRomUrl, setActiveRomUrl] = useState<string>(game.romUrl || '');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const ejsCore = getEmulatorJSCore(system.shortName || system.id, system.emulatorCore);

  // Trigger sound feedback on mount and record to recently played list
  useEffect(() => {
    soundEngine.playSelect();

    // Persist to "Últimos Jogados" (Recently Played) in localStorage
    try {
      const raw = localStorage.getItem('retro_recently_played');
      let list: any[] = raw ? JSON.parse(raw) : [];

      // Remove existing occurrence to place it at the top
      list = list.filter((item: any) => !(item.systemId === system.id && item.title === game.title));

      // Unshift the newly played game
      list.unshift({
        systemId: system.id,
        systemName: system.name,
        gameId: game.id,
        title: game.title,
        image: game.image,
        genre: game.genre,
        year: game.year,
        developer: game.developer,
        timestamp: Date.now()
      });

      // Cap at 12 entries
      list = list.slice(0, 12);

      localStorage.setItem('retro_recently_played', JSON.stringify(list));

      // Dispatch event to inform other active components (e.g. search / carousel)
      window.dispatchEvent(new Event('retro_recently_played_updated'));
    } catch (e) {
      console.error('[RetroHub] Erro ao gravar histórico de reprodução:', e);
    }
  }, [system.id, game.id, game.title]);

  // Update URL if the base game prop changes
  useEffect(() => {
    setActiveRomUrl(game.romUrl || '');
    setErrorMessage(null);
    setIsLoading(true);
  }, [game]);

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

  // Helper to determine if we should proxy the ROM URL (to bypass CORS & redirects)
  const getEffectiveRomUrl = (url: string): string => {
    if (!url) return '';
    // Do not proxy blobs or data URIs
    if (url.startsWith('blob:') || url.startsWith('data:')) {
      return url;
    }

    let targetUrl = url;

    // Detect if this is a default local ROM path like "/roms/snes/Super Mario World (USA).zip"
    if (url.startsWith('/roms/')) {
      const parts = url.substring(6).split('/'); // ["snes", "Super Mario World (USA).zip"]
      if (parts.length >= 2) {
        const systemId = parts[0];
        const filename = parts.slice(1).join('/');
        targetUrl = resolveGameRomUrl(systemId, filename);
        console.log(`[EmulatorPlayer] Resolved local path ${url} to Archive.org ROM URL: ${targetUrl}`);
      }
    }

    // Detect Google Drive sharing links and convert them to direct download links
    const gdriveMatch = targetUrl.match(/(?:drive\.google\.com\/(?:file\/d\/|open\?id=)|docs\.google\.com\/file\/d\/)([a-zA-Z0-9_-]{25,})/);
    if (gdriveMatch && gdriveMatch[1]) {
      const fileId = gdriveMatch[1];
      targetUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    }

    // Wrap remote external URLs in the backend ROM proxy
    if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
      return `${window.location.origin}/api/rom-proxy?url=${encodeURIComponent(targetUrl)}`;
    }
    return `${window.location.origin}${targetUrl}`;
  };

  const [iframeSrc, setIframeSrc] = useState<string>('');

  // Build the dynamic self-contained content with perfect variables & loader loaded via Blob URL to preserve origin matching
  useEffect(() => {
    if (!activeRomUrl) return;

    const blobHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Emulator Console</title>
        <base href="${window.location.origin}/">
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
          window.EJS_gameUrl = '${getEffectiveRomUrl(activeRomUrl)}';
          window.EJS_pathtodata = 'https://cdn.emulatorjs.org/stable/data/';
          window.EJS_startOnLoaded = true;
          window.EJS_volume = 0.6;
          window.EJS_AdUrl = '';

          let fallbackAttempted = false;

          function handleLoadError() {
            if (!fallbackAttempted) {
              fallbackAttempted = true;
              console.warn("Primary EmulatorJS CDN failed to load. Attempting fallback CDN...");
              window.EJS_pathtodata = 'https://emulatorjs.github.io/cdn/';
              const script = document.createElement('script');
              script.src = 'https://emulatorjs.github.io/cdn/loader.js';
              script.onerror = function() {
                if (parent) {
                  parent.postMessage({ type: 'EJS_ERROR', message: 'Servidor EmulatorJS CDN indisponível.' }, '*');
                }
              };
              document.body.appendChild(script);
            } else {
              if (parent) {
                parent.postMessage({ type: 'EJS_ERROR', message: 'Servidor EmulatorJS CDN indisponível.' }, '*');
              }
            }
          }

          // Capture general runtime js errors (ignore harmless asset/resource load warnings)
          window.addEventListener('error', function(e) {
            if (!e.message) return;
            if (e.message.includes('handleLoadError')) return;
            if (parent) {
              parent.postMessage({ type: 'EJS_ERROR', message: e.message }, '*');
            }
          }, false);
        </script>
        <script src="https://cdn.emulatorjs.org/stable/data/loader.js" onerror="handleLoadError()"></script>
      </body>
      </html>
    `;

    const blob = new Blob([blobHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    setIframeSrc(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [activeRomUrl, ejsCore]);

  // Interceptador e higienizador avançado de event listeners para remover completamente listeners adicionados pelo EmulatorJS no document/window pai
  useEffect(() => {
    const registeredWindowListeners: { type: string; listener: any; options?: any }[] = [];
    const registeredDocumentListeners: { type: string; listener: any; options?: any }[] = [];

    const originalWindowAdd = window.addEventListener;
    const originalDocumentAdd = document.addEventListener;

    // Sobrescreve temporariamente addEventListener da janela pai
    window.addEventListener = function (type: string, listener: any, options?: any) {
      registeredWindowListeners.push({ type, listener, options });
      return originalWindowAdd.call(this, type, listener, options);
    };

    // Sobrescreve temporariamente addEventListener do documento pai
    document.addEventListener = function (type: string, listener: any, options?: any) {
      registeredDocumentListeners.push({ type, listener, options });
      return originalDocumentAdd.call(this, type, listener, options);
    };

    return () => {
      // Restaura as funções originais imediatamente
      window.addEventListener = originalWindowAdd;
      document.addEventListener = originalDocumentAdd;

      // Desregistra meticulosamente todos os listeners que vazaram durante a vida útil do emulador
      registeredWindowListeners.forEach(({ type, listener, options }) => {
        try {
          window.removeEventListener(type, listener, options);
        } catch (err) {
          // Falha silenciosa para máxima segurança operacional
        }
      });

      registeredDocumentListeners.forEach(({ type, listener, options }) => {
        try {
          document.removeEventListener(type, listener, options);
        } catch (err) {
          // Falha silenciosa para máxima segurança operacional
        }
      });
    };
  }, []);

  const reloadEmulator = () => {
    soundEngine.playToggle();
    setIsLoading(true);
    setErrorMessage(null);
    if (iframeRef.current && iframeSrc) {
      // Force iframe re-eval
      iframeRef.current.src = '';
      setTimeout(() => {
        if (iframeRef.current) iframeRef.current.src = iframeSrc;
      }, 50);
    }
  };

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
          <div className="hidden md:flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full text-[10px] text-emerald-400 font-mono font-bold tracking-wide uppercase">
            <Database className="w-3 h-3 text-emerald-400" />
            <span>Nuvem Ativa</span>
          </div>

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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-700 hover:bg-red-600 border border-red-500/30 text-white font-retro text-[9px] uppercase font-black tracking-widest shadow-lg transition cursor-pointer"
            title="Sair da Emulação"
          >
            <span>➔ Voltar</span>
          </button>
        </div>
      </div>

      {/* Main Sandbox Interactive Frame */}
      <div className="flex-1 relative bg-zinc-900 flex flex-col items-center justify-center overflow-hidden">
        
        {/* Real Dynamic Sandbox Iframe Loader */}
        {iframeSrc ? (
          <iframe
            ref={iframeRef}
            key={activeRomUrl} 
            src={iframeSrc}
            title={`Emulator Screen for ${game.title}`}
            sandbox="allow-scripts allow-same-origin allow-pointer-lock"
            allow="autoplay; gamepad; keyboard"
            className="w-full h-full border-0 bg-zinc-950 z-10"
            onLoad={() => {
              // Give a tiny buffer for cores to initiate
              setTimeout(() => setIsLoading(false), 800);
            }}
          />
        ) : null}

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
                <h3 className="font-display font-black text-lg text-white">Falha ao baixar ROM do acervo de preservação</h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-mono">
                  {errorMessage || 'Não conseguimos localizar o arquivo ROM configurado no servidor CDN de preservação digital.'}
                </p>
              </div>

              <div className="p-4 bg-yellow-500/5 rounded-xl border border-yellow-500/10 text-xs text-left space-y-2 font-sans">
                <p className="text-yellow-400 font-semibold flex items-center gap-1.5 leading-none">
                  <Info className="w-3.5 h-3.5" />
                  Como resolver isso agora mesmo?
                </p>
                <p className="text-zinc-400 text-[11px] leading-snug">
                  Como todos os jogos carregam de servidores de preservação integrados de alta velocidade, esta mensagem indica uma falha de conexão ou arquivo temporariamente offline. Por favor:
                </p>
                <ul className="list-disc pl-4 text-zinc-400 text-[11px] space-y-1 mt-1">
                  <li>Verifique sua conexão de rede.</li>
                  <li>Certifique-se de que nenhum bloqueador de anúncios ou firewall está impedindo a requisição do emulador.</li>
                  <li>Recarregue a página e tente dar boot novamente no jogo.</li>
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
                  Fechar Alerta
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Bottom control room dashboard bar */}
      <div className="bg-zinc-950 p-6 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 z-20">
        
        {/* Column 1: Ficha Técnica do Jogo */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-retro text-zinc-400 uppercase tracking-widest block">
              Especificações Técnicas
            </span>
          </div>
          <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-3">
            <div className="flex flex-wrap gap-2 text-[10px] font-mono">
              <span className="bg-zinc-800 border border-white/5 px-2.5 py-1 rounded text-zinc-300 font-semibold">{game.genre}</span>
              <span className="bg-zinc-850 border border-white/5 px-2.5 py-1 rounded text-zinc-400">{game.year}</span>
              <span className="bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded text-emerald-400 font-bold uppercase tracking-wide">
                Classificação 5★
              </span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed max-h-[85px] overflow-y-auto pr-1">
              {game.description || 'Nenhum resumo disponível para este título de console clássico.'}
            </p>
          </div>
        </div>

        {/* Column 2: Mapeamento de Teclas */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <Keyboard className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-retro text-zinc-400 uppercase tracking-widest block">
              Mapeamento de Teclas
            </span>
          </div>
          <div className="bg-white/5 border border-white/5 rounded-2xl p-4 font-mono text-[11px] text-zinc-300 space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex justify-between items-center bg-zinc-900/50 px-2.5 py-1.5 rounded-lg border border-white/5">
                <span className="text-zinc-500 text-[10px]">DIRECIONAL</span>
                <span className="text-emerald-400 font-semibold text-[10px]">Setas [←↑↓→]</span>
              </div>
              <div className="flex justify-between items-center bg-zinc-900/50 px-2.5 py-1.5 rounded-lg border border-white/5">
                <span className="text-zinc-500 text-[10px]">AÇÃO A/B</span>
                <span className="text-emerald-400 font-semibold text-[10px]">Teclas Z / X</span>
              </div>
              <div className="flex justify-between items-center bg-zinc-900/50 px-2.5 py-1.5 rounded-lg border border-white/5">
                <span className="text-zinc-500 text-[10px]">START</span>
                <span className="text-emerald-400 font-semibold text-[10px]">Enter ou Q</span>
              </div>
              <div className="flex justify-between items-center bg-zinc-900/50 px-2.5 py-1.5 rounded-lg border border-white/5">
                <span className="text-zinc-500 text-[10px]">SELECT</span>
                <span className="text-emerald-400 font-semibold text-[10px]">Shift Esq.</span>
              </div>
            </div>
            <div className="text-[9px] text-zinc-500 leading-normal bg-black/30 p-2 rounded-lg border border-white/5">
              💡 <span className="text-zinc-400">Controle USB:</span> Conecte um gamepad e aperte qualquer botão para mapear automaticamente.
            </div>
          </div>
        </div>

        {/* Column 3: Estado da Nuvem de Preservação */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <Database className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-retro text-zinc-400 uppercase tracking-widest block">
              Conexão Cloud CDN
            </span>
          </div>
          <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wide font-mono">
                  Transmissão Ativa
                </span>
              </div>
              <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded text-emerald-400 font-mono">
                SSL Seguro
              </span>
            </div>
            
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              O arquivo ROM deste cartucho clássico está sendo transmitido diretamente do <strong className="text-zinc-200 font-semibold">servidor de preservação CDN de alta velocidade</strong> com compressão de stream ativa.
            </p>

            <div className="flex items-center gap-2 text-[9px] text-zinc-500 border-t border-white/5 pt-2.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/70" />
              <span>Conexão privada de alta fidelidade, livre de anúncios.</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export const EmulatorPlayer: React.FC<EmulatorPlayerProps> = ({ system, game, onClose }) => {
  const isUnsupportedGeneration = [
    'playstation2', 'playstation3', 'xbox', 'xbox360',
    'saturn', 'ps1', 'playstation', 'arcade', 'neogeo',
    'nds', 'ds', 'pce', 'pcengine', '3do', 'dreamcast', 'gamecube'
  ].includes(system.id.toLowerCase());
  
  if (isUnsupportedGeneration) {
    return (
      <UnsupportedGenerationView system={system} game={game} onClose={onClose} />
    );
  }

  return <EmulatorPlayerInner system={system} game={game} onClose={onClose} />;
};
