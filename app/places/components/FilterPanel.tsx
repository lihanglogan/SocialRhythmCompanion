'use client';

import { useState } from 'react';
import { PlaceCategory, CrowdLevel } from '@/types';
import { Button } from '@/components/ui/Button';
import { ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterPanelProps {
  filters: {
    categories: PlaceCategory[];
    crowdLevels: CrowdLevel[];
    maxWaitTime: number;
    isOpen: boolean;
    hasAccessibility: boolean;
    maxDistance: number;
  };
  onFiltersChange: (filters: FilterPanelProps['filters']) => void;
  sortBy: 'distance' | 'crowdLevel' | 'waitTime' | 'name';
  onSortChange: (sortBy: FilterPanelProps['sortBy']) => void;
}

export function FilterPanel({
  filters,
  onFiltersChange,
  sortBy,
  onSortChange
}: FilterPanelProps) {
  const [expandedSections, setExpandedSections] = useState({
    sort: true,
    category: true,
    crowd: true,
    time: false,
    status: false,
    accessibility: false,
    distance: false
  });

  const categories = [
    { value: PlaceCategory.RESTAURANT, label: '餐饮', icon: '🍽️' },
    { value: PlaceCategory.HOSPITAL, label: '医院', icon: '🏥' },
    { value: PlaceCategory.BANK, label: '银行', icon: '🏦' },
    { value: PlaceCategory.GOVERNMENT, label: '政务', icon: '🏛️' },
    { value: PlaceCategory.SHOPPING, label: '购物', icon: '🛍️' },
    { value: PlaceCategory.TRANSPORT, label: '交通', icon: '🚇' },
    { value: PlaceCategory.EDUCATION, label: '教育', icon: '🎓' },
    { value: PlaceCategory.ENTERTAINMENT, label: '娱乐', icon: '🎬' },
    { value: PlaceCategory.OTHER, label: '其他', icon: '📍' }
  ];

  const crowdLevels = [
    { value: CrowdLevel.LOW, label: '人少', color: 'bg-green-500', icon: '🟢' },
    { value: CrowdLevel.MEDIUM, label: '适中', color: 'bg-yellow-500', icon: '🟡' },
    { value: CrowdLevel.HIGH, label: '较多', color: 'bg-orange-500', icon: '🟠' },
    { value: CrowdLevel.VERY_HIGH, label: '拥挤', color: 'bg-red-500', icon: '🔴' }
  ];

  const sortOptions = [
    { value: 'distance', label: '按距离', icon: '📍' },
    { value: 'crowdLevel', label: '按拥挤度', icon: '👥' },
    { value: 'waitTime', label: '按等待时间', icon: '⏱️' },
    { value: 'name', label: '按名称', icon: '🔤' }
  ];

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleCategoryChange = (category: PlaceCategory) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    
    onFiltersChange({
      ...filters,
      categories: newCategories
    });
  };

  const handleCrowdLevelChange = (level: CrowdLevel) => {
    const newLevels = filters.crowdLevels.includes(level)
      ? filters.crowdLevels.filter(l => l !== level)
      : [...filters.crowdLevels, level];
    
    onFiltersChange({
      ...filters,
      crowdLevels: newLevels
    });
  };

  const handleWaitTimeChange = (value: number) => {
    onFiltersChange({
      ...filters,
      maxWaitTime: value
    });
  };

  const handleDistanceChange = (value: number) => {
    onFiltersChange({
      ...filters,
      maxDistance: value
    });
  };

  const handleToggleFilter = (key: 'isOpen' | 'hasAccessibility') => {
    onFiltersChange({
      ...filters,
      [key]: !filters[key]
    });
  };

  const resetFilters = () => {
    onFiltersChange({
      categories: [],
      crowdLevels: [],
      maxWaitTime: 60,
      isOpen: false,
      hasAccessibility: false,
      maxDistance: 10
    });
  };

  const hasActiveFilters = 
    filters.categories.length > 0 ||
    filters.crowdLevels.length > 0 ||
    filters.maxWaitTime < 60 ||
    filters.isOpen ||
    filters.hasAccessibility ||
    filters.maxDistance < 10;

  const FilterSection = ({ 
    title, 
    sectionKey, 
    children 
  }: { 
    title: string; 
    sectionKey: keyof typeof expandedSections; 
    children: React.ReactNode; 
  }) => (
    <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="flex items-center justify-between w-full text-left"
      >
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {title}
        </h3>
        {expandedSections[sectionKey] ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </button>
      
      {expandedSections[sectionKey] && (
        <div className="mt-3">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      {/* 标题和重置按钮 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          筛选和排序
        </h2>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            重置
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {/* 排序选项 */}
        <FilterSection title="排序方式" sectionKey="sort">
          <div className="space-y-2">
            {sortOptions.map((option) => (
              <label
                key={option.value}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name="sort"
                  value={option.value}
                  checked={sortBy === option.value}
                  onChange={() => onSortChange(option.value as any)}
                  className="text-blue-600"
                />
                <span className="text-sm">{option.icon}</span>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* 场所类型 */}
        <FilterSection title="场所类型" sectionKey="category">
          <div className="grid grid-cols-2 gap-2">
            {categories.map((category) => (
              <label
                key={category.value}
                className={cn(
                  "flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition-colors",
                  filters.categories.includes(category.value)
                    ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300"
                    : "border-gray-200 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                )}
              >
                <input
                  type="checkbox"
                  checked={filters.categories.includes(category.value)}
                  onChange={() => handleCategoryChange(category.value)}
                  className="sr-only"
                />
                <span className="text-sm">{category.icon}</span>
                <span className="text-xs font-medium">{category.label}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* 拥挤程度 */}
        <FilterSection title="拥挤程度" sectionKey="crowd">
          <div className="space-y-2">
            {crowdLevels.map((level) => (
              <label
                key={level.value}
                className={cn(
                  "flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition-colors",
                  filters.crowdLevels.includes(level.value)
                    ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300"
                    : "border-gray-200 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                )}
              >
                <input
                  type="checkbox"
                  checked={filters.crowdLevels.includes(level.value)}
                  onChange={() => handleCrowdLevelChange(level.value)}
                  className="sr-only"
                />
                <span className="text-sm">{level.icon}</span>
                <span className="text-sm font-medium">{level.label}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* 等待时间 */}
        <FilterSection title="最大等待时间" sectionKey="time">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {filters.maxWaitTime >= 60 ? '不限' : `${filters.maxWaitTime}分钟`}
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              step="5"
              value={filters.maxWaitTime}
              onChange={(e) => handleWaitTimeChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>5分钟</span>
              <span>30分钟</span>
              <span>不限</span>
            </div>
          </div>
        </FilterSection>

        {/* 营业状态 */}
        <FilterSection title="营业状态" sectionKey="status">
          <div className="space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.isOpen}
                onChange={() => handleToggleFilter('isOpen')}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                仅显示营业中的场所
              </span>
            </label>
          </div>
        </FilterSection>

        {/* 无障碍设施 */}
        <FilterSection title="无障碍设施" sectionKey="accessibility">
          <div className="space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.hasAccessibility}
                onChange={() => handleToggleFilter('hasAccessibility')}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                有轮椅通道
              </span>
            </label>
          </div>
        </FilterSection>

        {/* 距离范围 */}
        <FilterSection title="距离范围" sectionKey="distance">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {filters.maxDistance >= 10 ? '不限' : `${filters.maxDistance}km内`}
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="10"
              step="0.5"
              value={filters.maxDistance}
              onChange={(e) => handleDistanceChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>0.5km</span>
              <span>5km</span>
              <span>不限</span>
            </div>
          </div>
        </FilterSection>
      </div>
    </div>
  );
}