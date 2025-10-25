'use client';

import React from 'react';
import { BookOpen, Video, FileText, Users, Target, Zap } from 'lucide-react';

export function SponsoredAdPlaceholder() {
  const getDynamicHeight = () => {
    if (typeof window !== 'undefined') {
      return window.innerHeight * 0.9; // Use 90% of viewport height to fill space
    }
    return 600;
  };

  const roleReadyFeatures = [
    {
      id: 1,
      title: "Resume Builder Pro",
      description: "AI-powered resume optimization with ATS compatibility",
      icon: FileText,
      color: "bg-blue-500",
      badge: "Premium",
      badgeColor: "bg-blue-100 text-blue-800",
      action: "Upgrade Now"
    },
    {
      id: 2,
      title: "Interview Prep Course",
      description: "Master behavioral and technical interview questions",
      icon: Video,
      color: "bg-green-500",
      badge: "Popular",
      badgeColor: "bg-green-100 text-green-800",
      action: "Start Course"
    },
    {
      id: 3,
      title: "Career Coaching",
      description: "1-on-1 sessions with industry experts",
      icon: Users,
      color: "bg-purple-500",
      badge: "Limited",
      badgeColor: "bg-purple-100 text-purple-800",
      action: "Book Session"
    },
    {
      id: 4,
      title: "Job Search Masterclass",
      description: "Complete guide to landing your dream job",
      icon: BookOpen,
      color: "bg-orange-500",
      badge: "New",
      badgeColor: "bg-orange-100 text-orange-800",
      action: "Enroll Now"
    },
    {
      id: 5,
      title: "Skills Assessment",
      description: "Identify gaps and get personalized learning paths",
      icon: Target,
      color: "bg-indigo-500",
      badge: "Free",
      badgeColor: "bg-indigo-100 text-indigo-800",
      action: "Take Test"
    },
    {
      id: 6,
      title: "AI Cover Letters",
      description: "Generate personalized cover letters in seconds",
      icon: Zap,
      color: "bg-pink-500",
      badge: "AI-Powered",
      badgeColor: "bg-pink-100 text-pink-800",
      action: "Try Now"
    }
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-xl font-bold text-gray-900">RoleReady Premium</h3>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Premium Features</span>
        </div>
        <p className="text-xs text-gray-600">Unlock your full potential with our premium tools</p>
      </div>

      {/* Features Grid - Fill all available space */}
      <div className="flex-1 overflow-y-auto scrollbar-hide p-3">
        <div className="grid grid-cols-1 gap-2">
          {roleReadyFeatures.map(feature => (
            <div
              key={feature.id}
              className="p-2 rounded border border-gray-200 hover:shadow-sm transition-shadow cursor-pointer group bg-gradient-to-r from-white to-gray-50"
            >
              <div className="flex items-start gap-2">
                <div className={`p-1.5 rounded ${feature.color} text-white flex-shrink-0`}>
                  <feature.icon size={12} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 mb-0.5">
                    <h4 className="text-xs font-medium text-gray-900 line-clamp-1">
                      {feature.title}
                    </h4>
                    <span className={`text-xs px-1 py-0.5 rounded-full ${feature.badgeColor} flex-shrink-0`}>
                      {feature.badge}
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-600 line-clamp-2 mb-1">
                    {feature.description}
                  </p>
                  
                  <button className="text-xs text-blue-600 hover:text-blue-700 font-medium group-hover:underline">
                    {feature.action} →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-3 pt-2 border-t border-gray-100">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">
              Upgrade to Premium for unlimited access
            </p>
            <button className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors">
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
