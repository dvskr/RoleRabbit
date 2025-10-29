'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, Github, Chrome, Star, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/common/Logo';

export default function MinimalAuthPage() {
  const router = useRouter();
  const { login, signup } = useAuth();
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [activeContent, setActiveContent] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const formRef = useRef<HTMLFormElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveContent((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const validateField = (name: string, value: string): string => {
    if (!value && name !== 'name') return '';
    
    if (name === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value) ? '' : 'Invalid email format';
    }
    
    if (name === 'password' && value) {
      if (value.length < 8) return 'Password must be at least 8 characters';
      if (!/[A-Z]/.test(value)) return 'Password must contain uppercase';
      if (!/[a-z]/.test(value)) return 'Password must contain lowercase';
      if (!/[0-9]/.test(value)) return 'Password must contain number';
      return '';
    }
    
    if (name === 'confirmPassword' && value) {
      return value === formData.password ? '' : 'Passwords do not match';
    }
    
    return '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');
    
    // Real-time validation
    if (touched[name]) {
      const fieldError = validateField(name, value);
      setFieldErrors({ ...fieldErrors, [name]: fieldError });
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    const fieldError = validateField(name, value);
    setFieldErrors({ ...fieldErrors, [name]: fieldError });
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && !e.shiftKey && e.ctrlKey) {
        e.preventDefault();
        setActiveTab(activeTab === 'signin' ? 'signup' : 'signin');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [activeTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (activeTab === 'signin') {
        await login(formData.email, formData.password);
        router.push('/dashboard');
      } else {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setIsLoading(false);
          return;
        }
        if (formData.password.length < 8) {
          setError('Password must be at least 8 characters');
          setIsLoading(false);
          return;
        }
        await signup(formData.name, formData.email, formData.password);
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      setIsLoading(false);
    }
  };

  const testimonials = [
    {
      rating: 5,
      quote: "Landed my dream job at Google in 3 weeks with Role Ready's AI resume builder!",
      name: 'Sarah Chen',
      role: 'Software Engineer'
    },
    {
      rating: 5,
      quote: "From nervous to possibly confident. Got 3 offers in one month thanks to interview prep!",
      name: 'Michael Rodriguez',
      role: 'Product Manager'
    },
    {
      rating: 5,
      quote: "Best investment in my career. Worth every penny!",
      name: 'Emily Taylor',
      role: 'UX Designer'
    }
  ];

  const currentTestimonial = testimonials[activeContent];

  return (
    <div className="h-screen bg-[#0A0E14] flex">
      {/* Left Side - Minimal Content */}
      <div className="hidden lg:flex lg:w-[45%] items-center justify-center relative bg-[#0F1419]">
        <div className="max-w-md px-8 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeContent}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-center gap-1 mb-6">
                {[...Array(currentTestimonial.rating)].map((_, i) => (
                  <Star key={i} size={16} className="fill-[#34B27B] text-[#34B27B]" />
                ))}
              </div>
              <p className="text-xl text-[#EDEDED] mb-6">
                "{currentTestimonial.quote}"
              </p>
              <p className="text-[#34B27B] font-medium">{currentTestimonial.name}</p>
              <p className="text-sm text-[#A0A0A0]">{currentTestimonial.role}</p>
            </motion.div>
          </AnimatePresence>
          
          <div className="flex justify-center gap-1.5 mt-8">
            {[0, 1, 2].map((i) => (
              <button
                key={i}
                onClick={() => setActiveContent(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  activeContent === i ? 'bg-[#34B27B] w-4' : 'bg-[#27272A]'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Minimal Form */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-[400px]">
          {/* Logo */}
          <div className="mb-12">
            <Link href="/">
              <Logo size={32} />
            </Link>
          </div>

          {/* Tab Toggle */}
          <div className="flex gap-1 mb-8 bg-[#1A1F26] rounded-lg p-1">
            <button
              onClick={() => setActiveTab('signin')}
              className={`flex-1 py-2.5 px-4 rounded-md font-medium text-sm transition-all ${
                activeTab === 'signin'
                  ? 'bg-[#34B27B] text-white'
                  : 'text-[#A0A0A0] hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`flex-1 py-2.5 px-4 rounded-md font-medium text-sm transition-all ${
                activeTab === 'signup'
                  ? 'bg-[#34B27B] text-white'
                  : 'text-[#A0A0A0] hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Title - Removed for minimalist design */}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name (Sign Up only) */}
            {activeTab === 'signup' && (
              <div>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    placeholder="Full name"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-full px-4 py-3 bg-[#1A1F26] border border-[#27272A] rounded-lg text-white placeholder-[#6B7280] focus:outline-none focus:border-[#34B27B] transition-colors text-sm"
                    required
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 bg-[#1A1F26] border rounded-lg text-white placeholder-[#6B7280] focus:outline-none transition-colors text-sm ${
                    touched.email 
                      ? fieldErrors.email 
                        ? 'border-red-500/50 focus:border-red-500' 
                        : 'border-[#34B27B]/50 focus:border-[#34B27B]'
                      : 'border-[#27272A] focus:border-[#34B27B]'
                  }`}
                  required
                />
                {touched.email && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {fieldErrors.email ? (
                      <XCircle size={16} className="text-red-400" />
                    ) : (
                      <CheckCircle2 size={16} className="text-[#34B27B]" />
                    )}
                  </div>
                )}
              </div>
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-400">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 pr-12 bg-[#1A1F26] border rounded-lg text-white placeholder-[#6B7280] focus:outline-none transition-colors text-sm ${
                    touched.password 
                      ? fieldErrors.password 
                        ? 'border-red-500/50 focus:border-red-500' 
                        : 'border-[#34B27B]/50 focus:border-[#34B27B]'
                      : 'border-[#27272A] focus:border-[#34B27B]'
                  }`}
                  required
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {touched.password && !fieldErrors.password && (
                    <CheckCircle2 size={16} className="text-[#34B27B]" />
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[#6B7280] hover:text-white"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-red-400">{fieldErrors.password}</p>
              )}
            </div>

            {/* Confirm Password (Sign Up only) */}
            {activeTab === 'signup' && (
              <div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 pr-10 bg-[#1A1F26] border rounded-lg text-white placeholder-[#6B7280] focus:outline-none transition-colors text-sm ${
                      touched.confirmPassword 
                        ? fieldErrors.confirmPassword 
                          ? 'border-red-500/50 focus:border-red-500' 
                          : 'border-[#34B27B]/50 focus:border-[#34B27B]'
                        : 'border-[#27272A] focus:border-[#34B27B]'
                    }`}
                    required
                  />
                  {touched.confirmPassword && !fieldErrors.confirmPassword && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <CheckCircle2 size={16} className="text-[#34B27B]" />
                    </div>
                  )}
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-400">{fieldErrors.confirmPassword}</p>
                )}
              </div>
            )}

            {/* Remember / Forgot (Sign In only) */}
            {activeTab === 'signin' && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-[#374151] bg-[#1A1F26] text-[#34B27B]" />
                  <span className="text-[#A0A0A0]">Remember me</span>
                </label>
                <Link href="#" className="text-[#34B27B] hover:text-[#3ECF8E]">
                  Forgot?
                </Link>
              </div>
            )}

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#34B27B] text-white font-medium rounded-lg hover:bg-[#3ECF8E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              {isLoading ? 'Loading...' : (activeTab === 'signin' ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          {/* Social Login */}
          <div className="mt-6">
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#27272A]"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-[#0A0E14] text-[#6B7280]">Or continue with</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 py-2.5 bg-[#1A1F26] border border-[#27272A] rounded-lg hover:bg-[#27272A] transition-colors">
                <Chrome size={18} className="text-white" />
                <span className="text-sm text-white font-medium">Google</span>
              </button>
              <button className="flex items-center justify-center gap-2 py-2.5 bg-[#1A1F26] border border-[#27272A] rounded-lg hover:bg-[#27272A] transition-colors">
                <Github size={18} className="text-white" />
                <span className="text-sm text-white font-medium">GitHub</span>
              </button>
            </div>
          </div>

          {/* Terms (Sign Up) */}
          {activeTab === 'signup' && (
            <p className="mt-6 text-center text-xs text-[#6B7280]">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="text-[#34B27B] hover:text-[#3ECF8E]">Terms</Link> and{' '}
              <Link href="/privacy" className="text-[#34B27B] hover:text-[#3ECF8E]">Privacy</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

