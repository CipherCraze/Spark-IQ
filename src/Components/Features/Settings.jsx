import { useState, useEffect } from 'react';
import { 
  FiSettings, FiUser, FiLock, FiBell, FiMoon, FiGlobe, 
  FiCreditCard, FiHelpCircle, FiSun, FiLogOut, FiEye, FiEyeOff,
  FiCheck, FiX, FiDownload, FiPlus, FiTrash2, FiMail, FiPhone, FiClipboard,
  FiChevronDown, FiMenu, FiX as FiClose, FiChevronRight, FiArrowLeft,
  FiUploadCloud, FiMapPin, FiBookOpen, FiStar, FiFileText, FiMessageSquare, 
  FiShield, FiSmartphone, FiKey, FiEdit3, FiAlertTriangle, FiCheckCircle, FiSearch, FiXCircle
} from 'react-icons/fi'; // Added more icons
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../../firebase/firebaseConfig'; // Assuming these paths are correct
import { signOut, updatePassword as firebaseUpdatePassword } from 'firebase/auth'; // Renamed to avoid conflict
import { getUserSettings, updateUserSettings } from '../../firebase/userOperations';
import { updateUserProfile, uploadProfilePicture } from '../../firebase/userOperations';
import { updateProfile } from 'firebase/auth';

const ACCENT_COLORS = ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#EF4444'];
const FONT_SIZES = ['Small', 'Medium', 'Large']; // Note: True effect requires global CSS
const DENSITIES = ['Compact', 'Normal', 'Comfortable']; // Note: True effect requires global CSS

