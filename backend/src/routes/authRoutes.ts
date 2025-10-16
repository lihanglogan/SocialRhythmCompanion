import { Router } from 'express';
import {
  register,
  login,
  logout,
  refreshToken,
  requestPasswordReset,
  confirmPasswordReset,
  changePassword,
  getCurrentUser,
} from '@/controllers/authController';
import { authMiddleware, refreshTokenMiddleware } from '@/middleware/authMiddleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: 用户认证相关接口
 */

// 公开路由（不需要认证）
router.post('/register', register);
router.post('/login', login);
router.post('/reset-password', requestPasswordReset);
router.post('/confirm-reset-password', confirmPasswordReset);

// 需要刷新令牌的路由
router.post('/refresh', refreshTokenMiddleware, refreshToken);

// 需要访问令牌的路由
router.use(authMiddleware);
router.post('/logout', logout);
router.post('/change-password', changePassword);
router.get('/me', getCurrentUser);

export default router;