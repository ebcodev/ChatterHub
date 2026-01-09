import { X, Check, Crown, Gift, Key, Folder, MessageSquare, Palette, Mic, Shield, Brain, HelpCircle, Monitor } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useLicense } from '@/contexts/LicenseContext';
import { Modal } from '../ui/modal';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import toast from 'react-hot-toast';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  showPurchaseSuccess?: boolean;
}

// FAQ data structure
const faqData = [
  {
    question: "Is ChatterHub free to use?",
    answer: "Yes! ChatterHub has a free tier with 5 messages per day. For unlimited messages and premium features, choose from monthly, yearly, or lifetime subscription plans. You'll need your own API keys from AI providers (OpenAI, Anthropic, or Google)."
  },
  {
    question: "What subscription options are available?",
    answer: "Choose from Monthly ($14.90/month), Yearly ($149/year - save $29.80), or Lifetime ($299 one-time payment). All plans include the same premium features. Monthly and yearly subscriptions can be cancelled anytime."
  },
  {
    question: "Where do I get API keys?",
    answer: "Get them directly from: OpenAI (platform.openai.com), Anthropic (console.anthropic.com), or Google AI (makersuite.google.com). Each provider has their own usage-based pricing."
  },
  {
    question: "Do I need ChatGPT Plus?",
    answer: "No! ChatGPT Plus is not required. You only need an API key, which is separate from consumer subscriptions and typically more cost-effective."
  },
  {
    question: "How much does API usage cost?",
    answer: "Very little! A typical 1000-word conversation costs under $0.01. Most users spend just a few dollars per month. You pay providers directly for actual usage."
  },
  {
    question: "Is my data private?",
    answer: "100% private. Everything is stored locally in your browser. We never see your API keys or conversations. Requests go directly from your browser to AI providers."
  },
  {
    question: "Are my API keys secure?",
    answer: "Yes! Keys are stored locally in your browser, never sent to our servers. Optional AES encryption available for extra security."
  },
  {
    question: "How many chats can I save?",
    answer: "Thousands! Limited only by your device's storage. All chats are stored locally in your browser with our powerful folder organization system."
  },
  {
    question: "Can I sync across devices?",
    answer: "Export/import is available now. Cloud sync is coming soon as an optional add-on service."
  },
  {
    question: "How is this different from ChatGPT?",
    answer: "Use multiple AI models simultaneously, organize with nested folders, customize system prompts, compare responses side-by-side, voice input, starred messages, and freeform layouts. All with complete privacy."
  },
  {
    question: "Which AI models are supported?",
    answer: "All major models! GPT-4, Claude 3.5, Gemini Pro, and more. Use different models in parallel windows to compare responses."
  },
  {
    question: "How many devices can I use?",
    answer: "Up to 5 devices per license. Perfect for laptop, desktop, tablet, and phone. Inactive devices are automatically freed after extended non-use."
  },
  {
    question: "Is there a mobile app?",
    answer: "Coming soon! Native iOS and Android apps are in development. ChatterHub currently works well in mobile browsers."
  },
  {
    question: "What's included in premium?",
    answer: "Unlimited messages, 8 parallel windows, custom system prompts, nested folders, duplicate chats, pinned conversations, incognito mode, priority support, and all future updates."
  },
  {
    question: "What's your refund policy?",
    answer: "30-day money-back guarantee. Not satisfied? Contact support@chatterhub.site within 30 days for a full refund, no questions asked."
  }
];

