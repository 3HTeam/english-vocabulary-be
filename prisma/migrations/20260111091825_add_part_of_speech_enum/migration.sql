/*
  Warnings:

  - Changed the type of `partOfSpeech` on the `Meaning` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "PartOfSpeech" AS ENUM ('noun', 'verb', 'adjective', 'adverb', 'pronoun', 'preposition', 'conjunction', 'interjection', 'determiner', 'article', 'numeral', 'phrasal_verb', 'idiom', 'phrase');

-- AlterTable
ALTER TABLE "Meaning" DROP COLUMN "partOfSpeech",
ADD COLUMN     "partOfSpeech" "PartOfSpeech" NOT NULL;
