/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { System, Game } from '../types';
import rawSystemsDef from './systems.json';
import { resolveGameRomUrl } from '../utils/romResolver';
import { getSystemBadgeColor } from '../utils/systemColors';
import completeRomMapping from './complete_rom_mapping.json';

// Helper to strip extensions and clean common region codes to derive a clean display title
export const cleanFilenameToTitle = (filename: string): string => {
  let title = filename;
  title = title.replace(/\\&/g, '&');
  title = title.replace(/\.(zip|nes|sfc|smc|bin|gba|gbc|gb|n64|z64|v64|sms)$/i, '');
  title = title.replace(/\((USA|Europe|Japan|Japan, USA|World|Europe, USA|France|Germany|Spain|Italy|En|Ja|Fr|De|Es|It|Pt|Sv|Nl|Unl|v[0-9\.]+|Co-Master|Beta)\)/gi, '');
  title = title.replace(/\((?:[^)]*?(?:USA|Europe|Japan|World|Version|Edit|Beta|Demo|Promo|M4|M5|M3|M6|Rev|v[0-9])[^)]*?)\)/gi, '');
  title = title.replace(/\[[^\]]*?\]/g, '');
  title = title.replace(/\s+/g, ' ').replace(/(^\s*-\s*|\s*-\s*$)/g, '').trim();
  return title || filename;
};

// Helper to normalize strings for robust fuzzy metadata matching
const normalizeString = (str: string): string => {
  const cleanStr = str.replace(/\.(zip|nes|sfc|smc|bin|gba|gbc|gb|n64|z64|v64|sms)$/i, '');
  return cleanStr
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
};

export const parseRawSystems = (rawList: any[]): System[] => {
  return rawList.map((sys) => {
    const sysId = sys.id.toLowerCase();
    const driveGames = (completeRomMapping as Record<string, Array<{ id: string; name: string }>>)[sysId];

    // If this system has mapped ROMs in our private Google Drive, load ONLY those games!
    if (driveGames && driveGames.length > 0) {
      const games: Game[] = driveGames.map((item, idx) => {
        const cleanedTitle = cleanFilenameToTitle(item.name);
        const normCleaned = normalizeString(cleanedTitle);

        // Try to locate pre-defined game definitions in systems.json to steal beautiful descriptions
        const predefMatch = sys.gameDefs?.find((gd: any) => {
          const normPredef = normalizeString(gd.title);
          return normPredef === normCleaned || normCleaned.includes(normPredef) || normPredef.includes(normCleaned);
        });

        // Smart dynamic genre detection from filename/title
        let genre = 'Ação / Aventura';
        const lowerName = item.name.toLowerCase();
        if (lowerName.includes('mario') || lowerName.includes('sonic') || lowerName.includes('kong') || lowerName.includes('platform') || lowerName.includes('plataforma')) {
          genre = 'Plataforma';
        } else if (lowerName.includes('fight') || lowerName.includes('street') || lowerName.includes('mortal') || lowerName.includes('kombat') || lowerName.includes('luta')) {
          genre = 'Luta';
        } else if (lowerName.includes('gp') || lowerName.includes('race') || lowerName.includes('racing') || lowerName.includes('kart') || lowerName.includes('speed') || lowerName.includes('corrida')) {
          genre = 'Corrida';
        } else if (lowerName.includes('rpg') || lowerName.includes('fantasy') || lowerName.includes('quest') || lowerName.includes('zelda') || lowerName.includes('chrono')) {
          genre = 'RPG';
        } else if (lowerName.includes('shoot') || lowerName.includes('gun') || lowerName.includes('contra') || lowerName.includes('metal') || lowerName.includes('slug')) {
          genre = 'Tiro / Run \'n Gun';
        } else if (lowerName.includes('sport') || lowerName.includes('soccer') || lowerName.includes('football') || lowerName.includes('fifa') || lowerName.includes('esporte')) {
          genre = 'Esporte';
        }

        const cleanSlug = cleanedTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const slug = `${sys.id}-${cleanSlug}`;

        return {
          id: `${sys.id}-${idx}`,
          title: cleanedTitle,
          year: predefMatch?.year || 'Retro Era',
          genre: predefMatch?.genre || genre,
          developer: predefMatch?.dev || 'Retro Dev',
          publisher: predefMatch?.pub || 'Retro Publisher',
          players: '1-2 Jogadores',
          rating: idx % 3 === 0 ? 5 : 4,
          description: predefMatch?.desc || `Cartucho clássico "${cleanedTitle}" carregado com segurança diretamente do servidor de preservação digital com performance nativa.`,
          image: predefMatch?.image || `/covers/${slug}.svg`,
          romUrl: `https://docs.google.com/uc?export=download&id=${item.id}`,
          favorite: idx < 3
        };
      });

      return {
        id: sys.id,
        name: sys.name,
        shortName: sys.shortName,
        logo: sys.logo,
        badgeColor: getSystemBadgeColor(sys.id),
        gameCount: games.length,
        releaseYear: sys.releaseYear,
        manufacturer: sys.manufacturer,
        backgroundImage: sys.backgroundImage,
        themeColor: sys.themeColor,
        emulatorCore: sys.emulatorCore,
        games,
        isDemo: false
      };
    } else {
      // For illustrative/demo systems, construct list using baseline predefinitions
      const games: Game[] = (sys.gameDefs || []).map((gd: any, idx: number) => {
        const cleanSlug = gd.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const slug = `${sys.id}-${cleanSlug}`;
        return {
          id: `${sys.id}-${idx}`,
          title: gd.title,
          year: gd.year,
          genre: gd.genre,
          developer: gd.dev,
          publisher: gd.pub,
          players: '1-2 Jogadores',
          rating: idx % 3 === 0 ? 5 : 4,
          description: gd.desc,
          image: gd.image || `/covers/${slug}.svg`,
          romUrl: gd.romUrl || resolveGameRomUrl(sys.id, gd.title),
          favorite: idx < 3
        };
      });

      return {
        id: sys.id,
        name: sys.name,
        shortName: sys.shortName,
        logo: sys.logo,
        badgeColor: getSystemBadgeColor(sys.id),
        gameCount: games.length,
        releaseYear: sys.releaseYear,
        manufacturer: sys.manufacturer,
        backgroundImage: sys.backgroundImage,
        themeColor: sys.themeColor,
        emulatorCore: sys.emulatorCore,
        games,
        isDemo: true // decorative showcase item
      };
    }
  });
};

export const systemsData: System[] = parseRawSystems(rawSystemsDef);
