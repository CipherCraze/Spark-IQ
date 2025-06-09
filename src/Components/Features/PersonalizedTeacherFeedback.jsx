// Combine all necessary imports from both original files
import { useState, useEffect, useRef, useMemo } from 'react'; // Added useMemo just in case, but maybe not strictly needed
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios'; // Use axios for direct API call

// Firebase and Auth
import { db, auth } from '../../firebase/firebaseConfig';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'; // Removed 'sum' as it's not used for aggregation in client-side code here
import { signOut, onAuthStateChanged } from 'firebase/auth';

// Other Utilities (like getUserProfile)
import { getUserProfile } from '../../firebase/userOperations'; // Assuming this path is correct

// Combine Icons from both files, resolving duplicates
import {
  DocumentTextIcon, // Used in G&A card, PF stats card
  CalendarIcon, // Used in G&A card
  XMarkIcon, // Used in Layout
  ChevronRightIcon, // Used in G&A cards
  ChatBubbleLeftEllipsisIcon, // Used in G&A details (though commented out in provided)
  LightBulbIcon, // Used in PF feedback section menu
  ExclamationTriangleIcon, // Used in G&A details (though commented out in provided)
  SparklesIcon, // Used in menu, PF button
  HomeIcon, // Used in menu
  FolderIcon, // Used in menu, PF stats card
  ClipboardDocumentIcon, // Used in menu, PF stats card (tests)
  ChartBarIcon, // Used in menu (Attendance), PF stats card (Attendance)
  PresentationChartLineIcon, // Used in menu (Dashboard)
  ChatBubbleLeftRightIcon, // Used in menu
  QuestionMarkCircleIcon, // Used in menu
  NewspaperIcon, // Used in menu
  WrenchScrewdriverIcon, // Used in menu
  VideoCameraIcon, // Used in menu
  AcademicCapIcon, // Used in menu

  CheckCircleIcon, // Used in G&A card (for completed assignments)
    MegaphoneIcon, // Used in menu
  EnvelopeIcon, // Used in menu
  Bars3Icon, // Used in Layout (mobile toggle)
  ChevronDownIcon, // Used in Layout (profile dropdown)
  UserCircleIcon, // Used in Layout (profile placeholder)
  Cog6ToothIcon,  // Used in Layout (settings icon)
  ArrowLeftOnRectangleIcon, // Used in Layout (logout icon)
  GlobeAltIcon, // Used in Layout (logo)
  UsersIcon, // Used in PF stats card (Attendance) - Assuming this is the outline UsersIcon
  ArrowTrendingUpIcon, // Used in PF feedback section
  InformationCircleIcon, // Used in PF disclaimer
  // Note: SolidUserGroupIcon was in AttendanceTracking and TeacherTests menus,
  // but we're using EducatorLayout's menu definition here. Let's ensure the one
  // used in the EducatorLayout menu definition is included.
  UserGroupIcon as SolidUserGroupIcon, // Assuming this is the solid one used in the menu
  // If InsightsIcon alias is specifically needed, keep it, otherwise use ChartBarIcon directly where needed
} from '@heroicons/react/24/outline';

// Alias ChartBarIcon as InsightsIcon for use in the menu
const InsightsIcon = ChartBarIcon;
// Check if SolidUserGroupIcon is from '/24/solid' - adjust if necessary. It was inconsistent across inputs.
// Based on the usage in the menu, UserGroupIcon (outline) and SolidUserGroupIcon (solid) seem intended as distinct.

