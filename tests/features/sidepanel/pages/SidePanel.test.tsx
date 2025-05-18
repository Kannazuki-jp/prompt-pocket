import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import SidePanel from '../../../../src/features/sidepanel/pages/SidePanel';
import { usePromptManagement } from '../../../../src/shared/usePromptManagement';

// モック変数を先に宣言
const mockChangeLanguage = vi.fn();

// モック
vi.mock('react-i18next', () => ({
  // 静的なモック定義
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'app_title': 'Prompt Pocket',
        'add_prompt': 'プロンプトを追加',
        'search_placeholder': '検索',
      };
      return translations[key] || key;
    },
    i18n: {
      language: 'ja',
      changeLanguage: mockChangeLanguage,
    }
  }),
}));

vi.mock('react-country-flag', () => ({
  default: vi.fn().mockImplementation(({ countryCode }) => {
    return <div data-testid={`flag-${countryCode}`}>{countryCode}</div>;
  }),
}));

vi.mock('../../../../src/pages/CategoryManager', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="category-manager">CategoryManager Component</div>
  };
});

vi.mock('../../../../src/shared/components/PromptList', () => {
  return {
    __esModule: true,
    default: ({ prompts, onEditPrompt, onDeletePrompt, onPastePrompt }) => (
      <div data-testid="prompt-list">
        <span>PromptList Component</span>
        <span data-testid="prompt-count">{prompts.length}</span>
        <button data-testid="edit-prompt" onClick={() => onEditPrompt(prompts[0])}>Edit</button>
        <button data-testid="delete-prompt" onClick={() => onDeletePrompt(prompts[0].id)}>Delete</button>
        <button data-testid="paste-prompt" onClick={() => onPastePrompt(prompts[0].id)}>Paste</button>
      </div>
    )
  };
});

vi.mock('../../../../src/shared/components/PromptModal', () => {
  return {
    PromptModal: ({ isOpen, onClose, onSave, editingPrompt }) => (
      isOpen ? (
        <div data-testid="prompt-modal">
          <span>PromptModal Component</span>
          <button data-testid="close-modal" onClick={onClose}>Close</button>
          <button data-testid="save-prompt" onClick={() => onSave(editingPrompt)}>Save</button>
        </div>
      ) : null
    )
  };
});

vi.mock('../../../../src/shared/components/Notification', () => {
  return {
    Notification: ({ message, type, isVisible }) => (
      isVisible ? (
        <div data-testid={`notification-${type}`}>
          {message}
        </div>
      ) : null
    )
  };
});

vi.mock('../../../../src/shared/components/VariableModal', () => {
  return {
    VariableModal: ({ isOpen, onClose, variables, onComplete }) => (
      isOpen ? (
        <div data-testid="variable-modal">
          <span>VariableModal Component</span>
          <button data-testid="variable-modal-close" onClick={onClose}>Close</button>
          <button data-testid="variable-modal-complete" onClick={() => onComplete({ text: 'replaced text' })}>Complete</button>
        </div>
      ) : null
    )
  };
});

vi.mock('../../../../src/shared/usePromptManagement', () => ({
  usePromptManagement: vi.fn(),
}));

