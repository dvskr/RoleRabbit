/**
 * Manual Review Queue - Section 6.4
 *
 * Queue system for content flagged by automated moderation
 */

import { createSupabaseServiceClient } from '@/database/client';
import { ModerationResult } from './content-scanner';

export interface ReviewQueueItem {
  id: string;
  portfolioId: string;
  userId: string;
  contentType: 'portfolio' | 'section' | 'comment';
  contentSnapshot: any; // Snapshot of content at time of flagging
  moderationResult: ModerationResult;
  status: ReviewStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewDecision?: ReviewDecision;
  reviewNotes?: string;
}

export enum ReviewStatus {
  PENDING = 'pending',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ESCALATED = 'escalated',
}

export enum ReviewDecision {
  APPROVE = 'approve',
  REJECT = 'reject',
  REQUEST_CHANGES = 'request_changes',
  BAN_USER = 'ban_user',
}

/**
 * Add portfolio to review queue
 */
export async function addToReviewQueue(
  portfolioId: string,
  userId: string,
  moderationResult: ModerationResult,
  contentSnapshot: any
): Promise<{ success: boolean; queueId?: string }> {
  const supabase = createSupabaseServiceClient();

  // Determine priority based on moderation score
  let priority: 'low' | 'medium' | 'high' | 'urgent' = 'low';
  if (moderationResult.score >= 70) {
    priority = 'urgent';
  } else if (moderationResult.score >= 50) {
    priority = 'high';
  } else if (moderationResult.score >= 30) {
    priority = 'medium';
  }

  try {
    const { data, error } = await supabase
      .from('review_queue')
      .insert({
        portfolio_id: portfolioId,
        user_id: userId,
        content_type: 'portfolio',
        content_snapshot: contentSnapshot,
        moderation_result: moderationResult,
        status: ReviewStatus.PENDING,
        priority,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding to review queue:', error);
      return { success: false };
    }

    return { success: true, queueId: data.id };
  } catch (error) {
    console.error('Error adding to review queue:', error);
    return { success: false };
  }
}

/**
 * Get pending review items
 */
export async function getPendingReviews(
  limit: number = 50,
  priorityFilter?: 'low' | 'medium' | 'high' | 'urgent'
): Promise<ReviewQueueItem[]> {
  const supabase = createSupabaseServiceClient();

  let query = supabase
    .from('review_queue')
    .select('*')
    .eq('status', ReviewStatus.PENDING)
    .order('priority', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(limit);

  if (priorityFilter) {
    query = query.eq('priority', priorityFilter);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching pending reviews:', error);
    return [];
  }

  return data.map(row => ({
    id: row.id,
    portfolioId: row.portfolio_id,
    userId: row.user_id,
    contentType: row.content_type,
    contentSnapshot: row.content_snapshot,
    moderationResult: row.moderation_result,
    status: row.status,
    priority: row.priority,
    createdAt: row.created_at,
    reviewedAt: row.reviewed_at,
    reviewedBy: row.reviewed_by,
    reviewDecision: row.review_decision,
    reviewNotes: row.review_notes,
  }));
}

/**
 * Claim review item for processing
 */
export async function claimReviewItem(
  queueId: string,
  reviewerId: string
): Promise<{ success: boolean }> {
  const supabase = createSupabaseServiceClient();

  try {
    const { error } = await supabase
      .from('review_queue')
      .update({
        status: ReviewStatus.IN_REVIEW,
        reviewed_by: reviewerId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', queueId)
      .eq('status', ReviewStatus.PENDING); // Only claim if still pending

    if (error) {
      console.error('Error claiming review item:', error);
      return { success: false };
    }

    return { success: true };
  } catch (error) {
    console.error('Error claiming review item:', error);
    return { success: false };
  }
}

/**
 * Complete review with decision
 */
export async function completeReview(
  queueId: string,
  reviewerId: string,
  decision: ReviewDecision,
  notes?: string
): Promise<{ success: boolean }> {
  const supabase = createSupabaseServiceClient();

  try {
    // Update review queue item
    const { error: updateError } = await supabase
      .from('review_queue')
      .update({
        status: decision === ReviewDecision.APPROVE ? ReviewStatus.APPROVED : ReviewStatus.REJECTED,
        reviewed_at: new Date().toISOString(),
        reviewed_by: reviewerId,
        review_decision: decision,
        review_notes: notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', queueId);

    if (updateError) {
      console.error('Error completing review:', updateError);
      return { success: false };
    }

    // Get review item to apply decision
    const { data: reviewItem } = await supabase
      .from('review_queue')
      .select('*')
      .eq('id', queueId)
      .single();

    if (reviewItem) {
      await applyReviewDecision(reviewItem, decision, notes);
    }

    return { success: true };
  } catch (error) {
    console.error('Error completing review:', error);
    return { success: false };
  }
}

/**
 * Apply review decision to portfolio/content
 */
async function applyReviewDecision(
  reviewItem: any,
  decision: ReviewDecision,
  notes?: string
): Promise<void> {
  const supabase = createSupabaseServiceClient();

  switch (decision) {
    case ReviewDecision.APPROVE:
      // Allow portfolio to be published
      await supabase
        .from('portfolios')
        .update({
          moderation_status: 'approved',
          moderation_notes: notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', reviewItem.portfolio_id);

      // Notify user
      await notifyUser(reviewItem.user_id, {
        type: 'moderation_approved',
        portfolioId: reviewItem.portfolio_id,
        message: 'Your portfolio has been approved for publishing.',
      });
      break;

    case ReviewDecision.REJECT:
      // Reject portfolio, unpublish if already published
      await supabase
        .from('portfolios')
        .update({
          moderation_status: 'rejected',
          moderation_notes: notes,
          published: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', reviewItem.portfolio_id);

      // Notify user
      await notifyUser(reviewItem.user_id, {
        type: 'moderation_rejected',
        portfolioId: reviewItem.portfolio_id,
        message: `Your portfolio was not approved for publishing. Reason: ${notes}`,
      });
      break;

    case ReviewDecision.REQUEST_CHANGES:
      // Request changes from user
      await supabase
        .from('portfolios')
        .update({
          moderation_status: 'changes_requested',
          moderation_notes: notes,
          published: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', reviewItem.portfolio_id);

      // Notify user
      await notifyUser(reviewItem.user_id, {
        type: 'moderation_changes_requested',
        portfolioId: reviewItem.portfolio_id,
        message: `Please make changes to your portfolio: ${notes}`,
      });
      break;

    case ReviewDecision.BAN_USER:
      // Ban user account
      await supabase
        .from('users')
        .update({
          banned: true,
          ban_reason: notes,
          banned_at: new Date().toISOString(),
        })
        .eq('id', reviewItem.user_id);

      // Unpublish all portfolios
      await supabase
        .from('portfolios')
        .update({
          published: false,
          moderation_status: 'banned',
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', reviewItem.user_id);

      // Notify user
      await notifyUser(reviewItem.user_id, {
        type: 'account_banned',
        message: `Your account has been suspended. Reason: ${notes}`,
      });
      break;
  }
}

/**
 * Notify user about moderation decision
 */
async function notifyUser(
  userId: string,
  notification: {
    type: string;
    portfolioId?: string;
    message: string;
  }
): Promise<void> {
  const supabase = createSupabaseServiceClient();

  // Store notification in database
  await supabase.from('notifications').insert({
    user_id: userId,
    type: notification.type,
    message: notification.message,
    metadata: { portfolioId: notification.portfolioId },
    created_at: new Date().toISOString(),
  });

  // In production, also send email notification
  // await sendEmail(userId, notification);
}

/**
 * Get review queue statistics
 */
export async function getReviewQueueStats(): Promise<{
  pending: number;
  inReview: number;
  approved: number;
  rejected: number;
  avgReviewTime: number; // in minutes
}> {
  const supabase = createSupabaseServiceClient();

  const { data } = await supabase
    .from('review_queue')
    .select('status, created_at, reviewed_at');

  if (!data) {
    return {
      pending: 0,
      inReview: 0,
      approved: 0,
      rejected: 0,
      avgReviewTime: 0,
    };
  }

  const pending = data.filter(r => r.status === ReviewStatus.PENDING).length;
  const inReview = data.filter(r => r.status === ReviewStatus.IN_REVIEW).length;
  const approved = data.filter(r => r.status === ReviewStatus.APPROVED).length;
  const rejected = data.filter(r => r.status === ReviewStatus.REJECTED).length;

  // Calculate average review time
  const reviewedItems = data.filter(r => r.reviewed_at);
  const reviewTimes = reviewedItems.map(r => {
    const created = new Date(r.created_at).getTime();
    const reviewed = new Date(r.reviewed_at).getTime();
    return (reviewed - created) / 1000 / 60; // minutes
  });

  const avgReviewTime = reviewTimes.length > 0
    ? reviewTimes.reduce((a, b) => a + b, 0) / reviewTimes.length
    : 0;

  return {
    pending,
    inReview,
    approved,
    rejected,
    avgReviewTime: Math.round(avgReviewTime),
  };
}

/**
 * Escalate review to senior moderator
 */
export async function escalateReview(
  queueId: string,
  escalationReason: string
): Promise<{ success: boolean }> {
  const supabase = createSupabaseServiceClient();

  try {
    const { error } = await supabase
      .from('review_queue')
      .update({
        status: ReviewStatus.ESCALATED,
        priority: 'urgent',
        review_notes: `Escalated: ${escalationReason}`,
        updated_at: new Date().toISOString(),
      })
      .eq('id', queueId);

    if (error) {
      console.error('Error escalating review:', error);
      return { success: false };
    }

    // Notify senior moderators
    // await notifySeniorModerators(queueId, escalationReason);

    return { success: true };
  } catch (error) {
    console.error('Error escalating review:', error);
    return { success: false };
  }
}

/**
 * Priority levels for review queue
 */
export type ReviewPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * Get review queue with filtering and pagination
 */
export async function getReviewQueue(options: {
  status?: ReviewStatus;
  priority?: ReviewPriority;
  page?: number;
  limit?: number;
}): Promise<{ items: ReviewQueueItem[]; total: number; stats?: any }> {
  const supabase = createSupabaseServiceClient();
  const { status, priority, page = 1, limit = 20 } = options;

  try {
    let query = supabase
      .from('review_queue')
      .select('*', { count: 'exact' });

    if (status) {
      query = query.eq('status', status);
    }

    if (priority) {
      query = query.eq('priority', priority);
    }

    const offset = (page - 1) * limit;
    query = query
      .range(offset, offset + limit - 1)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true });

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching review queue:', error);
      return { items: [], total: 0 };
    }

    const items: ReviewQueueItem[] = (data || []).map((row: any) => ({
      id: row.id,
      portfolioId: row.portfolio_id,
      userId: row.user_id,
      contentType: row.content_type,
      contentSnapshot: row.content_snapshot,
      moderationResult: row.moderation_result,
      status: row.status,
      priority: row.priority,
      createdAt: row.created_at,
      reviewedAt: row.reviewed_at,
      reviewedBy: row.reviewed_by,
      reviewDecision: row.review_decision,
      reviewNotes: row.review_notes,
    }));

    // Get stats
    const stats = await getReviewQueueStats();

    return { items, total: count || 0, stats };
  } catch (error) {
    console.error('Error fetching review queue:', error);
    return { items: [], total: 0 };
  }
}

/**
 * Approve content from review queue
 */
export async function approveContent(
  queueId: string,
  reviewerId: string,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createSupabaseServiceClient();

  try {
    // Get review item
    const { data: item, error: fetchError } = await supabase
      .from('review_queue')
      .select('portfolio_id')
      .eq('id', queueId)
      .single();

    if (fetchError || !item) {
      return { success: false, error: 'Review item not found' };
    }

    // Update review queue
    const { error: updateQueueError } = await supabase
      .from('review_queue')
      .update({
        status: ReviewStatus.APPROVED,
        reviewed_at: new Date().toISOString(),
        reviewed_by: reviewerId,
        review_decision: ReviewDecision.APPROVE,
        review_notes: notes,
      })
      .eq('id', queueId);

    if (updateQueueError) {
      throw updateQueueError;
    }

    // Ensure portfolio stays published
    await supabase
      .from('portfolios')
      .update({ moderation_reason: null })
      .eq('id', item.portfolio_id);

    return { success: true };
  } catch (error) {
    console.error('Error approving content:', error);
    return { success: false, error: 'Failed to approve content' };
  }
}

/**
 * Reject content from review queue
 */
export async function rejectContent(
  queueId: string,
  reviewerId: string,
  notes: string,
  requiresRevision?: boolean
): Promise<{ success: boolean; error?: string }> {
  const supabase = createSupabaseServiceClient();

  try {
    // Get review item
    const { data: item, error: fetchError } = await supabase
      .from('review_queue')
      .select('portfolio_id')
      .eq('id', queueId)
      .single();

    if (fetchError || !item) {
      return { success: false, error: 'Review item not found' };
    }

    // Update review queue
    const { error: updateQueueError } = await supabase
      .from('review_queue')
      .update({
        status: ReviewStatus.REJECTED,
        reviewed_at: new Date().toISOString(),
        reviewed_by: reviewerId,
        review_decision: requiresRevision ? ReviewDecision.REQUEST_CHANGES : ReviewDecision.REJECT,
        review_notes: notes,
      })
      .eq('id', queueId);

    if (updateQueueError) {
      throw updateQueueError;
    }

    // Unpublish portfolio
    await supabase
      .from('portfolios')
      .update({
        published: false,
        moderation_reason: notes,
      })
      .eq('id', item.portfolio_id);

    return { success: true };
  } catch (error) {
    console.error('Error rejecting content:', error);
    return { success: false, error: 'Failed to reject content' };
  }
}
