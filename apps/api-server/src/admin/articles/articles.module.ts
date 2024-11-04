import { Module } from '@nestjs/common';
import { AdminArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';
import { DatabaseModule } from '@api-server/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ArticlesController],
  providers: [AdminArticlesService],
  exports: [AdminArticlesService],
})
export class AdminArticlesModule {}
