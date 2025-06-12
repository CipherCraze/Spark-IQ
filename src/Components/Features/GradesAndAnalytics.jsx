import { useState, useEffect, useRef } from 'react';
import { db, auth } from '../../firebase/firebaseConfig'; // Combined import
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { signOut, onAuthStateChanged } from 'firebase/auth'; // For Layout
import { Link, useNavigate, useLocation } from 'react-router-dom'; // For Layout
import { useMediaQuery } from 'react-responsive'; // For Layout
import { getUserProfile } from '../../firebase/userOperations'; // Assuming path for Layout

// Icons for GradesAndAnalytics
import {
  DocumentTextIcon,
  CalendarIcon,
  // XMarkIcon, // Defined below for Layout
  // ChevronRightIcon, // Defined below for Layout
  UsersIcon as OutlineUsersIcon, // Renamed to avoid conflict if SolidUserGroupIcon is also used
  // ChartBarIcon, // Defined below for Layout
  // SparklesIcon, // Defined below for Layout
  ArrowTrendingUpIcon,
  // AcademicCapIcon, // Defined below for Layout
} from '@heroicons/react/24/outline';

// Icons for Layout and Menu
import {
  PresentationChartLineIcon,
  ClipboardDocumentIcon,
  FolderIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon as SolidUserGroupIcon, // Assuming this is from outline, aliased
  GlobeAltIcon,
  EnvelopeIcon,
  VideoCameraIcon,
  MegaphoneIcon,
  SparklesIcon,             // Also used in menu
  AcademicCapIcon,          // Also used in menu
  ChartBarIcon,             // Also used in menu
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  DocumentMagnifyingGlassIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  ChevronRightIcon,         // Also used in G&A cards
} from '@heroicons/react/24/outline';


// Recharts components
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Sector
} from 'recharts';

// --- Educator Menu Definition ---
const educatorSidebarMenuSource = [
    { title: 'Dashboard', Icon: PresentationChartLineIcon, link: '/educator-dashboard'},
    { title: 'Assignments', Icon: ClipboardDocumentIcon, link: '/assignment-management' },
    { title: 'Tests', Icon: ClipboardDocumentIcon, link: '/teacher-tests' },
    { title: 'Grades & Analytics', Icon: AcademicCapIcon, link: '/GradesAndAnalytics', current: true  }, // Hardcoded current for this page
    { title: 'Resources', Icon: FolderIcon, link: '/resource-management' },
    { title: 'Attendance', Icon: ChartBarIcon, link: '/attendance-tracking' },
    { title: 'Teacher Insights', Icon: DocumentMagnifyingGlassIcon, link: '/personalized-feedback-educators', current: false},
    { title: 'Voice Chat', Icon: ChatBubbleLeftRightIcon, link: '/teacher-voice-chat' },
    { title: 'AI Chatbot (Ask Sparky)', Icon: ChatBubbleLeftRightIcon, link: '/chatbot-education' },
    { title: 'AI Questions', Icon: SparklesIcon, link: '/ai-generated-questions-educator' },
    { title: 'Social / Chat', Icon: SolidUserGroupIcon, link: '/chat-functionality' },
    { title: 'Educational News', Icon: GlobeAltIcon, link: '/educational-news' },
    { title: 'Student Suggestions', Icon: EnvelopeIcon, link: '/suggestions-to-students' },
    { title: 'Meetings & Conferences', Icon: VideoCameraIcon, link: '/meeting-host' },
    { title: 'Announcements', Icon: MegaphoneIcon, link: '/announcements' },
    { title: 'Upgrade to Pro', Icon: SparklesIcon, link: '/pricing', special: true },
];

