import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import { motion, AnimatePresence } from 'framer-motion';
// Removed GoogleGenerativeAI import as we will use axios directly for the API call
// import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios'; // Import axios to make the HTTP request directly

// Firebase and Auth
import { db, auth } from '../../firebase/firebaseConfig';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

// Icons from Heroicons
import {
  HomeIcon,
  FolderIcon,
  ClipboardDocumentIcon,
  ChartBarIcon,
  DocumentTextIcon,
  PresentationChartLineIcon,
  ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon,
  LightBulbIcon,
  NewspaperIcon,
  WrenchScrewdriverIcon,
  VideoCameraIcon,
  EnvelopeIcon,
  SparklesIcon,
  XMarkIcon,
  Bars3Icon,
  DocumentMagnifyingGlassIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

// IMPORTANT: Add the new page to your menu array in other student-facing components
const studentMenu = [
  { title: 'Dashboard', Icon: HomeIcon, link: '/dashboard' },
  { title: 'My Resources', Icon: FolderIcon, link: '/resource-utilization' },
  { title: 'Tests', Icon: ClipboardDocumentIcon, link: '/student-tests' },
  { title: 'Attendance', Icon: ChartBarIcon, link: '/attendance-monitoring' },
  { title: 'Assignments', Icon: DocumentTextIcon, link: '/assignment-submission' },
  { title: 'Grades & Feedback', Icon: PresentationChartLineIcon, link: '/GradesAndFeedback' },
  { title: 'AI Feedback', Icon: DocumentMagnifyingGlassIcon, link: '/personalized-feedback-students', description: "Get AI-powered insights on your progress." },
  { title: 'Voice Chat', Icon: ChatBubbleLeftRightIcon, link: '/voice-chat' },
  { title: ' Ask Iko ', Icon: QuestionMarkCircleIcon, link: '/chatbot-access' },
  { title: 'AI Questions', Icon: LightBulbIcon, link: '/ai-generated-questions' },
  { title: 'Educational News', Icon: NewspaperIcon, link: '/educational-news' },
  { title: 'Smart Review', Icon: WrenchScrewdriverIcon, link: '/smart-review' },
  { title: 'Virtual Meetings', Icon: VideoCameraIcon, link: '/meeting-participation' },
  { title: 'Chat Platform', Icon: ChatBubbleLeftRightIcon, link: '/chat-functionality', description: "Connect with peers." },
  { title: 'My Inbox', Icon: EnvelopeIcon, link: '/inbox-for-suggestions' },
  { title: 'Upgrade to Pro', Icon: SparklesIcon, link: '/pricing', special: true },
];

// Gemini Service Configuration
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
if (!API_KEY) {
  console.error("Gemini API key not found. Please set VITE_GEMINI_API_KEY in your .env file.");
  // Consider showing an error message to the user if the key is missing
}

// --- Refactored Gemini Call Function using axios ---
const generateFeedbackWithGemini = async (studentData) => {
  // Check if API_KEY is missing before attempting to generate
  if (!API_KEY) {
     throw new Error("AI feedback is not configured. Please contact support.");
  }

  // Construct the full prompt by combining instructions and data
  const fullPrompt = `
    You are Sparky, a friendly, insightful, and encouraging AI academic advisor for the IGNITIA platform.
    Your goal is to provide a holistic, personalized feedback report to a student based on their performance data.
    Be positive, constructive, and avoid overly negative language. Focus on growth and actionable advice.

    Analyze the following student performance data:
    ${JSON.stringify(studentData, null, 2)}

    Based on this data, provide your response strictly as a JSON object with the following keys and value types:
    - "overallSummary": A brief (2-3 sentences), encouraging paragraph summarizing the student's overall performance and effort.
    - "strengths": An array of 2-3 strings. Each string is a bullet point highlighting a specific positive aspect (e.g., "Consistent high scores in assignments show a strong grasp of the material.", "Excellent attendance record demonstrates great commitment.").
    - "areasForImprovement": An array of 2-3 strings. Each string is a constructive bullet point identifying an area for growth (e.g., "There's an opportunity to boost test scores to match your strong assignment performance.", "Paying close attention to submission deadlines will help maximize potential grades.").
    - "actionableSuggestions": An array of 2-3 strings. Each string is a specific, actionable tip that references IGNITIA features (e.g., "To prepare for tests, try using the 'AI Questions' feature to practice on related topics.", "Before submitting your next essay, run it through the 'Smart Review' tool to catch any small errors.").

    Do not include any text, markdown, or formatting outside of the single JSON object.
  `;

  try {
    // Use axios directly to target the v1beta endpoint for gemini-1.5-flash-latest
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent',
      {
        // The content is just the single user prompt containing instructions and data
        contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      },
      {
        params: { key: API_KEY }, // API key passed as a query parameter
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    // Extract text response from the standard Gemini API structure
    const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
        console.error("Gemini API returned empty or invalid text response:", response.data);
        throw new Error('Invalid or empty response from AI.');
    }

    // Clean the response to remove potential markdown wrappers (```json, ```)
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();

    // Attempt to parse the cleaned text as JSON
    const parsedFeedback = JSON.parse(cleanedText);

    // Basic validation to ensure the parsed object has the expected keys
    if (parsedFeedback &&
        typeof parsedFeedback.overallSummary === 'string' &&
        Array.isArray(parsedFeedback.strengths) &&
        Array.isArray(parsedFeedback.areasForImprovement) &&
        Array.isArray(parsedFeedback.actionableSuggestions)) {
        return parsedFeedback;
    } else {
        // If parsing succeeds but validation fails, the model might have deviated from the format
        console.error("Gemini response format unexpected:", parsedFeedback);
        // Provide more detail in the user-facing error for easier debugging if format changes
        throw new Error("AI response format was unexpected. Please try again. Check browser console for details.");
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
                 // This is the error we are targeting - confirm the model is available
                 throw new Error("AI model not found or accessible. Configuration error. Ensure your API key is valid and the model 'gemini-1.5-flash-latest' is available.");
             }
              if (error.response.status === 400) {
                 // Bad request could be due to prompt length, format, etc.
                 throw new Error("Bad request sent to AI. Check data being sent or retry.");
             }
              // Add other relevant HTTP status codes you might encounter (e.g., 429 for rate limits)
              throw new Error(`AI API error: ${error.response.status} ${error.response.statusText}`);

        } else if (error.request) {
             // The request was made but no response was received (e.g., network issue)
             throw new Error("No response from AI API. Check network connection or API status.");
        } else {
             // Something happened in setting up the request that triggered an Error
             throw new Error("Error setting up request to AI: " + error.message);
        }
    } else if (error instanceof SyntaxError) {
         // JSON parsing failed, likely due to the model returning non-JSON
         throw new Error("AI returned invalid format. Trying again might help.");
    }
    // Catch all other errors
    throw new Error("The AI failed to generate feedback. Please try again later. Details: " + error.message);
  }
};


