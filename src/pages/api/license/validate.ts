import { NextApiRequest, NextApiResponse } from 'next';
import { getPolarClient, getPolarOrganizationId } from '@/lib/clients/polar';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get the license key and activation info from the request body
  const { license_key, activation_id } = req.body;
  if (!license_key) {
    return res.status(400).json({ valid: false, error: 'License key is required' });
  }

  try {
    // Get configured Polar client and organization ID
    const polar = getPolarClient();
    const organizationId = getPolarOrganizationId();

    // Build validation request with optional activation ID
    const validationRequest: any = {
      key: license_key,
      organizationId: organizationId,
    };

    // Include activation ID if provided
    if (activation_id) {
      validationRequest.activationId = activation_id;
    }

    // Validate the license key with Polar
    const validationResult = await polar.customerPortal.licenseKeys.validate(validationRequest);

    // Check if the license is valid
    if (validationResult && validationResult.id) {
      // License is valid - extract relevant information
      const licenseData = validationResult;

      // Check if license is expired
      if (licenseData.expiresAt) {
        const expiryDate = new Date(licenseData.expiresAt);
        if (expiryDate < new Date()) {
          return res.status(400).json({
            valid: false,
            expired: true,
            error: 'License has expired'
          });
        }
      }

      // Check usage limit if it exists
      if (licenseData.limitUsage && licenseData.usage !== undefined) {
        if (licenseData.usage >= licenseData.limitUsage) {
          return res.status(400).json({
            valid: false,
            error: `License usage limit reached (${licenseData.usage}/${licenseData.limitUsage})`
          });
        }
      }

      // Log the license data
      console.dir(licenseData, { depth: null });

      // License is valid - return customer data for portal access
      return res.status(200).json({
        valid: true,
        customerId: licenseData.customerId || licenseData.customer?.id,
        customerEmail: licenseData.customer?.email,
        customerName: licenseData.customer?.name,
      });
    } else {
      // License is not valid
      return res.status(400).json({
        valid: false,
        error: 'Invalid license key',
      });
    }
  } catch (error: any) {
    console.error('License validation error:', error);

    // Handle configuration errors
    if (error.message?.includes('not configured')) {
      return res.status(500).json({
        valid: false,
        error: 'License validation service not configured'
      });
    }

    // Handle rate limiting - MUST be before other error checks
    // Pass through 429 status so client knows not to retry
    if (error.statusCode === 429) {
      // Extract retry-after header if available
      const retryAfter = error.headers?.get?.('retry-after') || 
                         error.headers?.['retry-after'] || '60';
      
      return res.status(429).json({
        valid: false,
        error: `Rate limit exceeded. Please wait ${retryAfter} seconds before retrying.`,
        retryAfter: parseInt(retryAfter, 10),
        isRateLimit: true
      });
    }

    // Handle specific Polar API errors
    if (error.statusCode === 404) {
      return res.status(400).json({
        valid: false,
        error: 'License key not found',
      });
    }

    if (error.statusCode === 422) {
      // Check if it's an activation-related error
      if (error.body?.detail) {
        const detail = error.body.detail;
        if (typeof detail === 'string') {
          if (detail.includes('activation')) {
            return res.status(400).json({
              valid: false,
              error: 'Invalid or missing activation. Please re-enter your license key.',
              requiresActivation: true
            });
          }
        }
      }
      return res.status(400).json({
        valid: false,
        error: 'Invalid license key format',
      });
    }

    // Generic error - only use 500 for actual server errors
    return res.status(500).json({
      valid: false,
      error: 'Failed to validate license. Please try again later.',
    });
  }
}