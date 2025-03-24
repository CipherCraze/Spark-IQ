import { useState } from 'react';
import {
  AcademicCapIcon,
  ChartBarIcon,
  BookOpenIcon,
  ClipboardDocumentIcon,
  UserGroupIcon,
  SparklesIcon,
  DocumentCheckIcon,
  ClockIcon,
  ChevronDownIcon,
  LightBulbIcon,
  ChatBubbleLeftEllipsisIcon,
  ArrowsRightLeftIcon,
  EnvelopeIcon,
  VideoCameraIcon,
  MegaphoneIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Link } from 'react-router'; // Added since <Link> is used in the sidebar

const GradingSystem = () => {
  const [activeTab, setActiveTab] = useState('submissions');
  const [expandedStudents, setExpandedStudents] = useState(new Set());
  const [showAIFeedback, setShowAIFeedback] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Added to manage sidebar state

  const mockData = {
    totalStudents: 42,
    gradedSubmissions: 28,
    averageGrade: 'B+',
    gradeDistribution: [
      { grade: 'A', count: 8 },
      { grade: 'B', count: 15 },
      { grade: 'C', count: 7 },
      { grade: 'D', count: 2 },
    ],
    submissions: [
      {
        id: 1,
        student: 'Sarah Johnson',
        status: 'Submitted',
        grade: 'A-',
        submissionDate: '2024-03-15',
        similarityScore: 2.4,
        feedback: 'Excellent analysis with thorough research. Minor formatting improvements needed.',
      },
      {
        id: 2,
        student: 'Michael Chen',
        status: 'Graded',
        grade: 'B+',
        submissionDate: '2024-03-14',
        similarityScore: 1.8,
        feedback: 'Strong arguments but needs more supporting data in section 3.',
      },
    ],
    rubric: [
      { criterion: 'Research Quality', weight: 30, maxScore: 30 },
      { criterion: 'Analysis Depth', weight: 25, maxScore: 25 },
      { criterion: 'Structure & Flow', weight: 20, maxScore: 20 },
      { criterion: 'Citations', weight: 15, maxScore: 15 },
      { criterion: 'Creativity', weight: 10, maxScore: 10 },
    ],
    commentBank: [
      'Outstanding critical thinking demonstrated',
      'Needs stronger thesis statement',
      'Excellent use of supporting evidence',
      'Improve paragraph transitions',
    ],
  };

  const educatorMenu = [
    { title: 'Dashboard', Icon: ClipboardDocumentIcon, link: '/educator-dashboard' },
    { title: 'Grading System', Icon: AcademicCapIcon, link: '/grading-system' },
    { title: 'Attendance Tracking', Icon: ChartBarIcon, link: '/attendance-tracking' },
    { title: 'Chatbot Interaction', Icon: ChatBubbleLeftEllipsisIcon, link: '/chatbot-interaction' },
    { title: 'Feedback Provision', Icon: LightBulbIcon, link: '/feedback-provision' },
    { title: 'Question Generation', Icon: SparklesIcon, link: '/question-generation' },
    { title: 'Suggestions to Students', Icon: EnvelopeIcon, link: '/suggestions-to-students' },
    { title: 'Meeting Hosting', Icon: VideoCameraIcon, link: '/meeting-hosting' },
    { title: 'Collaboration', Icon: UserGroupIcon, link: '/collaboration' },
    { title: 'Announcements', Icon: MegaphoneIcon, link: '/announcements' },
  ];

  const toggleStudent = (studentId) => {
    const newExpanded = new Set(expandedStudents);
    newExpanded.has(studentId) ? newExpanded.delete(studentId) : newExpanded.add(studentId);
    setExpandedStudents(newExpanded);
  };

  const COLORS = ['#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-8">
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
      <div className="mx-auto w-full max-w-4xl space-y-5">
        {/* Header Section */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500/20 blur-2xl rounded-full" />
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <AcademicCapIcon className="w-8 h-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">Advanced Grading Interface</h1>
                <p className="text-gray-400">Computer Science 301 - Spring 2024</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="px-6 py-3 bg-purple-500/20 text-purple-300 rounded-xl hover:bg-purple-500/30 transition-all flex items-center gap-2">
                <SparklesIcon className="w-5 h-5" />
                AI Assist
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 border border-gray-700/50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <UserGroupIcon className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Students</p>
                <p className="text-2xl font-bold text-white">{mockData.totalStudents}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 border border-gray-700/50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <DocumentCheckIcon className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Graded Submissions</p>
                <p className="text-2xl font-bold text-white">{mockData.gradedSubmissions}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 border border-gray-700/50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <ChartBarIcon className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Average Grade</p>
                <p className="text-2xl font-bold text-white">{mockData.averageGrade}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <div className="flex overflow-x-auto gap-4 border-b border-gray-700/50 scrollbar-hide">
          {['submissions', 'grading', 'analytics'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-t-lg transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'text-purple-300 bg-gray-800/50 border-b-2 border-purple-500'
                  : 'text-gray-400 hover:bg-gray-800/30'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Submissions Tab */}
        {activeTab === 'submissions' && (
          <div className="space-y-4">
            {mockData.submissions.map((submission) => (
              <div
                key={submission.id}
                className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 border border-gray-700/50 hover:border-purple-400/30 transition-all"
              >
                <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleStudent(submission.id)}>
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${submission.status === 'Graded' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                    <div>
                      <h3 className="text-white font-medium">{submission.student}</h3>
                      <p className="text-gray-400 text-sm">{submission.submissionDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm px-2 py-1 rounded-full bg-purple-500/20 text-purple-300">
                      {submission.grade}
                    </span>
                    <ChevronDownIcon className={`w-5 h-5 text-gray-400 transform transition-transform ${expandedStudents.has(submission.id) ? 'rotate-180' : ''}`} />
                  </div>
                </div>
                {expandedStudents.has(submission.id) && (
                  <div className="mt-4 pt-4 border-t border-gray-700/50 space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-700/30 rounded-lg p-3">
                        <p className="text-gray-400 text-sm">Similarity Score</p>
                        <p className="text-white font-medium">{submission.similarityScore}%</p>
                      </div>
                      <div className="bg-gray-700/30 rounded-lg p-3">
                        <p className="text-gray-400 text-sm">Submission Status</p>
                        <p className="text-white font-medium">{submission.status}</p>
                      </div>
                    </div>
                    <div className="prose prose-invert max-w-none text-gray-300 text-sm">
                      {submission.feedback}
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-all text-sm">
                        View Submission
                      </button>
                      <button className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-all text-sm">
                        Edit Grade
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Grading Tab */}
        {activeTab === 'grading' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Rubric Section */}
            <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <ClipboardDocumentIcon className="w-5 h-5 text-purple-400" />
                Grading Rubric
              </h2>
              <div className="space-y-4">
                {mockData.rubric.map((item, index) => (
                  <div key={index} className="bg-gray-700/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-300 text-sm">{item.criterion}</span>
                      <span className="text-purple-400 text-sm">Weight: {item.weight}%</span>
                    </div>
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div className="w-full bg-gray-600 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                            style={{ width: `${(item.weight / 100) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comment Bank */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <LightBulbIcon className="w-5 h-5 text-blue-400" />
                Quick Comment Bank
              </h2>
              <div className="space-y-3">
                {mockData.commentBank.map((comment, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-700/30 rounded-lg cursor-pointer hover:bg-gray-700/50 transition-all"
                  >
                    <p className="text-gray-300 text-sm">{comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Grade Distribution */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <ChartBarIcon className="w-5 h-5 text-green-400" />
                Grade Distribution
              </h2>
              <div className="h-64">
                <BarChart width={500} height={240} data={mockData.gradeDistribution}>
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </div>
            </div>

            {/* Performance Trends */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <ArrowsRightLeftIcon className="w-5 h-5 text-purple-400" />
                Class Comparison
              </h2>
              <div className="h-64 flex items-center justify-center">
                <PieChart width={300} height={200}>
                  <Pie
                    data={mockData.gradeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {mockData.gradeDistribution.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </div>
            </div>
          </div>
        )}

        {/* AI Feedback Modal */}
        {showAIFeedback && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-2xl relative">
              <button
                onClick={() => setShowAIFeedback(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
              <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                AI Feedback Suggestions
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-gray-700/30 rounded-lg">
                  <p className="text-gray-300 text-sm">Based on the student's work, consider adding:</p>
                  <ul className="list-disc pl-4 mt-2 text-blue-400 text-sm">
                    <li>More recent case studies in section 2</li>
                    <li>Comparative analysis with previous research</li>
                    <li>Visual data representations for key points</li>
                  </ul>
                </div>
                <button className="w-full py-3 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-all">
                  Apply Suggested Feedback
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GradingSystem;