'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { deleteAllChatData } from '@/lib/data/operations';
import toast from 'react-hot-toast';

export default function AdvancedTab() {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [confirmCode, setConfirmCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState('');
  const [databaseSize, setDatabaseSize] = useState<string>('Calculating...');

  // Calculate database size on mount
  useEffect(() => {
    const calculateSize = async () => {
      try {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
          const estimate = await navigator.storage.estimate();
          const sizeInMB = ((estimate.usage || 0) / (1024 * 1024)).toFixed(2);
          setDatabaseSize(`${sizeInMB} MB`);
        } else {
          setDatabaseSize('Not available');
        }
      } catch (error) {
        setDatabaseSize('Not available');
      }
    };
    calculateSize();
  }, []);

  const generateConfirmCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleInitiateDelete = () => {
    const code = generateConfirmCode();
    setConfirmCode(code);
    setShowDeleteConfirm(true);
    setInputCode('');
  };

  const handleDeleteAll = async () => {
    if (inputCode !== confirmCode) {
      toast.error('Confirmation code does not match. Please try again.');
      return;
    }

    setIsDeleting(true);

    try {
      // Use centralized delete function that handles all cleanup including image attachments
      await deleteAllChatData(setDeleteProgress);

      // Clear the local storage
      setDeleteProgress('Complete! Reloading...');

      // Strip the ?id= from the url and load it
      const url = new URL(window.location.href);
      url.searchParams.delete('id');
      window.history.replaceState({}, '', url.toString());
      setTimeout(() => {
        window.location.href = url.toString();
      }, 1500);

    } catch (error) {
      console.error('Error deleting data:', error);
      toast.error('An error occurred while deleting data. Please try again.');
      setIsDeleting(false);
      setDeleteProgress('');
    }
  };

  const handleCancel = () => {
    setShowDeleteConfirm(false);
    setConfirmCode('');
    setInputCode('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Advanced Settings
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Manage advanced application settings and data.
        </p>
      </div>

      {/* Danger Zone */}
      <div className="border border-red-200 dark:border-red-800 rounded-lg p-6 bg-red-50 dark:bg-red-900/20">
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-base font-semibold text-red-900 dark:text-red-200 mb-2">
              Danger Zone
            </h4>
            <p className="text-sm text-red-700 dark:text-red-300 mb-4">
              The following action is irreversible and will permanently delete all your data.
            </p>
          </div>
        </div>

        {!showDeleteConfirm ? (
          <div>
            <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Delete All Chats and Folders
            </h5>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              This will permanently delete:
            </p>
            <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400 space-y-1 mb-4">
              <li>All chat conversations and messages</li>
              <li>All folders and their contents</li>
              <li>All image attachments</li>
            </ul>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Your API keys and settings will be preserved.
            </p>
            <button
              onClick={handleInitiateDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete All Chats
            </button>
          </div>
        ) : (
          <div>
            {!isDeleting ? (
              <>
                <h5 className="text-sm font-semibold text-red-900 dark:text-red-200 mb-3">
                  Confirm Deletion
                </h5>
                <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                  To confirm deletion, please type the following code exactly:
                </p>
                <div className="bg-white dark:bg-gray-900 border-2 border-red-300 dark:border-red-700 rounded-lg p-4 mb-4">
                  <p className="text-2xl font-mono text-center text-red-600 dark:text-red-400 select-none">
                    {confirmCode}
                  </p>
                </div>
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  placeholder="Enter the code above"
                  className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg mb-4 font-mono text-center"
                  autoFocus
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleCancel}
                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAll}
                    disabled={inputCode !== confirmCode}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    Delete Everything
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="mb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12">
                    <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                </div>
                <p className="text-sm text-red-700 dark:text-red-300">
                  {deleteProgress}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Other Advanced Settings */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
          Data Management
        </h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Database Size
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Estimated size of your local database
              </p>
            </div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {databaseSize}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}