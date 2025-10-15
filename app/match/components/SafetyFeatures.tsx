'use client';

import React, { useState } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  Phone, 
  MessageSquare, 
  UserX, 
  Flag,
  Clock,
  MapPin,
  Eye,
  Lock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useMatchStore } from '@/lib/stores/matchStore';
import { SafetyReport } from '@/types';

interface SafetyFeaturesProps {
  matchId: string;
  userId?: string;
}

export default function SafetyFeatures({ matchId, userId }: SafetyFeaturesProps) {
  const { reportUser, blockUser } = useMatchStore();
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [reportData, setReportData] = useState<Partial<SafetyReport>>({
    reason: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 举报原因选项
  const reportReasons = [
    { value: 'harassment', label: '骚扰或不当行为' },
    { value: 'inappropriate_content', label: '不当内容' },
    { value: 'spam', label: '垃圾信息' },
    { value: 'fake_profile', label: '虚假资料' },
    { value: 'safety_concern', label: '安全担忧' },
    { value: 'no_show', label: '爽约未到' },
    { value: 'other', label: '其他' }
  ];

  // 提交举报
  const handleSubmitReport = async () => {
    if (!reportData.reason || !reportData.description?.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await reportUser({
        ...reportData,
        targetUserId: userId,
        matchId: matchId,
        createdAt: new Date()
      } as SafetyReport);
      
      setShowReportModal(false);
      setReportData({ reason: '', description: '' });
      
      // 显示成功提示
      alert('举报已提交，我们会尽快处理');
    } catch {
      alert('提交举报失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 拉黑用户
  const handleBlockUser = async () => {
    if (!userId) return;
    
    setIsSubmitting(true);
    try {
      await blockUser(userId);
      setShowBlockModal(false);
      alert('用户已被拉黑');
    } catch {
      alert('拉黑用户失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 紧急联系
  const handleEmergencyContact = () => {
    if (confirm('是否拨打紧急联系电话？')) {
      window.location.href = 'tel:110';
    }
  };

  return (
    <div className="space-y-6">
      {/* 安全功能概览 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center mb-6">
          <Shield className="w-6 h-6 text-green-500 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">安全中心</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 紧急联系 */}
          <button
            onClick={handleEmergencyContact}
            className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
          >
            <Phone className="w-8 h-8 text-red-500 mr-3" />
            <div className="text-left">
              <div className="font-medium text-red-800">紧急联系</div>
              <div className="text-sm text-red-600">拨打110报警电话</div>
            </div>
          </button>

          {/* 举报用户 */}
          {userId && (
            <button
              onClick={() => setShowReportModal(true)}
              className="flex items-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
            >
              <Flag className="w-8 h-8 text-yellow-500 mr-3" />
              <div className="text-left">
                <div className="font-medium text-yellow-800">举报用户</div>
                <div className="text-sm text-yellow-600">报告不当行为</div>
              </div>
            </button>
          )}

          {/* 拉黑用户 */}
          {userId && (
            <button
              onClick={() => setShowBlockModal(true)}
              className="flex items-center p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <UserX className="w-8 h-8 text-gray-500 mr-3" />
              <div className="text-left">
                <div className="font-medium text-gray-800">拉黑用户</div>
                <div className="text-sm text-gray-600">阻止未来匹配</div>
              </div>
            </button>
          )}

          {/* 安全提醒 */}
          <button className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
            <AlertTriangle className="w-8 h-8 text-blue-500 mr-3" />
            <div className="text-left">
              <div className="font-medium text-blue-800">安全提醒</div>
              <div className="text-sm text-blue-600">查看安全建议</div>
            </div>
          </button>
        </div>
      </div>

      {/* 安全建议 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Eye className="w-5 h-5 mr-2 text-blue-500" />
          安全建议
        </h3>

        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <div className="font-medium text-gray-900">选择公共场所</div>
              <div className="text-sm text-gray-600">首次见面建议选择人流量较大的公共场所</div>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <div className="font-medium text-gray-900">告知朋友行程</div>
              <div className="text-sm text-gray-600">将见面地点和时间告知可信任的朋友</div>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <div className="font-medium text-gray-900">保持警觉</div>
              <div className="text-sm text-gray-600">注意周围环境，信任自己的直觉</div>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <div className="font-medium text-gray-900">保护个人信息</div>
              <div className="text-sm text-gray-600">避免过早透露详细个人信息</div>
            </div>
          </div>
        </div>
      </div>

      {/* 隐私保护 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Lock className="w-5 h-5 mr-2 text-purple-500" />
          隐私保护
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <MapPin className="w-5 h-5 text-gray-400 mr-2" />
              <span className="text-sm font-medium text-gray-900">位置信息加密</span>
            </div>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <MessageSquare className="w-5 h-5 text-gray-400 mr-2" />
              <span className="text-sm font-medium text-gray-900">聊天记录加密</span>
            </div>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Eye className="w-5 h-5 text-gray-400 mr-2" />
              <span className="text-sm font-medium text-gray-900">匿名匹配</span>
            </div>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-gray-400 mr-2" />
              <span className="text-sm font-medium text-gray-900">自动数据清理</span>
            </div>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
        </div>
      </div>

      {/* 举报模态框 */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">举报用户</h3>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* 举报原因 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  举报原因
                </label>
                <select
                  value={reportData.reason}
                  onChange={(e) => {
                    setReportData(prev => ({
                      ...prev,
                      reason: e.target.value
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">请选择举报原因</option>
                  {reportReasons.map(reason => (
                    <option key={reason.value} value={reason.value}>
                      {reason.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 详细描述 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  详细描述
                </label>
                <textarea
                  value={reportData.description}
                  onChange={(e) => setReportData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="请详细描述遇到的问题..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                />
              </div>

              {/* 提交按钮 */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={handleSubmitReport}
                  disabled={!reportData.reason || !reportData.description?.trim() || isSubmitting}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? '提交中...' : '提交举报'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 拉黑确认模态框 */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">确认拉黑</h3>
              <button
                onClick={() => setShowBlockModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-6 h-6 text-yellow-500 mt-0.5" />
                <div>
                  <p className="text-gray-900 font-medium mb-2">
                    确定要拉黑这个用户吗？
                  </p>
                  <p className="text-sm text-gray-600">
                    拉黑后，您将不会再与该用户匹配，且无法撤销此操作。
                  </p>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowBlockModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={handleBlockUser}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? '处理中...' : '确认拉黑'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}