import { Request, Response } from 'express';
import { z } from 'zod';
import { catchAsync } from '@/middleware/errorHandler';
import { ValidationError, NotFoundError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import { createCache } from '@/utils/redis';
import prisma from '@/utils/database';

// 接口定义
interface PlaceWithCount {
  id: string;
  name: string;
  category: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  status: string;
  _count: {
    reports: number;
    visits: number;
  };
  distance?: number;
}

interface UserPreferences {
  preferredCategories: string[];
  socialPersonality?: string;
}

interface HistoricalDataItem {
  createdAt: Date;
  _avg: {
    crowdnessLevel: number | null;
  };
  _count: {
    id: number;
  };
}

interface TrendingPlace {
  placeId: string;
  _count: {
    placeId: number;
  };
  _avg: {
    crowdnessLevel: number | null;
  };
}

// 验证模式
const getSuggestionsSchema = z.object({
  type: z.enum(['today', 'personal', 'trending', 'nearby']).default('today'),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  radius: z.number().min(0.1).max(50).default(5),
  limit: z.number().min(1).max(50).default(10),
});

const createSuggestionSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(100, '标题不能超过100个字符'),
  description: z.string().max(500, '描述不能超过500个字符').optional(),
  type: z.enum(['PLACE', 'ACTIVITY', 'TIME', 'ROUTE']),
  targetAudience: z.enum(['ALL', 'INTROVERT', 'AMBIVERT', 'EXTROVERT']).default('ALL'),
  priority: z.number().min(1).max(10).default(5),
  validFrom: z.string().datetime().optional(),
  validTo: z.string().datetime().optional(),
  conditions: z.object({
    weather: z.array(z.string()).optional(),
    timeOfDay: z.array(z.string()).optional(),
    crowdnessLevel: z.array(z.number().min(1).max(5)).optional(),
    categories: z.array(z.string()).optional(),
  }).optional(),
  metadata: z.record(z.any()).optional(),
});

/**
 * @swagger
 * /api/v1/suggestions:
 *   get:
 *     summary: 获取智能建议列表
 *     tags: [Suggestions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [today, personal, trending, nearby]
 *           default: today
 *         description: 建议类型
 *       - in: query
 *         name: latitude
 *         schema:
 *           type: number
 *           minimum: -90
 *           maximum: 90
 *         description: 纬度
 *       - in: query
 *         name: longitude
 *         schema:
 *           type: number
 *           minimum: -180
 *           maximum: 180
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
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: 返回数量
 *     responses:
 *       200:
 *         description: 智能建议列表
 *       401:
 *         description: 未授权
 */
export const getSuggestions = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ValidationError('用户信息缺失');
  }

  const { type, latitude, longitude, radius, limit } = getSuggestionsSchema.parse(req.query);

  // 尝试从缓存获取
  const cache = createCache();
  const cacheKey = `suggestions:${req.user.id}:${type}:${latitude || 'null'}:${longitude || 'null'}:${radius}:${limit}`;
  const cached = await cache.get(cacheKey);

  if (cached) {
    return res.json({
      success: true,
      data: { suggestions: cached }
    });
  }

  let suggestions = [];

  switch (type) {
    case 'today':
      suggestions = await getTodaySuggestions(req.user.id, latitude, longitude, radius, limit);
      break;
    case 'personal':
      suggestions = await getPersonalSuggestions(req.user.id, limit);
      break;
    case 'trending':
      suggestions = await getTrendingSuggestions(latitude, longitude, radius, limit);
      break;
    case 'nearby':
      if (!latitude || !longitude) {
        throw new ValidationError('附近建议需要提供位置信息');
      }
      suggestions = await getNearbySuggestions(req.user.id, latitude, longitude, radius, limit);
      break;
    default:
      suggestions = await getTodaySuggestions(req.user.id, latitude, longitude, radius, limit);
  }

  // 缓存结果
  await cache.set(cacheKey, suggestions, 600); // 10分钟缓存

  // 记录用户操作日志
  logger.logUserAction(req.user.id, 'SUGGESTIONS_VIEW', {
    type,
    count: suggestions.length,
    hasLocation: !!(latitude && longitude),
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.json({
    success: true,
    data: { suggestions }
  });
});

