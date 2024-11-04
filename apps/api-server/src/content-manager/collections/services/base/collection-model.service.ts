import { Inject, Injectable } from '@nestjs/common';
import { BaseModel } from '@api-server/database/base.model';
import { Knex } from 'knex';
import {
  CollectionFields,
  CollectionModel,
} from '@api-server/content-manager/collections/models/Collection.model';

@Injectable()
export class CollectionModelService {
  private model: CollectionModel;

  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {
    this.model = new CollectionModel({
      tableName: 'collections',
      knex,
    });
  }

  getModel(): BaseModel<CollectionFields> {
    return this.model;
  }

  async findAll(): Promise<CollectionFields[]> {
    return this.model.findAll();
  }

  async findById(id: number): Promise<CollectionFields | null> {
    return this.model.findById(id);
  }

  async findByDocumentId(documentId: string): Promise<CollectionFields | null> {
    return this.model.findByDocumentId(documentId);
  }

  async findBySlug(slug: string): Promise<CollectionFields | null> {
    return this.model.findBySlug(slug);
  }

  async create(data: Partial<CollectionFields>): Promise<CollectionFields> {
    return this.model.create(data);
  }

  async update(
    id: number,
    data: Partial<CollectionFields>,
  ): Promise<CollectionFields | null> {
    return this.model.update(id, data);
  }

  async delete(id: number): Promise<boolean> {
    return this.model.delete(id);
  }

  async createCollectionTable(collection: CollectionFields): Promise<void> {
    return this.model.createCollectionTable(collection);
  }

  async dropCollectionTable(slug: string): Promise<void> {
    return this.model.dropCollectionTable(slug);
  }

  async updateCollectionTable(
    collection: CollectionFields,
    oldFields: CollectionFields['fields'],
  ): Promise<void> {
    return this.model.updateCollectionTable(collection, oldFields);
  }
}
