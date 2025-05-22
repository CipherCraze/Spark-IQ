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
  GlobeAltIcon,
  StarIcon,
  SparklesIcon,
  TrophyIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    education: '',
    location: '',
    avatar: null,
    skills: [],
    isVerified: false,
    stats: {
      points: 0,
      streak: 0,
      rank: 0
    }
  });

  useEffect(() => {
    loadUserProfile();
  }, [userId]);

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const profileData = await getUserProfile(userId);
      
      if (!profileData) {
        setError('Profile not found');
        return;
      }

      setUser({
        ...profileData,
        stats: profileData.stats || {
          points: 0,
          streak: 0,
          rank: 0
        }
      });
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
          <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/30">
            <div className="flex items-center gap-4">
              <TrophyIcon className="h-8 w-8 text-purple-400" />
              <div>
                <div className="text-2xl font-bold text-white">{user.stats.points}</div>
                <div className="text-gray-400">Learning Points</div>
              </div>
            </div>
          </div>
          <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/30">
            <div className="flex items-center gap-4">
              <SparklesIcon className="h-8 w-8 text-indigo-400" />
              <div>
                <div className="text-2xl font-bold text-white">{user.stats.streak} Days</div>
                <div className="text-gray-400">Learning Streak</div>
              </div>
            </div>
          </div>
          <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/30">
            <div className="flex items-center gap-4">
              <StarIcon className="h-8 w-8 text-amber-400" />
              <div>
                <div className="text-2xl font-bold text-white">#{user.stats.rank}</div>
                <div className="text-gray-400">Global Rank</div>
              </div>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/30">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <UserCircleIcon className="h-6 w-6 text-indigo-400" />
            About {user.name}
          </h3>
          <div className="grid gap-6">
            {renderField(AcademicCapIcon, "Education", user.education)}
            {renderField(MapPinIcon, "Location", user.location)}
            {user.skills?.length > 0 && (
              <div>
                <h4 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                  <CodeBracketIcon className="h-5 w-5 text-purple-400" />
                  Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfile; 