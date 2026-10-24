/*
  Warnings:

  - Added the required column `title` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN     "hourlyRateCents" INTEGER;

-- AlterTable
ALTER TABLE "TimeEntry" ADD COLUMN     "earningsCents" INTEGER,
ADD COLUMN     "rateSnapshotCents" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "preferredLocale" TEXT NOT NULL DEFAULT 'en';
