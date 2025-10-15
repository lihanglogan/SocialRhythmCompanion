'use client';

import { useState } from 'react';
import { useMatchStore } from '@/lib/stores/matchStore';
import { 
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  Filter,
  Search,
  Star,
  MessageCircle,
  Eye,
  ChevronRight,
  User,
  Heart,
  Bookmark,
  Share2
} from 'lucide-react';
import { PlannedMatch as PlannedMatchType, PlaceCategory, CrowdLevel } from '@/types';

export function PlannedMatch() {
  const [activeTab, setActiveTab] = useState<'browse' | 'create'>('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<PlaceCategory | 'all'>('all');
  const [filterTimeRange, setFilterTimeRange] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [sortBy, setSortBy] = useState<'time' | 'popularity' | 'distance'>('time');

  const { plannedMatches, createPlannedMatch, joinPlannedMatch, isLoading } = useMatchStore();

  // 模拟计划同行数据
  const mockPlannedMatches: PlannedMatchType[] = [
    {
      id: '1',
      organizer: {
        id: 'user1',
        name: '张小明',
        avatar: '/avatars/user1.jpg',
        rating: 4.8,
        completedMatches: 15
      },
      place: {
        id: 'place1',
        name: '三里屯太古里',
        address: '朝阳区三里屯路19号',
        coordinates: { lat: 39.9365, lng: 116.4477 },
        category: PlaceCategory.SHOPPING,
        currentStatus: {
          isOpen: true,
          queueLength: 5,
          estimatedWaitTime: 10,
          lastUpdated: new Date(),
          crowdDensity: 0.6
        },
        waitTime: 10,
        crowdLevel: CrowdLevel.MEDIUM,
        noiseLevel: NoiseLevel.MODERATE,
        accessibility: {
          wheelchairAccessible: true,
          hasElevator: true,
          hasRamp: true,
          hasAccessibleParking: true,
          hasAccessibleRestroom: true
        },
        openHours: {
          monday: [{ open: '10:00', close: '22:00' }],
          tuesday: [{ open: '10:00', close: '22:00' }],
          wednesday: [{ open: '10:00', close: '22:00' }],
          thursday: [{ open: '10:00', close: '22:00' }],
          friday: [{ open: '10:00', close: '22:00' }],
          saturday: [{ open: '10:00', close: '22:00' }],
          sunday: [{ open: '10:00', close: '22:00' }]
        }
      },
      plannedTime: new Date('2024-12-20T14:00:00'),
      maxParticipants: 4,
      currentParticipants: 2,
      description: '周末逛街购物，寻找志同道合的朋友一起探索三里屯的时尚潮流！',
      tags: ['购物', '时尚', '拍照', '美食'],
      requirements: {
        ageRange: { min: 20, max: 35 },
        genderPreference: 'any',
        interests: ['购物', '时尚']
      },
      status: 'active',
      createdAt: new Date('2024-12-15T10:00:00'),
      participants: [
        {
          id: 'user2',
          name: '李小红',
          avatar: '/avatars/user2.jpg',
          joinedAt: new Date('2024-12-16T09:00:00')
        }
      ],
      viewCount: 28,
      likeCount: 12,
      isLiked: false,
      isBookmarked: false
    },
    {
      id: '2',
      organizer: {
        id: 'user3',
        name: '王大强',
        avatar: '/avatars/user3.jpg',
        rating: 4.6,
        completedMatches: 8
      },
      place: {
        id: 'place2',
        name: '朝阳公园',
        address: '朝阳区朝阳公园南路1号',
        coordinates: { lat: 39.9365, lng: 116.4477 },
        category: PlaceCategory.OTHER,
        currentStatus: {
          crowdLevel: CrowdLevel.LOW,
          waitTime: 0,
          lastUpdated: new Date()
        },
        waitTime: 0,
        noiseLevel: 'low',
        accessibility: {
          wheelchairAccessible: true,
          hasElevator: false,
          hasParking: true
        },
        openHours: {
          monday: { open: '06:00', close: '21:00' },
          tuesday: { open: '06:00', close: '21:00' },
          wednesday: { open: '06:00', close: '21:00' },
          thursday: { open: '06:00', close: '21:00' },
          friday: { open: '06:00', close: '21:00' },
          saturday: { open: '06:00', close: '21:00' },
          sunday: { open: '06:00', close: '21:00' }
        }
      },
      plannedTime: new Date('2024-12-21T07:00:00'),
      maxParticipants: 6,
      currentParticipants: 3,
      description: '晨跑健身团，一起享受清晨的新鲜空气和运动的快乐！',
      tags: ['跑步', '健身', '晨练', '自然'],
      requirements: {
        ageRange: { min: 18, max: 50 },
        genderPreference: 'any',
        interests: ['运动', '健身']
      },
      status: 'active',
      createdAt: new Date('2024-12-14T18:00:00'),
      participants: [
        {
          id: 'user4',
          name: '赵小丽',
          avatar: '/avatars/user4.jpg',
          joinedAt: new Date('2024-12-15T08:00:00')
        },
        {
          id: 'user5',
          name: '孙大海',
          avatar: '/avatars/user5.jpg',
          joinedAt: new Date('2024-12-16T19:00:00')
        }
      ],
      viewCount: 45,
      likeCount: 18,
      isLiked: true,
      isBookmarked: true
    }
  ];

  // 筛选和排序计划
  const filteredMatches = mockPlannedMatches
    .filter(match => {
      // 搜索筛选
      if (searchQuery && !match.place.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !match.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // 类别筛选
      if (filterCategory !== 'all' && match.place.category !== filterCategory) {
        return false;
      }
      
      // 时间筛选
      const now = new Date();
      const matchTime = new Date(match.plannedTime);
      switch (filterTimeRange) {
        case 'today':
          return matchTime.toDateString() === now.toDateString();
        case 'week':
          const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          return matchTime >= now && matchTime <= weekFromNow;
        case 'month':
          const monthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          return matchTime >= now && matchTime <= monthFromNow;
        default:
          return true;
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'time':
          return new Date(a.plannedTime).getTime() - new Date(b.plannedTime).getTime();
        case 'popularity':
          return (b.likeCount + b.viewCount) - (a.likeCount + a.viewCount);
        case 'distance':
          // 简化的距离排序，实际应该基于用户位置
          return 0;
        default:
          return 0;
      }
    });

  const handleJoinMatch = async (matchId: string) => {
    try {
      await joinPlannedMatch(matchId);
    } catch (error) {
      console.error('加入计划失败:', error);
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '今天';
    if (diffDays === 1) return '明天';
    if (diffDays <= 7) return `${diffDays}天后`;
    
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <Calendar className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">计划同行</h2>
        <p className="text-gray-600">提前规划，找到最佳的同行时机</p>
      </div>

      {/* 标签切换 */}
      <div className="flex bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('browse')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'browse'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          浏览计划
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'create'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          创建计划
        </button>
      </div>

      {/* 浏览计划 */}
      {activeTab === 'browse' && (
        <div className="space-y-4">
          {/* 搜索和筛选 */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* 搜索框 */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索地点或活动..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* 筛选器 */}
              <div className="flex gap-2">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value as PlaceCategory | 'all')}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">所有类别</option>
                  <option value={PlaceCategory.RESTAURANT}>餐厅</option>
                  <option value={PlaceCategory.SHOPPING}>购物</option>
                  <option value={PlaceCategory.ENTERTAINMENT}>娱乐</option>
                  <option value={PlaceCategory.OTHER}>其他</option>
                </select>

                <select
                  value={filterTimeRange}
                  onChange={(e) => setFilterTimeRange(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">所有时间</option>
                  <option value="today">今天</option>
                  <option value="week">本周</option>
                  <option value="month">本月</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="time">按时间排序</option>
                  <option value="popularity">按热度排序</option>
                  <option value="distance">按距离排序</option>
                </select>
              </div>
            </div>
          </div>

          {/* 计划列表 */}
          <div className="space-y-4">
            {filteredMatches.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">暂无计划</h3>
                <p className="text-gray-600">没有找到符合条件的计划，试试调整筛选条件或创建新计划</p>
              </div>
            ) : (
              filteredMatches.map((match) => (
                <div key={match.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  {/* 计划头部 */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{match.organizer.name}</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span>{match.organizer.rating}</span>
                          <span>•</span>
                          <span>{match.organizer.completedMatches}次同行</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        className={`p-2 rounded-full transition-colors ${
                          match.isLiked ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${match.isLiked ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        className={`p-2 rounded-full transition-colors ${
                          match.isBookmarked ? 'text-blue-500 bg-blue-50' : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50'
                        }`}
                      >
                        <Bookmark className={`h-4 w-4 ${match.isBookmarked ? 'fill-current' : ''}`} />
                      </button>
                      <button className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
                        <Share2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* 地点信息 */}
                  <div className="flex items-center space-x-2 mb-3">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-gray-900">{match.place.name}</span>
                    <span className="text-sm text-gray-600">• {match.place.address}</span>
                  </div>

                  {/* 时间信息 */}
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{formatDate(match.plannedTime)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{formatTime(match.plannedTime)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {match.currentParticipants}/{match.maxParticipants}人
                      </span>
                    </div>
                  </div>

                  {/* 描述 */}
                  <p className="text-gray-700 mb-3">{match.description}</p>

                  {/* 标签 */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {match.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* 底部操作 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>{match.viewCount}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart className="h-4 w-4" />
                        <span>{match.likeCount}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="h-4 w-4" />
                        <span>讨论</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                        查看详情
                      </button>
                      <button
                        onClick={() => handleJoinMatch(match.id)}
                        disabled={match.currentParticipants >= match.maxParticipants || isLoading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {match.currentParticipants >= match.maxParticipants ? '已满员' : '加入计划'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 创建计划 */}
      {activeTab === 'create' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-center py-12">
            <Plus className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">创建新计划</h3>
            <p className="text-gray-600 mb-6">
              发起一个同行计划，邀请其他用户加入你的活动
            </p>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              开始创建计划
            </button>
          </div>
        </div>
      )}
    </div>
  );
}