import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderIcon,
  DocumentMagnifyingGlassIcon,
  BookOpenIcon,
  VideoCameraIcon,
  TrashIcon,
  ShareIcon,
  PlusCircleIcon, // Keep for potential future use (e.g., add local resource)
  SparklesIcon,
  UsersIcon,
  PresentationChartLineIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  // ArrowsPointingOutIcon, // Replaced with ArchiveBoxIcon for zip
  ArchiveBoxIcon, // For zip files
  ChevronLeftIcon,
  Bars3Icon,
  ClipboardDocumentIcon,
  DocumentTextIcon,
  ChartBarIcon,
  // ArrowUpTrayIcon, // Replaced with PaperAirplaneIcon for search or CloudArrowUpIcon for upload
  PaperAirplaneIcon, // For search submit
  MagnifyingGlassIcon,
  LinkIcon,
  PlayCircleIcon, // More visually distinct for video
  DocumentIcon,
  AcademicCapIcon, // For courses
  LightBulbIcon,   // For exercises/practice
  ExclamationTriangleIcon, // For errors
  InformationCircleIcon, // For info messages
} from '@heroicons/react/24/outline';

// Debounce function
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};


// Function to call Gemini API (minor logging adjustment for production)
const fetchResourcesFromLLM = async (query) => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.error('Gemini API key is missing. Ensure VITE_GEMINI_API_KEY is set in your .env file.');
      // In a real app, you might want to show a user-facing error here.
      return { error: 'API key not configured', courses: [], videos: [], books: [], websites: [], exercises: [] };
    }

    // console.log('Using API Key:', apiKey.substring(0, 5) + '...'); // Debug: remove or conditionalize for prod

    // Using a more specific model - check for latest recommended models if issues arise.
    // gemini-1.5-flash-latest might be a good alternative.
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are an expert learning assistant. Find educational resources for learning about "${query}".
            Your response MUST be a valid JSON object. Do NOT include any text outside of the JSON structure.
            The JSON object should follow this structure:
            {
              "courses": [{ "title": "Course Name", "link": "URL", "description": "Brief description" }],
              "videos": [{ "title": "Video Title", "channel": "Channel Name", "link": "URL", "duration": "HH:MM:SS or MM:SS" }],
              "books": [{ "title": "Book Title", "author": "Author Name", "link": "URL (if available, e.g., to a store or free version)", "description": "Brief summary" }],
              "websites": [{ "title": "Website/Documentation Name", "link": "URL", "description": "What it offers" }],
              "exercises": [{ "title": "Exercise/Worksheet Set", "link": "URL", "description": "Type of exercises" }]
            }
            Ensure all links are fully qualified URLs. Provide 5-6 diverse resources for each category if possible. If a category has no relevant resources, provide an empty array for it.
            Example for an empty category: "books": []
            Do NOT use markdown formatting (like \`\`\`json) around the JSON output.
            `
          }]
        }],
        // Add generationConfig for better control
        "generationConfig": {
          "responseMimeType": "application/json", // Request JSON directly
          "temperature": 0.3, // Lower temperature for more factual/structured output
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text(); // Get raw error text
      console.error('API Error Response Text:', errorText);
      let errorDetail = 'Unknown API error';
      try {
        const errorData = JSON.parse(errorText);
        errorDetail = errorData?.error?.message || errorText;
      } catch (e) {
        errorDetail = errorText;
      }
      throw new Error(`HTTP error! status: ${response.status} - ${errorDetail}`);
    }

    const data = await response.json();
    // console.log('Gemini API Parsed Response:', data); // Debug log

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.warn('Unexpected response structure from Gemini API:', data);
      throw new Error('Invalid response format from Gemini API (no candidates or content)');
    }
    
    // Since we requested application/json, data.candidates[0].content.parts[0].text should be the JSON string
    // or data itself might be the direct JSON object if the API handles responseMimeType perfectly.
    // The Gemini API with "responseMimeType": "application/json" should put the JSON directly in parts[0].text or similar.
    // However, sometimes it might still be a string that needs parsing.
    let resources = data.candidates[0].content.parts[0].text;
    if (typeof resources === 'string') {
      try {
        resources = JSON.parse(resources);
      } catch (parseError) {
        console.error('Error parsing JSON string from response:', parseError, "String was:", resources);
        throw new Error('Failed to parse resource data from API response string.');
      }
    }

    // console.log('Parsed Resources:', resources); // Debug log
    // Ensure all categories exist, even if empty, to prevent runtime errors
    const defaultStructure = { courses: [], videos: [], books: [], websites: [], exercises: [] };
    return { ...defaultStructure, ...resources };

  } catch (error) {
    console.error('Error fetching or processing resources:', error);
    // Return a default structure with an error flag
    return {
      error: error.message || 'Failed to fetch resources',
      courses: [],
      videos: [],
      books: [],
      websites: [],
      exercises: []
    };
  }
};


