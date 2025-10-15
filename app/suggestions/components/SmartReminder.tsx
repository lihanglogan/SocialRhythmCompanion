'use client';

import React, { useState, useEffect } from 'react';
import { useSuggestionStore } from '@/lib/stores/suggestionStore';
import { Bell, BellRing, Clock, MapPin, Users, Settings, X, Check } from 'lucide-react';

interface ReminderItem {
  id: string;
  type: 'crowd_alert' | 'time_reminder' | 'new_recommendation';
  title: string;
  message: string;
  placeName?: string;
  placeId?: string;
  scheduledTime?: Date;
  isActive: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
}

export function SmartReminder() {
  const { isLoading } = useSuggestionStore();
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [activeReminders, setActiveReminders] = useState<ReminderItem[]>([]);
  const [reminderSettings, setReminderSettings] = useState({
    enableCrowdAlerts: true,
    enableTimeReminders: true,
    enableNewRecommendations: true,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    },
    reminderFrequency: 'normal' as 'low' | 'normal' | 'high'
  });

  // 模拟获取提醒数据
  useEffect(() => {
    const mockReminders: ReminderItem[] = [
      {
        id: '1',
        type: 'crowd_alert',
        title: '拥挤度变化提醒',
        message: '星巴克(三里屯店)现在人流较少，是个好时机！',
        placeName: '星巴克(三里屯店)',
        placeId: 'place_1',
        isActive: true,
        priority: 'medium',
        createdAt: new Date(Date.now() - 5 * 60 * 1000) // 5分钟前
      },
      {
        id: '2',
        type: 'time_reminder',
        title: '最佳时间提醒',
        message: '根据您的偏好，现在是去健身房的最佳时间',
        scheduledTime: new Date(),
        isActive: true,
        priority: 'high',
        createdAt: new Date()
      },
      {
        id: '3',
        type: 'new_recommendation',
        title: '新推荐场所',
        message: '发现了3个符合您偏好的新场所',
        isActive: true,
        priority: 'low',
        createdAt: new Date(Date.now() - 30 * 60 * 1000) // 30分钟前
      }
    ];

    setReminders(mockReminders);
    setActiveReminders(mockReminders.filter(r => r.isActive));
  }, []);

  const dismissReminder = (id: string) => {
    setActiveReminders(prev => prev.filter(r => r.id !== id));
    setReminders(prev => prev.map(r => 
      r.id === id ? { ...r, isActive: false } : r
    ));
  };

  const dismissAllReminders = () => {
    setActiveReminders([]);
    setReminders(prev => prev.map(r => ({ ...r, isActive: false })));
  };

  const getReminderIcon = (type: string) => {
    switch (type) {
      case 'crowd_alert':
        return <Users className="w-5 h-5 text-blue-600" />;
      case 'time_reminder':
        return <Clock className="w-5 h-5 text-green-600" />;
      case 'new_recommendation':
        return <MapPin className="w-5 h-5 text-purple-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return '刚刚';
    if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
    return `${Math.floor(diff / 86400)}天前`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">加载智能提醒...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 头部信息 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">智能提醒</h2>
          <p className="text-sm text-gray-500 mt-1">
            个性化的实时提醒和通知
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {activeReminders.length > 0 && (
            <button
              onClick={dismissAllReminders}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              全部忽略
            </button>
          )}
          <div className="relative">
            <BellRing className="w-6 h-6 text-gray-600" />
            {activeReminders.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeReminders.length}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 活跃提醒 */}
      {activeReminders.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-900">当前提醒</h3>
          {activeReminders.map((reminder) => (
            <div
              key={reminder.id}
              className={`border-l-4 rounded-lg p-4 ${getPriorityColor(reminder.priority)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getReminderIcon(reminder.type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">
                      {reminder.title}
                    </h4>
                    <p className="text-sm text-gray-700 mt-1">
                      {reminder.message}
                    </p>
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>{formatTimeAgo(reminder.createdAt)}</span>
                      {reminder.placeName && (
                        <>
                          <span className="mx-2">•</span>
                          <MapPin className="w-3 h-3 mr-1" />
                          <span>{reminder.placeName}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => dismissReminder(reminder.id)}
                  className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 提醒设置 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center mb-4">
          <Settings className="w-5 h-5 text-gray-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">提醒设置</h3>
        </div>

        <div className="space-y-6">
          {/* 提醒类型开关 */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">提醒类型</h4>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">拥挤度提醒</p>
                <p className="text-xs text-gray-500">关注场所拥挤度变化时通知</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={reminderSettings.enableCrowdAlerts}
                  onChange={(e) => setReminderSettings({
                    ...reminderSettings,
                    enableCrowdAlerts: e.target.checked
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">时间提醒</p>
                <p className="text-xs text-gray-500">在最佳时间前提醒您</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={reminderSettings.enableTimeReminders}
                  onChange={(e) => setReminderSettings({
                    ...reminderSettings,
                    enableTimeReminders: e.target.checked
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">新推荐通知</p>
                <p className="text-xs text-gray-500">有新的个性化推荐时通知</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={reminderSettings.enableNewRecommendations}
                  onChange={(e) => setReminderSettings({
                    ...reminderSettings,
                    enableNewRecommendations: e.target.checked
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          {/* 免打扰时间 */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900">免打扰时间</h4>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">启用免打扰模式</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={reminderSettings.quietHours.enabled}
                  onChange={(e) => setReminderSettings({
                    ...reminderSettings,
                    quietHours: {
                      ...reminderSettings.quietHours,
                      enabled: e.target.checked
                    }
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {reminderSettings.quietHours.enabled && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">开始时间</label>
                  <input
                    type="time"
                    value={reminderSettings.quietHours.start}
                    onChange={(e) => setReminderSettings({
                      ...reminderSettings,
                      quietHours: {
                        ...reminderSettings.quietHours,
                        start: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">结束时间</label>
                  <input
                    type="time"
                    value={reminderSettings.quietHours.end}
                    onChange={(e) => setReminderSettings({
                      ...reminderSettings,
                      quietHours: {
                        ...reminderSettings.quietHours,
                        end: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 提醒频率 */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900">提醒频率</h4>
            <select
              value={reminderSettings.reminderFrequency}
              onChange={(e) => setReminderSettings({
                ...reminderSettings,
                reminderFrequency: e.target.value as 'low' | 'normal' | 'high'
              })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">较少 - 只推送重要提醒</option>
              <option value="normal">正常 - 平衡的提醒频率</option>
              <option value="high">频繁 - 及时推送所有提醒</option>
            </select>
          </div>
        </div>
      </div>

      {/* 历史提醒 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">历史提醒</h3>
        
        {reminders.filter(r => !r.isActive).length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            暂无历史提醒记录
          </p>
        ) : (
          <div className="space-y-3">
            {reminders.filter(r => !r.isActive).slice(0, 5).map((reminder) => (
              <div key={reminder.id} className="flex items-center space-x-3 py-2 border-b border-gray-100 last:border-0">
                <div className="flex-shrink-0 opacity-60">
                  {getReminderIcon(reminder.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700">{reminder.message}</p>
                  <p className="text-xs text-gray-500">{formatTimeAgo(reminder.createdAt)}</p>
                </div>
                <Check className="w-4 h-4 text-green-500" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 说明信息 */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Bell className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-blue-900">智能提醒说明</h4>
            <p className="text-sm text-blue-800 mt-1">
              智能提醒系统会根据您的偏好和行为模式，在合适的时机主动推送有价值的建议。
              您可以随时调整提醒设置，系统会学习您的反馈来优化提醒策略。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}