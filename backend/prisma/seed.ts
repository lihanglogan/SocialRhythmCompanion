import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('开始执行数据库种子数据...');

  // 清理现有数据（可选，开发环境使用）
  if (process.env.NODE_ENV === 'development') {
    console.log('清理现有数据...');
    await prisma.messageRead.deleteMany();
    await prisma.chatMessage.deleteMany();
    await prisma.chatParticipant.deleteMany();
    await prisma.chatRoom.deleteMany();
    await prisma.match.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.activitySuggestion.deleteMany();
    await prisma.crowdnessData.deleteMany();
    await prisma.report.deleteMany();
    await prisma.placeReview.deleteMany();
    await prisma.placeStat.deleteMany();
    await prisma.userPreferences.deleteMany();
    await prisma.userProfile.deleteMany();
    await prisma.place.deleteMany();
    await prisma.placeCategory.deleteMany();
    await prisma.user.deleteMany();
  }

  // 创建场所分类
  console.log('创建场所分类...');
  const categories = await Promise.all([
    prisma.placeCategory.create({
      data: {
        name: '餐饮美食',
        icon: '🍽️',
        description: '餐厅、咖啡厅、小吃店等',
        isActive: true,
      },
    }),
    prisma.placeCategory.create({
      data: {
        name: '购物商场',
        icon: '🛍️',
        description: '商场、超市、专卖店等',
        isActive: true,
      },
    }),
    prisma.placeCategory.create({
      data: {
        name: '休闲娱乐',
        icon: '🎮',
        description: '电影院、KTV、游戏厅等',
        isActive: true,
      },
    }),
    prisma.placeCategory.create({
      data: {
        name: '运动健身',
        icon: '💪',
        description: '健身房、游泳馆、球场等',
        isActive: true,
      },
    }),
    prisma.placeCategory.create({
      data: {
        name: '文化教育',
        icon: '📚',
        description: '图书馆、博物馆、学校等',
        isActive: true,
      },
    }),
    prisma.placeCategory.create({
      data: {
        name: '医疗健康',
        icon: '🏥',
        description: '医院、诊所、药店等',
        isActive: true,
      },
    }),
    prisma.placeCategory.create({
      data: {
        name: '公园景点',
        icon: '🌳',
        description: '公园、景区、广场等',
        isActive: true,
      },
    }),
    prisma.placeCategory.create({
      data: {
        name: '交通枢纽',
        icon: '🚇',
        description: '地铁站、公交站、机场等',
        isActive: true,
      },
    }),
  ]);

  // 创建场所
  console.log('创建场所...');
  const places = [];
  
  // 餐饮美食场所
  const restaurantPlaces = [
    {
      name: '星巴克咖啡(国贸店)',
      address: '北京市朝阳区建国门外大街1号国贸商城',
      latitude: 39.9078,
      longitude: 116.4577,
      categoryId: categories[0].id,
      description: '全球知名咖啡连锁品牌，提供优质咖啡和舒适环境',
      businessHours: '06:30-22:00',
      phone: '010-85295000',
      avgRating: 4.5,
    },
    {
      name: '海底捞火锅(三里屯店)',
      address: '北京市朝阳区三里屯路19号院',
      latitude: 39.9365,
      longitude: 116.4477,
      categoryId: categories[0].id,
      description: '知名火锅连锁品牌，以优质服务著称',
      businessHours: '10:00-02:00',
      phone: '010-64168888',
      avgRating: 4.7,
    },
    {
      name: '麦当劳(王府井店)',
      address: '北京市东城区王府井大街138号',
      latitude: 39.9141,
      longitude: 116.4074,
      categoryId: categories[0].id,
      description: '全球快餐连锁品牌',
      businessHours: '24小时营业',
      phone: '010-65258899',
      avgRating: 4.2,
    },
  ];

  // 购物商场
  const shoppingPlaces = [
    {
      name: '北京国贸商城',
      address: '北京市朝阳区建国门外大街1号',
      latitude: 39.9078,
      longitude: 116.4577,
      categoryId: categories[1].id,
      description: '高端购物中心，汇聚国际知名品牌',
      businessHours: '10:00-22:00',
      phone: '010-85295000',
      avgRating: 4.6,
    },
    {
      name: '三里屯太古里',
      address: '北京市朝阳区三里屯路19号院',
      latitude: 39.9365,
      longitude: 116.4477,
      categoryId: categories[1].id,
      description: '时尚购物街区，潮流文化聚集地',
      businessHours: '10:00-22:00',
      phone: '010-64168000',
      avgRating: 4.8,
    },
  ];

  // 休闲娱乐
  const entertainmentPlaces = [
    {
      name: '万达影城(CBD店)',
      address: '北京市朝阳区建国路93号万达广场',
      latitude: 39.9045,
      longitude: 116.4598,
      categoryId: categories[2].id,
      description: '现代化多厅影院，设备先进',
      businessHours: '09:00-24:00',
      phone: '010-85806666',
      avgRating: 4.4,
    },
  ];

  // 运动健身
  const fitnessPlaces = [
    {
      name: '威尔士健身(国贸店)',
      address: '北京市朝阳区建国门外大街甲6号',
      latitude: 39.9088,
      longitude: 116.4587,
      categoryId: categories[3].id,
      description: '专业健身连锁品牌，设施完善',
      businessHours: '06:00-24:00',
      phone: '010-85295100',
      avgRating: 4.3,
    },
  ];

  // 公园景点
  const parkPlaces = [
    {
      name: '朝阳公园',
      address: '北京市朝阳区朝阳公园南路1号',
      latitude: 39.9319,
      longitude: 116.4734,
      categoryId: categories[6].id,
      description: '北京市四环以内最大的城市公园',
      businessHours: '06:00-21:00',
      phone: '010-65061639',
      avgRating: 4.5,
    },
  ];

  // 交通枢纽
  const transportPlaces = [
    {
      name: '国贸地铁站',
      address: '北京市朝阳区建国门外大街',
      latitude: 39.9078,
      longitude: 116.4577,
      categoryId: categories[7].id,
      description: '地铁1号线、10号线换乘站',
      businessHours: '05:00-23:30',
      phone: '',
      avgRating: 4.0,
    },
  ];

  const allPlaces = [
    ...restaurantPlaces,
    ...shoppingPlaces,
    ...entertainmentPlaces,
    ...fitnessPlaces,
    ...parkPlaces,
    ...transportPlaces,
  ];

  for (const placeData of allPlaces) {
    const place = await prisma.place.create({
      data: placeData,
    });
    places.push(place);
  }

  // 创建用户
  console.log('创建用户...');
  const users = [];
  const hashedPassword = await bcrypt.hash('123456', 10);

  const userData = [
    {
      email: 'alice@example.com',
      phone: '13800138001',
      password: hashedPassword,
      nickname: '爱丽丝',
      avatar: 'https://example.com/avatars/alice.jpg',
      gender: 'FEMALE',
      birthYear: 1995,
      latitude: 39.9078,
      longitude: 116.4577,
      isActive: true,
      lastActiveAt: new Date(),
    },
    {
      email: 'bob@example.com',
      phone: '13800138002',
      password: hashedPassword,
      nickname: '鲍勃',
      avatar: 'https://example.com/avatars/bob.jpg',
      gender: 'MALE',
      birthYear: 1992,
      latitude: 39.9365,
      longitude: 116.4477,
      isActive: true,
      lastActiveAt: new Date(),
    },
    {
      email: 'charlie@example.com',
      phone: '13800138003',
      password: hashedPassword,
      nickname: '查理',
      avatar: 'https://example.com/avatars/charlie.jpg',
      gender: 'MALE',
      birthYear: 1998,
      latitude: 39.9141,
      longitude: 116.4074,
      isActive: true,
      lastActiveAt: new Date(),
    },
    {
      email: 'diana@example.com',
      phone: '13800138004',
      password: hashedPassword,
      nickname: '戴安娜',
      avatar: 'https://example.com/avatars/diana.jpg',
      gender: 'FEMALE',
      birthYear: 1990,
      latitude: 39.9319,
      longitude: 116.4734,
      isActive: true,
      lastActiveAt: new Date(),
    },
    {
      email: 'edward@example.com',
      phone: '13800138005',
      password: hashedPassword,
      nickname: '爱德华',
      avatar: 'https://example.com/avatars/edward.jpg',
      gender: 'MALE',
      birthYear: 1993,
      latitude: 39.9045,
      longitude: 116.4598,
      isActive: true,
      lastActiveAt: new Date(),
    },
  ];

  for (const user of userData) {
    const createdUser = await prisma.user.create({
      data: user,
    });
    users.push(createdUser);
  }

  // 创建用户偏好设置
  console.log('创建用户偏好设置...');
  for (const user of users) {
    await prisma.userPreferences.create({
      data: {
        userId: user.id,
        socialPersonality: ['INTROVERT', 'AMBIVERT', 'EXTROVERT'][Math.floor(Math.random() * 3)],
        preferredCategories: categories.slice(0, 3).map((c) => c.id),
        maxDistance: Math.floor(Math.random() * 20) + 5, // 5-25km
        preferredAgeRange: '20-35',
        activityTime: ['MORNING', 'AFTERNOON', 'EVENING'][Math.floor(Math.random() * 3)],
        crowdPreference: ['QUIET', 'MODERATE', 'LIVELY'][Math.floor(Math.random() * 3)],
      },
    });
  }

  // 创建用户资料
  console.log('创建用户资料...');
  const profiles = [
    {
      userId: users[0].id,
      bio: '喜欢安静的咖啡厅，爱好阅读和摄影',
      interests: ['阅读', '摄影', '咖啡', '旅行'],
      occupation: '设计师',
      education: '本科',
      location: '北京朝阳区',
    },
    {
      userId: users[1].id,
      bio: '运动爱好者，喜欢户外活动',
      interests: ['健身', '篮球', '登山', '游泳'],
      occupation: '软件工程师',
      education: '硕士',
      location: '北京朝阳区',
    },
    {
      userId: users[2].id,
      bio: '美食探索者，喜欢尝试新餐厅',
      interests: ['美食', '烹饪', '电影', '音乐'],
      occupation: '市场营销',
      education: '本科',
      location: '北京东城区',
    },
    {
      userId: users[3].id,
      bio: '艺术爱好者，经常参观展览',
      interests: ['艺术', '展览', '话剧', '音乐会'],
      occupation: '艺术策展人',
      education: '硕士',
      location: '北京朝阳区',
    },
    {
      userId: users[4].id,
      bio: '科技发烧友，关注最新科技趋势',
      interests: ['科技', '编程', '游戏', '数码产品'],
      occupation: '产品经理',
      education: '本科',
      location: '北京朝阳区',
    },
  ];

  for (const profile of profiles) {
    await prisma.userProfile.create({
      data: profile,
    });
  }

  // 创建场所统计数据
  console.log('创建场所统计数据...');
  for (const place of places) {
    await prisma.placeStat.create({
      data: {
        placeId: place.id,
        totalVisits: Math.floor(Math.random() * 1000) + 100,
        totalReports: Math.floor(Math.random() * 50) + 10,
        avgCrowdness: Math.floor(Math.random() * 5) + 1,
        peakHours: ['09:00', '12:00', '18:00'],
        quietHours: ['14:00', '16:00', '22:00'],
        lastUpdated: new Date(),
      },
    });
  }

  // 创建拥挤度数据
  console.log('创建拥挤度数据...');
  for (const place of places) {
    // 为每个场所创建最近24小时的拥挤度数据
    for (let i = 0; i < 24; i++) {
      const timestamp = new Date();
      timestamp.setHours(timestamp.getHours() - i);
      
      await prisma.crowdnessData.create({
        data: {
          placeId: place.id,
          crowdnessLevel: Math.floor(Math.random() * 5) + 1,
          timestamp,
          reportCount: Math.floor(Math.random() * 10) + 1,
          confidence: Math.random() * 0.5 + 0.5, // 0.5-1.0
        },
      });
    }
  }

  // 创建用户上报数据
  console.log('创建用户上报数据...');
  for (let i = 0; i < 20; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const place = places[Math.floor(Math.random() * places.length)];
    
    await prisma.report.create({
      data: {
        userId: user.id,
        placeId: place.id,
        crowdnessLevel: Math.floor(Math.random() * 5) + 1,
        waitTime: Math.floor(Math.random() * 60), // 0-60分钟
        serviceQuality: Math.floor(Math.random() * 5) + 1,
        priceLevel: Math.floor(Math.random() * 5) + 1,
        noiseLevel: Math.floor(Math.random() * 5) + 1,
        comment: '这里的环境很不错，服务也很好',
        photos: ['https://example.com/photos/report1.jpg'],
        isAnonymous: Math.random() > 0.5,
        reportedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // 最近7天
      },
    });
  }

  // 创建活动建议
  console.log('创建活动建议...');
  const suggestions = [
    {
      title: '午后咖啡时光',
      description: '推荐您去附近的咖啡厅享受悠闲的午后时光',
      type: 'PERSONAL',
      priority: 'MEDIUM',
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
      metadata: {
        category: '餐饮美食',
        timeSlot: 'afternoon',
        crowdnessPreference: 'quiet'
      },
    },
    {
      title: '周末户外运动',
      description: '天气不错，适合去公园进行户外运动',
      type: 'TRENDING',
      priority: 'HIGH',
      validUntil: new Date(Date.now() + 48 * 60 * 60 * 1000),
      metadata: {
        category: '公园景点',
        weather: 'sunny',
        activity: 'outdoor'
      },
    },
    {
      title: '晚餐时间避开高峰',
      description: '建议错峰用餐，避开18-20点的用餐高峰期',
      type: 'SYSTEM',
      priority: 'LOW',
      validUntil: new Date(Date.now() + 12 * 60 * 60 * 1000),
      metadata: {
        category: '餐饮美食',
        timeSlot: 'evening',
        avoidPeakHours: true
      },
    },
  ];

  for (const suggestion of suggestions) {
    await prisma.activitySuggestion.create({
      data: suggestion,
    });
  }

  // 创建场所评价
  console.log('创建场所评价...');
  for (let i = 0; i < 15; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const place = places[Math.floor(Math.random() * places.length)];
    
    await prisma.placeReview.create({
      data: {
        userId: user.id,
        placeId: place.id,
        rating: Math.floor(Math.random() * 2) + 4, // 4-5星
        comment: '服务很好，环境舒适，值得推荐！',
        photos: Math.random() > 0.5 ? ['https://example.com/photos/review1.jpg'] : [],
        isAnonymous: Math.random() > 0.7,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // 最近30天
      },
    });
  }

  // 创建匹配记录
  console.log('创建匹配记录...');
  const matches = [
    {
      requesterId: users[0].id,
      targetId: users[1].id,
      status: 'ACCEPTED',
      message: '你好，我们可以一起去喝咖啡吗？',
      responseMessage: '好的，很乐意！',
      respondedAt: new Date(),
    },
    {
      requesterId: users[2].id,
      targetId: users[3].id,
      status: 'PENDING',
      message: '看到你也喜欢艺术展览，我们可以认识一下吗？',
    },
    {
      requesterId: users[4].id,
      targetId: users[0].id,
      status: 'REJECTED',
      message: '你好！',
      responseMessage: '抱歉，最近比较忙',
      respondedAt: new Date(),
    },
  ];

  for (const match of matches) {
    await prisma.match.create({
      data: match,
    });
  }

  // 为已接受的匹配创建聊天房间
  console.log('创建聊天房间...');
  const acceptedMatch = matches.find(m => m.status === 'ACCEPTED');
  if (acceptedMatch) {
    const chatRoom = await prisma.chatRoom.create({
      data: {
        type: 'PRIVATE',
        name: '爱丽丝 & 鲍勃',
        createdBy: acceptedMatch.requesterId,
        participants: {
          create: [
            {
              userId: acceptedMatch.requesterId,
              role: 'ADMIN',
            },
            {
              userId: acceptedMatch.targetId,
              role: 'MEMBER',
            },
          ],
        },
      },
    });

    // 创建聊天消息
    const messages = [
      {
        chatRoomId: chatRoom.id,
        senderId: acceptedMatch.requesterId,
        content: '你好！很高兴认识你',
        type: 'TEXT',
      },
      {
        chatRoomId: chatRoom.id,
        senderId: acceptedMatch.targetId,
        content: '你好！我也很高兴认识你',
        type: 'TEXT',
      },
      {
        chatRoomId: chatRoom.id,
        senderId: acceptedMatch.requesterId,
        content: '你经常去国贸那边吗？',
        type: 'TEXT',
      },
    ];

    for (const message of messages) {
      await prisma.chatMessage.create({
        data: message,
      });
    }
  }

  // 创建通知
  console.log('创建通知...');
  const notifications = [
    {
      userId: users[0].id,
      type: 'MATCH_REQUEST',
      title: '新的匹配请求',
      content: '爱德华向您发送了匹配请求',
      isRead: false,
      metadata: {
        matchId: 'match-id-placeholder',
        requesterId: users[4].id,
      },
    },
    {
      userId: users[1].id,
      type: 'SYSTEM',
      title: '系统通知',
      content: '欢迎使用Social Rhythm Companion！',
      isRead: true,
      metadata: {},
    },
    {
      userId: users[2].id,
      type: 'SUGGESTION',
      title: '个性化推荐',
      content: '根据您的偏好，为您推荐了新的活动建议',
      isRead: false,
      metadata: {
        suggestionType: 'personal',
      },
    },
  ];

  for (const notification of notifications) {
    await prisma.notification.create({
      data: notification,
    });
  }

  console.log('数据库种子数据创建完成！');
  console.log(`创建了 ${categories.length} 个场所分类`);
  console.log(`创建了 ${places.length} 个场所`);
  console.log(`创建了 ${users.length} 个用户`);
  console.log(`创建了匹配记录、聊天房间和消息`);
  console.log(`创建了用户上报、评价和通知数据`);
}

main()
  .catch((e) => {
    console.error('种子数据创建失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });