#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 启动 Social Rhythm Companion 后端开发服务器...\n');

// 设置环境变量
process.env.NODE_ENV = 'development';

// 启动开发服务器
const devServer = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, '..'),
  stdio: 'inherit',
  shell: true
});

devServer.on('error', (error) => {
  console.error('❌ 启动开发服务器失败:', error.message);
  process.exit(1);
});

devServer.on('close', (code) => {
  console.log(`\n📦 开发服务器已停止 (退出码: ${code})`);
  process.exit(code);
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n🛑 正在关闭开发服务器...');
  devServer.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 正在关闭开发服务器...');
  devServer.kill('SIGTERM');
});