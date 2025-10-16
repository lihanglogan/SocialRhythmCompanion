import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '@/utils/logger';
import { createCache } from '@/utils/redis';
import prisma from '@/utils/database';

// 扩展 Request 类型以包含用户信息
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

// JWT 载荷接口
interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

// 认证中间件
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 获取 token
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;

    if (!token) {
      res.status(401).json({
        success: false,
        message: '访问令牌缺失',
        code: 'TOKEN_MISSING'
      });
      return;
    }

    // 验证 JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      logger.error('JWT_SECRET 环境变量未设置');
      res.status(500).json({
        success: false,
        message: '服务器配置错误',
        code: 'SERVER_CONFIG_ERROR'
      });
      return;
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    } catch (jwtError) {
      if (jwtError instanceof jwt.TokenExpiredError) {
        res.status(401).json({
          success: false,
          message: '访问令牌已过期',
          code: 'TOKEN_EXPIRED'
        });
        return;
      }
      
      if (jwtError instanceof jwt.JsonWebTokenError) {
        res.status(401).json({
          success: false,
          message: '访问令牌无效',
          code: 'TOKEN_INVALID'
        });
        return;
      }

      throw jwtError;
    }

    // 检查 token 是否在黑名单中
    const cache = createCache();
    const isBlacklisted = await cache.exists(`blacklist:${token}`);
    if (isBlacklisted) {
      res.status(401).json({
        success: false,
        message: '访问令牌已失效',
        code: 'TOKEN_BLACKLISTED'
      });
      return;
    }

    // 验证用户是否存在且状态正常
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        status: true,
        role: true,
        lastActiveAt: true,
      }
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: '用户不存在',
        code: 'USER_NOT_FOUND'
      });
      return;
    }

    if (user.status !== 'ACTIVE') {
      res.status(401).json({
        success: false,
        message: '用户账户已被禁用',
        code: 'USER_DISABLED'
      });
      return;
    }

    // 更新用户最后活跃时间
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() }
    });

    // 将用户信息添加到请求对象
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    // 记录用户访问日志
    logger.logUserAction(user.id, 'API_ACCESS', {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    next();
  } catch (error) {
    logger.error('认证中间件错误:', error);
    res.status(500).json({
      success: false,
      message: '认证过程中发生错误',
      code: 'AUTH_ERROR'
    });
  }
};

// 可选认证中间件（用户可以是匿名的）
export const optionalAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;

    if (!token) {
      // 没有 token，继续处理但不设置用户信息
      next();
      return;
    }

    // 有 token，尝试验证
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      next();
      return;
    }

    try {
      const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
      
      // 检查用户是否存在
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          status: true,
          role: true,
        }
      });

      if (user && user.status === 'ACTIVE') {
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role
        };
      }
    } catch (jwtError) {
      // JWT 验证失败，继续处理但不设置用户信息
      logger.debug('可选认证中间件 JWT 验证失败:', jwtError);
    }

    next();
  } catch (error) {
    logger.error('可选认证中间件错误:', error);
    next(); // 发生错误时继续处理
  }
};

// 角色权限检查中间件
export const requireRole = (roles: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: '需要登录',
        code: 'LOGIN_REQUIRED'
      });
      return;
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: '权限不足',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
      return;
    }

    next();
  };
};

// 管理员权限检查中间件
export const requireAdmin = requireRole('ADMIN');

// 用户自身或管理员权限检查中间件
export const requireSelfOrAdmin = (userIdParam = 'userId') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: '需要登录',
        code: 'LOGIN_REQUIRED'
      });
      return;
    }

    const targetUserId = req.params[userIdParam] || req.body.userId;
    const isAdmin = req.user.role === 'ADMIN';
    const isSelf = req.user.id === targetUserId;

    if (!isAdmin && !isSelf) {
      res.status(403).json({
        success: false,
        message: '只能访问自己的资源或需要管理员权限',
        code: 'ACCESS_DENIED'
      });
      return;
    }

    next();
  };
};

// API 密钥认证中间件（用于服务间调用）
export const apiKeyAuthMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const apiKey = req.headers['x-api-key'] as string;
  const validApiKey = process.env.API_KEY;

  if (!validApiKey) {
    res.status(500).json({
      success: false,
      message: 'API 密钥未配置',
      code: 'API_KEY_NOT_CONFIGURED'
    });
    return;
  }

  if (!apiKey || apiKey !== validApiKey) {
    res.status(401).json({
      success: false,
      message: 'API 密钥无效',
      code: 'INVALID_API_KEY'
    });
    return;
  }

  next();
};

// 刷新令牌中间件
export const refreshTokenMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const refreshToken = req.body.refreshToken || req.cookies.refreshToken;

    if (!refreshToken) {
      res.status(401).json({
        success: false,
        message: '刷新令牌缺失',
        code: 'REFRESH_TOKEN_MISSING'
      });
      return;
    }

    // 验证刷新令牌
    const jwtSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    if (!jwtSecret) {
      res.status(500).json({
        success: false,
        message: '服务器配置错误',
        code: 'SERVER_CONFIG_ERROR'
      });
      return;
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(refreshToken, jwtSecret) as JwtPayload;
    } catch (jwtError) {
      res.status(401).json({
        success: false,
        message: '刷新令牌无效或已过期',
        code: 'REFRESH_TOKEN_INVALID'
      });
      return;
    }

    // 检查用户是否存在
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        status: true,
        role: true,
      }
    });

    if (!user || user.status !== 'ACTIVE') {
      res.status(401).json({
        success: false,
        message: '用户不存在或已被禁用',
        code: 'USER_INVALID'
      });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    logger.error('刷新令牌中间件错误:', error);
    res.status(500).json({
      success: false,
      message: '刷新令牌验证过程中发生错误',
      code: 'REFRESH_TOKEN_ERROR'
    });
  }
};

// 设备认证中间件（用于移动端）
export const deviceAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const deviceId = req.headers['x-device-id'] as string;
    const deviceToken = req.headers['x-device-token'] as string;

    if (!deviceId || !deviceToken) {
      res.status(401).json({
        success: false,
        message: '设备认证信息缺失',
        code: 'DEVICE_AUTH_MISSING'
      });
      return;
    }

    // 验证设备令牌
    const cache = createCache();
    const storedToken = await cache.get(`device:${deviceId}`);

    if (!storedToken || storedToken !== deviceToken) {
      res.status(401).json({
        success: false,
        message: '设备认证失败',
        code: 'DEVICE_AUTH_FAILED'
      });
      return;
    }

    // 续期设备令牌
    await cache.expire(`device:${deviceId}`, 30 * 24 * 60 * 60); // 30天

    next();
  } catch (error) {
    logger.error('设备认证中间件错误:', error);
    res.status(500).json({
      success: false,
      message: '设备认证过程中发生错误',
      code: 'DEVICE_AUTH_ERROR'
    });
  }
};

export default {
  authMiddleware,
  optionalAuthMiddleware,
  requireRole,
  requireAdmin,
  requireSelfOrAdmin,
  apiKeyAuthMiddleware,
  refreshTokenMiddleware,
  deviceAuthMiddleware,
};