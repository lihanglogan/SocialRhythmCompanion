# Social Rhythm Companion 后端 API

Social Rhythm Companion 的 Node.js + PostgreSQL 后端服务，提供完整的 RESTful API 和实时通信功能。

## 🚀 快速开始

### 环境要求

- Node.js 18+ 
- PostgreSQL 14+
- Redis 6+ (可选，用于缓存)
- npm 或 yarn

### 安装依赖

```bash
cd backend
npm install
```

### 环境配置

1. 复制环境配置文件：
```bash
cp .env.example .env
```

2. 配置数据库和其他环境变量：
```bash
# 数据库配置
DATABASE_URL="postgresql://username:password@localhost:5432/social_rhythm?schema=public"

# JWT 配置
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Redis 配置 (可选)
REDIS_URL="redis://localhost:6379"

# 其他配置...
```

### 数据库设置

1. 生成 Prisma 客户端：
```bash
npm run prisma:generate
```

2. 运行数据库迁移：
```bash
npm run prisma:migrate
```

3. 填充种子数据：
```bash
npm run prisma:seed
```

### 启动开发服务器

```bash
npm run dev
```

服务器将在 `http://localhost:3001` 启动。

## 📚 API 文档

### Swagger 文档

启动服务器后，访问 `http://localhost:3001/api-docs` 查看完整的 API 文档。

### 主要 API 端点

#### 认证相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息
- `POST /api/auth/refresh` - 刷新 token

#### 用户管理
- `GET /api/users/profile` - 获取用户资料
- `PUT /api/users/profile` - 更新用户资料
- `GET /api/users/preferences` - 获取用户偏好设置
- `PUT /api/users/preferences` - 更新用户偏好设置

#### 场所管理
- `GET /api/places` - 获取场所列表
- `GET /api/places/:id` - 获取场所详情
- `GET /api/places/search` - 搜索场所
- `GET /api/places/nearby` - 获取附近场所

#### 上报功能
- `POST /api/reports` - 提交场所上报
- `GET /api/reports/my` - 获取我的上报历史
- `GET /api/reports/place/:placeId` - 获取场所的上报数据
- `GET /api/reports/stats` - 获取上报统计

#### 智能建议
- `GET /api/suggestions/today` - 获取今日建议
- `GET /api/suggestions/personal` - 获取个人推荐
- `GET /api/suggestions/plan` - 获取计划建议
- `POST /api/suggestions/feedback` - 提交建议反馈

#### 匹配功能
- `GET /api/matches/nearby` - 获取附近用户
- `POST /api/matches/request` - 发起匹配请求
- `PUT /api/matches/:id/respond` - 响应匹配请求
- `GET /api/matches/history` - 获取匹配历史

#### 聊天功能
- `GET /api/chats` - 获取聊天列表
- `GET /api/chats/:id/messages` - 获取聊天消息
- `POST /api/chats/:id/messages` - 发送消息

### 认证

API 使用 JWT Bearer Token 认证：

```bash
Authorization: Bearer <your_jwt_token>
```

## 🧪 测试

### 运行测试

```bash
# 运行所有测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 监听模式运行测试
npm run test:watch
```

### 测试环境配置

测试使用独立的测试数据库，配置在 `.env.test` 文件中。

## 📦 项目结构

```
backend/
├── src/
│   ├── controllers/     # 控制器
│   ├── routes/         # 路由定义
│   ├── middleware/     # 中间件
│   ├── utils/          # 工具函数
│   ├── types/          # 类型定义
│   └── app.ts          # 应用入口
├── prisma/
│   ├── schema.prisma   # 数据库模式
│   ├── migrations/     # 数据库迁移
│   └── seed.ts         # 种子数据
├── tests/              # 测试文件
├── scripts/            # 脚本文件
└── dist/               # 编译输出
```

## 🔧 开发工具

### 可用脚本

- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm run start` - 启动生产服务器
- `npm run test` - 运行测试
- `npm run prisma:generate` - 生成 Prisma 客户端
- `npm run prisma:migrate` - 运行数据库迁移
- `npm run prisma:seed` - 填充种子数据
- `npm run prisma:studio` - 启动 Prisma Studio

### 代码规范

项目使用 ESLint 和 Prettier 进行代码规范检查：

```bash
# 检查代码规范
npm run lint

# 自动修复代码规范问题
npm run lint:fix

# 格式化代码
npm run format
```

## 🚀 部署

### 生产环境构建

```bash
npm run build
```

### 环境变量

确保生产环境配置了所有必需的环境变量：

- `DATABASE_URL` - 生产数据库连接
- `JWT_SECRET` - JWT 密钥
- `REDIS_URL` - Redis 连接 (可选)
- `NODE_ENV=production`

### Docker 部署 (可选)

```bash
# 构建镜像
docker build -t social-rhythm-backend .

# 运行容器
docker run -p 3001:3001 --env-file .env social-rhythm-backend
```

## 🔍 监控和日志

### 健康检查

访问 `GET /health` 端点检查服务状态。

### 日志

应用使用 Winston 进行日志记录，日志文件存储在 `logs/` 目录。

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🆘 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查 `DATABASE_URL` 配置
   - 确保 PostgreSQL 服务正在运行
   - 验证数据库用户权限

2. **JWT Token 无效**
   - 检查 `JWT_SECRET` 配置
   - 确保 token 没有过期
   - 验证 Authorization header 格式

3. **Redis 连接问题**
   - Redis 是可选的，连接失败不会影响核心功能
   - 检查 `REDIS_URL` 配置
   - 确保 Redis 服务正在运行

### 获取帮助

如果遇到问题，请：

1. 查看日志文件
2. 检查环境变量配置
3. 确认数据库连接状态
4. 提交 Issue 描述问题

---

**Social Rhythm Companion Backend** - 让社交节奏更智能 🎵