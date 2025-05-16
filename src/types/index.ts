// プロンプトデータの型定義を集約するファイル
// 型安全性を高めるため、アプリ全体でこの型を利用する
export interface Category {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}

export interface Prompt {
  id: string; // 一意なID（UUID形式）
  title: string; // プロンプトのタイトル
  prompt: string; // プロンプト本文
  createdAt: number; // 作成日時（UNIXタイムスタンプ）
  updatedAt: number; // 最終更新日時（UNIXタイムスタンプ）
  isFavorite: boolean; // なぜ追加したか: カテゴリーフィルタリングで「お気に入り」を判定するため
  categoryId?: string; // カテゴリID（オプショナル）
}

// プロンプトの作成・更新時に使用するデータの型
export interface PromptInput {
  title: string;
  prompt: string;
  categoryId?: string;
}

// カテゴリの作成・更新時に使用するデータの型
export interface CategoryInput {
  name: string;
}
