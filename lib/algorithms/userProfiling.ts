import { User, Place, PlaceCategory, CrowdLevel, Report, Suggestion } from '@/types';

export interface UserProfile {
  userId: string;
  preferences: UserPreferenceProfile;
  behaviors: UserBehaviorProfile;
  patterns: UserPatternProfile;
  lastUpdated: Date;
}

export interface UserPreferenceProfile {
  preferredCategories: PlaceCategory[];
  preferredCrowdLevels: CrowdLevel[];
  preferredTimeSlots: TimeSlot[];
  avoidanceFactors: AvoidanceFactor[];
  accessibilityRequirements: string[];
  maxTravelDistance: number; // 公里
  maxWaitTime: number; // 分钟
}

export interface UserBehaviorProfile {
  visitFrequency: Map<PlaceCategory, number>; // 访问频率
  averageVisitDuration: Map<PlaceCategory, number>; // 平均停留时间
  reportingActivity: ReportingActivity;
  suggestionAcceptanceRate: number; // 建议采纳率
  peakActivityHours: number[]; // 活跃时段
  preferredDays: number[]; // 偏好的星期几
}

export interface UserPatternProfile {
  routinePatterns: RoutinePattern[];
  seasonalPreferences: SeasonalPreference[];
  socialPatterns: SocialPattern[];
  mobilityPatterns: MobilityPattern[];
}

export interface TimeSlot {
  start: string; // HH:mm
  end: string; // HH:mm
  preference: number; // 0-1
}

export interface AvoidanceFactor {
  type: 'crowd' | 'noise' | 'wait_time' | 'distance' | 'accessibility';
  threshold: number;
  importance: number; // 0-1
}

export interface ReportingActivity {
  totalReports: number;
  accuracyScore: number; // 0-1
  reportFrequency: number; // 每周报告数
  preferredReportTypes: string[];
}

export interface RoutinePattern {
  name: string;
  description: string;
  frequency: number; // 每周出现次数
  timePattern: TimeSlot;
  placeCategories: PlaceCategory[];
  confidence: number; // 0-1
}

export interface SeasonalPreference {
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  preferredCategories: PlaceCategory[];
  activityLevel: number; // 0-1
}

export interface SocialPattern {
  preferredGroupSize: number;
  socialActivityFrequency: number;
  preferredSocialCategories: PlaceCategory[];
}

export interface MobilityPattern {
  averageTravelDistance: number;
  preferredTransportModes: string[];
  mobilityRadius: number; // 常活动半径
}

export class UserProfilingEngine {
  private profiles: Map<string, UserProfile> = new Map();
  private userReports: Map<string, Report[]> = new Map();
  private userSuggestionHistory: Map<string, Suggestion[]> = new Map();

  /**
   * 构建或更新用户画像
   */
  async buildUserProfile(
    user: User,
    reports: Report[] = [],
    suggestionHistory: Suggestion[] = []
  ): Promise<UserProfile> {
    // 更新用户数据
    this.userReports.set(user.id, reports);
    this.userSuggestionHistory.set(user.id, suggestionHistory);

    // 构建偏好画像
    const preferences = this.buildPreferenceProfile(user, reports);

    // 构建行为画像
    const behaviors = this.buildBehaviorProfile(user, reports, suggestionHistory);

    // 构建模式画像
    const patterns = this.buildPatternProfile(user, reports);

    const profile: UserProfile = {
      userId: user.id,
      preferences,
      behaviors,
      patterns,
      lastUpdated: new Date()
    };

    this.profiles.set(user.id, profile);
    return profile;
  }

  /**
   * 获取用户画像
   */
  getUserProfile(userId: string): UserProfile | null {
    return this.profiles.get(userId) || null;
  }

