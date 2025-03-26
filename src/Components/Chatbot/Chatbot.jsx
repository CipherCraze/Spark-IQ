import axios from 'axios';
import { useState, useEffect, useRef } from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
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
  XMarkIcon,
  ClockIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import confetti from 'canvas-confetti';
import { ChartBarIcon } from '@heroicons/react/24/solid';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const Chatbot = () => {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('chatHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [chatHistory, setChatHistory] = useState(() => {
    const saved = localStorage.getItem('allChatSessions');
    return saved ? JSON.parse(saved) : [];
  });
  const [inputText, setInputText] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('current'); // 'current' or 'history'
  const messagesEndRef = useRef(null);

  // Quick reply suggestions
  const quickReplies = [
    { text: "Explain the Pythagorean theorem", type: "math" },
    { text: "What's the solution to x² - 5x + 6 = 0?", type: "math" },
    { text: "Derive the quadratic formula", type: "math" },
    { text: "Explain quantum entanglement", type: "science" },
    { text: "Help with calculus homework", type: "math" },
  ];

  // Background effect
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-1';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

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
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
    }
  }, [messages]);

  const sendMessageToGemini = async (messages) => {
    try {
      // Map chat history to Gemini's expected format
      const contents = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
        { contents },
        {
          params: { key: GEMINI_API_KEY },
          headers: { 'Content-Type': 'application/json' },
        }
      );

      return response.data.candidates?.[0]?.content?.parts?.[0]?.text || 'I couldn’t generate a response.';
    } catch (error) {
      console.error('Error fetching response:', error);
      return 'Sorry, something went wrong. Please try again.';
    }
  };

  // Render LaTeX equations
  const renderTextWithLaTeX = (text) => {
    const segments = text.split(/(\$\$.*?\$\$|\\\(.*?\\\)|\\\[.*?\\\])/s);
    return segments.map((segment, index) => {
      if (segment.match(/^\$\$.*\$\$$/)) {
        return <BlockMath key={index} math={segment.slice(2, -2)} />;
      } else if (segment.match(/^\\\(.*\\\)$/)) {
        return <InlineMath key={index} math={segment.slice(2, -2)} />;
      } else if (segment.match(/^\\\[.*\\\]$/)) {
        return <BlockMath key={index} math={segment.slice(2, -2)} />;
      }
      return <span key={index}>{segment}</span>;
    });
  };

  useEffect(() => {
    const initialPrompt = `Hello! I'm Sparky, your AI assistant. I can help with math and science problems and will format equations properly:
    
    - Inline equations: \\(E=mc^2\\)
    - Block equations: $$\\int_0^\\infty x^2 dx$$
    
    How can I help you today?`;
    
    if (messages.length === 0) {
      setMessages([{
        id: Date.now(),
        text: initialPrompt,
        sender: 'bot',
        timestamp: new Date().toISOString()
      }]);
    }
  }, []);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    const newMessage = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };
    
    setMessages((prev) => [...prev, newMessage]);
    setInputText('');
    setIsBotTyping(true);

    const updatedMessages = [...messages, newMessage];
    const botResponse = await sendMessageToGemini(updatedMessages);

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), text: botResponse, sender: 'bot', timestamp: new Date().toISOString() },
    ]);
    
    setIsBotTyping(false);
  };

  const pinMessage = (messageId) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, pinned: !msg.pinned } : msg))
    );
  };

  const generateStudyPlan = () => {
    const plan = `📚 Weekend Study Plan (All Subjects) 📚

🔹 Mathematics:
1. Algebra: Practice solving quadratic equations $$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$
2. Geometry: Review area formulas $$A_{circle} = \\pi r^2$$, $$A_{triangle} = \\frac{1}{2}bh$$
3. Calculus: Work on differentiation rules $$\\frac{d}{dx}x^n = nx^{n-1}$$

🔹 Science:
1. Physics: Study Newton's Laws $$F = ma$$
2. Chemistry: Balance chemical equations $$2H_2 + O_2 \\rightarrow 2H_2O$$
3. Biology: Review cell structure and functions

🔹 Language Arts:
1. Read 2 chapters of assigned novel
2. Write 500-word essay on current topic
3. Practice grammar exercises

🔹 History/Social Studies:
1. Create timeline of major historical events
2. Study current political systems
3. Review important geographical features

🔹 Foreign Language:
1. Practice vocabulary flashcards (30 min)
2. Watch 1 episode in target language with subtitles
3. Write 10 sentences using new grammar rules

⏰ Recommended Schedule:
Saturday Morning (3 hrs):
- Math (1 hr)
- Science (1 hr)
- Language Arts (1 hr)

Saturday Afternoon (2 hrs):
- History (1 hr)
- Foreign Language (1 hr)

Sunday Morning (2 hrs):
- Math review (1 hr)
- Science experiments (1 hr)

Sunday Afternoon (1 hr):
- Quick review of all subjects
- Prepare materials for school week`;

    setMessages((prev) => [
      ...prev,
      { 
        id: Date.now(), 
        text: plan, 
        sender: 'bot', 
        timestamp: new Date().toISOString(),
        pinned: true // Auto-pin the study plan
      },
    ]);
    
    // Add some celebratory confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
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
      simulateBotResponse(`I've received your file: ${file.name}. How would you like me to help with it?`);
    }
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const MessageContextMenu = ({ messageId }) => (
    <div className="absolute right-2 top-2 bg-gray-700/90 rounded-lg p-2 shadow-lg">
      <button
        onClick={() => pinMessage(messageId)}
        className="flex items-center gap-2 p-2 hover:bg-gray-600/50 rounded-md text-gray-300"
      >
        📌 {selectedMessage?.pinned ? 'Unpin' : 'Pin'}
      </button>
      <button
        onClick={() => navigator.clipboard.writeText(selectedMessage?.text)}
        className="flex items-center gap-2 p-2 hover:bg-gray-600/50 rounded-md text-gray-300"
      >
        ⎘ Copy
      </button>
    </div>
  );

  const saveChatSession = () => {
    if (messages.length <= 1) return; // Don't save empty or initial greeting chats
    
    const newSession = {
      id: Date.now(),
      title: messages.find(m => m.sender === 'user')?.text || "New Chat",
      messages: [...messages],
      timestamp: new Date().toISOString()
    };
    
    setChatHistory(prev => [newSession, ...prev]);
    localStorage.setItem('allChatSessions', JSON.stringify([newSession, ...chatHistory]));
    
    // Show confirmation
    confetti({
      particleCount: 30,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const loadChatSession = (sessionId) => {
    const session = chatHistory.find(s => s.id === sessionId);
    if (session) {
      setMessages(session.messages);
      setActiveTab('current');
      setIsSidebarOpen(false);
    }
  };

  const deleteChatSession = (sessionId, e) => {
    e.stopPropagation();
    setChatHistory(prev => prev.filter(s => s.id !== sessionId));
    localStorage.setItem(
      'allChatSessions', 
      JSON.stringify(chatHistory.filter(s => s.id !== sessionId))
    );
  };

  const clearAllChats = () => {
    setMessages([{
      id: Date.now(),
      text: "Hello! I'm Sparky, your AI assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date().toISOString()
    }]);
    setChatHistory([]);
    localStorage.removeItem('allChatSessions');
    localStorage.removeItem('chatHistory');
  };

  return (
    <div className={`min-h-screen flex ${darkMode ? 'dark' : 'light'}`}>
      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-gray-800/90 backdrop-blur-lg border-r border-gray-700/50 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:static md:w-64 md:translate-x-0 z-50 flex flex-col`}
      >
        <div className="p-6 flex-1 flex flex-col">
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="absolute top-4 right-4 p-2 hover:bg-gray-700/50 rounded-lg md:hidden"
          >
            <XMarkIcon className="w-6 h-6 text-gray-300" />
          </button>
          <div className="flex items-center gap-3 mb-8">
            <SparklesIcon className="w-8 h-8 text-indigo-400 animate-pulse" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              SPARK-IQ
            </h1>
          </div>
          
          {/* Sidebar Tabs */}
          <div className="flex border-b border-gray-700 mb-4">
            <button
              onClick={() => setActiveTab('current')}
              className={`flex-1 py-2 text-center ${activeTab === 'current' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400'}`}
            >
              Chat
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-2 text-center ${activeTab === 'history' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400'}`}
            >
              History
            </button>
          </div>
          
          {/* Current Chat Tab */}
          {activeTab === 'current' && (
            <nav className="space-y-2 mb-6">
              {[
                { name: 'Dashboard', icon: ChartBarIcon, action: () => (window.location.href = '/dashboard') },
                { name: 'New Chat', icon: SparklesIcon, action: () => setMessages([]) },
                { name: 'Save Chat', icon: BookmarkIcon, action: saveChatSession },
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
          )}
          
          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="flex-1 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-200">Chat History</h3>
                <button
                  onClick={clearAllChats}
                  className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1"
                >
                  <TrashIcon className="w-4 h-4" />
                  Clear All
                </button>
              </div>
              
              {chatHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <ClockIcon className="w-8 h-8 mx-auto mb-2" />
                  <p>No chat history yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {chatHistory.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => loadChatSession(session.id)}
                      className="p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 cursor-pointer transition-colors relative group"
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-gray-200 truncate pr-6">
                          {session.title.length > 30 ? `${session.title.substring(0, 30)}...` : session.title}
                        </h4>
                        <button
                          onClick={(e) => deleteChatSession(session.id, e)}
                          className="absolute right-2 top-2 p-1 text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(session.timestamp).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {session.messages.find(m => m.sender === 'bot')?.text.substring(0, 50)}...
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Main Chat Interface */}
      <main className="flex-1 md:ml-100">
        <div className="flex flex-col h-screen">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 md:p-6 bg-gray-800/50 border-b border-gray-700/50">
            <div className="flex items-center gap-4">
              {!isSidebarOpen && (
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-2 hover:bg-gray-700/50 rounded-lg md:hidden"
                >
                  <Bars3Icon className="w-6 h-6 text-gray-300" />
                </button>
              )}
              <div className="flex items-center gap-3">
                <ChatBubbleLeftRightIcon className="w-8 h-8 text-indigo-400 animate-pulse" />
                <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Sparky AI Chatbot
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={toggleDarkMode} className="p-2 hover:bg-gray-700/50 rounded-full">
                {darkMode ? <SunIcon className="w-6 h-6 text-gray-300" /> : <MoonIcon className="w-6 h-6 text-gray-300" />}
              </button>
              <UserCircleIcon className="w-8 h-8 text-gray-300 hover:text-indigo-400 cursor-pointer" />
            </div>
          </div>

          {/* Chat Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-gradient-to-b from-gray-900/50 to-gray-800/50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`relative max-w-[75%] p-4 rounded-2xl ${
                    message.sender === 'user' ? 'bg-indigo-500/90 text-white' : 'bg-gray-700/60 text-white'
                  } shadow-lg transition-transform hover:scale-[1.02] group ${message.pinned ? 'border-2 border-yellow-400' : ''}`}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setSelectedMessage(message.id === selectedMessage?.id ? null : message);
                  }}
                >
                  {message.pinned && <span className="absolute -top-2 -left-2 text-yellow-400">📌</span>}
                  <div className="text-base md:text-lg whitespace-pre-wrap space-y-2">
                    {renderTextWithLaTeX(message.text)}
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-300 opacity-70">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  {selectedMessage?.id === message.id && <MessageContextMenu messageId={message.id} />}
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
          <div className="p-4 md:p-6 bg-gray-800/50 border-t border-gray-700/50">
            <div className="grid gap-4">
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
                    placeholder="Ask a math or science question..."
                    className="w-full px-4 py-3 bg-gray-800 rounded-xl text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-16"
                  />
                  <div className="absolute right-1 top-1.5 flex items-center gap-2">
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