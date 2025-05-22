import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderIcon,
  DocumentMagnifyingGlassIcon,
  BookOpenIcon,
  VideoCameraIcon,
  TrashIcon,
  ShareIcon,
  PlusCircleIcon,
  ArrowsPointingOutIcon,
  ChevronLeftIcon,
  Bars3Icon,
  ClipboardDocumentIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ArrowUpTrayIcon,
  MagnifyingGlassIcon,
  LinkIcon,
  PlayIcon,
  DocumentIcon,
} from '@heroicons/react/24/outline';

// Function to call Gemini API
const fetchResourcesFromLLM = async (query) => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.error('Gemini API key is missing');
      throw new Error('API key not found');
    }

    console.log('Using API Key:', apiKey.substring(0, 5) + '...'); // Log first 5 chars for debugging

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Find educational resources for learning about "${query}". Include:
            1. Online courses and tutorials
            2. YouTube videos
            3. Books and e-books
            4. Documentation and websites
            5. Practice exercises and worksheets
            
            Format the response as a JSON object with these categories:
            {
              "courses": [{ "title": "", "link": "", "description": "" }],
              "videos": [{ "title": "", "channel": "", "link": "", "duration": "" }],
              "books": [{ "title": "", "author": "", "link": "", "description": "" }],
              "websites": [{ "title": "", "link": "", "description": "" }],
              "exercises": [{ "title": "", "link": "", "description": "" }]
            }`
          }]
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('API Error Response:', errorData);
      throw new Error(`HTTP error! status: ${response.status} - ${errorData?.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('Gemini API Response:', data); // Debug log

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response format from Gemini API');
    }

    const responseText = data.candidates[0].content.parts[0].text;
    console.log('Response Text:', responseText); // Debug log

    try {
      const resources = JSON.parse(responseText);
      console.log('Parsed Resources:', resources); // Debug log
      return resources;
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      // If JSON parsing fails, try to extract JSON from the text
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const resources = JSON.parse(jsonMatch[0]);
          console.log('Extracted Resources:', resources); // Debug log
          return resources;
        } catch (extractError) {
          console.error('Error parsing extracted JSON:', extractError);
          throw new Error('Failed to parse resource data');
        }
      }
      throw new Error('No valid JSON found in response');
    }
  } catch (error) {
    console.error('Error fetching resources:', error);
    // Return a default structure with empty arrays
    return {
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
  const [isSearching, setIsSearching] = useState(false);
  const [foundResources, setFoundResources] = useState(null);
  const [localResources, setLocalResources] = useState([
    {
      id: 1,
      name: 'Math Basics',
      type: 'folder',
      items: [
        { id: 11, name: 'Algebra Notes.pdf', type: 'pdf', uploaded: '2024-03-01' },
        { id: 12, name: 'Geometry Video.mp4', type: 'video', uploaded: '2024-03-02' },
      ],
    },
    {
      id: 2,
      name: 'Science Experiments',
      type: 'folder',
      items: [
        { id: 21, name: 'Chemistry Lab.zip', type: 'zip', uploaded: '2024-03-03' },
      ],
    },
  ]);

  const getIcon = (type) => {
    switch (type) {
      case 'pdf':
        return <DocumentMagnifyingGlassIcon className="w-6 h-6 text-red-400" />;
      case 'video':
        return <VideoCameraIcon className="w-6 h-6 text-blue-400" />;
      case 'zip':
        return <ArrowsPointingOutIcon className="w-6 h-6 text-purple-400" />;
      case 'folder':
        return <FolderIcon className="w-6 h-6 text-amber-400" />;
      case 'book':
        return <BookOpenIcon className="w-6 h-6 text-green-400" />;
      case 'website':
        return <LinkIcon className="w-6 h-6 text-indigo-400" />;
      default:
        return <BookOpenIcon className="w-6 h-6 text-gray-400" />;
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const resources = await fetchResourcesFromLLM(searchQuery);
      setFoundResources(resources);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch();
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Update the ResourceCard component to handle different resource types
  const ResourceCard = ({ resource, type }) => {
    const getResourceIcon = () => {
      switch (type) {
        case 'videos':
          return <PlayIcon className="w-6 h-6 text-red-400" />;
        case 'books':
          return <BookOpenIcon className="w-6 h-6 text-green-400" />;
        case 'websites':
          return <LinkIcon className="w-6 h-6 text-blue-400" />;
        case 'courses':
          return <DocumentIcon className="w-6 h-6 text-purple-400" />;
        case 'exercises':
          return <DocumentMagnifyingGlassIcon className="w-6 h-6 text-amber-400" />;
        default:
          return <LinkIcon className="w-6 h-6 text-gray-400" />;
      }
    };

    return (
      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4 hover:shadow-xl transition-all">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-gray-700/50 rounded-lg">
            {getResourceIcon()}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">{resource.title}</h3>
            {resource.description && (
              <p className="text-gray-400 text-sm mb-3">{resource.description}</p>
            )}
            {resource.channel && (
              <p className="text-gray-400 text-sm mb-2">Channel: {resource.channel}</p>
            )}
            {resource.duration && (
              <p className="text-gray-400 text-sm mb-2">Duration: {resource.duration}</p>
            )}
            {resource.author && (
              <p className="text-gray-400 text-sm mb-2">Author: {resource.author}</p>
            )}
            <a
              href={resource.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <LinkIcon className="w-4 h-4" />
              <span>Visit Resource</span>
            </a>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Collapsible Sidebar (unchanged) */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-gray-800 border-r border-gray-700/50 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } z-50 flex flex-col`}
      >
        {/* Sidebar Content */}
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="p-6 relative">
            <div className="absolute w-32 h-32 bg-indigo-500/10 rounded-full -top-16 -right-16" />
            <div className="absolute w-48 h-48 bg-purple-500/10 rounded-full -bottom-24 -left-24" />
            <div className="flex items-center gap-3 mb-8 relative">
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="absolute -right-3 top-0 p-1.5 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
              >
                <ChevronLeftIcon className="w-5 h-5 text-gray-400" />
              </button>
              <ClipboardDocumentIcon className="w-8 h-8 text-indigo-400 animate-pulse" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                SPARK-IQ
              </h1>
            </div>
          </div>

          {/* Scrollable Menu */}
          <div className="flex-1 overflow-y-auto px-6 pb-4">
            <nav>
              <ul className="space-y-1">
                {[
                  { title: 'Dashboard', link: '/dashboard', Icon: ClipboardDocumentIcon },
                  { title: 'Assignments', link: '/assignment-submission', Icon: DocumentTextIcon },
                  { title: 'Grades', link: '/grading-access', Icon: ChartBarIcon },
                  { title: 'Resources', link: '/resource-utilization', Icon: FolderIcon },
                ].map((item, index) => (
                  <li key={index}>
                    <Link
                      to={item.link}
                      className="flex items-center gap-3 p-3 text-gray-300 hover:bg-gray-700/50 rounded-lg transition-all duration-300 group hover:translate-x-1"
                    >
                      <item.Icon className="w-5 h-5 text-indigo-400 group-hover:text-purple-400 transition-colors" />
                      <span>{item.title}</span>
                      <ArrowUpTrayIcon className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
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
        className={`flex-1 p-8 overflow-y-auto relative transition-margin duration-300 ${
          isSidebarOpen ? 'ml-64' : 'ml-0'
        }`}
      >
        {/* Toggle Button */}
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="fixed left-4 top-4 z-40 p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Bars3Icon className="w-6 h-6 text-gray-400" />
          </button>
        )}

        {/* Header */}
        <header className="mb-8">
          <h2 className="text-4xl font-bold text-white mb-3">
            <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Smart Resource Finder
            </span>
          </h2>
          <p className="text-gray-400 text-lg">
            Discover the best learning resources from across the web
          </p>
        </header>

        {/* Search Section */}
        <div className="mb-8">
          <div className="relative max-w-2xl flex gap-2">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Enter topic to search (e.g. Linear Algebra, Python Programming)"
                className="w-full pl-10 pr-4 py-3 bg-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
              {isSearching && (
                <div className="absolute right-3 top-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-400"></div>
                </div>
              )}
            </div>
            <button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <span>Search</span>
              <ArrowUpTrayIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Results */}
        {foundResources && (
          <div className="space-y-8">
            {Object.entries(foundResources).map(([category, resources]) => (
              resources.length > 0 && (
                <div key={category}>
                  <h3 className="text-xl font-semibold text-white mb-4 capitalize">
                    {category}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {resources.map((resource, index) => (
                      <ResourceCard
                        key={`${category}-${index}`}
                        resource={resource}
                        type={category}
                      />
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        )}

        {/* Local Resources */}
        <div className="mt-12">
          <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
            <FolderIcon className="w-6 h-6 text-amber-400" />
            Your Local Resources
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {localResources.map((resource) => (
              <div
                key={resource.id}
                className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 hover:border-purple-400/30 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getIcon(resource.type)}
                    <h3 className="text-lg font-semibold text-white">{resource.name}</h3>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-gray-700/50 rounded-lg">
                      <ShareIcon className="w-5 h-5 text-gray-400" />
                    </button>
                    <button className="p-2 hover:bg-gray-700/50 rounded-lg">
                      <TrashIcon className="w-5 h-5 text-red-400" />
                    </button>
                  </div>
                </div>

                {resource.type === 'folder' ? (
                  <div className="space-y-2">
                    {resource.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 bg-gray-900/30 rounded-lg"
                      >
                        {getIcon(item.type)}
                        <span className="text-gray-300 text-sm">{item.name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-400">
                    <p>Uploaded: {resource.uploaded}</p>
                    <p className="mt-2">Type: {resource.type}</p>
                    <button className="w-full mt-4 py-2 bg-indigo-500/20 text-indigo-400 rounded-lg hover:bg-indigo-500/30 transition-colors">
                      Download
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResourceUtilization;