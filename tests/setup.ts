// テスト環境のグローバル設定ファイル
import '@testing-library/jest-dom'; // DOMテスト用の拡張マッチャーを追加
import { vi, beforeEach } from 'vitest';

// Chrome拡張機能APIのモック作成
// より詳細なモックを提供
global.chrome = {
  storage: {
    local: {
      get: vi.fn().mockImplementation(key => Promise.resolve({})),
      set: vi.fn().mockImplementation(() => Promise.resolve()),
      remove: vi.fn().mockImplementation(() => Promise.resolve()),
      clear: vi.fn().mockImplementation(() => Promise.resolve()),
    },
    sync: {
      get: vi.fn().mockImplementation(key => Promise.resolve({})),
      set: vi.fn().mockImplementation(() => Promise.resolve()),
      remove: vi.fn().mockImplementation(() => Promise.resolve()),
      clear: vi.fn().mockImplementation(() => Promise.resolve()),
    },
  },
  runtime: {
    sendMessage: vi.fn(),
    onMessage: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
    getURL: vi.fn().mockImplementation(path => `chrome-extension://mock-extension-id/${path}`),
  },
  tabs: {
    query: vi.fn(),
    create: vi.fn(),
    sendMessage: vi.fn(),
  },
  i18n: {
    getMessage: vi.fn().mockImplementation(key => key),
  },
} as any;

// UUID生成のモック
// テスト時に予測可能なIDを生成するためにcrypto.randomUUIDをモック化
if (!global.crypto) {
  Object.defineProperty(global, 'crypto', {
    value: {
      randomUUID: vi.fn().mockImplementation(() => 'test-uuid'),
    },
  });
} else {
  // 既にcryptoが存在する場合はrandomUUIDのみをモック
  global.crypto.randomUUID = vi.fn().mockImplementation(() => 'test-uuid');
}

// Date.now()のモック
// テスト時に時間を固定するためのモック
const NOW = 1621234567890; // 固定タイムスタンプ（2021年5月17日）
global.Date.now = vi.fn().mockImplementation(() => NOW);

// WXTからexportされる関数のエクスポート
global.fakeBrowser = {
  reset: vi.fn(),
  storage: {
    local: {
      get: vi.fn().mockImplementation(() => Promise.resolve({})),
      set: vi.fn().mockImplementation(() => Promise.resolve()),
    }
  }
};

// テスト後のクリーンアップ処理
beforeEach(() => {
  // 各テスト前にモックをリセット
  vi.clearAllMocks();
});
