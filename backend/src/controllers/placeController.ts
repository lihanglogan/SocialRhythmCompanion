import { Request, Response } from 'express';
import { z } from 'zod';
import { catchAsync } from '@/middleware/errorHandler';
import { ValidationError, NotFoundError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import { createCache } from '@/utils/redis';
import prisma from '@/utils/database';

// 验证模式
const searchPlacesSchema = z.object({
  query: z.string().min(1, '搜索关键词不能为空').optional(),
  category: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  radius: z.number().min(0.1).max(50).default(5),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

const createPlaceSchema = z.object({
  name: z.string().min(1, '场所名称不能为空').max(100, '场所名称不能超过100个字符'),
  category: z.string().min(1, '场所类别不能为空'),
  address: z.string().min(1, '地址不能为空').max(200, '地址不能超过200个字符'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  description: z.string().max(500, '描述不能超过500个字符').optional(),
  phone: z.string().regex(/^1[3-9]\d{9}$/, '手机号格式不正确').optional(),
  website: z.string().url('网站链接格式不正确').optional(),
  openingHours: z.record(z.string()).optional(),
  amenities: z.array(z.string()).max(20, '便民设施不能超过20个').optional(),
  images: z.array(z.string().url('图片链接格式不正确')).max(10, '图片不能超过10张').optional(),
});

const updatePlaceSchema = createPlaceSchema.partial();

/**
 * @swagger
 * /api/v1/places:
 *   get:
 *     summary: 搜索场所列表
 *     tags: [Places]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: 搜索关键词
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: 场所类别
 *       - in: query
 *         name: latitude
 *         schema:
 *           type: number
 *         description: 纬度
 *       - in: query
 *         name: longitude
 *         schema:
 *           type: number
 *         description: 经度
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           minimum: 0.1
 *           maximum: 50
 *           default: 5
 *         description: 搜索半径(公里)
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
 *         description: 场所列表
 */
export const getPlaces = catchAsync(async (req: Request, res: Response) => {
  const { query, category, latitude, longitude, radius, page, limit } = searchPlacesSchema.parse(req.query);
  
  const skip = (page - 1) * limit;
  
  // 构建查询条件
  const where: any = {};
  
  if (query) {
    where.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
      { address: { contains: query, mode: 'insensitive' } }
    ];
  }
  
  if (category) {
    where.category = category;
  }
  
  // 如果提供了位置信息，按距离排序
  let orderBy: any = { createdAt: 'desc' };
  if (latitude && longitude) {
    // 使用 Haversine 公式计算距离的 SQL 查询
    const distanceQuery = `
      (6371 * acos(cos(radians(${latitude})) * cos(radians(latitude)) * 
      cos(radians(longitude) - radians(${longitude})) + 
      sin(radians(${latitude})) * sin(radians(latitude))))
    `;
    
    // 添加距离过滤条件
    where.AND = [
      ...(where.AND || []),
      {
        AND: [
          { latitude: { not: null } },
          { longitude: { not: null } }
        ]
      }
    ];
  }
  
  // 查询场所列表
  const [places, total] = await Promise.all([
    prisma.place.findMany({
      where,
      include: {
        _count: {
          select: {
            reports: true,
            visits: true,
            matches: true
          }
        }
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.place.count({ where })
  ]);
  
  // 如果提供了位置信息，计算距离并排序
  let processedPlaces = places;
  if (latitude && longitude) {
    processedPlaces = places
      .map(place => {
        if (place.latitude && place.longitude) {
          const distance = calculateDistance(
            latitude, longitude,
            place.latitude, place.longitude
          );
          return { ...place, distance };
        }
        return { ...place, distance: null };
      })
      .filter(place => place.distance === null || place.distance <= radius)
      .sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
  }
  
  res.json({
    success: true,
    data: {
      places: processedPlaces,
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
 * /api/v1/places/{id}:
 *   get:
 *     summary: 获取场所详情
 *     tags: [Places]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 场所ID
 *     responses:
 *       200:
 *         description: 场所详情
 *       404:
 *         description: 场所不存在
 */
export const getPlaceById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  // 尝试从缓存获取
  const cache = createCache();
  const cacheKey = `place:${id}`;
  const cached = await cache.get(cacheKey);
  
  if (cached) {
    return res.json({
      success: true,
      data: { place: cached }
    });
  }
  
  const place = await prisma.place.findUnique({
    where: { id },
    include: {
      reports: {
        select: {
          id: true,
          crowdnessLevel: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              nickname: true,
              avatar: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      visits: {
        select: {
          id: true,
          visitedAt: true,
          user: {
            select: {
              id: true,
              nickname: true,
              avatar: true,
            }
          }
        },
        orderBy: { visitedAt: 'desc' },
        take: 10,
      },
      _count: {
        select: {
          reports: true,
          visits: true,
          matches: true
        }
      }
    }
  });
  
  if (!place) {
    throw new NotFoundError('场所不存在');
  }
  
  // 计算平均拥挤度
  const avgCrowdness = await prisma.report.aggregate({
    where: {
      placeId: id,
      createdAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 最近7天
      }
    },
    _avg: {
      crowdnessLevel: true
    }
  });
  
  const placeWithStats = {
    ...place,
    averageCrowdness: avgCrowdness._avg.crowdnessLevel || 0,
  };
  
  // 缓存结果
  await cache.set(cacheKey, placeWithStats, 300); // 5分钟缓存
  
  res.json({
    success: true,
    data: { place: placeWithStats }
  });
});

/**
 * @swagger
 * /api/v1/places:
 *   post:
 *     summary: 创建新场所
 *     tags: [Places]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *               - address
 *               - latitude
 *               - longitude
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *               category:
 *                 type: string
 *               address:
 *                 type: string
 *                 maxLength: 200
 *               latitude:
 *                 type: number
 *                 minimum: -90
 *                 maximum: 90
 *               longitude:
 *                 type: number
 *                 minimum: -180
 *                 maximum: 180
 *               description:
 *                 type: string
 *                 maxLength: 500
 *               phone:
 *                 type: string
 *               website:
 *                 type: string
 *                 format: uri
 *               openingHours:
 *                 type: object
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *     responses:
 *       201:
 *         description: 场所创建成功
 *       400:
 *         description: 验证错误
 *       401:
 *         description: 未授权
 */
export const createPlace = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ValidationError('用户信息缺失');
  }
  
  const validatedData = createPlaceSchema.parse(req.body);
  
  // 检查是否已存在相同名称和地址的场所
  const existingPlace = await prisma.place.findFirst({
    where: {
      name: validatedData.name,
      address: validatedData.address
    }
  });
  
  if (existingPlace) {
    throw new ValidationError('该场所已存在');
  }
  
  // 创建场所
  const place = await prisma.place.create({
    data: {
      ...validatedData,
      createdById: req.user.id,
      status: 'PENDING', // 新创建的场所需要审核
    },
    include: {
      createdBy: {
        select: {
          id: true,
          nickname: true,
          avatar: true,
        }
      },
      _count: {
        select: {
          reports: true,
          visits: true,
          matches: true
        }
      }
    }
  });
  
  // 记录用户操作日志
  logger.logUserAction(req.user.id, 'PLACE_CREATE', {
    placeId: place.id,
    placeName: place.name,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  res.status(201).json({
    success: true,
    message: '场所创建成功，等待审核',
    data: { place }
  });
});

/**
 * @swagger
 * /api/v1/places/{id}:
 *   put:
 *     summary: 更新场所信息
 *     tags: [Places]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 场所ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *               category:
 *                 type: string
 *               address:
 *                 type: string
 *                 maxLength: 200
 *               latitude:
 *                 type: number
 *                 minimum: -90
 *                 maximum: 90
 *               longitude:
 *                 type: number
 *                 minimum: -180
 *                 maximum: 180
 *               description:
 *                 type: string
 *                 maxLength: 500
 *               phone:
 *                 type: string
 *               website:
 *                 type: string
 *                 format: uri
 *               openingHours:
 *                 type: object
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *     responses:
 *       200:
 *         description: 场所更新成功
 *       403:
 *         description: 无权限更新
 *       404:
 *         description: 场所不存在
 */
export const updatePlace = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ValidationError('用户信息缺失');
  }
  
  const { id } = req.params;
  const validatedData = updatePlaceSchema.parse(req.body);
  
  // 检查场所是否存在
  const existingPlace = await prisma.place.findUnique({
    where: { id },
    select: {
      id: true,
      createdById: true,
      name: true,
    }
  });
  
  if (!existingPlace) {
    throw new NotFoundError('场所不存在');
  }
  
  // 检查权限（只有创建者或管理员可以更新）
  if (existingPlace.createdById !== req.user.id && req.user.role !== 'ADMIN') {
    throw new ValidationError('无权限更新此场所');
  }
  
  // 更新场所
  const updatedPlace = await prisma.place.update({
    where: { id },
    data: validatedData,
    include: {
      createdBy: {
        select: {
          id: true,
          nickname: true,
          avatar: true,
        }
      },
      _count: {
        select: {
          reports: true,
          visits: true,
          matches: true
        }
      }
    }
  });
  
  // 清除缓存
  const cache = createCache();
  await cache.del(`place:${id}`);
  
  // 记录用户操作日志
  logger.logUserAction(req.user.id, 'PLACE_UPDATE', {
    placeId: id,
    placeName: existingPlace.name,
    updatedFields: Object.keys(validatedData),
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  res.json({
    success: true,
    message: '场所更新成功',
    data: { place: updatedPlace }
  });
});

/**
 * @swagger
 * /api/v1/places/categories:
 *   get:
 *     summary: 获取场所类别列表
 *     tags: [Places]
 *     responses:
 *       200:
 *         description: 场所类别列表
 */
export const getCategories = catchAsync(async (req: Request, res: Response) => {
  // 尝试从缓存获取
  const cache = createCache();
  const cacheKey = 'place_categories';
  const cached = await cache.get(cacheKey);
  
  if (cached) {
    return res.json({
      success: true,
      data: { categories: cached }
    });
  }
  
  // 从数据库获取所有唯一的类别
  const categories = await prisma.place.findMany({
    select: {
      category: true,
    },
    distinct: ['category'],
    where: {
      status: 'ACTIVE'
    }
  });
  
  const categoryList = categories.map(c => c.category).filter(Boolean).sort();
  
  // 缓存结果
  await cache.set(cacheKey, categoryList, 3600); // 1小时缓存
  
  res.json({
    success: true,
    data: { categories: categoryList }
  });
});

/**
 * @swagger
 * /api/v1/places/{id}/visit:
 *   post:
 *     summary: 记录场所访问
 *     tags: [Places]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 场所ID
 *     responses:
 *       200:
 *         description: 访问记录成功
 *       404:
 *         description: 场所不存在
 */
export const visitPlace = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ValidationError('用户信息缺失');
  }
  
  const { id } = req.params;
  
  // 检查场所是否存在
  const place = await prisma.place.findUnique({
    where: { id },
    select: { id: true, name: true }
  });
  
  if (!place) {
    throw new NotFoundError('场所不存在');
  }
  
  // 检查今天是否已经访问过
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const existingVisit = await prisma.visit.findFirst({
    where: {
      userId: req.user.id,
      placeId: id,
      visitedAt: {
        gte: today
      }
    }
  });
  
  if (existingVisit) {
    return res.json({
      success: true,
      message: '今日已记录访问'
    });
  }
  
  // 创建访问记录
  await prisma.visit.create({
    data: {
      userId: req.user.id,
      placeId: id,
      visitedAt: new Date(),
    }
  });
  
  // 更新用户统计
  await prisma.userStatistics.upsert({
    where: { userId: req.user.id },
    update: {
      totalVisits: { increment: 1 }
    },
    create: {
      userId: req.user.id,
      totalReports: 0,
      totalMatches: 0,
      totalVisits: 1,
      streakDays: 0,
      achievements: []
    }
  });
  
  // 记录用户操作日志
  logger.logUserAction(req.user.id, 'PLACE_VISIT', {
    placeId: id,
    placeName: place.name,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  res.json({
    success: true,
    message: '访问记录成功'
  });
});

// 计算两点间距离的辅助函数（Haversine公式）
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // 地球半径（公里）
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default {
  getPlaces,
  getPlaceById,
  createPlace,
  updatePlace,
  getCategories,
  visitPlace,
};