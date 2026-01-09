import { MCPServer } from '@/lib/db';
import { Server, Settings, Trash2, Power, Shield, Globe, Edit } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface MCPServerCardProps {
  server: MCPServer;
  onEdit: () => void;
  onDelete: () => Promise<void>;
  onToggle: () => Promise<void>;
}

export default function MCPServerCard({ server, onEdit, onDelete, onToggle }: MCPServerCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
      toast.success('MCP server deleted successfully');
      setShowDeleteDialog(false);
    } catch (error) {
      toast.error('Failed to delete MCP server');
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      await onToggle();
      toast.success(server.isActive ? 'MCP server deactivated' : 'MCP server activated');
    } catch (error) {
      toast.error('Failed to toggle MCP server');
      console.error(error);
    } finally {
      setIsToggling(false);
    }
  };

  const getApprovalBadge = () => {
    switch (server.requireApproval) {
      case 'never':
        return (
          <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Auto
          </span>
        );
      case 'always':
        return (
          <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Manual
          </span>
        );
    }
  };

  return (
    <>
      <div className={`bg-white dark:bg-gray-800 border rounded-lg p-4 transition-all ${
        server.isActive 
          ? 'border-blue-500 dark:border-blue-400 shadow-md' 
          : 'border-gray-200 dark:border-gray-700 opacity-75'
      }`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${
              server.isActive 
                ? 'bg-blue-100 dark:bg-blue-900/30' 
                : 'bg-gray-100 dark:bg-gray-700'
            }`}>
              {server.isBuiltin ? (
                <Globe className={`h-5 w-5 ${
                  server.isActive 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-500 dark:text-gray-400'
                }`} />
              ) : (
                <Server className={`h-5 w-5 ${
                  server.isActive 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-500 dark:text-gray-400'
                }`} />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                {server.name}
                {server.isBuiltin && (
                  <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                    Built-in
                  </span>
                )}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Label: {server.serverLabel}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleToggle}
              disabled={isToggling}
              className={`p-1.5 rounded-lg transition-colors ${
                server.isActive
                  ? 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                  : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title={server.isActive ? 'Deactivate' : 'Activate'}
            >
              <Power className="h-4 w-4" />
            </button>
          </div>
        </div>

        {server.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {server.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getApprovalBadge()}
            {server.customHeaders && (
              <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                Has Headers
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onEdit}
              className="p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Edit"
            >
              <Edit className="h-4 w-4" />
            </button>
            {!server.isBuiltin && (
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="p-1.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {server.serverUrl}
          </p>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete MCP Server</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{server.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}