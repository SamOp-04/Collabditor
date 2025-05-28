// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['yjs', 'y-websocket'],
  },
};

export default nextConfig;
