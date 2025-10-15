'use client';

import { useState, useEffect } from 'react';
import { useMapStore } from '@/lib/stores/mapStore';
import { useAppStore } from '@/lib/stores/appStore';
import { PageContainer } from '@/components/layout/PageContainer';
import { SearchBar } from '@/components/layout/SearchBar';
import { PlacesList } from './components/PlacesList';
import { FilterPanel } from './components/FilterPanel';
import { SearchResults } from './components/SearchResults';
import { generateMockPlaces } from '@/lib/data/mockData';
import { Place, PlaceCategory, CrowdLevel } from '@/types';
import { Filter, Map, List, Grid } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export default function PlacesPage() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'distance' | 'crowdLevel' | 'waitTime' | 'name'>('distance');
  const [filters, setFilters] = useState({
    categories: [] as PlaceCategory[],
    crowdLevels: [] as CrowdLevel[],
    maxWaitTime: 60,
    isOpen: false,
    hasAccessibility: false,
    maxDistance: 10, // km
  });

  const { searchResults } = useMapStore();
  const { searchOpen, setSearchOpen } = useAppStore();

  // 加载场所数据
  useEffect(() => {
    const mockPlaces = generateMockPlaces('beijing', 50);
    setPlaces(mockPlaces);
    setFilteredPlaces(mockPlaces);
  }, []);

  // 应用筛选和排序
  useEffect(() => {
    let filtered = [...places];

    // 应用筛选条件
    if (filters.categories.length > 0) {
      filtered = filtered.filter(place => filters.categories.includes(place.category));
    }

    if (filters.crowdLevels.length > 0) {
      filtered = filtered.filter(place => filters.crowdLevels.includes(place.crowdLevel));
    }

    if (filters.maxWaitTime < 60) {
      filtered = filtered.filter(place => place.waitTime <= filters.maxWaitTime);
    }

    if (filters.isOpen) {
      filtered = filtered.filter(place => place.currentStatus.isOpen);
    }

    if (filters.hasAccessibility) {
      filtered = filtered.filter(place => place.accessibility.wheelchairAccessible);
    }

    // 应用排序
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          // 模拟距离计算
          return Math.random() - 0.5;
        case 'crowdLevel':
          const crowdOrder = { 'low': 0, 'medium': 1, 'high': 2, 'very_high': 3 };
          return crowdOrder[a.crowdLevel] - crowdOrder[b.crowdLevel];
        case 'waitTime':
          return a.waitTime - b.waitTime;
        case 'name':
          return a.name.localeCompare(b.name, 'zh-CN');
        default:
          return 0;
      }
    });

    setFilteredPlaces(filtered);
  }, [places, filters, sortBy]);

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const handleSortChange = (newSortBy: typeof sortBy) => {
    setSortBy(newSortBy);
  };

  const getCrowdLevelColor = (level: CrowdLevel) => {
    switch (level) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-orange-600';
      case 'very_high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getCrowdLevelText = (level: CrowdLevel) => {
    switch (level) {
      case 'low': return '人少';
      case 'medium': return '适中';
      case 'high': return '较多';
      case 'very_high': return '拥挤';
      default: return '未知';
    }
  };

  return (
    <PageContainer>
      {/* 页面标题和操作栏 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              场所搜索
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              发现附近的场所，避开拥挤时段
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* 视图切换 */}
            <div className="flex rounded-lg border border-gray-300 dark:border-gray-600">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-r-none"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-l-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>

            {/* 筛选按钮 */}
            <Button
              variant={showFilters ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              筛选
            </Button>

            {/* 搜索按钮 */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchOpen(true)}
            >
              <Map className="h-4 w-4 mr-2" />
              搜索
            </Button>
          </div>
        </div>

        {/* 统计信息 */}
        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
          <span>共 {filteredPlaces.length} 个场所</span>
          <span>•</span>
          <span>
            人少场所: {filteredPlaces.filter(p => p.crowdLevel === 'low').length} 个
          </span>
          <span>•</span>
          <span>
            营业中: {filteredPlaces.filter(p => p.currentStatus.isOpen).length} 个
          </span>
        </div>
      </div>

      <div className="flex gap-6">
        {/* 筛选面板 */}
        {showFilters && (
          <div className="w-80 flex-shrink-0">
            <FilterPanel
              filters={filters}
              onFiltersChange={handleFilterChange}
              sortBy={sortBy}
              onSortChange={handleSortChange}
            />
          </div>
        )}

        {/* 主内容区域 */}
        <div className="flex-1 min-w-0">
          {searchOpen && searchResults.length > 0 ? (
            <SearchResults results={searchResults} />
          ) : (
            <PlacesList
              places={filteredPlaces}
              viewMode={viewMode}
              sortBy={sortBy}
              onSortChange={handleSortChange}
            />
          )}
        </div>
      </div>

      {/* 搜索组件 */}
      <SearchBar />
    </PageContainer>
  );
}