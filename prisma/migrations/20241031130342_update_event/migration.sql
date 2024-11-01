/*
  Warnings:

  - Made the column `bookingDeadline` on table `Event` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "bookingDeadline" SET NOT NULL,
ALTER COLUMN "bookingDeadline" SET DEFAULT CURRENT_TIMESTAMP;
