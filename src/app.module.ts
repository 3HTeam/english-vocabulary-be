import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { TopicModule } from './modules/topic/topic.module';
import { PrismaModule } from './prisma/prisma.module';
import { UploadModule } from './modules/upload/upload.module';
import { VocabularyModule } from './modules/vocabulary/vocabulary.module';
import databaseConfig from './config/database.config';
import supabaseConfig from './config/supabase.config';
import appConfig from './config/app.config';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, supabaseConfig, appConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // Core modules
    PrismaModule,

    // Feature modules
    AuthModule,
    TopicModule,
    UploadModule,
    VocabularyModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
