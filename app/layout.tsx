'use client';

import { Inter } from "next/font/google";
import { useState, useEffect } from 'react';
import "./globals.css";
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { TabBar } from '@/components/layout/TabBar';
import { SearchBar } from '@/components/layout/SearchBar';
import { useAppStore } from '@/lib/stores/appStore';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [mounted, setMounted] = useState(false);
  const { 
    theme, 
    sidebarOpen, 
    searchOpen, 
    isMobile,
    setIsMobile 
  } = useAppStore();

  // 确保组件在客户端挂载后才渲染
  useEffect(() => {
    setMounted(true);
    
    // 检测移动设备
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [setIsMobile]);

  // 在服务端渲染期间显示加载状态
  if (!mounted) {
    return (
      <html lang="zh-CN">
        <head>
          <script
            type="text/javascript"
            src={`https://webapi.amap.com/maps?v=2.0&key=${process.env.NEXT_PUBLIC_AMAP_KEY}`}
            async
          ></script>
        </head>
        <body className={`${inter.variable} font-sans antialiased`}>
          <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">加载中...</p>
            </div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="zh-CN" className={theme}>
      <head>
        <script
          type="text/javascript"
          src={`https://webapi.amap.com/maps?v=2.0&key=${process.env.NEXT_PUBLIC_AMAP_KEY}`}
          async
        ></script>
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-gray-50 dark:bg-gray-900 transition-colors duration-200`}>
        <div className="min-h-screen flex flex-col">
          {/* 头部导航栏 */}
          <Header />
          
          <div className="flex flex-1 overflow-hidden">
            {/* 桌面端侧边栏 */}
            {!isMobile && (
              <div className={`
                transition-all duration-300 ease-in-out
                ${sidebarOpen ? 'w-64' : 'w-16'}
                flex-shrink-0
              `}>
                <Sidebar />
              </div>
            )}
            
            {/* 移动端侧边栏覆盖层 */}
            {isMobile && sidebarOpen && (
              <>
                {/* 背景遮罩 */}
                <div 
                  className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                  onClick={() => useAppStore.getState().toggleSidebar()}
                />
                {/* 侧边栏 */}
                <div className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden">
                  <Sidebar />
                </div>
              </>
            )}
            
            {/* 主内容区域 */}
            <main className="flex-1 overflow-auto">
              <div className="h-full">
                {children}
              </div>
            </main>
          </div>
          
          {/* 移动端底部标签栏 */}
          {isMobile && (
            <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700">
              <TabBar />
            </div>
          )}
        </div>
        
        {/* 全屏搜索组件 */}
        {searchOpen && <SearchBar />}
        
        {/* 全局样式和主题变量 */}
        <style jsx global>{`
          :root {
            --header-height: 4rem;
            --sidebar-width: 16rem;
            --sidebar-collapsed-width: 4rem;
            --tabbar-height: 4rem;
          }
          
          /* 自定义滚动条 */
          ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }
          
          ::-webkit-scrollbar-track {
            background: transparent;
          }
          
          ::-webkit-scrollbar-thumb {
            background: rgba(156, 163, 175, 0.5);
            border-radius: 3px;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: rgba(156, 163, 175, 0.8);
          }
          
          .dark ::-webkit-scrollbar-thumb {
            background: rgba(75, 85, 99, 0.5);
          }
          
          .dark ::-webkit-scrollbar-thumb:hover {
            background: rgba(75, 85, 99, 0.8);
          }
          
          /* 平滑滚动 */
          html {
            scroll-behavior: smooth;
          }
          
          /* 防止水平滚动 */
          body {
            overflow-x: hidden;
          }
        `}</style>
      </body>
    </html>
  );
}
