/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Utiliza cast em any para evitar erros de compilação TS sobre import.meta.env
export const RAWG_API_KEY = (import.meta as any).env?.VITE_RAWG_API_KEY || '';
