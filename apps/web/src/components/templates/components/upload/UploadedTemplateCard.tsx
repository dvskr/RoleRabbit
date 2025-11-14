/**
 * UploadedTemplateCard Component
 * Displays a user's uploaded template with management options
 */

import React, { useState } from 'react';
import {
  MoreVertical,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  Download,
  TrendingUp,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import type { UploadedTemplate } from '../../hooks/useTemplateUpload';

interface UploadedTemplateCardProps {
  template: UploadedTemplate;
  onEdit?: (template: UploadedTemplate) => void;
  onDelete?: (templateId: string) => void;
  onToggleVisibility?: (templateId: string, isPublic: boolean) => void;
  className?: string;
}

export const UploadedTemplateCard: React.FC<UploadedTemplateCardProps> = ({
  template,
  onEdit,
  onDelete,
  onToggleVisibility,
  className = '',
}) => {
  const [showActions, setShowActions] = useState(false);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // Status badge
  const getStatusBadge = () => {
    switch (template.status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            <CheckCircle size={12} />
            Approved
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
            <XCircle size={12} />
            Rejected
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
            <Clock size={12} />
            Pending Review
          </span>
        );
    }
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow ${className}`}>
      {/* Template Image */}
      <div className="relative aspect-[3/4] bg-gray-100">
        <img
          src={template.imageUrl}
          alt={template.name}
          className="w-full h-full object-cover"
        />

        {/* Status Badge Overlay */}
        <div className="absolute top-3 left-3">
          {getStatusBadge()}
        </div>

        {/* Visibility Badge */}
        <div className="absolute top-3 right-3">
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              template.isPublic
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {template.isPublic ? <Eye size={12} /> : <EyeOff size={12} />}
            {template.isPublic ? 'Public' : 'Private'}
          </span>
        </div>

        {/* Actions Menu */}
        <div className="absolute bottom-3 right-3">
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
            >
              <MoreVertical size={18} className="text-gray-600" />
            </button>

            {showActions && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowActions(false)}
                />

                {/* Menu */}
                <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-20">
                  {onToggleVisibility && (
                    <button
                      onClick={() => {
                        onToggleVisibility(template.id, !template.isPublic);
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      {template.isPublic ? (
                        <>
                          <EyeOff size={14} />
                          Make Private
                        </>
                      ) : (
                        <>
                          <Eye size={14} />
                          Make Public
                        </>
                      )}
                    </button>
                  )}

                  {onEdit && (
                    <button
                      onClick={() => {
                        onEdit(template);
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <Edit2 size={14} />
                      Edit Details
                    </button>
                  )}

                  <a
                    href={template.fileUrl}
                    download
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    onClick={() => setShowActions(false)}
                  >
                    <Download size={14} />
                    Download
                  </a>

                  {onDelete && (
                    <>
                      <div className="border-t border-gray-200 my-1" />
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this template?')) {
                            onDelete(template.id);
                          }
                          setShowActions(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Template Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1 truncate">{template.name}</h3>
        {template.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">{template.description}</p>
        )}

        {/* Tags */}
        {template.tags && template.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {template.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs"
              >
                {tag}
              </span>
            ))}
            {template.tags.length > 3 && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">
                +{template.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <Eye size={12} />
            <span>{template.views} views</span>
          </div>
          <div className="flex items-center gap-1">
            <Download size={12} />
            <span>{template.downloads} downloads</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>{formatDate(template.createdAt)}</span>
          </div>
          <div>{formatFileSize(template.fileSize)}</div>
        </div>
      </div>
    </div>
  );
};

export default UploadedTemplateCard;
