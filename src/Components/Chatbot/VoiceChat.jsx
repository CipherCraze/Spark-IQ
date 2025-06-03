import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext'; // Using singular 'context'
import { saveChatMessage } from '../../firebase/chatHistoryOperations';
import {
  MicrophoneIcon,
  StopIcon,
  PaperAirplaneIcon,
  Cog6ToothIcon,
  SunIcon, // For theme toggle example
  MoonIcon, // For theme toggle example
  Bars3Icon,
  XMarkIcon,
  // Icons for Student Sidebar
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
} from '@heroicons/react/24/outline';
import { SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/solid';

// --- Gemini API Configuration ---
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL_GENERATE_CONTENT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

// Function to get a chat response from Gemini (Student Persona)
const getGeminiChatResponseForStudent = async (userInput, previousMessages = []) => {
  if (!GEMINI_API_KEY) {
    console.error("Gemini API Key is not configured. Ensure VITE_GEMINI_API_KEY is set.");
    return "AI response generation is currently unavailable (API key missing). Please check configuration.";
  }

  const systemInstruction = `You are Sparky, a friendly, encouraging, and helpful AI study companion for students.
  Your main goal is to assist students with their learning, help them understand concepts, prepare for tests, and work through assignments.
  Always be patient and positive. Break down complex topics into simpler, easy-to-understand parts.
  If a student asks for direct answers to homework or tests, gently guide them by explaining the underlying concepts, asking probing questions to help them think, or suggesting steps they can take to find the answer themselves, rather than providing the answer directly.
  Offer to explain topics, provide examples, help with brainstorming, or suggest practice questions if appropriate.
  If a request is ambiguous, ask clarifying questions to better understand what the student needs.
  Keep your responses conversational and tailored to a student audience.
  If a request is outside your scope as an educational assistant or violates safety guidelines, politely decline or redirect.`;

  const contents = [];
  const recentHistory = previousMessages.slice(-6); // Keep recent history for context

  recentHistory.forEach(msg => {
    const role = msg.sender === 'user' ? "user" : "model";
    if (contents.length === 0 || contents[contents.length - 1].role !== role) {
      contents.push({ role, parts: [{ text: msg.text }] });
    } else {
      // If last message had same role, create a new turn (Gemini prefers distinct turns)
      contents.push({ role, parts: [{ text: msg.text }] });
    }
  });

  // Add current user input
  if (contents.length > 0 && contents[contents.length - 1].role === "user") {
    contents.push({ role: "user", parts: [{ text: userInput }] });
  } else {
    contents.push({ role: "user", parts: [{ text: userInput }] });
  }
  
  const finalContents = contents.filter(c => c.parts.every(p => p.text && p.text.trim() !== ""));

  const body = {
    contents: finalContents,
    generationConfig: {
      temperature: 0.7,
      topK: 1,
      topP: 0.95,
      maxOutputTokens: 300,
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
        return "I'm unable to respond to that due to safety guidelines. Let's try a different topic!";
      }
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        return candidate.content.parts[0].text.trim();
      }
    }
     if (response.data.promptFeedback && response.data.promptFeedback.blockReason) {
        return `My apologies, I couldn't process that request due to: ${response.data.promptFeedback.blockReason}. Please try a different question.`;
    }
    return "I had a little hiccup processing that. Could you try asking again?";
  } catch (error) {
    console.error('Error calling Gemini API (Student):', error.response ? error.response.data : error.message);
    if (error.response && error.response.data && error.response.data.error) {
      return `Oh no! Sparky's circuits are a bit tangled: ${error.response.data.error.message || 'Failed to get response.'}`;
    }
    return 'Hmm, I seem to be having trouble connecting. Please check your internet and try again soon!';
  }
};

