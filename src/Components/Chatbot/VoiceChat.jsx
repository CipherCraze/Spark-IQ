
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { saveChatMessage } from '../../firebase/chatHistoryOperations';
import { Link, useLocation } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import { motion, AnimatePresence } from 'framer-motion';
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
  MicrophoneIcon,
  StopIcon,
  PaperAirplaneIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
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
  const recentHistory = previousMessages.slice(-6);

  recentHistory.forEach(msg => {
    const role = msg.sender === 'user' ? "user" : "model";
    if (contents.length === 0 || contents[contents.length - 1].role !== role) {
      contents.push({ role, parts: [{ text: msg.text }] });
    } else {
      contents.push({ role, parts: [{ text: msg.text }] });
    }
  });

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
      parts: [{ text: systemInstruction }]
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
  { title: 'AI Feedback', Icon: DocumentMagnifyingGlassIcon, link: '/personalized-feedback-students', description: "Get AI-powered insights on your progress." },
  { title: 'Voice Chat', Icon: ChatBubbleLeftRightIcon, link: '/voice-chat', description: "Discuss with peers." },
  { title: 'Ask Sparky', Icon: QuestionMarkCircleIcon, link: '/chatbot-access', description: "Your AI study assistant." },
  { title: 'AI Questions', Icon: LightBulbIcon, link: '/ai-generated-questions', description: "Practice with AI questions." },
  { title: 'Educational News', Icon: NewspaperIcon, link: '/educational-news', description: "Latest in education." },
  { title: 'Smart Review', Icon: WrenchScrewdriverIcon, link: '/smart-review', description: "Enhance your writing." },
  { title: 'Virtual Meetings', Icon: VideoCameraIcon, link: '/meeting-participation', description: "Join online classes." },
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const isDesktop = useMediaQuery({ minWidth: 768 });
  const location = useLocation();

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
          setError(msg);
          setIsListening(false);
        };
      } else {
        setError('Speech recognition is not supported in your browser.');
      }
    }
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isDesktop) {
      setIsSidebarOpen(true);
    } else {
      setIsSidebarOpen(false);
    }
  }, [isDesktop]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition not supported.');
      return;
    }
    setError('');
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      if (transcript.trim()) handleSendMessage(transcript);
    } else {
      setTranscript('');
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error("Error starting recognition:", e);
        setError("Could not start voice recognition.");
        setIsListening(false);
      }
    }
  };

  const speakText = (text) => {
    if (!('speechSynthesis' in window)) {
      alert("Text-to-speech not supported.");
      return;
    }
    if (isSpeaking) window.speechSynthesis.cancel();
    utteranceRef.current = new SpeechSynthesisUtterance(text);
    utteranceRef.current.onstart = () => setIsSpeaking(true);
    utteranceRef.current.onend = () => setIsSpeaking(false);
    utteranceRef.current.onerror = (e) => {
      console.error('TTS Error', e);
      setIsSpeaking(false);
      setError('Error during text-to-speech.');
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
      setError('You must be logged in.');
      return;
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      text: textToSubmit,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setTranscript('');
    setIsProcessing(true);

    try {
      const userMessageForDb = {
        text: userMessage.text,
        sender: 'user',
        timestamp: userMessage.timestamp,
      };
      await saveChatMessage(currentUser.uid, userMessageForDb, false);

      const aiTextResponse = await getGeminiChatResponseForStudent(userMessage.text, updatedMessages);
      
      const aiResponseMessage = {
        id: `ai-${Date.now()}`,
        text: aiTextResponse,
        sender: 'assistant',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiResponseMessage]);
      speakText(aiTextResponse);

      const aiMessageForDb = {
        text: aiResponseMessage.text,
        sender: 'bot',
        timestamp: aiResponseMessage.timestamp,
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
    <div className="min-h-screen bg-gray-900 flex text-gray-200">
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            key="sidebar"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30, duration: 0.3 }}
            className="fixed top-0 left-0 h-full w-64 bg-gray-800/80 backdrop-blur-xl border-r border-gray-700/60 shadow-2xl z-50 flex flex-col md:h-screen md:z-40 md:fixed md:translate-x-0"
          >
            <div className="p-5 flex items-center gap-3.5 border-b border-gray-700/60 relative">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg">
                <SparklesIcon className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">SPARK-IQ</h1>
              {!isDesktop && (
                <button onClick={() => setIsSidebarOpen(false)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-gray-700/50 transition-colors">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              )}
            </div>
            <nav className="flex-1 overflow-y-auto p-3 space-y-1.5 styled-scrollbar">
              {studentMenu.map(item => {
                const isActive = location.pathname === item.link;
                return (
                  <Link
                    key={item.title}
                    to={item.link}
                    onClick={() => !isDesktop && setIsSidebarOpen(false)}
                    className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg text-gray-300 transition-all group
                              ${isActive ? 'bg-indigo-500/30 text-indigo-200 font-semibold shadow-inner' : 'hover:bg-indigo-500/10 hover:text-indigo-300'}
                              ${item.special ? `mt-auto mb-1 bg-gradient-to-r from-purple-600/90 to-indigo-600/90 !text-white shadow-md hover:shadow-lg hover:opacity-90 ${isActive ? 'ring-2 ring-purple-400' : ''}` : ''}`}
                  >
                    <item.Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-indigo-300' : 'text-indigo-400'} group-hover:scale-110 transition-transform`} />
                    <span className="text-sm font-medium">{item.title}</span>
                  </Link>
                );
              })}
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>
      {isSidebarOpen && !isDesktop && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>}

      <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 overflow-hidden md:ml-64">
        {!isDesktop && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="fixed left-4 top-4 z-40 p-2 bg-gray-800/80 backdrop-blur-sm rounded-lg hover:bg-gray-700 transition-colors shadow-lg"
          >
            <Bars3Icon className="w-6 h-6 text-gray-300" />
          </button>
        )}
        <header className="bg-slate-800/60 backdrop-blur-lg p-3 md:p-4 border-b border-slate-700 shadow-lg flex justify-between items-center sticky top-0 z-10 flex-shrink-0">
          <div className="flex items-center">
            <div>
              <h1 className="text-lg md:text-xl font-semibold text-sky-400">Voice Chat with Sparky</h1>
              <p className="text-xs md:text-sm text-slate-400">Your AI Study Companion</p>
            </div>
          </div>
          <button className="p-2 rounded-full hover:bg-slate-700/70 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400">
            <Cog6ToothIcon className="w-5 h-5 md:w-6 md:h-6 text-slate-400" />
          </button>
        </header>
        {error && (
          <div className="bg-red-600/40 border-l-4 border-red-500 text-red-100 p-3 mx-2 md:mx-4 my-2 md:my-3 rounded-md text-sm shadow-md flex-shrink-0" role="alert">
            <p><span className="font-bold">Oops!</span> {error}</p>
          </div>
        )}
        <main className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4 md:space-y-5 styled-scrollbar">
          {messages.map((message) => (
            <div key={message.id} className={`flex items-end ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {message.sender === 'assistant' && (
                <img
                  src="/sparky-avatar.png"
                  alt="Sparky"
                  className="w-8 h-8 md:w-9 md:h-9 rounded-full mr-2 md:mr-2.5 mb-1 border-2 border-sky-500/60 self-start shadow-sm flex-shrink-0"
                  onError={(e) => { e.currentTarget.src = '/default-ai-avatar.png'; e.currentTarget.alt = 'AI Default'; }}
                />
              )}
              <div
                className={`max-w-[80%] md:max-w-[70%] rounded-xl p-3 md:p-3.5 shadow-lg relative ${
                  message.sender === 'user' ? 'bg-sky-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-100 rounded-bl-none'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.text}</p>
                <span
                  className={`text-xs opacity-70 mt-1.5 md:mt-2 block ${
                    message.sender === 'user' ? 'text-right text-sky-200' : 'text-left text-slate-400'
                  }`}
                >
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {message.sender === 'user' && (
                <img
                  src={currentUser?.photoURL || "/default-user.png"}
                  alt="Student"
                  className="w-8 h-8 md:w-9 md:h-9 rounded-full ml-2 md:ml-2.5 mb-1 border-2 border-slate-500/60 self-start shadow-sm flex-shrink-0"
                  onError={(e) => { e.currentTarget.src = '/default-user.png'; e.currentTarget.alt = 'User Default'; }}
                />
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </main>
        <footer className="bg-slate-800/70 backdrop-blur-lg p-2.5 md:p-4 border-t border-slate-700 shadow-up sticky bottom-0 z-10 flex-shrink-0">
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={toggleListening}
              title={isListening ? "Stop listening" : "Start listening"}
              className={`p-3 md:p-3.5 rounded-full transition-all duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 flex items-center justify-center ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 focus-visible:ring-red-400 animate-pulse_bg_red'
                  : 'bg-sky-500 hover:bg-sky-600 focus-visible:ring-sky-400'
              } text-white shadow-lg`}
              disabled={isProcessing}
            >
              {isListening ? <StopIcon className="w-5 h-5 md:w-6 md:h-6" /> : <MicrophoneIcon className="w-5 h-5 md:w-6 md:h-6" />}
            </button>
            <div className="flex-1 bg-slate-700/80 rounded-lg p-3 md:p-3.5 min-h-[48px] md:min-h-[54px] text-slate-300 italic text-sm flex items-center border border-slate-600/50 shadow-inner">
              {isListening && !transcript.trim() && <span className="animate-pulse">Listening...</span>}
              {transcript || (!isListening && !isProcessing ? "Tap mic or type..." : '')}
              {isProcessing && <span className="animate-pulse">Sparky is thinking...</span>}
            </div>
            {isSpeaking ? (
              <button
                onClick={stopSpeaking}
                title="Stop Sparky's speech"
                className="p-3 md:p-3.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 shadow-lg"
              >
                <SpeakerXMarkIcon className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            ) : (
              <button
                onClick={() => {
                  const lastAiMessage = messages.filter(m => m.sender === 'assistant').pop();
                  if (lastAiMessage) speakText(lastAiMessage.text);
                }}
                title="Replay Sparky's last response"
                disabled={!messages.some(m => m.sender === 'assistant') || isProcessing}
                className="p-3 md:p-3.5 rounded-full bg-teal-500 hover:bg-teal-600 text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 shadow-lg disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed"
              >
                <SpeakerWaveIcon className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            )}
            <button
              onClick={() => handleSendMessage(transcript)}
              disabled={!transcript.trim() || isProcessing || isListening}
              title="Send message"
              className={`p-3 md:p-3.5 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 ${
                transcript.trim() && !isProcessing && !isListening
                  ? 'bg-green-500 hover:bg-green-600 focus-visible:ring-green-400'
                  : 'bg-slate-600 text-slate-400 cursor-not-allowed'
              } text-white shadow-lg`}
            >
              <PaperAirplaneIcon className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        </footer>
      </div>
      <style jsx global>{`
        .styled-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .styled-scrollbar::-webkit-scrollbar-track {
          background: rgba(55, 65, 81, 0.5);
          border-radius: 10px;
        }
        .styled-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(107, 114, 128, 0.7);
          border-radius: 10px;
        }
        .styled-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.9);
        }
        .styled-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(107, 114, 128, 0.7) rgba(55, 65, 81, 0.5);
        }
        .scroll-smooth {
          scroll-behavior: smooth;
        }
        .shadow-up {
          box-shadow: 0 -6px 10px -3px rgba(0, 0, 0, 0.1), 0 -4px 6px -2px rgba(0, 0, 0, 0.07);
        }
        .animate-pulse_bg_red {
          animation: pulse_bg_red 1.5s infinite;
        }
        @keyframes pulse_bg_red {
          0%, 100% {
            background-color: #ef4444;
          }
          50% {
            background-color: #dc2626;
          }
        }
      `}</style>
    </div>
  );
};

export default VoiceChat;
