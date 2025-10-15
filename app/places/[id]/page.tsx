'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Place } from '@/types';
import { defaultBeijingPlaces } from '@/lib/data/mockData';
import PlaceHeader from './components/PlaceHeader';
import PlaceStats from './components/PlaceStats';
import PlaceTrends from './components/PlaceTrends';
import PlaceMap from './components/PlaceMap';
import PlaceActions from './components/PlaceActions';
import SimilarPlaces from './components/SimilarPlaces';
import { ArrowLeft } from 'lucide-react';

export default function PlaceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlace = async () => {
      try {
        setLoading(true);
        const placeId = params.id as string;
        
        // 从模拟数据中查找场所
        const foundPlace = defaultBeijingPlaces.find(p => p.id === placeId);
        
        if (!foundPlace) {
          setError('场所未找到');
          return;
        }
        
        setPlace(foundPlace);
      } catch (err) {
        setError('加载场所信息失败');
        console.error('Error fetching place:', err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchPlace();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载场所信息中...</p>
        </div>
      </div>
    );
  }

  if (error || !place) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">😞</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {error || '场所未找到'}
          </h1>
          <p className="text-gray-600 mb-6">
            抱歉，我们找不到您要查看的场所信息。
          </p>
          <button
            onClick={() => router.back()}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            返回上一页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              返回
            </button>
            <div className="ml-4">
              <h1 className="text-lg font-semibold text-gray-900 truncate">
                {place.name}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* 场所头部信息 */}
          <PlaceHeader place={place} />
          
          {/* 实时统计数据 */}
          <PlaceStats place={place} />
          
          {/* 趋势图表 */}
          <PlaceTrends place={place} />
          
          {/* 场所地图和操作按钮 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <PlaceMap place={place} />
            </div>
            <div>
              <PlaceActions place={place} />
            </div>
          </div>
          
          {/* 相似场所推荐 */}
          <SimilarPlaces place={place} />
        </div>
      </div>
    </div>
  );
}