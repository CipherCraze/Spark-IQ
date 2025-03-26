import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
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
  DocumentTextIcon
} from '@heroicons/react/24/outline';

// Initialize Gemini AI
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
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

  const suggestions = [
    {
      id: 1,
      teacher: 'Dr. Sarah Johnson',
      subject: 'Research Paper Improvement Suggestions',
      preview: 'I noticed your paper could benefit from more primary sources...',
      date: '2024-03-15',
      category: 'Academic',
      status: 'unread',
      priority: 'high',
      fullMessage: `Dear Student,\n\nYour recent paper on climate change shows strong understanding of the core concepts, but could benefit from incorporating more primary sources. Specifically in section 3, you reference several secondary analyses that could be strengthened with data from original research studies.\n\nI'd recommend exploring databases like JSTOR and ScienceDirect for relevant peer-reviewed studies. The university library also has excellent resources to help with this.\n\nAdditionally, your conclusion could better tie back to your thesis statement. The current version feels somewhat abrupt.\n\nOverall, this is a strong effort and with these improvements could be excellent work. Please don't hesitate to come to office hours if you'd like to discuss further.\n\nBest regards,\nDr. Johnson`,
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
    },
    {
      id: 3,
      teacher: 'Dr. Emma Rodriguez',
      subject: 'Internship Recommendation',
      preview: 'Based on your skills in Python and data visualization, I recommend...',
      date: '2024-03-10',
      category: 'Career',
      status: 'pending-action',
      priority: 'high',
      fullMessage: `Dear Student,\n\nBased on your excellent performance in our Data Visualization course and demonstrated skills in Python, I'd like to recommend you for an internship opportunity at TechAnalytics Inc.\n\nThey're looking for students with exactly your skillset to work on their education data visualization tools. This would be a fantastic opportunity to apply what you've learned in a professional setting.\n\nThe position is 15-20 hours per week during the semester and pays $25/hour. I've attached the position description to this message.\n\nIf you're interested, I can put you in touch with their hiring manager directly. Please let me know by Friday if you'd like me to make the introduction.\n\nRegards,\nDr. Rodriguez`,
    },
  ];

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
    setAttachments([...attachments, ...files]);
  };

  const generateAiResponse = async () => {
    if (!selectedSuggestion) return;
    
    setIsGeneratingResponse(true);
    setAiResponse(''); // Clear previous response
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `You are an AI teaching assistant helping a student respond to this feedback from their professor:
      
      Professor: ${selectedSuggestion.teacher}
      Subject: ${selectedSuggestion.subject}
      Message: ${selectedSuggestion.fullMessage}

      Generate a professional, grateful response that:
      1. Thanks the professor for their feedback
      2. Addresses each of their key points
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
      setAiResponse("Error: Could not generate response. Please check your API key and try again.");
    } finally {
      setIsGeneratingResponse(false);
    }
  };

  const translateMessage = async () => {
    if (!selectedSuggestion) return;
    
    setIsGeneratingResponse(true);
    setAiResponse(''); // Clear previous response
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `Translate the following academic message to Spanish while maintaining the formal tone and academic style. Preserve any technical terms and keep the meaning accurate:

      Message to translate:
      "${selectedSuggestion.fullMessage}"`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      setAiResponse(`Spanish Translation:\n\n${text}`);
    } catch (error) {
      console.error("Translation error:", error);
      setAiResponse("Error: Could not translate message. Please check your API key and try again.");
    } finally {
      setIsGeneratingResponse(false);
    }
  };

  const summarizeFeedback = async () => {
    if (!selectedSuggestion) return;
    
    setIsGeneratingResponse(true);
    setAiResponse(''); // Clear previous response
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `Analyze this professor's feedback and extract the 3-5 most important actionable items for the student. Present them as clear bullet points with brief explanations:

      Feedback to summarize:
      "${selectedSuggestion.fullMessage}"

      Format your response as:
      - [Key point 1]: [Brief explanation]
      - [Key point 2]: [Brief explanation]
      ...`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      setAiResponse(`Key Action Items:\n\n${text}`);
    } catch (error) {
      console.error("Summarization error:", error);
      setAiResponse("Error: Could not summarize feedback. Please check your API key and try again.");
    } finally {
      setIsGeneratingResponse(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col md:flex-row">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Enhanced Sidebar */}
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
            onClick={() => navigate('/dashboard')}
          >
            <HomeIcon className="w-5 h-5" />
            <span>Dashboard</span>
            <span className="ml-auto text-xs bg-purple-500 text-white px-2 py-1 rounded-full">New</span>
          </button>
          
          {[
            { name: 'Inbox', icon: EnvelopeIcon, count: 3 },
            { name: 'Starred', icon: BookmarkIcon },
            { name: 'Archived', icon: ArchiveBoxIcon }
          ].map((item) => (
            <button
              key={item.name}
              className="w-full flex items-center gap-3 p-3 text-gray-300 hover:bg-gray-700/30 rounded-lg transition-all group"
            >
              <item.icon className="w-5 h-5 text-purple-400 group-hover:text-purple-300" />
              <span>{item.name}</span>
              {item.count && <span className="ml-auto text-xs bg-purple-500 text-white px-2 py-1 rounded-full">{item.count}</span>}
            </button>
          ))}
        </nav>

        <div className="mt-8 pt-8 border-t border-gray-700/50">
          <div className="p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/20">
            <div className="flex items-center gap-2 text-purple-300">
              <SparklesIcon className="w-5 h-5" />
              <span className="text-sm">AI Assistant</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">Get smart replies, translations, and summaries</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-x-hidden">
        {/* Enhanced Header */}
        <div className="p-4 md:p-6 border-b border-gray-700/50 flex items-center justify-between bg-gradient-to-r from-gray-800/70 to-gray-900/70 backdrop-blur-sm">
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              className="md:hidden p-2 hover:bg-gray-700/30 rounded-lg transition-all"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Bars3Icon className="w-6 h-6 text-gray-300" />
            </button>
            {selectedSuggestion ? (
              <button 
                onClick={() => setSelectedSuggestion(null)}
                className="p-2 hover:bg-gray-700/30 rounded-lg transition-all"
              >
                <ChevronLeftIcon className="w-6 h-6 text-gray-300" />
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
            <div className="relative flex-1 max-w-xs">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search suggestions..."
                className="pl-10 pr-4 py-2 bg-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 w-full transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="p-2 bg-gray-700/50 rounded-xl hover:bg-gray-700/70 transition-all relative">
              <BellIcon className="w-6 h-6 text-gray-300" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-400 rounded-full"></span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {!selectedSuggestion ? (
            <div className="grid grid-cols-1 gap-4">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="group p-4 md:p-6 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-purple-400/30 transition-all cursor-pointer shadow-lg hover:shadow-xl backdrop-blur-sm"
                  onClick={() => setSelectedSuggestion(suggestion)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${suggestion.priority === 'high' ? 'bg-red-400 animate-pulse' : suggestion.priority === 'medium' ? 'bg-amber-400' : 'bg-blue-400'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-white font-medium group-hover:text-purple-300 transition-colors truncate">
                          {suggestion.subject}
                        </h3>
                        <div className="flex gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${statusStyles[suggestion.status]}`}>
                            {suggestion.status.replace('-', ' ')}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${priorityStyles[suggestion.priority]}`}>
                            {suggestion.priority} priority
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{suggestion.preview}</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-400">
                          <UserCircleIcon className="w-5 h-5 text-purple-400" />
                          <span>{suggestion.teacher}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <ClockIcon className="w-5 h-5 text-blue-400" />
                          <span>{suggestion.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <DocumentTextIcon className="w-5 h-5 text-amber-400" />
                          <span>{suggestion.category}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 hover:bg-gray-700/50 rounded-lg">
                        <BookmarkIcon className="w-5 h-5 text-gray-400 hover:text-purple-400" />
                      </button>
                      <button className="p-1.5 hover:bg-gray-700/50 rounded-lg">
                        <ArchiveBoxIcon className="w-5 h-5 text-gray-400 hover:text-blue-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              {/* Message Card */}
              <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 shadow-2xl transform transition-all backdrop-blur-sm">
                {/* Message Header */}
                <div className="p-4 md:p-6 border-b border-gray-700/50 bg-gradient-to-r from-gray-800 to-gray-900/50 rounded-t-xl">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <h2 className="text-xl md:text-2xl font-semibold text-white">{selectedSuggestion.subject}</h2>
                    <div className="flex items-center gap-2">
                      <CheckCircleIcon className="w-6 h-6 text-green-400" />
                      <span className="text-sm text-gray-400">Verified Instructor</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <div className="flex items-center gap-2 bg-gray-700/50 px-3 py-1 rounded-full">
                      <UserCircleIcon className="w-4 h-4 text-purple-400" />
                      <span className="text-gray-300">{selectedSuggestion.teacher}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-700/50 px-3 py-1 rounded-full">
                      <ClockIcon className="w-4 h-4 text-blue-400" />
                      <span className="text-gray-300">{selectedSuggestion.date}</span>
                    </div>
                    <div className={`px-3 py-1 rounded-full ${statusStyles[selectedSuggestion.status]}`}>
                      {selectedSuggestion.status.replace('-', ' ')}
                    </div>
                    <div className={`px-3 py-1 rounded-full ${priorityStyles[selectedSuggestion.priority]}`}>
                      {selectedSuggestion.priority} priority
                    </div>
                  </div>
                </div>

                {/* Message Body */}
                <div className="p-4 md:p-6 prose prose-invert max-w-none bg-gray-800/30">
                  {selectedSuggestion.fullMessage.split('\n').map((para, i) => (
                    <p key={i} className="mb-4 text-gray-300">{para}</p>
                  ))}
                </div>

                {/* AI Assistant Section */}
                {aiResponse && (
                  <div className="p-4 md:p-6 border-t border-gray-700/50 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
                    <div className="flex items-center gap-2 mb-3">
                      <SparklesIcon className="w-5 h-5 text-purple-400" />
                      <h3 className="text-lg font-medium text-purple-300">AI Assistant</h3>
                    </div>
                    <div className="prose prose-invert max-w-none bg-gray-800/30 p-4 rounded-lg">
                      {aiResponse.split('\n').map((para, i) => (
                        <p key={i} className="mb-3 text-gray-300">{para}</p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Bar */}
                <div className="p-4 md:p-6 border-t border-gray-700/50 bg-gray-800/50 rounded-b-xl flex flex-wrap items-center gap-4">
                  <div className="flex flex-wrap gap-3">
                    <button 
                      onClick={generateAiResponse}
                      disabled={isGeneratingResponse}
                      className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-xl hover:bg-purple-500/30 flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                      <SparklesIcon className="w-5 h-5" />
                      <span>{isGeneratingResponse ? 'Generating...' : 'Generate Response'}</span>
                    </button>
                    <button 
                      onClick={translateMessage}
                      disabled={isGeneratingResponse}
                      className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-xl hover:bg-blue-500/30 flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                      <LanguageIcon className="w-5 h-5" />
                      <span>Translate</span>
                    </button>
                    <button 
                      onClick={summarizeFeedback}
                      disabled={isGeneratingResponse}
                      className="px-4 py-2 bg-amber-500/20 text-amber-300 rounded-xl hover:bg-amber-500/30 flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                      <LightBulbIcon className="w-5 h-5" />
                      <span>Summarize</span>
                    </button>
                  </div>
                  
                  <div className="ml-auto flex items-center gap-2">
                    <span className="text-sm text-gray-400">Was this helpful?</span>
                    <button className="px-3 py-1 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30">
                      Yes
                    </button>
                    <button className="px-3 py-1 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30">
                      No
                    </button>
                  </div>
                </div>
              </div>

              {/* Reply Section */}
              <div className="mt-6 bg-gray-800/50 rounded-xl border border-gray-700/50 p-4 md:p-6 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <ChatBubbleLeftEllipsisIcon className="w-5 h-5 text-purple-400" />
                  <span>Compose Reply</span>
                </h3>
                
                <textarea
                  className="w-full p-3 bg-gray-700/50 rounded-lg text-white placeholder-gray-400 mb-4 min-h-[150px]"
                  placeholder="Type your response here..."
                  value={messageDraft}
                  onChange={(e) => setMessageDraft(e.target.value)}
                />
                
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => fileInputRef.current.click()}
                      className="p-2 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-all"
                    >
                      <PaperClipIcon className="w-5 h-5 text-gray-400" />
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                      multiple
                    />
                    {attachments.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        {attachments.map((file, i) => (
                          <span key={i} className="flex items-center gap-1 bg-gray-700/50 px-2 py-1 rounded-lg">
                            <DocumentTextIcon className="w-4 h-4" />
                            <span className="truncate max-w-[100px]">{file.name}</span>
                            <button 
                              onClick={() => setAttachments(attachments.filter((_, index) => index !== i))}
                              className="text-red-400 hover:text-red-300"
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-3">
                    <button className="px-4 py-2 bg-gray-700/50 text-gray-300 rounded-xl hover:bg-gray-700/70 transition-all">
                      Save Draft
                    </button>
                    <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all">
                      Send Reply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Floating Action Button */}
        {!selectedSuggestion && (
          <button 
            className="fixed bottom-8 right-8 p-4 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full hover:from-purple-600 hover:to-blue-600 shadow-xl transition-all hover:scale-110 animate-bounce"
            onClick={() => setComposeOpen(true)}
          >
            <EnvelopeIcon className="w-6 h-6 text-white" />
          </button>
        )}

        {/* Compose Modal */}
        {composeOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setComposeOpen(false)}>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">To</label>
                    <input 
                      type="text" 
                      className="w-full p-3 bg-gray-700/50 rounded-lg text-white placeholder-gray-400"
                      placeholder="Recipient email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Subject</label>
                    <input 
                      type="text" 
                      className="w-full p-3 bg-gray-700/50 rounded-lg text-white placeholder-gray-400"
                      placeholder="Message subject"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Message</label>
                  <textarea 
                    className="w-full p-3 bg-gray-700/50 rounded-lg text-white placeholder-gray-400 min-h-[200px]"
                    placeholder="Type your message here..."
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <button 
                    onClick={() => fileInputRef.current.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-all"
                  >
                    <ArrowUpTrayIcon className="w-5 h-5 text-gray-400" />
                    <span>Attach Files</span>
                  </button>
                  
                  <div className="flex gap-3">
                    <button className="px-4 py-2 bg-gray-700/50 text-gray-300 rounded-xl hover:bg-gray-700/70 transition-all">
                      Save Draft
                    </button>
                    <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all">
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