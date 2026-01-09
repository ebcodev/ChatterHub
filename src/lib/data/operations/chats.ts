/**
 * Chat operations for ChatterHub
 * Pure functions for all chat and chat group CRUD operations
 */

import { db, ChatGroup, Chat } from '../../db';
import { v4 as uuidv4 } from 'uuid';

/**
 * Create a new chat group
 */
export async function createChatGroup(
  folderId: string | null = null,
  title: string = 'New Chat',
  layout: 'vertical' | 'horizontal' | '2x2' | '2x3' | '3x3' | 'freeform' = 'horizontal',
  isTemporary: boolean = false
): Promise<string> {
  // Get min order for positioning at the top
  const itemsInFolder = folderId === null 
    ? await db.chatGroups.toArray().then(groups => groups.filter(g => g.folderId === null))
    : await db.chatGroups.where('folderId').equals(folderId).toArray();
  const minOrder = Math.min(0, ...itemsInFolder.map(c => c.order || 0));
  
  const id = uuidv4();
  const newChatGroup: ChatGroup = {
    id,
    title,
    layout,
    folderId,
    order: minOrder - 1,
    isTemporary,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...(isTemporary ? { lastActivityAt: new Date() } : {})
  };
  
  await db.chatGroups.add(newChatGroup);
  
  // Create initial chat
  await createChat(id, 'gpt-4o-mini', 0);
  
  return id;
}

/**
 * Create a new chat within a chat group
 */
