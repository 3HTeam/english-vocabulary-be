/*
  Warnings:

  - You are about to drop the `OnboardingScreen` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "OnboardingScreen";

-- CreateTable
CREATE TABLE "Onboarding" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT,
    "description" TEXT,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Onboarding_pkey" PRIMARY KEY ("id")
);
