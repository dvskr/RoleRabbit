/**
 * Dashboard helper functions for tab metadata
 */

import { HomeIcon, FolderOpen, Briefcase, MessageSquare, Mail, FileText, Globe, LayoutTemplate, UserIcon } from 'lucide-react';
import type { DashboardTab } from '../constants/dashboard.constants';

export function getDashboardTabTitle(tab: DashboardTab): string {
  switch(tab) {
    case 'storage': return 'Storage';
    case 'tracker':
    case 'jobs': return 'Job Tracker';
    case 'discussion': return 'Community';
    case 'email': return 'Email Hub';
    case 'cover-letter': return 'Cover Letter';
    case 'templates': return 'Templates';
    case 'profile': return 'Profile';
    case 'dashboard': return 'Dashboard';
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
    case 'templates': return 'Browse resume templates';
    case 'profile': return 'Manage your profile settings';
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
    case 'templates': return LayoutTemplate;
    case 'profile': return UserIcon;
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
    case 'templates': return 'text-violet-600';
    case 'profile': return 'text-slate-600';
    default: return 'text-blue-600';
  }
}

export function shouldHidePageHeader(tab: DashboardTab): boolean {
  return tab === 'profile' ||
         tab === 'storage' ||
         tab === 'cover-letter';
}

