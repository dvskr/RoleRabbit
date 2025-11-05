'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles, Menu, X, Check, ArrowRight, Play, Star, TrendingUp, Zap,
  Briefcase, Cloud, Globe, Mail, Shield, Users, Award, FileText,
  Target, Rocket, MessageSquare, Bot, Crown, ChevronRight, CheckCircle2,
  Linkedin, Twitter, Instagram, Github
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Logo } from '@/components/common/Logo';

export default function NewLandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);

  // Stats animation
  const [stats, setStats] = useState({
    users: 0,
    success: 0,
    salary: 0,
    companies: 0
  });

  // Scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      setScrollProgress(scrolled);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Animate stats on mount
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      setStats({
        users: Math.floor(progress * 50000),
        success: Math.floor(progress * 94),
        salary: Math.floor(progress * 175),
        companies: Math.floor(progress * 500)
      });

      if (step >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered Resume Builder',
      desc: 'Create ATS-optimized resumes in minutes with intelligent suggestions and real-time optimization',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Target,
      title: 'Smart Job Tracking',
      desc: 'Manage your entire job search pipeline with our Notion-like interface and never miss a follow-up',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Bot,
      title: 'AI Interview Coach',
      desc: 'Practice with AI-powered mock interviews and get instant feedback to ace your next interview',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: FileText,
      title: 'Cover Letter Generator',
      desc: 'Generate compelling, personalized cover letters that get you noticed by recruiters',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: Mail,
      title: 'Email Campaign Manager',
      desc: 'Automate follow-ups and networking emails with AI-generated content and tracking',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Globe,
      title: 'Portfolio Builder',
      desc: 'Create stunning portfolio websites in minutes to showcase your work and stand out',
      color: 'from-teal-500 to-blue-500'
    },
    {
      icon: Cloud,
      title: 'Cloud Storage',
      desc: 'Securely store and access all your career documents from anywhere, anytime',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: MessageSquare,
      title: 'Community Forum',
      desc: 'Connect with other job seekers, share experiences, and get advice from the community',
      color: 'from-pink-500 to-rose-500'
    },
    {
      icon: Award,
      title: 'Career Analytics',
      desc: 'Track your progress with detailed analytics and insights to optimize your job search',
      color: 'from-cyan-500 to-blue-500'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Software Engineer at Google',
      image: '👩‍💻',
      text: 'RoleReady helped me land my dream job at Google! The AI resume builder made my profile stand out, and I got 3x more interview calls.',
      rating: 5
    },
    {
      name: 'Michael Rodriguez',
      role: 'Product Manager at Amazon',
      image: '👨‍💼',
      text: 'The job tracker feature is a game-changer. I managed 47 applications effortlessly and landed offers from Amazon and Microsoft.',
      rating: 5
    },
    {
      name: 'Emily Johnson',
      role: 'UX Designer at Apple',
      image: '👩‍🎨',
      text: 'The portfolio builder helped me create a stunning website in under an hour. Got hired at Apple within 2 weeks!',
      rating: 5
    }
  ];

  const pricingPlans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect to get started',
      features: [
        '1 Resume',
        'Basic Templates',
        'PDF Export',
        'Job Tracker (10 jobs)',
        'Community Access'
      ],
      cta: 'Start Free',
      popular: false
    },
    {
      name: 'Pro',
      price: '$12',
      period: 'month',
      description: 'For serious job seekers',
      features: [
        'Unlimited Resumes',
        'Premium Templates',
        'AI Content Generation',
        'Unlimited Job Tracking',
        'Cover Letter Generator',
        'Email Campaigns',
        'Portfolio Builder',
        'Priority Support'
      ],
      cta: 'Start Free Trial',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For teams and organizations',
      features: [
        'Everything in Pro',
        'Team Management',
        'Custom Branding',
        'API Access',
        'Dedicated Support',
        'SLA Guarantee',
        'Training & Onboarding'
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ];

  const companyLogos = [
    { name: 'Google', icon: '🔍' },
    { name: 'Amazon', icon: '📦' },
    { name: 'Apple', icon: '🍎' },
    { name: 'Microsoft', icon: '🪟' },
    { name: 'Meta', icon: '👁️' },
    { name: 'Netflix', icon: '🎬' },
    { name: 'Tesla', icon: '⚡' },
    { name: 'Spotify', icon: '🎵' }
  ];

  return (
    <div className="min-h-screen bg-[#11181C] text-[#EDEDED] overflow-x-hidden relative">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#34B27B] rounded-full mix-blend-multiply filter blur-[128px] opacity-10 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#3ECF8E] rounded-full mix-blend-multiply filter blur-[128px] opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-[#34B27B] rounded-full mix-blend-multiply filter blur-[128px] opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      {/* Scroll Progress Indicator */}
      <div className="fixed top-0 left-0 h-1 bg-[#27272A] w-full z-[60]">
        <div
          className="h-full bg-gradient-to-r from-[#34B27B] via-[#3ECF8E] to-[#34B27B] transition-all duration-300"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 bg-[rgba(17,24,28,0.7)] backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Logo size={40} />
            <span className="font-bold text-lg hidden sm:block group-hover:text-[#34B27B] transition-colors">
              RoleReady
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-[#A0A0A0] hover:text-[#34B27B] transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-[#A0A0A0] hover:text-[#34B27B] transition-colors">
              Pricing
            </Link>
            <Link href="#testimonials" className="text-[#A0A0A0] hover:text-[#34B27B] transition-colors">
              Success Stories
            </Link>
            <Link href="#faq" className="text-[#A0A0A0] hover:text-[#34B27B] transition-colors">
              FAQ
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className="px-4 py-2 text-white hover:text-[#34B27B] transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="group px-6 py-2.5 bg-gradient-to-r from-[#34B27B] to-[#3ECF8E] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#34B27B]/50 transition-all hover:scale-105 flex items-center gap-2"
            >
              Start Free Trial
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 px-6 border-t border-white/5 bg-[#11181C]"
          >
            <div className="flex flex-col gap-4">
              <Link href="#features" className="text-[#A0A0A0] hover:text-[#34B27B] transition-colors">Features</Link>
              <Link href="#pricing" className="text-[#A0A0A0] hover:text-[#34B27B] transition-colors">Pricing</Link>
              <Link href="#testimonials" className="text-[#A0A0A0] hover:text-[#34B27B] transition-colors">Success Stories</Link>
              <Link href="/login" className="py-2 text-center hover:text-[#34B27B] transition-colors">Sign In</Link>
              <Link href="/signup" className="py-3 bg-gradient-to-r from-[#34B27B] to-[#3ECF8E] text-white rounded-xl text-center font-semibold">
                Start Free Trial
              </Link>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto relative">
        <motion.div
          style={{ opacity, scale }}
          className="text-center"
        >
          {/* Announcement Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 inline-flex items-center gap-2 px-4 py-2 bg-[#34B27B]/10 border border-[#34B27B]/30 rounded-full text-sm"
          >
            <Sparkles size={16} className="text-[#34B27B]" />
            <span>Over 50,000 professionals landed their dream jobs</span>
            <Crown size={16} className="text-[#34B27B]" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
          >
            Land Your Dream Job
            <br />
            <span className="bg-gradient-to-r from-[#34B27B] via-[#3ECF8E] to-[#34B27B] bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
              10x Faster
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-[#A0A0A0] mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            The all-in-one AI-powered platform to build stunning resumes, track applications, ace interviews, and land offers at top companies like Google, Amazon, and Apple.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <Link
              href="/signup"
              className="group px-8 py-4 bg-gradient-to-r from-[#34B27B] to-[#3ECF8E] text-white font-bold text-lg rounded-xl hover:shadow-2xl hover:shadow-[#34B27B]/50 transition-all transform hover:scale-105 inline-flex items-center gap-2"
            >
              <Rocket size={20} />
              Start Free Trial - No Credit Card
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="group px-8 py-4 border-2 border-[#34B27B]/50 text-[#34B27B] font-semibold rounded-xl hover:bg-[#34B27B]/10 transition-all inline-flex items-center gap-2 hover:scale-105">
              <Play size={20} className="fill-current" />
              Watch 2-Min Demo
            </button>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {['👨‍💼', '👩‍💻', '👨‍🎨', '👩‍🔬', '👨‍💻'].map((emoji, i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-[#34B27B] to-[#3ECF8E] flex items-center justify-center border-2 border-[#11181C] text-lg">
                    {emoji}
                  </div>
                ))}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className="fill-[#34B27B] text-[#34B27B]" />
                  ))}
                  <span className="ml-2 font-bold text-white">4.9/5</span>
                </div>
                <p className="text-sm text-[#A0A0A0]">from 10,000+ happy users</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Hero Image / Demo Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 relative"
        >
          <div className="relative rounded-2xl overflow-hidden border border-[#34B27B]/30 shadow-2xl shadow-[#34B27B]/20 bg-gradient-to-br from-[#1A1F26] to-[#11181C]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#34B27B]/5 to-transparent"></div>
            {/* Browser Chrome */}
            <div className="flex items-center gap-2 px-4 py-3 bg-[#1A1F26] border-b border-white/5">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="flex-1 px-4 py-1 bg-[#11181C] rounded text-xs text-[#A0A0A0] text-center">
                roleready.app/dashboard
              </div>
            </div>
            {/* Placeholder for Demo Image */}
            <div className="aspect-video bg-gradient-to-br from-[#1A1F26] via-[#11181C] to-[#1A1F26] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iIzM0QjI3QiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-20"></div>
              <div className="relative z-10 text-center p-8">
                <Sparkles size={64} className="text-[#34B27B] mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">AI-Powered Resume Builder</h3>
                <p className="text-[#A0A0A0]">Build ATS-optimized resumes in minutes</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Company Logos Section */}
      <section className="py-12 bg-[#1A1F26]/50 border-y border-[#27272A]">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-[#A0A0A0] mb-8 text-sm uppercase tracking-wider">
            Our users got hired at
          </p>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-8 items-center justify-items-center">
            {companyLogos.map((company, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex flex-col items-center gap-2 grayscale hover:grayscale-0 transition-all opacity-60 hover:opacity-100"
              >
                <div className="text-3xl">{company.icon}</div>
                <span className="text-xs text-[#A0A0A0]">{company.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-b from-[#11181C] to-[#1A1F26]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: stats.users.toLocaleString() + '+', label: 'Job Seekers Helped', icon: Users },
              { value: stats.success + '%', label: 'Success Rate', icon: TrendingUp },
              { value: '$' + stats.salary + 'K', label: 'Average Salary Increase', icon: Zap },
              { value: stats.companies + '+', label: 'Partner Companies', icon: Briefcase }
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, type: 'spring' }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#34B27B]/20 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                  <div className="relative bg-[#1A1F26] border border-[#27272A] rounded-2xl p-6 hover:border-[#34B27B]/50 transition-all">
                    <Icon size={32} className="text-[#34B27B] mx-auto mb-3" />
                    <div className="text-4xl md:text-5xl font-bold text-[#34B27B] mb-2">
                      {stat.value}
                    </div>
                    <div className="text-[#A0A0A0] text-sm">{stat.label}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#34B27B]/10 border border-[#34B27B]/30 rounded-full text-sm mb-6">
              <Zap size={16} className="text-[#34B27B]" />
              <span>All-In-One Platform</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Everything You Need to
              <br />
              <span className="bg-gradient-to-r from-[#34B27B] to-[#3ECF8E] bg-clip-text text-transparent">
                Dominate Your Job Search
              </span>
            </h2>
            <p className="text-xl text-[#A0A0A0] max-w-2xl mx-auto">
              Stop juggling multiple tools. RoleReady gives you everything in one powerful platform.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative bg-[#1A1F26] border border-[#27272A] rounded-2xl p-8 hover:border-[#34B27B]/50 transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#34B27B]/10"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-all`}></div>
                  <div className="relative">
                    <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon size={28} className="text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 group-hover:text-[#34B27B] transition-colors">{feature.title}</h3>
                    <p className="text-[#A0A0A0] mb-4 leading-relaxed">{feature.desc}</p>
                    <a href="#" className="text-[#34B27B] hover:underline inline-flex items-center gap-1 font-semibold group/link">
                      Learn more
                      <ArrowRight size={16} className="group-hover/link:translate-x-1 transition-transform" />
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#1A1F26] to-[#11181C]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Get Hired in <span className="bg-gradient-to-r from-[#34B27B] to-[#3ECF8E] bg-clip-text text-transparent">3 Simple Steps</span>
            </h2>
            <p className="text-xl text-[#A0A0A0] max-w-2xl mx-auto">
              From resume to job offer in record time
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Build Your Resume',
                desc: 'Use our AI-powered builder to create an ATS-optimized resume in minutes. Choose from premium templates and let AI suggest improvements.',
                icon: FileText
              },
              {
                step: '02',
                title: 'Track Applications',
                desc: 'Manage all your job applications in one place. Track status, set reminders, and never miss a follow-up with our smart job tracker.',
                icon: Target
              },
              {
                step: '03',
                title: 'Land the Offer',
                desc: 'Ace interviews with AI coaching, generate compelling cover letters, and negotiate better offers. Get hired at top companies.',
                icon: Award
              }
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  className="relative"
                >
                  <div className="relative bg-[#1A1F26] border border-[#27272A] rounded-2xl p-8 hover:border-[#34B27B]/50 transition-all">
                    <div className="text-6xl font-bold text-[#34B27B]/20 mb-4">{item.step}</div>
                    <div className="w-14 h-14 bg-gradient-to-br from-[#34B27B] to-[#3ECF8E] rounded-xl flex items-center justify-center mb-4">
                      <Icon size={28} className="text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                    <p className="text-[#A0A0A0] leading-relaxed">{item.desc}</p>
                  </div>
                  {i < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                      <ChevronRight size={32} className="text-[#34B27B]/30" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#34B27B]/10 border border-[#34B27B]/30 rounded-full text-sm mb-6">
              <Star size={16} className="text-[#34B27B] fill-current" />
              <span>Success Stories</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Loved by Thousands of
              <br />
              <span className="bg-gradient-to-r from-[#34B27B] to-[#3ECF8E] bg-clip-text text-transparent">
                Successful Job Seekers
              </span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#1A1F26] border border-[#27272A] rounded-2xl p-8 hover:border-[#34B27B]/50 transition-all hover:scale-[1.02]"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} className="fill-[#34B27B] text-[#34B27B]" />
                  ))}
                </div>
                <p className="text-[#EDEDED] mb-6 leading-relaxed">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#34B27B] to-[#3ECF8E] flex items-center justify-center text-2xl">
                    {testimonial.image}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-[#A0A0A0]">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 bg-gradient-to-b from-[#11181C] to-[#1A1F26]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Simple, Transparent
              <br />
              <span className="bg-gradient-to-r from-[#34B27B] to-[#3ECF8E] bg-clip-text text-transparent">
                Pricing
              </span>
            </h2>
            <p className="text-xl text-[#A0A0A0] max-w-2xl mx-auto">
              Start free, upgrade when you're ready. No hidden fees.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative bg-[#1A1F26] border rounded-2xl p-8 ${
                  plan.popular
                    ? 'border-[#34B27B] shadow-2xl shadow-[#34B27B]/20 scale-105'
                    : 'border-[#27272A]'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-[#34B27B] to-[#3ECF8E] text-white text-sm font-semibold rounded-full">
                    Most Popular
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="text-5xl font-bold mb-2">
                    {plan.price}
                    {plan.period && <span className="text-lg text-[#A0A0A0]">/{plan.period}</span>}
                  </div>
                  <p className="text-[#A0A0A0]">{plan.description}</p>
                </div>
                <div className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <div key={j} className="flex items-start gap-3">
                      <CheckCircle2 size={20} className="text-[#34B27B] flex-shrink-0 mt-0.5" />
                      <span className="text-[#EDEDED]">{feature}</span>
                    </div>
                  ))}
                </div>
                <Link
                  href="/signup"
                  className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-[#34B27B] to-[#3ECF8E] text-white hover:shadow-lg hover:shadow-[#34B27B]/50 hover:scale-105'
                      : 'bg-[#27272A] text-white hover:bg-[#34B27B]/20 hover:border-[#34B27B]'
                  }`}
                >
                  {plan.cta}
                  <ArrowRight size={16} />
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12 text-[#A0A0A0]"
          >
            <p>🔒 30-day money-back guarantee • Cancel anytime • No questions asked</p>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Frequently Asked
              <br />
              <span className="bg-gradient-to-r from-[#34B27B] to-[#3ECF8E] bg-clip-text text-transparent">
                Questions
              </span>
            </h2>
          </motion.div>

          <div className="space-y-4">
            {[
              {
                q: 'Is RoleReady really free to start?',
                a: 'Yes! We offer a generous free plan that includes 1 resume, basic templates, PDF export, and job tracking for up to 10 jobs. No credit card required to sign up.'
              },
              {
                q: 'How does the AI resume builder work?',
                a: 'Our AI analyzes your experience and the job description to suggest optimized content, keywords, and formatting that passes ATS systems and impresses recruiters.'
              },
              {
                q: 'Can I cancel my subscription anytime?',
                a: 'Absolutely! You can cancel anytime from your account settings. We also offer a 30-day money-back guarantee if you're not satisfied.'
              },
              {
                q: 'Do you offer refunds?',
                a: 'Yes, we offer a full refund within 30 days of purchase, no questions asked. Your satisfaction is our priority.'
              },
              {
                q: 'How secure is my data?',
                a: 'We take security seriously. All your data is encrypted, stored securely in the cloud, and never shared with third parties. We're GDPR compliant.'
              }
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-[#1A1F26] border border-[#27272A] rounded-2xl p-6 hover:border-[#34B27B]/50 transition-all"
              >
                <h3 className="text-xl font-semibold mb-3 flex items-start gap-2">
                  <span className="text-[#34B27B]">Q:</span>
                  <span>{faq.q}</span>
                </h3>
                <p className="text-[#A0A0A0] leading-relaxed pl-6">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#1A1F26] to-[#11181C] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iIzM0QjI3QiIgc3Ryb2tlLW9wYWNpdHk9Ii4wNSIvPjwvZz48L3N2Zz4=')] opacity-20"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#34B27B]/10 border border-[#34B27B]/30 rounded-full text-sm mb-8">
              <Rocket size={16} className="text-[#34B27B]" />
              <span>Join 50,000+ successful job seekers</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Ready to Land Your
              <br />
              <span className="bg-gradient-to-r from-[#34B27B] to-[#3ECF8E] bg-clip-text text-transparent">
                Dream Job?
              </span>
            </h2>
            <p className="text-xl text-[#A0A0A0] mb-12 max-w-2xl mx-auto">
              Start building your perfect resume today. Free forever plan available. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/signup"
                className="group px-10 py-5 bg-gradient-to-r from-[#34B27B] to-[#3ECF8E] text-white font-bold text-lg rounded-xl hover:shadow-2xl hover:shadow-[#34B27B]/50 transition-all transform hover:scale-105 inline-flex items-center gap-2"
              >
                <Rocket size={24} />
                Start Free Trial Now
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <p className="text-sm text-[#A0A0A0] mt-6">
              ✓ No credit card required  ✓ 2-minute setup  ✓ Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0D0F12] border-t border-[#27272A] py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-5 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Logo size={32} />
                <span className="font-bold text-xl">RoleReady</span>
              </div>
              <p className="text-[#A0A0A0] text-sm mb-4 max-w-sm">
                The all-in-one AI-powered platform to build resumes, track jobs, and land your dream role at top companies.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 bg-[#1A1F26] rounded-lg flex items-center justify-center hover:bg-[#34B27B]/20 hover:text-[#34B27B] transition-all">
                  <Twitter size={18} />
                </a>
                <a href="#" className="w-10 h-10 bg-[#1A1F26] rounded-lg flex items-center justify-center hover:bg-[#34B27B]/20 hover:text-[#34B27B] transition-all">
                  <Linkedin size={18} />
                </a>
                <a href="#" className="w-10 h-10 bg-[#1A1F26] rounded-lg flex items-center justify-center hover:bg-[#34B27B]/20 hover:text-[#34B27B] transition-all">
                  <Instagram size={18} />
                </a>
                <a href="#" className="w-10 h-10 bg-[#1A1F26] rounded-lg flex items-center justify-center hover:bg-[#34B27B]/20 hover:text-[#34B27B] transition-all">
                  <Github size={18} />
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <div className="space-y-3 text-sm text-[#A0A0A0]">
                <Link href="#features" className="hover:text-[#34B27B] block transition-colors">Features</Link>
                <Link href="#pricing" className="hover:text-[#34B27B] block transition-colors">Pricing</Link>
                <Link href="#" className="hover:text-[#34B27B] block transition-colors">Templates</Link>
                <Link href="#" className="hover:text-[#34B27B] block transition-colors">Integrations</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <div className="space-y-3 text-sm text-[#A0A0A0]">
                <Link href="#" className="hover:text-[#34B27B] block transition-colors">Blog</Link>
                <Link href="#" className="hover:text-[#34B27B] block transition-colors">Documentation</Link>
                <Link href="#" className="hover:text-[#34B27B] block transition-colors">Career Guide</Link>
                <Link href="#" className="hover:text-[#34B27B] block transition-colors">Support</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <div className="space-y-3 text-sm text-[#A0A0A0]">
                <Link href="#" className="hover:text-[#34B27B] block transition-colors">About Us</Link>
                <Link href="#" className="hover:text-[#34B27B] block transition-colors">Careers</Link>
                <Link href="#" className="hover:text-[#34B27B] block transition-colors">Contact</Link>
                <Link href="#" className="hover:text-[#34B27B] block transition-colors">Privacy Policy</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-[#27272A] pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[#A0A0A0]">
            <p>© 2024 RoleReady. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-[#34B27B] transition-colors">Terms</Link>
              <Link href="#" className="hover:text-[#34B27B] transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-[#34B27B] transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}
