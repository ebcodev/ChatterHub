import React from 'react';
import { Modal } from '../ui/modal';
import { Progress } from '../ui/progress';
import { Copy, MessageCircle, Paperclip, Clock, CheckCircle } from 'lucide-react';
import { DuplicateProgress as ImportedDuplicateProgress } from '@/lib/data/operations/chats';

// Re-export to ensure type compatibility
export type DuplicateProgress = ImportedDuplicateProgress;

interface DuplicateProgressModalProps {
  isOpen: boolean;
  progress: DuplicateProgress;
}

export function DuplicateProgressModal({ isOpen, progress }: DuplicateProgressModalProps) {
  const getStepDescription = () => {
    const step = progress.step as string;

    if (step === 'starting') return 'Preparing to duplicate...';
    if (step === 'chatGroup') return 'Creating chat group copy...';
    if (step === 'chats') return 'Duplicating chat windows...';
    if (step === 'messages') return `Copying message ${progress.currentItem} of ${progress.totalItems}...`;
    if (step === 'attachments') return 'Copying image attachments...';
    if (step === 'completed') return 'Duplication completed!';

    return 'Processing...';
  };

  const getProgressPercentage = () => {
    if (progress.totalItems === 0) return 0;

    const step = progress.step as string;

    if (step === 'starting') return 0;
    if (step === 'chatGroup') return 10;
    if (step === 'chats') return 20;
    if (step === 'messages') {
      // Messages take up 60% of progress (20% to 80%)
      const messageProgress = progress.totalMessages > 0
        ? (progress.messagesCopied / progress.totalMessages) * 60
        : 0;
      return 20 + messageProgress;
    }
    if (step === 'attachments') return 85;
    if (step === 'completed') return 100;

    return 0;
  };

  const progressPercentage = getProgressPercentage();

  return (
    <Modal isOpen={isOpen} onClose={() => {}}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-0 w-full max-w-lg mx-4 relative">
        {/* Header with prominent icon and title */}
        <div className="px-8 pt-8 pb-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 dark:bg-blue-600 rounded-full mb-4">
            <Copy className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Duplicating Chat
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">
            "{progress.chatGroupTitle}"
          </p>
        </div>

        {/* Content */}
        <div className="px-8 pb-8">

          <div className="space-y-6">
            {/* Progress section */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-base font-medium text-gray-700 dark:text-gray-200">
                  {getStepDescription()}
                </span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {Math.round(progressPercentage)}%
                </span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
            </div>

            {/* Stats section */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <MessageCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Messages copied:</span>
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-800 px-2 py-1 rounded-lg">
                  {progress.messagesCopied} of {progress.totalMessages}
                </span>
              </div>

              {progress.totalAttachments > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Paperclip className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Attachments copied:</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-800 px-2 py-1 rounded-lg">
                    {progress.attachmentsCopied} of {progress.totalAttachments}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2 border-t border-gray-200 dark:border-gray-600">
                <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                  Preserving original timestamps...
                </span>
              </div>
            </div>

            {progress.step === 'completed' && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-base font-semibold text-green-800 dark:text-green-300">
                    Chat successfully duplicated!
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}