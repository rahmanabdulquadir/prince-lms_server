-- DropForeignKey
ALTER TABLE "OtpVerification" DROP CONSTRAINT "OtpVerification_userId_fkey";

-- AddForeignKey
ALTER TABLE "OtpVerification" ADD CONSTRAINT "OtpVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "PendingUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