export async function createChat(
  chatGroupId: string,
  model: string = 'gpt-4o-mini',
  position: number = 0
): Promise<string> {
  const chatId = uuidv4();
  const newChat: Chat = {
    id: chatId,
    chatGroupId,
    model,
    position,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  await db.chats.add(newChat);
  return chatId;
}

/**
 * Update chat group properties
 */
export async function updateChatGroup(
  chatGroupId: string,
  updates: Partial<Pick<ChatGroup, 'title' | 'layout' | 'systemPrompt' | 'isPinned' | 'folderId' | 'order'>>
): Promise<void> {
  const updateData: any = {
    ...updates,
    updatedAt: new Date()
  };
  
  // Check if it's a temporary chat to update lastActivityAt
  const chatGroup = await db.chatGroups.get(chatGroupId);
  if (chatGroup?.isTemporary) {
    updateData.lastActivityAt = new Date();
  }
  
  await db.chatGroups.update(chatGroupId, updateData);
}

/**
 * Update chat properties
 */
export async function updateChat(
  chatId: string,
  updates: Partial<Pick<Chat, 'model' | 'position' | 'isActive' | 'x' | 'y' | 'width' | 'height' | 'zIndex'>>
): Promise<void> {
  await db.chats.update(chatId, {
    ...updates,
    updatedAt: new Date()
  });
  
  // Update parent chat group's activity
  const chat = await db.chats.get(chatId);
  if (chat?.chatGroupId) {
    await updateLastActivity(chat.chatGroupId);
  }
}

/**
 * Update last activity for a chat group
 */
export async function updateLastActivity(chatGroupId: string): Promise<void> {
  await db.chatGroups.update(chatGroupId, {
    lastActivityAt: new Date(),
    updatedAt: new Date()
  });
}

/**
 * Toggle chat group pin status
 */
export async function toggleChatGroupPin(chatGroupId: string): Promise<boolean> {
  const chatGroup = await db.chatGroups.get(chatGroupId);
  if (!chatGroup) return false;
  
  const newPinStatus = !chatGroup.isPinned;
  await updateChatGroup(chatGroupId, { isPinned: newPinStatus });
  return newPinStatus;
}

/**
 * Delete a single chat with all its messages
 */
export async function deleteChat(chatId: string): Promise<void> {
  // Delete all messages for this chat
  await db.messages.where('chatId').equals(chatId).delete();
  
  // Delete the chat itself
  await db.chats.delete(chatId);
}

/**
 * Delete a chat group with all its chats, messages, and image attachments
 */
export async function deleteChatGroup(chatGroupId: string): Promise<void> {
  await db.transaction('rw', db.chats, db.messages, db.chatGroups, async () => {
    // Get all chats in this group
    const chats = await db.chats.where('chatGroupId').equals(chatGroupId).toArray();
    
    // Delete all messages for all chats in this group
    for (const chat of chats) {
      if (chat.id) {
        await db.messages.where('chatId').equals(chat.id).delete();
      }
    }
    
    // Delete all chats in this group
    await db.chats.where('chatGroupId').equals(chatGroupId).delete();
    
    // Delete the chat group itself
    await db.chatGroups.delete(chatGroupId);
  });
  
  // Delete image attachments separately (might not be in same transaction scope)
  try {
    await db.imageAttachments.where('chatGroupId').equals(chatGroupId).delete();
  } catch (e) {
    // Table might not exist or no attachments, continue
    console.log('No image attachments to delete or table does not exist');
  }
}

/**
 * Delete multiple chat groups (useful for folder deletion)
 */
export async function deleteChatGroups(chatGroupIds: string[]): Promise<void> {
  if (chatGroupIds.length === 0) return;
  
  await db.transaction('rw', db.chats, db.messages, db.chatGroups, async () => {
    // Delete all messages for all chat groups
    for (const chatGroupId of chatGroupIds) {
      await db.messages.where('chatGroupId').equals(chatGroupId).delete();
    }
    
    // Delete all chats
    for (const chatGroupId of chatGroupIds) {
      await db.chats.where('chatGroupId').equals(chatGroupId).delete();
    }
    
    // Delete all chat groups
    await db.chatGroups.bulkDelete(chatGroupIds);
  });
  
  // Delete image attachments for all groups
  try {
    for (const chatGroupId of chatGroupIds) {
      await db.imageAttachments.where('chatGroupId').equals(chatGroupId).delete();
    }
  } catch (e) {
    console.log('No image attachments to delete or table does not exist');
  }
}

export interface DuplicateProgress {
  step: 'starting' | 'chatGroup' | 'chats' | 'messages' | 'attachments' | 'completed';
  currentItem: number;
  totalItems: number;
  messagesCopied: number;
  totalMessages: number;
  attachmentsCopied: number;
  totalAttachments: number;
  chatGroupTitle: string;
}

/**
 * Duplicate a chat group with all its chats, messages, and attachments
 */
export async function duplicateChatGroup(
  chatGroupId: string,
  onProgress?: (progress: DuplicateProgress) => void
): Promise<string> {
  const originalGroup = await db.chatGroups.get(chatGroupId);
  if (!originalGroup) throw new Error('Chat group not found');

  // Count total items for progress tracking
  const originalChats = await db.chats.where('chatGroupId').equals(chatGroupId).toArray();
  const allMessages = await db.messages.where('chatGroupId').equals(chatGroupId).toArray();
  let allAttachments: any[] = [];

  // Check if imageAttachments table exists and get attachments
  try {
    allAttachments = await db.imageAttachments.where('chatGroupId').equals(chatGroupId).toArray();
  } catch (e) {
    // Table might not exist, continue without attachments
    allAttachments = [];
  }

  const progress: DuplicateProgress = {
    step: 'starting',
    currentItem: 0,
    totalItems: allMessages.length,
    messagesCopied: 0,
    totalMessages: allMessages.length,
    attachmentsCopied: 0,
    totalAttachments: allAttachments.length,
    chatGroupTitle: originalGroup.title
  };

  onProgress?.(progress);

  // Get min order for positioning at the top
  const itemsInFolder = originalGroup.folderId === null
    ? await db.chatGroups.toArray().then(groups => groups.filter(g => g.folderId === null))
    : await db.chatGroups.where('folderId').equals(originalGroup.folderId).toArray();
  const minOrder = Math.min(0, ...itemsInFolder.map(c => c.order || 0));

  // Create new chat group
  progress.step = 'chatGroup';
  onProgress?.(progress);

  const newGroupId = uuidv4();
  const newChatGroup = {
    ...originalGroup,
    id: newGroupId,
    title: `${originalGroup.title} (Copy)`,
    order: minOrder - 1,
    draftInput: '', // Clear draft input for the copy
    createdAt: originalGroup.createdAt, // Preserve original timestamp
    updatedAt: new Date(),
  };
  await db.chatGroups.add(newChatGroup);

  // Create mappings for ID translation
  const chatIdMap = new Map<string, string>();
  const messageIdMap = new Map<string, string>();

  // Duplicate all chats
  progress.step = 'chats';
  onProgress?.(progress);

  for (const chat of originalChats) {
    const newChatId = uuidv4();
    if (chat.id) {
      chatIdMap.set(chat.id, newChatId);
    }

    const newChat = {
      ...chat,
      id: newChatId,
      chatGroupId: newGroupId,
      createdAt: chat.createdAt, // Preserve original timestamp
      updatedAt: new Date(),
    };
    await db.chats.add(newChat);
  }

  // Duplicate all messages
  progress.step = 'messages';
  onProgress?.(progress);

  for (let i = 0; i < allMessages.length; i++) {
    const message = allMessages[i];
    if (!message) continue;

    const newMessageId = uuidv4();

    if (message.id) {
      messageIdMap.set(message.id, newMessageId);
    }

    const newChatId = chatIdMap.get(message.chatId);
    if (!newChatId) continue; // Skip if chat wasn't found

    const newMessage = {
      ...message,
      id: newMessageId,
      chatId: newChatId,
      chatGroupId: newGroupId,
      // Map parent message ID if it exists
      parentMessageId: message.parentMessageId ? messageIdMap.get(message.parentMessageId) : undefined,
      // Map sibling message IDs if they exist
      siblingMessageIds: message.siblingMessageIds?.map(id => messageIdMap.get(id)).filter(Boolean) as string[],
      createdAt: message.createdAt, // Preserve original timestamp
    };
    await db.messages.add(newMessage);

    progress.currentItem = i + 1;
    progress.messagesCopied = i + 1;
    onProgress?.(progress);

    // Add small delay every 10 messages to prevent UI blocking
    if (i % 10 === 0) {
      await new Promise(resolve => setTimeout(resolve, 1));
    }
  }

  // Duplicate image attachments if they exist
  if (allAttachments.length > 0) {
    progress.step = 'attachments';
    onProgress?.(progress);

    for (let i = 0; i < allAttachments.length; i++) {
      const attachment = allAttachments[i];
      const newMessageId = messageIdMap.get(attachment.messageId);

      if (newMessageId) {
        const newAttachment = {
          ...attachment,
          id: uuidv4(),
          messageId: newMessageId,
          chatGroupId: newGroupId,
          createdAt: attachment.createdAt, // Preserve original timestamp
        };

        try {
          await db.imageAttachments.add(newAttachment);
        } catch (e) {
          // Skip if table doesn't exist or attachment can't be added
          console.log('Could not duplicate attachment:', e);
        }
      }

      progress.attachmentsCopied = i + 1;
      onProgress?.(progress);
    }
  }

  progress.step = 'completed';
  onProgress?.(progress);

  return newGroupId;
}

/**
 * Move chat group to a different folder
 */
export async function moveChatGroupToFolder(
  chatGroupId: string,
  targetFolderId: string | null
): Promise<void> {
  // Get max order in target folder
  const itemsInTarget = targetFolderId === null
    ? await db.chatGroups.toArray().then(groups => groups.filter(g => g.folderId === null))
    : await db.chatGroups.where('folderId').equals(targetFolderId).toArray();
  const maxOrder = Math.max(0, ...itemsInTarget.map(c => c.order || 0));
  
  await updateChatGroup(chatGroupId, {
    folderId: targetFolderId,
    order: maxOrder + 1
  });
}

/**
 * Reorder chats within a chat group
 */
export async function reorderChats(chatGroupId: string, chatIds: string[]): Promise<void> {
  await db.transaction('rw', db.chats, async () => {
    for (let i = 0; i < chatIds.length; i++) {
      await db.chats.update(chatIds[i], { position: i });
    }
  });
}

/**
 * Generate a smart title from the first message
 */
export function generateSmartTitle(firstMessage: string, maxLength: number = 50): string {
  // Take first line or up to maxLength characters
  const firstLine = firstMessage.split('\n')[0];
  if (!firstLine) {
    return firstMessage.slice(0, maxLength);
  }
  if (firstLine.length <= maxLength) {
    return firstLine;
  }
  return firstLine.slice(0, maxLength - 3) + '...';
}

/**
 * Update chat group title if it's still default
 */
export async function updateTitleIfDefault(
  chatGroupId: string,
  newTitle: string
): Promise<void> {
  const chatGroup = await db.chatGroups.get(chatGroupId);
  if (chatGroup && (chatGroup.title === 'New Chat' || chatGroup.title === 'Incognito Chat')) {
    await updateChatGroup(chatGroupId, {
      title: generateSmartTitle(newTitle)
    });
  }
}

/**
 * Cleanup temporary/incognito chats older than specified minutes
 */
export async function cleanupTemporaryChats(olderThanMinutes: number = 5): Promise<void> {
  const allChats = await db.chatGroups.toArray();
  const tempChats = allChats.filter(c => c.isTemporary === true);
  const cutoffTime = new Date(Date.now() - olderThanMinutes * 60 * 1000);
  
  for (const chat of tempChats) {
    // Delete if last activity is older than cutoff
    if (chat.lastActivityAt && chat.lastActivityAt < cutoffTime) {
      await deleteChatGroup(chat.id!);
    }
  }
}

/**
 * Get chat group with its chats
 */
export async function getChatGroupWithChats(chatGroupId: string) {
  const chatGroup = await db.chatGroups.get(chatGroupId);
  if (!chatGroup) return null;
  
  const chats = await db.chats.where('chatGroupId').equals(chatGroupId).toArray();
  
  return {
    ...chatGroup,
    chats: chats.sort((a, b) => a.position - b.position)
  };
}

/**
 * Save draft input for a chat group
 */
export async function saveDraft(chatGroupId: string, draftText: string): Promise<void> {
  await db.chatGroups.update(chatGroupId, {
    draftInput: draftText,
    updatedAt: new Date()
  });
}

/**
 * Clear draft input for a chat group
 */
export async function clearDraft(chatGroupId: string): Promise<void> {
  await db.chatGroups.update(chatGroupId, {
    draftInput: '',
    updatedAt: new Date()
  });
}

/**
 * Get draft input for a chat group
 */
export async function getDraft(chatGroupId: string): Promise<string | undefined> {
  const chatGroup = await db.chatGroups.get(chatGroupId);
  return chatGroup?.draftInput;
}