const PersonalizedFeedback = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [generatingFeedback, setGeneratingFeedback] = useState(false);
  const [error, setError] = useState('');

  const [summaryStats, setSummaryStats] = useState(null);
  const [aiFeedback, setAiFeedback] = useState(null);

  const isDesktop = useMediaQuery({ minWidth: 768 });
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setIsSidebarOpen(isDesktop);
  }, [isDesktop]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        fetchStudentData(user.uid);
      } else {
        setCurrentUser(null);
        setLoadingData(false);
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const fetchStudentData = async (studentId) => {
    setLoadingData(true);
    setError('');
    setAiFeedback(null); // Reset feedback when re-fetching data
    try {
      const collectionsToFetch = {
        assignments: query(collection(db, 'submissions'), where('studentId', '==', studentId)),
        tests: query(collection(db, 'testSubmissions'), where('studentId', '==', studentId)),
        attendance: query(collection(db, 'attendance'), where('studentId', '==', studentId)),
      };

      const [assignmentsSnap, testsSnap, attendanceSnap] = await Promise.all([
        getDocs(collectionsToFetch.assignments),
        getDocs(collectionsToFetch.tests),
        getDocs(collectionsToFetch.attendance),
      ]);

      // Process Assignments
      const assignmentsData = assignmentsSnap.docs.map(doc => doc.data());
      const gradedAssignments = assignmentsData.filter(a => a.grade !== null && a.grade !== undefined);
      const avgAssignmentGrade = gradedAssignments.length > 0
        ? gradedAssignments.reduce((acc, curr) => acc + (curr.grade / (curr.maxPoints || 100)) * 100, 0) / gradedAssignments.length
        : 0;

      // Process Tests
      const testsData = testsSnap.docs.map(doc => doc.data());
      const avgTestScore = testsData.length > 0
        ? testsData.reduce((acc, curr) => acc + curr.score, 0) / testsData.length
        : 0;

      // Process Attendance
      const attendanceData = attendanceSnap.docs.map(doc => doc.data());
      const presentCount = attendanceData.filter(a => a.isPresent).length;
      const attendanceRate = attendanceData.length > 0 ? (presentCount / attendanceData.length) * 100 : 100;

      setSummaryStats({
        assignments: {
          count: assignmentsData.length,
          averageGrade: Math.round(avgAssignmentGrade),
          data: assignmentsData.map(a => ({ title: a.title, grade: a.grade, maxPoints: a.maxPoints, feedback: a.feedback })),
        },
        tests: {
          count: testsData.length,
          averageScore: Math.round(avgTestScore),
          data: testsData.map(t => ({ title: t.testTitle, score: t.score })),
        },
        attendance: {
          totalDays: attendanceData.length,
          present: presentCount,
          late: attendanceData.filter(a => a.isLate).length,
          absent: attendanceData.filter(a => !a.isPresent && !a.isLate).length,
          rate: Math.round(attendanceRate),
        }
      });
    } catch (err) {
      console.error("Error fetching student data:", err);
      setError("Could not load your performance data. Please refresh the page.");
    } finally {
      setLoadingData(false);
    }
  };

  const handleGenerateFeedback = async () => {
    if (!summaryStats) {
      setError("Your data is not available to generate feedback.");
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
      const feedback = await generateFeedbackWithGemini(summaryStats);
      setAiFeedback(feedback);
    } catch (err) {
      console.error("Error generating feedback in handler:", err);
      setError(err.message || "An unexpected error occurred while generating feedback.");
    } finally {
      setGeneratingFeedback(false);
    }
  };

  const Card = ({ icon, title, value, unit, color, loading }) => (
    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/60 shadow-lg flex items-center space-x-4">
      <div className={`p-3 rounded-lg bg-${color}-500/10`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-400">{title}</p>
        {loading ? (
            <div className="h-7 w-24 bg-gray-700/80 rounded-md animate-pulse mt-1"></div>
        ) : (
            <p className="text-2xl font-bold text-white">{value}<span className="text-lg text-gray-400">{unit}</span></p>
        )}
      </div>
    </div>
  );

  const FeedbackSection = ({ icon, title, items, color }) => (
    <motion.div
      className={`bg-gray-800/40 p-6 rounded-xl border border-gray-700/50 shadow-lg`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className={`flex items-center text-xl font-semibold mb-4 text-${color}-300`}>
        {icon} {title}
      </h3>
      <ul className="space-y-3 list-inside">
        {items.map((item, index) => (
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
        ))}
      </ul>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-900 flex text-gray-200">
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
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">IGNITIA</h1>
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
                  <Link
                    key={item.title}
                    to={item.link}
                    onClick={() => !isDesktop && setIsSidebarOpen(false)}
                    className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg text-gray-300 transition-all group
                              ${isActive ? 'bg-indigo-500/30 text-indigo-200 font-semibold shadow-inner' : 'hover:bg-indigo-500/10 hover:text-indigo-300'}
                              ${item.special ? `mt-auto mb-1 bg-gradient-to-r from-purple-600/90 to-indigo-600/90 !text-white shadow-md hover:shadow-lg hover:opacity-90 ${isActive ? 'ring-2 ring-purple-400' : ''}` : ''}`}
                  >
                    <item.Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-indigo-300' : 'text-indigo-400'} group-hover:scale-110 transition-transform`} />
                    <span className="text-sm font-medium">{item.title}</span>
                  </Link>
                );
              })}
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>
      {isSidebarOpen && !isDesktop && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>}

      <main className={`flex-1 p-4 sm:p-8 overflow-y-auto relative transition-margin duration-300 ease-in-out ${isDesktop ? 'md:ml-64' : ''}`}>
        {!isDesktop && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="fixed left-4 top-4 z-40 p-2 bg-gray-800/80 backdrop-blur-sm rounded-lg hover:bg-gray-700 transition-colors shadow-lg"
          >
            <Bars3Icon className="w-6 h-6 text-gray-300" />
          </button>
        )}

        <div className="max-w-4xl mx-auto">
          <header className="mb-8 md:mb-10 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Your Personalized Report</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Here's a snapshot of your progress and AI-powered feedback to help you excel.</p>
          </header>

          {error && <div className="mb-6 p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg text-center">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <Card title="Attendance Rate" value={summaryStats?.attendance.rate ?? '--'} unit="%" icon={<ChartBarIcon className="w-6 h-6 text-green-400"/>} color="green" loading={loadingData}/>
            <Card title="Avg. Assignment Grade" value={summaryStats?.assignments.averageGrade ?? '--'} unit="%" icon={<DocumentTextIcon className="w-6 h-6 text-blue-400"/>} color="blue" loading={loadingData}/>
            <Card title="Avg. Test Score" value={summaryStats?.tests.averageScore ?? '--'} unit="%" icon={<ClipboardDocumentIcon className="w-6 h-6 text-yellow-400"/>} color="yellow" loading={loadingData}/>
          </div>

          <div className="text-center mb-10">
            <motion.button
              onClick={handleGenerateFeedback}
              disabled={loadingData || generatingFeedback || !API_KEY} // Disable if API key is missing or data is loading
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full shadow-lg overflow-hidden transition-all duration-300 ease-in-out hover:shadow-2xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
                <span className="absolute inset-0 bg-gradient-to-br from-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <SparklesIcon className="w-6 h-6 mr-3 text-yellow-300 transition-transform duration-300 group-hover:rotate-12"/>
                <span className="relative">
                  {generatingFeedback ? 'Iko is Analyzing...' : (loadingData ? 'Loading Data...' : 'Generate My AI Feedback')}
                </span>
            </motion.button>
            {/* Optional: Add a helper text if API key is missing */}
             {!API_KEY && (
                 <p className="mt-3 text-sm text-red-400">AI is not configured (API Key Missing)</p>
             )}
          </div>

          <AnimatePresence>
            {generatingFeedback && (
              <motion.div
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
                  <p className="text-lg text-gray-300">Generating your personalized report... Please wait.</p>
                </div>
              </motion.div>
            )}

            {aiFeedback && (
              <motion.div
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
                  <p className="text-gray-300 leading-relaxed">{aiFeedback.overallSummary}</p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1">
                    <FeedbackSection title="What You're Excelling At" items={aiFeedback.strengths} color="green" icon={<CheckCircleIcon className="w-6 h-6 mr-2"/>} />
                  </div>
                  <div className="lg:col-span-2 space-y-6">
                    <FeedbackSection title="Opportunities for Growth" items={aiFeedback.areasForImprovement} color="yellow" icon={<ArrowTrendingUpIcon className="w-6 h-6 mr-2"/>} />
                    <FeedbackSection title="Your Actionable Next Steps" items={aiFeedback.actionableSuggestions} color="blue" icon={<LightBulbIcon className="w-6 h-6 mr-2"/>} />
                  </div>
                </div>

                <div className="mt-8 text-center text-sm text-gray-500 flex items-center justify-center p-4 bg-gray-800/30 rounded-lg">
                  <InformationCircleIcon className="w-5 h-5 mr-2"/>
                  This feedback is AI-generated as a guide. Always consult your teacher for official academic advice.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

    </div>
  );
};

export default PersonalizedFeedback;