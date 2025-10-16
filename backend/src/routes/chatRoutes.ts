import { Router } from 'express';
import authenticateToken from '@/middleware/authMiddleware';
import chatController from '@/controllers/chatController';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: 聊天和消息API
 */

// 获取聊天房间列表
router.get('/rooms', authenticateToken, chatController.getChatRooms);

// 创建聊天房间
router.post('/rooms', authenticateToken, chatController.createChatRoom);

// 获取聊天消息
router.get('/rooms/:roomId/messages', authenticateToken, chatController.getChatMessages);

// 发送聊天消息
router.post('/rooms/:roomId/messages', authenticateToken, chatController.sendMessage);

// 离开聊天房间
router.delete('/rooms/:roomId', authenticateToken, chatController.leaveChatRoom);

export default router;