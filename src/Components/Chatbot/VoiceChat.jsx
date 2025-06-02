import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext'; // Using singular 'context' as per your import
import { saveChatMessage } from '../../firebase/chatHistoryOperations';
import { MicrophoneIcon, StopIcon, PaperAirplaneIcon, Cog6ToothIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline'; // Added more icons
import { SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/solid';


const VoiceChat = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false); // For AI text-to-speech
  const { currentUser } = useAuth();
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const utteranceRef = useRef(null); // For text-to-speech

  // Improved Speech Recognition Logic from previous response
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

        recognitionRef.current.onend = () => {
          // This is called when recognition stops (either manually or due to an error/timeout)
          // If it stopped and wasn't a manual stop by the user, ensure isListening is false.
          // setIsListening(false); // Be cautious with this, might conflict with toggleListening
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
        window.speechSynthesis.cancel(); // Cancel any ongoing speech
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
    setError(''); // Clear previous errors

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      if (transcript.trim()) {
        // Automatically send the message when stopped if there's content.
        // This behavior might be preferable over requiring another click.
        handleSendMessage(transcript);
      }
    } else {
      setTranscript(''); // Clear previous transcript
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
    if (isSpeaking) { // If already speaking, cancel previous
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
      id: `user-${Date.now()}`, // Temporary ID for UI key
      text: textToSubmit,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setTranscript(''); // Clear input transcript
    setIsProcessing(true);

    try {
      const userMessageForDb = {
        text: userMessage.text,
        sender: 'user', // 'user' or 'bot'
        timestamp: userMessage.timestamp, // Consistent timestamp
        pinned: false
      };
      // Corrected call to saveChatMessage:
      await saveChatMessage(currentUser.uid, userMessageForDb, false); // isEducator = false for student

      // Simulate AI response
      // In a real app, this would be an API call:
      // const aiTextResponse = await getAiResponse(userMessage.text);
      const aiTextResponse = `I received: "${userMessage.text}". I'm a friendly assistant here to help. How can I assist you further with your studies today?`;

      const aiResponseMessage = {
        id: `ai-${Date.now()}`, // Temporary ID for UI key
        text: aiTextResponse,
        sender: 'assistant',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiResponseMessage]);
      speakText(aiTextResponse); // Speak the AI response

      const aiMessageForDb = {
        text: aiResponseMessage.text,
        sender: 'bot', // 'bot' for AI/assistant
        timestamp: aiResponseMessage.timestamp,
        pinned: false
      };
      // Corrected call to saveChatMessage:
      await saveChatMessage(currentUser.uid, aiMessageForDb, false);

    } catch (e) {
      console.error('Error sending message:', e);
      setError('Sorry, there was an error processing your message. ' + e.message);
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        text: 'Error: Could not process the message.',
        sender: 'assistant',
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100 font-sans">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-md p-4 border-b border-slate-700 shadow-lg flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-sky-400">Sparky Voice Assist</h1>
          <p className="text-sm text-slate-400">Your AI Study Companion</p>
        </div>
        {/* Placeholder for settings or user avatar */}
        <button className="p-2 rounded-full hover:bg-slate-700 transition-colors">
          <Cog6ToothIcon className="w-6 h-6 text-slate-400"/>
        </button>
      </header>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/20 border-l-4 border-red-500 text-red-300 p-3 mx-4 mt-2 rounded-md text-sm" role="alert">
          <p><span className="font-bold">Error:</span> {error}</p>
        </div>
      )}

      {/* Messages Container */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 scroll-smooth">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-end ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.sender === 'assistant' && (
                 <img src="/sparky-avatar.png" alt="AI" className="w-8 h-8 rounded-full mr-2 mb-1 border-2 border-sky-500/50 self-start" onError={(e) => e.currentTarget.style.display='none'}/>
            )}
            <div
              className={`max-w-[75%] md:max-w-[65%] rounded-xl p-3 shadow-md relative ${
                message.sender === 'user'
                  ? 'bg-sky-600 text-white rounded-br-none'
                  : 'bg-slate-700 text-slate-200 rounded-bl-none'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
              <span className={`text-xs opacity-60 mt-1.5 block ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
             {message.sender === 'user' && (
                 <img src={currentUser?.photoURL || "/default-user.png"} alt="User" className="w-8 h-8 rounded-full ml-2 mb-1 border-2 border-slate-500/50 self-start" onError={(e) => e.currentTarget.style.display='none'}/>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} /> {/* Anchor for scrolling */}
      </main>

      {/* Input Area */}
      <footer className="bg-slate-800/50 backdrop-blur-md p-3 md:p-4 border-t border-slate-700 shadow-up">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleListening}
            title={isListening ? "Stop listening" : "Start listening"}
            className={`p-3 rounded-full transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 flex items-center justify-center ${
              isListening
                ? 'bg-red-500 hover:bg-red-600 focus:ring-red-400 animate-pulse_bg_red'
                : 'bg-sky-500 hover:bg-sky-600 focus:ring-sky-400'
            } text-white shadow-lg`}
            disabled={isProcessing}
          >
            {isListening ? (
              <StopIcon className="w-6 h-6" />
            ) : (
              <MicrophoneIcon className="w-6 h-6" />
            )}
          </button>

          <div className="flex-1 bg-slate-700/80 rounded-lg p-3 min-h-[52px] text-slate-300 italic text-sm flex items-center">
            {isListening && !transcript.trim() && <span className="animate-pulse">Listening...</span>}
            {transcript || (!isListening ? 'Click the mic or type your message...' : '')}
          </div>
          
          {isSpeaking ? (
             <button
                onClick={stopSpeaking}
                title="Stop speaking"
                className="p-3 rounded-full bg-amber-500 hover:bg-amber-600 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-800 shadow-lg"
            >
                <SpeakerXMarkIcon className="w-6 h-6" />
            </button>
          ) : (
             <button
                onClick={() => {
                    const lastAiMessage = messages.filter(m => m.sender === 'assistant').pop();
                    if (lastAiMessage) speakText(lastAiMessage.text);
                }}
                title="Speak last AI response"
                disabled={!messages.some(m => m.sender === 'assistant')}
                className="p-3 rounded-full bg-teal-500 hover:bg-teal-600 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-slate-800 shadow-lg disabled:bg-slate-600 disabled:cursor-not-allowed"
            >
                <SpeakerWaveIcon className="w-6 h-6" />
            </button>
          )}


          <button
            onClick={() => handleSendMessage(transcript)}
            disabled={!transcript.trim() || isProcessing || isListening}
            title="Send message"
            className={`p-3 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 ${
              transcript.trim() && !isProcessing && !isListening
                ? 'bg-green-500 hover:bg-green-600 focus:ring-green-400'
                : 'bg-slate-600 cursor-not-allowed'
            } text-white shadow-lg`}
          >
            <PaperAirplaneIcon className="w-6 h-6" />
          </button>
        </div>
      </footer>
       <style jsx="jsx" global="global">{`
        .scroll-smooth {
          scroll-behavior: smooth;
        }
        .shadow-up {
          box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1), 0 -2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .animate-pulse_bg_red {
          animation: pulse_bg_red 1.5s infinite;
        }
        @keyframes pulse_bg_red {
          0%, 100% { background-color: #ef4444; } /* red-500 */
          50% { background-color: #dc2626; } /* red-600 */
        }
        /* Basic scrollbar styling for webkit browsers */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #1e293b; /* slate-800 */
        }
        ::-webkit-scrollbar-thumb {
          background: #334155; /* slate-700 */
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #475569; /* slate-600 */
        }
      `}</style>
    </div>
  );
};

export default VoiceChat;