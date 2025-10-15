import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Suggestion, Place, User, CrowdLevel, PlaceCategory } from '@/types';
import { recommendEngine, RecommendationContext } from '@/lib/algorithms/recommendEngine';
import { crowdPredictionEngine } from '@/lib/algorithms/crowdPrediction';
import { userProfilingEngine, UserProfile } from '@/lib/algorithms/userProfiling';

export interface SuggestionPreferences {
  crowdTolerance: CrowdLevel;
  maxWaitTime: number; // 分钟
  maxDistance: number; // 公里
  preferredCategories: PlaceCategory[];
  avoidCategories: PlaceCategory[];
  timePreferences: {
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
    night: boolean;
  };
  notificationSettings: {
    enabled: boolean;
    quietHours: {
      start: string; // HH:mm
      end: string; // HH:mm
    };
    frequency: 'immediate' | 'hourly' | 'daily';
  };
}

export interface SuggestionHistory {
  id: string;
  suggestion: Suggestion;
  userAction: 'accepted' | 'rejected' | 'ignored';
  actionTime: Date;
  feedback?: string;
  rating?: number; // 1-5
}

export interface TodaySuggestion {
  id: string;
  type: 'avoid_crowd' | 'best_time' | 'alternative' | 'route_optimization' | 'personal';
  title: string;
  description: string;
  suggestion: Suggestion;
  priority: 'high' | 'medium' | 'low';
  expiresAt: Date;
}

export interface PlanSuggestion {
  id: string;
  planName: string;
  places: Place[];
  optimizedRoute: {
    order: Place[];
    estimatedTotalTime: number;
    estimatedTotalDistance: number;
    suggestions: string[];
  };
  createdAt: Date;
}

export interface TrendPrediction {
  placeId: string;
  place: Place;
  predictions: {
    time: Date;
    crowdLevel: CrowdLevel;
    waitTime: number;
    confidence: number;
  }[];
  bestTimes: Date[];
  worstTimes: Date[];
}

interface SuggestionState {
  // 用户偏好
  preferences: SuggestionPreferences;
  userProfile: UserProfile | null;
  
  // 建议数据
  todaySuggestions: TodaySuggestion[];
  suggestionHistory: SuggestionHistory[];
  planSuggestions: PlanSuggestion[];
  trendPredictions: TrendPrediction[];
  
  // 个人推荐
  personalRecommendations: Place[];
  
  // 加载状态
  isLoading: boolean;
  isGeneratingSuggestions: boolean;
  isUpdatingPreferences: boolean;
  
  // 错误状态
  error: string | null;
  
  // Actions
  updatePreferences: (preferences: Partial<SuggestionPreferences>) => void;
  generateTodaySuggestions: (user: User, currentLocation?: { lat: number; lng: number }) => Promise<void>;
  generatePlanSuggestion: (places: Place[], planName: string) => Promise<void>;
  generateTrendPredictions: (places: Place[]) => Promise<void>;
  updatePersonalRecommendations: (user: User, places: Place[]) => Promise<void>;
  
  // 建议交互
  acceptSuggestion: (suggestionId: string, feedback?: string, rating?: number) => void;
  rejectSuggestion: (suggestionId: string, reason?: string) => void;
  ignoreSuggestion: (suggestionId: string) => void;
  
  // 历史管理
  getSuggestionHistory: (limit?: number) => SuggestionHistory[];
  clearHistory: () => void;
  
  // 用户画像
  buildUserProfile: (user: User, reports: any[], suggestionHistory: Suggestion[]) => Promise<void>;
  
