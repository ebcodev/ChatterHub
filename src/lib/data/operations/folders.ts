/**
 * Folder operations for ChatterHub
 * Pure functions for all folder-related CRUD operations
 */

import { db, Folder } from '../../db';
import { v4 as uuidv4 } from 'uuid';

/**
 * Create a new folder
 */
export async function createFolder(
  name: string,
  parentId: string | null = null,
  order?: number
): Promise<string> {
  // Get max order if not specified
  if (order === undefined) {
    const folders = parentId === null
      ? await db.folders.toArray().then(f => f.filter(folder => folder.parentId === null))
      : await db.folders.where('parentId').equals(parentId).toArray();
    
    const chatGroups = parentId === null
      ? await db.chatGroups.toArray().then(g => g.filter(group => group.folderId === null))
      : await db.chatGroups.where('folderId').equals(parentId).toArray();
    
    const itemsInParent = [...folders, ...chatGroups];
    order = Math.max(0, ...itemsInParent.map(item => item.order || 0)) + 1;
  }

  const folderId = uuidv4();
  const newFolder: Folder = {
    id: folderId,
    name: name.trim(),
    parentId,
    order,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.folders.add(newFolder);
  return folderId;
}

/**
 * Update a folder's properties
 */
export async function updateFolder(
  folderId: string,
  updates: Partial<Pick<Folder, 'name' | 'color' | 'systemPrompt' | 'parentId' | 'order' | 'isPinned'>>
): Promise<void> {
  await db.folders.update(folderId, {
    ...updates,
    updatedAt: new Date(),
  });
}

/**
 * Toggle folder pin status
 */
export async function toggleFolderPin(folderId: string): Promise<void> {
  const folder = await db.folders.get(folderId);
  if (!folder) return;
  
  await updateFolder(folderId, { isPinned: !folder.isPinned });
}

/**
 * Set folder color
 */
export async function setFolderColor(folderId: string, color: string): Promise<void> {
  await updateFolder(folderId, { color });
}

/**
 * Set folder system prompt
 */
export async function setFolderSystemPrompt(folderId: string, systemPrompt: string | undefined): Promise<void> {
  await updateFolder(folderId, { systemPrompt });
}

/**
 * Rename a folder
 */
export async function renameFolder(folderId: string, newName: string): Promise<void> {
  await updateFolder(folderId, { name: newName.trim() });
}

/**
 * Delete a folder and optionally its contents
 */
export async function deleteFolder(
  folderId: string,
  deleteContents: boolean = true,
  onProgress?: (message: string) => void
): Promise<void> {
  const folder = await db.folders.get(folderId);
  if (!folder) return;

  if (deleteContents) {
    // Recursive deletion of all contents
    await deleteFolderContents(folderId, folder.name || 'folder', onProgress);
  } else {
    // Move contents to parent folder
    if (onProgress) onProgress('Moving contents to parent folder...');
    
    // Move all chat groups in this folder to parent
    await db.chatGroups.where('folderId').equals(folderId).modify({
      folderId: folder.parentId || null
    });
    
    // Move all child folders to parent
    await db.folders.where('parentId').equals(folderId).modify({
      parentId: folder.parentId || null
    });
    
    // Delete the folder itself
    if (onProgress) onProgress('Deleting folder...');
    await db.folders.delete(folderId);
  }
}

/**
 * Recursively delete folder contents including subfolders and all chat groups
 */
async function deleteFolderContents(
  folderId: string,
  folderName: string = 'folder',
  onProgress?: (message: string) => void
): Promise<void> {
  if (onProgress) onProgress(`Deleting ${folderName}...`);
  
  // Import chat operations to avoid circular dependency
  const { deleteChatGroups } = await import('./chats');
  
  // Collect all IDs to delete
  const folderIdsToDelete: string[] = [folderId];
  const chatGroupIdsToDelete: string[] = [];
  
  // Recursive function to collect all IDs
  const collectIds = async (fId: string) => {
    const childFolders = await db.folders.where('parentId').equals(fId).toArray();
    const chatGroups = await db.chatGroups.where('folderId').equals(fId).toArray();
    
    for (const group of chatGroups) {
      if (group.id) {
        chatGroupIdsToDelete.push(group.id);
      }
    }
    
    for (const child of childFolders) {
      if (child.id) {
        folderIdsToDelete.push(child.id);
        await collectIds(child.id);
      }
    }
  };
  
  await collectIds(folderId);
  
  // Delete all chat groups and their contents
  if (chatGroupIdsToDelete.length > 0) {
    if (onProgress) onProgress(`Deleting ${chatGroupIdsToDelete.length} chat groups...`);
    await deleteChatGroups(chatGroupIdsToDelete);
  }
  
  // Delete all folders
  if (onProgress) onProgress(`Deleting folders...`);
  await db.folders.bulkDelete(folderIdsToDelete);
}

/**
 * Move a folder to a new parent
 */
export async function moveFolderToParent(
  folderId: string,
  newParentId: string | null
): Promise<void> {
  // Check for circular reference
  if (newParentId) {
    let currentParent: string | null = newParentId;
    while (currentParent) {
      if (currentParent === folderId) {
        throw new Error('Cannot move folder into its own subfolder');
      }
      const parent: Folder | undefined = await db.folders.get(currentParent);
      currentParent = parent?.parentId ?? null;
    }
  }
  
  // Get max order in new parent
  const folders = newParentId === null
    ? await db.folders.toArray().then(f => f.filter(folder => folder.parentId === null))
    : await db.folders.where('parentId').equals(newParentId).toArray();
  
  const chatGroups = newParentId === null
    ? await db.chatGroups.toArray().then(g => g.filter(group => group.folderId === null))
    : await db.chatGroups.where('folderId').equals(newParentId).toArray();
  
  const itemsInNewParent = [...folders, ...chatGroups];
  const maxOrder = Math.max(0, ...itemsInNewParent.map(item => item.order || 0));
  
  await updateFolder(folderId, {
    parentId: newParentId,
    order: maxOrder + 1
  });
}

/**
 * Reorder folders within a parent
 */
export async function reorderFolders(
  _parentId: string | null,
  folderIds: string[]
): Promise<void> {
  await db.transaction('rw', db.folders, async () => {
    for (let i = 0; i < folderIds.length; i++) {
      await db.folders.update(folderIds[i], { order: i });
    }
  });
}

/**
 * Get all ancestor folders for breadcrumb navigation
 */
export async function getFolderAncestors(folderId: string): Promise<Folder[]> {
  const ancestors: Folder[] = [];
  let currentId: string | null = folderId;
  
  while (currentId) {
    const currentFolder: Folder | undefined = await db.folders.get(currentId);
    if (currentFolder) {
      ancestors.unshift(currentFolder);
      currentId = currentFolder.parentId;
    } else {
      break;
    }
  }
  
  return ancestors;
}

/**
 * Get folder by ID
 */
export async function getFolder(folderId: string): Promise<Folder | undefined> {
  return await db.folders.get(folderId);
}