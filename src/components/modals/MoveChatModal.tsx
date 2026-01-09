'use client';

import { useState, useMemo } from 'react';
import { X, FolderTree, Folder, FolderOpen, Check } from 'lucide-react';
import { ChatGroup, Folder as FolderType } from '@/lib/db';
import { Modal } from '../ui/modal';
import { moveChatGroupToFolder } from '@/lib/data/operations/chats';

interface MoveChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatGroup: ChatGroup | null;
  folders: FolderType[];
  onMove?: () => void;
}

interface FolderTreeItem {
  id: string | null;
  name: string;
  depth: number;
  parentId: string | null;
}

export default function MoveChatModal({ 
  isOpen, 
  onClose, 
  chatGroup, 
  folders,
  onMove 
}: MoveChatModalProps) {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [isMoving, setIsMoving] = useState(false);

  // Build hierarchical folder tree
  const folderTree = useMemo(() => {
    const tree: FolderTreeItem[] = [];
    
    // Add root option first
    tree.push({
      id: null,
      name: 'Root (No Folder)',
      depth: 0,
      parentId: null
    });

    // Recursive function to add folders with proper depth
    const addFoldersToTree = (parentId: string | null = null, depth: number = 0) => {
      const childFolders = folders.filter(f => f.parentId === parentId);
      
      childFolders.forEach(folder => {
        tree.push({
          id: folder.id!,
          name: folder.name,
          depth: depth + 1,
          parentId: folder.parentId
        });
        
        // Recursively add subfolders
        if (folder.id) {
          addFoldersToTree(folder.id, depth + 1);
        }
      });
    };

    addFoldersToTree();
    return tree;
  }, [folders]);

  const handleMove = async () => {
    if (!chatGroup || selectedFolder === undefined) return;
    
    // Don't move to the same folder
    if (selectedFolder === chatGroup.folderId) {
      onClose();
      return;
    }

    setIsMoving(true);
    try {
      await moveChatGroupToFolder(chatGroup.id!, selectedFolder);
      onMove?.();
      onClose();
    } catch (error) {
      console.error('Failed to move chat:', error);
    } finally {
      setIsMoving(false);
    }
  };

  const getFolderColorClasses = (folder: FolderType | undefined) => {
    if (!folder?.color) return {
      icon: 'text-gray-600 dark:text-gray-400',
      bg: 'hover:bg-gray-100 dark:hover:bg-gray-800',
      text: 'text-gray-700 dark:text-gray-300',
    };

    const colorMap: Record<string, { icon: string; bg: string; text: string }> = {
      red: {
        icon: 'text-red-600 dark:text-red-400',
        bg: 'hover:bg-red-50 dark:hover:bg-red-900/20',
        text: 'text-red-700 dark:text-red-300',
      },
      orange: {
        icon: 'text-orange-600 dark:text-orange-400',
        bg: 'hover:bg-orange-50 dark:hover:bg-orange-900/20',
        text: 'text-orange-700 dark:text-orange-300',
      },
      yellow: {
        icon: 'text-yellow-600 dark:text-yellow-400',
        bg: 'hover:bg-yellow-50 dark:hover:bg-yellow-900/20',
        text: 'text-yellow-700 dark:text-yellow-300',
      },
      green: {
        icon: 'text-green-600 dark:text-green-400',
        bg: 'hover:bg-green-50 dark:hover:bg-green-900/20',
        text: 'text-green-700 dark:text-green-300',
      },
      blue: {
        icon: 'text-blue-600 dark:text-blue-400',
        bg: 'hover:bg-blue-50 dark:hover:bg-blue-900/20',
        text: 'text-blue-700 dark:text-blue-300',
      },
      indigo: {
        icon: 'text-indigo-600 dark:text-indigo-400',
        bg: 'hover:bg-indigo-50 dark:hover:bg-indigo-900/20',
        text: 'text-indigo-700 dark:text-indigo-300',
      },
      purple: {
        icon: 'text-purple-600 dark:text-purple-400',
        bg: 'hover:bg-purple-50 dark:hover:bg-purple-900/20',
        text: 'text-purple-700 dark:text-purple-300',
      },
      pink: {
        icon: 'text-pink-600 dark:text-pink-400',
        bg: 'hover:bg-pink-50 dark:hover:bg-pink-900/20',
        text: 'text-pink-700 dark:text-pink-300',
      },
      gray: {
        icon: 'text-gray-600 dark:text-gray-400',
        bg: 'hover:bg-gray-50 dark:hover:bg-gray-900/20',
        text: 'text-gray-700 dark:text-gray-300',
      },
    };

    return colorMap[folder.color] || {
      icon: 'text-gray-600 dark:text-gray-400',
      bg: 'hover:bg-gray-100 dark:hover:bg-gray-800',
      text: 'text-gray-700 dark:text-gray-300',
    };
  };

  if (!chatGroup) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white truncate flex-1 mr-2">
            Move "{chatGroup.title}"
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Select a folder to move this chat to:
          </p>
          
          <div className="max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
            {folderTree.map((item) => {
              const folder = item.id ? folders.find(f => f.id === item.id) : undefined;
              const colorClasses = getFolderColorClasses(folder);
              const isCurrentFolder = item.id === chatGroup.folderId;
              const isSelected = selectedFolder === item.id;
              
              return (
                <button
                  key={item.id || 'root'}
                  onClick={() => !isCurrentFolder && setSelectedFolder(item.id)}
                  disabled={isCurrentFolder}
                  className={`
                    w-full text-left px-3 py-2 flex items-center gap-2 transition-colors
                    ${isCurrentFolder 
                      ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-900' 
                      : isSelected
                        ? 'bg-blue-50 dark:bg-blue-900/30 border-l-2 border-blue-500'
                        : colorClasses.bg + ' cursor-pointer'
                    }
                  `}
                  style={{ paddingLeft: `${(item.depth * 1.5) + 0.75}rem` }}
                >
                  {item.id === null ? (
                    <FolderOpen className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <Folder className={`h-4 w-4 ${colorClasses.icon}`} />
                  )}
                  <span className={`text-sm ${isCurrentFolder ? 'text-gray-500' : colorClasses.text}`}>
                    {item.name}
                  </span>
                  {isCurrentFolder && (
                    <span className="text-xs text-gray-500 ml-auto">(current)</span>
                  )}
                  {isSelected && !isCurrentFolder && (
                    <Check className="h-4 w-4 text-blue-500 ml-auto" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
            disabled={isMoving}
          >
            Cancel
          </button>
          <button
            onClick={handleMove}
            disabled={!selectedFolder === undefined || isMoving || selectedFolder === chatGroup.folderId}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
          >
            {isMoving ? 'Moving...' : 'Move'}
          </button>
        </div>
      </div>
    </Modal>
  );
}