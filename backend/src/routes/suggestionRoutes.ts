import { Router } from 'express';
import authenticateToken from '@/middleware/authMiddleware';
import suggestionController from '@/controllers/suggestionController';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Suggestions
 *   description: 智能建议管理API
 */

// 获取智能建议列表
router.get('/', authenticateToken, suggestionController.getSuggestions);

// 获取趋势预测数据
router.get('/trends', suggestionController.getTrends);

// 创建自定义建议
router.post('/', authenticateToken, suggestionController.createSuggestion);

// 提交建议反馈
router.post('/feedback', authenticateToken, suggestionController.submitFeedback);

export default router;