// --- Educator Menu Definition (Keep only one source) ---
const educatorSidebarMenuSource = [
    { title: 'Dashboard', Icon: PresentationChartLineIcon, link: '/educator-dashboard'},
    { title: 'Assignments', Icon: ClipboardDocumentIcon, link: '/assignment-management' },
    { title: 'Tests', Icon: ClipboardDocumentIcon, link: '/teacher-tests' },
    { title: 'Grades & Analytics', Icon: AcademicCapIcon, link: '/GradesAndAnalytics'},
    { title: 'Resources', Icon: FolderIcon, link: '/resource-management' },
    { title: 'Attendance', Icon: ChartBarIcon, link: '/attendance-tracking' },
    // --- NEW MENU ITEM ---
    // Use the InsightsIcon alias defined above for the new menu item
    { title: 'Teacher Insights', Icon: InsightsIcon, link: '/teacher-insights', description: "Get AI-powered feedback on your teaching activity." },
    // --- END NEW MENU ITEM ---
    { title: 'Voice Chat', Icon: ChatBubbleLeftRightIcon, link: '/teacher-voice-chat' },
    { title: 'AI Chatbot (Ask Sparky)', Icon: ChatBubbleLeftRightIcon, link: '/chatbot-education' },
    { title: 'AI Questions', Icon: SparklesIcon, link: '/ai-generated-questions' },
    // Using SolidUserGroupIcon as it appeared in one of the provided menus for this role
    { title: 'Social / Chat', Icon: SolidUserGroupIcon, link: '/chat-functionality' },
    { title: 'Educational News', Icon: GlobeAltIcon, link: '/educational-news' },
    { title: 'Student Suggestions', Icon: EnvelopeIcon, link: '/suggestions-to-students' },
    { title: 'Meetings & Conferences', Icon: VideoCameraIcon, link: '/meeting-host' },
    { title: 'Announcements', Icon: MegaphoneIcon, link: '/announcements' },
    { title: 'Upgrade to Pro', Icon: SparklesIcon, link: '/pricing', special: true },
];

