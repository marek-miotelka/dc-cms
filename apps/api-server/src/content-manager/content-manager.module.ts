import { Module } from '@nestjs/common';
import { ArticlesModule } from '@api-server/content-manager/articles/articles.module';
import { CollectionsModule } from '@api-server/content-manager/collections/collections.module';

@Module({
  imports: [ArticlesModule, CollectionsModule],
  exports: [ArticlesModule, CollectionsModule],
})
export class ContentManagerModule {}
