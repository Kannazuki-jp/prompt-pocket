import { useState, useEffect, useCallback } from 'react';
import { Prompt, PromptInput } from '../core/types';
import { NotificationType } from '../core/types/ui';
import { promptService } from '../features/prompt/promptService';
import { filterPrompts } from './utils/promptUtils';
import { NOTIFICATION_TIMEOUT_MS } from '../core/constants/app';
import { PasteMessage, PasteResponse } from '../core/types/messaging';
import { useTranslation } from 'react-i18next';
import { extractVariables, hasVariables, replaceVariables } from './utils/templateUtils';

export interface UsePromptManagementReturn {
  prompts: Prompt[];
  filteredPrompts: Prompt[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  modalOpen: boolean;
  modalMode: 'add' | 'edit' | null;
  editingPrompt: Prompt | null;
  notification: { message: string | null; type: NotificationType | null };
  loadPrompts: () => Promise<void>;
  handleAdd: () => void;
  handleEditPrompt: (id: string) => void;
  handleCloseModal: () => void;
  handleSave: (data: PromptInput) => Promise<void>;
  handleDeletePrompt: (id: string) => Promise<void>;
  handlePastePrompt: (text: string) => Promise<void>;
  categories: Array<{ id: string; name: string; count: number }>;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleImportPrompts: () => Promise<void>;
  selectedFile: File | null;
  // 変数置換関連
  variableModalOpen: boolean;
  currentPromptText: string;
  promptVariables: string[];
  handleVariableModalClose: () => void;
  handleVariableSubmit: (values: Record<string, string>) => Promise<void>;
}

export const usePromptManagement = (): UsePromptManagementReturn => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [notification, setNotification] = useState<{ message: string | null; type: NotificationType | null }>({ message: null, type: null });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // 変数置換関連の状態
  const [variableModalOpen, setVariableModalOpen] = useState(false);
  const [currentPromptText, setCurrentPromptText] = useState('');
  const [promptVariables, setPromptVariables] = useState<string[]>([]);
  const { t } = useTranslation();

  const loadPrompts = useCallback(async () => {
    try {
      const loadedPrompts = await promptService.getAllPrompts();
      setPrompts(loadedPrompts);
    } catch (error) {
      console.error(t('error_load') || 'プロンプトの読み込みに失敗しました', error);
      setNotification({ message: t('error_load') || 'プロンプトの読み込みに失敗しました', type: NotificationType.ERROR });
    }
  }, [t]);

  useEffect(() => {
    loadPrompts();
  }, [loadPrompts]);

  const handleAdd = () => {
    setModalMode('add');
    setEditingPrompt(null);
    setModalOpen(true);
  };

  const _handleEditInternal = (promptToEdit: Prompt) => {
    setModalMode('edit');
    setEditingPrompt(promptToEdit);
    setModalOpen(true);
  };
  
