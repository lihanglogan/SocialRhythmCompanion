import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { app } from '../src/app';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL
    }
  }
});

describe('API 测试', () => {
  let authToken: string;
  let testUserId: string;

  beforeAll(async () => {
    // 连接测试数据库
    await prisma.$connect();
    
    // 清理测试数据
    await prisma.chatMessage.deleteMany();
    await prisma.match.deleteMany();
    await prisma.report.deleteMany();
    await prisma.place.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    // 清理并断开连接
    await prisma.chatMessage.deleteMany();
    await prisma.match.deleteMany();
    await prisma.report.deleteMany();
    await prisma.place.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('健康检查', () => {
    it('应该返回健康状态', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('version');
    });
  });

  describe('用户认证', () => {
    it('应该成功注册新用户', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        nickname: '测试用户'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');
      
      authToken = response.body.data.token;
      testUserId = response.body.data.user.id;
    });

    it('应该成功登录用户', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('token');
    });

    it('应该拒绝无效的登录凭据', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('应该返回当前用户信息', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('email', 'test@example.com');
    });
  });

  describe('场所管理', () => {
    it('应该获取场所列表', async () => {
      const response = await request(app)
        .get('/api/places')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('places');
    });

    it('应该搜索场所', async () => {
      const response = await request(app)
        .get('/api/places/search')
        .query({ keyword: '咖啡' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('places');
    });

    it('应该获取场所详情', async () => {
      const response = await request(app)
        .get('/api/places/1')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('place');
    });
  });

  describe('上报功能', () => {
    let testPlaceId: string;

    beforeAll(async () => {
      // 创建测试场所
      const place = await prisma.place.create({
        data: {
          name: '测试咖啡厅',
          address: '测试地址',
          latitude: 39.9042,
          longitude: 116.4074,
          category: 'cafe',
          description: '测试描述',
          openingHours: '9:00-22:00',
          phone: '1234567890',
          website: 'https://test.com',
          rating: 4.5,
          priceLevel: 2,
          amenities: ['wifi', 'parking'],
          photos: ['photo1.jpg'],
          businessHours: {
            monday: '9:00-22:00',
            tuesday: '9:00-22:00',
            wednesday: '9:00-22:00',
            thursday: '9:00-22:00',
            friday: '9:00-22:00',
            saturday: '9:00-22:00',
            sunday: '9:00-22:00'
          }
        }
      });
      testPlaceId = place.id;
    });

    it('应该成功提交上报', async () => {
      const reportData = {
        placeId: testPlaceId,
        crowdLevel: 3,
        noiseLevel: 2,
        temperature: 22,
        lighting: 4,
        wifiQuality: 5,
        powerOutlets: true,
        seatingAvailability: 3,
        notes: '环境不错，适合工作'
      };

      const response = await request(app)
        .post('/api/reports')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reportData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('report');
    });

    it('应该获取用户的上报历史', async () => {
      const response = await request(app)
        .get('/api/reports/my')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('reports');
    });
  });

  describe('智能建议', () => {
    it('应该获取今日建议', async () => {
      const response = await request(app)
        .get('/api/suggestions/today')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('suggestions');
    });

    it('应该获取个人推荐', async () => {
      const response = await request(app)
        .get('/api/suggestions/personal')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('recommendations');
    });
  });

  describe('匹配功能', () => {
    beforeAll(async () => {
      // 创建另一个测试用户用于匹配
      await prisma.user.create({
        data: {
          email: 'test2@example.com',
          password: 'hashedpassword',
          nickname: '测试用户2',
          avatar: 'avatar2.jpg',
          bio: '另一个测试用户',
          preferences: {
            workStyle: 'focused',
            noiseLevel: 'quiet',
            socialLevel: 'moderate'
          },
          location: {
            latitude: 39.9042,
            longitude: 116.4074
          }
        }
      });
    });

    it('应该获取附近用户', async () => {
      const response = await request(app)
        .get('/api/matches/nearby')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          latitude: 39.9042,
          longitude: 116.4074
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('users');
    });

    it('应该创建匹配请求', async () => {
      // 先获取另一个用户的 ID
      const users = await prisma.user.findMany({
        where: { email: 'test2@example.com' }
      });
      const targetUserId = users[0].id;

      const matchData = {
        targetUserId,
        message: '想一起学习吗？'
      };

      const response = await request(app)
        .post('/api/matches/request')
        .set('Authorization', `Bearer ${authToken}`)
        .send(matchData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('match');
    });

    it('应该获取匹配历史', async () => {
      const response = await request(app)
        .get('/api/matches/history')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('matches');
    });
  });

  describe('聊天功能', () => {
    it('应该获取聊天列表', async () => {
      const response = await request(app)
        .get('/api/chats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('chats');
    });
  });

  describe('错误处理', () => {
    it('应该处理未找到的路由', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });

    it('应该处理未授权的请求', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('应该处理无效的 token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });
});