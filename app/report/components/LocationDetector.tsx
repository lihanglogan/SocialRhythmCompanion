'use client';

import { useState } from 'react';
import { useReportStore } from '@/lib/stores/reportStore';
import { Place } from '@/types';
import { 
  MapPin, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  Navigation,
  Search
} from 'lucide-react';

export function LocationDetector() {
  const {
    locationDetection,
    isDetectingLocation,
    locationError,
    selectedPlace,
    nearbyPlaces,
    detectLocation,
    setSelectedPlace,
    clearError
  } = useReportStore();

  const [showPlaceSelector, setShowPlaceSelector] = useState(false);

  const handleDetectLocation = async () => {
    clearError();
    await detectLocation();
  };

  const handleSelectPlace = (place: Place) => {
    setSelectedPlace(place);
    setShowPlaceSelector(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            位置和场所
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            检测您的位置并选择要上报的场所
          </p>
        </div>
        
        <button
          onClick={handleDetectLocation}
          disabled={isDetectingLocation}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isDetectingLocation ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Navigation className="h-4 w-4" />
          )}
          {isDetectingLocation ? '定位中...' : '检测位置'}
        </button>
      </div>

      {/* 位置检测状态 */}
      {locationError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-900">位置检测失败</h3>
              <p className="text-sm text-red-700 mt-1">{locationError}</p>
              <button
                onClick={handleDetectLocation}
                className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
              >
                重试
              </button>
            </div>
          </div>
        </div>
      )}

      {locationDetection && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-green-900">位置检测成功</h3>
              <p className="text-sm text-green-700 mt-1">
                精度: {Math.round(locationDetection.accuracy)}米 | 
                找到 {nearbyPlaces.length} 个附近场所
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 场所选择 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900">选择场所</h3>
          <button
            onClick={() => setShowPlaceSelector(!showPlaceSelector)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            {showPlaceSelector ? '收起' : '查看所有场所'}
          </button>
        </div>

        {/* 当前选中的场所 */}
        {selectedPlace ? (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium text-blue-900">{selectedPlace.name}</h4>
                <p className="text-sm text-blue-700 mt-1">{selectedPlace.address}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-blue-600">
                  <span>类型: {getCategoryText(selectedPlace.category)}</span>
                  <span>拥挤度: {getCrowdLevelText(selectedPlace.crowdLevel)}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedPlace(null)}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                更换
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
            <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">
              {nearbyPlaces.length > 0 
                ? '请从下方选择一个场所进行上报'
                : '请先检测位置以查找附近场所'
              }
            </p>
          </div>
        )}

        {/* 场所列表 */}
        {(showPlaceSelector || !selectedPlace) && nearbyPlaces.length > 0 && (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            <div className="flex items-center gap-2 mb-2">
              <Search className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">附近场所 ({nearbyPlaces.length})</span>
            </div>
            
            {nearbyPlaces.map((place) => (
              <button
                key={place.id}
                onClick={() => handleSelectPlace(place)}
                className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{place.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{place.address}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>{getCategoryText(place.category)}</span>
                      <span className={`px-2 py-1 rounded-full ${getCrowdLevelColor(place.crowdLevel)}`}>
                        {getCrowdLevelText(place.crowdLevel)}
                      </span>
                      {place.currentStatus.isOpen ? (
                        <span className="text-green-600">营业中</span>
                      ) : (
                        <span className="text-red-600">已关闭</span>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    距离约 {Math.round(Math.random() * 500 + 50)}m
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* 手动输入场所 */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={() => {
              // TODO: 实现手动输入场所功能
              alert('手动输入场所功能开发中...');
            }}
            className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors"
          >
            <div className="flex items-center justify-center gap-2">
              <Search className="h-4 w-4" />
              <span className="text-sm">找不到场所？手动搜索添加</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

// 辅助函数
function getCategoryText(category: string): string {
  const categoryMap: Record<string, string> = {
    restaurant: '餐厅',
    hospital: '医院',
    bank: '银行',
    government: '政府机构',
    shopping: '购物',
    transport: '交通',
    education: '教育',
    entertainment: '娱乐',
    other: '其他'
  };
  return categoryMap[category] || category;
}

function getCrowdLevelText(level: string): string {
  const levelMap: Record<string, string> = {
    low: '人少',
    medium: '适中',
    high: '拥挤',
    very_high: '非常拥挤'
  };
  return levelMap[level] || level;
}

function getCrowdLevelColor(level: string): string {
  const colorMap: Record<string, string> = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    very_high: 'bg-red-100 text-red-800'
  };
  return colorMap[level] || 'bg-gray-100 text-gray-800';
}