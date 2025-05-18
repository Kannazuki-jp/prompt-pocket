import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import CategoryManager from '../../../src/pages/CategoryManager';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../../src/features/prompt/promptService';

// モック
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'categoryManager.title': 'カテゴリ管理',
        'categoryManager.placeholder': 'カテゴリ名を入力',
        'common.add': '追加',
        'common.edit': '編集',
        'common.delete': '削除',
        'common.save': '保存',
        'common.cancel': 'キャンセル',
        'categoryManager.error.emptyName': 'カテゴリ名を入力してください',
        'categoryManager.error.duplicateName': '同じ名前のカテゴリが既に存在します',
      };
      return translations[key] || key;
    },
  }),
}));

// promptServiceのモック
vi.mock('../../../src/features/prompt/promptService', () => ({
  getCategories: vi.fn(),
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
}));

describe('CategoryManager', () => {
  const mockCategories = [
    { id: 'cat1', name: '仕事', createdAt: 1621234567890, updatedAt: 1621234567890 },
    { id: 'cat2', name: '学習', createdAt: 1621234567890, updatedAt: 1621234567890 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // モックの初期値を設定
    (getCategories as any).mockResolvedValue(mockCategories);
    (createCategory as any).mockImplementation(async (input) => {
      return { 
        id: 'new-uuid', 
        name: input.name, 
        createdAt: Date.now(), 
        updatedAt: Date.now() 
      };
    });
    (updateCategory as any).mockImplementation(async (id, input) => {
      return { 
        id, 
        name: input.name, 
        createdAt: 1621234567890, 
        updatedAt: Date.now() 
      };
    });
    (deleteCategory as any).mockResolvedValue(undefined);
  });

  test('コンポーネントが正しくレンダリングされる', async () => {
    render(<CategoryManager />);
    
    // タイトルが表示されていることを確認
    expect(screen.getByText('カテゴリ管理')).toBeInTheDocument();
    
    // 入力フィールドが表示されていることを確認
    expect(screen.getByPlaceholderText('カテゴリ名を入力')).toBeInTheDocument();
    
    // 追加ボタンが表示されていることを確認
    expect(screen.getByText('追加')).toBeInTheDocument();
    
    // カテゴリリストが表示されるのを待つ
    await waitFor(() => {
      expect(screen.getByText('仕事')).toBeInTheDocument();
      expect(screen.getByText('学習')).toBeInTheDocument();
    });
    
    // getCategories が呼ばれたことを確認
    expect(getCategories).toHaveBeenCalledTimes(1);
  });

  test('カテゴリを追加できる', async () => {
    render(<CategoryManager />);
    
    // 入力フィールドにカテゴリ名を入力
    const input = screen.getByPlaceholderText('カテゴリ名を入力');
    fireEvent.change(input, { target: { value: '新しいカテゴリ' } });
    
    // 追加ボタンをクリック
    const addButton = screen.getByText('追加');
    fireEvent.click(addButton);
    
    // createCategory が呼ばれたことを確認
    await waitFor(() => {
      expect(createCategory).toHaveBeenCalledWith({ name: '新しいカテゴリ' });
    });
    
    // getCategories が再度呼ばれたことを確認（追加後にリストを更新）
    expect(getCategories).toHaveBeenCalledTimes(2);
    
    // 入力フィールドがクリアされたことを確認
    expect(input).toHaveValue('');
  });

  test('空のカテゴリ名でエラーが表示される', async () => {
    render(<CategoryManager />);
    
    // 入力フィールドを空のままにする
    const input = screen.getByPlaceholderText('カテゴリ名を入力');
    fireEvent.change(input, { target: { value: '' } });
    
    // 追加ボタンをクリック
    const addButton = screen.getByText('追加');
    fireEvent.click(addButton);
    
    // エラーメッセージが表示されることを確認
    expect(screen.getByText('カテゴリ名を入力してください')).toBeInTheDocument();
    
    // createCategory が呼ばれないことを確認
    expect(createCategory).not.toHaveBeenCalled();
  });

  test('重複するカテゴリ名でエラーが表示される', async () => {
    render(<CategoryManager />);
    
    // カテゴリリストが表示されるのを待つ
    await waitFor(() => {
      expect(screen.getByText('仕事')).toBeInTheDocument();
    });
    
    // 既存のカテゴリ名を入力
    const input = screen.getByPlaceholderText('カテゴリ名を入力');
    fireEvent.change(input, { target: { value: '仕事' } });
    
    // 追加ボタンをクリック
    const addButton = screen.getByText('追加');
    fireEvent.click(addButton);
    
    // エラーメッセージが表示されることを確認
    expect(screen.getByText('同じ名前のカテゴリが既に存在します')).toBeInTheDocument();
    
    // createCategory が呼ばれないことを確認
    expect(createCategory).not.toHaveBeenCalled();
  });

  test('カテゴリを編集できる', async () => {
    render(<CategoryManager />);
    
    // カテゴリリストが表示されるのを待つ
    await waitFor(() => {
      expect(screen.getByText('仕事')).toBeInTheDocument();
    });
    
    // 編集ボタンを探してクリック（アクセシビリティラベルを使用）
    const editButtons = screen.getAllByLabelText('編集');
    fireEvent.click(editButtons[0]); // 最初のカテゴリの編集ボタンをクリック
    
    // 編集モードに入り、入力フィールドが表示されることを確認
    const editInput = screen.getByDisplayValue('仕事');
    expect(editInput).toBeInTheDocument();
    
    // 入力フィールドの値を変更
    fireEvent.change(editInput, { target: { value: '更新したカテゴリ' } });
    
    // 保存ボタンをクリック
    const saveButton = screen.getByLabelText('保存');
    fireEvent.click(saveButton);
    
    // updateCategory が呼ばれたことを確認
    await waitFor(() => {
      expect(updateCategory).toHaveBeenCalledWith('cat1', { name: '更新したカテゴリ' });
    });
    
    // getCategories が再度呼ばれたことを確認（更新後にリストを更新）
    expect(getCategories).toHaveBeenCalledTimes(2);
  });

  test('カテゴリを削除できる', async () => {
    render(<CategoryManager />);
    
    // カテゴリリストが表示されるのを待つ
    await waitFor(() => {
      expect(screen.getByText('仕事')).toBeInTheDocument();
    });
    
    // 削除ボタンを探してクリック（アクセシビリティラベルを使用）
    const deleteButtons = screen.getAllByLabelText('削除');
    fireEvent.click(deleteButtons[0]); // 最初のカテゴリの削除ボタンをクリック
    
    // deleteCategory が呼ばれたことを確認
    await waitFor(() => {
      expect(deleteCategory).toHaveBeenCalledWith('cat1');
    });
    
    // getCategories が再度呼ばれたことを確認（削除後にリストを更新）
    expect(getCategories).toHaveBeenCalledTimes(2);
  });

  test('編集をキャンセルできる', async () => {
    render(<CategoryManager />);
    
    // カテゴリリストが表示されるのを待つ
    await waitFor(() => {
      expect(screen.getByText('仕事')).toBeInTheDocument();
    });
    
    // 編集ボタンを探してクリック
    const editButtons = screen.getAllByLabelText('編集');
    fireEvent.click(editButtons[0]); // 最初のカテゴリの編集ボタンをクリック
    
    // 編集モードに入り、入力フィールドが表示されることを確認
    const editInput = screen.getByDisplayValue('仕事');
    expect(editInput).toBeInTheDocument();
    
    // 入力フィールドの値を変更
    fireEvent.change(editInput, { target: { value: '変更後の名前' } });
    
    // キャンセルボタンをクリック
    const cancelButton = screen.getByLabelText('キャンセル');
    fireEvent.click(cancelButton);
    
    // 編集モードが終了し、元のカテゴリ名が表示されることを確認
    await waitFor(() => {
      expect(screen.getByText('仕事')).toBeInTheDocument();
      expect(screen.queryByDisplayValue('変更後の名前')).not.toBeInTheDocument();
    });
    
    // updateCategory が呼ばれていないことを確認
    expect(updateCategory).not.toHaveBeenCalled();
  });

  test('編集時に空の名前を入力するとエラーが表示される', async () => {
    render(<CategoryManager />);
    
    // カテゴリリストが表示されるのを待つ
    await waitFor(() => {
      expect(screen.getByText('仕事')).toBeInTheDocument();
    });
    
    // 編集ボタンを探してクリック
    const editButtons = screen.getAllByLabelText('編集');
    fireEvent.click(editButtons[0]); // 最初のカテゴリの編集ボタンをクリック
    
    // 編集モードに入り、入力フィールドが表示されることを確認
    const editInput = screen.getByDisplayValue('仕事');
    
    // 入力フィールドの値を空に変更
    fireEvent.change(editInput, { target: { value: '' } });
    
    // 保存ボタンをクリック
    const saveButton = screen.getByLabelText('保存');
    fireEvent.click(saveButton);
    
    // エラーメッセージが表示されることを確認
    expect(screen.getByText('カテゴリ名を入力してください')).toBeInTheDocument();
    
    // updateCategory が呼ばれていないことを確認
    expect(updateCategory).not.toHaveBeenCalled();
  });

  test('エンターキーでカテゴリを追加できる', async () => {
    render(<CategoryManager />);
    
    // 入力フィールドにカテゴリ名を入力
    const input = screen.getByPlaceholderText('カテゴリ名を入力');
    fireEvent.change(input, { target: { value: '新しいカテゴリ' } });
    
    // エンターキーを押す
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    // createCategory が呼ばれたことを確認
    await waitFor(() => {
      expect(createCategory).toHaveBeenCalledWith({ name: '新しいカテゴリ' });
    });
  });
}); 