'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, Bell, Settings, LogOut, Briefcase, Target, FileText, BarChart3, Award,
  Edit, Save, X, Camera, Mail, Phone, MapPin, Calendar
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardHeader from './DashboardHeader';

export default function ProfileRedesign() {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');

  const profileStats = [
    { label: 'Active Jobs', value: '12', icon: Briefcase, color: 'text-blue-400' },
    { label: 'Resumes', value: '5', icon: FileText, color: 'text-green-400' },
    { label: 'Interviews', value: '3', icon: Target, color: 'text-purple-400' },
    { label: 'Response Rate', value: '68%', icon: BarChart3, color: 'text-orange-400' },
  ];

  const sections = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'professional', label: 'Professional', icon: Briefcase },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="h-full flex flex-col bg-[#0A0E14]">
      <DashboardHeader 
        title="Profile" 
        subtitle="Manage your personal information"
      />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Profile Card */}
          <div className="bg-[#1A1F26] border border-[#27272A] rounded-lg overflow-hidden">
            {/* Header with Avatar */}
            <div className="bg-gradient-to-br from-[#34B27B]/20 to-[#3ECF8E]/10 p-6 border-b border-[#27272A]">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#34B27B] to-[#3ECF8E] flex items-center justify-center">
                      <span className="text-3xl font-bold text-white">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <button className="absolute bottom-0 right-0 p-2 bg-[#1A1F26] border border-[#27272A] rounded-full hover:border-[#34B27B] transition-colors">
                      <Camera size={16} className="text-[#A0A0A0]" />
                    </button>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white mb-1">{user?.name || 'User'}</h1>
                    <p className="text-sm text-[#A0A0A0] mb-2">{user?.email}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-[#6B7280]">San Francisco, CA</span>
                      <span className="text-[#6B7280]">•</span>
                      <span className="text-[#6B7280]">5+ years experience</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-[#34B27B] text-white rounded-lg hover:bg-[#3ECF8E] transition-colors flex items-center gap-2"
                    >
                      <Edit size={16} />
                      Edit Profile
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 bg-[#27272A] text-white rounded-lg hover:bg-[#1A1F26] transition-colors flex items-center gap-2"
                      >
                        <Save size={16} />
                        Save
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 bg-red-600/20 text-red-400 border border-red-600/30 rounded-lg hover:bg-red-600/30 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </>
                  )}
                  <button
                    onClick={logout}
                    className="px-4 py-2 bg-red-600/20 text-red-400 border border-red-600/30 rounded-lg hover:bg-red-600/30 transition-colors flex items-center gap-2"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-0 border-b border-[#27272A]">
              {profileStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className="p-6 border-r border-[#27272A] last:border-r-0 hover:bg-[#0D1117] transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Icon size={20} className={stat.color} />
                      <span className="text-sm text-[#A0A0A0]">{stat.label}</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                  </div>
                );
              })}
            </div>

            {/* Content Section */}
            <div className="grid grid-cols-4">
              {/* Sidebar Navigation */}
              <div className="col-span-1 border-r border-[#27272A] p-4">
                <nav className="space-y-1">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                          activeSection === section.id
                            ? 'bg-[#34B27B]/10 text-[#34B27B]'
                            : 'text-[#A0A0A0] hover:bg-[#1A1F26] hover:text-white'
                        }`}
                      >
                        <Icon size={18} />
                        {section.label}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Main Content */}
              <div className="col-span-3 p-6">
                {activeSection === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-semibold text-[#6B7280] uppercase mb-4">Personal Information</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-3 text-sm text-[#A0A0A0]">
                            <Mail size={16} className="text-[#6B7280]" />
                            john.doe@example.com
                          </div>
                          <div className="flex items-center gap-3 text-sm text-[#A0A0A0]">
                            <Phone size={16} className="text-[#6B7280]" />
                            +1 (555) 123-4567
                          </div>
                          <div className="flex items-center gap-3 text-sm text-[#A0A0A0]">
                            <MapPin size={16} className="text-[#6B7280]" />
                            San Francisco, CA
                          </div>
                          <div className="flex items-center gap-3 text-sm text-[#A0A0A0]">
                            <Calendar size={16} className="text-[#6B7280]" />
                            Joined Jan 2024
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-[#6B7280] uppercase mb-4">Professional Profile</h3>
                      <div className="space-y-3">
                        <div className="bg-[#0D1117] rounded-lg p-4 border border-[#27272A]">
                          <p className="text-xs text-[#6B7280] mb-1">Current Role</p>
                          <p className="text-sm font-medium text-white">Senior Software Engineer</p>
                        </div>
                        <div className="bg-[#0D1117] rounded-lg p-4 border border-[#27272A]">
                          <p className="text-xs text-[#6B7280] mb-1">Company</p>
                          <p className="text-sm font-medium text-white">Tech Corp</p>
                        </div>
                        <div className="bg-[#0D1117] rounded-lg p-4 border border-[#27272A]">
                          <p className="text-xs text-[#6B7280] mb-1">Bio</p>
                          <p className="text-sm text-[#A0A0A0]">
                            Experienced software engineer with 5+ years of experience in full-stack development.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-[#6B7280] uppercase mb-4">Activity Summary</h3>
                      <div className="bg-[#0D1117] rounded-lg p-4 border border-[#27272A]">
                        <p className="text-sm text-[#A0A0A0]">
                          Last active: 2 hours ago
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-[#6B7280] uppercase mb-4">Resume Statistics</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-[#0D1117] rounded-lg p-4 border border-[#27272A]">
                          <p className="text-xs text-[#6B7280] mb-2">Total Views</p>
                          <p className="text-xl font-bold text-white">245</p>
                        </div>
                        <div className="bg-[#0D1117] rounded-lg p-4 border border-[#27272A]">
                          <p className="text-xs text-[#6B7280] mb-2">Downloads</p>
                          <p className="text-xl font-bold text-white">18</p>
                        </div>
                        <div className="bg-[#0D1117] rounded-lg p-4 border border-[#27272A]">
                          <p className="text-xs text-[#6B7280] mb-2">Last Updated</p>
                          <p className="text-xl font-bold text-white">3 days</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

