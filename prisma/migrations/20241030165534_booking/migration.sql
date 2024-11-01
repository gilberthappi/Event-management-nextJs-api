/*
  Warnings:

  - Added the required column `emailForBooking` to the `Bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phoneForBooking` to the `Bookings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Bookings" ADD COLUMN     "emailForBooking" TEXT NOT NULL,
ADD COLUMN     "phoneForBooking" TEXT NOT NULL;
