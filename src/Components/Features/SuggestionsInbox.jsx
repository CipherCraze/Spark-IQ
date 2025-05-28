import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; // Assuming react-router-dom is used
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  EnvelopeIcon,
  AcademicCapIcon,
  ChevronLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  ChatBubbleLeftEllipsisIcon,
  ArchiveBoxIcon,
  MagnifyingGlassIcon,
  BookmarkIcon,
  UserCircleIcon,
  HomeIcon,
  ChartBarIcon,
  BellIcon,
  SparklesIcon,
  Bars3Icon,
  XMarkIcon,
  PaperClipIcon,
  ArrowUpTrayIcon,
  LightBulbIcon,
  LanguageIcon,
  DocumentTextIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

// Initialize Gemini AI
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "YOUR_API_KEY_HERE"; // Fallback for safety
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const SuggestionsInbox = () => {
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [composeOpen, setComposeOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [messageDraft, setMessageDraft] = useState('');
  const [attachments, setAttachments] = useState([]);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const initialSuggestions = [
    {
      id: 1,
      teacher: 'Dr. Sarah Johnson',
      subject: 'Research Paper Improvement Suggestions',
      preview: 'I noticed your paper could benefit from more primary sources. Also, check the attached style guide.',
      date: '2024-03-15',
      category: 'Academic',
      status: 'unread',
      priority: 'high',
      fullMessage: `Dear Student,\n\nYour recent paper on climate change shows strong understanding of the core concepts, but could benefit from incorporating more primary sources. Specifically in section 3, you reference several secondary analyses that could be strengthened with data from original research studies.\n\nI'd recommend exploring databases like JSTOR and ScienceDirect for relevant peer-reviewed studies. The university library also has excellent resources to help with this.\n\nAdditionally, your conclusion could better tie back to your thesis statement. The current version feels somewhat abrupt. I've attached the university's official style guide for your reference.\n\nOverall, this is a strong effort and with these improvements could be excellent work. Please don't hesitate to come to office hours if you'd like to discuss further.\n\nBest regards,\nDr. Johnson`,
      attachments: [ // Added attachments example
        { name: 'UniversityStyleGuide.pdf', type: 'pdf', url: '#', size: '780KB' },
        { name: 'CitationExamples.docx', type: 'doc', url: '#', size: '120KB' },
      ]
    },
    {
      id: 2,
      teacher: 'Prof. Michael Chen',
      subject: 'Career Guidance Opportunity',
      preview: 'Your performance in the last project suggests you might excel in research roles...',
      date: '2024-03-14',
      category: 'Career',
      status: 'read',
      priority: 'medium',
      fullMessage: `Hello,\n\nI've been reviewing your work in our advanced statistics course and believe you have exceptional potential for research roles. Your analytical approach to problem-solving and attention to detail are exactly the skills needed for graduate-level research.\n\nThe university is offering a summer research fellowship that I think would be perfect for you. It's a paid position working with faculty on cutting-edge projects in data science.\n\nI'd be happy to write you a recommendation letter if you're interested. The deadline is April 15th. Let me know if you'd like to discuss this opportunity during office hours.\n\nBest,\nProf. Chen`,
      attachments: []
    },
    {
      id: 3,
      teacher: 'Dr. Emma Rodriguez',
      subject: 'Internship Recommendation & Company Profile',
      preview: 'Based on your skills in Python and data visualization, I recommend...',
      date: '2024-03-10',
      category: 'Career',
      status: 'pending-action',
      priority: 'high',
      fullMessage: `Dear Student,\n\nBased on your excellent performance in our Data Visualization course and demonstrated skills in Python, I'd like to recommend you for an internship opportunity at TechAnalytics Inc.\n\nThey're looking for students with exactly your skillset to work on their education data visualization tools. This would be a fantastic opportunity to apply what you've learned in a professional setting.\n\nThe position is 15-20 hours per week during the semester and pays $25/hour. I've attached the position description and a company profile to this message.\n\nIf you're interested, I can put you in touch with their hiring manager directly. Please let me know by Friday if you'd like me to make the introduction.\n\nRegards,\nDr. Rodriguez`,
      attachments: [
        { name: 'Internship_Description_TechAnalytics.pdf', type: 'pdf', url: '#', size: '350KB' },
        { name: 'TechAnalytics_Company_Profile.pdf', type: 'pdf', url: '#', size: '1.2MB' },
      ]
    },
  ];

  const [suggestions, setSuggestions] = useState(initialSuggestions);

  const statusStyles = {
    unread: 'text-red-400 bg-red-500/10',
    read: 'text-gray-400 bg-gray-500/10',
    'pending-action': 'text-amber-400 bg-amber-500/10',
    resolved: 'text-green-400 bg-green-500/10',
  };

  const priorityStyles = {
    high: 'bg-red-500/20 text-red-400',
    medium: 'bg-amber-500/20 text-amber-400',
    low: 'bg-blue-500/20 text-blue-400',
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setAttachments([...attachments, ...files.map(f => ({ name: f.name, size: f.size, type: f.type, fileObject: f }))]);
  };

  const removeReplyAttachment = (fileName) => {
    setAttachments(prev => prev.filter(file => file.name !== fileName));
  };

  const generateAiResponse = async () => {
    if (!selectedSuggestion) return;
    
    setIsGeneratingResponse(true);
    setAiResponse('');
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `You are an AI teaching assistant helping a student respond to this feedback from their professor:
      
      Professor: ${selectedSuggestion.teacher}
      Subject: ${selectedSuggestion.subject}
      Message: ${selectedSuggestion.fullMessage}

      Generate a professional, grateful response that:
      1. Thanks the professor for their feedback
      2. Addresses each of their key points (including any attachments if mentioned in the message)
      3. Shows the student will act on the suggestions
      4. Asks any clarifying questions if needed
      
      Keep it concise (2-3 paragraphs max) and in an appropriate academic tone.`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      setAiResponse(text);
      setMessageDraft(text);
    } catch (error) {
      console.error("AI generation error:", error);
      setAiResponse("Error: Could not generate response. Please check API key and network.");
    } finally {
      setIsGeneratingResponse(false);
    }
  };

  const translateMessage = async (targetLanguage = 'Spanish') => {
    if (!selectedSuggestion) return;
    
    setIsGeneratingResponse(true);
    setAiResponse('');
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `Translate the following academic message to ${targetLanguage} while maintaining the formal tone and academic style. Preserve any technical terms and keep the meaning accurate:

      Message to translate:
      "${selectedSuggestion.fullMessage}"`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      setAiResponse(`${targetLanguage} Translation:\n\n${text}`);
    } catch (error)
    {
      console.error("Translation error:", error);
      setAiResponse(`Error: Could not translate message to ${targetLanguage}.`);
    } finally {
      setIsGeneratingResponse(false);
    }
  };

  const summarizeFeedback = async () => {
    if (!selectedSuggestion) return;
    
    setIsGeneratingResponse(true);
    setAiResponse('');
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `Analyze this professor's feedback and extract the 3-5 most important actionable items for the student. Consider any mentioned attachments as part of the feedback. Present them as clear bullet points with brief explanations:

      Feedback to summarize:
      "${selectedSuggestion.fullMessage}"

      Format your response as:
      Key Action Items:
      - [Key point 1]: [Brief explanation]
      - [Key point 2]: [Brief explanation]
      ...`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      setAiResponse(text); // The prompt already asks for "Key Action Items:" header
    } catch (error) {
      console.error("Summarization error:", error);
      setAiResponse("Error: Could not summarize feedback.");
    } finally {
      setIsGeneratingResponse(false);
    }
  };

  const handleDeleteSuggestion = (suggestionId) => {
    setSuggestions(prevSuggestions => prevSuggestions.filter(s => s.id !== suggestionId));
    if (selectedSuggestion?.id === suggestionId) {
      setSelectedSuggestion(null);
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    setSelectedSuggestion(suggestion);
    setAiResponse('');
    setMessageDraft('');
    setAttachments([]);
  };
  
  const filteredSuggestions = suggestions.filter(suggestion => 
    suggestion.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    suggestion.teacher.toLowerCase().includes(searchQuery.toLowerCase()) ||
    suggestion.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col md:flex-row">
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800/90 border-r border-gray-700/50 p-6 backdrop-blur-lg transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? 'block' : 'hidden'} md:block`}>
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
            <AcademicCapIcon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            Spark IQ
          </h2>
        </div>
        
        <nav className="space-y-2">
          <button 
            className="w-full flex items-center gap-3 p-3 text-purple-300 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg hover:from-purple-500/30 hover:to-blue-500/30 transition-all"
            onClick={() => navigate('/dashboard')} // Ensure this route exists or change
          >
            <HomeIcon className="w-5 h-5" />
            <span>Dashboard</span>
          </button>
          
          {[
            { name: 'Inbox', icon: EnvelopeIcon, count: suggestions.filter(s => s.status === 'unread').length },
            { name: 'Starred', icon: BookmarkIcon, count: 0 },
            { name: 'Archived', icon: ArchiveBoxIcon, count: 0 }
          ].map((item) => (
            <button
              key={item.name}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all group ${item.name === 'Inbox' ? 'text-purple-300 bg-purple-500/10' : 'text-gray-300 hover:bg-gray-700/30'}`}
            >
              <item.icon className={`w-5 h-5 ${item.name === 'Inbox' ? 'text-purple-400' : 'text-gray-400 group-hover:text-purple-300'}`} />
              <span>{item.name}</span>
              {item.count > 0 && <span className="ml-auto text-xs bg-purple-500 text-white px-2 py-1 rounded-full">{item.count}</span>}
            </button>
          ))}
        </nav>

        <div className="mt-8 pt-8 border-t border-gray-700/50">
          <div className="p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/20">
            <div className="flex items-center gap-2 text-purple-300">
              <SparklesIcon className="w-5 h-5" />
              <span className="text-sm">AI Assistant</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">Get smart replies, translations, and summaries for selected suggestions.</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-x-hidden">
        <div className="p-4 md:p-6 border-b border-gray-700/50 flex items-center justify-between bg-gradient-to-r from-gray-800/70 to-gray-900/70 backdrop-blur-sm sticky top-0 z-30">
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              className="md:hidden p-2 hover:bg-gray-700/30 rounded-lg transition-all"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <XMarkIcon className="w-6 h-6 text-gray-300" /> : <Bars3Icon className="w-6 h-6 text-gray-300" />}
            </button>
            {selectedSuggestion ? (
              <button 
                onClick={() => setSelectedSuggestion(null)}
                className="p-2 hover:bg-gray-700/30 rounded-lg transition-all flex items-center gap-2"
              >
                <ChevronLeftIcon className="w-6 h-6 text-gray-300" />
                <span className="text-gray-300 hidden sm:inline">Back to Inbox</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 md:gap-3">
                <div className="p-1.5 bg-purple-500/20 rounded-lg">
                  <EnvelopeIcon className="w-6 h-6 text-purple-400" />
                </div>
                <h1 className="text-xl md:text-2xl font-semibold text-white">
                  Suggestions Inbox
                </h1>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            {!selectedSuggestion && (
              <div className="relative flex-1 max-w-xs">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search suggestions..."
                  className="pl-10 pr-4 py-2.5 bg-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 w-full transition-all text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}
            <button className="p-2 bg-gray-700/50 rounded-xl hover:bg-gray-700/70 transition-all relative">
              <BellIcon className="w-6 h-6 text-gray-300" />
              {suggestions.filter(s => s.status === 'unread').length > 0 && 
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-gray-800"></span>
              }
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {!selectedSuggestion ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredSuggestions.length > 0 ? filteredSuggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className={`group p-4 md:p-6 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-purple-400/50 transition-all cursor-pointer shadow-lg hover:shadow-purple-500/10 backdrop-blur-sm ${suggestion.status === 'unread' ? 'border-l-4 border-l-purple-400' : 'border-l-4 border-l-transparent'}`}
                  onClick={() => handleSelectSuggestion(suggestion)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${suggestion.priority === 'high' ? 'bg-red-400' : suggestion.priority === 'medium' ? 'bg-amber-400' : 'bg-blue-400'} ${suggestion.status === 'unread' ? 'animate-pulse' : ''}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3 mb-1 flex-wrap">
                        <h3 className="text-white font-medium group-hover:text-purple-300 transition-colors truncate text-lg" title={suggestion.subject}>
                          {suggestion.subject}
                        </h3>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${statusStyles[suggestion.status]} capitalize`}>
                          {suggestion.status.replace('-', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mb-1">From: <span className="text-gray-300">{suggestion.teacher}</span></p>
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">{suggestion.preview}</p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                        <div className="flex items-center gap-1 text-gray-500">
                          <ClockIcon className="w-4 h-4" />
                          <span>{suggestion.date}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                          <DocumentTextIcon className="w-4 h-4" />
                          <span>{suggestion.category}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${priorityStyles[suggestion.priority]} capitalize`}>
                          {suggestion.priority} priority
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button 
                        className="p-1.5 hover:bg-red-500/20 rounded-lg" 
                        title="Delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSuggestion(suggestion.id);
                        }}
                      >
                        <TrashIcon className="w-5 h-5 text-red-400 hover:text-red-300" />
                      </button>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-10">
                  <EnvelopeIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-xl text-gray-500">No suggestions match your search.</p>
                  <p className="text-sm text-gray-600">Try adjusting your search terms.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 shadow-2xl transform transition-all backdrop-blur-sm">
                <div className="p-4 md:p-6 border-b border-gray-700/50 bg-gradient-to-r from-gray-800/80 to-gray-900/60 rounded-t-xl">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                    <h2 className="text-xl md:text-2xl font-semibold text-white">{selectedSuggestion.subject}</h2>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 text-sm text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
                        <CheckCircleIcon className="w-5 h-5" />
                        <span>Verified Instructor</span>
                      </div>
                      <button 
                        onClick={() => handleDeleteSuggestion(selectedSuggestion.id)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-all"
                        title="Delete"
                      >
                        <TrashIcon className="w-5 h-5 text-red-400 hover:text-red-300" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-300">
                      <UserCircleIcon className="w-4 h-4 text-purple-400" />
                      <span>{selectedSuggestion.teacher}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <ClockIcon className="w-4 h-4 text-blue-400" />
                      <span>{selectedSuggestion.date}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${statusStyles[selectedSuggestion.status]} capitalize`}>
                      {selectedSuggestion.status.replace('-', ' ')}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${priorityStyles[selectedSuggestion.priority]} capitalize`}>
                      {selectedSuggestion.priority} priority
                    </span>
                  </div>
                </div>

                <div className="p-4 md:p-6 prose prose-sm sm:prose-base prose-invert max-w-none bg-gray-800/30">
                  {selectedSuggestion.fullMessage.split('\n').map((para, i) => (
                    <p key={i} className="mb-3 text-gray-300 leading-relaxed">{para}</p>
                  ))}
                </div>

                {/* Received Attachments Section */}
                {selectedSuggestion.attachments && selectedSuggestion.attachments.length > 0 && (
                  <div className="p-4 md:p-6 border-t border-gray-700/50 bg-gray-800/20">
                    <h4 className="text-md font-semibold text-gray-200 mb-3 flex items-center gap-2">
                      <PaperClipIcon className="w-5 h-5 text-purple-400" />
                      Attachments ({selectedSuggestion.attachments.length})
                    </h4>
                    <div className="space-y-2">
                      {selectedSuggestion.attachments.map((file, index) => (
                        <a
                          key={index}
                          href={file.url || '#'} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between gap-2 p-2.5 bg-gray-700/40 hover:bg-gray-700/60 rounded-lg transition-colors text-purple-300 hover:text-purple-200 group"
                          download={file.name} 
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <DocumentTextIcon className="w-5 h-5 text-gray-400 group-hover:text-purple-300 transition-colors" />
                            <span className="truncate" title={file.name}>{file.name}</span>
                          </div>
                          {file.size && <span className="text-xs text-gray-500 whitespace-nowrap">{file.size}</span>}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {aiResponse && (
                  <div className="p-4 md:p-6 border-t border-gray-700/50 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
                    <div className="flex items-center gap-2 mb-3">
                      <SparklesIcon className="w-5 h-5 text-purple-400" />
                      <h3 className="text-lg font-medium text-purple-300">AI Assistant</h3>
                    </div>
                    <div className="prose prose-sm sm:prose-base prose-invert max-w-none bg-gray-800/40 p-4 rounded-lg border border-gray-700">
                      {aiResponse.split('\n').map((para, i) => (
                        <p key={i} className="mb-3 text-gray-300 leading-relaxed">{para}</p>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-4 md:p-6 border-t border-gray-700/50 bg-gray-800/50 rounded-b-xl flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-3">
                    <button 
                      onClick={generateAiResponse}
                      disabled={isGeneratingResponse}
                      className="px-4 py-2 text-sm bg-purple-500/20 text-purple-300 rounded-xl hover:bg-purple-500/30 flex items-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <SparklesIcon className="w-5 h-5" />
                      <span>{isGeneratingResponse && aiResponse.includes('Generating...') ? 'Generating...' : 'AI Reply Draft'}</span>
                    </button>
                    <button 
                      onClick={() => translateMessage()}
                      disabled={isGeneratingResponse}
                      className="px-4 py-2 text-sm bg-blue-500/20 text-blue-300 rounded-xl hover:bg-blue-500/30 flex items-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <LanguageIcon className="w-5 h-5" />
                      <span>Translate</span>
                    </button>
                    <button 
                      onClick={summarizeFeedback}
                      disabled={isGeneratingResponse}
                      className="px-4 py-2 text-sm bg-amber-500/20 text-amber-300 rounded-xl hover:bg-amber-500/30 flex items-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <LightBulbIcon className="w-5 h-5" />
                      <span>Summarize</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {!selectedSuggestion && (
          <button 
            className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 p-3.5 sm:p-4 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full hover:from-purple-600 hover:to-blue-600 shadow-xl transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-gray-900"
            onClick={() => setComposeOpen(true)}
            title="Compose New Message"
          >
            <PencilIcon className="w-6 h-6 text-white" />
          </button>
        )}

        {composeOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md" onClick={() => setComposeOpen(false)}>
            <div className="bg-gray-800 rounded-xl p-4 md:p-6 max-w-2xl w-full shadow-2xl border border-gray-700/50" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">New Message</h2>
                <button 
                  onClick={() => setComposeOpen(false)}
                  className="p-1.5 hover:bg-gray-700/50 rounded-lg transition-all"
                >
                  <XMarkIcon className="w-6 h-6 text-gray-400" />
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Simplified compose form - can be expanded */}
                <div>
                  <label className="block text-sm text-gray-400 mb-1">To</label>
                  <input 
                    type="text" 
                    className="w-full p-3 bg-gray-700/60 border border-gray-600 rounded-lg text-white placeholder-gray-400/70 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Teacher or Admin email"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Subject</label>
                  <input 
                    type="text" 
                    className="w-full p-3 bg-gray-700/60 border border-gray-600 rounded-lg text-white placeholder-gray-400/70 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Message subject"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Message</label>
                  <textarea 
                    className="w-full p-3 bg-gray-700/60 border border-gray-600 rounded-lg text-white placeholder-gray-400/70 min-h-[150px] focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Type your message here..."
                  />
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
                  <button 
                    onClick={() => fileInputRef.current?.click()} // Re-use existing ref or create new one if needed
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-700/70 transition-all text-sm"
                  >
                    <ArrowUpTrayIcon className="w-5 h-5" />
                    Attach Files
                  </button>
                  <div className="flex gap-3 w-full sm:w-auto">
                    <button className="flex-1 sm:flex-none px-4 py-2.5 bg-gray-700/50 text-gray-300 rounded-xl hover:bg-gray-700/70 transition-all text-sm">
                      Save Draft
                    </button>
                    <button className="flex-1 sm:flex-none px-4 py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all font-medium text-sm">
                      Send Message
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuggestionsInbox;