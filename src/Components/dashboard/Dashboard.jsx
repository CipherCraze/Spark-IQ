import { useState } from 'react';
// import { Link } from 'react-router';
import { Link, useNavigate } from 'react-router'; // Add useNavigate
import { useMediaQuery } from 'react-responsive';
import {
  SparklesIcon,
  AcademicCapIcon,
  ChartBarIcon,
  ClipboardDocumentIcon,
  UsersIcon,
  ChatBubbleLeftRightIcon,
  LightBulbIcon,
  EnvelopeIcon,
  VideoCameraIcon,
  MegaphoneIcon,
  PresentationChartLineIcon,
  TrophyIcon,
  FolderIcon,
  UserGroupIcon,
  UserCircleIcon,
  ChevronDownIcon,
  ArrowRightCircleIcon,
  BellIcon,
  Bars3Icon,
  ChevronLeftIcon,
  CheckCircleIcon,
  CalendarIcon,
  StarIcon,
  GiftIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { LineChart, PieChart, BarChart } from '../Charts.jsx';
import ChatbotAccess from '../Chatbot/Chatbot.jsx';

// Shared Notification Component
const Notifications = () => {
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Your assignment has been graded.', timestamp: '2 mins ago', read: false },
    { id: 2, message: 'New message from Alice.', timestamp: '10 mins ago', read: false },
    { id: 3, message: 'Reminder: Science quiz tomorrow.', timestamp: '1 hour ago', read: true },
    { id: 4, message: 'You earned 50 points!', timestamp: '2 hours ago', read: true },
  ]);

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  };

  return (
    <div className="absolute right-0 top-0 mt-10 w-72 sm:w-80 bg-gray-800 rounded-lg shadow-xl border border-gray-700/50 z-50 overflow-hidden">
      <div className="p-4 border-b border-gray-700/50">
        <h3 className="text-lg font-semibold text-white">Notifications</h3>
      </div>
      <div className="max-h-64 overflow-y-auto">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-3 hover:bg-gray-700/50 transition-colors ${
              notification.read ? 'bg-gray-900/30' : 'bg-gray-800'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-white">{notification.message}</p>
                <p className="text-xs text-gray-400 mt-1">{notification.timestamp}</p>
              </div>
              <div className="flex items-center gap-1">
                {!notification.read && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="p-1 hover:bg-gray-700 rounded-full transition-colors"
                  >
                    <CheckCircleIcon className="w-4 h-4 text-green-400" />
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(notification.id)}
                  className="p-1 hover:bg-gray-700 rounded-full transition-colors"
                >
                  <XMarkIcon className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-gray-700/50">
        <button
          onClick={() => setNotifications([])}
          className="w-full py-2 bg-indigo-500/90 rounded-lg text-white hover:bg-indigo-600 transition-colors"
        >
          Clear All Notifications
        </button>
      </div>
    </div>
  );
};

