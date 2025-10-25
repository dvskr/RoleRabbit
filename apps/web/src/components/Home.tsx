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
  Download,
  Upload,
  Search,
  Filter,
  Plus,
  Eye,
  Share2,
  Heart,
  Zap,
  Target,
  Shield,
  Globe,
  Smartphone,
  Laptop,
  Monitor,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Calendar,
  Clock,
  MapPin,
  Mail,
  Phone,
  Linkedin,
  Github,
  Twitter,
  Facebook,
  Instagram,
  Youtube,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Quote,
  User,
  Building,
  GraduationCap,
  Code,
  Database,
  Server,
  Settings,
  Bell,
  Bookmark,
  Flag,
  ThumbsUp,
  MessageCircle,
  Send,
  Edit,
  Save,
  Trash2,
  Copy,
  RefreshCw,
  Lock,
  Unlock,
  EyeOff,
  Maximize2,
  Minimize2,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Move,
  GripVertical,
  MoreHorizontal,
  MoreVertical,
  Menu,
  X,
  Search as SearchIcon,
  Filter as FilterIcon,
  SortAsc,
  SortDesc,
  Grid,
  List,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  MapPin as MapPinIcon,
  Mail as MailIcon,
  Phone as PhoneIcon,
  Linkedin as LinkedinIcon,
  Github as GithubIcon,
  Twitter as TwitterIcon,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  Youtube as YoutubeIcon,
  ExternalLink as ExternalLinkIcon,
  ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon,
  Quote as QuoteIcon,
  User as UserIcon,
  Building as BuildingIcon,
  GraduationCap as GraduationCapIcon,
  Code as CodeIcon,
  Database as DatabaseIcon,
  Server as ServerIcon,
  Upload as CloudUploadIcon,
  Download as CloudDownloadIcon,
  Settings as SettingsIcon,
  Bell as BellIcon,
  Bookmark as BookmarkIcon,
  Flag as FlagIcon,
  ThumbsUp as ThumbsUpIcon,
  MessageCircle as MessageCircleIcon,
  Send as SendIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Trash2 as Trash2Icon,
  Copy as CopyIcon,
  RefreshCw as RefreshCwIcon,
  Lock as LockIcon,
  Unlock as UnlockIcon,
  EyeOff as EyeOffIcon,
  Maximize2 as Maximize2Icon,
  Minimize2 as Minimize2Icon,
  RotateCcw as RotateCcwIcon,
  RotateCw as RotateCwIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Move as MoveIcon,
  GripVertical as GripVerticalIcon,
  MoreHorizontal as MoreHorizontalIcon,
  MoreVertical as MoreVerticalIcon,
  Menu as MenuIcon,
  X as XIcon
} from 'lucide-react';

interface HomeProps {}

export default function Home({}: HomeProps) {
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
      name: "Sarah Chen",
      role: "Software Engineer",
      company: "Google",
      avatar: "/avatars/sarah.jpg",
      content: "RoleReady helped me land my dream job at Google. The AI resume optimization and professional networks were game-changers.",
      rating: 5
    },
    {
      name: "Mike Rodriguez",
      role: "Product Manager",
      company: "Microsoft",
      avatar: "/avatars/mike.jpg",
      content: "The job tracker and community features made my job search so much more organized and effective.",
      rating: 5
    },
    {
      name: "Emily Watson",
      role: "Data Scientist",
      company: "Amazon",
      avatar: "/avatars/emily.jpg",
      content: "I love how RoleReady combines resume building with networking. It's a complete career platform.",
      rating: 5
    }
  ];

  const stats = [
    { number: "100K+", label: "Active Users", icon: <Users size={20} /> },
    { number: "500K+", label: "Resumes Created", icon: <FileText size={20} /> },
    { number: "50K+", label: "Jobs Tracked", icon: <Briefcase size={20} /> },
    { number: "95%", label: "Success Rate", icon: <Award size={20} /> }
  ];

  const companies = [
    "Google", "Microsoft", "Amazon", "Apple", "Meta", "Netflix", "Tesla", "Uber", "Airbnb", "Spotify"
  ];

  return (
    <div className="h-full bg-gray-50 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="px-6 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Build Your Career with
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                AI-Powered Tools
              </span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Create professional resumes, track job applications, connect with industry professionals, 
              and accelerate your career growth with our comprehensive platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg">
                Get Started Free
              </button>
              <button className="px-8 py-4 border-2 border-white text-white rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-colors">
                <Play size={20} className="inline mr-2" />
                Watch Demo
              </button>
            </div>
            <p className="text-blue-200 text-sm mt-4">
              No credit card required • 14-day free trial
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-12">
        <div className="px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <div className="text-white">{stat.icon}</div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.number}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Everything You Need for Career Success
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Our comprehensive platform combines AI-powered tools with professional networking 
                to help you build, track, and accelerate your career.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  <div className="flex items-center text-sm font-semibold text-blue-600">
                    <TrendingUp size={16} className="mr-1" />
                    {feature.stats}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Trusted By Section */}
      <div className="py-12 bg-white">
        <div className="px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h3 className="text-lg font-semibold text-gray-600 mb-6">Trusted by professionals at</h3>
              <div className="grid grid-cols-5 gap-8 items-center opacity-60">
                {companies.map((company, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-gray-400">{company}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-16 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                What Our Users Say
              </h2>
              <p className="text-xl text-gray-600">
                Join thousands of professionals who have accelerated their careers with RoleReady
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="text-center mb-6">
                <div className="flex justify-center mb-4">
                  {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                    <Star key={i} size={20} className="text-yellow-400 fill-current" />
                  ))}
                </div>
                <Quote size={32} className="text-blue-600 mx-auto mb-4" />
                <p className="text-lg text-gray-700 italic">
                  "{testimonials[activeTestimonial].content}"
                </p>
              </div>
              <div className="flex items-center justify-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  {testimonials[activeTestimonial].name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{testimonials[activeTestimonial].name}</div>
                  <div className="text-gray-600">{testimonials[activeTestimonial].role} at {testimonials[activeTestimonial].company}</div>
                </div>
              </div>
              <div className="flex justify-center mt-6 gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === activeTestimonial ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Accelerate Your Career?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of professionals who are already using RoleReady to build their careers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg">
                Start Free Trial
              </button>
              <button className="px-8 py-4 border-2 border-white text-white rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-colors">
                Schedule Demo
              </button>
            </div>
            <p className="text-blue-200 text-sm mt-4">
              No setup fees • Cancel anytime • 24/7 support
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-12">
        <div className="px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">RoleReady</h3>
                <p className="text-gray-400 text-sm">
                  The complete platform for building and advancing your career with AI-powered tools and professional networking.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Product</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Resume Builder</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Job Tracker</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Networks</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Templates</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
              <p>&copy; 2024 RoleReady. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
