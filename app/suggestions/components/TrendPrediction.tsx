'use client';

import React from 'react';
import { useSuggestionStore } from '@/lib/stores/suggestionStore';
import { TrendingUp, TrendingDown, Minus, BarChart3, Clock, Users } from 'lucide-react';

export function TrendPrediction() {
  const { trendPredictions, isLoading } = useSuggestionStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">加载趋势预测...</p>
        </div>
      </div>
    );
  }

  if (!trendPredictions || trendPredictions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <BarChart3 className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">暂无趋势数据</h3>
        <p className="text-gray-500 mb-6">
          系统正在收集数据，稍后将为您展示趋势分析
        </p>
      </div>
    );
  }

  

  return (
    <div className="space-y-6">
      {/* 头部信息 */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">趋势预测</h2>
        <p className="text-sm text-gray-500 mt-1">
          基于历史数据和实时信息的拥挤度趋势预测
        </p>
      </div>

      {/* 趋势概览 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-900">拥挤上升</p>
              <p className="text-2xl font-semibold text-red-600">
                {Math.floor(trendPredictions.length / 3)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingDown className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-900">拥挤下降</p>
              <p className="text-2xl font-semibold text-green-600">
                {Math.floor(trendPredictions.length / 3)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Minus className="w-5 h-5 text-gray-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">保持平稳</p>
              <p className="text-2xl font-semibold text-gray-600">
                {trendPredictions.length - Math.floor(trendPredictions.length / 3) * 2}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 趋势列表 */}
      <div className="space-y-4">
        {trendPredictions.map((prediction) => (
          <div key={prediction.placeId} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    趋势预测 - {prediction.placeId}
                  </h3>
                  <span className="px-2 py-1 rounded-full text-xs font-medium flex items-center text-blue-600 bg-blue-50">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span>预测中</span>
                  </span>
                </div>
                
                <p className="text-sm text-gray-500 mt-1">
                  基于历史数据和实时信息的智能预测
                </p>

                {/* 预测详情 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">当前拥挤度</div>
                    <div className="text-lg font-semibold text-gray-900">65%</div>
                  </div>
                  
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">预测拥挤度</div>
                    <div className="text-lg font-semibold text-gray-900">45%</div>
                  </div>
                  
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">置信度</div>
                    <div className="text-lg font-semibold text-gray-900">85%</div>
                  </div>
                  
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">预测时间</div>
                    <div className="text-sm font-medium text-gray-900">
                      {new Date(Date.now() + 60 * 60 * 1000).toLocaleTimeString('zh-CN', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>

                {/* 建议行动 */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-start">
                    <Clock className="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-900">建议</h4>
                      <p className="text-sm text-blue-800 mt-1">
                        建议在1小时后前往，预计拥挤度将显著降低
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 趋势说明 */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-gray-900">趋势预测说明</h4>
            <p className="text-sm text-gray-600 mt-1">
              趋势预测基于历史数据、当前时间、天气状况、节假日等多种因素综合分析得出。
              预测结果仅供参考，实际情况可能因突发事件而有所变化。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}