import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Added Link, useLocation, useNavigate
import { auth, db, storage } from '../../firebase/firebaseConfig'; // Import auth, db, storage
import { signOut, onAuthStateChanged } from 'firebase/auth'; // Import auth functions
import { getUserProfile } from '../../firebase/userOperations'; // Assuming this path is correct

// Import Firestore functions
import { collection, addDoc, getDocs, query, where, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
// Import Storage functions
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';


import {
  MegaphoneIcon, // Used for Announcements title, menu
  PlusIcon, // New button
  CalendarIcon, // Icon for date in list
  TagIcon, // Icon for target in list
  PaperClipIcon, // Icon for attachments in list
  PencilIcon, // Edit icon
  TrashIcon, // Delete icon
  XMarkIcon, // Close modal/sidebar icon
  ChevronDownIcon, // Profile dropdown
  SparklesIcon, // Used for main logo (alt)/Upgrade/Pinned icon/AI Questions
  UserGroupIcon, // Used for Social/Chat menu
  AcademicCapIcon, // Used for Stats card / Grades menu
  UserGroupIcon as SolidUserGroupIcon, // From menu / Stats card
  Bars3Icon, // Hamburger icon
  ChevronLeftIcon, // Desktop sidebar toggle
  UserCircleIcon, // Profile icon
  Cog6ToothIcon, // Settings icon
  ArrowLeftOnRectangleIcon, // Logout icon
  BellIcon, // Notifications icon
  PresentationChartLineIcon, // Menu icon
  ClipboardDocumentIcon, // Menu icon
  FolderIcon, // Menu icon
  ChartBarIcon, // Menu icon
  ChatBubbleLeftRightIcon, // Menu icon
  DocumentMagnifyingGlassIcon, // Menu icon
  GlobeAltIcon, // Main logo icon
  EnvelopeIcon, // Menu icon
  VideoCameraIcon, // Menu icon
  CheckCircleIcon, // Toast success
  ExclamationTriangleIcon, // Toast error
  DocumentTextIcon, // Used for file attachments
} from '@heroicons/react/24/outline';

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
  { title: 'AI Chatbot ( Ask Iko )', Icon: ChatBubbleLeftRightIcon, link: '/chatbot-education' },
  { title: 'AI Questions', Icon: SparklesIcon, link: '/ai-generated-questions-educator' },
  { title: 'Social / Chat', Icon: SolidUserGroupIcon, link: '/chat-functionality' },
  { title: 'Educational News', Icon: GlobeAltIcon, link: '/educational-news-educator' },
  { title: 'Student Suggestions', Icon: EnvelopeIcon, link: '/suggestions-to-students' },
  { title: 'Meetings & Conferences', Icon: VideoCameraIcon, link: '/meeting-host' },
  { title: 'Announcements', Icon: MegaphoneIcon, link: '/announcements', current: true }, // Set current: true for this page
  { title: 'Upgrade to Pro', Icon: SparklesIcon, link: '/pricing', special: true },
];


const AnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state for fetching
  const [error, setError] = useState(null); // Error state for fetching

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // State for submitting form

  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    tags: '', // Store as string initially
    target: 'All Students',
    attachments: [] // File objects
  });
  const fileInputRef = useRef(null); // Might still need this, depending on dropzone implementation

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

  // Add state for edit mode and the announcement being edited
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingAnnouncementId, setEditingAnnouncementId] = useState(null);
  const [originalAttachmentUrls, setOriginalAttachmentUrls] = useState([]); // For keeping track of existing attachments in edit mode

   // Effect for authentication and fetching user profile (Copied from Dashboard)
   useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          setIsLoadingEducator(true);
          const profileData = await getUserProfile(user.uid); // Assuming getUserProfile fetches from 'users' or 'educators'
          if (profileData) {
            setEducator(profileData);
          } else {
             const basicProfile = { uid: user.uid, email: user.email, name: user.displayName || "Educator", role: 'educator' };
             setEducator(basicProfile);
          }
           fetchAnnouncements(); // Fetch announcements once user is known
        } catch (error) {
          console.error('Error fetching educator profile or announcements:', error);
           // Decide how to handle profile fetch error (e.g., show generic user data, redirect)
           setError('Failed to load profile or announcements.'); // Set a general error message
           navigate('/login'); // Redirect on severe error like auth failure
        } finally {
          setIsLoadingEducator(false);
        }
      } else {
        setEducator(null); // Clear educator profile on logout
        setIsLoadingEducator(false);
        setAnnouncements([]); // Clear announcements on logout
        setError(null); // Clear errors
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

    // Initial check for desktop size and resize listener
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    handleResize(); // Set initial state
    window.addEventListener('resize', handleResize);


    return () => {
        unsubscribeAuth();
        document.removeEventListener('mousedown', handleClickOutsideProfile);
        window.removeEventListener('resize', handleResize);
    };
  }, [navigate, isProfileOpen]); // Depend on navigate and isProfileOpen


  const fetchAnnouncements = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!auth.currentUser) {
         // This case should be handled by the auth useEffect, but good safeguard
        console.warn("User not authenticated during announcement fetch.");
        // setError("Authentication required to fetch announcements."); // Error handled by auth useEffect
        setLoading(false);
        return;
      }
      const announcementsRef = collection(db, 'announcements');
      // Fetch announcements created by this teacher, ordered by creation date
      const q = query(announcementsRef, where('teacherId', '==', auth.currentUser.uid), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const announcementsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Ensure date fields are Date objects if needed, or just parse as strings
        date: doc.data().createdAt, // Assuming createdAt is stored as ISO string
        attachmentsCount: doc.data().attachmentUrls?.length || 0, // Count attachments
        // tags stored as string needs parsing if displayed as individual tags
        parsedTags: doc.data().tags ? doc.data().tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
      }));
      setAnnouncements(announcementsList);
    } catch (err) {
      console.error('Error fetching announcements:', err);
      setError('Failed to load announcements. Please try again.');
    } finally {
      setLoading(false);
    }
  };


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

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    // accept: {
    //   'application/pdf': ['.pdf'],
    //   'application/msword': ['.doc'],
    //   'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    //   'image/png': ['.png'],
    //   'image/jpeg': ['.jpg', '.jpeg'],
    // }, // Keep accept prop here for client-side validation hint
     maxSize: 50 * 1024 * 1024, // 50MB
    onDrop: acceptedFiles => {
      // Filter out duplicates by name (basic check)
       const newUniqueFiles = acceptedFiles.filter(
           (file) => !newAnnouncement.attachments.some((existingFile) => existingFile.name === file.name)
       );

       if (newUniqueFiles.length !== acceptedFiles.length) {
           displayMessage('info', 'Some files were excluded due to duplicate names.');
       }

      setNewAnnouncement(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...newUniqueFiles]
      }));
       if (fileInputRef.current) {
            fileInputRef.current.value = ''; // Clear the input after files are selected
        }
    },
     onDropRejected: (fileRejections) => {
         fileRejections.forEach(({ file, errors }) => {
             errors.forEach(err => {
                 if (err.code === 'file-too-large') {
                     displayMessage('error', `File ${file.name} is too large (max 50MB).`);
                 } else if (err.code === 'file-invalid-type') {
                     displayMessage('error', `File ${file.name} has an invalid type.`);
                 } else {
                     displayMessage('error', `Error with file ${file.name}: ${err.message}`);
                 }
             });
         });
     }
  });

  const removeAttachment = (fileName) => {
    setNewAnnouncement(prev => ({
        ...prev,
        attachments: prev.attachments.filter(file => file.name !== fileName)
    }));
     // Note: If editing, you'd need logic here to mark URLs for deletion from storage on save
  };

  const handleEditAnnouncement = (announcement) => {
    setIsEditMode(true);
    setEditingAnnouncementId(announcement.id);
    setShowCreateModal(true);
    setOriginalAttachmentUrls(announcement.attachmentUrls || []);
    setNewAnnouncement({
      title: announcement.title || '',
      content: announcement.content || '',
      tags: announcement.tags || '',
      target: announcement.target || 'All Students',
      attachments: [], // New uploads will go here
    });
  };

  const handleAnnouncementSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) {
      displayMessage('error', 'Title and Content are required fields.');
      return;
    }
    if (!auth.currentUser) {
      displayMessage('error', 'You must be logged in to publish announcements.');
      return;
    }

    setIsSubmitting(true);
    let uploadedAttachmentUrls = [...originalAttachmentUrls];

    try {
      // 1. Upload new attachments to Firebase Storage
      if (newAnnouncement.attachments.length > 0) {
        const uploadPromises = newAnnouncement.attachments.map(async (file) => {
          const uniqueFileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
          const storageRef = ref(storage, `announcements/${auth.currentUser.uid}/${uniqueFileName}`);
          await uploadBytes(storageRef, file);
          return getDownloadURL(storageRef);
        });
        const newUrls = await Promise.all(uploadPromises);
        uploadedAttachmentUrls = [...uploadedAttachmentUrls, ...newUrls];
      }

      if (isEditMode && editingAnnouncementId) {
        // 2. Update announcement in Firestore
        const announcementRef = doc(db, 'announcements', editingAnnouncementId);
        await updateDoc(announcementRef, {
          title: newAnnouncement.title.trim(),
          content: newAnnouncement.content.trim(),
          tags: newAnnouncement.tags.trim(),
          target: newAnnouncement.target,
          attachmentUrls: uploadedAttachmentUrls,
          // Optionally update editedAt: new Date().toISOString(),
        });
        displayMessage('success', 'Announcement updated successfully!');
      } else {
        // 3. Create new announcement (existing logic)
        const announcementData = {
          title: newAnnouncement.title.trim(),
          content: newAnnouncement.content.trim(),
          tags: newAnnouncement.tags.trim(),
          target: newAnnouncement.target,
          attachmentUrls: uploadedAttachmentUrls,
          teacherId: auth.currentUser.uid,
          teacherName: educator?.name || auth.currentUser.displayName || 'Teacher',
          teacherEmail: auth.currentUser.email,
          createdAt: new Date().toISOString(),
          pinned: false,
        };
        await addDoc(collection(db, 'announcements'), announcementData);
        displayMessage('success', 'Announcement published successfully!');
      }

      // Clear form and state
      setNewAnnouncement({
        title: '',
        content: '',
        tags: '',
        target: 'All Students',
        attachments: []
      });
      setShowCreateModal(false);
      setIsEditMode(false);
      setEditingAnnouncementId(null);
      setOriginalAttachmentUrls([]);
      fetchAnnouncements();
    } catch (error) {
      console.error('Error saving announcement:', error);
      displayMessage('error', `Failed to save announcement: ${error.message}.`);
    } finally {
      setIsSubmitting(false);
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
      displayMessage('error', 'Logout failed.'); // Display logout error
    }
  };

   const formatDate = (dateInput, options = { year: 'numeric', month: 'short', day: 'numeric' }) => {
    if (!dateInput) return 'N/A';
    // Assuming dateInput is an ISO string
    try {
        const date = new Date(dateInput);
        if (isNaN(date.getTime())) return 'Invalid Date';
       return date.toLocaleDateString(undefined, options);
    } catch (e) {
       console.error("Error formatting date:", e, dateInput);
       return 'Formatting Error';
    }
  };

   // Stubs for edit/delete (need full implementation)
   const handleDeleteAnnouncement = async (announcementId, attachmentUrls) => {
       if (!window.confirm('Are you sure you want to delete this announcement? This action cannot be undone.')) {
           return;
       }
       setLoading(true); // Or a separate deleting state
       try {
           // 1. Delete attachments from storage
           if (attachmentUrls && attachmentUrls.length > 0) {
               const deletePromises = attachmentUrls.map(async (url) => {
                   try {
                        const fileRef = ref(storage, url);
                       await deleteObject(fileRef);
                   } catch (storageError) {
                       console.warn(`Could not delete attachment ${url}:`, storageError);
                        // Continue even if one file fails
                   }
               });
               await Promise.all(deletePromises);
           }

           // 2. Delete announcement document from Firestore
            await deleteDoc(doc(db, 'announcements', announcementId));

           displayMessage('success', 'Announcement deleted successfully.');
           fetchAnnouncements(); // Re-fetch list
       } catch (err) {
           console.error('Error deleting announcement:', err);
           displayMessage('error', `Failed to delete announcement: ${err.message}.`);
       } finally {
           setLoading(false);
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
              IGNITIA
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
                Announcement Center
              </h1>
              <p className="text-slate-400 text-sm sm:text-base">Communicate important updates to students effectively.</p>
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


        {/* Create Announcement Button */}
         <div className="mb-8 flex justify-end">
              <button
                 onClick={() => {
                     setNewAnnouncement({ title: '', content: '', tags: '', target: 'All Students', attachments: [] }); // Reset form on open
                     setShowCreateModal(true);
                 }}
                className="flex items-center gap-2.5 px-5 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-lg shadow-md hover:shadow-lg transition-all text-sm sm:text-base font-semibold text-white"
                disabled={isLoadingEducator} // Disable if user data is still loading
              >
                <PlusIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                New Announcement
              </button>
         </div>


        {/* Stats Cards */}
        {/* Example Stats, might need real data aggregation if available */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { title: 'Total Announcements', value: Array.isArray(announcements) ? announcements.length : 0, icon: MegaphoneIcon, color: 'blue' },
            { title: 'Pinned Updates', value: Array.isArray(announcements) ? announcements.filter(a => a?.pinned).length : 0, icon: SparklesIcon, color: 'purple' },
            { title: 'Avg. Engagement', value: 'N/A', icon: UserGroupIcon, color: 'green' }, // Placeholder, needs tracking
            { title: 'Active Batches', value: 'N/A', icon: AcademicCapIcon, color: 'indigo' }, // Placeholder, needs class data
          ].map((stat, index) => (
            <div key={index} className={`bg-slate-800/60 backdrop-blur-lg p-6 rounded-xl border border-slate-700/50 shadow-lg hover:shadow-${stat.color}-500/10 hover:border-${stat.color}-500/50 transition-all duration-300 hover:-translate-y-0.5`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs sm:text-sm font-medium text-slate-400 mb-1`}>{stat.title}</p>
                  <p className="text-xl sm:text-2xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-${stat.color}-500/10`}>
                    <stat.icon className={`w-7 h-7 text-${stat.color}-400`} />
                </div>
              </div>
            </div>
          ))}
        </div>


        {/* Announcements List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {loading ? (
               <div className="lg:col-span-3 text-center text-slate-400 py-16">
                    <svg className="animate-spin h-8 w-8 text-purple-400 mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading announcements...
               </div>
           ) : error ? (
              <div className="lg:col-span-3 text-center py-16 bg-red-700/10 rounded-lg border border-dashed border-red-600/50">
                   <ExclamationTriangleIcon className="w-16 h-16 mx-auto text-red-400 mb-4" />
                   <h3 className="text-lg font-medium text-red-300">Error Loading Announcements</h3>
                   <p className="text-red-400 mt-1 text-sm">{error}</p>
              </div>
           ) : announcements.length === 0 ? (
               <div className="lg:col-span-3 text-center py-16 bg-slate-700/30 rounded-lg border border-dashed border-slate-600">
                   <MegaphoneIcon className="w-16 h-16 mx-auto text-slate-500 mb-4" />
                   <h3 className="text-lg font-medium text-slate-300">No announcements yet.</h3>
                   <p className="text-slate-400 mt-1 text-sm">Click "New Announcement" to publish your first message!</p>
               </div>
           ) : (
              announcements.map(announcement => (
                <motion.div
                  key={announcement.id}
                  whileHover={{ scale: 1.02 }}
                  className="group bg-slate-800/60 backdrop-blur-lg rounded-xl border border-slate-700/50 p-6 hover:border-purple-400/30 transition-all shadow-lg"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 pr-4"> {/* Added padding-right */}
                      <h3 className="text-xl font-semibold text-purple-300 hover:text-purple-200 transition-colors mb-2">
                        {announcement.title}
                        {announcement.pinned && (
                          <SparklesIcon className="w-5 h-5 text-amber-400 inline ml-2" title="Pinned Announcement" />
                        )}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-4 h-4 text-slate-500" />
                           {formatDate(announcement.date)} {/* Use formatDate helper */}
                        </span>
                        <span className="flex items-center gap-1">
                          <TagIcon className="w-4 h-4 text-slate-500" />
                           {announcement.target}
                        </span>
                         {announcement.teacherName && (
                             <span className="text-xs text-slate-500 italic">by {announcement.teacherName}</span>
                         )}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0"> {/* Prevent shrinking */}
                      <button
                         onClick={() => handleEditAnnouncement(announcement)}
                         className="p-1.5 hover:bg-slate-700/70 rounded-lg text-blue-400 hover:text-blue-300 transition-colors" title="Edit Announcement">
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                         onClick={() => handleDeleteAnnouncement(announcement.id, announcement.attachmentUrls)}
                         className="p-1.5 hover:bg-slate-700/70 rounded-lg text-red-400 hover:text-red-300 transition-colors" title="Delete Announcement">
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-slate-300 mb-4 line-clamp-3 min-h-[4.5em]">{announcement.content}</p> {/* Limit lines */}

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-700/50 pt-4">
                    {announcement.parsedTags?.length > 0 && (
                       <div className="flex flex-wrap gap-2">
                         {announcement.parsedTags.map(tag => (
                           <span key={tag} className="px-2.5 py-1 text-xs bg-slate-700/50 rounded-full text-blue-400 font-medium">
                             {tag}
                           </span>
                         ))}
                       </div>
                    )}

                    {announcement.attachmentsCount > 0 && (
                      <span className="flex items-center gap-1 text-slate-400 text-sm">
                        <PaperClipIcon className="w-4 h-4 text-slate-500" />
                         {announcement.attachmentsCount} file{announcement.attachmentsCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))
           )}
            {/* Message if no results after filtering/searching (not implemented yet, but good to keep in mind) */}
             {!loading && !error && announcements.length > 0 && (
                 <div className="lg:col-span-3 text-center py-10 text-slate-500">
                     No announcements match your criteria.
                 </div>
             )}
        </div>


        {/* Create Announcement Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-800 rounded-xl p-6 sm:p-8 w-full max-w-2xl mx-auto relative max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-700"
            >
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setIsEditMode(false);
                  setEditingAnnouncementId(null);
                  setOriginalAttachmentUrls([]);
                }}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                disabled={isSubmitting}
              >
                <XMarkIcon className="w-7 h-7" />
              </button>

              <h3 className="text-2xl sm:text-3xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {isEditMode ? 'Edit Announcement' : 'Create New Announcement'}
              </h3>

              <form onSubmit={handleAnnouncementSubmit} className="space-y-6">
                {/* Title */}
                <div>
                  <label htmlFor="announcement-title" className="block text-sm font-medium text-slate-300 mb-2">Title <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    id="announcement-title"
                    value={newAnnouncement.title}
                    onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                    className="w-full bg-slate-700/50 border border-slate-600 text-slate-200 rounded-lg px-4 py-3 focus:ring-purple-500 focus:border-purple-500 outline-none placeholder-slate-500 transition-colors"
                    placeholder="Enter announcement title..."
                    required
                    disabled={isSubmitting}
                  />
                </div>

                {/* Content */}
                <div>
                  <label htmlFor="announcement-content" className="block text-sm font-medium text-slate-300 mb-2">Content <span className="text-red-400">*</span></label>
                  <textarea
                    id="announcement-content"
                    rows="6"
                    value={newAnnouncement.content}
                    onChange={(e) => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
                    className="w-full bg-slate-700/50 border border-slate-600 text-slate-200 rounded-lg px-4 py-3 focus:ring-purple-500 focus:border-purple-500 outline-none placeholder-slate-500 transition-colors resize-y custom-scrollbar"
                    placeholder="Write the full announcement details here..."
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Target Group */}
                  <div>
                    <label htmlFor="announcement-target" className="block text-sm font-medium text-slate-300 mb-2">Target Group</label>
                    <select
                       id="announcement-target"
                      value={newAnnouncement.target}
                      onChange={(e) => setNewAnnouncement({...newAnnouncement, target: e.target.value})}
                      className="w-full bg-slate-700/50 border border-slate-600 text-slate-200 rounded-lg px-4 py-3 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors"
                       disabled={isSubmitting}
                    >
                      <option value="All Students">All Students</option>
                      <option value="Batch 2024">Batch 2024</option>
                      <option value="Batch 2025">Batch 2025</option>
                      <option value="Post Graduates">Post Graduates</option>
                       {/* Add more options dynamically if needed */}
                    </select>
                  </div>
                  {/* Tags */}
                  <div>
                    <label htmlFor="announcement-tags" className="block text-sm font-medium text-slate-300 mb-2">Tags (comma separated)</label>
                    <input
                       id="announcement-tags"
                      type="text"
                      value={newAnnouncement.tags}
                      onChange={(e) => setNewAnnouncement({...newAnnouncement, tags: e.target.value})}
                      className="w-full bg-slate-700/50 border border-slate-600 text-slate-200 rounded-lg px-4 py-3 focus:ring-purple-500 focus:border-purple-500 outline-none placeholder-slate-500 transition-colors"
                      placeholder="e.g., Exam, Deadline, Event"
                       disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Attachments */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Attachments (Optional)</label>
                  <div
                    {...getRootProps()}
                     className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
                       ${isDragActive ? 'border-blue-400 bg-slate-700/70' : 'border-slate-600 hover:border-purple-400/70 bg-slate-700/50'}
                     `}
                  >
                    <input {...getInputProps()} />
                    <PaperClipIcon className={`w-12 h-12 mx-auto mb-4 ${isDragActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-purple-300'}`} />
                    <p className="text-slate-400">
                      Drag & drop files here, or{' '}
                      <span
                        
                        onClick={e => {
                          e.stopPropagation();
                          open();
                        }}
                      >
                        click to select
                      </span>
                    </p>
                    <p className="text-slate-500 text-sm mt-2">
                       (PDF, DOC, DOCX, JPG, PNG, up to 50MB)
                    </p>
                  </div>
                  {/* Attached Files List */}
                  {newAnnouncement.attachments.length > 0 && (
                    <div className="mt-4 space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                       <p className="text-xs text-slate-400">Attached files:</p>
                      {newAnnouncement.attachments.map((file, i) => (
                        <div
                          key={i} // Using index as key for file objects, should be okay if list isn't reordered
                          className="flex items-center gap-3 p-3 bg-slate-700/60 rounded-lg border border-slate-600/50 shadow-inner text-slate-300 text-sm"
                        >
                          <DocumentTextIcon className="w-5 h-5 text-slate-500 flex-shrink-0" />
                          <span className="truncate flex-1" title={file.name}>
                            {file.name} ({Math.round(file.size / 1024)} KB)
                          </span>
                          <button
                            type="button"
                            onClick={() => removeAttachment(file.name)}
                            className="p-1 hover:bg-red-500/20 rounded-full transition-colors text-red-400 flex-shrink-0"
                            aria-label={`Remove attachment ${file.name}`}
                             disabled={isSubmitting}
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setIsEditMode(false);
                      setEditingAnnouncementId(null);
                      setOriginalAttachmentUrls([]);
                    }}
                    className="px-6 py-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors text-white font-medium"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all font-semibold shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting || !newAnnouncement.title.trim() || !newAnnouncement.content.trim()}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {isEditMode ? 'Saving...' : 'Publishing...'}
                      </>
                    ) : (
                      <>
                        <MegaphoneIcon className="w-5 h-5" />
                        {isEditMode ? 'Save Changes' : 'Publish Announcement'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
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
       <style jsx="true" global="true">{`
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: rgba(15, 23, 42, 0.5); } /* dark slate background */
        ::-webkit-scrollbar-thumb { background: #475569; border-radius: 4px; } /* lighter slate thumb */
        ::-webkit-scrollbar-thumb:hover { background: #64748b; } /* even lighter on hover */

        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } /* Match sidebar background */
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #6b7280; }
        /* Style for modal's internal scrollbar */
         .modal-scrollbar ::-webkit-scrollbar { width: 6px; }
         .modal-scrollbar ::-webkit-scrollbar-track { background: rgba(31, 41, 55, 0.5); } /* slightly lighter track for modal */
         .modal-scrollbar ::-webkit-scrollbar-thumb { background: #6b7280; border-radius: 3px; }
         .modal-scrollbar ::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
      `}</style>

    </div>
  );
};

export default AnnouncementsPage;