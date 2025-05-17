// Chrome拡張のサイドパネル-コンテンツスクリプト間メッセージ型定義
// なぜ分離するか→型安全性・責務分離・将来の拡張性のため

// メッセージング関連の型定義

// メッセージの基本型
export interface BaseMessage {
  type: string;
}

// プロンプト貼り付けメッセージ
export interface PasteMessage extends BaseMessage {
  type: 'PASTE_PROMPT';
  text: string;
}

// プロンプト貼り付けレスポンス
export interface PasteResponse {
  success: boolean;
  error?: string;
}

// メッセージタイプの定数
export const MESSAGE_TYPES = {
  PASTE_PROMPT: 'PASTE_PROMPT',
} as const;

// メッセージタイプの型
export type MessageType = typeof MESSAGE_TYPES[keyof typeof MESSAGE_TYPES];
