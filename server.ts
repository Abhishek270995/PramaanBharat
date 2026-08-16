import app from "./api/index.ts";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const PORT = 3000;

// Vite middleware setup for local development and standalone server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Pramaan Bharat Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
