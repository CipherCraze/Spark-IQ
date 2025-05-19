import { useState } from 'react';
import { Link } from 'react-router';
import {
  ClipboardDocumentIcon,
  AcademicCapIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  LightBulbIcon,
  VideoCameraIcon,
  UserGroupIcon,
  MegaphoneIcon,
  EnvelopeIcon,
  SparklesIcon,
  ChevronDownIcon,
  ArrowRightCircleIcon,
  BellIcon,
  Bars3Icon,
  ChevronLeftIcon,
  CheckCircleIcon,
  CalendarIcon,
  XMarkIcon,
  ChartPieIcon,
  ClockIcon,
  DocumentCheckIcon,
  UserCircleIcon,
  UsersIcon,
  FolderIcon,
  
  ChatBubbleLeftIcon,
  ClipboardIcon,

  PuzzlePieceIcon,
  BookOpenIcon,
  PresentationChartLineIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { BarChart, LineChart, DonutChart } from '../Charts.jsx';

const EducatorDashboard = ({ role }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  // Educator-specific state
  const [classes] = useState([
    { id: 1, name: 'Mathematics 101', students: 32, progress: 85 },
    { id: 2, name: 'Advanced Physics', students: 28, progress: 72 },
    { id: 3, name: 'Modern Literature', students: 35, progress: 91 },
  ]);
  
  const [recentSubmissions] = useState([
    { id: 1, course: 'Math 101', student: 'Alice Chen', status: 'Graded', time: '2h ago' },
    { id: 2, course: 'Physics', student: 'David Kim', status: 'Pending', time: '4h ago' },
    { id: 3, course: 'Literature', student: 'Maria Gomez', status: 'Needs Review', time: '1d ago' },
  ]);

  const [performanceMetrics] = useState({
    attendance: { current: 92, previous: 88 },
    grades: { average: 84, trend: 'up' },
    engagement: { rating: 4.8, trend: 'stable' }
  });

  const educatorMenu = [
    { title: 'Assignments', Icon: ClipboardDocumentIcon, link: '/assignment-management' },
    { title: 'Grades', Icon: AcademicCapIcon, link: '/grading-system' },
    { title: 'Resources', Icon: FolderIcon, link: '/resource-management' },
    { title: 'Attendance', Icon: ChartBarIcon, link: '/attendance-tracking' },
    { title: 'Ask Sparky', Icon: ChatBubbleLeftRightIcon, link: '/chatbot-access' },
    { title: 'Feedback', Icon: LightBulbIcon, link: '/feedback-dashboard' },
    { title: 'Questions', Icon: SparklesIcon, link: '/ai-generated-questions' },
    { title: 'News', Icon: UsersIcon, link: '/educational-news' },
    { title: 'Suggestions', Icon: EnvelopeIcon, link: '/suggestions-to-students' },
    { title: 'Meetings', Icon: VideoCameraIcon, link: '/meeting-host' },  
    { title: 'Announcements', Icon: MegaphoneIcon, link: '/announcements' },
    { title: 'Upgrade to Pro', Icon: SparklesIcon, link: '/pricing' },
  ];

  const performanceChartData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Class Performance',
        data: [75, 82, 79, 88],
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
      },
    ],
  };

  const attendanceData = {
    labels: ['Present', 'Absent', 'Late'],
    datasets: [{
      data: [85, 10, 5],
      backgroundColor: ['#4f46e5', '#ef4444', '#f59e0b']
    }]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex">
      {/* Enhanced Sidebar */}
      <aside className={`fixed top-0 left-0 h-screen w-64 bg-gray-800/80 backdrop-blur-lg border-r border-gray-700/50 transform transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } z-50 flex flex-col`}>
        <div className="p-6 relative border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            <GlobeAltIcon className="w-8 h-8 text-purple-400 animate-pulse" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              SPARK-IQ
            </h1>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-6 space-y-2">
          {educatorMenu.map((item, index) => (
            <Link
              key={index}
              to={item.link}
              className="group flex items-center gap-3 p-3 text-gray-300 hover:bg-gray-700/30 rounded-lg transition-all duration-300 hover:translate-x-2"
            >
              <item.Icon className="w-5 h-5 text-purple-400 group-hover:text-blue-400 transition-colors" />
              <span className="flex-1">{item.title}</span>
              <ArrowRightCircleIcon className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 p-8 overflow-y-auto transition-margin duration-300 ${
        isSidebarOpen ? 'ml-64' : 'ml-0'
      }`}>
        {/* Header Section */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text mb-2">
              Educator Dashboard
            </h1>
            <p className="text-gray-400 text-lg">Insights and tools for effective classroom management</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-700/50 rounded-full transition-colors">
              <BellIcon className="w-6 h-6 text-gray-400" />
            </button>
            <div className="flex items-center gap-2">
              <UserCircleIcon className="w-9 h-9 text-gray-400" />
              <div>
                <p className="text-white font-medium">Dr. Sarah Johnson</p>
                <p className="text-sm text-gray-400">Professor of Physics</p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 backdrop-blur-sm hover:shadow-xl transition-all">
            <div className="flex items-center gap-4">
              <BookOpenIcon className="w-10 h-10 text-purple-400" />
              <div>
                <p className="text-gray-400 text-sm">Total Courses</p>
                <p className="text-2xl font-bold text-white">6 Courses</p>
              </div>
            </div>
            <div className="mt-4">
              <LineChart data={performanceChartData} />
            </div>
          </div>

          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 backdrop-blur-sm hover:shadow-xl transition-all">
            <div className="flex items-center gap-4 mb-4">
              <ChartPieIcon className="w-10 h-10 text-blue-400" />
              <div>
                <p className="text-gray-400 text-sm">Overall Attendance</p>
                <p className="text-2xl font-bold text-white">{performanceMetrics.attendance.current}%</p>
              </div>
            </div>
            <DonutChart data={attendanceData} />
          </div>

          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 backdrop-blur-sm hover:shadow-xl transition-all">
            <div className="flex items-center gap-4 mb-4">
              <PresentationChartLineIcon className="w-10 h-10 text-green-400" />
              <div>
                <p className="text-gray-400 text-sm">Average Grade</p>
                <p className="text-2xl font-bold text-white">A-</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Mathematics</span>
                <span className="text-white">89%</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full">
                <div className="h-2 bg-green-400 rounded-full w-4/5"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Classes & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
            <h3 className="text-xl font-semibold text-white mb-6">Your Classes</h3>
            <div className="space-y-4">
              {classes.map((cls) => (
                <div key={cls.id} className="p-4 bg-gray-900/30 rounded-lg hover:bg-gray-700/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{cls.name}</p>
                      <p className="text-gray-400 text-sm">{cls.students} students</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="relative w-24 h-2 bg-gray-700 rounded-full">
                        <div 
                          className="absolute h-2 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full"
                          style={{ width: `${cls.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-300">{cls.progress}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
            <h3 className="text-xl font-semibold text-white mb-6">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <button className="p-6 bg-purple-500/20 rounded-xl hover:bg-purple-500/30 transition-colors flex flex-col items-center">
                <ClipboardDocumentIcon className="w-8 h-8 text-purple-400 mb-2" />
                <span className="text-white">New Assignment</span>
              </button>
              <button className="p-6 bg-blue-500/20 rounded-xl hover:bg-blue-500/30 transition-colors flex flex-col items-center">
                <MegaphoneIcon className="w-8 h-8 text-blue-400 mb-2" />
                <span className="text-white">Post Announcement</span>
              </button>
              <button className="p-6 bg-green-500/20 rounded-xl hover:bg-green-500/30 transition-colors flex flex-col items-center">
                <VideoCameraIcon className="w-8 h-8 text-green-400 mb-2" />
                <span className="text-white">Host Meeting</span>
              </button>
              <button className="p-6 bg-pink-500/20 rounded-xl hover:bg-pink-500/30 transition-colors flex flex-col items-center">
                <SparklesIcon className="w-8 h-8 text-pink-400 mb-2" />
                <span className="text-white">Generate Quiz</span>
              </button>
            </div>
          </div>
        </div>

        {/* Recent Submissions & Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
            <h3 className="text-xl font-semibold text-white mb-6">Recent Submissions</h3>
            <div className="space-y-4">
              {recentSubmissions.map((submission) => (
                <div key={submission.id} className="p-4 bg-gray-900/30 rounded-lg hover:bg-gray-700/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{submission.course}</p>
                      <p className="text-gray-400 text-sm">{submission.student}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        submission.status === 'Graded' ? 'bg-green-500/20 text-green-400' :
                        submission.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {submission.status}
                      </span>
                      <span className="text-gray-400 text-sm">{submission.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
            <h3 className="text-xl font-semibold text-white mb-6">Engagement Analytics</h3>
            <BarChart data={{
              labels: ['Math', 'Science', 'Literature', 'History'],
              datasets: [{
                label: 'Student Engagement',
                data: [85, 78, 92, 88],
                backgroundColor: 'rgba(124, 58, 237, 0.5)',
                borderColor: '#7c3aed',
              }]
            }} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default EducatorDashboard;