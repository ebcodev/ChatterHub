'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, DollarSign, Hash, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApiKeys } from '@/contexts/ApiKeysContext';
import { useCustomModels } from '@/hooks/data/useCustomModels';
import { OpenRouterService, OpenRouterModel } from '@/lib/services/openrouter';

export default function OpenRouterBrowser() {
  const { openRouterKey } = useApiKeys();
  const { addCustomModel, customModels } = useCustomModels();

  const [models, setModels] = useState<OpenRouterModel[]>([]);
  const [filteredModels, setFilteredModels] = useState<OpenRouterModel[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'context'>('name');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [addingModels, setAddingModels] = useState<Set<string>>(new Set());

  // Load models when component mounts or API key changes
  useEffect(() => {
    if (openRouterKey) {
      loadModels();
    }
  }, [openRouterKey]);

  // Filter and sort models when search or sort changes
  useEffect(() => {
    if (!models.length) return;

    const service = new OpenRouterService(openRouterKey);
    let filtered = searchQuery
      ? service.filterModels(models, searchQuery)
      : models;

    filtered = service.sortModels(filtered, sortBy);
    setFilteredModels(filtered);
  }, [models, searchQuery, sortBy, openRouterKey]);

  const loadModels = async () => {
    if (!openRouterKey) {
      setError('Please add your OpenRouter API key in Settings');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const service = new OpenRouterService(openRouterKey);
      const fetchedModels = await service.getAvailableModels();
      setModels(fetchedModels);
      setFilteredModels(service.sortModels(fetchedModels, sortBy));
    } catch (err) {
      console.error('Failed to load OpenRouter models:', err);
      setError('Failed to load models. Please check your API key.');
      setModels([]);
      setFilteredModels([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddModel = async (model: OpenRouterModel) => {
    // Check if model already exists
    const exists = customModels.some(m => m.modelId === model.id);
    if (exists) {
      toast.error('This model has already been added');
      return;
    }

    setAddingModels(prev => new Set(prev).add(model.id));

    try {
      const service = new OpenRouterService(openRouterKey);

      // Detect all model capabilities
      const capabilities = service.detectModelCapabilities(model);

      // Map the supported parameters from OpenRouter to our internal format
      const supportedParameters = service.mapSupportedParameters(model.supported_parameters);

      // Build custom headers for OpenRouter authentication
      const customHeaders = {
        'Authorization': `Bearer ${openRouterKey}`,
        'HTTP-Referer': window.location.origin, // Optional but recommended by OpenRouter
        'X-Title': 'ChatterHub' // Optional app name
      };

      await addCustomModel({
        name: model.name,
        modelId: model.id,
        provider: 'openrouter',
        apiType: 'openai-chat-completions',
        baseUrl: 'https://openrouter.ai/api/v1',
        contextWindow: model.context_length,
        inputPricing: service.formatPricing(model.pricing.prompt),
        outputPricing: service.formatPricing(model.pricing.completion),
        supportsSystemRole: capabilities.supportsSystemRole,
        supportsStreaming: capabilities.supportsStreaming,
        supportsVision: capabilities.supportsVision,
        supportsPlugins: capabilities.supportsPlugins,
        supportedParameters: supportedParameters,
        customHeaders: customHeaders,
        isActive: true,
      });

      toast.success(`Added ${model.name} to your custom models`);
    } catch (error) {
      console.error('Failed to add model:', error);
      toast.error('Failed to add model');
    } finally {
      setAddingModels(prev => {
        const next = new Set(prev);
        next.delete(model.id);
        return next;
      });
    }
  };

  const formatPrice = (price: string) => {
    const service = new OpenRouterService(openRouterKey);
    const formatted = service.formatPricing(price);
    return `$${formatted.toFixed(2)}`;
  };

  if (!openRouterKey) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          OpenRouter API Key Required
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-md">
          Please add your OpenRouter API key in Settings → APIs to browse and import models.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          OpenRouter Models
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Browse and import models from OpenRouter's extensive catalog
        </p>
      </div>

      {/* Search and Sort */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search models..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'context')}
            className="px-4 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white appearance-none cursor-pointer"
          >
            <option value="name">Sort by Name</option>
            <option value="price">Sort by Price</option>
            <option value="context">Sort by Context</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <button
          onClick={loadModels}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            'Refresh'
          )}
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Models Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : filteredModels.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredModels.map((model) => {
            const isAdded = customModels.some(m => m.modelId === model.id);
            const isAdding = addingModels.has(model.id);

            return (
              <div
                key={model.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition-shadow"
              >
                <div className="mb-3">
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                    {model.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {model.id}
                  </p>
                </div>

                {model.description && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {model.description}
                  </p>
                )}

                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <Hash className="h-3 w-3" />
                    <span>Context: {model.context_length.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <DollarSign className="h-3 w-3" />
                    <span>
                      Input: {formatPrice(model.pricing.prompt)} /
                      Output: {formatPrice(model.pricing.completion)}
                    </span>
                    <span className="text-xs text-gray-500">per 1M tokens</span>
                  </div>
                </div>

                {(model.architecture?.modality || model.supported_parameters) && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {model.architecture?.modality && (
                      <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                        {model.architecture.modality}
                      </span>
                    )}
                    {model.architecture?.instruct_type && (
                      <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                        {model.architecture.instruct_type}
                      </span>
                    )}
                    {/* Capability badges */}
                    {model.architecture?.input_modalities?.includes('image') && (
                      <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded text-xs">
                        👁 Vision
                      </span>
                    )}
                    {model.architecture?.input_modalities?.includes('audio') && (
                      <span className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 rounded text-xs">
                        🎵 Audio
                      </span>
                    )}
                    {model.supported_parameters?.includes('tools') && model.supported_parameters?.includes('tool_choice') && (
                      <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300 rounded text-xs">
                        🔧 Tools
                      </span>
                    )}
                    {(model.supported_parameters?.includes('reasoning') || model.supported_parameters?.includes('include_reasoning')) && (
                      <span className="px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300 rounded text-xs">
                        🧠 Reasoning
                      </span>
                    )}
                    {model.supported_parameters?.includes('structured_outputs') && (
                      <span className="px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded text-xs">
                        📋 Structured
                      </span>
                    )}
                    {model.top_provider?.is_moderated && (
                      <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 rounded text-xs">
                        🛡 Moderated
                      </span>
                    )}
                  </div>
                )}

                <button
                  onClick={() => handleAddModel(model)}
                  disabled={isAdded || isAdding}
                  className={`w-full py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${isAdded
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                    : isAdding
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                >
                  {isAdded ? (
                    'Already Added'
                  ) : isAdding ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Add Model
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      ) : models.length > 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            No models found matching "{searchQuery}"
          </p>
        </div>
      ) : null}
    </div>
  );
}