'use client';

import { useState, useEffect } from 'react';
import { useMatchStore } from '@/lib/stores/matchStore';
import { Search, MapPin, Clock, Users, Zap, Loader2, CheckCircle } from 'lucide-react';
import { Place, PlaceCategory } from '@/types';

// 模拟场所数据
const mockPlaces: Place[] = [
  {
    id: 'place_1',
    name: '星巴克咖啡（建国门店）',
    address: '朝阳区建国门外大街1号国贸大厦B1层',
    coordinates: { lat: 39.9042, lng: 116.4074 },
    category: PlaceCategory.RESTAURANT,
    currentStatus: {
      isOpen: true,
      queueLength: 5,
      estimatedWaitTime: 8,
      lastUpdated: new Date(),
      crowdDensity: 0.6
    },
    waitTime: 8,
    crowdLevel: 'medium' as any,
    noiseLevel: 'moderate' as any,
    accessibility: {
      wheelchairAccessible: true,
      hasElevator: true,
      hasRamp: false,
      hasAccessibleParking: false,
      hasAccessibleRestroom: true
    },
    openHours: {
      monday: [{ open: '07:00', close: '22:00' }],
      tuesday: [{ open: '07:00', close: '22:00' }],
      wednesday: [{ open: '07:00', close: '22:00' }],
      thursday: [{ open: '07:00', close: '22:00' }],
      friday: [{ open: '07:00', close: '22:00' }],
      saturday: [{ open: '08:00', close: '23:00' }],
      sunday: [{ open: '08:00', close: '23:00' }]
    }
  },
  {
    id: 'place_2',
    name: '麦当劳（王府井店）',
    address: '东城区王府井大街138号APM购物中心',
    coordinates: { lat: 39.9097, lng: 116.4109 },
    category: PlaceCategory.RESTAURANT,
    currentStatus: {
      isOpen: true,
      queueLength: 12,
      estimatedWaitTime: 15,
      lastUpdated: new Date(),
      crowdDensity: 0.8
    },
    waitTime: 15,
    crowdLevel: 'high' as any,
    noiseLevel: 'loud' as any,
    accessibility: {
      wheelchairAccessible: true,
      hasElevator: true,
      hasRamp: true,
      hasAccessibleParking: false,
      hasAccessibleRestroom: true
    },
    openHours: {
      monday: [{ open: '06:00', close: '24:00' }],
      tuesday: [{ open: '06:00', close: '24:00' }],
      wednesday: [{ open: '06:00', close: '24:00' }],
      thursday: [{ open: '06:00', close: '24:00' }],
      friday: [{ open: '06:00', close: '24:00' }],
      saturday: [{ open: '06:00', close: '24:00' }],
      sunday: [{ open: '06:00', close: '24:00' }]
    }
  },
  {
    id: 'place_3',
    name: '北京银行（朝阳支行）',
    address: '朝阳区朝阳门外大街16号',
    coordinates: { lat: 39.9267, lng: 116.4342 },
    category: PlaceCategory.BANK,
    currentStatus: {
      isOpen: true,
      queueLength: 8,
      estimatedWaitTime: 25,
      lastUpdated: new Date(),
      crowdDensity: 0.7
    },
    waitTime: 25,
    crowdLevel: 'medium' as any,
    noiseLevel: 'quiet' as any,
    accessibility: {
      wheelchairAccessible: true,
      hasElevator: true,
      hasRamp: true,
      hasAccessibleParking: true,
      hasAccessibleRestroom: true
    },
    openHours: {
      monday: [{ open: '09:00', close: '17:00' }],
      tuesday: [{ open: '09:00', close: '17:00' }],
      wednesday: [{ open: '09:00', close: '17:00' }],
      thursday: [{ open: '09:00', close: '17:00' }],
      friday: [{ open: '09:00', close: '17:00' }],
      saturday: [{ open: '09:00', close: '16:00' }],
      sunday: [{ open: '10:00', close: '15:00' }]
    }
  }
];