const ResourceUtilization = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [foundResources, setFoundResources] = useState(null); // null initially, then object
  const [searchError, setSearchError] = useState(null);

  const [localResources, setLocalResources] = useState([
    { id: 1, name: 'Calculus Fundamentals', type: 'folder', items: [
        { id: 11, name: 'Chapter 1 - Limits.pdf', type: 'pdf', uploaded: '2024-03-01' },
        { id: 12, name: 'Derivative Rules.mp4', type: 'video', uploaded: '2024-03-02' },
        { id: 13, name: 'Integration Techniques.pdf', type: 'pdf', uploaded: '2024-03-05' },
      ],
    },
    { id: 2, name: 'Physics Mechanics', type: 'folder', items: [
        { id: 21, name: 'Lab Report Template.docx', type: 'doc', uploaded: '2024-03-03' },
        { id: 22, name: 'Newtonian Motion Sim.zip', type: 'zip', uploaded: '2024-03-08' },
      ],
    },
    { id: 3, name: 'Python Programming Basics.pdf', type: 'pdf', uploaded: '2024-02-15' }
  ]);

  const getLocalResourceIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'pdf': return <DocumentIcon className="w-6 h-6 text-red-400" />;
      case 'video': return <PlayCircleIcon className="w-6 h-6 text-blue-400" />;
      case 'zip': return <ArchiveBoxIcon className="w-6 h-6 text-purple-400" />;
      case 'folder': return <FolderIcon className="w-6 h-6 text-amber-400" />;
      case 'doc': case 'docx': return <DocumentTextIcon className="w-6 h-6 text-sky-400" />;
      default: return <DocumentIcon className="w-6 h-6 text-gray-400" />;
    }
  };
  
  const handleSearch = async (query) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setFoundResources(null); // Clear previous results
    setSearchError(null);
    setSubmittedQuery(query);

    try {
      const resourcesData = await fetchResourcesFromLLM(query);
      if (resourcesData.error) {
        setSearchError(resourcesData.error);
        setFoundResources({ courses: [], videos: [], books: [], websites: [], exercises: [] }); // Ensure structure
      } else {
        setFoundResources(resourcesData);
      }
    } catch (error) { // Should be caught by fetchResourcesFromLLM, but as a fallback
      console.error('Error in handleSearch:', error);
      setSearchError(error.message || 'An unexpected error occurred.');
      setFoundResources({ courses: [], videos: [], books: [], websites: [], exercises: [] });
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search can be re-added if auto-search on type is desired.
  // For now, using explicit search button.
  // const debouncedSearch = useCallback(debounce(handleSearch, 800), []);
  // useEffect(() => {
  //   if (searchQuery.trim()) {
  //     debouncedSearch(searchQuery);
  //   } else {
  //     setFoundResources(null); // Clear results if search query is empty
  //     setSearchError(null);
  //   }
  // }, [searchQuery, debouncedSearch]);
  
  const onSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  const FetchedResourceCard = ({ resource, type }) => {
    const getFetchedResourceIcon = () => {
      switch (type) {
        case 'videos': return <PlayCircleIcon className="w-7 h-7 text-red-400" />;
        case 'books': return <BookOpenIcon className="w-7 h-7 text-green-400" />;
        case 'websites': return <LinkIcon className="w-7 h-7 text-sky-400" />;
        case 'courses': return <AcademicCapIcon className="w-7 h-7 text-purple-400" />;
        case 'exercises': return <LightBulbIcon className="w-7 h-7 text-amber-400" />;
        default: return <LinkIcon className="w-7 h-7 text-gray-400" />;
      }
    };

    return (
      <div className="bg-gray-800 rounded-xl border border-gray-700/70 p-5 flex flex-col h-full
                      hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-600/10 
                      transition-all duration-300 ease-in-out transform hover:-translate-y-1">
        <div className="flex items-start gap-4 mb-3">
          <div className="p-2 bg-gray-700/60 rounded-lg mt-1 shrink-0">
            {getFetchedResourceIcon()}
          </div>
          <div className="flex-1">
            <h3 className="text-md font-semibold text-gray-100 mb-1 leading-tight">{resource.title}</h3>
            {resource.channel && <p className="text-xs text-indigo-300 mb-1">Channel: {resource.channel}</p>}
            {resource.author && <p className="text-xs text-teal-300 mb-1">Author: {resource.author}</p>}
          </div>
        </div>
        {resource.description && (
          <p className="text-gray-400 text-sm mb-3 flex-grow min-h-[40px] line-clamp-3">{resource.description}</p>
        )}
        <div className="mt-auto">
          {resource.duration && <p className="text-xs text-gray-500 mb-2">Duration: {resource.duration}</p>}
          <a
            href={resource.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 font-medium
                       bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 rounded-md transition-colors"
          >
            <LinkIcon className="w-4 h-4" />
            <span>Visit Resource</span>
          </a>
        </div>
      </div>
    );
  };

  const SkeletonResourceCard = () => (
    <div className="bg-gray-800 rounded-xl border border-gray-700/70 p-5 animate-pulse">
      <div className="flex items-start gap-4 mb-3">
        <div className="p-2 bg-gray-700/60 rounded-lg mt-1 w-11 h-11"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          <div className="h-3 bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-700 rounded w-full"></div>
        <div className="h-3 bg-gray-700 rounded w-full"></div>
        <div className="h-3 bg-gray-700 rounded w-5/6"></div>
      </div>
      <div className="mt-4 h-8 bg-gray-700 rounded w-1/3"></div>
    </div>
  );
  
  const categoryTitles = {
    courses: "Online Courses & Tutorials",
    videos: "YouTube Videos & Screencasts",
    books: "Books & E-books",
    websites: "Documentation & Websites",
    exercises: "Practice Exercises & Worksheets"
  };

  return (
    <div className="min-h-screen bg-gray-900 flex text-gray-200">
      {/* Sidebar - using previously enhanced style, adapt as needed */}
       <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-gray-800/95 backdrop-blur-md border-r border-gray-700/50 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } z-50 flex flex-col shadow-2xl`}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 relative">
            <div className="absolute w-36 h-36 bg-indigo-600/10 rounded-full -top-12 -right-12 blur-2xl opacity-50" />
            <div className="absolute w-48 h-48 bg-purple-600/10 rounded-full -bottom-20 -left-16 blur-2xl opacity-50" />
            <div className="flex items-center gap-3 mb-8 relative">
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="absolute -right-2 top-1/2 -translate-y-1/2 p-1.5 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
              >
                <ChevronLeftIcon className="w-5 h-5 text-gray-400 hover:text-gray-200" />
              </button>
              <ClipboardDocumentIcon className="w-8 h-8 text-indigo-400 animate-pulse" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent [text-shadow:0_0_8px_theme(colors.indigo.500_/_0.4)]">
                SPARK-IQ
              </h1>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-4 styled-scrollbar">
            <nav>
              <ul className="space-y-1.5">
                {[
                  { title: 'Dashboard', link: '/dashboard', Icon: ChartBarIcon },
                  { title: 'Assignments', link: '/assignment-submission', Icon: DocumentTextIcon },
                  { title: 'Tests', Icon: ClipboardDocumentIcon, link: '/student-tests' },
                  { title: 'Resources', link: '/resource-utilization', Icon: FolderIcon, active: true },
                  { title: 'Attendance', Icon: CheckCircleIcon, link: '/attendance-monitoring' },
                  { title: 'Grades & Feedback', Icon: PresentationChartLineIcon, link: '/GradesAndFeedback' },
                  { title: 'Voice Chat', Icon: ChatBubbleLeftRightIcon, link: '/voice-chat' },
                  { title: 'Ask Sparky', Icon: SparklesIcon, link: '/chatbot-access' },
                  { title: 'AI Questions', Icon: SparklesIcon, link: '/ai-generated-questions' },
                  { title: 'News Feed', Icon: UsersIcon, link: '/educational-news' },
                  { title: 'Smart Review', Icon: DocumentMagnifyingGlassIcon, link: '/smart-review' },
                  { title: 'Meetings', Icon: VideoCameraIcon, link: '/meeting-participation' },
                  { title: 'Inbox', Icon: EnvelopeIcon, link: '/inbox-for-suggestions' },
                ].map((item) => (
                  <li key={item.title}>
                    <Link
                      to={item.link}
                      className={`flex items-center gap-x-3.5 px-3.5 py-2.5 rounded-lg transition-all duration-200 group hover:bg-gray-700/70 ${
                        item.active 
                          ? 'bg-indigo-500/15 text-indigo-300 border-l-4 border-indigo-400 font-semibold shadow-inner shadow-indigo-500/10' 
                          : 'text-gray-400 hover:text-gray-100 hover:translate-x-1'
                      }`}
                    >
                      <item.Icon className={`w-5 h-5 flex-shrink-0 ${item.active ? 'text-indigo-400' : 'text-gray-500 group-hover:text-indigo-400 transition-colors'}`} />
                      <span className="text-sm">{item.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </aside>


      {/* Main Content */}
      <main
        className={`flex-1 p-6 sm:p-8 overflow-y-auto relative transition-margin duration-300 ease-in-out ${
          isSidebarOpen ? 'ml-64' : 'ml-0'
        }`}
      >
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="fixed left-4 top-4 z-40 p-2 bg-gray-800/80 backdrop-blur-sm rounded-lg hover:bg-gray-700 transition-colors shadow-lg"
          >
            <Bars3Icon className="w-6 h-6 text-gray-300" />
          </button>
        )}

        <header className="mb-8 sm:mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-100 mb-2 [text-shadow:0_0_12px_theme(colors.purple.500_/_0.3)]">
            <span className="bg-gradient-to-r from-purple-400 via-indigo-400 to-sky-400 bg-clip-text text-transparent">
              Smart Resource Finder
            </span>
          </h2>
          <p className="text-gray-400 text-base sm:text-lg">
            Discover curated learning materials from across the web, powered by AI.
          </p>
        </header>

        <form onSubmit={onSearchSubmit} className="mb-8 sm:mb-10">
          <div className="relative max-w-3xl mx-auto flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="e.g., Quantum Physics, Machine Learning with Python..."
                className="w-full pl-12 pr-4 py-3.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 
                           focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className="px-5 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-500/50 disabled:cursor-not-allowed 
                         text-white font-semibold rounded-lg transition-colors duration-200 ease-in-out
                         flex items-center justify-center gap-2 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              {isSearching ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <PaperAirplaneIcon className="w-5 h-5 transform -rotate-45" />
              )}
              <span>{isSearching ? 'Searching...' : 'Find Resources'}</span>
            </button>
          </div>
        </form>

        {/* Search Results Section */}
        <div className="mb-12">
          {isSearching && (
            <div>
              <h3 className="text-2xl font-semibold text-gray-100 mb-3 sm:mb-4">Searching for "{submittedQuery}"...</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
                {[...Array(6)].map((_, i) => <SkeletonResourceCard key={i} />)}
              </div>
            </div>
          )}

          {!isSearching && searchError && (
            <div className="max-w-2xl mx-auto p-6 bg-red-500/10 border border-red-500/30 rounded-lg text-center">
              <ExclamationTriangleIcon className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-red-300 mb-2">Search Failed</h3>
              <p className="text-red-400 text-sm">{searchError}</p>
              <p className="text-gray-500 text-xs mt-2">Please check your query or API key configuration and try again.</p>
            </div>
          )}

          {!isSearching && !searchError && foundResources && (
            Object.values(foundResources).every(arr => arr.length === 0) ? (
              <div className="max-w-2xl mx-auto p-6 bg-gray-800/70 border border-gray-700 rounded-lg text-center">
                <DocumentMagnifyingGlassIcon className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No Resources Found</h3>
                <p className="text-gray-400 text-sm">We couldn't find any resources for "{submittedQuery}". Try a different or broader topic.</p>
              </div>
            ) : (
              <div className="space-y-8 sm:space-y-10">
                {Object.entries(foundResources).map(([category, resources]) => (
                  (resources && resources.length > 0) && (
                    <div key={category}>
                      <h3 className="text-2xl font-semibold text-gray-100 mb-3 sm:mb-4 capitalize [text-shadow:0_0_8px_theme(colors.indigo.500_/_0.2)]">
                        {categoryTitles[category] || category}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
                        {resources.map((resource, index) => (
                          <FetchedResourceCard key={`${category}-${index}-${resource.link}`} resource={resource} type={category} />
                        ))}
                      </div>
                    </div>
                  )
                ))}
              </div>
            )
          )}

          {!isSearching && !foundResources && !searchError && (
             <div className="max-w-2xl mx-auto p-6 text-center">
                <InformationCircleIcon className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">Ready to Explore?</h3>
                <p className="text-gray-400 text-sm">Enter a topic above to find relevant learning resources.</p>
              </div>
          )}
        </div>


        {/* Local Resources */}
        <div className="mt-12 sm:mt-16">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8">
            <h3 className="text-2xl sm:text-3xl font-semibold text-gray-100 flex items-center gap-3 mb-3 sm:mb-0 [text-shadow:0_0_8px_theme(colors.amber.500_/_0.2)]">
              <FolderIcon className="w-7 h-7 sm:w-8 sm:h-8 text-amber-400" />
              Your Uploaded Resources
            </h3>
            <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
              <PlusCircleIcon className="w-5 h-5" />
              <span>Upload New</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {localResources.map((resource) => (
              <div
                key={resource.id}
                className="bg-gray-800 p-5 rounded-xl border border-gray-700/70 
                           hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-600/10 
                           transition-all duration-300 ease-in-out group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-700/60 rounded-md">
                        {getLocalResourceIcon(resource.type)}
                    </div>
                    <h4 className="text-md font-semibold text-gray-100 group-hover:text-purple-300 transition-colors">{resource.name}</h4>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button className="p-1.5 text-gray-500 hover:text-sky-400 hover:bg-gray-700/50 rounded-md transition-colors">
                      <ShareIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-gray-700/50 rounded-md transition-colors">
                      <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>

                {resource.type === 'folder' ? (
                  <div className="space-y-2.5 pl-1 max-h-48 overflow-y-auto styled-scrollbar-thin pr-1">
                    {resource.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2.5 p-2.5 bg-gray-700/40 rounded-lg hover:bg-gray-700/70 transition-colors cursor-pointer"
                      >
                        <div className="shrink-0">{getLocalResourceIcon(item.type)}</div>
                        <span className="text-gray-300 text-sm truncate" title={item.name}>{item.name}</span>
                        <span className="text-xs text-gray-500 ml-auto shrink-0">{item.uploaded}</span>
                      </div>
                    ))}
                     {resource.items.length === 0 && <p className="text-xs text-gray-500 p-2">This folder is empty.</p>}
                  </div>
                ) : (
                  <div className="text-sm text-gray-400">
                    <p>Uploaded: <span className="text-gray-300">{resource.uploaded}</span></p>
                    <p className="mt-1">Type: <span className="text-gray-300">{resource.type.toUpperCase()}</span></p>
                    <button className="w-full mt-4 py-2 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 hover:text-indigo-200 rounded-lg transition-colors text-sm font-medium">
                      Download
                    </button>
                  </div>
                )}
              </div>
            ))}
             {localResources.length === 0 && (
                <div className="md:col-span-2 lg:col-span-3 text-center py-10">
                    <FolderIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No local resources yet.</p>
                    <p className="text-gray-600 text-sm">Click "Upload New" to add your files and folders.</p>
                </div>
             )}
          </div>
        </div>

        <footer className="mt-12 sm:mt-16 pt-8 border-t border-gray-700/50 text-center text-sm text-gray-500">
            Spark-IQ Smart Resource Finder © {new Date().getFullYear()}
        </footer>
      </main>
      
      <style jsx global>{`
        .styled-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .styled-scrollbar::-webkit-scrollbar-track {
          background: rgba(55, 65, 81, 0.5); /* gray-700 with opacity */
          border-radius: 10px;
        }
        .styled-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(107, 114, 128, 0.7); /* gray-500 with opacity */
          border-radius: 10px;
        }
        .styled-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.9); /* gray-400 with opacity */
        }
        .styled-scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .styled-scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(107, 114, 128, 0.5);
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;  
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

// Make sure CheckCircleIcon is imported if used in sidebar
import { CheckCircleIcon } from '@heroicons/react/24/outline';

export default ResourceUtilization;