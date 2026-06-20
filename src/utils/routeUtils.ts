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
  const normGenre = genre.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return [
    `/covers/screenshot-${normGenre}-1.svg`,
    `/covers/screenshot-${normGenre}-2.svg`,
    `/covers/screenshot-${normGenre}-3.svg`
  ];
};
