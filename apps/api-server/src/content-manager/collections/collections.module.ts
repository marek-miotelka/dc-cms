import { Module } from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { CollectionsController } from './collections.controller';
import { DynamicCollectionsController } from './dynamic-collections.controller';
import { DatabaseModule } from '@api-server/database/database.module';
import { CollectionRelationsService } from './services/relations.service';
import { CollectionRecordsService } from './services/records.service';
import { CollectionHierarchyService } from './services/hierarchy.service';
import { CollectionModelService } from './services/base/collection-model.service';
import { CollectionValidationService } from './services/validation/collection-validation.service';
import { CollectionQueryService } from './services/query/collection-query.service';
import { TransactionService } from './services/transaction/transaction.service';

@Module({
  imports: [DatabaseModule],
  controllers: [CollectionsController, DynamicCollectionsController],
  providers: [
    CollectionsService,
    CollectionModelService,
    CollectionValidationService,
    CollectionQueryService,
    CollectionRelationsService,
    CollectionRecordsService,
    CollectionHierarchyService,
    TransactionService,
  ],
  exports: [
    CollectionsService,
    CollectionModelService,
    CollectionValidationService,
    CollectionQueryService,
    CollectionRelationsService,
    CollectionRecordsService,
    CollectionHierarchyService,
    TransactionService,
  ],
})
export class CollectionsModule {}
