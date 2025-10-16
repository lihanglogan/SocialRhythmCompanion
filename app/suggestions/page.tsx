'use client';

import React, { useEffect, useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { useSuggestionStore } from '@/lib/stores/suggestionStore';
import { useUserStore } from '@/lib/stores/userStore';
import { TodaySuggestions } from './components/TodaySuggestions';
import { PlanSuggestions } from './components/PlanSuggestions';
import { TrendPrediction } from './components/TrendPrediction';
import { PersonalRecommend } from './components/PersonalRecommend';
import { PreferenceSettings } from './components/PreferenceSettings';
import { SuggestionHistory } from './components/SuggestionHistory';
import { SmartReminder } from './components/SmartReminder';
import { api } from '@/lib/api/client';
import { 
  Brain, 
  Clock, 
  TrendingUp, 
  Heart, 
  Settings, 
  History,
  Lightbulb,
  MapPin
} from 'lucide-react';

type TabType = 'today' | 'plan' | 'trends' | 'personal' | 'settings' | 'history';

export default function SuggestionsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('today');
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  const {
    todaySuggestions,
    planSuggestions,
    trendPredictions,
    personalRecommendations,
    isLoading,
    isGeneratingSuggestions,
    error,
    generateTodaySuggestions,
    generateTrendPredictions,
    updatePersonalRecommendations,
    buildUserProfile,
    clearError
  } = useSuggestionStore();

  const { user } = useUserStore();

  // 获取用户位置
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn('获取位置失败:', error);
          // 使用默认位置（北京）
          setCurrentLocation({
            lat: 39.9042,
            lng: 116.4074
          });
        }
      );
    }
  }, []);

  // 初始化数据
  useEffect(() => {
    if (user && currentLocation) {
      const initializeData = async () => {
        try {
          // 生成模拟数据
          const mockPlaces = generateMockPlaces('beijing', 50);
          
          // 构建用户画像
          await buildUserProfile(user, [], []);
          
          // 生成今日建议
          await generateTodaySuggestions(user, currentLocation);
          
          // 生成趋势预测
          await generateTrendPredictions(mockPlaces.slice(0, 5));
          
          // 更新个人推荐
          await updatePersonalRecommendations(user, mockPlaces);
        } catch (error) {
          console.error('初始化数据失败:', error);
        }
      };

      initializeData();
    }
  }, [user, currentLocation, generateTodaySuggestions, generateTrendPredictions, updatePersonalRecommendations, buildUserProfile]);

  const tabs = [
    {
      id: 'today' as TabType,
      name: '今日建议',
      icon: Lightbulb,
      count: todaySuggestions.length,
      color: 'text-blue-600'
    },
    {
      id: 'plan' as TabType,
      name: '计划建议',
      icon: Clock,
      count: planSuggestions.length,
      color: 'text-green-600'
    },
    {
      id: 'trends' as TabType,
      name: '趋势预测',
      icon: TrendingUp,
      count: trendPredictions.length,
      color: 'text-purple-600'
    },
    {
      id: 'personal' as TabType,
      name: '个人推荐',
      icon: Heart,
      count: personalRecommendations.length,
      color: 'text-pink-600'
    },
    {
      id: 'settings' as TabType,
      name: '偏好设置',
      icon: Settings,
      count: 0,
      color: 'text-gray-600'
    },
    {
      id: 'history' as TabType,
      name: '建议历史',
      icon: History,
      count: 0,
      color: 'text-orange-600'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'today':
        return <TodaySuggestions />;
      case 'plan':
        return <PlanSuggestions />;
      case 'trends':
        return <TrendPrediction />;
      case 'personal':
        return <PersonalRecommend />;
      case 'settings':
        return <PreferenceSettings />;
      case 'history':
        return <SuggestionHistory />;
      default:
        return <TodaySuggestions />;
    }
  };

  return (
    <PageContainer>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* 页面头部 */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">智能建议</h1>
                  <p className="text-sm text-gray-500">
                    基于AI算法的个性化场所推荐
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {currentLocation && (
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>已定位</span>
                  </div>
                )}
                <SmartReminder />
              </div>
            </div>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    出现错误
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={clearError}
                      className="bg-red-100 px-3 py-1 rounded text-red-800 text-sm hover:bg-red-200 transition-colors"
                    >
                      关闭
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 统计概览 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Lightbulb className="w-5 h-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">今日建议</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {todaySuggestions.length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Clock className="w-5 h-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">计划建议</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {planSuggestions.length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">趋势分析</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {trendPredictions.length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <Heart className="w-5 h-5 text-pink-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">个人推荐</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {personalRecommendations.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 标签页导航 */}
          <div className="bg-white rounded-xl shadow-sm border mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors
                        ${activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }
                      `}
                    >
                      <Icon className={`w-4 h-4 mr-2 ${tab.color}`} />
                      {tab.name}
                      {tab.count > 0 && (
                        <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* 标签页内容 */}
            <div className="p-6">
              {isLoading || isGeneratingSuggestions ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-500">
                      {isGeneratingSuggestions ? '正在生成建议...' : '加载中...'}
                    </p>
                  </div>
                </div>
              ) : (
                renderTabContent()
              )}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}