/**
 * 高德地图API封装服务
 * 提供地图相关的API调用功能
 */

import { Coordinates } from '@/types';

// 高德地图API配置
const AMAP_CONFIG = {
  key: process.env.NEXT_PUBLIC_AMAP_KEY || '',
  securityCode: process.env.NEXT_PUBLIC_AMAP_SECURITY_CODE || '',
  version: process.env.NEXT_PUBLIC_AMAP_VERSION || '2.0',
  baseUrl: 'https://restapi.amap.com/v3',
  webServiceUrl: 'https://restapi.amap.com/v5',
};

// API响应基础类型
interface AMapResponse<T = any> {
  status: string;
  count: string;
  info: string;
  infocode: string;
  data?: T;
  [key: string]: any;
}

// 地理编码响应类型
export interface GeocodingResult {
  formatted_address: string;
  country: string;
  province: string;
  city: string;
  citycode: string;
  district: string;
  township: string;
  neighborhood: {
    name: string;
    type: string;
  };
  building: {
    name: string;
    type: string;
  };
  adcode: string;
  street: string;
  number: string;
  location: string;
  level: string;
}

// POI搜索结果类型
export interface POIResult {
  id: string;
  name: string;
  type: string;
  typecode: string;
  address: string;
  location: string;
  tel: string;
  distance: string;
  biz_type: string;
  rating: string;
  cost: string;
  atmosphere: string;
  facility: string;
  tag: string;
  photos: Array<{
    title: string;
    url: string;
  }>;
  children: POIResult[];
}

// 路径规划结果类型
export interface RouteResult {
  origin: string;
  destination: string;
  taxi_cost: string;
  paths: Array<{
    distance: string;
    duration: string;
    strategy: string;
    tolls: string;
    toll_distance: string;
    steps: Array<{
      instruction: string;
      orientation: string;
      distance: string;
      duration: string;
      polyline: string;
      action: string;
      assistant_action: string;
    }>;
  }>;
}

/**
 * 高德地图API服务类
 */
export class AMapService {
  private static instance: AMapService;
  
  private constructor() {}
  
  public static getInstance(): AMapService {
    if (!AMapService.instance) {
      AMapService.instance = new AMapService();
    }
    return AMapService.instance;
  }

