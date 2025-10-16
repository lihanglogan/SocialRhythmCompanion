import { Request, Response } from 'express';
import { z } from 'zod';
import { catchAsync } from '@/middleware/errorHandler';
import { ValidationError, NotFoundError, ConflictError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import { createCache } from '@/utils/redis';
import prisma from '@/utils/database';

// 验证模式
const updateProfileSchema = z.object({
  nickname: z.string().min(2, '昵称至少需要2个字符').max(20, '昵称不能超过20个字符').optional(),
  phone: z.string().regex(/^1[3-9]\d{9}$/, '手机号格式不正确').optional(),
  birthDate: z.string().datetime('生日格式不正确').optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  avatar: z.string().url('头像链接格式不正确').optional(),
});

const updatePreferencesSchema = z.object({
  preferredCategories: z.array(z.string()).max(10, '偏好类别不能超过10个').optional(),
  preferredTimes: z.array(z.string().regex(/^([01]?\d|2[0-3]):[0-5]\d$/, '时间格式不正确')).max(24, '偏好时间段不能超过24个').optional(),
  maxDistance: z.number().min(0.5, '最大距离不能小于0.5公里').max(50, '最大距离不能超过50公里').optional(),
  crowdnessPreference: z.enum(['LOW', 'MEDIUM', 'HIGH', 'ANY']).optional(),
  activityLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  socialPreference: z.enum(['INTROVERT', 'AMBIVERT', 'EXTROVERT']).optional(),
  notifications: z.object({
    pushEnabled: z.boolean().optional(),
    emailEnabled: z.boolean().optional(),
    suggestionReminders: z.boolean().optional(),
    matchNotifications: z.boolean().optional(),
    reportReminders: z.boolean().optional(),
  }).optional(),
  privacy: z.object({
    profileVisibility: z.enum(['PUBLIC', 'FRIENDS', 'PRIVATE']).optional(),
    locationSharing: z.boolean().optional(),
    activitySharing: z.boolean().optional(),
    matchingEnabled: z.boolean().optional(),
  }).optional(),
});

const updateLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().max(200).optional(),
});

/**
 * @swagger
 * /api/v1/users/profile:
 *   get:
 *     summary: 获取用户资料
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 用户资料信息
 *       401:
 *         description: 未授权
 */
export const getProfile = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ValidationError('用户信息缺失');
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      email: true,
      nickname: true,
      phone: true,
      birthDate: true,
      gender: true,
      avatar: true,
      role: true,
      status: true,
      lastActiveAt: true,
      createdAt: true,
      updatedAt: true,
      preferences: {
        select: {
          preferredCategories: true,
          preferredTimes: true,
          maxDistance: true,
          crowdnessPreference: true,
          activityLevel: true,
          socialPreference: true,
          notifications: true,
          privacy: true,
          updatedAt: true,
        }
      },
      statistics: {
        select: {
          totalReports: true,
          totalMatches: true,
          totalVisits: true,
          streakDays: true,
          achievements: true,
          updatedAt: true,
        }
      }
    }
  });

  if (!user) {
    throw new NotFoundError('用户不存在');
  }

  res.json({
    success: true,
    data: { user }
  });
});

/**
 * @swagger
 * /api/v1/users/profile:
 *   put:
 *     summary: 更新用户资料
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nickname:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 20
 *               phone:
 *                 type: string
 *               birthDate:
 *                 type: string
 *                 format: date-time
 *               gender:
 *                 type: string
 *                 enum: [MALE, FEMALE, OTHER]
 *               avatar:
 *                 type: string
 *                 format: uri
 *     responses:
 *       200:
 *         description: 资料更新成功
 *       400:
 *         description: 验证错误
 *       409:
 *         description: 昵称或手机号已存在
 */
