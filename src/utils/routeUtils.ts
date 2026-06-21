/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { System, Game } from '../types';

/**
 * Converts a system ID and game title into a clean, URL-safe slug
 */
export const getGameSlug = (systemId: string, title: string): string => {
  const cleanTitle = title
    .toLowerCase()
    .normalize('NFD') // remove accents
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-') // replace non-alphanumeric with hyphens
    .replace(/(^-|-$)/g, ''); // trim leading/trailing hyphens
  return `${systemId}-${cleanTitle}`;
};

/**
 * Finds a game and its corresponding system by slug
 */
export const findGameBySlug = (slug: string, systems: System[]): { system: System; game: Game } | null => {
  for (const system of systems) {
    for (const game of system.games) {
      if (getGameSlug(system.id, game.title) === slug) {
        return { system, game };
      }
    }
  }
  return null;
};

/**
 * Returns clean gameplay mock screenshots based on game genre
 */
export const getGameScreenshots = (genre: string): string[] => {
  const lower = (genre || '').toLowerCase();
  let mapped = 'default';
  if (lower.includes('plataforma') && lower.includes('3d')) mapped = 'plataforma-3d';
  else if (lower.includes('plataforma')) mapped = 'plataforma';
  else if (lower.includes('rpg') && lower.includes('tatico')) mapped = 'rpg-tatico';
  else if (lower.includes('rpg')) mapped = 'rpg';
  else if (lower.includes('metroidvania')) mapped = 'metroidvania';
  else if (lower.includes('aventura') && lower.includes('3d')) mapped = 'aventura-3d';
  else if (lower.includes('aventura')) mapped = 'aventura';
  else if (lower.includes('corrida')) mapped = 'corrida';
  else if (lower.includes('fps')) mapped = 'fps';
  else if (lower.includes('luta') && lower.includes('3d')) mapped = 'luta-3d';
  else if (lower.includes('luta')) mapped = 'luta';
  else if (lower.includes('beat')) mapped = 'beat-em-up';
  else if (lower.includes('run')) mapped = 'run-and-gun';
  else if (lower.includes('shoot')) mapped = 'shoot-em-up';
  else if (lower.includes('horror')) mapped = 'survival-horror';
  else if (lower.includes('puzzle')) mapped = 'puzzle';
  else if (lower.includes('esporte')) mapped = 'esporte';
  else if (lower.includes('acao') || lower.includes('ação')) mapped = 'acao';

  return [
    `/covers/screenshot-${mapped}-1.svg`,
    `/covers/screenshot-${mapped}-2.svg`,
    `/covers/screenshot-${mapped}-3.svg`
  ];
};
