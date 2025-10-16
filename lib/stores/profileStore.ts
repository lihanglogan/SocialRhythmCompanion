import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { 
  User, 
  UserBadge, 
  UserReportHistory, 
  UserReputation, 
  CompanionMatch,
  Report,
  Place,
  BadgeType
} from '@/types';

// 个人统计数据接口
export interface UserStats {
  // 使用统计
  totalUsageTime: number; // 总使用时长（分钟）
  dailyVisits: number; // 今日访问次数
  activeDays: number; // 活跃天数
  
  // 上报贡献
  totalReports: number; // 总上报次数
  verifiedReports: number; // 验证通过的上报
  reportAccuracy: number; // 上报准确率 (0-100)
  reputationScore: number; // 信誉分
  
  // 匹配记录
  totalMatches: number; // 总匹配次数
  completedMatches: number; // 完成的匹配
  matchSuccessRate: number; // 匹配成功率
  averageRating: number; // 平均评分
  
  // 社区贡献
  helpCount: number; // 帮助他人次数
  communityRank: number; // 社区排名
  influenceScore: number; // 影响力指数
  
  // 节约时间
  timeSaved: number; // 节约的等待时间（分钟）
}

// 历史记录接口
export interface UserHistory {
  visitHistory: Array<{
    id: string;
    place: Place;
    visitTime: Date;
    duration?: number;
  }>;
  
  reportHistory: Report[];
  
  matchHistory: CompanionMatch[];
  
  suggestionHistory: Array<{
    id: string;
    content: string;
    adopted: boolean;
    createdAt: Date;
  }>;
  
  searchHistory: Array<{
    id: string;
    query: string;
    results: number;
    timestamp: Date;
  }>;
  
  bookmarks: Array<{
    id: string;
    type: 'place' | 'suggestion' | 'user';
    targetId: string;
    createdAt: Date;
  }>;
}

// 成就系统接口
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'bronze' | 'silver' | 'gold' | 'platinum';
  category: 'reporter' | 'matcher' | 'explorer' | 'helper' | 'special';
  requirement: number;
  progress: number;
  unlocked: boolean;
  unlockedAt?: Date;
}

// 设置接口
export interface ProfileSettings {
  // 通知设置
  notifications: {
    push: boolean;
    email: boolean;
    sms: boolean;
    matchUpdates: boolean;
    reportFeedback: boolean;
    suggestions: boolean;
    marketing: boolean;
  };
  
  // 隐私设置
  privacy: {
    profileVisibility: 'public' | 'friends' | 'private';
    locationSharing: boolean;
    showOnlineStatus: boolean;
    allowDirectMessages: boolean;
    showStats: boolean;
    showBadges: boolean;
  };
  
  // 偏好设置
  preferences: {
    crowdTolerance: 'low' | 'medium' | 'high';
    maxWaitTime: number;
    preferredTimeSlots: string[];
    avoidedTimeSlots: string[];
    accessibilityNeeds: string[];
    interests: string[];
  };
  
  // 主题设置
  appearance: {
    theme: 'light' | 'dark' | 'system';
    fontSize: 'small' | 'medium' | 'large';
    language: 'zh' | 'en';
    animations: boolean;
  };
}

// 社交功能接口
export interface SocialData {
  friends: Array<{
    id: string;
    user: User;
    status: 'pending' | 'accepted' | 'blocked';
    addedAt: Date;
  }>;
  
  friendRequests: Array<{
    id: string;
    from: User;
    message?: string;
    createdAt: Date;
  }>;
  
  blockedUsers: Array<{
    id: string;
    user: User;
    blockedAt: Date;
    reason?: string;
  }>;
  
  groups: Array<{
    id: string;
    name: string;
    description: string;
    memberCount: number;
    role: 'admin' | 'member';
    joinedAt: Date;
  }>;
  
  activities: Array<{
    id: string;
    type: 'like' | 'comment' | 'share' | 'match' | 'report';
    content: string;
    timestamp: Date;
    isPublic: boolean;
  }>;
}

// 个人中心状态接口
interface ProfileState {
  // 基础数据
  userStats: UserStats | null;
  userHistory: UserHistory | null;
  achievements: Achievement[];
  badges: UserBadge[];
  settings: ProfileSettings;
  socialData: SocialData | null;
  
  // 加载状态
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  
  // 当前选中的标签页
  activeTab: 'overview' | 'stats' | 'history' | 'achievements' | 'settings' | 'social';
  
