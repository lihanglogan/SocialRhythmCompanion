'use client';

import React from 'react';
import { useSuggestionStore } from '@/lib/stores/suggestionStore';
import { Suggestion } from '@/types';
import { 
  MapPin, 
  Clock, 
  Users, 
  Star, 
  ThumbsUp, 
  ThumbsDown,
  Navigation,
  Info,
  Bookmark,
  Share2
} from 'lucide-react';

interface SuggestionCardProps {
  suggestion: Suggestion;
  rank?: number;
  showActions?: boolean;
}

export function SuggestionCard({ 
  suggestion, 
  rank, 
  showActions = true 
}: SuggestionCardProps) {
  const { acceptSuggestion, rejectSuggestion } = useSuggestionStore();

  const handleAccept = () => {
    acceptSuggestion(suggestion.id);
  };

  const handleReject = () => {
    rejectSuggestion(suggestion.id, '用户手动拒绝');
  };

  const handleNavigate = () => {
    // 导航到地点详情页面
    window.open(`/places/${suggestion.place.id}`, '_blank');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `推荐场所：${suggestion.place.name}`,
        text: `${suggestion.reason}`,
        url: window.location.href
      });
    } else {
      // 复制到剪贴板
      navigator.clipboard.writeText(
        `推荐场所：${suggestion.place.name}\n${suggestion.reason}\n${window.location.href}`
      );
    }
  };

  const getCrowdLevelText = (level?: number) => {
    if (!level) return '未知';
    if (level < 0.3) return '人少';
    if (level < 0.7) return '适中';
    return '拥挤';
  };

  const getCrowdLevelColor = (level?: number) => {
    if (!level) return 'text-gray-500';
    if (level < 0.3) return 'text-green-600';
    if (level < 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      {/* 卡片头部 */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            {rank && (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                  {rank}
                </div>
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {suggestion.place.name}
                </h3>
                <span className={`
                  px-2 py-1 rounded-full text-xs font-medium
                  ${getConfidenceColor(suggestion.confidence)}
                `}>
                  {Math.round(suggestion.confidence * 100)}% 匹配
                </span>
              </div>
              
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <MapPin className="w-4 h-4 mr-1" />
                <span className="truncate">{suggestion.place.address}</span>
              </div>
              
              <div className="flex items-center space-x-4 mt-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <Star className="w-4 h-4 mr-1 text-yellow-500" />
                  <span>{suggestion.place.rating?.toFixed(1) || 'N/A'}</span>
                </div>
                
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1 text-gray-400" />
                  <span className={getCrowdLevelColor(suggestion.place.currentStatus?.crowdDensity)}>
                    {getCrowdLevelText(suggestion.place.currentStatus?.crowdDensity)}
                  </span>
                </div>
                
                {suggestion.estimatedWaitTime && (
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{suggestion.estimatedWaitTime}分钟</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleShare}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              title="分享"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              title="收藏"
            >
              <Bookmark className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 建议原因 */}
      <div className="px-6 pb-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-start">
            <Info className="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-1">推荐理由</h4>
              <p className="text-sm text-blue-800">{suggestion.reason}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 建议类型标签 */}
      <div className="px-6 pb-4">
        <div className="flex flex-wrap gap-2">
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            智能推荐
          </span>
          {suggestion.estimatedCrowdLevel && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              拥挤度: {suggestion.estimatedCrowdLevel}
            </span>
          )}
          {suggestion.alternativeOptions && suggestion.alternativeOptions.length > 0 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
              {suggestion.alternativeOptions.length}个替代选择
            </span>
          )}
        </div>
      </div>

      {/* 操作按钮 */}
      {showActions && (
        <div className="px-6 pb-6">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleAccept}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ThumbsUp className="w-4 h-4 mr-2" />
              接受建议
            </button>
            
            <button
              onClick={handleNavigate}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Navigation className="w-4 h-4 mr-2" />
              查看详情
            </button>
            
            <button
              onClick={handleReject}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              title="不感兴趣"
            >
              <ThumbsDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 替代选择 */}
      {suggestion.alternativeOptions && suggestion.alternativeOptions.length > 0 && (
        <div className="border-t border-gray-100 px-6 py-4">
          <h5 className="text-sm font-medium text-gray-900 mb-3">替代选择</h5>
          <div className="space-y-2">
            {suggestion.alternativeOptions.slice(0, 2).map((alt, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{alt.place.name}</p>
                  <p className="text-xs text-gray-500">{alt.place.address}</p>
                </div>
                <button
                  onClick={() => window.open(`/places/${alt.place.id}`, '_blank')}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  查看
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}