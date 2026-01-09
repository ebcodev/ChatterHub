'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ApiKeysTabProps {
  openAIKey: string;
  anthropicKey: string;
  geminiKey: string;
  xaiKey: string;
  deepseekKey: string;
  openRouterKey: string;
  moonshotKey: string;
  groqKey: string;
  setOpenAIKey: (key: string) => void;
  setAnthropicKey: (key: string) => void;
  setGeminiKey: (key: string) => void;
  setXaiKey: (key: string) => void;
  setDeepseekKey: (key: string) => void;
  setOpenRouterKey: (key: string) => void;
  setMoonshotKey: (key: string) => void;
  setGroqKey: (key: string) => void;
}

export default function ApiKeysTab({
  openAIKey,
  anthropicKey,
  geminiKey,
  xaiKey,
  deepseekKey,
  openRouterKey,
  moonshotKey,
  groqKey,
  setOpenAIKey,
  setAnthropicKey,
  setGeminiKey,
  setXaiKey,
  setDeepseekKey,
  setOpenRouterKey,
  setMoonshotKey,
  setGroqKey
}: ApiKeysTabProps) {
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const [showAnthropicKey, setShowAnthropicKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showXaiKey, setShowXaiKey] = useState(false);
  const [showDeepseekKey, setShowDeepseekKey] = useState(false);
  const [showOpenRouterKey, setShowOpenRouterKey] = useState(false);
  const [showMoonshotKey, setShowMoonshotKey] = useState(false);
  const [showGroqKey, setShowGroqKey] = useState(false);
  const [showMoreProviders, setShowMoreProviders] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Configure your API keys for different AI providers. Your keys are stored locally and never sent to our servers.{' '}
          <a
            href="https://help.chatterhub.site/getting-started/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Need help? Here's a quick walkthrough.
          </a>
        </p>
      </div>

      {/* OpenAI API Key */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          OpenAI API Key
        </label>
        <div className="relative">
          <input
            type={showOpenAIKey ? 'text' : 'password'}
            value={openAIKey || ''}
            onChange={(e) => setOpenAIKey(e.target.value)}
            placeholder="sk-..."
            className="w-full px-4 py-2 pr-24 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={() => setShowOpenAIKey(!showOpenAIKey)}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            {showOpenAIKey ? 'Hide' : 'Show'}
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Get your API key from{' '}
          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            OpenAI Platform
          </a>
        </p>
      </div>

      {/* Anthropic API Key */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Anthropic API Key
        </label>
        <div className="relative">
          <input
            type={showAnthropicKey ? 'text' : 'password'}
            value={anthropicKey || ''}
            onChange={(e) => setAnthropicKey(e.target.value)}
            placeholder="sk-ant-..."
            className="w-full px-4 py-2 pr-24 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={() => setShowAnthropicKey(!showAnthropicKey)}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            {showAnthropicKey ? 'Hide' : 'Show'}
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Get your API key from{' '}
          <a
            href="https://console.anthropic.com/settings/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Anthropic Console
          </a>
        </p>
      </div>

      {/* Google Gemini API Key */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Google Gemini API Key
        </label>
        <div className="relative">
          <input
            type={showGeminiKey ? 'text' : 'password'}
            value={geminiKey || ''}
            onChange={(e) => setGeminiKey(e.target.value)}
            placeholder="AIza..."
            className="w-full px-4 py-2 pr-24 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={() => setShowGeminiKey(!showGeminiKey)}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            {showGeminiKey ? 'Hide' : 'Show'}
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Get your API key from{' '}
          <a
            href="https://makersuite.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Google AI Studio
          </a>
        </p>
      </div>

      {/* xAI API Key */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          xAI API Key
        </label>
        <div className="relative">
          <input
            type={showXaiKey ? 'text' : 'password'}
            value={xaiKey || ''}
            onChange={(e) => setXaiKey(e.target.value)}
            placeholder="xai-..."
            className="w-full px-4 py-2 pr-24 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={() => setShowXaiKey(!showXaiKey)}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            {showXaiKey ? 'Hide' : 'Show'}
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Get your API key from{' '}
          <a
            href="https://console.x.ai/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            xAI Console
          </a>
        </p>
      </div>

      {/* DeepSeek API Key */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          DeepSeek API Key
        </label>
        <div className="relative">
          <input
            type={showDeepseekKey ? 'text' : 'password'}
            value={deepseekKey || ''}
            onChange={(e) => setDeepseekKey(e.target.value)}
            placeholder="sk-..."
            className="w-full px-4 py-2 pr-24 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={() => setShowDeepseekKey(!showDeepseekKey)}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            {showDeepseekKey ? 'Hide' : 'Show'}
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Get your API key from{' '}
          <a
            href="https://platform.deepseek.com/api_keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            DeepSeek Platform
          </a>
        </p>
      </div>

      {/* OpenRouter API Key */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          OpenRouter API Key
        </label>
        <div className="relative">
          <input
            type={showOpenRouterKey ? 'text' : 'password'}
            value={openRouterKey || ''}
            onChange={(e) => setOpenRouterKey(e.target.value)}
            placeholder="sk-or-..."
            className="w-full px-4 py-2 pr-24 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={() => setShowOpenRouterKey(!showOpenRouterKey)}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            {showOpenRouterKey ? 'Hide' : 'Show'}
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Get your API key from{' '}
          <a
            href="https://openrouter.ai/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            OpenRouter Dashboard
          </a>
        </p>
      </div>

      {/* More API Keys Section */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <button
          onClick={() => setShowMoreProviders(!showMoreProviders)}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          {showMoreProviders ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          More API Keys
        </button>

        {showMoreProviders && (
          <div className="mt-6 space-y-6">
            {/* Moonshot API Key */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Moonshot API Key (Kimi K2)
              </label>
              <div className="relative">
                <input
                  type={showMoonshotKey ? 'text' : 'password'}
                  value={moonshotKey || ''}
                  onChange={(e) => setMoonshotKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-4 py-2 pr-24 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={() => setShowMoonshotKey(!showMoonshotKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  {showMoonshotKey ? 'Hide' : 'Show'}
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Get your API key from{' '}
                <a
                  href="https://platform.moonshot.ai/console"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Moonshot AI Platform
                </a>
              </p>
            </div>


            {/* Groq API Key */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Groq API Key
              </label>
              <div className="relative">
                <input
                  type={showGroqKey ? 'text' : 'password'}
                  value={groqKey || ''}
                  onChange={(e) => setGroqKey(e.target.value)}
                  placeholder="gsk_..."
                  className="w-full px-4 py-2 pr-24 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={() => setShowGroqKey(!showGroqKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  {showGroqKey ? 'Hide' : 'Show'}
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Get your API key from{' '}
                <a
                  href="https://console.groq.com/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Groq Console
                </a>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* No save button needed - changes are auto-saved */}
    </div>
  );
}