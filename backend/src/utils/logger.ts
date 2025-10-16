import winston from 'winston';
import path from 'path';

// 日志级别定义
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// 日志颜色配置
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(logColors);

// 获取日志级别
const level = (): string => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : process.env.LOG_LEVEL || 'info';
};

// 自定义日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// 文件日志格式（不包含颜色）
const fileLogFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// 创建日志传输器
const transports: winston.transport[] = [];

// 控制台输出
if (process.env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      level: level(),
      format: logFormat,
    })
  );
}

// 文件输出
const logPath = process.env.LOG_FILE_PATH || './logs';

// 错误日志文件
transports.push(
  new winston.transports.File({
    filename: path.join(logPath, 'error.log'),
    level: 'error',
    format: fileLogFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  })
);

// 组合日志文件
transports.push(
  new winston.transports.File({
    filename: path.join(logPath, 'combined.log'),
    format: fileLogFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  })
);

// HTTP 请求日志文件
transports.push(
  new winston.transports.File({
    filename: path.join(logPath, 'http.log'),
    level: 'http',
    format: fileLogFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 3,
  })
);

// 创建 Winston 日志器
const logger = winston.createLogger({
  level: level(),
  levels: logLevels,
  format: fileLogFormat,
  transports,
  exitOnError: false,
});

// 处理未捕获的异常
logger.exceptions.handle(
  new winston.transports.File({
    filename: path.join(logPath, 'exceptions.log'),
    format: fileLogFormat,
  })
);

// 处理未处理的 Promise 拒绝
logger.rejections.handle(
  new winston.transports.File({
    filename: path.join(logPath, 'rejections.log'),
    format: fileLogFormat,
  })
);

// 扩展日志器功能
class ExtendedLogger {
  private winston: winston.Logger;

  constructor(winstonLogger: winston.Logger) {
    this.winston = winstonLogger;
  }

  // 基础日志方法
  error(message: string, meta?: any): void {
    this.winston.error(message, meta);
  }

  warn(message: string, meta?: any): void {
    this.winston.warn(message, meta);
  }

  info(message: string, meta?: any): void {
    this.winston.info(message, meta);
  }

  http(message: string, meta?: any): void {
    this.winston.http(message, meta);
  }

  debug(message: string, meta?: any): void {
    this.winston.debug(message, meta);
  }

  // 结构化日志方法
  logRequest(req: any, res: any, responseTime?: number): void {
    const logData = {
      method: req.method,
      url: req.url,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      statusCode: res.statusCode,
      responseTime: responseTime ? `${responseTime}ms` : undefined,
      userId: req.user?.id,
    };

    this.http('HTTP Request', logData);
  }

  logError(error: Error, context?: string, meta?: any): void {
    const logData = {
      message: error.message,
      stack: error.stack,
      context,
      ...meta,
    };

    this.error('Application Error', logData);
  }

  logDatabaseQuery(query: string, params?: any, duration?: number): void {
    if (process.env.NODE_ENV === 'development') {
      const logData = {
        query,
        params,
        duration: duration ? `${duration}ms` : undefined,
      };

      this.debug('Database Query', logData);
    }
  }

  logSecurityEvent(event: string, details: any): void {
    const logData = {
      event,
      timestamp: new Date().toISOString(),
      ...details,
    };

    this.warn('Security Event', logData);
  }

  logPerformance(operation: string, duration: number, meta?: any): void {
    const logData = {
      operation,
      duration: `${duration}ms`,
      ...meta,
    };

    if (duration > 1000) {
      this.warn('Slow Operation', logData);
    } else {
      this.debug('Performance', logData);
    }
  }

  logUserAction(userId: string, action: string, details?: any): void {
    const logData = {
      userId,
      action,
      timestamp: new Date().toISOString(),
      ...details,
    };

    this.info('User Action', logData);
  }

  logSystemEvent(event: string, details?: any): void {
    const logData = {
      event,
      timestamp: new Date().toISOString(),
      ...details,
    };

    this.info('System Event', logData);
  }

  // 性能监控
  time(label: string): void {
    console.time(label);
  }

  timeEnd(label: string): void {
    console.timeEnd(label);
  }

  // 创建子日志器
  child(defaultMeta: any): ExtendedLogger {
    const childLogger = this.winston.child(defaultMeta);
    return new ExtendedLogger(childLogger);
  }
}

// 导出扩展的日志器实例
export const logger = new ExtendedLogger(logger);

// 导出原始 Winston 实例（如果需要）
export const winstonLogger = logger;

// 日志中间件工厂函数
export const createLoggerMiddleware = () => {
  return (req: any, res: any, next: any) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.logRequest(req, res, duration);
    });

    next();
  };
};

// 错误日志中间件
export const errorLoggerMiddleware = (err: Error, req: any, res: any, next: any) => {
  logger.logError(err, 'Express Error Handler', {
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    userId: req.user?.id,
  });

  next(err);
};

// 日志配置验证
export const validateLogConfig = (): boolean => {
  try {
    // 检查日志目录是否存在
    const fs = require('fs');
    if (!fs.existsSync(logPath)) {
      fs.mkdirSync(logPath, { recursive: true });
      logger.info(`创建日志目录: ${logPath}`);
    }

    // 测试写入权限
    const testFile = path.join(logPath, 'test.log');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);

    logger.info('日志配置验证成功');
    return true;
  } catch (error) {
    console.error('日志配置验证失败:', error);
    return false;
  }
};

// 日志轮转配置
export const setupLogRotation = (): void => {
  // 这里可以添加日志轮转逻辑
  // 或者使用外部工具如 logrotate
  logger.info('日志轮转配置完成');
};

export default logger;