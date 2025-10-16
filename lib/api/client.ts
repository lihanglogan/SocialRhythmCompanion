/**
 * Social Rhythm Companion API 客户端
 * 提供与后端 API 的完整集成
 */

// API 基础配置
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const API_VERSION = 'v1';
const API_PREFIX = `/api`;

// 请求配置接口
interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string | number | boolean>;
}

// API 响应接口
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: string;
}

// 错误类型
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// 获取认证 token
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
}

// 设置认证 token
export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('authToken', token);
}

// 清除认证 token
export function clearAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('authToken');
}

// 构建 URL 参数
function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  return searchParams.toString();
}

// 基础请求函数
async function request<T = any>(
  endpoint: string,
  config: RequestConfig = {}
): Promise<T> {
  const { method = 'GET', headers = {}, body, params } = config;
  
  // 构建完整 URL
  let url = `${API_BASE_URL}${API_PREFIX}${endpoint}`;
  if (params && Object.keys(params).length > 0) {
    url += `?${buildQueryString(params)}`;
  }

  // 构建请求头
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // 添加认证头
  const token = getAuthToken();
  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  // 构建请求配置
  const requestConfig: RequestInit = {
    method,
    headers: requestHeaders,
  };

  // 添加请求体
  if (body && method !== 'GET') {
    requestConfig.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, requestConfig);
    
    // 检查响应状态
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || `HTTP ${response.status}`,
        response.status,
        errorData.code
      );
    }

    // 解析响应
    const data = await response.json();
    
    // 检查业务逻辑错误
    if (!data.success && data.error) {
      throw new ApiError(data.error, response.status, data.code);
    }

    return data.data || data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error',
      0
    );
  }
}

// 认证 API
export const authApi = {
  // 用户注册
  register: (data: {
    email: string;
    pwd: string;
    nickname: string;
  }) => request('/auth/register', {
    method: 'POST',
    body: data
  }),

  // 用户登录
  login: (data: {
    email: string;
    pwd: string;
  }) => request('/auth/login', {
    method: 'POST',
    body: data
  }),

  // 获取当前用户信息
  me: () => request('/auth/me'),

  // 刷新 token
  refresh: () => request('/auth/refresh', {
    method: 'POST'
  }),

  // 登出
  logout: () => request('/auth/logout', {
    method: 'POST'
  })
};

// 用户 API
export const userApi = {
  // 获取用户资料
  getProfile: () => request('/users/profile'),

  // 更新用户资料
  updateProfile: (data: any) => request('/users/profile', {
    method: 'PUT',
    body: data
  }),

  // 获取用户偏好设置
  getPreferences: () => request('/users/preferences'),

  // 更新用户偏好设置
  updatePreferences: (data: any) => request('/users/preferences', {
    method: 'PUT',
    body: data
  })
};

// 场所 API
export const placeApi = {
  // 获取场所列表
  getPlaces: (params?: {
    page?: number;
    limit?: number;
    category?: string;
    latitude?: number;
    longitude?: number;
    radius?: number;
  }) => request('/places', { params }),

  // 获取场所详情
  getPlace: (id: string) => request(`/places/${id}`),

  // 搜索场所
  searchPlaces: (params: {
    keyword?: string;
    category?: string;
    latitude?: number;
    longitude?: number;
    radius?: number;
  }) => request('/places/search', { params }),

  // 获取附近场所
  getNearbyPlaces: (params: {
    latitude: number;
    longitude: number;
    radius?: number;
    limit?: number;
  }) => request('/places/nearby', { params })
};

// 上报 API
export const reportApi = {
  // 提交上报
  createReport: (data: {
    placeId: string;
    crowdLevel: number;
    noiseLevel?: number;
    temperature?: number;
    lighting?: number;
    wifiQuality?: number;
    powerOutlets?: boolean;
    seatingAvailability?: number;
    notes?: string;
  }) => request('/reports', {
    method: 'POST',
    body: data
  }),

  // 获取我的上报历史
  getMyReports: (params?: {
    page?: number;
    limit?: number;
  }) => request('/reports/my', { params }),

  // 获取场所的上报数据
  getPlaceReports: (placeId: string, params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }) => request(`/reports/place/${placeId}`, { params })
};

// 建议 API
export const suggestionApi = {
  // 获取今日建议
  getTodaySuggestions: () => request('/suggestions/today'),

  // 获取个性化建议
  getPersonalSuggestions: (params?: {
    category?: string;
    limit?: number;
  }) => request('/suggestions/personal', { params }),

  // 获取趋势预测
  getTrendPredictions: (params?: {
    placeId?: string;
    timeRange?: string;
  }) => request('/suggestions/trends', { params }),

  // 获取建议历史
  getSuggestionHistory: (params?: {
    page?: number;
    limit?: number;
  }) => request('/suggestions/history', { params })
};

// 匹配 API
export const matchApi = {
  // 快速匹配
  quickMatch: (data: {
    placeId: string;
    preferences?: any;
  }) => request('/match/quick', {
    method: 'POST',
    body: data
  }),

  // 自定义匹配
  customMatch: (data: {
    criteria: any;
    preferences?: any;
  }) => request('/match/custom', {
    method: 'POST',
    body: data
  }),

  // 获取匹配历史
  getMatchHistory: (params?: {
    page?: number;
    limit?: number;
  }) => request('/match/history', { params }),

  // 获取附近用户
  getNearbyUsers: (params: {
    latitude: number;
    longitude: number;
    radius?: number;
  }) => request('/match/nearby', { params })
};

// 聊天 API
export const chatApi = {
  // 获取聊天列表
  getChatList: () => request('/chat/list'),

  // 获取聊天历史
  getChatHistory: (chatId: string, params?: {
    page?: number;
    limit?: number;
  }) => request(`/chat/${chatId}/history`, { params }),

  // 发送消息
  sendMessage: (chatId: string, data: {
    content: string;
    type?: string;
  }) => request(`/chat/${chatId}/send`, {
    method: 'POST',
    body: data
  })
};

// 统一 API 导出
export const api = {
  auth: authApi,
  user: userApi,
  place: placeApi,
  report: reportApi,
  suggestion: suggestionApi,
  match: matchApi,
  chat: chatApi,
};

// 默认导出
export default api;