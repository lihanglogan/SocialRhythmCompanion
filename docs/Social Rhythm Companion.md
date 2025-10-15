应用概念：邻里节律（Social Rhythm Companion）

核心目标：让个人的日常安排（办事、通勤、购物、学习、照护）与所在社区的真实节律同步，从而减少等待、提高效率、增加社交支持与安全感。
社会学洞察：人的时间使用并非孤立决定，它受到社区人流、制度开放时间、家庭与照护分工、“第三空间”的可达性、节假日与工资发放日等“社会节律”的强影响。把个体微决策和社区中观节律对齐，能显著提升生活质量。
它帮助谁

需要在城市里办事的人（政务大厅、医院窗口、银行）
照护者与家长（接送、采购、跑腿）
学生与远程工作者（寻找安静空间、安排高效时段）
零工与非标准工作者（错峰跑单、减少空转）
老年人与行动不便者（更安全的路线与无障碍时段）
MVP关键功能

实时节律热图：展示周边场所的人流、噪音、排队与座位占用的预测（图书馆、政务大厅、菜市场、医院、公交站等）。
智能时段建议：根据你的偏好与作息类型（晨型/夜型/家庭约束），推荐“最佳办理窗口”（例如“今天11:20-12:10去XX大厅，排队≈8分钟”）。
同行匹配与轻社交：把“同一时间做同一任务”的人临时配对，互相提醒、拼车或结伴前往，提高执行率与安全感。
微仪式与任务卡片：把待办绑定到你已有的习惯与路线（“送完孩子→顺路去市场，当前客流低”），提供5分钟小步提醒。
安全与无障碍提示：夜间更安全路线、照明充足区段、轮椅可达路径与电梯位置提示。
社区资源日历：政务窗口开放/停办、门诊出诊、图书馆活动、商超打折和补货时段，一目了然。
轻量隐私模式：无需精确定位也可获得街区级建议；所有个体数据本地处理、聚合上报。
数据与模型（对接软件专家的实现要点）

数据源：公共开放数据（政务、医院、图书馆开放时间）、地图平台人流热力与到站信息、公交/地铁实时、用户匿名上报的等待时间与拥挤度、节假日与工资发放日历。
预测方法：时间序列模型（SARIMA/Prophet），补充假日/天气/工资日因子；排队时间用梯度提升回归；贝叶斯更新吸收最新众包上报。
隐私与信任：本地计算优先；差分隐私聚合上报；地理精度自动模糊；透明的数据来源与模型解释。
架构建议：
前端：移动端PWA（React/Vue），离线缓存与地图SDK。
后端：REST/GraphQL，Postgres+TimescaleDB存储时间序列，Redis缓存，事件队列处理实时流。
典型接口：GET /places/:id/flow、GET /tasks/suggestions、POST /reports（匿名拥挤度/等待时间上报）、POST /match（同行匹配）。
首期MVP范围与验证

城市与场景：在2个城市，聚焦3个高频场景——政务/医院办理、商超/菜市场购物、图书馆/自习空间。
成功指标：平均等待时间下降、任务按时完成率提升、错峰出行比例提升、7日留存与社区贡献数（有效上报）。
迭代节奏：8周内上线MVP→根据上报质量与预测误差迭代模型→扩展到更多场所与功能。
差异化价值

不只是“个人待办”，而是把“社区节律”纳入决策，让每一个小行动更顺畅。
将安全、无障碍与轻社交融合，服务到被主流工具忽视的群体（照护者、老年人、零工）。

以下为“邻里节律 Social Rhythm Companion”的完整PRD与接口文档（MVP导向），技术栈以 Next.js 完成前后端开发。文档力求工程可落地，适合产品、设计与工程团队协作推进。

一、产品概述

目标
让个人的日常活动与社区的真实节律同步，减少排队与空转，提高安全与可达性，提升执行效率与生活质量。
核心价值
将“个人待办 + 社区时空节律（人流、开放、供给、交通、天气、节假日）”融合，提供最佳时段与路径建议，并支持临时同行、轻社交与安全/无障碍信息。
MVP范围（首期2城、3场景）
政务/医院办理（窗口/门诊）
商超/农贸市场购物
图书馆/自习空间
非目标（MVP不做）
城际出行规划、深度社交关系链、积分商城、复杂UGC内容审核体系
二、用户与场景

主要用户画像
城市办事人：需要在窗口/医院办理业务，重视“最短等待”
照护者与家长：时间碎片化，重视“顺路错峰与安全”
学生与远程工作者：找安静空间，重视“座位占用与噪音”
零工与非标准工作者：跑单错峰，重视“人流与交通”
老年人与行动不便者：重视“无障碍与照明安全”
关键用户故事（MVP）
作为用户，我想看到附近办事点/自习点当前与未来1-3小时的拥挤度与等待时间，以便错峰前往。
作为用户，我希望系统给出今天内“最佳办理窗口”，并可绑定我的待办卡片与路线。
作为用户，我想上报当前排队或拥挤度，换取更准确的预测，并保护我的隐私。
作为用户，我希望与同一时段同路的人临时结伴（可选），提升执行率与安全感。
作为用户，我想得到夜间更安全、轮椅可达的路线建议。
三、功能需求清单（MVP）

实时节律热图
地图或列表展示场所的人流指数、预测等待时间、噪音/座位占用（图书馆）
时段切换：当前、+30/60/120分钟预测
智能时段建议
基于用户偏好（晨/夜型、照护窗口、路程阈值），推荐今日最佳办理时间段
日历聚合：开放时间、停办公告、补货/折扣时段
报告与众包
一键上报：当前排队分钟数、拥挤等级、座位占用、噪音
信任度机制与限流，反作弊
同行匹配（轻社交）
同时段同地点意向配对，临时群聊/提醒（MVP仅“确认同行+提醒”，不做实时聊天）
安全与无障碍
夜间更安全路线（照明/监控密度），轮椅可达路径、电梯位置
账户与隐私
免登录可用核心功能；登录后保存偏好、历史与提醒
位置模糊与本地计算优先
四、成功指标（MVP）

用户侧
平均等待时间下降 ≥20%
任务按时完成率提升 ≥15%
错峰出行比例提升 ≥15%
7日留存 ≥25%，月度活跃上报率 ≥10%
模型侧
等待时间MAE ≤6分钟
拥挤等级Top-1准确率 ≥70%
五、隐私、安全与合规

隐私
默认街区级位置精度；开启精确定位需显式同意
匿名化/差分隐私聚合上报（阈值频次与混入噪声）
可导出与删除个人数据；最短必要保留策略
安全
OWASP ASVS实践；输入校验与速率限制；API密钥与RBAC
众包反作弊：设备指纹、异常上报检测、信誉分
合规
符合本地个人信息保护与地图使用规范；公开数据来源标注
六、技术方案（Next 完整栈）

前端
Next.js 14（App Router, React Server Components, Server Actions）
TypeScript、Tailwind CSS、Mapbox GL JS
状态管理：Zustand（轻量）或 Redux Toolkit（如需复杂）
表单校验：react-hook-form + zod
PWA：Service Worker、离线缓存、Web Push（VAPID）
可访问性与i18n：aria语义 + next-intl
后端（同一仓库）
Next Route Handlers /api，zod做入参校验
鉴权：NextAuth.js（邮箱魔法链接/短信OTP/社登可选）
实时：SSE（Server-Sent Events）或 Next WebSocket（Node runtime）
任务队列：BullMQ（Redis）
缓存：Redis（热点场所流量/预测）
数据库：PostgreSQL + TimescaleDB（时间序列），ORM 用 Prisma
搜索：pg_trgm/GIN索引，地理查询用 PostGIS
日志与监控：OpenTelemetry + APM（如 Sentry/Datadog），PostHog埋点
外部数据
天气：Open-Meteo 或和风天气
节假日：公开节假日API/静态表
地图底图：Mapbox
交通：GTFS/实时到站（城市开放数据）
部署
Web：Vercel（Edge/Node 混合，SSE用Node）
DB：Timescale Cloud 或自建 Postgres+Timescale
Redis：Upstash/Redis Cloud
域名与HTTPS、CI/CD（GitHub Actions）
七、数据与算法（MVP）

