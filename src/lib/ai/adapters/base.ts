import { AIAdapter, AIRequest, AIStreamChunk, AIMessage, AIError } from '../types';

export abstract class BaseAdapter implements AIAdapter {
  abstract name: string;
  abstract supportsStreaming: boolean;
  
  abstract stream(request: AIRequest): AsyncGenerator<AIStreamChunk>;
  abstract complete(request: AIRequest): Promise<AIMessage>;
  abstract formatError(error: any): AIError;
  
  protected getHeaders(request: AIRequest, isStream: boolean = false): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...request.customHeaders
    };
    
    if (isStream) {
      headers['Accept'] = 'text/event-stream';
      // Removed Cache-Control header as it causes CORS issues with OpenRouter
    }
    
    return headers;
  }
  
  protected async handleStreamResponse(
    response: Response,
    onChunk: (text: string) => void
  ): Promise<void> {
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }
    
    const decoder = new TextDecoder();
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        onChunk(chunk);
      }
    } finally {
      reader.releaseLock();
    }
  }
  
  protected buildRequestBody(
    request: AIRequest,
    additionalParams?: Record<string, any>
  ): Record<string, any> {
    const body: Record<string, any> = {
      model: request.model,
      ...additionalParams,
      ...request.customBodyParams
    };
    
    // Apply model parameters
    if (request.modelParams) {
      if (request.modelParams.temperature !== undefined) {
        body.temperature = request.modelParams.temperature;
      }
      if (request.modelParams.maxTokens !== undefined) {
        body.max_tokens = request.modelParams.maxTokens;
      }
      if (request.modelParams.topP !== undefined) {
        body.top_p = request.modelParams.topP;
      }
      if (request.modelParams.frequencyPenalty !== undefined) {
        body.frequency_penalty = request.modelParams.frequencyPenalty;
      }
      if (request.modelParams.presencePenalty !== undefined) {
        body.presence_penalty = request.modelParams.presencePenalty;
      }
    }
    
    return body;
  }
}