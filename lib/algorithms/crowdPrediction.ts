import { Place, PlaceCategory, CrowdLevel, Report, ReportData } from '@/types';

export interface CrowdPredictionData {
  placeId: string;
  predictedCrowdLevel: CrowdLevel;
  confidence: number;
  timeWindow: {
    start: Date;
    end: Date;
  };
  factors: PredictionFactor[];
}

export interface PredictionFactor {
  name: string;
  impact: number; // -1 to 1
  description: string;
}

export interface HistoricalPattern {
  hour: number;
  dayOfWeek: number;
  averageCrowdLevel: number;
  sampleCount: number;
}

export class CrowdPredictionEngine {
  private historicalData: Map<string, Report[]> = new Map();
  private patterns: Map<string, HistoricalPattern[]> = new Map();

  /**
   * 预测指定场所在指定时间的拥挤程度
   */
  async predictCrowdLevel(
    place: Place,
    targetTime: Date,
    historicalReports: Report[] = []
  ): Promise<CrowdPredictionData> {
    // 更新历史数据
    this.updateHistoricalData(place.id, historicalReports);

    // 计算基础预测
    const basePrediction = this.getBasePrediction(place, targetTime);

    // 应用各种调整因子
    const factors = this.calculatePredictionFactors(place, targetTime);
    const adjustedPrediction = this.applyFactors(basePrediction, factors);

    // 计算置信度
    const confidence = this.calculateConfidence(place.id, targetTime, factors);

    return {
      placeId: place.id,
      predictedCrowdLevel: this.numberToCrowdLevel(adjustedPrediction),
      confidence,
      timeWindow: {
        start: new Date(targetTime.getTime() - 30 * 60 * 1000), // 前30分钟
        end: new Date(targetTime.getTime() + 30 * 60 * 1000)    // 后30分钟
      },
      factors
    };
  }

  /**
   * 批量预测多个时间点的拥挤程度
   */
  async predictCrowdTrend(
    place: Place,
    startTime: Date,
    endTime: Date,
    intervalMinutes: number = 30
  ): Promise<CrowdPredictionData[]> {
    const predictions: CrowdPredictionData[] = [];
    const currentTime = new Date(startTime);

    while (currentTime <= endTime) {
      const prediction = await this.predictCrowdLevel(place, new Date(currentTime));
      predictions.push(prediction);
      currentTime.setMinutes(currentTime.getMinutes() + intervalMinutes);
    }

    return predictions;
  }

  /**
   * 获取基础预测值
   */
  private getBasePrediction(place: Place, targetTime: Date): number {
    const hour = targetTime.getHours();
    const dayOfWeek = targetTime.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // 基于场所类型的基础模式
    let baseLevel = this.getCategoryBaseline(place.category, hour, isWeekend);

    // 应用历史模式
    const historicalPattern = this.getHistoricalPattern(place.id, hour, dayOfWeek);
    if (historicalPattern) {
      baseLevel = (baseLevel + historicalPattern.averageCrowdLevel) / 2;
    }

    return baseLevel;
  }

  /**
   * 计算预测因子
   */
  private calculatePredictionFactors(place: Place, targetTime: Date): PredictionFactor[] {
    const factors: PredictionFactor[] = [];

    // 时间因子
    factors.push(this.getTimeFactors(targetTime));

    // 天气因子
    factors.push(this.getWeatherFactor(targetTime));

    // 节假日因子
    factors.push(this.getHolidayFactor(targetTime));

    // 特殊事件因子
    factors.push(this.getSpecialEventFactor(place, targetTime));

    // 季节因子
    factors.push(this.getSeasonalFactor(targetTime));

    return factors.filter(f => Math.abs(f.impact) > 0.05); // 过滤影响很小的因子
  }

  /**
   * 获取时间相关因子
   */
  private getTimeFactors(targetTime: Date): PredictionFactor {
    const hour = targetTime.getHours();
    let impact = 0;
    let description = '';

    if (hour >= 7 && hour <= 9) {
      impact = 0.3;
      description = '早高峰时段，人流增加';
    } else if (hour >= 11 && hour <= 13) {
      impact = 0.4;
      description = '午餐时段，人流密集';
    } else if (hour >= 17 && hour <= 19) {
      impact = 0.5;
      description = '晚高峰时段，人流最多';
    } else if (hour >= 22 || hour <= 6) {
      impact = -0.4;
      description = '深夜/凌晨时段，人流很少';
    }

    return {
      name: 'time_of_day',
      impact,
      description
    };
  }

  /**
   * 获取天气因子
   */
  private getWeatherFactor(targetTime: Date): PredictionFactor {
    // 这里可以集成天气API，暂时使用模拟数据
    const weatherConditions = ['sunny', 'rainy', 'cloudy', 'snowy'];
    const randomWeather = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];

    let impact = 0;
    let description = '';

