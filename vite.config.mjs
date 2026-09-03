import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { rm } from "node:fs/promises";
import path from "node:path";

function excludeLegacyAuditAssets() {
  let outputRoot;
  return {
    name: "exclude-legacy-audit-assets",
    apply: "build",
    configResolved(config) {
      outputRoot = path.resolve(config.root, config.build.outDir);
    },
    async closeBundle() {
      await rm(path.join(outputRoot, "assets/models/move-lab-muscles.glb"), { force: true });
    },
  };
}

export default defineConfig({
  build: {
    outDir: "dist/client",
  },
  optimizeDeps: {
    include: ["react", "react-dom/client"],
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: ["terminal.local"],
    warmup: {
      clientFiles: ["./src/main.jsx"],
    },
  },
  plugins: [react(), excludeLegacyAuditAssets()],
});
