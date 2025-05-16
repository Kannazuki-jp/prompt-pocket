// Chrome拡張のサイドパネル-コンテンツスクリプト間メッセージ型定義
// なぜ分離するか→型安全性・責務分離・将来の拡張性のため

export interface PasteMessage {
  type: "PASTE_PROMPT";
  text: string;
}

export interface PasteResponse {
  success: boolean;
  error?: string;
}
