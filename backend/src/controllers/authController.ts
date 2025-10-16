import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { catchAsync } from '@/middleware/errorHandler';
import { ValidationError, ConflictError, AuthenticationError, NotFoundError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import { createCache } from '@/utils/redis';
import prisma from '@/utils/database';

// 验证模式
const registerSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(8, '密码至少需要8位字符').max(128, '密码不能超过128位字符'),
  nickname: z.string().min(2, '昵称至少需要2个字符').max(20, '昵称不能超过20个字符'),
  phone: z.string().regex(/^1[3-9]\d{9}$/, '手机号格式不正确').optional(),
  birthDate: z.string().datetime('生日格式不正确').optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
});

const loginSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(1, '密码不能为空'),
});

const resetPasswordSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
});

const confirmResetPasswordSchema = z.object({
  token: z.string().min(1, '重置令牌不能为空'),
  password: z.string().min(8, '密码至少需要8位字符').max(128, '密码不能超过128位字符'),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, '当前密码不能为空'),
  newPassword: z.string().min(8, '新密码至少需要8位字符').max(128, '新密码不能超过128位字符'),
});

// JWT 工具函数
const generateTokens = (userId: string, email: string, role: string) => {
  const jwtSecret = process.env.JWT_SECRET!;
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || jwtSecret;
  
  const accessToken = jwt.sign(
    { userId, email, role },
    jwtSecret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );

  const refreshToken = jwt.sign(
    { userId, email, role },
    jwtRefreshSecret,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  return { accessToken, refreshToken };
};

const generateResetToken = (): string => {
  return jwt.sign(
    { purpose: 'password_reset', timestamp: Date.now() },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );
};

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: 用户注册
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - nickname
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               nickname:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 20
 *               phone:
 *                 type: string
 *               birthDate:
 *                 type: string
 *                 format: date-time
 *               gender:
 *                 type: string
 *                 enum: [MALE, FEMALE, OTHER]
 *     responses:
 *       201:
 *         description: 注册成功
 *       400:
 *         description: 验证错误
 *       409:
 *         description: 邮箱已存在
 */
export const register = catchAsync(async (req: Request, res: Response) => {
  // 验证请求数据
  const validatedData = registerSchema.parse(req.body);

  // 检查邮箱是否已存在
  const existingUser = await prisma.user.findUnique({
    where: { email: validatedData.email }
  });

  if (existingUser) {
    throw new ConflictError('邮箱已被注册');
  }

  // 检查昵称是否已存在
  const existingNickname = await prisma.user.findUnique({
    where: { nickname: validatedData.nickname }
  });

  if (existingNickname) {
    throw new ConflictError('昵称已被使用');
  }

  // 检查手机号是否已存在（如果提供）
  if (validatedData.phone) {
    const existingPhone = await prisma.user.findUnique({
      where: { phone: validatedData.phone }
    });

    if (existingPhone) {
      throw new ConflictError('手机号已被注册');
    }
  }

  // 加密密码
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
  const hashedPassword = await bcrypt.hash(validatedData.password, saltRounds);

  // 创建用户
  const user = await prisma.user.create({
    data: {
      email: validatedData.email,
      password: hashedPassword,
      nickname: validatedData.nickname,
      phone: validatedData.phone,
      birthDate: validatedData.birthDate ? new Date(validatedData.birthDate) : null,
      gender: validatedData.gender,
      role: 'USER',
      status: 'ACTIVE',
      lastActiveAt: new Date(),
    },
    select: {
      id: true,
      email: true,
      nickname: true,
      phone: true,
      birthDate: true,
      gender: true,
      role: true,
      status: true,
      createdAt: true,
    }
  });

  // 生成 JWT 令牌
  const tokens = generateTokens(user.id, user.email, user.role);

  // 记录用户注册日志
  logger.logUserAction(user.id, 'USER_REGISTER', {
    email: user.email,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.status(201).json({
    success: true,
    message: '注册成功',
    data: {
      user,
      tokens
    }
  });
});

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: 用户登录
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: 登录成功
 *       401:
 *         description: 认证失败
 */
export const login = catchAsync(async (req: Request, res: Response) => {
  // 验证请求数据
  const { email, password } = loginSchema.parse(req.body);

  // 查找用户
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      password: true,
      nickname: true,
      phone: true,
      birthDate: true,
      gender: true,
      role: true,
      status: true,
      lastActiveAt: true,
      createdAt: true,
    }
  });

  if (!user) {
    throw new AuthenticationError('邮箱或密码错误');
  }

  // 检查用户状态
  if (user.status !== 'ACTIVE') {
    throw new AuthenticationError('账户已被禁用，请联系管理员');
  }

  // 验证密码
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AuthenticationError('邮箱或密码错误');
  }

  // 更新最后活跃时间
  await prisma.user.update({
    where: { id: user.id },
    data: { lastActiveAt: new Date() }
  });

  // 生成 JWT 令牌
  const tokens = generateTokens(user.id, user.email, user.role);

  // 移除密码字段
  const { password: _, ...userWithoutPassword } = user;

  // 记录用户登录日志
  logger.logUserAction(user.id, 'USER_LOGIN', {
    email: user.email,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.json({
    success: true,
    message: '登录成功',
    data: {
      user: userWithoutPassword,
      tokens
    }
  });
});

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: 用户登出
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 登出成功
 */
export const logout = catchAsync(async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : null;

  if (token) {
    // 将 token 加入黑名单
    const cache = createCache();
    const decoded = jwt.decode(token) as any;
    const expiresIn = decoded?.exp ? decoded.exp - Math.floor(Date.now() / 1000) : 3600;
    
    if (expiresIn > 0) {
      await cache.set(`blacklist:${token}`, true, expiresIn);
    }

    // 记录用户登出日志
    if (req.user) {
      logger.logUserAction(req.user.id, 'USER_LOGOUT', {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
    }
  }

  res.json({
    success: true,
    message: '登出成功'
  });
});

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     summary: 刷新访问令牌
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: 刷新成功
 *       401:
 *         description: 刷新令牌无效
 */
export const refreshToken = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AuthenticationError('刷新令牌无效');
  }

  // 生成新的访问令牌
  const tokens = generateTokens(req.user.id, req.user.email, req.user.role);

  // 记录令牌刷新日志
  logger.logUserAction(req.user.id, 'TOKEN_REFRESH', {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.json({
    success: true,
    message: '令牌刷新成功',
    data: {
      tokens
    }
  });
});

/**
 * @swagger
 * /api/v1/auth/reset-password:
 *   post:
 *     summary: 请求重置密码
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: 重置邮件已发送
 */
export const requestPasswordReset = catchAsync(async (req: Request, res: Response) => {
  const { email } = resetPasswordSchema.parse(req.body);

  // 查找用户
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, nickname: true, status: true }
  });

  if (!user) {
    // 为了安全考虑，不暴露用户是否存在
    res.json({
      success: true,
      message: '如果邮箱存在，重置密码邮件已发送'
    });
    return;
  }

  if (user.status !== 'ACTIVE') {
    throw new AuthenticationError('账户已被禁用，请联系管理员');
  }

  // 生成重置令牌
  const resetToken = generateResetToken();

  // 存储重置令牌到缓存
  const cache = createCache();
  await cache.set(`password_reset:${user.id}`, resetToken, 3600); // 1小时过期

  // 这里应该发送邮件，暂时只记录日志
  logger.logUserAction(user.id, 'PASSWORD_RESET_REQUEST', {
    email: user.email,
    resetToken,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // TODO: 发送重置密码邮件
  // await sendPasswordResetEmail(user.email, user.nickname, resetToken);

  res.json({
    success: true,
    message: '重置密码邮件已发送'
  });
});

