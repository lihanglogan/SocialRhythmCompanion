'use client';

import { useState } from 'react';
import { useProfileStore } from '@/lib/stores/profileStore';
import { cn } from '@/lib/utils';
import { 
  Users,
  UserPlus,
  MessageCircle,
  Heart,
  Share2,
  Crown,
  Star,
  Award,
  Calendar,
  MapPin,
  Clock,
  Search,
  Filter,
  MoreHorizontal,
  UserCheck,
  UserX,
  Send,
  Gift,
  Zap,
  TrendingUp
} from 'lucide-react';

interface Friend {
  id: string;
  name: string;
  avatar: string;
  level: number;
  status: 'online' | 'offline' | 'away';
  lastSeen?: Date;
  mutualFriends: number;
  reputationScore: number;
  badges: string[];
}

interface FriendRequest {
  id: string;
  from: Friend;
  message?: string;
  timestamp: Date;
  mutualFriends: number;
}

interface CommunityActivity {
  id: string;
  type: 'like' | 'comment' | 'share' | 'achievement' | 'visit';
  user: Friend;
  content: string;
  timestamp: Date;
  location?: string;
  likes: number;
  comments: number;
}

export function SocialFeatures() {
  const { socialData, sendFriendRequest, acceptFriendRequest, blockUser } = useProfileStore();
  
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'community' | 'leaderboard'>('friends');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'offline'>('all');
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [newFriendMessage, setNewFriendMessage] = useState('');

  // 模拟数据
  const mockFriends: Friend[] = [
    {
      id: '1',
      name: '张小明',
      avatar: '👨‍💼',
      level: 15,
      status: 'online',
      mutualFriends: 8,
      reputationScore: 850,
      badges: ['早起达人', '探索者', '热心助人']
    },
    {
      id: '2',
      name: '李小红',
      avatar: '👩‍🎨',
      level: 12,
      status: 'away',
      lastSeen: new Date('2024-01-15T10:30:00'),
      mutualFriends: 5,
      reputationScore: 720,
      badges: ['美食家', '摄影师']
    },
    {
      id: '3',
      name: '王大力',
      avatar: '👨‍🏫',
      level: 18,
      status: 'offline',
      lastSeen: new Date('2024-01-14T18:45:00'),
      mutualFriends: 12,
      reputationScore: 950,
      badges: ['资深用户', '社区贡献者', '导师']
    }
  ];

  const mockRequests: FriendRequest[] = [
    {
      id: '1',
      from: {
        id: '4',
        name: '陈小华',
        avatar: '👩‍💻',
        level: 8,
        status: 'online',
        mutualFriends: 3,
        reputationScore: 580,
        badges: ['新手']
      },
      message: '你好！我们在同一个地方经常遇到，想加个好友互相交流',
      timestamp: new Date('2024-01-15T09:20:00'),
      mutualFriends: 3
    },
    {
      id: '2',
      from: {
        id: '5',
        name: '刘志强',
        avatar: '👨‍🚀',
        level: 10,
        status: 'offline',
        mutualFriends: 1,
        reputationScore: 650,
        badges: ['运动达人']
      },
      timestamp: new Date('2024-01-14T16:15:00'),
      mutualFriends: 1
    }
  ];

  const mockActivities: CommunityActivity[] = [
    {
      id: '1',
      type: 'achievement',
      user: mockFriends[0],
      content: '获得了"连续签到30天"成就',
      timestamp: new Date('2024-01-15T11:30:00'),
      likes: 15,
      comments: 3
    },
    {
      id: '2',
      type: 'visit',
      user: mockFriends[1],
      content: '在三里屯太古里发现了一家很棒的咖啡店',
      location: '三里屯太古里',
      timestamp: new Date('2024-01-15T10:15:00'),
      likes: 8,
      comments: 2
    },
    {
      id: '3',
      type: 'like',
      user: mockFriends[2],
      content: '点赞了你的上报：朝阳公园人流适中，很适合散步',
      timestamp: new Date('2024-01-15T09:45:00'),
      likes: 5,
      comments: 1
    }
  ];

  const mockLeaderboard = [
    { rank: 1, user: mockFriends[2], score: 950, change: '+15' },
    { rank: 2, user: mockFriends[0], score: 850, change: '+8' },
    { rank: 3, user: mockFriends[1], score: 720, change: '-2' },
    { rank: 4, user: { ...mockFriends[0], name: '你', id: 'current' }, score: 680, change: '+12' }
  ];

  const filteredFriends = mockFriends.filter(friend => {
    const matchesSearch = friend.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || friend.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: Friend['status']) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-400';
    }
  };

  const getStatusText = (status: Friend['status'], lastSeen?: Date) => {
    switch (status) {
      case 'online':
        return '在线';
      case 'away':
        return '离开';
      case 'offline':
        return lastSeen ? `${lastSeen.toLocaleDateString()} 最后在线` : '离线';
    }
  };

  const getActivityIcon = (type: CommunityActivity['type']) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-red-500" />;
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'share':
        return <Share2 className="w-4 h-4 text-green-500" />;
      case 'achievement':
        return <Award className="w-4 h-4 text-yellow-500" />;
      case 'visit':
        return <MapPin className="w-4 h-4 text-purple-500" />;
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await acceptFriendRequest(requestId);
      console.log('好友请求已接受');
    } catch (error) {
      console.error('接受好友请求失败:', error);
    }
  };

  const handleSendFriendRequest = async (userId: string) => {
    try {
      await sendFriendRequest(userId, newFriendMessage);
      setShowAddFriend(false);
      setNewFriendMessage('');
      console.log('好友请求已发送');
    } catch (error) {
      console.error('发送好友请求失败:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* 标签导航 */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        {[
          { id: 'friends', label: '好友', icon: Users, count: mockFriends.length },
          { id: 'requests', label: '请求', icon: UserPlus, count: mockRequests.length },
          { id: 'community', label: '动态', icon: MessageCircle, count: mockActivities.length },
          { id: 'leaderboard', label: '排行榜', icon: Crown }
        ].map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as typeof activeTab)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
              activeTab === id
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
            {count !== undefined && (
              <span className={cn(
                "px-2 py-0.5 rounded-full text-xs",
                activeTab === id ? "bg-blue-100 text-blue-600" : "bg-gray-200 text-gray-600"
              )}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 好友列表 */}
      {activeTab === 'friends' && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="搜索好友..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部状态</option>
              <option value="online">在线</option>
              <option value="offline">离线</option>
            </select>
            <button
              onClick={() => setShowAddFriend(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              添加好友
            </button>
          </div>

          <div className="grid gap-4">
            {filteredFriends.map((friend) => (
              <div key={friend.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="relative">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-2xl">
                    {friend.avatar}
                  </div>
                  <div className={cn(
                    "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white",
                    getStatusColor(friend.status)
                  )}></div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{friend.name}</h3>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Crown className="w-3 h-3" />
                      <span className="text-xs">Lv.{friend.level}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {getStatusText(friend.status, friend.lastSeen)}
                  </p>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                    <span>共同好友: {friend.mutualFriends}</span>
                    <span>信誉: {friend.reputationScore}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {friend.badges.map((badge, index) => (
                      <span key={index} className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded">
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
                    <MessageCircle className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-green-600 transition-colors">
                    <Gift className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-gray-800 transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 好友请求 */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">好友请求</h3>
            <span className="text-sm text-gray-600">{mockRequests.length} 个待处理</span>
          </div>

          {mockRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <UserPlus className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>暂无好友请求</p>
            </div>
          ) : (
            <div className="space-y-4">
              {mockRequests.map((request) => (
                <div key={request.id} className="p-4 border rounded-lg">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-2xl">
                      {request.from.avatar}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{request.from.name}</h4>
                        <div className="flex items-center gap-1 text-yellow-500">
                          <Crown className="w-3 h-3" />
                          <span className="text-xs">Lv.{request.from.level}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                        <span>共同好友: {request.mutualFriends}</span>
                        <span>信誉: {request.from.reputationScore}</span>
                        <span>{request.timestamp.toLocaleDateString()}</span>
                      </div>
                      
                      {request.message && (
                        <p className="text-sm text-gray-600 mt-2 p-2 bg-gray-50 rounded">
                          "{request.message}"
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-1 mt-2">
                        {request.from.badges.map((badge, index) => (
                          <span key={index} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                            {badge}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => handleAcceptRequest(request.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <UserCheck className="w-4 h-4" />
                      接受
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors">
                      <UserX className="w-4 h-4" />
                      拒绝
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 社区动态 */}
      {activeTab === 'community' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">社区动态</h3>
            <button className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              <Filter className="w-4 h-4" />
              筛选
            </button>
          </div>

          <div className="space-y-4">
            {mockActivities.map((activity) => (
              <div key={activity.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-lg">
                    {activity.user.avatar}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {getActivityIcon(activity.type)}
                      <span className="font-medium">{activity.user.name}</span>
                      <span className="text-sm text-gray-600">{activity.content}</span>
                    </div>
                    
                    {activity.location && (
                      <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                        <MapPin className="w-3 h-3" />
                        {activity.location}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {activity.timestamp.toLocaleTimeString()}
                      </div>
                      <button className="flex items-center gap-1 hover:text-red-500 transition-colors">
                        <Heart className="w-3 h-3" />
                        {activity.likes}
                      </button>
                      <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                        <MessageCircle className="w-3 h-3" />
                        {activity.comments}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 排行榜 */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">本周排行榜</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <TrendingUp className="w-4 h-4" />
              每周一更新
            </div>
          </div>

          <div className="space-y-3">
            {mockLeaderboard.map((entry, index) => (
              <div
                key={entry.user.id}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-lg transition-colors",
                  entry.user.id === 'current' ? "bg-blue-50 border border-blue-200" : "bg-gray-50"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm",
                  entry.rank === 1 ? "bg-yellow-500 text-white" :
                  entry.rank === 2 ? "bg-gray-400 text-white" :
                  entry.rank === 3 ? "bg-amber-600 text-white" :
                  "bg-gray-200 text-gray-600"
                )}>
                  {entry.rank}
                </div>

                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-lg">
                  {entry.user.avatar || '👤'}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{entry.user.name}</span>
                    {entry.rank <= 3 && (
                      <Crown className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    信誉分: {entry.score}
                  </div>
                </div>

                <div className={cn(
                  "flex items-center gap-1 text-sm font-medium",
                  entry.change.startsWith('+') ? "text-green-600" : "text-red-600"
                )}>
                  {entry.change.startsWith('+') ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingUp className="w-3 h-3 transform rotate-180" />
                  )}
                  {entry.change}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-blue-600" />
              <div>
                <h4 className="font-medium text-blue-900">提升排名小贴士</h4>
                <p className="text-sm text-blue-700 mt-1">
                  多参与社区活动、准确上报信息、帮助其他用户可以提升您的信誉分数
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 添加好友弹窗 */}
      {showAddFriend && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <UserPlus className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold">添加好友</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">搜索用户</label>
                <input
                  type="text"
                  placeholder="输入用户名或ID"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">附加消息（可选）</label>
                <textarea
                  value={newFriendMessage}
                  onChange={(e) => setNewFriendMessage(e.target.value)}
                  placeholder="介绍一下自己..."
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddFriend(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleSendFriendRequest('new-user')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Send className="w-4 h-4" />
                发送请求
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}