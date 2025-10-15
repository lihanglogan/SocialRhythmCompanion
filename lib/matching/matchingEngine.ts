/**
 * 匹配算法核心引擎
 * 实现智能匹配、相似度计算和推荐系统
 */

import { User, CompanionMatch, MatchPreferences, PlaceCategory } from '@/types';

// 匹配得分权重配置
export const MATCH_WEIGHTS = {
  location: 0.3,      // 地理位置权重
  interests: 0.25,    // 兴趣爱好权重
  age: 0.15,          // 年龄权重
  gender: 0.1,        // 性别偏好权重
  safety: 0.1,        // 安全级别权重
  activity: 0.1,      // 活动时间权重
} as const;

// 匹配阈值
export const MATCH_THRESHOLDS = {
  excellent: 0.85,    // 优秀匹配
  good: 0.7,          // 良好匹配
  acceptable: 0.5,    // 可接受匹配
  minimum: 0.3,       // 最低匹配
} as const;

/**
 * 地理位置相似度计算
 */
export function calculateLocationSimilarity(
  user1: { latitude: number; longitude: number },
  user2: { latitude: number; longitude: number },
  maxDistance: number = 5000 // 默认5公里
): number {
  const distance = calculateDistance(
    user1.latitude, user1.longitude,
    user2.latitude, user2.longitude
  );
  
  if (distance > maxDistance) return 0;
  
  // 距离越近，相似度越高
  return Math.max(0, 1 - (distance / maxDistance));
}

/**
 * 计算两点间距离（米）
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // 地球半径（米）
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

/**
 * 兴趣爱好相似度计算
 */
export function calculateInterestSimilarity(
  interests1: PlaceCategory[],
  interests2: PlaceCategory[]
): number {
  if (interests1.length === 0 || interests2.length === 0) return 0;
  
  const intersection = interests1.filter(interest => 
    interests2.includes(interest)
  ).length;
  
  const union = new Set([...interests1, ...interests2]).size;
  
  // Jaccard相似度
  return intersection / union;
}

/**
 * 年龄相似度计算
 */
export function calculateAgeSimilarity(age1: number, age2: number): number {
  const ageDiff = Math.abs(age1 - age2);
  
  // 年龄差越小，相似度越高
  if (ageDiff <= 2) return 1;
  if (ageDiff <= 5) return 0.8;
  if (ageDiff <= 10) return 0.6;
  if (ageDiff <= 15) return 0.4;
  if (ageDiff <= 20) return 0.2;
  
  return 0;
}

/**
 * 性别偏好匹配
 */
export function calculateGenderCompatibility(
  user1: { gender: string; genderPreference?: string },
  user2: { gender: string; genderPreference?: string }
): number {
  // 如果没有性别偏好，默认兼容
  if (!user1.genderPreference && !user2.genderPreference) return 1;
  
  let score = 0;
  
  // 检查用户1的偏好
  if (!user1.genderPreference || 
      user1.genderPreference === 'any' || 
      user1.genderPreference === user2.gender) {
    score += 0.5;
  }
  
  // 检查用户2的偏好
  if (!user2.genderPreference || 
      user2.genderPreference === 'any' || 
      user2.genderPreference === user1.gender) {
    score += 0.5;
  }
  
  return score;
}

/**
 * 安全级别兼容性
 */
export function calculateSafetyCompatibility(
  safetyLevel1: number,
  safetyLevel2: number
): number {
  const diff = Math.abs(safetyLevel1 - safetyLevel2);
  
  // 安全级别差异越小，兼容性越高
  if (diff === 0) return 1;
  if (diff === 1) return 0.8;
  if (diff === 2) return 0.6;
  if (diff === 3) return 0.4;
  
  return 0.2;
}

/**
 * 活动时间兼容性
 */
export function calculateTimeCompatibility(
  preferredTime1: string[],
  preferredTime2: string[]
): number {
  if (preferredTime1.length === 0 || preferredTime2.length === 0) return 0.5;
  
  const intersection = preferredTime1.filter(time => 
    preferredTime2.includes(time)
  ).length;
  
  const union = new Set([...preferredTime1, ...preferredTime2]).size;
  
  return intersection / union;
}

/**
 * 综合匹配得分计算
 */
export function calculateMatchScore(
  currentUser: User & { preferences?: MatchPreferences },
  candidateUser: User & { preferences?: MatchPreferences }
): number {
  let totalScore = 0;
  
  // 地理位置得分
  if (currentUser.latitude && currentUser.longitude && 
      candidateUser.latitude && candidateUser.longitude) {
    const maxDistance = currentUser.preferences?.maxDistance || 5000;
    const locationScore = calculateLocationSimilarity(
      { latitude: currentUser.latitude, longitude: currentUser.longitude },
      { latitude: candidateUser.latitude, longitude: candidateUser.longitude },
      maxDistance
    );
    totalScore += locationScore * MATCH_WEIGHTS.location;
  }
  
  // 兴趣爱好得分
  if (currentUser.preferences?.interests && candidateUser.preferences?.interests) {
    const interestScore = calculateInterestSimilarity(
      currentUser.preferences.interests,
      candidateUser.preferences.interests
    );
    totalScore += interestScore * MATCH_WEIGHTS.interests;
  }
  
  // 年龄得分
  if (currentUser.age && candidateUser.age) {
    const ageScore = calculateAgeSimilarity(currentUser.age, candidateUser.age);
    totalScore += ageScore * MATCH_WEIGHTS.age;
  }
  
  // 性别偏好得分
  const genderScore = calculateGenderCompatibility(
    { 
      gender: currentUser.gender || 'unknown',
      genderPreference: currentUser.preferences?.genderPreference 
    },
    { 
      gender: candidateUser.gender || 'unknown',
      genderPreference: candidateUser.preferences?.genderPreference 
    }
  );
  totalScore += genderScore * MATCH_WEIGHTS.gender;
  
  // 安全级别得分
  if (currentUser.preferences?.safetyLevel && candidateUser.preferences?.safetyLevel) {
    const safetyScore = calculateSafetyCompatibility(
      currentUser.preferences.safetyLevel,
      candidateUser.preferences.safetyLevel
    );
    totalScore += safetyScore * MATCH_WEIGHTS.safety;
  }
  
  // 活动时间得分
  if (currentUser.preferences?.preferredTimes && candidateUser.preferences?.preferredTimes) {
    const timeScore = calculateTimeCompatibility(
      currentUser.preferences.preferredTimes,
      candidateUser.preferences.preferredTimes
    );
    totalScore += timeScore * MATCH_WEIGHTS.activity;
  }
  
  return Math.min(1, totalScore);
}