  // Actions
  setActiveTab: (tab: ProfileState['activeTab']) => void;
  loadUserStats: () => Promise<void>;
  loadUserHistory: () => Promise<void>;
  loadAchievements: () => Promise<void>;
  loadSocialData: () => Promise<void>;
  updateSettings: (settings: Partial<ProfileSettings>) => Promise<void>;
  exportUserData: (format: 'json' | 'csv') => Promise<void>;
  deleteUserData: (dataType: string) => Promise<void>;
  addBookmark: (type: 'place' | 'suggestion' | 'user', targetId: string) => Promise<void>;
  removeBookmark: (bookmarkId: string) => Promise<void>;
  sendFriendRequest: (userId: string, message?: string) => Promise<void>;
  acceptFriendRequest: (requestId: string) => Promise<void>;
  blockUser: (userId: string, reason?: string) => Promise<void>;
  reportUser: (userId: string, reason: string, description: string) => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

// 默认设置
const defaultSettings: ProfileSettings = {
  notifications: {
    push: true,
    email: true,
    sms: false,
    matchUpdates: true,
    reportFeedback: true,
    suggestions: true,
    marketing: false,
  },
  privacy: {
    profileVisibility: 'public',
    locationSharing: true,
    showOnlineStatus: true,
    allowDirectMessages: true,
    showStats: true,
    showBadges: true,
  },
  preferences: {
    crowdTolerance: 'medium',
    maxWaitTime: 30,
    preferredTimeSlots: [],
    avoidedTimeSlots: [],
    accessibilityNeeds: [],
    interests: [],
  },
  appearance: {
    theme: 'system',
    fontSize: 'medium',
    language: 'zh',
    animations: true,
  },
};

// 模拟数据生成函数
const generateMockStats = (): UserStats => ({
  totalUsageTime: 1250,
  dailyVisits: 12,
  activeDays: 45,
  totalReports: 89,
  verifiedReports: 76,
  reportAccuracy: 85.4,
  reputationScore: 892,
  totalMatches: 34,
  completedMatches: 31,
  matchSuccessRate: 91.2,
  averageRating: 4.7,
  helpCount: 156,
  communityRank: 23,
  influenceScore: 678,
  timeSaved: 340,
});

const generateMockAchievements = (): Achievement[] => [
  {
    id: '1',
    name: '新手上路',
    description: '完成首次上报',
    icon: '🎯',
    type: 'bronze',
    category: 'reporter',
    requirement: 1,
    progress: 1,
    unlocked: true,
    unlockedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: '数据达人',
    description: '上报100次场所信息',
    icon: '📊',
    type: 'gold',
    category: 'reporter',
    requirement: 100,
    progress: 89,
    unlocked: false,
  },
  {
    id: '3',
    name: '社交高手',
    description: '成功匹配50次同行',
    icon: '🤝',
    type: 'silver',
    category: 'matcher',
    requirement: 50,
    progress: 34,
    unlocked: false,
  },
  {
    id: '4',
    name: '探索者',
    description: '访问100个不同场所',
    icon: '🗺️',
    type: 'silver',
    category: 'explorer',
    requirement: 100,
    progress: 67,
    unlocked: false,
  },
  {
    id: '5',
    name: '热心助人',
    description: '帮助他人200次',
    icon: '❤️',
    type: 'platinum',
    category: 'helper',
    requirement: 200,
    progress: 156,
    unlocked: false,
  },
];

export const useProfileStore = create<ProfileState>()(
  devtools(
    persist(
      (set, get) => ({
        // 初始状态
        userStats: null,
        userHistory: null,
        achievements: [],
        badges: [],
        settings: defaultSettings,
        socialData: null,
        isLoading: false,
        isUpdating: false,
        error: null,
        activeTab: 'overview',

        // Actions
        setActiveTab: (tab) => set({ activeTab: tab }),

        loadUserStats: async () => {
          set({ isLoading: true, error: null });
          try {
            // 模拟API调用
            await new Promise(resolve => setTimeout(resolve, 1000));
            const stats = generateMockStats();
            set({ userStats: stats, isLoading: false });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : '加载统计数据失败',
              isLoading: false 
            });
          }
        },

        loadUserHistory: async () => {
          set({ isLoading: true, error: null });
          try {
            // 模拟API调用
            await new Promise(resolve => setTimeout(resolve, 800));
            const history: UserHistory = {
              visitHistory: [],
              reportHistory: [],
              matchHistory: [],
              suggestionHistory: [],
              searchHistory: [],
              bookmarks: [],
            };
            set({ userHistory: history, isLoading: false });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : '加载历史记录失败',
              isLoading: false 
            });
          }
        },

        loadAchievements: async () => {
          set({ isLoading: true, error: null });
          try {
            // 模拟API调用
            await new Promise(resolve => setTimeout(resolve, 600));
            const achievements = generateMockAchievements();
            set({ achievements, isLoading: false });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : '加载成就数据失败',
              isLoading: false 
            });
          }
        },

        loadSocialData: async () => {
          set({ isLoading: true, error: null });
          try {
            // 模拟API调用
            await new Promise(resolve => setTimeout(resolve, 700));
            const socialData: SocialData = {
              friends: [],
              friendRequests: [],
              blockedUsers: [],
              groups: [],
              activities: [],
            };
            set({ socialData, isLoading: false });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : '加载社交数据失败',
              isLoading: false 
            });
          }
        },

        updateSettings: async (newSettings) => {
          set({ isUpdating: true, error: null });
          try {
            // 模拟API调用
            await new Promise(resolve => setTimeout(resolve, 500));
            const currentSettings = get().settings;
            const updatedSettings = { ...currentSettings, ...newSettings };
            set({ settings: updatedSettings, isUpdating: false });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : '更新设置失败',
              isUpdating: false 
            });
          }
        },

        exportUserData: async (format) => {
          set({ isLoading: true, error: null });
          try {
            // 模拟数据导出
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const { userStats, userHistory, achievements } = get();
            const exportData = {
              stats: userStats,
              history: userHistory,
              achievements: achievements,
              exportedAt: new Date().toISOString(),
            };

            const dataStr = format === 'json' 
              ? JSON.stringify(exportData, null, 2)
              : convertToCSV(exportData);
            
            const blob = new Blob([dataStr], { 
              type: format === 'json' ? 'application/json' : 'text/csv' 
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `social-rhythm-data.${format}`;
            link.click();
            URL.revokeObjectURL(url);
            
            set({ isLoading: false });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : '导出数据失败',
              isLoading: false 
            });
          }
        },

        deleteUserData: async (dataType) => {
          set({ isLoading: true, error: null });
          try {
            // 模拟删除操作
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            switch (dataType) {
              case 'history':
                set({ userHistory: null });
                break;
              case 'stats':
                set({ userStats: null });
                break;
              case 'achievements':
                set({ achievements: [] });
                break;
              case 'all':
                set({ 
                  userStats: null, 
                  userHistory: null, 
                  achievements: [], 
                  socialData: null 
                });
                break;
            }
            
            set({ isLoading: false });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : '删除数据失败',
              isLoading: false 
            });
          }
        },

        addBookmark: async (type, targetId) => {
          set({ isUpdating: true, error: null });
          try {
            await new Promise(resolve => setTimeout(resolve, 300));
            // 模拟添加书签
            set({ isUpdating: false });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : '添加收藏失败',
              isUpdating: false 
            });
          }
        },

        removeBookmark: async (bookmarkId) => {
          set({ isUpdating: true, error: null });
          try {
            await new Promise(resolve => setTimeout(resolve, 300));
            // 模拟删除书签
            set({ isUpdating: false });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : '删除收藏失败',
              isUpdating: false 
            });
          }
        },

        sendFriendRequest: async (userId, message) => {
          set({ isUpdating: true, error: null });
          try {
            await new Promise(resolve => setTimeout(resolve, 500));
            // 模拟发送好友请求
            set({ isUpdating: false });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : '发送好友请求失败',
              isUpdating: false 
            });
          }
        },

        acceptFriendRequest: async (requestId) => {
          set({ isUpdating: true, error: null });
          try {
            await new Promise(resolve => setTimeout(resolve, 500));
            // 模拟接受好友请求
            set({ isUpdating: false });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : '接受好友请求失败',
              isUpdating: false 
            });
          }
        },

        blockUser: async (userId, reason) => {
          set({ isUpdating: true, error: null });
          try {
            await new Promise(resolve => setTimeout(resolve, 500));
            // 模拟拉黑用户
            set({ isUpdating: false });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : '拉黑用户失败',
              isUpdating: false 
            });
          }
        },

        reportUser: async (userId, reason, description) => {
          set({ isUpdating: true, error: null });
          try {
            await new Promise(resolve => setTimeout(resolve, 500));
            // 模拟举报用户
            set({ isUpdating: false });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : '举报用户失败',
              isUpdating: false 
            });
          }
        },

        clearError: () => set({ error: null }),

        setLoading: (loading) => set({ isLoading: loading }),
      }),
      {
        name: 'profile-storage',
        partialize: (state) => ({
          settings: state.settings,
          activeTab: state.activeTab,
        }),
      }
    ),
    { name: 'profile-store' }
  )
);

// 辅助函数：将数据转换为CSV格式
function convertToCSV(data: any): string {
  // 简化的CSV转换实现
  return `导出时间,${data.exportedAt}\n总使用时长,${data.stats?.totalUsageTime || 0}分钟\n活跃天数,${data.stats?.activeDays || 0}天\n上报次数,${data.stats?.totalReports || 0}次\n匹配次数,${data.stats?.totalMatches || 0}次`;
}