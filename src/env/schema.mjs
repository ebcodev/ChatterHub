// @ts-check
import { z } from "zod";

/**
 * Specify your server-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 */
export const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "preview", "production"]),

  // Polar (server-side only)
  POLAR_ORGANIZATION_ID: z.string(),
  POLAR_ACCESS_TOKEN: z.string(),

  // Inngest (only required in production)
  INNGEST_EVENT_KEY: z.string().optional(),
  INNGEST_SIGNING_KEY: z.string().optional(),
});

/**
 * You can't destruct `process.env` as a regular object in the Next.js
 * middleware, so you have to do it manually here.
 * @type {{ [k in keyof z.input<typeof serverSchema>]: string | undefined }}
 */
export const serverEnv = {
  NODE_ENV: process.env.NODE_ENV,

  // Polar
  POLAR_ORGANIZATION_ID: process.env.POLAR_ORGANIZATION_ID,
  POLAR_ACCESS_TOKEN: process.env.POLAR_ACCESS_TOKEN,

  // Inngest
  INNGEST_EVENT_KEY: process.env.INNGEST_EVENT_KEY,
  INNGEST_SIGNING_KEY: process.env.INNGEST_SIGNING_KEY,
};

/**
 * Specify your client-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 * To expose them to the client, prefix them with `NEXT_PUBLIC_`.
 */
export const clientSchema = z.object({
  NEXT_PUBLIC_ENVIRONMENT: z.enum(["development", "preview", "production"]),
  NEXT_PUBLIC_REFERRER_URL: z.string().default("https://chatterhub.site"),
  NEXT_PUBLIC_POLAR_BILLING_PORTAL: z.string(),
  NEXT_PUBLIC_POLAR_PRODUCT_ID_MONTHLY: z.string(),
  NEXT_PUBLIC_POLAR_PRODUCT_ID_YEARLY: z.string(),
  NEXT_PUBLIC_POLAR_PRODUCT_ID_LIFETIME: z.string(),
});

/**
 * You can't destruct `process.env` as a regular object, so you have to do
 * it manually here. This is because Next.js evaluates this at build time,
 * and only used environment variables are included in the build.
 * @type {{ [k in keyof z.input<typeof clientSchema>]: string | undefined }}
 */
export const clientEnv = {
  NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT,
  NEXT_PUBLIC_REFERRER_URL: process.env.NEXT_PUBLIC_REFERRER_URL,
  NEXT_PUBLIC_POLAR_BILLING_PORTAL: process.env.NEXT_PUBLIC_POLAR_BILLING_PORTAL,
  NEXT_PUBLIC_POLAR_PRODUCT_ID_MONTHLY: process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_MONTHLY,
  NEXT_PUBLIC_POLAR_PRODUCT_ID_YEARLY: process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_YEARLY,
  NEXT_PUBLIC_POLAR_PRODUCT_ID_LIFETIME: process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_LIFETIME,
};
