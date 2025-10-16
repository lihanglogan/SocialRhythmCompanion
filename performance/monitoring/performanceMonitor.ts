/**
 * 性能监控工具
 * 实时监控应用性能指标并提供分析
 */

interface PerformanceData {
  timestamp: number;
  url: string;
  fcp: number;
  lcp: number;
  fid: number;
  cls: number;
  tti: number;
  memoryUsage: number;
  networkSpeed: string;
  userAgent: string;
}

interface PerformanceAlert {
  type: 'warning' | 'error';
  metric: string;
  value: number;
  threshold: number;
  message: string;
  timestamp: number;
}

class PerformanceMonitor {
  private data: PerformanceData[] = [];
  private alerts: PerformanceAlert[] = [];
  private observers: PerformanceObserver[] = [];
  private isMonitoring = false;

  // 性能阈值配置
  private thresholds = {
    fcp: 1500, // 1.5秒
    lcp: 2500, // 2.5秒
    fid: 100,  // 100ms
    cls: 0.1,  // 0.1
    tti: 3000, // 3秒
    memoryUsage: 100 * 1024 * 1024 // 100MB
  };

  constructor() {
    this.setupPerformanceObservers();
  }

  /**
   * 开始性能监控
   */
  startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    console.log('性能监控已启动');

    // 定期收集性能数据
    setInterval(() => {
      this.collectPerformanceData();
    }, 30000); // 每30秒收集一次

