import React, { useEffect, useState } from 'react';
import { Category } from '../types';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../services/promptService';

const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setCategories(await getCategories());
  };

  const handleAdd = async () => {
    if (!newCategoryName.trim()) {
      setError('カテゴリ名を入力してください');
      return;
    }
    if (categories.some(c => c.name === newCategoryName.trim())) {
      setError('同じ名前のカテゴリが既に存在します');
      return;
    }
    await createCategory({ name: newCategoryName.trim() });
    setNewCategoryName('');
    setError(null);
    loadCategories();
  };

  const handleEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditingName(name);
    setError(null);
  };

  const handleUpdate = async (id: string) => {
    if (!editingName.trim()) {
      setError('カテゴリ名を入力してください');
      return;
    }
    if (categories.some(c => c.name === editingName.trim() && c.id !== id)) {
      setError('同じ名前のカテゴリが既に存在します');
      return;
    }
    await updateCategory(id, { name: editingName.trim() });
    setEditingId(null);
    setEditingName('');
    setError(null);
    loadCategories();
  };

  const handleDelete = async (id: string) => {
    await deleteCategory(id);
    loadCategories();
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4 text-slate-800">カテゴリ管理</h2>
      <div className="mb-6 flex gap-2 items-center">
        <input
          type="text"
          value={newCategoryName}
          onChange={e => setNewCategoryName(e.target.value)}
          placeholder="新しいカテゴリ名"
          className="border border-slate-300 rounded p-2 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-200"
          onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
        />
        <button onClick={handleAdd} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors">追加</button>
      </div>
      {error && <div className="text-red-500 mb-4 text-sm">{error}</div>}
      <div className="space-y-3">
        {categories.map(cat => (
          <div key={cat.id} className="flex items-center bg-white rounded-lg border border-slate-200 px-4 py-3 shadow-sm">
            <span className="inline-block bg-blue-100 text-blue-700 text-xs font-medium rounded px-2 py-0.5 mr-4 min-w-[60px] text-center">
              {cat.name}
            </span>
            {editingId === cat.id ? (
              <>
                <input
                  type="text"
                  value={editingName}
                  onChange={e => setEditingName(e.target.value)}
                  className="border border-slate-300 rounded p-1 flex-1 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  onKeyDown={e => { if (e.key === 'Enter') handleUpdate(cat.id); }}
                />
                <button onClick={() => handleUpdate(cat.id)} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded mr-1 transition-colors">保存</button>
                <button onClick={() => setEditingId(null)} className="bg-gray-200 hover:bg-gray-300 text-slate-700 px-3 py-1 rounded transition-colors">キャンセル</button>
              </>
            ) : (
              <>
                <div className="flex-1" />
                <button onClick={() => handleEdit(cat.id, cat.name)} className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded mr-1 transition-colors">編集</button>
                <button onClick={() => handleDelete(cat.id)} className="bg-red-100 hover:bg-red-200 text-red-600 px-3 py-1 rounded transition-colors">削除</button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryManager; 