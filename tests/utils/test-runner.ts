import { AIRequest } from '@/lib/ai/types';
import { aiService } from '@/lib/ai/service';
import { TestResult } from '@/lib/ai/types';
import { ModelParameters } from '@/lib/db';

export interface TestConfig {
  provider: string;
  model: string;
  apiType: string;
  apiKey: string;
  baseUrl?: string;
  customHeaders?: Record<string, string>;
}

export interface TestRunnerOptions {
  timeout: number;
  maxCost: number;
}

export class TestRunner {
  private totalCost = 0;
  
  constructor(private options: TestRunnerOptions) {}
  
  async runTests(configs: TestConfig[]): Promise<TestResult[]> {
    const results: TestResult[] = [];
    
    for (const config of configs) {
      // Check cost limit
      if (this.totalCost >= this.options.maxCost) {
        console.log(`⚠️  Stopping tests - cost limit reached ($${this.totalCost.toFixed(4)})`);
        results.push({
          provider: config.provider,
          model: config.model,
          apiType: config.apiType,
          status: 'skip',
          responseTime: 0,
          error: 'Cost limit reached'
        });
        continue;
      }
      
      const result = await this.runSingleTest(config);
      results.push(result);
      
      if (result.cost) {
        this.totalCost += result.cost;
      }
      
      // Add delay between tests to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return results;
  }
  
  private async runSingleTest(config: TestConfig): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      // Create request
      const request: AIRequest = {
        model: config.model,
        messages: [
          {
            role: 'user',
            content: 'Who are you? Reply in 10 words or less.'
          }
        ],
        apiKey: config.apiKey,
        baseUrl: config.baseUrl,
        customHeaders: config.customHeaders,
        modelParams: {
          modelId: config.model,
          temperature: 0.7,
          maxTokens: 50,
          createdAt: new Date(),
          updatedAt: new Date()
        } as ModelParameters
      };
      
      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Test timeout')), this.options.timeout);
      });
      
      // Stream the response with timeout
      let responseContent = '';
      const streamPromise = this.streamResponse(request).then(content => {
        responseContent = content;
      });
      
      await Promise.race([streamPromise, timeoutPromise]);
      
      const responseTime = Date.now() - startTime;
      
      // Estimate cost (very rough estimates)
      const cost = this.estimateCost(config.model, 20, 10); // ~20 input tokens, ~10 output tokens
      
      return {
        provider: config.provider,
        model: config.model,
        apiType: config.apiType,
        status: 'pass',
        responseTime,
        response: responseContent.substring(0, 100),
        cost,
        tokensUsed: 30
      };
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      
      return {
        provider: config.provider,
        model: config.model,
        apiType: config.apiType,
        status: 'fail',
        responseTime,
        error: error?.message || 'Unknown error'
      };
    }
  }
  
  private async streamResponse(request: AIRequest): Promise<string> {
    let content = '';
    
    const stream = aiService.streamWithRetry(request);
    
    for await (const chunk of stream) {
      if (chunk.error) {
        throw new Error(chunk.error.message);
      }
      
      if (chunk.content) {
        content += chunk.content;
      }
      
      if (chunk.isComplete) {
        break;
      }
    }
    
    return content;
  }
  
  private estimateCost(model: string, inputTokens: number, outputTokens: number): number {
    // Very rough cost estimates per 1M tokens
    const costs: Record<string, { input: number; output: number }> = {
      'gpt-4o': { input: 2.50, output: 10.00 },
      'gpt-4o-mini': { input: 0.15, output: 0.60 },
      'o1': { input: 15.00, output: 60.00 },
      'o1-mini': { input: 3.00, output: 12.00 },
      'claude-3-opus': { input: 15.00, output: 75.00 },
      'claude-3-sonnet': { input: 3.00, output: 15.00 },
      'claude-3-haiku': { input: 0.25, output: 1.25 },
      'gemini-2-flash': { input: 0.075, output: 0.30 },
      'gemini-1.5-pro': { input: 1.25, output: 5.00 },
      'grok-3': { input: 5.00, output: 15.00 },
      'deepseek-chat': { input: 0.14, output: 0.28 }
    };
    
    // Find cost for model
    const modelKey = Object.keys(costs).find(key => model.toLowerCase().includes(key.toLowerCase()));
    if (!modelKey) {
      return 0.0001; // Default tiny cost
    }
    
    const modelCost = costs[modelKey];
    if (!modelCost) {
      return 0.0001; // Fallback if no cost found
    }
    return (inputTokens * modelCost.input / 1_000_000) + (outputTokens * modelCost.output / 1_000_000);
  }
}