// --- Educator Layout Component (Keep only one definition) ---
const EducatorLayout = ({ children, educator, pageTitle = "Educator Portal" }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const isDesktop = useMediaQuery({ query: '(min-width: 1024px)' });
  const navigate = useNavigate();
  const location = useLocation();

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

   // Effect to close mobile sidebar on route change
   useEffect(() => {
    if (isMobileSidebarOpen && !isDesktop) {
      setIsMobileSidebarOpen(false);
    }
  }, [location.pathname, isMobileSidebarOpen, isDesktop]);


  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('profileUser'); // Adjust if using a different key
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const dynamicEducatorMenu = educatorSidebarMenuSource.map(item => ({
    ...item,
    current: item.link === location.pathname, // This line makes it dynamic based on current route
  }));

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 flex text-slate-100">
      {isDesktop ? (
        <aside className="fixed top-0 left-0 h-screen w-64 bg-slate-800/80 backdrop-blur-2xl border-r border-slate-700/50 flex flex-col shadow-2xl z-40">
          <SidebarContent />
        </aside>
      ) : (
        <>
          <aside className={`fixed top-0 left-0 h-full w-72 bg-slate-800/95 backdrop-blur-xl border-r border-slate-700/60 transform transition-transform duration-300 ease-in-out z-[60] flex flex-col shadow-2xl ${
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
        {/* The children (PersonalizedTeacherFeedback content) will be rendered here */}
        <main className="p-0"> {/* Remove padding here so child can control it */}
          {children}
        </main>
      </div>
    </div>
  );
};


// --- PersonalizedTeacherFeedback Component ---

// Gemini API Key (Assuming it's in .env)
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
if (!API_KEY) {
  console.error("Gemini API key not found. Please set VITE_GEMINI_API_KEY in your .env file.");
}

// Function to generate feedback using axios for direct Gemini API call
const generateTeacherFeedbackWithGemini = async (teacherStats) => {
  if (!API_KEY) {
     throw new Error("AI feedback is not configured. API key missing.");
  }

  const prompt = `
    You are an AI Teaching Assistant named Sparky, providing personalized feedback and insights to an educator based on their activity within the SPARK-IQ platform.
    Your goal is to offer a constructive, encouraging, and insightful report about their engagement with the platform's tools (Assignments, Tests, Attendance, Resources, etc.).
    Focus on highlighting achievements, identifying areas where they might benefit from further utilizing features, and providing actionable suggestions directly related to using SPARK-IQ.

    Analyze the following summary statistics of the educator's activity:
    ${JSON.stringify(teacherStats, null, 2)}

    Based on these statistics, provide your response STRICTLY as a JSON object with the following keys and value types:
    - "overallSummary": A brief (2-3 sentences) summary of their overall platform engagement and impact.
    - "strengths": An array of 2-3 strings. Each string is a bullet point highlighting a specific positive aspect based on their activity (e.g., "Demonstrating strong commitment by utilizing the Attendance Tracker consistently.", "Effectively managing learning with a significant number of created Assignments.").
    - "areasForDevelopment": An array of 2-3 strings. Each string is a constructive bullet point identifying an area for growth (e.g., "Opportunity to further leverage the platform by creating Tests.", "Exploring the Resource Management section could enhance teaching materials.").
    - "actionableAdvice": An array of 2-3 strings. Each string is a specific, actionable tip referencing SPARK-IQ features (e.g., "Try creating your first test using the AI question generator feature.", "Use the Assignment Management tool to view submission analytics and identify student difficulties.").

    Ensure the language is professional, supportive, and educator-focused.
    Do not include any text, markdown, or formatting outside of the single JSON object.
  `;

  try {
    // Use axios directly to target the v1beta endpoint for gemini-1.5-flash-latest
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`, // Include API key directly in URL params for axios
      {
        // The content is just the single user prompt
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
          responseMimeType: "application/json", // Request JSON directly
        },
      },
       // Removed headers: { 'Content-Type': 'application/json' } as axios adds it automatically for JSON body
    );

    // Extract text response - check for the response structure as expected by the API
    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
        console.error("Gemini API returned empty or invalid text response:", response.data);
        // Check for prompt feedback that might explain lack of content
        if (response.data?.promptFeedback?.blockReason) {
            throw new Error(`AI generation blocked: ${response.data.promptFeedback.blockReason}`);
        }
        throw new Error('Invalid or empty response from AI.');
    }

    // Attempt to parse the text as JSON
    const parsedFeedback = JSON.parse(text); // Direct parse since we requested responseMimeType: "application/json"

    // Basic validation to ensure the parsed object has the expected keys
    if (parsedFeedback &&
        typeof parsedFeedback.overallSummary === 'string' &&
        Array.isArray(parsedFeedback.strengths) &&
        Array.isArray(parsedFeedback.areasForDevelopment) && // Key change
        Array.isArray(parsedFeedback.actionableAdvice)) { // Key change
        return parsedFeedback;
    } else {
        // If parsing succeeds but validation fails, the model might have deviated from the format
        console.error("Gemini response format unexpected:", parsedFeedback);
        throw new Error("AI response format was unexpected. Please try again.");
    }

  } catch (error) {
    console.error("Error generating feedback with Gemini:", error);
     // Handle specific axios errors or general errors
    if (axios.isAxiosError(error)) {
        if (error.response) {
            console.error("Axios response data:", error.response.data);
            console.error("Axios response status:", error.response.status);
            console.error("Axios response headers:", error.response.headers);
             if (error.response.status === 404) {
                 throw new Error("AI model not found or accessible. Configuration error. Ensure your API key is valid and the model 'gemini-1.5-flash-latest' is available.");
             }
              if (error.response.status === 400) {
                 // Bad request could be due to prompt length, format, etc.
                 throw new Error(`Bad request to AI API (${error.response.status}): ${error.response.data?.error?.message || 'Unknown error'}`);
             }
              // Add other relevant HTTP status codes (e.g., 429 for rate limits)
              throw new Error(`AI API error: ${error.response.status} ${error.response.statusText}`);

        } else if (error.request) {
             throw new Error("No response from AI API. Check network connection or API status.");
        } else {
             throw new Error("Error setting up request to AI: " + error.message);
        }
    } else if (error instanceof SyntaxError) {
         throw new Error("AI returned invalid format. Trying again might help.");
    }
    // Catch all other errors
    throw new Error("The AI failed to generate feedback. Please try again later. Details: " + error.message);
  }
};