export const updateProfile = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ValidationError('用户信息缺失');
  }

  const validatedData = updateProfileSchema.parse(req.body);

  // 检查昵称是否已被其他用户使用
  if (validatedData.nickname) {
    const existingUser = await prisma.user.findFirst({
      where: {
        nickname: validatedData.nickname,
        id: { not: req.user.id }
      }
    });

    if (existingUser) {
      throw new ConflictError('昵称已被使用');
    }
  }

  // 检查手机号是否已被其他用户使用
  if (validatedData.phone) {
    const existingPhone = await prisma.user.findFirst({
      where: {
        phone: validatedData.phone,
        id: { not: req.user.id }
      }
    });

    if (existingPhone) {
      throw new ConflictError('手机号已被注册');
    }
  }

  // 更新用户资料
  const updatedUser = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      ...validatedData,
      birthDate: validatedData.birthDate ? new Date(validatedData.birthDate) : undefined,
      lastActiveAt: new Date(),
    },
    select: {
      id: true,
      email: true,
      nickname: true,
      phone: true,
      birthDate: true,
      gender: true,
      avatar: true,
      role: true,
      status: true,
      lastActiveAt: true,
      createdAt: true,
      updatedAt: true,
    }
  });

  // 记录用户操作日志
  logger.logUserAction(req.user.id, 'PROFILE_UPDATE', {
    updatedFields: Object.keys(validatedData),
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.json({
    success: true,
    message: '资料更新成功',
    data: { user: updatedUser }
  });
});

/**
 * @swagger
 * /api/v1/users/preferences:
 *   get:
 *     summary: 获取用户偏好设置
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 用户偏好设置
 */
export const getPreferences = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ValidationError('用户信息缺失');
  }

  let preferences = await prisma.userPreferences.findUnique({
    where: { userId: req.user.id }
  });

  // 如果用户没有偏好设置，创建默认设置
  if (!preferences) {
    preferences = await prisma.userPreferences.create({
      data: {
        userId: req.user.id,
        preferredCategories: ['餐饮', '购物', '娱乐'],
        preferredTimes: ['09:00', '14:00', '19:00'],
        maxDistance: 5.0,
        crowdnessPreference: 'MEDIUM',
        activityLevel: 'MEDIUM',
        socialPreference: 'AMBIVERT',
        notifications: {
          pushEnabled: true,
          emailEnabled: true,
          suggestionReminders: true,
          matchNotifications: true,
          reportReminders: true,
        },
        privacy: {
          profileVisibility: 'FRIENDS',
          locationSharing: true,
          activitySharing: true,
          matchingEnabled: true,
        }
      }
    });
  }

  res.json({
    success: true,
    data: { preferences }
  });
});

/**
 * @swagger
 * /api/v1/users/preferences:
 *   put:
 *     summary: 更新用户偏好设置
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               preferredCategories:
 *                 type: array
 *                 items:
 *                   type: string
 *               preferredTimes:
 *                 type: array
 *                 items:
 *                   type: string
 *               maxDistance:
 *                 type: number
 *                 minimum: 0.5
 *                 maximum: 50
 *               crowdnessPreference:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH, ANY]
 *               activityLevel:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH]
 *               socialPreference:
 *                 type: string
 *                 enum: [INTROVERT, AMBIVERT, EXTROVERT]
 *     responses:
 *       200:
 *         description: 偏好设置更新成功
 */
export const updatePreferences = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ValidationError('用户信息缺失');
  }

  const validatedData = updatePreferencesSchema.parse(req.body);

  // 更新或创建用户偏好设置
  const preferences = await prisma.userPreferences.upsert({
    where: { userId: req.user.id },
    update: validatedData,
    create: {
      userId: req.user.id,
      ...validatedData,
      // 设置默认值
      preferredCategories: validatedData.preferredCategories || ['餐饮', '购物', '娱乐'],
      preferredTimes: validatedData.preferredTimes || ['09:00', '14:00', '19:00'],
      maxDistance: validatedData.maxDistance || 5.0,
      crowdnessPreference: validatedData.crowdnessPreference || 'MEDIUM',
      activityLevel: validatedData.activityLevel || 'MEDIUM',
      socialPreference: validatedData.socialPreference || 'AMBIVERT',
      notifications: validatedData.notifications || {
        pushEnabled: true,
        emailEnabled: true,
        suggestionReminders: true,
        matchNotifications: true,
        reportReminders: true,
      },
      privacy: validatedData.privacy || {
        profileVisibility: 'FRIENDS',
        locationSharing: true,
        activitySharing: true,
        matchingEnabled: true,
      }
    }
  });

  // 清除相关缓存
  const cache = createCache();
  await cache.del(`user_preferences:${req.user.id}`);
  await cache.del(`user_suggestions:${req.user.id}`);

  // 记录用户操作日志
  logger.logUserAction(req.user.id, 'PREFERENCES_UPDATE', {
    updatedFields: Object.keys(validatedData),
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.json({
    success: true,
    message: '偏好设置更新成功',
    data: { preferences }
  });
});