/**
 * @swagger
 * /api/v1/auth/confirm-reset-password:
 *   post:
 *     summary: 确认重置密码
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: 密码重置成功
 *       400:
 *         description: 令牌无效或已过期
 */
export const confirmPasswordReset = catchAsync(async (req: Request, res: Response) => {
  const { token, password } = confirmResetPasswordSchema.parse(req.body);

  // 验证重置令牌
  let decoded: any;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!);
  } catch (error) {
    throw new ValidationError('重置令牌无效或已过期');
  }

  if (decoded.purpose !== 'password_reset') {
    throw new ValidationError('无效的重置令牌');
  }

  // 从缓存中查找用户ID
  const cache = createCache();
  const keys = await cache.smembers('password_reset:*');
  let userId: string | null = null;

  for (const key of keys) {
    const cachedToken = await cache.get(key);
    if (cachedToken === token) {
      userId = key.replace('password_reset:', '');
      break;
    }
  }

  if (!userId) {
    throw new ValidationError('重置令牌无效或已过期');
  }

  // 查找用户
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, status: true }
  });

  if (!user || user.status !== 'ACTIVE') {
    throw new NotFoundError('用户不存在或已被禁用');
  }

  // 加密新密码
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // 更新密码
  await prisma.user.update({
    where: { id: user.id },
    data: { 
      password: hashedPassword,
      lastActiveAt: new Date()
    }
  });

  // 清除重置令牌
  await cache.del(`password_reset:${user.id}`);

  // 记录密码重置日志
  logger.logUserAction(user.id, 'PASSWORD_RESET_CONFIRM', {
    email: user.email,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.json({
    success: true,
    message: '密码重置成功'
  });
});

/**
 * @swagger
 * /api/v1/auth/change-password:
 *   post:
 *     summary: 修改密码
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: 密码修改成功
 *       401:
 *         description: 当前密码错误
 */
export const changePassword = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AuthenticationError('需要登录');
  }

  const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

  // 查找用户
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, email: true, password: true, status: true }
  });

  if (!user || user.status !== 'ACTIVE') {
    throw new AuthenticationError('用户不存在或已被禁用');
  }

  // 验证当前密码
  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isCurrentPasswordValid) {
    throw new AuthenticationError('当前密码错误');
  }

  // 检查新密码是否与当前密码相同
  const isSamePassword = await bcrypt.compare(newPassword, user.password);
  if (isSamePassword) {
    throw new ValidationError('新密码不能与当前密码相同');
  }

  // 加密新密码
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
  const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

  // 更新密码
  await prisma.user.update({
    where: { id: user.id },
    data: { 
      password: hashedNewPassword,
      lastActiveAt: new Date()
    }
  });

  // 记录密码修改日志
  logger.logUserAction(user.id, 'PASSWORD_CHANGE', {
    email: user.email,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.json({
    success: true,
    message: '密码修改成功'
  });
});

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: 获取当前用户信息
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 用户信息
 *       401:
 *         description: 未授权
 */
export const getCurrentUser = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AuthenticationError('需要登录');
  }

  // 获取用户详细信息
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      email: true,
      nickname: true,
      phone: true,
      birthDate: true,
      gender: true,
      avatar: true,
      role: true,
      status: true,
      lastActiveAt: true,
      createdAt: true,
      updatedAt: true,
    }
  });

  if (!user) {
    throw new NotFoundError('用户不存在');
  }

  res.json({
    success: true,
    data: { user }
  });
});

export default {
  register,
  login,
  logout,
  refreshToken,
  requestPasswordReset,
  confirmPasswordReset,
  changePassword,
  getCurrentUser,
};