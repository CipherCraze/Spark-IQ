import { Link, useNavigate } from 'react-router';
import { LockClosedIcon, UserCircleIcon, SparklesIcon } from '@heroicons/react/24/outline';

export default function Login() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic
    navigate('/dashboard');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      
      <div className="w-full max-w-md space-y-8 bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700">
        <br></br>
        {/* Logo & Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <SparklesIcon className="w-8 h-8 text-indigo-400 animate-pulse" />
            <span className="text-2xl font-bold text-white">SPARK-IQ</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-white">Welcome Back</h2>
          <p className="mt-2 text-gray-400">Unlock your AI-powered teaching dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
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
                  autoComplete="current-password"
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
                  id="teacher"
                  name="role"
                  type="radio"
                  value="teacher"
                  className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  defaultChecked
                />
                <label htmlFor="teacher" className="ml-2 block text-sm text-gray-300">
                  Educator
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="student"
                  name="role"
                  type="radio"
                  value="student"
                  className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                />
                <label htmlFor="student" className="ml-2 block text-sm text-gray-300">
                  Student
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 border-gray-600 rounded focus:ring-indigo-500"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-400">
                Remember me
              </label>
            </div>
            <Link to="/forgot-password" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors duration-200">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            Sign in to Dashboard
          </button>

          {/* Google Sign-In */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-300 transition-all duration-200 transform hover:scale-105"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>
        </form>

        <p className="mt-8 text-center text-gray-400">
          New to SPARK-IQ?{' '}
          <Link to="/signup" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors duration-200">
            Create institution account
          </Link>
        </p>
      </div>
    </div>
  );
}