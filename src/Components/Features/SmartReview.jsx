import { useState } from 'react';
import { FiEdit2, FiLoader, FiSun, FiMoon, FiX, FiEye, FiMessageCircle } from 'react-icons/fi';
import axios from 'axios';

const SmartReview = () => {
  const [inputText, setInputText] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(true); // Default to dark mode

  // Use Vite environment variable
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark', !darkMode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) {
      setError('Please enter text or code to review.');
      return;
    }

    setIsLoading(true);
    setError('');
    setFeedback('');

    try {
      if (!apiKey) throw new Error('API key not configured');

      const contents = [{
        parts: [{
          text: `Provide detailed feedback on this text for clarity, grammar, and structure. 
          Focus on:\n1. Grammar and spelling\n2. Clarity of ideas\n3. Logical flow\n4. Suggestions for improvement\n\nText:\n${inputText}`
        }]
      }];

      const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
        { contents },
        {
          params: { key: apiKey },
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const generatedText = response.data.candidates?.[0]?.content?.parts?.[0]?.text || 'No feedback generated';
      setFeedback(generatedText);

    } catch (err) {
      setError(err.message || 'Failed to get feedback. Please try again.');
      console.error('Feedback error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col bg-gray-900 text-gray-100 ${darkMode ? 'dark' : ''}`}>
      {/* Header - Redesigned with gradient */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-800 shadow-lg border-b border-purple-700 px-6 py-5">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="bg-purple-800 p-3 rounded-full shadow-lg">
              <FiEdit2 className="text-teal-300 text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-cyan-300">
                Smart Review
              </h1>
              <p className="text-purple-200">AI-powered writing enhancement</p>
            </div>
          </div>
          <button 
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-purple-800 text-purple-200 hover:bg-purple-700 hover:text-teal-300 transition-all shadow-md"
          >
            {darkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="mb-6">
            {/* Input Card with Glow Effect */}
            <div className="bg-gray-800 rounded-xl shadow-xl border border-purple-900 p-6 mb-6 transition-all hover:shadow-purple-900/20 hover:shadow-2xl">
              <div className="flex items-center mb-3">
                <div className="p-2 bg-purple-900 rounded-lg mr-3">
                  <FiMessageCircle className="text-teal-300" />
                </div>
                <label htmlFor="inputText" className="block text-lg font-medium text-teal-300">
                  Your Content
                </label>
              </div>
              
              <textarea
                id="inputText"
                className="w-full px-4 py-3 text-gray-100 bg-gray-900 border border-gray-700 focus:border-teal-500 rounded-lg focus:ring-2 focus:ring-teal-500/30 transition-all shadow-inner"
                rows={10}
                placeholder="Paste your essay, code, or any text here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            <div className="flex justify-between items-center">
              {error && (
                <div className="text-red-400 text-sm bg-red-900/30 py-2 px-4 rounded-lg border border-red-800">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className={`ml-auto px-6 py-3 text-base font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all ${
                  isLoading
                    ? 'bg-purple-800 cursor-not-allowed text-purple-300'
                    : 'bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-600 hover:to-indigo-700 text-teal-200 hover:text-teal-100 shadow-lg hover:shadow-purple-900/50'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <FiLoader className="animate-spin mr-2" />
                    Analyzing...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <FiEye className="mr-2" />
                    Analyze
                  </span>
                )}
              </button>
            </div>
          </form>

          {/* Feedback Card with Animation */}
          {feedback && (
            <div className="bg-gray-800 rounded-xl shadow-xl border border-purple-900 p-6 animate-fadeIn">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-900 rounded-lg mr-3">
                    <FiEdit2 className="text-teal-300" />
                  </div>
                  <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-cyan-300">
                    AI Insights
                  </h2>
                </div>
                <button 
                  onClick={() => setFeedback('')}
                  className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              
              <div className="relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-700 via-teal-500 to-purple-700 rounded-full"></div>
                <div className="pt-6 prose prose-invert max-w-none whitespace-pre-wrap text-gray-200 leading-relaxed">
                  {feedback}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Footer - Added */}
      <div className="bg-gray-900 border-t border-gray-800 py-3 px-6 text-center text-gray-500 text-sm">
        <p>NOVA Review — AI-powered writing enhancement</p>
      </div>
    </div>
  );
};

export default SmartReview;