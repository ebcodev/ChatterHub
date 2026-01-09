import { Key, MessageSquare, FolderOpen, Rocket } from 'lucide-react';

const steps = [
  {
    icon: Key,
    number: '1',
    title: 'Add Your API Keys',
    description: 'Get API keys from OpenAI, Anthropic, or Google and add them in Settings',
    image: '/images/onboarding/api-keys.png' // Placeholder for actual image
  },
  {
    icon: MessageSquare,
    number: '2',
    title: 'Start Your First Chat',
    description: 'Click "New Chat" and choose your preferred AI model to begin',
    image: '/images/onboarding/new-chat.png' // Placeholder for actual image
  },
  {
    icon: FolderOpen,
    number: '3',
    title: 'Organize with Folders',
    description: 'Create folders to organize your chats by project, topic, or any way you like',
    image: '/images/onboarding/folders.png' // Placeholder for actual image
  },
  {
    icon: Rocket,
    number: '4',
    title: 'Explore Advanced Features',
    description: 'Try parallel chats, system prompts, and voice input for a supercharged experience',
    image: '/images/onboarding/advanced.png' // Placeholder for actual image
  }
];

export default function QuickStartSection() {
  return (
    <div className="px-8 py-10 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-3">
          Get Started in Minutes
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
          Follow these simple steps to unlock the full power of ChatterHub
        </p>

        <div className="space-y-6">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="flex flex-col md:flex-row items-center gap-6 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
            >
              {/* Step number and icon */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <step.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 flex items-center justify-center text-sm font-bold">
                    {step.number}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {step.description}
                </p>
              </div>

              {/* Image placeholder */}
              <div className="w-full md:w-48 h-32 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <div className="text-center text-gray-400 dark:text-gray-600">
                  <div className="text-xs">Step {step.number}</div>
                  <div className="text-xs">Preview</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Progress indicator */}
        <div className="mt-8 flex justify-center">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((num) => (
              <div
                key={num}
                className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}