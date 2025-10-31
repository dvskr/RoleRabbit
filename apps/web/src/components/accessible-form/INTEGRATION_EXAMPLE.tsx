/**
 * Integration Example: Using AccessibleForm Components
 * 
 * This file demonstrates how to integrate the refactored accessible-form
 * components into the application. Copy these patterns to your components.
 */

'use client';

import React, { useState } from 'react';
import { 
  AccessibleInput, 
  AccessibleTextarea, 
  AccessibleSelect, 
  AccessibleButton,
  AccessibleCheckbox,
  AccessibleRadioGroup
} from './index';

/**
 * Example: Contact Form using AccessibleForm components
 * Replace this with your actual implementation
 */
export function AccessibleContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    priority: '',
    subscribe: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.message) newErrors.message = 'Message is required';
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      // Handle submission
      console.log('Form submitted:', formData);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Contact Us</h2>

      {/* Name Field */}
      <AccessibleInput
        label="Full Name"
        fieldName="name"
        type="text"
        required
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        error={errors.name}
        helperText="Enter your full legal name"
      />

      {/* Email Field */}
      <AccessibleInput
        label="Email Address"
        fieldName="email"
        type="email"
        required
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        error={errors.email}
        helperText="We'll never share your email"
      />

      {/* Subject Selection */}
      <AccessibleSelect
        label="Subject"
        fieldName="subject"
        required
        value={formData.subject}
        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
        options={[
          { value: '', label: 'Select a subject', disabled: true },
          { value: 'general', label: 'General Inquiry' },
          { value: 'support', label: 'Support Request' },
          { value: 'feedback', label: 'Feedback' },
          { value: 'other', label: 'Other' }
        ]}
      />

      {/* Priority Radio Group */}
      <AccessibleRadioGroup
        label="Priority"
        name="priority"
        fieldName="priority"
        required
        value={formData.priority}
        onChange={(value) => setFormData({ ...formData, priority: value })}
        options={[
          { value: 'low', label: 'Low - Can wait a few days' },
          { value: 'medium', label: 'Medium - Within 24 hours' },
          { value: 'high', label: 'High - Urgent' }
        ]}
      />

      {/* Message Field */}
      <AccessibleTextarea
        label="Message"
        fieldName="message"
        required
        rows={6}
        value={formData.message}
        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        error={errors.message}
        helperText="Please provide as much detail as possible"
      />

      {/* Checkbox */}
      <AccessibleCheckbox
        label="Subscribe to our newsletter for updates and tips"
        fieldName="subscribe"
        checked={formData.subscribe}
        onChange={(e) => setFormData({ ...formData, subscribe: e.target.checked })}
        helperText="You can unsubscribe at any time"
      />

      {/* Submit Button */}
      <div className="flex gap-4">
        <AccessibleButton
          variant="primary"
          size="lg"
          type="submit"
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </AccessibleButton>

        <AccessibleButton
          variant="secondary"
          size="lg"
          type="button"
          onClick={() => {
            setFormData({
              name: '',
              email: '',
              subject: '',
              message: '',
              priority: '',
              subscribe: false
            });
            setErrors({});
          }}
        >
          Clear Form
        </AccessibleButton>
      </div>
    </form>
  );
}

/**
 * Example: Login Form
 */
export function AccessibleLoginForm() {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login:', credentials);
    // Implement login logic
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4 w-full max-w-md mx-auto">
      <AccessibleInput
        label="Email"
        fieldName="login-email"
        type="email"
        required
        value={credentials.email}
        onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
        placeholder="you@example.com"
      />

      <AccessibleInput
        label="Password"
        fieldName="login-password"
        type="password"
        required
        value={credentials.password}
        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
        helperText="Use a strong password"
      />

      <AccessibleButton
        variant="primary"
        type="submit"
        size="lg"
        className="w-full"
      >
        Sign In
      </AccessibleButton>
    </form>
  );
}

/**
 * Example: Settings Form
 */
export function AccessibleSettingsForm() {
  const [settings, setSettings] = useState({
    theme: 'light',
    notifications: true,
    language: 'en'
  });

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Preferences</h3>

      <AccessibleSelect
        label="Theme"
        fieldName="theme"
        value={settings.theme}
        onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
        options={[
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' },
          { value: 'system', label: 'System Default' }
        ]}
        helperText="Choose your preferred color scheme"
      />

      <AccessibleSelect
        label="Language"
        fieldName="language"
        value={settings.language}
        onChange={(e) => setSettings({ ...settings, language: e.target.value })}
        options={[
          { value: 'en', label: 'English' },
          { value: 'es', label: 'Spanish' },
          { value: 'fr', label: 'French' }
        ]}
      />

      <AccessibleCheckbox
        label="Enable email notifications"
        fieldName="notifications"
        checked={settings.notifications}
        onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
        helperText="Receive updates about your account"
      />
    </div>
  );
}

/**
 * Export all examples for easy importing
 */
export default {
  AccessibleContactForm,
  AccessibleLoginForm,
  AccessibleSettingsForm
};

