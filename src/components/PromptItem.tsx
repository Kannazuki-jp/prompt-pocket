import React from "react";
import { FaPaperPlane, FaEdit, FaTrash } from "react-icons/fa";
import { Prompt } from "../types";

// propsの型定義：なぜこうするか→明示的な型で型安全性を担保し、各アクションのコールバック引数を明確にするため
export interface PromptItemProps {
  prompt: Prompt;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onPaste: (text: string) => void;
  categoryName?: string; // 追加: カテゴリ名（省略可）
}

// PromptItemは1つのプロンプトをカード形式で表示し、アクションボタンを提供する
const PromptItem: React.FC<PromptItemProps> = ({ prompt, onEdit, onDelete, onPaste, categoryName }) => {
  // Chrome拡張機能のサイドパネルに最適化された超コンパクトなデザイン
  return (
    <div 
      className="py-4 px-3 bg-white rounded-lg border border-transparent hover:border-blue-400 transition-colors duration-150 group cursor-pointer"
      onClick={() => onPaste(prompt.prompt)}
      title="クリックして貼り付け"
    >
      <div className="flex items-center justify-between">
        <div className="flex-grow min-w-0 pr-2">
          {/* タイトル - より見やすいサイズとウェイトに */}
          <h3 className="text-base font-semibold text-slate-800 truncate" title={prompt.title}>
            {prompt.title}
          </h3>

          {/* カテゴリバッジ（カテゴリがある場合のみ表示） */}
          {categoryName && (
            <span className="inline-block bg-blue-100 text-blue-700 text-xs font-medium rounded px-2 py-0.5 mt-1 mb-1 mr-2">
              {categoryName}
            </span>
          )}
          
          {/* 本文プレビュー - サイズアップして余白追加 */}
          <p className="text-sm text-slate-600 mt-1 truncate" title={prompt.prompt}>
            {prompt.prompt}
          </p>
          
          {/* 日付もよりコンパクトに */}
          <span className="text-[10px] text-slate-400 inline-block mt-2">
            {new Date(prompt.createdAt).toLocaleDateString()}
          </span>
        </div>
        
        {/* アクションボタンを常時表示に変更
            - なぜ: ユーザビリティ向上のため、常時編集・削除ボタンが見えるようにする（操作方法の迷いを防ぐ）
        */}
        <div className="flex items-center space-x-2">
          {/* 貼り付けボタン */}
          <button
            type="button"
            aria-label="貼り付け"
            className="bg-white text-slate-500 hover:text-green-500 p-2 rounded transition-all flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              onPaste(prompt.prompt);
            }}
            title="貼り付け"
          >
            <FaPaperPlane size={14} />
          </button>
          
          {/* 編集ボタン: 常に表示 */}
          <button
            type="button"
            aria-label="編集"
            className="bg-white text-slate-500 hover:text-blue-500 p-2 rounded transition-all flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(prompt.id);
            }}
            title="編集"
          >
            <FaEdit size={14} />
          </button>

          {/* 削除ボタン: 常に表示 */}
          <button
            type="button"
            aria-label="削除"
            className="bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 p-2 rounded transition-all flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(prompt.id);
            }}
            title="削除"
          >
            <FaTrash size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromptItem;
