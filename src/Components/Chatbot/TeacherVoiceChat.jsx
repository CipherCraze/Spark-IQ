import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext'; // Ensure this path is correct
import { saveChatMessage } from '../../firebase/chatHistoryOperations'; // Ensure this path is correct
import { MicrophoneIcon, StopIcon, PaperAirplaneIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/solid';

const TeacherVoiceChat = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false); // For AI text-to-speech
  const { currentUser } = useAuth();
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const utteranceRef = useRef(null);

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
          if (event.error === 'no-speech') {
            errorMsg = 'No speech detected. Please try again.';
          } else if (event.error === 'audio-capture') {
            errorMsg = 'Audio capture error. Check microphone permissions/settings.';
          } else if (event.error === 'not-allowed') {
            errorMsg = 'Microphone access denied. Please allow it in browser settings.';
          }
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

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
    if (isSpeaking) {
      window.speechSynthesis.cancel();
    }

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
      setIsProcessing(false);
      return;
    }

    const userMessage = {
      id: `teacher-${Date.now()}`,
      text: textToSubmit,
      sender: 'user', // 'user' here refers to the teacher interacting
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setTranscript('');
    setIsProcessing(true);

    try {
      // Save teacher's message to Firebase
      const teacherMessageForDb = {
        text: userMessage.text,
        sender: 'user', // Stored as 'user' in DB
        timestamp: userMessage.timestamp,
        pinned: false
      };
      // Pass `true` for isEducator
      await saveChatMessage(currentUser.uid, teacherMessageForDb, true);

      // Simulate AI response for educator context
      const aiTextResponse = `Okay, as an educator, I understand you're looking for assistance with: "${userMessage.text}". I can help you generate quiz questions, explain complex topics for lesson planning, or find relevant educational resources. What specifically would you like to do?`;
      
      const aiResponseMessage = {
        id: `ai-teacher-${Date.now()}`,
        text: aiTextResponse,
        sender: 'assistant',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiResponseMessage]);
      speakText(aiTextResponse);

      // Save AI response to Firebase (still under teacher's chat context)
      const aiMessageForDb = {
        text: aiResponseMessage.text,
        sender: 'bot', // Stored as 'bot' in DB
        timestamp: aiResponseMessage.timestamp,
        pinned: false
      };
      // Pass `true` for isEducator
      await saveChatMessage(currentUser.uid, aiMessageForDb, true);

    } catch (e) {
      console.error('Error sending message:', e);
      setError('An error occurred while processing your message for the educator context. ' + e.message);
      setMessages(prev => [...prev, {
        id: `error-teacher-${Date.now()}`,
        text: 'Error: Could not process the educator message.',
        sender: 'assistant',
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 text-slate-100 font-sans">
      {/* Header */}
      <header className="bg-slate-800/60 backdrop-blur-lg p-4 border-b border-slate-700 shadow-xl flex justify-between items-center sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-semibold text-emerald-400">Educator Voice Command</h1>
          <p className="text-sm text-slate-400">AI Assistant for Teachers</p>
        </div>
        <button className="p-2 rounded-full hover:bg-slate-700 transition-colors">
          <Cog6ToothIcon className="w-6 h-6 text-slate-400"/>
        </button>
      </header>

      {/* Error Display */}
      {error && (
        <div className="bg-red-600/30 border-l-4 border-red-500 text-red-200 p-3 mx-4 mt-3 mb-0 rounded-md text-sm shadow-md" role="alert">
          <p><span className="font-bold">Attention:</span> {error}</p>
        </div>
      )}

      {/* Messages Container */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 scroll-smooth">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-end ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.sender === 'assistant' && (
                 <img src="/sparky-avatar-teacher.png" alt="AI" className="w-9 h-9 rounded-full mr-2.5 mb-1 border-2 border-emerald-500/60 self-start shadow-sm" onError={(e) => {e.currentTarget.src='/sparky-avatar.png'; e.currentTarget.alt='AI Default';}}/>
            )}
            <div
              className={`max-w-[78%] md:max-w-[70%] rounded-xl p-3.5 shadow-lg relative ${
                message.sender === 'user'
                  ? 'bg-emerald-600 text-white rounded-br-none' // Teacher's messages are emerald
                  : 'bg-slate-700 text-slate-200 rounded-bl-none'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
              <span className={`text-xs opacity-60 mt-2 block ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
             {message.sender === 'user' && ( // Teacher's avatar
                 <img src={currentUser?.photoURL || "/default-teacher-avatar.png"} alt="Teacher" className="w-9 h-9 rounded-full ml-2.5 mb-1 border-2 border-slate-500/60 self-start shadow-sm" onError={(e) => {e.currentTarget.src='/default-user.png'; e.currentTarget.alt='User Default';}}/>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <footer className="bg-slate-800/60 backdrop-blur-lg p-3 md:p-4 border-t border-slate-700 shadow-up sticky bottom-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleListening}
            title={isListening ? "Stop voice input" : "Start voice input"}
            className={`p-3.5 rounded-full transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 flex items-center justify-center ${
              isListening
                ? 'bg-red-500 hover:bg-red-600 focus:ring-red-400 animate-pulse_bg_red'
                : 'bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-400' // Emerald for teacher's mic
            } text-white shadow-lg`}
            disabled={isProcessing}
          >
            {isListening ? (
              <StopIcon className="w-6 h-6" />
            ) : (
              <MicrophoneIcon className="w-6 h-6" />
            )}
          </button>

          <div className="flex-1 bg-slate-700/90 rounded-lg p-3.5 min-h-[54px] text-slate-300 italic text-sm flex items-center border border-slate-600/50">
            {isListening && !transcript.trim() && <span className="animate-pulse">Listening attentively...</span>}
            {transcript || (!isListening ? "Click the mic or type your instructions..." : '')}
          </div>
          
          {isSpeaking ? (
             <button
                onClick={stopSpeaking}
                title="Stop AI speech"
                className="p-3.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-slate-800 shadow-lg"
            >
                <SpeakerXMarkIcon className="w-6 h-6" />
            </button>
          ) : (
             <button
                onClick={() => {
                    const lastAiMessage = messages.filter(m => m.sender === 'assistant').pop();
                    if (lastAiMessage) speakText(lastAiMessage.text);
                }}
                title="Replay last AI response"
                disabled={!messages.some(m => m.sender === 'assistant')}
                className="p-3.5 rounded-full bg-sky-500 hover:bg-sky-600 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-800 shadow-lg disabled:bg-slate-600 disabled:cursor-not-allowed"
            >
                <SpeakerWaveIcon className="w-6 h-6" />
            </button>
          )}

          <button
            onClick={() => handleSendMessage(transcript)}
            disabled={!transcript.trim() || isProcessing || isListening}
            title="Send instruction"
            className={`p-3.5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 ${
              transcript.trim() && !isProcessing && !isListening
                ? 'bg-green-500 hover:bg-green-600 focus:ring-green-400'
                : 'bg-slate-600 cursor-not-allowed'
            } text-white shadow-lg`}
          >
            <PaperAirplaneIcon className="w-6 h-6" />
          </button>
        </div>
      </footer>
       <style jsx global>{`
        .scroll-smooth { scroll-behavior: smooth; }
        .shadow-up { box-shadow: 0 -6px 10px -3px rgba(0, 0, 0, 0.1), 0 -4px 6px -2px rgba(0, 0, 0, 0.07); }
        .animate-pulse_bg_red { animation: pulse_bg_red 1.5s infinite; }
        @keyframes pulse_bg_red {
          0%, 100% { background-color: #ef4444; } /* red-500 */
          50% { background-color: #dc2626; } /* red-600 */
        }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #0f172a; /* slate-900 */ }
        ::-webkit-scrollbar-thumb { background: #334155; /* slate-700 */ border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #475569; /* slate-600 */ }
      `}</style>
    </div>
  );
};

export default TeacherVoiceChat;