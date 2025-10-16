/**
 * 数据缓存服务
 * 提供本地数据缓存和管理功能
 */

import { Coordinates } from '@/types';

// 缓存配置
const CACHE_CONFIG = {
  // 缓存过期时间 (毫秒)
  EXPIRY_TIMES: {
    WEATHER: 30 * 60 * 1000,      // 天气数据 30分钟
    POI: 24 * 60 * 60 * 1000,     // POI数据 24小时
    GEOCODING: 7 * 24 * 60 * 60 * 1000, // 地理编码 7天
    ROUTE: 60 * 60 * 1000,        // 路径规划 1小时
    HEATMAP: 15 * 60 * 1000,      // 热力图数据 15分钟
    USER_LOCATION: 5 * 60 * 1000, // 用户位置 5分钟
  },
  
  // 缓存大小限制
  MAX_CACHE_SIZE: {
    WEATHER: 100,
    POI: 500,
    GEOCODING: 1000,
    ROUTE: 50,
    HEATMAP: 200,
  },
  
  // 存储键前缀
  STORAGE_PREFIX: 'src_cache_',
};

// 缓存数据类型
export interface CacheItem<T = unknown> {
  data: T;
  timestamp: number;
  expiry: number;
  key: string;
  size?: number;
}

// 缓存统计信息
export interface CacheStats {
  totalItems: number;
  totalSize: number;
  hitRate: number;
  missRate: number;
  expiredItems: number;
}

// 缓存类型枚举
export enum CacheType {
  WEATHER = 'weather',
  POI = 'poi',
  GEOCODING = 'geocoding',
  ROUTE = 'route',
  HEATMAP = 'heatmap',
  USER_LOCATION = 'user_location',
}

/**
 * 缓存服务类
 */
export class CacheService {
  private static instance: CacheService;
  private memoryCache: Map<string, CacheItem> = new Map();
  private stats: Record<string, { hits: number; misses: number }> = {};
  
  private constructor() {
    this.initializeStats();
    this.startCleanupTimer();
  }
  
  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  /**
   * 初始化统计信息
   */
  private initializeStats(): void {
    Object.values(CacheType).forEach(type => {
      this.stats[type] = { hits: 0, misses: 0 };
    });
  }

  /**
   * 启动定期清理过期缓存
   */
  private startCleanupTimer(): void {
    setInterval(() => {
      this.cleanupExpiredItems();
    }, 5 * 60 * 1000); // 每5分钟清理一次
  }

  /**
   * 生成缓存键
   */
  private generateKey(type: CacheType, identifier: string): string {
    return `${CACHE_CONFIG.STORAGE_PREFIX}${type}_${identifier}`;
  }

  /**
   * 计算数据大小 (简单估算)
   */
  private calculateSize(data: unknown): number {
    try {
      return JSON.stringify(data).length;
    } catch {
      return 0;
    }
  }

  /**
   * 检查缓存是否过期
   */
  private isExpired(item: CacheItem): boolean {
    return Date.now() > item.expiry;
  }

  /**
   * 获取缓存过期时间
   */
  private getExpiryTime(type: CacheType): number {
    return CACHE_CONFIG.EXPIRY_TIMES[type.toUpperCase() as keyof typeof CACHE_CONFIG.EXPIRY_TIMES] || 60 * 60 * 1000;
  }

  /**
   * 获取最大缓存大小
   */
  private getMaxCacheSize(type: CacheType): number {
    return CACHE_CONFIG.MAX_CACHE_SIZE[type.toUpperCase() as keyof typeof CACHE_CONFIG.MAX_CACHE_SIZE] || 100;
  }

  /**
   * 设置缓存
   */
  async set<T>(type: CacheType, identifier: string, data: T): Promise<void> {
    try {
      const key = this.generateKey(type, identifier);
      const timestamp = Date.now();
      const expiry = timestamp + this.getExpiryTime(type);
      const size = this.calculateSize(data);

      const cacheItem: CacheItem<T> = {
        data,
        timestamp,
        expiry,
        key,
        size,
      };

      // 内存缓存
      this.memoryCache.set(key, cacheItem);

      // 本地存储缓存 (对于重要数据)
      if (this.shouldPersist(type)) {
        try {
          localStorage.setItem(key, JSON.stringify(cacheItem));
        } catch (error) {
          console.warn('Failed to save to localStorage:', error);
        }
      }

      // 检查缓存大小限制
      await this.enforceMaxSize(type);
    } catch (error) {
      console.error('Failed to set cache:', error);
    }
  }

  /**
   * 获取缓存
   */
  async get<T>(type: CacheType, identifier: string): Promise<T | null> {
    try {
      const key = this.generateKey(type, identifier);
      
      // 先从内存缓存获取
      let item = this.memoryCache.get(key) as CacheItem<T> | undefined;
      
      // 如果内存中没有，尝试从本地存储获取
      if (!item && this.shouldPersist(type)) {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            item = JSON.parse(stored) as CacheItem<T>;
            // 重新加载到内存缓存
            this.memoryCache.set(key, item);
          }
        } catch (error) {
          console.warn('Failed to load from localStorage:', error);
        }
      }

      if (!item) {
        this.stats[type].misses++;
        return null;
      }

      // 检查是否过期
      if (this.isExpired(item)) {
        await this.delete(type, identifier);
        this.stats[type].misses++;
        return null;
      }

