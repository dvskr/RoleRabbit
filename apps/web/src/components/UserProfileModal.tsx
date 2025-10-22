'use client';

import React, { useState } from 'react';
import { 
  User, 
  Shield, 
  Settings, 
  CreditCard, 
  HelpCircle, 
  X, 
  Save, 
  Eye, 
  EyeOff,
  Bell,
  Globe,
  Lock,
  Key,
  Smartphone,
  Mail,
  Phone,
  MapPin,
  Building,
  Calendar,
  CheckCircle,
  AlertCircle,
  Download,
  Upload,
  Trash2,
  LogOut,
  Search,
  Plus,
  Edit,
  Filter,
  SortAsc,
  Clock,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const { user, isAuthenticated, login, signup, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'English',
    autoSave: true,
    aiSuggestions: true,
    spellCheck: true,
    emailNotifications: true,
    browserNotifications: false,
    weeklySummary: true,
    analytics: true,
    marketingEmails: false
  });
  const [feedbackForm, setFeedbackForm] = useState({
    subject: '',
    message: ''
  });
  const [jobs, setJobs] = useState([
    {
      id: 1,
      title: 'Senior Software Engineer',
      company: 'Tech Corp',
      location: 'San Francisco, CA',
      status: 'applied',
      appliedDate: '2024-01-15',
      salary: '$120,000 - $150,000',
      description: 'Full-stack development role with React and Node.js',
      url: 'https://example.com/job/1',
      notes: 'Referred by John Smith'
    },
    {
      id: 2,
      title: 'Frontend Developer',
      company: 'StartupXYZ',
      location: 'Remote',
      status: 'interview',
      appliedDate: '2024-01-10',
      salary: '$90,000 - $110,000',
      description: 'React and TypeScript focused role',
      url: 'https://example.com/job/2',
      notes: 'Interview scheduled for next week'
    },
    {
      id: 3,
      title: 'Full Stack Developer',
      company: 'BigTech Inc',
      location: 'New York, NY',
      status: 'rejected',
      appliedDate: '2024-01-05',
      salary: '$130,000 - $160,000',
      description: 'Full-stack role with modern tech stack',
      url: 'https://example.com/job/3',
      notes: 'Did not meet experience requirements'
    }
  ]);
  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    location: '',
    status: 'applied',
    salary: '',
    description: '',
    url: '',
    notes: ''
  });
  const [showAddJob, setShowAddJob] = useState(false);
  const [jobFilter, setJobFilter] = useState('all');

  // Form states
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    company: '' 
  });
  
  const [profileForm, setProfileForm] = useState({
    name: user?.name || 'John Doe',
    email: user?.email || 'john.doe@example.com',
    company: 'Tech Corp',
    jobTitle: 'Software Engineer',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    bio: 'Experienced software engineer with 5+ years in full-stack development.',
    website: 'https://johndoe.com',
    linkedin: 'https://linkedin.com/in/johndoe',
    visibility: 'public',
    theme: 'default',
    skills: ['React', 'Node.js', 'TypeScript', 'Python']
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'support', label: 'Support', icon: HelpCircle },
  ];

  const handleLogin = async () => {
    await login(loginForm.email, loginForm.password);
    setLoginForm({ email: '', password: '' });
  };

  const handleSignup = async () => {
    await signup(signupForm.name, signupForm.email, signupForm.password);
    setSignupForm({ name: '', email: '', password: '', company: '' });
  };

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  const handleSaveProfile = () => {
    // Save profile logic here
    setIsEditing(false);
    // Show success message
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Profile Information</h3>
          <p className="text-gray-600 text-sm">Manage your personal and professional details</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <input
            type="text"
            value={profileForm.name}
            onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Email Address</label>
          <input
            type="email"
            value={profileForm.email}
            onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Company</label>
          <input
            type="text"
            value={profileForm.company}
            onChange={(e) => setProfileForm({...profileForm, company: e.target.value})}
            disabled={!isEditing}
            placeholder="Your company name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Job Title</label>
          <input
            type="text"
            value={profileForm.jobTitle}
            onChange={(e) => setProfileForm({...profileForm, jobTitle: e.target.value})}
            disabled={!isEditing}
            placeholder="Your job title"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Phone Number</label>
          <input
            type="tel"
            value={profileForm.phone}
            onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
            disabled={!isEditing}
            placeholder="+1 (555) 123-4567"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Location</label>
          <input
            type="text"
            value={profileForm.location}
            onChange={(e) => setProfileForm({...profileForm, location: e.target.value})}
            disabled={!isEditing}
            placeholder="City, State, Country"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <label className="block text-sm font-medium text-gray-700">Professional Bio</label>
          <textarea
            value={profileForm.bio}
            onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
            disabled={!isEditing}
            placeholder="Tell us about your professional background..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Website</label>
          <input
            type="url"
            value={profileForm.website}
            onChange={(e) => setProfileForm({...profileForm, website: e.target.value})}
            disabled={!isEditing}
            placeholder="https://yourwebsite.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">LinkedIn Profile</label>
          <input
            type="url"
            value={profileForm.linkedin}
            onChange={(e) => setProfileForm({...profileForm, linkedin: e.target.value})}
            disabled={!isEditing}
            placeholder="https://linkedin.com/in/yourprofile"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
          />
        </div>

        {/* Ad Placement - Premium Profile Features */}
        <div className="md:col-span-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-lg">⭐</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Premium Profile Features</h4>
                <p className="text-sm text-gray-600">Unlock advanced profile customization</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all">
              Upgrade Now
            </button>
          </div>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span>Custom Profile URL</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span>Profile Analytics</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span>Priority Support</span>
            </div>
          </div>
        </div>

        {/* Advanced Profile Features */}
        {isEditing && (
          <div className="md:col-span-2 space-y-4 mt-6">
            <h4 className="font-semibold text-gray-900 border-b border-gray-200 pb-2">Advanced Settings</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Profile Visibility</label>
                <select 
                  value={profileForm.visibility || 'public'}
                  onChange={(e) => setProfileForm({...profileForm, visibility: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="connections">Connections Only</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Profile Theme</label>
                <select 
                  value={profileForm.theme || 'default'}
                  onChange={(e) => setProfileForm({...profileForm, theme: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="default">Default</option>
                  <option value="professional">Professional</option>
                  <option value="creative">Creative</option>
                  <option value="minimal">Minimal</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Skills & Expertise</label>
              <div className="flex flex-wrap gap-2">
                {(profileForm.skills || []).map((skill, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    {skill}
                    <button 
                      onClick={() => {
                        const newSkills = profileForm.skills?.filter((_, i) => i !== index);
                        setProfileForm({...profileForm, skills: newSkills});
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder="Add skill..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const skill = e.target.value.trim();
                      if (skill && !profileForm.skills?.includes(skill)) {
                        setProfileForm({...profileForm, skills: [...(profileForm.skills || []), skill]});
                        e.target.value = '';
                      }
                    }
                  }}
                  className="px-3 py-1 border border-gray-300 rounded-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {isEditing && (
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveProfile}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Save size={16} />
            Save Changes
          </button>
        </div>
      )}
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900">Security Settings</h3>
        <p className="text-gray-600 text-sm">Manage your password and security preferences</p>
      </div>

      <div className="space-y-6">
        {/* Password Change */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Change Password</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input
                type="password"
                value={securityForm.currentPassword}
                onChange={(e) => setSecurityForm({...securityForm, currentPassword: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter current password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                value={securityForm.newPassword}
                onChange={(e) => setSecurityForm({...securityForm, newPassword: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={securityForm.confirmPassword}
                onChange={(e) => setSecurityForm({...securityForm, confirmPassword: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Confirm new password"
              />
            </div>
            <button 
              onClick={() => {
                if (securityForm.newPassword === securityForm.confirmPassword) {
                  alert('Password updated successfully!');
                  setSecurityForm({currentPassword: '', newPassword: '', confirmPassword: ''});
                } else {
                  alert('Passwords do not match!');
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Update Password
            </button>
          </div>
        </div>

        {/* Two-Factor Authentication */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Two-Factor Authentication</h4>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
              <p className="text-xs text-gray-500 mt-1">Status: Not enabled</p>
            </div>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Enable 2FA
            </button>
          </div>
        </div>

        {/* Ad Placement - Premium Security Features */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-lg">🔒</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Advanced Security Suite</h4>
                <p className="text-sm text-gray-600">Premium security features for ultimate protection</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all">
              Upgrade Security
            </button>
          </div>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span>Biometric Authentication</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span>Advanced Threat Detection</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span>Security Audit Reports</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span>Priority Security Support</span>
            </div>
          </div>
        </div>

        {/* Login Sessions */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Active Sessions</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <div>
                <p className="text-sm font-medium">Current Session</p>
                <p className="text-xs text-gray-500">Windows • Chrome • Last active: Now</p>
              </div>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">Mobile Session</p>
                <p className="text-xs text-gray-500">iPhone • Safari • Last active: 2 hours ago</p>
              </div>
              <button className="text-xs text-red-600 hover:text-red-800">End Session</button>
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Privacy Settings</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Profile Visibility</p>
                <p className="text-xs text-gray-500">Make your profile visible to other users</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Email Notifications</p>
                <p className="text-xs text-gray-500">Receive email updates about your account</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPreferencesTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900">Preferences</h3>
        <p className="text-gray-600 text-sm">Customize your application experience</p>
      </div>

      <div className="space-y-6">
        {/* Theme Settings */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Appearance</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
              <div className="flex space-x-3">
                <label className="flex items-center">
                  <input 
                    type="radio" 
                    name="theme" 
                    value="light" 
                    checked={preferences.theme === 'light'}
                    onChange={(e) => setPreferences({...preferences, theme: e.target.value})}
                    className="mr-2" 
                  />
                  <span className="text-sm">Light</span>
                </label>
                <label className="flex items-center">
                  <input 
                    type="radio" 
                    name="theme" 
                    value="dark" 
                    checked={preferences.theme === 'dark'}
                    onChange={(e) => setPreferences({...preferences, theme: e.target.value})}
                    className="mr-2" 
                  />
                  <span className="text-sm">Dark</span>
                </label>
                <label className="flex items-center">
                  <input 
                    type="radio" 
                    name="theme" 
                    value="auto" 
                    checked={preferences.theme === 'auto'}
                    onChange={(e) => setPreferences({...preferences, theme: e.target.value})}
                    className="mr-2" 
                  />
                  <span className="text-sm">Auto</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
              <select 
                value={preferences.language}
                onChange={(e) => setPreferences({...preferences, language: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
              </select>
            </div>
          </div>
        </div>

        {/* Resume Settings */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Resume Settings</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Auto-save</p>
                <p className="text-xs text-gray-500">Automatically save changes to your resume</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={preferences.autoSave}
                  onChange={(e) => setPreferences({...preferences, autoSave: e.target.checked})}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">AI Suggestions</p>
                <p className="text-xs text-gray-500">Show AI-powered suggestions while editing</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={preferences.aiSuggestions}
                  onChange={(e) => setPreferences({...preferences, aiSuggestions: e.target.checked})}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Spell Check</p>
                <p className="text-xs text-gray-500">Highlight spelling errors in real-time</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={preferences.spellCheck}
                  onChange={(e) => setPreferences({...preferences, spellCheck: e.target.checked})}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Notifications</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Email Notifications</p>
                <p className="text-xs text-gray-500">Receive updates via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={preferences.emailNotifications}
                  onChange={(e) => setPreferences({...preferences, emailNotifications: e.target.checked})}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Browser Notifications</p>
                <p className="text-xs text-gray-500">Show notifications in your browser</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={preferences.browserNotifications}
                  onChange={(e) => setPreferences({...preferences, browserNotifications: e.target.checked})}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Weekly Summary</p>
                <p className="text-xs text-gray-500">Get a weekly summary of your activity</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={preferences.weeklySummary}
                  onChange={(e) => setPreferences({...preferences, weeklySummary: e.target.checked})}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Data & Privacy */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Data & Privacy</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Analytics</p>
                <p className="text-xs text-gray-500">Help us improve by sharing usage data</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Marketing Emails</p>
                <p className="text-xs text-gray-500">Receive promotional content and updates</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBillingTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900">Billing & Subscription</h3>
        <p className="text-gray-600 text-sm">Manage your subscription and billing information</p>
      </div>

      <div className="space-y-6">
        {/* Current Plan */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-900">Free Plan</h4>
              <p className="text-sm text-gray-600">Basic features with limited usage</p>
              <p className="text-xs text-gray-500 mt-1">$0/month</p>
            </div>
            <div className="text-right">
              <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Active</span>
              <p className="text-xs text-gray-500 mt-1">Expires: Never</p>
            </div>
          </div>
        </div>

        {/* Upgrade Options */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Upgrade Your Plan</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
              <h5 className="font-semibold text-gray-900">Pro Plan</h5>
              <p className="text-2xl font-bold text-blue-600">$9.99<span className="text-sm font-normal text-gray-500">/month</span></p>
              <ul className="text-sm text-gray-600 mt-2 space-y-1">
                <li>• Unlimited resumes</li>
                <li>• Advanced templates</li>
                <li>• Priority support</li>
                <li>• Export to PDF</li>
              </ul>
              <button className="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Upgrade to Pro
              </button>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
              <h5 className="font-semibold text-gray-900">Business Plan</h5>
              <p className="text-2xl font-bold text-purple-600">$19.99<span className="text-sm font-normal text-gray-500">/month</span></p>
              <ul className="text-sm text-gray-600 mt-2 space-y-1">
                <li>• Everything in Pro</li>
                <li>• Team collaboration</li>
                <li>• Custom branding</li>
                <li>• API access</li>
              </ul>
              <button className="w-full mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                Upgrade to Business
              </button>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Payment Method</h4>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">V</span>
              </div>
              <div>
                <p className="text-sm font-medium">Visa ending in 4242</p>
                <p className="text-xs text-gray-500">Expires 12/25</p>
              </div>
            </div>
            <button className="text-blue-600 hover:text-blue-800 text-sm">Update</button>
          </div>
        </div>

        {/* Billing History */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Billing History</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <div>
                <p className="text-sm font-medium">Free Plan</p>
                <p className="text-xs text-gray-500">Started: Jan 1, 2024</p>
              </div>
              <span className="text-sm font-medium">$0.00</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">No charges yet</p>
                <p className="text-xs text-gray-500">Upgrade to see billing history</p>
              </div>
              <span className="text-sm text-gray-400">-</span>
            </div>
          </div>
        </div>

        {/* Usage Stats */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Usage This Month</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">3</p>
              <p className="text-xs text-gray-500">Resumes Created</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">12</p>
              <p className="text-xs text-gray-500">AI Generations</p>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Free Plan Limit</span>
              <span>3/5 resumes</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{width: '60%'}}></div>
            </div>
          </div>
        </div>

        {/* Ad Placement - Premium Features Showcase */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-lg">🚀</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Unlock Premium Power</h4>
                <p className="text-sm text-gray-600">Get unlimited access to all features</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Save 20%</p>
              <p className="text-xs text-green-600 font-semibold">Limited Time</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-white rounded-lg p-3 border border-purple-100">
              <h5 className="font-semibold text-gray-900 mb-2">Pro Features</h5>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Unlimited resumes</li>
                <li>• Advanced templates</li>
                <li>• Priority support</li>
                <li>• Export to PDF</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-3 border border-purple-100">
              <h5 className="font-semibold text-gray-900 mb-2">Business Features</h5>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Team collaboration</li>
                <li>• Custom branding</li>
                <li>• API access</li>
                <li>• Analytics dashboard</li>
              </ul>
            </div>
          </div>
          
          <button className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-semibold">
            Upgrade Now - 20% Off!
          </button>
        </div>

        {/* Advanced Billing Features */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Billing Preferences</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Auto-renewal</p>
                <p className="text-xs text-gray-500">Automatically renew subscription</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Email receipts</p>
                <p className="text-xs text-gray-500">Receive email receipts for payments</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Tax invoices</p>
                <p className="text-xs text-gray-500">Generate tax invoices for business use</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSupportTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900">Support & Help</h3>
        <p className="text-gray-600 text-sm">Get help and support for your account</p>
      </div>

      <div className="space-y-6">
        {/* Quick Help */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Quick Help</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button className="flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-blue-600 text-sm">📖</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">Getting Started</p>
                <p className="text-xs text-gray-500">Learn the basics</p>
              </div>
            </button>
            <button className="flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-green-600 text-sm">❓</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">FAQ</p>
                <p className="text-xs text-gray-500">Common questions</p>
              </div>
            </button>
            <button className="flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-purple-600 text-sm">🎥</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">Video Tutorials</p>
                <p className="text-xs text-gray-500">Step-by-step guides</p>
              </div>
            </button>
            <button className="flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-orange-600 text-sm">💬</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">Live Chat</p>
                <p className="text-xs text-gray-500">Chat with support</p>
              </div>
            </button>
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Contact Support</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-blue-600 text-sm">📧</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Email Support</p>
                  <p className="text-xs text-gray-500">support@roleready.com</p>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-800 text-sm">Send Email</button>
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-green-600 text-sm">📞</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Phone Support</p>
                  <p className="text-xs text-gray-500">+1 (555) 123-4567</p>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-800 text-sm">Call Now</button>
            </div>
          </div>
        </div>

        {/* Submit Feedback */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Submit Feedback</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input
                type="text"
                value={feedbackForm.subject}
                onChange={(e) => setFeedbackForm({...feedbackForm, subject: e.target.value})}
                placeholder="Brief description of your feedback"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                value={feedbackForm.message}
                onChange={(e) => setFeedbackForm({...feedbackForm, message: e.target.value})}
                placeholder="Tell us what you think..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button 
              onClick={() => {
                if (feedbackForm.subject && feedbackForm.message) {
                  alert('Feedback submitted successfully! Thank you for your input.');
                  setFeedbackForm({subject: '', message: ''});
                } else {
                  alert('Please fill in both subject and message fields.');
                }
              }}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Submit Feedback
            </button>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">System Status</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">API Services</span>
              <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Operational</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">AI Services</span>
              <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Operational</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">File Storage</span>
              <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Operational</span>
            </div>
          </div>
          <button className="mt-3 text-blue-600 hover:text-blue-800 text-sm">View Status Page</button>
        </div>

        {/* Ad Placement - Premium Support Features */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-orange-600 text-lg">🎯</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Priority Support</h4>
                <p className="text-sm text-gray-600">Get instant help with premium support</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition-all">
              Upgrade Support
            </button>
          </div>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span>24/7 Live Chat</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span>Phone Support</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span>Priority Ticket Queue</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span>Dedicated Account Manager</span>
            </div>
          </div>
        </div>

        {/* Advanced Support Features */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Help Center</h4>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button className="flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-blue-600 text-sm">📚</span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">Knowledge Base</p>
                  <p className="text-xs text-gray-500">Search articles</p>
                </div>
              </button>
              <button className="flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-green-600 text-sm">🎓</span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">Training Center</p>
                  <p className="text-xs text-gray-500">Learn best practices</p>
                </div>
              </button>
            </div>
            
            <div className="space-y-2">
              <h5 className="font-medium text-gray-900">Recent Articles</h5>
              <div className="space-y-1">
                <a href="#" className="block text-sm text-blue-600 hover:text-blue-800">How to create a professional resume</a>
                <a href="#" className="block text-sm text-blue-600 hover:text-blue-800">AI-powered resume optimization tips</a>
                <a href="#" className="block text-sm text-blue-600 hover:text-blue-800">Exporting your resume to different formats</a>
              </div>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Account Actions</h4>
          <div className="space-y-2">
            <button className="w-full text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-red-300 transition-colors text-red-600 hover:text-red-800">
              Export Account Data
            </button>
            <button className="w-full text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-red-300 transition-colors text-red-600 hover:text-red-800">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderJobTrackerTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Job Applications</h3>
          <p className="text-gray-600 text-sm">Organize and track your job search progress</p>
        </div>
        <button
          onClick={() => setShowAddJob(true)}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center gap-2"
        >
          <Plus size={16} />
          New Application
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Applications</p>
              <p className="text-2xl font-bold text-blue-900">{jobs.length}</p>
            </div>
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Calendar size={20} className="text-white" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Interviews</p>
              <p className="text-2xl font-bold text-green-900">{jobs.filter(j => j.status === 'interview').length}</p>
            </div>
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <Clock size={20} className="text-white" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Offers</p>
              <p className="text-2xl font-bold text-purple-900">{jobs.filter(j => j.status === 'offer').length}</p>
            </div>
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <CheckCircle size={20} className="text-white" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">Response Rate</p>
              <p className="text-2xl font-bold text-orange-900">
                {jobs.length > 0 ? Math.round((jobs.filter(j => j.status !== 'applied').length / jobs.length) * 100) : 0}%
              </p>
            </div>
            <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
              <TrendingUp size={20} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <select
              value={jobFilter}
              onChange={(e) => setJobFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="all">All Applications</option>
              <option value="applied">Applied</option>
              <option value="interview">Interview</option>
              <option value="offer">Offer</option>
              <option value="rejected">Rejected</option>
            </select>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Filter size={16} />
              <span>Filter by status</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <SortAsc size={16} />
            <span>Sort by date</span>
          </div>
        </div>
      </div>

      {/* Job Applications List */}
      <div className="space-y-3">
        {jobs.filter(job => jobFilter === 'all' || job.status === jobFilter).map((job) => (
          <div key={job.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <Building size={20} className="text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{job.title}</h4>
                    <p className="text-gray-600 font-medium">{job.company}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    job.status === 'applied' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                    job.status === 'interview' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                    job.status === 'offer' ? 'bg-green-100 text-green-800 border border-green-200' :
                    'bg-red-100 text-red-800 border border-red-200'
                  }`}>
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin size={16} className="text-gray-400" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={16} className="text-gray-400" />
                    <span>{job.appliedDate}</span>
                  </div>
                  {job.salary && (
                    <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                      <span className="text-green-500">$</span>
                      <span>{job.salary}</span>
                    </div>
                  )}
                </div>
                
                {job.description && (
                  <p className="text-sm text-gray-700 mb-3 line-clamp-2">{job.description}</p>
                )}
                
                {job.notes && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
                    <p className="text-xs text-gray-500 font-medium mb-1">Notes</p>
                    <p className="text-sm text-gray-700">{job.notes}</p>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2 ml-6">
                {job.url && (
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View Job Posting"
                  >
                    <Eye size={18} />
                  </a>
                )}
                <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                  <Edit size={18} />
                </button>
                <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {jobs.filter(job => jobFilter === 'all' || job.status === jobFilter).length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Calendar size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No applications found</h3>
            <p className="text-gray-600 mb-4">Start tracking your job applications to stay organized</p>
            <button
              onClick={() => setShowAddJob(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Add Your First Application
            </button>
          </div>
        )}
      </div>

      {/* Add Job Modal */}
      {showAddJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add New Job Application</h3>
              <button
                onClick={() => setShowAddJob(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                  <input
                    type="text"
                    value={newJob.title}
                    onChange={(e) => setNewJob({...newJob, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Senior Software Engineer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <input
                    type="text"
                    value={newJob.company}
                    onChange={(e) => setNewJob({...newJob, company: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Tech Corp"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={newJob.location}
                    onChange={(e) => setNewJob({...newJob, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., San Francisco, CA"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={newJob.status}
                    onChange={(e) => setNewJob({...newJob, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="applied">Applied</option>
                    <option value="interview">Interview</option>
                    <option value="offer">Offer</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salary Range</label>
                  <input
                    type="text"
                    value={newJob.salary}
                    onChange={(e) => setNewJob({...newJob, salary: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., $100,000 - $120,000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job URL</label>
                  <input
                    type="url"
                    value={newJob.url}
                    onChange={(e) => setNewJob({...newJob, url: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://..."
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
                <textarea
                  value={newJob.description}
                  onChange={(e) => setNewJob({...newJob, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Brief description of the role..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={newJob.notes}
                  onChange={(e) => setNewJob({...newJob, notes: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Additional notes, referrals, etc..."
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddJob(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const job = {
                    ...newJob,
                    id: Date.now(),
                    appliedDate: new Date().toISOString().split('T')[0]
                  };
                  setJobs([...jobs, job]);
                  setNewJob({
                    title: '',
                    company: '',
                    location: '',
                    status: 'applied',
                    salary: '',
                    description: '',
                    url: '',
                    notes: ''
                  });
                  setShowAddJob(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Job
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex">
      {/* Side Panel */}
      <div className="w-full max-w-7xl bg-white shadow-2xl flex animate-in slide-in-from-left duration-300">

        {/* Left Side - Profile Content */}
        <div className="flex-1 flex">
          {/* Sidebar */}
          <div className="w-64 bg-gradient-to-br from-blue-50 to-purple-50 p-6 border-r border-gray-200">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <User size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Account</h2>
                    <p className="text-xs text-gray-500">Manage profile</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={18} className="text-gray-500" />
                </button>
              </div>

              {isAuthenticated ? (
                <div className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
                          activeTab === tab.id
                            ? 'bg-blue-500 text-white shadow-md'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <Icon size={16} />
                        <span className="font-medium text-sm">{tab.label}</span>
                      </button>
                    );
                  })}
                  
                  <div className="pt-4 mt-4 border-t border-gray-200">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={16} />
                      <span className="font-medium text-sm">Sign Out</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => setActiveTab('auth')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
                      activeTab === 'auth'
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <User size={16} />
                    <span className="font-medium text-sm">{isLoginMode ? 'Sign In' : 'Create Account'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Compact Main Content */}
          <div className="flex-1 p-6 overflow-y-auto bg-white">
            <div className="max-w-2xl">
              {!isAuthenticated ? (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <User size={24} className="text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {isLoginMode ? 'Welcome Back' : 'Join RoleReady'}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {isLoginMode ? 'Sign in to continue' : 'Create your account to get started'}
                    </p>
                  </div>

                  <div className="space-y-4">
                    {isLoginMode ? (
                      <>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={loginForm.email}
                            onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                            placeholder="Enter your email"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Password
                          </label>
                          <input
                            type="password"
                            value={loginForm.password}
                            onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                            placeholder="Enter your password"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          />
                        </div>

                        <button
                          onClick={handleLogin}
                          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                          Sign In
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={signupForm.name}
                            onChange={(e) => setSignupForm({...signupForm, name: e.target.value})}
                            placeholder="Enter your full name"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={signupForm.email}
                            onChange={(e) => setSignupForm({...signupForm, email: e.target.value})}
                            placeholder="Enter your email"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Password
                          </label>
                          <input
                            type="password"
                            value={signupForm.password}
                            onChange={(e) => setSignupForm({...signupForm, password: e.target.value})}
                            placeholder="Create a password"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Company (Optional)
                          </label>
                          <input
                            type="text"
                            value={signupForm.company}
                            onChange={(e) => setSignupForm({...signupForm, company: e.target.value})}
                            placeholder="Your company name"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          />
                        </div>

                        <button
                          onClick={handleSignup}
                          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                          Create Account
                        </button>
                      </>
                    )}

                    <div className="text-center">
                      <button
                        onClick={() => setIsLoginMode(!isLoginMode)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                      >
                        {isLoginMode ? "Don't have an account? Create one" : "Already have an account? Sign in"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {activeTab === 'profile' && renderProfileTab()}
                  {activeTab === 'security' && renderSecurityTab()}
                  {activeTab === 'preferences' && renderPreferencesTab()}
                  {activeTab === 'billing' && renderBillingTab()}
                  {activeTab === 'support' && renderSupportTab()}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Ad Space */}
        <div className="w-72 bg-gray-50 border-l border-gray-200 p-4 overflow-y-auto">
          <div className="space-y-4">
            {/* Ad Header */}
            <div className="text-center pb-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Sponsored Content</h3>
            </div>

            {/* Premium Upgrade Ad */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-4 text-white">
              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-lg">🚀</span>
                </div>
                <h4 className="text-lg font-bold mb-2">Upgrade to Pro</h4>
                <p className="text-blue-100 text-xs mb-3 leading-relaxed">Unlock unlimited resumes and advanced features</p>
                <button className="w-full bg-white text-blue-600 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors">
                  Start Free Trial
                </button>
              </div>
            </div>

            {/* Career Services Ad */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-center">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-green-600 text-sm">💼</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2 text-sm">Career Coaching</h4>
                <p className="text-gray-600 text-xs mb-3 leading-relaxed">Get personalized career advice from industry experts</p>
                <button className="w-full bg-green-600 text-white py-2 rounded-lg text-xs font-medium hover:bg-green-700 transition-colors">
                  Learn More
                </button>
              </div>
            </div>

            {/* Resume Templates Ad */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-center">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-purple-600 text-sm">📄</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2 text-sm">Premium Templates</h4>
                <p className="text-gray-600 text-xs mb-3 leading-relaxed">Access 50+ professionally designed resume templates</p>
                <button className="w-full bg-purple-600 text-white py-2 rounded-lg text-xs font-medium hover:bg-purple-700 transition-colors">
                  Browse Templates
                </button>
              </div>
            </div>

            {/* Job Search Ad */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-center">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-orange-600 text-sm">🔍</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2 text-sm">Job Search Pro</h4>
                <p className="text-gray-600 text-xs mb-3 leading-relaxed">Find your dream job with our advanced job search tools</p>
                <button className="w-full bg-orange-600 text-white py-2 rounded-lg text-xs font-medium hover:bg-orange-700 transition-colors">
                  Start Searching
                </button>
              </div>
            </div>

            {/* AI Resume Builder Ad */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-blue-600 text-sm">🤖</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2 text-sm">AI Resume Builder</h4>
                <p className="text-gray-600 text-xs mb-3 leading-relaxed">Let AI optimize your resume for better results</p>
                <button className="w-full bg-blue-600 text-white py-2 rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors">
                  Try AI Builder
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">Advertisement</p>
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      <div 
        className="flex-1 bg-transparent" 
        onClick={onClose}
      ></div>
    </div>
  );
}