// Shared Simple Calendar Component
const SimpleCalendar = () => {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
  const currentYear = currentDate.getFullYear();
  const firstDayOfMonth = new Date(currentYear, currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentYear, currentDate.getMonth() + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDay = firstDayOfMonth.getDay();

  const days = [];
  for (let i = 0; i < startingDay; i++) {
    days.push(<div key={`empty-${i}`} className="w-6 h-6 sm:w-8 sm:h-8"></div>);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(
      <div
        key={`day-${i}`}
        className={`w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-full transition-all duration-300 text-xs sm:text-sm ${
          i === currentDate.getDate()
            ? 'bg-indigo-500 text-white shadow-lg'
            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
        }`}
      >
        {i}
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 p-3 sm:p-4 rounded-xl border border-gray-700/50 hover:border-indigo-400/30 transition-all duration-500 hover:shadow-xl">
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400 animate-pulse" />
        <h3 className="text-base sm:text-lg font-semibold text-white">
          {currentMonth} {currentYear}
        </h3>
        <button className="ml-auto p-1 hover:bg-gray-700 rounded-full transition-colors">
          <ChevronLeftIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs sm:text-sm text-gray-400">
        {daysOfWeek.map((day) => (
          <div
            key={day}
            className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center font-medium"
          >
            {day}
          </div>
        ))}
        {days}
      </div>
    </div>
  );
};
// Profile Dropdown Component
const ProfileDropdown = ({ role, onClose, handleLogout }) => {
  return (
    <div className="fixed bottom-16 right-4 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700/50 z-50">
      <div className="p-3 border-b border-gray-700/50">
        <p className="text-white font-medium text-sm">John Doe</p>
        <p className="text-xs text-gray-400">{role}@sparkiq.com</p>
      </div>
      <div className="p-2">
        <Link
          to="/profile"
          onClick={onClose}
          className="block p-2 text-gray-300 hover:bg-gray-700 rounded-md text-sm"
        >
          Profile
        </Link>
        <Link
          to="/settings"
          onClick={onClose}
          className="block p-2 text-gray-300 hover:bg-gray-700 rounded-md text-sm"
        >
          Settings
        </Link>
        <button
          onClick={handleLogout}
          className="w-full text-left p-2 text-red-400 hover:bg-gray-700 rounded-md text-sm"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

// Mobile Dashboard Component (Your Mobile-Optimized Version)
const MobileDashboard = ({ role }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Complete Math Assignment', dueDate: '2023-10-20', completed: false },
    { id: 2, title: 'Prepare for Science Quiz', dueDate: '2023-10-22', completed: true },
    { id: 3, title: 'Submit History Project', dueDate: '2023-10-25', completed: false },
    { id: 4, title: 'Read Chapter 5 of Biology', dueDate: '2023-10-21', completed: false },
    { id: 5, title: 'Solve 10 Math Problems', dueDate: '2023-10-23', completed: false },
    { id: 6, title: 'Write Essay on Climate Change', dueDate: '2023-10-24', completed: true },
    { id: 7, title: 'Attend Virtual Lab Session', dueDate: '2023-10-26', completed: false },
    { id: 8, title: 'Revise Chemistry Formulas', dueDate: '2023-10-27', completed: false },
    { id: 9, title: 'Complete Geography Map Work', dueDate: '2023-10-28', completed: false },
    { id: 10, title: 'Prepare for English Presentation', dueDate: '2023-10-29', completed: false },
  ]);
  const [leaderboardData, setLeaderboardData] = useState([
    { rank: 1, name: 'Alice', points: 1200 },
    { rank: 2, name: 'Bob', points: 1100 },
    { rank: 3, name: 'Charlie', points: 1000 },
    { rank: 4, name: 'David', points: 950 },
  ]);
  const [achievements, setAchievements] = useState([
    {
      id: 1,
      title: 'Top Performer',
      description: 'Achieved top 10% in class',
      unlocked: true,
    },
    {
      id: 2,
      title: 'Consistent Learner',
      description: 'Completed 10 assignments in a row',
      unlocked: false,
    },
    {
      id: 3,
      title: 'Quiz Master',
      description: 'Scored 100% in 5 quizzes',
      unlocked: false,
    },
  ]);
  const [points, setPoints] = useState(850);

  const studentMenu = [
    { title: 'Resources', Icon: FolderIcon, link: '/resource-utilization' },
    { title: 'Attendance', Icon: ChartBarIcon, link: '/attendance-monitoring' },
    { title: 'Assignments', Icon: ClipboardDocumentIcon, link: '/assignment-submission' },
    { title: 'Grades', Icon: PresentationChartLineIcon, link: '/grading-access' },
    { title: 'Ask Sparky', Icon: ChatBubbleLeftRightIcon, link: '/chatbot-access' },
    { title: 'Feedback', Icon: LightBulbIcon, link: '/personalized-feedback' },
    { title: 'Questions', Icon: SparklesIcon, link: '/ai-generated-questions' },
    { title: 'News', Icon: UsersIcon, link: '/educational-news' },
    { title: 'Argue AI', Icon: UsersIcon, link: '/argue-ai' },
    { title: 'Smart Review', Icon: UsersIcon, link: '/smart-review' },
    { title: 'Meetings', Icon: VideoCameraIcon, link: '/meeting-participation' },
    { title: 'Social', Icon: ChatBubbleLeftRightIcon, link: '/chat-functionality' },
    { title: 'Inbox', Icon: EnvelopeIcon, link: '/inbox-for-suggestions' },
    { title: 'Upgrade to Pro', Icon: SparklesIcon, link: '/pricing' },
  ];

  const educatorMenu = [
    { title: 'Assignment Management', Icon: ClipboardDocumentIcon, link: '/assignment-management' },
    { title: 'Grading System', Icon: AcademicCapIcon, link: '/grading-system' },
    { title: 'Resource Management', Icon: FolderIcon, link: '/resource-management' },
    { title: 'Attendance Tracking', Icon: ChartBarIcon, link: '/attendance-tracking' },
    { title: 'Chatbot Interaction', Icon: ChatBubbleLeftRightIcon, link: '/chatbot-education' },
    { title: 'Feedback Provision', Icon: LightBulbIcon, link: '/feedback-dashboard' },
    { title: 'Question Generation', Icon: SparklesIcon, link: '/ai-generated-questions' },
    { title: 'News', Icon: UsersIcon, link: '/educational-news' },
    { title: 'Suggestions to Students', Icon: EnvelopeIcon, link: '/suggestions-to-students' },
    { title: 'Meeting Hosting', Icon: VideoCameraIcon, link: '/meeting-host' },
    { title: 'Collaboration', Icon: UserGroupIcon, link: '/collaboration-hub' },
    { title: 'Announcements', Icon: MegaphoneIcon, link: '/announcements' },
    { title: 'Upgrade to Pro', Icon: SparklesIcon, link: '/pricing' },
  ];

  const menuItems = role === 'student' ? studentMenu : educatorMenu;

  const barChartData = {
    labels: ['Math', 'Science', 'History', 'English', 'Art'],
    datasets: [
      {
        label: 'Average Score',
        data: [85, 78, 92, 88, 95],
        backgroundColor: '#4F46E5',
        borderColor: '#3730A3',
        borderWidth: 1,
      },
    ],
  };
  const handleLogout = () => {
    // Add actual logout logic here
    navigate('/login');
  };

  const toggleTaskCompletion = (taskId) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col overflow-x-hidden">
      {/* Collapsible Sidebar (Overlay on Mobile) */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 sm:w-72 bg-gray-800 border-r border-gray-700/50 transform transition-transform duration-300 ease-in-out z-50 flex flex-col md:w-64 md:static md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 sm:p-6 relative">
            <div className="absolute w-32 h-32 bg-indigo-500/10 rounded-full -top-16 -right-16" />
            <div className="absolute w-48 h-48 bg-purple-500/10 rounded-full -bottom-24 -left-24" />
            <div className="flex items-center gap-3 mb-6 sm:mb-8 relative">
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="absolute -right-3 top-0 p-1.5 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors md:hidden"
              >
                <ChevronLeftIcon className="w-5 h-5 text-gray-400" />
              </button>
              <SparklesIcon className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-400 animate-pulse" />
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                SPARK-IQ
              </h1>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-4">
            <nav>
              <ul className="space-y-1">
                {menuItems.map((item, index) => (
                  <li key={index}>
                    <Link
                      to={item.link}
                      className={`flex items-center gap-3 p-3 text-gray-300 hover:bg-gray-700/50 rounded-lg transition-all duration-300 group hover:translate-x-1 text-sm sm:text-base ${
                        item.title === 'Upgrade to Pro'
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 hover:shadow-lg hover:scale-105'
                          : ''
                      }`}
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      <item.Icon className="w-5 h-5 text-indigo-400 group-hover:text-purple-400 transition-colors" />
                      <span>{item.title}</span>
                      <ArrowRightCircleIcon className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
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
        className={`flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto relative transition-all duration-300 ${
          isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'
        }`}
      >
        {/* Mobile Header with Hamburger Menu */}
        <header className="flex items-center justify-between mb-6 md:mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors md:hidden"
            >
              <Bars3Icon className="w-6 h-6 text-gray-400" />
            </button>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Welcome Back,
              </span>
              <br />
              {role === 'student' ? 'Future Innovator' : 'Mentor Extraordinaire'}!
            </h2>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-40 sm:w-48 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-800 rounded-lg text-xs sm:text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 hover:bg-gray-800 rounded-full transition-colors relative"
              >
                <BellIcon className="w-5 sm:w-6 h-5 sm:h-6 text-gray-400" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              {isNotificationsOpen && <Notifications />}
            </div>
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 hover:bg-gray-800 p-2 rounded-full transition-colors"
              >
                <UserCircleIcon className="w-7 sm:w-8 h-7 sm:h-8 text-gray-400" />
                <ChevronDownIcon className="w-3 sm:w-4 h-3 sm:h-4 text-gray-400" />
              </button>
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-40 sm:w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50">
                  <div className="p-3 sm:p-4 border-b border-gray-700">
                    <p className="text-white font-medium text-sm sm:text-base">John Doe</p>
                    <p className="text-xs sm:text-sm text-gray-400">{role}@sparkiq.com</p>
                  </div>
                  <div className="p-2">
                    <button className="w-full text-left p-2 text-gray-300 hover:bg-gray-700 rounded-md text-sm sm:text-base">
                      Profile
                    </button>
                    <button className="w-full text-left p-2 text-gray-300 hover:bg-gray-700 rounded-md text-sm sm:text-base">
                      Settings
                    </button>
                    <button className="w-full text-left p-2 text-red-400 hover:bg-gray-700 rounded-md text-sm sm:text-base">
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <p className="text-gray-400 text-sm sm:text-base md:text-lg mb-6 md:mb-8">
          {role === 'student'
            ? 'Your learning journey at a glance 📚✨'
            : 'Shaping minds, changing lives 💡'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {[
            { title: 'Total Assignments', value: '12', icon: ClipboardDocumentIcon, trend: '+2' },
            { title: 'Attendance', value: '95%', icon: ChartBarIcon, status: 'On track' },
            { title: 'Performance', value: 'A+', icon: TrophyIcon, status: 'Top 10%' },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 sm:p-6 rounded-xl border border-gray-700/50 relative overflow-hidden hover:scale-[1.02] transition-transform duration-300"
            >
              <div className="absolute top-0 right-0 w-12 sm:w-16 h-12 sm:h-16 bg-indigo-500/10 rounded-bl-full" />
              <stat.icon className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-400 mb-3 sm:mb-4" />
              <h3 className="text-gray-400 text-xs sm:text-sm mb-1">{stat.title}</h3>
              <div className="flex items-baseline gap-2 sm:gap-3">
                <p className="text-xl sm:text-2xl font-bold text-white">{stat.value}</p>
                {stat.trend && (
                  <span className="text-xs sm:text-sm bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                    {stat.trend}
                  </span>
                )}
              </div>
              {stat.status && (
                <p className="text-xs sm:text-sm text-gray-400 mt-1 sm:mt-2">{stat.status}</p>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 p-4 sm:p-6 rounded-xl border border-gray-700/50 h-full">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <ClipboardDocumentIcon className="w-6 h-6 sm:w-7 sm:h-7 text-blue-400" />
                <h3 className="text-lg sm:text-xl font-semibold text-white">Task Management</h3>
              </div>
              <div className="space-y-3 sm:space-y-4">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center p-3 sm:p-4 bg-gray-900/30 rounded-lg hover:bg-gray-800/50 transition-all duration-300"
                  >
                    <button
                      onClick={() => toggleTaskCompletion(task.id)}
                      className="p-1 sm:p-2 rounded-full hover:bg-gray-700 transition-colors"
                    >
                      <CheckCircleIcon
                        className={`w-5 h-5 sm:w-6 sm:h-6 ${
                          task.completed ? 'text-green-400' : 'text-gray-400'
                        }`}
                      />
                    </button>
                    <div className="flex-1 ml-3 sm:ml-4">
                      <p
                        className={`text-sm sm:text-lg ${
                          task.completed ? 'line-through text-gray-400' : 'text-white'
                        }`}
                      >
                        {task.title}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-400 mt-1">Due: {task.dueDate}</p>
                    </div>
                    <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-gray-800/50 p-4 sm:p-6 rounded-xl border border-gray-700/50">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <TrophyIcon className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-400" />
                <h3 className="text-lg sm:text-xl font-semibold text-white">Leaderboard</h3>
              </div>
              <div className="space-y-3 sm:space-y-4">
                {leaderboardData.map((entry) => (
                  <div
                    key={entry.rank}
                    className="flex items-center p-3 sm:p-4 bg-gray-900/30 rounded-lg hover:bg-gray-800/50 transition-all duration-300"
                  >
                    <span className="text-lg sm:text-xl font-bold text-yellow-400 w-8 sm:w-10">
                      {entry.rank}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm sm:text-base text-white">{entry.name}</p>
                      <p className="text-xs sm:text-sm text-gray-400">{entry.points} points</p>
                    </div>
                    <StarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-800/50 p-4 sm:p-6 rounded-xl border border-gray-700/50">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <GiftIcon className="w-6 h-6 sm:w-7 sm:h-7 text-purple-400" />
                <h3 className="text-lg sm:text-xl font-semibold text-white">Achievements</h3>
              </div>
              <div className="space-y-3 sm:space-y-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-center p-3 sm:p-4 bg-gray-900/30 rounded-lg hover:bg-gray-800/50 transition-all duration-300"
                  >
                    <div className="flex-1">
                      <p className="text-sm sm:text-base text-white">{achievement.title}</p>
                      <p className="text-xs sm:text-sm text-gray-400">{achievement.description}</p>
                    </div>
                    {achievement.unlocked ? (
                      <CheckCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                    ) : (
                      <span className="text-xs sm:text-sm text-gray-400">Locked</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-800/50 p-4 sm:p-6 rounded-xl border border-gray-700/50">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <StarIcon className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-400" />
                <h3 className="text-lg sm:text-xl font-semibold text-white">Points System</h3>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-3xl sm:text-4xl font-bold text-yellow-400 mb-3 sm:mb-4">
                  {points}
                </div>
                <button className="w-full py-2 sm:py-3 bg-indigo-500/90 rounded-xl text-white hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base">
                  <GiftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  Redeem Rewards
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-gray-800/50 p-4 sm:p-6 rounded-xl border border-gray-700/50 hover:border-indigo-400/30 transition-all duration-500 hover:shadow-xl">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <PresentationChartLineIcon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400 animate-pulse" />
                <h3 className="text-base sm:text-lg font-semibold text-white">Assignment Progress</h3>
              </div>
              <div className="relative h-64 sm:h-80">
                <LineChart />
              </div>
            </div>
            <div className="bg-gray-800/50 p-4 sm:p-6 rounded-xl border border-gray-700/50 hover:border-indigo-400/30 transition-all duration-500 hover:shadow-xl">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <ChartBarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400 animate-pulse" />
                <h3 className="text-base sm:text-lg font-semibold text-white">Subject Performance</h3>
              </div>
              <div className="relative h-64 sm:h-80">
                <BarChart data={barChartData} />
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-800/50 to-transparent pointer-events-none" />
              </div>
            </div>
          </div>
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-gray-800/50 p-4 sm:p-6 rounded-xl border border-gray-700/50 hover:border-indigo-400/30 transition-all duration-500 hover:shadow-xl">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <AcademicCapIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-400 animate-pulse" />
                <h3 className="text-base sm:text-lg font-semibold text-white">Grade Distribution</h3>
              </div>
              <div className="relative h-64 sm:h-80">
                <PieChart />
              </div>
            </div>
            <div className="hidden md:block">
              <SimpleCalendar />
            </div>
          </div>
        </div>
        <div className="bg-gray-800/50 p-4 sm:p-6 rounded-xl border border-gray-700/50">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <ClipboardDocumentIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
            <h3 className="text-base sm:text-lg font-semibold text-white">Recent Activity</h3>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {[
              { activity: 'Submitted Math Assignment', date: '2023-10-15', status: 'Completed', icon: '📘' },
              { activity: 'Joined Virtual Classroom', date: '2023-10-14', status: 'Ongoing', icon: '🎥' },
              { activity: 'Received Feedback', date: '2023-10-13', status: 'Pending Review', icon: '💡' },
              { activity: 'Started New Course', date: '2023-10-12', status: 'In Progress', icon: '🚀' },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center p-3 sm:p-4 bg-gray-900/30 rounded-lg hover:bg-gray-800/50 transition-colors group"
              >
                <span className="text-xl sm:text-2xl mr-3 sm:mr-4">{item.icon}</span>
                <div className="flex-1">
                  <p className="text-sm sm:text-base text-white">{item.activity}</p>
                  <p className="text-xs sm:text-sm text-gray-400">{item.date}</p>
                </div>
                <span
                  className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm ${
                    item.status === 'Completed'
                      ? 'bg-green-500/20 text-green-400'
                      : item.status === 'Ongoing'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-purple-500/20 text-purple-400'
                  }`}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700/50 p-2 md:hidden">
          <div className="flex justify-around items-center">
            <button className="p-2 hover:bg-gray-700 rounded-full transition-colors">
              <ClipboardDocumentIcon className="w-6 h-6 text-gray-400" />
            </button>
            <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-2 hover:bg-gray-700 rounded-full transition-colors relative"
            >
              <BellIcon className="w-6 h-6 text-gray-400" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            >
              <UserCircleIcon className="w-6 h-6 text-gray-400" />
            </button>
          </div>
        </nav>

        {/* Mobile Profile Dropdown */}
        {isProfileOpen && (
          <ProfileDropdown 
            role={role}
            onClose={() => setIsProfileOpen(false)}
            handleLogout={handleLogout}
          />
        )}
      </main>
    </div>
  );
};

// Desktop Dashboard Component (Original Desktop-Optimized Version)
const DesktopDashboard = ({ role }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Complete Math Assignment', dueDate: '2023-10-20', completed: false },
    { id: 2, title: 'Prepare for Science Quiz', dueDate: '2023-10-22', completed: true },
    { id: 3, title: 'Submit History Project', dueDate: '2023-10-25', completed: false },
    { id: 4, title: 'Read Chapter 5 of Biology', dueDate: '2023-10-21', completed: false },
    { id: 5, title: 'Solve 10 Math Problems', dueDate: '2023-10-23', completed: false },
    { id: 6, title: 'Write Essay on Climate Change', dueDate: '2023-10-24', completed: true },
    { id: 7, title: 'Attend Virtual Lab Session', dueDate: '2023-10-26', completed: false },
    { id: 8, title: 'Revise Chemistry Formulas', dueDate: '2023-10-27', completed: false },
    { id: 9, title: 'Complete Geography Map Work', dueDate: '2023-10-28', completed: false },
    { id: 10, title: 'Prepare for English Presentation', dueDate: '2023-10-29', completed: false },
  ]);
  const [leaderboardData, setLeaderboardData] = useState([
    { rank: 1, name: 'Alice', points: 1200 },
    { rank: 2, name: 'Bob', points: 1100 },
    { rank: 3, name: 'Charlie', points: 1000 },
    { rank: 4, name: 'David', points: 950 },
  ]);
  const [achievements, setAchievements] = useState([
    {
      id: 1,
      title: 'Top Performer',
      description: 'Achieved top 10% in class',
      unlocked: true,
    },
    {
      id: 2,
      title: 'Consistent Learner',
      description: 'Completed 10 assignments in a row',
      unlocked: false,
    },
    {
      id: 3,
      title: 'Quiz Master',
      description: 'Scored 100% in 5 quizzes',
      unlocked: false,
    },
  ]);
  const [points, setPoints] = useState(850);

  const studentMenu = [
    { title: 'Resources', Icon: FolderIcon, link: '/resource-utilization' },
    { title: 'Attendance', Icon: ChartBarIcon, link: '/attendance-monitoring' },
    { title: 'Assignments', Icon: ClipboardDocumentIcon, link: '/assignment-submission' },
    { title: 'Grades', Icon: PresentationChartLineIcon, link: '/grading-access' },
    { title: 'Ask Sparky', Icon: ChatBubbleLeftRightIcon, link: '/chatbot-access' },
    { title: 'Feedback', Icon: LightBulbIcon, link: '/personalized-feedback' },
    { title: 'Questions', Icon: SparklesIcon, link: '/ai-generated-questions' },
    { title: 'News', Icon: UsersIcon, link: '/educational-news' },
    { title: 'Smart Review', Icon: UsersIcon, link: '/smart-review' },
    { title: 'Meetings', Icon: VideoCameraIcon, link: '/meeting-participation' },
    { title: 'Social', Icon: ChatBubbleLeftRightIcon, link: '/chat-functionality' },
    { title: 'Inbox', Icon: EnvelopeIcon, link: '/inbox-for-suggestions' },
    { title: 'Upgrade to Pro', Icon: SparklesIcon, link: '/pricing' },
  ];

  const educatorMenu = [
    { title: 'Assignment Management', Icon: ClipboardDocumentIcon, link: '/assignment-management' },
    { title: 'Grading System', Icon: AcademicCapIcon, link: '/grading-system' },
    { title: 'Attendance Tracking', Icon: ChartBarIcon, link: '/attendance-tracking' },
    { title: 'Chatbot Interaction', Icon: ChatBubbleLeftRightIcon, link: '/chatbot-education' },
    { title: 'Feedback Provision', Icon: LightBulbIcon, link: '/feedback-provision' },
    { title: 'Question Generation', Icon: SparklesIcon, link: '/question-generation' },
    { title: 'Suggestions to Students', Icon: EnvelopeIcon, link: '/suggestions-to-students' },
    { title: 'Meeting Hosting', Icon: VideoCameraIcon, link: '/meeting-hosting' },
    { title: 'Collaboration', Icon: UserGroupIcon, link: '/collaboration' },
    { title: 'Announcements', Icon: MegaphoneIcon, link: '/announcements' },
  ];

  const menuItems = role === 'student' ? studentMenu : educatorMenu;

  const barChartData = {
    labels: ['Math', 'Science', 'History', 'English', 'Art'],
    datasets: [
      {
        label: 'Average Score',
        data: [85, 78, 92, 88, 95],
        backgroundColor: '#4F46E5',
        borderColor: '#3730A3',
        borderWidth: 1,
      },
    ],
  };
  const handleLogout = () => {
    // Add actual logout logic here
    navigate('/login');
  };

  const toggleTaskCompletion = (taskId) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-gray-800 border-r border-gray-700/50 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } z-50 flex flex-col`}
      >
        <div className="h-full flex flex-col">
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
              <SparklesIcon className="w-8 h-8 text-indigo-400 animate-pulse" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                SPARK-IQ
              </h1>
            </div>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <div className="flex-1 overflow-y-auto px-6 pb-4">
              <nav>
                <ul className="space-y-1">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      <Link
                        to={item.link}
                        className={`flex items-center gap-3 p-3 text-gray-300 hover:bg-gray-700/50 rounded-lg transition-all duration-300 group hover:translate-x-1 ${
                          item.title === 'Upgrade to Pro'
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 hover:shadow-lg hover:scale-105'
                            : ''
                        }`}
                      >
                        <item.Icon className="w-5 h-5 text-indigo-400 group-hover:text-purple-400 transition-colors" />
                        <span>{item.title}</span>
                        <ArrowRightCircleIcon className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </aside>
      <main
        className={`flex-1 p-8 overflow-y-auto relative transition-margin duration-300 ${
          isSidebarOpen ? 'ml-64' : 'ml-0'
        }`}
      >
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="fixed left-4 top-4 z-40 p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Bars3Icon className="w-6 h-6 text-gray-400" />
          </button>
        )}
        <div className="absolute right-8 top-8 flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-48 px-4 py-2 bg-gray-800 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-2 hover:bg-gray-800 rounded-full transition-colors relative"
            >
              <BellIcon className="w-6 h-6 text-gray-400" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            {isNotificationsOpen && <Notifications />}
          </div>
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 hover:bg-gray-800 p-2 rounded-full transition-colors"
            >
              <UserCircleIcon className="w-8 h-8 text-gray-400" />
              <ChevronDownIcon className="w-4 h-4 text-gray-400" />
            </button>
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50">
                <div className="p-4 border-b border-gray-700">
                  <p className="text-white font-medium">John Doe</p>
                  <p className="text-sm text-gray-400">{role}@sparkiq.com</p>
                </div>
                <div className="p-2">
                  <Link
                    to="/profile"
                    className="w-full text-left p-2 text-gray-300 hover:bg-gray-700 rounded-md block"
                  >
                    Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="w-full text-left p-2 text-gray-300 hover:bg-gray-700 rounded-md block"
                  >
                    Settings
                  </Link>
                  <button className="w-full text-left p-2 text-red-400 hover:bg-gray-700 rounded-md">
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <header className="mb-8 max-w-2xl">
          <h2 className="text-4xl font-bold text-white mb-3">
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Welcome Back,
            </span>
            <br />
            {role === 'student' ? 'Future Innovator' : 'Mentor Extraordinaire'}!
          </h2>
          <p className="text-gray-400 text-lg">
            {role === 'student'
              ? 'Your learning journey at a glance 📚✨'
              : 'Shaping minds, changing lives 💡'}
          </p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { title: 'Total Assignments', value: '12', icon: ClipboardDocumentIcon, trend: '+2' },
            { title: 'Attendance', value: '95%', icon: ChartBarIcon, status: 'On track' },
            { title: 'Performance', value: 'A+', icon: TrophyIcon, status: 'Top 10%' },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700/50 relative overflow-hidden hover:scale-[1.02] transition-transform duration-300"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/10 rounded-bl-full" />
              <stat.icon className="w-10 h-10 text-indigo-400 mb-4" />
              <h3 className="text-gray-400 text-sm mb-1">{stat.title}</h3>
              <div className="flex items-baseline gap-3">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                {stat.trend && (
                  <span className="text-sm bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                    {stat.trend}
                  </span>
                )}
              </div>
              {stat.status && <p className="text-sm text-gray-400 mt-2">{stat.status}</p>}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 h-full">
              <div className="flex items-center gap-3 mb-6">
                <ClipboardDocumentIcon className="w-7 h-7 text-blue-400" />
                <h3 className="text-xl font-semibold text-white">Task Management</h3>
              </div>
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center p-4 bg-gray-900/30 rounded-lg hover:bg-gray-800/50 transition-all duration-300"
                  >
                    <button
                      onClick={() => toggleTaskCompletion(task.id)}
                      className="p-2 rounded-full hover:bg-gray-700 transition-colors"
                    >
                      <CheckCircleIcon
                        className={`w-6 h-6 ${task.completed ? 'text-green-400' : 'text-gray-400'}`}
                      />
                    </button>
                    <div className="flex-1 ml-4">
                      <p className={`text-lg ${task.completed ? 'line-through text-gray-400' : 'text-white'}`}>
                        {task.title}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">Due: {task.dueDate}</p>
                    </div>
                    <CalendarIcon className="w-6 h-6 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
              <div className="flex items-center gap-3 mb-6">
                <TrophyIcon className="w-7 h-7 text-yellow-400" />
                <h3 className="text-xl font-semibold text-white">Leaderboard</h3>
              </div>
              <div className="space-y-4">
                {leaderboardData.map((entry) => (
                  <div
                    key={entry.rank}
                    className="flex items-center p-4 bg-gray-900/30 rounded-lg hover:bg-gray-800/50 transition-all duration-300"
                  >
                    <span className="text-xl font-bold text-yellow-400 w-10">{entry.rank}</span>
                    <div className="flex-1">
                      <p className="text-white">{entry.name}</p>
                      <p className="text-sm text-gray-400">{entry.points} points</p>
                    </div>
                    <StarIcon className="w-6 h-6 text-yellow-400" />
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
              <div className="flex items-center gap-3 mb-6">
                <GiftIcon className="w-7 h-7 text-purple-400" />
                <h3 className="text-xl font-semibold text-white">Achievements</h3>
              </div>
              <div className="space-y-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-center p-4 bg-gray-900/30 rounded-lg hover:bg-gray-800/50 transition-all duration-300"
                  >
                    <div className="flex-1">
                      <p className="text-white">{achievement.title}</p>
                      <p className="text-sm text-gray-400">{achievement.description}</p>
                    </div>
                    {achievement.unlocked ? (
                      <CheckCircleIcon className="w-6 h-6 text-green-400" />
                    ) : (
                      <span className="text-sm text-gray-400">Locked</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
              <div className="flex items-center gap-3 mb-6">
                <StarIcon className="w-7 h-7 text-yellow-400" />
                <h3 className="text-xl font-semibold text-white">Points System</h3>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-4xl font-bold text-yellow-400 mb-4">{points}</div>
                <button className="w-full py-3 bg-indigo-500/90 rounded-xl text-white hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2">
                  <GiftIcon className="w-5 h-5" />
                  Redeem Rewards
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="space-y-6">
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 hover:border-indigo-400/30 transition-all duration-500 hover:shadow-xl h-[500px]">
              <div className="flex items-center gap-3 mb-6">
                <PresentationChartLineIcon className="w-6 h-6 text-purple-400 animate-pulse" />
                <h3 className="text-lg font-semibold text-white">Assignment Progress</h3>
              </div>
              <LineChart />
            </div>
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 hover:border-indigo-400/30 transition-all duration-500 hover:shadow-xl h-[530px]">
              <div className="flex items-center gap-3 mb-4">
                <ChartBarIcon className="w-6 h-6 text-cyan-400 animate-pulse" />
                <h3 className="text-lg font-semibold text-white">Subject Performance</h3>
              </div>
              <div className="relative h-64">
                <BarChart data={barChartData} />
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-800/50 to-transparent pointer-events-none" />
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 hover:border-indigo-400/30 transition-all duration-500 hover:shadow-xl h-[700px]">
              <div className="flex items-center gap-3 mb-6">
                <AcademicCapIcon className="w-6 h-6 text-green-400 animate-pulse" />
                <h3 className="text-lg font-semibold text-white">Grade Distribution</h3>
              </div>
              <PieChart />
            </div>
            <SimpleCalendar />
          </div>
        </div>
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
          <div className="flex items-center gap-3 mb-6">
            <ClipboardDocumentIcon className="w-6 h-6 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
          </div>
          <div className="space-y-4">
            {[
              { activity: 'Submitted Math Assignment', date: '2023-10-15', status: 'Completed', icon: '📘' },
              { activity: 'Joined Virtual Classroom', date: '2023-10-14', status: 'Ongoing', icon: '🎥' },
              { activity: 'Received Feedback', date: '2023-10-13', status: 'Pending Review', icon: '💡' },
              { activity: 'Started New Course', date: '2023-10-12', status: 'In Progress', icon: '🚀' },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center p-4 bg-gray-900/30 rounded-lg hover:bg-gray-800/50 transition-colors group"
              >
                <span className="text-2xl mr-4">{item.icon}</span>
                <div className="flex-1">
                  <p className="text-white">{item.activity}</p>
                  <p className="text-sm text-gray-400">{item.date}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    item.status === 'Completed'
                      ? 'bg-green-500/20 text-green-400'
                      : item.status === 'Ongoing'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-purple-500/20 text-purple-400'
                  }`}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

// Parent Dashboard Component (Conditionally Renders Mobile or Desktop)
const Dashboard = ({ role }) => {
  const isDesktop = useMediaQuery({ minWidth: 768 }); // Use md breakpoint (768px)

  return isDesktop ? <DesktopDashboard role={role} /> : <MobileDashboard role={role} />;
};

export default Dashboard;