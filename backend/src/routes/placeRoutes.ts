import { Router } from 'express';
import {
  getPlaces,
  getPlaceById,
  createPlace,
  updatePlace,
  getCategories,
  visitPlace,
} from '@/controllers/placeController';
import { authMiddleware } from '@/middleware/authMiddleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Places
 *   description: 场所管理相关接口
 */

// 公开路由（不需要认证）
router.get('/', getPlaces);
router.get('/categories', getCategories);
router.get('/:id', getPlaceById);

// 需要认证的路由
router.use(authMiddleware);
router.post('/', createPlace);
router.put('/:id', updatePlace);
router.post('/:id/visit', visitPlace);

export default router;