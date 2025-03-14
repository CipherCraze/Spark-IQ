import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import CryptoJS from 'crypto-js';
import {
  UserCircleIcon,
  PaperAirplaneIcon,
  UsersIcon,
  LockClosedIcon,
  Bars3Icon,
  MagnifyingGlassIcon,
  PlusCircleIcon,
  VideoCameraIcon,
  PhotoIcon,
  FaceSmileIcon,
  EllipsisVerticalIcon,
  MicrophoneIcon,
  LinkIcon,
  ArrowPathIcon,
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
  const [isTyping, setIsTyping] = useState(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [messageMenuOpen, setMessageMenuOpen] = useState(null);
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeMessageReactions, setActiveMessageReactions] = useState({});

  const chatContainerRef = useRef(null);
  const encryptionKey = 'secure-encryption-key';

  // Encryption functions
  const encryptMessage = (text) => CryptoJS.AES.encrypt(text, encryptionKey).toString();
  const decryptMessage = (ciphertext) => {
    const bytes = CryptoJS.AES.decrypt(ciphertext, encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  };

  // Send message
  const sendMessage = () => {
    if (message.trim() && activeChat) {
      const encryptedMessage = encryptMessage(message);
      const messageData = {
        chatId: activeChat.id,
        message: encryptedMessage,
        type: activeChat.type,
        timestamp: new Date().toISOString(),
      };

      socket.emit(activeChat.type === 'dm' ? 'sendDM' : 'sendGroupMessage', messageData);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: message,
          sender: 'me',
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
      setMessage('');
    }
  };

  // Handle typing indicator
  const handleTyping = () => {
    if (!isTyping) {
      socket.emit('typing', activeChat.id);
      setIsTyping(true);
    }
    const timeout = setTimeout(() => {
      socket.emit('stopTyping', activeChat.id);
      setIsTyping(false);
    }, 1000);
    return () => clearTimeout(timeout);
  };

  // Handle message reactions
  const handleReaction = (messageId, reaction) => {
    setActiveMessageReactions((prev) => ({
      ...prev,
      [messageId]: [...(prev[messageId] || []), reaction],
    }));
  };

  // Pin a message
  const pinMessage = (message) => {
    setPinnedMessages([...pinnedMessages, message]);
  };

  // Delete a message
  const deleteMessage = (messageId) => {
    setMessages(messages.filter((msg) => msg.id !== messageId));
  };

  // Start a new chat
  const startNewChat = (type, chat) => {
    setActiveChat({ type, ...chat });
    setMessages([]); // Replace with actual chat history
  };

  // Filter friends and groups based on search query
  const filteredFriends = friends.filter((friend) =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Socket event listeners
  useEffect(() => {
    socket.on('receiveDM', (data) => {
      const decrypted = decryptMessage(data.message);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: decrypted,
          sender: 'them',
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    });

    socket.on('receiveGroupMessage', (data) => {
      if (data.chatId === activeChat?.id) {
        const decrypted = decryptMessage(data.message);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            text: decrypted,
            sender: 'group',
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
      }
    });

    return () => {
      socket.off('receiveDM');
      socket.off('receiveGroupMessage');
    };
  }, [activeChat]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex">
      {/* Left Sidebar */}
      <div className={`w-96 bg-gray-800/50 border-r border-gray-700/50 p-6 transition-all duration-300 ${isSidebarCollapsed ? 'hidden' : 'block'}`}>
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
          {filteredFriends.map((friend) => (
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
          {filteredGroups.map((group) => (
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
            <div className="p-6 border-b border-gray-700/50 flex items-center justify-between bg-gradient-to-r from-gray-800/50 to-gray-900/50">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className="md:hidden p-2 hover:bg-gray-700/30 rounded-lg"
                >
                  <Bars3Icon className="w-6 h-6 text-gray-400" />
                </button>
                {activeChat.type === 'dm' ? (
                  <UserCircleIcon className="w-12 h-12 text-indigo-400" />
                ) : (
                  <UsersIcon className="w-12 h-12 text-purple-400" />
                )}
                <div>
                  <h2 className="text-xl font-bold text-white">{activeChat.name}</h2>
                  {activeChat.type === 'dm' && (
                    <p className="text-sm text-gray-400">
                      {friends.find((f) => f.id === activeChat.id)?.online ? 'Online' : 'Offline'}
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
              className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-900/50 to-gray-800/50 space-y-6"
            >
              {/* Pinned Messages Section */}
              {pinnedMessages.length > 0 && (
                <div className="mb-8 p-4 bg-gray-800/30 rounded-xl border border-purple-500/20">
                  <h4 className="text-sm font-semibold text-purple-400 mb-3">PINNED MESSAGES</h4>
                  {pinnedMessages.map((msg) => (
                    <div key={msg.id} className="p-3 bg-gray-700/20 rounded-lg mb-2">
                      <p className="text-gray-300 text-sm">{msg.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex items-center gap-2 text-gray-400">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                  </div>
                  <span className="text-sm">typing...</span>
                </div>
              )}

              {/* Messages */}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'} mb-6`}
                >
                  <div
                    className={`max-w-[70%] p-4 rounded-2xl relative transition-all duration-300 ${
                      msg.sender === 'me'
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white'
                        : 'bg-gray-700/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-300">{msg.sender === 'me' ? 'You' : activeChat.name}</span>
                      <button
                        onClick={() => setMessageMenuOpen(msg.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <EllipsisVerticalIcon className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                    <p className="text-white">{msg.text}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex space-x-1">
                        {activeMessageReactions[msg.id]?.map((r, i) => (
                          <span key={i} className="text-xs">{r}</span>
                        ))}
                      </div>
                      <span className="text-xs text-gray-400">{msg.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-6 border-t border-gray-700/50 bg-gray-900/30">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <button
                    onClick={() => setEmojiPickerOpen(!emojiPickerOpen)}
                    className="p-2 hover:bg-gray-700/30 rounded-lg"
                  >
                    <FaceSmileIcon className="w-6 h-6 text-gray-400" />
                  </button>
                  {emojiPickerOpen && (
                    <div className="absolute bottom-full mb-2 left-0 bg-gray-800 p-2 rounded-xl shadow-lg grid grid-cols-6 gap-1">
                      {['👍', '❤️', '😂', '😮', '😢', '🙏'].map((r, i) => (
                        <button
                          key={i}
                          onClick={() => handleReaction(messages[messages.length - 1]?.id, r)}
                          className="p-1 hover:bg-gray-700/30 rounded-lg text-xl"
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    onKeyUp={handleTyping}
                    className="w-full px-4 py-3 bg-gray-700/50 rounded-xl text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="absolute right-3 top-3 flex items-center gap-2">
                    <MicrophoneIcon className="w-5 h-5 text-gray-400 cursor-pointer hover:text-white" />
                    <PhotoIcon className="w-5 h-5 text-gray-400 cursor-pointer hover:text-white" />
                    <LinkIcon className="w-5 h-5 text-gray-400 cursor-pointer hover:text-white" />
                  </div>
                </div>

                <button
                  onClick={sendMessage}
                  className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all"
                >
                  <PaperAirplaneIcon className="w-6 h-6 text-white transform rotate-45" />
                </button>
              </div>
            </div>
          </>
        ) : (
          // Empty State
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-900/50 to-gray-800/50">
            <div className="text-center animate-fade-in">
              <div className="relative inline-block mb-6">
                <UsersIcon className="w-24 h-24 text-gray-400 animate-float" />
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full blur-xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-200 mb-2 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Start a Secure Conversation
              </h3>
              <p className="text-gray-400 max-w-md mx-auto">
                Your messages are protected with end-to-end encryption.
                <LockClosedIcon className="w-4 h-4 inline-block ml-1 text-green-400" />
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatFunctionality;