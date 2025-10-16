/**
 * 定位和地理编码服务
 * 提供精确的位置获取和地址解析功能
 */

import { Coordinates } from '@/types';
import { amapService } from '@/lib/api/mapApi';
import { cacheService, CacheType } from './cacheService';

// 定位配置
const LOCATION_CONFIG = {
  // 定位选项
  GPS_OPTIONS: {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 300000, // 5分钟缓存
  },
  
  // 定位精度要求
  ACCURACY_THRESHOLD: 100, // 100米内认为是精确定位
  
  // 重试配置
  MAX_RETRIES: 3,
  RETRY_DELAY: 2000,
  
  // 默认位置（北京天安门）
  DEFAULT_LOCATION: {
    lat: 39.9042,
    lng: 116.4074,
  },
};

// 定位结果类型
export interface LocationResult {
  coordinates: Coordinates;
  accuracy: number;
  timestamp: number;
  source: 'gps' | 'network' | 'ip' | 'cache' | 'default';
  address?: string;
  city?: string;
  district?: string;
}

// 地址信息类型
export interface AddressInfo {
  formattedAddress: string;
  country: string;
  province: string;
  city: string;
  district: string;
  street: string;
  streetNumber: string;
  adcode: string;
  citycode: string;
}

// 定位错误类型
export enum LocationError {
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  POSITION_UNAVAILABLE = 'POSITION_UNAVAILABLE',
  TIMEOUT = 'TIMEOUT',
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_ERROR = 'API_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

// 定位状态
export enum LocationStatus {
  IDLE = 'idle',
  LOCATING = 'locating',
  SUCCESS = 'success',
  ERROR = 'error',
}

/**
 * 定位服务类
 */
export class LocationService {
  private static instance: LocationService;
  private currentLocation: LocationResult | null = null;
  private locationStatus: LocationStatus = LocationStatus.IDLE;
  private watchId: number | null = null;
  private listeners: Array<(location: LocationResult | null) => void> = [];
  private errorListeners: Array<(error: LocationError, message: string) => void> = [];
  
  private constructor() {}
  
  public static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  /**
   * 获取当前位置
   */
  async getCurrentLocation(forceRefresh = false): Promise<LocationResult> {
    // 如果不强制刷新且有缓存的位置，直接返回
    if (!forceRefresh && this.currentLocation && this.isLocationFresh(this.currentLocation)) {
      return this.currentLocation;
    }

    // 尝试从缓存获取
    if (!forceRefresh) {
      const cached = await cacheService.get<LocationResult>(CacheType.USER_LOCATION, 'current');
      if (cached && this.isLocationFresh(cached)) {
        this.currentLocation = cached;
        this.notifyListeners(cached);
        return cached;
      }
    }

    this.locationStatus = LocationStatus.LOCATING;
    
    try {
      // 优先使用GPS定位
      let location = await this.getGPSLocation();
      
      // 如果GPS定位失败，尝试网络定位
      if (!location) {
        location = await this.getNetworkLocation();
      }
      
      // 如果网络定位也失败，使用IP定位
      if (!location) {
        location = await this.getIPLocation();
      }
      
      // 如果所有定位方式都失败，使用默认位置
      if (!location) {
        location = this.getDefaultLocation();
      }

      // 获取地址信息
      if (location.source !== 'default') {
        try {
          const address = await this.getAddressByCoordinates(location.coordinates);
          location.address = address.formattedAddress;
          location.city = address.city;
          location.district = address.district;
        } catch (error) {
          console.warn('Failed to get address info:', error);
        }
      }

      // 缓存位置信息
      await cacheService.set(CacheType.USER_LOCATION, 'current', location);
      
      this.currentLocation = location;
      this.locationStatus = LocationStatus.SUCCESS;
      this.notifyListeners(location);
      
      return location;
    } catch (error) {
      this.locationStatus = LocationStatus.ERROR;
      const locationError = this.mapError(error);
      this.notifyErrorListeners(locationError, error instanceof Error ? error.message : '定位失败');
      
      // 返回默认位置作为降级方案
      const defaultLocation = this.getDefaultLocation();
      this.currentLocation = defaultLocation;
      this.notifyListeners(defaultLocation);
      
      return defaultLocation;
    }
  }

  /**
   * GPS定位
   */
  private async getGPSLocation(): Promise<LocationResult | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      const timeout = setTimeout(() => {
        resolve(null);
      }, LOCATION_CONFIG.GPS_OPTIONS.timeout);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeout);
          const { latitude, longitude, accuracy } = position.coords;
          
