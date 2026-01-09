'use client';

import { useState } from 'react';
import { Edit2, Trash2, Power, DollarSign, Hash, Globe, Bot } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCustomModels } from '@/hooks/data/useCustomModels';
import { CustomModel } from '@/lib/db';
import { getModelGradient } from '@/lib/utils';

interface CustomModelCardProps {
  model: CustomModel;
  onEdit: () => void;
}

export default function CustomModelCard({ model, onEdit }: CustomModelCardProps) {
  const { deleteCustomModel, toggleCustomModelStatus } = useCustomModels();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggleStatus = async () => {
    try {
      await toggleCustomModelStatus(model.id!);
      toast.success(model.isActive ? 'Model deactivated' : 'Model activated');
    } catch (error) {
      toast.error('Failed to toggle model status');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this model?')) return;

    setIsDeleting(true);
    try {
      await deleteCustomModel(model.id!);
      toast.success('Model deleted successfully');
    } catch (error) {
      toast.error('Failed to delete model');
      setIsDeleting(false);
    }
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'N/A';
    return `$${price.toFixed(2)}`;
  };

  return (
    <div className={`bg-white dark:bg-gray-800 border rounded-lg p-4 ${model.isActive ? 'border-gray-200 dark:border-gray-700' : 'border-gray-300 dark:border-gray-600 opacity-60'
      } hover:shadow-lg transition-all`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {model.iconUrl ? (
            <img src={model.iconUrl} alt={model.name} className="w-8 h-8 rounded" />
          ) : (
            <div
              className="w-8 h-8 rounded flex items-center justify-center"
              style={{ background: getModelGradient(model.name).gradient }}
            >
              <Bot className="h-4 w-4 text-white/90" />
            </div>
          )}
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              {model.name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {model.modelId}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleToggleStatus}
            className={`p-1.5 rounded-lg transition-colors ${model.isActive
              ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
              : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            title={model.isActive ? 'Deactivate' : 'Activate'}
          >
            <Power className="h-4 w-4" />
          </button>
          <button
            onClick={onEdit}
            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2 text-xs">
        {/* API Type Badge */}
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${model.apiType === 'openai-chat-completions'
            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
            : model.apiType === 'openai-responses'
              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
              : model.apiType === 'anthropic'
                ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
            }`}>
            {model.apiType === 'openai-chat-completions' ? 'OpenAI Chat Completions' :
              model.apiType === 'openai-responses' ? 'OpenAI Responses' :
                model.apiType === 'anthropic' ? 'Anthropic' :
                  model.apiType === 'gemini' ? 'Gemini' :
                    'Unknown'}
          </span>
          {model.provider === 'openrouter' && (
            <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded text-xs font-medium">
              OpenRouter
            </span>
          )}
        </div>

        {/* Model Info */}
        <div className="grid grid-cols-2 gap-2 text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Hash className="h-3 w-3" />
            <span>Context: {model.contextWindow.toLocaleString()}</span>
          </div>
          {(model.inputPricing || model.outputPricing) && (
            <div className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              <span>
                {formatPrice(model.inputPricing)}/{formatPrice(model.outputPricing)}
              </span>
            </div>
          )}
        </div>

        {/* Base URL */}
        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
          <Globe className="h-3 w-3" />
          <span className="truncate" title={model.baseUrl}>
            {model.baseUrl}
          </span>
        </div>

        {/* Capabilities */}
        <div className="flex flex-wrap gap-1 mt-2">
          {model.supportsStreaming && (
            <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
              Streaming
            </span>
          )}
          {model.supportsSystemRole && (
            <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
              System
            </span>
          )}
          {model.supportsVision && (
            <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
              Vision
            </span>
          )}
          {model.supportsPlugins && (
            <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
              Plugins
            </span>
          )}
        </div>
      </div>
    </div>
  );
}