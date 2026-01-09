'use client';

import { useState, useEffect } from 'react';
import { X, Settings, AlertCircle, Crown } from 'lucide-react';
import { ChatGroup, db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { useLicense } from '@/contexts/LicenseContext';
import { Modal } from '../ui/modal';
import toast from 'react-hot-toast';

interface ChatSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatGroup: ChatGroup;
  onSave: (systemPrompt: string) => void;
}

export default function ChatSettingsModal({ isOpen, onClose, chatGroup, onSave }: ChatSettingsModalProps) {
  const { canUseSystemPrompts } = useLicense();
  const [systemPrompt, setSystemPrompt] = useState(chatGroup.systemPrompt || '');
  const [inheritedPrompt, setInheritedPrompt] = useState<string>('');
  const [inheritedFrom, setInheritedFrom] = useState<string>('');
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  // Fetch all folders for traversing the hierarchy
  const folders = useLiveQuery(() => db.folders.toArray()) || [];

  // Find inherited system prompt by traversing folder hierarchy
  useEffect(() => {
    const findInheritedPrompt = async () => {
      if (!chatGroup.folderId) {
        setInheritedPrompt('');
        setInheritedFrom('');
        return;
      }

      let currentFolderId: string | null = chatGroup.folderId;
      let foundPrompt = '';
      let foundFrom = '';

      while (currentFolderId && !foundPrompt) {
        const folder = folders.find(f => f.id === currentFolderId);
        if (folder) {
          if (folder.systemPrompt) {
            foundPrompt = folder.systemPrompt;
            foundFrom = folder.name;
            break;
          }
          currentFolderId = folder.parentId;
        } else {
          break;
        }
      }

      setInheritedPrompt(foundPrompt);
      setInheritedFrom(foundFrom);
    };

    findInheritedPrompt();
  }, [chatGroup.folderId, folders]);

  const handleSave = () => {
    onSave(systemPrompt);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 sm:gap-3">
            <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              Chat Settings
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
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="space-y-4">
            {/* System Prompt Section */}
            <div>
              <label htmlFor="system-prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                System Prompt
                {!canUseSystemPrompts && (
                  <span className="ml-2 inline-flex items-center gap-1 text-xs bg-gradient-to-r from-yellow-400 to-amber-600 text-white px-2 py-0.5 rounded-full">
                    <Crown className="h-3 w-3" />
                    Premium Only
                  </span>
                )}
              </label>

              {/* Warning if overriding inherited prompt */}
              {inheritedPrompt && (
                <div className="mb-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="flex gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-700 dark:text-amber-300">
                      <p className="font-medium mb-1">
                        Entering a system prompt here will override the existing prompt from folder "{inheritedFrom}"
                      </p>
                      <details className="mt-2">
                        <summary className="cursor-pointer text-amber-600 dark:text-amber-400 hover:underline">
                          View inherited prompt
                        </summary>
                        <div className="mt-2 p-2 bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-700 rounded text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {inheritedPrompt}
                        </div>
                      </details>
                    </div>
                  </div>
                </div>
              )}

              {canUseSystemPrompts ? (
                <textarea
                  id="system-prompt"
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder={inheritedPrompt ?
                    "Leave empty to use the inherited prompt from the parent folder" :
                    "Enter a system prompt to guide the AI's behavior..."
                  }
                  className="w-full h-32 px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              ) : (
                <div
                  onClick={() => {
                    toast.error('Upgrade to use system prompts!');
                    setShowUpgradePrompt(true);
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
                The system prompt is sent with every message to provide context and instructions to the AI.
                {!inheritedPrompt && " This chat group has no inherited prompt from parent folders."}
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
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Changes
          </button>
        </div>
      </div>
    </Modal>
  );
}