'use client';

import { useState } from 'react';
import { useUserStore } from '@/lib/stores/userStore';
import { useProfileStore } from '@/lib/stores/profileStore';
import { cn } from '@/lib/utils';
import {
  Settings,
  Palette,
  Volume2,
  MapPin,
  Users,
  Shield,
  Monitor,
  Sun,
  Moon,
  Zap,
  Save,
  RotateCcw
} from 'lucide-react';

export function PreferencesSettings() {
  const { user, updateUser } = useUserStore();
  const { settings, updateSettings } = useProfileStore();
  const [hasChanges, setHasChanges] = useState(false);
  
  // 本地状态管理偏好设置
  const [preferences, setPreferences] = useState({
    // 外观设置
    theme: user?.preferences?.theme || 'system',
    language: user?.preferences?.language || 'zh',
    
    // 通知设置
    notifications: user?.preferences?.notifications ?? true,
    soundEnabled: true,
    vibrationEnabled: true,
    
    // 位置设置
    locationEnabled: user?.preferences?.location?.enabled ?? true,
    shareLocation: settings?.privacy?.locationSharing ?? false,
    autoDetectLocation: true,
    
    // 匹配偏好
    preferredCrowdLevel: 'medium' as 'low' | 'medium' | 'high',
    maxWaitTime: 30,
    ageRange: { min: 18, max: 65 },
    maxDistance: 5,
    
    // 隐私设置
    profileVisibility: settings?.privacy?.profileVisibility || 'public',
    showOnlineStatus: settings?.privacy?.showOnlineStatus ?? true,
    allowDirectMessages: true,
    
    // 高级设置
    autoSync: true,
    dataCompression: true,
    analyticsEnabled: true,
    crashReporting: true
  });

  const handlePreferenceChange = (key: string, value: string | number | boolean) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const handleNestedPreferenceChange = (parentKey: string, childKey: string, value: string | number | boolean) => {
    setPreferences(prev => ({
      ...prev,
      [parentKey]: {
        ...(prev[parentKey as keyof typeof prev] as Record<string, unknown>),
        [childKey]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      // 更新用户偏好
      await updateUser({
        ...user!,
        preferences: {
          theme: preferences.theme as 'light' | 'dark' | 'system',
          language: preferences.language as 'zh' | 'en',
          notifications: preferences.notifications,
          location: {
            enabled: preferences.locationEnabled,
            latitude: user?.preferences?.location?.latitude,
            longitude: user?.preferences?.location?.longitude,
            city: user?.preferences?.location?.city
          }
        }
      });

      // 更新个人中心设置
      await updateSettings({
        ...settings,
        privacy: {
          ...settings?.privacy,
          profileVisibility: preferences.profileVisibility as 'public' | 'friends' | 'private',
          locationSharing: preferences.shareLocation,
          showOnlineStatus: preferences.showOnlineStatus,
          allowDirectMessages: preferences.allowDirectMessages,
          showStats: settings?.privacy?.showStats ?? true,
          showBadges: settings?.privacy?.showBadges ?? true
        }
      });

      setHasChanges(false);
    } catch (error) {
      console.error('保存设置失败:', error);
    }
  };

  const handleReset = () => {
    setPreferences({
      theme: 'system',
      language: 'zh',
      notifications: true,
      soundEnabled: true,
      vibrationEnabled: true,
      locationEnabled: true,
      shareLocation: false,
      autoDetectLocation: true,
      preferredCrowdLevel: 'medium',
      maxWaitTime: 30,
      ageRange: { min: 18, max: 65 },
      maxDistance: 5,
      profileVisibility: 'public',
      showOnlineStatus: true,
      allowDirectMessages: true,
      autoSync: true,
      dataCompression: true,
      analyticsEnabled: true,
      crashReporting: true
    });
    setHasChanges(true);
  };

  return (
    <div className="space-y-6">
      {/* 保存按钮 */}
      {hasChanges && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="text-blue-800 dark:text-blue-200 font-medium">
                设置已更改
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleReset}
                className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                <span>重置</span>
              </button>
              <button
                onClick={handleSave}
                className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>保存设置</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 外观设置 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <Palette className="h-5 w-5 mr-2" />
          外观设置
        </h3>
        
        <div className="space-y-6">
          {/* 主题设置 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              主题模式
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: 'light', label: '浅色', icon: Sun },
                { key: 'dark', label: '深色', icon: Moon },
                { key: 'system', label: '跟随系统', icon: Monitor }
              ].map(theme => {
                const Icon = theme.icon;
                return (
                  <button
                    key={theme.key}
                    onClick={() => handlePreferenceChange('theme', theme.key)}
                    className={cn(
                      "flex flex-col items-center space-y-2 p-4 rounded-lg border-2 transition-colors",
                      preferences.theme === theme.key
                        ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                        : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                    )}
                  >
                    <Icon className={cn(
                      "h-6 w-6",
                      preferences.theme === theme.key
                        ? "text-primary-600 dark:text-primary-400"
                        : "text-gray-600 dark:text-gray-400"
                    )} />
                    <span className={cn(
                      "text-sm font-medium",
                      preferences.theme === theme.key
                        ? "text-primary-600 dark:text-primary-400"
                        : "text-gray-700 dark:text-gray-300"
                    )}>
                      {theme.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 语言设置 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              语言
            </label>
            <select
              value={preferences.language}
              onChange={(e) => handlePreferenceChange('language', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="zh">中文（简体）</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>

      {/* 通知设置 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <Volume2 className="h-5 w-5 mr-2" />
          通知设置
        </h3>
        
        <div className="space-y-4">
          {[
            {
              key: 'notifications',
              label: '推送通知',
              description: '接收应用的推送通知',
              value: preferences.notifications
            },
            {
              key: 'soundEnabled',
              label: '通知声音',
              description: '通知时播放提示音',
              value: preferences.soundEnabled
            },
            {
              key: 'vibrationEnabled',
              label: '振动提醒',
              description: '通知时设备振动',
              value: preferences.vibrationEnabled
            }
          ].map(setting => (
            <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {setting.label}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {setting.description}
                </div>
              </div>
              <button
                onClick={() => handlePreferenceChange(setting.key, !setting.value)}
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
          ))}
        </div>
      </div>

      {/* 位置设置 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          位置设置
        </h3>
        
        <div className="space-y-4">
          {[
            {
              key: 'locationEnabled',
              label: '位置服务',
              description: '允许应用访问您的位置信息',
              value: preferences.locationEnabled
            },
            {
              key: 'shareLocation',
              label: '位置共享',
              description: '与其他用户共享您的位置',
              value: preferences.shareLocation
            },
            {
              key: 'autoDetectLocation',
              label: '自动定位',
              description: '自动检测并更新您的位置',
              value: preferences.autoDetectLocation
            }
          ].map(setting => (
            <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {setting.label}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {setting.description}
                </div>
              </div>
              <button
                onClick={() => handlePreferenceChange(setting.key, !setting.value)}
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
          ))}
        </div>
      </div>

      {/* 匹配偏好 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <Users className="h-5 w-5 mr-2" />
          匹配偏好
        </h3>
        
        <div className="space-y-6">
          {/* 偏好人流量 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              偏好人流量
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: 'low', label: '较少', color: 'text-green-600' },
                { key: 'medium', label: '中等', color: 'text-yellow-600' },
                { key: 'high', label: '较多', color: 'text-red-600' }
              ].map(level => (
                <button
                  key={level.key}
                  onClick={() => handlePreferenceChange('preferredCrowdLevel', level.key)}
                  className={cn(
                    "p-3 rounded-lg border-2 text-center transition-colors",
                    preferences.preferredCrowdLevel === level.key
                      ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                      : "border-gray-200 dark:border-gray-600 hover:border-gray-300"
                  )}
                >
                  <span className={cn(
                    "font-medium",
                    preferences.preferredCrowdLevel === level.key
                      ? "text-primary-600 dark:text-primary-400"
                      : level.color
                  )}>
                    {level.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 最大等待时间 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              最大等待时间: {preferences.maxWaitTime} 分钟
            </label>
            <input
              type="range"
              min="5"
              max="120"
              step="5"
              value={preferences.maxWaitTime}
              onChange={(e) => handlePreferenceChange('maxWaitTime', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>5分钟</span>
              <span>120分钟</span>
            </div>
          </div>

          {/* 年龄范围 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              年龄范围: {preferences.ageRange.min} - {preferences.ageRange.max} 岁
            </label>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">最小年龄</label>
                <input
                  type="range"
                  min="18"
                  max="80"
                  value={preferences.ageRange.min}
                  onChange={(e) => handleNestedPreferenceChange('ageRange', 'min', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">最大年龄</label>
                <input
                  type="range"
                  min="18"
                  max="80"
                  value={preferences.ageRange.max}
                  onChange={(e) => handleNestedPreferenceChange('ageRange', 'max', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* 最大距离 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              最大距离: {preferences.maxDistance} 公里
            </label>
            <input
              type="range"
              min="1"
              max="50"
              value={preferences.maxDistance}
              onChange={(e) => handlePreferenceChange('maxDistance', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>1公里</span>
              <span>50公里</span>
            </div>
          </div>
        </div>
      </div>

      {/* 隐私设置 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          隐私设置
        </h3>
        
        <div className="space-y-4">
          {/* 资料可见性 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              资料可见性
            </label>
            <select
              value={preferences.profileVisibility}
              onChange={(e) => handlePreferenceChange('profileVisibility', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="public">公开 - 所有人可见</option>
              <option value="friends">好友 - 仅好友可见</option>
              <option value="private">私密 - 仅自己可见</option>
            </select>
          </div>

          {/* 其他隐私选项 */}
          {[
            {
              key: 'showOnlineStatus',
              label: '显示在线状态',
              description: '让其他用户看到您是否在线',
              value: preferences.showOnlineStatus
            },
            {
              key: 'allowDirectMessages',
              label: '允许私信',
              description: '允许其他用户向您发送私信',
              value: preferences.allowDirectMessages
            }
          ].map(setting => (
            <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {setting.label}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {setting.description}
                </div>
              </div>
              <button
                onClick={() => handlePreferenceChange(setting.key, !setting.value)}
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
          ))}
        </div>
      </div>

      {/* 高级设置 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          高级设置
        </h3>
        
        <div className="space-y-4">
          {[
            {
              key: 'autoSync',
              label: '自动同步',
              description: '自动同步数据到云端',
              value: preferences.autoSync
            },
            {
              key: 'dataCompression',
              label: '数据压缩',
              description: '压缩数据以节省流量',
              value: preferences.dataCompression
            },
            {
              key: 'analyticsEnabled',
              label: '使用分析',
              description: '帮助改进应用体验',
              value: preferences.analyticsEnabled
            },
            {
              key: 'crashReporting',
              label: '崩溃报告',
              description: '自动发送崩溃报告',
              value: preferences.crashReporting
            }
          ].map(setting => (
            <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {setting.label}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {setting.description}
                </div>
              </div>
              <button
                onClick={() => handlePreferenceChange(setting.key, !setting.value)}
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
          ))}
        </div>
      </div>
    </div>
  );
}