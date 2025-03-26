import { useState } from 'react';
import { useNavigate } from 'react-router';
import { 
  EnvelopeIcon,
  AcademicCapIcon,
  ChevronLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  ChatBubbleLeftEllipsisIcon,
  ArchiveBoxIcon,
  MagnifyingGlassIcon,
  BookmarkIcon,
  UserCircleIcon,
  HomeIcon,
  ChartBarIcon,
  BellIcon,
  SparklesIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';

const SuggestionsInbox = () => {
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [composeOpen, setComposeOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const suggestions = [
    {
      id: 1,
      teacher: 'Dr. Sarah Johnson',
      subject: 'Research Paper Improvement Suggestions',
      preview: 'I noticed your paper could benefit from more primary sources...',
      date: '2024-03-15',
      category: 'Academic',
      status: 'unread',
      priority: 'high',
      fullMessage: `Dear Student,\n\nYour recent paper on climate change shows strong understanding...`,
    },
    {
      id: 2,
      teacher: 'Prof. Michael Chen',
      subject: 'Career Guidance Opportunity',
      preview: 'Your performance in the last project suggests you might excel...',
      date: '2024-03-14',
      category: 'Career',
      status: 'read',
      priority: 'medium',
      fullMessage: `Hello,\n\nI've been reviewing your work and believe you have potential...`,
    },
    // Add more mock data as needed
  ];

  const statusStyles = {
    unread: 'text-red-400 bg-red-500/10',
    read: 'text-gray-400 bg-gray-500/10',
    'pending-action': 'text-amber-400 bg-amber-500/10',
    resolved: 'text-green-400 bg-green-500/10',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col md:flex-row">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Responsive Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800/50 border-r border-gray-700/50 p-6 backdrop-blur-lg transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform md:relative md:translate-x-0 md:block ${isSidebarOpen ? 'block' : 'hidden'}`}>
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <AcademicCapIcon className="w-8 h-8 text-purple-400" />
          </div>
          <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            Spark IQ
          </h2>
        </div>
        
        <nav className="space-y-2">
          <button 
            className="w-full flex items-center gap-3 p-3 text-purple-300 bg-purple-500/20 rounded-lg"
            onClick={() => navigate('/dashboard')}
          >
            <HomeIcon className="w-5 h-5" />
            <span>Dashboard</span>
            <span className="ml-auto text-xs bg-purple-500 text-white px-2 py-1 rounded-full">New</span>
          </button>
          
          {['Inbox', 'Starred', 'Archived'].map((item) => (
            <button
              key={item}
              className="w-full flex items-center gap-3 p-3 text-gray-300 hover:bg-gray-700/30 rounded-lg transition-all"
            >
              <EnvelopeIcon className="w-5 h-5" />
              <span>{item}</span>
              {item === 'Inbox' && <span className="ml-auto text-xs bg-purple-500 text-white px-2 py-1 rounded-full">3</span>}
            </button>
          ))}
        </nav>

        <div className="mt-8 pt-8 border-t border-gray-700/50">
          <div className="p-4 bg-gray-700/20 rounded-lg">
            <div className="flex items-center gap-2 text-purple-300">
              <SparklesIcon className="w-5 h-5" />
              <span className="text-sm">Pro Features</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">Unlock advanced analytics and priority support</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-x-hidden">
        {/* Responsive Header */}
        <div className="p-4 md:p-6 border-b border-gray-700/50 flex items-center justify-between bg-gradient-to-r from-gray-800/50 to-gray-900/50">
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              className="md:hidden p-2 hover:bg-gray-700/30 rounded-lg transition-all"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Bars3Icon className="w-6 h-6 text-gray-300" />
            </button>
            {selectedSuggestion ? (
              <button 
                onClick={() => setSelectedSuggestion(null)}
                className="p-2 hover:bg-gray-700/30 rounded-lg transition-all"
              >
                <ChevronLeftIcon className="w-6 h-6 text-gray-300" />
              </button>
            ) : (
              <div className="flex items-center gap-2 md:gap-3">
                <ChartBarIcon className="w-6 h-6 text-purple-400" />
                <h1 className="text-xl md:text-2xl font-semibold text-white">
                  Suggestions Inbox
                </h1>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <div className="relative flex-1 max-w-xs">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search suggestions..."
                className="pl-10 pr-4 py-2 bg-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="p-2 bg-gray-700/50 rounded-xl hover:bg-gray-700/70">
              <BellIcon className="w-6 h-6 text-gray-300" />
            </button>
          </div>
        </div>

        {/* Responsive Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {!selectedSuggestion ? (
            <div className="grid grid-cols-1 gap-4">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="group p-4 md:p-6 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-purple-400/30 transition-all cursor-pointer shadow-md hover:shadow-lg"
                  onClick={() => setSelectedSuggestion(suggestion)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-3 h-3 rounded-full mt-2 ${suggestion.priority === 'high' ? 'bg-red-400 animate-pulse' : 'bg-gray-400'}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-white font-medium group-hover:text-purple-300 transition-colors truncate">
                          {suggestion.subject}
                        </h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${statusStyles[suggestion.status]}`}>
                          {suggestion.status}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{suggestion.preview}</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-400">
                          <UserCircleIcon className="w-5 h-5 text-purple-400" />
                          <span>{suggestion.teacher}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <ClockIcon className="w-5 h-5 text-blue-400" />
                          <span>{suggestion.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <BookmarkIcon className="w-5 h-5 text-gray-400 hover:text-purple-400" />
                      <ArchiveBoxIcon className="w-5 h-5 text-gray-400 hover:text-blue-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="max-w-3xl mx-auto bg-gray-800/50 rounded-xl border border-gray-700/50 shadow-xl transform transition-all">
              {/* Message Header */}
              <div className="p-4 md:p-6 border-b border-gray-700/50 bg-gradient-to-r from-gray-800 to-gray-900/50 rounded-t-xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl md:text-2xl font-semibold text-white">{selectedSuggestion.subject}</h2>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-6 h-6 text-green-400" />
                    <span className="text-sm text-gray-400">Verified Teacher</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-2 bg-gray-700/50 px-3 py-1 rounded-full">
                    <UserCircleIcon className="w-4 h-4" />
                    <span>{selectedSuggestion.teacher}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-700/50 px-3 py-1 rounded-full">
                    <ClockIcon className="w-4 h-4" />
                    <span>{selectedSuggestion.date}</span>
                  </div>
                  <div className={`px-3 py-1 rounded-full ${statusStyles[selectedSuggestion.status]}`}>
                    {selectedSuggestion.status}
                  </div>
                </div>
              </div>

              {/* Message Body */}
              <div className="p-4 md:p-6 prose prose-invert max-w-none bg-gray-800/30">
                {selectedSuggestion.fullMessage.split('\n').map((para, i) => (
                  <p key={i} className="mb-4 text-gray-300">{para}</p>
                ))}
              </div>

              {/* Action Bar */}
              <div className="p-4 md:p-6 border-t border-gray-700/50 bg-gray-800/50 rounded-b-xl flex flex-wrap items-center gap-4">
                <button className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-xl hover:bg-purple-500/30 flex items-center gap-2 transition-all">
                  <ChatBubbleLeftEllipsisIcon className="w-5 h-5" />
                  <span>Reply</span>
                </button>
                <button className="px-4 py-2 bg-gray-700/50 text-gray-300 rounded-xl hover:bg-gray-700/70 flex items-center gap-2 transition-all">
                  <ArchiveBoxIcon className="w-5 h-5" />
                  <span>Archive</span>
                </button>
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-sm text-gray-400">Was this helpful?</span>
                  <button className="px-3 py-1 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30">
                    Yes
                  </button>
                  <button className="px-3 py-1 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30">
                    No
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Floating Action Button */}
        {!selectedSuggestion && (
          <button 
            className="fixed bottom-8 right-8 p-4 bg-purple-500 rounded-full hover:bg-purple-600 shadow-lg transition-all hover:scale-110 animate-pulse"
            onClick={() => setComposeOpen(true)}
          >
            <EnvelopeIcon className="w-6 h-6 text-white" />
          </button>
        )}

        {/* Responsive Compose Modal */}
        {composeOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setComposeOpen(false)}>
            <div className="bg-gray-800 rounded-xl p-4 md:p-6 max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-xl font-semibold text-white mb-4">New Message</h2>
              {/* Placeholder for form fields */}
              <button onClick={() => setComposeOpen(false)} className="mt-4 px-4 py-2 bg-gray-700 text-white rounded-lg">
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuggestionsInbox;