/**
 * 天气数据API服务
 * 集成高德天气API和其他天气数据源
 */

import { Coordinates } from '@/types';

// 天气API配置
const WEATHER_CONFIG = {
  amapKey: process.env.NEXT_PUBLIC_AMAP_KEY || '',
  baseUrl: 'https://restapi.amap.com/v3/weather',
};

// 天气数据类型定义
export interface WeatherInfo {
  province: string;
  city: string;
  adcode: string;
  weather: string;
  temperature: string;
  winddirection: string;
  windpower: string;
  humidity: string;
  reporttime: string;
  temperature_float: string;
  humidity_float: string;
}

export interface WeatherForecast {
  date: string;
  week: string;
  dayweather: string;
  nightweather: string;
  daytemp: string;
  nighttemp: string;
  daywind: string;
  nightwind: string;
  daypower: string;
  nightpower: string;
  daytemp_float: string;
  nighttemp_float: string;
}

export interface WeatherResponse {
  status: string;
  count: string;
  info: string;
  infocode: string;
  lives?: WeatherInfo[];
  forecasts?: Array<{
    city: string;
    adcode: string;
    province: string;
    reporttime: string;
    casts: WeatherForecast[];
  }>;
}

// 天气状况映射
export const WEATHER_ICONS: Record<string, string> = {
  '晴': '☀️',
  '少云': '🌤️',
  '晴间多云': '⛅',
  '多云': '☁️',
  '阴': '☁️',
  '有风': '💨',
  '平静': '😌',
  '微风': '🍃',
  '和风': '🍃',
  '清风': '💨',
  '强风/劲风': '💨',
  '疾风': '💨',
  '大风': '💨',
  '烈风': '💨',
  '风暴': '🌪️',
  '狂爆风': '🌪️',
  '飓风': '🌀',
  '热带风暴': '🌀',
  '霾': '😷',
  '中度霾': '😷',
  '重度霾': '😷',
  '严重霾': '😷',
  '阵雨': '🌦️',
  '雷阵雨': '⛈️',
  '雷阵雨并伴有冰雹': '⛈️',
  '小雨': '🌧️',
  '中雨': '🌧️',
  '大雨': '🌧️',
  '暴雨': '⛈️',
  '大暴雨': '⛈️',
  '特大暴雨': '⛈️',
  '强阵雨': '⛈️',
  '强雷阵雨': '⛈️',
  '极端降雨': '⛈️',
  '毛毛雨/细雨': '🌦️',
  '雨': '🌧️',
  '小雨-中雨': '🌧️',
  '中雨-大雨': '🌧️',
  '大雨-暴雨': '⛈️',
  '暴雨-大暴雨': '⛈️',
  '大暴雨-特大暴雨': '⛈️',
  '雨雪天气': '🌨️',
  '雨夹雪': '🌨️',
  '阵雨夹雪': '🌨️',
  '冻雨': '🧊',
  '雪': '❄️',
  '阵雪': '🌨️',
  '小雪': '❄️',
  '中雪': '❄️',
  '大雪': '❄️',
  '暴雪': '❄️',
  '小雪-中雪': '❄️',
  '中雪-大雪': '❄️',
  '大雪-暴雪': '❄️',
  '浮尘': '😷',
  '扬沙': '😷',
  '沙尘暴': '😷',
  '强沙尘暴': '😷',
  '龙卷风': '🌪️',
  '雾': '🌫️',
  '浓雾': '🌫️',
  '强浓雾': '🌫️',
  '轻雾': '🌫️',
  '大雾': '🌫️',
  '特强浓雾': '🌫️',
  '热': '🔥',
  '冷': '🥶',
  '未知': '❓',
};

// 天气建议类型
export interface WeatherAdvice {
  clothing: string;
  activity: string;
  health: string;
  travel: string;
  icon: string;
}

/**
 * 天气服务类
 */
export class WeatherService {
  private static instance: WeatherService;
  
