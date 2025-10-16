'use client';

import { useState } from 'react';
import { useUserStore } from '@/lib/stores/userStore';
import { useProfileStore } from '@/lib/stores/profileStore';
import { cn } from '@/lib/utils';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit2, 
  Save, 
  X,
  Camera,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react';

export function UserInfo() {
  const { user, updateUser } = useUserStore();
  const { settings, updateSettings } = useProfileStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: '热爱生活，享受社交节奏的智能伴侣用户 🎯',
    location: user?.preferences?.location?.city || '',
    birthDate: '1990-01-01'
  });

  if (!user) return null;

  const handleSave = async () => {
    try {
      // 更新用户信息
      await updateUser({
        ...user,
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        preferences: {
          ...user.preferences,
          location: {
            ...user.preferences?.location,
            city: editForm.location
          }
        }
      });
      setIsEditing(false);
    } catch (error) {
      console.error('更新用户信息失败:', error);
    }
  };

  const handleCancel = () => {
    setEditForm({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      bio: '热爱生活，享受社交节奏的智能伴侣用户 🎯',
      location: user?.preferences?.location?.city || '',
      birthDate: '1990-01-01'
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* 基本信息卡片 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            基本信息
          </h3>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
            >
              <Edit2 className="h-4 w-4" />
              <span>编辑</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSave}
                className="flex items-center space-x-1 px-3 py-1 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>保存</span>
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center space-x-1 px-3 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                <X className="h-4 w-4" />
                <span>取消</span>
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 头像和昵称 */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>
                {isEditing && (
                  <button className="absolute inset-0 rounded-full bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Camera className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              <div className="flex-1">
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full text-xl font-semibold bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-primary-500 outline-none text-gray-900 dark:text-white"
                    placeholder="输入昵称"
                  />
                ) : (
                  <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {user.name}
                  </h4>
                )}
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      className="w-full bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-primary-500 outline-none"
                      placeholder="个人简介"
                    />
                  ) : (
                    editForm.bio
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* 邮箱 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Mail className="h-4 w-4 inline mr-2" />
              邮箱地址
            </label>
            {isEditing ? (
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="输入邮箱地址"
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-md text-gray-900 dark:text-white">
                {user.email || '未设置'}
              </div>
            )}
          </div>

          {/* 手机号 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Phone className="h-4 w-4 inline mr-2" />
              手机号码
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="输入手机号码"
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-md text-gray-900 dark:text-white">
                {user.phone || '未设置'}
              </div>
            )}
          </div>

          {/* 位置 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <MapPin className="h-4 w-4 inline mr-2" />
              所在城市
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editForm.location}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="输入所在城市"
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-md text-gray-900 dark:text-white">
                {user.preferences?.location?.city || '未设置'}
              </div>
            )}
          </div>

          {/* 生日 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="h-4 w-4 inline mr-2" />
              生日
            </label>
            {isEditing ? (
              <input
                type="date"
                value={editForm.birthDate}
                onChange={(e) => setEditForm({ ...editForm, birthDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-md text-gray-900 dark:text-white">
                {editForm.birthDate}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 隐私设置卡片 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            隐私设置
          </h3>
        </div>

        <div className="space-y-4">
          {/* 个人资料可见性 */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-gray-500" />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">个人资料可见性</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">控制其他用户能看到的信息</div>
              </div>
            </div>
            <button
              onClick={() => updateSettings({ 
                ...settings, 
                privacy: { 
                  ...settings?.privacy, 
                  profileVisibility: settings?.privacy?.profileVisibility === 'public' ? 'friends' : 'public' 
                } 
              })}
              className={cn(
                "flex items-center space-x-2 px-3 py-1 rounded-md transition-colors",
                settings?.privacy?.profileVisibility === 'public'
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
              )}
            >
              {settings?.privacy?.profileVisibility === 'public' ? (
                <>
                  <Eye className="h-4 w-4" />
                  <span>公开</span>
                </>
              ) : (
                <>
                  <EyeOff className="h-4 w-4" />
                  <span>仅好友</span>
                </>
              )}
            </button>
          </div>

          {/* 位置信息共享 */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-gray-500" />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">位置信息共享</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">允许其他用户查看你的位置</div>
              </div>
            </div>
            <button
              onClick={() => updateSettings({ 
                ...settings, 
                privacy: { 
                  ...settings?.privacy, 
                  shareLocation: !settings?.privacy?.shareLocation 
                } 
              })}
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                settings?.privacy?.shareLocation 
                  ? "bg-primary-600" 
                  : "bg-gray-300 dark:bg-gray-600"
              )}
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  settings?.privacy?.shareLocation ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
          </div>

          {/* 在线状态显示 */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="h-5 w-5 rounded-full bg-green-500"></div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">在线状态显示</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">让其他用户知道你是否在线</div>
              </div>
            </div>
            <button
              onClick={() => updateSettings({ 
                ...settings, 
                privacy: { 
                  ...settings?.privacy, 
                  showOnlineStatus: !settings?.privacy?.showOnlineStatus 
                } 
              })}
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                settings?.privacy?.showOnlineStatus 
                  ? "bg-primary-600" 
                  : "bg-gray-300 dark:bg-gray-600"
              )}
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  settings?.privacy?.showOnlineStatus ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 账户统计 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          账户统计
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {Math.floor(Math.random() * 100) + 50}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">活跃天数</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {Math.floor(Math.random() * 500) + 100}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">总上报数</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {Math.floor(Math.random() * 50) + 10}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">成功匹配</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              4.8
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">用户评分</div>
          </div>
        </div>
      </div>
    </div>
  );
}