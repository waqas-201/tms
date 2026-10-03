import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // A stray lockfile in the user home directory made Turbopack walk past
  // this app. Pin the root so PostCSS can resolve @tailwindcss/postcss.
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
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
    ],
  },
};

export default nextConfig;

