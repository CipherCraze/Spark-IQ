import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserProfile } from '../../firebase/userOperations';
import {
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  AcademicCapIcon,
  MapPinIcon,
  ArrowLeftIcon,
  ShieldCheckIcon,
  CodeBracketIcon,
  TrophyIcon,
  SparklesIcon,
  StarIcon,
  GlobeAltIcon,
  BookOpenIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const ViewOnlyProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('about');
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
    }
  });

  console.log('ViewOnlyProfile mounted with userId:', userId);

  useEffect(() => {
    console.log('Loading profile for userId:', userId);
    loadUserProfile();
  }, [userId]);

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const profileData = await getUserProfile(userId);
      console.log('Loaded profile data:', profileData);
      
      if (!profileData) {
        setError('Profile not found');
        return;
      }

      // Create merged data
      const mergedData = {
        id: userId,
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
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const renderField = (icon, label, value) => {
    const Icon = icon;
    return value ? (
      <div className="flex items-center gap-4">
        <Icon className="h-5 w-5 text-gray-400 flex-shrink-0" />
        <div>
          <div className="text-sm text-gray-500">{label}</div>
          <div className="text-gray-300">{value}</div>
        </div>
      </div>
    ) : null;
  };

  if (isLoading) {
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
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <button 
            onClick={() => navigate('/chat-functionality')} 
            className="flex items-center gap-2 text-indigo-100 hover:text-indigo-200 transition-colors"
          >
            <ArrowLeftIcon className="h-6 w-6" />
            <span className="font-medium">Back to Chat</span>
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
            <div className="flex items-end gap-6">
              <div className="relative">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-32 w-32 rounded-full border-4 border-gray-900 bg-gray-900 object-cover"
                  />
                ) : (
                  <div className="h-32 w-32 rounded-full border-4 border-gray-900 bg-gray-800 flex items-center justify-center">
                    <UserCircleIcon className="h-20 w-20 text-gray-400" />
                  </div>
                )}
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
                    Level {Math.floor(user.stats.points / 100) + 1} Learner
                  </span>
                </h1>
                <p className="text-gray-300 max-w-2xl">{user.bio}</p>
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
                <div className="text-2xl font-bold text-white">{user.stats.points}</div>
                <div className="text-gray-400">Learning Points</div>
              </div>
            </div>
          </div>
          <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/30 hover:border-indigo-500/30 transition-all">
            <div className="flex items-center gap-4">
              <SparklesIcon className="h-8 w-8 text-indigo-400" />
              <div>
                <div className="text-2xl font-bold text-white">{user.stats.streak} Days</div>
                <div className="text-gray-400">Learning Streak</div>
              </div>
            </div>
          </div>
          <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/30 hover:border-indigo-500/30 transition-all">
            <div className="flex items-center gap-4">
              <StarIcon className="h-8 w-8 text-amber-400" />
              <div>
                <div className="text-2xl font-bold text-white">#{user.stats.rank}</div>
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
                  {renderField(UserCircleIcon, "Name", user.name)}
                  {renderField(EnvelopeIcon, "Email", user.email)}
                  {renderField(PhoneIcon, "Phone", user.phone)}
                  {renderField(MapPinIcon, "Location", user.location)}
                  {renderField(AcademicCapIcon, "Education", user.education)}
                </div>
              </div>

              {/* Skills & Social */}
              <div className="space-y-6">
                {/* Technical Skills Section */}
                <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/30">
                  <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <CodeBracketIcon className="h-6 w-6 text-purple-400" />
                    Technical Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {user.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                    {user.skills.length === 0 && (
                      <p className="text-gray-400">No skills listed yet</p>
                    )}
                  </div>
                </div>

                {/* Social Connections Section */}
                <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/30">
                  <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <GlobeAltIcon className="h-6 w-6 text-green-400" />
                    Social Connections
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(user.social).map(([platform, link]) => (
                      link && (
                        <a
                          key={platform}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-gray-300 hover:text-indigo-400 transition-colors"
                        >
                          <span className="capitalize">{platform}</span>
                          <span className="text-sm text-gray-500">{link}</span>
                        </a>
                      )
                    ))}
                    {Object.values(user.social).every(link => !link) && (
                      <p className="text-gray-400">No social links added yet</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'courses' && (
            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/30">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <BookOpenIcon className="h-6 w-6 text-blue-400" />
                Enrolled Courses
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {user.courses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/30"
                  >
                    <div className="flex items-start gap-3">
                      <course.icon className="h-6 w-6 text-indigo-400 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-white">{course.name}</h4>
                        <div className="mt-2 w-full bg-gray-600/30 rounded-full h-2">
                          <div
                            className="bg-indigo-500 h-2 rounded-full"
                            style={{ width: `${course.progress || 0}%` }}
                          />
                        </div>
                        <p className="text-sm text-gray-400 mt-1">
                          {course.progress || 0}% Complete
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {user.courses.length === 0 && (
                  <p className="text-gray-400 col-span-3 text-center py-4">
                    No courses enrolled yet
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/30">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <ChartBarIcon className="h-6 w-6 text-yellow-400" />
                Recent Activity
              </h3>
              <p className="text-gray-400 text-center py-4">
                Activity tracking coming soon
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ViewOnlyProfile; 