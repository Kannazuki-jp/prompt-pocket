// Chrome拡張ストレージAPIをPromiseでラップし、型安全なCRUD操作を提供する
// なぜPromise化するか: Reactのasync/awaitやエラーハンドリングと統一でき、可読性・保守性が上がるため
import { Prompt } from '../types';

// ストレージキーは一元管理（仕様でpromptsと決定）
const STORAGE_KEY = 'prompts';

// コールバックAPIをPromiseでラップ
function getStorageData<T>(key: string): Promise<T | undefined> {
  return new Promise((resolve) => {
    chrome.storage.local.get(key, (result) => {
      // 失敗時はundefinedを返す（console.errorは呼び出し元で対応）
      resolve(result[key]);
    });
  });
}

function setStorageData<T>(key: string, value: T): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [key]: value }, () => {
      resolve();
    });
  });
}

// すべてのプロンプトを取得
export async function getAllPrompts(): Promise<Prompt[]> {
  // データがない場合は空配列を返す
  const prompts = await getStorageData<Prompt[]>(STORAGE_KEY);
  if (!Array.isArray(prompts)) return [];
  
  // 各プロンプトのIDが文字列であることを保証する
  return prompts.map(prompt => ({
    ...prompt,
    id: String(prompt.id) // IDを文字列に変換
  }));
}

// プロンプトを新規保存
export async function savePrompt(promptData: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>): Promise<Prompt> {
  // なぜUUID+タイムスタンプを生成するか: 一意性と時系列管理のため
  const newPrompt: Prompt = {
    id: String(crypto.randomUUID()), // IDを明示的に文字列に変換
    title: promptData.title,
    prompt: promptData.prompt,
    isFavorite: promptData.isFavorite,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  try {
    const prompts = await getAllPrompts();
    await setStorageData(STORAGE_KEY, [...prompts, newPrompt]);
    return newPrompt;
  } catch (e) {
    // 仕様によりconsole.errorのみ
    console.error('Failed to save prompt', e);
    throw e;
  }
}

// プロンプトを更新
export async function updatePrompt(promptId: string, updatedData: Partial<Omit<Prompt, 'id' | 'createdAt'>>): Promise<Prompt | null> {
  try {
    const prompts = await getAllPrompts();
    // promptId を文字列に変換して比較
    const index = prompts.findIndex((p) => p.id === String(promptId));
    if (index === -1) return null;
    
    const updatedPrompt: Prompt = {
      ...prompts[index],
      ...updatedData,
      updatedAt: Date.now(),
    };
    
    prompts[index] = updatedPrompt;
    await setStorageData(STORAGE_KEY, prompts);
    return updatedPrompt;
  } catch (e) {
    console.error('Failed to update prompt', e);
    throw e;
  }
}

// プロンプトを削除
export async function deletePrompt(promptId: string): Promise<void> {
  try {
    const prompts = await getAllPrompts();
    // promptId を文字列に変換して比較
    const filtered = prompts.filter((p) => p.id !== String(promptId));
    await setStorageData(STORAGE_KEY, filtered);
  } catch (e) {
    console.error('Failed to delete prompt', e);
    throw e;
  }
}
