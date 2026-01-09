import { Sparkles } from 'lucide-react';

export default function HeroSection() {
  return (
    <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-8 py-12 text-center">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
      
      {/* Logo/Icon placeholder */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          {/* Decorative ring */}
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 opacity-30 blur-md" />
        </div>
      </div>

      {/* Main heading */}
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
        Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">ChatterHub</span>
      </h1>
      
      {/* Tagline */}
      <p className="text-xl text-gray-700 dark:text-gray-300 mb-4">
        Your Personal AI Workspace
      </p>
      
      {/* Subtitle */}
      <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
        The best chat UI for AI models — ChatGPT, Claude, Gemini, and more. 
        All in one powerful, privacy-focused interface.
      </p>

      {/* Stats/Social proof */}
      <div className="flex justify-center gap-8 mt-8">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">∞</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Messages</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">8</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Parallel Chats</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">100%</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Private</div>
        </div>
      </div>
    </div>
  );
}