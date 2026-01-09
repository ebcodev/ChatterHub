'use client';

import { Sun, Moon, Monitor } from 'lucide-react';

interface AppearanceTabProps {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export default function AppearanceTab({ theme, setTheme }: AppearanceTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Theme</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Choose how ChatterHub looks to you. Select a single theme, or sync with your system settings.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {/* Light Theme */}
        <button
          onClick={() => setTheme('light')}
          className={`relative p-4 rounded-lg border-2 transition-all ${
            theme === 'light'
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
              <Sun className="h-6 w-6 text-yellow-500" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Light</span>
          </div>
          {theme === 'light' && (
            <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full" />
          )}
        </button>

        {/* Dark Theme */}
        <button
          onClick={() => setTheme('dark')}
          className={`relative p-4 rounded-lg border-2 transition-all ${
            theme === 'dark'
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gray-900 border border-gray-700 flex items-center justify-center">
              <Moon className="h-6 w-6 text-blue-400" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dark</span>
          </div>
          {theme === 'dark' && (
            <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full" />
          )}
        </button>

        {/* System Theme */}
        <button
          onClick={() => setTheme('system')}
          className={`relative p-4 rounded-lg border-2 transition-all ${
            theme === 'system'
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-white to-gray-900 border border-gray-400 flex items-center justify-center">
              <Monitor className="h-6 w-6 text-gray-600 mix-blend-difference" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">System</span>
          </div>
          {theme === 'system' && (
            <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full" />
          )}
        </button>
      </div>

      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          <strong className="font-medium">Tip:</strong> System theme automatically matches your device's appearance settings.
        </p>
      </div>
    </div>
  );
}