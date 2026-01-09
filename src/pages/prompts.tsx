'use client';

import { useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import NavigationSidebar from '@/components/sidebar/NavigationSidebar';
import { LicenseProvider } from '@/contexts/LicenseContext';
import { ApiKeysProvider } from '@/contexts/ApiKeysContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { FileText, Plus, Sparkles, Globe, Filter, Download } from 'lucide-react';
import PageTabs from '@/components/ui/page-tabs';
import { usePrompts } from '@/hooks/data/usePrompts';
import PromptCard from '@/components/prompts/PromptCard';
import PromptForm from '@/components/prompts/PromptForm';
import BuiltinPromptCard from '@/components/prompts/BuiltinPromptCard';
import PromptDetailsModal from '@/components/prompts/PromptDetailsModal';
import { BUILTIN_PROMPTS, BuiltinPrompt } from '@/lib/data/builtinPrompts';
import { Prompt } from '@/lib/db';
import toast from 'react-hot-toast';

function PromptsPageContent() {
  const [activeTab, setActiveTab] = useState<'my-prompts' | 'browse' | 'add'>('my-prompts');
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedBuiltinPrompts, setSelectedBuiltinPrompts] = useState<Set<number>>(new Set());
  const [viewingPrompt, setViewingPrompt] = useState<BuiltinPrompt | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const {
    prompts,
    starredPrompts,
    regularPrompts,
    allTags,
    addPrompt,
    updatePrompt,
    deletePrompt,
    togglePromptStar,
    duplicatePrompt,
  } = usePrompts();

  // Filter prompts by selected tag
  const filteredPrompts = useMemo(() => {
    if (!selectedTag) return prompts;
    return prompts.filter(prompt => prompt.tags.includes(selectedTag));
  }, [prompts, selectedTag]);

  const filteredStarredPrompts = useMemo(() => {
    if (!selectedTag) return starredPrompts;
    return starredPrompts.filter(prompt => prompt.tags.includes(selectedTag));
  }, [starredPrompts, selectedTag]);

  const filteredRegularPrompts = useMemo(() => {
    if (!selectedTag) return regularPrompts;
    return regularPrompts.filter(prompt => prompt.tags.includes(selectedTag));
  }, [regularPrompts, selectedTag]);

  const handleImportBuiltin = async (builtinPrompt: BuiltinPrompt) => {
    await addPrompt({
      title: builtinPrompt.title,
      description: builtinPrompt.description,
      content: builtinPrompt.content,
      tags: builtinPrompt.tags,
      isStarred: false,
    });
  };

  const handleBulkImport = async () => {
    if (selectedBuiltinPrompts.size === 0) {
      toast.error('Please select at least one prompt to import');
      return;
    }

    const promisesToImport = Array.from(selectedBuiltinPrompts).map(index => {
      const prompt = BUILTIN_PROMPTS[index];
      if (!prompt) return Promise.resolve();
      return addPrompt({
        title: prompt.title,
        description: prompt.description,
        content: prompt.content,
        tags: prompt.tags,
        isStarred: false,
      });
    });

    try {
      await Promise.all(promisesToImport);
      toast.success(`Successfully imported ${selectedBuiltinPrompts.size} prompts`);
      setSelectedBuiltinPrompts(new Set());
    } catch (error) {
      toast.error('Failed to import some prompts');
    }
  };

  const handlePromptSelection = (index: number, selected: boolean) => {
    const newSelection = new Set(selectedBuiltinPrompts);
    if (selected) {
      newSelection.add(index);
    } else {
      newSelection.delete(index);
    }
    setSelectedBuiltinPrompts(newSelection);
  };

  const handleViewDetails = (prompt: BuiltinPrompt) => {
    setViewingPrompt(prompt);
    setShowDetailsModal(true);
  };

  const handleEditPrompt = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setActiveTab('add');
  };

  const handleSavePrompt = async (promptData: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>) => {
    await addPrompt(promptData);
    setActiveTab('my-prompts');
  };

  const handleUpdatePrompt = async (id: string, updates: Partial<Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>>) => {
    await updatePrompt(id, updates);
    setEditingPrompt(null);
    setActiveTab('my-prompts');
  };

  return (
    <DashboardLayout>
      <div className="flex h-screen overflow-hidden -m-4">
        {/* Navigation Sidebar */}
        <NavigationSidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 overflow-y-auto">
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Prompt Library</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Create and manage reusable prompts for your AI conversations
              </p>
            </div>

            {/* Tabs */}
            <PageTabs
              tabs={[
                { value: 'my-prompts', label: 'My Prompts', icon: FileText, count: prompts.length },
                { value: 'browse', label: 'Browse', icon: Globe },
                { value: 'add', label: 'Add Prompt', icon: Plus }
              ]}
              activeTab={activeTab}
              onTabChange={(value) => {
                if (value === 'add') {
                  setEditingPrompt(null);
                }
                setActiveTab(value as 'my-prompts' | 'browse' | 'add');
              }}
            />

            {/* Tab Content */}
            {activeTab === 'my-prompts' && (
              <div className="space-y-6">
                {/* Tag Filter */}
                {allTags.length > 0 && (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Filter className="h-4 w-4" />
                      <span>Filter by tag:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedTag(null)}
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${
                          selectedTag === null
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        All
                      </button>
                      {allTags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setSelectedTag(tag)}
                          className={`px-3 py-1 text-sm rounded-full transition-colors ${
                            selectedTag === tag
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {filteredPrompts.length > 0 ? (
                  <>
                    {/* Starred Prompts */}
                    {filteredStarredPrompts.length > 0 && (
                      <div>
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-yellow-500" />
                          Starred Prompts
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {filteredStarredPrompts.map((prompt) => (
                            <PromptCard
                              key={prompt.id}
                              prompt={prompt}
                              onEdit={handleEditPrompt}
                              onDelete={deletePrompt}
                              onToggleStar={togglePromptStar}
                              onDuplicate={duplicatePrompt}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Regular Prompts */}
                    {filteredRegularPrompts.length > 0 && (
                      <div>
                        {filteredStarredPrompts.length > 0 && (
                          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
                            All Prompts
                          </h2>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {filteredRegularPrompts.map((prompt) => (
                            <PromptCard
                              key={prompt.id}
                              prompt={prompt}
                              onEdit={handleEditPrompt}
                              onDelete={deletePrompt}
                              onToggleStar={togglePromptStar}
                              onDuplicate={duplicatePrompt}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      {selectedTag ? 'No prompts with this tag' : 'No prompts yet'}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                      {selectedTag 
                        ? 'Try selecting a different tag or clear the filter.'
                        : 'Create your first prompt to get started or browse the built-in library.'}
                    </p>
                    {!selectedTag && (
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => setActiveTab('add')}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Create Prompt
                        </button>
                        <button
                          onClick={() => setActiveTab('browse')}
                          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 inline-flex items-center gap-2"
                        >
                          <Globe className="h-4 w-4" />
                          Browse Library
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Browse Tab */}
            {activeTab === 'browse' && (
              <div className="space-y-6">
                <div className="mb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        Built-in Prompt Templates
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Import these pre-made prompts to your personal library and customize them as needed.
                      </p>
                    </div>
                    {selectedBuiltinPrompts.size > 0 && (
                      <button
                        onClick={handleBulkImport}
                        className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Import Selected ({selectedBuiltinPrompts.size})
                      </button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {BUILTIN_PROMPTS.map((prompt, index) => (
                    <BuiltinPromptCard
                      key={index}
                      prompt={prompt}
                      onImport={handleImportBuiltin}
                      onViewDetails={handleViewDetails}
                      isSelected={selectedBuiltinPrompts.has(index)}
                      onSelectionChange={(selected) => handlePromptSelection(index, selected)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Add/Edit Prompt Tab */}
            {activeTab === 'add' && (
              <PromptForm
                promptToEdit={editingPrompt}
                onSave={handleSavePrompt}
                onUpdate={handleUpdatePrompt}
                onCancel={() => {
                  setEditingPrompt(null);
                  setActiveTab('my-prompts');
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Prompt Details Modal */}
      <PromptDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setViewingPrompt(null);
        }}
        prompt={viewingPrompt}
        onImport={handleImportBuiltin}
      />
    </DashboardLayout>
  );
}

export default function PromptsPage() {
  return (
    <LicenseProvider>
      <ApiKeysProvider>
        <SettingsProvider>
          <PromptsPageContent />
        </SettingsProvider>
      </ApiKeysProvider>
    </LicenseProvider>
  );
}