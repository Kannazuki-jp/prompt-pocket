import browser from "webextension-polyfill";

// バックグラウンドスクリプトの初期化
console.log("プロンプトポケットのバックグラウンドが起動しました");

// 拡張機能インストール時の処理
browser.runtime.onInstalled.addListener((details) => {
  console.log("拡張機能がインストールされました:", details);

  // ChatGPT/Geminiのタブを自動リロード
  reloadTargetTabs();

  // Chrome APIが存在する場合のみ実行
  if (chrome && chrome.sidePanel) {
    // なぞsetOptionsを使うか: サイドパネルの初期設定を行うため
    // path: サイドパネルのHTMLパス、enabled: デフォルトで有効化
    chrome.sidePanel.setOptions({
      path: 'src/sidepanel.html',
      enabled: true
    });
  }
});

// ChatGPTやGeminiのページを自動リロードする関数
function reloadTargetTabs() {
  // 対象URLパターン
  const targets = [
    "https://chatgpt.com/",
    "https://gemini.google.com/"
  ];
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      const url = tab.url;
      // tab.urlの型を狭小化し、undefinedを排除してからstartsWithを呼び出す
      if (typeof url === "string" && targets.some(target => url.startsWith(target))) {
        chrome.tabs.reload(tab.id!);
      }
    });
  });
}


// アクションボタンクリック時の処理 (ポップアップがない場合にサイドパネルを開く)
// なぞここでサイドパネルを開くか: アイコンクリックのユーザビリティを向上させるため
if (chrome && chrome.action) {
  chrome.action.onClicked.addListener((tab) => {
    // ChatGPT/Geminiのタブを自動リロード
    reloadTargetTabs();
    if (chrome.sidePanel) {
      // サイドパネルを開く
      // windowIdが必須の場合があるため、tabIdのみではなくwindowIdも指定
      chrome.sidePanel.open({
        tabId: tab.id,
        windowId: tab.windowId || chrome.windows.WINDOW_ID_CURRENT
      });
    }
  });
}
