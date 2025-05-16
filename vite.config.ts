import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import webExtension, { readJsonFile } from "vite-plugin-web-extension";
import tailwindcss from '@tailwindcss/vite'

function generateManifest() {
  const manifest = readJsonFile("src/manifest.json");
  const pkg = readJsonFile("package.json");
  return {
    name: pkg.name,
    description: pkg.description,
    version: pkg.version,
    permissions: pkg.permissions,
    ...manifest,
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    webExtension({
      manifest: generateManifest,
      // webExtConfig: 開発用web-ext起動時のURL指定
      webExtConfig: {
        // 起動対象ブラウザ (chromium/firefox-desktop など)
        target: "chromium",
        // START_URLが未定義の場合はデフォルトでchatgpt.comを開く
        startUrl: ("https://chatgpt.com/").split(","),
      },
    }),
    tailwindcss(),
  ],
});
