'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, MapPin, Shield, Phone, Video, MoreVertical } from 'lucide-react';
import { useMatchStore } from '@/lib/stores/matchStore';
import { ChatMessage, ChatRoom as ChatRoomType } from '@/types';

interface ChatRoomProps {
  matchId: string;
}

export default function ChatRoom({ matchId }: ChatRoomProps) {
  const { activeChat, sendMessage, markMessagesAsRead } = useMatchStore();
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    await sendMessage(newMessage);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (!activeChat) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        <p>暂无活跃聊天</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow-sm border">
      {/* 聊天室头部 */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-3">
          <div className="flex -space-x-2">
            {activeChat.participants.map((participant, index) => (
              <div
                key={participant.id}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-medium border-2 border-white"
                style={{ zIndex: activeChat.participants.length - index }}
              >
                {participant.name.charAt(0)}
              </div>
            ))}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">
              {activeChat.participants.map(p => p.name).join(', ')}
            </h3>
            <p className="text-sm text-gray-500">
              {activeChat.participants.length} 人参与
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
            <Video className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeChat.messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.userId === 'current_user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                message.userId === 'current_user'
                  ? 'bg-blue-500 text-white'
                  : message.type === 'system'
                  ? 'bg-gray-100 text-gray-600 text-center'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {message.type !== 'system' && message.userId !== 'current_user' && (
                <div className="text-xs font-medium mb-1 opacity-70">
                  {message.user.name}
                </div>
              )}
              
              <div className="break-words">
                {message.type === 'location' ? (
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>共享了位置</span>
                  </div>
                ) : (
                  message.content
                )}
              </div>
              
              <div className={`text-xs mt-1 ${
                message.userId === 'current_user' 
                  ? 'text-blue-100' 
                  : 'text-gray-500'
              }`}>
                {formatTime(message.timestamp)}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="p-4 border-t">
        <div className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入消息..."
              className="w-full px-4 py-2 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={1}
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
          </div>
          
          <div className="flex space-x-1">
            <button
              onClick={() => sendMessage('', 'location')}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
              title="共享位置"
            >
              <MapPin className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>端到端加密保护</span>
          </div>
          <span>按 Enter 发送，Shift+Enter 换行</span>
        </div>
      </div>
    </div>
  );
}