// TeacherTests.jsx
import React, { useState } from 'react';
import {
  HomeIcon,
  FolderIcon,
  ClipboardDocumentIcon,
  ChartBarIcon,
  DocumentTextIcon,
  MegaphoneIcon,
  AcademicCapIcon,
  GlobeAltIcon,
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
import { UserGroupIcon } from '@heroicons/react/24/solid'; // <-- Add this import
import axios from 'axios';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const generateQuestionsWithGemini = async ({ subject, topics, numQuestions, difficulty }) => {
    const prompt = `
Generate ${numQuestions} multiple-choice questions with answers for the subject "${subject}".
Topics: ${topics}
Difficulty: ${difficulty}
Format the response as a JSON array of objects, each with "text" (question) and "answer" (correct answer).
`;

    const body = {
        contents: [
            {
                parts: [{ text: prompt }]
            }
        ]
    };

    const response = await axios.post(GEMINI_API_URL, body, {
        headers: { 'Content-Type': 'application/json' }
    });

    // Parse the response
    const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
    let questions = [];
    try {
        questions = JSON.parse(text).map((q, i) => ({
            id: `q${i + 1}`,
            text: q.text,
            answer: q.answer
        }));
    } catch (e) {
        throw new Error('Failed to parse questions from Gemini response.');
    }
    return questions;
};

const TeacherTests = () => {
    const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'createTest', 'editTest'
    const [selectedTest, setSelectedTest] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [newTest, setNewTest] = useState({
        title: '',
        subject: '',
        topics: '',
        difficulty: 'Easy',
        numQuestions: 5,
        questions: []
    });
    const [createdTests, setCreatedTests] = useState([
        {
            id: 'test-001',
            title: 'Algebra Basics Quiz',
            subject: 'Mathematics',
            difficulty: 'Easy',
            timeLimit: 30,
            numQuestions: 10,
            description: 'This test covers basic algebraic operations and equations.',
            questions: [
                { id: 'q1', text: 'What is 2 + 2?', options: ['3', '4', '5', '6'], correctAnswer: '4' },
                { id: 'q2', text: 'Solve for x: x + 5 = 10', options: ['3', '4', '5', '6'], correctAnswer: '5' },
            ]
        },
        {
            id: 'test-002',
            title: 'World War II History',
            subject: 'History',
            difficulty: 'Medium',
            timeLimit: 45,
            numQuestions: 15,
            description: 'Comprehensive test on World War II events and figures.',
            questions: [
                { id: 'h1', text: 'When did World War II end?', options: ['1943', '1944', '1945', '1946'], correctAnswer: '1945' },
                { id: 'h2', text: 'Which country was not part of the Axis powers?', options: ['Germany', 'Italy', 'Japan', 'France'], correctAnswer: 'France' },
            ]
        }
    ]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleCreateTest = () => {
        setCurrentView('createTest');
        setNewTest({
            title: '',
            subject: '',
            topics: '',
            difficulty: 'Easy',
            numQuestions: 5,
            questions: []
        });
    };

    const handleEditTest = (test) => {
        setSelectedTest(test);
        setCurrentView('editTest');
    };

    const handleDeleteTest = (testId) => {
        if (window.confirm('Are you sure you want to delete this test?')) {
            setCreatedTests(prev => prev.filter(test => test.id !== testId));
        }
    };
    const educatorSidebarMenu = [
    { title: 'Dashboard', Icon: PresentationChartLineIcon, link: '/educator-dashboard', current: true },
    { title: 'Assignments', Icon: ClipboardDocumentIcon, link: '/assignment-management' },
    { title: 'Tests', Icon: ClipboardDocumentIcon, link: '/teacher-tests' },
    { title: 'Grades & Analytics', Icon: AcademicCapIcon, link: '/GradesAndAnalytics' },
    { title: 'Resources', Icon: FolderIcon, link: '/resource-management' },
    { title: 'Attendance', Icon: ChartBarIcon, link: '/attendance-tracking' },
    { title: 'Voice Chat', Icon: ChatBubbleLeftRightIcon, link: '/teacher-voice-chat' },
    { title: 'AI Chatbot (Ask Sparky)', Icon: ChatBubbleLeftRightIcon, link: '/chatbot-education' },
    { title: 'AI Questions', Icon: SparklesIcon, link: '/ai-generated-questions' },
    { title: 'Social / Chat', Icon: UserGroupIcon, link: '/chat-functionality' },
    { title: 'Educational News', Icon: GlobeAltIcon, link: '/educational-news' },
    { title: 'Student Suggestions', Icon: EnvelopeIcon, link: '/suggestions-to-students' },
    { title: 'Meetings & Conferences', Icon: VideoCameraIcon, link: '/meeting-host' },
    { title: 'Announcements', Icon: MegaphoneIcon, link: '/announcements' },
    { title: 'Upgrade to Pro', Icon: SparklesIcon, link: '/pricing', special: true },
  ];

    const handleGenerateQuestions = async () => {
        setLoading(true);
        setError('');
        try {
            const questions = await generateQuestionsWithGemini({
                subject: newTest.subject,
                topics: newTest.topics,
                numQuestions: newTest.numQuestions,
                difficulty: newTest.difficulty
            });
            setNewTest(prev => ({ ...prev, questions }));
            setCurrentView('review');
        } catch (e) {
            setError('Failed to generate questions.');
        } finally {
            setLoading(false);
        }
    };

    const handleEditQuestion = (index, field, value) => {
        const updatedQuestions = [...newTest.questions];
        updatedQuestions[index][field] = value;
        setNewTest(prev => ({ ...prev, questions: updatedQuestions }));
    };

    const handleSaveTest = () => {
        if (!newTest.title || !newTest.subject || !newTest.questions.length) {
            alert('Please fill in all required fields and generate questions.');
            return;
        }
        const testToSave = {
            ...newTest,
            id: `test-${Date.now()}`,
        };
        setCreatedTests(prev => [...prev, testToSave]);
        setCurrentView('dashboard');
        setNewTest({
            title: '',
            subject: '',
            topics: '',
            difficulty: 'Easy',
            numQuestions: 5,
            questions: []
        });
    };

    const renderContent = () => {
        switch (currentView) {
            case 'createTest':
                return (
                    <div className="p-6 bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-semibold mb-6 text-white">Create New Test</h2>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Test Title</label>
                                <input
                                    type="text"
                                    value={newTest.title}
                                    onChange={e => setNewTest(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Enter test title"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Subject</label>
                                <input
                                    type="text"
                                    value={newTest.subject}
                                    onChange={e => setNewTest(prev => ({ ...prev, subject: e.target.value }))}
                                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Enter subject"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Topics (comma separated)</label>
                                <textarea
                                    value={newTest.topics}
                                    onChange={e => setNewTest(prev => ({ ...prev, topics: e.target.value }))}
                                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    rows="2"
                                    placeholder="e.g. Algebra, Equations, Graphs"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Difficulty</label>
                                    <select
                                        value={newTest.difficulty}
                                        onChange={e => setNewTest(prev => ({ ...prev, difficulty: e.target.value }))}
                                        className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="Easy">Easy</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Hard">Hard</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Number of Questions</label>
                                    <input
                                        type="number"
                                        value={newTest.numQuestions}
                                        min={1}
                                        max={20}
                                        onChange={e => setNewTest(prev => ({ ...prev, numQuestions: parseInt(e.target.value) }))}
                                        className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                            {error && <div className="text-red-400">{error}</div>}
                            <div className="flex justify-end gap-4">
                                <button
                                    onClick={() => setCurrentView('dashboard')}
                                    className="px-6 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-600 transition-colors duration-200"
                                >Cancel</button>
                                <button
                                    onClick={handleGenerateQuestions}
                                    disabled={loading}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-60"
                                >{loading ? 'Generating...' : 'Generate Questions'}</button>
                            </div>
                        </div>
                    </div>
                );
            case 'review':
                return (
                    <div className="p-6 bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-semibold mb-6 text-white">Review & Edit Questions</h2>
                        <div className="space-y-6">
                            {newTest.questions.map((q, i) => (
                                <div key={q.id} className="mb-6 p-4 bg-slate-800/40 border border-slate-700/50 rounded-lg">
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Question {i + 1}</label>
                                    <input
                                        type="text"
                                        value={q.text}
                                        onChange={e => handleEditQuestion(i, 'text', e.target.value)}
                                        className="w-full px-4 py-2 mb-2 bg-slate-700/50 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Answer</label>
                                    <input
                                        type="text"
                                        value={q.answer}
                                        onChange={e => handleEditQuestion(i, 'answer', e.target.value)}
                                        className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            ))}
                            <div className="flex justify-end gap-4">
                                <button
                                    onClick={() => setCurrentView('createTest')}
                                    className="px-6 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-600 transition-colors duration-200"
                                >Back</button>
                                <button
                                    onClick={handleSaveTest}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
                                >Save Test</button>
                            </div>
                        </div>
                    </div>
                );
            case 'dashboard':
            default:
                return (
                    <div className="text-center py-5">
                        <h2 className="text-3xl font-bold mb-8 text-white">Teacher Dashboard - Tests</h2>
                        <div className="mt-8 p-6 bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-lg shadow-lg text-left">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-semibold text-white">Created Tests</h3>
                                <button
                                    onClick={() => setCurrentView('createTest')}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
                                >Create New Test</button>
                            </div>
                            {createdTests.length === 0 ? (
                                <p className="text-slate-400">No tests created yet.</p>
                            ) : (
                                <ul className="list-none p-0">
                                    {createdTests.map(test => (
                                        <li key={test.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border-b border-slate-700/50 last:border-b-0 bg-slate-800/40 rounded-md shadow-sm mb-3">
                                            <div className="flex-grow mb-2 md:mb-0">
                                                <h3 className="text-lg font-medium text-white">{test.title} ({test.subject})</h3>
                                                <p className="text-sm text-slate-400">
                                                    Topics: {test.topics} | Difficulty: {test.difficulty} | Questions: {test.questions.length}
                                                </p>
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
                        {educatorSidebarMenu.map((item) => (
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
                        {educatorSidebarMenu.map((item) => (
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

export default TeacherTests;