// --- Educator Layout Component ---
const EducatorLayout = ({ children, educator, pageTitle = "Educator Portal" }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const isDesktop = useMediaQuery({ query: '(min-width: 1024px)' });
  const navigate = useNavigate();
  const location = useLocation(); // Use location to dynamically set current if needed

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

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('profileUser'); // Adjust if using a different key
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // For a truly dynamic current item, you'd map over educatorSidebarMenuSource
  // and set 'current' based on location.pathname.
  // Since it's hardcoded for this page, we use educatorSidebarMenuSource directly.
  // Example of dynamic current:
  const dynamicEducatorMenu = educatorSidebarMenuSource.map(item => ({
    ...item,
    current: item.link === location.pathname, // This line makes it dynamic
  }));
  // For this specific request, since 'current: true' is already in the source for G&A,
  // we can use educatorSidebarMenuSource or dynamicEducatorMenu. I'll use dynamicEducatorMenu for good practice.


  const SidebarContent = () => (
    <>
      <div className={`p-5 border-b ${isDesktop ? 'border-slate-700/50' : 'border-slate-700/60 flex justify-between items-center'}`}>
        <Link to="/educator-dashboard" className="flex items-center gap-3 group" onClick={() => !isDesktop && setIsMobileSidebarOpen(false)}>
            <GlobeAltIcon className="w-8 h-10 text-purple-500 group-hover:text-purple-400 transition-all duration-300 transform group-hover:rotate-[15deg] group-hover:scale-105" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
              SPARK-IQ
            </h1>
        </Link>
        {!isDesktop && (
          <button onClick={() => setIsMobileSidebarOpen(false)} className="p-2 text-slate-400 hover:bg-slate-700/70 rounded-full">
            <XMarkIcon className="w-6 h-6" />
          </button>
        )}
      </div>
      {!isDesktop && educator && (
        <div className="p-4 border-b border-slate-700/60 flex items-center gap-3">
          {educator.avatar ? (
            <img src={educator.avatar} alt="profile" className="w-10 h-10 rounded-full object-cover border-2 border-purple-500/70"/>
          ) : (
            <UserCircleIcon className="w-10 h-10 text-slate-400" />
          )}
          <div>
            <p className="text-sm font-semibold text-white truncate">{educator.name || "Educator"}</p>
            <p className="text-xs text-slate-400 truncate">{educator.email}</p>
          </div>
        </div>
      )}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
        {dynamicEducatorMenu.map((item) => (
          <Link
            key={item.title}
            to={item.link}
            onClick={() => !isDesktop && setIsMobileSidebarOpen(false)}
            className={`group flex items-center gap-3.5 px-4 py-3 text-sm rounded-lg transition-all duration-200 ease-in-out
              ${item.current
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg ring-1 ring-purple-500/60 transform scale-[1.02]'
                : item.special
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white font-semibold hover:from-amber-500 hover:to-orange-600 shadow-md hover:shadow-lg'
                  : 'text-slate-300 hover:bg-slate-700/60 hover:text-purple-300 hover:shadow-sm'
              }
            `}
          >
            <item.Icon className={`w-5 h-5 flex-shrink-0 ${item.current ? 'text-white' : item.special ? 'text-white/90' : 'text-slate-400 group-hover:text-purple-300' } transition-colors`} />
            <span className="truncate">{item.title}</span>
          </Link>
        ))}
      </nav>
      {!isDesktop && (
        <div className="p-4 border-t border-slate-700/60 space-y-2">
            <Link to="/educator-settings" onClick={() => setIsMobileSidebarOpen(false)} className="group flex items-center gap-3 p-3 text-sm text-slate-200 hover:bg-slate-700/70 hover:text-purple-300 rounded-lg transition-colors">
                <Cog6ToothIcon className="w-5 h-5 text-slate-400 group-hover:text-purple-300"/>Settings
            </Link>
            <button onClick={handleLogout} className="group flex items-center gap-3 w-full p-3 text-sm text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-lg transition-colors">
                <ArrowLeftOnRectangleIcon className="w-5 h-5 text-red-500 group-hover:text-red-400"/>Logout
            </button>
        </div>
      )}
    </>
  );

  return (
    // Layout uses "slate" theme for aesthetic consistency with previous "stunning" examples
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 flex text-slate-100">
      {isDesktop ? (
        <aside className="fixed top-0 left-0 h-screen w-64 bg-slate-800/80 backdrop-blur-2xl border-r border-slate-700/50 flex flex-col shadow-2xl z-40">
          <SidebarContent />
        </aside>
      ) : (
        <>
          <aside className={`fixed top-0 left-0 h-full w-72 bg-slate-800/90 backdrop-blur-xl border-r border-slate-700/60 transform transition-transform duration-300 ease-in-out z-[60] flex flex-col shadow-2xl ${
            isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
            <SidebarContent />
          </aside>
          {isMobileSidebarOpen && <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 lg:hidden" onClick={() => setIsMobileSidebarOpen(false)}></div>}
        </>
      )}
      <div className={`flex-1 transition-all duration-300 ease-in-out ${isDesktop ? 'ml-64' : ''}`}>
        <header className={`sticky top-0 ${isDesktop ? '' : 'px-4'} py-3.5 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50 z-30 flex items-center justify-between shadow-sm`}>
          <div className="flex items-center">
            {!isDesktop && (
              <button onClick={() => setIsMobileSidebarOpen(true)} className="p-2 text-slate-300 hover:bg-slate-700/70 rounded-full mr-2" aria-label="Open menu">
                <Bars3Icon className="w-6 h-6" />
              </button>
            )}
             {/* For desktop, the title is usually in the main content. Mobile gets it in the header. */}
            {!isDesktop && <span className="text-lg font-semibold text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text">{pageTitle}</span>}
            {isDesktop && <div className="w-8"></div> /* Placeholder for alignment if needed */}
          </div>
          <div ref={profileButtonRef} className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 hover:bg-slate-700/50 p-1.5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {educator?.avatar ? (
                <img src={educator.avatar} alt={educator.name} className="w-8 h-8 rounded-full object-cover border-2 border-purple-500/70" />
              ) : (
                <UserCircleIcon className="w-8 h-8 text-slate-400 hover:text-slate-200" />
              )}
              {isDesktop && educator && (
                <span className="text-sm text-white hidden md:inline">{educator.name || "Educator"}</span>
              )}
              {isDesktop && <ChevronDownIcon className="w-4 h-4 text-slate-400 hidden md:inline" />}
            </button>
            {isProfileOpen && (
                <div ref={profileMenuRef} className="absolute right-0 mt-2 w-56 bg-slate-800/95 backdrop-blur-xl rounded-xl shadow-2xl border border-slate-700/60 z-50 overflow-hidden">
                  <div className="p-3.5 border-b border-slate-700/60">
                    <p className="text-white font-semibold text-sm truncate">{educator?.name || "Educator"}</p>
                    <p className="text-xs text-slate-400 truncate">{educator?.email || "educator@example.com"}</p>
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
        </header>
        {/* The children (GradesAndAnalytics content) will use its own theme (gray) as per "no other changes" */}
        <main className="p-0"> {/* Remove padding here so child can control it */}
          {children}
        </main>
      </div>
    </div>
  );
};


// --- GradesAndAnalytics Component (Original logic preserved) ---
const GradesAndAnalytics = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [educatorProfile, setEducatorProfile] = useState(null); // For layout
  const navigate = useNavigate(); // For layout redirects if needed

  useEffect(() => {
    // Fetch educator profile for layout
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
        if (user) {
          try {
            const profileData = await getUserProfile(user.uid);
            setEducatorProfile(profileData || { uid: user.uid, email: user.email, name: user.displayName || "Educator", role: "educator" });
            // Now call the original data fetching logic
            fetchAssignmentsData(user.uid);
          } catch (error) {
            console.error("Error fetching educator profile:", error);
            setEducatorProfile({ uid: user.uid, email: user.email, name: user.displayName || "Educator", role: "educator" });
            fetchAssignmentsData(user.uid); // Still attempt to fetch assignments
          }
        } else {
          setEducatorProfile(null);
          setLoading(false); // Stop loading if no user
          // navigate('/login'); // Handled by onAuthStateChanged if G&A is a protected route
        }
      });
  
      // Original fetchAssignmentsData logic, modified to accept teacherId
      const fetchAssignmentsData = async (teacherId) => {
        // setLoading(true); // setLoading is already true or handled by auth state
        try {
          const assignmentsRef = collection(db, 'assignments');
          // Ensure teacherId from auth is used here
          const q = query(assignmentsRef, where('teacherId', '==', teacherId));
          const querySnapshot = await getDocs(q);
  
          const assignmentsData = await Promise.all(
            querySnapshot.docs.map(async (doc) => {
              const assignment = { id: doc.id, ...doc.data() };
              const submissionsQuery = query(
                collection(db, 'submissions'),
                where('assignmentId', '==', assignment.id)
              );
              const submissionsSnapshot = await getDocs(submissionsQuery);
              const submissions = submissionsSnapshot.docs.map(subDoc => ({ id: subDoc.id, ...subDoc.data() }));
  
              const totalSubmissions = submissions.length;
              const gradedSubmissions = submissions.filter(sub => sub.grade !== null && sub.grade !== undefined);
              const averageGrade = gradedSubmissions.length > 0
                ? gradedSubmissions.reduce((acc, sub) => acc + (Number(sub.grade) || 0), 0) / gradedSubmissions.length
                : 0;
  
              const gradeDistribution = {
                'A (90-100)': 0, 'B (80-89)': 0, 'C (70-79)': 0, 'D (60-69)': 0, 'F (0-59)': 0
              };
              gradedSubmissions.forEach(sub => {
                const maxPoints = Number(assignment.maxPoints) || 100; // Ensure maxPoints is a number
                const grade = Number(sub.grade) || 0;
                const percentage = maxPoints > 0 ? (grade / maxPoints) * 100 : 0;

                if (percentage >= 90) gradeDistribution['A (90-100)']++;
                else if (percentage >= 80) gradeDistribution['B (80-89)']++;
                else if (percentage >= 70) gradeDistribution['C (70-79)']++;
                else if (percentage >= 60) gradeDistribution['D (60-69)']++;
                else gradeDistribution['F (0-59)']++;
              });
  
              return {
                ...assignment,
                submissions,
                totalSubmissions,
                gradedSubmissionsCount: gradedSubmissions.length, // Use distinct name
                averageGrade,
                gradeDistribution,
                submissionRate: assignment.totalStudentsEnrolled && Number(assignment.totalStudentsEnrolled) > 0
                  ? (totalSubmissions / Number(assignment.totalStudentsEnrolled)) * 100
                  : 0,
              };
            })
          );
          setAssignments(assignmentsData);
        } catch (error) {
          console.error('Error fetching assignments:', error);
        } finally {
          setLoading(false);
        }
      };
      
      return () => unsubscribeAuth(); // Cleanup auth listener
  }, [navigate]); // Added navigate to dependency array

  const formatDate = (dateInput) => { // Accept Firestore Timestamp or string/Date
    if (!dateInput) return 'N/A';
    try {
      const date = dateInput.toDate ? dateInput.toDate() : new Date(dateInput);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#6B7280']; // Emerald, Blue, Amber, Red, Slate

  const AssignmentDetails = ({ assignment, onClose }) => {
    const gradeDistributionData = Object.entries(assignment.gradeDistribution)
      .map(([grade, count]) => ({ name: grade, value: count }))
      .filter(entry => entry.value > 0); // Only show grades with students

    const submissionTrendData = [
      { name: 'Submitted', value: assignment.totalSubmissions, fill: '#10B981' },
      { name: 'Not Submitted', value: Math.max(0, (Number(assignment.totalStudentsEnrolled) || 0) - assignment.totalSubmissions), fill: '#EF4444' }
    ];

    return (
      // Modal styling preserved from original
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4"> {/* Increased z-index */}
        <div className="bg-gray-800 rounded-2xl p-6 sm:p-8 w-full max-w-4xl lg:max-w-6xl max-h-[90vh] overflow-y-auto custom-scrollbar-thin">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {assignment.title}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700 transition-colors">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-700/30 rounded-xl p-4">
              <p className="text-gray-400 text-sm mb-1">Total Submissions</p>
              <p className="text-2xl font-bold text-white">{assignment.totalSubmissions}</p>
            </div>
            <div className="bg-gray-700/30 rounded-xl p-4">
              <p className="text-gray-400 text-sm mb-1">Average Grade</p>
              <p className="text-2xl font-bold text-white">{assignment.averageGrade.toFixed(1)}%</p>
            </div>
            <div className="bg-gray-700/30 rounded-xl p-4">
              <p className="text-gray-400 text-sm mb-1">Submission Rate</p>
              <p className="text-2xl font-bold text-white">{assignment.submissionRate.toFixed(1)}%</p>
            </div>
            <div className="bg-gray-700/30 rounded-xl p-4">
              <p className="text-gray-400 text-sm mb-1">Max Points</p>
              <p className="text-2xl font-bold text-white">{assignment.maxPoints}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-700/30 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Grade Distribution</h4>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={gradeDistributionData} cx="50%" cy="50%" labelLine={false}
                      label={({ name, percent }) => `${name.split(' ')[0]} (${(percent * 100).toFixed(0)}%)`} // Simpler label
                      outerRadius={100} fill="#8884d8" dataKey="value"
                    >
                      {gradeDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(55, 65, 81, 0.8)', borderColor: '#4B5563', borderRadius: '0.5rem' }} itemStyle={{ color: '#E5E7EB' }}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-gray-700/30 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Submission Status</h4>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={submissionTrendData} layout="vertical" barSize={35}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4B556350" />
                    <XAxis type="number" stroke="#9CA3AF"/>
                    <YAxis dataKey="name" type="category" stroke="#9CA3AF" width={100}/>
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(55, 65, 81, 0.8)', borderColor: '#4B5563', borderRadius: '0.5rem' }} itemStyle={{ color: '#E5E7EB' }}/>
                    <Bar dataKey="value" radius={[0, 10, 10, 0]}>
                      {submissionTrendData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h4 className="text-lg font-semibold text-white mb-4">Student Submissions ({assignment.submissions.length})</h4>
            <div className="bg-gray-700/30 rounded-xl overflow-hidden max-h-96 custom-scrollbar-thin">
              <table className="w-full min-w-[600px]">
                <thead className="bg-gray-700/50 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Submitted On</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Grade</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {assignment.submissions.length > 0 ? assignment.submissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-gray-700/40 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{submission.studentName || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{formatDate(submission.submittedAt)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {submission.grade !== null && submission.grade !== undefined ? (
                          <span className="text-white font-medium">{submission.grade} / {assignment.maxPoints}</span>
                        ) : ( <span className="text-gray-400 italic">Not Graded</span> )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                          submission.grade !== null && submission.grade !== undefined ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                          submission.status === 'submitted' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                          'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}>
                          {submission.grade !== null && submission.grade !== undefined ? 'Graded' : (submission.status || 'Pending')}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="4" className="text-center py-10 text-gray-500 italic">No submissions available for this assignment.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <EducatorLayout educator={educatorProfile} pageTitle="Grades & Analytics">
      {/* Content uses "gray" theme as per original, padding controlled by this div */}
      <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8 sm:mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Grades & Analytics
              </span>
            </h1>
            <p className="text-gray-400 text-base sm:text-lg">View detailed analytics and performance metrics for all assignments.</p>
          </header>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <svg className="animate-spin h-12 w-12 text-purple-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-gray-400">Loading analytics data...</p>
            </div>
          ) : assignments.length === 0 ? (
            <div className="text-center py-12 sm:py-16 bg-gray-800/50 rounded-xl shadow-lg border border-gray-700/50">
              <DocumentTextIcon className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-gray-600 mb-6" />
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-300 mb-3">No Assignments Found</h3>
              <p className="text-gray-500 text-sm sm:text-base max-w-md mx-auto px-4">Create assignments to start tracking student performance.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="bg-gray-800/60 rounded-xl p-5 sm:p-6 shadow-lg hover:shadow-purple-500/20 border border-gray-700/70 hover:border-purple-600/60 transition-all duration-300 ease-in-out transform hover:-translate-y-1 group cursor-pointer flex flex-col justify-between"
                  onClick={() => { setSelectedAssignment(assignment); setShowDetails(true); }}
                >
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-purple-300 group-hover:text-purple-200 transition-colors mb-3 truncate">
                      {assignment.title}
                    </h3>
                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                      <div className="bg-gray-700/50 p-2.5 rounded-lg">
                        <p className="text-xs text-gray-400 mb-0.5">Submissions</p>
                        <p className="font-semibold text-white">{assignment.totalSubmissions} / {Number(assignment.totalStudentsEnrolled) || 'N/A'}</p>
                      </div>
                      <div className="bg-gray-700/50 p-2.5 rounded-lg">
                        <p className="text-xs text-gray-400 mb-0.5">Avg. Grade</p>
                        <p className="font-semibold text-emerald-400">{assignment.averageGrade.toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm text-gray-400 pt-3 border-t border-gray-700/50">
                    <span>Due: {formatDate(assignment.dueDate)}</span>
                    <ChevronRightIcon className="w-5 h-5 text-gray-500 group-hover:text-purple-400 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showDetails && selectedAssignment && (
          <AssignmentDetails assignment={selectedAssignment} onClose={() => { setShowDetails(false); setSelectedAssignment(null); }} />
        )}
      </div>
    </EducatorLayout>
  );
};

export default GradesAndAnalytics;

// Add to your global CSS (e.g., index.css or App.css):
/*
.custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
.custom-scrollbar::-webkit-scrollbar-track { background: rgba(30, 41, 59, 0.5); border-radius: 10px; } // slate-800 with opacity
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(71, 85, 105, 0.7); border-radius: 10px; } // slate-600 with opacity
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(100, 116, 139, 0.9); } // slate-500 with opacity

.custom-scrollbar-thin::-webkit-scrollbar { width: 6px; height: 6px; }
.custom-scrollbar-thin::-webkit-scrollbar-track { background: rgba(55, 65, 81, 0.1); } // gray-700 with opacity for modal
.custom-scrollbar-thin::-webkit-scrollbar-thumb { background: #4B5563; border-radius: 10px; } // gray-600 for modal
.custom-scrollbar-thin::-webkit-scrollbar-thumb:hover { background: #6B7280; } // gray-500 for modal
*/