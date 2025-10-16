'use client';

import { useEffect } from 'react';
import { useUserStore } from '@/lib/stores/userStore';
import { useProfileStore } from '@/lib/stores/profileStore';
import { cn } from '@/lib/utils';
import { 
  User, 
  Settings, 
  BarChart3, 
  Clock, 
  Trophy, 
  Users, 
  Loader2,
  AlertCircle
} from 'lucide-react';

// 导入组件（稍后实现）
import { ProfileHeader } from './components/ProfileHeader';
import { UserInfo } from './components/UserInfo';
import { DataStats } from './components/DataStats';
import { HistoryRecords } from './components/HistoryRecords';
import { AchievementSystem } from './components/AchievementSystem';
import { PreferencesSettings } from './components/PreferencesSettings';
import { PrivacyControls } from './components/PrivacyControls';
import { NotificationSettings } from './components/NotificationSettings';
import { DataManagement } from './components/DataManagement';
import { SocialFeatures } from './components/SocialFeatures';
import { FeedbackCenter } from './components/FeedbackCenter';
import { AboutApp } from './components/AboutApp';

// 标签页配置
const tabConfig = [
  {
    id: 'overview',
    name: '概览',
    icon: User,
    description: '个人信息和数据概览',
  },
  {
    id: 'stats',
    name: '统计',
    icon: BarChart3,
    description: '使用统计和数据分析',
  },
  {
    id: 'history',
    name: '历史',
    icon: Clock,
    description: '历史记录和活动轨迹',
  },
  {
    id: 'achievements',
    name: '成就',
    icon: Trophy,
    description: '成就徽章和等级系统',
  },
  {
    id: 'social',
    name: '社交',
    icon: Users,
    description: '好友和社区互动',
  },
  {
    id: 'settings',
    name: '设置',
    icon: Settings,
    description: '偏好设置和隐私控制',
  },
] as const;

export default function ProfilePage() {
  const { user, isAuthenticated } = useUserStore();
  const { 
    activeTab, 
    setActiveTab, 
    isLoading, 
    error, 
    clearError,
    loadUserStats,
    loadUserHistory,
    loadAchievements,
    loadSocialData
  } = useProfileStore();

  // 初始化数据加载
  useEffect(() => {
    if (isAuthenticated && user) {
      // 根据当前标签页加载对应数据
      switch (activeTab) {
        case 'overview':
        case 'stats':
          loadUserStats();
          break;
        case 'history':
          loadUserHistory();
          break;
        case 'achievements':
          loadAchievements();
          break;
        case 'social':
          loadSocialData();
          break;
      }
    }
  }, [activeTab, isAuthenticated, user, loadUserStats, loadUserHistory, loadAchievements, loadSocialData]);

  // 未登录状态
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            请先登录
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            登录后即可查看个人中心
          </p>
          <button className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors">
            立即登录
          </button>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            加载失败
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error}
          </p>
          <button 
            onClick={clearError}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 页面头部 */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <ProfileHeader />
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* 侧边栏导航 */}
          <div className="lg:col-span-3">
            <nav className="space-y-1">
              {tabConfig.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      "w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      isActive
                        ? "bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-800"
                    )}
                  >
                    <Icon className={cn(
                      "h-5 w-5 mr-3",
                      isActive 
                        ? "text-primary-600 dark:text-primary-400" 
                        : "text-gray-400"
                    )} />
                    <div className="text-left">
                      <div className="font-medium">{tab.name}</div>
                      <div className={cn(
                        "text-xs",
                        isActive 
                          ? "text-primary-600 dark:text-primary-400" 
                          : "text-gray-500 dark:text-gray-400"
                      )}>
                        {tab.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* 主内容区域 */}
          <div className="mt-8 lg:mt-0 lg:col-span-9">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  加载中...
                </span>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                {/* 标签页内容 */}
                {activeTab === 'overview' && (
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                      个人概览
                    </h2>
                    <div className="space-y-8">
                      <UserInfo />
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                        <DataStats />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'stats' && (
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                      数据统计
                    </h2>
                    <DataStats />
                  </div>
                )}

                {activeTab === 'history' && (
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                      历史记录
                    </h2>
                    <HistoryRecords />
                  </div>
                )}

                {activeTab === 'achievements' && (
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                      成就系统
                    </h2>
                    <AchievementSystem />
                  </div>
                )}

                {activeTab === 'social' && (
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                      社交功能
                    </h2>
                    <SocialFeatures />
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                      设置中心
                    </h2>
                    <div className="space-y-8">
                      <PreferencesSettings />
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                        <PrivacyControls />
                      </div>
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                        <NotificationSettings />
                      </div>
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                        <DataManagement />
                      </div>
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                        <FeedbackCenter />
                      </div>
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                        <AboutApp />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}