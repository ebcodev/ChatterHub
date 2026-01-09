import { useState, useEffect } from 'react';
import { MCPServer, MCPTool } from '@/lib/db';
import { Save, X, Server, Key, Shield, RefreshCw, CheckSquare, Square, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchMCPServerTools, validateMCPServerUrl } from '@/lib/utils/mcp-tools';

interface MCPServerFormProps {
  serverToEdit?: MCPServer | null;
  onSuccess: () => void;
  onCancel: () => void;
  onSave: (server: Omit<MCPServer, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdate?: (id: string, updates: Partial<Omit<MCPServer, 'id' | 'createdAt' | 'isBuiltin'>>) => Promise<void>;
}

export default function MCPServerForm({
  serverToEdit,
  onSuccess,
  onCancel,
  onSave,
  onUpdate
}: MCPServerFormProps) {
  const [name, setName] = useState('');
  const [serverUrl, setServerUrl] = useState('');
  const [serverLabel, setServerLabel] = useState('');
  const [description, setDescription] = useState('');
  const [requireApproval, setRequireApproval] = useState<'always' | 'never'>('never');
  const [customHeaders, setCustomHeaders] = useState<string>('');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [authorizationToken, setAuthorizationToken] = useState('');
  const [availableTools, setAvailableTools] = useState<MCPTool[]>([]);
  const [allowedTools, setAllowedTools] = useState<string[]>([]);
  const [loadingTools, setLoadingTools] = useState(false);
  const [toolsError, setToolsError] = useState<string | null>(null);

  useEffect(() => {
    if (serverToEdit) {
      setName(serverToEdit.name);
      setServerUrl(serverToEdit.serverUrl);
      setServerLabel(serverToEdit.serverLabel);
      setDescription(serverToEdit.description || '');
      setRequireApproval(serverToEdit.requireApproval);
      setCustomHeaders(serverToEdit.customHeaders ? JSON.stringify(serverToEdit.customHeaders, null, 2) : '');
      setIsActive(serverToEdit.isActive);
      setAuthorizationToken(serverToEdit.authorizationToken || '');
      setAvailableTools(serverToEdit.availableTools || []);
      setAllowedTools(serverToEdit.allowedTools || []);
    }
  }, [serverToEdit]);

  const handleLoadTools = async () => {
    if (!serverUrl) {
      toast.error('Please enter a server URL first');
      return;
    }

    if (!validateMCPServerUrl(serverUrl)) {
      toast.error('Invalid server URL');
      return;
    }

    setLoadingTools(true);
    setToolsError(null);

    try {
      const tools = await fetchMCPServerTools(serverUrl, authorizationToken);
      setAvailableTools(tools);
      toast.success(`Loaded ${tools.length} tools from server`);
    } catch (error: any) {
      console.error('Failed to load tools:', error);
      const errorMessage = error.message || 'Failed to load tools from server';
      setToolsError(errorMessage);
      // Display the specific error message to the user
      toast.error(errorMessage);
    } finally {
      setLoadingTools(false);
    }
  };

  const handleToggleTool = (toolName: string) => {
    setAllowedTools(prev => {
      if (prev.includes(toolName)) {
        return prev.filter(t => t !== toolName);
      } else {
        return [...prev, toolName];
      }
    });
  };

  const handleSelectAll = () => {
    setAllowedTools(availableTools.map(t => t.name));
  };

  const handleDeselectAll = () => {
    setAllowedTools([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !serverUrl || !serverLabel) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate custom headers JSON
    let parsedHeaders: Record<string, string> | undefined;
    if (customHeaders) {
      try {
        parsedHeaders = JSON.parse(customHeaders);
      } catch (error) {
        toast.error('Invalid JSON in custom headers');
        return;
      }
    }

    setSaving(true);

    try {
      if (serverToEdit && onUpdate) {
        await onUpdate(serverToEdit.id!, {
          name,
          serverUrl,
          serverLabel,
          description,
          requireApproval,
          customHeaders: parsedHeaders,
          isActive,
          authorizationToken: authorizationToken || undefined,
          allowedTools: allowedTools.length > 0 ? allowedTools : undefined,
          availableTools: availableTools.length > 0 ? availableTools : undefined,
        });
        toast.success('MCP server updated successfully');
      } else {
        await onSave({
          name,
          serverUrl,
          serverLabel,
          description,
          requireApproval,
          customHeaders: parsedHeaders,
          isActive,
          isBuiltin: false,
          authorizationToken: authorizationToken || undefined,
          allowedTools: allowedTools.length > 0 ? allowedTools : undefined,
          availableTools: availableTools.length > 0 ? availableTools : undefined,
        });
        toast.success('MCP server added successfully');
      }
      onSuccess();
    } catch (error) {
      toast.error('Failed to save MCP server');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const isBuiltin = serverToEdit?.isBuiltin;

  return (
    <div className="max-w-4xl">
      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Server Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isBuiltin}
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            placeholder="e.g., Tavily Search"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Display name for your reference
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Server Label *
          </label>
          <input
            type="text"
            value={serverLabel}
            onChange={(e) => setServerLabel(e.target.value)}
            disabled={isBuiltin}
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            placeholder="e.g., tavily"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Used in API calls to identify the server
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Server URL *
        </label>
        <input
          type="url"
          value={serverUrl}
          onChange={(e) => setServerUrl(e.target.value)}
          className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., https://mcp.tavily.com/"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Include API keys in the URL if required. Note: Server must support CORS for browser access.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isBuiltin}
          className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          rows={3}
          placeholder="Brief description of what this MCP server does..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Tool Approval
        </label>
        <select
          value={requireApproval}
          onChange={(e) => setRequireApproval(e.target.value as 'always' | 'never')}
          className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="never">Never (Automatic approval)</option>
          <option value="always">Always (Manual approval)</option>
        </select>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Controls when the AI needs approval to use tools. Note: Tool approval currently only works with OpenAI models.
        </p>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Available Tools
          </label>
          <div className="group relative">
            <Info className="h-4 w-4 text-gray-400 dark:text-gray-500 cursor-help" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 w-64 z-10">
              <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45"></div>
              To fetch tools and avoid CORS issues, we use a built-in proxy endpoint. Your request is securely forwarded to the MCP server through your own application.
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleLoadTools}
            disabled={loadingTools || !serverUrl}
            className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loadingTools ? 'animate-spin' : ''}`} />
            {loadingTools ? 'Loading Tools...' : 'Load Available Tools'}
          </button>
          
          {toolsError && (
            <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
              {toolsError}
            </div>
          )}

          {availableTools.length > 0 && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Select tools to allow ({allowedTools.length}/{availableTools.length} selected)
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={handleDeselectAll}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Deselect All
                  </button>
                </div>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {availableTools.map((tool) => (
                  <div
                    key={tool.name}
                    className="flex items-start gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded cursor-pointer"
                    onClick={() => handleToggleTool(tool.name)}
                  >
                    {allowedTools.includes(tool.name) ? (
                      <CheckSquare className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                    ) : (
                      <Square className="h-4 w-4 text-gray-400 dark:text-gray-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-900 dark:text-white">
                        {tool.name}
                      </div>
                      {tool.description && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {tool.description}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {allowedTools.length === 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  If no tools are selected, all tools will be allowed by default
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Authorization Token (Optional)
        </label>
        <input
          type="password"
          value={authorizationToken}
          onChange={(e) => setAuthorizationToken(e.target.value)}
          className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Bearer YOUR_TOKEN or OAuth token"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          OAuth/Bearer token for authenticated MCP servers
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Custom Headers (JSON)
        </label>
        <textarea
          value={customHeaders}
          onChange={(e) => setCustomHeaders(e.target.value)}
          className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          rows={4}
          placeholder='{"Authorization": "Bearer YOUR_TOKEN"}'
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Optional HTTP headers to send with requests
        </p>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Server is active
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : (serverToEdit ? 'Update Server' : 'Add Server')}
        </button>
      </div>
    </form>
    </div>
  );
}