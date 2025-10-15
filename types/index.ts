// 场所相关类型
export interface Place {
  id: string;
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  category: PlaceCategory;
  currentStatus: PlaceStatus;
  waitTime: number; // 分钟
  crowdLevel: CrowdLevel;
  noiseLevel: NoiseLevel;
  accessibility: AccessibilityInfo;
  openHours: OpenHours;
}

export interface PlaceStatus {
  isOpen: boolean;
  queueLength: number;
  estimatedWaitTime: number;
  lastUpdated: Date;
  crowdDensity: number; // 0-1
}

export interface AccessibilityInfo {
  wheelchairAccessible: boolean;
  hasElevator: boolean;
  hasRamp: boolean;
  hasAccessibleParking: boolean;
  hasAccessibleRestroom: boolean;
}

export interface OpenHours {
  monday: TimeSlot[];
  tuesday: TimeSlot[];
  wednesday: TimeSlot[];
  thursday: TimeSlot[];
  friday: TimeSlot[];
  saturday: TimeSlot[];
  sunday: TimeSlot[];
}

export interface TimeSlot {
  open: string; // HH:mm 格式
  close: string; // HH:mm 格式
}

// 枚举类型
export enum PlaceCategory {
  RESTAURANT = 'restaurant',
  HOSPITAL = 'hospital',
  BANK = 'bank',
  GOVERNMENT = 'government',
  SHOPPING = 'shopping',
  TRANSPORT = 'transport',
  EDUCATION = 'education',
  ENTERTAINMENT = 'entertainment',
  OTHER = 'other'
}

export enum CrowdLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very_high'
}

export enum NoiseLevel {
  QUIET = 'quiet',
  MODERATE = 'moderate',
  LOUD = 'loud',
  VERY_LOUD = 'very_loud'
}

// 用户相关类型
export interface User {
  id: string;
  name: string;
  avatar?: string;
  preferences: UserPreferences;
  location?: Coordinates;
}

export interface UserPreferences {
  preferredCrowdLevel: CrowdLevel;
  maxWaitTime: number;
  accessibilityNeeds: AccessibilityInfo;
  preferredTimeSlots: TimeSlot[];
  avoidNoiseLevel: NoiseLevel[];
}

export interface Coordinates {
  lat: number;
  lng: number;
}

// 建议相关类型
export interface Suggestion {
  id: string;
  placeId: string;
  place: Place;
  recommendedTime: Date;
  reason: string;
  confidence: number; // 0-1
  estimatedWaitTime: number;
  estimatedCrowdLevel: CrowdLevel;
  alternativeOptions: AlternativeOption[];
}

export interface AlternativeOption {
  placeId: string;
  place: Place;
  recommendedTime: Date;
  waitTime: number;
  crowdLevel: CrowdLevel;
}

// 上报相关类型
export interface Report {
  id: string;
  userId: string;
  placeId: string;
  place?: Place;
  reportType: ReportType;
  data: ReportData;
  timestamp: Date;
  verified: boolean;
  confidence: number; // 0-1 置信度
  location?: Coordinates; // 上报时的用户位置
  photos?: string[]; // 照片URLs
  status: ReportStatus;
}

export enum ReportType {
  QUICK = 'quick', // 快速上报
  DETAILED = 'detailed', // 详细上报
  WAIT_TIME = 'wait_time',
  CROWD_LEVEL = 'crowd_level',
  NOISE_LEVEL = 'noise_level',
  ACCESSIBILITY = 'accessibility',
  HOURS = 'hours',
  SERVICE_QUALITY = 'service_quality',
  SPECIAL_STATUS = 'special_status', // 临时关闭、维修等
  OTHER = 'other'
}

export interface ReportData {
  waitTime?: number;
  crowdLevel?: CrowdLevel;
  noiseLevel?: NoiseLevel;
  isOpen?: boolean;
  accessibilityIssue?: string;
  notes?: string;
}

