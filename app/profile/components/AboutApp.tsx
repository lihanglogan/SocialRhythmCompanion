'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  Info,
  Heart,
  Shield,
  FileText,
  Users,
  Code,
  Globe,
  Star,
  Github,
  ExternalLink,
  Download,
  Smartphone,
  Monitor,
  Zap,
  Award,
  CheckCircle,
  Clock,
  Mail,
  MessageCircle
} from 'lucide-react';

interface TeamMember {
  name: string;
  role: string;
  avatar: string;
  bio: string;
}

interface Feature {
  title: string;
  description: string;
  icon: any;
  status: 'released' | 'beta' | 'coming-soon';
}

interface License {
  name: string;
  version: string;
  author: string;
  license: string;
  description: string;
}

export function AboutApp() {
  const [activeTab, setActiveTab] = useState<'info' | 'team' | 'features' | 'legal'>('info');
  const [expandedLicense, setExpandedLicense] = useState<string | null>(null);

  // 应用信息
  const appInfo = {
    name: 'Social Rhythm Companion',
    version: '1.2.3',
    buildNumber: '2024.01.15.001',
    releaseDate: '2024年1月15日',
    description: '一款智能的社交节奏伴侣应用，帮助用户发现最佳的出行时机，避开人群高峰，享受更好的城市生活体验。',
    platform: 'Web / iOS / Android',
    size: '45.2 MB',
    minVersion: 'iOS 13.0+ / Android 8.0+',
    developer: 'Social Rhythm Team',
    website: 'https://socialrhythm.app',
    privacy: 'https://socialrhythm.app/privacy',
    terms: 'https://socialrhythm.app/terms'
  };

  // 团队成员
  const teamMembers: TeamMember[] = [
    {
      name: '张伟',
      role: '产品经理',
      avatar: '👨‍💼',
      bio: '拥有8年产品设计经验，专注于用户体验和数据驱动的产品优化。'
    },
    {
      name: '李小雨',
      role: '前端工程师',
      avatar: '👩‍💻',
      bio: '全栈开发工程师，擅长React、Vue等现代前端技术栈。'
    },
    {
      name: '王大力',
      role: '后端工程师',
      avatar: '👨‍🔬',
      bio: '资深后端开发，专注于高并发系统设计和数据处理优化。'
    },
    {
      name: '陈小美',
      role: 'UI/UX设计师',
      avatar: '👩‍🎨',
      bio: '创意设计师，致力于打造简洁美观且易用的用户界面。'
    },
    {
      name: '刘志强',
      role: '数据科学家',
      avatar: '👨‍🔬',
      bio: '机器学习专家，负责人流预测算法和智能推荐系统的研发。'
    },
    {
      name: '赵小丽',
      role: '测试工程师',
      avatar: '👩‍🔧',
      bio: '质量保障专家，确保应用的稳定性和用户体验质量。'
    }
  ];

  // 功能特性
  const features: Feature[] = [
    {
      title: '实时人流监测',
      description: '基于大数据分析，实时显示各地点人流密度',
      icon: Users,
      status: 'released'
    },
    {
      title: '智能出行建议',
      description: 'AI算法分析最佳出行时间和路线推荐',
      icon: Zap,
      status: 'released'
    },
    {
      title: '同行匹配',
      description: '找到志同道合的出行伙伴，安全社交',
      icon: Heart,
      status: 'released'
    },
    {
      title: '场所详情',
      description: '详细的场所信息、评价和实时状态',
      icon: Info,
      status: 'released'
    },
    {
      title: '个人中心',
      description: '完整的用户资料管理和数据统计',
      icon: Award,
      status: 'released'
    },
    {
      title: 'AR导航',
      description: '增强现实导航，更直观的路线指引',
      icon: Monitor,
      status: 'beta'
    },
    {
      title: '语音助手',
      description: '智能语音交互，解放双手操作',
      icon: MessageCircle,
      status: 'coming-soon'
    },
    {
      title: '跨城市支持',
      description: '扩展到更多城市，覆盖全国主要地区',
      icon: Globe,
      status: 'coming-soon'
    }
  ];

  // 开源许可
  const licenses: License[] = [
    {
      name: 'React',
      version: '18.2.0',
      author: 'Facebook Inc.',
      license: 'MIT',
      description: '用于构建用户界面的JavaScript库'
    },
    {
      name: 'Next.js',
      version: '14.0.0',
      author: 'Vercel Inc.',
      license: 'MIT',
      description: 'React应用程序框架'
    },
    {
      name: 'Tailwind CSS',
      version: '3.4.0',
      author: 'Tailwind Labs Inc.',
      license: 'MIT',
      description: '实用优先的CSS框架'
    },
    {
      name: 'Lucide React',
      version: '0.300.0',
      author: 'Lucide Contributors',
      license: 'ISC',
      description: '美观的开源图标库'
    },
    {
      name: 'Zustand',
      version: '4.4.0',
      author: 'Poimandres',
      license: 'MIT',
      description: '轻量级状态管理库'
    }
  ];

  const getFeatureStatusColor = (status: Feature['status']) => {
    switch (status) {
      case 'released':
        return 'bg-green-100 text-green-800';
      case 'beta':
        return 'bg-blue-100 text-blue-800';
      case 'coming-soon':
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFeatureStatusText = (status: Feature['status']) => {
    switch (status) {
      case 'released':
        return '已发布';
      case 'beta':
        return '测试版';
      case 'coming-soon':
        return '即将推出';
    }
  };

  return (
    <div className="space-y-6">
      {/* 标签导航 */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        {[
          { id: 'info', label: '应用信息', icon: Info },
          { id: 'team', label: '开发团队', icon: Users },
          { id: 'features', label: '功能特性', icon: Star },
          { id: 'legal', label: '法律信息', icon: Shield }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as typeof activeTab)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
              activeTab === id
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* 应用信息 */}
      {activeTab === 'info' && (
        <div className="space-y-6">
          {/* 应用头部 */}
          <div className="text-center py-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <Zap className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{appInfo.name}</h2>
            <p className="text-gray-600 max-w-md mx-auto">{appInfo.description}</p>
          </div>

          {/* 版本信息 */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">版本信息</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">当前版本</span>
                  <span className="font-medium">{appInfo.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">构建号</span>
                  <span className="font-medium">{appInfo.buildNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">发布日期</span>
                  <span className="font-medium">{appInfo.releaseDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">支持平台</span>
                  <span className="font-medium">{appInfo.platform}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">应用大小</span>
                  <span className="font-medium">{appInfo.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">最低版本</span>
                  <span className="font-medium">{appInfo.minVersion}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">开发者</span>
                  <span className="font-medium">{appInfo.developer}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 快速链接 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <Globe className="w-6 h-6 text-blue-600" />
              <div className="text-left">
                <h4 className="font-medium">官方网站</h4>
                <p className="text-sm text-gray-600">了解更多信息</p>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
            </button>
            
            <button className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-6 h-6 text-green-600" />
              <div className="text-left">
                <h4 className="font-medium">检查更新</h4>
                <p className="text-sm text-gray-600">获取最新版本</p>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
            </button>
            
            <button className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <Github className="w-6 h-6 text-gray-800" />
              <div className="text-left">
                <h4 className="font-medium">开源代码</h4>
                <p className="text-sm text-gray-600">查看源码</p>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
            </button>
          </div>

          {/* 技术栈 */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">技术栈</h3>
            <div className="flex flex-wrap gap-2">
              {['React 18', 'Next.js 14', 'TypeScript', 'Tailwind CSS', 'Zustand', '高德地图', 'PWA'].map((tech, index) => (
                <span key={index} className="px-3 py-1 bg-white bg-opacity-70 text-blue-800 text-sm rounded-full">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 开发团队 */}
      {activeTab === 'team' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">开发团队</h3>
            <p className="text-gray-600 text-sm">
              我们是一支充满激情的团队，致力于为用户提供最佳的城市生活体验。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teamMembers.map((member, index) => (
              <div key={index} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
                  {member.avatar}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{member.name}</h4>
                  <p className="text-sm text-blue-600 mb-2">{member.role}</p>
                  <p className="text-sm text-gray-600">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 团队统计 */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="font-semibold mb-4">团队成就</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">6</div>
                <div className="text-sm text-gray-600">团队成员</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">2+</div>
                <div className="text-sm text-gray-600">年开发经验</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">15+</div>
                <div className="text-sm text-gray-600">功能模块</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">10k+</div>
                <div className="text-sm text-gray-600">用户服务</div>
              </div>
            </div>
          </div>

          {/* 联系方式 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-blue-600" />
              <div>
                <h4 className="font-medium text-blue-900">联系我们</h4>
                <p className="text-sm text-blue-700">
                  如果您有任何建议或合作意向，欢迎联系我们的团队。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 功能特性 */}
      {activeTab === 'features' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">功能特性</h3>
            <p className="text-gray-600 text-sm">
              探索我们为您精心打造的智能功能，让城市生活更加便捷。
            </p>
          </div>

          <div className="grid gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900">{feature.title}</h4>
                    <span className={cn("px-2 py-0.5 text-xs rounded-full", getFeatureStatusColor(feature.status))}>
                      {getFeatureStatusText(feature.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
                {feature.status === 'released' && (
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                )}
                {feature.status === 'beta' && (
                  <Clock className="w-5 h-5 text-blue-500 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>

          {/* 开发路线图 */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
            <h4 className="font-semibold mb-3">开发路线图</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Q1 2024: 核心功能完善，性能优化</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Q2 2024: AR导航，语音助手</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Q3 2024: 跨城市扩展，国际化</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span className="text-sm">Q4 2024: AI个性化推荐升级</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 法律信息 */}
      {activeTab === 'legal' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">法律信息</h3>
            <p className="text-gray-600 text-sm">
              了解我们的法律条款、隐私政策和开源许可信息。
            </p>
          </div>

          {/* 法律文档 */}
          <div className="grid gap-4">
            <button className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
              <FileText className="w-6 h-6 text-blue-600 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-medium">用户协议</h4>
                <p className="text-sm text-gray-600">查看完整的用户服务协议条款</p>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </button>

            <button className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
              <Shield className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-medium">隐私政策</h4>
                <p className="text-sm text-gray-600">了解我们如何保护您的隐私数据</p>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </button>

            <button className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
              <Code className="w-6 h-6 text-purple-600 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-medium">开源许可</h4>
                <p className="text-sm text-gray-600">查看第三方开源组件许可信息</p>
              </div>
            </button>
          </div>

          {/* 开源许可详情 */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="font-semibold mb-4">第三方开源组件</h4>
            <div className="space-y-3">
              {licenses.map((license, index) => (
                <div key={index} className="border bg-white rounded-lg">
                  <button
                    onClick={() => setExpandedLicense(expandedLicense === license.name ? null : license.name)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h5 className="font-medium">{license.name}</h5>
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                          v{license.version}
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
                          {license.license}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{license.description}</p>
                    </div>
                  </button>
                  
                  {expandedLicense === license.name && (
                    <div className="px-4 pb-4 border-t bg-gray-50">
                      <div className="mt-3 space-y-2 text-sm">
                        <div><strong>作者:</strong> {license.author}</div>
                        <div><strong>许可证:</strong> {license.license}</div>
                        <div><strong>描述:</strong> {license.description}</div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 版权声明 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">版权声明</h4>
                <p className="text-sm text-blue-700 mt-1">
                  © 2024 Social Rhythm Team. 保留所有权利。本应用的设计、代码和内容受版权法保护。
                  未经授权，不得复制、分发或修改本应用的任何部分。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}