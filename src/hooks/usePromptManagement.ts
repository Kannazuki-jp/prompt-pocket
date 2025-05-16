import { useState, useEffect, useCallback } from 'react';
import { Prompt, PromptInput } from '../types';
import { NotificationType } from '../types/ui';
import { promptService } from '../services/promptService';
import { filterPrompts } from '../utils/promptUtils';
import { NOTIFICATION_TIMEOUT_MS } from '../constants';
import { PasteMessage, PasteResponse } from '../types/messaging';

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
}

export const usePromptManagement = (): UsePromptManagementReturn => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [notification, setNotification] = useState<{ message: string | null; type: NotificationType | null }>({ message: null, type: null });

  const loadPrompts = useCallback(async () => {
    try {
      const loadedPrompts = await promptService.getAllPrompts();
      setPrompts(loadedPrompts);
    } catch (error) {
      console.error("プロンプトの読み込みに失敗しました", error);
      setNotification({ message: 'プロンプトの読み込みに失敗しました', type: NotificationType.ERROR });
    }
  }, []);

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
  };

  const handleSave = async (data: PromptInput) => {
    try {
      if (modalMode === 'add') {
        await promptService.savePrompt({ ...data, isFavorite: false });
        setNotification({ message: 'プロンプトを追加しました', type: NotificationType.SUCCESS });
      } else if (modalMode === 'edit' && editingPrompt) {
        await promptService.updatePrompt(editingPrompt.id, data);
        setNotification({ message: 'プロンプトを更新しました', type: NotificationType.SUCCESS });
      }
      await loadPrompts();
    } catch (error) {
      console.error("プロンプトの保存に失敗しました", error);
      setNotification({ message: 'プロンプトの保存に失敗しました', type: NotificationType.ERROR });
    } finally {
      handleCloseModal();
    }
  };

  const _handleDeleteInternal = async (promptId: string) => {
    if (!window.confirm('本当に削除しますか？')) return;
    try {
      await promptService.deletePrompt(promptId);
      setNotification({ message: 'プロンプトを削除しました', type: NotificationType.SUCCESS });
      await loadPrompts();
    } catch (error) {
      setNotification({ message: '削除に失敗しました', type: NotificationType.ERROR });
    }
  };

  const handleDeletePrompt = async (id: string) => {
    await _handleDeleteInternal(id); 
  };
  
  const handlePastePrompt = useCallback(async (text: string) => {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs.length === 0) {
        setNotification({ message: 'アクティブなタブが見つかりません', type: NotificationType.ERROR });
        return;
      }
      const activeTab = tabs[0];
      if (!activeTab.id) {
        setNotification({ message: 'アクティブなタブIDが取得できません', type: NotificationType.ERROR });
        return;
      }

      const message: PasteMessage = { type: 'PASTE_PROMPT', text };
      const response: PasteResponse = await chrome.tabs.sendMessage(activeTab.id, message);

      if (response && response.success) {
        setNotification({ message: 'プロンプトを入力欄に貼り付けました', type: NotificationType.SUCCESS });
      } else {
        const errorMessage = response?.error || '貼り付けに失敗しました';
        setNotification({ message: errorMessage, type: NotificationType.ERROR });
        console.error('Paste error:', response?.error);
      }
    } catch (error: any) {
      console.error('Error sending paste message:', error);
      let displayMessage = '貼り付け中にエラーが発生しました';
      if (error.message && error.message.includes('No matching message handler')) {
        displayMessage = 'ページが応答しません。リロードするか、対象ページか確認してください。';
      } else if (error.message) {
        displayMessage = `エラー: ${error.message}`;
      }
      setNotification({ message: displayMessage, type: NotificationType.ERROR });
    }
  }, []);

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
  };
}; 