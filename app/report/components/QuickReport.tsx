'use client';

import { useState } from 'react';
import { useReportStore } from '@/lib/stores/reportStore';
import { CrowdnessSlider } from './CrowdnessSlider';
import { WaitTimeSelector } from './WaitTimeSelector';
import { 
  Clock, 
  Users, 
  Send, 
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { ReportType, CrowdLevel, WaitTimeRange } from '@/types';

export function QuickReport() {
  const {
    selectedPlace,
    currentReport,
    updateReportData,
    submitReport,
    isSubmitting,
    submitError,
    clearError
  } = useReportStore();

  const [crowdLevel, setCrowdLevel] = useState<CrowdLevel | null>(null);
  const [waitTimeRange, setWaitTimeRange] = useState<WaitTimeRange | null>(null);

  const handleSubmit = async () => {
    if (!selectedPlace) {
      return;
    }

    // 更新上报数据
    updateReportData({
      crowdLevel: crowdLevel || undefined,
      waitTimeRange: waitTimeRange || undefined
    });

    // 设置上报类型为快速上报
    if (!currentReport?.reportType) {
      updateReportData({ reportType: ReportType.QUICK });
    }

    await submitReport();
  };

  const canSubmit = selectedPlace && (crowdLevel || waitTimeRange);

  if (!selectedPlace) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">请先选择场所</h3>
          <p className="text-gray-600">
            请在上方位置检测器中选择要上报的场所
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Clock className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">快速上报</h2>
          <p className="text-gray-600 text-sm">
            快速分享 {selectedPlace.name} 的实时情况
          </p>
        </div>
      </div>

      {/* 错误提示 */}
      {submitError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-900">上报失败</h3>
              <p className="text-sm text-red-700 mt-1">{submitError}</p>
              <button
                onClick={clearError}
                className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
              >
                重试
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* 拥挤度选择 */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-gray-600" />
            <h3 className="font-medium text-gray-900">当前拥挤程度</h3>
            <span className="text-sm text-gray-500">(可选)</span>
          </div>
          
          <CrowdnessSlider 
            value={crowdLevel}
            onChange={setCrowdLevel}
          />
          
          {crowdLevel && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-700">
                  已选择: {getCrowdLevelText(crowdLevel)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 等待时间选择 */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-gray-600" />
            <h3 className="font-medium text-gray-900">预计等待时间</h3>
            <span className="text-sm text-gray-500">(可选)</span>
          </div>
          
          <WaitTimeSelector 
            value={waitTimeRange}
            onChange={setWaitTimeRange}
          />
          
          {waitTimeRange && (
            <div className="mt-3 p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700">
                  已选择: {getWaitTimeText(waitTimeRange)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 提交按钮 */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              canSubmit && !isSubmitting
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                提交中...
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                快速上报
              </>
            )}
          </button>
          
          {!canSubmit && (
            <p className="text-center text-sm text-gray-500 mt-2">
              请至少选择拥挤程度或等待时间
            </p>
          )}
        </div>

        {/* 快速上报说明 */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">快速上报说明</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 只需选择拥挤程度或等待时间即可快速上报</li>
            <li>• 上报信息将帮助其他用户了解场所实时状况</li>
            <li>• 准确的上报将提升您的信誉分数</li>
            <li>• 如需提供更详细信息，请切换到详细上报模式</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// 辅助函数
function getCrowdLevelText(level: CrowdLevel): string {
  const levelMap: Record<CrowdLevel, string> = {
    [CrowdLevel.LOW]: '人少 - 很空闲，无需等待',
    [CrowdLevel.MEDIUM]: '适中 - 正常人流，稍作等待',
    [CrowdLevel.HIGH]: '拥挤 - 人较多，需要等待',
    [CrowdLevel.VERY_HIGH]: '非常拥挤 - 人很多，等待较久'
  };
  return levelMap[level] || level;
}

function getWaitTimeText(range: WaitTimeRange): string {
  const rangeMap: Record<WaitTimeRange, string> = {
    [WaitTimeRange.NONE]: '无需等待 - 立即可办理',
    [WaitTimeRange.SHORT]: '1-5分钟 - 很快就轮到',
    [WaitTimeRange.MEDIUM]: '5-15分钟 - 稍等一会',
    [WaitTimeRange.LONG]: '15-30分钟 - 需要耐心等待',
    [WaitTimeRange.VERY_LONG]: '30分钟以上 - 建议改时间'
  };
  return rangeMap[range] || range;
}