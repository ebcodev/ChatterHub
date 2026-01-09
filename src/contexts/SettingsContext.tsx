'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { useLocalStorage } from 'usehooks-ts';

interface SpeechSettings {
  enabled: boolean;
  model: 'whisper-1' | 'gpt-4o-transcribe' | 'gpt-4o-mini-transcribe';
  systemPrompt: string;
}

interface SettingsContextType {
  speechSettings: SpeechSettings;
  updateSpeechSettings: (settings: Partial<SpeechSettings>) => void;
  saveSpeechSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const DEFAULT_SPEECH_SETTINGS: SpeechSettings = {
  enabled: false,
  model: 'whisper-1',
  systemPrompt: '',
};

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [speechEnabled, setSpeechEnabled] = useLocalStorage('CH_speechEnabled', false);
  const [speechModel, setSpeechModel] = useLocalStorage<SpeechSettings['model']>('CH_speechModel', 'whisper-1');
  const [speechSystemPrompt, setSpeechSystemPrompt] = useLocalStorage('CH_speechSystemPrompt', '');

  // Build the speechSettings object
  const speechSettings: SpeechSettings = {
    enabled: speechEnabled,
    model: speechModel,
    systemPrompt: speechSystemPrompt,
  };

  // Update speech settings
  const updateSpeechSettings = (settings: Partial<SpeechSettings>) => {
    if (settings.enabled !== undefined) setSpeechEnabled(settings.enabled);
    if (settings.model !== undefined) setSpeechModel(settings.model);
    if (settings.systemPrompt !== undefined) setSpeechSystemPrompt(settings.systemPrompt);
  };

  // Save speech settings - now just a no-op since hooks auto-save
  const saveSpeechSettings = () => {
    // Auto-saved by useLocalStorage hooks
  };

  const value: SettingsContextType = {
    speechSettings,
    updateSpeechSettings,
    saveSpeechSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}