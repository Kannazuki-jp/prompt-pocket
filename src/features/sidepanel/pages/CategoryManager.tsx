import React, { useEffect, useState } from 'react';
import { Category } from '../../../core/types';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../../features/prompt/promptService';
import { useTranslation } from 'react-i18next';
import { FiEdit2, FiTrash2, FiCheck, FiX, FiPlus } from 'react-icons/fi';

const CategoryManager: React.FC = () => {
  const { t } = useTranslation();
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
      setError(t('categoryManager.error.emptyName'));
      return;
    }
    if (categories.some(c => c.name === newCategoryName.trim())) {
      setError(t('categoryManager.error.duplicateName'));
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
      setError(t('categoryManager.error.emptyName'));
      return;
    }
    if (categories.some(c => c.name === editingName.trim() && c.id !== id)) {
      setError(t('categoryManager.error.duplicateName'));
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
    <div className="p-5 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
        {t('categoryManager.title')}
      </h2>
      
      {/* カテゴリ追加フォーム */}
      <div className="relative mb-6 group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition-all duration-300"></div>
        <div className="relative flex gap-2 bg-white dark:bg-slate-800 rounded-lg p-1 shadow-lg">
          <input
            type="text"
            value={newCategoryName}
            onChange={e => setNewCategoryName(e.target.value)}
            placeholder={t('categoryManager.placeholder')}
            className="w-full px-4 py-3 text-sm bg-transparent border-0 focus:ring-0 focus:outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400"
            onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
          />
          <button 
            onClick={handleAdd} 
            aria-label={t('common.add')} 
            className="px-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-md hover:opacity-90 transition-all flex items-center justify-center font-medium"
          >
            <FiPlus className="mr-1" /> {t('common.add')}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-sm rounded-lg border border-red-200 dark:border-red-800 transition-all duration-300">
          {error}
        </div>
      )}
      
      {/* カテゴリリスト */}
      <div className="space-y-3">
        {categories.map(cat => (
          <div 
            key={cat.id} 
            className="relative group overflow-hidden bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-slate-100 dark:border-slate-700"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="relative flex items-center p-3">
              {editingId === cat.id ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={editingName}
                    onChange={e => setEditingName(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-md border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    onKeyDown={e => { if (e.key === 'Enter') handleUpdate(cat.id); }}
                    autoFocus
                  />
                  <div className="flex gap-1">
                    <button 
                      onClick={() => handleUpdate(cat.id)} 
                      aria-label={t('common.save')} 
                      className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-full transition-colors"
                    >
                      <FiCheck className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setEditingId(null)} 
                      aria-label={t('common.cancel')} 
                      className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <span className="inline-block bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-semibold rounded-full px-3 py-1.5 mr-3 whitespace-nowrap shadow-sm">
                    {cat.name}
                  </span>
                  <div className="flex-1" />
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button 
                      onClick={() => handleEdit(cat.id, cat.name)} 
                      aria-label={t('common.edit')} 
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-colors"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(cat.id)} 
                      aria-label={t('common.delete')} 
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryManager; 