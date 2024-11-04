import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { CollectionFields } from './models/Collection.model';
import { CollectionModelService } from './services/base/collection-model.service';
import { CollectionValidationService } from './services/validation/collection-validation.service';
import { CollectionQueryService } from './services/query/collection-query.service';
import { TransactionService } from './services/transaction/transaction.service';
import { CollectionNotFoundException } from './exceptions/collection.exceptions';
import { PaginationOptions } from './services/query/types/pagination-options.type';
import { FilterOptions } from './services/query/types/filter-options.type';
import { SortOptions } from './services/query/types/sort-options.type';
import { QueryResult } from './services/query/types/query-result.type';

@Injectable()
export class CollectionsService {
  private readonly modelService: CollectionModelService;
  private readonly validationService: CollectionValidationService;
  private readonly queryService: CollectionQueryService;
  private readonly transactionService: TransactionService;

  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {
    this.modelService = new CollectionModelService(knex);
    this.validationService = new CollectionValidationService(this.modelService);
    this.queryService = new CollectionQueryService(knex);
    this.transactionService = new TransactionService(knex);
  }

  async findAll(): Promise<CollectionFields[]> {
    return this.modelService.findAll();
  }

  async findBySlug(slug: string): Promise<CollectionFields | null> {
    return this.modelService.findBySlug(slug);
  }

  async findByDocumentId(documentId: string): Promise<CollectionFields | null> {
    return this.modelService.findByDocumentId(documentId);
  }

  async create(data: Partial<CollectionFields>): Promise<CollectionFields> {
    await this.validationService.validateNewCollection(data);

    const collection = await this.modelService.create(data);
    await this.modelService.createCollectionTable(collection);

    return collection;
  }

  async update(
    id: number,
    data: Partial<CollectionFields>,
  ): Promise<CollectionFields> {
    const existing = await this.validationService.validateUpdateCollection(
      id,
      data,
    );

    if (data.fields) {
      await this.modelService.updateCollectionTable(
        { ...existing, ...data },
        existing.fields,
      );
    }

    const updated = await this.modelService.update(id, data);
    if (!updated) {
      throw new CollectionNotFoundException(id.toString());
    }

    return updated;
  }

  async delete(id: number): Promise<void> {
    const collection = await this.modelService.findById(id);
    if (!collection) {
      throw new CollectionNotFoundException(id.toString());
    }

    await this.modelService.dropCollectionTable(collection.slug);
    await this.modelService.delete(id);
  }

  // Dynamic Collection Methods with Query Building

  async getCollectionData<T = any>(
    collection: CollectionFields,
    options: {
      pagination?: PaginationOptions;
      filter?: FilterOptions;
      sort?: SortOptions;
      includeRelations?: boolean;
    } = {},
  ): Promise<QueryResult<T>> {
    return this.queryService.executeQuery<T>(collection, options);
  }

  async getCollectionRecord<T = any>(
    collection: CollectionFields,
    documentId: string,
    includeRelations: boolean = false,
  ): Promise<T> {
    const result = await this.queryService.executeQuery<T>(collection, {
      filter: { documentId: { eq: documentId } },
      includeRelations,
    });

    if (!result.data[0]) {
      throw new CollectionNotFoundException(documentId);
    }

    return result.data[0];
  }

  // Record operations using TransactionService

  async createCollectionRecord<T = any>(
    collection: CollectionFields,
    data: any,
    relations?: Record<string, string[]>,
  ): Promise<T> {
    return this.transactionService.createRecord(collection, data, relations);
  }

  async updateCollectionRecord<T = any>(
    collection: CollectionFields,
    documentId: string,
    data: any,
    relations?: Record<string, string[]>,
  ): Promise<T> {
    return this.transactionService.updateRecord(
      collection,
      documentId,
      data,
      relations,
    );
  }

  async deleteCollectionRecord(
    collection: CollectionFields,
    documentId: string,
  ): Promise<void> {
    return this.transactionService.deleteRecord(collection, documentId);
  }
}
