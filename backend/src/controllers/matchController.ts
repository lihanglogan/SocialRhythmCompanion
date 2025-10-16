import { Request, Response } from 'express';
import { z } from 'zod';
import { catchAsync } from '@/middleware/errorHandler';
import { ValidationError, NotFoundError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import { createCache } from '@/utils/redis';
import prisma from '@/utils/database';

// 接口定义
interface UserWithPreferences {
  id: string;
  nickname: string;
  avatar: string | null;
  age: number | null;
  gender: string | null;
  latitude: number | null;
  longitude: number | null;
  lastActiveAt: Date | null;
  userPreferences: {
    socialPersonality: string;
    preferredCategories: string[];
    maxDistance: number;
    preferredAgeRange: string | null;
  } | null;
}

// 验证模式
const createMatchSchema = z.object({
  targetUserId: z.string().min(1, '目标用户ID不能为空'),
  message: z.string().max(500, '消息不能超过500个字符').optional(),
});

const updateMatchSchema = z.object({
  status: z.enum(['ACCEPTED', 'REJECTED']),
  message: z.string().max(500, '消息不能超过500个字符').optional(),
});

const findNearbyUsersSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radius: z.number().min(0.1).max(50).default(5),
  limit: z.number().min(1).max(50).default(20),
  ageMin: z.number().min(18).max(100).optional(),
  ageMax: z.number().min(18).max(100).optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  personality: z.enum(['INTROVERT', 'AMBIVERT', 'EXTROVERT']).optional(),
});

/**
 * @swagger
 * /api/v1/matches/nearby:
 *   get:
 *     summary: 查找附近用户
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *           minimum: -90
 *           maximum: 90
 *         description: 纬度
 *       - in: query
 *         name: longitude
 *         required: true
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
 *           default: 20
 *         description: 返回数量
 *       - in: query
 *         name: ageMin
 *         schema:
 *           type: integer
 *           minimum: 18
 *           maximum: 100
 *         description: 最小年龄
 *       - in: query
 *         name: ageMax
 *         schema:
 *           type: integer
 *           minimum: 18
 *           maximum: 100
 *         description: 最大年龄
 *       - in: query
 *         name: gender
 *         schema:
 *           type: string
 *           enum: [MALE, FEMALE, OTHER]
 *         description: 性别筛选
 *       - in: query
 *         name: personality
 *         schema:
 *           type: string
 *           enum: [INTROVERT, AMBIVERT, EXTROVERT]
 *         description: 社交性格筛选
 *     responses:
 *       200:
 *         description: 附近用户列表
 *       401:
 *         description: 未授权
 */
export const findNearbyUsers = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ValidationError('用户信息缺失');
  }

  const { latitude, longitude, radius, limit, ageMin, ageMax, gender, personality } = findNearbyUsersSchema.parse(req.query);

  // 尝试从缓存获取
  const cache = createCache();
  const cacheKey = `nearby_users:${req.user.id}:${latitude}:${longitude}:${radius}:${limit}:${ageMin || 'null'}:${ageMax || 'null'}:${gender || 'null'}:${personality || 'null'}`;
  const cached = await cache.get(cacheKey);

  if (cached) {
    return res.json({
      success: true,
      data: { users: cached }
    });
  }

  // 构建查询条件
  const whereCondition: any = {
    id: { not: req.user.id }, // 排除自己
    latitude: { not: null },
    longitude: { not: null },
    isActive: true,
    lastActiveAt: {
      gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24小时内活跃
    }
  };

  if (ageMin || ageMax) {
    const currentYear = new Date().getFullYear();
    if (ageMin) whereCondition.birthYear = { lte: currentYear - ageMin };
    if (ageMax) whereCondition.birthYear = { gte: currentYear - ageMax };
  }

  if (gender) {
    whereCondition.gender = gender;
  }

  // 获取用户列表
  const users = await prisma.user.findMany({
    where: whereCondition,
    include: {
      userPreferences: {
        select: {
          socialPersonality: true,
          preferredCategories: true,
          maxDistance: true,
          preferredAgeRange: true,
        }
      }
    },
    take: limit * 2 // 获取更多以便过滤
  });

  // 计算距离并过滤
  const nearbyUsers = users
    .map(user => {
      if (!user.latitude || !user.longitude) return null;
      const distance = calculateDistance(latitude, longitude, user.latitude, user.longitude);
      if (distance > radius) return null;

      // 性格筛选
      if (personality && user.userPreferences?.socialPersonality !== personality) {
        return null;
      }

      return {
        ...user,
        distance,
        age: user.birthYear ? new Date().getFullYear() - user.birthYear : null
      };
    })
    .filter(Boolean)
    .sort((a, b) => (a?.distance || 0) - (b?.distance || 0))
    .slice(0, limit);

  // 缓存结果
  await cache.set(cacheKey, nearbyUsers, 300); // 5分钟缓存

  // 记录用户操作日志
  logger.logUserAction(req.user.id, 'NEARBY_USERS_SEARCH', {
    location: { latitude, longitude },
    radius,
    filters: { ageMin, ageMax, gender, personality },
    resultCount: nearbyUsers.length,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.json({
    success: true,
    data: { users: nearbyUsers }
  });
});

