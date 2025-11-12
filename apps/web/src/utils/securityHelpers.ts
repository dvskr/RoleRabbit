import { logger } from './logger';
import { API_ENDPOINTS } from '../components/profile/tabs/security/constants';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type ApiResult<T> = { success: true } & T | { success: false; error: string };

const parseError = async (response: Response): Promise<string> => {
  try {
    const data: any = await response.json();
    return data?.error || data?.message || response.statusText;
  } catch (error) {
    logger.warn('Failed to parse security API error response', error);
    return response.statusText;
  }
};


/**
 * Changes user password
 */
export const changePassword = async (
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
): Promise<ApiResult<{}>> => {
  try {
    const response: Response = await fetch(API_ENDPOINTS.PASSWORD_CHANGE, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
    });

    if (!response.ok) {
      const error = await parseError(response);
      logger.error('Failed to change password:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    logger.error('Failed to change password:', error);
    return { success: false, error: 'Unable to change password. Please try again.' };
  }
};

export interface LoginSessionDTO {
  id: string;
  device: string;
  ipAddress?: string;
  lastActivity: string;
  isCurrent: boolean;
  userAgent?: string;
}

export const getSessions = async (): Promise<ApiResult<{ sessions: LoginSessionDTO[] }>> => {
  try {
    const response: Response = await fetch(API_ENDPOINTS.SESSIONS, {
      method: 'GET',
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await parseError(response);
      return { success: false, error };
    }

    const data: any = await response.json();
    return {
      success: true,
      sessions: data.sessions || []
    };
  } catch (error) {
    logger.error('Failed to fetch sessions:', error);
    return { success: false, error: 'Unable to load sessions.' };
  }
};

export const revokeSession = async (sessionId: string): Promise<ApiResult<{}>> => {
  try {
    const response: Response = await fetch(`${API_ENDPOINTS.SESSIONS}/${sessionId}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await parseError(response);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    logger.error('Failed to revoke session:', error);
    return { success: false, error: 'Unable to revoke session.' };
  }
};

export const revokeOtherSessions = async (): Promise<ApiResult<{}>> => {
  try {
    const response: Response = await fetch(API_ENDPOINTS.SESSIONS, {
      method: 'DELETE',
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await parseError(response);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    logger.error('Failed to revoke sessions:', error);
    return { success: false, error: 'Unable to revoke sessions.' };
  }
};

/**
 * Send OTP to current email
 */
export const sendOTP = async (purpose: 'email_update' | 'password_reset'): Promise<ApiResult<{}>> => {
  try {
    const response: Response = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ purpose })
    });

    if (!response.ok) {
      const error = await parseError(response);
      logger.error('Failed to send OTP:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    logger.error('Failed to send OTP:', error);
    return { success: false, error: 'Unable to send OTP. Please try again.' };
  }
};

/**
 * Send OTP to new email address
 */
export const sendOTPToNewEmail = async (newEmail: string): Promise<ApiResult<{}>> => {
  try {
    const response: Response = await fetch(`${API_BASE_URL}/api/auth/send-otp-to-new-email`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newEmail })
    });

    if (!response.ok) {
      const error = await parseError(response);
      logger.error('Failed to send OTP to new email:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    logger.error('Failed to send OTP to new email:', error);
    return { success: false, error: 'Unable to send verification code. Please try again.' };
  }
};

/**
 * Verify OTP and update email (supports two-step verification)
 */
export const verifyOTPAndUpdateEmail = async (
  otp: string, 
  newEmail: string, 
  step?: 'verify_current' | 'verify_new'
): Promise<ApiResult<{}>> => {
  try {
    const response: Response = await fetch(`${API_BASE_URL}/api/auth/verify-otp-update-email`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ otp, newEmail, step: step || 'verify_current' })
    });

    if (!response.ok) {
      const error = await parseError(response);
      logger.error('Failed to update email:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    logger.error('Failed to update email:', error);
    return { success: false, error: 'Unable to update email. Please try again.' };
  }
};

/**
 * Verify OTP and reset password
 */
export const verifyOTPAndResetPassword = async (
  otp: string,
  newPassword: string,
  confirmPassword: string
): Promise<ApiResult<{}>> => {
  try {
    const response: Response = await fetch(`${API_BASE_URL}/api/auth/verify-otp-reset-password`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ otp, newPassword, confirmPassword })
    });

    if (!response.ok) {
      const error = await parseError(response);
      logger.error('Failed to reset password:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    logger.error('Failed to reset password:', error);
    return { success: false, error: 'Unable to reset password. Please try again.' };
  }
};

