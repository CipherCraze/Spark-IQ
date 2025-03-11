import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import CryptoJS from 'crypto-js';
import {
  UserCircleIcon,
  PaperAirplaneIcon,
  UsersIcon,
  LockClosedIcon,
  ChevronLeftIcon,
  Bars3Icon,
  MagnifyingGlassIcon,
  PlusCircleIcon,
  VideoCameraIcon,
  PhotoIcon,
  FaceSmileIcon,
} from '@heroicons/react/24/outline';

const socket = io('http://localhost:5000');

const ChatFunctionality = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [friends, setFriends] = useState([
    { id: 1, name: 'Alice Johnson', online: true, lastMessage: 'Hey, are you joining the study session?', unread: 2 },
    { id: 2, name: 'Bob Wilson', online: false, lastMessage: 'Thanks for the notes!', unread: 0 },
    { id: 3, name: 'Charlie Brown', online: true, lastMessage: 'See you tomorrow!', unread: 1 },
  ]);
  const [groups, setGroups] = useState([
    { id: 1, name: 'Math Geniuses', members: 12, online: 8 },
    { id: 2, name: 'Science Squad', members: 15, online: 5 },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const chatContainerRef = useRef(null);
  const encryptionKey = 'secure-encryption-key';

  // Encryption functions
  const encryptMessage = (text) => CryptoJS.AES.encrypt(text, encryptionKey).toString();
  const decryptMessage = (ciphertext) => {
    const bytes = CryptoJS.AES.decrypt(ciphertext, encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  };

  const sendMessage = () => {
    if (message.trim() && activeChat) {
      const encryptedMessage = encryptMessage(message);
      const messageData = {
        chatId: activeChat.id,
        message: encryptedMessage,
        type: activeChat.type,
        timestamp: new Date().toISOString()
      };

      socket.emit(activeChat.type === 'dm' ? 'sendDM' : 'sendGroupMessage', messageData);
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        text: message, 
        sender: 'me', 
        timestamp: new Date().toLocaleTimeString() 
      }]);
      setMessage('');
    }
  };

  useEffect(() => {
    socket.on('receiveDM', (data) => {
      const decrypted = decryptMessage(data.message);
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: decrypted,
        sender: 'them',
        timestamp: new Date().toLocaleTimeString()
      }]);
    });

    socket.on('receiveGroupMessage', (data) => {
      if (data.chatId === activeChat?.id) {
        const decrypted = decryptMessage(data.message);
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: decrypted,
          sender: 'group',
          timestamp: new Date().toLocaleTimeString()
        }]);
      }
    });

    return () => {
      socket.off('receiveDM');
      socket.off('receiveGroupMessage');
    };
  }, [activeChat]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const startNewChat = (type, chat) => {
    setActiveChat({ type, ...chat });
    setMessages([]); // Replace with actual chat history
  };

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex">
      {/* Left Sidebar */}
      <div className="w-96 bg-gray-800/50 border-r border-gray-700/50 p-6">
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            SparkChat
          </h1>
          <PlusCircleIcon className="w-8 h-8 text-purple-400 cursor-pointer hover:text-purple-300 transition-colors" />
        </div>

        <div className="mb-6 relative">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700/50 rounded-xl text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Friends List */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-400 mb-4">DIRECT MESSAGES</h3>
          {filteredFriends.map(friend => (
            <div
              key={friend.id}
              onClick={() => startNewChat('dm', friend)}
              className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-300 mb-2 ${
                activeChat?.id === friend.id ? 'bg-indigo-500/20' : 'hover:bg-gray-700/30'
              }`}
            >
              <div className="relative">
                <UserCircleIcon className="w-10 h-10 text-gray-400" />
                {friend.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800" />
                )}
              </div>
              <div className="ml-4 flex-1">
                <p className="text-white font-medium">{friend.name}</p>
                <p className="text-sm text-gray-400 truncate">{friend.lastMessage}</p>
              </div>
              {friend.unread > 0 && (
                <div className="bg-indigo-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">
                  {friend.unread}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Group Chats */}
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-4">STUDY GROUPS</h3>
          {filteredGroups.map(group => (
            <div
              key={group.id}
              onClick={() => startNewChat('group', group)}
              className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-300 mb-2 ${
                activeChat?.id === group.id ? 'bg-indigo-500/20' : 'hover:bg-gray-700/30'
              }`}
            >
              <UsersIcon className="w-10 h-10 text-purple-400" />
              <div className="ml-4 flex-1">
                <p className="text-white font-medium">{group.name}</p>
                <p className="text-sm text-gray-400">{group.online} online • {group.members} members</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="p-6 border-b border-gray-700/50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {activeChat.type === 'dm' ? (
                  <UserCircleIcon className="w-12 h-12 text-indigo-400" />
                ) : (
                  <UsersIcon className="w-12 h-12 text-purple-400" />
                )}
                <div>
                  <h2 className="text-xl font-bold text-white">{activeChat.name}</h2>
                  {activeChat.type === 'dm' && (
                    <p className="text-sm text-gray-400">
                      {friends.find(f => f.id === activeChat.id)?.online ? 
                      'Online' : 'Offline'}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <LockClosedIcon className="w-6 h-6 text-green-400" />
                <VideoCameraIcon className="w-6 h-6 text-gray-400 cursor-pointer hover:text-white transition-colors" />
              </div>
            </div>

            {/* Messages Container */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-900/50 to-gray-800/50"
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'} mb-6`}
                >
                  <div
                    className={`max-w-[70%] p-4 rounded-2xl relative transition-all duration-300 ${
                      msg.sender === 'me'
                        ? 'bg-indigo-500/20 ml-auto'
                        : 'bg-gray-700/30'
                    }`}
                  >
                    <p className="text-white">{msg.text}</p>
                    <p className="text-xs text-gray-400 mt-2">{msg.timestamp}</p>
                    {msg.sender !== 'me' && (
                      <div className="absolute -left-2 bottom-0 w-4 h-4 bg-gray-700/30 transform rotate-45" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-6 border-t border-gray-700/50">
              <div className="flex items-center gap-4">
                <FaceSmileIcon className="w-6 h-6 text-gray-400 cursor-pointer hover:text-white transition-colors" />
                <PhotoIcon className="w-6 h-6 text-gray-400 cursor-pointer hover:text-white transition-colors" />
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1 px-4 py-3 bg-gray-700/50 rounded-xl text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={sendMessage}
                  className="p-3 bg-indigo-500/90 rounded-xl hover:bg-indigo-600 transition-colors"
                >
                  <PaperAirplaneIcon className="w-6 h-6 text-white transform rotate-45" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-900/50 to-gray-800/50">
            <div className="text-center">
              <UsersIcon className="w-24 h-24 text-gray-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-200 mb-2">Select a chat to start messaging</h3>
              <p className="text-gray-400">Your encrypted conversations will appear here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatFunctionality;