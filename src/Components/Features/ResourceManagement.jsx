import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderIcon,
  DocumentIcon,
  VideoCameraIcon,
  LinkIcon,
  ChartBarIcon,
  CloudArrowUpIcon,
  TagIcon,
  ArrowsPointingOutIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  ShareIcon,
  BookOpenIcon,
  ClockIcon,
  UserGroupIcon,
  SignalIcon,
  ClipboardDocumentIcon,
  AcademicCapIcon,
  ChatBubbleLeftRightIcon,
  LightBulbIcon,
  SparklesIcon,
  EnvelopeIcon,
  MegaphoneIcon,
  XMarkIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

const ResourceManagement = () => {
  const [resources, setResources] = useState([
    {
      id: 1,
      title: 'Introduction to Quantum Physics',
      type: 'video',
      category: 'Science',
      views: 1450,
      shares: 45,
      uploaded: '2023-10-15',
      thumbnail: 'https://example.com/quantum-thumb.jpg',
      size: '2.4 GB',
      tags: ['Physics', 'Advanced', 'Video Lecture']
    },
    {
      id: 2,
      title: 'Python Data Analysis Guide',
      type: 'document',
      category: 'Computer Science',
      views: 890,
      shares: 32,
      uploaded: '2023-11-01',
      thumbnail: 'https://example.com/python-guide.jpg',
      size: '15 MB',
      tags: ['Programming', 'Data Science', 'PDF']
    },
  ]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isGridView, setIsGridView] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const educatorMenu = [
    { title: 'Dashboard', Icon: ClipboardDocumentIcon, link: '/educator-dashboard' },
    { title: 'Grading System', Icon: AcademicCapIcon, link: '/grading-system' },
    { title: 'Attendance Tracking', Icon: ChartBarIcon, link: '/attendance-tracking' },
    { title: 'Chatbot Interaction', Icon: ChatBubbleLeftRightIcon, link: '/chatbot-interaction' },
    { title: 'Feedback Provision', Icon: LightBulbIcon, link: '/feedback-provision' },
    { title: 'Question Generation', Icon: SparklesIcon, link: '/question-generation' },
    { title: 'Suggestions to Students', Icon: EnvelopeIcon, link: '/suggestions-to-students' },
    { title: 'Meeting Hosting', Icon: VideoCameraIcon, link: '/meeting-hosting' },
    { title: 'Collaboration', Icon: UserGroupIcon, link: '/collaboration' },
    { title: 'Announcements', Icon: MegaphoneIcon, link: '/announcements' },
  ];

  // Analytics Data
  const categoryData = [
    { name: 'Science', value: 45 },
    { name: 'Math', value: 30 },
    { name: 'Literature', value: 25 },
    { name: 'History', value: 15 },
  ];

  const usageData = [
    { day: 'Mon', views: 400 },
    { day: 'Tue', views: 600 },
    { day: 'Wed', views: 300 },
    { day: 'Thu', views: 800 },
    { day: 'Fri', views: 500 },
  ];

  const COLORS = ['#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8'];

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setShowUploadModal(true);
    }
  };

  const simulateUpload = (file) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 300);

    // In a real app, you would upload to a server here
    return new Promise(resolve => {
      setTimeout(() => {
        clearInterval(interval);
        resolve();
      }, 3000);
    });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const title = formData.get('title');
    const category = formData.get('category');
    const file = formData.get('file');
    
    await simulateUpload(file);
    
    const newResource = {
      id: resources.length + 1,
      title: title || file.name,
      type: file.type.split('/')[0] === 'video' ? 'video' : 'document',
      category,
      views: 0,
      shares: 0,
      uploaded: new Date().toISOString().split('T')[0],
      thumbnail: URL.createObjectURL(file),
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      tags: [category, file.type.split('/')[1] || 'Document']
    };
    
    setResources([newResource, ...resources]);
    setShowUploadModal(false);
    setUploadProgress(0);
  };

  const ResourceCard = ({ resource }) => (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4 hover:shadow-xl transition-all"
    >
      <div className="relative group">
        <div className="h-40 bg-gray-700 rounded-lg mb-4 overflow-hidden">
          {resource.type === 'video' ? (
            <video className="w-full h-full object-cover">
              <source src={resource.thumbnail} type="video/mp4" />
            </video>
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-600/20 to-purple-600/20">
              <DocumentIcon className="w-16 h-16 text-blue-400" />
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-start mb-2">
          <h4 className="text-lg font-semibold text-white truncate">{resource.title}</h4>
          <div className="flex gap-2">
            <button className="p-1.5 hover:bg-gray-700/50 rounded-lg">
              <ShareIcon className="w-5 h-5 text-purple-400" />
            </button>
            <button className="p-1.5 hover:bg-gray-700/50 rounded-lg">
              <EllipsisVerticalIcon className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {resource.tags.map((tag, index) => (
            <span 
              key={index}
              className="px-2 py-1 text-xs bg-gray-700/50 rounded-full text-blue-300"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-400">
            <ClockIcon className="w-4 h-4" />
            {resource.uploaded}
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <SignalIcon className="w-4 h-4" />
            {resource.views} views
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <UserGroupIcon className="w-4 h-4" />
            {resource.shares} shares
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <BookOpenIcon className="w-4 h-4" />
            {resource.category}
          </div>
        </div>
      </div>
    </motion.div>
  );

  const UploadModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-8 w-full max-w-2xl relative">
        <button
          onClick={() => setShowUploadModal(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
        
        <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
          Upload New Resource
        </h3>
        
        <form onSubmit={handleUpload} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-gray-300">Resource Title</label>
              <input
                type="text"
                name="title"
                className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-cyan-500 outline-none"
                placeholder="Enter a descriptive title"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-gray-300">Category</label>
              <select
                name="category"
                className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-cyan-500 outline-none"
              >
                <option>Science</option>
                <option>Mathematics</option>
                <option>Literature</option>
                <option>History</option>
                <option>Computer Science</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-gray-300">File</label>
            <input
              type="file"
              name="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
              required
            />
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-lg p-8 hover:border-cyan-400 transition-colors cursor-pointer"
            >
              <CloudArrowUpIcon className="w-12 h-12 text-cyan-400 mb-4" />
              <p className="text-gray-300 mb-1">Click to browse or drag and drop</p>
              <p className="text-gray-500 text-sm">Supports videos, PDFs, presentations (max 500MB)</p>
            </label>
          </div>

          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-gray-400 text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full">
                <div
                  className="h-full bg-cyan-500 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={() => setShowUploadModal(false)}
              className="px-6 py-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-green-500 to-cyan-500 hover:opacity-90 transition-all flex items-center gap-2"
              disabled={isUploading}
            >
              {isUploading ? (
                'Uploading...'
              ) : (
                <>
                  <CloudArrowUpIcon className="w-5 h-5" />
                  Upload Resource
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-gray-800 border-r border-gray-700/50 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } z-50 flex flex-col`}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              SPARK IQ
            </h1>
          </div>
          <nav>
            <ul className="space-y-2">
              {educatorMenu.map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.link}
                    className="flex items-center gap-3 p-3 text-gray-300 hover:bg-gray-700/50 rounded-lg transition-all duration-300 group"
                  >
                    <item.Icon className="w-5 h-5 text-indigo-400 group-hover:text-purple-400 transition-colors" />
                    <span>{item.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 p-8 overflow-y-auto relative transition-margin duration-300 ${
        isSidebarOpen ? 'ml-64' : 'ml-0'
      }`}>
        {/* Header Section */}
        <header className="mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                <span className="bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
                  Knowledge Vault
                </span>
              </h1>
              <p className="text-gray-400 text-lg">
                Manage educational resources, track engagement, and collaborate with peers
              </p>
            </div>
            <button 
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-cyan-500 hover:opacity-90 rounded-lg transition-all"
            >
              <CloudArrowUpIcon className="w-5 h-5" />
              Upload Resource
            </button>
          </div>
        </header>

        {/* Stats & Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Stats Cards */}
          {[
            { title: 'Total Resources', value: '2.1K', icon: FolderIcon, trend: '↑12%' },
            { title: 'Storage Used', value: '84 GB', icon: CloudArrowUpIcon, trend: '↑3.2%' },
            { title: 'Active Shares', value: '345', icon: ShareIcon, trend: '↑8%' },
            { title: 'Weekly Views', value: '12.4K', icon: EyeIcon, trend: '↓2.1%' },
          ].map((stat, index) => (
            <div key={index} className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                  <span className="text-xs text-green-400">{stat.trend}</span>
                </div>
                <stat.icon className="w-12 h-12 p-2.5 text-cyan-400 bg-cyan-500/20 rounded-xl" />
              </div>
            </div>
          ))}
        </div>

        {/* Control Bar */}
        <div className="flex flex-wrap gap-4 mb-8 items-center bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
          <div className="flex items-center gap-2 flex-1">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search resources..."
              className="bg-transparent outline-none w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-4">
            <select 
              className="bg-gray-700 rounded-lg px-4 py-2"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option>All Categories</option>
              <option>Science</option>
              <option>Mathematics</option>
              <option>Literature</option>
            </select>
            
            <button 
              onClick={() => setIsGridView(!isGridView)}
              className="p-2 hover:bg-gray-700/50 rounded-lg"
            >
              {isGridView ? (
                <ArrowsPointingOutIcon className="w-5 h-5" />
              ) : (
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded" />
                  <div className="w-2 h-2 bg-gray-400 rounded" />
                  <div className="w-2 h-2 bg-gray-400 rounded" />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Resource Grid */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {resources.map(resource => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          </div>

          {/* Analytics Sidebar */}
          <div className="space-y-8">
            {/* Category Distribution */}
            <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <TagIcon className="w-6 h-6 text-cyan-400" />
                Resource Categories
              </h3>
              <div className="flex items-center justify-center">
                <PieChart width={240} height={240}>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </div>
            </div>

            {/* Usage Trends */}
            <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <ChartBarIcon className="w-6 h-6 text-green-400" />
                Weekly Engagement
              </h3>
              <BarChart width={300} height={200} data={usageData}>
                <XAxis dataKey="day" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
                  itemStyle={{ color: '#e5e7eb' }}
                />
                <Bar 
                  dataKey="views" 
                  fill="#34d399" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </div>
          </div>
        </div>
      </main>

      {showUploadModal && <UploadModal />}
    </div>
  );
};

export default ResourceManagement;