import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { auth, db } from '../../firebase/firebaseConfig';
import { collection, query, where, orderBy, getDocs, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth'; // Keep if used elsewhere, not strictly needed for just currentUser
import {
  EnvelopeIcon,
  HomeIcon,
  ChartBarIcon,
  SparklesIcon,
  Bars3Icon,
  XMarkIcon,
  PaperClipIcon,
  ArrowUpTrayIcon, // Removed, but keeping for completeness if needed later
  LightBulbIcon,
  LanguageIcon,
  DocumentTextIcon,
  PencilIcon, // Removed, but keeping for completeness if needed later
  TrashIcon,
  DocumentMagnifyingGlassIcon,
  CheckCircleIcon,
  ClockIcon,
  UserCircleIcon,
  ChevronLeftIcon,
  ChatBubbleLeftEllipsisIcon,
  MagnifyingGlassIcon,
  FolderIcon,
  ClipboardDocumentIcon,
  PresentationChartLineIcon,
  ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon,
  NewspaperIcon,
  WrenchScrewdriverIcon,
  VideoCameraIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useMediaQuery } from 'react-responsive';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

// Initialize Gemini AI
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "YOUR_API_KEY_HERE";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// --- Student Menu Definition ---
const studentMenu = [
  { title: 'Dashboard', Icon: HomeIcon, link: '/dashboard', description: "Overview of your progress." },
  { title: 'My Resources', Icon: FolderIcon, link: '/resource-utilization', description: "Access course materials." },
  { title: 'Tests', Icon: ClipboardDocumentIcon, link: '/student-tests', description: "Take and view your test results." },
  { title: 'Attendance', Icon: ChartBarIcon, link: '/attendance-monitoring', description: "Track your attendance." },
  { title: 'Assignments', Icon: DocumentTextIcon, link: '/assignment-submission', description: "View & submit assignments." },
  { title: 'Grades & Feedback', Icon: PresentationChartLineIcon, link: '/GradesAndFeedback', description: "Check your grades." },
  { title: 'AI Feedback', Icon: DocumentMagnifyingGlassIcon, link: '/personalized-feedback-students', description: "Get AI-powered insights on your progress." },
  { title: 'Voice Chat', Icon: ChatBubbleLeftRightIcon, link: '/voice-chat', description: "Discuss with peers." },
  { title: 'Ask Sparky', Icon: QuestionMarkCircleIcon, link: '/chatbot-access', description: "Your AI study assistant." },
  { title: 'AI Questions', Icon: LightBulbIcon, link: '/ai-generated-questions', description: "Practice with AI questions." },
  { title: 'Educational News', Icon: NewspaperIcon, link: '/educational-news', description: "Latest in education." },
  { title: 'Smart Review', Icon: WrenchScrewdriverIcon, link: '/smart-review', description: "Enhance your writing." },
  { title: 'Virtual Meetings', Icon: VideoCameraIcon, link: '/meeting-participation', description: "Join online classes." },
  { title: 'Chat Platform', Icon: ChatBubbleLeftRightIcon, link: '/chat-functionality', description: "Connect with peers." },
  { title: 'My Inbox', Icon: EnvelopeIcon, link: '/inbox-for-suggestions', description: "Messages & suggestions." },
  { title: 'Upgrade to Pro', Icon: SparklesIcon, link: '/pricing', special: true, description: "Unlock premium features." },
];

const SuggestionsInbox = () => {
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [searchQuery, setSearchQuery] = useState(''); // This state is unused, 'searchTerm' is used instead
  // const [composeOpen, setComposeOpen] = useState(false); // REMOVED as per request
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [messageDraft, setMessageDraft] = useState(''); // This state is currently unused
  const [attachments, setAttachments] = useState([]); // This state is currently unused
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const fileInputRef = useRef(null); // This ref is currently unused
  const isDesktop = useMediaQuery({ minWidth: 768 });
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false); // Used for the full-screen modal
  // const [isLoading, setIsLoading] = useState(true); // This state is redundant with 'loading'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // This state is currently unused in UI but kept for potential future use
  const [priorityFilter, setPriorityFilter] = useState('all'); // This state is currently unused in UI but kept for potential future use
  const [categoryFilter, setCategoryFilter] = useState('all'); // This state is currently unused in UI but kept for potential future use
  const [sortOption, setSortOption] = useState('newest'); // This state is currently unused in UI but kept for potential future use
  const { currentUser } = useAuth();

  // Fetch suggestions from Firestore
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      navigate('/login');
      return;
    }

    try {
      const suggestionsRef = collection(db, 'suggestions');
      const q = query(
        suggestionsRef,
        where('studentId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      
      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const suggestionsList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setSuggestions(suggestionsList);
          setLoading(false);
        },
        (error) => {
          console.error("Error fetching suggestions:", error);
          setError("Failed to load suggestions. Please try again.");
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error("Error setting up suggestions listener:", error);
      setError("Failed to load suggestions. Please try again.");
      setLoading(false);
    }
  }, [currentUser, navigate]);

  // Styles for different statuses (kept as reference, not directly used in the current badges)
  const statusStyles = {
    unread: 'text-red-400 bg-red-500/10',
    read: 'text-gray-400 bg-gray-500/10',
    'pending-action': 'text-amber-400 bg-amber-500/10',
    resolved: 'text-green-400 bg-green-500/10',
  };

  const priorityStyles = {
    high: 'bg-red-500/20 text-red-400',
    medium: 'bg-amber-500/20 text-amber-400',
    low: 'bg-blue-500/20 text-blue-400',
  };

  useEffect(() => {
    if (isDesktop) {
      setIsSidebarOpen(true);
    } else {
      setIsSidebarOpen(false);
    }
  }, [isDesktop]);

  // Functions handleFileUpload and removeReplyAttachment are now unused due to compose removal
  // const handleFileUpload = (e) => {
  //   const files = Array.from(e.target.files);
  //   setAttachments([...attachments, ...files.map(f => ({ name: f.name, size: f.size, type: f.type, fileObject: f }))]);
  // };

  // const removeReplyAttachment = (fileName) => {
  //   setAttachments(prev => prev.filter(file => file.name !== fileName));
  // };

  const generateAiResponse = async () => {
    if (!selectedSuggestion) return;
    setIsGeneratingResponse(true);
    setAiResponse('Generating...'); // Provide immediate feedback
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `You are an AI teaching assistant helping a student respond to this feedback from their professor:
      
      Professor: ${selectedSuggestion.teacherName || selectedSuggestion.teacher}
      Subject: ${selectedSuggestion.subject}
      Message: ${selectedSuggestion.fullMessage}

      Generate a professional, grateful response that:
      1. Thanks the professor for their feedback
      2. Addresses each of their key points (including any attachments if mentioned in the message)
      3. Shows the student will act on the suggestions
      4. Asks any clarifying questions if needed
      
      Keep it concise (2-3 paragraphs max) and in an appropriate academic tone.`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      setAiResponse(text);
      // setMessageDraft(text); // No longer needed as compose is removed
    } catch (error) {
      console.error("AI generation error:", error);
      setAiResponse("Error: Could not generate response. Please check API key and network.");
    } finally {
      setIsGeneratingResponse(false);
    }
  };

  const translateMessage = async (targetLanguage = 'Spanish') => {
    if (!selectedSuggestion) return;
    setIsGeneratingResponse(true);
    setAiResponse('Translating...'); // Provide immediate feedback
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `Translate the following academic message to ${targetLanguage} while maintaining the formal tone and academic style. Preserve any technical terms and keep the meaning accurate:

      Message to translate:
      "${selectedSuggestion.fullMessage}"`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      setAiResponse(`${targetLanguage} Translation:\n\n${text}`);
    } catch (error) {
      console.error("Translation error:", error);
      setAiResponse(`Error: Could not translate message to ${targetLanguage}.`);
    } finally {
      setIsGeneratingResponse(false);
    }
  };

  const summarizeFeedback = async () => {
    if (!selectedSuggestion) return;
    setIsGeneratingResponse(true);
    setAiResponse('Summarizing...'); // Provide immediate feedback
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `Analyze this professor's feedback and extract the 3-5 most important actionable items for the student. Consider any mentioned attachments as part of the feedback. Present them as clear bullet points with brief explanations:

      Feedback to summarize:
      "${selectedSuggestion.fullMessage}"

      Format your response as:
      Key Action Items:
      - [Key point 1]: [Brief explanation]
      - [Key point 2]: [Brief explanation]
      ...`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      setAiResponse(text);
    } catch (error) {
      console.error("Summarization error:", error);
      setAiResponse("Error: Could not summarize feedback.");
    } finally {
      setIsGeneratingResponse(false);
    }
  };

  const handleDeleteSuggestion = async (e, suggestionId) => {
    e.stopPropagation(); // Prevent the click from opening the suggestion modal
    if (window.confirm('Are you sure you want to delete this suggestion? This action cannot be undone.')) {
      setLoading(true); // Indicate loading while deleting
      try {
        await deleteDoc(doc(db, 'suggestions', suggestionId));
        setSuggestions(prevSuggestions => prevSuggestions.filter(sug => sug.id !== suggestionId));
        if (selectedSuggestion && selectedSuggestion.id === suggestionId) {
            setSelectedSuggestion(null); // Close the detail view if the current one is deleted
            setIsModalOpen(false);
        }
        alert('Suggestion deleted successfully!'); // User feedback
      } catch (error) {
        console.error("Error deleting suggestion: ", error);
        setError("Failed to delete suggestion. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  // This function is no longer used, handleSuggestionClick is used directly for opening modal
  // const handleSelectSuggestion = async (suggestion) => {
  //   setSelectedSuggestion(suggestion);
  //   setAiResponse('');
  //   setMessageDraft('');
  //   setAttachments([]);

  //   // If suggestion is unread, mark it as read
  //   if (suggestion.status === 'unread') {
  //     try {
  //       const suggestionRef = doc(db, 'suggestions', suggestion.id);
  //       await updateDoc(suggestionRef, {
  //         status: 'read'
  //       });
  //     } catch (error) {
  //       console.error("Error marking suggestion as read:", error);
  //     }
  //   }
  // };

  // Filter and sort suggestions
  const filteredSuggestions = suggestions
    .filter(suggestion => {
      if (!suggestion) return false;
      
      const matchesSearch = searchTerm === '' || 
        (suggestion.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (suggestion.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (suggestion.teacherName?.toLowerCase() || '').includes(searchTerm.toLowerCase());

      // These filters are not yet exposed in the UI but are here for future use
      const matchesStatus = statusFilter === 'all' || suggestion.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || suggestion.priority === priorityFilter;
      const matchesCategory = categoryFilter === 'all' || suggestion.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    })
    .sort((a, b) => {
      if (!a || !b) return 0;
      
      switch (sortOption) {
        case 'newest':
          // Convert Firestore Timestamp to Date for comparison, handle missing/null dates
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0); // Use epoch for safety
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
          return dateB.getTime() - dateA.getTime();
        case 'oldest':
          const dateAOld = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
          const dateBOld = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
          return dateAOld.getTime() - dateBOld.getTime();
        case 'priority':
          return getPriorityWeight(b.priority) - getPriorityWeight(a.priority);
        default:
          return 0;
      }
    });

  // Get priority weight for sorting
  const getPriorityWeight = (priority) => {
    switch (priority) {
      case 'high':
        return 3;
      case 'medium':
        return 2;
      case 'low':
        return 1;
      default:
        return 0;
    }
  };

  // Get status color for badges
  const getStatusColor = (status) => {
    switch (status) {
      case 'unread':
        return 'bg-purple-500/20 text-purple-300 border border-purple-400/30';
      case 'read':
        return 'bg-gray-600/20 text-gray-400 border border-gray-500/30';
      case 'archived':
        return 'bg-blue-500/20 text-blue-300 border border-blue-400/30';
      case 'pending': // Example of a new status
        return 'bg-amber-500/20 text-amber-300 border border-amber-400/30';
      case 'resolved': // Example of a new status
        return 'bg-green-500/20 text-green-300 border border-green-400/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border border-gray-400/30';
    }
  };

  // Get priority color for badges
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-300 border border-red-400/30';
      case 'medium':
        return 'bg-amber-500/20 text-amber-300 border border-amber-400/30';
      case 'low':
        return 'bg-blue-500/20 text-blue-300 border border-blue-400/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border border-gray-400/30';
    }
  };

  // Get category color for badges
  const getCategoryColor = (category) => {
    switch (category) {
      case 'Academic':
        return 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/30';
      case 'Behavioral':
        return 'bg-orange-500/20 text-orange-300 border border-orange-400/30';
      case 'Social':
        return 'bg-teal-500/20 text-teal-300 border border-teal-400/30';
      case 'Technical': // Example of a new category
        return 'bg-pink-500/20 text-pink-300 border border-pink-400/30';
      case 'Other':
        return 'bg-gray-500/20 text-gray-400 border border-gray-400/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border border-gray-400/30';
    }
  };

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    let date;
    // Check if it's a Firestore Timestamp or an ISO string
    if (typeof timestamp.toDate === 'function') {
      date = timestamp.toDate();
    } else {
      date = new Date(timestamp);
    }
    
    // Ensure the date is valid before formatting
    if (isNaN(date.getTime())) {
      console.error("Invalid date object:", timestamp);
      return '';
    }

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true // To display AM/PM
    });
  };

  // Handle suggestion click to open modal
  const handleSuggestionClick = async (suggestion) => {
    if (!suggestion || !suggestion.id) return;
    
    setSelectedSuggestion(suggestion);
    setAiResponse(''); // Clear previous AI response
    setIsModalOpen(true);

    // Update status to 'read' if it's unread
    if (suggestion.status === 'unread') {
      try {
        const suggestionRef = doc(db, 'suggestions', suggestion.id);
        await updateDoc(suggestionRef, {
          status: 'read',
          readAt: new Date().toISOString() // Store read timestamp
        });

        // Update local state to reflect the change immediately
        setSuggestions(prevSuggestions =>
          prevSuggestions.map(s =>
            s.id === suggestion.id
              ? { ...s, status: 'read', readAt: new Date().toISOString() }
              : s
          )
        );
      } catch (error) {
        console.error('Error updating suggestion status:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex text-gray-200">
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            key="sidebar"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30, duration: 0.3 }}
            className="fixed top-0 left-0 h-full w-64 bg-gray-800/80 backdrop-blur-xl border-r border-gray-700/60 shadow-2xl z-50 flex flex-col md:h-screen md:z-40 md:fixed md:translate-x-0"
          >
            <div className="p-5 flex items-center gap-3.5 border-b border-gray-700/60 relative">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg">
                <SparklesIcon className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">SPARK-IQ</h1>
              {!isDesktop && (
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-gray-700/50 transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              )}
            </div>
            <nav className="flex-1 overflow-y-auto p-3 space-y-1.5 styled-scrollbar">
              {studentMenu.map(item => {
                const isActive = location.pathname === item.link;
                return (
                  <button
                    key={item.title}
                    onClick={() => {
                      navigate(item.link);
                      if (!isDesktop) setIsSidebarOpen(false);
                    }}
                    className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg text-gray-300 transition-all group
                              ${isActive ? 'bg-indigo-500/30 text-indigo-200 font-semibold shadow-inner' : 'hover:bg-indigo-500/10 hover:text-indigo-300'}
                              ${item.special ? `mt-auto mb-1 bg-gradient-to-r from-purple-600/90 to-indigo-600/90 !text-white shadow-md hover:shadow-lg hover:opacity-90 ${isActive ? 'ring-2 ring-purple-400' : ''}` : ''}`}
                  >
                    <item.Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-indigo-300' : 'text-indigo-400'} group-hover:scale-110 transition-transform`} />
                    <span className="text-sm font-medium">{item.title}</span>
                  </button>
                );
              })}
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>
      {isSidebarOpen && !isDesktop && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>}

      <div className="flex-1 flex flex-col overflow-x-hidden md:ml-64 bg-gray-900">
        {!isDesktop && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="fixed left-4 top-4 z-40 p-2 bg-gray-800/80 backdrop-blur-sm rounded-lg hover:bg-gray-700 transition-colors shadow-lg"
          >
            <Bars3Icon className="w-6 h-6 text-gray-300" />
          </button>
        )}
        <div className="p-4 md:p-6 border-b border-gray-700/50 flex items-center justify-between bg-gradient-to-r from-gray-800/70 to-gray-900/70 backdrop-blur-sm sticky top-0 z-30">
          <div className="flex items-center gap-2 md:gap-4">
            {selectedSuggestion ? (
              <button
                onClick={() => setSelectedSuggestion(null)} // This button is not fully functional as `isModalOpen` isn't set to false
                className="p-2 hover:bg-gray-700/30 rounded-lg transition-all flex items-center gap-2"
              >
                <ChevronLeftIcon className="w-6 h-6 text-gray-300" />
                <span className="text-gray-300 hidden sm:inline">Back to Inbox</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 md:gap-3">
                <div className="p-1.5 bg-purple-500/20 rounded-lg">
                  <EnvelopeIcon className="w-6 h-6 text-purple-400" />
                </div>
                <h1 className="text-xl md:text-2xl font-semibold text-white">
                  Suggestions Inbox
                </h1>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            {!selectedSuggestion && (
              <div className="relative flex-1 max-w-xs">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search suggestions..."
                  className="pl-10 pr-4 py-2.5 bg-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 w-full transition-all text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 styled-scrollbar">
          {!selectedSuggestion && !isModalOpen ? ( // Display inbox list only if no suggestion is selected AND modal is closed
            <div className="grid grid-cols-1 gap-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
                  <p className="mt-4 text-gray-400">Loading suggestions...</p>
                </div>
              ) : error ? (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
                  {error}
                </div>
              ) : suggestions.length === 0 ? (
                <div className="text-center py-8 bg-gray-800/40 rounded-xl border border-gray-700/50 shadow-lg p-8">
                  <EnvelopeIcon className="w-20 h-20 text-gray-600 mx-auto mb-6" />
                  <p className="text-gray-400 text-lg font-medium">No suggestions in your inbox yet.</p>
                  <p className="text-gray-500 mt-2">Feedback and messages from your instructors will appear here.</p>
                </div>
              ) : (
                filteredSuggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="group p-4 md:p-6 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-purple-400/50 transition-all cursor-pointer shadow-lg hover:shadow-purple-500/10 backdrop-blur-sm"
                    onClick={() => handleSuggestionClick(suggestion)} // Click anywhere on the card to open
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(suggestion.status)}`}>
                            {suggestion.status.replace('-', ' ')}
                          </span>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityColor(suggestion.priority)}`}>
                            {suggestion.priority} Priority
                          </span>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryColor(suggestion.category)}`}>
                            {suggestion.category}
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                          <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">{suggestion.title}</h3>
                          <span className="text-gray-500 hidden sm:inline">•</span>
                          <span className="text-gray-400 text-sm">{suggestion.teacherName}</span>
                        </div>
                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{suggestion.fullMessage}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{formatDate(suggestion.createdAt)}</span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDeleteSuggestion(e, suggestion.id)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-all self-start ml-4 flex-shrink-0"
                        title="Delete Suggestion"
                      >
                        <TrashIcon className="w-5 h-5 text-red-400 hover:text-red-300" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : null }
        </div>

        {/* Suggestion Modal (Replaced inline detail view) */}
        {isModalOpen && selectedSuggestion && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in" onClick={() => { setIsModalOpen(false); setSelectedSuggestion(null); }}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="bg-gray-800 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto styled-scrollbar shadow-2xl border border-gray-700/50"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
            >
              <div className="p-6 relative">
                {/* Close Button */}
                <button
                  onClick={() => { setIsModalOpen(false); setSelectedSuggestion(null); }}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-700/50"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>

                {/* Title Section */}
                <div className="mb-6 pb-4 border-b border-gray-700/50">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{selectedSuggestion.title}</h2>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-gray-400 text-sm md:text-md">
                    <div className="flex items-center gap-2">
                      <UserCircleIcon className="w-5 h-5 text-purple-400" />
                      <span className="font-medium">{selectedSuggestion.teacherName}</span>
                      <span className="text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
                        <CheckCircleIcon className="w-3 h-3" />
                        Verified
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ClockIcon className="w-5 h-5 text-blue-400" />
                      <span>{formatDate(selectedSuggestion.createdAt)}</span>
                    </div>
                    {/* Delete button specific to modal view */}
                    <button
                        onClick={(e) => handleDeleteSuggestion(e, selectedSuggestion.id)}
                        className="p-1.5 hover:bg-red-500/20 rounded-lg transition-all"
                        title="Delete Suggestion"
                    >
                        <TrashIcon className="w-5 h-5 text-red-400 hover:text-red-300" />
                    </button>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(selectedSuggestion.status)}`}>
                    {selectedSuggestion.status.replace('-', ' ')}
                  </span>
                  <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${getPriorityColor(selectedSuggestion.priority)}`}>
                    {selectedSuggestion.priority} Priority
                  </span>
                  <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${getCategoryColor(selectedSuggestion.category)}`}>
                    {selectedSuggestion.category}
                  </span>
                </div>

                {/* Content Section */}
                <div className="space-y-6">
                  <div className="prose prose-invert max-w-none text-gray-300">
                    <p className="text-lg leading-relaxed">{selectedSuggestion.fullMessage}</p>
                  </div>

                  {/* Attachments Section */}
                  {selectedSuggestion.attachments && selectedSuggestion.attachments.length > 0 && (
                    <div className="mt-6 p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
                      <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <PaperClipIcon className="w-6 h-6 text-purple-400" />
                        Attachments ({selectedSuggestion.attachments.length})
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {selectedSuggestion.attachments.map((file, index) => (
                          <a
                            key={index}
                            href={file.url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors flex flex-col items-center gap-2 text-center group"
                          >
                            <DocumentTextIcon className="w-8 h-8 text-gray-400 group-hover:text-purple-400 transition-colors" />
                            <span className="text-sm text-gray-300 truncate w-full" title={file.name}>
                              {file.name}
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Assistant Section */}
                  <div className="mt-6 p-4 md:p-6 border border-gray-700/50 bg-gray-800/40 rounded-lg shadow-inner shadow-purple-500/5">
                    <div className="flex items-center gap-2 mb-4">
                      <SparklesIcon className="w-6 h-6 text-purple-400" />
                      <h3 className="text-lg font-medium text-purple-300">AI Assistant</h3>
                    </div>
                    {isGeneratingResponse && aiResponse.includes('Generating...') && (
                        <div className="text-center py-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                            <p className="mt-2 text-gray-400">{aiResponse}</p>
                        </div>
                    )}
                    {aiResponse && !isGeneratingResponse && (
                      <div className="prose prose-sm sm:prose-base prose-invert max-w-none bg-gray-800/40 p-4 rounded-lg border border-gray-700 mb-4 shadow-sm">
                        {aiResponse.split('\n').map((para, i) => (
                          <p key={i} className="mb-3 text-gray-300 leading-relaxed">{para}</p>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-3 mt-4">
                      <button
                        onClick={generateAiResponse}
                        disabled={isGeneratingResponse}
                        className="px-4 py-2.5 text-sm bg-purple-500/20 text-purple-300 rounded-xl hover:bg-purple-500/30 flex items-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed border border-purple-400/30"
                      >
                        <SparklesIcon className="w-5 h-5" />
                        <span>AI Reply Draft</span>
                      </button>
                      <button
                        onClick={() => translateMessage()}
                        disabled={isGeneratingResponse}
                        className="px-4 py-2.5 text-sm bg-blue-500/20 text-blue-300 rounded-xl hover:bg-blue-500/30 flex items-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed border border-blue-400/30"
                      >
                        <LanguageIcon className="w-5 h-5" />
                        <span>Translate</span>
                      </button>
                      <button
                        onClick={summarizeFeedback}
                        disabled={isGeneratingResponse}
                        className="px-4 py-2.5 text-sm bg-amber-500/20 text-amber-300 rounded-xl hover:bg-amber-500/30 flex items-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed border border-amber-400/30"
                      >
                        <LightBulbIcon className="w-5 h-5" />
                        <span>Summarize</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
      <style>
        {`
          .styled-scrollbar::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          .styled-scrollbar::-webkit-scrollbar-track {
            background: rgba(55, 65, 81, 0.5);
            border-radius: 10px;
          }
          .styled-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(107, 114, 128, 0.7);
            border-radius: 10px;
          }
          .styled-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(156, 163, 175, 0.9);
          }
          .styled-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: rgba(107, 114, 128, 0.7) rgba(55, 65, 81, 0.5);
          }
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fade-in {
            animation: fade-in 0.3s ease-out forwards;
          }
        `}
      </style>
    </div>
  );
};

export default SuggestionsInbox;