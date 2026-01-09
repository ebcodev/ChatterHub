# ChatterHub API Provider Tests

This test suite validates that all AI provider integrations are working correctly.

## Setup

1. Copy the environment template:
```bash
cp .env.test.example .env.test
```

2. Add your API keys to `.env.test`

3. Install dependencies (if not already installed):
```bash
npm install
```

## Running Tests

### Test all configured providers:
```bash
npm run test:providers
```

### Test specific provider:
```bash
npm run test:providers -- --provider=openai
npm run test:providers -- --provider=anthropic
npm run test:providers -- --provider=gemini
```

### Test specific model:
```bash
npm run test:providers -- --model=gpt-4o
```

### Quick mode (one model per provider):
```bash
npm run test:providers -- --quick
```

### Verbose mode (show responses):
```bash
npm run test:providers -- --verbose
```

### Set cost limit:
```bash
npm run test:providers -- --max-cost=0.50
```

## Configuration

Edit `.env.test` to configure:
- Which providers to test (TEST_OPENAI, TEST_ANTHROPIC, etc.)
- Test timeout (TEST_TIMEOUT)
- Maximum cost limit (TEST_MAX_COST)

## Test Output

The test suite displays:
- ✅ Successful tests
- ❌ Failed tests with error messages
- ⏭️ Skipped tests
- 💰 Cost tracking for each test
- ⏱️ Response times
- 📊 Summary statistics

## Cost Estimates

Tests use minimal prompts ("Who are you? Reply in 10 words or less.") to keep costs low.
Typical test run costs:
- OpenAI GPT-4o-mini: ~$0.0003
- Anthropic Claude Haiku: ~$0.0002
- Gemini Flash: ~$0.0001

## Troubleshooting

### "No tests configured"
- Ensure `.env.test` exists with valid API keys
- Check that TEST_[PROVIDER]=true for providers you want to test

### Rate limit errors
- Tests include 1-second delays between requests
- For persistent issues, run tests for individual providers

### Timeout errors
- Increase TEST_TIMEOUT in `.env.test` (default: 30000ms)
- Check your internet connection

## Adding New Providers

To add a new provider:
1. Add the API key to `.env.test.example`
2. Add test configuration in `providers/index.ts`
3. Ensure the provider adapter exists in `src/lib/ai/adapters/`