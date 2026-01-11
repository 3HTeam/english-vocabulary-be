/*
  Warnings:

  - You are about to drop the column `meaning` on the `Vocabulary` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Vocabulary" DROP COLUMN "meaning";

-- CreateTable
CREATE TABLE "Meaning" (
    "id" TEXT NOT NULL,
    "vocabularyId" TEXT NOT NULL,
    "partOfSpeech" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Meaning_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Definition" (
    "id" TEXT NOT NULL,
    "definition" TEXT NOT NULL,
    "translation" TEXT,
    "example" TEXT,
    "exampleTranslation" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "meaningId" TEXT NOT NULL,

    CONSTRAINT "Definition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Meaning_vocabularyId_idx" ON "Meaning"("vocabularyId");

-- CreateIndex
CREATE INDEX "Definition_meaningId_idx" ON "Definition"("meaningId");

-- AddForeignKey
ALTER TABLE "Meaning" ADD CONSTRAINT "Meaning_vocabularyId_fkey" FOREIGN KEY ("vocabularyId") REFERENCES "Vocabulary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Definition" ADD CONSTRAINT "Definition_meaningId_fkey" FOREIGN KEY ("meaningId") REFERENCES "Meaning"("id") ON DELETE CASCADE ON UPDATE CASCADE;
