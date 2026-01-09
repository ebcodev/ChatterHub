// CLAUDE: DON'T TOUCH THIS MODELS.TS OR YOU WILL BE PUNISHED

export interface Model {
  id: string;
  name: string;
  contextWindow: number; // Changed to number for consistency
  isNew?: boolean;
  provider: 'openai' | 'anthropic' | 'gemini' | 'meta' | 'xai' | 'deepseek' | 'openrouter' | 'moonshot' | 'groq' | 'custom';
  apiType: 'openai-chat-completions' | 'openai-responses' | 'anthropic' | 'gemini';
  baseUrl?: string; // Optional base URL for custom APIs
  customModelData?: any; // Additional data for custom models
  supportsReasoningEffort?: boolean; // For o-series and gpt-5 models
  supportsMCP?: boolean; // Whether the model supports MCP servers
}

export const AVAILABLE_MODELS: Model[] = [
  // GPT-5 Series (using Responses API with MCP support)
  { id: 'gpt-5', name: 'GPT-5', contextWindow: 400000, isNew: true, provider: 'openai', apiType: 'openai-responses', supportsReasoningEffort: true, supportsMCP: true },
  { id: 'gpt-5-mini', name: 'GPT-5 Mini', contextWindow: 400000, isNew: true, provider: 'openai', apiType: 'openai-responses', supportsReasoningEffort: true, supportsMCP: true },
  { id: 'gpt-5-nano', name: 'GPT-5 Nano', contextWindow: 400000, isNew: true, provider: 'openai', apiType: 'openai-responses', supportsReasoningEffort: true, supportsMCP: true },
  { id: 'gpt-5-chat-latest', name: 'GPT-5 Chat', contextWindow: 400000, isNew: true, provider: 'openai', apiType: 'openai-responses', supportsReasoningEffort: true, supportsMCP: true },

  // Claude 4 Series (all support MCP)
  { id: 'claude-opus-4-1-20250805', name: 'Claude Opus 4.1', contextWindow: 200000, isNew: true, provider: 'anthropic', apiType: 'anthropic', supportsMCP: true },
  { id: 'claude-opus-4-20250514', name: 'Claude Opus 4', contextWindow: 200000, isNew: false, provider: 'anthropic', apiType: 'anthropic', supportsMCP: true },
  { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', contextWindow: 200000, isNew: false, provider: 'anthropic', apiType: 'anthropic', supportsMCP: true },
  { id: 'claude-3-7-sonnet-20250219', name: 'Claude 3.7 Sonnet', contextWindow: 200000, isNew: false, provider: 'anthropic', apiType: 'anthropic', supportsMCP: true },
  { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', contextWindow: 200000, isNew: false, provider: 'anthropic', apiType: 'anthropic', supportsMCP: true },
  { id: 'claude-3-5-sonnet-20240620', name: 'Claude 3.5 Sonnet (2024-06-20)', contextWindow: 200000, isNew: false, provider: 'anthropic', apiType: 'anthropic', supportsMCP: true },
  { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', contextWindow: 200000, isNew: false, provider: 'anthropic', apiType: 'anthropic', supportsMCP: true },
  { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', contextWindow: 200000, isNew: false, provider: 'anthropic', apiType: 'anthropic', supportsMCP: true },
  { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', contextWindow: 200000, isNew: false, provider: 'anthropic', apiType: 'anthropic', supportsMCP: true },

  // O-Series Models (using Responses API with MCP support)
  { id: 'o3-pro', name: 'O3 Pro', contextWindow: 200000, isNew: false, provider: 'openai', apiType: 'openai-responses', supportsReasoningEffort: true, supportsMCP: true },
  { id: 'o4-mini', name: 'O4 Mini', contextWindow: 200000, isNew: false, provider: 'openai', apiType: 'openai-responses', supportsReasoningEffort: true, supportsMCP: true },
  { id: 'o3', name: 'O3', contextWindow: 200000, isNew: false, provider: 'openai', apiType: 'openai-responses', supportsReasoningEffort: true, supportsMCP: true },
  { id: 'o3-mini', name: 'O3 Mini', contextWindow: 200000, isNew: false, provider: 'openai', apiType: 'openai-responses', supportsReasoningEffort: true, supportsMCP: true },
  { id: 'o1-pro', name: 'O1 Pro', contextWindow: 200000, isNew: false, provider: 'openai', apiType: 'openai-responses', supportsReasoningEffort: true, supportsMCP: true },
  { id: 'o1', name: 'O1', contextWindow: 200000, isNew: false, provider: 'openai', apiType: 'openai-responses', supportsReasoningEffort: true, supportsMCP: true },

  // GPT-4.1 Series (with MCP support)
  { id: 'gpt-4.1', name: 'GPT-4.1', contextWindow: 1000000, isNew: false, provider: 'openai', apiType: 'openai-responses', supportsMCP: true },
  { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini', contextWindow: 1000000, isNew: false, provider: 'openai', apiType: 'openai-responses', supportsMCP: true },
  { id: 'gpt-4.1-nano', name: 'GPT-4.1 Nano', contextWindow: 1000000, isNew: false, provider: 'openai', apiType: 'openai-responses', supportsMCP: true },

  // GPT-4o Series (with MCP support)
  { id: 'chatgpt-4o-latest', name: 'ChatGPT-4o', contextWindow: 128000, isNew: false, provider: 'openai', apiType: 'openai-responses', supportsMCP: true },
  { id: 'gpt-4o-2024-11-20', name: 'GPT-4o (2024-11-20)', contextWindow: 128000, isNew: false, provider: 'openai', apiType: 'openai-responses', supportsMCP: true },
  { id: 'gpt-4o', name: 'GPT-4o', contextWindow: 128000, isNew: false, provider: 'openai', apiType: 'openai-responses', supportsMCP: true },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', contextWindow: 128000, isNew: false, provider: 'openai', apiType: 'openai-responses', supportsMCP: true },
  { id: 'gpt-4o-search-preview', name: 'GPT-4o Search Preview', contextWindow: 128000, isNew: false, provider: 'openai', apiType: 'openai-chat-completions' }, // Not supported by responses API
  { id: 'gpt-4o-mini-search-preview', name: 'GPT-4o Mini Search Preview', contextWindow: 128000, isNew: false, provider: 'openai', apiType: 'openai-chat-completions' }, // Not supported by responses API
  { id: 'gpt-4', name: 'GPT-4', contextWindow: 8000, isNew: false, provider: 'openai', apiType: 'openai-responses', supportsMCP: true },

  // Gemini 2.5 Series
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', contextWindow: 1048576, isNew: false, provider: 'gemini', apiType: 'gemini' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', contextWindow: 1048576, isNew: false, provider: 'gemini', apiType: 'gemini' },
  { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash-Lite', contextWindow: 1048576, isNew: false, provider: 'gemini', apiType: 'gemini' },
  { id: 'gemini-2.5-flash-preview-05-20', name: 'Gemini 2.5 Flash (Preview 05-20)', contextWindow: 1048576, isNew: true, provider: 'gemini', apiType: 'gemini' },

  // Gemini 2.x Series
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', contextWindow: 1048576, isNew: false, provider: 'gemini', apiType: 'gemini' },
  { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash-Lite', contextWindow: 1048576, isNew: false, provider: 'gemini', apiType: 'gemini' },

  // Gemini 1.5 Series
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', contextWindow: 2097152, isNew: false, provider: 'gemini', apiType: 'gemini' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', contextWindow: 1048576, isNew: false, provider: 'gemini', apiType: 'gemini' },
  { id: 'gemini-1.5-flash-8b', name: 'Gemini 1.5 Flash-8B', contextWindow: 1048576, isNew: false, provider: 'gemini', apiType: 'gemini' },

  // Specialized Models
  { id: 'codex-mini-latest', name: 'Codex Mini', contextWindow: 200000, isNew: false, provider: 'openai', apiType: 'openai-responses' },

  // xAI Grok Models
  { id: 'grok-4', name: 'Grok 4', contextWindow: 256000, isNew: true, provider: 'xai', apiType: 'openai-chat-completions', baseUrl: 'https://api.x.ai/v1' },
  { id: 'grok-3', name: 'Grok 3', contextWindow: 131000, isNew: false, provider: 'xai', apiType: 'openai-chat-completions', baseUrl: 'https://api.x.ai/v1' },
  { id: 'grok-3-mini', name: 'Grok 3 Mini', contextWindow: 131000, isNew: false, provider: 'xai', apiType: 'openai-chat-completions', baseUrl: 'https://api.x.ai/v1' },

  // DeepSeek Models
  { id: 'deepseek-chat', name: 'DeepSeek Chat', contextWindow: 128000, isNew: true, provider: 'deepseek', apiType: 'openai-chat-completions', baseUrl: 'https://api.deepseek.com/v1' },
  { id: 'deepseek-reasoner', name: 'DeepSeek Reasoner', contextWindow: 128000, isNew: true, provider: 'deepseek', apiType: 'openai-chat-completions', baseUrl: 'https://api.deepseek.com/v1' },

  // Moonshot (Kimi) Models
  { id: 'kimi-k2-0711-preview', name: 'Kimi K2', contextWindow: 128000, isNew: true, provider: 'moonshot', apiType: 'openai-chat-completions', baseUrl: 'https://api.moonshot.ai/v1' },

  // Groq Models - Featured (GPT-OSS)
  { id: 'openai/gpt-oss-120b', name: 'GPT-OSS 120B', contextWindow: 131072, isNew: true, provider: 'groq', apiType: 'openai-chat-completions', baseUrl: 'https://api.groq.com/openai/v1' },
  { id: 'openai/gpt-oss-20b', name: 'GPT-OSS 20B', contextWindow: 131072, isNew: true, provider: 'groq', apiType: 'openai-chat-completions', baseUrl: 'https://api.groq.com/openai/v1' },

  // Groq Models - Production (Llama)
  { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant', contextWindow: 131072, provider: 'groq', apiType: 'openai-chat-completions', baseUrl: 'https://api.groq.com/openai/v1' },
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile', contextWindow: 131072, isNew: true, provider: 'groq', apiType: 'openai-chat-completions', baseUrl: 'https://api.groq.com/openai/v1' },

  // Groq Models - Preview (New Llama 4 Series)
  { id: 'meta-llama/llama-4-maverick-17b-128e-instruct', name: 'Llama 4 Maverick 17B', contextWindow: 131072, isNew: true, provider: 'groq', apiType: 'openai-chat-completions', baseUrl: 'https://api.groq.com/openai/v1' },
  { id: 'meta-llama/llama-4-scout-17b-16e-instruct', name: 'Llama 4 Scout 17B', contextWindow: 131072, isNew: true, provider: 'groq', apiType: 'openai-chat-completions', baseUrl: 'https://api.groq.com/openai/v1' },

  // Groq Models - Kimi K2 (from Moonshot AI via Groq)
  { id: 'moonshotai/kimi-k2-instruct', name: 'Kimi K2 Instruct (Groq)', contextWindow: 131072, isNew: true, provider: 'groq', apiType: 'openai-chat-completions', baseUrl: 'https://api.groq.com/openai/v1' },

  // Groq Models - Qwen
  { id: 'qwen/qwen3-32b', name: 'Qwen 3 32B', contextWindow: 131072, provider: 'groq', apiType: 'openai-chat-completions', baseUrl: 'https://api.groq.com/openai/v1' },

  // Groq Systems - Compound (Agentic)
  { id: 'compound-beta', name: 'Compound Beta (System)', contextWindow: 131072, isNew: true, provider: 'groq', apiType: 'openai-chat-completions', baseUrl: 'https://api.groq.com/openai/v1' },
  { id: 'compound-beta-mini', name: 'Compound Beta Mini (System)', contextWindow: 131072, isNew: true, provider: 'groq', apiType: 'openai-chat-completions', baseUrl: 'https://api.groq.com/openai/v1' },
];

export function getProviderLogo(provider: string): string {
  switch (provider) {
    case 'openai':
      return '/logos/openai.png';
    case 'anthropic':
      return '/logos/anthropic.png';
    case 'gemini':
      return '/logos/gemini.jpeg';
    case 'xai':
      return '/logos/xai.png';
    case 'deepseek':
      return '/logos/deepseek.png';
    case 'openrouter':
      return '/logos/openrouter.png'; // You may want to add this logo
    case 'moonshot':
      return '/logos/moonshot.png';
    case 'groq':
      return '/logos/groq.png';
    default:
      return '';
  }
}

// Merge custom models with built-in models
export function getAllModels(customModels: any[]): Model[] {
  const activeCustomModels = customModels
    .filter(m => m.isActive)
    .map(m => ({
      id: m.modelId,
      name: m.name,
      contextWindow: m.contextWindow || 0, // Use the number directly, default to 0 if not set
      provider: m.provider as any,
      apiType: m.apiType as 'openai-chat-completions' | 'openai-responses' | 'anthropic' | 'gemini',
      baseUrl: m.baseUrl,
      // Store additional custom model data for use in chat handler
      customModelData: m,
    }));

  return [...AVAILABLE_MODELS, ...activeCustomModels];
}