'use client';

import React, { useState, useEffect } from 'react';
import { useMapStore } from '@/lib/stores/mapStore';
import { Place, HeatmapType, HeatmapData } from '@/types';
import { 
  defaultBeijingPlaces, 
  defaultBeijingHeatmap,
  generateHeatmapData,
  updatePlaceData 
} from '@/lib/data/mockData';

import AMapContainer from './AMapContainer';
import AMapHeatmap from './AMapHeatmap';
import AMapMarkers from './AMapMarkers';
import TimeSlider from './TimeSlider';

interface MapViewProps {
  className?: string;
}

const MapView: React.FC<MapViewProps> = ({ className = '' }) => {
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [places, setPlaces] = useState<Place[]>(defaultBeijingPlaces);
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>(defaultBeijingHeatmap.crowd);
  const [currentHeatmapType, setCurrentHeatmapType] = useState<HeatmapType>(HeatmapType.CROWD);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>('');

  const { 
    center,
    showHeatmap,
    selectedCategories,
    setPlaces: setStorePlaces,
    setHeatmapData: setStoreHeatmapData,
    setSelectedPlace
  } = useMapStore();

  // 地图准备就绪回调
  const handleMapReady = (map: any) => {
    setMapInstance(map);
    console.log('地图初始化完成');
  };

  // 处理标记点击
  const handleMarkerClick = (place: Place) => {
    setSelectedPlaceId(place.id);
    setSelectedPlace(place);
    console.log('选中场所:', place.name);
  };

  // 处理时间变化
  const handleTimeChange = (time: string) => {
    console.log('时间切换到:', time);
    
    // 模拟根据时间更新数据
    const updatedPlaces = updatePlaceData(places);
    setPlaces(updatedPlaces);
    setStorePlaces(updatedPlaces);

    // 根据时间生成新的热力图数据
    const newHeatmapData = generateHeatmapData(center, currentHeatmapType, 100);
    setHeatmapData(newHeatmapData);
    setStoreHeatmapData(newHeatmapData);
  };

  // 处理热力图类型切换
  const handleHeatmapTypeChange = (type: HeatmapType) => {
    setCurrentHeatmapType(type);
    
    // 根据类型获取对应的热力图数据
    let data: HeatmapData[];
    switch (type) {
      case HeatmapType.CROWD:
        data = defaultBeijingHeatmap.crowd;
        break;
      case HeatmapType.WAIT_TIME:
        data = defaultBeijingHeatmap.waitTime;
        break;
      case HeatmapType.TRAFFIC:
        data = defaultBeijingHeatmap.traffic;
        break;
      case HeatmapType.NOISE:
        data = defaultBeijingHeatmap.noise;
        break;
      default:
        data = defaultBeijingHeatmap.crowd;
    }
    
    setHeatmapData(data);
    setStoreHeatmapData(data);
  };

  // 初始化数据
  useEffect(() => {
    setStorePlaces(places);
    setStoreHeatmapData(heatmapData);
  }, []);

  // 定时更新数据（模拟实时更新）
  useEffect(() => {
    const interval = setInterval(() => {
      const updatedPlaces = updatePlaceData(places);
      setPlaces(updatedPlaces);
      setStorePlaces(updatedPlaces);
    }, 30000); // 每30秒更新一次

    return () => clearInterval(interval);
  }, [places]);

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* 地图控制栏 */}
      <div className="flex flex-wrap gap-4 p-4 bg-white border-b border-gray-200">
        {/* 热力图类型选择 */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">热力图类型:</span>
          <div className="flex gap-1">
            {[
              { type: HeatmapType.CROWD, label: '人流', color: 'bg-red-500' },
              { type: HeatmapType.WAIT_TIME, label: '等待', color: 'bg-yellow-500' },
              { type: HeatmapType.TRAFFIC, label: '交通', color: 'bg-blue-500' },
              { type: HeatmapType.NOISE, label: '噪音', color: 'bg-purple-500' }
            ].map(({ type, label, color }) => (
              <button
                key={type}
                onClick={() => handleHeatmapTypeChange(type)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  currentHeatmapType === type
                    ? `${color} text-white`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 数据统计 */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>场所: {places.length}</span>
          <span>开放: {places.filter(p => p.currentStatus.isOpen).length}</span>
          <span>推荐: {places.filter(p => p.crowdLevel === 'low').length}</span>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="flex-1 flex">
        {/* 地图区域 */}
        <div className="flex-1 relative">
          <AMapContainer
            className="w-full h-full"
            onMapReady={handleMapReady}
          />
          
          {/* 地图图层 */}
          {mapInstance && (
            <>
              {/* 热力图图层 */}
              <AMapHeatmap
                map={mapInstance}
                data={heatmapData}
                type={currentHeatmapType}
                visible={showHeatmap}
                opacity={0.6}
                radius={25}
              />
              
              {/* 标记图层 */}
              <AMapMarkers
                map={mapInstance}
                places={places}
                onMarkerClick={handleMarkerClick}
                selectedPlaceId={selectedPlaceId}
              />
            </>
          )}

          {/* 地图上的浮动控件 */}
          <div className="absolute top-4 right-4 z-10">
            <div className="bg-white rounded-lg shadow-lg p-2">
              <button
                onClick={() => {
                  if (mapInstance) {
                    mapInstance.setZoom(mapInstance.getZoom() + 1);
                  }
                }}
                className="block w-8 h-8 mb-1 bg-gray-100 hover:bg-gray-200 rounded text-sm font-bold"
              >
                +
              </button>
              <button
                onClick={() => {
                  if (mapInstance) {
                    mapInstance.setZoom(mapInstance.getZoom() - 1);
                  }
                }}
                className="block w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded text-sm font-bold"
              >
                -
              </button>
            </div>
          </div>
        </div>

        {/* 侧边控制面板 */}
        <div className="w-80 bg-gray-50 border-l border-gray-200 flex flex-col">
          {/* 时间控制器 */}
          <TimeSlider
            className="m-4"
            onTimeChange={handleTimeChange}
          />

          {/* 场所筛选 */}
          <div className="p-4 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">场所筛选</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'restaurant', label: '餐饮', icon: '🍽️' },
                { key: 'hospital', label: '医院', icon: '🏥' },
                { key: 'bank', label: '银行', icon: '🏦' },
                { key: 'government', label: '政务', icon: '🏛️' },
                { key: 'shopping', label: '购物', icon: '🛒' },
                { key: 'transport', label: '交通', icon: '🚇' }
              ].map(({ key, label, icon }) => (
                <button
                  key={key}
                  className={`p-2 rounded text-sm transition-colors ${
                    selectedCategories.includes(key)
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => {
                    // 这里可以实现筛选逻辑
                    console.log('筛选:', key);
                  }}
                >
                  <span className="mr-1">{icon}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 推荐场所列表 */}
          <div className="flex-1 p-4 border-t border-gray-200 overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">推荐场所</h3>
            <div className="space-y-2">
              {places
                .filter(place => place.currentStatus.isOpen && place.crowdLevel !== 'very_high')
                .slice(0, 5)
                .map(place => (
                  <div
                    key={place.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedPlaceId === place.id
                        ? 'bg-blue-100 border border-blue-300'
                        : 'bg-white hover:bg-gray-50 border border-gray-200'
                    }`}
                    onClick={() => handleMarkerClick(place)}
                  >
                    <div className="font-medium text-gray-800 mb-1">{place.name}</div>
                    <div className="text-xs text-gray-500 mb-2">{place.address}</div>
                    <div className="flex justify-between text-xs">
                      <span className={`px-2 py-1 rounded ${
                        place.crowdLevel === 'low' ? 'bg-green-100 text-green-700' :
                        place.crowdLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {place.crowdLevel === 'low' ? '人少' :
                         place.crowdLevel === 'medium' ? '适中' : '拥挤'}
                      </span>
                      <span className="text-gray-600">{place.waitTime}分钟</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;