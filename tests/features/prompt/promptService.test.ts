import { Prompt, Category } from '../../../src/core/types';
import { 
  promptService, 
  getCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from '../../../src/features/prompt/promptService';
import {
  getAllPrompts as storageGetAllPrompts,
  savePrompt as storageSavePrompt,
  updatePrompt as storageUpdatePrompt,
  deletePrompt as storageDeletePrompt,
} from '../../../src/shared/utils/storage';
import { describe, test, expect, vi, beforeEach } from 'vitest';

// storageのモック
vi.mock('../../../src/shared/utils/storage', () => ({
  getAllPrompts: vi.fn(),
  savePrompt: vi.fn(),
  updatePrompt: vi.fn(),
  deletePrompt: vi.fn(),
}));

// chrome APIのモック
const mockChromeStorage = {
  get: vi.fn(),
  set: vi.fn().mockImplementation(() => Promise.resolve()),
};

// crypto.randomUUIDのモックはtests/setup.tsで設定済み

describe('promptService', () => {
  const mockPrompts: Prompt[] = [
    { id: 'id1', title: 'Prompt 1', prompt: 'Content 1', categoryId: 'cat1', isFavorite: false, createdAt: 1621234568000, updatedAt: 1621234568000 },
    { id: 'id2', title: 'Prompt 2', prompt: 'Content 2', categoryId: 'cat2', isFavorite: true, createdAt: 1621234567000, updatedAt: 1621234567000 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (storageGetAllPrompts as any).mockResolvedValue(mockPrompts);
    (storageSavePrompt as any).mockImplementation(async (data) => ({
      id: 'new-id',
      ...data,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }));
    (storageUpdatePrompt as any).mockImplementation(async (id, data) => ({
      id,
      ...mockPrompts.find(p => p.id === id),
      ...data,
      updatedAt: Date.now(),
    }));
    (storageDeletePrompt as any).mockResolvedValue(undefined);
  });

  describe('getAllPrompts', () => {
    test('すべてのプロンプトを取得して日付の降順でソートする', async () => {
      const prompts = await promptService.getAllPrompts();
      
      expect(storageGetAllPrompts).toHaveBeenCalledTimes(1);
      expect(prompts).toHaveLength(2);
      // 日付降順でソートされていることを確認（createdAtが新しい順）
      expect(prompts[0].id).toBe('id1');
      expect(prompts[1].id).toBe('id2');
    });

    test('エラーが発生した場合はエラーを投げる', async () => {
      const error = new Error('Storage error');
      (storageGetAllPrompts as any).mockRejectedValue(error);
      
      await expect(promptService.getAllPrompts()).rejects.toThrow(error);
      expect(storageGetAllPrompts).toHaveBeenCalledTimes(1);
    });
  });

  describe('savePrompt', () => {
    test('プロンプトを保存する', async () => {
      const newPrompt = {
        title: 'New Prompt',
        prompt: 'New Content',
        categoryId: 'cat1',
        isFavorite: false,
      };
      
      const result = await promptService.savePrompt(newPrompt);
      
      expect(storageSavePrompt).toHaveBeenCalledTimes(1);
      expect(storageSavePrompt).toHaveBeenCalledWith(newPrompt);
      expect(result.id).toBe('new-id');
      expect(result.title).toBe(newPrompt.title);
      expect(result.prompt).toBe(newPrompt.prompt);
    });

    test('エラーが発生した場合はエラーを投げる', async () => {
      const error = new Error('Storage error');
      (storageSavePrompt as any).mockRejectedValue(error);
      
      const newPrompt = {
        title: 'New Prompt',
        prompt: 'New Content',
        categoryId: 'cat1',
        isFavorite: false,
      };
      
      await expect(promptService.savePrompt(newPrompt)).rejects.toThrow(error);
      expect(storageSavePrompt).toHaveBeenCalledTimes(1);
    });
  });

  describe('updatePrompt', () => {
    test('プロンプトを更新する', async () => {
      const id = 'id1';
      const updates = {
        title: 'Updated Title',
        prompt: 'Updated Content',
      };
      
      const result = await promptService.updatePrompt(id, updates);
      
      expect(storageUpdatePrompt).toHaveBeenCalledTimes(1);
      expect(storageUpdatePrompt).toHaveBeenCalledWith(id, updates);
      expect(result?.id).toBe(id);
      expect(result?.title).toBe(updates.title);
      expect(result?.prompt).toBe(updates.prompt);
    });

    test('エラーが発生した場合はエラーを投げる', async () => {
      const error = new Error('Storage error');
      (storageUpdatePrompt as any).mockRejectedValue(error);
      
      const id = 'id1';
      const updates = {
        title: 'Updated Title',
      };
      
      await expect(promptService.updatePrompt(id, updates)).rejects.toThrow(error);
      expect(storageUpdatePrompt).toHaveBeenCalledTimes(1);
    });
  });

  describe('deletePrompt', () => {
    test('プロンプトを削除する', async () => {
      const id = 'id1';
      
      await promptService.deletePrompt(id);
      
      expect(storageDeletePrompt).toHaveBeenCalledTimes(1);
      expect(storageDeletePrompt).toHaveBeenCalledWith(id);
    });

    test('エラーが発生した場合はエラーを投げる', async () => {
      const error = new Error('Storage error');
      (storageDeletePrompt as any).mockRejectedValue(error);
      
      const id = 'id1';
      
      await expect(promptService.deletePrompt(id)).rejects.toThrow(error);
      expect(storageDeletePrompt).toHaveBeenCalledTimes(1);
    });
  });
});

describe('Category functions', () => {
  const mockCategories: Category[] = [
    { id: 'cat1', name: '仕事', createdAt: 1621234567890, updatedAt: 1621234567890 },
    { id: 'cat2', name: '学習', createdAt: 1621234567890, updatedAt: 1621234567890 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // chrome.storage.local.get のモック
    global.chrome.storage.local.get = vi.fn().mockImplementation((key) => {
      if (key === 'categories') {
        return Promise.resolve({ categories: mockCategories });
      }
      if (key === 'prompts') {
        return Promise.resolve({ prompts: [] });
      }
      return Promise.resolve({});
    });
  });

  describe('getCategories', () => {
    test('カテゴリを取得する', async () => {
      const categories = await getCategories();
      
      expect(global.chrome.storage.local.get).toHaveBeenCalledWith('categories');
      expect(categories).toEqual(mockCategories);
    });

    test('カテゴリが存在しない場合はデフォルトカテゴリを作成する', async () => {
      // カテゴリが存在しない場合をシミュレート
      global.chrome.storage.local.get = vi.fn().mockResolvedValue({});
      
      const categories = await getCategories();
      
      expect(global.chrome.storage.local.get).toHaveBeenCalledWith('categories');
      expect(global.chrome.storage.local.set).toHaveBeenCalledTimes(1);
      expect(categories).toHaveLength(3); // デフォルトの3カテゴリ
      expect(categories[0].name).toBe('仕事');
      expect(categories[1].name).toBe('学習');
      expect(categories[2].name).toBe('アイデア');
    });
  });

  describe('createCategory', () => {
    test('新しいカテゴリを作成する', async () => {
      const newCategory = { name: '新しいカテゴリ' };
      
      const result = await createCategory(newCategory);
      
      expect(global.chrome.storage.local.get).toHaveBeenCalledWith('categories');
      expect(global.chrome.storage.local.set).toHaveBeenCalledTimes(1);
      expect(result.id).toBe('test-uuid'); // setup.tsでモック化されたUUID
      expect(result.name).toBe(newCategory.name);
      expect(result.createdAt).toBeGreaterThan(0);
      expect(result.updatedAt).toBeGreaterThan(0);
    });
  });

  describe('updateCategory', () => {
    test('既存のカテゴリを更新する', async () => {
      const id = 'cat1';
      const updates = { name: '更新されたカテゴリ' };
      
      const result = await updateCategory(id, updates);
      
      expect(global.chrome.storage.local.get).toHaveBeenCalledWith('categories');
      expect(global.chrome.storage.local.set).toHaveBeenCalledTimes(1);
      expect(result.id).toBe(id);
      expect(result.name).toBe(updates.name);
      expect(result.updatedAt).toBe(Date.now()); // Date.nowは固定値にモック化されているので
    });

    test('存在しないカテゴリを更新しようとするとエラーを投げる', async () => {
      const id = 'non-existent-id';
      const updates = { name: '更新されたカテゴリ' };
      
      await expect(updateCategory(id, updates)).rejects.toThrow('Category not found');
      expect(global.chrome.storage.local.get).toHaveBeenCalledWith('categories');
      expect(global.chrome.storage.local.set).not.toHaveBeenCalled();
    });
  });

  describe('deleteCategory', () => {
    test('カテゴリを削除し、関連するプロンプトを更新する', async () => {
      const id = 'cat1';
      const mockPrompts = [
        { id: 'p1', title: 'P1', prompt: 'C1', categoryId: 'cat1' },
        { id: 'p2', title: 'P2', prompt: 'C2', categoryId: 'cat2' },
      ];
      
      // プロンプトデータがある場合をシミュレート
      global.chrome.storage.local.get = vi.fn().mockImplementation((key) => {
        if (key === 'categories') {
          return Promise.resolve({ categories: mockCategories });
        }
        if (key === 'prompts') {
          return Promise.resolve({ prompts: mockPrompts });
        }
        return Promise.resolve({});
      });
      
      await deleteCategory(id);
      
      // カテゴリの削除確認
      expect(global.chrome.storage.local.get).toHaveBeenCalledWith('categories');
      expect(global.chrome.storage.local.set).toHaveBeenCalledTimes(2); // カテゴリとプロンプトの2回
      
      // カテゴリ更新の確認
      const mockSet = global.chrome.storage.local.set as any;
      const categorySetCall = mockSet.mock.calls[0][0];
      expect(categorySetCall).toHaveProperty('categories');
      expect(categorySetCall.categories).toHaveLength(1);
      expect(categorySetCall.categories[0].id).toBe('cat2');
      
      // プロンプト更新の確認
      const promptSetCall = mockSet.mock.calls[1][0];
      expect(promptSetCall).toHaveProperty('prompts');
      expect(promptSetCall.prompts).toHaveLength(2);
      expect(promptSetCall.prompts[0].categoryId).toBeUndefined(); // カテゴリIDがクリアされている
      expect(promptSetCall.prompts[1].categoryId).toBe('cat2'); // 他のカテゴリIDは変更されていない
    });
  });
}); 