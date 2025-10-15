'use client';

import { useEffect } from 'react';
import { AlertTriangle, Home, RefreshCw, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const router = useRouter();

  useEffect(() => {
    // 记录错误到监控服务
    console.error('场所详情页面错误:', error);
  }, [error]);

  const getErrorMessage = () => {
    if (error.message.includes('404') || error.message.includes('not found')) {
      return {
        title: '场所未找到',
        description: '抱歉，您要查看的场所信息不存在或已被删除。',
        suggestion: '请检查链接是否正确，或者浏览其他场所。'
      };
    }
    
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return {
        title: '网络连接异常',
        description: '无法加载场所信息，请检查您的网络连接。',
        suggestion: '请稍后重试或检查网络设置。'
      };
    }
    
    return {
      title: '加载失败',
      description: '场所信息加载时发生错误，这可能是临时问题。',
      suggestion: '请尝试刷新页面或稍后再试。'
    };
  };

  const errorInfo = getErrorMessage();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          {/* 错误图标 */}
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>

          {/* 错误标题 */}
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            {errorInfo.title}
          </h1>

          {/* 错误描述 */}
          <p className="text-gray-600 mb-2">
            {errorInfo.description}
          </p>

          <p className="text-sm text-gray-500 mb-8">
            {errorInfo.suggestion}
          </p>

          {/* 操作按钮 */}
          <div className="space-y-3">
            <button
              onClick={reset}
              className="w-full flex items-center justify-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              <span>重试</span>
            </button>

            <button
              onClick={() => router.back()}
              className="w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>返回上一页</span>
            </button>

            <button
              onClick={() => router.push('/places')}
              className="w-full flex items-center justify-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors"
            >
              <Home className="w-5 h-5" />
              <span>浏览其他场所</span>
            </button>
          </div>

          {/* 错误详情（开发环境） */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-8 text-left">
              <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                错误详情 (开发模式)
              </summary>
              <div className="mt-2 p-3 bg-gray-50 rounded text-xs text-gray-600 font-mono">
                <div className="mb-2">
                  <strong>错误消息:</strong> {error.message}
                </div>
                {error.digest && (
                  <div className="mb-2">
                    <strong>错误ID:</strong> {error.digest}
                  </div>
                )}
                {error.stack && (
                  <div>
                    <strong>调用栈:</strong>
                    <pre className="mt-1 whitespace-pre-wrap text-xs">
                      {error.stack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}
        </div>

        {/* 帮助信息 */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            如果问题持续存在，请联系技术支持
          </p>
          <div className="mt-2 space-x-4 text-xs text-gray-400">
            <span>错误时间: {new Date().toLocaleString()}</span>
            {error.digest && <span>错误ID: {error.digest.slice(0, 8)}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}