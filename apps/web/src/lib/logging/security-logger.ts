/**
 * Security Event Logger - Section 6.5
 *
 * Log authentication, authorization, and security events
 */

import { createSupabaseServiceClient } from '@/database/client';
import { SafeLogger, sanitizeLogObject } from './log-sanitizer';

const logger = new SafeLogger('security');

export enum SecurityEventType {
  // Authentication events
  LOGIN_SUCCESS = 'login.success',
  LOGIN_FAILURE = 'login.failure',
  LOGOUT = 'logout',
  PASSWORD_CHANGE = 'password.change',
  PASSWORD_RESET_REQUEST = 'password.reset.request',
  PASSWORD_RESET_COMPLETE = 'password.reset.complete',
  MFA_ENABLED = 'mfa.enabled',
  MFA_DISABLED = 'mfa.disabled',
  MFA_CHALLENGE_SUCCESS = 'mfa.challenge.success',
  MFA_CHALLENGE_FAILURE = 'mfa.challenge.failure',

  // Authorization events
  UNAUTHORIZED_ACCESS = 'unauthorized.access',
  PERMISSION_DENIED = 'permission.denied',
  ROLE_CHANGED = 'role.changed',

  // Resource events
  RESOURCE_CREATED = 'resource.created',
  RESOURCE_DELETED = 'resource.deleted',
  RESOURCE_MODIFIED = 'resource.modified',

  // Suspicious activity
  BRUTE_FORCE_ATTEMPT = 'brute_force.attempt',
  RATE_LIMIT_EXCEEDED = 'rate_limit.exceeded',
  SUSPICIOUS_IP = 'suspicious.ip',
  ACCOUNT_TAKEOVER_ATTEMPT = 'account_takeover.attempt',

  // Admin events
  ADMIN_ACCESS = 'admin.access',
  ADMIN_ACTION = 'admin.action',
  CONFIG_CHANGE = 'config.change',

  // Data events
  DATA_EXPORT = 'data.export',
  DATA_DELETION = 'data.deletion',
  PII_ACCESS = 'pii.access',
}

export interface SecurityEvent {
  type: SecurityEventType;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  resource?: string;
  resourceId?: string;
  action?: string;
  result: 'success' | 'failure';
  metadata?: Record<string, any>;
  timestamp: string;
}

/**
 * Log security event to database and application logs
 */
export async function logSecurityEvent(event: SecurityEvent): Promise<void> {
  const supabase = createSupabaseServiceClient();

  // Sanitize metadata
  const sanitizedMetadata = event.metadata
    ? sanitizeLogObject(event.metadata)
    : undefined;

  // Log to database for long-term retention
  try {
    await supabase.from('security_logs').insert({
      event_type: event.type,
      user_id: event.userId,
      ip_address: event.ipAddress,
      user_agent: event.userAgent,
      resource: event.resource,
      resource_id: event.resourceId,
      action: event.action,
      result: event.result,
      metadata: sanitizedMetadata,
      created_at: event.timestamp,
    });
  } catch (error) {
    console.error('Failed to log security event to database:', error);
  }

  // Log to application logs
  const logMessage = `Security Event: ${event.type} - ${event.result}`;
  const logMetadata = {
    userId: event.userId,
    ipAddress: event.ipAddress,
    resource: event.resource,
    resourceId: event.resourceId,
    action: event.action,
    ...sanitizedMetadata,
  };

  if (event.result === 'failure') {
    logger.warn(logMessage, logMetadata);
  } else {
    logger.info(logMessage, logMetadata);
  }

  // Check for suspicious patterns
  await checkSuspiciousActivity(event);
}

/**
 * Log authentication attempt
 */
export async function logAuthAttempt(
  userId: string | null,
  email: string,
  success: boolean,
  ipAddress?: string,
  userAgent?: string,
  failureReason?: string
): Promise<void> {
  await logSecurityEvent({
    type: success ? SecurityEventType.LOGIN_SUCCESS : SecurityEventType.LOGIN_FAILURE,
    userId: userId || undefined,
    ipAddress,
    userAgent,
    result: success ? 'success' : 'failure',
    metadata: {
      email,
      failureReason,
    },
    timestamp: new Date().toISOString(),
  });

  // Check for brute force attempts
  if (!success && ipAddress) {
    await checkBruteForce(ipAddress, email);
  }
}

