// プロンプト追加・編集用のモーダルコンポーネント（UIと状態管理のみ、ストレージ操作は親から渡される）
// なぜpropsで制御するか: 再利用性・状態管理の一元化のため
import React, { useState, useEffect } from 'react';
import { Prompt, PromptInput, Category } from '../types';
import { useTranslation } from 'react-i18next';
import { getCategories } from '../services/promptService';

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

  // Tailwind CSSで中央・オーバーレイ表示
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
        <h2 className="text-xl font-bold mb-4">
          {editingPrompt ? t('edit_prompt') : t('add_prompt')}
        </h2>
        <input
          type="text"
          className="border rounded p-2 w-full mb-2"
          placeholder={t('prompt_title')}
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <textarea
          className="border rounded p-2 w-full h-32 mb-2"
          placeholder={t('prompt_body')}
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
        />
        
        {/* カテゴリ選択 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('category')}
          </label>
          <select
            className="border rounded p-2 w-full"
            value={selectedCategoryId || ''}
            onChange={e => setSelectedCategoryId(e.target.value || undefined)}
          >
            <option value="">{t('no_category')}</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}

        {/* ファイルインポート */}
        {!editingPrompt && ( // 新規追加時のみ表示
          <div className="mb-4">
            <label htmlFor="prompt-file-input" className="block text-sm font-medium text-gray-700 mb-1">
              {t('import_from_file')}
            </label>
            <input
              id="prompt-file-input"
              type="file"
              accept=".txt,.md,.yaml,.yml"
              className="block w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
              "
              onChange={onFileChange}
            />
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <button
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
            onClick={handleClose}
          >{t('cancel')}</button>
          <button
            className={editingPrompt ? "bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded" : "bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"}
            onClick={handleSaveClick}
          >{t('save')}</button>
        </div>
      </div>
    </div>
  );
};
