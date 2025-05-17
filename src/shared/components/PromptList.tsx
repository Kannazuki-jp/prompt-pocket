// プロンプト一覧表示用のダミーコンポーネント
// なぜ分離するか: 単一責任・将来的な拡張性のため
import React, { useEffect, useState } from "react";
import { Prompt, Category } from "../../core/types";
import PromptItem, { PromptItemProps } from "./PromptItem";
import { FiChevronUp, FiFolder, FiMessageSquare, FiPlus } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { getCategories } from '../../features/prompt/promptService';

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

  // 空状態の表示 - モダンなデザインに更新
  if (!prompts || prompts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center p-6 bg-white/50 dark:bg-slate-800/30 rounded-xl border border-slate-200/80 dark:border-slate-700/50 backdrop-blur-sm">
        <div className="relative mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl flex items-center justify-center">
            <FiMessageSquare className="w-8 h-8 text-blue-500 dark:text-blue-400" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center">
            <FiPlus className="w-3 h-3 text-white" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-1">
          {t('empty_list')}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
          {t('create_from_header')}
        </p>
      </div>
    );
  }
  // プロンプトがある場合は、サイドパネルに最適化されたリスト表示を実装
  return (
    <div className="relative">
      {/* プロンプト件数表示 */}
      <div className="mb-3 text-sm text-slate-500 dark:text-slate-400 flex items-center">
        <span className="bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-slate-700 dark:to-slate-800 text-slate-700 dark:text-slate-300 py-1 px-2.5 rounded-full text-xs font-medium flex items-center">
          <FiMessageSquare className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
          <span>{prompts.length} {t('prompt_count', { count: prompts.length })}</span>
        </span>
      </div>
      
      {/* リスト表示 */}
      <div className="space-y-3">
        {prompts.map((prompt, index) => (
          <div 
            key={prompt.id} 
            className="group relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-200/80 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700/50 dark:to-slate-800/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <PromptItem
              prompt={prompt}
              onEdit={onEditPrompt}
              onDelete={onDeletePrompt}
              onPaste={onPastePrompt}
              categoryName={getCategoryName(prompt.categoryId)}
            />
          </div>
        ))}
      </div>
      
      {/* スクロールトップボタン */}
      {prompts.length > 5 && (
        <div className="fixed bottom-6 right-6 z-10 group">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white p-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center transform hover:-translate-y-0.5"
            aria-label={t('back_to_top')}
            title={t('back_to_top')}
          >
            <FiChevronUp className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default PromptList;
