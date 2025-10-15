'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Menu, 
  Search, 
  Bell, 
  User, 
  Settings,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';
import { useAppStore } from '@/lib/stores/appStore';
import { useUserStore } from '@/lib/stores/userStore';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';

export function Header() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const { 
    theme, 
    setTheme, 
    toggleSidebar, 
    toggleMobileMenu, 
    toggleSearch,
    notifications 
  } = useAppStore();
  
  const { user, isAuthenticated } = useUserStore();
  
  const unreadCount = notifications.filter(n => !n.read).length;

  const themeIcons = {
    light: Sun,
    dark: Moon,
    system: Monitor,
  };

  const ThemeIcon = themeIcons[theme];

  const cycleTheme = () => {
    const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-gray-800 dark:bg-gray-900/95 dark:supports-[backdrop-filter]:bg-gray-900/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* 左侧：Logo 和导航 */}
          <div className="flex items-center space-x-4">
            {/* 移动端菜单按钮 */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={toggleMobileMenu}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* 桌面端侧边栏切换 */}
            <Button
              variant="ghost"
              size="sm"
              className="hidden md:flex"
              onClick={toggleSidebar}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Logo */}
            <Link 
              href="/" 
              className="flex items-center"
            >
              <Logo 
                size="md" 
                variant="full" 
                color="primary"
                className="hidden sm:flex"
              />
              <Logo 
                size="md" 
                variant="icon" 
                color="primary"
                className="sm:hidden"
              />
            </Link>
          </div>

          {/* 中间：搜索栏（桌面端） */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <Button
              variant="outline"
              className="w-full justify-start text-gray-500 dark:text-gray-400"
              onClick={toggleSearch}
            >
              <Search className="mr-2 h-4 w-4" />
              搜索场所、活动...
            </Button>
          </div>

          {/* 右侧：操作按钮 */}
          <div className="flex items-center space-x-2">
            {/* 移动端搜索按钮 */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={toggleSearch}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* 主题切换 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={cycleTheme}
              title={`当前主题: ${theme === 'light' ? '浅色' : theme === 'dark' ? '深色' : '跟随系统'}`}
            >
              <ThemeIcon className="h-5 w-5" />
            </Button>

            {/* 通知 */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-error-500 text-xs text-white flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>

              {/* 通知下拉菜单 */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      通知 {unreadCount > 0 && `(${unreadCount})`}
                    </h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        暂无通知
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((notification) => (
                        <div
                          key={notification.id}
                          className={`border-b border-gray-100 p-4 dark:border-gray-700 ${
                            !notification.read ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                          }`}
                        >
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {notification.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                  {notifications.length > 5 && (
                    <div className="border-t border-gray-100 p-2 dark:border-gray-700">
                      <Button variant="ghost" size="sm" className="w-full">
                        查看全部通知
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 用户菜单 */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2"
              >
                {isAuthenticated && user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name}
                    className="h-6 w-6 rounded-full"
                  />
                ) : (
                  <User className="h-5 w-5" />
                )}
                {isAuthenticated && (
                  <span className="hidden sm:block text-sm font-medium">
                    {user?.name || '用户'}
                  </span>
                )}
              </Button>

              {/* 用户下拉菜单 */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                  {isAuthenticated ? (
                    <>
                      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {user?.name}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {user?.email}
                        </p>
                      </div>
                      <div className="p-2">
                        <Link
                          href="/profile"
                          className="flex items-center space-x-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                          <User className="h-4 w-4" />
                          <span>个人中心</span>
                        </Link>
                        <Link
                          href="/settings"
                          className="flex items-center space-x-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                          <Settings className="h-4 w-4" />
                          <span>设置</span>
                        </Link>
                        <button
                          onClick={() => {
                            // 这里调用登出逻辑
                            setShowUserMenu(false);
                          }}
                          className="w-full flex items-center space-x-2 rounded-md px-3 py-2 text-sm text-error-600 hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-900/20"
                        >
                          <span>退出登录</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="p-2">
                      <Link
                        href="/login"
                        className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        登录
                      </Link>
                      <Link
                        href="/register"
                        className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        注册
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 点击外部关闭菜单 */}
      {(showUserMenu || showNotifications) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowUserMenu(false);
            setShowNotifications(false);
          }}
        />
      )}
    </header>
  );
}