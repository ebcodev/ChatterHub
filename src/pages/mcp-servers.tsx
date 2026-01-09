'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import NavigationSidebar from '@/components/sidebar/NavigationSidebar';
import { LicenseProvider } from '@/contexts/LicenseContext';
import { ApiKeysProvider } from '@/contexts/ApiKeysContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { Server, Plus, Blocks, Sparkles, Globe, Info } from 'lucide-react';
import PageTabs from '@/components/ui/page-tabs';
import { useMCPServers } from '@/hooks/data/useMCPServers';
import MCPServerForm from '@/components/mcp/MCPServerForm';
import MCPServerCard from '@/components/mcp/MCPServerCard';

function MCPServersPageContent() {
  const [activeTab, setActiveTab] = useState<'builtin' | 'custom' | 'add'>('builtin');
  const [editingServer, setEditingServer] = useState<any>(null);

  const {
    mcpServers,
    builtinServers,
    customServers,
    addMCPServer,
    updateMCPServer,
    deleteMCPServer,
    toggleMCPServerStatus
  } = useMCPServers();

  const handleAddServer = async (server: any) => {
    await addMCPServer(server);
  };

  const handleUpdateServer = async (id: string, updates: any) => {
    await updateMCPServer(id, updates);
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">MCP Servers</h1>
              <p className="text-gray-600 dark:text-gray-400">
                MCP servers enable AI models to interact with external tools and services,
                providing real-time web search, database access, API integrations, and more.
              </p>
            </div>

            {/* Tabs */}
            <PageTabs
              tabs={[
                { value: 'builtin', label: 'Built-in Servers', icon: Blocks },
                { value: 'custom', label: 'Custom Servers', icon: Sparkles, count: customServers.length },
                { value: 'add', label: 'Add Custom Server', icon: Plus }
              ]}
              activeTab={activeTab}
              onTabChange={(value) => setActiveTab(value as 'builtin' | 'custom' | 'add')}
            />

            {/* Tab Content */}
            {activeTab === 'builtin' && (
              <div className="space-y-6">
                {builtinServers.length > 0 ? (
                  <>
                    <div className="mb-4">
                      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        Pre-configured MCP Servers
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        These servers are pre-configured and ready to use. Just add your API key to the URL and activate.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {builtinServers.map((server) => (
                        <MCPServerCard
                          key={server.id}
                          server={server}
                          onEdit={() => {
                            setEditingServer(server);
                            setActiveTab('add');
                          }}
                          onDelete={() => deleteMCPServer(server.id!)}
                          onToggle={() => toggleMCPServerStatus(server.id!)}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No Built-in Servers Available
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Built-in servers will appear here once configured.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Custom Servers Tab */}
            {activeTab === 'custom' && (
              <div className="space-y-6">
                {customServers.length > 0 ? (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                        Your Custom MCP Servers
                      </h2>
                      <button
                        onClick={() => setActiveTab('add')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Server
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {customServers.map((server) => (
                        <MCPServerCard
                          key={server.id}
                          server={server}
                          onEdit={() => {
                            setEditingServer(server);
                            setActiveTab('add');
                          }}
                          onDelete={() => deleteMCPServer(server.id!)}
                          onToggle={() => toggleMCPServerStatus(server.id!)}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Server className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No Custom Servers Yet
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                      Add custom MCP servers to connect your AI to external tools and services.
                    </p>
                    <button
                      onClick={() => setActiveTab('add')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Your First Server
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Add Custom Server Tab */}
            {activeTab === 'add' && (
              <MCPServerForm
                serverToEdit={editingServer}
                onSuccess={() => {
                  setEditingServer(null);
                  setActiveTab(editingServer?.isBuiltin ? 'builtin' : 'custom');
                }}
                onCancel={() => {
                  setEditingServer(null);
                  setActiveTab(editingServer?.isBuiltin ? 'builtin' : 'custom');
                }}
                onSave={handleAddServer}
                onUpdate={handleUpdateServer}
              />
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function MCPServersPage() {
  return (
    <LicenseProvider>
      <ApiKeysProvider>
        <SettingsProvider>
          <MCPServersPageContent />
        </SettingsProvider>
      </ApiKeysProvider>
    </LicenseProvider>
  );
}