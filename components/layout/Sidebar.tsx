'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  X, 
  ChevronDown,
  ChevronRight,
  Settings,
  HelpCircle,
  LogOut,
  MapPin
} from 'lucide-react';
import { useAppStore } from '@/lib/stores/appStore';
import { useUserStore } from '@/lib/stores/userStore';
import { Button } from '@/components/ui/Button';
import { QuickNavigation } from './TabBar';
import { cn } from '@/lib/utils';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['navigation']);
  
  const { 
    sidebarOpen, 
    setSidebarOpen, 
    mobileMenuOpen, 
    setMobileMenuOpen,
    theme,
    setTheme 
  } = useAppStore();
  
  const { user, isAuthenticated, logout } = useUserStore();

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
    setMobileMenuOpen(false);
  };

  const isExpanded = (section: string) => expandedSections.includes(section);

  return (
    <>
      {/* 遮罩层 */}
      {(sidebarOpen || mobileMenuOpen) && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* 侧边栏 */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-80 transform bg-white shadow-lg transition-transform duration-300 ease-in-out dark:bg-gray-900",
          "md:relative md:translate-x-0 md:shadow-none",
          (sidebarOpen || mobileMenuOpen) ? "translate-x-0" : "-translate-x-full",
          className
        )}
      >
        {/* 头部 */}
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-700">
          <Link 
            href="/" 
            className="flex items-center space-x-2 text-xl font-bold text-primary-600 dark:text-primary-400"
            onClick={closeSidebar}
          >
            <MapPin className="h-6 w-6" />
            <span>Social Rhythm</span>
          </Link>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={closeSidebar}
            className="md:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* 内容区域 */}
        <div className="flex h-[calc(100%-4rem)] flex-col">
          <div className="flex-1 overflow-y-auto p-4">
            {/* 用户信息 */}
            {isAuthenticated && user && (
              <div className="mb-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                <div className="flex items-center space-x-3">
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name}
                      className="h-10 w-10 rounded-full"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                      {user.name}
                    </p>
                    <p className="truncate text-xs text-gray-600 dark:text-gray-400">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 主导航 */}
            <div className="space-y-6">
              {/* 导航菜单 */}
              <div>
                <button
                  onClick={() => toggleSection('navigation')}
                  className="flex w-full items-center justify-between text-sm font-semibold text-gray-900 dark:text-gray-100"
                >
                  <span>导航菜单</span>
                  {isExpanded('navigation') ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                
                {isExpanded('navigation') && (
                  <div className="mt-3">
                    <QuickNavigation />
                  </div>
                )}
              </div>

              {/* 快捷功能 */}
              <div>
                <button
                  onClick={() => toggleSection('shortcuts')}
                  className="flex w-full items-center justify-between text-sm font-semibold text-gray-900 dark:text-gray-100"
                >
                  <span>快捷功能</span>
                  {isExpanded('shortcuts') ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                
                {isExpanded('shortcuts') && (
                  <div className="mt-3 space-y-1">
                    <Link
                      href="/nearby"
                      className="flex items-center space-x-3 rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                      onClick={closeSidebar}
                    >
                      <MapPin className="h-4 w-4" />
                      <span>附近场所</span>
                    </Link>
                    <Link
                      href="/favorites"
                      className="flex items-center space-x-3 rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                      onClick={closeSidebar}
                    >
                      <span className="text-yellow-500">★</span>
                      <span>我的收藏</span>
                    </Link>
                    <Link
                      href="/history"
                      className="flex items-center space-x-3 rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                      onClick={closeSidebar}
                    >
                      <span>🕒</span>
                      <span>访问历史</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* 主题设置 */}
              <div>
                <button
                  onClick={() => toggleSection('theme')}
                  className="flex w-full items-center justify-between text-sm font-semibold text-gray-900 dark:text-gray-100"
                >
                  <span>主题设置</span>
                  {isExpanded('theme') ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                
                {isExpanded('theme') && (
                  <div className="mt-3 space-y-2">
                    {[
                      { value: 'light', label: '浅色模式', icon: '☀️' },
                      { value: 'dark', label: '深色模式', icon: '🌙' },
                      { value: 'system', label: '跟随系统', icon: '💻' },
                    ].map((themeOption) => (
                      <button
                        key={themeOption.value}
                        onClick={() => setTheme(themeOption.value as 'light' | 'dark' | 'system')}
                        className={cn(
                          "flex w-full items-center space-x-3 rounded-md px-3 py-2 text-sm transition-colors",
                          theme === themeOption.value
                            ? "bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                        )}
                      >
                        <span>{themeOption.icon}</span>
                        <span>{themeOption.label}</span>
                        {theme === themeOption.value && (
                          <span className="ml-auto text-primary-600 dark:text-primary-400">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 底部操作区域 */}
          <div className="border-t border-gray-200 p-4 dark:border-gray-700">
            <div className="space-y-2">
              <Link
                href="/settings"
                className="flex w-full items-center space-x-3 rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                onClick={closeSidebar}
              >
                <Settings className="h-4 w-4" />
                <span>设置</span>
              </Link>
              
              <Link
                href="/help"
                className="flex w-full items-center space-x-3 rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                onClick={closeSidebar}
              >
                <HelpCircle className="h-4 w-4" />
                <span>帮助</span>
              </Link>

              {isAuthenticated && (
                <button
                  onClick={() => {
                    logout();
                    closeSidebar();
                  }}
                  className="flex w-full items-center space-x-3 rounded-md px-3 py-2 text-sm text-error-600 hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-900/20"
                >
                  <LogOut className="h-4 w-4" />
                  <span>退出登录</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}