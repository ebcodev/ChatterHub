'use client';

import { useState, useEffect, useRef } from 'react';
import { Info, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSettings } from '@/contexts/SettingsContext';
import { useApiKeys } from '@/contexts/ApiKeysContext';

// Available transcription models for speech-to-text conversion
const TRANSCRIPTION_MODELS = [
  { id: 'whisper-1', name: 'Whisper v1', description: 'Classic model with full features' },
  { id: 'gpt-4o-transcribe', name: 'GPT-4o Transcribe', description: 'Higher quality transcription' },
  { id: 'gpt-4o-mini-transcribe', name: 'GPT-4o Mini Transcribe', description: 'Fast and efficient' },
] as const;

export default function SpeechTab() {
  // ========================================
  // HOOKS & STATE MANAGEMENT
  // ========================================
  const { speechSettings, updateSpeechSettings, saveSpeechSettings } = useSettings();
  const { openAIKey } = useApiKeys();
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [localSettings, setLocalSettings] = useState(speechSettings);

  // Refs for auto-save functionality
  const isInitialLoad = useRef(true);
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  // ========================================
  // EFFECTS
  // ========================================

  // Sync local settings with global speech settings
  useEffect(() => {
    setLocalSettings(speechSettings);
    isInitialLoad.current = true;
  }, [speechSettings]);

  // Auto-save functionality with debounce (1 second delay)
  useEffect(() => {
    // Skip auto-save on initial component load
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    // Clear any existing save timeout
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }

    // Set new timeout to save after 1 second of no changes
    saveTimeout.current = setTimeout(() => {
      updateSpeechSettings(localSettings);
      saveSpeechSettings();
      toast.success('Speech settings saved automatically', {
        duration: 2000,
        position: 'bottom-right',
      });
    }, 1000);

    // Cleanup timeout on unmount or dependency change
    return () => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }
    };
  }, [localSettings, updateSpeechSettings, saveSpeechSettings]);

  // ========================================
  // COMPUTED VALUES
  // ========================================
  const selectedModel = TRANSCRIPTION_MODELS.find(m => m.id === localSettings.model) || TRANSCRIPTION_MODELS[0];

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className="space-y-6">
      {/* ========================================
          HEADER SECTION
          ======================================== */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Voice Input</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Transcribe your speech into text messages using OpenAI's transcription API.
        </p>
      </div>

      {/* ========================================
          ENABLE/DISABLE TOGGLE
          ======================================== */}
      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <div className="flex-1">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Enable Voice Input
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Show microphone button in chat input
          </p>
        </div>
        <button
          onClick={() => {
            if (!openAIKey && !localSettings.enabled) {
              toast.error('OpenAI API key required for voice input');
              return;
            }
            setLocalSettings(prev => ({ ...prev, enabled: !prev.enabled }));
          }}
          disabled={!openAIKey && !localSettings.enabled}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${localSettings.enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
            } ${!openAIKey && !localSettings.enabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${localSettings.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
          />
        </button>
      </div>

      {/* ========================================
          TRANSCRIPTION MODEL SELECTION
          ======================================== */}
      {localSettings.enabled && (
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Transcription Model
          </label>
          <div className="relative">
            <button
              onClick={() => setShowModelDropdown(!showModelDropdown)}
              className="w-full flex items-center justify-between px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
            >
              <div className="text-left">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {selectedModel.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {selectedModel.description}
                </div>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </button>

            {showModelDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                {TRANSCRIPTION_MODELS.map(model => (
                  <button
                    key={model.id}
                    onClick={() => {
                      setLocalSettings(prev => ({ ...prev, model: model.id }));
                      setShowModelDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg"
                  >
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {model.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {model.description}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================
          SYSTEM PROMPT FOR TRANSCRIPTION ACCURACY
          ======================================== */}
      {localSettings.enabled && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Word Corrections Prompt
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Provide context to improve transcription accuracy for specific words or acronyms
          </p>
          <textarea
            value={localSettings.systemPrompt}
            onChange={(e) => setLocalSettings(prev => ({ ...prev, systemPrompt: e.target.value }))}
            placeholder="Example: The transcript may contain technical terms like DALL·E, GPT-4, API, SDK..."
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
          />
        </div>
      )}

      {/* ========================================
          REQUIREMENTS & WARNINGS
          ======================================== */}
      <div className="p-3 border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <div className="flex gap-3">
          <Info className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Requirements
            </h4>
            <ul className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1 list-disc list-inside">
              <li>OpenAI API key is required</li>
              <li>Microphone access permission will be requested</li>
              <li>Audio is sent directly to OpenAI</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ========================================
          USER INSTRUCTIONS
          ======================================== */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">How to Use</h4>
        <div className="space-y-2">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">1</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Click the microphone button in the chat input area
            </p>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">2</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Speak your message clearly (recording indicator will show)
            </p>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">3</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Click the microphone again to stop and transcribe
            </p>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">4</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Your transcribed text will appear in the input field
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}