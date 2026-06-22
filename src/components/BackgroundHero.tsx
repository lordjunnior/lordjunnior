/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface BackgroundHeroProps {
  systemId: string;
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

export const BackgroundHero: React.FC<BackgroundHeroProps> = ({ systemId }) => {
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
      // Se falhou até o favorites.jpg, ativa o fallback final (fundo preto)
      setHasFailedAll(true);
    }
  };

  return (
    <div className="absolute inset-0 z-0 select-none overflow-hidden pointer-events-none">
      {/* Fundo preto padrão (#0a0a0a) se tudo falhar */}
      <div className="absolute inset-0 bg-[#0a0a0a] z-[-2]" />

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
            transition={{ duration: 0.6 }}
            onError={handleError}
            className="absolute inset-0 w-full h-full object-cover z-[-1]"
            referrerPolicy="no-referrer"
          />
        )}
      </AnimatePresence>

      {/* Overlay escuro leve de opacidade 0.30 (bg-black/30) para legibilidade */}
      <div className="absolute inset-0 bg-black/30 z-[-1]" />

      {/* Matrix-like subtle digital mesh grid lines com opacidade reduzida para 0.02 */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
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
