'use client';

import { useState } from 'react';
import { useUserStore } from '@/lib/stores/userStore';
import { cn } from '@/lib/utils';
import {
  Bell,
  Volume2,
  VolumeX,
  Vibrate,
  Mail,
  MessageCircle,
  Users,
  MapPin,
  Trophy,
  Calendar,
  Clock,
  Smartphone,
  Save,
  Settings,
  Info
} from 'lucide-react';

export function NotificationSettings() {
  const { user, updateUser } = useUserStore();
  const [hasChanges, setHasChanges] = useState(false);
  
  // 本地状态管理通知设置
  const [notificationSettings, setNotificationSettings] = useState({
    // 全局通知设置
    masterNotifications: user?.preferences?.notifications ?? true,
    
    // 推送通知类型
    matchNotifications: true,
    messageNotifications: true,
    friendRequestNotifications: true,
    locationAlerts: false,
    achievementNotifications: true,
    eventReminders: true,
    
    // 通知方式
    pushNotifications: true,
    emailNotifications: false,
    smsNotifications: false,
    
    // 声音和振动
    soundEnabled: true,
    vibrationEnabled: true,
    customSound: 'default',
    
    // 时间设置
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    
    // 频率控制
    instantNotifications: true,
    batchNotifications: false,
    dailySummary: false,
    
    // 特殊通知
    emergencyAlerts: true,
    systemUpdates: false,
    promotionalMessages: false,
    
    // 位置相关
    nearbyActivityAlerts: false,
    crowdLevelChanges: true,
    weatherAlerts: false
  });

  const handleNotificationChange = (key: string, value: string | boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      // 更新用户偏好
      await updateUser({
        ...user!,
        preferences: {
          theme: user?.preferences?.theme || 'system',
          language: user?.preferences?.language || 'zh',
          notifications: notificationSettings.masterNotifications,
          location: user?.preferences?.location || {
            enabled: true
          }
        }
      });

      setHasChanges(false);
    } catch (error) {
      console.error('保存通知设置失败:', error);
    }
  };

  const handleTestNotification = () => {
    // 发送测试通知
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('测试通知', {
        body: '这是一条测试通知，用于验证您的通知设置是否正常工作。',
        icon: '/favicon.ico'
      });
    } else if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('测试通知', {
            body: '通知权限已开启！这是一条测试通知。',
            icon: '/favicon.ico'
          });
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* 保存按钮 */}
      {hasChanges && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="text-blue-800 dark:text-blue-200 font-medium">
                通知设置已更改
              </span>
            </div>
            <button
              onClick={handleSave}
              className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>保存设置</span>
            </button>
          </div>
        </div>
      )}

      {/* 通知概览 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <Bell className="h-5 w-5 mr-2" />
          通知概览
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 主通知开关 */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  主通知开关
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  控制所有应用通知
                </p>
              </div>
              <button
                onClick={() => handleNotificationChange('masterNotifications', !notificationSettings.masterNotifications)}
                className={cn(
                  "relative inline-flex h-8 w-14 items-center rounded-full transition-colors",
                  notificationSettings.masterNotifications ? "bg-primary-600" : "bg-gray-300 dark:bg-gray-600"
                )}
              >
                <span
                  className={cn(
                    "inline-block h-6 w-6 transform rounded-full bg-white transition-transform",
                    notificationSettings.masterNotifications ? "translate-x-7" : "translate-x-1"
                  )}
                />
              </button>
            </div>
            
            {/* 测试通知按钮 */}
            <button
              onClick={handleTestNotification}
              className="w-full px-3 py-2 text-sm bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-md hover:bg-primary-200 dark:hover:bg-primary-900/30 transition-colors"
            >
              发送测试通知
            </button>
          </div>

          {/* 通知统计 */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              今日通知统计
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">匹配通知</span>
                <span className="font-medium text-gray-900 dark:text-white">3</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">消息通知</span>
                <span className="font-medium text-gray-900 dark:text-white">12</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">系统通知</span>
                <span className="font-medium text-gray-900 dark:text-white">1</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 推送通知类型 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <Smartphone className="h-5 w-5 mr-2" />
          推送通知类型
        </h3>
        
        <div className="space-y-4">
          {[
            {
              key: 'matchNotifications',
              label: '匹配通知',
              description: '当找到新的匹配时通知您',
              icon: Users,
              value: notificationSettings.matchNotifications
            },
            {
              key: 'messageNotifications',
              label: '消息通知',
              description: '收到新消息时通知您',
              icon: MessageCircle,
              value: notificationSettings.messageNotifications
            },
            {
              key: 'friendRequestNotifications',
              label: '好友请求',
              description: '收到好友请求时通知您',
              icon: Users,
              value: notificationSettings.friendRequestNotifications
            },
            {
              key: 'locationAlerts',
              label: '位置提醒',
              description: '基于位置的相关提醒',
              icon: MapPin,
              value: notificationSettings.locationAlerts
            },
            {
              key: 'achievementNotifications',
              label: '成就通知',
              description: '获得新成就时通知您',
              icon: Trophy,
              value: notificationSettings.achievementNotifications
            },
            {
              key: 'eventReminders',
              label: '事件提醒',
              description: '重要事件和活动提醒',
              icon: Calendar,
              value: notificationSettings.eventReminders
            }
          ].map(setting => {
            const Icon = setting.icon;
            return (
              <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {setting.label}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {setting.description}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleNotificationChange(setting.key, !setting.value)}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    setting.value ? "bg-primary-600" : "bg-gray-300 dark:bg-gray-600"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                      setting.value ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 通知方式 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          通知方式
        </h3>
        
        <div className="space-y-4">
          {[
            {
              key: 'pushNotifications',
              label: '推送通知',
              description: '在设备上显示推送通知',
              icon: Bell,
              value: notificationSettings.pushNotifications
            },
            {
              key: 'emailNotifications',
              label: '邮件通知',
              description: '通过邮件接收重要通知',
              icon: Mail,
              value: notificationSettings.emailNotifications
            },
            {
              key: 'smsNotifications',
              label: '短信通知',
              description: '通过短信接收紧急通知',
              icon: MessageCircle,
              value: notificationSettings.smsNotifications
            }
          ].map(setting => {
            const Icon = setting.icon;
            return (
              <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {setting.label}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {setting.description}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleNotificationChange(setting.key, !setting.value)}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    setting.value ? "bg-primary-600" : "bg-gray-300 dark:bg-gray-600"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                      setting.value ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 声音和振动 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <Volume2 className="h-5 w-5 mr-2" />
          声音和振动
        </h3>
        
        <div className="space-y-6">
          {/* 声音和振动开关 */}
          <div className="space-y-4">
            {[
              {
                key: 'soundEnabled',
                label: '通知声音',
                description: '播放通知提示音',
                icon: notificationSettings.soundEnabled ? Volume2 : VolumeX,
                value: notificationSettings.soundEnabled
              },
              {
                key: 'vibrationEnabled',
                label: '振动提醒',
                description: '通知时设备振动',
                icon: Vibrate,
                value: notificationSettings.vibrationEnabled
              }
            ].map(setting => {
              const Icon = setting.icon;
              return (
                <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {setting.label}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {setting.description}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleNotificationChange(setting.key, !setting.value)}
                    className={cn(
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                      setting.value ? "bg-primary-600" : "bg-gray-300 dark:bg-gray-600"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                        setting.value ? "translate-x-6" : "translate-x-1"
                      )}
                    />
                  </button>
                </div>
              );
            })}
          </div>

          {/* 自定义铃声 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              通知铃声
            </label>
            <select
              value={notificationSettings.customSound}
              onChange={(e) => handleNotificationChange('customSound', e.target.value)}
              disabled={!notificationSettings.soundEnabled}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50"
            >
              <option value="default">默认铃声</option>
              <option value="chime">清脆铃声</option>
              <option value="bell">经典铃声</option>
              <option value="notification">系统通知音</option>
              <option value="gentle">轻柔提示音</option>
            </select>
          </div>
        </div>
      </div>

      {/* 免打扰时间 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          免打扰时间
        </h3>
        
        <div className="space-y-4">
          {/* 免打扰开关 */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                启用免打扰时间
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                在指定时间段内静音所有通知
              </div>
            </div>
            <button
              onClick={() => handleNotificationChange('quietHoursEnabled', !notificationSettings.quietHoursEnabled)}
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                notificationSettings.quietHoursEnabled ? "bg-primary-600" : "bg-gray-300 dark:bg-gray-600"
              )}
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  notificationSettings.quietHoursEnabled ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
          </div>

          {/* 时间设置 */}
          {notificationSettings.quietHoursEnabled && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  开始时间
                </label>
                <input
                  type="time"
                  value={notificationSettings.quietHoursStart}
                  onChange={(e) => handleNotificationChange('quietHoursStart', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  结束时间
                </label>
                <input
                  type="time"
                  value={notificationSettings.quietHoursEnd}
                  onChange={(e) => handleNotificationChange('quietHoursEnd', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 通知频率 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          通知频率
        </h3>
        
        <div className="space-y-3">
          {[
            {
              key: 'instantNotifications',
              label: '即时通知',
              description: '立即接收所有通知'
            },
            {
              key: 'batchNotifications',
              label: '批量通知',
              description: '每小时汇总发送通知'
            },
            {
              key: 'dailySummary',
              label: '每日摘要',
              description: '每天发送一次通知摘要'
            }
          ].map(option => (
            <button
              key={option.key}
              onClick={() => {
                // 单选逻辑
                setNotificationSettings(prev => ({
                  ...prev,
                  instantNotifications: option.key === 'instantNotifications',
                  batchNotifications: option.key === 'batchNotifications',
                  dailySummary: option.key === 'dailySummary'
                }));
                setHasChanges(true);
              }}
              className={cn(
                "w-full flex items-start space-x-3 p-4 rounded-lg border-2 text-left transition-colors",
                notificationSettings[option.key as keyof typeof notificationSettings]
                  ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                  : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
              )}
            >
              <div className={cn(
                "w-4 h-4 rounded-full border-2 mt-1 flex items-center justify-center",
                notificationSettings[option.key as keyof typeof notificationSettings]
                  ? "border-primary-500 bg-primary-500"
                  : "border-gray-300 dark:border-gray-600"
              )}>
                {notificationSettings[option.key as keyof typeof notificationSettings] && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
              <div>
                <div className={cn(
                  "font-medium",
                  notificationSettings[option.key as keyof typeof notificationSettings]
                    ? "text-primary-900 dark:text-primary-100"
                    : "text-gray-900 dark:text-white"
                )}>
                  {option.label}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {option.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 通知提示 */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              通知设置提示
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• 关闭主通知开关将禁用所有推送通知</li>
              <li>• 免打扰时间不会影响紧急安全通知</li>
              <li>• 邮件和短信通知可能产生额外费用</li>
              <li>• 您可以随时调整通知设置以获得最佳体验</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}