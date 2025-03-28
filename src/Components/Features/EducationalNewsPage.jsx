import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { 
  GlobeAltIcon,
  BookOpenIcon,
  AcademicCapIcon,
  SparklesIcon,
  BookmarkIcon,
  MagnifyingGlassIcon,
  SunIcon,
  MoonIcon,
  ArrowUpCircleIcon,
  LightBulbIcon,
  LanguageIcon,
  UserCircleIcon,
  ChevronDownIcon,
  BellIcon,
  HomeIcon,
  ChartBarIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolid } from '@heroicons/react/24/solid';
import { formatDistanceToNow } from 'date-fns';

// Initialize Gemini AI
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const EducationalNewsPage = () => {
  const [articles, setArticles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('education');
  const [darkMode, setDarkMode] = useState(true);
  const [bookmarks, setBookmarks] = useState([]);
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [aiSummary, setAiSummary] = useState('');
  const [aiTranslation, setAiTranslation] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // NewsAPI configuration
  const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;
  const NEWS_API_URL = `https://newsapi.org/v2/everything?q=${category}&apiKey=${NEWS_API_KEY}&pageSize=50`;

  // Fetch news articles
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get(NEWS_API_URL);
        setArticles(response.data.articles);
        extractTrendingTopics(response.data.articles);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching news:', error);
        setLoading(false);
      }
    };

    fetchNews();
    const interval = setInterval(fetchNews, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [category]);

  // Extract trending topics from articles
  const extractTrendingTopics = (articles) => {
    const keywords = articles.flatMap(article => 
      article.title.toLowerCase().split(' ').filter(word => word.length > 4)
    );
    const topicCount = keywords.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {});
    
    setTrendingTopics(
      Object.entries(topicCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([topic]) => topic)
    );
  };

  // Bookmark functionality
  const toggleBookmark = (article) => {
    setBookmarks(prev => {
      const exists = prev.find(b => b.url === article.url);
      return exists 
        ? prev.filter(b => b.url !== article.url) 
        : [...prev, article];
    });
  };

  // Dark mode toggle
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // Generate AI summary
  const generateSummary = async (article) => {
    if (!article) return;
    
    setIsGenerating(true);
    setAiSummary('');
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `Summarize this educational news article into 3 key points while maintaining all important facts and context:
      
      Title: ${article.title}
      Content: ${article.content || article.description}

      Please provide the summary in this format:
      1. [Main Point 1]
      2. [Main Point 2]
      3. [Main Point 3]`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      setAiSummary(text);
    } catch (error) {
      console.error("AI summary error:", error);
      setAiSummary("Error generating summary. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Translate with AI
  const translateArticle = async (article, language = 'Spanish') => {
    if (!article) return;
    
    setIsGenerating(true);
    setAiTranslation('');
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `Translate this educational news article to ${language} while maintaining the original meaning and formal tone:
      
      Title: ${article.title}
      Content: ${article.content || article.description}`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      setAiTranslation(text);
    } catch (error) {
      console.error("Translation error:", error);
      setAiTranslation("Error translating content. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Enhanced Navbar */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Left side - Logo and main nav */}
            <div className="flex items-center">
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none lg:hidden"
              >
                <svg
                  className={`${mobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <svg
                  className={`${mobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Logo */}
              <div className="flex-shrink-0 flex items-center">
                <AcademicCapIcon className="h-8 w-8 text-purple-600" />
                <span className="ml-2 text-xl font-bold text-gray-800 dark:text-white hidden sm:block">
                  Edu<span className="text-purple-600">News</span>
                </span>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden lg:ml-8 lg:flex lg:space-x-8">
                <button
                  onClick={() => setCategory('education')}
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                    category === 'education'
                      ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <HomeIcon className="h-4 w-4 mr-1" />
                  Home
                </button>
                <button
                  onClick={() => setCategory('technology')}
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                    category === 'technology'
                      ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <SparklesIcon className="h-4 w-4 mr-1" />
                  EdTech
                </button>
                <button
                  onClick={() => setCategory('research')}
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                    category === 'research'
                      ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <ChartBarIcon className="h-4 w-4 mr-1" />
                  Research
                </button>
                <button
                  onClick={() => setCategory('policy')}
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                    category === 'policy'
                      ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <BookOpenIcon className="h-4 w-4 mr-1" />
                  Policy
                </button>
              </nav>
            </div>

            {/* Right side - Search, user, etc. */}
            <div className="flex items-center">
              {/* Search bar - hidden on mobile */}
              <div className="hidden md:block relative mx-4">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search news..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Notification and user profile */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-1 rounded-full text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
                >
                  {darkMode ? (
                    <SunIcon className="h-6 w-6" />
                  ) : (
                    <MoonIcon className="h-6 w-6" />
                  )}
                </button>

                <button className="p-1 rounded-full text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none relative">
                  <BellIcon className="h-6 w-6" />
                  <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
                </button>

                {/* User dropdown */}
                <div className="relative ml-3">
                  <div>
                    <button
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                      className="flex text-sm rounded-full focus:outline-none"
                    >
                      <div className="flex items-center">
                        <UserCircleIcon className="h-8 w-8 text-gray-500" />
                        <ChevronDownIcon className="ml-1 h-4 w-4 text-gray-500" />
                      </div>
                    </button>
                  </div>

                  {/* Dropdown menu */}
                  <AnimatePresence>
                    {userDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                      >
                        <div className="py-1">
                          <a
                            href="#"
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                          >
                            Your Profile
                          </a>
                          <a
                            href="#"
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                          >
                            Settings
                          </a>
                          <a
                            href="#"
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                          >
                            Sign out
                          </a>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden"
            >
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                {/* Mobile search */}
                <div className="relative mb-3">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search news..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <button
                  onClick={() => {
                    setCategory('education');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center px-3 py-2 rounded-md text-base font-medium ${
                    category === 'education'
                      ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <HomeIcon className="h-5 w-5 mr-2" />
                  Home
                </button>
                <button
                  onClick={() => {
                    setCategory('technology');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center px-3 py-2 rounded-md text-base font-medium ${
                    category === 'technology'
                      ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <SparklesIcon className="h-5 w-5 mr-2" />
                  EdTech
                </button>
                <button
                  onClick={() => {
                    setCategory('research');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center px-3 py-2 rounded-md text-base font-medium ${
                    category === 'research'
                      ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <ChartBarIcon className="h-5 w-5 mr-2" />
                  Research
                </button>
                <button
                  onClick={() => {
                    setCategory('policy');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center px-3 py-2 rounded-md text-base font-medium ${
                    category === 'policy'
                      ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <BookOpenIcon className="h-5 w-5 mr-2" />
                  Policy
                </button>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button className="w-full flex items-center justify-between px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <span className="flex items-center">
                      <CogIcon className="h-5 w-5 mr-2" />
                      Settings
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Filters */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {['Global', 'Technology', 'Research', 'Policy', 'Innovation', 'Science', 'Higher Ed', 'K-12'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat.toLowerCase())}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  category === cat.toLowerCase()
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Trending Topics */}
        <div className="mb-8 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl">
          <h3 className="flex items-center text-sm font-semibold mb-3 text-purple-700 dark:text-purple-300">
            <SparklesIcon className="h-4 w-4 mr-2" />
            Trending in Education
          </h3>
          <div className="flex flex-wrap gap-2">
            {trendingTopics.map((topic) => (
              <button
                key={topic}
                onClick={() => {
                  setSearchQuery(topic);
                  setMobileMenuOpen(false);
                }}
                className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-xs shadow-sm hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors"
              >
                #{topic}
              </button>
            ))}
          </div>
        </div>

        {/* News Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {articles
                .filter(article =>
                  article.title.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((article) => (
                  <motion.div
                    key={article.url}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden"
                  >
                    <div className="absolute top-4 right-4 z-10">
                      <button
                        onClick={() => toggleBookmark(article)}
                        className="p-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
                      >
                        {bookmarks.some(b => b.url === article.url) ? (
                          <BookmarkSolid className="h-5 w-5 text-purple-600" />
                        ) : (
                          <BookmarkIcon className="h-5 w-5 text-gray-400 hover:text-purple-600" />
                        )}
                      </button>
                    </div>

                    {article.urlToImage && (
                      <div className="h-48 overflow-hidden">
                        <img
                          src={article.urlToImage}
                          alt={article.title}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                          onError={(e) => {
                            e.target.src = 'https://source.unsplash.com/featured/?education';
                          }}
                        />
                      </div>
                    )}

                    <div className="p-5">
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
                        <GlobeAltIcon className="h-3 w-3 mr-1" />
                        {article.source.name}
                        <span className="mx-2">•</span>
                        {formatDistanceToNow(new Date(article.publishedAt))} ago
                      </div>

                      <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                        <button
                          onClick={() => setSelectedArticle(article)}
                          className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-left"
                        >
                          {article.title}
                        </button>
                      </h3>

                      <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-4">
                        {article.description}
                      </p>

                      <div className="flex justify-between items-center text-xs">
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                          {Math.ceil(article.content?.length / 100)} min read
                        </span>
                        <button
                          onClick={() => setSelectedArticle(article)}
                          className="text-purple-600 dark:text-purple-400 hover:underline"
                        >
                          Read more
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Back to Top */}
        <motion.button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 p-3 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-all flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowUpCircleIcon className="h-6 w-6" />
        </motion.button>
      </main>

      {/* Article Detail Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {selectedArticle.urlToImage && (
              <div className="h-64 w-full overflow-hidden">
                <img
                  src={selectedArticle.urlToImage}
                  alt={selectedArticle.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{selectedArticle.title}</h2>
                <button
                  onClick={() => {
                    setSelectedArticle(null);
                    setAiSummary('');
                    setAiTranslation('');
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex items-center space-x-4 mb-6 text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  {selectedArticle.source.name}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {formatDistanceToNow(new Date(selectedArticle.publishedAt))} ago
                </span>
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                  {Math.ceil(selectedArticle.content?.length / 100)} min read
                </span>
              </div>

              <div className="prose dark:prose-invert max-w-none mb-8">
                {selectedArticle.content || selectedArticle.description}
              </div>

              {/* AI Features Section */}
              <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl mb-8">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <SparklesIcon className="h-5 w-5 mr-2 text-purple-500" />
                  AI Assistant
                </h3>
                
                <div className="flex flex-wrap gap-3 mb-6">
                  <button
                    onClick={() => generateSummary(selectedArticle)}
                    disabled={isGenerating}
                    className="px-4 py-2 bg-purple-500/10 text-purple-600 dark:text-purple-300 rounded-lg flex items-center hover:bg-purple-500/20 transition-colors disabled:opacity-50"
                  >
                    <LightBulbIcon className="h-5 w-5 mr-2" />
                    Summarize
                  </button>
                  <button
                    onClick={() => translateArticle(selectedArticle, 'Spanish')}
                    disabled={isGenerating}
                    className="px-4 py-2 bg-blue-500/10 text-blue-600 dark:text-blue-300 rounded-lg flex items-center hover:bg-blue-500/20 transition-colors disabled:opacity-50"
                  >
                    <LanguageIcon className="h-5 w-5 mr-2" />
                    Translate to Spanish
                  </button>
                  <button
                    onClick={() => translateArticle(selectedArticle, 'French')}
                    disabled={isGenerating}
                    className="px-4 py-2 bg-green-500/10 text-green-600 dark:text-green-300 rounded-lg flex items-center hover:bg-green-500/20 transition-colors disabled:opacity-50"
                  >
                    <LanguageIcon className="h-5 w-5 mr-2" />
                    Translate to French
                  </button>
                </div>

                {aiSummary && (
                  <div className="mb-6">
                    <h4 className="font-medium mb-2 text-gray-800 dark:text-gray-200">AI Summary:</h4>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 prose-sm dark:prose-invert">
                      {aiSummary.split('\n').map((para, i) => (
                        <p key={i} className="mb-2">{para}</p>
                      ))}
                    </div>
                  </div>
                )}

                {aiTranslation && (
                  <div>
                    <h4 className="font-medium mb-2 text-gray-800 dark:text-gray-200">AI Translation:</h4>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 prose-sm dark:prose-invert">
                      {aiTranslation}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center">
                <a
                  href={selectedArticle.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors flex items-center"
                >
                  Read Full Article
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
                <button
                  onClick={() => toggleBookmark(selectedArticle)}
                  className="flex items-center text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
                >
                  {bookmarks.some(b => b.url === selectedArticle.url) ? (
                    <>
                      <BookmarkSolid className="h-5 w-5 mr-1 text-purple-600" />
                      <span>Saved</span>
                    </>
                  ) : (
                    <>
                      <BookmarkIcon className="h-5 w-5 mr-1" />
                      <span>Save Article</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EducationalNewsPage;