'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, Github, Chrome, Star, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { RabbitLogo, RabbitLogoOld } from '@/components/ui/RabbitLogo';

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
    <div className="h-screen bg-[#0a0a0a] flex relative overflow-hidden">
      {/* Animated gradient mesh background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-1/2 -left-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/3 -right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, 100, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px]"
        />

        {/* Animated grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(white 1px, transparent 1px),
                             linear-gradient(90deg, white 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-teal-400/30 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            transition={{
              duration: 20 + Math.random() * 20,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Left Side - Enhanced Content */}
      <div className="hidden lg:flex lg:w-[45%] items-center justify-center relative">
        <div className="max-w-md px-8 text-center relative z-10">
          {/* Animated Rabbit Logo - Old Version */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
            className="mb-8 flex justify-center"
          >
            <motion.div
              animate={{
                y: [0, -15, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <RabbitLogoOld size={120} animated={true} />
            </motion.div>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeContent}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex justify-center gap-1 mb-6">
                {[...Array(currentTestimonial.rating)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Star size={18} className="fill-teal-400 text-teal-400" />
                  </motion.div>
                ))}
              </div>
              <p className="text-xl text-white mb-6 leading-relaxed">
                "{currentTestimonial.quote}"
              </p>
              <p className="text-teal-400 font-semibold text-lg">{currentTestimonial.name}</p>
              <p className="text-sm text-gray-400 mt-1">{currentTestimonial.role}</p>
            </motion.div>
          </AnimatePresence>
          
          <div className="flex justify-center gap-1.5 mt-8">
            {[0, 1, 2].map((i) => (
              <button
                key={i}
                onClick={() => setActiveContent(i)}
                className={`h-1.5 rounded-full transition-all ${
                  activeContent === i ? 'bg-teal-400 w-8' : 'bg-white/20 w-1.5'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Enhanced Form */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-8 overflow-y-auto relative z-10">
        <div className="w-full max-w-[400px]">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            className="mb-6 flex justify-center"
          >
            <Link href="/landing" className="flex items-center gap-1 group">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <RabbitLogo size={64} />
              </motion.div>
              <span className="text-4xl font-bold">
                <span className="text-white">Role</span>
                <span className="text-emerald-500">Rabbit</span>
              </span>
            </Link>
          </motion.div>

          {/* Tab Toggle */}
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            className="flex gap-1 mb-6 bg-white/[0.03] border border-white/[0.08] rounded-full p-1 backdrop-blur-sm"
          >
            <button
              onClick={() => setActiveTab('signin')}
              className={`flex-1 py-2.5 px-4 rounded-full font-medium text-sm transition-all ${
                activeTab === 'signin'
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`flex-1 py-2.5 px-4 rounded-full font-medium text-sm transition-all ${
                activeTab === 'signup'
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </motion.div>

          {/* Title - Removed for minimalist design */}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name (Sign Up only) */}
            <AnimatePresence mode="wait">
              {activeTab === 'signup' && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      placeholder="Full name"
                      value={formData.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 bg-black/40 border border-white/[0.08] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/50 transition-colors text-sm backdrop-blur-sm"
                      required
                      autoComplete="name"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              className="relative"
            >
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 bg-black/40 border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors text-sm backdrop-blur-sm ${
                    touched.email 
                      ? fieldErrors.email 
                        ? 'border-red-500/50 focus:border-red-500' 
                        : 'border-teal-500/50 focus:border-teal-500'
                      : 'border-white/[0.08] focus:border-teal-500/50'
                  }`}
                  required
                  autoComplete="email"
                />
                {touched.email && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {fieldErrors.email ? (
                      <XCircle size={16} className="text-red-400" />
                    ) : (
                      <CheckCircle2 size={16} className="text-teal-400" />
                    )}
                  </div>
                )}
              </div>
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-400">{fieldErrors.email}</p>
              )}
            </motion.div>

            {/* Password */}
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              className="relative"
            >
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 pr-12 bg-black/40 border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors text-sm backdrop-blur-sm ${
                    touched.password 
                      ? fieldErrors.password 
                        ? 'border-red-500/50 focus:border-red-500' 
                        : 'border-teal-500/50 focus:border-teal-500'
                      : 'border-white/[0.08] focus:border-teal-500/50'
                  }`}
                  required
                  autoComplete={activeTab === 'signin' ? 'current-password' : 'new-password'}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {touched.password && !fieldErrors.password && (
                    <CheckCircle2 size={16} className="text-teal-400" />
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-500 hover:text-white transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-red-400">{fieldErrors.password}</p>
              )}
            </motion.div>

            {/* Confirm Password (Sign Up only) */}
            <AnimatePresence mode="wait">
              {activeTab === 'signup' && (
                <motion.div
                  key="confirm-password-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      placeholder="Confirm password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full px-4 py-3 pr-10 bg-black/40 border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors text-sm backdrop-blur-sm ${
                        touched.confirmPassword 
                          ? fieldErrors.confirmPassword 
                            ? 'border-red-500/50 focus:border-red-500' 
                            : 'border-teal-500/50 focus:border-teal-500'
                          : 'border-white/[0.08] focus:border-teal-500/50'
                      }`}
                      required
                      autoComplete="new-password"
                    />
                    {touched.confirmPassword && !fieldErrors.confirmPassword && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <CheckCircle2 size={16} className="text-teal-400" />
                      </div>
                    )}
                  </div>
                  {fieldErrors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-400">{fieldErrors.confirmPassword}</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Remember / Forgot (Sign In only) */}
            <AnimatePresence mode="wait">
              {activeTab === 'signin' && (
                <motion.div
                  key="remember-forgot"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-between text-sm overflow-hidden"
                >
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-white/20 bg-black/40 text-teal-500 focus:ring-teal-500" 
                      autoComplete="off"
                    />
                    <span className="text-gray-400">Remember me</span>
                  </label>
                  <Link href="#" className="text-teal-400 hover:text-teal-300 transition-colors">
                    Forgot?
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>

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
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              className="w-full py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium rounded-lg hover:from-teal-600 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm shadow-lg shadow-teal-500/25"
            >
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              {isLoading ? 'Loading...' : (activeTab === 'signin' ? 'Sign In' : 'Create Account')}
            </motion.button>
          </form>

          {/* Social Login */}
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            className="mt-6"
          >
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/[0.08]"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-[#0a0a0a] text-gray-500">Or continue with</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 py-2.5 bg-black/40 border border-white/[0.08] rounded-lg hover:bg-black/60 transition-colors backdrop-blur-sm"
              >
                <Chrome size={18} className="text-white" />
                <span className="text-sm text-white font-medium">Google</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 py-2.5 bg-black/40 border border-white/[0.08] rounded-lg hover:bg-black/60 transition-colors backdrop-blur-sm"
              >
                <Github size={18} className="text-white" />
                <span className="text-sm text-white font-medium">GitHub</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Terms (Sign Up) */}
          {activeTab === 'signup' && (
            <motion.p
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              className="mt-6 text-center text-xs text-gray-500"
            >
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="text-teal-400 hover:text-teal-300 transition-colors">Terms</Link> and{' '}
              <Link href="/privacy" className="text-teal-400 hover:text-teal-300 transition-colors">Privacy</Link>
            </motion.p>
          )}
        </div>
      </div>
    </div>
  );
}

