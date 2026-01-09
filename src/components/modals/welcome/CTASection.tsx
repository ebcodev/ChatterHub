import { ArrowRight, PlayCircle, BookOpen, ExternalLink } from 'lucide-react';

interface CTASectionProps {
  onClose: () => void;
}

export default function CTASection({ onClose }: CTASectionProps) {
  return (
    <div className="px-8 py-12 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-3xl mx-auto text-center">
        {/* Main CTA */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Ready to Transform Your AI Experience?
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Join thousands of users who have made ChatterHub their AI home
        </p>

        {/* Primary action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all transform hover:scale-105 shadow-lg"
          >
            Get Started
            <ArrowRight className="h-5 w-5" />
          </button>
          
          <button
            onClick={() => {
              // TODO: Implement video tutorial
              onClose();
            }}
            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-all"
          >
            <PlayCircle className="h-5 w-5" />
            Watch Tutorial
          </button>
        </div>

        {/* Secondary actions */}
        <div className="flex flex-wrap gap-6 justify-center text-sm">
          <a
            href="/help"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            <BookOpen className="h-4 w-4" />
            Documentation
            <ExternalLink className="h-3 w-3" />
          </a>
          
          <button
            onClick={() => {
              // TODO: Implement keyboard shortcuts modal
              onClose();
            }}
            className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            Keyboard Shortcuts
          </button>
          
          <button
            onClick={() => {
              onClose();
              // Could trigger settings modal here
            }}
            className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            Add API Keys →
          </button>
        </div>

        {/* Don't show again checkbox */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <label className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              defaultChecked
              className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
            />
            Don't show this again
          </label>
        </div>

        {/* Footer note */}
        <div className="mt-6 text-xs text-gray-500 dark:text-gray-500">
          You can always access this guide from Settings → Help
        </div>
      </div>
    </div>
  );
}