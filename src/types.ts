/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Game {
  id: string;
  title: string;
  year: string;
  genre: string;
  developer: string;
  publisher: string;
  players: string;
  rating: number; // 1 to 5
  description: string;
  image: string; // URL to boxart/screenshot
  romUrl: string; // Destination for emulator JS loading
  favorite: boolean;
}

export interface System {
  id: string;
  name: string;
  shortName: string; // e.g., snes, genesis, nes, psx, gba, n64, arcade
  logo: string; // Simple descriptive title or emoji fallback if images aren't loaded, or custom SVGs
  badgeColor: string; // Tailwind class
  gameCount: number;
  releaseYear: string;
  manufacturer: string;
  backgroundImage: string;
  themeColor: string; // Tailwind color name like 'red-500', 'blue-500'
  emulatorCore: string; // EmulatorJS core identifier
  games: Game[];
  isDemo?: boolean;
}

export type ScreenState = 'carousel' | 'gamelist';

export interface GamepadControls {
  up: string;
  down: string;
  left: string;
  right: string;
  select: string;
  back: string;
  mute: string;
  crt: string;
}
