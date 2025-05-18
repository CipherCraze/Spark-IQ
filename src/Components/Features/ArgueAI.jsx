import { useState, useRef } from 'react';
import { 
  FiMessageSquare, 
  FiSend, 
  FiUser, 
  FiCpu,
  FiMoon,
  FiSun,
  FiX,
  FiRotateCw,
  FiAlertTriangle,
  FiClipboard,
  FiHexagon
} from 'react-icons/fi';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const ArgueAI = () => {
  const [topic, setTopic] = useState('');
  const [userPosition, setUserPosition] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [conversation, setConversation] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const replyRef = useRef(null);

  // Handle dark mode toggle
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark', !darkMode);
  };

  const handleStartDebate = async (e) => {
    e.preventDefault();
    if (!topic.trim() || !userPosition.trim()) {
      setError('Please enter both a topic and your position');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (!GEMINI_API_KEY) throw new Error('API key not configured');

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Take the opposing position on "${topic}". 
                The user's position is: "${userPosition}". 
                Provide a concise counter-argument (3-4 sentences max).`
              }]
            }]
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to get AI response');

      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from AI';
      
      setConversation([
        { speaker: 'user', text: userPosition, icon: <FiUser /> },
        { speaker: 'ai', text: aiResponse, icon: <FiHexagon /> }
      ]);

    } catch (err) {
      setError(err.message || 'Failed to start debate. Please try again.');
      console.error('Debate error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueDebate = async () => {
    const userReply = replyRef.current?.value?.trim();
    if (!userReply || isLoading) return;

    setIsLoading(true);
    setError('');

    try {
      if (!GEMINI_API_KEY) throw new Error('API key not configured');

      // Build conversation history for context
      const history = conversation.map(msg => 
        `${msg.speaker === 'user' ? 'User' : 'AI'}: ${msg.text}`
      ).join('\n');

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Continue debating "${topic}". Conversation history:\n${history}\n\nUser replies: "${userReply}". Provide a concise counter-argument.`
              }]
            }]
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to get AI response');

      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from AI';
      
      setConversation(prev => [
        ...prev,
        { speaker: 'user', text: userReply, icon: <FiUser /> },
        { speaker: 'ai', text: aiResponse, icon: <FiHexagon /> }
      ]);

      // Clear reply input
      replyRef.current.value = '';

    } catch (err) {
      setError(err.message || 'Failed to continue debate. Please try again.');
      console.error('Continue debate error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gray-100 dark:bg-gray-950 ${darkMode ? 'dark' : ''}`}>
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900 text-white px-6 py-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <FiClipboard className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-xl font-bold">ArgueAI</h1>
              <p className="text-sm text-blue-100">Sharpen your debate skills with AI</p>
            </div>
          </div>
          <button 
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            {darkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto pt-8 pb-16 px-4">
        {/* New Debate Form */}
        {conversation.length === 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
            <div className="bg-blue-50 dark:bg-blue-900/30 px-6 py-4 border-b border-blue-100 dark:border-blue-800">
              <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-300">Start a New Debate</h2>
            </div>
            
            <form onSubmit={handleStartDebate} className="p-6 space-y-6">
              <div>
                <label htmlFor="topic" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Debate Topic
                </label>
                <input
                  id="topic"
                  type="text"
                  className="w-full px-4 py-3 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="E.g., 'Should social media be regulated?'"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <label htmlFor="position" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Argument
                </label>
                <textarea
                  id="position"
                  className="w-full px-4 py-3 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  rows={5}
                  placeholder="Present your argument on the topic..."
                  value={userPosition}
                  onChange={(e) => setUserPosition(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              
              {error && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
                  <FiAlertTriangle />
                  <span>{error}</span>
                </div>
              )}
              
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`px-6 py-3 text-center text-white rounded-lg shadow transition-all ${
                    isLoading
                      ? 'bg-blue-400 dark:bg-blue-600 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600'
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <FiRotateCw className="animate-spin mr-2" />
                      Preparing Counterargument...
                    </span>
                  ) : 'Begin Debate'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Debate Conversation */}
        {conversation.length > 0 && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 bg-blue-50 dark:bg-blue-900/30 border-b border-blue-100 dark:border-blue-800 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-300">{topic}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Debate in progress</p>
                </div>
                <button
                  onClick={() => setConversation([])}
                  className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
                {conversation.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`flex ${msg.speaker === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] ${
                      msg.speaker === 'user' 
                        ? 'bg-blue-500 text-white rounded-t-2xl rounded-bl-2xl rounded-br-sm'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-t-2xl rounded-br-2xl rounded-bl-sm'
                    }`}
                    >
                      <div className={`px-4 py-2 ${
                        msg.speaker === 'user' 
                          ? 'bg-blue-600/50 rounded-t-2xl' 
                          : 'bg-gray-200/50 dark:bg-gray-700/50 rounded-t-2xl'
                      }`}>
                        <div className="flex items-center">
                          <span className="p-1 mr-2 rounded-full bg-white/20 dark:bg-white/10">
                            {msg.icon}
                          </span>
                          <span className="text-sm font-medium">
                            {msg.speaker === 'user' ? 'Your Argument' : 'AI Opposition'}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reply Form */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
              <div className="px-6 py-3 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Your Response</h3>
              </div>
              
              <div className="p-4">
                <form onSubmit={(e) => { e.preventDefault(); handleContinueDebate(); }} className="space-y-4">
                  <textarea
                    ref={replyRef}
                    className="w-full px-4 py-3 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    rows={3}
                    placeholder="Counter their argument..."
                    disabled={isLoading}
                  />
                  
                  {error && (
                    <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
                      <FiAlertTriangle />
                      <span>{error}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`px-5 py-2 flex items-center space-x-2 text-white rounded-lg shadow transition-all ${
                        isLoading
                          ? 'bg-blue-400 dark:bg-blue-600 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600'
                      }`}
                    >
                      {isLoading ? (
                        <FiRotateCw className="animate-spin" />
                      ) : (
                        <>
                          <span>Send</span>
                          <FiSend />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ArgueAI;