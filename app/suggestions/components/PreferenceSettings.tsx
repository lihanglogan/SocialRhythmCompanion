'use client';

import React, { useState } from 'react';
import { useSuggestionStore } from '@/lib/stores/suggestionStore';
import { Settings, Save, RotateCcw, User, Clock, MapPin, Volume2, Accessibility } from 'lucide-react';

export function PreferenceSettings() {
  const { userPreferences, updateUserPreferences, isLoading } = useSuggestionStore();
  const [preferences, setPreferences] = useState(userPreferences || {
    preferredCrowdLevel: 'medium',
    maxWaitTime: 30,
    preferredTimeSlots: ['morning', 'afternoon'],
    avoidNoiseLevel: 'medium',
    accessibilityNeeds: [],
    distanceRange: 5,
    notifications: {
      crowdAlerts: true,
      timeReminders: true,
      newRecommendations: true
    }
  });

  const handleSave = () => {
    updateUserPreferences(preferences);
  };

  const handleReset = () => {
    setPreferences({
      preferredCrowdLevel: 'medium',
      maxWaitTime: 30,
      preferredTimeSlots: ['morning', 'afternoon'],
      avoidNoiseLevel: 'medium',
      accessibilityNeeds: [],
      distanceRange: 5,
      notifications: {
        crowdAlerts: true,
        timeReminders: true,
        newRecommendations: true
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">加载偏好设置...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 头部信息 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">偏好设置</h2>
          <p className="text-sm text-gray-500 mt-1">
            个性化您的智能建议体验
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleReset}
            className="inline-flex items-center px-3 py-2 text-sm bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            重置
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="w-4 h-4 mr-2" />
            保存
          </button>
        </div>
      </div>

      {/* 基本偏好 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center mb-4">
          <User className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">基本偏好</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 拥挤度偏好 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              拥挤度偏好
            </label>
            <select
              value={preferences.preferredCrowdLevel}
              onChange={(e) => setPreferences({
                ...preferences,
                preferredCrowdLevel: e.target.value as any
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">人少 - 避开拥挤场所</option>
              <option value="medium">适中 - 不太在意拥挤度</option>
              <option value="high">热闹 - 喜欢人多的地方</option>
            </select>
          </div>

          {/* 最大等待时间 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              最大等待时间 ({preferences.maxWaitTime} 分钟)
            </label>
            <input
              type="range"
              min="5"
              max="60"
              step="5"
              value={preferences.maxWaitTime}
              onChange={(e) => setPreferences({
                ...preferences,
                maxWaitTime: parseInt(e.target.value)
              })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>5分钟</span>
              <span>60分钟</span>
            </div>
          </div>

          {/* 距离范围 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              搜索距离范围 ({preferences.distanceRange} 公里)
            </label>
            <input
              type="range"
              min="1"
              max="20"
              step="1"
              value={preferences.distanceRange}
              onChange={(e) => setPreferences({
                ...preferences,
                distanceRange: parseInt(e.target.value)
              })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1公里</span>
              <span>20公里</span>
            </div>
          </div>

          {/* 噪音敏感度 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              噪音敏感度
            </label>
            <select
              value={preferences.avoidNoiseLevel}
              onChange={(e) => setPreferences({
                ...preferences,
                avoidNoiseLevel: e.target.value as any
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">不敏感 - 可以接受嘈杂环境</option>
              <option value="medium">一般 - 适度安静的环境</option>
              <option value="high">敏感 - 偏好安静环境</option>
            </select>
          </div>
        </div>
      </div>

      {/* 时间偏好 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center mb-4">
          <Clock className="w-5 h-5 text-green-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">时间偏好</h3>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            偏好的时间段 (可多选)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { value: 'morning', label: '早晨 (6:00-12:00)' },
              { value: 'afternoon', label: '下午 (12:00-18:00)' },
              { value: 'evening', label: '傍晚 (18:00-22:00)' },
              { value: 'night', label: '夜晚 (22:00-6:00)' }
            ].map((timeSlot) => (
              <label key={timeSlot.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.preferredTimeSlots.includes(timeSlot.value)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setPreferences({
                        ...preferences,
                        preferredTimeSlots: [...preferences.preferredTimeSlots, timeSlot.value]
                      });
                    } else {
                      setPreferences({
                        ...preferences,
                        preferredTimeSlots: preferences.preferredTimeSlots.filter(t => t !== timeSlot.value)
                      });
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">{timeSlot.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* 无障碍需求 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center mb-4">
          <Accessibility className="w-5 h-5 text-purple-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">无障碍需求</h3>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            选择您的无障碍需求
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { value: 'wheelchair', label: '轮椅通道' },
              { value: 'elevator', label: '电梯设施' },
              { value: 'ramp', label: '坡道入口' },
              { value: 'parking', label: '无障碍停车位' },
              { value: 'restroom', label: '无障碍洗手间' },
              { value: 'guide', label: '盲道/语音导览' }
            ].map((need) => (
              <label key={need.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.accessibilityNeeds.includes(need.value)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setPreferences({
                        ...preferences,
                        accessibilityNeeds: [...preferences.accessibilityNeeds, need.value]
                      });
                    } else {
                      setPreferences({
                        ...preferences,
                        accessibilityNeeds: preferences.accessibilityNeeds.filter(n => n !== need.value)
                      });
                    }
                  }}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="ml-2 text-sm text-gray-700">{need.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* 通知设置 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center mb-4">
          <Volume2 className="w-5 h-5 text-orange-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">通知设置</h3>
        </div>

        <div className="space-y-4">
          {[
            {
              key: 'crowdAlerts',
              label: '拥挤度提醒',
              description: '当关注场所拥挤度发生变化时通知我'
            },
            {
              key: 'timeReminders',
              label: '时间提醒',
              description: '在建议的最佳时间前提醒我'
            },
            {
              key: 'newRecommendations',
              label: '新推荐通知',
              description: '有新的个性化推荐时通知我'
            }
          ].map((notification) => (
            <div key={notification.key} className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">{notification.label}</h4>
                <p className="text-sm text-gray-500 mt-1">{notification.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={preferences.notifications[notification.key as keyof typeof preferences.notifications]}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    notifications: {
                      ...preferences.notifications,
                      [notification.key]: e.target.checked
                    }
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* 保存提示 */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Settings className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-blue-900">偏好设置说明</h4>
            <p className="text-sm text-blue-800 mt-1">
              您的偏好设置将用于生成个性化的智能建议。系统会根据这些设置为您推荐最合适的场所和时间。
              设置会自动保存到您的账户中。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}