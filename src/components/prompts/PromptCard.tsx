import { useState } from 'react';
import { Prompt } from '@/lib/db';
import { Star, Copy, Edit2, Trash2, Play, MoreVertical } from 'lucide-react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface PromptCardProps {
  prompt: Prompt;
  onEdit: (prompt: Prompt) => void;
  onDelete: (id: string) => void;
  onToggleStar: (id: string) => void;
  onDuplicate: (id: string) => void;
}

export default function PromptCard({
  prompt,
  onEdit,
  onDelete,
  onToggleStar,
  onDuplicate,
}: PromptCardProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleUse = () => {
    // Navigate to chat with the prompt content
    router.push({
      pathname: '/',
      query: { prompt: prompt.content },
    });
  };

  const handleDelete = () => {
    onDelete(prompt.id!);
    setShowDeleteDialog(false);
    toast.success('Prompt deleted');
  };

  const handleDuplicate = () => {
    onDuplicate(prompt.id!);
    toast.success('Prompt duplicated');
    setShowMenu(false);
  };

  const handleToggleStar = () => {
    onToggleStar(prompt.id!);
    toast.success(prompt.isStarred ? 'Removed from favorites' : 'Added to favorites');
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition-all relative group">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1 flex items-center gap-2">
              {prompt.title}
              {prompt.isStarred && (
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              )}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
              {prompt.description}
            </p>
          </div>

          {/* Menu Button */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="h-4 w-4 text-gray-500" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-8 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                <button
                  onClick={() => {
                    onEdit(prompt);
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={handleDuplicate}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Duplicate
                </button>
                <button
                  onClick={handleToggleStar}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <Star className="h-4 w-4" />
                  {prompt.isStarred ? 'Unstar' : 'Star'}
                </button>
                <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                <button
                  onClick={() => {
                    setShowDeleteDialog(true);
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
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

        {/* Use Button */}
        <button
          onClick={handleUse}
          className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <Play className="h-4 w-4" />
          Use Prompt
        </button>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Prompt</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{prompt.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}