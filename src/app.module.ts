import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { GrammarCategoryModule } from './modules/grammar-category/grammar-category.module';
import { GrammarExerciseModule } from './modules/grammar-exercise/grammar-exercise.module';
import { GrammarTopicModule } from './modules/grammar-topic/grammar-topic.module';
import { LessonModule } from './modules/lesson/lesson.module';
import { LessonExerciseModule } from './modules/lesson-exercise/lesson-exercise.module';
import { LessonGrammarModule } from './modules/lesson-grammar/lesson-grammar.module';
import { LessonVocabularyModule } from './modules/lesson-vocabulary/lesson-vocabulary.module';
import { LevelModule } from './modules/level/level.module';
import { TopicModule } from './modules/topic/topic.module';
import { PrismaModule } from './prisma/prisma.module';
import { UploadModule } from './modules/upload/upload.module';
import { VocabularyModule } from './modules/vocabulary/vocabulary.module';
import databaseConfig from './config/database.config';
import appConfig from './config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, appConfig],
      envFilePath: ['.env.local', '.env'],
    }),
    PrismaModule,
    AuthModule,
    GrammarCategoryModule,
    GrammarExerciseModule,
    GrammarTopicModule,
    LessonModule,
    LessonExerciseModule,
    LessonGrammarModule,
    LessonVocabularyModule,
    LevelModule,
    TopicModule,
    UploadModule,
    VocabularyModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
