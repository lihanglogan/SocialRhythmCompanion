# Social Rhythm Companion 后端部署指南

## 项目概述

Social Rhythm Companion 后端是一个基于 Node.js + Express.js + TypeScript + PostgreSQL 的 RESTful API 服务，为前端应用提供完整的数据支持。

## 技术栈

- **运行时**: Node.js 18+
- **框架**: Express.js
- **语言**: TypeScript
- **数据库**: PostgreSQL 14+
- **ORM**: Prisma
- **缓存**: Redis
- **认证**: JWT
- **文档**: Swagger/OpenAPI
- **测试**: Jest
- **容器化**: Docker

## 环境要求

### 开发环境
- Node.js 18.0+
- npm 8.0+ 或 yarn 1.22+
- PostgreSQL 14+
- Redis 6.0+

### 生产环境
- Docker 20.10+
- Docker Compose 2.0+
- 至少 2GB RAM
- 至少 10GB 存储空间

## 快速开始

### 1. 克隆项目
```bash
git clone <repository-url>
cd SocialRhythmCompanion/backend
```

### 2. 安装依赖
```bash
npm install
```

### 3. 环境配置
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量
nano .env
```

### 4. 数据库设置
```bash
# 生成 Prisma 客户端
npx prisma generate

# 运行数据库迁移
npx prisma migrate dev

# 填充种子数据
npx prisma db seed
```

### 5. 启动开发服务器
```bash
npm run dev
```

服务器将在 http://localhost:3001 启动

## 环境变量配置

### 必需配置
```env
# 数据库连接
DATABASE_URL="postgresql://username:password@localhost:5432/social_rhythm_companion"

# JWT 密钥
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-here"

# Redis 连接
REDIS_URL="redis://localhost:6379"

# 服务器配置
PORT=3001
NODE_ENV=development
```

### 可选配置
```env
# CORS 设置
CORS_ORIGIN="http://localhost:3000"

# 日志级别
LOG_LEVEL="info"

# 上传文件配置
MAX_FILE_SIZE=10485760
UPLOAD_DIR="./uploads"

# 第三方服务 API 密钥
AMAP_API_KEY="your-amap-api-key"
WEATHER_API_KEY="your-weather-api-key"
```

## 数据库配置

### PostgreSQL 设置
```sql
-- 创建数据库
CREATE DATABASE social_rhythm_companion;

-- 创建用户
CREATE USER app_user WITH PASSWORD 'your_password';

-- 授权
GRANT ALL PRIVILEGES ON DATABASE social_rhythm_companion TO app_user;
```

### Prisma 迁移
```bash
# 创建新迁移
npx prisma migrate dev --name init

# 应用迁移到生产环境
npx prisma migrate deploy

# 重置数据库（开发环境）
npx prisma migrate reset
```

## Docker 部署

### 使用 Docker Compose（推荐）
```bash
# 构建并启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 单独使用 Docker
```bash
# 构建镜像
docker build -t social-rhythm-backend .

# 运行容器
docker run -d \
  --name social-rhythm-backend \
  -p 3001:3001 \
  --env-file .env \
  social-rhythm-backend
```

## API 文档

### Swagger 文档
启动服务器后，访问以下地址查看 API 文档：
- 开发环境: http://localhost:3001/api-docs
- 生产环境: https://your-domain.com/api-docs

### 主要 API 端点

#### 认证相关
```
POST /api/auth/register     # 用户注册
POST /api/auth/login        # 用户登录
POST /api/auth/refresh      # 刷新 Token
POST /api/auth/logout       # 用户登出
GET  /api/auth/me          # 获取当前用户信息
```

#### 用户管理
```
GET    /api/users/profile           # 获取用户资料
PUT    /api/users/profile           # 更新用户资料
GET    /api/users/preferences       # 获取用户偏好
PUT    /api/users/preferences       # 更新用户偏好
GET    /api/users/stats             # 获取用户统计
GET    /api/users/achievements      # 获取用户成就
```

#### 场所管理
```
GET    /api/places                  # 获取场所列表
GET    /api/places/:id              # 获取场所详情
GET    /api/places/categories       # 获取场所分类
GET    /api/places/nearby           # 获取附近场所
GET    /api/places/:id/stats        # 获取场所统计数据
POST   /api/places/:id/reviews      # 添加场所评价
```

#### 上报数据
```
POST   /api/reports                 # 提交用户上报
GET    /api/reports/history         # 获取上报历史
GET    /api/crowdness/:placeId      # 获取拥挤度数据
POST   /api/crowdness              # 更新拥挤度数据
```

