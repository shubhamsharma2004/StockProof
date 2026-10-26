import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { stockproofApi } from "./server/vitePlugin.js";

export default defineConfig(({ mode }) => {
  // The API proxy reads server-only secrets (e.g. FINNHUB_API_KEY) from
  // process.env, the same way it would on any serverless host. Locally they
  // come from .env / .env.local; a variable already set in the shell wins.
  // Only VITE_-prefixed values are ever exposed to the browser bundle.
  const env = loadEnv(mode, process.cwd(), "");
  for (const key of ["FINNHUB_API_KEY", "IPOALERTS_API_KEY"]) {
    if (env[key] && !process.env[key]) process.env[key] = env[key];
  }

  return {
    plugins: [react(), stockproofApi()],
    optimizeDeps: {
      // Only imported from the sentiment Web Worker, so Vite would otherwise
      // discover it mid-session and force a full page reload in dev.
      include: ["@huggingface/transformers"],
    },
  };
});
