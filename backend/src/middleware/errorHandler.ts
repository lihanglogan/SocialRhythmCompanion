import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';
import { Prisma } from '@prisma/client';

// 错误响应接口
interface ErrorResponse {
  success: false;
  message: string;
  code: string;
  details?: any;
  stack?: string;
}

// 自定义错误类
export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public isOperational: boolean;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// 业务逻辑错误
export class BusinessError extends AppError {
  constructor(message: string, code: string) {
    super(message, 400, code);
  }
}

// 验证错误
export class ValidationError extends AppError {
  public details: any;

  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

// 权限错误
export class AuthorizationError extends AppError {
  constructor(message: string = '权限不足') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

// 认证错误
export class AuthenticationError extends AppError {
  constructor(message: string = '认证失败') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

// 资源未找到错误
export class NotFoundError extends AppError {
  constructor(message: string = '资源未找到') {
    super(message, 404, 'NOT_FOUND');
  }
}

// 冲突错误
export class ConflictError extends AppError {
  constructor(message: string = '资源冲突') {
    super(message, 409, 'CONFLICT');
  }
}

// 速率限制错误
export class RateLimitError extends AppError {
  constructor(message: string = '请求过于频繁') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}

// Prisma 错误处理
const handlePrismaError = (error: Prisma.PrismaClientKnownRequestError): AppError => {
  switch (error.code) {
    case 'P2002':
      // 唯一约束违反
      const field = error.meta?.target as string[];
      const fieldName = field ? field[0] : '字段';
      return new ConflictError(`${fieldName} 已存在`);

    case 'P2025':
      // 记录未找到
      return new NotFoundError('请求的资源不存在');

    case 'P2003':
      // 外键约束违反
      return new BusinessError('关联资源不存在', 'FOREIGN_KEY_CONSTRAINT');

    case 'P2014':
      // 关系违反
      return new BusinessError('操作违反了数据关系约束', 'RELATION_VIOLATION');

    case 'P2000':
      // 值过长
      return new ValidationError('输入值超过最大长度限制');

    case 'P2001':
      // 记录不存在
      return new NotFoundError('操作的记录不存在');

    case 'P2004':
      // 约束失败
      return new BusinessError('操作违反了数据库约束', 'CONSTRAINT_FAILED');

    case 'P2015':
      // 相关记录未找到
      return new NotFoundError('相关记录未找到');

    case 'P2016':
      // 查询解释错误
      return new BusinessError('查询参数错误', 'QUERY_INTERPRETATION_ERROR');

    case 'P2017':
      // 关系未连接
      return new BusinessError('数据关系未正确建立', 'RELATION_NOT_CONNECTED');

    case 'P2018':
      // 必需的连接记录未找到
      return new NotFoundError('必需的关联记录未找到');

    case 'P2019':
      // 输入错误
      return new ValidationError('输入数据格式错误');

    case 'P2020':
      // 值超出范围
      return new ValidationError('输入值超出允许范围');

    case 'P2021':
      // 表不存在
      return new AppError('数据库表不存在', 500, 'TABLE_NOT_EXISTS');

    case 'P2022':
      // 列不存在
      return new AppError('数据库列不存在', 500, 'COLUMN_NOT_EXISTS');

    default:
      logger.error('未处理的 Prisma 错误:', error);
      return new AppError('数据库操作失败', 500, 'DATABASE_ERROR');
  }
};

// JSON Web Token 错误处理
const handleJWTError = (error: any): AppError => {
  if (error.name === 'JsonWebTokenError') {
    return new AuthenticationError('无效的访问令牌');
  }
  if (error.name === 'TokenExpiredError') {
    return new AuthenticationError('访问令牌已过期');
  }
  if (error.name === 'NotBeforeError') {
    return new AuthenticationError('访问令牌尚未生效');
  }
  return new AppError('令牌验证失败', 500, 'TOKEN_ERROR');
};

// 验证错误处理
const handleValidationError = (error: any): ValidationError => {
  const details: any = {};
  
  if (error.errors) {
    // 处理 express-validator 错误
    error.errors.forEach((err: any) => {
      details[err.param] = err.msg;
    });
  } else if (error.details) {
    // 处理 Joi 验证错误
    error.details.forEach((detail: any) => {
      const key = detail.path.join('.');
      details[key] = detail.message;
    });
  }

  return new ValidationError('输入数据验证失败', details);
};

// Multer 错误处理
const handleMulterError = (error: any): AppError => {
  switch (error.code) {
    case 'LIMIT_FILE_SIZE':
      return new ValidationError('文件大小超过限制');
    case 'LIMIT_FILE_COUNT':
      return new ValidationError('文件数量超过限制');
    case 'LIMIT_FIELD_KEY':
      return new ValidationError('字段名过长');
    case 'LIMIT_FIELD_VALUE':
      return new ValidationError('字段值过长');
    case 'LIMIT_FIELD_COUNT':
      return new ValidationError('字段数量过多');
    case 'LIMIT_UNEXPECTED_FILE':
      return new ValidationError('意外的文件字段');
    case 'MISSING_FIELD_NAME':
      return new ValidationError('缺少字段名');
    default:
      return new AppError('文件上传失败', 400, 'FILE_UPLOAD_ERROR');
  }
};

// 开发环境错误响应
const sendErrorDev = (err: AppError, res: Response): void => {
  const errorResponse: ErrorResponse = {
    success: false,
    message: err.message,
    code: err.code,
    stack: err.stack,
  };

  if (err instanceof ValidationError && err.details) {
    errorResponse.details = err.details;
  }

  res.status(err.statusCode).json(errorResponse);
};

// 生产环境错误响应
const sendErrorProd = (err: AppError, res: Response): void => {
  // 只发送操作性错误的详细信息
  if (err.isOperational) {
    const errorResponse: ErrorResponse = {
      success: false,
      message: err.message,
      code: err.code,
    };

    if (err instanceof ValidationError && err.details) {
      errorResponse.details = err.details;
    }

    res.status(err.statusCode).json(errorResponse);
  } else {
    // 编程错误，不泄露错误详情
    logger.error('编程错误:', err);
    
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      code: 'INTERNAL_SERVER_ERROR',
    });
  }
};

// 主错误处理中间件
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = err;

