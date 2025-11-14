/**
 * ApprovalStatusBadge Component
 * Displays approval status with appropriate styling
 */

import React from 'react';
import { CheckCircle, XCircle, Clock, FileEdit } from 'lucide-react';
import type { ApprovalStatus } from '../../hooks/useTemplateApproval';

interface ApprovalStatusBadgeProps {
  status: ApprovalStatus;
  className?: string;
}

export const ApprovalStatusBadge: React.FC<ApprovalStatusBadgeProps> = ({
  status,
  className = '',
}) => {
  const configs = {
    DRAFT: {
      icon: FileEdit,
      label: 'Draft',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-700',
      borderColor: 'border-gray-300',
    },
    PENDING: {
      icon: Clock,
      label: 'Pending Review',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      borderColor: 'border-yellow-300',
    },
    APPROVED: {
      icon: CheckCircle,
      label: 'Approved',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      borderColor: 'border-green-300',
    },
    REJECTED: {
      icon: XCircle,
      label: 'Rejected',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      borderColor: 'border-red-300',
    },
  };

  const config = configs[status];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.bgColor} ${config.textColor} ${config.borderColor} ${className}`}
    >
      <Icon size={14} />
      {config.label}
    </span>
  );
};

export default ApprovalStatusBadge;
