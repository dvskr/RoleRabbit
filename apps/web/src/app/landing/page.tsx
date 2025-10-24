'use client';

import { useState } from 'react';
import { ArrowRight, Sparkles, Zap, Shield, Users, Star, Heart } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';

export default function LandingPage() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const { login, signup, isAuthenticated } = useAuth();
  
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                RoleReady
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-all"
              >
                Sign In
              </button>
              <Link
                href="/test-all-components"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all"
              >
                Try Free & Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Build Your Perfect Resume
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                In Minutes
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Create professional resumes with AI assistance, track job applications, and land your dream job faster than ever before.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/test-all-components"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
              >
                Try Free & Get Started
                <ArrowRight size={20} />
              </Link>
              <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold hover:border-gray-400 transition-all">
                Watch Demo
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              ✨ No signup required • Free forever • AI-powered
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600">
              Powerful features designed to help you create the perfect resume and land your dream job.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
                <Sparkles size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered Writing</h3>
              <p className="text-gray-600">
                Generate professional bullet points and optimize your resume content with advanced AI assistance.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-4">
                <Zap size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Lightning Fast</h3>
              <p className="text-gray-600">
                Build a professional resume in minutes, not hours. Our intuitive interface makes it effortless.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mb-4">
                <Shield size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">ATS Optimized</h3>
              <p className="text-gray-600">
                Ensure your resume passes Applicant Tracking Systems with our built-in optimization tools.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200">
              <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center mb-4">
                <Users size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Job Tracking</h3>
              <p className="text-gray-600">
                Keep track of all your job applications, interviews, and follow-ups in one organized place.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-pink-50 to-pink-100 border border-pink-200">
              <div className="w-12 h-12 bg-pink-600 rounded-xl flex items-center justify-center mb-4">
                <Star size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Multiple Templates</h3>
              <p className="text-gray-600">
                Choose from professionally designed templates that match your industry and personal style.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200">
              <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-4">
                <Heart size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Always Free</h3>
              <p className="text-gray-600">
                Core features are free forever. Create unlimited resumes and track unlimited applications.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Build Your Perfect Resume?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of professionals who have already landed their dream jobs with RoleReady.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/test-all-components"
              className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              Try Free & Get Started
              <ArrowRight size={20} />
            </Link>
            <button
              onClick={() => setIsSignupModalOpen(true)}
              className="border-2 border-white text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all"
            >
              Create Account
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
                RoleReady
              </h3>
              <p className="text-gray-400">
                The ultimate resume builder for modern professionals.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/test-all-components" className="hover:text-white transition-colors">Resume Builder</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Job Tracker</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Templates</a></li>
                <li><a href="#" className="hover:text-white transition-colors">AI Assistant</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 RoleReady. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md mx-4 relative">
            <button 
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Welcome Back
              </h3>
              <p className="text-gray-600 text-sm">
                Sign in to continue
              </p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Email Address</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50/50 hover:bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50/50 hover:bg-white"
                />
              </div>
              <button 
                onClick={() => login(loginForm.email, loginForm.password)}
                className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
              >
                Sign In
              </button>
              <p className="text-center text-gray-600 text-sm">
                Don't have an account?{' '}
                <button 
                  onClick={() => {
                    setIsLoginModalOpen(false);
                    setIsSignupModalOpen(true);
                  }}
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Create one
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Signup Modal */}
      {isSignupModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md mx-4 relative">
            <button 
              onClick={() => setIsSignupModalOpen(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Join RoleReady
              </h3>
              <p className="text-gray-600 text-sm">
                Create your account to get started
              </p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={signupForm.name}
                  onChange={(e) => setSignupForm({...signupForm, name: e.target.value})}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50/50 hover:bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Email Address</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={signupForm.email}
                  onChange={(e) => setSignupForm({...signupForm, email: e.target.value})}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50/50 hover:bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Password</label>
                <input
                  type="password"
                  placeholder="Create a password"
                  value={signupForm.password}
                  onChange={(e) => setSignupForm({...signupForm, password: e.target.value})}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50/50 hover:bg-white"
                />
              </div>
              <button 
                onClick={() => signup(signupForm.name, signupForm.email, signupForm.password)}
                className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
              >
                Create Account
              </button>
              <p className="text-center text-gray-600 text-sm">
                Already have an account?{' '}
                <button 
                  onClick={() => {
                    setIsSignupModalOpen(false);
                    setIsLoginModalOpen(true);
                  }}
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}