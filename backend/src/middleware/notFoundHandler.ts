import { Request, Response, NextFunction } from 'express';
import { NotFoundError } from './errorHandler';

// 404 错误处理中间件
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = new NotFoundError(`路由 ${req.originalUrl} 不存在`);
  next(error);
};

export default notFoundHandler;