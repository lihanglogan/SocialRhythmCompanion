import { Place, PlaceCategory, CrowdLevel, NoiseLevel, HeatmapData, HeatmapType } from '@/types';

// 北京市中心坐标
const BEIJING_CENTER = {
  lat: 39.9042,
  lng: 116.4074
};

// 上海市中心坐标
const SHANGHAI_CENTER = {
  lat: 31.2304,
  lng: 121.4737
};

// 生成随机坐标（在指定中心点附近）
const generateRandomCoordinates = (center: { lat: number; lng: number }, radius: number = 0.05) => {
  const randomLat = center.lat + (Math.random() - 0.5) * radius;
  const randomLng = center.lng + (Math.random() - 0.5) * radius;
  return { lat: randomLat, lng: randomLng };
};

// 根据时间获取拥挤程度
const getCrowdLevelByTime = (hour: number, category: PlaceCategory): CrowdLevel => {
  switch (category) {
    case PlaceCategory.RESTAURANT:
      if (hour >= 11 && hour <= 13) return CrowdLevel.VERY_HIGH; // 午餐时间
      if (hour >= 17 && hour <= 19) return CrowdLevel.HIGH; // 晚餐时间
      if (hour >= 7 && hour <= 9) return CrowdLevel.MEDIUM; // 早餐时间
      return CrowdLevel.LOW;
      
    case PlaceCategory.HOSPITAL:
      if (hour >= 8 && hour <= 11) return CrowdLevel.HIGH; // 上午就诊高峰
      if (hour >= 14 && hour <= 16) return CrowdLevel.MEDIUM; // 下午就诊
      return CrowdLevel.LOW;
      
    case PlaceCategory.BANK:
      if (hour >= 9 && hour <= 11) return CrowdLevel.HIGH; // 上午办事高峰
      if (hour >= 14 && hour <= 16) return CrowdLevel.MEDIUM; // 下午办事
      return CrowdLevel.LOW;
      
    case PlaceCategory.GOVERNMENT:
      if (hour >= 9 && hour <= 11) return CrowdLevel.HIGH; // 上午办事高峰
      if (hour >= 14 && hour <= 16) return CrowdLevel.MEDIUM; // 下午办事
      return CrowdLevel.LOW;
      
    case PlaceCategory.SHOPPING:
      if (hour >= 10 && hour <= 12) return CrowdLevel.MEDIUM; // 上午购物
      if (hour >= 14 && hour <= 20) return CrowdLevel.HIGH; // 下午晚上购物高峰
      return CrowdLevel.LOW;
      
    case PlaceCategory.TRANSPORT:
      if (hour >= 7 && hour <= 9) return CrowdLevel.VERY_HIGH; // 早高峰
      if (hour >= 17 && hour <= 19) return CrowdLevel.VERY_HIGH; // 晚高峰
      if (hour >= 12 && hour <= 14) return CrowdLevel.MEDIUM; // 午间
      return CrowdLevel.LOW;
      
    default:
      return Math.random() > 0.5 ? CrowdLevel.MEDIUM : CrowdLevel.LOW;
  }
};

// 根据拥挤程度获取等待时间
const getWaitTimeByLevel = (crowdLevel: CrowdLevel): number => {
  switch (crowdLevel) {
    case CrowdLevel.LOW: return Math.floor(Math.random() * 5) + 1; // 1-5分钟
    case CrowdLevel.MEDIUM: return Math.floor(Math.random() * 10) + 5; // 5-15分钟
    case CrowdLevel.HIGH: return Math.floor(Math.random() * 15) + 15; // 15-30分钟
    case CrowdLevel.VERY_HIGH: return Math.floor(Math.random() * 20) + 30; // 30-50分钟
    default: return 5;
  }
};

