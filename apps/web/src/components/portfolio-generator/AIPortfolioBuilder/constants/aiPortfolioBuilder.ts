import type { StepConfig, DesignStyleConfig, ThemeColor, PortfolioSection } from '../types/aiPortfolioBuilder';

// Default portfolio sections
export const DEFAULT_SECTIONS: PortfolioSection[] = [
  { id: 'hero', name: 'Hero', visible: true, required: true },
  { id: 'about', name: 'About', visible: true, required: true },
  { id: 'skills', name: 'Skills', visible: true, required: true },
  { id: 'projects', name: 'Projects', visible: true },
  { id: 'experience', name: 'Experience', visible: true },
  { id: 'testimonials', name: 'Testimonials', visible: true },
  { id: 'blog', name: 'Blog', visible: true },
  { id: 'contact', name: 'Contact', visible: true },
];

// Progress steps
export const STEPS: StepConfig[] = [
  { id: 'setup', label: '1 Setup' },
  { id: 'generate', label: '2 Generate' },
  { id: 'edit', label: '3 Edit' },
  { id: 'deploy', label: '4 Deploy' },
];

// Theme colors
export const THEME_COLORS: ThemeColor[] = [
  { name: 'Purple', value: 'purple', color: '#a855f7' },
  { name: 'Blue', value: 'blue', color: '#3b82f6' },
  { name: 'Green', value: 'green', color: '#10b981' },
  { name: 'Pink', value: 'pink', color: '#ec4899' },
  { name: 'Orange', value: 'orange', color: '#f97316' },
  { name: 'Teal', value: 'teal', color: '#14b8a6' },
  { name: 'Indigo', value: 'indigo', color: '#6366f1' },
  { name: 'Red', value: 'red', color: '#ef4444' },
];

// Typography fonts
export const FONTS: string[] = ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins'];

// Design style configurations
export const DESIGN_STYLES: DesignStyleConfig[] = [
  { 
    id: 'clean', 
    label: 'Clean', 
    description: 'Clean, simple design with focus on content', 
    features: 'Simple typography, white space, minimal colors' 
  },
  { 
    id: 'moderate', 
    label: 'Moderate', 
    description: 'Balanced design with visual interest', 
    features: 'Gradients, animations, modern components' 
  },
  { 
    id: 'creative', 
    label: 'Creative', 
    description: 'Bold, expressive design with unique elements', 
    features: '3D effects, custom illustrations, interactive' 
  },
];

// Welcome message for AI chat
export const WELCOME_MESSAGE = "Hi! I'm your AI portfolio builder. I can help you create a stunning personal website in minutes. Would you like to import your resume, use your RoleReady profile, or describe what you want?";

// Default AI response message
export const DEFAULT_AI_RESPONSE = "Got it! I'll help you with that. Let me update your portfolio accordingly.";

