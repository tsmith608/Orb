import type { NextConfig } from "next";

/**
 * Allow this dev server to be embedded in an <iframe> from the Orb chat UI
 * running on a different port (e.g. localhost:3000 iframing localhost:3001).
 *
 * Without this, Next.js sets `X-Frame-Options: SAMEORIGIN` by default,
 * which modern browsers use to block cross-origin (cross-port) iframes.
 *
 * Docs: https://nextjs.org/docs/app/api-reference/config/next-config-js/headers
 */
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Remove the SAMEORIGIN restriction so any origin can embed this.
          { key: "X-Frame-Options", value: "ALLOWALL" },
          // Belt-and-suspenders: also set CSP frame-ancestors to allow localhost.
          { key: "Content-Security-Policy", value: "frame-ancestors *" },
        ],
      },
    ];
  },
};

export default nextConfig;
