import { Polar } from '@polar-sh/sdk';

/**
 * Get a configured Polar client instance
 * @returns Configured Polar SDK client
 */
export function getPolarClient(): Polar {
  const accessToken = process.env.POLAR_ACCESS_TOKEN;
  
  if (!accessToken) {
    throw new Error('POLAR_ACCESS_TOKEN is not configured');
  }

  return new Polar({
    server: process.env.VERCEL_ENV === 'production' ? undefined : 'sandbox',
    accessToken,
  });
}

/**
 * Get the Polar organization ID from environment
 * @returns Organization ID or throws if not configured
 */
export function getPolarOrganizationId(): string {
  const organizationId = process.env.POLAR_ORGANIZATION_ID;
  
  if (!organizationId) {
    throw new Error('POLAR_ORGANIZATION_ID is not configured');
  }
  
  return organizationId;
}