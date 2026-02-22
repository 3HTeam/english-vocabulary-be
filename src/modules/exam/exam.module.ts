import { Module } from "@nestjs/common";
import { ExamAdminController } from "./controllers/admin/exam-admin.controller";
import { ExamAdminService } from "./services/admin/exam-admin.service";

@Module({
  controllers: [ExamAdminController],
  providers: [ExamAdminService],
  exports: [ExamAdminService],
})
export class ExamModule {}