// 匹配相关类型
export interface MatchRequest {
  id: string;
  userId: string;
  placeId: string;
  preferredTime: Date;
  maxWaitTime: number;
  message?: string;
  status: MatchStatus;
}

export interface Match {
  id: string;
  users: User[];
  place: Place;
  scheduledTime: Date;
  status: MatchStatus;
  chatRoomId?: string;
}

export enum MatchStatus {
  PENDING = 'pending',
  MATCHED = 'matched',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired'
}

// 计划同行相关类型
export interface PlannedMatch {
  id: string;
  organizer: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    completedMatches: number;
  };
  place: Place;
  plannedTime: Date;
  maxParticipants: number;
  currentParticipants: number;
  description: string;
  tags: string[];
  requirements: {
    ageRange?: { min: number; max: number };
    genderPreference?: 'male' | 'female' | 'any';
    interests: string[];
  };
  status: 'active' | 'full' | 'cancelled' | 'completed';
  createdAt: Date;
  participants: Array<{
    id: string;
    name: string;
    avatar: string;
    joinedAt: Date;
  }>;
  viewCount: number;
  likeCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
}

// 路线相关类型
export interface Route {
  id: string;
  origin: Coordinates;
  destination: Coordinates;
  waypoints: Waypoint[];
  duration: number; // 分钟
  distance: number; // 米
  accessibility: RouteAccessibility;
  safetyScore: number; // 0-1
  trafficLevel: TrafficLevel;
}

export interface Waypoint {
  coordinates: Coordinates;
  name: string;
  type: WaypointType;
  estimatedTime: number; // 到达此点的预计时间（分钟）
}

export enum WaypointType {
  STOP = 'stop',
  LANDMARK = 'landmark',
  SAFETY_POINT = 'safety_point',
  ACCESSIBILITY_POINT = 'accessibility_point'
}

export interface RouteAccessibility {
  hasStairs: boolean;
  hasEscalator: boolean;
  hasElevator: boolean;
  hasSidewalk: boolean;
  sidewalkQuality: SidewalkQuality;
  lightingQuality: LightingQuality;
}

export enum SidewalkQuality {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor'
}

export enum LightingQuality {
  WELL_LIT = 'well_lit',
  ADEQUATELY_LIT = 'adequately_lit',
  POORLY_LIT = 'poorly_lit',
  NO_LIGHTING = 'no_lighting'
}

export enum TrafficLevel {
  LIGHT = 'light',
  MODERATE = 'moderate',
  HEAVY = 'heavy',
  SEVERE = 'severe'
}

// API 响应类型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// 热图相关类型
export interface HeatmapData {
  coordinates: Coordinates;
  intensity: number; // 0-1
  timestamp: Date;
}

export interface HeatmapLayer {
  id: string;
  name: string;
  data: HeatmapData[];
  type: HeatmapType;
  visible: boolean;
  opacity: number; // 0-1
}

export enum HeatmapType {
  CROWD = 'crowd',
  WAIT_TIME = 'wait_time',
  NOISE = 'noise',
  TRAFFIC = 'traffic'
}
// 扩展的上报相关类型
export enum ReportStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

// 扩展匹配相关类型
export interface MatchPreferences {
  maxDistance: number; // 最大距离（米）
  ageRange?: { min: number; max: number };
  genderPreference?: 'male' | 'female' | 'any';
  groupSizePreference: number; // 希望的组队人数
  interests: string[];
  safetyLevel: 'low' | 'medium' | 'high';
}

export interface CompanionRequest {
  id: string;
  userId: string;
  user: User;
  placeId: string;
  place: Place;
  preferredTime: Date;
  flexibleTime: number; // 时间灵活度（分钟）
  maxWaitTime: number;
  message?: string;
  preferences: MatchPreferences;
  status: MatchStatus;
  createdAt: Date;
  expiresAt: Date;
}

