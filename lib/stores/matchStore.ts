import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { 
  CompanionRequest, 
  CompanionMatch, 
  ChatRoom, 
  ChatMessage, 
  LocationShare,
  SafetyReport,
  UserReputation,
  UserReview,
  MatchPreferences,
  MatchStatus,
  User,
  Place,
  PlaceCategory,
  CrowdLevel,
  Coordinates,
  PlannedMatch
} from '@/types';

interface MatchState {
  // 当前用户的匹配请求
  currentRequest: CompanionRequest | null;
  
  // 匹配结果
  currentMatch: CompanionMatch | null;
  
  // 附近的用户请求
  nearbyRequests: CompanionRequest[];
  
  // 匹配历史
  matchHistory: CompanionMatch[];
  
  // 计划同行
  plannedMatches: PlannedMatch[];
  
  // 聊天室
  activeChat: ChatRoom | null;
  
  // 位置共享
  locationSharing: LocationShare[];
  
  // 用户偏好设置
  preferences: MatchPreferences;
  
  // 用户声誉
  userReputation: UserReputation | null;
  
  // 加载状态
  isLoading: boolean;
  isMatching: boolean;
  error: string | null;
  
  // 匹配相关操作
  createMatchRequest: (request: Partial<CompanionRequest>) => Promise<void>;
  cancelMatchRequest: () => Promise<void>;
  acceptMatch: (matchId: string) => Promise<void>;
  rejectMatch: (matchId: string) => Promise<void>;
  completeMatch: (matchId: string, rating?: number, feedback?: string) => Promise<void>;
  
  // 聊天相关操作
  sendMessage: (content: string, type?: 'text' | 'location') => Promise<void>;
  markMessagesAsRead: (messageIds: string[]) => Promise<void>;
  
  // 位置共享操作
  startLocationSharing: (matchId: string) => Promise<void>;
  stopLocationSharing: (matchId: string) => Promise<void>;
  updateLocation: (coordinates: Coordinates) => Promise<void>;
  
  // 安全相关操作
  reportUser: (report: Partial<SafetyReport>) => Promise<void>;
  blockUser: (userId: string) => Promise<void>;
  
  // 偏好设置
  updatePreferences: (preferences: Partial<MatchPreferences>) => Promise<void>;
  
  // 数据获取
  fetchNearbyRequests: (location: Coordinates, radius?: number) => Promise<void>;
  fetchMatchHistory: () => Promise<void>;
  fetchUserReputation: (userId?: string) => Promise<void>;
  
  // 计划同行相关操作
  createPlannedMatch: (plannedMatch: Partial<PlannedMatch>) => Promise<void>;
  joinPlannedMatch: (matchId: string) => Promise<void>;
  fetchPlannedMatches: () => Promise<void>;
  
  // 清理操作
  clearError: () => void;
  reset: () => void;
}

// 默认匹配偏好
const defaultPreferences: MatchPreferences = {
  maxDistance: 5000, // 5公里
  ageRange: { min: 18, max: 65 },
  genderPreference: 'any',
  groupSizePreference: 2,
  interests: [],
  safetyLevel: 'medium'
};

