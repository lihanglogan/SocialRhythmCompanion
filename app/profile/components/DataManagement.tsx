'use client';

import { useState } from 'react';
import { useProfileStore } from '@/lib/stores/profileStore';
import { cn } from '@/lib/utils';
import {
  Download,
  Upload,
  Trash2,
  Shield,
  Archive,
  FileText,
  Database,
  Clock,
  AlertTriangle,
  CheckCircle,
  Info,
  RefreshCw,
  HardDrive,
  Cloud,
  Lock
} from 'lucide-react';

interface DataExportOption {
  id: string;
  name: string;
  description: string;
  format: 'json' | 'csv' | 'pdf';
  size: string;
  icon: React.ReactNode;
  included: string[];
}

interface BackupInfo {
  id: string;
  name: string;
  date: Date;
  size: string;
  type: 'auto' | 'manual';
  status: 'completed' | 'failed' | 'in_progress';
}

export function DataManagement() {
  const { exportUserData, deleteUserData } = useProfileStore();
  
  const [activeTab, setActiveTab] = useState<'export' | 'backup' | 'delete' | 'storage'>('export');
  const [selectedExportOptions, setSelectedExportOptions] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const exportOptions: DataExportOption[] = [
    {
      id: 'profile',
      name: '个人资料',
      description: '基本信息、偏好设置、隐私配置',
      format: 'json',
      size: '2.3 KB',
      icon: <FileText className="w-5 h-5" />,
      included: ['基本信息', '偏好设置', '隐私配置', '账户设置']
    },
    {
      id: 'history',
      name: '历史记录',
      description: '访问记录、上报历史、匹配记录',
      format: 'csv',
      size: '15.7 KB',
      icon: <Clock className="w-5 h-5" />,
      included: ['访问记录', '上报历史', '匹配记录', '搜索历史']
    },
    {
      id: 'achievements',
      name: '成就数据',
      description: '徽章、等级、进度信息',
      format: 'json',
      size: '4.1 KB',
      icon: <Shield className="w-5 h-5" />,
      included: ['获得徽章', '等级信息', '成就进度', '奖励记录']
    },
    {
      id: 'social',
      name: '社交数据',
      description: '好友列表、消息记录、互动数据',
      format: 'json',
      size: '8.9 KB',
      icon: <Database className="w-5 h-5" />,
      included: ['好友列表', '消息记录', '互动统计', '社区活动']
    }
  ];

  const mockBackups: BackupInfo[] = [
    {
      id: '1',
      name: '自动备份 - 每周',
      date: new Date('2024-01-15'),
      size: '28.4 KB',
      type: 'auto',
      status: 'completed'
    },
    {
      id: '2',
      name: '手动备份 - 重要更新前',
      date: new Date('2024-01-10'),
      size: '26.7 KB',
      type: 'manual',
      status: 'completed'
    },
    {
      id: '3',
      name: '自动备份 - 每周',
      date: new Date('2024-01-08'),
      size: '25.9 KB',
      type: 'auto',
      status: 'completed'
    }
  ];

  const handleExport = async () => {
    if (selectedExportOptions.length === 0) return;
    
    setIsExporting(true);
    try {
      await exportUserData('json');
      // 模拟导出过程
      setTimeout(() => {
        setIsExporting(false);
        // 这里应该触发文件下载
        console.log('导出完成:', selectedExportOptions);
      }, 2000);
    } catch (error) {
      console.error('导出失败:', error);
      setIsExporting(false);
    }
  };

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);
    try {
      // 模拟备份创建
      await new Promise(resolve => setTimeout(resolve, 3000));
      setIsCreatingBackup(false);
      console.log('备份创建完成');
    } catch (error) {
      console.error('备份创建失败:', error);
      setIsCreatingBackup(false);
    }
  };

  const handleDeleteData = async () => {
    if (deleteConfirmText !== '删除我的数据') return;
    
    try {
      await deleteUserData('all');
      setShowDeleteConfirm(false);
      setDeleteConfirmText('');
      console.log('数据删除完成');
    } catch (error) {
      console.error('数据删除失败:', error);
    }
  };

  const toggleExportOption = (optionId: string) => {
    setSelectedExportOptions(prev => 
      prev.includes(optionId) 
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    );
  };

  const getStatusIcon = (status: BackupInfo['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'in_progress':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
    }
  };

  const getStatusText = (status: BackupInfo['status']) => {
    switch (status) {
      case 'completed':
        return '已完成';
      case 'failed':
        return '失败';
      case 'in_progress':
        return '进行中';
    }
  };

  return (
    <div className="space-y-6">
      {/* 标签导航 */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        {[
          { id: 'export', label: '数据导出', icon: Download },
          { id: 'backup', label: '备份管理', icon: Archive },
          { id: 'delete', label: '数据删除', icon: Trash2 },
          { id: 'storage', label: '存储管理', icon: HardDrive }
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

      {/* 数据导出 */}
      {activeTab === 'export' && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900">数据导出说明</h3>
                <p className="text-sm text-blue-700 mt-1">
                  您可以导出个人数据用于备份或迁移。导出的数据将以加密格式保存，确保您的隐私安全。
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            {exportOptions.map((option) => (
              <div
                key={option.id}
                className={cn(
                  "border rounded-lg p-4 cursor-pointer transition-colors",
                  selectedExportOptions.includes(option.id)
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                )}
                onClick={() => toggleExportOption(option.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {option.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{option.name}</h3>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {option.format.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {option.included.map((item, index) => (
                          <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">{option.size}</div>
                    <input
                      type="checkbox"
                      checked={selectedExportOptions.includes(option.id)}
                      onChange={() => toggleExportOption(option.id)}
                      className="mt-2 w-4 h-4 text-blue-600 rounded"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">
                已选择 {selectedExportOptions.length} 项数据
              </p>
              <p className="text-sm text-gray-600">
                预计文件大小: {selectedExportOptions.length > 0 ? '约 31.0 KB' : '0 KB'}
              </p>
            </div>
            <button
              onClick={handleExport}
              disabled={selectedExportOptions.length === 0 || isExporting}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
                selectedExportOptions.length > 0 && !isExporting
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              )}
            >
              {isExporting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  导出中...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  导出数据
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 备份管理 */}
      {activeTab === 'backup' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">备份管理</h3>
              <p className="text-sm text-gray-600">管理您的数据备份，确保数据安全</p>
            </div>
            <button
              onClick={handleCreateBackup}
              disabled={isCreatingBackup}
              className={cn(
                "flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors",
                isCreatingBackup && "opacity-50 cursor-not-allowed"
              )}
            >
              {isCreatingBackup ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  创建中...
                </>
              ) : (
                <>
                  <Archive className="w-4 h-4" />
                  创建备份
                </>
              )}
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Cloud className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-green-900">自动备份</h4>
                  <p className="text-sm text-green-700">每周自动备份</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm text-green-700">下次备份: 2024-01-22</span>
                <button className="text-sm text-green-600 hover:text-green-700">
                  配置
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Lock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-blue-900">加密备份</h4>
                  <p className="text-sm text-blue-700">数据加密存储</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm text-blue-700">AES-256 加密</span>
                <button className="text-sm text-blue-600 hover:text-blue-700">
                  查看密钥
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">备份历史</h4>
            {mockBackups.map((backup) => (
              <div key={backup.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Archive className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-medium">{backup.name}</h5>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{backup.date.toLocaleDateString()}</span>
                      <span>{backup.size}</span>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(backup.status)}
                        <span>{getStatusText(backup.status)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-green-600 transition-colors">
                    <Upload className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 数据删除 */}
      {activeTab === 'delete' && (
        <div className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-900">危险操作</h3>
                <p className="text-sm text-red-700 mt-1">
                  删除数据是不可逆的操作。请确保您已经备份了重要数据。
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">清除缓存数据</h4>
              <p className="text-sm text-gray-600 mb-4">
                清除临时文件和缓存，不会影响您的个人数据
              </p>
              <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                清除缓存
              </button>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">删除历史记录</h4>
              <p className="text-sm text-gray-600 mb-4">
                删除访问历史、搜索记录等，保留个人资料和设置
              </p>
              <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                删除历史
              </button>
            </div>

            <div className="border border-red-200 rounded-lg p-4">
              <h4 className="font-medium mb-2 text-red-900">删除所有数据</h4>
              <p className="text-sm text-gray-600 mb-4">
                永久删除您的所有数据，包括个人资料、历史记录、成就等
              </p>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                删除所有数据
              </button>
            </div>
          </div>

          {/* 删除确认对话框 */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  <h3 className="text-lg font-semibold">确认删除</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  此操作将永久删除您的所有数据，包括：
                </p>
                <ul className="text-sm text-gray-600 mb-4 space-y-1">
                  <li>• 个人资料和设置</li>
                  <li>• 历史记录和统计</li>
                  <li>• 成就和徽章</li>
                  <li>• 社交数据和消息</li>
                </ul>
                <p className="text-sm text-red-600 mb-4">
                  请输入&quot;删除我的数据&quot;以确认操作：
                </p>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="请输入确认文本"
                  className="w-full px-3 py-2 border rounded-lg mb-4"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteConfirmText('');
                    }}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleDeleteData}
                    disabled={deleteConfirmText !== '删除我的数据'}
                    className={cn(
                      "flex-1 px-4 py-2 rounded-lg transition-colors",
                      deleteConfirmText === '删除我的数据'
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    )}
                  >
                    确认删除
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 存储管理 */}
      {activeTab === 'storage' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">存储使用情况</h3>
            <p className="text-sm text-gray-600">查看您的数据存储使用情况</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-gray-900">28.4 KB</div>
              <div className="text-sm text-gray-600">已使用 / 100 MB 总容量</div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '0.03%' }}></div>
            </div>
            <div className="text-center text-sm text-gray-600">
              剩余 99.97 MB 可用空间
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              { name: '个人资料', size: '2.3 KB', percentage: 8 },
              { name: '历史记录', size: '15.7 KB', percentage: 55 },
              { name: '成就数据', size: '4.1 KB', percentage: 14 },
              { name: '社交数据', size: '6.3 KB', percentage: 23 }
            ].map((item, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-sm text-gray-600">{item.size}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div 
                    className="bg-blue-600 h-1 rounded-full" 
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">存储优化建议</h4>
                <p className="text-sm text-blue-700 mt-1">
                  您的存储使用量很低，无需进行清理。定期备份数据可以确保数据安全。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}