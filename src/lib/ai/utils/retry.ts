import { AIError } from '../types';

export interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  jitter?: boolean;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  jitter: true
};

export async function withRetry<T>(
  fn: () => Promise<T>,
  isRetryable: (error: any) => boolean,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: any;
  
  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Check if we should retry
      if (attempt === opts.maxAttempts || !isRetryable(error)) {
        throw error;
      }
      
      // Calculate delay
      let delay = Math.min(opts.baseDelay * Math.pow(2, attempt - 1), opts.maxDelay);
      
      // Check for retry-after header
      if (error && typeof error === 'object' && 'retryAfter' in error) {
        const retryAfter = (error as AIError).retryAfter;
        if (retryAfter) {
          delay = retryAfter * 1000;
        }
      }
      
      // Add jitter to prevent thundering herd
      if (opts.jitter) {
        delay = delay * (0.5 + Math.random() * 0.5);
      }
      
      console.log(`Retry attempt ${attempt}/${opts.maxAttempts} after ${Math.round(delay)}ms`);
      await sleep(delay);
    }
  }
  
  throw lastError;
}

export function isRetryableError(error: any): boolean {
  // Check if it's an AIError with retryable flag
  if (error && typeof error === 'object' && 'isRetryable' in error) {
    return (error as AIError).isRetryable;
  }
  
  // Check HTTP status codes
  const status = error?.response?.status || error?.status;
  if (status) {
    // Retry on rate limits, server errors, and timeouts
    return [429, 500, 502, 503, 504, 408].includes(status);
  }
  
  // Check error messages
  const message = error?.message?.toLowerCase() || '';
  return message.includes('rate limit') || 
         message.includes('timeout') ||
         message.includes('server error') ||
         message.includes('temporarily unavailable');
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}