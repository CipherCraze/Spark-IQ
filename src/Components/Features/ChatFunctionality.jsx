import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import CryptoJS from 'crypto-js';
import EmojiPicker from 'emoji-picker-react';
import {
  UserCircleIcon,
  PaperAirplaneIcon,
  UsersIcon,
  LockClosedIcon,
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  PlusCircleIcon,
  VideoCameraIcon,
  PhotoIcon,
  FaceSmileIcon,
  EllipsisVerticalIcon,
  MicrophoneIcon,
  LinkIcon,
  ArrowPathIcon,
  PaperClipIcon,
  DocumentTextIcon,
  CheckIcon,
  ChevronDownIcon,
  StarIcon,
  ArrowUturnLeftIcon,
  TrashIcon,
  ArrowLeftIcon,
  PhoneIcon,
  InformationCircleIcon,
  GifIcon,
  MapPinIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as SolidStarIcon, MapPinIcon as SolidPinIcon } from '@heroicons/react/24/solid';

const socket = io('http://localhost:5000');

const ChatFunctionality = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [friends, setFriends] = useState([
    { 
      id: 1, 
      name: 'Alice Johnson', 
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      status: 'online',
      lastMessage: 'Hey, are you joining the study session?', 
      lastMessageTime: '2:30 PM',
      unread: 2,
      isFavorite: true
    },
    { 
      id: 2, 
      name: 'Bob Wilson', 
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      status: 'offline',
      lastMessage: 'Thanks for the notes!', 
      lastMessageTime: 'Yesterday',
      unread: 0,
      isFavorite: false
    },
    { 
      id: 3, 
      name: 'Charlie Brown', 
      avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
      status: 'online',
      lastMessage: 'See you tomorrow!', 
      lastMessageTime: '10:45 AM',
      unread: 1,
      isFavorite: true
    },
    { 
      id: 4, 
      name: 'Diana Miller', 
      avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
      status: 'idle',
      lastMessage: 'The project deadline was extended', 
      lastMessageTime: 'Monday',
      unread: 0,
      isFavorite: false
    },
  ]);
  const [groups, setGroups] = useState([
    { 
      id: 1, 
      name: 'Math Geniuses', 
      avatar: 'https://source.unsplash.com/random/300x300/?math',
      members: 12, 
      online: 8,
      lastMessage: 'Ethan: The test is next week', 
      lastMessageTime: '1:15 PM',
      unread: 3
    },
    { 
      id: 2, 
      name: 'Science Squad', 
      avatar: 'https://source.unsplash.com/random/300x300/?science',
      members: 15, 
      online: 5,
      lastMessage: 'You: I uploaded the lab results', 
      lastMessageTime: 'Yesterday',
      unread: 0
    },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [messageMenuOpen, setMessageMenuOpen] = useState(null);
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeMessageReactions, setActiveMessageReactions] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [activeTab, setActiveTab] = useState('friends');
  const [showChatInfo, setShowChatInfo] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [messageSearchOpen, setMessageSearchOpen] = useState(false);
  const [messageSearchQuery, setMessageSearchQuery] = useState('');

  const chatContainerRef = useRef(null);
  const messageInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const encryptionKey = 'secure-encryption-key-v2';

  // Encryption functions
  const encryptMessage = (text) => CryptoJS.AES.encrypt(text, encryptionKey).toString();
  const decryptMessage = (ciphertext) => {
    try {
      const bytes = CryptoJS.AES.decrypt(ciphertext, encryptionKey);
      return bytes.toString(CryptoJS.enc.Utf8) || '[Encrypted Message]';
    } catch {
      return '[Decryption Error]';
    }
  };

  // Send message
  const sendMessage = () => {
    if ((message.trim() || selectedFiles.length > 0) && activeChat) {
      const messageData = {
        chatId: activeChat.id,
        type: activeChat.type,
        timestamp: new Date().toISOString(),
        isRead: false,
        replyTo: replyingTo?.id || null
      };

      if (message.trim()) {
        messageData.message = encryptMessage(message);
        messageData.isText = true;
      }

      if (selectedFiles.length > 0) {
        messageData.files = selectedFiles.map(file => ({
          name: file.name,
          type: file.type,
          size: file.size,
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
        }));
      }

      socket.emit(activeChat.type === 'dm' ? 'sendDM' : 'sendGroupMessage', messageData);
      
      const newMessage = {
        id: Date.now(),
        text: message,
        sender: 'me',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isRead: false,
        files: selectedFiles.length > 0 ? selectedFiles.map(file => ({
          name: file.name,
          type: file.type,
          size: file.size,
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
        })) : [],
        replyTo: replyingTo
      };

      setMessages((prev) => [...prev, newMessage]);
      setMessage('');
      setSelectedFiles([]);
      setReplyingTo(null);
      
      // Mark as read immediately if it's our own message
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.id === newMessage.id ? {...msg, isRead: true} : msg
        ));
      }, 1000);
    }
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  // Remove selected file
  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Handle typing indicator
  const handleTyping = () => {
    if (!isTyping && activeChat) {
      socket.emit('typing', { 
        chatId: activeChat.id,
        userName: 'You' // In a real app, this would be the actual user's name
      });
      setIsTyping(true);
    }
    
    const timeout = setTimeout(() => {
      if (isTyping && activeChat) {
        socket.emit('stopTyping', activeChat.id);
        setIsTyping(false);
      }
    }, 2000);
    
    return () => clearTimeout(timeout);
  };

  // Handle message reactions
  const handleReaction = (messageId, reaction) => {
    setActiveMessageReactions((prev) => ({
      ...prev,
      [messageId]: [...(prev[messageId] || []), reaction],
    }));
    
    // In a real app, you would emit this to the server
    socket.emit('reactToMessage', {
      chatId: activeChat.id,
      messageId,
      reaction
    });
  };

  // Pin a message
  const pinMessage = (message) => {
    setPinnedMessages([...pinnedMessages, message]);
    // In a real app, you would emit this to the server
    socket.emit('pinMessage', {
      chatId: activeChat.id,
      messageId: message.id
    });
  };

  // Delete a message
  const deleteMessage = (messageId) => {
    setMessages(messages.filter((msg) => msg.id !== messageId));
    // In a real app, you would emit this to the server
    socket.emit('deleteMessage', {
      chatId: activeChat.id,
      messageId
    });
  };

  // Start a new chat
  const startNewChat = (type, chat) => {
    setActiveChat({ type, ...chat });
    setMessages([]); // Replace with actual chat history from API in real app
    setShowChatInfo(false);
    setReplyingTo(null);
    setIsSidebarCollapsed(window.innerWidth < 768);
  };

  // Toggle favorite status
  const toggleFavorite = (id) => {
    setFriends(friends.map(friend => 
      friend.id === id ? {...friend, isFavorite: !friend.isFavorite} : friend
    ));
  };

  // Filter friends and groups based on search query
  const filteredFriends = friends.filter((friend) =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter messages based on search query
  const filteredMessages = messages.filter(msg => 
    msg.text?.toLowerCase().includes(messageSearchQuery.toLowerCase())
  );

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, replyingTo]);

  // Focus input when chat changes
  useEffect(() => {
    if (messageInputRef.current) {
      messageInputRef.current.focus();
    }
  }, [activeChat, replyingTo]);

  // Socket event listeners
  useEffect(() => {
    socket.on('receiveDM', (data) => {
      if (activeChat?.id === data.chatId) {
        const decrypted = data.isText ? decryptMessage(data.message) : '[File]';
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            text: decrypted,
            sender: 'them',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            files: data.files || [],
            isRead: false,
            senderName: data.senderName || 'Them'
          },
        ]);
      }
    });

    socket.on('receiveGroupMessage', (data) => {
      if (data.chatId === activeChat?.id) {
        const decrypted = data.isText ? decryptMessage(data.message) : '[File]';
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            text: decrypted,
            sender: 'group',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            files: data.files || [],
            isRead: false,
            senderName: data.senderName || 'Group Member'
          },
        ]);
      }
    });

    socket.on('typing', ({ chatId, userName }) => {
      if (activeChat?.id === chatId) {
        setIsTyping(true);
        setTypingUser(userName);
      }
    });

    socket.on('stopTyping', (chatId) => {
      if (activeChat?.id === chatId) {
        setIsTyping(false);
        setTypingUser('');
      }
    });

    socket.on('messageRead', ({ messageId }) => {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? {...msg, isRead: true} : msg
      ));
    });

    return () => {
      socket.off('receiveDM');
      socket.off('receiveGroupMessage');
      socket.off('typing');
      socket.off('stopTyping');
      socket.off('messageRead');
    };
  }, [activeChat]);

  // Sample pinned messages (would come from API in real app)
  useEffect(() => {
    if (activeChat && messages.length > 0) {
      setPinnedMessages([
        {
          id: 999,
          text: "Important: Project deadline is Friday!",
          sender: 'them',
          timestamp: '2 days ago',
          pinnedBy: 'Alice'
        }
      ]);
    }
  }, [activeChat]);

  // Responsive sidebar handling
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarCollapsed(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex overflow-hidden">
      {/* Left Sidebar */}
      <div 
        className={`bg-gray-800 border-r border-gray-700 transition-all duration-300 flex flex-col ${
          isSidebarCollapsed ? 'hidden md:flex md:w-20' : 'w-80'
        }`}
      >
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          {!isSidebarCollapsed ? (
            <>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                SparkChat
              </h1>
              <button
                onClick={() => setIsSidebarCollapsed(true)}
                className="p-1 rounded-lg hover:bg-gray-700"
              >
                <ChevronDownIcon className="w-5 h-5 text-gray-400 transform rotate-90" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsSidebarCollapsed(false)}
              className="p-1 rounded-lg hover:bg-gray-700 mx-auto"
            >
              <Bars3Icon className="w-7 h-7 text-indigo-400" />
            </button>
          )}
        </div>

        <div className="p-3 border-b border-gray-700">
          {!isSidebarCollapsed ? (
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          ) : (
            <button className="p-2 rounded-lg hover:bg-gray-700 mx-auto block">
              <MagnifyingGlassIcon className="w-6 h-6 text-gray-400" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Tabs for Friends/Groups - only visible when expanded */}
          {!isSidebarCollapsed && (
            <div className="flex border-b border-gray-700">
              <button
                onClick={() => setActiveTab('friends')}
                className={`flex-1 py-3 text-sm font-medium ${
                  activeTab === 'friends' 
                    ? 'text-indigo-400 border-b-2 border-indigo-400' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Friends
              </button>
              <button
                onClick={() => setActiveTab('groups')}
                className={`flex-1 py-3 text-sm font-medium ${
                  activeTab === 'groups' 
                    ? 'text-purple-400 border-b-2 border-purple-400' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Groups
              </button>
            </div>
          )}

          {/* Friends List */}
          <div className={`${activeTab !== 'friends' && !isSidebarCollapsed ? 'hidden' : 'block'}`}>
            {!isSidebarCollapsed && (
              <h3 className="text-xs font-semibold text-gray-500 px-4 py-3 uppercase tracking-wider">
                Direct Messages
              </h3>
            )}
            
            {filteredFriends.map((friend) => (
              <div
                key={friend.id}
                onClick={() => startNewChat('dm', friend)}
                className={`flex items-center p-3 cursor-pointer transition-all ${
                  activeChat?.id === friend.id 
                    ? 'bg-gray-700/50' 
                    : 'hover:bg-gray-700/30'
                }`}
              >
                <div className="relative">
                  {isSidebarCollapsed ? (
                    <img 
                      src={friend.avatar} 
                      alt={friend.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <>
                      <img 
                        src={friend.avatar} 
                        alt={friend.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-800 ${
                        friend.status === 'online' ? 'bg-green-500' : 
                        friend.status === 'offline' ? 'bg-gray-500' : 'bg-yellow-500'
                      }`} />
                    </>
                  )}
                </div>
                
                {!isSidebarCollapsed && (
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-white font-medium truncate">{friend.name}</p>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(friend.id);
                        }}
                        className="text-gray-400 hover:text-yellow-400"
                      >
                        {friend.isFavorite ? (
                          <SolidStarIcon className="w-4 h-4 text-yellow-400" />
                        ) : (
                          <StarIcon className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-400 truncate">{friend.lastMessage}</p>
                      <span className="text-xs text-gray-500">{friend.lastMessageTime}</span>
                    </div>
                  </div>
                )}
                
                {friend.unread > 0 && (
                  <div className={`${
                    isSidebarCollapsed ? 'absolute top-1 right-1' : 'ml-2'
                  } bg-indigo-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs`}>
                    {friend.unread}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Group Chats */}
          <div className={`${activeTab !== 'groups' && !isSidebarCollapsed ? 'hidden' : 'block'}`}>
            {!isSidebarCollapsed && (
              <h3 className="text-xs font-semibold text-gray-500 px-4 py-3 uppercase tracking-wider">
                Study Groups
              </h3>
            )}
            
            {filteredGroups.map((group) => (
              <div
                key={group.id}
                onClick={() => startNewChat('group', group)}
                className={`flex items-center p-3 cursor-pointer transition-all ${
                  activeChat?.id === group.id 
                    ? 'bg-gray-700/50' 
                    : 'hover:bg-gray-700/30'
                }`}
              >
                {isSidebarCollapsed ? (
                  <div className="relative">
                    <img 
                      src={group.avatar} 
                      alt={group.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    {group.unread > 0 && (
                      <div className="absolute -top-1 -right-1 bg-indigo-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">
                        {group.unread}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <img 
                      src={group.avatar} 
                      alt={group.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div className="ml-3 flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{group.name}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-400 truncate">{group.lastMessage}</p>
                        <span className="text-xs text-gray-500">{group.lastMessageTime}</span>
                      </div>
                      <div className="flex items-center mt-1">
                        <UsersIcon className="w-3 h-3 text-gray-500 mr-1" />
                        <span className="text-xs text-gray-500">
                          {group.online}/{group.members} online
                        </span>
                      </div>
                    </div>
                    {group.unread > 0 && (
                      <div className="ml-2 bg-indigo-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">
                        {group.unread}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* User Profile - only visible when expanded */}
        {!isSidebarCollapsed && (
          <div className="p-3 border-t border-gray-700 flex items-center">
            <img 
              src="https://randomuser.me/api/portraits/men/1.jpg" 
              alt="User"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="ml-3 flex-1">
              <p className="text-white font-medium">John Doe</p>
              <p className="text-xs text-gray-400">Online</p>
            </div>
            <button className="p-1 rounded-lg hover:bg-gray-700">
              <EllipsisVerticalIcon className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-700 flex items-center justify-between bg-gray-800">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className="md:hidden p-2 hover:bg-gray-700 rounded-lg"
                >
                  <Bars3Icon className="w-5 h-5 text-gray-400" />
                </button>
                
                {activeChat.type === 'dm' ? (
                  <div className="relative">
                    <img 
                      src={friends.find(f => f.id === activeChat.id)?.avatar || 'https://randomuser.me/api/portraits/women/44.jpg'} 
                      alt={activeChat.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-800 ${
                      friends.find(f => f.id === activeChat.id)?.status === 'online' ? 'bg-green-500' : 
                      friends.find(f => f.id === activeChat.id)?.status === 'offline' ? 'bg-gray-500' : 'bg-yellow-500'
                    }`} />
                  </div>
                ) : (
                  <img 
                    src={groups.find(g => g.id === activeChat.id)?.avatar || 'https://source.unsplash.com/random/300x300/?group'} 
                    alt={activeChat.name}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                )}
                
                <div>
                  <h2 className="text-lg font-bold text-white">{activeChat.name}</h2>
                  {activeChat.type === 'dm' ? (
                    <p className="text-xs text-gray-400">
                      {friends.find(f => f.id === activeChat.id)?.status === 'online' ? 'Online' : 
                       friends.find(f => f.id === activeChat.id)?.status === 'idle' ? 'Idle' : 'Offline'}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400">
                      {groups.find(g => g.id === activeChat.id)?.online} online
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setMessageSearchOpen(!messageSearchOpen)}
                  className="p-2 hover:bg-gray-700 rounded-lg"
                >
                  <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                </button>
                <button className="p-2 hover:bg-gray-700 rounded-lg">
                  <PhoneIcon className="w-5 h-5 text-gray-400" />
                </button>
                <button className="p-2 hover:bg-gray-700 rounded-lg">
                  <VideoCameraIcon className="w-5 h-5 text-gray-400" />
                </button>
                <button 
                  onClick={() => setShowChatInfo(!showChatInfo)}
                  className="p-2 hover:bg-gray-700 rounded-lg"
                >
                  <InformationCircleIcon className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Message Search Bar */}
            {messageSearchOpen && (
              <div className="p-2 border-b border-gray-700 bg-gray-800 flex items-center">
                <button 
                  onClick={() => setMessageSearchOpen(false)}
                  className="p-2 hover:bg-gray-700 rounded-lg mr-2"
                >
                  <ArrowLeftIcon className="w-5 h-5 text-gray-400" />
                </button>
                <div className="relative flex-1">
                  <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search in conversation..."
                    value={messageSearchQuery}
                    onChange={(e) => setMessageSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden">
              {/* Messages Container */}
              <div 
                ref={chatContainerRef}
                className={`flex-1 overflow-y-auto p-4 bg-gray-900/50 ${
                  showChatInfo ? 'hidden md:block md:w-2/3' : 'w-full'
                }`}
              >
                {/* Pinned Messages Section */}
                {pinnedMessages.length > 0 && (
                  <div className="mb-6 p-3 bg-gray-800/50 rounded-xl border-l-4 border-purple-500">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-semibold text-purple-400 flex items-center">
                        <SolidPinIcon className="w-3 h-3 mr-1" />
                        PINNED MESSAGES
                      </h4>
                      <span className="text-xs text-gray-500">{pinnedMessages.length}</span>
                    </div>
                    {pinnedMessages.map((msg) => (
                      <div key={msg.id} className="p-2 bg-gray-800/30 rounded-lg mb-1">
                        <p className="text-gray-300 text-sm">{msg.text}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-500">{msg.sender === 'me' ? 'You' : msg.senderName || 'Them'}</span>
                          <span className="text-xs text-gray-500">{msg.timestamp}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-gray-800 rounded-full">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                    <span className="text-sm text-gray-400">{typingUser} is typing...</span>
                  </div>
                )}

                {/* Messages */}
                {messageSearchOpen ? (
                  filteredMessages.length > 0 ? (
                    filteredMessages.map((msg) => (
                      <MessageItem 
                        key={msg.id}
                        msg={msg}
                        activeChat={activeChat}
                        handleReaction={handleReaction}
                        setReplyingTo={setReplyingTo}
                        pinMessage={pinMessage}
                        deleteMessage={deleteMessage}
                        activeMessageReactions={activeMessageReactions}
                        isSearchResult={true}
                      />
                    ))
                  ) : (
                    <div className="text-center py-10 text-gray-500">
                      No messages found matching "{messageSearchQuery}"
                    </div>
                  )
                ) : (
                  messages.map((msg) => (
                    <MessageItem 
                      key={msg.id}
                      msg={msg}
                      activeChat={activeChat}
                      handleReaction={handleReaction}
                      setReplyingTo={setReplyingTo}
                      pinMessage={pinMessage}
                      deleteMessage={deleteMessage}
                      activeMessageReactions={activeMessageReactions}
                    />
                  ))
                )}
              </div>

              {/* Chat Info Sidebar */}
              {showChatInfo && (
                <div className="w-full md:w-1/3 bg-gray-800 border-l border-gray-700 overflow-y-auto">
                  <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">Chat Info</h3>
                    <button 
                      onClick={() => setShowChatInfo(false)}
                      className="p-1 hover:bg-gray-700 rounded-lg"
                    >
                      <XMarkIcon className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                  
                  <div className="p-4">
                    {activeChat.type === 'dm' ? (
                      <>
                        <div className="flex flex-col items-center mb-6">
                          <img 
                            src={friends.find(f => f.id === activeChat.id)?.avatar || 'https://randomuser.me/api/portraits/women/44.jpg'} 
                            alt={activeChat.name}
                            className="w-24 h-24 rounded-full object-cover mb-3"
                          />
                          <h4 className="text-xl font-bold text-white">{activeChat.name}</h4>
                          <p className="text-sm text-gray-400 mb-4">
                            {friends.find(f => f.id === activeChat.id)?.status === 'online' ? 'Online' : 
                             friends.find(f => f.id === activeChat.id)?.status === 'idle' ? 'Idle' : 'Offline'}
                          </p>
                          <div className="flex gap-3">
                            <button className="p-2 bg-indigo-600 rounded-full hover:bg-indigo-700">
                              <PhoneIcon className="w-5 h-5 text-white" />
                            </button>
                            <button className="p-2 bg-purple-600 rounded-full hover:bg-purple-700">
                              <VideoCameraIcon className="w-5 h-5 text-white" />
                            </button>
                            <button className="p-2 bg-gray-700 rounded-full hover:bg-gray-600">
                              <InformationCircleIcon className="w-5 h-5 text-white" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="mb-6">
                          <h5 className="text-sm font-semibold text-gray-400 mb-3">ABOUT</h5>
                          <p className="text-gray-300 text-sm">
                            Computer Science student at Stanford. Working on AI research.
                          </p>
                        </div>
                        
                        <div className="mb-6">
                          <h5 className="text-sm font-semibold text-gray-400 mb-3">MEDIA, LINKS, AND DOCS</h5>
                          <div className="grid grid-cols-3 gap-2">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                              <div key={i} className="aspect-square bg-gray-700 rounded-lg flex items-center justify-center">
                                <PhotoIcon className="w-8 h-8 text-gray-500" />
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex flex-col items-center mb-6">
                          <img 
                            src={groups.find(g => g.id === activeChat.id)?.avatar || 'https://source.unsplash.com/random/300x300/?group'} 
                            alt={activeChat.name}
                            className="w-24 h-24 rounded-lg object-cover mb-3"
                          />
                          <h4 className="text-xl font-bold text-white">{activeChat.name}</h4>
                          <p className="text-sm text-gray-400 mb-4">
                            {groups.find(g => g.id === activeChat.id)?.online} online • {groups.find(g => g.id === activeChat.id)?.members} members
                          </p>
                          <button className="px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 text-white font-medium">
                            Invite Members
                          </button>
                        </div>
                        
                        <div className="mb-6">
                          <h5 className="text-sm font-semibold text-gray-400 mb-3">DESCRIPTION</h5>
                          <p className="text-gray-300 text-sm">
                            Group for discussing advanced mathematics topics and collaborating on problem sets.
                          </p>
                        </div>
                        
                        <div className="mb-6">
                          <h5 className="text-sm font-semibold text-gray-400 mb-3">MEDIA, LINKS, AND DOCS</h5>
                          <div className="grid grid-cols-3 gap-2">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                              <div key={i} className="aspect-square bg-gray-700 rounded-lg flex items-center justify-center">
                                <PhotoIcon className="w-8 h-8 text-gray-500" />
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="text-sm font-semibold text-gray-400 mb-3">MEMBERS ({groups.find(g => g.id === activeChat.id)?.members})</h5>
                          <div className="space-y-3">
                            {['Alice Johnson', 'Bob Wilson', 'Charlie Brown', 'Diana Miller', 'Ethan Smith'].map((name, i) => (
                              <div key={i} className="flex items-center p-2 hover:bg-gray-700/50 rounded-lg cursor-pointer">
                                <img 
                                  src={`https://randomuser.me/api/portraits/${i % 2 === 0 ? 'women' : 'men'}/${i+10}.jpg`} 
                                  alt={name}
                                  className="w-10 h-10 rounded-full object-cover mr-3"
                                />
                                <div>
                                  <p className="text-white font-medium">{name}</p>
                                  <p className="text-xs text-gray-400">
                                    {i % 3 === 0 ? 'Online' : i % 3 === 1 ? 'Idle' : 'Offline'}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Reply Preview */}
            {replyingTo && (
              <div className="px-4 pt-2 pb-1 bg-gray-800 border-t border-gray-700 flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    <ArrowUturnLeftIcon className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-xs font-medium text-gray-400">Replying to {replyingTo.sender === 'me' ? 'yourself' : replyingTo.senderName || 'them'}</span>
                  </div>
                  <p className="text-sm text-gray-300 truncate">{replyingTo.text || '[File]'}</p>
                </div>
                <button 
                  onClick={() => setReplyingTo(null)}
                  className="p-1 hover:bg-gray-700 rounded-lg"
                >
                  <XMarkIcon className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            )}

            {/* File Preview */}
            {selectedFiles.length > 0 && (
              <div className="px-4 pt-2 pb-1 bg-gray-800 border-t border-gray-700">
                <div className="flex items-center overflow-x-auto pb-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center bg-gray-700/50 rounded-lg p-2 mr-2 flex-shrink-0">
                      {file.type.startsWith('image/') ? (
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt={file.name}
                          className="w-12 h-12 object-cover rounded mr-2"
                        />
                      ) : (
                        <DocumentTextIcon className="w-12 h-12 text-gray-400 p-2 mr-2" />
                      )}
                      <div className="mr-2">
                        <p className="text-xs text-white truncate w-20">{file.name}</p>
                        <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <button 
                        onClick={() => removeFile(index)}
                        className="p-1 hover:bg-gray-600 rounded-full"
                      >
                        <XMarkIcon className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Message Input */}
            <div className="p-4 border-t border-gray-700 bg-gray-800">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => fileInputRef.current.click()}
                    className="p-2 hover:bg-gray-700 rounded-lg"
                  >
                    <PaperClipIcon className="w-5 h-5 text-gray-400" />
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    multiple
                    className="hidden"
                  />
                  
                  <button
                    onClick={() => setEmojiPickerOpen(!emojiPickerOpen)}
                    className="p-2 hover:bg-gray-700 rounded-lg relative"
                  >
                    <FaceSmileIcon className="w-5 h-5 text-gray-400" />
                    {emojiPickerOpen && (
                      <div className="absolute bottom-full left-0 mb-2">
                        <EmojiPicker 
                          onEmojiClick={(emojiData) => {
                            setMessage(prev => prev + emojiData.emoji);
                            setEmojiPickerOpen(false);
                          }}
                          width={300}
                          height={400}
                          previewConfig={{ showPreview: false }}
                        />
                      </div>
                    )}
                  </button>
                </div>

                <div className="flex-1 relative">
                  <input
                    ref={messageInputRef}
                    type="text"
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    onKeyUp={handleTyping}
                    className="w-full px-4 py-3 bg-gray-700 rounded-xl text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="absolute right-3 top-3 flex items-center gap-1">
                    <button className="p-1 hover:bg-gray-600 rounded-lg">
                      <GifIcon className="w-5 h-5 text-gray-400" />
                    </button>
                    <button className="p-1 hover:bg-gray-600 rounded-lg">
                      <MapPinIcon className="w-5 h-5 text-gray-400" />
                    </button>
                    <button className="p-1 hover:bg-gray-600 rounded-lg">
                      <CalendarIcon className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={sendMessage}
                  disabled={!message.trim() && selectedFiles.length === 0}
                  className={`p-3 rounded-xl transition-all ${
                    message.trim() || selectedFiles.length > 0
                      ? 'bg-gradient-to-br from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600'
                      : 'bg-gray-700 cursor-not-allowed'
                  }`}
                >
                  <PaperAirplaneIcon className="w-5 h-5 text-white transform rotate-45" />
                </button>
              </div>
            </div>
          </>
        ) : (
          // Empty State
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-900 p-6">
            <div className="max-w-md text-center animate-fade-in">
              <div className="relative inline-block mb-8">
                <div className="w-32 h-32 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
                  <UsersIcon className="w-16 h-16 text-indigo-400 animate-float" />
                </div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 blur-lg" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Start a Conversation
              </h3>
              <p className="text-gray-400 mb-6">
                Select a chat from the sidebar or start a new one to begin messaging. All your conversations are protected with end-to-end encryption.
              </p>
              <div className="flex justify-center gap-3">
                <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-medium flex items-center">
                  <PlusCircleIcon className="w-5 h-5 mr-2" />
                  New Chat
                </button>
                <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white font-medium flex items-center">
                  <UsersIcon className="w-5 h-5 mr-2" />
                  Create Group
                </button>
              </div>
              <div className="mt-8 pt-6 border-t border-gray-800 flex items-center justify-center">
                <LockClosedIcon className="w-5 h-5 text-green-400 mr-2" />
                <span className="text-xs text-gray-500">End-to-end encrypted</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Message component for better organization
const MessageItem = ({ 
  msg, 
  activeChat, 
  handleReaction, 
  setReplyingTo, 
  pinMessage, 
  deleteMessage, 
  activeMessageReactions,
  isSearchResult = false
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  
  const messageRef = useRef(null);
  
  const reactions = ['👍', '❤️', '😂', '😮', '😢', '🙏'];
  
  const handleContextMenu = (e) => {
    e.preventDefault();
    setMenuOpen(true);
  };
  
  return (
    <div 
      ref={messageRef}
      className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'} mb-4 group relative ${
        isSearchResult ? 'bg-gray-800/50 rounded-lg' : ''
      }`}
      onContextMenu={handleContextMenu}
    >
      <div 
        className={`max-w-[85%] md:max-w-[70%] p-3 rounded-2xl relative transition-all ${
          msg.sender === 'me'
            ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white'
            : 'bg-gray-800'
        } ${isSearchResult ? '!bg-gray-700' : ''}`}
      >
        {/* Reply indicator */}
        {msg.replyTo && (
          <div className="mb-2 pl-3 border-l-2 border-gray-400/50">
            <p className="text-xs text-gray-300 font-medium">
              Replying to {msg.replyTo.sender === 'me' ? 'yourself' : msg.replyTo.senderName || 'them'}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {msg.replyTo.text || '[File]'}
            </p>
          </div>
        )}
        
        {/* Files */}
        {msg.files?.length > 0 && (
          <div className="mb-2">
            {msg.files.map((file, i) => (
              <div key={i} className="mb-2 last:mb-0">
                {file.preview ? (
                  <img 
                    src={file.preview} 
                    alt={file.name}
                    className="max-w-full max-h-60 rounded-lg object-cover"
                  />
                ) : (
                  <div className="p-3 bg-gray-700/50 rounded-lg flex items-center">
                    <DocumentTextIcon className="w-8 h-8 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-white truncate">{file.name}</p>
                      <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Message text */}
        {msg.text && <p className="text-white">{msg.text}</p>}
        
        {/* Message footer */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex space-x-1">
            {activeMessageReactions[msg.id]?.map((r, i) => (
              <span 
                key={i} 
                className="text-xs bg-gray-900/30 rounded-full px-1"
                onClick={() => handleReaction(msg.id, r)}
              >
                {r}
              </span>
            ))}
          </div>
          <div className="flex items-center">
            <span className="text-xs text-gray-300 mr-1">
              {msg.timestamp}
            </span>
            {msg.sender === 'me' && (
              <CheckIcon className={`w-3 h-3 ${
                msg.isRead ? 'text-blue-300' : 'text-gray-400'
              }`} />
            )}
          </div>
        </div>
        
        {/* Message menu button (hover) */}
        {!isSearchResult && (
          <div className="absolute right-0 -top-4 opacity-0 group-hover:opacity-100 transition-opacity flex bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            {reactions.slice(0, 3).map((r, i) => (
              <button
                key={i}
                onClick={() => handleReaction(msg.id, r)}
                className="p-1 hover:bg-gray-700 transition-colors"
              >
                <span className="text-sm">{r}</span>
              </button>
            ))}
            <button
              onClick={() => setMenuOpen(true)}
              className="p-1 hover:bg-gray-700 transition-colors"
            >
              <EllipsisVerticalIcon className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        )}
      </div>
      
      {/* Message menu (dropdown) */}
      {menuOpen && (
        <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-lg bg-gray-800 shadow-lg ring-1 ring-gray-700 focus:outline-none">
          <div className="py-1">
            <button
              onClick={() => {
                setReplyingTo(msg);
                setMenuOpen(false);
              }}
              className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 w-full text-left"
            >
              <ArrowUturnLeftIcon className="w-4 h-4 mr-2" />
              Reply
            </button>
            <button
              onClick={() => {
                pinMessage(msg);
                setMenuOpen(false);
              }}
              className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 w-full text-left"
            >
              <MapPinIcon className="w-4 h-4 mr-2" />
              Pin
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(msg.text);
                setMenuOpen(false);
              }}
              className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 w-full text-left"
            >
              <DocumentTextIcon className="w-4 h-4 mr-2" />
              Copy Text
            </button>
            {msg.sender === 'me' && (
              <button
                onClick={() => {
                  deleteMessage(msg.id);
                  setMenuOpen(false);
                }}
                className="flex items-center px-4 py-2 text-sm text-red-400 hover:bg-gray-700 w-full text-left"
              >
                <TrashIcon className="w-4 h-4 mr-2" />
                Delete
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatFunctionality;