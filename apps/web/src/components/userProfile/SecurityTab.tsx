'use client';

import React from 'react';
import { Shield, Key, Eye, EyeOff, Bell, Smartphone, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { SecuritySettings } from '../../types/userProfile';

interface SecurityTabProps {
  securityForm: SecuritySettings;
  setSecurityForm: (security: SecuritySettings) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  onUpdate: (security: SecuritySettings) => void;
}

export default function SecurityTab({ 
  securityForm, 
  setSecurityForm, 
  showPassword, 
  setShowPassword, 
  onUpdate 
}: SecurityTabProps) {
  const handleInputChange = (field: keyof SecuritySettings, value: string | boolean) => {
    setSecurityForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onUpdate(securityForm);
  };

  return (
    <div className="space-y-6">
      {/* Password Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <Key size={20} className="text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
            <p className="text-sm text-gray-600">Update your password to keep your account secure</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={securityForm.currentPassword}
                onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={securityForm.newPassword}
                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter new password"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={securityForm.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Confirm new password"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Update Password
            </button>
          </div>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Shield size={20} className="text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h3>
            <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${securityForm.twoFactorEnabled ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className="text-sm font-medium text-gray-700">
              {securityForm.twoFactorEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <button
            onClick={() => handleInputChange('twoFactorEnabled', !securityForm.twoFactorEnabled)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              securityForm.twoFactorEnabled
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {securityForm.twoFactorEnabled ? 'Disable' : 'Enable'}
          </button>
        </div>

        {securityForm.twoFactorEnabled && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle size={16} className="text-green-600" />
              <span className="text-sm text-green-800">Two-factor authentication is active</span>
            </div>
            <p className="text-xs text-green-700 mt-1">
              You'll need to enter a verification code when signing in
            </p>
          </div>
        )}
      </div>

      {/* Notification Preferences */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Bell size={20} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Security Notifications</h3>
            <p className="text-sm text-gray-600">Choose how you want to be notified about security events</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Mail size={16} className="text-gray-400" />
              <div>
                <span className="text-sm font-medium text-gray-700">Email Notifications</span>
                <p className="text-xs text-gray-500">Receive security alerts via email</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={securityForm.emailNotifications}
                onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Smartphone size={16} className="text-gray-400" />
              <div>
                <span className="text-sm font-medium text-gray-700">SMS Notifications</span>
                <p className="text-xs text-gray-500">Receive security alerts via SMS</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={securityForm.smsNotifications}
                onChange={(e) => handleInputChange('smsNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertCircle size={16} className="text-gray-400" />
              <div>
                <span className="text-sm font-medium text-gray-700">Login Alerts</span>
                <p className="text-xs text-gray-500">Get notified when someone logs into your account</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={securityForm.loginAlerts}
                onChange={(e) => handleInputChange('loginAlerts', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save Preferences
          </button>
        </div>
      </div>

      {/* Security Tips */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-yellow-800 mb-4">Security Tips</h3>
        <ul className="space-y-2 text-sm text-yellow-700">
          <li className="flex items-start space-x-2">
            <span className="text-yellow-600 mt-1">•</span>
            <span>Use a strong, unique password with at least 8 characters</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-yellow-600 mt-1">•</span>
            <span>Enable two-factor authentication for extra security</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-yellow-600 mt-1">•</span>
            <span>Keep your contact information up to date</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-yellow-600 mt-1">•</span>
            <span>Review your login activity regularly</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
