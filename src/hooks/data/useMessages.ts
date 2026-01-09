/**
 * React hook for message operations with reactivity
 */

import React, { useState, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, Message } from '@/lib/db';
import * as messageOps from '@/lib/data/operations/messages';
import toast from 'react-hot-toast';

export interface UseMessagesOptions {
  chatId?: string;
  chatGroupId?: string;
  starredOnly?: boolean;
}

export function useMessages(options: UseMessagesOptions = {}) {
  const { chatId, chatGroupId, starredOnly = false } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Live query for messages
  const messages = useLiveQuery(
    () => {
      if (starredOnly) {
        // Filter starred messages after fetching
        return db.messages.toArray().then(msgs => msgs.filter(m => m.starred === true));
      }
      
      if (chatId) {
        return db.messages.where('chatId').equals(chatId).toArray();
      }
      
      if (chatGroupId) {
        return db.messages.where('chatGroupId').equals(chatGroupId).toArray();
      }
      
      return db.messages.toArray();
    },
    [chatId, chatGroupId, starredOnly]
  );
  
  // Sort by creation time
  const sortedMessages = messages?.sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  
  // Create message
  const createMessage = useCallback(async (
    targetChatId: string,
    targetChatGroupId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    model?: string
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const id = await messageOps.createMessage(
        targetChatId,
        targetChatGroupId,
        role,
        content,
        model
      );
      return id;
    } catch (err) {
      const error = err as Error;
      setError(error);
      console.error('Failed to create message:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Update message content
  const updateMessage = useCallback(async (id: string, content: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await messageOps.updateMessage(id, content);
      toast.success('Message updated');
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error('Failed to update message');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Delete message
  const deleteMessage = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await messageOps.deleteMessage(id);
      toast.success('Message deleted');
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error('Failed to delete message');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Toggle star
  const toggleStar = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const isStarred = await messageOps.toggleMessageStar(id);
      toast.success(isStarred ? 'Message starred' : 'Message unstarred');
      return isStarred;
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error('Failed to toggle star');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Clear all messages in a chat
  const clearChatMessages = useCallback(async (targetChatId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await messageOps.clearChatMessages(targetChatId);
      toast.success('Messages cleared');
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error('Failed to clear messages');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);
  
  return {
    messages: sortedMessages || [],
    loading,
    error,
    createMessage,
    updateMessage,
    deleteMessage,
    toggleStar,
    clearChatMessages,
  };
}

/**
 * Hook for starred messages
 */
export function useStarredMessages() {
  const messages = useLiveQuery(
    () => db.messages.toArray().then(msgs => msgs.filter(m => m.starred === true)),
    []
  );
  
  const unstarMessage = useCallback(async (id: string) => {
    try {
      await messageOps.unstarMessage(id);
      toast.success('Message unstarred');
    } catch (err) {
      toast.error('Failed to unstar message');
      throw err;
    }
  }, []);
  
  return {
    messages: messages || [],
    unstarMessage,
  };
}

/**
 * Hook for chat conversation with system prompt
 */
export function useChatConversation(chatId: string | null, systemPrompt?: string) {
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState<Array<{ role: string; content: string }>>([]);
  
  // Live query for messages
  const messages = useLiveQuery(
    () => chatId ? db.messages.where('chatId').equals(chatId).toArray() : [],
    [chatId]
  );
  
  // Build conversation with system prompt
  const buildConversation = useCallback(() => {
    if (!messages) return [];
    
    const sortedMessages = messages.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    const conv: Array<{ role: string; content: string }> = [];
    
    // Add system prompt if provided
    if (systemPrompt) {
      conv.push({ role: 'system', content: systemPrompt });
    }
    
    // Add all messages
    conv.push(...sortedMessages.map(m => ({
      role: m.role,
      content: m.content
    })));
    
    return conv;
  }, [messages, systemPrompt]);
  
  // Update conversation when messages or system prompt changes
  React.useEffect(() => {
    setConversation(buildConversation());
  }, [buildConversation]);
  
  return {
    conversation,
    messages: messages || [],
    loading,
  };
}