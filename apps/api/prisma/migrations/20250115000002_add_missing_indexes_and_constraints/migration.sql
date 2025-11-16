-- DB-042: Add missing indexes for frequently queried fields
-- DB-043: Add composite indexes for common query patterns

-- Storage Files Indexes
CREATE INDEX IF NOT EXISTS "storage_files_createdAt_idx" ON "storage_files"("createdAt");
CREATE INDEX IF NOT EXISTS "storage_files_updatedAt_idx" ON "storage_files"("updatedAt");
CREATE INDEX IF NOT EXISTS "storage_files_userId_deletedAt_type_idx" ON "storage_files"("userId", "deletedAt", "type");
CREATE INDEX IF NOT EXISTS "storage_files_userId_isStarred_deletedAt_idx" ON "storage_files"("userId", "isStarred", "deletedAt");
CREATE INDEX IF NOT EXISTS "storage_files_userId_isArchived_deletedAt_idx" ON "storage_files"("userId", "isArchived", "deletedAt");
CREATE INDEX IF NOT EXISTS "storage_files_userId_folderId_deletedAt_idx" ON "storage_files"("userId", "folderId", "deletedAt");
CREATE INDEX IF NOT EXISTS "storage_files_userId_createdAt_idx" ON "storage_files"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "storage_files_userId_updatedAt_idx" ON "storage_files"("userId", "updatedAt");

-- Storage Folders Indexes
CREATE INDEX IF NOT EXISTS "storage_folders_createdAt_idx" ON "storage_folders"("createdAt");
CREATE INDEX IF NOT EXISTS "storage_folders_updatedAt_idx" ON "storage_folders"("updatedAt");
CREATE INDEX IF NOT EXISTS "storage_folders_userId_deletedAt_idx" ON "storage_folders"("userId", "deletedAt");
CREATE INDEX IF NOT EXISTS "storage_folders_userId_parentId_deletedAt_idx" ON "storage_folders"("userId", "parentId", "deletedAt");

-- File Access Logs Indexes
CREATE INDEX IF NOT EXISTS "file_access_logs_action_idx" ON "file_access_logs"("action");
CREATE INDEX IF NOT EXISTS "file_access_logs_fileId_createdAt_idx" ON "file_access_logs"("fileId", "createdAt");
CREATE INDEX IF NOT EXISTS "file_access_logs_userId_createdAt_idx" ON "file_access_logs"("userId", "createdAt");

-- File Comments Indexes
CREATE INDEX IF NOT EXISTS "file_comments_createdAt_idx" ON "file_comments"("createdAt");
CREATE INDEX IF NOT EXISTS "file_comments_updatedAt_idx" ON "file_comments"("updatedAt");
CREATE INDEX IF NOT EXISTS "file_comments_fileId_createdAt_idx" ON "file_comments"("fileId", "createdAt");
CREATE INDEX IF NOT EXISTS "file_comments_fileId_parentId_idx" ON "file_comments"("fileId", "parentId");

-- File Shares Indexes
CREATE INDEX IF NOT EXISTS "file_shares_createdAt_idx" ON "file_shares"("createdAt");
CREATE INDEX IF NOT EXISTS "file_shares_userId_idx" ON "file_shares"("userId");
CREATE INDEX IF NOT EXISTS "file_shares_sharedWith_createdAt_idx" ON "file_shares"("sharedWith", "createdAt");
CREATE INDEX IF NOT EXISTS "file_shares_fileId_createdAt_idx" ON "file_shares"("fileId", "createdAt");

-- Share Links Indexes
CREATE INDEX IF NOT EXISTS "share_links_createdAt_idx" ON "share_links"("createdAt");
CREATE INDEX IF NOT EXISTS "share_links_userId_idx" ON "share_links"("userId");
CREATE INDEX IF NOT EXISTS "share_links_expiresAt_idx" ON "share_links"("expiresAt");
CREATE INDEX IF NOT EXISTS "share_links_fileId_createdAt_idx" ON "share_links"("fileId", "createdAt");
CREATE INDEX IF NOT EXISTS "share_links_userId_expiresAt_idx" ON "share_links"("userId", "expiresAt");

