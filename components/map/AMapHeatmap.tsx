'use client';

import React, { useEffect, useRef } from 'react';
import { useMapStore } from '@/lib/stores/mapStore';
import { HeatmapData, HeatmapType } from '@/types';

interface AMapHeatmapProps {
  map: any;
  data: HeatmapData[];
  type: HeatmapType;
  visible?: boolean;
  opacity?: number;
  radius?: number;
  gradient?: { [key: number]: string };
}

const AMapHeatmap: React.FC<AMapHeatmapProps> = ({
  map,
  data,
  type,
  visible = true,
  opacity = 0.6,
  radius = 25,
  gradient
}) => {
  const heatmapRef = useRef<any>(null);
  const { showHeatmap } = useMapStore();

  // 默认渐变色配置
  const defaultGradients = {
    [HeatmapType.CROWD]: {
      0.2: '#00ff00',
      0.4: '#ffff00', 
      0.6: '#ff8000',
      0.8: '#ff4000',
      1.0: '#ff0000'
    },
    [HeatmapType.WAIT_TIME]: {
      0.2: '#00ff80',
      0.4: '#80ff00',
      0.6: '#ffff00',
      0.8: '#ff8000',
      1.0: '#ff0000'
    },
    [HeatmapType.NOISE]: {
      0.2: '#0080ff',
      0.4: '#00ffff',
      0.6: '#80ff00',
      0.8: '#ffff00',
      1.0: '#ff8000'
    },
    [HeatmapType.TRAFFIC]: {
      0.2: '#008000',
      0.4: '#80ff00',
      0.6: '#ffff00',
      0.8: '#ff4000',
      1.0: '#800000'
    }
  };

  // 转换数据格式为高德地图热力图格式
  const formatHeatmapData = (rawData: HeatmapData[]) => {
    return rawData.map(item => ({
      lng: item.coordinates.lng,
      lat: item.coordinates.lat,
      count: Math.floor(item.intensity * 100) // 将0-1的强度转换为0-100
    }));
  };

  // 初始化热力图
  const initHeatmap = () => {
    if (!map || !window.AMap) return;

    try {
      // 创建热力图实例
      const heatmap = new window.AMap.HeatMap(map, {
        radius: radius,
        opacity: [0, opacity],
        gradient: gradient || defaultGradients[type],
        zooms: [3, 20],
        visible: visible && showHeatmap
      });

      // 设置数据
      if (data && data.length > 0) {
        const formattedData = formatHeatmapData(data);
        heatmap.setDataSet({
          data: formattedData,
          max: 100
        });
      }

      heatmapRef.current = heatmap;
    } catch (error) {
      console.error('热力图初始化失败:', error);
    }
  };

  // 更新热力图数据
  const updateHeatmapData = () => {
    if (!heatmapRef.current) return;

    try {
      const formattedData = formatHeatmapData(data);
      heatmapRef.current.setDataSet({
        data: formattedData,
        max: 100
      });
    } catch (error) {
      console.error('热力图数据更新失败:', error);
    }
  };

  // 更新热力图可见性
  const updateVisibility = () => {
    if (!heatmapRef.current) return;
    
    const isVisible = visible && showHeatmap;
    if (isVisible) {
      heatmapRef.current.show();
    } else {
      heatmapRef.current.hide();
    }
  };

  // 更新热力图样式
  const updateStyle = () => {
    if (!heatmapRef.current) return;

    try {
      heatmapRef.current.setOptions({
        radius: radius,
        opacity: [0, opacity],
        gradient: gradient || defaultGradients[type]
      });
    } catch (error) {
      console.error('热力图样式更新失败:', error);
    }
  };

  // 初始化热力图
  useEffect(() => {
    if (map && window.AMap) {
      initHeatmap();
    }

    return () => {
      if (heatmapRef.current) {
        try {
          heatmapRef.current.setMap(null);
        } catch (error) {
          console.error('热力图清理失败:', error);
        }
      }
    };
  }, [map]);

  // 监听数据变化
  useEffect(() => {
    if (heatmapRef.current && data) {
      updateHeatmapData();
    }
  }, [data]);

  // 监听可见性变化
  useEffect(() => {
    if (heatmapRef.current) {
      updateVisibility();
    }
  }, [visible, showHeatmap]);

  // 监听样式变化
  useEffect(() => {
    if (heatmapRef.current) {
      updateStyle();
    }
  }, [opacity, radius, gradient, type]);

  // 热力图组件不需要渲染任何DOM元素
  return null;
};

export default AMapHeatmap;