数据源
开放数据：场所开放时间、公告；图书馆活动；部分到站实时
用户众包：等待时长、拥挤等级、座位占用、噪音
第三方：天气、节假日、工资发放日（静态推断）
预测方法（Node内实现的轻量版）
等待时间：加权指数平滑（EWMA） + 周期分量（同周同日同小时历史）+ 天气/节假日/工资日前后哑变量
拥挤度：梯度提升树的简化替代（先用线性/树模型在Node侧，如 LightGBM 预估值离线产出 + 在线校准）
贝叶斯更新：将最新众包上报做后验校准（正态-正态或Beta-Binomial视量纲）
排队估计
基于M/M/c近似：等待时间 ≈ f(到达率λ、服务率μ、窗口数c)，λ来自人流/历史上报，μ来自历史办结速率
实时融合
预测值 = 模型预测 × w1 + 众包校准 × w2 + 规则边界（开放时间/停办约束）
八、信息架构与主要流程

IA
首页：地图/列表 + 当前/未来拥挤度
建议：今日最佳时段卡片 + 待办绑定
上报：一键上报入口
同行：匹配广场/我的匹配
我的：偏好、隐私、通知、数据导出
核心流程
首次打开：定位授权与隐私说明 → 选择城市 → 个性偏好
查看与筛选场所 → 场所详情（当前/预测、开放/公告、无障碍） → 导航/加入排队
获取建议 → 绑定到日历/提醒
上报拥挤/等待 → 奖励轻反馈（信誉分）
同行匹配 → 创建/加入 → 确认时间与集合点 → 提醒
夜间/无障碍路线 → 打开导航
九、权限角色

游客：浏览、获取建议（低精度）、匿名上报（限频）
登录用户：全部MVP功能、提醒、匹配
场地方（可选阶段）：维护开放时间、公告
管理员：数据审核、黑名单、下线场所
十、数据模型（核心表，Prisma/SQL）

users(id, email, phone, created_at, last_login, role)
user_profiles(user_id, nickname, chronotype, mobility_needs, home_area)
devices(id, user_id, push_token, platform, last_seen)
places(id, city_id, name, category, geo(Point), address, open_hours, wheelchair_accessible, elevator_info, admin_owner_id, score)
place_stats(id, place_id, ts, flow_index, wait_minutes, seat_occupancy, noise_level) 说明：Timescale hypertable
reports(id, user_id null, place_id, ts, wait_minutes, crowd_level 1-5, seat_occupancy 0-100, noise_level 0-100, trust_score, device_hash)
suggestions_cache(id, user_id or null, city_id, day, payload_json, expires_at)
matches(id, place_id, start_time, status, created_by)
match_members(id, match_id, user_id, status)
safety_segments(id, city_id, geom(LineString), safety_score, lighting, cctv_density, wheelchair_ok)
events(id, place_id, start_time, end_time, title, type, source)
calendars(city_id, payload_json, updated_at) 说明：政务停办/补货/出诊等
cities(id, name, tz, bbox)
audit_logs(id, actor_id, action, target, ts, meta)
索引建议

places: GIST(geo), GIN(name/address trigram), btree(city_id, category)
place_stats: time, place_id 分区；btree(place_id, ts)
reports: btree(place_id, ts), partial index on recent 7d
safety_segments: GIST(geom)
十一、埋点与指标（PostHog）

事件
view_place, view_heatmap, request_suggestion, accept_suggestion, submit_report, create_match, join_match, start_navigation, toggle_privacy
指标与漏斗
首次访问 → 授权定位 → 查看建议 → 接受并前往 → 上报
十二、迭代计划（12周）

W1-2：数据模型与基础API、地图与列表
W3-4：上报与热图、预测v1（EWMA）
W5-6：建议引擎、提醒与PWA推送
W7-8：同行匹配、无障碍/安全路线v1
W9-10：A/B与指标看板、反作弊
W11-12：性能与可用性优化、城市扩展
十三、风险与对策

众包质量不稳：信誉分、离群检测、阈值聚合
数据源波动：多源冗余、熔断与降级提示
预测误差：在线校准与解释面板（置信区间）
隐私顾虑：强默认最小化与透明披露
十四、API设计原则

基本
REST + JSON，版本 v1：/api/v1/...
所有时间字段ISO8601（含时区），坐标WGS84
使用zod校验入参，统一错误结构
鉴权
Bearer JWT（NextAuth），游客无Token可访问有限查询
速率限制：IP+用户双维度
错误结构
{ error: { code: string, message: string, details?: any } }
十五、接口文档（MVP）

鉴权
POST /api/v1/auth/magic-link
入参：{ email: string }
出参：{ ok: true }（发送登录邮件），或错误
POST /api/v1/auth/verify
入参：{ token: string }
出参：{ token: string(JWT), user: { id, email, role } }
场所搜索与详情
GET /api/v1/places/search
Query: q? string, category? string, city_id? string, lat? number, lng? number, radius_m? number=3000, limit? number<=50
出参：{ items: [{ id, name, category, distance_m, address, open_now, wheelchair_accessible, score }] }
GET /api/v1/places/:id
出参：{ id, name, category, address, geo: { lat, lng }, open_hours, wheelchair_accessible, elevator_info, current: { flow_index, wait_minutes, seat_occupancy, noise_level, updated_at }, forecast: [{ ts, wait_minutes, flow_index }], events: [{ id, title, start_time, end_time, type }] }
热图/流量
GET /api/v1/places/flow
Query: city_id string, bbox? [minLng,minLat,maxLng,maxLat], categories? string[], horizon_min? 0|30|60|120=0
出参：{ items: [{ place_id, flow_index, wait_minutes, ts }] }
SSE流：GET /api/v1/stream/places?ids=comma-separated
事件：event: update，数据：{ place_id, flow_index, wait_minutes, ts }
心跳：event: ping
智能时段建议
GET /api/v1/suggestions
Query: city_id string, tasks? string csv, horizon_h? number=6
鉴权：可选（登录更个性化）
出参：{ items: [{ place_id, place_name, recommended_window: { start, end }, expected_wait_minutes, reasoning, confidence 0-1 }] }
POST /api/v1/tasks/attach
入参：{ place_id, title, date, preferred_window?: { start, end } }
出参：{ id, status: "saved" }
众包上报
POST /api/v1/reports
入参：{ place_id: string, wait_minutes?: number(0-180), crowd_level?: 1-5, seat_occupancy?: 0-100, noise_level?: 0-100, ts?: string }
需速率限制与设备指纹（服务端生成）
出参：{ id, accepted: boolean, reward?: { trust_delta: number } }
GET /api/v1/reports/recent
Query: place_id string, limit? number=20
出参：{ items: [{ id, ts, wait_minutes, crowd_level, trust_score }] }
同行匹配
POST /api/v1/match
入参：{ place_id: string, start_time: string, visibility: "public"|"private" }
出参：{ id, status: "open" }
POST /api/v1/match/:id/join
入参：{ }
出参：{ id, status: "joined" }
GET /api/v1/match
Query: place_id string, start_after? string, start_before? string
出参：{ items: [{ id, place_id, start_time, participants: number, status }] }
POST /api/v1/match/:id/leave
出参：{ status: "left" }
安全与无障碍路线
POST /api/v1/routes/safe
入参：{ origin: { lat, lng }, destination: { lat, lng }, mode?: "walk"|"wheelchair" }
出参：{ distance_m, duration_min, polyline, safety_score, segments: [{ safety_score, lighting, wheelchair_ok }] }
城市资源与日历
GET /api/v1/calendar
Query: city_id string, place_id? string
出参：{ items: [{ id, title, type, start_time, end_time, source }] }
用户偏好与通知
GET /api/v1/me
鉴权
出参：{ id, email, profile: { chronotype, mobility_needs, home_area }, preferences: { max_travel_min, notify_windows: [{ start, end }] } }
PATCH /api/v1/me/preferences
入参：{ chronotype?, mobility_needs?, max_travel_min?, notify_windows? }
出参：{ ok: true }
POST /api/v1/notifications/register
入参：{ push_token: string, platform: "web"|"ios"|"android" }
出参：{ ok: true }
管理与审核（管理员）
GET /api/v1/admin/reports/flagged
出参：{ items: [{ id, place_id, ts, reason, device_hash }] }
POST /api/v1/admin/places/:id
入参：{ open_hours?, wheelchair_accessible?, elevator_info?, status? }
出参：{ ok: true }
统一响应示例
成功：{ data: ... , meta?: { request_id } }
错误：{ error: { code: "VALIDATION_ERROR", message: "invalid parameter", details: { field: "lat" } } }
十二六、实时与推送

