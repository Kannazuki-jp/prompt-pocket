// プロンプト一覧表示用のダミーコンポーネント
// なぜ分離するか: 単一責任・将来的な拡張性のため
import React, { useEffect, useState } from "react";
import { Prompt, Category } from "../types";
import PromptItem, { PromptItemProps } from "./PromptItem";
import { useTranslation } from 'react-i18next';
import { getCategories } from '../services/promptService';

// なぜこのprops構造なのか→一貫性・型安全性・コールバック引数の明確化のため
export interface PromptListProps {
  prompts: Prompt[];
  onEditPrompt: (id: string) => void;
  onDeletePrompt: (id: string) => void;
  onPastePrompt: (text: string) => void;
}

// PromptListはプロンプト配列をリスト表示し、各アクションを上位に伝播する
const PromptList: React.FC<PromptListProps> = ({ prompts, onEditPrompt, onDeletePrompt, onPastePrompt }) => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return undefined;
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.name : undefined;
  };

  // 空状態の表示 - サイドパネルに適した超コンパクトな表示
  if (!prompts || prompts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 mt-4 text-center px-4">
        <svg className="w-12 h-12 text-slate-200 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-sm font-medium text-slate-700 mb-1">
          {t('empty_list')}
        </p>
        <p className="text-xs text-slate-500 mb-3">
          {t('create_from_header')}
        </p>
      </div>
    );
  }
  // プロンプトがある場合は、サイドパネルに最適化されたリスト表示を実装
  return (
    <div className="relative">
      {/* プロンプト件数表示 - よりコンパクトに */}
      <div className="mb-2 text-xs text-slate-500 flex items-center">
        <span className="bg-slate-100 text-slate-600 py-0.5 px-1.5 rounded mr-1 text-xs font-medium">{prompts.length}</span>
        {t('prompt_count', { count: prompts.length })}
      </div>
      
      {/* リスト表示 - 余白を削減し、情報密度を最大化 */}
      <div className="rounded-md overflow-hidden w-full space-y-4">
        {prompts.map((prompt, index) => (
          <PromptItem
            key={prompt.id}
            prompt={prompt}
            onEdit={onEditPrompt}
            onDelete={onDeletePrompt}
            onPaste={onPastePrompt}
            categoryName={getCategoryName(prompt.categoryId)}
          />
        ))}
      </div>
      
      {/* プロンプトが多い場合は小さな「上に戻る」ボタンを表示 */}
      {prompts.length > 5 && (
        <div className="fixed bottom-4 right-4 z-10">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-sm transition-colors flex items-center justify-center"
            aria-label={t('back_to_top')}
            title={t('back_to_top')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default PromptList;
