import { Link, useNavigate } from 'react-router-dom';
import { LockClosedIcon, UserCircleIcon, SparklesIcon, AcademicCapIcon, BookOpenIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function Signup() {
  const navigate = useNavigate();
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Handle signup logic
    if (role === 'student') {
      navigate('/dashboard');
    } else if (role === 'educator') {
      navigate('/educator-dashboard');
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -top-48 -left-48 animate-float"></div>
        <div className="absolute w-96 h-96 bg-pink-500/20 rounded-full blur-3xl top-1/2 -right-48 animate-float-delayed"></div>
        <div className="absolute w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl bottom-48 left-1/4 animate-float"></div>
      </div>

      <div className="relative w-full max-w-md space-y-8 bg-gray-900/80 backdrop-blur-xl rounded-xl shadow-2xl p-10 border border-white/10 transition-all duration-300 hover:border-white/20">
        {/* Logo & Header */}
        <br></br>
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-6">
            <SparklesIcon className="w-10 h-10 text-purple-400 animate-pulse" />
            <span className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              SPARK-IQ
            </span>
          </div>
          <h2 className="mt-6 text-4xl font-bold text-transparent bg-gradient-to-r from-white to-purple-100 bg-clip-text">
            Create Account
          </h2>
          <p className="mt-3 text-gray-300/80 font-light tracking-wide">
            Join the AI-powered teaching revolution
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-5">
            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative group">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="John Doe"
                  className="w-full px-4 py-3.5 text-gray-100 bg-gray-800/60 border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 group-hover:border-gray-600 placeholder-gray-500"
                />
                <UserCircleIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Institutional Email
              </label>
              <div className="relative group">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="name@university.edu"
                  className="w-full px-4 py-3.5 text-gray-100 bg-gray-800/60 border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 group-hover:border-gray-600 placeholder-gray-500"
                />
                <UserCircleIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative group">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3.5 text-gray-100 bg-gray-800/60 border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 group-hover:border-gray-600 placeholder-gray-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative group">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3.5 text-gray-100 bg-gray-800/60 border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 group-hover:border-gray-600 placeholder-gray-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Role Selection */}
            <div className="flex gap-4 justify-center">
              <label
                className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                  role === 'student' 
                    ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg' 
                    : 'bg-gray-800/60 hover:bg-gray-700/50 text-gray-300 border border-gray-700'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="student"
                  checked={role === 'student'}
                  onChange={() => setRole('student')}
                  className="sr-only"
                />
                <AcademicCapIcon className="w-6 h-6" />
                <span className="font-medium">Student</span>
              </label>
              <label
                className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                  role === 'educator' 
                    ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg' 
                    : 'bg-gray-800/60 hover:bg-gray-700/50 text-gray-300 border border-gray-700'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="educator"
                  checked={role === 'educator'}
                  onChange={() => setRole('educator')}
                  className="sr-only"
                />
                <BookOpenIcon className="w-6 h-6" />
                <span className="font-medium">Educator</span>
              </label>
            </div>

            {/* Dynamic Fields */}
            <div className="animate-fade-in">
              {role === 'student' ? (
                <div>
                  <label htmlFor="batch" className="block text-sm font-medium text-gray-300 mb-2">
                    Batch
                  </label>
                  <div className="relative group">
                    <input
                      id="batch"
                      name="batch"
                      type="text"
                      required
                      placeholder="2023"
                      className="w-full px-4 py-3.5 text-gray-100 bg-gray-800/60 border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 group-hover:border-gray-600 placeholder-gray-500"
                    />
                    <AcademicCapIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                  </div>
                </div>
              ) : (
                <div>
                  <label htmlFor="subjects" className="block text-sm font-medium text-gray-300 mb-2">
                    Subjects
                  </label>
                  <div className="relative group">
                    <input
                      id="subjects"
                      name="subjects"
                      type="text"
                      required
                      placeholder="Mathematics, Physics"
                      className="w-full px-4 py-3.5 text-gray-100 bg-gray-800/60 border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 group-hover:border-gray-600 placeholder-gray-500"
                    />
                    <BookOpenIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-purple-500/20 relative overflow-hidden group"
          >
            <span className="relative z-10">Create Account</span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>

          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg animate-fade-in">
              {error}
            </div>
          )}
        </form>

        {/* Login Link */}
        <p className="mt-8 text-center text-gray-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-purple-400 hover:text-purple-300 transition-colors duration-300 relative group"
          >
            <span className="relative">
              Login here
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-purple-400 transition-all duration-300 group-hover:w-full"></span>
            </span>
          </Link>
        </p>
      </div>

      {/* Custom Animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 8s ease-in-out infinite 2s;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}