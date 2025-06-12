import React, { useState, useEffect, useRef } from 'react'; // Added useRef
import { JitsiMeeting } from '@jitsi/react-sdk';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Added Link, useLocation
import { auth, db } from '../firebase/firebaseConfig'; // Import auth and db
import { signOut, onAuthStateChanged } from 'firebase/auth'; // Import auth functions
import { getUserProfile } from '../firebase/userOperations'; // Assuming this path is correct

import {
  VideoCameraIcon, // Used for main heading and menu
  UserCircleIcon, // Profile icon
  AcademicCapIcon, // From menu
  ChartBarIcon, // From menu
  ChatBubbleLeftRightIcon, // From menu
  ClipboardDocumentIcon, // From menu
  Cog6ToothIcon, // Settings icon
  DocumentMagnifyingGlassIcon, // From menu
  EnvelopeIcon, // From menu
  FolderIcon, // From menu
  GlobeAltIcon, // Used for main logo
  MegaphoneIcon, // From menu
  PresentationChartLineIcon, // From menu
  XMarkIcon, // Close icon for mobile sidebar
  SparklesIcon, // Used for Upgrade/AI Questions
  Bars3Icon, // Hamburger icon
  ChevronLeftIcon, // Desktop sidebar toggle
  ArrowLeftOnRectangleIcon, // Logout icon
  BellIcon, // Notifications icon
  ChevronDownIcon, // Profile dropdown chevron
} from '@heroicons/react/24/outline';

import { UserGroupIcon as SolidUserGroupIcon } from '@heroicons/react/24/solid'; // From menu

// --- Educator Sidebar Menu Definition (from EducatorDashboard) ---
const educatorSidebarMenu = [
  { title: 'Dashboard', Icon: PresentationChartLineIcon, link: '/educator-dashboard' },
  { title: 'Assignments', Icon: ClipboardDocumentIcon, link: '/assignment-management' },
  { title: 'Tests', Icon: ClipboardDocumentIcon, link: '/teacher-tests' },
  { title: 'Grades & Analytics', Icon: AcademicCapIcon, link: '/GradesAndAnalytics' },
  { title: 'Resources', Icon: FolderIcon, link: '/resource-management' },
  { title: 'Attendance', Icon: ChartBarIcon, link: '/attendance-tracking' },
  { title: 'Teacher Insights', Icon: DocumentMagnifyingGlassIcon, link: '/personalized-feedback-educators', description: "Get AI-powered feedback on your teaching activity." },
  { title: 'Voice Chat', Icon: ChatBubbleLeftRightIcon, link: '/teacher-voice-chat' },
  { title: 'AI Chatbot (Ask Sparky)', Icon: ChatBubbleLeftRightIcon, link: '/chatbot-education' },
  { title: 'AI Questions', Icon: SparklesIcon, link: '/ai-generated-questions-educator' },
  { title: 'Social / Chat', Icon: SolidUserGroupIcon, link: '/chat-functionality' },
  { title: 'Educational News', Icon: GlobeAltIcon, link: '/educational-news-educator' },
  { title: 'Student Suggestions', Icon: EnvelopeIcon, link: '/suggestions-to-students' },
  { title: 'Meetings & Conferences', Icon: VideoCameraIcon, link: '/meeting-host', current: true }, // Set current: true for this page
  { title: 'Announcements', Icon: MegaphoneIcon, link: '/announcements' },
  { title: 'Upgrade to Pro', Icon: SparklesIcon, link: '/pricing', special: true },
];

