export interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  pricing: {
    prompt: string; // Price per token for prompts
    completion: string; // Price per token for completions
    request?: string; // Price per request (if applicable)
    image?: string; // Price per image (for multimodal models)
    audio?: string; // Price per audio (for audio models)
    web_search?: string; // Price per web search
    internal_reasoning?: string; // Price for reasoning tokens
    input_cache_read?: string; // Price for cached input
  };
  context_length: number;
  architecture?: {
    modality?: string;
    tokenizer?: string;
    instruct_type?: string;
    input_modalities?: string[]; // e.g., ["text", "image", "audio"]
    output_modalities?: string[]; // e.g., ["text"]
  };
  top_provider?: {
    context_length?: number;
    max_completion_tokens?: number;
    is_moderated?: boolean;
  };
  per_request_limits?: {
    prompt_tokens?: string;
    completion_tokens?: string;
  };
  supported_parameters?: string[]; // List of supported parameters from OpenRouter
}

export interface OpenRouterModelsResponse {
  data: OpenRouterModel[];
}

export class OpenRouterService {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getAvailableModels(): Promise<OpenRouterModel[]> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.statusText}`);
      }

      const data: OpenRouterModelsResponse = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching OpenRouter models:', error);
      throw error;
    }
  }

  // Format pricing for display (convert to per million tokens)
  formatPricing(price: string): number {
    // OpenRouter prices are typically per token, convert to per million
    const pricePerToken = parseFloat(price);
    return pricePerToken * 1000000;
  }

  // Filter models by search query with prioritization
  filterModels(models: OpenRouterModel[], query: string): OpenRouterModel[] {
    const lowerQuery = query.toLowerCase();
    
    // Score each model based on match quality
    const scoredModels = models.map(model => {
      let score = 0;
      let matches = false;
      
      // Highest priority: exact match in ID
      if (model.id.toLowerCase() === lowerQuery) {
        score = 100;
        matches = true;
      }
      // Very high priority: match in model ID
      else if (model.id.toLowerCase().includes(lowerQuery)) {
        score = 90;
        matches = true;
      }
      // Medium priority: exact match in name
      else if (model.name.toLowerCase() === lowerQuery) {
        score = 60;
        matches = true;
      }
      // Medium priority: match in model name
      else if (model.name.toLowerCase().includes(lowerQuery)) {
        score = 50;
        matches = true;
      }
      // Lower priority: match in description
      else if (model.description && model.description.toLowerCase().includes(lowerQuery)) {
        score = 20;
        matches = true;
      }
      
      return { model, score, matches };
    });
    
    // Filter only matching models and sort by score (highest first)
    return scoredModels
      .filter(item => item.matches)
      .sort((a, b) => b.score - a.score)
      .map(item => item.model);
  }

  // Sort models by various criteria
  sortModels(models: OpenRouterModel[], sortBy: 'name' | 'price' | 'context'): OpenRouterModel[] {
    return [...models].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          const priceA = parseFloat(a.pricing.prompt);
          const priceB = parseFloat(b.pricing.prompt);
          return priceA - priceB;
        case 'context':
          return b.context_length - a.context_length;
        default:
          return 0;
      }
    });
  }

  // Map OpenRouter parameter names to our internal parameter names
  mapSupportedParameters(openRouterParams?: string[]): string[] {
    if (!openRouterParams) {
      // Default set of commonly supported parameters
      return ['temperature', 'maxTokens', 'topP'];
    }

    const parameterMapping: Record<string, string> = {
      'temperature': 'temperature',
      'max_tokens': 'maxTokens',
      'top_p': 'topP',
      'presence_penalty': 'presencePenalty',
      'frequency_penalty': 'frequencyPenalty',
      'stop': 'stop',
      'seed': 'seed',
      'top_k': 'topK',
      'repetition_penalty': 'repetitionPenalty',
      'logit_bias': 'logitBias',
      'response_format': 'responseFormat',
      'tools': 'tools',
      'tool_choice': 'toolChoice',
      'min_p': 'minP',
      'logprobs': 'logprobs',
      'top_logprobs': 'topLogprobs',
      'reasoning': 'reasoning',
      'include_reasoning': 'includeReasoning',
      'structured_outputs': 'structuredOutputs',
      // Note: Some parameters like 'reasoning_effort' are specific to certain models
      // and may not be in OpenRouter's supported_parameters list
    };

    const mappedParams: string[] = [];
    
    for (const param of openRouterParams) {
      if (parameterMapping[param]) {
        mappedParams.push(parameterMapping[param]);
      }
    }

    // Always include these basic parameters if they're supported
    const essentialParams = ['temperature', 'maxTokens', 'topP'];
    for (const param of essentialParams) {
      if (!mappedParams.includes(param)) {
        // Check if the OpenRouter version is in the list
        const openRouterKey = Object.keys(parameterMapping).find(
          key => parameterMapping[key] === param
        );
        if (openRouterKey && openRouterParams.includes(openRouterKey)) {
          mappedParams.push(param);
        }
      }
    }

    return mappedParams.length > 0 ? mappedParams : ['temperature', 'maxTokens', 'topP'];
  }

  // Detect model capabilities from OpenRouter model data
  detectModelCapabilities(model: OpenRouterModel) {
    const params = model.supported_parameters || [];
    const inputModalities = model.architecture?.input_modalities || [];
    
    return {
      // Tool/Function calling support
      supportsPlugins: params.includes('tools') && params.includes('tool_choice'),
      
      // Vision support (from input modalities)
      supportsVision: inputModalities.includes('image'),
      
      // Audio support
      supportsAudio: inputModalities.includes('audio'),
      
      // Document support
      supportsDocument: inputModalities.includes('document'),
      
      // Structured output support
      supportsStructuredOutput: params.includes('structured_outputs') || params.includes('response_format'),
      
      // Reasoning/thinking mode support
      supportsReasoning: params.includes('reasoning') || params.includes('include_reasoning'),
      
      // System role support (most OpenRouter models support this)
      supportsSystemRole: true,
      
      // Streaming support (most OpenRouter models support this)
      supportsStreaming: true,
      
      // Additional metadata
      maxOutputTokens: model.top_provider?.max_completion_tokens,
      isModerated: model.top_provider?.is_moderated || false,
      
      // Check if it's a thinking model variant
      isThinkingModel: model.id.includes(':thinking') || model.name.toLowerCase().includes('thinking'),
    };
  }
}