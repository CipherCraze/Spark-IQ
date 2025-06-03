import { useState, useEffect } from 'react';
import { 
    FiEdit2, FiLoader, FiSun, FiMoon, FiX, FiEye, FiMessageCircle, FiZap,
    // Icons for studentMenu (Heroicons Outline)
    FiHome as HomeIcon, FiFolder as FolderIcon, FiClipboard as ClipboardDocumentIcon, FiBarChart2 as ChartBarIcon,
    FiFileText as DocumentTextIcon, FiTrendingUp as PresentationChartLineIcon, FiMessageSquare as ChatBubbleLeftRightIcon,
    FiHelpCircle as QuestionMarkCircleIcon, FiZap as LightBulbIcon, FiGlobe as NewspaperIcon, 
    FiTool as WrenchScrewdriverIcon, FiVideo as VideoCameraIcon, FiMail as EnvelopeIcon, FiGift as SparklesIcon
} from 'react-icons/fi'; // Using react-icons/fi for consistency in this file
import axios from 'axios';
import Sidebar from './Sidebar'; // Adjust path if Sidebar.jsx is elsewhere

// --- Student Menu Definition (using Fi icons) ---
const studentMenuData = [
    { title: 'Dashboard', Icon: HomeIcon, link: '/dashboard', description: "Overview of your progress." },
    { title: 'My Resources', Icon: FolderIcon, link: '/resource-utilization', description: "Access course materials." },
    { title: 'Tests', Icon: ClipboardDocumentIcon, link: '/student-tests', description: "Take and view your test results." },
    { title: 'Attendance', Icon: ChartBarIcon, link: '/attendance-monitoring', description: "Track your attendance." },
    { title: 'Assignments', Icon: DocumentTextIcon, link: '/assignment-submission', description: "View & submit assignments." },
    { title: 'Grades & Feedback', Icon: PresentationChartLineIcon, link: '/GradesAndFeedback', description: "Check your grades." },
    { title: 'Voice Chat', Icon: ChatBubbleLeftRightIcon, link: '/voice-chat', description: "Discuss with peers." },
    { title: 'Ask Sparky', Icon: QuestionMarkCircleIcon, link: '/chatbot-access', description: "Your AI study assistant." },
    { title: 'AI Questions', Icon: LightBulbIcon, link: '/ai-generated-questions', description: "Practice with AI questions." },
    { title: 'Educational News', Icon: NewspaperIcon, link: '/educational-news', description: "Latest in education." },
    { title: 'Smart Review', Icon: WrenchScrewdriverIcon, link: '/smart-review', description: "Enhance your writing." , current: true},
    { title: 'Virtual Meetings', Icon: VideoCameraIcon, link: '/meeting-participation', description: "Join online classes." },
    { title: 'Chat Platform', Icon: ChatBubbleLeftRightIcon, link: '/chat-functionality', description: "Connect with peers." },
    { title: 'My Inbox', Icon: EnvelopeIcon, link: '/inbox-for-suggestions', description: "Messages & suggestions." },
    { title: 'Upgrade to Pro', Icon: SparklesIcon, link: '/pricing', special: true, description: "Unlock premium features." },
];

