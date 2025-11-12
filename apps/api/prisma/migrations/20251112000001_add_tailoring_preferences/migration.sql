-- AlterTable
ALTER TABLE "roleready"."users" 
ADD COLUMN IF NOT EXISTS "tailorPreferredMode" "roleready"."TailorMode" DEFAULT 'PARTIAL',
ADD COLUMN IF NOT EXISTS "tailorPreferredTone" TEXT DEFAULT 'professional',
ADD COLUMN IF NOT EXISTS "tailorPreferredLength" TEXT DEFAULT 'thorough';

-- Comment
COMMENT ON COLUMN "roleready"."users"."tailorPreferredMode" IS 'User preferred tailoring mode (PARTIAL or FULL)';
COMMENT ON COLUMN "roleready"."users"."tailorPreferredTone" IS 'User preferred writing tone (professional, technical, creative, casual)';
COMMENT ON COLUMN "roleready"."users"."tailorPreferredLength" IS 'User preferred response length (concise or thorough)';

