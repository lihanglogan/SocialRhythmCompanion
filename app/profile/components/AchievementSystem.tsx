'use client';

import { useState, useEffect } from 'react';
import { useProfileStore } from '@/lib/stores/profileStore';
import { cn } from '@/lib/utils';
import { 
  Trophy, 
  Award, 
  Star, 
  Crown, 
  Target, 
  Zap,
  Users,
  MapPin,
  Calendar,
  TrendingUp,
  Lock,
  CheckCircle,
  Progress,
  Gift
} from 'lucide-react';

type AchievementCategory = 'all' | 'social' | 'exploration' | 'contribution' | 'milestone';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  progress: number;
  target: number;
  unlocked: boolean;
  unlockedAt?: Date;
  reward: {
    points: number;
    title?: string;
  };
}

export function AchievementSystem() {
  const { achievements, userStats, isLoading, loadAchievements } = useProfileStore();
  const [activeCategory, setActiveCategory] = useState<AchievementCategory>('all');
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);

  useEffect(() => {
    loadAchievements();
  }, [loadAchievements]);

  const categories = [
    { key: 'all' as const, label: '全部', icon: Trophy, count: 24 },
    { key: 'social' as const, label: '社交', icon: Users, count: 8 },
    { key: 'exploration' as const, label: '探索', icon: MapPin, count: 6 },
    { key: 'contribution' as const, label: '贡献', icon: Star, count: 7 },
    { key: 'milestone' as const, label: '里程碑', icon: Crown, count: 3 }
  ];

  // 模拟成就数据
  const mockBadges: Badge[] = [
    {
      id: '1',
      name: '初来乍到',
      description: '完成第一次场所访问',
      icon: MapPin,
      category: 'milestone',
      rarity: 'common',
      progress: 1,
      target: 1,
      unlocked: true,
      unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      reward: { points: 10 }
    },
    {
      id: '2',
      name: '社交新手',
      description: '完成第一次成功匹配',
      icon: Users,
      category: 'social',
      rarity: 'common',
      progress: 1,
      target: 1,
      unlocked: true,
      unlockedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      reward: { points: 15 }
    },
    {
      id: '3',
      name: '数据贡献者',
      description: '上报100条场所数据',
      icon: Target,
      category: 'contribution',
      rarity: 'rare',
      progress: userStats?.totalReports || 67,
      target: 100,
      unlocked: false,
      reward: { points: 50, title: '数据专家' }
    },
    {
      id: '4',
      name: '社交达人',
      description: '完成50次成功匹配',
      icon: Star,
      category: 'social',
      rarity: 'epic',
      progress: userStats?.totalMatches || 23,
      target: 50,
      unlocked: false,
      reward: { points: 100, title: '匹配专家' }
    },
    {
      id: '5',
      name: '探索者',
      description: '访问20个不同的场所',
      icon: MapPin,
      category: 'exploration',
      rarity: 'rare',
      progress: 15,
      target: 20,
      unlocked: false,
      reward: { points: 75 }
    },
    {
      id: '6',
      name: '连续活跃',
      description: '连续活跃30天',
      icon: Calendar,
      category: 'milestone',
      rarity: 'epic',
      progress: userStats?.activeDays || 12,
      target: 30,
      unlocked: false,
      reward: { points: 150, title: '活跃用户' }
    },
    {
      id: '7',
      name: '信誉之星',
      description: '信誉分数达到500分',
      icon: Crown,
      category: 'milestone',
      rarity: 'legendary',
      progress: userStats?.reputationScore || 324,
      target: 500,
      unlocked: false,
      reward: { points: 200, title: 'VIP用户' }
    },
    {
      id: '8',
      name: '热心助人',
      description: '帮助其他用户10次',
      icon: Gift,
      category: 'social',
      rarity: 'rare',
      progress: 3,
      target: 10,
      unlocked: false,
      reward: { points: 60 }
    }
  ];

  const filteredBadges = mockBadges.filter(badge => {
    if (activeCategory !== 'all' && badge.category !== activeCategory) {
      return false;
    }
    if (showUnlockedOnly && !badge.unlocked) {
      return false;
    }
    return true;
  });

  const getRarityColor = (rarity: Badge['rarity']) => {
    switch (rarity) {
      case 'common':
        return 'from-gray-400 to-gray-500';
      case 'rare':
        return 'from-blue-400 to-blue-500';
      case 'epic':
        return 'from-purple-400 to-purple-500';
      case 'legendary':
        return 'from-yellow-400 to-yellow-500';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  const getRarityText = (rarity: Badge['rarity']) => {
    const rarityMap = {
      common: '普通',
      rare: '稀有',
      epic: '史诗',
      legendary: '传说'
    };
    return rarityMap[rarity];
  };

  const getRarityTextColor = (rarity: Badge['rarity']) => {
    switch (rarity) {
      case 'common':
        return 'text-gray-600 dark:text-gray-400';
      case 'rare':
        return 'text-blue-600 dark:text-blue-400';
      case 'epic':
        return 'text-purple-600 dark:text-purple-400';
      case 'legendary':
        return 'text-yellow-600 dark:text-yellow-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const unlockedCount = mockBadges.filter(badge => badge.unlocked).length;
  const totalCount = mockBadges.length;
  const completionRate = Math.round((unlockedCount / totalCount) * 100);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 成就概览 */}
      <div className="bg-gradient-to-r from-primary-500 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-2">成就系统</h3>
            <p className="text-primary-100 mb-4">
              解锁成就，获得奖励，展示你的成长历程
            </p>
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-3xl font-bold">{unlockedCount}</div>
                <div className="text-sm text-primary-100">已解锁</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{totalCount}</div>
                <div className="text-sm text-primary-100">总成就</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{completionRate}%</div>
                <div className="text-sm text-primary-100">完成度</div>
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center justify-center w-32 h-32 bg-white/20 rounded-full">
            <Trophy className="h-16 w-16 text-white" />
          </div>
        </div>
        
        {/* 进度条 */}
        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2">
            <span>成就进度</span>
            <span>{unlockedCount}/{totalCount}</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* 筛选选项 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          {categories.map(category => {
            const Icon = category.icon;
            return (
              <button
                key={category.key}
                onClick={() => setActiveCategory(category.key)}
                className={cn(
                  "flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                  activeCategory === category.key
                    ? "bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{category.label}</span>
                <span className={cn(
                  "px-1.5 py-0.5 text-xs rounded-full",
                  activeCategory === category.key
                    ? "bg-primary-200 text-primary-800 dark:bg-primary-800 dark:text-primary-200"
                    : "bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-400"
                )}>
                  {category.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center space-x-2">
          <label className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <input
              type="checkbox"
              checked={showUnlockedOnly}
              onChange={(e) => setShowUnlockedOnly(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
            />
            <span>仅显示已解锁</span>
          </label>
        </div>
      </div>

      {/* 成就网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBadges.map(badge => {
          const Icon = badge.icon;
          const progressPercentage = Math.min((badge.progress / badge.target) * 100, 100);
          
          return (
            <div
              key={badge.id}
              className={cn(
                "relative bg-white dark:bg-gray-800 rounded-lg border-2 p-6 transition-all duration-300 hover:shadow-lg",
                badge.unlocked 
                  ? "border-primary-200 dark:border-primary-800 shadow-md" 
                  : "border-gray-200 dark:border-gray-700"
              )}
            >
              {/* 稀有度标签 */}
              <div className={cn(
                "absolute top-3 right-3 px-2 py-1 text-xs font-medium rounded-full",
                getRarityTextColor(badge.rarity),
                badge.rarity === 'common' && "bg-gray-100 dark:bg-gray-700",
                badge.rarity === 'rare' && "bg-blue-100 dark:bg-blue-900/30",
                badge.rarity === 'epic' && "bg-purple-100 dark:bg-purple-900/30",
                badge.rarity === 'legendary' && "bg-yellow-100 dark:bg-yellow-900/30"
              )}>
                {getRarityText(badge.rarity)}
              </div>

              {/* 成就图标 */}
              <div className="flex items-center justify-center mb-4">
                <div className={cn(
                  "relative p-4 rounded-full bg-gradient-to-br",
                  getRarityColor(badge.rarity),
                  badge.unlocked ? "opacity-100" : "opacity-50"
                )}>
                  <Icon className="h-8 w-8 text-white" />
                  
                  {/* 解锁状态 */}
                  {badge.unlocked ? (
                    <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                  ) : (
                    <div className="absolute -top-1 -right-1 bg-gray-500 rounded-full p-1">
                      <Lock className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* 成就信息 */}
              <div className="text-center mb-4">
                <h4 className={cn(
                  "font-semibold mb-2",
                  badge.unlocked 
                    ? "text-gray-900 dark:text-white" 
                    : "text-gray-600 dark:text-gray-400"
                )}>
                  {badge.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {badge.description}
                </p>

                {/* 奖励信息 */}
                <div className="flex items-center justify-center space-x-2 text-sm">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    +{badge.reward.points} 分
                  </span>
                  {badge.reward.title && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span className="text-primary-600 dark:text-primary-400">
                        {badge.reward.title}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* 进度条 */}
              {!badge.unlocked && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">进度</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {badge.progress}/{badge.target}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={cn(
                        "h-2 rounded-full transition-all duration-500 bg-gradient-to-r",
                        getRarityColor(badge.rarity)
                      )}
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                    还需 {badge.target - badge.progress} 次
                  </div>
                </div>
              )}

              {/* 解锁时间 */}
              {badge.unlocked && badge.unlockedAt && (
                <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-3">
                  解锁于 {badge.unlockedAt.toLocaleDateString('zh-CN')}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 空状态 */}
      {filteredBadges.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            暂无成就
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {showUnlockedOnly ? '还没有解锁任何成就' : '该分类下暂无成就'}
          </p>
        </div>
      )}

      {/* 最近解锁 */}
      {unlockedCount > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Zap className="h-5 w-5 mr-2 text-yellow-500" />
            最近解锁
          </h4>
          
          <div className="space-y-3">
            {mockBadges
              .filter(badge => badge.unlocked)
              .sort((a, b) => (b.unlockedAt?.getTime() || 0) - (a.unlockedAt?.getTime() || 0))
              .slice(0, 3)
              .map(badge => {
                const Icon = badge.icon;
                return (
                  <div key={badge.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className={cn(
                      "p-2 rounded-full bg-gradient-to-br",
                      getRarityColor(badge.rarity)
                    )}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900 dark:text-white">
                        {badge.name}
                      </h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {badge.unlockedAt?.toLocaleDateString('zh-CN')} 解锁
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1 text-sm">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          +{badge.reward.points}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}