SSE通道：/api/v1/stream/places；心跳每15秒；重连退避
Web Push：VAPID，订阅主题包括 place_update、suggestion_ready、match_reminder
十七、前后端接口实现要点（Next.js）

API Route Handlers
目录：app/api/v1/.../route.ts
运行时：Node（需SSE/队列），选择 dynamic = "force-dynamic"
数据访问
Prisma Client（增Timescale扩展后仍可正常使用，时间序列操作用SQL raw）
鉴权
NextAuth + Email Provider（魔法链接），Auth.js Session/JWT；API校验bearer或cookies
校验与序列化
zod schemas，超时统一10s，错误统一包装
缓存策略
热点查询（places/flow）Redis缓存30-90秒
建议结果 user+day 级缓存至 suggestions_cache，TTL 2小时
队列
上报消费：汇总、异常检测、写入 place_stats 近似校准；BullMQ worker scripts/queues/*
地图与前端
Mapbox GL 控件；RSC服务端拉取数据，客户端订阅SSE
PWA离线：静态瓦片与最近查询结果IndexedDB缓存
十八、性能与可用性

分页与限流：搜索limit<=50；reports每设备5次/小时
N+1避免：批量加载预测与事件
低网场景：降级为列表、延迟加载地图
A11y：高对比度、字体放大、屏幕阅读器标签
十九、测试与质量

单元测试：zod schemas、算法模块
集成测试：API路线、SSE重连
E2E：Playwright关键用户流程
监控：SLA与SLO，错误率与p95响应时间看板
二十、字段与枚举约定

category: "gov_service" | "hospital" | "market" | "library" | "transit" | "other"
crowd_level: 1-5（1极低，5极高）
noise_level: 0-100
seat_occupancy: 0-100
status: "open" | "closed" | "paused"
match.status: "open" | "locked" | "done" | "cancelled"
附：典型请求/响应简例（节选）

GET /api/v1/places/search?q=政务&lat=31.23&lng=121.47&radius_m=3000
响应 data.items[0]: { id: "plc_123", name: "XX政务大厅", category: "gov_service", distance_m: 820, address: "XX路88号", open_now: true, wheelchair_accessible: true, score: 4.6 }
GET /api/v1/places/plc_123
响应 data: { id: "plc_123", name: "XX政务大厅", geo: { lat: 31.2305, lng: 121.4712 }, open_hours: { mon_fri: "09:00-17:00" }, current: { flow_index: 0.42, wait_minutes: 12, seat_occupancy: null, noise_level: 35, updated_at: "2025-10-15T08:20:00+08:00" }, forecast: [{ ts: "2025-10-15T09:00:00+08:00", wait_minutes: 10 }, { ts: "2025-10-15T10:00:00+08:00", wait_minutes: 18 }], events: [] }
POST /api/v1/reports
请求: { place_id: "plc_123", wait_minutes: 15, crowd_level: 4, ts: "2025-10-15T08:18:00+08:00" }
响应: { id: "rep_987", accepted: true, reward: { trust_delta: 0.3 } }
GET /api/v1/suggestions?city_id=shanghai&horizon_h=6
响应 items[0]: { place_id: "plc_123", place_name: "XX政务大厅", recommended_window: { start: "2025-10-15T11:20:00+08:00", end: "2025-10-15T12:10:00+08:00" }, expected_wait_minutes: 8, reasoning: "工作日午间错峰且天气阴", confidence: 0.71 }

下面给出可落地的一套初版实现材料，包含：

Prisma schema（含核心业务表、NextAuth 兼容表、索引建议）
数据库迁移 SQL（TimescaleDB/pg_trgm/PostGIS 扩展、hypertable、特殊索引）
种子数据（接入北京、上海两城市）
队列消费者（BullMQ）示例：众包上报聚合→实时发布更新
SSE 服务端与前端订阅示例
高德（AMap）地图/地点/路径接入建议与代码骨架
一、Prisma schema 初版（PostgreSQL + TimescaleDB 友好）
文件：prisma/schema.prisma

kotlin
复制代码
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  USER
  ADMIN
}

enum PlaceCategory {
  gov_service
  hospital
  market
  library
  transit
  other
}

model City {
  id        String   @id @default(cuid())
  name      String
  code      String   @unique // "beijing", "shanghai"
  tz        String
  bbox      Json?
  createdAt DateTime @default(now())

  places    Place[]
  safety    SafetySegment[]
  calendars Calendar[]

  @@index([name])
}

model User {
  id        String   @id @default(cuid())
  email     String?  @unique
  phone     String?  @unique
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  lastLogin DateTime?

  profile   UserProfile?
  devices   Device[]
  reports   Report[]
  matches   Match[]    @relation("UserMatches")
  matchMembers MatchMember[]
  auditLogs AuditLog[]

  // NextAuth
  accounts  Account[]
  sessions  Session[]
}

model UserProfile {
  userId          String  @id
  nickname        String?
  chronotype      String? // "morning" | "evening"
  mobilityNeeds   String? // "wheelchair" | "elderly" | etc.
  homeArea        Json?
  maxTravelMin    Int?    // preference
  notifyWindows   Json?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user            User    @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Device {
  id         String   @id @default(cuid())
  userId     String?
  user       User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  pushToken  String?
  platform   String   // "web" | "ios" | "android"
  lastSeen   DateTime @default(now())
  deviceHash String?  @unique
}

model Place {
  id          String   @id @default(cuid())
  cityId      String
  city        City     @relation(fields: [cityId], references: [id], onDelete: Cascade)

  name        String
  category    PlaceCategory
  address     String?
  lat         Decimal   @db.Decimal(10,7)
  lng         Decimal   @db.Decimal(10,7)
  // 可选：PostGIS 原生字段（通过迁移添加），Prisma 不直接操控：
  // geom Unsupported("geography(Point,4326)")?

  openHours   Json?     // { mon_fri: "09:00-17:00", ... }
  wheelchairAccessible Boolean @default(false)
  elevatorInfo Json?
  adminOwnerId String?
  score       Float?    // 搜索排序

  status      String    @default("open") // "open" | "closed" | "paused"
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  stats       PlaceStat[]
  reports     Report[]
  matches     Match[]
  events      Event[]

  @@index([cityId, category])
  @@index([lat, lng])
  @@index([status])
}

model PlaceStat {
  id          String   @id @default(cuid())
  placeId     String
  place       Place    @relation(fields: [placeId], references: [id], onDelete: Cascade)
  ts          DateTime

  flowIndex   Float?    // 0-1
  waitMinutes Int?
  seatOccupancy Int?
  noiseLevel  Int?

  // 用于 Timescale hypertable: (place_id, ts)
  @@index([placeId, ts])
  @@index([ts])
}

model Report {
  id           String   @id @default(cuid())
  userId       String?
  user         User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  placeId      String
  place        Place    @relation(fields: [placeId], references: [id], onDelete: Cascade)
  ts           DateTime @default(now())

  waitMinutes  Int?
  crowdLevel   Int?     // 1-5
  seatOccupancy Int?
  noiseLevel   Int?

  trustScore   Float?   // 在线评估
  deviceHash   String?

  createdAt    DateTime @default(now())

  @@index([placeId, ts])
  @@index([createdAt])
}

model SuggestionCache {
  id          String   @id @default(cuid())
  userId      String?
  user        User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  cityId      String?
  day         DateTime
  payloadJson Json
  expiresAt   DateTime

  @@index([userId, day])
  @@index([cityId, day])
  @@index([expiresAt])
}

model Match {
  id          String   @id @default(cuid())
  placeId     String
  place       Place    @relation(fields: [placeId], references: [id], onDelete: Cascade)
  startTime   DateTime
  status      String   @default("open") // open | locked | done | cancelled
  visibility  String   @default("public")
  createdById String
  createdBy   User     @relation("UserMatches", fields: [createdById], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())

  members     MatchMember[]

  @@index([placeId, startTime])
  @@index([status])
}

model MatchMember {
  id        String   @id @default(cuid())
  matchId   String
  userId    String
  status    String   @default("joined") // joined | left | kicked
  joinedAt  DateTime @default(now())

  match     Match    @relation(fields: [matchId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([matchId, userId])
  @@index([userId])
}

model SafetySegment {
  id          String   @id @default(cuid())
  cityId      String
  city        City     @relation(fields: [cityId], references: [id], onDelete: Cascade)
  // 线段几何建议用 PostGIS；Prisma 不原生支持，保留 GeoJSON/polyline 冗余
  polyline    String?  // encoded polyline
  geojson     Json?
  safetyScore Float    @default(0)
  lighting    Int?     // 0-100
  cctvDensity Int?
  wheelchairOk Boolean  @default(false)

  @@index([cityId])
  @@index([wheelchairOk])
}

model Event {
  id          String   @id @default(cuid())
  placeId     String
  place       Place    @relation(fields: [placeId], references: [id], onDelete: Cascade)
  startTime   DateTime
  endTime     DateTime
  title       String
  type        String
  source      String?

  @@index([placeId, startTime])
}

model Calendar {
  id          String   @id @default(cuid())
  cityId      String
  city        City     @relation(fields: [cityId], references: [id], onDelete: Cascade)
  payloadJson Json
  updatedAt   DateTime @default(now())

  @@index([cityId])
}

model AuditLog {
  id        String   @id @default(cuid())
  actorId   String?
  actor     User?    @relation(fields: [actorId], references: [id], onDelete: SetNull)
  action    String
  target    String?
  ts        DateTime @default(now())
  meta      Json?

  @@index([ts])
  @@index([actorId])
}

/***********************
 * NextAuth models
 ***********************/
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  @@unique([identifier, token])
}
二、数据库迁移 SQL（扩展与索引）
文件：prisma/migrations/20251015_init_ext/migration.sql

