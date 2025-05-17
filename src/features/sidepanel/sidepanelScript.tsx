// サイドパネル用のエントリーポイント
// なぜ別ファイルにするか: サイドパネルはポップアップとは異なるエントリーポイントが必要なため
import React from 'react';
import '../../styles.css';
import '../../i18n';

// 絶対パスを使用
import SidePanelComponent from '../../features/sidepanel/pages/SidePanel';

// Reactコンポーネントをレンダリングします
import { createRoot } from 'react-dom/client';

// DOMが読み込まれた後に実行
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('app');
  if (container) {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <SidePanelComponent />
      </React.StrictMode>
    );
  }
});