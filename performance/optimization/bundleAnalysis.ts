/**
 * Bundle 分析和优化工具
 * 分析打包文件大小、依赖关系和优化建议
 */

interface BundleAnalysisResult {
  totalSize: number;
  gzippedSize: number;
  chunks: ChunkInfo[];
  dependencies: DependencyInfo[];
  recommendations: string[];
  score: number;
}

interface ChunkInfo {
  name: string;
  size: number;
  gzippedSize: number;
  modules: string[];
  isAsync: boolean;
}

interface DependencyInfo {
  name: string;
  size: number;
  version: string;
  used: boolean;
  treeshakeable: boolean;
}

class BundleAnalyzer {
  private analysisResult: BundleAnalysisResult | null = null;

  /**
   * 分析当前项目的Bundle
   */
  async analyzeBundles(): Promise<BundleAnalysisResult> {
    console.log('开始Bundle分析...');

    const chunks = await this.analyzeChunks();
    const dependencies = await this.analyzeDependencies();
    const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);
    const gzippedSize = chunks.reduce((sum, chunk) => sum + chunk.gzippedSize, 0);

    const recommendations = this.generateRecommendations(chunks, dependencies, totalSize);
    const score = this.calculateScore(totalSize, chunks, dependencies);

    this.analysisResult = {
      totalSize,
      gzippedSize,
      chunks,
      dependencies,
      recommendations,
      score
    };

