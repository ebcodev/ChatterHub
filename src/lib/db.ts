import Dexie, { Table } from 'dexie';

export interface Folder {
  id?: string; // UUID string
  name: string;
  parentId: string | null; // null for root folders, UUID string otherwise
  order: number; // for sorting
  color?: string; // Tailwind color class
  systemPrompt?: string; // System prompt for all chat groups in this folder
  isPinned?: boolean; // Whether this folder is pinned to the top
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatGroup {
  id?: string; // UUID string
  title: string;
  layout: 'vertical' | 'horizontal' | '2x2' | '2x3' | '3x3' | 'freeform'; // Layout type for chat windows
  folderId: string | null; // null if in root, otherwise folder UUID
  order: number; // for sorting
  systemPrompt?: string; // System prompt for this chat group (overrides folder prompt)
  isTemporary?: boolean; // Whether this chat is temporary/privacy mode
  isPinned?: boolean; // Whether this chat group is pinned to the top
  draftInput?: string; // Draft message that hasn't been sent yet
  createdAt: Date;
  updatedAt: Date;
  lastActivityAt?: Date; // Last activity timestamp
}

export interface Chat {
  id?: string; // UUID string
  chatGroupId: string; // References ChatGroup UUID
  model: string;
  position: number; // Position in the layout (0-7)
  isActive: boolean; // Whether this chat receives input
  // Freeform position data
  x?: number; // X position in pixels
  y?: number; // Y position in pixels
  width?: number; // Width in pixels
  height?: number; // Height in pixels
  zIndex?: number; // Z-index for layering (higher values appear on top)
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id?: string; // UUID string
  chatId: string; // References Chat UUID
  chatGroupId: string; // References ChatGroup for navigation
  role: 'user' | 'assistant' | 'system';
  content: string;
  model: string; // Model used to generate this message
  starred?: boolean; // Whether this message is starred
  toolCalls?: Array<{
    id: string;
    name: string;
    arguments: string;
    serverLabel: string;
    result?: any;
    error?: string;
  }>; // MCP tool calls made during this message
  parentMessageId?: string; // Links to the original message being retried
  retryAttempt?: number; // Which attempt (0 = original, 1+ = retries)
  isActiveVersion?: boolean; // Which version is currently shown (default true)
  siblingMessageIds?: string[]; // Array of all retry attempt IDs for quick navigation
  reasoningSummary?: string; // Reasoning process for o-series and gpt-5 models
  createdAt: Date;
}

export interface ModelParameters {
  id?: string; // UUID string
  modelId: string; // References model ID from models.ts
  temperature?: number | null; // 0-2, null for default
  presencePenalty?: number | null; // -2 to 2, null for default
  frequencyPenalty?: number | null; // -2 to 2, null for default
  topP?: number | null; // 0-1, null for default
  maxTokens?: number | null; // Max tokens to generate, null for default
  reasoningEffort?: 'low' | 'medium' | 'high' | null; // For O1 models, null for default
  createdAt: Date;
  updatedAt: Date;
}

export interface ImageAttachment {
  id?: string; // UUID string
  messageId: string; // References Message UUID
  chatGroupId: string; // References ChatGroup for easier querying
  filename: string; // Original filename
  mimeType: string; // MIME type (image/jpeg, image/png, etc.)
  data: Blob; // Actual image data
  width?: number; // Image dimensions
  height?: number;
  size: number; // File size in bytes
  createdAt: Date;
}

export interface CustomModel {
  id?: string; // UUID string
  name: string; // Display name
  modelId: string; // Model identifier for API calls
  provider: 'openrouter' | 'custom'; // Provider type
  apiType: 'openai-chat-completions' | 'openai-responses' | 'anthropic' | 'gemini'; // API type
  baseUrl: string; // Base URL for API
  iconUrl?: string; // Optional icon URL
  contextWindow: number; // Context window size
  inputPricing?: number; // Price per 1M input tokens
  outputPricing?: number; // Price per 1M output tokens
  // Model capabilities
  supportsPlugins?: boolean;
  supportsVision?: boolean;
  supportsSystemRole?: boolean;
  supportsStreaming?: boolean;
  // Supported parameters
  supportedParameters?: string[]; // Array of parameter names
  // Advanced configuration
  customHeaders?: Record<string, string>; // Custom HTTP headers (including API keys)
  customBodyParams?: Record<string, any>; // Custom body parameters
  isActive: boolean; // Whether the model is active
  createdAt: Date;
  updatedAt: Date;
}

export interface MCPTool {
  name: string;
  description?: string;
  input_schema?: {
    type: string;
    properties?: Record<string, any>;
    required?: string[];
    additionalProperties?: boolean;
  };
}

export interface MCPServer {
  id?: string; // UUID string
  name: string; // Display name
  serverUrl: string; // Server URL (e.g., https://mcp.tavily.com/mcp/?tavilyApiKey=xxx)
  serverLabel: string; // Label for the server in API calls
  description?: string; // Optional description
  requireApproval: 'always' | 'never'; // Tool approval setting (removed 'auto' as it doesn't work)
  customHeaders?: Record<string, string>; // Custom HTTP headers if needed
  isActive: boolean; // Whether the server is active
  isBuiltin: boolean; // Whether this is a pre-built server
  allowedTools?: string[]; // List of allowed tool names (if empty/undefined, all tools allowed)
  availableTools?: MCPTool[]; // Cached list of available tools from server
  toolsLastFetched?: Date; // When tools were last fetched
  authorizationToken?: string; // OAuth token if needed
  createdAt: Date;
  updatedAt: Date;
}

export interface Prompt {
  id?: string; // UUID string
  title: string; // Display title
  description: string; // Brief description of what the prompt does
  content: string; // The actual prompt content
  tags: string[]; // Array of tags for categorization
  isStarred: boolean; // Whether this prompt is starred/favorited
  createdAt: Date;
  updatedAt: Date;
}

export class ChatterHubDB extends Dexie {
  folders!: Table<Folder>;
  chatGroups!: Table<ChatGroup>;
  chats!: Table<Chat>;
  messages!: Table<Message>;
  modelParameters!: Table<ModelParameters>;
  imageAttachments!: Table<ImageAttachment>;
  customModels!: Table<CustomModel>;
  mcpServers!: Table<MCPServer>;
  prompts!: Table<Prompt>;

