'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  MapPin, 
  Clock,
  Heart,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Smartphone
} from 'lucide-react';
import { MatchPreferences } from '@/types';

interface MatchSettingsProps {
  onClose?: () => void;
}

export default function MatchSettings({ onClose }: MatchSettingsProps) {
  const [preferences, setPreferences] = useState<MatchPreferences>({
    maxDistance: 5000,
    ageRange: { min: 18, max: 65 },
    genderPreference: 'any',
    groupSizePreference: 2,
    interests: [],
    safetyLevel: 'medium'
  });

  const [privacySettings, setPrivacySettings] = useState({
    showAge: true,
    showLocation: true,
    showInterests: true,
    allowLocationSharing: true,
    visibleToAll: true,
    onlineStatus: true
  });

  const [notificationSettings, setNotificationSettings] = useState({
    newMatches: true,
    messages: true,
    meetingReminders: true,
    safetyAlerts: true,
    pushNotifications: true,
    emailNotifications: false,
    soundEnabled: true
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 兴趣选项
  const interestOptions = [
    '咖啡', '美食', '购物', '电影', '音乐', '读书', 
    '运动', '旅游', '摄影', '艺术', '游戏', '学习',
    '健身', '瑜伽', '跑步', '游泳', '爬山', '骑行'
  ];

  // 监听设置变化
  useEffect(() => {
    setHasChanges(true);
  }, [preferences, privacySettings, notificationSettings]);

  // 保存设置
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 模拟保存偏好设置
      console.log('保存匹配偏好:', preferences);
      // 这里可以添加保存隐私和通知设置的逻辑
      setHasChanges(false);
      alert('设置已保存');
    } catch {
      alert('保存设置失败，请稍后重试');
    } finally {
      setIsSaving(false);
    }
  };

  // 重置设置
  const handleReset = () => {
    setPreferences({
      maxDistance: 5000,
      ageRange: { min: 18, max: 65 },
      genderPreference: 'any',
      groupSizePreference: 2,
      interests: [],
      safetyLevel: 'medium'
    });
    setPrivacySettings({
      showAge: true,
      showLocation: true,
      showInterests: true,
      allowLocationSharing: true,
      visibleToAll: true,
      onlineStatus: true
    });
    setNotificationSettings({
      newMatches: true,
      messages: true,
      meetingReminders: true,
      safetyAlerts: true,
      pushNotifications: true,
      emailNotifications: false,
      soundEnabled: true
    });
    setHasChanges(true);
  };

  // 切换兴趣
  const toggleInterest = (interest: string) => {
    setPreferences(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Settings className="w-8 h-8 text-blue-500" />
          <h1 className="text-2xl font-bold text-gray-900">匹配设置</h1>
        </div>
        
        {/* 操作按钮 */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleReset}
            className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            重置
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? '保存中...' : '保存设置'}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 匹配偏好设置 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center mb-6">
          <User className="w-6 h-6 text-purple-500 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900">匹配偏好</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 最大距离 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              最大匹配距离: {(preferences.maxDistance / 1000).toFixed(1)}km
            </label>
            <input
              type="range"
              min="500"
              max="50000"
              step="500"
              value={preferences.maxDistance}
              onChange={(e) => setPreferences(prev => ({ ...prev, maxDistance: Number(e.target.value) }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0.5km</span>
              <span>50km</span>
            </div>
          </div>

          {/* 年龄范围 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              年龄范围: {preferences.ageRange?.min}-{preferences.ageRange?.max}岁
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="18"
                max="80"
                value={preferences.ageRange?.min || 18}
                onChange={(e) => setPreferences(prev => ({
                  ...prev,
                  ageRange: { ...prev.ageRange!, min: Number(e.target.value) }
                }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <input
                type="range"
                min="18"
                max="80"
                value={preferences.ageRange?.max || 65}
                onChange={(e) => setPreferences(prev => ({
                  ...prev,
                  ageRange: { ...prev.ageRange!, max: Number(e.target.value) }
                }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* 性别偏好 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              性别偏好
            </label>
            <select
              value={preferences.genderPreference}
              onChange={(e) => setPreferences(prev => ({ 
                ...prev, 
                genderPreference: e.target.value as 'male' | 'female' | 'any' 
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="any">不限</option>
              <option value="male">男性</option>
              <option value="female">女性</option>
            </select>
          </div>

          {/* 组队人数 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              期望组队人数: {preferences.groupSizePreference}人
            </label>
            <input
              type="range"
              min="2"
              max="8"
              value={preferences.groupSizePreference}
              onChange={(e) => setPreferences(prev => ({ ...prev, groupSizePreference: Number(e.target.value) }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>2人</span>
              <span>8人</span>
            </div>
          </div>

          {/* 安全级别 */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Shield className="w-4 h-4 inline mr-1" />
              安全级别
            </label>
            <div className="flex space-x-4">
              {[
                { value: 'low', label: '宽松', desc: '较少安全检查' },
                { value: 'medium', label: '标准', desc: '平衡安全与便利' },
                { value: 'high', label: '严格', desc: '最高安全标准' }
              ].map(level => (
                <label key={level.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="safetyLevel"
                    value={level.value}
                    checked={preferences.safetyLevel === level.value}
                    onChange={(e) => setPreferences(prev => ({ 
                      ...prev, 
                      safetyLevel: e.target.value as 'low' | 'medium' | 'high' 
                    }))}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div>
                    <div className="font-medium">{level.label}</div>
                    <div className="text-xs text-gray-500">{level.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* 兴趣爱好 */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <Heart className="w-4 h-4 inline mr-1" />
            兴趣爱好 ({preferences.interests.length}个已选择)
          </label>
          <div className="flex flex-wrap gap-2">
            {interestOptions.map(interest => (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                  preferences.interests.includes(interest)
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 隐私设置 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center mb-6">
          <Shield className="w-6 h-6 text-green-500 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900">隐私设置</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { key: 'showAge', label: '显示年龄', desc: '其他用户可以看到您的年龄' },
            { key: 'showLocation', label: '显示位置', desc: '显示大致位置信息' },
            { key: 'showInterests', label: '显示兴趣', desc: '在个人资料中显示兴趣爱好' },
            { key: 'allowLocationSharing', label: '允许位置共享', desc: '匹配时可以共享实时位置' },
            { key: 'visibleToAll', label: '对所有人可见', desc: '所有用户都可以看到您的资料' },
            { key: 'onlineStatus', label: '显示在线状态', desc: '显示您是否在线' }
          ].map(setting => (
            <div key={setting.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="font-medium text-gray-900">{setting.label}</div>
                <div className="text-sm text-gray-500">{setting.desc}</div>
              </div>
              <button
                onClick={() => setPrivacySettings(prev => ({
                  ...prev,
                  [setting.key]: !prev[setting.key as keyof typeof prev]
                }))}
                className="ml-3"
              >
                {privacySettings[setting.key as keyof typeof privacySettings] ? (
                  <Eye className="w-5 h-5 text-green-500" />
                ) : (
                  <EyeOff className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 通知设置 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center mb-6">
          <Bell className="w-6 h-6 text-yellow-500 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900">通知设置</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { key: 'newMatches', label: '新匹配', desc: '有新的匹配时通知', icon: Heart },
            { key: 'messages', label: '新消息', desc: '收到新消息时通知', icon: Bell },
            { key: 'meetingReminders', label: '见面提醒', desc: '约定时间前提醒', icon: Clock },
            { key: 'safetyAlerts', label: '安全警报', desc: '安全相关的重要通知', icon: Shield },
            { key: 'pushNotifications', label: '推送通知', desc: '手机推送通知', icon: Smartphone },
            { key: 'emailNotifications', label: '邮件通知', desc: '通过邮件接收通知', icon: Bell }
          ].map(setting => {
            const IconComponent = setting.icon;
            return (
              <div key={setting.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center flex-1">
                  <IconComponent className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">{setting.label}</div>
                    <div className="text-sm text-gray-500">{setting.desc}</div>
                  </div>
                </div>
                <button
                  onClick={() => setNotificationSettings(prev => ({
                    ...prev,
                    [setting.key]: !prev[setting.key as keyof typeof prev]
                  }))}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    notificationSettings[setting.key as keyof typeof notificationSettings]
                      ? 'bg-blue-500'
                      : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                    notificationSettings[setting.key as keyof typeof notificationSettings]
                      ? 'translate-x-6'
                      : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            );
          })}

          {/* 声音设置 */}
          <div className="md:col-span-2 flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              {notificationSettings.soundEnabled ? (
                <Volume2 className="w-5 h-5 text-gray-400 mr-3" />
              ) : (
                <VolumeX className="w-5 h-5 text-gray-400 mr-3" />
              )}
              <div>
                <div className="font-medium text-gray-900">通知声音</div>
                <div className="text-sm text-gray-500">接收通知时播放声音</div>
              </div>
            </div>
            <button
              onClick={() => setNotificationSettings(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
              className={`w-12 h-6 rounded-full transition-colors ${
                notificationSettings.soundEnabled ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                notificationSettings.soundEnabled ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* 保存提示 */}
      {hasChanges && (
        <div className="fixed bottom-6 right-6 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
          有未保存的更改
        </div>
      )}
    </div>
  );
}