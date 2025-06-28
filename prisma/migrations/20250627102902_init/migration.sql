/*
  Warnings:

  - You are about to drop the column `isVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `otp` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `otpExpiresAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `otpType` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "OtpVerification" DROP CONSTRAINT "OtpVerification_userId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "isVerified",
DROP COLUMN "otp",
DROP COLUMN "otpExpiresAt",
DROP COLUMN "otpType";

-- AddForeignKey
ALTER TABLE "OtpVerification" ADD CONSTRAINT "OtpVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "PendingUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
