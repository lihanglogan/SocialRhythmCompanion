'use client';

import { useState, useEffect } from 'react';
import { Place, CrowdLevel } from '@/types';
import { Users, Clock, TrendingUp, AlertCircle, Zap, Calendar } from 'lucide-react';

interface PlaceStatsProps {
  place: Place;
}

interface RealTimeStats {
  currentQueue: number;
  estimatedWait: number;
  peakHours: string[];
  todayVisitors: number;
  avgWaitTime: number;
  lastUpdated: Date;
}

export default function PlaceStats({ place }: PlaceStatsProps) {
  const [stats, setStats] = useState<RealTimeStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟实时数据获取
    const generateStats = () => {
      const currentHour = new Date().getHours();
      const peakHours = ['09:00-11:00', '14:00-16:00'];
      
      return {
        currentQueue: place.currentStatus.queueLength,
        estimatedWait: place.currentStatus.estimatedWaitTime,
        peakHours,
        todayVisitors: Math.floor(Math.random() * 500) + 200,
        avgWaitTime: Math.floor(Math.random() * 15) + 5,
        lastUpdated: new Date()
      };
    };

    setStats(generateStats());
    setLoading(false);

    // 模拟实时更新
    const interval = setInterval(() => {
      setStats(generateStats());
    }, 30000); // 每30秒更新一次

    return () => clearInterval(interval);
  }, [place]);

  if (loading || !stats) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getCrowdLevelColor = (level: CrowdLevel) => {
    switch (level) {
      case CrowdLevel.LOW: return 'text-green-600 bg-green-50 border-green-200';
      case CrowdLevel.MEDIUM: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case CrowdLevel.HIGH: return 'text-orange-600 bg-orange-50 border-orange-200';
      case CrowdLevel.VERY_HIGH: return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getWaitTimeColor = (minutes: number) => {
    if (minutes <= 5) return 'text-green-600 bg-green-50 border-green-200';
    if (minutes <= 15) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (minutes <= 30) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">实时数据</h2>
        <div className="flex items-center text-sm text-gray-500">
          <Zap className="w-4 h-4 mr-1 text-green-500" />
          <span>最后更新: {stats.lastUpdated.toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 当前排队人数 */}
        <div className={`p-4 rounded-lg border-2 ${getCrowdLevelColor(place.crowdLevel)}`}>
          <div className="flex items-center justify-between mb-2">
            <Users className="w-6 h-6" />
            <span className="text-2xl font-bold">{stats.currentQueue}</span>
          </div>
          <div className="text-sm font-medium">当前排队人数</div>
          <div className="text-xs mt-1 opacity-75">
            较昨日同时段 {Math.random() > 0.5 ? '+' : '-'}{Math.floor(Math.random() * 20)}%
          </div>
        </div>

        {/* 预计等待时间 */}
        <div className={`p-4 rounded-lg border-2 ${getWaitTimeColor(stats.estimatedWait)}`}>
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-6 h-6" />
            <span className="text-2xl font-bold">{stats.estimatedWait}</span>
          </div>
          <div className="text-sm font-medium">预计等待时间(分钟)</div>
          <div className="text-xs mt-1 opacity-75">
            平均等待: {stats.avgWaitTime} 分钟
          </div>
        </div>

        {/* 今日访客数 */}
        <div className="p-4 rounded-lg border-2 bg-blue-50 border-blue-200 text-blue-600">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-6 h-6" />
            <span className="text-2xl font-bold">{stats.todayVisitors}</span>
          </div>
          <div className="text-sm font-medium">今日访客数</div>
          <div className="text-xs mt-1 opacity-75">
            预计今日总量: {Math.floor(stats.todayVisitors * 1.5)}
          </div>
        </div>
      </div>

      {/* 高峰时段提醒 */}
      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-amber-800">高峰时段提醒</h3>
            <p className="text-sm text-amber-700 mt-1">
              今日高峰时段: {stats.peakHours.join(', ')}，建议避开这些时间段前往。
            </p>
          </div>
        </div>
      </div>

      {/* 营业时间 */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2 mb-3">
          <Calendar className="w-5 h-5 text-gray-600" />
          <h3 className="font-medium text-gray-900">营业时间</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="flex justify-between py-1">
              <span className="text-gray-600">周一至周五</span>
              <span className="font-medium">
                {place.openHours.monday[0]?.open || '09:00'} - {place.openHours.monday[0]?.close || '18:00'}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-600">周六</span>
              <span className="font-medium">
                {place.openHours.saturday[0]?.open || '09:00'} - {place.openHours.saturday[0]?.close || '17:00'}
              </span>
            </div>
          </div>
          <div>
            <div className="flex justify-between py-1">
              <span className="text-gray-600">周日</span>
              <span className="font-medium">
                {place.openHours.sunday[0]?.open || '10:00'} - {place.openHours.sunday[0]?.close || '16:00'}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-600">节假日</span>
              <span className="font-medium text-orange-600">可能调整</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}