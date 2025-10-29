/**
 * Notification Service Utility
 * Handles in-app notifications
 */

const { prisma } = require('./db');
const logger = require('./logger');

/**
 * Create notification
 */
async function createNotification(userId, type, title, message, metadata = {}) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        metadata: JSON.stringify(metadata)
      }
    });
    
    return notification;
  } catch (error) {
    logger.error('Failed to create notification', error);
    throw error;
  }
}

/**
 * Get user notifications
 */
async function getUserNotifications(userId, unreadOnly = false) {
  try {
    const where = { userId };
    
    if (unreadOnly) {
      where.read = false;
    }
    
    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    
    return notifications;
  } catch (error) {
    logger.error('Failed to get notifications', error);
    return [];
  }
}

/**
 * Mark notification as read
 */
async function markAsRead(notificationId) {
  try {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true, readAt: new Date() }
    });
    
    return { success: true };
  } catch (error) {
    logger.error('Failed to mark notification as read', error);
    throw error;
  }
}

/**
 * Mark all as read for user
 */
async function markAllAsRead(userId) {
  try {
    const result = await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true, readAt: new Date() }
    });
    
    return { success: true, count: result.count };
  } catch (error) {
    logger.error('Failed to mark all as read', error);
    throw error;
  }
}

/**
 * Get unread count
 */
async function getUnreadCount(userId) {
  try {
    const count = await prisma.notification.count({
      where: { userId, read: false }
    });
    
    return count;
  } catch (error) {
    logger.error('Failed to get unread count', error);
    return 0;
  }
}

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount
};
