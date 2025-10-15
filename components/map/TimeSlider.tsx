'use client';

import React, { useState, useEffect } from 'react';
import { useMapStore } from '@/lib/stores/mapStore';

interface TimeSliderProps {
  className?: string;
  onTimeChange?: (time: string) => void;
}

const TimeSlider: React.FC<TimeSliderProps> = ({ 
  className = '', 
  onTimeChange 
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const { timeFilter, setTimeFilter } = useMapStore();

  // 生成时间选项（每小时一个）
  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return `${hour}:00`;
  });

  // 获取当前时间
  useEffect(() => {
    const now = new Date();
    const currentHour = now.getHours().toString().padStart(2, '0');
    const initialTime = `${currentHour}:00`;
    setCurrentTime(initialTime);
    
    if (onTimeChange) {
      onTimeChange(initialTime);
    }
  }, []);

  // 处理时间变化
  const handleTimeChange = (time: string) => {
    setCurrentTime(time);
    
    // 更新时间筛选器
    setTimeFilter({
      start: time,
      end: time
    });
    
    if (onTimeChange) {
      onTimeChange(time);
    }
  };

  // 自动播放功能
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const currentIndex = timeOptions.indexOf(prev);
          const nextIndex = (currentIndex + 1) % timeOptions.length;
          const nextTime = timeOptions[nextIndex];
          
          // 更新时间筛选器
          setTimeFilter({
            start: nextTime,
            end: nextTime
          });
          
          if (onTimeChange) {
            onTimeChange(nextTime);
          }
          
          return nextTime;
        });
      }, 1000); // 每秒切换一次
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPlaying, timeOptions, setTimeFilter, onTimeChange]);

  // 格式化显示时间
  const formatDisplayTime = (time: string) => {
    const [hour] = time.split(':');
    const hourNum = parseInt(hour);
    
    if (hourNum === 0) return '午夜 00:00';
    if (hourNum < 6) return `凌晨 ${time}`;
    if (hourNum < 12) return `上午 ${time}`;
    if (hourNum === 12) return `中午 ${time}`;
    if (hourNum < 18) return `下午 ${time}`;
    return `晚上 ${time}`;
  };

  // 获取时段描述
  const getTimeDescription = (time: string) => {
    const [hour] = time.split(':');
    const hourNum = parseInt(hour);
    
    if (hourNum >= 6 && hourNum < 9) return '早高峰';
    if (hourNum >= 9 && hourNum < 11) return '上午时段';
    if (hourNum >= 11 && hourNum < 14) return '午餐时段';
    if (hourNum >= 14 && hourNum < 17) return '下午时段';
    if (hourNum >= 17 && hourNum < 20) return '晚高峰';
    if (hourNum >= 20 && hourNum < 23) return '晚间时段';
    return '深夜时段';
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-4 ${className}`}>
      {/* 标题 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">时间控制</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              isPlaying 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {isPlaying ? '暂停' : '播放'}
          </button>
        </div>
      </div>

      {/* 当前时间显示 */}
      <div className="text-center mb-4">
        <div className="text-2xl font-bold text-blue-600 mb-1">
          {formatDisplayTime(currentTime)}
        </div>
        <div className="text-sm text-gray-500">
          {getTimeDescription(currentTime)}
        </div>
      </div>

      {/* 时间滑块 */}
      <div className="mb-4">
        <input
          type="range"
          min="0"
          max={timeOptions.length - 1}
          value={timeOptions.indexOf(currentTime)}
          onChange={(e) => {
            const index = parseInt(e.target.value);
            const time = timeOptions[index];
            handleTimeChange(time);
          }}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, 
              #3b82f6 0%, 
              #3b82f6 ${(timeOptions.indexOf(currentTime) / (timeOptions.length - 1)) * 100}%, 
              #e5e7eb ${(timeOptions.indexOf(currentTime) / (timeOptions.length - 1)) * 100}%, 
              #e5e7eb 100%)`
          }}
        />
        
        {/* 时间刻度 */}
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>00:00</span>
          <span>06:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>23:00</span>
        </div>
      </div>

      {/* 快捷时间按钮 */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          { label: '早高峰', time: '08:00' },
          { label: '午餐时间', time: '12:00' },
          { label: '晚高峰', time: '18:00' },
          { label: '当前时间', time: new Date().getHours().toString().padStart(2, '0') + ':00' }
        ].map(({ label, time }) => (
          <button
            key={label}
            onClick={() => handleTimeChange(time)}
            className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
              currentTime === time
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 播放速度控制 */}
      {isPlaying && (
        <div className="border-t pt-3">
          <div className="text-sm text-gray-600 mb-2">播放速度</div>
          <div className="flex gap-2">
            {[
              { label: '0.5x', speed: 2000 },
              { label: '1x', speed: 1000 },
              { label: '2x', speed: 500 }
            ].map(({ label, speed }) => (
              <button
                key={label}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                onClick={() => {
                  // 这里可以实现播放速度控制
                  console.log(`设置播放速度: ${label}`);
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* CSS样式 */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
};

export default TimeSlider;