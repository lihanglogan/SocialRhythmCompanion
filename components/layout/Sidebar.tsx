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
  MapPin,
  Home,
  Users,
  MessageSquare,
  BarChart3,
  User,
  ChevronLeft
} from 'lucide-react';
import { useAppStore } from '@/lib/stores/appStore';
import { useUserStore } from '@/lib/stores/userStore';
import { Button } from '@/components/ui/Button';
import { QuickNavigation } from './TabBar';
import { cn } from '@/lib/utils';

interface SidebarProps {
  className?: string;
}

// 导航菜单项
const navigationItems = [
  { href: '/', icon: Home, label: '首页', badge: null },
  { href: '/places', icon: MapPin, label: '场所', badge: null },
  { href: '/match', icon: Users, label: '匹配', badge: null },
  { href: '/suggestions', icon: MessageSquare, label: '建议', badge: null },
  { href: '/report', icon: BarChart3, label: '报告', badge: null },
  { href: '/profile', icon: User, label: '个人', badge: null },
];

export function Sidebar({ className }: SidebarProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['navigation']);
  
  const { 
    sidebarOpen, 
    sidebarCollapsed,
    setSidebarOpen, 
    setMobileMenuOpen,
    toggleSidebarCollapse,
    mobileMenuOpen, 
    theme,
    setTheme,
    isMobile
  } = useAppStore();
  
  const { user, isAuthenticated, logout } = useUserStore();

  const toggleSection = (section: string) => {
    if (sidebarCollapsed) return; // 收起状态下不允许展开/收起分组
    
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

  // 移动端侧边栏
  if (isMobile) {
    return (
      <>
        {/* 遮罩层 */}
        {(sidebarOpen || mobileMenuOpen) && (
          <div
            className="fixed inset-0 z-40 bg-black/50 transition-opacity"
            onClick={closeSidebar}
          />
        )}

        {/* 移动端侧边栏 */}
        <aside
          className={cn(
            "fixed left-0 top-0 z-50 h-full w-80 transform bg-white shadow-lg transition-transform duration-300 ease-in-out dark:bg-gray-900",
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
                  <QuickNavigation />
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

  // 桌面端侧边栏
  return (
    <aside
      className={cn(
        "relative flex h-full flex-col bg-white shadow-sm transition-all duration-300 ease-in-out dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700",
        sidebarCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* 头部 */}
      <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-700">
        {!sidebarCollapsed && (
          <Link 
            href="/" 
            className="flex items-center space-x-2 text-xl font-bold text-primary-600 dark:text-primary-400"
          >
            <MapPin className="h-6 w-6" />
            <span>Social Rhythm</span>
          </Link>
        )}
        
        {sidebarCollapsed && (
          <Link 
            href="/" 
            className="flex items-center justify-center w-full"
          >
            <MapPin className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </Link>
        )}
        
        {/* 收起/展开按钮 */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebarCollapse}
          className={cn(
            "flex-shrink-0",
            sidebarCollapsed && "absolute -right-3 top-4 z-10 h-6 w-6 rounded-full bg-white shadow-md dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
          )}
        >
          <ChevronLeft className={cn(
            "h-4 w-4 transition-transform duration-200",
            sidebarCollapsed && "rotate-180"
          )} />
        </Button>
      </div>

      {/* 内容区域 */}
      <div className="flex h-[calc(100%-4rem)] flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          {/* 用户信息 */}
          {isAuthenticated && user && !sidebarCollapsed && (
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

          {/* 收起状态下的用户头像 */}
          {isAuthenticated && user && sidebarCollapsed && (
            <div className="mb-6 flex justify-center">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name}
                  className="h-8 w-8 rounded-full"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400 text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          )}

          {/* 主导航 */}
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100",
                    sidebarCollapsed ? "justify-center" : "space-x-3"
                  )}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                  {!sidebarCollapsed && item.badge && (
                    <span className="ml-auto rounded-full bg-primary-100 px-2 py-0.5 text-xs text-primary-600 dark:bg-primary-900/50 dark:text-primary-400">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* 展开状态下的其他功能 */}
          {!sidebarCollapsed && (
            <div className="mt-8 space-y-6">
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
                    >
                      <MapPin className="h-4 w-4" />
                      <span>附近场所</span>
                    </Link>
                    <Link
                      href="/favorites"
                      className="flex items-center space-x-3 rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                    >
                      <span className="text-yellow-500">★</span>
                      <span>我的收藏</span>
                    </Link>
                    <Link
                      href="/history"
                      className="flex items-center space-x-3 rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100"
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
          )}
        </div>

        {/* 底部操作区域 */}
        <div className="border-t border-gray-200 p-4 dark:border-gray-700">
          <div className={cn("space-y-2", sidebarCollapsed && "flex flex-col items-center space-y-3")}>
            <Link
              href="/settings"
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100",
                sidebarCollapsed ? "justify-center w-8 h-8" : "space-x-3 w-full"
              )}
              title={sidebarCollapsed ? "设置" : undefined}
            >
              <Settings className="h-4 w-4" />
              {!sidebarCollapsed && <span>设置</span>}
            </Link>
            
            <Link
              href="/help"
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100",
                sidebarCollapsed ? "justify-center w-8 h-8" : "space-x-3 w-full"
              )}
              title={sidebarCollapsed ? "帮助" : undefined}
            >
              <HelpCircle className="h-4 w-4" />
              {!sidebarCollapsed && <span>帮助</span>}
            </Link>

            {isAuthenticated && (
              <button
                onClick={logout}
                className={cn(
                  "flex items-center rounded-md px-3 py-2 text-sm text-error-600 hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-900/20",
                  sidebarCollapsed ? "justify-center w-8 h-8" : "space-x-3 w-full"
                )}
                title={sidebarCollapsed ? "退出登录" : undefined}
              >
                <LogOut className="h-4 w-4" />
                {!sidebarCollapsed && <span>退出登录</span>}
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}