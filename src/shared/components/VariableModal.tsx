// 変数置換用のモーダルコンポーネント
// プロンプト内の変数をユーザーが入力した値で置換するためのUI
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export interface VariableModalProps {
  isOpen: boolean;
  onClose: () => void;
  variables: string[];
  onComplete: (values: Record<string, string>) => void;
}

export const VariableModal: React.FC<VariableModalProps> = ({
  isOpen,
  onClose,
  variables,
  onComplete
}) => {
  const { t } = useTranslation();
  // 各変数の値を保持するステート
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  // モーダルが開かれるたびに状態をリセット
  useEffect(() => {
    if (isOpen) {
      // 変数の初期値を空文字列で初期化
      const initialValues: Record<string, string> = {};
      variables.forEach(variable => {
        initialValues[variable] = '';
      });
      setValues(initialValues);
      setError(null);
    }
  }, [isOpen, variables]);

  // 入力値の変更を処理
  const handleInputChange = (variable: string, value: string) => {
    setValues(prev => ({
      ...prev,
      [variable]: value
    }));
  };

  // 完了ボタンのクリック処理
  const handleComplete = () => {
    // すべての変数に値が入力されているか確認
    const hasEmptyValues = Object.values(values).some(value => value.trim() === '');
    
    if (hasEmptyValues) {
      setError(t('validation_required_all_variables'));
      return;
    }
    
    onComplete(values);
    onClose();
  };

  // モーダルが閉じられたときの処理
  const handleClose = () => {
    setValues({});
    setError(null);
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
            {t('variable_replacement')}
          </h2>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            aria-label={t('common.close')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
            {t('variable_replacement_description')}
          </p>

          {/* 変数入力フォーム */}
          {variables.map(variable => (
            <div key={variable} className="mb-4">
              <label 
                htmlFor={`variable-${variable}`} 
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                {variable}
              </label>
              <input
                id={`variable-${variable}`}
                type="text"
                value={values[variable] || ''}
                onChange={(e) => handleInputChange(variable, e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                placeholder={`${variable}の値を入力`}
              />
            </div>
          ))}

          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400 rounded-lg">
              {error}
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
            onClick={handleComplete}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
          >
            {t('common.apply')}
          </button>
        </div>
      </div>
    </div>
  );
};
