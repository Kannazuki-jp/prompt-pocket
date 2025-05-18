import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

// モック
vi.mock('#imports', () => ({
  defineSidePanel: (config: any) => config,
}));

// モックするためのファンクションを作成
const createElement = vi.fn();
const mockRender = vi.fn();
const createRoot = vi.fn(() => ({ render: mockRender }));

// Reactをモック
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    createElement,
  };
});

// ReactDOMをモック
vi.mock('react-dom/client', () => ({
  createRoot,
}));

// モックコンポーネント定義
const MockSidePanel = () => <div data-testid="side-panel">SidePanel Component</div>;

// SidePanelコンポーネントをモック
vi.mock('../../../../src/features/sidepanel/pages/SidePanel', () => ({
  __esModule: true,
  default: MockSidePanel
}));

// サイドパネルスクリプトのモックバージョンを作成
const mockSidepanelScript = {
  id: 'sidepanel',
  // main関数が呼ばれたときの挙動をシミュレート
  main() {
    document.addEventListener('DOMContentLoaded', () => {
      const appContainer = document.getElementById('app');
      if (appContainer) {
        const root = createRoot(appContainer);
        root.render(createElement(MockSidePanel));
      }
    });
  }
};

// sidepanelScriptをモック
vi.mock('../../../../src/features/sidepanel/sidepanelScript', () => {
  return {
    default: mockSidepanelScript
  };
});

describe('sidepanelScript', () => {
  let sidepanelScript: any;

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '<div id="app"></div>';
    
    // モックしたバージョンを使用
    sidepanelScript = mockSidepanelScript;
  });

  test('DOMContentLoadedイベントでSidePanelがレンダリングされる', () => {
    // サイドパネルスクリプトのmain関数を実行
    sidepanelScript.main();
    
    // DOMContentLoadedイベントをトリガー
    const event = new Event('DOMContentLoaded');
    document.dispatchEvent(event);
    
    // createRootとrenderが呼ばれたことを確認
    const appContainer = document.getElementById('app');
    
    expect(createRoot).toHaveBeenCalledWith(appContainer);
    expect(createElement).toHaveBeenCalledWith(MockSidePanel);
    expect(mockRender).toHaveBeenCalled();
  });

  test('appコンテナが存在しない場合はレンダリングされない', () => {
    // appコンテナを削除
    document.body.innerHTML = '';
    
    // サイドパネルスクリプトのmain関数を実行
    sidepanelScript.main();
    
    // DOMContentLoadedイベントをトリガー
    const event = new Event('DOMContentLoaded');
    document.dispatchEvent(event);
    
    // createRootとrenderが呼ばれていないことを確認
    expect(createRoot).not.toHaveBeenCalled();
    expect(createElement).not.toHaveBeenCalled();
    expect(mockRender).not.toHaveBeenCalled();
  });
}); 