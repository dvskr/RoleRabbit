-- ============================================================================
-- RBAC (Role-Based Access Control) Migration
-- ============================================================================
-- Adds user roles and resume sharing permissions
-- ============================================================================

-- ============================================================================
-- 1. Add role column to users table
-- ============================================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';

-- Add constraint for valid roles
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('admin', 'user'));

-- Create index on role
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ============================================================================
-- 2. Create resume sharing permissions table
-- ============================================================================

CREATE TABLE IF NOT EXISTS resume_share_permissions (
    id TEXT PRIMARY KEY,
    resume_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    permission TEXT NOT NULL, -- 'owner', 'editor', 'viewer'
    shared_by TEXT NOT NULL, -- User ID who shared
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_resume_share_resume FOREIGN KEY (resume_id) 
      REFERENCES base_resumes(id) ON DELETE CASCADE,
    CONSTRAINT fk_resume_share_user FOREIGN KEY (user_id) 
      REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_resume_share_shared_by FOREIGN KEY (shared_by) 
      REFERENCES users(id) ON DELETE CASCADE
);

-- Add constraint for valid permissions
ALTER TABLE resume_share_permissions DROP CONSTRAINT IF EXISTS permission_check;
ALTER TABLE resume_share_permissions ADD CONSTRAINT permission_check 
  CHECK (permission IN ('owner', 'editor', 'viewer'));

-- Unique constraint: one permission per user per resume
CREATE UNIQUE INDEX IF NOT EXISTS unique_resume_user_permission 
  ON resume_share_permissions(resume_id, user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_resume_share_resume_id 
  ON resume_share_permissions(resume_id);
CREATE INDEX IF NOT EXISTS idx_resume_share_user_id 
  ON resume_share_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_share_shared_by 
  ON resume_share_permissions(shared_by);
CREATE INDEX IF NOT EXISTS idx_resume_share_is_active 
  ON resume_share_permissions(is_active);

-- ============================================================================
-- 3. Create resume sharing audit log table
-- ============================================================================

CREATE TABLE IF NOT EXISTS resume_share_audit (
    id TEXT PRIMARY KEY,
    resume_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    action TEXT NOT NULL, -- 'shared', 'revoked', 'permission_changed'
    permission TEXT, -- New permission level
    previous_permission TEXT, -- Previous permission level (for changes)
    performed_by TEXT NOT NULL, -- User who performed the action
    ip_address TEXT,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_share_audit_resume FOREIGN KEY (resume_id) 
      REFERENCES base_resumes(id) ON DELETE CASCADE,
    CONSTRAINT fk_share_audit_user FOREIGN KEY (user_id) 
      REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_share_audit_performed_by FOREIGN KEY (performed_by) 
      REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_share_audit_resume_id 
  ON resume_share_audit(resume_id);
CREATE INDEX IF NOT EXISTS idx_share_audit_user_id 
  ON resume_share_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_share_audit_created_at 
  ON resume_share_audit(created_at);

-- ============================================================================
-- 4. Update existing users to have 'user' role
-- ============================================================================

UPDATE users 
SET role = 'user' 
WHERE role IS NULL OR role = '';

-- ============================================================================
-- 5. Create admin user (optional - uncomment and update)
-- ============================================================================

-- INSERT INTO users (id, email, name, role, password, created_at, updated_at)
-- VALUES (
--   'admin-user-id',
--   'admin@roleready.com',
--   'Admin User',
--   'admin',
--   '$2b$10$...' -- Hash of admin password
--   NOW(),
--   NOW()
-- )
-- ON CONFLICT (email) DO UPDATE SET role = 'admin';

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON COLUMN users.role IS 'User role: admin (full access) or user (own resources only)';
COMMENT ON TABLE resume_share_permissions IS 'Manages resume sharing permissions between users';
COMMENT ON TABLE resume_share_audit IS 'Audit trail for resume sharing actions';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'RBAC tables and columns created successfully';
END $$;

