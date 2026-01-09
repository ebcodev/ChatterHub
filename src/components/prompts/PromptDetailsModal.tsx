import { BuiltinPrompt } from '@/lib/data/builtinPrompts';
import { Modal } from '@/components/ui/modal';
import { X, Download } from 'lucide-react';
import toast from 'react-hot-toast';

interface PromptDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: BuiltinPrompt | null;
  onImport: (prompt: BuiltinPrompt) => void;
}

export default function PromptDetailsModal({ 
  isOpen, 
  onClose, 
  prompt, 
  onImport 
}: PromptDetailsModalProps) {
  if (!prompt) return null;

  const handleImport = () => {
    onImport(prompt);
    toast.success(`"${prompt.title}" imported to your library`);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-3xl">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {prompt.title}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {prompt.description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Tags */}
          {prompt.tags.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {prompt.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Prompt Content */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Prompt Content
            </h3>
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <pre className="text-sm text-gray-700 dark:text-gray-300 font-mono whitespace-pre-wrap break-words">
                {prompt.content}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleImport}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Import to Library
          </button>
        </div>
      </div>
    </Modal>
  );
}