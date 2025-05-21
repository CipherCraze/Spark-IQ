import { useState, useEffect } from 'react';
import { 
  FiSettings, FiUser, FiLock, FiBell, FiMoon, FiGlobe, 
  FiCreditCard, FiHelpCircle, FiSun, FiLogOut, FiEye, FiEyeOff,
  FiCheck, FiX, FiDownload, FiPlus, FiTrash2, FiMail, FiPhone,
  FiChevronDown, FiMenu, FiX as FiClose, FiChevronRight
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';

const ACCENT_COLORS = ['#8B5CF6', '#7C3AED', '#6D28D9', '#9333EA', '#A855F7'];
const FONT_SIZES = ['Small', 'Medium', 'Large'];
const DENSITIES = ['Compact', 'Normal', 'Comfortable'];

const SettingsPage = () => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(search);
  const initialTab = queryParams.get('tab') || 'account';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [darkMode, setDarkMode] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [language, setLanguage] = useState('en');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    security: true,
    notifications: true,
    appearance: true
  });
  const [user, setUser] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    education: '',
  });
  const [avatarUrl, setAvatarUrl] = useState(() => localStorage.getItem('profileAvatar') || null);
  const [formErrors, setFormErrors] = useState({});
  const [passwordError, setPasswordError] = useState('');
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('accentColor') || '#8B5CF6');
  const [fontSize, setFontSize] = useState(() => localStorage.getItem('fontSize') || 'Medium');
  const [density, setDensity] = useState(() => localStorage.getItem('density') || 'Normal');

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateAccountForm = () => {
    const errors = {};
    if (!user.name.trim()) errors.name = 'Full name is required';
    if (!user.email.trim()) errors.email = 'Email is required';
    else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(user.email)) errors.email = 'Invalid email address';
    if (!user.phone.trim()) errors.phone = 'Phone number is required';
    if (!user.location.trim()) errors.location = 'Location is required';
    if (!user.education.trim()) errors.education = 'Education is required';
    return errors;
  };

  const getPasswordStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 6) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const validatePassword = (pwd) => {
    if (pwd.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(pwd)) return 'Password must contain an uppercase letter';
    if (!/[0-9]/.test(pwd)) return 'Password must contain a number';
    if (!/[^A-Za-z0-9]/.test(pwd)) return 'Password must contain a special character';
    return '';
  };

  useEffect(() => {
    // Check user's preferred color scheme
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);
  }, []);

  useEffect(() => {
    // Apply dark mode class to body
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', accentColor);
    localStorage.setItem('accentColor', accentColor);
  }, [accentColor]);

  useEffect(() => {
    document.documentElement.setAttribute('data-font-size', fontSize);
    localStorage.setItem('fontSize', fontSize);
  }, [fontSize]);

  useEffect(() => {
    document.documentElement.setAttribute('data-density', density);
    localStorage.setItem('density', density);
  }, [density]);

  // Update activeTab if URL changes (for SPA navigation)
  useEffect(() => {
    const params = new URLSearchParams(search);
    const tab = params.get('tab');
    if (tab && tab !== activeTab) setActiveTab(tab);
  }, [search]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validateAccountForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      showToast('Please fix the errors in the form.', 'error');
      return;
    }
    localStorage.setItem('profileUser', JSON.stringify(user));
    if (avatarUrl) localStorage.setItem('profileAvatar', avatarUrl);
    showToast('Settings saved successfully!', 'success');
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    const pwdError = validatePassword(newPassword);
    setPasswordError(pwdError);
    if (pwdError) return;
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match!');
      return;
    }
    showToast('Password changed successfully!', 'success');
    setShowPasswordForm(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          // NOTE: This does NOT upload to a server, just creates a local URL and stores in localStorage
          const url = URL.createObjectURL(file);
          setAvatar(url);
          setAvatarUrl(url);
          localStorage.setItem('profileAvatar', url);
          showToast('Profile picture updated!', 'success');
        }
      }, 100);
    }
  };

  const showToast = (message, type) => {
    // In a real app, you would use a toast library or component
    alert(`${type === 'success' ? '✅' : '❌'} ${message}`);
  };

  const navItems = [
    { id: 'account', icon: FiUser, label: 'Account' },
    { id: 'security', icon: FiLock, label: 'Security' },
    { id: 'notifications', icon: FiBell, label: 'Notifications' },
    { id: 'appearance', icon: darkMode ? FiSun : FiMoon, label: 'Appearance' },
    { id: 'language', icon: FiGlobe, label: 'Language' },
    { id: 'billing', icon: FiCreditCard, label: 'Billing' },
    { id: 'help', icon: FiHelpCircle, label: 'Help' },
  ];

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'dark' : ''}`}>
      {/* Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-gray-900 to-gray-900 -z-10"></div>
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Back button */}
            <button
              onClick={() => navigate('/profile')}
              className="text-gray-400 hover:text-white mr-2"
              title="Back to Profile"
            >
              {/* Simple left arrow SVG */}
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden text-gray-400 hover:text-white"
            >
              <FiMenu className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-600 rounded-lg">
                <FiSettings className="text-white w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-white">Settings</h1>
            </div>
          </div>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
          >
            {darkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 z-50 md:hidden"
                onClick={() => setMobileMenuOpen(false)}
              />
              <motion.div 
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed inset-y-0 left-0 z-50 w-72 bg-gray-900 border-r border-gray-800 overflow-y-auto md:hidden"
              >
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-600 rounded-lg">
                      <FiSettings className="text-white w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-bold text-white">Settings</h2>
                  </div>
                  <button 
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-gray-800"
                  >
                    <FiClose className="w-5 h-5" />
                  </button>
                </div>
                <nav className="p-4 space-y-1">
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                        activeTab === item.id
                          ? 'bg-purple-600/20 text-purple-400 border-l-4 border-purple-500'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800'
                      }`}
                    >
                      <item.icon className="mr-3 w-5 h-5" />
                      {item.label}
                    </button>
                  ))}
                  <button
                    onClick={() => showToast('Logged out successfully!', 'success')}
                    className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-400 rounded-lg hover:text-red-300 hover:bg-gray-800 mt-6"
                  >
                    <FiLogOut className="mr-3 w-5 h-5" />
                    Log Out
                  </button>
                </nav>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Desktop Sidebar */}
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="w-64 flex flex-col border-r border-gray-800 bg-gray-900/80">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <nav className="flex-1 px-4 space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === item.id
                        ? 'bg-purple-600/20 text-purple-400 border-l-4 border-purple-500'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <item.icon className="mr-3 w-5 h-5" />
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
            <div className="p-4 border-t border-gray-800">
              <button
                onClick={() => showToast('Logged out successfully!', 'success')}
                className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-red-400 bg-gray-800/50 rounded-lg hover:bg-gray-800 hover:text-red-300 transition-colors"
              >
                <FiLogOut className="mr-2 w-5 h-5" />
                Log Out
              </button>
            </div>
          </div>
        </div>

        {/* Main Settings Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6">
            {/* Account Tab */}
            {activeTab === 'account' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">Account Information</h2>
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
                
                {/* Avatar Upload */}
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden border-2 border-purple-500/30">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <FiUser className="w-10 h-10 text-gray-500" />
                        )}
                        {uploadProgress > 0 && uploadProgress < 100 && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <div className="w-16 h-1 bg-gray-600 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-purple-500 transition-all duration-300" 
                                style={{ width: `${uploadProgress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-white mb-1">Profile Picture</h3>
                      <p className="text-sm text-gray-400 mb-4">Recommended size: 200x200 pixels</p>
                      <label className="cursor-pointer">
                        <span className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center">
                          <FiPlus className="w-4 h-4 mr-2" />
                          Change Photo
                        </span>
                        <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* Account Form */}
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                    <h3 className="text-lg font-medium text-white mb-4">Personal Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={user.name}
                          onChange={handleEditChange}
                          placeholder="Enter your full name"
                          className={`w-full px-4 py-2 text-white bg-gray-700 border ${formErrors.name ? 'border-red-500' : 'border-gray-600'} rounded-lg focus:ring-purple-500 focus:border-purple-500 transition-colors placeholder-gray-500`}
                        />
                        {formErrors.name && <div className="text-red-400 text-xs mt-1">{formErrors.name}</div>}
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={user.email}
                          onChange={handleEditChange}
                          placeholder="Enter your email"
                          className={`w-full px-4 py-2 text-white bg-gray-700 border ${formErrors.email ? 'border-red-500' : 'border-gray-600'} rounded-lg focus:ring-purple-500 focus:border-purple-500 transition-colors placeholder-gray-500`}
                        />
                        {formErrors.email && <div className="text-red-400 text-xs mt-1">{formErrors.email}</div>}
                      </div>
                      
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-400 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={user.phone}
                          onChange={handleEditChange}
                          placeholder="Enter your phone number"
                          className={`w-full px-4 py-2 text-white bg-gray-700 border ${formErrors.phone ? 'border-red-500' : 'border-gray-600'} rounded-lg focus:ring-purple-500 focus:border-purple-500 transition-colors placeholder-gray-500`}
                        />
                        {formErrors.phone && <div className="text-red-400 text-xs mt-1">{formErrors.phone}</div>}
                      </div>

                      <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-400 mb-1">
                          Location
                        </label>
                        <input
                          type="text"
                          id="location"
                          name="location"
                          value={user.location}
                          onChange={handleEditChange}
                          placeholder="Enter your location"
                          className={`w-full px-4 py-2 text-white bg-gray-700 border ${formErrors.location ? 'border-red-500' : 'border-gray-600'} rounded-lg focus:ring-purple-500 focus:border-purple-500 transition-colors placeholder-gray-500`}
                        />
                        {formErrors.location && <div className="text-red-400 text-xs mt-1">{formErrors.location}</div>}
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-400 mb-1">
                        Bio
                      </label>
                      <textarea
                        id="bio"
                        name="bio"
                        rows={4}
                        value={user.bio}
                        onChange={handleEditChange}
                        placeholder="Tell us about yourself..."
                        className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 transition-colors placeholder-gray-500"
                      ></textarea>
                    </div>

                    <div className="mt-4">
                      <label htmlFor="education" className="block text-sm font-medium text-gray-400 mb-1">
                        Education
                      </label>
                      <input
                        type="text"
                        id="education"
                        name="education"
                        value={user.education}
                        onChange={handleEditChange}
                        placeholder="Enter your education"
                        className={`w-full px-4 py-2 text-white bg-gray-700 border ${formErrors.education ? 'border-red-500' : 'border-gray-600'} rounded-lg focus:ring-purple-500 focus:border-purple-500 transition-colors placeholder-gray-500`}
                      />
                      {formErrors.education && <div className="text-red-400 text-xs mt-1">{formErrors.education}</div>}
                    </div>
                  </div>
                  <div className="flex justify-end mt-4">
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-white">Security Settings</h2>
                
                {/* Password Section */}
                <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
                  <button 
                    onClick={() => toggleSection('security')}
                    className="w-full flex justify-between items-center p-6 text-left focus:outline-none"
                  >
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-600/20 rounded-lg text-purple-400 mr-4">
                        <FiLock className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-white">Password</h3>
                        <p className="text-sm text-gray-400 mt-1">Last changed 3 months ago</p>
                      </div>
                    </div>
                    <FiChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.security ? 'transform rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {expandedSections.security && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="px-6 pb-6"
                      >
                        {showPasswordForm ? (
                          <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <div>
                              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-400 mb-1">
                                Current Password
                              </label>
                              <div className="relative">
                                <input
                                  type={showCurrentPassword ? "text" : "password"}
                                  id="currentPassword"
                                  value={currentPassword}
                                  onChange={(e) => setCurrentPassword(e.target.value)}
                                  placeholder="Enter current password"
                                  className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 transition-colors pr-10 placeholder-gray-500"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                                >
                                  {showCurrentPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                                </button>
                              </div>
                            </div>
                            
                            <div>
                              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-400 mb-1">
                                New Password
                              </label>
                              <div className="relative">
                                <input
                                  type={showNewPassword ? "text" : "password"}
                                  id="newPassword"
                                  value={newPassword}
                                  onChange={(e) => setNewPassword(e.target.value)}
                                  placeholder="Enter new password"
                                  className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 transition-colors pr-10 placeholder-gray-500"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowNewPassword(!showNewPassword)}
                                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                                >
                                  {showNewPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                                </button>
                              </div>
                            </div>
                            
                            <div>
                              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-400 mb-1">
                                Confirm New Password
                              </label>
                              <div className="relative">
                                <input
                                  type={showConfirmPassword ? "text" : "password"}
                                  id="confirmPassword"
                                  value={confirmPassword}
                                  onChange={(e) => setConfirmPassword(e.target.value)}
                                  placeholder="Confirm new password"
                                  className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 transition-colors pr-10 placeholder-gray-500"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                                >
                                  {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                                </button>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 pt-2">
                              <div className="flex-1 flex space-x-1">
                                <div className={`h-1 flex-1 rounded-full ${getPasswordStrength(newPassword) > 0 ? 'bg-red-500' : 'bg-gray-600'}`}></div>
                                <div className={`h-1 flex-1 rounded-full ${getPasswordStrength(newPassword) > 2 ? 'bg-yellow-500' : 'bg-gray-600'}`}></div>
                                <div className={`h-1 flex-1 rounded-full ${getPasswordStrength(newPassword) > 3 ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                              </div>
                              <span className="text-xs text-gray-400">
                                {newPassword.length === 0 ? '' : 
                                  getPasswordStrength(newPassword) <= 1 ? 'Weak' : 
                                  getPasswordStrength(newPassword) === 2 ? 'Medium' : 'Strong'}
                              </span>
                            </div>
                            {passwordError && <div className="text-red-400 text-xs">{passwordError}</div>}
                            
                            <div className="flex justify-end space-x-3 pt-4">
                              <button
                                type="button"
                                onClick={() => setShowPasswordForm(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={!newPassword || !confirmPassword}
                                className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                                  !newPassword || !confirmPassword
                                    ? 'bg-purple-500/50 cursor-not-allowed'
                                    : 'bg-purple-600 hover:bg-purple-700'
                                }`}
                              >
                                Update Password
                              </button>
                            </div>
                          </form>
                        ) : (
                          <button
                            onClick={() => setShowPasswordForm(true)}
                            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            Change Password
                          </button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                {/* 2FA Section */}
                <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
                  <button 
                    className="w-full flex justify-between items-center p-6 text-left focus:outline-none"
                  >
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-600/20 rounded-lg text-purple-400 mr-4">
                        <FiLock className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-white">Two-Factor Authentication</h3>
                        <p className="text-sm text-gray-400 mt-1">Add an extra layer of security to your account</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </button>
                </div>
                
                {/* Active Sessions */}
                <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
                  <button 
                    className="w-full flex justify-between items-center p-6 text-left focus:outline-none"
                  >
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-600/20 rounded-lg text-purple-400 mr-4">
                        <FiGlobe className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-white">Active Sessions</h3>
                        <p className="text-sm text-gray-400 mt-1">Manage your logged-in devices</p>
                      </div>
                    </div>
                    <FiChevronDown className="w-5 h-5 text-gray-400" />
                  </button>
                  
                  <div className="px-6 pb-6 space-y-4">
                    <div className="flex items-start p-4 rounded-lg bg-gray-700/50 border-l-4 border-purple-500">
                      <div className="flex-shrink-0 p-2 bg-gray-600 rounded-lg text-purple-400">
                        <FiGlobe className="w-5 h-5" />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex justify-between">
                          <p className="text-sm font-medium text-white">Current Session</p>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-200">
                            Active
                          </span>
                        </div>
                        <p className="text-sm text-gray-400">Chrome on Windows • New York, USA</p>
                        <p className="text-xs text-gray-500 mt-1">Last active: Just now</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start p-4 rounded-lg hover:bg-gray-700/30 transition-colors">
                      <div className="flex-shrink-0 p-2 bg-gray-600 rounded-lg text-gray-400">
                        <FiPhone className="w-5 h-5" />
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="text-sm font-medium text-white">Mobile App</p>
                        <p className="text-sm text-gray-400">iOS • iPhone 13</p>
                        <p className="text-xs text-gray-500 mt-1">Last active: 2 hours ago</p>
                      </div>
                      <button className="text-gray-500 hover:text-gray-300">
                        <FiX className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <button className="w-full px-4 py-2 text-sm font-medium text-red-400 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center">
                      <FiLogOut className="mr-2 w-5 h-5" />
                      Log Out All Other Devices
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-white">Notification Preferences</h2>
                
                {/* Global Notifications */}
                <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
                  <button 
                    onClick={() => toggleSection('notifications')}
                    className="w-full flex justify-between items-center p-6 text-left focus:outline-none"
                  >
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-600/20 rounded-lg text-purple-400 mr-4">
                        <FiBell className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-white">Global Notifications</h3>
                        <p className="text-sm text-gray-400 mt-1">Enable or disable all notifications at once</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={notificationsEnabled}
                          onChange={(e) => setNotificationsEnabled(e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                      <FiChevronDown className={`ml-4 w-5 h-5 text-gray-400 transition-transform ${expandedSections.notifications ? 'transform rotate-180' : ''}`} />
                    </div>
                  </button>
                  
                  <AnimatePresence>
                    {expandedSections.notifications && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="px-6 pb-6 space-y-6"
                      >
                        {/* Notification Channels */}
                        <div className="space-y-4">
                          <h4 className="text-md font-medium text-white">Notification Channels</h4>
                          
                          <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-purple-600/20 rounded-lg text-purple-400">
                                  <FiMail className="w-5 h-5" />
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium text-white">Email Notifications</h4>
                                  <p className="text-sm text-gray-400">Receive notifications via email</p>
                                </div>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  className="sr-only peer" 
                                  checked={emailNotifications}
                                  onChange={(e) => setEmailNotifications(e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                              </label>
                            </div>
                            
                            <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-purple-600/20 rounded-lg text-purple-400">
                                  <FiBell className="w-5 h-5" />
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium text-white">Push Notifications</h4>
                                  <p className="text-sm text-gray-400">Receive notifications on your device</p>
                                </div>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  className="sr-only peer" 
                                  checked={pushNotifications}
                                  onChange={(e) => setPushNotifications(e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                              </label>
                            </div>
                          </div>
                        </div>
                        
                        {/* Course Notifications */}
                        <div className="space-y-4">
                          <h4 className="text-md font-medium text-white">Course Notifications</h4>
                          
                          <div className="space-y-3">
                            {[
                              { id: 'announcements', label: 'New course announcements', checked: true },
                              { id: 'deadlines', label: 'Assignment deadlines', checked: true },
                              { id: 'forum', label: 'Forum activity', checked: false },
                              { id: 'recommendations', label: 'Course recommendations', checked: true }
                            ].map((item) => (
                              <div key={item.id} className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                                <label className="relative flex items-center cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    className="sr-only peer" 
                                    defaultChecked={item.checked}
                                  />
                                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                  <span className="ml-3 text-sm font-medium text-white">{item.label}</span>
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex justify-end space-x-3 pt-2">
                          <button className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 transition-colors">
                            Reset to Default
                          </button>
                          <button className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors">
                            Save Preferences
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-white">Appearance</h2>
                
                {/* Theme Selection */}
                <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
                  <button 
                    onClick={() => toggleSection('appearance')}
                    className="w-full flex justify-between items-center p-6 text-left focus:outline-none"
                  >
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-600/20 rounded-lg text-purple-400 mr-4">
                        {darkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-white">Theme</h3>
                        <p className="text-sm text-gray-400 mt-1">Customize your interface appearance</p>
                      </div>
                    </div>
                    <FiChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.appearance ? 'transform rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {expandedSections.appearance && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="px-6 pb-6 space-y-6"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div 
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                              !darkMode 
                                ? 'border-purple-500 bg-purple-500/10' 
                                : 'border-gray-700 hover:border-gray-600'
                            }`}
                            onClick={() => setDarkMode(false)}
                          >
                            <div className="h-32 rounded-lg relative overflow-hidden bg-gray-50">
                              <div className="absolute top-0 left-0 right-0 h-4 bg-white border-b border-gray-200"></div>
                              <div className="absolute top-4 left-0 w-10 h-full bg-white border-r border-gray-200"></div>
                              <div className="absolute top-4 left-10 right-0 h-full bg-gray-50"></div>
                            </div>
                            <div className="mt-4 flex items-center justify-center">
                              <FiSun className="w-5 h-5 text-gray-300 mr-2" />
                              <span className="font-medium text-white">Light</span>
                              {!darkMode && <FiCheck className="w-5 h-5 text-purple-400 ml-2" />}
                            </div>
                          </div>
                          
                          <div 
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                              darkMode 
                                ? 'border-purple-500 bg-purple-500/10' 
                                : 'border-gray-700 hover:border-gray-600'
                            }`}
                            onClick={() => setDarkMode(true)}
                          >
                            <div className="h-32 rounded-lg relative overflow-hidden bg-gray-900">
                              <div className="absolute top-0 left-0 right-0 h-4 bg-gray-800 border-b border-gray-700"></div>
                              <div className="absolute top-4 left-0 w-10 h-full bg-gray-800 border-r border-gray-700"></div>
                              <div className="absolute top-4 left-10 right-0 h-full bg-gray-900"></div>
                            </div>
                            <div className="mt-4 flex items-center justify-center">
                              <FiMoon className="w-5 h-5 text-gray-300 mr-2" />
                              <span className="font-medium text-white">Dark</span>
                              {darkMode && <FiCheck className="w-5 h-5 text-purple-400 ml-2" />}
                            </div>
                          </div>
                        </div>
                        
                        {/* Accent Color */}
                        <div>
                          <h4 className="text-md font-medium text-white mb-4">Accent Color</h4>
                          
                          <div className="flex flex-wrap gap-3">
                            {ACCENT_COLORS.map((color) => (
                              <div 
                                key={color}
                                className={`w-10 h-10 rounded-full cursor-pointer border-2 flex items-center justify-center transition-colors
                                  ${accentColor === color ? 'border-white' : 'border-transparent hover:border-white/20'}`}
                                style={{ backgroundColor: color }}
                                onClick={() => setAccentColor(color)}
                              >
                                {accentColor === color && <FiCheck className="w-4 h-4 text-white" />}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Font Size */}
                        <div>
                          <h4 className="text-md font-medium text-white mb-4">Font Size</h4>
                          
                          <div className="flex flex-wrap gap-3">
                            {FONT_SIZES.map((size) => (
                              <button
                                key={size}
                                onClick={() => setFontSize(size)}
                                className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                                  fontSize === size
                                    ? 'bg-purple-600 text-white border-purple-600'
                                    : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                                }`}
                              >
                                {size}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        {/* Density */}
                        <div>
                          <h4 className="text-md font-medium text-white mb-4">Density</h4>
                          
                          <div className="flex flex-wrap gap-3">
                            {DENSITIES.map((d) => (
                              <button
                                key={d}
                                onClick={() => setDensity(d)}
                                className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                                  density === d
                                    ? 'bg-purple-600 text-white border-purple-600'
                                    : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                                }`}
                              >
                                {d}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex justify-end pt-2">
                          <button
                            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                            onClick={() => showToast('Appearance settings applied!', 'success')}
                          >
                            Apply Changes
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* Language Tab */}
            {activeTab === 'language' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-white">Language & Region</h2>
                
                <form className="space-y-4">
                  <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 space-y-4">
                    <div>
                      <label htmlFor="language" className="block text-sm font-medium text-gray-400 mb-1">
                        Language
                      </label>
                      <select
                        id="language"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 transition-colors appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1jaGV2cm9uLWRvd24iPjxwYXRoIGQ9Im02IDkgNiA2IDYtNiIvPjwvc3ZnPg==')] bg-no-repeat bg-[center_right_1rem] bg-[length:1.5rem]"
                      >
                        <option value="en">English</option>
                        <option value="es">Español (Spanish)</option>
                        <option value="fr">Français (French)</option>
                        <option value="de">Deutsch (German)</option>
                        <option value="zh">中文 (Chinese)</option>
                        <option value="ja">日本語 (Japanese)</option>
                        <option value="ru">Русский (Russian)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="timezone" className="block text-sm font-medium text-gray-400 mb-1">
                        Time Zone
                      </label>
                      <select
                        id="timezone"
                        defaultValue="UTC-05:00"
                        className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 transition-colors appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1jaGV2cm9uLWRvd24iPjxwYXRoIGQ9Im02IDkgNiA2IDYtNiIvPjwvc3ZnPg==')] bg-no-repeat bg-[center_right_1rem] bg-[length:1.5rem]"
                      >
                        <option value="UTC-12:00">(UTC-12:00) International Date Line West</option>
                        <option value="UTC-05:00">(UTC-05:00) Eastern Time (US & Canada)</option>
                        <option value="UTC">(UTC) Greenwich Mean Time (London)</option>
                        <option value="UTC+01:00">(UTC+01:00) Central European Time</option>
                        <option value="UTC+05:30">(UTC+05:30) India Standard Time</option>
                        <option value="UTC+08:00">(UTC+08:00) China Standard Time</option>
                        <option value="UTC+09:00">(UTC+09:00) Japan Standard Time</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="date-format" className="block text-sm font-medium text-gray-400 mb-1">
                        Date Format
                      </label>
                      <select
                        id="date-format"
                        defaultValue="mm/dd/yyyy"
                        className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 transition-colors appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1jaGV2cm9uLWRvd24iPjxwYXRoIGQ9Im02IDkgNiA2IDYtNiIvPjwvc3ZnPg==')] bg-no-repeat bg-[center_right_1rem] bg-[length:1.5rem]"
                      >
                        <option value="mm/dd/yyyy">MM/DD/YYYY (12/31/2023)</option>
                        <option value="dd/mm/yyyy">DD/MM/YYYY (31/12/2023)</option>
                        <option value="yyyy-mm-dd">YYYY-MM-DD (2023-12-31)</option>
                        <option value="month-day-year">Month Day, Year (December 31, 2023)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="time-format" className="block text-sm font-medium text-gray-400 mb-1">
                        Time Format
                      </label>
                      <select
                        id="time-format"
                        defaultValue="12h"
                        className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 transition-colors appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1jaGV2cm9uLWRvd24iPjxwYXRoIGQ9Im02IDkgNiA2IDYtNiIvPjwvc3ZnPg==')] bg-no-repeat bg-[center_right_1rem] bg-[length:1.5rem]"
                      >
                        <option value="12h">12-hour (2:30 PM)</option>
                        <option value="24h">24-hour (14:30)</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors">
                      Save Preferences
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-white">Billing & Subscription</h2>
                
                {/* Current Plan */}
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-white">Current Plan</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-200">
                      Active
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold text-white">$9.99</span>
                      <span className="ml-1 text-sm text-gray-400">/month</span>
                    </div>
                    
                    <div className="text-lg font-medium text-white">Premium</div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <FiCheck className="w-5 h-5 text-green-500 mr-2" />
                        <span className="text-gray-300">Unlimited courses</span>
                      </div>
                      <div className="flex items-center">
                        <FiCheck className="w-5 h-5 text-green-500 mr-2" />
                        <span className="text-gray-300">Offline access</span>
                      </div>
                      <div className="flex items-center">
                        <FiCheck className="w-5 h-5 text-green-500 mr-2" />
                        <span className="text-gray-300">Certificate generation</span>
                      </div>
                      <div className="flex items-center">
                        <FiCheck className="w-5 h-5 text-green-500 mr-2" />
                        <span className="text-gray-300">Priority support</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3 pt-2">
                      <button className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors">
                        Change Plan
                      </button>
                      <button className="px-4 py-2 text-sm font-medium text-red-400 bg-gray-700/50 rounded-lg hover:bg-gray-700 hover:text-red-300 transition-colors">
                        Cancel Subscription
                      </button>
                    </div>
                    
                    <div className="text-sm text-gray-400 pt-2">
                      Next billing date: <span className="font-medium text-white">April 15, 2023</span>
                    </div>
                  </div>
                </div>
                
                {/* Payment Method */}
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-white">Payment Method</h3>
                    <button className="px-3 py-1.5 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors flex items-center">
                      <FiPlus className="w-4 h-4 mr-1" />
                      Add New
                    </button>
                  </div>
                  
                  <div className="flex items-center p-4 bg-gray-700/30 rounded-lg">
                    <div className="p-2 bg-gray-600 rounded-lg text-gray-300">
                      <FiCreditCard className="w-6 h-6" />
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="text-xs text-gray-400">VISA</div>
                      <div className="font-medium text-white">•••• •••• •••• 4242</div>
                      <div className="text-sm text-gray-400">Expires 04/2025</div>
                    </div>
                    <button className="text-sm font-medium text-purple-400 hover:text-purple-300">
                      Edit
                    </button>
                  </div>
                </div>
                
                {/* Billing History */}
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-medium text-white mb-4">Billing History</h3>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                      <thead className="bg-gray-700/50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Description</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Receipt</th>
                        </tr>
                      </thead>
                      <tbody className="bg-gray-800/50 divide-y divide-gray-700">
                        {[
                          { date: 'Mar 15, 2023', desc: 'Premium Subscription', amount: '$9.99' },
                          { date: 'Feb 15, 2023', desc: 'Premium Subscription', amount: '$9.99' },
                          { date: 'Jan 15, 2023', desc: 'Premium Subscription', amount: '$9.99' }
                        ].map((item, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{item.date}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{item.desc}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{item.amount}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-400">
                              <button className="flex items-center hover:underline">
                                <FiDownload className="w-4 h-4 mr-1" />
                                Download
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Help Tab */}
            {activeTab === 'help' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-white">Help & Support</h2>
                
                {/* Search */}
                <div className="flex">
                  <input
                    type="text"
                    placeholder="Search help articles..."
                    className="flex-1 px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-l-lg focus:ring-purple-500 focus:border-purple-500 transition-colors placeholder-gray-500"
                  />
                  <button className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-r-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors">
                    Search
                  </button>
                </div>
                
                {/* FAQs */}
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-medium text-white mb-4">Frequently Asked Questions</h3>
                  
                  <div className="space-y-4">
                    {[
                      {
                        question: "How do I reset my password?",
                        answer: "You can reset your password from the Security tab in Settings or by clicking 'Forgot Password' on the login page. A password reset link will be sent to your registered email address."
                      },
                      {
                        question: "How do I cancel my subscription?",
                        answer: "Go to the Billing tab in Settings and click 'Cancel Subscription'. Your subscription will remain active until the end of the current billing period."
                      },
                      {
                        question: "Can I download courses for offline viewing?",
                        answer: "Yes, with a Premium subscription you can download courses for offline viewing. Look for the download icon next to course videos."
                      },
                      {
                        question: "How do I get a course completion certificate?",
                        answer: "Certificates are automatically generated when you complete all lessons and pass the course assessment with a score of 80% or higher. You can download them from your profile."
                      }
                    ].map((faq, index) => (
                      <div key={index} className="border-b border-gray-700 pb-4 last:border-0 last:pb-0">
                        <h4 className="text-md font-medium text-white cursor-pointer hover:text-purple-400 transition-colors flex items-center justify-between">
                          {faq.question}
                          <FiChevronRight className="w-5 h-5" />
                        </h4>
                        <div className="mt-2 text-sm text-gray-400">
                          <p>{faq.answer}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Contact Support */}
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-medium text-white mb-4">Contact Support</h3>
                  
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                      <p className="text-sm text-gray-400 mb-4">
                        Can't find what you're looking for? Our support team is available 24/7 to help with any questions or issues.
                      </p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <FiMail className="w-5 h-5 text-purple-400 mr-3" />
                          <span className="text-sm text-gray-400">support@sparkiq.com</span>
                        </div>
                        <div className="flex items-center">
                          <FiPhone className="w-5 h-5 text-purple-400 mr-3" />
                          <span className="text-sm text-gray-400">+1 (800) 123-4567</span>
                        </div>
                      </div>
                    </div>
                    
                    <button className="mt-4 md:mt-0 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors">
                      Contact Us
                    </button>
                  </div>
                </div>
                
                {/* About */}
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-medium text-white mb-4">About Spark IQ</h3>
                  
                  <div className="space-y-2 text-sm text-gray-400">
                    <p>Version 2.4.1 (Build 2023.03.15)</p>
                    <p>© 2023 Spark IQ Learning Technologies. All rights reserved.</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 mt-4">
                    <button className="text-sm text-purple-400 hover:text-purple-300 hover:underline">
                      Terms of Service
                    </button>
                    <button className="text-sm text-purple-400 hover:text-purple-300 hover:underline">
                      Privacy Policy
                    </button>
                    <button className="text-sm text-purple-400 hover:text-purple-300 hover:underline">
                      Cookie Policy
                    </button>
                    <button className="text-sm text-purple-400 hover:text-purple-300 hover:underline">
                      Licenses
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;