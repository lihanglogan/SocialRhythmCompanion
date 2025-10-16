import { createClient, RedisClientType } from 'redis';
import { logger } from './logger';

// Redis 客户端实例
let redisClient: RedisClientType | null = null;

// Redis 配置接口
interface RedisConfig {
  url: string;
  password?: string;
  db?: number;
  retryDelayOnFailover?: number;
  maxRetriesPerRequest?: number;
  connectTimeout?: number;
  commandTimeout?: number;
}

// 获取 Redis 配置
const getRedisConfig = (): RedisConfig => {
  return {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0'),
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
    connectTimeout: 10000,
    commandTimeout: 5000,
  };
};

// 创建 Redis 客户端
const createRedisClient = (): RedisClientType => {
  const config = getRedisConfig();
  
  const client = createClient({
    url: config.url,
    password: config.password,
    database: config.db,
    socket: {
      connectTimeout: config.connectTimeout,
      commandTimeout: config.commandTimeout,
      reconnectStrategy: (retries) => {
        if (retries > 10) {
          logger.error('Redis 重连次数超过限制，停止重连');
          return new Error('Redis 连接失败');
        }
        const delay = Math.min(retries * 50, 500);
        logger.warn(`Redis 连接失败，${delay}ms 后重试 (第 ${retries} 次)`);
        return delay;
      }
    }
  });

  // 错误处理
  client.on('error', (error) => {
    logger.error('Redis 客户端错误:', error);
  });

  client.on('connect', () => {
    logger.info('Redis 客户端连接成功');
  });

  client.on('ready', () => {
    logger.info('Redis 客户端就绪');
  });

  client.on('end', () => {
    logger.info('Redis 客户端连接已关闭');
  });

  client.on('reconnecting', () => {
    logger.warn('Redis 客户端正在重连...');
  });

  return client as RedisClientType;
};

// 连接 Redis
export async function connectRedis(): Promise<void> {
  try {
    if (!redisClient) {
      redisClient = createRedisClient();
    }

    if (!redisClient.isOpen) {
      await redisClient.connect();
    }

    // 测试连接
    await redisClient.ping();
    logger.info('Redis 连接测试成功');
  } catch (error) {
    logger.error('Redis 连接失败:', error);
    throw error;
  }
}

// 断开 Redis 连接
export async function disconnectRedis(): Promise<void> {
  try {
    if (redisClient && redisClient.isOpen) {
      await redisClient.quit();
      logger.info('Redis 连接已断开');
    }
  } catch (error) {
    logger.error('Redis 断开连接时出错:', error);
    throw error;
  }
}

// 获取 Redis 客户端实例
export function getRedisClient(): RedisClientType {
  if (!redisClient) {
    throw new Error('Redis 客户端未初始化');
  }
  return redisClient;
}

// Redis 健康检查
export async function checkRedisHealth(): Promise<boolean> {
  try {
    if (!redisClient || !redisClient.isOpen) {
      return false;
    }
    await redisClient.ping();
    return true;
  } catch (error) {
    logger.error('Redis 健康检查失败:', error);
    return false;
  }
}

// 缓存操作类
export class RedisCache {
  private client: RedisClientType;

  constructor(client: RedisClientType) {
    this.client = client;
  }

