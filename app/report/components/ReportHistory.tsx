'use client';

import { useState, useEffect } from 'react';
import { Clock, MapPin, Users, Timer, Camera, Star, Award, TrendingUp } from 'lucide-react';
import { ReportStatus } from '@/types';

// 模拟上报历史数据
interface MockReportHistory {
  id: string;
  placeName: string;
  address: string;
  crowdnessLevel: number;
  waitTime: string;
  photos?: string[];
  comment?: string;
  serviceQuality?: {
    attitude: number;
    efficiency: number;
    environment: number;
  };
  status: ReportStatus;
  createdAt: string;
  rejectReason?: string;
}

const mockReportHistory: MockReportHistory[] = [
  {
    id: '1',
    placeName: '市政务服务中心',
    address: '市中心大道123号',
    crowdnessLevel: 2,
    waitTime: '10-30分钟',
    photos: ['photo1.jpg', 'photo2.jpg'],
    comment: '服务效率不错，工作人员态度很好',
    serviceQuality: {
      attitude: 5,
      efficiency: 4,
      environment: 4
    },
    status: ReportStatus.APPROVED,
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    placeName: '银行营业厅',
    address: '商业街456号',
    crowdnessLevel: 3,
    waitTime: '30-60分钟',
    status: ReportStatus.PENDING,
    createdAt: '2024-01-14T14:20:00Z'
  },
  {
    id: '3',
    placeName: '医院挂号处',
    address: '健康路789号',
    crowdnessLevel: 4,
    waitTime: '1小时以上',
    comment: '排队时间过长，建议增加窗口',
    status: ReportStatus.REJECTED,
    createdAt: '2024-01-13T09:15:00Z',
    rejectReason: '照片不清晰，无法验证信息'
  }
];

export function ReportHistory() {
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | ReportStatus>('all');
  const [reportHistory] = useState<MockReportHistory[]>(mockReportHistory);

  useEffect(() => {
    // 模拟加载过程
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'approved': return 'text-green-600 bg-green-50 border-green-200';
      case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = (status: ReportStatus) => {
    switch (status) {
      case 'pending': return '审核中';
      case 'approved': return '已通过';
      case 'rejected': return '已拒绝';
      default: return '未知';
    }
  };

  const filteredHistory = filter === 'all' 
    ? reportHistory 
    : reportHistory.filter(report => report.status === filter);

  const stats = {
    total: reportHistory.length,
    approved: reportHistory.filter(r => r.status === 'approved').length,
    pending: reportHistory.filter(r => r.status === 'pending').length,
    rejected: reportHistory.filter(r => r.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">总上报数</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Award className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              <p className="text-sm text-gray-500">已通过</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              <p className="text-sm text-gray-500">审核中</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Star className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.approved > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%
              </p>
              <p className="text-sm text-gray-500">通过率</p>
            </div>
          </div>
        </div>
      </div>

      {/* 筛选器 */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { key: 'all', label: '全部', count: stats.total },
          { key: 'approved', label: '已通过', count: stats.approved },
          { key: 'pending', label: '审核中', count: stats.pending },
          { key: 'rejected', label: '已拒绝', count: stats.rejected },
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilter(key as typeof filter)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {/* 上报历史列表 */}
      {filteredHistory.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">
            {filter === 'all' ? '暂无上报记录' : `暂无${getStatusText(filter as ReportStatus)}的记录`}
          </p>
          <p className="text-sm text-gray-400">
            开始您的第一次上报，为社区贡献有价值的信息
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map((report) => (
            <div key={report.id} className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <MapPin className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{report.placeName}</h3>
                    <p className="text-sm text-gray-500">{report.address}</p>
                  </div>
                </div>
                
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(report.status)}`}>
                  {getStatusText(report.status)}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    拥挤度: {['很空闲', '较空闲', '一般', '拥挤'][report.crowdnessLevel - 1]}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    等待: {report.waitTime}
                  </span>
                </div>
                
                {report.photos && report.photos.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Camera className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {report.photos.length} 张照片
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {report.comment && (
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <p className="text-sm text-gray-700">{report.comment}</p>
                </div>
              )}

              {report.serviceQuality && (
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <span>服务态度:</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < report.serviceQuality!.attitude
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>办事效率:</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < report.serviceQuality!.efficiency
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>环境设施:</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < report.serviceQuality!.environment
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {report.status === 'rejected' && report.rejectReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                  <p className="text-sm text-red-700">
                    <span className="font-medium">拒绝原因: </span>
                    {report.rejectReason}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 激励提示 */}
      {stats.approved >= 2 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Award className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">恭喜您成为活跃贡献者！</h4>
              <p className="text-sm text-gray-600">
                您已成功上报 {stats.approved} 次，为社区提供了宝贵的信息。
                继续保持，解锁更多成就徽章！
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}