/**
 * @swagger
 * /api/v1/suggestions/trends:
 *   get:
 *     summary: 获取趋势预测数据
 *     tags: [Suggestions]
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
 *           enum: [hour, day, week]
 *           default: day
 *         description: 预测周期
 *     responses:
 *       200:
 *         description: 趋势预测数据
 */
export const getTrends = catchAsync(async (req: Request, res: Response) => {
  const { placeId, period = 'day' } = req.query;

  // 尝试从缓存获取
  const cache = createCache();
  const cacheKey = `trends:${placeId || 'all'}:${period}`;
  const cached = await cache.get(cacheKey);

  if (cached) {
    return res.json({
      success: true,
      data: cached
    });
  }

  const now = new Date();
  let startDate: Date;

  switch (period) {
    case 'hour':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24小时
      break;
    case 'day':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7天
      break;
    case 'week':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30天
      break;
    default:
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  const whereCondition: {
    createdAt: {
      gte: Date;
      lte: Date;
    };
    placeId?: string;
  } = {
    createdAt: {
      gte: startDate,
      lte: now
    }
  };

  if (placeId) {
    whereCondition.placeId = placeId as string;
  }

  // 获取历史数据
  const historicalData = await prisma.report.groupBy({
    by: ['createdAt'],
    where: whereCondition,
    _avg: {
      crowdnessLevel: true
    },
    _count: {
      id: true
    },
    orderBy: {
      createdAt: 'asc'
    }
  });

  // 生成预测数据（简单的移动平均算法）
  const predictions = generatePredictions(historicalData, period as 'hour' | 'day' | 'week');

  const result = {
    period,
    startDate,
    endDate: now,
    historical: historicalData,
    predictions,
    summary: {
      totalReports: historicalData.reduce((sum: number, item: HistoricalDataItem) => sum + item._count.id, 0),
      averageCrowdness: historicalData.length > 0 
        ? historicalData.reduce((sum: number, item: HistoricalDataItem) => sum + (item._avg.crowdnessLevel || 0), 0) / historicalData.length 
        : 0
    }
  };

  // 缓存结果
  await cache.set(cacheKey, result, 1800); // 30分钟缓存

  res.json({
    success: true,
    data: result
  });
});

/**
 * @swagger
 * /api/v1/suggestions:
 *   post:
 *     summary: 创建自定义建议
 *     tags: [Suggestions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - type
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 maxLength: 500
 *               type:
 *                 type: string
 *                 enum: [PLACE, ACTIVITY, TIME, ROUTE]
 *               targetAudience:
 *                 type: string
 *                 enum: [ALL, INTROVERT, AMBIVERT, EXTROVERT]
 *                 default: ALL
 *               priority:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *                 default: 5
 *               validFrom:
 *                 type: string
 *                 format: date-time
 *               validTo:
 *                 type: string
 *                 format: date-time
 *               conditions:
 *                 type: object
 *               metadata:
 *                 type: object
 *     responses:
 *       201:
 *         description: 建议创建成功
 *       400:
 *         description: 验证错误
 *       401:
 *         description: 未授权
 */
export const createSuggestion = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ValidationError('用户信息缺失');
  }

  const validatedData = createSuggestionSchema.parse(req.body);

  // 创建建议
  const suggestion = await prisma.suggestion.create({
    data: {
      ...validatedData,
      createdById: req.user.id,
      validFrom: validatedData.validFrom ? new Date(validatedData.validFrom) : null,
      validTo: validatedData.validTo ? new Date(validatedData.validTo) : null,
    },
    include: {
      createdBy: {
        select: {
          id: true,
          nickname: true,
          avatar: true,
        }
      }
    }
  });

  // 清除相关缓存
  const cache = createCache();
  await cache.del(`suggestions:*`);

  // 记录用户操作日志
  logger.logUserAction(req.user.id, 'SUGGESTION_CREATE', {
    suggestionId: suggestion.id,
    title: suggestion.title,
    type: suggestion.type,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.status(201).json({
    success: true,
    message: '建议创建成功',
    data: { suggestion }
  });
});