/**
 * Log logout event
 */
export async function logLogout(
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await logSecurityEvent({
    type: SecurityEventType.LOGOUT,
    userId,
    ipAddress,
    userAgent,
    result: 'success',
    timestamp: new Date().toISOString(),
  });
}

/**
 * Log unauthorized access attempt
 */
export async function logUnauthorizedAccess(
  userId: string | null,
  resource: string,
  resourceId: string,
  requiredPermission: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await logSecurityEvent({
    type: SecurityEventType.UNAUTHORIZED_ACCESS,
    userId: userId || undefined,
    ipAddress,
    userAgent,
    resource,
    resourceId,
    action: requiredPermission,
    result: 'failure',
    metadata: {
      requiredPermission,
    },
    timestamp: new Date().toISOString(),
  });
}

/**
 * Log sensitive operation
 */
export async function logSensitiveOperation(
  type: SecurityEventType,
  userId: string,
  resource: string,
  resourceId: string,
  action: string,
  ipAddress?: string,
  userAgent?: string,
  metadata?: Record<string, any>
): Promise<void> {
  await logSecurityEvent({
    type,
    userId,
    ipAddress,
    userAgent,
    resource,
    resourceId,
    action,
    result: 'success',
    metadata,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Check for brute force login attempts
 */
async function checkBruteForce(
  ipAddress: string,
  email: string
): Promise<void> {
  const supabase = createSupabaseServiceClient();

  // Count failed login attempts in last 15 minutes
  const fifteenMinutesAgo = new Date();
  fifteenMinutesAgo.setMinutes(fifteenMinutesAgo.getMinutes() - 15);

  const { count } = await supabase
    .from('security_logs')
    .select('*', { count: 'exact', head: true })
    .eq('event_type', SecurityEventType.LOGIN_FAILURE)
    .eq('ip_address', ipAddress)
    .gte('created_at', fifteenMinutesAgo.toISOString());

  // If >= 5 failed attempts, log brute force
  if (count && count >= 5) {
    await logSecurityEvent({
      type: SecurityEventType.BRUTE_FORCE_ATTEMPT,
      ipAddress,
      result: 'failure',
      metadata: {
        email,
        attemptCount: count,
      },
      timestamp: new Date().toISOString(),
    });

    // Send alert to security team
    await alertSecurityTeam('Brute force attack detected', {
      ipAddress,
      email,
      attemptCount: count,
    });
  }
}

/**
 * Check for suspicious activity patterns
 */
async function checkSuspiciousActivity(event: SecurityEvent): Promise<void> {
  // Detect account takeover attempts
  if (event.type === SecurityEventType.LOGIN_SUCCESS && event.userId) {
    await checkAccountTakeover(event.userId, event.ipAddress, event.userAgent);
  }

  // Detect mass deletions
  if (event.type === SecurityEventType.RESOURCE_DELETED && event.userId) {
    await checkMassDeletion(event.userId);
  }
}

/**
 * Check for account takeover
 * Detects login from unusual location or device
 */
async function checkAccountTakeover(
  userId: string,
  currentIP?: string,
  currentUA?: string
): Promise<void> {
  const supabase = createSupabaseServiceClient();

  // Get user's recent successful logins
  const { data: recentLogins } = await supabase
    .from('security_logs')
    .select('ip_address, user_agent')
    .eq('user_id', userId)
    .eq('event_type', SecurityEventType.LOGIN_SUCCESS)
    .order('created_at', { ascending: false })
    .limit(10);

  if (!recentLogins || recentLogins.length === 0) {
    return; // First login, nothing to compare
  }

  // Check if IP or UA is new
  const knownIPs = recentLogins.map(l => l.ip_address);
  const knownUAs = recentLogins.map(l => l.user_agent);

  if (currentIP && !knownIPs.includes(currentIP)) {
    // New IP detected
    await logSecurityEvent({
      type: SecurityEventType.ACCOUNT_TAKEOVER_ATTEMPT,
      userId,
      ipAddress: currentIP,
      userAgent: currentUA,
      result: 'success',
      metadata: {
        reason: 'Login from new IP address',
        previousIPs: knownIPs.slice(0, 3),
      },
      timestamp: new Date().toISOString(),
    });

    // Notify user
    // await sendSecurityAlert(userId, 'Login from new location');
  }
}

/**
 * Check for mass deletion
 * Detects if user is deleting many resources quickly
 */
async function checkMassDeletion(userId: string): Promise<void> {
  const supabase = createSupabaseServiceClient();

  // Count deletions in last hour
  const oneHourAgo = new Date();
  oneHourAgo.setHours(oneHourAgo.getHours() - 1);

  const { count } = await supabase
    .from('security_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('event_type', SecurityEventType.RESOURCE_DELETED)
    .gte('created_at', oneHourAgo.toISOString());

  // Alert if >= 10 deletions in 1 hour
  if (count && count >= 10) {
    await alertSecurityTeam('Mass deletion detected', {
      userId,
      deletionCount: count,
    });
  }
}

/**
 * Send alert to security team
 */
async function alertSecurityTeam(
  alertType: string,
  details: Record<string, any>
): Promise<void> {
  logger.warn(`SECURITY ALERT: ${alertType}`, details);

  // In production:
  // - Send email to security team
  // - Send Slack/Discord notification
  // - Create incident in monitoring system
  // - Trigger automated response (e.g., IP block)
}

/**
 * Get security events for user
 */
export async function getUserSecurityEvents(
  userId: string,
  limit: number = 100
): Promise<SecurityEvent[]> {
  const supabase = createSupabaseServiceClient();

  const { data, error } = await supabase
    .from('security_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data.map(row => ({
    type: row.event_type,
    userId: row.user_id,
    ipAddress: row.ip_address,
    userAgent: row.user_agent,
    resource: row.resource,
    resourceId: row.resource_id,
    action: row.action,
    result: row.result,
    metadata: row.metadata,
    timestamp: row.created_at,
  }));
}

/**
 * Get failed login attempts
 */
export async function getFailedLoginAttempts(
  timeWindowMinutes: number = 60
): Promise<Array<{
  ipAddress: string;
  attemptCount: number;
  lastAttempt: string;
}>> {
  const supabase = createSupabaseServiceClient();

  const since = new Date();
  since.setMinutes(since.getMinutes() - timeWindowMinutes);

  const { data } = await supabase
    .from('security_logs')
    .select('ip_address, created_at')
    .eq('event_type', SecurityEventType.LOGIN_FAILURE)
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: false });

  if (!data) {
    return [];
  }

  // Group by IP address
  const grouped = data.reduce((acc, row) => {
    const ip = row.ip_address;
    if (!acc[ip]) {
      acc[ip] = {
        ipAddress: ip,
        attemptCount: 0,
        lastAttempt: row.created_at,
      };
    }
    acc[ip].attemptCount++;
    return acc;
  }, {} as Record<string, any>);

  return Object.values(grouped);
}