  /**
   * 构建API请求URL
   */
  private buildUrl(endpoint: string, params: Record<string, any>, useWebService = false): string {
    const baseUrl = useWebService ? AMAP_CONFIG.webServiceUrl : AMAP_CONFIG.baseUrl;
    const url = new URL(`${baseUrl}${endpoint}`);
    
    // 添加基础参数
    url.searchParams.set('key', AMAP_CONFIG.key);
    url.searchParams.set('output', 'json');
    
    // 添加自定义参数
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });
    
    return url.toString();
  }

  /**
   * 发送API请求
   */
  private async request<T>(
    endpoint: string, 
    params: Record<string, any> = {}, 
    useWebService = false
  ): Promise<AMapResponse<T>> {
    try {
      const url = this.buildUrl(endpoint, params, useWebService);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status !== '1') {
        throw new Error(`AMap API error: ${data.info} (${data.infocode})`);
      }

      return data;
    } catch (error) {
      console.error('AMap API request failed:', error);
      throw error;
    }
  }

  /**
   * 地理编码 - 地址转坐标
   */
  async geocoding(address: string, city?: string): Promise<GeocodingResult[]> {
    const params: Record<string, any> = {
      address,
    };
    
    if (city) {
      params.city = city;
    }

    const response = await this.request<{ geocodes: GeocodingResult[] }>(
      '/geocode/geo',
      params
    );

    return response.geocodes || [];
  }

  /**
   * 逆地理编码 - 坐标转地址
   */
  async reverseGeocoding(
    location: Coordinates,
    radius = 1000,
    extensions = 'base'
  ): Promise<GeocodingResult> {
    const params = {
      location: `${location.lng},${location.lat}`,
      radius,
      extensions,
    };

    const response = await this.request<{ regeocode: GeocodingResult }>(
      '/geocode/regeo',
      params
    );

    return response.regeocode;
  }

  /**
   * POI搜索
   */
  async searchPOI(
    keywords: string,
    location?: Coordinates,
    city?: string,
    radius = 3000,
    page = 1,
    offset = 20
  ): Promise<{ pois: POIResult[]; count: number }> {
    const params: Record<string, any> = {
      keywords,
      page,
      offset,
    };

    if (location) {
      params.location = `${location.lng},${location.lat}`;
      params.radius = radius;
      params.sortrule = 'distance';
    } else if (city) {
      params.city = city;
    }

    const response = await this.request<{ 
      pois: POIResult[];
      count: string;
    }>('/place/text', params);

    return {
      pois: response.pois || [],
      count: parseInt(response.count || '0'),
    };
  }

  /**
   * 周边搜索
   */
  async searchNearby(
    location: Coordinates,
    keywords?: string,
    types?: string,
    radius = 3000,
    page = 1,
    offset = 20
  ): Promise<{ pois: POIResult[]; count: number }> {
    const params: Record<string, any> = {
      location: `${location.lng},${location.lat}`,
      radius,
      page,
      offset,
      sortrule: 'distance',
    };

    if (keywords) {
      params.keywords = keywords;
    }

    if (types) {
      params.types = types;
    }

    const response = await this.request<{
      pois: POIResult[];
      count: string;
    }>('/place/around', params);

    return {
      pois: response.pois || [],
      count: parseInt(response.count || '0'),
    };
  }

  /**
   * 路径规划 - 步行
   */
  async walkingRoute(
    origin: Coordinates,
    destination: Coordinates
  ): Promise<RouteResult> {
    const params = {
      origin: `${origin.lng},${origin.lat}`,
      destination: `${destination.lng},${destination.lat}`,
    };

    const response = await this.request<{ route: RouteResult }>(
      '/direction/walking',
      params
    );

    return response.route;
  }

  /**
   * 路径规划 - 驾车
   */
  async drivingRoute(
    origin: Coordinates,
    destination: Coordinates,
    strategy = 0
  ): Promise<RouteResult> {
    const params = {
      origin: `${origin.lng},${origin.lat}`,
      destination: `${destination.lng},${destination.lat}`,
      strategy,
    };

    const response = await this.request<{ route: RouteResult }>(
      '/direction/driving',
      params
    );

    return response.route;
  }

  /**
   * 路径规划 - 公交
   */
  async transitRoute(
    origin: Coordinates,
    destination: Coordinates,
    city: string,
    strategy = 0
  ): Promise<RouteResult> {
    const params = {
      origin: `${origin.lng},${origin.lat}`,
      destination: `${destination.lng},${destination.lat}`,
      city,
      strategy,
    };

    const response = await this.request<{ route: RouteResult }>(
      '/direction/transit/integrated',
      params
    );

    return response.route;
  }

  /**
   * 获取行政区划
   */
  async getDistrict(
    keywords?: string,
    subdistrict = 1,
    extensions = 'base'
  ): Promise<any[]> {
    const params: Record<string, any> = {
      subdistrict,
      extensions,
    };

    if (keywords) {
      params.keywords = keywords;
    }

    const response = await this.request<{ districts: any[] }>(
      '/config/district',
      params
    );

    return response.districts || [];
  }

  /**
   * IP定位
   */
  async getLocationByIP(ip?: string): Promise<{
    province: string;
    city: string;
    adcode: string;
    rectangle: string;
  }> {
    const params: Record<string, any> = {};
    
    if (ip) {
      params.ip = ip;
    }

    const response = await this.request<{
      province: string;
      city: string;
      adcode: string;
      rectangle: string;
    }>('/ip', params);

    return {
      province: response.province || '',
      city: response.city || '',
      adcode: response.adcode || '',
      rectangle: response.rectangle || '',
    };
  }

  /**
   * 静态地图
   */
  getStaticMapUrl(
    location: Coordinates,
    zoom = 10,
    size = '400*300',
    markers?: Array<{
      location: Coordinates;
      label?: string;
      color?: string;
    }>
  ): string {
    const params: Record<string, any> = {
      location: `${location.lng},${location.lat}`,
      zoom,
      size,
      scale: 2,
    };

    if (markers && markers.length > 0) {
      const markerStr = markers.map(marker => {
        const { location, label = '', color = 'red' } = marker;
        return `${color},${label}:${location.lng},${location.lat}`;
      }).join('|');
      params.markers = markerStr;
    }

    return this.buildUrl('/staticmap', params);
  }
}

// 导出单例实例
export const amapService = AMapService.getInstance();

// 导出便捷方法
export const {
  geocoding,
  reverseGeocoding,
  searchPOI,
  searchNearby,
  walkingRoute,
  drivingRoute,
  transitRoute,
  getDistrict,
  getLocationByIP,
  getStaticMapUrl,
} = amapService;