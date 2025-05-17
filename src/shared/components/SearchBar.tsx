import React from 'react';

// 検索バーのスタイル
const searchBarStyles = {
  searchBar: "relative mb-6 mt-1",
  searchInput: "w-full py-2.5 pl-10 pr-4 rounded-lg border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-slate-700 transition-all duration-200 bg-white/80",
  searchIcon: "absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
};

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

// 検索バーコンポーネント
const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className={searchBarStyles.searchBar}>
      <svg className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        placeholder="プロンプトを検索..."
        className={searchBarStyles.searchInput}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;
