import { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { auth } from '../../firebase/firebaseConfig';
import { onAuthStateChanged, updateProfile } from 'firebase/auth';
import { getUserProfile, updateUserProfile, uploadProfilePicture } from '../../firebase/userOperations';
import {
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  AcademicCapIcon,
  BookOpenIcon,
  CalendarIcon,
  MapPinIcon,
  PencilSquareIcon,
  Cog6ToothIcon,
  ArrowLeftIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  UsersIcon,
  DocumentTextIcon,
  StarIcon,
  CodeBracketIcon,
  GlobeAltIcon,
  CloudArrowUpIcon,
  TrophyIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  BriefcaseIcon,
  ClockIcon,
  ClipboardDocumentListIcon,
  PresentationChartLineIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';

const SOCIAL_PLATFORMS = [
  { key: 'github', label: 'GitHub', prefix: 'https://', icon: null },
  { key: 'linkedin', label: 'LinkedIn', prefix: 'https://', icon: null },
  { key: 'researchgate', label: 'ResearchGate', prefix: 'https://www.researchgate.net/profile/', icon: null },
  { key: 'orcid', label: 'ORCID', prefix: 'https://orcid.org/', icon: null }
];

const ALL_SUBJECTS = [
  { id: 'math', name: 'Mathematics' },
  { id: 'cs', name: 'Computer Science' },
  { id: 'physics', name: 'Physics' },
  { id: 'chemistry', name: 'Chemistry' },
  { id: 'biology', name: 'Biology' },
  { id: 'engineering', name: 'Engineering' },
  { id: 'ai', name: 'Artificial Intelligence' },
  { id: 'data-science', name: 'Data Science' }
];

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';

  return (
    <div className={`fixed bottom-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2`}>
      {type === 'success' ? (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      <span>{message}</span>
    </div>
  );
};

const EducatorProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('about');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [toast, setToast] = useState(null);
  
  const [user, setUser] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    bio: '',
    education: '',
    location: '',
    avatar: null,
    subjects: [],
    batches: [],
    teachingExperience: 0,
    researchInterests: [],
    publications: [],
    isVerified: false,
    role: 'educator',
    joinDate: '',
    social: {
      github: '',
      linkedin: '',
      researchgate: '',
      orcid: ''
    },
    stats: {
      studentsTaught: 0,
      coursesCreated: 0,
      rating: 0,
      reviews: 0
    },
    availability: {
      officeHours: '',
      consultationDays: []
    }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isEditingSubjects, setIsEditingSubjects] = useState(false);
  const [isEditingResearch, setIsEditingResearch] = useState(false);
  const [isEditingSocial, setIsEditingSocial] = useState(false);
  const [isEditingAvailability, setIsEditingAvailability] = useState(false);
  const [editData, setEditData] = useState({ ...user });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [newResearchInterest, setNewResearchInterest] = useState('');
  const [newPublication, setNewPublication] = useState({ title: '', link: '' });
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const fileInputRef = useRef();

  // Defensive helpers to avoid undefined errors
  const safeSubjects = (isEditing ? editData.subjects : user.subjects) ?? [];
  const safeResearchInterests = (isEditing ? editData.researchInterests : user.researchInterests) ?? [];
  const safePublications = (isEditing ? editData.publications : user.publications) ?? [];
  const safeSocial = (isEditingSocial ? editData.social : user.social) || {};
  const safeAvailability = (isEditing ? editData.availability : user.availability) || {};

  // Check authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user ? 'User logged in' : 'No user');
      setAuthChecked(true);
      if (!user) {
        console.log('No authenticated user, redirecting to login');
        navigate('/login');
        return;
      }

      // Check if user is an educator
      try {
        const profileData = await getUserProfile(user.uid);
        if (profileData?.role !== 'educator') {
          // Redirect non-educators to student profile
          navigate('/profile');
          return;
        }
      } catch (err) {
        console.error('Error checking user role:', err);
        navigate('/profile');
        return;
      }

      // Load the educator profile
      loadUserProfile(user.uid);
    });

    return () => unsubscribe();
  }, [navigate]);

  // Load user settings from Firebase
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setIsLoading(true);
        const currentUser = auth.currentUser;
        if (!currentUser) {
          console.log('No authenticated user found in loadUserProfile');
          return;
        }

        console.log('Loading profile for educator:', currentUser.uid);
        const profileData = await getUserProfile(currentUser.uid);
        console.log('Loaded profile data:', profileData);

        if (!profileData?.avatar) {
          localStorage.removeItem('profileAvatar');
        }

        // Create initial educator data
        const initialEducatorData = {
          name: currentUser.displayName || '',
          email: currentUser.email || '',
          phone: '',
          location: '',
          bio: '',
          education: '',
          avatar: null,
          subjects: [],
          batches: [],
          teachingExperience: 0,
          researchInterests: [],
          publications: [],
          social: {},
          stats: {
            studentsTaught: 0,
            coursesCreated: 0,
            rating: 0,
            reviews: 0
          },
          availability: {
            officeHours: '',
            consultationDays: []
          },
          role: 'educator'
        };

        if (profileData) {
          const mergedData = {
            ...initialEducatorData,
            ...profileData,
            name: currentUser.displayName || profileData.name,
            email: currentUser.email
          };
          console.log('Setting educator data with name:', mergedData.name);
          setUser(mergedData);
          setEditData(mergedData);
          
          if (mergedData.avatar) {
            setAvatarUrl(mergedData.avatar);
            localStorage.setItem('profileAvatar', mergedData.avatar);
          } else {
            setAvatarUrl(null);
            localStorage.removeItem('profileAvatar');
          }
        } else {
          console.log('No profile data, using initial data with name:', initialEducatorData.name);
          setUser(initialEducatorData);
          setEditData(initialEducatorData);
          setAvatarUrl(null);
          localStorage.removeItem('profileAvatar');
          
          await updateUserProfile(currentUser.uid, initialEducatorData);
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (authChecked && auth.currentUser) {
      loadUserProfile();
    }
  }, [authChecked, navigate]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setIsLoading(true);
        const currentUser = auth.currentUser;
        if (!currentUser) throw new Error('No authenticated user found');

        const downloadURL = await uploadProfilePicture(currentUser.uid, file);
        console.log('Avatar uploaded, URL:', downloadURL);

        setAvatarUrl(downloadURL);
        setEditData(prev => ({ ...prev, avatar: downloadURL }));
        setUser(prev => ({ ...prev, avatar: downloadURL }));
        
        showToast('Profile picture updated successfully!', 'success');
      } catch (err) {
        console.error('Error uploading avatar:', err);
        showToast('Error uploading profile picture. Please try again.', 'error');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleAddResearchInterest = () => {
    if (newResearchInterest.trim() && !editData.researchInterests?.includes(newResearchInterest.trim())) {
      const updatedInterests = [...(editData.researchInterests || []), newResearchInterest.trim()];
      setEditData(prev => ({
        ...prev,
        researchInterests: updatedInterests
      }));
      setNewResearchInterest('');
    }
  };

  const handleRemoveResearchInterest = (interestToRemove) => {
    const updatedInterests = editData.researchInterests.filter(interest => interest !== interestToRemove);
    setEditData(prev => ({
      ...prev,
      researchInterests: updatedInterests
    }));
  };

  const handleSaveResearchInterests = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No authenticated user found');

      await updateUserProfile(currentUser.uid, {
        researchInterests: editData.researchInterests || []
      });

      setUser(prev => ({
        ...prev,
        researchInterests: editData.researchInterests || []
      }));
      setIsEditingResearch(false);
      showToast('Research interests updated successfully!', 'success');
    } catch (err) {
      console.error('Error saving research interests:', err);
      showToast('Error updating research interests. Please try again.', 'error');
    }
  };

  const handleAddPublication = () => {
    if (newPublication.title.trim() && newPublication.link.trim()) {
      const updatedPublications = [...(editData.publications || []), {
        title: newPublication.title.trim(),
        link: newPublication.link.trim()
      }];
      setEditData(prev => ({
        ...prev,
        publications: updatedPublications
      }));
      setNewPublication({ title: '', link: '' });
    }
  };

  const handleRemovePublication = (indexToRemove) => {
    const updatedPublications = editData.publications.filter((_, index) => index !== indexToRemove);
    setEditData(prev => ({
      ...prev,
      publications: updatedPublications
    }));
  };

  const handleSavePublications = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No authenticated user found');

      await updateUserProfile(currentUser.uid, {
        publications: editData.publications || []
      });

      setUser(prev => ({
        ...prev,
        publications: editData.publications || []
      }));
      setIsEditingResearch(false);
      showToast('Publications updated successfully!', 'success');
    } catch (err) {
      console.error('Error saving publications:', err);
      showToast('Error updating publications. Please try again.', 'error');
    }
  };

  const handleSocialChange = (platform, value) => {
    setEditData(prev => ({
      ...prev,
      social: {
        ...(prev.social || {}),
        [platform]: value
      }
    }));
  };

  const handleSubjectEnrollment = () => {
    const subject = ALL_SUBJECTS.find(s => s.id === selectedSubjectId);
    if (subject && !safeSubjects.some(s => s.id === subject.id)) {
      setEditData(prev => ({
        ...prev,
        subjects: [...safeSubjects, { ...subject }]
      }));
      setShowSubjectModal(false);
      setSelectedSubjectId('');
    }
  };

  const handleAvailabilityChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [field]: value
      }
    }));
  };

  const handleToggleConsultationDay = (day) => {
    const updatedDays = safeAvailability.consultationDays.includes(day)
      ? safeAvailability.consultationDays.filter(d => d !== day)
      : [...safeAvailability.consultationDays, day];
    handleAvailabilityChange('consultationDays', updatedDays);
  };

  const handleSaveAvailability = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No authenticated user found');

      await updateUserProfile(currentUser.uid, {
        availability: editData.availability || {}
      });

      setUser(prev => ({
        ...prev,
        availability: editData.availability || {}
      }));
      setIsEditingAvailability(false);
      showToast('Availability updated successfully!', 'success');
    } catch (err) {
      console.error('Error saving availability:', err);
      showToast('Error updating availability. Please try again.', 'error');
    }
  };

  const saveProfile = async () => {
    try {
      setIsLoading(true);
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No authenticated user found');

      await updateProfile(currentUser, {
        displayName: editData.name
      });
      console.log('Updated auth displayName to:', editData.name);

      const dataToSave = {
        name: editData.name || '',
        email: editData.email || currentUser.email,
        phone: editData.phone || '',
        bio: editData.bio || '',
        education: editData.education || '',
        location: editData.location || '',
        social: editData.social || {},
        subjects: editData.subjects || [],
        batches: editData.batches || [],
        teachingExperience: editData.teachingExperience || 0,
        researchInterests: editData.researchInterests || [],
        publications: editData.publications || [],
        availability: editData.availability || {},
        lastUpdated: new Date().toISOString()
      };

      console.log('Saving educator profile data:', dataToSave);
      await updateUserProfile(currentUser.uid, dataToSave);

      setUser(prev => ({
        ...prev,
        ...dataToSave
      }));
      
      setIsLoading(false);
      setIsEditing(false);
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(err.message);
      showToast('Error updating profile. Please try again.', 'error');
      setIsLoading(false);
    }
  };

  const handleSaveSocial = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No authenticated user found');

      await updateUserProfile(currentUser.uid, {
        social: editData.social || {}
      });

      setUser(prev => ({
        ...prev,
        social: editData.social || {}
      }));
      setIsEditingSocial(false);
      showToast('Social links updated successfully!', 'success');
    } catch (err) {
      console.error('Error saving social links:', err);
      showToast('Error updating social links. Please try again.', 'error');
    }
  };

  const handleEditClick = () => {
    setEditData({ ...user });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditData({ ...user });
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  if (!authChecked || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-white">Loading Educator Profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link to="/educator-dashboard" className="flex items-center gap-2 hover:text-indigo-200 transition-colors">
            <ArrowLeftIcon className="h-6 w-6 text-indigo-200" />
            <span className="text-indigo-100 font-medium">Back to Dashboard</span>
          </Link>
          <button className="p-2 rounded-full hover:bg-purple-700/30 transition-all">
            <Link to="/educator-settings" className="flex items-center gap-2 text-indigo-200">
              <Cog6ToothIcon className="h-6 w-6 text-indigo-200" />
            </Link>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Profile Header */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-700/30 overflow-hidden">
          <div className="relative h-48 bg-gradient-to-r from-indigo-500/20 to-purple-500/20">
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent" />
          </div>
          <div className="px-6 pb-6 -mt-16 relative">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between">
              <div className="flex items-end gap-6">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleAvatarUpload}
                  />
                  <div
                    className="cursor-pointer"
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                    title="Change avatar"
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={user.name}
                        className="h-32 w-32 rounded-full border-4 border-gray-900 bg-gray-900 z-10 relative object-cover"
                      />
                    ) : (
                      <div className="h-32 w-32 rounded-full border-4 border-gray-900 bg-gray-800 flex items-center justify-center z-10 relative">
                        <UserCircleIcon className="h-20 w-20 text-gray-400" />
                      </div>
                    )}
                  </div>
                  {user.isVerified && (
                    <div className="absolute bottom-2 right-2 bg-blue-500 rounded-full p-1.5 shadow-lg">
                      <ShieldCheckIcon className="h-5 w-5 text-white" />
                    </div>
                  )}
                </div>
                <div className="pb-4 space-y-2">
                  <h1 className="text-3xl font-bold text-white">
                    {user.name}
                    <span className="ml-3 text-sm bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full">
                      Educator
                    </span>
                  </h1>
                  <p className="text-gray-300 max-w-2xl">{user.bio || 'No bio provided'}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <AcademicCapIcon className="h-4 w-4" />
                    <span>{user.education || 'Education not specified'}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 md:mt-0 flex gap-3">
                {isEditing ? (
                  <div className="flex gap-3">
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 border border-gray-600 rounded-xl text-gray-300 hover:bg-gray-700/50 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveProfile}
                      className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl text-white hover:scale-[1.02] transition-transform"
                    >
                      Save Changes
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleEditClick}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500/80 to-purple-500/80 rounded-xl text-white hover:scale-[1.02] transition-transform"
                  >
                    <PencilSquareIcon className="h-5 w-5" />
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/30 hover:border-indigo-500/30 transition-all">
            <div className="flex items-center gap-4">
              <UsersIcon className="h-8 w-8 text-purple-400" />
              <div>
                <div className="text-2xl font-bold text-white">{user.stats?.studentsTaught ?? 0}</div>
                <div className="text-gray-400">Students Taught</div>
              </div>
            </div>
          </div>
          <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/30 hover:border-indigo-500/30 transition-all">
            <div className="flex items-center gap-4">
              <BookOpenIcon className="h-8 w-8 text-indigo-400" />
              <div>
                <div className="text-2xl font-bold text-white">{user.stats?.coursesCreated ?? 0}</div>
                <div className="text-gray-400">Courses Created</div>
              </div>
            </div>
          </div>
          <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/30 hover:border-indigo-500/30 transition-all">
            <div className="flex items-center gap-4">
              <StarIcon className="h-8 w-8 text-amber-400" />
              <div>
                <div className="text-2xl font-bold text-white">{user.stats?.rating ? user.stats.rating.toFixed(1) : 0}</div>
                <div className="text-gray-400">Average Rating</div>
              </div>
            </div>
          </div>
          <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/30 hover:border-indigo-500/30 transition-all">
            <div className="flex items-center gap-4">
              <BriefcaseIcon className="h-8 w-8 text-green-400" />
              <div>
                <div className="text-2xl font-bold text-white">{user.teachingExperience ?? 0} yrs</div>
                <div className="text-gray-400">Teaching Experience</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-gray-700/50">
          <nav className="flex space-x-8">
            {['about', 'subjects', 'research', 'availability'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 px-1 font-medium ${
                  activeTab === tab
                    ? 'text-indigo-400 border-b-2 border-indigo-500'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'about' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Personal Info */}
              <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <UserCircleIcon className="h-6 w-6 text-indigo-400" />
                    Personal Information
                  </h3>
                </div>
                <div className="space-y-4">
                  {isEditing ? (
                    <>
                      <div className="flex items-center gap-4">
                        <UserCircleIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        <input
                          type="text"
                          value={editData.name || ''}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Enter your name"
                          className="flex-1 px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="flex items-center gap-4">
                        <EnvelopeIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        <input
                          type="email"
                          value={editData.email || ''}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="Enter your email"
                          className="flex-1 px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="flex items-center gap-4">
                        <PhoneIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        <input
                          type="tel"
                          value={editData.phone || ''}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="Enter your phone number"
                          className="flex-1 px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="flex items-center gap-4">
                        <MapPinIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        <input
                          type="text"
                          value={editData.location || ''}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          placeholder="Enter your location"
                          className="flex-1 px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="flex items-center gap-4">
                        <AcademicCapIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        <input
                          type="text"
                          value={editData.education || ''}
                          onChange={(e) => handleInputChange('education', e.target.value)}
                          placeholder="Enter your education"
                          className="flex-1 px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="flex items-center gap-4">
                        <BriefcaseIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        <input
                          type="number"
                          value={editData.teachingExperience || 0}
                          onChange={(e) => handleInputChange('teachingExperience', parseInt(e.target.value) || 0)}
                          placeholder="Years of teaching experience"
                          className="flex-1 px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-4">
                        <UserCircleIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        <div className="text-gray-300">{user.name || 'Not set'}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <EnvelopeIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        <div className="text-gray-300">{user.email || 'Not set'}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <PhoneIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        <div className="text-gray-300">{user.phone || 'Not set'}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <MapPinIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        <div className="text-gray-300">{user.location || 'Not set'}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <AcademicCapIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        <div className="text-gray-300">{user.education || 'Not set'}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <BriefcaseIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        <div className="text-gray-300">
                          {user.teachingExperience || 0} years of teaching experience
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Social Connections Section */}
              <div className="space-y-6">
                <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/30">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                      <GlobeAltIcon className="h-6 w-6 text-green-400" />
                      Professional Profiles
                    </h3>
                    {!isEditingSocial ? (
                      <button
                        onClick={() => setIsEditingSocial(true)}
                        className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Edit Profiles
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setIsEditingSocial(false)}
                          className="px-3 py-1.5 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveSocial}
                          className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          Save Links
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    {SOCIAL_PLATFORMS.map(({ key, label, prefix }) => (
                      <div key={key} className="flex items-center gap-3 text-gray-300">
                        <div className="w-24 text-indigo-300">{label}</div>
                        {isEditingSocial ? (
                          <input
                            type="text"
                            value={safeSocial[key] || ''}
                            onChange={(e) => handleSocialChange(key, e.target.value)}
                            placeholder={`Enter your ${label} URL`}
                            className="flex-1 px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        ) : (
                          safeSocial[key] ? (
                            <a
                              href={safeSocial[key]}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 text-sm hover:underline"
                            >
                              {safeSocial[key]}
                            </a>
                          ) : (
                            <span className="text-gray-400">Not set</span>
                          )
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'availability' && (
            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/30">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <ClockIcon className="h-6 w-6 text-green-400" />
                  Availability
                </h3>
                {!isEditingAvailability ? (
                  <button
                    onClick={() => setIsEditingAvailability(true)}
                    className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Edit Availability
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsEditingAvailability(false)}
                      className="px-3 py-1.5 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveAvailability}
                      className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Save Availability
                    </button>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <ClockIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  {isEditingAvailability ? (
                    <input
                      type="text"
                      value={safeAvailability.officeHours || ''}
                      onChange={(e) => handleAvailabilityChange('officeHours', e.target.value)}
                      placeholder="e.g., 9 AM - 5 PM"
                      className="flex-1 px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <div className="text-gray-300">
                      {safeAvailability.officeHours || 'Office hours not set'}
                    </div>
                  )}
                </div>
                <div className="flex items-start gap-4">
                  <CalendarIcon className="h-5 w-5 text-gray-400 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <div className="text-gray-300 mb-2">Consultation Days</div>
                    <div className="flex flex-wrap gap-2">
                      {isEditingAvailability ? (
                        DAYS_OF_WEEK.map((day) => (
                          <button
                            key={day}
                            onClick={() => handleToggleConsultationDay(day)}
                            className={`px-3 py-1.5 rounded-full text-sm ${
                              safeAvailability.consultationDays.includes(day)
                                ? 'bg-indigo-500/20 text-indigo-300'
                                : 'bg-gray-700/50 text-gray-400'
                            } hover:bg-indigo-500/30 transition-colors`}
                          >
                            {day}
                          </button>
                        ))
                      ) : (
                        safeAvailability.consultationDays.length > 0 ? (
                          safeAvailability.consultationDays.map((day, index) => (
                            <div
                              key={index}
                              className="px-3 py-1.5 bg-indigo-500/20 text-indigo-300 rounded-full text-sm"
                            >
                              {day}
                            </div>
                          ))
                        ) : (
                          <div className="text-gray-400">No consultation days set</div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Floating Action Button */}
        <div className="fixed bottom-8 right-8">
          <button
            className="p-4 bg-indigo-600 rounded-full shadow-xl hover:bg-indigo-700 transition-colors animate-bounce-slow"
            title="Upload new avatar"
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
          >
            <CloudArrowUpIcon className="h-6 w-6 text-white" />
          </button>
        </div>
      </main>

      {/* Gradient Footer */}
      <footer className="mt-16 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-gray-400 text-sm">
            © 2025 SparkIQ. All rights reserved.
            <span className="mx-4">|</span>
            <a href="#" className="hover:text-indigo-300 transition-colors">Privacy Policy</a>
            <span className="mx-4">|</span>
            <a href="#" className="hover:text-indigo-300 transition-colors">Terms of Service</a>
          </div>
          <div className="mt-4 flex justify-center space-x-6">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            <div className="text-xs text-gray-400">System Status: All Services Operational</div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EducatorProfilePage;