import React from "react";
import { motion } from "framer-motion";
import { GlobeAltIcon, SparklesIcon, ShieldCheckIcon, UserGroupIcon, ChartBarIcon, HeartIcon } from "@heroicons/react/24/solid";

const About = () => {
  const stats = [
    { id: 1, value: "10K+", label: "Active Users", icon: UserGroupIcon },
    { id: 2, value: "95%", label: "Satisfaction Rate", icon: HeartIcon },
    { id: 3, value: "50K+", label: "Transactions", icon: ChartBarIcon },
  ];

  const features = [
    {
      title: "Secure Ecosystem",
      icon: ShieldCheckIcon,
      desc: "Military-grade encryption and multi-factor authentication protect every transaction",
    },
    {
      title: "Smart Matching",
      icon: SparklesIcon,
      desc: "AI-powered recommendations connect buyers and sellers instantly",
    },
    {
      title: "Global Campus Network",
      icon: GlobeAltIcon,
      desc: "Join our growing network across 100+ universities worldwide",
    },
  ];

  return (
    <div className="min-h-screen px-4 py-24 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mx-auto space-y-16 max-w-7xl"
      >
        {/* Hero Section */}
        <div className="space-y-6 text-center">
          <motion.h1 
            className="text-5xl font-bold text-transparent md:text-6xl bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Revolutionizing Campus Commerce
          </motion.h1>
          <p className="max-w-3xl mx-auto text-xl leading-relaxed text-gray-300">
            At Campus Mart, we're building more than a marketplace - we're creating a sustainable ecosystem where students 
            connect, trade, and grow. Powered by blockchain technology and community-driven values.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-8 md:grid-cols-3">
          {stats.map((stat) => (
            <motion.div 
              key={stat.id}
              whileHover={{ scale: 1.05 }}
              className="p-8 border shadow-2xl bg-gray-800/50 backdrop-blur-lg rounded-xl border-gray-700/30"
            >
              <stat.icon className="w-12 h-12 mb-4 text-purple-400" />
              <div className="text-4xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text">
                {stat.value}
              </div>
              <div className="mt-2 text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Core Features */}
        <div className="grid gap-8 lg:grid-cols-3">
          {features.map((feature, idx) => (
            <motion.div 
              key={feature.title}
              initial={{ opacity: 0, x: idx % 2 ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.2 }}
              className="relative p-8 overflow-hidden bg-gray-900 group rounded-2xl"
            >
              <div className="absolute inset-0 transition-opacity opacity-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 group-hover:opacity-100" />
              <feature.icon className="w-16 h-16 mb-6 text-purple-400" />
              <h3 className="mb-4 text-2xl font-bold text-white">{feature.title}</h3>
              <p className="leading-relaxed text-gray-400">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Mission Statement */}
        <motion.div 
          className="p-12 mt-20 border shadow-xl bg-gray-800/30 rounded-3xl border-gray-700/50"
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 50 }}
          viewport={{ once: true }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <SparklesIcon className="w-16 h-16 mx-auto mb-8 text-purple-400" />
            <h2 className="mb-6 text-3xl font-bold text-white">
              Our Commitment to Innovation
            </h2>
            <p className="text-xl leading-relaxed text-gray-300">
              We're pioneering the future of campus economies through decentralized finance solutions,
              NFT-based ownership proofs, and carbon-neutral transactions. Our platform evolves daily
              through machine learning and direct community feedback.
            </p>
          </div>
        </motion.div>

        {/* Team Preview */}
        <div className="mt-20 text-center">
          <h3 className="mb-12 text-3xl font-bold text-white">
            Founded by Students, For Students
          </h3>
          <div className="grid gap-8 md:grid-cols-3">
            {['Tech Lead', 'Community Head', 'Security Chief'].map((role, idx) => (
              <motion.div
                key={role}
                whileHover={{ scale: 1.05 }}
                className="p-8 bg-gray-800 border border-gray-700 rounded-xl"
              >
                <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-400 to-blue-400" />
                <h4 className="mb-2 text-xl font-semibold text-white">{role}</h4>
                <p className="text-gray-400">Campus Mart Founding Team</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default About;