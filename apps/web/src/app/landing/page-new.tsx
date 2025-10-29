'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Menu, X, Check, ArrowRight, Play, Star, TrendingUp, Zap, Briefcase, Cloud, Globe, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { Logo } from '@/components/common/Logo';

export default function NewLandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Stats animation
  const [stats, setStats] = useState({
    users: 0,
    success: 0,
    salary: 0,
    support: 24
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
        users: Math.floor(progress * 10000),
        success: Math.floor(progress * 98),
        salary: Math.floor(progress * 150),
        support: 24
      });
      
      if (step >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#11181C] text-[#EDEDED] overflow-x-hidden">
      {/* Scroll Progress Indicator */}
      <div className="fixed top-0 left-0 h-1 bg-[#27272A] w-full z-[60]">
        <div 
          className="h-full bg-gradient-to-r from-[#34B27B] to-[#3ECF8E] transition-all duration-300"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 bg-[rgba(17,24,28,0.8)] backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <Logo size={40} />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-[#A0A0A0] hover:text-white transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-[#A0A0A0] hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="#docs" className="text-[#A0A0A0] hover:text-white transition-colors">
              Docs
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
              className="px-6 py-2 bg-gradient-to-r from-[#34B27B] to-[#3ECF8E] text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-[#34B27B]/30 transition-all"
            >
              Start Free Trial
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 px-6 border-t border-white/10">
            <div className="flex flex-col gap-4">
              <Link href="#features" className="text-[#A0A0A0]">Features</Link>
              <Link href="#pricing" className="text-[#A0A0A0]">Pricing</Link>
              <Link href="#docs" className="text-[#A0A0A0]">Docs</Link>
              <Link href="/login" className="py-2 text-center">Sign In</Link>
              <Link href="/signup" className="py-2 bg-[#34B27B] text-white rounded-lg text-center">
                Start Free Trial
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to harness-r from-white via-[#34B27B] to-white bg-clip-text text-transparent leading-tight">
            Your Career
            <br />
            <span className="bg-gradient-to-r from-[#34B27B] to-[#3ECF8E] bg-clip-text text-transparent">
              Starts Here
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-[#A0A0A0] mb-12 max-w-2xl mx-auto">
            One platform to build resumes, track jobs, prepare for interviews, and land your dream role.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link
              href="/signup"
              className="px-8 py-4 bg-gradient-to-r from-[#34B27B] to-[#3ECF8E] text-white font-bold rounded-xl hover:shadow-2xl hover:shadow-[#34B27B]/40 transition-all transform hover:-translate-y-1 inline-flex items-center gap-2"
            >
              Start Free Trial
              <ArrowRight size={20} />
            </Link>
            <button className="px-8 py-4 border border-[#34B27B]/50 text-[#34B27B] font-semibold rounded-xl hover:bg-[#34B27B]/10 transition-all inline-flex items-center gap-2">
              <Play size={20} fill="currentColor" />
              Watch Demo
            </button>
          </div>

          {/* Social Proof */}
          <div className="text-sm text-[#A0A0A0] space-y-2">
            <p>Trusted by 10,000+ job seekers • 250+ hired this month</p>
            <div className="flex justify-center items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} className="fill-[#34B27B] text-[#34B27B]" />
              ))}
              <span className="ml-2 font-semibold">4.9/5</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-[#1A1F26] border-y border-[#27272A]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-6xl font-bold text-[#34B27B] mb-2">
                {stats.users.toLocaleString()}+
              </div>
              <div className="text-[#A0A0A0]">Active Users</div>
            </div>
            <div>
              <div className="text-4xl md:text-6xl font-bold text-[#34B27B] mb-2">
                {stats.success}%
              </div>
              <div className="text-[#A0A0A0]">Success Rate</div>
            </div>
            <div>
              <div className="text-4xl md:text-6xl font-bold text-[#34B27B] mb-2">
                ${stats.salary}K
              </div>
              <div className="text-[#A0A0A0]">Avg Salary</div>
            </div>
            <div>
              <div className="text-4xl md:text-6xl font-bold text-[#34B27B] mb-2">
                24/7
              </div>
              <div className="text-[#A0A0A0]">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything you need to land your dream role
            </h2>
            <p className="text-xl text-[#A0A0A0]">
              One platform. Zero friction. Unlimited possibilities.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Sparkles, title: 'Smart Resume Builder', desc: 'Create professional resumes tailored to each job' },
              { icon: Briefcase, title: 'Smart Job Tracking', desc: 'Track applications and manage your pipeline' },
              { icon: Cloud, title: 'Secure Document Storage', desc: 'Safe cloud storage for all your files' },
              { icon: Globe, title: 'Portfolio Website Generator', desc: 'Build your personal portfolio in minutes' },
              { icon: Mail, title: 'Email Campaign Manager', desc: 'Automate follow-ups and track responses' },
              { icon: TrendingUp, title: 'Interview Preparation', desc: 'Practice with AI-powered mock interviews' }
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-[#1A1F26] border border-[#27272A] rounded-2xl p-8 hover:border-[#34B27B]/50 hover:shadow-2xl hover:shadow-[#34B27B]/10 transition-all"
                >
                  <div className="w-12 h-12 bg-[#34B27B]/10 rounded-xl flex items-center justify-center mb-4">
                    <Icon size={24} className="text-[#34B27B]" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-[#A0A0A0] mb-4">{feature.desc}</p>
                  <a href="#" className="text-[#34B27B] hover:underline inline-flex items-center gap-1">
                    Learn more <ArrowRight size={16} />
                  </a>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#11181C] to-[#1A1F26]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to transform your job search?
          </h2>
          <p className="text-xl text-[#A0A0A0] mb-8">
            Start free today. No credit card required.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#34B27B] to-[#3ECF8E] text-white font-bold rounded-xl hover:shadow-2xl hover:shadow-[#34B27B]/40 transition-all"
          >
            Start Free Trial
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0D0F12] border-t border-[#27272A] py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={24} className="text-[#34B27B]" />
                <span className="font-bold text-lg">Role Ready</span>
              </div>
              <p className="text-[#A0A0A0] text-sm">
                Build your career with AI-powered tools.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Product</h4>
              <div className="space-y-2 text-sm text-[#A0A0A0]">
                <Link href="#" className="hover:text-[#34B27B] block">Features</Link>
                <Link href="#" className="hover:text-[#34B27B] block">Pricing</Link>
                <Link href="#" className="hover:text-[#34B27B] block">Integrations</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Resources</h4>
              <div className="space-y-2 text-sm text-[#A0A0A0]">
                <Link href="#" className="hover:text-[#34B27B] block">Blog</Link>
                <Link href="#" className="hover:text-[#34B27B] block">Docs</Link>
                <Link href="#" className="hover:text-[#34B27B] block">Templates</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <div className="space-y-2 text-sm text-[#A0A0A0]">
                <Link href="#" className="hover:text-[#34B27B] block">About</Link>
                <Link href="#" className="hover:text-[#34B27B] block">Careers</Link>
                <Link href="#" className="hover:text-[#34B27B] block">Contact</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-[#27272A] pt-8 text-center text-sm text-[#A0A0A0]">
            © 2024 Role Ready. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

