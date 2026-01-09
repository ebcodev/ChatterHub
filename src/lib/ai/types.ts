import { ModelParameters } from '@/lib/db';

export type MessageRole = 'user' | 'assistant' | 'system';

export interface TextContent {
  type: 'text';
  text: string;
}

export interface ImageContent {
  type: 'image';
  image: string; // base64 or URL
}

export type MessageContent = string | Array<TextContent | ImageContent>;

export interface AIMessage {
  role: MessageRole;
  content: MessageContent;
  id?: string;
  name?: string;
}

export interface MCPToolCall {
  id: string;
  name: string;
  arguments: string;
  serverLabel: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  result?: any;
  error?: string;
}

export interface MCPApprovalRequest {
  id: string;
  name: string;
  arguments: string;
  serverLabel: string;
}

export interface MCPApprovalResponse {
  type: 'mcp_approval_response';
  approve: boolean;
  approval_request_id: string;
}

export interface AIStreamChunk {
  content: string;
  isComplete: boolean;
  error?: AIError;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  // MCP-specific events
  toolCall?: MCPToolCall;
  approvalRequest?: MCPApprovalRequest;
  eventType?: 'text' | 'tool_call' | 'approval_request' | 'tool_result' | 'reasoning' | 'reasoning_delta' | 'reasoning_complete';
  responseId?: string; // Track response ID for chaining
  // Reasoning support for o-series and gpt-5 models
  reasoningSummary?: string;
  reasoningDelta?: string;
}

export type AIErrorCode = 
  | 'rate_limit'
  | 'auth_failed'
  | 'model_not_found'
  | 'quota_exceeded'
  | 'server_error'
  | 'timeout'
  | 'invalid_request'
  | 'network_error'
  | 'unknown';

export interface AIError {
  code: AIErrorCode;
  message: string;
  provider: string;
  isRetryable: boolean;
  retryAfter?: number; // seconds
  originalError?: any;
}

export interface AIRequest {
  model: string;
  messages: AIMessage[];
  apiKey: string;
  baseUrl?: string;
  customHeaders?: Record<string, string>;
  customBodyParams?: Record<string, any>;
  modelParams?: ModelParameters;
  signal?: AbortSignal;
  attachmentIds?: string[];
  systemPrompt?: string;
  previousResponseId?: string; // For chaining responses
  input?: Array<MCPApprovalResponse>; // For MCP approval responses
}

export interface MCPTool {
  type: 'mcp';
  server_label: string;
  server_url: string;
  require_approval: 'always' | 'auto' | 'never';
  authorization?: string; // OAuth token or API key for authentication
  allowed_tools?: string[];
  blocked_tools?: string[];
}

export interface ResponsesAPIRequest extends AIRequest {
  instructions?: string;
  tools?: Array<MCPTool | { type: string }>;
}

export interface AIAdapter {
  name: string;
  supportsStreaming: boolean;
  stream(request: AIRequest): AsyncGenerator<AIStreamChunk>;
  complete(request: AIRequest): Promise<AIMessage>;
  formatError(error: any): AIError;
}

export interface ModelConfig {
  id: string;
  name: string;
  contextWindow: number;
  provider: string;
  apiType: 'openai-chat-completions' | 'openai-responses' | 'anthropic' | 'gemini';
  baseUrl?: string;
  customHeaders?: Record<string, string>;
  customBodyParams?: Record<string, any>;
  supportsVision?: boolean;
  supportsStreaming?: boolean;
  supportsSystemRole?: boolean;
  supportedParameters?: string[];
}

export interface TestResult {
  provider: string;
  model: string;
  apiType: string;
  status: 'pass' | 'fail' | 'skip';
  responseTime: number;
  tokensUsed?: number;
  cost?: number;
  error?: string;
  response?: string;
}