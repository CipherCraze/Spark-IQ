import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import { auth } from '../../firebase/firebaseConfig';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { getUserProfile } from '../../firebase/userOperations'; // Assuming this path is correct
import {
  ClipboardDocumentIcon,
  AcademicCapIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  LightBulbIcon, 
  VideoCameraIcon,
  UserGroupIcon as SolidUserGroupIcon, 
  MegaphoneIcon,
  EnvelopeIcon,
  SparklesIcon,
  ChevronDownIcon,
  ArrowRightCircleIcon,
  BellIcon,
  Bars3Icon,
  ChevronLeftIcon,
  ChartPieIcon,
  UserCircleIcon,
  UsersIcon, 
  FolderIcon,
  BookOpenIcon,
  PresentationChartLineIcon,
  GlobeAltIcon, 
  Cog6ToothIcon, 
  ArrowLeftOnRectangleIcon, 
} from '@heroicons/react/24/outline';
import { BarChart, LineChart, DonutChart } from '../Charts.jsx'; // Assuming path is correct

// --- Desktop Educator Dashboard ---
const DesktopEducatorDashboard = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const navigate = useNavigate();

  const [educator, setEducator] = useState(null);
  const [isLoadingEducator, setIsLoadingEducator] = useState(true);

  const [classes] = useState([
    { id: 1, name: 'Quantum Mechanics', students: 25, progress: 78, color: 'purple' },
    { id: 2, name: 'Calculus II', students: 32, progress: 92, color: 'blue' },
    { id: 3, name: 'Data Structures & Algorithms', students: 40, progress: 85, color: 'green' },
  ]);

  const [recentSubmissions] = useState([
    { id: 1, course: 'Calculus II', student: 'Elena Rodriguez', status: 'Graded', time: '1h ago', grade: 'A' },
    { id: 2, course: 'Data Structures', student: 'Kenji Tanaka', status: 'Pending', time: '3h ago', grade: null },
    { id: 3, course: 'Quantum Mechanics', student: 'Aisha Khan', status: 'Needs Review', time: '5h ago', grade: 'B+' },
  ]);

  const [performanceMetrics] = useState({
    attendance: { current: 94, previous: 90 },
    grades: { average: 87, trend: 'up' },
    engagement: { rating: 4.7, trend: 'stable' }
  });

  const educatorSidebarMenu = [
    { title: 'Dashboard', Icon: PresentationChartLineIcon, link: '/educator-dashboard', current: true },
    { title: 'Assignments', Icon: ClipboardDocumentIcon, link: '/assignment-management' },
    { title: 'Grades & Analytics', Icon: AcademicCapIcon, link: '/GradesAndAnalytics' },
    { title: 'Resources', Icon: FolderIcon, link: '/resource-management' },
    { title: 'Attendance', Icon: ChartBarIcon, link: '/attendance-tracking' },
    { title: 'AI Chatbot (Ask Sparky)', Icon: ChatBubbleLeftRightIcon, link: '/chatbot-education' },
    { title: 'AI Questions', Icon: SparklesIcon, link: '/ai-generated-questions' },
    { title: 'Social / Chat', Icon: SolidUserGroupIcon, link: '/chat-functionality' },
    { title: 'Educational News', Icon: GlobeAltIcon, link: '/educational-news' },
    { title: 'Student Suggestions', Icon: EnvelopeIcon, link: '/suggestions-to-students' },
    { title: 'Meetings & Conferences', Icon: VideoCameraIcon, link: '/meeting-host' },
    { title: 'Announcements', Icon: MegaphoneIcon, link: '/announcements' },
    { title: 'Upgrade to Pro', Icon: SparklesIcon, link: '/pricing', special: true },
  ];

  const dashboardQuickActions = [
    { title: 'Assignments', Icon: ClipboardDocumentIcon, link: '/assignment-management', color: 'purple' },
    { title: 'Grades & Analytics', Icon: AcademicCapIcon, link: '/GradesAndAnalytics', color: 'blue' },
    { title: 'Resources', Icon: FolderIcon, link: '/resource-management', color: 'green' },
    { title: 'Attendance', Icon: ChartBarIcon, link: '/attendance-tracking', color: 'indigo' },
    { title: 'Ask Sparky', Icon: ChatBubbleLeftRightIcon, link: '/chatbot-education', color: 'pink' },
    { title: 'AI Questions', Icon: SparklesIcon, link: '/ai-generated-questions', color: 'yellow' },
    { title: 'Social / Chat', Icon: SolidUserGroupIcon, link: '/chat-functionality', color: 'teal' },
    { title: 'Educational News', Icon: GlobeAltIcon, link: '/educational-news', color: 'cyan' },
    { title: 'Student Suggestions', Icon: EnvelopeIcon, link: '/suggestions-to-students', color: 'lime' },
    { title: 'Host Meeting', Icon: VideoCameraIcon, link: '/meeting-host', color: 'red' },
    { title: 'Announcements', Icon: MegaphoneIcon, link: '/announcements', color: 'orange' },
  ];

  const performanceChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Avg. Student Performance',
        data: [75, 82, 79, 88, 85, 90],
        borderColor: '#8B5CF6', 
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        tension: 0.4,
        pointBackgroundColor: '#8B5CF6',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#8B5CF6',
      },
    ],
  };

  const attendanceData = {
    labels: ['Present', 'Absent', 'Excused'],
    datasets: [{
      data: [94, 4, 2],
      backgroundColor: ['#60A5FA', '#F87171', '#FBBF24'],
      borderColor: ['#3B82F6', '#EF4444', '#F59E0B'],
      borderWidth: 1,
    }]
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          setIsLoadingEducator(true);
          const profileData = await getUserProfile(user.uid);
          if (profileData) {
            setEducator(profileData);
            localStorage.setItem('profileUser', JSON.stringify(profileData));
          } else {
            const basicProfile = { uid: user.uid, email: user.email, name: user.displayName || "Educator", role: 'educator' };
            setEducator(basicProfile);
          }
        } catch (error) {
          console.error('Error fetching educator profile:', error);
          navigate('/login'); 
        } finally {
          setIsLoadingEducator(false);
        }
      } else {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('profileUser');
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Graded': return 'bg-green-500/20 text-green-400 border border-green-500/30';
      case 'Pending': return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
      case 'Needs Review': return 'bg-red-500/20 text-red-400 border border-red-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border border-slate-500/30';
    }
  };
  
  const getProgressColor = (colorName) => {
    switch(colorName) {
      case 'purple': return 'from-purple-500 to-indigo-600';
      case 'blue': return 'from-blue-500 to-sky-500';
      case 'green': return 'from-green-500 to-emerald-500';
      default: return 'from-slate-500 to-slate-600';
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-gray-900 flex text-slate-100 overflow-x-hidden">
      {/* --- Sidebar --- */}
      <aside className={`fixed top-0 left-0 h-screen w-64 bg-slate-800/70 backdrop-blur-2xl border-r border-slate-700/50 transform transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } z-50 flex flex-col shadow-2xl`}>
        <div className="p-5 border-b border-slate-700/50">
          <Link to="/educator-dashboard" className="flex items-center gap-3 group">
            <GlobeAltIcon className="w-10 h-10 text-purple-500 group-hover:text-purple-400 transition-all duration-300 transform group-hover:rotate-[20deg] group-hover:scale-110" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
              SPARK-IQ
            </h1>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
          {educatorSidebarMenu.map((item) => (
            <Link
              key={item.title}
              to={item.link}
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
        <div className="p-4 border-t border-slate-700/50">
            <Link
              to="/educator-settings"
              className="group flex items-center gap-3 px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-700/60 hover:text-purple-300 rounded-lg transition-colors"
            >
              <Cog6ToothIcon className="w-5 h-5 text-slate-400 group-hover:text-purple-300" />
              Settings
            </Link>
             <button
              onClick={handleLogout}
              className="group flex items-center gap-3 w-full mt-2 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-lg transition-colors"
            >
              <ArrowLeftOnRectangleIcon className="w-5 h-5 text-red-500 group-hover:text-red-400" />
              Logout
            </button>
        </div>
      </aside>

      {/* --- Main Content --- */}
      <main className={`flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto transition-all duration-300 ${
        isSidebarOpen ? 'ml-64' : 'ml-0'
      }`}>
        {/* Header */}
        <header className="flex justify-between items-center mb-8 sm:mb-12">
          <div className="flex items-center gap-3">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2.5 bg-slate-800/60 hover:bg-slate-700/80 rounded-lg shadow-sm hover:shadow-md transition-all md:hidden"
                aria-label="Open sidebar"
              >
                <Bars3Icon className="w-6 h-6 text-slate-300" />
              </button>
            )}
             <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2.5 bg-slate-800/60 hover:bg-slate-700/80 rounded-lg shadow-sm hover:shadow-md transition-all hidden md:block"
              aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              {isSidebarOpen ? <ChevronLeftIcon className="w-6 h-6 text-slate-300" /> : <Bars3Icon className="w-6 h-6 text-slate-300" /> }
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text">
                {isLoadingEducator ? 'Loading...' : `${educator?.name || "Educator"}'s Dashboard`}
              </h1>
              <p className="text-slate-400 text-sm sm:text-base">Welcome back! Let's empower learning today.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2.5 hover:bg-slate-700/50 rounded-full transition-colors relative focus:outline-none focus:ring-2 focus:ring-purple-500"
                aria-label="Notifications"
              >
                <BellIcon className="w-6 h-6 text-slate-400 hover:text-slate-200" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-800 animate-pulse"></span>
              </button>
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-slate-800/95 backdrop-blur-xl rounded-xl shadow-2xl border border-slate-700/60 z-50 overflow-hidden">
                  <div className="p-4 border-b border-slate-700/60">
                    <h3 className="text-base font-semibold text-white">Notifications</h3>
                  </div>
                  <div className="p-2 max-h-72 overflow-y-auto custom-scrollbar">
                    <div className="p-3 hover:bg-slate-700/50 rounded-lg cursor-pointer">
                        <p className="text-sm text-slate-100">New submission in <span className="font-semibold text-purple-300">Calculus II</span>.</p>
                        <p className="text-xs text-slate-400 mt-0.5">2 minutes ago</p>
                    </div>
                     <div className="p-3 hover:bg-slate-700/50 rounded-lg cursor-pointer">
                        <p className="text-sm text-slate-100">AI Question generation complete for <span className="font-semibold text-purple-300">Quantum Mechanics</span>.</p>
                        <p className="text-xs text-slate-400 mt-0.5">15 minutes ago</p>
                    </div>
                    <p className="text-slate-400 text-sm text-center py-4">No more notifications.</p>
                  </div>
                   <Link to="#" className="block text-center py-3 text-sm text-purple-400 hover:bg-slate-700/70 border-t border-slate-700/60 transition-colors">View All Notifications</Link>
                </div>
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 hover:bg-slate-700/50 p-1.5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
                aria-label="User profile"
              >
                {educator?.avatar ? (
                  <img src={educator.avatar} alt={educator.name} className="w-9 h-9 rounded-full object-cover border-2 border-purple-500/70" />
                ) : (
                  <UserCircleIcon className="w-9 h-9 text-slate-400 hover:text-slate-200" />
                )}
                <div className="hidden xl:block text-left">
                  <p className="text-white text-sm font-medium truncate max-w-[120px]">{educator?.name || "Educator"}</p>
                  <p className="text-xs text-slate-400 truncate max-w-[120px]">{educator?.education || "PhD in Education"}</p>
                </div>
                <ChevronDownIcon className="w-4 h-4 text-slate-400 hidden xl:block" />
              </button>
              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-60 bg-slate-800/95 backdrop-blur-xl rounded-xl shadow-2xl border border-slate-700/60 z-50 overflow-hidden">
                  <div className="p-3.5 border-b border-slate-700/60">
                    <p className="text-white font-semibold text-sm truncate">{educator?.name || "Educator"}</p>
                    <p className="text-xs text-slate-400 truncate">{educator?.email || "email@example.com"}</p>
                    {educator?.teachingExperience && <p className="text-xs text-slate-500 mt-1.5">{educator.teachingExperience} years experience</p>}
                  </div>
                  <div className="py-2 px-1.5">
                    <Link to="/educator-profile" className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700/60 rounded-md transition-colors" onClick={() => setIsProfileOpen(false)}>
                      <UserCircleIcon className="w-4 h-4 text-slate-400" /> Profile
                    </Link>
                    <Link to="/educator-settings" className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700/60 rounded-md transition-colors" onClick={() => setIsProfileOpen(false)}>
                      <Cog6ToothIcon className="w-4 h-4 text-slate-400" /> Settings
                    </Link>
                  </div>
                  <div className="p-1.5 border-t border-slate-700/60">
                    <button onClick={handleLogout} className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-md transition-colors">
                      <ArrowLeftOnRectangleIcon className="w-4 h-4" /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 sm:mb-10">
            <div className="bg-slate-800/60 backdrop-blur-lg p-6 sm:p-8 rounded-2xl border border-slate-700/50 shadow-xl hover:shadow-purple-500/20 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between min-h-[380px]">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3.5 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl shadow-lg">
                      <BookOpenIcon className="w-7 h-7 text-white" />
                  </div>
                  <span className="px-2.5 py-1 text-xs bg-green-500/20 text-green-300 rounded-full font-semibold border border-green-500/30">+5%</span>
                </div>
                <p className="text-slate-300 text-sm mb-1.5">Total Courses</p>
                <p className="text-4xl font-bold text-white mb-4">6</p>
              </div>
              <div className="min-h-[140px] flex-1"> <LineChart data={performanceChartData} /> </div>
            </div>

            <div className="bg-slate-800/60 backdrop-blur-lg p-6 sm:p-8 rounded-2xl border border-slate-700/50 shadow-xl hover:shadow-blue-500/20 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between min-h-[380px]">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3.5 bg-gradient-to-br from-blue-600 to-sky-600 rounded-xl shadow-lg">
                      <ChartPieIcon className="w-7 h-7 text-white" />
                  </div>
                  <span className={`px-2.5 py-1 text-xs rounded-full font-semibold border ${performanceMetrics.attendance.current > performanceMetrics.attendance.previous ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'}`}>
                      {performanceMetrics.attendance.current > performanceMetrics.attendance.previous ? '▲' : '▼'}
                      {Math.abs(performanceMetrics.attendance.current - performanceMetrics.attendance.previous)}%
                  </span>
                </div>
                <p className="text-slate-300 text-sm mb-1.5">Overall Attendance</p>
                <p className="text-4xl font-bold text-white mb-4">{performanceMetrics.attendance.current}%</p>
              </div>
              <div className="min-h-[140px] flex-1 flex items-center justify-center"> <DonutChart data={attendanceData} /> </div>
            </div>

            <div className="bg-slate-800/60 backdrop-blur-lg p-6 sm:p-8 rounded-2xl border border-slate-700/50 shadow-xl hover:shadow-green-500/20 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between min-h-[380px]">
               <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3.5 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl shadow-lg">
                    <PresentationChartLineIcon className="w-7 h-7 text-white" />
                  </div>
                  <span className={`px-2.5 py-1 text-xs rounded-full font-semibold border ${performanceMetrics.grades.trend === 'up' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'}`}>
                      {performanceMetrics.grades.trend === 'up' ? '▲ Improved' : '▼ Needs Attention'}
                  </span>
                </div>
                <p className="text-slate-300 text-sm mb-1.5">Average Grade</p>
                <p className="text-4xl font-bold text-white mb-6">{performanceMetrics.grades.average}% <span className="text-2xl text-slate-300">(B+)</span></p>
               </div>
               <div className="space-y-3.5 flex-1">
                  {classes.slice(0,2).map(cls => (
                      <div key={cls.id}>
                        <div className="flex justify-between text-xs text-slate-400 mb-1"><span>{cls.name}</span><span>{cls.progress}%</span></div>
                        <div className={`h-2.5 bg-slate-700/70 rounded-full overflow-hidden`}>
                            <div className={`h-full bg-gradient-to-r ${getProgressColor(cls.color)} rounded-full transition-all duration-700 ease-out`} style={{ width: `${cls.progress}%` }}></div>
                        </div>
                      </div>
                  ))}
                </div>
            </div>
          </div>

        {/* Quick Actions Grid */}
        <div className="mb-8 sm:mb-12">
            <h3 className="text-xl sm:text-2xl font-semibold text-white mb-5 sm:mb-7">Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
                {dashboardQuickActions.map((action) => (
                    <Link
                        key={action.title}
                        to={action.link}
                        className={`group bg-slate-800/60 backdrop-blur-lg p-4 sm:p-5 rounded-xl border border-slate-700/50 hover:border-purple-500/70 
                                   transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 transform
                                   flex flex-col items-center text-center aspect-[4/3.5] justify-center`}
                    >
                        <div className={`mb-3 p-3.5 rounded-full bg-gradient-to-br from-${action.color}-500/40 to-${action.color}-600/40 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-${action.color}-500/30 group-hover:from-${action.color}-500/60 group-hover:to-${action.color}-600/60`}>
                             <action.Icon className={`w-7 h-7 sm:w-8 sm:h-8 text-${action.color}-300 transition-colors group-hover:text-white`} />
                        </div>
                        <span className="text-sm sm:text-base font-medium text-slate-100 group-hover:text-purple-300 transition-colors">{action.title}</span>
                    </Link>
                ))}
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Your Classes */}
          <div className="lg:col-span-2 bg-slate-800/60 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-xl">
            <h3 className="text-xl sm:text-2xl font-semibold text-white mb-6">Your Classes</h3>
            <div className="space-y-4 max-h-[26rem] overflow-y-auto pr-2 custom-scrollbar">
              {classes.map((cls) => (
                <div key={cls.id} className="p-4 bg-slate-900/60 rounded-xl hover:bg-slate-700/70 transition-all shadow-md group border border-transparent hover:border-purple-500/40">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-base sm:text-lg font-medium text-white group-hover:text-purple-300 transition-colors">{cls.name}</p>
                      <p className="text-slate-400 text-xs sm:text-sm">{cls.students} students</p>
                    </div>
                    <div className="w-full sm:w-auto flex items-center gap-3 sm:gap-4 mt-2 sm:mt-0">
                      <div className="relative flex-1 sm:w-32 h-2.5 bg-slate-700/70 rounded-full overflow-hidden">
                        <div className={`absolute h-full bg-gradient-to-r ${getProgressColor(cls.color)} rounded-full transition-all duration-700 ease-out`}
                             style={{ width: `${cls.progress}%` }}></div>
                      </div>
                      <span className="text-sm font-medium text-slate-200 w-10 text-right">{cls.progress}%</span>
                      <ArrowRightCircleIcon className="w-6 h-6 text-slate-500 group-hover:text-purple-400 transition-transform group-hover:translate-x-1"/>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Submissions */}
          <div className="bg-slate-800/60 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-xl">
            <h3 className="text-xl sm:text-2xl font-semibold text-white mb-6">Recent Submissions</h3>
            <div className="space-y-3.5 max-h-[26rem] overflow-y-auto pr-2 custom-scrollbar">
              {recentSubmissions.map((submission) => (
                <div key={submission.id} className="p-3.5 bg-slate-900/60 rounded-xl hover:bg-slate-700/70 transition-all shadow-md group border border-transparent hover:border-purple-500/40">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white group-hover:text-purple-300 transition-colors">{submission.course}</p>
                      <p className="text-xs text-slate-400">{submission.student}</p>
                    </div>
                    <div className="text-right">
                         <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(submission.status)}`}>
                            {submission.status} {submission.grade && `(${submission.grade})`}
                         </span>
                         <p className="text-xs text-slate-500 mt-1.5">{submission.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// --- Mobile Educator Dashboard ---
const MobileEducatorDashboard = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const [educator, setEducator] = useState(null);

  useEffect(() => {
    const profile = localStorage.getItem('profileUser');
    if (profile) setEducator(JSON.parse(profile));
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if(!user) {
        navigate('/login');
      } else {
        // Re-fetch for freshness or if local storage might be stale
        if (!profile) {
            try {
                const profileData = await getUserProfile(user.uid);
                if (profileData) {
                    setEducator(profileData);
                    localStorage.setItem('profileUser', JSON.stringify(profileData));
                } else {
                     setEducator({ uid: user.uid, email: user.email, name: user.displayName || "Educator", role: 'educator' });
                }
            } catch (error) {
                console.error("Error fetching profile on mobile:", error)
            }
        }
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const educatorSidebarMenu = [ 
    { title: 'Dashboard', Icon: PresentationChartLineIcon, link: '/educator-dashboard', current: true },
    { title: 'Assignments', Icon: ClipboardDocumentIcon, link: '/assignment-management' },
    { title: 'Grades & Analytics', Icon: AcademicCapIcon, link: '/GradesAndAnalytics' },
    { title: 'Resources', Icon: FolderIcon, link: '/resource-management' },
    { title: 'Attendance', Icon: ChartBarIcon, link: '/attendance-tracking' },
    { title: 'Ask Sparky', Icon: ChatBubbleLeftRightIcon, link: '/chatbot-education' },
    { title: 'AI Questions', Icon: SparklesIcon, link: '/ai-generated-questions' },
    { title: 'Social / Chat', Icon: SolidUserGroupIcon, link: '/chat-functionality' },
    { title: 'Educational News', Icon: GlobeAltIcon, link: '/educational-news' },
    { title: 'Suggestions', Icon: EnvelopeIcon, link: '/suggestions-to-students' },
    { title: 'Meetings', Icon: VideoCameraIcon, link: '/meeting-host' },
    { title: 'Announcements', Icon: MegaphoneIcon, link: '/announcements' },
  ];

  const mobileQuickActions = [
    { title: 'Assignments', Icon: ClipboardDocumentIcon, link: '/assignment-management', color: 'purple'},
    { title: 'Attendance', Icon: ChartBarIcon, link: '/attendance-tracking', color: 'indigo' },
    { title: 'Announce', Icon: MegaphoneIcon, link: '/announcements', color: 'orange' },
    { title: 'AI Chat', Icon: ChatBubbleLeftRightIcon, link: '/chatbot-education', color: 'pink' },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('profileUser');
      navigate('/login');
    } catch (error) { console.error('Error logging out:', error); }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col text-slate-100 overflow-x-hidden">
      {/* Mobile Sidebar (Drawer) */}
      <aside className={`fixed top-0 left-0 h-full w-72 bg-slate-800/95 backdrop-blur-xl border-r border-slate-700/60 transform transition-transform duration-300 ease-in-out z-[60] flex flex-col shadow-2xl ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
         <div className="p-5 border-b border-slate-700/60 flex justify-between items-center">
          <Link to="/educator-dashboard" className="flex items-center gap-2.5 group" onClick={() => setIsSidebarOpen(false)}>
            <GlobeAltIcon className="w-7 h-7 text-purple-400 group-hover:text-purple-300 transition-colors" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">SPARK-IQ</h1>
          </Link>
          <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-slate-400 hover:bg-slate-700/70 rounded-full">
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
          {educatorSidebarMenu.map((item) => (
            <Link
              key={item.title}
              to={item.link}
              onClick={() => setIsSidebarOpen(false)}
              className={`group flex items-center gap-3 px-3.5 py-3 text-sm font-medium rounded-lg transition-colors ${
                item.current ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md' : 'text-slate-200 hover:bg-slate-700/70 hover:text-white'
              }`}
            >
              <item.Icon className={`w-5 h-5 ${item.current ? 'text-white' : 'text-slate-400 group-hover:text-purple-300'}`} />
              {item.title}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-700/60">
            <Link to="/educator-settings" onClick={() => setIsSidebarOpen(false)} className="group flex items-center gap-2.5 p-2.5 text-sm text-slate-200 hover:bg-slate-700/70 hover:text-purple-300 rounded-lg transition-colors"><Cog6ToothIcon className="w-5 h-5 text-slate-400 group-hover:text-purple-300"/>Settings</Link>
            <button onClick={handleLogout} className="group flex items-center gap-2.5 w-full mt-1.5 p-2.5 text-sm text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-lg transition-colors"><ArrowLeftOnRectangleIcon className="w-5 h-5 text-red-500 group-hover:text-red-400"/>Logout</button>
        </div>
      </aside>
      {isSidebarOpen && <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" onClick={() => setIsSidebarOpen(false)}></div>}


      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-5 pt-[76px] sm:pt-[80px] overflow-y-auto">
        {/* Welcome Section */}
        <section className="mb-7 p-5 bg-gradient-to-br from-purple-600 via-pink-500 to-blue-600 rounded-2xl shadow-xl text-white">
            <h2 className="text-2xl font-bold">Hello, {educator?.name || "Educator"}!</h2>
            <p className="text-sm opacity-90 mt-1">Ready to inspire and educate today?</p>
        </section>
        
        {/* Quick Actions Grid for Mobile */}
        <section className="mb-7">
            <h3 className="text-lg font-semibold text-slate-100 mb-3.5">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3.5 sm:gap-4">
                {mobileQuickActions.map((action) => (
                     <Link
                        key={action.title}
                        to={action.link}
                        className={`group bg-slate-800/70 p-4 rounded-xl border border-slate-700/50 hover:border-${action.color}-500/70 hover:bg-slate-700/50
                                   transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 transform
                                   flex flex-col items-center text-center aspect-square justify-center shadow-md`}
                    >
                        <div className={`mb-2.5 p-3 rounded-full bg-gradient-to-br from-${action.color}-500/25 to-${action.color}-600/25 group-hover:from-${action.color}-500/40 group-hover:to-${action.color}-600/40 transition-all group-hover:scale-105`}>
                             <action.Icon className={`w-6 h-6 text-${action.color}-300 group-hover:text-${action.color}-200`} />
                        </div>
                        <span className={`text-xs font-medium text-slate-200 group-hover:text-${action.color}-300`}>{action.title}</span>
                    </Link>
                ))}
            </div>
        </section>

        {/* Key Stats Section */}
        <section className="mb-7">
            <h3 className="text-lg font-semibold text-slate-100 mb-3.5">Key Stats</h3>
            <div className="grid grid-cols-2 gap-3.5 sm:gap-4">
                <div className="bg-slate-800/70 p-4 rounded-xl border border-slate-700/50 shadow-md">
                    <p className="text-xs text-slate-400 mb-0.5">Total Students</p>
                    <p className="text-xl font-bold text-white">128</p>
                </div>
                <div className="bg-slate-800/70 p-4 rounded-xl border border-slate-700/50 shadow-md">
                    <p className="text-xs text-slate-400 mb-0.5">Avg. Attendance</p>
                    <p className="text-xl font-bold text-green-400">94%</p>
                </div>
            </div>
        </section>

        {/* Upcoming Events or Deadlines */}
        <section>
            <h3 className="text-lg font-semibold text-slate-100 mb-3.5">Upcoming</h3>
            <div className="bg-slate-800/70 p-4 rounded-xl border border-slate-700/50 shadow-md space-y-3.5">
                <div className="text-sm">
                    <p className="font-semibold text-white">Calculus Midterm Grading</p>
                    <p className="text-xs text-yellow-400 mt-0.5">Due: Tomorrow, 11:59 PM</p>
                </div>
                 <div className="border-t border-slate-700/50 my-2"></div>
                <div className="text-sm">
                    <p className="font-semibold text-white">Staff Meeting & Q&A</p>
                    <p className="text-xs text-blue-400 mt-0.5">Today, 3:00 PM - Room 2B</p>
                </div>
            </div>
        </section>
      </main>

      {/* Mobile Top Bar - Fixed */}
      <header className="fixed top-0 left-0 right-0 bg-slate-800/80 backdrop-blur-lg border-b border-slate-700/60 p-3 h-16 flex items-center justify-between z-40">
        <button onClick={() => setIsSidebarOpen(true)} className="p-2.5 text-slate-300 hover:bg-slate-700/70 rounded-full" aria-label="Open menu">
          <Bars3Icon className="w-6 h-6" />
        </button>
        <span className="text-lg font-semibold text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text">Dashboard</span>
        <div className="flex items-center gap-2 sm:gap-3">
            <button className="p-2.5 text-slate-300 hover:bg-slate-700/70 rounded-full relative" aria-label="Notifications">
                <BellIcon className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-800 animate-pulse"></span>
            </button>
            <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="p-1 hover:bg-slate-700/70 rounded-full" aria-label="Profile">
                {educator?.avatar ? (
                  <img src={educator.avatar} alt="profile" className="w-8 h-8 rounded-full object-cover border border-purple-500/60"/>
                ) : (
                  <UserCircleIcon className="w-8 h-8 text-slate-400" />
                )}
            </button>
        </div>
      </header>
      
      {/* Mobile Profile Popover */}
      {isProfileOpen && (
        <div className="fixed top-[68px] right-3 mt-1 w-56 bg-slate-700/95 backdrop-blur-md rounded-lg shadow-xl border border-slate-600/70 z-50 overflow-hidden">
          <div className="p-3 border-b border-slate-600/80">
            <p className="text-white text-sm font-medium truncate">{educator?.name || "Educator"}</p>
            <p className="text-xs text-slate-300 truncate">{educator?.email || "email@example.com"}</p>
          </div>
          <div className="py-1.5 px-1">
            <Link to="/educator-profile" className="block px-3 py-2 text-sm text-slate-200 hover:bg-slate-600/70 rounded-md transition-colors" onClick={() => setIsProfileOpen(false)}>Profile</Link>
            <Link to="/educator-settings" className="block px-3 py-2 text-sm text-slate-200 hover:bg-slate-600/70 rounded-md transition-colors" onClick={() => setIsProfileOpen(false)}>Settings</Link>
          </div>
          <div className="p-1.5 border-t border-slate-600/80">
            <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-md transition-colors">Logout</button>
          </div>
        </div>
      )}
    </div>
  );
};


// Parent Educator Dashboard Component
const EducatorDashboard = () => {
  const isDesktop = useMediaQuery({ minWidth: 1024 }); 
  return isDesktop ? <DesktopEducatorDashboard /> : <MobileEducatorDashboard />;
};

export default EducatorDashboard;