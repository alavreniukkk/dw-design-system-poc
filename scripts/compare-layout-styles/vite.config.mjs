import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";

const here = fileURLToPath(new URL(".", import.meta.url));
const repoRoot = resolve(here, "../..");

export default defineConfig({
  root: here,
  esbuild: { jsx: "automatic" },
  plugins: [
    svgr({
      include: "**/*.svg",
      svgrOptions: {
        exportType: "default",
        jsxRuntime: "automatic",
        svgo: false,
      },
      esbuildOptions: { jsx: "automatic" },
    }),
  ],
  server: {
    host: "127.0.0.1",
    port: 4178,
    strictPort: true,
    fs: { allow: [repoRoot] },
  },
});