/**
 * @swagger
 * /api/v1/matches:
 *   post:
 *     summary: 发起匹配请求
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - targetUserId
 *             properties:
 *               targetUserId:
 *                 type: string
 *               message:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       201:
 *         description: 匹配请求创建成功
 *       400:
 *         description: 验证错误
 *       404:
 *         description: 目标用户不存在
 */
export const createMatch = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ValidationError('用户信息缺失');
  }

  const { targetUserId, message } = createMatchSchema.parse(req.body);

  // 检查目标用户是否存在
  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, nickname: true, isActive: true }
  });

  if (!targetUser || !targetUser.isActive) {
    throw new NotFoundError('目标用户不存在或已停用');
  }

  // 检查是否已经有匹配请求
  const existingMatch = await prisma.match.findFirst({
    where: {
      OR: [
        { requesterId: req.user.id, targetId: targetUserId },
        { requesterId: targetUserId, targetId: req.user.id }
      ]
    }
  });

  if (existingMatch) {
    throw new ValidationError('已存在匹配请求');
  }

  // 创建匹配请求
  const match = await prisma.match.create({
    data: {
      requesterId: req.user.id,
      targetId: targetUserId,
      message,
      status: 'PENDING',
    },
    include: {
      requester: {
        select: {
          id: true,
          nickname: true,
          avatar: true,
        }
      },
      target: {
        select: {
          id: true,
          nickname: true,
          avatar: true,
        }
      }
    }
  });

  // 创建通知
  await prisma.notification.create({
    data: {
      userId: targetUserId,
      type: 'MATCH_REQUEST',
      title: '新的匹配请求',
      content: `${req.user.nickname} 向您发送了匹配请求`,
      metadata: {
        matchId: match.id,
        requesterId: req.user.id,
        message
      }
    }
  });

  // 记录用户操作日志
  logger.logUserAction(req.user.id, 'MATCH_REQUEST_CREATE', {
    matchId: match.id,
    targetUserId,
    targetUserNickname: targetUser.nickname,
    hasMessage: !!message,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.status(201).json({
    success: true,
    message: '匹配请求发送成功',
    data: { match }
  });
});

/**
 * @swagger
 * /api/v1/matches:
 *   get:
 *     summary: 获取匹配列表
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [sent, received, matched]
 *           default: received
 *         description: 匹配类型
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, ACCEPTED, REJECTED]
 *         description: 匹配状态
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
 *           maximum: 50
 *           default: 20
 *         description: 每页数量
 *     responses:
 *       200:
 *         description: 匹配列表
 */
export const getMatches = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ValidationError('用户信息缺失');
  }

  const { type = 'received', status, page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  let whereCondition: any = {};

  switch (type) {
    case 'sent':
      whereCondition.requesterId = req.user.id;
      break;
    case 'received':
      whereCondition.targetId = req.user.id;
      break;
    case 'matched':
      whereCondition = {
        OR: [
          { requesterId: req.user.id },
          { targetId: req.user.id }
        ],
        status: 'ACCEPTED'
      };
      break;
    default:
      whereCondition.targetId = req.user.id;
  }

  if (status) {
    whereCondition.status = status;
  }

  const [matches, total] = await Promise.all([
    prisma.match.findMany({
      where: whereCondition,
      include: {
        requester: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
            age: true,
            gender: true,
          }
        },
        target: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
            age: true,
            gender: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit)
    }),
    prisma.match.count({ where: whereCondition })
  ]);

  res.json({
    success: true,
    data: {
      matches,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }
  });
});

