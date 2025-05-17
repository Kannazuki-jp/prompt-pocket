import React, { useState, useEffect } from 'react';
import { Category } from '../types';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../services/promptService';

// カテゴリーサイドバーのスタイル
const categoryStyles = {
  categorySection: "mb-6",
  categoryHeader: "text-xs uppercase font-semibold text-slate-500 mb-2 tracking-wider",
  categoryList: "space-y-1",
  categoryItem: "flex items-center py-2 px-3 rounded-md text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors duration-150",
  categoryItemActive: "flex items-center py-2 px-3 rounded-md bg-blue-50 text-blue-700 font-medium cursor-pointer transition-colors duration-150"
};

interface CategorySidebarProps {
  onCategorySelect: (categoryId: string | undefined) => void;
  selectedCategoryId?: string;
}

export const CategorySidebar: React.FC<CategorySidebarProps> = ({
  onCategorySelect,
  selectedCategoryId,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const loadedCategories = await getCategories();
    setCategories(loadedCategories);
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      const newCategory = await createCategory({ name: newCategoryName.trim() });
      setCategories([...categories, newCategory]);
      setNewCategoryName('');
      setIsAddingCategory(false);
    } catch (error) {
      console.error('Failed to create category:', error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory(id);
      setCategories(categories.filter(c => c.id !== id));
      if (selectedCategoryId === id) {
        onCategorySelect(undefined);
      }
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  };

  return (
    <div className="w-64 bg-gray-100 p-4 h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">カテゴリ</h2>
        <button
          onClick={() => setIsAddingCategory(true)}
          className="text-blue-600 hover:text-blue-800"
        >
          ＋
        </button>
      </div>

      {isAddingCategory && (
        <div className="mb-4">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="新しいカテゴリ名"
            className="w-full p-2 border rounded"
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={() => setIsAddingCategory(false)}
              className="mr-2 text-gray-600 hover:text-gray-800"
            >
              キャンセル
            </button>
            <button
              onClick={handleAddCategory}
              className="text-blue-600 hover:text-blue-800"
            >
              追加
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <button
          onClick={() => onCategorySelect(undefined)}
          className={`w-full text-left p-2 rounded ${
            !selectedCategoryId ? 'bg-blue-100' : 'hover:bg-gray-200'
          }`}
        >
          すべて
        </button>
        {categories.map((category) => (
          <div
            key={category.id}
            className="flex items-center justify-between group"
          >
            <button
              onClick={() => onCategorySelect(category.id)}
              className={`flex-1 text-left p-2 rounded ${
                selectedCategoryId === category.id ? 'bg-blue-100' : 'hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
            <button
              onClick={() => handleDeleteCategory(category.id)}
              className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-800 p-2"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
