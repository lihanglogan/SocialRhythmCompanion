import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

declare global {
  var __prisma: PrismaClient | undefined;
}

// 创建 Prisma 客户端实例
const createPrismaClient = (): PrismaClient => {
  return new PrismaClient({
    log: [
      {
        emit: 'event',
        level: 'query',
      },
      {
        emit: 'event',
        level: 'error',
      },
      {
        emit: 'event',
        level: 'info',
      },
      {
        emit: 'event',
        level: 'warn',
      },
    ],
    errorFormat: 'pretty',
  });
};

// 在开发环境中复用 Prisma 客户端实例
export const prisma = globalThis.__prisma || createPrismaClient();

if (process.env.NODE_ENV === 'development') {
  globalThis.__prisma = prisma;
}

// 设置 Prisma 日志监听器
prisma.$on('query', (e) => {
  if (process.env.NODE_ENV === 'development') {
    logger.debug(`Query: ${e.query}`);
    logger.debug(`Params: ${e.params}`);
    logger.debug(`Duration: ${e.duration}ms`);
  }
});

prisma.$on('error', (e) => {
  logger.error('Prisma Error:', e);
});

prisma.$on('info', (e) => {
  logger.info(`Prisma Info: ${e.message}`);
});

prisma.$on('warn', (e) => {
  logger.warn(`Prisma Warning: ${e.message}`);
});

// 数据库连接函数
export async function connectDatabase(): Promise<void> {
  try {
    // 测试数据库连接
    await prisma.$connect();
    
    // 运行一个简单的查询来验证连接
    await prisma.$queryRaw`SELECT 1`;
    
    logger.info('数据库连接成功');
  } catch (error) {
    logger.error('数据库连接失败:', error);
    throw error;
  }
}

// 数据库断开连接函数
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    logger.info('数据库连接已断开');
  } catch (error) {
    logger.error('数据库断开连接时出错:', error);
    throw error;
  }
}

// 数据库健康检查
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logger.error('数据库健康检查失败:', error);
    return false;
  }
}

// 事务辅助函数
export async function withTransaction<T>(
  callback: (tx: PrismaClient) => Promise<T>
): Promise<T> {
  return await prisma.$transaction(async (tx) => {
    return await callback(tx);
  });
}

// 批量操作辅助函数
export async function batchOperation<T>(
  operations: Promise<T>[]
): Promise<T[]> {
  return await Promise.all(operations);
}

// 数据库迁移状态检查
export async function checkMigrationStatus(): Promise<void> {
  try {
    // 检查 _prisma_migrations 表是否存在
    const result = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '_prisma_migrations'
      );
    ` as { exists: boolean }[];

    if (!result[0]?.exists) {
      logger.warn('数据库迁移表不存在，请运行 prisma migrate deploy');
    } else {
      logger.info('数据库迁移状态正常');
    }
  } catch (error) {
    logger.error('检查数据库迁移状态失败:', error);
  }
}

// 清理过期数据的辅助函数
export async function cleanupExpiredData(): Promise<void> {
  try {
    const now = new Date();
    
    // 清理过期的匹配请求
    const expiredRequests = await prisma.companionRequest.deleteMany({
      where: {
        expiresAt: {
          lt: now
        },
        status: 'PENDING'
      }
    });

    // 清理过期的报告（30天前的待审核报告）
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const expiredReports = await prisma.report.deleteMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo
        },
        status: 'PENDING'
      }
    });

    logger.info(`清理了 ${expiredRequests.count} 个过期匹配请求`);
    logger.info(`清理了 ${expiredReports.count} 个过期报告`);
  } catch (error) {
    logger.error('清理过期数据失败:', error);
  }
}

// 数据库统计信息
export async function getDatabaseStats(): Promise<{
  users: number;
  places: number;
  reports: number;
  matches: number;
}> {
  try {
    const [users, places, reports, matches] = await Promise.all([
      prisma.user.count(),
      prisma.place.count(),
      prisma.report.count(),
      prisma.companionMatch.count()
    ]);

    return { users, places, reports, matches };
  } catch (error) {
    logger.error('获取数据库统计信息失败:', error);
    throw error;
  }
}

// 优雅关闭时的清理函数
export async function gracefulShutdown(): Promise<void> {
  logger.info('开始数据库优雅关闭...');
  
  try {
    // 等待所有正在进行的查询完成
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 断开数据库连接
    await disconnectDatabase();
    
    logger.info('数据库优雅关闭完成');
  } catch (error) {
    logger.error('数据库优雅关闭失败:', error);
    throw error;
  }
}

// 导出 Prisma 客户端实例
export default prisma;