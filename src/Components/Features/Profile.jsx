import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
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

const ProfilePage = () => {
  const { userId } = useParams();
  const [activeTab, setActiveTab] = useState('about');
  
  const [user, setUser] = useState({
    id: userId || '123',
    name: 'Alex Johnson',
    role: 'student',
    email: 'alex.johnson@example.com',
    phone: '+1 (555) 123-4567',
    avatar: null,
    bio: 'AI & Machine Learning Enthusiast | Building the future with neural networks',
    courses: [
      { id: 'cs101', name: 'Neural Networks', progress: 85, icon: CodeBracketIcon },
      { id: 'math202', name: 'Advanced Calculus', progress: 72, icon: ChartBarIcon },
      { id: 'ai301', name: 'Deep Learning', progress: 68, icon: SparklesIcon }
    ],
    skills: ['Python', 'TensorFlow', 'PyTorch', 'Data Analysis', 'Neural Architecture'],
    education: 'B.Sc. Computer Science, University of Tech',
    location: 'San Francisco, CA',
    joinDate: '2023-01-15',
    isVerified: true,
    social: {
      github: 'github.com/ai-alex',
      linkedin: 'linkedin.com/in/ai-alex',
      twitter: '@ai_alex'
    },
    stats: {
      points: 2450,
      streak: 28,
      rank: 42
    }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ ...user });

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  const saveProfile = () => {
    setUser(editData);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 hover:text-indigo-200 transition-colors">
            <ArrowLeftIcon className="h-6 w-6 text-indigo-200" />
            <span className="text-indigo-100 font-medium">Back to Dashboard</span>
          </Link>
          <button className="p-2 rounded-full hover:bg-purple-700/30 transition-all">
            <Cog6ToothIcon className="h-6 w-6 text-indigo-200" />
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
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name}
                      className="h-32 w-32 rounded-full border-4 border-gray-900 bg-gray-900 z-10 relative"
                    />
                  ) : (
                    <div className="h-32 w-32 rounded-full border-4 border-gray-900 bg-gray-800 flex items-center justify-center z-10 relative">
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
                    onClick={() => setIsEditing(true)}
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
              <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/30">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <UserCircleIcon className="h-6 w-6 text-indigo-400" />
                  Personal Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <div className="text-gray-300">{user.email}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <PhoneIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <div className="text-gray-300">{user.phone}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <MapPinIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <div className="text-gray-300">{user.location}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <AcademicCapIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <div className="text-gray-300">{user.education}</div>
                  </div>
                </div>
              </div>

              {/* Skills & Social */}
              <div className="space-y-6">
                <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/30">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <CodeBracketIcon className="h-6 w-6 text-purple-400" />
                    Technical Skills
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {user.skills.map((skill, index) => (
                      <div key={index} className="px-3 py-1.5 bg-indigo-500/20 text-indigo-300 rounded-full text-sm">
                        {skill}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/30">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <GlobeAltIcon className="h-6 w-6 text-green-400" />
                    Social Connections
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(user.social).map(([platform, value]) => (
                      <div key={platform} className="flex items-center gap-3 text-gray-300">
                        <div className="w-24 text-indigo-300">{platform}</div>
                        <div className="flex-1 font-mono text-purple-300">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'courses' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {user.courses.map((course) => (
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
                    <button className="w-full py-2.5 bg-indigo-500/20 text-indigo-300 rounded-lg hover:bg-indigo-500/30 transition-colors">
                      Continue Learning
                    </button>
                  </div>
                </div>
              ))}
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
          <button className="p-4 bg-indigo-600 rounded-full shadow-xl hover:bg-indigo-700 transition-colors animate-bounce-slow">
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