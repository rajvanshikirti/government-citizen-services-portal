-- AlterTable
ALTER TABLE "documents" ADD COLUMN "isVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "documents" ADD COLUMN "verifiedBy" TEXT;
ALTER TABLE "documents" ADD COLUMN "verifiedAt" TIMESTAMP(3);
