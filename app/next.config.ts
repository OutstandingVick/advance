import type { NextConfig } from 'next';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const nextConfig: NextConfig = {
  webpack(config) {
    config.resolve.alias.ethers = require.resolve('ethers');
    return config;
  },
};

export default nextConfig;