// 生成模拟场所数据
export const generateMockPlaces = (city: 'beijing' | 'shanghai' = 'beijing', count: number = 50): Place[] => {
  const center = city === 'beijing' ? BEIJING_CENTER : SHANGHAI_CENTER;
  const cityName = city === 'beijing' ? '北京' : '上海';
  
  const categories = Object.values(PlaceCategory);
  const places: Place[] = [];
  
  for (let i = 0; i < count; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const coordinates = generateRandomCoordinates(center);
    const currentHour = new Date().getHours();
    const crowdLevel = getCrowdLevelByTime(currentHour, category);
    const waitTime = getWaitTimeByLevel(crowdLevel);
    
    // 场所名称映射
    const placeNames = {
      [PlaceCategory.RESTAURANT]: ['麦当劳', '肯德基', '星巴克', '海底捞', '西贝莜面村', '外婆家', '绿茶餐厅'],
      [PlaceCategory.HOSPITAL]: ['人民医院', '中医院', '妇幼保健院', '第一医院', '协和医院', '同仁医院'],
      [PlaceCategory.BANK]: ['中国银行', '工商银行', '建设银行', '农业银行', '招商银行', '交通银行'],
      [PlaceCategory.GOVERNMENT]: ['政务服务中心', '税务局', '工商局', '公安局', '民政局', '社区服务中心'],
      [PlaceCategory.SHOPPING]: ['万达广场', '银泰百货', '大悦城', '永辉超市', '家乐福', '沃尔玛'],
      [PlaceCategory.TRANSPORT]: ['地铁站', '公交站', '火车站', '长途客运站', '机场大巴'],
      [PlaceCategory.EDUCATION]: ['小学', '中学', '大学', '培训机构', '图书馆', '博物馆'],
      [PlaceCategory.ENTERTAINMENT]: ['电影院', 'KTV', '游戏厅', '健身房', '公园', '体育馆'],
      [PlaceCategory.OTHER]: ['便民服务点', '社区中心', '邮局', '快递点']
    };
    
    const nameOptions = placeNames[category];
    const baseName = nameOptions[Math.floor(Math.random() * nameOptions.length)];
    const name = `${baseName}(${cityName}${i + 1}店)`;
    
    const place: Place = {
      id: `${city}_${category}_${i}`,
      name,
      address: `${cityName}市朝阳区某某街道${i + 1}号`,
      coordinates: {
        lat: coordinates.lat,
        lng: coordinates.lng
      },
      category,
      currentStatus: {
        isOpen: Math.random() > 0.1, // 90%概率开放
        queueLength: Math.floor(Math.random() * 20),
        estimatedWaitTime: waitTime,
        lastUpdated: new Date(),
        crowdDensity: Math.random()
      },
      waitTime,
      crowdLevel,
      noiseLevel: Math.random() > 0.7 ? NoiseLevel.LOUD : 
                 Math.random() > 0.4 ? NoiseLevel.MODERATE : NoiseLevel.QUIET,
      accessibility: {
        wheelchairAccessible: Math.random() > 0.3,
        hasElevator: Math.random() > 0.5,
        hasRamp: Math.random() > 0.4,
        hasAccessibleParking: Math.random() > 0.6,
        hasAccessibleRestroom: Math.random() > 0.5
      },
      openHours: {
        monday: [{ open: '09:00', close: '18:00' }],
        tuesday: [{ open: '09:00', close: '18:00' }],
        wednesday: [{ open: '09:00', close: '18:00' }],
        thursday: [{ open: '09:00', close: '18:00' }],
        friday: [{ open: '09:00', close: '18:00' }],
        saturday: [{ open: '10:00', close: '17:00' }],
        sunday: [{ open: '10:00', close: '17:00' }]
      }
    };
    
    places.push(place);
  }
  
  return places;
};

