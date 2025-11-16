-- ============================================================================
-- PII ENCRYPTION MIGRATION
-- ============================================================================
-- This migration adds PII encryption support using PostgreSQL pgcrypto
-- Encrypts: name, email, phone, address fields in resume data
-- ============================================================================

-- Enable pgcrypto extension for encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- 1. Add encrypted columns to base_resumes table
-- ============================================================================

-- Add encrypted PII columns (will store encrypted JSON)
ALTER TABLE "base_resumes" 
ADD COLUMN IF NOT EXISTS "encrypted_data" BYTEA;

-- Add encryption metadata
ALTER TABLE "base_resumes"
ADD COLUMN IF NOT EXISTS "encryption_version" INTEGER DEFAULT 1;

ALTER TABLE "base_resumes"
ADD COLUMN IF NOT EXISTS "encrypted_at" TIMESTAMP(3);

-- ============================================================================
-- 2. Create encryption key table (for key rotation)
-- ============================================================================

CREATE TABLE IF NOT EXISTS "encryption_keys" (
    "id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "key_hash" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rotated_at" TIMESTAMP(3),

    CONSTRAINT "encryption_keys_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "encryption_keys_version_unique" UNIQUE ("version")
);

CREATE INDEX IF NOT EXISTS "idx_encryption_keys_version" ON "encryption_keys"("version");
CREATE INDEX IF NOT EXISTS "idx_encryption_keys_is_active" ON "encryption_keys"("is_active");

-- ============================================================================
-- 3. Create PII access log table
-- ============================================================================

CREATE TABLE IF NOT EXISTS "pii_access_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "resource_type" TEXT NOT NULL, -- "resume", "user_profile", etc.
    "resource_id" TEXT NOT NULL,
    "action" TEXT NOT NULL, -- "read", "write", "export", "delete"
    "ip_address" TEXT,
    "user_agent" TEXT,
    "accessed_fields" TEXT[], -- ["name", "email", "phone"]
    "reason" TEXT, -- "user_request", "admin_access", "export", etc.
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pii_access_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "idx_pii_access_logs_user_id" ON "pii_access_logs"("user_id");
CREATE INDEX IF NOT EXISTS "idx_pii_access_logs_resource" ON "pii_access_logs"("resource_type", "resource_id");
CREATE INDEX IF NOT EXISTS "idx_pii_access_logs_created_at" ON "pii_access_logs"("created_at");
CREATE INDEX IF NOT EXISTS "idx_pii_access_logs_action" ON "pii_access_logs"("action");

-- ============================================================================
-- 4. Create data retention policy table
-- ============================================================================

CREATE TABLE IF NOT EXISTS "data_retention_policies" (
    "id" TEXT NOT NULL,
    "resource_type" TEXT NOT NULL, -- "resume", "ai_log", "export_file", etc.
    "retention_days" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "data_retention_policies_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "data_retention_policies_resource_type_unique" UNIQUE ("resource_type")
);