/**
 * Get security statistics
 */
export async function getSecurityStats(
  days: number = 7
): Promise<{
  totalEvents: number;
  failedLogins: number;
  unauthorizedAccess: number;
  bruteForceAttempts: number;
  suspiciousActivity: number;
}> {
  const supabase = createSupabaseServiceClient();

  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data } = await supabase
    .from('security_logs')
    .select('event_type')
    .gte('created_at', since.toISOString());

  if (!data) {
    return {
      totalEvents: 0,
      failedLogins: 0,
      unauthorizedAccess: 0,
      bruteForceAttempts: 0,
      suspiciousActivity: 0,
    };
  }

  return {
    totalEvents: data.length,
    failedLogins: data.filter(e => e.event_type === SecurityEventType.LOGIN_FAILURE).length,
    unauthorizedAccess: data.filter(e => e.event_type === SecurityEventType.UNAUTHORIZED_ACCESS).length,
    bruteForceAttempts: data.filter(e => e.event_type === SecurityEventType.BRUTE_FORCE_ATTEMPT).length,
    suspiciousActivity: data.filter(e =>
      [SecurityEventType.ACCOUNT_TAKEOVER_ATTEMPT, SecurityEventType.SUSPICIOUS_IP].includes(e.event_type)
    ).length,
  };
}
