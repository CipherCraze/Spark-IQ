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
} from '@heroicons/react/24/outline';

// Mock function to simulate LLM API call
const fetchResourcesFromLLM = async (query) => {
  // In a real app, you would call your backend API which uses an LLM
  // to find resources. Here's a mock implementation:
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockResources = {
        books: [
          {
            id: `book-${Date.now()}-1`,
            title: `Introduction to ${query}`,
            author: 'Expert Author',
            link: 'https://example.com/book1',
            type: 'book',
            description: `A comprehensive guide to ${query} covering all fundamental concepts.`
          },
          {
            id: `book-${Date.now()}-2`,
            title: `Advanced ${query} Techniques`,
            author: 'Professional Educator',
            link: 'https://example.com/book2',
            type: 'book',
            description: `Deep dive into advanced topics of ${query} with practical examples.`
          }
        ],
        videos: [
          {
            id: `video-${Date.now()}-1`,
            title: `${query} Crash Course`,
            channel: 'Education Channel',
            link: 'https://youtube.com/watch?v=123',
            type: 'video',
            duration: '15:30'
          },
          {
            id: `video-${Date.now()}-2`,
            title: `Mastering ${query}`,
            channel: 'Tech Tutorials',
            link: 'https://youtube.com/watch?v=456',
            type: 'video',
            duration: '45:20'
          }
        ],
        websites: [
          {
            id: `web-${Date.now()}-1`,
            title: `Official ${query} Documentation`,
            link: 'https://docs.example.com',
            type: 'website',
            description: `Official documentation and reference materials for ${query}.`
          }
        ]
      };
      resolve(mockResources);
    }, 1000);
  });
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
          <div className="relative max-w-2xl">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Enter topic to search (e.g. Linear Algebra, Python Programming)"
              className="w-full pl-10 pr-4 py-3 bg-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {isSearching && (
              <div className="absolute right-3 top-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-400"></div>
              </div>
            )}
          </div>
        </div>

        {/* Search Results */}
        {foundResources && (
          <div className="space-y-8">
            {/* Books Section */}
            {foundResources.books && foundResources.books.length > 0 && (
              <div>
                <h3 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                  <BookOpenIcon className="w-6 h-6 text-green-400" />
                  Recommended Books
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {foundResources.books.map((book) => (
                    <div key={book.id} className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 hover:border-green-400/30 transition-all">
                      <div className="flex items-start gap-4 mb-4">
                        {getIcon('book')}
                        <div>
                          <h4 className="text-lg font-semibold text-white">{book.title}</h4>
                          <p className="text-gray-400 text-sm">{book.author}</p>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm mb-4">{book.description}</p>
                      <a 
                        href={book.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-block px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                      >
                        View Book
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Videos Section */}
            {foundResources.videos && foundResources.videos.length > 0 && (
              <div>
                <h3 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                  <VideoCameraIcon className="w-6 h-6 text-blue-400" />
                  Video Tutorials
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {foundResources.videos.map((video) => (
                    <div key={video.id} className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 hover:border-blue-400/30 transition-all">
                      <div className="flex items-start gap-4 mb-4">
                        {getIcon('video')}
                        <div>
                          <h4 className="text-lg font-semibold text-white">{video.title}</h4>
                          <p className="text-gray-400 text-sm">{video.channel}</p>
                          <p className="text-gray-500 text-xs">{video.duration}</p>
                        </div>
                      </div>
                      <a 
                        href={video.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-block px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                      >
                        Watch Video
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Websites Section */}
            {foundResources.websites && foundResources.websites.length > 0 && (
              <div>
                <h3 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                  <LinkIcon className="w-6 h-6 text-indigo-400" />
                  Useful Websites
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {foundResources.websites.map((site) => (
                    <div key={site.id} className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 hover:border-indigo-400/30 transition-all">
                      <div className="flex items-start gap-4 mb-4">
                        {getIcon('website')}
                        <div>
                          <h4 className="text-lg font-semibold text-white">{site.title}</h4>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm mb-4">{site.description}</p>
                      <a 
                        href={site.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-block px-4 py-2 bg-indigo-500/20 text-indigo-400 rounded-lg hover:bg-indigo-500/30 transition-colors"
                      >
                        Visit Site
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
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