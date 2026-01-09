'use client';

import { FileText, Shield, HelpCircle, ExternalLink } from 'lucide-react';

export default function AboutTab() {
  return (
    <div className="space-y-6">
      {/* Logo and Description */}
      <div className="text-center space-y-3">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center">
          <span className="text-white text-3xl font-bold">M</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold dark:text-white">ChatterHub</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Multi-provider AI chat platform with parallel processing
          </p>
        </div>
      </div>

      {/* Links Section */}
      <div className="space-y-3">
        <a
          href="/terms"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Terms & Conditions
            </span>
          </div>
          <ExternalLink className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>

        <a
          href="/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Privacy Policy
            </span>
          </div>
          <ExternalLink className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>

        <a
          href="https://help.chatterhub.site"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <HelpCircle className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Help Center
            </span>
          </div>
          <ExternalLink className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
          © 2025 ChatterHub. All rights reserved.
        </p>
      </div>
    </div>
  );
}