'use client';

import { useState } from 'react';
import { useUserStore } from '@/lib/stores/userStore';
import { useProfileStore } from '@/lib/stores/profileStore';
import { cn } from '@/lib/utils';
import { 
  User, 
  Camera, 
  Edit2, 
  Star, 
  Trophy, 
  MapPin,
  Calendar,
  Shield,
  Crown
} from 'lucide-react';

export function ProfileHeader() {
  const { user } = useUserStore();
  const { userStats } = useProfileStore();
  const [isEditing, setIsEditing] = useState(false);

  if (!user) return null;

  // 计算用户等级
  const getUserLevel = (reputationScore: number) => {
    if (reputationScore >= 1000) return { level: 'VIP', icon: Crown, color: 'text-yellow-500' };
    if (reputationScore >= 500) return { level: '专家', icon: Trophy, color: 'text-purple-500' };
    if (reputationScore >= 200) return { level: '达人', icon: Star, color: 'text-blue-500' };
    return { level: '新手', icon: User, color: 'text-gray-500' };
  };

  const userLevel = getUserLevel(userStats?.reputationScore || 0);
  const LevelIcon = userLevel.icon;

  return (
    <div className="relative">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 via-purple-500/10 to-pink-500/10 rounded-t-lg" />
      
      <div className="relative p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          {/* 用户基本信息 */}
          <div className="flex items-center space-x-4">
            {/* 头像 */}
            <div className="relative">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name}
                    className="h-20 w-20 rounded-full object-cover"
                  />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              
              {/* 等级徽章 */}
              <div className={cn(
                "absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-800",
                userLevel.color
              )}>
                <LevelIcon className="h-4 w-4" />
              </div>
              
              {/* 编辑头像按钮 */}
              <button className="absolute inset-0 rounded-full bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Camera className="h-5 w-5" />
              </button>
            </div>

            {/* 用户信息 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white truncate">
                  {user.name}
                </h1>
                <div className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium bg-white dark:bg-gray-800 shadow-sm",
                  userLevel.color
                )}>
                  {userLevel.level}
                </div>
              </div>
              
              <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{user.preferences?.location?.city || '未设置位置'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>加入 {userStats?.activeDays || 0} 天</span>
                </div>
              </div>

              {/* 用户简介 */}
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 max-w-md">
                热爱生活，享受社交节奏的智能伴侣用户 🎯
              </p>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Edit2 className="h-4 w-4" />
              <span>编辑资料</span>
            </button>
            
            <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
              <Shield className="h-4 w-4" />
              <span>隐私设置</span>
            </button>
          </div>
        </div>

        {/* 关键统计数据 */}
        {userStats && (
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 text-center backdrop-blur-sm">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {userStats.reputationScore}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">信誉分</div>
            </div>
            
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 text-center backdrop-blur-sm">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {userStats.totalReports}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">总上报</div>
            </div>
            
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 text-center backdrop-blur-sm">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {userStats.totalMatches}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">总匹配</div>
            </div>
            
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 text-center backdrop-blur-sm">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                #{userStats.communityRank}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">社区排名</div>
            </div>
          </div>
        )}

        {/* 进度条 - 下一等级 */}
        {userStats && (
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>等级进度</span>
              <span>{userStats.reputationScore}/1000</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-primary-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((userStats.reputationScore / 1000) * 100, 100)}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              距离下一等级还需 {Math.max(0, 1000 - userStats.reputationScore)} 分
            </div>
          </div>
        )}
      </div>

      {/* 编辑模态框 */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              编辑个人资料
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  昵称
                </label>
                <input
                  type="text"
                  defaultValue={user.name}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  个人简介
                </label>
                <textarea
                  rows={3}
                  defaultValue="热爱生活，享受社交节奏的智能伴侣用户 🎯"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}