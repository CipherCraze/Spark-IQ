import { useState } from 'react';
import {
  SparklesIcon,
  BookOpenIcon,
  ChartBarIcon,
  ChatBubbleLeftEllipsisIcon,
  ArrowsPointingOutIcon,
  ChevronDownIcon,
  LightBulbIcon,
  UserGroupIcon,
  ClockIcon,
  DocumentMagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const PersonalizedFeedback = () => {
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [activeTab, setActiveTab] = useState('feedback');
  const [showPeerComparison, setShowPeerComparison] = useState(false);

  const toggleSection = (section) => {
    const newExpanded = new Set(expandedSections);
    newExpanded.has(section) ? newExpanded.delete(section) : newExpanded.add(section);
    setExpandedSections(newExpanded);
  };

  const mockData = {
    overallGrade: 'B+',
    gradeBreakdown: [
      { category: 'Research Quality', score: 85, weight: 30 },
      { category: 'Analysis Depth', score: 78, weight: 25 },
      { category: 'Structure & Flow', score: 82, weight: 20 },
      { category: 'Citations', score: 65, weight: 15 },
      { category: 'Creativity', score: 90, weight: 10 },
    ],
    feedbackSummary: `Your paper demonstrates strong research foundations but needs improvement in citation formatting and deeper critical analysis. The creative solutions proposed show excellent potential.`,
    commonMistakes: [
      {
        title: 'Inconsistent Citation Format',
        description: 'Mix of APA and MLA styles detected in references',
        suggestion: 'Use our citation generator tool to standardize formatting'
      },
      {
        title: 'Surface-level Analysis',
        description: 'Section 3 could benefit from deeper industry comparison',
        suggestion: 'Review the comparative analysis guide in resources'
      }
    ],
    performanceTrends: [
      { month: 'Jan', score: 72 },
      { month: 'Feb', score: 78 },
      { month: 'Mar', score: 85 },
    ],
    learningResources: [
      { title: 'Advanced Research Methods', type: 'Video Course', duration: '2h 15m' },
      { title: 'APA Format Guide', type: 'Interactive Tutorial', duration: '45m' },
      { title: 'Critical Analysis Workbook', type: 'PDF Resource', duration: '30m' },
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500/20 blur-2xl rounded-full" />
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">{mockData.overallGrade}</span>
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">AI-Powered Feedback Analysis</h1>
                <p className="text-gray-400">Computer Science Research Paper - March 2024 Submission</p>
              </div>
            </div>
            <button className="px-6 py-3 bg-purple-500/20 text-purple-300 rounded-xl hover:bg-purple-500/30 transition-all flex items-center gap-2">
              <SparklesIcon className="w-5 h-5" />
              Request Human Review
            </button>
          </div>
        </div>

        {/* Main Content Tabs */}
        <div className="flex gap-4 border-b border-gray-700/50">
          {['feedback', 'trends', 'resources'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-t-lg transition-all ${
                activeTab === tab 
                  ? 'text-purple-300 bg-gray-800/50 border-b-2 border-purple-500'
                  : 'text-gray-400 hover:bg-gray-800/30'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Feedback Content */}
        {activeTab === 'feedback' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Grade Breakdown */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <ChartBarIcon className="w-6 h-6 text-purple-400" />
                Grade Breakdown
              </h2>
              <div className="space-y-4">
                {mockData.gradeBreakdown.map((item) => (
                  <div key={item.category} className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300">{item.category}</span>
                        <span className="text-purple-400">{item.score}%</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                          style={{ width: `${item.score}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Feedback Summary */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <ChatBubbleLeftEllipsisIcon className="w-6 h-6 text-blue-400" />
                AI Feedback Summary
              </h2>
              <div className="space-y-6">
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300">{mockData.feedbackSummary}</p>
                </div>
                
                <div className="space-y-4">
                  {mockData.commonMistakes.map((mistake, index) => (
                    <div 
                      key={index}
                      className="group bg-gray-700/30 rounded-xl p-4 cursor-pointer transition-all hover:bg-gray-700/50"
                      onClick={() => toggleSection(`mistake-${index}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-red-400 rounded-full" />
                          <h3 className="text-gray-300 font-medium">{mistake.title}</h3>
                        </div>
                        <ChevronDownIcon className={`w-5 h-5 text-gray-400 transform transition-transform ${
                          expandedSections.has(`mistake-${index}`) ? 'rotate-180' : ''
                        }`} />
                      </div>
                      {expandedSections.has(`mistake-${index}`) && (
                        <div className="mt-4 space-y-2">
                          <p className="text-sm text-gray-400">{mistake.description}</p>
                          <div className="flex items-center gap-2 text-sm text-blue-400">
                            <LightBulbIcon className="w-4 h-4" />
                            <span>{mistake.suggestion}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Performance Trends */}
        {activeTab === 'trends' && (
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <ChartBarIcon className="w-6 h-6 text-green-400" />
                Performance Trends
              </h2>
              <button 
                className="flex items-center gap-2 text-gray-400 hover:text-purple-300"
                onClick={() => setShowPeerComparison(!showPeerComparison)}
              >
                <UserGroupIcon className="w-5 h-5" />
                {showPeerComparison ? 'Hide' : 'Show'} Peer Comparison
              </button>
            </div>
            
            <div className="h-64 relative">
              {/* Example Chart - Replace with actual chart library */}
              <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                Interactive Performance Chart Area
              </div>
            </div>
          </div>
        )}

        {/* Learning Resources */}
        {activeTab === 'resources' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockData.learningResources.map((resource, index) => (
              <div key={index} className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 hover:border-purple-400/30 transition-all group">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-500/20 rounded-lg">
                    <BookOpenIcon className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-medium mb-2">{resource.title}</h3>
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <DocumentMagnifyingGlassIcon className="w-4 h-4" />
                        {resource.type}
                      </span>
                      <span className="flex items-center gap-1">
                        <ClockIcon className="w-4 h-4" />
                        {resource.duration}
                      </span>
                    </div>
                  </div>
                </div>
                <button className="mt-4 w-full py-2 text-center bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-all">
                  Explore Resource
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Interactive Chat Panel */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <SparklesIcon className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">AI Feedback Assistant</h3>
          </div>
          
          <div className="space-y-4 h-48 overflow-y-auto mb-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gray-700/50 rounded-lg">
                <SparklesIcon className="w-5 h-5 text-purple-400" />
              </div>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300">
                  I noticed your analysis of market trends in section 2 could benefit from 
                  more recent data points. Would you like me to suggest relevant 2024 studies?
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button className="flex-1 px-4 py-2 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-all">
              Ask for Clarification
            </button>
            <button className="flex-1 px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-all">
              Request Examples
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalizedFeedback;