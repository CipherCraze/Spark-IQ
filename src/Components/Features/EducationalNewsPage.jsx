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
  LanguageIcon
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
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <AcademicCapIcon className="h-8 w-8" />
            <h1 className="text-2xl font-bold">EduNews Global</h1>
          </div>
          
          <div className="flex items-center space-x-6">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-white/10 transition-all"
            >
              {darkMode ? (
                <SunIcon className="h-6 w-6" />
              ) : (
                <MoonIcon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search educational news..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-gray-800 shadow-md focus:ring-2 focus:ring-purple-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex space-x-4 overflow-x-auto">
            {['Global', 'Technology', 'Research', 'Policy', 'Innovation'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat.toLowerCase())}
                className={`px-4 py-2 rounded-full ${
                  category === cat.toLowerCase()
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 p-4 rounded-xl">
            <h3 className="flex items-center text-sm font-semibold mb-2">
              <SparklesIcon className="h-4 w-4 mr-2" />
              Trending Topics
            </h3>
            <div className="flex flex-wrap gap-2">
              {trendingTopics.map((topic) => (
                <span
                  key={topic}
                  className="px-2 py-1 bg-white dark:bg-gray-800 rounded-full text-xs shadow-sm"
                >
                  #{topic}
                </span>
              ))}
            </div>
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
                    className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all"
                  >
                    <div className="absolute top-4 right-4 z-10">
                      <button
                        onClick={() => toggleBookmark(article)}
                        className="p-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-purple-100 dark:hover:bg-purple-900/50"
                      >
                        {bookmarks.some(b => b.url === article.url) ? (
                          <BookmarkSolid className="h-5 w-5 text-purple-600" />
                        ) : (
                          <BookmarkIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>

                    {article.urlToImage && (
                      <img
                        src={article.urlToImage}
                        alt={article.title}
                        className="w-full h-48 object-cover rounded-t-2xl"
                        onError={(e) => {
                          e.target.src = 'https://source.unsplash.com/featured/?education';
                        }}
                      />
                    )}

                    <div className="p-6">
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <GlobeAltIcon className="h-4 w-4 mr-1" />
                        {article.source.name}
                      </div>

                      <h3 className="text-xl font-semibold mb-3">
                        <button
                          onClick={() => setSelectedArticle(article)}
                          className="hover:text-purple-600 transition-colors text-left"
                        >
                          {article.title}
                        </button>
                      </h3>

                      <p className="text-gray-600 dark:text-gray-300 line-clamp-3 mb-4">
                        {article.description}
                      </p>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center">
                          <BookOpenIcon className="h-4 w-4 mr-1" />
                          {formatDistanceToNow(new Date(article.publishedAt))} ago
                        </div>
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs">
                          {Math.ceil(article.content?.length / 100)} min read
                        </span>
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
          className="fixed bottom-8 right-8 p-3 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-all"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <ArrowUpCircleIcon className="h-6 w-6" />
        </motion.button>
      </main>

      {/* Article Detail Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl">
            {selectedArticle.urlToImage && (
              <img
                src={selectedArticle.urlToImage}
                alt={selectedArticle.title}
                className="w-full h-64 object-cover"
              />
            )}
            
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-3xl font-bold">{selectedArticle.title}</h2>
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

              <div className="flex items-center space-x-4 mb-6">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedArticle.source.name}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDistanceToNow(new Date(selectedArticle.publishedAt))} ago
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
                
                <div className="flex space-x-4 mb-6">
                  <button
                    onClick={() => generateSummary(selectedArticle)}
                    disabled={isGenerating}
                    className="px-4 py-2 bg-purple-500/10 text-purple-600 dark:text-purple-300 rounded-lg flex items-center hover:bg-purple-500/20 transition-colors disabled:opacity-50"
                  >
                    <LightBulbIcon className="h-5 w-5 mr-2" />
                    Summarize
                  </button>
                  <button
                    onClick={() => translateArticle(selectedArticle)}
                    disabled={isGenerating}
                    className="px-4 py-2 bg-blue-500/10 text-blue-600 dark:text-blue-300 rounded-lg flex items-center hover:bg-blue-500/20 transition-colors disabled:opacity-50"
                  >
                    <LanguageIcon className="h-5 w-5 mr-2" />
                    Translate
                  </button>
                </div>

                {aiSummary && (
                  <div className="mb-6">
                    <h4 className="font-medium mb-2">AI Summary:</h4>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      {aiSummary.split('\n').map((para, i) => (
                        <p key={i} className="mb-2">{para}</p>
                      ))}
                    </div>
                  </div>
                )}

                {aiTranslation && (
                  <div>
                    <h4 className="font-medium mb-2">AI Translation:</h4>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
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
                  className="px-6 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
                >
                  Read Full Article
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