  // 工具函数
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

const defaultPreferences: SuggestionPreferences = {
  crowdTolerance: CrowdLevel.MEDIUM,
  maxWaitTime: 30,
  maxDistance: 10,
  preferredCategories: [],
  avoidCategories: [],
  timePreferences: {
    morning: true,
    afternoon: true,
    evening: true,
    night: false
  },
  notificationSettings: {
    enabled: true,
    quietHours: {
      start: '22:00',
      end: '08:00'
    },
    frequency: 'hourly'
  }
};

export const useSuggestionStore = create<SuggestionState>()(
  devtools(
    persist(
      (set, get) => ({
        // 初始状态
        preferences: defaultPreferences,
        userProfile: null,
        todaySuggestions: [],
        suggestionHistory: [],
        planSuggestions: [],
        trendPredictions: [],
        personalRecommendations: [],
        isLoading: false,
        isGeneratingSuggestions: false,
        isUpdatingPreferences: false,
        error: null,

        // 更新偏好设置
        updatePreferences: (preferences) => {
          set((state) => ({
            preferences: { ...state.preferences, ...preferences },
            isUpdatingPreferences: false
          }));
        },

        // 生成今日建议
        generateTodaySuggestions: async (user, currentLocation) => {
          set({ isGeneratingSuggestions: true, error: null });
          
          try {
            const { preferences, userProfile } = get();
            
            // 构建推荐上下文
            const context: RecommendationContext = {
              user,
              currentLocation,
              maxDistance: preferences.maxDistance,
              avoidCrowdLevel: preferences.crowdTolerance === CrowdLevel.LOW ? 
                [CrowdLevel.HIGH, CrowdLevel.VERY_HIGH] : 
                preferences.crowdTolerance === CrowdLevel.MEDIUM ?
                [CrowdLevel.VERY_HIGH] : []
            };

            // 生成建议
            const suggestions = await recommendEngine.generateSuggestions(context);
            
            // 转换为今日建议格式
            const todaySuggestions: TodaySuggestion[] = suggestions.map((suggestion, index) => ({
              id: `today_${suggestion.id}_${Date.now()}_${index}`,
              type: get().determineSuggestionType(suggestion),
              title: get().generateSuggestionTitle(suggestion),
              description: suggestion.reason,
              suggestion,
              priority: suggestion.confidence > 0.8 ? 'high' : 
                       suggestion.confidence > 0.5 ? 'medium' : 'low',
              expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000) // 4小时后过期
            }));

            set({ 
              todaySuggestions,
              isGeneratingSuggestions: false 
            });

          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : '生成建议失败',
              isGeneratingSuggestions: false 
            });
          }
        },

        // 生成计划建议
        generatePlanSuggestion: async (places, planName) => {
          set({ isLoading: true, error: null });
          
          try {
            // 这里实现路线优化逻辑
            const optimizedOrder = [...places]; // 简化实现，实际需要优化算法
            const estimatedTotalTime = places.reduce((total, place) => total + place.waitTime, 0);
            const estimatedTotalDistance = places.length * 2; // 简化计算

            const planSuggestion: PlanSuggestion = {
              id: `plan_${Date.now()}`,
              planName,
              places,
              optimizedRoute: {
                order: optimizedOrder,
                estimatedTotalTime,
                estimatedTotalDistance,
                suggestions: [
                  '建议在非高峰时段出行',
                  '可考虑调整访问顺序以减少等待时间',
                  '预留充足的交通时间'
                ]
              },
              createdAt: new Date()
            };

            set((state) => ({
              planSuggestions: [...state.planSuggestions, planSuggestion],
              isLoading: false
            }));

          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : '生成计划建议失败',
              isLoading: false 
            });
          }
        },

