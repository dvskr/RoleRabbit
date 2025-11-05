/**
 * Tests for Notification Service
 */

const notificationService = require('../../utils/notificationService');

describe('NotificationService', () => {
  test('should have all required methods', () => {
    expect(typeof notificationService.createNotification).toBe('function');
    expect(typeof notificationService.getUserNotifications).toBe('function');
    expect(typeof notificationService.markAsRead).toBe('function');
    expect(typeof notificationService.markAllAsRead).toBe('function');
    expect(typeof notificationService.getUnreadCount).toBe('function');
  });

  test('should export notification functions', () => {
    expect(notificationService).toBeDefined();
    expect(typeof notificationService).toBe('object');
  });
});

