import { useState, useEffect } from 'react';
import { X, Download, Smartphone, Monitor } from 'lucide-react';
import { Modal } from '../ui/modal';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Check if this is the first visit
    const hasSeenPrompt = localStorage.getItem('pwa-install-prompt-seen');
    const hasInstalled = localStorage.getItem('pwa-installed');
    const promptDismissed = localStorage.getItem('pwa-prompt-dismissed');

    // Don't show if already installed, dismissed, or seen before
    if (hasInstalled === 'true' || promptDismissed === 'true') {
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the default mini-infobar from appearing
      e.preventDefault();

      // Store the event for later use
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);

      // Show custom prompt on first visit
      if (!hasSeenPrompt) {
        // Small delay to let the page load first
        setTimeout(() => {
          setShowPrompt(true);
          localStorage.setItem('pwa-install-prompt-seen', 'true');
        }, 2000); // 2 second delay after page load
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for successful installation
    const handleAppInstalled = () => {
      console.log('[PWA] App successfully installed');
      localStorage.setItem('pwa-installed', 'true');
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    setIsInstalling(true);

    try {
      // Show the install prompt
      await deferredPrompt.prompt();

      // Wait for the user's response
      const { outcome } = await deferredPrompt.userChoice;

      console.log(`[PWA] User response: ${outcome}`);

      if (outcome === 'accepted') {
        localStorage.setItem('pwa-installed', 'true');
      }

      // Clear the deferred prompt
      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.error('[PWA] Error during installation:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  const handleRemindLater = () => {
    setShowPrompt(false);
    // Don't set dismissed flag, so it can show again in future sessions
  };

  // Don't render if no prompt event or shouldn't show
  if (!deferredPrompt || !showPrompt) {
    return null;
  }

  return (
    <Modal isOpen={showPrompt} onClose={handleRemindLater} className="p-0">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-[500px] max-w-[90vw] overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-8 text-white">
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center justify-center mb-4">
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
              <Download className="h-12 w-12" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center mb-2">
            Install ChatterHub
          </h2>
          <p className="text-center text-blue-100">
            Get the full app experience
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg flex-shrink-0">
                <Smartphone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Works Offline
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Access your chats and conversations even without internet
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg flex-shrink-0">
                <Monitor className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Native App Experience
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Launches in its own window with app-like interface
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg flex-shrink-0">
                <Download className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Fast & Lightweight
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Instant loading and minimal storage space required
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            <button
              onClick={handleInstallClick}
              disabled={isInstalling}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isInstalling ? (
                <>Installing...</>
              ) : (
                <>
                  <Download className="h-5 w-5" />
                  Install Now
                </>
              )}
            </button>

            <div className="flex gap-2">
              <button
                onClick={handleRemindLater}
                className="flex-1 py-2 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Maybe Later
              </button>

              <button
                onClick={handleDismiss}
                className="flex-1 py-2 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Don't Ask Again
              </button>
            </div>
          </div>

          {/* Footer Note */}
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
            You can always install later from your browser menu
          </p>
        </div>
      </div>
    </Modal>
  );
}
