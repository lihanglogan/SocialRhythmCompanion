'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useMapStore } from '@/lib/stores/mapStore';

// 高德地图类型声明
declare global {
  interface Window {
    AMap: any;
    _AMapSecurityConfig: {
      securityJSCode: string;
    };
  }
}

interface AMapContainerProps {
  className?: string;
  onMapReady?: (map: any) => void;
}

const AMapContainer: React.FC<AMapContainerProps> = ({ 
  className = '', 
  onMapReady 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  
  const { 
    center, 
    zoom, 
    mapType, 
    setCenter, 
    setZoom,
    setError 
  } = useMapStore();

  // 加载高德地图脚本
  const loadAMapScript = () => {
    return new Promise((resolve, reject) => {
      if (window.AMap) {
        resolve(window.AMap);
        return;
      }

      // 设置安全密钥
      window._AMapSecurityConfig = {
        securityJSCode: process.env.NEXT_PUBLIC_AMAP_SECURITY_CODE || 'demo_security_code',
      };

      const script = document.createElement('script');
      script.src = `https://webapi.amap.com/maps?v=${process.env.NEXT_PUBLIC_AMAP_VERSION || '2.0'}&key=${process.env.NEXT_PUBLIC_AMAP_KEY || 'demo_key_for_development'}&plugin=AMap.HeatMap,AMap.MarkerCluster`;
      script.async = true;
      
      script.onload = () => {
        if (window.AMap) {
          resolve(window.AMap);
        } else {
          reject(new Error('高德地图加载失败'));
        }
      };
      
      script.onerror = () => {
        reject(new Error('高德地图脚本加载失败'));
      };
      
      document.head.appendChild(script);
    });
  };

  // 初始化地图
  const initMap = async () => {
    try {
      if (!mapRef.current) return;

      await loadAMapScript();
      
      const mapInstance = new window.AMap.Map(mapRef.current, {
        center: [center.longitude, center.latitude],
        zoom: zoom,
        mapStyle: mapType === 'satellite' ? 'amap://styles/satellite' : 
                 mapType === 'hybrid' ? 'amap://styles/hybrid' : 'amap://styles/normal',
        viewMode: '2D',
        lang: 'zh_cn',
        features: ['bg', 'point', 'road', 'building'],
        expandZoomRange: true,
        zooms: [3, 20],
      });

      // 添加地图控件
      mapInstance.addControl(new window.AMap.Scale());
      mapInstance.addControl(new window.AMap.ToolBar({
        position: 'RB'
      }));

      // 监听地图事件
      mapInstance.on('moveend', () => {
        const newCenter = mapInstance.getCenter();
        setCenter({
          latitude: newCenter.lat,
          longitude: newCenter.lng,
        });
      });

      mapInstance.on('zoomend', () => {
        setZoom(mapInstance.getZoom());
      });

      mapInstanceRef.current = mapInstance;
      setIsMapLoaded(true);
      
      if (onMapReady) {
        onMapReady(mapInstance);
      }
    } catch (error) {
      console.error('地图初始化失败:', error);
      setError(error instanceof Error ? error.message : '地图初始化失败');
    }
  };

  // 更新地图中心点
  useEffect(() => {
    if (mapInstanceRef.current && isMapLoaded) {
      mapInstanceRef.current.setCenter([center.longitude, center.latitude]);
    }
  }, [center, isMapLoaded]);

  // 更新地图缩放级别
  useEffect(() => {
    if (mapInstanceRef.current && isMapLoaded) {
      mapInstanceRef.current.setZoom(zoom);
    }
  }, [zoom, isMapLoaded]);

  // 更新地图类型
  useEffect(() => {
    if (mapInstanceRef.current && isMapLoaded) {
      const style = mapType === 'satellite' ? 'amap://styles/satellite' : 
                   mapType === 'hybrid' ? 'amap://styles/hybrid' : 'amap://styles/normal';
      mapInstanceRef.current.setMapStyle(style);
    }
  }, [mapType, isMapLoaded]);

  // 组件挂载时初始化地图
  useEffect(() => {
    initMap();
    
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
      }
    };
  }, []);

  return (
    <div 
      ref={mapRef} 
      className={`w-full h-full min-h-[400px] ${className}`}
      style={{ 
        background: '#f0f2f5',
        borderRadius: '8px',
        overflow: 'hidden'
      }}
    >
      {!isMapLoaded && (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-gray-500">正在加载地图...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AMapContainer;