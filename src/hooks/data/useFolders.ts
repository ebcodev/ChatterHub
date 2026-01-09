/**
 * React hook for folder operations with reactivity
 */

import { useState, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, Folder } from '@/lib/db';
import * as folderOps from '@/lib/data/operations/folders';
import toast from 'react-hot-toast';

export interface UseFoldersOptions {
  parentId?: string | null;
}

export function useFolders(options: UseFoldersOptions = {}) {
  const { parentId } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [deleteProgress, setDeleteProgress] = useState<string>('');
  
  // Live query for folders
  const folders = useLiveQuery(
    () => {
      if (parentId === undefined) {
        return db.folders.toArray();
      } else if (parentId === null) {
        // For null parentId, filter after fetching
        return db.folders.toArray().then(folders => 
          folders.filter(f => f.parentId === null)
        );
      } else {
        // Query for items with specific parentId
        return db.folders.where('parentId').equals(parentId).toArray();
      }
    },
    [parentId]
  );
  
  // Sort by order
  const sortedFolders = folders?.sort((a, b) => (a.order || 0) - (b.order || 0));
  
  // Create folder
  const createFolder = useCallback(async (
    name: string,
    targetParentId: string | null = parentId || null
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const id = await folderOps.createFolder(name, targetParentId);
      toast.success('Folder created');
      return id;
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error('Failed to create folder');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [parentId]);
  
  // Update folder
  const updateFolder = useCallback(async (
    id: string,
    updates: Parameters<typeof folderOps.updateFolder>[1]
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      await folderOps.updateFolder(id, updates);
      toast.success('Folder updated');
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error('Failed to update folder');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Rename folder
  const renameFolder = useCallback(async (id: string, newName: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await folderOps.renameFolder(id, newName);
      toast.success('Folder renamed');
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error('Failed to rename folder');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Set folder color
  const setFolderColor = useCallback(async (id: string, color: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await folderOps.setFolderColor(id, color);
      toast.success('Color updated');
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error('Failed to update color');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Set folder system prompt
  const setFolderSystemPrompt = useCallback(async (id: string, systemPrompt: string | undefined) => {
    setLoading(true);
    setError(null);
    
    try {
      await folderOps.setFolderSystemPrompt(id, systemPrompt);
      toast.success('System prompt updated');
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error('Failed to update system prompt');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Toggle folder pin status
  const togglePin = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await folderOps.toggleFolderPin(id);
      const folder = await folderOps.getFolder(id);
      if (folder?.isPinned) {
        toast.success('Folder pinned');
      } else {
        toast.success('Folder unpinned');
      }
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error('Failed to toggle pin');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Delete folder
  const deleteFolder = useCallback(async (
    id: string,
    deleteContents: boolean = true,
    onProgress?: (message: string) => void
  ) => {
    setLoading(true);
    setError(null);
    setDeleteProgress('');
    
    const progressCallback = (message: string) => {
      setDeleteProgress(message);
      onProgress?.(message);
    };
    
    try {
      await folderOps.deleteFolder(id, deleteContents, progressCallback);
      toast.success('Folder deleted');
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error('Failed to delete folder');
      throw error;
    } finally {
      setLoading(false);
      setDeleteProgress('');
    }
  }, []);
  
  // Move folder to new parent
  const moveToParent = useCallback(async (id: string, newParentId: string | null) => {
    setLoading(true);
    setError(null);
    
    try {
      await folderOps.moveFolderToParent(id, newParentId);
      toast.success('Folder moved');
    } catch (err) {
      const error = err as Error;
      setError(error);
      if (error.message.includes('circular')) {
        toast.error('Cannot move folder into its own subfolder');
      } else {
        toast.error('Failed to move folder');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Reorder folders
  const reorderFolders = useCallback(async (folderIds: string[]) => {
    setLoading(true);
    setError(null);
    
    try {
      await folderOps.reorderFolders(parentId || null, folderIds);
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error('Failed to reorder folders');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [parentId]);
  
  // Get folder ancestors (for breadcrumbs)
  const getFolderAncestors = useCallback(async (id: string) => {
    try {
      return await folderOps.getFolderAncestors(id);
    } catch (err) {
      console.error('Failed to get folder ancestors:', err);
      return [];
    }
  }, []);
  
  return {
    folders: sortedFolders || [],
    loading,
    error,
    deleteProgress,
    createFolder,
    updateFolder,
    renameFolder,
    setFolderColor,
    setFolderSystemPrompt,
    togglePin,
    deleteFolder,
    moveToParent,
    reorderFolders,
    getFolderAncestors,
  };
}

/**
 * Hook for a single folder
 */
export function useFolder(folderId: string | null) {
  const folder = useLiveQuery(
    () => folderId ? db.folders.get(folderId) : Promise.resolve(undefined),
    [folderId]
  );
  
  return folder;
}