import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  distDir: 'out',
};

export default nextConfig;
