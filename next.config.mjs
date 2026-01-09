// @ts-check
/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
!process.env.SKIP_ENV_VALIDATION && (await import("./src/env/server.mjs"));
import createMDX from "@next/mdx";

/** @type {import("next").NextConfig} */
const config = {
  //output: 'export',
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      /* Prod */
      {
        hostname: "chatterhub.site",
      },
      /* Dev */
      {
        protocol: "http",
        hostname: "10.221.182.22",
        port: "54321",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "54321",
      },
    ],
  },
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"], // Enable MDX pages
  async headers() {
    return [
      // PWA Service Worker headers
      {
        source: "/sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
        ],
      },
      // PWA Manifest headers
      {
        source: "/site.webmanifest",
        headers: [
          {
            key: "Content-Type",
            value: "application/manifest+json",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=604800, immutable",
          },
        ],
      },
      {
        source: "/privacy",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' app.termly.io vercel.live",
              "frame-src 'self' app.termly.io",
              "connect-src 'self' app.termly.io",
              "img-src 'self' data: https:",
              "style-src 'self' 'unsafe-inline'",
            ].join("; "),
          },
        ],
      },
      {
        source: "/terms",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' app.termly.io vercel.live",
              "frame-src 'self' app.termly.io",
              "connect-src 'self' app.termly.io",
              "img-src 'self' data: https:",
              "style-src 'self' 'unsafe-inline'",
            ].join("; "),
          },
        ],
      },
    ];
  },
  // Enable WebAssembly to allow TikToken to accurately count tokens
  webpack: (config) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };
    return config;
  },
};

const withMDX = createMDX({
  // Add markdown plugins here, as desired
});

export default withMDX(config);
