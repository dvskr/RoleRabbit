'use client';

import React from 'react';
import { HelpCircle, MessageSquare, AlertCircle, Clock, CheckCircle, X, Send, Plus } from 'lucide-react';
import { SupportTicket, FeedbackForm } from '../../types/userProfile';

interface SupportTabProps {
  supportTickets: SupportTicket[];
  setSupportTickets: (tickets: SupportTicket[]) => void;
  feedbackForm: FeedbackForm;
  setFeedbackForm: (feedback: FeedbackForm) => void;
  onSubmitFeedback: (feedback: FeedbackForm) => void;
}

export default function SupportTab({ 
  supportTickets, 
  setSupportTickets, 
  feedbackForm, 
  setFeedbackForm, 
  onSubmitFeedback 
}: SupportTabProps) {
  const handleFeedbackChange = (field: keyof FeedbackForm, value: string) => {
    setFeedbackForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitFeedback = () => {
    if (feedbackForm.subject.trim() && feedbackForm.description.trim()) {
      onSubmitFeedback(feedbackForm);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-blue-600 bg-blue-100';
      case 'in_progress': return 'text-yellow-600 bg-yellow-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'closed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle size={16} />;
      case 'in_progress': return <Clock size={16} />;
      case 'resolved': return <CheckCircle size={16} />;
      case 'closed': return <X size={16} />;
      default: return <AlertCircle size={16} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Support Tickets */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <MessageSquare size={20} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Support Tickets</h3>
              <p className="text-sm text-gray-600">Track your support requests</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <Plus size={16} />
            <span>New Ticket</span>
          </button>
        </div>

        <div className="space-y-3">
          {supportTickets.map((ticket) => (
            <div key={ticket.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-sm font-medium text-gray-900">{ticket.subject}</h4>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                      {getStatusIcon(ticket.status)}
                      <span className="ml-1 capitalize">{ticket.status.replace('_', ' ')}</span>
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{ticket.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Category: {ticket.category}</span>
                    <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                    <span>Updated: {new Date(ticket.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View
                  </button>
                  <button className="text-gray-600 hover:text-gray-700 text-sm font-medium">
                    Reply
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {supportTickets.length === 0 && (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <MessageSquare size={20} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No Support Tickets</h3>
            <p className="text-gray-600">You haven't submitted any support requests yet</p>
          </div>
        )}
      </div>

      {/* Submit Feedback */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <HelpCircle size={20} className="text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Submit Feedback</h3>
            <p className="text-sm text-gray-600">Help us improve by sharing your thoughts</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={feedbackForm.type}
                onChange={(e) => handleFeedbackChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="general">General Feedback</option>
                <option value="bug">Bug Report</option>
                <option value="feature">Feature Request</option>
                <option value="improvement">Improvement Suggestion</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={feedbackForm.priority}
                onChange={(e) => handleFeedbackChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <input
              type="text"
              value={feedbackForm.subject}
              onChange={(e) => handleFeedbackChange('subject', e.target.value)}
              placeholder="Brief description of your feedback"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={feedbackForm.description}
              onChange={(e) => handleFeedbackChange('description', e.target.value)}
              placeholder="Please provide detailed information about your feedback..."
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSubmitFeedback}
              disabled={!feedbackForm.subject.trim() || !feedbackForm.description.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <Send size={16} />
              <span>Submit Feedback</span>
            </button>
          </div>
        </div>
      </div>

      {/* Help Resources */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Help Resources</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <a href="#" className="block p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors">
              <h4 className="text-sm font-medium text-gray-900">Getting Started Guide</h4>
              <p className="text-xs text-gray-600">Learn the basics of using our platform</p>
            </a>
            <a href="#" className="block p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors">
              <h4 className="text-sm font-medium text-gray-900">FAQ</h4>
              <p className="text-xs text-gray-600">Find answers to common questions</p>
            </a>
            <a href="#" className="block p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors">
              <h4 className="text-sm font-medium text-gray-900">Video Tutorials</h4>
              <p className="text-xs text-gray-600">Watch step-by-step guides</p>
            </a>
          </div>
          <div className="space-y-3">
            <a href="#" className="block p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors">
              <h4 className="text-sm font-medium text-gray-900">API Documentation</h4>
              <p className="text-xs text-gray-600">Technical documentation for developers</p>
            </a>
            <a href="#" className="block p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors">
              <h4 className="text-sm font-medium text-gray-900">Community Forum</h4>
              <p className="text-xs text-gray-600">Connect with other users</p>
            </a>
            <a href="#" className="block p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors">
              <h4 className="text-sm font-medium text-gray-900">Contact Support</h4>
              <p className="text-xs text-gray-600">Get help from our support team</p>
            </a>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">Need More Help?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Email Support</h4>
            <p>support@roleready.com</p>
            <p className="text-xs text-blue-600">Response time: 24 hours</p>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Live Chat</h4>
            <p>Available 9 AM - 6 PM EST</p>
            <p className="text-xs text-blue-600">Monday - Friday</p>
          </div>
        </div>
      </div>
    </div>
  );
}
