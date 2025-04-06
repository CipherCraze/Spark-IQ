import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  CogIcon,
  XMarkIcon,
  Bars3Icon,
  ComputerDesktopIcon, // For EdTech
  BeakerIcon, // For Research
  BuildingLibraryIcon, // For Policy
  ClockIcon, // For Read Time
  ExclamationTriangleIcon, // For Errors
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolid } from '@heroicons/react/24/solid';
import { formatDistanceToNow } from 'date-fns';

// --- Custom Hooks ---

// Hook for persisting state to localStorage
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error("Error reading localStorage key “" + key + "”:", error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error("Error setting localStorage key “" + key + "”:", error);
    }
  };

  return [storedValue, setValue];
}

// Hook for debouncing input
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}


// --- Constants ---
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const NEWS_API_BASE_URL = 'https://newsapi.org/v2/everything';
const DEFAULT_IMAGE_URL = 'https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1232&q=80'; // More relevant default

// --- Initialize Gemini AI ---
let genAI;
if (GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  } catch (error) {
     console.error("Failed to initialize GoogleGenerativeAI:", error);
     // Handle initialization error, maybe disable AI features
  }
} else {
    console.warn("VITE_GEMINI_API_KEY is not set. AI features will be disabled.");
}


// --- Helper Functions ---
const calculateReadTime = (content) => {
  if (!content) return 1; // Default 1 min if no content
  const wordsPerMinute = 200;
  const textLength = content.split(/\s+/).length; // Split by whitespace
  return Math.ceil(textLength / wordsPerMinute);
};

const formatSummary = (text) => {
  // Basic formatting: split by numbered points or newlines
  return text.split(/\d\.|\\n|\n/).map(s => s.trim()).filter(Boolean);
};

