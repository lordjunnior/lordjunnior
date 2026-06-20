/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Utiliza cast em any para evitar erros de compilação TS sobre import.meta.env
export const RAWG_API_KEY = (import.meta as any).env?.VITE_RAWG_API_KEY || '0028988b1f7c4eea978e4c725f17b4fe';
