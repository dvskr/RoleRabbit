-- Security Features Migration
-- Adds tables and columns for security enhancements

-- 1. Add consent columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS ai_processing_consent BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS analytics_consent BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT false;

-- 2. Create token blacklist table (for logout/token revocation)
CREATE TABLE IF NOT EXISTS token_blacklist (
    id TEXT PRIMARY KEY,
    token TEXT NOT NULL UNIQUE,
    user_id TEXT NOT NULL,
    expires_at TIMESTAMP(3) NOT NULL,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_token_blacklist_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_token_blacklist_token ON token_blacklist(token);
CREATE INDEX IF NOT EXISTS idx_token_blacklist_expires_at ON token_blacklist(expires_at);
CREATE INDEX IF NOT EXISTS idx_token_blacklist_user_id ON token_blacklist(user_id);

-- 3. Create audit_logs table (if not exists)
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    ip_address TEXT,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_audit_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs(resource_type);

-- 4. Enable pgcrypto extension for PII encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 5. Add indexes for security queries
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);

-- 6. Add constraint for email format validation
ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS email_format_check 
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- 7. Create function to automatically cleanup expired tokens
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS void AS $$
BEGIN
    DELETE FROM token_blacklist WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- 8. Create scheduled job to run cleanup (requires pg_cron extension)
-- Uncomment if pg_cron is available:
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- SELECT cron.schedule('cleanup-tokens', '0 * * * *', 'SELECT cleanup_expired_tokens()');

COMMENT ON TABLE token_blacklist IS 'Stores revoked JWT tokens for logout functionality';
COMMENT ON TABLE audit_logs IS 'Stores audit trail for security and compliance';
COMMENT ON COLUMN users.ai_processing_consent IS 'User consent for AI processing (GDPR compliance)';
COMMENT ON COLUMN users.analytics_consent IS 'User consent for analytics tracking';
COMMENT ON COLUMN users.marketing_consent IS 'User consent for marketing communications';

