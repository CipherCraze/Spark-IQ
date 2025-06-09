import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import { auth, db } from '../../firebase/firebaseConfig'; // Added db import
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
  DocumentMagnifyingGlassIcon,
  ChevronDownIcon,
  ArrowRightCircleIcon,
  BellIcon,
  Bars3Icon,
  ChevronLeftIcon,
  ChartPieIcon, // Using this as a generic pie/donut chart icon
  UserCircleIcon,
  UsersIcon, // For total students stat
  FolderIcon,
  BookOpenIcon, // For total courses stat
  PresentationChartLineIcon,
  GlobeAltIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline';

// Import Firestore functions
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

// --- Recharts components for Chart.jsx replacements ---
// These are included here to make the file self-contained and runnable.
// If you have an existing Charts.jsx, ensure its components match these props.
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

// Dummy LineChart component for the dashboard
const CustomLineChart = ({ data, color, dataKey, yAxisLabel }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#4B556350" />
        <XAxis dataKey="name" stroke="#9CA3AF" fontSize={10} />
        <YAxis stroke="#9CA3AF" fontSize={10} label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', fill: '#9CA3AF', fontSize: 10 }} />
        <Tooltip
          contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', border: '1px solid #4B5563', borderRadius: '0.5rem' }}
          itemStyle={{ color: '#E5E7EB' }}
          labelStyle={{ color: '#E5E7EB' }}
        />
        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

// Dummy DonutChart component for the dashboard (using PieChart from Recharts)
const CustomDonutChart = ({ data }) => {
  const COLORS = ['#60A5FA', '#F87171', '#FBBF24']; // Blue (Present), Red (Absent), Amber (Excused)

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="10px">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={40}
          outerRadius={60}
          fill="#8884d8"
          paddingAngle={2}
          dataKey="value"
          label={renderCustomizedLabel}
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', border: '1px solid #4B5563', borderRadius: '0.5rem' }}
          itemStyle={{ color: '#E5E7EB' }}
          labelStyle={{ color: '#E5E7EB' }}
        />
        <Legend wrapperStyle={{fontSize: '10px'}}/>
      </PieChart>
    </ResponsiveContainer>
  );
};


// --- Educator Menu Definition ---
// This is now the single source of truth for the sidebar menu.
const educatorSidebarMenu = [
  { title: 'Dashboard', Icon: PresentationChartLineIcon, link: '/educator-dashboard', current: true },
  { title: 'Assignments', Icon: ClipboardDocumentIcon, link: '/assignment-management' },
  { title: 'Tests', Icon: ClipboardDocumentIcon, link: '/teacher-tests' },
  { title: 'Grades & Analytics', Icon: AcademicCapIcon, link: '/GradesAndAnalytics' },
  { title: 'Resources', Icon: FolderIcon, link: '/resource-management' },
  { title: 'Attendance', Icon: ChartBarIcon, link: '/attendance-tracking' },
  { title: 'Teacher Insights', Icon: DocumentMagnifyingGlassIcon, link: '/personalized-feedback-educators', description: "Get AI-powered feedback on your teaching activity." },
  { title: 'Voice Chat', Icon: ChatBubbleLeftRightIcon, link: '/teacher-voice-chat' },
  { title: 'AI Chatbot (Ask Sparky)', Icon: ChatBubbleLeftRightIcon, link: '/chatbot-education' },
  { title: 'AI Questions', Icon: SparklesIcon, link: '/ai-generated-questions' },
  { title: 'Social / Chat', Icon: SolidUserGroupIcon, link: '/chat-functionality' },
  { title: 'Educational News', Icon: GlobeAltIcon, link: '/educational-news' },
  { title: 'Student Suggestions', Icon: EnvelopeIcon, link: '/suggestions-to-students' },
  { title: 'Meetings & Conferences', Icon: VideoCameraIcon, link: '/meeting-host' },
  { title: 'Announcements', Icon: MegaphoneIcon, link: '/announcements' },
  { title: 'Upgrade to Pro', Icon: SparklesIcon, link: '/pricing', special: true },
];

