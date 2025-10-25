export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  company?: string;
  title?: string;
  location?: string;
  phone?: string;
  website?: string;
  bio?: string;
  skills?: string[];
  experience?: string;
  education?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SecuritySettings {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  twoFactorEnabled: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  loginAlerts: boolean;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  dateFormat: string;
  emailFrequency: 'immediate' | 'daily' | 'weekly' | 'never';
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    marketing: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'connections';
    showEmail: boolean;
    showPhone: boolean;
    showLocation: boolean;
  };
}

export interface BillingInfo {
  plan: 'free' | 'basic' | 'premium' | 'enterprise';
  status: 'active' | 'cancelled' | 'past_due';
  nextBillingDate: string;
  paymentMethod: {
    type: 'card' | 'paypal' | 'bank';
    last4: string;
    brand?: string;
  };
  billingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  invoices: Invoice[];
}

export interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  downloadUrl: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  category: 'technical' | 'billing' | 'feature' | 'bug' | 'general';
}

export interface FeedbackForm {
  type: 'bug' | 'feature' | 'improvement' | 'general';
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  attachments?: File[];
}

export interface JobApplication {
  id: string;
  title: string;
  company: string;
  location: string;
  status: 'applied' | 'interview' | 'offer' | 'rejected';
  appliedDate: string;
  salary?: string;
  description?: string;
  url?: string;
  notes?: string;
  priority?: 'low' | 'medium' | 'high';
  contact?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

export interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export type UserProfileTab = 'profile' | 'security' | 'preferences' | 'billing' | 'support' | 'jobs';