// --- Student Sidebar Menu Data ---
const studentMenu = [
    { title: 'Dashboard', Icon: HomeIcon, link: '/dashboard', description: "Overview of your progress." },
    { title: 'My Resources', Icon: FolderIcon, link: '/resource-utilization', description: "Access course materials." },
    { title: 'Tests', Icon: ClipboardDocumentIcon, link: '/student-tests', description: "Take and view your test results." },
    { title: 'Attendance', Icon: ChartBarIcon, link: '/attendance-monitoring', description: "Track your attendance." },
    { title: 'Assignments', Icon: DocumentTextIcon, link: '/assignment-submission', description: "View & submit assignments." },
    { title: 'Grades & Feedback', Icon: PresentationChartLineIcon, link: '/GradesAndFeedback', description: "Check your grades." },
    { title: 'Voice Chat', Icon: ChatBubbleLeftRightIcon, link: '/voice-chat', description: "Chat with Sparky.", current: true }, // Set current to true
    { title: 'Ask Sparky (Text)', Icon: QuestionMarkCircleIcon, link: '/chatbot-access', description: "Your AI study assistant." },
    { title: 'AI Practice Questions', Icon: LightBulbIcon, link: '/ai-generated-questions', description: "Practice with AI questions." },
    { title: 'Educational News', Icon: NewspaperIcon, link: '/educational-news', description: "Latest in education." },
    { title: 'Smart Review', Icon: WrenchScrewdriverIcon, link: '/smart-review', description: "Enhance your writing." },
    { title: 'Virtual Meetings', Icon: VideoCameraIcon, link: '/meeting-participation', description: "Join online classes." },
    { title: 'Connect with Peers', Icon: ChatBubbleLeftRightIcon, link: '/chat-functionality', description: "Connect with peers." }, // Renamed for clarity
    { title: 'My Inbox', Icon: EnvelopeIcon, link: '/inbox-for-suggestions', description: "Messages & suggestions." },
    { title: 'Upgrade to Pro', Icon: SparklesIcon, link: '/pricing', special: true, description: "Unlock premium features." },
];