/**
 * @swagger
 * /api/v1/users/location:
 *   put:
 *     summary: 更新用户位置
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - latitude
 *               - longitude
 *             properties:
 *               latitude:
 *                 type: number
 *                 minimum: -90
 *                 maximum: 90
 *               longitude:
 *                 type: number
 *                 minimum: -180
 *                 maximum: 180
 *               address:
 *                 type: string
 *                 maxLength: 200
 *     responses:
 *       200:
 *         description: 位置更新成功
 */
export const updateLocation = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ValidationError('用户信息缺失');
  }

  const { latitude, longitude, address } = updateLocationSchema.parse(req.body);

  // 更新用户位置
  await prisma.user.update({
    where: { id: req.user.id },
    data: {
      currentLatitude: latitude,
      currentLongitude: longitude,
      currentAddress: address,
      lastActiveAt: new Date(),
    }
  });

  // 缓存用户位置信息
  const cache = createCache();
  await cache.set(`user_location:${req.user.id}`, {
    latitude,
    longitude,
    address,
    updatedAt: new Date().toISOString()
  }, 3600); // 1小时过期

  // 记录用户操作日志
  logger.logUserAction(req.user.id, 'LOCATION_UPDATE', {
    latitude,
    longitude,
    address,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.json({
    success: true,
    message: '位置更新成功'
  });
});

/**
 * @swagger
 * /api/v1/users/statistics:
 *   get:
 *     summary: 获取用户统计数据
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 用户统计数据
 */
export const getStatistics = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ValidationError('用户信息缺失');
  }

  let statistics = await prisma.userStatistics.findUnique({
    where: { userId: req.user.id }
  });

  // 如果用户没有统计数据，创建默认统计
  if (!statistics) {
    statistics = await prisma.userStatistics.create({
      data: {
        userId: req.user.id,
        totalReports: 0,
        totalMatches: 0,
        totalVisits: 0,
        streakDays: 0,
        achievements: [],
      }
    });
  }

  // 获取最近的活动统计
  const recentReports = await prisma.report.count({
    where: {
      userId: req.user.id,
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 最近30天
      }
    }
  });

  const recentMatches = await prisma.match.count({
    where: {
      OR: [
        { user1Id: req.user.id },
        { user2Id: req.user.id }
      ],
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 最近30天
      }
    }
  });

  res.json({
    success: true,
    data: {
      statistics,
      recentActivity: {
        reportsLast30Days: recentReports,
        matchesLast30Days: recentMatches,
      }
    }
  });
});

/**
 * @swagger
 * /api/v1/users/history:
 *   get:
 *     summary: 获取用户历史记录
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [reports, matches, visits]
 *         description: 记录类型
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: 每页数量
 *     responses:
 *       200:
 *         description: 用户历史记录
 */
export const getHistory = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ValidationError('用户信息缺失');
  }

  const { type = 'reports', page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  let data: any[] = [];
  let total = 0;

  switch (type) {
    case 'reports':
      [data, total] = await Promise.all([
        prisma.report.findMany({
          where: { userId: req.user.id },
          include: {
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
          take: Number(limit),
        }),
        prisma.report.count({
          where: { userId: req.user.id }
        })
      ]);
      break;

    case 'matches':
      [data, total] = await Promise.all([
        prisma.match.findMany({
          where: {
            OR: [
              { user1Id: req.user.id },
              { user2Id: req.user.id }
            ]
          },
          include: {
            user1: {
              select: {
                id: true,
                nickname: true,
                avatar: true,
              }
            },
            user2: {
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
          take: Number(limit),
        }),
        prisma.match.count({
          where: {
            OR: [
              { user1Id: req.user.id },
              { user2Id: req.user.id }
            ]
          }
        })
      ]);
      break;

    case 'visits':
      [data, total] = await Promise.all([
        prisma.visit.findMany({
          where: { userId: req.user.id },
          include: {
            place: {
              select: {
                id: true,
                name: true,
                category: true,
                address: true,
              }
            }
          },
          orderBy: { visitedAt: 'desc' },
          skip,
          take: Number(limit),
        }),
        prisma.visit.count({
          where: { userId: req.user.id }
        })
      ]);
      break;

    default:
      throw new ValidationError('无效的记录类型');
  }

  res.json({
    success: true,
    data: {
      items: data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      }
    }
  });
});

export default {
  getProfile,
  updateProfile,
  getPreferences,
  updatePreferences,
  updateLocation,
  getStatistics,
  getHistory,
};