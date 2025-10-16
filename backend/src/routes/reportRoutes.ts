import { Router } from 'express';
import {
  createReport,
  getReports,
  getReportById,
  updateReport,
  deleteReport,
  getReportStatistics,
} from '@/controllers/reportController';
import { authMiddleware } from '@/middleware/authMiddleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: 上报和数据管理相关接口
 */

// 公开路由（不需要认证）
router.get('/', getReports);
router.get('/statistics', getReportStatistics);
router.get('/:id', getReportById);

// 需要认证的路由
router.use(authMiddleware);
router.post('/', createReport);
router.put('/:id', updateReport);
router.delete('/:id', deleteReport);

export default router;