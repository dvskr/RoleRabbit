/**
 * CommentThread Component
 * Displays a comment and its nested replies with collapse/expand functionality
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { CommentItem } from './CommentItem';
import type { Comment } from '../../hooks/useTemplateComments';

interface CommentThreadProps {
  comment: Comment;
  currentUserId?: string;
  isAdmin?: boolean;
  depth?: number;
  maxDepth?: number;
  onReply?: (commentId: string, content: string, mentions: string[]) => Promise<void>;
  onEdit?: (commentId: string, content: string) => Promise<void>;
  onDelete?: (commentId: string) => Promise<void>;
  onLike?: (commentId: string) => Promise<void>;
  onReport?: (commentId: string, reason: string) => Promise<void>;
  onModerate?: (commentId: string, action: 'APPROVE' | 'HIDE' | 'DELETE') => Promise<void>;
  className?: string;
}

export const CommentThread: React.FC<CommentThreadProps> = ({
  comment,
  currentUserId,
  isAdmin = false,
  depth = 0,
  maxDepth = 5,
  onReply,
  onEdit,
  onDelete,
  onLike,
  onReport,
  onModerate,
  className = '',
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showAllReplies, setShowAllReplies] = useState(false);

  const hasReplies = comment.replies && comment.replies.length > 0;
  const replyCount = comment.replyCount || 0;
  const visibleReplies = comment.replies || [];

  // Limit initial visible replies
  const initialReplyLimit = 3;
  const displayedReplies = showAllReplies
    ? visibleReplies
    : visibleReplies.slice(0, initialReplyLimit);
  const hiddenReplyCount = visibleReplies.length - initialReplyLimit;

  // Calculate indentation based on depth
  const indentClass = depth > 0 ? 'ml-8' : '';

  // Show connection line for nested comments
  const showConnectionLine = depth > 0;

  // Determine if we should stop nesting and show a "View more" link
  const shouldFlattenDeeper = depth >= maxDepth;

  return (
    <div className={`${className}`}>
      {/* Parent Comment */}
      <div className={`relative ${indentClass}`}>
        {/* Connection Line */}
        {showConnectionLine && (
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200 -ml-4" />
        )}

        <div className="relative">
          {/* Collapse/Expand Button */}
          {hasReplies && depth > 0 && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="absolute -left-8 top-4 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
              title={isCollapsed ? 'Expand thread' : 'Collapse thread'}
            >
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
            </button>
          )}

          {/* Comment Content */}
          <CommentItem
            comment={comment}
            currentUserId={currentUserId}
            isAdmin={isAdmin}
            onReply={onReply}
            onEdit={onEdit}
            onDelete={onDelete}
            onLike={onLike}
            onReport={onReport}
            onModerate={onModerate}
          />
        </div>
      </div>

      {/* Replies */}
      {hasReplies && !isCollapsed && (
        <div className="mt-2">
          {/* Collapsed state info */}
          {depth === 0 && visibleReplies.length > 0 && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="ml-4 mb-2 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <ChevronDown size={14} />
              {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
            </button>
          )}

          {/* Render nested replies */}
          {!shouldFlattenDeeper ? (
            <>
              {displayedReplies.map((reply) => (
                <CommentThread
                  key={reply.id}
                  comment={reply}
                  currentUserId={currentUserId}
                  isAdmin={isAdmin}
                  depth={depth + 1}
                  maxDepth={maxDepth}
                  onReply={onReply}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onLike={onLike}
                  onReport={onReport}
                  onModerate={onModerate}
                />
              ))}

              {/* Load More Replies Button */}
              {!showAllReplies && hiddenReplyCount > 0 && (
                <button
                  onClick={() => setShowAllReplies(true)}
                  className={`${indentClass} ml-12 mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1`}
                >
                  <ChevronDown size={14} />
                  Show {hiddenReplyCount} more {hiddenReplyCount === 1 ? 'reply' : 'replies'}
                </button>
              )}

              {/* Show Less Button */}
              {showAllReplies && hiddenReplyCount > 0 && (
                <button
                  onClick={() => setShowAllReplies(false)}
                  className={`${indentClass} ml-12 mt-2 text-sm text-gray-600 hover:text-gray-700 font-medium flex items-center gap-1`}
                >
                  <ChevronRight size={14} />
                  Show less
                </button>
              )}
            </>
          ) : (
            // Max depth reached - show flattened view
            <div className={`${indentClass} ml-8`}>
              <div className="border-l-2 border-gray-200 pl-4">
                {displayedReplies.map((reply) => (
                  <div key={reply.id} className="mb-2">
                    <CommentItem
                      comment={reply}
                      currentUserId={currentUserId}
                      isAdmin={isAdmin}
                      onReply={onReply}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onLike={onLike}
                      onReport={onReport}
                      onModerate={onModerate}
                    />
                  </div>
                ))}

                {/* Continue thread link */}
                {!showAllReplies && hiddenReplyCount > 0 && (
                  <button
                    onClick={() => setShowAllReplies(true)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Continue thread ({hiddenReplyCount} more)
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Collapsed state */}
      {isCollapsed && hasReplies && (
        <button
          onClick={() => setIsCollapsed(false)}
          className={`${indentClass} ml-4 mt-2 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1`}
        >
          <ChevronRight size={14} />
          <span className="font-medium">
            {replyCount} {replyCount === 1 ? 'reply' : 'replies'} hidden
          </span>
        </button>
      )}
    </div>
  );
};

export default CommentThread;
