import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { setupSwagger } from './swagger';
import dotenv from 'dotenv';

import { errorHandler } from '@/middleware/errorHandler';
import { notFoundHandler } from '@/middleware/notFoundHandler';
import { authMiddleware } from '@/middleware/authMiddleware';
import { logger } from '@/utils/logger';
import { connectDatabase } from '@/utils/database';
import { connectRedis } from '@/utils/redis';

// 路由导入
import authRoutes from '@/routes/authRoutes';
import userRoutes from '@/routes/userRoutes';
import placeRoutes from '@/routes/placeRoutes';
import reportRoutes from '@/routes/reportRoutes';
import suggestionRoutes from '@/routes/suggestionRoutes';
import matchRoutes from '@/routes/matchRoutes';
import chatRoutes from '@/routes/chatRoutes';

// 加载环境变量
dotenv.config();

const app = express();
const server = createServer(app);

// Socket.IO 配置
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// 基础中间件
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

app.use(cors({
  origin: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 日志中间件
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    stream: {
      write: (message: string) => logger.info(message.trim())
    }
  }));
}

// 速率限制
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15分钟
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // 限制每个IP 100个请求
  message: {
    error: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api', limiter);

// Swagger 配置
if (process.env.ENABLE_SWAGGER === 'true') {
  const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Social Rhythm Companion API',
        version: '1.0.0',
        description: 'Social Rhythm Companion 后端 API 文档',
        contact: {
          name: 'Social Rhythm Team',
          email: 'support@socialrhythm.com'
        }
      },
      servers: [
        {
          url: `http://localhost:${process.env.PORT || 3001}`,
          description: '开发服务器'
        }
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      }
    },
    apis: ['./src/routes/*.ts', './src/controllers/*.ts']
  };

  const specs = swaggerJsdoc(swaggerOptions);
  app.use(process.env.SWAGGER_PATH || '/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
}

// 健康检查端点
app.get(process.env.MONITORING_ENDPOINT || '/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API 路由
const apiVersion = process.env.API_VERSION || 'v1';
app.use(`/api/${apiVersion}/auth`, authRoutes);
app.use(`/api/${apiVersion}/users`, userRoutes);
app.use(`/api/${apiVersion}/places`, placeRoutes);
app.use(`/api/${apiVersion}/reports`, authMiddleware, reportRoutes);
app.use(`/api/${apiVersion}/suggestions`, authMiddleware, suggestionRoutes);
app.use(`/api/${apiVersion}/matches`, authMiddleware, matchRoutes);
app.use(`/api/${apiVersion}/chat`, authMiddleware, chatRoutes);

// 静态文件服务
if (process.env.UPLOAD_PATH) {
  app.use('/static', express.static(process.env.UPLOAD_PATH));
}

// Socket.IO 事件处理
io.on('connection', (socket) => {
  logger.info(`用户连接: ${socket.id}`);

  // 加入房间
  socket.on('join-room', (roomId: string) => {
    socket.join(roomId);
    logger.info(`用户 ${socket.id} 加入房间 ${roomId}`);
  });

  // 离开房间
  socket.on('leave-room', (roomId: string) => {
    socket.leave(roomId);
    logger.info(`用户 ${socket.id} 离开房间 ${roomId}`);
  });

  // 发送消息
  socket.on('send-message', (data: { roomId: string; message: any }) => {
    socket.to(data.roomId).emit('new-message', data.message);
  });

  // 位置分享
  socket.on('share-location', (data: { roomId: string; location: any }) => {
    socket.to(data.roomId).emit('location-update', data.location);
  });

  // 用户断开连接
  socket.on('disconnect', () => {
    logger.info(`用户断开连接: ${socket.id}`);
  });
});

// 错误处理中间件
app.use(notFoundHandler);
app.use(errorHandler);

// 数据库连接和服务器启动
async function startServer() {
  try {
    // 连接数据库
    await connectDatabase();
    logger.info('数据库连接成功');

    // 连接 Redis
    await connectRedis();
    logger.info('Redis 连接成功');

    // 启动服务器
    const port = process.env.PORT || 3001;
    server.listen(port, () => {
      logger.info(`服务器运行在端口 ${port}`);
      logger.info(`API 文档地址: http://localhost:${port}${process.env.SWAGGER_PATH || '/api-docs'}`);
      logger.info(`健康检查地址: http://localhost:${port}${process.env.MONITORING_ENDPOINT || '/health'}`);
    });

  } catch (error) {
    logger.error('服务器启动失败:', error);
    process.exit(1);
  }
}

// 优雅关闭
process.on('SIGTERM', () => {
  logger.info('收到 SIGTERM 信号，开始优雅关闭...');
  server.close(() => {
    logger.info('HTTP 服务器已关闭');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('收到 SIGINT 信号，开始优雅关闭...');
  server.close(() => {
    logger.info('HTTP 服务器已关闭');
    process.exit(0);
  });
});

// 未捕获的异常处理
process.on('uncaughtException', (error) => {
  logger.error('未捕获的异常:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('未处理的 Promise 拒绝:', reason);
  process.exit(1);
});

// 导出应用实例用于测试
export { app, io };

// 如果直接运行此文件，启动服务器
if (require.main === module) {
  startServer();
}