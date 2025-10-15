'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X, MapPin, Clock, TrendingUp, Filter } from 'lucide-react';
import { useAppStore } from '@/lib/stores/appStore';
import { useMapStore } from '@/lib/stores/mapStore';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  showFilters?: boolean;
}

export function SearchBar({ 
  className, 
  placeholder = "搜索场所、活动...",
  showFilters = true 
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { searchOpen, setSearchOpen } = useAppStore();
  const { searchResults, searchPlaces, clearSearch, isLoading } = useMapStore();

  // 搜索建议数据
  const suggestions = [
    { type: 'recent', text: '咖啡厅', icon: Clock },
    { type: 'recent', text: '电影院', icon: Clock },
    { type: 'trending', text: '火锅店', icon: TrendingUp },
    { type: 'trending', text: '购物中心', icon: TrendingUp },
    { type: 'place', text: '三里屯', icon: MapPin },
    { type: 'place', text: '王府井', icon: MapPin },
  ];

  // 热门搜索
  const hotSearches = ['咖啡厅', '电影院', '健身房', '书店', '公园'];

  useEffect(() => {
    if (searchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchOpen]);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setShowSuggestions(false);
    await searchPlaces(searchQuery);
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    setShowSuggestions(value.length > 0);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  const handleClear = () => {
    setQuery('');
    setShowSuggestions(false);
    clearSearch();
    inputRef.current?.focus();
  };

  const handleClose = () => {
    setSearchOpen(false);
    setQuery('');
    setShowSuggestions(false);
    clearSearch();
  };

  if (!searchOpen) return null;

  return (
    <>
      {/* 遮罩层 */}
      <div 
        className="fixed inset-0 z-50 bg-black/50 transition-opacity"
        onClick={handleClose}
      />

      {/* 搜索面板 */}
      <div className="fixed inset-x-0 top-0 z-50 bg-white shadow-lg dark:bg-gray-900 md:inset-x-4 md:top-4 md:rounded-lg">
        <div className={cn("mx-auto max-w-2xl", className)}>
          {/* 搜索输入框 */}
          <div className="flex items-center border-b border-gray-200 p-4 dark:border-gray-700">
            <Search className="mr-3 h-5 w-5 text-gray-400" />
            
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(query);
                } else if (e.key === 'Escape') {
                  handleClose();
                }
              }}
              placeholder={placeholder}
              className="flex-1 bg-transparent text-lg outline-none placeholder:text-gray-500 dark:text-gray-100 dark:placeholder:text-gray-400"
            />

            {query && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="mr-2"
              >
                <X className="h-4 w-4" />
              </Button>
            )}

            {showFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                className={cn(
                  "mr-2",
                  showFiltersPanel && "bg-gray-100 dark:bg-gray-800"
                )}
              >
                <Filter className="h-4 w-4" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* 过滤器面板 */}
          {showFiltersPanel && (
            <div className="border-b border-gray-200 p-4 dark:border-gray-700">
              <div className="space-y-3">
                <div>
                  <h4 className="mb-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                    场所类型
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {['餐饮', '娱乐', '购物', '运动', '教育', '医疗'].map((category) => (
                      <button
                        key={category}
                        className="rounded-full border border-gray-300 px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="mb-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                    人流密度
                  </h4>
                  <div className="flex gap-2">
                    {['低', '中', '高'].map((level) => (
                      <button
                        key={level}
                        className="rounded-full border border-gray-300 px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 搜索内容区域 */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-600 border-t-transparent"></div>
                <span className="ml-2 text-gray-600 dark:text-gray-400">搜索中...</span>
              </div>
            ) : searchResults.length > 0 ? (
              /* 搜索结果 */
              <div className="p-4">
                <h3 className="mb-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                  搜索结果 ({searchResults.length})
                </h3>
                <div className="space-y-2">
                  {searchResults.map((result) => (
                    <div
                      key={result.id}
                      className="flex items-center space-x-3 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                      onClick={() => {
                        // 这里可以添加选择结果的逻辑
                        handleClose();
                      }}
                    >
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {result.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {result.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">
                          {result.crowdLevel === 'low' && '🟢'}
                          {result.crowdLevel === 'medium' && '🟡'}
                          {result.crowdLevel === 'high' && '🔴'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : query ? (
              /* 无搜索结果 */
              <div className="p-8 text-center">
                <Search className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  没有找到相关结果
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  试试其他关键词
                </p>
              </div>
            ) : showSuggestions ? (
              /* 搜索建议 */
              <div className="p-4">
                <div className="space-y-2">
                  {suggestions.map((suggestion, index) => {
                    const Icon = suggestion.icon;
                    return (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion.text)}
                        className="flex w-full items-center space-x-3 rounded-lg p-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <Icon className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {suggestion.text}
                        </span>
                        {suggestion.type === 'trending' && (
                          <span className="ml-auto text-xs text-orange-500">热门</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* 默认内容 */
              <div className="p-4">
                <div className="mb-4">
                  <h3 className="mb-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                    热门搜索
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {hotSearches.map((item) => (
                      <button
                        key={item}
                        onClick={() => handleSuggestionClick(item)}
                        className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                    搜索建议
                  </h3>
                  <div className="space-y-1">
                    {suggestions.slice(0, 4).map((suggestion, index) => {
                      const Icon = suggestion.icon;
                      return (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion.text)}
                          className="flex w-full items-center space-x-3 rounded-lg p-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <Icon className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-700 dark:text-gray-300">
                            {suggestion.text}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}