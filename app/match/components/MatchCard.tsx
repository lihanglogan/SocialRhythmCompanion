'use client';

import { useState } from 'react';
import { CompanionRequest, CompanionMatch, User } from '@/types';
import { 
  MapPin, 
  Clock, 
  Star, 
  MessageCircle, 
  Shield, 
  ChevronRight,
  UserCheck
} from 'lucide-react';

interface MatchCardProps {
  type: 'request' | 'match';
  data: CompanionRequest | CompanionMatch;
  onConnect?: () => void;
  onViewProfile?: (userId: string) => void;
  onStartChat?: () => void;
  className?: string;
}

export function MatchCard({ 
  type, 
  data, 
  onConnect, 
  onViewProfile, 
  onStartChat,
  className = '' 
}: MatchCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const isRequest = type === 'request';
  const request = isRequest ? data as CompanionRequest : null;
  const match = !isRequest ? data as CompanionMatch : null;

  // 获取用户信息
  const getUsers = (): User[] => {
    if (isRequest && request) {
      return [request.user];
    }
    if (match) {
      return match.users;
    }
    return [];
  };

  const users = getUsers();
  const primaryUser = users[0];
  const otherUsers = users.slice(1);

  // 获取时间信息
  const getTimeInfo = () => {
    if (isRequest && request) {
      return {
        time: request.preferredTime,
        label: '希望时间',
        flexible: request.flexibleTime
      };
    }
    if (match) {
      return {
        time: match.scheduledTime,
        label: '约定时间',
        flexible: 0
      };
    }
    return null;
  };

  const timeInfo = getTimeInfo();

  // 获取地点信息
  const place = isRequest ? request?.place : match?.place;

  // 获取状态颜色
  const getStatusColor = () => {
    const status = isRequest ? request?.status : match?.status;
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'matched':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 获取状态文本
  const getStatusText = () => {
    const status = isRequest ? request?.status : match?.status;
    switch (status) {
      case 'pending':
        return '等待匹配';
      case 'matched':
        return '已匹配';
      case 'confirmed':
        return '已确认';
      case 'completed':
        return '已完成';
      case 'cancelled':
        return '已取消';
      default:
        return '未知状态';
    }
  };

  // 计算时间差
  const getTimeFromNow = (time: Date) => {
    const now = new Date();
    const diff = time.getTime() - now.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}天后`;
    if (hours > 0) return `${hours}小时后`;
    if (minutes > 0) return `${minutes}分钟后`;
    if (minutes < 0) return '已过期';
    return '即将开始';
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow ${className}`}>
      {/* 卡片头部 */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            {/* 用户头像 */}
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                {primaryUser?.name?.charAt(0) || 'U'}
              </div>
              {users.length > 1 && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                  +{users.length - 1}
                </div>
              )}
            </div>

            {/* 用户信息 */}
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900">
                  {primaryUser?.name || '匿名用户'}
                </h3>
                {otherUsers.length > 0 && (
                  <span className="text-sm text-gray-600">
                    等 {users.length} 人
                  </span>
                )}
              </div>
              
              {/* 用户评分 */}
              <div className="flex items-center space-x-1 mt-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-600">4.8</span>
                <span className="text-xs text-gray-500">(12次同行)</span>
              </div>
            </div>
          </div>

          {/* 状态标签 */}
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>

        {/* 地点信息 */}
        {place && (
          <div className="flex items-start space-x-2 mb-3">
            <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-gray-900 text-sm">{place.name}</p>
              <p className="text-xs text-gray-600">{place.address}</p>
            </div>
          </div>
        )}

        {/* 时间信息 */}
        {timeInfo && (
          <div className="flex items-center space-x-2 mb-3">
            <Clock className="h-4 w-4 text-gray-400" />
            <div className="flex-1">
              <p className="text-sm text-gray-900">
                {timeInfo.time.toLocaleString('zh-CN')}
              </p>
              <div className="flex items-center space-x-2 text-xs text-gray-600">
                <span>{getTimeFromNow(timeInfo.time)}</span>
                {timeInfo.flexible > 0 && (
                  <span className="bg-gray-100 px-1 rounded">
                    ±{timeInfo.flexible}分钟
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 留言 */}
        {((isRequest && request?.message) || (match && match.feedback)) && (
          <div className="bg-gray-50 rounded-lg p-3 mb-3">
            <p className="text-sm text-gray-700">
              {isRequest ? request?.message : match?.feedback}
            </p>
          </div>
        )}

        {/* 展开/收起按钮 */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-center w-full py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <span>{isExpanded ? '收起详情' : '查看详情'}</span>
          <ChevronRight className={`h-4 w-4 ml-1 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
        </button>
      </div>

      {/* 展开的详细信息 */}
      {isExpanded && (
        <div className="border-t border-gray-100 p-4 space-y-4">
          {/* 匹配偏好 */}
          {isRequest && request?.preferences && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">匹配偏好</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-gray-50 rounded p-2">
                  <span className="text-gray-600">最大距离:</span>
                  <span className="ml-1 font-medium">{(request.preferences.maxDistance / 1000).toFixed(1)}km</span>
                </div>
                <div className="bg-gray-50 rounded p-2">
                  <span className="text-gray-600">组队人数:</span>
                  <span className="ml-1 font-medium">{request.preferences.groupSizePreference}人</span>
                </div>
                <div className="bg-gray-50 rounded p-2">
                  <span className="text-gray-600">安全等级:</span>
                  <span className="ml-1 font-medium">
                    {request.preferences.safetyLevel === 'high' ? '高' :
                     request.preferences.safetyLevel === 'medium' ? '中' : '低'}
                  </span>
                </div>
                {request.preferences.genderPreference !== 'any' && (
                  <div className="bg-gray-50 rounded p-2">
                    <span className="text-gray-600">性别偏好:</span>
                    <span className="ml-1 font-medium">
                      {request.preferences.genderPreference === 'male' ? '男性' : '女性'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 兴趣标签 */}
          {isRequest && request?.preferences.interests && request.preferences.interests.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">兴趣爱好</h4>
              <div className="flex flex-wrap gap-1">
                {request.preferences.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 其他用户信息（匹配情况） */}
          {match && otherUsers.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">同行伙伴</h4>
              <div className="space-y-2">
                {otherUsers.map((user, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {user.name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span className="text-xs text-gray-600">4.5</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onViewProfile?.(user.id)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      查看
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 时间线（匹配情况） */}
          {match && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">进度时间线</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-xs">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">
                    {match.createdAt.toLocaleString('zh-CN')} - 匹配成功
                  </span>
                </div>
                {match.status === 'confirmed' && (
                  <div className="flex items-center space-x-2 text-xs">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-600">双方已确认</span>
                  </div>
                )}
                {match.completedAt && (
                  <div className="flex items-center space-x-2 text-xs">
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                    <span className="text-gray-600">
                      {match.completedAt.toLocaleString('zh-CN')} - 已完成
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 操作按钮 */}
      <div className="border-t border-gray-100 p-4">
        <div className="flex space-x-2">
          {isRequest && (
            <button
              onClick={onConnect}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
            >
              <UserCheck className="h-4 w-4" />
              <span>申请同行</span>
            </button>
          )}

          {match && match.chatRoomId && (
            <button
              onClick={onStartChat}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-1"
            >
              <MessageCircle className="h-4 w-4" />
              <span>开始聊天</span>
            </button>
          )}

          <button
            onClick={() => onViewProfile?.(primaryUser?.id || '')}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center space-x-1"
          >
            <Shield className="h-4 w-4" />
            <span>查看资料</span>
          </button>
        </div>
      </div>
    </div>
  );
}