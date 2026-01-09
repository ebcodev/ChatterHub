import { BuiltinPrompt } from '@/lib/data/builtinPrompts';
import { Download, Eye } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import toast from 'react-hot-toast';

interface BuiltinPromptCardProps {
  prompt: BuiltinPrompt;
  onImport: (prompt: BuiltinPrompt) => void;
  onViewDetails: (prompt: BuiltinPrompt) => void;
  isSelected?: boolean;
  onSelectionChange?: (selected: boolean) => void;
}

export default function BuiltinPromptCard({ 
  prompt, 
  onImport,
  onViewDetails,
  isSelected = false,
  onSelectionChange
}: BuiltinPromptCardProps) {
  const handleImport = () => {
    onImport(prompt);
    toast.success(`"${prompt.title}" imported to your library`);
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition-all relative">
      {/* Checkbox for selection */}
      {onSelectionChange && (
        <div className="absolute top-3 right-3 z-10">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelectionChange}
            className="border-gray-300 dark:border-gray-600"
          />
        </div>
      )}
      
      {/* Header */}
      <div className="mb-3 pr-8">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
          {prompt.title}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
          {prompt.description}
        </p>
      </div>

      {/* Tags */}
      {prompt.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {prompt.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Preview of content */}
      <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-900 rounded text-xs text-gray-600 dark:text-gray-400 font-mono line-clamp-3">
        {prompt.content}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => onViewDetails(prompt)}
          className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
        >
          <Eye className="h-4 w-4" />
          View Details
        </button>
        <button
          onClick={handleImport}
          className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
        >
          <Download className="h-4 w-4" />
          Import to Library
        </button>
      </div>
    </div>
  );
}