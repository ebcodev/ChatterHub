import { TestConfig } from '../utils/test-runner';

export interface TestOptions {
  provider?: string;
  model?: string;
  quickMode?: boolean;
  verbose?: boolean;
}

export async function getTestConfigs(options: TestOptions): Promise<TestConfig[]> {
  const configs: TestConfig[] = [];

  // OpenAI tests
  if (shouldTestProvider('openai', options) && process.env.OPENAI_API_KEY) {
    const models = options.quickMode ? ['gpt-4o-mini'] : ['gpt-4o', 'gpt-4o-mini'];

    for (const model of models) {
      if (!options.model || options.model === model) {
        configs.push({
          provider: 'OpenAI',
          model,
          apiType: 'openai-chat-completions',
          apiKey: process.env.OPENAI_API_KEY
        });
      }
    }
  }

  // Anthropic tests
  if (shouldTestProvider('anthropic', options) && process.env.ANTHROPIC_API_KEY) {
    const models = options.quickMode ? ['claude-3-haiku'] : ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'];

    for (const model of models) {
      if (!options.model || options.model === model) {
        configs.push({
          provider: 'Anthropic',
          model,
          apiType: 'anthropic',
          apiKey: process.env.ANTHROPIC_API_KEY
        });
      }
    }
  }

  // Gemini tests
  if (shouldTestProvider('gemini', options) && process.env.GEMINI_API_KEY) {
    const models = options.quickMode ? ['gemini-2.0-flash'] : ['gemini-2.0-flash', 'gemini-1.5-pro'];

    for (const model of models) {
      if (!options.model || options.model === model) {
        configs.push({
          provider: 'Gemini',
          model,
          apiType: 'gemini',
          apiKey: process.env.GEMINI_API_KEY
        });
      }
    }
  }

  // xAI tests (optional, expensive)
  if (shouldTestProvider('xai', options) && process.env.XAI_API_KEY) {
    const models = options.quickMode ? ['grok-3-mini'] : ['grok-3', 'grok-3-mini'];

    for (const model of models) {
      if (!options.model || options.model === model) {
        configs.push({
          provider: 'xAI',
          model,
          apiType: 'openai-chat-completions',
          apiKey: process.env.XAI_API_KEY,
          baseUrl: 'https://api.x.ai/v1'
        });
      }
    }
  }

  // DeepSeek tests (optional)
  if (shouldTestProvider('deepseek', options) && process.env.DEEPSEEK_API_KEY) {
    const models = ['deepseek-chat'];

    for (const model of models) {
      if (!options.model || options.model === model) {
        configs.push({
          provider: 'DeepSeek',
          model,
          apiType: 'openai-chat-completions',
          apiKey: process.env.DEEPSEEK_API_KEY,
          baseUrl: 'https://api.deepseek.com/v1'
        });
      }
    }
  }

  // OpenRouter tests (optional)
  if (shouldTestProvider('openrouter', options) && process.env.OPENROUTER_API_KEY) {
    // Test with a common model through OpenRouter
    const models = ['openai/gpt-4o-mini'];

    for (const model of models) {
      if (!options.model || options.model === model) {
        configs.push({
          provider: 'OpenRouter',
          model,
          apiType: 'openai-chat-completions',
          apiKey: process.env.OPENROUTER_API_KEY,
          baseUrl: 'https://openrouter.ai/api/v1',
          customHeaders: {
            'HTTP-Referer': 'https://chatterhub.site',
            'X-Title': 'ChatterHub Test Suite'
          }
        });
      }
    }
  }

  return configs;
}

function shouldTestProvider(provider: string, options: TestOptions): boolean {
  // If specific provider requested, only test that one
  if (options.provider) {
    return options.provider.toLowerCase() === provider.toLowerCase();
  }

  // Otherwise check environment variables
  const envKey = `TEST_${provider.toUpperCase()}`;
  return process.env[envKey] === 'true';
}