import { useState, useEffect } from 'react';
import { db, auth } from '../../firebase/firebaseConfig'; // Combined import
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import { getUserProfile } from '../../firebase/userOperations'; // Assuming this path is correct

import {
  DocumentTextIcon,
  CalendarIcon,
  XMarkIcon,
  ChevronRightIcon,
  ChatBubbleLeftEllipsisIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  DocumentMagnifyingGlassIcon,
  SparklesIcon,
  HomeIcon,
  FolderIcon,
  ClipboardDocumentIcon,
  ChartBarIcon,
  PresentationChartLineIcon,
  ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon,
  NewspaperIcon,
  WrenchScrewdriverIcon,
  VideoCameraIcon,
  EnvelopeIcon,
  Bars3Icon, // For mobile menu toggle
  ChevronDownIcon, // For profile dropdown
  UserCircleIcon, // For profile placeholders/icons
  Cog6ToothIcon,  // For settings icons
  ArrowLeftOnRectangleIcon, // For logout icon
  GlobeAltIcon, // For app logo in sidebar
} from '@heroicons/react/24/outline';

// --- Student Menu Definition ---
const studentMenu = [
    { title: 'Dashboard', Icon: HomeIcon, link: '/dashboard', description: "Overview of your progress." },
    { title: 'My Resources', Icon: FolderIcon, link: '/resource-utilization', description: "Access course materials." },
    { title: 'Tests', Icon: ClipboardDocumentIcon, link: '/student-tests', description: "Take and view your test results." },
    { title: 'Attendance', Icon: ChartBarIcon, link: '/attendance-monitoring', description: "Track your attendance." },
    { title: 'Assignments', Icon: DocumentTextIcon, link: '/assignment-submission', description: "View & submit assignments." },
    { title: 'Grades & Feedback', Icon: PresentationChartLineIcon, link: '/GradesAndFeedback', description: "Check your grades." },
    { title: 'AI Feedback', Icon: DocumentMagnifyingGlassIcon, link: '/personalized-feedback-students', description: "Get AI-powered insights on your progress." },
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

// --- Student Layout Component ---
const StudentLayout = ({ children, student, pageTitle = "Student Portal" }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const isDesktop = useMediaQuery({ query: '(min-width: 1024px)' });
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('profileUser'); // Adjust if you use a different key for student profile
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const dynamicStudentMenu = studentMenu.map(item => ({
    ...item,
    current: item.link === location.pathname,
  }));

  const SidebarContent = () => (
    <>
      <div className={`p-5 border-b ${isDesktop ? 'border-slate-700/50' : 'border-slate-700/60 flex justify-between items-center'}`}>
        <Link to="/dashboard" className="flex items-center gap-3 group" onClick={() => !isDesktop && setIsMobileSidebarOpen(false)}>
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

      {!isDesktop && student && (
        <div className="p-4 border-b border-slate-700/60 flex items-center gap-3">
          {student.avatar ? (
            <img src={student.avatar} alt="profile" className="w-10 h-10 rounded-full object-cover border-2 border-purple-500/70"/>
          ) : (
            <UserCircleIcon className="w-10 h-10 text-slate-400" />
          )}
          <div>
            <p className="text-sm font-semibold text-white truncate">{student.name || "Student"}</p>
            <p className="text-xs text-slate-400 truncate">{student.email}</p>
          </div>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar"> {/* Ensure custom-scrollbar is defined in CSS */}
        {dynamicStudentMenu.map((item) => (
          <Link
            key={item.title}
            to={item.link}
            onClick={() => !isDesktop && setIsMobileSidebarOpen(false)}
            title={item.description}
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
            <Link to="/student-settings" onClick={() => setIsMobileSidebarOpen(false)} className="group flex items-center gap-3 p-3 text-sm text-slate-200 hover:bg-slate-700/70 hover:text-purple-300 rounded-lg transition-colors">
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
          {!isDesktop && (
            <button onClick={() => setIsMobileSidebarOpen(true)} className="p-2 text-slate-300 hover:bg-slate-700/70 rounded-full" aria-label="Open menu">
              <Bars3Icon className="w-6 h-6" />
            </button>
          )}
          {isDesktop && <div />} {/* Placeholder for desktop header content alignment */}
          {!isDesktop && <span className="text-lg font-semibold text-transparent bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text">{pageTitle}</span>}

          <div className="relative ml-auto"> {/* Profile Dropdown for both */}
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 hover:bg-slate-700/50 p-1.5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {student?.avatar ? (
                <img src={student.avatar} alt={student.name} className="w-8 h-8 rounded-full object-cover border-2 border-purple-500/70" />
              ) : (
                <UserCircleIcon className="w-8 h-8 text-slate-400 hover:text-slate-200" />
              )}
              {isDesktop && student && (
                <span className="text-sm text-white hidden md:inline">{student.name || "Student"}</span>
              )}
              {isDesktop && <ChevronDownIcon className="w-4 h-4 text-slate-400 hidden md:inline" />}
            </button>
            {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-800/95 backdrop-blur-xl rounded-xl shadow-2xl border border-slate-700/60 z-50 overflow-hidden">
                  <div className="p-3.5 border-b border-slate-700/60">
                    <p className="text-white font-semibold text-sm truncate">{student?.name || "Student"}</p>
                    <p className="text-xs text-slate-400 truncate">{student?.email || "student@example.com"}</p>
                  </div>
                  <div className="py-2 px-1.5">
                    <Link to="/student-profile" className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700/60 rounded-md transition-colors" onClick={() => setIsProfileOpen(false)}>
                      <UserCircleIcon className="w-4 h-4 text-slate-400" /> Profile
                    </Link>
                    <Link to="/student-settings" className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700/60 rounded-md transition-colors" onClick={() => setIsProfileOpen(false)}>
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

        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

// --- GradesAndFeedback Component ---
const GradesAndFeedback = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [studentProfile, setStudentProfile] = useState(null);
  const navigate = useNavigate(); // For main component navigation if needed

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const profileData = await getUserProfile(user.uid);
          setStudentProfile(profileData || { uid: user.uid, email: user.email, name: user.displayName || "Student", role: "student" });
          fetchStudentAssignments(user.uid);
        } catch (error) {
          console.error('Error fetching student profile:', error);
          setStudentProfile({ uid: user.uid, email: user.email, name: user.displayName || "Student", role: "student" });
          fetchStudentAssignments(user.uid);
        }
      } else {
        setStudentProfile(null);
        setLoading(false);
        navigate('/login'); // Or handle unauthenticated state
      }
    });

    const fetchStudentAssignments = async (studentId) => {
      setLoading(true);
      try {
        const submissionsRef = collection(db, 'submissions');
        const q = query(
          submissionsRef,
          where('studentId', '==', studentId),
          orderBy('submittedAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const submissionsData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          const submittedAt = data.submittedAt?.toDate?.() || (data.submittedAt ? new Date(data.submittedAt) : new Date());
          const gradedAt = data.gradedAt?.toDate?.() || (data.gradedAt ? new Date(data.gradedAt) : null);
          
          let status = data.status || 'submitted';
          if (data.grade !== null && data.grade !== undefined) {
            status = 'graded';
          } else if (data.status === 'submitted' && (data.grade === null || data.grade === undefined)) {
            status = 'pending';
          }
          
          return {
            id: doc.id,
            ...data,
            submittedAt,
            gradedAt,
            maxPoints: data.maxPoints || 100,
            grade: data.grade !== undefined ? data.grade : null,
            status
          };
        });
        setAssignments(submissionsData);
      } catch (error) {
        console.error('Error fetching submissions:', error);
      } finally {
        setLoading(false);
      }
    };
    return () => unsubscribeAuth();
  }, [navigate]);

  const formatDate = (dateInput) => {
    if (!dateInput) return 'N/A';
    try {
      const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'graded': return 'Graded';
      case 'pending': return 'Pending Review';
      case 'submitted': return 'Submitted';
      default: return 'Not Graded';
    }
  };

  const getGradeColor = (grade, maxPoints) => {
    if (grade === null || grade === undefined || !maxPoints || maxPoints <= 0) return 'text-slate-400';
    const percentage = (grade / maxPoints) * 100;
    if (percentage >= 90) return 'text-emerald-400';
    if (percentage >= 80) return 'text-green-400';
    if (percentage >= 70) return 'text-yellow-400';
    if (percentage >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  const AssignmentDetails = ({ assignment, onClose }) => {
    if (!assignment) return null;

    const hasFeedback = assignment.feedback && assignment.feedback.trim() !== "";
    const hasSuggestions = assignment.suggestions && Array.isArray(assignment.suggestions) && assignment.suggestions.length > 0;
    const isAIGraded = assignment.gradedByAI === true || (assignment.gradedAt && assignment.status === 'graded' && (assignment.feedback || assignment.suggestions));

    return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-lg flex items-center justify-center z-[100] p-4">
      <div className="bg-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl w-full max-w-2xl md:max-w-3xl max-h-[90vh] overflow-y-auto custom-scrollbar-thin"> {/* Ensure custom-scrollbar-thin is defined */}
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent">
            {assignment.title || "Assignment Details"}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white bg-slate-700/60 hover:bg-slate-600/70 rounded-full p-2 transition-colors">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-700/50 p-5 rounded-xl shadow-lg">
              <p className="text-xs text-sky-300/90 font-medium mb-1">Submitted On</p>
              <p className="text-slate-100 text-base sm:text-lg font-semibold">{formatDate(assignment.submittedAt)}</p>
            </div>
            <div className="bg-slate-700/50 p-5 rounded-xl shadow-lg">
              <p className="text-xs text-sky-300/90 font-medium mb-1">Status & Grade</p>
              <div className="flex items-baseline justify-between gap-2">
                <p className={`text-base sm:text-lg font-semibold ${ assignment.status === 'graded' ? 'text-emerald-400' : assignment.status === 'pending' ? 'text-amber-400' : 'text-slate-400' }`}>
                  {getStatusText(assignment.status)}
                </p>
                {assignment.grade !== null && assignment.grade !== undefined && (
                  <p className={`text-xl sm:text-2xl font-bold ${getGradeColor(assignment.grade, assignment.maxPoints)}`}>
                    {assignment.grade}<span className="text-base text-slate-400"> / {assignment.maxPoints}</span>
                  </p>
                )}
              </div>
              {assignment.grade !== null && assignment.grade !== undefined && assignment.maxPoints > 0 && (
                <div className="w-full bg-slate-600/50 rounded-full h-2 mt-2 overflow-hidden">
                  <div className={`h-full rounded-full ${ ((assignment.grade / assignment.maxPoints) * 100) >= 90 ? 'bg-emerald-500' : ((assignment.grade / assignment.maxPoints) * 100) >= 70 ? 'bg-yellow-500' : 'bg-red-500' }`}
                    style={{ width: `${(assignment.grade / assignment.maxPoints) * 100}%` }}
                  ></div>
                </div>
              )}
              {isAIGraded && (
                <p className="text-xs text-slate-400 mt-2 flex items-center">
                  <SparklesIcon className="w-4 h-4 mr-1.5 text-yellow-400" />
                  AI-Assisted Grading {assignment.gradedAt ? `· ${formatDate(assignment.gradedAt)}` : ''}
                </p>
              )}
            </div>
          </div>
          {assignment.instructions && (
            <div className="bg-slate-700/50 p-5 rounded-xl shadow-lg">
              <h4 className="text-base sm:text-lg font-semibold text-sky-300 mb-2.5">Assignment Description</h4>
              <div className="prose prose-sm sm:prose-base prose-invert max-w-none text-slate-300 leading-relaxed whitespace-pre-wrap">{assignment.instructions}</div>
            </div>
          )}
          {(hasFeedback || isAIGraded ) && (
            <div className="bg-slate-700/50 p-5 rounded-xl shadow-lg">
              <h4 className="text-base sm:text-lg font-semibold text-sky-300 mb-2.5 flex items-center">
                <ChatBubbleLeftEllipsisIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-sky-400" />
                {isAIGraded ? 'AI Feedback' : 'Feedback'}
              </h4>
              {hasFeedback ? (
                <div className="prose prose-sm sm:prose-base prose-invert max-w-none text-slate-300 leading-relaxed whitespace-pre-wrap">{assignment.feedback}</div>
              ) : ( <p className="text-slate-400 italic text-sm sm:text-base">{assignment.status === 'graded' ? 'No specific feedback was provided.' : 'Feedback will be available after grading.'}</p> )}
            </div>
          )}
          {(hasSuggestions || isAIGraded ) && (
            <div className="bg-slate-700/50 p-5 rounded-xl shadow-lg">
              <h4 className="text-base sm:text-lg font-semibold text-sky-300 mb-2.5 flex items-center">
                <LightBulbIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-yellow-400" /> Suggestions
              </h4>
              {hasSuggestions ? (
                <ul className="list-disc list-inside space-y-1.5 text-slate-300 pl-1 text-sm sm:text-base">
                  {assignment.suggestions.map((suggestion, index) => (<li key={index} className="leading-relaxed">{suggestion}</li>))}
                </ul>
              ) : ( <p className="text-slate-400 italic text-sm sm:text-base">{isAIGraded ? 'No specific AI suggestions generated.' : 'No suggestions provided.'}</p> )}
            </div>
          )}
          {!hasFeedback && !hasSuggestions && assignment.grade !== null && !isAIGraded && (
            <div className="bg-slate-700/50 p-5 rounded-xl shadow-lg text-center">
              <ExclamationTriangleIcon className="w-10 h-10 text-amber-400 mx-auto mb-3"/>
              <p className="text-slate-300 text-sm sm:text-base">Graded. No additional feedback/suggestions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
    );
  }

  return (
    <StudentLayout student={studentProfile} pageTitle="Grades & Feedback">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent">Grades & Feedback</span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg">Review performance and feedback on submitted assignments.</p>
        </header>

        {loading && !studentProfile ? ( // Initial auth check loading
             <div className="flex flex-col items-center justify-center h-64 text-slate-400 text-lg">
                <svg className="animate-spin h-10 w-10 text-sky-500 mb-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Authenticating...
            </div>
        ) : loading && studentProfile ? ( // Assignments loading
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 text-lg">
                <svg className="animate-spin h-10 w-10 text-sky-500 mb-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading your grades...
            </div>
        ) : !loading && assignments.length === 0 ? (
          <div className="text-center py-12 sm:py-16 bg-slate-800/50 rounded-xl shadow-lg">
            <DocumentTextIcon className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-slate-600 mb-6" />
            <h3 className="text-xl sm:text-2xl font-semibold text-slate-300 mb-3">No Grades Yet</h3>
            <p className="text-slate-500 text-sm sm:text-base max-w-md mx-auto px-4">No assignments submitted or graded work to display.</p>
          </div>
        ) : (
          <div className="space-y-5 sm:space-y-6">
            {assignments.map((submission) => (
              <div
                key={submission.id}
                className="bg-slate-800/70 rounded-xl p-5 sm:p-6 shadow-xl hover:shadow-sky-500/20 border border-slate-700/80 hover:border-sky-600/70 transition-all duration-300 ease-in-out transform hover:-translate-y-1 group cursor-pointer"
                onClick={() => { setSelectedAssignment(submission); setShowDetails(true); }}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl font-semibold text-sky-400 group-hover:text-sky-300 transition-colors duration-200 mb-1 truncate">
                      {submission.title || "Untitled Assignment"}
                    </h3>
                    <div className="flex items-center text-xs sm:text-sm text-slate-400">
                      <CalendarIcon className="w-4 h-4 mr-1.5 text-slate-500 flex-shrink-0" />
                      Submitted: {formatDate(submission.submittedAt)}
                    </div>
                  </div>
                  <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end mt-3 sm:mt-0 gap-3 sm:gap-4">
                    <div className="text-left sm:text-right">
                      <p className="text-xs text-slate-500 mb-0.5">Status</p>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-md text-xs sm:text-sm font-medium ${ submission.status === 'graded' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : submission.status === 'pending' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-500/20 text-slate-400 border border-slate-500/30' }`}>
                          {getStatusText(submission.status)}
                        </span>
                        {submission.grade !== null && submission.grade !== undefined && (
                          <span className={`text-base sm:text-lg font-bold ${getGradeColor(submission.grade, submission.maxPoints)}`}>
                            {submission.grade}<span className="text-xs text-slate-400">/{submission.maxPoints}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRightIcon className="w-6 h-6 sm:w-7 sm:h-7 text-slate-500 group-hover:text-sky-400 transition-colors duration-200 flex-shrink-0" />
                  </div>
                </div>
                {submission.status === 'graded' && submission.grade !== null && submission.grade !== undefined && submission.maxPoints > 0 && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Grade Progress</span>
                      <span>{((submission.grade / submission.maxPoints) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-slate-700/70 rounded-full h-1.5 sm:h-2">
                      <div className={`h-full rounded-full transition-all duration-500 ease-out ${ ((submission.grade / submission.maxPoints) * 100) >= 90 ? 'bg-gradient-to-r from-emerald-500 to-green-500' : ((submission.grade / submission.maxPoints) * 100) >= 70 ? 'bg-gradient-to-r from-yellow-500 to-amber-500' : 'bg-gradient-to-r from-red-500 to-rose-500' }`}
                           style={{ width: `${(submission.grade / submission.maxPoints) * 100}%` }}>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {showDetails && selectedAssignment && (
        <AssignmentDetails assignment={selectedAssignment} onClose={() => { setShowDetails(false); setSelectedAssignment(null); }} />
      )}
    </StudentLayout>
  );
};

export default GradesAndFeedback;

// Add to your global CSS (e.g., index.css or App.css):
/*
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(30, 41, 59, 0.5); // slate-800 with opacity
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(71, 85, 105, 0.7); // slate-600 with opacity
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(100, 116, 139, 0.9); // slate-500 with opacity
}

.custom-scrollbar-thin::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar-thin::-webkit-scrollbar-thumb {
  background: #4A5568; // slate-600 or similar
  border-radius: 10px;
}
.custom-scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: #718096; // slate-500 or similar
}

// If you use Tailwind Typography plugin for .prose class:
// Ensure it's installed and configured: npm install -D @tailwindcss/typography
// Add to tailwind.config.js: plugins: [require('@tailwindcss/typography')],
*/