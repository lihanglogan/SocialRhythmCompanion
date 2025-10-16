'use client';

import { useState } from 'react';
import { useProfileStore } from '@/lib/stores/profileStore';
import { cn } from '@/lib/utils';
import {
  Shield,
  Eye,
  Lock,
  MapPin,
  Users,
  MessageCircle,
  Activity,
  Globe,
  UserCheck,
  AlertTriangle,
  Save,
  Info
} from 'lucide-react';

export function PrivacyControls() {
  const { settings, updateSettings } = useProfileStore();
  const [hasChanges, setHasChanges] = useState(false);
  
  // 本地状态管理隐私设置
  const [privacySettings, setPrivacySettings] = useState({
    // 资料可见性
    profileVisibility: settings?.privacy?.profileVisibility || 'public',
    showStats: settings?.privacy?.showStats ?? true,
    showBadges: settings?.privacy?.showBadges ?? true,
    
    // 位置隐私
    locationSharing: settings?.privacy?.locationSharing ?? false,
    preciseLocation: true,
    locationHistory: false,
    
    // 在线状态
    showOnlineStatus: settings?.privacy?.showOnlineStatus ?? true,
    showLastSeen: true,
    showActivity: false,
    
    // 社交隐私
    allowDirectMessages: settings?.privacy?.allowDirectMessages ?? true,
    allowFriendRequests: true,
    showFriendsList: false,
    
    // 数据隐私
    dataCollection: true,
    analyticsOptIn: true,
    personalization: true,
    advertisingOptOut: false,
    
    // 安全设置
    twoFactorAuth: false,
    loginNotifications: true,
    suspiciousActivityAlerts: true,
    
    // 搜索和发现
    searchableByEmail: false,
    searchableByPhone: false,
    suggestToContacts: true,
    showInDirectory: true
  });

  const handlePrivacyChange = (key: string, value: string | boolean) => {
    setPrivacySettings(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      // 更新个人中心设置
      await updateSettings({
        ...settings,
        privacy: {
          profileVisibility: privacySettings.profileVisibility as 'public' | 'friends' | 'private',
          locationSharing: privacySettings.locationSharing,
          showOnlineStatus: privacySettings.showOnlineStatus,
          allowDirectMessages: privacySettings.allowDirectMessages,
          showStats: privacySettings.showStats,
          showBadges: privacySettings.showBadges
        }
      });

      setHasChanges(false);
    } catch (error) {
      console.error('保存隐私设置失败:', error);
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return Globe;
      case 'friends':
        return Users;
      case 'private':
        return Lock;
      default:
        return Eye;
    }
  };

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return 'text-green-600 dark:text-green-400';
      case 'friends':
        return 'text-blue-600 dark:text-blue-400';
      case 'private':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* 保存按钮 */}
      {hasChanges && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="text-blue-800 dark:text-blue-200 font-medium">
                隐私设置已更改
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

      {/* 隐私概览 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          隐私概览
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 资料可见性状态 */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                资料可见性
              </span>
              {(() => {
                const Icon = getVisibilityIcon(privacySettings.profileVisibility);
                return <Icon className={cn("h-4 w-4", getVisibilityColor(privacySettings.profileVisibility))} />;
              })()}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {privacySettings.profileVisibility === 'public' && '所有人可见'}
              {privacySettings.profileVisibility === 'friends' && '仅好友可见'}
              {privacySettings.profileVisibility === 'private' && '仅自己可见'}
            </div>
          </div>

          {/* 位置共享状态 */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                位置共享
              </span>
              <MapPin className={cn(
                "h-4 w-4",
                privacySettings.locationSharing 
                  ? "text-orange-600 dark:text-orange-400" 
                  : "text-gray-400"
              )} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {privacySettings.locationSharing ? '已启用' : '已禁用'}
            </div>
          </div>

          {/* 在线状态 */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                在线状态
              </span>
              <Activity className={cn(
                "h-4 w-4",
                privacySettings.showOnlineStatus 
                  ? "text-green-600 dark:text-green-400" 
                  : "text-gray-400"
              )} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {privacySettings.showOnlineStatus ? '可见' : '隐藏'}
            </div>
          </div>
        </div>
      </div>

      {/* 资料可见性设置 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <Eye className="h-5 w-5 mr-2" />
          资料可见性
        </h3>
        
        <div className="space-y-6">
          {/* 主要可见性设置 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              谁可以查看我的资料
            </label>
            <div className="grid grid-cols-1 gap-3">
              {[
                { 
                  key: 'public', 
                  label: '所有人', 
                  description: '任何人都可以查看您的公开资料',
                  icon: Globe,
                  color: 'text-green-600 dark:text-green-400'
                },
                { 
                  key: 'friends', 
                  label: '仅好友', 
                  description: '只有您的好友可以查看详细资料',
                  icon: Users,
                  color: 'text-blue-600 dark:text-blue-400'
                },
                { 
                  key: 'private', 
                  label: '仅自己', 
                  description: '只有您自己可以查看完整资料',
                  icon: Lock,
                  color: 'text-red-600 dark:text-red-400'
                }
              ].map(option => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.key}
                    onClick={() => handlePrivacyChange('profileVisibility', option.key)}
                    className={cn(
                      "flex items-start space-x-3 p-4 rounded-lg border-2 text-left transition-colors",
                      privacySettings.profileVisibility === option.key
                        ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                        : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                    )}
                  >
                    <Icon className={cn(
                      "h-5 w-5 mt-0.5",
                      privacySettings.profileVisibility === option.key
                        ? "text-primary-600 dark:text-primary-400"
                        : option.color
                    )} />
                    <div>
                      <div className={cn(
                        "font-medium",
                        privacySettings.profileVisibility === option.key
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
                );
              })}
            </div>
          </div>

          {/* 详细资料设置 */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white">详细资料设置</h4>
            {[
              {
                key: 'showStats',
                label: '显示统计数据',
                description: '显示访问次数、匹配成功率等统计信息',
                value: privacySettings.showStats
              },
              {
                key: 'showBadges',
                label: '显示成就徽章',
                description: '在资料中显示获得的成就和徽章',
                value: privacySettings.showBadges
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
                  onClick={() => handlePrivacyChange(setting.key, !setting.value)}
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

      {/* 位置隐私 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          位置隐私
        </h3>
        
        <div className="space-y-4">
          {[
            {
              key: 'locationSharing',
              label: '位置共享',
              description: '允许其他用户看到您的大致位置',
              value: privacySettings.locationSharing,
              warning: true
            },
            {
              key: 'preciseLocation',
              label: '精确位置',
              description: '共享精确的GPS坐标而非大致区域',
              value: privacySettings.preciseLocation,
              warning: true
            },
            {
              key: 'locationHistory',
              label: '位置历史',
              description: '保存和显示您的位置访问历史',
              value: privacySettings.locationHistory
            }
          ].map(setting => (
            <div key={setting.key} className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {setting.label}
                  </span>
                  {setting.warning && (
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                  )}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {setting.description}
                </div>
              </div>
              <button
                onClick={() => handlePrivacyChange(setting.key, !setting.value)}
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors ml-4",
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

      {/* 在线状态和活动 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <Activity className="h-5 w-5 mr-2" />
          在线状态和活动
        </h3>
        
        <div className="space-y-4">
          {[
            {
              key: 'showOnlineStatus',
              label: '显示在线状态',
              description: '让其他用户看到您是否在线',
              value: privacySettings.showOnlineStatus
            },
            {
              key: 'showLastSeen',
              label: '显示最后在线时间',
              description: '显示您最后一次活跃的时间',
              value: privacySettings.showLastSeen
            },
            {
              key: 'showActivity',
              label: '显示活动状态',
              description: '显示您当前正在做什么（如：正在浏览场所）',
              value: privacySettings.showActivity
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
                onClick={() => handlePrivacyChange(setting.key, !setting.value)}
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

      {/* 社交隐私 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <MessageCircle className="h-5 w-5 mr-2" />
          社交隐私
        </h3>
        
        <div className="space-y-4">
          {[
            {
              key: 'allowDirectMessages',
              label: '允许私信',
              description: '其他用户可以向您发送私信',
              value: privacySettings.allowDirectMessages
            },
            {
              key: 'allowFriendRequests',
              label: '允许好友请求',
              description: '其他用户可以向您发送好友请求',
              value: privacySettings.allowFriendRequests
            },
            {
              key: 'showFriendsList',
              label: '显示好友列表',
              description: '在您的资料中显示好友列表',
              value: privacySettings.showFriendsList
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
                onClick={() => handlePrivacyChange(setting.key, !setting.value)}
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

      {/* 搜索和发现 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <UserCheck className="h-5 w-5 mr-2" />
          搜索和发现
        </h3>
        
        <div className="space-y-4">
          {[
            {
              key: 'searchableByEmail',
              label: '通过邮箱搜索',
              description: '允许其他用户通过您的邮箱找到您',
              value: privacySettings.searchableByEmail
            },
            {
              key: 'searchableByPhone',
              label: '通过手机号搜索',
              description: '允许其他用户通过您的手机号找到您',
              value: privacySettings.searchableByPhone
            },
            {
              key: 'suggestToContacts',
              label: '向通讯录好友推荐',
              description: '向您通讯录中的联系人推荐您的资料',
              value: privacySettings.suggestToContacts
            },
            {
              key: 'showInDirectory',
              label: '显示在用户目录',
              description: '在公共用户目录中显示您的资料',
              value: privacySettings.showInDirectory
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
                onClick={() => handlePrivacyChange(setting.key, !setting.value)}
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

      {/* 隐私提示 */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              隐私保护提示
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• 更严格的隐私设置可能会影响匹配效果和社交体验</li>
              <li>• 位置信息仅用于匹配和场所推荐，不会被第三方获取</li>
              <li>• 您可以随时修改这些设置，更改会立即生效</li>
              <li>• 我们承诺不会将您的个人信息出售给第三方</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}