import { setInputValue, getInputElement } from '../../src/utils/dom';
import '@testing-library/jest-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';

describe('DOM Utils', () => {
  beforeEach(() => {
    // DOMをクリア
    document.body.innerHTML = '';
  });

  describe('setInputValue', () => {
    test('テキスト入力要素に値を設定できる', () => {
      // テスト用の入力要素を作成
      const input = document.createElement('input');
      input.type = 'text';
      document.body.appendChild(input);
      
      // イベントリスナーをモック
      const inputHandler = vi.fn();
      const changeHandler = vi.fn();
      input.addEventListener('input', inputHandler);
      input.addEventListener('change', changeHandler);
      
      // テスト対象の関数を実行
      const result = setInputValue(input, 'テストテキスト');
      
      // アサーション
      expect(result).toBe(true);
      expect(input.value).toBe('テストテキスト');
      expect(inputHandler).toHaveBeenCalledTimes(1);
      expect(changeHandler).toHaveBeenCalledTimes(1);
    });
    
    test('テキストエリア要素に値を設定できる', () => {
      // テスト用のテキストエリア要素を作成
      const textarea = document.createElement('textarea');
      document.body.appendChild(textarea);
      
      // イベントリスナーをモック
      const inputHandler = vi.fn();
      const changeHandler = vi.fn();
      textarea.addEventListener('input', inputHandler);
      textarea.addEventListener('change', changeHandler);
      
      // テスト対象の関数を実行
      const result = setInputValue(textarea, 'テストテキスト\n複数行');
      
      // アサーション
      expect(result).toBe(true);
      expect(textarea.value).toBe('テストテキスト\n複数行');
      expect(inputHandler).toHaveBeenCalledTimes(1);
      expect(changeHandler).toHaveBeenCalledTimes(1);
    });
    
    test('contentEditableな要素に値を設定できる', () => {
      // テスト用のcontentEditable要素を作成
      const div = document.createElement('div');
      // JSDOMではisContentEditableプロパティが常にfalseを返すので、直接プロパティを模倣する
      div.contentEditable = 'true';
      Object.defineProperty(div, 'isContentEditable', { value: true });
      document.body.appendChild(div);
      
      // イベントリスナーをモック
      const inputHandler = vi.fn();
      const changeHandler = vi.fn();
      div.addEventListener('input', inputHandler);
      div.addEventListener('change', changeHandler);
      
      // テスト対象の関数を実行
      const result = setInputValue(div, 'テストテキスト');
      
      // アサーション
      expect(result).toBe(true);
      expect(div.innerText).toBe('テストテキスト');
      expect(inputHandler).toHaveBeenCalledTimes(1);
      expect(changeHandler).toHaveBeenCalledTimes(1);
    });
    
    test('サポートされていない要素には値を設定できない', () => {
      // テスト用の非入力要素を作成
      const span = document.createElement('span');
      document.body.appendChild(span);
      
      // JSDOMでは初期値がundefinedなので、テキストを初期設定
      span.textContent = '';
      
      // テスト対象の関数を実行
      const result = setInputValue(span, 'テストテキスト');
      
      // アサーション
      expect(result).toBe(false);
      // textContentを使用してチェック
      expect(span.textContent).toBe('');
    });
    
    test('エラーが発生した場合はfalseを返す', () => {
      // テスト用の入力要素を作成
      const input = document.createElement('input');
      input.type = 'text';
      document.body.appendChild(input);
      
      // dispatchEventをモックしてエラーを発生させる
      const originalDispatchEvent = input.dispatchEvent;
      input.dispatchEvent = vi.fn().mockImplementation(() => {
        throw new Error('Mocked error');
      });
      
      // テスト対象の関数を実行
      const result = setInputValue(input, 'テストテキスト');
      
      // アサーション
      expect(result).toBe(false);
      
      // モックをリストア
      input.dispatchEvent = originalDispatchEvent;
    });
  });
  
  describe('getInputElement', () => {
    test('セレクタに一致する入力要素を取得できる', () => {
      // テスト用の入力要素を作成
      const input = document.createElement('input');
      input.id = 'test-input';
      input.type = 'text';
      document.body.appendChild(input);
      
      // テスト対象の関数を実行
      const result = getInputElement('#test-input');
      
      // アサーション
      expect(result).toBe(input);
    });
    
    test('セレクタに一致するテキストエリア要素を取得できる', () => {
      // テスト用のテキストエリア要素を作成
      const textarea = document.createElement('textarea');
      textarea.id = 'test-textarea';
      document.body.appendChild(textarea);
      
      // テスト対象の関数を実行
      const result = getInputElement('#test-textarea');
      
      // アサーション
      expect(result).toBe(textarea);
    });
    
    test('セレクタに一致するcontentEditable要素を取得できる', () => {
      // テスト用のcontentEditable要素を作成
      const div = document.createElement('div');
      div.id = 'test-div';
      div.contentEditable = 'true';
      document.body.appendChild(div);
      
      // テスト対象の関数を実行
      const result = getInputElement('#test-div');
      
      // アサーション
      expect(result).toBe(div);
    });
    
    test('セレクタに一致する要素がない場合はnullを返す', () => {
      // テスト対象の関数を実行
      const result = getInputElement('#non-existent');
      
      // アサーション
      expect(result).toBeNull();
    });
  });
}); 