import { useState, useEffect } from 'react';
import { 
  FiSettings, FiUser, FiLock, FiBell, FiMoon, FiGlobe, 
  FiCreditCard, FiHelpCircle, FiSun, FiLogOut, FiEye, FiEyeOff,
  FiCheck, FiX, FiDownload, FiPlus, FiTrash2, FiMail, FiPhone
} from 'react-icons/fi';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('account');
  const [darkMode, setDarkMode] = useState(false);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle settings save logic
    showToast('Settings saved successfully!', 'success');
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match!', 'error');
      return;
    }
    // Handle password change logic
    showToast('Password changed successfully!', 'success');
    setShowPasswordForm(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setAvatar(URL.createObjectURL(file));
          showToast('Profile picture updated!', 'success');
        }
      }, 100);
    }
  };

  const showToast = (message, type) => {
    // In a real app, you would use a toast library or component
    alert(`${type === 'success' ? '✅' : '❌'} ${message}`);
  };

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'dark' : ''}`}>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <FiSettings className="text-blue-500 dark:text-blue-400 text-2xl" />
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Settings</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage your Spark IQ account preferences</p>
          </div>
        </div>
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          {darkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="space-y-1 px-4">
              <button
                onClick={() => setActiveTab('account')}
                className={`flex items-center w-full px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'account'
                    ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <FiUser className="mr-3 w-5 h-5" />
                Account
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`flex items-center w-full px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'security'
                    ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <FiLock className="mr-3 w-5 h-5" />
                Security
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`flex items-center w-full px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'notifications'
                    ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <FiBell className="mr-3 w-5 h-5" />
                Notifications
              </button>
              <button
                onClick={() => setActiveTab('appearance')}
                className={`flex items-center w-full px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'appearance'
                    ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {darkMode ? (
                  <FiSun className="mr-3 w-5 h-5" />
                ) : (
                  <FiMoon className="mr-3 w-5 h-5" />
                )}
                Appearance
              </button>
              <button
                onClick={() => setActiveTab('language')}
                className={`flex items-center w-full px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'language'
                    ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <FiGlobe className="mr-3 w-5 h-5" />
                Language
              </button>
              <button
                onClick={() => setActiveTab('billing')}
                className={`flex items-center w-full px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'billing'
                    ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <FiCreditCard className="mr-3 w-5 h-5" />
                Billing
              </button>
              <button
                onClick={() => setActiveTab('help')}
                className={`flex items-center w-full px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'help'
                    ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <FiHelpCircle className="mr-3 w-5 h-5" />
                Help
              </button>
            </nav>
          </div>
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => showToast('Logged out successfully!', 'success')}
              className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-gray-700 rounded-lg hover:bg-red-100 dark:hover:bg-gray-600 transition-colors"
            >
              <FiLogOut className="mr-2 w-5 h-5" />
              Log Out
            </button>
          </div>
        </div>

        {/* Main Settings Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-4xl mx-auto">
            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Account Information</h2>
                
                {/* Avatar Upload */}
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                      {avatar ? (
                        <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <FiUser className="w-10 h-10 text-gray-500 dark:text-gray-400" />
                      )}
                      {uploadProgress > 0 && uploadProgress < 100 && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-300 dark:bg-gray-600">
                          <div 
                            className="h-full bg-blue-500 transition-all duration-300" 
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>
                  <label className="cursor-pointer">
                    <span className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-gray-700 rounded-lg hover:bg-blue-100 dark:hover:bg-gray-600 transition-colors">
                      Change Photo
                    </span>
                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  </label>
                </div>
                
                {/* Account Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      defaultValue="John Doe"
                      placeholder="Enter your full name"
                      className="w-full px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      defaultValue="john.doe@example.com"
                      placeholder="Enter your email"
                      className="w-full px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      defaultValue="+1 (555) 123-4567"
                      placeholder="Enter your phone number"
                      className="w-full px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      rows={4}
                      placeholder="Tell us about yourself..."
                      defaultValue="Mathematics teacher with 5 years of experience"
                      className="w-full px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    ></textarea>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Security Settings</h2>
                
                {/* Password Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Password</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Last changed 3 months ago</p>
                    </div>
                    <button
                      onClick={() => setShowPasswordForm(!showPasswordForm)}
                      className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-gray-700 border border-blue-100 dark:border-gray-600 rounded-lg hover:bg-blue-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      {showPasswordForm ? 'Cancel' : 'Change Password'}
                    </button>
                  </div>
                  
                  {showPasswordForm && (
                    <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4">
                      <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? "text" : "password"}
                            id="currentPassword"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Enter current password"
                            className="w-full px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400"
                          >
                            {showCurrentPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            className="w-full px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400"
                          >
                            {showNewPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            className="w-full px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400"
                          >
                            {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 pt-2">
                        <div className="flex-1 flex space-x-1">
                          <div className={`h-1 flex-1 rounded-full ${newPassword.length > 0 ? 'bg-red-500' : 'bg-gray-200 dark:bg-gray-600'}`}></div>
                          <div className={`h-1 flex-1 rounded-full ${newPassword.length >= 6 ? 'bg-yellow-500' : 'bg-gray-200 dark:bg-gray-600'}`}></div>
                          <div className={`h-1 flex-1 rounded-full ${newPassword.length >= 10 ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-600'}`}></div>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {newPassword.length === 0 ? '' : 
                           newPassword.length < 6 ? 'Weak' : 
                           newPassword.length < 10 ? 'Medium' : 'Strong'}
                        </span>
                      </div>
                      
                      <div className="flex justify-end space-x-3 pt-4">
                        <button
                          type="button"
                          onClick={() => setShowPasswordForm(false)}
                          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={!newPassword || !confirmPassword}
                          className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                            !newPassword || !confirmPassword
                              ? 'bg-blue-400 dark:bg-blue-500 cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                        >
                          Update Password
                        </button>
                      </div>
                    </form>
                  )}
                </div>
                
                {/* 2FA Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Add an extra layer of security to your account</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
                
                {/* Active Sessions */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Active Sessions</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your logged-in devices</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start p-3 rounded-lg bg-blue-50 dark:bg-gray-700 border-l-4 border-blue-500">
                      <div className="flex-shrink-0 p-2 bg-blue-100 dark:bg-gray-600 rounded-lg text-blue-600 dark:text-blue-400">
                        <FiGlobe className="w-5 h-5" />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex justify-between">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Current Session</p>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Active
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Chrome on Windows • New York, USA</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Last active: Just now</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                      <div className="flex-shrink-0 p-2 bg-gray-100 dark:bg-gray-600 rounded-lg text-gray-600 dark:text-gray-400">
                        <FiPhone className="w-5 h-5" />
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Mobile App</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">iOS • iPhone 13</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Last active: 2 hours ago</p>
                      </div>
                      <button className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                        <FiX className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  <button className="mt-4 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-gray-700 rounded-lg hover:bg-red-100 dark:hover:bg-gray-600 transition-colors flex items-center">
                    <FiLogOut className="mr-2 w-5 h-5" />
                    Log Out All Other Devices
                  </button>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Notification Preferences</h2>
                
                {/* Global Notifications */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Global Notifications</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Enable or disable all notifications at once</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={notificationsEnabled}
                        onChange={(e) => setNotificationsEnabled(e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
                
                {/* Notification Channels */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Notification Channels</h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 dark:bg-gray-700 rounded-lg text-blue-600 dark:text-blue-400">
                          <FiMail className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">Email Notifications</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications via email</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={emailNotifications}
                          onChange={(e) => setEmailNotifications(e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 dark:bg-gray-700 rounded-lg text-blue-600 dark:text-blue-400">
                          <FiBell className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">Push Notifications</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications on your device</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={pushNotifications}
                          onChange={(e) => setPushNotifications(e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* Course Notifications */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Course Notifications</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="relative flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">New course announcements</span>
                      </label>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <label className="relative flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">Assignment deadlines</span>
                      </label>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <label className="relative flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">Forum activity</span>
                      </label>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <label className="relative flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">Course recommendations</span>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-2">
                  <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                    Reset to Default
                  </button>
                  <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors">
                    Save Preferences
                  </button>
                </div>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Appearance</h2>
                
                {/* Theme Selection */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Theme</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div 
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        !darkMode 
                          ? 'border-blue-500 bg-blue-50 dark:bg-gray-700' 
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                      onClick={() => setDarkMode(false)}
                    >
                      <div className="h-24 rounded relative overflow-hidden bg-gray-50">
                        <div className="absolute top-0 left-0 right-0 h-3 bg-white border-b border-gray-200"></div>
                        <div className="absolute top-3 left-0 w-8 h-full bg-white border-r border-gray-200"></div>
                        <div className="absolute top-3 left-8 right-0 h-full bg-gray-50"></div>
                      </div>
                      <div className="mt-3 flex items-center justify-center">
                        <FiSun className="w-5 h-5 text-gray-700 dark:text-gray-300 mr-2" />
                        <span className="font-medium text-gray-900 dark:text-white">Light</span>
                        {!darkMode && <FiCheck className="w-5 h-5 text-blue-500 ml-2" />}
                      </div>
                    </div>
                    
                    <div 
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        darkMode 
                          ? 'border-blue-500 bg-blue-50 dark:bg-gray-700' 
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                      onClick={() => setDarkMode(true)}
                    >
                      <div className="h-24 rounded relative overflow-hidden bg-gray-900">
                        <div className="absolute top-0 left-0 right-0 h-3 bg-gray-800 border-b border-gray-700"></div>
                        <div className="absolute top-3 left-0 w-8 h-full bg-gray-800 border-r border-gray-700"></div>
                        <div className="absolute top-3 left-8 right-0 h-full bg-gray-900"></div>
                      </div>
                      <div className="mt-3 flex items-center justify-center">
                        <FiMoon className="w-5 h-5 text-gray-700 dark:text-gray-300 mr-2" />
                        <span className="font-medium text-gray-900 dark:text-white">Dark</span>
                        {darkMode && <FiCheck className="w-5 h-5 text-blue-500 ml-2" />}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Accent Color */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Accent Color</h3>
                  
                  <div className="flex flex-wrap gap-3">
                    {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'].map((color) => (
                      <div 
                        key={color}
                        className="w-10 h-10 rounded-full cursor-pointer border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-500 flex items-center justify-center transition-colors"
                        style={{ backgroundColor: color }}
                        onClick={() => showToast(`Accent color changed to ${color}`, 'success')}
                      >
                        {color === '#3B82F6' && <FiCheck className="w-4 h-4 text-white" />}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Font Size */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Font Size</h3>
                  
                  <div className="flex flex-wrap gap-3">
                    {['Small', 'Medium', 'Large'].map((size) => (
                      <button
                        key={size}
                        className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                          size === 'Medium'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Density */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Density</h3>
                  
                  <div className="flex flex-wrap gap-3">
                    {['Compact', 'Normal', 'Comfortable'].map((density) => (
                      <button
                        key={density}
                        className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                          density === 'Normal'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                        }`}
                      >
                        {density}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end pt-2">
                  <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors">
                    Apply Changes
                  </button>
                </div>
              </div>
            )}

            {/* Language Tab */}
            {activeTab === 'language' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Language & Region</h2>
                
                <form className="space-y-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5 space-y-4">
                    <div>
                      <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Language
                      </label>
                      <select
                        id="language"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1jaGV2cm9uLWRvd24iPjxwYXRoIGQ9Im02IDkgNiA2IDYtNiIvPjwvc3ZnPg==')] bg-no-repeat bg-[center_right_1rem] bg-[length:1.5rem]"
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
                      <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Time Zone
                      </label>
                      <select
                        id="timezone"
                        defaultValue="UTC-05:00"
                        className="w-full px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1jaGV2cm9uLWRvd24iPjxwYXRoIGQ9Im02IDkgNiA2IDYtNiIvPjwvc3ZnPg==')] bg-no-repeat bg-[center_right_1rem] bg-[length:1.5rem]"
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
                      <label htmlFor="date-format" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Date Format
                      </label>
                      <select
                        id="date-format"
                        defaultValue="mm/dd/yyyy"
                        className="w-full px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1jaGV2cm9uLWRvd24iPjxwYXRoIGQ9Im02IDkgNiA2IDYtNiIvPjwvc3ZnPg==')] bg-no-repeat bg-[center_right_1rem] bg-[length:1.5rem]"
                      >
                        <option value="mm/dd/yyyy">MM/DD/YYYY (12/31/2023)</option>
                        <option value="dd/mm/yyyy">DD/MM/YYYY (31/12/2023)</option>
                        <option value="yyyy-mm-dd">YYYY-MM-DD (2023-12-31)</option>
                        <option value="month-day-year">Month Day, Year (December 31, 2023)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="time-format" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Time Format
                      </label>
                      <select
                        id="time-format"
                        defaultValue="12h"
                        className="w-full px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1jaGV2cm9uLWRvd24iPjxwYXRoIGQ9Im02IDkgNiA2IDYtNiIvPjwvc3ZnPg==')] bg-no-repeat bg-[center_right_1rem] bg-[length:1.5rem]"
                      >
                        <option value="12h">12-hour (2:30 PM)</option>
                        <option value="24h">24-hour (14:30)</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors">
                      Save Preferences
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Billing & Subscription</h2>
                
                {/* Current Plan */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Current Plan</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Active
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">$9.99</span>
                      <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">/month</span>
                    </div>
                    
                    <div className="text-lg font-medium text-gray-900 dark:text-white">Premium</div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <FiCheck className="w-5 h-5 text-green-500 mr-2" />
                        <span className="text-gray-700 dark:text-gray-300">Unlimited courses</span>
                      </div>
                      <div className="flex items-center">
                        <FiCheck className="w-5 h-5 text-green-500 mr-2" />
                        <span className="text-gray-700 dark:text-gray-300">Offline access</span>
                      </div>
                      <div className="flex items-center">
                        <FiCheck className="w-5 h-5 text-green-500 mr-2" />
                        <span className="text-gray-700 dark:text-gray-300">Certificate generation</span>
                      </div>
                      <div className="flex items-center">
                        <FiCheck className="w-5 h-5 text-green-500 mr-2" />
                        <span className="text-gray-700 dark:text-gray-300">Priority support</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3 pt-2">
                      <button className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-gray-700 border border-blue-100 dark:border-gray-600 rounded-lg hover:bg-blue-100 dark:hover:bg-gray-600 transition-colors">
                        Change Plan
                      </button>
                      <button className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-gray-700 rounded-lg hover:bg-red-100 dark:hover:bg-gray-600 transition-colors">
                        Cancel Subscription
                      </button>
                    </div>
                    
                    <div className="text-sm text-gray-500 dark:text-gray-400 pt-2">
                      Next billing date: <span className="font-medium text-gray-900 dark:text-white">April 15, 2023</span>
                    </div>
                  </div>
                </div>
                
                {/* Payment Method */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Payment Method</h3>
                    <button className="px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-gray-700 border border-blue-100 dark:border-gray-600 rounded-lg hover:bg-blue-100 dark:hover:bg-gray-600 transition-colors flex items-center">
                      <FiPlus className="w-4 h-4 mr-1" />
                      Add New
                    </button>
                  </div>
                  
                  <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="p-2 bg-white dark:bg-gray-600 rounded-lg text-gray-700 dark:text-gray-300">
                      <FiCreditCard className="w-6 h-6" />
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="text-xs text-gray-500 dark:text-gray-400">VISA</div>
                      <div className="font-medium text-gray-900 dark:text-white">•••• •••• •••• 4242</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Expires 04/2025</div>
                    </div>
                    <button className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-500">
                      Edit
                    </button>
                  </div>
                </div>
                
                {/* Billing History */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Billing History</h3>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Receipt</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">Mar 15, 2023</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Premium Subscription</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">$9.99</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 dark:text-blue-400">
                            <button className="flex items-center hover:underline">
                              <FiDownload className="w-4 h-4 mr-1" />
                              Download
                            </button>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">Feb 15, 2023</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Premium Subscription</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">$9.99</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 dark:text-blue-400">
                            <button className="flex items-center hover:underline">
                              <FiDownload className="w-4 h-4 mr-1" />
                              Download
                            </button>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">Jan 15, 2023</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Premium Subscription</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">$9.99</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 dark:text-blue-400">
                            <button className="flex items-center hover:underline">
                              <FiDownload className="w-4 h-4 mr-1" />
                              Download
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Help Tab */}
            {activeTab === 'help' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Help & Support</h2>
                
                {/* Search */}
                <div className="flex">
                  <input
                    type="text"
                    placeholder="Search help articles..."
                    className="flex-1 px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-l-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors">
                    Search
                  </button>
                </div>
                
                {/* FAQs */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h3>
                  
                  <div className="space-y-4">
                    <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                      <h4 className="text-md font-medium text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        How do I reset my password?
                      </h4>
                      <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                        <p>You can reset your password from the Security tab in Settings or by clicking "Forgot Password" on the login page. A password reset link will be sent to your registered email address.</p>
                      </div>
                    </div>
                    
                    <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                      <h4 className="text-md font-medium text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        How do I cancel my subscription?
                      </h4>
                      <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                        <p>Go to the Billing tab in Settings and click "Cancel Subscription". Your subscription will remain active until the end of the current billing period.</p>
                      </div>
                    </div>
                    
                    <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                      <h4 className="text-md font-medium text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        Can I download courses for offline viewing?
                      </h4>
                      <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                        <p>Yes, with a Premium subscription you can download courses for offline viewing. Look for the download icon next to course videos.</p>
                      </div>
                    </div>
                    
                    <div className="pb-4">
                      <h4 className="text-md font-medium text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        How do I get a course completion certificate?
                      </h4>
                      <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                        <p>Certificates are automatically generated when you complete all lessons and pass the course assessment with a score of 80% or higher. You can download them from your profile.</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Contact Support */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Contact Support</h3>
                  
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                        Can't find what you're looking for? Our support team is available 24/7 to help with any questions or issues.
                      </p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <FiMail className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">support@sparkiq.com</span>
                        </div>
                        <div className="flex items-center">
                          <FiPhone className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">+1 (800) 123-4567</span>
                        </div>
                      </div>
                    </div>
                    
                    <button className="mt-4 md:mt-0 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors">
                      Contact Us
                    </button>
                  </div>
                </div>
                
                {/* About */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">About Spark IQ</h3>
                  
                  <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <p>Version 2.4.1 (Build 2023.03.15)</p>
                    <p>© 2023 Spark IQ Learning Technologies. All rights reserved.</p>
                  </div>
                  
                  <div className="flex space-x-4 mt-4">
                    <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                      Terms of Service
                    </button>
                    <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                      Privacy Policy
                    </button>
                    <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                      Cookie Policy
                    </button>
                    <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                      Licenses
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;