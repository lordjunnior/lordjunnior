/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface BackgroundHeroProps {
  systemId: string;
  glowColor?: string;
}

const getLogoFileName = (id: string): string => {
  const map: Record<string, string> = {
    nes: 'nes',
    snes: 'snes',
    n64: 'n64',
    gb: 'gb',
    gba: 'gba',
    sms: 'mastersystem',
    genesis: 'megadrive',
    saturn: 'saturn',
    ps1: 'psx',
    atari: 'atari2600',
    arcade: 'mame',
    neogeo: 'neogeo',
    nds: 'nds',
    pce: 'pcengine',
    '3do': '3do',
    neogeopocket: 'ngp',
    turbografx: 'pcengine',
    fba_libretro: 'fba',
    dreamcast: 'dreamcast',
    gamecube: 'gamecube'
  };
  return map[id] || id;
};

const VERIFIED_ARTS = new Set([
  'nes', 'snes', 'n64', 'gb', 'gbc', 'gba', 'nds',
  'megadrive', 'mastersystem', 'gamegear', 'segacd', 'sega32x',
  'sg1000', 'psx', 'atari2600', 'atari7800', 'neogeo', 'ngp',
  'mame', 'fba', 'colecovision', 'pcengine', 'pcenginecd',
  'wonderswan', 'wonderswancolor', 'virtualboy', '3do',
  'msx', 'msx1', 'msx2', 'lynx', 'dreamcast', 'saturn', 'gamecube',
  'atarist', 'c64', 'amiga600', 'amiga1200', 'amstradcpc',
  'zxspectrum', 'vectrex', 'cavestory', 'favorites', 'dos'
]);

export const BackgroundHero: React.FC<BackgroundHeroProps> = ({ systemId, glowColor }) => {
  const systemFolderName = getLogoFileName(systemId);
  
  // URL primária baseada no console, ou favorites se não existir na lista verificada
  const initialUrl = VERIFIED_ARTS.has(systemFolderName)
    ? `https://raw.githubusercontent.com/lordjunnior/recalbox-theme/main/assets/arts/${systemFolderName}.jpg`
    : `https://raw.githubusercontent.com/lordjunnior/recalbox-theme/main/assets/arts/favorites.jpg`;

  const [currentUrl, setCurrentUrl] = useState<string>(initialUrl);
  const [hasFailedAll, setHasFailedAll] = useState<boolean>(false);

  // Reiniciar estados quando o console (systemId) muda
  useEffect(() => {
    const freshFolderName = getLogoFileName(systemId);
    if (VERIFIED_ARTS.has(freshFolderName)) {
      setCurrentUrl(`https://raw.githubusercontent.com/lordjunnior/recalbox-theme/main/assets/arts/${freshFolderName}.jpg`);
      setHasFailedAll(false);
    } else {
      setCurrentUrl(`https://raw.githubusercontent.com/lordjunnior/recalbox-theme/main/assets/arts/favorites.jpg`);
      setHasFailedAll(false);
    }
  }, [systemId]);

  const handleError = () => {
    const fallbackUrl = `https://raw.githubusercontent.com/lordjunnior/recalbox-theme/main/assets/arts/favorites.jpg`;
    if (currentUrl !== fallbackUrl) {
      // Se falhou o background específico, tenta carregar o favorites.jpg
      setCurrentUrl(fallbackUrl);
    } else {
      // Se falhou até o favorites.jpg, altera para o fallback final (fundo preto)
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
          <motion.img
            key={currentUrl}
            src={currentUrl}
            alt={`${systemId} Background`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            onError={handleError}
            className="absolute inset-0 w-full h-full object-cover z-[-1]"
            referrerPolicy="no-referrer"
          />
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
