'use client';

import React, { useEffect, useRef } from 'react';
import { useMapStore } from '@/lib/stores/mapStore';
import { Place, PlaceCategory, CrowdLevel } from '@/types';

interface AMapMarkersProps {
  map: any;
  places: Place[];
  onMarkerClick?: (place: Place) => void;
  selectedPlaceId?: string;
}

const AMapMarkers: React.FC<AMapMarkersProps> = ({
  map,
  places,
  onMarkerClick,
  selectedPlaceId
}) => {
  const markersRef = useRef<any[]>([]);
  const { selectedCategories } = useMapStore();

  // 根据场所类别获取图标
  const getMarkerIcon = (category: PlaceCategory, crowdLevel: CrowdLevel, isSelected: boolean = false) => {
    const baseSize = isSelected ? [32, 32] : [24, 24];
    const crowdColors = {
      [CrowdLevel.LOW]: '#22c55e',     // 绿色 - 人少
      [CrowdLevel.MEDIUM]: '#f59e0b',  // 黄色 - 中等
      [CrowdLevel.HIGH]: '#ef4444',    // 红色 - 拥挤
      [CrowdLevel.VERY_HIGH]: '#991b1b' // 深红色 - 非常拥挤
    };

    const categoryIcons = {
      [PlaceCategory.RESTAURANT]: '🍽️',
      [PlaceCategory.HOSPITAL]: '🏥',
      [PlaceCategory.BANK]: '🏦',
      [PlaceCategory.GOVERNMENT]: '🏛️',
      [PlaceCategory.SHOPPING]: '🛒',
      [PlaceCategory.TRANSPORT]: '🚇',
      [PlaceCategory.EDUCATION]: '🎓',
      [PlaceCategory.ENTERTAINMENT]: '🎪',
      [PlaceCategory.OTHER]: '📍'
    };

    // 创建SVG图标
    const createSVGIcon = (emoji: string, color: string, size: number[]) => {
      const svg = `
        <svg width="${size[0]}" height="${size[1]}" xmlns="http://www.w3.org/2000/svg">
          <circle cx="${size[0]/2}" cy="${size[1]/2}" r="${size[0]/2 - 2}" 
                  fill="${color}" stroke="white" stroke-width="2"/>
          <text x="${size[0]/2}" y="${size[1]/2 + 4}" text-anchor="middle" 
                font-size="${size[0] * 0.5}" fill="white">${emoji}</text>
        </svg>
      `;
      return `data:image/svg+xml;base64,${btoa(svg)}`;
    };

    return {
      image: createSVGIcon(
        categoryIcons[category], 
        crowdColors[crowdLevel], 
        baseSize
      ),
      size: baseSize,
      anchor: 'center'
    };
  };

  // 创建信息窗口内容
  const createInfoWindowContent = (place: Place) => {
    const crowdLevelText = {
      [CrowdLevel.LOW]: '人少',
      [CrowdLevel.MEDIUM]: '适中',
      [CrowdLevel.HIGH]: '拥挤',
      [CrowdLevel.VERY_HIGH]: '非常拥挤'
    };

    const crowdLevelColor = {
      [CrowdLevel.LOW]: 'text-green-600',
      [CrowdLevel.MEDIUM]: 'text-yellow-600',
      [CrowdLevel.HIGH]: 'text-red-600',
      [CrowdLevel.VERY_HIGH]: 'text-red-800'
    };

    return `
      <div class="p-3 min-w-[200px] max-w-[300px]">
        <h3 class="font-bold text-lg mb-2 text-gray-800">${place.name}</h3>
        <p class="text-gray-600 text-sm mb-2">${place.address}</p>
        
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-gray-500">人流状况:</span>
          <span class="text-sm font-medium ${crowdLevelColor[place.crowdLevel]}">
            ${crowdLevelText[place.crowdLevel]}
          </span>
        </div>
        
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-gray-500">预计等待:</span>
          <span class="text-sm font-medium text-blue-600">${place.waitTime}分钟</span>
        </div>
        
        ${place.openHours ? `
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm text-gray-500">营业状态:</span>
            <span class="text-sm font-medium ${place.currentStatus.isOpen ? 'text-green-600' : 'text-red-600'}">
              ${place.currentStatus.isOpen ? '营业中' : '已关闭'}
            </span>
          </div>
        ` : ''}
        
        <div class="flex gap-2 mt-3">
          <button class="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                  onclick="window.handleNavigate && window.handleNavigate('${place.id}')">
            导航
          </button>
          <button class="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                  onclick="window.handleViewDetails && window.handleViewDetails('${place.id}')">
            详情
          </button>
        </div>
      </div>
    `;
  };

  // 清除所有标记
  const clearMarkers = () => {
    markersRef.current.forEach(marker => {
      try {
        marker.setMap(null);
      } catch (error) {
        console.error('清除标记失败:', error);
      }
    });
    markersRef.current = [];
  };

  // 创建标记
  const createMarkers = () => {
    if (!map || !window.AMap || !places) return;

    clearMarkers();

    const newMarkers = places
      .filter(place => {
        // 如果有选中的类别筛选，只显示对应类别的场所
        if (selectedCategories.length > 0) {
          return selectedCategories.includes(place.category);
        }
        return true;
      })
      .map(place => {
        try {
          const isSelected = selectedPlaceId === place.id;
          const icon = getMarkerIcon(place.category, place.crowdLevel, isSelected);
          
          const marker = new window.AMap.Marker({
            position: [place.coordinates.lng, place.coordinates.lat],
            icon: new window.AMap.Icon({
              image: icon.image,
              size: new window.AMap.Size(icon.size[0], icon.size[1]),
              imageSize: new window.AMap.Size(icon.size[0], icon.size[1])
            }),
            title: place.name,
            extData: place
          });

          // 创建信息窗口
          const infoWindow = new window.AMap.InfoWindow({
            content: createInfoWindowContent(place),
            offset: new window.AMap.Pixel(0, -30)
          });

          // 添加点击事件
          marker.on('click', () => {
            // 关闭其他信息窗口
            map.clearInfoWindow();
            
            // 打开当前信息窗口
            infoWindow.open(map, marker.getPosition());
            
            // 触发回调
            if (onMarkerClick) {
              onMarkerClick(place);
            }
          });

          // 添加鼠标悬停效果
          marker.on('mouseover', () => {
            marker.setOptions({
              zIndex: 999
            });
          });

          marker.on('mouseout', () => {
            marker.setOptions({
              zIndex: 100
            });
          });

          marker.setMap(map);
          return marker;
        } catch (error) {
          console.error('创建标记失败:', error);
          return null;
        }
      })
      .filter(Boolean);

    markersRef.current = newMarkers;
  };

  // 更新选中状态
  const updateSelectedMarker = () => {
    markersRef.current.forEach(marker => {
      const place = marker.getExtData();
      if (place) {
        const isSelected = selectedPlaceId === place.id;
        const icon = getMarkerIcon(place.category, place.crowdLevel, isSelected);
        
        marker.setIcon(new window.AMap.Icon({
          image: icon.image,
          size: new window.AMap.Size(icon.size[0], icon.size[1]),
          imageSize: new window.AMap.Size(icon.size[0], icon.size[1])
        }));
      }
    });
  };

  // 设置全局回调函数
  useEffect(() => {
    window.handleNavigate = (placeId: string) => {
      const place = places.find(p => p.id === placeId);
      if (place) {
        // 这里可以集成导航功能
        console.log('导航到:', place.name);
        // 可以调用高德地图的路线规划API或跳转到高德地图APP
      }
    };

    window.handleViewDetails = (placeId: string) => {
      const place = places.find(p => p.id === placeId);
      if (place && onMarkerClick) {
        onMarkerClick(place);
      }
    };

    return () => {
      delete window.handleNavigate;
      delete window.handleViewDetails;
    };
  }, [places, onMarkerClick]);

  // 监听地图和场所数据变化
  useEffect(() => {
    if (map && places) {
      createMarkers();
    }

    return () => {
      clearMarkers();
    };
  }, [map, places, selectedCategories]);

  // 监听选中状态变化
  useEffect(() => {
    updateSelectedMarker();
  }, [selectedPlaceId]);

  // 标记组件不需要渲染任何DOM元素
  return null;
};

export default AMapMarkers;