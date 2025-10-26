import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Added useNavigate
import { useMediaQuery } from 'react-responsive'; // Added for responsiveness
import {
  FolderIcon,
  DocumentIcon,
  LinkIcon as LinkIconOutline, // Renamed to avoid conflict
  ChartBarIcon,
  CloudArrowUpIcon,
  VideoCameraIcon,
  TagIcon,
  ArrowsPointingOutIcon, // Kept for view toggle, if needed elsewhere
  MagnifyingGlassIcon,
  FunnelIcon, // Kept, might be useful for advanced filters
  EllipsisVerticalIcon,
  PresentationChartLineIcon,
  UserGroupIcon as SolidUserGroupIcon,
  EyeIcon,
  ShareIcon,
  UsersIcon, // Kept for stats
  GlobeAltIcon,
  DocumentTextIcon,
  BookOpenIcon,
  ClockIcon,
  UserGroupIcon, // Kept for stats/icons
  // SignalIcon, // Can be removed if not used, ChartBarIcon is often used for trends
  ClipboardDocumentIcon,
  AcademicCapIcon,
  ChatBubbleLeftRightIcon,
  LightBulbIcon,
  SparklesIcon,
  EnvelopeIcon,
  MegaphoneIcon,
  XMarkIcon,
  PlusIcon,
  ArrowUpTrayIcon, // Kept for LLM search button
  DocumentMagnifyingGlassIcon, // Kept for worksheet icon
  Bars3Icon,
  ChevronLeftIcon, // Added for sidebar
  Cog6ToothIcon, // Added for sidebar
  ArrowLeftOnRectangleIcon, // Added for sidebar
  PhotoIcon, // Added for image resource type
  ListBulletIcon, // Added for list view toggle
  Squares2X2Icon, // Added for grid view toggle
} from '@heroicons/react/24/outline';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,CartesianGrid  } from 'recharts';
import { motion } from 'framer-motion';


// getIconForLLM (renamed from getIcon for clarity)
const getIconForLLM = (type) => {
  switch (type) {
    case 'videos':
      return <VideoCameraIcon className="w-7 h-7 text-red-400" />;
    case 'books':
      return <BookOpenIcon className="w-7 h-7 text-green-400" />;
    case 'websites':
      return <LinkIconOutline className="w-7 h-7 text-blue-400" />;
    case 'lesson_plans':
      return <DocumentTextIcon className="w-7 h-7 text-purple-400" />;
    case 'worksheets':
      return <DocumentMagnifyingGlassIcon className="w-7 h-7 text-amber-400" />;
    case 'professional_dev':
      return <AcademicCapIcon className="w-7 h-7 text-indigo-400" />;
    default:
      return <DocumentIcon className="w-7 h-7 text-slate-400" />;
  }
};

const fetchResourcesFromLLM = async (query) => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.error('Gemini API key is missing');
      throw new Error('API key not found');
    }
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Find teaching resources for educators about "${query}". Include:
            1. Lesson plans and teaching guides[more than 5 resources]
            2. Educational videos and tutorials[more than 5 resources]
            3. Teaching books and e-books[more than 5 resources]
            4. Educational websites and platforms[more than 5 resources]
            5. Worksheets and assessment materials[more than 5 resources]
            6. Professional development resources[more than 5 resources]

            Return ONLY a JSON object with these categories, no markdown formatting:
            {
              "lesson_plans": [{ "title": "", "link": "", "description": "", "grade_level": "" }],
              "videos": [{ "title": "", "channel": "", "link": "", "duration": "", "grade_level": "" }],
              "books": [{ "title": "", "author": "", "link": "", "description": "", "grade_level": "" }],
              "websites": [{ "title": "", "link": "", "description": "", "grade_level": "" }],
              "worksheets": [{ "title": "", "link": "", "description": "", "grade_level": "" }],
              "professional_dev": [{ "title": "", "link": "", "description": "", "type": "" }]
            }`
          }]
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(`HTTP error! status: ${response.status} - ${errorData?.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    let responseText = data.candidates[0].content.parts[0].text;

    // --- FIX: Extract only the first JSON object from the response ---
    responseText = responseText.trim();
    // Remove Markdown code block markers if present
    if (responseText.startsWith('```')) {
      responseText = responseText.replace(/^```[a-zA-Z]*\n?/, '').replace(/```$/, '').trim();
    }
    // Extract the first {...} JSON object
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON object found in AI response.");
    responseText = jsonMatch[0];

    return JSON.parse(responseText);
  } catch (error) {
    console.error('Error fetching resources:', error);
    return {
      lesson_plans: [], videos: [], books: [], websites: [], worksheets: [], professional_dev: []
    };
  }
};