    // 页面卸载时收集最终数据
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.collectPerformanceData();
      });
    }
  }

  /**
   * 停止性能监控
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    console.log('性能监控已停止');
  }

  /**
   * 设置性能观察器
   */
  private setupPerformanceObservers(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    // 观察Paint事件 (FCP)
    try {
      const paintObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            this.checkThreshold('fcp', entry.startTime);
          }
        });
      });
      paintObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(paintObserver);
    } catch (error) {
      console.warn('Paint Observer not supported');
    }

    // 观察LCP事件
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          this.checkThreshold('lcp', lastEntry.startTime);
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);
    } catch (error) {
      console.warn('LCP Observer not supported');
    }

    // 观察FID事件
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: PerformanceEventTiming) => {
          const fid = entry.processingStart - entry.startTime;
          this.checkThreshold('fid', fid);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);
    } catch (error) {
      console.warn('FID Observer not supported');
    }

    // 观察CLS事件
    try {
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: PerformanceEntry & { value?: number; hadRecentInput?: boolean }) => {
          if (!entry.hadRecentInput) {
            this.checkThreshold('cls', entry.value || 0);
          }
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);
    } catch (error) {
      console.warn('CLS Observer not supported');
    }
  }

  /**
   * 收集性能数据
   */
  private collectPerformanceData(): void {
    if (typeof window === 'undefined') return;

    const performanceData: PerformanceData = {
      timestamp: Date.now(),
      url: window.location.href,
      fcp: this.getFCP(),
      lcp: this.getLCP(),
      fid: this.getFID(),
      cls: this.getCLS(),
      tti: this.getTTI(),
      memoryUsage: this.getMemoryUsage(),
      networkSpeed: this.getNetworkSpeed(),
      userAgent: navigator.userAgent
    };

    this.data.push(performanceData);
    
    // 保持最近100条记录
    if (this.data.length > 100) {
      this.data = this.data.slice(-100);
    }

    // 检查所有指标的阈值
    this.checkAllThresholds(performanceData);
  }

  /**
   * 检查性能阈值
   */
  private checkThreshold(metric: keyof typeof this.thresholds, value: number): void {
    const threshold = this.thresholds[metric];
    
    if (value > threshold) {
      const alert: PerformanceAlert = {
        type: value > threshold * 1.5 ? 'error' : 'warning',
        metric,
        value,
        threshold,
        message: `${metric.toUpperCase()} 超过阈值: ${value.toFixed(2)} > ${threshold}`,
        timestamp: Date.now()
      };

      this.alerts.push(alert);
      console.warn(`性能警告: ${alert.message}`);
      
      // 保持最近50条警告
      if (this.alerts.length > 50) {
        this.alerts = this.alerts.slice(-50);
      }
    }
  }

  /**
   * 检查所有性能指标的阈值
   */
  private checkAllThresholds(data: PerformanceData): void {
    Object.keys(this.thresholds).forEach(metric => {
      const key = metric as keyof typeof this.thresholds;
      const value = data[key] as number;
      if (value > 0) {
        this.checkThreshold(key, value);
      }
    });
  }

  /**
   * 获取性能统计信息
   */
  getPerformanceStats(): {
    averages: Partial<PerformanceData>;
    trends: { [key: string]: 'improving' | 'stable' | 'degrading' };
    alerts: PerformanceAlert[];
  } {
    if (this.data.length === 0) {
      return {
        averages: {},
        trends: {},
        alerts: this.alerts
      };
    }

    // 计算平均值
    const averages: Partial<PerformanceData> = {};
    const metrics = ['fcp', 'lcp', 'fid', 'cls', 'tti', 'memoryUsage'] as const;
    
    metrics.forEach(metric => {
      const values = this.data.map(d => d[metric]).filter(v => v > 0);
      if (values.length > 0) {
        averages[metric] = values.reduce((sum, val) => sum + val, 0) / values.length;
      }
    });

    // 计算趋势
    const trends: { [key: string]: 'improving' | 'stable' | 'degrading' } = {};
    
    if (this.data.length >= 10) {
      metrics.forEach(metric => {
        const recent = this.data.slice(-5).map(d => d[metric]).filter(v => v > 0);
        const older = this.data.slice(-10, -5).map(d => d[metric]).filter(v => v > 0);
        
        if (recent.length > 0 && older.length > 0) {
          const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
          const olderAvg = older.reduce((sum, val) => sum + val, 0) / older.length;
          const change = (recentAvg - olderAvg) / olderAvg;
          
          if (change < -0.1) trends[metric] = 'improving';
          else if (change > 0.1) trends[metric] = 'degrading';
          else trends[metric] = 'stable';
        }
      });
    }

    return {
      averages,
      trends,
      alerts: this.alerts
    };
  }

  /**
   * 生成性能报告
   */
  generateReport(): string {
    const stats = this.getPerformanceStats();
    const { averages, trends, alerts } = stats;

    let report = `性能监控报告\n`;
    report += `================\n\n`;
    report += `监控时间: ${new Date().toLocaleString()}\n`;
    report += `数据点数量: ${this.data.length}\n`;
    report += `警告数量: ${alerts.length}\n\n`;

    // 平均性能指标
    report += `平均性能指标:\n`;
    report += `------------\n`;
    if (averages.fcp) report += `FCP: ${averages.fcp.toFixed(2)}ms\n`;
    if (averages.lcp) report += `LCP: ${averages.lcp.toFixed(2)}ms\n`;
    if (averages.fid) report += `FID: ${averages.fid.toFixed(2)}ms\n`;
    if (averages.cls) report += `CLS: ${averages.cls.toFixed(3)}\n`;
    if (averages.tti) report += `TTI: ${averages.tti.toFixed(2)}ms\n`;
    if (averages.memoryUsage) {
      report += `内存使用: ${(averages.memoryUsage / 1024 / 1024).toFixed(2)}MB\n`;
    }
    report += `\n`;

    // 性能趋势
    if (Object.keys(trends).length > 0) {
      report += `性能趋势:\n`;
      report += `--------\n`;
      Object.entries(trends).forEach(([metric, trend]) => {
        const icon = trend === 'improving' ? '📈' : trend === 'degrading' ? '📉' : '➡️';
        report += `${metric.toUpperCase()}: ${icon} ${trend}\n`;
      });
      report += `\n`;
    }

    // 最近的警告
    if (alerts.length > 0) {
      report += `最近的性能警告:\n`;
      report += `--------------\n`;
      alerts.slice(-10).forEach(alert => {
        const time = new Date(alert.timestamp).toLocaleTimeString();
        report += `[${time}] ${alert.type.toUpperCase()}: ${alert.message}\n`;
      });
      report += `\n`;
    }

    // 性能建议
    report += `性能优化建议:\n`;
    report += `------------\n`;
    
    if (averages.fcp && averages.fcp > this.thresholds.fcp) {
      report += `• FCP过高，建议优化首屏渲染性能\n`;
    }
    if (averages.lcp && averages.lcp > this.thresholds.lcp) {
      report += `• LCP过高，建议优化最大内容渲染\n`;
    }
    if (averages.fid && averages.fid > this.thresholds.fid) {
      report += `• FID过高，建议优化JavaScript执行\n`;
    }
    if (averages.cls && averages.cls > this.thresholds.cls) {
      report += `• CLS过高，建议减少布局偏移\n`;
    }
    if (averages.memoryUsage && averages.memoryUsage > this.thresholds.memoryUsage) {
      report += `• 内存使用过高，建议优化内存管理\n`;
    }

    return report;
  }

  /**
   * 导出性能数据
   */
  exportData(): {
    data: PerformanceData[];
    alerts: PerformanceAlert[];
    summary: ReturnType<typeof this.getPerformanceStats>;
  } {
    return {
      data: this.data,
      alerts: this.alerts,
      summary: this.getPerformanceStats()
    };
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
    // FID需要通过PerformanceObserver获取，这里返回0作为占位
    return 0;
  }

  private getCLS(): number {
    // CLS需要通过PerformanceObserver累积计算，这里返回0作为占位
    return 0;
  }

  private getTTI(): number {
    // TTI计算复杂，这里简化为当前时间
    return performance.now();
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }

  private getNetworkSpeed(): string {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      return connection.effectiveType || 'unknown';
    }
    return 'unknown';
  }
}

// 全局性能监控实例
let globalMonitor: PerformanceMonitor | null = null;

/**
 * 获取全局性能监控实例
 */
export function getPerformanceMonitor(): PerformanceMonitor {
  if (!globalMonitor) {
    globalMonitor = new PerformanceMonitor();
  }
  return globalMonitor;
}

export { PerformanceMonitor, type PerformanceData, type PerformanceAlert };