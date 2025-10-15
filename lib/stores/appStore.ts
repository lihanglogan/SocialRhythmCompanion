import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// 应用全局状态管理
interface AppState {
  // UI状态
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  searchOpen: boolean;
  isMobile: boolean;
  
  // 应用状态
  isOnline: boolean;
  currentPage: string;
  notifications: Array<{
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    timestamp: number;
    read: boolean;
  }>;
  
  // 设置
  settings: {
    language: 'zh' | 'en';
    enableNotifications: boolean;
    enableLocation: boolean;
    autoRefresh: boolean;
    refreshInterval: number;
  };
  
  // Actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  toggleSearch: () => void;
  setSearchOpen: (open: boolean) => void;
  setIsMobile: (isMobile: boolean) => void;
  setOnlineStatus: (online: boolean) => void;
  setCurrentPage: (page: string) => void;
  
  // 通知管理
  addNotification: (notification: Omit<AppState['notifications'][0], 'id' | 'timestamp' | 'read'>) => void;
  removeNotification: (id: string) => void;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  
  // 设置管理
  updateSettings: (settings: Partial<AppState['settings']>) => void;
  resetSettings: () => void;
}

// 默认设置
const defaultSettings: AppState['settings'] = {
  language: 'zh',
  enableNotifications: true,
  enableLocation: false,
  autoRefresh: true,
  refreshInterval: 30000, // 30秒
};

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        // 初始状态
        theme: 'system',
        sidebarOpen: false,
        mobileMenuOpen: false,
        searchOpen: false,
        isMobile: false,
        isOnline: true,
        currentPage: '/',
        notifications: [],
        settings: defaultSettings,

        // UI控制
        setTheme: (theme) => {
          set({ theme });
          // 应用主题到DOM
          if (typeof window !== 'undefined') {
            const root = window.document.documentElement;
            if (theme === 'dark') {
              root.classList.add('dark');
            } else if (theme === 'light') {
              root.classList.remove('dark');
            } else {
              // system theme
              const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
              if (mediaQuery.matches) {
                root.classList.add('dark');
              } else {
                root.classList.remove('dark');
              }
            }
          }
        },

        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
        setSidebarOpen: (open) => set({ sidebarOpen: open }),
        
        toggleMobileMenu: () => set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
        setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
        
        toggleSearch: () => set((state) => ({ searchOpen: !state.searchOpen })),
        setSearchOpen: (open) => set({ searchOpen: open }),
        
        setIsMobile: (isMobile) => set({ isMobile }),
        
        setOnlineStatus: (online) => set({ isOnline: online }),
        setCurrentPage: (page) => set({ currentPage: page }),

        // 通知管理
        addNotification: (notification) => {
          const newNotification = {
            ...notification,
            id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            read: false,
          };
          
          set((state) => ({
            notifications: [newNotification, ...state.notifications].slice(0, 50), // 最多保留50条通知
          }));
        },

        removeNotification: (id) => set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id),
        })),

        markNotificationRead: (id) => set((state) => ({
          notifications: state.notifications.map(n => 
            n.id === id ? { ...n, read: true } : n
          ),
        })),

        clearAllNotifications: () => set({ notifications: [] }),

        // 设置管理
        updateSettings: (newSettings) => set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

        resetSettings: () => set({ settings: defaultSettings }),
      }),
      {
        name: 'app-storage',
        partialize: (state) => ({
          theme: state.theme,
          settings: state.settings,
          notifications: state.notifications.filter(n => !n.read), // 只持久化未读通知
        }),
      }
    ),
    { name: 'app-store' }
  )
);

// 初始化主题
if (typeof window !== 'undefined') {
  const store = useAppStore.getState();
  store.setTheme(store.theme);
  
  // 监听在线状态
  const updateOnlineStatus = () => {
    store.setOnlineStatus(navigator.onLine);
  };
  
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  
  // 监听系统主题变化
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleThemeChange = () => {
    if (store.theme === 'system') {
      store.setTheme('system');
    }
  };
  
  mediaQuery.addEventListener('change', handleThemeChange);
}