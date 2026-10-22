import { defineConfig } from "vite";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { squarespaceEmbedPlugin } from "./scripts/squarespace-embed-plugin.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, "frontend/standalone.js"),
      name: "ComposerPlayer",
      formats: ["iife"],
      fileName: () => "composer-player.js",
    },
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith(".css")) {
            return "composer-player.css";
          }
          return assetInfo.name;
        },
      },
    },
  },
  plugins: [squarespaceEmbedPlugin(__dirname)],
});