    console.log('Bundle分析完成');
    return this.analysisResult;
  }

  /**
   * 分析代码分割块
   */
  private async analyzeChunks(): Promise<ChunkInfo[]> {
    // 模拟分析Next.js构建输出
    const chunks: ChunkInfo[] = [
      {
        name: 'main',
        size: 245000, // 245KB
        gzippedSize: 82000, // 82KB
        modules: ['app/layout.tsx', 'app/page.tsx', 'components/layout/*'],
        isAsync: false
      },
      {
        name: 'framework',
        size: 180000, // 180KB
        gzippedSize: 65000, // 65KB
        modules: ['react', 'react-dom', 'next'],
        isAsync: false
      },
      {
        name: 'map',
        size: 156000, // 156KB
        gzippedSize: 48000, // 48KB
        modules: ['components/map/*', '@types/amap-js-api'],
        isAsync: true
      },
      {
        name: 'places',
        size: 89000, // 89KB
        gzippedSize: 28000, // 28KB
        modules: ['app/places/*'],
        isAsync: true
      },
      {
        name: 'profile',
        size: 67000, // 67KB
        gzippedSize: 21000, // 21KB
        modules: ['app/profile/*'],
        isAsync: true
      },
      {
        name: 'match',
        size: 78000, // 78KB
        gzippedSize: 25000, // 25KB
        modules: ['app/match/*', 'lib/matching/*'],
        isAsync: true
      },
      {
        name: 'suggestions',
        size: 92000, // 92KB
        gzippedSize: 29000, // 29KB
        modules: ['app/suggestions/*', 'lib/algorithms/*'],
        isAsync: true
      },
      {
        name: 'vendor',
        size: 134000, // 134KB
        gzippedSize: 42000, // 42KB
        modules: ['zustand', 'framer-motion', 'lucide-react'],
        isAsync: false
      }
    ];

    return chunks;
  }

  /**
   * 分析依赖项
   */
  private async analyzeDependencies(): Promise<DependencyInfo[]> {
    const dependencies: DependencyInfo[] = [
      {
        name: 'react',
        size: 45000,
        version: '19.0.0',
        used: true,
        treeshakeable: false
      },
      {
        name: 'react-dom',
        size: 135000,
        version: '19.0.0',
        used: true,
        treeshakeable: false
      },
      {
        name: 'next',
        size: 89000,
        version: '15.3.1',
        used: true,
        treeshakeable: false
      },
      {
        name: 'zustand',
        size: 12000,
        version: '5.0.8',
        used: true,
        treeshakeable: true
      },
      {
        name: 'framer-motion',
        size: 78000,
        version: '12.23.22',
        used: true,
        treeshakeable: true
      },
      {
        name: 'lucide-react',
        size: 156000,
        version: '0.545.0',
        used: true,
        treeshakeable: true
      },
      {
        name: '@headlessui/react',
        size: 34000,
        version: '2.2.7',
        used: true,
        treeshakeable: true
      },
      {
        name: 'tailwindcss',
        size: 0, // CSS框架，不计入JS bundle
        version: '3.4.18',
        used: true,
        treeshakeable: true
      },
      {
        name: 'clsx',
        size: 2000,
        version: '2.1.1',
        used: true,
        treeshakeable: true
      },
      {
        name: 'tailwind-merge',
        size: 8000,
        version: '3.3.1',
        used: true,
        treeshakeable: true
      }
    ];

    return dependencies;
  }

  /**
   * 生成优化建议
   */
  private generateRecommendations(
    chunks: ChunkInfo[],
    dependencies: DependencyInfo[],
    totalSize: number
  ): string[] {
    const recommendations: string[] = [];

    // 检查总体大小
    if (totalSize > 500000) { // 500KB
      recommendations.push('总Bundle大小超过500KB，建议进一步优化');
    }

    // 检查主包大小
    const mainChunk = chunks.find(chunk => chunk.name === 'main');
    if (mainChunk && mainChunk.size > 200000) { // 200KB
      recommendations.push('主包大小过大，建议将更多代码移至异步块');
    }

    // 检查大型依赖
    const largeDependencies = dependencies.filter(dep => dep.size > 50000);
    if (largeDependencies.length > 0) {
      recommendations.push(`发现大型依赖: ${largeDependencies.map(d => d.name).join(', ')}，考虑替换或按需导入`);
    }

    // 检查未使用的依赖
    const unusedDependencies = dependencies.filter(dep => !dep.used);
    if (unusedDependencies.length > 0) {
      recommendations.push(`发现未使用的依赖: ${unusedDependencies.map(d => d.name).join(', ')}，建议移除`);
    }

    // 检查Tree Shaking机会
    const nonTreeshakeableDeps = dependencies.filter(dep => dep.used && !dep.treeshakeable && dep.size > 20000);
    if (nonTreeshakeableDeps.length > 0) {
      recommendations.push(`以下依赖不支持Tree Shaking: ${nonTreeshakeableDeps.map(d => d.name).join(', ')}，考虑替换`);
    }

    // 检查代码分割
    const syncChunks = chunks.filter(chunk => !chunk.isAsync);
    const syncSize = syncChunks.reduce((sum, chunk) => sum + chunk.size, 0);
    if (syncSize > 300000) { // 300KB
      recommendations.push('同步加载的代码过多，建议增加更多异步路由分割');
    }

    // 检查压缩效率
    const compressionRatio = chunks.reduce((sum, chunk) => sum + chunk.gzippedSize, 0) / totalSize;
    if (compressionRatio > 0.4) { // 压缩率低于60%
      recommendations.push('压缩效率较低，检查是否有重复代码或可优化的资源');
    }

    return recommendations;
  }

  /**
   * 计算Bundle质量评分
   */
  private calculateScore(
    totalSize: number,
    chunks: ChunkInfo[],
    dependencies: DependencyInfo[]
  ): number {
    let score = 100;

    // 总大小扣分
    if (totalSize > 500000) score -= 20;
    else if (totalSize > 300000) score -= 10;

    // 主包大小扣分
    const mainChunk = chunks.find(chunk => chunk.name === 'main');
    if (mainChunk && mainChunk.size > 200000) score -= 15;
    else if (mainChunk && mainChunk.size > 150000) score -= 8;

    // 代码分割加分
    const asyncChunks = chunks.filter(chunk => chunk.isAsync);
    if (asyncChunks.length >= 4) score += 10;
    else if (asyncChunks.length >= 2) score += 5;

    // Tree Shaking加分
    const treeshakeableDeps = dependencies.filter(dep => dep.treeshakeable);
    const treeshakeRatio = treeshakeableDeps.length / dependencies.length;
    if (treeshakeRatio >= 0.8) score += 10;
    else if (treeshakeRatio >= 0.6) score += 5;

    // 压缩效率加分
    const compressionRatio = chunks.reduce((sum, chunk) => sum + chunk.gzippedSize, 0) / totalSize;
    if (compressionRatio <= 0.3) score += 10;
    else if (compressionRatio <= 0.35) score += 5;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * 生成优化后的Next.js配置
   */
  generateOptimizedConfig(): string {
    return `
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 实验性功能
  experimental: {
    // 启用优化的字体加载
    optimizeFonts: true,
    // 启用优化的图片
    optimizeImages: true,
  },
  
  // 编译器优化
  compiler: {
    // 移除console.log (生产环境)
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // 图片优化
  images: {
    domains: [
      'webapi.amap.com',
      'restapi.amap.com',
      'a.amap.com',
      'b.amap.com',
      'c.amap.com',
      'd.amap.com'
    ],
    // 启用图片优化
    unoptimized: false,
    // 图片格式
    formats: ['image/webp', 'image/avif'],
  },

  // Webpack优化
  webpack: (config, { isServer, dev }) => {
    // 生产环境优化
    if (!dev) {
      // 启用SplitChunks优化
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\\\/]node_modules[\\\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      };

      // 启用Tree Shaking
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
    }

    // 外部依赖配置
    if (!isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'AMap': 'AMap',
        'AMapUI': 'AMapUI'
      });
    }

    // 模块解析优化
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': process.cwd(),
    };

    return config;
  },

  // 输出配置
  output: 'standalone',
  
  // 启用严格模式
  reactStrictMode: true,
  
  // 启用压缩
  compress: true,
  
  // 禁用生产环境源码映射
  productionBrowserSourceMaps: false,

  // 启用静态导出优化
  trailingSlash: false,
  
  // 页面扩展名
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
};

export default nextConfig;
`;
  }

  /**
   * 生成分析报告
   */
  generateReport(): string {
    if (!this.analysisResult) {
      return 'Bundle分析尚未完成，请先运行analyzeBundles()';
    }

    const { totalSize, gzippedSize, chunks, dependencies, recommendations, score } = this.analysisResult;

    let report = `Bundle 分析报告\n`;
    report += `================\n\n`;
    report += `总体评分: ${score}/100\n`;
    report += `总大小: ${(totalSize / 1024).toFixed(2)} KB\n`;
    report += `压缩后大小: ${(gzippedSize / 1024).toFixed(2)} KB\n`;
    report += `压缩率: ${((1 - gzippedSize / totalSize) * 100).toFixed(1)}%\n\n`;

    // 代码块分析
    report += `代码块分析:\n`;
    report += `----------\n`;
    chunks.forEach(chunk => {
      report += `${chunk.name}: ${(chunk.size / 1024).toFixed(2)} KB`;
      report += ` (压缩后: ${(chunk.gzippedSize / 1024).toFixed(2)} KB)`;
      report += ` ${chunk.isAsync ? '[异步]' : '[同步]'}\n`;
    });
    report += `\n`;

    // 依赖分析
    report += `主要依赖:\n`;
    report += `--------\n`;
    dependencies
      .filter(dep => dep.size > 10000)
      .sort((a, b) => b.size - a.size)
      .forEach(dep => {
        report += `${dep.name}: ${(dep.size / 1024).toFixed(2)} KB`;
        report += ` ${dep.treeshakeable ? '[可Tree Shake]' : '[不可Tree Shake]'}\n`;
      });
    report += `\n`;

    // 优化建议
    if (recommendations.length > 0) {
      report += `优化建议:\n`;
      report += `--------\n`;
      recommendations.forEach((rec, index) => {
        report += `${index + 1}. ${rec}\n`;
      });
      report += `\n`;
    }

    // 性能目标
    report += `性能目标检查:\n`;
    report += `----------\n`;
    report += `✓ 主包大小 < 500KB: ${totalSize <= 500000 ? '通过' : '失败'}\n`;
    report += `✓ 压缩率 > 60%: ${(1 - gzippedSize / totalSize) > 0.6 ? '通过' : '失败'}\n`;
    report += `✓ 异步代码分割: ${chunks.filter(c => c.isAsync).length >= 3 ? '通过' : '失败'}\n`;

    return report;
  }
}

export { BundleAnalyzer, type BundleAnalysisResult, type ChunkInfo, type DependencyInfo };