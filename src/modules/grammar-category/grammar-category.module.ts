import { Module } from '@nestjs/common';
import { GrammarCategoryAdminController } from './controllers/admin/grammar-category-admin.controller';
import { GrammarCategoryAdminService } from './services/admin/grammar-category-admin.service';

@Module({
  controllers: [GrammarCategoryAdminController],
  providers: [GrammarCategoryAdminService],
  exports: [GrammarCategoryAdminService],
})
export class GrammarCategoryModule {}
