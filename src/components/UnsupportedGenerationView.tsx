/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { System, Game } from '../types';
import { soundEngine } from './RetroSoundEngine';
import { GameCover } from './GameCover';
import { 
  Cpu, 
  Gamepad2, 
  Info, 
  ArrowLeft, 
  Sparkles, 
  History, 
  ShieldAlert,
  ServerCrash
} from 'lucide-react';

interface UnsupportedGenerationViewProps {
  system: System;
  game: Game;
  onClose: () => void;
}

interface UnsupportedSystemSpecs {
  logoName: string;
  glowColor: string;
  themeGradient: string;
  unitsSold: string;
  gamesCount: string;
  architecture: string;
  releaseYear: string;
  slogan: string;
  techTitle: string;
  techDescription: string;
  catalogTeaser: string;
  badgeStatus: string;
}

const unsupportedSpecsMap: Record<string, UnsupportedSystemSpecs> = {
  playstation2: {
    logoName: 'PlayStation 2',
    glowColor: '#005cff',
    themeGradient: 'from-blue-950/20 via-zinc-950 to-zinc-950',
    unitsSold: '155 Milhões',
    gamesCount: '4.000+',
    architecture: 'Emotion Engine 294.9 MHz',
    releaseYear: '2000',
    slogan: 'O console de mesa mais vendido de todos os tempos. Uma lenda viva dos anos 2000 que moldou a paixão por mundos 3D.',
    techTitle: 'OTIMIZAÇÃO DO MOTOR GRÁFICO EM ANDAMENTO',
    techDescription: 'Estamos finalizando a otimização da tecnologia de emulação gráfica e compilação do microcódigo do Emotion Engine via WebAssembly. Nosso objetivo é garantir taxas de quadros estáveis diretamente no seu navegador, sem necessidade de download de BIOS pesadas ou configurações complexas.',
    catalogTeaser: 'O catálogo de ROMs está sendo estruturado e polido. Prepare seu controle para reviver as maiores lendas do PS2 com desempenho intocado de fábrica.',
    badgeStatus: 'Otimização Web em Pesquisa Ativa'
  },
  playstation3: {
    logoName: 'PlayStation 3',
    glowColor: '#e60012',
    themeGradient: 'from-red-950/20 via-zinc-950 to-zinc-950',
    unitsSold: '87 Milhões',
    gamesCount: '2.000+',
    architecture: 'Cell Broadband Engine 3.2 GHz',
    releaseYear: '2006',
    slogan: 'A revolução da alta definição comandada pela audaciosa e icônica arquitetura CELL.',
    techTitle: 'PREPARANDO COMPATIBILIDADE COM NÚCLEO CELL',
    techDescription: 'A arquitetura multi-núcleos assimétrica do processador CELL apresenta um desafio formidável de engenharia na Web. Estamos desenvolvendo transcompiladores de instruções gráficas em tempo real e streaming local para rodar clássicos do PS3 de forma fluida.',
    catalogTeaser: 'Nossa biblioteca de testes fechados já conta com os títulos que marcaram gerações. Em breve, a experiência definitiva do PS3 rodando com apenas um clique.',
    badgeStatus: 'Otimização de Arquitetura em Andamento'
  },
  xbox: {
    logoName: 'Xbox',
    glowColor: '#107c10',
    themeGradient: 'from-green-950/20 via-zinc-950 to-zinc-950',
    unitsSold: '24 Milhões',
    gamesCount: '1.000+',
    architecture: 'Custom Pentium III 733 MHz',
    releaseYear: '2001',
    slogan: 'O pioneiro com HD integrado que pavimentou o ecossistema de jogabilidade online moderna com a Xbox Live.',
    techTitle: 'OTIMIZAÇÃO DE ENGINE DIRECTX WEB',
    techDescription: 'Estamos mapeando e convertendo as chamadas de sistema da API DirectX clássica do Xbox para chamadas nativas de WebGL / WebGPU no navegador. Esse progresso permitirá renderizar jogos pesados em resolução total com o menor input lag possível.',
    catalogTeaser: 'Títulos lendários que consolidaram o poder verde da Microsoft estão na fila prioritária de testes de estabilidade térmica e performance de rede.',
    badgeStatus: 'Mapeamento Gráfico WebGPU em Desenvolvimento'
  },
  xbox360: {
    logoName: 'Xbox 360',
    glowColor: '#5a9e1e',
    themeGradient: 'from-emerald-950/20 via-zinc-950 to-zinc-950',
    unitsSold: '84 Milhões',
    gamesCount: '2.000+',
    architecture: 'Xenon Triple-Core 3.2 GHz',
    releaseYear: '2005',
    slogan: 'A consagração do ecossistema de conquistas e jogos cooperativos conectados que definiu a sétima geração.',
    techTitle: 'PREPARANDO SUPORTE AO NAVEGADOR',
    techDescription: 'Trabalhamos no desenvolvimento de um tradutor dinâmico de shaders gráficos para simular a GPU Xenos com renderização limpa no navegador. Queremos garantir que jogos cooperativos e mundos densos rodem sem perda de frames no seu dispositivo.',
    catalogTeaser: 'A infraestrutura de jogos de alta fidelidade e o catálogo de conquistas estão sendo otimizados para rodar de forma leve, gratuita e sem fricção.',
    badgeStatus: 'Preparando Suporte ao Navegador'
  }
};

