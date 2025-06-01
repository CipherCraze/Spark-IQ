import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import { auth, db } from '../../firebase/firebaseConfig';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { getUserProfile } from '../../firebase/userOperations';
import { collection, query, where, getDocs, limit as firestoreLimit, orderBy, Timestamp, doc, getDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import '../GoogleFont.css';

import {
  SparklesIcon,
  AcademicCapIcon,
  ChartBarIcon,
  ClipboardDocumentIcon,
  // UsersIcon, // Removed as unused
  ChatBubbleLeftRightIcon,
  LightBulbIcon,
  EnvelopeIcon,
  VideoCameraIcon,
  PresentationChartLineIcon,
  TrophyIcon,
  FolderIcon,
  UserCircleIcon,
  ChevronDownIcon,
  ArrowRightCircleIcon,
  MagnifyingGlassIcon,
  BellIcon,
  Bars3Icon,
  CheckCircleIcon,
  CalendarDaysIcon,
  StarIcon,
  XMarkIcon,
  HomeIcon,
  WrenchScrewdriverIcon,
  NewspaperIcon,
  DocumentTextIcon,
  QuestionMarkCircleIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  EllipsisVerticalIcon,
  FireIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

// Assuming Charts.jsx exists and exports these:
import { LineChart, PieChart, BarChart } from '../Charts.jsx'; // Ensure this path is correct

// --- Reusable UI Components ---
const StatCard = ({ title, value, icon: Icon, trend, color = 'indigo', unit = '', link }) => {
  const cardContent = (
    <>
      <div className={`absolute -top-3 -right-3 w-16 h-16 bg-${color}-500/10 rounded-full opacity-70 blur-md`}></div>
      <div className="relative z-10">
        <div className={`p-3.5 rounded-xl bg-gradient-to-br from-${color}-500/20 to-${color}-600/20 inline-block mb-3 shadow-md`}>
          <Icon className={`w-7 h-7 text-${color}-300`} />
        </div>
        <h3 className="text-gray-400 text-sm mb-1">{title}</h3>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold text-white">{value}{unit}</p>
          {trend && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${trend.startsWith('+') ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
              {trend}
            </span>
          )}
        </div>
      </div>
    </>
  );

  return link ? (
    <Link to={link} className={`block bg-gray-800/60 backdrop-blur-sm p-5 rounded-2xl border border-gray-700/50 relative overflow-hidden hover:shadow-2xl hover:border-${color}-500/40 transition-all duration-300 hover:scale-[1.03]`}>
      {cardContent}
    </Link>
  ) : (
    <div className={`bg-gray-800/60 backdrop-blur-sm p-5 rounded-2xl border border-gray-700/50 relative overflow-hidden hover:shadow-2xl hover:border-${color}-500/40 transition-all duration-300 hover:scale-[1.03]`}>
      {cardContent}
    </div>
  );
};

const TaskItem = ({ id, title, dueDate, completed, onToggle, subject }) => (
  <motion.div 
    layout
    key={id}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="flex items-center p-3.5 bg-gray-700/40 rounded-xl hover:bg-gray-700/70 transition-all duration-200 group border border-gray-600/50"
  >
    <button onClick={onToggle} className="p-1.5 rounded-full hover:bg-gray-600/50 transition-colors mr-3 focus:outline-none focus:ring-2 focus:ring-indigo-500">
      <CheckCircleIcon className={`w-6 h-6 transition-colors ${completed ? 'text-green-400 animate-pulseOnce' : 'text-gray-500 group-hover:text-green-500/60'}`} />
    </button>
    <div className="flex-1 min-w-0">
      <p className={`text-base font-medium truncate ${completed ? 'line-through text-gray-500' : 'text-gray-100'}`}>{title}</p>
      <div className="flex items-center text-xs text-gray-400 mt-1">
        <CalendarDaysIcon className="w-3.5 h-3.5 mr-1" />
        <span>Due: {dueDate}</span>
        {subject && <span className="ml-2 px-1.5 py-0.5 bg-purple-500/20 text-purple-300 rounded-full text-[10px] font-medium">{subject}</span>}
      </div>
    </div>
    <EllipsisVerticalIcon className="w-5 h-5 text-gray-500 ml-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" />
  </motion.div>
);

const QuickAccessCard = ({ title, icon: Icon, link, color = 'purple', description }) => (
  <Link to={link} className={`relative block bg-gradient-to-br from-${color}-600/90 to-${color}-700/90 p-6 rounded-2xl hover:shadow-xl hover:from-${color}-600 hover:to-${color}-700 hover:scale-[1.03] transition-all duration-300 text-white overflow-hidden group`}>
    <div className={`absolute -top-4 -right-4 w-20 h-20 bg-white/5 rounded-full opacity-50 group-hover:scale-125 transition-transform duration-500`}></div>
    <Icon className="w-10 h-10 mb-3 opacity-80 relative z-10" />
    <h4 className="font-semibold text-lg md:text-xl mb-1.5 relative z-10 truncate">{title}</h4>
    <p className="text-xs opacity-70 relative z-10 line-clamp-2">{description}</p> {/* line-clamp for multi-line description */}
    <ArrowRightCircleIcon className="w-6 h-6 absolute bottom-4 right-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 z-10"/>
  </Link>
);

const NotificationsDropdown = ({ notifications, markAsRead, deleteNotification, clearAll, onClose }) => (
  <motion.div 
    initial={{ opacity: 0, y: -10, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -10, scale: 0.95 }}
    transition={{ duration: 0.2 }}
    className="absolute right-0 mt-2 w-80 md:w-96 bg-gray-800/90 backdrop-blur-md rounded-xl shadow-2xl border border-gray-700/50 z-[100] overflow-hidden"
  >
    <div className="p-4 border-b border-gray-700/50 flex justify-between items-center sticky top-0 bg-gray-800/90 z-10">
      <h3 className="text-lg font-semibold text-white">Notifications</h3>
      {notifications.length > 0 && 
        <button onClick={clearAll} className="text-xs text-indigo-400 hover:underline focus:outline-none">Clear All</button>
      }
    </div>
    <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 hover:scrollbar-thumb-gray-500 scrollbar-track-gray-800/50 scrollbar-thumb-rounded-md">
      {notifications.length === 0 ? (
        <div className="p-6 text-center text-gray-400 flex flex-col items-center">
          <BellIcon className="w-10 h-10 mb-2 text-gray-500"/>
          <p className="font-medium">No new notifications.</p>
          <p className="text-xs">You're all caught up!</p>
        </div>
      ) : (
        notifications.map((notification) => (
          <motion.div 
            key={notification.id} 
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={`p-3.5 border-b border-gray-700/30 transition-colors ${notification.read ? 'bg-gray-800/20' : 'bg-gray-700/40 hover:bg-gray-700/60'}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${notification.read ? 'text-gray-300' : 'text-gray-100 font-medium'} truncate`}>{notification.message}</p>
                <p className="text-xs text-gray-500 mt-1">{notification.timestamp}</p>
              </div>
              <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                {!notification.read && (
                  <button onClick={() => markAsRead(notification.id)} className="p-1.5 hover:bg-gray-600/50 rounded-full" title="Mark as read">
                    <CheckCircleIcon className="w-4 h-4 text-green-400" />
                  </button>
                )}
                <button onClick={() => deleteNotification(notification.id)} className="p-1.5 hover:bg-gray-600/50 rounded-full" title="Delete">
                  <XMarkIcon className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
          </motion.div>
        ))
      )}
    </div>
    <div className="p-2 bg-gray-800/70 border-t border-gray-700/50 sticky bottom-0 z-10">
        <button onClick={onClose} className="w-full text-center py-2 text-sm text-indigo-300 hover:bg-indigo-500/20 rounded-md transition-colors">Close</button>
    </div>
  </motion.div>
);

const ProfileDropdown = ({ user, handleLogout, onClose }) => (
  <motion.div 
    initial={{ opacity: 0, y: -10, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -10, scale: 0.95 }}
    transition={{ duration: 0.2 }}
    className="absolute right-0 mt-2 w-60 bg-gray-800/90 backdrop-blur-md rounded-xl shadow-2xl border border-gray-700/50 z-[100]"
  >
    <div className="p-4 border-b border-gray-700/50 flex items-center gap-3">
      {user?.avatar ? <img src={user.avatar} alt={user.name || 'User avatar'} className="w-10 h-10 rounded-full object-cover" /> : <UserCircleIcon className="w-10 h-10 text-gray-500" />}
      <div>
        <p className="text-white font-semibold text-sm truncate">{user?.name || 'Student'}</p>
        <p className="text-xs text-gray-400 truncate">{user?.email || 'student@example.com'}</p>
      </div>
    </div>
    <div className="p-2 space-y-1">
      <Link to="/profile" onClick={onClose} className="flex items-center gap-3 w-full text-left px-3 py-2 text-gray-300 hover:bg-gray-700/50 rounded-md text-sm transition-colors">
        <UserCircleIcon className="w-5 h-5 text-indigo-400" /> Profile
      </Link>
      <Link to="/settings" onClick={onClose} className="flex items-center gap-3 w-full text-left px-3 py-2 text-gray-300 hover:bg-gray-700/50 rounded-md text-sm transition-colors">
        <Cog6ToothIcon className="w-5 h-5 text-indigo-400" /> Settings
      </Link>
      <button onClick={() => { handleLogout(); onClose(); }} className="flex items-center gap-3 w-full text-left px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-md text-sm transition-colors">
        <ArrowLeftOnRectangleIcon className="w-5 h-5" /> Logout
      </button>
    </div>
  </motion.div>
);

const LeaderboardItem = ({ rank, name, points, avatar, isCurrentUser }) => (
  <div className={`flex items-center p-3 rounded-lg transition-all duration-200 ${isCurrentUser ? 'bg-indigo-500/20 ring-1 ring-indigo-400/50' : 'bg-gray-700/30 hover:bg-gray-700/60'}`}>
    <span className={`w-7 text-center font-semibold ${rank <= 3 ? 'text-yellow-400' : 'text-gray-400'}`}>{rank}</span>
    <img src={avatar} alt={`${name}'s avatar`} className="w-9 h-9 rounded-full mx-3 object-cover" />
    <div className="flex-1 min-w-0">
      <p className={`font-medium truncate ${isCurrentUser ? 'text-indigo-200' : 'text-gray-200'}`}>{name}</p>
      <p className={`text-xs ${isCurrentUser ? 'text-indigo-300/80' : 'text-gray-400'}`}>{points} XP</p>
    </div>
    {isCurrentUser && <StarIcon className="w-5 h-5 text-yellow-400 ml-2 flex-shrink-0" title="This is you!" />}
  </div>
);


// --- Main Dashboard Component ---
const StudentDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    assignmentsCount: 0,
    pendingAssignments: 0,
    recentGrade: 'N/A',
    attendance: 0,
    learningPoints: 0,
    rank: 'N/A',
    streak: 0,
    tasks: [],
    notifications: [],
    leaderboard: [],
    achievements: [],
    recentActivities: [],
    calendarEvents: []
  });
  const [loadingData, setLoadingData] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();
  const isDesktop = useMediaQuery({ minWidth: 768 });
  const profileDropdownRef = useRef(null);
  const notificationsDropdownRef = useRef(null);
  
  const [currentDate] = useState(new Date());

  const studentMenu = [
    { title: 'Dashboard', Icon: HomeIcon, link: '/dashboard', description: "Overview of your progress." },
    { title: 'My Resources', Icon: FolderIcon, link: '/resource-utilization', description: "Access course materials." },
    { title: 'Attendance', Icon: ChartBarIcon, link: '/attendance-monitoring', description: "Track your attendance." },
    { title: 'Assignments', Icon: DocumentTextIcon, link: '/assignment-submission', description: "View & submit assignments." },
    { title: 'Grades & Feedback', Icon: PresentationChartLineIcon, link: '/GradesAndFeedback', description: "Check your grades." },
    { title: 'Voice Chat', Icon: ChatBubbleLeftRightIcon, link: '/voice-chat', description: "Discuss with peers." },
    { title: 'Ask Sparky', Icon: QuestionMarkCircleIcon, link: '/chatbot-access', description: "Your AI study assistant." },
    { title: 'AI Questions', Icon: LightBulbIcon, link: '/ai-generated-questions', description: "Practice with AI questions." },
    { title: 'Educational News', Icon: NewspaperIcon, link: '/educational-news', description: "Latest in education." },
    { title: 'Smart Review', Icon: WrenchScrewdriverIcon, link: '/smart-review', description: "Enhance your writing." },
    { title: 'Virtual Meetings', Icon: VideoCameraIcon, link: '/meeting-participation', description: "Join online classes." },
    { title: 'Chat Platform', Icon: ChatBubbleLeftRightIcon, link: '/chat-functionality', description: "Connect with peers." },
    { title: 'My Inbox', Icon: EnvelopeIcon, link: '/inbox-for-suggestions', description: "Messages & suggestions." },
    { title: 'Upgrade to Pro', Icon: SparklesIcon, link: '/pricing', special: true, description: "Unlock premium features." },
  ];

  const quickAccessFeatures = studentMenu.filter(item => 
    !['/dashboard', '/chatbot-access', '/ai-generated-questions', '/smart-review', '/pricing'].includes(item.link) && !item.special
  ).slice(0, 6);

  useEffect(() => {
    if (isDesktop) {
        setIsSidebarOpen(true); 
    } else {
        setIsSidebarOpen(false);
    }
  }, [isDesktop]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (notificationsDropdownRef.current && !notificationsDropdownRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoadingUser(true);
      if (currentUser) {
        try {
          const profileData = await getUserProfile(currentUser.uid);
          const userToSet = profileData || { 
            name: currentUser.displayName || 'Student', 
            email: currentUser.email, 
            avatar: currentUser.photoURL || `https://i.pravatar.cc/150?u=${currentUser.uid}`,
            stats: { points: 0, rank: 'N/A', streak: 0 },
            role: 'student'
          };
          setUser(userToSet);

          if (userToSet.role === 'educator') {
            navigate('/educator-dashboard');
            setLoadingUser(false);
            return;
          }
          await fetchAllDashboardData(currentUser.uid, userToSet);
        } catch (error) {
          console.error("Error fetching profile or dashboard data:", error);
          setUser({ name: 'Error User', email: '', avatar: `https://i.pravatar.cc/150?u=error`, stats: {} });
        } finally {
          setLoadingUser(false);
        }
      } else {
        navigate('/login');
        setLoadingUser(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const fetchAllDashboardData = async (uid, profile) => {
    setLoadingData(true);
    try {
      const submissionsRef = collection(db, 'submissions');
      const assignmentsQuery = query(submissionsRef, where('studentId', '==', uid));
      const assignmentsSnapshot = await getDocs(assignmentsQuery);
      const submissions = assignmentsSnapshot.docs.map(docSnapshot => ({id: docSnapshot.id, ...docSnapshot.data()}));
      
      const pendingAssignments = submissions.filter(s => s.status === 'pending' || (s.status === 'submitted' && !s.grade));
      const gradedAssignments = submissions.filter(s => s.status === 'graded' && s.grade !== null)
                                      .sort((a,b) => (b.submittedAt?.seconds ? b.submittedAt.toDate() : new Date(b.submittedAt)) - (a.submittedAt?.seconds ? a.submittedAt.toDate() : new Date(a.submittedAt)));
      
      const fetchedTasks = await Promise.all(pendingAssignments.slice(0, 5).map(async (sub) => {
        let assignmentTitle = `Assignment ID: ${sub.assignmentId ? sub.assignmentId.substring(0,5) : 'N/A'}`;
        let subject = 'General';
        if(db && sub.assignmentId) {
            const assignmentDocRef = doc(db, "assignments", sub.assignmentId);
            const assignmentDocSnap = await getDoc(assignmentDocRef);
            if(assignmentDocSnap.exists()){
                const assignmentData = assignmentDocSnap.data();
                assignmentTitle = assignmentData.title || assignmentTitle;
                subject = assignmentData.subject || subject;
            }
        }
        return {
            id: sub.id,
            title: assignmentTitle,
            dueDate: sub.dueDate?.seconds ? new Timestamp(sub.dueDate.seconds, sub.dueDate.nanoseconds).toDate().toLocaleDateString() : 'N/A',
            completed: false,
            subject: subject
        }
      }));

      const fetchedNotifications = [
        gradedAssignments.length > 0 ? { id: 'grade-notif-' + gradedAssignments[0].id, message: `Assignment "${gradedAssignments[0]?.assignmentTitle || 'Math'}" graded: ${gradedAssignments[0]?.grade || 'A'}/${gradedAssignments[0]?.maxPoints || 100}`, timestamp: '2 hours ago', read: false } : null,
        { id: 'resource-notif-calculus', message: 'New resource added to "Calculus" course', timestamp: '1 day ago', read: true },
        pendingAssignments.length > 0 ? { id: 'reminder-notif-pending', message: `Reminder: ${pendingAssignments.length} assignments due soon.`, timestamp: '3 days ago', read: true }: null,
      ].filter(Boolean).slice(0, 5);

      const userStats = profile?.stats || { points: 0, rank: 'N/A', streak: 0 };
      const currentAttendance = 92; // Placeholder: This should be fetched or calculated

      let simLeaderboard = [
        { rank: 1, name: 'Alice Wonderland', points: 1250, avatar: `https://i.pravatar.cc/40?u=alice` },
        { rank: 3, name: 'Bob Knight', points: 1050, avatar: `https://i.pravatar.cc/40?u=bob` },
        { rank: 4, name: 'Charlie Day', points: 980, avatar: `https://i.pravatar.cc/40?u=charlie` },
        { rank: 5, name: 'Diana Prince', points: 950, avatar: `https://i.pravatar.cc/40?u=diana` },
      ];
      const currentUserEntry = { 
        name: profile?.name || 'You', 
        points: userStats.points, 
        avatar: profile?.avatar || `https://i.pravatar.cc/40?u=${uid}`, 
        isCurrentUser: true 
      };
      simLeaderboard.push(currentUserEntry);
      const fetchedLeaderboard = simLeaderboard
        .sort((a, b) => b.points - a.points)
        .map((user, idx) => ({ ...user, rank: idx + 1 }))
        .slice(0, 5);
      
      const fetchedAchievements = [
        { id: 'streak_10', title: '10-Day Streak', icon: FireIcon, unlocked: userStats.streak >= 10, description: "Kept learning for 10 days straight!" },
        { id: 'top_coder', title: 'Top Coder', icon: AcademicCapIcon, unlocked: Math.random() > 0.5, description: "Achieved 90%+ in a coding assignment." },
        { id: 'quiz_champ', title: 'Quiz Champ', icon: TrophyIcon, unlocked: Math.random() > 0.5, description: "Perfect score on 3 quizzes." },
        { id: 'discussion_leader', title: 'Discussion Leader', icon: ChatBubbleLeftRightIcon, unlocked: Math.random() > 0.3, description: "Active in 5+ discussions." },
        { id: 'resource_explorer', title: 'Resource Explorer', icon: FolderIcon, unlocked: Math.random() > 0.6, description: "Viewed 10+ resources." },
        { id: 'perfect_attendance', title: 'Perfect Attendance', icon: CheckCircleIcon, unlocked: currentAttendance > 95, description: "Maintained excellent attendance." },
      ];
      
      const fetchedRecentActivities = [
        { id:1, type: 'submit_assignment', description: 'Submitted "Quantum Mechanics Problem Set"', time: '30m ago', icon: DocumentTextIcon, color: 'blue' },
        { id:2, type: 'join_meeting', description: 'Joined "Study Group for Finals"', time: '2h ago', icon: VideoCameraIcon, color: 'green' },
        { id:3, type: 'receive_grade', description: 'Received grade for "History Essay"', time: '1d ago', icon: PresentationChartLineIcon, color: 'purple' },
        { id:4, type: 'ask_sparky', description: 'Asked Sparky about "Newton\'s Laws"', time: '2d ago', icon: QuestionMarkCircleIcon, color: 'indigo' },
      ].slice(0,4);

      setDashboardData({
        assignmentsCount: submissions.length,
        pendingAssignments: pendingAssignments.length,
        recentGrade: gradedAssignments.length > 0 ? `${gradedAssignments[0].grade}/${gradedAssignments[0].maxPoints || 100}` : 'N/A',
        attendance: currentAttendance,
        learningPoints: userStats.points,
        rank: fetchedLeaderboard.find(u => u.isCurrentUser)?.rank || userStats.rank || 'N/A',
        streak: userStats.streak,
        tasks: fetchedTasks,
        notifications: fetchedNotifications,
        leaderboard: fetchedLeaderboard,
        achievements: fetchedAchievements,
        recentActivities: fetchedRecentActivities,
        calendarEvents: [ 
            { date: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 2), title: "Physics Midterm" },
            { date: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 5), title: "Project Alpha Due" },
        ]
      });

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const toggleTaskCompletion = (taskId) => {
    setDashboardData(prev => ({
      ...prev,
      tasks: prev.tasks.map(task => task.id === taskId ? { ...task, completed: !task.completed } : task)
    }));
  };

  const markNotificationAsRead = (id) => setDashboardData(prev => ({ ...prev, notifications: prev.notifications.map(n => n.id === id ? { ...n, read: true } : n)}));
  const deleteNotificationItem = (id) => setDashboardData(prev => ({ ...prev, notifications: prev.notifications.filter(n => n.id !== id)}));
  const clearAllNotifications = () => setDashboardData(prev => ({ ...prev, notifications: [] }));

  const barChartData = {
    labels: ['Math', 'Science', 'History', 'English', 'Coding'],
    datasets: [
      {
        label: 'Your Performance',
        data: [88, 72, 95, 85, 92],
        backgroundColor: 'rgba(99, 102, 241, 0.7)',
        borderColor: 'rgba(129, 140, 248, 1)',
        borderWidth: 1, barThickness: isDesktop ? 20 : 10, borderRadius: 5
      },
      {
        label: 'Class Average',
        data: [75, 80, 82, 78, 88],
        backgroundColor: 'rgba(167, 139, 250, 0.6)',
        borderColor: 'rgba(192, 132, 252, 1)',
        borderWidth: 1, barThickness: isDesktop ? 20 : 10, borderRadius: 5
      }
    ],
  };
  
  const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Assignments Completed',
        data: [5, 7, 6, 8, 7, 9],
        borderColor: 'rgba(99, 102, 241, 1)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const pieChartData = {
    labels: ['A Grade', 'B Grade', 'C Grade', 'Pending'],
    datasets: [
      {
        data: [60, 25, 10, 5],
        backgroundColor: ['#4ade80', '#60a5fa', '#facc15', '#a78bfa'],
        hoverOffset: 8,
      },
    ],
  };

  if (loadingUser || loadingData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <SparklesIcon className="w-16 h-16 text-indigo-500 animate-spin" />
        <p className="ml-4 text-xl text-white">Loading Spark Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 text-gray-100 flex antialiased">
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside 
            key="sidebar"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30, duration: 0.3 }}
            className={`fixed top-0 left-0 h-full w-64 bg-gray-800/80 backdrop-blur-xl border-r border-gray-700/60 shadow-2xl z-50 flex flex-col md:h-screen md:z-40 md:fixed md:translate-x-0`}
          >
            <div className="p-5 flex items-center gap-3.5 border-b border-gray-700/60 relative">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg">
                <SparklesIcon className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">SPARK-IQ</h1>
              {!isDesktop && (
                <button onClick={() => setIsSidebarOpen(false)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-gray-700/50 transition-colors">
                  <XMarkIcon className="w-5 h-5"/>
                </button>
              )}
            </div>
            <nav className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin scrollbar-thumb-gray-600 hover:scrollbar-thumb-gray-500 scrollbar-track-gray-800/50 scrollbar-thumb-rounded-md">
              {studentMenu.map(item => {
                const isActive = location.pathname === item.link;
                return (
                  <Link key={item.title} to={item.link} onClick={() => !isDesktop && setIsSidebarOpen(false)}
                        className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg text-gray-300 transition-all group
                                  ${isActive ? 'bg-indigo-500/30 text-indigo-200 font-semibold shadow-inner' : 'hover:bg-indigo-500/10 hover:text-indigo-300'}
                                  ${item.special ? `mt-auto mb-1 bg-gradient-to-r from-purple-600/90 to-indigo-600/90 !text-white shadow-md hover:shadow-lg hover:opacity-90 ${isActive ? 'ring-2 ring-purple-400' : ''}` : ''}`}>
                    <item.Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-indigo-300' : 'text-indigo-400'} group-hover:scale-110 transition-transform`} />
                    <span className="text-sm font-medium">{item.title}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="p-3 border-t border-gray-700/60">
              <Link to="/settings" onClick={() => !isDesktop && setIsSidebarOpen(false)}
                    className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg text-gray-400 hover:bg-gray-700/50 hover:text-gray-200 transition-all group`}>
                <Cog6ToothIcon className="w-5 h-5 text-gray-500 group-hover:text-indigo-400"/>
                <span className="text-sm font-medium">Settings</span>
              </Link>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
      {isSidebarOpen && !isDesktop && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>}

      <div className="flex-1 flex flex-col overflow-x-hidden md:ml-64">
        <header className="sticky top-0 bg-gray-900/70 backdrop-blur-lg p-4 md:px-6 md:py-5 border-b border-gray-700/50 z-30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {!isDesktop && (
              <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-400 hover:text-white">
                <Bars3Icon className="w-6 h-6" />
              </button>
            )}
            <h2 className="text-xl md:text-2xl font-semibold text-white hidden sm:block">
              {isDesktop ? "Student Dashboard" : "SPARK-IQ"}
            </h2>
          </div>
          <div className="flex items-center gap-3 md:gap-5">
            {isDesktop && (
                <div className="relative">
                    <input type="search" placeholder="Search..." className="w-52 md:w-64 pl-10 pr-4 py-2 text-sm bg-gray-800/70 border border-gray-700/60 rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"/>
                    <MagnifyingGlassIcon className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2"/>
                </div>
            )}
            <div ref={notificationsDropdownRef} className="relative">
              <button onClick={() => {setIsNotificationsOpen(o => !o); setIsProfileOpen(false);}} className="p-2 text-gray-400 hover:text-white relative focus:outline-none hover:bg-gray-700/50 rounded-full transition-colors">
                <BellIcon className="w-6 h-6" />
                {dashboardData.notifications.filter(n => !n.read).length > 0 && <span className="absolute top-1.5 right-1.5 w-3 h-3 bg-red-500 rounded-full border-2 border-gray-900 animate-pulse"></span>}
              </button>
              <AnimatePresence>
                {isNotificationsOpen && <NotificationsDropdown notifications={dashboardData.notifications} markAsRead={markNotificationAsRead} deleteNotification={deleteNotificationItem} clearAll={clearAllNotifications} onClose={() => setIsNotificationsOpen(false)} />}
              </AnimatePresence>
            </div>
            <div ref={profileDropdownRef} className="relative">
              <button onClick={() => {setIsProfileOpen(o => !o); setIsNotificationsOpen(false);}} className="flex items-center gap-2 p-1 pr-1.5 rounded-full hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900">
                {user?.avatar ? <img src={user.avatar} alt={user.name || 'User avatar'} className="w-8 h-8 rounded-full object-cover border-2 border-gray-700" /> : <UserCircleIcon className="w-9 h-9 text-gray-500" />}
                <ChevronDownIcon className="w-4 h-4 text-gray-400 hidden md:block" />
              </button>
              <AnimatePresence>
                {isProfileOpen && <ProfileDropdown user={user} handleLogout={handleLogout} onClose={() => setIsProfileOpen(false)} />}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8 scrollbar-thin scrollbar-thumb-gray-700/80 hover:scrollbar-thumb-gray-600 scrollbar-track-gray-800/50 scrollbar-thumb-rounded-full">
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-gradient-to-r from-indigo-600/50 via-purple-600/40 to-pink-600/30 p-6 md:p-8 rounded-2xl shadow-xl border border-indigo-500/40 relative overflow-hidden"
          >
             <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width='52' height='26' viewBox='0 0 52 26' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23ffffff'%3E%3Cpath d='M10 10c0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6h2c0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4v2c-3.314 0-6-2.686-6-6 0-2.21-1.79-4-4-4zm25.464-1.95l8.486 8.486-1.414 1.414-8.486-8.486 1.414-1.414z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"}}></div>
            <div className="relative z-10">
                <h3 className="text-2xl md:text-4xl font-bold text-white .font-poppins">
                  Welcome back, <span className="bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">{user?.name?.split(' ')[0] || 'Student'}!</span>
                </h3>
                <p className="text-indigo-200/80 mt-2 text-sm md:text-base">Your personalized learning hub. Let's achieve new milestones today! 🚀</p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <StatCard title="Pending Tasks" value={dashboardData.pendingAssignments} icon={ClipboardDocumentIcon} trend={`${dashboardData.assignmentsCount} Total`} color="blue" link="/assignment-submission"/>
            <StatCard title="Attendance" value={dashboardData.attendance} unit="%" icon={ChartBarIcon} trend="Good" color="green" link="/attendance-monitoring"/>
            <StatCard title="Recent Grade" value={dashboardData.recentGrade} icon={AcademicCapIcon} trend="+3% improvement" color="purple" link="/GradesAndFeedback"/>
            <StatCard title="XP & Rank" value={`${dashboardData.learningPoints} XP`} icon={StarIcon} trend={`Rank ${dashboardData.rank} • ${dashboardData.streak} Day Streak`} color="yellow" link="/profile#stats"/>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="lg:col-span-2 space-y-6 md:space-y-8">
              <div className="bg-gray-800/60 backdrop-blur-sm p-5 md:p-6 rounded-2xl border border-gray-700/50 shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2.5">
                      <ClipboardDocumentIcon className="w-6 h-6 text-blue-400" />
                      Your Top Tasks
                    </h3>
                    <Link to="/assignment-submission" className="text-sm text-indigo-400 hover:underline font-medium">View All</Link>
                </div>
                {dashboardData.tasks.length > 0 ? (
                  <div className="space-y-3.5 max-h-[22rem] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-600/80 hover:scrollbar-thumb-gray-500 scrollbar-track-gray-700/50 scrollbar-thumb-rounded-md">
                    <AnimatePresence>
                      {dashboardData.tasks.map(task => <TaskItem key={task.id} {...task} onToggle={() => toggleTaskCompletion(task.id)} />)}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 flex flex-col items-center">
                    <CheckCircleIcon className="w-12 h-12 mb-2 opacity-50 text-green-500"/>
                    <p className="font-medium">All tasks completed!</p>
                    <p className="text-xs">Way to go! Time to learn something new?</p>
                  </div>
                )}
              </div>

              <div className="bg-gray-800/60 backdrop-blur-sm p-5 md:p-6 rounded-2xl border border-gray-700/50 shadow-lg">
                 <h3 className="text-xl font-semibold text-white mb-1 flex items-center gap-2.5">
                  <PresentationChartLineIcon className="w-6 h-6 text-green-400" />
                  Subject Performance
                </h3>
                <p className="text-xs text-gray-400 mb-5">Your scores vs. class average. Keep up the great work!</p>
                <div className="h-80 md:h-[22rem]">
                   <BarChart data={barChartData} options={{ maintainAspectRatio: false, responsive: true }} />
                </div>
              </div>
            </div>

            <div className="space-y-6 md:space-y-8">
              <div className="bg-gray-800/60 backdrop-blur-sm p-5 md:p-6 rounded-2xl border border-gray-700/50 shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2.5">
                        <CalendarDaysIcon className="w-6 h-6 text-orange-400" />
                        This Month
                    </h3>
                    <Link to="/calendar" className="text-sm text-indigo-400 hover:underline font-medium">Full Calendar</Link>
                </div>
                <div className="text-center text-lg font-medium text-indigo-300 mb-3">
                    {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 mb-2">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => <div key={day} className="font-semibold py-1">{day}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1.5">
                  {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() }).map((_, i) => <div key={`empty-${i}`} className="h-9 w-full"></div>)}
                  {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate() }).map((_, i) => {
                    const day = i + 1;
                    const isCurrentDay = day === currentDate.getDate();
                    const hasEvent = dashboardData.calendarEvents.some(event => new Date(event.date).getDate() === day && new Date(event.date).getMonth() === currentDate.getMonth());
                    return (
                      <div key={day} className={`h-9 w-full flex items-center justify-center rounded-lg text-sm relative transition-all
                        ${isCurrentDay ? 'bg-indigo-500 text-white font-bold ring-2 ring-indigo-300 shadow-lg' : 'text-gray-200 hover:bg-gray-700/70'}
                        ${hasEvent && !isCurrentDay ? 'bg-purple-500/30' : ''}`}>
                        {day}
                        {hasEvent && <span className={`absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${isCurrentDay ? 'bg-white' : 'bg-purple-400'}`}></span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-gray-800/60 backdrop-blur-sm p-5 md:p-6 rounded-2xl border border-gray-700/50 shadow-lg">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2.5">
                  <SparklesIcon className="w-6 h-6 text-purple-400 animate-subtle-pulse" />
                  Smart Tools
                </h3>
                <div className="space-y-3.5">
                  <QuickAccessCard title="Ask Sparky AI" icon={QuestionMarkCircleIcon} link="/chatbot-access" color="indigo" description="Your AI study assistant." />
                  <QuickAccessCard title="AI Question Hub" icon={LightBulbIcon} link="/ai-generated-questions" color="teal" description="Practice with AI questions."/>
                  <QuickAccessCard title="Smart Reviewer" icon={WrenchScrewdriverIcon} link="/smart-review" color="rose" description="Enhance your writing."/>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/60 backdrop-blur-sm p-5 md:p-6 rounded-2xl border border-gray-700/50 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2.5">
                <TrophyIcon className="w-6 h-6 text-yellow-400" />
                Class Leaderboard
              </h3>
              <Link to="/leaderboard" className="text-sm text-indigo-400 hover:underline font-medium">View Full</Link>
            </div>
            {dashboardData.leaderboard.length > 0 ? (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-600 hover:scrollbar-thumb-gray-500 scrollbar-track-gray-700/50 scrollbar-thumb-rounded-md">
                {dashboardData.leaderboard.map(item => <LeaderboardItem key={item.rank + '-' + item.name} {...item} />)}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">Leaderboard data is not available yet.</p>
            )}
          </div>
          
          <div className="bg-gray-800/60 backdrop-blur-sm p-5 md:p-6 rounded-2xl border border-gray-700/50 shadow-lg">
            <h3 className="text-xl font-semibold text-white mb-5 flex items-center gap-2.5">
              <ArrowRightCircleIcon className="w-6 h-6 text-green-400" />
              Explore More Features
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {quickAccessFeatures.map((item, index) => (
                <QuickAccessCard 
                  key={item.link} 
                  title={item.title} 
                  icon={item.Icon} 
                  link={item.link} 
                  description={item.description}
                  color={['cyan', 'lime', 'fuchsia', 'sky', 'emerald', 'pink'][index % 6]}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="bg-gray-800/60 backdrop-blur-sm p-5 md:p-6 rounded-2xl border border-gray-700/50">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2.5">
                      <StarIcon className="w-6 h-6 text-yellow-400" />
                      Achievements Unlocked
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-60 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-600 hover:scrollbar-thumb-gray-500 scrollbar-track-gray-700/50 scrollbar-thumb-rounded-md">
                      {dashboardData.achievements.map(ach => (
                          <div key={ach.id} title={ach.description} className={`p-3.5 rounded-lg border flex flex-col items-center text-center transition-all hover:scale-105 cursor-help ${ach.unlocked ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-300 shadow-md' : 'bg-gray-700/50 border-gray-600/60 text-gray-500'}`}>
                              <ach.icon className={`w-8 h-8 mb-1.5 ${ach.unlocked ? '' : 'opacity-40'}`} />
                              <span className="text-xs font-medium truncate w-full">{ach.title}</span>
                              {!ach.unlocked && <span className="text-[10px] opacity-60">(Locked)</span>}
                          </div>
                      ))}
                  </div>
              </div>
              <div className="bg-gray-800/60 backdrop-blur-sm p-5 md:p-6 rounded-2xl border border-gray-700/50">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2.5">
                      <ClipboardDocumentIcon className="w-6 h-6 text-blue-400" />
                      Recent Activity
                  </h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-600 hover:scrollbar-thumb-gray-500 scrollbar-track-gray-700/50 scrollbar-thumb-rounded-md">
                      {dashboardData.recentActivities.map(act => (
                          <div key={act.id} className="flex items-center gap-3 p-2.5 bg-gray-700/30 rounded-lg hover:bg-gray-700/50">
                              <div className={`p-2 bg-${act.color}-500/20 rounded-full`}>
                                 <act.icon className={`w-4 h-4 text-${act.color}-400`} />
                              </div>
                              <p className="text-sm text-gray-300 flex-1 truncate">{act.description}</p>
                              <span className="text-xs text-gray-500 flex-shrink-0">{act.time}</span>
                          </div>
                      ))}
                       {dashboardData.recentActivities.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No recent activity to show.</p>}
                  </div>
              </div>
           </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                 <div className="bg-gray-800/60 backdrop-blur-sm p-5 md:p-6 rounded-2xl border border-gray-700/50">
                    <h3 className="text-xl font-semibold text-white mb-1 flex items-center gap-2.5">
                        <ArrowTrendingUpIcon className="w-6 h-6 text-indigo-400" />
                        Assignment Progress
                    </h3>
                    <p className="text-xs text-gray-400 mb-5">Your completion rate over the last few months.</p>
                    <div className="h-72 md:h-80">
                        <LineChart data={lineChartData} options={{ maintainAspectRatio: false, responsive: true }}/>
                    </div>
                </div>
                <div className="bg-gray-800/60 backdrop-blur-sm p-5 md:p-6 rounded-2xl border border-gray-700/50">
                    <h3 className="text-xl font-semibold text-white mb-1 flex items-center gap-2.5">
                        <AcademicCapIcon className="w-6 h-6 text-green-400" />
                        Grade Distribution
                    </h3>
                     <p className="text-xs text-gray-400 mb-5">Overall breakdown of your grades.</p>
                    <div className="h-72 md:h-80 flex items-center justify-center">
                        <PieChart data={pieChartData} options={{ maintainAspectRatio: false, responsive: true }} />
                    </div>
                </div>
            </div>
        </main>
      </div>

       {!isDesktop && (
        <nav className="fixed bottom-0 left-0 right-0 bg-gray-800/90 backdrop-blur-lg border-t border-gray-700/60 p-2 shadow-top-2xl z-[60]">
          <div className="flex justify-around items-center">
            {[
                {label: "Home", icon: HomeIcon, link: "/dashboard"},
                {label: "Tasks", icon: ClipboardDocumentIcon, link: "/assignment-submission"},
                {label: "Sparky", icon: QuestionMarkCircleIcon, link: "/chatbot-access"},
                {label: "Profile", icon: UserCircleIcon, link: "/profile"}
            ].map(item => (
                <Link key={item.label} to={item.link} className={`flex flex-col items-center p-1.5 rounded-md transition-colors w-1/4 ${location.pathname === item.link ? 'text-indigo-400 bg-indigo-500/10' : 'text-gray-400 hover:text-indigo-300'}`}>
                    <item.icon className="w-6 h-6" />
                    <span className="text-[10px] mt-0.5 font-medium tracking-tight">{item.label}</span>
                </Link>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
};

export default StudentDashboard;