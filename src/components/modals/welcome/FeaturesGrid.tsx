import { 
  MessageSquare, 
  Brain, 
  FolderTree, 
  Shield, 
  Columns, 
  Mic,
  Sparkles,
  Download
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'Multi AI Models',
    description: 'Access ChatGPT, Claude, Gemini, and more through a single interface',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: Columns,
    title: 'Parallel Chats',
    description: 'Compare responses from different models side-by-side in up to 8 windows',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: FolderTree,
    title: 'Smart Organization',
    description: 'Organize chats with nested folders and powerful search capabilities',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'All data stored locally on your device. Zero tracking or data collection',
    color: 'from-orange-500 to-red-500'
  },
  {
    icon: Sparkles,
    title: 'System Prompts',
    description: 'Customize AI behavior with folder and chat-level system prompts',
    color: 'from-yellow-500 to-amber-500'
  },
  {
    icon: Mic,
    title: 'Voice Input',
    description: 'Speak your thoughts with built-in speech-to-text capabilities',
    color: 'from-indigo-500 to-purple-500'
  }
];

export default function FeaturesGrid() {
  return (
    <div className="px-8 py-10 bg-white dark:bg-gray-800">
      <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
        Everything You Need in One Place
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <div 
            key={index}
            className="group relative p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all hover:shadow-lg"
          >
            {/* Icon with gradient background */}
            <div className="mb-4">
              <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${feature.color} bg-opacity-10`}>
                <feature.icon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              </div>
            </div>
            
            {/* Title */}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {feature.title}
            </h3>
            
            {/* Description */}
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {feature.description}
            </p>
            
            {/* Hover effect gradient */}
            <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none`} />
          </div>
        ))}
      </div>

      {/* Image placeholder area */}
      <div className="mt-10 p-6 rounded-xl bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-700">
        <div className="flex items-center justify-center text-gray-400 dark:text-gray-600">
          <Download className="h-8 w-8 mr-3" />
          <div>
            <p className="font-medium">Feature Preview</p>
            <p className="text-sm">Screenshots and demos coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
}