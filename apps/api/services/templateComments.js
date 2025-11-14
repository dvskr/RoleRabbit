/**
 * Template Comments Service
 * Manages commenting system for templates
 *
 * Features:
 * - Nested comments (replies)
 * - Rich text support
 * - Mentions (@user)
 * - Reactions/likes
 * - Comment moderation
 * - Edit history
 * - Pinned comments
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Add a comment to a template
 */
async function addComment(templateId, userId, commentData) {
  try {
    const { content, parentId = null, mentions = [] } = commentData;

    // Validate content
    if (!content || content.trim().length === 0) {
      throw new Error('Comment content is required');
    }

    if (content.length > 5000) {
      throw new Error('Comment is too long (max 5000 characters)');
    }

    // Check if template exists
    const template = await prisma.resumeTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new Error('Template not found');
    }

    // If this is a reply, verify parent comment exists
    if (parentId) {
      const parentComment = await prisma.templateComment.findUnique({
        where: { id: parentId },
      });

      if (!parentComment || parentComment.templateId !== templateId) {
        throw new Error('Parent comment not found');
      }
    }

    // Create comment
    const comment = await prisma.templateComment.create({
      data: {
        templateId,
        userId,
        content,
        parentId,
        isEdited: false,
        isPinned: false,
        likesCount: 0,
        repliesCount: 0,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // Update parent comment reply count
    if (parentId) {
      await prisma.templateComment.update({
        where: { id: parentId },
        data: {
          repliesCount: {
            increment: 1,
          },
        },
      });
    }

    // Handle mentions
    if (mentions.length > 0) {
      await handleMentions(comment.id, mentions, userId);
    }

    // Notify template author (if not commenting on own template)
    if (template.authorId !== userId) {
      await notifyCommentAdded(templateId, comment.id, template.authorId, userId);
    }

    return {
      success: true,
      comment,
      message: 'Comment added successfully',
    };
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
}

/**
 * Get comments for a template
 */
async function getComments(templateId, options = {}) {
  try {
    const {
      limit = 50,
      offset = 0,
      sortBy = 'newest',
      parentId = null,
    } = options;

    const where = {
      templateId,
      parentId,
      isModerated: false,
    };

    // Determine sort order
    let orderBy;
    switch (sortBy) {
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'popular':
        orderBy = { likesCount: 'desc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    // Fetch pinned comments separately
    const pinnedComments = await prisma.templateComment.findMany({
      where: {
        ...where,
        isPinned: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            replies: true,
            likes: true,
          },
        },
      },
      orderBy,
    });

    // Fetch regular comments
    const [comments, total] = await Promise.all([
      prisma.templateComment.findMany({
        where: {
          ...where,
          isPinned: false,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              replies: true,
              likes: true,
            },
          },
        },
        orderBy,
        take: limit,
        skip: offset,
      }),
      prisma.templateComment.count({
        where: {
          ...where,
          isPinned: false,
        },
      }),
    ]);

    return {
      pinnedComments,
      comments,
      total,
      limit,
      offset,
    };
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
}

/**
 * Get comment thread (comment with all replies)
 */
async function getCommentThread(commentId) {
  try {
    const comment = await prisma.templateComment.findUnique({
      where: { id: commentId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        replies: {
          where: { isModerated: false },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
            _count: {
              select: {
                likes: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    if (!comment) {
      throw new Error('Comment not found');
    }

    return comment;
  } catch (error) {
    console.error('Error fetching comment thread:', error);
    throw error;
  }
}

/**
 * Edit a comment
 */
async function editComment(commentId, userId, newContent) {
  try {
    const comment = await prisma.templateComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new Error('Comment not found');
    }

    if (comment.userId !== userId) {
      throw new Error('You do not have permission to edit this comment');
    }

    // Check edit time limit (e.g., 15 minutes)
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    if (comment.createdAt < fifteenMinutesAgo && !comment.isEdited) {
      throw new Error('Edit time limit exceeded (15 minutes)');
    }

    // Save edit history
    await prisma.commentEditHistory.create({
      data: {
        commentId,
        previousContent: comment.content,
        editedAt: new Date(),
      },
    });

    // Update comment
    const updatedComment = await prisma.templateComment.update({
      where: { id: commentId },
      data: {
        content: newContent,
        isEdited: true,
        lastEditedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return {
      success: true,
      comment: updatedComment,
      message: 'Comment updated successfully',
    };
  } catch (error) {
    console.error('Error editing comment:', error);
    throw error;
  }
}

/**
 * Delete a comment
 */
async function deleteComment(commentId, userId) {
  try {
    const comment = await prisma.templateComment.findUnique({
      where: { id: commentId },
      include: {
        template: true,
      },
    });

    if (!comment) {
      throw new Error('Comment not found');
    }

    // User can delete their own comment, or template author can delete any comment
    if (comment.userId !== userId && comment.template.authorId !== userId) {
      throw new Error('You do not have permission to delete this comment');
    }

    // Soft delete if it has replies
    if (comment.repliesCount > 0) {
      await prisma.templateComment.update({
        where: { id: commentId },
        data: {
          content: '[Comment deleted by user]',
          isModerated: true,
        },
      });
    } else {
      // Hard delete if no replies
      await prisma.templateComment.delete({
        where: { id: commentId },
      });
    }

    // Update parent reply count
    if (comment.parentId) {
      await prisma.templateComment.update({
        where: { id: comment.parentId },
        data: {
          repliesCount: {
            decrement: 1,
          },
        },
      });
    }

    return {
      success: true,
      message: 'Comment deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
}

/**
 * Like/unlike a comment
 */
async function toggleCommentLike(commentId, userId) {
  try {
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId,
        },
      },
    });

    if (existingLike) {
      // Unlike
      await prisma.commentLike.delete({
        where: { id: existingLike.id },
      });

      await prisma.templateComment.update({
        where: { id: commentId },
        data: {
          likesCount: {
            decrement: 1,
          },
        },
      });

      return {
        success: true,
        liked: false,
        message: 'Like removed',
      };
    } else {
      // Like
      await prisma.commentLike.create({
        data: {
          userId,
          commentId,
        },
      });

      await prisma.templateComment.update({
        where: { id: commentId },
        data: {
          likesCount: {
            increment: 1,
          },
        },
      });

      // Notify comment author
      const comment = await prisma.templateComment.findUnique({
        where: { id: commentId },
      });

      if (comment && comment.userId !== userId) {
        await notifyCommentLiked(commentId, comment.userId, userId);
      }

      return {
        success: true,
        liked: true,
        message: 'Comment liked',
      };
    }
  } catch (error) {
    console.error('Error toggling comment like:', error);
    throw error;
  }
}

/**
 * Pin/unpin a comment (template author only)
 */
async function togglePinComment(commentId, userId) {
  try {
    const comment = await prisma.templateComment.findUnique({
      where: { id: commentId },
      include: {
        template: true,
      },
    });

    if (!comment) {
      throw new Error('Comment not found');
    }

    // Only template author can pin comments
    if (comment.template.authorId !== userId) {
      throw new Error('Only the template author can pin comments');
    }

    const updatedComment = await prisma.templateComment.update({
      where: { id: commentId },
      data: {
        isPinned: !comment.isPinned,
      },
    });

    return {
      success: true,
      pinned: updatedComment.isPinned,
      message: updatedComment.isPinned ? 'Comment pinned' : 'Comment unpinned',
    };
  } catch (error) {
    console.error('Error toggling pin comment:', error);
    throw error;
  }
}

/**
 * Report a comment
 */
async function reportComment(commentId, userId, reason) {
  try {
    const comment = await prisma.templateComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new Error('Comment not found');
    }

    // Create report
    await prisma.commentReport.create({
      data: {
        commentId,
        reportedBy: userId,
        reason,
        status: 'PENDING',
      },
    });

    // Auto-moderate if too many reports
    const reportCount = await prisma.commentReport.count({
      where: { commentId },
    });

    if (reportCount >= 5) {
      await moderateComment(commentId, true, 'Automatically hidden due to multiple reports');
    }

    return {
      success: true,
      message: 'Comment reported successfully',
    };
  } catch (error) {
    console.error('Error reporting comment:', error);
    throw error;
  }
}

/**
 * Moderate a comment (admin only)
 */
async function moderateComment(commentId, shouldHide, moderationNote = '') {
  try {
    await prisma.templateComment.update({
      where: { id: commentId },
      data: {
        isModerated: shouldHide,
        moderationNote,
        moderatedAt: new Date(),
      },
    });

    return {
      success: true,
      message: shouldHide ? 'Comment hidden' : 'Comment restored',
    };
  } catch (error) {
    console.error('Error moderating comment:', error);
    throw error;
  }
}

/**
 * Get comment edit history
 */
async function getCommentEditHistory(commentId, userId) {
  try {
    const comment = await prisma.templateComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new Error('Comment not found');
    }

    // Only comment author can see edit history
    if (comment.userId !== userId) {
      throw new Error('You do not have permission to view edit history');
    }

    const history = await prisma.commentEditHistory.findMany({
      where: { commentId },
      orderBy: { editedAt: 'desc' },
    });

    return {
      currentContent: comment.content,
      history,
    };
  } catch (error) {
    console.error('Error fetching edit history:', error);
    throw error;
  }
}

/**
 * Get comment statistics for template
 */
async function getCommentStatistics(templateId) {
  try {
    const [totalComments, totalReplies, topCommenters] = await Promise.all([
      prisma.templateComment.count({
        where: {
          templateId,
          parentId: null,
          isModerated: false,
        },
      }),
      prisma.templateComment.count({
        where: {
          templateId,
          parentId: { not: null },
          isModerated: false,
        },
      }),
      prisma.templateComment.groupBy({
        by: ['userId'],
        where: {
          templateId,
          isModerated: false,
        },
        _count: {
          userId: true,
        },
        orderBy: {
          _count: {
            userId: 'desc',
          },
        },
        take: 5,
      }),
    ]);

    return {
      totalComments,
      totalReplies,
      totalCount: totalComments + totalReplies,
      topCommenters: topCommenters.map((tc) => ({
        userId: tc.userId,
        commentCount: tc._count.userId,
      })),
    };
  } catch (error) {
    console.error('Error fetching comment statistics:', error);
    throw error;
  }
}

/**
 * Helper: Handle mentions in comment
 */
async function handleMentions(commentId, mentions, mentioningUserId) {
  try {
    for (const mentionedUserId of mentions) {
      // Verify user exists
      const user = await prisma.user.findUnique({
        where: { id: mentionedUserId },
      });

      if (!user) continue;

      // Create notification
      await prisma.notification.create({
        data: {
          userId: mentionedUserId,
          type: 'COMMENT_MENTION',
          title: 'You were mentioned in a comment',
          message: `You were mentioned in a comment`,
          relatedId: commentId,
          relatedType: 'COMMENT',
          isRead: false,
        },
      });
    }
  } catch (error) {
    console.error('Error handling mentions:', error);
  }
}

/**
 * Helper: Notify template author of new comment
 */
async function notifyCommentAdded(templateId, commentId, authorId, commenterId) {
  try {
    await prisma.notification.create({
      data: {
        userId: authorId,
        type: 'NEW_COMMENT',
        title: 'New comment on your template',
        message: 'Someone commented on your template',
        relatedId: commentId,
        relatedType: 'COMMENT',
        isRead: false,
      },
    });
  } catch (error) {
    console.error('Error notifying comment added:', error);
  }
}

/**
 * Helper: Notify comment author of like
 */
async function notifyCommentLiked(commentId, authorId, likerId) {
  try {
    await prisma.notification.create({
      data: {
        userId: authorId,
        type: 'COMMENT_LIKED',
        title: 'Someone liked your comment',
        message: 'Your comment received a like',
        relatedId: commentId,
        relatedType: 'COMMENT',
        isRead: false,
      },
    });
  } catch (error) {
    console.error('Error notifying comment liked:', error);
  }
}

module.exports = {
  addComment,
  getComments,
  getCommentThread,
  editComment,
  deleteComment,
  toggleCommentLike,
  togglePinComment,
  reportComment,
  moderateComment,
  getCommentEditHistory,
  getCommentStatistics,
};
