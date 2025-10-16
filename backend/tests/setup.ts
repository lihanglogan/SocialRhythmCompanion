import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// 加载测试环境变量
dotenv.config({ path: '.env.test' });

// 全局测试设置
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL
    }
  }
});

// 全局变量声明
declare global {
  var __PRISMA__: PrismaClient;
}

// 设置全局 Prisma 实例
global.__PRISMA__ = prisma;

// Jest 设置
beforeAll(async () => {
  // 确保测试数据库连接
  await prisma.$connect();
});

afterAll(async () => {
  // 清理并断开连接
  await prisma.$disconnect();
});

// 导出 Prisma 实例供测试使用
export { prisma };