sql
复制代码
-- 扩展
CREATE EXTENSION IF NOT EXISTS timescaledb;
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 将 PlaceStat 转为 Timescale hypertable
-- 假设 prisma 创建了表 "PlaceStat"（区分大小写需要引号）
SELECT create_hypertable('"PlaceStat"', 'ts', chunk_time_interval => interval '1 day', if_not_exists => TRUE, migrate_data => TRUE);

-- trigram 索引（用于名称/地址搜索），需额外列：
-- Prisma 层面无法声明 GIN/trgm；直接原生索引
CREATE INDEX IF NOT EXISTS places_name_trgm ON "Place" USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS places_address_trgm ON "Place" USING GIN (address gin_trgm_ops);

-- PostGIS 地理索引（若你在 Place 表另建 geography(Point,4326) 列）
-- ALTER TABLE "Place" ADD COLUMN IF NOT EXISTS geom geography(Point,4326);
-- CREATE INDEX IF NOT EXISTS place_geom_gix ON "Place" USING GIST (geom);

-- 安全线段（若你在 SafetySegment 另建 geography(LineString,4326) 列）
-- ALTER TABLE "SafetySegment" ADD COLUMN IF NOT EXISTS geom geography(LineString,4326);
-- CREATE INDEX IF NOT EXISTS safety_geom_gix ON "SafetySegment" USING GIST (geom);

-- 近期 reports 加速索引（7天）
CREATE INDEX IF NOT EXISTS reports_recent_idx ON "Report"( "placeId", "ts") WHERE "ts" > now() - interval '7 days';
三、种子数据（北京、上海）
文件：prisma/seed.ts

php
复制代码
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // 北京
  const bj = await prisma.city.upsert({
    where: { code: 'beijing' },
    update: {},
    create: {
      name: '北京',
      code: 'beijing',
      tz: 'Asia/Shanghai',
      bbox: {
        type: 'Polygon',
        coordinates: [[[115.42,39.44],[117.51,39.44],[117.51,41.06],[115.42,41.06],[115.42,39.44]]]
      }
    }
  })

  // 上海
  const sh = await prisma.city.upsert({
    where: { code: 'shanghai' },
    update: {},
    create: {
      name: '上海',
      code: 'shanghai',
      tz: 'Asia/Shanghai',
      bbox: {
        type: 'Polygon',
        coordinates: [[[120.86,30.67],[122.12,30.67],[122.12,31.88],[120.86,31.88],[120.86,30.67]]]
      }
    }
  })

  console.log('Seeded cities:', bj.code, sh.code)
}

main().catch(e => {
  console.error(e)
  process.exit(1)
}).finally(async () => {
  await prisma.$disconnect()
})
四、队列消费者（BullMQ）示例：聚合上报→更新 PlaceStat→推送 SSE

队列初始化与类型 文件：lib/queues.ts
typescript
复制代码
import { Queue, Worker, QueueEvents, JobsOptions } from 'bullmq'
import IORedis from 'ioredis'

const connection = new IORedis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
})

export const reportIngestQueue = new Queue('report.ingest', { connection })
export const queueEvents = new QueueEvents('report.ingest', { connection })

export type ReportIngestJob = {
  reportId: string
}

export const defaultJobOpts: JobsOptions = {
  attempts: 3,
  backoff: { type: 'exponential', delay: 2000 },
  removeOnComplete: 1000,
  removeOnFail: 5000,
}
消费者：聚合与发布 文件：scripts/workers/reportAggregator.ts
typescript
复制代码
import 'dotenv/config'
import { Worker } from 'bullmq'
import IORedis from 'ioredis'
import { PrismaClient } from '@prisma/client'

const redis = new IORedis(process.env.REDIS_URL!, { maxRetriesPerRequest: null, enableReadyCheck: false })
const prisma = new PrismaClient()

// 简易 EWMA 参数
const ALPHA = 0.4

const worker = new Worker('report.ingest', async (job) => {
  const { reportId } = job.data as { reportId: string }

  const report = await prisma.report.findUnique({
    where: { id: reportId },
    include: { place: true }
  })
  if (!report) return

  // 拉近 2 小时内历史 stats 进行 EWMA
  const lastStat = await prisma.placeStat.findFirst({
    where: { placeId: report.placeId },
    orderBy: { ts: 'desc' }
  })

  let nextWait = report.waitMinutes ?? lastStat?.waitMinutes ?? null
  let nextFlow = null as number | null

  if (report.waitMinutes != null && lastStat?.waitMinutes != null) {
    nextWait = Math.round(ALPHA * report.waitMinutes + (1 - ALPHA) * lastStat.waitMinutes)
  }

  // 用 crowdLevel 粗估 flowIndex
  if (report.crowdLevel != null) {
    const mapped = Math.min(1, Math.max(0, (report.crowdLevel - 1) / 4))
    nextFlow = lastStat?.flowIndex != null
      ? Number((ALPHA * mapped + (1 - ALPHA) * lastStat.flowIndex).toFixed(2))
      : mapped
  } else {
    nextFlow = lastStat?.flowIndex ?? null
  }

  const now = new Date()
  const stat = await prisma.placeStat.create({
    data: {
      placeId: report.placeId,
      ts: now,
      waitMinutes: nextWait ?? undefined,
      flowIndex: nextFlow ?? undefined,
      seatOccupancy: report.seatOccupancy ?? undefined,
      noiseLevel: report.noiseLevel ?? undefined,
    }
  })

  // 更新简易信任分（示例：有历史则小幅调整）
  if (report.waitMinutes != null && lastStat?.waitMinutes != null) {
    const err = Math.abs(report.waitMinutes - lastStat.waitMinutes)
    const trustDelta = Math.max(-0.2, 0.5 - err / 30) // 误差越大扣分
    await prisma.report.update({
      where: { id: reportId },
      data: { trustScore: (report.trustScore ?? 0) + trustDelta }
    })
  }

  // 发布 SSE 更新
  const payload = JSON.stringify({
    place_id: report.placeId,
    flow_index: stat.flowIndex,
    wait_minutes: stat.waitMinutes,
    ts: stat.ts.toISOString()
  })
  await redis.publish('place_updates', payload)
}, {
  connection: redis,
  concurrency: 8
})

