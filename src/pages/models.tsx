'use client';

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import DashboardLayout from '@/components/layout/DashboardLayout';
import NavigationSidebar from '@/components/sidebar/NavigationSidebar';
import { LicenseProvider } from '@/contexts/LicenseContext';
import { ApiKeysProvider } from '@/contexts/ApiKeysContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { Modal } from '@/components/ui/modal';
import { Settings, RefreshCw, Sliders, Brain, X, Plus, Blocks, Globe, Sparkles } from 'lucide-react';
import PageTabs from '@/components/ui/page-tabs';
import { db, ModelParameters } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { AVAILABLE_MODELS, getProviderLogo } from '@/lib/models';
import Image from 'next/image';
import toast from 'react-hot-toast';
import CustomModelForm from '@/components/models/CustomModelForm';
import CustomModelCard from '@/components/models/CustomModelCard';
import OpenRouterBrowser from '@/components/models/OpenRouterBrowser';
import { useCustomModels } from '@/hooks/data/useCustomModels';
import { formatContextWindow } from '@/lib/utils';

function ModelsPageContent() {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [temperature, setTemperature] = useState<number | null>(null);
  const [presencePenalty, setPresencePenalty] = useState<number | null>(null);
  const [frequencyPenalty, setFrequencyPenalty] = useState<number | null>(null);
  const [topP, setTopP] = useState<number | null>(null);
  const [maxTokens, setMaxTokens] = useState<number | null>(null);
  const [reasoningEffort, setReasoningEffort] = useState<'low' | 'medium' | 'high' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'builtin' | 'custom' | 'add' | 'openrouter'>('builtin');
  const [editingModel, setEditingModel] = useState<any>(null);
  
  const { customModels } = useCustomModels();

  // Load all model parameters from database
  const modelParameters = useLiveQuery(() => db.modelParameters.toArray()) || [];

  // Get parameters for selected model
  const currentModelParams = modelParameters.find(p => p.modelId === selectedModel);

  // Load parameters when model is selected
  useEffect(() => {
    if (selectedModel && currentModelParams) {
      setTemperature(currentModelParams.temperature ?? null);
      setPresencePenalty(currentModelParams.presencePenalty ?? null);
      setFrequencyPenalty(currentModelParams.frequencyPenalty ?? null);
      setTopP(currentModelParams.topP ?? null);
      setMaxTokens(currentModelParams.maxTokens ?? null);
      setReasoningEffort(currentModelParams.reasoningEffort ?? null);
    } else {
      // Reset to null (defaults)
      setTemperature(null);
      setPresencePenalty(null);
      setFrequencyPenalty(null);
      setTopP(null);
      setMaxTokens(null);
      setReasoningEffort(null);
    }
  }, [selectedModel, currentModelParams]);

  const handleSaveParameters = async () => {
    if (!selectedModel) return;

    try {
      const params: ModelParameters = {
        id: currentModelParams?.id || uuidv4(),
        modelId: selectedModel,
        temperature,
        presencePenalty,
        frequencyPenalty,
        topP,
        maxTokens,
        reasoningEffort,
        createdAt: currentModelParams?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      if (currentModelParams) {
        await db.modelParameters.update(currentModelParams.id!, params);
      } else {
        await db.modelParameters.add(params);
      }

      toast.success('Model parameters saved');
      setShowSettings(false);
    } catch (error) {
      toast.error('Failed to save parameters');
      console.error(error);
    }
  };

  const handleResetParameters = () => {
    setTemperature(null);
    setPresencePenalty(null);
    setFrequencyPenalty(null);
    setTopP(null);
    setMaxTokens(null);
    setReasoningEffort(null);
  };

  const handleDeleteParameters = async () => {
    if (!currentModelParams) return;

    try {
      await db.modelParameters.delete(currentModelParams.id!);
      toast.success('Model parameters reset to defaults');
      setShowSettings(false);
    } catch (error) {
      toast.error('Failed to delete parameters');
      console.error(error);
    }
  };

  // Filter models based on search
  const filteredModels = AVAILABLE_MODELS.filter(model =>
    model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    model.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    model.provider.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group models by provider
  const modelsByProvider = filteredModels.reduce((acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider]!.push(model);
    return acc;
  }, {} as Record<string, typeof AVAILABLE_MODELS>);

  const selectedModelInfo = AVAILABLE_MODELS.find(m => m.id === selectedModel);
  const isO1Model = selectedModel?.startsWith('o1') || selectedModel?.startsWith('o3');

  return (
    <DashboardLayout>
      <div className="flex h-screen overflow-hidden -m-4">
        {/* Navigation Sidebar */}
        <NavigationSidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 overflow-y-auto">
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Model Settings</h1>
              <p className="text-gray-600 dark:text-gray-400">Configure parameters for each AI model</p>
            </div>

            {/* Tabs */}
            <PageTabs
              tabs={[
                { value: 'builtin', label: 'Built-in Models', icon: Blocks },
                { value: 'openrouter', label: 'OpenRouter Models', icon: Globe },
                { value: 'custom', label: 'Custom Models', icon: Sparkles, count: customModels.length },
                { value: 'add', label: 'Add Custom Model', icon: Plus }
              ]}
              activeTab={activeTab}
              onTabChange={(value) => setActiveTab(value as 'builtin' | 'custom' | 'add' | 'openrouter')}
            />

            {/* Tab Content */}
            {activeTab === 'builtin' && (
              <>
                {/* Search Bar */}
                <div className="mb-6">
                  <input
                    type="text"
                    placeholder="Search models..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Models Grid */}
                <div className="space-y-8">
              {Object.entries(modelsByProvider).map(([provider, models]) => (
                <div key={provider}>
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 capitalize flex items-center gap-2">
                    {getProviderLogo(provider) && (
                      <Image
                        src={getProviderLogo(provider)}
                        alt={provider}
                        width={24}
                        height={24}
                        className="rounded"
                      />
                    )}
                    {provider === 'openai' ? 'OpenAI' : provider}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {models.map((model) => {
                      const hasCustomParams = modelParameters.some(p => p.modelId === model.id);
                      return (
                        <div
                          key={model.id}
                          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                                {model.name}
                              </h3>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {formatContextWindow(model.contextWindow)}
                              </p>
                            </div>
                            {model.isNew && (
                              <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                                New
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            {hasCustomParams && (
                              <span className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                <Sliders className="h-3 w-3" />
                                Customized
                              </span>
                            )}
                            <button
                              onClick={() => {
                                setSelectedModel(model.id);
                                setShowSettings(true);
                              }}
                              className="ml-auto text-xs px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
                            >
                              <Settings className="h-3 w-3" />
                              Configure
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                ))}
              </div>
            </>
          )}

          {/* Custom Models Tab */}
          {activeTab === 'custom' && (
            <div className="space-y-6">
              {customModels.length > 0 ? (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                      Your Custom Models
                    </h2>
                    <button
                      onClick={() => setActiveTab('add')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Model
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {customModels.map((model) => (
                      <CustomModelCard
                        key={model.id}
                        model={model}
                        onEdit={() => {
                          setEditingModel(model);
                          setActiveTab('add');
                        }}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Custom Models Yet
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                    Add custom models to use local LLMs or other AI providers with ChatterHub.
                  </p>
                  <button
                    onClick={() => setActiveTab('add')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Your First Model
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Add Custom Model Tab */}
          {activeTab === 'add' && (
            <CustomModelForm
              modelToEdit={editingModel}
              onSuccess={() => {
                setEditingModel(null);
                setActiveTab('custom');
              }}
              onCancel={() => {
                setEditingModel(null);
                setActiveTab('custom');
              }}
            />
          )}

          {/* OpenRouter Tab */}
          {activeTab === 'openrouter' && (
            <OpenRouterBrowser />
          )}
        </div>

          {/* Model Settings Modal */}
          <Modal isOpen={showSettings && !!selectedModelInfo} onClose={() => setShowSettings(false)} className="p-4">
            {selectedModelInfo && (
              <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {selectedModelInfo.name} Settings
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Configure model parameters. Leave empty to use defaults.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowSettings(false)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                      <X className="h-5 w-5 text-gray-500" />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Temperature */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Temperature
                      </label>
                      <span className="text-sm text-gray-500">
                        {temperature !== null ? temperature.toFixed(1) : 'DEFAULT'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={temperature || 0.7}
                      onChange={(e) => setTemperature(parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Higher values make output more random, lower values more focused and deterministic
                    </p>
                  </div>

                  {/* Presence Penalty */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Presence Penalty
                      </label>
                      <span className="text-sm text-gray-500">
                        {presencePenalty !== null ? presencePenalty.toFixed(1) : 'DEFAULT'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-2"
                      max="2"
                      step="0.1"
                      value={presencePenalty || 0}
                      onChange={(e) => setPresencePenalty(parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Penalizes new tokens based on whether they appear in the text so far
                    </p>
                  </div>

                  {/* Frequency Penalty */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Frequency Penalty
                      </label>
                      <span className="text-sm text-gray-500">
                        {frequencyPenalty !== null ? frequencyPenalty.toFixed(1) : 'DEFAULT'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-2"
                      max="2"
                      step="0.1"
                      value={frequencyPenalty || 0}
                      onChange={(e) => setFrequencyPenalty(parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Penalizes new tokens based on their frequency in the text so far
                    </p>
                  </div>

                  {/* Top P */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Top P
                      </label>
                      <span className="text-sm text-gray-500">
                        {topP !== null ? topP.toFixed(2) : 'DEFAULT'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={topP || 1}
                      onChange={(e) => setTopP(parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Nucleus sampling: model considers tokens with top_p probability mass
                    </p>
                  </div>

                  {/* Max Tokens */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Max Tokens
                      </label>
                    </div>
                    <input
                      type="number"
                      min="1"
                      max="32000"
                      value={maxTokens || ''}
                      onChange={(e) => setMaxTokens(e.target.value ? parseInt(e.target.value) : null)}
                      placeholder="DEFAULT"
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Maximum number of tokens to generate
                    </p>
                  </div>

                  {/* Reasoning Effort (O1 models only) */}
                  {isO1Model && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Reasoning Effort
                        </label>
                        {reasoningEffort !== null && (
                          <button
                            onClick={() => setReasoningEffort(null)}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            Reset to default
                          </button>
                        )}
                      </div>
                      <select
                        value={reasoningEffort || ''}
                        onChange={(e) => setReasoningEffort(e.target.value as 'low' | 'medium' | 'high' | null || null)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg"
                      >
                        <option value="">DEFAULT</option>
                        <option value="low">Low (25% tokens)</option>
                        <option value="medium">Medium (50% tokens)</option>
                        <option value="high">High (100% tokens)</option>
                      </select>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Constrains effort on reasoning for reasoning models
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <div className="flex gap-2">
                    <button
                      onClick={handleResetParameters}
                      className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Reset to Defaults
                    </button>
                    {currentModelParams && (
                      <button
                        onClick={handleDeleteParameters}
                        className="px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        Delete Custom Settings
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowSettings(false)}
                      className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveParameters}
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Save Settings
                    </button>
                  </div>
                </div>
              </div>
            )}
          </Modal>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function ModelsPage() {
  return (
    <LicenseProvider>
      <ApiKeysProvider>
        <SettingsProvider>
          <ModelsPageContent />
        </SettingsProvider>
      </ApiKeysProvider>
    </LicenseProvider>
  );
}