import { useState } from 'react';
import { Link } from 'react-router-dom'; // Corrected import
import {
  FolderIcon,
  DocumentArrowUpIcon,
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
} from '@heroicons/react/24/outline';

const ResourceUtilization = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [resources, setResources] = useState([
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
  const [newResource, setNewResource] = useState({
    name: '',
    description: '',
    type: 'document',
    file: null,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewResource({ ...newResource, file });
    }
  };

  const createNewFolder = () => {
    const folder = {
      id: resources.length + 1,
      name: newResource.name || 'New Folder',
      type: 'folder',
      items: [],
    };
    setResources([folder, ...resources]);
    setNewResource({ name: '', description: '', type: 'document', file: null });
  };

  const uploadResource = () => {
    if (newResource.file) {
      const resource = {
        id: Date.now(),
        name: newResource.name || newResource.file.name,
        type: newResource.type,
        uploaded: new Date().toISOString().split('T')[0],
        file: newResource.file.name,
      };
      setResources([resource, ...resources]);
      setNewResource({ name: '', description: '', type: 'document', file: null });
    }
  };

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
      default:
        return <BookOpenIcon className="w-6 h-6 text-green-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Collapsible Sidebar */}
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
              Resource Hub
            </span>
          </h2>
          <p className="text-gray-400 text-lg">
            Share and organize educational materials with your students
          </p>
        </header>

        {/* Upload Section */}
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <DocumentArrowUpIcon className="w-7 h-7 text-purple-400" />
            <h3 className="text-xl font-semibold text-white">Upload New Resource</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Resource Title"
                className="w-full p-3 bg-gray-700/50 rounded-lg text-white placeholder-gray-400"
                value={newResource.name}
                onChange={(e) => setNewResource({ ...newResource, name: e.target.value })}
              />
              <textarea
                placeholder="Description"
                className="w-full p-3 bg-gray-700/50 rounded-lg text-white placeholder-gray-400"
                rows="3"
                value={newResource.description}
                onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
              />
              <select
                className="w-full p-3 bg-gray-700/50 rounded-lg text-white"
                value={newResource.type}
                onChange={(e) => setNewResource({ ...newResource, type: e.target.value })}
              >
                <option value="document">Document</option>
                <option value="video">Video</option>
                <option value="presentation">Presentation</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-lg p-6">
              <label className="flex flex-col items-center justify-center cursor-pointer">
                <ArrowUpTrayIcon className="w-12 h-12 text-gray-400 mb-4" />
                <span className="text-gray-400 text-center">
                  {newResource.file ? newResource.file.name : 'Drag & Drop or Click to Upload'}
                </span>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={uploadResource}
              className="px-6 py-3 bg-purple-500/90 rounded-xl text-white hover:bg-purple-600 transition-colors flex items-center gap-2"
            >
              <PlusCircleIcon className="w-5 h-5" />
              Upload Resource
            </button>
            <button
              onClick={createNewFolder}
              className="px-6 py-3 bg-indigo-500/90 rounded-xl text-white hover:bg-indigo-600 transition-colors flex items-center gap-2"
            >
              <FolderIcon className="w-5 h-5" />
              Create New Folder
            </button>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search resources..."
              className="w-full pl-10 pr-4 py-2 bg-gray-700/50 rounded-lg text-white placeholder-gray-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="bg-gray-700/50 rounded-lg px-4 py-2 text-white"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="document">Documents</option>
            <option value="video">Videos</option>
            <option value="folder">Folders</option>
          </select>
        </div>

        {/* Resource Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => (
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
                  <button className="w-full mt-3 p-2 text-gray-400 hover:text-purple-400 flex items-center gap-2">
                    <PlusCircleIcon className="w-5 h-5" />
                    Add to Folder
                  </button>
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
      </main>
    </div>
  );
};

export default ResourceUtilization;