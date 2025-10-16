import { Router } from 'express';
import authenticateToken from '@/middleware/authMiddleware';
import matchController from '@/controllers/matchController';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Matches
 *   description: 匹配和社交API
 */

// 查找附近用户
router.get('/nearby', authenticateToken, matchController.findNearbyUsers);

// 获取匹配列表
router.get('/', authenticateToken, matchController.getMatches);

// 发起匹配请求
router.post('/', authenticateToken, matchController.createMatch);

// 更新匹配状态
router.put('/:matchId', authenticateToken, matchController.updateMatch);

// 删除匹配记录
router.delete('/:matchId', authenticateToken, matchController.deleteMatch);

export default router;