const SmartReview = () => {
  const [inputText, setInputText] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(true);

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) {
      setError('Please paste your content for review.');
      return;
    }
    setIsLoading(true);
    setError('');
    setFeedback('');
    try {
      if (!apiKey) throw new Error('API key is not configured.');
      const systemPrompt = `You are IntelliReview, an advanced AI Code and Text Review Assistant...`; // Keep your detailed prompt
      const userContent = `User's Content to Review:\n---\n${inputText}\n---\nPlease provide your detailed review:`;
      const contents = [{ parts: [{ text: systemPrompt }, { text: userContent }] }];
      const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
        { contents },
        { params: { key: apiKey }, headers: { 'Content-Type': 'application/json' }, timeout: 30000 }
      );
      const generatedText = response.data.candidates?.[0]?.content?.parts?.[0]?.text || 'No feedback generated.';
      setFeedback(generatedText);
    } catch (err) {
      let errorMessage = 'Failed to get feedback.';
      if (err.response) errorMessage = `API Error: ${err.response.data?.error?.message || err.message}`;
      else errorMessage = err.message || errorMessage;
      setError(errorMessage);
      console.error('Feedback error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200 transition-colors duration-300 dark:bg-slate-950">
      <Sidebar menuItems={studentMenuData} appName="SPARK-IQ" userRole="Student" />
      
      <div className="flex-1 flex flex-col overflow-hidden"> {/* Main content wrapper */}
        {/* Header */}
        <header className="sticky top-0 z-20 bg-slate-900/70 dark:bg-slate-900/80 backdrop-blur-lg shadow-xl shadow-purple-900/5 dark:shadow-purple-900/10 border-b border-slate-700/50 dark:border-slate-800/60">
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex justify-between items-center"> {/* Changed max-w for header */}
            <div className="flex items-center space-x-3">
              {/* Icon can be dynamic or removed if sidebar has app name */}
              <div className="p-2 rounded-full bg-gradient-to-br from-teal-500 via-cyan-500 to-purple-600 shadow-md">
                <FiEdit2 className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-cyan-400 to-purple-500">
                  Smart Review
                </h1>
                <p className="text-xs text-slate-400 dark:text-slate-500">AI-Powered Content Enhancement</p>
              </div>
            </div>
            <button 
              onClick={toggleDarkMode}
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="p-2.5 rounded-full text-slate-400 dark:text-slate-500 hover:text-teal-400 dark:hover:text-teal-300 bg-slate-700/50 dark:bg-slate-800/70 hover:bg-purple-600/20 dark:hover:bg-purple-600/30 transition-all duration-200 shadow-md hover:shadow-purple-500/10"
            >
              {darkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Main Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-4xl mx-auto space-y-8"> {/* Content constrained */}
            <form onSubmit={handleSubmit}>
              {/* Input Card */}
              <div className="bg-slate-800/60 dark:bg-slate-800/80 backdrop-blur-md border border-slate-700/70 dark:border-slate-700/80 rounded-xl shadow-2xl shadow-purple-800/5 dark:shadow-purple-800/10 p-6 transition-all hover:shadow-purple-600/15 dark:hover:shadow-purple-600/20">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-gradient-to-tr from-teal-600 to-cyan-700 rounded-lg mr-3 shadow-md">
                    <FiMessageCircle className="text-white" />
                  </div>
                  <label htmlFor="inputText" className="block text-lg font-semibold text-teal-400 dark:text-teal-300">
                    Submit Your Content
                  </label>
                </div>
                
                <textarea
                  id="inputText"
                  className="w-full min-h-[200px] px-4 py-3 text-slate-200 dark:text-slate-100 bg-slate-900/70 dark:bg-slate-900/90 border-2 border-slate-700 dark:border-slate-600 rounded-lg focus:border-teal-500 dark:focus:border-teal-400 focus:ring-2 focus:ring-teal-500/40 dark:focus:ring-teal-400/40 transition-all duration-200 shadow-inner placeholder-slate-500 dark:placeholder-slate-600 custom-scrollbar text-sm sm:text-base"
                  placeholder="Paste your essay, code, article, or any text here for an AI-powered review..."
                  value={inputText}
                  onChange={(e) => { setInputText(e.target.value); setError(''); }}
                  disabled={isLoading}
                />
                
                <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                  {error && (
                    <div className="text-sm text-red-400 dark:text-red-300 bg-red-900/20 dark:bg-red-500/10 py-2 px-3 rounded-md border border-red-700/30 dark:border-red-500/20 flex items-center gap-2">
                      <FiX className="w-4 h-4"/> {error}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={isLoading || !inputText.trim()}
                    className={`ml-auto w-full sm:w-auto px-8 py-3 text-base font-semibold rounded-lg focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-slate-950 transition-all duration-300 ease-in-out transform hover:scale-105
                      ${isLoading || !inputText.trim()
                        ? 'bg-slate-600 dark:bg-slate-700 cursor-not-allowed text-slate-400 dark:text-slate-500'
                        : 'bg-gradient-to-r from-teal-500 via-cyan-500 to-purple-600 hover:from-teal-600 hover:via-cyan-600 hover:to-purple-700 text-white shadow-xl hover:shadow-purple-500/40 focus:ring-cyan-500/70'
                      }`}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <FiLoader className="animate-spin mr-2.5" />
                        Analyzing...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <FiZap className="mr-2" />
                        Get Insights
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </form>

            {/* Feedback Card */}
            {isLoading && !feedback && (
              <div className="bg-slate-800/60 dark:bg-slate-800/80 backdrop-blur-md border border-slate-700/70 dark:border-slate-700/80 rounded-xl shadow-2xl p-6 animate-pulse">
                  <div className="h-6 bg-slate-700/50 dark:bg-slate-700/60 rounded w-1/3 mb-4"></div>
                  <div className="space-y-3">
                      <div className="h-4 bg-slate-700/50 dark:bg-slate-700/60 rounded w-full"></div>
                      <div className="h-4 bg-slate-700/50 dark:bg-slate-700/60 rounded w-5/6"></div>
                      <div className="h-4 bg-slate-700/50 dark:bg-slate-700/60 rounded w-3/4"></div>
                  </div>
              </div>
            )}

            {feedback && !isLoading && (
              <div className="bg-slate-800/60 dark:bg-slate-800/80 backdrop-blur-md border border-slate-700/70 dark:border-slate-700/80 rounded-xl shadow-2xl shadow-purple-800/5 dark:shadow-purple-800/10 p-6 animate-fadeInUp">
                <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-700/50 dark:border-slate-700/60">
                  <div className="flex items-center">
                    <div className="p-2 bg-gradient-to-tr from-purple-600 to-indigo-700 rounded-lg mr-3 shadow-md">
                      <FiEdit2 className="text-white" />
                    </div>
                    <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-cyan-400 to-purple-500">
                      AI Review Insights
                    </h2>
                  </div>
                  <button 
                    onClick={() => setFeedback('')}
                    title="Clear Feedback"
                    className="p-2 rounded-full text-slate-400 dark:text-slate-500 hover:text-red-400 dark:hover:text-red-300 bg-slate-700/40 dark:bg-slate-700/60 hover:bg-red-500/20 dark:hover:bg-red-500/20 transition-all duration-200"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="prose prose-sm sm:prose-base prose-slate dark:prose-invert max-w-none whitespace-pre-wrap text-slate-300 dark:text-slate-200 leading-relaxed custom-scrollbar overflow-x-auto">
                  {feedback}
                </div>
              </div>
            )}
          </div>
        </main>
        
        {/* Footer */}
        <footer className="bg-slate-900/80 dark:bg-slate-950/90 border-t border-slate-700/50 dark:border-slate-800/60 py-3 px-4 sm:px-6 lg:px-8">
          <div className="max-w-full mx-auto text-center text-xs text-slate-500 dark:text-slate-600">
            <p>SPARK-IQ © {new Date().getFullYear()} — AI-Powered Content Enhancement Tool.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default SmartReview;

// Global CSS (index.css or App.css) remains the same as your previous version for custom scrollbar and animations.
/*
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer utilities {
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
    height: 8px; 
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background-color: theme('colors.slate.700'); 
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: theme('colors.purple.600');
    border-radius: 10px;
    border: 2px solid theme('colors.slate.700'); 
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: theme('colors.purple.500');
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-fadeInUp {
    animation: fadeInUp 0.5s ease-out forwards;
  }
}
*/