const ResourceManagement = () => {
  const isDesktop = useMediaQuery({ query: '(min-width: 1024px)' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(isDesktop); // Initial state based on desktop view
  const navigate = useNavigate();


  // Effect to handle sidebar state on resize, matching EducatorDashboard
  useEffect(() => {
      setIsSidebarOpen(isDesktop);
  }, [isDesktop]);


  const [resources, setResources] = useState([
    {
      id: 1,
      title: 'Introduction to Quantum Physics',
      type: 'video',
      category: 'Science',
      views: 1450,
      shares: 45,
      uploaded: '2023-10-15',
      thumbnail: 'https://images.unsplash.com/photo-1532187863486-abf9db50d0d6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cXVhbnR1bSUyMHBoeXNpY3N8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60',
      size: '2.4 GB',
      tags: ['Physics', 'Advanced', 'Video Lecture'],
      uploader: 'Dr. Emily Carter',
      lastModified: '2023-10-20',
    },
    {
      id: 2,
      title: 'Python Data Analysis Guide',
      type: 'document',
      category: 'Computer Science',
      views: 890,
      shares: 32,
      uploaded: '2023-11-01',
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZGF0YSUyMGFuYWx5c2lzfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
      size: '15 MB',
      tags: ['Programming', 'Data Science', 'PDF'],
      uploader: 'TechLearn Institute',
      lastModified: '2023-11-05',
    },
     {
      id: 3,
      title: 'Calculus Interactive Lessons',
      type: 'link',
      category: 'Mathematics',
      views: 2100,
      shares: 150,
      uploaded: '2023-09-01',
      thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2FsY3VsdXN8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60',
      size: 'N/A',
      tags: ['Calculus', 'Interactive', 'Online Course'],
      uploader: 'MathWorld Online',
      lastModified: '2023-09-10',
    },
  ]);

  const [isGridView, setIsGridView] = useState(true);
  const [searchUserResourcesQuery, setSearchUserResourcesQuery] = useState('');
  const [searchLLMQuery, setSearchLLMQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [isSearchingLLM, setIsSearchingLLM] = useState(false);
  const [foundLLMResources, setFoundLLMResources] = useState(null);

  const educatorMenu = [ // Using the same menu structure as EducatorDashboard
    { title: 'Dashboard', Icon: PresentationChartLineIcon, link: '/educator-dashboard' },
    { title: 'Assignments', Icon: ClipboardDocumentIcon, link: '/assignment-management' },
    { title: 'Tests', Icon: ClipboardDocumentIcon, link: '/teacher-tests' },
    { title: 'Grades & Analytics', Icon: AcademicCapIcon, link: '/GradesAndAnalytics' },
    { title: 'Resources', Icon: FolderIcon, link: '/resource-management', current: true }, // Current page
    { title: 'Attendance', Icon: ChartBarIcon, link: '/attendance-tracking' },
    { title: 'Teacher Insights', Icon: DocumentMagnifyingGlassIcon, link: '/personalized-feedback-educators' },
    { title: 'Voice Chat', Icon: ChatBubbleLeftRightIcon, link: '/teacher-voice-chat' },
    { title: 'AI Chatbot ( Ask Iko )', Icon: ChatBubbleLeftRightIcon, link: '/chatbot-education' },
    { title: 'AI Questions', Icon: SparklesIcon, link: '/ai-generated-questions-educator' },
    { title: 'Social / Chat', Icon: SolidUserGroupIcon, link: '/chat-functionality' },
    { title: 'Educational News', Icon: GlobeAltIcon, link: '/educational-news-educator' },
    { title: 'Student Suggestions', Icon: EnvelopeIcon, link: '/suggestions-to-students' },
    { title: 'Meetings & Conferences', Icon: VideoCameraIcon, link: '/meeting-host' },
    { title: 'Announcements', Icon: MegaphoneIcon, link: '/announcements' },
    { title: 'Upgrade to Pro', Icon: SparklesIcon, link: '/pricing', special: true },
  ];

  const categoryData = [
    { name: 'Science', value: 45, fill: '#8B5CF6' },
    { name: 'Math', value: 30, fill: '#3B82F6' },
    { name: 'Literature', value: 25, fill: '#10B981'},
    { name: 'History', value: 15, fill: '#F59E0B' },
    { name: 'CompSci', value: 35, fill: '#EF4444' }
  ];

  const usageData = [
    { day: 'Mon', views: 400 }, { day: 'Tue', views: 600 }, { day: 'Wed', views: 300 },
    { day: 'Thu', views: 800 }, { day: 'Fri', views: 500 }, { day: 'Sat', views: 700 }, { day: 'Sun', views: 450 },
  ];

  const handleLogout = async () => {
    // Placeholder for actual logout logic (e.g., Firebase sign out)
    console.log("Logout action triggered");
    // Example: await signOut(auth); localStorage.removeItem('profileUser');
    navigate('/login'); // Navigate to login after mock logout
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // Logic to handle file selection, e.g., update state for preview
      // If modal is already open, this might be a change event.
    }
  };

  const simulateUpload = (file) => {
    setIsUploading(true);
    setUploadProgress(0);
    let progress = 0;
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        progress += Math.random() * 10 + 5;
        if (progress >= 100) {
          clearInterval(interval);
          setUploadProgress(100);
          setIsUploading(false);
          resolve();
        } else {
          setUploadProgress(Math.min(progress, 100));
        }
      }, 200);
    });
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const title = formData.get('title');
    const category = formData.get('category');
    const tags = formData.get('tags');
    const file = fileInputRef.current?.files?.[0];
    
    if (!file) {
        alert("Please select a file to upload.");
        return;
    }
    
    await simulateUpload(file);
    
    const newResource = {
      id: resources.length + 1,
      title: title || file.name,
      type: file.type.startsWith('video/') ? 'video' : 
            file.type === 'application/pdf' ? 'document' :
            file.type.startsWith('image/') ? 'image' : 'document',
      category,
      views: 0,
      shares: 0,
      uploaded: new Date().toISOString().split('T')[0],
      thumbnail: URL.createObjectURL(file),
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [category, file.type.split('/')[1] || 'File'],
      uploader: 'Current Educator',
      lastModified: new Date().toISOString().split('T')[0],
    };
    
    setResources([newResource, ...resources]);
    setShowUploadModal(false);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSearchLLM = async () => {
    if (!searchLLMQuery.trim()) return;
    setIsSearchingLLM(true);
    setFoundLLMResources(null);
    try {
      const llmRes = await fetchResourcesFromLLM(searchLLMQuery);
      setFoundLLMResources(llmRes);
    } catch (error) {
      console.error('Error fetching LLM resources:', error);
    } finally {
      setIsSearchingLLM(false);
    }
  };

  useEffect(() => {
    if (searchLLMQuery.trim().length > 2) {
      const timer = setTimeout(() => {
        handleSearchLLM();
      }, 800);
      return () => clearTimeout(timer);
    } else {
      setFoundLLMResources(null);
    }
  }, [searchLLMQuery]);

  const filteredUserResources = resources.filter(resource => 
    (resource.title.toLowerCase().includes(searchUserResourcesQuery.toLowerCase()) ||
     resource.tags.some(tag => tag.toLowerCase().includes(searchUserResourcesQuery.toLowerCase()))) &&
    (selectedCategory === 'All' || resource.category === selectedCategory)
  );

  const getResourceIcon = (type) => {
    switch (type) {
      case 'video': return <VideoCameraIcon className="w-6 h-6 text-red-400" />;
      case 'document': return <DocumentTextIcon className="w-6 h-6 text-blue-400" />;
      case 'link': return <LinkIconOutline className="w-6 h-6 text-green-400" />;
      case 'image': return <PhotoIcon className="w-6 h-6 text-purple-400" />;
      default: return <FolderIcon className="w-6 h-6 text-slate-400" />;
    }
  };
  
  const customScrollbar = "scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800/50 hover:scrollbar-thumb-slate-500";

  const ResourceCard = ({ resource }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-slate-800/70 backdrop-blur-md rounded-xl border border-slate-700/60 p-4 hover:border-purple-500/70 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 flex flex-col justify-between"
    >
      <div>
        <div className="relative aspect-video bg-slate-700 rounded-lg mb-3 overflow-hidden group">
          {resource.thumbnail && (resource.type === 'video' || resource.type === 'image') ? (
            <img src={resource.thumbnail} alt={resource.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-600">
              {getResourceIcon(resource.type)}
            </div>
          )}
           <div className="absolute top-2 right-2 bg-black/40 text-white text-xs px-2 py-1 rounded">
            {resource.type.toUpperCase()}
          </div>
        </div>
        <h4 className="text-base font-semibold text-slate-100 truncate mb-1 group-hover:text-purple-300 transition-colors">{resource.title}</h4>
        <p className="text-xs text-slate-400 mb-2">Category: {resource.category}</p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {resource.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="px-2 py-0.5 text-xs bg-slate-700 rounded-full text-purple-300 border border-slate-600">
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2 pt-2 border-t border-slate-700/70">
          <div className="flex items-center gap-1"><ClockIcon className="w-3 h-3" /> {resource.uploaded}</div>
          <div className="flex items-center gap-1"><EyeIcon className="w-3 h-3" /> {resource.views}</div>
        </div>
        <div className="flex gap-2">
            <button className="flex-1 text-xs py-1.5 px-2 bg-slate-700/80 hover:bg-purple-600/40 hover:text-purple-200 rounded-md transition-colors text-slate-300 flex items-center justify-center gap-1.5">
                <EyeIcon className="w-4 h-4" /> View
            </button>
            <button className="p-1.5 bg-slate-700/80 hover:bg-slate-600/80 rounded-md transition-colors text-slate-400">
                <EllipsisVerticalIcon className="w-4 h-4" />
            </button>
        </div>
      </div>
    </motion.div>
  );

  const UploadModal = () => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[60] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className={`bg-slate-800 rounded-xl p-6 sm:p-8 w-full max-w-2xl relative shadow-2xl border border-slate-700/70 max-h-[90vh] overflow-y-auto ${customScrollbar}`}
      >
        <button
          onClick={() => setShowUploadModal(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 hover:bg-slate-700/50 rounded-full transition-colors"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
        <h3 className="text-xl sm:text-2xl font-bold mb-6 text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text">
          Upload New Resource
        </h3>
        <form onSubmit={handleUploadSubmit} className="space-y-5">
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1.5">Resource Title</label>
            <input
              type="text" name="title"
              className="w-full bg-slate-700/70 border border-slate-600/80 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm text-slate-100 placeholder-slate-500 transition-colors"
              placeholder="Enter a descriptive title"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1.5">Category</label>
              <select name="category" defaultValue="Science"
                className="w-full bg-slate-700/70 border border-slate-600/80 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm text-slate-100 transition-colors appearance-none">
                <option value="Science">Science</option> <option value="Mathematics">Mathematics</option> <option value="Literature">Literature</option> <option value="History">History</option> <option value="Computer Science">Computer Science</option> <option value="Arts">Arts</option> <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1.5">Tags (comma-separated)</label>
              <input type="text" name="tags"
                className="w-full bg-slate-700/70 border border-slate-600/80 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm text-slate-100 placeholder-slate-500 transition-colors"
                placeholder="e.g., Physics, Beginner, Lab"
              />
            </div>
          </div>
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1.5">File</label>
            <input type="file" name="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" id="file-upload" required/>
            <label htmlFor="file-upload"
              className="flex flex-col items-center justify-center border-2 border-dashed border-slate-600/80 rounded-lg p-6 hover:border-purple-500 transition-colors cursor-pointer bg-slate-700/30 hover:bg-slate-700/50">
              <CloudArrowUpIcon className="w-10 h-10 text-purple-400 mb-3" />
              <p className="text-slate-300 text-sm mb-1">Click to browse or drag & drop</p>
              <p className="text-slate-500 text-xs">Supports videos, PDFs, images, etc. (Max 500MB)</p>
               {fileInputRef.current?.files?.[0] && <p className="text-purple-300 text-xs mt-2">Selected: {fileInputRef.current.files[0].name}</p>}
            </label>
          </div>
          {isUploading && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-slate-400 text-xs">
                <span>Uploading...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-300"
                     style={{ width: `${uploadProgress}%` }}/>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-4 pt-3">
            <button type="button" onClick={() => setShowUploadModal(false)}
              className="px-5 py-2.5 rounded-lg bg-slate-700/70 hover:bg-slate-600/70 transition-colors text-sm font-medium text-slate-200">
              Cancel
            </button>
            <button type="submit" disabled={isUploading}
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-sm font-medium text-white disabled:opacity-70 disabled:cursor-not-allowed">
              {isUploading ? (<><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Uploading...</>) : (<><CloudArrowUpIcon className="w-5 h-5" /> Upload Resource</>)}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-gray-900 flex text-slate-100 overflow-x-hidden">
      {/* Sidebar Overlay for Mobile */}
      {!isDesktop && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" // Higher z-index for overlay
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 h-screen w-64 bg-slate-800/80 backdrop-blur-2xl border-r border-slate-700/60
                       transform transition-transform duration-300 ease-in-out z-50 flex flex-col shadow-2xl
                       ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`} // z-index 50 for sidebar itself
      >
        <div className="p-5 border-b border-slate-700/50 flex items-center justify-between">
          <Link to="/educator-dashboard" className="flex items-center gap-3 group">
            <GlobeAltIcon className="w-10 h-10 text-purple-500 group-hover:text-purple-400 transition-all duration-300 transform group-hover:rotate-[20deg] group-hover:scale-110" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
              IGNITIA
            </h1>
          </Link>
          {/* Mobile-only close button inside sidebar header */}
          {!isDesktop && (
            <button 
              onClick={() => setIsSidebarOpen(false)} 
              className="p-1 text-slate-400 hover:bg-slate-700/70 rounded-full"
              aria-label="Close sidebar"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
          )}
        </div>
        <nav className={`flex-1 overflow-y-auto p-3 space-y-1.5 ${customScrollbar}`}>
          {educatorMenu.map((item) => (
            <Link
              key={item.title}
              to={item.link}
              onClick={() => !isDesktop && setIsSidebarOpen(false)} // Close sidebar on mobile nav item click
              className={`group flex items-center gap-3.5 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out
                ${item.current 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg ring-1 ring-purple-500/60 transform scale-[1.01]' 
                  : item.special 
                    ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white font-semibold hover:from-amber-500 hover:to-orange-600 shadow-md hover:shadow-lg'
                    : 'text-slate-300 hover:bg-slate-700/60 hover:text-purple-300 hover:shadow-md'
                }
              `}
            >
              <item.Icon className={`w-5 h-5 flex-shrink-0 ${item.current ? 'text-white' : item.special ? 'text-white/90' : 'text-slate-400 group-hover:text-purple-300' } transition-colors`} />
              <span>{item.title}</span>
            </Link>
          ))}
        </nav>
        
      </aside>

      {/* Main Content */}
      <main 
        className={`flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto transition-all duration-300 
                       ${isDesktop && isSidebarOpen ? 'lg:ml-64' : 'ml-0'}`}
      >
        {/* Header for Main Content Area */}
        <header className="flex items-center justify-between mb-6 lg:mb-8">
            <div className="flex items-center gap-3">
                {/* Sidebar Toggle Button */}
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2.5 bg-slate-800/60 hover:bg-slate-700/80 rounded-lg shadow-sm hover:shadow-md transition-all"
                    aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
                >
                    {/* Show ChevronLeft when sidebar is open on desktop, otherwise Bars3Icon */}
                    {isSidebarOpen && isDesktop ? <ChevronLeftIcon className="w-6 h-6 text-slate-300" /> : <Bars3Icon className="w-6 h-6 text-slate-300" /> }
                </button>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text">
                        Knowledge Vault
                    </h1>
                    <p className="text-slate-400 text-sm">Manage and discover educational resources.</p>
                </div>
            </div>
            <button 
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-lg shadow-md hover:shadow-lg transition-all text-sm font-medium"
            >
                <CloudArrowUpIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Upload Resource</span>
            </button>
        </header>

        {/* LLM Search Section */}
        <div className="mb-8 p-5 sm:p-6 bg-slate-800/60 backdrop-blur-lg rounded-2xl border border-slate-700/50 shadow-xl">
          <h2 className="text-xl font-semibold text-white mb-3">Discover New Resources with AI</h2>
          <p className="text-sm text-slate-400 mb-4">Enter a topic, and Iko AI will find relevant teaching materials for you.</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input type="text" placeholder="e.g., Teaching Algebra, Classroom Management Techniques"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-700/70 border border-slate-600/80 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                value={searchLLMQuery} onChange={(e) => setSearchLLMQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchLLM()}
              />
            </div>
            <button onClick={handleSearchLLM} disabled={isSearchingLLM || !searchLLMQuery.trim()}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-lg transition-all flex items-center justify-center gap-2 font-medium text-sm disabled:opacity-70 disabled:cursor-not-allowed">
              {isSearchingLLM ? (<><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Searching...</>) : (<><SparklesIcon className="w-5 h-5" /> Find Resources</>)}
            </button>
          </div>
        </div>
        
        {/* Display LLM Found Resources */}
        {foundLLMResources && (
          <div className="mb-8 lg:mb-12 space-y-6">
             <h2 className="text-xl sm:text-2xl font-semibold text-white">AI Found Resources for "{searchLLMQuery}"</h2>
            {Object.entries(foundLLMResources).map(([categoryKey, catResources]) => (
              catResources.length > 0 && (
                <section key={categoryKey}>
                  <h3 className="text-lg font-semibold text-purple-300 mb-3 capitalize">
                    {categoryKey.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} ({catResources.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {catResources.map((resource, index) => (
                      <motion.div key={`${categoryKey}-${index}`}
                        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                        className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4 hover:border-purple-500/60 transition-colors flex flex-col justify-between">
                        <div>
                            <div className="flex items-start gap-3 mb-2">
                                <div className="p-2 bg-slate-700/60 rounded-lg mt-0.5">
                                    {getIconForLLM(categoryKey)}
                                </div>
                                <h4 className="text-base font-medium text-slate-100 flex-1">{resource.title}</h4>
                            </div>
                            {resource.description && <p className="text-xs text-slate-400 mb-2 line-clamp-2">{resource.description}</p>}
                            <div className="text-xs text-slate-500 space-y-0.5 mb-2">
                                {resource.channel && <p>Channel: {resource.channel}</p>}
                                {resource.duration && <p>Duration: {resource.duration}</p>}
                                {resource.author && <p>Author: {resource.author}</p>}
                                {resource.type && <p>Type: {resource.type}</p>}
                                {resource.grade_level && <p>Grade Level: {resource.grade_level}</p>}
                            </div>
                        </div>
                        <a href={resource.link} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-purple-400 hover:text-purple-300 transition-colors font-medium mt-2 pt-2 border-t border-slate-700/60">
                          <LinkIconOutline className="w-4 h-4" /> Visit Resource
                        </a>
                      </motion.div>
                    ))}
                  </div>
                </section>
              )
            ))}
            {Object.values(foundLLMResources).every(arr => arr.length === 0) && (
                <p className="text-slate-400 text-center py-6">No specific resources found by AI for this query. Try a broader topic or different keywords.</p>
            )}
          </div>
        )}


        {/* User's Uploaded Resources Section */}
        <div className="mb-6 lg:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-white mb-5">Your Uploaded Resources</h2>
            <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center p-4 bg-slate-800/60 backdrop-blur-lg rounded-xl border border-slate-700/50 shadow-lg">
                <div className="relative flex-1 w-full sm:w-auto">
                    <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input type="text" placeholder="Search your resources..."
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-700/70 border border-slate-600/80 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-sm"
                        value={searchUserResourcesQuery} onChange={(e) => setSearchUserResourcesQuery(e.target.value)}
                    />
                </div>
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full sm:w-auto bg-slate-700/70 border border-slate-600/80 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-sm appearance-none">
                    <option value="All">All Categories</option> <option value="Physics">Physics</option> <option value="Computer Science">Computer Science</option> <option value="Mathematics">Mathematics</option> <option value="Literature">Literature</option> <option value="History">History</option>
                </select>
                <button onClick={() => setIsGridView(!isGridView)} title={isGridView ? "Switch to List View" : "Switch to Grid View"}
                    className="p-2.5 bg-slate-700/70 hover:bg-slate-600/70 border border-slate-600/80 rounded-lg text-slate-300 hover:text-purple-300 transition-colors">
                    {isGridView ? <ListBulletIcon className="w-5 h-5" /> : <Squares2X2Icon className="w-5 h-5" />}
                </button>
            </div>

            {filteredUserResources.length > 0 ? (
                <div className={`grid gap-4 sm:gap-5 ${isGridView ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                {filteredUserResources.map(resource => (
                    isGridView ? <ResourceCard key={resource.id} resource={resource} /> : <ResourceListItem key={resource.id} resource={resource} />
                ))}
                </div>
            ) : (
                <p className="text-center py-10 text-slate-400">
                    No resources match your current filters. <button onClick={()=>setShowUploadModal(true)} className="text-purple-400 hover:underline">Upload something new!</button>
                </p>
            )}
        </div>


        {/* Stats & Analytics */}
        <div className="mb-6 lg:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-white mb-5">Resource Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {[
                { title: 'Total Uploads', value: resources.length, icon: FolderIcon, color: 'purple' },
                { title: 'Total Views', value: resources.reduce((sum, r) => sum + r.views, 0).toLocaleString(), icon: EyeIcon, color: 'blue' },
                { title: 'Total Shares', value: resources.reduce((sum, r) => sum + r.shares, 0).toLocaleString(), icon: ShareIcon, color: 'green' },
                { title: 'Avg. File Size', value: `${(resources.reduce((s, r) => s + parseFloat(r.size), 0) / (resources.length || 1)).toFixed(1)} MB`, icon: CloudArrowUpIcon, color: 'amber' },
            ].map((stat, index) => (
                <div key={index} className={`bg-slate-800/60 backdrop-blur-lg p-5 rounded-2xl border border-${stat.color}-500/30 shadow-xl hover:shadow-${stat.color}-500/20 transition-all duration-300 hover:-translate-y-1`}>
                    <div className="flex items-center justify-between">
                        <stat.icon className={`w-8 h-8 p-1.5 rounded-full bg-${stat.color}-500/20 text-${stat.color}-400`} />
                    </div>
                    <p className="text-slate-300 text-sm mt-3 mb-1">{stat.title}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</p>
                </div>
            ))}
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">
            <div className="lg:col-span-2 bg-slate-800/60 backdrop-blur-lg p-5 sm:p-6 rounded-2xl border border-slate-700/50 shadow-xl">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <TagIcon className="w-6 h-6 text-purple-400" />Resource Categories
                </h3>
                <div className="h-[250px] sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="50%" outerRadius="80%" paddingAngle={2} labelLine={false}
                            label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                                const RADIAN = Math.PI / 180;
                                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                return percent > 0.05 ? (
                                    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="10px">
                                    {`${categoryData[index].name} (${(percent * 100).toFixed(0)}%)`}
                                    </text>
                                ) : null;
                            }}>
                        {categoryData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.fill} />))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', border: '1px solid #334155', borderRadius:'0.5rem', color:'#e2e8f0' }} />
                    </PieChart>
                </ResponsiveContainer>
                </div>
            </div>
            <div className="lg:col-span-3 bg-slate-800/60 backdrop-blur-lg p-5 sm:p-6 rounded-2xl border border-slate-700/50 shadow-xl">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <ChartBarIcon className="w-6 h-6 text-green-400" />Weekly Engagement (Views)
                </h3>
                <div className="h-[250px] sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={usageData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(71, 85, 105, 0.5)" />
                    <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', border: '1px solid #334155', borderRadius:'0.5rem' }} itemStyle={{ color: '#cbd5e1' }} labelStyle={{ color: '#e2e8f0' }} cursor={{fill: 'rgba(71, 85, 105, 0.3)'}}/>
                    <Legend wrapperStyle={{fontSize: "12px", paddingTop: "10px"}}/>
                    <Bar dataKey="views" fill="url(#colorViews)" radius={[4, 4, 0, 0]} barSize={isDesktop ? 25 : 20} />
                    <defs>
                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.3}/>
                        </linearGradient>
                    </defs>
                    </BarChart>
                </ResponsiveContainer>
                </div>
            </div>
        </div>


      </main>

      {showUploadModal && <UploadModal />}
    </div>
  );
};

