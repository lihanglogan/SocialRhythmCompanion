'use client';

import { useState } from 'react';
import { Place } from '@/types';
import { PlaceCard } from './PlaceCard';
import { Button } from '@/components/ui/Button';
import { ArrowUpDown, Grid, List, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlacesListProps {
  places: Place[];
  viewMode: 'list' | 'grid';
  sortBy: 'distance' | 'crowdLevel' | 'waitTime' | 'name';
  onSortChange: (sortBy: PlacesListProps['sortBy']) => void;
}

export function PlacesList({
  places,
  viewMode,
  sortBy,
  onSortChange
}: PlacesListProps) {
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const sortOptions = [
    { value: 'distance', label: '按距离排序', icon: '📍' },
    { value: 'crowdLevel', label: '按拥挤度排序', icon: '👥' },
    { value: 'waitTime', label: '按等待时间排序', icon: '⏱️' },
    { value: 'name', label: '按名称排序', icon: '🔤' }
  ];

  const getSortLabel = (value: string) => {
    return sortOptions.find(option => option.value === value)?.label || '排序';
  };

  // 分页逻辑
  const totalPages = Math.ceil(places.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPlaces = places.slice(startIndex, endIndex);

  const handleSortChange = (newSortBy: PlacesListProps['sortBy']) => {
    onSortChange(newSortBy);
    setShowSortDropdown(false);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlaceAction = (action: string, place: Place) => {
    console.log(`${action} action for place:`, place.name);
    // 这里可以添加具体的操作逻辑
  };

  if (places.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <List className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          没有找到匹配的场所
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          尝试调整筛选条件或搜索其他关键词
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 排序和视图控制 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            显示 {startIndex + 1}-{Math.min(endIndex, places.length)} 个，共 {places.length} 个场所
          </span>
        </div>

        {/* 排序下拉菜单 */}
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            className="flex items-center space-x-2"
          >
            <ArrowUpDown className="w-4 h-4" />
            <span>{getSortLabel(sortBy)}</span>
            <ChevronDown className="w-4 h-4" />
          </Button>

          {showSortDropdown && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
              <div className="py-2">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSortChange(option.value as any)}
                    className={cn(
                      "flex items-center space-x-2 w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700",
                      sortBy === option.value && "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                    )}
                  >
                    <span>{option.icon}</span>
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 场所列表 */}
      <div className={cn(
        "gap-4",
        viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
          : "space-y-4"
      )}>
        {currentPlaces.map((place) => (
          <PlaceCard
            key={place.id}
            place={place}
            variant={viewMode === 'grid' ? 'default' : 'compact'}
            showDistance={true}
            onNavigate={(place) => handlePlaceAction('navigate', place)}
            onFavorite={(place) => handlePlaceAction('favorite', place)}
            onViewDetails={(place) => handlePlaceAction('viewDetails', place)}
          />
        ))}
      </div>

      {/* 分页控件 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 pt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            上一页
          </Button>

          <div className="flex items-center space-x-1">
            {/* 显示页码 */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                  className="w-8 h-8 p-0"
                >
                  {pageNum}
                </Button>
              );
            })}

            {totalPages > 5 && currentPage < totalPages - 2 && (
              <>
                <span className="px-2 text-gray-400">...</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePageChange(totalPages)}
                  className="w-8 h-8 p-0"
                >
                  {totalPages}
                </Button>
              </>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            下一页
          </Button>
        </div>
      )}

      {/* 加载更多按钮（可选的无限滚动替代方案） */}
      {currentPage < totalPages && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage + 1)}
            className="px-8"
          >
            加载更多场所
          </Button>
        </div>
      )}
    </div>
  );
}