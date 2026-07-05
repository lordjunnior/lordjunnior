/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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
  },
  saturn: {
    logoName: 'Sega Saturn',
    glowColor: '#374151',
    themeGradient: 'from-slate-800/20 via-zinc-950 to-zinc-950',
    unitsSold: '9,26 Milhões',
    gamesCount: '1.100+',
    architecture: 'Dual Hitachi SH-2 28.6 MHz',
    releaseYear: '1994',
    slogan: 'A arquitetura de duplo processador mais ousada dos anos 90, considerada até hoje um quebra-cabeça de engenharia para desenvolvedores.',
    techTitle: 'CALIBRAGEM DA ARQUITETURA DUAL-CPU',
    techDescription: 'O Saturn usa dois processadores SH-2 trabalhando em paralelo, algo raro até para consoles modernos. Sincronizar essa dobra de núcleos em JavaScript/WebAssembly sem perder desempenho é um desafio real, e o streaming de mídia em CD exige uma infraestrutura de hospedagem maior do que a dos cartuchos que já temos no ar.',
    catalogTeaser: 'Conforme o LordTecaRetro crescer e conseguirmos sustentar custos de hospedagem para arquivos maiores, o Saturn entra na fila de prioridade.',
    badgeStatus: 'Sincronização Dual-CPU em Pesquisa'
  },
  ps1: {
    logoName: 'PlayStation',
    glowColor: '#003791',
    themeGradient: 'from-blue-950/20 via-zinc-950 to-zinc-950',
    unitsSold: '102 Milhões',
    gamesCount: '3.000+',
    architecture: 'MIPS R3000A 33.9 MHz',
    releaseYear: '1994',
    slogan: 'O console que trouxe os jogos em 3D e mídia em CD para a sala de milhões de casas, mudando os videogames para sempre.',
    techTitle: 'STREAMING DE IMAGENS DE CD EM DESENVOLVIMENTO',
    techDescription: 'Diferente dos cartuchos, os jogos de PlayStation são discos inteiros (200-700MB cada), muito mais pesados para transmitir e hospedar gratuitamente. Estamos otimizando o streaming desses arquivos para funcionar direto no navegador sem travar.',
    catalogTeaser: 'Assim que o projeto tiver fôlego financeiro para hospedar arquivos desse tamanho com qualidade, os clássicos de PS1 sobem para o ar.',
    badgeStatus: 'Otimização de Streaming em Andamento'
  },
  arcade: {
    logoName: 'Arcade / MAME',
    glowColor: '#f59e0b',
    themeGradient: 'from-amber-950/20 via-zinc-950 to-zinc-950',
    unitsSold: 'Milhares de Fliperamas',
    gamesCount: '10.000+',
    architecture: 'Múltiplas Placas-Mãe Proprietárias',
    releaseYear: '1980s',
    slogan: 'A era de ouro dos fliperamas, onde cada jogo rodava em uma placa de hardware totalmente diferente e única.',
    techTitle: 'EMULAÇÃO MULTIPLACA EM DESENVOLVIMENTO',
    techDescription: 'Diferente de um console único, o Arcade reúne milhares de placas-mãe diferentes, cada uma com seu próprio chip e configuração. Isso exige mapear cada jogo individualmente para garantir que funcione de verdade, sem prometer compatibilidade que não existe.',
    catalogTeaser: 'Estamos selecionando com cuidado os títulos mais estáveis para garantir uma primeira experiência de Arcade impecável.',
    badgeStatus: 'Mapeamento de Placas em Andamento'
  },
  neogeo: {
    logoName: 'Neo Geo MVS',
    glowColor: '#0ea5e9',
    themeGradient: 'from-sky-950/20 via-zinc-950 to-zinc-950',
    unitsSold: '1 Milhão (Doméstico)',
    gamesCount: '150+',
    architecture: 'Motorola 68000 12 MHz',
    releaseYear: '1990',
    slogan: 'Apelidado de "Rolls Royce dos consoles", com cartuchos gigantes e caríssimos que traziam a experiência de arcade pra casa.',
    techTitle: 'PROCESSAMENTO DE CARTUCHOS DE ALTA CAPACIDADE',
    techDescription: 'Os cartuchos de Neo Geo chegavam a ser maiores que jogos de consoles muito mais modernos, o que significa mais dados pra transmitir e hospedar. Estamos preparando a estrutura certa antes de subir esse catálogo.',
    catalogTeaser: 'Os clássicos de luta e ação do Neo Geo estão na lista de expansão assim que tivermos capacidade de hospedagem maior.',
    badgeStatus: 'Preparação de Infraestrutura em Andamento'
  },
  nds: {
    logoName: 'Nintendo DS',
    glowColor: '#6366f1',
    themeGradient: 'from-indigo-950/20 via-zinc-950 to-zinc-950',
    unitsSold: '154 Milhões',
    gamesCount: '1.800+',
    architecture: 'Dual ARM946ES/ARM7TDMI',
    releaseYear: '2004',
    slogan: 'O portátil de dupla tela e caneta touch que reinventou como jogamos, com uma das maiores bibliotecas de jogos já lançadas.',
    techTitle: 'SUPORTE A DUPLA TELA E TOUCH EM DESENVOLVIMENTO',
    techDescription: 'Emular duas telas simultâneas com suporte a toque dentro de um navegador exige uma interface própria, diferente de qualquer outro console que já rodamos. Estamos desenhando essa experiência com calma para não entregar algo quebrado.',
    catalogTeaser: 'Os jogos de DS entram assim que a experiência de dupla tela estiver redonda e tivermos espaço pra hospedar as ROMs, que são bem maiores que as de Game Boy Advance.',
    badgeStatus: 'Interface de Dupla Tela em Desenvolvimento'
  },
  pce: {
    logoName: 'PC Engine',
    glowColor: '#dc2626',
    themeGradient: 'from-red-950/20 via-zinc-950 to-zinc-950',
    unitsSold: '10 Milhões',
    gamesCount: '700+',
    architecture: 'HuC6280 7.16 MHz',
    releaseYear: '1987',
    slogan: 'O console compacto que introduziu os jogos em CD-ROM ao mundo, muito antes disso virar padrão da indústria.',
    techTitle: 'SUPORTE A CD-ROM (PC ENGINE CD) EM DESENVOLVIMENTO',
    techDescription: 'Boa parte dos clássicos mais amados de PC Engine usam o add-on de CD, o que significa arquivos de disco inteiros em vez de pequenos cartuchos. Isso pede a mesma estrutura de streaming que estamos construindo para outros consoles em CD.',
    catalogTeaser: 'Assim que a base de streaming de mídia estiver pronta, o PC Engine sobe junto com os outros consoles de CD do catálogo.',
    badgeStatus: 'Streaming de Mídia em Preparação'
  },
  '3do': {
    logoName: 'Panasonic 3DO',
    glowColor: '#7c3aed',
    themeGradient: 'from-violet-950/20 via-zinc-950 to-zinc-950',
    unitsSold: '2 Milhões',
    gamesCount: '200+',
    architecture: 'ARM60 12.5 MHz',
    releaseYear: '1993',
    slogan: 'Um dos primeiros consoles totalmente baseados em CD, à frente do seu tempo tecnologicamente, mas caro demais pra decolar comercialmente.',
    techTitle: 'DECODIFICAÇÃO DE VÍDEO FMV EM CALIBRAGEM',
    techDescription: 'Os jogos de 3DO usam bastante vídeo em tela cheia (FMV) direto do CD, o que gera arquivos pesados e exige decodificação eficiente no navegador para não travar.',
    catalogTeaser: 'Um console cheio de curiosidades históricas que queremos trazer com a qualidade certa assim que a infraestrutura de mídia em CD estiver pronta.',
    badgeStatus: 'Decodificação de Vídeo em Pesquisa'
  },
  dreamcast: {
    logoName: 'Sega Dreamcast',
    glowColor: '#ff6600',
    themeGradient: 'from-orange-950/20 via-zinc-950 to-zinc-950',
    unitsSold: '9,13 Milhões',
    gamesCount: '600+',
    architecture: 'Hitachi SH-4 200 MHz',
    releaseYear: '1998',
    slogan: 'O console à frente do seu tempo, com suporte online nativo, que conquistou um dos fandoms mais apaixonados da história dos jogos.',
    techTitle: 'EMULAÇÃO DA GPU POWERVR2 EM ANDAMENTO',
    techDescription: 'A GPU PowerVR2 do Dreamcast usa uma técnica de renderização por blocos (tile-based) diferente da maioria dos consoles da época, o que exige um trabalho de tradução gráfica dedicado para rodar bem via WebGL.',
    catalogTeaser: 'Os clássicos de Dreamcast, incluindo os favoritos de culto da comunidade, estão na fila assim que a renderização gráfica estiver estável.',
    badgeStatus: 'Tradução Gráfica PowerVR2 em Andamento'
  },
  gamecube: {
    logoName: 'Nintendo GameCube',
    glowColor: '#7c3aed',
    themeGradient: 'from-purple-950/20 via-zinc-950 to-zinc-950',
    unitsSold: '21,74 Milhões',
    gamesCount: '650+',
    architecture: 'IBM PowerPC "Gekko" 486 MHz',
    releaseYear: '2001',
    slogan: 'O cubinho roxo da Nintendo com alguns dos jogos mais queridos da franquia, rodando em mini-discos exclusivos.',
    techTitle: 'COMPATIBILIDADE COM GPU FLIPPER EM DESENVOLVIMENTO',
    techDescription: 'Os jogos de GameCube já são totalmente em 3D com discos maiores que os de gerações anteriores, exigindo tanto mais poder de processamento gráfico via WebGPU quanto mais estrutura de hospedagem para os arquivos.',
    catalogTeaser: 'Os clássicos de GameCube entram no catálogo assim que a emulação gráfica 3D e a hospedagem de arquivos maiores estiverem prontas.',
    badgeStatus: 'Emulação Gráfica 3D em Desenvolvimento'
  }
};

