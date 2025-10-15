'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Shield, Clock, Users, Navigation, AlertTriangle } from 'lucide-react';
import { useMatchStore } from '@/lib/stores/matchStore';
import { LocationShare as LocationShareType, Coordinates } from '@/types';

interface LocationShareProps {
  matchId: string;
}

export default function LocationShare({ matchId }: LocationShareProps) {
  const { 
    locationSharing, 
    startLocationSharing, 
    stopLocationSharing, 
    updateLocation 
  } = useMatchStore();
  
  const [isSharing, setIsSharing] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);

  // 获取当前位置
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('此设备不支持位置服务');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: Coordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setCurrentLocation(coords);
        setLocationError(null);
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('位置权限被拒绝');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('位置信息不可用');
            break;
          case error.TIMEOUT:
            setLocationError('获取位置超时');
            break;
          default:
            setLocationError('获取位置时发生未知错误');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // 开始位置共享
  const handleStartSharing = async () => {
    try {
      await startLocationSharing(matchId);
      
      // 开始监听位置变化
      if (navigator.geolocation) {
        const id = navigator.geolocation.watchPosition(
          (position) => {
            const coords: Coordinates = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            setCurrentLocation(coords);
            updateLocation(coords);
          },
          (error) => {
            console.error('位置监听错误:', error);
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 30000
          }
        );
        setWatchId(id);
      }
      
      setIsSharing(true);
    } catch (error) {
      setLocationError('开始位置共享失败');
    }
  };

  // 停止位置共享
  const handleStopSharing = async () => {
    try {
      await stopLocationSharing(matchId);
      
      // 停止监听位置变化
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        setWatchId(null);
      }
      
      setIsSharing(false);
    } catch (error) {
      setLocationError('停止位置共享失败');
    }
  };

  // 计算距离
  const calculateDistance = (coord1: Coordinates, coord2: Coordinates): number => {
    const R = 6371; // 地球半径（公里）
    const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
    const dLng = (coord2.lng - coord1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // 格式化时间
  const formatTime = (date: Date): string => {
    return new Intl.DateTimeFormat('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  useEffect(() => {
    getCurrentLocation();
    
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  const activeShares = locationSharing.filter(share => 
    share.matchId === matchId && share.isActive
  );

  return (
    <div className="space-y-6">
      {/* 位置共享控制 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-blue-500" />
            位置共享
          </h3>
          
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Shield className="w-4 h-4" />
            <span>安全加密</span>
          </div>
        </div>

        {locationError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700">{locationError}</span>
          </div>
        )}

        <div className="space-y-4">
          {/* 当前位置状态 */}
          {currentLocation && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Navigation className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-sm font-medium text-gray-900">当前位置已获取</span>
                </div>
                <span className="text-xs text-gray-500">
                  {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                </span>
              </div>
            </div>
          )}

          {/* 共享控制按钮 */}
          <div className="flex space-x-3">
            {!isSharing ? (
              <button
                onClick={handleStartSharing}
                disabled={!currentLocation}
                className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <MapPin className="w-5 h-5 mr-2" />
                开始共享位置
              </button>
            ) : (
              <button
                onClick={handleStopSharing}
                className="flex-1 bg-red-500 text-white py-3 px-4 rounded-lg hover:bg-red-600 flex items-center justify-center"
              >
                <MapPin className="w-5 h-5 mr-2" />
                停止共享位置
              </button>
            )}
            
            <button
              onClick={getCurrentLocation}
              className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
            >
              <Navigation className="w-5 h-5" />
            </button>
          </div>

          {/* 共享状态提示 */}
          {isSharing && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-3"></div>
                <span className="text-blue-700 font-medium">正在共享位置...</span>
              </div>
              <p className="text-sm text-blue-600 mt-1">
                其他参与者可以看到您的实时位置
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 参与者位置列表 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-green-500" />
          参与者位置 ({activeShares.length})
        </h4>

        {activeShares.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>暂无参与者共享位置</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeShares.map((share) => (
              <div key={share.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white font-medium mr-3">
                    {share.userId.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {share.userId === 'current_user' ? '我' : `用户 ${share.userId}`}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      更新于 {formatTime(share.lastUpdated)}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  {currentLocation && (
                    <div className="text-sm font-medium text-gray-900">
                      {calculateDistance(currentLocation, share.coordinates).toFixed(1)} km
                    </div>
                  )}
                  <div className="text-xs text-gray-500">
                    精度: ±{share.accuracy}m
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 安全提示 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <Shield className="w-5 h-5 text-yellow-500 mr-2 mt-0.5" />
          <div className="text-sm">
            <div className="font-medium text-yellow-800 mb-1">安全提示</div>
            <ul className="text-yellow-700 space-y-1">
              <li>• 位置信息仅在匹配期间共享，结束后自动停止</li>
              <li>• 所有位置数据都经过端到端加密保护</li>
              <li>• 您可以随时停止位置共享</li>
              <li>• 建议在安全的公共场所见面</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}