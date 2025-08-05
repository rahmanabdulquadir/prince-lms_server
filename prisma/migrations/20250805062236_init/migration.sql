/*
  Warnings:

  - You are about to drop the `UserContentProgress` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserContentProgress" DROP CONSTRAINT "UserContentProgress_contentId_fkey";

-- DropForeignKey
ALTER TABLE "UserContentProgress" DROP CONSTRAINT "UserContentProgress_userId_fkey";

-- AlterTable
ALTER TABLE "Like" ADD COLUMN     "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "UserContentProgress";