#### 智能建议
```
GET    /api/suggestions/today       # 获取今日建议
GET    /api/suggestions/personal    # 获取个性化推荐
GET    /api/suggestions/trends      # 获取趋势预测
POST   /api/suggestions/feedback    # 反馈建议质量
```

#### 匹配社交
```
GET    /api/matches/nearby          # 获取附近用户
POST   /api/matches/request         # 发送匹配请求
GET    /api/matches/history         # 获取匹配历史
GET    /api/chat/:matchId/messages  # 获取聊天消息
POST   /api/chat/:matchId/messages  # 发送聊天消息
```

## 测试

### 运行测试
```bash
# 运行所有测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 运行特定测试文件
npm test -- auth.test.ts

# 监听模式运行测试
npm run test:watch
```

### 测试数据库
测试使用独立的测试数据库，配置在 `.env.test` 文件中：
```env
DATABASE_URL="postgresql://username:password@localhost:5432/social_rhythm_companion_test"
```

## 监控和日志

### 日志配置
日志使用 Winston 库，支持多种输出格式：
```typescript
// 日志级别: error, warn, info, debug
logger.info('Server started on port 3001');
logger.error('Database connection failed', error);
```

### 健康检查
```bash
# 检查服务健康状态
curl http://localhost:3001/health

# 检查数据库连接
curl http://localhost:3001/health/db

# 检查 Redis 连接
curl http://localhost:3001/health/redis
```

## 性能优化

### 数据库优化
1. 使用数据库索引优化查询性能
2. 实现查询结果缓存
3. 使用连接池管理数据库连接

### Redis 缓存
```typescript
// 缓存用户会话
await redis.setex(`session:${userId}`, 3600, JSON.stringify(sessionData));

// 缓存热点数据
await redis.setex(`places:nearby:${lat}:${lng}`, 300, JSON.stringify(places));
```

### API 限流
```typescript
// 实现 API 请求频率限制
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100 // 最多100个请求
}));
```

## 安全配置

### HTTPS 配置
```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 防火墙设置
```bash
# 只允许必要端口
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw enable
```

## 故障排除

### 常见问题

#### 1. 数据库连接失败
```bash
# 检查 PostgreSQL 服务状态
sudo systemctl status postgresql

# 检查数据库连接
psql -h localhost -U username -d social_rhythm_companion
```

#### 2. Redis 连接失败
```bash
# 检查 Redis 服务状态
sudo systemctl status redis

# 测试 Redis 连接
redis-cli ping
```

#### 3. 端口占用
```bash
# 查找占用端口的进程
lsof -i :3001

# 终止进程
kill -9 <PID>
```

#### 4. 内存不足
```bash
# 检查内存使用情况
free -h

# 检查 Node.js 进程内存使用
ps aux | grep node
```

### 日志分析
```bash
# 查看应用日志
tail -f logs/app.log

# 查看错误日志
tail -f logs/error.log

# 使用 Docker 查看日志
docker-compose logs -f backend
```

## 备份和恢复

### 数据库备份
```bash
# 创建备份
pg_dump -h localhost -U username social_rhythm_companion > backup.sql

# 恢复备份
psql -h localhost -U username social_rhythm_companion < backup.sql
```

### 自动化备份脚本
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/path/to/backups"
DB_NAME="social_rhythm_companion"

pg_dump -h localhost -U username $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# 保留最近7天的备份
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
```

## 生产环境部署清单

### 部署前检查
- [ ] 环境变量配置完成
- [ ] 数据库迁移已执行
- [ ] SSL 证书已配置
- [ ] 防火墙规则已设置
- [ ] 监控系统已部署
- [ ] 备份策略已实施

### 部署步骤
1. 拉取最新代码
2. 安装依赖
3. 构建应用
4. 运行数据库迁移
5. 重启应用服务
6. 验证部署结果

### 部署后验证
- [ ] 健康检查通过
- [ ] API 端点正常响应
- [ ] 数据库连接正常
- [ ] Redis 缓存工作正常
- [ ] 日志输出正常
- [ ] 监控指标正常

## 支持和维护

### 技术支持
- 文档: 查看项目 README 和 API 文档
- 问题报告: 使用 GitHub Issues
- 代码贡献: 提交 Pull Request

### 维护计划
- 定期更新依赖包
- 监控安全漏洞
- 性能优化和调优
- 数据库维护和优化

## 版本更新

### 更新流程
1. 查看更新日志
2. 备份当前数据
3. 测试环境验证
4. 生产环境部署
5. 验证更新结果

### 回滚计划
如果更新出现问题，可以快速回滚：
```bash
# 回滚到上一个版本
git checkout <previous-tag>
npm install
npx prisma migrate deploy
npm run build
npm start
```

---

更多详细信息请参考项目文档或联系开发团队。