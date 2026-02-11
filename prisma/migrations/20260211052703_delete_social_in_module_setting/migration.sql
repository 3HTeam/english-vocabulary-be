/*
  Warnings:

  - You are about to drop the `Social` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Social" DROP CONSTRAINT "Social_settingId_fkey";

-- AlterTable
ALTER TABLE "Setting" ADD COLUMN     "facebook" TEXT,
ADD COLUMN     "instagram" TEXT,
ADD COLUMN     "tiktok" TEXT,
ADD COLUMN     "twitter" TEXT,
ADD COLUMN     "youtube" TEXT;

-- DropTable
DROP TABLE "Social";
