'use client';

import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'text';
  color?: 'primary' | 'white' | 'dark';
}

export function Logo({ 
  className, 
  size = 'md', 
  variant = 'full',
  color = 'primary' 
}: LogoProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const colorClasses = {
    primary: 'text-primary-600 fill-primary-600',
    white: 'text-white fill-white',
    dark: 'text-gray-900 fill-gray-900 dark:text-white dark:fill-white',
  };

  // SVG 图标组件
  const IconSvg = () => (
    <svg
      viewBox="0 0 100 100"
      className={cn(sizeClasses[size], colorClasses[color], className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 外圆环 - 代表社区 */}
      <circle
        cx="50"
        cy="50"
        r="45"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        className="opacity-80"
      />
      
      {/* 内部节拍图案 - 代表节奏 */}
      <g className="fill-current">
        {/* 中心点 */}
        <circle cx="50" cy="50" r="6" />
        
        {/* 节拍波纹 */}
        <path d="M 30 50 Q 40 35 50 50 Q 60 65 70 50" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              className="opacity-90" />
        
        <path d="M 25 50 Q 37.5 30 50 50 Q 62.5 70 75 50" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              className="opacity-70" />
        
        <path d="M 20 50 Q 35 25 50 50 Q 65 75 80 50" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              className="opacity-50" />
      </g>
      
      {/* 连接点 - 代表社交连接 */}
      <g className="fill-current opacity-80">
        <circle cx="35" cy="35" r="3" />
        <circle cx="65" cy="35" r="3" />
        <circle cx="35" cy="65" r="3" />
        <circle cx="65" cy="65" r="3" />
        
        {/* 连接线 */}
        <line x1="35" y1="35" x2="50" y2="50" stroke="currentColor" strokeWidth="1" className="opacity-40" />
        <line x1="65" y1="35" x2="50" y2="50" stroke="currentColor" strokeWidth="1" className="opacity-40" />
        <line x1="35" y1="65" x2="50" y2="50" stroke="currentColor" strokeWidth="1" className="opacity-40" />
        <line x1="65" y1="65" x2="50" y2="50" stroke="currentColor" strokeWidth="1" className="opacity-40" />
      </g>
    </svg>
  );

  // 文字 Logo
  const TextLogo = () => (
    <span className={cn(
      'font-bold tracking-tight',
      textSizeClasses[size],
      colorClasses[color],
      className
    )}>
      Social Rhythm
    </span>
  );

  // 渲染不同变体
  if (variant === 'icon') {
    return <IconSvg />;
  }

  if (variant === 'text') {
    return <TextLogo />;
  }

  // 完整版本 (icon + text)
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <IconSvg />
      <TextLogo />
    </div>
  );
}

// 应用图标组件 (用于 favicon 等)
export function AppIcon({ 
  className,
  size = 32 
}: { 
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={cn('fill-primary-600', className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 背景圆 */}
      <circle cx="50" cy="50" r="50" fill="currentColor" />
      
      {/* 白色图标 */}
      <g className="fill-white">
        {/* 外圆环 */}
        <circle
          cx="50"
          cy="50"
          r="35"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          className="opacity-90"
        />
        
        {/* 中心点 */}
        <circle cx="50" cy="50" r="4" />
        
        {/* 节拍波纹 */}
        <path d="M 35 50 Q 42.5 40 50 50 Q 57.5 60 65 50" 
              fill="none" 
              stroke="white" 
              strokeWidth="2" 
              className="opacity-80" />
        
        <path d="M 30 50 Q 40 35 50 50 Q 60 65 70 50" 
              fill="none" 
              stroke="white" 
              strokeWidth="1.5" 
              className="opacity-60" />
        
        {/* 连接点 */}
        <circle cx="38" cy="38" r="2" className="opacity-70" />
        <circle cx="62" cy="38" r="2" className="opacity-70" />
        <circle cx="38" cy="62" r="2" className="opacity-70" />
        <circle cx="62" cy="62" r="2" className="opacity-70" />
      </g>
    </svg>
  );
}

// 加载动画 Logo
export function LogoSpinner({ 
  className,
  size = 'md'
}: {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={cn('animate-spin', sizeClasses[size], className)}>
      <Logo variant="icon" size={size} />
    </div>
  );
}