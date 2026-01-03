/*
  Warnings:

  - A unique constraint covering the columns `[order]` on the table `GrammarExercise` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[order]` on the table `GrammarTopic` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[order]` on the table `Lesson` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[order]` on the table `LessonExercise` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[order]` on the table `LessonGrammar` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[order]` on the table `LessonVocabulary` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "GrammarExercise_order_key" ON "GrammarExercise"("order");

-- CreateIndex
CREATE UNIQUE INDEX "GrammarTopic_order_key" ON "GrammarTopic"("order");

-- CreateIndex
CREATE UNIQUE INDEX "Lesson_order_key" ON "Lesson"("order");

-- CreateIndex
CREATE UNIQUE INDEX "LessonExercise_order_key" ON "LessonExercise"("order");

-- CreateIndex
CREATE UNIQUE INDEX "LessonGrammar_order_key" ON "LessonGrammar"("order");

-- CreateIndex
CREATE UNIQUE INDEX "LessonVocabulary_order_key" ON "LessonVocabulary"("order");
