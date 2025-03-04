import { Link, useNavigate } from 'react-router';
import { LockClosedIcon, UserCircleIcon, SparklesIcon, AcademicCapIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function Signup() {
  const navigate = useNavigate();
  const [role, setRole] = useState('student'); // Default role is 'student'

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle signup logic
    navigate('/dashboard');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="w-full max-w-md space-y-8 bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700">
        {/* Logo & Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <SparklesIcon className="w-8 h-8 text-indigo-400 animate-pulse" />
            <span className="text-2xl font-bold text-white">SPARK-IQ</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-white">Create Account</h2>
          <p className="mt-2 text-gray-400">Join the AI-powered teaching revolution</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                Full Name
              </label>
              <div className="mt-1 relative">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  placeholder="John Doe"
                  className="w-full px-4 py-3 text-gray-100 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                />
                <UserCircleIcon className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Institutional Email
              </label>
              <div className="mt-1 relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="name@university.edu"
                  className="w-full px-4 py-3 text-gray-100 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                />
                <UserCircleIcon className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 text-gray-100 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                />
                <LockClosedIcon className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
                Confirm Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 text-gray-100 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                />
                <LockClosedIcon className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Role Selection */}
            <div className="flex gap-4">
              <div className="flex items-center">
                <input
                  id="student"
                  name="role"
                  type="radio"
                  value="student"
                  className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  defaultChecked
                  onChange={() => setRole('student')}
                />
                <label htmlFor="student" className="ml-2 block text-sm text-gray-300">
                  Student
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="educator"
                  name="role"
                  type="radio"
                  value="educator"
                  className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  onChange={() => setRole('educator')}
                />
                <label htmlFor="educator" className="ml-2 block text-sm text-gray-300">
                  Educator
                </label>
              </div>
            </div>

            {/* Dynamic Fields Based on Role */}
            {role === 'student' ? (
              <div>
                <label htmlFor="batch" className="block text-sm font-medium text-gray-300">
                  Batch
                </label>
                <div className="mt-1 relative">
                  <input
                    id="batch"
                    name="batch"
                    type="text"
                    required
                    placeholder="2023"
                    className="w-full px-4 py-3 text-gray-100 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  />
                  <AcademicCapIcon className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
            ) : (
              <div>
                <label htmlFor="subjects" className="block text-sm font-medium text-gray-300">
                  Subjects
                </label>
                <div className="mt-1 relative">
                  <input
                    id="subjects"
                    name="subjects"
                    type="text"
                    required
                    placeholder="Mathematics, Physics"
                    className="w-full px-4 py-3 text-gray-100 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  />
                  <BookOpenIcon className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            Create Account
          </button>
        </form>

        <p className="mt-8 text-center text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors duration-200">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}