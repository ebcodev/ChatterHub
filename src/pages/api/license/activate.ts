import { NextApiRequest, NextApiResponse } from 'next';
import { getPolarClient, getPolarOrganizationId } from '@/lib/clients/polar';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { license_key, label, meta } = req.body;

  if (!license_key || !label) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields'
    });
  }

  try {
    const polar = getPolarClient();
    const organizationId = getPolarOrganizationId();

    // Activate the license key with Polar
    const activationResult = await polar.customerPortal.licenseKeys.activate({
      key: license_key,
      organizationId: organizationId,
      label: label,
      meta: meta || {}
    });

    if (activationResult && activationResult.id) {
      // Return the activation ID and success status
      return res.status(200).json({
        success: true,
        activation_id: activationResult.id,
        license_key_id: activationResult.licenseKeyId,
        label: activationResult.label
      });
    } else {
      return res.status(400).json({
        success: false,
        error: 'Failed to activate license'
      });
    }
  } catch (error: any) {
    console.error('License activation error:', error);

    // Handle configuration errors
    if (error.message?.includes('not configured')) {
      return res.status(500).json({
        success: false,
        error: 'License activation service not configured'
      });
    }

    // Handle specific Polar API errors
    if (error.statusCode === 422) {
      // Validation error - likely activation limit reached
      if (error.body?.detail) {
        const detail = error.body.detail;
        if (typeof detail === 'string' && detail.includes('activation limit')) {
          return res.status(422).json({
            success: false,
            error: 'Activation limit reached. Please deactivate another device to continue.'
          });
        }
      }
      return res.status(422).json({
        success: false,
        error: 'Invalid activation request'
      });
    }

    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        error: 'License key not found'
      });
    }

    // Generic error
    return res.status(500).json({
      success: false,
      error: 'Failed to activate license. Please try again later.'
    });
  }
}