import { defineConfig } from 'wxt';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  entrypointsDir: 'entrypoints',
  vite: () => ({
    plugins: [
      react(),
      tailwindcss(),
      tsconfigPaths(),
    ],
  }),

  manifest: {
    name: 'prompt-pocket',
    description: 'プロンプト用テンプレートリスト',
    version: '1.0.0',
    permissions: [
      'storage',
      'activeTab',
      'scripting',
      'sidePanel',
      'tabs'
    ],
    icons: {
      '16': 'icon/16.png',
      '32': 'icon/32.png',
      '48': 'icon/48.png',
      '96': 'icon/96.png',
      '128': 'icon/128.png',
    },
    action: {
      default_title: 'Prompt Pocket',
    },
    host_permissions: [
        "https://chatgpt.com/*",
        "https://gemini.google.com/*"
    ],
    side_panel: {
      default_path: 'sidepanel.html',
    },
  },

  dev: {
    server: {
      port: 3000,
    },
    // startupUrl is no longer under dev. It should be configured under webExt.startUrls
  },

  webExt: {
    startUrls: ['https://chatgpt.com/'],
    chromiumArgs: [
      // '--auto-open-devtools-for-tabs'
    ]
  }

}
)