/**
 * 匹配质量评级
 */
export function getMatchQuality(score: number): {
  level: 'excellent' | 'good' | 'acceptable' | 'poor';
  label: string;
  color: string;
} {
  if (score >= MATCH_THRESHOLDS.excellent) {
    return {
      level: 'excellent',
      label: '完美匹配',
      color: 'text-green-600'
    };
  } else if (score >= MATCH_THRESHOLDS.good) {
    return {
      level: 'good',
      label: '良好匹配',
      color: 'text-blue-600'
    };
  } else if (score >= MATCH_THRESHOLDS.acceptable) {
    return {
      level: 'acceptable',
      label: '一般匹配',
      color: 'text-yellow-600'
    };
  } else {
    return {
      level: 'poor',
      label: '匹配度较低',
      color: 'text-red-600'
    };
  }
}

/**
 * 智能匹配推荐引擎
 */
export class MatchingEngine {
  /**
   * 为用户寻找最佳匹配
   */
  static async findMatches(
    currentUser: User & { preferences?: MatchPreferences },
    candidateUsers: (User & { preferences?: MatchPreferences })[],
    options: {
      limit?: number;
      minScore?: number;
      includeScore?: boolean;
    } = {}
  ): Promise<CompanionMatch[]> {
    const {
      limit = 10,
      minScore = MATCH_THRESHOLDS.minimum,
      includeScore = false
    } = options;
    
    // 计算所有候选用户的匹配得分
    const scoredMatches = candidateUsers
      .filter(user => user.id !== currentUser.id)
      .map(user => ({
        user,
        score: calculateMatchScore(currentUser, user),
        quality: getMatchQuality(calculateMatchScore(currentUser, user))
      }))
      .filter(match => match.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
    
    // 转换为CompanionMatch格式
    return scoredMatches.map((match, index) => ({
      id: `match_${match.user.id}_${Date.now()}_${index}`,
      userId: match.user.id,
      targetUserId: currentUser.id,
      matchScore: includeScore ? match.score : undefined,
      matchQuality: match.quality.level,
      status: 'PENDING',
      createdAt: new Date(),
      user: match.user
    }));
  }
  
  /**
   * 基于位置的快速匹配
   */
  static async quickLocationMatch(
    currentUser: User & { preferences?: MatchPreferences },
    nearbyUsers: (User & { preferences?: MatchPreferences })[],
    maxDistance: number = 1000
  ): Promise<CompanionMatch[]> {
    if (!currentUser.latitude || !currentUser.longitude) {
      throw new Error('用户位置信息不可用');
    }
    
    const locationMatches = nearbyUsers
      .filter(user => 
        user.id !== currentUser.id &&
        user.latitude && user.longitude &&
        calculateDistance(
          currentUser.latitude!, currentUser.longitude!,
          user.latitude, user.longitude
        ) <= maxDistance
      )
      .map(user => ({
        user,
        distance: calculateDistance(
          currentUser.latitude!, currentUser.longitude!,
          user.latitude!, user.longitude!
        )
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 20);
    
    return this.findMatches(
      currentUser,
      locationMatches.map(m => m.user),
      { limit: 10, minScore: 0.3 }
    );
  }
  
  /**
   * 基于兴趣的匹配推荐
   */
  static async interestBasedMatch(
    currentUser: User & { preferences?: MatchPreferences },
    allUsers: (User & { preferences?: MatchPreferences })[],
    targetInterests: PlaceCategory[]
  ): Promise<CompanionMatch[]> {
    const interestMatches = allUsers.filter(user => {
      if (user.id === currentUser.id || !user.preferences?.interests) return false;
      
      return user.preferences.interests.some(interest => 
        targetInterests.includes(interest)
      );
    });
    
    return this.findMatches(currentUser, interestMatches, {
      limit: 15,
      minScore: 0.4
    });
  }
  
  /**
   * 获取匹配统计信息
   */
  static getMatchStats(matches: CompanionMatch[]): {
    total: number;
    byQuality: Record<string, number>;
    averageScore: number;
  } {
    const total = matches.length;
    const byQuality: Record<string, number> = {};
    let totalScore = 0;
    
    matches.forEach(match => {
      const quality = match.matchQuality || 'poor';
      byQuality[quality] = (byQuality[quality] || 0) + 1;
      totalScore += match.matchScore || 0;
    });
    
    return {
      total,
      byQuality,
      averageScore: total > 0 ? totalScore / total : 0
    };
  }
}

export default MatchingEngine;