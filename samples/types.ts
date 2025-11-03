/**
 * TypeScript type definitions for sample data
 * Use these types when working with sample files
 */

export interface SampleResumeData {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    location?: string;
    linkedIn?: string;
    website?: string;
    summary?: string;
  };
  experience?: Array<{
    company: string;
    position: string;
    location?: string;
    startDate: string;
    endDate: string | "present";
    description: string[];
  }>;
  education?: Array<{
    institution: string;
    degree: string;
    field: string;
    location?: string;
    startDate: string;
    endDate: string;
    gpa?: string;
    honors?: string;
  }>;
  skills?: Array<{
    category: string;
    items: string[];
  }>;
  projects?: Array<{
    name: string;
    description: string;
    technologies: string[];
    url?: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    date: string;
    expiryDate?: string;
  }>;
  publications?: Array<{
    title: string;
    venue: string;
    authors: string[];
    url?: string;
  }>;
}

export interface ApiRequestExample {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  url: string;
  headers: Record<string, string>;
  body?: Record<string, unknown>;
  expectedResponse: {
    status: number;
    data: Record<string, unknown>;
  };
}

export interface TestUser {
  id: string;
  email: string;
  password: string;
  name: string;
  profile?: {
    title?: string;
    location?: string;
    bio?: string;
  };
}

export interface TestResume {
  id: string;
  userId: string;
  title: string;
  template: string;
  data: SampleResumeData;
}

export interface TestJob {
  id: string;
  userId: string;
  title: string;
  company: string;
  status: "applied" | "interview" | "offer" | "rejected" | "accepted";
  appliedDate: string;
  location?: string;
  salary?: string;
  notes?: string;
  interviewDate?: string;
}

export interface JobDescription {
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  requiredSkills: string[];
  preferredSkills?: string[];
  salary?: string;
  postedDate: string;
}

export interface EmailTemplate {
  subject: string;
  body: string;
}

export interface EmailTemplates {
  coldEmail: EmailTemplate;
  followUp: EmailTemplate;
  thankYou: EmailTemplate;
  acceptance: EmailTemplate;
  negotiation: EmailTemplate;
}

// Helper function types
export type LoadSampleResume = () => Promise<SampleResumeData>;
export type LoadSampleJobs = () => Promise<JobDescription[]>;
export type LoadTestUsers = () => Promise<TestUser[]>;

