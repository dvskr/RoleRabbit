'use client';

import React from 'react';
import { CreditCard, CheckCircle } from 'lucide-react';

export default function BillingTab() {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">
          Billing & Subscription
        </h2>
        <p className="text-gray-600">Manage your subscription and billing information</p>
      </div>
      
      <div className="space-y-8">
        {/* Current Plan */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Current Plan</h3>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200/50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-lg font-bold text-blue-900">Professional Plan</h4>
                <p className="text-blue-700">$29/month • Billed monthly</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-900">$29</p>
                <p className="text-sm text-blue-600">per month</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600" />
                <span>Unlimited job applications</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600" />
                <span>Advanced analytics</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600" />
                <span>Priority support</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600" />
                <span>Resume templates</span>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Upgrade Plan
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Cancel Subscription
              </button>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Payment Method</h3>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CreditCard size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Visa ending in 4242</p>
                <p className="text-sm text-gray-600">Expires 12/25</p>
              </div>
            </div>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Update
            </button>
          </div>
        </div>

        {/* Billing History */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Billing History</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-semibold text-gray-900">Professional Plan</p>
                <p className="text-sm text-gray-600">December 2024</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">$29.00</p>
                <button className="text-sm text-blue-600 hover:text-blue-800">Download</button>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-semibold text-gray-900">Professional Plan</p>
                <p className="text-sm text-gray-600">November 2024</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">$29.00</p>
                <button className="text-sm text-blue-600 hover:text-blue-800">Download</button>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Statistics */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Usage This Month</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <p className="text-2xl font-bold text-blue-900">23</p>
              <p className="text-sm text-blue-600">Applications Sent</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <p className="text-2xl font-bold text-green-900">8</p>
              <p className="text-sm text-green-600">Interviews</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <p className="text-2xl font-bold text-purple-900">2</p>
              <p className="text-sm text-purple-600">Offers</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
