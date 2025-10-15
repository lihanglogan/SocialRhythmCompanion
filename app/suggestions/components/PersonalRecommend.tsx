'use client';

import React from 'react';
import { useSuggestionStore } from '@/lib/stores/suggestionStore';
import { Heart, Star, MapPin, Clock, Users, RefreshCw } from 'lucide-react';

export function PersonalRecommend() {
  const { personalRecommendations, isLoading } = useSuggestionStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">加载个人推荐...</p>
        </div>
      </div>
    );
  }

  if (!personalRecommendations || personalRecommendations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Heart className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">暂无个人推荐</h3>
        <p className="text-gray-500 mb-6">
          系统正在学习您的偏好，稍后将为您生成个性化推荐
        </p>
        <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <RefreshCw className="w-4 h-4 mr-2" />
          生成推荐
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 头部信息 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">个人推荐</h2>
          <p className="text-sm text-gray-500 mt-1">
            基于您的历史行为和偏好生成的个性化推荐
          </p>
        </div>
        <button className="inline-flex items-center px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <RefreshCw className="w-4 h-4 mr-2" />
          刷新推荐
        </button>
      </div>

      {/* 推荐概览 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-pink-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-pink-100 rounded-lg">
              <Heart className="w-5 h-5 text-pink-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-pink-900">推荐场所</p>
              <p className="text-2xl font-semibold text-pink-600">
                {personalRecommendations.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-yellow-900">平均评分</p>
              <p className="text-2xl font-semibold text-yellow-600">
                {personalRecommendations.length > 0 
                  ? (personalRecommendations.reduce((sum, rec) => sum + (rec.score || 0), 0) / personalRecommendations.length).toFixed(1)
                  : '0'
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-900">推荐类型</p>
              <p className="text-lg font-semibold text-blue-600">
                {new Set(personalRecommendations.map(rec => rec.category)).size} 种
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 推荐列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {personalRecommendations.map((recommendation) => (
          <div key={recommendation.placeId} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {recommendation.placeName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {recommendation.category} • {recommendation.reason}
                  </p>
                </div>
                <div className="flex items-center ml-4">
                  <Star className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="text-sm font-medium text-gray-900">
                    {recommendation.score?.toFixed(1) || 'N/A'}
                  </span>
                </div>
              </div>

              {/* 推荐特点 */}
              <div className="flex flex-wrap gap-2 mb-4">
                {recommendation.tags?.slice(0, 3).map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                    {tag}
                  </span>
                ))}
              </div>

              {/* 详细信息 */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">匹配度</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {Math.round((recommendation.matchScore || 0) * 100)}%
                  </div>
                </div>
                
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">距离</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {recommendation.distance ? `${recommendation.distance.toFixed(1)}km` : 'N/A'}
                  </div>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex space-x-3">
                <button className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                  <Heart className="w-4 h-4 mr-2" />
                  感兴趣
                </button>
                <button className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                  <MapPin className="w-4 h-4 mr-2" />
                  查看详情
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 推荐说明 */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
              <Heart className="w-4 h-4 text-pink-600" />
            </div>
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-gray-900">个人推荐说明</h4>
            <p className="text-sm text-gray-600 mt-1">
              个人推荐基于您的历史访问记录、偏好设置、评分行为等数据，
              通过机器学习算法为您发现可能感兴趣的新场所。推荐会随着您的使用不断优化。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}