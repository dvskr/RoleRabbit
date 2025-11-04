-- Alter education table to support extended education fields
ALTER TABLE "education"
  RENAME COLUMN "graduationDate" TO "endDate";

ALTER TABLE "education"
  ADD COLUMN     "startDate" TEXT,
  ADD COLUMN     "gpa" TEXT,
  ADD COLUMN     "honors" TEXT,
  ADD COLUMN     "location" TEXT;

