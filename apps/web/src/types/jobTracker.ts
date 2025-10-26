export interface InterviewNote {
  id: string;
  jobId: string;
  type: 'phone' | 'technical' | 'behavioral' | 'final' | 'other';
  date: string;
  interviewer?: string;
  notes: string;
  questions: string[];
  feedback?: string;
  rating?: number;
}

export interface SalaryOffer {
  id: string;
  jobId: string;
  amount: number;
  currency: string;
  equity?: string;
  benefits?: string[];
  notes?: string;
  date: string;
  status: 'initial' | 'countered' | 'accepted' | 'rejected';
}

export interface CompanyInsight {
  id: string;
  jobId: string;
  type: 'culture' | 'benefits' | 'growth' | 'reviews' | 'news' | 'other';
  title: string;
  content: string;
  source?: string;
  date: string;
}

export interface ReferralContact {
  id: string;
  jobId: string;
  name: string;
  position: string;
  relationship: string;
  contacted: boolean;
  date: string;
  notes?: string;
}

export interface JobNote {
  id: string;
  jobId: string;
  title: string;
  content: string;
  tags: string[];
  date: string;
  category: 'research' | 'application' | 'interview' | 'offer' | 'other';
}

export interface JobReminder {
  id: string;
  jobId: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  type: 'follow-up' | 'deadline' | 'interview' | 'application' | 'other';
}

export interface EnhancedJob {
  // Existing Job fields
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  status: 'applied' | 'interview' | 'offer' | 'rejected';
  dateApplied: string;
  jobUrl?: string;
  description?: string;
  
  // New enhanced fields
  interviewNotes?: InterviewNote[];
  salaryOffers?: SalaryOffer[];
  companyInsights?: CompanyInsight[];
  referrals?: ReferralContact[];
  notes?: JobNote[];
  reminders?: JobReminder[];
  
  // Salary tracking
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
  
  // Application metadata
  platform?: string;
  applicationId?: string;
  resumeVersion?: string;
  coverLetterVersion?: string;
  
  // Company research
  companySize?: string;
  companyIndustry?: string;
  companyWebsite?: string;
  companyRating?: number;
}

