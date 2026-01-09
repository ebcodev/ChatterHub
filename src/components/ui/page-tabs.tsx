'use client';

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

export interface TabItem {
  value: string;
  label: string;
  icon?: LucideIcon;
  count?: number;
}

interface PageTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (value: string) => void;
}

export default function PageTabs({ tabs, activeTab, onTabChange }: PageTabsProps) {
  return (
    <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-gray-700">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.value;
        
        return (
          <button
            key={tab.value}
            onClick={() => onTabChange(tab.value)}
            className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 border-b-2 ${
              isActive
                ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {Icon && <Icon className="h-4 w-4" />}
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs">
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}