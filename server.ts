/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize GoogleGenAI with Gemini API key
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // Translation route using Gemini 3.5 Flash
  app.post("/api/translate", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== "string" || !text.trim()) {
        return res.json({ translatedText: "" });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Você é um tradutor especialista de jogos eletrônicos clássicos. Traduza a seguinte descrição de jogo do inglês para o português de forma natural, envolvente, preservando o jargão gamer original mas tornando o texto 100% em português brasileiro fluido. Remova tags HTML (como <br>, <p>, etc.) se houver, substituindo por parágrafos limpos. Retorne APENAS o texto traduzido final de forma limpa, sem parágrafos vazios duplicados e sem quaisquer explicações, notas ou introduções. Se o texto possuir jargões como "FPS", "Side-scrolling" ou nomes próprios (como personagens de Mortal Kombat), mantenha-os da forma aceita pela comunidade de jogos no Brasil:\n\n${text}`,
      });

      const translatedText = response.text || text;
      res.json({ translatedText });
    } catch (error: any) {
      console.error("Error in translation API:", error);
      res.status(500).json({ error: error.message || "Falha na tradução" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
