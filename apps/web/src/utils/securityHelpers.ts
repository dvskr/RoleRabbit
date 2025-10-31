import { logger } from './logger';
import { API_ENDPOINTS } from '../components/profile/tabs/security/constants';

/**
 * Security-related API helper functions
 */

/**
 * Enables 2FA by calling the setup endpoint
 */
export const setup2FA = async (): Promise<{ qrCode?: string; secret?: string; success: boolean }> => {
  try {
    const response = await fetch(API_ENDPOINTS.TWO_FA_SETUP, {
      method: 'POST',
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      return { ...data, success: true };
    } else {
      const errorData = await response.json().catch(() => ({}));
      logger.error('Failed to setup 2FA:', response.statusText, errorData);
      return { success: false };
    }
  } catch (error) {
    logger.error('2FA setup failed:', error);
    return { success: false };
  }
};

/**
 * Disables 2FA
 */
export const disable2FA = async (
  password: string,
  twoFactorToken: string
): Promise<boolean> => {
  try {
    const response = await fetch(API_ENDPOINTS.TWO_FA_DISABLE, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, twoFactorToken }),
    });

    if (response.ok) {
      return true;
    } else {
      logger.error('Failed to disable 2FA:', response.statusText);
      return false;
    }
  } catch (error) {
    logger.error('Failed to disable 2FA:', error);
    return false;
  }
};

/**
 * Verifies 2FA code
 */
export const verify2FACode = async (code: string): Promise<boolean> => {
  try {
    const response = await fetch(API_ENDPOINTS.TWO_FA_VERIFY, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });

    return response.ok;
  } catch (error) {
    logger.error('Failed to verify 2FA code:', error);
    return false;
  }
};

/**
 * Changes user password
 */
export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<boolean> => {
  try {
    const response = await fetch(API_ENDPOINTS.PASSWORD_CHANGE, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (response.ok) {
      logger.debug('Password changed successfully');
      return true;
    } else {
      logger.error('Failed to change password:', response.statusText);
      return false;
    }
  } catch (error) {
    logger.error('Failed to change password:', error);
    return false;
  }
};

/**
 * Simulates password change (for development/testing)
 */
export const simulatePasswordChange = async (
  currentPassword: string,
  newPassword: string
): Promise<boolean> => {
  logger.debug('Changing password...');
  return new Promise((resolve) => {
    setTimeout(() => {
      logger.debug('Password changed successfully');
      resolve(true);
    }, 1000);
  });
};

