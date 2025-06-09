
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HomeIcon,
  FolderIcon,
  ClipboardDocumentIcon,
  ChartBarIcon,
  DocumentTextIcon,
  PresentationChartLineIcon,
  DocumentMagnifyingGlassIcon,
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
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

// Firebase Imports
import { db, auth } from '../../firebase/firebaseConfig'; // Adjust path as necessary
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  orderBy,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

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
  { title: 'My Inbox', Icon: EnvelopeIcon, link: '/inbox-for-suggestions', description: "Messages & suggestions." },
  { title: 'Upgrade to Pro', Icon: SparklesIcon, link: '/pricing', special: true, description: "Unlock premium features." },
];

const StudentTests = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedTest, setSelectedTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null); // Percentage
  const [correctCount, setCorrectCount] = useState(0);
  const [totalQuestionsInTest, setTotalQuestionsInTest] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timerId, setTimerId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true); // For Firebase operations
  const [error, setError] = useState('');

  const [availableTests, setAvailableTests] = useState([]);
  const [pastAttempts, setPastAttempts] = useState([]);
  const [attemptedTestIds, setAttemptedTestIds] = useState(new Set()); // To filter out already attempted tests

  const isDesktop = useMediaQuery({ minWidth: 768 });
  const location = useLocation();

  useEffect(() => {
    if (isDesktop) {
      setIsSidebarOpen(true);
    } else {
      setIsSidebarOpen(false);
    }
  }, [isDesktop]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        fetchStudentData(user.uid);
      } else {
        setCurrentUser(null);
        setAvailableTests([]);
        setPastAttempts([]);
        setAttemptedTestIds(new Set());
        console.log("No user logged in for StudentTests.");
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchStudentData = async (studentId) => {
    if (!studentId) return;
    setLoading(true);
    setError('');
    try {
      // Fetch past attempts first to know which tests have been taken
      const attemptsRef = collection(db, 'testSubmissions');
      const attemptsQuery = query(attemptsRef, where('studentId', '==', studentId), orderBy('submittedAt', 'desc'));
      const attemptsSnapshot = await getDocs(attemptsQuery);
      const attemptsList = attemptsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPastAttempts(attemptsList);
      const attemptedIds = new Set(attemptsList.map(attempt => attempt.testId));
      setAttemptedTestIds(attemptedIds);

      // Fetch available tests
      const testsRef = collection(db, 'tests');
      const testsQuery = query(testsRef, where('status', '==', 'published'), orderBy('publishedAt', 'desc'));
      const testsSnapshot = await getDocs(testsQuery);
      const allPublishedTests = testsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Filter out tests already attempted by the student
      const filteredAvailableTests = allPublishedTests.filter(test => !attemptedIds.has(test.id));
      setAvailableTests(filteredAvailableTests);

    } catch (e) {
      console.error("Error fetching student data: ", e);
      setError("Failed to load test data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let intervalId = null;
    if (currentView === 'takeTest' && timeRemaining > 0) {
      intervalId = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(intervalId);
            handleSubmitTest(true); // Auto-submit
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setTimerId(intervalId);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [currentView, timeRemaining]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartTest = (test) => {
    setSelectedTest(test);
    setAnswers({});
    setScore(null);
    setCorrectCount(0);
    setTotalQuestionsInTest(test.questions.length);
    setTimeRemaining(test.timeLimit * 60);
    setCurrentView('takeTest');
  };

  const handleAnswerChange = (questionId, selectedOption) => {
    setAnswers(prev => ({ ...prev, [questionId]: selectedOption }));
  };

  const handleSubmitTest = async (timedOut = false) => {
    if (!currentUser || !selectedTest) {
      setError("Cannot submit test. User or test data missing.");
      return;
    }
    if (timerId) clearInterval(timerId);

    let correct = 0;
    selectedTest.questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    const calculatedScore = (correct / selectedTest.questions.length) * 100;
    
    setScore(calculatedScore.toFixed(2));
    setCorrectCount(correct);

    const submissionData = {
      testId: selectedTest.id,
      testTitle: selectedTest.title,
      testSubject: selectedTest.subject,
      studentId: currentUser.uid,
      studentName: currentUser.displayName || currentUser.email || 'Anonymous Student',
      answers: answers,
      score: parseFloat(calculatedScore.toFixed(2)),
      correctCount: correct,
      totalQuestionsInTest: selectedTest.questions.length,
      submittedAt: serverTimestamp(),
    };

    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, 'testSubmissions'), submissionData);
      setPastAttempts(prev => [{ id: docRef.id, ...submissionData, submittedAt: new Date() }, ...prev]);
      setAttemptedTestIds(prev => new Set(prev).add(selectedTest.id));
      setAvailableTests(prev => prev.filter(test => test.id !== selectedTest.id));

      if (timedOut) {
        alert(`Time's up! Your test has been automatically submitted. Score: ${calculatedScore.toFixed(2)}%`);
      } else {
        alert(`Test submitted! Your score is: ${calculatedScore.toFixed(2)}%`);
      }
      setCurrentView('showResult');
    } catch (e) {
      console.error("Error submitting test: ", e);
      setError("Failed to submit your test. Please try again. " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'takeTest':
        if (!selectedTest) {
          return (
            <p className="text-gray-400">
              No test selected.{' '}
              <button
                onClick={() => setCurrentView('dashboard')}
                className="ml-2 px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 text-sm transition-colors duration-200"
              >
                Go back
              </button>
            </p>
          );
        }
        return (
          <div className="p-6 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-700/50">
              <div>
                <h2 className="text-2xl font-semibold text-white">{selectedTest.title}</h2>
                <p className="text-sm text-gray-400">{selectedTest.subject} | {selectedTest.difficulty}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-300">Time Left:</p>
                <p className={`font-bold text-2xl ${timeRemaining < 60 ? 'text-red-500 animate-pulse' : 'text-red-400'}`}>
                  {formatTime(timeRemaining)}
                </p>
              </div>
            </div>
            <p className="italic text-gray-400 mb-6">{selectedTest.description || `A ${selectedTest.difficulty} test on ${selectedTest.topics}.`}</p>

            <form onSubmit={(e) => { e.preventDefault(); handleSubmitTest(); }} className="space-y-6">
              {selectedTest.questions.map((q, index) => (
                <div key={q.id} className="border border-gray-700/50 rounded-lg p-5 bg-gray-800/40 shadow-sm">
                  <p className="text-lg font-medium mb-4 text-white"><strong>{index + 1}.</strong> {q.text}</p>
                  <div className="space-y-3">
                    {q.options.map((option, optIndex) => (
                      <label
                        key={optIndex}
                        className={`flex items-center cursor-pointer p-3 rounded-md border transition-all duration-200 ${answers[q.id] === option ? 'bg-indigo-600 border-indigo-500 shadow-md' : 'bg-gray-700/50 border-gray-600 hover:bg-gray-700'}`}
                      >
                        <input
                          type="radio"
                          name={`question-${q.id}`}
                          value={option}
                          checked={answers[q.id] === option}
                          onChange={() => handleAnswerChange(q.id, option)}
                          className="form-radio h-5 w-5 text-indigo-500 bg-gray-600 border-gray-500 focus:ring-indigo-500 focus:ring-offset-gray-800 mr-3"
                        />
                        <span className={`text-base ${answers[q.id] === option ? 'text-white font-semibold' : 'text-gray-300'}`}>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto float-right px-8 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 text-lg mt-6 transition-colors duration-200 disabled:opacity-60"
              >
                {loading ? 'Submitting...' : 'Submit Test'}
              </button>
            </form>
          </div>
        );
      case 'showResult':
        return (
          <div className="p-6 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-lg shadow-lg text-center">
            <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto mb-4"/>
            <h2 className="text-3xl font-bold mb-3 text-white">Test Completed!</h2>
            <p className="text-lg text-gray-300 mb-6">You attempted: {selectedTest?.title}</p>
            {score !== null ? (
              <>
                <p className="text-2xl font-semibold text-gray-300 mb-2">Your Score:</p>
                <p className="text-6xl font-bold text-green-400 mb-4">{score}%</p>
                <p className="text-gray-400 mb-6">({correctCount} out of {totalQuestionsInTest} correct)</p>
              </>
            ) : (
              <p className="text-gray-400">Calculating score...</p>
            )}
            <button
              onClick={() => setCurrentView('dashboard')}
              className="mt-8 px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
            >
              Back to Dashboard
            </button>
          </div>
        );
      case 'dashboard':
      default:
        return (
          <div className="py-5">
            <h2 className="text-3xl font-bold mb-8 text-white text-center md:text-left">Student Dashboard - Tests</h2>
            {error && <div className="mb-4 p-3 bg-red-900/50 border border-red-700 text-red-300 rounded-md">{error}</div>}

            <div className="mt-8 p-6 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-lg shadow-lg text-left">
              <h3 className="text-2xl font-semibold mb-5 text-white">Available Tests</h3>
              {loading && <p className="text-gray-400 text-center py-4">Loading available tests...</p>}
              {!loading && availableTests.length === 0 && !error && (
                <p className="text-gray-400 text-center py-4">No new tests available at the moment. Great job staying on top of things!</p>
              )}
              {!loading && availableTests.length > 0 && (
                <ul className="list-none p-0 space-y-4">
                  {availableTests.map(test => (
                    <li
                      key={test.id}
                      className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border border-gray-700/50 bg-gray-800/40 rounded-md shadow-sm hover:bg-gray-800/60 transition-colors"
                    >
                      <div className="flex-grow mb-3 md:mb-0">
                        <h4 className="text-lg font-semibold text-indigo-300">{test.title}</h4>
                        <p className="text-sm text-gray-400">{test.subject} | {test.difficulty} | {test.numQuestions || test.questions?.length} Qs | {test.timeLimit} mins</p>
                      </div>
                      <button
                        onClick={() => handleStartTest(test)}
                        className="px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm transition-colors duration-200 w-full md:w-auto"
                      >
                        Start Test
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-10 p-6 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-lg shadow-lg text-left">
              <h3 className="text-2xl font-semibold mb-5 text-white">Past Attempts</h3>
              {loading && pastAttempts.length === 0 && <p className="text-gray-400 text-center py-4">Loading past attempts...</p>}
              {!loading && pastAttempts.length === 0 && !error && (
                <p className="text-gray-400 text-center py-4">You haven't attempted any tests yet.</p>
              )}
              {!loading && pastAttempts.length > 0 && (
                <ul className="list-none p-0 space-y-4">
                  {pastAttempts.map(attempt => (
                    <li
                      key={attempt.id}
                      className="p-4 border border-gray-700/50 bg-gray-800/40 rounded-md shadow-sm"
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div className="flex-grow mb-2 md:mb-0">
                          <h4 className="text-lg font-medium text-white">{attempt.testTitle} ({attempt.testSubject})</h4>
                          <p className="text-sm text-gray-400">
                            Score: <span className="font-bold text-green-400">{attempt.score}%</span> ({attempt.correctCount}/{attempt.totalQuestionsInTest})
                            | Attempted: {attempt.submittedAt?.toDate ? attempt.submittedAt.toDate().toLocaleDateString() : new Date(attempt.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <ClockIcon className="w-5 h-5 text-gray-500 hidden md:block" title="Completed"/>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="font-sans min-h-screen bg-gray-900 flex text-gray-200">
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
                  <Link
                    key={item.title}
                    to={item.link}
                    onClick={() => {
                      if (item.link === '/student-tests') {
                        setCurrentView('dashboard');
                      }
                      if (!isDesktop) setIsSidebarOpen(false);
                    }}
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

      <main className={`flex-1 p-4 md:p-6 overflow-y-auto relative transition-margin duration-300 ease-in-out md:ml-64 max-w-4xl mx-auto`}>
        {!isDesktop && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="fixed left-4 top-4 z-40 p-2 bg-gray-800/80 backdrop-blur-sm rounded-lg hover:bg-gray-700 transition-colors shadow-lg"
          >
            <Bars3Icon className="w-6 h-6 text-gray-300" />
          </button>
        )}

        {renderContent()}
      </main>

      <style>{`
        .styled-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .styled-scrollbar::-webkit-scrollbar-track {
          background: rgba(55, 65, 81, 0.5);
          border-radius: 10px;
        }
        .styled-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(107, 114, 128, 0.7);
          border-radius: 10px;
        }
        .styled-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.9);
        }
        .styled-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(107, 114, 128, 0.7) rgba(55, 65, 81, 0.5);
        }
      `}</style>
    </div>
  );
};

export default StudentTests;
