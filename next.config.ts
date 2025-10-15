import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 启用实验性功能
  experimental: {
    // 其他实验性功能可以在这里配置
  },
  
  // 服务端外部包配置
  serverExternalPackages: [],
  
  // 图片优化配置
  images: {
    domains: [
      'webapi.amap.com',
      'restapi.amap.com',
      'a.amap.com',
      'b.amap.com',
      'c.amap.com',
      'd.amap.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.amap.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // 环境变量配置
  env: {
    NEXT_PUBLIC_AMAP_KEY: process.env.NEXT_PUBLIC_AMAP_KEY || 'YOUR_AMAP_KEY',
    NEXT_PUBLIC_AMAP_SECURITY_JS_CODE: process.env.NEXT_PUBLIC_AMAP_SECURITY_JS_CODE || '',
  },

  // 头部配置，用于地图API
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
      },
    ];
  },

  // 重写配置，用于API代理
  async rewrites() {
    return [
      {
        source: '/api/amap/:path*',
        destination: 'https://restapi.amap.com/:path*',
      },
    ];
  },

  // Webpack配置
  webpack: (config, { isServer }) => {
    // 添加对高德地图的支持
    config.externals = config.externals || [];
    
    if (!isServer) {
      config.externals.push({
        'AMap': 'AMap',
        'AMapUI': 'AMapUI'
      });
    }

    return config;
  },

  // 输出配置 (仅在生产环境使用)
  // output: 'standalone',
  
  // 启用严格模式
  reactStrictMode: true,
  
  // SWC编译器默认启用
  
  // 启用压缩
  compress: true,
  
  // 启用源码映射（开发环境）
  productionBrowserSourceMaps: false,
};

export default nextConfig;
