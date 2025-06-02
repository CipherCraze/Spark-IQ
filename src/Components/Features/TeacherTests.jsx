// TeacherTests.jsx
import React, { useState } from 'react';

const TeacherTests = () => {
    const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'createTest', 'editTest'
    const [selectedTest, setSelectedTest] = useState(null);
    const [newTest, setNewTest] = useState({
        title: '',
        subject: '',
        difficulty: 'Easy',
        timeLimit: 30,
        description: '',
        questions: []
    });

    // Dummy data for created tests
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

    const handleCreateTest = () => {
        setCurrentView('createTest');
        setNewTest({
            title: '',
            subject: '',
            difficulty: 'Easy',
            timeLimit: 30,
            description: '',
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

    const handleAddQuestion = () => {
        const newQuestion = {
            id: `q${Date.now()}`,
            text: '',
            options: ['', '', '', ''],
            correctAnswer: ''
        };
        setNewTest(prev => ({
            ...prev,
            questions: [...prev.questions, newQuestion]
        }));
    };

    const handleQuestionChange = (index, field, value) => {
        const updatedQuestions = [...newTest.questions];
        updatedQuestions[index] = {
            ...updatedQuestions[index],
            [field]: value
        };
        setNewTest(prev => ({
            ...prev,
            questions: updatedQuestions
        }));
    };

    const handleOptionChange = (questionIndex, optionIndex, value) => {
        const updatedQuestions = [...newTest.questions];
        updatedQuestions[questionIndex].options[optionIndex] = value;
        setNewTest(prev => ({
            ...prev,
            questions: updatedQuestions
        }));
    };

    const handleSaveTest = () => {
        if (!newTest.title || !newTest.subject || newTest.questions.length === 0) {
            alert('Please fill in all required fields and add at least one question.');
            return;
        }

        const testToSave = {
            ...newTest,
            id: selectedTest ? selectedTest.id : `test-${Date.now()}`,
            numQuestions: newTest.questions.length
        };

        if (selectedTest) {
            setCreatedTests(prev => prev.map(test => 
                test.id === selectedTest.id ? testToSave : test
            ));
        } else {
            setCreatedTests(prev => [...prev, testToSave]);
        }

        setCurrentView('dashboard');
        setSelectedTest(null);
    };

    const renderContent = () => {
        switch (currentView) {
            case 'createTest':
            case 'editTest':
                return (
                    <div className="p-6 bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-semibold mb-6 text-white">
                            {currentView === 'createTest' ? 'Create New Test' : 'Edit Test'}
                        </h2>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Test Title</label>
                                <input
                                    type="text"
                                    value={newTest.title}
                                    onChange={(e) => setNewTest(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Enter test title"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Subject</label>
                                <input
                                    type="text"
                                    value={newTest.subject}
                                    onChange={(e) => setNewTest(prev => ({ ...prev, subject: e.target.value }))}
                                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Enter subject"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Difficulty</label>
                                    <select
                                        value={newTest.difficulty}
                                        onChange={(e) => setNewTest(prev => ({ ...prev, difficulty: e.target.value }))}
                                        className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="Easy">Easy</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Hard">Hard</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Time Limit (minutes)</label>
                                    <input
                                        type="number"
                                        value={newTest.timeLimit}
                                        onChange={(e) => setNewTest(prev => ({ ...prev, timeLimit: parseInt(e.target.value) }))}
                                        className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        min="1"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                                <textarea
                                    value={newTest.description}
                                    onChange={(e) => setNewTest(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    rows="3"
                                    placeholder="Enter test description"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-medium text-white">Questions</h3>
                                    <button
                                        onClick={handleAddQuestion}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
                                    >
                                        Add Question
                                    </button>
                                </div>

                                {newTest.questions.map((question, qIndex) => (
                                    <div key={question.id} className="mb-6 p-4 bg-slate-800/40 border border-slate-700/50 rounded-lg">
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-slate-300 mb-2">Question {qIndex + 1}</label>
                                            <input
                                                type="text"
                                                value={question.text}
                                                onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)}
                                                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                placeholder="Enter question"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            {question.options.map((option, oIndex) => (
                                                <div key={oIndex} className="flex items-center gap-3">
                                                    <input
                                                        type="radio"
                                                        name={`correct-${question.id}`}
                                                        checked={question.correctAnswer === option}
                                                        onChange={() => handleQuestionChange(qIndex, 'correctAnswer', option)}
                                                        className="text-indigo-500 focus:ring-indigo-500"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={option}
                                                        onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                                        className="flex-1 px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                        placeholder={`Option ${oIndex + 1}`}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-end gap-4">
                                <button
                                    onClick={() => {
                                        setCurrentView('dashboard');
                                        setSelectedTest(null);
                                    }}
                                    className="px-6 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-600 transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveTest}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
                                >
                                    Save Test
                                </button>
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
                                    onClick={handleCreateTest}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
                                >
                                    Create New Test
                                </button>
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
                                                    Difficulty: {test.difficulty} | Time Limit: {test.timeLimit} mins | Questions: {test.numQuestions}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEditTest(test)}
                                                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteTest(test.id)}
                                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200"
                                                >
                                                    Delete
                                                </button>
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
        <div className="font-sans p-6 w-full min-h-screen bg-slate-900">
            {renderContent()}
        </div>
    );
};

export default TeacherTests;