      this.stats[type].hits++;
      return item.data;
    } catch (error) {
      console.error('Failed to get cache:', error);
      this.stats[type].misses++;
      return null;
    }
  }

  /**
   * 删除缓存
   */
  async delete(type: CacheType, identifier: string): Promise<void> {
    try {
      const key = this.generateKey(type, identifier);
      
      // 从内存缓存删除
      this.memoryCache.delete(key);
      
      // 从本地存储删除
      if (this.shouldPersist(type)) {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.warn('Failed to remove from localStorage:', error);
        }
      }
    } catch (error) {
      console.error('Failed to delete cache:', error);
    }
  }

  /**
   * 清空指定类型的所有缓存
   */
  async clear(type?: CacheType): Promise<void> {
    try {
      if (type) {
        // 清空指定类型
        const prefix = this.generateKey(type, '');
        
        // 清空内存缓存
        for (const key of this.memoryCache.keys()) {
          if (key.startsWith(prefix)) {
            this.memoryCache.delete(key);
          }
        }
        
        // 清空本地存储
        if (this.shouldPersist(type)) {
          const keysToRemove: string[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(prefix)) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach(key => localStorage.removeItem(key));
        }
      } else {
        // 清空所有缓存
        this.memoryCache.clear();
        
        // 清空本地存储中的缓存
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(CACHE_CONFIG.STORAGE_PREFIX)) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
      }
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  /**
   * 清理过期的缓存项
   */
  async cleanupExpiredItems(): Promise<number> {
    let removedCount = 0;
    
    try {
      // 清理内存缓存中的过期项
      for (const [key, item] of this.memoryCache.entries()) {
        if (this.isExpired(item)) {
          this.memoryCache.delete(key);
          removedCount++;
        }
      }
      
      // 清理本地存储中的过期项
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(CACHE_CONFIG.STORAGE_PREFIX)) {
          try {
            const stored = localStorage.getItem(key);
            if (stored) {
              const item = JSON.parse(stored) as CacheItem;
              if (this.isExpired(item)) {
                keysToRemove.push(key);
              }
            }
          } catch (error) {
            // 如果解析失败，也删除这个项
            keysToRemove.push(key);
          }
        }
      }
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        removedCount++;
      });
      
    } catch (error) {
      console.error('Failed to cleanup expired items:', error);
    }
    
    return removedCount;
  }

  /**
   * 强制执行最大缓存大小限制
   */
  private async enforceMaxSize(type: CacheType): Promise<void> {
    const maxSize = this.getMaxCacheSize(type);
    const prefix = this.generateKey(type, '');
    
    // 获取该类型的所有缓存项
    const items: Array<{ key: string; item: CacheItem }> = [];
    
    for (const [key, item] of this.memoryCache.entries()) {
      if (key.startsWith(prefix)) {
        items.push({ key, item });
      }
    }
    
    // 如果超过最大数量，删除最旧的项
    if (items.length > maxSize) {
      // 按时间戳排序，最旧的在前
      items.sort((a, b) => a.item.timestamp - b.item.timestamp);
      
      const itemsToRemove = items.slice(0, items.length - maxSize);
      
      for (const { key } of itemsToRemove) {
        this.memoryCache.delete(key);
        
        // 同时从本地存储删除
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.warn('Failed to remove from localStorage:', error);
        }
      }
    }
  }

  /**
   * 判断是否应该持久化到本地存储
   */
  private shouldPersist(type: CacheType): boolean {
    // 地理编码和POI数据需要持久化，其他数据不需要
    return type === CacheType.GEOCODING || type === CacheType.POI;
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): Record<string, CacheStats> {
    const result: Record<string, CacheStats> = {};
    
    Object.values(CacheType).forEach(type => {
      const prefix = this.generateKey(type, '');
      const items = Array.from(this.memoryCache.entries())
        .filter(([key]) => key.startsWith(prefix));
      
      const totalItems = items.length;
      const totalSize = items.reduce((sum, [, item]) => sum + (item.size || 0), 0);
      const expiredItems = items.filter(([, item]) => this.isExpired(item)).length;
      
      const stats = this.stats[type];
      const totalRequests = stats.hits + stats.misses;
      const hitRate = totalRequests > 0 ? (stats.hits / totalRequests) * 100 : 0;
      const missRate = totalRequests > 0 ? (stats.misses / totalRequests) * 100 : 0;
      
      result[type] = {
        totalItems,
        totalSize,
        hitRate,
        missRate,
        expiredItems,
      };
    });
    
    return result;
  }

  /**
   * 重置统计信息
   */
  resetStats(): void {
    this.initializeStats();
  }

  /**
   * 检查缓存是否存在且未过期
   */
  async has(type: CacheType, identifier: string): Promise<boolean> {
    const data = await this.get(type, identifier);
    return data !== null;
  }

  /**
   * 获取缓存项的元信息
   */
  async getMetadata(type: CacheType, identifier: string): Promise<{
    exists: boolean;
    expired: boolean;
    timestamp?: number;
    expiry?: number;
    size?: number;
  }> {
    const key = this.generateKey(type, identifier);
    const item = this.memoryCache.get(key);
    
    if (!item) {
      return { exists: false, expired: false };
    }
    
    return {
      exists: true,
      expired: this.isExpired(item),
      timestamp: item.timestamp,
      expiry: item.expiry,
      size: item.size,
    };
  }
}

// 导出单例实例
export const cacheService = CacheService.getInstance();

// 导出便捷方法
export const {
  set: setCache,
  get: getCache,
  delete: deleteCache,
  clear: clearCache,
  has: hasCache,
  getStats: getCacheStats,
  cleanupExpiredItems,
} = cacheService;