worker.on('completed', (job) => {
  console.log('Aggregated report', job.id)
})
worker.on('failed', (job, err) => {
  console.error('Report aggregation failed', job?.id, err)
})
生产任务（在接收上报处投递） 文件：app/api/v1/reports/route.ts 片段
php
复制代码
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { reportIngestQueue, defaultJobOpts } from '@/lib/queues'
import { z } from 'zod'

const BodySchema = z.object({
  place_id: z.string(),
  wait_minutes: z.number().int().min(0).max(180).optional(),
  crowd_level: z.number().int().min(1).max(5).optional(),
  seat_occupancy: z.number().int().min(0).max(100).optional(),
  noise_level: z.number().int().min(0).max(100).optional(),
  ts: z.string().datetime().optional(),
})

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => ({}))
  const body = BodySchema.safeParse(json)
  if (!body.success) {
    return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'invalid body', details: body.error.flatten() } }, { status: 400 })
  }

  const { place_id, wait_minutes, crowd_level, seat_occupancy, noise_level, ts } = body.data

  const rep = await prisma.report.create({
    data: {
      placeId: place_id,
      waitMinutes: wait_minutes ?? null,
      crowdLevel: crowd_level ?? null,
      seatOccupancy: seat_occupancy ?? null,
      noiseLevel: noise_level ?? null,
      ts: ts ? new Date(ts) : new Date(),
    }
  })

  await reportIngestQueue.add('ingest', { reportId: rep.id }, defaultJobOpts)

  return NextResponse.json({ id: rep.id, accepted: true })
}
五、SSE 服务端与前端订阅

服务端 SSE（Next.js Route Handler） 文件：app/api/v1/stream/places/route.ts
typescript
复制代码
import { NextRequest } from 'next/server'
import IORedis from 'ioredis'

export const runtime = 'nodejs' // SSE 需 Node runtime
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const ids = (searchParams.get('ids') || '').split(',').filter(Boolean)
  const redis = new IORedis(process.env.REDIS_URL!, { maxRetriesPerRequest: null, enableReadyCheck: false })

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()
      const send = (event: string, data: any) => {
        controller.enqueue(encoder.encode(`event: ${event}\n`))
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      // 心跳
      const heartbeat = setInterval(() => {
        send('ping', { t: Date.now() })
      }, 15000)

      const sub = new IORedis(process.env.REDIS_URL!, { maxRetriesPerRequest: null, enableReadyCheck: false })
      sub.subscribe('place_updates', (err) => {
        if (err) {
          send('error', { message: 'subscribe failed' })
        }
      })
      sub.on('message', (_channel, message) => {
        try {
          const payload = JSON.parse(message)
          // 可选过滤：仅转发指定 ids
          if (ids.length === 0 || ids.includes(payload.place_id)) {
            send('update', payload)
          }
        } catch {}
      })

      const close = () => {
        clearInterval(heartbeat)
        sub.disconnect()
        redis.disconnect()
        controller.close()
      }

      // @ts-ignore：Next 会在中断时调用
      req.signal?.addEventListener('abort', () => {
        close()
      })

      // 首包
      send('ready', { ok: true })
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // 反向代理禁缓冲
    }
  })
}
前端订阅示例（React 客户端组件）
typescript
复制代码
import { useEffect, useRef, useState } from 'react'

export function usePlaceSSE(ids?: string[]) {
  const [data, setData] = useState<any[]>([])
  const esRef = useRef<EventSource | null>(null)

  useEffect(() => {
    const params = new URLSearchParams()
    if (ids && ids.length) params.set('ids', ids.join(','))
    const es = new EventSource(`/api/v1/stream/places?${params.toString()}`)
    esRef.current = es

    es.addEventListener('update', (e: MessageEvent) => {
      try { setData(d => [...d, JSON.parse(e.data)]) } catch {}
    })
    es.addEventListener('ping', () => {})
    es.addEventListener('ready', () => {})

    es.onerror = () => {
      // 浏览器会自动重连；可在这里记录
    }

    return () => {
      es.close()
    }
  }, [ids?.join(',')])

  return data
}
六、高德（AMap）地图与接口接入建议

推荐策略（中国大陆优先级）
地图渲染：Web 端使用 AMap JS API v2（官方 SDK，合规使用其瓦片与控件）
地点搜索/逆地理/路径：AMap REST API
海外或需要开源渲染：MapLibre GL 作为备选（不使用高德瓦片，改用 MapTiler/Tianditu 合规源）
关键合规点
AMap key 绑定域名；JS SDK 的瓦片与数据不得通过第三方代理或离线缓存
需在页面显著处保留高德版权标识
如果有在华业务服务器，建议备案与合法展示域名
环境变量示例
makefile
复制代码
# .env
DATABASE_URL=postgresql://...
REDIS_URL=redis://:password@host:6379/0

# AMap
AMAP_WEB_KEY=your_amap_js_key          # JS SDK key（前端用）
AMAP_REST_KEY=your_amap_rest_key       # REST key（后端用）
AMAP_SECRET=optional_if_sign           # 可选签名
AMap REST 客户端（Node 端） 文件：lib/amap.ts
typescript
复制代码
import crypto from 'crypto'

const AMAP_BASE = 'https://restapi.amap.com'
const KEY = process.env.AMAP_REST_KEY!

function withSign(path: string, params: Record<string, string>) {
  // 如需数字签名（可选，部分接口支持），示例：
  // const query = new URLSearchParams({ ...params, key: KEY }).toString()
  // const raw = path + '?' + query + (process.env.AMAP_SECRET || '')
  // const sig = crypto.createHash('md5').update(raw).digest('hex')
  // return `${AMAP_BASE}${path}?${query}&sig=${sig}`
  const query = new URLSearchParams({ ...params, key: KEY }).toString()
  return `${AMAP_BASE}${path}?${query}`
}

export async function amapPlaceSearchText(city: string, keywords: string, page = 1) {
  const url = withSign('/v5/place/text', {
    city,
    keywords,
    page_size: '20',
    page_num: String(page),
  })
  const res = await fetch(url, { timeout: 8000 as any })
  if (!res.ok) throw new Error(`AMap error: ${res.status}`)
  return res.json()
}

export async function amapReverseGeocode(lat: number, lng: number) {
  const url = withSign('/v3/geocode/regeo', {
    location: `${lng},${lat}`,
    extensions: 'base'
  })
  const res = await fetch(url, { timeout: 8000 as any })
  if (!res.ok) throw new Error(`AMap error: ${res.status}`)
  return res.json()
}

export async function amapWalkingRoute(origin: [number, number], destination: [number, number]) {
  const url = withSign('/v3/direction/walking', {
    origin: `${origin[0]},${origin[1]}`,
    destination: `${destination[0]},${destination[1]}`,
  })
  const res = await fetch(url, { timeout: 8000 as any })
  if (!res.ok) throw new Error(`AMap error: ${res.status}`)
  return res.json()
}
使用 AMap 搜索接口落库（将高德 POI 同步为 Place） 文件：scripts/sync/seedPlacesFromAmap.ts（示例）
javascript
复制代码
import { PrismaClient, PlaceCategory } from '@prisma/client'
import { amapPlaceSearchText } from '@/lib/amap'

const prisma = new PrismaClient()

function inferCategory(types: string): PlaceCategory {
  if (types.includes('政府')) return 'gov_service'
  if (types.includes('医院')) return 'hospital'
  if (types.includes('市场') || types.includes('超市')) return 'market'
  if (types.includes('图书馆')) return 'library'
  return 'other'
}

async function ingestCity(cityCode: 'beijing' | 'shanghai', keyword: string) {
  const city = await prisma.city.findUniqueOrThrow({ where: { code: cityCode } })
  for (let page = 1; page <= 3; page++) {
    const data = await amapPlaceSearchText(cityCode === 'beijing' ? '北京市' : '上海市', keyword, page)
    const pois = data.pois || data.pois || data.pois // v5 返回字段为 pois / data.pois?（请按实际调试）
    const list = (data.pois || data.pois || []).map((p: any) => ({
      cityId: city.id,
      name: p.name,
      category: inferCategory(p.type || ''),
      address: p.address,
      lat: Number(p.location?.split(',')[1]),
      lng: Number(p.location?.split(',')[0]),
      openHours: {},
      wheelchairAccessible: false,
      score: 0.5
    }))
    for (const item of list) {
      if (Number.isFinite(item.lat) && Number.isFinite(item.lng)) {
        await prisma.place.create({ data: item })
      }
    }
  }
}