  /**
   * 基于用户画像推荐场所
   */
  recommendPlacesForUser(
    userId: string,
    availablePlaces: Place[],
    currentTime: Date = new Date()
  ): Place[] {
    const profile = this.getUserProfile(userId);
    if (!profile) return [];

    return availablePlaces
      .map(place => ({
        place,
        score: this.calculatePlaceScore(place, profile, currentTime)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(item => item.place);
  }

  /**
   * 预测用户对建议的接受度
   */
  predictSuggestionAcceptance(
    userId: string,
    suggestion: Suggestion
  ): number {
    const profile = this.getUserProfile(userId);
    if (!profile) return 0.5; // 默认接受度

    let acceptanceScore = profile.behaviors.suggestionAcceptanceRate;

    // 基于偏好调整
    if (profile.preferences.preferredCategories.includes(suggestion.place.category)) {
      acceptanceScore += 0.2;
    }

    if (profile.preferences.preferredCrowdLevels.includes(suggestion.estimatedCrowdLevel)) {
      acceptanceScore += 0.15;
    }

    // 基于时间偏好调整
    const suggestionHour = suggestion.recommendedTime.getHours();
    const timePreference = this.getTimePreference(profile, suggestionHour);
    acceptanceScore += timePreference * 0.2;

    // 基于等待时间调整
    if (suggestion.estimatedWaitTime <= profile.preferences.maxWaitTime) {
      acceptanceScore += 0.1;
    } else {
      acceptanceScore -= 0.2;
    }

    return Math.max(0, Math.min(1, acceptanceScore));
  }

  /**
   * 构建偏好画像
   */
  private buildPreferenceProfile(user: User, reports: Report[]): UserPreferenceProfile {
    // 基于用户设置的基础偏好
    const basePreferences = user.preferences;

    // 从报告中分析偏好
    const categoryFrequency = this.analyzeCategoryFrequency(reports);
    const crowdLevelPreferences = this.analyzeCrowdLevelPreferences(reports);
    const timePreferences = this.analyzeTimePreferences(reports);

    return {
      preferredCategories: this.getTopCategories(categoryFrequency, 5),
      preferredCrowdLevels: crowdLevelPreferences,
      preferredTimeSlots: timePreferences,
      avoidanceFactors: this.buildAvoidanceFactors(user, reports),
      accessibilityRequirements: this.extractAccessibilityRequirements(user),
      maxTravelDistance: 10, // 默认10公里
      maxWaitTime: basePreferences.maxWaitTime || 30
    };
  }

  /**
   * 构建行为画像
   */
  private buildBehaviorProfile(
    user: User,
    reports: Report[],
    suggestionHistory: Suggestion[]
  ): UserBehaviorProfile {
    const visitFrequency = this.calculateVisitFrequency(reports);
    const averageVisitDuration = this.calculateAverageVisitDuration(reports);
    const reportingActivity = this.analyzeReportingActivity(reports);
    const suggestionAcceptanceRate = this.calculateSuggestionAcceptanceRate(suggestionHistory);
    const peakActivityHours = this.identifyPeakActivityHours(reports);
    const preferredDays = this.identifyPreferredDays(reports);

    return {
      visitFrequency,
      averageVisitDuration,
      reportingActivity,
      suggestionAcceptanceRate,
      peakActivityHours,
      preferredDays
    };
  }

  /**
   * 构建模式画像
   */
  private buildPatternProfile(user: User, reports: Report[]): UserPatternProfile {
    const routinePatterns = this.identifyRoutinePatterns(reports);
    const seasonalPreferences = this.analyzeSeasonalPreferences(reports);
    const socialPatterns = this.analyzeSocialPatterns(user, reports);
    const mobilityPatterns = this.analyzeMobilityPatterns(reports);

    return {
      routinePatterns,
      seasonalPreferences,
      socialPatterns,
      mobilityPatterns
    };
  }

  /**
   * 分析场所类型频率
   */
  private analyzeCategoryFrequency(reports: Report[]): Map<PlaceCategory, number> {
    const frequency = new Map<PlaceCategory, number>();

    for (const report of reports) {
      if (report.place) {
        const category = report.place.category;
        frequency.set(category, (frequency.get(category) || 0) + 1);
      }
    }

    return frequency;
  }

  /**
   * 分析拥挤程度偏好
   */
  private analyzeCrowdLevelPreferences(reports: Report[]): CrowdLevel[] {
    const crowdLevelCounts = new Map<CrowdLevel, number>();

    for (const report of reports) {
      if (report.data.crowdLevel) {
        const level = report.data.crowdLevel;
        crowdLevelCounts.set(level, (crowdLevelCounts.get(level) || 0) + 1);
      }
    }

    // 返回出现频率最高的拥挤程度
    return Array.from(crowdLevelCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([level]) => level);
  }

  /**
   * 分析时间偏好
   */
  private analyzeTimePreferences(reports: Report[]): TimeSlot[] {
    const hourCounts = new Map<number, number>();

    for (const report of reports) {
      const hour = report.timestamp.getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    }

    // 找出活跃时段
    const activeHours = Array.from(hourCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([hour]) => hour)
      .sort((a, b) => a - b);

    // 将连续的小时合并为时间段
    const timeSlots: TimeSlot[] = [];
    let currentSlot: { start: number; end: number } | null = null;

    for (const hour of activeHours) {
      if (!currentSlot) {
        currentSlot = { start: hour, end: hour };
      } else if (hour === currentSlot.end + 1) {
        currentSlot.end = hour;
      } else {
        timeSlots.push({
          start: `${currentSlot.start.toString().padStart(2, '0')}:00`,
          end: `${(currentSlot.end + 1).toString().padStart(2, '0')}:00`,
          preference: 0.8
        });
        currentSlot = { start: hour, end: hour };
      }
    }

    if (currentSlot) {
      timeSlots.push({
        start: `${currentSlot.start.toString().padStart(2, '0')}:00`,
        end: `${(currentSlot.end + 1).toString().padStart(2, '0')}:00`,
        preference: 0.8
      });
    }

    return timeSlots;
  }

  /**
   * 获取热门场所类型
   */
  private getTopCategories(frequency: Map<PlaceCategory, number>, count: number): PlaceCategory[] {
    return Array.from(frequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([category]) => category);
  }

  /**
   * 构建规避因子
   */
  private buildAvoidanceFactors(user: User, reports: Report[]): AvoidanceFactor[] {
    const factors: AvoidanceFactor[] = [];

    // 基于用户偏好设置
    if (user.preferences.preferredCrowdLevel) {
      factors.push({
        type: 'crowd',
        threshold: this.crowdLevelToNumber(user.preferences.preferredCrowdLevel),
        importance: 0.8
      });
    }

    if (user.preferences.maxWaitTime) {
      factors.push({
        type: 'wait_time',
        threshold: user.preferences.maxWaitTime,
        importance: 0.7
      });
    }

    return factors;
  }

  /**
   * 提取无障碍需求
   */
  private extractAccessibilityRequirements(user: User): string[] {
    const requirements: string[] = [];
    const accessibility = user.preferences.accessibilityNeeds;

    if (accessibility.wheelchairAccessible) {
      requirements.push('wheelchair_accessible');
    }
    if (accessibility.hasElevator) {
      requirements.push('elevator_access');
    }
    if (accessibility.hasRamp) {
      requirements.push('ramp_access');
    }

    return requirements;
  }

  /**
   * 计算访问频率
   */
  private calculateVisitFrequency(reports: Report[]): Map<PlaceCategory, number> {
    const frequency = new Map<PlaceCategory, number>();
    const totalReports = reports.length;

    for (const report of reports) {
      if (report.place) {
        const category = report.place.category;
        const count = frequency.get(category) || 0;
        frequency.set(category, count + 1);
      }
    }

    // 转换为相对频率
    for (const [category, count] of frequency.entries()) {
      frequency.set(category, count / totalReports);
    }

    return frequency;
  }

  /**
   * 计算平均访问时长
   */
  private calculateAverageVisitDuration(reports: Report[]): Map<PlaceCategory, number> {
    // 这里需要额外的数据来计算访问时长
    // 暂时返回估计值
    const duration = new Map<PlaceCategory, number>();
    
    duration.set(PlaceCategory.RESTAURANT, 60); // 60分钟
    duration.set(PlaceCategory.SHOPPING, 90);
    duration.set(PlaceCategory.HOSPITAL, 45);
    duration.set(PlaceCategory.BANK, 20);
    
    return duration;
  }

  /**
   * 分析报告活动
   */
  private analyzeReportingActivity(reports: Report[]): ReportingActivity {
    const totalReports = reports.length;
    const verifiedReports = reports.filter(r => r.verified).length;
    const accuracyScore = totalReports > 0 ? verifiedReports / totalReports : 0;

    // 计算报告频率（假设数据跨度为最近30天）
    const reportFrequency = totalReports / 4; // 每周报告数

    const reportTypes = reports.map(r => r.reportType);
    const preferredReportTypes = [...new Set(reportTypes)];

    return {
      totalReports,
      accuracyScore,
      reportFrequency,
      preferredReportTypes
    };
  }

  /**
   * 计算建议接受率
   */
  private calculateSuggestionAcceptanceRate(suggestionHistory: Suggestion[]): number {
    // 这里需要额外的数据来跟踪建议是否被接受
    // 暂时返回默认值
    return 0.7;
  }

  /**
   * 识别活跃时段
   */
  private identifyPeakActivityHours(reports: Report[]): number[] {
    const hourCounts = new Map<number, number>();

    for (const report of reports) {
      const hour = report.timestamp.getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    }

    return Array.from(hourCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([hour]) => hour);
  }

  /**
   * 识别偏好的星期几
   */
  private identifyPreferredDays(reports: Report[]): number[] {
    const dayCounts = new Map<number, number>();

    for (const report of reports) {
      const day = report.timestamp.getDay();
      dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
    }

    return Array.from(dayCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([day]) => day);
  }

  /**
   * 识别例行模式
   */
  private identifyRoutinePatterns(reports: Report[]): RoutinePattern[] {
    // 这里可以实现更复杂的模式识别算法
    // 暂时返回基础模式
    return [
      {
        name: '工作日午餐',
        description: '工作日中午用餐模式',
        frequency: 5,
        timePattern: { start: '11:30', end: '13:30', preference: 0.9 },
        placeCategories: [PlaceCategory.RESTAURANT],
        confidence: 0.8
      }
    ];
  }

  /**
   * 分析季节偏好
   */
  private analyzeSeasonalPreferences(reports: Report[]): SeasonalPreference[] {
    // 基于报告时间分析季节性偏好
    const seasonalData = new Map<string, PlaceCategory[]>();
    
    for (const report of reports) {
      const month = report.timestamp.getMonth();
      let season: string;
      
      if (month >= 2 && month <= 4) season = 'spring';
      else if (month >= 5 && month <= 7) season = 'summer';
      else if (month >= 8 && month <= 10) season = 'autumn';
      else season = 'winter';
      
      if (report.place) {
        if (!seasonalData.has(season)) {
          seasonalData.set(season, []);
        }
        seasonalData.get(season)!.push(report.place.category);
      }
    }

    const preferences: SeasonalPreference[] = [];
    for (const [season, categories] of seasonalData.entries()) {
      const uniqueCategories = [...new Set(categories)];
      preferences.push({
        season: season as any,
        preferredCategories: uniqueCategories,
        activityLevel: categories.length / reports.length
      });
    }

    return preferences;
  }

  /**
   * 分析社交模式
   */
  private analyzeSocialPatterns(user: User, reports: Report[]): SocialPattern {
    // 基于用户设置和报告分析社交偏好
    const socialPrefs = user.socialRhythm?.socialPreferences;
    
    return {
      preferredGroupSize: socialPrefs?.groupSize === 'small' ? 2 : 
                         socialPrefs?.groupSize === 'medium' ? 4 : 8,
      socialActivityFrequency: 0.6,
      preferredSocialCategories: [
        PlaceCategory.RESTAURANT,
        PlaceCategory.ENTERTAINMENT,
        PlaceCategory.SHOPPING
      ]
    };
  }

  /**
   * 分析移动模式
   */
  private analyzeMobilityPatterns(reports: Report[]): MobilityPattern {
    // 基于报告位置分析移动模式
    return {
      averageTravelDistance: 5, // 5公里
      preferredTransportModes: ['walking', 'public_transport'],
      mobilityRadius: 10 // 10公里活动半径
    };
  }

  /**
   * 计算场所评分
   */
  private calculatePlaceScore(
    place: Place,
    profile: UserProfile,
    currentTime: Date
  ): number {
    let score = 0.5; // 基础分数

    // 场所类型偏好
    if (profile.preferences.preferredCategories.includes(place.category)) {
      score += 0.3;
    }

    // 拥挤程度偏好
    if (profile.preferences.preferredCrowdLevels.includes(place.crowdLevel)) {
      score += 0.2;
    }

    // 时间偏好
    const currentHour = currentTime.getHours();
    const timePreference = this.getTimePreference(profile, currentHour);
    score += timePreference * 0.2;

    // 等待时间
    if (place.waitTime <= profile.preferences.maxWaitTime) {
      score += 0.1;
    } else {
      score -= 0.2;
    }

    // 无障碍需求
    if (profile.preferences.accessibilityRequirements.length > 0) {
      const accessibilityMatch = this.checkAccessibilityMatch(
        place.accessibility,
        profile.preferences.accessibilityRequirements
      );
      score += accessibilityMatch * 0.15;
    }

    return Math.max(0, Math.min(1, score));
  }

  /**
   * 获取时间偏好
   */
  private getTimePreference(profile: UserProfile, hour: number): number {
    for (const timeSlot of profile.preferences.preferredTimeSlots) {
      const startHour = parseInt(timeSlot.start.split(':')[0]);
      const endHour = parseInt(timeSlot.end.split(':')[0]);
      
      if (hour >= startHour && hour < endHour) {
        return timeSlot.preference;
      }
    }
    return 0.3; // 默认偏好
  }

  /**
   * 检查无障碍匹配度
   */
  private checkAccessibilityMatch(
    placeAccessibility: any,
    requirements: string[]
  ): number {
    let matches = 0;
    
    for (const requirement of requirements) {
      switch (requirement) {
        case 'wheelchair_accessible':
          if (placeAccessibility.wheelchairAccessible) matches++;
          break;
        case 'elevator_access':
          if (placeAccessibility.hasElevator) matches++;
          break;
        case 'ramp_access':
          if (placeAccessibility.hasRamp) matches++;
          break;
      }
    }
    
    return requirements.length > 0 ? matches / requirements.length : 1;
  }

  /**
   * 拥挤程度转数字
   */
  private crowdLevelToNumber(crowdLevel: CrowdLevel): number {
    switch (crowdLevel) {
      case CrowdLevel.LOW: return 0.25;
      case CrowdLevel.MEDIUM: return 0.5;
      case CrowdLevel.HIGH: return 0.75;
      case CrowdLevel.VERY_HIGH: return 1.0;
      default: return 0.5;
    }
  }
}

// 导出单例实例
export const userProfilingEngine = new UserProfilingEngine();