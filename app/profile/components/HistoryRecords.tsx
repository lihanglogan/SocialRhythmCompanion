'use client';

import { useState, useEffect } from 'react';
import { useProfileStore } from '@/lib/stores/profileStore';
import { cn } from '@/lib/utils';
import { 
  Clock, 
  MapPin, 
  Users, 
  Calendar, 
  Filter,
  Search,
  ChevronDown,
  Eye,
  Star,
  MessageCircle,
  Navigation,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

type HistoryType = 'all' | 'visits' | 'reports' | 'matches' | 'suggestions';
type TimeRange = 'week' | 'month' | 'quarter' | 'year';

export function HistoryRecords() {
  const { userHistory, isLoading, loadUserHistory } = useProfileStore();
  const [activeFilter, setActiveFilter] = useState<HistoryType>('all');
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadUserHistory();
  }, [loadUserHistory]);

  const filterOptions = [
    { key: 'all' as const, label: '全部记录', icon: Clock, count: 156 },
    { key: 'visits' as const, label: '场所访问', icon: MapPin, count: 89 },
    { key: 'reports' as const, label: '数据上报', icon: Eye, count: 34 },
    { key: 'matches' as const, label: '匹配记录', icon: Users, count: 23 },
    { key: 'suggestions' as const, label: '建议反馈', icon: Star, count: 10 }
  ];

  const timeRangeOptions = [
    { key: 'week' as const, label: '最近一周' },
    { key: 'month' as const, label: '最近一月' },
    { key: 'quarter' as const, label: '最近三月' },
    { key: 'year' as const, label: '最近一年' }
  ];

  // 模拟历史记录数据
  const mockHistory = [
    {
      id: '1',
      type: 'visit' as const,
      title: '访问了三里屯太古里',
      description: '在咖啡厅停留了2小时，人流量中等',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      location: '三里屯太古里',
      status: 'completed' as const,
      details: {
        duration: '2小时',
        crowdLevel: 'medium' as const,
        rating: 4.5
      }
    },
    {
      id: '2',
      type: 'report' as const,
      title: '上报了朝阳公园人流数据',
      description: '实时上报人流量为低等，环境安静',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      location: '朝阳公园',
      status: 'approved' as const,
      details: {
        crowdLevel: 'low' as const,
        accuracy: 95,
        reward: 10
      }
    },
    {
      id: '3',
      type: 'match' as const,
      title: '与用户小王成功匹配',
      description: '在国家图书馆进行了学习交流',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      location: '国家图书馆',
      status: 'completed' as const,
      details: {
        matchScore: 0.92,
        duration: '3小时',
        rating: 5.0
      }
    },
    {
      id: '4',
      type: 'suggestion' as const,
      title: '接受了去王府井的建议',
      description: '系统推荐的购物建议，体验良好',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
      location: '王府井大街',
      status: 'accepted' as const,
      details: {
        suggestionScore: 0.88,
        feedback: 'positive' as const
      }
    },
    {
      id: '5',
      type: 'visit' as const,
      title: '访问了故宫博物院',
      description: '参观了2小时，人流量较高',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      location: '故宫博物院',
      status: 'completed' as const,
      details: {
        duration: '2小时',
        crowdLevel: 'high' as const,
        rating: 4.8
      }
    }
  ];

  const filteredHistory = mockHistory.filter(item => {
    if (activeFilter !== 'all' && !item.type.includes(activeFilter.slice(0, -1))) {
      return false;
    }
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !item.location.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'rejected':
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      completed: '已完成',
      approved: '已通过',
      accepted: '已接受',
      pending: '处理中',
      rejected: '已拒绝',
      cancelled: '已取消'
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'visit':
        return <MapPin className="h-5 w-5 text-blue-500" />;
      case 'report':
        return <Eye className="h-5 w-5 text-green-500" />;
      case 'match':
        return <Users className="h-5 w-5 text-purple-500" />;
      case 'suggestion':
        return <Star className="h-5 w-5 text-orange-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return '刚刚';
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return timestamp.toLocaleDateString('zh-CN');
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 搜索和筛选 */}
      <div className="space-y-4">
        {/* 搜索框 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索历史记录..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* 筛选选项 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            {filterOptions.map(option => {
              const Icon = option.icon;
              return (
                <button
                  key={option.key}
                  onClick={() => setActiveFilter(option.key)}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                    activeFilter === option.key
                      ? "bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{option.label}</span>
                  <span className={cn(
                    "px-1.5 py-0.5 text-xs rounded-full",
                    activeFilter === option.key
                      ? "bg-primary-200 text-primary-800 dark:bg-primary-800 dark:text-primary-200"
                      : "bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-400"
                  )}>
                    {option.count}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Filter className="h-4 w-4" />
            <span>筛选</span>
            <ChevronDown className={cn("h-4 w-4 transition-transform", showFilters && "rotate-180")} />
          </button>
        </div>

        {/* 高级筛选 */}
        {showFilters && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                时间范围
              </label>
              <div className="flex space-x-2">
                {timeRangeOptions.map(option => (
                  <button
                    key={option.key}
                    onClick={() => setTimeRange(option.key)}
                    className={cn(
                      "px-3 py-1.5 text-sm rounded-md transition-colors",
                      timeRange === option.key
                        ? "bg-primary-600 text-white"
                        : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 历史记录列表 */}
      <div className="space-y-3">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              暂无历史记录
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery ? '没有找到匹配的记录' : '开始使用应用来记录你的活动吧'}
            </p>
          </div>
        ) : (
          filteredHistory.map(item => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start space-x-4">
                {/* 类型图标 */}
                <div className="flex-shrink-0 mt-1">
                  {getTypeIcon(item.type)}
                </div>

                {/* 主要内容 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {item.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {item.description}
                      </p>
                      
                      {/* 位置和时间 */}
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{item.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatTime(item.timestamp)}</span>
                        </div>
                      </div>
                    </div>

                    {/* 状态 */}
                    <div className="flex items-center space-x-2 ml-4">
                      {getStatusIcon(item.status)}
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {getStatusText(item.status)}
                      </span>
                    </div>
                  </div>

                  {/* 详细信息 */}
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {item.type === 'visit' && item.details && (
                        <>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">停留时间:</span>
                            <span className="ml-1 font-medium text-gray-900 dark:text-white">
                              {item.details.duration}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">人流量:</span>
                            <span className={cn("ml-1 font-medium", {
                              'text-green-600': item.details.crowdLevel === 'low',
                              'text-yellow-600': item.details.crowdLevel === 'medium',
                              'text-red-600': item.details.crowdLevel === 'high'
                            })}>
                              {item.details.crowdLevel === 'low' ? '较少' : 
                               item.details.crowdLevel === 'medium' ? '中等' : '较多'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">评分:</span>
                            <span className="ml-1 font-medium text-gray-900 dark:text-white">
                              {item.details.rating}/5.0
                            </span>
                          </div>
                        </>
                      )}

                      {item.type === 'report' && item.details && (
                        <>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">准确度:</span>
                            <span className="ml-1 font-medium text-green-600">
                              {item.details.accuracy}%
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">奖励:</span>
                            <span className="ml-1 font-medium text-blue-600">
                              +{item.details.reward} 分
                            </span>
                          </div>
                        </>
                      )}

                      {item.type === 'match' && item.details && (
                        <>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">匹配度:</span>
                            <span className="ml-1 font-medium text-purple-600">
                              {Math.round(item.details.matchScore * 100)}%
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">时长:</span>
                            <span className="ml-1 font-medium text-gray-900 dark:text-white">
                              {item.details.duration}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">评分:</span>
                            <span className="ml-1 font-medium text-gray-900 dark:text-white">
                              {item.details.rating}/5.0
                            </span>
                          </div>
                        </>
                      )}

                      {item.type === 'suggestion' && item.details && (
                        <>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">推荐度:</span>
                            <span className="ml-1 font-medium text-orange-600">
                              {Math.round(item.details.suggestionScore * 100)}%
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">反馈:</span>
                            <span className={cn("ml-1 font-medium", {
                              'text-green-600': item.details.feedback === 'positive',
                              'text-red-600': item.details.feedback === 'negative',
                              'text-gray-600': item.details.feedback === 'neutral'
                            })}>
                              {item.details.feedback === 'positive' ? '满意' : 
                               item.details.feedback === 'negative' ? '不满意' : '一般'}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 加载更多 */}
      {filteredHistory.length > 0 && (
        <div className="text-center">
          <button className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            加载更多记录
          </button>
        </div>
      )}
    </div>
  );
}