import { Prompt, PromptInput, Category, CategoryInput } from '../types';
import {
  getAllPrompts as storageGetAllPrompts,
  savePrompt as storageSavePrompt,
  updatePrompt as storageUpdatePrompt,
  deletePrompt as storageDeletePrompt,
} from '../utils/storage';

// プロンプトサービスのエラー型を定義することも可能
// export class PromptServiceError extends Error { ... }

export const promptService = {
  async getAllPrompts(): Promise<Prompt[]> {
    try {
      const prompts = await storageGetAllPrompts();
      // ここで必要に応じてデータ変換や追加のビジネスロジックを挟むことができる
      // 例えば、特定のフォーマットに変換したり、バリデーションを行ったりする
      return prompts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('PromptService: getAllPrompts failed', error);
      // ここでカスタムエラーをthrowしたり、エラーをラップしたりできる
      throw error; // または new PromptServiceError('Failed to get prompts');
    }
  },

  async savePrompt(data: PromptInput & { isFavorite: boolean }): Promise<Prompt> {
    try {
      // isFavorite はここでデフォルト値を設定するか、呼び出し元で担保する
      // 現在の実装では呼び出し元 (usePromptManagement) で isFavorite: false を渡している
      const newPrompt = await storageSavePrompt(data);
      return newPrompt;
    } catch (error) {
      console.error('PromptService: savePrompt failed', error);
      throw error;
    }
  },

  async updatePrompt(id: string, data: Partial<PromptInput>): Promise<Prompt | null> {
    try {
      const updatedPrompt = await storageUpdatePrompt(id, data as Partial<Omit<Prompt, 'id' | 'createdAt'>>);
      // storageUpdatePrompt の updatedData の型は Partial<Omit<Prompt, 'id' | 'createdAt'>> なのでキャストが必要
      return updatedPrompt;
    } catch (error) {
      console.error('PromptService: updatePrompt failed', error);
      throw error;
    }
  },

  async deletePrompt(id: string): Promise<void> {
    try {
      await storageDeletePrompt(id);
    } catch (error) {
      console.error('PromptService: deletePrompt failed', error);
      throw error;
    }
  },
};

// ストレージキー
const PROMPTS_STORAGE_KEY = 'prompts';
const CATEGORIES_STORAGE_KEY = 'categories';

// カテゴリの取得
export const getCategories = async (): Promise<Category[]> => {
  const result = await chrome.storage.local.get(CATEGORIES_STORAGE_KEY);
  let categories: Category[] = result[CATEGORIES_STORAGE_KEY] || [];

  if (categories.length === 0) {
    // デフォルトカテゴリを追加
    const now = Date.now();
    categories = [
      { id: crypto.randomUUID(), name: '仕事', createdAt: now, updatedAt: now },
      { id: crypto.randomUUID(), name: '学習', createdAt: now, updatedAt: now },
      { id: crypto.randomUUID(), name: 'アイデア', createdAt: now, updatedAt: now },
    ];
    await chrome.storage.local.set({ [CATEGORIES_STORAGE_KEY]: categories });
  }

  return categories;
};

// カテゴリの作成
export const createCategory = async (input: CategoryInput): Promise<Category> => {
  const categories = await getCategories();
  const newCategory: Category = {
    id: crypto.randomUUID(),
    name: input.name,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  
  await chrome.storage.local.set({
    [CATEGORIES_STORAGE_KEY]: [...categories, newCategory],
  });
  
  return newCategory;
};

// カテゴリの更新
export const updateCategory = async (id: string, input: CategoryInput): Promise<Category> => {
  const categories = await getCategories();
  const index = categories.findIndex(c => c.id === id);
  
  if (index === -1) {
    throw new Error('Category not found');
  }
  
  const updatedCategory = {
    ...categories[index],
    name: input.name,
    updatedAt: Date.now(),
  };
  
  categories[index] = updatedCategory;
  
  await chrome.storage.local.set({
    [CATEGORIES_STORAGE_KEY]: categories,
  });
  
  return updatedCategory;
};

// カテゴリの削除
export const deleteCategory = async (id: string): Promise<void> => {
  const categories = await getCategories();
  const filteredCategories = categories.filter(c => c.id !== id);
  
  await chrome.storage.local.set({
    [CATEGORIES_STORAGE_KEY]: filteredCategories,
  });
  
  // 関連するプロンプトのカテゴリをクリア
  const prompts = await promptService.getAllPrompts();
  const updatedPrompts = prompts.map((p: Prompt) => 
    p.categoryId === id ? { ...p, categoryId: undefined } : p
  );
  
  await chrome.storage.local.set({
    [PROMPTS_STORAGE_KEY]: updatedPrompts,
  });
};