const VoiceChat = () => {
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';
        recognitionRef.current.onresult = (event) => {
          let interim = '', final = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            event.results[i].isFinal ? final += event.results[i][0].transcript : interim += event.results[i][0].transcript;
          }
          setTranscript(final + interim);
        };
        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          let msg = 'An unknown speech recognition error occurred.';
          if (event.error === 'no-speech') msg = 'No speech detected. Please try again.';
          else if (event.error === 'audio-capture') msg = 'Audio capture error. Check microphone permissions.';
          else if (event.error === 'not-allowed') msg = 'Microphone access denied. Please allow it in browser settings.';
          setError(msg); setIsListening(false);
        };
      } else { setError('Speech recognition is not supported in your browser.'); }
    }
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const toggleListening = () => {
    if (!recognitionRef.current) { alert('Speech recognition not supported.'); return; }
    setError('');
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      if (transcript.trim()) handleSendMessage(transcript);
    } else {
      setTranscript('');
      try { recognitionRef.current.start(); setIsListening(true); }
      catch (e) { console.error("Error starting recognition:", e); setError("Could not start voice recognition."); setIsListening(false); }
    }
  };

  const speakText = (text) => {
    if (!('speechSynthesis' in window)) { alert("Text-to-speech not supported."); return; }
    if (isSpeaking) window.speechSynthesis.cancel();
    utteranceRef.current = new SpeechSynthesisUtterance(text);
    utteranceRef.current.onstart = () => setIsSpeaking(true);
    utteranceRef.current.onend = () => setIsSpeaking(false);
    utteranceRef.current.onerror = (e) => { console.error('TTS Error', e); setIsSpeaking(false); setError('Error during text-to-speech.'); };
    window.speechSynthesis.speak(utteranceRef.current);
  };

  const stopSpeaking = () => { if (window.speechSynthesis && isSpeaking) { window.speechSynthesis.cancel(); setIsSpeaking(false); } };

  const handleSendMessage = async (textToSubmit) => {
    if (!textToSubmit.trim()) return;
    setError('');
    if (!currentUser) { 
      setError('You must be logged in.'); 
      return; 
    }

    const userMessage = { 
      id: `user-${Date.now()}`, 
      text: textToSubmit, 
      sender: 'user', // This is for UI rendering
      timestamp: new Date().toISOString() 
    };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setTranscript('');
    setIsProcessing(true);

    try {
      // Prepare user message for DB
      const userMessageForDb = {
        text: userMessage.text,
        sender: 'user', // Explicitly 'user' for DB schema
        timestamp: userMessage.timestamp,
        // Add other fields if your schema requires, e.g., pinned: false
      };
      await saveChatMessage(currentUser.uid, userMessageForDb, false); // isEducator = false

      const aiTextResponse = await getGeminiChatResponseForStudent(userMessage.text, updatedMessages);
      
      const aiResponseMessage = { 
        id: `ai-${Date.now()}`, 
        text: aiTextResponse, 
        sender: 'assistant', // This is for UI rendering
        timestamp: new Date().toISOString() 
      };
      setMessages(prev => [...prev, aiResponseMessage]);
      speakText(aiTextResponse);

      // Prepare AI message for DB
      const aiMessageForDb = {
        text: aiResponseMessage.text,
        sender: 'bot', // Explicitly 'bot' for DB schema
        timestamp: aiResponseMessage.timestamp,
        // Add other fields if your schema requires, e.g., pinned: false
      };
      await saveChatMessage(currentUser.uid, aiMessageForDb, false);

    } catch (e) {
      console.error('Error in handleSendMessage:', e);
      const errorMsg = `Sparky had an oopsie: ${e.message || 'Could not process message.'}`;
      setError(errorMsg);
      setMessages(prev => [...prev, { id: `error-${Date.now()}`, text: errorMsg, sender: 'assistant', timestamp: new Date().toISOString() }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden`}>
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/70 z-20 md:hidden" onClick={() => setIsSidebarOpen(false)} aria-hidden="true" />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 md:w-72 bg-slate-900/80 backdrop-blur-xl p-4 md:p-5 flex flex-col border-r border-slate-700/50 shadow-2xl
                   transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:shadow-none
                   ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex justify-between items-center md:justify-center mb-6 md:mb-8">
            <a href="/dashboard" className="inline-block group text-center">
                <div className="bg-gradient-to-tr from-sky-500 via-cyan-500 to-teal-400 p-3 rounded-lg md:p-3.5 md:rounded-xl inline-block shadow-lg group-hover:scale-105 transform transition-transform duration-200">
                <SparklesIcon className="w-7 h-7 md:w-9 md:h-9 text-white" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-50 mt-3 md:mt-4 tracking-tight group-hover:text-sky-300 transition-colors duration-200">Sparky</h2>
                <p className="text-xs text-slate-400">Student Portal</p>
            </a>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 text-slate-400 hover:text-slate-200" aria-label="Close sidebar">
                <XMarkIcon className="w-6 h-6" />
            </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto pr-2 -mr-2 custom-scrollbar-student">
          {studentMenu.filter(item => !item.special).map((item) => (
            <a key={item.title} href={item.link} onClick={() => setIsSidebarOpen(false)}
              className={`group flex items-center px-3 py-2.5 md:px-4 md:py-3 rounded-lg text-sm font-medium transition-all duration-150 ease-in-out
                ${item.current ? 'bg-sky-600 text-white shadow-md hover:bg-sky-500' : 'text-slate-300 hover:bg-slate-700/70 hover:text-slate-100'}`}
              title={item.description}
            >
              <item.Icon className={`w-5 h-5 mr-3 flex-shrink-0 ${item.current ? 'text-white' : 'text-slate-400 group-hover:text-sky-300'}`} />
              {item.title}
            </a>
          ))}
        </nav>
        <div className="mt-auto pt-4 md:pt-5 space-y-3 md:space-y-4">
           {studentMenu.filter(item => item.special).map((item) => (
             <a key={item.title} href={item.link} onClick={() => setIsSidebarOpen(false)}
              className="group flex items-center px-3 py-3 md:px-4 md:py-3.5 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out shadow-lg hover:shadow-xl bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500 text-white hover:from-pink-400 hover:via-rose-400 hover:to-fuchsia-400 transform hover:scale-[1.02]"
              title={item.description}
            >
              <item.Icon className="w-5 h-5 mr-3 text-pink-200 group-hover:text-white" />
              {item.title}
               <span className="ml-auto text-xs bg-yellow-300 text-yellow-800 px-2 py-0.5 rounded-full font-semibold shadow-sm">PRO</span>
            </a>
          ))}
          
        </div>
      </aside>
      <div className={`flex-1 flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 overflow-hidden`}>
        <header className="bg-slate-800/60 backdrop-blur-lg p-3 md:p-4 border-b border-slate-700 shadow-lg flex justify-between items-center sticky top-0 z-10 flex-shrink-0">
          <div className="flex items-center">
            <button onClick={() => setIsSidebarOpen(true)} className="mr-2 p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-700/70 md:hidden" aria-label="Open sidebar">
              <Bars3Icon className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-lg md:text-xl font-semibold text-sky-400">Voice Chat with Sparky</h1>
              <p className="text-xs md:text-sm text-slate-400">Your AI Study Companion</p>
            </div>
          </div>
          <button className="p-2 rounded-full hover:bg-slate-700/70 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400">
            <Cog6ToothIcon className="w-5 h-5 md:w-6 md:h-6 text-slate-400"/>
          </button>
        </header>
        {error && (
          <div className="bg-red-600/40 border-l-4 border-red-500 text-red-100 p-3 mx-2 md:mx-4 my-2 md:my-3 rounded-md text-sm shadow-md flex-shrink-0" role="alert">
            <p><span className="font-bold">Oops!</span> {error}</p>
          </div>
        )}
        <main className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4 md:space-y-5 scroll-smooth">
          {messages.map((message) => (
            <div key={message.id} className={`flex items-end ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {message.sender === 'assistant' && (
                   <img src="/sparky-avatar.png" alt="Sparky" className="w-8 h-8 md:w-9 md:h-9 rounded-full mr-2 md:mr-2.5 mb-1 border-2 border-sky-500/60 self-start shadow-sm flex-shrink-0" onError={(e) => {e.currentTarget.src='/default-ai-avatar.png'; e.currentTarget.alt='AI Default';}}/>
              )}
              <div className={`max-w-[80%] md:max-w-[70%] rounded-xl p-3 md:p-3.5 shadow-lg relative ${ message.sender === 'user' ? 'bg-sky-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-100 rounded-bl-none'}`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.text}</p>
                <span className={`text-xs opacity-70 mt-1.5 md:mt-2 block ${message.sender === 'user' ? 'text-right text-sky-200' : 'text-left text-slate-400'}`}>
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
               {message.sender === 'user' && (
                   <img src={currentUser?.photoURL || "/default-user.png"} alt="Student" className="w-8 h-8 md:w-9 md:h-9 rounded-full ml-2 md:ml-2.5 mb-1 border-2 border-slate-500/60 self-start shadow-sm flex-shrink-0" onError={(e) => {e.currentTarget.src='/default-user.png'; e.currentTarget.alt='User Default';}}/>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </main>
        <footer className="bg-slate-800/70 backdrop-blur-lg p-2.5 md:p-4 border-t border-slate-700 shadow-up sticky bottom-0 z-10 flex-shrink-0">
          <div className="flex items-center gap-2 md:gap-3">
            <button onClick={toggleListening} title={isListening ? "Stop listening" : "Start listening"}
              className={`p-3 md:p-3.5 rounded-full transition-all duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 flex items-center justify-center ${isListening ? 'bg-red-500 hover:bg-red-600 focus-visible:ring-red-400 animate-pulse_bg_red' : 'bg-sky-500 hover:bg-sky-600 focus-visible:ring-sky-400'} text-white shadow-lg`}
              disabled={isProcessing}>
              {isListening ? <StopIcon className="w-5 h-5 md:w-6 md:h-6" /> : <MicrophoneIcon className="w-5 h-5 md:w-6 md:h-6" />}
            </button>
            <div className="flex-1 bg-slate-700/80 rounded-lg p-3 md:p-3.5 min-h-[48px] md:min-h-[54px] text-slate-300 italic text-sm flex items-center border border-slate-600/50 shadow-inner">
              {isListening && !transcript.trim() && <span className="animate-pulse">Listening...</span>}
              {transcript || (!isListening && !isProcessing ? "Tap mic or type..." : '')}
              {isProcessing && <span className="animate-pulse">Sparky is thinking...</span>}
            </div>
            {isSpeaking ? (
               <button onClick={stopSpeaking} title="Stop Sparky's speech" className="p-3 md:p-3.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 shadow-lg">
                  <SpeakerXMarkIcon className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            ) : (
               <button onClick={() => { const lastAiMessage = messages.filter(m => m.sender === 'assistant').pop(); if (lastAiMessage) speakText(lastAiMessage.text); }}
                  title="Replay Sparky's last response" disabled={!messages.some(m => m.sender === 'assistant') || isProcessing}
                  className="p-3 md:p-3.5 rounded-full bg-teal-500 hover:bg-teal-600 text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 shadow-lg disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed">
                  <SpeakerWaveIcon className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            )}
            <button onClick={() => handleSendMessage(transcript)} disabled={!transcript.trim() || isProcessing || isListening}
              title="Send message"
              className={`p-3 md:p-3.5 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 ${ transcript.trim() && !isProcessing && !isListening ? 'bg-green-500 hover:bg-green-600 focus-visible:ring-green-400' : 'bg-slate-600 text-slate-400 cursor-not-allowed' } text-white shadow-lg`}>
              <PaperAirplaneIcon className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        </footer>
      </div>
      <style jsx global>{`
        .scroll-smooth { scroll-behavior: smooth; }
        .shadow-up { box-shadow: 0 -6px 10px -3px rgba(0, 0, 0, 0.1), 0 -4px 6px -2px rgba(0, 0, 0, 0.07); }
        .animate-pulse_bg_red { animation: pulse_bg_red 1.5s infinite; }
        @keyframes pulse_bg_red { 0%, 100% { background-color: #ef4444; } 50% { background-color: #dc2626; } }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: rgba(15, 23, 42, 0.6); }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; border: 2px solid rgba(15, 23, 42, 0.6); }
        ::-webkit-scrollbar-thumb:hover { background: #475569; }
        .custom-scrollbar-student::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar-student::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar-student::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 3px; }
        .custom-scrollbar-student::-webkit-scrollbar-thumb:hover { background: #6b7280; }
      `}</style>
    </div>
  );
};

export default VoiceChat;