/**
 * @swagger
 * /api/v1/matches/{matchId}:
 *   put:
 *     summary: 更新匹配状态
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: string
 *         description: 匹配ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ACCEPTED, REJECTED]
 *               message:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       200:
 *         description: 匹配状态更新成功
 *       404:
 *         description: 匹配不存在
 *       403:
 *         description: 无权限操作
 */
export const updateMatch = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ValidationError('用户信息缺失');
  }

  const { matchId } = req.params;
  const { status, message } = updateMatchSchema.parse(req.body);

  // 查找匹配记录
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      requester: {
        select: {
          id: true,
          nickname: true,
        }
      },
      target: {
        select: {
          id: true,
          nickname: true,
        }
      }
    }
  });

  if (!match) {
    throw new NotFoundError('匹配记录不存在');
  }

  // 检查权限（只有目标用户可以更新状态）
  if (match.targetId !== req.user.id) {
    throw new ValidationError('无权限操作此匹配');
  }

  // 检查当前状态
  if (match.status !== 'PENDING') {
    throw new ValidationError('匹配状态已确定，无法修改');
  }

  // 更新匹配状态
  const updatedMatch = await prisma.match.update({
    where: { id: matchId },
    data: {
      status,
      responseMessage: message,
      respondedAt: new Date(),
    },
    include: {
      requester: {
        select: {
          id: true,
          nickname: true,
          avatar: true,
        }
      },
      target: {
        select: {
          id: true,
          nickname: true,
          avatar: true,
        }
      }
    }
  });

  // 如果接受匹配，创建聊天房间
  let chatRoom = null;
  if (status === 'ACCEPTED') {
    chatRoom = await prisma.chatRoom.create({
      data: {
        type: 'PRIVATE',
        name: `${match.requester.nickname} & ${match.target.nickname}`,
        participants: {
          create: [
            { userId: match.requesterId, role: 'MEMBER' },
            { userId: match.targetId, role: 'MEMBER' }
          ]
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                nickname: true,
                avatar: true,
              }
            }
          }
        }
      }
    });
  }

  // 创建通知
  await prisma.notification.create({
    data: {
      userId: match.requesterId,
      type: status === 'ACCEPTED' ? 'MATCH_ACCEPTED' : 'MATCH_REJECTED',
      title: status === 'ACCEPTED' ? '匹配成功' : '匹配被拒绝',
      content: status === 'ACCEPTED' 
        ? `${req.user.nickname} 接受了您的匹配请求`
        : `${req.user.nickname} 拒绝了您的匹配请求`,
      metadata: {
        matchId: match.id,
        chatRoomId: chatRoom?.id,
        message
      }
    }
  });

  // 记录用户操作日志
  logger.logUserAction(req.user.id, `MATCH_${status}`, {
    matchId,
    requesterId: match.requesterId,
    requesterNickname: match.requester.nickname,
    hasMessage: !!message,
    chatRoomId: chatRoom?.id,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.json({
    success: true,
    message: `匹配${status === 'ACCEPTED' ? '接受' : '拒绝'}成功`,
    data: { 
      match: updatedMatch,
      chatRoom 
    }
  });
});

/**
 * @swagger
 * /api/v1/matches/{matchId}:
 *   delete:
 *     summary: 删除匹配记录
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: string
 *         description: 匹配ID
 *     responses:
 *       200:
 *         description: 匹配删除成功
 *       404:
 *         description: 匹配不存在
 *       403:
 *         description: 无权限操作
 */
export const deleteMatch = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ValidationError('用户信息缺失');
  }

  const { matchId } = req.params;

  // 查找匹配记录
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: {
      id: true,
      requesterId: true,
      targetId: true,
      status: true,
    }
  });

  if (!match) {
    throw new NotFoundError('匹配记录不存在');
  }

  // 检查权限（只有参与者可以删除）
  if (match.requesterId !== req.user.id && match.targetId !== req.user.id) {
    throw new ValidationError('无权限操作此匹配');
  }

  // 删除匹配记录
  await prisma.match.delete({
    where: { id: matchId }
  });

  // 记录用户操作日志
  logger.logUserAction(req.user.id, 'MATCH_DELETE', {
    matchId,
    matchStatus: match.status,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.json({
    success: true,
    message: '匹配记录删除成功'
  });
});

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

export default {
  findNearbyUsers,
  createMatch,
  getMatches,
  updateMatch,
  deleteMatch,
};