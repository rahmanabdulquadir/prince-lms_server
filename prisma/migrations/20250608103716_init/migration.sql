/*
  Warnings:

  - A unique constraint covering the columns `[userId,contentId]` on the table `Progress` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Progress" ADD COLUMN     "isCompleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Progress_userId_contentId_key" ON "Progress"("userId", "contentId");
