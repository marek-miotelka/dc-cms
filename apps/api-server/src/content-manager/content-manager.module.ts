import { Module } from '@nestjs/common';
import { CollectionsModule } from '@api-server/content-manager/collections/collections.module';

@Module({
  imports: [CollectionsModule],
  exports: [CollectionsModule],
})
export class ContentManagerModule {}
