import { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
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
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

const SOCIAL_PLATFORMS = [
  { key: 'github', label: 'GitHub', prefix: 'https://', icon: null },
  { key: 'linkedin', label: 'LinkedIn', prefix: 'https://', icon: null },
  { key: 'twitter', label: 'Twitter', prefix: 'https://twitter.com/', icon: null }
];

const ALL_COURSES = [
  { id: 'cs101', name: 'Neural Networks', icon: CodeBracketIcon },
  { id: 'math202', name: 'Advanced Calculus', icon: ChartBarIcon },
  { id: 'ai301', name: 'Deep Learning', icon: SparklesIcon },
  { id: 'ds401', name: 'Data Science', icon: BookOpenIcon },
  { id: 'web501', name: 'Web Development', icon: GlobeAltIcon }
];

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

const ProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [navigationSource, setNavigationSource] = useState('dashboard');
  const [activeTab, setActiveTab] = useState('about');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [toast, setToast] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  
  const [user, setUser] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    bio: '',
    education: '',
    location: '',
    avatar: null,
    courses: [],
    skills: [],
    isVerified: false,
    role: '',
    joinDate: '',
    social: {
      github: '',
      linkedin: '',
      twitter: ''
    },
    stats: {
      points: 0,
      streak: 0,
      rank: 0
    },
    settings: {
      accentColor: '#8B5CF6',
      darkMode: true,
      density: 'Normal',
      fontSize: 'Medium',
      language: 'en',
      emailNotifications: true,
      pushNotifications: true,
      notificationsEnabled: true
    }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [isEditingSocial, setIsEditingSocial] = useState(false);
  const [editData, setEditData] = useState({ ...user });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [newSkill, setNewSkill] = useState('');
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const fileInputRef = useRef();

  // Defensive helpers to avoid undefined errors
  const safeSkills = (isEditing ? editData.skills : user.skills) ?? [];
  const safeCourses = (isEditing ? editData.courses : user.courses) ?? [];
  const safeSocial = (isEditingSocial ? editData.social : user.social) || {};

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
      
      // Get user profile to check role
      try {
        const profileData = await getUserProfile(user.uid);
        if (profileData?.role === 'educator') {
          // Redirect educators to educator profile
          navigate('/educator-profile');
          return;
        }
      } catch (err) {
        console.error('Error checking user role:', err);
      }
      
      // Determine if this is the user's own profile
      setIsOwnProfile(!userId || userId === user.uid);
      
      // Load the appropriate profile
      loadUserProfile(userId || user.uid);
    });

    return () => unsubscribe();
  }, [userId, navigate]);

  // Load user profile data
  const loadUserProfile = async (targetUserId) => {
    try {
      setIsLoading(true);
      setError(null);

      const profileData = await getUserProfile(targetUserId);
      console.log('Loaded profile data:', profileData);

      if (!profileData) {
        setError('Profile not found');
        return;
      }

      // Create merged data
      const mergedData = {
        id: targetUserId,
        name: profileData.name || 'Unknown User',
        email: profileData.email || '',
        phone: profileData.phone || '',
        location: profileData.location || '',
        bio: profileData.bio || '',
        education: profileData.education || '',
        avatar: profileData.avatar || null,
        skills: profileData.skills || [],
        courses: profileData.courses || [],
        social: profileData.social || {},
        stats: profileData.stats || {
          points: 0,
          streak: 0,
          rank: 0
        },
        isVerified: profileData.isVerified || false,
        role: profileData.role || '',
        joinDate: profileData.joinDate || ''
      };

      setUser(mergedData);
      setEditData(mergedData);
      
      if (mergedData.avatar) {
        setAvatarUrl(mergedData.avatar);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Modified avatar upload handler
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setIsLoading(true);
        const currentUser = auth.currentUser;
        if (!currentUser) throw new Error('No authenticated user found');

        console.log('Uploading avatar...');
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

  // Modified handleAddSkill function
  const handleAddSkill = () => {
    if (newSkill.trim() && !editData.skills?.includes(newSkill.trim())) {
      const updatedSkills = [...(editData.skills || []), newSkill.trim()];
      setEditData(prev => ({
        ...prev,
        skills: updatedSkills
      }));
      setNewSkill('');
    }
  };

  // Modified handleRemoveSkill function
  const handleRemoveSkill = (skillToRemove) => {
    const updatedSkills = editData.skills.filter(skill => skill !== skillToRemove);
    setEditData(prev => ({
      ...prev,
      skills: updatedSkills
    }));
  };

  // Modified handleSaveSkills function
  const handleSaveSkills = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No authenticated user found');

      await updateUserProfile(currentUser.uid, {
        skills: editData.skills || []
      });

      setUser(prev => ({
        ...prev,
        skills: editData.skills || []
      }));
      setIsEditingSkills(false);
      showToast('Skills updated successfully!', 'success');
    } catch (err) {
      console.error('Error saving skills:', err);
      showToast('Error updating skills. Please try again.', 'error');
    }
  };

  // Modified handleSocialChange function
  const handleSocialChange = (platform, value) => {
    setEditData(prev => ({
      ...prev,
      social: {
        ...(prev.social || {}),
        [platform]: value
      }
    }));
  };

  // Course enrollment
  const handleEnrollCourse = () => {
    const course = ALL_COURSES.find(c => c.id === selectedCourseId);
    if (course && !safeCourses.some(c => c.id === course.id)) {
      setEditData(prev => ({
        ...prev,
        courses: [...safeCourses, { ...course, progress: 0 }]
      }));
      setShowCourseModal(false);
      setSelectedCourseId('');
    }
  };

  // Modified saveProfile function
  const saveProfile = async () => {
    try {
      setIsLoading(true);
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No authenticated user found');

      // Update displayName in Firebase Auth
      await updateProfile(currentUser, {
        displayName: editData.name
      });
      console.log('Updated auth displayName to:', editData.name);

      // Format data according to the new structure
      const dataToSave = {
        name: editData.name || '',
        email: editData.email || currentUser.email,
        phone: editData.phone || '',
        bio: editData.bio || '',
        education: editData.education || '',
        location: editData.location || '',
        social: editData.social || {},
        skills: editData.skills || [],
        courses: editData.courses || [],
        lastUpdated: new Date().toISOString()
      };

      console.log('Saving profile data:', dataToSave);
      await updateUserProfile(currentUser.uid, dataToSave);

      // Update local state
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

  // Modified handleSaveSocial function
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

  const renderField = (icon, value, editValue, onChange, type = "text", placeholder = "") => {
    const Icon = icon;
    return (
      <div className="flex items-center gap-4">
        <Icon className="h-5 w-5 text-gray-400 flex-shrink-0" />
        <div className="text-gray-300">{value || 'Not set'}</div>
      </div>
    );
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const renderTechnicalSkills = () => (
    <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <CodeBracketIcon className="h-6 w-6 text-purple-400" />
          Technical Skills
        </h3>
        {!isEditingSkills ? (
          <button
            onClick={() => setIsEditingSkills(true)}
            className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Edit Skills
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditingSkills(false)}
              className="px-3 py-1.5 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveSkills}
              className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Save Skills
            </button>
          </div>
        )}
      </div>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {(editData.skills || []).map((skill, index) => (
            <div
              key={index}
              className="px-3 py-1.5 bg-indigo-500/20 text-indigo-300 rounded-full text-sm flex items-center gap-2"
            >
              {skill}
              {isEditingSkills && (
                <button
                  onClick={() => handleRemoveSkill(skill)}
                  className="hover:text-red-400 transition-colors"
                  title="Remove skill"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
          {(!editData.skills || editData.skills.length === 0) && (
            <div className="text-gray-400">No skills added yet</div>
          )}
        </div>
        {isEditingSkills && (
          <div className="flex gap-2 mt-4">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill();
                }
              }}
              placeholder="Add a new skill"
              className="flex-1 px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleAddSkill}
              disabled={!newSkill.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Add Skill
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Add this near the other useEffect hooks
  useEffect(() => {
    // Get the source from the state passed during navigation
    const source = location.state?.from || 'dashboard';
    setNavigationSource(source);
  }, [location]);

  const handleBackNavigation = () => {
    if (navigationSource === 'chat') {
      navigate('/chat-functionality');
    } else {
      navigate('/dashboard');
    }
  };

  if (!authChecked || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-white">Loading...</div>
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
      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex items-center justify-between">
          <button onClick={handleBackNavigation} className="flex items-center gap-2 hover:text-indigo-200 transition-colors">
            <ArrowLeftIcon className="h-6 w-6 text-indigo-200" />
            <span className="text-indigo-100 font-medium">
              {navigationSource === 'chat' ? 'Back to Chat' : 'Back to Dashboard'}
            </span>
          </button>
          <button className="p-2 rounded-full hover:bg-purple-700/30 transition-all">
            <Link to="/settings" className="flex items-center gap-2 text-indigo-200">
              <Cog6ToothIcon className="h-6 w-6 text-indigo-200" />
            </Link>
          </button>
        </div>
      </header>

      {/* Profile Content */}
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
                      Level 3 Learner
                    </span>
                  </h1>
                  <p className="text-gray-300 max-w-2xl">{user.bio}</p>
                </div>
              </div>
              <div className="mt-4 md:mt-0 flex gap-3">
                {isEditing ? (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsEditing(false)}
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
                    onClick={() => navigate('/settings?tab=account')}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/30 hover:border-indigo-500/30 transition-all">
            <div className="flex items-center gap-4">
              <TrophyIcon className="h-8 w-8 text-purple-400" />
              <div>
                <div className="text-2xl font-bold text-white">{user.stats?.points ?? 0}</div>
                <div className="text-gray-400">Learning Points</div>
              </div>
            </div>
          </div>
          <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/30 hover:border-indigo-500/30 transition-all">
            <div className="flex items-center gap-4">
              <SparklesIcon className="h-8 w-8 text-indigo-400" />
              <div>
                <div className="text-2xl font-bold text-white">{user.stats?.streak ?? 0} Days</div>
                <div className="text-gray-400">Learning Streak</div>
              </div>
            </div>
          </div>
          <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/30 hover:border-indigo-500/30 transition-all">
            <div className="flex items-center gap-4">
              <StarIcon className="h-8 w-8 text-amber-400" />
              <div>
                <div className="text-2xl font-bold text-white">#{user.stats?.rank ?? 0}</div>
                <div className="text-gray-400">Global Rank</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-gray-700/50">
          <nav className="flex space-x-8">
            {['about', 'courses', 'activity'].map((tab) => (
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
                  {renderField(
                    UserCircleIcon,
                    user.name,
                    editData.name,
                    (value) => setEditData({ ...editData, name: value }),
                    "text",
                    "Enter your name"
                  )}
                  {renderField(
                    EnvelopeIcon,
                    user.email,
                    editData.email,
                    (value) => setEditData({ ...editData, email: value }),
                    "email",
                    "Enter your email"
                  )}
                  {renderField(
                    PhoneIcon,
                    user.phone,
                    editData.phone,
                    (value) => setEditData({ ...editData, phone: value }),
                    "tel",
                    "Enter your phone number"
                  )}
                  {renderField(
                    MapPinIcon,
                    user.location,
                    editData.location,
                    (value) => setEditData({ ...editData, location: value }),
                    "text",
                    "Enter your location"
                  )}
                  {renderField(
                    AcademicCapIcon,
                    user.education,
                    editData.education,
                    (value) => setEditData({ ...editData, education: value }),
                    "text",
                    "Enter your education"
                  )}
                </div>
              </div>

              {/* Skills & Social */}
              <div className="space-y-6">
                {/* Technical Skills Section */}
                {renderTechnicalSkills()}

                {/* Social Connections Section */}
                <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/30">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                      <GlobeAltIcon className="h-6 w-6 text-green-400" />
                      Social Connections
                    </h3>
                    {!isEditingSocial ? (
                      <button
                        onClick={() => setIsEditingSocial(true)}
                        className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Edit Social Links
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
                            onChange={e => handleSocialChange(key, e.target.value)}
                            placeholder={`Enter ${label} URL or handle`}
                            className="flex-1 px-3 py-1 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none"
                          />
                        ) : (
                          <div className="flex-1">
                            {safeSocial[key] ? (
                              <a
                                href={safeSocial[key].startsWith('http') ? safeSocial[key] : prefix + safeSocial[key].replace(/^@/, '')}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-300 hover:underline"
                              >
                                {safeSocial[key]}
                              </a>
                            ) : (
                              <span className="text-gray-500">Not connected</span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'courses' && (
            <div>
              <div className="flex justify-end mb-4">
                {isEditing && (
                  <button
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    onClick={() => setShowCourseModal(true)}
                  >
                    Enroll in New Course
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {safeCourses.map((course) => (
                  <div key={course.id} className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/30 hover:border-indigo-500/30 transition-all group">
                    <div className="flex items-center gap-4 mb-4">
                      <course.icon className="h-8 w-8 text-indigo-400" />
                      <h3 className="text-xl font-semibold text-white">{course.name}</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between">
                          <div>
                            <span className="text-xs font-semibold inline-block text-indigo-400">
                              Progress
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-semibold inline-block text-indigo-400">
                              {course.progress}%
                            </span>
                          </div>
                        </div>
                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-700">
                          <div
                            style={{ width: `${course.progress}%` }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-indigo-500 to-purple-500"
                          />
                        </div>
                      </div>
                      {isEditing && (
                        <button
                          className="w-full py-2.5 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
                          onClick={() =>
                            setEditData(prev => ({
                              ...prev,
                              courses: safeCourses.filter(c => c.id !== course.id)
                            }))
                          }
                        >
                          Remove Course
                        </button>
                      )}
                      {!isEditing && (
                        <button className="w-full py-2.5 bg-indigo-500/20 text-indigo-300 rounded-lg hover:bg-indigo-500/30 transition-colors">
                          Continue Learning
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {/* Enroll Modal */}
              {showCourseModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                  <div className="bg-gray-900 rounded-xl p-8 w-full max-w-md shadow-2xl border border-gray-700">
                    <h2 className="text-xl font-bold text-white mb-4">Enroll in a New Course</h2>
                    <select
                      className="w-full px-4 py-2 mb-4 rounded bg-gray-700 text-white border border-gray-600"
                      value={selectedCourseId}
                      onChange={e => setSelectedCourseId(e.target.value)}
                    >
                      <option value="">Select a course</option>
                      {ALL_COURSES.filter(c => !safeCourses.some(ec => ec.id === c.id)).map(course => (
                        <option key={course.id} value={course.id}>{course.name}</option>
                      ))}
                    </select>
                    <div className="flex justify-end gap-2">
                      <button
                        className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                        onClick={() => setShowCourseModal(false)}
                      >
                        Cancel
                      </button>
                      <button
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                        onClick={handleEnrollCourse}
                        disabled={!selectedCourseId}
                      >
                        Enroll
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/30">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-green-400" />
                Recent Activity Timeline
              </h3>
              <div className="space-y-6">
                <div className="relative pl-8 border-l-2 border-gray-700/50">
                  <div className="absolute w-4 h-4 bg-indigo-500 rounded-full -left-2 top-0" />
                  <div className="pl-6">
                    <div className="text-gray-300">Completed Neural Networks course</div>
                    <div className="text-sm text-gray-500 mt-1">2 hours ago</div>
                  </div>
                </div>
                <div className="relative pl-8 border-l-2 border-gray-700/50">
                  <div className="absolute w-4 h-4 bg-purple-500 rounded-full -left-2 top-0" />
                  <div className="pl-6">
                    <div className="text-gray-300">Earned "Machine Learning Pro" badge</div>
                    <div className="text-sm text-gray-500 mt-1">1 day ago</div>
                  </div>
                </div>
                <div className="relative pl-8 border-l-2 border-gray-700/50">
                  <div className="absolute w-4 h-4 bg-green-500 rounded-full -left-2 top-0" />
                  <div className="pl-6">
                    <div className="text-gray-300">Shared project on community forum</div>
                    <div className="text-sm text-gray-500 mt-1">3 days ago</div>
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
            © 2024 SparkIQ. All rights reserved. 
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

export default ProfilePage;