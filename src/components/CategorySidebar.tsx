import React from 'react';

// カテゴリーサイドバーのスタイル
const categoryStyles = {
  categorySection: "mb-6",
  categoryHeader: "text-xs uppercase font-semibold text-slate-500 mb-2 tracking-wider",
  categoryList: "space-y-1",
  categoryItem: "flex items-center py-2 px-3 rounded-md text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors duration-150",
  categoryItemActive: "flex items-center py-2 px-3 rounded-md bg-blue-50 text-blue-700 font-medium cursor-pointer transition-colors duration-150"
};

interface Category {
  id: string;
  name: string;
  count: number;
}

interface CategorySidebarProps {
  categories: Category[];
  selectedCategory: string | null;
  setSelectedCategory: (categoryId: string) => void;
}

// カテゴリーサイドバーコンポーネント
const CategorySidebar: React.FC<CategorySidebarProps> = ({ categories, selectedCategory, setSelectedCategory }) => {
  return (
    <div className={categoryStyles.categorySection}>
      <h2 className={categoryStyles.categoryHeader}>カテゴリー</h2>
      <ul className={categoryStyles.categoryList}>
        {categories.map(category => (
          <li 
            key={category.id}
            className={selectedCategory === category.id ? categoryStyles.categoryItemActive : categoryStyles.categoryItem}
            onClick={() => setSelectedCategory(category.id)}
          >
            <span className="flex-grow">{category.name}</span>
            <span className="bg-slate-100 text-slate-600 text-xs py-0.5 px-2 rounded-full">{category.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategorySidebar;
