import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import {
  Report,
  ReportFormData,
  UserReportHistory,
  LocationDetectionResult,
  ReportStats,
  Place,
  Coordinates,
  ReportType,
  ReportStatus,
  ExtendedReportData,
  PlaceCategory,
  CrowdLevel,
  NoiseLevel
} from '@/types';

// 上报状态管理接口
interface ReportState {
  // 当前上报状态
  currentReport: Partial<ReportFormData> | null;
  isSubmitting: boolean;
  submitError: string | null;
  
  // 位置检测
  locationDetection: LocationDetectionResult | null;
  isDetectingLocation: boolean;
  locationError: string | null;
  
  // 用户上报历史
  userHistory: UserReportHistory | null;
  reportHistory: Report[];
  recentReports: Report[];
  
  // 统计数据
  stats: ReportStats | null;
  
  // 场所选择
  selectedPlace: Place | null;
  nearbyPlaces: Place[];
  
  // UI状态
  reportMode: 'quick' | 'detailed';
  showSuccessModal: boolean;
  lastSubmittedReport: Report | null;
  
  // Actions
  // 基础操作
  setCurrentReport: (report: Partial<ReportFormData>) => void;
  updateReportData: (data: Partial<ExtendedReportData>) => void;
  clearCurrentReport: () => void;
  setReportMode: (mode: 'quick' | 'detailed') => void;
  
  // 位置检测
  detectLocation: () => Promise<void>;
  setSelectedPlace: (place: Place | null) => void;
  loadNearbyPlaces: (coordinates: Coordinates) => Promise<void>;
  
  // 上报提交
  submitReport: () => Promise<void>;
  
  // 历史记录
  loadUserHistory: () => Promise<void>;
  getUserReportHistory: () => Promise<void>;
  loadRecentReports: () => Promise<void>;
  
  // 统计数据
  loadStats: () => Promise<void>;
  
  // UI控制
  showSuccess: (report: Report) => void;
  hideSuccess: () => void;
  clearError: () => void;
}

