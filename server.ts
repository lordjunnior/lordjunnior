/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { buildDatabase } from "./src/utils/generateDb";
import { registerApiRoutes } from "./src/server/apiRoutes";

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

  registerApiRoutes(app);

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