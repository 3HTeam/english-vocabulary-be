/*
  Warnings:

  - You are about to drop the column `example` on the `Vocabulary` table. All the data in the column will be lost.
  - You are about to drop the column `term` on the `Vocabulary` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[topicId,word]` on the table `Vocabulary` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `word` to the `Vocabulary` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Vocabulary_topicId_term_key";

-- AlterTable
ALTER TABLE "Vocabulary" DROP COLUMN "example",
DROP COLUMN "term",
ADD COLUMN     "antonyms" TEXT[],
ADD COLUMN     "audioUrl" TEXT,
ADD COLUMN     "exampleSentence" TEXT,
ADD COLUMN     "exampleTranslation" TEXT,
ADD COLUMN     "phonetic" TEXT,
ADD COLUMN     "synonyms" TEXT[],
ADD COLUMN     "type" TEXT,
ADD COLUMN     "word" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Vocabulary_topicId_word_key" ON "Vocabulary"("topicId", "word");
