import { Module } from '@nestjs/common';
import { ArticlesModule } from '@api-server/content-manager/articles/articles.module';

@Module({
  imports: [ArticlesModule],
  exports: [ArticlesModule],
})
export class ContentManagerModule {}
