/**
 * ReviewInterface Component - Admin review interface for templates
 */

import React, { useState } from 'react';
import { Star, ThumbsUp, ThumbsDown, Send } from 'lucide-react';
import { useTemplateApproval, type TemplateApproval } from '../../hooks/useTemplateApproval';

interface ReviewInterfaceProps {
  approval: TemplateApproval;
  onReviewComplete?: () => void;
}

export const ReviewInterface: React.FC<ReviewInterfaceProps> = ({
  approval,
  onReviewComplete,
}) => {
  const [quality, setQuality] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [rejection, setRejection] = useState('');
  const { loading, reviewTemplate } = useTemplateApproval();

  const handleReview = async (status: 'APPROVED' | 'REJECTED') => {
    const result = await reviewTemplate(approval.id, {
      status,
      qualityScore: status === 'APPROVED' ? quality : undefined,
      feedback: status === 'APPROVED' ? feedback : undefined,
      rejectionReason: status === 'REJECTED' ? rejection : undefined,
    });

    if (result.success) {
      onReviewComplete?.();
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
      {/* Template Info */}
      <div className="flex gap-4">
        <img
          src={approval.template?.imageUrl}
          alt={approval.template?.name}
          className="w-32 h-40 object-cover rounded-lg"
        />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{approval.template?.name}</h3>
          <p className="text-sm text-gray-600 mt-1">{approval.template?.description}</p>
          <p className="text-xs text-gray-500 mt-2">
            Submitted by {approval.submitter?.name} on{' '}
            {new Date(approval.submittedAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Quality Score */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quality Score (Optional)
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setQuality(star)}
              className="transition-colors"
            >
              <Star
                size={32}
                className={star <= quality ? 'text-yellow-400 fill-current' : 'text-gray-300'}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Feedback */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Approval Feedback (Optional)
        </label>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={4}
          placeholder="Provide positive feedback..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* Rejection Reason */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rejection Reason (If rejecting)
        </label>
        <textarea
          value={rejection}
          onChange={(e) => setRejection(e.target.value)}
          rows={4}
          placeholder="Explain why this template is being rejected..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => handleReview('APPROVED')}
          disabled={loading}
          className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <ThumbsUp size={18} />
          Approve
        </button>
        <button
          onClick={() => handleReview('REJECTED')}
          disabled={loading || !rejection.trim()}
          className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <ThumbsDown size={18} />
          Reject
        </button>
      </div>
    </div>
  );
};

export default ReviewInterface;
