'use client';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          Tailwind CSS 测试页面
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="w-12 h-12 bg-blue-500 rounded-lg mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">蓝色卡片</h3>
            <p className="text-gray-600">这是一个测试卡片，用于验证 Tailwind CSS 样式是否正确应用。</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="w-12 h-12 bg-green-500 rounded-lg mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">绿色卡片</h3>
            <p className="text-gray-600">如果你能看到这些样式，说明 Tailwind CSS 已经正确配置。</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="w-12 h-12 bg-purple-500 rounded-lg mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">紫色卡片</h3>
            <p className="text-gray-600">响应式布局和现代设计元素都应该正常显示。</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">按钮测试</h2>
          <div className="flex flex-wrap gap-4">
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors">
              主要按钮
            </button>
            <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors">
              成功按钮
            </button>
            <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors">
              危险按钮
            </button>
            <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-2 rounded-lg transition-colors">
              次要按钮
            </button>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <a href="/" className="text-blue-500 hover:text-blue-600 underline">
            返回首页
          </a>
        </div>
      </div>
    </div>
  );
}