const PersonalizedTeacherFeedback = () => {
  const [educatorProfile, setEducatorProfile] = useState(null); // For layout
  const [loadingData, setLoadingData] = useState(true);
  const [generatingFeedback, setGeneratingFeedback] = useState(false);
  const [error, setError] = useState('');
  
  const [teacherStats, setTeacherStats] = useState(null);
  const [aiFeedback, setAiFeedback] = useState(null);

  // No need for isDesktop, navigate here if using layout, but keep for fetchTeacherData if it redirects
   const isDesktop = useMediaQuery({ minWidth: 1024 }); // Keep for potential responsive logic within component
   const navigate = useNavigate(); // Keep navigate for potential redirects


  // Use EducatorLayout's state management or manage sidebar state here if not wrapped
  // Assuming this component will be wrapped by EducatorLayout, sidebar state is managed by the layout.

  useEffect(() => {
    // This effect is responsible for getting the authenticated user and fetching initial data
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch educator profile (needed for EducatorLayout)
        try {
          const profileData = await getUserProfile(user.uid);
          setEducatorProfile(profileData || { uid: user.uid, email: user.email, name: user.displayName || "Educator", role: "educator" });
        } catch (profileError) {
          console.error("Error fetching educator profile:", profileError);
          setEducatorProfile({ uid: user.uid, email: user.email, name: user.displayName || "Educator", role: "educator" }); // Use fallback profile
        }
        // Fetch teacher-specific activity data
        fetchTeacherData(user.uid);
      } else {
        setEducatorProfile(null);
        setLoadingData(false);
        setTeacherStats(null); // Clear stats if logged out
        // navigate('/login'); // Let protected routes handle this
      }
    });

    return () => unsubscribeAuth(); // Cleanup auth listener
  }, [navigate]); // Added navigate as dependency

  const fetchTeacherData = async (teacherId) => {
    setLoadingData(true);
    setError('');
    setAiFeedback(null); // Clear old feedback when fetching new data
    setTeacherStats(null); // Clear old stats
    try {
      // 1. Assignments Created
      const assignmentsRef = collection(db, 'assignments');
      const assignmentsQuery = query(assignmentsRef, where('teacherId', '==', teacherId));
      const assignmentsSnap = await getDocs(assignmentsQuery);
      const assignmentsList = assignmentsSnap.docs.map(doc => doc.data());
      const totalAssignments = assignmentsList.length;
      const totalAssignmentSubmissions = assignmentsList.reduce((sum, assignment) => sum + (assignment.totalSubmissions || 0), 0);
       // Calculate average grade across all assignments (weighted by submissions if needed, or simple average)
       // Simple average of assignment averages:
       const gradedAssignments = assignmentsList.filter(a => (a.averageGrade !== undefined && a.averageGrade !== null));
       const overallAssignmentAverage = gradedAssignments.length > 0
           ? gradedAssignments.reduce((sum, a) => sum + (a.averageGrade || 0), 0) / gradedAssignments.length 
           : 0;


      // 2. Tests Created
      const testsRef = collection(db, 'tests');
      const testsQuery = query(testsRef, where('teacherId', '==', teacherId));
      const testsSnap = await getDocs(testsQuery);
      const totalTests = testsSnap.docs.length;
      // Count student attempts across all tests
      // This assumes testSubmissions have teacherId. If not, you'd need to get test IDs from testsList and query testSubmissions by testId IN list.
      const allTestSubmissionsQuery = query(collection(db, 'testSubmissions'), where('teacherId', '==', teacherId)); 
      const allTestSubmissionsSnap = await getDocs(allTestSubmissionsQuery);
      const totalTestAttempts = allTestSubmissionsSnap.docs.length;


      // 3. Attendance Tracking Activity
      // Count the number of attendance records marked by this teacher
      // This requires attendance records to store teacherId OR checking records for students linked to teacher's batches/classes.
      // Assuming attendance records store teacherId for simplicity in this example.
      // If not, a more complex query/aggregation is needed.
      const attendanceRef = collection(db, 'attendance');
       let totalAttendanceRecordsMarked = 0;
       try {
            const attendanceQuery = query(attendanceRef, where('markedByTeacherId', '==', teacherId)); // Assuming 'markedByTeacherId' field exists
            const attendanceSnap = await getDocs(attendanceQuery);
            totalAttendanceRecordsMarked = attendanceSnap.docs.length;
       } catch (e) {
           console.warn("Could not query attendance by teacherId. Assuming attendance records don't store markedByTeacherId.", e);
           totalAttendanceRecordsMarked = 0; // Default to 0 if query fails
       }
      


      // 4. Resources Uploaded
      const resourcesRef = collection(db, 'resources'); // Assuming a 'resources' collection exists
      // Assuming resources documents store 'uploaderId'
       let totalResourcesUploaded = 0;
       try {
            const resourcesQuery = query(resourcesRef, where('uploaderId', '==', teacherId)); // Assuming 'uploaderId' field exists
            const resourcesSnap = await getDocs(resourcesQuery);
            totalResourcesUploaded = resourcesSnap.docs.length;
       } catch (e) {
            console.warn("Could not query resources by uploaderId. Assuming resources don't store uploaderId or collection doesn't exist.", e);
             totalResourcesUploaded = 0; // Default to 0 if query fails
       }


      // 5. Student Suggestions Received (Example)
      // Assuming suggestions collection exists and has a field linking to the teacher
       let totalSuggestionsReceived = 0;
       try {
           const suggestionsRef = collection(db, 'suggestions'); // Assuming a 'suggestions' collection exists
           const suggestionsQuery = query(suggestionsRef, where('teacherId', '==', teacherId)); // Assuming 'teacherId' field exists on suggestions
           const suggestionsSnap = await getDocs(suggestionsQuery);
           totalSuggestionsReceived = suggestionsSnap.docs.length;
       } catch (e) {
            console.warn("Could not query suggestions by teacherId. Assuming suggestions don't store teacherId or collection doesn't exist.", e);
             totalSuggestionsReceived = 0; // Default to 0 if query fails
       }


      const stats = {
        totalAssignments,
        totalAssignmentSubmissions,
        overallAssignmentAverage: parseFloat(overallAssignmentAverage.toFixed(1)),
        totalTests,
        totalTestAttempts,
        totalAttendanceRecordsMarked,
        totalResourcesUploaded,
        totalSuggestionsReceived,
      };
      console.log("Fetched Teacher Stats:", stats); // Log stats for verification
      setTeacherStats(stats);

    } catch (err) {
      console.error("Error fetching teacher data:", err);
      setError("Could not load your activity data. Please refresh the page.");
      setTeacherStats({ // Set default/zero stats on error to allow AI generation attempt
        totalAssignments: 0,
        totalAssignmentSubmissions: 0,
        overallAssignmentAverage: 0,
        totalTests: 0,
        totalTestAttempts: 0,
        totalAttendanceRecordsMarked: 0,
        totalResourcesUploaded: 0,
        totalSuggestionsReceived: 0,
      });
    } finally {
      setLoadingData(false);
    }
  };

  const handleGenerateFeedback = async () => {
    if (!teacherStats) {
      setError("Your activity data is not available to generate feedback.");
      return;
    }

    // Check for API key before generating
    if (!API_KEY) {
        setError("AI feedback is not configured. Please contact support.");
        return;
    }

    setGeneratingFeedback(true);
    setError('');
    setAiFeedback(null); // Clear previous feedback
    try {
      const feedback = await generateTeacherFeedbackWithGemini(teacherStats);
      setAiFeedback(feedback);
    } catch (err) {
      console.error("Error generating feedback in handler:", err);
      setError(err.message || "An unexpected error occurred while generating feedback.");
    } finally {
      setGeneratingFeedback(false);
    }
  };

  // Reusable Card Component for stats (Defined inside PersonalizedTeacherFeedback)
  const StatCard = ({ icon: Icon, title, value, color, loading }) => (
    <div className={`bg-gray-800/50 p-6 rounded-xl border border-gray-700/60 shadow-lg flex items-center space-x-4`}>
      <div className={`p-3 rounded-lg bg-${color}-500/10`}>
        <Icon className={`w-6 h-6 text-${color}-400`}/>
      </div>
      <div>
        <p className="text-sm text-gray-400">{title}</p>
        {loading ? (
            <div className="h-7 w-24 bg-gray-700/80 rounded-md animate-pulse mt-1"></div>
        ) : (
            <p className="text-2xl font-bold text-white">{value}</p>
        )}
      </div>
    </div>
  );


  // Reusable Feedback Section Component (Defined inside PersonalizedTeacherFeedback)
  const FeedbackSection = ({ icon: Icon, title, items, color }) => (
    <motion.div
      className={`bg-gray-800/40 p-6 rounded-xl border border-gray-700/50 shadow-lg`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className={`flex items-center text-xl font-semibold mb-4 text-${color}-300`}>
        <Icon className="w-6 h-6 mr-2"/> {title}
      </h3>
      <ul className="space-y-3 list-inside">
        {items?.length > 0 ? items.map((item, index) => (
          <motion.li
            key={index}
            className="flex items-start"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            {/* Use CheckCircleIcon or another appropriate icon for list items */}
             <CheckCircleIcon className={`w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-${color}-400`} />
            <span className="text-gray-300">{item}</span>
          </motion.li>
        )) : (
           <li className="text-gray-400 italic text-sm">No specific points generated.</li>
        )}
      </ul>
    </motion.div>
  );


  return (
    // Wrap the component content with EducatorLayout
    <EducatorLayout educator={educatorProfile} pageTitle="Teacher Insights">
      {/* Content uses "gray" theme as per original, padding controlled by this div */}
      <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          <header className="mb-8 md:mb-10 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Your Educator Insights</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">An AI-powered analysis of your activity and suggestions for leveraging Spark-IQ.</p>
          </header>

          {error && <div className="mb-6 p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg text-center">{error}</div>}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <StatCard title="Assignments Created" value={teacherStats?.totalAssignments ?? '--'} icon={DocumentTextIcon} color="blue" loading={loadingData}/>
            <StatCard title="Tests Created" value={teacherStats?.totalTests ?? '--'} icon={ClipboardDocumentIcon} color="purple" loading={loadingData}/>
            <StatCard title="Attendance Records Marked" value={teacherStats?.totalAttendanceRecordsMarked ?? '--'} icon={UsersIcon} color="emerald" loading={loadingData}/>
             <StatCard title="Resources Uploaded" value={teacherStats?.totalResourcesUploaded ?? '--'} icon={FolderIcon} color="amber" loading={loadingData}/>
          </div>

          {/* Optional: Show more stats like total submissions, test attempts, avg assignment grade, suggestions received */}
           {(teacherStats?.totalAssignmentSubmissions > 0 || teacherStats?.totalTestAttempts > 0 || teacherStats?.overallAssignmentAverage > 0 || teacherStats?.totalSuggestionsReceived > 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                     {teacherStats?.totalAssignmentSubmissions > 0 && <StatCard title="Total Assignment Subs" value={teacherStats?.totalAssignmentSubmissions} icon={ClipboardDocumentIcon} color="sky" loading={loadingData}/>}
                     {teacherStats?.totalTestAttempts > 0 && <StatCard title="Total Test Attempts" value={teacherStats?.totalTestAttempts} icon={ClipboardDocumentIcon} color="teal" loading={loadingData}/>}
                     {teacherStats?.overallAssignmentAverage > 0 && <StatCard title="Avg Assignment Grade" value={`${teacherStats?.overallAssignmentAverage}%`} icon={AcademicCapIcon} color="pink" loading={loadingData}/>}
                      {teacherStats?.totalSuggestionsReceived > 0 && <StatCard title="Suggestions Received" value={teacherStats?.totalSuggestionsReceived} icon={EnvelopeIcon} color="indigo" loading={loadingData}/>}
                </div>
           )}


          <div className="text-center mb-10">
            <motion.button
              onClick={handleGenerateFeedback}
              disabled={loadingData || generatingFeedback || !API_KEY} // Disable if API key is missing, data loading, or AI is generating
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full shadow-lg overflow-hidden transition-all duration-300 ease-in-out hover:shadow-2xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
                <span className="absolute inset-0 bg-gradient-to-br from-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <SparklesIcon className="w-6 h-6 mr-3 text-yellow-300 transition-transform duration-300 group-hover:rotate-12"/>
                <span className="relative">
                  {generatingFeedback ? 'Sparky is Analyzing...' : (loadingData ? 'Loading Data...' : 'Generate My AI Insights')}
                </span>
            </motion.button>
            {/* Optional: Add a helper text if API key is missing */}
             {!API_KEY && (
                 <p className="mt-3 text-sm text-red-400">AI is not configured (API Key Missing)</p>
             )}
          </div>

          <AnimatePresence mode="wait"> {/* Use mode="wait" to animate out before animating in */}
            {generatingFeedback && (
              <motion.div
                key="loading" // Key needed for AnimatePresence
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-gray-800/50 p-8 rounded-xl border border-gray-700/60 shadow-xl text-center"
              >
                <div className="flex justify-center items-center">
                  <svg className="animate-spin h-8 w-8 text-indigo-400 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-lg text-gray-300">Generating your personalized insights... Please wait.</p>
                </div>
              </motion.div>
            )}

            {aiFeedback && (
              <motion.div
                key="feedback" // Key needed for AnimatePresence
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <motion.div
                  className="bg-gray-800/60 p-6 rounded-xl border border-indigo-500/30 shadow-2xl shadow-indigo-500/10"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h3 className="text-2xl font-semibold mb-3 text-white">Sparky's Analysis</h3>
                  {/* Use renderTextWithNewlines if needed, otherwise simple p tag is fine */}
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{aiFeedback.overallSummary}</p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Strengths */}
                  <div className="lg:col-span-1">
                    <FeedbackSection title="What You're Doing Great" items={aiFeedback.strengths} color="green" icon={CheckCircleIcon} />
                  </div>
                   {/* Areas for Development & Actionable Advice */}
                  <div className="lg:col-span-2 space-y-6">
                    <FeedbackSection title="Opportunities for Growth" items={aiFeedback.areasForDevelopment} color="yellow" icon={ArrowTrendingUpIcon} />
                    <FeedbackSection title="Your Actionable Next Steps" items={aiFeedback.actionableAdvice} color="blue" icon={LightBulbIcon} />
                  </div>
                </div>

                <div className="mt-8 text-center text-sm text-gray-500 flex items-center justify-center p-4 bg-gray-800/30 rounded-lg">
                  <InformationCircleIcon className="w-5 h-5 mr-2"/>
                  These insights are AI-generated based on your platform activity and intended as a helpful guide.
                </div>
              </motion.div>
            )}
             {/* Optional: Show a message if no feedback is generated yet and data is loaded */}
            {!loadingData && !generatingFeedback && !aiFeedback && teacherStats && (
                 <div className="text-center py-12 text-gray-400">
                     <ChartBarIcon className="w-16 h-16 mx-auto text-gray-600 mb-4"/>
                     <h3 className="text-xl font-medium text-gray-300">Generate Your Insights</h3>
                     <p className="text-gray-500 mt-1">Click the button above to get your personalized AI feedback.</p>
                 </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </EducatorLayout>
  );
};

export default PersonalizedTeacherFeedback;

// Add to your global CSS (e.g., index.css or App.css) if you haven't already
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
  background: rgba(55, 65, 81, 0.1); // gray-700 with opacity for modal
}
.custom-scrollbar-thin::-webkit-scrollbar-thumb {
  background: #4B5563; // gray-600 for modal
  border-radius: 10px;
}
.custom-scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: #6B7280; // gray-500 for modal
}
*/