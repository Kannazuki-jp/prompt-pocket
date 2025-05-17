// プロンプト管理サイドパネルのメインコンポーネント
// なぜ状態をここで一元管理するか: UIとデータの同期・一貫性のため
import React, { useState } from 'react';
import { PromptModal } from '../shared/components/PromptModal';
import PromptList from '../shared/components/PromptList';
import { Notification } from '../shared/components/Notification';
import { useTranslation } from 'react-i18next';
import { FiPlus } from 'react-icons/fi';
import ReactCountryFlag from 'react-country-flag';
import CategoryManager from './CategoryManager';
import { usePromptManagement } from '../shared/usePromptManagement';

// サイドパネル用スタイル - モダンでスタイリッシュなデザインに更新
const sidePanelStyles = {
  container: "h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 text-slate-800 dark:text-slate-100",
  header: "sticky top-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200/80 dark:border-slate-700/50 px-4 py-3 z-20 shadow-sm flex items-center justify-between",
  title: "text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center",
  titleIcon: "w-5 h-5 mr-2 text-indigo-500",
  addButton: "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white p-2 rounded-lg inline-flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md",
  mainContent: "flex-grow overflow-y-auto px-4 py-3 bg-white/50 dark:bg-slate-800/30 backdrop-blur-sm",
  notificationContainer: "sticky top-16 z-10 w-full px-4 py-1.5",
  notificationArea: "min-h-8 transition-all duration-300"
};

const TABS = [
  { key: 'prompt', label: 'プロンプト管理' },
  { key: 'category', label: 'カテゴリ管理' },
];

// SidePanelコンポーネント本体
// タブの型を定義
type TabType = 'prompt' | 'category';

const SidePanel: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('prompt');
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
        <div className="flex items-center space-x-2.5">
          <button
            className={`${activeTab !== 'prompt' ? 'opacity-50 cursor-not-allowed' : ''} bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white p-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center`}
            onClick={handleAdd}
            title={t('add_prompt')}
            disabled={activeTab !== 'prompt'}
            aria-label={t('add_prompt')}
          >
            <FiPlus className="w-4 h-4" />
            <span className="sr-only">{t('add_prompt')}</span>
          </button>
          {/* 言語切替ボタン - react-country-flag を使用 */}
          <button
            className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center"
            onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'ja' : 'en')}
            title={i18n.language === 'en' ? '日本語に切替' : 'Switch to English'}
            aria-label={i18n.language === 'en' ? '日本語に切替' : 'Switch to English'}
          >
            {i18n.language === 'en' ? (
              <ReactCountryFlag
                countryCode="US"
                svg
                style={{
                  width: '1.25rem',
                  height: '1.25rem',
                  borderRadius: '0.125rem',
                  overflow: 'hidden'
                }}
                title="United States"
              />
            ) : (
              <ReactCountryFlag
                countryCode="JP"
                svg
                style={{
                  width: '1.25rem',
                  height: '1.25rem',
                  borderRadius: '0.125rem',
                  overflow: 'hidden'
                }}
                title="Japan"
              />
            )}
            <span className="sr-only">{i18n.language === 'en' ? '日本語に切替' : 'Switch to English'}</span>
          </button>
        </div>
      </header>

      {/* タブUI */}
      <div className="relative px-4 pt-1 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-b border-slate-200/80 dark:border-slate-700/50">
        <div className="flex">
          {TABS.map((tab, index) => (
            <button
              key={tab.key}
              className={`relative px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
                activeTab === tab.key
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
              onClick={() => setActiveTab(tab.key as 'prompt' | 'category')}
            >
              {tab.label}
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t"></span>
              )}
            </button>
          ))}
        </div>
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