// --- Main Component ---
const EducationalNewsPage = () => {
  const [articles, setArticles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('education');
  const [darkMode, setDarkMode] = useLocalStorage('darkMode', true);
  const [bookmarks, setBookmarks] = useLocalStorage('bookmarks', []);
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [aiSummary, setAiSummary] = useState('');
  const [aiTranslation, setAiTranslation] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isGeneratingTranslation, setIsGeneratingTranslation] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 300); // Debounce search

  // --- API Fetching ---
  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError(null); // Reset error before fetch
      if (!NEWS_API_KEY) {
        setError("News API Key is missing. Please configure VITE_NEWS_API_KEY.");
        setLoading(false);
        return;
      }

      const url = `${NEWS_API_BASE_URL}?q=${encodeURIComponent(category)}&language=en&sortBy=publishedAt&apiKey=${NEWS_API_KEY}&pageSize=40`; // Fetch 40

      try {
        const response = await axios.get(url);
        if (response.data.status === 'ok') {
          // Filter out articles without essential info
          const validArticles = response.data.articles.filter(
            article => article.title && article.title !== "[Removed]" && article.description && article.url && article.source?.name
          );
          setArticles(validArticles);
          extractTrendingTopics(validArticles);
        } else {
            throw new Error(response.data.message || 'Failed to fetch news');
        }
      } catch (error) {
        console.error('Error fetching news:', error);
        setError(error.message || 'Failed to connect to news service.');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
    // Consider less frequent refresh or trigger manually
    // const interval = setInterval(fetchNews, 600000); // Refresh every 10 minutes
    // return () => clearInterval(interval);
  }, [category]); // Depend only on category

  // --- Trending Topics Extraction ---
  const extractTrendingTopics = useCallback((articlesData) => {
    const commonWords = new Set(['the', 'a', 'in', 'is', 'to', 'and', 'of', 'for', 'on', 'with', 'as', 'at', 'by', 'from', 'study', 'report', 'new', 'says']);
    const titles = articlesData.map(a => a.title.toLowerCase()).join(' ');
    const words = titles.match(/\b(\w{4,})\b/g) || []; // Words of 4+ letters

    const topicCount = words.reduce((acc, word) => {
      if (!commonWords.has(word)) {
        acc[word] = (acc[word] || 0) + 1;
      }
      return acc;
    }, {});

    setTrendingTopics(
      Object.entries(topicCount)
        .sort(([, countA], [, countB]) => countB - countA)
        .slice(0, 8) // Show top 8
        .map(([topic]) => topic)
    );
  }, []);

  // --- Bookmark Management ---
  const toggleBookmark = useCallback((article) => {
    setBookmarks(prev => {
      const exists = prev.some(b => b.url === article.url);
      return exists
        ? prev.filter(b => b.url !== article.url)
        : [...prev, article]; // Store the whole article for easy access
    });
  }, [setBookmarks]);

  // --- Dark Mode Effect ---
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // --- AI Generation ---
  const generateSummary = useCallback(async (article) => {
    if (!genAI || !article || isGeneratingSummary) return;

    setIsGeneratingSummary(true);
    setAiSummary('');
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `You are an educational news analyst. Summarize the key findings and implications of this article in 3 concise bullet points for educators and policymakers. Maintain a neutral and factual tone.

      Article Title: ${article.title}
      Article Description/Content: ${article.content || article.description}

      Provide only the 3 bullet points.`;

      const result = await model.generateContent(prompt);
      const response = result.response; // No need for await here
      const text = response.text();
      setAiSummary(text);
    } catch (error) {
      console.error("AI summary error:", error);
      setAiSummary("Error: Could not generate summary. The content might be inaccessible or the service unavailable.");
    } finally {
      setIsGeneratingSummary(false);
    }
  }, [isGeneratingSummary]);

  const translateArticle = useCallback(async (article, language = 'Spanish') => {
    if (!genAI || !article || isGeneratingTranslation) return;

    setIsGeneratingTranslation(true);
    setAiTranslation('');
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `Translate the core information of the following educational news article into ${language}. Focus on clarity and accuracy, preserving the original meaning and tone.

      Article Title: ${article.title}
      Article Description/Content: ${article.content || article.description}

      Provide only the translated text.`;

      const result = await model.generateContent(prompt);
      const response = result.response; // No need for await here
      const text = response.text();
      setAiTranslation(text);
    } catch (error) {
      console.error("Translation error:", error);
      setAiTranslation(`Error: Could not translate to ${language}. Service might be unavailable or content inaccessible.`);
    } finally {
      setIsGeneratingTranslation(false);
    }
  }, [isGeneratingTranslation]);

   // --- Filtered Articles ---
  const filteredArticles = useMemo(() => {
    if (!debouncedSearchQuery) return articles;
    return articles.filter(article =>
      article.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      (article.description && article.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase()))
    );
  }, [articles, debouncedSearchQuery]);

  // --- Component Structure ---

  // Skeleton Card Component
  const SkeletonCard = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-300 dark:bg-gray-700"></div>
      <div className="p-5">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full mb-1"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full mb-4"></div>
        <div className="flex justify-between items-center">
          <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded-full w-16"></div>
          <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
        </div>
      </div>
    </div>
  );

  // Article Card Component
  const ArticleCard = ({ article, onReadMore, onBookmarkToggle, isBookmarked }) => (
     <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
      whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
      className="relative group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-purple-500/10 dark:hover:shadow-purple-400/10 transition-all overflow-hidden cursor-pointer flex flex-col"
      onClick={() => onReadMore(article)}
    >
      <div className="absolute top-3 right-3 z-10">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={(e) => { e.stopPropagation(); onBookmarkToggle(article); }}
          className="p-2 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-full shadow-sm hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
          aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
        >
          {isBookmarked ? (
            <BookmarkSolid className="h-5 w-5 text-purple-600" />
          ) : (
            <BookmarkIcon className="h-5 w-5 text-gray-500 hover:text-purple-600" />
          )}
        </motion.button>
      </div>

      <div className="h-48 overflow-hidden">
        <img
          src={article.urlToImage || DEFAULT_IMAGE_URL}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => { e.target.src = DEFAULT_IMAGE_URL; }}
          loading="lazy" // Lazy load images
        />
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
          <GlobeAltIcon className="h-4 w-4 mr-1.5 flex-shrink-0" />
          <span className="truncate" title={article.source.name}>{article.source.name}</span>
          <span className="mx-2">•</span>
          <ClockIcon className="h-4 w-4 mr-1 flex-shrink-0" />
          {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
        </div>

        <h3 className="text-lg font-semibold mb-2 line-clamp-2 text-gray-800 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
          {article.title}
        </h3>

        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-4 flex-grow">
          {article.description}
        </p>

        <div className="flex justify-between items-center text-xs mt-auto pt-2 border-t border-gray-100 dark:border-gray-700/50">
          <span className="px-2.5 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full font-medium">
            {calculateReadTime(article.content || article.description)} min read
          </span>
          <span className="text-purple-600 dark:text-purple-400 font-medium group-hover:underline">
            Read more
          </span>
        </div>
      </div>
    </motion.div>
  );

  // Navigation Item Component
  const NavItem = ({ label, icon: Icon, categoryName, currentCategory, onClick }) => (
    <button
      onClick={() => onClick(categoryName)}
      className={`px-3 py-2 rounded-md text-sm font-medium flex items-center transition-all duration-200 ${
        currentCategory === categoryName
          ? 'bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/60 dark:to-indigo-900/60 text-purple-700 dark:text-purple-300 shadow-inner'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
      }`}
    >
      <Icon className={`h-4 w-4 mr-1.5 ${currentCategory === categoryName ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400'}`} />
      {label}
    </button>
  );

  const MobileNavItem = ({ label, icon: Icon, categoryName, currentCategory, onClick }) => (
     <button
      onClick={() => { onClick(categoryName); setMobileMenuOpen(false); }}
      className={`w-full flex items-center px-3 py-2.5 rounded-md text-base font-medium transition-all duration-200 ${
        currentCategory === categoryName
          ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
    >
      <Icon className="h-5 w-5 mr-3" />
      {label}
    </button>
  );

  // Main JSX
  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans ${darkMode ? 'dark bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900' : 'bg-gradient-to-br from-gray-50 via-slate-50 to-gray-50'}`}>
      {/* --- Enhanced Navbar --- */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Left side */}
            <div className="flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none lg:hidden mr-2"
                aria-label="Toggle mobile menu"
              >
                 {mobileMenuOpen ? <XMarkIcon className="block h-6 w-6" /> : <Bars3Icon className="block h-6 w-6" />}
              </button>
              <div className="flex-shrink-0 flex items-center">
                <AcademicCapIcon className="h-8 w-auto text-purple-600 dark:text-purple-400" />
                <span className="ml-2 text-xl font-bold text-gray-800 dark:text-white hidden sm:inline">
                  Edu<span className="text-purple-600 dark:text-purple-400">News</span> Insights
                </span>
              </div>
              <nav className="hidden lg:ml-10 lg:flex lg:space-x-4">
                 <NavItem label="Home" icon={HomeIcon} categoryName="education" currentCategory={category} onClick={setCategory} />
                 <NavItem label="EdTech" icon={ComputerDesktopIcon} categoryName="technology" currentCategory={category} onClick={setCategory} />
                 <NavItem label="Research" icon={BeakerIcon} categoryName="research" currentCategory={category} onClick={setCategory} />
                 <NavItem label="Policy" icon={BuildingLibraryIcon} categoryName="policy" currentCategory={category} onClick={setCategory} />
              </nav>
            </div>

            {/* Right side */}
            <div className="flex items-center">
              <div className="hidden md:block relative mr-4">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="search" // Use type search
                  placeholder="Search articles..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-full text-sm leading-5 bg-gray-50 dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-150 ease-in-out"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                 <motion.button
                    whileTap={{ scale: 0.9, rotate: 15 }}
                    onClick={() => setDarkMode(!darkMode)}
                    className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
                    aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                  >
                    {darkMode ? <SunIcon className="h-5 w-5 text-yellow-400" /> : <MoonIcon className="h-5 w-5 text-indigo-500" />}
                  </motion.button>
                 <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none relative" aria-label="Notifications">
                    <BellIcon className="h-5 w-5" />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 flex items-center justify-center text-[6px] text-white">
                      {/* Notification count could go here */}
                    </span>
                 </button>
                <div className="relative">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center text-sm rounded-full focus:outline-none p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                    aria-label="User menu" aria-haspopup="true" aria-expanded={userDropdownOpen}
                  >
                    <UserCircleIcon className="h-7 w-7 text-gray-500" />
                    <ChevronDownIcon className="ml-1 h-4 w-4 text-gray-400" />
                  </motion.button>
                  <AnimatePresence>
                    {userDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10, transition: { duration: 0.15 } }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                      >
                        <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button">
                          <a href="#" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600" role="menuitem">Your Profile</a>
                          <a href="#" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600" role="menuitem">Settings</a>
                          <a href="#" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600" role="menuitem">Sign out</a>
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
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="lg:hidden border-t border-gray-200/50 dark:border-gray-700/50"
            >
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white/95 dark:bg-gray-800/95">
                <div className="px-1 py-2">
                  <input
                    type="search"
                    placeholder="Search articles..."
                    className="block w-full pl-4 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-full text-sm leading-5 bg-gray-50 dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                 <MobileNavItem label="Home" icon={HomeIcon} categoryName="education" currentCategory={category} onClick={setCategory} />
                 <MobileNavItem label="EdTech" icon={ComputerDesktopIcon} categoryName="technology" currentCategory={category} onClick={setCategory} />
                 <MobileNavItem label="Research" icon={BeakerIcon} categoryName="research" currentCategory={category} onClick={setCategory} />
                 <MobileNavItem label="Policy" icon={BuildingLibraryIcon} categoryName="policy" currentCategory={category} onClick={setCategory} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* --- Main Content --- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Filters */}
        <div className="mb-8">
           <h2 className="text-base font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Explore Topics</h2>
           <div className="flex flex-wrap gap-2">
            {['Education', 'Technology', 'Research', 'Policy', 'Innovation', 'Science', 'Global', 'Higher Ed', 'K-12', 'Funding', 'AI in Education'].map((cat) => (
              <motion.button
                key={cat}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCategory(cat.toLowerCase().replace(' ', '-'))} // Use slugs
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ease-out ${
                  category === cat.toLowerCase().replace(' ', '-')
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md ring-2 ring-offset-2 ring-purple-500 ring-offset-gray-50 dark:ring-offset-gray-900'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                }`}
              >
                {cat}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Trending Topics */}
        {trendingTopics.length > 0 && (
          <div className="mb-8 p-4 bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-900/30 dark:via-indigo-900/30 dark:to-blue-900/30 rounded-xl shadow-inner">
            <h3 className="flex items-center text-sm font-semibold mb-3 text-purple-700 dark:text-purple-300">
              <SparklesIcon className="h-4 w-4 mr-2 animate-pulse" />
              Trending Now
            </h3>
            <div className="flex flex-wrap gap-2">
              {trendingTopics.map((topic) => (
                <motion.button
                  key={topic}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSearchQuery(topic)}
                  className="px-3 py-1 bg-white dark:bg-gray-700/50 rounded-full text-xs shadow-sm hover:bg-purple-50 dark:hover:bg-purple-900/50 transition-colors text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600/50"
                >
                  #{topic}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Loading/Error/Content */}
        {error && (
            <div className="text-center py-10 px-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400" />
                <h3 className="mt-2 text-lg font-medium text-red-800 dark:text-red-300">Failed to Load News</h3>
                <p className="mt-1 text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
        )}

        {!error && (
          loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            filteredArticles.length > 0 ? (
               <motion.div
                layout // Animate layout changes when filtering
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
               >
                  {filteredArticles.map((article) => (
                    <ArticleCard
                      key={article.url} // Use URL as key
                      article={article}
                      onReadMore={setSelectedArticle}
                      onBookmarkToggle={toggleBookmark}
                      isBookmarked={bookmarks.some(b => b.url === article.url)}
                    />
                  ))}
              </motion.div>
            ) : (
                 <div className="text-center py-10 px-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
                    <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-200">No Articles Found</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {debouncedSearchQuery ? `No results for "${debouncedSearchQuery}". ` : ''}
                      Try adjusting your search or selecting a different category.
                    </p>
                 </div>
            )
          )
        )}

        {/* Back to Top Button */}
        <motion.button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 p-3 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-full shadow-lg hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:focus:ring-offset-gray-900"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          whileHover={{ scale: 1.1, rotate: -5 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Scroll to top"
        >
          <ArrowUpCircleIcon className="h-6 w-6" />
        </motion.button>
      </main>

      {/* --- Article Detail Modal --- */}
      <AnimatePresence>
        {selectedArticle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setSelectedArticle(null)} // Close on backdrop click
          >
            <motion.div
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.9 }}
               transition={{ duration: 0.25, ease: "easeOut" }}
              className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
            >
              {selectedArticle.urlToImage && (
                <div className="h-56 sm:h-64 w-full overflow-hidden rounded-t-2xl flex-shrink-0">
                  <img
                    src={selectedArticle.urlToImage || DEFAULT_IMAGE_URL}
                    alt={selectedArticle.title}
                    className="w-full h-full object-cover"
                     onError={(e) => { e.target.src = DEFAULT_IMAGE_URL; }}
                  />
                </div>
              )}

              <div className="p-6 sm:p-8 flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                    {selectedArticle.title}
                  </h2>
                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="p-1.5 -mr-2 -mt-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    aria-label="Close modal"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-6 text-sm text-gray-500 dark:text-gray-400">
                  <span>Source: <span className="font-medium text-gray-700 dark:text-gray-300">{selectedArticle.source.name}</span></span>
                  <span>•</span>
                   <span>{formatDistanceToNow(new Date(selectedArticle.publishedAt), { addSuffix: true })}</span>
                  <span>•</span>
                  <span>{calculateReadTime(selectedArticle.content || selectedArticle.description)} min read</span>
                </div>

                {/* Use prose for better article formatting */}
                <div className="prose prose-lg dark:prose-invert max-w-none mb-8 text-gray-700 dark:text-gray-300">
                  {selectedArticle.content?.split('[')[0] || selectedArticle.description} {/* Show content before "[+... chars]" or fallback */}
                   {selectedArticle.content?.includes('[+') && (
                      <span className="text-gray-400 dark:text-gray-500 text-sm block mt-2"> (Content truncated in preview)</span>
                   )}
                </div>

                {/* AI Features Section */}
                {genAI && (
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 p-5 sm:p-6 rounded-xl mb-8 border border-purple-100 dark:border-purple-800/50">
                    <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center text-gray-800 dark:text-gray-200">
                      <SparklesIcon className="h-5 w-5 mr-2 text-purple-500" />
                      AI Assistant Tools
                    </h3>

                    <div className="flex flex-wrap gap-3 mb-5">
                      <button
                        onClick={() => generateSummary(selectedArticle)}
                        disabled={isGeneratingSummary || isGeneratingTranslation}
                        className="px-4 py-2 bg-purple-100 dark:bg-purple-800/60 text-purple-700 dark:text-purple-300 text-sm rounded-lg flex items-center hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                         {isGeneratingSummary ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-purple-500 mr-2"></div>
                         ) : (
                             <LightBulbIcon className="h-5 w-5 mr-2" />
                         )}
                        Summarize Key Points
                      </button>
                      {['Spanish', 'French', 'German'].map(lang => (
                         <button
                            key={lang}
                            onClick={() => translateArticle(selectedArticle, lang)}
                            disabled={isGeneratingSummary || isGeneratingTranslation}
                            className="px-4 py-2 bg-blue-100 dark:bg-blue-800/60 text-blue-700 dark:text-blue-300 text-sm rounded-lg flex items-center hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                         >
                            {isGeneratingTranslation && aiTranslation?.includes(lang) ? ( // Simple check if this lang is being translated
                               <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500 mr-2"></div>
                            ): (
                                <LanguageIcon className="h-5 w-5 mr-2" />
                            )}
                            Translate to {lang}
                         </button>
                      ))}
                    </div>

                    {/* AI Results Display */}
                     <AnimatePresence>
                        {(isGeneratingSummary || aiSummary) && (
                           <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-4 overflow-hidden"
                            >
                                <h4 className="font-medium mb-2 text-gray-800 dark:text-gray-300 text-sm">AI Summary:</h4>
                                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700/50 text-sm">
                                    {isGeneratingSummary ? (
                                        <p className="italic text-gray-500 dark:text-gray-400">Generating summary...</p>
                                    ) : (
                                        <ul className="list-disc list-inside space-y-1">
                                          {formatSummary(aiSummary).map((point, i) => (
                                            <li key={i} className="text-gray-700 dark:text-gray-300">{point}</li>
                                          ))}
                                        </ul>
                                    )}
                                </div>
                           </motion.div>
                        )}
                    </AnimatePresence>
                    <AnimatePresence>
                        {(isGeneratingTranslation || aiTranslation) && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <h4 className="font-medium mb-2 text-gray-800 dark:text-gray-300 text-sm">AI Translation:</h4>
                                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700/50 text-sm text-gray-700 dark:text-gray-300">
                                     {isGeneratingTranslation ? (
                                         <p className="italic text-gray-500 dark:text-gray-400">Translating...</p>
                                     ) : (
                                        <p>{aiTranslation}</p>
                                     )}
                                </div>
                            </motion.div>
                        )}
                     </AnimatePresence>
                  </div>
                )}

                 {/* Footer Actions */}
                 <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-200 dark:border-gray-700/50">
                    <a
                      href={selectedArticle.url}
                      target="_blank"
                      rel="noopener noreferrer"
                       className="inline-flex items-center justify-center px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-medium rounded-full shadow-md hover:shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:focus:ring-offset-gray-800 w-full sm:w-auto"
                    >
                       Read Full Article on {selectedArticle.source.name}
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                       </svg>
                    </a>
                    <button
                        onClick={() => toggleBookmark(selectedArticle)}
                        className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors w-full sm:w-auto justify-center py-2"
                    >
                       {bookmarks.some(b => b.url === selectedArticle.url) ? (
                         <>
                           <BookmarkSolid className="h-5 w-5 mr-1.5 text-purple-600" />
                           <span>Saved to Bookmarks</span>
                         </>
                       ) : (
                         <>
                           <BookmarkIcon className="h-5 w-5 mr-1.5" />
                           <span>Save this Article</span>
                         </>
                       )}
                    </button>
                 </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EducationalNewsPage;