export function QuickMatch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [preferredTime, setPreferredTime] = useState('');
  const [message, setMessage] = useState('');
  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>(mockPlaces);

  const {
    currentRequest,
    currentMatch,
    isMatching,
    isLoading,
    error,
    createMatchRequest,
    cancelMatchRequest,
    acceptMatch,
    rejectMatch,
    clearError
  } = useMatchStore();

  // 初始化时间为30分钟后
  useEffect(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30);
    setPreferredTime(now.toISOString().slice(0, 16));
  }, []);

  // 搜索过滤
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPlaces(mockPlaces);
    } else {
      const filtered = mockPlaces.filter(place =>
        place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        place.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPlaces(filtered);
    }
  }, [searchQuery]);

  const handleQuickMatch = async () => {
    if (!selectedPlace) {
      alert('请选择一个场所');
      return;
    }

    try {
      await createMatchRequest({
        placeId: selectedPlace.id,
        place: selectedPlace,
        preferredTime: new Date(preferredTime),
        message: message.trim() || '寻找同行伙伴',
        flexibleTime: 30,
        maxWaitTime: 15
      });
    } catch (err) {
      console.error('创建匹配请求失败:', err);
    }
  };

  const handleCancelMatch = async () => {
    try {
      await cancelMatchRequest();
    } catch (err) {
      console.error('取消匹配失败:', err);
    }
  };

  const handleAcceptMatch = async () => {
    if (currentMatch) {
      try {
        await acceptMatch(currentMatch.id);
      } catch (err) {
        console.error('接受匹配失败:', err);
      }
    }
  };

  const handleRejectMatch = async () => {
    if (currentMatch) {
      try {
        await rejectMatch(currentMatch.id);
      } catch (err) {
        console.error('拒绝匹配失败:', err);
      }
    }
  };

  // 如果有匹配结果，显示匹配成功页面
  if (currentMatch) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">匹配成功！</h2>
          <p className="text-gray-600">找到了合适的同行伙伴</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">匹配详情</h3>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">{currentMatch.place.name}</p>
                <p className="text-sm text-gray-600">{currentMatch.place.address}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">
                  {currentMatch.scheduledTime.toLocaleString('zh-CN')}
                </p>
                <p className="text-sm text-gray-600">计划时间</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">
                  {currentMatch.users.map(user => user.name).join(', ')}
                </p>
                <p className="text-sm text-gray-600">同行伙伴</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleAcceptMatch}
            disabled={isLoading}
            className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin mx-auto" />
            ) : (
              '接受匹配'
            )}
          </button>
          <button
            onClick={handleRejectMatch}
            disabled={isLoading}
            className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            拒绝匹配
          </button>
        </div>
      </div>
    );
  }

  // 如果正在匹配，显示匹配中页面
  if (isMatching && currentRequest) {
    return (
      <div className="text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">正在寻找同行伙伴</h2>
          <p className="text-gray-600">请稍候，我们正在为您匹配合适的用户...</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 text-left">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">您的请求</h3>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">{currentRequest.place.name}</p>
                <p className="text-sm text-gray-600">{currentRequest.place.address}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-gray-400" />
              <p className="text-gray-900">
                {currentRequest.preferredTime.toLocaleString('zh-CN')}
              </p>
            </div>

            {currentRequest.message && (
              <div className="flex items-start space-x-3">
                <Users className="h-5 w-5 text-gray-400 mt-0.5" />
                <p className="text-gray-900">{currentRequest.message}</p>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleCancelMatch}
          disabled={isLoading}
          className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          取消匹配
        </button>
      </div>
    );
  }

  // 默认的快速匹配界面
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Zap className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">快速匹配</h2>
        <p className="text-gray-600">选择目的地，一键寻找同行伙伴</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">出现错误</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={clearError}
                  className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded-md hover:bg-red-200 transition-colors"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* 搜索场所 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            选择目的地 *
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索餐厅、银行、商场等..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* 场所列表 */}
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {filteredPlaces.map((place) => (
            <div
              key={place.id}
              onClick={() => setSelectedPlace(place)}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedPlace?.id === place.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{place.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{place.address}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      等待 {place.waitTime}分钟
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      place.crowdLevel === 'low' ? 'bg-green-100 text-green-700' :
                      place.crowdLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {place.crowdLevel === 'low' ? '人少' :
                       place.crowdLevel === 'medium' ? '适中' : '拥挤'}
                    </span>
                  </div>
                </div>
                {selectedPlace?.id === place.id && (
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-1" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 时间选择 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            计划时间 *
          </label>
          <input
            type="datetime-local"
            value={preferredTime}
            onChange={(e) => setPreferredTime(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* 留言 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            留言（可选）
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="简单介绍一下自己或说明同行目的..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {/* 匹配按钮 */}
        <button
          onClick={handleQuickMatch}
          disabled={!selectedPlace || !preferredTime || isLoading}
          className="w-full bg-blue-600 text-white py-4 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Zap className="h-5 w-5" />
              <span>开始匹配</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}