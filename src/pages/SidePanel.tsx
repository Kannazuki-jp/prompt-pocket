// プロンプト管理サイドパネルのメインコンポーネント
// なぜ状態をここで一元管理するか: UIとデータの同期・一貫性のため
import React, { useState } from 'react';
import { PromptModal } from '../components/PromptModal';
import PromptList from '../components/PromptList';
import { Notification } from '../components/Notification';
import { useTranslation } from 'react-i18next';
import CategoryManager from './CategoryManager';
import { usePromptManagement } from '../hooks/usePromptManagement';

// サイドパネル用スタイル - Chrome拡張機能サイドパネルに適したコンパクトな構造
const sidePanelStyles = {
  container: "h-screen flex flex-col bg-slate-50",
  header: "sticky top-0 bg-white border-b border-slate-200 px-3 py-2 z-10 shadow-sm flex items-center justify-between",
  title: "text-lg font-semibold text-slate-800 flex items-center",
  titleIcon: "w-5 h-5 mr-1.5 text-blue-500", // 旧スタイルから追加
  addButton: "bg-blue-500 hover:bg-blue-600 text-white p-1.5 rounded-md inline-flex items-center justify-center transition-colors", // 旧スタイルから追加
  mainContent: "flex-grow overflow-y-auto px-3 py-2", // 旧スタイルから mainArea を mainContent に変更し、sidebar を削除
  notificationContainer: "sticky top-[calc(theme(spacing.12)+1px)] z-10 w-full px-3 py-1", // ヘッダーの高さに応じて調整、旧スタイルを参考に新規追加
  notificationArea: "min-h-8"
};

const TABS = [
  { key: 'prompt', label: 'プロンプト管理' },
  { key: 'category', label: 'カテゴリ管理' },
];

// SidePanelコンポーネント本体
const SidePanel: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<'prompt' | 'category'>('prompt');
  const {
    filteredPrompts,
    modalOpen,
    modalMode,
    editingPrompt,
    notification,
    handleAdd,
    handleEditPrompt,
    handleCloseModal,
    handleSave,
    handleDeletePrompt,
    handlePastePrompt,
    handleFileChange,
    handleImportPrompts,
    selectedFile,
  } = usePromptManagement();

  return (
    <div className={sidePanelStyles.container}>
      {/* ヘッダー部分 */}
      <header className={sidePanelStyles.header}>
        <h1 className={sidePanelStyles.title}>
          <svg className={sidePanelStyles.titleIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {t('app_title')}
        </h1>
        <div className="flex items-center space-x-2">
          <button
            className={sidePanelStyles.addButton}
            onClick={handleAdd}
            title={t('add_prompt')}
            disabled={activeTab !== 'prompt'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
          {/* 言語切替ボタン */}
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white p-1.5 rounded-md inline-flex items-center justify-center font-bold text-xs transition-colors"
            onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'ja' : 'en')}
            title={i18n.language === 'en' ? '日本語に切替' : 'Switch to English'}
            style={{ minWidth: 32 }}
          >
            {i18n.language === 'en' ? 'JA' : 'EN'}
          </button>
        </div>
      </header>

      {/* タブUI */}
      <div className="flex border-b border-slate-200 bg-white px-3">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`py-2 px-4 -mb-px border-b-2 text-sm font-medium transition-colors duration-150 ${
              activeTab === tab.key
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-blue-500'
            }`}
            onClick={() => setActiveTab(tab.key as 'prompt' | 'category')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 通知エリア */}
      <div className={sidePanelStyles.notificationContainer}>
        <div className={sidePanelStyles.notificationArea}>
          <Notification
            message={notification.message}
            type={notification.type}
            isVisible={!!notification.message}
          />
        </div>
      </div>

      {/* メインコンテンツエリア */}
      <main className={sidePanelStyles.mainContent}>
        {activeTab === 'prompt' ? (
          <PromptList
            prompts={filteredPrompts}
            onEditPrompt={handleEditPrompt}
            onDeletePrompt={handleDeletePrompt}
            onPastePrompt={handlePastePrompt}
          />
        ) : (
          <CategoryManager />
        )}
      </main>

      {/* モーダル */}
      {modalOpen && activeTab === 'prompt' && (
        <PromptModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          onSave={handleSave}
          editingPrompt={editingPrompt}
          onFileChange={handleFileChange}
          onImportPrompts={handleImportPrompts}
          selectedFile={selectedFile}
        />
      )}
    </div>
  );
};

export default SidePanel;
