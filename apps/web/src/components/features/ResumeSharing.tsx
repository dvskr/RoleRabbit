'use client';

import React, { useState } from 'react';
import { Share2, Users, Link, Mail, QrCode, Calendar, Eye, MessageCircle, Check, Copy, X, Clock, Globe } from 'lucide-react';
import { logger } from '../../utils/logger';

interface ResumeSharingProps {
  resumeId: string;
  resumeName: string;
  isOpen: boolean;
  onClose: () => void;
}

interface ShareLink {
  id: string;
  url: string;
  expiresAt: string;
  accessCount: number;
  isActive: boolean;
  allowComments: boolean;
  allowDownloads: boolean;
}

interface Feedback {
  id: string;
  reviewerName: string;
  reviewerEmail: string;
  comment: string;
  rating: number;
  timestamp: string;
  isApproved: boolean;
}

export default function ResumeSharing({ resumeId, resumeName, isOpen, onClose }: ResumeSharingProps) {
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([
    {
      id: 'link_1',
      url: 'https://roleready.com/share/resume123',
      expiresAt: '2024-12-31T23:59:59Z',
      accessCount: 15,
      isActive: true,
      allowComments: true,
      allowDownloads: true
    }
  ]);
  
  const [feedback, setFeedback] = useState<Feedback[]>([
    {
      id: 'fb_1',
      reviewerName: 'Sarah Johnson',
      reviewerEmail: 'sarah.j@example.com',
      comment: 'Great resume! The experience section is well-detailed. Consider adding more metrics.',
      rating: 4,
      timestamp: '2024-10-20T14:30:00Z',
      isApproved: true
    }
  ]);

  const [showCreateLinkModal, setShowCreateLinkModal] = useState(false);
  const [newLinkSettings, setNewLinkSettings] = useState({
    expiresIn: 30,
    allowComments: true,
    allowDownloads: true,
    password: ''
  });

  const handleCreateShareLink = () => {
    const newLink: ShareLink = {
      id: `link_${Date.now()}`,
      url: `https://roleready.com/share/${resumeId}?token=${Math.random().toString(36).substring(7)}`,
      expiresAt: new Date(Date.now() + newLinkSettings.expiresIn * 24 * 60 * 60 * 1000).toISOString(),
      accessCount: 0,
      isActive: true,
      allowComments: newLinkSettings.allowComments,
      allowDownloads: newLinkSettings.allowDownloads
    };

    setShareLinks([...shareLinks, newLink]);
    setShowCreateLinkModal(false);
    setNewLinkSettings({
      expiresIn: 30,
      allowComments: true,
      allowDownloads: true,
      password: ''
    });
    logger.debug('Share link created:', newLink);
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    logger.debug('Link copied to clipboard');
  };

  const handleDeleteLink = (linkId: string) => {
    if (confirm('Are you sure you want to delete this share link?')) {
      setShareLinks(shareLinks.filter(link => link.id !== linkId));
    }
  };

  const handleApproveFeedback = (feedbackId: string) => {
    setFeedback(feedback.map(fb => 
      fb.id === feedbackId ? { ...fb, isApproved: true } : fb
    ));
  };

  const handleDeleteFeedback = (feedbackId: string) => {
    if (confirm('Are you sure you want to delete this feedback?')) {
      setFeedback(feedback.filter(fb => fb.id !== feedbackId));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Share2 size={24} className="text-purple-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Share & Get Feedback</h3>
              <p className="text-sm text-gray-600">{resumeName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button className="px-4 py-2 border-b-2 border-purple-600 text-purple-600 font-medium text-sm">
            Share Links
          </button>
          <button className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium text-sm">
            Feedback ({feedback.length})
          </button>
        </div>

        {/* Share Links Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Active Share Links</h4>
            <button
              onClick={() => setShowCreateLinkModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm flex items-center gap-2"
            >
              <Link size={16} />
              Create Share Link
            </button>
          </div>

          {shareLinks.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <Link size={48} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500 mb-2">No share links yet</p>
              <p className="text-sm text-gray-400">Create a link to share your resume and get feedback</p>
            </div>
          ) : (
            <div className="space-y-3">
              {shareLinks.map(link => (
                <div key={link.id} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Globe size={18} className="text-purple-600" />
                      <span className="text-sm font-medium text-gray-900">Shared Link</span>
                      {link.isActive && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyLink(link.url)}
                        className="p-1.5 hover:bg-gray-100 rounded text-gray-600"
                        title="Copy link"
                      >
                        <Copy size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteLink(link.id)}
                        className="p-1.5 hover:bg-red-50 rounded text-red-600"
                        title="Delete link"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded p-2 mb-3 flex items-center gap-2">
                    <span className="text-sm text-gray-700 font-mono flex-1 truncate">{link.url}</span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Eye size={14} />
                      <span>{link.accessCount} views</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>Expires: {new Date(link.expiresAt).toLocaleDateString()}</span>
                    </div>
                    {link.allowComments && (
                      <div className="flex items-center gap-1 text-purple-600">
                        <MessageCircle size={14} />
                        <span>Comments enabled</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Feedback Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Feedback Received</h4>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Average Rating: 4.5/5</span>
            </div>
          </div>

          {feedback.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <MessageCircle size={48} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500 mb-2">No feedback yet</p>
              <p className="text-sm text-gray-400">Share your resume to get feedback from reviewers</p>
            </div>
          ) : (
            <div className="space-y-3">
              {feedback.map(fb => (
                <div key={fb.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h5 className="font-semibold text-gray-900">{fb.reviewerName}</h5>
                      <p className="text-sm text-gray-500">{fb.reviewerEmail}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(fb.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-lg ${i < fb.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        >
                          ★
                        </span>
                      ))}
                      {!fb.isApproved && (
                        <button
                          onClick={() => handleApproveFeedback(fb.id)}
                          className="p-1.5 hover:bg-green-50 rounded text-green-600"
                          title="Approve"
                        >
                          <Check size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteFeedback(fb.id)}
                        className="p-1.5 hover:bg-red-50 rounded text-red-600"
                        title="Delete"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded p-3">{fb.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
        >
          Close
        </button>
      </div>

      {/* Create Share Link Modal */}
      {showCreateLinkModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Create Share Link</h4>
              <button
                onClick={() => setShowCreateLinkModal(false)}
                className="p-1.5 hover:bg-gray-100 rounded"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expires In (Days)
                </label>
                <input
                  type="number"
                  value={newLinkSettings.expiresIn}
                  onChange={(e) => setNewLinkSettings({ ...newLinkSettings, expiresIn: parseInt(e.target.value) || 30 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newLinkSettings.allowComments}
                    onChange={(e) => setNewLinkSettings({ ...newLinkSettings, allowComments: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Allow Comments</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newLinkSettings.allowDownloads}
                    onChange={(e) => setNewLinkSettings({ ...newLinkSettings, allowDownloads: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Allow Downloads</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateLinkModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateShareLink}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
              >
                Create Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
