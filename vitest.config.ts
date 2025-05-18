import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';

// Vitestの設定ファイル
// テスト実行時の環境設定やプラグインを定義
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true, // グローバル関数（describe, it, expect）を使用可能に
    environment: 'jsdom', // DOM環境をシミュレート（Reactコンポーネントのテストに必要）
    setupFiles: ['./tests/setup.ts'], // テスト前に実行するセットアップファイル
    include: ['tests/**/*.test.{ts,tsx}'], // テスト対象ファイルのパターン
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'], // カバレッジレポートの形式
    },
  },
  resolve: {
    alias: {
      // WXTのエントリーポイント関数をモック
      '#imports': resolve(__dirname, './tests/mocks/wxt-imports.ts'),
      // 必要に応じて他のエイリアスを追加
    },
  },
});
