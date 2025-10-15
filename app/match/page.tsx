'use client';

import { useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { QuickMatch } from './components/QuickMatch';
import { CustomMatch } from './components/CustomMatch';
import { NearbyUsers } from './components/NearbyUsers';
import { PlannedMatch } from './components/PlannedMatch';
import MatchHistory from './components/MatchHistory';
import MatchSettings from './components/MatchSettings';
import { Users, Clock, MapPin, Settings, History, Zap } from 'lucide-react';

type TabType = 'quick' | 'custom' | 'nearby' | 'planned' | 'history' | 'settings';

export default function MatchPage() {
  const [activeTab, setActiveTab] = useState<TabType>('quick');

  const tabs = [
    {
      id: 'quick' as TabType,
      label: '快速匹配',
      icon: Zap,
      description: '一键匹配同行伙伴'
    },
    {
      id: 'custom' as TabType,
      label: '定制匹配',
      icon: Settings,
      description: '自定义匹配条件'
    },
    {
      id: 'nearby' as TabType,
      label: '附近同行',
      icon: MapPin,
      description: '查看附近用户'
    },
    {
      id: 'planned' as TabType,
      label: '计划同行',
      icon: Clock,
      description: '提前发布计划'
    },
    {
      id: 'history' as TabType,
      label: '匹配记录',
      icon: History,
      description: '查看历史记录'
    },
    {
      id: 'settings' as TabType,
      label: '匹配设置',
      icon: Users,
      description: '个人偏好设置'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'quick':
        return <QuickMatch />;
      case 'custom':
        return <CustomMatch />;
      case 'nearby':
        return <NearbyUsers />;
      case 'planned':
        return <PlannedMatch />;
      case 'history':
        return <MatchHistory />;
      case 'settings':
        return <MatchSettings />;
      default:
        return <QuickMatch />;
    }
  };

  return (
    <PageContainer>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* 页面标题 */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">同行匹配</h1>
                <p className="text-gray-600">寻找志同道合的同行伙伴</p>
              </div>
            </div>
          </div>
        </div>

        {/* 导航标签 */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-1 overflow-x-auto py-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium
                      transition-all duration-200 whitespace-nowrap min-w-fit
                      ${activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }
                    `}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 标签内容 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}