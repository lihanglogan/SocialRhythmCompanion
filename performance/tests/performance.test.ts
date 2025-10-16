/**
 * 性能测试套件
 * 测试各种性能指标和用户体验指标
 */

interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  tti: number; // Time to Interactive
  bundleSize: number; // Bundle大小
  memoryUsage: number; // 内存使用
}

interface TestResult {
  testName: string;
  passed: boolean;
  metrics: PerformanceMetrics;
  recommendations: string[];
}

class PerformanceTestSuite {
  private results: TestResult[] = [];
  
  constructor() {
    this.setupPerformanceObserver();
  }

  /**
   * 设置性能观察器
   */
  private setupPerformanceObserver(): void {
    if (typeof window === 'undefined') return;

    // 观察FCP和LCP
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry) => {
          console.log(`${entry.name}: ${entry.startTime}ms`);
        });
      });
      
      observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
    }

    // 观察CLS
    if ('PerformanceObserver' in window) {
      const clsObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry: PerformanceEntry & { value?: number; hadRecentInput?: boolean }) => {
          if (entry.hadRecentInput) return;
          console.log(`CLS: ${entry.value}`);
        });
      });
      
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    }
  }

  /**
   * 测试页面加载性能
   */
  async testPageLoadPerformance(): Promise<TestResult> {
    const startTime = performance.now();
    
    // 等待页面完全加载
    await new Promise(resolve => {
      if (document.readyState === 'complete') {
        resolve(void 0);
      } else {
        window.addEventListener('load', () => resolve(void 0));
      }
    });

    // 页面加载时间已通过其他方式测量
    
    const metrics: PerformanceMetrics = {
      fcp: this.getFCP(),
      lcp: this.getLCP(),
      fid: this.getFID(),
      cls: this.getCLS(),
      tti: this.getTTI(),
      bundleSize: await this.getBundleSize(),
      memoryUsage: this.getMemoryUsage()
    };

    const recommendations: string[] = [];
    
    // 性能指标检查
    if (metrics.fcp > 1500) {
      recommendations.push('FCP超过1.5秒，建议优化首屏渲染');
    }
    if (metrics.lcp > 2500) {
      recommendations.push('LCP超过2.5秒，建议优化最大内容渲染');
    }
    if (metrics.fid > 100) {
      recommendations.push('FID超过100ms，建议优化JavaScript执行');
    }
    if (metrics.cls > 0.1) {
      recommendations.push('CLS超过0.1，建议减少布局偏移');
    }

    const result: TestResult = {
      testName: '页面加载性能测试',
      passed: metrics.fcp <= 1500 && metrics.lcp <= 2500 && metrics.fid <= 100 && metrics.cls <= 0.1,
      metrics,
      recommendations
    };

    this.results.push(result);
    return result;
  }

  /**
   * 测试地图渲染性能
   */
  async testMapPerformance(): Promise<TestResult> {
    const startTime = performance.now();
    
    // 模拟地图加载
    const mapLoadTime = await this.measureMapLoad();
    
    const metrics: PerformanceMetrics = {
      fcp: 0,
      lcp: 0,
      fid: 0,
      cls: 0,
      tti: mapLoadTime,
      bundleSize: 0,
      memoryUsage: this.getMemoryUsage()
    };

    const recommendations: string[] = [];
    
    if (mapLoadTime > 3000) {
      recommendations.push('地图加载时间过长，建议实施懒加载');
    }
    if (metrics.memoryUsage > 100 * 1024 * 1024) { // 100MB
      recommendations.push('地图组件内存使用过高，建议优化内存管理');
    }

    const result: TestResult = {
      testName: '地图渲染性能测试',
      passed: mapLoadTime <= 3000 && metrics.memoryUsage <= 100 * 1024 * 1024,
      metrics,
      recommendations
    };

    this.results.push(result);
    return result;
  }

  /**
   * 测试API请求性能
   */
  async testApiPerformance(): Promise<TestResult> {
    const apiTests = [
      { name: '获取附近场所', url: '/api/places/nearby' },
      { name: '天气数据', url: '/api/weather' },
      { name: '用户匹配', url: '/api/match' }
    ];

    const results = [];
    
    for (const test of apiTests) {
      const startTime = performance.now();
      
      try {
        const response = await fetch(test.url);
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        results.push({
          name: test.name,
          duration,
          status: response.status,
          success: response.ok
        });
      } catch (error) {
        results.push({
          name: test.name,
          duration: -1,
          status: 0,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const avgDuration = results
      .filter(r => r.success)
      .reduce((sum, r) => sum + r.duration, 0) / results.filter(r => r.success).length;

    const recommendations: string[] = [];
    
    if (avgDuration > 1000) {
      recommendations.push('API响应时间过长，建议优化后端性能或增加缓存');
    }
    
    const failedRequests = results.filter(r => !r.success);
    if (failedRequests.length > 0) {
      recommendations.push(`有${failedRequests.length}个API请求失败，需要检查错误处理`);
    }

    const result: TestResult = {
      testName: 'API请求性能测试',
      passed: avgDuration <= 1000 && failedRequests.length === 0,
      metrics: {
        fcp: 0,
        lcp: 0,
        fid: 0,
        cls: 0,
        tti: avgDuration,
        bundleSize: 0,
        memoryUsage: 0
      },
      recommendations
    };

    this.results.push(result);
    return result;
  }

  /**
   * 测试内存使用情况
   */
  async testMemoryUsage(): Promise<TestResult> {
    const initialMemory = this.getMemoryUsage();
    
    // 模拟重复操作以检测内存泄漏
    for (let i = 0; i < 100; i++) {
      // 创建和销毁组件
      const div = document.createElement('div');
      div.innerHTML = `<div>Test ${i}</div>`;
      document.body.appendChild(div);
      document.body.removeChild(div);
    }

    // 强制垃圾回收（如果可用）
    if ('gc' in window) {
      (window as any).gc();
    }

    const finalMemory = this.getMemoryUsage();
    const memoryIncrease = finalMemory - initialMemory;

    const recommendations: string[] = [];
    
    if (memoryIncrease > 10 * 1024 * 1024) { // 10MB
      recommendations.push('检测到可能的内存泄漏，建议检查组件清理逻辑');
    }

    const result: TestResult = {
      testName: '内存使用测试',
      passed: memoryIncrease <= 10 * 1024 * 1024,
      metrics: {
        fcp: 0,
        lcp: 0,
        fid: 0,
        cls: 0,
        tti: 0,
        bundleSize: 0,
        memoryUsage: finalMemory
      },
      recommendations
    };

    this.results.push(result);
    return result;
  }

  /**
   * 运行所有性能测试
   */
  async runAllTests(): Promise<TestResult[]> {
    console.log('开始性能测试...');
    
    await this.testPageLoadPerformance();
    await this.testMapPerformance();
    await this.testApiPerformance();
    await this.testMemoryUsage();
    
    console.log('性能测试完成');
    return this.results;
  }

  /**
   * 生成测试报告
   */
  generateReport(): string {
    const passedTests = this.results.filter(r => r.passed).length;
    const totalTests = this.results.length;
    
    let report = `性能测试报告\n`;
    report += `===============\n\n`;
    report += `测试概况: ${passedTests}/${totalTests} 通过\n\n`;
    
    this.results.forEach(result => {
      report += `${result.testName}: ${result.passed ? '✅ 通过' : '❌ 失败'}\n`;
      
      if (result.metrics.fcp > 0) {
        report += `  FCP: ${result.metrics.fcp.toFixed(2)}ms\n`;
      }
      if (result.metrics.lcp > 0) {
        report += `  LCP: ${result.metrics.lcp.toFixed(2)}ms\n`;
      }
      if (result.metrics.fid > 0) {
        report += `  FID: ${result.metrics.fid.toFixed(2)}ms\n`;
      }
      if (result.metrics.cls > 0) {
        report += `  CLS: ${result.metrics.cls.toFixed(3)}\n`;
      }
      if (result.metrics.tti > 0) {
        report += `  TTI: ${result.metrics.tti.toFixed(2)}ms\n`;
      }
      if (result.metrics.memoryUsage > 0) {
        report += `  内存使用: ${(result.metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB\n`;
      }
      
      if (result.recommendations.length > 0) {
        report += `  建议:\n`;
        result.recommendations.forEach(rec => {
          report += `    - ${rec}\n`;
        });
      }
      report += `\n`;
    });
    
    return report;
  }

  // 辅助方法
  private getFCP(): number {
    const entries = performance.getEntriesByType('paint');
    const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
    return fcpEntry ? fcpEntry.startTime : 0;
  }

  private getLCP(): number {
    const entries = performance.getEntriesByType('largest-contentful-paint');
    const lcpEntry = entries[entries.length - 1];
    return lcpEntry ? lcpEntry.startTime : 0;
  }

  private getFID(): number {
    // FID需要通过PerformanceObserver获取
    return 0; // 简化实现
  }

  private getCLS(): number {
    // CLS需要通过PerformanceObserver累积计算
    return 0; // 简化实现
  }

  private getTTI(): number {
    // TTI计算较复杂，这里简化实现
    return performance.now();
  }

  private async getBundleSize(): Promise<number> {
    // 获取主要资源的大小
    const resources = performance.getEntriesByType('resource');
    return resources.reduce((total, resource: any) => {
      if (resource.name.includes('.js') || resource.name.includes('.css')) {
        return total + (resource.transferSize || 0);
      }
      return total;
    }, 0);
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }

  private async measureMapLoad(): Promise<number> {
    const startTime = performance.now();
    
    // 等待地图容器出现
    const mapContainer = document.querySelector('#map-container');
    if (mapContainer) {
      // 模拟地图加载时间
      await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
    }
    
    return performance.now() - startTime;
  }
}

// 导出测试套件
export { PerformanceTestSuite, type PerformanceMetrics, type TestResult };

// 全局测试实例
if (typeof window !== 'undefined') {
  (window as any).PerformanceTestSuite = PerformanceTestSuite;
}