'use client';

import { useState } from 'react';
import { useMatchStore } from '@/lib/stores/matchStore';
import { 
  MapPin, 
  Clock, 
  Users, 
  Settings, 
  Search,
  Plus,
  X,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Place, MatchPreferences, PlaceCategory, CrowdLevel } from '@/types';

// 简化的 Place 类型用于模拟搜索结果
interface SearchPlace {
  id: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  category: PlaceCategory;
  rating?: number;
  crowdLevel: CrowdLevel;
  tags?: string[];
}

export function CustomMatch() {
  const [step, setStep] = useState<'place' | 'time' | 'preferences' | 'confirm'>('place');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [placeQuery, setPlaceQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchPlace[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // 时间设置
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [flexibleTime, setFlexibleTime] = useState(15);
  
  // 匹配偏好
  const [preferences, setPreferences] = useState<MatchPreferences>({
    maxDistance: 5000,
    groupSizePreference: 2,
    genderPreference: 'any',
    ageRange: { min: 18, max: 65 },
    safetyLevel: 'medium',
    interests: []
  });
  
  const [message, setMessage] = useState('');
  const [availableInterests] = useState([
    '摄影', '美食', '购物', '运动', '音乐', '艺术', '旅行', '读书',
    '电影', '游戏', '宠物', '健身', '瑜伽', '跑步', '骑行', '登山'
  ]);
  
  const { createMatchRequest, isLoading, error } = useMatchStore();

  // 搜索地点
  const handlePlaceSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // 模拟搜索API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockResults: SearchPlace[] = [
        {
          id: '1',
          name: `${query} - 购物中心`,
          address: `${query}购物中心，朝阳区`,
          coordinates: { lat: 39.9042, lng: 116.4074 },
          category: PlaceCategory.SHOPPING,
          rating: 4.5,
          crowdLevel: CrowdLevel.HIGH,
          tags: ['购物', '美食', '娱乐']
        },
        {
          id: '2',
          name: `${query} - 公园`,
          address: `${query}公园，海淀区`,
          coordinates: { lat: 39.9042, lng: 116.4074 },
          category: PlaceCategory.OTHER,
          rating: 4.3,
          crowdLevel: CrowdLevel.MEDIUM,
          tags: ['休闲', '运动', '自然']
        },
        {
          id: '3',
          name: `${query} - 咖啡厅`,
          address: `${query}咖啡厅，西城区`,
          coordinates: { lat: 39.9042, lng: 116.4074 },
          category: PlaceCategory.RESTAURANT,
          rating: 4.7,
          crowdLevel: CrowdLevel.LOW,
          tags: ['咖啡', '学习', '社交']
        }
      ];
      
      setSearchResults(mockResults);
    } catch (err) {
      console.error('搜索失败:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // 添加兴趣标签
  const addInterest = (interest: string) => {
    if (!preferences.interests.includes(interest)) {
      setPreferences(prev => ({
        ...prev,
        interests: [...prev.interests, interest]
      }));
    }
  };

  // 移除兴趣标签
  const removeInterest = (interest: string) => {
    setPreferences(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  // 提交匹配请求
  const handleSubmit = async () => {
    if (!selectedPlace) return;

    const preferredTime = new Date(`${selectedDate}T${selectedTime}`);
    
    try {
      await createMatchRequest({
        placeId: selectedPlace.id,
        place: selectedPlace,
        preferredTime,
        message,
        flexibleTime,
        maxWaitTime: 30,
        preferences
      });
      
      // 重置表单
      setStep('place');
      setSelectedPlace(null);
      setPlaceQuery('');
      setSelectedDate('');
      setSelectedTime('');
      setMessage('');
    } catch (err) {
      console.error('创建匹配请求失败:', err);
    }
  };

  // 获取明天的日期作为最小值
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
          <Settings className="h-8 w-8 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">定制匹配</h2>
        <p className="text-gray-600">设置详细的匹配条件，找到最合适的同行伙伴</p>
      </div>

      {/* 步骤指示器 */}
      <div className="flex items-center justify-center space-x-4">
        {[
          { key: 'place', label: '选择地点' },
          { key: 'time', label: '设置时间' },
          { key: 'preferences', label: '匹配偏好' },
          { key: 'confirm', label: '确认发布' }
        ].map((s, index) => (
          <div key={s.key} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === s.key 
                ? 'bg-blue-600 text-white' 
                : index < ['place', 'time', 'preferences', 'confirm'].indexOf(step)
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}>
              {index + 1}
            </div>
            <span className={`ml-2 text-sm ${
              step === s.key ? 'text-blue-600 font-medium' : 'text-gray-600'
            }`}>
              {s.label}
            </span>
            {index < 3 && <div className="w-8 h-0.5 bg-gray-200 mx-4" />}
          </div>
        ))}
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">创建失败</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 步骤1: 选择地点 */}
      {step === 'place' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MapPin className="h-5 w-5 text-blue-600 mr-2" />
            选择目的地
          </h3>
          
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={placeQuery}
                onChange={(e) => {
                  setPlaceQuery(e.target.value);
                  handlePlaceSearch(e.target.value);
                }}
                placeholder="搜索地点名称或地址..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-600 animate-spin" />
              )}
            </div>

            {/* 搜索结果 */}
            {searchResults.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {searchResults.map((place) => (
                  <button
                    key={place.id}
                    onClick={() => {
                      setSelectedPlace(place);
                      setSearchResults([]);
                      setPlaceQuery(place.name);
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedPlace?.id === place.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{place.name}</h4>
                        <p className="text-sm text-gray-600">{place.address}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          {place.tags?.map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">评分 {place.rating}</div>
                        <div className="text-xs text-gray-500">
                          拥挤度: {place.crowdLevel}/5
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* 已选择的地点 */}
            {selectedPlace && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-900">已选择: {selectedPlace.name}</h4>
                    <p className="text-sm text-blue-700">{selectedPlace.address}</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedPlace(null);
                      setPlaceQuery('');
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={() => setStep('time')}
              disabled={!selectedPlace}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              下一步
            </button>
          </div>
        </div>
      )}

      {/* 步骤2: 设置时间 */}
      {step === 'time' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="h-5 w-5 text-blue-600 mr-2" />
            设置时间
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                日期
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={getTomorrowDate()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                时间
              </label>
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              时间灵活度: ±{flexibleTime} 分钟
            </label>
            <input
              type="range"
              min="0"
              max="60"
              step="5"
              value={flexibleTime}
              onChange={(e) => setFlexibleTime(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>准时</span>
              <span>1小时内</span>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={() => setStep('place')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              上一步
            </button>
            <button
              onClick={() => setStep('preferences')}
              disabled={!selectedDate || !selectedTime}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              下一步
            </button>
          </div>
        </div>
      )}

      {/* 步骤3: 匹配偏好 */}
      {step === 'preferences' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="h-5 w-5 text-blue-600 mr-2" />
            匹配偏好
          </h3>

          <div className="space-y-6">
            {/* 距离设置 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                最大距离: {(preferences.maxDistance / 1000).toFixed(1)}km
              </label>
              <input
                type="range"
                min="1000"
                max="20000"
                step="1000"
                value={preferences.maxDistance}
                onChange={(e) => setPreferences(prev => ({ ...prev, maxDistance: Number(e.target.value) }))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1km</span>
                <span>20km</span>
              </div>
            </div>

            {/* 组队人数 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                期望组队人数
              </label>
              <select
                value={preferences.groupSizePreference}
                onChange={(e) => setPreferences(prev => ({ ...prev, groupSizePreference: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={2}>2人（1对1）</option>
                <option value={3}>3人小组</option>
                <option value={4}>4人小组</option>
                <option value={5}>5人以上</option>
              </select>
            </div>

            {/* 性别偏好 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                性别偏好
              </label>
              <div className="flex space-x-4">
                {[
                  { value: 'any', label: '不限' },
                  { value: 'male', label: '仅限男性' },
                  { value: 'female', label: '仅限女性' }
                ].map((option) => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value={option.value}
                      checked={preferences.genderPreference === option.value}
                      onChange={(e) => setPreferences(prev => ({ 
                        ...prev, 
                        genderPreference: e.target.value as 'any' | 'male' | 'female'
                      }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 年龄范围 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                年龄范围: {preferences.ageRange.min} - {preferences.ageRange.max} 岁
              </label>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <input
                    type="range"
                    min="18"
                    max="65"
                    value={preferences.ageRange.min}
                    onChange={(e) => setPreferences(prev => ({ 
                      ...prev, 
                      ageRange: { ...prev.ageRange, min: Number(e.target.value) }
                    }))}
                    className="w-full"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="range"
                    min="18"
                    max="65"
                    value={preferences.ageRange.max}
                    onChange={(e) => setPreferences(prev => ({ 
                      ...prev, 
                      ageRange: { ...prev.ageRange, max: Number(e.target.value) }
                    }))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* 安全等级 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                安全等级要求
              </label>
              <select
                value={preferences.safetyLevel}
                onChange={(e) => setPreferences(prev => ({ 
                  ...prev, 
                  safetyLevel: e.target.value as 'low' | 'medium' | 'high'
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">低 - 快速匹配</option>
                <option value="medium">中 - 平衡安全与效率</option>
                <option value="high">高 - 严格身份验证</option>
              </select>
            </div>

            {/* 兴趣标签 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                兴趣爱好
              </label>
              
              {/* 已选择的兴趣 */}
              {preferences.interests.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {preferences.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {interest}
                      <button
                        onClick={() => removeInterest(interest)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* 可选择的兴趣 */}
              <div className="flex flex-wrap gap-2">
                {availableInterests
                  .filter(interest => !preferences.interests.includes(interest))
                  .map((interest, index) => (
                    <button
                      key={index}
                      onClick={() => addInterest(interest)}
                      className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {interest}
                    </button>
                  ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={() => setStep('time')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              上一步
            </button>
            <button
              onClick={() => setStep('confirm')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              下一步
            </button>
          </div>
        </div>
      )}

      {/* 步骤4: 确认发布 */}
      {step === 'confirm' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            确认发布
          </h3>

          {/* 摘要信息 */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">目的地:</span>
              <span className="font-medium">{selectedPlace?.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">时间:</span>
              <span className="font-medium">
                {selectedDate} {selectedTime} (±{flexibleTime}分钟)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">最大距离:</span>
              <span className="font-medium">{(preferences.maxDistance / 1000).toFixed(1)}km</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">期望人数:</span>
              <span className="font-medium">{preferences.groupSizePreference}人</span>
            </div>
            {preferences.interests.length > 0 && (
              <div>
                <span className="text-sm text-gray-600">兴趣:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {preferences.interests.map((interest, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 留言 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              给同行伙伴的留言 (可选)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="介绍一下自己，或者说明同行的目的..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep('preferences')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              上一步
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{isLoading ? '发布中...' : '发布匹配请求'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}