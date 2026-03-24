import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 移除静态导出，使用Vercel托管API
  images: {
    unoptimized: true
  }
};

export default nextConfig;
