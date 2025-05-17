// 入力欄のセレクタ定義
export const INPUT_SELECTORS = {
  CHATGPT: '#prompt-textarea',
  GEMINI: '#prompt-textarea', // Geminiのセレクタは要確認
} as const;

// ターゲットURLの定義
export const TARGET_URLS = {
  CHATGPT: 'https://chatgpt.com/',
  GEMINI: 'https://gemini.google.com/',
} as const;

// ターゲットURLの配列
export const TARGET_URL_LIST = Object.values(TARGET_URLS); 