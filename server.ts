/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { buildDatabase } from "./src/utils/generateDb";

dotenv.config();

async function startServer() {
  // Build and compile the local retro db.json with exact titles, links and clean logos
  try {
    buildDatabase();
  } catch (dbErr) {
    console.error("[DatabaseCompiler] Failure dynamically generating DB:", dbErr);
  }

  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // ROM proxy route to handle CORS and redirect issues with remote ROM files
  app.get("/api/rom-proxy", async (req, res) => {
    try {
      let romUrl = req.query.url as string;
      if (!romUrl) {
        return res.status(400).send("API Error: ROM URL is required.");
      }

      // Convert Google Drive links automatically to direct download URLs
      if (romUrl.includes("drive.google.com") || romUrl.includes("docs.google.com")) {
        const dMatch = romUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
        const idMatch = romUrl.match(/[?&]id=([a-zA-Z0-9-_]+)/);
        const fileId = (dMatch && dMatch[1]) || (idMatch && idMatch[1]);
        if (fileId) {
          romUrl = `https://docs.google.com/uc?export=download&id=${fileId}`;
          console.log(`[ROM PROXY] Converted Google Drive link to Google direct download: ${romUrl}`);
        }
      }

      // Safe check to avoid SSRF
      if (!romUrl.startsWith("http://") && !romUrl.startsWith("https://")) {
        return res.status(400).send("API Error: Invalid URL scheme.");
      }

      console.log(`[ROM PROXY] Fetching ROM from source: ${romUrl}`);

      const response = await fetch(romUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        }
      });

      if (!response.ok) {
        console.error(`[ROM PROXY] Source returned status: ${response.status} ${response.statusText}`);
        return res.status(response.status).send(`Failed to fetch ROM from origin: ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type") || "application/octet-stream";
      const contentLength = response.headers.get("content-length");

      res.setHeader("Content-Type", contentType);
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
      res.setHeader("Cache-Control", "public, max-age=86400"); // cache for 1 day for optimal load speed
      
      if (contentLength) {
        res.setHeader("Content-Length", contentLength);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      console.log(`[ROM PROXY] Successfully fetched and serving ROM (${buffer.length} bytes)`);
      res.send(buffer);
    } catch (error: any) {
      console.error("[ROM PROXY] Error:", error);
      res.status(500).send(`Internal ROM proxy error: ${error.message || error}`);
    }
  });

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
