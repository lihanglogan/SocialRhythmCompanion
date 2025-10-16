import { Request, Response } from 'express';
import { z } from 'zod';
import { catchAsync } from '@/middleware/errorHandler';
import { ValidationError, NotFoundError, ForbiddenError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import { createCache } from '@/utils/redis';
import prisma from '@/utils/database';

// 验证模式
const sendMessageSchema = z.object({
  content: z.string().min(1, '消息内容不能为空').max(2000, '消息内容不能超过2000个字符'),
  type: z.enum(['TEXT', 'IMAGE', 'LOCATION', 'SYSTEM']).default('TEXT'),
  metadata: z.record(z.any()).optional(),
});

const createChatRoomSchema = z.object({
  type: z.enum(['PRIVATE', 'GROUP']).default('PRIVATE'),
  name: z.string().min(1, '房间名称不能为空').max(100, '房间名称不能超过100个字符').optional(),
  participantIds: z.array(z.string()).min(1, '至少需要一个参与者'),
});

/**
 * @swagger
 * /api/v1/chat/rooms:
 *   get:
 *     summary: 获取聊天房间列表
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: 聊天房间列表
 *       401:
 *         description: 未授权
 */
export const getChatRooms = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ValidationError('用户信息缺失');
  }

  const { page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const [chatRooms, total] = await Promise.all([
    prisma.chatRoom.findMany({
      where: {
        participants: {
          some: {
            userId: req.user.id,
            isActive: true
          }
        }
      },
      include: {
        participants: {
          where: { isActive: true },
          include: {
            user: {
              select: {
                id: true,
                nickname: true,
                avatar: true,
                lastActiveAt: true,
              }
            }
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                nickname: true,
                avatar: true,
              }
            }
          }
        },
        _count: {
          select: {
            messages: {
              where: {
                readBy: {
                  none: {
                    userId: req.user.id
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      skip,
      take: Number(limit)
    }),
    prisma.chatRoom.count({
      where: {
        participants: {
          some: {
            userId: req.user.id,
            isActive: true
          }
        }
      }
    })
  ]);

  // 格式化数据
  const formattedRooms = chatRooms.map(room => ({
    ...room,
    lastMessage: room.messages[0] || null,
    unreadCount: room._count.messages,
    otherParticipants: room.participants.filter(p => p.userId !== req.user.id),
    messages: undefined,
    _count: undefined
  }));

  res.json({
    success: true,
    data: {
      chatRooms: formattedRooms,
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
 * /api/v1/chat/rooms:
 *   post:
 *     summary: 创建聊天房间
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - participantIds
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [PRIVATE, GROUP]
 *                 default: PRIVATE
 *               name:
 *                 type: string
 *                 maxLength: 100
 *               participantIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 minItems: 1
 *     responses:
 *       201:
 *         description: 聊天房间创建成功
 *       400:
 *         description: 验证错误
 */
export const createChatRoom = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ValidationError('用户信息缺失');
  }

  const { type, name, participantIds } = createChatRoomSchema.parse(req.body);

  // 验证参与者
  const participants = await prisma.user.findMany({
    where: {
      id: { in: participantIds },
      isActive: true
    },
    select: { id: true, nickname: true }
  });

  if (participants.length !== participantIds.length) {
    throw new ValidationError('部分参与者不存在或已停用');
  }

  // 对于私聊，检查是否已存在房间
  if (type === 'PRIVATE' && participantIds.length === 1) {
    const existingRoom = await prisma.chatRoom.findFirst({
      where: {
        type: 'PRIVATE',
        participants: {
          every: {
            userId: { in: [req.user.id, participantIds[0]] }
          }
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

    if (existingRoom) {
      return res.json({
        success: true,
        message: '聊天房间已存在',
        data: { chatRoom: existingRoom }
      });
    }
  }

  // 创建聊天房间
  const allParticipantIds = [...new Set([req.user.id, ...participantIds])];
  const roomName = name || (type === 'PRIVATE' 
    ? `${req.user.nickname} & ${participants[0]?.nickname || '未知用户'}`
    : `群聊 - ${participants.map(p => p.nickname).join(', ')}`);

  const chatRoom = await prisma.chatRoom.create({
    data: {
      type,
      name: roomName,
      createdBy: req.user.id,
      participants: {
        create: allParticipantIds.map(userId => ({
          userId,
          role: userId === req.user.id ? 'ADMIN' : 'MEMBER'
        }))
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

  // 记录用户操作日志
  logger.logUserAction(req.user.id, 'CHAT_ROOM_CREATE', {
    chatRoomId: chatRoom.id,
    type,
    participantCount: allParticipantIds.length,
    participantIds: allParticipantIds,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.status(201).json({
    success: true,
    message: '聊天房间创建成功',
    data: { chatRoom }
  });
});

/**
 * @swagger
 * /api/v1/chat/rooms/{roomId}/messages:
 *   get:
 *     summary: 获取聊天消息
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *         description: 聊天房间ID
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
 *           default: 50
 *         description: 每页数量
 *       - in: query
 *         name: before
 *         schema:
 *           type: string
 *         description: 获取此消息ID之前的消息
 *     responses:
 *       200:
 *         description: 聊天消息列表
 *       403:
 *         description: 无权限访问
 *       404:
 *         description: 聊天房间不存在
 */
export const getChatMessages = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ValidationError('用户信息缺失');
  }

  const { roomId } = req.params;
  const { page = 1, limit = 50, before } = req.query;

  // 验证用户是否为房间参与者
  const participant = await prisma.chatParticipant.findFirst({
    where: {
      chatRoomId: roomId,
      userId: req.user.id,
      isActive: true
    }
  });

  if (!participant) {
    throw new ForbiddenError('无权限访问此聊天房间');
  }

  // 构建查询条件
  const whereCondition: any = {
    chatRoomId: roomId
  };

  if (before) {
    whereCondition.id = { lt: before };
  }

  const [messages, total] = await Promise.all([
    prisma.chatMessage.findMany({
      where: whereCondition,
      include: {
        sender: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          }
        },
        readBy: {
          where: { userId: req.user.id },
          select: { readAt: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: Number(limit)
    }),
    prisma.chatMessage.count({ where: whereCondition })
  ]);

  // 标记消息为已读
  const unreadMessageIds = messages
    .filter(msg => msg.senderId !== req.user.id && msg.readBy.length === 0)
    .map(msg => msg.id);

  if (unreadMessageIds.length > 0) {
    await prisma.messageRead.createMany({
      data: unreadMessageIds.map(messageId => ({
        messageId,
        userId: req.user.id,
        readAt: new Date()
      })),
      skipDuplicates: true
    });
  }

  // 格式化消息数据
  const formattedMessages = messages.map(msg => ({
    ...msg,
    isRead: msg.readBy.length > 0,
    readAt: msg.readBy[0]?.readAt || null,
    readBy: undefined
  })).reverse(); // 按时间正序返回

  res.json({
    success: true,
    data: {
      messages: formattedMessages,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        hasMore: messages.length === Number(limit)
      }
    }
  });
});

/**
 * @swagger
 * /api/v1/chat/rooms/{roomId}/messages:
 *   post:
 *     summary: 发送聊天消息
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *         description: 聊天房间ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 2000
 *               type:
 *                 type: string
 *                 enum: [TEXT, IMAGE, LOCATION, SYSTEM]
 *                 default: TEXT
 *               metadata:
 *                 type: object
 *     responses:
 *       201:
 *         description: 消息发送成功
 *       403:
 *         description: 无权限发送消息
 *       404:
 *         description: 聊天房间不存在
 */
export const sendMessage = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ValidationError('用户信息缺失');
  }

  const { roomId } = req.params;
  const { content, type, metadata } = sendMessageSchema.parse(req.body);

  // 验证用户是否为房间参与者
  const participant = await prisma.chatParticipant.findFirst({
    where: {
      chatRoomId: roomId,
      userId: req.user.id,
      isActive: true
    },
    include: {
      chatRoom: {
        select: {
          id: true,
          type: true,
          isActive: true
        }
      }
    }
  });

  if (!participant || !participant.chatRoom.isActive) {
    throw new ForbiddenError('无权限在此聊天房间发送消息');
  }

  // 创建消息
  const message = await prisma.chatMessage.create({
    data: {
      chatRoomId: roomId,
      senderId: req.user.id,
      content,
      type,
      metadata
    },
    include: {
      sender: {
        select: {
          id: true,
          nickname: true,
          avatar: true,
        }
      }
    }
  });

  // 更新聊天房间的最后活动时间
  await prisma.chatRoom.update({
    where: { id: roomId },
    data: { updatedAt: new Date() }
  });

  // 获取其他参与者（用于推送通知）
  const otherParticipants = await prisma.chatParticipant.findMany({
    where: {
      chatRoomId: roomId,
      userId: { not: req.user.id },
      isActive: true
    },
    include: {
      user: {
        select: {
          id: true,
          nickname: true,
          pushToken: true
        }
      }
    }
  });

  // 创建通知（异步处理）
  const notifications = otherParticipants.map(participant => ({
    userId: participant.userId,
    type: 'CHAT_MESSAGE' as const,
    title: `来自 ${req.user.nickname} 的消息`,
    content: type === 'TEXT' ? content : `发送了一${type === 'IMAGE' ? '张图片' : type === 'LOCATION' ? '个位置' : '条消息'}`,
    metadata: {
      chatRoomId: roomId,
      messageId: message.id,
      senderId: req.user.id
    }
  }));

  if (notifications.length > 0) {
    await prisma.notification.createMany({
      data: notifications
    });
  }

  // 记录用户操作日志
  logger.logUserAction(req.user.id, 'CHAT_MESSAGE_SEND', {
    chatRoomId: roomId,
    messageId: message.id,
    messageType: type,
    contentLength: content.length,
    recipientCount: otherParticipants.length,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.status(201).json({
    success: true,
    message: '消息发送成功',
    data: { message }
  });
});

/**
 * @swagger
 * /api/v1/chat/rooms/{roomId}:
 *   delete:
 *     summary: 离开聊天房间
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *         description: 聊天房间ID
 *     responses:
 *       200:
 *         description: 成功离开聊天房间
 *       403:
 *         description: 无权限操作
 *       404:
 *         description: 聊天房间不存在
 */
export const leaveChatRoom = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ValidationError('用户信息缺失');
  }

  const { roomId } = req.params;

  // 验证用户是否为房间参与者
  const participant = await prisma.chatParticipant.findFirst({
    where: {
      chatRoomId: roomId,
      userId: req.user.id,
      isActive: true
    },
    include: {
      chatRoom: {
        select: {
          id: true,
          type: true,
          createdBy: true
        }
      }
    }
  });

  if (!participant) {
    throw new ForbiddenError('您不是此聊天房间的参与者');
  }

  // 将参与者标记为非活跃
  await prisma.chatParticipant.update({
    where: {
      chatRoomId_userId: {
        chatRoomId: roomId,
        userId: req.user.id
      }
    },
    data: {
      isActive: false,
      leftAt: new Date()
    }
  });

  // 检查是否还有其他活跃参与者
  const activeParticipantsCount = await prisma.chatParticipant.count({
    where: {
      chatRoomId: roomId,
      isActive: true
    }
  });

  // 如果没有活跃参与者，将房间标记为非活跃
  if (activeParticipantsCount === 0) {
    await prisma.chatRoom.update({
      where: { id: roomId },
      data: { isActive: false }
    });
  }

  // 记录用户操作日志
  logger.logUserAction(req.user.id, 'CHAT_ROOM_LEAVE', {
    chatRoomId: roomId,
    chatRoomType: participant.chatRoom.type,
    remainingParticipants: activeParticipantsCount,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.json({
    success: true,
    message: '成功离开聊天房间'
  });
});

export default {
  getChatRooms,
  createChatRoom,
  getChatMessages,
  sendMessage,
  leaveChatRoom,
};