    switch (randomWeather) {
      case 'rainy':
        impact = 0.2;
        description = '雨天，室内场所人流增加';
        break;
      case 'snowy':
        impact = -0.3;
        description = '雪天，外出人流减少';
        break;
      case 'sunny':
        impact = 0.1;
        description = '晴天，适合外出';
        break;
      default:
        impact = 0;
        description = '天气条件正常';
    }

    return {
      name: 'weather',
      impact,
      description
    };
  }

  /**
   * 获取节假日因子
   */
  private getHolidayFactor(targetTime: Date): PredictionFactor {
    const dayOfWeek = targetTime.getDay();
    let impact = 0;
    let description = '';

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      impact = 0.2;
      description = '周末，休闲场所人流增加';
    } else {
      impact = 0.1;
      description = '工作日，商务场所相对繁忙';
    }

    // 这里可以添加更复杂的节假日判断逻辑
    return {
      name: 'holiday',
      impact,
      description
    };
  }

  /**
   * 获取特殊事件因子
   */
  private getSpecialEventFactor(place: Place, targetTime: Date): PredictionFactor {
    // 这里可以集成事件API，检查附近是否有特殊活动
    // 暂时返回默认值
    return {
      name: 'special_event',
      impact: 0,
      description: '无特殊事件影响'
    };
  }

  /**
   * 获取季节因子
   */
  private getSeasonalFactor(targetTime: Date): PredictionFactor {
    const month = targetTime.getMonth();
    let impact = 0;
    let description = '';

    if (month >= 5 && month <= 8) { // 夏季
      impact = 0.1;
      description = '夏季，室内场所更受欢迎';
    } else if (month >= 11 || month <= 2) { // 冬季
      impact = 0.15;
      description = '冬季，室内场所人流增加';
    }

    return {
      name: 'seasonal',
      impact,
      description
    };
  }

  /**
   * 应用预测因子
   */
  private applyFactors(basePrediction: number, factors: PredictionFactor[]): number {
    let adjustedPrediction = basePrediction;

    for (const factor of factors) {
      adjustedPrediction += factor.impact * 0.5; // 调整影响强度
    }

    return Math.max(0, Math.min(1, adjustedPrediction));
  }

  /**
   * 计算预测置信度
   */
  private calculateConfidence(
    placeId: string,
    targetTime: Date,
    factors: PredictionFactor[]
  ): number {
    let confidence = 0.5; // 基础置信度

    // 基于历史数据样本数量调整置信度
    const historicalData = this.historicalData.get(placeId) || [];
    const sampleCount = historicalData.length;
    
    if (sampleCount > 50) {
      confidence += 0.3;
    } else if (sampleCount > 20) {
      confidence += 0.2;
    } else if (sampleCount > 5) {
      confidence += 0.1;
    }

    // 基于因子一致性调整置信度
    const factorConsistency = this.calculateFactorConsistency(factors);
    confidence += factorConsistency * 0.2;

    // 基于时间距离调整置信度
    const timeDistance = Math.abs(targetTime.getTime() - Date.now()) / (1000 * 60 * 60); // 小时
    if (timeDistance > 24) {
      confidence -= 0.2; // 超过24小时的预测置信度降低
    }

    return Math.max(0.1, Math.min(0.95, confidence));
  }

  /**
   * 计算因子一致性
   */
  private calculateFactorConsistency(factors: PredictionFactor[]): number {
    if (factors.length === 0) return 0;

    const impacts = factors.map(f => f.impact);
    const avgImpact = impacts.reduce((sum, impact) => sum + impact, 0) / impacts.length;
    const variance = impacts.reduce((sum, impact) => sum + Math.pow(impact - avgImpact, 2), 0) / impacts.length;
    
    return Math.max(0, 1 - variance); // 方差越小，一致性越高
  }

  /**
   * 获取场所类型基线
   */
  private getCategoryBaseline(category: PlaceCategory, hour: number, isWeekend: boolean): number {
    const baselines: Record<PlaceCategory, Record<string, number>> = {
      [PlaceCategory.RESTAURANT]: {
        'breakfast': hour >= 7 && hour <= 9 ? 0.6 : 0.2,
        'lunch': hour >= 11 && hour <= 13 ? 0.8 : 0.3,
        'dinner': hour >= 17 && hour <= 19 ? 0.9 : 0.3,
        'default': 0.3
      },
      [PlaceCategory.HOSPITAL]: {
        'morning': hour >= 8 && hour <= 11 ? 0.7 : 0.4,
        'afternoon': hour >= 14 && hour <= 16 ? 0.5 : 0.3,
        'default': 0.3
      },
      [PlaceCategory.BANK]: {
        'business_hours': hour >= 9 && hour <= 17 ? 0.6 : 0.1,
        'peak': hour >= 9 && hour <= 11 ? 0.8 : 0.4,
        'default': 0.2
      },
      [PlaceCategory.SHOPPING]: {
        'weekend': isWeekend ? 0.7 : 0.5,
        'evening': hour >= 18 && hour <= 21 ? 0.8 : 0.5,
        'default': 0.5
      },
      [PlaceCategory.TRANSPORT]: {
        'rush_morning': hour >= 7 && hour <= 9 ? 0.9 : 0.4,
        'rush_evening': hour >= 17 && hour <= 19 ? 0.9 : 0.4,
        'default': 0.4
      },
      [PlaceCategory.GOVERNMENT]: {
        'business_hours': hour >= 9 && hour <= 17 && !isWeekend ? 0.6 : 0.1,
        'default': 0.2
      },
      [PlaceCategory.EDUCATION]: {
        'school_hours': hour >= 8 && hour <= 17 && !isWeekend ? 0.7 : 0.2,
        'default': 0.3
      },
      [PlaceCategory.ENTERTAINMENT]: {
        'weekend': isWeekend ? 0.8 : 0.5,
        'evening': hour >= 18 ? 0.7 : 0.4,
        'default': 0.5
      },
      [PlaceCategory.OTHER]: {
        'default': 0.4
      }
    };

    const categoryBaseline = baselines[category];
    
    // 选择最匹配的时间段
    for (const [timeSlot, value] of Object.entries(categoryBaseline)) {
      if (timeSlot !== 'default') {
        const conditions = this.evaluateTimeSlotConditions(timeSlot, hour, isWeekend);
        if (conditions) {
          return value;
        }
      }
    }

    return categoryBaseline.default;
  }

  /**
   * 评估时间段条件
   */
  private evaluateTimeSlotConditions(timeSlot: string, hour: number, isWeekend: boolean): boolean {
    switch (timeSlot) {
      case 'breakfast':
        return hour >= 7 && hour <= 9;
      case 'lunch':
        return hour >= 11 && hour <= 13;
      case 'dinner':
        return hour >= 17 && hour <= 19;
      case 'morning':
        return hour >= 8 && hour <= 11;
      case 'afternoon':
        return hour >= 14 && hour <= 16;
      case 'business_hours':
        return hour >= 9 && hour <= 17;
      case 'peak':
        return hour >= 9 && hour <= 11;
      case 'weekend':
        return isWeekend;
      case 'evening':
        return hour >= 18 && hour <= 21;
      case 'rush_morning':
        return hour >= 7 && hour <= 9;
      case 'rush_evening':
        return hour >= 17 && hour <= 19;
      case 'school_hours':
        return hour >= 8 && hour <= 17 && !isWeekend;
      default:
        return false;
    }
  }

  /**
   * 获取历史模式
   */
  private getHistoricalPattern(placeId: string, hour: number, dayOfWeek: number): HistoricalPattern | null {
    const patterns = this.patterns.get(placeId);
    if (!patterns) return null;

    return patterns.find(p => p.hour === hour && p.dayOfWeek === dayOfWeek) || null;
  }

  /**
   * 数字转换为拥挤程度枚举
   */
  private numberToCrowdLevel(value: number): CrowdLevel {
    if (value <= 0.25) return CrowdLevel.LOW;
    if (value <= 0.5) return CrowdLevel.MEDIUM;
    if (value <= 0.75) return CrowdLevel.HIGH;
    return CrowdLevel.VERY_HIGH;
  }

  /**
   * 更新历史数据
   */
  private updateHistoricalData(placeId: string, reports: Report[]): void {
    this.historicalData.set(placeId, reports);
    this.updatePatterns(placeId, reports);
  }

  /**
   * 更新历史模式
   */
  private updatePatterns(placeId: string, reports: Report[]): void {
    const patterns: Map<string, { total: number; count: number }> = new Map();

    for (const report of reports) {
      if (report.data.crowdLevel) {
        const hour = report.timestamp.getHours();
        const dayOfWeek = report.timestamp.getDay();
        const key = `${hour}-${dayOfWeek}`;
        
        const crowdValue = this.crowdLevelToNumber(report.data.crowdLevel);
        
        if (!patterns.has(key)) {
          patterns.set(key, { total: 0, count: 0 });
        }
        
        const pattern = patterns.get(key)!;
        pattern.total += crowdValue;
        pattern.count += 1;
      }
    }

    const historicalPatterns: HistoricalPattern[] = [];
    for (const [key, data] of patterns.entries()) {
      const [hour, dayOfWeek] = key.split('-').map(Number);
      historicalPatterns.push({
        hour,
        dayOfWeek,
        averageCrowdLevel: data.total / data.count,
        sampleCount: data.count
      });
    }

    this.patterns.set(placeId, historicalPatterns);
  }

  /**
   * 拥挤程度枚举转换为数字
   */
  private crowdLevelToNumber(crowdLevel: CrowdLevel): number {
    switch (crowdLevel) {
      case CrowdLevel.LOW: return 0.125;
      case CrowdLevel.MEDIUM: return 0.375;
      case CrowdLevel.HIGH: return 0.625;
      case CrowdLevel.VERY_HIGH: return 0.875;
      default: return 0.5;
    }
  }
}

// 导出单例实例
export const crowdPredictionEngine = new CrowdPredictionEngine();