export const useMatchStore = create<MatchState>()(
  subscribeWithSelector((set, get) => ({
    // 初始状态
    currentRequest: null,
    currentMatch: null,
    nearbyRequests: [],
    matchHistory: [],
    plannedMatches: [],
    activeChat: null,
    locationSharing: [],
    preferences: defaultPreferences,
    userReputation: null,
    isLoading: false,
    isMatching: false,
    error: null,

    // 创建匹配请求
    createMatchRequest: async (requestData) => {
      set({ isLoading: true, error: null });
      
      try {
        // 模拟API调用
        const request: CompanionRequest = {
          id: `req_${Date.now()}`,
          userId: 'current_user', // 实际应用中从用户store获取
          user: {
            id: 'current_user',
            name: '当前用户',
            preferences: get().preferences as any
          } as User,
          placeId: requestData.placeId || '',
          place: requestData.place || {} as Place,
          preferredTime: requestData.preferredTime || new Date(),
          flexibleTime: requestData.flexibleTime || 30,
          maxWaitTime: requestData.maxWaitTime || 15,
          message: requestData.message,
          preferences: get().preferences,
          status: MatchStatus.PENDING,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2小时后过期
        };

        // 开始匹配
        set({ 
          currentRequest: request, 
          isMatching: true,
          isLoading: false 
        });

        // 模拟匹配过程
        setTimeout(() => {
          get().simulateMatching();
        }, 3000);

      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : '创建匹配请求失败',
          isLoading: false 
        });
      }
    },

    // 模拟匹配过程
    simulateMatching: () => {
      const { currentRequest } = get();
      if (!currentRequest) return;

      // 模拟找到匹配
      const mockMatch: CompanionMatch = {
        id: `match_${Date.now()}`,
        requestId: currentRequest.id,
        users: [
          currentRequest.user,
          {
            id: 'user_2',
            name: '张小明',
            avatar: '/avatars/user2.jpg',
            preferences: defaultPreferences as any
          } as User
        ],
        place: currentRequest.place,
        scheduledTime: currentRequest.preferredTime,
        status: MatchStatus.MATCHED,
        chatRoomId: `chat_${Date.now()}`,
        createdAt: new Date()
      };

      // 创建聊天室
      const chatRoom: ChatRoom = {
        id: mockMatch.chatRoomId!,
        matchId: mockMatch.id,
        participants: mockMatch.users,
        messages: [
          {
            id: `msg_${Date.now()}`,
            chatRoomId: mockMatch.chatRoomId!,
            userId: 'system',
            user: { id: 'system', name: '系统', preferences: {} as any } as User,
            content: '匹配成功！你们可以开始协调具体的见面地点和时间了。',
            type: 'system',
            timestamp: new Date(),
            readBy: []
          }
        ],
        isActive: true,
        createdAt: new Date(),
        lastActivity: new Date()
      };

      set({
        currentMatch: mockMatch,
        activeChat: chatRoom,
        isMatching: false,
        currentRequest: { ...currentRequest, status: MatchStatus.MATCHED }
      });
    },

    // 取消匹配请求
    cancelMatchRequest: async () => {
      set({ isLoading: true, error: null });
      
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500));
        
        set({ 
          currentRequest: null,
          isMatching: false,
          isLoading: false 
        });
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : '取消请求失败',
          isLoading: false 
        });
      }
    },

    // 接受匹配
    acceptMatch: async (matchId) => {
      set({ isLoading: true, error: null });
      
      try {
        const { currentMatch } = get();
        if (currentMatch && currentMatch.id === matchId) {
          set({
            currentMatch: {
              ...currentMatch,
              status: MatchStatus.CONFIRMED
            },
            isLoading: false
          });
        }
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : '接受匹配失败',
          isLoading: false 
        });
      }
    },

    // 拒绝匹配
    rejectMatch: async (matchId) => {
      set({ isLoading: true, error: null });
      
      try {
        const { currentMatch } = get();
        if (currentMatch && currentMatch.id === matchId) {
          set({
            currentMatch: null,
            activeChat: null,
            currentRequest: null,
            isLoading: false
          });
        }
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : '拒绝匹配失败',
          isLoading: false 
        });
      }
    },

    // 完成匹配
    completeMatch: async (matchId, rating, feedback) => {
      set({ isLoading: true, error: null });
      
      try {
        const { currentMatch, matchHistory } = get();
        if (currentMatch && currentMatch.id === matchId) {
          const completedMatch = {
            ...currentMatch,
            status: MatchStatus.COMPLETED,
            completedAt: new Date(),
            rating,
            feedback
          };

          set({
            currentMatch: null,
            activeChat: null,
            currentRequest: null,
            matchHistory: [completedMatch, ...matchHistory],
            isLoading: false
          });
        }
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : '完成匹配失败',
          isLoading: false 
        });
      }
    },

    // 发送消息
    sendMessage: async (content, type = 'text') => {
      const { activeChat } = get();
      if (!activeChat) return;

      try {
        const message: ChatMessage = {
          id: `msg_${Date.now()}`,
          chatRoomId: activeChat.id,
          userId: 'current_user',
          user: {
            id: 'current_user',
            name: '当前用户',
            preferences: {} as any
          } as User,
          content,
          type,
          timestamp: new Date(),
          readBy: ['current_user']
        };

        set({
          activeChat: {
            ...activeChat,
            messages: [...activeChat.messages, message],
            lastActivity: new Date()
          }
        });
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : '发送消息失败'
        });
      }
    },

    // 标记消息已读
    markMessagesAsRead: async (messageIds) => {
      const { activeChat } = get();
      if (!activeChat) return;

      try {
        const updatedMessages = activeChat.messages.map(msg => {
          if (messageIds.includes(msg.id) && !msg.readBy.includes('current_user')) {
            return {
              ...msg,
              readBy: [...msg.readBy, 'current_user']
            };
          }
          return msg;
        });

        set({
          activeChat: {
            ...activeChat,
            messages: updatedMessages
          }
        });
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : '标记已读失败'
        });
      }
    },

    // 开始位置共享
    startLocationSharing: async (matchId) => {
      try {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((position) => {
            const locationShare: LocationShare = {
              id: `loc_${Date.now()}`,
              userId: 'current_user',
              matchId,
              coordinates: {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              },
              accuracy: position.coords.accuracy,
              timestamp: new Date(),
              isActive: true
            };

            set(state => ({
              locationSharing: [...state.locationSharing, locationShare]
            }));
          });
        }
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : '开始位置共享失败'
        });
      }
    },

    // 停止位置共享
    stopLocationSharing: async (matchId) => {
      try {
        set(state => ({
          locationSharing: state.locationSharing.map(loc => 
            loc.matchId === matchId ? { ...loc, isActive: false } : loc
          )
        }));
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : '停止位置共享失败'
        });
      }
    },

    // 更新位置
    updateLocation: async (coordinates) => {
      try {
        set(state => ({
          locationSharing: state.locationSharing.map(loc => 
            loc.isActive ? { 
              ...loc, 
              coordinates, 
              timestamp: new Date() 
            } : loc
          )
        }));
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : '更新位置失败'
        });
      }
    },

    // 举报用户
    reportUser: async (reportData) => {
      set({ isLoading: true, error: null });
      
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 这里应该调用实际的API
        console.log('用户举报已提交:', reportData);
        
        set({ isLoading: false });
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : '举报失败',
          isLoading: false 
        });
      }
    },

    // 拉黑用户
    blockUser: async (userId) => {
      set({ isLoading: true, error: null });
      
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 这里应该调用实际的API
        console.log('用户已拉黑:', userId);
        
        set({ isLoading: false });
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : '拉黑失败',
          isLoading: false 
        });
      }
    },

    // 更新偏好设置
    updatePreferences: async (newPreferences) => {
      set({ isLoading: true, error: null });
      
      try {
        const updatedPreferences = {
          ...get().preferences,
          ...newPreferences
        };
        
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500));
        
        set({ 
          preferences: updatedPreferences,
          isLoading: false 
        });
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : '更新偏好失败',
          isLoading: false 
        });
      }
    },

    // 获取附近请求
    fetchNearbyRequests: async (location, radius = 5000) => {
      set({ isLoading: true, error: null });
      
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 模拟数据
        const mockRequests: CompanionRequest[] = [
          {
            id: 'req_1',
            userId: 'user_1',
            user: {
              id: 'user_1',
              name: '李小红',
              avatar: '/avatars/user1.jpg',
              preferences: defaultPreferences as any
            } as User,
            placeId: 'place_1',
            place: {
              id: 'place_1',
              name: '星巴克咖啡',
              address: '朝阳区建国门外大街1号',
              coordinates: { lat: 39.9042, lng: 116.4074 }
            } as Place,
            preferredTime: new Date(Date.now() + 30 * 60 * 1000),
            flexibleTime: 15,
            maxWaitTime: 10,
            message: '想找个人一起喝咖啡聊天',
            preferences: defaultPreferences,
            status: MatchStatus.PENDING,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000)
          }
        ];
        
        set({ 
          nearbyRequests: mockRequests,
          isLoading: false 
        });
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : '获取附近请求失败',
          isLoading: false 
        });
      }
    },

    // 获取匹配历史
    fetchMatchHistory: async () => {
      set({ isLoading: true, error: null });
      
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 这里应该从API获取实际数据
        const mockHistory: CompanionMatch[] = [];
        
        set({ 
          matchHistory: mockHistory,
          isLoading: false 
        });
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : '获取匹配历史失败',
          isLoading: false 
        });
      }
    },

    // 获取用户声誉
    fetchUserReputation: async (userId) => {
      set({ isLoading: true, error: null });
      
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const mockReputation: UserReputation = {
          userId: userId || 'current_user',
          score: 85,
          totalMatches: 12,
          completedMatches: 10,
          cancelledMatches: 2,
          averageRating: 4.2,
          recentReviews: [],
          lastUpdated: new Date()
        };
        
        set({ 
          userReputation: mockReputation,
          isLoading: false 
        });
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : '获取用户声誉失败',
          isLoading: false 
        });
      }
    },

    // 创建计划同行
    createPlannedMatch: async (plannedMatch: Partial<PlannedMatch>) => {
      try {
        set({ isLoading: true });
        
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const newPlannedMatch: PlannedMatch = {
          id: `planned_${Date.now()}`,
          organizerId: get().currentUser?.id || 'user1',
          organizerName: get().currentUser?.name || '当前用户',
          organizerAvatar: get().currentUser?.avatar || '/avatars/default.jpg',
          title: plannedMatch.title || '未命名计划',
          description: plannedMatch.description || '',
          place: plannedMatch.place || {
            id: 'place1',
            name: '默认地点',
            category: 'restaurant' as PlaceCategory,
            address: '默认地址',
            coordinates: { lat: 0, lng: 0 },
            rating: 4.0,
            priceLevel: 2,
            photos: [],
            openingHours: [],
            crowdLevel: 'moderate' as CrowdLevel,
            tags: []
          },
          scheduledTime: plannedMatch.scheduledTime || new Date(),
          maxParticipants: plannedMatch.maxParticipants || 4,
          currentParticipants: 1,
          participants: [{
            id: get().currentUser?.id || 'user1',
            name: get().currentUser?.name || '当前用户',
            avatar: get().currentUser?.avatar || '/avatars/default.jpg',
            joinedAt: new Date()
          }],
          requirements: plannedMatch.requirements || [],
          status: MatchStatus.PENDING,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        set(state => ({
          plannedMatches: [...state.plannedMatches, newPlannedMatch],
          isLoading: false
        }));
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : '创建计划失败',
          isLoading: false 
        });
      }
    },

    // 加入计划同行
    joinPlannedMatch: async (matchId: string) => {
      try {
        set({ isLoading: true });
        
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const currentUser = get().currentUser;
        if (!currentUser) {
          throw new Error('用户未登录');
        }

        set(state => ({
          plannedMatches: state.plannedMatches.map(match => {
            if (match.id === matchId && match.currentParticipants < match.maxParticipants) {
              return {
                ...match,
                currentParticipants: match.currentParticipants + 1,
                participants: [
                  ...match.participants,
                  {
                    id: currentUser.id,
                    name: currentUser.name,
                    avatar: currentUser.avatar,
                    joinedAt: new Date()
                  }
                ],
                updatedAt: new Date()
              };
            }
            return match;
          }),
          isLoading: false
        }));
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : '加入计划失败',
          isLoading: false 
        });
      }
    },

    // 获取计划同行列表
    fetchPlannedMatches: async () => {
      try {
        set({ isLoading: true });
        
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 模拟计划同行数据
        const mockPlannedMatches: PlannedMatch[] = [
          {
            id: 'planned_1',
            organizerId: 'user2',
            organizerName: '张小明',
            organizerAvatar: '/avatars/user2.jpg',
            title: '周末咖啡厅聚会',
            description: '寻找喜欢咖啡和聊天的朋友一起度过愉快的周末时光',
            place: {
              id: 'place1',
              name: '星巴克(淮海中路店)',
              category: 'cafe' as PlaceCategory,
              address: '上海市黄浦区淮海中路123号',
              coordinates: { lat: 31.2304, lng: 121.4737 },
              rating: 4.2,
              priceLevel: 3,
              photos: ['/places/starbucks1.jpg'],
              openingHours: ['07:00-22:00'],
              crowdLevel: 'moderate' as CrowdLevel,
              tags: ['咖啡', 'WiFi', '安静']
            },
            scheduledTime: new Date('2024-01-20T14:00:00'),
            maxParticipants: 4,
            currentParticipants: 2,
            participants: [
              {
                id: 'user2',
                name: '张小明',
                avatar: '/avatars/user2.jpg',
                joinedAt: new Date('2024-01-15T10:00:00')
              },
              {
                id: 'user3',
                name: '李小红',
                avatar: '/avatars/user3.jpg',
                joinedAt: new Date('2024-01-16T15:30:00')
              }
            ],
            requirements: ['喜欢咖啡', '健谈'],
            status: MatchStatus.PENDING,
            createdAt: new Date('2024-01-15T10:00:00'),
            updatedAt: new Date('2024-01-16T15:30:00')
          }
        ];
        
        set({ 
          plannedMatches: mockPlannedMatches,
          isLoading: false 
        });
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : '获取计划列表失败',
          isLoading: false 
        });
      }
    },

    // 清除错误
    clearError: () => {
      set({ error: null });
    },

    // 重置状态
    reset: () => {
      set({
        currentRequest: null,
        currentMatch: null,
        nearbyRequests: [],
        activeChat: null,
        locationSharing: [],
        isLoading: false,
        isMatching: false,
        error: null
      });
    }
  }))
);