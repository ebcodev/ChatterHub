'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import toast from 'react-hot-toast';
import { useLocalStorage } from 'usehooks-ts';

/**
 * License Context manages the application's licensing state and activation.
 * It handles license validation, device activation tracking, and message limits.
 */

interface LicenseContextType {
  isLicensed: boolean;
  licenseKey: string | null;
  licenseStatus: 'checking' | 'valid' | 'invalid' | 'expired' | 'none';
  customerId: string | null;
  todayMessageCount: number;
  canCreateSubchat: boolean;
  canUseSystemPrompts: boolean;
  activateLicense: (key: string) => Promise<boolean>;
  checkMessageLimit: () => boolean;
}

// Check license validity every 6 hours
const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

// API response types
interface ValidateResponse {
  valid: boolean;
  expired?: boolean;
  customerId?: string;
  error?: string;
  isRateLimit?: boolean;
}

interface ActivateResponse {
  success: boolean;
  activation_id?: string;
  error?: string;
}

const LicenseContext = createContext<LicenseContextType | undefined>(undefined);

/**
 * Detects browser and OS from user agent
 */
function getDeviceName(): string {
  const userAgent = navigator.userAgent;
  let browser = 'Browser';
  let os = 'Unknown OS';

  // Detect browser
  if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Edge')) browser = 'Edge';

  // Detect OS
  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Mac')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';

  return os !== 'Unknown OS' ? `${browser} on ${os}` : browser;
}

export function LicenseProvider({ children }: { children: React.ReactNode }) {
  const [licenseStatus, setLicenseStatus] = useState<'checking' | 'valid' | 'invalid' | 'expired' | 'none'>('checking');

  // Derive isLicensed from licenseStatus
  const isLicensed = licenseStatus === 'valid';

  // Persistent state using localStorage
  const [licenseKey, setLicenseKey] = useLocalStorage<string | null>('CH_licenseKey', null);
  const [customerId, setCustomerId] = useLocalStorage<string | null>('CH_customerId', null);
  const [activationId, setActivationId] = useLocalStorage<string | null>('CH_activationId', null);
  const [lastValidation, setLastValidation] = useLocalStorage<number | null>('CH_lastValidation', null);

  // Prevent concurrent validations
  const isValidatingRef = useRef(false);

  /**
   * Count today's messages for free tier limits
   */
  const todayMessages = useLiveQuery(async () => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const tomorrowStart = new Date();
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    tomorrowStart.setHours(0, 0, 0, 0);

    return await db.messages
      .where('role')
      .equals('user')
      .and(msg => {
        const msgDate = new Date(msg.createdAt);
        return msgDate >= todayStart && msgDate < tomorrowStart;
      })
      .toArray();
  }, []);

  const todayMessageCount = todayMessages?.length || 0;

  /**
   * Validate a stored license key with Polar
   */
  const validateStoredLicense = async (key: string): Promise<boolean> => {
    // Prevent concurrent validations
    if (isValidatingRef.current) {
      console.log('Validation already in progress, skipping...');
      return isLicensed;
    }
    
    isValidatingRef.current = true;
    
    try {
      const response = await fetch('/api/license/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          license_key: key,
          activation_id: activationId,
          device_info: {
            platform: 'web',
            language: navigator.language,
            screen: `${window.screen.width}x${window.screen.height}`
          }
        }),
      });
      
      const data: ValidateResponse = await response.json();
      
      // Handle rate limiting - don't change license status
      if (response.status === 429) {
        console.log('Rate limited by Polar API, will retry in next validation cycle');
        return isLicensed;
      }
      
      // Handle server errors - maintain current status
      if (response.status >= 500) {
        console.log('Server error during validation, maintaining current license status');
        return isLicensed;
      }

      if (data.valid) {
        setLicenseStatus('valid');
        if (data.customerId) {
          setCustomerId(data.customerId);
        }
        setLastValidation(Date.now());
        return true;
      } else {
        // License is invalid or expired - silently downgrade to free tier
        setLicenseStatus(data.expired ? 'expired' : 'invalid');
        setCustomerId(null);
        
        // No error toast - just silently treat as free tier
        
        return false;
      }
    } catch (error) {
      console.error('Failed to validate license:', error);
      // Maintain current status on network errors
      return isLicensed;
    } finally {
      isValidatingRef.current = false;
    }
  };

  /**
   * Activate and store a new license key
   */
  const activateLicense = async (key: string): Promise<boolean> => {
    if (!key.trim()) {
      toast.error('Please enter a license key');
      return false;
    }

    setLicenseStatus('checking');

    try {
      const response = await fetch('/api/license/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          license_key: key,
          label: getDeviceName(),
          meta: {
            platform: 'web',
            language: navigator.language,
            screen: `${window.screen.width}x${window.screen.height}`
          }
        }),
      });

      const data: ActivateResponse = await response.json();

      if (data.success && data.activation_id) {
        // Store activation data
        setActivationId(data.activation_id);
        setLicenseKey(key);
        setLicenseStatus('valid');
        setLastValidation(Date.now());
        toast.success('License activated! Enjoy your premium features!');
        return true;
      } else {
        // Handle activation errors
        if (data.error?.includes('limit')) {
          toast.error('Activation limit reached. Please deactivate another device first via the billing portal.');
        } else {
          toast.error(data.error || 'Failed to activate license');
        }
        setLicenseStatus('invalid');
        return false;
      }
    } catch (error) {
      console.error('Failed to activate license:', error);
      toast.error('Failed to activate license. Please try again.');
      setLicenseStatus('invalid');
      return false;
    }
  };

  /**
   * Check if the user can send more messages (free tier limit)
   */
  const checkMessageLimit = useCallback((): boolean => {
    if (isLicensed) return true;

    const remaining = 5 - todayMessageCount;
    if (remaining <= 0) {
      toast.error('Daily message limit reached (5/5). Upgrade to send unlimited messages!');
      return false;
    }

    if (remaining <= 2) {
      toast(`${remaining} message${remaining === 1 ? '' : 's'} remaining today`, {
        icon: '⚠️',
      });
    }

    return true;
  }, [isLicensed, todayMessageCount]);

  /**
   * Initialize and set up periodic validation
   */
  useEffect(() => {
    if (!licenseKey) {
      setLicenseStatus('none');
      return;
    }

    const now = Date.now();

    // Initial validation if needed
    if (!lastValidation || (now - lastValidation) >= SIX_HOURS_MS) {
      void validateStoredLicense(licenseKey);
    } else {
      // Use cached valid status within 6-hour window
      setLicenseStatus('valid');
    }

    // Set up periodic validation
    const interval = setInterval(async () => {
      const currentTime = Date.now();
      const timeSinceLastValidation = lastValidation ? currentTime - lastValidation : SIX_HOURS_MS;
      
      if (timeSinceLastValidation >= SIX_HOURS_MS) {
        await validateStoredLicense(licenseKey);
      }
    }, SIX_HOURS_MS);

    return () => clearInterval(interval);
  }, [licenseKey]); // Only depend on licenseKey

  const value: LicenseContextType = {
    isLicensed,
    licenseKey,
    licenseStatus,
    customerId,
    todayMessageCount,
    canCreateSubchat: isLicensed,
    canUseSystemPrompts: isLicensed,
    activateLicense,
    checkMessageLimit,
  };

  return (
    <LicenseContext.Provider value={value}>
      {children}
    </LicenseContext.Provider>
  );
}

export function useLicense() {
  const context = useContext(LicenseContext);
  if (!context) {
    throw new Error('useLicense must be used within a LicenseProvider');
  }
  return context;
}