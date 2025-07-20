-- DropForeignKey
ALTER TABLE "OtpVerification" DROP CONSTRAINT "OtpVerification_userId_fkey";

-- AlterTable
ALTER TABLE "OtpVerification" ADD COLUMN     "context" TEXT;
