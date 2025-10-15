import { Place, PlaceCategory, CrowdLevel, User, Suggestion, AlternativeOption, Coordinates } from '@/types';

export interface RecommendationContext {
  user: User;
  currentLocation?: Coordinates;
  targetPlace?: Place;
  preferredTime?: Date;
  maxDistance?: number; // 公里
  avoidCrowdLevel?: CrowdLevel[];
}

export interface SuggestionOptions {
  includeAlternatives: boolean;
  maxAlternatives: number;
  considerWeather: boolean;
  considerTraffic: boolean;
}

export class RecommendEngine {
  private places: Place[] = [];
  private historicalData: Map<string, any[]> = new Map();

  constructor(places: Place[] = []) {
    this.places = places;
  }

  /**
   * 生成智能建议
   */
  async generateSuggestions(
    context: RecommendationContext,
    options: SuggestionOptions = {
      includeAlternatives: true,
      maxAlternatives: 3,
      considerWeather: false,
      considerTraffic: true
    }
  ): Promise<Suggestion[]> {
    const suggestions: Suggestion[] = [];

    if (context.targetPlace) {
      // 针对特定场所的建议
      const suggestion = await this.generatePlaceSuggestion(context.targetPlace, context, options);
      if (suggestion) {
        suggestions.push(suggestion);
      }
    } else {
      // 基于用户偏好的通用建议
      const generalSuggestions = await this.generateGeneralSuggestions(context, options);
      suggestions.push(...generalSuggestions);
    }

    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * 为特定场所生成建议
   */
  private async generatePlaceSuggestion(
    place: Place,
    context: RecommendationContext,
    options: SuggestionOptions
  ): Promise<Suggestion | null> {
    const currentTime = context.preferredTime || new Date();
    const crowdPrediction = this.predictCrowdLevel(place, currentTime);
    const waitTimePrediction = this.predictWaitTime(place, currentTime);

    // 计算建议置信度
    const confidence = this.calculateConfidence(place, context, crowdPrediction, waitTimePrediction);

    // 生成建议原因
    const reason = this.generateReason(place, crowdPrediction, waitTimePrediction, context);

    // 查找替代选项
    const alternatives = options.includeAlternatives 
      ? await this.findAlternatives(place, context, options.maxAlternatives)
      : [];

    return {
      id: `suggestion_${place.id}_${Date.now()}`,
      placeId: place.id,
      place,
      recommendedTime: this.getOptimalTime(place, currentTime),
      reason,
      confidence,
      estimatedWaitTime: waitTimePrediction,
      estimatedCrowdLevel: crowdPrediction,
      alternativeOptions: alternatives
    };
  }

  /**
   * 生成通用建议
   */
  private async generateGeneralSuggestions(
    context: RecommendationContext,
    options: SuggestionOptions
  ): Promise<Suggestion[]> {
    const suggestions: Suggestion[] = [];
    const currentTime = context.preferredTime || new Date();

    // 基于用户偏好筛选场所
    const relevantPlaces = this.filterPlacesByPreferences(context.user, context.currentLocation);

    for (const place of relevantPlaces.slice(0, 5)) { // 限制数量
      const suggestion = await this.generatePlaceSuggestion(place, context, options);
      if (suggestion && suggestion.confidence > 0.3) {
        suggestions.push(suggestion);
      }
    }

    return suggestions;
  }

  /**
   * 预测拥挤程度
   */
  private predictCrowdLevel(place: Place, time: Date): CrowdLevel {
    const hour = time.getHours();
    const dayOfWeek = time.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // 基于场所类型和时间的基础预测
    let baseCrowdLevel = this.getBaseCrowdLevel(place.category, hour, isWeekend);

    // 考虑历史数据调整
    const historicalAdjustment = this.getHistoricalAdjustment(place.id, time);
    
    return this.adjustCrowdLevel(baseCrowdLevel, historicalAdjustment);
  }

  /**
   * 预测等待时间
   */
  private predictWaitTime(place: Place, time: Date): number {
    const crowdLevel = this.predictCrowdLevel(place, time);
    
    switch (crowdLevel) {
      case CrowdLevel.LOW:
        return Math.random() * 5 + 1; // 1-6分钟
      case CrowdLevel.MEDIUM:
        return Math.random() * 10 + 5; // 5-15分钟
      case CrowdLevel.HIGH:
        return Math.random() * 15 + 15; // 15-30分钟
      case CrowdLevel.VERY_HIGH:
        return Math.random() * 20 + 30; // 30-50分钟
      default:
        return 5;
    }
  }

  /**
   * 计算建议置信度
   */
  private calculateConfidence(
    place: Place,
    context: RecommendationContext,
    crowdLevel: CrowdLevel,
    waitTime: number
  ): number {
    let confidence = 0.5; // 基础置信度

    // 基于用户偏好调整
    if (context.user.preferences.preferredCrowdLevel === crowdLevel) {
      confidence += 0.2;
    } else if (context.user.preferences.avoidNoiseLevel.includes(place.noiseLevel)) {
      confidence -= 0.3;
    }

    // 基于等待时间调整
    if (waitTime <= context.user.preferences.maxWaitTime) {
      confidence += 0.2;
    } else {
      confidence -= 0.3;
    }

    // 基于距离调整（如果有位置信息）
    if (context.currentLocation) {
      const distance = this.calculateDistance(context.currentLocation, place.coordinates);
      if (distance <= 2) { // 2公里内
        confidence += 0.1;
      } else if (distance > 10) { // 超过10公里
        confidence -= 0.2;
      }
    }

    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * 生成建议原因
   */
  private generateReason(
    place: Place,
    crowdLevel: CrowdLevel,
    waitTime: number,
    context: RecommendationContext
  ): string {
    const reasons: string[] = [];

    // 拥挤程度相关
    switch (crowdLevel) {
      case CrowdLevel.LOW:
        reasons.push('人流较少，环境相对安静');
        break;
      case CrowdLevel.MEDIUM:
        reasons.push('人流适中，不会太拥挤');
        break;
      case CrowdLevel.HIGH:
        reasons.push('人流较多，建议错峰前往');
        break;
      case CrowdLevel.VERY_HIGH:
        reasons.push('人流密集，建议选择其他时间');
        break;
    }

    // 等待时间相关
    if (waitTime <= 5) {
      reasons.push('预计等待时间很短');
    } else if (waitTime <= 15) {
      reasons.push('预计等待时间适中');
    } else {
      reasons.push('预计等待时间较长，建议提前规划');
    }

    // 用户偏好匹配
    if (context.user.preferences.preferredCrowdLevel === crowdLevel) {
      reasons.push('符合您的拥挤度偏好');
    }

    return reasons.join('，');
  }

  /**
   * 查找替代场所
   */
  private async findAlternatives(
    originalPlace: Place,
    context: RecommendationContext,
    maxCount: number
  ): Promise<AlternativeOption[]> {
    const alternatives: AlternativeOption[] = [];
    
    // 查找同类型场所
    const similarPlaces = this.places.filter(p => 
      p.id !== originalPlace.id && 
      p.category === originalPlace.category
    );

    // 如果有位置信息，按距离排序
    if (context.currentLocation) {
      similarPlaces.sort((a, b) => {
        const distA = this.calculateDistance(context.currentLocation!, a.coordinates);
        const distB = this.calculateDistance(context.currentLocation!, b.coordinates);
        return distA - distB;
      });
    }

    const currentTime = context.preferredTime || new Date();

    for (const place of similarPlaces.slice(0, maxCount)) {
      const crowdLevel = this.predictCrowdLevel(place, currentTime);
      const waitTime = this.predictWaitTime(place, currentTime);
      
      alternatives.push({
        placeId: place.id,
        place,
        recommendedTime: this.getOptimalTime(place, currentTime),
        waitTime,
        crowdLevel
      });
    }

    return alternatives.sort((a, b) => a.waitTime - b.waitTime);
  }

  /**
   * 获取最佳访问时间
   */
  private getOptimalTime(place: Place, currentTime: Date): Date {
    const optimalTime = new Date(currentTime);
    
    // 基于场所类型调整时间
    switch (place.category) {
      case PlaceCategory.RESTAURANT:
        // 避开用餐高峰
        if (currentTime.getHours() >= 11 && currentTime.getHours() <= 13) {
          optimalTime.setHours(14, 0, 0, 0);
        } else if (currentTime.getHours() >= 17 && currentTime.getHours() <= 19) {
          optimalTime.setHours(20, 0, 0, 0);
        }
        break;
        
      case PlaceCategory.BANK:
      case PlaceCategory.GOVERNMENT:
        // 避开上午高峰
        if (currentTime.getHours() >= 9 && currentTime.getHours() <= 11) {
          optimalTime.setHours(14, 0, 0, 0);
        }
        break;
        
      case PlaceCategory.TRANSPORT:
        // 避开通勤高峰
        if (currentTime.getHours() >= 7 && currentTime.getHours() <= 9) {
          optimalTime.setHours(10, 0, 0, 0);
        } else if (currentTime.getHours() >= 17 && currentTime.getHours() <= 19) {
          optimalTime.setHours(20, 0, 0, 0);
        }
        break;
    }

    return optimalTime;
  }

  /**
   * 基于用户偏好筛选场所
   */
  private filterPlacesByPreferences(user: User, location?: Coordinates): Place[] {
    let filtered = [...this.places];

    // 基于距离筛选
    if (location) {
      filtered = filtered.filter(place => {
        const distance = this.calculateDistance(location, place.coordinates);
        return distance <= 10; // 10公里内
      });
    }

    // 基于无障碍需求筛选
    if (user.preferences.accessibilityNeeds.wheelchairAccessible) {
      filtered = filtered.filter(place => place.accessibility.wheelchairAccessible);
    }

    return filtered;
  }

  /**
   * 获取基础拥挤程度
   */
  private getBaseCrowdLevel(category: PlaceCategory, hour: number, isWeekend: boolean): CrowdLevel {
    // 这里实现基于场所类型、时间和是否周末的基础拥挤程度逻辑
    // 参考 mockData.ts 中的 getCrowdLevelByTime 函数
    switch (category) {
      case PlaceCategory.RESTAURANT:
        if (hour >= 11 && hour <= 13) return CrowdLevel.VERY_HIGH;
        if (hour >= 17 && hour <= 19) return CrowdLevel.HIGH;
        if (hour >= 7 && hour <= 9) return CrowdLevel.MEDIUM;
        return CrowdLevel.LOW;
        
      case PlaceCategory.HOSPITAL:
        if (hour >= 8 && hour <= 11) return CrowdLevel.HIGH;
        if (hour >= 14 && hour <= 16) return CrowdLevel.MEDIUM;
        return CrowdLevel.LOW;
        
      default:
        return CrowdLevel.MEDIUM;
    }
  }

  /**
   * 获取历史数据调整值
   */
  private getHistoricalAdjustment(placeId: string, time: Date): number {
    // 这里可以基于历史数据进行调整
    // 暂时返回随机调整值
    return (Math.random() - 0.5) * 0.2;
  }

  /**
   * 调整拥挤程度
   */
  private adjustCrowdLevel(baseCrowdLevel: CrowdLevel, adjustment: number): CrowdLevel {
    const levels = [CrowdLevel.LOW, CrowdLevel.MEDIUM, CrowdLevel.HIGH, CrowdLevel.VERY_HIGH];
    const currentIndex = levels.indexOf(baseCrowdLevel);
    
    let newIndex = currentIndex;
    if (adjustment > 0.1) {
      newIndex = Math.min(levels.length - 1, currentIndex + 1);
    } else if (adjustment < -0.1) {
      newIndex = Math.max(0, currentIndex - 1);
    }
    
    return levels[newIndex];
  }

  /**
   * 计算两点间距离（公里）
   */
  private calculateDistance(point1: Coordinates, point2: Coordinates): number {
    const R = 6371; // 地球半径（公里）
    const dLat = this.deg2rad(point2.lat - point1.lat);
    const dLng = this.deg2rad(point2.lng - point1.lng);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(point1.lat)) * Math.cos(this.deg2rad(point2.lat)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  /**
   * 更新场所数据
   */
  updatePlaces(places: Place[]): void {
    this.places = places;
  }

  /**
   * 添加历史数据
   */
  addHistoricalData(placeId: string, data: any): void {
    if (!this.historicalData.has(placeId)) {
      this.historicalData.set(placeId, []);
    }
    this.historicalData.get(placeId)!.push({
      ...data,
      timestamp: new Date()
    });
  }
}

// 导出单例实例
export const recommendEngine = new RecommendEngine();