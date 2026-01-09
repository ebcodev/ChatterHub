#!/usr/bin/env tsx

import { config } from 'dotenv';
import { parseArgs } from 'util';
import path from 'path';
import { TestRunner } from './utils/test-runner';
import { TableReporter } from './utils/reporter';
import { getTestConfigs } from './providers';

async function main() {
  // Load test environment
  config({ path: path.join(__dirname, '.env.test') });
  
  // Parse command line arguments
  const { values } = parseArgs({
    options: {
      provider: { 
        type: 'string',
        short: 'p',
        description: 'Test specific provider (openai, anthropic, gemini, xai, deepseek, openrouter)'
      },
      model: { 
        type: 'string',
        short: 'm',
        description: 'Test specific model'
      },
      quick: { 
        type: 'boolean', 
        default: false,
        short: 'q',
        description: 'Quick mode - test only one model per provider'
      },
      verbose: { 
        type: 'boolean', 
        default: false,
        short: 'v',
        description: 'Verbose output with response samples'
      },
      'max-cost': {
        type: 'string',
        default: '1.00',
        description: 'Maximum cost in USD before stopping tests'
      }
    }
  });
  
  console.log('🧪 ChatterHub API Provider Test Suite\n');
  console.log('📝 Test prompt: "Who are you? Reply in 10 words or less."\n');
  
  // Get test configurations
  const configs = await getTestConfigs({
    provider: values.provider,
    model: values.model,
    quickMode: values.quick || process.env.TEST_QUICK_MODE === 'true',
    verbose: values.verbose || process.env.TEST_VERBOSE === 'true'
  });
  
  if (configs.length === 0) {
    console.log('❌ No tests configured. Check your .env.test file and ensure API keys are set.');
    process.exit(1);
  }
  
  console.log(`🔧 Running ${configs.length} test${configs.length > 1 ? 's' : ''}...\n`);
  
  // Run tests
  const runner = new TestRunner({
    timeout: parseInt(process.env.TEST_TIMEOUT || '30000'),
    maxCost: parseFloat(values['max-cost'] || process.env.TEST_MAX_COST || '1.00')
  });
  
  const results = await runner.runTests(configs);
  
  // Display results
  const reporter = new TableReporter();
  reporter.printResults(results, values.verbose || false);
  
  // Exit with appropriate code
  const failedCount = results.filter(r => r.status === 'fail').length;
  process.exit(failedCount > 0 ? 1 : 0);
}

// Run the test suite
main().catch(error => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});