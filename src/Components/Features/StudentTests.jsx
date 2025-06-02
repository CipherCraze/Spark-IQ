// StudentTests.jsx
import React, { useState, useEffect } from 'react';
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
  Bars3Icon
} from '@heroicons/react/24/outline';

const StudentTests = () => {
    const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'takeTest', 'showResult'
    const [selectedTest, setSelectedTest] = useState(null);
    const [answers, setAnswers] = useState({});
    const [score, setScore] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState(0); // In seconds
    const [timerId, setTimerId] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Dummy data for available tests (teacher-generated tests)
    const [availableTests, setAvailableTests] = useState([
        {
            id: 'test-001',
            title: 'Algebra Basics Quiz',
            subject: 'Mathematics',
            difficulty: 'Easy',
            timeLimit: 30, // minutes
            numQuestions: 10,
            description: 'This test covers basic algebraic operations and equations.',
            questions: [
                { id: 'q1', text: 'What is 2 + 2?', options: ['3', '4', '5', '6'], correctAnswer: '4' },
                { id: 'q2', text: 'Solve for x: x + 5 = 10', options: ['3', '4', '5', '6'], correctAnswer: '5' },
                { id: 'q3', text: 'What is 3 * 4?', options: ['7', '10', '12', '15'], correctAnswer: '12' },
                { id: 'q4', text: 'If y = 2x and x = 3, what is y?', options: ['4', '5', '6', '7'], correctAnswer: '6' },
                { id: 'q5', text: 'Simplify: 2(x + 3)', options: ['2x + 3', '2x + 6', 'x + 6', '5x'], correctAnswer: '2x + 6' },
            ]
        },
        {
            id: 'test-003',
            title: 'Introduction to Physics',
            subject: 'Physics',
            difficulty: 'Medium',
            timeLimit: 45,
            numQuestions: 15,
            description: 'Fundamental concepts of mechanics and energy.',
            questions: [
                { id: 'p1', text: 'What is the SI unit of force?', options: ['Joule', 'Watt', 'Newton', 'Pascal'], correctAnswer: 'Newton' },
                { id: 'p2', text: 'Which of these is a scalar quantity?', options: ['Velocity', 'Acceleration', 'Mass', 'Force'], correctAnswer: 'Mass' },
                { id: 'p3', text: 'What is the formula for kinetic energy?', options: ['mgh', '1/2mv^2', 'F=ma', 'P=IV'], correctAnswer: '1/2mv^2' },
            ]
        }
    ]);

    // Dummy data for past attempts
    const [pastAttempts, setPastAttempts] = useState([
        { id: 'attempt-001', testId: 'test-001', title: 'Algebra Basics Quiz', subject: 'Mathematics', score: 70, dateAttempted: '2023-10-21' },
        { id: 'attempt-002', testId: 'test-002', title: 'World War II History', subject: 'History', score: 65, dateAttempted: '2023-09-17' },
    ]);

    const studentMenu = [
        { title: 'Dashboard', Icon: HomeIcon, link: '/dashboard', description: "Overview of your progress." },
        { title: 'My Resources', Icon: FolderIcon, link: '/resource-utilization', description: "Access course materials." },
        { title: 'Tests', Icon: ClipboardDocumentIcon, link: '/student-tests', description: "Take and view your test results." },
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

    useEffect(() => {
        if (currentView === 'takeTest' && timeRemaining > 0) {
            const id = setInterval(() => {
                setTimeRemaining(prev => prev - 1);
            }, 1000);
            setTimerId(id);
            return () => clearInterval(id);
        } else if (timeRemaining === 0 && currentView === 'takeTest') {
            handleSubmitTest(true);
        }
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
        setTimeRemaining(test.timeLimit * 60);
        setCurrentView('takeTest');
    };

    const handleAnswerChange = (questionId, selectedOption) => {
        setAnswers(prev => ({ ...prev, [questionId]: selectedOption }));
    };

    const handleSubmitTest = (timedOut = false) => {
        clearInterval(timerId);
        let correctCount = 0;
        selectedTest.questions.forEach(q => {
            if (answers[q.id] === q.correctAnswer) {
                correctCount++;
            }
        });
        const calculatedScore = (correctCount / selectedTest.questions.length) * 100;
        setScore(calculatedScore.toFixed(2));

        const newAttempt = {
            id: `attempt-${Date.now()}`,
            testId: selectedTest.id,
            title: selectedTest.title,
            subject: selectedTest.subject,
            score: parseFloat(calculatedScore.toFixed(2)),
            dateAttempted: new Date().toISOString().split('T')[0],
        };
        setPastAttempts(prev => [...prev, newAttempt]);

        if (timedOut) {
            alert(`Time's up! Your test has been automatically submitted. Score: ${calculatedScore.toFixed(2)}%`);
        } else {
            alert(`Test submitted! Your score is: ${calculatedScore.toFixed(2)}%`);
        }

        setCurrentView('showResult');
    };

    const renderContent = () => {
        switch (currentView) {
            case 'takeTest':
                if (!selectedTest) {
                    return <p className="text-gray-400">No test selected. <button onClick={() => setCurrentView('dashboard')} className="ml-2 px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-600 text-sm transition-colors duration-200">Go back</button></p>;
                }
                return (
                    <div className="p-6 bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-semibold mb-4 text-white">{selectedTest.title}</h2>
                        <p className="text-lg text-slate-300 mb-5 pb-2 border-b border-slate-700/50">
                            Subject: {selectedTest.subject} | Difficulty: {selectedTest.difficulty} | Time Left: <span className="font-bold text-red-400 text-xl">{formatTime(timeRemaining)}</span>
                        </p>
                        <p className="italic text-slate-400 mb-6">{selectedTest.description}</p>

                        <form onSubmit={(e) => { e.preventDefault(); handleSubmitTest(); }} className="flex flex-col gap-5">
                            {selectedTest.questions.map((q, index) => (
                                <div key={q.id} className="border border-slate-700/50 rounded-lg p-4 bg-slate-800/40 shadow-sm">
                                    <p className="text-lg font-medium mb-4 text-white"><strong>{index + 1}.</strong> {q.text}</p>
                                    <div className="flex flex-col gap-3">
                                        {q.options.map((option, optIndex) => (
                                            <label key={optIndex} className="flex items-center cursor-pointer p-2 rounded-md hover:bg-slate-700/50 transition-colors duration-200">
                                                <input
                                                    type="radio"
                                                    name={`question-${q.id}`}
                                                    value={option}
                                                    checked={answers[q.id] === option}
                                                    onChange={() => handleAnswerChange(q.id, option)}
                                                    className="mr-3 transform scale-110 text-indigo-500 focus:ring-indigo-500"
                                                />
                                                <span className="text-slate-300">{option}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            <button type="submit" className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-lg mt-6 self-end transition-colors duration-200">Submit Test</button>
                        </form>
                    </div>
                );
            case 'showResult':
                return (
                    <div className="p-6 bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-lg shadow-lg text-center">
                        <h2 className="text-3xl font-bold mb-4 text-white">Test Result for: {selectedTest?.title}</h2>
                        {score !== null ? (
                            <>
                                <p className="text-2xl font-semibold text-slate-300 mb-6">Your Score: <span className="text-green-400 text-4xl">{score}%</span></p>
                                <p className="text-slate-400">Congratulations on completing the test!</p>
                            </>
                        ) : (
                            <p className="text-slate-400">Calculating score...</p>
                        )}
                        <button onClick={() => setCurrentView('dashboard')} className="mt-8 px-5 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-600 transition-colors duration-200">Back to Dashboard</button>
                    </div>
                );
            case 'dashboard':
            default:
                return (
                    <div className="text-center py-5">
                        <h2 className="text-3xl font-bold mb-8 text-white">Student Dashboard - Tests</h2>

                        <div className="mt-8 p-6 bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-lg shadow-lg text-left">
                            <h3 className="text-2xl font-semibold mb-4 text-white">Available Tests</h3>
                            {availableTests.length === 0 ? (
                                <p className="text-slate-400">No tests available at the moment.</p>
                            ) : (
                                <ul className="list-none p-0">
                                    {availableTests.map(test => (
                                        <li key={test.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border-b border-slate-700/50 last:border-b-0 bg-slate-800/40 rounded-md shadow-sm mb-3">
                                            <div className="flex-grow mb-2 md:mb-0">
                                                <h3 className="text-lg font-medium text-white">{test.title} ({test.subject})</h3>
                                                <p className="text-sm text-slate-400">Difficulty: {test.difficulty} | Time Limit: {test.timeLimit} mins | Questions: {test.numQuestions}</p>
                                            </div>
                                            <button onClick={() => handleStartTest(test)} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm transition-colors duration-200">
                                                Start Test
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="mt-8 p-6 bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-lg shadow-lg text-left">
                            <h3 className="text-2xl font-semibold mb-4 text-white">Past Attempts</h3>
                            {pastAttempts.length === 0 ? (
                                <p className="text-slate-400">You haven't attempted any tests yet.</p>
                            ) : (
                                <ul className="list-none p-0">
                                    {pastAttempts.map(attempt => (
                                        <li key={attempt.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border-b border-slate-700/50 last:border-b-0 bg-slate-800/40 rounded-md shadow-sm mb-3">
                                            <div className="flex-grow mb-2 md:mb-0">
                                                <h3 className="text-lg font-medium text-white">{attempt.title} ({attempt.subject})</h3>
                                                <p className="text-sm text-slate-400">Score: <span className="font-bold text-green-400">{attempt.score}%</span> | Attempted On: {attempt.dateAttempted}</p>
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
        <div className="font-sans min-h-screen bg-slate-900 flex">
            {/* Mobile sidebar */}
            <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
                <div className="relative flex flex-col w-72 max-w-xs h-full bg-slate-800">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
                        <h2 className="text-xl font-bold text-white">SPARK-IQ</h2>
                        <button
                            type="button"
                            className="rounded-md p-2 text-slate-400 hover:text-white focus:outline-none"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>
                    <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                        {studentMenu.map((item) => (
                            <a
                                key={item.title}
                                href={item.link}
                                className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                                    item.title === 'Tests' 
                                        ? 'bg-indigo-700 text-white' 
                                        : 'text-slate-300 hover:bg-slate-700/50'
                                } ${item.special ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' : ''}`}
                            >
                                <item.Icon className="flex-shrink-0 h-5 w-5 mr-3" />
                                {item.title}
                                {item.special && (
                                    <span className="ml-auto px-2 py-0.5 text-xs rounded-full bg-white/20">PRO</span>
                                )}
                            </a>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Desktop sidebar */}
            <div className="hidden lg:flex lg:flex-shrink-0">
                <div className="flex flex-col w-72 border-r border-slate-700 bg-slate-800">
                    <div className="flex items-center h-16 px-4 border-b border-slate-700">
                        <h2 className="text-xl font-bold text-white">SPARK-IQ</h2>
                    </div>
                    <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                        {studentMenu.map((item) => (
                            <a
                                key={item.title}
                                href={item.link}
                                className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                                    item.title === 'Tests' 
                                        ? 'bg-indigo-700 text-white' 
                                        : 'text-slate-300 hover:bg-slate-700/50'
                                } ${item.special ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' : ''}`}
                            >
                                <item.Icon className="flex-shrink-0 h-5 w-5 mr-3" />
                                {item.title}
                                {item.special && (
                                    <span className="ml-auto px-2 py-0.5 text-xs rounded-full bg-white/20">PRO</span>
                                )}
                            </a>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 overflow-auto">
                <div className="lg:hidden sticky top-0 z-10 bg-slate-800 p-4 border-b border-slate-700 flex items-center justify-between">
                    <button
                        type="button"
                        className="rounded-md p-2 text-slate-400 hover:text-white focus:outline-none"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Bars3Icon className="h-6 w-6" />
                    </button>
                    <h1 className="text-xl font-bold text-white">Tests</h1>
                </div>
                
                <div className="p-6 w-full">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default StudentTests;