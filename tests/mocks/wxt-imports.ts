// WXTのエントリーポイント関数のモック

/**
 * コンテンツスクリプトを定義するモック関数
 */
export function defineContentScript(config: any) {
  // テスト時には設定をそのまま返す
  return config;
}

/**
 * バックグラウンドスクリプトを定義するモック関数
 */
export function defineBackground(configOrFn: any) {
  // テスト時には設定をそのまま返す
  return typeof configOrFn === 'function' ? { main: configOrFn } : configOrFn;
}

/**
 * サイドパネルを操作するためのモック関数
 */
export function defineSidePanel(config: any) {
  return config;
}

/**
 * スクリプトを挿入するモック関数
 */
export async function injectScript(path: string, options: any = {}) {
  // テスト時には何もしない
  return Promise.resolve();
}

/**
 * 統合UIを作成するモック関数
 */
export function createIntegratedUi(ctx: any, options: any = {}) {
  return {
    mount: () => {},
    unmount: () => {},
    autoMount: () => {},
    remove: () => {},
  };
}

/**
 * シャドウルートUIを作成するモック関数
 */
export function createShadowRootUi(ctx: any, options: any = {}) {
  return Promise.resolve({
    mount: () => {},
    unmount: () => {},
    autoMount: () => {},
    remove: () => {},
  });
}

/**
 * iframeベースのUIを作成するモック関数
 */
export function createIframeUi(ctx: any, options: any = {}) {
  return {
    mount: () => {},
    unmount: () => {},
    autoMount: () => {},
    remove: () => {},
  };
} 