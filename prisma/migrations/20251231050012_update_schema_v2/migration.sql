/*
  Warnings:

  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('BEGINNER', 'ELEMENTARY', 'INTERMEDIATE', 'UPPER_INTERMEDIATE', 'ADVANCED', 'PROFICIENT');

-- CreateEnum
CREATE TYPE "ProgressStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'REVIEWED');

-- CreateEnum
CREATE TYPE "ExerciseType" AS ENUM ('MULTIPLE_CHOICE', 'FILL_BLANK', 'MATCHING', 'TRUE_FALSE', 'LISTENING', 'SPEAKING', 'WRITING', 'ORDERING');

-- CreateEnum
CREATE TYPE "ObjectiveType" AS ENUM ('LEARN_VOCABULARY', 'LEARN_GRAMMAR', 'PRACTICE_READING', 'PRACTICE_LISTENING', 'PRACTICE_SPEAKING', 'PRACTICE_WRITING', 'IMPROVE_PRONUNCIATION');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "dailyGoal" INTEGER DEFAULT 20,
ADD COLUMN     "levelId" TEXT,
ADD COLUMN     "streak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "targetLevel" TEXT,
DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE "Level" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Level_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrammarCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "imageUrl" TEXT,
    "description" TEXT,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GrammarCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrammarTopic" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT,
    "description" TEXT,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL,
    "difficulty" "Difficulty" NOT NULL DEFAULT 'BEGINNER',
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "levelId" TEXT NOT NULL,
    "grammarCategoryId" TEXT NOT NULL,

    CONSTRAINT "GrammarTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrammarExercise" (
    "id" TEXT NOT NULL,
    "type" "ExerciseType" NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "options" JSONB,
    "explanation" TEXT,
    "order" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "status" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "grammarTopicId" TEXT NOT NULL,

    CONSTRAINT "GrammarExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserGrammarProgress" (
    "id" TEXT NOT NULL,
    "status" "ProgressStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "startAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "lastAccessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalTimeSpent" INTEGER NOT NULL DEFAULT 0,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "grammarTopicId" TEXT NOT NULL,

    CONSTRAINT "UserGrammarProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserGrammarExerciseAnswer" (
    "id" TEXT NOT NULL,
    "answer" JSONB NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "score" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "grammarExerciseId" TEXT NOT NULL,

    CONSTRAINT "UserGrammarExerciseAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lesson" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "slug" TEXT NOT NULL,
    "difficulty" "Difficulty" NOT NULL DEFAULT 'BEGINNER',
    "content" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL,
    "objectives" "ObjectiveType"[],
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "levelId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonVocabulary" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "isKey" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lessonId" TEXT NOT NULL,
    "vocabularyId" TEXT NOT NULL,

    CONSTRAINT "LessonVocabulary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonGrammar" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "isMain" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lessonId" TEXT NOT NULL,
    "grammarTopicId" TEXT NOT NULL,

    CONSTRAINT "LessonGrammar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonExercise" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "ExerciseType" NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "options" JSONB,
    "explanation" TEXT,
    "order" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "isKey" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lessonId" TEXT NOT NULL,

    CONSTRAINT "LessonExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLessonProgress" (
    "id" TEXT NOT NULL,
    "status" "ProgressStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "startAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "lastAccessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalTimeSpent" INTEGER NOT NULL DEFAULT 0,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,

    CONSTRAINT "UserLessonProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLessonExerciseAnswer" (
    "id" TEXT NOT NULL,
    "answer" JSONB NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "score" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonExerciseId" TEXT NOT NULL,

    CONSTRAINT "UserLessonExerciseAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Level_code_key" ON "Level"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Level_order_key" ON "Level"("order");

-- CreateIndex
CREATE INDEX "Level_code_idx" ON "Level"("code");

-- CreateIndex
CREATE INDEX "Level_status_idx" ON "Level"("status");

-- CreateIndex
CREATE UNIQUE INDEX "GrammarCategory_name_key" ON "GrammarCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "GrammarCategory_slug_key" ON "GrammarCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "GrammarTopic_slug_key" ON "GrammarTopic"("slug");

-- CreateIndex
CREATE INDEX "GrammarTopic_grammarCategoryId_idx" ON "GrammarTopic"("grammarCategoryId");

-- CreateIndex
CREATE INDEX "GrammarTopic_levelId_idx" ON "GrammarTopic"("levelId");

-- CreateIndex
CREATE INDEX "GrammarTopic_status_idx" ON "GrammarTopic"("status");

-- CreateIndex
CREATE INDEX "GrammarTopic_difficulty_idx" ON "GrammarTopic"("difficulty");

-- CreateIndex
CREATE INDEX "GrammarExercise_grammarTopicId_idx" ON "GrammarExercise"("grammarTopicId");

-- CreateIndex
CREATE INDEX "GrammarExercise_type_idx" ON "GrammarExercise"("type");

-- CreateIndex
CREATE INDEX "UserGrammarProgress_userId_idx" ON "UserGrammarProgress"("userId");

-- CreateIndex
CREATE INDEX "UserGrammarProgress_grammarTopicId_idx" ON "UserGrammarProgress"("grammarTopicId");

-- CreateIndex
CREATE INDEX "UserGrammarProgress_status_idx" ON "UserGrammarProgress"("status");

-- CreateIndex
CREATE UNIQUE INDEX "UserGrammarProgress_userId_grammarTopicId_key" ON "UserGrammarProgress"("userId", "grammarTopicId");

-- CreateIndex
CREATE INDEX "UserGrammarExerciseAnswer_userId_idx" ON "UserGrammarExerciseAnswer"("userId");

-- CreateIndex
CREATE INDEX "UserGrammarExerciseAnswer_grammarExerciseId_idx" ON "UserGrammarExerciseAnswer"("grammarExerciseId");

-- CreateIndex
CREATE INDEX "UserGrammarExerciseAnswer_isCorrect_idx" ON "UserGrammarExerciseAnswer"("isCorrect");

-- CreateIndex
CREATE UNIQUE INDEX "Lesson_slug_key" ON "Lesson"("slug");

-- CreateIndex
CREATE INDEX "Lesson_levelId_idx" ON "Lesson"("levelId");

-- CreateIndex
CREATE INDEX "Lesson_topicId_idx" ON "Lesson"("topicId");

-- CreateIndex
CREATE INDEX "Lesson_slug_idx" ON "Lesson"("slug");

-- CreateIndex
CREATE INDEX "Lesson_status_idx" ON "Lesson"("status");

-- CreateIndex
CREATE INDEX "Lesson_isDeleted_idx" ON "Lesson"("isDeleted");

-- CreateIndex
CREATE INDEX "LessonVocabulary_lessonId_idx" ON "LessonVocabulary"("lessonId");

-- CreateIndex
CREATE INDEX "LessonVocabulary_vocabularyId_idx" ON "LessonVocabulary"("vocabularyId");

-- CreateIndex
CREATE UNIQUE INDEX "LessonVocabulary_lessonId_vocabularyId_key" ON "LessonVocabulary"("lessonId", "vocabularyId");

-- CreateIndex
CREATE INDEX "LessonGrammar_lessonId_idx" ON "LessonGrammar"("lessonId");

-- CreateIndex
CREATE INDEX "LessonGrammar_grammarTopicId_idx" ON "LessonGrammar"("grammarTopicId");

-- CreateIndex
CREATE UNIQUE INDEX "LessonGrammar_lessonId_grammarTopicId_key" ON "LessonGrammar"("lessonId", "grammarTopicId");

-- CreateIndex
CREATE INDEX "LessonExercise_lessonId_idx" ON "LessonExercise"("lessonId");

-- CreateIndex
CREATE INDEX "LessonExercise_type_idx" ON "LessonExercise"("type");

-- CreateIndex
CREATE INDEX "UserLessonProgress_userId_idx" ON "UserLessonProgress"("userId");

-- CreateIndex
CREATE INDEX "UserLessonProgress_lessonId_idx" ON "UserLessonProgress"("lessonId");

-- CreateIndex
CREATE INDEX "UserLessonProgress_status_idx" ON "UserLessonProgress"("status");

-- CreateIndex
CREATE UNIQUE INDEX "UserLessonProgress_userId_lessonId_key" ON "UserLessonProgress"("userId", "lessonId");

-- CreateIndex
CREATE INDEX "UserLessonExerciseAnswer_userId_idx" ON "UserLessonExerciseAnswer"("userId");

-- CreateIndex
CREATE INDEX "UserLessonExerciseAnswer_lessonExerciseId_idx" ON "UserLessonExerciseAnswer"("lessonExerciseId");

-- CreateIndex
CREATE INDEX "UserLessonExerciseAnswer_isCorrect_idx" ON "UserLessonExerciseAnswer"("isCorrect");

-- CreateIndex
CREATE INDEX "User_levelId_idx" ON "User"("levelId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrammarTopic" ADD CONSTRAINT "GrammarTopic_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrammarTopic" ADD CONSTRAINT "GrammarTopic_grammarCategoryId_fkey" FOREIGN KEY ("grammarCategoryId") REFERENCES "GrammarCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrammarExercise" ADD CONSTRAINT "GrammarExercise_grammarTopicId_fkey" FOREIGN KEY ("grammarTopicId") REFERENCES "GrammarTopic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGrammarProgress" ADD CONSTRAINT "UserGrammarProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGrammarProgress" ADD CONSTRAINT "UserGrammarProgress_grammarTopicId_fkey" FOREIGN KEY ("grammarTopicId") REFERENCES "GrammarTopic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGrammarExerciseAnswer" ADD CONSTRAINT "UserGrammarExerciseAnswer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGrammarExerciseAnswer" ADD CONSTRAINT "UserGrammarExerciseAnswer_grammarExerciseId_fkey" FOREIGN KEY ("grammarExerciseId") REFERENCES "GrammarExercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonVocabulary" ADD CONSTRAINT "LessonVocabulary_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonVocabulary" ADD CONSTRAINT "LessonVocabulary_vocabularyId_fkey" FOREIGN KEY ("vocabularyId") REFERENCES "Vocabulary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonGrammar" ADD CONSTRAINT "LessonGrammar_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonGrammar" ADD CONSTRAINT "LessonGrammar_grammarTopicId_fkey" FOREIGN KEY ("grammarTopicId") REFERENCES "GrammarTopic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonExercise" ADD CONSTRAINT "LessonExercise_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLessonProgress" ADD CONSTRAINT "UserLessonProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLessonProgress" ADD CONSTRAINT "UserLessonProgress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLessonExerciseAnswer" ADD CONSTRAINT "UserLessonExerciseAnswer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLessonExerciseAnswer" ADD CONSTRAINT "UserLessonExerciseAnswer_lessonExerciseId_fkey" FOREIGN KEY ("lessonExerciseId") REFERENCES "LessonExercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
