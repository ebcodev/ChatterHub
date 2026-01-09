import { Checkout } from '@polar-sh/nextjs';

export default Checkout({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  successUrl: `http://chatterhub.site?success=true&checkout_id={CHECKOUT_ID}`,
  returnUrl: 'http://chatterhub.site',
  server: process.env.VERCEL_ENV === 'production' ? undefined : 'sandbox',
});