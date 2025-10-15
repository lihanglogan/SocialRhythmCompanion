export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏骨架 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-32 h-5 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区域骨架 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* 场所头部信息骨架 */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* 头部背景骨架 */}
            <div className="h-48 bg-gray-200 animate-pulse relative">
              <div className="absolute bottom-4 left-6">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-white bg-opacity-30 rounded animate-pulse"></div>
                  <div className="w-20 h-6 bg-white bg-opacity-30 rounded animate-pulse"></div>
                </div>
                <div className="w-48 h-8 bg-white bg-opacity-30 rounded animate-pulse mb-2"></div>
                <div className="w-64 h-4 bg-white bg-opacity-30 rounded animate-pulse"></div>
              </div>
            </div>

            {/* 主要信息骨架 */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div>
                      <div className="w-16 h-3 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="w-20 h-5 bg-gray-200 rounded animate-pulse mb-3"></div>
                    <div className="space-y-2">
                      <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="w-40 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                  <div>
                    <div className="w-24 h-5 bg-gray-200 rounded animate-pulse mb-3"></div>
                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-16 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 实时统计数据骨架 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="w-24 h-6 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 rounded-lg border-2 border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="w-20 h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
                  <div className="w-16 h-3 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>

          {/* 趋势图表骨架 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
              <div className="flex space-x-2">
                <div className="w-24 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="w-24 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
            </div>
            <div className="h-64 bg-gray-200 rounded-lg animate-pulse mb-4"></div>
            <div className="flex items-center justify-center space-x-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-8 h-3 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>

          {/* 地图和操作按钮骨架 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="w-24 h-5 bg-gray-200 rounded animate-pulse"></div>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                      <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                      <div className="w-16 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                    </div>
                  </div>
                </div>
                <div className="h-96 bg-gray-200 animate-pulse"></div>
              </div>
            </div>
            <div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="w-20 h-5 bg-gray-200 rounded animate-pulse mb-6"></div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                  </div>
                  <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

          {/* 相似场所推荐骨架 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-4">
                  <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}