/**
 * @swagger
 * /api/v1/suggestions/feedback:
 *   post:
 *     summary: 提交建议反馈
 *     tags: [Suggestions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - suggestionId
 *               - rating
 *             properties:
 *               suggestionId:
 *                 type: string
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               feedback:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       200:
 *         description: 反馈提交成功
 *       400:
 *         description: 验证错误
 *       404:
 *         description: 建议不存在
 */
export const submitFeedback = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ValidationError('用户信息缺失');
  }

  const { suggestionId, rating, feedback } = z.object({
    suggestionId: z.string().min(1),
    rating: z.number().min(1).max(5),
    feedback: z.string().max(500).optional(),
  }).parse(req.body);

  // 检查建议是否存在
  const suggestion = await prisma.suggestion.findUnique({
    where: { id: suggestionId },
    select: { id: true, title: true }
  });

  if (!suggestion) {
    throw new NotFoundError('建议不存在');
  }

  // 检查是否已经反馈过
  const existingFeedback = await prisma.suggestionFeedback.findFirst({
    where: {
      suggestionId,
      userId: req.user.id
    }
  });

  if (existingFeedback) {
    // 更新现有反馈
    await prisma.suggestionFeedback.update({
      where: { id: existingFeedback.id },
      data: { rating, feedback }
    });
  } else {
    // 创建新反馈
    await prisma.suggestionFeedback.create({
      data: {
        suggestionId,
        userId: req.user.id,
        rating,
        feedback,
      }
    });
  }

  // 记录用户操作日志
  logger.logUserAction(req.user.id, 'SUGGESTION_FEEDBACK', {
    suggestionId,
    suggestionTitle: suggestion.title,
    rating,
    hasFeedback: !!feedback,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.json({
    success: true,
    message: '反馈提交成功'
  });
});

// 辅助函数：获取今日建议
async function getTodaySuggestions(userId: string, latitude?: number, longitude?: number, radius = 5, limit = 10) {
  // 获取用户偏好
  const userPreferences = await prisma.userPreferences.findUnique({
    where: { userId }
  });

  const now = new Date();
  const currentHour = now.getHours();
  
  // 根据时间段推荐
  let timeBasedSuggestions: PlaceWithCount[] = [];
  
  if (currentHour >= 6 && currentHour < 11) {
    // 早晨：推荐早餐、运动场所
    timeBasedSuggestions = await getPlacesByCategories(['餐饮', '运动健身'], latitude, longitude, radius, Math.ceil(limit * 0.4));
  } else if (currentHour >= 11 && currentHour < 14) {
    // 中午：推荐午餐场所
    timeBasedSuggestions = await getPlacesByCategories(['餐饮'], latitude, longitude, radius, Math.ceil(limit * 0.5));
  } else if (currentHour >= 14 && currentHour < 18) {
    // 下午：推荐购物、娱乐场所
    timeBasedSuggestions = await getPlacesByCategories(['购物', '娱乐'], latitude, longitude, radius, Math.ceil(limit * 0.4));
  } else {
    // 晚上：推荐餐饮、娱乐场所
    timeBasedSuggestions = await getPlacesByCategories(['餐饮', '娱乐', '夜生活'], latitude, longitude, radius, Math.ceil(limit * 0.6));
  }

  // 根据用户偏好推荐
  let preferenceBasedSuggestions: PlaceWithCount[] = [];
  if (userPreferences?.preferredCategories && userPreferences.preferredCategories.length > 0) {
    preferenceBasedSuggestions = await getPlacesByCategories(
      userPreferences.preferredCategories, 
      latitude, 
      longitude, 
      radius, 
      Math.ceil(limit * 0.6)
    );
  }

  // 合并并去重
  const allSuggestions = [...timeBasedSuggestions, ...preferenceBasedSuggestions];
  const uniqueSuggestions = Array.from(
    new Map(allSuggestions.map(s => [s.id, s])).values()
  ).slice(0, limit);

  return uniqueSuggestions.map(place => ({
    id: `place_${place.id}`,
    type: 'PLACE',
    title: `推荐访问 ${place.name}`,
    description: `${place.category} - ${place.address}`,
    metadata: {
      place,
      reason: getRecommendationReason(place, currentHour, userPreferences)
    },
    priority: calculatePriority(place, userPreferences),
    createdAt: new Date()
  }));
}