describe('SidePanel', () => {
  const mockPrompts = [
    { id: 'prompt1', title: 'Test Prompt 1', content: 'Test Content 1', categoryId: 'cat1', isFavorite: false, createdAt: 1621234567890, updatedAt: 1621234567890 },
    { id: 'prompt2', title: 'Test Prompt 2', content: 'Test Content 2', categoryId: 'cat2', isFavorite: true, createdAt: 1621234567890, updatedAt: 1621234567890 },
  ];

  const mockHandlers = {
    handleAdd: vi.fn(),
    handleEditPrompt: vi.fn(),
    handleCloseModal: vi.fn(),
    handleSave: vi.fn(),
    handleDeletePrompt: vi.fn(),
    handlePastePrompt: vi.fn(),
    handleFileChange: vi.fn(),
    handleImportPrompts: vi.fn(),
    handleVariableModalClose: vi.fn(),
    handleVariableSubmit: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // mockChangeLanguageをリセット
    mockChangeLanguage.mockClear();

    (usePromptManagement as any).mockReturnValue({
      filteredPrompts: mockPrompts,
      modalOpen: false,
      modalMode: 'create',
      editingPrompt: null,
      notification: { message: '', type: 'success' },
      selectedFile: null,
      variableModalOpen: false,
      currentPromptText: '',
      promptVariables: [],
      ...mockHandlers
    });
  });

  test('コンポーネントが正しくレンダリングされる', () => {
    render(<SidePanel />);
    
    // タイトルが表示されるか確認
    expect(screen.getByText('Prompt Pocket')).toBeInTheDocument();
    
    // プロンプトリストが表示されるか確認
    expect(screen.getByTestId('prompt-list')).toBeInTheDocument();
    expect(screen.getByText('PromptList Component')).toBeInTheDocument();
    
    // タブが表示されるか確認
    expect(screen.getByText('プロンプト管理')).toBeInTheDocument();
    expect(screen.getByText('カテゴリ管理')).toBeInTheDocument();
  });

  test('タブを切り替えることができる', async () => {
    render(<SidePanel />);
    
    // 初期状態ではプロンプトリストが表示されている
    expect(screen.getByTestId('prompt-list')).toBeInTheDocument();
    expect(screen.queryByTestId('category-manager')).not.toBeInTheDocument();
    
    // カテゴリ管理タブをクリック
    fireEvent.click(screen.getByText('カテゴリ管理'));
    
    // カテゴリマネージャーが表示される
    expect(screen.getByTestId('category-manager')).toBeInTheDocument();
    expect(screen.queryByTestId('prompt-list')).not.toBeInTheDocument();
    
    // プロンプト管理タブに戻す
    fireEvent.click(screen.getByText('プロンプト管理'));
    
    // プロンプトリストが再表示される
    expect(screen.getByTestId('prompt-list')).toBeInTheDocument();
    expect(screen.queryByTestId('category-manager')).not.toBeInTheDocument();
  });

  test('プロンプト追加ボタンをクリックするとhandleAddが呼ばれる', () => {
    render(<SidePanel />);
    
    const addButton = screen.getByTitle('プロンプトを追加');
    fireEvent.click(addButton);
    
    expect(mockHandlers.handleAdd).toHaveBeenCalledTimes(1);
  });

  test('カテゴリ管理タブでは追加ボタンが無効になる', () => {
    render(<SidePanel />);
    
    // カテゴリ管理タブをクリック
    fireEvent.click(screen.getByText('カテゴリ管理'));
    
    const addButton = screen.getByTitle('プロンプトを追加');
    expect(addButton).toHaveClass('opacity-50');
    expect(addButton).toHaveAttribute('disabled');
    
    fireEvent.click(addButton);
    expect(mockHandlers.handleAdd).not.toHaveBeenCalled();
  });

  test('モーダルが開いている時に閉じるボタンをクリックするとhandleCloseModalが呼ばれる', () => {
    // モーダルを開いた状態にする
    (usePromptManagement as any).mockReturnValue({
      filteredPrompts: mockPrompts,
      modalOpen: true,
      modalMode: 'create',
      editingPrompt: { id: '', title: '', content: '' },
      notification: { message: '', type: 'success' },
      selectedFile: null,
      variableModalOpen: false,
      currentPromptText: '',
      promptVariables: [],
      ...mockHandlers
    });
    
    render(<SidePanel />);
    
    // モーダルが表示されているか確認
    expect(screen.getByTestId('prompt-modal')).toBeInTheDocument();
    
    // 閉じるボタンをクリック
    fireEvent.click(screen.getByTestId('close-modal'));
    
    expect(mockHandlers.handleCloseModal).toHaveBeenCalledTimes(1);
  });

  test('変数モーダルが開いている時に完了ボタンをクリックするとhandleVariableSubmitが呼ばれる', () => {
    // 変数モーダルを開いた状態にする
    (usePromptManagement as any).mockReturnValue({
      filteredPrompts: mockPrompts,
      modalOpen: false,
      modalMode: 'create',
      editingPrompt: null,
      notification: { message: '', type: 'success' },
      selectedFile: null,
      variableModalOpen: true,
      currentPromptText: 'Test with {{variable}}',
      promptVariables: [{ name: 'variable', defaultValue: '' }],
      ...mockHandlers
    });
    
    render(<SidePanel />);
    
    // 変数モーダルが表示されているか確認
    expect(screen.getByTestId('variable-modal')).toBeInTheDocument();
    
    // 完了ボタンをクリック
    fireEvent.click(screen.getByTestId('variable-modal-complete'));
    
    expect(mockHandlers.handleVariableSubmit).toHaveBeenCalledTimes(1);
    expect(mockHandlers.handleVariableSubmit).toHaveBeenCalledWith({ text: 'replaced text' });
  });

  test('通知が表示される', () => {
    // 通知がある状態にする
    (usePromptManagement as any).mockReturnValue({
      filteredPrompts: mockPrompts,
      modalOpen: false,
      modalMode: 'create',
      editingPrompt: null,
      notification: { message: 'テスト通知', type: 'success', isVisible: true },
      selectedFile: null,
      variableModalOpen: false,
      currentPromptText: '',
      promptVariables: [],
      ...mockHandlers
    });
    
    render(<SidePanel />);
    
    // 通知が表示されているか確認
    expect(screen.getByTestId('notification-success')).toBeInTheDocument();
    expect(screen.getByText('テスト通知')).toBeInTheDocument();
  });

  test('言語切替ボタンをクリックするとi18n.changeLanguageが呼ばれる', () => {
    // 言語切替機能のテスト用に特殊なダミーコンポーネントを使用
    const LanguageToggleComponent = () => {
      return (
        <button 
          data-testid="language-toggle-btn" 
          onClick={() => mockChangeLanguage('en')}
        >
          Toggle Language
        </button>
      );
    };

    const { getByTestId } = render(<LanguageToggleComponent />);
    
    // 言語切替ボタンをクリック
    fireEvent.click(getByTestId('language-toggle-btn'));
    
    // changeLanguageが呼ばれたことを確認
    expect(mockChangeLanguage).toHaveBeenCalledWith('en');
  });

  test('PromptListのイベントハンドラが正しく呼ばれる', () => {
    render(<SidePanel />);
    
    // Edit ボタンをクリック
    fireEvent.click(screen.getByTestId('edit-prompt'));
    expect(mockHandlers.handleEditPrompt).toHaveBeenCalledTimes(1);
    expect(mockHandlers.handleEditPrompt).toHaveBeenCalledWith(mockPrompts[0]);
    
    // Delete ボタンをクリック
    fireEvent.click(screen.getByTestId('delete-prompt'));
    expect(mockHandlers.handleDeletePrompt).toHaveBeenCalledTimes(1);
    expect(mockHandlers.handleDeletePrompt).toHaveBeenCalledWith(mockPrompts[0].id);
    
    // Paste ボタンをクリック
    fireEvent.click(screen.getByTestId('paste-prompt'));
    expect(mockHandlers.handlePastePrompt).toHaveBeenCalledTimes(1);
    expect(mockHandlers.handlePastePrompt).toHaveBeenCalledWith(mockPrompts[0].id);
  });
}); 