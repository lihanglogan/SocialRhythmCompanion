import { Request, Response } from 'express';
import { z } from 'zod';
import { catchAsync } from '@/middleware/errorHandler';
import { ValidationError, NotFoundError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import { createCache } from '@/utils/redis';
import prisma from '@/utils/database';

// 验证模式
const createReportSchema = z.object({
  placeId: z.string().min(1, '场所ID不能为空'),
  crowdnessLevel: z.number().min(1, '拥挤度等级最小为1').max(5, '拥挤度等级最大为5'),
  description: z.string().max(500, '描述不能超过500个字符').optional(),
  images: z.array(z.string().url('图片链接格式不正确')).max(5, '图片不能超过5张').optional(),
  tags: z.array(z.string()).max(10, '标签不能超过10个').optional(),
  isAnonymous: z.boolean().default(false),
});

const getReportsSchema = z.object({
  placeId: z.string().optional(),
  userId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  crowdnessLevel: z.number().min(1).max(5).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

const updateReportSchema = z.object({
  crowdnessLevel: z.number().min(1).max(5).optional(),
  description: z.string().max(500).optional(),
  images: z.array(z.string().url()).max(5).optional(),
  tags: z.array(z.string()).max(10).optional(),
});

/**
 * @swagger
 * /api/v1/reports:
 *   post:
 *     summary: 创建新的上报记录
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - placeId
 *               - crowdnessLevel
 *             properties:
 *               placeId:
 *                 type: string
 *                 description: 场所ID
 *               crowdnessLevel:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: 拥挤度等级(1-5)
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 description: 描述信息
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *                 maxItems: 5
 *                 description: 图片链接
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 maxItems: 10
 *                 description: 标签
 *               isAnonymous:
 *                 type: boolean
 *                 default: false
 *                 description: 是否匿名上报
 *     responses:
 *       201:
 *         description: 上报创建成功
 *       400:
 *         description: 验证错误
 *       404:
 *         description: 场所不存在
 */
export const createReport = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ValidationError('用户信息缺失');
  }

  const validatedData = createReportSchema.parse(req.body);

  // 检查场所是否存在
  const place = await prisma.place.findUnique({
    where: { id: validatedData.placeId },
    select: { id: true, name: true, status: true }
  });

  if (!place) {
    throw new NotFoundError('场所不存在');
  }

  if (place.status !== 'ACTIVE') {
    throw new ValidationError('该场所暂不可用');
  }

  // 检查用户今天是否已经对该场所上报过
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const existingReport = await prisma.report.findFirst({
    where: {
      userId: req.user.id,
      placeId: validatedData.placeId,
      createdAt: {
        gte: today,
        lt: tomorrow
      }
    }
  });

  if (existingReport) {
    throw new ValidationError('您今天已经对该场所进行过上报');
  }

  // 创建上报记录
  const report = await prisma.report.create({
    data: {
      ...validatedData,
      userId: req.user.id,
      reportedAt: new Date(),
    },
    include: {
      user: {
        select: {
          id: true,
          nickname: true,
          avatar: true,
        }
      },
      place: {
        select: {
          id: true,
          name: true,
          category: true,
          address: true,
        }
      }
    }
  });

  // 更新用户统计
  await prisma.userStatistics.upsert({
    where: { userId: req.user.id },
    update: {
      totalReports: { increment: 1 }
    },
    create: {
      userId: req.user.id,
      totalReports: 1,
      totalMatches: 0,
      totalVisits: 0,
      streakDays: 0,
      achievements: []
    }
  });

  // 清除相关缓存
  const cache = createCache();
  await cache.del(`place:${validatedData.placeId}`);
  await cache.del(`place_reports:${validatedData.placeId}`);

  // 记录用户操作日志
  logger.logUserAction(req.user.id, 'REPORT_CREATE', {
    reportId: report.id,
    placeId: validatedData.placeId,
    placeName: place.name,
    crowdnessLevel: validatedData.crowdnessLevel,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.status(201).json({
    success: true,
    message: '上报成功',
    data: { report }
  });
});

/**
 * @swagger
 * /api/v1/reports:
 *   get:
 *     summary: 获取上报记录列表
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: placeId
 *         schema:
 *           type: string
 *         description: 场所ID
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: 用户ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: 开始时间
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: 结束时间
 *       - in: query
 *         name: crowdnessLevel
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         description: 拥挤度等级
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: 每页数量
 *     responses:
 *       200:
 *         description: 上报记录列表
 */
export const getReports = catchAsync(async (req: Request, res: Response) => {
  const { placeId, userId, startDate, endDate, crowdnessLevel, page, limit } = getReportsSchema.parse(req.query);
  
  const skip = (page - 1) * limit;
  
  // 构建查询条件
  const where: any = {};
  
  if (placeId) {
    where.placeId = placeId;
  }
  
  if (userId) {
    where.userId = userId;
  }
  
  if (crowdnessLevel) {
    where.crowdnessLevel = crowdnessLevel;
  }
  
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      where.createdAt.gte = new Date(startDate);
    }
    if (endDate) {
      where.createdAt.lte = new Date(endDate);
    }
  }
  
  // 查询上报记录
  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          }
        },
        place: {
          select: {
            id: true,
            name: true,
            category: true,
            address: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.report.count({ where })
  ]);
  
  res.json({
    success: true,
    data: {
      reports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    }
  });
});