const ResourceListItem = ({ resource }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3 }}
    className="bg-slate-800/70 backdrop-blur-md rounded-xl border border-slate-700/60 p-4 hover:border-purple-500/70 transition-all duration-300 hover:shadow-xl flex items-center gap-4"
  >
    <div className="flex-shrink-0 w-16 h-16 bg-slate-700 rounded-lg flex items-center justify-center">
        {resource.type === 'video' ? <VideoCameraIcon className="w-8 h-8 text-red-400" /> :
         resource.type === 'document' ? <DocumentTextIcon className="w-8 h-8 text-blue-400" /> :
         resource.type === 'link' ? <LinkIconOutline className="w-8 h-8 text-green-400" /> :
         resource.type === 'image' ? <PhotoIcon className="w-8 h-8 text-purple-400" /> :
         <FolderIcon className="w-8 h-8 text-slate-400" />}
    </div>
    <div className="flex-1 min-w-0">
        <h4 className="text-base font-semibold text-slate-100 truncate group-hover:text-purple-300 transition-colors">{resource.title}</h4>
        <p className="text-xs text-slate-400 mb-1">Category: {resource.category} | Size: {resource.size}</p>
        <div className="flex flex-wrap gap-1.5">
          {resource.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="px-1.5 py-0.5 text-xs bg-slate-700 rounded-full text-purple-300 border border-slate-600">
              {tag}
            </span>
          ))}
        </div>
    </div>
    <div className="flex-shrink-0 flex flex-col items-end text-xs text-slate-500 gap-1">
        <span><EyeIcon className="w-3 h-3 inline mr-1" /> {resource.views} views</span>
        <span><ClockIcon className="w-3 h-3 inline mr-1" /> {resource.uploaded}</span>
    </div>
    <button className="p-2 bg-slate-700/80 hover:bg-slate-600/80 rounded-md transition-colors text-slate-400">
        <EllipsisVerticalIcon className="w-5 h-5" />
    </button>
  </motion.div>
);


export default ResourceManagement;