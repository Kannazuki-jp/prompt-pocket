import { Prompt } from '../types';

// プロンプトを検索語とカテゴリーでフィルタリングする関数
// なぜこの関数をユーティリティとして抽出するか: フィルタリングロジックを再利用可能にし、テストを容易にするため
export function filterPrompts(prompts: Prompt[], searchTerm: string, selectedCategory: string | null): Prompt[] {
  return prompts.filter(prompt => {
    const matchesSearch = prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          prompt.prompt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || selectedCategory === null || 
                            (selectedCategory === 'favorites' && prompt.isFavorite);
    return matchesSearch && matchesCategory;
  });
}
