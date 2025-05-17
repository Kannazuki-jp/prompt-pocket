import React from "react";
import { FiSend, FiEdit2, FiTrash2, FiClock } from "react-icons/fi";
import { Prompt } from "../types";
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  
  // 日付をフォーマットする関数
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div 
      className="relative p-4 group"
      onClick={() => onPaste(prompt.prompt)}
      title={t('click_to_paste')}
    >
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-grow min-w-0 pr-3">
            {/* タイトル */}
            <h3 
              className="text-base font-semibold text-slate-800 dark:text-slate-100 truncate mb-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200" 
              title={prompt.title}
            >
              {prompt.title}
            </h3>

            {/* カテゴリバッジ */}
            {categoryName && (
              <span className="inline-block bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-full px-2.5 py-1 mb-2 mr-2 border border-blue-100 dark:border-blue-900/50">
                {categoryName}
              </span>
            )}
            
            {/* 本文プレビュー */}
            <p 
              className="text-sm text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 break-words" 
              title={prompt.prompt}
            >
              {prompt.prompt}
            </p>
            
            {/* 日付 */}
            <div className="flex items-center mt-3 text-xs text-slate-400 dark:text-slate-500">
              <FiClock className="w-3.5 h-3.5 mr-1" />
              <span>{formatDate(prompt.createdAt)}</span>
            </div>
          </div>
          
          {/* アクションボタン */}
          <div className="flex items-center space-x-1.5">
            {/* 貼り付けボタン */}
            <button
              type="button"
              aria-label={t('paste')}
              className="p-1.5 text-slate-400 hover:text-green-500 dark:hover:text-green-400 rounded-lg transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-700/50"
              onClick={(e) => {
                e.stopPropagation();
                onPaste(prompt.prompt);
              }}
              title={t('paste')}
            >
              <FiSend size={16} />
            </button>
            
            {/* 編集ボタン */}
            <button
              type="button"
              aria-label={t('edit')}
              className="p-1.5 text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 rounded-lg transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-700/50"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(String(prompt.id)); // 明示的に文字列に変換
              }}
              title={t('edit')}
            >
              <FiEdit2 size={16} />
            </button>

            {/* 削除ボタン */}
            <button
              type="button"
              aria-label={t('delete')}
              className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-700/50"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(String(prompt.id)); // 明示的に文字列に変換
              }}
              title={t('delete')}
            >
              <FiTrash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptItem;