async function main() {
  await ingestCity('beijing', '政务服务中心')
  await ingestCity('shanghai', '政务服务中心')
  await ingestCity('beijing', '图书馆')
  await ingestCity('shanghai', '图书馆')
}

main().catch(console.error).finally(() => prisma.$disconnect())
前端地图渲染（AMap JS SDK 动态加载） 文件：components/AMapView.tsx
typescript
复制代码
'use client'
import { useEffect, useRef } from 'react'

export default function AMapView({ center = [121.47, 31.23], zoom = 12 }: { center?: [number, number], zoom?: number }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let map: any
    const loader = document.createElement('script')
    const key = process.env.NEXT_PUBLIC_AMAP_WEB_KEY
    loader.src = `https://webapi.amap.com/maps?v=2.0&key=${key}&plugin=AMap.ToolBar,AMap.Scale`
    loader.async = true
    loader.onload = () => {
      // @ts-ignore
      const AMap = window.AMap
      map = new AMap.Map(ref.current, {
        viewMode: '3D',
        zoom,
        center, // [lng, lat]
      })
      // 控件
      // @ts-ignore
      map.addControl(new AMap.ToolBar())
      // @ts-ignore
      map.addControl(new AMap.Scale())
    }
    document.body.appendChild(loader)

    return () => {
      if (map) map.destroy()
      document.body.removeChild(loader)
    }
  }, [center[0], center[1], zoom])

  return <div ref={ref} style={{ width: '100%', height: '100%' }} />
}
注意：AMap 要求使用 NEXT_PUBLIC_AMAP_WEB_KEY 暴露到前端，域名需在 Key 控制台配置。不要代理或缓存瓦片。

七、示例：安全路线 API（调用 AMap 步行路线 + 我方安全分段）
文件：app/api/v1/routes/safe/route.ts（骨架）

typescript
复制代码
import { NextRequest, NextResponse } from 'next/server'
import { amapWalkingRoute } from '@/lib/amap'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { origin, destination, mode } = body as {
    origin: { lat: number, lng: number },
    destination: { lat: number, lng: number },
    mode?: 'walk' | 'wheelchair'
  }
  if (!origin || !destination) {
    return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'origin/destination required' } }, { status: 400 })
  }

  const route = await amapWalkingRoute([origin.lng, origin.lat], [destination.lng, destination.lat])

  // 简化：评分（匹配我们的 SafetySegment）
  // 实际可将 AMap 路径拆段，与 SafetySegment（PostGIS）做空间相交，计算平均安全分与可达性
  const safetyScore = 0.7
  const segments = [{
    safety_score: 0.7, lighting: 60, wheelchair_ok: mode === 'wheelchair' ? true : false
  }]

  return NextResponse.json({
    distance_m: Number(route?.route?.paths?.[0]?.distance ?? 0),
    duration_min: Math.round((Number(route?.route?.paths?.[0]?.duration ?? 0) / 60)),
    polyline: route?.route?.paths?.[0]?.steps?.map((s: any) => s.polyline).join(';') || '',
    safety_score: safetyScore,
    segments
  })
}
八、Redis 发布订阅在前述消费者中已演示；如需在其他进程发布，也可：

php
复制代码
import IORedis from 'ioredis'
const pub = new IORedis(process.env.REDIS_URL!)
pub.publish('place_updates', JSON.stringify({ place_id: 'plc_x', flow_index: 0.5, wait_minutes: 10, ts: new Date().toISOString() }))
九、Prisma Client 封装
文件：lib/prisma.ts

typescript
复制代码
import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

export const prisma = global.prisma || new PrismaClient({ log: ['error', 'warn'] })

if (process.env.NODE_ENV !== 'production') global.prisma = prisma
十、地图接口选择建议（快速对比）

AMap（高德）：大陆合规最佳，POI/路径/逆地理全面；JS SDK 商用需遵循授权与标注，不可代理瓦片；离线能力弱。
Tencent Map：同类能力，可作为备选；也要求域名绑定与合规使用。
Mapbox/MapTiler + MapLibre：国际化优秀、矢量定制强；在大陆网络可能存在可用性与合规问题，不建议覆盖主流用户。
方案：主用 AMap（国内域名、备案、Key 绑定），如需海外访问则在运行时检测 IP/区域切换到 MapLibre + MapTiler。
十一、把以上拼起来的最小步骤

配置 Postgres 并启用 TimescaleDB、PostGIS、pg_trgm；执行 Prisma migrate，再执行额外 SQL 迁移。
运行 prisma db seed 写入北京、上海。
配置 Redis；启动 reportAggregator worker（独立 node 进程）。
在 /api/v1/reports 接口投递上报，观察 worker 将聚合并通过 Redis 发布；前端使用 SSE hook 接收更新。
前端地图用 AMapView 组件展示地图，叠加你自己的点位与热力层。

下面提供三部分内容：

AMap 点位覆盖层：Markers、MarkerClusterer 自定义渲染、CustomLayer（Canvas）与热力图使用示例（React 客户端组件）
完整的 Next.js App Router 路由目录建议（MVP）
常用接口的 zod 校验片段与路由骨架
一、AMap 覆盖层组件示例（JS API v2）
前提

前端环境变量：NEXT_PUBLIC_AMAP_WEB_KEY=你的高德JS Key
动态加载 SDK：包含插件 AMap.ToolBar, AMap.Scale, AMap.MarkerClusterer, AMap.HeatMap
基础地图容器（复用） 文件：components/AMapContainer.tsx
typescript
复制代码
'use client'
import { useEffect, useRef } from 'react'

type Props = {
  center?: [number, number] // [lng, lat]
  zoom?: number
  onReady?: (AMap: any, map: any) => void
  plugins?: string[] // 如 ["AMap.ToolBar","AMap.Scale","AMap.MarkerClusterer","AMap.HeatMap"]
}