export interface CompanionMatch {
  id: string;
  requestId: string;
  users: User[];
  place: Place;
  scheduledTime: Date;
  meetingPoint?: Coordinates;
  status: MatchStatus;
  chatRoomId?: string;
  createdAt: Date;
  completedAt?: Date;
  rating?: number;
  feedback?: string;
}

export interface ChatMessage {
  id: string;
  chatRoomId: string;
  userId: string;
  user: User;
  content: string;
  type: 'text' | 'location' | 'system';
  timestamp: Date;
  readBy: string[]; // 已读用户ID列表
}

export interface ChatRoom {
  id: string;
  matchId: string;
  participants: User[];
  messages: ChatMessage[];
  isActive: boolean;
  createdAt: Date;
  lastActivity: Date;
}

export interface LocationShare {
  id: string;
  userId: string;
  matchId: string;
  coordinates: Coordinates;
  accuracy: number;
  timestamp: Date;
  isActive: boolean;
}

export interface SafetyReport {
  id: string;
  reporterId: string;
  targetUserId?: string;
  matchId?: string;
  reason: string;
  description: string;
  evidence?: string[];
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  createdAt: Date;
}

export interface UserReputation {
  userId: string;
  score: number; // 0-100
  totalMatches: number;
  completedMatches: number;
  cancelledMatches: number;
  averageRating: number;
  recentReviews: UserReview[];
  lastUpdated: Date;
}

export interface UserReview {
  id: string;
  matchId: string;
  reviewerId: string;
  targetUserId: string;
  rating: number; // 1-5
  comment?: string;
  categories: {
    punctuality: number;
    communication: number;
    safety: number;
    friendliness: number;
  };
  createdAt: Date;
}

export enum WaitTimeRange {
  NONE = 'none', // 无需等待
  SHORT = 'short', // 1-5分钟
  MEDIUM = 'medium', // 5-15分钟
  LONG = 'long', // 15-30分钟
  VERY_LONG = 'very_long' // 30分钟以上
}

export interface ServiceQuality {
  attitude: number; // 1-5 服务态度
  efficiency: number; // 1-5 服务效率
  environment: number; // 1-5 环境质量
}

export enum SpecialStatus {
  TEMPORARILY_CLOSED = 'temporarily_closed',
  UNDER_MAINTENANCE = 'under_maintenance',
  SPECIAL_EVENT = 'special_event',
  LIMITED_SERVICE = 'limited_service',
  NORMAL = 'normal'
}

// 扩展的上报数据接口
export interface ExtendedReportData extends ReportData {
  // 服务质量
  serviceQuality?: ServiceQuality;
  
  // 特殊状态
  specialStatus?: SpecialStatus;
  
  // 等待时间范围
  waitTimeRange?: WaitTimeRange;
  
  // 无障碍评分
  accessibilityRating?: number; // 1-5
  
  // 推荐度
  recommendation?: number; // 1-5
}

// 上报表单相关类型
export interface ReportFormData {
  placeId: string;
  reportType: ReportType;
  data: Partial<ExtendedReportData>;
  photos?: File[];
}

// 用户上报历史
export interface UserReportHistory {
  userId: string;
  reports: Report[];
  totalReports: number;
  verifiedReports: number;
  reputationScore: number; // 信誉分
  badges: UserBadge[];
  lastReportTime?: Date;
}

export interface UserBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
  type: BadgeType;
}

export enum BadgeType {
  REPORTER = 'reporter', // 上报者徽章
  ACCURACY = 'accuracy', // 准确性徽章
  FREQUENCY = 'frequency', // 活跃度徽章
  SPECIAL = 'special' // 特殊徽章
}

// 位置检测相关
export interface LocationDetectionResult {
  coordinates: Coordinates;
  accuracy: number;
  nearbyPlaces: Place[];
  suggestedPlace?: Place;
  timestamp: Date;
}

// 上报状态统计
export interface ReportStats {
  totalReports: number;
  todayReports: number;
  verifiedReports: number;
  pendingReports: number;
  userRanking: number;
  reputationScore: number;
}