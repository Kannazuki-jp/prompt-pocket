// サイドパネル用のエントリーポイント
// なぜ別ファイルにするか: サイドパネルはポップアップとは異なるエントリーポイントが必要なため
import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';


import SidePanelComponent from './pages/SidePanel'; // Import the refactored component


// Reactアプリのマウント
const container = document.getElementById('app');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <SidePanelComponent />
    </React.StrictMode>
  );
}