const SettingsPage = () => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(search);
  const initialTab = queryParams.get('tab') || 'account';
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    security: false,
    notifications: false,
    appearance: true 
  });
  const [user, setUser] = useState({
    name: '', email: '', phone: '', location: '', bio: '', education: '',
  });
  const [avatarUrl, setAvatarUrl] = useState(() => localStorage.getItem('profileAvatar') || null);
  const [formErrors, setFormErrors] = useState({});
  const [passwordError, setPasswordError] = useState('');
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('accentColor') || ACCENT_COLORS[0]);
  const [fontSize, setFontSize] = useState(() => localStorage.getItem('fontSize') || 'Medium');
  const [density, setDensity] = useState(() => localStorage.getItem('density') || 'Normal');

  const showToast = (message, type = 'info') => {
    const toastEl = document.createElement('div');
    toastEl.innerHTML = `
      <div style="display: flex; align-items: center;">
        ${type === 'success' ? '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>' : 
          type === 'error' ? '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>' : 
          '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'}
        <span style="margin-left: 10px;">${message}</span>
      </div>
    `;
    toastEl.style.position = 'fixed';
    toastEl.style.bottom = '20px';
    toastEl.style.left = '50%';
    toastEl.style.transform = 'translateX(-50%)';
    toastEl.style.padding = '12px 20px';
    toastEl.style.borderRadius = '8px';
    toastEl.style.color = 'white';
    const bgColor = type === 'success' ? 'var(--accent-color, #10B981)' : type === 'error' ? '#EF4444' : '#3B82F6';
    toastEl.style.backgroundColor = bgColor;
    toastEl.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.2), 0 8px 10px -6px rgba(0,0,0,0.2)';
    toastEl.style.zIndex = '10000';
    toastEl.style.opacity = '0';
    toastEl.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    document.body.appendChild(toastEl);
    
    requestAnimationFrame(() => {
        toastEl.style.opacity = '1';
        toastEl.style.transform = 'translateX(-50%) translateY(0)';
    });

    setTimeout(() => {
      toastEl.style.opacity = '0';
      toastEl.style.transform = 'translateX(-50%) translateY(10px)';
      setTimeout(() => toastEl.remove(), 300);
    }, 3000);
  };
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      ['profileAvatar', 'accentColor', 'fontSize', 'density', 'darkMode'].forEach(key => localStorage.removeItem(key));
      showToast('Logged out successfully!', 'success');
      setTimeout(() => navigate('/login'), 1500);
    } catch (error) {
      showToast('Error logging out. Please try again.', 'error');
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const validateAccountForm = () => {
    const errors = {};
    if (!user.name.trim()) errors.name = 'Full name is required';
    if (!user.email.trim()) errors.email = 'Email is required';
    else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(user.email)) errors.email = 'Invalid email address';
    if (user.phone && !/^\+?[1-9]\d{1,14}$/.test(user.phone.trim())) errors.phone = 'Invalid phone number';
    return errors;
  };

  const getPasswordStrength = (pwd) => {
    let score = 0; if (!pwd) return 0;
    if (pwd.length >= 8) score++; else return 0;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return Math.min(score, 4);
  };

  const validatePassword = (pwd) => {
    if (pwd.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(pwd)) return 'Password must contain an uppercase letter';
    if (!/[a-z]/.test(pwd)) return 'Password must contain a lowercase letter';
    if (!/[0-9]/.test(pwd)) return 'Password must contain a number';
    if (!/[^A-Za-z0-9]/.test(pwd)) return 'Password must contain a special character';
    return '';
  };

  useEffect(() => {
    const storedDarkMode = localStorage.getItem('darkMode');
    if (storedDarkMode !== null) setDarkMode(JSON.parse(storedDarkMode));
    else setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', accentColor);
    localStorage.setItem('accentColor', accentColor);
  }, [accentColor]);

  useEffect(() => localStorage.setItem('fontSize', fontSize), [fontSize]);
  useEffect(() => localStorage.setItem('density', density), [density]);

  useEffect(() => {
    const params = new URLSearchParams(search);
    const tab = params.get('tab');
    if (tab && tab !== activeTab) setActiveTab(tab);
  }, [search, activeTab]);

  useEffect(() => {
    const loadUserSettings = async () => {
      try {
        setIsLoading(true);
        const currentUser = auth.currentUser;
        if (!currentUser) {
          showToast('User not authenticated. Redirecting.', 'error');
          setTimeout(() => navigate('/login'), 1500);
          return;
        }

        const settings = await getUserSettings(currentUser.uid);
        if (settings) {
          setDarkMode(settings.darkMode ?? darkMode);
          setNotificationsEnabled(settings.notificationsEnabled ?? true);
          setEmailNotifications(settings.emailNotifications ?? true);
          setPushNotifications(settings.pushNotifications ?? true);
          setLanguage(settings.language ?? 'en');
          setAccentColor(settings.accentColor ?? ACCENT_COLORS[0]);
          setFontSize(settings.fontSize ?? 'Medium');
          setDensity(settings.density ?? 'Normal');
          if (settings.userData) setUser(prev => ({ ...prev, ...settings.userData }));
          if (settings.avatar) setAvatarUrl(settings.avatar);
        }
        // Populate from auth if not in settings
        if (!user.name && currentUser.displayName) setUser(prev => ({...prev, name: currentUser.displayName}));
        if (!user.email && currentUser.email) setUser(prev => ({...prev, email: currentUser.email}));
        if (!avatarUrl && currentUser.photoURL) setAvatarUrl(currentUser.photoURL);

      } catch (err) {
        setError(err.message);
        showToast(`Error loading settings: ${err.message}`, 'error');
      } finally {
        setIsLoading(false);
      }
    };
    loadUserSettings();
  }, [navigate]); // Removed user, avatarUrl from deps to avoid loop on initial load

  useEffect(() => { // Debounced auto-save
    if (isLoading) return;
    const handler = setTimeout(async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;
        const settingsToSave = {
          darkMode, notificationsEnabled, emailNotifications, pushNotifications, language,
          accentColor, fontSize, density, userData: user, avatar: avatarUrl,
          lastUpdated: new Date().toISOString()
        };
        await updateUserSettings(currentUser.uid, settingsToSave);
      } catch (err) { console.error('Error auto-saving settings:', err); }
    }, 1000);
    return () => clearTimeout(handler);
  }, [darkMode, notificationsEnabled, emailNotifications, pushNotifications, language, accentColor, fontSize, density, user, avatarUrl, isLoading]);

  const toggleSection = (section) => setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));

  const handleSubmitAccountForm = async (e) => {
    e.preventDefault();
    const errors = validateAccountForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      showToast('Please fix errors in the form.', 'error'); return;
    }
    try {
      setIsLoading(true);
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('User not authenticated.');
      await updateProfile(currentUser, { displayName: user.name, photoURL: avatarUrl });
      const profileData = { ...user, avatar: avatarUrl, lastUpdated: new Date().toISOString() };
      await updateUserProfile(currentUser.uid, profileData);
      // Settings are auto-saved, but can force an update of userData and avatar specifically if needed
      await updateUserSettings(currentUser.uid, { userData: user, avatar: avatarUrl }); 
      showToast('Account settings saved!', 'success');
    } catch (err) {
      showToast(`Error saving: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const pwdError = validatePassword(newPassword);
    if (pwdError) { setPasswordError(pwdError); showToast(pwdError, 'error'); return; }
    if (newPassword !== confirmPassword) { setPasswordError('Passwords do not match!'); showToast('Passwords do not match!', 'error'); return; }
    setPasswordError('');
    try {
      setIsLoading(true);
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('User not authenticated.');
      // Re-authentication might be needed here in a real app
      await firebaseUpdatePassword(currentUser, newPassword);
      showToast('Password changed successfully!', 'success');
      setShowPasswordForm(false); setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.message); showToast(`Error: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { showToast('Max 5MB file size.', 'error'); return; }
      try {
        setUploadProgress(0);
        const currentUser = auth.currentUser;
        if (!currentUser) throw new Error('User not authenticated.');
        
        // Smooth progress simulation
        let currentProgress = 0;
        const interval = setInterval(() => {
            currentProgress += 5;
            if (currentProgress <= 95) setUploadProgress(currentProgress);
            else clearInterval(interval);
        }, 50);

        const downloadURL = await uploadProfilePicture(currentUser.uid, file);
        
        clearInterval(interval);
        setUploadProgress(100);

        setAvatarUrl(downloadURL);
        localStorage.setItem('profileAvatar', downloadURL);
        await updateProfile(currentUser, { photoURL: downloadURL });
        await updateUserSettings(currentUser.uid, { avatar: downloadURL, lastUpdated: new Date().toISOString() });
        
        setTimeout(() => setUploadProgress(0), 1000);
        showToast('Profile picture updated!', 'success');
      } catch (err) {
        showToast(`Upload error: ${err.message}`, 'error'); setUploadProgress(0);
      }
    }
  };

  const navItems = [
    { id: 'account', icon: FiUser, label: 'Account' },
    { id: 'security', icon: FiLock, label: 'Security' },
    { id: 'notifications', icon: FiBell, label: 'Notifications' },
    { id: 'appearance', icon: darkMode ? FiSun : FiMoon, label: 'Appearance' },
    { id: 'language', icon: FiGlobe, label: 'Language & Region' },
    { id: 'billing', icon: FiCreditCard, label: 'Billing' },
    { id: 'help', icon: FiHelpCircle, label: 'Help Center' },
  ];

  const passwordStrengthText = (pwd) => {
    const s = getPasswordStrength(pwd);
    if (!pwd) return ''; if (s <= 1) return 'Weak'; if (s === 2) return 'Fair'; if (s === 3) return 'Good'; return 'Strong';
  };
  const passwordStrengthColor = (pwd) => {
    const s = getPasswordStrength(pwd);
    if (!pwd) return 'bg-slate-600'; if (s <= 1) return 'bg-red-500'; if (s === 2) return 'bg-yellow-500'; if (s === 3) return 'bg-lime-500'; return 'bg-green-500';
  };

  if (isLoading && !user.name && !error) { // More specific initial loading
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-slate-300">
        <FiSettings className="w-16 h-16 text-[var(--accent-color)] animate-spin mb-6" />
        <p className="text-xl tracking-wide">Loading Your Settings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-slate-300 p-6 text-center">
        <FiXCircle className="w-20 h-20 text-red-500 mb-6" /> 
        <h2 className="text-2xl font-semibold text-red-400 mb-3">Oops! An Error Occurred.</h2>
        <p className="text-slate-400 mb-6 max-w-md">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-8 py-2.5 bg-[var(--accent-color)] hover:opacity-90 text-white font-semibold rounded-lg shadow-lg transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col bg-slate-900 text-slate-200 transition-colors duration-300`}>
      <div 
        className="fixed inset-0 -z-10 transition-opacity duration-1000 opacity-70 dark:opacity-100"
        style={{
          background: darkMode 
            ? `radial-gradient(ellipse at top, ${accentColor}20, transparent 70%), radial-gradient(ellipse at bottom, ${accentColor}15, transparent 70%), #0F172A` // slate-900
            : `radial-gradient(ellipse at top, ${accentColor}25, transparent 80%), radial-gradient(ellipse at bottom, ${accentColor}20, transparent 80%), #F1F5F9` // slate-100
        }}
      />
      
      <header className="sticky top-0 z-30 bg-slate-800/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-700/50 dark:border-slate-800/50 px-4 sm:px-6 py-3.5 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button onClick={() => navigate(-1)} className="p-2 rounded-full text-slate-400 hover:text-[var(--accent-color)] hover:bg-slate-700/50 dark:hover:bg-slate-800/50 transition-all" title="Go Back"><FiArrowLeft className="w-5 h-5" /></button>
            <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 rounded-full text-slate-400 hover:text-[var(--accent-color)] hover:bg-slate-700/50 dark:hover:bg-slate-800/50 transition-all"><FiMenu className="w-5 h-5" /></button>
            <div className="flex items-center space-x-2.5">
              <div className="p-2.5 bg-[var(--accent-color)] rounded-lg shadow-lg"><FiSettings className="text-white w-5 h-5" /></div>
              <h1 className="text-xl font-semibold text-slate-100 dark:text-slate-50 tracking-tight">Settings</h1>
            </div>
          </div>
          <button onClick={() => setDarkMode(!darkMode)} className="p-2.5 rounded-full bg-slate-700/50 dark:bg-slate-800/60 text-slate-400 hover:text-[var(--accent-color)] hover:bg-slate-700 dark:hover:bg-slate-700/80 transition-colors" title={darkMode ? "Light Mode" : "Dark Mode"}>
            {darkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />
              <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', stiffness: 320, damping: 30 }} className="fixed inset-y-0 left-0 z-50 w-72 bg-slate-800/95 dark:bg-slate-900/95 backdrop-blur-lg border-r border-slate-700/50 dark:border-slate-800/60 overflow-y-auto md:hidden flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-slate-700 dark:border-slate-800">
                  <div className="flex items-center space-x-2.5"><div className="p-2 bg-[var(--accent-color)] rounded-md shadow-md"><FiSettings className="text-white w-4 h-4" /></div><h2 className="text-lg font-semibold text-slate-100 dark:text-slate-50">Menu</h2></div>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-700/50 dark:hover:bg-slate-800/50 transition-colors"><FiClose className="w-5 h-5" /></button>
                </div>
                <nav className="flex-1 p-3 space-y-1.5">
                  {navItems.map((item) => (
                    <button key={item.id} onClick={() => { setActiveTab(item.id); navigate(`?tab=${item.id}`, { replace: true }); setMobileMenuOpen(false); }}
                      className={`flex items-center w-full px-3.5 py-2.5 text-sm rounded-lg transition-all duration-200 group ${ activeTab === item.id ? 'bg-[var(--accent-color)] text-white shadow-lg scale-105 font-medium' : 'text-slate-300 dark:text-slate-400 hover:text-slate-100 dark:hover:text-slate-50 hover:bg-slate-700/70 dark:hover:bg-slate-800/70' }`} >
                      <item.icon className={`mr-3 w-5 h-5 ${activeTab === item.id ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-[var(--accent-color)]'}`} /> {item.label}
                    </button>
                  ))}
                </nav>
                 <div className="p-4 mt-auto border-t border-slate-700 dark:border-slate-800"><button onClick={handleLogout} className="flex items-center justify-center w-full px-3.5 py-2.5 text-sm font-medium text-red-400 bg-slate-700/50 dark:bg-slate-800/50 rounded-lg hover:bg-red-500/20 hover:text-red-300 transition-colors group"><FiLogOut className="mr-2.5 w-5 h-5 text-red-500 group-hover:text-red-400" />Log Out</button></div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className="hidden md:flex md:flex-shrink-0">
          <div className="w-64 flex flex-col border-r border-slate-700/50 dark:border-slate-800/60 bg-slate-800/50 dark:bg-slate-900/50">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto styled-scrollbar">
              <nav className="flex-1 px-3 space-y-1.5">
                {navItems.map((item) => (
                  <button key={item.id} onClick={() => { setActiveTab(item.id); navigate(`?tab=${item.id}`, { replace: true }); }}
                    className={`flex items-center w-full px-3.5 py-2.5 text-sm rounded-lg transition-all duration-200 group relative ${ activeTab === item.id ? 'bg-slate-700/60 dark:bg-slate-800/70 text-slate-100 dark:text-slate-50 font-medium' : 'text-slate-400 dark:text-slate-400 hover:text-slate-200 dark:hover:text-slate-200 hover:bg-slate-700/40 dark:hover:bg-slate-800/50' }`} >
                    {activeTab === item.id && <motion.div layoutId="activeIndicator" className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--accent-color)] rounded-r-full" />}
                    <item.icon className={`mr-3 w-5 h-5 flex-shrink-0 ${activeTab === item.id ? 'text-[var(--accent-color)]' : 'text-slate-500 dark:text-slate-500 group-hover:text-slate-300 dark:group-hover:text-slate-300'}`} /> <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>
            <div className="p-4 border-t border-slate-700/50 dark:border-slate-800/60"><button onClick={handleLogout} className="flex items-center justify-center w-full px-4 py-2.5 text-sm font-medium text-red-400 bg-slate-700/30 dark:bg-slate-800/40 rounded-lg hover:bg-red-500/20 hover:text-red-300 transition-colors group"><FiLogOut className="mr-2 w-5 h-5 text-red-500 group-hover:text-red-400" />Log Out</button></div>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto p-6 lg:p-8 styled-scrollbar">
          <div className="max-w-3xl mx-auto">
            <AnimatePresence mode="wait">
            {activeTab === 'account' && (
              <motion.div key="account" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="space-y-8">
                <SectionCard title="Profile Overview" icon={<FiUser />} noToggle>
                  <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 pt-2">
                    <div className="relative group shrink-0">
                      <div className="w-28 h-28 rounded-full bg-slate-700 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-2 border-[var(--accent-color)] shadow-lg">
                        {avatarUrl ? <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" /> : <FiUser className="w-12 h-12 text-slate-500 dark:text-slate-600" />}
                        {uploadProgress > 0 && (
                           <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                              {uploadProgress < 100 ? (
                                <div className="w-16 h-1.5 bg-slate-600 rounded-full overflow-hidden"><motion.div className="h-full bg-[var(--accent-color)]" initial={{ width: 0 }} animate={{ width: `${uploadProgress}%` }} transition={{ duration: 0.2 }}/></div>
                              ) : <FiCheckCircle className="w-8 h-8 text-green-400" />}
                           </div>
                        )}
                      </div>
                       <label htmlFor="avatarUpload" className="absolute -bottom-2 -right-2 cursor-pointer p-2.5 bg-[var(--accent-color)] rounded-full shadow-md hover:scale-110 transition-transform active:scale-95"><FiUploadCloud className="w-4 h-4 text-white"/><input type="file" id="avatarUpload" accept="image/*" onChange={handleAvatarChange} className="hidden" /></label>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-100 dark:text-slate-50 mb-1">{user.name || "Your Name"}</h3>
                      <p className="text-sm text-slate-400 dark:text-slate-400 mb-3 max-w-xs">Update your photo and personal details. Keep your profile fresh!</p>
                      <label htmlFor="avatarUpload" className="cursor-pointer px-5 py-2 text-xs font-medium text-white bg-[var(--accent-color)] rounded-lg hover:opacity-90 transition-opacity inline-flex items-center shadow-sm active:scale-95"><FiEdit3 className="w-3.5 h-3.5 mr-2" />Change Photo</label>
                    </div>
                  </div>
                </SectionCard>
                
                <form onSubmit={handleSubmitAccountForm}>
                 <SectionCard title="Personal Information" icon={<FiClipboard />} noToggle> {/* FiClipboard is a placeholder, consider specific icon if available */}
                  <div className="pt-4 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                      <InputField id="name" name="name" label="Full Name" value={user.name} onChange={handleEditChange} placeholder="E.g., Alex Johnson" error={formErrors.name} icon={<FiUser className="w-4 h-4 text-slate-400"/>}/>
                      <InputField id="email" name="email" type="email" label="Email Address" value={user.email} onChange={handleEditChange} placeholder="your@email.com" error={formErrors.email} icon={<FiMail className="w-4 h-4 text-slate-400"/>}/>
                      <InputField id="phone" name="phone" type="tel" label="Phone (Optional)" value={user.phone} onChange={handleEditChange} placeholder="+1 123 456 7890" error={formErrors.phone} icon={<FiPhone className="w-4 h-4 text-slate-400"/>}/>
                      <InputField id="location" name="location" label="Location (Optional)" value={user.location} onChange={handleEditChange} placeholder="City, Country" error={formErrors.location} icon={<FiMapPin className="w-4 h-4 text-slate-400"/>}/>
                    </div>
                    <InputField id="education" name="education" label="Education (Optional)" value={user.education} onChange={handleEditChange} placeholder="E.g., B.Sc. Computer Science" icon={<FiBookOpen className="w-4 h-4 text-slate-400"/>}/>
                    <div>
                      <label htmlFor="bio" className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-1.5">Bio (Optional)</label>
                      <textarea id="bio" name="bio" rows={3} value={user.bio} onChange={handleEditChange} placeholder="Tell us a bit about yourself..." className="w-full px-4 py-2.5 text-slate-100 dark:text-slate-100 bg-slate-700/60 dark:bg-slate-800/70 border border-slate-600 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] transition-all placeholder-slate-400/70 dark:placeholder-slate-500 shadow-sm focus:shadow-md"/>
                    </div>
                    <div className="flex justify-end pt-4 border-t border-slate-700/50 dark:border-slate-800/60">
                      <button type="submit" disabled={isLoading} className="px-6 py-2.5 text-sm font-semibold text-white bg-[var(--accent-color)] rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 dark:focus:ring-offset-slate-900 focus:ring-[var(--accent-color)] transition-all duration-150 ease-in-out shadow-md hover:shadow-lg disabled:opacity-50 flex items-center active:scale-95">
                        {isLoading ? <SpinnerIcon className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"/> : <FiCheck className="-ml-1 mr-2 h-5 w-5"/>} Save Changes
                      </button>
                    </div>
                  </div>
                 </SectionCard>
                </form>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div key="security" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="space-y-8">
                <SectionCard title="Password Management" icon={<FiLock />} sectionKey="password" expanded={expandedSections.security} onToggle={() => toggleSection('security')} description="Secure your account by regularly updating your password.">
                  {showPasswordForm ? (
                    <form onSubmit={handlePasswordSubmit} className="space-y-5 pt-4">
                      {/* Current Password might not be needed if re-auth flow is implemented properly before this step */}
                      {/* <InputField id="currentPassword" label="Current Password" type={showCurrentPassword ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password"><PasswordToggle visible={showCurrentPassword} setVisible={setShowCurrentPassword} /></InputField> */}
                      <InputField id="newPassword" label="New Password" type={showNewPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Choose a strong password"><PasswordToggle visible={showNewPassword} setVisible={setShowNewPassword} /></InputField>
                      <InputField id="confirmPassword" label="Confirm New Password" type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter new password"><PasswordToggle visible={showConfirmPassword} setVisible={setShowConfirmPassword} /></InputField>
                      {newPassword && (<div className="flex items-center space-x-2 pt-1"><div className="flex-1 h-1.5 bg-slate-600 dark:bg-slate-700 rounded-full overflow-hidden"><div className={`h-full rounded-full ${passwordStrengthColor(newPassword)} transition-all duration-300`} style={{ width: `${(getPasswordStrength(newPassword) / 4) * 100}%` }}></div></div><span className={`text-xs font-medium ${getPasswordStrength(newPassword) > 2 ? 'text-green-400' : getPasswordStrength(newPassword) > 1 ? 'text-yellow-400' : 'text-red-400'}`}>{passwordStrengthText(newPassword)}</span></div>)}
                      {passwordError && <div className="text-red-400 text-sm p-3 bg-red-900/20 dark:bg-red-500/10 rounded-md border border-red-500/30 flex items-center"><FiAlertTriangle className="inline mr-2.5 shrink-0"/>{passwordError}</div>}
                      <div className="flex justify-end space-x-3 pt-3"><button type="button" onClick={() => {setShowPasswordForm(false); setPasswordError('');}} className="px-5 py-2 text-sm font-medium text-slate-300 dark:text-slate-300 bg-slate-700 dark:bg-slate-700 hover:bg-slate-600/70 dark:hover:bg-slate-600/70 rounded-lg transition-colors active:scale-95">Cancel</button><button type="submit" disabled={isLoading || !newPassword || !confirmPassword} className="px-5 py-2 text-sm font-medium text-white bg-[var(--accent-color)] rounded-lg hover:opacity-90 disabled:opacity-60 transition-all flex items-center active:scale-95">{isLoading ? <SpinnerIcon className="animate-spin -ml-1 mr-2 h-5 w-5"/> : <FiKey className="-ml-1 mr-2 h-4 w-4"/>} Update Password</button></div>
                    </form>
                  ) : (<div className="pt-4"><button onClick={() => setShowPasswordForm(true)} className="px-5 py-2 text-sm font-medium text-white bg-[var(--accent-color)] rounded-lg hover:opacity-90 transition-opacity flex items-center active:scale-95"><FiEdit3 className="mr-2 w-4 h-4"/> Change Password</button><p className="text-xs text-slate-400 dark:text-slate-500 mt-3">Last changed: 3 months ago (Example)</p></div>)}
                </SectionCard>
                <SectionCard title="Two-Factor Authentication" icon={<FiShield />} description="Enhance security with an additional verification step. (UI Only)"><div className="pt-4 flex items-center justify-between p-4 bg-slate-700/30 dark:bg-slate-800/40 rounded-lg"><p className="text-sm text-slate-300 dark:text-slate-300">Enable 2FA via Authenticator App</p><ToggleSwitch checked={false} onChange={() => showToast("2FA toggle clicked (UI Only)", "info")} /></div><p className="text-xs text-slate-400 dark:text-slate-500 mt-3">Once enabled, you'll be prompted for a code from your authenticator app during login.</p></SectionCard>
                <SectionCard title="Active Sessions" icon={<FiSmartphone />} description="Review and manage devices logged into your account. (UI Only)"><div className="pt-4 space-y-3"><div className="flex items-center justify-between p-3 bg-slate-700/30 dark:bg-slate-800/40 rounded-lg"><div className="grow"><p className="text-sm font-medium text-slate-100 dark:text-slate-100">Chrome on Windows <span className="text-xs text-green-400 ml-2">(Current)</span></p><p className="text-xs text-slate-400 dark:text-slate-400">New York, USA • Just now</p></div><FiCheckCircle className="text-green-500 w-5 h-5 shrink-0"/></div><div className="flex items-center justify-between p-3 bg-slate-700/30 dark:bg-slate-800/40 rounded-lg hover:bg-slate-700/50 dark:hover:bg-slate-700/60 transition-colors group"><div className="grow"><p className="text-sm font-medium text-slate-100 dark:text-slate-100">Safari on macOS</p><p className="text-xs text-slate-400 dark:text-slate-400">London, UK • 2 days ago</p></div><button className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" onClick={() => showToast("Revoke session (UI Only)", "info")}><FiXCircle className="w-5 h-5"/></button></div><button onClick={() => showToast("Log out all other devices (UI Only)", "warning")} className="w-full mt-3 px-4 py-2 text-sm font-medium text-red-400 bg-red-900/20 dark:bg-red-500/10 rounded-lg hover:bg-red-500/20 hover:text-red-300 transition-colors flex items-center justify-center active:scale-95"><FiLogOut className="mr-2 w-4 h-4" /> Log Out All Other Devices</button></div></SectionCard>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div key="notifications" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="space-y-8">
                <SectionCard title="Global Notification Control" icon={<FiBell />} sectionKey="notifications" expanded={expandedSections.notifications} onToggle={() => toggleSection('notifications')} description="Manage how and when you receive notifications from us.">
                    <div className="pt-4 space-y-5">
                        <ToggleSwitch label="Enable All Notifications" checked={notificationsEnabled} onChange={(e) => setNotificationsEnabled(e.target.checked)} />
                        {notificationsEnabled && ( <AnimatePresence><motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4 pl-4 border-l-2 border-slate-700 dark:border-slate-700/70 ml-1">
                            <h4 className="text-md font-medium text-slate-200 dark:text-slate-200 pt-2">Channels</h4>
                            <ToggleSwitch label="Email Notifications" checked={emailNotifications} onChange={(e) => setEmailNotifications(e.target.checked)} />
                            <ToggleSwitch label="Push Notifications (In-App & Device)" checked={pushNotifications} onChange={(e) => setPushNotifications(e.target.checked)} />
                            <h4 className="text-md font-medium text-slate-200 dark:text-slate-200 pt-3">Activity Types (UI Only)</h4>
                            <ToggleSwitch label="New Course Announcements" checked={true} onChange={() => {}} />
                            <ToggleSwitch label="Assignment Deadlines & Reminders" checked={true} onChange={() => {}} />
                            <ToggleSwitch label="Discussion Forum Activity" checked={false} onChange={() => {}} />
                        </motion.div></AnimatePresence> )}
                    </div>
                    <div className="flex justify-end space-x-3 pt-6 mt-4 border-t border-slate-700/50 dark:border-slate-800/60"><button onClick={() => showToast("Notification settings reset (UI Only)", "info")} className="px-5 py-2 text-sm font-medium text-slate-300 dark:text-slate-300 bg-slate-700 dark:bg-slate-700 hover:bg-slate-600/70 dark:hover:bg-slate-600/70 rounded-lg transition-colors active:scale-95">Reset</button><button onClick={() => showToast("Notification preferences saved!", "success")} className="px-5 py-2 text-sm font-medium text-white bg-[var(--accent-color)] rounded-lg hover:opacity-90 transition-opacity active:scale-95">Save Preferences</button></div>
                </SectionCard>
              </motion.div>
            )}

            {activeTab === 'appearance' && (
              <motion.div key="appearance" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="space-y-8">
                <SectionCard title="Interface Customization" icon={darkMode ? <FiSun /> : <FiMoon />} sectionKey="appearance" expanded={expandedSections.appearance} onToggle={() => toggleSection('appearance')} description="Tailor the application's look to your preference.">
                  <div className="pt-4 space-y-8">
                    <div> <h4 className="text-md font-medium text-slate-200 dark:text-slate-200 mb-3">Theme Mode</h4> <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><ThemePreviewCard label="Light Mode" active={!darkMode} onClick={() => setDarkMode(false)} isDarkPreview={false} /><ThemePreviewCard label="Dark Mode" active={darkMode} onClick={() => setDarkMode(true)} isDarkPreview={true} /></div></div>
                    <div> <h4 className="text-md font-medium text-slate-200 dark:text-slate-200 mb-3">Accent Color</h4> <div className="flex flex-wrap gap-3">{ACCENT_COLORS.map((color) => (<button key={color} aria-label={`Set accent color to ${color}`} className={`w-9 h-9 rounded-full cursor-pointer border-2 flex items-center justify-center transition-all duration-200 transform hover:scale-110 active:scale-95 ${accentColor === color ? 'border-white shadow-lg ring-2 ring-offset-2 ring-offset-slate-800 dark:ring-offset-slate-900 ring-[var(--accent-color)]' : 'border-transparent hover:border-white/30'}`} style={{ backgroundColor: color }} onClick={() => setAccentColor(color)}>{accentColor === color && <FiCheck className="w-4 h-4 text-white" />}</button>))}</div></div>
                    <div> <h4 className="text-md font-medium text-slate-200 dark:text-slate-200 mb-3">Font Size (Conceptual)</h4> <div className="flex flex-wrap gap-3">{FONT_SIZES.map((size) => (<button key={size} onClick={() => {setFontSize(size); showToast(`Font size set to ${size} (UI only)`, 'info');}} className={`px-4 py-1.5 text-sm rounded-lg border-2 transition-all duration-200 active:scale-95 ${ fontSize === size ? 'bg-[var(--accent-color)] text-white border-[var(--accent-color)] shadow-md' : 'bg-slate-700 dark:bg-slate-700 text-slate-300 dark:text-slate-300 border-slate-600 dark:border-slate-600 hover:border-slate-500 dark:hover:border-slate-500 hover:text-slate-100 dark:hover:text-slate-100'}`}>{size}</button>))}</div></div>
                    <div> <h4 className="text-md font-medium text-slate-200 dark:text-slate-200 mb-3">Interface Density (Conceptual)</h4> <div className="flex flex-wrap gap-3">{DENSITIES.map((d) => (<button key={d} onClick={() => {setDensity(d); showToast(`Density set to ${d} (UI only)`, 'info');}} className={`px-4 py-1.5 text-sm rounded-lg border-2 transition-all duration-200 active:scale-95 ${ density === d ? 'bg-[var(--accent-color)] text-white border-[var(--accent-color)] shadow-md' : 'bg-slate-700 dark:bg-slate-700 text-slate-300 dark:text-slate-300 border-slate-600 dark:border-slate-600 hover:border-slate-500 dark:hover:border-slate-500 hover:text-slate-100 dark:hover:text-slate-100'}`}>{d}</button>))}</div></div>
                  </div>
                  <div className="flex justify-end pt-6 mt-4 border-t border-slate-700/50 dark:border-slate-800/60"><button onClick={() => showToast('Appearance settings applied!', 'success')} className="px-5 py-2 text-sm font-medium text-white bg-[var(--accent-color)] rounded-lg hover:opacity-90 transition-opacity active:scale-95">Apply & Preview</button></div>
                </SectionCard>
              </motion.div>
            )}

            {activeTab === 'language' && (
              <motion.div key="language" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="space-y-8">
                <SectionCard title="Localization Settings" icon={<FiGlobe />} description="Choose your preferred language and regional formats.">
                  <form className="pt-4 space-y-5">
                    <SelectField id="language" label="Display Language" value={language} onChange={(e) => setLanguage(e.target.value)} options={[{ value: "en", label: "English (United States)" }, { value: "en-gb", label: "English (United Kingdom)"},{ value: "es", label: "Español (Spanish)" }, { value: "fr", label: "Français (French)" }, { value: "de", label: "Deutsch (German)" }, { value: "ja", label: "日本語 (Japanese)" }]}/>
                    <SelectField id="timezone" label="Time Zone (UI Only)" defaultValue="UTC-05:00" options={[{ value: "UTC-08:00", label: "(UTC-08:00) Pacific Time"},{ value: "UTC-05:00", label: "(UTC-05:00) Eastern Time" }, { value: "UTC", label: "(UTC) Coordinated Universal Time" }, { value: "UTC+01:00", label: "(UTC+01:00) Central European Time" }, { value: "UTC+08:00", label: "(UTC+08:00) China Standard Time" }]}/>
                    <SelectField id="date-format" label="Date Format (UI Only)" defaultValue="month-day-year" options={[{ value: "mm/dd/yyyy", label: "MM/DD/YYYY (12/31/2023)" }, { value: "dd/mm/yyyy", label: "DD/MM/YYYY (31/12/2023)" }, { value: "yyyy-mm-dd", label: "YYYY-MM-DD (2023-12-31)" }, { value: "month-day-year", label: "Month D, YYYY (Dec 31, 2023)" }]}/>
                    <div className="flex justify-end pt-3"><button type="button" onClick={() => showToast("Language preferences saved!", "success")} className="px-5 py-2 text-sm font-medium text-white bg-[var(--accent-color)] rounded-lg hover:opacity-90 transition-opacity active:scale-95">Save Preferences</button></div>
                  </form>
                </SectionCard>
              </motion.div>
            )}
            
            {activeTab === 'billing' && (
              <motion.div key="billing" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="space-y-8">
                <SectionCard title="Current Subscription" icon={<FiStar />} description="Manage your active plan and payment details. (UI Only)">
                  <div className="pt-4 space-y-6">
                    <div className="p-6 bg-gradient-to-br from-[var(--accent-color)] to-purple-500 rounded-xl shadow-xl text-white"> {/* Example secondary color for gradient */}
                      <div className="flex justify-between items-start"><h4 className="text-2xl font-bold">Premium Plan</h4><span className="px-3 py-1 text-xs font-semibold bg-white/25 backdrop-blur-sm rounded-full">ACTIVE</span></div>
                      <p className="text-4xl font-extrabold mt-2">$19<span className="text-xl font-medium align-text-top">.99/mo</span></p>
                      <p className="text-sm opacity-80 mt-1">Next payment on July 15, 2024</p>
                    </div>
                    <ul className="space-y-2.5 text-sm pl-1">{['Unlimited course access', 'Downloadable resources', 'Completion certificates', 'Priority support', 'Exclusive content'].map(feature => (<li key={feature} className="flex items-center text-slate-300 dark:text-slate-300"><FiCheck className="w-4 h-4 mr-2.5 text-green-400 flex-shrink-0"/>{feature}</li>))}</ul>
                    <div className="flex flex-col sm:flex-row gap-3 pt-3"><button className="flex-1 px-5 py-2.5 text-sm font-medium text-white bg-[var(--accent-color)] rounded-lg hover:opacity-90 transition-opacity active:scale-95">Upgrade/Manage Plan</button><button className="flex-1 px-5 py-2.5 text-sm font-medium text-slate-300 dark:text-slate-300 bg-slate-700 dark:bg-slate-700 hover:bg-slate-600/70 dark:hover:bg-slate-600/70 rounded-lg transition-colors active:scale-95">Cancel Subscription</button></div>
                  </div>
                </SectionCard>
                <SectionCard title="Payment Methods" icon={<FiCreditCard />} description="Update your saved payment options. (UI Only)">
                    <div className="pt-4 space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-700/40 dark:bg-slate-800/50 rounded-lg border border-slate-600/70 dark:border-slate-700/70">
                            <div className="flex items-center"><img src="https://js.stripe.com/v3/fingerprinted/img/visa-729c05c240c4875c0397510700700045.svg" alt="Visa" className="w-10 h-auto mr-4"/><div><p className="font-medium text-slate-100 dark:text-slate-100">Visa ending in 4242</p><p className="text-xs text-slate-400 dark:text-slate-400">Expires 08/2025 • <span className="text-green-400">Primary</span></p></div></div>
                            <button className="text-xs text-[var(--accent-color)] hover:underline">Edit</button>
                        </div>
                         <button className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium text-[var(--accent-color)] border-2 border-dashed border-[var(--accent-color)]/50 rounded-lg hover:bg-[var(--accent-color)]/10 transition-colors active:scale-95"><FiPlus className="w-4 h-4 mr-2"/> Add New Payment Method</button>
                    </div>
                </SectionCard>
                 <SectionCard title="Billing History" icon={<FiFileText />} description="View your past invoices and transactions. (UI Only)">
                    <div className="pt-4 -mx-5 overflow-x-auto"><table className="min-w-full"><thead className="border-b border-slate-700 dark:border-slate-700/80"><tr className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">{['Date', 'Description', 'Amount', 'Status', 'Invoice'].map(header => (<th key={header} scope="col" className="py-2.5 px-4 text-left first:pl-5 last:pr-5">{header}</th>))}</tr></thead>
                        <tbody className="divide-y divide-slate-700/70 dark:divide-slate-800/70">{[{ date: 'Jun 15, 2024', desc: 'Premium Monthly', amount: '$19.99', status: 'Paid', color: 'text-green-400' },{ date: 'May 15, 2024', desc: 'Premium Monthly', amount: '$19.99', status: 'Paid', color: 'text-green-400' },{ date: 'Apr 15, 2024', desc: 'Course: Web Dev', amount: '$49.00', status: 'Paid', color: 'text-green-400' }].map((item, index) => (
                        <tr key={index} className="hover:bg-slate-700/30 dark:hover:bg-slate-800/40 transition-colors"><td className="px-4 py-3 whitespace-nowrap text-sm text-slate-200 dark:text-slate-200 first:pl-5 last:pr-5">{item.date}</td><td className="px-4 py-3 whitespace-nowrap text-sm text-slate-300 dark:text-slate-300 first:pl-5 last:pr-5">{item.desc}</td><td className="px-4 py-3 whitespace-nowrap text-sm text-slate-200 dark:text-slate-200 first:pl-5 last:pr-5">{item.amount}</td><td className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${item.color} first:pl-5 last:pr-5`}>{item.status}</td><td className="px-4 py-3 whitespace-nowrap text-sm first:pl-5 last:pr-5"><button className="text-[var(--accent-color)] hover:underline flex items-center"><FiDownload className="w-3.5 h-3.5 mr-1.5" /> PDF</button></td></tr>))}</tbody>
                    </table></div>
                </SectionCard>
              </motion.div>
            )}

            {activeTab === 'help' && (
                <motion.div key="help" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="space-y-8">
                    <div className="relative"><FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 pointer-events-none" /><input type="search" placeholder="Search help articles, FAQs..." className="w-full pl-12 pr-4 py-3 text-slate-100 dark:text-slate-100 bg-slate-700/60 dark:bg-slate-800/70 border border-slate-600 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] transition-all placeholder-slate-400/70 dark:placeholder-slate-500 shadow-sm focus:shadow-md"/></div>
                    <SectionCard title="Frequently Asked Questions" icon={<FiHelpCircle />} description="Find answers to common questions."> <div className="pt-2 space-y-1">{[{ q: "How do I reset my password?", a: "You can reset your password from the Security tab. Click 'Change Password' and follow the prompts. If you've forgotten it, use the 'Forgot Password' link on the login page." },{ q: "How can I update my email address?", a: "To update your email, please go to the Account tab. Note that changing your primary email might require verification." },{ q: "Where can I find my billing history?", a: "Your billing history and invoices are available in the Billing tab under 'Billing History'." },{ q: "Is there a mobile app available?", a: "Yes, we have mobile apps for both iOS and Android. Search for 'Spark IQ' in your respective app store." }].map((faq, index) => (<FaqItem key={index} question={faq.q} answer={faq.a} />))}</div></SectionCard>
                    <SectionCard title="Contact Support" icon={<FiMessageSquare />} description="Still need help? Reach out to our team."><div className="pt-4 grid md:grid-cols-2 gap-6"><div className="space-y-3"><p className="text-sm text-slate-300 dark:text-slate-400">Our support team is available to assist you. Choose your preferred method of contact:</p><a href="mailto:support@sparkiq.com" className="flex items-center p-3 bg-slate-700/40 dark:bg-slate-800/50 rounded-lg hover:bg-slate-700/70 dark:hover:bg-slate-700/70 transition-colors group"><FiMail className="w-5 h-5 mr-3 text-[var(--accent-color)] shrink-0"/><div><p className="font-medium text-slate-100 dark:text-slate-100 group-hover:text-[var(--accent-color)] transition-colors">Email Support</p><p className="text-xs text-slate-400 dark:text-slate-400">support@sparkiq.com</p></div></a><a href="tel:+18001234567" className="flex items-center p-3 bg-slate-700/40 dark:bg-slate-800/50 rounded-lg hover:bg-slate-700/70 dark:hover:bg-slate-700/70 transition-colors group"><FiPhone className="w-5 h-5 mr-3 text-[var(--accent-color)] shrink-0"/><div><p className="font-medium text-slate-100 dark:text-slate-100 group-hover:text-[var(--accent-color)] transition-colors">Phone Support</p><p className="text-xs text-slate-400 dark:text-slate-400">+1 (800) 123-4567</p></div></a></div><div className="bg-slate-700/40 dark:bg-slate-800/50 p-5 rounded-lg"><h4 className="font-semibold text-slate-100 dark:text-slate-100 mb-2">Send us a message</h4><textarea placeholder="Describe your issue here..." rows="4" className="w-full text-sm p-2.5 bg-slate-600/50 dark:bg-slate-700/60 border border-slate-500/70 dark:border-slate-600/70 rounded-md focus:ring-1 focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] placeholder-slate-400/70 dark:placeholder-slate-500"></textarea><button className="mt-3 w-full px-4 py-2 text-sm font-medium text-white bg-[var(--accent-color)] rounded-lg hover:opacity-90 transition-opacity active:scale-95">Submit Ticket</button></div></div></SectionCard>
                    <div className="text-center text-xs text-slate-500 dark:text-slate-600 pt-6"><p>Spark IQ Settings v2.0.0</p><p>© {new Date().getFullYear()} Spark IQ. All Rights Reserved.</p><div className="mt-2 space-x-3"><a href="#" className="hover:text-[var(--accent-color)] hover:underline">Terms</a><a href="#" className="hover:text-[var(--accent-color)] hover:underline">Privacy</a></div></div>
                </motion.div>
            )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};

// Helper Components
const SectionCard = ({ title, icon, description, children, sectionKey, expanded, onToggle, noToggle = false }) => (
  <motion.section layout className="bg-slate-800/60 dark:bg-slate-800/70 rounded-xl shadow-xl border border-slate-700/70 dark:border-slate-700/80 overflow-hidden">
    <button disabled={noToggle} onClick={() => onToggle && onToggle(sectionKey)} className={`w-full flex items-center justify-between p-5 text-left ${onToggle ? 'cursor-pointer hover:bg-slate-700/30 dark:hover:bg-slate-700/40' : 'cursor-default'} transition-colors`} aria-expanded={expanded} aria-controls={sectionKey ? `content-${sectionKey}` : undefined}>
      <div className="flex items-center"><div className="p-2.5 bg-[var(--accent-color)]/20 text-[var(--accent-color)] rounded-lg mr-4 shadow-sm shrink-0">{icon}</div><div><h3 className="text-lg font-semibold text-slate-100 dark:text-slate-100">{title}</h3>{description && <p className="text-xs text-slate-400 dark:text-slate-400 mt-0.5">{description}</p>}</div></div>
      {onToggle && <FiChevronDown className={`w-5 h-5 text-slate-400 dark:text-slate-500 transition-transform duration-300 ${expanded ? 'rotate-180' : ''} shrink-0`} />}
    </button>
    <AnimatePresence initial={false}>{((!onToggle && !noToggle) || (onToggle && expanded) || noToggle) && (<motion.div id={sectionKey ? `content-${sectionKey}` : undefined} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="px-5 pb-6"><div className={noToggle ? "" : "pt-0"}>{children}</div></motion.div>)}</AnimatePresence>
  </motion.section>
);

const InputField = ({ id, name, label, type = "text", value, onChange, placeholder, error, icon, children }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-1.5">{label}</label>
    <div className="relative"><div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">{icon}</div>
      <input type={type} id={id} name={name} value={value} onChange={onChange} placeholder={placeholder} className={`w-full py-2.5 pl-10 pr-4 text-slate-100 dark:text-slate-100 bg-slate-700/60 dark:bg-slate-800/70 border ${error ? 'border-red-500' : 'border-slate-600 dark:border-slate-700'} rounded-lg focus:ring-2 focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] transition-all placeholder-slate-400/70 dark:placeholder-slate-500 shadow-sm focus:shadow-md`}/>
      {children}
    </div>{error && <div className="text-red-400 text-xs mt-1.5 flex items-center"><FiAlertTriangle className="w-3.5 h-3.5 mr-1.5 shrink-0"/>{error}</div>}
  </div>
);

const PasswordToggle = ({ visible, setVisible }) => (<button type="button" onClick={() => setVisible(!visible)} className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 dark:text-slate-500 hover:text-[var(--accent-color)] transition-colors" aria-label={visible ? "Hide" : "Show"}>{visible ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}</button>);

const ToggleSwitch = ({ checked, onChange, label }) => (
  <label className="flex items-center justify-between cursor-pointer group py-1.5"><span className="text-sm text-slate-300 dark:text-slate-300 group-hover:text-slate-100 dark:group-hover:text-slate-100 transition-colors">{label}</span><div className="relative"><input type="checkbox" className="sr-only" checked={checked} onChange={onChange} /><div className={`block w-10 h-5 rounded-full transition-all duration-200 ${checked ? 'bg-[var(--accent-color)]' : 'bg-slate-600 dark:bg-slate-700'}`}></div><div className={`dot absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform duration-200 ${checked ? 'translate-x-[22px]' : ''}`}></div></div></label>
);

const ThemePreviewCard = ({ label, active, onClick, isDarkPreview }) => {
    const base = isDarkPreview ? {bg: 'bg-slate-800', text: 'text-slate-300', head: 'bg-slate-700', side: 'bg-slate-700/50'} : {bg: 'bg-slate-100', text: 'text-slate-700', head: 'bg-slate-200', side: 'bg-slate-200/50'};
    return (<div onClick={onClick} className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 group ${active ? 'border-[var(--accent-color)] bg-[var(--accent-color)]/10 shadow-lg scale-105' : 'border-slate-700 dark:border-slate-700 hover:border-slate-500 dark:hover:border-slate-500 bg-slate-700/30 dark:bg-slate-800/40'}`}><div className={`h-32 rounded-lg relative overflow-hidden ${base.bg} p-2 shadow-inner`}><div className={`absolute top-2 left-2 right-2 h-4 ${base.head} rounded-t-sm flex items-center px-1`}><div className="w-2 h-2 rounded-full bg-red-500/70 mr-1"></div><div className="w-2 h-2 rounded-full bg-yellow-500/70 mr-1"></div><div className="w-2 h-2 rounded-full bg-green-500/70"></div></div><div className={`absolute top-7 left-2 w-8 bottom-2 ${base.side} rounded-l-sm`}></div><div className={`absolute top-7 left-11 right-2 bottom-2 ${base.bg} rounded-r-sm p-1.5`}><div className={`w-full h-2 rounded-sm ${base.head} mb-1.5`}></div><div className={`w-3/4 h-2 rounded-sm ${base.head} mb-1.5`}></div><div className={`w-1/2 h-2 rounded-sm ${base.head}`}></div></div></div><div className="mt-3 flex items-center justify-center"><div className="mr-2">{isDarkPreview ? <FiMoon className={`w-4 h-4 ${base.text}`} /> : <FiSun className={`w-4 h-4 ${base.text}`} />}</div><span className={`font-medium text-sm ${active ? 'text-[var(--accent-color)]' : base.text}`}>{label}</span>{active && <FiCheckCircle className="w-4 h-4 text-[var(--accent-color)] ml-2" />}</div></div>);};

const SelectField = ({ id, label, value, onChange, options, defaultValue }) => (
  <div><label htmlFor={id} className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-1.5">{label}</label><div className="relative"><select id={id} value={value} defaultValue={defaultValue} onChange={onChange} className="w-full pl-3.5 pr-10 py-2.5 text-slate-100 dark:text-slate-100 bg-slate-700/60 dark:bg-slate-800/70 border border-slate-600 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] transition-all appearance-none shadow-sm focus:shadow-md">{options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select><FiChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 pointer-events-none" /></div></div>
);

const FaqItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (<div className="border-b border-slate-700/70 dark:border-slate-800/70 last:border-b-0"><button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center py-3.5 text-left group" aria-expanded={isOpen}><h4 className="text-sm font-medium text-slate-200 dark:text-slate-200 group-hover:text-[var(--accent-color)] transition-colors">{question}</h4><FiChevronRight className={`w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-[var(--accent-color)] transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-90' : ''}`} /></button><AnimatePresence initial={false}>{isOpen && (<motion.div initial="collapsed" animate="open" exit="collapsed" variants={{open: { opacity: 1, height: 'auto', marginTop: '0.25rem' }, collapsed: { opacity: 0, height: 0, marginTop: '0rem' }}} transition={{ duration: 0.25, ease: "easeInOut" }} className="pb-3.5 pr-6 overflow-hidden"><p className="text-sm text-slate-400 dark:text-slate-400 leading-relaxed">{answer}</p></motion.div>)}</AnimatePresence></div>);};

const SpinnerIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" {...props}><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>);

export default SettingsPage;