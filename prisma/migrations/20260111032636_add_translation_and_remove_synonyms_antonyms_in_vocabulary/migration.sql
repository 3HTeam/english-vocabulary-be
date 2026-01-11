/*
  Warnings:

  - You are about to drop the column `antonyms` on the `Vocabulary` table. All the data in the column will be lost.
  - You are about to drop the column `exampleSentence` on the `Vocabulary` table. All the data in the column will be lost.
  - You are about to drop the column `exampleTranslation` on the `Vocabulary` table. All the data in the column will be lost.
  - You are about to drop the column `synonyms` on the `Vocabulary` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Vocabulary` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Meaning" ADD COLUMN     "antonyms" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "synonyms" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Vocabulary" DROP COLUMN "antonyms",
DROP COLUMN "exampleSentence",
DROP COLUMN "exampleTranslation",
DROP COLUMN "synonyms",
DROP COLUMN "type",
ADD COLUMN     "translation" TEXT;
