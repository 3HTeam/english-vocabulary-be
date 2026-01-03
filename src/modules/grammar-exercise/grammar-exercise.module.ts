import { Module } from '@nestjs/common';
import { GrammarExerciseAdminController } from './controllers/admin/grammar-exercise-admin.controller';
import { GrammarExerciseAdminService } from './services/admin/grammar-exercise-admin.service';

@Module({
  controllers: [GrammarExerciseAdminController],
  providers: [GrammarExerciseAdminService],
  exports: [GrammarExerciseAdminService],
})
export class GrammarExerciseModule {}
