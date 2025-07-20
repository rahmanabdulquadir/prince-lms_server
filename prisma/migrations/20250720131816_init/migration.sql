/*
  Warnings:

  - You are about to drop the column `context` on the `OtpVerification` table. All the data in the column will be lost.
  - You are about to drop the column `isVerified` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "OtpVerification" DROP COLUMN "context";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "isVerified";

-- AddForeignKey
ALTER TABLE "OtpVerification" ADD CONSTRAINT "OtpVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "PendingUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
