'use client';

import React, { useState } from 'react';
import {
  Home as HomeIcon,
  FileText,
  Users,
  Briefcase,
  MessageSquare,
  Cloud,
  Layout,
  Sparkles,
  TrendingUp,
  Award,
  Star,
  CheckCircle,
  ArrowRight,
  Play,
  Quote
} from 'lucide-react';
import { MissionControlDashboard } from './dashboard';
import { DashboardConfig } from './dashboard/types/dashboard';

interface HomeProps {
  // NEW OPTIONAL PROPS (backward compatible)
  enableMissionControl?: boolean; // Default: false
  dashboardConfig?: Partial<DashboardConfig>;
  onQuickAction?: (actionId: string) => void;
  onNavigateToTab?: (tab: string) => void;
}

export default function Home({ 
  enableMissionControl = false,
  dashboardConfig,
  onQuickAction,
  onNavigateToTab
}: HomeProps) {
  // If Mission Control is enabled, render the dashboard
  if (enableMissionControl) {
    return (
      <MissionControlDashboard
        config={dashboardConfig}
        onQuickAction={onQuickAction}
        onNavigateToTab={onNavigateToTab}
      />
    );
  }

  // Existing marketing page (unchanged)
  const [activeFeature, setActiveFeature] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const features = [
    {
      icon: <FileText size={24} className="text-blue-600" />,
      title: "AI-Powered Resume Builder",
      description: "Create professional resumes with AI assistance, ATS optimization, and real-time feedback.",
      stats: "95% ATS Pass Rate"
    },
    {
      icon: <Users size={24} className="text-green-600" />,
      title: "Professional Networks",
      description: "Connect with industry professionals, join role-based communities, and grow your network.",
      stats: "50K+ Active Members"
    },
    {
      icon: <Briefcase size={24} className="text-purple-600" />,
      title: "Job Tracker",
      description: "Organize your job applications, track progress, and never miss an opportunity.",
      stats: "10K+ Jobs Tracked"
    },
    {
      icon: <MessageSquare size={24} className="text-orange-600" />,
      title: "Career Discussions",
      description: "Get advice, share experiences, and learn from industry experts and peers.",
      stats: "1M+ Discussions"
    },
    {
      icon: <Cloud size={24} className="text-indigo-600" />,
      title: "Cloud Storage",
      description: "Securely store and sync your resumes, documents, and career materials.",
      stats: "99.9% Uptime"
    },
    {
      icon: <Layout size={24} className="text-pink-600" />,
      title: "50+ Templates",
      description: "Choose from professionally designed templates for every industry and role.",
      stats: "50+ Templates"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Software Engineer",
      company: "Tech Corp",
      content: "RoleReady helped me land my dream job at a top tech company. The AI resume builder and job tracker were game-changers!",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
    },
    {
      name: "Michael Chen",
      role: "Product Manager",
      company: "StartupXYZ",
      content: "The networking features and career discussions gave me insights I couldn't find anywhere else. Highly recommended!",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    },
    {
      name: "Emily Rodriguez",
      role: "UX Designer",
      company: "Design Studio",
      content: "The templates and cloud storage made it so easy to manage multiple versions of my portfolio. Love this platform!",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
    }
  ];

  const stats = [
    { number: "100K+", label: "Active Users", icon: <Users size={20} /> },
    { number: "500K+", label: "Resumes Created", icon: <FileText size={20} /> },
    { number: "50K+", label: "Jobs Tracked", icon: <Briefcase size={20} /> },
    { number: "95%", label: "Success Rate", icon: <Award size={20} /> }
  ];

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 flex flex-col overflow-hidden">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white py-16 px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mr-4">
              <Sparkles size={32} className="text-white" />
            </div>
            <h1 className="text-5xl font-bold">RoleReady</h1>
          </div>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Your all-in-one career platform for resume building, job tracking, networking, and professional growth.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center">
              <Play size={20} className="inline mr-2" />
              Get Started Free
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
              Watch Demo
            </button>
          </div>
        </div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 border border-white rounded-full"></div>
          <div className="absolute top-32 right-20 w-16 h-16 border border-white rounded-full"></div>
          <div className="absolute bottom-20 left-32 w-12 h-12 border border-white rounded-full"></div>
        </div>
      </div>

      {/* Features Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="py-16 px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need for Career Success</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                From AI-powered resume building to professional networking, we provide all the tools you need to advance your career.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`p-8 rounded-2xl border transition-all duration-300 cursor-pointer ${
                    activeFeature === index
                      ? 'bg-white shadow-xl border-blue-200 scale-105'
                      : 'bg-white/50 hover:bg-white hover:shadow-lg border-gray-200'
                  }`}
                  onClick={() => setActiveFeature(index)}
                >
                  <div className="mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  <div className="flex items-center text-sm font-medium text-blue-600">
                    <TrendingUp size={16} className="mr-1" />
                    {feature.stats}
                  </div>
                </div>
              ))}
            </div>

            {/* Stats Section */}
            <div className="bg-white rounded-2xl p-8 shadow-lg mb-16">
              <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">Trusted by Professionals Worldwide</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="flex items-center justify-center mb-3">
                      {stat.icon}
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                    <div className="text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonials Section */}
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">What Our Users Say</h3>
              <p className="text-gray-600">Join thousands of professionals who have advanced their careers with RoleReady</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-xl border transition-all duration-300 ${
                    activeTestimonial === index
                      ? 'bg-blue-50 border-blue-200 shadow-lg'
                      : 'bg-white border-gray-200 hover:shadow-md'
                  }`}
                  onClick={() => setActiveTestimonial(index)}
                >
                  <div className="flex items-center mb-4">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.role} at {testimonial.company}</div>
                    </div>
                  </div>
                  <div className="flex items-start mb-4">
                    <Quote size={32} className="text-blue-600 mx-auto mb-4" />
                  </div>
                  <p className="text-gray-700 italic">"{testimonial.content}"</p>
                </div>
              ))}
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
              <h3 className="text-3xl font-bold mb-4">Ready to Advance Your Career?</h3>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Join RoleReady today and get access to all our premium features. Start building your professional future.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center">
                  <Star size={20} className="mr-2" />
                  Start Free Trial
                </button>
                <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors flex items-center justify-center">
                  <CheckCircle size={20} className="mr-2" />
                  View Pricing
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}