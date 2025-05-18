import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AcademicCapIcon,
  BookOpenIcon,
  SparklesIcon,
  ChatBubbleLeftEllipsisIcon,
  ClockIcon,
  ClipboardDocumentIcon,
  UserGroupIcon,
  ChartBarIcon,
  LightBulbIcon,
  EnvelopeIcon,
  PencilIcon,
  TrashIcon,
  ChevronDownIcon,
  XMarkIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { GoogleGenerativeAI } from "@google/generative-ai";

Chart.register(...registerables);

const SuggestionsToStudents = () => {
  const [expandedStudents, setExpandedStudents] = useState(new Set());
  const [showNewSuggestionModal, setShowNewSuggestionModal] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [suggestions, setSuggestions] = useState([]);

  // Mock data with AI-enhanced suggestions
  const mockStudents = [
    {
      id: 1,
      name: 'Sarah Johnson',
      course: 'Computer Science',
      performance: {
        overall: 82,
        trends: [65, 72, 78, 82]
      },
      suggestions: [
        {
          id: 1,
          type: 'resource',
          subject: 'Algorithms',
          content: 'Review divide-and-conquer strategies for better algorithm optimization',
          status: 'pending',
          date: '2024-03-15',
          aiGenerated: true
        },
        {
          id: 2,
          type: 'practice',
          subject: 'Data Structures',
          content: 'Complete graph traversal exercises by Friday',
          status: 'completed',
          date: '2024-03-12',
          aiGenerated: false
        }
      ]
    },
    // ... more mock students
  ];

  const subjects = [
    'Algorithms', 'Data Structures', 'Machine Learning', 
    'Database Systems', 'Mathematics'
  ];

  const performanceData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [{
      label: 'Performance Trend',
      data: [65, 72, 78, 82],
      borderColor: 'rgba(139, 92, 246, 1)',
      tension: 0.4
    }]
  };

  useEffect(() => {
    setSuggestions(mockStudents);
  }, []);

  const generateAISuggestions = async (studentId) => {
    const student = mockStudents.find(s => s.id === studentId);
    // In real implementation, call Gemini API
    const aiSuggestions = [
      {
        id: Date.now(),
        type: 'ai',
        subject: 'Machine Learning',
        content: 'Explore regularization techniques to prevent model overfitting',
        status: 'pending',
        date: new Date().toISOString().split('T')[0],
        aiGenerated: true
      }
    ];
    
    setSuggestions(prev => prev.map(s => 
      s.id === studentId 
        ? { ...s, suggestions: [...s.suggestions, ...aiSuggestions] }
        : s
    ));
  };

  const toggleStudent = (studentId) => {
    setExpandedStudents(prev => {
      const newSet = new Set(prev);
      newSet.has(studentId) ? newSet.delete(studentId) : newSet.add(studentId);
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Personalized Suggestions
              </span>
            </h1>
            <p className="text-gray-400 text-lg">
              Deliver targeted academic guidance powered by AI insights
            </p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setShowAIInsights(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg hover:opacity-90 transition-all"
            >
              <SparklesIcon className="w-5 h-5" />
              AI Insights
            </button>
            <button 
              onClick={() => setShowNewSuggestionModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700/50 transition-all"
            >
              <PencilIcon className="w-5 h-5" />
              New Suggestion
            </button>
          </div>
        </div>

        {/* Stats & Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { title: 'Total Suggestions', value: 142, icon: LightBulbIcon, trend: '↑12%' },
            { title: 'Acceptance Rate', value: '78%', icon: ChartBarIcon, trend: '↑5%' },
            { title: 'Avg Implementation', value: '4.2d', icon: ClockIcon, trend: '↓1d' },
            { title: 'AI Suggestions', value: 63, icon: SparklesIcon, trend: '↑22%' }
          ].map((stat, index) => (
            <div key={index} className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                  <span className="text-xs text-green-400">{stat.trend}</span>
                </div>
                <stat.icon className="w-12 h-12 p-2.5 text-purple-400 bg-purple-500/20 rounded-xl" />
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Student List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-wrap gap-4 items-center bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
              <div className="flex items-center gap-2 flex-1">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search students..."
                  className="bg-transparent outline-none w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select
                className="bg-gray-700 rounded-lg px-4 py-2"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <option value="all">All Subjects</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>

            {suggestions.map(student => (
              <motion.div 
                key={student.id}
                className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden"
                layout
              >
                <div className="p-6 cursor-pointer hover:bg-gray-700/30 transition-colors"
                  onClick={() => toggleStudent(student.id)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                        <span className="text-white font-medium">
                          {student.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{student.name}</h3>
                        <p className="text-gray-400 text-sm">{student.course}</p>
                      </div>
                    </div>
                    <ChevronDownIcon className={`w-6 h-6 text-gray-400 transform transition-transform ${
                      expandedStudents.has(student.id) ? 'rotate-180' : ''
                    }`} />
                  </div>
                </div>

                {expandedStudents.has(student.id) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-6 border-t border-gray-700/50 space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="text-gray-300 font-medium flex items-center gap-2">
                          <LightBulbIcon className="w-5 h-5 text-purple-400" />
                          Active Suggestions
                        </h4>
                        {student.suggestions.map(suggestion => (
                          <div key={suggestion.id} className="p-4 bg-gray-700/30 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-purple-400 bg-purple-500/20 px-2 py-1 rounded-full">
                                {suggestion.subject}
                              </span>
                              <div className="flex items-center gap-2">
                                {suggestion.aiGenerated && (
                                  <SparklesIcon className="w-4 h-4 text-yellow-400" />
                                )}
                                <span className={`text-xs ${
                                  suggestion.status === 'completed' 
                                    ? 'text-green-400' 
                                    : 'text-yellow-400'
                                }`}>
                                  {suggestion.status}
                                </span>
                              </div>
                            </div>
                            <p className="text-gray-300 text-sm">{suggestion.content}</p>
                            <div className="flex items-center gap-2 mt-3">
                              <button className="text-xs text-blue-400 hover:text-blue-300">
                                Edit
                              </button>
                              <button className="text-xs text-red-400 hover:text-red-300">
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Performance Insight */}
                      <div className="bg-gray-700/30 p-4 rounded-lg">
                        <h4 className="text-gray-300 font-medium flex items-center gap-2 mb-4">
                          <ChartBarIcon className="w-5 h-5 text-green-400" />
                          Performance Analysis
                        </h4>
                        <div className="h-40">
                          <Line 
                            data={performanceData}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: { display: false }
                              },
                              scales: {
                                y: { display: false },
                                x: { ticks: { color: '#94a3b8' } }
                              }
                            }}
                          />
                        </div>
                        <div className="mt-4 flex items-center gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-white">
                              {student.performance.overall}%
                            </div>
                            <div className="text-xs text-gray-400">Current Score</div>
                          </div>
                          <button 
                            onClick={() => generateAISuggestions(student.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30"
                          >
                            <SparklesIcon className="w-4 h-4" />
                            Generate AI Suggestions
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Analytics Sidebar */}
          <div className="space-y-8">
            {/* Suggestion Effectiveness */}
            <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <AcademicCapIcon className="w-6 h-6 text-green-400" />
                Suggestion Impact
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-gray-400">Implementation Rate</div>
                  <div className="text-purple-400">78%</div>
                </div>
                <div className="h-40">
                  <Line 
                    data={{
                      labels: ['Jan', 'Feb', 'Mar', 'Apr'],
                      datasets: [{
                        data: [65, 72, 78, 82],
                        borderColor: '#8b5cf6',
                        tension: 0.4
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: { y: { display: false }, x: { ticks: { color: '#94a3b8' } } }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Quick Action Panel */}
            <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <ChatBubbleLeftEllipsisIcon className="w-6 h-6 text-blue-400" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 p-3 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg transition-colors">
                  <EnvelopeIcon className="w-5 h-5 text-purple-400" />
                  Send Bulk Reminders
                </button>
                <button className="w-full flex items-center gap-3 p-3 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors">
                  <ClipboardDocumentIcon className="w-5 h-5 text-blue-400" />
                  Create Template
                </button>
                <button className="w-full flex items-center gap-3 p-3 bg-green-500/20 hover:bg-green-500/30 rounded-lg transition-colors">
                  <UserGroupIcon className="w-5 h-5 text-green-400" />
                  Group Suggestions
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        {showNewSuggestionModal && (
          <NewSuggestionModal onClose={() => setShowNewSuggestionModal(false)} />
        )}

        {showAIInsights && (
          <AIInsightsModal onClose={() => setShowAIInsights(false)} />
        )}
      </div>
    </div>
  );
};

// Modal Components
const NewSuggestionModal = ({ onClose }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-gray-800 rounded-xl p-8 w-full max-w-2xl relative">
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
        <XMarkIcon className="w-6 h-6" />
      </button>
      <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
        Create New Suggestion
      </h3>
      {/* Add form elements here */}
    </div>
  </div>
);

const AIInsightsModal = ({ onClose }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-gray-800 rounded-xl p-8 w-full max-w-2xl relative">
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
        <XMarkIcon className="w-6 h-6" />
      </button>
      <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
        AI Insights Dashboard
      </h3>
      {/* Add AI insights content here */}
    </div>
  </div>
);

export default SuggestionsToStudents;