// 生成热力图数据
export const generateHeatmapData = (
  center: { lat: number; lng: number },
  type: HeatmapType,
  count: number = 100
): HeatmapData[] => {
  const data: HeatmapData[] = [];
  const currentHour = new Date().getHours();
  
  for (let i = 0; i < count; i++) {
    const coordinates = generateRandomCoordinates(center, 0.02);
    
    // 根据热力图类型和时间生成强度
    let intensity = Math.random();
    
    switch (type) {
      case HeatmapType.CROWD:
        // 人流密度在高峰时段更高
        if ((currentHour >= 7 && currentHour <= 9) || (currentHour >= 17 && currentHour <= 19)) {
          intensity = Math.random() * 0.5 + 0.5; // 0.5-1.0
        } else if (currentHour >= 11 && currentHour <= 14) {
          intensity = Math.random() * 0.4 + 0.3; // 0.3-0.7
        }
        break;
        
      case HeatmapType.WAIT_TIME:
        // 等待时间与人流密度相关
        if ((currentHour >= 7 && currentHour <= 9) || (currentHour >= 17 && currentHour <= 19)) {
          intensity = Math.random() * 0.6 + 0.4; // 0.4-1.0
        }
        break;
        
      case HeatmapType.TRAFFIC:
        // 交通拥堵在高峰时段更严重
        if ((currentHour >= 7 && currentHour <= 9) || (currentHour >= 17 && currentHour <= 19)) {
          intensity = Math.random() * 0.7 + 0.3; // 0.3-1.0
        }
        break;
        
      case HeatmapType.NOISE:
        // 噪音水平相对稳定，但在商业区更高
        intensity = Math.random() * 0.6 + 0.2; // 0.2-0.8
        break;
    }
    
    data.push({
      coordinates: {
        lat: coordinates.lat,
        lng: coordinates.lng
      },
      intensity,
      timestamp: new Date()
    });
  }
  
  return data;
};

// 实时更新数据（模拟数据变化）
export const updatePlaceData = (places: Place[]): Place[] => {
  const currentHour = new Date().getHours();
  
  return places.map(place => {
    const newCrowdLevel = getCrowdLevelByTime(currentHour, place.category);
    const newWaitTime = getWaitTimeByLevel(newCrowdLevel);
    
    return {
      ...place,
      crowdLevel: newCrowdLevel,
      waitTime: newWaitTime,
      currentStatus: {
        ...place.currentStatus,
        estimatedWaitTime: newWaitTime,
        lastUpdated: new Date(),
        crowdDensity: Math.random()
      }
    };
  });
};

// 获取推荐场所（基于当前时间和拥挤程度）
export const getRecommendedPlaces = (places: Place[], category?: PlaceCategory): Place[] => {
  let filteredPlaces = places.filter(place => 
    place.currentStatus.isOpen && 
    place.crowdLevel !== CrowdLevel.VERY_HIGH
  );
  
  if (category) {
    filteredPlaces = filteredPlaces.filter(place => place.category === category);
  }
  
  // 按等待时间和拥挤程度排序
  return filteredPlaces
    .sort((a, b) => {
      const scoreA = a.waitTime + (a.crowdLevel === CrowdLevel.HIGH ? 20 : 0);
      const scoreB = b.waitTime + (b.crowdLevel === CrowdLevel.HIGH ? 20 : 0);
      return scoreA - scoreB;
    })
    .slice(0, 10); // 返回前10个推荐
};

// 导出默认数据
export const defaultBeijingPlaces = generateMockPlaces('beijing', 50);
export const defaultShanghaiPlaces = generateMockPlaces('shanghai', 50);

export const defaultBeijingHeatmap = {
  crowd: generateHeatmapData(BEIJING_CENTER, HeatmapType.CROWD),
  waitTime: generateHeatmapData(BEIJING_CENTER, HeatmapType.WAIT_TIME),
  traffic: generateHeatmapData(BEIJING_CENTER, HeatmapType.TRAFFIC),
  noise: generateHeatmapData(BEIJING_CENTER, HeatmapType.NOISE)
};

export const defaultShanghaiHeatmap = {
  crowd: generateHeatmapData(SHANGHAI_CENTER, HeatmapType.CROWD),
  waitTime: generateHeatmapData(SHANGHAI_CENTER, HeatmapType.WAIT_TIME),
  traffic: generateHeatmapData(SHANGHAI_CENTER, HeatmapType.TRAFFIC),
  noise: generateHeatmapData(SHANGHAI_CENTER, HeatmapType.NOISE)
};