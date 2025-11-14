/**
 * SubmitForApprovalButton Component
 */

import React, { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';
import { useTemplateApproval } from '../../hooks/useTemplateApproval';

interface SubmitForApprovalButtonProps {
  templateId: string;
  onSuccess?: () => void;
  className?: string;
}

export const SubmitForApprovalButton: React.FC<SubmitForApprovalButtonProps> = ({
  templateId,
  onSuccess,
  className = '',
}) => {
  const [success, setSuccess] = useState(false);
  const { loading, submitForApproval } = useTemplateApproval();

  const handleSubmit = async () => {
    const result = await submitForApproval(templateId);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        setSuccess(false);
      }, 2000);
    }
  };

  return (
    <button
      onClick={handleSubmit}
      disabled={loading || success}
      className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center gap-2 ${className}`}
    >
      {success ? (
        <>
          <CheckCircle size={18} />
          Submitted!
        </>
      ) : (
        <>
          <Send size={18} />
          {loading ? 'Submitting...' : 'Submit for Approval'}
        </>
      )}
    </button>
  );
};

export default SubmitForApprovalButton;
