import { useState, useEffect, useCallback } from 'react';
<<<<<<< HEAD:src/hooks/usePromptManagement.ts
import { Prompt, PromptInput } from '../types';
import { NotificationType } from '../types/ui';
import { promptService } from '../services/promptService';
import { filterPrompts } from '../utils/promptUtils';
import { NOTIFICATION_TIMEOUT_MS } from '../constants';
import { PasteMessage, PasteResponse } from '../types/messaging';
=======
import { Prompt, PromptInput } from '../core/types';
import { NotificationType } from '../core/types/ui';
import { promptService } from '../features/prompt/promptService';
import { filterPrompts } from './utils/promptUtils';
import { NOTIFICATION_TIMEOUT_MS } from '../core/constants/app';
import { PasteMessage, PasteResponse } from '../core/types/messaging';
>>>>>>> feature/ai-document:src/shared/usePromptManagement.ts
import { useTranslation } from 'react-i18next';

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

  const handlePastePrompt = useCallback(async (text: string) => {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs.length === 0) {
        setNotification({ message: t('error_no_active_tab'), type: NotificationType.ERROR });
        return;
      }
      const activeTab = tabs[0];
      if (!activeTab.id) {
        setNotification({ message: t('error_no_active_tab_id'), type: NotificationType.ERROR });
        return;
      }

      const message: PasteMessage = { type: 'PASTE_PROMPT', text };
      const response: PasteResponse = await chrome.tabs.sendMessage(activeTab.id, message);

      if (response && response.success) {
        setNotification({ message: t('success_paste'), type: NotificationType.SUCCESS });
      } else {
        const errorMessage = response?.error || t('error_paste');
        setNotification({ message: errorMessage, type: NotificationType.ERROR });
        console.error('Paste error:', response?.error);
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
  };
}; 