'use client';

import React from 'react';
import { HelpCircle, MessageCircle, BookOpen, Mail, Phone } from 'lucide-react';

export default function SupportTab() {
  return (
    <div className="max-w-4xl">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Help & Support</h2>
      
      <div className="space-y-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Get Help</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-blue-50 rounded-xl border border-blue-200/50">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <HelpCircle size={24} className="text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Help Center</h4>
              </div>
              <p className="text-gray-600 mb-4">Find answers to common questions and learn how to use our platform effectively.</p>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Visit Help Center
              </button>
            </div>
            
            <div className="p-6 bg-green-50 rounded-xl border border-green-200/50">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <MessageCircle size={24} className="text-green-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Live Chat</h4>
              </div>
              <p className="text-gray-600 mb-4">Chat with our support team for immediate assistance with your questions.</p>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Start Chat
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Contact Us</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gray-50 rounded-xl">
              <div className="p-3 bg-blue-100 rounded-lg w-fit mx-auto mb-4">
                <Mail size={24} className="text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Email Support</h4>
              <p className="text-gray-600 mb-4">Send us an email and we'll get back to you within 24 hours.</p>
              <a href="mailto:support@roleready.com" className="text-blue-600 hover:text-blue-800 font-medium">
                support@roleready.com
              </a>
            </div>
            
            <div className="text-center p-6 bg-gray-50 rounded-xl">
              <div className="p-3 bg-green-100 rounded-lg w-fit mx-auto mb-4">
                <Phone size={24} className="text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Phone Support</h4>
              <p className="text-gray-600 mb-4">Call us for urgent issues or complex questions.</p>
              <a href="tel:+1-555-0123" className="text-green-600 hover:text-green-800 font-medium">
                +1 (555) 012-3456
              </a>
            </div>
            
            <div className="text-center p-6 bg-gray-50 rounded-xl">
              <div className="p-3 bg-purple-100 rounded-lg w-fit mx-auto mb-4">
                <BookOpen size={24} className="text-purple-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Documentation</h4>
              <p className="text-gray-600 mb-4">Browse our comprehensive documentation and guides.</p>
              <button className="text-purple-600 hover:text-purple-800 font-medium">
                View Docs
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Frequently Asked Questions</h3>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <h4 className="font-semibold text-gray-900 mb-2">How do I update my profile information?</h4>
              <p className="text-gray-600">Click the "Edit Profile" button in the header, make your changes, and click "Save Changes".</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-xl">
              <h4 className="font-semibold text-gray-900 mb-2">How can I improve my profile visibility?</h4>
              <p className="text-gray-600">Complete all sections of your profile, add relevant skills, and keep your information up to date.</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-xl">
              <h4 className="font-semibold text-gray-900 mb-2">Can I export my profile data?</h4>
              <p className="text-gray-600">Yes, you can export your profile data in various formats from the settings section.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
