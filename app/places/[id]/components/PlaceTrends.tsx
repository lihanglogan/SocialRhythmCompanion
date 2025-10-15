'use client';

import { useState, useEffect } from 'react';
import { Place, CrowdLevel } from '@/types';
import { BarChart3, TrendingUp, Clock, Calendar, Activity } from 'lucide-react';

interface PlaceTrendsProps {
  place: Place;
}

interface TrendData {
  time: string;
  crowdLevel: number;
  waitTime: number;
  hour: number;
}

interface WeeklyData {
  day: string;
  avgCrowdLevel: number;
  avgWaitTime: number;
  peakHour: string;
}

export default function PlaceTrends({ place }: PlaceTrendsProps) {
  const [activeTab, setActiveTab] = useState<'24h' | 'week'>('24h');
  const [todayTrends, setTodayTrends] = useState<TrendData[]>([]);
  const [weeklyTrends, setWeeklyTrends] = useState<WeeklyData[]>([]);

  useEffect(() => {
    // 生成24小时趋势数据
    const generate24HourTrends = () => {
      const trends: TrendData[] = [];
      for (let hour = 0; hour < 24; hour++) {
        let crowdLevel = 1; // 默认低
        let waitTime = 2;

        // 根据场所类型和时间生成趋势
        switch (place.category) {
          case 'restaurant':
            if (hour >= 7 && hour <= 9) { crowdLevel = 2; waitTime = 8; }
            else if (hour >= 11 && hour <= 13) { crowdLevel = 4; waitTime = 25; }
            else if (hour >= 17 && hour <= 19) { crowdLevel = 3; waitTime = 15; }
            break;
          case 'bank':
          case 'government':
            if (hour >= 9 && hour <= 11) { crowdLevel = 3; waitTime = 20; }
            else if (hour >= 14 && hour <= 16) { crowdLevel = 2; waitTime = 12; }
            else if (hour < 9 || hour > 17) { crowdLevel = 0; waitTime = 0; }
            break;
          case 'hospital':
            if (hour >= 8 && hour <= 11) { crowdLevel = 3; waitTime = 30; }
            else if (hour >= 14 && hour <= 16) { crowdLevel = 2; waitTime = 15; }
            break;
          default:
            crowdLevel = Math.floor(Math.random() * 3) + 1;
            waitTime = Math.floor(Math.random() * 15) + 2;
        }

        trends.push({
          time: `${hour.toString().padStart(2, '0')}:00`,
          crowdLevel,
          waitTime,
          hour
        });
      }
      return trends;
    };

    // 生成一周趋势数据
    const generateWeeklyTrends = () => {
      const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
      return days.map(day => ({
        day,
        avgCrowdLevel: Math.floor(Math.random() * 3) + 1,
        avgWaitTime: Math.floor(Math.random() * 20) + 5,
        peakHour: `${Math.floor(Math.random() * 8) + 9}:00`
      }));
    };

    setTodayTrends(generate24HourTrends());
    setWeeklyTrends(generateWeeklyTrends());
  }, [place]);

  const getCrowdLevelColor = (level: number) => {
    if (level === 0) return 'bg-gray-200';
    if (level === 1) return 'bg-green-400';
    if (level === 2) return 'bg-yellow-400';
    if (level === 3) return 'bg-orange-400';
    return 'bg-red-400';
  };

  const getCrowdLevelText = (level: number) => {
    if (level === 0) return '关闭';
    if (level === 1) return '人少';
    if (level === 2) return '适中';
    if (level === 3) return '较多';
    return '拥挤';
  };

  const currentHour = new Date().getHours();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <BarChart3 className="w-6 h-6 mr-2 text-primary-600" />
          拥挤度趋势
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('24h')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === '24h'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            今日24小时
          </button>
          <button
            onClick={() => setActiveTab('week')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'week'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            本周趋势
          </button>
        </div>
      </div>

      {activeTab === '24h' ? (
        <div>
          {/* 24小时趋势图 */}
          <div className="mb-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">拥挤度</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">等待时间</span>
              </div>
            </div>
            
            <div className="grid grid-cols-12 gap-1 mb-4">
              {todayTrends.map((trend, index) => (
                <div key={index} className="text-center">
                  <div className="relative h-20 bg-gray-100 rounded mb-2">
                    {/* 拥挤度柱状图 */}
                    <div
                      className={`absolute bottom-0 left-0 w-full rounded ${getCrowdLevelColor(trend.crowdLevel)} ${
                        trend.hour === currentHour ? 'ring-2 ring-primary-500' : ''
                      }`}
                      style={{ height: `${(trend.crowdLevel / 4) * 100}%` }}
                    ></div>
                    {/* 当前时间标记 */}
                    {trend.hour === currentHour && (
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                        <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">{trend.time.slice(0, 2)}</div>
                </div>
              ))}
            </div>

            {/* 等待时间折线图 */}
            <div className="relative h-16 bg-gray-50 rounded-lg mb-4 overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <polyline
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="2"
                  points={todayTrends.map((trend, index) => 
                    `${(index / (todayTrends.length - 1)) * 100},${100 - (trend.waitTime / 50) * 100}`
                  ).join(' ')}
                />
              </svg>
              <div className="absolute top-2 right-2 text-xs text-blue-600 bg-white px-2 py-1 rounded">
                等待时间(分钟)
              </div>
            </div>

            {/* 图例 */}
            <div className="flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded"></div>
                <span>人少</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-400 rounded"></div>
                <span>适中</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-400 rounded"></div>
                <span>较多</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-400 rounded"></div>
                <span>拥挤</span>
              </div>
            </div>
          </div>

          {/* 最佳访问时间推荐 */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-green-800">最佳访问时间</h3>
                <p className="text-sm text-green-700 mt-1">
                  根据历史数据分析，建议在 
                  {todayTrends
                    .filter(t => t.crowdLevel <= 1)
                    .slice(0, 3)
                    .map(t => t.time)
                    .join('、')} 
                  前往，人流较少，等待时间短。
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          {/* 一周趋势 */}
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-6">
            {weeklyTrends.map((dayData, index) => (
              <div key={index} className="text-center">
                <div className="bg-gray-100 rounded-lg p-4 mb-2">
                  <div className={`h-16 rounded mb-2 ${getCrowdLevelColor(dayData.avgCrowdLevel)}`}></div>
                  <div className="text-xs text-gray-600">
                    {getCrowdLevelText(dayData.avgCrowdLevel)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {dayData.avgWaitTime}min
                  </div>
                </div>
                <div className="text-sm font-medium">{dayData.day}</div>
                <div className="text-xs text-gray-500">峰值: {dayData.peakHour}</div>
              </div>
            ))}
          </div>

          {/* 一周统计 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">
                {Math.min(...weeklyTrends.map(d => d.avgWaitTime))}min
              </div>
              <div className="text-sm text-blue-700">本周最短等待</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">
                {weeklyTrends.filter(d => d.avgCrowdLevel <= 2).length}天
              </div>
              <div className="text-sm text-green-700">人流适中天数</div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
              <Activity className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-600">
                {weeklyTrends.find(d => d.avgCrowdLevel === Math.max(...weeklyTrends.map(d => d.avgCrowdLevel)))?.day}
              </div>
              <div className="text-sm text-orange-700">最繁忙日期</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}