export default function AMapContainer({ center = [121.47, 31.23], zoom = 12, onReady, plugins = [] }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let map: any
    const script = document.createElement('script')
    const key = process.env.NEXT_PUBLIC_AMAP_WEB_KEY
    const pluginStr = plugins.length ? `&plugin=${plugins.join(',')}` : ''
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${key}${pluginStr}`
    script.async = true
    script.onload = () => {
      // @ts-ignore
      const AMap = (window as any).AMap
      map = new AMap.Map(ref.current, {
        viewMode: '3D',
        center,
        zoom,
      })
      if (plugins.includes('AMap.ToolBar')) {
        // @ts-ignore
        map.addControl(new AMap.ToolBar())
      }
      if (plugins.includes('AMap.Scale')) {
        // @ts-ignore
        map.addControl(new AMap.Scale())
      }
      onReady?.(AMap, map)
    }
    document.body.appendChild(script)
    return () => {
      if (map) map.destroy()
      document.body.removeChild(script)
    }
  }, [center[0], center[1], zoom, plugins.join(',')])

  return <div ref={ref} style={{ width: '100%', height: '100%' }} />
}
Markers 与聚合（自定义渲染） 文件：components/AMapMarkers.tsx
typescript
复制代码
'use client'
import { useEffect, useState } from 'react'
import AMapContainer from './AMapContainer'

type Place = {
  id: string
  name: string
  category: 'gov_service'|'hospital'|'market'|'library'|'transit'|'other'
  lng: number
  lat: number
  flowIndex?: number | null
  waitMinutes?: number | null
}

export default function AMapMarkers({ places, onClickPlace }: { places: Place[], onClickPlace?: (id: string) => void }) {
  const [ready, setReady] = useState<{ AMap: any, map: any } | null>(null)

  useEffect(() => {
    if (!ready) return
    const { AMap, map } = ready

    // 清理旧覆盖物
    map.clearMap()

    // 创建 Marker
    const markers = places.map(p => {
      // 自定义 icon（根据拥挤度/类别）
      const color = p.flowIndex != null
        ? p.flowIndex < 0.33 ? '#46c36f' : p.flowIndex < 0.66 ? '#f5a623' : '#d0021b'
        : '#3f7cff'
      const content = `
        <div style="
          transform: translate(-50%,-100%);
          background: ${color};
          color:#fff;
          padding:4px 6px;
          border-radius:6px;
          font-size:12px;
          box-shadow:0 1px 4px rgba(0,0,0,0.3);
          white-space:nowrap;
        ">
          ${p.name.replace(/(.{10}).*/, '$1…')}
        </div>
      `
      // @ts-ignore
      const marker = new AMap.Marker({
        position: [p.lng, p.lat],
        title: p.name,
        content,
        offset: new AMap.Pixel(0, 0),
        extData: { id: p.id }
      })
      marker.on('click', () => onClickPlace?.(p.id))
      return marker
    })

    // 聚合（可选）
    // @ts-ignore
    const cluster = new AMap.MarkerClusterer(map, markers, {
      gridSize: 80,
      renderClusterMarker: (context: any) => {
        const count = context.count
        const size = count < 10 ? 30 : count < 50 ? 40 : 50
        const color = count < 10 ? '#46c36f' : count < 50 ? '#f5a623' : '#d0021b'
        const div = document.createElement('div')
        div.style.cssText = `
          width:${size}px;height:${size}px;border-radius:50%;
          background:${color};color:#fff;display:flex;align-items:center;justify-content:center;
          box-shadow:0 2px 6px rgba(0,0,0,.3);font-size:12px;
        `
        div.innerText = String(count)
        context.marker.setContent(div)
        context.marker.setOffset(new AMap.Pixel(-size/2, -size/2))
      }
    })

    return () => {
      cluster?.setMap(null)
    }
  }, [places, ready?.map])

  return (
    <AMapContainer
      plugins={['AMap.ToolBar','AMap.Scale','AMap.MarkerClusterer']}
      onReady={(AMap, map) => setReady({ AMap, map })}
    />
  )
}
Canvas CustomLayer（高性能自绘热点/覆盖） 文件：components/AMapCustomLayer.tsx
typescript
复制代码
'use client'
import { useEffect, useState } from 'react'
import AMapContainer from './AMapContainer'

type Dot = { lng: number, lat: number, weight?: number }

export default function AMapCustomLayer({ dots }: { dots: Dot[] }) {
  const [ctx, setCtx] = useState<{ AMap: any, map: any } | null>(null)

  useEffect(() => {
    if (!ctx) return
    const { AMap, map } = ctx

    const canvas = document.createElement('canvas')
    const dpr = window.devicePixelRatio || 1
    const size = map.getSize()
    canvas.width = size.getWidth() * dpr
    canvas.height = size.getHeight() * dpr
    canvas.style.width = size.getWidth() + 'px'
    canvas.style.height = size.getHeight() + 'px'

    const gl = canvas.getContext('2d')!

    // 自定义绘制函数
    const draw = () => {
      gl.clearRect(0, 0, canvas.width, canvas.height)
      gl.globalAlpha = 0.85
      dots.forEach(pt => {
        const pixel = map.lngLatToContainer(new AMap.LngLat(pt.lng, pt.lat))
        const x = pixel.getX() * dpr
        const y = pixel.getY() * dpr
        const r = 6 + (pt.weight || 0) * 4
        const grad = gl.createRadialGradient(x, y, 0, x, y, r)
        grad.addColorStop(0, 'rgba(255,0,0,0.8)')
        grad.addColorStop(1, 'rgba(255,0,0,0)')
        gl.fillStyle = grad
        gl.beginPath()
        gl.arc(x, y, r, 0, Math.PI * 2)
        gl.fill()
      })
    }

    // @ts-ignore
    const layer = new AMap.CustomLayer(canvas, {
      zooms: [3, 20],
      alwaysRender: true,
      zIndex: 120
    })

    layer.render = draw
    map.add(layer)

    const onResize = () => {
      const size = map.getSize()
      canvas.width = size.getWidth() * dpr
      canvas.height = size.getHeight() * dpr
      canvas.style.width = size.getWidth() + 'px'
      canvas.style.height = size.getHeight() + 'px'
      draw()
    }
    map.on('zoomchange', draw)
    map.on('moveend', draw)
    window.addEventListener('resize', onResize)

    draw()

    return () => {
      window.removeEventListener('resize', onResize)
      map.off('zoomchange', draw)
      map.off('moveend', draw)
      layer.setMap(null)
    }
  }, [ctx, dots])

  return (
    <AMapContainer
      plugins={['AMap.ToolBar','AMap.Scale']}
      onReady={(AMap, map) => setCtx({ AMap, map })}
    />
  )
}
AMap 原生热力图插件（AMap.HeatMap） 文件：components/AMapHeatmap.tsx
typescript
复制代码
'use client'
import { useEffect, useState } from 'react'
import AMapContainer from './AMapContainer'

type HeatPoint = { lng: number, lat: number, count: number }

export default function AMapHeatmap({ points, max = 100 }: { points: HeatPoint[], max?: number }) {
  const [ctx, setCtx] = useState<{ AMap: any, map: any } | null>(null)

  useEffect(() => {
    if (!ctx) return
    const { AMap, map } = ctx
    // @ts-ignore
    const heatmap = new AMap.HeatMap(map, {
      radius: 25, // 半径
      opacity: [0, 0.9],
      zIndex: 110
    })
    heatmap.setDataSet({
      data: points.map(p => ({ lng: p.lng, lat: p.lat, count: p.count })),
      max
    })

    return () => {
      // @ts-ignore
      heatmap?.setMap && heatmap.setMap(null)
    }
  }, [ctx, points, max])

  return (
    <AMapContainer
      plugins={['AMap.ToolBar','AMap.Scale','AMap.HeatMap']}
      onReady={(AMap, map) => setCtx({ AMap, map })}
    />
  )
}
组合使用示例（地图 + 聚合点 + 热力） 文件：app/(map)/page.tsx
typescript
复制代码
'use client'
import { useMemo, useState } from 'react'
import AMapMarkers from '@/components/AMapMarkers'
import AMapHeatmap from '@/components/AMapHeatmap'

export default function MapPage() {
  const [places] = useState([
    { id: 'a', name: '政务大厅A', category: 'gov_service', lng: 116.391, lat: 39.907, flowIndex: 0.2 },
    { id: 'b', name: '图书馆B', category: 'library', lng: 121.474, lat: 31.231, flowIndex: 0.7 },
  ] as any)

  const heatPoints = useMemo(() => places.map((p: any) => ({
    lng: p.lng, lat: p.lat, count: Math.round((p.flowIndex ?? 0.5) * 100)
  })), [places])

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', height: '100vh' }}>
      <div>
        <AMapMarkers places={places} onClickPlace={(id) => console.log('clicked', id)} />
      </div>
      <div>
        <AMapHeatmap points={heatPoints} />
      </div>
    </div>
  )
}
二、Next.js App Router 路由目录结构（MVP建议）

app/
api/
v1/
places/
search/route.ts
[id]/route.ts
flow/route.ts
reports/route.ts
stream/
places/route.ts
suggestions/route.ts
tasks/
attach/route.ts
match/
route.ts
[id]/
join/route.ts
leave/route.ts
routes/
safe/route.ts
calendar/route.ts
me/route.ts
me/
preferences/route.ts
notifications/
register/route.ts
admin/
reports/
flagged/route.ts
places/
[id]/route.ts
(其他页面模块)
(map)/page.tsx
(places)/[id]/page.tsx
(suggestions)/page.tsx
lib/
prisma.ts
queues.ts
amap.ts
schemas.ts
scripts/
workers/
reportAggregator.ts
sync/
seedPlacesFromAmap.ts
三、zod 校验片段与路由骨架
文件：lib/schemas.ts

css
复制代码
import { z } from 'zod'

export const CategoryEnum = z.enum(['gov_service','hospital','market','library','transit','other'])

export const PlaceSearchQuerySchema = z.object({
  q: z.string().trim().optional(),
  category: CategoryEnum.optional(),
  city_id: z.string().min(2),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  radius_m: z.coerce.number().min(100).max(10000).default(3000),
  limit: z.coerce.number().min(1).max(50).default(20),
})

export const PlaceIdParamSchema = z.object({
  id: z.string().min(1),
})

export const FlowQuerySchema = z.object({
  city_id: z.string(),
  horizon_min: z.coerce.number().optional().default(0).refine(v => [0,30,60,120].includes(v), 'horizon_min must be 0|30|60|120'),
  bbox: z
    .string()
    .optional()
    // 格式: "minLng,minLat,maxLng,maxLat"
    .refine(s => !s || s.split(',').length === 4, 'bbox must have 4 numbers'),
})

export const ReportBodySchema = z.object({
  place_id: z.string(),
  wait_minutes: z.number().int().min(0).max(180).optional(),
  crowd_level: z.number().int().min(1).max(5).optional(),
  seat_occupancy: z.number().int().min(0).max(100).optional(),
  noise_level: z.number().int().min(0).max(100).optional(),
  ts: z.string().datetime().optional(),
})

export const SuggestionsQuerySchema = z.object({
  city_id: z.string(),
  tasks: z.string().optional(), // csv
  horizon_h: z.coerce.number().min(1).max(24).default(6)
})

export const TaskAttachBodySchema = z.object({
  place_id: z.string(),
  title: z.string().min(1),
  date: z.string().datetime(),
  preferred_window: z.object({
    start: z.string().datetime(),
    end: z.string().datetime()
  }).optional()
})

export const MatchCreateBodySchema = z.object({
  place_id: z.string(),
  start_time: z.string().datetime(),
  visibility: z.enum(['public','private']).default('public')
})

export const SafeRouteBodySchema = z.object({
  origin: z.object({ lat: z.number(), lng: z.number() }),
  destination: z.object({ lat: z.number(), lng: z.number() }),
  mode: z.enum(['walk','wheelchair']).optional()
})

export const PreferencesPatchSchema = z.object({
  chronotype: z.enum(['morning','evening']).optional(),
  mobility_needs: z.string().optional(),
  max_travel_min: z.number().int().min(5).max(180).optional(),
  notify_windows: z.array(z.object({ start: z.string().datetime(), end: z.string().datetime() })).optional()
})

export const SSEIdsQuerySchema = z.object({
  ids: z.string().optional() // comma separated
})
路由骨架示例

GET /api/v1/places/search 文件：app/api/v1/places/search/route.ts
php
复制代码
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PlaceSearchQuerySchema } from '@/lib/schemas'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const parsed = PlaceSearchQuerySchema.safeParse(Object.fromEntries(searchParams.entries()))
  if (!parsed.success) {
    return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'invalid query', details: parsed.error.flatten() } }, { status: 400 })
  }
  const { q, category, city_id, lat, lng, radius_m, limit } = parsed.data

  // 简化：按城市+类别+名称搜索
  const where: any = { cityId: (await prisma.city.findFirst({ where: { code: city_id } }))?.id }
  if (category) where.category = category
  if (q) where.OR = [{ name: { contains: q } }, { address: { contains: q } }]

  const items = await prisma.place.findMany({
    where,
    take: limit,
    orderBy: [{ score: 'desc' }, { name: 'asc' }],
    select: {
      id: true, name: true, category: true, address: true,
      lat: true, lng: true, wheelchairAccessible: true, status: true, score: true
    }
  })

  // 计算距离（如提供经纬度）
  const res = items.map(p => {
    let distance_m: number | undefined
    if (lat != null && lng != null) {
      const R = 6371000
      const toRad = (d: number) => d * Math.PI / 180
      const dLat = toRad(Number(p.lat) - lat)
      const dLng = toRad(Number(p.lng) - lng)
      const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat))*Math.cos(toRad(Number(p.lat)))*Math.sin(dLng/2)**2
      distance_m = Math.round(2 * R * Math.asin(Math.sqrt(a)))
    }
    return { id: p.id, name: p.name, category: p.category, address: p.address, distance_m, open_now: p.status === 'open', wheelchair_accessible: p.wheelchairAccessible, score: p.score }
  })

  return NextResponse.json({ items: res })
}
POST /api/v1/reports 文件：app/api/v1/reports/route.ts
php
复制代码
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ReportBodySchema } from '@/lib/schemas'
import { reportIngestQueue, defaultJobOpts } from '@/lib/queues'

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => ({}))
  const parsed = ReportBodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'invalid body', details: parsed.error.flatten() } }, { status: 400 })
  }
  const { place_id, wait_minutes, crowd_level, seat_occupancy, noise_level, ts } = parsed.data

  const rep = await prisma.report.create({
    data: {
      placeId: place_id,
      waitMinutes: wait_minutes ?? null,
      crowdLevel: crowd_level ?? null,
      seatOccupancy: seat_occupancy ?? null,
      noiseLevel: noise_level ?? null,
      ts: ts ? new Date(ts) : new Date(),
    }
  })

  await reportIngestQueue.add('ingest', { reportId: rep.id }, defaultJobOpts)

  return NextResponse.json({ id: rep.id, accepted: true })
}
SSE 服务端 文件：app/api/v1/stream/places/route.ts
typescript
复制代码
import { NextRequest } from 'next/server'
import IORedis from 'ioredis'
import { SSEIdsQuerySchema } from '@/lib/schemas'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const parsed = SSEIdsQuerySchema.safeParse(Object.fromEntries(searchParams.entries()))
  const ids = parsed.success && parsed.data.ids ? parsed.data.ids.split(',').filter(Boolean) : []

  const sub = new IORedis(process.env.REDIS_URL!, { maxRetriesPerRequest: null, enableReadyCheck: false })

  const stream = new ReadableStream({
    start(controller) {
      const enc = new TextEncoder()
      const send = (event: string, data: any) => {
        controller.enqueue(enc.encode(`event: ${event}\n`))
        controller.enqueue(enc.encode(`data: ${JSON.stringify(data)}\n\n`))
      }
      const heartbeat = setInterval(() => send('ping', { t: Date.now() }), 15000)

      sub.subscribe('place_updates')
      sub.on('message', (_ch, msg) => {
        try {
          const payload = JSON.parse(msg)
          if (!ids.length || ids.includes(payload.place_id)) send('update', payload)
        } catch {}
      })

      // @ts-ignore
      req.signal?.addEventListener('abort', () => {
        clearInterval(heartbeat)
        sub.disconnect()
        controller.close()
      })

      send('ready', { ok: true })
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    }
  })
}
安全路线 文件：app/api/v1/routes/safe/route.ts
javascript
复制代码
import { NextRequest, NextResponse } from 'next/server'
import { SafeRouteBodySchema } from '@/lib/schemas'
import { amapWalkingRoute } from '@/lib/amap'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => ({}))
  const parsed = SafeRouteBodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'invalid body', details: parsed.error.flatten() } }, { status: 400 })
  }
  const { origin, destination, mode } = parsed.data
  const route = await amapWalkingRoute([origin.lng, origin.lat], [destination.lng, destination.lat])

  const distance = Number(route?.route?.paths?.[0]?.distance ?? 0)
  const duration = Number(route?.route?.paths?.[0]?.duration ?? 0)
  const polyline = route?.route?.paths?.[0]?.steps?.map((s: any) => s.polyline).join(';') || ''

  // 示例自定义安全分
  const safety_score = mode === 'wheelchair' ? 0.75 : 0.7

  return NextResponse.json({
    distance_m: distance,
    duration_min: Math.round(duration / 60),
    polyline,
    safety_score,
    segments: [{ safety_score, lighting: 60, wheelchair_ok: mode === 'wheelchair' }]
  })
}
注意事项

AMap.HeatMap 与 MarkerClusterer 需在 SDK加载时通过 plugin 参数启用。
CustomLayer不需要额外插件，但需使用 v2 API 的 AMap.CustomLayer 构造器。
聚合层里渲染函数需避免频繁重排；尽量复用 DOM。
热力图数据最大值 max 影响色带；合理设置以便用户感知拥挤等级。
高德地图需保持版权标识，不要代理或缓存瓦片。