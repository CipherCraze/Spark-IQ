import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LockClosedIcon, UserCircleIcon, SparklesIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { getAuth, signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app, googleProvider } from '../firebase/firebaseConfig';
import '../styles/animations.css';
import { trackUserAction, EVENT_NAMES, trackError } from '../firebase/analytics';

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const auth = getAuth(app);
  const db = getFirestore(app);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if user exists in Firestore and redirect to appropriate dashboard
      await checkUserRoleAndRedirect(user.uid);
      
    } catch (error) {
      console.error(error.message);
      if (error.code === 'auth/account-exists-with-different-credential') {
        setError('An account already exists with the same email address but different sign-in credentials.');
      } else {
        setError('Failed to sign in with Google. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to check user role and redirect to appropriate dashboard
  const checkUserRoleAndRedirect = async (userId) => {
    try {
      setLoading(true);
      // Check if user is a student
      const studentRef = doc(db, 'students', userId);
      const studentDoc = await getDoc(studentRef);
      
      if (studentDoc.exists()) {
        trackUserAction(EVENT_NAMES.LOGIN, {
          user_id: userId,
          role: 'student',
          method: 'email'
        });
        navigate('/dashboard');
        return;
      }
      
      // Check if user is a teacher
      const teacherRef = doc(db, 'teachers', userId);
      const teacherDoc = await getDoc(teacherRef);
      
      if (teacherDoc.exists()) {
        trackUserAction(EVENT_NAMES.LOGIN, {
          user_id: userId,
          role: 'teacher',
          method: 'email'
        });
        navigate('/educator-dashboard');
        return;
      }
      
      // If we get here, the user doesn't exist in either collection
      setError('User account not found. Please sign up first.');
      trackError('login_error', {
        error_type: 'user_not_found',
        user_id: userId
      });
      
    } catch (error) {
      console.error('Error checking user role:', error);
      if (error.code === 'permission-denied') {
        setError('Unable to verify your account. Please try signing up first.');
      } else {
        setError('Failed to retrieve your account information. Please try again.');
      }
      trackError('login_error', {
        error_type: 'role_check_failed',
        error_message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await checkUserRoleAndRedirect(userCredential.user.uid);
    } catch (error) {
      console.error('Login error:', error);
      setError('Failed to log in. Please check your credentials.');
      trackError('login_error', {
        error_type: 'authentication_failed',
        error_message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -top-48 -left-48 animate-float"></div>
        <div className="absolute w-96 h-96 bg-pink-500/20 rounded-full blur-3xl top-1/2 -right-48 animate-float"></div>
        <div className="absolute w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl bottom-48 left-1/4 animate-float"></div>
      </div>
      
      <div className="relative w-full max-w-md space-y-8 bg-gray-900/80 backdrop-blur-xl rounded-xl shadow-2xl p-10 border border-white/10 transition-all duration-300 hover:border-white/20">
        {/* Logo & Header */}
        <br></br>
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-6">
            <SparklesIcon className="w-10 h-10 text-purple-400 animate-pulse" />
            <span className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              IGNITIA
            </span>
          </div>
          <h4 className="mt-6 text-4xl font-bold text-transparent bg-gradient-to-r from-white to-purple-100 bg-clip-text">
            Welcome Back
          </h4>
          <p className="mt-3 text-gray-300/80 font-light tracking-wide">
            Unlock your AI-powered teaching potential
          </p>
        </div>

        {/* Google Sign-In Button */}
        <div className="space-y-4">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className={`w-full flex items-center justify-center gap-3 py-3.5 px-6 bg-white/5 hover:bg-white/10 text-gray-200 font-medium rounded-lg border border-white/10 transition-all duration-300 hover:border-white/20 group hover:shadow-glow ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            <svg className="w-6 h-6 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
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
            <span className="group-hover:text-white transition-colors">
              {loading ? 'Signing in...' : 'Continue with Google'}
            </span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-900/80 text-gray-400">or sign in with email</span>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-5">
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3.5 text-gray-100 bg-gray-800/60 border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 group-hover:border-gray-600 placeholder-gray-500"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
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
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-purple-500/20 relative overflow-hidden group ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            <span className="relative z-10">
              {loading ? 'Signing in...' : 'Sign in to Dashboard'}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>

          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg animate-fade-in">
              {error}
            </div>
          )}
        </form>

        {/* Signup Link */}
        <p className="mt-8 text-center text-gray-400">
          New to IGNITIA?{' '}
          <Link
            to="/signup"
            className="font-medium text-purple-400 hover:text-purple-300 transition-colors duration-300 relative group"
          >
            <span className="relative">
              Create institution account
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-purple-400 transition-all duration-300 group-hover:w-full"></span>
            </span>
          </Link>
        </p>
      </div>
    </div>
  );
}