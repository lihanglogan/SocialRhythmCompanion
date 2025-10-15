'use client';

import { PlaceCard } from './PlaceCard';
import { Button } from '@/components/ui/Button';
import { MapPin, ArrowLeft } from 'lucide-react';
import { useMapStore } from '@/lib/stores/mapStore';

interface SearchResult {
  id: string;
  name: string;
  category: string;
  location: {
    latitude: number;
    longitude: number;
  };
  crowdLevel: 'low' | 'medium' | 'high';
  rating: number;
  tags: string[];
  openingHours?: string;
  description?: string;
}

interface SearchResultsProps {
  results: SearchResult[];
}

export function SearchResults({ results }: SearchResultsProps) {
  const { clearSearch } = useMapStore();

  const handleBackToList = () => {
    clearSearch();
  };

  const handlePlaceAction = (action: string, result: SearchResult) => {
    console.log(`${action} action for search result:`, result.name);
    // 这里可以添加具体的操作逻辑
  };

  // 转换搜索结果为Place格式以便复用PlaceCard
  const convertToPlace = (result: SearchResult) => ({
    id: result.id,
    name: result.name,
    address: `搜索结果 - ${result.name}`,
    coordinates: {
      lat: result.location.latitude,
      lng: result.location.longitude
    },
    category: result.category as any,
    currentStatus: {
      isOpen: true,
      queueLength: Math.floor(Math.random() * 10),
      estimatedWaitTime: Math.floor(Math.random() * 30),
      lastUpdated: new Date(),
      crowdDensity: Math.random()
    },
    waitTime: Math.floor(Math.random() * 30),
    crowdLevel: result.crowdLevel as any,
    noiseLevel: 'moderate' as any,
    accessibility: {
      wheelchairAccessible: Math.random() > 0.5,
      hasElevator: Math.random() > 0.5,
      hasRamp: Math.random() > 0.5,
      hasAccessibleParking: Math.random() > 0.5,
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
  });

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <MapPin className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          没有找到搜索结果
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          尝试使用不同的关键词或调整搜索条件
        </p>
        <Button
          variant="outline"
          onClick={handleBackToList}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回场所列表
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 搜索结果头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToList}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回列表
          </Button>
          
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              搜索结果
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              找到 {results.length} 个相关场所
            </p>
          </div>
        </div>
      </div>

      {/* 搜索结果列表 */}
      <div className="space-y-4">
        {results.map((result) => (
          <div key={result.id} className="relative">
            <PlaceCard
              place={convertToPlace(result)}
              variant="compact"
              showDistance={true}
              onNavigate={(place) => handlePlaceAction('navigate', result)}
              onFavorite={(place) => handlePlaceAction('favorite', result)}
              onViewDetails={(place) => handlePlaceAction('viewDetails', result)}
            />
            
            {/* 搜索匹配标签 */}
            {result.tags && result.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {result.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full dark:bg-blue-900/20 dark:text-blue-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 搜索建议 */}
      <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
          搜索提示
        </h3>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• 尝试使用更具体的关键词</li>
          <li>• 搜索场所类型，如"银行"、"餐厅"、"医院"</li>
          <li>• 搜索地点名称，如"三里屯"、"王府井"</li>
          <li>• 使用筛选条件缩小搜索范围</li>
        </ul>
      </div>
    </div>
  );
}