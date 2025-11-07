-- Note: cloud_files table removed, storageLimit and storageTier fields removed from users
-- This migration creates billing-related tables and handles missing users table gracefully

-- Create subscriptions table if it doesn't exist
CREATE TABLE IF NOT EXISTS "subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "billingInterval" TEXT NOT NULL DEFAULT 'monthly',
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "trialEndsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- Create invoices table if it doesn't exist
CREATE TABLE IF NOT EXISTS "invoices" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'paid',
    "plan" TEXT NOT NULL,
    "billingInterval" TEXT NOT NULL,
    "invoiceDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "invoiceUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- Create payment_methods table if it doesn't exist
CREATE TABLE IF NOT EXISTS "payment_methods" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "brand" TEXT,
    "last4" TEXT,
    "expiryMonth" INTEGER,
    "expiryYear" INTEGER,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id")
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS "subscriptions_userId_idx" ON "subscriptions"("userId");
CREATE INDEX IF NOT EXISTS "subscriptions_status_idx" ON "subscriptions"("status");
CREATE INDEX IF NOT EXISTS "invoices_subscriptionId_idx" ON "invoices"("subscriptionId");
CREATE INDEX IF NOT EXISTS "invoices_userId_idx" ON "invoices"("userId");
CREATE INDEX IF NOT EXISTS "payment_methods_userId_idx" ON "payment_methods"("userId");

-- Add foreign keys only if users table exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'users'
  ) THEN
    -- Add subscription foreign key if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'subscriptions_userId_fkey'
    ) THEN
      ALTER TABLE "subscriptions" 
      ADD CONSTRAINT "subscriptions_userId_fkey" 
      FOREIGN KEY ("userId") 
      REFERENCES "users"("id") 
      ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    -- Add invoice foreign keys if they don't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'invoices_subscriptionId_fkey'
    ) THEN
      ALTER TABLE "invoices" 
      ADD CONSTRAINT "invoices_subscriptionId_fkey" 
      FOREIGN KEY ("subscriptionId") 
      REFERENCES "subscriptions"("id") 
      ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'invoices_userId_fkey'
    ) THEN
      ALTER TABLE "invoices" 
      ADD CONSTRAINT "invoices_userId_fkey" 
      FOREIGN KEY ("userId") 
      REFERENCES "users"("id") 
      ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    -- Add payment_methods foreign key if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'payment_methods_userId_fkey'
    ) THEN
      ALTER TABLE "payment_methods" 
      ADD CONSTRAINT "payment_methods_userId_fkey" 
      FOREIGN KEY ("userId") 
      REFERENCES "users"("id") 
      ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
  END IF;
END $$;