// 辅助函数：获取个性化建议
async function getPersonalSuggestions(userId: string, limit = 10) {
  // 获取用户偏好和历史行为
  const [userPreferences, userHistory] = await Promise.all([
    prisma.userPreferences.findUnique({
      where: { userId }
    }),
    prisma.visit.findMany({
      where: { userId },
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
      take: 20
    })
  ]);

  // 基于历史访问推荐相似场所
  const visitedCategories = [...new Set(userHistory.map(v => v.place.category))];
  const similarPlaces = await getPlacesByCategories(visitedCategories, undefined, undefined, 10, limit);

  return similarPlaces.map(place => ({
    id: `personal_${place.id}`,
    type: 'PLACE',
    title: `基于您的喜好推荐 ${place.name}`,
    description: `您经常访问 ${place.category} 类场所，这里可能适合您`,
    metadata: {
      place,
      reason: '基于历史偏好推荐'
    },
    priority: calculatePriority(place, userPreferences),
    createdAt: new Date()
  }));
}

// 辅助函数：获取热门建议
async function getTrendingSuggestions(latitude?: number, longitude?: number, radius = 5, limit = 10) {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // 获取最近一周热门场所
  const trendingPlaces = await prisma.report.groupBy({
    by: ['placeId'],
    where: {
      createdAt: {
        gte: oneWeekAgo
      }
    },
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
    take: limit * 2
  });

  // 获取场所详情
  const placeIds = trendingPlaces.map((t: TrendingPlace) => t.placeId);
  const places = await prisma.place.findMany({
    where: { 
      id: { in: placeIds },
      status: 'ACTIVE'
    },
    include: {
      _count: {
        select: {
          reports: true,
          visits: true
        }
      }
    }
  });

  // 如果有位置信息，过滤距离
  let filteredPlaces = places;
  if (latitude && longitude) {
    filteredPlaces = places.filter(place => {
      if (!place.latitude || !place.longitude) return false;
      const distance = calculateDistance(latitude, longitude, place.latitude, place.longitude);
      return distance <= radius;
    });
  }

  return filteredPlaces.slice(0, limit).map(place => {
    const trendData = trendingPlaces.find((t: TrendingPlace) => t.placeId === place.id);
    return {
      id: `trending_${place.id}`,
      type: 'PLACE',
      title: `热门推荐 ${place.name}`,
      description: `最近很受欢迎的 ${place.category}，已有 ${trendData?._count.placeId || 0} 人上报`,
      metadata: {
        place,
        reason: '热门趋势推荐',
        reportCount: trendData?._count.placeId || 0,
        avgCrowdness: trendData?._avg.crowdnessLevel || 0
      },
      priority: 8,
      createdAt: new Date()
    };
  });
}

// 辅助函数：获取附近建议
async function getNearbySuggestions(userId: string, latitude: number, longitude: number, radius = 5, limit = 10) {
  // 获取附近场所
  const nearbyPlaces = await prisma.place.findMany({
    where: {
      status: 'ACTIVE',
      latitude: { not: null },
      longitude: { not: null }
    },
    include: {
      _count: {
        select: {
          reports: true,
          visits: true
        }
      }
    }
  });

  // 计算距离并过滤
  const placesWithDistance = nearbyPlaces
    .map(place => {
      if (!place.latitude || !place.longitude) return null;
      const distance = calculateDistance(latitude, longitude, place.latitude, place.longitude);
      return distance <= radius ? { ...place, distance } : null;
    })
    .filter((place): place is PlaceWithCount => place !== null)
    .sort((a, b) => (a.distance || 0) - (b.distance || 0))
    .slice(0, limit);

  return placesWithDistance.map(place => ({
    id: `nearby_${place.id}`,
    type: 'PLACE',
    title: `附近推荐 ${place.name}`,
    description: `距离您 ${(place.distance || 0).toFixed(1)}km 的 ${place.category}`,
    metadata: {
      place,
      reason: '地理位置推荐',
      distance: place.distance
    },
    priority: Math.max(1, 10 - Math.floor(place.distance || 0)),
    createdAt: new Date()
  }));
}

