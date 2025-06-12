import { useState, useEffect, useRef } from 'react'; // Added useEffect, useRef
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Added useLocation, useNavigate
import { auth, db } from '../../firebase/firebaseConfig'; // Import auth and db
import { signOut, onAuthStateChanged } from 'firebase/auth'; // Import auth functions
import { getUserProfile } from '../../firebase/userOperations'; // Assuming this path is correct

// Import Firestore functions if saving suggestions to DB
import { collection, addDoc } from 'firebase/firestore';
// Import Storage functions if saving attachments to Storage
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';


import {
  PaperClipIcon,
  XMarkIcon,
  DocumentTextIcon,
  ArrowUpTrayIcon,
  SparklesIcon, // Used for main logo/Upgrade
  AcademicCapIcon, // Used for main heading
  PresentationChartLineIcon, // From menu
  ClipboardDocumentIcon, // From menu
  FolderIcon, // From menu
  ChartBarIcon, // From menu
  ChatBubbleLeftRightIcon, // From menu
  DocumentMagnifyingGlassIcon, // From menu
  GlobeAltIcon, // Used for main logo (alternative)
  EnvelopeIcon, // From menu
  VideoCameraIcon, // From menu
  MegaphoneIcon, // From menu
  Bars3Icon, // Hamburger icon
  ChevronLeftIcon, // Desktop sidebar toggle
  UserCircleIcon, // Profile icon
  Cog6ToothIcon, // Settings icon
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
  { title: 'Educational News', Icon: GlobeAltIcon, link: '/educational-news' },
  { title: 'Student Suggestions', Icon: EnvelopeIcon, link: '/suggestions-to-students', current: true }, // Set current: true for this page
  { title: 'Meetings & Conferences', Icon: VideoCameraIcon, link: '/meeting-host' },
  { title: 'Announcements', Icon: MegaphoneIcon, link: '/announcements' },
  { title: 'Upgrade to Pro', Icon: SparklesIcon, link: '/pricing', special: true },
];