  // 记录错误日志
  logger.logError(err, 'Global Error Handler', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id,
  });

  // 处理不同类型的错误
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    error = handlePrismaError(err);
  } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    error = new AppError('数据库操作失败', 500, 'DATABASE_UNKNOWN_ERROR');
  } else if (err instanceof Prisma.PrismaClientRustPanicError) {
    error = new AppError('数据库引擎错误', 500, 'DATABASE_ENGINE_ERROR');
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    error = new AppError('数据库连接失败', 500, 'DATABASE_CONNECTION_ERROR');
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    error = new ValidationError('数据库查询参数错误');
  } else if (err.name && err.name.includes('JsonWebToken')) {
    error = handleJWTError(err);
  } else if (err.name === 'ValidationError' || err.errors || err.details) {
    error = handleValidationError(err);
  } else if (err.name === 'MulterError') {
    error = handleMulterError(err);
  } else if (err.name === 'CastError') {
    error = new ValidationError('无效的数据格式');
  } else if (err.code === 'ENOENT') {
    error = new NotFoundError('文件不存在');
  } else if (err.code === 'EACCES') {
    error = new AppError('文件访问权限不足', 500, 'FILE_ACCESS_DENIED');
  } else if (err.type === 'entity.parse.failed') {
    error = new ValidationError('请求体解析失败');
  } else if (err.type === 'entity.too.large') {
    error = new ValidationError('请求体过大');
  } else if (!(err instanceof AppError)) {
    // 未知错误，转换为通用错误
    error = new AppError(
      process.env.NODE_ENV === 'development' ? err.message : '服务器内部错误',
      500,
      'INTERNAL_SERVER_ERROR'
    );
    error.isOperational = false;
  }

  // 发送错误响应
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

// 404 错误处理中间件
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = new NotFoundError(`路由 ${req.originalUrl} 不存在`);
  next(error);
};

// 异步错误捕获包装器
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 全局未捕获异常处理
export const handleUncaughtException = (): void => {
  process.on('uncaughtException', (err: Error) => {
    logger.error('未捕获的异常:', err);
    console.error('未捕获的异常:', err);
    
    // 优雅关闭
    process.exit(1);
  });
};

// 全局未处理的 Promise 拒绝处理
export const handleUnhandledRejection = (): void => {
  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    logger.error('未处理的 Promise 拒绝:', reason);
    console.error('未处理的 Promise 拒绝 at:', promise, 'reason:', reason);
    
    // 优雅关闭
    process.exit(1);
  });
};

// 错误统计中间件
export const errorStatsMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // 记录错误统计
  const errorType = err instanceof AppError ? err.code : 'UNKNOWN_ERROR';
  const statusCode = err.statusCode || 500;
  
  // 这里可以集成错误监控服务，如 Sentry
  logger.logSystemEvent('ERROR_OCCURRED', {
    errorType,
    statusCode,
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    userId: req.user?.id,
  });

  next(err);
};

// 导出错误类和中间件
export {
  AppError,
  BusinessError,
  ValidationError,
  AuthorizationError,
  AuthenticationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
};

export default {
  errorHandler,
  notFoundHandler,
  catchAsync,
  handleUncaughtException,
  handleUnhandledRejection,
  errorStatsMiddleware,
  AppError,
  BusinessError,
  ValidationError,
  AuthorizationError,
  AuthenticationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
};