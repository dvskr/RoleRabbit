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
 * Enables 2FA by calling the setup endpoint
 */
export const setup2FA = async (): Promise<ApiResult<{ qrCode: string; secret: string; backupCodes: string[] }>> => {
  try {
    const response: Response = await fetch(API_ENDPOINTS.TWO_FA_SETUP, {
      method: 'POST',
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await parseError(response);
      logger.error('Failed to setup 2FA:', error);
      return { success: false, error };
    }

    const data: any = await response.json();

    if (!data?.secret || !data?.qrCode) {
      return { success: false, error: 'Invalid response from server while starting 2FA setup.' };
    }

    return {
      success: true,
      qrCode: data.qrCode as string,
      secret: data.secret as string,
      backupCodes: Array.isArray(data.backupCodes) ? data.backupCodes : []
    };
  } catch (error) {
    logger.error('2FA setup failed:', error);
    return { success: false, error: 'Failed to setup 2FA. Please try again.' };
  }
};

export const enable2FA = async (
  secret: string,
  token: string,
  backupCodes: string[],
  method: 'app' | 'email' = 'app'
): Promise<ApiResult<{ backupCodes: string[] }>> => {
  try {
    const response: Response = await fetch(API_ENDPOINTS.TWO_FA_ENABLE, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, secret, backupCodes, method })
    });

    if (!response.ok) {
      const error = await parseError(response);
      logger.error('Failed to enable 2FA:', error);
      return { success: false, error };
    }

    const data: unknown = await response.json();
    const newBackupCodes = Array.isArray((data as any)?.backupCodes) ? (data as any).backupCodes : [];
    return { success: true, backupCodes: newBackupCodes };
  } catch (error) {
    logger.error('Failed to enable 2FA:', error);
    return { success: false, error: 'Unable to enable 2FA. Please try again.' };
  }
};

/**
 * Disables 2FA
 */
export const disable2FA = async (
  password: string,
  twoFactorToken: string
): Promise<ApiResult<{}>> => {
  try {
    const response: Response = await fetch(API_ENDPOINTS.TWO_FA_DISABLE, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, twoFactorToken })
    });

    if (!response.ok) {
      const error = await parseError(response);
      logger.error('Failed to disable 2FA:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    logger.error('Failed to disable 2FA:', error);
    return { success: false, error: 'Unable to disable 2FA. Please try again.' };
  }
};

export const get2FAStatus = async (): Promise<ApiResult<{ enabled: boolean; hasBackupCodes: boolean }>> => {
  try {
    const response: Response = await fetch(API_ENDPOINTS.TWO_FA_STATUS, {
      method: 'GET',
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await parseError(response);
      return { success: false, error };
    }

    const data: any = await response.json();
    return { success: true, enabled: data.enabled, hasBackupCodes: !!data.hasBackupCodes };
  } catch (error) {
    logger.error('Failed to fetch 2FA status:', error);
    return { success: false, error: 'Unable to load 2FA status.' };
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