  constructor() {
    super('ChatterHubDB');

    this.version(1).stores({
      folders: 'id, name, parentId, order, color, systemPrompt, createdAt, updatedAt',
      chatGroups: 'id, title, layout, folderId, order, systemPrompt, isTemporary, lastActivityAt, isPinned, createdAt, updatedAt',
      chats: 'id, chatGroupId, model, position, isActive, x, y, width, height, zIndex, createdAt, updatedAt',
      messages: 'id, chatId, chatGroupId, role, model, starred, createdAt',
      modelParameters: 'id, modelId, temperature, presencePenalty, frequencyPenalty, topP, maxTokens, reasoningEffort, createdAt, updatedAt',
      imageAttachments: 'id, messageId, chatGroupId, filename, mimeType, size, createdAt',
    });

    this.version(2).stores({
      customModels: 'id, name, modelId, provider, apiType, baseUrl, isActive, createdAt, updatedAt',
    });

    this.version(3).stores({
      folders: 'id, name, parentId, order, color, systemPrompt, isPinned, createdAt, updatedAt',
    });

    this.version(4).stores({
      mcpServers: 'id, name, serverLabel, isActive, isBuiltin, createdAt, updatedAt',
    });

    this.version(5).stores({
      messages: 'id, chatId, chatGroupId, role, model, starred, toolCalls, createdAt',
    });

    this.version(6).stores({
      messages: 'id, chatId, chatGroupId, role, model, starred, toolCalls, parentMessageId, retryAttempt, isActiveVersion, createdAt',
    });

    this.version(7).stores({
      mcpServers: 'id, name, serverLabel, isActive, isBuiltin, createdAt, updatedAt',
    }).upgrade(async tx => {
      // Migrate existing servers to remove 'auto' approval
      const servers = await tx.table('mcpServers').toArray();
      for (const server of servers) {
        if (server.requireApproval === 'auto') {
          await tx.table('mcpServers').update(server.id, { requireApproval: 'never' });
        }
      }
    });

    this.version(8).stores({
      prompts: 'id, title, isStarred, createdAt, updatedAt',
    });

    this.version(9).stores({
      chatGroups: 'id, title, layout, folderId, order, systemPrompt, isTemporary, lastActivityAt, isPinned, draftInput, createdAt, updatedAt',
    });
  }
}

export const db = new ChatterHubDB();