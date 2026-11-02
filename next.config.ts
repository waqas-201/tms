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
      // 1. Product detail legacy WooCommerce path
      {
        source: "/product/:slug*",
        destination: "/products/:slug*",
        permanent: true,
      },

      // 2. Core navigation legacy paths
      {
        source: "/about-us",
        destination: "/about",
        permanent: true,
      },
      {
        source: "/contact-us",
        destination: "/contact",
        permanent: true,
      },

      // 3. WooCommerce shop catalog & pagination (Fixes /shop/page/3 etc.)
      {
        source: "/shop",
        destination: "/products",
        permanent: true,
      },
      {
        source: "/shop/:slug*",
        destination: "/products",
        permanent: true,
      },

      // 4. Legacy WooCommerce categories & taxonomies (Direct to canonical /products to avoid redirect chains & canonical conflicts)
      {
        source: "/product-category/deals/:slug*",
        destination: "/products",
        permanent: true,
      },
      {
        source: "/product-category/deals",
        destination: "/products",
        permanent: true,
      },
      {
        source: "/product-category/murabba/:slug*",
        destination: "/products",
        permanent: true,
      },
      {
        source: "/product-category/murabba",
        destination: "/products",
        permanent: true,
      },
      {
        source: "/product-category/herbs-dry-fruit/:slug*",
        destination: "/products",
        permanent: true,
      },
      {
        source: "/product-category/herbs-dry-fruit",
        destination: "/products",
        permanent: true,
      },
      {
        source: "/product-category/:slug*",
        destination: "/products",
        permanent: true,
      },
      {
        source: "/product-category",
        destination: "/products",
        permanent: true,
      },
      {
        source: "/category/:slug*",
        destination: "/products",
        permanent: true,
      },
      {
        source: "/category",
        destination: "/products",
        permanent: true,
      },
      {
        source: "/categories/:slug*",
        destination: "/products",
        permanent: true,
      },
      {
        source: "/categories",
        destination: "/products",
        permanent: true,
      },
      {
        source: "/product-tag/:slug*",
        destination: "/products",
        permanent: true,
      },
      {
        source: "/product-tag",
        destination: "/products",
        permanent: true,
      },
      {
        source: "/tag/:slug*",
        destination: "/products",
        permanent: true,
      },
      {
        source: "/tag",
        destination: "/products",
        permanent: true,
      },
      {
        source: "/tags/:slug*",
        destination: "/products",
        permanent: true,
      },
      {
        source: "/tags",
        destination: "/products",
        permanent: true,
      },

      // 5. Legacy WordPress Author Archives (Fixes Track 4 404s)
      {
        source: "/author/:slug*",
        destination: "/about",
        permanent: true,
      },
      {
        source: "/author",
        destination: "/about",
        permanent: true,
      },

      // 6. Legacy WordPress Feeds & Comments (Fixes Track 4 404s)
      {
        source: "/feed/:slug*",
        destination: "/",
        permanent: true,
      },
      {
        source: "/feed",
        destination: "/",
        permanent: true,
      },
      {
        source: "/comments/feed/:slug*",
        destination: "/",
        permanent: true,
      },
      {
        source: "/comments/feed",
        destination: "/",
        permanent: true,
      },
      {
        source: "/comments/:slug*",
        destination: "/",
        permanent: true,
      },
      {
        source: "/comments",
        destination: "/",
        permanent: true,
      },

      // 7. Legacy WordPress Core & Static Asset Probes
      {
        source: "/wp-content/:slug*",
        destination: "/products",
        permanent: true,
      },
      {
        source: "/wp-includes/:slug*",
        destination: "/",
        permanent: true,
      },
      {
        source: "/wp-admin/:slug*",
        destination: "/login",
        permanent: true,
      },
      {
        source: "/wp-login.php",
        destination: "/login",
        permanent: true,
      },

      // 8. Legacy Blog and Articles
      {
        source: "/blogs/:slug*",
        destination: "/",
        permanent: true,
      },
      {
        source: "/blogs",
        destination: "/",
        permanent: true,
      },
      {
        source: "/blog/:slug*",
        destination: "/",
        permanent: true,
      },
      {
        source: "/blog",
        destination: "/",
        permanent: true,
      },
      {
        source: "/article/:slug*",
        destination: "/",
        permanent: true,
      },
      {
        source: "/articles/:slug*",
        destination: "/",
        permanent: true,
      },

      // 9. WooCommerce account, cart & checkout paths
      {
        source: "/cart/:slug*",
        destination: "/checkout",
        permanent: true,
      },
      {
        source: "/cart",
        destination: "/checkout",
        permanent: true,
      },
      {
        source: "/my-account/:slug*",
        destination: "/account",
        permanent: true,
      },
      {
        source: "/my-account",
        destination: "/account",
        permanent: true,
      },
      {
        source: "/order-tracking",
        destination: "/track-order",
        permanent: true,
      },

      // 10. Legacy WordPress sitemaps
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