/**
 * @swagger
 * /api/v1/reports/{id}:
 *   get:
 *     summary: 获取上报记录详情
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 上报记录ID
 *     responses:
 *       200:
 *         description: 上报记录详情
 *       404:
 *         description: 上报记录不存在
 */
export const getReportById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const report = await prisma.report.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          nickname: true,
          avatar: true,
        }
      },
      place: {
        select: {
          id: true,
          name: true,
          category: true,
          address: true,
          latitude: true,
          longitude: true,
        }
      }
    }
  });
  
  if (!report) {
    throw new NotFoundError('上报记录不存在');
  }
  
  res.json({
    success: true,
    data: { report }
  });
});

/**
 * @swagger
 * /api/v1/reports/{id}:
 *   put:
 *     summary: 更新上报记录
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 上报记录ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               crowdnessLevel:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               description:
 *                 type: string
 *                 maxLength: 500
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *                 maxItems: 5
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 maxItems: 10
 *     responses:
 *       200:
 *         description: 上报记录更新成功
 *       403:
 *         description: 无权限更新
 *       404:
 *         description: 上报记录不存在
 */
export const updateReport = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ValidationError('用户信息缺失');
  }

  const { id } = req.params;
  const validatedData = updateReportSchema.parse(req.body);

  // 检查上报记录是否存在
  const existingReport = await prisma.report.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      placeId: true,
      createdAt: true,
      place: {
        select: {
          name: true
        }
      }
    }
  });

  if (!existingReport) {
    throw new NotFoundError('上报记录不存在');
  }

  // 检查权限（只有创建者可以更新，且只能在创建后1小时内更新）
  if (existingReport.userId !== req.user.id) {
    throw new ValidationError('无权限更新此上报记录');
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  if (existingReport.createdAt < oneHourAgo) {
    throw new ValidationError('上报记录创建超过1小时后不可修改');
  }

  // 更新上报记录
  const updatedReport = await prisma.report.update({
    where: { id },
    data: validatedData,
    include: {
      user: {
        select: {
          id: true,
          nickname: true,
          avatar: true,
        }
      },
      place: {
        select: {
          id: true,
          name: true,
          category: true,
          address: true,
        }
      }
    }
  });

  // 清除相关缓存
  const cache = createCache();
  await cache.del(`place:${existingReport.placeId}`);
  await cache.del(`place_reports:${existingReport.placeId}`);

  // 记录用户操作日志
  logger.logUserAction(req.user.id, 'REPORT_UPDATE', {
    reportId: id,
    placeId: existingReport.placeId,
    placeName: existingReport.place.name,
    updatedFields: Object.keys(validatedData),
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.json({
    success: true,
    message: '上报记录更新成功',
    data: { report: updatedReport }
  });
});

/**
 * @swagger
 * /api/v1/reports/{id}:
 *   delete:
 *     summary: 删除上报记录
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 上报记录ID
 *     responses:
 *       200:
 *         description: 上报记录删除成功
 *       403:
 *         description: 无权限删除
 *       404:
 *         description: 上报记录不存在
 */
export const deleteReport = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ValidationError('用户信息缺失');
  }

  const { id } = req.params;

  // 检查上报记录是否存在
  const existingReport = await prisma.report.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      placeId: true,
      createdAt: true,
      place: {
        select: {
          name: true
        }
      }
    }
  });

  if (!existingReport) {
    throw new NotFoundError('上报记录不存在');
  }

  // 检查权限（只有创建者或管理员可以删除）
  if (existingReport.userId !== req.user.id && req.user.role !== 'ADMIN') {
    throw new ValidationError('无权限删除此上报记录');
  }

  // 删除上报记录
  await prisma.report.delete({
    where: { id }
  });

  // 更新用户统计
  if (existingReport.userId === req.user.id) {
    await prisma.userStatistics.update({
      where: { userId: req.user.id },
      data: {
        totalReports: { decrement: 1 }
      }
    });
  }

  // 清除相关缓存
  const cache = createCache();
  await cache.del(`place:${existingReport.placeId}`);
  await cache.del(`place_reports:${existingReport.placeId}`);

  // 记录用户操作日志
  logger.logUserAction(req.user.id, 'REPORT_DELETE', {
    reportId: id,
    placeId: existingReport.placeId,
    placeName: existingReport.place.name,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.json({
    success: true,
    message: '上报记录删除成功'
  });
});

