/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { System, Game } from '../types';
import rawSystemsDef from './systems.json';
import { resolveGameRomUrl } from '../utils/romResolver';
import { getSystemBadgeColor } from '../utils/systemColors';

// Helper to generate clean, URL-safe game slug matching the asset compiler
const getGameSlugCustom = (systemId: string, title: string): string => {
  const cleanTitle = title
    .toLowerCase()
    .normalize('NFD') // remove accents
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-') // replace non-alphanumeric with hyphens
    .replace(/(^-|-$)/g, ''); // trim leading/trailing hyphens
  return `${systemId}-${cleanTitle}`;
};

export const parseRawSystems = (rawList: any[]): System[] => {
  return rawList.map((sys) => {
    const games: Game[] = sys.gameDefs.map((gd: any, idx: number) => {
      const slug = getGameSlugCustom(sys.id, gd.title);
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
      games
    };
  });
};

export const systemsData: System[] = parseRawSystems(rawSystemsDef);
