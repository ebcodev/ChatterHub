'use client';

import { useState } from 'react';
import { Plus, Trash2, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCustomModels } from '@/hooks/data/useCustomModels';

interface CustomModelFormProps {
  modelToEdit?: any; // CustomModel type
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CustomModelForm({ modelToEdit, onSuccess, onCancel }: CustomModelFormProps) {
  const { addCustomModel, updateCustomModel } = useCustomModels();

  // Basic Configuration
  const [name, setName] = useState(modelToEdit?.name || '');
  const [modelId, setModelId] = useState(modelToEdit?.modelId || '');
  const [apiType, setApiType] = useState<'openai-chat-completions' | 'openai-responses' | 'anthropic' | 'gemini'>(modelToEdit?.apiType || 'openai-chat-completions');
  const [iconUrl, setIconUrl] = useState(modelToEdit?.iconUrl || '');
  const [baseUrl, setBaseUrl] = useState(modelToEdit?.baseUrl || '');
  const [contextWindow, setContextWindow] = useState(modelToEdit?.contextWindow || 2048);

  // Pricing
  const [inputPricing, setInputPricing] = useState(modelToEdit?.inputPricing || 0);
  const [outputPricing, setOutputPricing] = useState(modelToEdit?.outputPricing || 0);

  // Model Capabilities
  const [supportsPlugins, setSupportsPlugins] = useState(modelToEdit?.supportsPlugins || false);
  const [supportsVision, setSupportsVision] = useState(modelToEdit?.supportsVision || false);
  const [supportsSystemRole, setSupportsSystemRole] = useState(modelToEdit?.supportsSystemRole || true);
  const [supportsStreaming, setSupportsStreaming] = useState(modelToEdit?.supportsStreaming || true);

  // Supported Parameters
  const [supportedParams, setSupportedParams] = useState<Set<string>>(
    new Set(modelToEdit?.supportedParameters || ['temperature', 'maxTokens', 'topP', 'presencePenalty', 'frequencyPenalty'])
  );

  // Custom Headers
  const [customHeaders, setCustomHeaders] = useState<Array<{ key: string, value: string }>>(
    modelToEdit?.customHeaders ?
      Object.entries(modelToEdit.customHeaders).map(([key, value]) => ({ key, value: value as string })) :
      []
  );

  // Custom Body Parameters
  const [customBodyParams, setCustomBodyParams] = useState<Array<{ key: string, value: string }>>(
    modelToEdit?.customBodyParams ?
      Object.entries(modelToEdit.customBodyParams).map(([key, value]) => ({ key, value: JSON.stringify(value) })) :
      []
  );

  const toggleParam = (param: string) => {
    const newParams = new Set(supportedParams);
    if (newParams.has(param)) {
      newParams.delete(param);
    } else {
      newParams.add(param);
    }
    setSupportedParams(newParams);
  };

  const addHeader = () => {
    setCustomHeaders([...customHeaders, { key: '', value: '' }]);
  };

  const updateHeader = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...customHeaders];
    if (updated[index]) {
      updated[index][field] = value;
    }
    setCustomHeaders(updated);
  };

  const removeHeader = (index: number) => {
    setCustomHeaders(customHeaders.filter((_, i) => i !== index));
  };

  const addBodyParam = () => {
    setCustomBodyParams([...customBodyParams, { key: '', value: '' }]);
  };

  const updateBodyParam = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...customBodyParams];
    if (updated[index]) {
      updated[index][field] = value;
    }
    setCustomBodyParams(updated);
  };

  const removeBodyParam = (index: number) => {
    setCustomBodyParams(customBodyParams.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!name || !modelId || !baseUrl) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const modelData = {
        name,
        modelId,
        provider: 'custom' as const,
        apiType,
        baseUrl,
        iconUrl: iconUrl || undefined,
        contextWindow,
        inputPricing: inputPricing || undefined,
        outputPricing: outputPricing || undefined,
        supportsPlugins,
        supportsVision,
        supportsSystemRole,
        supportsStreaming,
        supportedParameters: Array.from(supportedParams),
        customHeaders: customHeaders.length > 0 ?
          Object.fromEntries(customHeaders.filter(h => h.key).map(h => [h.key, h.value])) :
          undefined,
        customBodyParams: customBodyParams.length > 0 ?
          Object.fromEntries(customBodyParams.filter(p => p.key).map(p => [p.key, JSON.parse(p.value || '""')])) :
          undefined,
        isActive: true,
      };

      if (modelToEdit) {
        await updateCustomModel(modelToEdit.id, modelData);
        toast.success('Model updated successfully');
      } else {
        await addCustomModel(modelData);
        toast.success('Model added successfully');
      }

      onSuccess?.();
    } catch (error) {
      console.error('Error saving model:', error);
      toast.error('Failed to save model');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Basic Configuration */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Basic Configuration</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., GPT4All"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              API Type
            </label>
            <select
              value={apiType}
              onChange={(e) => setApiType(e.target.value as 'openai-chat-completions' | 'openai-responses' | 'anthropic' | 'gemini')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="openai-chat-completions">OpenAI Chat Completions API</option>
              <option value="openai-responses">OpenAI Responses API</option>
              <option value="anthropic">Anthropic Messages API</option>
              <option value="gemini">Google Gemini API</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Icon URL <span className="text-gray-500 text-xs">Optional</span>
            </label>
            <input
              type="text"
              value={iconUrl}
              onChange={(e) => setIconUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Base URL <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://example.com/v1"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1">
              <Info className="h-3 w-3" />
              Endpoint must be compatible with {
                apiType === 'openai-chat-completions' ? 'OpenAI Chat Completions' :
                  apiType === 'openai-responses' ? 'OpenAI Responses' :
                    apiType === 'anthropic' ? 'Anthropic Messages' :
                      'Google Gemini'
              } API format
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Model ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
              placeholder="e.g., ggml-gpt4all-j-v1.3-groovy.bin"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Context Length
            </label>
            <input
              type="number"
              value={contextWindow}
              onChange={(e) => setContextWindow(parseInt(e.target.value) || 2048)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Pricing <span className="text-gray-500 text-xs">Optional</span>
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Set pricing for cost estimation (per 1M tokens)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-600 dark:text-gray-400">$</span>
              <input
                type="number"
                value={inputPricing}
                onChange={(e) => setInputPricing(parseFloat(e.target.value) || 0)}
                step="0.01"
                placeholder="0.00"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">/ 1M input tokens</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 dark:text-gray-400">$</span>
              <input
                type="number"
                value={outputPricing}
                onChange={(e) => setOutputPricing(parseFloat(e.target.value) || 0)}
                step="0.01"
                placeholder="0.00"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">/ 1M output tokens</span>
            </div>
          </div>
        </div>
      </div>

      {/* Model Capabilities */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Model Capabilities</h3>

        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={supportsPlugins}
              onChange={(e) => setSupportsPlugins(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Support Plugins (via OpenAI Functions)
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Enable if the model supports the "functions" or "tool_calls" parameter.
              </p>
            </div>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={supportsVision}
              onChange={(e) => setSupportsVision(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Support OpenAI Vision
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Enable if the model supports image input.
              </p>
            </div>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={supportsSystemRole}
              onChange={(e) => setSupportsSystemRole(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Support System Role
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Enable if the model supports the "system" role.
              </p>
            </div>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={supportsStreaming}
              onChange={(e) => setSupportsStreaming(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Support Streaming Output
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Enable if the model supports streaming output ("stream": true).
              </p>
            </div>
          </label>
        </div>

        {/* Supported Parameters */}
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Supported Parameters
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { id: 'temperature', label: 'Temperature', info: true },
              { id: 'presencePenalty', label: 'Presence Penalty', info: true },
              { id: 'frequencyPenalty', label: 'Frequency Penalty', info: true },
              { id: 'topP', label: 'Top P', info: true },
              { id: 'maxTokens', label: 'Max Tokens', info: true },
              { id: 'reasoningEffort', label: 'Reasoning Effort', info: true },
            ].map((param) => (
              <label key={param.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={supportedParams.has(param.id)}
                  onChange={() => toggleParam(param.id)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
                  {param.label}
                  {param.info && <Info className="h-3 w-3 text-gray-400" />}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Advanced</h3>

        {/* Custom Headers */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Custom Headers
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
              (Use for API keys: x-api-key, Authorization, etc.)
            </span>
          </h4>
          <div className="space-y-2">
            {customHeaders.map((header, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={header.key}
                  onChange={(e) => updateHeader(index, 'key', e.target.value)}
                  placeholder="Header name"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <input
                  type="text"
                  value={header.value}
                  onChange={(e) => updateHeader(index, 'value', e.target.value)}
                  placeholder="Header value"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <button
                  onClick={() => removeHeader(index)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              onClick={addHeader}
              className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              <Plus className="h-4 w-4" />
              Add Header Parameter
            </button>
          </div>
        </div>

        {/* Custom Body Parameters */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Custom Body Params</h4>
          <div className="space-y-2">
            {customBodyParams.map((param, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={param.key}
                  onChange={(e) => updateBodyParam(index, 'key', e.target.value)}
                  placeholder="Parameter name"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <input
                  type="text"
                  value={param.value}
                  onChange={(e) => updateBodyParam(index, 'value', e.target.value)}
                  placeholder="Parameter value (JSON)"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <button
                  onClick={() => removeBodyParam(index)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              onClick={addBodyParam}
              className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              <Plus className="h-4 w-4" />
              Add Body Parameter
            </button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {modelToEdit ? 'Update Model' : 'Add Model'}
        </button>
      </div>
    </div>
  );
}