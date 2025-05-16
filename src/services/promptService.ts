import { Prompt, PromptInput } from '../types';
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