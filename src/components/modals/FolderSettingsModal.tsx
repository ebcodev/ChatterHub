'use client';

import { useState } from 'react';
import { X, FolderOpen, Save, Crown } from 'lucide-react';
import { Folder } from '@/lib/db';
import { useLicense } from '@/contexts/LicenseContext';
import { Modal } from '../ui/modal';
import toast from 'react-hot-toast';

interface FolderSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  folder: Folder;
  onSave: (systemPrompt: string) => void;
}

export default function FolderSettingsModal({ isOpen, onClose, folder, onSave }: FolderSettingsModalProps) {
  const { canUseSystemPrompts } = useLicense();
  const [systemPrompt, setSystemPrompt] = useState(folder.systemPrompt || '');

  const handleSave = () => {
    onSave(systemPrompt);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 sm:gap-3">
            <FolderOpen className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-base sm:text-xl font-semibold text-gray-900 dark:text-white truncate">
              Folder Settings: {folder.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="folder-system-prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                System Prompt for Folder
                {!canUseSystemPrompts && (
                  <span className="ml-2 inline-flex items-center gap-1 text-xs bg-gradient-to-r from-yellow-400 to-amber-600 text-white px-2 py-0.5 rounded-full">
                    <Crown className="h-3 w-3" />
                    Premium Only
                  </span>
                )}
              </label>
              {canUseSystemPrompts ? (
                <textarea
                  id="folder-system-prompt"
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="Enter a system prompt that will be inherited by all chat groups in this folder..."
                  className="w-full h-32 px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              ) : (
                <div
                  onClick={() => {
                    toast.error('Upgrade to use system prompts!');
                  }}
                  className="w-full h-32 px-4 py-2 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-500 rounded-lg cursor-pointer flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="text-center">
                    <Crown className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                    <p className="text-sm font-medium">Upgrade to Premium</p>
                    <p className="text-xs mt-1">Unlock system prompts and more features</p>
                  </div>
                </div>
              )}
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                This system prompt will be inherited by all chat groups in this folder and its subfolders,
                unless they have their own system prompt defined.
              </p>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Note:</strong> Chat groups can override this system prompt with their own.
                Subfolders can also define their own system prompts which will take precedence for their contents.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canUseSystemPrompts}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            Save Changes
          </button>
        </div>
      </div>
    </Modal>
  );
}