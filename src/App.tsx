/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { systemsData, parseRawSystems } from './data/systemsData';
import { System, Game } from './types';
import { BackgroundHero } from './components/BackgroundHero';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SettingsModal } from './components/SettingsModal';
import { SystemCarousel, systemSpecsMap } from './components/SystemCarousel';
import { GamelistView } from './components/GamelistView';
import { GameDetailView } from './components/GameDetailView';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { getGameSlug, findGameBySlug } from './utils/routeUtils';
import { soundEngine } from './components/RetroSoundEngine';
import { motion, AnimatePresence } from 'motion/react';

// Force synchronous route reset on application init/reload to prevent landing inside emulators
if (typeof window !== 'undefined') {
  if (window.location.hash) {
    window.location.hash = '';
  }
  if (window.location.pathname !== '/') {
    window.history.replaceState(null, '', '/');
  }
}

export default function App() {
  // Dynamic JSON database state
  const [systems, setSystems] = useState<System[]>(systemsData);
  const [isLoadingDb, setIsLoadingDb] = useState<boolean>(true);

  // Helper function to sync favorites from localStorage or initialize with defaults
  const applySavedFavorites = (systemsList: System[]): System[] => {
    try {
      const raw = localStorage.getItem('retro_favorites');
      if (!raw) {
        // Create initial favorites array using defaults
        const initialFavs: string[] = [];
        systemsList.forEach(sys => {
          sys.games.forEach(g => {
            if (g.favorite) {
              initialFavs.push(`${sys.id}::${g.title}`);
            }
          });
        });
        localStorage.setItem('retro_favorites', JSON.stringify(initialFavs));
        return systemsList;
      }

      const favoriteKeys: string[] = JSON.parse(raw);
      return systemsList.map(sys => ({
        ...sys,
        games: sys.games.map(g => ({
          ...g,
          favorite: favoriteKeys.includes(`${sys.id}::${g.title}`)
        }))
      }));
    } catch (e) {
      console.error('[RetroHub] Erro ao aplicar favoritos salvos:', e);
      return systemsList;
    }
  };

  const handleToggleFavorite = (systemId: string, gameTitle: string) => {
    try {
      const raw = localStorage.getItem('retro_favorites');
      let favoriteKeys: string[] = [];
      const compositeKey = `${systemId}::${gameTitle}`;

      if (raw) {
        favoriteKeys = JSON.parse(raw);
      } else {
        const currentFavs: string[] = [];
        systems.forEach(sys => {
          sys.games.forEach(g => {
            if (g.favorite) {
              currentFavs.push(`${sys.id}::${g.title}`);
            }
          });
        });
        favoriteKeys = currentFavs;
      }

      if (favoriteKeys.includes(compositeKey)) {
        favoriteKeys = favoriteKeys.filter(k => k !== compositeKey);
      } else {
        favoriteKeys.push(compositeKey);
      }

      localStorage.setItem('retro_favorites', JSON.stringify(favoriteKeys));

      // Update state
      setSystems(prevSystems => 
        prevSystems.map(sys => {
          if (sys.id !== systemId) return sys;
          return {
            ...sys,
            games: sys.games.map(g => {
              if (g.title !== gameTitle) return g;
              return {
                ...g,
                favorite: !g.favorite
              };
            })
          };
        })
      );
    } catch (e) {
      console.error('[RetroHub] Erro ao alternar favorito:', e);
    }
  };

  useEffect(() => {
    fetch('/db.json')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Falha ao buscar banco de dados local.');
        }
        return res.json();
      })
      .then((data) => {
        const parsed = parseRawSystems(data);
        const parsedMap = new Map<string, System>();
        parsed.forEach(sys => parsedMap.set(sys.id, sys));

        // Let's iterate through the complete baseline systemsData, updating only the games/details from parsed list if available, keeping everything else fully intact
        const merged = systemsData.map(initialSys => {
          const updatedSys = parsedMap.get(initialSys.id) || initialSys;
          
          const custom = localStorage.getItem(`retro_custom_system_${initialSys.id}`);
          let updatedGames = [...updatedSys.games];
          if (custom) {
            try {
              const customGames = JSON.parse(custom);
              const nonDuplicated = customGames.filter((cg: Game) => !updatedGames.some(g => g.id === cg.id));
              updatedGames = [...updatedGames, ...nonDuplicated];
            } catch (e) {
              console.error('[RetroHub] Erro ao analisar jogos customizados do localStorage de: ' + initialSys.id, e);
            }
          }
          return {
            ...updatedSys,
            gameCount: updatedGames.length,
            games: updatedGames
          };
        });

        setSystems(applySavedFavorites(merged));
        setIsLoadingDb(false);
        console.log('[RetroHub] Banco de dados JSON de consoles e jogos carregado dinamicamente com sucesso!');
      })
      .catch((err) => {
        console.error('[RetroHub] Erro ao carregar banco de dados JSON:', err);
        
        // Fallback merge
        const mergedFallback = systemsData.map(sys => {
          const custom = localStorage.getItem(`retro_custom_system_${sys.id}`);
          let updatedGames = [...sys.games];
          if (custom) {
            try {
              const customGames = JSON.parse(custom);
              const nonDuplicated = customGames.filter((cg: Game) => !updatedGames.some(g => g.id === cg.id));
              updatedGames = [...updatedGames, ...nonDuplicated];
            } catch (e) {
              console.error(e);
            }
          }
          return {
            ...sys,
            gameCount: updatedGames.length,
            games: updatedGames
          };
        });

        setSystems(applySavedFavorites(mergedFallback));
        setIsLoadingDb(false); // fallback to initial imported systemsData
      });
  }, []);

  // Navigation states
  const [activeScreen, setActiveScreen] = useState<'carousel' | 'gamelist'>('carousel');
  const [selectedSystemId, setSelectedSystemId] = useState<string>('nes');
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Settings states with localStorage cache
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('retro_muted') === 'true';
    }
    return false;
  });

  const [isCrtEnabled, setIsCrtEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('retro_crt') === 'true';
    }
    return false;
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isDonateOpen, setIsDonateOpen] = useState<boolean>(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState<boolean>(false);

  // Global keyboard shortcut for search (S, F, or Ctrl+K)
  useEffect(() => {
    const handleGlobalKeyDown = (e: globalThis.KeyboardEvent): void => {
      if (isGlobalSearchOpen) return;

      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.getAttribute('contenteditable') === 'true')) {
        return;
      }

      const key = e.key.toLowerCase();
      if (key === 's' || key === 'f' || ((e.ctrlKey || e.metaKey) && key === 'k')) {
        e.preventDefault();
        setIsGlobalSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isGlobalSearchOpen]);

  // Path-based HTML5 Location Router Synchronization
  const [currentPath, setCurrentPath] = useState<string>('/');

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToPath = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  const isGameDetailPage = currentPath.startsWith('/game/');
  const gameSlug = isGameDetailPage ? currentPath.substring(6) : '';
  const gameMatch = isGameDetailPage ? findGameBySlug(gameSlug, systems) : null;

  // Auto-redirect to home on invalid game slugs so user is never stuck
  useEffect(() => {
    if (isGameDetailPage && !gameMatch && !isLoadingDb) {
      navigateToPath('/');
    }
  }, [isGameDetailPage, gameMatch, isLoadingDb]);

  // Apply sound volume configuration
  useEffect(() => {
    soundEngine.setMuted(isMuted);
    localStorage.setItem('retro_muted', String(isMuted));
  }, [isMuted]);

  // Synchronize CRT configuration
  useEffect(() => {
    localStorage.setItem('retro_crt', String(isCrtEnabled));
  }, [isCrtEnabled]);

  // Forçar sempre a tela inicial (carousel) e a rota raiz no primeiro carregamento do aplicativo ou ao atualizar a página (reload)
  useEffect(() => {
    if (window.location.hash) {
      window.location.hash = '';
    }
    if (window.location.pathname !== '/') {
      window.history.replaceState(null, '', '/');
      setCurrentPath('/');
    }
  }, []);

  // URL Hash-based robust SPA Router emulation.
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/system/')) {
        const sysId = hash.replace('#/system/', '');
        const matchedIndex = systems.findIndex((s) => s.id === sysId);
        if (matchedIndex !== -1) {
          setSelectedSystemId(sysId);
          setCarouselIndex(matchedIndex);
          setActiveScreen('gamelist');
          return;
        }
      }
      // Default fallback
      setActiveScreen('carousel');
    };

    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [systems]);

  const currentSystem = systems[carouselIndex] || systems[0] || systemsData[0];

  const handleSelectSystemFromCarousel = (system: System) => {
    soundEngine.playSelect();
    window.location.hash = `#/system/${system.id}`;
  };

  const handleReturnToCarousel = () => {
    soundEngine.playBack();
    window.location.hash = '';
  };

  // Setup auxiliary Escape key bindings to return
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent): void => {
      if (e.key === 'Escape' && activeScreen === 'gamelist' && !isGameDetailPage) {
        handleReturnToCarousel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeScreen, isGameDetailPage]);

  // Dynamic SEO Metadata & OpenGraph Synchronization
  useEffect(() => {
    let title = 'LordTecaRetro | Sua Infância em um Clique';
    let description = 'Todos os clássicos da sua infância, direto no navegador. Sem instalar nada.';
    let imageUrl = 'https://lordtecaretro.vercel.app/og-image.svg';
    const pageUrl = window.location.href;

    if (isGameDetailPage && gameMatch) {
      const { game, system } = gameMatch;
      title = `${game.title} (${system.name}) | LordTecaRetro`;
      description = `Jogue o clássico ${game.title} para o console ${system.name} online direto no seu navegador com emulador 100% gratuito e sem instalar nada!`;
      if (game.image) {
        imageUrl = game.image;
      }
    } else if (activeScreen === 'gamelist' && currentSystem) {
      title = `Jogos de ${currentSystem.name} | LordTecaRetro`;
      description = `Explore e jogue online a coleção completa de jogos clássicos do console ${currentSystem.name} (${currentSystem.manufacturer || 'Retro Console'}) no LordTecaRetro.`;
    }

    // Update document title
    document.title = title;

    // Helper to safely select and update or append a meta element
    const updateOrCreateMeta = (attrName: string, attrVal: string, contentVal: string) => {
      try {
        let meta = document.querySelector(`meta[${attrName}="${attrVal}"]`);
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute(attrName, attrVal);
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', contentVal);
      } catch (err) {
        console.warn('[RetroHub] Erro ao sincronizar metatag:', attrVal, err);
      }
    };

    // Update crucial SEO and Social OpenGraph/Twitter Metatags
    updateOrCreateMeta('name', 'description', description);
    updateOrCreateMeta('property', 'og:title', title);
    updateOrCreateMeta('property', 'og:description', description);
    updateOrCreateMeta('property', 'og:image', imageUrl);
    updateOrCreateMeta('property', 'og:url', pageUrl);
    updateOrCreateMeta('property', 'twitter:title', title);
    updateOrCreateMeta('property', 'twitter:description', description);
    updateOrCreateMeta('property', 'twitter:image', imageUrl);
    updateOrCreateMeta('property', 'twitter:url', pageUrl);
  }, [isGameDetailPage, gameMatch, activeScreen, currentSystem, currentPath]);

  // Handle active rendering of Individual Game Details view matching /game/[slug]
  if (isGameDetailPage && gameMatch) {
    return (
      <div id="retro-game-details" className="relative w-full h-screen bg-zinc-950 text-white font-sans overflow-hidden select-none">
        <GameDetailView
          system={gameMatch.system}
          game={gameMatch.game}
          onBack={() => {
            navigateToPath('/');
            window.location.hash = `#/system/${gameMatch.system.id}`;
          }}
          onNavigateToPath={navigateToPath}
          isMuted={isMuted}
          toggleMute={() => setIsMuted(prev => !prev)}
          onToggleFavorite={handleToggleFavorite}
        />
      </div>
    );
  }

  return (
    <div id="retro-hub-root" className="relative w-full min-h-screen bg-[#050508] text-white font-sans overflow-y-auto overflow-x-hidden flex flex-col justify-between select-none">
      
      {/* 1. COMPONENTES ESTÁTICOS DE FUNDO (Sempre renderizados para alinhar com o console ativo) */}
      {(() => {
        const currentConsoleKey = currentSystem ? currentSystem.id.toLowerCase().trim().replace(/[\s\-_]/g, '') : 'nes';
        const activeGlowColor = systemSpecsMap[currentConsoleKey]?.glowColor;
        return (
          <>
            <BackgroundHero systemId={currentSystem.id} glowColor={activeGlowColor} activeScreen={activeScreen} />
            <div 
              className="absolute inset-0 pointer-events-none transition-all duration-700" 
              style={{
                backgroundImage: `radial-gradient(circle at 50% -25%, ${activeGlowColor || 'rgba(230,0,18,0.12)'}, transparent 75%)`
              }}
            />
            {activeScreen === 'carousel' && (
              <Header
                isMuted={isMuted}
                toggleMute={() => setIsMuted(prev => !prev)}
                title={undefined}
                onGoBack={undefined}
                onSearchClick={() => setIsGlobalSearchOpen(true)}
                onSettingsClick={() => setIsSettingsOpen(true)}
                glowColor={activeGlowColor}
              />
            )}
          </>
        );
      })()}

      {/* 2. PROVEDOR DE TELAS RETRO EM TELA CHEIA */}
      <main className="relative z-10 flex-1 flex flex-col justify-start items-center w-full min-h-0">
        <AnimatePresence mode="wait">
          {activeScreen === 'carousel' ? (
            <motion.div
              key="carousel-screen"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="w-full flex-1 flex flex-col justify-start py-6"
            >
              <SystemCarousel
                systems={systems}
                activeIndex={carouselIndex}
                setActiveIndex={setCarouselIndex}
                onSelectSystem={handleSelectSystemFromCarousel}
              />
            </motion.div>
          ) : (
            <motion.div
              key="gamelist-screen"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="w-full flex-1 flex flex-col min-h-0"
            >
              <GamelistView
                system={currentSystem}
                onBack={handleReturnToCarousel}
                isMuted={isMuted}
                toggleMute={() => setIsMuted(prev => !prev)}
                onSwitchSystemId={(sysId) => {
                  window.location.hash = `#/system/${sysId}`;
                }}
                onToggleFavorite={handleToggleFavorite}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 3. FOOTER AUXILIAR FLUTUANTE SÓ EXIBIDO NA TELA INICIAL */}
      {activeScreen === 'carousel' && (
        <Footer
          activeScreen={activeScreen}
          onGoBack={handleReturnToCarousel}
          systemName={currentSystem.name}
          onSearchToggle={() => setIsGlobalSearchOpen(true)}
          isDonateOpen={isDonateOpen}
          setIsDonateOpen={setIsDonateOpen}
        />
      )}

      {/* MODAL GLOBAL DE BUSCA */}
      <GlobalSearchModal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
        systems={systems}
        onSelectGame={(system, game) => {
          soundEngine.playSelect();
          const sysIndex = systems.findIndex(s => s.id === system.id);
          if (sysIndex !== -1) {
            setCarouselIndex(sysIndex);
          }
          navigateToPath(`/game/${getGameSlug(system.id, game.title)}`);
        }}
        onSelectSystem={(system) => {
          soundEngine.playSelect();
          const sysIndex = systems.findIndex(s => s.id === system.id);
          if (sysIndex !== -1) {
            setCarouselIndex(sysIndex);
            window.location.hash = `#/system/${system.id}`;
          }
         }}
      />

      {/* MODAL GLOBAL DE PREFERÊNCIAS */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isMuted={isMuted}
        toggleMute={() => setIsMuted(prev => !prev)}
        isCrtEnabled={isCrtEnabled}
        toggleCrt={() => setIsCrtEnabled(prev => !prev)}
        onOpenDonateModal={() => setIsDonateOpen(true)}
      />
    </div>
  );
}