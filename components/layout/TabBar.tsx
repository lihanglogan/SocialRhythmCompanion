'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Map, 
  MapPin, 
  Lightbulb, 
  FileText, 
  Users, 
  User,
  Route
} from 'lucide-react';
import { cn } from '@/lib/utils';

// 导航项配置
const navigationItems = [
  {
    name: '热图',
    href: '/',
    icon: Map,
    description: '查看实时人流热图',
  },
  {
    name: '场所',
    href: '/places',
    icon: MapPin,
    description: '发现周边场所',
  },
  {
    name: '建议',
    href: '/suggestions',
    icon: Lightbulb,
    description: '智能推荐',
  },
  {
    name: '上报',
    href: '/report',
    icon: FileText,
    description: '上报场所信息',
  },
  {
    name: '同行',
    href: '/match',
    icon: Users,
    description: '寻找同行伙伴',
  },
];

// 次要导航项（在更多菜单中显示）
const secondaryItems = [
  {
    name: '路线',
    href: '/routes',
    icon: Route,
    description: '路线规划',
  },
  {
    name: '我的',
    href: '/profile',
    icon: User,
    description: '个人中心',
  },
];

export function TabBar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* 移动端底部标签栏 */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="bg-white/95 backdrop-blur border-t border-gray-200 dark:bg-gray-900/95 dark:border-gray-800">
          <div className="grid grid-cols-5 h-16">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center space-y-1 px-1 py-2 text-xs transition-colors",
                    active
                      ? "text-primary-600 dark:text-primary-400"
                      : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                  )}
                >
                  <Icon 
                    className={cn(
                      "h-5 w-5 transition-transform",
                      active && "scale-110"
                    )} 
                  />
                  <span className={cn(
                    "font-medium",
                    active && "text-primary-600 dark:text-primary-400"
                  )}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* 为移动端底部标签栏预留空间 */}
      <div className="h-16 md:hidden" />
    </>
  );
}

// 桌面端导航菜单组件
export function NavigationMenu() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const allItems = [...navigationItems, ...secondaryItems];

  return (
    <nav className="hidden md:flex md:space-x-8">
      {allItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              active
                ? "bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-800"
            )}
            title={item.description}
          >
            <Icon className="h-4 w-4" />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}

// 快捷导航组件（用于侧边栏等）
export function QuickNavigation() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const allItems = [...navigationItems, ...secondaryItems];

  return (
    <div className="space-y-1">
      {allItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors group",
              active
                ? "bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-800"
            )}
          >
            <Icon className={cn(
              "h-5 w-5 transition-colors",
              active 
                ? "text-primary-600 dark:text-primary-400" 
                : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
            )} />
            <div className="flex-1">
              <div className="font-medium">{item.name}</div>
              <div className={cn(
                "text-xs",
                active 
                  ? "text-primary-600/70 dark:text-primary-400/70" 
                  : "text-gray-500 dark:text-gray-400"
              )}>
                {item.description}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}