/**
 * Central export for all data operations
 */

// Re-export all folder operations
export * from './folders';

// Re-export all chat operations
export * from './chats';

// Re-export all message operations
export * from './messages';

// Re-export all model parameter operations
export * from './modelParameters';

// Re-export all image operations
export * from './images';

// Additional utility operations that don't fit in other categories
import { db } from '../../db';

/**
 * Delete all chat data (used in settings)
 */
export async function deleteAllChatData(onProgress?: (message: string) => void): Promise<void> {
  if (onProgress) onProgress('Starting deletion process...');
  
  await db.transaction('rw', db.folders, db.chatGroups, db.chats, db.messages, async () => {
    if (onProgress) onProgress('Deleting messages...');
    await db.messages.clear();
    
    if (onProgress) onProgress('Deleting chats...');
    await db.chats.clear();
    
    if (onProgress) onProgress('Deleting chat groups...');
    await db.chatGroups.clear();
    
    if (onProgress) onProgress('Deleting folders...');
    await db.folders.clear();
  });
  
  // Delete image attachments separately
  try {
    if (onProgress) onProgress('Deleting image attachments...');
    await db.imageAttachments.clear();
  } catch (e) {
    console.log('No image attachments to delete or table does not exist');
  }
  
  // Delete model parameters
  try {
    if (onProgress) onProgress('Deleting model parameters...');
    await db.modelParameters.clear();
  } catch (e) {
    console.log('No model parameters to delete or table does not exist');
  }
  
  if (onProgress) onProgress('Complete!');
}

/**
 * Get database size information
 */
export async function getDatabaseSize(): Promise<{
  folders: number;
  chatGroups: number;
  chats: number;
  messages: number;
  imageAttachments: number;
  modelParameters: number;
  total: number;
}> {
  const [folders, chatGroups, chats, messages] = await Promise.all([
    db.folders.count(),
    db.chatGroups.count(),
    db.chats.count(),
    db.messages.count(),
  ]);
  
  let imageAttachments = 0;
  let modelParameters = 0;
  
  try {
    imageAttachments = await db.imageAttachments.count();
  } catch (e) {
    // Table might not exist
  }
  
  try {
    modelParameters = await db.modelParameters.count();
  } catch (e) {
    // Table might not exist
  }
  
  return {
    folders,
    chatGroups,
    chats,
    messages,
    imageAttachments,
    modelParameters,
    total: folders + chatGroups + chats + messages + imageAttachments + modelParameters,
  };
}