export default function UpgradeModal({ isOpen, onClose, showPurchaseSuccess = false }: UpgradeModalProps) {
  const { isLicensed, activateLicense, licenseStatus } = useLicense();
  const [licenseInput, setLicenseInput] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  const handleActivateLicense = async () => {
    if (!licenseInput.trim()) {
      toast.error('Please enter a license key');
      return;
    }

    setIsActivating(true);
    const success = await activateLicense(licenseInput);
    setIsActivating(false);

    if (success) {
      setLicenseInput('');
      onClose();
    }
  };

  // Auto-scroll carousel
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel || isPaused || !isOpen) return;

    const scrollSpeed = 1.0; // pixels per frame (2x faster)
    let animationFrameId: number;

    const scroll = () => {
      // For infinite loop: when we scroll past halfway, reset to start seamlessly
      const halfWidth = carousel.scrollWidth / 2;
      if (carousel.scrollLeft >= halfWidth) {
        carousel.scrollLeft = 0;
      } else {
        carousel.scrollLeft += scrollSpeed;
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPaused, isOpen]);

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: '',
      features: [
        '5 messages per day',
        'Access to all AI models',
        '1 parallel chat window',
        'Folder organization',
        'Local data storage',
        'No system prompts',
      ],
      popular: false,
      buttonText: 'Current Plan',
      disabled: true,
    },
    {
      name: 'Monthly Subscription',
      price: '$14.90',
      period: 'per month',
      features: [
        'Unlimited messages',
        'Access to all AI models',
        'Up to 8 parallel chat windows',
        'Custom system prompts',
        'Folder organization',
        'Folder system prompts',
        'Duplicate chat groups',
        'Pin important chats',
        'Incognito mode (auto-delete)',
        'Priority support',
        'Cancel anytime',
      ],
      popular: false,
      buttonText: 'Subscribe Monthly',
      disabled: false,
    },
    {
      name: 'Yearly Subscription',
      price: '$149',
      period: 'per year',
      features: [
        'Unlimited messages',
        'Access to all AI models',
        'Up to 8 parallel chat windows',
        'Custom system prompts',
        'Folder organization',
        'Folder system prompts',
        'Duplicate chat groups',
        'Pin important chats',
        'Incognito mode (auto-delete)',
        'Priority support',
        'Save $29.80 vs monthly',
      ],
      popular: true,
      buttonText: 'Subscribe Yearly',
      disabled: false,
    },
    {
      name: 'Lifetime Subscription',
      price: '$299',
      period: 'one-time',
      features: [
        'Unlimited messages',
        'Access to all AI models',
        'Up to 8 parallel chat windows',
        'Custom system prompts',
        'Folder organization',
        'Folder system prompts',
        'Duplicate chat groups',
        'Pin important chats',
        'Incognito mode (auto-delete)',
        'Priority support',
        'Lifetime updates',
      ],
      popular: false,
      buttonText: 'Get Lifetime Access',
      disabled: false,
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-[700px] max-w-[90vw] max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="h-6 w-6 text-yellow-500" />
              <h2 className="text-xl font-semibold dark:text-white">Upgrade ChatterHub</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Purchase Success Message */}
            {showPurchaseSuccess && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-3">
                  <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <h3 className="font-semibold text-green-900 dark:text-green-100">Purchase Successful!</h3>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                  Thank you for your purchase! Please check your email for your license key.
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Once you receive your license key, enter it below to activate ChatterHub Premium.
                </p>
              </div>
            )}

            {/* License Activation Section */}
            {!isLicensed && (
              <div className="mb-8 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-gray-800 dark:to-gray-900 rounded-lg border border-yellow-200 dark:border-yellow-900">
                <div className="flex items-center gap-2 mb-3">
                  <Key className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Have a license key?</h3>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={licenseInput}
                    onChange={(e) => setLicenseInput(e.target.value)}
                    placeholder="Enter your license key"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    disabled={isActivating}
                  />
                  <button
                    onClick={handleActivateLicense}
                    disabled={isActivating || !licenseInput.trim()}
                    className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-amber-600 text-white rounded-lg font-medium hover:from-yellow-500 hover:to-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isActivating ? (
                      <>Activating...</>
                    ) : (
                      <><Monitor className="h-4 w-4" /> Activate</>
                    )}
                  </button>
                </div>
                {licenseStatus === 'invalid' && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-2">Invalid license key. Please check and try again.</p>
                )}
                {licenseStatus === 'expired' && (
                  <p className="text-sm text-orange-600 dark:text-orange-400 mt-2">This license key has expired.</p>
                )}
                <div className="mt-2 text-center">
                  <a
                    href={process.env.NEXT_PUBLIC_POLAR_BILLING_PORTAL!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:underline"
                  >
                    Forgot your license key? Click here.
                  </a>
                </div>
              </div>
            )}

            {/* Show success message for licensed users */}
            {isLicensed && (
              <div className="mb-8 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <p className="font-semibold text-green-800 dark:text-green-300">
                    You have an active premium license!
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                  <Monitor className="h-4 w-4" />
                  <span>Activated on this device</span>
                </div>
              </div>
            )}
            {/* Header Text */}
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold dark:text-white mb-2">
                Unlock the Full Power of ChatterHub
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Choose the plan that works best for you
              </p>
            </div>

            {/* Pricing Cards Carousel */}
            <div className="mb-8">
              <div
                ref={carouselRef}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                className="overflow-x-auto scrollbar-thin"
                style={{ scrollBehavior: 'auto' }}
              >
                <div className="flex gap-6 pb-4" style={{ width: 'max-content' }}>
                  {/* Render plans twice for seamless infinite loop */}
                  {[...plans, ...plans].map((plan, index) => (
                    <div
                      key={`${plan.name}-${index}`}
                      className={`relative rounded-lg border-2 p-6 flex-shrink-0 w-[280px] ${plan.popular
                        ? 'border-yellow-500 bg-gradient-to-b from-yellow-50 to-white dark:from-gray-800 dark:to-gray-900'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                        }`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                            BEST VALUE
                          </span>
                        </div>
                      )}

                      <div className="text-center mb-6">
                        <h4 className="text-lg font-semibold dark:text-white mb-2">{plan.name}</h4>
                        <div className="flex items-baseline justify-center">
                          <span className="text-3xl font-bold dark:text-white">{plan.price}</span>
                          {plan.period && (
                            <span className="text-gray-600 dark:text-gray-400 ml-2 text-sm">{plan.period}</span>
                          )}
                        </div>
                      </div>

                      <ul className="space-y-3 mb-6">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className={`h-5 w-5 mt-0.5 flex-shrink-0 ${plan.popular ? 'text-green-500' : 'text-gray-400'
                              }`} />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <button
                        disabled={plan.disabled}
                        onClick={() => {
                          const productIdMap = {
                            'Monthly Subscription': process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_MONTHLY,
                            'Yearly Subscription': process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_YEARLY,
                            'Lifetime Subscription': process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_LIFETIME,
                          };

                          const productId = productIdMap[plan.name as keyof typeof productIdMap];
                          if (productId) {
                            window.location.href = `/api/checkout?products=${productId}`;
                          }
                        }}
                        className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                          plan.disabled
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                            : plan.name === 'Monthly Subscription'
                              ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-white hover:from-gray-400 hover:to-gray-600'
                              : plan.name === 'Yearly Subscription'
                                ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white hover:from-yellow-500 hover:to-yellow-700'
                                : plan.name === 'Lifetime Subscription'
                                  ? 'bg-gradient-to-r from-slate-300 via-slate-200 to-slate-300 text-gray-800 hover:from-slate-400 hover:via-slate-300 hover:to-slate-400'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {plan.buttonText}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h4 className="text-center text-lg font-bold text-gray-800 dark:text-gray-200 mb-6">
                Explore All Features
              </h4>

              {/* Feature Categories */}
              <div className="space-y-6">
                {/* Organization & Navigation */}
                <div>
                  <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <Folder className="h-4 w-4" />
                    Organization & Navigation
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                      <span>Nested subfolders (up to 10 levels)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                      <span>Folder colors & customization</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                      <span>Pin important chats</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                      <span>Drag & drop organization</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                      <span>Search across all chats</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                      <span>Star important messages</span>
                    </div>
                  </div>
                </div>

                {/* Chat Features */}
                <div>
                  <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Chat Experience
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                      <span>Up to 8 parallel chat windows</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                      <span>Multiple layout options</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                      <span>Freeform drag & resize layout</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                      <span>Duplicate chat groups</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                      <span>Edit & delete messages</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                      <span>Real-time streaming responses</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                      <span>Markdown & code formatting</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                      <span>Incognito mode (auto-delete)</span>
                    </div>
                  </div>
                </div>

                {/* AI & Models */}
                <div>
                  <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    AI & Models
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                      <span>All OpenAI models (GPT-4o, etc)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                      <span>All Anthropic Claude models</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                      <span>Google Gemini models</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                      <span>System prompts (folder & chat)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                      <span>System prompt inheritance</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                      <span>Custom model parameters</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                      <span>Temperature & penalty controls</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                      <span>Model comparison side-by-side</span>
                    </div>
                  </div>
                </div>

                {/* Input & Output */}
                <div>
                  <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <Mic className="h-4 w-4" />
                    Input & Output
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                      <span>Voice input (speech-to-text)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                      <span>Text-to-speech output</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                      <span>Copy code blocks</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                      <span>Export conversations</span>
                    </div>
                  </div>
                </div>

                {/* Privacy & Security */}
                <div>
                  <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Privacy & Security
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                      <span>100% local data storage</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                      <span>No data sent to our servers</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                      <span>Encrypted API key storage</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                      <span>Privacy-focused design</span>
                    </div>
                  </div>
                </div>

                {/* UI & Experience */}
                <div>
                  <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    UI & Experience
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                      <span>Dark/Light mode</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                      <span>Responsive design</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                      <span>Keyboard shortcuts</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                      <span>URL bookmarking for chats</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-8">
              <h4 className="text-center text-lg font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center justify-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Frequently Asked Questions
              </h4>

              <div className="w-full max-w-[650px] mx-auto">
                <Accordion type="single" collapsible className="w-full">
                  {faqData.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="border-b border-gray-200 dark:border-gray-700">
                      <AccordionTrigger className="text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 py-3 pr-4">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-gray-600 dark:text-gray-400 pb-4 pr-8">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex-shrink-0">
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            All plans include a 30-day money-back guarantee. Cancel subscriptions anytime.
          </p>
        </div>
      </div>
    </Modal>
  );
}