          resolve({
            coordinates: { lat: latitude, lng: longitude },
            accuracy: accuracy || 0,
            timestamp: Date.now(),
            source: 'gps',
          });
        },
        (error) => {
          clearTimeout(timeout);
          console.warn('GPS location failed:', error);
          resolve(null);
        },
        LOCATION_CONFIG.GPS_OPTIONS
      );
    });
  }

  /**
   * 网络定位（基于WiFi和基站）
   */
  private async getNetworkLocation(): Promise<LocationResult | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      const options = {
        ...LOCATION_CONFIG.GPS_OPTIONS,
        enableHighAccuracy: false, // 使用网络定位
      };

      const timeout = setTimeout(() => {
        resolve(null);
      }, options.timeout);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeout);
          const { latitude, longitude, accuracy } = position.coords;
          
          resolve({
            coordinates: { lat: latitude, lng: longitude },
            accuracy: accuracy || 0,
            timestamp: Date.now(),
            source: 'network',
          });
        },
        (error) => {
          clearTimeout(timeout);
          console.warn('Network location failed:', error);
          resolve(null);
        },
        options
      );
    });
  }

  /**
   * IP定位
   */
  private async getIPLocation(): Promise<LocationResult | null> {
    try {
      const ipLocation = await amapService.getLocationByIP();
      
      if (ipLocation.rectangle) {
        // 解析矩形坐标，取中心点
        const coords = ipLocation.rectangle.split(';');
        if (coords.length >= 2) {
          const [lng1, lat1] = coords[0].split(',').map(Number);
          const [lng2, lat2] = coords[1].split(',').map(Number);
          
          const centerLat = (lat1 + lat2) / 2;
          const centerLng = (lng1 + lng2) / 2;
          
          return {
            coordinates: { lat: centerLat, lng: centerLng },
            accuracy: 5000, // IP定位精度较低
            timestamp: Date.now(),
            source: 'ip',
            city: ipLocation.city,
          };
        }
      }
      
      return null;
    } catch (error) {
      console.warn('IP location failed:', error);
      return null;
    }
  }

  /**
   * 获取默认位置
   */
  private getDefaultLocation(): LocationResult {
    return {
      coordinates: LOCATION_CONFIG.DEFAULT_LOCATION,
      accuracy: 0,
      timestamp: Date.now(),
      source: 'default',
      address: '北京市东城区天安门广场',
      city: '北京市',
      district: '东城区',
    };
  }

  /**
   * 根据坐标获取地址
   */
  async getAddressByCoordinates(coordinates: Coordinates): Promise<AddressInfo> {
    // 先尝试从缓存获取
    const cacheKey = `${coordinates.lat.toFixed(6)},${coordinates.lng.toFixed(6)}`;
    const cached = await cacheService.get<AddressInfo>(CacheType.GEOCODING, cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const result = await amapService.reverseGeocoding(coordinates);
      
      const addressInfo: AddressInfo = {
        formattedAddress: result.formatted_address || '',
        country: result.country || '中国',
        province: result.province || '',
        city: result.city || '',
        district: result.district || '',
        street: result.street || '',
        streetNumber: result.number || '',
        adcode: result.adcode || '',
        citycode: result.citycode || '',
      };

      // 缓存地址信息
      await cacheService.set(CacheType.GEOCODING, cacheKey, addressInfo);
      
      return addressInfo;
    } catch (error) {
      console.error('Failed to get address by coordinates:', error);
      throw error;
    }
  }

  /**
   * 根据地址获取坐标
   */
  async getCoordinatesByAddress(address: string, city?: string): Promise<Coordinates[]> {
    // 先尝试从缓存获取
    const cacheKey = city ? `${address}_${city}` : address;
    const cached = await cacheService.get<Coordinates[]>(CacheType.GEOCODING, cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const results = await amapService.geocoding(address, city);
      
      const coordinates = results.map(result => {
        const [lng, lat] = result.location.split(',').map(Number);
        return { lat, lng };
      });

      // 缓存坐标信息
      await cacheService.set(CacheType.GEOCODING, cacheKey, coordinates);
      
      return coordinates;
    } catch (error) {
      console.error('Failed to get coordinates by address:', error);
      throw error;
    }
  }

  /**
   * 开始持续定位
   */
  startWatching(callback?: (location: LocationResult | null) => void): void {
    if (this.watchId !== null) {
      this.stopWatching();
    }

    if (callback) {
      this.addLocationListener(callback);
    }

    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported');
      return;
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        
        const location: LocationResult = {
          coordinates: { lat: latitude, lng: longitude },
          accuracy: accuracy || 0,
          timestamp: Date.now(),
          source: 'gps',
        };

        this.currentLocation = location;
        this.notifyListeners(location);
      },
      (error) => {
        console.warn('Watch position error:', error);
        const locationError = this.mapError(error);
        this.notifyErrorListeners(locationError, error.message);
      },
      LOCATION_CONFIG.GPS_OPTIONS
    );
  }

  /**
   * 停止持续定位
   */
  stopWatching(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  /**
   * 添加位置监听器
   */
  addLocationListener(callback: (location: LocationResult | null) => void): void {
    this.listeners.push(callback);
  }

  /**
   * 移除位置监听器
   */
  removeLocationListener(callback: (location: LocationResult | null) => void): void {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * 添加错误监听器
   */
  addErrorListener(callback: (error: LocationError, message: string) => void): void {
    this.errorListeners.push(callback);
  }

  /**
   * 移除错误监听器
   */
  removeErrorListener(callback: (error: LocationError, message: string) => void): void {
    const index = this.errorListeners.indexOf(callback);
    if (index > -1) {
      this.errorListeners.splice(index, 1);
    }
  }

  /**
   * 通知位置监听器
   */
  private notifyListeners(location: LocationResult | null): void {
    this.listeners.forEach(callback => {
      try {
        callback(location);
      } catch (error) {
        console.error('Location listener error:', error);
      }
    });
  }

  /**
   * 通知错误监听器
   */
  private notifyErrorListeners(error: LocationError, message: string): void {
    this.errorListeners.forEach(callback => {
      try {
        callback(error, message);
      } catch (err) {
        console.error('Error listener error:', err);
      }
    });
  }

  /**
   * 检查位置是否新鲜
   */
  private isLocationFresh(location: LocationResult): boolean {
    const age = Date.now() - location.timestamp;
    return age < LOCATION_CONFIG.GPS_OPTIONS.maximumAge;
  }

  /**
   * 映射错误类型
   */
  private mapError(error: unknown): LocationError {
    if (error instanceof GeolocationPositionError) {
      switch (error.code) {
        case GeolocationPositionError.PERMISSION_DENIED:
          return LocationError.PERMISSION_DENIED;
        case GeolocationPositionError.POSITION_UNAVAILABLE:
          return LocationError.POSITION_UNAVAILABLE;
        case GeolocationPositionError.TIMEOUT:
          return LocationError.TIMEOUT;
        default:
          return LocationError.UNKNOWN_ERROR;
      }
    }
    
    return LocationError.UNKNOWN_ERROR;
  }

  /**
   * 计算两点间距离（米）
   */
  calculateDistance(point1: Coordinates, point2: Coordinates): number {
    const R = 6371000; // 地球半径（米）
    const lat1Rad = (point1.lat * Math.PI) / 180;
    const lat2Rad = (point2.lat * Math.PI) / 180;
    const deltaLatRad = ((point2.lat - point1.lat) * Math.PI) / 180;
    const deltaLngRad = ((point2.lng - point1.lng) * Math.PI) / 180;

    const a = Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
              Math.cos(lat1Rad) * Math.cos(lat2Rad) *
              Math.sin(deltaLngRad / 2) * Math.sin(deltaLngRad / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c;
  }

  /**
   * 获取当前位置状态
   */
  getLocationStatus(): LocationStatus {
    return this.locationStatus;
  }

  /**
   * 获取缓存的当前位置
   */
  getCachedLocation(): LocationResult | null {
    return this.currentLocation;
  }

  /**
   * 清除位置缓存
   */
  async clearLocationCache(): Promise<void> {
    await cacheService.clear(CacheType.USER_LOCATION);
    this.currentLocation = null;
  }

  /**
   * 检查定位权限
   */
  async checkLocationPermission(): Promise<PermissionState | null> {
    if (!navigator.permissions) {
      return null;
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      return permission.state;
    } catch (error) {
      console.warn('Failed to check location permission:', error);
      return null;
    }
  }
}

// 导出单例实例
export const locationService = LocationService.getInstance();

// 导出便捷方法
export const {
  getCurrentLocation,
  getAddressByCoordinates,
  getCoordinatesByAddress,
  startWatching,
  stopWatching,
  calculateDistance,
  getLocationStatus,
  getCachedLocation,
  clearLocationCache,
  checkLocationPermission,
} = locationService;