/*
  Warnings:

  - You are about to drop the column `code` on the `Level` table. All the data in the column will be lost.
  - You are about to drop the `GrammarExercise` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Lesson` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LessonExercise` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LessonGrammar` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LessonVocabulary` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserGrammarExerciseAnswer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserLessonExerciseAnswer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserLessonProgress` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[cefrLevel]` on the table `Level` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cefrLevel` to the `Level` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ExerciseCategory" AS ENUM ('GRAMMAR', 'VOCABULARY', 'READING', 'LISTENING', 'PRONUNCIATION');

-- CreateEnum
CREATE TYPE "ExamType" AS ENUM ('TOEIC', 'IELTS');

-- CreateEnum
CREATE TYPE "ScoreType" AS ENUM ('NUMERIC', 'BAND');

-- CreateEnum
CREATE TYPE "SectionType" AS ENUM ('LISTENING', 'READING', 'WRITING', 'SPEAKING');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'AUDIO', 'VIDEO');

-- CreateEnum
CREATE TYPE "TestStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ABANDONED', 'TIMED_OUT');

-- DropForeignKey
ALTER TABLE "GrammarExercise" DROP CONSTRAINT "GrammarExercise_grammarTopicId_fkey";

-- DropForeignKey
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_levelId_fkey";

-- DropForeignKey
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_topicId_fkey";

-- DropForeignKey
ALTER TABLE "LessonExercise" DROP CONSTRAINT "LessonExercise_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "LessonGrammar" DROP CONSTRAINT "LessonGrammar_grammarTopicId_fkey";

-- DropForeignKey
ALTER TABLE "LessonGrammar" DROP CONSTRAINT "LessonGrammar_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "LessonVocabulary" DROP CONSTRAINT "LessonVocabulary_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "LessonVocabulary" DROP CONSTRAINT "LessonVocabulary_vocabularyId_fkey";

-- DropForeignKey
ALTER TABLE "UserGrammarExerciseAnswer" DROP CONSTRAINT "UserGrammarExerciseAnswer_grammarExerciseId_fkey";

-- DropForeignKey
ALTER TABLE "UserGrammarExerciseAnswer" DROP CONSTRAINT "UserGrammarExerciseAnswer_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserLessonExerciseAnswer" DROP CONSTRAINT "UserLessonExerciseAnswer_lessonExerciseId_fkey";

-- DropForeignKey
ALTER TABLE "UserLessonExerciseAnswer" DROP CONSTRAINT "UserLessonExerciseAnswer_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserLessonProgress" DROP CONSTRAINT "UserLessonProgress_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "UserLessonProgress" DROP CONSTRAINT "UserLessonProgress_userId_fkey";

-- DropIndex
DROP INDEX "Level_code_idx";

-- DropIndex
DROP INDEX "Level_code_key";

-- AlterTable
ALTER TABLE "Level" DROP COLUMN "code",
ADD COLUMN     "cefrLevel" TEXT NOT NULL,
ADD COLUMN     "ieltsMax" DOUBLE PRECISION,
ADD COLUMN     "ieltsMin" DOUBLE PRECISION,
ADD COLUMN     "toeicScoreMax" INTEGER,
ADD COLUMN     "toeicScoreMin" INTEGER;

-- DropTable
DROP TABLE "GrammarExercise";

-- DropTable
DROP TABLE "Lesson";

-- DropTable
DROP TABLE "LessonExercise";

-- DropTable
DROP TABLE "LessonGrammar";

-- DropTable
DROP TABLE "LessonVocabulary";

-- DropTable
DROP TABLE "UserGrammarExerciseAnswer";

-- DropTable
DROP TABLE "UserLessonExerciseAnswer";

-- DropTable
DROP TABLE "UserLessonProgress";

-- DropEnum
DROP TYPE "ObjectiveType";

-- CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL,
    "type" "ExerciseType" NOT NULL,
    "category" "ExerciseCategory" NOT NULL,
    "question" TEXT NOT NULL,
    "explanation" TEXT,
    "transcript" TEXT,
    "content" TEXT,
    "mediaUrl" TEXT,
    "mediaType" "MediaType",
    "score" INTEGER NOT NULL DEFAULT 10,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "metadata" JSONB,
    "order" INTEGER NOT NULL DEFAULT 0,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "levelId" TEXT NOT NULL,
    "grammarTopicId" TEXT,
    "topicId" TEXT,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseOption" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "exerciseId" TEXT NOT NULL,

    CONSTRAINT "ExerciseOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserExerciseAnswer" (
    "id" TEXT NOT NULL,
    "answer" JSONB NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "score" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,

    CONSTRAINT "UserExerciseAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exam" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "examType" "ExamType" NOT NULL,
    "duration" INTEGER NOT NULL,
    "totalQuestions" INTEGER NOT NULL,
    "maxScore" INTEGER NOT NULL,
    "scoreType" "ScoreType" NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "levelId" TEXT NOT NULL,

    CONSTRAINT "Exam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamSection" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sectionType" "SectionType" NOT NULL,
    "order" INTEGER NOT NULL,
    "duration" INTEGER,
    "totalQuestions" INTEGER NOT NULL,
    "maxScore" INTEGER NOT NULL,
    "examId" TEXT NOT NULL,

    CONSTRAINT "ExamSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamQuestion" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "examSectionId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,

    CONSTRAINT "ExamQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserExam" (
    "id" TEXT NOT NULL,
    "status" "TestStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "totalScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maxScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "estimatedScore" INTEGER,
    "estimatedBand" DOUBLE PRECISION,
    "levelAssessment" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "examId" TEXT NOT NULL,

    CONSTRAINT "UserExam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserExamAnswer" (
    "id" TEXT NOT NULL,
    "answer" JSONB NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "score" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userExamId" TEXT NOT NULL,
    "examQuestionId" TEXT NOT NULL,

    CONSTRAINT "UserExamAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Exercise_levelId_idx" ON "Exercise"("levelId");

-- CreateIndex
CREATE INDEX "Exercise_grammarTopicId_idx" ON "Exercise"("grammarTopicId");

-- CreateIndex
CREATE INDEX "Exercise_topicId_idx" ON "Exercise"("topicId");

-- CreateIndex
CREATE INDEX "Exercise_category_idx" ON "Exercise"("category");

-- CreateIndex
CREATE INDEX "Exercise_type_idx" ON "Exercise"("type");

-- CreateIndex
CREATE INDEX "ExerciseOption_exerciseId_idx" ON "ExerciseOption"("exerciseId");

-- CreateIndex
CREATE INDEX "UserExerciseAnswer_userId_idx" ON "UserExerciseAnswer"("userId");

-- CreateIndex
CREATE INDEX "UserExerciseAnswer_exerciseId_idx" ON "UserExerciseAnswer"("exerciseId");

-- CreateIndex
CREATE INDEX "UserExerciseAnswer_isCorrect_idx" ON "UserExerciseAnswer"("isCorrect");

-- CreateIndex
CREATE INDEX "Exam_levelId_idx" ON "Exam"("levelId");

-- CreateIndex
CREATE INDEX "Exam_examType_idx" ON "Exam"("examType");

-- CreateIndex
CREATE INDEX "Exam_status_idx" ON "Exam"("status");

-- CreateIndex
CREATE INDEX "ExamSection_examId_idx" ON "ExamSection"("examId");

-- CreateIndex
CREATE UNIQUE INDEX "ExamSection_examId_order_key" ON "ExamSection"("examId", "order");

-- CreateIndex
CREATE INDEX "ExamQuestion_examSectionId_idx" ON "ExamQuestion"("examSectionId");

-- CreateIndex
CREATE INDEX "ExamQuestion_exerciseId_idx" ON "ExamQuestion"("exerciseId");

-- CreateIndex
CREATE UNIQUE INDEX "ExamQuestion_examSectionId_order_key" ON "ExamQuestion"("examSectionId", "order");

-- CreateIndex
CREATE INDEX "UserExam_userId_idx" ON "UserExam"("userId");

-- CreateIndex
CREATE INDEX "UserExam_examId_idx" ON "UserExam"("examId");

-- CreateIndex
CREATE INDEX "UserExam_status_idx" ON "UserExam"("status");

-- CreateIndex
CREATE INDEX "UserExamAnswer_userExamId_idx" ON "UserExamAnswer"("userExamId");

-- CreateIndex
CREATE INDEX "UserExamAnswer_examQuestionId_idx" ON "UserExamAnswer"("examQuestionId");

-- CreateIndex
CREATE UNIQUE INDEX "Level_cefrLevel_key" ON "Level"("cefrLevel");

-- CreateIndex
CREATE INDEX "Level_cefrLevel_idx" ON "Level"("cefrLevel");

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_grammarTopicId_fkey" FOREIGN KEY ("grammarTopicId") REFERENCES "GrammarTopic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseOption" ADD CONSTRAINT "ExerciseOption_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserExerciseAnswer" ADD CONSTRAINT "UserExerciseAnswer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserExerciseAnswer" ADD CONSTRAINT "UserExerciseAnswer_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamSection" ADD CONSTRAINT "ExamSection_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamQuestion" ADD CONSTRAINT "ExamQuestion_examSectionId_fkey" FOREIGN KEY ("examSectionId") REFERENCES "ExamSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamQuestion" ADD CONSTRAINT "ExamQuestion_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserExam" ADD CONSTRAINT "UserExam_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserExam" ADD CONSTRAINT "UserExam_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserExamAnswer" ADD CONSTRAINT "UserExamAnswer_userExamId_fkey" FOREIGN KEY ("userExamId") REFERENCES "UserExam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserExamAnswer" ADD CONSTRAINT "UserExamAnswer_examQuestionId_fkey" FOREIGN KEY ("examQuestionId") REFERENCES "ExamQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
