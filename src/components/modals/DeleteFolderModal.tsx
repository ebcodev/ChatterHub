import { Folder as FolderType } from '@/lib/db';
import { Modal } from '../ui/modal';
import { Loader2 } from 'lucide-react';

interface DeleteFolderModalProps {
  showDeleteFolderModal: string | null;
  setShowDeleteFolderModal: (value: string | null) => void;
  folderToDelete: string | null;
  folders: FolderType[];
  handleConfirmDeleteFolder: (deleteOption: 'cancel' | 'delete-all' | 'folder-only') => void;
  isDeleting?: boolean;
  deleteProgress?: string;
}

export default function DeleteFolderModal({
  showDeleteFolderModal,
  setShowDeleteFolderModal,
  folderToDelete,
  folders,
  handleConfirmDeleteFolder,
  isDeleting = false,
  deleteProgress
}: DeleteFolderModalProps) {
  return (
    <Modal isOpen={!!showDeleteFolderModal} onClose={() => !isDeleting && setShowDeleteFolderModal(null)}>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
        {isDeleting ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
            <h3 className="text-lg font-semibold dark:text-white mb-2">Deleting Folder...</h3>
            {deleteProgress && (
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                {deleteProgress}
              </p>
            )}
          </div>
        ) : (
          <>
            <h3 className="text-lg font-semibold dark:text-white mb-4">Delete Folder</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              Choose how you want to delete the folder "{folders.find(f => f.id === folderToDelete)?.name}":
            </p>
            <div className="space-y-3">
              <button
                onClick={() => handleConfirmDeleteFolder('folder-only')}
                className="w-full text-left px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white">Delete folder only</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Move subfolders and chat groups to parent folder
                </div>
              </button>
              <button
                onClick={() => handleConfirmDeleteFolder('delete-all')}
                className="w-full text-left px-4 py-3 border border-red-300 dark:border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <div className="font-medium text-red-600 dark:text-red-400">Delete folder and contents</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Permanently delete all subfolders and chat groups inside
                </div>
              </button>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => handleConfirmDeleteFolder('cancel')}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}