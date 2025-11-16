-- BE-036, BE-054, BE-058: Add version field for optimistic locking
ALTER TABLE "storage_files" ADD COLUMN IF NOT EXISTS "version" INTEGER NOT NULL DEFAULT 1;

-- BE-037: Add isCorrupted field for file corruption tracking
ALTER TABLE "storage_files" ADD COLUMN IF NOT EXISTS "isCorrupted" BOOLEAN NOT NULL DEFAULT false;

-- BE-009, BE-010: Add thumbnail field for thumbnail support
ALTER TABLE "storage_files" ADD COLUMN IF NOT EXISTS "thumbnail" TEXT;

-- BE-053: Create IdempotencyKey table
CREATE TABLE IF NOT EXISTS "idempotency_keys" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "result" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "idempotency_keys_pkey" PRIMARY KEY ("id")
);

-- Create unique index on key
CREATE UNIQUE INDEX IF NOT EXISTS "idempotency_keys_key_key" ON "idempotency_keys"("key");

-- Create indexes
CREATE INDEX IF NOT EXISTS "idempotency_keys_key_idx" ON "idempotency_keys"("key");
CREATE INDEX IF NOT EXISTS "idempotency_keys_userId_idx" ON "idempotency_keys"("userId");
CREATE INDEX IF NOT EXISTS "idempotency_keys_expiresAt_idx" ON "idempotency_keys"("expiresAt");

-- Add foreign key constraint
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'idempotency_keys_userId_fkey'
    ) THEN
        ALTER TABLE "idempotency_keys" ADD CONSTRAINT "idempotency_keys_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

