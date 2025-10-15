'use client';

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  MapPin, 
  Users, 
  Star, 
  MessageCircle, 
  Calendar,
  Filter,
  Search,
  ChevronDown,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useMatchStore } from '@/lib/stores/matchStore';
import { CompanionMatch, MatchStatus } from '@/types';

type FilterStatus = 'all' | MatchStatus;
type SortOption = 'recent' | 'oldest' | 'rating';

export default function MatchHistory() {
  const { matchHistory, fetchMatchHistory } = useMatchStore();
  const [filteredHistory, setFilteredHistory] = useState<CompanionMatch[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [isLoading, setIsLoading] = useState(true);

  // 获取匹配历史
  useEffect(() => {
    const loadHistory = async () => {
      setIsLoading(true);
      await fetchMatchHistory();
      setIsLoading(false);
    };
    loadHistory();
  }, [fetchMatchHistory]);

  // 过滤和排序
  useEffect(() => {
    let filtered = [...matchHistory];

    // 搜索过滤
    if (searchQuery) {
      filtered = filtered.filter(match => 
        match.place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        match.users.some(user => user.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // 状态过滤
    if (statusFilter !== 'all') {
      filtered = filtered.filter(match => match.status === statusFilter);
    }

    // 排序
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'rating':
          // 假设有评分字段，这里用创建时间代替
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    setFilteredHistory(filtered);
  }, [matchHistory, searchQuery, statusFilter, sortBy]);

  // 获取状态图标
  const getStatusIcon = (status: MatchStatus) => {
    switch (status) {
      case MatchStatus.COMPLETED:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case MatchStatus.CANCELLED:
        return <XCircle className="w-5 h-5 text-red-500" />;
      case MatchStatus.EXPIRED:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case MatchStatus.ACTIVE:
        return <Clock className="w-5 h-5 text-blue-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  // 获取状态文本
  const getStatusText = (status: MatchStatus) => {
    switch (status) {
      case MatchStatus.PENDING:
        return '等待中';
      case MatchStatus.MATCHED:
        return '已匹配';
      case MatchStatus.ACTIVE:
        return '进行中';
      case MatchStatus.COMPLETED:
        return '已完成';
      case MatchStatus.CANCELLED:
        return '已取消';
      case MatchStatus.EXPIRED:
        return '已过期';
      default:
        return '未知';
    }
  };

  // 获取状态颜色
  const getStatusColor = (status: MatchStatus) => {
    switch (status) {
      case MatchStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case MatchStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      case MatchStatus.EXPIRED:
        return 'bg-yellow-100 text-yellow-800';
      case MatchStatus.ACTIVE:
        return 'bg-blue-100 text-blue-800';
      case MatchStatus.MATCHED:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 格式化时间
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">加载匹配历史...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 头部和控制区 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Clock className="w-6 h-6 mr-2 text-blue-500" />
            匹配历史
          </h2>
          <div className="text-sm text-gray-500">
            共 {matchHistory.length} 条记录
          </div>
        </div>

        {/* 搜索和过滤 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索地点或用户..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* 状态过滤 */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">全部状态</option>
              <option value={MatchStatus.COMPLETED}>已完成</option>
              <option value={MatchStatus.ACTIVE}>进行中</option>
              <option value={MatchStatus.CANCELLED}>已取消</option>
              <option value={MatchStatus.EXPIRED}>已过期</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* 排序选择 */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="recent">最近的</option>
              <option value="oldest">最早的</option>
              <option value="rating">评分</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 历史记录列表 */}
      <div className="space-y-4">
        {filteredHistory.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无匹配历史</h3>
            <p className="text-gray-500">
              {searchQuery || statusFilter !== 'all' 
                ? '没有找到符合条件的记录' 
                : '开始您的第一次匹配吧！'
              }
            </p>
          </div>
        ) : (
          filteredHistory.map((match) => (
            <div key={match.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* 基本信息 */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center">
                        {getStatusIcon(match.status)}
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(match.status)}`}>
                          {getStatusText(match.status)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      {formatDate(match.scheduledTime)}
                    </div>
                  </div>

                  {/* 地点信息 */}
                  <div className="flex items-center mb-3">
                    <MapPin className="w-5 h-5 text-gray-400 mr-2" />
                    <div>
                      <div className="font-medium text-gray-900">{match.place.name}</div>
                      <div className="text-sm text-gray-500">{match.place.address}</div>
                    </div>
                  </div>

                  {/* 参与者 */}
                  <div className="flex items-center mb-4">
                    <Users className="w-5 h-5 text-gray-400 mr-2" />
                    <div className="flex items-center space-x-2">
                      {match.users.map((user, index) => (
                        <div key={user.id} className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                            {user.name.charAt(0)}
                          </div>
                          <span className="ml-2 text-sm text-gray-700">{user.name}</span>
                          {index < match.users.length - 1 && (
                            <span className="mx-2 text-gray-400">·</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex items-center space-x-3">
                    {match.chatRoomId && (
                      <button className="flex items-center text-sm text-blue-600 hover:text-blue-700">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        查看聊天
                      </button>
                    )}
                    
                    {match.status === MatchStatus.COMPLETED && (
                      <button className="flex items-center text-sm text-yellow-600 hover:text-yellow-700">
                        <Star className="w-4 h-4 mr-1" />
                        评价
                      </button>
                    )}
                    
                    <button className="flex items-center text-sm text-gray-600 hover:text-gray-700">
                      <Calendar className="w-4 h-4 mr-1" />
                      查看详情
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 统计信息 */}
      {matchHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">统计概览</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {matchHistory.filter(m => m.status === MatchStatus.COMPLETED).length}
              </div>
              <div className="text-sm text-gray-500">已完成</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {matchHistory.filter(m => m.status === MatchStatus.ACTIVE).length}
              </div>
              <div className="text-sm text-gray-500">进行中</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {matchHistory.filter(m => m.status === MatchStatus.CANCELLED).length}
              </div>
              <div className="text-sm text-gray-500">已取消</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {matchHistory.length}
              </div>
              <div className="text-sm text-gray-500">总计</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}