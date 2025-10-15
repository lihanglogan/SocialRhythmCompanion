import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// 用户状态接口
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: 'zh' | 'en';
    notifications: boolean;
    location: {
      enabled: boolean;
      latitude?: number;
      longitude?: number;
      city?: string;
    };
  };
  socialRhythm: {
    activityLevel: 'low' | 'medium' | 'high';
    preferredTimes: string[];
    avoidTimes: string[];
    socialPreferences: {
      groupSize: 'small' | 'medium' | 'large' | 'any';
      activityTypes: string[];
      mood: 'energetic' | 'calm' | 'social' | 'focused';
    };
  };
}

// 用户状态管理
interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User) => void;
  updateUser: (updates: Partial<User>) => void;
  updatePreferences: (preferences: Partial<User['preferences']>) => void;
  updateSocialRhythm: (socialRhythm: Partial<User['socialRhythm']>) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        setUser: (user) => set({ user, isAuthenticated: true, error: null }),

        updateUser: (updates) => set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null
        })),

        updatePreferences: (preferences) => set((state) => ({
          user: state.user ? {
            ...state.user,
            preferences: { ...state.user.preferences, ...preferences }
          } : null
        })),

        updateSocialRhythm: (socialRhythm) => set((state) => ({
          user: state.user ? {
            ...state.user,
            socialRhythm: { ...state.user.socialRhythm, ...socialRhythm }
          } : null
        })),

        login: async (email: string, password: string) => {
          set({ isLoading: true, error: null });
          try {
            // 这里应该调用实际的登录API
            // 暂时使用模拟数据
            const mockUser: User = {
              id: '1',
              name: '用户',
              email,
              preferences: {
                theme: 'system',
                language: 'zh',
                notifications: true,
                location: {
                  enabled: false,
                },
              },
              socialRhythm: {
                activityLevel: 'medium',
                preferredTimes: ['18:00-22:00'],
                avoidTimes: ['06:00-09:00'],
                socialPreferences: {
                  groupSize: 'medium',
                  activityTypes: ['dining', 'entertainment'],
                  mood: 'social',
                },
              },
            };
            
            set({ user: mockUser, isAuthenticated: true, isLoading: false });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : '登录失败',
              isLoading: false 
            });
          }
        },

        logout: () => set({ 
          user: null, 
          isAuthenticated: false, 
          error: null 
        }),

        clearError: () => set({ error: null }),

        setLoading: (loading) => set({ isLoading: loading }),
      }),
      {
        name: 'user-storage',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    { name: 'user-store' }
  )
);