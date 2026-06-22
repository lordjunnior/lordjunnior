/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Retorna uma classe Tailwind harmonizada, polida e perfeitamente compilada para o badge do sistema.
 * Isso garante que novos sistemas (como PCE, 3DO, NeoGeo MVS) tenham cores consistentes e efeitos de brilho retro ideais.
 */
export function getSystemBadgeColor(id: string): string {
  const cleanId = id.toLowerCase().trim().replace(/[\s\-_]/g, '');

  const colorMap: Record<string, string> = {
    // Família Nintendo
    nes: 'bg-[#E60012] border-red-500 text-white hover:shadow-[0_0_12px_rgba(230,0,18,0.3)]',
    nintendo: 'bg-[#E60012] border-red-500 text-white hover:shadow-[0_0_12px_rgba(230,0,18,0.3)]',
    snes: 'bg-[#3C3C9C] border-indigo-500 text-white hover:shadow-[0_0_12px_rgba(60,60,156,0.3)]',
    supernintendo: 'bg-[#3C3C9C] border-indigo-500 text-white hover:shadow-[0_0_12px_rgba(60,60,156,0.3)]',
    n64: 'bg-[#3B82F6] border-blue-400 text-white hover:shadow-[0_0_12px_rgba(59,130,246,0.3)]',
    nintendo64: 'bg-[#3B82F6] border-blue-400 text-white hover:shadow-[0_0_12px_rgba(59,130,246,0.3)]',
    gb: 'bg-[#047857] border-emerald-600 text-white hover:shadow-[0_0_12px_rgba(4,120,87,0.3)]',
    gameboy: 'bg-[#047857] border-emerald-600 text-white hover:shadow-[0_0_12px_rgba(4,120,87,0.3)]',
    gba: 'bg-[#9333EA] border-purple-500 text-white hover:shadow-[0_0_12px_rgba(147,51,234,0.3)]',
    gameboyadvance: 'bg-[#9333EA] border-purple-500 text-white hover:shadow-[0_0_12px_rgba(147,51,234,0.3)]',
    gbc: 'bg-[#C084FC] border-fuchsia-400 text-white hover:shadow-[0_0_12px_rgba(192,132,252,0.3)]',
    gameboycolor: 'bg-[#C084FC] border-fuchsia-400 text-white hover:shadow-[0_0_12px_rgba(192,132,252,0.3)]',
    nds: 'bg-[#0D9488] border-teal-500 text-white hover:shadow-[0_0_12px_rgba(13,148,136,0.3)]',
    nintendods: 'bg-[#0D9488] border-teal-500 text-white hover:shadow-[0_0_12px_rgba(13,148,136,0.3)]',
    gamecube: 'bg-[#4F3F84] border-[#725FAD] text-white hover:shadow-[0_0_12px_rgba(79,63,132,0.3)]',
    gc: 'bg-[#4F3F84] border-[#725FAD] text-white hover:shadow-[0_0_12px_rgba(79,63,132,0.3)]',

    // Família SEGA
    genesis: 'bg-[#111111] border-neutral-600 text-white hover:shadow-[0_0_12px_rgba(17,17,17,0.4)]',
    megadrive: 'bg-[#111111] border-neutral-600 text-white hover:shadow-[0_0_12px_rgba(17,17,17,0.4)]',
    segamd: 'bg-[#111111] border-neutral-600 text-white hover:shadow-[0_0_12px_rgba(17,17,17,0.4)]',
    sega: 'bg-[#111111] border-neutral-600 text-white hover:shadow-[0_0_12px_rgba(17,17,17,0.4)]',
    sms: 'bg-[#0000AA] border-blue-600 text-white hover:shadow-[0_0_12px_rgba(0,0,170,0.3)]',
    mastersystem: 'bg-[#0000AA] border-blue-600 text-white hover:shadow-[0_0_12px_rgba(0,0,170,0.3)]',
    gamegear: 'bg-[#F59E0B] border-amber-500 text-white hover:shadow-[0_0_12px_rgba(245,158,11,0.3)]',
    saturn: 'bg-[#374151] border-gray-650 text-white hover:shadow-[0_0_12px_rgba(55,65,81,0.3)]',
    segasaturn: 'bg-[#374151] border-gray-650 text-white hover:shadow-[0_0_12px_rgba(55,65,81,0.3)]',
    dreamcast: 'bg-[#FF5500] border-orange-400 text-white hover:shadow-[0_0_12px_rgba(255,85,0,0.3)]',

    // Outros Gigantes de Mesa & Portáteis
    playstation: 'bg-[#708090] border-slate-500 text-slate-100 hover:shadow-[0_0_12px_rgba(112,128,144,0.3)]',
    ps1: 'bg-[#708090] border-slate-500 text-slate-100 hover:shadow-[0_0_12px_rgba(112,128,144,0.3)]',
    psx: 'bg-[#708090] border-slate-500 text-slate-100 hover:shadow-[0_0_12px_rgba(112,128,144,0.3)]',
    playstation2: 'bg-[#003087] border-[#005cff] text-white hover:shadow-[0_0_12px_rgba(0,92,255,0.3)]',
    ps2: 'bg-[#003087] border-[#005cff] text-white hover:shadow-[0_0_12px_rgba(0,92,255,0.3)]',
    playstation3: 'bg-[#1f1f1f] border-[#444444] text-white hover:shadow-[0_0_12px_rgba(68,68,68,0.3)]',
    ps3: 'bg-[#1f1f1f] border-[#444444] text-white hover:shadow-[0_0_12px_rgba(68,68,68,0.3)]',
    atari: 'bg-[#78350F] border-amber-800 text-white hover:shadow-[0_0_12px_rgba(120,53,15,0.3)]',
    atari2600: 'bg-[#78350F] border-amber-800 text-white hover:shadow-[0_0_12px_rgba(120,53,15,0.3)]',
    arcade: 'bg-[#EA580C] border-orange-500 text-white hover:shadow-[0_0_12px_rgba(234,88,12,0.3)]',
    mame: 'bg-[#EA580C] border-orange-500 text-white hover:shadow-[0_0_12px_rgba(234,88,12,0.3)]',

    // Novos Sistemas Requeridos
    neogeo: 'bg-[#D97706] border-yellow-600 text-white hover:shadow-[0_0_12px_rgba(217,119,6,0.3)]',
    neogeomvs: 'bg-[#D97706] border-yellow-600 text-white hover:shadow-[0_0_12px_rgba(217,119,6,0.3)]',
    pce: 'bg-[#E04E00] border-orange-500 text-white hover:shadow-[0_0_12px_rgba(224,78,0,0.3)]',
    pcengine: 'bg-[#E04E00] border-orange-500 text-white hover:shadow-[0_0_12px_rgba(224,78,0,0.3)]',
    turbografx: 'bg-[#E04E00] border-orange-500 text-white hover:shadow-[0_0_12px_rgba(224,78,0,0.3)]',
    '3do': 'bg-[#1E1B4B] border-indigo-900 text-white hover:shadow-[0_0_12px_rgba(30,27,75,0.3)]',

    // Coleções Extras
    collections: 'bg-[#14B8A6] border-teal-400 text-white hover:shadow-[0_0_12px_rgba(20,184,166,0.3)]',
    playlist: 'bg-[#14B8A6] border-teal-400 text-white hover:shadow-[0_0_12px_rgba(20,184,166,0.3)]'
  };

  return colorMap[cleanId] || 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:shadow-[0_0_12px_rgba(113,113,122,0.3)]';
}
