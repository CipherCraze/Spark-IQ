// components/LandingPage/Features.jsx
import { SparklesIcon, AcademicCapIcon, ChartBarIcon, UserGroupIcon } from '@heroicons/react/24/solid';

const Features = () => {
  const features = [
    {
      icon: SparklesIcon,
      title: "AI-Powered Learning",
      description: "Personalized learning paths powered by advanced AI algorithms.",
    },
    {
      icon: AcademicCapIcon,
      title: "Expert Tutors",
      description: "Access to certified tutors for 1-on-1 guidance and support.",
    },
    {
      icon: ChartBarIcon,
      title: "Progress Tracking",
      description: "Real-time analytics to track your learning progress.",
    },
    {
      icon: UserGroupIcon,
      title: "Collaborative Learning",
      description: "Join study groups and collaborate with peers worldwide.",
    },
  ];

  return (
    <div className="py-24 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text mb-8">
          Why Choose SparkIQ?
        </h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, idx) => (
            <div key={idx} className="p-6 border border-gray-700/50 rounded-xl bg-gray-800/30 backdrop-blur-lg">
              <feature.icon className="w-12 h-12 mb-4 text-indigo-400" />
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;