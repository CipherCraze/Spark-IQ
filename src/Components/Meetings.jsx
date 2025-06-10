
import React, { useState } from 'react';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import { motion, AnimatePresence } from 'framer-motion';
import {
  VideoCameraIcon,
  UserCircleIcon,
  HomeIcon,
  FolderIcon,
  ClipboardDocumentIcon,
  ChartBarIcon,
  DocumentTextIcon,
  PresentationChartLineIcon,
  DocumentMagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon,
  LightBulbIcon,
  NewspaperIcon,
  WrenchScrewdriverIcon,
  EnvelopeIcon,
  SparklesIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

// --- Student Menu Definition ---
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
  { title: 'Chat Platform', Icon: ChatBubbleLeftRightIcon, link: '/chat-functionality', description: "Connect with peers." },
  { title: 'My Inbox', Icon: EnvelopeIcon, link: '/inbox-for-suggestions', description: "Messages & suggestions." },
  { title: 'Upgrade to Pro', Icon: SparklesIcon, link: '/pricing', special: true, description: "Unlock premium features." },
];

const Meetings = () => {
  const [roomName, setRoomName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const isDesktop = useMediaQuery({ minWidth: 768 });

  React.useEffect(() => {
    if (isDesktop) {
      setIsSidebarOpen(true);
    } else {
      setIsSidebarOpen(false);
    }
  }, [isDesktop]);

  const joinMeeting = () => {
    if (!roomName.trim()) {
      alert('Please enter a room name');
      return;
    }
    if (!displayName.trim()) {
      alert('Please enter your name');
      return;
    }
    setIsJoining(true);
  };

  const handleApiReady = (apiObj) => {
    apiObj.addEventListeners({
      videoConferenceJoined: () => {
        console.log('Participant joined the meeting');
      },
      participantJoined: () => {
        console.log('New participant joined');
      },
    });
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
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-gray-700/50 transition-colors"
                >
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

      <div className="flex-1 flex flex-col overflow-hidden md:ml-64">
        {!isDesktop && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="fixed left-4 top-4 z-40 p-2 bg-gray-800/80 backdrop-blur-sm rounded-lg hover:bg-gray-700 transition-colors shadow-lg"
          >
            <Bars3Icon className="w-6 h-6 text-gray-300" />
          </button>
        )}
        {isJoining ? (
          <div className="h-screen bg-gray-900">
            <JitsiMeeting
              domain="meet.jit.si"
              roomName={roomName}
              displayName={displayName}
              configOverwrite={{
                startWithAudioMuted: true,
                disableModeratorIndicator: true,
                startScreenSharing: false,
                enableEmailInStats: false,
                prejoinPageEnabled: false,
              }}
              interfaceConfigOverwrite={{
                DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
                TOOLBAR_BUTTONS: [
                  'microphone',
                  'camera',
                  'closedcaptions',
                  'desktop',
                  'fullscreen',
                  'fodeviceselection',
                  'hangup',
                  'profile',
                  'chat',
                  'recording',
                  'shortcuts',
                  'tileview',
                  'select-background',
                  'download',
                  'help',
                  'security',
                ],
              }}
              getIFrameRef={(iframeRef) => {
                iframeRef.style.height = '100%';
                iframeRef.style.width = '100%';
              }}
              onApiReady={handleApiReady}
            />
          </div>
        ) : (
          <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
              <div className="flex items-center justify-center mb-6">
                <VideoCameraIcon className="w-12 h-12 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-blue-400 mb-6 text-center">Join a Meeting</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-blue-300 mb-2 flex items-center">
                    <UserCircleIcon className="w-5 h-5 mr-2" />
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-blue-300 mb-2 flex items-center">
                    <VideoCameraIcon className="w-5 h-5 mr-2" />
                    Room Name
                  </label>
                  <input
                    type="text"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter room name"
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={joinMeeting}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center"
                  >
                    <VideoCameraIcon className="w-5 h-5 mr-2" />
                    Join Meeting
                  </button>
                  <button
                    onClick={() => navigate('/host')}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
                  >
                    Host Meeting
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
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
      `}</style>
    </div>
  );
};

export default Meetings;