/**
 * @swagger
 * /api/v1/reports/statistics:
 *   get:
 *     summary: 获取上报统计数据
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: placeId
 *         schema:
 *           type: string
 *         description: 场所ID
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *           default: week
 *         description: 统计周期
 *     responses:
 *       200:
 *         description: 上报统计数据
 */
export const getReportStatistics = catchAsync(async (req: Request, res: Response) => {
  const { placeId, period = 'week' } = req.query;
  
  // 计算时间范围
  const now = new Date();
  let startDate: Date;
  
  switch (period) {
    case 'day':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case 'year':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }
  
  const where: any = {
    createdAt: {
      gte: startDate,
      lte: now
    }
  };
  
  if (placeId) {
    where.placeId = placeId as string;
  }
  
  // 获取统计数据
  const [
    totalReports,
    crowdnessStats,
    hourlyStats,
    topPlaces
  ] = await Promise.all([
    // 总上报数
    prisma.report.count({ where }),
    
    // 拥挤度分布统计
    prisma.report.groupBy({
      by: ['crowdnessLevel'],
      where,
      _count: {
        crowdnessLevel: true
      },
      orderBy: {
        crowdnessLevel: 'asc'
      }
    }),
    
    // 按小时统计
    prisma.$queryRaw`
      SELECT 
        EXTRACT(HOUR FROM "createdAt") as hour,
        COUNT(*) as count,
        AVG("crowdnessLevel") as avgCrowdness
      FROM "Report" 
      WHERE "createdAt" >= ${startDate} AND "createdAt" <= ${now}
      ${placeId ? prisma.$queryRaw`AND "placeId" = ${placeId}` : prisma.$queryRaw``}
      GROUP BY EXTRACT(HOUR FROM "createdAt")
      ORDER BY hour
    `,
    
    // 热门场所（如果没有指定场所ID）
    !placeId ? prisma.report.groupBy({
      by: ['placeId'],
      where,
      _count: {
        placeId: true
      },
      _avg: {
        crowdnessLevel: true
      },
      orderBy: {
        _count: {
          placeId: 'desc'
        }
      },
      take: 10
    }) : Promise.resolve([])
  ]);
  
  // 获取热门场所的详细信息
  let topPlacesWithDetails = [];
  if (topPlaces.length > 0) {
    const placeIds = topPlaces.map(p => p.placeId);
    const places = await prisma.place.findMany({
      where: { id: { in: placeIds } },
      select: {
        id: true,
        name: true,
        category: true,
        address: true,
      }
    });
    
    topPlacesWithDetails = topPlaces.map(stat => {
      const place = places.find(p => p.id === stat.placeId);
      return {
        ...stat,
        place
      };
    });
  }
  
  res.json({
    success: true,
    data: {
      period,
      startDate,
      endDate: now,
      totalReports,
      crowdnessDistribution: crowdnessStats.map(stat => ({
        level: stat.crowdnessLevel,
        count: stat._count.crowdnessLevel
      })),
      hourlyStats,
      topPlaces: topPlacesWithDetails
    }
  });
});

export default {
  createReport,
  getReports,
  getReportById,
  updateReport,
  deleteReport,
  getReportStatistics,
};