export const useReportStore = create<ReportState>()(
  devtools(
    persist(
      (set, get) => ({
        // 初始状态
        currentReport: null,
        isSubmitting: false,
        submitError: null,
        
        locationDetection: null,
        isDetectingLocation: false,
        locationError: null,
        
        userHistory: null,
        reportHistory: [],
        recentReports: [],
        
        stats: null,
        
        selectedPlace: null,
        nearbyPlaces: [],
        
        reportMode: 'quick',
        showSuccessModal: false,
        lastSubmittedReport: null,

        // 基础操作
        setCurrentReport: (report) => set({ currentReport: report }),
        
        updateReportData: (data) => set((state) => ({
          currentReport: state.currentReport ? {
            ...state.currentReport,
            data: { ...state.currentReport.data, ...data }
          } : null
        })),
        
        clearCurrentReport: () => set({ 
          currentReport: null, 
          selectedPlace: null,
          submitError: null 
        }),
        
        setReportMode: (mode) => set({ reportMode: mode }),

        // 位置检测
        detectLocation: async () => {
          set({ isDetectingLocation: true, locationError: null });
          
          try {
            // 检查浏览器是否支持地理位置
            if (!navigator.geolocation) {
              throw new Error('您的浏览器不支持地理位置功能');
            }

            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(
                resolve,
                reject,
                {
                  enableHighAccuracy: true,
                  timeout: 10000,
                  maximumAge: 300000 // 5分钟缓存
                }
              );
            });

            const coordinates: Coordinates = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };

            // 加载附近场所
            await get().loadNearbyPlaces(coordinates);

            const { nearbyPlaces } = get();
            
            const locationResult: LocationDetectionResult = {
              coordinates,
              accuracy: position.coords.accuracy,
              nearbyPlaces,
              suggestedPlace: nearbyPlaces[0] || undefined,
              timestamp: new Date()
            };

            set({ 
              locationDetection: locationResult,
              isDetectingLocation: false 
            });

            // 如果有推荐场所，自动设置
            if (locationResult.suggestedPlace) {
              get().setSelectedPlace(locationResult.suggestedPlace);
            }

          } catch (error) {
            const errorMessage = error instanceof GeolocationPositionError 
              ? getGeolocationErrorMessage(error.code)
              : error instanceof Error 
                ? error.message 
                : '位置检测失败';
                
            set({ 
              locationError: errorMessage,
              isDetectingLocation: false 
            });
          }
        },

        setSelectedPlace: (place) => set((state) => ({ 
          selectedPlace: place,
          currentReport: place ? {
            ...state.currentReport,
            placeId: place.id
          } : state.currentReport
        })),

        loadNearbyPlaces: async (coordinates) => {
          try {
            // 模拟API调用 - 实际项目中应该调用真实API
            const mockPlaces: Place[] = Array.from({ length: 10 }, (_, i) => ({
              id: `nearby_${i}`,
              name: `附近场所 ${i + 1}`,
              address: `测试地址 ${i + 1}`,
              coordinates: {
                lat: coordinates.lat + (Math.random() - 0.5) * 0.01,
                lng: coordinates.lng + (Math.random() - 0.5) * 0.01
              },
              category: (['restaurant', 'hospital', 'bank', 'shopping'] as const)[Math.floor(Math.random() * 4)] as PlaceCategory,
              currentStatus: {
                isOpen: Math.random() > 0.2,
                queueLength: Math.floor(Math.random() * 20),
                estimatedWaitTime: Math.floor(Math.random() * 30),
                lastUpdated: new Date(),
                crowdDensity: Math.random()
              },
              waitTime: Math.floor(Math.random() * 30),
              crowdLevel: (['low', 'medium', 'high', 'very_high'] as const)[Math.floor(Math.random() * 4)] as CrowdLevel,
              noiseLevel: (['quiet', 'moderate', 'loud'] as const)[Math.floor(Math.random() * 3)] as NoiseLevel,
              accessibility: {
                wheelchairAccessible: Math.random() > 0.5,
                hasElevator: Math.random() > 0.7,
                hasRamp: Math.random() > 0.6,
                hasAccessibleParking: Math.random() > 0.4,
                hasAccessibleRestroom: Math.random() > 0.5
              },
              openHours: {
                monday: [{ open: '09:00', close: '18:00' }],
                tuesday: [{ open: '09:00', close: '18:00' }],
                wednesday: [{ open: '09:00', close: '18:00' }],
                thursday: [{ open: '09:00', close: '18:00' }],
                friday: [{ open: '09:00', close: '18:00' }],
                saturday: [{ open: '10:00', close: '16:00' }],
                sunday: []
              }
            }));

            set({ nearbyPlaces: mockPlaces });
          } catch (error) {
            console.error('加载附近场所失败:', error);
          }
        },

        // 上报提交
        submitReport: async () => {
          const { currentReport } = get();
          
          if (!currentReport || !currentReport.placeId) {
            set({ submitError: '请选择要上报的场所' });
            return;
          }

          set({ isSubmitting: true, submitError: null });

          try {
            // 模拟API调用
            await new Promise(resolve => setTimeout(resolve, 1500));

            const newReport: Report = {
              id: `report_${Date.now()}`,
              userId: 'current_user', // 实际应该从用户状态获取
              placeId: currentReport.placeId,
              reportType: currentReport.reportType || ReportType.QUICK,
              data: currentReport.data || {},
              timestamp: new Date(),
              verified: false,
              confidence: 0.8,
              location: get().locationDetection?.coordinates,
              status: ReportStatus.PENDING
            };

            // 更新本地状态
            set((state) => ({
              recentReports: [newReport, ...state.recentReports.slice(0, 9)],
              isSubmitting: false,
              lastSubmittedReport: newReport
            }));

            // 显示成功提示
            get().showSuccess(newReport);
            
            // 清空当前上报
            get().clearCurrentReport();

            // 重新加载统计数据
            get().loadStats();

          } catch (error) {
            set({ 
              submitError: error instanceof Error ? error.message : '上报失败，请重试',
              isSubmitting: false 
            });
          }
        },

        // 历史记录
        loadUserHistory: async () => {
          try {
            // 模拟API调用
            const mockHistory: UserReportHistory = {
              userId: 'current_user',
              reports: [],
              totalReports: 25,
              verifiedReports: 20,
              reputationScore: 85,
              badges: [
                {
                  id: 'reporter_bronze',
                  name: '上报新手',
                  description: '完成首次上报',
                  icon: '🥉',
                  earnedAt: new Date('2024-01-15'),
                  type: 'reporter' as const
                },
                {
                  id: 'accuracy_silver',
                  name: '准确达人',
                  description: '上报准确率达到80%',
                  icon: '🥈',
                  earnedAt: new Date('2024-02-20'),
                  type: 'accuracy' as const
                }
              ]
            };

            set({ userHistory: mockHistory });
          } catch (error) {
            console.error('加载用户历史失败:', error);
          }
        },

        loadRecentReports: async () => {
          try {
            // 模拟API调用
            const mockReports: Report[] = Array.from({ length: 5 }, (_, i) => ({
              id: `recent_${i}`,
              userId: 'current_user',
              placeId: `place_${i}`,
              reportType: ReportType.QUICK,
              data: {
                crowdLevel: (['low', 'medium', 'high'] as const)[Math.floor(Math.random() * 3)] as CrowdLevel,
                waitTime: Math.floor(Math.random() * 30)
              },
              timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
              verified: Math.random() > 0.3,
              confidence: 0.7 + Math.random() * 0.3,
              status: ReportStatus.VERIFIED
            }));

            set({ recentReports: mockReports });
          } catch (error) {
            console.error('加载最近上报失败:', error);
          }
        },

        // 统计数据
        loadStats: async () => {
          try {
            const mockStats: ReportStats = {
              totalReports: 25,
              todayReports: 3,
              verifiedReports: 20,
              pendingReports: 2,
              userRanking: 156,
              reputationScore: 85
            };

            set({ stats: mockStats });
          } catch (error) {
            console.error('加载统计数据失败:', error);
          }
        },

        // UI控制
        showSuccess: (report) => set({ 
          showSuccessModal: true, 
          lastSubmittedReport: report 
        }),
        
        hideSuccess: () => set({ showSuccessModal: false }),
        
        clearError: () => set({ 
          submitError: null, 
          locationError: null 
        })
      }),
      {
        name: 'report-storage',
        partialize: (state) => ({
          userHistory: state.userHistory,
          recentReports: state.recentReports,
          stats: state.stats,
          reportMode: state.reportMode
        })
      }
    ),
    { name: 'report-store' }
  )
);

// 地理位置错误消息处理
function getGeolocationErrorMessage(code: number): string {
  switch (code) {
    case 1: // PERMISSION_DENIED
      return '位置访问被拒绝，请在浏览器设置中允许位置访问';
    case 2: // POSITION_UNAVAILABLE
      return '无法获取位置信息，请检查GPS或网络连接';
    case 3: // TIMEOUT
      return '位置检测超时，请重试';
    default:
      return '位置检测失败，请重试';
  }
}