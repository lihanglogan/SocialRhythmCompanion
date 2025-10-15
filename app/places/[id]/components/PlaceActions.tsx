'use client';

import { useState } from 'react';
import { Place } from '@/types';
import { 
  Heart, 
  Share2, 
  Navigation, 
  MessageCircle, 
  AlertTriangle, 
  Phone, 
  Clock,
  Star,
  Bookmark
} from 'lucide-react';

interface PlaceActionsProps {
  place: Place;
}

export default function PlaceActions({ place }: PlaceActionsProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // 收藏/取消收藏
  const toggleFavorite = () => {
    setIsFavorited(!isFavorited);
    // TODO: 实现收藏功能
  };

  // 分享场所
  const sharePlace = () => {
    setShowShareModal(true);
  };

  // 导航到场所
  const navigateToPlace = () => {
    const url = `https://uri.amap.com/navigation?to=${place.coordinates.lng},${place.coordinates.lat},${place.name}&mode=car&policy=1&src=myapp&coordinate=gaode&callnative=0`;
    window.open(url, '_blank');
  };

  // 拨打电话
  const callPlace = () => {
    const phone = `400-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;
    window.open(`tel:${phone}`);
  };

  // 上报状态
  const reportStatus = () => {
    setShowReportModal(true);
  };

  // 复制分享链接
  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}/places/${place.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('链接已复制到剪贴板');
      setShowShareModal(false);
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">快捷操作</h2>
      
      <div className="space-y-4">
        {/* 主要操作按钮 */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={navigateToPlace}
            className="flex items-center justify-center space-x-2 bg-primary-600 text-white px-4 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Navigation className="w-5 h-5" />
            <span>导航</span>
          </button>
          
          <button
            onClick={toggleFavorite}
            className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
              isFavorited
                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
            <span>{isFavorited ? '已收藏' : '收藏'}</span>
          </button>
        </div>

        {/* 次要操作按钮 */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={sharePlace}
            className="flex items-center justify-center space-x-2 bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>分享</span>
          </button>
          
          <button
            onClick={callPlace}
            className="flex items-center justify-center space-x-2 bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Phone className="w-4 h-4" />
            <span>电话</span>
          </button>
        </div>

        {/* 上报按钮 */}
        <button
          onClick={reportStatus}
          className="w-full flex items-center justify-center space-x-2 bg-orange-100 text-orange-600 px-4 py-3 rounded-lg hover:bg-orange-200 transition-colors"
        >
          <AlertTriangle className="w-5 h-5" />
          <span>上报状态</span>
        </button>
      </div>

      {/* 场所信息卡片 */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-3">场所信息</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">当前状态</span>
            <span className={`font-medium ${place.currentStatus.isOpen ? 'text-green-600' : 'text-red-600'}`}>
              {place.currentStatus.isOpen ? '营业中' : '已关闭'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">预计等待</span>
            <span className="font-medium text-gray-900">{place.waitTime} 分钟</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">拥挤程度</span>
            <span className="font-medium text-gray-900">
              {place.crowdLevel === 'low' ? '人少' :
               place.crowdLevel === 'medium' ? '适中' :
               place.crowdLevel === 'high' ? '较多' : '拥挤'}
            </span>
          </div>
        </div>
      </div>

      {/* 用户评价快捷入口 */}
      <div className="mt-6">
        <h3 className="font-medium text-gray-900 mb-3">用户评价</h3>
        <div className="flex items-center space-x-4 mb-3">
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">4.2 (128条评价)</span>
        </div>
        <button className="w-full bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm">
          查看全部评价
        </button>
      </div>

      {/* 营业时间 */}
      <div className="mt-6">
        <h3 className="font-medium text-gray-900 mb-3 flex items-center">
          <Clock className="w-4 h-4 mr-2" />
          营业时间
        </h3>
        <div className="space-y-1 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>今日</span>
            <span className="font-medium">
              {place.openHours.monday[0]?.open || '09:00'} - {place.openHours.monday[0]?.close || '18:00'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>明日</span>
            <span>
              {place.openHours.tuesday[0]?.open || '09:00'} - {place.openHours.tuesday[0]?.close || '18:00'}
            </span>
          </div>
        </div>
      </div>

      {/* 分享模态框 */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">分享场所</h3>
            <div className="space-y-3">
              <button
                onClick={copyShareLink}
                className="w-full flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Share2 className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-gray-900">复制链接</span>
              </button>
              
              <button className="w-full flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-gray-900">微信分享</span>
              </button>
            </div>
            
            <button
              onClick={() => setShowShareModal(false)}
              className="w-full mt-4 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* 上报模态框 */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">上报场所状态</h3>
            <div className="space-y-3">
              <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="font-medium text-gray-900">等待时间变化</div>
                <div className="text-sm text-gray-600">实际等待时间与显示不符</div>
              </button>
              
              <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="font-medium text-gray-900">拥挤程度变化</div>
                <div className="text-sm text-gray-600">人流情况与显示不符</div>
              </button>
              
              <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="font-medium text-gray-900">营业状态变化</div>
                <div className="text-sm text-gray-600">营业时间或状态有误</div>
              </button>
            </div>
            
            <button
              onClick={() => setShowReportModal(false)}
              className="w-full mt-4 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
}