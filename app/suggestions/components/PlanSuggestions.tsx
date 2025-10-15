'use client';

import React from 'react';
import { useSuggestionStore } from '@/lib/stores/suggestionStore';

import { Calendar, Clock, MapPin, Plus } from 'lucide-react';

export function PlanSuggestions() {
  const { planSuggestions, isLoading } = useSuggestionStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">加载计划建议...</p>
        </div>
      </div>
    );
  }

  if (!planSuggestions || planSuggestions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Calendar className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">暂无计划建议</h3>
        <p className="text-gray-500 mb-6">
          创建您的第一个出行计划，获取智能建议
        </p>
        <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          创建计划
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 头部信息 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">计划建议</h2>
          <p className="text-sm text-gray-500 mt-1">
            基于您的出行计划和偏好生成的建议
          </p>
        </div>
        <button className="inline-flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          新建计划
        </button>
      </div>

      {/* 计划概览 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-900">活跃计划</p>
              <p className="text-2xl font-semibold text-blue-600">
                {planSuggestions.length}
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
              <p className="text-sm font-medium text-green-900">今日计划</p>
              <p className="text-2xl font-semibold text-green-600">
                {planSuggestions.filter(plan => {
                  const today = new Date().toDateString();
                  return new Date(plan.recommendedTime).toDateString() === today;
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 建议列表 */}
      <div className="space-y-4">
        {planSuggestions.map((suggestion) => (
          <div key={suggestion.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">计划建议</h3>
                <p className="text-sm text-gray-500 mt-1">
                  基于您的偏好生成的计划建议
                </p>
              </div>
              <div className="text-sm text-gray-500">
                计划 #{suggestion.id}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 计划提示 */}
      <div className="bg-gray-50 rounded-lg p-4 mt-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <MapPin className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-gray-900">计划建议说明</h4>
            <p className="text-sm text-gray-600 mt-1">
              系统会根据您的出行计划、实时数据和个人偏好，为每个计划生成最优的时间安排和路线建议。
              您可以接受建议或调整计划时间。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}