  private constructor() {}
  
  public static getInstance(): WeatherService {
    if (!WeatherService.instance) {
      WeatherService.instance = new WeatherService();
    }
    return WeatherService.instance;
  }

  /**
   * 构建API请求URL
   */
  private buildUrl(endpoint: string, params: Record<string, any>): string {
    const url = new URL(`${WEATHER_CONFIG.baseUrl}${endpoint}`);
    
    // 添加基础参数
    url.searchParams.set('key', WEATHER_CONFIG.amapKey);
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
    params: Record<string, any> = {}
  ): Promise<T> {
    try {
      const url = this.buildUrl(endpoint, params);
      
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
        throw new Error(`Weather API error: ${data.info} (${data.infocode})`);
      }

      return data;
    } catch (error) {
      console.error('Weather API request failed:', error);
      throw error;
    }
  }

  /**
   * 获取实时天气
   */
  async getCurrentWeather(city: string): Promise<WeatherInfo | null> {
    try {
      const params = {
        city,
        extensions: 'base',
      };

      const response = await this.request<WeatherResponse>('/weatherInfo', params);
      
      return response.lives?.[0] || null;
    } catch (error) {
      console.error('Failed to get current weather:', error);
      return null;
    }
  }

  /**
   * 获取天气预报
   */
  async getWeatherForecast(city: string): Promise<WeatherForecast[]> {
    try {
      const params = {
        city,
        extensions: 'all',
      };

      const response = await this.request<WeatherResponse>('/weatherInfo', params);
      
      return response.forecasts?.[0]?.casts || [];
    } catch (error) {
      console.error('Failed to get weather forecast:', error);
      return [];
    }
  }

  /**
   * 根据坐标获取天气（通过逆地理编码获取城市）
   */
  async getWeatherByLocation(location: Coordinates): Promise<WeatherInfo | null> {
    try {
      // 首先通过逆地理编码获取城市信息
      const geocodeUrl = `https://restapi.amap.com/v3/geocode/regeo?key=${WEATHER_CONFIG.amapKey}&location=${location.lng},${location.lat}&output=json`;
      
      const geocodeResponse = await fetch(geocodeUrl);
      const geocodeData = await geocodeResponse.json();
      
      if (geocodeData.status !== '1') {
        throw new Error('Failed to get city from coordinates');
      }

      const city = geocodeData.regeocode?.addressComponent?.city || 
                   geocodeData.regeocode?.addressComponent?.province;
      
      if (!city) {
        throw new Error('No city found for coordinates');
      }

      return await this.getCurrentWeather(city);
    } catch (error) {
      console.error('Failed to get weather by location:', error);
      return null;
    }
  }

  /**
   * 获取天气图标
   */
  getWeatherIcon(weather: string): string {
    return WEATHER_ICONS[weather] || WEATHER_ICONS['未知'];
  }

  /**
   * 获取天气建议
   */
  getWeatherAdvice(weather: WeatherInfo): WeatherAdvice {
    const temp = parseFloat(weather.temperature_float || weather.temperature);
    const weatherType = weather.weather;
    const humidity = parseFloat(weather.humidity_float || weather.humidity);
    
    let clothing = '';
    let activity = '';
    let health = '';
    let travel = '';

    // 根据温度给出穿衣建议
    if (temp <= 0) {
      clothing = '建议穿厚羽绒服、毛衣等保暖衣物';
    } else if (temp <= 10) {
      clothing = '建议穿风衣、大衣等外套';
    } else if (temp <= 20) {
      clothing = '建议穿薄外套或长袖衣服';
    } else if (temp <= 30) {
      clothing = '建议穿短袖、薄长裤等轻便衣物';
    } else {
      clothing = '建议穿短袖、短裤等清凉衣物';
    }

    // 根据天气类型给出活动建议
    if (weatherType.includes('雨') || weatherType.includes('雪')) {
      activity = '不适宜户外运动，建议室内活动';
      travel = '出行请携带雨具，注意交通安全';
    } else if (weatherType.includes('风') || weatherType.includes('沙')) {
      activity = '不适宜户外运动，建议室内活动';
      travel = '出行注意防风防沙';
    } else if (weatherType.includes('雾') || weatherType.includes('霾')) {
      activity = '不适宜户外运动，建议室内活动';
      travel = '能见度较低，出行请注意安全';
      health = '建议佩戴口罩，减少户外活动';
    } else if (weatherType === '晴') {
      activity = '适宜各种户外运动和活动';
      travel = '天气良好，适宜出行';
    } else {
      activity = '适宜轻度户外活动';
      travel = '天气一般，出行请注意天气变化';
    }

    // 根据湿度给出健康建议
    if (!health) {
      if (humidity < 30) {
        health = '空气干燥，建议多补充水分，注意皮肤保湿';
      } else if (humidity > 80) {
        health = '湿度较高，注意防潮，避免长时间户外活动';
      } else {
        health = '湿度适宜，适合各种活动';
      }
    }

    return {
      clothing,
      activity,
      health,
      travel,
      icon: this.getWeatherIcon(weatherType),
    };
  }

  /**
   * 判断天气是否适合外出
   */
  isSuitableForOutdoor(weather: WeatherInfo): boolean {
    const weatherType = weather.weather;
    const temp = parseFloat(weather.temperature_float || weather.temperature);
    
    // 恶劣天气不适合外出
    const badWeatherKeywords = ['暴雨', '大雨', '暴雪', '大雪', '沙尘暴', '大风', '雾', '霾'];
    if (badWeatherKeywords.some(keyword => weatherType.includes(keyword))) {
      return false;
    }
    
    // 极端温度不适合外出
    if (temp < -10 || temp > 40) {
      return false;
    }
    
    return true;
  }

  /**
   * 获取拥挤度影响因子
   * 根据天气情况返回对场所拥挤度的影响系数
   */
  getCrowdImpactFactor(weather: WeatherInfo): number {
    const weatherType = weather.weather;
    const temp = parseFloat(weather.temperature_float || weather.temperature);
    
    let factor = 1.0; // 基础系数
    
    // 恶劣天气会增加室内场所拥挤度
    if (weatherType.includes('雨') || weatherType.includes('雪')) {
      factor *= 1.3;
    } else if (weatherType.includes('风') || weatherType.includes('沙')) {
      factor *= 1.2;
    } else if (weatherType.includes('雾') || weatherType.includes('霾')) {
      factor *= 1.2;
    }
    
    // 极端温度影响
    if (temp < 0 || temp > 35) {
      factor *= 1.2;
    } else if (temp >= 20 && temp <= 25) {
      // 舒适温度可能增加户外活动
      factor *= 0.9;
    }
    
    return Math.min(factor, 2.0); // 最大不超过2倍
  }

  /**
   * 格式化温度显示
   */
  formatTemperature(temp: string): string {
    const temperature = parseFloat(temp);
    return `${temperature}°C`;
  }

  /**
   * 格式化湿度显示
   */
  formatHumidity(humidity: string): string {
    return `${humidity}%`;
  }

  /**
   * 获取风力等级描述
   */
  getWindDescription(windpower: string): string {
    const power = parseInt(windpower);
    const descriptions = [
      '无风', '软风', '轻风', '微风', '和风', 
      '清风', '强风', '疾风', '大风', '烈风', 
      '狂风', '暴风', '飓风'
    ];
    
    return descriptions[power] || '未知';
  }
}

// 导出单例实例
export const weatherService = WeatherService.getInstance();

// 导出便捷方法
export const {
  getCurrentWeather,
  getWeatherForecast,
  getWeatherByLocation,
  getWeatherIcon,
  getWeatherAdvice,
  isSuitableForOutdoor,
  getCrowdImpactFactor,
  formatTemperature,
  formatHumidity,
  getWindDescription,
} = weatherService;