const MeetingHost = () => {
  const [roomName, setRoomName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isMeetingStarted, setIsMeetingStarted] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // For active sidebar link

  // State for sidebar, profile, auth (copied from EducatorDashboard)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Default to open for desktop feel
  const [educator, setEducator] = useState(null);
  const [isLoadingEducator, setIsLoadingEducator] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false); // For profile dropdown

  // Refs for profile dropdown
  const profileMenuRef = useRef(null);
  const profileButtonRef = useRef(null);

   // Toast message state (optional, for alerts like "name copied")
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('info'); // 'info', 'success', 'error'

  const showToast = (message, type = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000); // Hide after 3 seconds
  };


  const generateRoomName = () => {
     // Use a slightly more descriptive prefix perhaps? Or keep random.
    return `eduspark-meeting-${Math.random().toString(36).substring(2, 10)}`; // Shorter random part
  };

  // Effect for authentication and fetching user profile (Copied from Dashboard)
   useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Automatically set display name to user's display name or email if available
        setDisplayName(user.displayName || user.email || '');
        try {
          setIsLoadingEducator(true);
          const profileData = await getUserProfile(user.uid);
          if (profileData) {
            setEducator(profileData);
             // Update display name with profile name if available
             setDisplayName(profileData.name || profileData.displayName || user.displayName || user.email || '');
          } else {
             const basicProfile = { uid: user.uid, email: user.email, name: user.displayName || "Educator", role: 'educator' };
             setEducator(basicProfile);
          }
        } catch (error) {
          console.error('Error fetching educator profile:', error);
        } finally {
          setIsLoadingEducator(false);
        }
      } else {
        setEducator(null);
        setIsLoadingEducator(false);
        navigate('/login'); // Redirect if not authenticated
      }
    });

     // Generate room name only once on component mount
     setRoomName(generateRoomName());


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
    };
  }, [navigate, isProfileOpen]); // Depend on navigate and isProfileOpen


  const startMeeting = () => {
    if (displayName.trim()) {
      setIsMeetingStarted(true);
    } else {
      showToast('Please enter your name to start the meeting.', 'error');
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
       showToast('Logout failed.', 'error'); // Display logout error
    }
  };


  const handleApiReady = (apiObj) => {
     // Jitsi Meet API events documentation: https://jitsi.github.io/handbook/docs/dev-guide/iframe-api
    apiObj.addEventListeners({
      videoConferenceJoined: () => {
        console.log('Host joined the meeting');
        // Optional: update meeting status in DB, log join event etc.
      },
      participantJoined: (participant) => {
        console.log('New participant joined:', participant);
         // Optional: show a notification, log participant details
      },
      participantLeft: (participant) => {
        console.log('Participant left:', participant);
        // Optional: show a notification, log participant details
      },
      readyToClose: () => {
        console.log('Meeting is ready to close');
        // This event fires when Jitsi thinks the meeting should end
        // You might want to navigate away or show a "Meeting Ended" screen
        setIsMeetingStarted(false); // Return to the start screen
        setRoomName(generateRoomName()); // Generate a new room name for the next meeting
        showToast('Meeting ended.', 'info'); // Notify user
        // Optional: clean up any meeting related data in DB
      },
      // Add other events as needed (e.g., audioMuteStatusChanged, videoMuteStatusChanged, etc.)
    });

    // Optional: Get the participant ID for the host
    apiObj.executeCommand('displayName', displayName); // Ensure name is set
    apiObj.executeCommand('subject', `EduSpark Meeting: ${roomName}`); // Set meeting subject
     apiObj.executeCommand('avatarUrl', educator?.avatar || ''); // Set avatar if available

    // You can get the host's participant ID here if needed for moderator actions
    // apiObj.getCurrentDevices().then(devices => console.log("Current devices:", devices));
  };

  const jitsiContainerStyle = {
    width: '100%',
    height: '100%', // Occupy full height of parent flex item
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
                Meetings & Conferences
              </h1>
              <p className="text-slate-400 text-sm sm:text-base">Host secure video calls with your students or colleagues.</p>
            </div>
          </div>

          {/* Profile/Notifications */}
          <div className="flex items-center gap-3 sm:gap-4">
             {/* Notifications button (dummy for now) */}
            <div className="relative">
              <button
                // onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} // Add state and logic if needed
                className="p-2.5 hover:bg-slate-700/50 rounded-full transition-colors relative focus:outline-none focus:ring-2 focus:ring-purple-500"
                aria-label="Notifications"
              >
                <BellIcon className="w-6 h-6 text-slate-400 hover:text-slate-200" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-800 animate-pulse"></span> {/* Dummy notification indicator */}
              </button>
               {/* Notification Dropdown (add logic if needed) */}
            </div>
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

        {/* Main Content Area - Conditional Rendering */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8"> {/* flex-1 allows it to fill the remaining height */}
          {!isMeetingStarted ? (
             <div className="bg-slate-800/60 backdrop-blur-lg p-6 sm:p-8 rounded-xl shadow-xl w-full max-w-md border border-slate-700/50">
              <div className="flex items-center justify-center mb-6">
                <div className="p-4 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full shadow-lg">
                   <VideoCameraIcon className="w-10 h-10 text-white" />
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-purple-400 mb-6 text-center">Start a Meeting</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2 flex items-center">
                    <UserCircleIcon className="w-5 h-5 mr-2 text-slate-400" />
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 placeholder-slate-500 transition-colors"
                    placeholder="Enter your name"
                    disabled={isLoadingEducator}
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2 flex items-center">
                    <VideoCameraIcon className="w-5 h-5 mr-2 text-slate-400" />
                    Room Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={roomName}
                      readOnly
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-slate-300 rounded-lg outline-none cursor-copy select-text" // Allow selecting text
                    />
                    <button
                      type="button" // Specify type button to prevent form submission
                      onClick={() => {
                        navigator.clipboard.writeText(`https://meet.jit.si/${roomName}`); // Copy full URL
                         showToast('Meeting link copied to clipboard!', 'success');
                      }}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-md transition-colors font-medium"
                    >
                      Copy Link
                    </button>
                  </div>
                </div>
                <div className="flex space-x-4">
                   <button
                    onClick={startMeeting}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                     disabled={!displayName.trim() || isLoadingEducator}
                  >
                    <VideoCameraIcon className="w-5 h-5 mr-2" />
                    Start Meeting
                  </button>
                  {/* Assuming a separate "Join Meeting" page exists */}
                  <Link
                    to="/meetings" // Link to your Join Meeting page
                    className="flex-1 bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center text-center"
                  >
                    Join Instead
                  </Link>
                </div>
                 {/* Optional: Add info text about Jitsi */}
                 <p className="text-center text-xs text-slate-500 mt-4">
                    Powered by Jitsi Meet. Secure, open-source video conferencing.
                 </p>
              </div>
            </div>
          ) : (
             // Jitsi Meeting Embed
             <div className="flex-1 w-full h-full"> {/* flex-1 added here to make it fill the parent */}
              <JitsiMeeting
                domain="meet.jit.si" // Your Jitsi domain
                roomName={roomName}
                displayName={displayName}
                configOverwrite={{
                  startWithAudioMuted: true,
                  startWithVideoMuted: false, // Often prefer video on for meetings
                  disableModeratorIndicator: true,
                  startScreenSharing: false,
                  enableEmailInStats: false,
                  prejoinPageEnabled: false, // We use our own start screen
                   // Add JWT token here if using a secured Jitsi deployment
                   // jwt: yourJWTToken,
                }}
                interfaceConfigOverwrite={{
                  DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
                   SHOW_JITSI_WATERMARK: false, // Optional: hide watermark
                   SHOW_WATERMARK_FOR_GUESTS: false,
                   SHOW_POWERED_BY: false, // Optional: hide powered by
                   TOOLBAR_ALWAYS_VISIBLE: true,
                   TILE_VIEW_MAX_COLUMNS: 5,
                  TOOLBAR_BUTTONS: [
                    'microphone', 'camera', 'desktop', 'fullscreen',
                    'fodeviceselection', 'hangup', 'profile', 'chat',
                    'recording', 'tileview', 'select-background',
                    // Removed buttons less common for basic teacher use or potentially sensitive
                    // 'closedcaptions', 'shortcuts', 'download', 'help', 'mute-everyone', 'security',
                    'toggle-raise-hand', // Useful for Q&A
                    'participants-pane', // Show participant list
                  ],
                }}
                userInfo={{ // Pass user info explicitly
                   displayName: displayName,
                   email: educator?.email || '', // Optional: user email
                   avatarUrl: educator?.avatar || '', // Optional: user avatar URL
                }}
                getIFrameRef={(iframeRef) => {
                   if (iframeRef) {
                      iframeRef.style.height = '100%';
                      iframeRef.style.width = '100%';
                      iframeRef.style.border = 'none'; // Remove default border
                   }
                }}
                onApiReady={handleApiReady}
                onDispose={() => {
                   console.log('Jitsi meeting iframe removed');
                   // This might not always fire reliably depending on how the component is unmounted
                   // The 'readyToClose' event inside the iframe is more reliable for meeting end.
                }}
                // onError={(error) => console.error('Jitsi Error:', error)} // Add error handler
              />
             </div>
          )}
        </div>
      </main>

       {/* Toast Message */}
      {toastMessage && (
          <div className={`fixed bottom-5 right-5 sm:bottom-8 sm:right-8 px-5 py-3 rounded-lg shadow-2xl z-[80] flex items-center gap-3 border backdrop-blur-sm
               ${toastType === 'success' ? 'bg-emerald-500/90 border-emerald-400 text-white' :
                 toastType === 'error' ? 'bg-red-500/90 border-red-400 text-white' :
                 'bg-blue-500/90 border-blue-400 text-white'
               }`}
          >
          {/* Icon can be added based on toastType */}
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className={`ml-2 ${toastType === 'success' ? 'text-emerald-100 hover:text-white' : toastType === 'error' ? 'text-red-100 hover:text-white' : 'text-blue-100 hover:text-white'}`}>
            <XMarkIcon className="w-5 h-5"/>
          </button>
          </div>
      )}

       {/* Global styles for custom scrollbar - ensure these are added once globally or here */}
       <style jsx global>{`
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: rgba(15, 23, 42, 0.5); } /* dark slate background */
        ::-webkit-scrollbar-thumb { background: #475569; border-radius: 4px; } /* lighter slate thumb */
        ::-webkit-scrollbar-thumb:hover { background: #64748b; } /* even lighter on hover */

        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } /* Match sidebar background */
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #6b7280; }
      `}</style>

    </div>
  );
};

export default MeetingHost;