export const UnsupportedGenerationView: React.FC<UnsupportedGenerationViewProps> = ({
  system,
  game,
  onClose
}) => {
  const systemId = system.id.toLowerCase();
  
  // Encontra as especificações corretas ou cai em um fallback genérico
  const specs = unsupportedSpecsMap[systemId] || {
    logoName: system.name,
    glowColor: '#005cff',
    themeGradient: 'from-zinc-900 via-zinc-950 to-zinc-950',
    unitsSold: '--',
    gamesCount: '--',
    architecture: system.emulatorCore || 'Processador Avançado',
    releaseYear: system.releaseYear || '----',
    slogan: 'Um console icônico que marcou a história dos videogames.',
    techTitle: 'COMPATIBILIDADE WEB EM DESENVOLVIMENTO',
    techDescription: 'Estamos trabalhando ativamente para otimizar tecnologias de streaming e decodificação gráfica de alta performance diretamente no navegador, garantindo jogabilidade em apenas um clique.',
    catalogTeaser: 'O catálogo e as capas originais já estão disponíveis para você relembrar e explorar todos os clássicos lendários.',
    badgeStatus: 'Otimização Web em Andamento'
  };

  // Coleta até 4 jogos do sistema para a vitrine inferior, excluindo se necessário o jogo selecionado
  const otherGames = system.games
    .filter(g => g.title !== game.title)
    .slice(0, 4);

  return (
    <div 
      className={`relative flex flex-col w-full h-full min-h-[500px] bg-gradient-to-b ${specs.themeGradient} border border-white/10 rounded-3xl overflow-hidden shadow-2xl font-sans text-white`}
    >
      {/* Barra de controle superior */}
      <div className="flex justify-between items-center bg-black/45 px-6 py-4 border-b border-white/5 z-20">
        <div className="flex items-center gap-3">
          <Gamepad2 className="w-5 h-5 text-zinc-400" />
          <div className="leading-none">
            <span className="text-[10px] font-retro text-zinc-400 block tracking-widest">{system.name}</span>
            <span className="text-xs text-zinc-500 font-mono block mt-1">Biblioteca Digital</span>
          </div>
        </div>

        <button
          onClick={() => {
            soundEngine.playBack();
            onClose();
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white font-retro text-[9px] uppercase font-black tracking-widest shadow-lg transition cursor-pointer group"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-zinc-400 group-hover:-translate-x-1 transition-transform" />
          <span>➔ Voltar</span>
        </button>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-8 space-y-8 relative z-10">
        
        {/* Painel Central - Bento Grid Style */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Lado Esquerdo: Capa do Jogo Selecionado e Curiosidades (lg:col-span-4) */}
          <div className="lg:col-span-4 flex flex-col gap-5 justify-between bg-zinc-950/45 border border-white/5 rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute inset-0 bg-radial-gradient opacity-[0.05]" style={{ backgroundImage: `radial-gradient(circle at center, ${specs.glowColor} 0%, transparent 70%)` }} />
            
            <div className="space-y-4 relative z-10">
              <div className="aspect-[3/4] w-40 mx-auto rounded-xl overflow-hidden border border-white/10 shadow-lg shadow-black/80 relative group">
                <GameCover game={game} systemId={system.id} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent p-3 flex flex-col justify-end">
                  <span className="text-[8px] font-retro text-zinc-400 block uppercase tracking-wider">{system.name}</span>
                  <p className="text-xs font-bold truncate leading-none mt-1">{game.title}</p>
                </div>
              </div>

              <div className="space-y-1 text-center">
                <span className="text-[10px] font-retro text-zinc-500 uppercase tracking-widest block">VOCÊ IA JOGAR</span>
                <h3 className="text-sm font-black text-white">{game.title}</h3>
                <p className="text-[10px] font-mono text-zinc-400">{game.genre} • {game.year}</p>
              </div>
            </div>

            {/* Curiosidades Rápidas */}
            <div className="relative z-10 border-t border-white/5 pt-4 grid grid-cols-2 gap-4 text-center mt-3">
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2.5">
                <span className="text-[8px] text-zinc-500 font-mono block uppercase tracking-wider">VENDIDOS</span>
                <span className="text-xs font-bold text-zinc-200 mt-1 block">{specs.unitsSold}</span>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2.5">
                <span className="text-[8px] text-zinc-500 font-mono block uppercase tracking-wider">LANÇADO EM</span>
                <span className="text-xs font-bold text-zinc-200 mt-1 block">{specs.releaseYear}</span>
              </div>
            </div>
          </div>

          {/* Lado Direito: Exposição da Tecnologia e Posicionamento Transparente (lg:col-span-8) */}
          <div className="lg:col-span-8 flex flex-col justify-between bg-zinc-950/45 border border-white/5 rounded-2xl p-6 md:p-8 relative overflow-hidden">
            {/* Linha superior brilhante com a cor correspondente do console */}
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(to right, transparent, ${specs.glowColor}, transparent)` }} />
            
            <div className="space-y-6">
              {/* Badge de Status Piscante e Título */}
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-mono text-zinc-400">
                  {/* Ponto indicador animado */}
                  <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: specs.glowColor }} />
                  <span className="uppercase font-bold tracking-wider">{specs.badgeStatus}</span>
                </div>
                
                <h2 className="text-lg md:text-xl font-black font-display tracking-tight text-white flex items-center gap-2">
                  <Cpu className="w-5 h-5 shrink-0" style={{ color: specs.glowColor }} />
                  <span>{specs.techTitle}</span>
                </h2>
              </div>

              {/* Parágrafo de Posicionamento e Explicação */}
              <div className="space-y-4 text-sm text-zinc-300 leading-relaxed max-w-2xl font-sans">
                <p>
                  No <strong>LordTecaRetro</strong>, nosso propósito primordial é entregar <strong>a forma mais simples e sem dor de cabeça de voltar a jogar</strong>. Acreditamos em um clique, escolha e diversão instantânea – sem configurar BIOS, baixar emuladores lentos ou lotar o seu navegador com popups e anúncios.
                </p>
                <p className="text-zinc-400">
                  {specs.techDescription}
                </p>
                <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-4 flex gap-3 items-start text-xs text-zinc-400 leading-snug">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" style={{ color: specs.glowColor }} />
                  <div>
                    <p className="font-semibold text-zinc-200 mb-1">Como funciona nossa filosofia?</p>
                    {specs.catalogTeaser}
                  </div>
                </div>
              </div>
            </div>

            {/* CTA para navegar em sistemas funcionando perfeitamente */}
            <div className="border-t border-white/5 pt-6 mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex gap-2 items-center text-xs text-zinc-500">
                <ShieldAlert className="w-4 h-4 text-zinc-600" />
                <span>Transparência total com a comunidade.</span>
              </div>

              <button
                onClick={() => {
                  soundEngine.playSelect();
                  onClose();
                }}
                className="w-full sm:w-auto px-6 py-2.5 bg-white text-zinc-950 font-retro text-[9px] font-black uppercase tracking-widest rounded-lg flex items-center justify-center cursor-pointer hover:bg-zinc-200 active:scale-95 transition-all shadow-md shadow-black"
              >
                ➔ Jogar Consoles Ativos
              </button>
            </div>

          </div>

        </div>

        {/* Linha Inferior: Catálogo do Console sendo preparado */}
        <div className="bg-zinc-950/25 border border-white/5 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="w-4 h-4" style={{ color: specs.glowColor }} />
              <span>Destaques da Biblioteca Preparada ({specs.gamesCount} Clássicos)</span>
            </h4>
            <span className="text-[10px] font-mono text-zinc-500 hidden md:block">Clique para ver os dados do jogo</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {otherGames.map(item => (
              <div 
                key={item.id}
                onClick={() => {
                  soundEngine.playSelect();
                  // Força troca para visualizar este jogo na tela de incompatibilidade de forma dinâmica
                  window.location.hash = '';
                  setTimeout(() => {
                    const cleanTitle = item.title
                      .toLowerCase()
                      .normalize('NFD')
                      .replace(/[\u0300-\u036f]/g, '')
                      .replace(/[^a-z0-9]+/g, '-')
                      .replace(/(^-|-$)/g, '');
                    window.location.pathname = `/game/${system.id}-${cleanTitle}`;
                  }, 50);
                }}
                className="group relative aspect-[3/4] bg-zinc-900 rounded-xl overflow-hidden border border-white/5 hover:border-white/20 transition-all duration-300 hover:-translate-y-2 cursor-pointer"
              >
                {/* Glow projection */}
                <div 
                  className="absolute inset-0 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100 pointer-events-none"
                  style={{ 
                    background: `radial-gradient(circle, ${specs.glowColor} 0%, transparent 70%)` 
                  }}
                />
                
                <div className="relative w-full h-full rounded-xl overflow-hidden flex items-center justify-center">
                  <GameCover game={item} systemId={system.id} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-3 flex flex-col justify-end">
                    <span className="text-[8px] text-zinc-500 font-mono block uppercase">{item.genre}</span>
                    <p className="text-[11px] font-black text-white truncate uppercase leading-none mt-1">
                      {item.title}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
