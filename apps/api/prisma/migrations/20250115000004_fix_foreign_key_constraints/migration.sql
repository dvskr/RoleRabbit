-- DB-045: Add database-level foreign key constraints if missing
-- DB-046: Add cascade delete rules where appropriate (verify CASCADE vs SET NULL)

-- Fix storage_files.folderId to use SET NULL on delete (folder deleted, files remain)
DO $$ 
BEGIN
    -- Drop existing constraint if it exists
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'storage_files_folderId_fkey'
    ) THEN
        ALTER TABLE "storage_files" DROP CONSTRAINT "storage_files_folderId_fkey";
    END IF;
    
    -- Add constraint with SET NULL
    ALTER TABLE "storage_files" ADD CONSTRAINT "storage_files_folderId_fkey" 
    FOREIGN KEY ("folderId") REFERENCES "storage_folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
END $$;

-- Fix storage_files.uploadedBy to use SET NULL on delete (user deleted, file remains)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'storage_files_uploadedBy_fkey'
    ) THEN
        ALTER TABLE "storage_files" DROP CONSTRAINT "storage_files_uploadedBy_fkey";
    END IF;
    
    ALTER TABLE "storage_files" ADD CONSTRAINT "storage_files_uploadedBy_fkey" 
    FOREIGN KEY ("uploadedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
END $$;

-- Fix storage_files.modifiedBy to use SET NULL on delete
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'storage_files_modifiedBy_fkey'
    ) THEN
        ALTER TABLE "storage_files" DROP CONSTRAINT "storage_files_modifiedBy_fkey";
    END IF;
    
    ALTER TABLE "storage_files" ADD CONSTRAINT "storage_files_modifiedBy_fkey" 
    FOREIGN KEY ("modifiedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
END $$;

-- Fix file_comments.editedBy to use SET NULL on delete
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'file_comments_editedBy_fkey'
    ) THEN
        ALTER TABLE "file_comments" DROP CONSTRAINT "file_comments_editedBy_fkey";
    END IF;
    
    ALTER TABLE "file_comments" ADD CONSTRAINT "file_comments_editedBy_fkey" 
    FOREIGN KEY ("editedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
END $$;

