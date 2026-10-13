# LordTecaRetro — execução local

LordTecaRetro é uma aplicação web de entretenimento retrô construída com React, TypeScript, Vite e um servidor Express.

## Requisitos

- Node.js compatível com as dependências do projeto
- npm

## Instalação

Clone o repositório e entre na pasta:

```bash
git clone https://github.com/lordjunnior/lordjunnior.git
cd lordjunnior
npm install
```

## Configuração

Crie um arquivo `.env.local` na raiz do projeto a partir de `.env.example`.

Configure as variáveis necessárias ao ambiente:

- `GEMINI_API_KEY`: chave para os recursos que usam a API Gemini.
- `APP_URL`: URL pública da aplicação quando o fluxo usado exigir esse endereço.
- `VITE_RAWG_API_KEY`: opcional, para recursos que consultam dados de jogos pela RAWG.

Não publique chaves reais no repositório. O arquivo `.env.local` deve permanecer fora do controle de versão.

## Desenvolvimento

```bash
npm run dev
```

O servidor de desenvolvimento é iniciado na porta 3000.

## Build de produção

```bash
npm run build
npm start
```

## Verificação de tipos

```bash
npm run lint
```

Consulte o `package.json` para os scripts e dependências atuais.
