'use client';

import { Place, CrowdLevel } from '@/types';
import { MapPin, Clock, Users, Star, Navigation, Heart, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface PlaceCardProps {
  place: Place;
  variant?: 'default' | 'compact' | 'detailed';
  showDistance?: boolean;
  onNavigate?: (place: Place) => void;
  onFavorite?: (place: Place) => void;
  onViewDetails?: (place: Place) => void;
}

export function PlaceCard({
  place,
  variant = 'default',
  showDistance = true,
  onNavigate,
  onFavorite,
  onViewDetails
}: PlaceCardProps) {
  const getCrowdLevelColor = (level: CrowdLevel) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'very_high': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getCrowdLevelText = (level: CrowdLevel) => {
    switch (level) {
      case 'low': return '人少';
      case 'medium': return '适中';
      case 'high': return '较多';
      case 'very_high': return '拥挤';
      default: return '未知';
    }
  };

  const getCrowdLevelIcon = (level: CrowdLevel) => {
    switch (level) {
      case 'low': return '🟢';
      case 'medium': return '🟡';
      case 'high': return '🟠';
      case 'very_high': return '🔴';
      default: return '⚫';
    }
  };

  const getCategoryText = (category: string) => {
    const categoryMap: Record<string, string> = {
      'restaurant': '餐饮',
      'hospital': '医院',
      'bank': '银行',
      'government': '政务',
      'shopping': '购物',
      'transport': '交通',
      'education': '教育',
      'entertainment': '娱乐',
      'other': '其他'
    };
    return categoryMap[category] || category;
  };

  const formatWaitTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}分钟`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}小时${remainingMinutes}分钟` : `${hours}小时`;
  };

  const getDistance = () => {
    // 模拟距离计算
    return `${(Math.random() * 5 + 0.1).toFixed(1)}km`;
  };

  if (variant === 'compact') {
    return (
      <div className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
        <div className="flex-shrink-0">
          <div className={cn(
            "w-3 h-3 rounded-full",
            place.crowdLevel === 'low' ? 'bg-green-500' :
            place.crowdLevel === 'medium' ? 'bg-yellow-500' :
            place.crowdLevel === 'high' ? 'bg-orange-500' : 'bg-red-500'
          )} />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
            {place.name}
          </p>
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <span>{getCategoryText(place.category)}</span>
            <span>•</span>
            <span>{formatWaitTime(place.waitTime)}</span>
            {showDistance && (
              <>
                <span>•</span>
                <span>{getDistance()}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm" onClick={() => onViewDetails?.(place)}>
            <Info className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow">
      {/* 卡片头部 */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                {place.name}
              </h3>
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                {getCategoryText(place.category)}
              </span>
            </div>
            
            <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 mb-2">
              <MapPin className="h-4 w-4" />
              <span className="truncate">{place.address}</span>
            </div>
          </div>

          <div className="flex-shrink-0 ml-4">
            <div className={cn(
              "inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border",
              getCrowdLevelColor(place.crowdLevel)
            )}>
              <span>{getCrowdLevelIcon(place.crowdLevel)}</span>
              <span>{getCrowdLevelText(place.crowdLevel)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 状态信息 */}
      <div className="px-4 pb-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600 dark:text-gray-400">
              等待时间: <span className="font-medium text-gray-900 dark:text-gray-100">
                {formatWaitTime(place.waitTime)}
              </span>
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600 dark:text-gray-400">
              排队: <span className="font-medium text-gray-900 dark:text-gray-100">
                {place.currentStatus.queueLength}人
              </span>
            </span>
          </div>

          {showDistance && (
            <div className="flex items-center space-x-2">
              <Navigation className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">
                距离: <span className="font-medium text-gray-900 dark:text-gray-100">
                  {getDistance()}
                </span>
              </span>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <div className={cn(
              "w-3 h-3 rounded-full",
              place.currentStatus.isOpen ? 'bg-green-500' : 'bg-red-500'
            )} />
            <span className={cn(
              "text-sm font-medium",
              place.currentStatus.isOpen ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            )}>
              {place.currentStatus.isOpen ? '营业中' : '已关闭'}
            </span>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate?.(place)}
            >
              <Navigation className="h-4 w-4 mr-1" />
              导航
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFavorite?.(place)}
            >
              <Heart className="h-4 w-4 mr-1" />
              收藏
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetails?.(place)}
          >
            查看详情
          </Button>
        </div>
      </div>
    </div>
  );
}