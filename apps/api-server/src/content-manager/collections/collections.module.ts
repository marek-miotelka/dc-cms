import { Module } from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { CollectionsController } from './collections.controller';
import { DatabaseModule } from '@api-server/database/database.module';
import { DynamicCollectionsController } from './dynamic-collections.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [CollectionsController, DynamicCollectionsController],
  providers: [CollectionsService],
  exports: [CollectionsService],
})
export class CollectionsModule {}
