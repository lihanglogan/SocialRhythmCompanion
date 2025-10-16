'use client';

import { useState } from 'react';
import { useProfileStore } from '@/lib/stores/profileStore';
import { cn } from '@/lib/utils';
import { 
  MessageSquare,
  Send,
  Star,
  ThumbsUp,
  ThumbsDown,
  Bug,
  Lightbulb,
  HelpCircle,
  Phone,
  Mail,
  MessageCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  FileText,
  Zap
} from 'lucide-react';

interface FeedbackItem {
  id: string;
  type: 'bug' | 'suggestion' | 'compliment' | 'complaint' | 'question';
  title: string;
  content: string;
  status: 'pending' | 'processing' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: Date;
  response?: string;
  responseTime?: Date;
  attachments?: string[];
  rating?: number;
}

interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
  helpful: number;
  notHelpful: number;
  tags: string[];
}

export function FeedbackCenter() {
  const { submitFeedback } = useProfileStore();
  
  const [activeTab, setActiveTab] = useState<'submit' | 'history' | 'faq' | 'contact'>('submit');
  const [feedbackType, setFeedbackType] = useState<FeedbackItem['type']>('suggestion');
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackContent, setFeedbackContent] = useState('');
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  // 模拟反馈历史数据
  const mockFeedbackHistory: FeedbackItem[] = [
    {
      id: '1',
      type: 'suggestion',
      title: '建议增加夜间模式',
      content: '希望应用能够支持夜间模式，这样在晚上使用时眼睛会更舒服。',
      status: 'resolved',
      priority: 'medium',
      timestamp: new Date('2024-01-10T14:30:00'),
      response: '感谢您的建议！我们已经在最新版本中添加了夜间模式功能，您可以在设置中开启。',
      responseTime: new Date('2024-01-12T10:15:00'),
      rating: 5
    },
    {
      id: '2',
      type: 'bug',
      title: '地图加载缓慢',
      content: '在网络较差的环境下，地图加载非常缓慢，有时候甚至无法加载。',
      status: 'processing',
      priority: 'high',
      timestamp: new Date('2024-01-14T09:20:00')
    },
    {
      id: '3',
      type: 'compliment',
      title: '应用设计很棒',
      content: '界面设计简洁美观，功能也很实用，给开发团队点赞！',
      status: 'resolved',
      priority: 'low',
      timestamp: new Date('2024-01-08T16:45:00'),
      response: '非常感谢您的认可和支持！我们会继续努力提供更好的用户体验。',
      responseTime: new Date('2024-01-09T08:30:00'),
      rating: 5
    }
  ];

  // 模拟FAQ数据
  const mockFAQs: FAQ[] = [
    {
      id: '1',
      category: '账户相关',
      question: '如何修改个人资料信息？',
      answer: '您可以在个人中心 > 用户信息页面中编辑您的个人资料，包括昵称、头像、联系方式等。修改后请点击保存按钮确认更改。',
      helpful: 25,
      notHelpful: 2,
      tags: ['个人资料', '编辑', '修改']
    },
    {
      id: '2',
      category: '功能使用',
      question: '如何查看附近的人流情况？',
      answer: '打开应用后，在首页地图上可以看到不同颜色的热力图，颜色越深表示人流越密集。您也可以点击具体地点查看详细的人流数据和预测。',
      helpful: 42,
      notHelpful: 1,
      tags: ['地图', '人流', '热力图']
    },
    {
      id: '3',
      category: '隐私安全',
      question: '我的位置信息会被泄露吗？',
      answer: '我们非常重视用户隐私保护。您的精确位置信息只会在本地处理，服务器只接收匿名化的区域统计数据。您可以随时在隐私设置中关闭位置分享功能。',
      helpful: 38,
      notHelpful: 3,
      tags: ['隐私', '位置', '安全']
    },
    {
      id: '4',
      category: '技术问题',
      question: '应用崩溃或卡顿怎么办？',
      answer: '如果遇到应用崩溃或卡顿，请尝试：1. 重启应用 2. 清理应用缓存 3. 更新到最新版本 4. 重启手机。如问题仍然存在，请联系客服并提供设备型号和系统版本信息。',
      helpful: 31,
      notHelpful: 5,
      tags: ['崩溃', '卡顿', '技术支持']
    }
  ];

  const feedbackTypes = [
    { value: 'suggestion', label: '功能建议', icon: Lightbulb, color: 'text-yellow-600' },
    { value: 'bug', label: '问题反馈', icon: Bug, color: 'text-red-600' },
    { value: 'compliment', label: '表扬建议', icon: ThumbsUp, color: 'text-green-600' },
    { value: 'complaint', label: '投诉建议', icon: ThumbsDown, color: 'text-orange-600' },
    { value: 'question', label: '使用咨询', icon: HelpCircle, color: 'text-blue-600' }
  ];

  const faqCategories = ['all', '账户相关', '功能使用', '隐私安全', '技术问题'];

  const filteredFAQs = mockFAQs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getStatusColor = (status: FeedbackItem['status']) => {
    switch (status) {
      case 'pending':
        return 'text-gray-600 bg-gray-100';
      case 'processing':
        return 'text-blue-600 bg-blue-100';
      case 'resolved':
        return 'text-green-600 bg-green-100';
      case 'closed':
        return 'text-red-600 bg-red-100';
    }
  };

  const getStatusText = (status: FeedbackItem['status']) => {
    switch (status) {
      case 'pending':
        return '待处理';
      case 'processing':
        return '处理中';
      case 'resolved':
        return '已解决';
      case 'closed':
        return '已关闭';
    }
  };

  const getPriorityColor = (priority: FeedbackItem['priority']) => {
    switch (priority) {
      case 'low':
        return 'text-gray-500';
      case 'medium':
        return 'text-yellow-500';
      case 'high':
        return 'text-orange-500';
      case 'urgent':
        return 'text-red-500';
    }
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackTitle.trim() || !feedbackContent.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await submitFeedback({
        type: feedbackType,
        title: feedbackTitle,
        content: feedbackContent,
        rating: rating || undefined
      });
      
      setFeedbackTitle('');
      setFeedbackContent('');
      setRating(0);
      setActiveTab('history');
      console.log('反馈提交成功');
    } catch (error) {
      console.error('提交反馈失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFAQHelpful = (faqId: string, helpful: boolean) => {
    console.log(`FAQ ${faqId} marked as ${helpful ? 'helpful' : 'not helpful'}`);
  };

  return (
    <div className="space-y-6">
      {/* 标签导航 */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        {[
          { id: 'submit', label: '提交反馈', icon: Send },
          { id: 'history', label: '反馈历史', icon: FileText },
          { id: 'faq', label: '常见问题', icon: HelpCircle },
          { id: 'contact', label: '联系我们', icon: Phone }
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

      {/* 提交反馈 */}
      {activeTab === 'submit' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">提交反馈</h3>
            <p className="text-gray-600 text-sm mb-6">
              您的反馈对我们非常重要，我们会认真对待每一条建议和意见。
            </p>
          </div>

          <div className="space-y-4">
            {/* 反馈类型 */}
            <div>
              <label className="block text-sm font-medium mb-3">反馈类型</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {feedbackTypes.map(({ value, label, icon: Icon, color }) => (
                  <button
                    key={value}
                    onClick={() => setFeedbackType(value as FeedbackItem['type'])}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 border rounded-lg transition-colors",
                      feedbackType === value
                        ? "border-blue-500 bg-blue-50 text-blue-600"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <Icon className={cn("w-6 h-6", feedbackType === value ? "text-blue-600" : color)} />
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 标题 */}
            <div>
              <label className="block text-sm font-medium mb-2">反馈标题</label>
              <input
                type="text"
                value={feedbackTitle}
                onChange={(e) => setFeedbackTitle(e.target.value)}
                placeholder="请简要描述您的反馈..."
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 详细内容 */}
            <div>
              <label className="block text-sm font-medium mb-2">详细描述</label>
              <textarea
                value={feedbackContent}
                onChange={(e) => setFeedbackContent(e.target.value)}
                placeholder="请详细描述您遇到的问题或建议..."
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={6}
              />
            </div>

            {/* 评分（可选） */}
            {(feedbackType === 'compliment' || feedbackType === 'complaint') && (
              <div>
                <label className="block text-sm font-medium mb-2">整体评分</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1"
                    >
                      <Star
                        className={cn(
                          "w-6 h-6",
                          star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
                        )}
                      />
                    </button>
                  ))}
                  <span className="text-sm text-gray-600 ml-2">
                    {rating > 0 ? `${rating} 星` : '请选择评分'}
                  </span>
                </div>
              </div>
            )}

            {/* 提交按钮 */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  setFeedbackTitle('');
                  setFeedbackContent('');
                  setRating(0);
                }}
                className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                重置
              </button>
              <button
                onClick={handleSubmitFeedback}
                disabled={isSubmitting || !feedbackTitle.trim() || !feedbackContent.trim()}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    提交中...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    提交反馈
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 反馈历史 */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">反馈历史</h3>
            <span className="text-sm text-gray-600">{mockFeedbackHistory.length} 条反馈</span>
          </div>

          {mockFeedbackHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>暂无反馈记录</p>
              <button
                onClick={() => setActiveTab('submit')}
                className="mt-2 text-blue-600 hover:text-blue-700"
              >
                提交您的第一条反馈
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {mockFeedbackHistory.map((feedback) => (
                <div key={feedback.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        feedbackTypes.find(t => t.value === feedback.type)?.color.replace('text-', 'bg-').replace('-600', '-100') || 'bg-gray-100'
                      )}>
                        {(() => {
                          const type = feedbackTypes.find(t => t.value === feedback.type);
                          const Icon = type?.icon || MessageSquare;
                          return <Icon className={cn("w-4 h-4", type?.color || 'text-gray-600')} />;
                        })()}
                      </div>
                      <div>
                        <h4 className="font-medium">{feedback.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <span>{feedback.timestamp.toLocaleDateString()}</span>
                          <span className={cn("px-2 py-0.5 rounded text-xs", getStatusColor(feedback.status))}>
                            {getStatusText(feedback.status)}
                          </span>
                          <span className={cn("text-xs", getPriorityColor(feedback.priority))}>
                            {feedback.priority === 'low' && '低优先级'}
                            {feedback.priority === 'medium' && '中优先级'}
                            {feedback.priority === 'high' && '高优先级'}
                            {feedback.priority === 'urgent' && '紧急'}
                          </span>
                        </div>
                      </div>
                    </div>
                    {feedback.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm">{feedback.rating}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-gray-700 mb-3">{feedback.content}</p>

                  {feedback.response && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageCircle className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">官方回复</span>
                        {feedback.responseTime && (
                          <span className="text-xs text-blue-600">
                            {feedback.responseTime.toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <p className="text-blue-800 text-sm">{feedback.response}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 常见问题 */}
      {activeTab === 'faq' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-4">常见问题</h3>
            
            {/* 搜索和筛选 */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="搜索问题..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {faqCategories.map((category) => (
                  <option key={category} value={category}>
                    {category === 'all' ? '全部分类' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* FAQ列表 */}
          <div className="space-y-3">
            {filteredFAQs.map((faq) => (
              <div key={faq.id} className="border rounded-lg">
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
                        {faq.category}
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-900">{faq.question}</h4>
                  </div>
                  {expandedFAQ === faq.id ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                
                {expandedFAQ === faq.id && (
                  <div className="px-4 pb-4 border-t bg-gray-50">
                    <p className="text-gray-700 mt-3 mb-4">{faq.answer}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {faq.tags.map((tag, index) => (
                          <span key={index} className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>这个答案有帮助吗？</span>
                        <button
                          onClick={() => handleFAQHelpful(faq.id, true)}
                          className="flex items-center gap-1 hover:text-green-600 transition-colors"
                        >
                          <ThumbsUp className="w-4 h-4" />
                          {faq.helpful}
                        </button>
                        <button
                          onClick={() => handleFAQHelpful(faq.id, false)}
                          className="flex items-center gap-1 hover:text-red-600 transition-colors"
                        >
                          <ThumbsDown className="w-4 h-4" />
                          {faq.notHelpful}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredFAQs.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <HelpCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>没有找到相关问题</p>
              <p className="text-sm mt-1">试试调整搜索关键词或分类</p>
            </div>
          )}
        </div>
      )}

      {/* 联系我们 */}
      {activeTab === 'contact' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">联系我们</h3>
            <p className="text-gray-600 text-sm">
              如果您有任何问题或需要帮助，欢迎通过以下方式联系我们。
            </p>
          </div>

          <div className="grid gap-4">
            {/* 在线客服 */}
            <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">在线客服</h4>
                <p className="text-sm text-gray-600">工作日 9:00-18:00 实时响应</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <MessageCircle className="w-4 h-4" />
                开始对话
              </button>
            </div>

            {/* 邮件联系 */}
            <div className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Mail className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">邮件联系</h4>
                <p className="text-sm text-gray-600">support@socialrhythm.com</p>
                <p className="text-xs text-gray-500">24小时内回复</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors">
                <ExternalLink className="w-4 h-4" />
                发送邮件
              </button>
            </div>

            {/* 电话支持 */}
            <div className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Phone className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">电话支持</h4>
                <p className="text-sm text-gray-600">400-123-4567</p>
                <p className="text-xs text-gray-500">工作日 9:00-18:00</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors">
                <Phone className="w-4 h-4" />
                拨打电话
              </button>
            </div>
          </div>

          {/* 响应时间说明 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-600" />
              <div>
                <h4 className="font-medium text-blue-900">响应时间说明</h4>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li>• 紧急问题：2小时内响应</li>
                  <li>• 一般问题：24小时内响应</li>
                  <li>• 功能建议：3个工作日内响应</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 快速操作 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium mb-3">快速操作</h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setActiveTab('submit')}
                className="flex items-center gap-2 p-3 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Zap className="w-4 h-4 text-yellow-600" />
                <span className="text-sm">提交反馈</span>
              </button>
              <button
                onClick={() => setActiveTab('faq')}
                className="flex items-center gap-2 p-3 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <HelpCircle className="w-4 h-4 text-blue-600" />
                <span className="text-sm">查看FAQ</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}