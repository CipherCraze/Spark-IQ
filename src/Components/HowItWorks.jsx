import { motion } from 'framer-motion';
import { Link } from 'react-router';
import { 
  SparklesIcon,
  UserCircleIcon,
  AcademicCapIcon,
  ChartBarIcon,
  BookOpenIcon,
  ChatBubbleOvalLeftIcon,
  TrophyIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export default function HowItWorks() {
  const steps = [
    {
      icon: <UserCircleIcon className="w-12 h-12 text-indigo-400" />,
      title: 'Personalized Setup',
      description: 'Create your AI-enhanced profile and select your academic focus areas for tailored learning experiences',
      gradient: 'from-indigo-500 to-purple-600'
    },
    {
      icon: <BookOpenIcon className="w-12 h-12 text-emerald-400" />,
      title: 'AI-Powered Learning',
      description: 'Engage with smart course materials that adapt to your learning style and performance',
      gradient: 'from-emerald-500 to-cyan-600'
    },
    {
      icon: <ChartBarIcon className="w-12 h-12 text-amber-400" />,
      title: 'Real-Time Analytics',
      description: 'Track your academic progress with dynamic dashboards and predictive performance analysis',
      gradient: 'from-amber-500 to-orange-600'
    }
  ];

  const features = [
    {
      icon: <AcademicCapIcon className="w-8 h-8 text-white" />,
      title: 'Smart Tutoring',
      description: '24/7 AI mentor providing instant explanations and learning resources'
    },
    {
      icon: <ChatBubbleOvalLeftIcon className="w-8 h-8 text-white" />,
      title: 'Collaborative Learning',
      description: 'Real-time group study sessions with AI moderation'
    },
    {
      icon: <TrophyIcon className="w-8 h-8 text-white" />,
      title: 'Gamified Progress',
      description: 'Earn achievements and unlock new learning tiers'
    },
    {
      icon: <ClockIcon className="w-8 h-8 text-white" />,
      title: 'Adaptive Scheduling',
      description: 'AI-optimized study plans that evolve with your progress'
    }
  ];

  return (
    <section className="px-6 py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900/50">
      <div className="mx-auto max-w-7xl">
        {/* Animated Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-20 text-center"
        >
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-transparent md:text-6xl bg-gradient-to-r from-indigo-200 to-purple-300 bg-clip-text">
            Transform Your Learning Experience
          </h1>
          <p className="max-w-3xl mx-auto text-xl font-light text-gray-300">
            Discover the future of education with SPARK IQ's AI-driven platform, combining adaptive learning, real-time analytics, 
            and personalized mentorship for academic success.
          </p>
        </motion.div>

        {/* Interactive Steps Grid */}
        <div className="grid gap-8 mb-24 md:grid-cols-3">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="relative p-8 overflow-hidden transition-all duration-300 group bg-gradient-to-br hover:shadow-2xl rounded-2xl from-gray-800 to-gray-900 hover:to-indigo-900/30"
            >
              <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-10 mix-blend-soft-light" />
              
              <div className="relative z-10 space-y-6">
                <div className={`p-4 w-fit rounded-xl bg-gradient-to-br ${step.gradient}`}>
                  {step.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-100">
                  {step.title}
                  <span className="block w-12 h-1 mt-4 bg-indigo-400 rounded-full" />
                </h3>
                <p className="text-lg font-light leading-relaxed text-gray-400">
                  {step.description}
                </p>
                <div className="mt-4 transition-all duration-300 translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0">
                  <SparklesIcon className="w-6 h-6 text-indigo-400 animate-pulse" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Feature Grid */}
        <div className="grid gap-8 mb-24 md:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.3 }}
              className="p-6 transition-all duration-300 border rounded-xl border-white/10 hover:border-indigo-400/30 bg-gradient-to-b from-gray-800/50 to-transparent"
            >
              <div className="mb-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                  {feature.icon}
                </div>
              </div>
              <h4 className="mb-2 text-xl font-semibold text-gray-100">{feature.title}</h4>
              <p className="font-light text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden text-center bg-gradient-to-br from-indigo-900/50 to-purple-900/30 rounded-2xl p-14"
        >
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-[size:40px] opacity-10 mix-blend-soft-light" />
          <div className="relative z-10 space-y-6">
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              Ready to Revolutionize Your Learning?
            </h2>
            <p className="max-w-2xl mx-auto text-xl font-light text-gray-300">
              Join thousands of students and educators already experiencing the future of education
            </p>
            <div className="flex justify-center gap-4 mt-8">
              <Link
                to="/signup"
                className="px-8 py-4 font-medium text-white transition-all duration-300 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 hover:shadow-xl"
              >
                Start Free Trial
              </Link>
              <Link
                to="/pricing"
                className="px-8 py-4 font-medium text-gray-300 transition-all duration-300 border border-gray-700 rounded-lg hover:border-indigo-400 hover:text-white"
              >
                View Plans
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}