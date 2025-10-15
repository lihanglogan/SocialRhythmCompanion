import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Place, HeatmapData, HeatmapType } from '@/types';
import { 
  defaultBeijingPlaces, 
  defaultBeijingHeatmap,
  generateHeatmapData,
  updatePlaceData,
  getRecommendedPlaces
} from '@/lib/data/mockData';

// 地图相关类型定义
export interface MapLocation {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
}

export interface PlaceInfo {
  id: string;
  name: string;
  category: string;
  location: MapLocation;
  crowdLevel: 'low' | 'medium' | 'high';
  rating: number;
  tags: string[];
  openingHours?: string;
  description?: string;
  images?: string[];
}

export interface HeatmapData {
  location: MapLocation;
  intensity: number;
  timestamp: number;
  category: string;
}

// 地图状态管理
interface MapState {
  // 地图状态
  center: MapLocation;
  zoom: number;
  mapType: 'normal' | 'satellite' | 'hybrid';
  
  // 数据状态
  places: PlaceInfo[];
  heatmapData: HeatmapData[];
  selectedPlace: PlaceInfo | null;
  searchResults: PlaceInfo[];
  
  // UI状态
  isLoading: boolean;
  error: string | null;
  showHeatmap: boolean;
  selectedCategories: string[];
  timeFilter: {
    start: string;
    end: string;
  };
  
  // Actions
  setCenter: (location: MapLocation) => void;
  setZoom: (zoom: number) => void;
  setMapType: (type: 'normal' | 'satellite' | 'hybrid') => void;
  setPlaces: (places: PlaceInfo[]) => void;
  setHeatmapData: (data: HeatmapData[]) => void;
  setSelectedPlace: (place: PlaceInfo | null) => void;
  setSearchResults: (results: PlaceInfo[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  toggleHeatmap: () => void;
  setSelectedCategories: (categories: string[]) => void;
  setTimeFilter: (filter: { start: string; end: string }) => void;
  
  // 异步操作
  searchPlaces: (query: string, location?: MapLocation) => Promise<void>;
  loadHeatmapData: (location: MapLocation, radius: number) => Promise<void>;
  getNearbyPlaces: (location: MapLocation, radius: number) => Promise<void>;
  clearSearch: () => void;
}

export const useMapStore = create<MapState>()(
  devtools(
    (set, get) => ({
      // 初始状态
      center: {
        latitude: 39.9042,
        longitude: 116.4074,
        city: '北京',
      },
      zoom: 12,
      mapType: 'normal',
      
      places: [],
      heatmapData: [],
      selectedPlace: null,
      searchResults: [],
      
      isLoading: false,
      error: null,
      showHeatmap: true,
      selectedCategories: [],
      timeFilter: {
        start: '00:00',
        end: '23:59',
      },

      // 基础操作
      setCenter: (location) => set({ center: location }),
      setZoom: (zoom) => set({ zoom }),
      setMapType: (type) => set({ mapType: type }),
      setPlaces: (places) => set({ places }),
      setHeatmapData: (data) => set({ heatmapData: data }),
      setSelectedPlace: (place) => set({ selectedPlace: place }),
      setSearchResults: (results) => set({ searchResults: results }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      toggleHeatmap: () => set((state) => ({ showHeatmap: !state.showHeatmap })),
      setSelectedCategories: (categories) => set({ selectedCategories: categories }),
      setTimeFilter: (filter) => set({ timeFilter: filter }),

      // 搜索场所
      searchPlaces: async (query: string, location?: MapLocation) => {
        set({ isLoading: true, error: null });
        try {
          // 这里应该调用实际的搜索API
          // 暂时使用模拟数据
          const mockResults: PlaceInfo[] = [
            {
              id: '1',
              name: `${query} - 示例场所1`,
              category: 'restaurant',
              location: location || get().center,
              crowdLevel: 'medium',
              rating: 4.5,
              tags: ['美食', '热门'],
              openingHours: '10:00-22:00',
              description: '这是一个示例场所描述',
            },
            {
              id: '2',
              name: `${query} - 示例场所2`,
              category: 'entertainment',
              location: {
                latitude: (location?.latitude || get().center.latitude) + 0.001,
                longitude: (location?.longitude || get().center.longitude) + 0.001,
              },
              crowdLevel: 'low',
              rating: 4.2,
              tags: ['娱乐', '安静'],
              openingHours: '14:00-24:00',
              description: '这是另一个示例场所描述',
            },
          ];
          
          set({ searchResults: mockResults, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : '搜索失败',
            isLoading: false 
          });
        }
      },

      // 加载热力图数据
      loadHeatmapData: async (location: MapLocation, radius: number) => {
        set({ isLoading: true, error: null });
        try {
          // 这里应该调用实际的热力图API
          // 暂时使用模拟数据
          const mockHeatmapData: HeatmapData[] = Array.from({ length: 50 }, (_, i) => ({
            location: {
              latitude: location.latitude + (Math.random() - 0.5) * 0.01,
              longitude: location.longitude + (Math.random() - 0.5) * 0.01,
            },
            intensity: Math.random() * 100,
            timestamp: Date.now() - Math.random() * 86400000,
            category: ['restaurant', 'entertainment', 'shopping', 'transport'][Math.floor(Math.random() * 4)],
          }));
          
          set({ heatmapData: mockHeatmapData, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : '加载热力图数据失败',
            isLoading: false 
          });
        }
      },

      // 获取附近场所
      getNearbyPlaces: async (location: MapLocation, radius: number) => {
        set({ isLoading: true, error: null });
        try {
          // 这里应该调用实际的附近场所API
          // 暂时使用模拟数据
          const mockPlaces: PlaceInfo[] = Array.from({ length: 20 }, (_, i) => ({
            id: `nearby_${i}`,
            name: `附近场所 ${i + 1}`,
            category: ['restaurant', 'entertainment', 'shopping', 'transport'][i % 4],
            location: {
              latitude: location.latitude + (Math.random() - 0.5) * 0.005,
              longitude: location.longitude + (Math.random() - 0.5) * 0.005,
            },
            crowdLevel: ['low', 'medium', 'high'][i % 3] as 'low' | 'medium' | 'high',
            rating: 3 + Math.random() * 2,
            tags: ['热门', '推荐', '新开业'][Math.floor(Math.random() * 3)] ? ['热门'] : [],
            openingHours: '09:00-21:00',
          }));
          
          set({ places: mockPlaces, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : '获取附近场所失败',
            isLoading: false 
          });
        }
      },

      // 清除搜索结果
      clearSearch: () => set({ searchResults: [], selectedPlace: null }),
    }),
    { name: 'map-store' }
  )
);