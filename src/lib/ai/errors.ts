import { AIError, AIErrorCode } from './types';

export function createAIError(
  code: AIErrorCode,
  message: string,
  provider: string,
  originalError?: any
): AIError {
  const isRetryable = ['rate_limit', 'server_error', 'timeout', 'network_error'].includes(code);
  
  let retryAfter: number | undefined;
  
  // Extract retry-after from various error formats
  if (originalError?.headers?.['retry-after']) {
    retryAfter = parseInt(originalError.headers['retry-after']);
  } else if (originalError?.response?.headers?.['retry-after']) {
    retryAfter = parseInt(originalError.response.headers['retry-after']);
  } else if (code === 'rate_limit') {
    // Default retry after for rate limits
    retryAfter = 30;
  }
  
  return {
    code,
    message,
    provider,
    isRetryable,
    retryAfter,
    originalError
  };
}

export function formatErrorForChat(error: AIError): string {
  let message = `❌ Error: ${error.message}\n`;
  message += `Provider: ${error.provider}`;
  // Include provider request id when available for easier debugging
  const rid = (error.originalError?.request_id) ||
              (error.originalError?.headers?.['x-request-id']) ||
              (error.originalError?.response?.headers?.['x-request-id']);
  if (rid) {
    message += `\nRequest ID: ${rid}`;
  }
  
  if (error.code === 'rate_limit' && error.retryAfter) {
    message += `\nPlease wait ${error.retryAfter} seconds before trying again.`;
  } else if (error.code === 'auth_failed') {
    message += `\nPlease check your API key in Settings.`;
  } else if (error.code === 'quota_exceeded') {
    message += `\nYour API quota has been exceeded. Please check your billing.`;
  } else if (error.code === 'model_not_found') {
    message += `\nThis model may not be available with your current API plan.`;
  } else if (error.isRetryable) {
    message += `\nThis is a temporary issue. Please try again.`;
  }
  
  return message;
}

export function parseOpenAIError(error: any, provider: string): AIError {
  const status = error?.response?.status || error?.status;
  const message = error?.response?.data?.error?.message || 
                  error?.error?.message || 
                  error?.message || 
                  'Unknown error occurred';
  
  let code: AIErrorCode = 'unknown';
  
  switch (status) {
    case 401:
      code = 'auth_failed';
      break;
    case 404:
      code = 'model_not_found';
      break;
    case 429:
      code = 'rate_limit';
      break;
    case 402:
    case 403:
      code = 'quota_exceeded';
      break;
    case 500:
    case 502:
    case 503:
      code = 'server_error';
      break;
    case 408:
      code = 'timeout';
      break;
    default:
      if (message.toLowerCase().includes('rate limit')) {
        code = 'rate_limit';
      } else if (message.toLowerCase().includes('auth') || message.toLowerCase().includes('api key')) {
        code = 'auth_failed';
      } else if (message.toLowerCase().includes('quota') || message.toLowerCase().includes('limit')) {
        code = 'quota_exceeded';
      }
  }
  
  return createAIError(code, message, provider, error);
}

export function parseAnthropicError(error: any): AIError {
  const status = error?.status || error?.response?.status;
  // Try multiple shapes: { status, error: { error: { message } } }, { status, error: { message } }, SSE { type, message }
  const nested = error?.error?.error ?? error?.error ?? error;
  const message = nested?.message || error?.message || 'Unknown error occurred';
  
  let code: AIErrorCode = 'unknown';
  
  switch (status) {
    case 401:
      code = 'auth_failed';
      break;
    case 404:
      code = 'model_not_found';
      break;
    case 429:
      code = 'rate_limit';
      break;
    case 400:
      if (message.includes('credit')) {
        code = 'quota_exceeded';
      } else {
        code = 'invalid_request';
      }
      break;
    case 500:
    case 502:
    case 503:
      code = 'server_error';
      break;
    default:
      if (message.toLowerCase().includes('rate limit')) {
        code = 'rate_limit';
      }
  }
  
  return createAIError(code, message, 'Anthropic', error);
}

export function parseGeminiError(error: any): AIError {
  const message = error?.message || 'Unknown error occurred';
  let code: AIErrorCode = 'unknown';
  
  if (error?.status === 401 || message.includes('API key')) {
    code = 'auth_failed';
  } else if (error?.status === 429 || message.includes('quota')) {
    code = 'rate_limit';
  } else if (error?.status === 404) {
    code = 'model_not_found';
  } else if (error?.status >= 500) {
    code = 'server_error';
  } else if (message.includes('timeout')) {
    code = 'timeout';
  }
  
  return createAIError(code, message, 'Gemini', error);
}
