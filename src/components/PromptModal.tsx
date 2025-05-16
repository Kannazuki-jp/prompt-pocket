// プロンプト追加・編集用のモーダルコンポーネント（UIと状態管理のみ、ストレージ操作は親から渡される）
// なぜpropsで制御するか: 再利用性・状態管理の一元化のため
import React, { useState, useEffect } from 'react';
import { Prompt } from '../types';

export interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { title: string; prompt: string }) => void;
  editingPrompt?: Prompt | null;
}

export const PromptModal: React.FC<PromptModalProps> = ({ isOpen, onClose, onSave, editingPrompt }) => {
  // フォームのローカル状態
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);

  // 編集時は初期値をセット
  useEffect(() => {
    if (editingPrompt) {
      setTitle(editingPrompt.title);
      setPrompt(editingPrompt.prompt);
    } else {
      setTitle('');
      setPrompt('');
    }
    setError(null);
  }, [isOpen, editingPrompt]);

  // 保存ボタン押下時のバリデーションとイベント伝播
  const handleSave = () => {
    if (!title.trim() || !prompt.trim()) {
      setError('タイトルと本文は必須です');
      return;
    }
    onSave({ title: title.trim(), prompt: prompt.trim() });
  };

  // モーダルが閉じられた際の初期化
  const handleClose = () => {
    setTitle('');
    setPrompt('');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  // Tailwind CSSで中央・オーバーレイ表示
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
        <h2 className="text-xl font-bold mb-4">
          {editingPrompt ? 'プロンプト編集' : '新規プロンプト追加'}
        </h2>
        <input
          type="text"
          className="border rounded p-2 w-full mb-2"
          placeholder="タイトル"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <textarea
          className="border rounded p-2 w-full h-32 mb-2"
          placeholder="プロンプト本文"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
        />
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        <div className="flex justify-end space-x-2">
          <button
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
            onClick={handleClose}
          >キャンセル</button>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded"
            onClick={handleSave}
          >保存</button>
        </div>
      </div>
    </div>
  );
};
