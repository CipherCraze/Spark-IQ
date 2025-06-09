import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios'; // Import axios
import { useAuth } from '../../context/AuthContext';
import { saveChatMessage } from '../../firebase/chatHistoryOperations';
import {
  MicrophoneIcon,
  StopIcon,
  PaperAirplaneIcon,
  Cog6ToothIcon,
  PresentationChartLineIcon,
  ClipboardDocumentIcon,
  AcademicCapIcon,
  FolderIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  DocumentMagnifyingGlassIcon,
  SparklesIcon,
  GlobeAltIcon,
  EnvelopeIcon,
  VideoCameraIcon,
  MegaphoneIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import {
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  UserGroupIcon as SolidUserGroupIcon,
} from '@heroicons/react/24/solid';

// --- Gemini API Configuration ---
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL_GENERATE_CONTENT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

// Function to get a general chat response from Gemini
const getGeminiChatResponse = async (userInput, previousMessages = []) => {
  if (!GEMINI_API_KEY) {
    console.error("Gemini API Key is not configured. Ensure VITE_GEMINI_API_KEY is set in your .env file.");
    return "AI response generation is currently unavailable (API key missing or invalid). Please check configuration.";
  }

  const systemInstruction = `You are EduSpark AI, a friendly, helpful, and encouraging AI assistant designed specifically for teachers. 
  Your primary goal is to support educators in their tasks.
  Provide concise, informative, and supportive responses.
  When asked to generate content (like quiz questions, lesson plan ideas, explanations), clearly state what you can do and if you need more specific information (e.g., for a quiz: subject, topic, number of questions, difficulty, question type).
  Avoid generating raw JSON or overly complex structured data directly in the chat unless the user's prompt structure explicitly guides you to. Instead, offer to help create these things if they provide parameters.
  Keep responses conversational, positive, and focused on educational contexts.
  If a request is ambiguous, ask clarifying questions.
  If a request is outside your scope as an educational assistant or violates safety guidelines, politely decline or redirect.`;

  const contents = [];

  // Add recent messages for context, respecting Gemini's turn structure (user, model, user, model...)
  // Keep only the last few messages to avoid overly long context
  const recentHistory = previousMessages.slice(-6); // Max 3 user turns, 3 model turns
  
  let lastRole = null;
  recentHistory.forEach(msg => {
      const currentRole = msg.sender === 'user' ? "user" : "model";
      // Ensure alternating roles if possible, or combine consecutive messages from the same role
      // For simplicity here, we'll just add them if role changes, or if it's the first message
      if (contents.length === 0 || contents[contents.length -1].role !== currentRole) {
        contents.push({ role: currentRole, parts: [{ text: msg.text }] });
      } else {
        // Append to last part if same role (Gemini prefers distinct turns)
        // This is a simplification; robust history management is more complex
        // contents[contents.length - 1].parts[0].text += `\n${msg.text}`; 
        // Better to keep turns distinct:
         contents.push({ role: currentRole, parts: [{ text: msg.text }] });
      }
  });
    
  // Add the current user input, ensuring it's a 'user' turn
  if (contents.length > 0 && contents[contents.length - 1].role === "user") {
    // If last message was also user (e.g. rapid inputs), combine or handle as new turn
    // For simplicity, let's make it a new turn part, though Gemini might prefer distinct turns
     contents[contents.length - 1].parts.push({text: userInput}); // This might not be ideal for Gemini
     // A better approach for distinct turns:
     // contents.push({ role: "user", parts: [{ text: userInput }] }); // Ensure this is a new turn
  } else {
     contents.push({ role: "user", parts: [{ text: userInput }] });
  }
  // Filter out any empty user/model turns that might have been created
  const finalContents = contents.filter(c => c.parts.every(p => p.text && p.text.trim() !== ""));


  const body = {
    contents: finalContents,
    generationConfig: {
      temperature: 0.75, // Slightly more creative but still grounded
      topK: 1, // Default
      topP: 0.95, // Default, allows for some flexibility
      maxOutputTokens: 350, // Adjust as needed for chat verbosity
    },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
    ],
    systemInstruction: {
        parts: [{text: systemInstruction}]
    }
  };

  try {
    const response = await axios.post(GEMINI_API_URL_GENERATE_CONTENT, body, {
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.data.candidates && response.data.candidates.length > 0) {
      const candidate = response.data.candidates[0];
      if (candidate.finishReason === "SAFETY" || (candidate.safetyRatings && candidate.safetyRatings.some(r => r.blocked))) {
        console.warn("Gemini response blocked due to safety:", candidate.finishReason, candidate.safetyRatings);
        return "I'm unable to respond to that due to safety guidelines. Could you please rephrase or ask something else?";
      }
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        return candidate.content.parts[0].text.trim();
      }
    }
    
    if (response.data.promptFeedback && response.data.promptFeedback.blockReason) {
        console.warn("Gemini API prompt blocked:", response.data.promptFeedback.blockReason, response.data.promptFeedback.safetyRatings);
        return `My apologies, I couldn't process that request (${response.data.promptFeedback.blockReason}). Please try a different query.`;
    }
    
    console.error('Unexpected Gemini API response structure or empty candidates:', response.data);
    return "I encountered an issue getting a response. Please try again. (Empty or unexpected API data)";

  } catch (error) {
    console.error('Error calling Gemini API:', error.response ? error.response.data : error.message, error.config);
    if (error.response && error.response.data && error.response.data.error) {
      return `AI Error: ${error.response.data.error.message || 'Failed to get response from AI.'}`;
    }
    return 'Sorry, I am having trouble connecting to the AI service right now. Please check your network and API key.';
  }
};

