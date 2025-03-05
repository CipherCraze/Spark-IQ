import { Link } from 'react-router';
import {
  SparklesIcon,
  AcademicCapIcon,
  BookOpenIcon,
  ChartBarIcon,
  ClipboardDocumentIcon,
  UsersIcon,
  ChatBubbleLeftRightIcon,
  LightBulbIcon,
  EnvelopeIcon,
  PuzzlePieceIcon,
  VideoCameraIcon,
  MegaphoneIcon,
  PresentationChartLineIcon,
  TrophyIcon,
  FolderIcon,
  BellIcon,
  DocumentTextIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

const Card = ({ title, description, Icon }) => {
  return (
    <div className="h-[16em] w-[18em] border-2 border-[rgba(75,30,133,0.5)] rounded-[1.5em] bg-gradient-to-br from-[rgba(75,30,133,0.3)] to-[rgba(75,30,133,0.01)] text-white p-6 flex flex-col gap-4 backdrop-blur-[12px] hover:from-[rgba(75,30,133,0.4)] transition-all duration-300 group">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-indigo-900/50 border border-indigo-700">
          <Icon className="w-6 h-6 text-indigo-400" />
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          {title}
        </h1>
      </div>
      <p className="text-gray-300 text-sm leading-relaxed flex-1">{description}</p>
      <button className="w-fit px-4 py-2 rounded-full bg-indigo-600/30 border border-indigo-500 flex items-center gap-2 hover:bg-indigo-600/50 transition-all duration-200">
        <span className="text-sm">Explore</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </button>
    </div>
  );
};

const Dashboard = ({ role }) => {
  const studentFeatures = [
    { title: 'Assignment Submission', 
      description: 'Submit your work securely with AI-powered format checking',
      Icon: ClipboardDocumentIcon },
    { title: 'Personalized Feedback', 
      description: 'Receive AI-enhanced feedback on your submissions',
      Icon: LightBulbIcon },
    { title: 'Attendance Monitoring', 
      description: 'Real-time attendance tracking with analytics',
      Icon: ChartBarIcon },
    { title: 'Grading Access', 
      description: 'View your grades and performance metrics',
      Icon: PresentationChartLineIcon },
    { title: 'Resource Utilization', 
      description: 'Access curated study materials and resources',
      Icon: FolderIcon },
    { title: 'Gamification Elements', 
      description: 'Earn badges and rewards for your achievements',
      Icon: TrophyIcon },
    { title: 'Meeting Participation', 
      description: 'Join live sessions and virtual classrooms',
      Icon: VideoCameraIcon },
    { title: 'Collaboration Tools', 
      description: 'Work with peers in virtual study rooms',
      Icon: UsersIcon },
    { title: 'Chatbot Access', 
      description: '24/7 AI tutor assistance for instant help',
      Icon: ChatBubbleLeftRightIcon },
    { title: 'AI-Generated Questions', 
      description: 'Practice with dynamically generated study questions',
      Icon: SparklesIcon },
    { title: 'Inbox for Suggestions', 
      description: 'Receive personalized suggestions from educators',
      Icon: EnvelopeIcon },
    { title: 'Chat Functionality', 
      description: 'Communicate with peers and educators in real-time',
      Icon: ChatBubbleLeftRightIcon },
  ];

  const educatorFeatures = [
    { title: 'Assignment Management', 
      description: 'Create, distribute, and track assignments efficiently',
      Icon: ClipboardDocumentIcon },
    { title: 'Grading System', 
      description: 'AI-assisted grading with plagiarism detection',
      Icon: AcademicCapIcon },
    { title: 'Attendance Tracking', 
      description: 'Advanced analytics and reporting system',
      Icon: ChartBarIcon },
    { title: 'Chatbot Interaction', 
      description: 'Use AI to assist students and manage queries',
      Icon: ChatBubbleLeftRightIcon },
    { title: 'Feedback Provision', 
      description: 'Provide detailed feedback to students',
      Icon: LightBulbIcon },
    { title: 'Question Generation', 
      description: 'Create dynamic assessments with one click',
      Icon: SparklesIcon },
    { title: 'Suggestions to Students', 
      description: 'Send personalized recommendations to students',
      Icon: EnvelopeIcon },
    { title: 'Meeting Hosting', 
      description: 'Host interactive live sessions with students',
      Icon: VideoCameraIcon },
    { title: 'Collaboration', 
      description: 'Collaborate with students and other educators',
      Icon: UserGroupIcon },
    { title: 'Announcements', 
      description: 'Make important announcements to your class',
      Icon: MegaphoneIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <header className="mb-12 text-center">
        <div className="inline-flex items-center gap-3 mb-4 animate-fade-in">
          <SparklesIcon className="w-8 h-8 text-indigo-400 animate-pulse" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            SPARK-IQ Dashboard
          </h1>
        </div>
        <p className="text-gray-400 text-lg">
          Welcome to your {role === 'student' ? 'Learning' : 'Teaching'} Hub
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {(role === 'student' ? studentFeatures : educatorFeatures).map((feature, index) => (
          <Card
            key={index}
            title={feature.title}
            description={feature.description}
            Icon={feature.Icon}
          />
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-gray-400">
          Need help? Contact our{' '}
          <Link to="/support" className="text-indigo-400 hover:text-indigo-300 transition-colors">
            support team
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Dashboard;