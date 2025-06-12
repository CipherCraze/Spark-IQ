import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLocation, useNavigate, Link } from 'react-router-dom'; // Added useLocation, useNavigate
import { auth, db } from '../../firebase/firebaseConfig'; // Added db import for getUserProfile
import { signOut, onAuthStateChanged } from 'firebase/auth'; // Added auth functions
import { getUserProfile } from '../../firebase/userOperations'; // Assuming this path is correct
import { saveChatMessage } from '../../firebase/chatHistoryOperations'; // Assuming this path is correct

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
  ChevronLeftIcon, // Added for desktop sidebar toggle
  UserCircleIcon, // Added for profile dropdown
  ArrowLeftOnRectangleIcon, // Added for logout in profile dropdown
  BellIcon, // Added for notifications (even if dummy)
  ChevronDownIcon, // Added for profile dropdown
} from '@heroicons/react/24/outline';
import {
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  UserGroupIcon as SolidUserGroupIcon,
} from '@heroicons/react/24/solid';


// --- Gemini API Configuration ---
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL_GENERATE_CONTENT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

// Function to get a general chat response from Gemini (kept as is)
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

   // Prepare history for Gemini format (alternating user/model roles)
  const historyForGemini = [];
  let lastRole = null;

  // Process previous messages, combining consecutive messages from the same sender
  // Gemini expects strict turn taking (user, model, user, model...)
  const processedMessages = previousMessages.reduce((acc, msg) => {
      const role = msg.sender === 'user' ? 'user' : 'model'; // Map your sender to Gemini's roles
      if (acc.length === 0 || acc[acc.length - 1].role !== role) {
          // Start a new turn
          acc.push({ role, parts: [{ text: msg.text }] });
      } else {
          // Append to the current turn's last part
          acc[acc.length - 1].parts.push({ text: msg.text });
      }
      return acc;
  }, []);

  // Use the last few turns for context
  // Gemini has a context window, sending too many messages is costly/ineffective
  const recentProcessedHistory = processedMessages.slice(-6); // Keep last ~3 user/model turns

  // Ensure the last turn is 'user' before adding the current input
   if (recentProcessedHistory.length > 0 && recentProcessedHistory[recentProcessedHistory.length - 1].role === 'model') {
       // If the last processed message was from the model, add the new user input as a new 'user' turn
        historyForGemini.push(...recentProcessedHistory, { role: 'user', parts: [{ text: userInput }] });
   } else if (recentProcessedHistory.length > 0 && recentProcessedHistory[recentProcessedHistory.length - 1].role === 'user') {
       // If the last processed message was from the user (shouldn't happen with good turn processing),
       // just add the new input to that turn's parts (this is less ideal for turn understanding)
        historyForGemini.push(...recentProcessedHistory);
        historyForGemini[historyForGemini.length - 1].parts.push({text: userInput}); // Appending to parts might not work well
        // A safer approach is to treat it as a new turn, even if it breaks strict alternation (Gemini might handle it)
         historyForGemini.push({ role: 'user', parts: [{ text: userInput }] });
   }
   else {
       // If no previous messages, just add the current user input as the first turn
       historyForGemini.push({ role: 'user', parts: [{ text: userInput }] });
   }

  // Filter out any turns that ended up empty (though processing should prevent this)
  const finalContents = historyForGemini.filter(c => c.parts.some(p => p.text && p.text.trim() !== ''));


  const body = {
    contents: finalContents,
    generationConfig: {
      temperature: 0.75, // Slightly more creative but still grounded
      topK: 1, // Default
      topP: 0.95, // Default, allows for some flexibility
      maxOutputTokens: 400, // Adjusted slightly
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

// --- Educator Sidebar Menu Data ---
// (Copied from EducatorDashboard)
const educatorSidebarMenu = [
  { title: 'Dashboard', Icon: PresentationChartLineIcon, link: '/educator-dashboard' },
  { title: 'Assignments', Icon: ClipboardDocumentIcon, link: '/assignment-management' },
  { title: 'Tests', Icon: ClipboardDocumentIcon, link: '/teacher-tests' },
  { title: 'Grades & Analytics', Icon: AcademicCapIcon, link: '/GradesAndAnalytics' },
  { title: 'Resources', Icon: FolderIcon, link: '/resource-management' },
  { title: 'Attendance', Icon: ChartBarIcon, link: '/attendance-tracking' },
  { title: 'Teacher Insights', Icon: DocumentMagnifyingGlassIcon, link: '/personalized-feedback-educators', description: "Get AI-powered feedback on your teaching activity." },
  { title: 'Voice Chat', Icon: ChatBubbleLeftRightIcon, link: '/teacher-voice-chat', current: true }, // Set current: true for this page
  { title: 'AI Chatbot (Ask Sparky)', Icon: ChatBubbleLeftRightIcon, link: '/chatbot-education' },
  { title: 'AI Questions', Icon: SparklesIcon, link: '/ai-generated-questions-educator' },
  { title: 'Social / Chat', Icon: SolidUserGroupIcon, link: '/chat-functionality' },
  { title: 'Educational News', Icon: GlobeAltIcon, link: '/educational-news-educator' },
  { title: 'Student Suggestions', Icon: EnvelopeIcon, link: '/suggestions-to-students' },
  { title: 'Meetings & Conferences', Icon: VideoCameraIcon, link: '/meeting-host' },
  { title: 'Announcements', Icon: MegaphoneIcon, link: '/announcements' },
  { title: 'Upgrade to Pro', Icon: SparklesIcon, link: '/pricing', special: true },
];


// --- TeacherVoiceChat Component ---
const TeacherVoiceChat = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState(''); // Text input for voice
  const [textInput, setTextInput] = useState(''); // Text input for typing
  const [messages, setMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  // Removed useAuth currentUser and replaced with onAuthStateChanged listener
  const [currentUser, setCurrentUser] = useState(null);
  const [educator, setEducator] = useState(null);
  const [isLoadingEducator, setIsLoadingEducator] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false); // For profile dropdown

  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const utteranceRef = useRef(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default to closed for mobile-first design
  const location = useLocation(); // For active sidebar link
  const navigate = useNavigate(); // For navigation (e.g., logout)

   // Refs for profile dropdown
  const profileMenuRef = useRef(null);
  const profileButtonRef = useRef(null);


   // Effect for authentication and fetching user profile (Copied from Dashboard)
   useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user); // Set Firebase user object
        try {
          setIsLoadingEducator(true);
          // Fetch profile specific to the educator role if applicable, or use generic user profile
          const profileData = await getUserProfile(user.uid); // Assuming getUserProfile fetches from 'users' or 'educators'
          if (profileData) {
            setEducator(profileData);
          } else {
             // Fallback if no profile data is found (should ideally be created on signup)
             const basicProfile = { uid: user.uid, email: user.email, name: user.displayName || "Educator", role: 'educator' };
             setEducator(basicProfile);
          }
        } catch (error) {
          console.error('Error fetching educator profile:', error);
          // Decide how to handle profile fetch error (e.g., show generic user data, redirect)
          // For now, just log and allow access with basic user data
        } finally {
          setIsLoadingEducator(false);
        }
      } else {
        setCurrentUser(null);
        setEducator(null); // Clear educator profile on logout
        setIsLoadingEducator(false);
        navigate('/login'); // Redirect if not authenticated
      }
    });

    // Effect for closing profile dropdown on outside click (Copied from Dashboard)
    const handleClickOutsideProfile = (event) => {
      if (isProfileOpen &&
          profileMenuRef.current && !profileMenuRef.current.contains(event.target) &&
          profileButtonRef.current && !profileButtonRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutsideProfile);

    // Initial check for desktop size to potentially open sidebar by default
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    // Set initial state and listen for resize
    handleResize(); // Set initial state
    window.addEventListener('resize', handleResize);


    return () => {
        unsubscribeAuth();
        document.removeEventListener('mousedown', handleClickOutsideProfile);
        window.removeEventListener('resize', handleResize);
        // Clean up speech synthesis and recognition on component unmount
         if (utteranceRef.current && window.speechSynthesis) {
           window.speechSynthesis.cancel();
         }
         if (recognitionRef.current) {
           recognitionRef.current.stop();
           recognitionRef.current.onresult = null;
           recognitionRef.current.onerror = null;
           recognitionRef.current.onend = null;
         }
    };
  }, [navigate, isProfileOpen]); // Depend on navigate and isProfileOpen


  // Speech Recognition useEffect (kept as is, ensures cleanup)
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
          // Update transcript state based on source
          setTranscript(finalTranscript + interimTranscript); // Voice input transcript
          // Update textInput state as well if you want to see the voice input in the text area
           setTextInput(finalTranscript + interimTranscript);
        };

         recognitionRef.current.onend = () => {
             // Only stop listening if it wasn't stopped programmatically
             if (isListening) {
                 setIsListening(false);
                 // If there was final transcript when stopped, process it
                 if (transcript.trim()) {
                    handleSendMessage(transcript, 'voice');
                 }
             }
         };


        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          let errorMsg = 'An unknown speech recognition error occurred.';
          if (event.error === 'no-speech') { errorMsg = 'No speech detected. Please try again.';}
          else if (event.error === 'audio-capture') { errorMsg = 'Audio capture error. Check microphone permissions/settings.';}
          else if (event.error === 'not-allowed') { errorMsg = 'Microphone access denied. Please allow it in browser settings.';}
          setError(errorMsg);
          setIsListening(false); // Ensure listening state is off
        };
      } else {
        setError('Speech recognition is not supported in your browser.');
      }
    }
     // No cleanup needed in this effect, handled in the main auth useEffect
  }, [isListening, transcript]); // Added dependencies

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

  useEffect(scrollToBottom, [messages]);


   // Function to toggle listening
  const toggleListening = () => {
      if (!recognitionRef.current) {
          setError('Speech recognition not available.');
          return;
      }
      setError(''); // Clear previous errors
      stopSpeaking(); // Stop AI speech if speaking

      if (isListening) {
          recognitionRef.current.stop(); // This will trigger onend
          // isListening state will be updated in onend or immediately below
          // If stop was successful, onend handles processing transcript
           setIsListening(false); // Optimistic update
      } else {
           // Clear previous transcript before starting
           setTranscript('');
           setTextInput('');
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

   // Modified handleSendMessage to accept input source
  const handleSendMessage = async (textToSubmit, source = 'text') => {
    const finalTextInput = textToSubmit.trim();
    if (!finalTextInput) return;
    setError('');
    stopSpeaking(); // Stop any ongoing AI speech

    if (!currentUser) {
      setError('You must be logged in to send messages.');
      return;
    }

    // Prevent sending multiple messages while processing
    if (isProcessing) return;


    const userMessage = {
      id: `teacher-${Date.now()}`,
      text: finalTextInput,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    // Update messages state immediately with user message
     setMessages(prev => [...prev, userMessage]); // Use functional update for safety
    // Clear relevant input field
    if (source === 'voice') setTranscript('');
    setTextInput(''); // Clear text input after sending


    setIsProcessing(true);

    try {
      // Save user message to DB
      const teacherMessageForDb = {
        text: userMessage.text,
        sender: 'user',
        timestamp: userMessage.timestamp,
        pinned: false // Or manage pinned status if needed
      };
      await saveChatMessage(currentUser.uid, teacherMessageForDb, true); // Assuming true appends to history array

      // Get AI response from Gemini, passing previous messages for context
      // Pass the current messages list *including* the new user message for proper context
      const aiTextResponse = await getGeminiChatResponse(userMessage.text, [...messages, userMessage]);

      const aiResponseMessage = {
        id: `ai-teacher-${Date.now()}`,
        text: aiTextResponse,
        sender: 'assistant',
        timestamp: new Date().toISOString(),
      };

       // Update messages state with AI response
      setMessages(prev => [...prev, aiResponseMessage]); // Use functional update


      // Speak the AI response
      speakText(aiTextResponse);

      // Save AI message to DB
      const aiMessageForDb = {
        text: aiResponseMessage.text,
        sender: 'bot', // Consistent with your DB schema if different from 'assistant'
        timestamp: aiResponseMessage.timestamp,
        pinned: false
      };
      await saveChatMessage(currentUser.uid, aiMessageForDb, true);

    } catch (e) {
      console.error('Error in handleSendMessage or AI processing:', e);
      const errorMessage = `An error occurred: ${e.message || 'Could not process the message.'}`;
      setError(errorMessage);
       // Add error message to display in the chat
       setMessages(prev => [...prev, {
         id: `error-teacher-${Date.now()}`,
         text: `Error: ${errorMessage}`,
         sender: 'assistant', // Show error as coming from the assistant side
         timestamp: new Date().toISOString(),
         isError: true // Optional flag to style error messages differently
       }]);
    } finally {
      setIsProcessing(false);
      // If source was voice, stop listening if it's still active (should be handled by onend now)
       if (source === 'voice' && isListening) {
           // This case should ideally not happen if onend correctly sets isListening false
           recognitionRef.current?.stop();
           setIsListening(false);
       }
    }
  };

   // Logout handler (Copied from Dashboard)
  const handleLogout = async () => {
    try {
      await signOut(auth);
      // localStorage.removeItem('profileUser'); // Remove cached profile if used
      navigate('/login'); // Redirect to login after logout
    } catch (error) {
      console.error('Error logging out:', error);
      setError('Logout failed.'); // Display logout error
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-gray-900 flex text-slate-100 overflow-x-hidden">
      {/* --- Sidebar --- */}
      <aside className={`fixed top-0 left-0 h-screen w-64 bg-slate-800/70 backdrop-blur-2xl border-r border-slate-700/50 transform transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } z-50 flex flex-col shadow-2xl`}>
        <div className="p-5 border-b border-slate-700/50">
          <Link to="/educator-dashboard" className="flex items-center gap-3 group">
            <GlobeAltIcon className="w-10 h-10 text-purple-500 group-hover:text-purple-400 transition-all duration-300 transform group-hover:rotate-[20deg] group-hover:scale-110" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
              SPARK-IQ
            </h1>
          </Link>
          {/* Mobile Sidebar Close Button */}
           <button onClick={() => setIsSidebarOpen(false)} className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 lg:hidden absolute top-5 right-5">
                <XMarkIcon className="w-6 h-6"/>
           </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
          {educatorSidebarMenu.map((item) => (
            <Link
              key={item.title}
              to={item.link}
              className={`group flex items-center gap-3.5 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out
                ${item.link === location.pathname // Use location.pathname for current route check
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg ring-1 ring-purple-500/60 transform scale-[1.01]'
                  : item.special
                    ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white font-semibold hover:from-amber-500 hover:to-orange-600 shadow-md hover:shadow-lg'
                    : 'text-slate-300 hover:bg-slate-700/60 hover:text-purple-300 hover:shadow-md'
                }
              `}
              onClick={() => {
                 // Close sidebar on link click only on smaller screens
                 if (window.innerWidth < 1024) {
                   setIsSidebarOpen(false);
                 }
              }}
            >
              <item.Icon className={`w-5 h-5 flex-shrink-0 ${item.link === location.pathname ? 'text-white' : item.special ? 'text-white/90' : 'text-slate-400 group-hover:text-purple-300' } transition-colors`} />
              <span>{item.title}</span>
            </Link>
          ))}
        </nav>

      </aside>
        {/* Mobile Overlay for Sidebar */}
         {isSidebarOpen && window.innerWidth < 1024 && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40" onClick={() => setIsSidebarOpen(false)}></div>
         )}


      {/* --- Main Content --- */}
      <main className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
        isSidebarOpen ? 'lg:ml-64' : 'ml-0' // Adjust margin for desktop sidebar
      }`}>
         {/* Header (Copied from EducatorDashboard Header) */}
        <header className="flex justify-between items-center p-4 sm:p-6 lg:p-8 bg-slate-800/70 backdrop-blur-lg border-b border-slate-700/60 shadow-lg flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger */}
            <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2.5 bg-slate-800/60 hover:bg-slate-700/80 rounded-lg shadow-sm hover:shadow-md transition-all lg:hidden"
                aria-label="Open sidebar"
              >
                <Bars3Icon className="w-6 h-6 text-slate-300" />
              </button>
            {/* Desktop Sidebar Toggle */}
             <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2.5 bg-slate-800/60 hover:bg-slate-700/80 rounded-lg shadow-sm hover:shadow-md transition-all hidden lg:block"
              aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              {isSidebarOpen ? <ChevronLeftIcon className="w-6 h-6 text-slate-300" /> : <Bars3Icon className="w-6 h-6 text-slate-300" /> }
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text">
                Educator Voice Command
              </h1>
              <p className="text-slate-400 text-sm sm:text-base">AI Assistant by EduSpark</p>
            </div>
          </div>

          {/* Profile/Notifications */}
          <div className="flex items-center gap-3 sm:gap-4">
             
             {/* Profile Dropdown */}
             <div ref={profileButtonRef} className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 hover:bg-slate-700/50 p-1.5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
                aria-label="User profile"
                disabled={isLoadingEducator} // Disable while loading profile
              >
                {isLoadingEducator ? (
                   <div className="w-9 h-9 rounded-full bg-slate-600 animate-pulse"></div>
                ) : educator?.avatar ? (
                  <img src={educator.avatar} alt={educator.name || 'Educator'} className="w-9 h-9 rounded-full object-cover border-2 border-purple-500/70" />
                ) : (
                  <UserCircleIcon className="w-9 h-9 text-slate-400 hover:text-slate-200" />
                )}
                <div className="hidden xl:block text-left">
                  <p className="text-white text-sm font-medium truncate max-w-[120px]">{isLoadingEducator ? 'Loading...' : educator?.name || "Educator"}</p>
                  <p className="text-xs text-slate-400 truncate max-w-[120px]">{isLoadingEducator ? '' : educator?.education || "Educator"}</p>
                </div>
                <ChevronDownIcon className="w-4 h-4 text-slate-400 hidden xl:block" />
              </button>
              {isProfileOpen && (
                <div ref={profileMenuRef} className="absolute right-0 mt-3 w-60 bg-slate-800/95 backdrop-blur-xl rounded-xl shadow-2xl border border-slate-700/60 z-50 overflow-hidden">
                  <div className="p-3.5 border-b border-slate-700/60">
                    <p className="text-white font-semibold text-sm truncate">{educator?.name || "Educator"}</p>
                    <p className="text-xs text-slate-400 truncate">{educator?.email || "email@example.com"}</p>
                    {educator?.teachingExperience && <p className="text-xs text-slate-500 mt-1.5">{educator.teachingExperience} years experience</p>}
                  </div>
                  <div className="py-2 px-1.5">
                    <Link to="/educator-profile" className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700/60 rounded-md transition-colors" onClick={() => setIsProfileOpen(false)}>
                      <UserCircleIcon className="w-4 h-4 text-slate-400" /> Profile
                    </Link>
                    <Link to="/educator-settings" className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700/60 rounded-md transition-colors" onClick={() => setIsProfileOpen(false)}>
                      <Cog6ToothIcon className="w-4 h-4 text-slate-400" /> Settings
                    </Link>
                  </div>
                  <div className="p-1.5 border-t border-slate-700/60">
                    <button onClick={handleLogout} className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-md transition-colors">
                      <ArrowLeftOnRectangleIcon className="w-4 h-4" /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>


        {error && (
          <div className="bg-red-600/30 border-l-4 border-red-500 text-red-200 p-3 mx-4 md:mx-6 lg:mx-8 mt-3 rounded-md text-sm shadow-md flex-shrink-0" role="alert">
            <p><span className="font-bold">Attention:</span> {error}</p>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-4 md:space-y-5 scroll-smooth">
          {messages.map((message) => (
            <div key={message.id} className={`flex items-end ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {message.sender === 'assistant' && (
                   // Replace with actual AI avatar if available
                   <img src="/myfavicon3.png" alt="AI" className="w-8 h-8 md:w-9 md:h-9 rounded-full mr-2 md:mr-2.5 mb-1 border-2 border-purple-500/50 self-start shadow-sm flex-shrink-0" onError={(e) => {e.currentTarget.src='/default-user.png'; e.currentTarget.alt='AI Default';}}/>
              )}
              <div className={`max-w-[80%] md:max-w-[70%] rounded-xl p-3 md:p-3.5 shadow-lg relative ${ message.sender === 'user' ? 'bg-purple-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.text}</p>
                <span className={`text-xs opacity-70 mt-1.5 md:mt-2 block ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
               {message.sender === 'user' && (
                   // Replace with actual user avatar if available
                   <img src={educator.avatar} alt="Teacher" className="w-8 h-8 md:w-9 md:h-9 rounded-full ml-2 md:ml-2.5 mb-1 border-2 border-slate-500/50 self-start shadow-sm flex-shrink-0" onError={(e) => {e.currentTarget.src='/default-user.png'; e.currentTarget.alt='User Default';}}/>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </main>

        {/* Footer Input Area */}
        <footer className="bg-slate-800/70 backdrop-blur-lg p-4 md:p-6 lg:p-8 border-t border-slate-700/60 shadow-up sticky bottom-0 z-10 flex-shrink-0">
            <div className="flex items-center gap-3 sm:gap-4">
                 {/* Microphone/Stop Button */}
                <button
                  onClick={toggleListening}
                  title={isListening ? "Stop voice input" : "Start voice input"}
                  className={`p-3 md:p-3.5 rounded-full transition-all duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 flex items-center justify-center ${isListening ? 'bg-red-500 hover:bg-red-600 focus-visible:ring-red-400 animate-pulse_bg_red' : 'bg-purple-600 hover:bg-purple-700 focus-visible:ring-purple-400'} text-white shadow-lg`}
                  disabled={isProcessing || isLoadingEducator || !currentUser}
                >
                  {isListening ? <StopIcon className="w-5 h-5 md:w-6 md:h-6" /> : <MicrophoneIcon className="w-5 h-5 md:w-6 md:h-6" />}
                </button>

                 {/* Text Input / Transcript Display */}
                 {/* Conditional rendering or combined input approach */}
                {/* Using a textarea allows multiline input */}
                <textarea
                    value={transcript || textInput} // Show transcript if listening, otherwise show textInput
                    onChange={(e) => { setTextInput(e.target.value); if(isListening) setTranscript(''); }} // Typing clears transcript if listening
                    onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(textInput, 'text'); } }}
                    rows={1} // Start with one row
                    placeholder={isProcessing ? "EduSpark is thinking..." : (isListening ? "Listening..." : "Type or tap mic...")}
                    disabled={isProcessing || isListening} // Disable if processing or actively listening
                    className="flex-1 bg-slate-700/80 border border-slate-600 text-slate-200 rounded-lg px-4 py-3 resize-none overflow-y-auto custom-scrollbar
                                focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none placeholder-slate-500 transition-colors text-sm leading-relaxed disabled:opacity-70 disabled:cursor-not-allowed italic"
                    style={{ minHeight: '48px', maxHeight: '150px' }} // Control min/max height
                />


                {/* Speak/Stop Speaking Button */}
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

                {/* Send Button */}
                <button
                  onClick={() => handleSendMessage(textInput || transcript, textInput ? 'text' : 'voice')} // Send textInput if available, else transcript
                  disabled={(!textInput.trim() && !transcript.trim()) || isProcessing || isListening} // Disable if both inputs are empty or processing/listening
                  title="Send message"
                  className={`p-3 md:p-3.5 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800
                             ${ ((textInput.trim() || transcript.trim()) && !isProcessing && !isListening)
                                ? 'bg-green-500 hover:bg-green-600 focus-visible:ring-green-400'
                                : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                             } text-white shadow-lg`}
                >
                  <PaperAirplaneIcon className="w-5 h-5 md:w-6 md:h-6" />
                </button>
            </div>
        </footer>

      </main>

      {/* Global Styles for Scrollbar and Animation */}
      <style jsx global>{`
        .scroll-smooth { scroll-behavior: smooth; }
        .shadow-up { box-shadow: 0 -6px 10px -3px rgba(0, 0, 0, 0.1), 0 -4px 6px -2px rgba(0, 0, 0, 0.07); }
        .animate-pulse_bg_red { animation: pulse_bg_red 1.5s infinite; }
        @keyframes pulse_bg_red {
          0%, 100% { background-color: #ef4444; } /* red-500 */
          50% { background-color: #dc2626; } /* red-600 */
        }
        /* Custom scrollbar for overflow-y */
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: rgba(15, 23, 42, 0.5); } /* dark slate background */
        ::-webkit-scrollbar-thumb { background: #475569; border-radius: 4px; } /* lighter slate thumb */
        ::-webkit-scrollbar-thumb:hover { background: #64748b; } /* even lighter on hover */

        /* Specific custom scrollbar for sidebars or textareas if needed */
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } /* Match sidebar background */
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #6b7280; }
      `}</style>
    </div>
  );
};

export default TeacherVoiceChat;