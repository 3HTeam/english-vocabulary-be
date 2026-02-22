import { Module } from "@nestjs/common";
import { ExerciseAdminController } from "./controllers/admin/exercise-admin.controller";
import { ExerciseAdminService } from "./services/admin/exercise-admin.service";

@Module({
  controllers: [ExerciseAdminController],
  providers: [ExerciseAdminService],
  exports: [ExerciseAdminService],
})
export class ExerciseModule {}