// --- Educator Sidebar Menu Data (No changes) ---
const educatorSidebarMenu = [
  { title: 'Dashboard', Icon: PresentationChartLineIcon, link: '/educator-dashboard' },
  { title: 'Assignments', Icon: ClipboardDocumentIcon, link: '/assignment-management' },
  { title: 'Tests', Icon: ClipboardDocumentIcon, link: '/teacher-tests' },
  { title: 'Grades & Analytics', Icon: AcademicCapIcon, link: '/GradesAndAnalytics' },
  { title: 'Resources', Icon: FolderIcon, link: '/resource-management' },
  { title: 'Attendance', Icon: ChartBarIcon, link: '/attendance-tracking' },
  { title: 'Teacher Insights', Icon: DocumentMagnifyingGlassIcon, link: '/personalized-feedback-educators' },
  { title: 'Voice Chat', Icon: ChatBubbleLeftRightIcon, link: '/teacher-voice-chat', current: true },
  { title: 'AI Chatbot (Ask Sparky)', Icon: ChatBubbleLeftRightIcon, link: '/chatbot-education' },
  { title: 'AI Questions', Icon: SparklesIcon, link: '/ai-generated-questions' }, // You can use generateQuestionsWithGemini here
  { title: 'Social / Chat', Icon: SolidUserGroupIcon, link: '/chat-functionality' },
  { title: 'Educational News', Icon: GlobeAltIcon, link: '/educational-news' },
  { title: 'Student Suggestions', Icon: EnvelopeIcon, link: '/suggestions-to-students' },
  { title: 'Meetings & Conferences', Icon: VideoCameraIcon, link: '/meeting-host' },
  { title: 'Announcements', Icon: MegaphoneIcon, link: '/announcements' },
  { title: 'Upgrade to Pro', Icon: SparklesIcon, link: '/pricing', special: true },
];


