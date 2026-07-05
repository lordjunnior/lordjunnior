/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Ponto de entrada usado SOMENTE pela Vercel. Qualquer arquivo dentro da pasta
// /api vira automaticamente uma função serverless. Diferente do server.ts
// (usado no Google Cloud Run / dev local), esta função NÃO serve os arquivos
// estáticos do site (a própria Vercel já faz isso separadamente para tudo
// que não começa com /api) e NÃO chama app.listen() — a Vercel controla o
// ciclo de vida da função sozinha.
//
// A lógica das rotas em si mora em src/server/apiRoutes.ts e é a mesma usada
// pelo server.ts, para nunca corrigirmos um bug em um ambiente e esquecermos
// do outro.

import express from "express";
import dotenv from "dotenv";
import { registerApiRoutes } from "../src/server/apiRoutes";

dotenv.config();

const app = express();
registerApiRoutes(app);

export default app;
