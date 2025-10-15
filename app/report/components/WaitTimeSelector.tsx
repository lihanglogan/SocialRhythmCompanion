'use client';

import { useState } from 'react';
import { WaitTimeRange } from '@/types';
import { Clock, Timer, AlertCircle, CheckCircle } from 'lucide-react';

interface WaitTimeSelectorProps {
  value: WaitTimeRange | null;
  onChange: (value: WaitTimeRange) => void;
}

export function WaitTimeSelector({ value, onChange }: WaitTimeSelectorProps) {
  const [hoveredRange, setHoveredRange] = useState<WaitTimeRange | null>(null);

  const waitTimeRanges = [
    {
      range: WaitTimeRange.NONE,
      label: '无需等待',
      description: '立即可办理',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      activeColor: 'bg-green-100 border-green-300',
      time: '0分钟'
    },
    {
      range: WaitTimeRange.SHORT,
      label: '1-5分钟',
      description: '很快就轮到',
      icon: Timer,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      activeColor: 'bg-blue-100 border-blue-300',
      time: '1-5分钟'
    },
    {
      range: WaitTimeRange.MEDIUM,
      label: '5-15分钟',
      description: '稍等一会',
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      activeColor: 'bg-yellow-100 border-yellow-300',
      time: '5-15分钟'
    },
    {
      range: WaitTimeRange.LONG,
      label: '15-30分钟',
      description: '需要耐心等待',
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      activeColor: 'bg-orange-100 border-orange-300',
      time: '15-30分钟'
    },
    {
      range: WaitTimeRange.VERY_LONG,
      label: '30分钟以上',
      description: '建议改时间',
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      activeColor: 'bg-red-100 border-red-300',
      time: '30分钟+'
    }
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-2">
        {waitTimeRanges.map((item) => {
          const Icon = item.icon;
          const isSelected = value === item.range;
          const isHovered = hoveredRange === item.range;
          
          return (
            <button
              key={item.range}
              onClick={() => onChange(item.range)}
              onMouseEnter={() => setHoveredRange(item.range)}
              onMouseLeave={() => setHoveredRange(null)}
              className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                isSelected
                  ? `${item.activeColor} ${item.color}`
                  : isHovered
                    ? `${item.bgColor} ${item.borderColor}`
                    : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    isSelected ? item.bgColor : 'bg-gray-100'
                  }`}>
                    <Icon className={`h-4 w-4 ${
                      isSelected ? item.color : 'text-gray-600'
                    }`} />
                  </div>
                  
                  <div>
                    <div className={`font-medium ${
                      isSelected ? item.color : 'text-gray-900'
                    }`}>
                      {item.label}
                    </div>
                    <div className={`text-sm ${
                      isSelected ? item.color : 'text-gray-500'
                    }`}>
                      {item.description}
                    </div>
                  </div>
                </div>
                
                <div className={`text-sm font-medium ${
                  isSelected ? item.color : 'text-gray-400'
                }`}>
                  {item.time}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 等待时间说明 */}
      <div className="bg-gray-50 rounded-lg p-3">
        <h4 className="font-medium text-gray-900 text-sm mb-2">等待时间参考</h4>
        <div className="space-y-1 text-xs text-gray-600">
          <div className="flex justify-between">
            <span className="font-medium text-green-600">无需等待:</span>
            <span>立即可以办理业务</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-blue-600">1-5分钟:</span>
            <span>前面有1-2个人排队</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-yellow-600">5-15分钟:</span>
            <span>前面有3-8个人排队</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-orange-600">15-30分钟:</span>
            <span>前面有较多人排队</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-red-600">30分钟以上:</span>
            <span>排队人数很多，建议择时再来</span>
          </div>
        </div>
      </div>

      {/* 当前选择显示 */}
      {value && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 rounded">
              <Clock className="h-4 w-4 text-blue-600" />
            </div>
            <span className="text-sm text-blue-700">
              预计等待时间: <span className="font-medium">{getWaitTimeText(value)}</span>
            </span>
          </div>
        </div>
      )}

      {/* 提示信息 */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
          <div className="text-sm text-amber-700">
            <div className="font-medium mb-1">温馨提示</div>
            <ul className="space-y-0.5 text-xs">
              <li>• 等待时间会根据时段和日期有所变化</li>
              <li>• 建议在非高峰时段前往，可减少等待</li>
              <li>• 准确的等待时间上报有助于其他用户合理安排时间</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// 辅助函数
function getWaitTimeText(range: WaitTimeRange): string {
  const rangeMap: Record<WaitTimeRange, string> = {
    [WaitTimeRange.NONE]: '无需等待',
    [WaitTimeRange.SHORT]: '1-5分钟',
    [WaitTimeRange.MEDIUM]: '5-15分钟',
    [WaitTimeRange.LONG]: '15-30分钟',
    [WaitTimeRange.VERY_LONG]: '30分钟以上'
  };
  return rangeMap[range] || range;
}