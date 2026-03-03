/*
  Warnings:

  - You are about to drop the column `levelId` on the `GrammarTopic` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "GrammarTopic" DROP CONSTRAINT "GrammarTopic_levelId_fkey";

-- DropIndex
DROP INDEX "GrammarTopic_levelId_idx";

-- AlterTable
ALTER TABLE "GrammarTopic" DROP COLUMN "levelId";