// 辅助函数：根据类别获取场所
async function getPlacesByCategories(categories: string[], latitude?: number, longitude?: number, radius = 10, limit = 10): Promise<PlaceWithCount[]> {
  const places = await prisma.place.findMany({
    where: {
      category: { in: categories },
      status: 'ACTIVE'
    },
    include: {
      _count: {
        select: {
          reports: true,
          visits: true
        }
      }
    },
    take: limit * 2 // 获取更多以便过滤
  });

  // 如果有位置信息，按距离过滤和排序
  if (latitude && longitude) {
    return places
      .map(place => {
        if (!place.latitude || !place.longitude) return null;
        const distance = calculateDistance(latitude, longitude, place.latitude, place.longitude);
        return distance <= radius ? { ...place, distance } : null;
      })
      .filter((place): place is PlaceWithCount => place !== null)
      .sort((a, b) => (a.distance || 0) - (b.distance || 0))
      .slice(0, limit);
  }

  return places.slice(0, limit) as PlaceWithCount[];
}

// 辅助函数：计算距离
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// 辅助函数：计算推荐优先级
function calculatePriority(place: PlaceWithCount, userPreferences: UserPreferences | null): number {
  let priority = 5; // 基础优先级

  // 根据用户偏好调整
  if (userPreferences?.preferredCategories?.includes(place.category)) {
    priority += 2;
  }

  // 根据场所受欢迎程度调整
  const totalActivity = (place._count?.reports || 0) + (place._count?.visits || 0);
  if (totalActivity > 50) priority += 2;
  else if (totalActivity > 20) priority += 1;

  return Math.min(10, Math.max(1, priority));
}

// 辅助函数：获取推荐原因
function getRecommendationReason(place: PlaceWithCount, currentHour: number, userPreferences: UserPreferences | null): string {
  const reasons = [];

  if (currentHour >= 6 && currentHour < 11 && place.category === '餐饮') {
    reasons.push('适合早餐时间');
  } else if (currentHour >= 11 && currentHour < 14 && place.category === '餐饮') {
    reasons.push('适合午餐时间');
  } else if (currentHour >= 18 && place.category === '餐饮') {
    reasons.push('适合晚餐时间');
  }

  if (userPreferences?.preferredCategories?.includes(place.category)) {
    reasons.push('符合您的偏好');
  }

  if ((place._count?.reports || 0) > 20) {
    reasons.push('用户活跃度高');
  }

  return reasons.length > 0 ? reasons.join('，') : '系统推荐';
}

// 辅助函数：生成预测数据
function generatePredictions(historicalData: HistoricalDataItem[], period: 'hour' | 'day' | 'week') {
  if (historicalData.length < 3) {
    return [];
  }

  const predictions = [];
  const windowSize = Math.min(5, historicalData.length);
  
  // 简单移动平均预测
  for (let i = 0; i < 24; i++) { // 预测未来24个时间点
    const recentData = historicalData.slice(-windowSize);
    const avgCrowdness = recentData.reduce((sum: number, item: HistoricalDataItem) => sum + (item._avg.crowdnessLevel || 0), 0) / recentData.length;
    const avgCount = recentData.reduce((sum: number, item: HistoricalDataItem) => sum + item._count.id, 0) / recentData.length;
    
    const futureTime = new Date();
    switch (period) {
      case 'hour':
        futureTime.setHours(futureTime.getHours() + i + 1);
        break;
      case 'day':
        futureTime.setDate(futureTime.getDate() + i + 1);
        break;
      case 'week':
        futureTime.setDate(futureTime.getDate() + (i + 1) * 7);
        break;
    }
    
    predictions.push({
      time: futureTime,
      predictedCrowdness: Math.max(1, Math.min(5, avgCrowdness + (Math.random() - 0.5) * 0.5)),
      predictedActivity: Math.max(0, avgCount + (Math.random() - 0.5) * avgCount * 0.2),
      confidence: Math.max(0.5, 1 - (i * 0.05)) // 置信度随时间递减
    });
  }
  
  return predictions.slice(0, 12); // 返回前12个预测点
}

export default {
  getSuggestions,
  getTrends,
  createSuggestion,
  submitFeedback,
};