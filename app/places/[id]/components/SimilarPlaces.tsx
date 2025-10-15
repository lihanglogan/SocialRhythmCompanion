'use client';

import { useState, useEffect } from 'react';
import { Place, PlaceCategory, CrowdLevel } from '@/types';
import { defaultBeijingPlaces } from '@/lib/data/mockData';
import { MapPin, Clock, Users, Star, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface SimilarPlacesProps {
  place: Place;
}

export default function SimilarPlaces({ place }: SimilarPlacesProps) {
  const [similarPlaces, setSimilarPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 查找相似场所
    const findSimilarPlaces = () => {
      const filtered = defaultBeijingPlaces
        .filter(p => p.id !== place.id) // 排除当前场所
        .filter(p => p.category === place.category) // 同类型场所
        .sort((a, b) => {
          // 按距离和拥挤程度排序
          const distanceA = calculateDistance(place.coordinates, a.coordinates);
          const distanceB = calculateDistance(place.coordinates, b.coordinates);
          return distanceA - distanceB;
        })
        .slice(0, 6); // 取前6个

      return filtered;
    };

    setTimeout(() => {
      setSimilarPlaces(findSimilarPlaces());
      setLoading(false);
    }, 500);
  }, [place]);

  // 计算两点间距离（简化版）
  const calculateDistance = (coord1: { lat: number; lng: number }, coord2: { lat: number; lng: number }) => {
    const latDiff = coord1.lat - coord2.lat;
    const lngDiff = coord1.lng - coord2.lng;
    return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
  };

  const getCrowdLevelColor = (level: CrowdLevel) => {
    switch (level) {
      case CrowdLevel.LOW: return 'text-green-600 bg-green-100';
      case CrowdLevel.MEDIUM: return 'text-yellow-600 bg-yellow-100';
      case CrowdLevel.HIGH: return 'text-orange-600 bg-orange-100';
      case CrowdLevel.VERY_HIGH: return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCrowdLevelText = (level: CrowdLevel) => {
    switch (level) {
      case CrowdLevel.LOW: return '人少';
      case CrowdLevel.MEDIUM: return '适中';
      case CrowdLevel.HIGH: return '较多';
      case CrowdLevel.VERY_HIGH: return '拥挤';
      default: return '未知';
    }
  };

  const getCategoryIcon = (category: PlaceCategory) => {
    switch (category) {
      case PlaceCategory.RESTAURANT: return '🍽️';
      case PlaceCategory.HOSPITAL: return '🏥';
      case PlaceCategory.BANK: return '🏦';
      case PlaceCategory.GOVERNMENT: return '🏛️';
      case PlaceCategory.SHOPPING: return '🛒';
      case PlaceCategory.TRANSPORT: return '🚇';
      case PlaceCategory.EDUCATION: return '🎓';
      case PlaceCategory.ENTERTAINMENT: return '🎬';
      default: return '📍';
    }
  };

  const getCategoryText = (category: PlaceCategory) => {
    switch (category) {
      case PlaceCategory.RESTAURANT: return '餐饮';
      case PlaceCategory.HOSPITAL: return '医院';
      case PlaceCategory.BANK: return '银行';
      case PlaceCategory.GOVERNMENT: return '政务';
      case PlaceCategory.SHOPPING: return '购物';
      case PlaceCategory.TRANSPORT: return '交通';
      case PlaceCategory.EDUCATION: return '教育';
      case PlaceCategory.ENTERTAINMENT: return '娱乐';
      default: return '其他';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">相似场所推荐</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-32"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (similarPlaces.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">相似场所推荐</h2>
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-2">🔍</div>
          <p className="text-gray-500">暂无相似场所推荐</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">相似场所推荐</h2>
        <div className="flex items-center text-sm text-gray-500">
          <span className="mr-1">{getCategoryIcon(place.category)}</span>
          <span>{getCategoryText(place.category)}类场所</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {similarPlaces.map((similarPlace) => {
          const distance = calculateDistance(place.coordinates, similarPlace.coordinates);
          const distanceKm = (distance * 111).toFixed(1); // 粗略转换为公里
          const rating = 3.5 + Math.random() * 1.5; // 模拟评分

          return (
            <Link
              key={similarPlace.id}
              href={`/places/${similarPlace.id}`}
              className="block bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-lg">{getCategoryIcon(similarPlace.category)}</span>
                    <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors truncate">
                      {similarPlace.name}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-gray-500 mb-2">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{similarPlace.address}</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-600 transition-colors flex-shrink-0 ml-2" />
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                {/* 拥挤程度 */}
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCrowdLevelColor(similarPlace.crowdLevel)}`}>
                    {getCrowdLevelText(similarPlace.crowdLevel)}
                  </span>
                </div>

                {/* 等待时间 */}
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-600">
                    {similarPlace.waitTime}分钟
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                {/* 评分 */}
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  <span className="text-gray-600">{rating.toFixed(1)}</span>
                </div>

                {/* 距离 */}
                <div className="text-gray-500">
                  距离 {distanceKm}km
                </div>
              </div>

              {/* 营业状态 */}
              <div className="mt-2 pt-2 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium ${
                    similarPlace.currentStatus.isOpen 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {similarPlace.currentStatus.isOpen ? '营业中' : '已关闭'}
                  </span>
                  
                  {/* 对比标签 */}
                  {similarPlace.waitTime < place.waitTime && (
                    <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">
                      等待更短
                    </span>
                  )}
                  {similarPlace.crowdLevel < place.crowdLevel && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                      人更少
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 推荐理由说明 */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-medium text-blue-800 mb-2">推荐理由</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• 同类型场所，功能相似</li>
          <li>• 距离较近，方便前往</li>
          <li>• 综合等待时间和拥挤程度推荐</li>
        </ul>
      </div>

      {/* 查看更多 */}
      <div className="mt-4 text-center">
        <Link
          href={`/places?category=${place.category}`}
          className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors"
        >
          <span>查看更多{getCategoryText(place.category)}场所</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}