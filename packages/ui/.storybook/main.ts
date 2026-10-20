import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/react-vite";
import svgr from "vite-plugin-svgr";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.tsx"],
  addons: ["@storybook/addon-a11y"],
  framework: "@storybook/react-vite",
  async viteFinal(config) {
    config.server ??= {};
    config.server.fs ??= {};
    const allow = config.server.fs.allow ?? [];
    config.server.fs.allow = [...allow, repoRoot];
    config.plugins = [
      svgr({
        include: "**/*.svg",
        svgrOptions: {
          exportType: "default",
          jsxRuntime: "automatic",
          svgo: false,
        },
        esbuildOptions: { jsx: "automatic" },
      }),
      ...(config.plugins ?? []),
    ];
    return config;
  },
};

export default config;