  // 设置缓存
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      if (ttl) {
        await this.client.setEx(key, ttl, serializedValue);
      } else {
        await this.client.set(key, serializedValue);
      }
      logger.debug(`缓存已设置: ${key}`);
    } catch (error) {
      logger.error(`设置缓存失败 ${key}:`, error);
      throw error;
    }
  }

  // 获取缓存
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      if (value === null) {
        return null;
      }
      const result = JSON.parse(value);
      logger.debug(`缓存命中: ${key}`);
      return result;
    } catch (error) {
      logger.error(`获取缓存失败 ${key}:`, error);
      return null;
    }
  }

  // 删除缓存
  async del(key: string): Promise<boolean> {
    try {
      const result = await this.client.del(key);
      logger.debug(`缓存已删除: ${key}`);
      return result > 0;
    } catch (error) {
      logger.error(`删除缓存失败 ${key}:`, error);
      return false;
    }
  }

  // 检查缓存是否存在
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result > 0;
    } catch (error) {
      logger.error(`检查缓存存在性失败 ${key}:`, error);
      return false;
    }
  }

  // 设置缓存过期时间
  async expire(key: string, ttl: number): Promise<boolean> {
    try {
      const result = await this.client.expire(key, ttl);
      return result;
    } catch (error) {
      logger.error(`设置缓存过期时间失败 ${key}:`, error);
      return false;
    }
  }

  // 获取缓存剩余过期时间
  async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      logger.error(`获取缓存过期时间失败 ${key}:`, error);
      return -1;
    }
  }

  // 批量获取缓存
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      const values = await this.client.mGet(keys);
      return values.map(value => {
        if (value === null) return null;
        try {
          return JSON.parse(value);
        } catch {
          return null;
        }
      });
    } catch (error) {
      logger.error(`批量获取缓存失败:`, error);
      return keys.map(() => null);
    }
  }

  // 批量设置缓存
  async mset(keyValues: Record<string, any>): Promise<void> {
    try {
      const serializedKeyValues: Record<string, string> = {};
      for (const [key, value] of Object.entries(keyValues)) {
        serializedKeyValues[key] = JSON.stringify(value);
      }
      await this.client.mSet(serializedKeyValues);
      logger.debug(`批量设置缓存完成，共 ${Object.keys(keyValues).length} 个键`);
    } catch (error) {
      logger.error(`批量设置缓存失败:`, error);
      throw error;
    }
  }

  // 模糊匹配删除
  async delPattern(pattern: string): Promise<number> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length === 0) {
        return 0;
      }
      const result = await this.client.del(keys);
      logger.debug(`模糊删除缓存完成，删除了 ${result} 个键`);
      return result;
    } catch (error) {
      logger.error(`模糊删除缓存失败 ${pattern}:`, error);
      return 0;
    }
  }

  // 原子递增
  async incr(key: string): Promise<number> {
    try {
      return await this.client.incr(key);
    } catch (error) {
      logger.error(`递增操作失败 ${key}:`, error);
      throw error;
    }
  }

  // 原子递减
  async decr(key: string): Promise<number> {
    try {
      return await this.client.decr(key);
    } catch (error) {
      logger.error(`递减操作失败 ${key}:`, error);
      throw error;
    }
  }

  // 有序集合操作
  async zadd(key: string, score: number, member: string): Promise<number> {
    try {
      return await this.client.zAdd(key, { score, value: member });
    } catch (error) {
      logger.error(`有序集合添加失败 ${key}:`, error);
      throw error;
    }
  }

  async zrange(key: string, start: number, stop: number): Promise<string[]> {
    try {
      return await this.client.zRange(key, start, stop);
    } catch (error) {
      logger.error(`有序集合范围查询失败 ${key}:`, error);
      return [];
    }
  }

  // 列表操作
  async lpush(key: string, ...elements: string[]): Promise<number> {
    try {
      return await this.client.lPush(key, elements);
    } catch (error) {
      logger.error(`列表左插入失败 ${key}:`, error);
      throw error;
    }
  }

  async rpop(key: string): Promise<string | null> {
    try {
      return await this.client.rPop(key);
    } catch (error) {
      logger.error(`列表右弹出失败 ${key}:`, error);
      return null;
    }
  }

  // 集合操作
  async sadd(key: string, ...members: string[]): Promise<number> {
    try {
      return await this.client.sAdd(key, members);
    } catch (error) {
      logger.error(`集合添加失败 ${key}:`, error);
      throw error;
    }
  }

  async smembers(key: string): Promise<string[]> {
    try {
      return await this.client.sMembers(key);
    } catch (error) {
      logger.error(`获取集合成员失败 ${key}:`, error);
      return [];
    }
  }
}

// 创建缓存实例
export function createCache(): RedisCache {
  const client = getRedisClient();
  return new RedisCache(client);
}

// 会话存储类
export class RedisSession {
  private cache: RedisCache;
  private prefix: string;

  constructor(cache: RedisCache, prefix = 'session:') {
    this.cache = cache;
    this.prefix = prefix;
  }

  // 设置会话
  async set(sessionId: string, data: any, ttl = 86400): Promise<void> {
    const key = `${this.prefix}${sessionId}`;
    await this.cache.set(key, data, ttl);
  }

  // 获取会话
  async get<T>(sessionId: string): Promise<T | null> {
    const key = `${this.prefix}${sessionId}`;
    return await this.cache.get<T>(key);
  }

  // 删除会话
  async destroy(sessionId: string): Promise<boolean> {
    const key = `${this.prefix}${sessionId}`;
    return await this.cache.del(key);
  }

  // 续期会话
  async touch(sessionId: string, ttl = 86400): Promise<boolean> {
    const key = `${this.prefix}${sessionId}`;
    return await this.cache.expire(key, ttl);
  }
}

// 速率限制类
export class RedisRateLimit {
  private cache: RedisCache;
  private prefix: string;

  constructor(cache: RedisCache, prefix = 'ratelimit:') {
    this.cache = cache;
    this.prefix = prefix;
  }

  // 检查速率限制
  async check(identifier: string, limit: number, window: number): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
  }> {
    const key = `${this.prefix}${identifier}`;
    const now = Date.now();
    const windowStart = Math.floor(now / (window * 1000)) * window;
    const windowKey = `${key}:${windowStart}`;

    try {
      const current = await this.cache.incr(windowKey);
      
      if (current === 1) {
        // 第一次访问，设置过期时间
        await this.cache.expire(windowKey, window);
      }

      const remaining = Math.max(0, limit - current);
      const allowed = current <= limit;
      const resetTime = (windowStart + window) * 1000;

      return {
        allowed,
        remaining,
        resetTime,
      };
    } catch (error) {
      logger.error(`速率限制检查失败 ${identifier}:`, error);
      // 发生错误时允许请求
      return {
        allowed: true,
        remaining: limit - 1,
        resetTime: now + window * 1000,
      };
    }
  }
}

// 导出实例创建函数
export function createSession(): RedisSession {
  const cache = createCache();
  return new RedisSession(cache);
}

export function createRateLimit(): RedisRateLimit {
  const cache = createCache();
  return new RedisRateLimit(cache);
}

// 优雅关闭
export async function gracefulShutdownRedis(): Promise<void> {
  logger.info('开始 Redis 优雅关闭...');
  
  try {
    // 等待正在进行的操作完成
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 断开 Redis 连接
    await disconnectRedis();
    
    logger.info('Redis 优雅关闭完成');
  } catch (error) {
    logger.error('Redis 优雅关闭失败:', error);
    throw error;
  }
}

export default {
  connectRedis,
  disconnectRedis,
  getRedisClient,
  checkRedisHealth,
  createCache,
  createSession,
  createRateLimit,
  gracefulShutdownRedis,
};