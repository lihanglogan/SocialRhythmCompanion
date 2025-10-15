'use client';

import { useState } from 'react';
import { CrowdLevel } from '@/types';
import { Users, User, UserCheck, UserX } from 'lucide-react';

interface CrowdnessSliderProps {
  value: CrowdLevel | null;
  onChange: (value: CrowdLevel) => void;
}

export function CrowdnessSlider({ value, onChange }: CrowdnessSliderProps) {
  const [hoveredLevel, setHoveredLevel] = useState<CrowdLevel | null>(null);

  const crowdLevels = [
    {
      level: CrowdLevel.LOW,
      label: '人少',
      description: '很空闲，无需等待',
      icon: User,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      activeColor: 'bg-green-100 border-green-300'
    },
    {
      level: CrowdLevel.MEDIUM,
      label: '适中',
      description: '正常人流，稍作等待',
      icon: Users,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      activeColor: 'bg-yellow-100 border-yellow-300'
    },
    {
      level: CrowdLevel.HIGH,
      label: '拥挤',
      description: '人较多，需要等待',
      icon: UserCheck,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      activeColor: 'bg-orange-100 border-orange-300'
    },
    {
      level: CrowdLevel.VERY_HIGH,
      label: '非常拥挤',
      description: '人很多，等待较久',
      icon: UserX,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      activeColor: 'bg-red-100 border-red-300'
    }
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {crowdLevels.map((item) => {
          const Icon = item.icon;
          const isSelected = value === item.level;
          const isHovered = hoveredLevel === item.level;
          
          return (
            <button
              key={item.level}
              onClick={() => onChange(item.level)}
              onMouseEnter={() => setHoveredLevel(item.level)}
              onMouseLeave={() => setHoveredLevel(null)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                isSelected
                  ? `${item.activeColor} ${item.color}`
                  : isHovered
                    ? `${item.bgColor} ${item.borderColor}`
                    : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  isSelected ? item.bgColor : 'bg-gray-100'
                }`}>
                  <Icon className={`h-5 w-5 ${
                    isSelected ? item.color : 'text-gray-600'
                  }`} />
                </div>
                
                <div>
                  <div className={`font-medium ${
                    isSelected ? item.color : 'text-gray-900'
                  }`}>
                    {item.label}
                  </div>
                  <div className={`text-xs mt-1 ${
                    isSelected ? item.color : 'text-gray-500'
                  }`}>
                    {item.description}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 拥挤度说明 */}
      <div className="bg-gray-50 rounded-lg p-3">
        <h4 className="font-medium text-gray-900 text-sm mb-2">拥挤度参考标准</h4>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
          <div>
            <span className="font-medium text-green-600">人少:</span> 几乎没有排队，立即可办理
          </div>
          <div>
            <span className="font-medium text-yellow-600">适中:</span> 有少量排队，等待1-5分钟
          </div>
          <div>
            <span className="font-medium text-orange-600">拥挤:</span> 排队较长，等待5-15分钟
          </div>
          <div>
            <span className="font-medium text-red-600">非常拥挤:</span> 排队很长，等待15分钟以上
          </div>
        </div>
      </div>

      {/* 当前选择显示 */}
      {value && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 rounded">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <span className="text-sm text-blue-700">
              当前拥挤度: <span className="font-medium">{getCrowdLevelText(value)}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// 辅助函数
function getCrowdLevelText(level: CrowdLevel): string {
  const levelMap: Record<CrowdLevel, string> = {
    [CrowdLevel.LOW]: '人少',
    [CrowdLevel.MEDIUM]: '适中',
    [CrowdLevel.HIGH]: '拥挤',
    [CrowdLevel.VERY_HIGH]: '非常拥挤'
  };
  return levelMap[level] || level;
}