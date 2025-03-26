import { useState, useEffect } from 'react';
import {
  SparklesIcon,
  BookOpenIcon,
  ChartBarIcon,
  ChatBubbleLeftEllipsisIcon,
  ChevronDownIcon,
  LightBulbIcon,
  UserGroupIcon,
  ClockIcon,
  DocumentMagnifyingGlassIcon,
  ArrowsPointingOutIcon,
  SpeakerWaveIcon,
  ClipboardDocumentIcon,
  LanguageIcon
} from '@heroicons/react/24/outline';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { SimilarityVisualizer } from '../SimilarityVisualizer';
import { FeedbackTranslation } from '../FeedbackTranslation';
import { WritingAssistant } from '../WritingAssistant';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Register Chart.js components
Chart.register(...registerables);

// Initialize Gemini API
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const PersonalizedFeedback = () => {
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [activeTab, setActiveTab] = useState('feedback');
  const [showPeerComparison, setShowPeerComparison] = useState(false);
  const [aiFeatures, setAiFeatures] = useState({
    realTimeAssistant: false,
    argumentAnalysis: false,
    sentimentFeedback: false,
    translationActive: false,
    citationRepair: false
  });
  const [documentText, setDocumentText] = useState('');
  const [activeSentence, setActiveSentence] = useState(null);
  const [similarityScore, setSimilarityScore] = useState(null);
  const [translatedFeedback, setTranslatedFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [aiMessages, setAiMessages] = useState([]);
  const [userQuery, setUserQuery] = useState('');

  // Mock data with AI-enhanced fields
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
        suggestion: 'Use our citation generator tool to standardize formatting',
        aiFeatures: {
          autoFixAvailable: true,
          similarPapers: ['CS-2023-045', 'ENG-2024-112']
        }
      },
      {
        title: 'Surface-level Analysis',
        description: 'Section 3 could benefit from deeper industry comparison',
        suggestion: 'Review the comparative analysis guide in resources',
        aiFeatures: {
          exampleAvailable: true,
          argumentGaps: ['Market trends', 'Competitor analysis']
        }
      },
    ],
    performanceTrends: [
      { month: 'Jan', score: 72, peerAverage: 68 },
      { month: 'Feb', score: 78, peerAverage: 72 },
      { month: 'Mar', score: 85, peerAverage: 79 },
    ],
    learningResources: [
      { 
        title: 'Advanced Research Methods', 
        type: 'Video Course', 
        duration: '2h 15m',
        aiRecommended: true,
        relevanceScore: 92 
      },
      { 
        title: 'APA Format Guide', 
        type: 'Interactive Tutorial', 
        duration: '45m',
        aiRecommended: true,
        relevanceScore: 88  
      },
      { 
        title: 'Critical Analysis Workbook', 
        type: 'PDF Resource', 
        duration: '30m',
        aiRecommended: false,
        relevanceScore: 76  
      },
    ]
  };

  // Initialize with sample text and AI greeting
  useEffect(() => {
    const sampleText = "The research methodology could be improved by...";
    analyzeDocument(sampleText);
    
    // Add initial AI greeting
    setAiMessages([{
      role: 'ai',
      content: "Hello! I'm your AI Feedback Assistant. I can help analyze your paper, suggest improvements, and answer questions about your feedback. How can I assist you today?"
    }]);
  }, []);

  // AI Feature Toggles
  const toggleAiFeature = async (feature) => {
    const newState = !aiFeatures[feature];
    setAiFeatures(prev => ({
      ...prev,
      [feature]: newState
    }));
    
    // Special handling for features that require API calls
    if (newState) {
      try {
        setIsLoading(true);
        
        if (feature === 'translationActive') {
          await handleTranslateFeedback();
        } else if (feature === 'argumentAnalysis') {
          await analyzeArguments();
        } else if (feature === 'sentimentFeedback') {
          await analyzeSentiment();
        }
        
      } catch (error) {
        console.error("Error in AI feature:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Analyze document with Gemini API
  const analyzeDocument = async (text) => {
    setDocumentText(text);
    
    try {
      setIsLoading(true);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      // Get similarity score
      const similarityPrompt = `Analyze this text for originality and provide a similarity score (0-100) estimating how much overlaps with common sources:
      "${text}"
      Respond with ONLY the number.`;
      
      const similarityResult = await model.generateContent(similarityPrompt);
      const similarityResponse = await similarityResult.response.text();
      setSimilarityScore(parseInt(similarityResponse.trim()) || 75);                          
      // Get initial feedback
      const feedbackPrompt = `Provide concise academic feedback on this text in 2-3 sentences:
      "${text}"
      Focus on research quality, analysis depth, and clarity.`;
      
      const feedbackResult = await model.generateContent(feedbackPrompt);
      const feedbackResponse = await feedbackResult.response.text();
      
      // Update mock data with real feedback
      mockData.feedbackSummary = feedbackResponse;
      
    } catch (error) {
      console.error("Document analysis error:", error);
      setSimilarityScore(Math.floor(Math.random() * 30) + 70); // Fallback mock score
    } finally {
      setIsLoading(false);
    }
  };

  // Translate feedback with Gemini
  const handleTranslateFeedback = async () => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `Translate this academic feedback to Spanish:
      "${mockData.feedbackSummary}"
      Provide only the translation.`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response.text();
      
      setTranslatedFeedback({
        text: response,
        language: "Spanish",
        accuracy: 94
      });
      
    } catch (error) {
      console.error("Translation error:", error);
      // Fallback mock translation
      setTranslatedFeedback({
        text: "Su trabajo muestra buena investigación pero necesita mejorar las citas. Las soluciones creativas son excelentes.",
        language: "Spanish",
        accuracy: 85
      });
    }
  };

  // Analyze arguments with Gemini
  const analyzeArguments = async () => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `Analyze the argument structure in this text and provide scores (0-100) for:
      1. Claim Strength
      2. Evidence Quality
      3. Logical Flow
      Also identify the weakest section.
      Text: "${documentText}"
      Respond in JSON format: {
        claimStrength: number,
        evidenceQuality: number,
        logicalFlow: number,
        weakestSection: string
      }`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response.text();
      
      // Try to parse the JSON response
      try {
        const analysis = JSON.parse(response.trim());
        mockData.argumentAnalysis = analysis;
      } catch (e) {
        console.error("Failed to parse analysis:", e);
        // Fallback mock analysis
        mockData.argumentAnalysis = {
          claimStrength: 82,
          evidenceQuality: 75,
          logicalFlow: 68,
          weakestSection: 'Conclusion (needs more supporting evidence)'
        };
      }
      
    } catch (error) {
      console.error("Argument analysis error:", error);
      // Fallback mock analysis
      mockData.argumentAnalysis = {
        claimStrength: 82,
        evidenceQuality: 75,
        logicalFlow: 68,
        weakestSection: 'Conclusion (needs more supporting evidence)'
      };
    }
  };

  // Analyze sentiment with Gemini
  const analyzeSentiment = async () => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `Perform sentiment analysis on this academic text:
      "${documentText}"
      Identify:
      1. Overall tone (analytical, confident, uncertain, etc.)
      2. Confidence level (low, medium, high)
      3. Emotional markers (words indicating uncertainty or confidence)
      Respond in JSON format: {
        overallTone: string,
        confidenceLevel: string,
        emotionalMarkers: {
          uncertainty: string[],
          confidence: string[]
        }
      }`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response.text();
      
      // Try to parse the JSON response
      try {
        const sentiment = JSON.parse(response.trim());
        mockData.sentimentAnalysis = sentiment;
      } catch (e) {
        console.error("Failed to parse sentiment:", e);
        // Fallback mock sentiment
        mockData.sentimentAnalysis = {
          overallTone: 'analytical',
          confidenceLevel: 'medium',
          emotionalMarkers: {
            uncertainty: ['appears', 'seems', 'might'],
            confidence: ['clearly', 'demonstrates', 'proves']
          }
        };
      }
      
    } catch (error) {
      console.error("Sentiment analysis error:", error);
      // Fallback mock sentiment
      mockData.sentimentAnalysis = {
        overallTone: 'analytical',
        confidenceLevel: 'medium',
        emotionalMarkers: {
          uncertainty: ['appears', 'seems', 'might'],
          confidence: ['clearly', 'demonstrates', 'proves']
        }
      };
    }
  };

  // Handle user chat messages
  const handleUserMessage = async (e) => {
    e.preventDefault();
    if (!userQuery.trim()) return;
    
    // Add user message to chat
    const newUserMessage = { role: 'user', content: userQuery };
    setAiMessages(prev => [...prev, newUserMessage]);
    setUserQuery('');
    
    try {
      setIsLoading(true);
      
      // Get AI response
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `You are an AI teaching assistant helping a student with their paper. 
      The student has received this feedback: "${mockData.feedbackSummary}"
      The student asks: "${userQuery}"
      Provide a helpful, concise response (2-3 paragraphs max) that addresses their question while referencing their specific feedback.`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response.text();
      
      // Add AI response to chat
      setAiMessages(prev => [...prev, { role: 'ai', content: response }]);
      
    } catch (error) {
      console.error("Chat error:", error);
      // Add error message
      setAiMessages(prev => [...prev, { 
        role: 'ai', 
        content: "I'm having trouble responding right now. Please try again later or rephrase your question." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Chart data configuration
  const chartData = {
    labels: mockData.performanceTrends.map(item => item.month),
    datasets: [
      {
        label: 'Your Score',
        data: mockData.performanceTrends.map(item => item.score),
        borderColor: 'rgba(139, 92, 246, 1)',
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        tension: 0.3,
        pointRadius: 5
      },
      ...(showPeerComparison ? [{
        label: 'Peer Average',
        data: mockData.performanceTrends.map(item => item.peerAverage),
        borderColor: 'rgba(99, 102, 241, 1)',
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        tension: 0.3,
        pointRadius: 5,
        borderDash: [5, 5]
      }] : [])
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#e2e8f0'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        titleColor: '#f8fafc',
        bodyColor: '#e2e8f0'
      }
    },
    scales: {
      y: {
        min: 50,
        max: 100,
        ticks: {
          color: '#94a3b8'
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)'
        }
      },
      x: {
        ticks: {
          color: '#94a3b8'
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)'
        }
      }
    }
  };

  // Helper function to toggle sections
  const toggleSection = (section) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-8">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        {/* Header Section */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-4 md:p-6 border border-gray-700/50">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500/20 blur-2xl rounded-full" />
                <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <span className="text-2xl md:text-3xl font-bold text-white">{mockData.overallGrade}</span>
                </div>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">AI-Powered Feedback Analysis</h1>
                <p className="text-gray-400 text-sm md:text-base">Computer Science Research Paper - March 2024 Submission</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                className="px-4 py-2 md:px-6 md:py-3 bg-purple-500/20 text-purple-300 rounded-xl hover:bg-purple-500/30 transition-all flex items-center gap-2"
                onClick={() => toggleAiFeature('realTimeAssistant')}
              >
                <SparklesIcon className="w-4 h-4 md:w-5 md:h-5" />
                {aiFeatures.realTimeAssistant ? 'AI Assistant ON' : 'Enable AI'}
              </button>
            </div>
          </div>
        </div>

        {/* AI Features Quick Access */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-4 border border-gray-700/50">
          <div className="flex flex-wrap gap-3 justify-center">
            <button 
              onClick={() => toggleAiFeature('argumentAnalysis')}
              className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition-all ${aiFeatures.argumentAnalysis ? 'bg-blue-500/20 text-blue-300' : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700/70'}`}
            >
              <ArrowsPointingOutIcon className="w-4 h-4" />
              Argument Analysis
            </button>
            <button 
              onClick={() => toggleAiFeature('sentimentFeedback')}
              className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition-all ${aiFeatures.sentimentFeedback ? 'bg-green-500/20 text-green-300' : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700/70'}`}
            >
              <SpeakerWaveIcon className="w-4 h-4" />
              Sentiment Feedback
            </button>
            <button 
              onClick={() => toggleAiFeature('translationActive')}
              className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition-all ${aiFeatures.translationActive ? 'bg-yellow-500/20 text-yellow-300' : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700/70'}`}
            >
              <LanguageIcon className="w-4 h-4" />
              Translate Feedback
            </button>
            <button 
              onClick={() => toggleAiFeature('citationRepair')}
              className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition-all ${aiFeatures.citationRepair ? 'bg-red-500/20 text-red-300' : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700/70'}`}
            >
              <ClipboardDocumentIcon className="w-4 h-4" />
              Fix Citations
            </button>
          </div>
        </div>

        {/* Main Content Tabs */}
        <div className="flex overflow-x-auto gap-2 md:gap-4 border-b border-gray-700/50 scrollbar-hide">
          {['feedback', 'trends', 'resources', 'ai-tools'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 md:px-6 md:py-3 rounded-t-lg transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'text-purple-300 bg-gray-800/50 border-b-2 border-purple-500'
                  : 'text-gray-400 hover:bg-gray-800/30'
              }`}
            >
              {tab.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </button>
          ))}
        </div>

        {/* Feedback Content */}
        {activeTab === 'feedback' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Grade Breakdown */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-4 md:p-6 border border-gray-700/50">
              <h2 className="text-lg md:text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <ChartBarIcon className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
                Grade Breakdown
              </h2>
              <div className="space-y-4">
                {mockData.gradeBreakdown.map((item) => (
                  <div key={item.category} className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between text-xs md:text-sm mb-1">
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

              {/* AI Argument Analysis */}
              {aiFeatures.argumentAnalysis && mockData.argumentAnalysis && (
                <div className="mt-6 pt-6 border-t border-gray-700/50">
                  <h3 className="text-md font-medium text-white mb-3 flex items-center gap-2">
                    <ArrowsPointingOutIcon className="w-5 h-5 text-blue-400" />
                    Argument Analysis
                  </h3>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-gray-700/30 p-2 rounded-lg">
                      <div className="text-blue-400 text-sm">Claim Strength</div>
                      <div className="text-white font-medium">{mockData.argumentAnalysis.claimStrength}/100</div>
                    </div>
                    <div className="bg-gray-700/30 p-2 rounded-lg">
                      <div className="text-blue-400 text-sm">Evidence Quality</div>
                      <div className="text-white font-medium">{mockData.argumentAnalysis.evidenceQuality}/100</div>
                    </div>
                    <div className="bg-gray-700/30 p-2 rounded-lg">
                      <div className="text-blue-400 text-sm">Logical Flow</div>
                      <div className="text-white font-medium">{mockData.argumentAnalysis.logicalFlow}/100</div>
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-gray-400">
                    <span className="font-medium">Weakest Section:</span> {mockData.argumentAnalysis.weakestSection}
                  </div>
                </div>
              )}
            </div>

            {/* Feedback Summary */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-4 md:p-6 border border-gray-700/50">
              <h2 className="text-lg md:text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <ChatBubbleLeftEllipsisIcon className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
                AI Feedback Summary
                {aiFeatures.translationActive && translatedFeedback && (
                  <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full ml-auto">
                    {translatedFeedback.language}
                  </span>
                )}
              </h2>
              
              {aiFeatures.translationActive && translatedFeedback ? (
                <div className="prose prose-invert max-w-none mb-4">
                  <p className="text-gray-300 text-sm md:text-base">{translatedFeedback.text}</p>
                  <div className="text-xs text-yellow-400 mt-2">
                    Translation Accuracy: {translatedFeedback.accuracy}%
                  </div>
                </div>
              ) : (
                <div className="prose prose-invert max-w-none mb-4">
                  <p className="text-gray-300 text-sm md:text-base">{mockData.feedbackSummary}</p>
                </div>
              )}

              {/* Sentiment Analysis */}
              {aiFeatures.sentimentFeedback && mockData.sentimentAnalysis && (
                <div className="mt-4 mb-6 p-3 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-green-400 mb-2">
                    <SpeakerWaveIcon className="w-4 h-4" />
                    Sentiment Analysis
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-400">Overall Tone:</span>
                      <span className="text-white ml-2 capitalize">{mockData.sentimentAnalysis.overallTone}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Confidence:</span>
                      <span className="text-white ml-2 capitalize">{mockData.sentimentAnalysis.confidenceLevel}</span>
                    </div>
                    <div className="col-span-2 mt-1">
                      <div className="text-gray-400">Key Markers:</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {mockData.sentimentAnalysis.emotionalMarkers.uncertainty?.map((word, i) => (
                          <span 
                            key={`uncertainty-${i}`} 
                            className="px-2 py-0.5 rounded-full text-xs bg-red-500/20 text-red-300"
                          >
                            {word}
                          </span>
                        ))}
                        {mockData.sentimentAnalysis.emotionalMarkers.confidence?.map((word, i) => (
                          <span 
                            key={`confidence-${i}`} 
                            className="px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-300"
                          >
                            {word}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

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
                        <h3 className="text-gray-300 font-medium text-sm md:text-base">{mistake.title}</h3>
                        {mistake.aiFeatures.autoFixAvailable && aiFeatures.citationRepair && (
                          <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">
                            Auto-fix Available
                          </span>
                        )}
                      </div>
                      <ChevronDownIcon
                        className={`w-4 h-4 md:w-5 md:h-5 text-gray-400 transform transition-transform ${
                          expandedSections.has(`mistake-${index}`) ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                    {expandedSections.has(`mistake-${index}`) && (
                      <div className="mt-4 space-y-2">
                        <p className="text-xs md:text-sm text-gray-400">{mistake.description}</p>
                        <div className="flex items-center gap-2 text-xs md:text-sm text-blue-400">
                          <LightBulbIcon className="w-4 h-4" />
                          <span>{mistake.suggestion}</span>
                        </div>
                        
                        {/* AI-enhanced suggestions */}
                        {mistake.aiFeatures.similarPapers && (
                          <div className="mt-3 text-xs">
                            <div className="text-gray-500 mb-1">Similar papers that handled this well:</div>
                            <div className="flex flex-wrap gap-1">
                              {mistake.aiFeatures.similarPapers.map((paper, i) => (
                                <span key={i} className="px-2 py-0.5 bg-gray-600/50 rounded-full text-gray-300">
                                  {paper}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {mistake.aiFeatures.autoFixAvailable && aiFeatures.citationRepair && (
                          <button className="mt-3 w-full py-1.5 bg-purple-500/20 text-purple-300 rounded-lg text-xs hover:bg-purple-500/30 transition-all">
                            Apply Citation Fixes Automatically
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Performance Trends */}
        {activeTab === 'trends' && (
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-4 md:p-6 border border-gray-700/50">
            <div className="flex flex-wrap items-center justify-between mb-4 md:mb-6 gap-4">
              <h2 className="text-lg md:text-xl font-semibold text-white flex items-center gap-2">
                <ChartBarIcon className="w-5 h-5 md:w-6 md:h-6 text-green-400" />
                Performance Trends
              </h2>
              <button
                className="flex items-center gap-2 text-gray-400 hover:text-purple-300 text-sm md:text-base"
                onClick={() => setShowPeerComparison(!showPeerComparison)}
              >
                <UserGroupIcon className="w-4 h-4 md:w-5 md:h-5" />
                {showPeerComparison ? 'Hide' : 'Show'} Peer Comparison
              </button>
            </div>
            <div className="h-64">
              <Line data={chartData} options={chartOptions} />
            </div>
            
            {/* Similarity Analysis */}
            {similarityScore && (
              <div className="mt-6 pt-6 border-t border-gray-700/50">
                <h3 className="text-md font-medium text-white mb-3 flex items-center gap-2">
                  <DocumentMagnifyingGlassIcon className="w-5 h-5 text-blue-400" />
                  Originality Analysis
                </h3>
                <SimilarityVisualizer score={similarityScore} />
                <div className="text-xs text-gray-400 mt-2">
                  {similarityScore < 85 
                    ? "Consider adding more original analysis" 
                    : "Excellent originality in your work"}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Learning Resources */}
        {activeTab === 'resources' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockData.learningResources
              .sort((a, b) => b.relevanceScore - a.relevanceScore)
              .map((resource, index) => (
                <div
                  key={index}
                  className={`bg-gray-800/50 backdrop-blur-lg rounded-2xl p-4 md:p-6 border transition-all group ${
                    resource.aiRecommended 
                      ? 'border-purple-400/30 hover:border-purple-400/50' 
                      : 'border-gray-700/50 hover:border-gray-700/70'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${
                      resource.aiRecommended 
                        ? 'bg-purple-500/20 text-purple-400' 
                        : 'bg-gray-700/50 text-gray-400'
                    }`}>
                      <BookOpenIcon className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <h3 className="text-white font-medium mb-2 text-sm md:text-base">{resource.title}</h3>
                        {resource.aiRecommended && (
                          <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">
                            AI Recommended
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <DocumentMagnifyingGlassIcon className="w-4 h-4" />
                          {resource.type}
                        </span>
                        <span className="flex items-center gap-1">
                          <ClockIcon className="w-4 h-4" />
                          {resource.duration}
                        </span>
                      </div>
                      {resource.aiRecommended && (
                        <div className="mt-2">
                          <div className="text-xs text-gray-500">Relevance score:</div>
                          <div className="w-full bg-gray-700/50 rounded-full h-2 mt-1">
                            <div 
                              className="bg-purple-500 h-2 rounded-full" 
                              style={{ width: `${resource.relevanceScore}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <button className={`mt-4 w-full py-2 text-center rounded-lg transition-all text-sm md:text-base ${
                    resource.aiRecommended
                      ? 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30'
                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700/70'
                  }`}>
                    Explore Resource
                  </button>
                </div>
              ))}
          </div>
        )}

        {/* AI Tools Section */}
        {activeTab === 'ai-tools' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Writing Assistant */}
            <WritingAssistant 
              active={aiFeatures.realTimeAssistant}
              documentText={documentText}
              onTextChange={(text) => {
                setDocumentText(text);
                analyzeDocument(text);
              }}
              activeSentence={activeSentence}
              onSentenceHover={setActiveSentence}
            />
            
            {/* Feedback Translation */}
            <FeedbackTranslation 
              active={aiFeatures.translationActive}
              originalText={mockData.feedbackSummary}
              translatedFeedback={translatedFeedback}
              onTranslate={handleTranslateFeedback}
            />
          </div>
        )}

        {/* Interactive Chat Panel */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-4 md:p-6 border border-gray-700/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <SparklesIcon className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
            </div>
            <h3 className="text-base md:text-lg font-semibold text-white">AI Feedback Assistant</h3>
          </div>
          <div className="space-y-4 max-h-48 overflow-y-auto mb-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gray-700/50 rounded-lg">
                <SparklesIcon className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
              </div>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 text-sm md:text-base">
                  I noticed your analysis of market trends in section 2 could benefit from more recent data points. Would you like me to suggest relevant 2024 studies?
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <button className="flex-1 px-4 py-2 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-all text-sm md:text-base">
              Ask for Clarification
            </button>
            <button 
              className="flex-1 px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-all text-sm md:text-base"
              onClick={analyzeArguments}
            >
              Analyze Arguments
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalizedFeedback;