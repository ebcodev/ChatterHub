import { Check, DollarSign, Lock, Layers, Zap } from 'lucide-react';

const benefits = [
  {
    icon: DollarSign,
    title: 'No Monthly Fees',
    description: 'Bring your own API keys and pay only for what you use. No subscriptions or hidden costs.',
    highlights: ['Pay per use', 'No recurring fees', 'Full cost transparency']
  },
  {
    icon: Lock,
    title: 'Complete Privacy',
    description: 'Your data never leaves your device. We cannot see your conversations or API keys.',
    highlights: ['100% local storage', 'Zero tracking', 'Encrypted keys']
  },
  {
    icon: Layers,
    title: 'All Models, One Place',
    description: 'Access every major AI model through a unified interface designed for productivity.',
    highlights: ['GPT-4o', 'Claude 3.5', 'Gemini Pro']
  },
  {
    icon: Zap,
    title: 'Professional Features',
    description: 'Built for power users with advanced features that enhance your AI workflow.',
    highlights: ['System prompts', 'Parallel windows', 'Smart folders']
  }
];

export default function BenefitsSection() {
  return (
    <div className="px-8 py-10 bg-white dark:bg-gray-800">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-3">
          Why Choose ChatterHub?
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-10">
          The smart choice for AI power users
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {benefits.map((benefit, index) => (
            <div 
              key={index}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity" />
              
              <div className="relative p-6 rounded-xl border border-gray-200 dark:border-gray-700 h-full">
                {/* Icon */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
                      <benefit.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  
                  {/* Title and description */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {benefit.description}
                    </p>
                    
                    {/* Highlights */}
                    <div className="space-y-1">
                      {benefit.highlights.map((highlight, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {highlight}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison visualization placeholder */}
        <div className="mt-10 p-8 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 border border-blue-200 dark:border-blue-900">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              See the Difference
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                <div className="font-medium text-gray-900 dark:text-white mb-2">ChatGPT Plus</div>
                <div className="text-gray-600 dark:text-gray-400">$20/month</div>
                <div className="text-gray-600 dark:text-gray-400">One model only</div>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-lg transform scale-105">
                <div className="font-bold mb-2">ChatterHub</div>
                <div>~$5/month usage</div>
                <div>All models included</div>
              </div>
              
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                <div className="font-medium text-gray-900 dark:text-white mb-2">Claude Pro</div>
                <div className="text-gray-600 dark:text-gray-400">$20/month</div>
                <div className="text-gray-600 dark:text-gray-400">One model only</div>
              </div>
            </div>
            
            <p className="mt-4 text-xs text-gray-600 dark:text-gray-400">
              * Average usage cost based on typical user patterns
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}