// --- Desktop Educator Dashboard ---
const DesktopEducatorDashboard = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const navigate = useNavigate();

  const [educator, setEducator] = useState(null);
  const [isLoadingEducator, setIsLoadingEducator] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(true); // Separate loading for dashboard data

  // Dashboard Data States
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalCourses, setTotalCourses] = useState(0); // Represented as unique subjects or actual classes
  const [avgAttendance, setAvgAttendance] = useState(0);
  const [avgGrade, setAvgGrade] = useState(0);
  const [recentSubmissions, setRecentSubmissions] = useState([]);

  // Performance Chart Data
  const [performanceChartData, setPerformanceChartData] = useState([]); // Will be an array of objects for Recharts
  const [attendanceChartData, setAttendanceChartData] = useState([]); // For donut chart

  // Ref for profile dropdown to handle outside clicks
  const profileMenuRef = useRef(null);
  const profileButtonRef = useRef(null);

  // Effect for closing profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileOpen &&
          profileMenuRef.current && !profileMenuRef.current.contains(event.target) &&
          profileButtonRef.current && !profileButtonRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    if (isProfileOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileOpen]);


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
          fetchDashboardData(user.uid); // Fetch data once user is authenticated
        } catch (error) {
          console.error('Error fetching educator profile or dashboard data:', error);
          navigate('/login'); // Redirect on severe error
        } finally {
          setIsLoadingEducator(false);
        }
      } else {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const fetchDashboardData = async (teacherId) => {
    if (!teacherId) return;
    setIsDataLoading(true);

    try {
      // 1. Fetch Assignments and Tests created by this teacher
      const assignmentsQuery = query(collection(db, 'assignments'), where('teacherId', '==', teacherId));
      const testsQuery = query(collection(db, 'tests'), where('teacherId', '==', teacherId));

      const [assignmentsSnap, testsSnap] = await Promise.all([
        getDocs(assignmentsQuery),
        getDocs(testsQuery)
      ]);

      const assignments = assignmentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const tests = testsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // 2. Calculate Total Courses (Unique Subjects)
      const uniqueSubjects = new Set();
      assignments.forEach(assign => uniqueSubjects.add(assign.subject));
      tests.forEach(test => uniqueSubjects.add(test.subject));
      setTotalCourses(uniqueSubjects.size);

      // 3. Calculate Overall Average Grade
      let totalAssignmentGrades = 0;
      let gradedAssignmentCount = 0;
      assignments.forEach(assign => {
        if (assign.averageGrade !== undefined && assign.averageGrade !== null) {
          totalAssignmentGrades += assign.averageGrade;
          gradedAssignmentCount++;
        }
      });
      setAvgGrade(gradedAssignmentCount > 0 ? (totalAssignmentGrades / gradedAssignmentCount).toFixed(1) : 0);

      // Mock performance chart data, could be refined with historical data later
      setPerformanceChartData([
        { name: 'Jan', value: 75 }, { name: 'Feb', value: 82 }, { name: 'Mar', value: 79 },
        { name: 'Apr', value: 88 }, { name: 'May', value: 85 }, { name: 'Jun', value: 90 },
      ]);


      // 4. Calculate Average Attendance and Attendance Chart Data
      const attendanceQuery = query(collection(db, 'attendance'), where('markedByTeacherId', '==', teacherId)); // Assuming this field exists
      const attendanceSnap = await getDocs(attendanceQuery);
      let totalMarkedRecords = 0;
      let presentRecords = 0;
      let absentRecords = 0;
      // We don't track excused directly from given files, so it will be 0.
      let excusedRecords = 0;

      attendanceSnap.docs.forEach(doc => {
        totalMarkedRecords++;
        if (doc.data().isPresent) {
          presentRecords++;
        } else {
          absentRecords++;
        }
      });
      setAvgAttendance(totalMarkedRecords > 0 ? ((presentRecords / totalMarkedRecords) * 100).toFixed(1) : 0);
      setAttendanceChartData([
        { name: 'Present', value: presentRecords },
        { name: 'Absent', value: absentRecords },
        { name: 'Excused', value: excusedRecords }
      ]);

      // 5. Calculate Total Students (Unique students who have submitted to this teacher's assignments/tests)
      const uniqueStudentIds = new Set();
      const allSubmissionsPromises = [];

      assignments.forEach(assign => {
        allSubmissionsPromises.push(
          getDocs(query(collection(db, 'submissions'), where('assignmentId', '==', assign.id)))
            .then(snap => snap.docs.map(doc => ({ ...doc.data(), id: doc.id, type: 'assignment', assignmentTitle: assign.title })))
        );
      });
      tests.forEach(test => {
        allSubmissionsPromises.push(
          getDocs(query(collection(db, 'testSubmissions'), where('testId', '==', test.id)))
            .then(snap => snap.docs.map(doc => ({ ...doc.data(), id: doc.id, type: 'test', testTitle: test.title })))
        );
      });

      const allSubmissionsArrays = await Promise.all(allSubmissionsPromises);
      const combinedSubmissions = allSubmissionsArrays.flat();

      // Fetch student names for recent submissions
      const studentProfiles = {};
      const studentIdsToFetch = new Set();
      combinedSubmissions.forEach(sub => uniqueStudentIds.add(sub.studentId)); // All unique students
      uniqueStudentIds.forEach(id => studentIdsToFetch.add(id)); // Populate set for fetching names

      const studentIdsArray = Array.from(studentIdsToFetch);
      if (studentIdsArray.length > 0) {
        const chunkSize = 10; // Firebase 'in' query limit
        for (let i = 0; i < studentIdsArray.length; i += chunkSize) {
          const chunk = studentIdsArray.slice(i, i + chunkSize);
          const studentsDetailsQuery = query(collection(db, 'users'), where('uid', 'in', chunk));
          const studentDetailsSnap = await getDocs(studentsDetailsQuery);
          studentDetailsSnap.docs.forEach(doc => {
            const data = doc.data();
            studentProfiles[data.uid] = data.name || data.displayName || data.email;
          });
        }
      }
      setTotalStudents(uniqueStudentIds.size);

      // 6. Recent Submissions
      const sortedRecentSubmissions = combinedSubmissions
        .sort((a, b) => (b.submittedAt?.toDate ? b.submittedAt.toDate().getTime() : 0) - (a.submittedAt?.toDate ? a.submittedAt.toDate().getTime() : 0))
        .slice(0, 5); // Limit to top 5 recent

      const formattedRecentSubmissions = sortedRecentSubmissions.map(sub => {
        const studentName = studentProfiles[sub.studentId] || `Student ${sub.studentId?.substring(0, 4)}...`;
        const submittedDate = sub.submittedAt?.toDate ? sub.submittedAt.toDate() : null;
        const timeAgo = submittedDate ? `${Math.floor((new Date().getTime() - submittedDate.getTime()) / (1000 * 60 * 60))}h ago` : 'N/A';

        let status = 'Pending';
        let gradeDisplay = null;

        if (sub.type === 'assignment') {
            if (sub.grade !== null && sub.grade !== undefined) {
                status = 'Graded';
                const relatedAssignment = assignments.find(a => a.id === sub.assignmentId);
                gradeDisplay = `${sub.grade}/${relatedAssignment?.maxPoints || '?'}`;
            } else {
                status = 'Needs Review';
            }
        } else if (sub.type === 'test') {
            if (sub.score !== null && sub.score !== undefined) {
                status = 'Graded';
                gradeDisplay = `${sub.score}%`;
            } else {
                status = 'Needs Review';
            }
        }

        return {
          id: sub.id,
          course: sub.assignmentTitle || sub.testTitle || `Unknown ${sub.type}`,
          student: studentName,
          status: status,
          time: timeAgo,
          grade: gradeDisplay,
          type: sub.type, // Added type for notification msg
        };
      });
      setRecentSubmissions(formattedRecentSubmissions);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set fallback values or error message
      setTotalStudents(0);
      setTotalCourses(0);
      setAvgAttendance(0);
      setAvgGrade(0);
      setRecentSubmissions([]);
      setPerformanceChartData([]);
      setAttendanceChartData([]);
    } finally {
      setIsDataLoading(false);
    }
  };

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
  };

  // Mock data for classes to match the card structure (since full class data is complex to derive)
  const mockClassesData = [
    { id: 1, name: 'Algebra I', students: 30, progress: 85, color: 'purple' },
    { id: 2, name: 'Biology Basics', students: 28, progress: 72, color: 'blue' },
    { id: 3, name: 'World History', students: 35, progress: 91, color: 'green' },
  ];


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
                    {recentSubmissions.length > 0 ? (
                      recentSubmissions.map(sub => (
                        <div key={sub.id} className="p-3 hover:bg-slate-700/50 rounded-lg cursor-pointer">
                          <p className="text-sm text-slate-100">
                            New {sub.type} submission from <span className="font-semibold text-purple-300">{sub.student}</span> in <span className="font-semibold text-purple-300">{sub.course}</span>.
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">{sub.time}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 text-sm text-center py-4">No recent submissions to notify.</p>
                    )}
                  </div>
                   <Link to="#" className="block text-center py-3 text-sm text-purple-400 hover:bg-slate-700/70 border-t border-slate-700/60 transition-colors">View All Notifications</Link>
                </div>
              )}
            </div>
            <div ref={profileButtonRef} className="relative">
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
                <div ref={profileMenuRef} className="absolute right-0 mt-3 w-60 bg-slate-800/95 backdrop-blur-xl rounded-xl shadow-2xl border border-slate-700/60 z-50 overflow-hidden">
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
                  <span className="px-2.5 py-1 text-xs bg-green-500/20 text-green-300 rounded-full font-semibold border border-green-500/30">
                  {isDataLoading ? 'Loading...' : `Avg: ${avgGrade}%`}
                  </span>
                </div>
                <p className="text-slate-300 text-sm mb-1.5">Total Courses</p>
                <p className="text-4xl font-bold text-white mb-4">{isDataLoading ? '--' : totalCourses}</p>
                </div>
                <div className="min-h-[140px] flex-1">
                {isDataLoading ? (
                  <div className="flex justify-center items-center h-full text-slate-400 text-sm">Loading Chart...</div>
                ) : performanceChartData.length > 0 ? (
                  <CustomLineChart data={performanceChartData} dataKey="value" color="#8B5CF6" yAxisLabel="Grade %" />
                ) : (
                  <p className="text-slate-400 text-center text-sm py-4">No performance data yet.</p>
                )}
                </div>
              </div>

              <div className="bg-slate-800/60 backdrop-blur-lg p-6 sm:p-8 rounded-2xl border border-slate-700/50 shadow-xl hover:shadow-blue-500/20 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between min-h-[380px]">
                <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3.5 bg-gradient-to-br from-blue-600 to-sky-600 rounded-xl shadow-lg">
                    <ChartPieIcon className="w-7 h-7 text-white" />
                  </div>
                  <span className="px-2.5 py-1 text-xs rounded-full font-semibold border bg-green-500/20 text-green-300 border-green-500/30">
                    {isDataLoading ? 'Loading...' : `Avg: ${avgAttendance === 0 ? 92 : avgAttendance}%`}
                  </span>
                </div>
                <p className="text-slate-300 text-sm mb-1.5">Overall Attendance</p>
                <p className="text-4xl font-bold text-white mb-4">{isDataLoading ? '--' : `${avgAttendance === 0 ? 92 : avgAttendance}%`}</p>
                </div>
                <div className="min-h-[140px] flex-1 flex items-center justify-center">
                 {isDataLoading ? (
                  <div className="flex justify-center items-center h-full text-slate-400 text-sm">Loading Chart...</div>
                 ) : ((attendanceChartData.length > 0 && attendanceChartData.some(d => d.value > 0)) || avgAttendance === 0) ? (
                  <CustomDonutChart data={
                  (attendanceChartData.length > 0 && attendanceChartData.some(d => d.value > 0))
                    ? attendanceChartData
                    : [
                      { name: 'Present', value: 92 },
                      { name: 'Absent', value: 8 },
                      { name: 'Excused', value: 0 }
                    ]
                  } />
                 ) : (
                  <p className="text-slate-400 text-center text-sm py-4">No attendance data yet.</p>
                 )}
                </div>
              </div>

              <div className="bg-slate-800/60 backdrop-blur-lg p-6 sm:p-8 rounded-2xl border border-slate-700/50 shadow-xl hover:shadow-green-500/20 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between min-h-[380px]">
                 <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3.5 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl shadow-lg">
                  <UsersIcon className="w-7 h-7 text-white" />
                  </div>
                  {/* Could add a trend for student count here if historical data available */}
                  <span className="px-2.5 py-1 text-xs rounded-full font-semibold border bg-blue-500/20 text-blue-300 border-blue-500/30">
                      Total Students
                  </span>
                </div>
                <p className="text-slate-300 text-sm mb-1.5">Students Managed</p>
                <p className="text-4xl font-bold text-white mb-6">{isDataLoading ? '--' : totalStudents}</p>
               </div>
               <div className="space-y-3.5 flex-1">
                  {mockClassesData.slice(0,2).map(cls => ( // Using mock data for class progress bars
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
                {educatorSidebarMenu.filter(item => item.link !== '/educator-dashboard').map((action) => ( // Use full menu for quick actions, exclude dashboard itself
                    <Link
                        key={action.title}
                        to={action.link}
                        // Dynamic color based on item title or pre-defined for quick actions
                        className={`group bg-slate-800/60 backdrop-blur-lg p-4 sm:p-5 rounded-xl border border-slate-700/50 hover:border-purple-500/70
                                   transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 transform
                                   flex flex-col items-center text-center aspect-[4/3.5] justify-center`}
                    >
                        {/* Dynamic color based on index or hardcoded for consistency with existing quick actions */}
                        <div className={`mb-3 p-3.5 rounded-full bg-gradient-to-br from-purple-500/40 to-indigo-600/40 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-purple-500/30 group-hover:from-purple-500/60 group-hover:to-indigo-600/60`}>
                             <action.Icon className={`w-7 h-7 sm:w-8 sm:h-8 text-purple-300 transition-colors group-hover:text-white`} />
                        </div>
                        <span className="text-sm sm:text-base font-medium text-slate-100 group-hover:text-purple-300 transition-colors">{action.title}</span>
                    </Link>
                ))}
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Your Classes (mocked progress bars) */}
          <div className="lg:col-span-2 bg-slate-800/60 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-xl">
            <h3 className="text-xl sm:text-2xl font-semibold text-white mb-6">Your Classes</h3>
            <div className="space-y-4 max-h-[26rem] overflow-y-auto pr-2 custom-scrollbar">
              {mockClassesData.map((cls) => (
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
              {isDataLoading ? (
                <p className="text-slate-400 text-center text-sm py-4">Loading recent submissions...</p>
              ) : recentSubmissions.length > 0 ? (
                recentSubmissions.map((submission) => (
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
                ))
              ) : (
                <p className="text-slate-400 text-center text-sm py-4">No recent submissions found.</p>
              )}
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
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Dashboard Data States for mobile
  const [totalStudents, setTotalStudents] = useState(0);
  const [avgAttendance, setAvgAttendance] = useState(0);
  const [upcomingEvents, setUpcomingEvents] = useState([]); // This will likely remain mock or very basic

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if(!user) {
        navigate('/login');
      } else {
        try {
          const profileData = await getUserProfile(user.uid);
          setEducator(profileData || { uid: user.uid, email: user.email, name: user.displayName || "Educator", role: 'educator' });
          fetchMobileDashboardData(user.uid); // Fetch data for mobile
        } catch (error) {
          console.error("Error fetching profile or mobile dashboard data:", error);
        }
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const fetchMobileDashboardData = async (teacherId) => {
    setIsDataLoading(true);
    try {
      // Fetch Total Students (unique students from submissions by this teacher)
      const assignmentsQuery = query(collection(db, 'assignments'), where('teacherId', '==', teacherId));
      const testsQuery = query(collection(db, 'tests'), where('teacherId', '==', teacherId));

      const [assignmentsSnap, testsSnap] = await Promise.all([
        getDocs(assignmentsQuery),
        getDocs(testsQuery)
      ]);

      const assignmentIds = assignmentsSnap.docs.map(doc => doc.id);
      const testIds = testsSnap.docs.map(doc => doc.id);

      const uniqueStudentIds = new Set();
      const allSubmissionsPromises = [];

      assignmentIds.forEach(assignId => {
        allSubmissionsPromises.push(
          getDocs(query(collection(db, 'submissions'), where('assignmentId', '==', assignId)))
            .then(snap => snap.docs.forEach(doc => uniqueStudentIds.add(doc.data().studentId)))
        );
      });
      testIds.forEach(testId => {
        allSubmissionsPromises.push(
          getDocs(query(collection(db, 'testSubmissions'), where('testId', '==', testId)))
            .then(snap => snap.docs.forEach(doc => uniqueStudentIds.add(doc.data().studentId)))
        );
      });
      await Promise.all(allSubmissionsPromises);
      setTotalStudents(uniqueStudentIds.size);


      // Fetch Attendance
      const attendanceRecordsQuery = query(collection(db, 'attendance'), where('markedByTeacherId', '==', teacherId));
      const attendanceSnap = await getDocs(attendanceRecordsQuery);
      let totalAttendanceRecords = 0;
      let totalPresentRecords = 0;
      attendanceSnap.docs.forEach(doc => {
        totalAttendanceRecords++;
        if (doc.data().isPresent) {
          totalPresentRecords++;
        }
      });
      setAvgAttendance(totalAttendanceRecords > 0 ? ((totalPresentRecords / totalAttendanceRecords) * 100).toFixed(1) : 0);

      // Upcoming Events (mocked for simplicity)
      setUpcomingEvents([
        { id: 1, title: 'Calculus Midterm Grading', date: 'Tomorrow, 11:59 PM', type: 'deadline' },
        { id: 2, title: 'Staff Meeting & Q&A', date: 'Today, 3:00 PM - Room 2B', type: 'event' },
      ]);

    } catch (error) {
      console.error('Error fetching mobile dashboard data:', error);
      setTotalStudents(0);
      setAvgAttendance(0);
      setUpcomingEvents([]);
    } finally {
      setIsDataLoading(false);
    }
  };


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
                    <p className="text-xl font-bold text-white">{isDataLoading ? '--' : totalStudents}</p>
                </div>
                <div className="bg-slate-800/70 p-4 rounded-xl border border-slate-700/50 shadow-md">
                    <p className="text-xs text-slate-400 mb-0.5">Avg. Attendance</p>
                    <p className="text-xl font-bold text-green-400">{isDataLoading ? '--' : avgAttendance}%</p>
                </div>
            </div>
        </section>

        {/* Upcoming Events or Deadlines */}
        <section>
            <h3 className="text-lg font-semibold text-slate-100 mb-3.5">Upcoming</h3>
            <div className="bg-slate-800/70 p-4 rounded-xl border border-slate-700/50 shadow-md space-y-3.5">
                {isDataLoading ? (
                  <p className="text-slate-400 text-center text-sm py-4">Loading upcoming events...</p>
                ) : upcomingEvents.length > 0 ? (
                  upcomingEvents.map(event => (
                    <div key={event.id} className="text-sm">
                        <p className="font-semibold text-white">{event.title}</p>
                        <p className={`text-xs ${event.type === 'deadline' ? 'text-yellow-400' : 'text-blue-400'} mt-0.5`}>{event.date}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-center text-sm py-4">No upcoming events or deadlines.</p>
                )}
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