/**
 * Discussion API utilities
 * Handles database operations for discussion posts and comments
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('./logger');

/**
 * Get all discussion posts
 * @param {string} community - Optional community filter
 * @returns {Promise<Array>} Array of discussion posts
 */
async function getDiscussionPosts(community) {
  try {
    const where = community ? { community } : {};
    const posts = await prisma.discussionPost.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    });
    return posts;
  } catch (error) {
    logger.error('Error fetching discussion posts:', error);
    throw error;
  }
}

/**
 * Get a single discussion post by ID
 * @param {string} postId - Post ID
 * @returns {Promise<Object>} Discussion post object
 */
async function getDiscussionPostById(postId) {
  try {
    const post = await prisma.discussionPost.findUnique({
      where: {
        id: postId
      }
    });
    return post;
  } catch (error) {
    logger.error('Error fetching discussion post:', error);
    throw error;
  }
}

/**
 * Create a new discussion post
 * @param {string} userId - User ID
 * @param {Object} postData - Post data
 * @returns {Promise<Object>} Created discussion post
 */
async function createDiscussionPost(userId, postData) {
  try {
    const post = await prisma.discussionPost.create({
      data: {
        title: postData.title || 'Untitled Post',
        content: postData.content || '',
        author: userId,
        community: postData.community || 'general'
      }
    });
    return post;
  } catch (error) {
    logger.error('Error creating discussion post:', error);
    throw error;
  }
}

/**
 * Update a discussion post
 * @param {string} postId - Post ID
 * @param {Object} updates - Updates to apply
 * @returns {Promise<Object>} Updated discussion post
 */
async function updateDiscussionPost(postId, updates) {
  try {
    // Filter out undefined fields
    const cleanUpdates = {};
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        cleanUpdates[key] = updates[key];
      }
    });

    const post = await prisma.discussionPost.update({
      where: {
        id: postId
      },
      data: cleanUpdates
    });
    return post;
  } catch (error) {
    logger.error('Error updating discussion post:', error);
    throw error;
  }
}

/**
 * Delete a discussion post
 * @param {string} postId - Post ID
 * @returns {Promise<boolean>} Success status
 */
async function deleteDiscussionPost(postId) {
  try {
    await prisma.discussionPost.delete({
      where: {
        id: postId
      }
    });
    return true;
  } catch (error) {
    logger.error('Error deleting discussion post:', error);
    throw error;
  }
}

/**
 * Get comments for a post
 * @param {string} postId - Post ID
 * @returns {Promise<Array>} Array of comments
 */
async function getCommentsByPostId(postId) {
  try {
    const comments = await prisma.discussionComment.findMany({
      where: {
        postId: postId
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
    return comments;
  } catch (error) {
    logger.error('Error fetching comments:', error);
    throw error;
  }
}

/**
 * Create a new comment
 * @param {string} postId - Post ID
 * @param {string} userId - User ID
 * @param {Object} commentData - Comment data
 * @returns {Promise<Object>} Created comment
 */
async function createComment(postId, userId, commentData) {
  try {
    const comment = await prisma.discussionComment.create({
      data: {
        postId,
        content: commentData.content || '',
        author: userId,
        parentId: commentData.parentId || null
      }
    });
    return comment;
  } catch (error) {
    logger.error('Error creating comment:', error);
    throw error;
  }
}

/**
 * Update a comment
 * @param {string} commentId - Comment ID
 * @param {Object} updates - Updates to apply
 * @returns {Promise<Object>} Updated comment
 */
async function updateComment(commentId, updates) {
  try {
    const cleanUpdates = {};
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        cleanUpdates[key] = updates[key];
      }
    });

    const comment = await prisma.discussionComment.update({
      where: {
        id: commentId
      },
      data: cleanUpdates
    });
    return comment;
  } catch (error) {
    logger.error('Error updating comment:', error);
    throw error;
  }
}

/**
 * Delete a comment
 * @param {string} commentId - Comment ID
 * @returns {Promise<boolean>} Success status
 */
async function deleteComment(commentId) {
  try {
    await prisma.discussionComment.delete({
      where: {
        id: commentId
      }
    });
    return true;
  } catch (error) {
    logger.error('Error deleting comment:', error);
    throw error;
  }
}

module.exports = {
  getDiscussionPosts,
  getDiscussionPostById,
  createDiscussionPost,
  updateDiscussionPost,
  deleteDiscussionPost,
  getCommentsByPostId,
  createComment,
  updateComment,
  deleteComment
};