-- Insert default retention policies
INSERT INTO "data_retention_policies" ("id", "resource_type", "retention_days", "is_active", "created_at", "updated_at")
VALUES 
    ('drp_1', 'deleted_resume', 30, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('drp_2', 'ai_request_log', 90, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('drp_3', 'export_file', 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('drp_4', 'pii_access_log', 365, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('drp_5', 'audit_log', 730, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("resource_type") DO NOTHING;

-- ============================================================================
-- 5. Create GDPR data export requests table
-- ============================================================================

CREATE TABLE IF NOT EXISTS "gdpr_data_requests" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "request_type" TEXT NOT NULL, -- "export", "delete"
    "status" TEXT NOT NULL DEFAULT 'pending', -- "pending", "processing", "completed", "failed"
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "export_url" TEXT, -- For export requests
    "expires_at" TIMESTAMP(3), -- Export URL expiration
    "error_message" TEXT,

    CONSTRAINT "gdpr_data_requests_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "idx_gdpr_data_requests_user_id" ON "gdpr_data_requests"("user_id");
CREATE INDEX IF NOT EXISTS "idx_gdpr_data_requests_status" ON "gdpr_data_requests"("status");
CREATE INDEX IF NOT EXISTS "idx_gdpr_data_requests_requested_at" ON "gdpr_data_requests"("requested_at");

-- ============================================================================
-- 6. Create user consent table
-- ============================================================================

CREATE TABLE IF NOT EXISTS "user_consents" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "consent_type" TEXT NOT NULL, -- "ai_processing", "data_analytics", "marketing"
    "granted" BOOLEAN NOT NULL DEFAULT false,
    "granted_at" TIMESTAMP(3),
    "revoked_at" TIMESTAMP(3),
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_consents_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "unique_user_consent_type" ON "user_consents"("user_id", "consent_type");
CREATE INDEX IF NOT EXISTS "idx_user_consents_user_id" ON "user_consents"("user_id");
CREATE INDEX IF NOT EXISTS "idx_user_consents_consent_type" ON "user_consents"("consent_type");

-- ============================================================================
-- 7. Create 2FA table
-- ============================================================================

CREATE TABLE IF NOT EXISTS "two_factor_auth" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "secret" TEXT NOT NULL, -- TOTP secret (encrypted)
    "backup_codes" TEXT[], -- Encrypted backup codes
    "is_enabled" BOOLEAN NOT NULL DEFAULT false,
    "enabled_at" TIMESTAMP(3),
    "last_used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "two_factor_auth_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "two_factor_auth_user_id_unique" UNIQUE ("user_id")
);

CREATE INDEX IF NOT EXISTS "idx_two_factor_auth_user_id" ON "two_factor_auth"("user_id");
CREATE INDEX IF NOT EXISTS "idx_two_factor_auth_is_enabled" ON "two_factor_auth"("is_enabled");

-- ============================================================================
-- 8. Create 2FA verification attempts table
-- ============================================================================

CREATE TABLE IF NOT EXISTS "two_factor_attempts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "attempted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "two_factor_attempts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "idx_two_factor_attempts_user_id" ON "two_factor_attempts"("user_id");
CREATE INDEX IF NOT EXISTS "idx_two_factor_attempts_attempted_at" ON "two_factor_attempts"("attempted_at");

-- ============================================================================
-- 9. Create session management table
-- ============================================================================

CREATE TABLE IF NOT EXISTS "user_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "refresh_token_hash" TEXT NOT NULL,
    "access_token_hash" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_activity_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "idx_user_sessions_user_id" ON "user_sessions"("user_id");
CREATE INDEX IF NOT EXISTS "idx_user_sessions_refresh_token_hash" ON "user_sessions"("refresh_token_hash");
CREATE INDEX IF NOT EXISTS "idx_user_sessions_is_active" ON "user_sessions"("is_active");
CREATE INDEX IF NOT EXISTS "idx_user_sessions_expires_at" ON "user_sessions"("expires_at");

-- ============================================================================
-- 10. Create suspicious activity log table
-- ============================================================================

CREATE TABLE IF NOT EXISTS "suspicious_activities" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "activity_type" TEXT NOT NULL, -- "login_new_country", "high_api_requests", "failed_login_attempts"
    "severity" TEXT NOT NULL DEFAULT 'medium', -- "low", "medium", "high", "critical"
    "details" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "is_resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolved_at" TIMESTAMP(3),
    "detected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "suspicious_activities_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "idx_suspicious_activities_user_id" ON "suspicious_activities"("user_id");
CREATE INDEX IF NOT EXISTS "idx_suspicious_activities_activity_type" ON "suspicious_activities"("activity_type");
CREATE INDEX IF NOT EXISTS "idx_suspicious_activities_severity" ON "suspicious_activities"("severity");
CREATE INDEX IF NOT EXISTS "idx_suspicious_activities_is_resolved" ON "suspicious_activities"("is_resolved");
CREATE INDEX IF NOT EXISTS "idx_suspicious_activities_detected_at" ON "suspicious_activities"("detected_at");

-- ============================================================================
-- 11. Create login attempts table (for rate limiting)
-- ============================================================================

CREATE TABLE IF NOT EXISTS "login_attempts" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "user_id" TEXT,
    "ip_address" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "failure_reason" TEXT,
    "attempted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_attempts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "idx_login_attempts_email" ON "login_attempts"("email");
CREATE INDEX IF NOT EXISTS "idx_login_attempts_ip_address" ON "login_attempts"("ip_address");
CREATE INDEX IF NOT EXISTS "idx_login_attempts_attempted_at" ON "login_attempts"("attempted_at");
CREATE INDEX IF NOT EXISTS "idx_login_attempts_success" ON "login_attempts"("success");

-- ============================================================================
-- 12. Add password policy fields to users table (if not exists)
-- ============================================================================

-- Note: This assumes a users table exists. Adjust table name as needed.
-- ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_changed_at" TIMESTAMP(3);
-- ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_reset_required" BOOLEAN DEFAULT false;
-- ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_login_at" TIMESTAMP(3);
-- ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_login_ip" TEXT;

-- ============================================================================
-- 13. Create helper functions for encryption
-- ============================================================================

-- Function to encrypt PII data
CREATE OR REPLACE FUNCTION encrypt_pii(data TEXT, key TEXT)
RETURNS BYTEA AS $$
BEGIN
    RETURN pgp_sym_encrypt(data, key);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrypt PII data
CREATE OR REPLACE FUNCTION decrypt_pii(encrypted_data BYTEA, key TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN pgp_sym_decrypt(encrypted_data, key);
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Add comments for documentation
COMMENT ON TABLE "pii_access_logs" IS 'Logs all access to Personally Identifiable Information (PII)';
COMMENT ON TABLE "data_retention_policies" IS 'Defines how long different types of data should be retained';
COMMENT ON TABLE "gdpr_data_requests" IS 'Tracks GDPR data export and deletion requests';
COMMENT ON TABLE "user_consents" IS 'Tracks user consent for various data processing activities';
COMMENT ON TABLE "two_factor_auth" IS 'Stores 2FA secrets and backup codes for users';
COMMENT ON TABLE "user_sessions" IS 'Tracks active user sessions for security monitoring';
COMMENT ON TABLE "suspicious_activities" IS 'Logs suspicious activities for security monitoring';
COMMENT ON TABLE "login_attempts" IS 'Tracks login attempts for rate limiting and security';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'PII encryption and security tables created successfully';
END $$;

