// 个人中心组件库 - 统一导出所有组件
// Social Rhythm Companion - Profile Components

// 核心组件
export { ProfileHeader } from './ProfileHeader';
export { UserInfo } from './UserInfo';
export { DataStats } from './DataStats';
export { HistoryRecords } from './HistoryRecords';
export { AchievementSystem } from './AchievementSystem';

// 设置组件
export { PreferencesSettings } from './PreferencesSettings';
export { PrivacyControls } from './PrivacyControls';
export { NotificationSettings } from './NotificationSettings';
export { DataManagement } from './DataManagement';

// 社交和反馈组件
export { SocialFeatures } from './SocialFeatures';
export { FeedbackCenter } from './FeedbackCenter';
export { AboutApp } from './AboutApp';

// 组件类型定义
export type ProfileComponent = 
  | 'ProfileHeader'
  | 'UserInfo'
  | 'DataStats'
  | 'HistoryRecords'
  | 'AchievementSystem'
  | 'PreferencesSettings'
  | 'PrivacyControls'
  | 'NotificationSettings'
  | 'DataManagement'
  | 'SocialFeatures'
  | 'FeedbackCenter'
  | 'AboutApp';

// 组件配置
export interface ProfileComponentConfig {
  id: ProfileComponent;
  name: string;
  description: string;
  category: 'overview' | 'stats' | 'history' | 'achievements' | 'social' | 'settings';
  icon?: string;
  requiresAuth?: boolean;
  premium?: boolean;
}

// 组件配置列表
export const PROFILE_COMPONENTS: ProfileComponentConfig[] = [
  {
    id: 'ProfileHeader',
    name: '个人信息头部',
    description: '显示用户头像、基本信息和等级',
    category: 'overview',
    requiresAuth: true
  },
  {
    id: 'UserInfo',
    name: '用户信息管理',
    description: '编辑和管理个人资料信息',
    category: 'overview',
    requiresAuth: true
  },
  {
    id: 'DataStats',
    name: '数据统计',
    description: '个人使用数据和统计图表',
    category: 'stats',
    requiresAuth: true
  },
  {
    id: 'HistoryRecords',
    name: '历史记录',
    description: '查看访问、上报和匹配历史',
    category: 'history',
    requiresAuth: true
  },
  {
    id: 'AchievementSystem',
    name: '成就系统',
    description: '查看获得的徽章和成就',
    category: 'achievements',
    requiresAuth: true
  },
  {
    id: 'SocialFeatures',
    name: '社交功能',
    description: '好友管理和社区互动',
    category: 'social',
    requiresAuth: true
  },
  {
    id: 'PreferencesSettings',
    name: '偏好设置',
    description: '个性化设置和偏好配置',
    category: 'settings',
    requiresAuth: true
  },
  {
    id: 'PrivacyControls',
    name: '隐私控制',
    description: '隐私设置和安全管理',
    category: 'settings',
    requiresAuth: true
  },
  {
    id: 'NotificationSettings',
    name: '通知设置',
    description: '通知偏好和推送管理',
    category: 'settings',
    requiresAuth: true
  },
  {
    id: 'DataManagement',
    name: '数据管理',
    description: '数据导出、备份和删除',
    category: 'settings',
    requiresAuth: true
  },
  {
    id: 'FeedbackCenter',
    name: '反馈中心',
    description: '提交反馈和查看常见问题',
    category: 'settings',
    requiresAuth: false
  },
  {
    id: 'AboutApp',
    name: '关于应用',
    description: '应用信息、团队介绍和法律条款',
    category: 'settings',
    requiresAuth: false
  }
];

// 工具函数
export const getComponentsByCategory = (category: ProfileComponentConfig['category']) => {
  return PROFILE_COMPONENTS.filter(component => component.category === category);
};

export const getComponentConfig = (id: ProfileComponent): ProfileComponentConfig | undefined => {
  return PROFILE_COMPONENTS.find(component => component.id === id);
};

export const getRequiredAuthComponents = (): ProfileComponentConfig[] => {
  return PROFILE_COMPONENTS.filter(component => component.requiresAuth);
};

export const getPublicComponents = (): ProfileComponentConfig[] => {
  return PROFILE_COMPONENTS.filter(component => !component.requiresAuth);
};

// 组件分类
export const COMPONENT_CATEGORIES = {
  overview: {
    name: '概览',
    description: '个人信息和基本概览',
    components: ['ProfileHeader', 'UserInfo'] as ProfileComponent[]
  },
  stats: {
    name: '统计',
    description: '数据统计和可视化',
    components: ['DataStats'] as ProfileComponent[]
  },
  history: {
    name: '历史',
    description: '历史记录和活动轨迹',
    components: ['HistoryRecords'] as ProfileComponent[]
  },
  achievements: {
    name: '成就',
    description: '徽章和成就系统',
    components: ['AchievementSystem'] as ProfileComponent[]
  },
  social: {
    name: '社交',
    description: '好友和社区功能',
    components: ['SocialFeatures'] as ProfileComponent[]
  },
  settings: {
    name: '设置',
    description: '个人设置和应用配置',
    components: [
      'PreferencesSettings',
      'PrivacyControls', 
      'NotificationSettings',
      'DataManagement',
      'FeedbackCenter',
      'AboutApp'
    ] as ProfileComponent[]
  }
} as const;

// 默认导出组件库信息
export default {
  name: 'Social Rhythm Profile Components',
  version: '1.0.0',
  description: 'Complete profile management component library for Social Rhythm Companion',
  components: PROFILE_COMPONENTS,
  categories: COMPONENT_CATEGORIES,
  totalComponents: PROFILE_COMPONENTS.length,
  authRequiredComponents: getRequiredAuthComponents().length,
  publicComponents: getPublicComponents().length
};