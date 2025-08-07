-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('video', 'course');

-- CreateTable
CREATE TABLE "UpcomingContent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "bannerImage" TEXT NOT NULL,
    "releaseDate" TIMESTAMP(3),
    "contentType" "ContentType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UpcomingContent_pkey" PRIMARY KEY ("id")
);
