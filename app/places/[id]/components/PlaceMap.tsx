'use client';

import { useEffect, useRef, useState } from 'react';
import { Place } from '@/types';
import { MapPin, Navigation, Layers, Maximize2 } from 'lucide-react';

interface PlaceMapProps {
  place: Place;
}

export default function PlaceMap({ place }: PlaceMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapType, setMapType] = useState<'satellite' | 'roadmap'>('roadmap');

  useEffect(() => {
    if (!mapRef.current || typeof window === 'undefined') return;

    // 检查是否已加载高德地图API
    if (!window.AMap) {
      console.warn('高德地图API未加载');
      return;
    }

    // 创建地图实例
    const mapInstance = new window.AMap.Map(mapRef.current, {
      center: [place.coordinates.lng, place.coordinates.lat],
      zoom: 16,
      mapStyle: mapType === 'satellite' ? 'amap://styles/satellite' : 'amap://styles/normal'
    });

    // 添加场所标记
    const marker = new window.AMap.Marker({
      position: [place.coordinates.lng, place.coordinates.lat],
      title: place.name,
      icon: new window.AMap.Icon({
        size: new window.AMap.Size(40, 50),
        image: 'data:image/svg+xml;base64,' + btoa(`
          <svg width="40" height="50" viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 0C9 0 0 9 0 20C0 35 20 50 20 50C20 50 40 35 40 20C40 9 31 0 20 0Z" fill="#3B82F6"/>
            <circle cx="20" cy="20" r="8" fill="white"/>
            <circle cx="20" cy="20" r="4" fill="#3B82F6"/>
          </svg>
        `),
        imageSize: new window.AMap.Size(40, 50)
      })
    });

    mapInstance.add(marker);

    // 添加信息窗口
    const infoWindow = new window.AMap.InfoWindow({
      content: `
        <div class="p-3 min-w-[200px]">
          <h3 class="font-semibold text-gray-900 mb-2">${place.name}</h3>
          <p class="text-sm text-gray-600 mb-2">${place.address}</p>
          <div class="flex items-center space-x-2 text-xs">
            <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded">
              ${place.currentStatus.isOpen ? '营业中' : '已关闭'}
            </span>
            <span class="text-gray-500">等待 ${place.waitTime} 分钟</span>
          </div>
        </div>
      `,
      offset: new window.AMap.Pixel(0, -50)
    });

    // 点击标记显示信息窗口
    marker.on('click', () => {
      infoWindow.open(mapInstance, marker.getPosition());
    });

    // 添加周边场所标记（模拟数据）
    const nearbyPlaces = generateNearbyPlaces(place);
    nearbyPlaces.forEach(nearbyPlace => {
      const nearbyMarker = new window.AMap.Marker({
        position: [nearbyPlace.lng, nearbyPlace.lat],
        title: nearbyPlace.name,
        icon: new window.AMap.Icon({
          size: new window.AMap.Size(24, 30),
          image: 'data:image/svg+xml;base64,' + btoa(`
            <svg width="24" height="30" viewBox="0 0 24 30" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0C5.4 0 0 5.4 0 12C0 21 12 30 12 30C12 30 24 21 24 12C24 5.4 18.6 0 12 0Z" fill="#6B7280"/>
              <circle cx="12" cy="12" r="5" fill="white"/>
              <circle cx="12" cy="12" r="2" fill="#6B7280"/>
            </svg>
          `),
          imageSize: new window.AMap.Size(24, 30)
        })
      });

      const nearbyInfoWindow = new window.AMap.InfoWindow({
        content: `
          <div class="p-2">
            <h4 class="font-medium text-gray-900">${nearbyPlace.name}</h4>
            <p class="text-xs text-gray-600">${nearbyPlace.category}</p>
          </div>
        `,
        offset: new window.AMap.Pixel(0, -30)
      });

      nearbyMarker.on('click', () => {
        nearbyInfoWindow.open(mapInstance, nearbyMarker.getPosition());
      });

      mapInstance.add(nearbyMarker);
    });

    setMap(mapInstance);

    return () => {
      if (mapInstance) {
        mapInstance.destroy();
      }
    };
  }, [place, mapType]);

  // 生成周边场所数据
  const generateNearbyPlaces = (centerPlace: Place) => {
    const categories = ['餐饮', '购物', '交通', '医疗', '银行'];
    const names = ['便利店', '咖啡厅', '地铁站', '公交站', '银行ATM'];
    
    return Array.from({ length: 5 }, (_, i) => ({
      name: names[i],
      category: categories[i],
      lat: centerPlace.coordinates.lat + (Math.random() - 0.5) * 0.01,
      lng: centerPlace.coordinates.lng + (Math.random() - 0.5) * 0.01
    }));
  };

  // 切换地图类型
  const toggleMapType = () => {
    const newType = mapType === 'roadmap' ? 'satellite' : 'roadmap';
    setMapType(newType);
    
    if (map) {
      map.setMapStyle(newType === 'satellite' ? 'amap://styles/satellite' : 'amap://styles/normal');
    }
  };

  // 导航到场所
  const navigateToPlace = () => {
    const url = `https://uri.amap.com/navigation?to=${place.coordinates.lng},${place.coordinates.lat},${place.name}&mode=car&policy=1&src=myapp&coordinate=gaode&callnative=0`;
    window.open(url, '_blank');
  };

  // 全屏切换
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-primary-600" />
            场所位置
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleMapType}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="切换地图类型"
            >
              <Layers className="w-4 h-4" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="全屏显示"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={navigateToPlace}
              className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Navigation className="w-4 h-4" />
              <span>导航</span>
            </button>
          </div>
        </div>
      </div>

      <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'h-96'}`}>
        {isFullscreen && (
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={toggleFullscreen}
              className="bg-white shadow-lg p-2 rounded-lg text-gray-600 hover:text-gray-900"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        )}
        
        <div ref={mapRef} className="w-full h-full" />
        
        {!map && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">加载地图中...</p>
            </div>
          </div>
        )}
      </div>

      {/* 地图信息 */}
      <div className="p-4 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">位置信息</h3>
            <div className="space-y-1 text-gray-600">
              <div>经度: {place.coordinates.lng.toFixed(6)}</div>
              <div>纬度: {place.coordinates.lat.toFixed(6)}</div>
            </div>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">交通信息</h3>
            <div className="space-y-1 text-gray-600">
              <div>最近地铁站: 约 {Math.floor(Math.random() * 800 + 200)}m</div>
              <div>最近公交站: 约 {Math.floor(Math.random() * 300 + 50)}m</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}