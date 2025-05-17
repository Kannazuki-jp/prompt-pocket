// WXTはクロスブラウザ互換性を自動的に提供するので、webextension-polyfillは不要
// chrome APIを直接使用します

import { TARGET_URL_LIST } from "../src/core/constants/selectors";

// ChatGPTやGeminiのページを自動リロードする関数
function reloadTargetTabs() {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      const url = tab.url;
      if (typeof url === "string" && TARGET_URL_LIST.some((target: string) => url.startsWith(target)) && tab.id) {
        chrome.tabs.reload(tab.id);
      }
    });
  });
}

export default {
  async main() {
    // バックグラウンドスクリプトの初期化
    console.log("プロンプトポケットのバックグラウンドが起動しました");

    // アイコンクリックでサイドパネルを開く
    chrome.action.onClicked.addListener(async (tab) => {
      try {
        // サイドパネルを開く
        await chrome.sidePanel.open({ windowId: tab.windowId });
      } catch (error) {
        console.error('サイドパネルを開けませんでした:', error);
      }
    });

    // 拡張機能インストール時の処理
    chrome.runtime.onInstalled.addListener((details) => {
      console.log("拡張機能がインストールされました:", details);

      // ChatGPT/Geminiのタブを自動リロード
      reloadTargetTabs();

      // Chrome APIが存在し、sidePanelが利用可能な場合のみ実行
      if (chrome.sidePanel) {
        chrome.sidePanel.setOptions({
          path: 'sidepanel.html', // wxt.config.tsのentrypointsDirからの相対パス
          enabled: true
        });
      }
    });

    // アクションボタンクリック時の処理
    // (ポップアップがない場合にサイドパネルを開く、または指定されたアクションを実行)
    if (chrome.action) {
      chrome.action.onClicked.addListener((tab) => {
        reloadTargetTabs();
        if (chrome.sidePanel && tab.id) {
          chrome.sidePanel.open({
            tabId: tab.id
            // windowIdを指定すると互換性問題が発生する可能性があるため、最小限のパラメータで実装
          });
        }
      });
    }
  }
};
