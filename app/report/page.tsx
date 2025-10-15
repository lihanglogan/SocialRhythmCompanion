'use client';

import { useState, useEffect } from 'react';
import { useReportStore } from '@/lib/stores/reportStore';
import { PageContainer } from '@/components/layout/PageContainer';
import { QuickReport } from './components/QuickReport';
import { DetailedReport } from './components/DetailedReport';
import { LocationDetector } from './components/LocationDetector';
import { ReportSuccess } from './components/ReportSuccess';
import { ReportHistory } from './components/ReportHistory';
import { 
  MapPin, 
  Clock, 
  Users, 
  Camera, 
  History,
  Award,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

export default function ReportPage() {
  const {
    reportMode,
    setReportMode,
    showSuccessModal,
    hideSuccess,
    lastSubmittedReport,
    stats,
    loadStats,
    loadUserHistory,
    loadRecentReports
  } = useReportStore();

  const [activeTab, setActiveTab] = useState<'report' | 'history' | 'stats'>('report');

  useEffect(() => {
    // 加载初始数据
    loadStats();
    loadUserHistory();
    loadRecentReports();
  }, [loadStats, loadUserHistory, loadRecentReports]);

  return (
    <PageContainer>
      <div className="min-h-screen bg-gray-50">
        {/* 页面头部 */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                  场所上报
                </h1>
                <p className="text-gray-600 mt-2">
                  分享实时场所信息，帮助他人做出更好的决策
                </p>
              </div>

              {/* 统计信息 */}
              {stats && (
                <div className="hidden md:flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-blue-600">{stats.totalReports}</div>
                    <div className="text-gray-500">总上报</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-green-600">{stats.todayReports}</div>
                    <div className="text-gray-500">今日上报</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-orange-600">{stats.reputationScore}</div>
                    <div className="text-gray-500">信誉分</div>
                  </div>
                </div>
              )}
            </div>

            {/* 标签页导航 */}
            <div className="flex items-center gap-1 mt-6 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('report')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'report'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <MapPin className="h-4 w-4" />
                上报场所
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'history'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <History className="h-4 w-4" />
                上报历史
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'stats'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Award className="h-4 w-4" />
                我的成就
              </button>
            </div>
          </div>
        </div>

        {/* 主要内容区域 */}
        <div className="max-w-4xl mx-auto px-4 py-6">
          {activeTab === 'report' && (
            <div className="space-y-6">
              {/* 位置检测器 */}
              <LocationDetector />

              {/* 上报模式切换 */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">上报模式</h2>
                    <p className="text-gray-600 text-sm mt-1">
                      选择适合您的上报方式
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-medium ${
                        reportMode === 'quick' ? 'text-blue-600' : 'text-gray-500'
                      }`}>
                        快速上报
                      </span>
                      <button
                        onClick={() => setReportMode(reportMode === 'quick' ? 'detailed' : 'quick')}
                        className="focus:outline-none"
                      >
                        {reportMode === 'quick' ? (
                          <ToggleLeft className="h-8 w-8 text-blue-600" />
                        ) : (
                          <ToggleRight className="h-8 w-8 text-blue-600" />
                        )}
                      </button>
                      <span className={`text-sm font-medium ${
                        reportMode === 'detailed' ? 'text-blue-600' : 'text-gray-500'
                      }`}>
                        详细上报
                      </span>
                    </div>
                  </div>
                </div>

                {/* 模式说明 */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    {reportMode === 'quick' ? (
                      <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                    ) : (
                      <Camera className="h-5 w-5 text-blue-600 mt-0.5" />
                    )}
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {reportMode === 'quick' ? '快速上报' : '详细上报'}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {reportMode === 'quick'
                          ? '快速上报当前场所的拥挤程度和等待时间，只需几秒钟'
                          : '提供详细的场所信息，包括服务质量、环境评价和照片等'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 上报表单 */}
              {reportMode === 'quick' ? <QuickReport /> : <DetailedReport />}

              {/* 功能亮点 */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">为什么要上报？</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Users className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">帮助他人</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        您的上报能帮助其他用户避开拥挤时段，节省宝贵时间
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Award className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">获得奖励</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        积累信誉分，解锁专属徽章，成为社区贡献者
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <MapPin className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">优化体验</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        共同构建更智能的城市生活节奏预测系统
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && <ReportHistory />}

          {activeTab === 'stats' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">我的成就</h2>
              
              {stats && (
                <div className="space-y-6">
                  {/* 统计概览 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{stats.totalReports}</div>
                      <div className="text-sm text-gray-600">总上报次数</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{stats.verifiedReports}</div>
                      <div className="text-sm text-gray-600">已验证上报</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{stats.reputationScore}</div>
                      <div className="text-sm text-gray-600">信誉分数</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">#{stats.userRanking}</div>
                      <div className="text-sm text-gray-600">社区排名</div>
                    </div>
                  </div>

                  {/* 准确率 */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">上报准确率</span>
                      <span className="text-sm font-bold text-green-600">
                        {Math.round((stats.verifiedReports / stats.totalReports) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${(stats.verifiedReports / stats.totalReports) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 成功提示模态框 */}
        {showSuccessModal && lastSubmittedReport && (
          <ReportSuccess 
            report={lastSubmittedReport}
            onClose={hideSuccess}
          />
        )}
      </div>
    </PageContainer>
  );
}