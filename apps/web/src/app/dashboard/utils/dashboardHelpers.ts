/**
 * Dashboard helper functions for tab metadata
 */

import { HomeIcon, FolderOpen, Briefcase, MessageSquare, Mail, FileText, Globe, LayoutTemplate, UserIcon, Sparkles, Zap } from 'lucide-react';
import type { DashboardTab } from '../constants/dashboard.constants';

export function getDashboardTabTitle(tab: DashboardTab): string {
  switch(tab) {
    case 'storage': return 'Storage';
    case 'tracker':
    case 'jobs': return 'Job Tracker';
    case 'discussion': return 'Community';
    case 'email': return 'Email Hub';
    case 'cover-letter': return 'Cover Letter';
    case 'portfolio': return 'Portfolio';
    case 'templates': return 'Templates';
    case 'profile': return 'Profile';
    case 'dashboard': return 'Dashboard';
    case 'ai-agents':
    case 'agents': return 'AI Agents';
    case 'ai-auto-apply': return 'AI Auto Apply';
    default: return 'RoleReady';
  }
}

export function getDashboardTabSubtitle(tab: DashboardTab): string | undefined {
  switch(tab) {
    case 'dashboard': return 'Overview of your job search journey';
    case 'storage': return 'Manage your files and documents';
    case 'tracker':
    case 'jobs': return 'Track your job applications';
    case 'discussion': return 'Connect with the community';
    case 'email': return 'Manage your emails and contacts';
    case 'cover-letter': return 'Create professional cover letters';
    case 'portfolio': return 'Build your online portfolio';
    case 'templates': return 'Browse resume templates';
    case 'profile': return 'Manage your profile settings';
    case 'ai-agents':
    case 'agents': return 'AI-powered assistants';
    case 'ai-auto-apply': return 'Automate job applications with AI';
    default: return undefined;
  }
}

export function getDashboardTabIcon(tab: DashboardTab) {
  switch(tab) {
    case 'dashboard': return HomeIcon;
    case 'storage': return FolderOpen;
    case 'tracker':
    case 'jobs': return Briefcase;
    case 'discussion': return MessageSquare;
    case 'email': return Mail;
    case 'cover-letter': return FileText;
    case 'portfolio': return Globe;
    case 'templates': return LayoutTemplate;
    case 'profile': return UserIcon;
    case 'agents':
    case 'ai-agents': return Sparkles;
    case 'ai-auto-apply': return Zap;
    default: return undefined;
  }
}

export function getDashboardTabIconColor(tab: DashboardTab): string {
  switch(tab) {
    case 'dashboard': return 'text-blue-600';
    case 'storage': return 'text-blue-600';
    case 'tracker':
    case 'jobs': return 'text-green-600';
    case 'discussion': return 'text-indigo-600';
    case 'email': return 'text-purple-600';
    case 'cover-letter': return 'text-orange-600';
    case 'portfolio': return 'text-rose-600';
    case 'templates': return 'text-violet-600';
    case 'profile': return 'text-slate-600';
    case 'agents':
    case 'ai-agents': return 'text-purple-600';
    case 'ai-auto-apply': return 'text-yellow-600';
    default: return 'text-blue-600';
  }
}

export function shouldHidePageHeader(tab: DashboardTab): boolean {
  return tab === 'profile' ||
         tab === 'storage' ||
         tab === 'portfolio' ||
         tab === 'cover-letter' ||
         tab === 'agents' ||
         tab === 'ai-agents' ||
         tab === 'ai-auto-apply';
}

