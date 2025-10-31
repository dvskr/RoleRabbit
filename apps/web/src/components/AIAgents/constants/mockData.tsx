import React from 'react';
import { 
  FileText, 
  Briefcase, 
  Mail, 
  Search, 
  List, 
  BookOpen,
  Zap
} from 'lucide-react';
import { ActiveTask, Capability, HistoryTask, ChatMessage } from '../types';

// Mock data for active tasks
export const MOCK_ACTIVE_TASKS: ActiveTask[] = [
  {
    id: '1',
    title: 'Generating tailored resumes',
    company: 'TechCorp Inc.',
    role: 'Senior Full Stack Developer',
    description: 'Creating 3 resume variations with ATS scores: 95+, 90+, 85+',
    progress: 65,
    icon: <FileText size={18} />,
    started: '2 min ago',
    status: 'in-progress'
  },
  {
    id: '2',
    title: 'Researching company',
    company: 'StartupXYZ',
    role: 'Product Manager',
    description: 'Gathering company info, recent news, and culture insights',
    progress: 40,
    icon: <Search size={18} />,
    started: '5 min ago',
    status: 'in-progress'
  },
  {
    id: '3',
    title: 'Cover letter generated',
    company: 'Design Studio',
    role: 'UX Designer',
    description: '1 files ATS: 94',
    progress: 100,
    icon: <Mail size={18} />,
    started: '8 min ago',
    status: 'completed'
  },
  {
    id: '4',
    title: 'Job tracker updated',
    company: 'AI Labs',
    role: 'Data Scientist',
    description: '',
    progress: 100,
    icon: <List size={18} />,
    started: '10 min ago',
    status: 'completed'
  }
];

// Mock data for capabilities
export const MOCK_CAPABILITIES: Capability[] = [
  {
    id: '1',
    title: 'Job Board Auto-Fill',
    description: 'Auto-fill applications from LinkedIn, Indeed, and other job boards with tailored resume data',
    icon: <Briefcase size={20} />,
    enabled: true
  },
  {
    id: '2',
    title: 'Multi-Resume Generator',
    description: 'Generate multiple resume variations for a single JD with different templates and ATS scores',
    icon: <FileText size={20} />,
    enabled: true
  },
  {
    id: '3',
    title: 'Bulk JD Processing',
    description: 'Process multiple job descriptions and create tailored resumes for each',
    icon: <Zap size={20} />,
    enabled: true
  },
  {
    id: '4',
    title: 'Job Tracker Auto-Fill',
    description: 'Automatically populate job tracker with application details and status',
    icon: <List size={20} />,
    enabled: true
  },
  {
    id: '5',
    title: 'Cold Email Generator',
    description: 'Send personalized cold emails and cover letters for each application',
    icon: <Mail size={20} />,
    enabled: true
  },
  {
    id: '6',
    title: 'Interview Prep',
    description: 'Generate comprehensive interview materials covering all skills from JD',
    icon: <BookOpen size={20} />,
    enabled: true
  },
  {
    id: '7',
    title: 'Company Research',
    description: 'Research companies and add detailed notes to job tracker',
    icon: <Search size={20} />,
    enabled: true
  }
];

// Mock data for history
export const MOCK_HISTORY_TASKS: HistoryTask[] = [
  { 
    id: '1', 
    title: '5 resumes generated for different JDs', 
    count: 5, 
    icon: <FileText size={18} />, 
    status: 'Completed successfully', 
    completed: '10:15 AM', 
    date: 'today' 
  },
  { 
    id: '2', 
    title: '3 companies researched', 
    count: 3, 
    icon: <Search size={18} />, 
    status: 'Completed successfully', 
    completed: '9:45 AM', 
    date: 'today' 
  },
  { 
    id: '3', 
    title: '8 cover letters created', 
    count: 8, 
    icon: <Mail size={18} />, 
    status: 'Completed successfully', 
    completed: '9:30 AM', 
    date: 'today' 
  },
  { 
    id: '4', 
    title: '12 job applications auto-filled', 
    count: 12, 
    icon: <Briefcase size={18} />, 
    status: 'Completed successfully', 
    completed: '8:00 AM', 
    date: 'today' 
  },
  { 
    id: '5', 
    title: '7 interview prep guides generated', 
    count: 7, 
    icon: <BookOpen size={18} />, 
    status: 'Completed successfully', 
    completed: 'Yesterday, 6:30 PM', 
    date: 'yesterday' 
  },
  { 
    id: '6', 
    title: '4 cold emails sent', 
    count: 4, 
    icon: <Mail size={18} />, 
    status: 'Completed successfully', 
    completed: 'Yesterday, 5:15 PM', 
    date: 'yesterday' 
  },
  { 
    id: '7', 
    title: '10 job tracker entries updated', 
    count: 10, 
    icon: <List size={18} />, 
    status: 'Completed successfully', 
    completed: 'Yesterday, 4:00 PM', 
    date: 'yesterday' 
  }
];

// Initial chat message
export const INITIAL_CHAT_MESSAGE: ChatMessage = {
  id: '1',
  sender: 'ai',
  message: "Hi! I'm your AI Job Application Assistant. I can help you automate your entire job search process - from tailoring resumes to researching companies. What would you like me to do?",
  timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
};

