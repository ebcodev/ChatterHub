'use client';

import React, { createContext, useContext } from 'react';
import { useLocalStorage } from 'usehooks-ts';

interface ApiKeysContextType {
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
  hasAnyKey: boolean;
}

const ApiKeysContext = createContext<ApiKeysContextType | undefined>(undefined);

export function ApiKeysProvider({ children }: { children: React.ReactNode }) {
  const [openAIKey, setOpenAIKey] = useLocalStorage('CH_openAiKey', '');
  const [anthropicKey, setAnthropicKey] = useLocalStorage('CH_anthropicKey', '');
  const [geminiKey, setGeminiKey] = useLocalStorage('CH_geminiKey', '');
  const [xaiKey, setXaiKey] = useLocalStorage('CH_xaiKey', '');
  const [deepseekKey, setDeepseekKey] = useLocalStorage('CH_deepseekKey', '');
  const [openRouterKey, setOpenRouterKey] = useLocalStorage('CH_openRouterKey', '');
  const [moonshotKey, setMoonshotKey] = useLocalStorage('CH_moonshotKey', '');
  const [groqKey, setGroqKey] = useLocalStorage('CH_groqKey', '');

  const hasAnyKey = !!(openAIKey || anthropicKey || geminiKey || xaiKey || deepseekKey || openRouterKey || moonshotKey || groqKey);

  const value: ApiKeysContextType = {
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
    setGroqKey,
    hasAnyKey,
  };

  return (
    <ApiKeysContext.Provider value={value}>
      {children}
    </ApiKeysContext.Provider>
  );
}

export function useApiKeys() {
  const context = useContext(ApiKeysContext);
  if (context === undefined) {
    throw new Error('useApiKeys must be used within an ApiKeysProvider');
  }
  return context;
}