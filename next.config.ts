import type { NextConfig } from "next";

const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  // During development the site is opened from the iPhone through the PC's
  // LAN address. Next.js 16 blocks dev-only client assets/HMR coming from a
  // hostname different from localhost unless it is explicitly allowed.
  // Without this, the server-rendered HTML is visible on the phone, but React
  // does not hydrate: + / - do nothing and submitting a form reloads the page.
  allowedDevOrigins: ["192.168.56.1"],
  images: supabaseHostname
    ? {
        remotePatterns: [
          {
            protocol: "https",
            hostname: supabaseHostname,
            pathname: "/storage/v1/object/public/tour-images/**",
          },
          {
            protocol: "https",
            hostname: supabaseHostname,
            pathname: "/storage/v1/object/public/gallery-images/**",
          },
        ],
      }
    : undefined,
};

export default nextConfig;
