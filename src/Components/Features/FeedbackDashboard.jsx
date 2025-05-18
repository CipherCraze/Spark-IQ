import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ClipboardDocumentIcon,
  UserGroupIcon,
  ChartBarIcon,
  DocumentTextIcon,
  SparklesIcon,
  EnvelopeIcon,
  
  ClockIcon,
  ChatBubbleLeftIcon,
  UserIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  BookOpenIcon,
  DocumentDuplicateIcon, 
  
    XMarkIcon,
    StarIcon,
    AcademicCapIcon,
    ChevronRightIcon,
    
    PlusIcon,
    Squares2X2Icon,
    
  ChatBubbleLeftEllipsisIcon
} from '@heroicons/react/24/outline';
import { PieChart, Pie, Cell, BarChart,CartesianGrid, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Link } from 'react-router-dom';

const FeedbackDashboard = () => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showNewFeedbackModal, setShowNewFeedbackModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [feedbackType, setFeedbackType] = useState('all');
  const [draftContent, setDraftContent] = useState('');
  const [templateGalleryOpen, setTemplateGalleryOpen] = useState(false);

  // Mock data
  const mockData = {
    recentSubmissions: [
      {
        id: 1,
        student: 'Sarah Johnson',
        course: 'Advanced Algorithms',
        submissionDate: '2024-03-15',
        status: 'completed',
        rating: 4.5,
        lastActivity: '2h ago',
        progress: 100
      },
      {
        id: 2,
        student: 'Michael Chen',
        course: 'Data Structures',
        submissionDate: '2024-03-14',
        status: 'in-progress',
        rating: null,
        lastActivity: '1d ago',
        progress: 65
      },
      {
        id: 3,
        student: 'Emma Wilson',
        course: 'Machine Learning',
        submissionDate: '2024-03-13',
        status: 'draft',
        rating: null,
        lastActivity: '3d ago',
        progress: 30
      },
    ],
    feedbackStats: {
      totalGiven: 142,
      avgResponseTime: '28h',
      studentSatisfaction: 4.8,
      upcomingDeadlines: 7
    },
    feedbackDistribution: [
      { name: 'Completed', value: 68 },
      { name: 'Pending', value: 22 },
      { name: 'Drafts', value: 10 }
    ],
    feedbackTrends: [
      { week: 'Week 1', feedbacks: 24 },
      { week: 'Week 2', feedbacks: 32 },
      { week: 'Week 3', feedbacks: 28 },
      { week: 'Week 4', feedbacks: 41 }
    ],
    templates: [
      {
        id: 1,
        name: 'Technical Report',
        category: 'Computer Science',
        lastUsed: '2024-03-10',
        preview: 'Excellent structure but needs more experimental details...'
      },
      {
        id: 2,
        name: 'Research Paper',
        category: 'General',
        lastUsed: '2024-03-12',
        preview: 'Strong hypothesis but methodology section requires...'
      },
      {
        id: 3,
        name: 'Code Review',
        category: 'Programming',
        lastUsed: '2024-03-14',
        preview: 'Good algorithm choice but consider optimizing...'
      }
    ]
  };

  const COLORS = ['#10b981', '#f59e0b', '#3b82f6'];
  const educatorMenu = [
  {
    title: 'Courses',
    link: '/courses',
    Icon: AcademicCapIcon,
  },
  {
    title: 'Messages',
    link: '/messages',
    Icon: ChatBubbleLeftIcon,
  },
  {
    title: 'Profile',
    link: '/profile',
    Icon: UserIcon,
  },
];

  const FeedbackCard = ({ feedback }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="group bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 hover:border-purple-400/30 transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-2 h-2 rounded-full ${
              feedback.status === 'completed' ? 'bg-green-500' :
              feedback.status === 'in-progress' ? 'bg-yellow-500' : 'bg-blue-500'
            }`} />
            <h3 className="text-gray-300 font-medium">{feedback.student}</h3>
            <span className="text-xs text-gray-500 bg-gray-700/50 px-2 py-1 rounded-full">
              {feedback.course}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <ClockIcon className="w-4 h-4" />
              {feedback.submissionDate}
            </span>
            <span className="flex items-center gap-1">
              <ChartBarIcon className="w-4 h-4" />
              Progress: {feedback.progress}%
            </span>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-700/50 rounded-lg">
          <ChevronDownIcon className="w-5 h-5 text-gray-400" />
        </button>
      </div>
      
      {feedback.status === 'completed' && (
        <div className="mt-3 flex items-center gap-2">
          <div className="flex items-center gap-1 text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <StarIcon
                key={i}
                className={`w-4 h-4 ${i < Math.floor(feedback.rating) ? 'fill-current' : ''}`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-400">
            {feedback.rating}/5 rating
          </span>
        </div>
      )}
    </motion.div>
  );

  const NewFeedbackModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-8 w-full max-w-2xl relative">
        <button
          onClick={() => setShowNewFeedbackModal(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
        
        <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Create New Feedback
        </h3>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-gray-300">Select Student</label>
              <select
                className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none"
              >
                <option>Sarah Johnson</option>
                <option>Michael Chen</option>
                <option>Emma Wilson</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-gray-300">Assignment</label>
              <select
                className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none"
              >
                <option>Algorithm Analysis Report</option>
                <option>Data Structures Project</option>
                <option>ML Research Paper</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-gray-300">Feedback Template</label>
            <div className="relative">
              <button
                onClick={() => setTemplateGalleryOpen(!templateGalleryOpen)}
                className="w-full flex items-center justify-between bg-gray-700 rounded-lg px-4 py-3 hover:bg-gray-600 transition-colors"
              >
                <span className="text-gray-300">Select Template</span>
                <ChevronDownIcon className="w-5 h-5 text-gray-400" />
              </button>
              
              {templateGalleryOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute z-10 mt-2 w-full bg-gray-800 border border-gray-700/50 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                >
                  {mockData.templates.map(template => (
                    <div
                      key={template.id}
                      className="p-3 hover:bg-gray-700/50 transition-colors cursor-pointer border-b border-gray-700/50"
                    >
                      <div className="font-medium text-gray-300">{template.name}</div>
                      <div className="text-xs text-gray-400 mt-1">{template.category}</div>
                      <div className="text-sm text-gray-500 mt-2">{template.preview}</div>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-gray-300">Feedback Content</label>
            <textarea
              rows="6"
              value={draftContent}
              onChange={(e) => setDraftContent(e.target.value)}
              className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="Write your feedback here..."
            />
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={() => setShowNewFeedbackModal(false)}
              className="px-6 py-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90 transition-all flex items-center gap-2"
            >
              <PencilIcon className="w-5 h-5" />
              Publish Feedback
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-screen w-64 bg-gray-800 border-r border-gray-700/50 z-50 flex flex-col">
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
      <main className="flex-1 p-8 ml-64">
        {/* Header */}
        <header className="mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Feedback Center
                </span>
              </h1>
              <p className="text-gray-400 text-lg">
                Deliver impactful feedback and track student progress
              </p>
            </div>
            <button 
              onClick={() => setShowNewFeedbackModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90 rounded-lg transition-all"
            >
              <PencilIcon className="w-5 h-5" />
              New Feedback
            </button>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { 
              title: 'Total Feedback Given', 
              value: mockData.feedbackStats.totalGiven, 
              icon: ClipboardDocumentIcon,
              trend: '↑15%',
              color: 'purple'
            },
            { 
              title: 'Avg Response Time', 
              value: mockData.feedbackStats.avgResponseTime, 
              icon: ClockIcon,
              trend: '↓2h',
              color: 'blue'
            },
            { 
              title: 'Student Satisfaction', 
              value: mockData.feedbackStats.studentSatisfaction, 
              icon: CheckCircleIcon,
              trend: '↑0.3',
              color: 'green'
            },
            { 
              title: 'Upcoming Deadlines', 
              value: mockData.feedbackStats.upcomingDeadlines, 
              icon: BookOpenIcon,
              trend: '3 urgent',
              color: 'yellow'
            },
          ].map((stat, index) => (
            <div key={index} className={`bg-gradient-to-br from-${stat.color}-600/20 to-${stat.color}-600/10 p-6 rounded-xl border border-${stat.color}-500/20 hover:shadow-lg transition-all`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <span className={`text-xs text-${stat.color}-400`}>{stat.trend}</span>
                </div>
                <stat.icon className={`w-12 h-12 p-2.5 rounded-full bg-${stat.color}-500/20 text-${stat.color}-400`} />
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Submissions */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <DocumentTextIcon className="w-6 h-6 text-blue-400" />
                  Recent Submissions
                </h3>
                <div className="flex gap-4">
                  <select
                    value={feedbackType}
                    onChange={(e) => setFeedbackType(e.target.value)}
                    className="bg-gray-700 rounded-lg px-4 py-2 text-sm"
                  >
                    <option value="all">All Feedback</option>
                    <option value="completed">Completed</option>
                    <option value="in-progress">In Progress</option>
                    <option value="drafts">Drafts</option>
                  </select>
                  <div className="flex items-center gap-2 bg-gray-700/50 px-4 py-2 rounded-lg">
                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search feedback..."
                      className="bg-transparent outline-none"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {mockData.recentSubmissions
                  .filter(sub => 
                    (sub.status === feedbackType || feedbackType === 'all') &&
                    sub.student.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map(feedback => (
                    <FeedbackCard key={feedback.id} feedback={feedback} />
                  ))}
              </div>
            </div>
          </div>

          {/* Analytics Sidebar */}
          <div className="space-y-8">
            {/* Feedback Distribution */}
            <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <ChartBarIcon className="w-6 h-6 text-green-400" />
                Feedback Distribution
              </h3>
              <div className="flex items-center justify-center">
                <PieChart width={240} height={240}>
                  <Pie
                    data={mockData.feedbackDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {mockData.feedbackDistribution.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
                    itemStyle={{ color: '#e5e7eb' }}
                  />
                </PieChart>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                {mockData.feedbackDistribution.map((stat, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                    <span className="text-sm text-gray-300">
                      {stat.name}: {stat.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Feedback Trends */}
            <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <SparklesIcon className="w-6 h-6 text-purple-400" />
                Weekly Feedback Trends
              </h3>
              <BarChart width={300} height={200} data={mockData.feedbackTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="week" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
                  itemStyle={{ color: '#e5e7eb' }}
                />
                <Bar 
                  dataKey="feedbacks" 
                  fill="#8b5cf6" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <ChatBubbleLeftEllipsisIcon className="w-6 h-6 text-blue-400" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 p-3 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg transition-colors">
                  <DocumentDuplicateIcon className="w-5 h-5 text-purple-400" />
                  <span>Create New Template</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors">
                  <EnvelopeIcon className="w-5 h-5 text-blue-400" />
                  <span>Send Reminders</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 bg-green-500/20 hover:bg-green-500/30 rounded-lg transition-colors">
                  <ChartBarIcon className="w-5 h-5 text-green-400" />
                  <span>Generate Reports</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {showNewFeedbackModal && <NewFeedbackModal />}
      </main>
    </div>
  );
};

export default FeedbackDashboard;