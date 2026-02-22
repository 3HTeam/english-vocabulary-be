import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./modules/auth/auth.module";
import { BannerModule } from "./modules/banner/banner.module";
import { GrammarCategoryModule } from "./modules/grammar-category/grammar-category.module";
import { ExerciseModule } from "./modules/exercise/exercise.module";
import { ExamModule } from "./modules/exam/exam.module";
import { GrammarTopicModule } from "./modules/grammar-topic/grammar-topic.module";
import { LevelModule } from "./modules/level/level.module";
import { ModuleModule } from "./modules/module/module.module";
import { OnboardingModule } from "./modules/onboarding/onboarding.module";
import { PopupModule } from "./modules/popup/popup.module";
import { TopicModule } from "./modules/topic/topic.module";
import { PrismaModule } from "./prisma/prisma.module";
import { UploadModule } from "./modules/upload/upload.module";
import { VocabularyModule } from "./modules/vocabulary/vocabulary.module";
import databaseConfig from "./config/database.config";
import appConfig from "./config/app.config";
import swaggerConfig from "./config/swagger-env.config";
import { UserModule } from "./modules/user/user.module";
import { SettingModule } from "./modules/setting/setting.module";
import { DeviceModule } from "./modules/device/device.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, appConfig, swaggerConfig],
      envFilePath: [".env.local", ".env"],
    }),
    PrismaModule,
    AuthModule,
    BannerModule,
    GrammarCategoryModule,
    ExerciseModule,
    ExamModule,
    GrammarTopicModule,
    LevelModule,
    ModuleModule,
    OnboardingModule,
    PopupModule,
    TopicModule,
    UploadModule,
    VocabularyModule,
    UserModule,
    SettingModule,
    DeviceModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
