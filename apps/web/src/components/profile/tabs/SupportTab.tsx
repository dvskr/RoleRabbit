'use client';

import React from 'react';
import { HelpCircle, MessageCircle, BookOpen, Mail, Phone } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

export default function SupportTab() {
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <div className="max-w-4xl">
      <div className="space-y-6">
        <div 
          className="backdrop-blur-sm rounded-2xl p-8 shadow-lg"
          style={{
            background: colors.cardBackground,
            border: `1px solid ${colors.border}`,
          }}
        >
          <h3 
            className="text-xl font-semibold mb-6"
            style={{ color: colors.primaryText }}
          >
            Get Help
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div 
              className="p-6 rounded-xl"
              style={{
                background: colors.badgeInfoBg,
                border: `1px solid ${colors.badgeInfoBorder}`,
              }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div 
                  className="p-3 rounded-lg"
                  style={{ background: colors.badgeInfoBg }}
                >
                  <HelpCircle size={24} style={{ color: colors.primaryBlue }} />
                </div>
                <h4 
                  className="text-lg font-semibold"
                  style={{ color: colors.primaryText }}
                >
                  Help Center
                </h4>
              </div>
              <p 
                className="mb-4"
                style={{ color: colors.secondaryText }}
              >
                Find answers to common questions and learn how to use our platform effectively.
              </p>
              <button 
                className="px-4 py-2 rounded-lg transition-colors"
                style={{
                  background: colors.primaryBlue,
                  color: 'white',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.primaryBlueHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = colors.primaryBlue;
                }}
              >
                Visit Help Center
              </button>
            </div>
            
            <div 
              className="p-6 rounded-xl"
              style={{
                background: colors.badgeSuccessBg,
                border: `1px solid ${colors.badgeSuccessBorder}`,
              }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div 
                  className="p-3 rounded-lg"
                  style={{ background: colors.badgeSuccessBg }}
                >
                  <MessageCircle size={24} style={{ color: colors.successGreen }} />
                </div>
                <h4 
                  className="text-lg font-semibold"
                  style={{ color: colors.primaryText }}
                >
                  Live Chat
                </h4>
              </div>
              <p 
                className="mb-4"
                style={{ color: colors.secondaryText }}
              >
                Chat with our support team for immediate assistance with your questions.
              </p>
              <button 
                className="px-4 py-2 rounded-lg transition-colors"
                style={{
                  background: colors.successGreen,
                  color: 'white',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                Start Chat
              </button>
            </div>
          </div>
        </div>

        <div 
          className="backdrop-blur-sm rounded-2xl p-8 shadow-lg"
          style={{
            background: colors.cardBackground,
            border: `1px solid ${colors.border}`,
          }}
        >
          <h3 
            className="text-xl font-semibold mb-6"
            style={{ color: colors.primaryText }}
          >
            Contact Us
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div 
              className="text-center p-4 sm:p-6 rounded-xl"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
              }}
            >
              <div 
                className="p-2 sm:p-3 rounded-lg w-fit mx-auto mb-3 sm:mb-4"
                style={{ background: colors.badgeInfoBg }}
              >
                <Mail size={20} className="sm:w-6 sm:h-6" style={{ color: colors.primaryBlue }} />
              </div>
              <h4 
                className="text-base sm:text-lg font-semibold mb-2"
                style={{ color: colors.primaryText }}
              >
                Email Support
              </h4>
              <p 
                className="mb-3 sm:mb-4 text-sm sm:text-base"
                style={{ color: colors.secondaryText }}
              >
                Send us an email and we'll get back to you within 24 hours.
              </p>
              <a 
                href="mailto:support@roleready.com" 
                className="font-medium transition-colors text-sm sm:text-base break-all"
                style={{ color: colors.primaryBlue }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = colors.primaryBlueHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = colors.primaryBlue;
                }}
              >
                support@roleready.com
              </a>
            </div>
            
            <div 
              className="text-center p-4 sm:p-6 rounded-xl"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
              }}
            >
              <div 
                className="p-2 sm:p-3 rounded-lg w-fit mx-auto mb-3 sm:mb-4"
                style={{ background: colors.badgeSuccessBg }}
              >
                <Phone size={20} className="sm:w-6 sm:h-6" style={{ color: colors.successGreen }} />
              </div>
              <h4 
                className="text-base sm:text-lg font-semibold mb-2"
                style={{ color: colors.primaryText }}
              >
                Phone Support
              </h4>
              <p 
                className="mb-3 sm:mb-4 text-sm sm:text-base"
                style={{ color: colors.secondaryText }}
              >
                Call us for urgent issues or complex questions.
              </p>
              <a 
                href="tel:+1-555-0123" 
                className="font-medium transition-colors text-sm sm:text-base break-all"
                style={{ color: colors.successGreen }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                +1 (555) 012-3456
              </a>
            </div>
            
            <div 
              className="text-center p-4 sm:p-6 rounded-xl"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
              }}
            >
              <div 
                className="p-2 sm:p-3 rounded-lg w-fit mx-auto mb-3 sm:mb-4"
                style={{ background: colors.badgePurpleBg }}
              >
                <BookOpen size={20} className="sm:w-6 sm:h-6" style={{ color: colors.badgePurpleText }} />
              </div>
              <h4 
                className="text-base sm:text-lg font-semibold mb-2"
                style={{ color: colors.primaryText }}
              >
                Documentation
              </h4>
              <p 
                className="mb-3 sm:mb-4 text-sm sm:text-base"
                style={{ color: colors.secondaryText }}
              >
                Browse our comprehensive documentation and guides.
              </p>
              <button 
                className="font-medium transition-colors text-sm sm:text-base"
                style={{ color: colors.badgePurpleText }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = colors.primaryBlue;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = colors.badgePurpleText;
                }}
              >
                View Docs
              </button>
            </div>
          </div>
        </div>

        <div 
          className="backdrop-blur-sm rounded-2xl p-8 shadow-lg"
          style={{
            background: colors.cardBackground,
            border: `1px solid ${colors.border}`,
          }}
        >
          <h3 
            className="text-xl font-semibold mb-6"
            style={{ color: colors.primaryText }}
          >
            Frequently Asked Questions
          </h3>
          <div className="space-y-4">
            <div 
              className="p-4 rounded-xl"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
              }}
            >
              <h4 
                className="font-semibold mb-2"
                style={{ color: colors.primaryText }}
              >
                How do I update my profile information?
              </h4>
              <p 
                style={{ color: colors.secondaryText }}
              >
                Click the "Edit Profile" button in the header, make your changes, and click "Save Changes".
              </p>
            </div>
            
            <div 
              className="p-4 rounded-xl"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
              }}
            >
              <h4 
                className="font-semibold mb-2"
                style={{ color: colors.primaryText }}
              >
                How can I improve my profile visibility?
              </h4>
              <p 
                style={{ color: colors.secondaryText }}
              >
                Complete all sections of your profile, add relevant skills, and keep your information up to date.
              </p>
            </div>
            
            <div 
              className="p-4 rounded-xl"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
              }}
            >
              <h4 
                className="font-semibold mb-2"
                style={{ color: colors.primaryText }}
              >
                Can I export my profile data?
              </h4>
              <p 
                style={{ color: colors.secondaryText }}
              >
                Yes, you can export your profile data in various formats from the settings section.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
