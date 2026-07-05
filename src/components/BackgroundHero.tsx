/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getRecalboxArtName, VERIFIED_ARTS } from '../utils/logoResolver';

interface BackgroundHeroProps {
  systemId: string;
  glowColor?: string;
  activeScreen?: 'carousel' | 'gamelist';
}

export const BackgroundHero: React.FC<BackgroundHeroProps> = ({ systemId, glowColor, activeScreen = 'carousel' }) => {
  const isMainScreen = activeScreen === 'carousel';
  const logoUrl = "/logos/backgrounds/logo.jpeg";
  
  const logoFileName = getRecalboxArtName(systemId);
  const consoleArtUrl = VERIFIED_ARTS.has(logoFileName)
    ? `https://raw.githubusercontent.com/lordjunnior/recalbox-theme/main/assets/arts/${logoFileName}.jpg`
    : `https://raw.githubusercontent.com/lordjunnior/recalbox-theme/main/assets/arts/favorites.jpg`;

  const targetUrl = isMainScreen ? logoUrl : consoleArtUrl;

  const [currentUrl, setCurrentUrl] = useState<string>(targetUrl);
  const [hasFailedAll, setHasFailedAll] = useState<boolean>(false);

  // Keep the background reactive to changes
  useEffect(() => {
    setCurrentUrl(targetUrl);
    setHasFailedAll(false);
  }, [targetUrl, systemId]);

  const handleError = () => {
    // If it's a modern/3D console, avoid falling back to favorites.jpg which features retro character artwork (Mario, Sonic, Megaman).
    // Instead, fail gracefully to a clean, highly elegant dark dashboard matching the console's glow color.
    const cleanId = systemId.toLowerCase().trim();
    const isModern = ['ps1', 'psx', 'playstation', 'ps2', 'playstation2', 'ps3', 'playstation3', 'xbox', 'xboxclassic', 'xbox360', 'dreamcast', 'gamecube', 'gc', 'saturn'].some(
      m => cleanId.includes(m)
    );

    if (isModern) {
      setHasFailedAll(true);
      return;
    }

    const fallbackUrl = `https://raw.githubusercontent.com/lordjunnior/recalbox-theme/main/assets/arts/favorites.jpg`;
    if (currentUrl !== fallbackUrl) {
      setCurrentUrl(fallbackUrl);
    } else {
      setHasFailedAll(true);
    }
  };

  return (
    <div className="absolute inset-0 z-0 select-none overflow-hidden pointer-events-none">
      {/* Fundo preto padrão (#030305) se tudo falhar */}
      <div className="absolute inset-0 bg-[#030305] z-[-2]" />

      {/* Dynamic imagery layer with smooth fade */}
      <AnimatePresence mode="popLayout">
        {!hasFailedAll && (
          isMainScreen ? (
            // Para a tela principal (carousel), usamos o logo.jpeg com zoom e preenchimento total de tela (object-cover)
            <motion.img
              key="main-logo-bg"
              src={currentUrl}
              alt="Main Background"
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 0.32, scale: 1.03 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              onError={handleError}
              className="absolute inset-0 w-full h-full object-cover z-[-1] select-none pointer-events-none"
              referrerPolicy="no-referrer"
            />
          ) : (
            // Para a tela de lista de jogos ("dentro do console"), usamos o fundo do console correspondente
            // em tela cheia (object-cover) com transições suaves como era antes!
            <motion.img
              key={currentUrl}
              src={currentUrl}
              alt={`${systemId} Background`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.28 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
              onError={handleError}
              className="absolute inset-0 w-full h-full object-cover z-[-1] select-none pointer-events-none"
              referrerPolicy="no-referrer"
            />
          )
        )}
      </AnimatePresence>

      {/* Overlay escuro de opacidade 0.35 para garantir alta legibilidade do texto frontal */}
      <div className="absolute inset-0 bg-black/35 z-[-1]" />

      {/* Dynamic Ambient fusion vignette - blends the artwork edges into the dark layout */}
      <div 
        className="absolute inset-0 z-[-1] transition-all duration-700"
        style={{
          background: `radial-gradient(circle at center, transparent 35%, rgba(5, 5, 8, 0.75) 75%, #050508 100%), 
                       linear-gradient(to top, #050508 0%, transparent 60%),
                       linear-gradient(to bottom, #050508 0%, transparent 40%)`
        }}
      />

      {/* Color thematic soft light flare based on current console color */}
      <div 
        className="absolute inset-0 z-[-1] transition-all duration-700 opacity-[0.06]"
        style={{
          backgroundColor: glowColor || 'transparent'
        }}
      />

      {/* Matrix-like subtle digital mesh grid lines com opacidade reduzida para 0.015 */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #ffffff 1px, transparent 1px),
            linear-gradient(to bottom, #ffffff 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px'
        }}
      />
    </div>
  );
};
