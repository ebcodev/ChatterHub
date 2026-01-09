/**
 * React hook for system prompt logic
 */

import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import * as systemPromptQueries from '@/lib/data/queries/systemPrompt';

export interface SystemPromptInfo {
  prompt: string;
  source: 'chat' | 'folder' | 'none';
  sourceId?: string;
  inherited: boolean;
  path: string[];
}

/**
 * Hook to get effective system prompt for a chat group
 */
export function useSystemPrompt(chatGroupId: string | null): SystemPromptInfo {
  const [promptInfo, setPromptInfo] = useState<SystemPromptInfo>({
    prompt: '',
    source: 'none',
    inherited: false,
    path: [],
  });
  
  // Live query for chat group and its folder
  const chatGroup = useLiveQuery(
    () => chatGroupId ? db.chatGroups.get(chatGroupId) : Promise.resolve(undefined),
    [chatGroupId]
  );
  
  // Live query for all folders (to detect changes in hierarchy)
  const folders = useLiveQuery(() => db.folders.toArray());
  
  useEffect(() => {
    if (!chatGroupId || !chatGroup) {
      setPromptInfo({
        prompt: '',
        source: 'none',
        inherited: false,
        path: [],
      });
      return;
    }
    
    const fetchPromptInfo = async () => {
      const result = await systemPromptQueries.getEffectiveSystemPrompt(chatGroupId);
      const path = await systemPromptQueries.getSystemPromptPath(chatGroupId);
      
      setPromptInfo({
        prompt: result.prompt,
        source: result.source,
        sourceId: result.sourceId,
        inherited: result.source === 'folder',
        path,
      });
    };
    
    fetchPromptInfo();
  }, [chatGroupId, chatGroup, folders]);
  
  return promptInfo;
}

/**
 * Hook to get inherited system prompt from folder hierarchy
 */
export function useInheritedSystemPrompt(folderId: string | null) {
  const [prompt, setPrompt] = useState<string>('');
  const [sourceFolderId, setSourceFolderId] = useState<string | undefined>();
  
  // Live query for folders to detect changes
  const folders = useLiveQuery(() => db.folders.toArray());
  
  useEffect(() => {
    if (!folderId) {
      setPrompt('');
      setSourceFolderId(undefined);
      return;
    }
    
    const fetchInheritedPrompt = async () => {
      const result = await systemPromptQueries.getInheritedSystemPrompt(folderId);
      setPrompt(result.prompt);
      setSourceFolderId(result.sourceFolderId);
    };
    
    fetchInheritedPrompt();
  }, [folderId, folders]);
  
  return {
    prompt,
    sourceFolderId,
    hasInheritedPrompt: prompt.length > 0,
  };
}

/**
 * Hook to check which chat groups would be affected by a folder's system prompt
 */
export function useAffectedChatGroups(folderId: string | null) {
  const [affectedIds, setAffectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Live queries to detect changes
  const folders = useLiveQuery(() => db.folders.toArray());
  const chatGroups = useLiveQuery(() => db.chatGroups.toArray());
  
  useEffect(() => {
    if (!folderId) {
      setAffectedIds([]);
      return;
    }
    
    const fetchAffected = async () => {
      setLoading(true);
      try {
        const ids = await systemPromptQueries.getChatGroupsAffectedByFolderPrompt(folderId);
        setAffectedIds(ids);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAffected();
  }, [folderId, folders, chatGroups]);
  
  return {
    affectedIds,
    affectedCount: affectedIds.length,
    loading,
  };
}