/*
  Warnings:

  - You are about to drop the column `facebook` on the `Setting` table. All the data in the column will be lost.
  - You are about to drop the column `instagram` on the `Setting` table. All the data in the column will be lost.
  - You are about to drop the column `tiktok` on the `Setting` table. All the data in the column will be lost.
  - You are about to drop the column `twitter` on the `Setting` table. All the data in the column will be lost.
  - You are about to drop the column `youtube` on the `Setting` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Setting" DROP COLUMN "facebook",
DROP COLUMN "instagram",
DROP COLUMN "tiktok",
DROP COLUMN "twitter",
DROP COLUMN "youtube";

-- CreateTable
CREATE TABLE "Social" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "settingId" TEXT NOT NULL,

    CONSTRAINT "Social_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Social_settingId_idx" ON "Social"("settingId");

-- AddForeignKey
ALTER TABLE "Social" ADD CONSTRAINT "Social_settingId_fkey" FOREIGN KEY ("settingId") REFERENCES "Setting"("id") ON DELETE CASCADE ON UPDATE CASCADE;
