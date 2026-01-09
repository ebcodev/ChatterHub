/**
 * System prompt query logic for ChatterHub
 * Handles traversing folder hierarchy to find effective system prompts
 */

import { db, Folder } from '../../db';

/**
 * Get the effective system prompt for a chat group
 * Traverses up the folder hierarchy to find the first defined prompt
 */
export async function getEffectiveSystemPrompt(chatGroupId: string): Promise<{
  prompt: string;
  source: 'chat' | 'folder' | 'none';
  sourceId?: string;
}> {
  // First check the chat group itself
  const chatGroup = await db.chatGroups.get(chatGroupId);
  if (!chatGroup) {
    return { prompt: '', source: 'none' };
  }
  
  if (chatGroup.systemPrompt) {
    return {
      prompt: chatGroup.systemPrompt,
      source: 'chat',
      sourceId: chatGroupId
    };
  }
  
  // Traverse up the folder hierarchy
  let currentFolderId = chatGroup.folderId;
  while (currentFolderId) {
    const folder: Folder | undefined = await db.folders.get(currentFolderId);
    if (!folder) break;
    
    if (folder.systemPrompt) {
      return {
        prompt: folder.systemPrompt,
        source: 'folder',
        sourceId: currentFolderId
      };
    }
    
    currentFolderId = folder.parentId;
  }
  
  return { prompt: '', source: 'none' };
}

/**
 * Get inherited system prompt from folder hierarchy
 * (Excludes chat-level prompt)
 */
export async function getInheritedSystemPrompt(folderId: string | null): Promise<{
  prompt: string;
  sourceFolderId?: string;
}> {
  if (!folderId) return { prompt: '' };
  
  let currentFolderId: string | null = folderId;
  while (currentFolderId) {
    const folder: Folder | undefined = await db.folders.get(currentFolderId);
    if (!folder) break;
    
    if (folder.systemPrompt) {
      return {
        prompt: folder.systemPrompt,
        sourceFolderId: currentFolderId
      };
    }
    
    currentFolderId = folder.parentId;
  }
  
  return { prompt: '' };
}

/**
 * Check if a chat group has its own system prompt or inherits one
 */
export async function hasSystemPrompt(chatGroupId: string): Promise<boolean> {
  const { prompt } = await getEffectiveSystemPrompt(chatGroupId);
  return prompt.length > 0;
}

/**
 * Get all chat groups that would be affected by a folder's system prompt
 */
export async function getChatGroupsAffectedByFolderPrompt(folderId: string): Promise<string[]> {
  const affectedIds: string[] = [];
  
  // Get all chat groups in this folder and subfolders
  const collectChatGroups = async (currentFolderId: string) => {
    // Get direct chat groups
    const chatGroups = await db.chatGroups
      .where('folderId')
      .equals(currentFolderId)
      .toArray();
    
    // Only include those without their own system prompt
    for (const group of chatGroups) {
      if (!group.systemPrompt && group.id) {
        affectedIds.push(group.id);
      }
    }
    
    // Recursively check subfolders
    const subfolders = await db.folders
      .where('parentId')
      .equals(currentFolderId)
      .toArray();
    
    for (const subfolder of subfolders) {
      // Only continue if subfolder doesn't have its own prompt
      if (!subfolder.systemPrompt && subfolder.id) {
        await collectChatGroups(subfolder.id);
      }
    }
  };
  
  await collectChatGroups(folderId);
  return affectedIds;
}

/**
 * Get the folder path for a system prompt source
 */
export async function getSystemPromptPath(chatGroupId: string): Promise<string[]> {
  const { source, sourceId } = await getEffectiveSystemPrompt(chatGroupId);
  
  if (source === 'none' || !sourceId) return [];
  
  const path: string[] = [];
  
  if (source === 'chat') {
    const chatGroup = await db.chatGroups.get(sourceId);
    if (chatGroup) {
      path.push(chatGroup.title);
    }
  } else if (source === 'folder') {
    let currentId: string | null = sourceId;
    while (currentId) {
      const folder: Folder | undefined = await db.folders.get(currentId);
      if (!folder) break;
      path.unshift(folder.name);
      currentId = folder.parentId;
    }
  }
  
  return path;
}