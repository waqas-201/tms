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

// Legacy WordPress/WooCommerce sitemaps still listed in Search Console.
// Redirect them to the single live Next.js sitemap.
const LEGACY_SITEMAP_PATHS = [
  "/sitemap_index.xml",
  "/wp-sitemap.xml",
  "/product-sitemap.xml",
  "/page-sitemap.xml",
  "/sitemap-0.xml",
  "/sitemap.xml.gz",
];

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  allowedDevOrigins: ["127.0.0.1"],
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
      ...LEGACY_SITEMAP_PATHS.map((source) => ({
        source,
        destination: "/sitemap.xml",
        permanent: true,
      })),
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
