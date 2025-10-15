'use client';

import { useEffect } from 'react';
import { ExtendedReportData, CrowdLevel, WaitTimeRange, ServiceQuality } from '@/types';
import { 
  CheckCircle, 
  X, 
  MapPin, 
  Clock, 
  Users, 
  Star,
  Award,
  Share2
} from 'lucide-react';

interface ReportSuccessProps {
  report: ExtendedReportData & { 
    placeName?: string;
    placeId?: string;
  };
  onClose: () => void;
}

export function ReportSuccess({ report, onClose }: ReportSuccessProps) {
  useEffect(() => {
    // 自动关闭模态框
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getCrowdLevelText = (level?: CrowdLevel) => {
    const levels: Record<CrowdLevel, string> = {
      [CrowdLevel.LOW]: '空闲',
      [CrowdLevel.MEDIUM]: '适中',
      [CrowdLevel.HIGH]: '拥挤',
      [CrowdLevel.VERY_HIGH]: '非常拥挤'
    };
    return level ? levels[level] : '未知';
  };

  const getWaitTimeText = (range?: WaitTimeRange) => {
    const ranges: Record<WaitTimeRange, string> = {
      [WaitTimeRange.NONE]: '无需等待',
      [WaitTimeRange.SHORT]: '1-5分钟',
      [WaitTimeRange.MEDIUM]: '5-15分钟',
      [WaitTimeRange.LONG]: '15-30分钟',
      [WaitTimeRange.VERY_LONG]: '30分钟以上'
    };
    return range ? ranges[range] : '未知';
  };

  const getServiceQualityAverage = (quality?: ServiceQuality) => {
    if (!quality) return undefined;
    return Math.round((quality.attitude + quality.efficiency + quality.environment) / 3 * 10) / 10;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 animate-in slide-in-from-bottom-4 duration-300">
        {/* 头部 */}
        <div className="relative p-6 pb-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">上报成功！</h2>
              <p className="text-gray-600 text-sm">感谢您的贡献</p>
            </div>
          </div>
        </div>

        {/* 上报信息摘要 */}
        <div className="px-6 pb-4">
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">{report.placeName || report.placeId || '未知场所'}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">
                拥挤度: {getCrowdLevelText(report.crowdLevel)}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">
                等待时间: {getWaitTimeText(report.waitTimeRange)}
              </span>
            </div>

            {report.serviceQuality && (
              <div className="flex items-center gap-3">
                <Star className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">
                  服务质量: {getServiceQualityAverage(report.serviceQuality)}/5
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 奖励信息 */}
        <div className="px-6 pb-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <Award className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-gray-900">获得奖励</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="font-bold text-blue-600">+10</div>
                <div className="text-gray-600">信誉分</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-green-600">+1</div>
                <div className="text-gray-600">贡献次数</div>
              </div>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="px-6 pb-6">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              完成
            </button>
            <button
              onClick={() => {
                // 分享功能
                if (navigator.share) {
                  navigator.share({
                    title: 'Social Rhythm Companion',
                    text: `我刚在 ${report.placeName || report.placeId || '某个场所'} 上报了实时信息，帮助大家避开拥挤！`,
                    url: window.location.href
                  });
                }
              }}
              className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              <Share2 className="h-4 w-4" />
              分享
            </button>
          </div>
        </div>

        {/* 提示信息 */}
        <div className="px-6 pb-6">
          <div className="text-xs text-gray-500 text-center">
            您的上报将在审核通过后对其他用户可见
          </div>
        </div>
      </div>
    </div>
  );
}