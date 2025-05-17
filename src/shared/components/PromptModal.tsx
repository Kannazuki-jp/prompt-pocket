// プロンプト追加・編集用のモーダルコンポーネント（UIと状態管理のみ、ストレージ操作は親から渡される）
// なぜpropsで制御するか: 再利用性・状態管理の一元化のため
import React, { useState, useEffect } from 'react';
import { Prompt, PromptInput, Category } from '../../core/types';
import { useTranslation } from 'react-i18next';
import { getCategories } from '../../features/prompt/promptService';

export interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: PromptInput) => void;
  editingPrompt: Prompt | null;
  // usePromptManagementからファイル関連のハンドラを受け取る
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onImportPrompts: () => Promise<void>;
  selectedFile: File | null;
}

export const PromptModal: React.FC<PromptModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  editingPrompt, 
  onFileChange,
  onImportPrompts,
  selectedFile
}) => {
  const { t } = useTranslation();
  // フォームのローカル状態
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const loadedCategories = await getCategories();
    setCategories(loadedCategories);
  };

  // 編集時は初期値をセット
  useEffect(() => {
    if (editingPrompt) {
      setTitle(editingPrompt.title);
      setPrompt(editingPrompt.prompt);
      setSelectedCategoryId(editingPrompt.categoryId);
    } else {
      setTitle('');
      setPrompt('');
      setSelectedCategoryId(undefined);
    }
    setError(null);
  }, [isOpen, editingPrompt]);

  // 保存ボタン押下時のバリデーションとイベント伝播
  const handleSave = () => {
    if (!title.trim() || !prompt.trim()) {
      setError(t('validation_required'));
      return;
    }
    onSave({ 
      title: title.trim(), 
      prompt: prompt.trim(),
      categoryId: selectedCategoryId 
    });
  };

  // 保存ボタンのクリック時、ファイル選択有無で分岐
  const handleSaveClick = () => {
    if (!editingPrompt && selectedFile) {
      onImportPrompts();
    } else {
      handleSave();
    }
  };

  // モーダルが閉じられた際の初期化
  const handleClose = () => {
    setTitle('');
    setPrompt('');
    setError(null);
    setSelectedCategoryId(undefined);
    onClose();
  };

  if (!isOpen) return null;

  // モーダルのアニメーション用のクラス
  const modalClasses = `fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-300 ${
    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
  }`;
  
  const contentClasses = `bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md shadow-xl transform transition-all duration-300 ${
    isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
  } border border-slate-200 dark:border-slate-700`;

  return (
    <div className={modalClasses}>
      {/* オーバーレイ */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* モーダルコンテンツ */}
      <div className={contentClasses} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            {editingPrompt ? t('edit_prompt') : t('add_prompt')}
          </h2>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            aria-label={t('common.close')}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="prompt-title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t('prompt_title')}
            </label>
            <input
              id="prompt-title"
              type="text"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder={t('prompt_title_placeholder')}
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="prompt-body" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t('prompt_body')}
            </label>
            <textarea
              id="prompt-body"
              className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-h-[120px]"
              placeholder={t('prompt_body_placeholder')}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
            />
          </div>
          
          {/* カテゴリ選択 */}
          <div>
            <label htmlFor="category-select" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t('category')}
            </label>
            <select
              id="category-select"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none"
              style={{
                backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.5rem center',
                backgroundSize: '1.5em 1.5em'
              }}
              value={selectedCategoryId || ''}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCategoryId(e.target.value || undefined)}
            >
              <option value="">{t('no_category')}</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400 rounded-lg">
              {error}
            </div>
          )}

          {/* ファイルインポート */}
          {!editingPrompt && (
            <div className="pt-2">
              <label htmlFor="prompt-file-input" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t('import_from_file')}
              </label>
              <div className="flex items-center">
                <label className="flex-1 cursor-pointer">
                  <span className="sr-only">{t('choose_file')}</span>
                  <input
                    id="prompt-file-input"
                    type="file"
                    accept=".txt,.md,.yaml,.yml"
                    className="hidden"
                    onChange={onFileChange}
                  />
                  <div className="w-full px-4 py-2 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200 text-center">
                    {selectedFile ? (
                      <span className="text-sm text-slate-600 dark:text-slate-300 truncate block">
                        {selectedFile.name}
                      </span>
                    ) : (
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {t('drag_drop_or_click')}
                      </span>
                    )}
                  </div>
                </label>
                {selectedFile && (
                  <button
                    type="button"
                    onClick={onImportPrompts}
                    className="ml-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    {t('common.add')}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={handleSaveClick}
            disabled={!title.trim() || !prompt.trim()}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ${
              !title.trim() || !prompt.trim()
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {editingPrompt ? t('common.update') : t('common.save')}
          </button>
        </div>
      </div>
    </div>
  );
};
