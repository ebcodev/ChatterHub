'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import NavigationSidebar from '@/components/sidebar/NavigationSidebar';
import { LicenseProvider } from '@/contexts/LicenseContext';
import { ApiKeysProvider, useApiKeys } from '@/contexts/ApiKeysContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { Key, Info, Mic, FileUp, Settings as SettingsIcon } from 'lucide-react';
import PageTabs from '@/components/ui/page-tabs';
import ApiKeysTab from '@/components/settings/ApiKeysTab';
import SpeechTab from '@/components/settings/SpeechTab';
import AboutTab from '@/components/settings/AboutTab';
import ImportExportTab from '@/components/settings/ImportExportTab';
import AdvancedTab from '@/components/settings/AdvancedTab';

function SettingsPageContent() {
  const [activeTab, setActiveTab] = useState<'apis' | 'speech' | 'import' | 'advanced' | 'about'>('apis');
  const {
    openAIKey,
    anthropicKey,
    geminiKey,
    xaiKey,
    deepseekKey,
    openRouterKey,
    moonshotKey,
    groqKey,
    setOpenAIKey,
    setAnthropicKey,
    setGeminiKey,
    setXaiKey,
    setDeepseekKey,
    setOpenRouterKey,
    setMoonshotKey,
    setGroqKey
  } = useApiKeys();

  const tabs = [
    { value: 'apis', label: 'API Keys', icon: Key },
    { value: 'speech', label: 'Speech', icon: Mic },
    { value: 'import', label: 'Import/Export', icon: FileUp },
    { value: 'advanced', label: 'Advanced', icon: SettingsIcon },
    { value: 'about', label: 'About', icon: Info }
  ];

  return (
    <DashboardLayout>
      <div className="flex h-screen overflow-hidden -m-4">
        {/* Navigation Sidebar */}
        <NavigationSidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 overflow-y-auto">
          <div className="p-6">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your API keys, preferences, and application settings
              </p>
            </div>

            {/* Tabs */}
            <div className="mb-6">
              <PageTabs
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={(value) => setActiveTab(value as 'apis' | 'speech' | 'import' | 'advanced' | 'about')}
              />
            </div>

            {/* Content Area */}
            <div className="max-w-4xl">
              {activeTab === 'apis' && (
                <ApiKeysTab
                  openAIKey={openAIKey}
                  anthropicKey={anthropicKey}
                  geminiKey={geminiKey}
                  xaiKey={xaiKey}
                  deepseekKey={deepseekKey}
                  openRouterKey={openRouterKey}
                  moonshotKey={moonshotKey}
                  groqKey={groqKey}
                  setOpenAIKey={setOpenAIKey}
                  setAnthropicKey={setAnthropicKey}
                  setGeminiKey={setGeminiKey}
                  setXaiKey={setXaiKey}
                  setDeepseekKey={setDeepseekKey}
                  setOpenRouterKey={setOpenRouterKey}
                  setMoonshotKey={setMoonshotKey}
                  setGroqKey={setGroqKey}
                />
              )}
              {activeTab === 'speech' && <SpeechTab />}
              {activeTab === 'import' && <ImportExportTab />}
              {activeTab === 'advanced' && <AdvancedTab />}
              {activeTab === 'about' && <AboutTab />}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function SettingsPage() {
  return (
    <LicenseProvider>
      <ApiKeysProvider>
        <SettingsProvider>
          <SettingsPageContent />
        </SettingsProvider>
      </ApiKeysProvider>
    </LicenseProvider>
  );
}