-- Add guest user fields to User model
ALTER TABLE "users" ADD COLUMN "isGuest" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN "guestUpgradedAt" TIMESTAMP;
ALTER TABLE "users" ADD COLUMN "guestUpgradedToId" TEXT;