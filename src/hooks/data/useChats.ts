/**
 * React hook for chat operations with reactivity
 */

import { useState, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, ChatGroup, Chat } from '@/lib/db';
import * as chatOps from '@/lib/data/operations/chats';
import toast from 'react-hot-toast';

export interface UseChatOptions {
  folderId?: string | null;
  includePinned?: boolean;
}

export function useChats(options: UseChatOptions = {}) {
  const { folderId, includePinned = true } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Live query for chat groups
  const chatGroups = useLiveQuery(
    () => {
      if (folderId === undefined) {
        return db.chatGroups.toArray();
      } else if (folderId === null) {
        // For null folderId, filter after fetching
        return db.chatGroups.toArray().then(groups => 
          groups.filter(g => g.folderId === null)
        );
      } else {
        // Query for items with specific folderId
        return db.chatGroups.where('folderId').equals(folderId).toArray();
      }
    },
    [folderId]
  );
  
  // Filter and sort
  const sortedChatGroups = chatGroups?.sort((a, b) => {
    // Pinned items first
    if (includePinned) {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
    }
    // Then by order
    return (a.order || 0) - (b.order || 0);
  });
  
  // Create chat group
  const createChatGroup = useCallback(async (
    title?: string,
    targetFolderId: string | null = folderId || null,
    layout?: 'vertical' | 'horizontal' | '2x2' | '2x3' | '3x3' | 'freeform'
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const id = await chatOps.createChatGroup(targetFolderId, title, layout);
      toast.success('Chat created');
      return id;
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error('Failed to create chat');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [folderId]);
  
  // Update chat group
  const updateChatGroup = useCallback(async (
    id: string,
    updates: Parameters<typeof chatOps.updateChatGroup>[1]
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      await chatOps.updateChatGroup(id, updates);
      toast.success('Chat updated');
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error('Failed to update chat');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Delete chat group
  const deleteChatGroup = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await chatOps.deleteChatGroup(id);
      toast.success('Chat deleted');
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error('Failed to delete chat');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Duplicate chat group
  const duplicateChatGroup = useCallback(async (
    id: string,
    onProgress?: (progress: chatOps.DuplicateProgress) => void
  ) => {
    setLoading(true);
    setError(null);

    try {
      const newId = await chatOps.duplicateChatGroup(id, onProgress);
      toast.success('Chat duplicated');
      return newId;
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error('Failed to duplicate chat');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Toggle pin
  const togglePin = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const isPinned = await chatOps.toggleChatGroupPin(id);
      toast.success(isPinned ? 'Chat pinned' : 'Chat unpinned');
      return isPinned;
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error('Failed to toggle pin');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Move to folder
  const moveToFolder = useCallback(async (id: string, targetFolderId: string | null) => {
    setLoading(true);
    setError(null);
    
    try {
      await chatOps.moveChatGroupToFolder(id, targetFolderId);
      toast.success('Chat moved');
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error('Failed to move chat');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Update title if default
  const updateTitleIfDefault = useCallback(async (id: string, newTitle: string) => {
    try {
      await chatOps.updateTitleIfDefault(id, newTitle);
    } catch (err) {
      console.error('Failed to update title:', err);
    }
  }, []);
  
  return {
    chatGroups: sortedChatGroups || [],
    loading,
    error,
    createChatGroup,
    updateChatGroup,
    deleteChatGroup,
    duplicateChatGroup,
    togglePin,
    moveToFolder,
    updateTitleIfDefault,
  };
}

/**
 * Hook for managing individual chats within a chat group
 */
export function useChatGroupChats(chatGroupId: string | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Live query for chats in the group
  const chats = useLiveQuery(
    () => chatGroupId ? db.chats.where('chatGroupId').equals(chatGroupId).toArray() : [],
    [chatGroupId]
  );
  
  const sortedChats = chats?.sort((a, b) => a.position - b.position);
  
  // Create chat
  const createChat = useCallback(async (model?: string, position?: number) => {
    if (!chatGroupId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const id = await chatOps.createChat(chatGroupId, model, position);
      return id;
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error('Failed to create subchat');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [chatGroupId]);
  
  // Update chat
  const updateChat = useCallback(async (
    chatId: string,
    updates: Parameters<typeof chatOps.updateChat>[1]
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      await chatOps.updateChat(chatId, updates);
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error('Failed to update subchat');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Delete chat
  const deleteChat = useCallback(async (chatId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await chatOps.deleteChat(chatId);
      toast.success('Subchat deleted');
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error('Failed to delete subchat');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Reorder chats
  const reorderChats = useCallback(async (chatIds: string[]) => {
    if (!chatGroupId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await chatOps.reorderChats(chatGroupId, chatIds);
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error('Failed to reorder subchats');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [chatGroupId]);
  
  return {
    chats: sortedChats || [],
    loading,
    error,
    createChat,
    updateChat,
    deleteChat,
    reorderChats,
  };
}