  const handleEditPrompt = (id: string) => {
    const found = prompts.find((p) => p.id === id);
    if (found) {
      _handleEditInternal(found);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingPrompt(null);
    setModalMode(null);
    setSelectedFile(null);
  };

  const handleSave = async (data: PromptInput) => {
    try {
      if (modalMode === 'add') {
        await promptService.savePrompt({ ...data, isFavorite: false });
        setNotification({ message: t('success_add'), type: NotificationType.SUCCESS });
      } else if (modalMode === 'edit' && editingPrompt) {
        await promptService.updatePrompt(editingPrompt.id, data);
        setNotification({ message: t('success_update'), type: NotificationType.SUCCESS });
      }
      await loadPrompts();
    } catch (error) {
      console.error(t('error_save'), error);
      setNotification({ message: t('error_save'), type: NotificationType.ERROR });
    } finally {
      handleCloseModal();
    }
  };

  const _handleDeleteInternal = async (promptId: string) => {
    if (!window.confirm(t('confirm_delete') || '本当に削除しますか？')) return;
    try {
      await promptService.deletePrompt(promptId);
      setNotification({ message: t('success_delete'), type: NotificationType.SUCCESS });
      await loadPrompts();
    } catch (error) {
      setNotification({ message: t('error_delete'), type: NotificationType.ERROR });
    }
  };

  const handleDeletePrompt = async (id: string) => {
    await _handleDeleteInternal(id); 
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleImportPrompts = async () => {
    if (!selectedFile) {
      setNotification({ message: t('file_selected_none'), type: NotificationType.ERROR });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const fileContent = e.target?.result as string;
      if (!fileContent) {
        setNotification({ message: t('error_import'), type: NotificationType.ERROR });
        return;
      }

      const fileName = selectedFile.name.replace(/\.[^/.]+$/, "");

      if (fileContent.trim() === '') {
          setNotification({ message: t('error_import'), type: NotificationType.ERROR });
          return;
      }
      
      try {
        await promptService.savePrompt({ 
          title: fileName, 
          prompt: fileContent,
          isFavorite: false 
        });

        setNotification({ message: t('success_import', { title: fileName }), type: NotificationType.SUCCESS });
        await loadPrompts();
        handleCloseModal();
      } catch (error) {
        console.error(t('error_import'), error);
        setNotification({ message: t('error_import'), type: NotificationType.ERROR });
      }
    };
    reader.onerror = () => {
      setNotification({ message: t('error_import'), type: NotificationType.ERROR });
    };
    reader.readAsText(selectedFile);
  };

  // 変数モーダルを閉じる処理
  const handleVariableModalClose = () => {
    setVariableModalOpen(false);
    setCurrentPromptText('');
    setPromptVariables([]);
  };

  // 変数置換後のプロンプトを貼り付ける処理
  const handleVariableSubmit = async (values: Record<string, string>) => {
    try {
      // 変数を置換したテキストを生成
      const replacedText = replaceVariables(currentPromptText, values);
      
      // 置換したテキストを貼り付け
      await pasteTextToActiveTab(replacedText);
      
      // モーダルを閉じる
      handleVariableModalClose();
    } catch (error: any) {
      console.error('Error in variable replacement:', error);
      setNotification({ 
        message: `${t('error')}: ${error.message || t('error_paste_generic')}`, 
        type: NotificationType.ERROR 
      });
    }
  };

  // アクティブなタブにテキストを貼り付ける共通関数
  const pasteTextToActiveTab = async (text: string) => {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs.length === 0) {
        throw new Error(t('error_no_active_tab'));
      }
      const activeTab = tabs[0];
      if (!activeTab.id) {
        throw new Error(t('error_no_active_tab_id'));
      }

      const message: PasteMessage = { type: 'PASTE_PROMPT', text };
      const response: PasteResponse = await chrome.tabs.sendMessage(activeTab.id, message);

      if (response && response.success) {
        setNotification({ message: t('success_paste'), type: NotificationType.SUCCESS });
      } else {
        throw new Error(response?.error || t('error_paste'));
      }
    } catch (error: any) {
      console.error('Error sending paste message:', error);
      let displayMessage = t('error_paste_generic');
      if (error.message && error.message.includes('No matching message handler')) {
        displayMessage = t('error_paste_no_handler');
      } else if (error.message) {
        displayMessage = `${t('error')}: ${error.message}`;
      }
      setNotification({ message: displayMessage, type: NotificationType.ERROR });
      throw error; // エラーを再スローして呼び出し元でもキャッチできるようにする
    }
  };

  // プロンプトの貼り付け処理
  const handlePastePrompt = useCallback(async (text: string) => {
    try {
      // デバッグ用ログ
      console.log('貼り付けるテキスト:', text);
      
      // プロンプトに変数が含まれているかチェック
      const containsVariables = hasVariables(text);
      console.log('変数を含んでいるか:', containsVariables);
      
      if (containsVariables) {
        // 変数を抽出
        const variables = extractVariables(text);
        console.log('検出された変数:', variables);
        
        if (variables.length > 0) {
          console.log('変数モーダルを表示します');
          // 変数置換モーダルを表示するための状態をセット
          setCurrentPromptText(text);
          setPromptVariables(variables);
          setVariableModalOpen(true);
          console.log('variableModalOpen:', true);
          return; // 変数モーダルで処理するのでここで終了
        }
      }
      
      console.log('変数なし、直接貼り付けます');
      // 変数がない場合は直接貼り付け
      await pasteTextToActiveTab(text);
    } catch (error: any) {
      console.error('Error in paste prompt:', error);
      // エラー処理はpasteTextToActiveTab内で行われるため、ここでは何もしない
    }
  }, [t]);

  useEffect(() => {
    if (notification.message) {
      const timer = setTimeout(() => setNotification({ message: null, type: null }), NOTIFICATION_TIMEOUT_MS);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const filteredPrompts = filterPrompts(prompts, searchTerm, selectedCategory);
  
  const categories = [
    { id: 'all', name: 'すべて', count: prompts.length },
    { id: 'favorites', name: 'お気に入り', count: prompts.filter(p => p.isFavorite).length }, 
  ];

  return {
    prompts,
    filteredPrompts,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    modalOpen,
    modalMode,
    editingPrompt,
    notification,
    loadPrompts,
    handleAdd,
    handleEditPrompt,
    handleCloseModal,
    handleSave,
    handleDeletePrompt,
    handlePastePrompt,
    categories,
    handleFileChange,
    handleImportPrompts,
    selectedFile,
    // 変数置換関連
    variableModalOpen,
    currentPromptText,
    promptVariables,
    handleVariableModalClose,
    handleVariableSubmit,
  };
};