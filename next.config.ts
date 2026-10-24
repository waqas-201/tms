import type { NextConfig } from "next";
import path from "path";

// Normalize postgres connection string early so static prerendering and build steps don't trigger pg warnings
if (process.env.DATABASE_URL) {
  try {
    const url = new URL(process.env.DATABASE_URL);
    const sslmode = url.searchParams.get("sslmode");
    if (
      sslmode &&
      ["require", "prefer", "verify-ca"].includes(sslmode) &&
      !url.searchParams.has("uselibpqcompat")
    ) {
      url.searchParams.set("uselibpqcompat", "true");
      process.env.DATABASE_URL = url.toString();
    }
  } catch {}
}

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // Playwright and local tooling reach the dev server via 127.0.0.1, which
  // Next treats as a different origin from localhost. Allow it so dev-only
  // HMR/client resources are not blocked during browser tests.
  allowedDevOrigins: ["127.0.0.1"],
  // Pin the root so Turbopack does not walk past this app due to stray lockfiles,
  // and so PostCSS can resolve @tailwindcss/postcss.
  turbopack: {
    root: path.resolve(__dirname),
  },
  compress: true,
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ufs.sh",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.ufs.sh",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "uploadthing.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "tameeresehat.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.tameeresehat.com",
        pathname: "/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/product/:slug*",
        destination: "/products/:slug*",
        permanent: true,
      },
      {
        source: "/shop",
        destination: "/products",
        permanent: true,
      },
      {
        source: "/shop/:slug*",
        destination: "/products/:slug*",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/images/:all*(svg|jpg|jpeg|png|webp|avif|ico)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
