/**
 * Service Worker Registration Utility
 * Handles registration, updates, and lifecycle of the PWA service worker
 */

export const registerServiceWorker = async (): Promise<void> => {
  // Check if service workers are supported
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.log('[SW] Service Workers not supported');
    return;
  }

  try {
    // Wait for the page to load
    if (document.readyState === 'loading') {
      await new Promise((resolve) => {
        window.addEventListener('load', resolve);
      });
    }

    // Register the service worker
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('[SW] Service Worker registered successfully:', registration.scope);

    // Check for updates on load
    registration.update();

    // Handle service worker updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;

      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New service worker available
          console.log('[SW] New version available! Reload to update.');

          // Optionally show a notification to the user
          if (window.confirm('A new version of ChatterHub is available. Reload to update?')) {
            newWorker.postMessage({ type: 'SKIP_WAITING' });
            window.location.reload();
          }
        }
      });
    });

    // Handle controller change (new service worker activated)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[SW] Service Worker controller changed');
    });

    // Check if we're already controlled by a service worker
    if (navigator.serviceWorker.controller) {
      console.log('[SW] Page is currently controlled by a Service Worker');
    }
  } catch (error) {
    console.error('[SW] Service Worker registration failed:', error);
  }
};

export const unregisterServiceWorker = async (): Promise<boolean> => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();

    if (registration) {
      const unregistered = await registration.unregister();
      console.log('[SW] Service Worker unregistered:', unregistered);
      return unregistered;
    }

    return false;
  } catch (error) {
    console.error('[SW] Service Worker unregistration failed:', error);
    return false;
  }
};

export const checkServiceWorkerStatus = async (): Promise<{
  supported: boolean;
  registered: boolean;
  controller: boolean;
}> => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return {
      supported: false,
      registered: false,
      controller: false,
    };
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();

    return {
      supported: true,
      registered: !!registration,
      controller: !!navigator.serviceWorker.controller,
    };
  } catch (error) {
    console.error('[SW] Error checking Service Worker status:', error);
    return {
      supported: true,
      registered: false,
      controller: false,
    };
  }
};
