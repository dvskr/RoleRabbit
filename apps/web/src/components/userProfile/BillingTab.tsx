'use client';

import React from 'react';
import { CreditCard, Download, Calendar, MapPin, Building, CheckCircle, AlertCircle } from 'lucide-react';
import { BillingInfo } from '../../types/userProfile';

interface BillingTabProps {
  billingInfo: BillingInfo;
  setBillingInfo: (billing: BillingInfo) => void;
  onUpdate: (billing: BillingInfo) => void;
}

export default function BillingTab({ 
  billingInfo, 
  setBillingInfo, 
  onUpdate 
}: BillingTabProps) {
  const handleBillingChange = (field: keyof BillingInfo, value: any) => {
    setBillingInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (field: keyof BillingInfo['billingAddress'], value: string) => {
    setBillingInfo(prev => ({
      ...prev,
      billingAddress: { ...prev.billingAddress, [field]: value }
    }));
  };

  const handleSave = () => {
    onUpdate(billingInfo);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'past_due': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle size={16} />;
      case 'cancelled': return <AlertCircle size={16} />;
      case 'past_due': return <AlertCircle size={16} />;
      default: return <AlertCircle size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <CreditCard size={20} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Current Plan</h3>
            <p className="text-sm text-gray-600">Manage your subscription and billing</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Plan</label>
              <div className="flex items-center space-x-3">
                <span className="text-lg font-semibold text-gray-900 capitalize">{billingInfo.plan}</span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(billingInfo.status)}`}>
                  {getStatusIcon(billingInfo.status)}
                  <span className="ml-1 capitalize">{billingInfo.status.replace('_', ' ')}</span>
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Next Billing Date</label>
              <div className="flex items-center space-x-2">
                <Calendar size={16} className="text-gray-400" />
                <span className="text-gray-900">{new Date(billingInfo.nextBillingDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                  <CreditCard size={16} className="text-gray-600" />
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-900 capitalize">{billingInfo.paymentMethod.brand}</span>
                  <p className="text-xs text-gray-500">**** **** **** {billingInfo.paymentMethod.last4}</p>
                </div>
              </div>
            </div>

            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Update Payment Method
            </button>
          </div>
        </div>

        <div className="mt-6 flex space-x-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Upgrade Plan
          </button>
          <button className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
            Cancel Subscription
          </button>
        </div>
      </div>

      {/* Billing Address */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <MapPin size={20} className="text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Billing Address</h3>
            <p className="text-sm text-gray-600">Update your billing address</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
            <input
              type="text"
              value={billingInfo.billingAddress.street}
              onChange={(e) => handleAddressChange('street', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
            <input
              type="text"
              value={billingInfo.billingAddress.city}
              onChange={(e) => handleAddressChange('city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
            <input
              type="text"
              value={billingInfo.billingAddress.state}
              onChange={(e) => handleAddressChange('state', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
            <input
              type="text"
              value={billingInfo.billingAddress.zipCode}
              onChange={(e) => handleAddressChange('zipCode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
            <select
              value={billingInfo.billingAddress.country}
              onChange={(e) => handleAddressChange('country', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="USA">United States</option>
              <option value="CAN">Canada</option>
              <option value="GBR">United Kingdom</option>
              <option value="DEU">Germany</option>
              <option value="FRA">France</option>
              <option value="AUS">Australia</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save Address
          </button>
        </div>
      </div>

      {/* Invoices */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Download size={20} className="text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Invoices</h3>
            <p className="text-sm text-gray-600">Download your billing history</p>
          </div>
        </div>

        <div className="space-y-3">
          {billingInfo.invoices.map((invoice) => (
            <div key={invoice.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Building size={16} className="text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Invoice #{invoice.id}</p>
                  <p className="text-xs text-gray-500">{new Date(invoice.date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">${invoice.amount.toFixed(2)}</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                    {getStatusIcon(invoice.status)}
                    <span className="ml-1 capitalize">{invoice.status}</span>
                  </span>
                </div>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>

        {billingInfo.invoices.length === 0 && (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Download size={20} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No Invoices Yet</h3>
            <p className="text-gray-600">Your invoices will appear here once you start billing</p>
          </div>
        )}
      </div>

      {/* Billing Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">Billing Information</h3>
        <ul className="space-y-2 text-sm text-blue-700">
          <li className="flex items-start space-x-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>All prices are in USD and include applicable taxes</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>Billing occurs on the same date each month</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>You can cancel your subscription at any time</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>Changes to your plan take effect immediately</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
