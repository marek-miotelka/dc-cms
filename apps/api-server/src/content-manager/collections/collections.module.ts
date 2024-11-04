import { Module } from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { CollectionsController } from './collections.controller';
import { DynamicCollectionsController } from './dynamic-collections.controller';
import { DatabaseModule } from '@api-server/database/database.module';
import { CollectionRelationsService } from './services/relations.service';
import { CollectionRecordsService } from './services/records.service';
import { CollectionHierarchyService } from './services/hierarchy.service';

@Module({
  imports: [DatabaseModule],
  controllers: [CollectionsController, DynamicCollectionsController],
  providers: [
    CollectionsService,
    CollectionRelationsService,
    CollectionRecordsService,
    CollectionHierarchyService,
  ],
  exports: [
    CollectionsService,
    CollectionRelationsService,
    CollectionRecordsService,
    CollectionHierarchyService,
  ],
})
export class CollectionsModule {}