// --- TeacherVoiceChat Component ---
const TeacherVoiceChat = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { currentUser } = useAuth();
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const utteranceRef = useRef(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Speech Recognition useEffect (no changes to its core logic)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event) => {
          let interimTranscript = '';
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }
          setTranscript(finalTranscript + interimTranscript);
        };

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          let errorMsg = 'An unknown speech recognition error occurred.';
          if (event.error === 'no-speech') { errorMsg = 'No speech detected. Please try again.';}
          else if (event.error === 'audio-capture') { errorMsg = 'Audio capture error. Check microphone permissions/settings.';}
          else if (event.error === 'not-allowed') { errorMsg = 'Microphone access denied. Please allow it in browser settings.';}
          setError(errorMsg);
          setIsListening(false);
        };
      } else {
        setError('Speech recognition is not supported in your browser.');
      }
    }
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
      }
      if (utteranceRef.current && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

  useEffect(scrollToBottom, [messages]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported or has encountered an error.');
      return;
    }
    setError('');
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      if (transcript.trim()) {
        handleSendMessage(transcript);
      }
    } else {
      setTranscript('');
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error("Error starting recognition:", e);
        setError("Could not start voice recognition. Ensure microphone is enabled and permissions are granted.");
        setIsListening(false);
      }
    }
  };

  const speakText = (text) => {
    if (!('speechSynthesis' in window)) {
      alert("Your browser doesn't support text-to-speech.");
      return;
    }
    if (isSpeaking) window.speechSynthesis.cancel();
    utteranceRef.current = new SpeechSynthesisUtterance(text);
    utteranceRef.current.onstart = () => setIsSpeaking(true);
    utteranceRef.current.onend = () => setIsSpeaking(false);
    utteranceRef.current.onerror = (event) => {
      console.error('SpeechSynthesis Error', event);
      setIsSpeaking(false);
      setError('Error occurred during text-to-speech.');
    };
    window.speechSynthesis.speak(utteranceRef.current);
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis && isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleSendMessage = async (textToSubmit) => {
    if (!textToSubmit.trim()) return;
    setError('');
    if (!currentUser) {
      setError('You must be logged in to send messages.');
      return; // Removed setIsProcessing(false) as it's set in finally
    }

    const userMessage = {
      id: `teacher-${Date.now()}`,
      text: textToSubmit,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };
    
    // Update messages state immediately with user message
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setTranscript('');
    setIsProcessing(true);

    try {
      const teacherMessageForDb = {
        text: userMessage.text,
        sender: 'user',
        timestamp: userMessage.timestamp,
        pinned: false
      };
      await saveChatMessage(currentUser.uid, teacherMessageForDb, true);

      // Get AI response from Gemini, passing previous messages for context
      const aiTextResponse = await getGeminiChatResponse(userMessage.text, updatedMessages);
      
      const aiResponseMessage = {
        id: `ai-teacher-${Date.now()}`,
        text: aiTextResponse,
        sender: 'assistant',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiResponseMessage]); // Add AI response to messages
      speakText(aiTextResponse);

      const aiMessageForDb = {
        text: aiResponseMessage.text,
        sender: 'bot', // Consistent with your DB schema
        timestamp: aiResponseMessage.timestamp,
        pinned: false
      };
      await saveChatMessage(currentUser.uid, aiMessageForDb, true);

    } catch (e) {
      console.error('Error in handleSendMessage or AI processing:', e);
      const errorMessage = `An error occurred: ${e.message || 'Could not process the message.'}`;
      setError(errorMessage);
      setMessages(prev => [...prev, {
        id: `error-teacher-${Date.now()}`,
        text: errorMessage,
        sender: 'assistant',
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 md:w-72 bg-slate-900/80 backdrop-blur-lg p-5 flex flex-col border-r border-slate-700/50 shadow-2xl
                   transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:shadow-none
                   ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex justify-between items-center md:justify-center mb-6 md:mb-8">
            <a href="/" className="inline-block group text-center">
                <div className="bg-gradient-to-tr from-emerald-500 via-green-500 to-teal-400 p-3 rounded-lg md:p-3.5 md:rounded-xl inline-block shadow-lg group-hover:scale-105 transform transition-transform duration-200">
                <SparklesIcon className="w-7 h-7 md:w-9 md:h-9 text-white" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-50 mt-3 md:mt-4 tracking-tight group-hover:text-emerald-400 transition-colors duration-200">EduSpark AI</h2>
                <p className="text-xs text-slate-400">Teacher's Toolkit</p>
            </a>
            <button
                onClick={() => setIsSidebarOpen(false)}
                className="md:hidden p-2 text-slate-400 hover:text-slate-200"
                aria-label="Close sidebar"
            >
                <XMarkIcon className="w-6 h-6" />
            </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto pr-2 -mr-2 custom-scrollbar">
          {educatorSidebarMenu.filter(item => !item.special).map((item) => (
            <a
              key={item.title}
              href={item.link}
              onClick={() => {
                // Implement actual navigation or close sidebar
                // For now, just close sidebar on mobile
                setIsSidebarOpen(false);
              }}
              className={`group flex items-center px-3 py-2.5 md:px-4 md:py-3 rounded-lg text-sm font-medium transition-all duration-150 ease-in-out
                ${item.current ? 'bg-emerald-600 text-white shadow-md hover:bg-emerald-500' : 'text-slate-300 hover:bg-slate-700/60 hover:text-slate-100'}`}
            >
              <item.Icon className={`w-5 h-5 mr-3 flex-shrink-0 ${item.current ? 'text-white' : 'text-slate-400 group-hover:text-emerald-300'}`} />
              {item.title}
            </a>
          ))}
        </nav>

        <div className="mt-auto pt-4 md:pt-5 space-y-3 md:space-y-4">
           {educatorSidebarMenu.filter(item => item.special).map((item) => (
             <a
              key={item.title}
              href={item.link}
              onClick={() => setIsSidebarOpen(false)}
              className="group flex items-center px-3 py-3 md:px-4 md:py-3.5 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out shadow-lg hover:shadow-xl bg-gradient-to-r from-purple-600 via-indigo-500 to-pink-500 text-white hover:from-purple-500 hover:via-indigo-400 hover:to-pink-400 transform hover:scale-[1.02]"
            >
              <item.Icon className="w-5 h-5 mr-3 text-purple-200 group-hover:text-white" />
              {item.title}
               <span className="ml-auto text-xs bg-yellow-300 text-yellow-900 px-2 py-0.5 rounded-full font-semibold shadow-sm">PRO</span>
            </a>
          ))}
           
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 overflow-hidden transition-all duration-300 ease-in-out`}>
        <header className="bg-slate-800/70 backdrop-blur-lg p-3 md:p-4 border-b border-slate-700 shadow-lg flex justify-between items-center sticky top-0 z-10 flex-shrink-0">
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="mr-2 p-2 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-700 md:hidden"
              aria-label="Open sidebar"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-lg md:text-xl font-semibold text-emerald-400">Educator Voice Command</h1>
              <p className="text-xs md:text-sm text-slate-400">AI Assistant by EduSpark</p>
            </div>
          </div>
          <button className="p-2 rounded-full hover:bg-slate-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400">
            <Cog6ToothIcon className="w-5 h-5 md:w-6 md:h-6 text-slate-400"/>
          </button>
        </header>

        {error && (
          <div className="bg-red-600/30 border-l-4 border-red-500 text-red-200 p-3 mx-2 md:mx-4 mt-2 md:mt-3 rounded-md text-sm shadow-md flex-shrink-0" role="alert">
            <p><span className="font-bold">Attention:</span> {error}</p>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4 md:space-y-5 scroll-smooth">
          {messages.map((message) => (
            <div key={message.id} className={`flex items-end ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {message.sender === 'assistant' && (
                   <img src="/sparky-avatar-teacher.png" alt="AI" className="w-8 h-8 md:w-9 md:h-9 rounded-full mr-2 md:mr-2.5 mb-1 border-2 border-emerald-500/50 self-start shadow-sm flex-shrink-0" onError={(e) => {e.currentTarget.src='/sparky-avatar.png'; e.currentTarget.alt='AI Default';}}/>
              )}
              <div className={`max-w-[80%] md:max-w-[70%] rounded-xl p-3 md:p-3.5 shadow-lg relative ${ message.sender === 'user' ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.text}</p>
                <span className={`text-xs opacity-70 mt-1.5 md:mt-2 block ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
               {message.sender === 'user' && (
                   <img src={currentUser?.photoURL || "/default-teacher-avatar.png"} alt="Teacher" className="w-8 h-8 md:w-9 md:h-9 rounded-full ml-2 md:ml-2.5 mb-1 border-2 border-slate-500/50 self-start shadow-sm flex-shrink-0" onError={(e) => {e.currentTarget.src='/default-user.png'; e.currentTarget.alt='User Default';}}/>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </main>

        <footer className="bg-slate-800/70 backdrop-blur-lg p-2.5 md:p-4 border-t border-slate-700 shadow-up sticky bottom-0 z-10 flex-shrink-0">
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={toggleListening}
              title={isListening ? "Stop voice input" : "Start voice input"}
              className={`p-3 md:p-3.5 rounded-full transition-all duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 flex items-center justify-center ${isListening ? 'bg-red-500 hover:bg-red-600 focus-visible:ring-red-400 animate-pulse_bg_red' : 'bg-emerald-500 hover:bg-emerald-600 focus-visible:ring-emerald-400'} text-white shadow-lg`}
              disabled={isProcessing}
            >
              {isListening ? <StopIcon className="w-5 h-5 md:w-6 md:h-6" /> : <MicrophoneIcon className="w-5 h-5 md:w-6 md:h-6" />}
            </button>

            <div className="flex-1 bg-slate-700/80 rounded-lg p-3 md:p-3.5 min-h-[48px] md:min-h-[54px] text-slate-300 italic text-sm flex items-center border border-slate-600/50 shadow-inner">
              {isListening && !transcript.trim() && <span className="animate-pulse">Listening...</span>}
              {transcript || (!isListening && !isProcessing ? "Tap mic or type..." : '')}
              {isProcessing && <span className="animate-pulse">EduSpark is thinking...</span>}
            </div>
            
            {isSpeaking ? (
               <button onClick={stopSpeaking} title="Stop AI speech" className="p-3 md:p-3.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 shadow-lg">
                  <SpeakerXMarkIcon className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            ) : (
               <button
                  onClick={() => { const lastAiMessage = messages.filter(m => m.sender === 'assistant').pop(); if (lastAiMessage) speakText(lastAiMessage.text); }}
                  title="Replay last AI response"
                  disabled={!messages.some(m => m.sender === 'assistant') || isProcessing}
                  className="p-3 md:p-3.5 rounded-full bg-sky-500 hover:bg-sky-600 text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 shadow-lg disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed"
              >
                  <SpeakerWaveIcon className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            )}

            <button
              onClick={() => handleSendMessage(transcript)}
              disabled={!transcript.trim() || isProcessing || isListening}
              title="Send instruction"
              className={`p-3 md:p-3.5 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 ${ transcript.trim() && !isProcessing && !isListening ? 'bg-green-500 hover:bg-green-600 focus-visible:ring-green-400' : 'bg-slate-600 text-slate-400 cursor-not-allowed' } text-white shadow-lg`}
            >
              <PaperAirplaneIcon className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        </footer>
      </div>

      <style jsx global>{`
        .scroll-smooth { scroll-behavior: smooth; }
        .shadow-up { box-shadow: 0 -6px 10px -3px rgba(0, 0, 0, 0.1), 0 -4px 6px -2px rgba(0, 0, 0, 0.07); }
        .animate-pulse_bg_red { animation: pulse_bg_red 1.5s infinite; }
        @keyframes pulse_bg_red {
          0%, 100% { background-color: #ef4444; } /* red-500 */
          50% { background-color: #dc2626; } /* red-600 */
        }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: rgba(15, 23, 42, 0.5); }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #475569; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #6b7280; }
      `}</style>
    </div>
  );
};

export default TeacherVoiceChat;

// Note: The generateQuestionsWithGemini function you provided is not directly used in this chat interface
// but can be adapted for a dedicated "AI Questions" page or if the chat logic
// evolves to handle multi-turn structured data collection for such specific tasks.
// For example, if the user says "generate quiz", Gemini might ask for parameters,
// and then your app could collect those and call generateQuestionsWithGemini.