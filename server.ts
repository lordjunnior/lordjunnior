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

import dns from "dns";
import { promisify } from "util";

const lookupAsync = promisify(dns.lookup);

function isPrivateIp(ip: string): boolean {
  if (ip === "127.0.0.1" || ip === "::1" || ip === "0.0.0.0") {
    return true;
  }
  const ipv4Match = ip.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (ipv4Match) {
    const octet1 = parseInt(ipv4Match[1], 10);
    const octet2 = parseInt(ipv4Match[2], 10);
    
    if (octet1 === 10) return true;
    if (octet1 === 172 && octet2 >= 16 && octet2 <= 31) return true;
    if (octet1 === 192 && octet2 === 168) return true;
    if (octet1 === 127) return true;
    if (octet1 === 169 && octet2 === 254) return true;
    if (octet1 === 0) return true;
  }
  const cleanIp = ip.toLowerCase();
  if (cleanIp.startsWith("fe80:") || cleanIp.startsWith("fc00:") || cleanIp.startsWith("fd00:")) {
    return true;
  }
  return false;
}

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

const ipLimits = new Map<string, RateLimitInfo>();

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minuto
const RATE_LIMIT_MAX_REQUESTS = 10; // Máximo de 10 requisições por minuto por IP

function getClientIp(req: any): string {
  const xForwardedFor = req.headers["x-forwarded-for"];
  if (typeof xForwardedFor === "string") {
    return xForwardedFor.split(",")[0].trim();
  } else if (Array.isArray(xForwardedFor)) {
    return xForwardedFor[0].trim();
  }
  return req.socket.remoteAddress || "unknown";
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; reset: number } {
  const now = Date.now();
  let info = ipLimits.get(ip);
  if (!info || now > info.resetTime) {
    info = {
      count: 0,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    };
  }

  if (info.count >= RATE_LIMIT_MAX_REQUESTS) {
    return {
      allowed: false,
      remaining: 0,
      reset: Math.ceil((info.resetTime - now) / 1000),
    };
  }

  info.count += 1;
  ipLimits.set(ip, info);

  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX_REQUESTS - info.count,
    reset: Math.ceil((info.resetTime - now) / 1000),
  };
}

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

      let fileId: string | null = null;
      // Convert Google Drive links automatically to direct download URLs
      if (romUrl.includes("drive.google.com") || romUrl.includes("docs.google.com")) {
        const dMatch = romUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
        const idMatch = romUrl.match(/[?&]id=([a-zA-Z0-9-_]+)/);
        fileId = (dMatch && dMatch[1]) || (idMatch && idMatch[1]);
        if (fileId) {
          romUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
          console.log(`[ROM PROXY] Converted Google Drive link to Google direct download: ${romUrl}`);
        }
      }

      // Safe check to avoid SSRF
      let parsedUrl: URL;
      try {
        parsedUrl = new URL(romUrl);
      } catch (err) {
        return res.status(400).send("API Error: Invalid URL structure.");
      }

      if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        return res.status(400).send("API Error: Invalid URL scheme.");
      }

      const hostname = parsedUrl.hostname.toLowerCase();

      // Check common private / local hostnames
      if (
        hostname === "localhost" ||
        hostname === "localhost.localdomain" ||
        hostname.endsWith(".local") ||
        hostname.endsWith(".internal")
      ) {
        return res.status(400).send("API Error: Access to local or internal network is forbidden.");
      }

      try {
        const lookup = await lookupAsync(hostname);
        if (isPrivateIp(lookup.address)) {
          return res.status(400).send("API Error: Access to private or local IP ranges is forbidden.");
        }
      } catch (dnsErr) {
        return res.status(400).send("API Error: Unable to resolve hostname.");
      }

      console.log(`[ROM PROXY] Fetching ROM from source: ${romUrl}`);

      let response = await fetch(romUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        }
      });

      if (!response.ok) {
        console.error(`[ROM PROXY] Source returned status: ${response.status} ${response.statusText}`);
        return res.status(response.status).send(`Failed to fetch ROM from origin: ${response.statusText}`);
      }

      let contentType = response.headers.get("content-type") || "application/octet-stream";

      // If Google Drive returns an HTML response (warning screen), extract the confirm token
      if (contentType.includes("text/html") && fileId) {
        const html = await response.text();
        const confirmMatch = html.match(/confirm=([a-zA-Z0-9_-]+)/);
        if (confirmMatch) {
          const confirmToken = confirmMatch[1];
          const rawCookies = response.headers.get("set-cookie");
          let cookieHeader = "";
          if (rawCookies) {
            cookieHeader = rawCookies.split(',').map(c => c.split(';')[0]).join('; ');
          }

          const confirmUrl = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=${confirmToken}`;
          console.log(`[ROM PROXY] Large Google Drive file warning detected. Re-fetching with confirm=${confirmToken}`);

          const secondResponse = await fetch(confirmUrl, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              "Cookie": cookieHeader
            }
          });

          if (!secondResponse.ok) {
            console.error(`[ROM PROXY] Bypass request returned status: ${secondResponse.status}`);
            return res.status(secondResponse.status).send(`Failed to fetch ROM after bypass: ${secondResponse.statusText}`);
          }

          response = secondResponse;
          contentType = response.headers.get("content-type") || "application/octet-stream";
        } else {
          // If response was HTML but had no confirm token, serve original HTML (e.g. error page)
          res.setHeader("Content-Type", contentType);
          res.setHeader("Access-Control-Allow-Origin", "*");
          return res.send(Buffer.from(html));
        }
      }

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

  // Image proxy route to bypass Wikipedia hotlinking protection and CORS issues
  app.get("/api/image-proxy", async (req, res) => {
    try {
      const imageUrl = req.query.url as string;
      if (!imageUrl) {
        return res.status(400).send("API Error: Image URL is required.");
      }

      // Safe check to avoid SSRF
      let parsedUrl: URL;
      try {
        parsedUrl = new URL(imageUrl);
      } catch (err) {
        return res.status(400).send("API Error: Invalid URL structure.");
      }

      if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        return res.status(400).send("API Error: Invalid URL scheme.");
      }

      const hostname = parsedUrl.hostname.toLowerCase();
      if (
        hostname === "localhost" ||
        hostname === "localhost.localdomain" ||
        hostname.endsWith(".local") ||
        hostname.endsWith(".internal")
      ) {
        return res.status(400).send("API Error: Access to local/internal network is forbidden.");
      }

      try {
        const lookup = await lookupAsync(hostname);
        if (isPrivateIp(lookup.address)) {
          return res.status(400).send("API Error: Access to private or local IP ranges is forbidden.");
        }
      } catch (dnsErr) {
        return res.status(400).send("API Error: Unable to resolve hostname.");
      }

      console.log(`[IMAGE PROXY] Fetching image from source: ${imageUrl}`);

      const response = await fetch(imageUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        }
      });

      if (!response.ok) {
        console.error(`[IMAGE PROXY] Source returned status: ${response.status} ${response.statusText}`);
        return res.status(response.status).send(`Failed to fetch image from origin: ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type") || "image/jpeg";
      const contentLength = response.headers.get("content-length");

      res.setHeader("Content-Type", contentType);
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
      res.setHeader("Cache-Control", "public, max-age=604800"); // cache for 7 days
      
      if (contentLength) {
        res.setHeader("Content-Length", contentLength);
      }

      const arrayBuffer = await response.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
    } catch (error: any) {
      console.error("[IMAGE PROXY] Error:", error);
      res.status(500).send(`Internal image proxy error: ${error.message || error}`);
    }
  });

  // RAWG API Proxy
  app.get("/api/rawg-proxy/*", async (req, res) => {
    try {
      const rawgApiKey = process.env.VITE_RAWG_API_KEY || process.env.RAWG_API_KEY;
      if (!rawgApiKey || !rawgApiKey.trim()) {
        return res.status(503).json({ error: "RAWG API Key is not configured on the server." });
      }

      const prefix = "/api/rawg-proxy/";
      const index = req.originalUrl.indexOf(prefix);
      if (index === -1) {
        return res.status(400).json({ error: "Invalid proxy URL" });
      }

      const subpathAndQuery = req.originalUrl.substring(index + prefix.length);
      const targetUrlStr = `https://api.rawg.io/api/${subpathAndQuery}`;
      const targetUrl = new URL(targetUrlStr);
      
      // Inject API key safely on the server side
      targetUrl.searchParams.set("key", rawgApiKey.trim());

      console.log(`[RAWG PROXY] Requesting RAWG: ${targetUrl.pathname}`);

      const response = await fetch(targetUrl.toString());

      if (!response.ok) {
        return res.status(response.status).json({ error: `RAWG API error: ${response.statusText}` });
      }

      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error("[RAWG PROXY] Error:", error);
      res.status(500).json({ error: error.message || "Internal RAWG proxy error" });
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
      const clientIp = getClientIp(req);
      const limitResult = checkRateLimit(clientIp);

      if (!limitResult.allowed) {
        return res.status(429).json({
          error: `Limite de requisições excedido. Por favor, aguarde ${limitResult.reset} segundos.`
        });
      }

      const { text } = req.body;
      if (!text || typeof text !== "string" || !text.trim()) {
        return res.json({ translatedText: "" });
      }

      // Check text character length (max 2000 characters)
      if (text.length > 2000) {
        return res.status(400).json({
          error: "Texto muito longo para tradução. O limite máximo é de 2000 caracteres."
        });
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