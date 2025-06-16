import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth, db, storage } from '../../firebase/firebaseConfig';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, query, where, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Icons imports
import { 
  PaperClipIcon, XMarkIcon, DocumentTextIcon, ArrowUpTrayIcon, SparklesIcon,
  AcademicCapIcon, PresentationChartLineIcon, ClipboardDocumentIcon, FolderIcon,
  ChartBarIcon, ChatBubbleLeftRightIcon, DocumentMagnifyingGlassIcon, GlobeAltIcon,
  EnvelopeIcon, VideoCameraIcon, MegaphoneIcon, Bars3Icon, ChevronLeftIcon,
  UserCircleIcon, Cog6ToothIcon, ArrowLeftOnRectangleIcon, BellIcon, ChevronDownIcon,
  ExclamationTriangleIcon, CheckCircleIcon, UserIcon, PlusIcon, MinusIcon
} from '@heroicons/react/24/outline';
import { UserGroupIcon as SolidUserGroupIcon } from '@heroicons/react/24/solid';

// Educator Sidebar Menu
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
  { title: 'Student Suggestions', Icon: EnvelopeIcon, link: '/suggestions-to-students', current: true },
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const [educator, setEducator] = useState(null);
  const [isLoadingEducator, setIsLoadingEducator] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const profileButtonRef = useRef(null);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter students based on search query
  const filteredStudents = students.filter(student => {
    const name = student.name || student.displayName || student.email || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch students from Firestore
  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);
      const studentsRef = collection(db, 'students');
      const q = query(studentsRef, where('role', '==', 'student'));
      const snapshot = await getDocs(q);
      
      const uniqueStudents = new Map();
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (!uniqueStudents.has(data.email)) {
          uniqueStudents.set(data.email, {
            id: doc.id,
            ...data
          });
        }
      });
      
      const studentsList = Array.from(uniqueStudents.values());
      setStudents(studentsList);
    } catch (error) {
      console.error('Error fetching students:', error);
      displayMessage('error', 'Failed to load students list.');
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Handle authentication state
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          setIsLoadingEducator(true);
          const teacherDoc = await getDoc(doc(db, 'teachers', user.uid));
          
          if (teacherDoc.exists()) {
            setEducator({
              ...teacherDoc.data(),
              uid: user.uid,
              role: 'educator'
            });
          } else {
            const educatorData = {
              uid: user.uid,
              email: user.email,
              name: user.displayName || "Educator",
              role: 'educator',
              joinDate: new Date().toISOString(),
              lastUpdated: new Date().toISOString()
            };
            await setDoc(doc(db, 'teachers', user.uid), educatorData);
            setEducator(educatorData);
          }
        } catch (error) {
          console.error('Error handling educator profile:', error);
          displayMessage('error', 'Failed to load educator profile. Please try logging in again.');
          navigate('/login');
        } finally {
          setIsLoadingEducator(false);
        }
      } else {
        setEducator(null);
        setIsLoadingEducator(false);
        navigate('/login');
      }
    });

    const handleClickOutsideProfile = (event) => {
      if (isProfileOpen &&
          profileMenuRef.current && !profileMenuRef.current.contains(event.target) &&
          profileButtonRef.current && !profileButtonRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutsideProfile);

    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      unsubscribeAuth();
      document.removeEventListener('mousedown', handleClickOutsideProfile);
      window.removeEventListener('resize', handleResize);
    };
  }, [navigate, isProfileOpen]);

  // Display toast messages
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
    }, 5000);
  };

  // Handle file uploads
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newValidFiles = files.filter(f => 
      !attachments.some(att => att.name === f.name) &&
      f.size <= 10 * 1024 * 1024 &&
      f.type.match(/^(image\/.*|video\/.*|application\/pdf)$/)
    );

    if (files.length !== newValidFiles.length) {
      displayMessage('error', 'Some files were not added. Only images, videos, and PDFs under 10MB are allowed.');
    }

    setAttachments([...attachments, ...newValidFiles.map(f => ({
      name: f.name,
      size: f.size,
      type: f.type,
      fileObject: f
    }))]);
  };

  // Remove attachment
  const removeAttachment = (fileName) => {
    setAttachments(prev => prev.filter(file => file.name !== fileName));
  };

  // Submit suggestion
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    if (!title.trim() || !description.trim()) {
      displayMessage('error', 'Please fill out both the title and description fields.');
      return;
    }

    if (!selectedStudent) {
      displayMessage('error', 'Please select a student to send the suggestion to.');
      return;
    }

    if (!auth.currentUser || !educator || educator.role !== 'educator') {
      displayMessage('error', 'You must be logged in as a teacher to submit suggestions.');
      return;
    }

    setIsSubmitting(true);
    let uploadedFileUrls = [];

    try {
      if (attachments.length > 0) {
        uploadedFileUrls = await Promise.all(
          attachments.map(async (attachment) => {
            const uniqueFileName = `${Date.now()}_${attachment.name.replace(/\s+/g, '_')}`;
            const storagePath = `suggestions/${auth.currentUser.uid}/${uniqueFileName}`;
            const storageRef = ref(storage, storagePath);
            await uploadBytes(storageRef, attachment.fileObject);
            return await getDownloadURL(storageRef);
          })
        );
      }

      const suggestionData = {
        teacherId: auth.currentUser.uid,
        teacherName: educator.name || auth.currentUser.displayName || 'Teacher',
        teacherEmail: educator.email || auth.currentUser.email,
        studentId: selectedStudent.id,
        studentName: selectedStudent.name || selectedStudent.email,
        title: title.trim(),
        description: description.trim(),
        preview: description.trim().substring(0, 100) + (description.length > 100 ? '...' : ''),
        attachmentUrls: uploadedFileUrls,
        createdAt: new Date().toISOString(),
        status: 'unread',
        priority: 'medium',
        category: 'Academic',
        fullMessage: description.trim(),
        attachments: uploadedFileUrls.map((url, i) => ({
          name: attachments[i].name,
          type: attachments[i].type,
          url,
          size: Math.round(attachments[i].size / 1024) + ' KB'
        }))
      };

      await addDoc(collection(db, 'suggestions'), suggestionData);
      
      setTitle('');
      setDescription('');
      setAttachments([]);
      setSelectedStudent(null);
      setSearchQuery('');

      displayMessage('success', 'Suggestion submitted successfully! The student will see this in their inbox.');

    } catch (error) {
      console.error('Error submitting suggestion:', error);
      displayMessage('error', `Failed to submit suggestion: ${error.message}. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      displayMessage('error', 'Failed to sign out. Please try again.');
    }
  };

  // Render student selector with enhanced UI
  const renderStudentSelector = () => (
    <div className="mb-6 relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-slate-300 mb-2">
        Select Student <span className="text-red-400">*</span>
      </label>
      
      <div 
        className="flex items-center justify-between w-full p-3 bg-slate-700/60 border border-slate-600 rounded-lg text-slate-200 cursor-pointer transition-all hover:bg-slate-700/80 hover:border-purple-500/30"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <div className="flex items-center gap-2 truncate">
          {selectedStudent ? (
            <>
              <UserIcon className="w-5 h-5 text-purple-400" />
              <span className="truncate">
                {selectedStudent.name || selectedStudent.displayName || selectedStudent.email}
              </span>
            </>
          ) : (
            <span className="text-slate-400">Select a student...</span>
          )}
        </div>
        <ChevronDownIcon 
          className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} 
        />
      </div>
      
      {isDropdownOpen && (
        <div className="absolute z-10 mt-2 w-full max-h-80 overflow-auto bg-slate-800 border border-slate-700 rounded-xl shadow-2xl custom-scrollbar">
          <div className="p-2 border-b border-slate-700/60 sticky top-0 bg-slate-800/90 backdrop-blur-sm">
            <input
              type="text"
              placeholder="Search students..."
              className="w-full p-2 bg-slate-700/50 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {loadingStudents ? (
            <div className="py-4 text-center text-slate-400">
              Loading students...
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-4 text-center text-slate-400">
              {searchQuery ? 'No matching students found' : 'No students available'}
            </div>
          ) : (
            <ul className="py-1">
              {filteredStudents.map(student => (
                <li 
                  key={student.id}
                  className={`px-4 py-3 flex items-center gap-3 cursor-pointer transition-all hover:bg-slate-700/60 ${
                    selectedStudent?.id === student.id ? 'bg-slate-700/60' : ''
                  }`}
                  onClick={() => {
                    setSelectedStudent(student);
                    setIsDropdownOpen(false);
                  }}
                >
                  <div className="bg-purple-500/10 p-2 rounded-full">
                    <UserIcon className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-200 truncate">
                      {student.name || student.displayName || student.email}
                    </div>
                    <div className="text-xs text-slate-400 truncate">
                      {student.email}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      
      <div className="mt-2 flex justify-between">
        <button
          onClick={fetchStudents}
          disabled={loadingStudents}
          className="text-xs px-3 py-1.5 bg-slate-700/60 text-slate-300 rounded-lg hover:bg-slate-700/80 disabled:opacity-50 flex items-center gap-1 transition-colors"
        >
          {loadingStudents ? (
            <>
              <svg className="animate-spin h-3 w-3 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Refreshing...
            </>
          ) : (
            <>
              <ArrowUpTrayIcon className="w-3.5 h-3.5" />
              Refresh Students
            </>
          )}
        </button>
        <div className="text-xs text-slate-500">
          {students.length} students found
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-gray-900 flex text-slate-100 overflow-x-hidden">
      {/* Sidebar */}
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
                ${item.link === location.pathname
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg ring-1 ring-purple-500/60 transform scale-[1.01]'
                  : item.special
                    ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white font-semibold hover:from-amber-500 hover:to-orange-600 shadow-md hover:shadow-lg'
                    : 'text-slate-300 hover:bg-slate-700/60 hover:text-purple-300 hover:shadow-md'
                }
              `}
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setIsSidebarOpen(false);
                }
              }}
            >
              <item.Icon className={`w-5 h-5 flex-shrink-0 ${item.link === location.pathname ? 'text-white' : item.special ? 'text-white/90' : 'text-slate-400 group-hover:text-purple-300' } transition-colors`} />
              <span>{item.title}</span>
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg text-gray-300 transition-all group hover:bg-red-500/10 hover:text-red-300 w-full"
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5 flex-shrink-0 text-red-400 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </nav>
      </aside>
      
      {isSidebarOpen && window.innerWidth < 1024 && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* Main Content */}
      <main className={`flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto transition-all duration-300 ${
        isSidebarOpen ? 'lg:ml-64' : 'ml-0'
      }`}>
        <header className="flex justify-between items-center mb-8 sm:mb-12">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2.5 bg-slate-800/60 hover:bg-slate-700/80 rounded-lg shadow-sm hover:shadow-md transition-all lg:hidden"
              aria-label="Open sidebar"
            >
              <Bars3Icon className="w-6 h-6 text-slate-300" />
            </button>
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
              <p className="text-slate-400 text-sm sm:text-base">Share personalized suggestions and feedback with students</p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative">
              <button
                className="p-2.5 hover:bg-slate-700/50 rounded-full transition-colors relative focus:outline-none focus:ring-2 focus:ring-purple-500"
                aria-label="Notifications"
              >
                <BellIcon className="w-6 h-6 text-slate-400 hover:text-slate-200" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-800 animate-pulse"></span>
              </button>
            </div>
            <div ref={profileButtonRef} className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 hover:bg-slate-700/50 p-1.5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
                aria-label="User profile"
                disabled={isLoadingEducator}
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
                <div ref={profileMenuRef} className="absolute right-0 mt-3 w-60 bg-gradient-to-b from-slate-800 to-slate-900 backdrop-blur-xl rounded-xl shadow-2xl border border-slate-700/60 z-50 overflow-hidden transform transition-all duration-300 origin-top-right">
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

        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6 pt-5">
            {renderStudentSelector()}
            
            <div className="bg-slate-800/60 backdrop-blur-lg rounded-xl border border-slate-700/50 p-6 sm:p-8 shadow-xl transition-all duration-300 hover:shadow-2xl hover:border-purple-500/30">
              <div className="space-y-6 sm:space-y-8">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-2">
                    Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 outline-none"
                    placeholder="Enter suggestion title"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">
                    Description <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 min-h-[200px] focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 outline-none resize-y custom-scrollbar"
                    placeholder="Provide detailed description of your suggestion..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Attachments (Optional)
                  </label>
                  <div className="space-y-4">
                    <label htmlFor="file-upload" className="flex items-center gap-2 px-4 py-2.5 bg-slate-700/50 border border-slate-600/50 text-slate-300 rounded-lg hover:bg-slate-700/70 hover:border-purple-500/50 transition-all cursor-pointer group">
                      <ArrowUpTrayIcon className="w-5 h-5 text-slate-400 group-hover:text-purple-300" />
                      <span className="font-medium text-sm group-hover:text-purple-300">Attach Files</span>
                      <input
                        type="file"
                        id="file-upload"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        multiple
                        accept=".pdf,.doc,.docx,.jpg,.png,.zip"
                      />
                    </label>

                    {attachments.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-xs text-slate-400">Attached files:</p>
                        {attachments.map((file, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-3 p-3 bg-slate-700/60 rounded-lg border border-slate-600/50 shadow-inner transition-all duration-300 hover:bg-slate-700/80"
                          >
                            <div className="bg-purple-500/10 p-2 rounded-lg">
                              <DocumentTextIcon className="w-5 h-5 text-purple-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm text-slate-300 truncate">{file.name}</div>
                              <div className="text-xs text-slate-500">
                                {Math.round(file.size / 1024)} KB · {file.type.split('/')[1] || file.type}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeAttachment(file.name)}
                              className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
                              aria-label={`Remove attachment ${file.name}`}
                            >
                              <XMarkIcon className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isSubmitting || !title.trim() || !description.trim() || isLoadingEducator}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transform hover:scale-[1.02] transition-transform"
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
                    <SparklesIcon className="w-5 h-5" />
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
        <div className="fixed bottom-5 right-5 sm:bottom-8 sm:right-8 bg-emerald-500/90 backdrop-blur-sm text-white px-5 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-3 border border-emerald-400 animate-fade-in-up">
          <CheckCircleIcon className="w-6 h-6" />
          <span>{submitSuccess}</span>
          <button onClick={() => setSubmitSuccess(null)} className="ml-2 text-emerald-100 hover:text-white"><XMarkIcon className="w-5 h-5"/></button>
        </div>
      )}
      {submitError && (
        <div className="fixed bottom-5 right-5 sm:bottom-8 sm:right-8 bg-red-500/90 backdrop-blur-sm text-white px-5 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-3 border border-red-400 animate-fade-in-up">
          <ExclamationTriangleIcon className="w-6 h-6" />
          <span>{submitError}</span>
          <button onClick={() => setSubmitError(null)} className="ml-2 text-red-100 hover:text-white"><XMarkIcon className="w-5 h-5"/></button>
        </div>
      )}

      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(55, 65, 81, 0.5);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(107, 114, 128, 0.7);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(156, 163, 175, 0.9);
          }
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: rgba(107, 114, 128, 0.7) rgba(55, 65, 81, 0.5);
          }
          @keyframes fade-in-up {
            0% {
              opacity: 0;
              transform: translateY(20px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-in-up {
            animation: fade-in-up 0.5s ease-out forwards;
          }
        `}
      </style>
    </div>
  );
};

export default SuggestionsToStudents;