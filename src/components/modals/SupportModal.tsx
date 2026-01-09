import { X, Mail, HelpCircle, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Modal } from '../ui/modal';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SupportModal({ isOpen, onClose }: SupportModalProps) {
  const [copied, setCopied] = useState(false);
  const supportEmail = 'support@chatterhub.site';

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(supportEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy email:', err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-[500px]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-6 w-6 text-blue-500" />
              <h2 className="text-xl font-semibold dark:text-white">Support</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Need Help?
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              We're here to help! Reach out to our support team with any questions or issues.
            </p>
          </div>

          {/* Email Section */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-6">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Support Email
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 flex items-center">
                <span className="text-gray-900 dark:text-white font-mono text-sm">
                  {supportEmail}
                </span>
              </div>
              <button
                onClick={handleCopyEmail}
                className="px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                title="Copy email address"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200" />
                )}
              </button>
            </div>
          </div>

          {/* Response Time Notice */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
              </div>
              <div>
                <p className="text-sm text-blue-900 dark:text-blue-100 font-medium mb-1">
                  Quick Response Time
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  We typically respond within 24 hours during business days.
                </p>
              </div>
            </div>
          </div>

          {/* What to Include */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              When contacting support, please include:
            </h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  A clear description of the issue you're experiencing
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Your browser and operating system information
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Any error messages you've encountered
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Your license key (if applicable)
                </span>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </Modal>
  );
}