import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // A stray lockfile in the user home directory made Turbopack walk past
  // this app. Pin the root so PostCSS can resolve @tailwindcss/postcss.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
