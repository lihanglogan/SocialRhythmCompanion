'use client';

import { Place, CrowdLevel, PlaceCategory } from '@/types';
import { MapPin, Clock, Users, Volume2, Star, Phone, Globe } from 'lucide-react';

interface PlaceHeaderProps {
  place: Place;
}

const getCrowdLevelColor = (level: CrowdLevel) => {
  switch (level) {
    case CrowdLevel.LOW: return 'text-green-600 bg-green-100';
    case CrowdLevel.MEDIUM: return 'text-yellow-600 bg-yellow-100';
    case CrowdLevel.HIGH: return 'text-orange-600 bg-orange-100';
    case CrowdLevel.VERY_HIGH: return 'text-red-600 bg-red-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

const getCrowdLevelText = (level: CrowdLevel) => {
  switch (level) {
    case CrowdLevel.LOW: return '人少';
    case CrowdLevel.MEDIUM: return '适中';
    case CrowdLevel.HIGH: return '较多';
    case CrowdLevel.VERY_HIGH: return '拥挤';
    default: return '未知';
  }
};

const getCategoryIcon = (category: PlaceCategory) => {
  switch (category) {
    case PlaceCategory.RESTAURANT: return '🍽️';
    case PlaceCategory.HOSPITAL: return '🏥';
    case PlaceCategory.BANK: return '🏦';
    case PlaceCategory.GOVERNMENT: return '🏛️';
    case PlaceCategory.SHOPPING: return '🛒';
    case PlaceCategory.TRANSPORT: return '🚇';
    case PlaceCategory.EDUCATION: return '🎓';
    case PlaceCategory.ENTERTAINMENT: return '🎬';
    default: return '📍';
  }
};

const getCategoryText = (category: PlaceCategory) => {
  switch (category) {
    case PlaceCategory.RESTAURANT: return '餐饮';
    case PlaceCategory.HOSPITAL: return '医院';
    case PlaceCategory.BANK: return '银行';
    case PlaceCategory.GOVERNMENT: return '政务';
    case PlaceCategory.SHOPPING: return '购物';
    case PlaceCategory.TRANSPORT: return '交通';
    case PlaceCategory.EDUCATION: return '教育';
    case PlaceCategory.ENTERTAINMENT: return '娱乐';
    default: return '其他';
  }
};

export default function PlaceHeader({ place }: PlaceHeaderProps) {
  const isOpen = place.currentStatus.isOpen;
  const rating = 4.2 + Math.random() * 0.8; // 模拟评分

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* 头部背景图 */}
      <div className="h-48 bg-gradient-to-r from-primary-500 to-primary-600 relative">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="absolute bottom-4 left-6 text-white">
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-3xl">{getCategoryIcon(place.category)}</span>
            <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm font-medium">
              {getCategoryText(place.category)}
            </span>
          </div>
          <h1 className="text-3xl font-bold mb-1">{place.name}</h1>
          <div className="flex items-center space-x-2 text-sm">
            <MapPin className="w-4 h-4" />
            <span>{place.address}</span>
          </div>
        </div>
      </div>

      {/* 主要信息 */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 营业状态 */}
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${isOpen ? 'bg-green-100' : 'bg-red-100'}`}>
              <Clock className={`w-5 h-5 ${isOpen ? 'text-green-600' : 'text-red-600'}`} />
            </div>
            <div>
              <div className="text-sm text-gray-500">营业状态</div>
              <div className={`font-semibold ${isOpen ? 'text-green-600' : 'text-red-600'}`}>
                {isOpen ? '营业中' : '已关闭'}
              </div>
            </div>
          </div>

          {/* 拥挤程度 */}
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${getCrowdLevelColor(place.crowdLevel)}`}>
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm text-gray-500">拥挤程度</div>
              <div className="font-semibold">
                {getCrowdLevelText(place.crowdLevel)}
              </div>
            </div>
          </div>

          {/* 等待时间 */}
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">预计等待</div>
              <div className="font-semibold text-blue-600">
                {place.waitTime} 分钟
              </div>
            </div>
          </div>

          {/* 用户评分 */}
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-yellow-100">
              <Star className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">用户评分</div>
              <div className="flex items-center space-x-1">
                <span className="font-semibold text-yellow-600">
                  {rating.toFixed(1)}
                </span>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3 h-3 ${
                        star <= Math.floor(rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 详细信息 */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 联系信息 */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">联系信息</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>400-{Math.floor(Math.random() * 900) + 100}-{Math.floor(Math.random() * 9000) + 1000}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Globe className="w-4 h-4" />
                  <span>www.{place.name.toLowerCase().replace(/\s+/g, '')}.com</span>
                </div>
              </div>
            </div>

            {/* 无障碍设施 */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">无障碍设施</h3>
              <div className="flex flex-wrap gap-2">
                {place.accessibility.wheelchairAccessible && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    轮椅通道
                  </span>
                )}
                {place.accessibility.hasElevator && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    电梯
                  </span>
                )}
                {place.accessibility.hasRamp && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    坡道
                  </span>
                )}
                {place.accessibility.hasAccessibleParking && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    无障碍停车位
                  </span>
                )}
                {place.accessibility.hasAccessibleRestroom && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    无障碍洗手间
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}