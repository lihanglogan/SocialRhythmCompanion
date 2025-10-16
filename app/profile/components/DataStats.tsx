'use client';

import { useEffect, useState } from 'react';
import { useProfileStore } from '@/lib/stores/profileStore';
import { cn } from '@/lib/utils';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MapPin, 
  Clock, 
  Target,
  Award,
  Activity,
  Calendar,
  Star
} from 'lucide-react';

export function DataStats() {
  const { userStats, isLoading } = useProfileStore();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  // 模拟图表数据
  const [chartData, setChartData] = useState({
    reports: [12, 19, 15, 25, 22, 30, 28],
    matches: [3, 5, 2, 8, 6, 4, 7],
    visits: [45, 52, 38, 67, 59, 43, 61]
  });

  const periods = [
    { key: 'week' as const, label: '本周', days: 7 },
    { key: 'month' as const, label: '本月', days: 30 },
    { key: 'year' as const, label: '本年', days: 365 }
  ];

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 时间段选择 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <BarChart3 className="h-5 w-5 mr-2" />
          数据统计
        </h3>
        
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {periods.map(period => (
            <button
              key={period.key}
              onClick={() => setSelectedPeriod(period.key)}
              className={cn(
                "px-3 py-1 text-sm font-medium rounded-md transition-colors",
                selectedPeriod === period.key
                  ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* 核心指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 信誉分数 */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">信誉分数</p>
              <p className="text-3xl font-bold">{userStats?.reputationScore || 0}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span className="text-sm">+12 本月</span>
              </div>
            </div>
            <div className="bg-blue-400/30 rounded-full p-3">
              <Star className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* 总上报数 */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">总上报数</p>
              <p className="text-3xl font-bold">{userStats?.totalReports || 0}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span className="text-sm">+{chartData.reports.reduce((a, b) => a + b, 0)} {selectedPeriod === 'week' ? '本周' : selectedPeriod === 'month' ? '本月' : '本年'}</span>
              </div>
            </div>
            <div className="bg-green-400/30 rounded-full p-3">
              <MapPin className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* 匹配成功 */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">匹配成功</p>
              <p className="text-3xl font-bold">{userStats?.totalMatches || 0}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span className="text-sm">+{chartData.matches.reduce((a, b) => a + b, 0)} {selectedPeriod === 'week' ? '本周' : selectedPeriod === 'month' ? '本月' : '本年'}</span>
              </div>
            </div>
            <div className="bg-purple-400/30 rounded-full p-3">
              <Users className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* 活跃天数 */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">活跃天数</p>
              <p className="text-3xl font-bold">{userStats?.activeDays || 0}</p>
              <div className="flex items-center mt-2">
                <Calendar className="h-4 w-4 mr-1" />
                <span className="text-sm">连续 {Math.floor(Math.random() * 10) + 5} 天</span>
              </div>
            </div>
            <div className="bg-orange-400/30 rounded-full p-3">
              <Activity className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* 趋势图表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 上报趋势 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900 dark:text-white">上报趋势</h4>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {selectedPeriod === 'week' ? '最近7天' : selectedPeriod === 'month' ? '最近30天' : '最近12个月'}
            </div>
          </div>
          
          <div className="space-y-3">
            {chartData.reports.map((value, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-8 text-sm text-gray-600 dark:text-gray-400">
                  {selectedPeriod === 'week' ? `${index + 1}日` : 
                   selectedPeriod === 'month' ? `${index + 1}周` : 
                   `${index + 1}月`}
                </div>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(value / Math.max(...chartData.reports)) * 100}%` }}
                  />
                </div>
                <div className="w-8 text-sm font-medium text-gray-900 dark:text-white">
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 匹配趋势 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900 dark:text-white">匹配趋势</h4>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              成功率 85%
            </div>
          </div>
          
          <div className="space-y-3">
            {chartData.matches.map((value, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-8 text-sm text-gray-600 dark:text-gray-400">
                  {selectedPeriod === 'week' ? `${index + 1}日` : 
                   selectedPeriod === 'month' ? `${index + 1}周` : 
                   `${index + 1}月`}
                </div>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(value / Math.max(...chartData.matches)) * 100}%` }}
                  />
                </div>
                <div className="w-8 text-sm font-medium text-gray-900 dark:text-white">
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 详细统计 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-6">详细统计</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 最常访问的场所类型 */}
          <div>
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              最常访问场所
            </h5>
            <div className="space-y-2">
              {[
                { name: '咖啡厅', count: 45, color: 'bg-blue-500' },
                { name: '图书馆', count: 32, color: 'bg-green-500' },
                { name: '公园', count: 28, color: 'bg-yellow-500' },
                { name: '商场', count: 21, color: 'bg-purple-500' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={cn("w-3 h-3 rounded-full", item.color)} />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 活跃时段 */}
          <div>
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              活跃时段
            </h5>
            <div className="space-y-2">
              {[
                { time: '上午 9-12点', activity: 85 },
                { time: '下午 2-5点', activity: 92 },
                { time: '晚上 7-10点', activity: 78 },
                { time: '其他时间', activity: 35 }
              ].map((item, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{item.time}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{item.activity}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div 
                      className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${item.activity}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 社交表现 */}
          <div>
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              社交表现
            </h5>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">匹配成功率</span>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">85%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">平均评分</span>
                <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">4.8/5.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">好友数量</span>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">127</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">社区排名</span>
                <span className="text-sm font-medium text-purple-600 dark:text-purple-400">#{userStats?.communityRank || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 成就进度 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <Award className="h-5 w-5 mr-2" />
          成就进度
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { 
              name: '社交达人', 
              description: '完成100次成功匹配', 
              progress: userStats?.totalMatches || 0, 
              target: 100,
              icon: Users,
              color: 'text-blue-500'
            },
            { 
              name: '数据贡献者', 
              description: '上报1000条场所信息', 
              progress: userStats?.totalReports || 0, 
              target: 1000,
              icon: MapPin,
              color: 'text-green-500'
            },
            { 
              name: '活跃用户', 
              description: '连续活跃365天', 
              progress: userStats?.activeDays || 0, 
              target: 365,
              icon: Calendar,
              color: 'text-orange-500'
            },
            { 
              name: '信誉专家', 
              description: '信誉分数达到1000分', 
              progress: userStats?.reputationScore || 0, 
              target: 1000,
              icon: Star,
              color: 'text-purple-500'
            }
          ].map((achievement, index) => {
            const Icon = achievement.icon;
            const progressPercentage = Math.min((achievement.progress / achievement.target) * 100, 100);
            
            return (
              <div key={index} className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className={cn("p-2 rounded-lg bg-gray-100 dark:bg-gray-700", achievement.color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h6 className="font-medium text-gray-900 dark:text-white">{achievement.name}</h6>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{achievement.description}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {achievement.progress}/{achievement.target}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {Math.round(progressPercentage)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={cn("h-2 rounded-full transition-all duration-500", {
                        'bg-blue-500': achievement.color === 'text-blue-500',
                        'bg-green-500': achievement.color === 'text-green-500',
                        'bg-orange-500': achievement.color === 'text-orange-500',
                        'bg-purple-500': achievement.color === 'text-purple-500'
                      })}
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}