        // 生成趋势预测
        generateTrendPredictions: async (places) => {
          set({ isLoading: true, error: null });
          
          try {
            const predictions: TrendPrediction[] = [];
            const now = new Date();
            const endTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 未来24小时

            for (const place of places.slice(0, 5)) { // 限制数量
              const crowdTrend = await crowdPredictionEngine.predictCrowdTrend(
                place, 
                now, 
                endTime, 
                60 // 每小时一个预测点
              );

              const trendPrediction: TrendPrediction = {
                placeId: place.id,
                place,
                predictions: crowdTrend.map(prediction => ({
                  time: prediction.timeWindow.start,
                  crowdLevel: prediction.predictedCrowdLevel,
                  waitTime: Math.round(Math.random() * 30 + 5), // 简化实现
                  confidence: prediction.confidence
                })),
                bestTimes: [], // 需要基于预测数据计算
                worstTimes: [] // 需要基于预测数据计算
              };

              // 找出最佳和最差时间
              const sortedByWaitTime = [...trendPrediction.predictions].sort((a, b) => a.waitTime - b.waitTime);
              trendPrediction.bestTimes = sortedByWaitTime.slice(0, 3).map(p => p.time);
              trendPrediction.worstTimes = sortedByWaitTime.slice(-3).map(p => p.time);

              predictions.push(trendPrediction);
            }

            set({ 
              trendPredictions: predictions,
              isLoading: false 
            });

          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : '生成趋势预测失败',
              isLoading: false 
            });
          }
        },

        // 更新个人推荐
        updatePersonalRecommendations: async (user, places) => {
          set({ isLoading: true, error: null });
          
          try {
            const recommendations = userProfilingEngine.recommendPlacesForUser(
              user.id,
              places,
              new Date()
            );

            set({ 
              personalRecommendations: recommendations.slice(0, 10),
              isLoading: false 
            });

          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : '更新个人推荐失败',
              isLoading: false 
            });
          }
        },

        // 接受建议
        acceptSuggestion: (suggestionId, feedback, rating) => {
          const { todaySuggestions } = get();
          const suggestion = todaySuggestions.find(s => s.id === suggestionId);
          
          if (suggestion) {
            const historyItem: SuggestionHistory = {
              id: `history_${Date.now()}`,
              suggestion: suggestion.suggestion,
              userAction: 'accepted',
              actionTime: new Date(),
              feedback,
              rating
            };

            set((state) => ({
              suggestionHistory: [...state.suggestionHistory, historyItem],
              todaySuggestions: state.todaySuggestions.filter(s => s.id !== suggestionId)
            }));
          }
        },

        // 拒绝建议
        rejectSuggestion: (suggestionId, reason) => {
          const { todaySuggestions } = get();
          const suggestion = todaySuggestions.find(s => s.id === suggestionId);
          
          if (suggestion) {
            const historyItem: SuggestionHistory = {
              id: `history_${Date.now()}`,
              suggestion: suggestion.suggestion,
              userAction: 'rejected',
              actionTime: new Date(),
              feedback: reason
            };

            set((state) => ({
              suggestionHistory: [...state.suggestionHistory, historyItem],
              todaySuggestions: state.todaySuggestions.filter(s => s.id !== suggestionId)
            }));
          }
        },

        // 忽略建议
        ignoreSuggestion: (suggestionId) => {
          const { todaySuggestions } = get();
          const suggestion = todaySuggestions.find(s => s.id === suggestionId);
          
          if (suggestion) {
            const historyItem: SuggestionHistory = {
              id: `history_${Date.now()}`,
              suggestion: suggestion.suggestion,
              userAction: 'ignored',
              actionTime: new Date()
            };

            set((state) => ({
              suggestionHistory: [...state.suggestionHistory, historyItem],
              todaySuggestions: state.todaySuggestions.filter(s => s.id !== suggestionId)
            }));
          }
        },

        // 获取建议历史
        getSuggestionHistory: (limit = 50) => {
          const { suggestionHistory } = get();
          return suggestionHistory
            .sort((a, b) => b.actionTime.getTime() - a.actionTime.getTime())
            .slice(0, limit);
        },

        // 清除历史
        clearHistory: () => {
          set({ suggestionHistory: [] });
        },

        // 构建用户画像
        buildUserProfile: async (user, reports, suggestionHistory) => {
          set({ isLoading: true, error: null });
          
          try {
            const profile = await userProfilingEngine.buildUserProfile(
              user,
              reports,
              suggestionHistory
            );

            set({ 
              userProfile: profile,
              isLoading: false 
            });

          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : '构建用户画像失败',
              isLoading: false 
            });
          }
        },

        // 工具函数
        clearError: () => set({ error: null }),
        setLoading: (loading) => set({ isLoading: loading }),

        // 辅助方法
        determineSuggestionType: (suggestion: Suggestion): TodaySuggestion['type'] => {
          if (suggestion.alternativeOptions.length > 0) return 'alternative';
          if (suggestion.confidence > 0.8) return 'best_time';
          if (suggestion.estimatedCrowdLevel === CrowdLevel.LOW) return 'avoid_crowd';
          return 'personal';
        },

        generateSuggestionTitle: (suggestion: Suggestion): string => {
          const place = suggestion.place;
          const crowdLevel = suggestion.estimatedCrowdLevel;
          
          switch (crowdLevel) {
            case CrowdLevel.LOW:
              return `${place.name} 人流较少，是个好时机`;
            case CrowdLevel.MEDIUM:
              return `${place.name} 人流适中，可以前往`;
            case CrowdLevel.HIGH:
              return `${place.name} 人流较多，建议等待`;
            case CrowdLevel.VERY_HIGH:
              return `${place.name} 非常拥挤，建议改时间`;
            default:
              return `${place.name} 的智能建议`;
          }
        }
      }),
      {
        name: 'suggestion-storage',
        partialize: (state) => ({
          preferences: state.preferences,
          suggestionHistory: state.suggestionHistory.slice(-100), // 只保存最近100条历史
          planSuggestions: state.planSuggestions.slice(-20), // 只保存最近20个计划
        }),
      }
    ),
    { name: 'suggestion-store' }
  )
);