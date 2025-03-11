import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  XMarkIcon,
  BookmarkIcon,
  FaceSmileIcon,
  PaperClipIcon,
  EllipsisHorizontalIcon,
  ChevronLeftIcon,
  Bars3Icon,
  UserCircleIcon,
  BellIcon,
  
} from '@heroicons/react/24/outline';
import confetti from 'canvas-confetti';
import { ClipboardDocumentIcon, ChartBarIcon } from '@heroicons/react/24/solid';

const Chatbot = () => {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('chatHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [inputText, setInputText] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [reactions, setReactions] = useState({});
  const messagesEndRef = useRef(null);

  // Quick reply suggestions
  const quickReplies = [
    "Help with math homework",
    "Explain quantum physics",
    "History resources",
    "Writing tips",
    "Science project ideas"
  ];

  // Scroll to bottom and save messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    localStorage.setItem('chatHistory', JSON.stringify(messages));
    
    if(messages.length === 0) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [messages]);

  // Enhanced bot response simulation
  const simulateBotResponse = (userMessage) => {
    setIsBotTyping(true);
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 1,
        text: generateSmartResponse(userMessage),
        sender: 'bot',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsBotTyping(false);
    }, 1200);
  };

  const generateSmartResponse = (message) => {
    const responses = {
      math: "Let's break this down step by step. First, remember the formula...",
      science: "That's an excellent question! Here's a fundamental principle...",
      history: "This historical event can be understood through these key factors...",
      default: "I can help with that! Here are some resources:\n1. [Study Guide]\n2. [Video Tutorial]\n3. [Practice Problems]"
    };

    if(message.toLowerCase().includes('math')) return responses.math;
    if(message.toLowerCase().includes('science')) return responses.science;
    if(message.toLowerCase().includes('history')) return responses.history;
    return responses.default;
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      text: inputText,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    simulateBotResponse(inputText);
  };

  const addReaction = (messageId, emoji) => {
    setReactions(prev => ({
      ...prev,
      [messageId]: [...(prev[messageId] || []), emoji]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex">
      {/* Enhanced Sidebar */}
      <aside className={`fixed top-0 left-0 h-screen w-64 bg-gray-800/90 backdrop-blur-lg border-r border-gray-700/50 transform transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } z-50 flex flex-col`}>
        <div className="p-6 relative">
          <div className="flex items-center gap-3 mb-8">
            <SparklesIcon className="w-8 h-8 text-indigo-400 animate-pulse" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              SPARK-IQ
            </h1>
          </div>
          <nav className="space-y-2">
            {[
              { name: 'Dashboard', icon: UserCircleIcon, link: '/dashboard' },
              { name: 'Resources', icon: BookmarkIcon, link: '/resources' },
              { name: 'Analytics', icon: ChartBarIcon, link: '/analytics' },
              { name: 'History', icon: ClipboardDocumentIcon, link: '/history' }
            ].map((item, i) => (
              <Link
                key={i}
                to={item.link}
                className="flex items-center gap-3 p-3 text-gray-300 hover:bg-gray-700/50 rounded-lg group transition-all"
              >
                <item.icon className="w-5 h-5 text-indigo-400 group-hover:text-purple-400" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Chat Interface */}
      <main className={`flex-1 transition-margin duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <div className="flex flex-col h-screen">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-6 bg-gray-800/50 border-b border-gray-700/50">
            <div className="flex items-center gap-4">
              {!isSidebarOpen && (
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-2 hover:bg-gray-700/50 rounded-lg"
                >
                  <Bars3Icon className="w-6 h-6 text-gray-300" />
                </button>
              )}
              <div className="flex items-center gap-3">
                <ChatBubbleLeftRightIcon className="w-8 h-8 text-indigo-400 animate-pulse" />
                <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Sparky AI Assistant
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-700/50 rounded-full relative">
                <BellIcon className="w-6 h-6 text-gray-300" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <UserCircleIcon className="w-8 h-8 text-gray-300 hover:text-indigo-400 cursor-pointer" />
            </div>
          </div>

          {/* Enhanced Chat Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-gray-900/50 to-gray-800/50">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`relative max-w-[75%] p-4 rounded-2xl ${
                  message.sender === 'user' 
                    ? 'bg-indigo-500/90 text-white' 
                    : 'bg-gray-700/60 text-white'
                } shadow-lg transition-transform hover:scale-[1.02]`}>
                  <p className="text-lg">{message.text}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-300 opacity-70">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                    <div className="flex gap-2">
                      {reactions[message.id]?.map((emoji, i) => (
                        <span key={i} className="text-sm">{emoji}</span>
                      ))}
                    </div>
                  </div>
                  {message.sender === 'bot' && (
                    <div className="absolute -left-2 top-3 w-4 h-4 bg-gray-700/60 rotate-45 transform" />
                  )}
                </div>
              </div>
            ))}
            {isBotTyping && (
              <div className="flex items-center gap-2 text-gray-400 pl-4">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                </div>
                <span className="text-sm">Sparky is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Interactive Input Area */}
          <div className="p-6 bg-gray-800/50 border-t border-gray-700/50">
            <div className="grid gap-4">
              {/* Quick Reply Suggestions */}
              <div className="flex flex-wrap gap-2">
                {quickReplies.map((reply, i) => (
                  <button
                    key={i}
                    onClick={() => setInputText(reply)}
                    className="px-3 py-1.5 text-sm bg-gray-700/50 rounded-full text-gray-300 hover:bg-indigo-500/50 hover:text-white transition-colors"
                  >
                    {reply}
                  </button>
                ))}
              </div>
              
              {/* Main Input Area */}
              <div className="flex items-center gap-4">
                <button className="p-2 hover:bg-gray-700/50 rounded-full">
                  <PaperClipIcon className="w-6 h-6 text-gray-400" />
                </button>
                <div className="flex-1 relative">
                  <input
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask me anything..."
                    className="w-full px-4 py-3 bg-gray-800 rounded-xl text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-16"
                  />
                  <div className="absolute right-3 top-2.5 flex items-center gap-2">
                    <button className="p-1.5 hover:bg-gray-700/50 rounded-full">
                      <FaceSmileIcon className="w-6 h-6 text-gray-400" />
                    </button>
                    <button
                      onClick={handleSendMessage}
                      className="p-2 bg-indigo-500/90 rounded-xl hover:bg-indigo-600 transition-colors"
                    >
                      <PaperAirplaneIcon className="w-6 h-6 text-white rotate-45" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chatbot;