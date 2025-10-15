'use client';

import { useState } from 'react';
import { useReportStore } from '@/lib/stores/reportStore';
import { CrowdnessSlider } from './CrowdnessSlider';
import { WaitTimeSelector } from './WaitTimeSelector';
import { PhotoUpload } from './PhotoUpload';

import { 
  FileText, 
  Users, 
  Clock, 
  Camera,
  Star,
  Send, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { CrowdLevel, WaitTimeRange, ServiceQuality } from '@/types';

// 服务质量评价选项
enum ServiceQualityLevel {
  EXCELLENT = 'excellent',
  GOOD = 'good', 
  AVERAGE = 'average',
  POOR = 'poor'
}

export function DetailedReport() {
  const {
    selectedPlace,
    updateReportData,
    submitReport,
    isSubmitting,
    submitError,
    clearError
  } = useReportStore();

  const [crowdLevel, setCrowdLevel] = useState<CrowdLevel | null>(null);
  const [waitTimeRange, setWaitTimeRange] = useState<WaitTimeRange | null>(null);
  const [serviceQualityLevel, setServiceQualityLevel] = useState<ServiceQualityLevel | null>(null);
  const [comments, setComments] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);

  const handleSubmit = async () => {
    if (!selectedPlace) {
      return;
    }

    // 构建服务质量对象
    let serviceQuality: ServiceQuality | undefined;
    if (serviceQualityLevel) {
      const qualityMap = {
        [ServiceQualityLevel.EXCELLENT]: { attitude: 5, efficiency: 5, environment: 5 },
        [ServiceQualityLevel.GOOD]: { attitude: 4, efficiency: 4, environment: 4 },
        [ServiceQualityLevel.AVERAGE]: { attitude: 3, efficiency: 3, environment: 3 },
        [ServiceQualityLevel.POOR]: { attitude: 2, efficiency: 2, environment: 2 }
      };
      serviceQuality = qualityMap[serviceQualityLevel];
    }

    // 更新上报数据
    updateReportData({
      crowdLevel: crowdLevel || undefined,
      waitTimeRange: waitTimeRange || undefined,
      serviceQuality,
      notes: comments || undefined,
      
    });

    await submitReport();
  };

  const canSubmit = selectedPlace && (crowdLevel || waitTimeRange || serviceQualityLevel || comments || photos.length > 0);

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
        <div className="p-2 bg-purple-100 rounded-lg">
          <FileText className="h-5 w-5 text-purple-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">详细上报</h2>
          <p className="text-gray-600 text-sm">
            提供 {selectedPlace.name} 的详细信息，帮助更多用户
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

      <div className="space-y-8">
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
        </div>

        {/* 服务质量评价 */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-gray-600" />
            <h3 className="font-medium text-gray-900">服务质量评价</h3>
            <span className="text-sm text-gray-500">(可选)</span>
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            {[
              { value: ServiceQualityLevel.EXCELLENT, label: '优秀', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200', stars: 5 },
              { value: ServiceQualityLevel.GOOD, label: '良好', color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', stars: 4 },
              { value: ServiceQualityLevel.AVERAGE, label: '一般', color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200', stars: 3 },
              { value: ServiceQualityLevel.POOR, label: '较差', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200', stars: 2 }
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => setServiceQualityLevel(item.value)}
                className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                  serviceQualityLevel === item.value
                    ? `${item.bgColor} ${item.borderColor} ${item.color}`
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= item.stars
                            ? serviceQualityLevel === item.value ? item.color : 'text-yellow-400'
                            : 'text-gray-300'
                        } ${star <= item.stars ? 'fill-current' : ''}`}
                      />
                    ))}
                  </div>
                  <span className={`font-medium ${
                    serviceQualityLevel === item.value ? item.color : 'text-gray-900'
                  }`}>
                    {item.label}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 照片上传 */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Camera className="h-5 w-5 text-gray-600" />
            <h3 className="font-medium text-gray-900">上传照片</h3>
            <span className="text-sm text-gray-500">(可选，最多3张)</span>
          </div>
          
          <PhotoUpload 
            photos={photos}
            onChange={setPhotos}
            maxPhotos={3}
          />
        </div>

        {/* 补充说明 */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-gray-600" />
            <h3 className="font-medium text-gray-900">补充说明</h3>
            <span className="text-sm text-gray-500">(可选)</span>
          </div>
          
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="请描述场所的具体情况，如特殊服务、注意事项等..."
            className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={4}
            maxLength={500}
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-sm text-gray-500">
              详细的描述将帮助其他用户更好地了解场所情况
            </p>
            <span className="text-sm text-gray-400">
              {comments.length}/500
            </span>
          </div>
        </div>

        {/* 提交按钮 */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              canSubmit && !isSubmitting
                ? 'bg-purple-600 text-white hover:bg-purple-700'
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
                提交详细上报
              </>
            )}
          </button>
          
          {!canSubmit && (
            <p className="text-center text-sm text-gray-500 mt-2">
              请至少填写一项信息
            </p>
          )}
        </div>

        {/* 详细上报说明 */}
        <div className="bg-purple-50 rounded-lg p-4">
          <h4 className="font-medium text-purple-900 mb-2">详细上报优势</h4>
          <ul className="text-sm text-purple-700 space-y-1">
            <li>• 提供更全面的场所信息，帮助用户做出更好的决策</li>
            <li>• 照片和详细描述让其他用户更直观了解现场情况</li>
            <li>• 详细上报将获得更多信誉分数和特殊徽章奖励</li>
            <li>• 高质量的上报内容将被优先展示给其他用户</li>
          </ul>
        </div>
      </div>
    </div>
  );
}