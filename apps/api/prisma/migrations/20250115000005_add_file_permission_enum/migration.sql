-- Migration: Add FilePermission enum and convert permission columns from TEXT to enum
-- DB-021, DB-026: Convert permission columns to use FilePermission enum

-- Create FilePermission enum type
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'FilePermission') THEN
        CREATE TYPE "FilePermission" AS ENUM ('VIEW', 'COMMENT', 'EDIT', 'ADMIN');
    END IF;
END $$;

-- Convert file_shares.permission from TEXT to FilePermission enum
DO $$
BEGIN
    -- Check if column exists and is TEXT type
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'file_shares' 
        AND column_name = 'permission'
        AND data_type = 'text'
    ) THEN
        -- Map common lowercase values to uppercase
        UPDATE "file_shares" 
        SET "permission" = 'VIEW' 
        WHERE LOWER("permission") = 'view';
        
        UPDATE "file_shares" 
        SET "permission" = 'COMMENT' 
        WHERE LOWER("permission") = 'comment';
        
        UPDATE "file_shares" 
        SET "permission" = 'EDIT' 
        WHERE LOWER("permission") = 'edit';
        
        UPDATE "file_shares" 
        SET "permission" = 'ADMIN' 
        WHERE LOWER("permission") = 'admin';
        
        -- Set default to VIEW for any invalid values
        UPDATE "file_shares" 
        SET "permission" = 'VIEW' 
        WHERE LOWER("permission") NOT IN ('view', 'comment', 'edit', 'admin');
        
        -- Drop default before altering type
        ALTER TABLE "file_shares" 
        ALTER COLUMN "permission" DROP DEFAULT;
        
        -- Alter column type to enum
        ALTER TABLE "file_shares" 
        ALTER COLUMN "permission" TYPE "FilePermission" 
        USING CASE 
            WHEN LOWER("permission") = 'view' THEN 'VIEW'::"FilePermission"
            WHEN LOWER("permission") = 'comment' THEN 'COMMENT'::"FilePermission"
            WHEN LOWER("permission") = 'edit' THEN 'EDIT'::"FilePermission"
            WHEN LOWER("permission") = 'admin' THEN 'ADMIN'::"FilePermission"
            ELSE 'VIEW'::"FilePermission"
        END;
        
        -- Set default value
        ALTER TABLE "file_shares" 
        ALTER COLUMN "permission" SET DEFAULT 'VIEW'::"FilePermission";
    END IF;
END $$;

-- Convert share_links.permission from TEXT to FilePermission enum
DO $$
BEGIN
    -- Check if column exists and is TEXT type
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'share_links' 
        AND column_name = 'permission'
        AND data_type = 'text'
    ) THEN
        -- Convert existing values to uppercase and validate
        UPDATE "share_links" 
        SET "permission" = UPPER("permission") 
        WHERE "permission" IS NOT NULL
        AND "permission" NOT IN ('VIEW', 'COMMENT', 'EDIT', 'ADMIN');
        
        -- Map common lowercase values to enum
        UPDATE "share_links" 
        SET "permission" = 'VIEW' 
        WHERE LOWER("permission") = 'view';
        
        UPDATE "share_links" 
        SET "permission" = 'COMMENT' 
        WHERE LOWER("permission") = 'comment';
        
        UPDATE "share_links" 
        SET "permission" = 'EDIT' 
        WHERE LOWER("permission") = 'edit';
        
        UPDATE "share_links" 
        SET "permission" = 'ADMIN' 
        WHERE LOWER("permission") = 'admin';
        
        -- Set default to VIEW for any invalid values (do this after converting to uppercase)
        UPDATE "share_links" 
        SET "permission" = 'VIEW' 
        WHERE LOWER("permission") NOT IN ('view', 'comment', 'edit', 'admin');
        
        -- Alter column type to enum
        ALTER TABLE "share_links" 
        ALTER COLUMN "permission" DROP DEFAULT;
        
        ALTER TABLE "share_links" 
        ALTER COLUMN "permission" TYPE "FilePermission" 
        USING CASE 
            WHEN LOWER("permission") = 'view' THEN 'VIEW'::"FilePermission"
            WHEN LOWER("permission") = 'comment' THEN 'COMMENT'::"FilePermission"
            WHEN LOWER("permission") = 'edit' THEN 'EDIT'::"FilePermission"
            WHEN LOWER("permission") = 'admin' THEN 'ADMIN'::"FilePermission"
            ELSE 'VIEW'::"FilePermission"
        END;
        
        -- Set default value
        ALTER TABLE "share_links" 
        ALTER COLUMN "permission" SET DEFAULT 'VIEW'::"FilePermission";
    END IF;
END $$;

