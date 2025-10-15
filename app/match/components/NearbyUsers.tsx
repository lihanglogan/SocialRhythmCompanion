'use client';

import { useState, useEffect } from 'react';
import { useMatchStore } from '@/lib/stores/matchStore';
import { MatchCard } from './MatchCard';
import { MapPin, Loader2, RefreshCw, Filter, Users, AlertCircle } from 'lucide-react';
import { CompanionRequest } from '@/types';

export function NearbyUsers() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterRadius, setFilterRadius] = useState(5000); // 5km
  const [sortBy, setSortBy] = useState<'distance' | 'time' | 'rating'>('distance');
  const [showFilters, setShowFilters] = useState(false);

  const {
    nearbyRequests,
    isLoading,
    error,
    fetchNearbyRequests,
    createMatchRequest,
    clearError
  } = useMatchStore();

  // 模拟用户位置（实际应用中应该获取真实位置）
  const userLocation = { lat: 39.9042, lng: 116.4074 };

  // 初始加载
  useEffect(() => {
    handleFetchNearby();
  }, []);

  const handleFetchNearby = async () => {
    try {
      await fetchNearbyRequests(userLocation, filterRadius);
    } catch (err) {
      console.error('获取附近用户失败:', err);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await handleFetchNearby();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleConnect = async (request: CompanionRequest) => {
    try {
      // 创建一个连接请求
      await createMatchRequest({
        placeId: request.placeId,
        place: request.place,
        preferredTime: request.preferredTime,
        message: `希望与您同行前往 ${request.place.name}`,
        flexibleTime: 15,
        maxWaitTime: 10
      });
    } catch (err) {
      console.error('申请同行失败:', err);
    }
  };

  const handleViewProfile = (userId: string) => {
    console.log('查看用户资料:', userId);
    // 这里应该打开用户资料页面或模态框
  };

  // 计算距离（简化版本）
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // 地球半径（公里）
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // 排序和过滤请求
  const processedRequests = nearbyRequests
    .map(request => ({
      ...request,
      distance: calculateDistance(
        userLocation.lat,
        userLocation.lng,
        request.place.coordinates.lat,
        request.place.coordinates.lng
      )
    }))
    .filter(request => request.distance <= filterRadius / 1000)
    .sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return a.distance - b.distance;
        case 'time':
          return a.preferredTime.getTime() - b.preferredTime.getTime();
        case 'rating':
          // 模拟评分排序
          return 4.8 - 4.5; // 这里应该使用真实的用户评分
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <MapPin className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">附近同行</h2>
        <p className="text-gray-600">发现附近正在寻找同行伙伴的用户</p>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
            <div className="ml-3 flex-1">
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

      {/* 控制栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>刷新</span>
          </button>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="h-4 w-4" />
            <span>筛选</span>
          </button>
        </div>

        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Users className="h-4 w-4" />
          <span>找到 {processedRequests.length} 个用户</span>
        </div>
      </div>

      {/* 筛选面板 */}
      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <h3 className="font-medium text-gray-900">筛选条件</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 距离筛选 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                搜索半径
              </label>
              <select
                value={filterRadius}
                onChange={(e) => setFilterRadius(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={1000}>1公里内</option>
                <option value={3000}>3公里内</option>
                <option value={5000}>5公里内</option>
                <option value={10000}>10公里内</option>
                <option value={20000}>20公里内</option>
              </select>
            </div>

            {/* 排序方式 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                排序方式
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'distance' | 'time' | 'rating')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="distance">距离最近</option>
                <option value="time">时间最近</option>
                <option value="rating">评分最高</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setShowFilters(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleFetchNearby}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              应用筛选
            </button>
          </div>
        </div>
      )}

      {/* 加载状态 */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">正在搜索附近的同行用户...</p>
          </div>
        </div>
      )}

      {/* 用户列表 */}
      {!isLoading && (
        <div className="space-y-4">
          {processedRequests.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">暂无附近用户</h3>
              <p className="text-gray-600 mb-4">
                当前范围内没有正在寻找同行的用户
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  重新搜索
                </button>
                <button
                  onClick={() => {
                    setFilterRadius(20000);
                    handleFetchNearby();
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  扩大搜索范围
                </button>
              </div>
            </div>
          ) : (
            processedRequests.map((request) => (
              <div key={request.id} className="relative">
                <MatchCard
                  type="request"
                  data={request}
                  onConnect={() => handleConnect(request)}
                  onViewProfile={handleViewProfile}
                />
                
                {/* 距离标签 */}
                <div className="absolute top-4 right-4 bg-white border border-gray-200 rounded-full px-2 py-1 text-xs text-gray-600 shadow-sm">
                  {request.distance < 1 
                    ? `${Math.round(request.distance * 1000)}m` 
                    : `${request.distance.toFixed(1)}km`
                  }
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 底部提示 */}
      {!isLoading && processedRequests.length > 0 && (
        <div className="text-center py-6">
          <p className="text-sm text-gray-500 mb-4">
            以上是附近 {filterRadius / 1000}km 内的同行用户
          </p>
          <button
            onClick={handleRefresh}
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            刷新获取最新信息
          </button>
        </div>
      )}

      {/* 位置权限提示 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <MapPin className="h-5 w-5 text-blue-400 mt-0.5" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">位置服务提示</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>为了获得更准确的附近用户信息，建议开启位置服务权限。</p>
            </div>
            <div className="mt-4">
              <button
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (position) => {
                        console.log('获取到位置:', position.coords);
                        // 这里可以更新用户位置并重新搜索
                      },
                      (error) => {
                        console.error('获取位置失败:', error);
                      }
                    );
                  }
                }}
                className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-md hover:bg-blue-200 transition-colors"
              >
                开启位置服务
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}