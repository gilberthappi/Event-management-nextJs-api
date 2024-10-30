/*
  Warnings:

  - The values [STUDENT,TRAINER,SUPERVISOR,SCHOOL_ADMIN,SCHOOL_USER] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `BookingDeadline` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('ADMIN', 'COMPANY_ADMIN', 'COMPANY_USER', 'USER');
ALTER TABLE "UserRoles" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "BookingDeadline",
ADD COLUMN     "bookingDeadline" TIMESTAMP(3);

-- DropTable
DROP TABLE "Notification";
