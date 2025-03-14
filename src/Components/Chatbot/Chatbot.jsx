import { useState, useEffect, useRef } from 'react';
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  BookmarkIcon,
  Bars3Icon,
  UserCircleIcon,
  SunIcon,
  MoonIcon,
  PaperClipIcon,
  FaceSmileIcon,
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
  const [darkMode, setDarkMode] = useState(true);
  const [activeView, setActiveView] = useState('chat');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const messagesEndRef = useRef(null);

  // Quick reply suggestions
  const quickReplies = [
    { text: "Help with math homework", type: "math" },
    { text: "Explain quantum physics", type: "science" },
    { text: "History resources", type: "history" },
    { text: "Writing tips", type: "writing" },
    { text: "Science project ideas", type: "science" },
  ];

  // Enhanced background effect
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.zIndex = '-1';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Starfield background
    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2,
      speed: Math.random() * 0.5,
    }));

    const animate = () => {
      ctx.fillStyle = darkMode ? '#0f172a' : '#f8fafc';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = darkMode ? '#e2e8f0' : '#1e293b';
      stars.forEach((star) => {
        star.y += star.speed;
        if (star.y > canvas.height) star.y = 0;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(animate);
    };

    animate();
    return () => canvas.remove();
  }, [darkMode]);

  // Scroll to bottom and save messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    localStorage.setItem('chatHistory', JSON.stringify(messages));

    if (messages.length === 0) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [messages]);

  // Enhanced bot response simulation
  const simulateBotResponse = (userMessage) => {
    setIsBotTyping(true);
    setTimeout(() => {
      const botResponse = {
        id: Date.now(),
        text: generateSmartResponse(userMessage),
        sender: 'bot',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botResponse]);
      setIsBotTyping(false);
    }, 1200);
  };

  const generateSmartResponse = (message) => {
    const responses = {
      math: "Let's break this down step by step:\n1. Identify the problem type\n2. Apply relevant formula\n3. Solve step-by-step\n4. Verify your answer",
      science: "Scientific concepts involved:\n- Quantum superposition\n- Wave-particle duality\n- Schrödinger equation\nLet's explore these fundamentals...",
      history: "Historical context:\n1. Timeline of events\n2. Key figures involved\n3. Socio-political factors\n4. Long-term impacts",
      writing: "Writing improvement tips:\n1. Outline your structure\n2. Use active voice\n3. Show, don't tell\n4. Edit ruthlessly",
      default: "Here are comprehensive resources:\n- [Detailed Study Guide]\n- [Interactive Tutorial]\n- [Practice Exercises]\n- [Expert Video Explanation]",
    };

    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('math')) return responses.math;
    if (lowerMessage.includes('science') || lowerMessage.includes('physics')) return responses.science;
    if (lowerMessage.includes('history')) return responses.history;
    if (lowerMessage.includes('writing')) return responses.writing;
    return responses.default;
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMessage]);
    setInputText('');
    simulateBotResponse(inputText);
  };

  const pinMessage = (messageId) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, pinned: !msg.pinned } : msg
      )
    );
  };

  const generateStudyPlan = () => {
    const plan = `Weekly Study Plan:
    1. Monday: Math practice (2hrs)
    2. Tuesday: Science experiments (1.5hrs)
    3. Wednesday: History research (2hrs)
    4. Thursday: Writing exercises (1hr)
    5. Friday: Project work (3hrs)`;

    simulateBotResponse(plan);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const newMessage = {
        id: Date.now(),
        text: `📎 Uploaded file: ${file.name}`,
        sender: 'user',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, newMessage]);
      simulateBotResponse(`User uploaded a file: ${file.name}`);
    }
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  // Enhanced message context menu
  const MessageContextMenu = ({ messageId }) => (
    <div className="absolute right-2 top-2 bg-gray-700/90 rounded-lg p-2 shadow-lg">
      <button
        onClick={() => pinMessage(messageId)}
        className="flex items-center gap-2 p-2 hover:bg-gray-600/50 rounded-md"
      >
        📌 {selectedMessage?.pinned ? 'Unpin' : 'Pin'}
      </button>
      <button
        onClick={() => navigator.clipboard.writeText(selectedMessage?.text)}
        className="flex items-center gap-2 p-2 hover:bg-gray-600/50 rounded-md"
      >
        ⎘ Copy
      </button>
    </div>
  );

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : 'light'}`}>
      {/* Sidebar */}
        <aside
          className={`fixed top-0 left-0 h-screen w-64 bg-gray-800/90 backdrop-blur-lg border-r border-gray-700/50 transform transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } z-50 flex flex-col`}
        >
          <div className="p-6 relative">
            <div className="flex items-center gap-3 mb-8">
          <SparklesIcon className="w-8 h-8 text-indigo-400 animate-pulse" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            SPARK-IQ
          </h1>
            </div>
            <nav className="space-y-2">
          {[
            { name: 'Dashboard', icon: ChartBarIcon, action: () => window.location.href = '/dashboard' },
            { name: 'New Chat', icon: SparklesIcon, action: () => setMessages([]) },
            { name: 'Generate Study Plan', icon: BookmarkIcon, action: generateStudyPlan },
          ].map((item, i) => (
            <button
              key={i}
              onClick={item.action}
              className="w-full flex items-center gap-3 p-3 text-gray-300 hover:bg-gray-700/50 rounded-lg group transition-all"
            >
              <item.icon className="w-5 h-5 text-indigo-400 group-hover:text-purple-400" />
              <span>{item.name}</span>
            </button>
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
              <button
                onClick={toggleDarkMode}
                className="p-2 hover:bg-gray-700/50 rounded-full"
              >
                {darkMode ? (
                  <SunIcon className="w-6 h-6 text-gray-300" />
                ) : (
                  <MoonIcon className="w-6 h-6 text-gray-300" />
                )}
              </button>
              <UserCircleIcon className="w-8 h-8 text-gray-300 hover:text-indigo-400 cursor-pointer" />
            </div>
          </div>

          {/* Chat Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-gray-900/50 to-gray-800/50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`relative max-w-[75%] p-4 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-indigo-500/90 text-white'
                      : 'bg-gray-700/60 text-white'
                  } shadow-lg transition-transform hover:scale-[1.02] group ${
                    message.pinned ? 'border-2 border-yellow-400' : ''
                  }`}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setSelectedMessage(message.id === selectedMessage?.id ? null : message);
                  }}
                >
                  {message.pinned && (
                    <span className="absolute -top-2 -left-2 text-yellow-400">📌</span>
                  )}
                  <p className="text-lg whitespace-pre-wrap">{message.text}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-300 opacity-70">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  {selectedMessage?.id === message.id && (
                    <MessageContextMenu messageId={message.id} />
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

          {/* Input Area */}
          <div className="p-6 bg-gray-800/50 border-t border-gray-700/50">
            <div className="grid gap-4">
              {/* Quick Reply Suggestions */}
              <div className="flex flex-wrap gap-2">
                {quickReplies.map((reply, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInputText(reply.text);
                      handleSendMessage();
                    }}
                    className="px-3 py-1.5 text-sm bg-gray-700/50 rounded-full text-gray-300 hover:bg-indigo-500/50 hover:text-white transition-colors"
                  >
                    {reply.text}
                  </button>
                ))}
              </div>

              {/* Main Input Area */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    accept=".pdf,.doc,.txt"
                  />
                  <PaperClipIcon className="w-6 h-6 text-gray-400 cursor-pointer" />
                </div>
                <div className="flex-1 relative">
                  <input
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask me anything..."
                    className="w-full px-4 py-3 bg-gray-800 rounded-xl text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-16"
                  />
                  <div className="absolute right-3 top-2.5 flex items-center gap-2">
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