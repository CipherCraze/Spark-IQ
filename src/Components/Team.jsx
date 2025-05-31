// components/Team.jsx
import React from "react";
import { motion } from "framer-motion";
import { 
  SwatchIcon,
  ServerStackIcon,
  CpuChipIcon,
  SparklesIcon
} from "@heroicons/react/24/solid"; // Ensure correct import path

const Team = () => {
  const teamMembers = [
    {
      name: "Pranav C R",
      role: "Developer & Team Lead",
      bio: "Innovative and strategic team lead with a passion for problem-solving",
      icon: CpuChipIcon, // Processing/AI icon
    },
    {
      name: "Noel Manoj",
      role: "Frontend Developer",
      bio: "UI/UX expert with a passion for accessible design",
      icon: SwatchIcon, // Design-focused icon
    },
    {
      name: "Joswin M J",
      role: "Backend Developer",
      bio: "Focused on scalable solutions and seamless integrations",
      icon: ServerStackIcon, // Server infrastructure icon
    },
    {
      name: "Niranjan J Rajesh",
      role: "Innovation Lead",
      bio: "Visionary leader with a passion for educational technology",
      icon: SparklesIcon, // Innovation/ideas icon
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
            Meet the Visionaries
          </motion.h1>
          <p className="max-w-3xl mx-auto text-xl leading-relaxed text-gray-300">
            A diverse team of innovators redefining educational technology through AI and human-centered design
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {teamMembers.map((member, idx) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-8 border shadow-2xl bg-gray-800/50 backdrop-blur-lg rounded-xl border-gray-700/30"
            >
              <div className="flex flex-col items-center text-center">
                <div className="relative w-32 h-32 mb-6">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 animate-pulse" />
                  <div className="absolute inset-1 rounded-full bg-gray-900" />
                  <member.icon className="absolute w-16 h-16 transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white">{member.name}</h3>
                <p className="mt-2 text-purple-400">{member.role}</p>
                <p className="mt-4 text-gray-400">{member.bio}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Values Section */}
        <motion.div 
          className="p-12 mt-20 border shadow-xl bg-gray-800/30 rounded-3xl border-gray-700/50"
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 50 }}
          viewport={{ once: true }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="mb-8 text-3xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text">
              Our Core Principles
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              {['Innovation', 'Integrity', 'Impact'].map((value, idx) => (
                <motion.div
                  key={value}
                  whileHover={{ scale: 1.05 }}
                  className="p-6 bg-gray-900 rounded-xl"
                >
                  <div className="text-4xl font-bold text-purple-400">{idx + 1}.</div>
                  <h3 className="mt-4 text-xl font-semibold text-white">{value}</h3>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.section>
    </div>
  );
};

export default Team;