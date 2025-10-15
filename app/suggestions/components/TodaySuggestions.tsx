'use client';

import React from 'react';
import { useSuggestionStore } from '@/lib/stores/suggestionStore';
import { SuggestionCard } from './SuggestionCard';
import { Clock, MapPin, Users, Star, RefreshCw } from 'lucide-react';

export function TodaySuggestions() {
  const { 
    todaySuggestions, 
    isGeneratingSuggestions, 
    generateTodaySuggestions 
  } = useSuggestionStore();

  const handleRefresh = () => {
    // 重新生成今日建议
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          // 这里需要用户信息，暂时使用模拟数据
          const mockUser = {
            id: 'user1',
            name: '用户',
            preferences: {
              preferredCrowdLevel: 'medium' as const,
              maxWaitTime: 30,
              accessibilityNeeds: [],
              preferredTimeSlots: ['morning', 'afternoon'],
              avoidNoiseLevel: 'medium' as const
            }
          };
          generateTodaySuggestions(mockUser, location);
        }
      );
    }
  };

  if (isGeneratingSuggestions) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">正在生成今日建议...</p>
        </div>
      </div>
    );
  }

  if (!todaySuggestions || todaySuggestions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Clock className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">暂无今日建议</h3>
        <p className="text-gray-500 mb-6">
          系统正在分析您的偏好和当前情况，为您生成个性化建议
        </p>
        <button
          onClick={handleRefresh}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          生成建议
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 头部信息 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">今日建议</h2>
          <p className="text-sm text-gray-500 mt-1">
            基于当前时间、位置和您的偏好生成的智能建议
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isGeneratingSuggestions}
          className="inline-flex items-center px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isGeneratingSuggestions ? 'animate-spin' : ''}`} />
          刷新
        </button>
      </div>

      {/* 建议统计 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Star className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-900">推荐场所</p>
              <p className="text-2xl font-semibold text-blue-600">
                {todaySuggestions.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-900">最佳时段</p>
              <p className="text-lg font-semibold text-green-600">
                {todaySuggestions[0]?.bestTime || '现在'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-purple-900">平均拥挤度</p>
              <p className="text-lg font-semibold text-purple-600">
                {Math.round(
                  todaySuggestions.reduce((sum, s) => sum + (s.crowdLevel || 0), 0) / 
                  todaySuggestions.length * 100
                )}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 建议列表 */}
      <div className="space-y-4">
        {todaySuggestions.map((suggestion, index) => (
          <SuggestionCard
            key={suggestion.id || index}
            suggestion={suggestion}
            rank={index + 1}
            showActions={true}
          />
        ))}
      </div>

      {/* 底部提示 */}
      <div className="bg-gray-50 rounded-lg p-4 mt-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <MapPin className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-gray-900">智能建议说明</h4>
            <p className="text-sm text-gray-600 mt-1">
              建议基于实时数据、历史模式和您的个人偏好生成。建议会根据时间变化自动更新，
              您也可以手动刷新获取最新建议。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}