export const UnsupportedGenerationView: React.FC<UnsupportedGenerationViewProps> = ({
  system,
  game,
  onClose
}) => {
  const [activeGame, setActiveGame] = useState<Game>(game);

  useEffect(() => {
    setActiveGame(game);
  }, [game]);

  let systemId = system.id.toLowerCase().trim();
  if (systemId === 'ps2') systemId = 'playstation2';
  if (systemId === 'ps3') systemId = 'playstation3';
  if (systemId === 'psx' || systemId === 'ps1' || systemId === 'playstation') systemId = 'ps1';
  if (systemId === 'ds') systemId = 'nds';
  if (systemId === 'pcengine' || systemId === 'turbografx') systemId = 'pce';
  if (systemId === 'xboxclassic') systemId = 'xbox';
  
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
    .filter(g => g.title !== activeGame.title)
    .slice(0, 4);

  return (
    <div 
      className={`relative flex flex-col w-full h-full min-h-screen bg-gradient-to-b ${specs.themeGradient} overflow-hidden font-sans text-white`}
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
          <span>Voltar</span>
        </button>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-8 space-y-8 relative z-10">
        
        {/* Painel Central - Bento Grid Style */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Lado Esquerdo: Capa do Jogo Selecionado que preenche por completo o bloco (lg:col-span-4) */}
          <div className="lg:col-span-4 min-h-[450px] lg:min-h-full flex flex-col justify-end bg-zinc-950 border border-white/10 rounded-2xl relative overflow-hidden group shadow-2xl shadow-black">
            {/* Imagem de Capa em tela cheia do bloco */}
            <div className="absolute inset-0 z-0">
              <GameCover game={activeGame} systemId={system.id} className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105" />
              {/* Degradê escuro para garantir leitura do texto no topo e na base */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-black/30" />
            </div>

            {/* Conteúdo sobreposto */}
            <div className="relative z-10 p-5 flex flex-col gap-4 w-full bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent">
              <div className="space-y-1.5">
                <span className="text-[9px] font-retro text-zinc-400 block tracking-widest uppercase">VOCÊ IA JOGAR</span>
                <h3 className="text-base font-black text-white leading-tight drop-shadow-md">{activeGame.title}</h3>
                <p className="text-[10px] font-mono text-zinc-300 flex items-center gap-2">
                  <span>{activeGame.genre}</span>
                  <span className="opacity-45">•</span>
                  <span>{activeGame.year}</span>
                </p>
              </div>

              {/* Curiosidades Rápidas */}
              <div className="border-t border-white/10 pt-4 grid grid-cols-2 gap-3 text-center">
                <div className="bg-white/[0.03] border border-white/5 rounded-xl p-2">
                  <span className="text-[8px] text-zinc-400 font-mono block uppercase tracking-wider">VENDIDOS</span>
                  <span className="text-xs font-bold text-white mt-1 block">{specs.unitsSold}</span>
                </div>
                <div className="bg-white/[0.03] border border-white/5 rounded-xl p-2">
                  <span className="text-[8px] text-zinc-400 font-mono block uppercase tracking-wider">LANÇADO EM</span>
                  <span className="text-xs font-bold text-white mt-1 block">{specs.releaseYear}</span>
                </div>
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
                className="w-full sm:w-auto px-6 py-2.5 bg-white text-zinc-950 font-retro text-[9px] font-black uppercase tracking-widest rounded-lg flex items-center gap-2 justify-center cursor-pointer hover:bg-zinc-200 active:scale-95 transition-all shadow-md shadow-black"
              >
                <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
                <span>Jogar Consoles Ativos</span>
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
                  setActiveGame(item);
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
