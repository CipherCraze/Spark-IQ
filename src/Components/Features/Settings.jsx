import { useState } from 'react';
import { FiSettings, FiUser, FiLock, FiBell, FiMoon, FiGlobe, FiCreditCard, FiHelpCircle } from 'react-icons/fi';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('account');
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [language, setLanguage] = useState('en');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle settings save logic
    alert('Settings saved successfully!');
  };

  return (
    <div className={`settings-container ${darkMode ? 'dark' : ''}`}>
      <div className="settings-header">
        <FiSettings className="settings-icon" />
        <h1>Settings</h1>
        <p>Manage your Spark IQ account preferences</p>
      </div>

      <div className="settings-content">
        <div className="settings-sidebar">
          <div 
            className={`sidebar-item ${activeTab === 'account' ? 'active' : ''}`}
            onClick={() => setActiveTab('account')}
          >
            <FiUser className="sidebar-icon" />
            <span>Account</span>
          </div>
          <div 
            className={`sidebar-item ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <FiLock className="sidebar-icon" />
            <span>Security</span>
          </div>
          <div 
            className={`sidebar-item ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <FiBell className="sidebar-icon" />
            <span>Notifications</span>
          </div>
          <div 
            className={`sidebar-item ${activeTab === 'appearance' ? 'active' : ''}`}
            onClick={() => setActiveTab('appearance')}
          >
            <FiMoon className="sidebar-icon" />
            <span>Appearance</span>
          </div>
          <div 
            className={`sidebar-item ${activeTab === 'language' ? 'active' : ''}`}
            onClick={() => setActiveTab('language')}
          >
            <FiGlobe className="sidebar-icon" />
            <span>Language</span>
          </div>
          <div 
            className={`sidebar-item ${activeTab === 'billing' ? 'active' : ''}`}
            onClick={() => setActiveTab('billing')}
          >
            <FiCreditCard className="sidebar-icon" />
            <span>Billing</span>
          </div>
          <div 
            className={`sidebar-item ${activeTab === 'help' ? 'active' : ''}`}
            onClick={() => setActiveTab('help')}
          >
            <FiHelpCircle className="sidebar-icon" />
            <span>Help</span>
          </div>
        </div>

        <div className="settings-main">
          {activeTab === 'account' && (
            <div className="settings-section">
              <h2>Account Information</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    defaultValue="John Doe" 
                    placeholder="Enter your full name" 
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input 
                    type="email" 
                    id="email" 
                    defaultValue="john.doe@example.com" 
                    placeholder="Enter your email" 
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="bio">Bio</label>
                  <textarea 
                    id="bio" 
                    rows="4" 
                    placeholder="Tell us about yourself..."
                    defaultValue="Mathematics teacher with 5 years of experience"
                  ></textarea>
                </div>
                <button type="submit" className="save-btn">Save Changes</button>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="settings-section">
              <h2>Security Settings</h2>
              <div className="security-item">
                <h3>Password</h3>
                <p>Last changed 3 months ago</p>
                <button className="action-btn">Change Password</button>
              </div>
              <div className="security-item">
                <h3>Two-Factor Authentication</h3>
                <p>Add an extra layer of security to your account</p>
                <button className="action-btn">Enable 2FA</button>
              </div>
              <div className="security-item">
                <h3>Active Sessions</h3>
                <p>You're logged in on Chrome (Windows)</p>
                <button className="action-btn danger">Log Out All Devices</button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h2>Notification Preferences</h2>
              <div className="toggle-group">
                <label>
                  <input 
                    type="checkbox" 
                    checked={notificationsEnabled} 
                    onChange={(e) => setNotificationsEnabled(e.target.checked)} 
                  />
                  <span>Enable Notifications</span>
                </label>
              </div>
              
              <div className="notification-types">
                <h3>Notification Types</h3>
                <div className="toggle-group">
                  <label>
                    <input 
                      type="checkbox" 
                      checked={emailNotifications} 
                      onChange={(e) => setEmailNotifications(e.target.checked)} 
                    />
                    <span>Email Notifications</span>
                  </label>
                </div>
                <div className="toggle-group">
                  <label>
                    <input 
                      type="checkbox" 
                      checked={pushNotifications} 
                      onChange={(e) => setPushNotifications(e.target.checked)} 
                    />
                    <span>Push Notifications</span>
                  </label>
                </div>
              </div>
              
              <div className="notification-events">
                <h3>Course Notifications</h3>
                <div className="toggle-group">
                  <label>
                    <input type="checkbox" defaultChecked />
                    <span>New course announcements</span>
                  </label>
                </div>
                <div className="toggle-group">
                  <label>
                    <input type="checkbox" defaultChecked />
                    <span>Assignment deadlines</span>
                  </label>
                </div>
                <div className="toggle-group">
                  <label>
                    <input type="checkbox" />
                    <span>Forum activity</span>
                  </label>
                </div>
              </div>
              <button className="save-btn">Save Preferences</button>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="settings-section">
              <h2>Appearance</h2>
              <div className="appearance-option">
                <h3>Theme</h3>
                <div className="theme-options">
                  <div 
                    className={`theme-option ${!darkMode ? 'active' : ''}`}
                    onClick={() => setDarkMode(false)}
                  >
                    <div className="light-theme-preview"></div>
                    <span>Light</span>
                  </div>
                  <div 
                    className={`theme-option ${darkMode ? 'active' : ''}`}
                    onClick={() => setDarkMode(true)}
                  >
                    <div className="dark-theme-preview"></div>
                    <span>Dark</span>
                  </div>
                </div>
              </div>
              
              <div className="appearance-option">
                <h3>Font Size</h3>
                <div className="font-size-options">
                  <button className="font-size-btn">Small</button>
                  <button className="font-size-btn active">Medium</button>
                  <button className="font-size-btn">Large</button>
                </div>
              </div>
              
              <div className="appearance-option">
                <h3>Density</h3>
                <div className="density-options">
                  <button className="density-btn">Compact</button>
                  <button className="density-btn active">Normal</button>
                  <button className="density-btn">Comfortable</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'language' && (
            <div className="settings-section">
              <h2>Language & Region</h2>
              <div className="form-group">
                <label htmlFor="language">Language</label>
                <select 
                  id="language" 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="zh">Chinese</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="timezone">Time Zone</label>
                <select id="timezone" defaultValue="UTC-05:00">
                  <option value="UTC-12:00">UTC-12:00</option>
                  <option value="UTC-05:00">UTC-05:00 (Eastern Time)</option>
                  <option value="UTC">UTC</option>
                  <option value="UTC+01:00">UTC+01:00 (Central European Time)</option>
                  <option value="UTC+08:00">UTC+08:00 (China Standard Time)</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="date-format">Date Format</label>
                <select id="date-format" defaultValue="mm/dd/yyyy">
                  <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                  <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                  <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                </select>
              </div>
              
              <button className="save-btn">Save Preferences</button>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="settings-section">
              <h2>Billing & Subscription</h2>
              <div className="billing-card">
                <h3>Current Plan</h3>
                <div className="plan-details">
                  <div className="plan-name">Premium</div>
                  <div className="plan-price">$9.99/month</div>
                  <div className="plan-features">
                    <p>✔ Unlimited courses</p>
                    <p>✔ Offline access</p>
                    <p>✔ Certificate generation</p>
                  </div>
                  <button className="action-btn">Change Plan</button>
                </div>
              </div>
              
              <div className="payment-method">
                <h3>Payment Method</h3>
                <div className="credit-card">
                  <FiCreditCard className="card-icon" />
                  <span>•••• •••• •••• 4242</span>
                  <span>Expires 04/2025</span>
                </div>
                <button className="action-btn">Update Payment Method</button>
              </div>
              
              <div className="billing-history">
                <h3>Billing History</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Amount</th>
                      <th>Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Mar 15, 2023</td>
                      <td>Premium Subscription</td>
                      <td>$9.99</td>
                      <td><button className="text-btn">View</button></td>
                    </tr>
                    <tr>
                      <td>Feb 15, 2023</td>
                      <td>Premium Subscription</td>
                      <td>$9.99</td>
                      <td><button className="text-btn">View</button></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'help' && (
            <div className="settings-section">
              <h2>Help & Support</h2>
              <div className="help-section">
                <h3>FAQs</h3>
                <div className="faq-item">
                  <h4>How do I reset my password?</h4>
                  <p>You can reset your password from the Security tab or by clicking "Forgot Password" on the login page.</p>
                </div>
                <div className="faq-item">
                  <h4>How do I cancel my subscription?</h4>
                  <p>Go to the Billing tab and click "Change Plan" to downgrade to the free version.</p>
                </div>
              </div>
              
              <div className="contact-support">
                <h3>Contact Support</h3>
                <p>Can't find what you're looking for? Our support team is here to help.</p>
                <button className="action-btn">Contact Us</button>
              </div>
              
              <div className="about-section">
                <h3>About Spark IQ</h3>
                <p>Version 2.4.1</p>
                <p>© 2023 Spark IQ Learning Technologies</p>
                <div className="legal-links">
                  <button className="text-btn">Terms of Service</button>
                  <button className="text-btn">Privacy Policy</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;