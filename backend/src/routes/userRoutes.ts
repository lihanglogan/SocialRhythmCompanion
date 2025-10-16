import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  getPreferences,
  updatePreferences,
  updateLocation,
  getStatistics,
  getHistory,
} from '@/controllers/userController';
import { authMiddleware } from '@/middleware/authMiddleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: 用户管理相关接口
 */

// 所有用户路由都需要认证
router.use(authMiddleware);

// 用户资料管理
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// 用户偏好设置
router.get('/preferences', getPreferences);
router.put('/preferences', updatePreferences);

// 用户位置更新
router.put('/location', updateLocation);

// 用户统计数据
router.get('/statistics', getStatistics);

// 用户历史记录
router.get('/history', getHistory);

export default router;