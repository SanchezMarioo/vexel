import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://app.cal.com https://va.vercel-scripts.com https://*.clerk.accounts.dev https://clerk.xync.es https://*.clerk.com https://challenges.cloudflare.com${isDev ? " 'unsafe-eval' http://localhost:8400" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  // cdn.sanity.io: imágenes del blog | img.clerk.com: avatares de Clerk
  "img-src 'self' data: blob: https://images.unsplash.com https://cdn.sanity.io https://img.clerk.com https://images.clerk.dev",
  "font-src 'self' data:",
  // APIs: Sanity, Cal.com, Vercel, Supabase, Clerk
  `connect-src 'self' https://app.cal.com https://va.vercel-scripts.com https://*.api.sanity.io wss://*.api.sanity.io https://*.apicdn.sanity.io https://sanity-cdn.com https://*.sanity-cdn.com https://*.supabase.co wss://*.supabase.co https://*.clerk.accounts.dev wss://*.clerk.accounts.dev https://clerk.xync.es https://*.clerk.com${isDev ? " ws: wss: http://localhost:* http://127.0.0.1:*" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-src https://app.cal.com https://challenges.cloudflare.com https://*.clerk.accounts.dev https://*.clerk.com",
  "worker-src 'self' blob:",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders: Array<{ key: string; value: string }> = [
  {
    key: "Content-Security-Policy",
    value: contentSecurityPolicy,
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
  },
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin",
  },
  {
    key: "Cross-Origin-Resource-Policy",
    value: "same-site",
  },
];

if (!isDev) {
  securityHeaders.push({
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  });
}

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        // Imágenes del blog servidas desde Sanity CDN (optimizadas por next/image).
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        source: "/portfolio/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, max-age=0, must-revalidate",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
          {
            key: "Expires",
            value: "0",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
