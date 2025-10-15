'use client';

import React, { useState } from 'react';
import { useSuggestionStore } from '@/lib/stores/suggestionStore';
import { History, Calendar, MapPin, Clock, ThumbsUp, ThumbsDown, Filter, Search } from 'lucide-react';

export function SuggestionHistory() {
  const { suggestionHistory, isLoading } = useSuggestionStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'accepted' | 'rejected' | 'viewed'>('all');
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'all'>('month');

  // 过滤建议历史
  const filteredHistory = suggestionHistory?.filter(item => {
    const matchesSearch = item.placeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || 
                       (filterType === 'accepted' && item.userAction === 'accepted') ||
                       (filterType === 'rejected' && item.userAction === 'rejected') ||
                       (filterType === 'viewed' && item.userAction === 'viewed');

    const now = new Date();
    const itemDate = new Date(item.timestamp);
    const daysDiff = Math.floor((now.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const matchesTime = timeFilter === 'all' ||
                       (timeFilter === 'week' && daysDiff <= 7) ||
                       (timeFilter === 'month' && daysDiff <= 30);

    return matchesSearch && matchesType && matchesTime;
  }) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">加载建议历史...</p>
        </div>
      </div>
    );
  }

  if (!suggestionHistory || suggestionHistory.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <History className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">暂无建议历史</h3>
        <p className="text-gray-500">
          您还没有任何建议记录，开始使用智能建议功能吧！
        </p>
      </div>
    );
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'accepted':
        return <ThumbsUp className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <ThumbsDown className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getActionText = (action: string) => {
    switch (action) {
      case 'accepted':
        return '已采纳';
      case 'rejected':
        return '已拒绝';
      default:
        return '已查看';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* 头部信息 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">建议历史</h2>
          <p className="text-sm text-gray-500 mt-1">
            查看您的智能建议使用记录
          </p>
        </div>
      </div>

      {/* 统计概览 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <History className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-900">总建议数</p>
              <p className="text-2xl font-semibold text-blue-600">
                {suggestionHistory.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <ThumbsUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-900">已采纳</p>
              <p className="text-2xl font-semibold text-green-600">
                {suggestionHistory.filter(item => item.userAction === 'accepted').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <ThumbsDown className="w-5 h-5 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-900">已拒绝</p>
              <p className="text-2xl font-semibold text-red-600">
                {suggestionHistory.filter(item => item.userAction === 'rejected').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-purple-900">本月建议</p>
              <p className="text-2xl font-semibold text-purple-600">
                {suggestionHistory.filter(item => {
                  const now = new Date();
                  const itemDate = new Date(item.timestamp);
                  return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 筛选和搜索 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* 搜索 */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="搜索场所名称或类别..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 类型筛选 */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部状态</option>
              <option value="accepted">已采纳</option>
              <option value="rejected">已拒绝</option>
              <option value="viewed">仅查看</option>
            </select>
          </div>

          {/* 时间筛选 */}
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="week">最近一周</option>
              <option value="month">最近一月</option>
              <option value="all">全部时间</option>
            </select>
          </div>
        </div>
      </div>

      {/* 建议历史列表 */}
      <div className="space-y-4">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">没有找到符合条件的建议记录</p>
          </div>
        ) : (
          filteredHistory.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 mr-3">
                      {item.placeName}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(item.userAction)}`}>
                      {getActionText(item.userAction)}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="mr-4">{item.category}</span>
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{new Date(item.timestamp).toLocaleString('zh-CN')}</span>
                  </div>

                  <p className="text-sm text-gray-700 mb-3">
                    {item.reason || '智能推荐场所'}
                  </p>

                  {/* 建议详情 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">建议类型:</span>
                      <span className="ml-1 font-medium">{item.suggestionType}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">评分:</span>
                      <span className="ml-1 font-medium">{item.score?.toFixed(1) || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">拥挤度:</span>
                      <span className="ml-1 font-medium">{item.crowdLevel || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">距离:</span>
                      <span className="ml-1 font-medium">
                        {item.distance ? `${item.distance.toFixed(1)}km` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="ml-4 flex items-center">
                  {getActionIcon(item.userAction)}
                </div>
              </div>

              {/* 用户反馈 */}
              {item.userFeedback && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">用户反馈:</span> {item.userFeedback}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 分页 */}
      {filteredHistory.length > 10 && (
        <div className="flex justify-center">
          <div className="flex items-center space-x-2">
            <button className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              上一页
            </button>
            <span className="px-3 py-2 text-sm text-gray-600">
              第 1 页，共 {Math.ceil(filteredHistory.length / 10)} 页
            </span>
            <button className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              下一页
            </button>
          </div>
        </div>
      )}

      {/* 说明信息 */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <History className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-gray-900">建议历史说明</h4>
            <p className="text-sm text-gray-600 mt-1">
              系统会记录您对智能建议的所有操作，包括查看、采纳和拒绝。
              这些数据将帮助系统不断学习和优化，为您提供更准确的个性化建议。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}