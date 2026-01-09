import { AIRequest, AIStreamChunk, AIMessage, AIAdapter, ModelConfig } from './types';
import { OpenAIChatCompletionsAdapter } from './adapters/openai-chat-completions';
import { OpenAIResponsesAdapter } from './adapters/openai-responses';
import { AnthropicMessagesAdapter } from './adapters/anthropic-messages';
import { GeminiAdapter } from './adapters/gemini';
import { withRetry, isRetryableError } from './utils/retry';
import { formatErrorForChat } from './errors';
import { AVAILABLE_MODELS } from '@/lib/models';
import { getCustomModels } from '@/lib/data/operations/customModels';

export class AIService {
  private adapters: Map<string, AIAdapter> = new Map();
  
  constructor() {
    // Initialize adapters
    this.adapters.set('openai-chat-completions', new OpenAIChatCompletionsAdapter());
    this.adapters.set('openai-responses', new OpenAIResponsesAdapter());
    this.adapters.set('anthropic', new AnthropicMessagesAdapter());
    this.adapters.set('gemini', new GeminiAdapter());
  }
  
  private async getModelConfig(modelId: string): Promise<ModelConfig | null> {
    // Check built-in models
    const builtInModel = AVAILABLE_MODELS.find(m => m.id === modelId);
    if (builtInModel) {
      return builtInModel as ModelConfig;
    }
    
    // Check custom models
    const customModels = await getCustomModels();
    const customModel = customModels.find(m => m.modelId === modelId && m.isActive);
    if (customModel) {
      return {
        id: customModel.modelId,
        name: customModel.name,
        contextWindow: customModel.contextWindow,
        provider: customModel.provider,
        apiType: customModel.apiType,
        baseUrl: customModel.baseUrl,
        customHeaders: customModel.customHeaders,
        customBodyParams: customModel.customBodyParams,
        supportsVision: customModel.supportsVision,
        supportsStreaming: customModel.supportsStreaming,
        supportsSystemRole: customModel.supportsSystemRole,
        supportedParameters: customModel.supportedParameters
      };
    }
    
    return null;
  }
  
  private getAdapter(apiType: string): AIAdapter | null {
    return this.adapters.get(apiType) || null;
  }
  
  async *streamWithRetry(request: AIRequest): AsyncGenerator<AIStreamChunk> {
    const modelConfig = await this.getModelConfig(request.model);
    if (!modelConfig) {
      yield {
        content: formatErrorForChat({
          code: 'model_not_found',
          message: `Model ${request.model} not found`,
          provider: 'Unknown',
          isRetryable: false
        }),
        isComplete: true
      };
      return;
    }
    
    const adapter = this.getAdapter(modelConfig.apiType);
    if (!adapter) {
      yield {
        content: formatErrorForChat({
          code: 'invalid_request',
          message: `Unsupported API type: ${modelConfig.apiType}`,
          provider: modelConfig.provider,
          isRetryable: false
        }),
        isComplete: true
      };
      return;
    }
    
    // Merge model config into request
    const enrichedRequest: AIRequest = {
      ...request,
      baseUrl: request.baseUrl || modelConfig.baseUrl,
      customHeaders: { ...modelConfig.customHeaders, ...request.customHeaders },
      customBodyParams: { ...modelConfig.customBodyParams, ...request.customBodyParams }
    };
    
    // Stream with retry logic
    let attemptCount = 0;
    const maxAttempts = 3;
    
    while (attemptCount < maxAttempts) {
      attemptCount++;
      let hasError = false;
      
      try {
        const stream = adapter.stream(enrichedRequest);
        
        for await (const chunk of stream) {
          if (chunk.error) {
            hasError = true;
            
            // Check if retryable
            if (chunk.error.isRetryable && attemptCount < maxAttempts) {
              // Wait before retry
              const delay = chunk.error.retryAfter ? chunk.error.retryAfter * 1000 : Math.pow(2, attemptCount) * 1000;
              await new Promise(resolve => setTimeout(resolve, delay));
              break; // Exit inner loop to retry
            } else {
              // Non-retryable error or max attempts reached
              yield {
                content: formatErrorForChat(chunk.error),
                isComplete: true,
                error: chunk.error
              };
              return;
            }
          } else {
            yield chunk;
          }
        }
        
        // If we completed without error, exit retry loop
        if (!hasError) {
          return;
        }
      } catch (error: any) {
        hasError = true;
        
        // Check if retryable
        if (isRetryableError(error) && attemptCount < maxAttempts) {
          const delay = Math.pow(2, attemptCount) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          // Non-retryable error or max attempts reached
          const formattedError = adapter.formatError(error);
          yield {
            content: formatErrorForChat(formattedError),
            isComplete: true,
            error: formattedError
          };
          return;
        }
      }
    }
    
    // If we get here, we've exhausted retries
  }
  
  async completeWithRetry(request: AIRequest): Promise<AIMessage> {
    const modelConfig = await this.getModelConfig(request.model);
    if (!modelConfig) {
      return {
        role: 'assistant',
        content: formatErrorForChat({
          code: 'model_not_found',
          message: `Model ${request.model} not found`,
          provider: 'Unknown',
          isRetryable: false
        })
      };
    }
    
    const adapter = this.getAdapter(modelConfig.apiType);
    if (!adapter) {
      return {
        role: 'assistant',
        content: formatErrorForChat({
          code: 'invalid_request',
          message: `Unsupported API type: ${modelConfig.apiType}`,
          provider: modelConfig.provider,
          isRetryable: false
        })
      };
    }
    
    // Merge model config into request
    const enrichedRequest: AIRequest = {
      ...request,
      baseUrl: request.baseUrl || modelConfig.baseUrl,
      customHeaders: { ...modelConfig.customHeaders, ...request.customHeaders },
      customBodyParams: { ...modelConfig.customBodyParams, ...request.customBodyParams }
    };
    
    try {
      return await withRetry(
        () => adapter.complete(enrichedRequest),
        isRetryableError,
        { maxAttempts: 3 }
      );
    } catch (error) {
      const formattedError = adapter.formatError(error);
      return {
        role: 'assistant',
        content: formatErrorForChat(formattedError)
      };
    }
  }
}

// Singleton instance
export const aiService = new AIService();