const SuggestionsToStudents = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  // State for sidebar, profile, auth (copied from EducatorDashboard)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Default to open for desktop feel
  const location = useLocation(); // For active sidebar link
  const navigate = useNavigate(); // For navigation (e.g., logout)

  // State for user profile (for header)
  const [educator, setEducator] = useState(null);
  const [isLoadingEducator, setIsLoadingEducator] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false); // For profile dropdown

  // Refs for profile dropdown
  const profileMenuRef = useRef(null);
  const profileButtonRef = useRef(null);

   // Toast Message States
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);

  // Effect for authentication and fetching user profile (Copied from Dashboard)
   useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
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
    };
  }, [navigate, isProfileOpen]); // Depend on navigate and isProfileOpen

  // Function to display toast messages
   const displayMessage = (type, message) => {
      if (type === 'success') {
         setSubmitSuccess(message);
         setSubmitError(null);
      } else {
         setSubmitError(message);
         setSubmitSuccess(null);
      }
      setTimeout(() => {
         setSubmitSuccess(null);
         setSubmitError(null);
      }, 5000); // Hide after 5 seconds
   };


  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    // Prevent adding duplicate file names (basic check)
    const newValidFiles = files.filter(f => !attachments.some(att => att.name === f.name));

     if (files.length !== newValidFiles.length) {
        displayMessage('error', 'Some files were not added because names already exist.');
     }

    setAttachments([...attachments, ...newValidFiles.map(f => ({
      name: f.name,
      size: f.size,
      type: f.type,
      fileObject: f // Keep the File object for upload
    }))]);
  };

  const removeAttachment = (fileName) => {
    setAttachments(prev => prev.filter(file => file.name !== fileName));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null); // Clear previous errors
    setSubmitSuccess(null); // Clear previous success

    if (!title.trim() || !description.trim()) {
      displayMessage('error', 'Please fill out both the title and description fields.');
      return;
    }

    if (!auth.currentUser) {
       displayMessage('error', 'You must be logged in to submit suggestions.');
       return;
    }


    setIsSubmitting(true);
    let uploadedFileUrls = [];

    try {
      // 1. Upload attachments to Firebase Storage
      if (attachments.length > 0) {
         const uploadPromises = attachments.map(async (attachment) => {
            const uniqueFileName = `${Date.now()}_${attachment.name.replace(/\s+/g, '_')}`;
            const storageRef = ref(storage, `suggestions/${auth.currentUser.uid}/${uniqueFileName}`);
            await uploadBytes(storageRef, attachment.fileObject);
            return getDownloadURL(storageRef);
         });
         uploadedFileUrls = await Promise.all(uploadPromises);
      }

      // 2. Save suggestion details to Firestore
      const suggestionData = {
        teacherId: auth.currentUser.uid,
        teacherName: educator?.name || auth.currentUser.displayName || 'Teacher',
        teacherEmail: auth.currentUser.email,
        title: title.trim(),
        description: description.trim(),
        attachmentUrls: uploadedFileUrls,
        createdAt: new Date().toISOString(),
        status: 'submitted', // e.g., 'submitted', 'under review', 'implemented', 'rejected'
        // Add fields like assignedTo (admin?), response, etc. if needed
      };

      await addDoc(collection(db, 'suggestions'), suggestionData);

      // Clear form after successful submission
      setTitle('');
      setDescription('');
      setAttachments([]);

      displayMessage('success', 'Suggestion submitted successfully! Thank you for your feedback.');

    } catch (error) {
      console.error('Error submitting suggestion:', error);
      displayMessage('error', `Failed to submit suggestion: ${error.message}. Please try again.`);
       // Optional: Clean up uploaded files if Firestore save fails? Or rely on a background cleanup process.
       // For simplicity here, we won't delete files if Firestore fails.
    } finally {
      setIsSubmitting(false);
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
      <main className={`flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto transition-all duration-300 ${
        isSidebarOpen ? 'lg:ml-64' : 'ml-0' // Adjust margin for desktop sidebar
      }`}>
         {/* Header (Copied from EducatorDashboard Header) */}
        <header className="flex justify-between items-center mb-8 sm:mb-12">
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
                Student Suggestions
              </h1>
              <p className="text-slate-400 text-sm sm:text-base">Share ideas or feedback with the development team.</p>
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


         {/* Main Content Area */}
        <div className="max-w-4xl mx-auto">
          {/* Heading (Already styled, slightly adjusted margin-top) */}
          {/* Note: This heading is duplicated. The one in <header> is standard.
                     Keeping this one here to match the *original* component layout
                     within its container, but ideally you'd use only the header one.
                     Commenting out the one below to prioritize the header standard.
           */}
          {/* <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg shadow-lg">
              <AcademicCapIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
              Send New Suggestion
            </h1>
          </div> */}


          {/* Form Container */}
          <form onSubmit={handleSubmit} className="space-y-6 pt-5"> {/* Added pt-5 to adjust spacing under the header */}
            <div className="bg-slate-800/60 backdrop-blur-lg rounded-xl border border-slate-700/50 p-6 sm:p-8 shadow-xl">
              <div className="space-y-6 sm:space-y-8">
                {/* Title Input */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-2">
                    Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:ring-purple-500 focus:border-purple-500 transition-colors outline-none"
                    placeholder="Enter suggestion title (e.g., Feature Request: Dark Mode Toggle)"
                    required
                  />
                </div>

                {/* Description Input */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">
                    Description <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 min-h-[200px] focus:ring-purple-500 focus:border-purple-500 transition-colors outline-none resize-y custom-scrollbar"
                    placeholder="Provide detailed description of your suggestion, including why it's helpful and how it could work..."
                    required
                  />
                </div>

                {/* File Attachments */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Attachments (Optional)
                  </label>
                  <div className="space-y-4">
                    <label htmlFor="file-upload" className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 border border-slate-600/50 text-slate-300 rounded-lg hover:bg-slate-700/70 hover:border-purple-500/50 transition-all cursor-pointer group">
                       <ArrowUpTrayIcon className="w-5 h-5 text-slate-400 group-hover:text-purple-300" />
                      <span className="font-medium text-sm group-hover:text-purple-300">Attach Files</span>
                      <input
                        type="file"
                        id="file-upload" // Connects label to input
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        multiple
                        accept=".pdf,.doc,.docx,.jpg,.png,.zip" // Specify accepted file types
                      />
                    </label>

                    {attachments.length > 0 && (
                      <div className="space-y-2">
                         <p className="text-xs text-slate-400">Attached files:</p>
                        {attachments.map((file, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-3 p-3 bg-slate-700/60 rounded-lg border border-slate-600/50 shadow-inner"
                          >
                            <DocumentTextIcon className="w-5 h-5 text-slate-500" />
                            <span className="text-sm text-slate-300 truncate flex-1" title={file.name}>
                              {file.name} ({Math.round(file.size / 1024)} KB)
                            </span>
                            <button
                              type="button"
                              onClick={() => removeAttachment(file.name)}
                              className="p-1 hover:bg-red-500/20 rounded-full transition-colors text-red-400"
                              aria-label={`Remove attachment ${file.name}`}
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isSubmitting || !title.trim() || !description.trim() || isLoadingEducator} // Disable if title/desc empty or loading user
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                 {isSubmitting ? (
                   <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                   </>
                 ) : (
                   <>
                      <SparklesIcon className="w-5 h-5" /> {/* Using Sparkles as a 'suggest/idea' icon */}
                      Send Suggestion
                   </>
                 )}
              </button>
            </div>
          </form>
        </div>
      </main>

       {/* Toast Messages */}
        {submitSuccess && (
            <div className="fixed bottom-5 right-5 sm:bottom-8 sm:right-8 bg-emerald-500/90 backdrop-blur-sm text-white px-5 py-3 rounded-lg shadow-2xl z-[80] flex items-center gap-3 border border-emerald-400">
            <CheckCircleIcon className="w-6 h-6" />
            <span>{submitSuccess}</span>
            <button onClick={() => setSubmitSuccess(null)} className="ml-2 text-emerald-100 hover:text-white"><XMarkIcon className="w-5 h-5"/></button>
            </div>
        )}
        {submitError && (
            <div className="fixed bottom-5 right-5 sm:bottom-8 sm:right-8 bg-red-500/90 backdrop-blur-sm text-white px-5 py-3 rounded-lg shadow-2xl z-[80] flex items-center gap-3 border border-red-400">
            <ExclamationTriangleIcon className="w-6 h-6" />
            <span>{submitError}</span>
            <button onClick={() => setSubmitError(null)} className="ml-2 text-red-100 hover:text-white"><XMarkIcon className="w-5 h-5"/></button>
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

export default SuggestionsToStudents;